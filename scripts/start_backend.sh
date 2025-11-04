#!/bin/bash

# PDF Editor - Backend Startup Script
# 启动 FastAPI 后端服务

set -e

echo "🚀 Starting PDF Editor Backend..."

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found at .venv"
    echo "Please create it with: python3 -m venv .venv"
    exit 1
fi

# 激活虚拟环境
echo "📦 Activating virtual environment..."
source .venv/bin/activate

# 检查依赖
echo "🔍 Checking dependencies..."
if ! python -c "import fastapi" 2>/dev/null; then
    echo "⚠️  Missing dependencies. Installing..."
    pip install fastapi uvicorn pymupdf python-multipart
fi

# 启动服务器
echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo "💚 Health Check: http://localhost:8000/healthz"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python -m uvicorn scripts.pdf_api:app --host 0.0.0.0 --port 8000 --reload
