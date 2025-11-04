import { useState, useCallback } from 'react'
import { PdfApiClient } from '@/lib/pdf-api-client'
import { PdfPosition, PdfSearchMatch } from '@/types/pdf'

interface OperationResult {
  success: boolean
  error?: string
  message?: string
  matchCount?: number
}

export function usePdfEditor() {
  const [fileName, setFileName] = useState<string>('')
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [text, setText] = useState<string>('')
  const [fontSize, setFontSize] = useState<number>(12)
  const [selectedPos, setSelectedPos] = useState<PdfPosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [replacementText, setReplacementText] = useState<string>('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [searchResults, setSearchResults] = useState<PdfSearchMatch[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState<PdfSearchMatch | null>(null)

  const updateUrl = useCallback((blob: Blob) => {
    const newUrl = URL.createObjectURL(blob)
    setPdfUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl)
      }
      return newUrl
    })
  }, [])

  /**
   * Refresh PDF by downloading the latest version
   */
  const refreshPdf = useCallback(async (newFileName: string) => {
    try {
      const blob = await PdfApiClient.downloadPdf(newFileName)
      updateUrl(blob)
      setFileName(newFileName)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh PDF'
      setError(message)
      throw err
    }
  }, [updateUrl])

  /**
   * Upload PDF file
   */
  const handleFileUpload = useCallback(async (file: File): Promise<OperationResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await PdfApiClient.uploadPdf(file)

      if (response.success && response.fileName) {
        setFileName(response.fileName)
        updateUrl(file)
        setSelectedPos(null)
        setSearchResults([])
        setSelectedMatch(null)
        return { success: true }
      }

      const message = 'error' in response ? response.error : 'Upload failed'
      setError(message)
      return { success: false, error: message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [updateUrl])

  /**
   * Add text to PDF
   */
  const handleAddText = useCallback(async (): Promise<OperationResult> => {
    if (!fileName || !text || !selectedPos) {
      const message = 'Missing required fields'
      setError(message)
      return { success: false, error: message }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await PdfApiClient.addText({
        fileName,
        text,
        x: selectedPos.x,
        y: selectedPos.y,
        page: selectedPos.page,
        fontSize
      })

      if (response.success && response.fileName) {
        await refreshPdf(response.fileName)
        setText('')
        setSelectedPos(null)
        setSearchResults([])
        setSelectedMatch(null)
        return { success: true, message: response.message || 'Text added successfully' }
      }

      const message = response.error || 'Failed to add text'
      setError(message)
      return { success: false, error: message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add text'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [fileName, text, selectedPos, fontSize, refreshPdf])

  /**
   * Download current PDF
   */
  const handleDownload = useCallback(() => {
    if (!fileName) return
    window.open(`/api/pdf/download?fileName=${fileName}`, '_blank')
  }, [fileName])

  /**
   * Search for text instances
   */
  const handleSearch = useCallback(async (): Promise<OperationResult> => {
    if (!fileName) {
      const message = 'Upload a PDF first'
      setError(message)
      return { success: false, error: message }
    }

    if (!searchQuery.trim()) {
      const message = 'Search query is required'
      setError(message)
      return { success: false, error: message }
    }

    setSearching(true)
    setError(null)

    try {
      const response = await PdfApiClient.searchText({
        fileName,
        query: searchQuery,
        caseSensitive,
        wholeWord
      })

      if (response.success) {
        const data = response.data ?? { matches: [], matchCount: 0 }
        setSearchResults(data.matches ?? [])
        setMatchCount(data.matchCount ?? 0)
        const firstMatch = (data.matches ?? [])[0] ?? null
        setSelectedMatch(firstMatch)
        if (firstMatch) {
          setSelectedPos({
            x: firstMatch.rect[0],
            y: firstMatch.rect[1],
            page: firstMatch.page
          })
        }
        return { success: true, matchCount: data.matchCount ?? 0 }
      }

      const message = response.error || 'Search failed'
      setError(message)
      return { success: false, error: message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setSearching(false)
    }
  }, [fileName, searchQuery, caseSensitive, wholeWord])

  const runReplace = useCallback(
    async (replacement?: string): Promise<OperationResult> => {
      if (!fileName || !selectedMatch) {
        const message = 'Select a match before applying changes'
        setError(message)
        return { success: false, error: message }
      }

      setLoading(true)
      setError(null)

      try {
        const response = await PdfApiClient.replaceText({
          fileName,
          page: selectedMatch.page,
          rect: selectedMatch.rect,
          replacement,
          fontSize,
          color: [0, 0, 0]
        })

        if (response.success && response.fileName) {
          await refreshPdf(response.fileName)
          setReplacementText('')
          await handleSearch()
          return {
            success: true,
            message: response.message || (replacement ? 'Updated text successfully' : 'Deleted text successfully')
          }
        }

        const message = response.error || 'Operation failed'
        setError(message)
        return { success: false, error: message }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Operation failed'
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [fileName, selectedMatch, fontSize, refreshPdf, handleSearch]
  )

  const handleReplaceSelected = useCallback(async () => {
    if (!replacementText.trim()) {
      const message = 'Replacement text cannot be empty'
      setError(message)
      return { success: false, error: message }
    }
    return runReplace(replacementText)
  }, [replacementText, runReplace])

  const handleDeleteSelected = useCallback(async () => {
    return runReplace(undefined)
  }, [runReplace])

  return {
    fileName,
    pdfUrl,
    text,
    fontSize,
    selectedPos,
    loading,
    searching,
    error,
    searchQuery,
    replacementText,
    caseSensitive,
    wholeWord,
    searchResults,
    matchCount,
    selectedMatch,

    setText,
    setFontSize,
    setSelectedPos,
    setError,
    setSearchQuery,
    setReplacementText,
    setCaseSensitive,
    setWholeWord,
    setSelectedMatch,

    handleFileUpload,
    handleAddText,
    handleDownload,
    handleSearch,
    handleReplaceSelected,
    handleDeleteSelected,
    refreshPdf
  }
}
