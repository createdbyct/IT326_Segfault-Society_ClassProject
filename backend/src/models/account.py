from datetime import datetime, timezone
from typing import Optional

from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from sqlmodel import Field, SQLModel


password_hasher = PasswordHash.recommended()


class Account(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(unique=True, nullable=False)
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def updateInformation(self, username: str, password: str) -> bool:
        username = username.strip()

        if not username or not password.strip():
            return False

        new_hash = password_hasher.hash(password)
        self.username = username
        self.password_hash = new_hash
        return True
    def getID(self) -> int | None:
        return self.id

    def getUsername(self) -> str:
        return self.username

    def getEmail(self) -> str:
        return self.email

    def getCreatedAt(self) -> datetime:
        return self.created_at
    def validatePassword(self, password: str) -> bool:
        try:
            return password_hasher.verify(password, self.password_hash)
        except (UnknownHashError, ValueError):
            return False