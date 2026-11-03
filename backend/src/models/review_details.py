from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional

class ReviewDetails(SQLModel, table=True):
    __tablename__ = "ReviewDetails"

    id: Optional[int] = Field(default=None, primary_key=True)
    class_id: int = Field(default=None, foreign_key="Classes.id")
    created_by_account_id: int = Field(default=None, foreign_key="Accounts.id")
    grade_received: str = Field(nullable=False)
    semester_taken: str = Field(nullable=False)
    year_taken: str = Field(nullable=False)
    textbook_required: bool = Field(nullable=False)
    attendance_required: bool = Field(nullable=False)
    professor_id: int = Field(default=None, foreign_key="Professors.id")