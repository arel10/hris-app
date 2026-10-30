export interface Company {
  id: string
  name: string
  legal_name?: string
  tax_number?: string
  email?: string
  phone?: string
  address?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  company_id: string
  name: string
  code: string
  address?: string
  city?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  company_id?: string
  branch_id?: string
  parent_department_id?: string
  parent_name?: string
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Division {
  id: string
  department_id: string
  department_name?: string
  name: string
  code?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface JobGrade {
  id: string
  name: string
  description?: string
  level: number
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  department_id?: string
  department_name?: string
  job_grade_id?: string
  job_grade_name?: string
  title: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateDepartmentInput {
  name: string
  code: string
  description?: string
  company_id?: string
  branch_id?: string
  parent_department_id?: string
}

export interface CreatePositionInput {
  title: string
  description?: string
  department_id?: string
  job_grade_id?: string
}

