package app

import (
	"database/sql"

	"github.com/peoplecore/hris/internal/config"
	"github.com/peoplecore/hris/internal/module/auth"
	"github.com/peoplecore/hris/internal/platform/validator"
)

// Dependencies holds all application-level wired dependencies.
type Dependencies struct {
	DB          *sql.DB
	Config      *config.Config
	AuthHandler *auth.Handler
}

// NewDependencies wires up all application dependencies and returns a Dependencies struct.
func NewDependencies(db *sql.DB, cfg *config.Config) *Dependencies {
	val := validator.New()

	// Auth module
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo, cfg)
	authHandler := auth.NewHandler(authService, val)

	return &Dependencies{
		DB:          db,
		Config:      cfg,
		AuthHandler: authHandler,
	}
}

