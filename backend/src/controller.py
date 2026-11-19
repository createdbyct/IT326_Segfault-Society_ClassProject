
class Controller():
	service = Service()
	
	def update_class_review(self, review_id: int, rating: float, comment: str):
		return service.update_class_review(review_id, rating, comment)

	def delete_review(self, review_id: int):
		return service.delete_review(review_id)

	def create_class(self, code: str, university: str):
		return service.create_class(code, university)

	def add_course_to_favorite_list(self, account_id: int, course_id: int):
		return service.add_course_to_favorite_list(account_id, course_id)

	def get_favorite_classes(self, account_id: int):
		return service.get_favorite_classes(account_id)