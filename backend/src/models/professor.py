from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

# Model for a Professor at a university
class Professor(SQLModel, table=True):
    __tablename__ = "Professors"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    #university_id: int = Field(default=None, foreign_key="Universities.id")
    university: University = Relationship(back_populates="Professors")
    review_details: List["ReviewDetails"] = Relationship(back_populates="Professors")
