from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional

class ReviewLike(SQLModel, table=True):
    __tablename__ = "ReviewLikes"

    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: int = Field(default=None, foreign_key="Reviews.id")
    account_id: int = Field(default=None, foreign_key="Accounts.id")