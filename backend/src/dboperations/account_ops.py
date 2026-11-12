from collections.abc import Callable
from typing import TypeVar

from sqlmodel import Session, SQLModel, select

from src.database import engine
from src.models.account import Account
from src.models.course import Course
from src.models.review import Review


Related = TypeVar("Related", bound=SQLModel)


class AccountOps:
    def createAccount(self, account: Account) -> None:
        with Session(engine, expire_on_commit=False) as session:
            session.add(account)
            session.commit()

    def deleteAccount(self, account: Account) -> None:
        with Session(engine) as session:
            saved_account = self._get_saved(
                session,
                Account,
                account.id,
            )
            session.delete(saved_account)
            session.commit()

    def getAccountByID(self, id: int) -> Account | None:
        with Session(engine) as session:
            return session.get(Account, id)

    def getAccounts(
        self,
        username: str,
        email: str,
    ) -> list[Account]:
        with Session(engine) as session:
            statement = select(Account).where(
                Account.username == username,
                Account.email == email,
            )
            return list(session.exec(statement).all())

    def updateAccount(
        self,
        account: Account,
        username: str,
        password: str,
    ) -> Account:
        with Session(engine, expire_on_commit=False) as session:
            saved_account = self._get_saved(
                session,
                Account,
                account.id,
            )

            saved_account.updateInformation(username, password)
            session.commit()
            session.refresh(saved_account)

            return saved_account

    def addFavoriteCourseToAccount(
        self,
        account: Account,
        course: Course,
    ) -> None:
        self._change_relationship(
            account,
            Course,
            course.id,
            Account.addFavoriteCourse,
        )

    def removeFavoriteCourseFromAccount(
        self,
        account: Account,
        course: Course,
    ) -> None:
        self._change_relationship(
            account,
            Course,
            course.id,
            Account.removeFavoriteCourse,
        )

    def likeReviewForAccount(
        self,
        account: Account,
        review: Review,
    ) -> None:
        self._change_relationship(
            account,
            Review,
            review.id,
            Account.likeReview,
        )

    def removeLikedReviewForAccount(
        self,
        account: Account,
        review: Review,
    ) -> None:
        self._change_relationship(
            account,
            Review,
            review.id,
            Account.removeLikedReview,
        )

    def dislikeReviewForAccount(
        self,
        account: Account,
        review: Review,
    ) -> None:
        self._change_relationship(
            account,
            Review,
            review.id,
            Account.dislikeReview,
        )

    def removeDislikedReviewForAccount(
        self,
        account: Account,
        review: Review,
    ) -> None:
        self._change_relationship(
            account,
            Review,
            review.id,
            Account.removeDislikedReview,
        )

    def addReviewCreatedByAccount(
        self,
        account: Account,
        review: Review,
    ) -> None:
        self._change_relationship(
            account,
            Review,
            review.id,
            Account.addReviewCreated,
        )

    def removeReviewCreatedByAccount(
        self,
        account: Account,
        review: Review,
    ) -> None:
        self._change_relationship(
            account,
            Review,
            review.id,
            Account.removeReviewCreated,
        )

    def _change_relationship(
        self,
        account: Account,
        model: type[Related],
        related_id: int | None,
        change: Callable[[Account, Related], None],
    ) -> None:
        with Session(engine) as session:
            saved_account = self._lock_account(session, account.id)

            related = self._get_saved(
                session,
                model,
                related_id,
            )

            change(saved_account, related)
            session.commit()

    @staticmethod
    def _get_saved(
        session: Session,
        model: type[Related],
        id: int | None,
    ) -> Related:
        record = session.get(model, id) if id is not None else None

        if record is None:
            raise ValueError(
                f"{model.__name__} must already be saved."
            )
        return record
    def replaceFavoriteCourseForAccount(
        self,
        account: Account,
        old_course: Course,
        new_course: Course,
    ) -> bool:
        with Session(engine) as session:
            saved_account = self._lock_account(session, account.id)
            saved_old = self._get_saved(session, Course, old_course.id)
            saved_new = self._get_saved(session, Course, new_course.id)

            if (
                saved_old not in saved_account.favorite_courses
                or saved_new in saved_account.favorite_courses
            ):
                return False

            saved_account.removeFavoriteCourse(saved_old)
            saved_account.addFavoriteCourse(saved_new)
            session.commit()
            return True

    @staticmethod
    def _lock_account(session: Session, account_id: int | None) -> Account:
        statement = select(Account).where(Account.id == account_id).with_for_update()
        account = session.exec(statement).first()
        if account is None:
            raise ValueError("Account must already be saved.")
        return account