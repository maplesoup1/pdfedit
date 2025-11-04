/**
 * Client-side API wrapper for PDF operations
 */

import { ApiResponse, ApiError } from '@/types/api'

const API_BASE = '/api/pdf'
const SERVICE_UNAVAILABLE_STATUSES = new Set([502, 503, 504])

function jsonHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' }
}

function appendOptional(formData: FormData, key: string, value: number | string | boolean | undefined | null) {
  if (value === undefined || value === null) {
    return
  }
  formData.append(key, value.toString())
}

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  try {
    return await fetch(input, init)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError('Unable to reach PDF service', 503, true)
    }
    throw error
  }
}

async function buildApiError(response: Response): Promise<ApiError> {
  const raw = await response.text()
  let message = `Request failed with status ${response.status}`

  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        message = parsed.error || parsed.detail || message
      } else if (typeof parsed === 'string') {
        message = parsed
      }
    } catch {
      message = raw
    }
  } else if (response.statusText) {
    message = response.statusText
  }

  const isServiceUnavailable = SERVICE_UNAVAILABLE_STATUSES.has(response.status)
  return new ApiError(message, response.status, isServiceUnavailable)
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await safeFetch(path, init)
  if (!response.ok) {
    throw await buildApiError(response)
  }
  return response.json() as Promise<T>
}

async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  const response = await safeFetch(path, init)
  if (!response.ok) {
    throw await buildApiError(response)
  }
  return response.blob()
}

export class PdfApiClient {
  /**
   * Upload a PDF file
   */
  static uploadPdf(file: File): Promise<ApiResponse<{ fileName: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    return requestJson<ApiResponse<{ fileName: string }>>(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Download a PDF file as blob
   */
  static downloadPdf(fileName: string): Promise<Blob> {
    const encoded = encodeURIComponent(fileName)
    return requestBlob(`${API_BASE}/download?fileName=${encoded}`)
  }

  /**
   * Add text to PDF
   */
  static addText(params: {
    fileName: string
    text: string
    x: number
    y: number
    page?: number
    fontSize?: number
    fontName?: string
    color?: [number, number, number]
  }): Promise<ApiResponse<{ fileName: string }>> {
    return requestJson<ApiResponse<{ fileName: string }>>(`${API_BASE}/add-text`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(params)
    })
  }

  /**
   * Add image to PDF
   */
  static addImage(params: {
    fileName: string
    image: File
    x: number
    y: number
    page?: number
    width?: number
    height?: number
  }): Promise<ApiResponse<{ fileName: string }>> {
    const formData = new FormData()
    formData.append('fileName', params.fileName)
    formData.append('image', params.image)
    formData.append('x', params.x.toString())
    formData.append('y', params.y.toString())
    formData.append('page', (params.page ?? 0).toString())
    appendOptional(formData, 'width', params.width)
    appendOptional(formData, 'height', params.height)

    return requestJson<ApiResponse<{ fileName: string }>>(`${API_BASE}/add-image`, {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Delete pages from PDF
   */
  static deletePages(
    fileName: string,
    pageNumbers: number[]
  ): Promise<ApiResponse<{ fileName: string }>> {
    return requestJson<ApiResponse<{ fileName: string }>>(`${API_BASE}/delete-pages`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ fileName, pageNumbers })
    })
  }

  /**
   * Get PDF information
   */
  static getPdfInfo(fileName: string): Promise<ApiResponse> {
    return requestJson<ApiResponse>(`${API_BASE}/get-info`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ fileName })
    })
  }

  /**
   * Search for text in a PDF
   */
  static searchText(params: {
    fileName: string
    query: string
    caseSensitive?: boolean
    wholeWord?: boolean
    maxHits?: number
  }): Promise<ApiResponse<{
    query: string
    matches: Array<{ page: number; rect: [number, number, number, number]; text: string }>
    matchCount: number
  }>> {
    return requestJson(`${API_BASE}/search-text`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(params)
    })
  }

  /**
   * Replace or remove a specific text instance
   */
  static replaceText(params: {
    fileName: string
    page: number
    rect: [number, number, number, number] | number[]
    replacement?: string
    fontSize?: number
    fontName?: string
    color?: [number, number, number]
    align?: number
    fillColor?: [number, number, number]
  }): Promise<ApiResponse<{ fileName: string }>> {
    return requestJson(`${API_BASE}/replace-text`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(params)
    })
  }

  /**
   * Redact (delete) text from PDF
   */
  static redactText(params: {
    fileName: string
    targets: string[]
    fillColor?: [number, number, number]
  }): Promise<ApiResponse<{ fileName: string }>> {
    return requestJson<ApiResponse<{ fileName: string }>>(`${API_BASE}/redact-text`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(params)
    })
  }
}
