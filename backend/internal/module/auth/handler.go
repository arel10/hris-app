package auth

import (
	"net/http"

	"github.com/peoplecore/hris/internal/middleware"
	"github.com/peoplecore/hris/internal/platform/apperrors"
	"github.com/peoplecore/hris/internal/platform/response"
	"github.com/peoplecore/hris/internal/platform/validator"
)

// Handler handles HTTP requests for the auth module.
type Handler struct {
	service   Service
	validator *validator.Validator
}

// NewHandler creates a new auth Handler.
func NewHandler(svc Service, val *validator.Validator) *Handler {
	return &Handler{
		service:   svc,
		validator: val,
	}
}

// Login handles POST /auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	resp, err := h.service.Login(r.Context(), req)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response.Success(w, "Login successful", resp)
}

// Refresh handles POST /auth/refresh
func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	resp, err := h.service.RefreshToken(r.Context(), req)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response.Success(w, "Token refreshed", resp)
}

// Logout handles POST /auth/logout (protected)
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	if err := h.service.Logout(r.Context(), req.RefreshToken); err != nil {
		h.handleServiceError(w, err)
		return
	}

	response.NoContent(w)
}

// Me handles GET /auth/me (protected)
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required")
		return
	}

	resp, err := h.service.GetMe(r.Context(), claims.UserID)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response.Success(w, "User profile retrieved", resp)
}

// ChangePassword handles POST /auth/change-password (protected)
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required")
		return
	}

	var req ChangePasswordRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	if err := h.service.ChangePassword(r.Context(), claims.UserID, req); err != nil {
		h.handleServiceError(w, err)
		return
	}

	response.Success(w, "Password changed successfully", nil)
}

// handleServiceError translates service errors into appropriate HTTP responses.
func (h *Handler) handleServiceError(w http.ResponseWriter, err error) {
	if appErr, ok := apperrors.IsAppError(err); ok {
		response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
		return
	}
	response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Internal server error")
}

