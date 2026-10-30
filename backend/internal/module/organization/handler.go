package organization

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peoplecore/hris/internal/platform/apperrors"
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

// ─── Companies ───────────────────────────────────────────────────────────────

func (h *Handler) ListCompanies(w http.ResponseWriter, r *http.Request) {
	list, err := h.service.ListCompanies(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Companies retrieved successfully", list)
}

func (h *Handler) GetCompany(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	c, err := h.service.GetCompany(r.Context(), id)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Company retrieved successfully", c)
}

func (h *Handler) CreateCompany(w http.ResponseWriter, r *http.Request) {
	var req CreateCompanyRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	c, err := h.service.CreateCompany(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Company created successfully", c)
}

func (h *Handler) UpdateCompany(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateCompanyRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	c, err := h.service.UpdateCompany(r.Context(), id, req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Company updated successfully", c)
}

// ─── Branches ────────────────────────────────────────────────────────────────

func (h *Handler) ListBranches(w http.ResponseWriter, r *http.Request) {
	companyID := r.URL.Query().Get("company_id")
	list, err := h.service.ListBranches(r.Context(), companyID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Branches retrieved successfully", list)
}

func (h *Handler) GetBranch(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	b, err := h.service.GetBranch(r.Context(), id)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Branch retrieved successfully", b)
}

func (h *Handler) CreateBranch(w http.ResponseWriter, r *http.Request) {
	var req CreateBranchRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	b, err := h.service.CreateBranch(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Branch created successfully", b)
}

func (h *Handler) UpdateBranch(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateBranchRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	b, err := h.service.UpdateBranch(r.Context(), id, req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Branch updated successfully", b)
}

// ─── Departments ─────────────────────────────────────────────────────────────

func (h *Handler) ListDepartments(w http.ResponseWriter, r *http.Request) {
	companyID := r.URL.Query().Get("company_id")
	branchID := r.URL.Query().Get("branch_id")
	list, err := h.service.ListDepartments(r.Context(), companyID, branchID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Departments retrieved successfully", list)
}

func (h *Handler) GetDepartment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	d, err := h.service.GetDepartment(r.Context(), id)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Department retrieved successfully", d)
}

func (h *Handler) CreateDepartment(w http.ResponseWriter, r *http.Request) {
	var req CreateDepartmentRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	d, err := h.service.CreateDepartment(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Department created successfully", d)
}

func (h *Handler) UpdateDepartment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateDepartmentRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	d, err := h.service.UpdateDepartment(r.Context(), id, req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Department updated successfully", d)
}

func (h *Handler) DeleteDepartment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.service.DeleteDepartment(r.Context(), id); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Department deleted successfully", nil)
}

// ─── Divisions ───────────────────────────────────────────────────────────────

func (h *Handler) ListDivisions(w http.ResponseWriter, r *http.Request) {
	departmentID := r.URL.Query().Get("department_id")
	list, err := h.service.ListDivisions(r.Context(), departmentID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Divisions retrieved successfully", list)
}

func (h *Handler) GetDivision(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	d, err := h.service.GetDivision(r.Context(), id)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Division retrieved successfully", d)
}

func (h *Handler) CreateDivision(w http.ResponseWriter, r *http.Request) {
	var req CreateDivisionRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	d, err := h.service.CreateDivision(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Division created successfully", d)
}

func (h *Handler) UpdateDivision(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateDivisionRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	d, err := h.service.UpdateDivision(r.Context(), id, req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Division updated successfully", d)
}

func (h *Handler) DeleteDivision(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.service.DeleteDivision(r.Context(), id); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Division deleted successfully", nil)
}

// ─── JobGrades ──────────────────────────────────────────────────────────────

func (h *Handler) ListJobGrades(w http.ResponseWriter, r *http.Request) {
	list, err := h.service.ListJobGrades(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Job grades retrieved successfully", list)
}

func (h *Handler) GetJobGrade(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	j, err := h.service.GetJobGrade(r.Context(), id)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Job grade retrieved successfully", j)
}

func (h *Handler) CreateJobGrade(w http.ResponseWriter, r *http.Request) {
	var req CreateJobGradeRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	j, err := h.service.CreateJobGrade(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Job grade created successfully", j)
}

func (h *Handler) UpdateJobGrade(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateJobGradeRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	j, err := h.service.UpdateJobGrade(r.Context(), id, req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Job grade updated successfully", j)
}

func (h *Handler) DeleteJobGrade(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.service.DeleteJobGrade(r.Context(), id); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Job grade deleted successfully", nil)
}

// ─── Positions ───────────────────────────────────────────────────────────────

func (h *Handler) ListPositions(w http.ResponseWriter, r *http.Request) {
	departmentID := r.URL.Query().Get("department_id")
	list, err := h.service.ListPositions(r.Context(), departmentID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Positions retrieved successfully", list)
}

func (h *Handler) GetPosition(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	p, err := h.service.GetPosition(r.Context(), id)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}
	response.Success(w, "Position retrieved successfully", p)
}

func (h *Handler) CreatePosition(w http.ResponseWriter, r *http.Request) {
	var req CreatePositionRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	p, err := h.service.CreatePosition(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Created(w, "Position created successfully", p)
}

func (h *Handler) UpdatePosition(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdatePositionRequest
	if !h.validator.ValidateAndRespond(w, r, &req) {
		return
	}

	p, err := h.service.UpdatePosition(r.Context(), id, req)
	if err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Position updated successfully", p)
}

func (h *Handler) DeletePosition(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.service.DeletePosition(r.Context(), id); err != nil {
		if appErr, ok := apperrors.IsAppError(err); ok {
			response.Error(w, appErr.StatusCode, appErr.Code, appErr.Message)
			return
		}
		response.Error(w, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	response.Success(w, "Position deleted successfully", nil)
}

