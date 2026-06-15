/**
 * API utilities and helpers
 * Add API client configurations, fetch wrappers, and error handling here
 */

export type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Standard API error structure
 */
export type ApiError = {
  code: string
  message: string
  details?: Record<string, unknown>
}
