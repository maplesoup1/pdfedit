import { downloadPDF, uploadPDF, deletePDF } from './supabase'
import { PdfFilePayload, PdfBinaryResponse } from '@/types/pdf'
import { randomUUID } from 'crypto'

/**
 * Result of a PDF operation
 */
export interface PdfOperationResult {
  fileName: string
  message?: string
  removedCount?: number
}

/**
 * Function type for PDF operations
 */
type PdfOperation<TParams = void> = (
  pdf: PdfFilePayload,
  params: TParams
) => Promise<PdfBinaryResponse>

/**
 * Wrapper function that handles common PDF operation workflow:
 * 1. Download the PDF from storage
 * 2. Execute the operation (via python-bridge)
 * 3. Upload the result with a new filename
 * 4. Clean up the old file
 *
 * @param fileName - Current PDF file name
 * @param operation - PDF operation function to execute
 * @param params - Parameters for the operation
 * @returns Result with new fileName and operation message
 */
export async function withPdfOperation<TParams = void>(
  fileName: string,
  operation: PdfOperation<TParams>,
  params: TParams
): Promise<PdfOperationResult> {
  // 1. Download existing PDF
  const pdfBlob = await downloadPDF(fileName)
  const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

  // 2. Execute operation
  const result = await operation(
    {
      buffer: pdfBuffer,
      filename: fileName,
      contentType: pdfBlob.type
    },
    params
  )

  // 3. Generate new filename (preserve original name, add new UUID)
  const originalName = fileName.replace(/^[a-f0-9-]+-/, '')
  const updatedFileName = `${randomUUID()}-${originalName}`

  // 4. Upload new PDF
  const editedBlob = new Blob([result.buffer], { type: 'application/pdf' })
  const editedFile = new File([editedBlob], updatedFileName, { type: 'application/pdf' })
  await uploadPDF(editedFile, updatedFileName)

  // 5. Clean up old file (non-blocking)
  try {
    await deletePDF(fileName)
  } catch (cleanupError) {
    console.warn('Failed to delete old PDF:', cleanupError)
  }

  return {
    fileName: updatedFileName,
    message: result.message,
    removedCount: result.removedCount
  }
}

/**
 * Simplified version for operations that don't need parameters
 */
export async function withSimplePdfOperation(
  fileName: string,
  operation: (pdf: PdfFilePayload) => Promise<PdfBinaryResponse>
): Promise<PdfOperationResult> {
  return withPdfOperation(fileName, operation as any, undefined as any)
}
