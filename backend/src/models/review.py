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

    def update(
        ReviewDetails review_details, 
        double rating,
        string comment
    ):
        if review_details != null:
            this.review_details = review_details
        if rating != rating:
            this.rating = rating
        if comment != null:
            this.comment = comment

        #save
		with Session(engine) as session:
			session.add(this)
			session.commit()	
		
		return this

    def like(Account account):
        this.liked_by.append(account)

        #save
		with Session(engine) as session:
			session.add(this)
			session.commit()	
		
		return this

    def dislike(Account account):
        this.disliked_by.append(account)

        #save
		with Session(engine) as session:
			session.add(this)
			session.commit()	
		
		return this

    def remove_like(Account account):
        this.liked_by.remove(account)

        #save
		with Session(engine) as session:
			session.add(this)
			session.commit()	
		
		return this

    def remove_dislike(Account account):
        this.disliked_by.remove(account)

        #save
		with Session(engine) as session:
			session.add(this)
			session.commit()	
		
		return this

    def get_id():
        return this.id

    def get_review_details():
        return this.review_details

    def get_rating():
        return this.rating

    def get_comment():
        return this.comment

    def get_liked_by():
        return this.liked_by

    def get_disliked_by():
        return this.disliked_by