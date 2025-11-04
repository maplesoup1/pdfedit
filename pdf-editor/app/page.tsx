'use client'

import PDFViewer from './components/PDFViewer'
import { usePdfEditor } from '@/hooks/usePdfEditor'

export default function Home() {
  const {
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
    handleDeleteSelected
  } = usePdfEditor()

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await handleFileUpload(file)
    if (!result.success && result.error) {
      alert(`Upload failed: ${result.error}`)
    }
  }

  async function onAddText() {
    const result = await handleAddText()
    if (result.success) {
      alert(result.message || 'Text added successfully!')
    } else if (result.error) {
      alert(`Error: ${result.error}`)
    }
  }

  async function onSearch() {
    const result = await handleSearch()
    if (result.success) {
      alert(`Found ${result.matchCount ?? 0} matches`)
    } else if (result.error) {
      alert(`Error: ${result.error}`)
    }
  }

  async function onReplace() {
    const result = await handleReplaceSelected()
    if (result.success) {
      alert(result.message || 'Text updated successfully!')
    } else if (result.error) {
      alert(`Error: ${result.error}`)
    }
  }

  async function onDelete() {
    const result = await handleDeleteSelected()
    if (result.success) {
      alert(result.message || 'Text deleted successfully!')
    } else if (result.error) {
      alert(`Error: ${result.error}`)
    }
  }

  function onSelectMatch(match: typeof searchResults[number]) {
    setSelectedMatch(match)
    setReplacementText(match.text)
    setSelectedPos({ x: match.rect[0], y: match.rect[1], page: match.page })
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">PDF Editor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Toolbar */}
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              className="w-full"
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {fileName && (
            <>
              <div className="border p-4 rounded space-y-3">
                <h2 className="text-xl font-semibold">Search &amp; Replace</h2>
                <input
                  type="text"
                  placeholder="Search text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                    />
                    Case sensitive
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wholeWord}
                      onChange={(e) => setWholeWord(e.target.checked)}
                    />
                    Whole word
                  </label>
                </div>
                <button
                  onClick={onSearch}
                  disabled={searching}
                  className="w-full bg-indigo-500 text-white p-2 rounded disabled:bg-gray-300"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>

                {matchCount > 0 && (
                  <p className="text-sm text-gray-600">Matches: {matchCount}</p>
                )}

                {searchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border rounded divide-y">
                    {searchResults.map((match, index) => (
                      <button
                        key={`${match.page}-${index}`}
                        onClick={() => onSelectMatch(match)}
                        className={`w-full text-left p-2 text-sm hover:bg-gray-100 ${selectedMatch === match ? 'bg-blue-50' : ''}`}
                      >
                        <div className="font-medium">Page {match.page + 1}</div>
                        <div className="text-gray-600 truncate">{match.text}</div>
                        <div className="text-xs text-gray-500">
                          Rect: {match.rect.map((value) => value.toFixed(1)).join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedMatch && (
                  <div className="space-y-2 border-t pt-3">
                    <h3 className="text-sm font-semibold text-gray-700">Edit Selected Match</h3>
                    <textarea
                      value={replacementText}
                      onChange={(e) => setReplacementText(e.target.value)}
                      className="w-full border rounded p-2"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={onReplace}
                        disabled={loading || !replacementText.trim()}
                        className="flex-1 bg-green-500 text-white p-2 rounded disabled:bg-gray-300"
                      >
                        {loading ? 'Processing...' : 'Replace'}
                      </button>
                      <button
                        onClick={onDelete}
                        disabled={loading}
                        className="flex-1 bg-red-500 text-white p-2 rounded disabled:bg-gray-300"
                      >
                        {loading ? 'Processing...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border p-4 rounded">
                <h2 className="text-xl font-semibold mb-4">Add Text</h2>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Font size"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full border p-2 rounded"
                  />
                  {selectedPos && (
                    <p className="text-sm text-gray-600">
                      Position: x={selectedPos.x.toFixed(0)}, y={selectedPos.y.toFixed(0)}, page={selectedPos.page}
                    </p>
                  )}
                  <button
                    onClick={onAddText}
                    disabled={!text || !selectedPos || loading}
                    className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
                  >
                    {loading ? 'Processing...' : 'Add Text'}
                  </button>
                </div>
              </div>

              <div className="border p-4 rounded">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Download PDF
                </button>
              </div>
            </>
          )}
        </div>

        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          {pdfUrl ? (
            <PDFViewer
              fileUrl={pdfUrl}
              onPageClick={(x, y, page) => setSelectedPos({ x, y, page })}
            />
          ) : (
            <div className="border border-dashed border-gray-300 rounded h-96 flex items-center justify-center">
              <p className="text-gray-400">Upload a PDF to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
