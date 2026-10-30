package middleware

import (
	"net/http"
	"strings"

	"github.com/peoplecore/hris/internal/config"
)

// CORS returns a middleware that sets CORS headers based on the configured allowed origins.
func CORS(cfg *config.Config) func(http.Handler) http.Handler {
	allowedOrigins := cfg.CORSAllowedOrigins

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")

			if isAllowedOrigin(allowedOrigins, origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			} else if len(allowedOrigins) == 0 {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Request-ID")
			w.Header().Set("Access-Control-Expose-Headers", "X-Request-ID")
			w.Header().Set("Access-Control-Max-Age", "86400")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// isAllowedOrigin checks whether the given origin is in the allowed list.
func isAllowedOrigin(allowed []string, origin string) bool {
	for _, a := range allowed {
		if strings.EqualFold(a, origin) || a == "*" {
			return true
		}
	}
	return false
}

