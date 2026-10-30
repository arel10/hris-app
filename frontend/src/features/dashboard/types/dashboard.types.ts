export interface DashboardSummary {
  total_employees: number
  active_employees: number
  inactive_employees: number
  probation_employees: number
  total_departments: number
  total_positions: number
  recent_employees: RecentEmployeeItem[]
}

export interface RecentEmployeeItem {
  id: string
  employee_number: string
  full_name: string
  email: string
  department_name?: string
  position_title?: string
  join_date: string
}

