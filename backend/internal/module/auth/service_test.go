package auth_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/peoplecore/hris/internal/config"
	"github.com/peoplecore/hris/internal/middleware"
	"github.com/peoplecore/hris/internal/module/auth"
	"golang.org/x/crypto/bcrypt"
)

// mockRepository implements auth.Repository for testing
type mockRepository struct {
	users         map[string]*auth.User
	tokens        map[string]*auth.RefreshToken
	roles         map[string][]auth.Role
	findUserErr   error
	saveTokenErr  error
	updatePassErr error
}

func newMockRepository() *mockRepository {
	return &mockRepository{
		users:  make(map[string]*auth.User),
		tokens: make(map[string]*auth.RefreshToken),
		roles:  make(map[string][]auth.Role),
	}
}

func (m *mockRepository) FindUserByEmail(_ context.Context, email string) (*auth.User, error) {
	if m.findUserErr != nil {
		return nil, m.findUserErr
	}
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (m *mockRepository) FindUserByID(_ context.Context, id string) (*auth.User, error) {
	if u, ok := m.users[id]; ok {
		return u, nil
	}
	return nil, errors.New("user not found")
}

func (m *mockRepository) GetUserRolesAndPermissions(_ context.Context, userID string) ([]auth.Role, error) {
	return m.roles[userID], nil
}

func (m *mockRepository) UpdateLastLogin(_ context.Context, _ string) error {
	return nil
}

func (m *mockRepository) UpdatePassword(_ context.Context, userID string, hash string) error {
	if m.updatePassErr != nil {
		return m.updatePassErr
	}
	if u, ok := m.users[userID]; ok {
		u.PasswordHash = hash
		return nil
	}
	return errors.New("user not found")
}

func (m *mockRepository) CreateRefreshToken(_ context.Context, token auth.RefreshToken) error {
	if m.saveTokenErr != nil {
		return m.saveTokenErr
	}
	m.tokens[token.TokenHash] = &token
	return nil
}

func (m *mockRepository) FindRefreshToken(_ context.Context, tokenHash string) (*auth.RefreshToken, error) {
	if t, ok := m.tokens[tokenHash]; ok {
		return t, nil
	}
	return nil, errors.New("token not found")
}

func (m *mockRepository) RevokeRefreshToken(_ context.Context, tokenHash string) error {
	if t, ok := m.tokens[tokenHash]; ok {
		now := time.Now()
		t.RevokedAt = &now
		return nil
	}
	return errors.New("token not found")
}

func (m *mockRepository) RevokeAllUserTokens(_ context.Context, userID string) error {
	now := time.Now()
	for _, t := range m.tokens {
		if t.UserID == userID {
			t.RevokedAt = &now
		}
	}
	return nil
}

func (m *mockRepository) CleanExpiredTokens(_ context.Context) error {
	return nil
}

func testConfig() *config.Config {
	return &config.Config{
		JWTAccessSecret:  "test_access_secret_key_minimum_32_characters!",
		JWTRefreshSecret: "test_refresh_secret_key_minimum_32_characters!",
		JWTAccessTTL:     15 * time.Minute,
		JWTRefreshTTL:    168 * time.Hour,
	}
}

func TestAuthService_Login_Success(t *testing.T) {
	repo := newMockRepository()
	cfg := testConfig()
	svc := auth.NewService(repo, cfg)

	hash, _ := bcrypt.GenerateFromPassword([]byte("ValidPassword123"), bcrypt.DefaultCost)
	repo.users["user-1"] = &auth.User{
		ID:           "user-1",
		Email:        "user@peoplecore.local",
		PasswordHash: string(hash),
		IsActive:     true,
	}
	repo.roles["user-1"] = []auth.Role{
		{
			ID:   "role-1",
			Name: "employee",
			Permissions: []auth.Permission{
				{Name: "attendance.read", Module: "attendance", Action: "read"},
			},
		},
	}

	resp, err := svc.Login(context.Background(), auth.LoginRequest{
		Email:    "user@peoplecore.local",
		Password: "ValidPassword123",
	})

	if err != nil {
		t.Fatalf("expected login success, got error: %v", err)
	}

	if resp.AccessToken == "" {
		t.Error("expected access token, got empty")
	}
	if resp.RefreshToken == "" {
		t.Error("expected refresh token, got empty")
	}
	if resp.User.Email != "user@peoplecore.local" {
		t.Errorf("expected email user@peoplecore.local, got %s", resp.User.Email)
	}

	// Validate JWT claims
	token, err := jwt.ParseWithClaims(resp.AccessToken, &middleware.Claims{}, func(_ *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTAccessSecret), nil
	})
	if err != nil || !token.Valid {
		t.Fatalf("access token is invalid: %v", err)
	}

	claims, ok := token.Claims.(*middleware.Claims)
	if !ok {
		t.Fatal("could not parse claims as *middleware.Claims")
	}
	if claims.UserID != "user-1" {
		t.Errorf("expected user_id user-1, got %s", claims.UserID)
	}
	if len(claims.Permissions) != 1 || claims.Permissions[0] != "attendance.read" {
		t.Errorf("expected permissions ['attendance.read'], got %v", claims.Permissions)
	}
}

func TestAuthService_Login_InvalidPassword(t *testing.T) {
	repo := newMockRepository()
	cfg := testConfig()
	svc := auth.NewService(repo, cfg)

	hash, _ := bcrypt.GenerateFromPassword([]byte("CorrectPassword"), bcrypt.DefaultCost)
	repo.users["user-1"] = &auth.User{
		ID:           "user-1",
		Email:        "user@peoplecore.local",
		PasswordHash: string(hash),
		IsActive:     true,
	}

	_, err := svc.Login(context.Background(), auth.LoginRequest{
		Email:    "user@peoplecore.local",
		Password: "WrongPassword",
	})

	if err == nil {
		t.Fatal("expected error on wrong password, got nil")
	}
}

func TestAuthService_Login_InactiveUser(t *testing.T) {
	repo := newMockRepository()
	cfg := testConfig()
	svc := auth.NewService(repo, cfg)

	hash, _ := bcrypt.GenerateFromPassword([]byte("CorrectPassword"), bcrypt.DefaultCost)
	repo.users["user-1"] = &auth.User{
		ID:           "user-1",
		Email:        "inactive@peoplecore.local",
		PasswordHash: string(hash),
		IsActive:     false,
	}

	_, err := svc.Login(context.Background(), auth.LoginRequest{
		Email:    "inactive@peoplecore.local",
		Password: "CorrectPassword",
	})

	if err == nil {
		t.Fatal("expected error for inactive user, got nil")
	}
}

