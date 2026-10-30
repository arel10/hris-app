package middleware

import (
	"log/slog"
	"net/http"

	"github.com/peoplecore/hris/internal/platform/response"
)

// Recovery recovers from panics, logs the error, and returns a 500 Internal Server Error.
func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				requestID := GetRequestID(r.Context())
				slog.Error("panic recovered",
					"error", err,
					"request_id", requestID,
					"method", r.Method,
					"path", r.URL.Path,
				)
				response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

