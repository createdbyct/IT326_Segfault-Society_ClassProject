#!/usr/bin/env python3
"""
Convenience launcher for the backend server.
Equivalent to: uvicorn main:app --app-dir src --reload --port 2626

Usage:
    python3 run.py
"""
import sys

try:
    import uvicorn
except ImportError:
    print("uvicorn isn't installed in this Python environment.")
    print("Make sure your venv is active (or just run ./setup.sh from the project root. Manual fix:")
    print("    pip install -r requirements.txt")
    sys.exit(1)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=2626, reload=True, app_dir="src")
