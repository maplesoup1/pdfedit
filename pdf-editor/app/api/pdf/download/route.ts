import { NextRequest, NextResponse } from 'next/server'
import { downloadPDF } from '@/lib/supabase'
import { handleApiError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return handleApiError(new Error('No fileName provided'))
    }

    const blob = await downloadPDF(fileName)

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
