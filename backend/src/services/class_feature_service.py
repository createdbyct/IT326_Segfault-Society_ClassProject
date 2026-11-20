from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.repositories.class_feature_repository import ClassFeatureRepository


class FeatureError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class ClassFeatureService:
    def __init__(self, repository: "ClassFeatureRepository"):
        self.repository = repository

    def update_favorite_class(
        self, account_id: int, course_ids: list[int]
    ) -> bool:
        if len(course_ids) != len(set(course_ids)):
            raise FeatureError(400, "Course IDs must be unique.")

        account = self._account(account_id)
        courses = [self._course(course_id) for course_id in course_ids]

        return self.repository.accounts.replaceFavoriteCoursesForAccount(
            account, courses
        )

    def remove_course_from_favorite_list(
        self, account_id: int, course_id: int
    ) -> bool:
        account = self._account(account_id)
        course = self._course(course_id)
        self.repository.accounts.removeFavoriteCourseFromAccount(account, course)
        return True

    def like_review(self, account_id: int, review_id: int) -> bool:
        account = self._account(account_id)
        review = self._review(review_id)
        self.repository.accounts.likeReviewForAccount(account, review)
        return True

    def dislike_review(self, account_id: int, review_id: int) -> bool:
        account = self._account(account_id)
        review = self._review(review_id)
        self.repository.accounts.dislikeReviewForAccount(account, review)
        return True

    def get_top_rated_classes(self):
        return self.repository.get_ranked_courses(limit=10, descending=True)

    def get_bottom_rated_classes(self):
        return self.repository.get_ranked_courses(limit=10, descending=False)

    def delete_class(self, course_id: int) -> bool:
        course = self._course(course_id)
        self.repository.courses.delete_course(course)
        return True

    def update_class(self, course_id: int, code: str, university: str) -> bool:
        code = code.strip()
        university = university.strip()
        if not code or not university:
            raise FeatureError(400, "Course code and university are required.")

        course = self._course(course_id)
        universities = self.repository.universities.getUniversitiesByName(university)
        university_record = next(
            (record for record in universities if record.name == university),
            None,
        )
        if university_record is None:
            raise FeatureError(404, "University not found.")

        if self.repository.course_code_exists(code, university_record.id, course_id):
            raise FeatureError(409, "This university already has a course with that code.")

        self.repository.courses.update_course_details(course, code, university_record)
        return True

    def _account(self, account_id: int):
        account = self.repository.accounts.getAccountByID(account_id)
        if account is None:
            raise FeatureError(404, "Account not found.")
        return account

    def _course(self, course_id: int):
        course = self.repository.courses.get_course_by_id(course_id)
        if course is None:
            raise FeatureError(404, "Course not found.")
        return course

    def _review(self, review_id: int):
        review = self.repository.get_review_by_id(review_id)
        if review is None:
            raise FeatureError(404, "Review not found.")
        return review