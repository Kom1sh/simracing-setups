"""Аккаунты: регистрация, вход, выход, текущий пользователь. Сессия — httpOnly-кука srs_sid."""

import re

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User
from app.security import current_user, end_session, hash_password, start_session, verify_password

router = APIRouter(prefix="/api/v2/auth")

EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class RegisterIn(BaseModel):
    email: str = Field(max_length=254)
    name: str = Field(min_length=1, max_length=40)
    password: str = Field(min_length=8, max_length=200)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL.match(v):
            raise ValueError("Нужен адрес вида name@example.com")
        return v

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Укажите имя")
        return v


class LoginIn(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(max_length=200)


def public(user: User) -> dict:
    return {"id": user.id, "email": user.email, "name": user.name, "since": user.created_at.isoformat()}


def _limit(request: Request) -> None:
    ip = request.headers.get("x-real-ip") or (request.client.host if request.client else "?")
    if not request.app.state.auth_limiter.allow(ip):
        raise HTTPException(429, {"code": "too_many_attempts", "message": "Слишком много попыток. Подождите несколько минут."})


@router.post("/register", status_code=201)
def register(data: RegisterIn, request: Request, response: Response, db: Session = Depends(get_db)) -> dict:
    _limit(request)
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(409, {"code": "email_taken", "message": "Аккаунт с этим адресом уже есть", "fields": {"email": "Уже зарегистрирован"}})
    user = User(email=data.email, name=data.name, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    start_session(db, user, response, request.app.state.settings)
    return {"user": public(user)}


@router.post("/login")
def login(data: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)) -> dict:
    _limit(request)
    user = db.scalar(select(User).where(User.email == data.email.strip().lower()))
    if not user:
        raise HTTPException(401, {"code": "no_account", "message": "Аккаунта с таким адресом нет", "fields": {"email": "Не найден"}})
    if not verify_password(user.password_hash, data.password):
        raise HTTPException(401, {"code": "wrong_password", "message": "Неверный пароль", "fields": {"password": "Неверный пароль"}})
    start_session(db, user, response, request.app.state.settings)
    return {"user": public(user)}


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)) -> dict:
    end_session(db, request, response)
    return {"status": "ok"}


@router.get("/me")
def me(user: User = Depends(current_user)) -> dict:
    return {"user": public(user)}
