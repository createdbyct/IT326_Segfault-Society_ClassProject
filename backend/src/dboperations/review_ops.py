

class ReviewOps():
	def create_review(self, Review r):
		with Session(engine) as session:
			session.add(r)
			session.commit()	

	def delete_review(self, Review r):
		with Session(engine) as session:
			session.delete(r)
			session.commit()	

	def get_review_by_id(self, int id):
		with Session(engine) as session:
			statement = select(Review).where(Review.id == id)
			r = session.exec(statement)
			return r

	def get_reviews(self, ReviewDetails review_details = null, double rating = null):
		with Session(engine) as session:
			statement = select(Review)

			if review_details != null:
				statement = statement.where(Review.review_details == review_details)
			if rating != null:
				statement = statement.where(Review.rating == rating)

			reviews = session.exec(statement)
			return reviews

	def update_review(self, Review r, ReviewDetails review_details = null, double rating = null, string comment = null):
		return r.update(review_details, rating, comment)

	def like_review(self, Review r, Account account):
		r.like(account)

	def dislike_review(self, Review r, Account account):
		r.dislike(account)

	def remove_like_for_review(self, Review r, Account account):
		r.remove_like(account)

	def remove_dislike_for_review(self, Review r, Account account):
		r.remove_dislike(account)

	def create_review_details(self, ReviewDetails rd):
		with Session(engine) as session:
			session.add(rd)
			session.commit()	

	def update_review_details(self, 
		ReviewDetails rd, 
		Course course = null, 
		Account account = null, 
		string grade_received = null, 
		string semester_taken = null, 
		string year_taken = null, 
		bool textbook_required = null, 
		bool attendance_required = null, 
		Professor professor = null
	): 
		return rd.update(course, account, grade_received, semester_taken, year_taken, textbook_required, attendance_required, professor)