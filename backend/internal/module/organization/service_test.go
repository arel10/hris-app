package organization_test

import (
	"context"
	"errors"
	"testing"

	"github.com/peoplecore/hris/internal/module/organization"
	"github.com/peoplecore/hris/internal/platform/apperrors"
)

type mockOrgRepo struct {
	companies   map[string]*organization.Company
	departments map[string]*organization.Department
	positions   map[string]*organization.Position
}

func newMockOrgRepo() *mockOrgRepo {
	return &mockOrgRepo{
		companies:   make(map[string]*organization.Company),
		departments: make(map[string]*organization.Department),
		positions:   make(map[string]*organization.Position),
	}
}

func (m *mockOrgRepo) ListCompanies(_ context.Context) ([]organization.Company, error) {
	var list []organization.Company
	for _, c := range m.companies {
		list = append(list, *c)
	}
	return list, nil
}

func (m *mockOrgRepo) GetCompanyByID(_ context.Context, id string) (*organization.Company, error) {
	if c, ok := m.companies[id]; ok {
		return c, nil
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockOrgRepo) CreateCompany(_ context.Context, c *organization.Company) error {
	c.ID = "comp-1"
	m.companies[c.ID] = c
	return nil
}

func (m *mockOrgRepo) UpdateCompany(_ context.Context, c *organization.Company) error {
	m.companies[c.ID] = c
	return nil
}

func (m *mockOrgRepo) ListBranches(_ context.Context, _ string) ([]organization.Branch, error) {
	return nil, nil
}

func (m *mockOrgRepo) GetBranchByID(_ context.Context, _ string) (*organization.Branch, error) {
	return nil, apperrors.ErrNotFound
}

func (m *mockOrgRepo) CreateBranch(_ context.Context, _ *organization.Branch) error {
	return nil
}

func (m *mockOrgRepo) UpdateBranch(_ context.Context, _ *organization.Branch) error {
	return nil
}

func (m *mockOrgRepo) ListDepartments(_ context.Context, _, _ string) ([]organization.Department, error) {
	var list []organization.Department
	for _, d := range m.departments {
		list = append(list, *d)
	}
	return list, nil
}

func (m *mockOrgRepo) GetDepartmentByID(_ context.Context, id string) (*organization.Department, error) {
	if d, ok := m.departments[id]; ok {
		return d, nil
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockOrgRepo) CreateDepartment(_ context.Context, d *organization.Department) error {
	d.ID = "dept-1"
	m.departments[d.ID] = d
	return nil
}

func (m *mockOrgRepo) UpdateDepartment(_ context.Context, d *organization.Department) error {
	m.departments[d.ID] = d
	return nil
}

func (m *mockOrgRepo) DeleteDepartment(_ context.Context, id string) error {
	delete(m.departments, id)
	return nil
}

func (m *mockOrgRepo) ListDivisions(_ context.Context, _ string) ([]organization.Division, error) {
	return nil, nil
}

func (m *mockOrgRepo) GetDivisionByID(_ context.Context, _ string) (*organization.Division, error) {
	return nil, apperrors.ErrNotFound
}

func (m *mockOrgRepo) CreateDivision(_ context.Context, _ *organization.Division) error {
	return nil
}

func (m *mockOrgRepo) UpdateDivision(_ context.Context, _ *organization.Division) error {
	return nil
}

func (m *mockOrgRepo) DeleteDivision(_ context.Context, _ string) error {
	return nil
}

func (m *mockOrgRepo) ListJobGrades(_ context.Context) ([]organization.JobGrade, error) {
	return nil, nil
}

func (m *mockOrgRepo) GetJobGradeByID(_ context.Context, _ string) (*organization.JobGrade, error) {
	return nil, apperrors.ErrNotFound
}

func (m *mockOrgRepo) CreateJobGrade(_ context.Context, _ *organization.JobGrade) error {
	return nil
}

func (m *mockOrgRepo) UpdateJobGrade(_ context.Context, _ *organization.JobGrade) error {
	return nil
}

func (m *mockOrgRepo) DeleteJobGrade(_ context.Context, _ string) error {
	return nil
}

func (m *mockOrgRepo) ListPositions(_ context.Context, _ string) ([]organization.Position, error) {
	var list []organization.Position
	for _, p := range m.positions {
		list = append(list, *p)
	}
	return list, nil
}

func (m *mockOrgRepo) GetPositionByID(_ context.Context, id string) (*organization.Position, error) {
	if p, ok := m.positions[id]; ok {
		return p, nil
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockOrgRepo) CreatePosition(_ context.Context, p *organization.Position) error {
	p.ID = "pos-1"
	m.positions[p.ID] = p
	return nil
}

func (m *mockOrgRepo) UpdatePosition(_ context.Context, p *organization.Position) error {
	m.positions[p.ID] = p
	return nil
}

func (m *mockOrgRepo) DeletePosition(_ context.Context, id string) error {
	delete(m.positions, id)
	return nil
}

func TestOrganizationService_PreventCircularDepartment(t *testing.T) {
	repo := newMockOrgRepo()
	svc := organization.NewService(repo)

	repo.departments["dept-10"] = &organization.Department{
		ID:   "dept-10",
		Name: "HR",
		Code: "HR",
	}

	selfID := "dept-10"
	_, err := svc.UpdateDepartment(context.Background(), "dept-10", organization.UpdateDepartmentRequest{
		ParentDepartmentID: &selfID,
	})

	if err == nil {
		t.Fatal("expected error on circular department hierarchy, got nil")
	}

	var appErr *apperrors.AppError
	if !errors.As(err, &appErr) || appErr.Code != "CIRCULAR_DEPENDENCY" {
		t.Errorf("expected CIRCULAR_DEPENDENCY apperror, got: %v", err)
	}
}

func TestOrganizationService_CreateCompanyAndDepartment(t *testing.T) {
	repo := newMockOrgRepo()
	svc := organization.NewService(repo)

	comp, err := svc.CreateCompany(context.Background(), organization.CreateCompanyRequest{
		Name: "Test Company",
	})
	if err != nil {
		t.Fatalf("failed to create company: %v", err)
	}
	if comp.ID != "comp-1" || comp.Name != "Test Company" {
		t.Errorf("unexpected company: %+v", comp)
	}

	dept, err := svc.CreateDepartment(context.Background(), organization.CreateDepartmentRequest{
		CompanyID: &comp.ID,
		Name:      "Technology",
		Code:      "TECH",
	})
	if err != nil {
		t.Fatalf("failed to create department: %v", err)
	}
	if dept.ID != "dept-1" || dept.Code != "TECH" {
		t.Errorf("unexpected dept: %+v", dept)
	}
}

