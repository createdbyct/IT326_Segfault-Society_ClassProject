from src.database import engine
from abc import ABC, abstractmethod

class DBOperations(ABC):

	@abstractmethod
	def save(SQLModel model):
		with Session(engine) as session:
			session.add(model)
			session.commit()

	@abstractmethod
	def delete(SQLModel model):
		with Session(engine) as session:
			session.delete(model)
			session.commit()

	@abstractmethod
	def getByID(int id):
		pass #this method needs to return an SQLModel