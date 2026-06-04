"""Audit log model — security event trail (admin audit-log page)."""
from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    role: Optional[str] = None
    action: str = Field(index=True)        # e.g. "login", "claim.create"
    resource: Optional[str] = None         # e.g. "claim:123"
    ip_address: Optional[str] = None
    status: str = Field(default="success")  # success | error
    meta: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(
        default_factory=datetime.utcnow, index=True
    )
