package organization

import (
	"context"
	"fmt"

	"github.com/peoplecore/hris/internal/platform/apperrors"
)

type Service interface {
	// Companies
	ListCompanies(ctx context.Context) ([]Company, error)
	GetCompany(ctx context.Context, id string) (*Company, error)
	CreateCompany(ctx context.Context, req CreateCompanyRequest) (*Company, error)
	UpdateCompany(ctx context.Context, id string, req UpdateCompanyRequest) (*Company, error)

	// Branches
	ListBranches(ctx context.Context, companyID string) ([]Branch, error)
	GetBranch(ctx context.Context, id string) (*Branch, error)
	CreateBranch(ctx context.Context, req CreateBranchRequest) (*Branch, error)
	UpdateBranch(ctx context.Context, id string, req UpdateBranchRequest) (*Branch, error)

	// Departments
	ListDepartments(ctx context.Context, companyID string, branchID string) ([]Department, error)
	GetDepartment(ctx context.Context, id string) (*Department, error)
	CreateDepartment(ctx context.Context, req CreateDepartmentRequest) (*Department, error)
	UpdateDepartment(ctx context.Context, id string, req UpdateDepartmentRequest) (*Department, error)
	DeleteDepartment(ctx context.Context, id string) error

	// Divisions
	ListDivisions(ctx context.Context, departmentID string) ([]Division, error)
	GetDivision(ctx context.Context, id string) (*Division, error)
	CreateDivision(ctx context.Context, req CreateDivisionRequest) (*Division, error)
	UpdateDivision(ctx context.Context, id string, req UpdateDivisionRequest) (*Division, error)
	DeleteDivision(ctx context.Context, id string) error

	// JobGrades
	ListJobGrades(ctx context.Context) ([]JobGrade, error)
	GetJobGrade(ctx context.Context, id string) (*JobGrade, error)
	CreateJobGrade(ctx context.Context, req CreateJobGradeRequest) (*JobGrade, error)
	UpdateJobGrade(ctx context.Context, id string, req UpdateJobGradeRequest) (*JobGrade, error)
	DeleteJobGrade(ctx context.Context, id string) error

	// Positions
	ListPositions(ctx context.Context, departmentID string) ([]Position, error)
	GetPosition(ctx context.Context, id string) (*Position, error)
	CreatePosition(ctx context.Context, req CreatePositionRequest) (*Position, error)
	UpdatePosition(ctx context.Context, id string, req UpdatePositionRequest) (*Position, error)
	DeletePosition(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// ─── Companies ───────────────────────────────────────────────────────────────

func (s *service) ListCompanies(ctx context.Context) ([]Company, error) {
	return s.repo.ListCompanies(ctx)
}

func (s *service) GetCompany(ctx context.Context, id string) (*Company, error) {
	return s.repo.GetCompanyByID(ctx, id)
}

func (s *service) CreateCompany(ctx context.Context, req CreateCompanyRequest) (*Company, error) {
	c := &Company{
		Name:      req.Name,
		LegalName: req.LegalName,
		TaxNumber: req.TaxNumber,
		Email:     req.Email,
		Phone:     req.Phone,
		Address:   req.Address,
		IsActive:  true,
	}
	if err := s.repo.CreateCompany(ctx, c); err != nil {
		return nil, fmt.Errorf("create company: %w", err)
	}
	return c, nil
}

func (s *service) UpdateCompany(ctx context.Context, id string, req UpdateCompanyRequest) (*Company, error) {
	c, err := s.repo.GetCompanyByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		c.Name = *req.Name
	}
	if req.LegalName != nil {
		c.LegalName = req.LegalName
	}
	if req.TaxNumber != nil {
		c.TaxNumber = req.TaxNumber
	}
	if req.Email != nil {
		c.Email = req.Email
	}
	if req.Phone != nil {
		c.Phone = req.Phone
	}
	if req.Address != nil {
		c.Address = req.Address
	}
	if req.IsActive != nil {
		c.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateCompany(ctx, c); err != nil {
		return nil, fmt.Errorf("update company: %w", err)
	}
	return c, nil
}

// ─── Branches ────────────────────────────────────────────────────────────────

func (s *service) ListBranches(ctx context.Context, companyID string) ([]Branch, error) {
	return s.repo.ListBranches(ctx, companyID)
}

func (s *service) GetBranch(ctx context.Context, id string) (*Branch, error) {
	return s.repo.GetBranchByID(ctx, id)
}

func (s *service) CreateBranch(ctx context.Context, req CreateBranchRequest) (*Branch, error) {
	b := &Branch{
		CompanyID: req.CompanyID,
		Name:      req.Name,
		Code:      req.Code,
		Address:   req.Address,
		City:      req.City,
		IsActive:  true,
	}
	if err := s.repo.CreateBranch(ctx, b); err != nil {
		return nil, fmt.Errorf("create branch: %w", err)
	}
	return b, nil
}

func (s *service) UpdateBranch(ctx context.Context, id string, req UpdateBranchRequest) (*Branch, error) {
	b, err := s.repo.GetBranchByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		b.Name = *req.Name
	}
	if req.Code != nil {
		b.Code = *req.Code
	}
	if req.Address != nil {
		b.Address = req.Address
	}
	if req.City != nil {
		b.City = req.City
	}
	if req.IsActive != nil {
		b.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateBranch(ctx, b); err != nil {
		return nil, fmt.Errorf("update branch: %w", err)
	}
	return b, nil
}

// ─── Departments ─────────────────────────────────────────────────────────────

func (s *service) ListDepartments(ctx context.Context, companyID string, branchID string) ([]Department, error) {
	return s.repo.ListDepartments(ctx, companyID, branchID)
}

func (s *service) GetDepartment(ctx context.Context, id string) (*Department, error) {
	return s.repo.GetDepartmentByID(ctx, id)
}

func (s *service) CreateDepartment(ctx context.Context, req CreateDepartmentRequest) (*Department, error) {
	d := &Department{
		CompanyID:          req.CompanyID,
		BranchID:           req.BranchID,
		ParentDepartmentID: req.ParentDepartmentID,
		Name:               req.Name,
		Code:               req.Code,
		Description:        req.Description,
		IsActive:           true,
	}
	if err := s.repo.CreateDepartment(ctx, d); err != nil {
		return nil, fmt.Errorf("create department: %w", err)
	}
	return d, nil
}

func (s *service) UpdateDepartment(ctx context.Context, id string, req UpdateDepartmentRequest) (*Department, error) {
	d, err := s.repo.GetDepartmentByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.ParentDepartmentID != nil && *req.ParentDepartmentID == id {
		return nil, apperrors.New("CIRCULAR_DEPENDENCY", "Department cannot be its own parent", 422)
	}

	if req.CompanyID != nil {
		d.CompanyID = req.CompanyID
	}
	if req.BranchID != nil {
		d.BranchID = req.BranchID
	}
	if req.ParentDepartmentID != nil {
		d.ParentDepartmentID = req.ParentDepartmentID
	}
	if req.Name != nil {
		d.Name = *req.Name
	}
	if req.Code != nil {
		d.Code = *req.Code
	}
	if req.Description != nil {
		d.Description = req.Description
	}
	if req.IsActive != nil {
		d.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateDepartment(ctx, d); err != nil {
		return nil, fmt.Errorf("update department: %w", err)
	}
	return d, nil
}

func (s *service) DeleteDepartment(ctx context.Context, id string) error {
	return s.repo.DeleteDepartment(ctx, id)
}

// ─── Divisions ───────────────────────────────────────────────────────────────

func (s *service) ListDivisions(ctx context.Context, departmentID string) ([]Division, error) {
	return s.repo.ListDivisions(ctx, departmentID)
}

func (s *service) GetDivision(ctx context.Context, id string) (*Division, error) {
	return s.repo.GetDivisionByID(ctx, id)
}

func (s *service) CreateDivision(ctx context.Context, req CreateDivisionRequest) (*Division, error) {
	d := &Division{
		DepartmentID: req.DepartmentID,
		Name:         req.Name,
		Code:         req.Code,
		IsActive:     true,
	}
	if err := s.repo.CreateDivision(ctx, d); err != nil {
		return nil, fmt.Errorf("create division: %w", err)
	}
	return d, nil
}

func (s *service) UpdateDivision(ctx context.Context, id string, req UpdateDivisionRequest) (*Division, error) {
	d, err := s.repo.GetDivisionByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		d.Name = *req.Name
	}
	if req.Code != nil {
		d.Code = req.Code
	}
	if req.IsActive != nil {
		d.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateDivision(ctx, d); err != nil {
		return nil, fmt.Errorf("update division: %w", err)
	}
	return d, nil
}

func (s *service) DeleteDivision(ctx context.Context, id string) error {
	return s.repo.DeleteDivision(ctx, id)
}

// ─── JobGrades ──────────────────────────────────────────────────────────────

func (s *service) ListJobGrades(ctx context.Context) ([]JobGrade, error) {
	return s.repo.ListJobGrades(ctx)
}

func (s *service) GetJobGrade(ctx context.Context, id string) (*JobGrade, error) {
	return s.repo.GetJobGradeByID(ctx, id)
}

func (s *service) CreateJobGrade(ctx context.Context, req CreateJobGradeRequest) (*JobGrade, error) {
	j := &JobGrade{
		Name:        req.Name,
		Description: req.Description,
		Level:       req.Level,
	}
	if err := s.repo.CreateJobGrade(ctx, j); err != nil {
		return nil, fmt.Errorf("create job grade: %w", err)
	}
	return j, nil
}

func (s *service) UpdateJobGrade(ctx context.Context, id string, req UpdateJobGradeRequest) (*JobGrade, error) {
	j, err := s.repo.GetJobGradeByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		j.Name = *req.Name
	}
	if req.Description != nil {
		j.Description = req.Description
	}
	if req.Level != nil {
		j.Level = *req.Level
	}

	if err := s.repo.UpdateJobGrade(ctx, j); err != nil {
		return nil, fmt.Errorf("update job grade: %w", err)
	}
	return j, nil
}

func (s *service) DeleteJobGrade(ctx context.Context, id string) error {
	return s.repo.DeleteJobGrade(ctx, id)
}

// ─── Positions ───────────────────────────────────────────────────────────────

func (s *service) ListPositions(ctx context.Context, departmentID string) ([]Position, error) {
	return s.repo.ListPositions(ctx, departmentID)
}

func (s *service) GetPosition(ctx context.Context, id string) (*Position, error) {
	return s.repo.GetPositionByID(ctx, id)
}

func (s *service) CreatePosition(ctx context.Context, req CreatePositionRequest) (*Position, error) {
	p := &Position{
		DepartmentID: req.DepartmentID,
		JobGradeID:   req.JobGradeID,
		Title:        req.Title,
		Description:  req.Description,
		IsActive:     true,
	}
	if err := s.repo.CreatePosition(ctx, p); err != nil {
		return nil, fmt.Errorf("create position: %w", err)
	}
	return p, nil
}

func (s *service) UpdatePosition(ctx context.Context, id string, req UpdatePositionRequest) (*Position, error) {
	p, err := s.repo.GetPositionByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.DepartmentID != nil {
		p.DepartmentID = req.DepartmentID
	}
	if req.JobGradeID != nil {
		p.JobGradeID = req.JobGradeID
	}
	if req.Title != nil {
		p.Title = *req.Title
	}
	if req.Description != nil {
		p.Description = req.Description
	}
	if req.IsActive != nil {
		p.IsActive = *req.IsActive
	}

	if err := s.repo.UpdatePosition(ctx, p); err != nil {
		return nil, fmt.Errorf("update position: %w", err)
	}
	return p, nil
}

func (s *service) DeletePosition(ctx context.Context, id string) error {
	return s.repo.DeletePosition(ctx, id)
}

