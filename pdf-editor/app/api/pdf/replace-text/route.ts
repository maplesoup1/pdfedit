import { NextRequest } from 'next/server'
import { replaceTextInstance } from '@/lib/python-bridge'
import { withPdfOperation } from '@/lib/pdf-operation-wrapper'
import { handleApiError, createSuccessResponse, validateRequired } from '@/lib/api-utils'

type RectInput = [number, number, number, number] | number[] | string

function parseRect(rect: RectInput): [number, number, number, number] {
  if (Array.isArray(rect)) {
    if (rect.length !== 4) throw new Error('rect must contain exactly 4 numbers')
    const values = rect.map((value) => Number(value))
    if (values.some((value) => Number.isNaN(value))) {
      throw new Error('rect contains invalid numeric values')
    }
    return values as [number, number, number, number]
  }

  if (typeof rect === 'string') {
    const values = rect.split(',').map((value) => Number(value.trim()))
    if (values.length !== 4 || values.some((value) => Number.isNaN(value))) {
      throw new Error('rect string must contain four comma-separated numbers')
    }
    return values as [number, number, number, number]
  }

  throw new Error('rect must be an array or comma-separated string')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fileName,
      page,
      rect,
      replacement,
      fontSize,
      fontName,
      color,
      align,
      fillColor
    } = body

    const validation = validateRequired(body, ['fileName', 'page', 'rect'])
    if (!validation.valid) {
      return validation.error
    }

    const rectValues = parseRect(rect)
    const pageNumber = Number(page)
    if (Number.isNaN(pageNumber)) {
      return handleApiError(new Error('page must be a number'))
    }

    const colorTuple = Array.isArray(color) ? color.slice(0, 3) : undefined
    const fillTuple = Array.isArray(fillColor) ? fillColor.slice(0, 3) : undefined

    const result = await withPdfOperation(
      fileName,
      replaceTextInstance,
      {
        page: pageNumber,
        rect: rectValues,
        replacement: replacement === undefined ? undefined : String(replacement),
        fontSize: fontSize === undefined ? undefined : Number(fontSize),
        fontName: fontName || undefined,
        color: colorTuple as [number, number, number] | undefined,
        align: align === undefined ? undefined : Number(align),
        fillColor: fillTuple as [number, number, number] | undefined
      }
    )

    return createSuccessResponse({
      fileName: result.fileName,
      message: result.message || 'Text updated successfully'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
