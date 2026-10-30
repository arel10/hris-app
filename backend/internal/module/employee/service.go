package employee

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/peoplecore/hris/internal/database"
	"github.com/peoplecore/hris/internal/platform/apperrors"
	"github.com/peoplecore/hris/internal/platform/pagination"
	"golang.org/x/crypto/bcrypt"
)

type Service interface {
	ListEmployees(ctx context.Context, p pagination.Params, departmentID string, status string) ([]Employee, int, error)
	GetEmployee(ctx context.Context, id string) (*Employee, error)
	GetMyProfile(ctx context.Context, userID string) (*Employee, error)
	CreateEmployee(ctx context.Context, req CreateEmployeeRequest) (*Employee, error)
	UpdateEmployee(ctx context.Context, id string, req UpdateEmployeeRequest) (*Employee, error)
	UpdateStatus(ctx context.Context, id string, req UpdateStatusRequest) error

	// Sub-resources
	GetContacts(ctx context.Context, employeeID string) ([]Contact, error)
	AddContact(ctx context.Context, employeeID string, req UpsertContactRequest) (*Contact, error)
	DeleteContact(ctx context.Context, id string) error

	GetAddresses(ctx context.Context, employeeID string) ([]Address, error)
	AddAddress(ctx context.Context, employeeID string, req UpsertAddressRequest) (*Address, error)
	DeleteAddress(ctx context.Context, id string) error

	GetEmergencyContacts(ctx context.Context, employeeID string) ([]EmergencyContact, error)
	AddEmergencyContact(ctx context.Context, employeeID string, req CreateEmergencyContactRequest) (*EmergencyContact, error)
	DeleteEmergencyContact(ctx context.Context, id string) error

	GetBankAccounts(ctx context.Context, employeeID string) ([]BankAccount, error)
	AddBankAccount(ctx context.Context, employeeID string, req CreateBankAccountRequest) (*BankAccount, error)
	DeleteBankAccount(ctx context.Context, id string) error

	GetEmploymentHistories(ctx context.Context, employeeID string) ([]EmploymentHistory, error)
}

type service struct {
	repo Repository
	db   *sql.DB
}

func NewService(repo Repository, db *sql.DB) Service {
	return &service{repo: repo, db: db}
}

func (s *service) ListEmployees(ctx context.Context, p pagination.Params, departmentID string, status string) ([]Employee, int, error) {
	return s.repo.ListEmployees(ctx, p, departmentID, status)
}

func (s *service) GetEmployee(ctx context.Context, id string) (*Employee, error) {
	e, err := s.repo.GetEmployeeByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Fetch sub-resources
	contacts, _ := s.repo.GetContacts(ctx, id)
	addresses, _ := s.repo.GetAddresses(ctx, id)
	emergencies, _ := s.repo.GetEmergencyContacts(ctx, id)
	banks, _ := s.repo.GetBankAccounts(ctx, id)

	e.Contacts = contacts
	e.Addresses = addresses
	e.EmergencyContacts = emergencies
	e.BankAccounts = banks

	return e, nil
}

func (s *service) GetMyProfile(ctx context.Context, userID string) (*Employee, error) {
	e, err := s.repo.GetEmployeeByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return s.GetEmployee(ctx, e.ID)
}

