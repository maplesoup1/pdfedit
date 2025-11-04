import { NextRequest } from 'next/server'
import { deletePages } from '@/lib/python-bridge'
import { withPdfOperation } from '@/lib/pdf-operation-wrapper'
import { handleApiError, createSuccessResponse, validateRequired } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, pageNumbers } = body

    // Validate required fields
    const validation = validateRequired(body, ['fileName', 'pageNumbers'])
    if (!validation.valid) return validation.error

    if (!Array.isArray(pageNumbers)) {
      return handleApiError(new Error('pageNumbers must be an array'))
    }

    const pages = pageNumbers.map((value: number | string) => Number(value))
    if (pages.length === 0 || pages.some((value) => Number.isNaN(value))) {
      return handleApiError(new Error('pageNumbers must be an array of valid numbers'))
    }

    // Execute PDF operation
    const result = await withPdfOperation(fileName, deletePages, pages)

    return createSuccessResponse({
      fileName: result.fileName,
      message: result.message || 'Pages deleted successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
