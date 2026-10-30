package app

import (
	"database/sql"

	"github.com/peoplecore/hris/internal/config"
	"github.com/peoplecore/hris/internal/module/auth"
	"github.com/peoplecore/hris/internal/module/dashboard"
	"github.com/peoplecore/hris/internal/module/employee"
	"github.com/peoplecore/hris/internal/module/organization"
	"github.com/peoplecore/hris/internal/platform/validator"
)

// Dependencies holds all application-level wired dependencies.
type Dependencies struct {
	DB                  *sql.DB
	Config              *config.Config
	AuthHandler         *auth.Handler
	OrganizationHandler *organization.Handler
	EmployeeHandler     *employee.Handler
	DashboardHandler    *dashboard.Handler
}

// NewDependencies wires up all application dependencies and returns a Dependencies struct.
func NewDependencies(db *sql.DB, cfg *config.Config) *Dependencies {
	val := validator.New()

	// Auth module
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo, cfg)
	authHandler := auth.NewHandler(authService, val)

	// Organization module
	orgRepo := organization.NewRepository(db)
	orgService := organization.NewService(orgRepo)
	orgHandler := organization.NewHandler(orgService)

	// Employee module
	empRepo := employee.NewRepository(db)
	empService := employee.NewService(empRepo, db)
	empHandler := employee.NewHandler(empService)

	// Dashboard module
	dashRepo := dashboard.NewRepository(db)
	dashService := dashboard.NewService(dashRepo)
	dashHandler := dashboard.NewHandler(dashService)

	return &Dependencies{
		DB:                  db,
		Config:              cfg,
		AuthHandler:         authHandler,
		OrganizationHandler: orgHandler,
		EmployeeHandler:     empHandler,
		DashboardHandler:    dashHandler,
	}
}
