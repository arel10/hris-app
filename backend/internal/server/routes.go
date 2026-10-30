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

		// Protected auth routes (auth middleware required)
		r.Group(func(r chi.Router) {
			r.Use(middleware.Authenticate(s.cfg))
			r.Post("/auth/logout", deps.AuthHandler.Logout)
			r.Get("/auth/me", deps.AuthHandler.Me)
			r.Post("/auth/change-password", deps.AuthHandler.ChangePassword)
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
