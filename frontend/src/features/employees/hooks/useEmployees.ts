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

export function useAddContact(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { contact_type: string; contact_value: string; is_primary: boolean }) =>
      employeeApi.addContact(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
    },
  })
}

export function useDeleteContact(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contactId: string) => employeeApi.deleteContact(employeeId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
    },
  })
}

export function useAddAddress(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      address_type: string
      street: string
      city?: string
      province?: string
      postal_code?: string
      is_primary: boolean
    }) => employeeApi.addAddress(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
    },
  })
}

export function useDeleteAddress(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (addressId: string) => employeeApi.deleteAddress(employeeId, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
    },
  })
}

export function useAddBankAccount(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { bank_name: string; account_number: string; account_holder: string; is_primary: boolean }) =>
      employeeApi.addBankAccount(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
    },
  })
}

export function useDeleteBankAccount(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bankId: string) => employeeApi.deleteBankAccount(employeeId, bankId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
    },
  })
}

