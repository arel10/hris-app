//go:build ignore

// seed.go seeds the database with initial roles, permissions, and a default super admin user.
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

// ─── Role → Permission mapping ────────────────────────────────────────────────

var rolePermissions = map[string][]string{
	"super_admin": nil, // all — handled specially
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
		"attendance.read",
		"leaves.read",
		"documents.read",
	},
	"manager": {
		"employees.read",
		"attendance.read",
		"leaves.approve",
		"performance.evaluate",
	},
	"employee": {
		"employees.read",
		"attendance.read",
		"leaves.create", "leaves.read",
		"payroll.read",
	},
	"payroll_staff": {
		"payroll.read", "payroll.process",
		"employees.read",
	},
}

// ─── Seeder ──────────────────────────────────────────────────────────────────

func seed(ctx context.Context, db *sql.DB) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	// 1. Insert permissions
	permIDs := make(map[string]string) // name -> id
	for _, p := range allPermissions {
		id := uuid.New().String()
		_, err = tx.ExecContext(ctx, `
			INSERT INTO permissions (id, name, module, action)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (name) DO UPDATE SET module = EXCLUDED.module, action = EXCLUDED.action
			RETURNING id`,
			id, p.Name, p.Module, p.Action,
		)
		if err != nil {
			return fmt.Errorf("insert permission %s: %w", p.Name, err)
		}
		// Fetch actual id (may differ if row existed)
		row := tx.QueryRowContext(ctx, `SELECT id FROM permissions WHERE name = $1`, p.Name)
		if err = row.Scan(&id); err != nil {
			return fmt.Errorf("fetch permission id %s: %w", p.Name, err)
		}
		permIDs[p.Name] = id
	}
	fmt.Printf("  → %d permissions upserted\n", len(permIDs))

	// Build all-permission names list
	allPermNames := make([]string, 0, len(allPermissions))
	for _, p := range allPermissions {
		allPermNames = append(allPermNames, p.Name)
	}

	// 2. Insert roles
	roleNames := []string{"super_admin", "hr_admin", "hr_staff", "manager", "employee", "payroll_staff"}
	roleIDs := make(map[string]string) // name -> id

	for _, name := range roleNames {
		id := uuid.New().String()
		_, err = tx.ExecContext(ctx, `
			INSERT INTO roles (id, name)
			VALUES ($1, $2)
			ON CONFLICT (name) DO NOTHING`,
			id, name,
		)
		if err != nil {
			return fmt.Errorf("insert role %s: %w", name, err)
		}
		row := tx.QueryRowContext(ctx, `SELECT id FROM roles WHERE name = $1`, name)
		if err = row.Scan(&id); err != nil {
			return fmt.Errorf("fetch role id %s: %w", name, err)
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

	adminID := uuid.New().String()
	_, err = tx.ExecContext(ctx, `
		INSERT INTO users (id, email, password_hash, is_active)
		VALUES ($1, $2, $3, TRUE)
		ON CONFLICT (email) DO NOTHING`,
		adminID, adminEmail, string(hash),
	)
	if err != nil {
		return fmt.Errorf("insert admin user: %w", err)
	}

	// Fetch the user id (may already exist)
	row := tx.QueryRowContext(ctx, `SELECT id FROM users WHERE email = $1`, adminEmail)
	if err = row.Scan(&adminID); err != nil {
		return fmt.Errorf("fetch admin user id: %w", err)
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

	return tx.Commit()
}

