import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

RAW_URL = os.getenv("DATABASE_URL")
if not RAW_URL:
    raise ValueError("Missing DATABASE_URL configuration inside the environment!")

# SQLAlchemy/SQLModel requires the exact driver dialect prefix 'postgresql+psycopg2://'
if RAW_URL.startswith("postgresql://"):
    DATABASE_URL = RAW_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    DATABASE_URL = RAW_URL

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        get_db = session
        yield get_db

