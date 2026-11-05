from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class University(SQLModel, table=True):
    __tablename__ = "Universities"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)
    classes: List["Classes"] = Relationship(back_populates="Universities")
    