export interface Employee {
  id: string
  user_id?: string
  employee_number: string
  first_name: string
  last_name?: string
  email: string
  phone?: string
  gender?: string
  birth_date?: string
  birth_place?: string
  national_id?: string
  marital_status?: string
  employment_type: string
  employment_status: string
  department_id?: string
  department_name?: string
  position_id?: string
  position_title?: string
  manager_id?: string
  manager_name?: string
  join_date: string
  termination_date?: string
  created_at: string
  updated_at: string

  contacts?: Contact[]
  addresses?: Address[]
  emergency_contacts?: EmergencyContact[]
  bank_accounts?: BankAccount[]
}

export interface Contact {
  id: string
  employee_id: string
  contact_type: string
  contact_value: string
  is_primary: boolean
  created_at: string
}

export interface Address {
  id: string
  employee_id: string
  address_type: string
  street: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
  is_primary: boolean
  created_at: string
}

export interface EmergencyContact {
  id: string
  employee_id: string
  name: string
  relationship: string
  phone_number: string
  address?: string
  created_at: string
}

export interface BankAccount {
  id: string
  employee_id: string
  bank_name: string
  account_number: string
  account_holder: string
  is_primary: boolean
  created_at: string
}

export interface EmploymentHistory {
  id: string
  employee_id: string
  department_id?: string
  department_name?: string
  position_id?: string
  position_title?: string
  manager_id?: string
  manager_name?: string
  effective_from: string
  effective_until?: string
  change_reason?: string
  created_at: string
}

export interface CreateEmployeeInput {
  first_name: string
  last_name?: string
  email: string
  phone?: string
  gender?: string
  birth_date?: string
  birth_place?: string
  national_id?: string
  marital_status?: string
  employment_type: string
  department_id?: string
  position_id?: string
  manager_id?: string
  join_date: string
  create_user_account?: boolean
  user_password?: string
}

export interface UpdateEmployeeInput {
  first_name?: string
  last_name?: string
  phone?: string
  gender?: string
  birth_date?: string
  birth_place?: string
  national_id?: string
  marital_status?: string
  employment_type?: string
  department_id?: string
  position_id?: string
  manager_id?: string
  join_date?: string
  change_reason?: string
}

export interface EmployeeFilters {
  page?: number
  limit?: number
  search?: string
  department_id?: string
  status?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

