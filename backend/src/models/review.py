from sqlmodel import SQLModel, Field
from typing import Optional


class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    rating: float = Field(nullable=False)
    comment: str = Field(nullable=False)
