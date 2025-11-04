import { NextRequest } from 'next/server'
import { addTextToPDF } from '@/lib/python-bridge'
import { withPdfOperation } from '@/lib/pdf-operation-wrapper'
import { handleApiError, createSuccessResponse, validateRequired } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, text, x, y, page, fontSize, fontName, color } = body

    // Validate required fields
    const validation = validateRequired(body, ['fileName', 'text'])
    if (!validation.valid) return validation.error

    if (typeof x !== 'number' || typeof y !== 'number') {
      return handleApiError(new Error('x and y coordinates must be numbers'))
    }

    // Execute PDF operation with wrapper
    const result = await withPdfOperation(
      fileName,
      addTextToPDF,
      { text, x, y, page, fontSize, fontName, color }
    )

    return createSuccessResponse({
      fileName: result.fileName,
      message: result.message || 'Text added successfully'
    })

  } catch (error) {
    return handleApiError(error)
  }
}
