//go:build ignore

// seed.go seeds the database with initial roles, permissions, a default super admin user,
// initial organization hierarchy, and the admin employee profile.
// Run manually: go run scripts/seed.go
package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	ctx := context.Background()

	if err := seed(ctx, db); err != nil {
		log.Fatalf("seeding failed: %v", err)
	}

	fmt.Println("✅ Seeding completed successfully")
}

// ─── Permission definitions ───────────────────────────────────────────────────

type permDef struct {
	Name   string
	Module string
	Action string
}

var allPermissions = []permDef{
	// employees
	{Name: "employees.create", Module: "employees", Action: "create"},
	{Name: "employees.read", Module: "employees", Action: "read"},
	{Name: "employees.update", Module: "employees", Action: "update"},
	{Name: "employees.delete", Module: "employees", Action: "delete"},
	// organization
	{Name: "organization.create", Module: "organization", Action: "create"},
	{Name: "organization.read", Module: "organization", Action: "read"},
	{Name: "organization.update", Module: "organization", Action: "update"},
	{Name: "organization.delete", Module: "organization", Action: "delete"},
	// attendance
	{Name: "attendance.read", Module: "attendance", Action: "read"},
	{Name: "attendance.correct", Module: "attendance", Action: "correct"},
	// leaves
	{Name: "leaves.create", Module: "leaves", Action: "create"},
	{Name: "leaves.read", Module: "leaves", Action: "read"},
	{Name: "leaves.approve", Module: "leaves", Action: "approve"},
	// payroll
	{Name: "payroll.read", Module: "payroll", Action: "read"},
	{Name: "payroll.process", Module: "payroll", Action: "process"},
	{Name: "payroll.approve", Module: "payroll", Action: "approve"},
	// contracts
	{Name: "contracts.read", Module: "contracts", Action: "read"},
	{Name: "contracts.create", Module: "contracts", Action: "create"},
	{Name: "contracts.update", Module: "contracts", Action: "update"},
	// performance
	{Name: "performance.read", Module: "performance", Action: "read"},
	{Name: "performance.evaluate", Module: "performance", Action: "evaluate"},
	// recruitment
	{Name: "recruitment.read", Module: "recruitment", Action: "read"},
	{Name: "recruitment.manage", Module: "recruitment", Action: "manage"},
	// training
	{Name: "training.read", Module: "training", Action: "read"},
	{Name: "training.manage", Module: "training", Action: "manage"},
	// documents
	{Name: "documents.read", Module: "documents", Action: "read"},
	{Name: "documents.upload", Module: "documents", Action: "upload"},
	// reports
	{Name: "reports.read", Module: "reports", Action: "read"},
	// audit
	{Name: "audit.read", Module: "audit", Action: "read"},
	// roles
	{Name: "roles.manage", Module: "roles", Action: "manage"},
	// users
	{Name: "users.manage", Module: "users", Action: "manage"},
}

// Roles and their descriptions
var roles = map[string]string{
	"super_admin":   "Full system access and administration",
	"hr_admin":      "HR operational and administration management",
	"hr_staff":      "HR staff with day-to-day access",
	"manager":       "Department and team manager",
	"employee":      "Regular employee access",
	"payroll_staff": "Payroll processor and compensation staff",
}

var rolePermissions = map[string][]string{
	"hr_admin": {
		"employees.create", "employees.read", "employees.update", "employees.delete",
		"organization.create", "organization.read", "organization.update", "organization.delete",
		"attendance.read", "attendance.correct",
		"leaves.create", "leaves.read", "leaves.approve",
		"payroll.read", "payroll.process", "payroll.approve",
		"contracts.read", "contracts.create", "contracts.update",
		"performance.read", "performance.evaluate",
		"recruitment.read", "recruitment.manage",
		"training.read", "training.manage",
		"documents.read", "documents.upload",
		"reports.read",
		"users.manage",
	},
	"hr_staff": {
		"employees.read", "employees.update",
		"organization.read",
		"attendance.read",
		"leaves.read",
		"documents.read",
		"training.read",
	},
	"manager": {
		"employees.read",
		"organization.read",
		"attendance.read",
		"leaves.read", "leaves.approve",
		"performance.read", "performance.evaluate",
		"training.read",
	},
	"employee": {
		"employees.read",
		"attendance.read",
		"leaves.create", "leaves.read",
		"contracts.read",
		"documents.read",
		"training.read",
	},
	"payroll_staff": {
		"payroll.read", "payroll.process",
		"employees.read",
		"reports.read",
	},
}

