import { NextRequest } from 'next/server'
import { uploadPDF } from '@/lib/supabase'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return handleApiError(new Error('No file provided'))
    }

    const fileName = `${Date.now()}-${file.name}`
    await uploadPDF(file, fileName)

    return createSuccessResponse({
      fileName,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
