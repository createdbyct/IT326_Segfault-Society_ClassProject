import pytest
from fastapi import HTTPException
from src.database import engine
from sqlmodel import *
from src.controller import Controller
from src.models.account import Account  
from src.models.university import University
from src.models.review import Review 
from src.models.review_details import ReviewDetails
from src.models.professor import Professor  
from src.models.course import Course

controller = Controller()

#Use Case 16: update_class_review tests

#all inputs valid
def test_update_class_review_for_valid_inputs():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing update_class_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(c)
	class_id = c.id
	test_id = test_review.id
	new_rating = 2.5
	new_comment = "updated comment"
	#test method
	controller.update_class_review(test_id, new_rating, new_comment)
	#make sure the review was updated and the class's rating was updated
	with Session(engine) as session:
		statement = select(Review).where(Review.id==test_id)
		results = session.exec(statement)
		r = results.one()
		if r.comment != "updated comment":
			assert False #review was not saved correctly
		if r.rating != 2.5:
			assert False
		statement = select(Course).where(Course.id==class_id)
		results = session.exec(statement)
		course = results.one()
		if course.rating != 2.5:
			assert False
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.delete(test_review_details)
		session.delete(test_review)
		session.commit()

#invalid rating
def test_update_class_review_for_invalid_rating():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing update_class_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(c)
	class_id = c.id
	test_id = test_review.id
	new_rating = -1.5
	new_comment = "updated comment"
	#test method
	try:
		controller.update_class_review(test_id, new_rating, new_comment)
	except HTTPException as e:
		if e.detail != "Rating must be between 0.0 and 5.0":
			assert False
		#make sure the review was not updated
		with Session(engine) as session:
			statement = select(Review).where(Review.id==test_id)
			results = session.exec(statement)
			r = results.one()
			if r.comment != "testing update_class_review method":
				assert False #review was not saved correctly
			if r.rating != 1.0:
				assert False
		#cleanup
		with Session(engine) as session:
			session.delete(uni)
			session.delete(a)
			session.delete(c)
			session.delete(p)
			session.delete(test_review_details)
			session.delete(test_review)
			session.commit()
		#end test
		return
	assert False

#invalid comment
def test_update_class_review_for_invalid_comment():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing update_class_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(c)
	class_id = c.id
	test_id = test_review.id
	new_rating = 2.5
	new_comment = "x" * 501
	#test method
	try:
		controller.update_class_review(test_id, new_rating, new_comment)
	except HTTPException as e:
		if e.detail != "Comment must be 500 characters or less":
			assert False
		#make sure the review was not updated
		with Session(engine) as session:
			statement = select(Review).where(Review.id==test_id)
			results = session.exec(statement)
			r = results.one()
			if r.comment != "testing update_class_review method":
				assert False #review was not saved correctly
			if r.rating != 1.0:
				assert False
		#cleanup
		with Session(engine) as session:
			session.delete(uni)
			session.delete(a)
			session.delete(c)
			session.delete(p)
			session.delete(test_review_details)
			session.delete(test_review)
			session.commit()
		#end test
		return
	assert False

#there is no review with that ID
def test_update_class_review_for_invalid_review():
	#test method
	try:
		controller.update_class_review(-1, 1.0, "testing update_class_review method")
	except HTTPException as e:
		if e.detail != "Review does not exist":
			assert False
		#end test
		return
	assert False



#Use Case 17: delete_review tests

#valid inputs
def test_delete_review_for_valid_inputs():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing update_class_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
	test_id = test_review.id
	test_rd_id = test_review_details.id
	#test method
	controller.delete_review(test_id)
	#make sure the review was deleted
	with Session(engine) as session:
		statement = select(Review).where(Review.id==test_id)
		results = session.exec(statement)
		r = results.first()
		if r is not None:
			assert False
		statement = select(ReviewDetails).where(ReviewDetails.id==test_rd_id)
		results = session.exec(statement)
		rd = results.first()
		if rd is not None:
			assert False
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.commit()

#invalid review
def test_delete_review_for_invalid_review():
	#test method
	try:
		controller.delete_review(-1)
	except HTTPException as e:
		if e.detail != "Review does not exist":
			assert False
		#end test
		return
	assert False



#Use Case 18: create_course tests

#valid inputs
def test_create_course_for_valid_inputs():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	with Session(engine) as session:
		session.add(uni)
		session.commit()
		session.refresh(uni)
	uni_id = uni.id
	code = "IT326"
	university_name = "test university"
	#test method
	test_id = controller.create_course(code, university_name)
	c = None
	#make sure the course was created
	with Session(engine) as session:
		statement = select(Course).where(Course.id==test_id)
		results = session.exec(statement)
		c = results.one()
		if c.code != "IT326":
			assert False #review was not saved correctly
		if c.university_id != uni_id:
			assert False
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(c)
		session.commit()

