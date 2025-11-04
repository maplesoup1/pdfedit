# Deployment Guide

## Required Configuration

### 1. FastAPI Service

The FastAPI backend must be deployed and accessible before deploying the Next.js frontend.

**Environment Variable (REQUIRED):**
```bash
PDF_API_BASE_URL=https://your-fastapi-service.com
```

- For development: `http://localhost:8000`
- For production: Your deployed FastAPI URL (must include protocol and port if non-standard)

**Setup Steps:**

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Set `PDF_API_BASE_URL` in `.env.local` (dev) or deployment environment (production)

3. Ensure the FastAPI service is running and accessible at the configured URL

**Important:** The application will throw a clear error at build time if `PDF_API_BASE_URL` is not configured, preventing deployment with localhost in production.

### 2. Storage Configuration (Optional)

By default, the app uses local file storage. For production, configure Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment Checklist

- [ ] FastAPI service deployed and running
- [ ] `PDF_API_BASE_URL` configured in deployment environment
- [ ] FastAPI service accessible from Next.js deployment (check CORS if needed)
- [ ] Supabase configured (if not using local storage)
- [ ] Test PDF operations in staging environment
