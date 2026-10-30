package server

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peoplecore/hris/internal/app"
	"github.com/peoplecore/hris/internal/middleware"
)

// setupRoutes registers all middleware and routes on the server.
func setupRoutes(s *Server, deps *app.Dependencies) {
	r := s.router

	// ── Global middleware ────────────────────────────────────────────────────
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recovery)
	r.Use(middleware.CORS(s.cfg))

	// ── Health endpoints ─────────────────────────────────────────────────────
	r.Get("/health", handleHealth)
	r.Get("/ready", handleReady(deps))

	// ── API v1 ───────────────────────────────────────────────────────────────
	r.Route("/api/v1", func(r chi.Router) {
		// Public auth routes (no auth middleware)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/login", deps.AuthHandler.Login)
			r.Post("/refresh", deps.AuthHandler.Refresh)
		})

		// Protected routes (auth middleware required)
		r.Group(func(r chi.Router) {
			r.Use(middleware.Authenticate(s.cfg))

			// Auth
			r.Post("/auth/logout", deps.AuthHandler.Logout)
			r.Get("/auth/me", deps.AuthHandler.Me)
			r.Post("/auth/change-password", deps.AuthHandler.ChangePassword)

			// Dashboard
			r.Get("/dashboard/summary", deps.DashboardHandler.GetSummary)

			// Organization: Companies
			r.Get("/companies", deps.OrganizationHandler.ListCompanies)
			r.Post("/companies", deps.OrganizationHandler.CreateCompany)
			r.Get("/companies/{id}", deps.OrganizationHandler.GetCompany)
			r.Put("/companies/{id}", deps.OrganizationHandler.UpdateCompany)
			r.Patch("/companies/{id}", deps.OrganizationHandler.UpdateCompany)

			// Organization: Branches
			r.Get("/branches", deps.OrganizationHandler.ListBranches)
			r.Post("/branches", deps.OrganizationHandler.CreateBranch)
			r.Get("/branches/{id}", deps.OrganizationHandler.GetBranch)
			r.Put("/branches/{id}", deps.OrganizationHandler.UpdateBranch)
			r.Patch("/branches/{id}", deps.OrganizationHandler.UpdateBranch)

			// Organization: Departments
			r.Get("/departments", deps.OrganizationHandler.ListDepartments)
			r.Post("/departments", deps.OrganizationHandler.CreateDepartment)
			r.Get("/departments/{id}", deps.OrganizationHandler.GetDepartment)
			r.Put("/departments/{id}", deps.OrganizationHandler.UpdateDepartment)
			r.Patch("/departments/{id}", deps.OrganizationHandler.UpdateDepartment)
			r.Delete("/departments/{id}", deps.OrganizationHandler.DeleteDepartment)

			// Organization: Divisions
			r.Get("/divisions", deps.OrganizationHandler.ListDivisions)
			r.Post("/divisions", deps.OrganizationHandler.CreateDivision)
			r.Get("/divisions/{id}", deps.OrganizationHandler.GetDivision)
			r.Put("/divisions/{id}", deps.OrganizationHandler.UpdateDivision)
			r.Patch("/divisions/{id}", deps.OrganizationHandler.UpdateDivision)
			r.Delete("/divisions/{id}", deps.OrganizationHandler.DeleteDivision)

			// Organization: Job Grades
			r.Get("/job-grades", deps.OrganizationHandler.ListJobGrades)
			r.Post("/job-grades", deps.OrganizationHandler.CreateJobGrade)
			r.Get("/job-grades/{id}", deps.OrganizationHandler.GetJobGrade)
			r.Put("/job-grades/{id}", deps.OrganizationHandler.UpdateJobGrade)
			r.Patch("/job-grades/{id}", deps.OrganizationHandler.UpdateJobGrade)
			r.Delete("/job-grades/{id}", deps.OrganizationHandler.DeleteJobGrade)

			// Organization: Positions
			r.Get("/positions", deps.OrganizationHandler.ListPositions)
			r.Post("/positions", deps.OrganizationHandler.CreatePosition)
			r.Get("/positions/{id}", deps.OrganizationHandler.GetPosition)
			r.Put("/positions/{id}", deps.OrganizationHandler.UpdatePosition)
			r.Patch("/positions/{id}", deps.OrganizationHandler.UpdatePosition)
			r.Delete("/positions/{id}", deps.OrganizationHandler.DeletePosition)

			// Employee
			r.Get("/employees", deps.EmployeeHandler.ListEmployees)
			r.Post("/employees", deps.EmployeeHandler.CreateEmployee)
			r.Get("/employees/me", deps.EmployeeHandler.GetMyProfile)
			r.Get("/employees/{id}", deps.EmployeeHandler.GetEmployee)
			r.Put("/employees/{id}", deps.EmployeeHandler.UpdateEmployee)
			r.Patch("/employees/{id}", deps.EmployeeHandler.UpdateEmployee)
			r.Patch("/employees/{id}/status", deps.EmployeeHandler.UpdateStatus)
			r.Get("/employees/{id}/employment-history", deps.EmployeeHandler.GetEmploymentHistory)

			// Employee: Sub-resources
			r.Get("/employees/{id}/contacts", deps.EmployeeHandler.GetContacts)
			r.Post("/employees/{id}/contacts", deps.EmployeeHandler.AddContact)
			r.Delete("/employees/{id}/contacts/{contactId}", deps.EmployeeHandler.DeleteContact)

			r.Get("/employees/{id}/addresses", deps.EmployeeHandler.GetAddresses)
			r.Post("/employees/{id}/addresses", deps.EmployeeHandler.AddAddress)
			r.Delete("/employees/{id}/addresses/{addressId}", deps.EmployeeHandler.DeleteAddress)

			r.Get("/employees/{id}/emergency-contacts", deps.EmployeeHandler.GetEmergencyContacts)
			r.Post("/employees/{id}/emergency-contacts", deps.EmployeeHandler.AddEmergencyContact)
			r.Delete("/employees/{id}/emergency-contacts/{contactId}", deps.EmployeeHandler.DeleteEmergencyContact)

			r.Get("/employees/{id}/bank-accounts", deps.EmployeeHandler.GetBankAccounts)
			r.Post("/employees/{id}/bank-accounts", deps.EmployeeHandler.AddBankAccount)
			r.Delete("/employees/{id}/bank-accounts/{bankId}", deps.EmployeeHandler.DeleteBankAccount)
		})
	})
}

// handleHealth returns a simple 200 OK to signal the service is alive.
func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
	})
}

// handleReady returns 200 if the database is reachable, 503 otherwise.
func handleReady(deps *app.Dependencies) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		if err := deps.DB.PingContext(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"status": "unavailable",
				"reason": "database unreachable",
			})
			return
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status": "ready",
		})
	}
}
