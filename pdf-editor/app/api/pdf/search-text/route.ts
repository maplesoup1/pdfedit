import { NextRequest } from 'next/server'
import { downloadPDF } from '@/lib/supabase'
import { searchPdfText } from '@/lib/python-bridge'
import { handleApiError, createSuccessResponse, validateRequired } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, query, caseSensitive, wholeWord, maxHits } = body

    const validation = validateRequired(body, ['fileName', 'query'])
    if (!validation.valid) {
      return validation.error
    }

    const pdfBlob = await downloadPDF(fileName)
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

    const result = await searchPdfText(
      {
        buffer: pdfBuffer,
        filename: fileName,
        contentType: pdfBlob.type
      },
      {
        query,
        caseSensitive: Boolean(caseSensitive),
        wholeWord: Boolean(wholeWord),
        maxHits: typeof maxHits === 'number' ? maxHits : undefined
      }
    )

    if (!result?.success) {
      throw new Error(result?.error || 'Search operation failed')
    }

    return createSuccessResponse({
      data: {
        query: result.query,
        matches: result.matches,
        matchCount: result.match_count
      },
      message: `Found ${result.match_count} matches`
    })
  } catch (error) {
    return handleApiError(error)
  }
}
