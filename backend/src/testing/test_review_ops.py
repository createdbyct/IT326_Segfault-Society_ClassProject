import pytest
from src.database import engine
from sqlmodel import *
from src.models.account import Account
from src.models.university import University
from src.models.review import Review
from src.models.review_details import ReviewDetails
from src.models.professor import Professor
from src.models.course import Course


	
def test_create_account():
	with Session(engine) as session:
		
		uni = University(name="test university")
		session.add(uni)
		session.commit()
		#c = Course(code="IT326", university=uni, rating=1.0)
		#a = Account(username="test", email="test email", password_hash="test")
		#p = Professor(name="test", university=uni)
		#rd = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_acquired=True, attendance_required=True, professor=p)
		#r = Review(review_details=rd, rating=1.0, comment="test comment")

		statement = select(University).where(University.name == "test university")
		results = session.exec(statement)
		uni = results.one()
		session.delete(uni)
		session.commit()

		statement = select(University)
		results = session.exec(statement)
		for u in results:
			assert False
		assert True

		print("yay")