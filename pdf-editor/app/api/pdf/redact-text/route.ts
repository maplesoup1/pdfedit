import { NextRequest } from 'next/server'
import { redactText } from '@/lib/python-bridge'
import { withPdfOperation } from '@/lib/pdf-operation-wrapper'
import { handleApiError, createSuccessResponse, validateRequired } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, targets, fillColor } = body

    const validation = validateRequired(body, ['fileName', 'targets'])
    if (!validation.valid) return validation.error

    if (!Array.isArray(targets) || targets.length === 0) {
      return handleApiError(new Error('targets must be a non-empty array'))
    }

    const result = await withPdfOperation(
      fileName,
      redactText,
      targets,
      fillColor ? { fillColor } : undefined
    )

    return createSuccessResponse({
      fileName: result.fileName,
      message: result.message || 'Text redacted successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
