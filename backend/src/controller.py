from src.service import Service

class Controller():
    def __init__(self):
        self.service = Service()

    def update_class_review(self, review_id: int, rating: float, comment: str):
        return self.service.update_class_review(review_id, rating, comment)

    def delete_review(self, review_id: int):
        return self.service.delete_review(review_id)

    def create_course(self, code: str, university: str):
        return self.service.create_course(code, university)

    def add_course_to_favorite_list(self, account_id: int, course_id: int):
        return self.service.add_course_to_favorite_list(account_id, course_id)

    def get_favorite_courses(self, account_id: int):
        return self.service.get_favorite_courses(account_id)

    # Create a class review
    def create_review(
        self,
        course_id: int,
        account_id: int,
        grade_received: str,
        semester_taken: str,
        year_taken: str,
        textbook_required: bool,
        attendance_required: bool,
        professor_id: int,
        rating: float,
        comment: str
    ):
        return self.service.create_review(
            course_id,
            account_id,
            grade_received,
            semester_taken,
            year_taken,
            textbook_required,
            attendance_required,
            professor_id,
            rating,
            comment
        )

    # Filter class reviews
    def get_reviews(
        self,
        course_id: int,
        grade: str = None,
        semester: str = None,
        year: str = None
    ):
        return self.service.get_reviews(
            course_id, grade, semester, year
        )

    # Sort class reviews by likes
    def get_reviews_ordered_by_likes(self, course_id: int):
        return self.service.get_reviews_ordered_by_likes(course_id)