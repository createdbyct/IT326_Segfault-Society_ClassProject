import pytest
from src.database import engine
from sqlmodel import *
from src.models.account import Account
from src.models.university import University
from src.models.review import Review
from src.models.review_details import ReviewDetails
from src.models.professor import Professor
from src.models.course import Course
from src.operations.review_ops import ReviewOps

review_ops = ReviewOps()

def test_create_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	class_id = -1
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.commit()
		session.refresh(c)
		session.refresh(a)
		session.refresh(p)
		class_id = c.id

	try:
		test_id = review_ops.create_review(course=c, account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p,  rating=1.0, comment="testing create_review method")
		
		#make sure it has been added to the database
		with Session(engine) as session:
			statement = select(Review).where(Review.id==test_id)
			results = session.exec(statement)
			r = results.one()
			if r.comment != "testing create_review method":
				assert False #review was not saved correctly
			statement = select(ReviewDetails).where(ReviewDetails.id==r.review_details.id)
			results = session.exec(statement)
			rd = results.one()
			if rd.class_reviewed.id != class_id: 
				assert False #review details were not saved correctly
			if rd.grade_received != "A":
				assert False #review details were not saved correctly
			print(r)
			print(rd)
			#cleanup
			session.delete(r)
			session.delete(r.review_details)
			session.commit()
	except Exception:
		assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.commit()

	#end test
	assert True
		


'''	
def test_database_functions():
	with Session(engine) as session:
		#create one of each
		uni = University(name="test university")
		a = Account(username="test", email="test email", password_hash="test")
		session.add(uni)
		session.add(a)
		session.commit()
		c = Course(code="IT326", university=uni, rating=1.0)
		p = Professor(name="test", university=uni)
		session.add(c)
		session.add(p)
		session.commit()
		rd = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
		session.add(rd)
		session.commit()
		r = Review(review_details=rd, rating=1.0, comment="test comment")
		session.add(r)
		session.commit()
		
		#check if each one has one and delete
		try:
			statement = select(Review)
			results = session.exec(statement)
			r = results.one()
			session.delete(r)	
			statement = select(ReviewDetails)
			results = session.exec(statement)
			rd = results.one()
			session.delete(rd)
			statement = select(Professor).where(Professor.name == "test")
			results = session.exec(statement)
			p = results.one()
			session.delete(p)
			statement = select(Course).where(Course.code == "IT326")
			results = session.exec(statement)
			c = results.one()
			session.delete(c)
			statement = select(University).where(University.name == "test university")
			results = session.exec(statement)
			uni = results.one()
			session.delete(uni)
			statement = select(Account).where(Account.username == "test")
			results = session.exec(statement)
			a = results.one()
			session.delete(a)
			session.commit()
		except NoResultFound:
			assert False

		#check that they were deleted properly
		statement = select(University)
		results = session.exec(statement)
		for ur in results:
			assert False
		statement = select(Account)
		results = session.exec(statement)
		for ar in results:
			assert False
		statement = select(Course)
		results = session.exec(statement)
		for cr in results:
			assert False
		statement = select(Professor)
		results = session.exec(statement)
		for pr in results:
			assert False
		statement = select(ReviewDetails)
		results = session.exec(statement)
		for rdr in results:
			assert False
		statement = select(Review)
		results = session.exec(statement)
		for rr in results:
			assert False
		assert True
'''
