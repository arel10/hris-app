package employee

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peoplecore/hris/internal/middleware"
	"github.com/peoplecore/hris/internal/platform/apperrors"
	"github.com/peoplecore/hris/internal/platform/pagination"
	"github.com/peoplecore/hris/internal/platform/response"
	"github.com/peoplecore/hris/internal/platform/validator"
)

type Handler struct {
	service   Service
	validator *validator.Validator
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service:   service,
		validator: validator.New(),
	}
}

func (h *Handler) ListEmployees(w http.ResponseWriter, r *http.Request) {
	p := pagination.FromRequest(r, "created_at", []string{"created_at", "first_name", "email", "employee_number", "join_date"})
	departmentID := r.URL.Query().Get("department_id")
	status := r.URL.Query().Get("status")

	list, total, err := h.service.ListEmployees(r.Context(), p, departmentID, status)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	totalPages := 0
	if p.Limit > 0 {
		totalPages = (total + p.Limit - 1) / p.Limit
	}

	meta := &response.Meta{
		Page:       p.Page,
		Limit:      p.Limit,
		Total:      total,
		TotalPages: totalPages,
	}

	response.Paginated(w, "Employees retrieved successfully", list, meta)
}

func (h *Handler) GetEmployee(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	emp, err := h.service.GetEmployee(r.Context(), id)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Employee retrieved successfully", emp)
}

func (h *Handler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication required")
		return
	}

	emp, err := h.service.GetMyProfile(r.Context(), claims.UserID)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Employee profile retrieved successfully", emp)
}

func (h *Handler) CreateEmployee(w http.ResponseWriter, r *http.Request) {
	var req CreateEmployeeRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	emp, err := h.service.CreateEmployee(r.Context(), req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Employee created successfully", emp)
}

func (h *Handler) UpdateEmployee(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateEmployeeRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	emp, err := h.service.UpdateEmployee(r.Context(), id, req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Employee updated successfully", emp)
}

func (h *Handler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateStatusRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	if err := h.service.UpdateStatus(r.Context(), id, req); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Employee status updated successfully", nil)
}

func (h *Handler) GetEmploymentHistory(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	histories, err := h.service.GetEmploymentHistories(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Employment histories retrieved successfully", histories)
}

// ─── Sub-resources Handlers ──────────────────────────────────────────────────

func (h *Handler) GetContacts(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	contacts, err := h.service.GetContacts(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Contacts retrieved successfully", contacts)
}

func (h *Handler) AddContact(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpsertContactRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	c, err := h.service.AddContact(r.Context(), id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Contact added successfully", c)
}

func (h *Handler) DeleteContact(w http.ResponseWriter, r *http.Request) {
	contactID := chi.URLParam(r, "contactId")
	if err := h.service.DeleteContact(r.Context(), contactID); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Contact deleted successfully", nil)
}

func (h *Handler) GetAddresses(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	addresses, err := h.service.GetAddresses(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Addresses retrieved successfully", addresses)
}

func (h *Handler) AddAddress(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpsertAddressRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	a, err := h.service.AddAddress(r.Context(), id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Address added successfully", a)
}

func (h *Handler) DeleteAddress(w http.ResponseWriter, r *http.Request) {
	addressID := chi.URLParam(r, "addressId")
	if err := h.service.DeleteAddress(r.Context(), addressID); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Address deleted successfully", nil)
}

func (h *Handler) GetEmergencyContacts(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	emergencies, err := h.service.GetEmergencyContacts(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Emergency contacts retrieved successfully", emergencies)
}

func (h *Handler) AddEmergencyContact(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req CreateEmergencyContactRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	ec, err := h.service.AddEmergencyContact(r.Context(), id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Emergency contact added successfully", ec)
}

func (h *Handler) DeleteEmergencyContact(w http.ResponseWriter, r *http.Request) {
	contactID := chi.URLParam(r, "contactId")
	if err := h.service.DeleteEmergencyContact(r.Context(), contactID); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Emergency contact deleted successfully", nil)
}

func (h *Handler) GetBankAccounts(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	banks, err := h.service.GetBankAccounts(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Bank accounts retrieved successfully", banks)
}

func (h *Handler) AddBankAccount(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req CreateBankAccountRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	ba, err := h.service.AddBankAccount(r.Context(), id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Bank account added successfully", ba)
}

func (h *Handler) DeleteBankAccount(w http.ResponseWriter, r *http.Request) {
	bankID := chi.URLParam(r, "bankId")
	if err := h.service.DeleteBankAccount(r.Context(), bankID); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Bank account deleted successfully", nil)
}
