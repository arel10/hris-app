package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peoplecore/hris/internal/app"
	"github.com/peoplecore/hris/internal/config"
)

// Server wraps the chi router and application config.
type Server struct {
	router *chi.Mux
	cfg    *config.Config
}

// New creates a new Server instance with the given config.
func New(cfg *config.Config) *Server {
	return &Server{
		router: chi.NewRouter(),
		cfg:    cfg,
	}
}

// ServeHTTP implements http.Handler, delegating to the underlying router.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

// RegisterRoutes sets up global middleware and all application routes.
func (s *Server) RegisterRoutes(deps *app.Dependencies) {
	setupRoutes(s, deps)
}

