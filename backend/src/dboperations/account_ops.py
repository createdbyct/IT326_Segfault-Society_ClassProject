from sqlmodel import Session

from src.database import engine
from src.dboperations.db_operations import DBOperations
from src.models.account import Account


class AccountOps(DBOperations):

    def save(self, model: Account) -> SQLModel:
        return super().save(model)

    def delete(self, model: Account) -> None:
        super().delete(model)

    def getByID(self, id: int) -> Account | None:
        with Session(engine) as session:
            return session.get(Account, id)