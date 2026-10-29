from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from src.database import get_session
from src.models.account import Account

app = FastAPI(title="University Project API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "Online", "engine": "SQLModel", "database": "PostgreSQL"}

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_data: Account,
    session: Session = Depends(get_session),
):
    existing_user = session.exec(
        select(Account).where(Account.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered",
        )

    session.add(user_data)
    session.commit()
    session.refresh(user_data)

    return {
        "message": "User registered successfully!",
        "user_id": user_data.id,
    }


@app.get("/users")
def get_all_users(session: Session = Depends(get_session)):
    results = session.exec(select(Account)).all()
    return {
        "total_records": len(results),
        "data": results,
    }

