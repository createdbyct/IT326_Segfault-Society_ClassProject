import pytest
from src.database import engine
from sqlmodel import *
from src.models.account import Account
from src.models.university import University
from src.models.review import Review
from src.models.review_details import ReviewDetails
from src.models.professor import Professor
from src.models.course import Course
from src.models.link_tables import ReviewLike
from src.models.link_tables import ReviewDislike
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
		test_id = review_ops.create_review(course=c, account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p,  rating=1.0, comment="testing create_review method") #method to test
	except Exception:
		assert False

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
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.commit()

def test_delete_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing delete_review method")
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
	test_review_details_id = test_review_details.id

	try:
		review_ops.delete_review(test_review) #method to test
	except Exception:
		assert False
		
	#make sure the review and its associated review details have been deleted from the database
	with Session(engine) as session:
		statement = select(Review).where(Review.id==test_id)
		results = session.exec(statement)
		res = results.first()
		if res is not None: 
			assert False
		statement = select(ReviewDetails).where(ReviewDetails.id==test_review_details_id)
		results = session.exec(statement)
		res = results.first()
		if res is not None: 
			assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.commit()

def test_get_review_by_id():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing get_review_by_id method")
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

	try:
		review = review_ops.get_review_by_id(test_id) #method to test
	except Exception:
		assert False
		
	#make sure we can access attributes in the review
	if review is None:
		assert False
	if review.id != test_id:
		assert False
	if review.comment != "testing get_review_by_id method":
		assert False
	if review.get_class_reviewed().get_code() != "IT326":
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

def test_get_reviews_no_filter():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p1 = Professor(name="test1", university=uni)
	p2 = Professor(name="test2", university=uni)
	test_review_details1 = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p1)
	test_review1 = Review(review_details=test_review_details1, rating=1.0, comment="testing get_reviews method, test review 1")
	test_review_details2 = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="B", semester_taken="Spring", year_taken="2024", textbook_required=False, attendance_required=False, professor=p2)
	test_review2 = Review(review_details=test_review_details2, rating=5.0, comment="testing get_reviews method, test review 2")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p1)
		session.add(p2)
		session.add(test_review_details1)
		session.add(test_review_details2)
		session.add(test_review1)
		session.add(test_review1)
		session.commit()
		session.refresh(test_review1)
		session.refresh(test_review_details1)
		session.refresh(test_review2)
		session.refresh(test_review_details2)
	test_id1 = test_review1.id
	test_id2 = test_review2.id

	try:
		reviews = review_ops.get_reviews() #method to test
	except Exception:
		assert False
		
	#check that we got all reviews
	if len(reviews) != 2:
		assert False
	#make sure we can access attributes in the reviews
	r1 = reviews[0]
	if r1 is None:
		assert False
	if r1.id != test_id1:
		assert False
	if r1.comment != "testing get_reviews method, test review 1":
		assert False
	if r1.get_class_reviewed().get_code() != "IT326":
		assert False
	r2 = reviews[1]
	if r2 is None:
		assert False
	if r2.id != test_id2:
		assert False
	if r2.comment != "testing get_reviews method, test review 2":
		assert False
	if r2.get_class_reviewed().get_code() != "IT326":
		assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p1)
		session.delete(p2)
		session.delete(test_review_details1)
		session.delete(test_review_details2)
		session.delete(test_review1)
		session.delete(test_review2)
		session.commit()

def test_get_reviews_with_filter():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p1 = Professor(name="test1", university=uni)
	p2 = Professor(name="test2", university=uni)
	test_review_details1 = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p1)
	test_review1 = Review(review_details=test_review_details1, rating=1.0, comment="testing get_reviews method, test review 1")
	test_review_details2 = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="B", semester_taken="Spring", year_taken="2024", textbook_required=False, attendance_required=False, professor=p2)
	test_review2 = Review(review_details=test_review_details2, rating=5.0, comment="testing get_reviews method, test review 2")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p1)
		session.add(p2)
		session.add(test_review_details1)
		session.add(test_review_details2)
		session.add(test_review1)
		session.add(test_review1)
		session.commit()
		session.refresh(test_review1)
		session.refresh(test_review_details1)
		session.refresh(test_review2)
		session.refresh(test_review_details2)
		session.refresh(p1)
		session.refresh(a)
	test_id1 = test_review1.id
	test_id2 = test_review2.id
	p1_id = p1.id
	a_id = a.id

	try:
		reviews = review_ops.get_reviews(professor_id=p1_id, account_id=a_id, grade_received="A") #method to test
	except Exception:
		assert False
		
	#check that we got all reviews
	if len(reviews) != 1:
		assert False
	#make sure we can access attributes in the reviews
	r1 = reviews[0]
	if r1 is None:
		assert False
	if r1.id != test_id1:
		assert False
	if r1.comment != "testing get_reviews method, test review 1":
		assert False
	if r1.get_class_reviewed().get_code() != "IT326":
		assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p1)
		session.delete(p2)
		session.delete(test_review_details1)
		session.delete(test_review_details2)
		session.delete(test_review1)
		session.delete(test_review2)
		session.commit()