func seed(ctx context.Context, db *sql.DB) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	fmt.Println("Seeding PeopleCore HRIS...")

	// 1. Insert permissions
	permIDs := make(map[string]string)
	allPermNames := make([]string, 0, len(allPermissions))

	for _, p := range allPermissions {
		allPermNames = append(allPermNames, p.Name)
		var id string
		err := tx.QueryRowContext(ctx, `
			INSERT INTO permissions (id, name, module, action, description)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (name) DO UPDATE SET module = EXCLUDED.module, action = EXCLUDED.action
			RETURNING id`,
			uuid.New().String(), p.Name, p.Module, p.Action, fmt.Sprintf("%s on %s", p.Action, p.Module),
		).Scan(&id)
		if err != nil {
			return fmt.Errorf("insert permission %s: %w", p.Name, err)
		}
		permIDs[p.Name] = id
	}
	fmt.Printf("  → %d permissions upserted\n", len(permIDs))

	// 2. Insert roles
	roleIDs := make(map[string]string)
	for name, desc := range roles {
		var id string
		err := tx.QueryRowContext(ctx, `
			INSERT INTO roles (id, name, description)
			VALUES ($1, $2, $3)
			ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
			RETURNING id`,
			uuid.New().String(), name, desc,
		).Scan(&id)
		if err != nil {
			return fmt.Errorf("insert role %s: %w", name, err)
		}
		roleIDs[name] = id
	}
	fmt.Printf("  → %d roles upserted\n", len(roleIDs))

	// 3. Assign permissions to roles
	for roleName, perms := range rolePermissions {
		assigned := perms
		if roleName == "super_admin" {
			assigned = allPermNames
		}

		for _, permName := range assigned {
			permID, ok := permIDs[permName]
			if !ok {
				return fmt.Errorf("unknown permission: %s", permName)
			}
			_, err = tx.ExecContext(ctx, `
				INSERT INTO role_permissions (id, role_id, permission_id)
				VALUES ($1, $2, $3)
				ON CONFLICT (role_id, permission_id) DO NOTHING`,
				uuid.New().String(), roleIDs[roleName], permID,
			)
			if err != nil {
				return fmt.Errorf("assign permission %s to role %s: %w", permName, roleName, err)
			}
		}
	}
	fmt.Println("  → role permissions assigned")

	// 4. Create default super admin user
	const adminEmail = "admin@peoplecore.local"
	const adminPassword = "Admin@123456"

	hash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	var adminID string
	err = tx.QueryRowContext(ctx, `
		INSERT INTO users (id, email, password_hash, is_active)
		VALUES ($1, $2, $3, TRUE)
		ON CONFLICT (email) DO UPDATE SET is_active = TRUE
		RETURNING id`,
		uuid.New().String(), adminEmail, string(hash),
	).Scan(&adminID)
	if err != nil {
		return fmt.Errorf("upsert admin user: %w", err)
	}

	// Assign super_admin role
	_, err = tx.ExecContext(ctx, `
		INSERT INTO user_roles (id, user_id, role_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, role_id) DO NOTHING`,
		uuid.New().String(), adminID, roleIDs["super_admin"],
	)
	if err != nil {
		return fmt.Errorf("assign super_admin role to admin user: %w", err)
	}
	fmt.Printf("  → admin user created: %s (password: %s)\n", adminEmail, adminPassword)

	// 5. Seed Organization Master Data
	var companyID string
	err = tx.QueryRowContext(ctx, `
		INSERT INTO companies (name, legal_name, tax_number, email, phone, address, is_active)
		VALUES ('PeopleCore Corporation', 'PT PeopleCore Digital Solusindo', '01.234.567.8-901.000', 'info@peoplecore.local', '+62215551234', 'Sudirman Central Business District, Jakarta', TRUE)
		RETURNING id`,
	).Scan(&companyID)
	if err != nil {
		// Try fetching existing
		_ = tx.QueryRowContext(ctx, `SELECT id FROM companies WHERE name = 'PeopleCore Corporation' LIMIT 1`).Scan(&companyID)
	}

	var branchID string
	if companyID != "" {
		_ = tx.QueryRowContext(ctx, `
			INSERT INTO branches (company_id, name, code, address, city, is_active)
			VALUES ($1, 'Jakarta Head Office', 'HQ-JKT', 'SCBD Tower Level 25', 'Jakarta', TRUE)
			ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
			RETURNING id`, companyID,
		).Scan(&branchID)
	}

	// Job Grades
	jobGradeIDs := make(map[string]string)
	grades := []struct {
		Name  string
		Level int
	}{
		{"Executive", 1},
		{"Managerial", 2},
		{"Senior Specialist", 3},
		{"Officer", 4},
	}
	for _, g := range grades {
		var jid string
		_ = tx.QueryRowContext(ctx, `
			INSERT INTO job_grades (name, level)
			VALUES ($1, $2)
			ON CONFLICT (name) DO UPDATE SET level = EXCLUDED.level
			RETURNING id`, g.Name, g.Level,
		).Scan(&jid)
		jobGradeIDs[g.Name] = jid
	}

	// Departments
	deptIDs := make(map[string]string)
	depts := []struct {
		Name string
		Code string
	}{
		{"Human Resources", "HR"},
		{"Technology & Engineering", "TECH"},
		{"Finance & Accounting", "FIN"},
		{"Operations", "OPS"},
	}
	for _, d := range depts {
		var did string
		_ = tx.QueryRowContext(ctx, `
			INSERT INTO departments (company_id, branch_id, name, code, is_active)
			VALUES ($1, $2, $3, $4, TRUE)
			ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
			RETURNING id`, companyID, branchID, d.Name, d.Code,
		).Scan(&did)
		deptIDs[d.Code] = did
	}

	// Positions
	posIDs := make(map[string]string)
	positions := []struct {
		Title    string
		DeptCode string
		Grade    string
	}{
		{"HR Director", "HR", "Executive"},
		{"People Operations Specialist", "HR", "Senior Specialist"},
		{"Chief Technology Officer", "TECH", "Executive"},
		{"Lead Software Engineer", "TECH", "Managerial"},
		{"Software Engineer", "TECH", "Officer"},
		{"Finance Manager", "FIN", "Managerial"},
	}
	for _, p := range positions {
		var pid string
		var dID, gID interface{}
		if val, ok := deptIDs[p.DeptCode]; ok {
			dID = val
		}
		if val, ok := jobGradeIDs[p.Grade]; ok {
			gID = val
		}
		_ = tx.QueryRowContext(ctx, `
			INSERT INTO positions (department_id, job_grade_id, title, is_active)
			VALUES ($1, $2, $3, TRUE)
			RETURNING id`, dID, gID, p.Title,
		).Scan(&pid)
		posIDs[p.Title] = pid
	}
	fmt.Println("  → organization master data (company, branch, departments, positions) seeded")

	// 6. Seed Super Admin Employee Profile
	var empID string
	var hrDeptID, hrDirPosID interface{}
	if val, ok := deptIDs["HR"]; ok {
		hrDeptID = val
	}
	if val, ok := posIDs["HR Director"]; ok {
		hrDirPosID = val
	}

	err = tx.QueryRowContext(ctx, `
		INSERT INTO employees (
			user_id, employee_number, first_name, last_name, email, phone,
			gender, employment_type, employment_status, department_id, position_id, join_date
		) VALUES (
			$1, 'EMP-202601-0001', 'System', 'Administrator', $2, '+6281234567890',
			'male', 'permanent', 'active', $3, $4, '2026-01-01'
		) ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
		RETURNING id`,
		adminID, adminEmail, hrDeptID, hrDirPosID,
	).Scan(&empID)
	if err != nil {
		return fmt.Errorf("create admin employee profile: %w", err)
	}

	// Add primary contact and address for admin employee
	_, _ = tx.ExecContext(ctx, `
		INSERT INTO employee_contacts (employee_id, contact_type, contact_value, is_primary)
		VALUES ($1, 'work_email', $2, TRUE)`,
		empID, adminEmail,
	)
	_, _ = tx.ExecContext(ctx, `
		INSERT INTO employee_addresses (employee_id, address_type, street, city, province, country, is_primary)
		VALUES ($1, 'primary', 'Sudirman Residence No. 1', 'Jakarta', 'DKI Jakarta', 'Indonesia', TRUE)`,
		empID,
	)
	_, _ = tx.ExecContext(ctx, `
		INSERT INTO employee_employment_histories (employee_id, department_id, position_id, effective_from, change_reason)
		VALUES ($1, $2, $3, '2026-01-01', 'Initial Hire - System Administrator')`,
		empID, hrDeptID, hrDirPosID,
	)

	fmt.Printf("  → admin employee profile linked: %s (EMP-202601-0001)\n", adminEmail)

	return tx.Commit()
}
