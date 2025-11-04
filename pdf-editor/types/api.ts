/**
 * Shared type definitions for API responses
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data?: T
  message?: string
  fileName?: string
}

export interface ApiErrorResponse {
  success?: false
  error: string
  isServiceUnavailable?: boolean
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isServiceUnavailable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
