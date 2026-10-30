package dashboard

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository interface {
	GetSummary(ctx context.Context) (*SummaryResponse, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetSummary(ctx context.Context) (*SummaryResponse, error) {
	res := &SummaryResponse{}

	// Employee counts
	empCountsQuery := `
		SELECT
			COUNT(*) AS total,
			COUNT(*) FILTER (WHERE employment_status = 'active') AS active,
			COUNT(*) FILTER (WHERE employment_status IN ('inactive', 'terminated', 'resigned')) AS inactive,
			COUNT(*) FILTER (WHERE employment_status = 'probation') AS probation
		FROM employees
	`
	if err := r.db.QueryRowContext(ctx, empCountsQuery).Scan(
		&res.TotalEmployees, &res.ActiveEmployees, &res.InactiveEmployees, &res.ProbationEmployees,
	); err != nil {
		return nil, fmt.Errorf("employee counts: %w", err)
	}

	// Department count
	deptQuery := `SELECT COUNT(*) FROM departments WHERE is_active = TRUE`
	_ = r.db.QueryRowContext(ctx, deptQuery).Scan(&res.TotalDepartments)

	// Position count
	posQuery := `SELECT COUNT(*) FROM positions WHERE is_active = TRUE`
	_ = r.db.QueryRowContext(ctx, posQuery).Scan(&res.TotalPositions)

	// Recent employees
	recentQuery := `
		SELECT e.id, e.employee_number,
		       CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) AS full_name,
		       e.email, d.name AS department_name, p.title AS position_title,
		       TO_CHAR(e.join_date, 'YYYY-MM-DD') AS join_date
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		LEFT JOIN positions p ON e.position_id = p.id
		ORDER BY e.created_at DESC
		LIMIT 5
	`
	rows, err := r.db.QueryContext(ctx, recentQuery)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var re RecentEmployee
			if err := rows.Scan(
				&re.ID, &re.EmployeeNumber, &re.FullName, &re.Email,
				&re.DepartmentName, &re.PositionTitle, &re.JoinDate,
			); err == nil {
				res.RecentEmployees = append(res.RecentEmployees, re)
			}
		}
	}

	if res.RecentEmployees == nil {
		res.RecentEmployees = []RecentEmployee{}
	}

	return res, nil
}

