from sqlmodel import Session, select
from typing import List, Optional
from src.database import engine
from src.models.course import Course
from src.models.university import University
from src.models.review_details import ReviewDetails
from src.models.account import Account

# Operations for a Course at a university
class CourseOps:
    def create_course(self, course: Course) -> None:
        with Session(engine) as session:
            session.add(course)
            session.commit()
            session.refresh(course)

    def delete_course(self, course: Course) -> None:
        with Session(engine) as session:
            db_course = session.get(Course, course.id)
            if db_course is not None:
                session.delete(db_course)
                session.commit()

    def get_course_by_id(self, id: int) -> Optional[Course]:
        with Session(engine) as session:
            return session.get(Course, id)

    def get_courses(self, s: str, university: University) -> List[Course]:
        with Session(engine) as session:
            statement = select(Course)
            if s:
                statement = statement.where(Course.code.ilike(f"%{s}%"))
            if university is not None:
                statement = statement.where(Course.university == university)
            return list(session.exec(statement).all())

    def update_course_details(self, course: Course, s: str, university: University) -> Course:
        with Session(engine) as session:
            session.add(course)
            course.update_details(s, university)
            session.commit()
            session.refresh(course)
            return course

    def update_course_rating(self, course: Course, rating: float) -> Course:
        with Session(engine) as session:
            session.add(course)
            course.update_rating(rating)
            session.commit()
            session.refresh(course)
            return course

    def add_review_to_course(self, course: Course, rd: ReviewDetails) -> None:
        with Session(engine) as session:
            session.add(course)
            course.add_review(rd)
            session.commit()

    def remove_review_from_course(self, courses: Course, rd: ReviewDetails) -> None:
        with Session(engine) as session:
            session.add(courses)
            courses.remove_review(rd)
            session.commit()

    def add_favorited_by_to_course(self, course: Course, account: Account) -> None:
        with Session(engine) as session:
            session.add(course)
            course.add_favorited_by(account)
            session.commit()

    def remove_favorited_by_from_course(self, course: Course, account: Account) -> None:
        with Session(engine) as session:
            session.add(course)
            course.remove_favorited_by(account)
            session.commit()
