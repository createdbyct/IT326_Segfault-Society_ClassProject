from datetime import datetime, timezone
from typing import TYPE_CHECKING

from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from sqlmodel import Field, Relationship, SQLModel

from src.models.favorite_class import FavoriteClass
from src.models.review_dislike import ReviewDislike
from src.models.review_like import ReviewLike

if TYPE_CHECKING:
    from src.models.course import Course
    from src.models.review import Review
    from src.models.review_details import ReviewDetails


password_hasher = PasswordHash.recommended()


class Account(SQLModel, table=True):
    __tablename__ = "Accounts"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(unique=True, nullable=False)
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    favorite_courses: list["Course"] = Relationship(
        back_populates="favorited_by",
        link_model=FavoriteClass,
    )

    liked_reviews: list["Review"] = Relationship(
        back_populates="liked_by",
        link_model=ReviewLike,
    )

    disliked_reviews: list["Review"] = Relationship(
        back_populates="disliked_by",
        link_model=ReviewDislike,
    )

    review_details_created: list["ReviewDetails"] = Relationship(
        back_populates="created_by_account"
    )

    @property
    def reviews_created(self) -> list["Review"]:
        return [
            details.review
            for details in self.review_details_created
            if details.review is not None
        ]

    def updateInformation(self, username: str, password: str) -> "Account":
        username = username.strip()

        if not username or not password.strip():
            raise ValueError("Username and password are required.")

        self.username = username
        self.password_hash = password_hasher.hash(password)
        return self

    def addFavoriteCourse(self, course: "Course") -> None:
        if course not in self.favorite_courses:
            self.favorite_courses.append(course)

    def removeFavoriteCourse(self, course: "Course") -> None:
        if course in self.favorite_courses:
            self.favorite_courses.remove(course)

    def likeReview(self, review: "Review") -> None:
        self.removeDislikedReview(review)

        if review not in self.liked_reviews:
            self.liked_reviews.append(review)

    def removeLikedReview(self, review: "Review") -> None:
        if review in self.liked_reviews:
            self.liked_reviews.remove(review)

    def dislikeReview(self, review: "Review") -> None:
        self.removeLikedReview(review)

        if review not in self.disliked_reviews:
            self.disliked_reviews.append(review)

    def removeDislikedReview(self, review: "Review") -> None:
        if review in self.disliked_reviews:
            self.disliked_reviews.remove(review)

    def addReviewCreated(self, review: "Review") -> None:
        details = review.review_details
        author = details.created_by_account

        if author is not None and author is not self:
            raise ValueError("This review already belongs to another account.")

        details.created_by_account = self

    def removeReviewCreated(self, review: "Review") -> None:
        details = review.review_details

        if details.created_by_account is self:
            details.created_by_account = None

    def getID(self) -> int | None:
        return self.id

    def getUsername(self) -> str:
        return self.username

    def getEmail(self) -> str:
        return self.email

    def getCreatedAt(self) -> datetime:
        return self.created_at

    def validatePassword(self, password: str) -> bool:
        try:
            return password_hasher.verify(password, self.password_hash)
        except (UnknownHashError, ValueError):
            return False
