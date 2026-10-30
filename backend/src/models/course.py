from sqlmodel import SQLModel, Field
from typing import Optional

# Model for a Class at a university
class Course(SQLModel, table=True):
    __tablename__ = "Course"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, nullable=False)
    university_id: int = Field(default=None, foreign_key="university.id")
    university: University = Relationship(back_populates="classes")
    rating: float = Field(index=True)
    review_details: List["ReviewDetails"] = Relationship(back_populates="classes")
    favorited_by: List["Account"] = Relationship(back_populates="favorite_classes")
