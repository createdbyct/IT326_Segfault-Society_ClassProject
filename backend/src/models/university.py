from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel

class University(SQLModel, table=True):
    __tablename__ = "universities"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, nullable=False)

    courses: List["Course"] = Relationship(back_populates="university")

    # Updates the university name
    def update_name(self, name: str):
        self.name = name
        return self

    # Adds a course to the university
    def add_course(self, course: "Course"):
        if course not in self.courses:
            self.courses.append(course)

    # Removes a course from the university
    def remove_course(self, course: "Course"):
        if course in self.courses:
            self.courses.remove(course)

    # Getters
    def get_id(self) -> int:
        return self.id

    def get_name(self) -> str:
        return self.name

    def get_courses(self) -> List["Course"]:
        return self.courses