from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class Account(SQLModel, table=True):
    __tablename__ = "Accounts"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(unique=True, nullable=False)
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    reviews_created: List["Reviews"] = Relationship(back_populates="Accounts")
    liked_reviews: List["Reviews"] = Relationship(back_populates="Accounts")
    disliked_reviews: List["Reviews"] = Relationship(back_populates="Accounts")
    favorite_classes: List["Courses"] = Relationship(back_populates="Accounts")