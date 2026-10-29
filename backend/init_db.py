from src.database import engine
from src.models.account import Account  
from src.models.university import University
from sqlmodel import SQLModel


print("Streaming table models directly up to Neon Cloud PostgreSQL...")
SQLModel.metadata.create_all(engine)
print("Success! Your class models have materialized inside your Neon cloud project.")

