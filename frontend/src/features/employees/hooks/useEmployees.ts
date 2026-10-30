import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../api/employeeApi'
import type { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters } from '../types/employee.types'

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeApi.getEmployees(filters),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getEmployeeById(id),
    enabled: !!id,
  })
}

export function useEmploymentHistories(id: string) {
  return useQuery({
    queryKey: ['employee-histories', id],
    queryFn: () => employeeApi.getEmploymentHistories(id),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) => employeeApi.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateEmployeeInput) => employeeApi.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployeeStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ status, terminationDate }: { status: string; terminationDate?: string }) =>
      employeeApi.updateStatus(id, status, terminationDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