func (s *service) CreateEmployee(ctx context.Context, req CreateEmployeeRequest) (*Employee, error) {
	// Generate Employee Number if not provided
	empNumber := ""
	if req.EmployeeNumber != nil && *req.EmployeeNumber != "" {
		empNumber = *req.EmployeeNumber
	} else {
		prefix := fmt.Sprintf("EMP-%s-", time.Now().Format("200601"))
		latest, err := s.repo.GetLatestEmployeeNumber(ctx, prefix)
		if err != nil {
			return nil, fmt.Errorf("generate employee number: %w", err)
		}
		nextSeq := 1
		if latest != "" {
			parts := strings.Split(latest, "-")
			if len(parts) == 3 {
				if seq, err := strconv.Atoi(parts[2]); err == nil {
					nextSeq = seq + 1
				}
			}
		}
		empNumber = fmt.Sprintf("%s%04d", prefix, nextSeq)
	}

	empStatus := "active"
	if req.EmploymentStatus != "" {
		empStatus = req.EmploymentStatus
	}

	var createdEmp *Employee

	err := database.WithTransaction(ctx, s.db, func(tx *sql.Tx) error {
		var userID *string

		// Optionally create user account for login
		if req.CreateUserAccount {
			defaultPass := "Welcome@123"
			if req.UserPassword != nil && *req.UserPassword != "" {
				defaultPass = *req.UserPassword
			}
			hash, err := bcrypt.GenerateFromPassword([]byte(defaultPass), bcrypt.DefaultCost)
			if err != nil {
				return fmt.Errorf("hash password: %w", err)
			}

			var newUserID string
			userQuery := `
				INSERT INTO users (email, password_hash, is_active)
				VALUES ($1, $2, TRUE)
				RETURNING id
			`
			if err := tx.QueryRowContext(ctx, userQuery, req.Email, string(hash)).Scan(&newUserID); err != nil {
				if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "duplicate key") {
					return apperrors.New("EMAIL_ALREADY_EXISTS", "A user with this email already exists", 409)
				}
				return fmt.Errorf("create user: %w", err)
			}
			userID = &newUserID

			// Assign role: use req.RoleID or fallback to 'employee' role
			var roleID string
			if req.RoleID != nil && *req.RoleID != "" {
				roleID = *req.RoleID
			} else {
				roleQuery := `SELECT id FROM roles WHERE name = 'employee' LIMIT 1`
				_ = tx.QueryRowContext(ctx, roleQuery).Scan(&roleID)
			}

			if roleID != "" {
				assignQuery := `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
				if _, err := tx.ExecContext(ctx, assignQuery, newUserID, roleID); err != nil {
					return fmt.Errorf("assign role: %w", err)
				}
			}
		}

		emp := &Employee{
			UserID:           userID,
			EmployeeNumber:   empNumber,
			FirstName:        req.FirstName,
			LastName:         req.LastName,
			Email:            req.Email,
			Phone:            req.Phone,
			Gender:           req.Gender,
			BirthDate:        req.BirthDate,
			BirthPlace:       req.BirthPlace,
			NationalID:       req.NationalID,
			MaritalStatus:    req.MaritalStatus,
			EmploymentType:   req.EmploymentType,
			EmploymentStatus: empStatus,
			DepartmentID:     req.DepartmentID,
			PositionID:       req.PositionID,
			ManagerID:        req.ManagerID,
			JoinDate:         req.JoinDate,
		}

		if err := s.repo.CreateEmployee(ctx, tx, emp); err != nil {
			if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "duplicate key") {
				return apperrors.New("DUPLICATE_ENTRY", "Employee number or email already in use", 409)
			}
			return fmt.Errorf("insert employee: %w", err)
		}

		// Insert initial employment history
		initialReason := "Initial Hire"
		hist := &EmploymentHistory{
			EmployeeID:    emp.ID,
			DepartmentID:  emp.DepartmentID,
			PositionID:    emp.PositionID,
			ManagerID:     emp.ManagerID,
			EffectiveFrom: emp.JoinDate,
			ChangeReason:  &initialReason,
		}
		if err := s.repo.AddEmploymentHistory(ctx, tx, hist); err != nil {
			return fmt.Errorf("insert initial employment history: %w", err)
		}

		createdEmp = emp
		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetEmployee(ctx, createdEmp.ID)
}

func (s *service) UpdateEmployee(ctx context.Context, id string, req UpdateEmployeeRequest) (*Employee, error) {
	current, err := s.repo.GetEmployeeByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if organizational placement changed
	deptChanged := req.DepartmentID != nil && (current.DepartmentID == nil || *req.DepartmentID != *current.DepartmentID)
	posChanged := req.PositionID != nil && (current.PositionID == nil || *req.PositionID != *current.PositionID)
	mgrChanged := req.ManagerID != nil && (current.ManagerID == nil || *req.ManagerID != *current.ManagerID)

	placementChanged := deptChanged || posChanged || mgrChanged

	err = database.WithTransaction(ctx, s.db, func(tx *sql.Tx) error {
		if req.FirstName != nil {
			current.FirstName = *req.FirstName
		}
		if req.LastName != nil {
			current.LastName = req.LastName
		}
		if req.Phone != nil {
			current.Phone = req.Phone
		}
		if req.Gender != nil {
			current.Gender = req.Gender
		}
		if req.BirthDate != nil {
			current.BirthDate = req.BirthDate
		}
		if req.BirthPlace != nil {
			current.BirthPlace = req.BirthPlace
		}
		if req.NationalID != nil {
			current.NationalID = req.NationalID
		}
		if req.MaritalStatus != nil {
			current.MaritalStatus = req.MaritalStatus
		}
		if req.EmploymentType != nil {
			current.EmploymentType = *req.EmploymentType
		}
		if req.DepartmentID != nil {
			current.DepartmentID = req.DepartmentID
		}
		if req.PositionID != nil {
			current.PositionID = req.PositionID
		}
		if req.ManagerID != nil {
			current.ManagerID = req.ManagerID
		}
		if req.JoinDate != nil {
			current.JoinDate = *req.JoinDate
		}
		if req.TerminationDate != nil {
			current.TerminationDate = req.TerminationDate
		}

		if err := s.repo.UpdateEmployee(ctx, tx, current); err != nil {
			return fmt.Errorf("update employee: %w", err)
		}

		// If position/dept changed, close old history and create new history record
		if placementChanged {
			today := time.Now().Format("2006-01-02")
			_ = s.repo.ClosePreviousEmploymentHistory(ctx, tx, id, today)

			reason := "Position/Department Update"
			if req.ChangeReason != nil && *req.ChangeReason != "" {
				reason = *req.ChangeReason
			}

			newHist := &EmploymentHistory{
				EmployeeID:    id,
				DepartmentID:  current.DepartmentID,
				PositionID:    current.PositionID,
				ManagerID:     current.ManagerID,
				EffectiveFrom: today,
				ChangeReason:  &reason,
			}
			if err := s.repo.AddEmploymentHistory(ctx, tx, newHist); err != nil {
				return fmt.Errorf("insert new employment history: %w", err)
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetEmployee(ctx, id)
}

func (s *service) UpdateStatus(ctx context.Context, id string, req UpdateStatusRequest) error {
	_, err := s.repo.GetEmployeeByID(ctx, id)
	if err != nil {
		return err
	}

	var termDate *string
	if req.Status == "terminated" || req.Status == "resigned" {
		if req.TerminationDate != nil && *req.TerminationDate != "" {
			termDate = req.TerminationDate
		} else {
			today := time.Now().Format("2006-01-02")
			termDate = &today
		}
	}

	return s.repo.UpdateStatus(ctx, id, req.Status, termDate)
}

// ─── Sub-resources ───────────────────────────────────────────────────────────

func (s *service) GetContacts(ctx context.Context, employeeID string) ([]Contact, error) {
	return s.repo.GetContacts(ctx, employeeID)
}

func (s *service) AddContact(ctx context.Context, employeeID string, req UpsertContactRequest) (*Contact, error) {
	c := &Contact{
		EmployeeID:   employeeID,
		ContactType:  req.ContactType,
		ContactValue: req.ContactValue,
		IsPrimary:    req.IsPrimary,
	}
	if err := s.repo.AddContact(ctx, c); err != nil {
		return nil, fmt.Errorf("add contact: %w", err)
	}
	return c, nil
}

func (s *service) DeleteContact(ctx context.Context, id string) error {
	return s.repo.DeleteContact(ctx, id)
}

func (s *service) GetAddresses(ctx context.Context, employeeID string) ([]Address, error) {
	return s.repo.GetAddresses(ctx, employeeID)
}

func (s *service) AddAddress(ctx context.Context, employeeID string, req UpsertAddressRequest) (*Address, error) {
	a := &Address{
		EmployeeID:  employeeID,
		AddressType: req.AddressType,
		Street:      req.Street,
		City:        req.City,
		Province:    req.Province,
		PostalCode:  req.PostalCode,
		Country:     req.Country,
		IsPrimary:   req.IsPrimary,
	}
	if err := s.repo.AddAddress(ctx, a); err != nil {
		return nil, fmt.Errorf("add address: %w", err)
	}
	return a, nil
}

func (s *service) DeleteAddress(ctx context.Context, id string) error {
	return s.repo.DeleteAddress(ctx, id)
}

func (s *service) GetEmergencyContacts(ctx context.Context, employeeID string) ([]EmergencyContact, error) {
	return s.repo.GetEmergencyContacts(ctx, employeeID)
}

func (s *service) AddEmergencyContact(ctx context.Context, employeeID string, req CreateEmergencyContactRequest) (*EmergencyContact, error) {
	ec := &EmergencyContact{
		EmployeeID:   employeeID,
		Name:         req.Name,
		Relationship: req.Relationship,
		PhoneNumber:  req.PhoneNumber,
		Address:      req.Address,
	}
	if err := s.repo.AddEmergencyContact(ctx, ec); err != nil {
		return nil, fmt.Errorf("add emergency contact: %w", err)
	}
	return ec, nil
}

func (s *service) DeleteEmergencyContact(ctx context.Context, id string) error {
	return s.repo.DeleteEmergencyContact(ctx, id)
}

func (s *service) GetBankAccounts(ctx context.Context, employeeID string) ([]BankAccount, error) {
	return s.repo.GetBankAccounts(ctx, employeeID)
}

func (s *service) AddBankAccount(ctx context.Context, employeeID string, req CreateBankAccountRequest) (*BankAccount, error) {
	ba := &BankAccount{
		EmployeeID:    employeeID,
		BankName:      req.BankName,
		AccountNumber: req.AccountNumber,
		AccountHolder: req.AccountHolder,
		IsPrimary:     req.IsPrimary,
	}
	if err := s.repo.AddBankAccount(ctx, ba); err != nil {
		return nil, fmt.Errorf("add bank account: %w", err)
	}
	return ba, nil
}

func (s *service) DeleteBankAccount(ctx context.Context, id string) error {
	return s.repo.DeleteBankAccount(ctx, id)
}

func (s *service) GetEmploymentHistories(ctx context.Context, employeeID string) ([]EmploymentHistory, error) {
	return s.repo.GetEmploymentHistories(ctx, employeeID)
}

