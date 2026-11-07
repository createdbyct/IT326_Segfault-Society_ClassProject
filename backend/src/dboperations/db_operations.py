from src.database import engine
from abc import ABC, abstractmethod
from sqlmodel import Session, SQLModel

class DBOperations(ABC):

	@abstractmethod
	def save(self,model: SQLModel) -> SQLModel:
		with Session(engine) as session:
			session.add(model)
			session.commit()
			session.refresh(model)
			return model

	@abstractmethod
	def delete(self, model: SQLModel)-> None:
		with Session(engine) as session:
			session.delete(model)
			session.commit()

	@abstractmethod
	def getByID(self, id: int) -> SQLModel | None:
		pass #this method needs to return an SQLModel