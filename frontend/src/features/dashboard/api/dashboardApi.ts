import { apiClient } from '@/lib/api/client'
import { handleApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/types/common'
import type { DashboardSummary } from '../types/dashboard.types'

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary')
      return res.data.data!
    } catch (err) {
      return handleApiError(err)
    }
  },
}

