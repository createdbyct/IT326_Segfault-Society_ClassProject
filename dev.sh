#!/bin/bash
# Starts backend (FastAPI :2626) and frontend (Vite :5173). Ctrl+C stops both.
ROOT="$(cd "$(dirname "$0")" && pwd)"

if [ ! -x "$ROOT/backend/venv/bin/python" ] || [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "Looks like setup hasn't been run yet. Run ./setup.sh first."
  exit 1
fi

trap 'kill 0' EXIT
(cd "$ROOT/backend" && ./venv/bin/python run.py) &
(cd "$ROOT/frontend" && npm run dev) &
wait
