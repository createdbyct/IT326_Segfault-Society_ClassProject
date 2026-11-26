from sqlmodel import *
from src.database import engine
from datetime import datetime, timezone
from typing import Optional

from src.models.professor import Professor

class ReviewDetails(SQLModel, table=True):
    __tablename__ = "ReviewDetails"

    id: Optional[int] = Field(default=None, primary_key=True)
    review: Review = Relationship(back_populates="review_details")
    class_id: int = Field(default=None, foreign_key="Courses.id")
    class_reviewed: Course = Relationship(back_populates="reviews")
    created_by_account_id: int = Field(default=None, foreign_key="Accounts.id")
    created_by_account: Account = Relationship(back_populates="review_details_created")
    grade_received: str = Field(nullable=False)
    semester_taken: str = Field(nullable=False)
    year_taken: str = Field(nullable=False)
    textbook_required: bool = Field(nullable=False)
    attendance_required: bool = Field(nullable=False)
    professor_id: int = Field(default=None, foreign_key="Professors.id")
    professor: Professor | None = Relationship(back_populates="review_details")

    def update(self, 
        course: "Course" = None, 
        account: "Account" = None, 
        grade_received: str = None, 
        semester_taken: str = None, 
        year_taken: str = None, 
        textbook_required: bool = None, 
        attendance_required: bool = None, 
        professor: "Professor" = None
    ):
        #update the attributes to the ones provided by the user
        if course != None:
            self.class_reviewed = course
        if account != None:
            self.created_by_account = account
        if grade_received != None:
            self.grade_received = grade_received
        if semester_taken != None:
            self.semester_taken = semester_taken
        if year_taken != None:
            self.year_taken = year_taken
        if textbook_required != None:
            self.textbook_required = textbook_required
        if attendance_required != None:
            self.attendance_required = attendance_required
        if professor != None:
            self.professor = professor
	
		#save
        with Session(engine) as session:
            session.add(self)
            session.commit()	
		
        return self

    def get_id(self):
        return self.id

    def get_class_reviewed(self):
        with Session(engine) as session:
            statement = select(ReviewDetails).where(ReviewDetails.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.class_reviewed

    def get_created_by_account(self):
        with Session(engine) as session:
            statement = select(ReviewDetails).where(ReviewDetails.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.created_by_account

    def get_grade_received(self):
        return self.grade_received

    def get_semester_taken(self):
        return self.semester_taken

    def get_year_teken(self):
        return self.year_taken

    def get_textbook_required(self):
        return self.textbook_required

    def get_attendance_required(self):
        return self.attendance_required

    def get_professor(self):
        with Session(engine) as session:
            statement = select(ReviewDetails).where(ReviewDetails.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.professor
