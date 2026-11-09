from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

# Model for a Class at a university
class Course(SQLModel, table=True):
    __tablename__ = "Course"

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, nullable=False)
    university_id: Optional[int] = Field(
        default=None,
        foreign_key="universities.id"
    )
    university: "University" = Relationship(back_populates="courses")
    rating: float = Field(index=True)
    review_details: List["ReviewDetails"] = Relationship(back_populates="classes")
    favorited_by: List["Account"] = Relationship(back_populates="favorite_classes")
