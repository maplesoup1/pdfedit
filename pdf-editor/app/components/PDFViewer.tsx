'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface PDFViewerProps {
  fileUrl: string
  onPageClick?: (x: number, y: number, page: number) => void
}

export default function PDFViewer({ fileUrl, onPageClick }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [numPages, setNumPages] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const renderPage = useCallback(async (pdf: any, pageNum: number) => {
    const page = await pdf.getPage(pageNum)
    const canvas = canvasRef.current
    if (!canvas) return

    const viewport = page.getViewport({ scale: 1.5 })
    canvas.width = viewport.width
    canvas.height = viewport.height

    const context = canvas.getContext('2d')
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    await page.render(renderContext).promise
  }, [])

  useEffect(() => {
    const loadPdf = async () => {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

      const loadingTask = pdfjsLib.getDocument(fileUrl)
      const pdf = await loadingTask.promise
      setPdfDoc(pdf)
      setNumPages(pdf.numPages)
      await renderPage(pdf, 1)
    }

    if (fileUrl) {
      loadPdf()
    }
  }, [fileUrl, renderPage])

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage)
    }
  }, [currentPage, pdfDoc, renderPage])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPageClick) return

    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    onPageClick(x, y, currentPage - 1)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {numPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
          disabled={currentPage >= numPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      <div className="border border-gray-300">
        <canvas
          onClick={handleCanvasClick}
          ref={canvasRef}
          className="cursor-crosshair"
        />
      </div>
    </div>
  )
}
