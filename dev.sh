#!/bin/bash
# Starts backend (FastAPI :2626) and frontend (Vite :5173). Ctrl+C stops both.
ROOT="$(cd "$(dirname "$0")" && pwd)"

if ! command -v uv >/dev/null 2>&1 || [ ! -d "$ROOT/backend/.venv" ] || [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "Looks like setup hasn't been run yet. Run ./setup.sh first."
  exit 1
fi

trap 'kill 0' EXIT
(cd "$ROOT/backend" && uv run python run.py) &   # uv run also picks up any new packages from uv.lock
(cd "$ROOT/frontend" && npm run dev) &
wait
