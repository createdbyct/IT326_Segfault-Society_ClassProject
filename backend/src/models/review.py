from typing import Optional, List
from sqlmodel import *
from src.database import engine

from src.models.link_tables import ReviewDislike
from src.models.link_tables import ReviewLike

class Review(SQLModel, table=True):
    __tablename__ = "Reviews"

    id: Optional[int] = Field(default=None, primary_key=True) 
    rating: float = Field(nullable=False)
    comment: str = Field(nullable=False)
    review_details_id: int = Field(foreign_key="ReviewDetails.id")
    review_details: ReviewDetails = Relationship(back_populates="review")
    liked_by: List["Account"] = Relationship(back_populates="liked_reviews", link_model=ReviewLike)
    disliked_by: List["Account"] = Relationship(back_populates="disliked_reviews", link_model=ReviewDislike)

    def update(self, 
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
        review_details = None
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            review_details = res.review_details
        review_details.update(course, account, grade_received, semester_taken, year_taken, textbook_required, attendance_required, professor)
        #update the attributes to the ones provided by the user
        if rating != None:
            self.rating = rating
        if comment != None:
            self.comment = comment
	
		#save
        with Session(engine) as session:
            session.add(self)
            session.commit()	
		
        return self

    def like(self, account: "Account"):
        #save
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            res.liked_by.append(account)
            session.add(res)
            session.commit()	
		
        return self

    def dislike(self, account: "Account"):
        #save
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            res.disliked_by.append(account)
            session.add(res)
            session.commit()	
		
        return self

    def remove_like(self, account: "Account"):
        #save
        with Session(engine) as session:
            statement = select(ReviewLike).where(ReviewLike.review_id==self.id and ReviewLike.account_id==account.id)
            results = session.exec(statement)
            res = results.one()
            session.delete(res)
            session.commit()
		
        return self

    def remove_dislike(self, account: "Account"):
        #save
        with Session(engine) as session:
            statement = select(ReviewDislike).where(ReviewDislike.review_id==self.id and ReviewDislike.account_id==account.id)
            results = session.exec(statement)
            res = results.one()
            session.delete(res)
            session.commit()
		
        return self

    def get_id(self):
        return self.id

    def get_review_details(self):
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.review_details

    def get_class_reviewed(self):
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.review_details.class_reviewed

    def get_created_by_account(self):
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.review_details.created_by_account

    def get_grade_received(self):
        with Session(engine) as session:
                statement = select(Review).where(Review.id==self.id)
                results = session.exec(statement)
                res = results.one()
                return res.review_details.grade_received

    def get_semester_taken(self):
        with Session(engine) as session:
                statement = select(Review).where(Review.id==self.id)
                results = session.exec(statement)
                res = results.one()
                return res.review_details.semester_taken

    def get_year_teken(self):
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.review_details.year_taken

    def get_textbook_required(self):
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.review_details.textbook_required

    def get_attendance_required(self):
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.review_details.attendance_required

    def get_professor(self):
        with Session(engine) as session:
            statement = select(Review).where(Review.id==self.id)
            results = session.exec(statement)
            res = results.one()
            return res.review_details.professor

    def get_rating(self):
        return self.rating

    def get_comment(self):
        return self.comment

    def get_liked_by(self):
        return self.liked_by

    def get_disliked_by(self):
        return self.disliked_by 