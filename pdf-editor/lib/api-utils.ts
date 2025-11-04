import { NextResponse } from 'next/server'
import { ApiError, ApiSuccessResponse, ApiErrorResponse } from '@/types/api'

/**
 * Handles API errors and returns appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        isServiceUnavailable: error.isServiceUnavailable
      },
      { status: error.statusCode }
    )
  }

  const message = error instanceof Error ? error.message : 'An unknown error occurred'

  // Check if it's a PDF service error with statusCode
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as any).statusCode || 500
    const isServiceUnavailable = (error as any).isServiceUnavailable || false

    return NextResponse.json(
      {
        error: message,
        isServiceUnavailable
      },
      { status: statusCode }
    )
  }

  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(
  data: Partial<ApiSuccessResponse<T>>
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    ...data
  })
}

/**
 * Validates required fields in request body
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): { valid: true } | { valid: false; error: NextResponse } {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return {
        valid: false,
        error: NextResponse.json(
          { error: `${String(field)} is required` },
          { status: 400 }
        )
      }
    }
  }
  return { valid: true }
}
