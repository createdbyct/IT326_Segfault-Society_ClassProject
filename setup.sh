#!/bin/bash
# One-time setup for macOS / Linux. Run from the project root: ./setup.sh
# Use ./setup.sh --reset-db to re-enter the Neon connection string.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- Check prerequisites ---
if ! command -v uv >/dev/null 2>&1; then
  echo "❌ uv not found. Install it, then open a new terminal and re-run ./setup.sh"
  echo "   macOS:  brew install uv"
  echo "   Other:  curl -LsSf https://astral.sh/uv/install.sh | sh"
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ Node.js / npm not found. Install Node 20+ from https://nodejs.org"
  exit 1
fi

# --- Backend ---
echo "▶ Setting up backend (uv installs Python 3.14 automatically if needed)..."
cd "$ROOT/backend"
rm -rf venv                      # old pip-based venv from before the switch to uv
uv sync                          # creates .venv and installs the exact versions in uv.lock

# --- Database config (Neon) ---
needs_url=false
if [ ! -f .env ] || ! grep -q '^DATABASE_URL=postgres' .env || grep -q 'USER:PASSWORD' .env; then
  needs_url=true
elif [ "$1" = "--reset-db" ]; then
  needs_url=true
fi

if $needs_url; then
  echo ""
  echo "🔑 Neon database connection needed."
  echo "   Get the connection string from Neon (Project → Connect). It starts with postgresql://"
  while true; do
    read -r -p "   Paste DATABASE_URL (or press Enter to skip for now): " DB_URL
    if [ -z "$DB_URL" ]; then
      [ -f .env ] || cp .env.example .env
      echo "   Skipped. Re-run ./setup.sh when you have it."
      break
    elif [[ "$DB_URL" == postgres* ]]; then
      read -r -p "   Paste DATABASE_URL_POOLED (optional, Enter to skip): " DB_POOLED
      printf 'DATABASE_URL=%s\nDATABASE_URL_POOLED=%s\n' "$DB_URL" "$DB_POOLED" > .env
      echo "   Saved to backend/.env"
      break
    else
      echo "   That doesn't look like a Postgres URL. It should start with postgresql://"
    fi
  done
fi

if grep -q '^DATABASE_URL=postgres' .env && ! grep -q 'USER:PASSWORD' .env; then
  echo "▶ Creating database tables (safe to re-run)..."
  uv run python init_db.py
fi

# --- Frontend ---
echo "▶ Setting up frontend..."
cd "$ROOT/frontend"
npm install

chmod +x "$ROOT/dev.sh"
echo ""
echo "✅ Setup complete. Start everything with: ./dev.sh"
