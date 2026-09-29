from src.database import engine
from sqlmodel import SQLModel
from src.models.user import User 

print("Streaming table models directly up to Neon Cloud PostgreSQL...")
SQLModel.metadata.create_all(engine)
print("Success! Your class models have materialized inside your Neon cloud project.")

