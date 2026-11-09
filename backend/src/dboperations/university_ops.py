from typing import List

from sqlmodel import Session, select

from src.database import engine
from src.models.university import University
from src.models.course import Course
from src.dboperations.db_operations import DBOperations

class UniversityOps(DBOperations):

    # Creates a university
    def createUniversity(self, university: University):
        self.save(university)

    # Deletes a university
    def deleteUniversity(self, university: University):
        self.delete(university)

    # Gets university by its ID
    def getUniversityById(self, id: int) -> University:
        with Session(engine) as session:
            return session.get(University, id)

    # Gets universities by name
    def getUniversitiesByName(self, name: str) -> List[University]:
        with Session(engine) as session:
            statement = select(University).where(
                University.name.contains(name)
            )
            return session.exec(statement).all()

    # Updates a university's name
    def updateUniversity(self, university: University, name: str) -> University:
        with Session(engine) as session:
            university = session.merge(university)
            university.update_name(name)
            session.add(university)
            session.commit()
            session.refresh(university)
            return university

    # Adds a course to a university
    def addCourseToUniversity(self, university: University, course: Course):
        with Session(engine) as session:
            university = session.merge(university)
            course = session.merge(course)
            university.add_course(course)
            session.add(university)
            session.commit()

    # Removes a course from a university
    def removeCourseFromUniversity(self, university: University, course: Course):
        with Session(engine) as session:
            university = session.merge(university)
            course = session.merge(course)
            university.remove_course(course)
            session.add(university)
            session.commit()