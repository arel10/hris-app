import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '../api/authApi'
import type { LoginRequest, ChangePasswordRequest } from '../types/auth.types'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (loginData) => {
      // Set temporary token first so getMe can authenticate
      useAuthStore.setState({ accessToken: loginData.access_token })

      try {
        const meData = await authApi.getMe()
        setAuth(
          {
            id: meData.id,
            email: meData.email,
            roles: meData.roles,
            permissions: meData.permissions,
            isActive: meData.is_active,
          },
          loginData.access_token,
          loginData.refresh_token
        )
        navigate('/dashboard')
      } catch {
        setAuth(
          {
            id: loginData.user.id,
            email: loginData.user.email,
            roles: loginData.user.roles,
            permissions: [],
            isActive: true,
          },
          loginData.access_token,
          loginData.refresh_token
        )
        navigate('/dashboard')
      }
    },
  })
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken ?? ''),
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })
}

export function useMe() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  })
}

