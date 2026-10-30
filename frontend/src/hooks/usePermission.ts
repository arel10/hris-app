import { useAuthStore } from '@/stores/authStore'
import type { Permission } from '@/lib/constants/permissions'

export function usePermission() {
  const { hasPermission, hasRole, user } = useAuthStore()

  return {
    hasPermission: (permission: Permission | string) => hasPermission(permission),
    hasRole: (role: string) => hasRole(role),
    hasAnyPermission: (permissions: string[]) => permissions.some((p) => hasPermission(p)),
    hasAllPermissions: (permissions: string[]) => permissions.every((p) => hasPermission(p)),
    user,
  }
}

