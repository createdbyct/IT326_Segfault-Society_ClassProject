from sqlmodel import SQLModel, Field
from typing import Optional

# Model for a Professor at a university
class Professor(SQLModel, table=True):
    __tablename__ = "Professors"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    university_id: int = Field(default=None, foreign_key="university.id")
    university: University = Relationship(back_populates="universities")
    review_details: List["ReviewDetails"] = Relationship(back_populates="professors")
