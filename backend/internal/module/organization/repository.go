package organization

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/peoplecore/hris/internal/platform/apperrors"
)

type Repository interface {
	// Companies
	ListCompanies(ctx context.Context) ([]Company, error)
	GetCompanyByID(ctx context.Context, id string) (*Company, error)
	CreateCompany(ctx context.Context, c *Company) error
	UpdateCompany(ctx context.Context, c *Company) error

	// Branches
	ListBranches(ctx context.Context, companyID string) ([]Branch, error)
	GetBranchByID(ctx context.Context, id string) (*Branch, error)
	CreateBranch(ctx context.Context, b *Branch) error
	UpdateBranch(ctx context.Context, b *Branch) error

	// Departments
	ListDepartments(ctx context.Context, companyID string, branchID string) ([]Department, error)
	GetDepartmentByID(ctx context.Context, id string) (*Department, error)
	CreateDepartment(ctx context.Context, d *Department) error
	UpdateDepartment(ctx context.Context, d *Department) error
	DeleteDepartment(ctx context.Context, id string) error

	// Divisions
	ListDivisions(ctx context.Context, departmentID string) ([]Division, error)
	GetDivisionByID(ctx context.Context, id string) (*Division, error)
	CreateDivision(ctx context.Context, d *Division) error
	UpdateDivision(ctx context.Context, d *Division) error
	DeleteDivision(ctx context.Context, id string) error

	// JobGrades
	ListJobGrades(ctx context.Context) ([]JobGrade, error)
	GetJobGradeByID(ctx context.Context, id string) (*JobGrade, error)
	CreateJobGrade(ctx context.Context, j *JobGrade) error
	UpdateJobGrade(ctx context.Context, j *JobGrade) error
	DeleteJobGrade(ctx context.Context, id string) error

	// Positions
	ListPositions(ctx context.Context, departmentID string) ([]Position, error)
	GetPositionByID(ctx context.Context, id string) (*Position, error)
	CreatePosition(ctx context.Context, p *Position) error
	UpdatePosition(ctx context.Context, p *Position) error
	DeletePosition(ctx context.Context, id string) error
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

// ─── Companies ───────────────────────────────────────────────────────────────

func (r *repository) ListCompanies(ctx context.Context) ([]Company, error) {
	query := `
		SELECT id, name, legal_name, tax_number, email, phone, address, is_active, created_at, updated_at
		FROM companies
		ORDER BY name ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list companies: %w", err)
	}
	defer rows.Close()

	var list []Company
	for rows.Next() {
		var c Company
		if err := rows.Scan(&c.ID, &c.Name, &c.LegalName, &c.TaxNumber, &c.Email, &c.Phone, &c.Address, &c.IsActive, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *repository) GetCompanyByID(ctx context.Context, id string) (*Company, error) {
	query := `
		SELECT id, name, legal_name, tax_number, email, phone, address, is_active, created_at, updated_at
		FROM companies
		WHERE id = $1
	`
	var c Company
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID, &c.Name, &c.LegalName, &c.TaxNumber, &c.Email, &c.Phone, &c.Address, &c.IsActive, &c.CreatedAt, &c.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *repository) CreateCompany(ctx context.Context, c *Company) error {
	query := `
		INSERT INTO companies (name, legal_name, tax_number, email, phone, address, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, c.Name, c.LegalName, c.TaxNumber, c.Email, c.Phone, c.Address, c.IsActive).
		Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

func (r *repository) UpdateCompany(ctx context.Context, c *Company) error {
	query := `
		UPDATE companies
		SET name = $1, legal_name = $2, tax_number = $3, email = $4, phone = $5, address = $6, is_active = $7, updated_at = NOW()
		WHERE id = $8
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, c.Name, c.LegalName, c.TaxNumber, c.Email, c.Phone, c.Address, c.IsActive, c.ID).
		Scan(&c.UpdatedAt)
}

// ─── Branches ────────────────────────────────────────────────────────────────

func (r *repository) ListBranches(ctx context.Context, companyID string) ([]Branch, error) {
	query := `
		SELECT id, company_id, name, code, address, city, is_active, created_at, updated_at
		FROM branches
		WHERE ($1 = '' OR company_id = $1::uuid)
		ORDER BY name ASC
	`
	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("list branches: %w", err)
	}
	defer rows.Close()

	var list []Branch
	for rows.Next() {
		var b Branch
		if err := rows.Scan(&b.ID, &b.CompanyID, &b.Name, &b.Code, &b.Address, &b.City, &b.IsActive, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, b)
	}
	return list, nil
}

func (r *repository) GetBranchByID(ctx context.Context, id string) (*Branch, error) {
	query := `
		SELECT id, company_id, name, code, address, city, is_active, created_at, updated_at
		FROM branches
		WHERE id = $1
	`
	var b Branch
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&b.ID, &b.CompanyID, &b.Name, &b.Code, &b.Address, &b.City, &b.IsActive, &b.CreatedAt, &b.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *repository) CreateBranch(ctx context.Context, b *Branch) error {
	query := `
		INSERT INTO branches (company_id, name, code, address, city, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, b.CompanyID, b.Name, b.Code, b.Address, b.City, b.IsActive).
		Scan(&b.ID, &b.CreatedAt, &b.UpdatedAt)
}

func (r *repository) UpdateBranch(ctx context.Context, b *Branch) error {
	query := `
		UPDATE branches
		SET name = $1, code = $2, address = $3, city = $4, is_active = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, b.Name, b.Code, b.Address, b.City, b.IsActive, b.ID).
		Scan(&b.UpdatedAt)
}

// ─── Departments ─────────────────────────────────────────────────────────────

func (r *repository) ListDepartments(ctx context.Context, companyID string, branchID string) ([]Department, error) {
	query := `
		SELECT d.id, d.company_id, d.branch_id, d.parent_department_id, p.name AS parent_name,
		       d.name, d.code, d.description, d.is_active, d.created_at, d.updated_at
		FROM departments d
		LEFT JOIN departments p ON d.parent_department_id = p.id
		WHERE ($1 = '' OR d.company_id = $1::uuid)
		  AND ($2 = '' OR d.branch_id = $2::uuid)
		ORDER BY d.name ASC
	`
	rows, err := r.db.QueryContext(ctx, query, companyID, branchID)
	if err != nil {
		return nil, fmt.Errorf("list departments: %w", err)
	}
	defer rows.Close()

	var list []Department
	for rows.Next() {
		var d Department
		if err := rows.Scan(
			&d.ID, &d.CompanyID, &d.BranchID, &d.ParentDepartmentID, &d.ParentName,
			&d.Name, &d.Code, &d.Description, &d.IsActive, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, d)
	}
	return list, nil
}

func (r *repository) GetDepartmentByID(ctx context.Context, id string) (*Department, error) {
	query := `
		SELECT d.id, d.company_id, d.branch_id, d.parent_department_id, p.name AS parent_name,
		       d.name, d.code, d.description, d.is_active, d.created_at, d.updated_at
		FROM departments d
		LEFT JOIN departments p ON d.parent_department_id = p.id
		WHERE d.id = $1
	`
	var d Department
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&d.ID, &d.CompanyID, &d.BranchID, &d.ParentDepartmentID, &d.ParentName,
		&d.Name, &d.Code, &d.Description, &d.IsActive, &d.CreatedAt, &d.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *repository) CreateDepartment(ctx context.Context, d *Department) error {
	query := `
		INSERT INTO departments (company_id, branch_id, parent_department_id, name, code, description, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, d.CompanyID, d.BranchID, d.ParentDepartmentID, d.Name, d.Code, d.Description, d.IsActive).
		Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
}

func (r *repository) UpdateDepartment(ctx context.Context, d *Department) error {
	query := `
		UPDATE departments
		SET company_id = $1, branch_id = $2, parent_department_id = $3, name = $4, code = $5, description = $6, is_active = $7, updated_at = NOW()
		WHERE id = $8
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, d.CompanyID, d.BranchID, d.ParentDepartmentID, d.Name, d.Code, d.Description, d.IsActive, d.ID).
		Scan(&d.UpdatedAt)
}

func (r *repository) DeleteDepartment(ctx context.Context, id string) error {
	query := `DELETE FROM departments WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// ─── Divisions ───────────────────────────────────────────────────────────────

func (r *repository) ListDivisions(ctx context.Context, departmentID string) ([]Division, error) {
	query := `
		SELECT dv.id, dv.department_id, dp.name AS department_name, dv.name, dv.code, dv.is_active, dv.created_at, dv.updated_at
		FROM divisions dv
		JOIN departments dp ON dv.department_id = dp.id
		WHERE ($1 = '' OR dv.department_id = $1::uuid)
		ORDER BY dv.name ASC
	`
	rows, err := r.db.QueryContext(ctx, query, departmentID)
	if err != nil {
		return nil, fmt.Errorf("list divisions: %w", err)
	}
	defer rows.Close()

	var list []Division
	for rows.Next() {
		var d Division
		if err := rows.Scan(&d.ID, &d.DepartmentID, &d.DepartmentName, &d.Name, &d.Code, &d.IsActive, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, d)
	}
	return list, nil
}

func (r *repository) GetDivisionByID(ctx context.Context, id string) (*Division, error) {
	query := `
		SELECT dv.id, dv.department_id, dp.name AS department_name, dv.name, dv.code, dv.is_active, dv.created_at, dv.updated_at
		FROM divisions dv
		JOIN departments dp ON dv.department_id = dp.id
		WHERE dv.id = $1
	`
	var d Division
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&d.ID, &d.DepartmentID, &d.DepartmentName, &d.Name, &d.Code, &d.IsActive, &d.CreatedAt, &d.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *repository) CreateDivision(ctx context.Context, d *Division) error {
	query := `
		INSERT INTO divisions (department_id, name, code, is_active)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, d.DepartmentID, d.Name, d.Code, d.IsActive).
		Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
}

func (r *repository) UpdateDivision(ctx context.Context, d *Division) error {
	query := `
		UPDATE divisions
		SET name = $1, code = $2, is_active = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, d.Name, d.Code, d.IsActive, d.ID).
		Scan(&d.UpdatedAt)
}

func (r *repository) DeleteDivision(ctx context.Context, id string) error {
	query := `DELETE FROM divisions WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// ─── JobGrades ──────────────────────────────────────────────────────────────

func (r *repository) ListJobGrades(ctx context.Context) ([]JobGrade, error) {
	query := `
		SELECT id, name, description, level, created_at, updated_at
		FROM job_grades
		ORDER BY level ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list job grades: %w", err)
	}
	defer rows.Close()

	var list []JobGrade
	for rows.Next() {
		var j JobGrade
		if err := rows.Scan(&j.ID, &j.Name, &j.Description, &j.Level, &j.CreatedAt, &j.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, j)
	}
	return list, nil
}

func (r *repository) GetJobGradeByID(ctx context.Context, id string) (*JobGrade, error) {
	query := `
		SELECT id, name, description, level, created_at, updated_at
		FROM job_grades
		WHERE id = $1
	`
	var j JobGrade
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&j.ID, &j.Name, &j.Description, &j.Level, &j.CreatedAt, &j.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &j, nil
}

func (r *repository) CreateJobGrade(ctx context.Context, j *JobGrade) error {
	query := `
		INSERT INTO job_grades (name, description, level)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, j.Name, j.Description, j.Level).
		Scan(&j.ID, &j.CreatedAt, &j.UpdatedAt)
}

func (r *repository) UpdateJobGrade(ctx context.Context, j *JobGrade) error {
	query := `
		UPDATE job_grades
		SET name = $1, description = $2, level = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, j.Name, j.Description, j.Level, j.ID).
		Scan(&j.UpdatedAt)
}

