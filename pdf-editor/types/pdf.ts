/**
 * Shared type definitions for PDF operations
 */

export interface PdfFilePayload {
  buffer: Buffer
  filename: string
  contentType?: string
}

export interface PdfBinaryResponse {
  buffer: Buffer
  message?: string
  removedCount?: number
}

export interface PdfPosition {
  x: number
  y: number
  page: number
}

export interface PdfSearchMatch {
  page: number
  text: string
  rect: [number, number, number, number]
}

export interface PdfInfo {
  pageCount: number
  title?: string
  author?: string
  subject?: string
  keywords?: string
  creator?: string
  producer?: string
  creationDate?: string
  modificationDate?: string
}
