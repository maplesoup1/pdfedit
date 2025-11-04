# PDF Editor

A full-stack PDF editing application with Next.js frontend and FastAPI backend.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **PDF Processing**: PyMuPDF (fitz)
- **Storage**: Local file storage
- **PDF Preview**: pdfjs-dist

## Architecture

```
Next.js (Port 3000)  ←→  FastAPI (Port 8000)  ←→  PyMuPDF
     Frontend               PDF API                PDF Processing
```

## Features

- ✅ Upload PDF files
- ✅ Add text to PDF at specific positions
- ✅ Add images to PDF
- ✅ Delete pages
- ✅ Reorder pages
- ✅ Extract pages
- ✅ Redact text
- ✅ Download edited PDFs
- ✅ Real-time PDF preview with canvas rendering
- ✅ Local file storage (no cloud dependencies)

## Setup

### 1. Install Node.js dependencies
```bash
npm install
```

### 2. Set up Python virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Python dependencies
```bash
pip install fastapi uvicorn python-multipart PyMuPDF
```

### 4. Start both services

**Option A: Use the start script (recommended)**
```bash
./start-dev.sh
```

**Option B: Manual start**

Terminal 1 - FastAPI backend:
```bash
source venv/bin/activate
python scripts/api.py
```

Terminal 2 - Next.js frontend:
```bash
npm run dev
```

### 5. Open the app
- Frontend: [http://localhost:3000](http://localhost:3000)
- FastAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Usage

1. Upload a PDF file
2. Click anywhere on the PDF to select a position
3. Enter text and adjust font size
4. Click "Add Text" to add text at the selected position
5. The PDF will automatically refresh showing your changes
6. Download the edited PDF when done

## API Endpoints (FastAPI)

All endpoints accept `multipart/form-data`:

- `POST /pdf/add-text` - Add text to PDF
- `POST /pdf/add-image` - Add image to PDF
- `POST /pdf/delete-pages` - Delete pages from PDF
- `POST /pdf/reorder-pages` - Reorder pages
- `POST /pdf/extract-pages` - Extract specific pages
- `POST /pdf/redact-text` - Redact/remove text
- `POST /pdf/get-info` - Get PDF metadata and page info

## Project Structure

```
pdf-editor/
├── app/                      # Next.js app directory
│   ├── api/pdf/             # Next.js API routes (proxy to FastAPI)
│   ├── components/          # React components
│   └── page.tsx             # Main page
├── scripts/
│   ├── api.py               # FastAPI backend application ⭐
│   └── pdf_processor.py     # Original CLI script (not used)
├── lib/
│   ├── python-bridge.ts     # FastAPI client
│   ├── local-storage.ts     # Local file storage
│   └── supabase.ts          # Storage abstraction
├── venv/                     # Python virtual environment
├── local-storage/           # PDF file storage
└── start-dev.sh             # Start both services
```

## Development

- Frontend runs on `localhost:3000`
- Backend runs on `localhost:8000`
- PDFs are stored in `local-storage/temp-pdfs/`
- Both services need to be running for the app to work

## Troubleshooting

**"Cannot connect to FastAPI"**
- Make sure FastAPI is running on port 8000
- Check `scripts/api.py` is running: `source venv/bin/activate && python scripts/api.py`

**"Module not found: PyMuPDF"**
- Activate venv: `source venv/bin/activate`
- Install: `pip install PyMuPDF`

**Port already in use**
- Kill processes: `lsof -ti:3000,8000 | xargs kill -9`
