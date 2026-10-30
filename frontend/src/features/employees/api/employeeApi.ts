import { apiClient } from '@/lib/api/client'
import { handleApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/types/common'
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeFilters,
  EmploymentHistory,
  Contact,
  Address,
  BankAccount,
  EmergencyContact,
} from '../types/employee.types'

export const employeeApi = {
  getEmployees: async (filters: EmployeeFilters = {}) => {
    try {
      const res = await apiClient.get<ApiResponse<Employee[]>>('/employees', {
        params: filters,
      })
      return {
        data: res.data.data || [],
        meta: res.data.meta,
      }
    } catch (err) {
      return handleApiError(err)
    }
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    try {
      const res = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  createEmployee: async (data: CreateEmployeeInput): Promise<Employee> => {
    try {
      const res = await apiClient.post<ApiResponse<Employee>>('/employees', data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  updateEmployee: async (id: string, data: UpdateEmployeeInput): Promise<Employee> => {
    try {
      const res = await apiClient.patch<ApiResponse<Employee>>(`/employees/${id}`, data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  updateStatus: async (id: string, status: string, terminationDate?: string): Promise<void> => {
    try {
      await apiClient.patch(`/employees/${id}/status`, {
        status,
        termination_date: terminationDate,
      })
    } catch (err) {
      return handleApiError(err)
    }
  },

  getEmploymentHistories: async (id: string): Promise<EmploymentHistory[]> => {
    try {
      const res = await apiClient.get<ApiResponse<EmploymentHistory[]>>(`/employees/${id}/employment-history`)
      return res.data.data || []
    } catch (err) {
      return handleApiError(err)
    }
  },

  // Sub-resources
  addContact: async (id: string, data: { contact_type: string; contact_value: string; is_primary: boolean }): Promise<Contact> => {
    try {
      const res = await apiClient.post<ApiResponse<Contact>>(`/employees/${id}/contacts`, data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  deleteContact: async (id: string, contactId: string): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${id}/contacts/${contactId}`)
    } catch (err) {
      return handleApiError(err)
    }
  },

  addAddress: async (id: string, data: { address_type: string; street: string; city?: string; province?: string; postal_code?: string; is_primary: boolean }): Promise<Address> => {
    try {
      const res = await apiClient.post<ApiResponse<Address>>(`/employees/${id}/addresses`, data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  deleteAddress: async (id: string, addressId: string): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${id}/addresses/${addressId}`)
    } catch (err) {
      return handleApiError(err)
    }
  },

  addEmergencyContact: async (id: string, data: { name: string; relationship: string; phone_number: string; address?: string }): Promise<EmergencyContact> => {
    try {
      const res = await apiClient.post<ApiResponse<EmergencyContact>>(`/employees/${id}/emergency-contacts`, data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  deleteEmergencyContact: async (id: string, contactId: string): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${id}/emergency-contacts/${contactId}`)
    } catch (err) {
      return handleApiError(err)
    }
  },

  addBankAccount: async (id: string, data: { bank_name: string; account_number: string; account_holder: string; is_primary: boolean }): Promise<BankAccount> => {
    try {
      const res = await apiClient.post<ApiResponse<BankAccount>>(`/employees/${id}/bank-accounts`, data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  deleteBankAccount: async (id: string, bankId: string): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${id}/bank-accounts/${bankId}`)
    } catch (err) {
      return handleApiError(err)
    }
  },
}

