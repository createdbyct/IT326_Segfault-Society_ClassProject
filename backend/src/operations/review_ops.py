from src.database import engine
from sqlmodel import *
from src.models.review import Review
from src.models.review_details import ReviewDetails
from src.models.professor import Professor
from src.models.course import Course
from src.models.account import Account

class ReviewOps():

    def create_review(
        self,
        course: Course,
        account: Account,
        grade_received: str,
        semester_taken: str,
        year_taken: str,
        textbook_required: bool,
        attendance_required: bool,
        professor: Professor,
        rating: float,
        comment: str
    ):
        review_details = ReviewDetails(
            class_reviewed=course,
            class_id=course.id,
            created_by_account=account,
            created_by_account_id=account.id,
            grade_received=grade_received,
            year_taken=year_taken,
            semester_taken=semester_taken,
            textbook_required=textbook_required,
            attendance_required=attendance_required,
            professor=professor,
            professor_id=professor.id
        )

        review = Review(
            review_details=review_details,
            rating=rating,
            comment=comment
        )

        with Session(engine) as session:
            session.add(review)
            session.commit()
            session.refresh(review)
            return review.id

    def delete_review(self, r: "Review"):
        with Session(engine) as session:
            statement = select(ReviewDetails).where(
                ReviewDetails.review == r
            )
            results = session.exec(statement)
            review_details = results.one()

            session.delete(review_details)
            session.delete(r)
            session.commit()

    def get_review_by_id(self, id: int):
        with Session(engine) as session:
            statement = select(Review).where(Review.id == id)
            return session.exec(statement).first()

    def get_reviews(
        self,
        course_id: int = None,
        account_id: int = None,
        grade_received: str = None,
        semester_taken: str = None,
        year_taken: str = None,
        textbook_required: bool = None,
        attendance_required: bool = None,
        professor_id: int = None,
        rating: float = None,
    ):
        with Session(engine) as session:
            statement = select(Review).join(ReviewDetails)

            if course_id is not None:
                statement = statement.join(Course).where(
                    Course.id == course_id
                )

            if account_id is not None:
                statement = statement.join(Account).where(
                    Account.id == account_id
                )

            if grade_received is not None:
                statement = statement.where(
                    ReviewDetails.grade_received == grade_received
                )

            if semester_taken is not None:
                statement = statement.where(
                    ReviewDetails.semester_taken == semester_taken
                )

            if year_taken is not None:
                statement = statement.where(
                    ReviewDetails.year_taken == year_taken
                )

            if textbook_required is not None:
                statement = statement.where(
                    ReviewDetails.textbook_required == textbook_required
                )

            if attendance_required is not None:
                statement = statement.where(
                    ReviewDetails.attendance_required == attendance_required
                )

            if professor_id is not None:
                statement = statement.join(Professor).where(
                    Professor.id == professor_id
                )

            if rating is not None:
                statement = statement.where(Review.rating == rating)

            return session.exec(statement).all()

    def update_review(
        self,
        r: "Review",
        course: "Course" = None,
        account: "Account" = None,
        grade_received: str = None,
        semester_taken: str = None,
        year_taken: str = None,
        textbook_required: bool = None,
        attendance_required: bool = None,
        professor: "Professor" = None,
        rating: float = None,
        comment: str = None
    ):
        return r.update(
            course,
            account,
            grade_received,
            semester_taken,
            year_taken,
            textbook_required,
            attendance_required,
            professor,
            rating,
            comment
        )

    def like_review(self, review: "Review", account: "Account"):
        review.like(account)

    def dislike_review(self, review: "Review", account: "Account"):
        review.dislike(account)

    def remove_like_for_review(self, review: "Review", account: "Account"):
        review.remove_like(account)

    def remove_dislike_for_review(self, review: "Review", account: "Account"):
        review.remove_dislike(account)

    def update_review_details(
        self,
        rd: "ReviewDetails",
        course: "Course" = None,
        account: "Account" = None,
        grade_received: str = None,
        semester_taken: str = None,
        year_taken: str = None,
        textbook_required: bool = None,
        attendance_required: bool = None,
        professor: "Professor" = None
    ):
        return rd.update(
            course,
            account,
            grade_received,
            semester_taken,
            year_taken,
            textbook_required,
            attendance_required,
            professor
        )

    def get_reviews_ordered_by_likes(self, course_id: int):
        with Session(engine) as session:
            statement = (
                select(Review)
                .join(ReviewDetails)
                .where(ReviewDetails.class_id == course_id)
            )

            reviews = session.exec(statement).all()

            return sorted(
                reviews,
                key=lambda review: len(review.liked_by),
                reverse=True
            )