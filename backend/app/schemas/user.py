import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str | None = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role_id: int = Field(default=2)


class UserResponse(UserBase):
    id: uuid.UUID
    role_id: int
    is_active: bool
    is_verified: bool
    last_login_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserInToken(BaseModel):
    id: str
    email: str
    username: str
    role: str
