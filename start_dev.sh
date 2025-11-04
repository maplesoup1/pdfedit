#!/bin/bash

# PDF Editor - Full Stack Development Startup Script
# 同时启动后端和前端

set -e

echo "🚀 PDF Editor - Full Stack Development Mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 检查是否安装了 tmux 或 screen（用于分屏）
if command -v tmux &> /dev/null; then
    echo "Using tmux for split terminals..."

    # 创建新的 tmux 会话
    SESSION_NAME="pdf-editor-dev"

    # 杀死已存在的会话
    tmux kill-session -t $SESSION_NAME 2>/dev/null || true

    # 创建新会话并启动后端
    tmux new-session -d -s $SESSION_NAME -n "backend" "cd '$SCRIPT_DIR' && bash scripts/start_backend.sh"

    # 分割窗口并启动前端
    tmux split-window -h -t $SESSION_NAME "cd '$SCRIPT_DIR/pdf-editor' && echo '🚀 Starting Next.js frontend...' && npm run dev"

    # 附加到会话
    tmux attach-session -t $SESSION_NAME

else
    echo "⚠️  tmux not found. Starting services in background..."
    echo ""
    echo "Starting backend..."
    cd "$SCRIPT_DIR"
    source .venv/bin/activate
    python -m uvicorn scripts.pdf_api:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!

    echo "Starting frontend..."
    cd "$SCRIPT_DIR/pdf-editor"
    npm run dev &
    FRONTEND_PID=$!

    echo ""
    echo "✅ Services started!"
    echo "Backend PID: $BACKEND_PID"
    echo "Frontend PID: $FRONTEND_PID"
    echo ""
    echo "Backend: http://localhost:8000"
    echo "Frontend: http://localhost:3000"
    echo ""
    echo "To stop services:"
    echo "  kill $BACKEND_PID $FRONTEND_PID"
    echo ""
    echo "Or press Ctrl+C"

    # 等待进程
    wait
fi
