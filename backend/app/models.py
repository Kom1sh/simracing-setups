"""Модели базы. Таблицы parameters / rules / request совместимы с контрактом ALE-03 (бэкенд Родиона)."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def now() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(60))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # В базе только sha256 от токена: утечка базы не даёт войти
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship()


class Setup(Base):
    __tablename__ = "setups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    car_id: Mapped[str] = mapped_column(String(80))
    track_id: Mapped[str] = mapped_column(String(80))
    # Условия, правки от базы, симметрия, время круга и расход — как в кабинете
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)


# --- ALE-03: экспертные правила и история запросов формы ---


class Parameter(Base):
    __tablename__ = "parameters"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    unit: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    limits: Mapped[str] = mapped_column(Text)

    rules: Mapped[list[Rule]] = relationship(back_populates="parameter")


class Rule(Base):
    __tablename__ = "rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_id: Mapped[str] = mapped_column(String(40), unique=True)
    symptom_type: Mapped[str] = mapped_column(String(20))
    corner_phase: Mapped[str] = mapped_column(String(10))
    stint_moment: Mapped[str | None] = mapped_column(String(20), nullable=True)
    parameter_id: Mapped[int] = mapped_column(ForeignKey("parameters.id"))
    direction: Mapped[str] = mapped_column(String(10))
    change_description: Mapped[str] = mapped_column(Text)
    expected_effect: Mapped[str] = mapped_column(Text)
    limitations: Mapped[str] = mapped_column(Text)
    applicability: Mapped[dict] = mapped_column(JSON)
    verification_status: Mapped[str] = mapped_column(String(20))
    basis: Mapped[str] = mapped_column(Text)

    parameter: Mapped[Parameter] = relationship(back_populates="rules")


class RecommendationRequest(Base):
    __tablename__ = "request"

    request_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    car: Mapped[str] = mapped_column(String(120))
    track: Mapped[str] = mapped_column(String(120))
    symptom_type: Mapped[str] = mapped_column(String(20))
    corner_phase: Mapped[str] = mapped_column(String(10))
    stint_moment: Mapped[str | None] = mapped_column(String(20), nullable=True)
    comment: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(10))
    rule_ids: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


# --- ИИ-ассистент ---


class Advice(Base):
    __tablename__ = "advice"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    setup_id: Mapped[str | None] = mapped_column(String(36), index=True, nullable=True)
    car_id: Mapped[str] = mapped_column(String(80))
    track_id: Mapped[str] = mapped_column(String(80))
    class_id: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20))  # advice | question | unknown
    mode: Mapped[str] = mapped_column(String(20))  # ai | rules
    model: Mapped[str | None] = mapped_column(String(80), nullable=True)
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    input: Mapped[dict] = mapped_column(JSON, default=dict)
    result: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    advice_id: Mapped[str] = mapped_column(ForeignKey("advice.id", ondelete="CASCADE"), unique=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    result: Mapped[str] = mapped_column(String(10))  # better | same | worse
    applied: Mapped[bool] = mapped_column(Boolean, default=True)
    lap_before: Mapped[float | None] = mapped_column(Float, nullable=True)
    lap_after: Mapped[float | None] = mapped_column(Float, nullable=True)
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class KnowledgeChunk(Base):
    """Кусок руководства iRacing: раздел про одну регулировку. Поиск — через FTS5 knowledge_fts."""

    __tablename__ = "knowledge_chunks"

    id: Mapped[int] = mapped_column(primary_key=True)
    manual_id: Mapped[str] = mapped_column(String(60), index=True)
    class_id: Mapped[str] = mapped_column(String(20), index=True)
    heading: Mapped[str] = mapped_column(String(120))
    text: Mapped[str] = mapped_column(Text)
    params: Mapped[list] = mapped_column(JSON, default=list)
