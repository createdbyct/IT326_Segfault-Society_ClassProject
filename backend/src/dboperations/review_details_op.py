from src.database import engine

class ReviewDetailsOp(DBOperations):

	def save(SQLModel model):
		super(model)

	def delete(SQLModel model):
		super(model)

	def getByID(int id):
		with Session(engine) as session:
			statement = select(ReviewDetails).where(ReviewDetails.id == id)
			model = session.exec(statement)
			return model

	def get(
		Class c = null, 
		Account account = null, 
		string gradeReceived = null, 
		string semesterTaken = null, 
		string yearTaken = null, 
		bool textbookRequired = null, 
		bool attendanceRequired = null, 
		Professor professor = null
	):
		with Session(engine) as session:
			#create the statement used to fetch the records, filtering by user-provided attributes, if any
			statement = select(ReviewDetails)
			if c != null:
				statement = statement.where(ReviewDetails.class_id == c.id)
			if account != null:
				statement = statement.where(ReviewDetails.account_id == account.id)
			if gradeReceived != null:
				statement = statement.where(ReviewDetails.grade_received == gradeReceived)
			if semesterTaken != null:
				statement = statement.where(ReviewDetails.semester_taken == semesterTaken)
			if yearTaken != null:
				statement = statement.where(ReviewDetails.year_taken == yearTaken)
			if textbookRequired != null:
				statement = statement.where(ReviewDetails.textbook_required == textbookRequired)
			if attendanceRequired != null:
				statement = statement.where(ReviewDetails.attendance_required == attendanceRequired)
			if professor != null:
				statement = statement.where(ReviewDetails.professor_id == professor.id)

			records = session.exec(statement)
			return records

	def update(
		ReviewDetails record,
		Class c = null, 
		Account account = null, 
		string gradeReceived = null, 
		string semesterTaken = null, 
		string yearTaken = null, 
		bool textbookRequired = null, 
		bool attendanceRequired = null, 
		Professor professor = null
	):
		#update the record's attributes to the ones provided by the user
		if c != null:
			record.class_id = c.id
		if account != null:
			record.account_id = account.id
		if gradeReceived != null:
			record.grade_received = gradeReceived
		if semesterTaken != null:
			record.semester_taken = semesterTaken
		if yearTaken != null:
			record.year_taken = yearTaken
		if textbookRequired != null:
			record.textbook_required = textbookRequired
		if attendanceRequired != null:
			record.attendance_required = attendanceRequired
		if professor != null:
			record.professor_id = professor.id
	
		#save
		with Session(engine) as session:
			session.add(record)
			session.commit()	
		
		return record