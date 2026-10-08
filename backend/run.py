#!/usr/bin/env python3
"""
Convenience launcher for the backend server (port 2626, auto-reload).

Usage (from backend/):
    uv run python run.py
"""
import sys

try:
    import uvicorn
except ImportError:
    print("uvicorn isn't installed in this Python environment.")
    print("Run it through uv so the project's packages are used:")
    print("    uv run python run.py")
    sys.exit(1)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=2626, reload=True, app_dir="src")
