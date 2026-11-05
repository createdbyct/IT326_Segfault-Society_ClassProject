from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

# Model for a Class at a university
class Course(SQLModel, table=True):
    __tablename__ = "Courses"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, nullable=False)
    #university_id: int = Field(default=None, foreign_key="Universities.id")
    university: University = Relationship(back_populates="Courses")
    rating: float = Field(index=True)
    reviews: List["ReviewDetails"] = Relationship(back_populates="Courses")
    favorited_by: List["Account"] = Relationship(back_populates="Courses")
