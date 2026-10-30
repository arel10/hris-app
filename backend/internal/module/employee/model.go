package employee

import "time"

type Employee struct {
	ID                string    `json:"id"`
	UserID            *string   `json:"user_id,omitempty"`
	EmployeeNumber    string    `json:"employee_number"`
	FirstName         string    `json:"first_name"`
	LastName          *string   `json:"last_name,omitempty"`
	Email             string    `json:"email"`
	Phone             *string   `json:"phone,omitempty"`
	Gender            *string   `json:"gender,omitempty"`
	BirthDate         *string   `json:"birth_date,omitempty"`
	BirthPlace        *string   `json:"birth_place,omitempty"`
	NationalID        *string   `json:"national_id,omitempty"`
	MaritalStatus     *string   `json:"marital_status,omitempty"`
	EmploymentType    string    `json:"employment_type"`
	EmploymentStatus  string    `json:"employment_status"`
	DepartmentID      *string   `json:"department_id,omitempty"`
	DepartmentName    *string   `json:"department_name,omitempty"`
	PositionID        *string   `json:"position_id,omitempty"`
	PositionTitle     *string   `json:"position_title,omitempty"`
	ManagerID         *string   `json:"manager_id,omitempty"`
	ManagerName       *string   `json:"manager_name,omitempty"`
	JoinDate          string    `json:"join_date"`
	TerminationDate   *string   `json:"termination_date,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`

	// Relational details
	Contacts          []Contact          `json:"contacts,omitempty"`
	Addresses         []Address          `json:"addresses,omitempty"`
	EmergencyContacts []EmergencyContact `json:"emergency_contacts,omitempty"`
	BankAccounts      []BankAccount      `json:"bank_accounts,omitempty"`
}

type Contact struct {
	ID           string    `json:"id"`
	EmployeeID   string    `json:"employee_id"`
	ContactType  string    `json:"contact_type"`
	ContactValue string    `json:"contact_value"`
	IsPrimary    bool      `json:"is_primary"`
	CreatedAt    time.Time `json:"created_at"`
}

type Address struct {
	ID          string    `json:"id"`
	EmployeeID  string    `json:"employee_id"`
	AddressType string    `json:"address_type"`
	Street      string    `json:"street"`
	City        *string   `json:"city,omitempty"`
	Province    *string   `json:"province,omitempty"`
	PostalCode  *string   `json:"postal_code,omitempty"`
	Country     *string   `json:"country,omitempty"`
	IsPrimary   bool      `json:"is_primary"`
	CreatedAt   time.Time `json:"created_at"`
}

type EmergencyContact struct {
	ID           string    `json:"id"`
	EmployeeID   string    `json:"employee_id"`
	Name         string    `json:"name"`
	Relationship string    `json:"relationship"`
	PhoneNumber  string    `json:"phone_number"`
	Address      *string   `json:"address,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type BankAccount struct {
	ID            string    `json:"id"`
	EmployeeID    string    `json:"employee_id"`
	BankName      string    `json:"bank_name"`
	AccountNumber string    `json:"account_number"`
	AccountHolder string    `json:"account_holder"`
	IsPrimary     bool      `json:"is_primary"`
	CreatedAt     time.Time `json:"created_at"`
}

type EmploymentHistory struct {
	ID             string    `json:"id"`
	EmployeeID     string    `json:"employee_id"`
	DepartmentID   *string   `json:"department_id,omitempty"`
	DepartmentName *string   `json:"department_name,omitempty"`
	PositionID     *string   `json:"position_id,omitempty"`
	PositionTitle  *string   `json:"position_title,omitempty"`
	ManagerID      *string   `json:"manager_id,omitempty"`
	ManagerName    *string   `json:"manager_name,omitempty"`
	EffectiveFrom  string    `json:"effective_from"`
	EffectiveUntil *string   `json:"effective_until,omitempty"`
	ChangeReason   *string   `json:"change_reason,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