func (r *repository) DeleteJobGrade(ctx context.Context, id string) error {
	query := `DELETE FROM job_grades WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// ─── Positions ───────────────────────────────────────────────────────────────

func (r *repository) ListPositions(ctx context.Context, departmentID string) ([]Position, error) {
	query := `
		SELECT p.id, p.department_id, d.name AS department_name, p.job_grade_id, j.name AS job_grade_name,
		       p.title, p.description, p.is_active, p.created_at, p.updated_at
		FROM positions p
		LEFT JOIN departments d ON p.department_id = d.id
		LEFT JOIN job_grades j ON p.job_grade_id = j.id
		WHERE ($1 = '' OR p.department_id = $1::uuid)
		ORDER BY p.title ASC
	`
	rows, err := r.db.QueryContext(ctx, query, departmentID)
	if err != nil {
		return nil, fmt.Errorf("list positions: %w", err)
	}
	defer rows.Close()

	var list []Position
	for rows.Next() {
		var p Position
		if err := rows.Scan(
			&p.ID, &p.DepartmentID, &p.DepartmentName, &p.JobGradeID, &p.JobGradeName,
			&p.Title, &p.Description, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *repository) GetPositionByID(ctx context.Context, id string) (*Position, error) {
	query := `
		SELECT p.id, p.department_id, d.name AS department_name, p.job_grade_id, j.name AS job_grade_name,
		       p.title, p.description, p.is_active, p.created_at, p.updated_at
		FROM positions p
		LEFT JOIN departments d ON p.department_id = d.id
		LEFT JOIN job_grades j ON p.job_grade_id = j.id
		WHERE p.id = $1
	`
	var p Position
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&p.ID, &p.DepartmentID, &p.DepartmentName, &p.JobGradeID, &p.JobGradeName,
		&p.Title, &p.Description, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) CreatePosition(ctx context.Context, p *Position) error {
	query := `
		INSERT INTO positions (department_id, job_grade_id, title, description, is_active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRowContext(ctx, query, p.DepartmentID, p.JobGradeID, p.Title, p.Description, p.IsActive).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
}

func (r *repository) UpdatePosition(ctx context.Context, p *Position) error {
	query := `
		UPDATE positions
		SET department_id = $1, job_grade_id = $2, title = $3, description = $4, is_active = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING updated_at
	`
	return r.db.QueryRowContext(ctx, query, p.DepartmentID, p.JobGradeID, p.Title, p.Description, p.IsActive, p.ID).
		Scan(&p.UpdatedAt)
}

func (r *repository) DeletePosition(ctx context.Context, id string) error {
	query := `DELETE FROM positions WHERE id = $1`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

