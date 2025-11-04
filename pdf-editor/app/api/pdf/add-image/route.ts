import { NextRequest } from 'next/server'
import { addImageToPDF } from '@/lib/python-bridge'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'
import { downloadPDF, uploadPDF, deletePDF } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const fileName = formData.get('fileName') as string
    const imageFile = formData.get('image') as File
    const x = parseFloat(formData.get('x') as string)
    const y = parseFloat(formData.get('y') as string)
    const page = parseInt(formData.get('page') as string) || 0
    const widthValue = formData.get('width')
    const heightValue = formData.get('height')
    const width = widthValue ? parseFloat(widthValue as string) : undefined
    const height = heightValue ? parseFloat(heightValue as string) : undefined

    if (!fileName || !imageFile || Number.isNaN(x) || Number.isNaN(y)) {
      return handleApiError(new Error('Invalid parameters: fileName, image, x, and y are required'))
    }

    // Download PDF
    const pdfBlob = await downloadPDF(fileName)
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())

    // Execute operation
    const operation = await addImageToPDF(
      { buffer: pdfBuffer, filename: fileName, contentType: pdfBlob.type },
      { buffer: imageBuffer, filename: imageFile.name, contentType: imageFile.type },
      { x, y, page, width, height }
    )

    // Upload new PDF and cleanup
    const originalName = fileName.replace(/^[a-f0-9-]+-/, '')
    const updatedFileName = `${randomUUID()}-${originalName}`
    const editedBlob = new Blob([operation.buffer], { type: 'application/pdf' })
    const editedFile = new File([editedBlob], updatedFileName, { type: 'application/pdf' })
    await uploadPDF(editedFile, updatedFileName)

    try {
      await deletePDF(fileName)
    } catch (cleanupError) {
      console.warn('Failed to delete old PDF:', cleanupError)
    }

    return createSuccessResponse({
      fileName: updatedFileName,
      message: operation.message || 'Image added successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
