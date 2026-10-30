package employee_test

import (
	"context"
	"database/sql"
	"testing"

	"github.com/peoplecore/hris/internal/module/employee"
	"github.com/peoplecore/hris/internal/platform/apperrors"
	"github.com/peoplecore/hris/internal/platform/pagination"
)

type mockEmpRepo struct {
	employees   map[string]*employee.Employee
	contacts    map[string][]employee.Contact
	addresses   map[string][]employee.Address
	banks       map[string][]employee.BankAccount
	histories   map[string][]employee.EmploymentHistory
	latestEmpNo string
}

func newMockEmpRepo() *mockEmpRepo {
	return &mockEmpRepo{
		employees: make(map[string]*employee.Employee),
		contacts:  make(map[string][]employee.Contact),
		addresses: make(map[string][]employee.Address),
		banks:     make(map[string][]employee.BankAccount),
		histories: make(map[string][]employee.EmploymentHistory),
	}
}

func (m *mockEmpRepo) ListEmployees(_ context.Context, _ pagination.Params, _, _ string) ([]employee.Employee, int, error) {
	var list []employee.Employee
	for _, e := range m.employees {
		list = append(list, *e)
	}
	return list, len(list), nil
}

func (m *mockEmpRepo) GetEmployeeByID(_ context.Context, id string) (*employee.Employee, error) {
	if e, ok := m.employees[id]; ok {
		return e, nil
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockEmpRepo) GetEmployeeByUserID(_ context.Context, userID string) (*employee.Employee, error) {
	for _, e := range m.employees {
		if e.UserID != nil && *e.UserID == userID {
			return e, nil
		}
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockEmpRepo) GetLatestEmployeeNumber(_ context.Context, _ string) (string, error) {
	return m.latestEmpNo, nil
}

func (m *mockEmpRepo) CreateEmployee(_ context.Context, _ *sql.Tx, e *employee.Employee) error {
	e.ID = "emp-001"
	m.employees[e.ID] = e
	return nil
}

func (m *mockEmpRepo) UpdateEmployee(_ context.Context, _ *sql.Tx, e *employee.Employee) error {
	m.employees[e.ID] = e
	return nil
}

func (m *mockEmpRepo) UpdateStatus(_ context.Context, id string, status string, terminationDate *string) error {
	if e, ok := m.employees[id]; ok {
		e.EmploymentStatus = status
		e.TerminationDate = terminationDate
		return nil
	}
	return apperrors.ErrNotFound
}

func (m *mockEmpRepo) GetContacts(_ context.Context, employeeID string) ([]employee.Contact, error) {
	return m.contacts[employeeID], nil
}

func (m *mockEmpRepo) AddContact(_ context.Context, c *employee.Contact) error {
	c.ID = "cnt-01"
	m.contacts[c.EmployeeID] = append(m.contacts[c.EmployeeID], *c)
	return nil
}

func (m *mockEmpRepo) DeleteContact(_ context.Context, id string) error {
	return nil
}

func (m *mockEmpRepo) GetAddresses(_ context.Context, employeeID string) ([]employee.Address, error) {
	return m.addresses[employeeID], nil
}

func (m *mockEmpRepo) AddAddress(_ context.Context, a *employee.Address) error {
	a.ID = "addr-01"
	m.addresses[a.EmployeeID] = append(m.addresses[a.EmployeeID], *a)
	return nil
}

func (m *mockEmpRepo) DeleteAddress(_ context.Context, id string) error {
	return nil
}

func (m *mockEmpRepo) GetEmergencyContacts(_ context.Context, employeeID string) ([]employee.EmergencyContact, error) {
	return nil, nil
}

func (m *mockEmpRepo) AddEmergencyContact(_ context.Context, ec *employee.EmergencyContact) error {
	ec.ID = "emg-01"
	return nil
}

func (m *mockEmpRepo) DeleteEmergencyContact(_ context.Context, id string) error {
	return nil
}

func (m *mockEmpRepo) GetBankAccounts(_ context.Context, employeeID string) ([]employee.BankAccount, error) {
	return m.banks[employeeID], nil
}

func (m *mockEmpRepo) AddBankAccount(_ context.Context, ba *employee.BankAccount) error {
	ba.ID = "bank-01"
	m.banks[ba.EmployeeID] = append(m.banks[ba.EmployeeID], *ba)
	return nil
}

func (m *mockEmpRepo) DeleteBankAccount(_ context.Context, id string) error {
	return nil
}

func (m *mockEmpRepo) GetEmploymentHistories(_ context.Context, employeeID string) ([]employee.EmploymentHistory, error) {
	return m.histories[employeeID], nil
}

func (m *mockEmpRepo) AddEmploymentHistory(_ context.Context, _ *sql.Tx, eh *employee.EmploymentHistory) error {
	eh.ID = "hist-01"
	m.histories[eh.EmployeeID] = append(m.histories[eh.EmployeeID], *eh)
	return nil
}

func (m *mockEmpRepo) ClosePreviousEmploymentHistory(_ context.Context, _ *sql.Tx, employeeID string, untilDate string) error {
	return nil
}

func TestEmployeeService_UpdateStatus(t *testing.T) {
	repo := newMockEmpRepo()
	svc := employee.NewService(repo, nil)

	repo.employees["emp-1"] = &employee.Employee{
		ID:               "emp-1",
		FirstName:        "Jane",
		EmploymentStatus: "active",
	}

	termDate := "2026-10-31"
	err := svc.UpdateStatus(context.Background(), "emp-1", employee.UpdateStatusRequest{
		Status:          "terminated",
		TerminationDate: &termDate,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	updated := repo.employees["emp-1"]
	if updated.EmploymentStatus != "terminated" {
		t.Errorf("expected status terminated, got %s", updated.EmploymentStatus)
	}
	if updated.TerminationDate == nil || *updated.TerminationDate != termDate {
		t.Errorf("expected termination date %s, got %v", termDate, updated.TerminationDate)
	}
}

func TestEmployeeService_Subresources(t *testing.T) {
	repo := newMockEmpRepo()
	svc := employee.NewService(repo, nil)

	contact, err := svc.AddContact(context.Background(), "emp-1", employee.UpsertContactRequest{
		ContactType:  "personal_phone",
		ContactValue: "+62812345678",
		IsPrimary:    true,
	})
	if err != nil {
		t.Fatalf("failed to add contact: %v", err)
	}
	if contact.ContactValue != "+62812345678" {
		t.Errorf("unexpected contact: %+v", contact)
	}

	bank, err := svc.AddBankAccount(context.Background(), "emp-1", employee.CreateBankAccountRequest{
		BankName:      "BCA",
		AccountNumber: "1234567890",
		AccountHolder: "Jane Doe",
		IsPrimary:     true,
	})
	if err != nil {
		t.Fatalf("failed to add bank: %v", err)
	}
	if bank.AccountNumber != "1234567890" {
		t.Errorf("unexpected bank: %+v", bank)
	}
}

