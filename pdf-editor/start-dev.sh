#!/bin/bash

# Start FastAPI backend
echo "Starting FastAPI backend on port 8000..."
cd "$(dirname "$0")"
source venv/bin/activate
python scripts/api.py &
FASTAPI_PID=$!

# Wait for FastAPI to start
sleep 2

# Start Next.js frontend
echo "Starting Next.js frontend on port 3000..."
npm run dev &
NEXTJS_PID=$!

echo "Both services started!"
echo "FastAPI: http://localhost:8000"
echo "Next.js: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"

# Trap Ctrl+C to kill both processes
trap "kill $FASTAPI_PID $NEXTJS_PID; exit" INT

# Wait for both processes
wait
