"""
Drop every table and recreate it from the current models.
Deletes ALL data on the Neon branch in backend/.env.

    ./venv/bin/python reset_db.py          (asks for confirmation)
    ./venv/bin/python reset_db.py --yes    (no prompt)
"""
import sys

from sqlmodel import SQLModel

from src.database import engine
# Import every model here (same list as init_db.py) so its table gets reset
from src.models.user import User  # noqa: F401

if "--yes" not in sys.argv:
    host = engine.url.host or "unknown host"
    print(f"Target database: {host}")
    if input("Drop and recreate all tables? Type 'reset': ").strip() != "reset":
        sys.exit("Cancelled. Nothing was changed.")

engine.echo = False
SQLModel.metadata.drop_all(engine)
SQLModel.metadata.create_all(engine)
print("✅ Recreated:", ", ".join(SQLModel.metadata.tables))
