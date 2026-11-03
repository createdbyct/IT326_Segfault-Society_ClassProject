from sqlmodel import SQLModel, Field
from typing import Optional


class Review(SQLModel, table=True):
    __tablename__ = "Reviews"

    id: int = Field(default=None, primary_key=True)
    rating: float = Field(nullable=False)
    comment: str = Field(nullable=False)
    review_details_id: int = Field(default=None, foreign_key="ReviewDetails.id")
