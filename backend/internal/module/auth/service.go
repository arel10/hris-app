package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/peoplecore/hris/internal/config"
	"github.com/peoplecore/hris/internal/middleware"
	"github.com/peoplecore/hris/internal/platform/apperrors"
	"golang.org/x/crypto/bcrypt"
)

// Service defines the business logic methods for the auth module.
type Service interface {
	Login(ctx context.Context, req LoginRequest) (*LoginResponse, error)
	Logout(ctx context.Context, refreshTokenStr string) error
	RefreshToken(ctx context.Context, req RefreshRequest) (*LoginResponse, error)
	ChangePassword(ctx context.Context, userID string, req ChangePasswordRequest) error
	GetMe(ctx context.Context, userID string) (*MeResponse, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
}

// NewService creates a new auth Service.
func NewService(repo Repository, cfg *config.Config) Service {
	return &service{repo: repo, cfg: cfg}
}

// Login authenticates a user and returns access + refresh tokens.
func (s *service) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	user, err := s.repo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		// Return generic error to avoid user enumeration
		return nil, apperrors.New("INVALID_CREDENTIALS", "Invalid email or password", 401)
	}

	if !user.IsActive {
		return nil, apperrors.New("ACCOUNT_DISABLED", "Account is disabled", 403)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperrors.New("INVALID_CREDENTIALS", "Invalid email or password", 401)
	}

	roles, err := s.repo.GetUserRolesAndPermissions(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("login: load roles: %w", err)
	}
	user.Roles = roles

	accessToken, err := s.issueAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("login: issue access token: %w", err)
	}

	rawRefreshToken, err := s.issueRefreshToken(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("login: issue refresh token: %w", err)
	}

	// Update last login (best effort — don't fail login on error)
	_ = s.repo.UpdateLastLogin(ctx, user.ID)

	roleNames := extractRoleNames(roles)

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int(s.cfg.JWTAccessTTL.Seconds()),
		User: UserInfo{
			ID:    user.ID,
			Email: user.Email,
			Roles: roleNames,
		},
	}, nil
}

// Logout revokes the given refresh token.
func (s *service) Logout(ctx context.Context, refreshTokenStr string) error {
	tokenHash := hashToken(refreshTokenStr)

	token, err := s.repo.FindRefreshToken(ctx, tokenHash)
	if err != nil {
		return apperrors.ErrUnauthorized
	}

	if token.RevokedAt != nil {
		return apperrors.ErrUnauthorized
	}

	return s.repo.RevokeRefreshToken(ctx, tokenHash)
}

// RefreshToken validates a refresh token and issues a new token pair (rotation).
func (s *service) RefreshToken(ctx context.Context, req RefreshRequest) (*LoginResponse, error) {
	tokenHash := hashToken(req.RefreshToken)

	stored, err := s.repo.FindRefreshToken(ctx, tokenHash)
	if err != nil {
		return nil, apperrors.ErrUnauthorized
	}

	if stored.RevokedAt != nil {
		return nil, apperrors.New("TOKEN_REVOKED", "Refresh token has been revoked", 401)
	}

	if time.Now().After(stored.ExpiresAt) {
		return nil, apperrors.New("TOKEN_EXPIRED", "Refresh token has expired", 401)
	}

	// Revoke the old refresh token
	if err := s.repo.RevokeRefreshToken(ctx, tokenHash); err != nil {
		return nil, fmt.Errorf("refresh: revoke old token: %w", err)
	}

	user, err := s.repo.FindUserByID(ctx, stored.UserID)
	if err != nil {
		return nil, fmt.Errorf("refresh: load user: %w", err)
	}

	if !user.IsActive {
		return nil, apperrors.New("ACCOUNT_DISABLED", "Account is disabled", 403)
	}

	roles, err := s.repo.GetUserRolesAndPermissions(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("refresh: load roles: %w", err)
	}
	user.Roles = roles

	accessToken, err := s.issueAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("refresh: issue access token: %w", err)
	}

	rawRefreshToken, err := s.issueRefreshToken(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("refresh: issue refresh token: %w", err)
	}

	roleNames := extractRoleNames(roles)

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int(s.cfg.JWTAccessTTL.Seconds()),
		User: UserInfo{
			ID:    user.ID,
			Email: user.Email,
			Roles: roleNames,
		},
	}, nil
}

