package auth

import "time"

// User represents an application user.
type User struct {
	ID           string
	Email        string
	PasswordHash string
	IsActive     bool
	LastLoginAt  *time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Roles        []Role
}

// Role represents a set of permissions assigned to users.
type Role struct {
	ID          string
	Name        string
	Description string
	Permissions []Permission
}

// Permission represents a single action that can be granted to a role.
type Permission struct {
	ID     string
	Name   string
	Module string
	Action string
}

// RefreshToken represents a stored refresh token record.
type RefreshToken struct {
	ID        string
	UserID    string
	TokenHash string
	ExpiresAt time.Time
	RevokedAt *time.Time
	CreatedAt time.Time
}

