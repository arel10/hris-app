export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: PaginationMeta
  error?: ApiError
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ApiError {
  code: string
  details?: FieldError[]
}

export interface FieldError {
  field: string
  message: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

