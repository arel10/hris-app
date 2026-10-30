import { apiClient } from '@/lib/api/client'
import { handleApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/types/common'
import type { LoginRequest, LoginResponse, MeResponse, ChangePasswordRequest } from '../types/auth.types'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data)
      return res.data.data!
    } catch (error) {
      return handleApiError(error)
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken })
    } catch (error) {
      return handleApiError(error)
    }
  },

  getMe: async (): Promise<MeResponse> => {
    try {
      const res = await apiClient.get<ApiResponse<MeResponse>>('/auth/me')
      return res.data.data!
    } catch (error) {
      return handleApiError(error)
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    try {
      await apiClient.post('/auth/change-password', data)
    } catch (error) {
      return handleApiError(error)
    }
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', {
        refresh_token: refreshToken,
      })
      return res.data.data!
    } catch (error) {
      return handleApiError(error)
    }
  },
}

