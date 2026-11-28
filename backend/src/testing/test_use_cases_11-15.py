import uuid

from fastapi import HTTPException
from sqlalchemy import delete
from sqlmodel import Session, select

from src.controller import Controller
from src.database import engine
from src.models.account import Account
from src.models.course import Course
from src.models.link_tables import ReviewDislike, ReviewLike
from src.models.professor import Professor
from src.models.review import Review
from src.models.review_details import ReviewDetails
from src.models.university import University
from src.operations.review_ops import ReviewOps

controller = Controller()

# Setup and cleanup methods used by the use-case tests
def create_review_test_data():
    # setup
    # create needed rows in the database
    unique = uuid.uuid4().hex[:10]

    uni = University(name=f"test university {unique}")
    author = Account(
        username=f"author_{unique}",
        email=f"author_{unique}@test.com",
        password_hash="test",
    )
    liker_one = Account(
        username=f"liker1_{unique}",
        email=f"liker1_{unique}@test.com",
        password_hash="test",
    )
    liker_two = Account(
        username=f"liker2_{unique}",
        email=f"liker2_{unique}@test.com",
        password_hash="test",
    )
    c = Course(code="IT326", university=uni, rating=0.0)
    p = Professor(name=f"test professor {unique}", university=uni)

    review_one = Review(
        review_details=ReviewDetails(
            class_reviewed=c,
            created_by_account=author,
            grade_received="A",
            semester_taken="Fall",
            year_taken="2025",
            textbook_required=True,
            attendance_required=True,
            professor=p,
        ),
        rating=4.5,
        comment="First test review",
    )
    review_two = Review(
        review_details=ReviewDetails(
            class_reviewed=c,
            created_by_account=author,
            grade_received="B",
            semester_taken="Spring",
            year_taken="2026",
            textbook_required=False,
            attendance_required=True,
            professor=p,
        ),
        rating=3.5,
        comment="Second test review",
    )
    review_three = Review(
        review_details=ReviewDetails(
            class_reviewed=c,
            created_by_account=author,
            grade_received="A",
            semester_taken="Spring",
            year_taken="2026",
            textbook_required=True,
            attendance_required=False,
            professor=p,
        ),
        rating=5.0,
        comment="Third test review",
    )

    with Session(engine) as session:
        session.add_all([
            uni, author, liker_one, liker_two, c, p,
            review_one, review_two, review_three,
        ])
        session.commit()
        session.refresh(uni)
        session.refresh(author)
        session.refresh(liker_one)
        session.refresh(liker_two)
        session.refresh(c)
        session.refresh(p)
        session.refresh(review_one)
        session.refresh(review_two)
        session.refresh(review_three)

    return {
        "university_id": uni.id,
        "author_id": author.id,
        "liker_one_id": liker_one.id,
        "liker_two_id": liker_two.id,
        "course_id": c.id,
        "professor_id": p.id,
        "review_one_id": review_one.id,
        "review_two_id": review_two.id,
        "review_three_id": review_three.id,
    }


def cleanup_review_test_data(data):
    # cleanup
    # remove dependent rows before removing their parent rows
    with Session(engine) as session:
        review_details_ids = select(ReviewDetails.id).where(
            ReviewDetails.class_id == data["course_id"]
        )
        review_ids = select(Review.id).where(
            Review.review_details_id.in_(review_details_ids)
        )

        session.exec(
            delete(ReviewLike).where(ReviewLike.review_id.in_(review_ids))
        )
        session.exec(
            delete(ReviewDislike).where(ReviewDislike.review_id.in_(review_ids))
        )
        session.exec(
            delete(Review).where(Review.review_details_id.in_(review_details_ids))
        )
        session.exec(
            delete(ReviewDetails).where(
                ReviewDetails.class_id == data["course_id"]
            )
        )
        session.exec(
            delete(Professor).where(Professor.id == data["professor_id"])
        )
        session.exec(delete(Course).where(Course.id == data["course_id"]))
        session.exec(
            delete(Account).where(
                Account.id.in_([
                    data["author_id"],
                    data["liker_one_id"],
                    data["liker_two_id"],
                ])
            )
        )
        session.exec(
            delete(University).where(
                University.id == data["university_id"]
            )
        )
        session.commit()


# Use Case 11: Filter class reviews by grade received

# valid grade
def test_get_reviews_filtered_by_grade():
    # setup
    data = create_review_test_data()
    course_id = data["course_id"]

    # test method
    results = controller.get_reviews(course_id, grade="A")

    # make sure only reviews with grade A were returned
    result_ids = {review.id for review in results}
    assert result_ids == {
        data["review_one_id"],
        data["review_three_id"],
    }

    # cleanup
    cleanup_review_test_data(data)


# invalid grade
def test_get_reviews_for_invalid_grade():
    # setup
    data = create_review_test_data()

    # test method
    try:
        controller.get_reviews(data["course_id"], grade=" ")
    except HTTPException as e:
        if e.detail != "Grade cannot be empty":
            assert False
        # cleanup
        cleanup_review_test_data(data)
        return

    cleanup_review_test_data(data)
    assert False


# Use Case 12: Filter class reviews by semester