// ChangePassword verifies the old password and sets a new one, revoking all tokens.
func (s *service) ChangePassword(ctx context.Context, userID string, req ChangePasswordRequest) error {
	user, err := s.repo.FindUserByID(ctx, userID)
	if err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		return apperrors.New("INVALID_CREDENTIALS", "Current password is incorrect", 401)
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("change password: hash: %w", err)
	}

	if err := s.repo.UpdatePassword(ctx, userID, string(newHash)); err != nil {
		return fmt.Errorf("change password: update: %w", err)
	}

	// Revoke all existing refresh tokens
	_ = s.repo.RevokeAllUserTokens(ctx, userID)

	return nil
}

// GetMe returns the authenticated user's profile.
func (s *service) GetMe(ctx context.Context, userID string) (*MeResponse, error) {
	user, err := s.repo.FindUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	roles, err := s.repo.GetUserRolesAndPermissions(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get me: load roles: %w", err)
	}

	roleNames := make([]string, 0, len(roles))
	permSet := make(map[string]struct{})

	for _, role := range roles {
		roleNames = append(roleNames, role.Name)
		for _, perm := range role.Permissions {
			permSet[perm.Name] = struct{}{}
		}
	}

	permissions := make([]string, 0, len(permSet))
	for p := range permSet {
		permissions = append(permissions, p)
	}

	return &MeResponse{
		ID:          user.ID,
		Email:       user.Email,
		Roles:       roleNames,
		Permissions: permissions,
		IsActive:    user.IsActive,
	}, nil
}

// ─── helpers ────────────────────────────────────────────────────────────────

// issueAccessToken signs and returns a JWT access token for the given user.
func (s *service) issueAccessToken(user *User) (string, error) {
	permissions := collectPermissions(user.Roles)
	roleNames := extractRoleNames(user.Roles)

	claims := middleware.Claims{
		UserID:      user.ID,
		Email:       user.Email,
		Roles:       roleNames,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.cfg.JWTAccessTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    s.cfg.AppName,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTAccessSecret))
}

// issueRefreshToken generates a random refresh token, stores its hash, and returns the raw token.
func (s *service) issueRefreshToken(ctx context.Context, userID string) (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", fmt.Errorf("generate refresh token: %w", err)
	}

	rawHex := hex.EncodeToString(raw)
	tokenHash := hashToken(rawHex)

	rt := RefreshToken{
		ID:        uuid.New().String(),
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(s.cfg.JWTRefreshTTL),
		CreatedAt: time.Now(),
	}

	if err := s.repo.CreateRefreshToken(ctx, rt); err != nil {
		return "", fmt.Errorf("store refresh token: %w", err)
	}

	return rawHex, nil
}

// hashToken returns the SHA256 hex digest of tokenStr.
func hashToken(tokenStr string) string {
	sum := sha256.Sum256([]byte(tokenStr))
	return hex.EncodeToString(sum[:])
}

// extractRoleNames returns a slice of role names from a slice of Role.
func extractRoleNames(roles []Role) []string {
	names := make([]string, 0, len(roles))
	for _, r := range roles {
		names = append(names, r.Name)
	}
	return names
}

// collectPermissions returns a deduplicated slice of permission names from the given roles.
func collectPermissions(roles []Role) []string {
	seen := make(map[string]struct{})
	perms := make([]string, 0)

	for _, role := range roles {
		for _, perm := range role.Permissions {
			if _, exists := seen[perm.Name]; !exists {
				seen[perm.Name] = struct{}{}
				perms = append(perms, perm.Name)
			}
		}
	}

	return perms
}

// ensure service implements Service at compile time.
var _ Service = (*service)(nil)

