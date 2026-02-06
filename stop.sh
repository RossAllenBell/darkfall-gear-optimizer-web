#!/bin/bash
if [ -f .dev-server.pid ]; then
  PID=$(cat .dev-server.pid)
  kill -- -"$PID" 2>/dev/null || kill "$PID" 2>/dev/null
  wait "$PID" 2>/dev/null
  echo "Dev server stopped (PID $PID)"
  rm .dev-server.pid
else
  echo "No .dev-server.pid file found. Trying to find Vite process..."
  pkill -f "vite" && echo "Vite process killed" || echo "No Vite process found"
fi
