class Service():
	review_ops = ReviewOps()
	university_ops = UniversityOps()
	course_ops = CourseOps()
	account_ops = AccountOps()

	def update_class_review(self, review_id: int, rating: float, comment: str):
		if rating < 0 or rating > 5:
			return False
		if len(comment) > 500: #this value is arbitrary, we could change it
			return False
		r = review_ops.get_review_by_id(review_id)
		if r == None:
			return False
		review_ops.update_review(r, rating, comment)
		return True

	def delete_review(self, review_id: int):
		r = review_ops.get_review_by_id(review_id)
		if r == None:
			return False	
		review_ops.delete_review(r)
		return True
	
	def create_class(self, code: str, university: str):
		uni = university_ops.get_university_by_name(university)
		if uni == None:
			if len(code < 10) and len(university) < 50):
				course = Course(code, university)	
				course_ops.create_course(course)
				return True
		return False

	def add_course_to_favorite_list(self, account_id: int, course_id: int):
		account = account_ops.getAccountByID(account_id)
		course = course_ops.get_course_by_id(course_id)
		if account == None or course == None:
			return False
		account_ops.addFavoriteCourseToAccount(account, course)
		return True

	def get_favorite_classes(self, account_id: int):
		account = account_ops.getAccountByID(account_id)
		if account == None:
			return None
		return account_ops.get_favorite_classes_for_account(account)