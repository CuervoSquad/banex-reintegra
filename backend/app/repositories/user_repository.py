import uuid
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate
from app.core.security import hash_password


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, data: UserCreate) -> User:
        user = User(
            email=data.email,
            username=data.username,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role_id=data.role_id,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def increment_failed_attempts(self, user: User) -> None:
        user.failed_attempts += 1
        self.db.commit()

    def reset_failed_attempts(self, user: User) -> None:
        user.failed_attempts = 0
        user.locked_until = None
        self.db.commit()

    def update_last_login(self, user: User) -> None:
        from datetime import datetime, timezone
        user.last_login_at = datetime.now(timezone.utc)
        self.db.commit()
