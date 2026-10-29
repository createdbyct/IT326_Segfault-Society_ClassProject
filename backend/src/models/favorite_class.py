from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional

class FavoriteClass(SQLModel, table=True):
    __tablename__ = "FavoriteClasses"

    id: Optional[int] = Field(default=None, primary_key=True)
    class_id: int = Field(default=None, foreign_key="Classes.id")
    account_id: int = Field(default=None, foreign_key="Accounts.id")