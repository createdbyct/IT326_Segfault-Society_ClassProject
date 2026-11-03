from src.database import engine

class ReviewDislikeOp(DBOperations):

	def save(SQLModel model):
		super(model)

	def delete(SQLModel model):
		super(model)

	def getByID(int id):
		with Session(engine) as session:
			statement = select(ReviewDislike).where(ReviewDislike.id == id)
			model = session.exec(statement)
			return model

	def get(
		Review review = null,
		Account account = null
	):
		with Session(engine) as session:
			#create the statement used to fetch the records, filtering by user-provided attributes, if any
			statement = select(ReviewDislike)
			if review != null:
				statement = statement.where(ReviewDislike.review_id == review.id)
			if account != null:
				statement = statement.where(ReviewDislike.account_id == account.id)

			records = session.exec(statement)
			return records

	def update(
		ReviewDislike record,
		Review review = null, 
		Account account = null
	):
		#update the record's attributes to the ones provided by the user
		if review != null:
			record.review_id = review.id
		if account != null:
			record.account_id = account.id
	
		#save
		with Session(engine) as session:
			session.add(record)
			session.commit()	
		
		return record