
import Service

class Controller():
	service = Service()

	def create_new_account(self, username: str, password: str, email: str):
		# Pass raw parameters to service
		return self.service.create_new_account(username, password, email)


	def delete_account(self, username: str, password: str):
		# Pass raw parameters to service
		return self.service.delete_account(username, password)


	def update_account(self, username: str, old_password: str, new_password: str, email: str):
		# Pass raw parameters to service
		return self.service.update_account(username, old_password, new_password, email)

	def login(self, username: str, password: str):
		# Pass raw parameters to service
		return self.service.login(username, password)

	def logout(self, username):
		# No validation necessary
		return True
		
	def update_class_review(self, review_id: int, rating: float, comment: str):
		return self.service.update_class_review(review_id, rating, comment)

	def delete_review(self, review_id: int):
		return self.service.delete_review(review_id)

	def create_class(self, code: str, university: str):
		return self.service.create_class(code, university)

	def add_course_to_favorite_list(self, account_id: int, course_id: int):
		return self.service.add_course_to_favorite_list(account_id, course_id)

	def get_favorite_classes(self, account_id: int):
		return self.service.get_favorite_classes(account_id)