#invalid code
def test_create_course_for_invalid_code():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	with Session(engine) as session:
		session.add(uni)
		session.commit()
		session.refresh(uni)
	uni_id = uni.id
	code = ""
	university_name = "test university"
	#test method
	try:
		controller.create_course(code, university_name)
	except HTTPException as e:
		if e.detail != "Code must be between 3 to 10 characters":
			assert False
		#make sure the course was not created
		with Session(engine) as session:
			statement = select(Course)
			results = session.exec(statement)
			c = results.first()
			if c is not None:
				assert False
		#cleanup
		with Session(engine) as session:
			session.delete(uni)
			session.commit()

#invalid university
def test_create_course_for_invalid_university():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	with Session(engine) as session:
		session.add(uni)
		session.commit()
		session.refresh(uni)
	uni_id = uni.id
	code = "IT326"
	university_name = ""
	#test method
	try:
		controller.create_course(code, university_name)
	except HTTPException as e:
		if e.detail != "University does not exist":
			assert False
		#make sure the course was not created
		with Session(engine) as session:
			statement = select(Course)
			results = session.exec(statement)
			c = results.first()
			if c is not None:
				assert False
		#cleanup
		with Session(engine) as session:
			session.delete(uni)
			session.commit()



#Use Case 19: add_course_to_favorite_list tests

#all valid inputs
def test_add_course_to_favorite_list_for_valid_inputs():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.commit()
		session.refresh(a)
		session.refresh(c)
	account_id = a.id
	course_id = c.id
	try:
		controller.add_course_to_favorite_list(account_id, course_id) #method to test
	except Exception:
		assert False
	#make sure it has been added
	with Session(engine) as session:
		statement = select(Account).where(Account.id==account_id)
		results = session.exec(statement)
		res = results.one()
		fav_list = res.getFavoriteCourses()
		if len(fav_list) != 1:
			assert False
		fav_course = fav_list[0]
		if fav_course.id != course_id:
			assert False
		statement = select(Course).where(Course.id==course_id)
		results = session.exec(statement)
		res = results.one()
		fav_list = res.favorited_by
		if len(fav_list) != 1:
			assert False
		account = fav_list[0]
		if account.id != account_id:
			assert False
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.commit()

#invalid course
def test_add_course_to_favorite_list_for_invalid_course():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.commit()
		session.refresh(a)
	account_id = a.id
	try:
		controller.add_course_to_favorite_list(account_id, -1) #method to test
	except HTTPException as e:
		if e.detail != "Class does not exist":
			assert False
		#make sure it has not been added
		with Session(engine) as session:
			statement = select(Account).where(Account.id==account_id)
			results = session.exec(statement)
			res = results.one()
			fav_list = res.getFavoriteCourses()
			if len(fav_list) != 0:
				assert False
		#cleanup
		with Session(engine) as session:
			session.delete(uni)
			session.delete(a)
			session.commit()
		return
	assert False

#invalid account
def test_add_course_to_favorite_list_for_invalid_account():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	c = Course(code="IT326", university=uni, rating=1.0)
	with Session(engine) as session:
		session.add(uni)
		session.add(c)
		session.commit()
		session.refresh(c)
	course_id = c.id
	try:
		controller.add_course_to_favorite_list(-1, course_id) #method to test
	except HTTPException as e:
		if e.detail != "Account does not exist":
			assert False
		#make sure it has not been added
		with Session(engine) as session:
			statement = select(Course).where(Course.id==course_id)
			results = session.exec(statement)
			res = results.one()
			fav_list = res.favorited_by
			if len(fav_list) != 0:
				assert False
		#cleanup
		with Session(engine) as session:
			session.delete(uni)
			session.delete(c)
			session.commit()
		return
	assert False



#Use Case 20: get_favorite_courses tests

#valid inputs
def test_get_favorite_courses_for_valid_inputs():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c1 = Course(code="IT326", university=uni, rating=1.0)
	c2 = Course(code="IT426", university=uni, rating=5.0)
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c1)
		session.add(c2)
		session.commit()
		session.refresh(a)
		session.refresh(c1)
		session.refresh(c2)
		a.favorite_courses.append(c1)
		a.favorite_courses.append(c2)
		session.add(a)
		session.commit()
		session.refresh(a)
		session.refresh(c1)
		session.refresh(c2)
	account_id = a.id
	course1_id = c1.id
	course2_id = c2.id
	fav_list = None
	try:
		fav_list = controller.get_favorite_courses(account_id) #method to test
	except Exception:
		assert False
	#make sure we got the correct results
	assert len(fav_list) == 2
	assert fav_list[0].id == course1_id
	assert fav_list[1].id == course2_id
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c1)
		session.delete(c2)
		session.commit()

#invalid account
def test_get_favorite_courses_for_invalid_account():
	try:
		fav_list = controller.get_favorite_courses(-1) #method to test
	except HTTPException as e:
		if e.detail != "Account does not exist":
			assert False
		return
	assert False