"""
Drop every table and recreate it from the current models.
Deletes ALL data on the Neon branch in backend/.env.

    uv run python reset_db.py          (asks for confirmation)
    uv run python reset_db.py --yes    (no prompt)
"""
import sys

from sqlmodel import SQLModel

from src.database import engine
# Import every model here (same list as init_db.py) so its table gets reset
from src.models.user import User  # noqa: F401
from src.models.account import Account  
from src.models.university import University
from src.models.review import Review 
from src.models.review_details import ReviewDetails
from src.models.review_like import ReviewLike
from src.models.review_dislike import ReviewDislike
from src.models.favorite_class import FavoriteClass
from src.models.professor import Professor  
from src.models.class import Class

if "--yes" not in sys.argv:
    host = engine.url.host or "unknown host"
    print(f"Target database: {host}")
    if input("Drop and recreate all tables? Type 'reset': ").strip() != "reset":
        sys.exit("Cancelled. Nothing was changed.")

engine.echo = False
SQLModel.metadata.drop_all(engine)
SQLModel.metadata.create_all(engine)
print("✅ Recreated:", ", ".join(SQLModel.metadata.tables))
