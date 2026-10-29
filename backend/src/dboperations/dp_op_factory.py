from enum import Enum

class DBOpFactory():
	
	class DBOpType(Enum):
		UNIVERSITY = 1
		CLASS = 2
		PROFESSOR = 3
		REVIEW = 4
		REVIEWDETAILS = 5
		ACCOUNT = 6
		REVIEWLIKE = 7
		REVIEWDISLIKE = 8
		FAVORITECLASS = 9
	
	def getDBOp(DBOpType type):
		#TODO
			