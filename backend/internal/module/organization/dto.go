package organization

// Company DTOs
type CreateCompanyRequest struct {
	Name      string  `json:"name" validate:"required"`
	LegalName *string `json:"legal_name"`
	TaxNumber *string `json:"tax_number"`
	Email     *string `json:"email" validate:"omitempty,email"`
	Phone     *string `json:"phone"`
	Address   *string `json:"address"`
}

type UpdateCompanyRequest struct {
	Name      *string `json:"name"`
	LegalName *string `json:"legal_name"`
	TaxNumber *string `json:"tax_number"`
	Email     *string `json:"email" validate:"omitempty,email"`
	Phone     *string `json:"phone"`
	Address   *string `json:"address"`
	IsActive  *bool   `json:"is_active"`
}

// Branch DTOs
type CreateBranchRequest struct {
	CompanyID string  `json:"company_id" validate:"required,uuid"`
	Name      string  `json:"name" validate:"required"`
	Code      string  `json:"code" validate:"required"`
	Address   *string `json:"address"`
	City      *string `json:"city"`
}

type UpdateBranchRequest struct {
	Name     *string `json:"name"`
	Code     *string `json:"code"`
	Address  *string `json:"address"`
	City     *string `json:"city"`
	IsActive *bool   `json:"is_active"`
}

// Department DTOs
type CreateDepartmentRequest struct {
	CompanyID          *string `json:"company_id" validate:"omitempty,uuid"`
	BranchID           *string `json:"branch_id" validate:"omitempty,uuid"`
	ParentDepartmentID *string `json:"parent_department_id" validate:"omitempty,uuid"`
	Name               string  `json:"name" validate:"required"`
	Code               string  `json:"code" validate:"required"`
	Description        *string `json:"description"`
}

type UpdateDepartmentRequest struct {
	CompanyID          *string `json:"company_id" validate:"omitempty,uuid"`
	BranchID           *string `json:"branch_id" validate:"omitempty,uuid"`
	ParentDepartmentID *string `json:"parent_department_id" validate:"omitempty,uuid"`
	Name               *string `json:"name"`
	Code               *string `json:"code"`
	Description        *string `json:"description"`
	IsActive           *bool   `json:"is_active"`
}

// Division DTOs
type CreateDivisionRequest struct {
	DepartmentID string  `json:"department_id" validate:"required,uuid"`
	Name         string  `json:"name" validate:"required"`
	Code         *string `json:"code"`
}

type UpdateDivisionRequest struct {
	Name     *string `json:"name"`
	Code     *string `json:"code"`
	IsActive *bool   `json:"is_active"`
}

// JobGrade DTOs
type CreateJobGradeRequest struct {
	Name        string  `json:"name" validate:"required"`
	Description *string `json:"description"`
	Level       int     `json:"level" validate:"required,min=1"`
}

type UpdateJobGradeRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Level       *int    `json:"level" validate:"omitempty,min=1"`
}

// Position DTOs
type CreatePositionRequest struct {
	DepartmentID *string `json:"department_id" validate:"omitempty,uuid"`
	JobGradeID   *string `json:"job_grade_id" validate:"omitempty,uuid"`
	Title        string  `json:"title" validate:"required"`
	Description  *string `json:"description"`
}

type UpdatePositionRequest struct {
	DepartmentID *string `json:"department_id" validate:"omitempty,uuid"`
	JobGradeID   *string `json:"job_grade_id" validate:"omitempty,uuid"`
	Title        *string `json:"title"`
	Description  *string `json:"description"`
	IsActive     *bool   `json:"is_active"`
}

