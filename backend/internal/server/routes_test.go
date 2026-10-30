package server_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/peoplecore/hris/internal/app"
	"github.com/peoplecore/hris/internal/config"
	"github.com/peoplecore/hris/internal/server"
)

func TestRoutes_RegistrationAndProtection(t *testing.T) {
	cfg := &config.Config{
		JWTAccessSecret: "test_access_secret_key_minimum_32_characters!",
	}

	deps := app.NewDependencies(nil, cfg)
	srv := server.New(cfg)
	srv.RegisterRoutes(deps)

	tests := []struct {
		name           string
		method         string
		path           string
		expectedStatus int
	}{
		// Health
		{"Health Check", "GET", "/health", http.StatusOK},

		// Auth Public
		{"Login Without Body", "POST", "/api/v1/auth/login", http.StatusBadRequest},

		// Protected Routes Without Token (Must return 401 Unauthorized)
		{"Dashboard Summary Unauthorized", "GET", "/api/v1/dashboard/summary", http.StatusUnauthorized},
		{"List Companies Unauthorized", "GET", "/api/v1/companies", http.StatusUnauthorized},
		{"Create Company Unauthorized", "POST", "/api/v1/companies", http.StatusUnauthorized},
		{"List Branches Unauthorized", "GET", "/api/v1/branches", http.StatusUnauthorized},
		{"List Departments Unauthorized", "GET", "/api/v1/departments", http.StatusUnauthorized},
		{"Create Department Unauthorized", "POST", "/api/v1/departments", http.StatusUnauthorized},
		{"List Divisions Unauthorized", "GET", "/api/v1/divisions", http.StatusUnauthorized},
		{"List Job Grades Unauthorized", "GET", "/api/v1/job-grades", http.StatusUnauthorized},
		{"List Positions Unauthorized", "GET", "/api/v1/positions", http.StatusUnauthorized},
		{"Create Position Unauthorized", "POST", "/api/v1/positions", http.StatusUnauthorized},

		// Employee Protected Routes Without Token
		{"List Employees Unauthorized", "GET", "/api/v1/employees", http.StatusUnauthorized},
		{"Create Employee Unauthorized", "POST", "/api/v1/employees", http.StatusUnauthorized},
		{"Get My Profile Unauthorized", "GET", "/api/v1/employees/me", http.StatusUnauthorized},
		{"Get Employee Unauthorized", "GET", "/api/v1/employees/test-id", http.StatusUnauthorized},
		{"Update Employee Status Unauthorized", "PATCH", "/api/v1/employees/test-id/status", http.StatusUnauthorized},
		{"Get Employment History Unauthorized", "GET", "/api/v1/employees/test-id/employment-history", http.StatusUnauthorized},
		{"Get Contacts Unauthorized", "GET", "/api/v1/employees/test-id/contacts", http.StatusUnauthorized},
		{"Get Addresses Unauthorized", "GET", "/api/v1/employees/test-id/addresses", http.StatusUnauthorized},
		{"Get Emergency Contacts Unauthorized", "GET", "/api/v1/employees/test-id/emergency-contacts", http.StatusUnauthorized},
		{"Get Bank Accounts Unauthorized", "GET", "/api/v1/employees/test-id/bank-accounts", http.StatusUnauthorized},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, nil)
			rec := httptest.NewRecorder()

			srv.ServeHTTP(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("%s %s expected status %d, got %d", tt.method, tt.path, tt.expectedStatus, rec.Code)
			}
		})
	}
}

