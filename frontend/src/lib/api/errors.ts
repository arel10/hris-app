import { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/common'

export class ApiClientError extends Error {
  code: string
  statusCode: number
  details?: { field: string; message: string }[]

  constructor(message: string, code: string, statusCode: number, details?: { field: string; message: string }[]) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as ApiResponse
    throw new ApiClientError(
      data.message || 'An error occurred',
      data.error?.code || 'UNKNOWN_ERROR',
      error.response.status,
      data.error?.details
    )
  }
  if (error instanceof Error) {
    throw new ApiClientError(error.message, 'NETWORK_ERROR', 0)
  }
  throw new ApiClientError('An unknown error occurred', 'UNKNOWN_ERROR', 0)
}

