import { NextRequest } from 'next/server'
import { downloadPDF } from '@/lib/supabase'
import { getPDFInfo } from '@/lib/python-bridge'
import { handleApiError, createSuccessResponse, validateRequired } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName } = body

    // Validate required fields
    const validation = validateRequired(body, ['fileName'])
    if (!validation.valid) return validation.error

    const pdfBlob = await downloadPDF(fileName)
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

    const result = await getPDFInfo({
      buffer: pdfBuffer,
      filename: fileName,
      contentType: pdfBlob.type
    })

    return createSuccessResponse({ data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
