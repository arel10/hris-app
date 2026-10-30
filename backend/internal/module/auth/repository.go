package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/peoplecore/hris/internal/platform/apperrors"
)

// Repository defines the data access methods for the auth module.
type Repository interface {
	FindUserByEmail(ctx context.Context, email string) (*User, error)
	FindUserByID(ctx context.Context, id string) (*User, error)
	GetUserRolesAndPermissions(ctx context.Context, userID string) ([]Role, error)
	UpdateLastLogin(ctx context.Context, userID string) error
	UpdatePassword(ctx context.Context, userID string, hash string) error

	CreateRefreshToken(ctx context.Context, token RefreshToken) error
	FindRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, tokenHash string) error
	RevokeAllUserTokens(ctx context.Context, userID string) error
	CleanExpiredTokens(ctx context.Context) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new auth Repository backed by the given *sql.DB.
func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

// FindUserByEmail retrieves a user by their email address.
func (r *repository) FindUserByEmail(ctx context.Context, email string) (*User, error) {
	const query = `
		SELECT id, email, password_hash, is_active, last_login_at, created_at, updated_at
		FROM users
		WHERE email = $1
		LIMIT 1`

	user := &User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.IsActive,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("FindUserByEmail: %w", err)
	}

	return user, nil
}

// FindUserByID retrieves a user by their ID.
func (r *repository) FindUserByID(ctx context.Context, id string) (*User, error) {
	const query = `
		SELECT id, email, password_hash, is_active, last_login_at, created_at, updated_at
		FROM users
		WHERE id = $1
		LIMIT 1`

	user := &User{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.IsActive,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("FindUserByID: %w", err)
	}

	return user, nil
}

// GetUserRolesAndPermissions loads all roles and their permissions for a user.
func (r *repository) GetUserRolesAndPermissions(ctx context.Context, userID string) ([]Role, error) {
	const query = `
		SELECT DISTINCT
			r.id        AS role_id,
			r.name      AS role_name,
			r.description,
			p.id        AS perm_id,
			p.name      AS perm_name,
			p.module,
			p.action
		FROM user_roles ur
		JOIN roles r ON r.id = ur.role_id
		LEFT JOIN role_permissions rp ON rp.role_id = r.id
		LEFT JOIN permissions p ON p.id = rp.permission_id
		WHERE ur.user_id = $1
		ORDER BY r.name, p.name`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("GetUserRolesAndPermissions: %w", err)
	}
	defer rows.Close()

	// Build role map to avoid duplicates
	roleMap := make(map[string]*Role)
	var roleOrder []string

	for rows.Next() {
		var (
			roleID      string
			roleName    string
			roleDesc    sql.NullString
			permID      sql.NullString
			permName    sql.NullString
			permModule  sql.NullString
			permAction  sql.NullString
		)

		if err := rows.Scan(&roleID, &roleName, &roleDesc, &permID, &permName, &permModule, &permAction); err != nil {
			return nil, fmt.Errorf("GetUserRolesAndPermissions scan: %w", err)
		}

		if _, exists := roleMap[roleID]; !exists {
			roleMap[roleID] = &Role{
				ID:          roleID,
				Name:        roleName,
				Description: roleDesc.String,
			}
			roleOrder = append(roleOrder, roleID)
		}

		if permID.Valid {
			roleMap[roleID].Permissions = append(roleMap[roleID].Permissions, Permission{
				ID:     permID.String,
				Name:   permName.String,
				Module: permModule.String,
				Action: permAction.String,
			})
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("GetUserRolesAndPermissions rows: %w", err)
	}

	roles := make([]Role, 0, len(roleOrder))
	for _, id := range roleOrder {
		roles = append(roles, *roleMap[id])
	}

	return roles, nil
}

// UpdateLastLogin updates the last_login_at timestamp for a user.
func (r *repository) UpdateLastLogin(ctx context.Context, userID string) error {
	const query = `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("UpdateLastLogin: %w", err)
	}
	return nil
}

// UpdatePassword updates the password hash for a user.
func (r *repository) UpdatePassword(ctx context.Context, userID string, hash string) error {
	const query = `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, hash, userID)
	if err != nil {
		return fmt.Errorf("UpdatePassword: %w", err)
	}
	return nil
}

// CreateRefreshToken stores a new refresh token record.
func (r *repository) CreateRefreshToken(ctx context.Context, token RefreshToken) error {
	const query = `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)`

	_, err := r.db.ExecContext(ctx, query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.ExpiresAt,
		token.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("CreateRefreshToken: %w", err)
	}
	return nil
}

// FindRefreshToken retrieves a refresh token by its hash.
func (r *repository) FindRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, error) {
	const query = `
		SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
		FROM refresh_tokens
		WHERE token_hash = $1
		LIMIT 1`

	t := &RefreshToken{}
	err := r.db.QueryRowContext(ctx, query, tokenHash).Scan(
		&t.ID,
		&t.UserID,
		&t.TokenHash,
		&t.ExpiresAt,
		&t.RevokedAt,
		&t.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, apperrors.ErrNotFound
		}
		return nil, fmt.Errorf("FindRefreshToken: %w", err)
	}

	return t, nil
}

// RevokeRefreshToken marks a refresh token as revoked.
func (r *repository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	const query = `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`
	_, err := r.db.ExecContext(ctx, query, tokenHash)
	if err != nil {
		return fmt.Errorf("RevokeRefreshToken: %w", err)
	}
	return nil
}

// RevokeAllUserTokens revokes all refresh tokens for a user.
func (r *repository) RevokeAllUserTokens(ctx context.Context, userID string) error {
	const query = `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`
	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("RevokeAllUserTokens: %w", err)
	}
	return nil
}

// CleanExpiredTokens deletes expired and revoked refresh tokens from the database.
func (r *repository) CleanExpiredTokens(ctx context.Context) error {
	const query = `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL`
	_, err := r.db.ExecContext(ctx, query)
	if err != nil {
		return fmt.Errorf("CleanExpiredTokens: %w", err)
	}
	return nil
}

// ensure repository implements Repository at compile time.
var _ Repository = (*repository)(nil)

// ensure time package is used (for RefreshToken.CreatedAt)
var _ = time.Now

