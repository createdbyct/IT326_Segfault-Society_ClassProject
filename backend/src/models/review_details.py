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
    professor: Professor = Relationship(back_populates="ReviewDetails")