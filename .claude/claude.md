# Claude.md - PDF Editor Project Guide

> This document helps Claude (and developers) quickly understand the project context, architecture, and development workflows.

---

## 📋 Project Overview

**Project Name**: PDF Editor
**Type**: Full-stack web application
**Purpose**: Modern PDF editing tool with text insertion, image placement, page management, and more.

### Tech Stack

**Backend**:
- **FastAPI** (Python) - High-performance REST API framework
- **PyMuPDF (fitz)** - PDF manipulation library
- **Uvicorn** - ASGI server

**Frontend**:
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **PDF.js** - Client-side PDF rendering

**Storage**:
- Local file storage (development)
- Supabase (optional, production)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                     (http://localhost:3000)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Next.js API Routes                         │
│                    (API Layer / BFF)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ /api/pdf/upload  /api/pdf/add-text  /api/pdf/download │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Internal HTTP
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  FastAPI Backend Service                     │
│                  (http://localhost:8000)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              PDF Processing Operations                  │ │
│  │  - Add Text       - Add Image      - Delete Pages      │ │
│  │  - Merge PDFs     - Extract Pages  - Redact Text       │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                    ┌──────▼───────┐                         │
│                    │  PyMuPDF     │                         │
│                    │   (fitz)     │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Storage   │
                    │  (Local /   │
                    │  Supabase)  │
                    └─────────────┘
```

---

## 📁 Directory Structure

```
pdf/
├── scripts/
│   ├── pdf_api.py              # FastAPI application entry point
│   ├── start_backend.sh        # Backend startup script
│   └── cleanup-cron.ts         # Scheduled cleanup job
│
├── pdf_processor.py            # Core PDF processing logic (PyMuPDF wrapper)
├── .venv/                      # Python virtual environment
│
├── pdf-editor/                 # Next.js frontend application
│   ├── app/
│   │   ├── api/pdf/            # API route handlers
│   │   │   ├── upload/route.ts
│   │   │   ├── add-text/route.ts
│   │   │   ├── add-image/route.ts
│   │   │   ├── delete-pages/route.ts
│   │   │   ├── download/route.ts
│   │   │   ├── get-info/route.ts
│   │   │   └── cleanup/route.ts
│   │   ├── components/
│   │   │   ├── PDFViewer.tsx   # PDF display component
│   │   │   └── Toast.tsx       # Notification component
│   │   ├── page.tsx            # Main page (UI only)
│   │   └── layout.tsx          # Root layout
│   │
│   ├── lib/
│   │   ├── api-utils.ts        # Shared API error handling & validation
│   │   ├── pdf-api-client.ts   # Frontend API client
│   │   ├── pdf-operation-wrapper.ts  # Backend PDF operation wrapper
│   │   ├── python-bridge.ts    # Bridge to FastAPI service
│   │   ├── supabase.ts         # Supabase/local storage adapter
│   │   ├── cleanup.ts          # File cleanup utilities
│   │   └── local-storage.ts    # Local file operations
│   │
│   ├── hooks/
│   │   ├── usePdfEditor.ts     # Main PDF editor state & logic
│   │   └── useToast.ts         # Toast notification hook
│   │
│   ├── types/
│   │   ├── pdf.ts              # PDF-related type definitions
│   │   └── api.ts              # API response type definitions
│   │
│   └── .env.local              # Environment variables (create from .env.example)
│
├── README.md                   # Project documentation
├── START_GUIDE.md              # Startup instructions
├── DEPLOYMENT.md               # Deployment guide
├── OPTIMIZATION_SUMMARY.md     # Code optimization details
└── claude.md                   # This file
```

---

## 🎯 Core Features

### PDF Operations (Backend - FastAPI)

1. **Add Text** - Insert text at specified coordinates
2. **Add Image** - Place images on PDF pages
3. **Delete Pages** - Remove specific pages
4. **Reorder Pages** - Change page sequence
5. **Merge PDFs** - Combine multiple PDF files
6. **Extract Pages** - Extract specific pages to new PDF
7. **Redact Text** - Cover/remove sensitive text
8. **Get Info** - Retrieve PDF metadata and page info

### Frontend Features

- Real-time PDF preview with PDF.js
- Click-to-place text insertion
- Automatic PDF refresh after operations
- Loading states and error handling
- Toast notifications
- Responsive design

---

## 🚀 Development Workflow

### Starting the Services

**Backend** (Terminal 1):
```bash
cd "/Users/xtom/Downloads/A2 3/pdf"
./scripts/start_backend.sh
# or
source .venv/bin/activate
python -m uvicorn scripts.pdf_api:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend** (Terminal 2):
```bash
cd pdf-editor
npm install  # first time only
npm run dev
```

**Full Stack** (with tmux):
```bash
./start_dev.sh
```

### Access Points

- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/healthz

---

## 🏛️ Architecture Decisions

### Why This Stack?

1. **FastAPI Backend**
   - Fast, modern Python framework
   - Automatic API documentation
   - Native async support
   - Type hints for safety

2. **PyMuPDF (fitz)**
   - Most powerful Python PDF library
   - Supports complex operations
   - Good performance

3. **Next.js Frontend**
   - Server-side rendering capabilities
   - API routes for backend proxy
   - Built-in optimization
   - Great developer experience

4. **TypeScript**
   - Type safety prevents bugs
   - Better IDE support
   - Self-documenting code

### Code Organization Principles

1. **Separation of Concerns**
   - UI components only handle rendering
   - Business logic in hooks (`usePdfEditor`)
   - API calls in client (`pdf-api-client.ts`)

2. **DRY (Don't Repeat Yourself)**
   - Shared utilities (`api-utils.ts`)
   - PDF operation wrapper (`pdf-operation-wrapper.ts`)
   - Unified type definitions (`types/`)

3. **Type Safety**
   - All API responses typed
   - Custom error classes
   - Shared type definitions

4. **Error Handling**
   - Unified error handling with `handleApiError()`
   - Custom `ApiError` class with status codes
   - Frontend displays user-friendly messages

---

## 📝 Common Development Tasks

### Adding a New PDF Operation

**Step 1**: Add method to `pdf_processor.py`
```python
@staticmethod
def your_operation(pdf_path: str, output_path: str, ...) -> Dict[str, Any]:
    try:
        with fitz.open(pdf_path) as doc:
            # Your PDF manipulation logic
            doc.save(output_path)
            return {"success": True, "message": "Operation completed"}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**Step 2**: Add FastAPI endpoint in `scripts/pdf_api.py`
```python
@app.post("/pdf/your-operation")
async def your_operation(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    # your parameters
) -> FileResponse:
    # Use helper functions for consistency
    workdir = _mk_workdir()
    try:
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        output_path = workdir / "output.pdf"

        result = processor.your_operation(str(pdf_path), str(output_path), ...)

        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=f"your-operation-{pdf_file.filename}.pdf",
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))
```

**Step 3**: Add bridge function in `lib/python-bridge.ts`
```typescript
export async function yourOperation(
  pdf: PdfFilePayload,
  params: YourParams
): Promise<PdfBinaryResponse> {
  const formData = new FormData()
  formData.append('pdf_file', toFileField(pdf))
  // append your params
  return postPdf('/pdf/your-operation', formData)
}
```

**Step 4**: Add API route in `app/api/pdf/your-operation/route.ts`
```typescript
import { NextRequest } from 'next/server'
import { yourOperation } from '@/lib/python-bridge'
import { withPdfOperation } from '@/lib/pdf-operation-wrapper'
import { handleApiError, createSuccessResponse, validateRequired } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, ...params } = body

    const validation = validateRequired(body, ['fileName'])
    if (!validation.valid) return validation.error

    const result = await withPdfOperation(fileName, yourOperation, params)

    return createSuccessResponse({
      fileName: result.fileName,
      message: result.message || 'Operation completed'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
```

**Step 5**: Add client method in `lib/pdf-api-client.ts`
```typescript
static async yourOperation(params: {
  fileName: string
  // your params
}): Promise<ApiResponse<{ fileName: string }>> {
  const res = await fetch('/api/pdf/your-operation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  return res.json()
}
```

**Step 6**: Add to `usePdfEditor.ts` hook (if needed)

### Modifying UI Components

1. **Update `page.tsx`** for UI changes (should be minimal)
2. **Update `usePdfEditor.ts`** for business logic
3. **Use `PdfApiClient`** for API calls
4. **Use `useToast`** for user notifications

---

## 📐 Code Standards

### TypeScript

- Use `interface` for object shapes
- Use `type` for unions/intersections
- Prefer `const` over `let`
- Always type function parameters and returns
- Avoid `any` - use `unknown` if needed

**Example**:
```typescript
// Good
interface User {
  id: string
  name: string
}

async function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id) {
  // ...
}
```

### Python

- Follow PEP 8
- Use type hints
- Return typed dictionaries for API responses
- Handle errors with try/except

**Example**:
```python
# Good
def process_pdf(pdf_path: str, output_path: str) -> Dict[str, Any]:
    try:
        # logic
        return {"success": True, "message": "Done"}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

### Naming Conventions

- **Files**: kebab-case (`pdf-api-client.ts`)
- **Components**: PascalCase (`PDFViewer.tsx`)
- **Functions**: camelCase (`handleUpload`)
- **Constants**: UPPER_SNAKE_CASE (`PDF_API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`ApiResponse`)

---

## 🔧 Environment Variables

### Backend
No environment variables required. Runs on default settings.

### Frontend (`pdf-editor/.env.local`)

```bash
# Required
PDF_API_BASE_URL=http://localhost:8000

# Optional (for production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🐛 Troubleshooting

### Port Already in Use (8000)
```bash
# Find and kill process
lsof -ti :8000 | xargs kill -9
```

### PDF Service Unavailable
1. Check backend is running: http://localhost:8000/healthz
2. Check `.env.local` has correct `PDF_API_BASE_URL`
3. Check backend terminal for errors

### Module Not Found
```bash
# Backend
source .venv/bin/activate
pip install fastapi uvicorn pymupdf python-multipart

# Frontend
cd pdf-editor
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Backend FastAPI allows all origins by default
- If issues persist, check network tab in browser dev tools

---

## ✅ TODO & Future Improvements

### High Priority
- [ ] Add unit tests (backend and frontend)
- [ ] Add integration tests
- [ ] Implement proper authentication
- [ ] Add rate limiting

### Medium Priority
- [ ] PDF preview caching
- [ ] Batch operations
- [ ] Undo/redo functionality
- [ ] Export operation history

### Low Priority
- [ ] Dark mode
- [ ] Internationalization (i18n)
- [ ] Keyboard shortcuts
- [ ] Advanced text formatting

### Known Issues
- Large PDFs (>10MB) may be slow to process
- No progress indicator for long operations
- Limited error context in some cases

---

## 📚 Key Files Reference

| File | Purpose | Notes |
|------|---------|-------|
| `scripts/pdf_api.py` | FastAPI server | Main backend entry |
| `pdf_processor.py` | PDF operations | PyMuPDF wrapper |
| `lib/api-utils.ts` | API helpers | Error handling, validation |
| `lib/pdf-operation-wrapper.ts` | Operation wrapper | DRY for PDF ops |
| `hooks/usePdfEditor.ts` | Main state hook | Business logic |
| `lib/pdf-api-client.ts` | API client | Frontend API calls |
| `types/api.ts` | API types | Shared type defs |
| `types/pdf.ts` | PDF types | Shared type defs |

---

## 🎓 Learning Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **PyMuPDF**: https://pymupdf.readthedocs.io/
- **Next.js**: https://nextjs.org/docs
- **PDF.js**: https://mozilla.github.io/pdf.js/

---

## 💡 Tips for Claude

When working on this project:

1. **Always use the wrapper functions** (`withPdfOperation`, `handleApiError`) for consistency
2. **Check existing code first** before creating new patterns
3. **Maintain type safety** - add types before implementation
4. **Update this file** if you make architectural changes
5. **Follow the established patterns** - look at similar files as examples
6. **Test locally** before suggesting deployment changes

---

Last Updated: November 2025
Maintainer: Development Team
