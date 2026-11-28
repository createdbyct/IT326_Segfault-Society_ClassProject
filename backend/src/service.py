from fastapi import HTTPException
from sqlmodel import Session

from src.database import engine
from src.models.account import Account
from src.models.university import University
from src.models.review import Review
from src.models.professor import Professor
from src.models.course import Course

from src.operations.review_ops import ReviewOps
from src.operations.university_ops import UniversityOps
from src.operations.course_ops import CourseOps
from src.operations.account_ops import AccountOps


class Service():

    def __init__(self):
        self.review_ops = ReviewOps()
        self.university_ops = UniversityOps()
        self.course_ops = CourseOps()
        self.account_ops = AccountOps()

    def update_class_review(self, review_id: int, rating: float, comment: str):
        if rating < 0 or rating > 5:
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 0.0 and 5.0",
            )

        if len(comment) > 500:
            raise HTTPException(
                status_code=400,
                detail="Comment must be 500 characters or less",
            )

        r = self.review_ops.get_review_by_id(review_id)

        if r is None:
            raise HTTPException(
                status_code=400,
                detail="Review does not exist",
            )

        self.review_ops.update_review(r=r, rating=rating, comment=comment)

        # Update the course rating in case the review rating changed
        r = self.review_ops.get_review_by_id(review_id)
        c = r.get_class_reviewed()
        self.course_ops.update_course_rating_based_on_reviews(c)

    def delete_review(self, review_id: int):
        r = self.review_ops.get_review_by_id(review_id)

        if r is None:
            raise HTTPException(
                status_code=400,
                detail="Review does not exist",
            )

        self.review_ops.delete_review(r)

    def create_course(self, code: str, university: str):
        if len(code) < 3 or len(code) > 10:
            raise HTTPException(
                status_code=400,
                detail="Code must be between 3 to 10 characters",
            )

        uni = self.university_ops.getUniversityByName(university)

        if uni is None:
            raise HTTPException(
                status_code=400,
                detail="University does not exist",
            )

        course = Course(code=code, university=uni)
        return self.course_ops.create_course(course)

    def add_course_to_favorite_list(self, account_id: int, course_id: int):
        account = self.account_ops.getAccountByID(account_id)

        if account is None:
            raise HTTPException(
                status_code=400,
                detail="Account does not exist",
            )

        course = self.course_ops.get_course_by_id(course_id)

        if course is None:
            raise HTTPException(
                status_code=400,
                detail="Class does not exist",
            )

        self.account_ops.addFavoriteCourseToAccount(account, course)

    def get_favorite_courses(self, account_id: int):
        account = self.account_ops.getAccountByID(account_id)

        if account is None:
            raise HTTPException(
                status_code=400,
                detail="Account does not exist",
            )

        return self.account_ops.getFavoriteCoursesForAccount(account)

    def create_review(
        self,
        course_id: int,
        account_id: int,
        grade_received: str,
        semester_taken: str,
        year_taken: str,
        textbook_required: bool,
        attendance_required: bool,
        professor_id: int,
        rating: float,
        comment: str
    ):
        course = self.course_ops.get_course_by_id(course_id)

        if course is None:
            raise HTTPException(
                status_code=400,
                detail="Course does not exist",
            )

        account = self.account_ops.getAccountByID(account_id)

        if account is None:
            raise HTTPException(
                status_code=400,
                detail="Account does not exist",
            )

        with Session(engine) as session:
            professor = session.get(Professor, professor_id)

        if professor is None:
            raise HTTPException(
                status_code=400,
                detail="Professor does not exist",
            )

        if not grade_received or not grade_received.strip():
            raise HTTPException(
                status_code=400,
                detail="Grade is required",
            )

        if not semester_taken or not semester_taken.strip():
            raise HTTPException(
                status_code=400,
                detail="Semester is required",
            )

        if not year_taken or not year_taken.strip():
            raise HTTPException(
                status_code=400,
                detail="Year is required",
            )

        if rating < 0 or rating > 5:
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 0.0 and 5.0",
            )

        if not comment or len(comment) > 500:
            raise HTTPException(
                status_code=400,
                detail="Comment must be between 1 and 500 characters",
            )

        if not isinstance(textbook_required, bool):
            raise HTTPException(
                status_code=400,
                detail="Textbook required must be true or false",
            )

        if not isinstance(attendance_required, bool):
            raise HTTPException(
                status_code=400,
                detail="Attendance required must be true or false",
            )

        return self.review_ops.create_review(
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

    def get_reviews(
        self,
        course_id: int,
        grade: str = None,
        semester: str = None,
        year: str = None
    ):
        course = self.course_ops.get_course_by_id(course_id)

        if course is None:
            raise HTTPException(
                status_code=400,
                detail="Course does not exist",
            )

        if grade is not None and not grade.strip():
            raise HTTPException(
                status_code=400,
                detail="Grade cannot be empty",
            )

        if semester is not None and not semester.strip():
            raise HTTPException(
                status_code=400,
                detail="Semester cannot be empty",
            )

        if year is not None and not year.strip():
            raise HTTPException(
                status_code=400,
                detail="Year cannot be empty",
            )

        return self.review_ops.get_reviews(
            course_id=course_id,
            grade_received=grade,
            semester_taken=semester,
            year_taken=year
        )

    def get_reviews_ordered_by_likes(self, course_id: int):
        course = self.course_ops.get_course_by_id(course_id)

        if course is None:
            raise HTTPException(
                status_code=400,
                detail="Course does not exist",
            )

        return self.review_ops.get_reviews_ordered_by_likes(course_id)