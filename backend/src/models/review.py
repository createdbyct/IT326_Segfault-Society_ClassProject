from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel

from src.models.link_tables import ReviewDislike
from src.models.link_tables import ReviewLike

class Review(SQLModel, table=True):
    __tablename__ = "Reviews"

    id: Optional[int] = Field(default=None, primary_key=True) 
    rating: float = Field(nullable=False)
    comment: str = Field(nullable=False)
    review_details_id: int = Field(default=None, foreign_key="ReviewDetails.id")
    review_details: ReviewDetails = Relationship(back_populates="review")
    liked_by: List["Account"] = Relationship(back_populates="liked_reviews", link_model=ReviewLike)
    disliked_by: List["Account"] = Relationship(back_populates="disliked_reviews", link_model=ReviewDislike)

    def update(self, 
        review_details: "ReviewDetails", 
        rating: float,
        comment: str
    ):
        if review_details != None:
            self.review_details = review_details
        if rating != rating:
            self.rating = rating
        if comment != None:
            self.comment = comment
        #save
        with Session(engine) as session:
            session.add(self)
            session.commit()	
		
        return this

    def like(self, account: "Account"):
        self.liked_by.append(account)

        #save
        with Session(engine) as session:
            session.add(self)
            session.commit()	
		
        return this

    def dislike(self, account: "Account"):
        self.disliked_by.append(account)

        #save
        with Session(engine) as session:
            session.add(self)
            session.commit()	
		
        return this

    def remove_like(self, account: "Account"):
        self.liked_by.remove(account)

        #save
        with Session(engine) as session:
            session.add(self)
            session.commit()	
		
        return self

    def remove_dislike(self, account: "Account"):
        self.disliked_by.remove(account)

        #save
        with Session(engine) as session:
            session.add(self)
            session.commit()	
		
        return self

    def get_id(self):
        return self.id

    def get_review_details(self):
        return self.review_details

    def get_rating(self):
        return self.rating

    def get_comment(self):
        return self.comment

    def get_liked_by(self):
        return self.liked_by

    def get_disliked_by(self):
        return self.disliked_by 