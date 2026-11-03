from typing import Optional

from sqlmodel import Field, SQLModel


class University(SQLModel, table=True):
    __tablename__ = "universities"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)
    