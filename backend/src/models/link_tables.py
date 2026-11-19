from sqlmodel import Field, Relationship, Session, SQLModel, create_engine

class FavoriteCourse(SQLModel, table=True):
    account_id: int | None = Field(default=None, foreign_key="Accounts.id", primary_key=True)
    course_id: int | None = Field(default=None, foreign_key="Courses.id", primary_key=True)

class ReviewLike(SQLModel, table=True):
    account_id: int | None = Field(default=None, foreign_key="Accounts.id", primary_key=True)
    review_id: int | None = Field(default=None, foreign_key="Reviews.id", primary_key=True)

class ReviewDislike(SQLModel, table=True):
    account_id: int | None = Field(default=None, foreign_key="Accounts.id", primary_key=True)
    review_id: int | None = Field(default=None, foreign_key="Reviews.id", primary_key=True)
