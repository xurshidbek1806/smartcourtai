"""User model — citizens, judges, lawyers, admins, oversight officers."""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.enums import UserRole


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: str
    role: UserRole = Field(default=UserRole.CITIZEN, index=True)

    # OneID / identity (mock for hackathon)
    pinfl: Optional[str] = Field(default=None, index=True)  # JSHSHIR
    passport: Optional[str] = None
    phone: Optional[str] = None

    # Role-specific
    court_name: Optional[str] = None      # judge: which court
    license_number: Optional[str] = None  # lawyer: bar license
    specialization: Optional[str] = None  # lawyer

    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
