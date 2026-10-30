import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '../api/organizationApi'
import type { CreateDepartmentInput, CreatePositionInput } from '../types/organization.types'

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: organizationApi.getDepartments,
  })
}

export function usePositions(departmentId?: string) {
  return useQuery({
    queryKey: ['positions', departmentId],
    queryFn: () => organizationApi.getPositions(departmentId),
  })
}

export function useJobGrades() {
  return useQuery({
    queryKey: ['job-grades'],
    queryFn: organizationApi.getJobGrades,
  })
}

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => organizationApi.getBranches(),
  })
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: organizationApi.getCompanies,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDepartmentInput) => organizationApi.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDepartmentInput> }) =>
      organizationApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useCreatePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePositionInput) => organizationApi.createPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePositionInput> }) =>
      organizationApi.updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

export function useDeletePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizationApi.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

