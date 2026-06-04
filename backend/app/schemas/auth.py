"""Auth & user schemas."""
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CITIZEN
    pinfl: Optional[str] = None
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    full_name: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    pinfl: Optional[str] = None
    phone: Optional[str] = None
    court_name: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True
