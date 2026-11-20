from sqlmodel import Session, select

from src.database import engine
from src.dboperations.account_ops import AccountOps
from src.dboperations.course_ops import CourseOps
from src.dboperations.university_ops import UniversityOps
from src.models.course import Course
from src.models.review import Review


class ClassFeatureRepository:
    def __init__(self):
        self.accounts = AccountOps()
        self.courses = CourseOps()
        self.universities = UniversityOps()

    def get_review_by_id(self, review_id: int) -> Review | None:
        with Session(engine) as session:
            return session.get(Review, review_id)

    def get_ranked_courses(self, limit: int, descending: bool) -> list[Course]:
        order = Course.rating.desc() if descending else Course.rating.asc()
        statement = (
            select(Course)
            .where(Course.reviews.any())
            .order_by(order, Course.id)
            .limit(limit)
        )
        with Session(engine) as session:
            return list(session.exec(statement).all())

    def course_code_exists(self, code: str, university_id: int, course_id: int) -> bool:
        statement = (
            select(Course.id)
            .where(
                Course.code == code,
                Course.university_id == university_id,
                Course.id != course_id,
            )
            .limit(1)
        )
        with Session(engine) as session:
            return session.exec(statement).first() is not None