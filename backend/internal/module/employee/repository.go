package employee

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/peoplecore/hris/internal/platform/apperrors"
	"github.com/peoplecore/hris/internal/platform/pagination"
)

type Repository interface {
	ListEmployees(ctx context.Context, p pagination.Params, departmentID string, status string) ([]Employee, int, error)
	GetEmployeeByID(ctx context.Context, id string) (*Employee, error)
	GetEmployeeByUserID(ctx context.Context, userID string) (*Employee, error)
	GetLatestEmployeeNumber(ctx context.Context, prefix string) (string, error)

	CreateEmployee(ctx context.Context, tx *sql.Tx, e *Employee) error
	UpdateEmployee(ctx context.Context, tx *sql.Tx, e *Employee) error
	UpdateStatus(ctx context.Context, id string, status string, terminationDate *string) error

	// Sub-resources
	GetContacts(ctx context.Context, employeeID string) ([]Contact, error)
	AddContact(ctx context.Context, c *Contact) error
	DeleteContact(ctx context.Context, id string) error

	GetAddresses(ctx context.Context, employeeID string) ([]Address, error)
	AddAddress(ctx context.Context, a *Address) error
	DeleteAddress(ctx context.Context, id string) error

	GetEmergencyContacts(ctx context.Context, employeeID string) ([]EmergencyContact, error)
	AddEmergencyContact(ctx context.Context, ec *EmergencyContact) error
	DeleteEmergencyContact(ctx context.Context, id string) error

	GetBankAccounts(ctx context.Context, employeeID string) ([]BankAccount, error)
	AddBankAccount(ctx context.Context, ba *BankAccount) error
	DeleteBankAccount(ctx context.Context, id string) error

	// History
	GetEmploymentHistories(ctx context.Context, employeeID string) ([]EmploymentHistory, error)
	AddEmploymentHistory(ctx context.Context, tx *sql.Tx, eh *EmploymentHistory) error
	ClosePreviousEmploymentHistory(ctx context.Context, tx *sql.Tx, employeeID string, untilDate string) error
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

// ─── List & Get ──────────────────────────────────────────────────────────────

func (r *repository) ListEmployees(ctx context.Context, p pagination.Params, departmentID string, status string) ([]Employee, int, error) {
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIdx := 1

	if p.Search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf(
			"(e.first_name ILIKE $%d OR e.last_name ILIKE $%d OR e.email ILIKE $%d OR e.employee_number ILIKE $%d)",
			argIdx, argIdx, argIdx, argIdx,
		))
		args = append(args, "%"+p.Search+"%")
		argIdx++
	}

	if departmentID != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("e.department_id = $%d::uuid", argIdx))
		args = append(args, departmentID)
		argIdx++
	}

	if status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("e.employment_status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM employees e WHERE %s", whereSQL)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count employees: %w", err)
	}

	// Order by
	sortBy := "e.created_at"
	if p.SortBy == "first_name" || p.SortBy == "email" || p.SortBy == "employee_number" || p.SortBy == "join_date" {
		sortBy = "e." + p.SortBy
	}
	sortOrder := "DESC"
	if strings.ToUpper(p.SortOrder) == "ASC" {
		sortOrder = "ASC"
	}

	query := fmt.Sprintf(`
		SELECT e.id, e.user_id, e.employee_number, e.first_name, e.last_name, e.email, e.phone,
		       e.gender, TO_CHAR(e.birth_date, 'YYYY-MM-DD'), e.birth_place, e.national_id, e.marital_status,
		       e.employment_type, e.employment_status, e.department_id, d.name AS department_name,
		       e.position_id, p.title AS position_title, e.manager_id,
		       CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) AS manager_name,
		       TO_CHAR(e.join_date, 'YYYY-MM-DD'), TO_CHAR(e.termination_date, 'YYYY-MM-DD'),
		       e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN positions p ON e.position_id = p.id
		LEFT JOIN employees m ON e.manager_id = m.id
		WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereSQL, sortBy, sortOrder, argIdx, argIdx+1)

	args = append(args, p.ClampedLimit(100), p.Offset())

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list employees: %w", err)
	}
	defer rows.Close()

	var list []Employee
	for rows.Next() {
		var e Employee
		var managerName sql.NullString
		if err := rows.Scan(
			&e.ID, &e.UserID, &e.EmployeeNumber, &e.FirstName, &e.LastName, &e.Email, &e.Phone,
			&e.Gender, &e.BirthDate, &e.BirthPlace, &e.NationalID, &e.MaritalStatus,
			&e.EmploymentType, &e.EmploymentStatus, &e.DepartmentID, &e.DepartmentName,
			&e.PositionID, &e.PositionTitle, &e.ManagerID, &managerName,
			&e.JoinDate, &e.TerminationDate, &e.CreatedAt, &e.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		if managerName.Valid && strings.TrimSpace(managerName.String) != "" {
			trimmed := strings.TrimSpace(managerName.String)
			e.ManagerName = &trimmed
		}
		list = append(list, e)
	}
	return list, total, nil
}

func (r *repository) GetEmployeeByID(ctx context.Context, id string) (*Employee, error) {
	query := `
		SELECT e.id, e.user_id, e.employee_number, e.first_name, e.last_name, e.email, e.phone,
		       e.gender, TO_CHAR(e.birth_date, 'YYYY-MM-DD'), e.birth_place, e.national_id, e.marital_status,
		       e.employment_type, e.employment_status, e.department_id, d.name AS department_name,
		       e.position_id, p.title AS position_title, e.manager_id,
		       CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) AS manager_name,
		       TO_CHAR(e.join_date, 'YYYY-MM-DD'), TO_CHAR(e.termination_date, 'YYYY-MM-DD'),
		       e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN positions p ON e.position_id = p.id
		LEFT JOIN employees m ON e.manager_id = m.id
		WHERE e.id = $1
	`
	var e Employee
	var managerName sql.NullString
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&e.ID, &e.UserID, &e.EmployeeNumber, &e.FirstName, &e.LastName, &e.Email, &e.Phone,
		&e.Gender, &e.BirthDate, &e.BirthPlace, &e.NationalID, &e.MaritalStatus,
		&e.EmploymentType, &e.EmploymentStatus, &e.DepartmentID, &e.DepartmentName,
		&e.PositionID, &e.PositionTitle, &e.ManagerID, &managerName,
		&e.JoinDate, &e.TerminationDate, &e.CreatedAt, &e.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if managerName.Valid && strings.TrimSpace(managerName.String) != "" {
		trimmed := strings.TrimSpace(managerName.String)
		e.ManagerName = &trimmed
	}
	return &e, nil
}

func (r *repository) GetEmployeeByUserID(ctx context.Context, userID string) (*Employee, error) {
	query := `
		SELECT e.id, e.user_id, e.employee_number, e.first_name, e.last_name, e.email, e.phone,
		       e.gender, TO_CHAR(e.birth_date, 'YYYY-MM-DD'), e.birth_place, e.national_id, e.marital_status,
		       e.employment_type, e.employment_status, e.department_id, d.name AS department_name,
		       e.position_id, p.title AS position_title, e.manager_id,
		       CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) AS manager_name,
		       TO_CHAR(e.join_date, 'YYYY-MM-DD'), TO_CHAR(e.termination_date, 'YYYY-MM-DD'),
		       e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN positions p ON e.position_id = p.id
		LEFT JOIN employees m ON e.manager_id = m.id
		WHERE e.user_id = $1
	`
	var e Employee
	var managerName sql.NullString
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&e.ID, &e.UserID, &e.EmployeeNumber, &e.FirstName, &e.LastName, &e.Email, &e.Phone,
		&e.Gender, &e.BirthDate, &e.BirthPlace, &e.NationalID, &e.MaritalStatus,
		&e.EmploymentType, &e.EmploymentStatus, &e.DepartmentID, &e.DepartmentName,
		&e.PositionID, &e.PositionTitle, &e.ManagerID, &managerName,
		&e.JoinDate, &e.TerminationDate, &e.CreatedAt, &e.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if managerName.Valid && strings.TrimSpace(managerName.String) != "" {
		trimmed := strings.TrimSpace(managerName.String)
		e.ManagerName = &trimmed
	}
	return &e, nil
}

func (r *repository) GetLatestEmployeeNumber(ctx context.Context, prefix string) (string, error) {
	query := `
		SELECT employee_number
		FROM employees
		WHERE employee_number LIKE $1 || '%'
		ORDER BY employee_number DESC
		LIMIT 1
	`
	var num string
	err := r.db.QueryRowContext(ctx, query, prefix).Scan(&num)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	return num, err
}

// ─── Create & Update ─────────────────────────────────────────────────────────

func (r *repository) CreateEmployee(ctx context.Context, tx *sql.Tx, e *Employee) error {
	query := `
		INSERT INTO employees (
			user_id, employee_number, first_name, last_name, email, phone,
			gender, birth_date, birth_place, national_id, marital_status,
			employment_type, employment_status, department_id, position_id, manager_id, join_date
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10, $11,
			$12, $13, $14, $15, $16, $17
		) RETURNING id, created_at, updated_at
	`
	var birthDateVal *string
	if e.BirthDate != nil && *e.BirthDate != "" {
		birthDateVal = e.BirthDate
	}

	row := tx.QueryRowContext(ctx, query,
		e.UserID, e.EmployeeNumber, e.FirstName, e.LastName, e.Email, e.Phone,
		e.Gender, birthDateVal, e.BirthPlace, e.NationalID, e.MaritalStatus,
		e.EmploymentType, e.EmploymentStatus, e.DepartmentID, e.PositionID, e.ManagerID, e.JoinDate,
	)
	return row.Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)
}

func (r *repository) UpdateEmployee(ctx context.Context, tx *sql.Tx, e *Employee) error {
	query := `
		UPDATE employees
		SET first_name = $1, last_name = $2, phone = $3, gender = $4,
		    birth_date = $5, birth_place = $6, national_id = $7, marital_status = $8,
		    employment_type = $9, department_id = $10, position_id = $11,
		    manager_id = $12, join_date = $13, termination_date = $14, updated_at = NOW()
		WHERE id = $15
		RETURNING updated_at
	`
	var birthDateVal *string
	if e.BirthDate != nil && *e.BirthDate != "" {
		birthDateVal = e.BirthDate
	}
	var termDateVal *string
	if e.TerminationDate != nil && *e.TerminationDate != "" {
		termDateVal = e.TerminationDate
	}

	var row *sql.Row
	if tx != nil {
		row = tx.QueryRowContext(ctx, query,
			e.FirstName, e.LastName, e.Phone, e.Gender,
			birthDateVal, e.BirthPlace, e.NationalID, e.MaritalStatus,
			e.EmploymentType, e.DepartmentID, e.PositionID,
			e.ManagerID, e.JoinDate, termDateVal, e.ID,
		)
	} else {
		row = r.db.QueryRowContext(ctx, query,
			e.FirstName, e.LastName, e.Phone, e.Gender,
			birthDateVal, e.BirthPlace, e.NationalID, e.MaritalStatus,
			e.EmploymentType, e.DepartmentID, e.PositionID,
			e.ManagerID, e.JoinDate, termDateVal, e.ID,
		)
	}
	return row.Scan(&e.UpdatedAt)
}

func (r *repository) UpdateStatus(ctx context.Context, id string, status string, terminationDate *string) error {
	query := `
		UPDATE employees
		SET employment_status = $1, termination_date = $2, updated_at = NOW()
		WHERE id = $3
	`
	res, err := r.db.ExecContext(ctx, query, status, terminationDate, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// ─── Sub-resources ───────────────────────────────────────────────────────────

func (r *repository) GetContacts(ctx context.Context, employeeID string) ([]Contact, error) {
	query := `
		SELECT id, employee_id, contact_type, contact_value, is_primary, created_at
		FROM employee_contacts
		WHERE employee_id = $1
		ORDER BY is_primary DESC, created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Contact
	for rows.Next() {
		var c Contact
		if err := rows.Scan(&c.ID, &c.EmployeeID, &c.ContactType, &c.ContactValue, &c.IsPrimary, &c.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (r *repository) AddContact(ctx context.Context, c *Contact) error {
	query := `
		INSERT INTO employee_contacts (employee_id, contact_type, contact_value, is_primary)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query, c.EmployeeID, c.ContactType, c.ContactValue, c.IsPrimary).
		Scan(&c.ID, &c.CreatedAt)
}

func (r *repository) DeleteContact(ctx context.Context, id string) error {
	query := `DELETE FROM employee_contacts WHERE id = $1`
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

func (r *repository) GetAddresses(ctx context.Context, employeeID string) ([]Address, error) {
	query := `
		SELECT id, employee_id, address_type, street, city, province, postal_code, country, is_primary, created_at
		FROM employee_addresses
		WHERE employee_id = $1
		ORDER BY is_primary DESC, created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Address
	for rows.Next() {
		var a Address
		if err := rows.Scan(&a.ID, &a.EmployeeID, &a.AddressType, &a.Street, &a.City, &a.Province, &a.PostalCode, &a.Country, &a.IsPrimary, &a.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, nil
}

func (r *repository) AddAddress(ctx context.Context, a *Address) error {
	query := `
		INSERT INTO employee_addresses (employee_id, address_type, street, city, province, postal_code, country, is_primary)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query, a.EmployeeID, a.AddressType, a.Street, a.City, a.Province, a.PostalCode, a.Country, a.IsPrimary).
		Scan(&a.ID, &a.CreatedAt)
}

func (r *repository) DeleteAddress(ctx context.Context, id string) error {
	query := `DELETE FROM employee_addresses WHERE id = $1`
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

func (r *repository) GetEmergencyContacts(ctx context.Context, employeeID string) ([]EmergencyContact, error) {
	query := `
		SELECT id, employee_id, name, relationship, phone_number, address, created_at
		FROM employee_emergency_contacts
		WHERE employee_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []EmergencyContact
	for rows.Next() {
		var ec EmergencyContact
		if err := rows.Scan(&ec.ID, &ec.EmployeeID, &ec.Name, &ec.Relationship, &ec.PhoneNumber, &ec.Address, &ec.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, ec)
	}
	return list, nil
}

func (r *repository) AddEmergencyContact(ctx context.Context, ec *EmergencyContact) error {
	query := `
		INSERT INTO employee_emergency_contacts (employee_id, name, relationship, phone_number, address)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query, ec.EmployeeID, ec.Name, ec.Relationship, ec.PhoneNumber, ec.Address).
		Scan(&ec.ID, &ec.CreatedAt)
}

func (r *repository) DeleteEmergencyContact(ctx context.Context, id string) error {
	query := `DELETE FROM employee_emergency_contacts WHERE id = $1`
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

func (r *repository) GetBankAccounts(ctx context.Context, employeeID string) ([]BankAccount, error) {
	query := `
		SELECT id, employee_id, bank_name, account_number, account_holder, is_primary, created_at
		FROM employee_bank_accounts
		WHERE employee_id = $1
		ORDER BY is_primary DESC, created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []BankAccount
	for rows.Next() {
		var ba BankAccount
		if err := rows.Scan(&ba.ID, &ba.EmployeeID, &ba.BankName, &ba.AccountNumber, &ba.AccountHolder, &ba.IsPrimary, &ba.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, ba)
	}
	return list, nil
}

func (r *repository) AddBankAccount(ctx context.Context, ba *BankAccount) error {
	query := `
		INSERT INTO employee_bank_accounts (employee_id, bank_name, account_number, account_holder, is_primary)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	return r.db.QueryRowContext(ctx, query, ba.EmployeeID, ba.BankName, ba.AccountNumber, ba.AccountHolder, ba.IsPrimary).
		Scan(&ba.ID, &ba.CreatedAt)
}

func (r *repository) DeleteBankAccount(ctx context.Context, id string) error {
	query := `DELETE FROM employee_bank_accounts WHERE id = $1`
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

// ─── Employment History ─────────────────────────────────────────────────────

func (r *repository) GetEmploymentHistories(ctx context.Context, employeeID string) ([]EmploymentHistory, error) {
	query := `
		SELECT h.id, h.employee_id, h.department_id, d.name AS department_name,
		       h.position_id, p.title AS position_title, h.manager_id,
		       CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) AS manager_name,
		       TO_CHAR(h.effective_from, 'YYYY-MM-DD'), TO_CHAR(h.effective_until, 'YYYY-MM-DD'),
		       h.change_reason, h.created_at
		FROM employee_employment_histories h
		LEFT JOIN departments d ON h.department_id = d.id
		LEFT JOIN positions p ON h.position_id = p.id
		LEFT JOIN employees m ON h.manager_id = m.id
		WHERE h.employee_id = $1
		ORDER BY h.effective_from DESC, h.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []EmploymentHistory
	for rows.Next() {
		var h EmploymentHistory
		var mgrName sql.NullString
		if err := rows.Scan(
			&h.ID, &h.EmployeeID, &h.DepartmentID, &h.DepartmentName,
			&h.PositionID, &h.PositionTitle, &h.ManagerID, &mgrName,
			&h.EffectiveFrom, &h.EffectiveUntil, &h.ChangeReason, &h.CreatedAt,
		); err != nil {
			return nil, err
		}
		if mgrName.Valid && strings.TrimSpace(mgrName.String) != "" {
			trimmed := strings.TrimSpace(mgrName.String)
			h.ManagerName = &trimmed
		}
		list = append(list, h)
	}
	return list, nil
}

func (r *repository) AddEmploymentHistory(ctx context.Context, tx *sql.Tx, eh *EmploymentHistory) error {
	query := `
		INSERT INTO employee_employment_histories (employee_id, department_id, position_id, manager_id, effective_from, effective_until, change_reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`
	var row *sql.Row
	if tx != nil {
		row = tx.QueryRowContext(ctx, query, eh.EmployeeID, eh.DepartmentID, eh.PositionID, eh.ManagerID, eh.EffectiveFrom, eh.EffectiveUntil, eh.ChangeReason)
	} else {
		row = r.db.QueryRowContext(ctx, query, eh.EmployeeID, eh.DepartmentID, eh.PositionID, eh.ManagerID, eh.EffectiveFrom, eh.EffectiveUntil, eh.ChangeReason)
	}
	return row.Scan(&eh.ID, &eh.CreatedAt)
}

func (r *repository) ClosePreviousEmploymentHistory(ctx context.Context, tx *sql.Tx, employeeID string, untilDate string) error {
	query := `
		UPDATE employee_employment_histories
		SET effective_until = $1
		WHERE employee_id = $2 AND effective_until IS NULL
	`
	var err error
	if tx != nil {
		_, err = tx.ExecContext(ctx, query, untilDate, employeeID)
	} else {
		_, err = r.db.ExecContext(ctx, query, untilDate, employeeID)
	}
	return err
}

