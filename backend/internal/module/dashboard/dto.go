package dashboard

type SummaryResponse struct {
	TotalEmployees    int `json:"total_employees"`
	ActiveEmployees   int `json:"active_employees"`
	InactiveEmployees int `json:"inactive_employees"`
	ProbationEmployees int `json:"probation_employees"`
	TotalDepartments  int `json:"total_departments"`
	TotalPositions    int `json:"total_positions"`
	RecentEmployees   []RecentEmployee `json:"recent_employees"`
}

type RecentEmployee struct {
	ID             string  `json:"id"`
	EmployeeNumber string  `json:"employee_number"`
	FullName       string  `json:"full_name"`
	Email          string  `json:"email"`
	DepartmentName *string `json:"department_name,omitempty"`
	PositionTitle  *string `json:"position_title,omitempty"`
	JoinDate       string  `json:"join_date"`
}

