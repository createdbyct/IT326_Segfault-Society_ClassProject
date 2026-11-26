from src.service import Service

class Controller():
	def __init__(self):
		self.service = Service()
	
	def update_class_review(self, review_id: int, rating: float, comment: str):
		self.service.update_class_review(review_id, rating, comment)

	def delete_review(self, review_id: int):
		self.service.delete_review(review_id)

	def create_course(self, code: str, university: str):
		return self.service.create_course(code, university)

	def add_course_to_favorite_list(self, account_id: int, course_id: int):
		self.service.add_course_to_favorite_list(account_id, course_id)

	def get_favorite_courses(self, account_id: int):
		return self.service.get_favorite_courses(account_id)