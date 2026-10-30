package employee

type CreateEmployeeRequest struct {
	EmployeeNumber   *string `json:"employee_number"` // Optional: auto-generated if empty
	FirstName        string  `json:"first_name" validate:"required"`
	LastName         *string `json:"last_name"`
	Email            string  `json:"email" validate:"required,email"`
	Phone            *string `json:"phone"`
	Gender           *string `json:"gender"`
	BirthDate        *string `json:"birth_date"`
	BirthPlace       *string `json:"birth_place"`
	NationalID       *string `json:"national_id"`
	MaritalStatus    *string `json:"marital_status"`
	EmploymentType   string  `json:"employment_type" validate:"required"`
	EmploymentStatus string  `json:"employment_status"`
	DepartmentID     *string `json:"department_id" validate:"omitempty,uuid"`
	PositionID       *string `json:"position_id" validate:"omitempty,uuid"`
	ManagerID        *string `json:"manager_id" validate:"omitempty,uuid"`
	JoinDate         string  `json:"join_date" validate:"required"`

	// Create user login account optionally
	CreateUserAccount bool    `json:"create_user_account"`
	UserPassword      *string `json:"user_password" validate:"omitempty,min=6"`
	RoleID            *string `json:"role_id" validate:"omitempty,uuid"`
}

type UpdateEmployeeRequest struct {
	FirstName       *string `json:"first_name"`
	LastName        *string `json:"last_name"`
	Phone           *string `json:"phone"`
	Gender          *string `json:"gender"`
	BirthDate       *string `json:"birth_date"`
	BirthPlace      *string `json:"birth_place"`
	NationalID      *string `json:"national_id"`
	MaritalStatus   *string `json:"marital_status"`
	EmploymentType  *string `json:"employment_type"`
	DepartmentID    *string `json:"department_id" validate:"omitempty,uuid"`
	PositionID      *string `json:"position_id" validate:"omitempty,uuid"`
	ManagerID       *string `json:"manager_id" validate:"omitempty,uuid"`
	JoinDate        *string `json:"join_date"`
	TerminationDate *string `json:"termination_date"`
	ChangeReason    *string `json:"change_reason"` // For history tracking
}

type UpdateStatusRequest struct {
	Status          string  `json:"status" validate:"required"`
	TerminationDate *string `json:"termination_date"`
	Reason          *string `json:"reason"`
}

type UpsertContactRequest struct {
	ContactType  string `json:"contact_type" validate:"required"`
	ContactValue string `json:"contact_value" validate:"required"`
	IsPrimary    bool   `json:"is_primary"`
}

type UpsertAddressRequest struct {
	AddressType string  `json:"address_type" validate:"required"`
	Street      string  `json:"street" validate:"required"`
	City        *string `json:"city"`
	Province    *string `json:"province"`
	PostalCode  *string `json:"postal_code"`
	Country     *string `json:"country"`
	IsPrimary   bool    `json:"is_primary"`
}

type CreateEmergencyContactRequest struct {
	Name         string  `json:"name" validate:"required"`
	Relationship string  `json:"relationship" validate:"required"`
	PhoneNumber  string  `json:"phone_number" validate:"required"`
	Address      *string `json:"address"`
}

type CreateBankAccountRequest struct {
	BankName      string `json:"bank_name" validate:"required"`
	AccountNumber string `json:"account_number" validate:"required"`
	AccountHolder string `json:"account_holder" validate:"required"`
	IsPrimary     bool   `json:"is_primary"`
}