# valid semester
def test_get_reviews_filtered_by_semester():
    # setup
    data = create_review_test_data()

    # test method
    results = controller.get_reviews(data["course_id"], semester="Fall")

    # make sure only reviews from Fall were returned
    assert {review.id for review in results} == {data["review_one_id"]}

    # cleanup
    cleanup_review_test_data(data)


# invalid semester
def test_get_reviews_for_invalid_semester():
    # setup
    data = create_review_test_data()

    # test method
    try:
        controller.get_reviews(data["course_id"], semester=" ")
    except HTTPException as e:
        if e.detail != "Semester cannot be empty":
            assert False
        # cleanup
        cleanup_review_test_data(data)
        return

    cleanup_review_test_data(data)
    assert False


# Use Case 13: Filter class reviews by year

# valid year
def test_get_reviews_filtered_by_year():
    # setup
    data = create_review_test_data()

    # test method
    results = controller.get_reviews(data["course_id"], year="2025")

    # make sure only reviews from 2025 were returned
    assert {review.id for review in results} == {data["review_one_id"]}

    # cleanup
    cleanup_review_test_data(data)


# invalid year
def test_get_reviews_for_invalid_year():
    # setup
    data = create_review_test_data()

    # test method
    try:
        controller.get_reviews(data["course_id"], year=" ")
    except HTTPException as e:
        if e.detail != "Year cannot be empty":
            assert False
        # cleanup
        cleanup_review_test_data(data)
        return

    cleanup_review_test_data(data)
    assert False


# Use Case 14: Order class reviews by number of likes

# valid course
def test_get_reviews_ordered_by_likes():
    # setup
    data = create_review_test_data()
    review_ops = ReviewOps()

    with Session(engine) as session:
        liker_one = session.get(Account, data["liker_one_id"])
        liker_two = session.get(Account, data["liker_two_id"])

    # give review one two likes, review two one like, and review three no likes
    review_one = review_ops.get_review_by_id(data["review_one_id"])
    review_two = review_ops.get_review_by_id(data["review_two_id"])

    review_ops.like_review(review_one, liker_one)
    review_ops.like_review(review_one, liker_two)
    review_ops.like_review(review_two, liker_one)

    # test method
    results = controller.get_reviews_ordered_by_likes(data["course_id"])

    # make sure reviews are ordered from most likes to fewest likes
    assert [review.id for review in results] == [
        data["review_one_id"],
        data["review_two_id"],
        data["review_three_id"],
    ]

    # cleanup
    cleanup_review_test_data(data)


# invalid course
def test_get_reviews_ordered_by_likes_for_invalid_course():
    # test method
    try:
        controller.get_reviews_ordered_by_likes(-1)
    except HTTPException as e:
        if e.detail != "Course does not exist":
            assert False
        return

    assert False


# Use Case 15: Create class review

# valid inputs
def test_create_review_for_valid_inputs():
    # setup
    data = create_review_test_data()

    # test method
    test_id = controller.create_review(
        course_id=data["course_id"],
        account_id=data["author_id"],
        grade_received="A-",
        semester_taken="Fall",
        year_taken="2026",
        textbook_required=True,
        attendance_required=False,
        professor_id=data["professor_id"],
        rating=4.0,
        comment="Review created by the use-case test",
    )

    # make sure the review and its details were created correctly
    with Session(engine) as session:
        statement = select(Review).where(Review.id == test_id)
        results = session.exec(statement)
        r = results.one()

        if r.rating != 4.0:
            assert False
        if r.comment != "Review created by the use-case test":
            assert False

        statement = select(ReviewDetails).where(
            ReviewDetails.id == r.review_details_id
        )
        results = session.exec(statement)
        details = results.one()

        if details.class_id != data["course_id"]:
            assert False
        if details.created_by_account_id != data["author_id"]:
            assert False
        if details.grade_received != "A-":
            assert False
        if details.semester_taken != "Fall":
            assert False
        if details.year_taken != "2026":
            assert False
        if details.textbook_required is not True:
            assert False
        if details.attendance_required is not False:
            assert False
        if details.professor_id != data["professor_id"]:
            assert False

    # cleanup
    cleanup_review_test_data(data)


# invalid rating
def test_create_review_for_invalid_rating():
    # setup
    data = create_review_test_data()

    # test method
    try:
        controller.create_review(
            course_id=data["course_id"],
            account_id=data["author_id"],
            grade_received="A",
            semester_taken="Fall",
            year_taken="2026",
            textbook_required=True,
            attendance_required=True,
            professor_id=data["professor_id"],
            rating=6.0,
            comment="Invalid rating test",
        )
    except HTTPException as e:
        if e.detail != "Rating must be between 0.0 and 5.0":
            assert False

        # make sure no review was created for the invalid rating
        with Session(engine) as session:
            statement = select(Review).join(ReviewDetails).where(
                ReviewDetails.class_id == data["course_id"]
            )
            results = session.exec(statement)
            reviews = results.all()

            if len(reviews) != 3:
                assert False

        # cleanup
        cleanup_review_test_data(data)
        return

    cleanup_review_test_data(data)
    assert False