def test_update_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	c1 = Course(code="IT326", university=uni, rating=1.0)
	c2 = Course(code="IT426", university=uni, rating=5.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c1, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing update_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c1)
		session.add(c2)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.commit()
		session.refresh(c2)
		session.refresh(test_review)
		session.refresh(test_review_details)
	test_id = test_review.id
	c_id = c2.id

	try:
		review = review_ops.update_review(test_review, course=c2, rating=2.5) #method to test
	except Exception:
		assert False
		
	#make sure it has been updated
	with Session(engine) as session:
		statement = select(Review).where(Review.id==test_id)
		results = session.exec(statement)
		r = results.one()
		if r.comment != "testing update_review method":
			assert False #make sure old attributes that were not updated are still intact
		if r.rating != 2.5:
			assert False #review details were not saved correctly
		statement = select(ReviewDetails).where(ReviewDetails.id==r.review_details.id)
		results = session.exec(statement)
		rd = results.one()
		if rd.class_reviewed.id != c_id: 
			assert False #review details were not saved correctly
		if r.get_class_reviewed().get_code() != "IT426":
			assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c1)
		session.delete(c2)
		session.delete(p)
		session.delete(test_review_details)
		session.delete(test_review)
		session.commit()

def test_like_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	test_account = Account(username="test_like_account", email="test_like email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing like_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.add(test_account)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(test_account)
	test_id = test_review.id
	account_id = test_account.id

	try:
		review_ops.like_review(test_review, test_account) #method to test
	except Exception:
		assert False
		
	#make sure the like has been added
	with Session(engine) as session:
		statement = select(Review).where(Review.id==test_id)
		results = session.exec(statement)
		r = results.one()
		like_list = r.get_liked_by()
		if len(like_list) != 1:
			assert False
		account = like_list[0]
		if account.username != "test_like_account":
			assert False
		statement = select(Account).where(Account.id==account_id)
		results = session.exec(statement)
		r = results.one()
		like_list = r.liked_reviews
		if len(like_list) != 1:
			assert False
		review = like_list[0]
		if review.comment != "testing like_review method":
			assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.delete(test_review_details)
		session.delete(test_review)
		session.delete(test_account)
		session.commit()

def test_like_review_for_disliked_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	test_account = Account(username="test_like_account", email="test_like email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing like_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.add(test_account)
		session.commit()
		test_review.disliked_by.append(a)
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(test_account)
	test_id = test_review.id
	account_id = test_account.id

	try:
		review_ops.like_review(test_review, test_account) #method to test
	except Exception:
		assert False
		
	#make sure the like has been added and the dislike removed
	with Session(engine) as session:
		statement = select(Review).where(Review.id==test_id)
		results = session.exec(statement)
		r = results.one()
		like_list = r.get_liked_by()
		if len(like_list) != 1:
			assert False
		account = like_list[0]
		if account.username != "test_like_account":
			assert False
		dislike_list = r.get_disliked_by()
		if len(dislike_list) != 0:
			assert False
		statement = select(Account).where(Account.id==account_id)
		results = session.exec(statement)
		r = results.one()
		like_list = r.liked_reviews
		if len(like_list) != 1:
			assert False
		review = like_list[0]
		if review.comment != "testing like_review method":
			assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.delete(test_review_details)
		session.delete(test_review)
		session.delete(test_account)
		session.commit()

def test_dislike_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	test_account = Account(username="test_dislike_account", email="test_dislike email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing dislike_review method")
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.add(test_account)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(test_account)
	test_id = test_review.id
	account_id = test_account.id

	try:
		review_ops.dislike_review(test_review, test_account) #method to test
	except Exception:
		assert False
		
	#make sure the dislike has been added
	with Session(engine) as session:
		statement = select(Review).where(Review.id==test_id)
		results = session.exec(statement)
		r = results.one()
		dislike_list = r.get_disliked_by()
		if len(dislike_list) != 1:
			assert False
		account = dislike_list[0]
		if account.username != "test_dislike_account":
			assert False
		statement = select(Account).where(Account.id==account_id)
		results = session.exec(statement)
		r = results.one()
		dislike_list = r.disliked_reviews
		if len(dislike_list) != 1:
			assert False
		review = dislike_list[0]
		if review.comment != "testing dislike_review method":
			assert False
		
	#cleanup
	with Session(engine) as session:
		session.delete(uni)
		session.delete(a)
		session.delete(c)
		session.delete(p)
		session.delete(test_review_details)
		session.delete(test_review)
		session.delete(test_account)
		session.commit()

def test_remove_like_for_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	test_account = Account(username="test_like_account", email="test_like email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing remove_like_for_review method")
	test_review.liked_by.append(test_account)
	review_id = -1
	account_id = -1
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.add(test_account)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(test_account)

		review_id = test_review.id
		account_id = test_account.id

		statement = select(ReviewLike).where(ReviewLike.review_id==review_id and ReviewLike.account_id==account_id)
		results = session.exec(statement)
		r = results.one()

	try:
		review_ops.remove_like_for_review(test_review, test_account) #method to test
	except Exception:
		assert False
		
	#make sure the like has been removed
	with Session(engine) as session:
		statement = select(Review).where(Review.id==review_id)
		results = session.exec(statement)
		r = results.one()
		like_list = r.get_liked_by()
		if len(like_list) != 0:
			assert False
		statement = select(Account).where(Account.id==account_id)
		results = session.exec(statement)
		r = results.one()
		like_list = r.liked_reviews
		if len(like_list) != 0:
			assert False
		statement = select(ReviewLike).where(ReviewLike.review_id==review_id and ReviewLike.account_id==account_id)
		results = session.exec(statement)
		r = results.first()
		if r is not None:
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
		session.delete(test_account)
		session.commit()

def test_remove_dislike_for_review():
	#setup
	#create needed rows in db
	uni = University(name="test university")
	a = Account(username="test", email="test email", password_hash="test")
	test_account = Account(username="test_dislike_account", email="test_dislike email", password_hash="test")
	c = Course(code="IT326", university=uni, rating=1.0)
	p = Professor(name="test", university=uni)
	test_review_details = ReviewDetails(class_reviewed=c, created_by_account=a, grade_received="A", semester_taken="Fall", year_taken="2026", textbook_required=True, attendance_required=True, professor=p)
	test_review = Review(review_details=test_review_details, rating=1.0, comment="testing remove_dislike_for_review method")
	test_review.disliked_by.append(test_account)
	review_id = -1
	account_id = -1
	with Session(engine) as session:
		session.add(uni)
		session.add(a)
		session.add(c)
		session.add(p)
		session.add(test_review_details)
		session.add(test_review)
		session.add(test_account)
		session.commit()
		session.refresh(test_review)
		session.refresh(test_review_details)
		session.refresh(test_account)

		review_id = test_review.id
		account_id = test_account.id

		statement = select(ReviewDislike).where(ReviewDislike.review_id==review_id and ReviewDislike.account_id==account_id)
		results = session.exec(statement)
		r = results.one()

	try:
		review_ops.remove_dislike_for_review(test_review, test_account) #method to test
	except Exception:
		assert False
		
	#make sure the dislike has been removed
	with Session(engine) as session:
		statement = select(Review).where(Review.id==review_id)
		results = session.exec(statement)
		r = results.one()
		dislike_list = r.get_disliked_by()
		if len(dislike_list) != 0:
			assert False
		statement = select(Account).where(Account.id==account_id)
		results = session.exec(statement)
		r = results.one()
		dislike_list = r.disliked_reviews
		if len(dislike_list) != 0:
			assert False
		statement = select(ReviewDislike).where(ReviewDislike.review_id==review_id and ReviewDislike.account_id==account_id)
		results = session.exec(statement)
		r = results.first()
		if r is not None:
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
		session.delete(test_account)
		session.commit()


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
