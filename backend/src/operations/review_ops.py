from src.database import engine
from sqlmodel import *
from src.models.review import Review
from src.models.review_details import ReviewDetails
from src.models.professor import Professor
from src.models.course import Course
from src.models.account import Account

class ReviewOps():
	def create_review(self, 
		course: Course, 
		account: Account,
		grade_received: str, 
		semester_taken: str, 
		year_taken: str, 
		textbook_required: bool, 
		attendance_required: bool, 
		professor: Professor, 
		rating: float,
		comment: str
	):
		review_details = ReviewDetails(class_reviewed=course, class_id=course.id, created_by_account=account, created_by_account_id=account.id, grade_received=grade_received, year_taken=year_taken, semester_taken=semester_taken,textbook_required=textbook_required, attendance_required=attendance_required, professor=professor, professor_id=professor.id)
		review = Review(review_details=review_details, rating=rating, comment=comment)
		with Session(engine) as session:
			session.add(review)
			session.commit()	
			session.refresh(review)
			return review.id

	def delete_review(self, r: "Review"):
		with Session(engine) as session:
			session.delete(r)
			session.commit()	

	def get_review_by_id(self, id: int):
		with Session(engine) as session:
			statement = select(Review).where(Review.id == id)
			r = session.exec(statement)
			return r

	def get_reviews(self, 
		course: "Course" = None, 
		grade_received: str = None, 
		semester_taken: str = None, 
		year_taken: str = None, 
		textbook_required: bool = None, 
		attendance_required: bool = None, 
		professor: "Professor" = None, 
		rating: float = None,
	):
		with Session(engine) as session:
			statement = select(Review)

			if course != None:
				statement = statement.where(Review.get_review_details().class_reviewed == course)
			if grade_received != None:
				statement = statement.where(Review.get_review_details().grade_received == grade_received)
			if semester_taken != None:
				statement = statement.where(Review.get_review_details().semester_taken == semester_taken)
			if year_taken != None:
				statement = statement.where(Review.get_review_details().year_taken == year_taken)
			if textbook_required != None:
				statement = statement.where(Review.get_review_details().textbook_required == textbook_required)
			if attendance_required != None:
				statement = statement.where(Review.get_review_details().attendance_required == attendance_required)
			if professor != None:
				statement = statement.where(Review.get_review_details().professor == professor)
			if rating != None:
				statement = statement.where(Review.rating == rating)

			reviews = session.exec(statement)
			return reviews

	def update_review(self, r: "Review", review_details: "ReviewDetails" = None, rating: float = None, comment: str = None):
		return r.update(review_details, rating, comment)

	def like_review(self, r: "Review", account: "Account"):
		r.like(account)

	def dislike_review(self, r: "Review", account: "Account"):
		r.dislike(account)

	def remove_like_for_review(self, r: "Review", account: "Account"):
		r.remove_like(account)

	def remove_dislike_for_review(self, r: "Review", account: "Account"):
		r.remove_dislike(account)

	def update_review_details(self, 
		rd: "ReviewDetails", 
		course: "Course" = None, 
		account: "Account" = None, 
		grade_received: str = None, 
		semester_taken: str = None, 
		year_taken: str = None, 
		textbook_required: bool = None, 
		attendance_required: bool = None, 
		professor: "Professor" = None
	): 
		return rd.update(course, account, grade_received, semester_taken, year_taken, textbook_required, attendance_required, professor)