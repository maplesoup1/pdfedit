# PDF Editor - Full-Stack PDF Editing Application

A modern PDF editor with text insertion, image placement, page management, and more.

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **PyMuPDF (fitz)** - PDF processing library
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **PDF.js** - PDF preview

---

## 🚀 Quick Start

### Method 1: Using Startup Script (Recommended)

```bash
# Start full stack (backend + frontend)
./start_dev.sh

# Or start backend only
./scripts/start_backend.sh
```

### Method 2: Manual Start

**Start Backend**:
```bash
cd "/Users/xtom/Downloads/A2 3/pdf"
source .venv/bin/activate
python -m uvicorn scripts.pdf_api:app --host 0.0.0.0 --port 8000 --reload
```

**Start Frontend**:
```bash
cd pdf-editor
npm install  # First time only
npm run dev
```

For detailed startup instructions, see [START_GUIDE.md](START_GUIDE.md)

---

## 📋 Features

### PDF Editing Features
- ✅ Add text (customizable font size, color, position)
- ✅ Insert images (with size adjustment)
- ✅ Delete pages
- ✅ Reorder pages
- ✅ Merge PDFs
- ✅ Extract pages
- ✅ Redact text
- ✅ Get PDF information

### System Features
- ✅ Real-time PDF preview
- ✅ Automatic file cleanup (24-hour expiration)
- ✅ Unified error handling
- ✅ Type safety (TypeScript)
- ✅ Responsive design
- ✅ Local storage / Supabase storage

---

## 🌐 Access URLs

### Development Environment
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/healthz

---

## 📁 Project Structure

```
pdf/
├── scripts/
│   ├── pdf_api.py           # FastAPI service entry point
│   ├── start_backend.sh     # Backend startup script
│   └── cleanup-cron.ts      # Cleanup scheduled task
├── pdf_processor.py         # PDF processing core
├── .venv/                   # Python virtual environment
├── pdf-editor/              # Next.js frontend
│   ├── app/
│   │   ├── api/             # API Routes
│   │   ├── components/      # React components
│   │   └── page.tsx         # Main page
│   ├── lib/
│   │   ├── api-utils.ts     # API utilities
│   │   ├── pdf-api-client.ts    # API client
│   │   ├── pdf-operation-wrapper.ts  # PDF operation wrapper
│   │   ├── python-bridge.ts  # Python service bridge
│   │   └── supabase.ts      # Supabase client
│   ├── hooks/
│   │   ├── usePdfEditor.ts  # PDF editor hook
│   │   └── useToast.ts      # Toast notification hook
│   └── types/
│       ├── pdf.ts           # PDF type definitions
│       └── api.ts           # API type definitions
├── START_GUIDE.md           # Startup guide
├── DEPLOYMENT.md            # Deployment guide
├── OPTIMIZATION_SUMMARY.md  # Optimization summary
└── README.md                # This file
```

---

## 🔧 Environment Configuration

### Backend
No additional configuration needed. Use default settings.

### Frontend

Create `pdf-editor/.env.local`:

```bash
# FastAPI service URL (required)
PDF_API_BASE_URL=http://localhost:8000

# Supabase configuration (optional, defaults to local storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🛠️ Development

### Backend Development
```bash
# Activate virtual environment
source .venv/bin/activate

# Install new dependencies
pip install <package>

# Run tests
python -m pytest  # If tests exist

# View API documentation
open http://localhost:8000/docs
```

### Frontend Development
```bash
cd pdf-editor

# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run build

# Linting
npm run lint
```

---

## 📦 Dependency Management

### Python Dependencies
```bash
# List installed packages
pip list

# Install all dependencies
pip install fastapi uvicorn pymupdf python-multipart
```

### Node.js Dependencies
```bash
cd pdf-editor
npm install
```

---

## 🚢 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Key Steps
1. Deploy FastAPI backend (Docker/VPS/Cloud Run)
2. Configure `PDF_API_BASE_URL` environment variable
3. Deploy Next.js frontend (Vercel/Netlify)
4. Configure Supabase storage (optional)

---

## 🧹 Maintenance

### File Cleanup

**Automatic Cleanup** (Recommended):
```bash
# Add to crontab
0 * * * * cd /path/to/pdf-editor && npx tsx scripts/cleanup-cron.ts
```

**Manual Cleanup**:
```bash
# Via API
curl -X POST http://localhost:3000/api/pdf/cleanup

# Or using script
npx tsx pdf-editor/scripts/cleanup-cron.ts
```

---

## 📚 Documentation

- [START_GUIDE.md](START_GUIDE.md) - Detailed startup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md) - Code optimization summary

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Module not found
```bash
source .venv/bin/activate
pip install fastapi uvicorn pymupdf python-multipart
```

**Issue**: Port already in use
```bash
lsof -i :8000
kill -9 <PID>
```

### Frontend Issues

**Issue**: PDF service unavailable
- Check if backend is running: http://localhost:8000/healthz
- Check `.env.local` configuration

**Issue**: Dependency installation failed
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

MIT License

---

## 👥 Contributing

Issues and Pull Requests are welcome!

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [PyMuPDF](https://pymupdf.readthedocs.io/) - Powerful PDF processing library
- [Next.js](https://nextjs.org/) - React framework
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering engine
