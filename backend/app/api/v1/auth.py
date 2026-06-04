"""Authentication endpoints — register, login, current user."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, session: SessionDep):
    existing = await session.exec(select(User).where(User.email == payload.email))
    if existing.first():
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        pinfl=payload.pinfl,
        phone=payload.phone,
        is_verified=True,  # hackathon: auto-verify
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(user.id, user.role.value)
    return TokenResponse(
        access_token=token, role=user.role, user_id=user.id, full_name=user.full_name
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: SessionDep):
    result = await session.exec(select(User).where(User.email == payload.email))
    user = result.first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")

    token = create_access_token(user.id, user.role.value)
    return TokenResponse(
        access_token=token, role=user.role, user_id=user.id, full_name=user.full_name
    )


@router.post("/token", response_model=TokenResponse)
async def login_oauth(
    session: SessionDep, form: OAuth2PasswordRequestForm = Depends()
):
    """OAuth2 password flow — for Swagger 'Authorize' button."""
    result = await session.exec(select(User).where(User.email == form.username))
    user = result.first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    token = create_access_token(user.id, user.role.value)
    return TokenResponse(
        access_token=token, role=user.role, user_id=user.id, full_name=user.full_name
    )


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser):
    return user
