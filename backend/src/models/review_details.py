from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from typing import Optional

class ReviewDetails(SQLModel, table=True):
    __tablename__ = "ReviewDetails"

    id: Optional[int] = Field(default=None, primary_key=True)
    #class_id: int = Field(default=None, foreign_key="Classes.id")
    class_reviewed: Course = Relationship(back_populates="ReviewDetails")
    #created_by_account_id: int = Field(default=None, foreign_key="Accounts.id")
    created_by_account: Account = Relationship(back_populates="ReviewDetails")
    grade_received: str = Field(nullable=False)
    semester_taken: str = Field(nullable=False)
    year_taken: str = Field(nullable=False)
    textbook_required: bool = Field(nullable=False)
    attendance_required: bool = Field(nullable=False)
    #professor_id: int = Field(default=None, foreign_key="Professors.id")
    professor: Professor | None = Relationship(back_populates="ReviewDetails")

    def update(self, 
        Course course = null, 
        Account account = null, 
        string grade_received = null, 
        string semester_taken = null, 
        string year_taken = null, 
        bool textbook_required = null, 
        bool attendance_required = null, 
        Professor professor = null
    ):
        #update the attributes to the ones provided by the user
		if course != null:
			this.class_reviewed = course
		if account != null:
			this.created_by_account = account
		if gradeReceived != null:
			this.grade_received = grade_received
		if semesterTaken != null:
			this.semester_taken = semester_taken
		if yearTaken != null:
			this.year_taken = year_taken
		if textbookRequired != null:
			this.textbook_required = textbook_required
		if attendanceRequired != null:
			this.attendance_required = attendance_required
		if professor != null:
			this.professor = professor
	
		#save
		with Session(engine) as session:
			session.add(this)
			session.commit()	
		
		return this

    def get_id(self):
        return self.id

    def get_class_reviewed(self):
        return self.class_reviewed

    def get_created_by_account(self):
        return self.created_by_account

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
        return self.professor