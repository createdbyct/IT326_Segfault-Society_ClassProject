from src.database import engine
from src.models.account import Account  
from src.models.university import University
from sqlmodel import SQLModel
from src.models.user import User 
from src.models.review_details import ReviewDetails
from src.models.review_like import ReviewLike
from src.models.review_dislike import ReviewDislike
from src.models.favorite_class import FavoriteClass

print("Streaming table models directly up to Neon Cloud PostgreSQL...")
SQLModel.metadata.create_all(engine)
print("Success! Your class models have materialized inside your Neon cloud project.")

