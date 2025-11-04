const PDF_API_BASE_URL = (() => {
  const url = process.env.PDF_API_BASE_URL
  if (!url) {
    throw new Error(
      'PDF_API_BASE_URL environment variable is not set. ' +
      'Please configure it in .env.local for development or in your deployment environment. ' +
      'Example: PDF_API_BASE_URL=http://localhost:8000'
    )
  }
  return url
})()

interface PdfBinaryResponse {
  buffer: Buffer
  message?: string
  removedCount?: number
}

interface PdfFilePayload {
  buffer: Buffer
  filename: string
  contentType?: string
}

class PdfApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isServiceUnavailable: boolean = false
  ) {
    super(message)
    this.name = 'PdfApiError'
  }
}

function ensureOk(response: Response, payload?: any): never {
  const baseDetail =
    typeof payload === 'object' && payload !== null
      ? payload.detail || payload.error || JSON.stringify(payload)
      : String(payload || response.statusText)

  throw new PdfApiError(
    baseDetail || `PDF API request failed with status ${response.status}`,
    response.status
  )
}

async function extractBinaryResponse(response: Response): Promise<PdfBinaryResponse> {
  const message = response.headers.get('x-operation-message') ?? undefined
  const removedHeader = response.headers.get('x-removed-count')
  const removedCount = removedHeader ? Number(removedHeader) : undefined
  const arrayBuffer = await response.arrayBuffer()
  return {
    buffer: Buffer.from(arrayBuffer),
    message,
    removedCount: Number.isFinite(removedCount) ? removedCount : undefined
  }
}

async function postPdf(endpoint: string, formData: FormData): Promise<PdfBinaryResponse> {
  try {
    const response = await fetch(`${PDF_API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        payload = await response.text()
      }
      ensureOk(response, payload)
    }

    return extractBinaryResponse(response)
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new PdfApiError(
        `PDF service unavailable at ${PDF_API_BASE_URL}. Please ensure the FastAPI service is running.`,
        503,
        true
      )
    }
    throw error
  }
}

function toFileField({ buffer, filename, contentType }: PdfFilePayload): File {
  const blob = new Blob([buffer], { type: contentType || 'application/pdf' })
  return new File([blob], filename, { type: blob.type })
}

function appendOptional(
  formData: FormData,
  key: string,
  value: number | string | boolean | undefined | null
) {
  if (value === undefined || value === null) return
  formData.append(key, value.toString())
}

export async function addTextToPDF(
  pdf: PdfFilePayload,
  params: {
    text: string
    x: number
    y: number
    page?: number
    fontSize?: number
    fontName?: string
    color?: [number, number, number]
  }
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  formData.append('text', params.text)
  formData.append('x', params.x.toString())
  formData.append('y', params.y.toString())
  formData.append('page', (params.page ?? 0).toString())
  formData.append('font_size', (params.fontSize ?? 12).toString())
  formData.append('font_name', params.fontName ?? 'helv')
  const [r, g, b] = params.color ?? [0, 0, 0]
  formData.append('color_r', r.toString())
  formData.append('color_g', g.toString())
  formData.append('color_b', b.toString())

  return postPdf('/pdf/add-text', formData)
}

export async function addImageToPDF(
  pdf: PdfFilePayload,
  image: PdfFilePayload,
  params: {
    x: number
    y: number
    page?: number
    width?: number | null
    height?: number | null
  }
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  formData.append('image_file', toFileField(image))
  formData.append('x', params.x.toString())
  formData.append('y', params.y.toString())
  formData.append('page', (params.page ?? 0).toString())
  if (params.width !== undefined && params.width !== null) {
    formData.append('width', params.width.toString())
  }
  if (params.height !== undefined && params.height !== null) {
    formData.append('height', params.height.toString())
  }

  return postPdf('/pdf/add-image', formData)
}

export async function deletePages(
  pdf: PdfFilePayload,
  pageNumbers: number[]
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  formData.append('page_numbers', pageNumbers.join(','))
  return postPdf('/pdf/delete-pages', formData)
}

export async function reorderPages(
  pdf: PdfFilePayload,
  newOrder: number[]
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  formData.append('new_order', newOrder.join(','))
  return postPdf('/pdf/reorder-pages', formData)
}

export async function extractPages(
  pdf: PdfFilePayload,
  pageNumbers: number[]
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  formData.append('page_numbers', pageNumbers.join(','))
  return postPdf('/pdf/extract-pages', formData)
}

export async function redactText(
  pdf: PdfFilePayload,
  targets: string[],
  params?: { fillColor?: [number, number, number] }
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  formData.append('targets', targets.join(','))
  const [r, g, b] = params?.fillColor ?? [1, 1, 1]
  formData.append('fill_r', r.toString())
  formData.append('fill_g', g.toString())
  formData.append('fill_b', b.toString())
  return postPdf('/pdf/redact-text', formData)
}

export async function searchPdfText(
  pdf: PdfFilePayload,
  params: {
    query: string
    caseSensitive?: boolean
    wholeWord?: boolean
    maxHits?: number
  }
) {
  try {
    const formData = new FormData()
    formData.append('pdf_file', toFileField(pdf))
    formData.append('query', params.query)
    appendOptional(formData, 'case_sensitive', params.caseSensitive)
    appendOptional(formData, 'whole_word', params.wholeWord)
    appendOptional(formData, 'max_hits', params.maxHits)

    const response = await fetch(`${PDF_API_BASE_URL}/pdf/search-text`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        payload = await response.text()
      }
      ensureOk(response, payload)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new PdfApiError(
        `PDF service unavailable at ${PDF_API_BASE_URL}. Please ensure the FastAPI service is running.`,
        503,
        true
      )
    }
    throw error
  }
}

export async function replaceTextInstance(
  pdf: PdfFilePayload,
  params: {
    page: number
    rect: [number, number, number, number]
    replacement?: string
    fontSize?: number
    fontName?: string
    color?: [number, number, number]
    align?: number
    fillColor?: [number, number, number]
  }
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  formData.append('page', params.page.toString())
  formData.append('rect', params.rect.join(','))
  if (params.replacement !== undefined && params.replacement !== null) {
    formData.append('replacement', params.replacement)
  }
  appendOptional(formData, 'font_size', params.fontSize)
  appendOptional(formData, 'font_name', params.fontName)
  appendOptional(formData, 'align', params.align)

  const [cr, cg, cb] = params.color ?? [0, 0, 0]
  formData.append('color_r', cr.toString())
  formData.append('color_g', cg.toString())
  formData.append('color_b', cb.toString())

  const [fr, fg, fb] = params.fillColor ?? [1, 1, 1]
  formData.append('fill_r', fr.toString())
  formData.append('fill_g', fg.toString())
  formData.append('fill_b', fb.toString())

  return postPdf('/pdf/replace-text', formData)
}

export async function getPDFInfo(pdf: PdfFilePayload) {
  try {
    const formData = new FormData()
    formData.append('pdf_file', toFileField(pdf))

    const response = await fetch(`${PDF_API_BASE_URL}/pdf/get-info`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        payload = await response.text()
      }
      ensureOk(response, payload)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new PdfApiError(
        `PDF service unavailable at ${PDF_API_BASE_URL}. Please ensure the FastAPI service is running.`,
        503,
        true
      )
    }
    throw error
  }
}
