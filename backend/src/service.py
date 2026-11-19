import re

import ReviewOps
import UniversityOps
import CourseOps
import AccountOps

class Service():
	USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{1,18}[a-zA-Z0-9])?$") 	# Limit username to 3-20 characters, start with alphanumeric character, and allow only letters, numbers, underscores, and hypens
	PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$") 	# Limit passwords to 8-20 chars, no spaces
	EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$") 	# Limit email to format username@website.domain

	review_ops = ReviewOps()
	university_ops = UniversityOps()
	course_ops = CourseOps()
	account_ops = AccountOps()

	def create_new_account(self, username: str, password: str, email: str):
		# Check parameters against regular expressions
		if re.match(self.USERNAME_REGEX, username) is None:
			return False
		if re.match(self.PASSWORD_REGEX, password) is None:
			return False
		if re.match(self.EMAIL_REGEX, email) is None:
			return False

		# Pass the validated parameters to account_ops and return
		return self.account_ops.create_new_account(username, password, email)

	def delete_account(self, username: str, password: str):
		# Check parameters against regular expressions
		if re.match(self.USERNAME_REGEX, username) is None:
			return False
		if re.match(self.PASSWORD_REGEX, password) is None:
			return False

		# Pass the validated parameters to account_ops and return
		return self.account_ops.delete_account(username, password)

	def update_account(self, username: str, old_password: str, new_password: str, email: str):
		# Check parameters against regular expressions
		if re.match(self.USERNAME_REGEX, username) is None:
			return False
		if re.match(self.PASSWORD_REGEX, old_password) is None:
			return False
		if re.match(self.PASSWORD_REGEX, new_password) is None:
			return False
		if re.match(self.EMAIL_REGEX, email) is None:
			return False

		# Pass the validated parameters to account_ops and return
		return self.account_ops.update_account(username, old_password, new_password, email)

	def login(self, username: str, password: str):
		# Check parameters against regular expressions
		if re.match(self.USERNAME_REGEX, username) is None:
			return False
		if re.match(self.PASSWORD_REGEX, password) is None:
			return False

		# Pass the validated parameters to account_ops and return
		return self.account_ops.login(username, password)

	def update_class_review(self, review_id: int, rating: float, comment: str):
		if rating < 0 or rating > 5:
			return False
		if len(comment) > 500: #this value is arbitrary, we could change it
			return False
		r = self.review_ops.get_review_by_id(review_id)
		if r == None:
			return False
		self.review_ops.update_review(r, rating, comment)
		return True

	def delete_review(self, review_id: int):
		r = self.review_ops.get_review_by_id(review_id)
		if r == None:
			return False	
		self.review_ops.delete_review(r)
		return True
	
	def create_class(self, code: str, university: str):
		uni = self.university_ops.get_university_by_name(university)
		if uni == None:
			if (len(code < 10) and len(university) < 50):
				course = self.Course(code, university)	
				self.course_ops.create_course(course)
				return True
		return False

	def add_course_to_favorite_list(self, account_id: int, course_id: int):
		account = self.account_ops.getAccountByID(account_id)
		course = self.course_ops.get_course_by_id(course_id)
		if account == None or course == None:
			return False
		self.account_ops.addFavoriteCourseToAccount(account, course)
		return True

	def get_favorite_classes(self, account_id: int):
		account = self.account_ops.getAccountByID(account_id)
		if account == None:
			return None
		return self.account_ops.get_favorite_classes_for_account(account)