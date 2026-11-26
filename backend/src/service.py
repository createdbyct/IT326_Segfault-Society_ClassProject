from fastapi import HTTPException
from src.models.account import Account  
from src.models.university import University
from src.models.review import Review 
from src.models.professor import Professor  
from src.models.course import Course
from src.operations.review_ops import ReviewOps
from src.operations.university_ops import UniversityOps
from src.operations.course_ops import CourseOps
from src.operations.account_ops import AccountOps

class Service():
	def __init__(self):
		self.review_ops = ReviewOps()
		self.university_ops = UniversityOps()
		self.course_ops = CourseOps()
		self.account_ops = AccountOps()

	def update_class_review(self, review_id: int, rating: float, comment: str):
		if rating < 0 or rating > 5:
			raise HTTPException(
				status_code=400,
				detail="Rating must be between 0.0 and 5.0",
			)
		if len(comment) > 500: #this value is arbitrary, we could change it
			raise HTTPException(
				status_code=400,
				detail="Comment must be 500 characters or less",
			)
		r = self.review_ops.get_review_by_id(review_id)
		if r == None:
			raise HTTPException(
				status_code=400,
				detail="Review does not exist",
			)
		self.review_ops.update_review(r=r, rating=rating, comment=comment)
		#have to make sure we update the class's rating too, in case it changed
		r = self.review_ops.get_review_by_id(review_id)
		c = r.get_class_reviewed()
		self.course_ops.update_course_rating_based_on_reviews(c)

	def delete_review(self, review_id: int):
		r = self.review_ops.get_review_by_id(review_id)
		if r == None:
			raise HTTPException(
				status_code=400,
				detail="Review does not exist",
			)	
		self.review_ops.delete_review(r)
	
	def create_course(self, code: str, university: str):
		if len(code) < 3 or len(code) > 10: #make sure code is valid
			raise HTTPException(
				status_code=400,
				detail="Code must be between 3 to 10 characters",
			)	
		uni = self.university_ops.getUniversityByName(university)
		if uni is None: #make sure university exists
			raise HTTPException(
				status_code=400,
				detail="University does not exist",
			)	
		course = Course(code=code, university=uni)	
		return self.course_ops.create_course(course)

	def add_course_to_favorite_list(self, account_id: int, course_id: int):
		account = self.account_ops.getAccountByID(account_id)
		if account is None:
			raise HTTPException(
				status_code=400,
				detail="Account does not exist",
			)	
		course = self.course_ops.get_course_by_id(course_id)
		if course is None:
			raise HTTPException(
				status_code=400,
				detail="Class does not exist",
			)	
		self.account_ops.addFavoriteCourseToAccount(account, course)

	def get_favorite_courses(self, account_id: int):
		account = self.account_ops.getAccountByID(account_id)
		if account is None:
			raise HTTPException(
				status_code=400,
				detail="Account does not exist",
			)
		return self.account_ops.getFavoriteCoursesForAccount(account)