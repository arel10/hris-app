package organization

import "time"

type Company struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	LegalName *string   `json:"legal_name,omitempty"`
	TaxNumber *string   `json:"tax_number,omitempty"`
	Email     *string   `json:"email,omitempty"`
	Phone     *string   `json:"phone,omitempty"`
	Address   *string   `json:"address,omitempty"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Branch struct {
	ID        string    `json:"id"`
	CompanyID string    `json:"company_id"`
	Name      string    `json:"name"`
	Code      string    `json:"code"`
	Address   *string   `json:"address,omitempty"`
	City      *string   `json:"city,omitempty"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Department struct {
	ID                 string    `json:"id"`
	CompanyID          *string   `json:"company_id,omitempty"`
	BranchID           *string   `json:"branch_id,omitempty"`
	ParentDepartmentID *string   `json:"parent_department_id,omitempty"`
	ParentName         *string   `json:"parent_name,omitempty"`
	Name               string    `json:"name"`
	Code               string    `json:"code"`
	Description        *string   `json:"description,omitempty"`
	IsActive           bool      `json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type Division struct {
	ID             string    `json:"id"`
	DepartmentID   string    `json:"department_id"`
	DepartmentName *string   `json:"department_name,omitempty"`
	Name           string    `json:"name"`
	Code           *string   `json:"code,omitempty"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type JobGrade struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	Level       int       `json:"level"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Position struct {
	ID             string    `json:"id"`
	DepartmentID   *string   `json:"department_id,omitempty"`
	DepartmentName *string   `json:"department_name,omitempty"`
	JobGradeID     *string   `json:"job_grade_id,omitempty"`
	JobGradeName   *string   `json:"job_grade_name,omitempty"`
	Title          string    `json:"title"`
	Description    *string   `json:"description,omitempty"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

