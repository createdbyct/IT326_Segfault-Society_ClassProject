from sqlmodel import *
from src.database import engine
from typing import List, TYPE_CHECKING
from src.models.university import University
from src.models.link_tables import FavoriteCourse

if TYPE_CHECKING:
    from src.models.review_details import ReviewDetails
    from src.models.account import Account


# Model for a Course at a university
class Course(SQLModel, table=True):
    __tablename__ = "Courses"

    id: int = Field(default=None, primary_key=True)
    code: str = Field(index=True, nullable=False)
    university_id: int = Field(default=None, foreign_key="Universities.id")
    university: "University" = Relationship(back_populates="courses")
    rating: float = Field(default=0.0, index=True)
    reviews: List["ReviewDetails"] = Relationship(back_populates="class_reviewed")
    favorited_by: List["Account"] = Relationship(back_populates="favorite_courses", link_model=FavoriteCourse)

    # Constructor

    def __init__(self, code: str, university: University, rating: float = 0.0):
        super().__init__(code=code, university=university, rating=rating)

    # Methods

    def update_rating(self, f: float) -> float:
        self.rating = f
        with Session(engine) as session:
            session.add(self)
            session.commit()
            return self.rating

    def update_details(self, s: str, university: University) -> "Course":
        if s is not None:
            self.code = s
        if university is not None:
            self.university = university
        return self

    def add_review(self, rd: "ReviewDetails") -> None:
        if rd not in self.reviews:
            self.reviews.append(rd)

    def remove_review(self, rd: "ReviewDetails") -> None:
        if rd in self.reviews:
            self.reviews.remove(rd)

    def add_favorited_by(self, account: "Account") -> None:
        if account not in self.favorited_by:
            self.favorited_by.append(account)

    def remove_favorited_by(self, account: "Account") -> None:
        if account in self.favorited_by:
            self.favorited_by.remove(account)

    # Getters

    def get_id(self):
        return self.id

    def get_code(self):
        return self.code

    def get_university(self):
        return self.university

    def get_rating(self):
        return self.rating

    def get_reviews(self):
        return self.reviews

    def get_favorited_by(self):
        return self.favorited_by
