import { apiClient } from '@/lib/api/client'
import { handleApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/types/common'
import type {
  Company,
  Branch,
  Department,
  Position,
  JobGrade,
  CreateDepartmentInput,
  CreatePositionInput,
} from '../types/organization.types'

export const organizationApi = {
  // Companies
  getCompanies: async (): Promise<Company[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Company[]>>('/companies')
      return res.data.data || []
    } catch (err) {
      return handleApiError(err)
    }
  },

  // Branches
  getBranches: async (companyId?: string): Promise<Branch[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Branch[]>>('/branches', {
        params: { company_id: companyId },
      })
      return res.data.data || []
    } catch (err) {
      return handleApiError(err)
    }
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Department[]>>('/departments')
      return res.data.data || []
    } catch (err) {
      return handleApiError(err)
    }
  },

  createDepartment: async (data: CreateDepartmentInput): Promise<Department> => {
    try {
      const res = await apiClient.post<ApiResponse<Department>>('/departments', data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  deleteDepartment: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/departments/${id}`)
    } catch (err) {
      return handleApiError(err)
    }
  },

  // Positions
  getPositions: async (departmentId?: string): Promise<Position[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Position[]>>('/positions', {
        params: { department_id: departmentId },
      })
      return res.data.data || []
    } catch (err) {
      return handleApiError(err)
    }
  },

  createPosition: async (data: CreatePositionInput): Promise<Position> => {
    try {
      const res = await apiClient.post<ApiResponse<Position>>('/positions', data)
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },

  deletePosition: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/positions/${id}`)
    } catch (err) {
      return handleApiError(err)
    }
  },

  // Job Grades
  getJobGrades: async (): Promise<JobGrade[]> => {
    try {
      const res = await apiClient.get<ApiResponse<JobGrade[]>>('/job-grades')
      return res.data.data || []
    } catch (err) {
      return handleApiError(err)
    }
  },
}

