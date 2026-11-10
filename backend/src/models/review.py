from sqlmodel import SQLModel, Field, Relationship
from typing import Optional


class Review(SQLModel, table=True):
    __tablename__ = "Reviews"

    id: int = Field(default=None, primary_key=True)
    rating: double = Field(nullable=False)
    comment: str = Field(nullable=False)
    #review_details_id: int = Field(default=None, foreign_key="ReviewDetails.id")
    review_details: ReviewDetails = Relationship(back_populates="Reviews", cascade_delete=True)
    liked_by: List["Accounts"] = Relationship(back_populates="Reviews")
    disliked_by: List["Accounts"] = Relationship(back_populates="Reviews")

    def update(self,
        ReviewDetails review_details, 
        double rating,
        string comment
    ):
        if review_details != null:
            self.review_details = review_details
        if rating != rating:
            self.rating = rating
        if comment != null:
            self.comment = comment

        #save
		with Session(engine) as session:
			session.add(self)
			session.commit()	
		
		return this

    def like(self, Account account):
        self.liked_by.append(account)

        #save
		with Session(engine) as session:
			session.add(self)
			session.commit()	
		
		return this

    def dislike(self, Account account):
        self.disliked_by.append(account)

        #save
		with Session(engine) as session:
			session.add(self)
			session.commit()	
		
		return this

    def remove_like(self, Account account):
        self.liked_by.remove(account)

        #save
		with Session(engine) as session:
			session.add(self)
			session.commit()	
		
		return self

    def remove_dislike(self, Account account):
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