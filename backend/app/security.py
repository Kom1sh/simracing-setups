"""Пароли (argon2id), сессии в httpOnly-куке, текущий пользователь, ограничение попыток входа."""

from __future__ import annotations

import hashlib
import secrets
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError
from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings
from app.db import get_db
from app.models import AuthSession, User

SESSION_COOKIE = "srs_sid"
# Не секрет: по нему статическая страница кабинета понимает, что вход есть, и не уводит на /login
HINT_COOKIE = "srs_in"

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(hash_: str, password: str) -> bool:
    try:
        return _hasher.verify(hash_, password)
    except VerificationError:
        return False


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def start_session(db: Session, user: User, response: Response, settings: Settings) -> None:
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=settings.session_days)
    db.add(AuthSession(user_id=user.id, token_hash=_token_hash(token), expires_at=expires))
    db.commit()
    age = settings.session_days * 86400
    response.set_cookie(SESSION_COOKIE, token, max_age=age, httponly=True, secure=settings.cookie_secure, samesite="lax", path="/")
    response.set_cookie(HINT_COOKIE, "1", max_age=age, httponly=False, secure=settings.cookie_secure, samesite="lax", path="/")


def end_session(db: Session, request: Request, response: Response) -> None:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        s = db.scalar(select(AuthSession).where(AuthSession.token_hash == _token_hash(token)))
        if s:
            db.delete(s)
            db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/")
    response.delete_cookie(HINT_COOKIE, path="/")


def optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    s = db.scalar(select(AuthSession).where(AuthSession.token_hash == _token_hash(token)))
    if not s:
        return None
    expires = s.expires_at if s.expires_at.tzinfo else s.expires_at.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        db.delete(s)
        db.commit()
        return None
    return s.user


def current_user(user: User | None = Depends(optional_user)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail={"code": "unauthorized", "message": "Нужно войти"})
    return user


class RateLimiter:
    """Скользящее окно в памяти: попытки входа и регистрации с одного адреса."""

    def __init__(self, limit: int, window_s: float) -> None:
        self.limit, self.window = limit, window_s
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        q = self.hits[key]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            return False
        q.append(now)
        return True
