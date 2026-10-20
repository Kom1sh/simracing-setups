"""ИИ-ассистент: совет по описанию проблемы и контексту кабинета, отзыв «помогло / так же / хуже», история."""

from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.advice.engine import advise
from app.catalog import get_catalog
from app.db import get_db
from app.models import Advice, Feedback, User
from app.security import current_user

router = APIRouter(prefix="/api/v2/advice")


class AdviceIn(BaseModel):
    car_id: str
    track_id: str
    text: str = Field(default="", max_length=1000)
    symptom: Literal["understeer", "oversteer", "lockup", "wheelspin"] | None = None
    phase: Literal["entry", "mid", "exit"] | None = None
    when: Literal["from_start", "after_laps", "any"] | None = None
    speed: Literal["slow", "fast", "any"] | None = None
    conditions: dict = Field(default_factory=dict)
    setup: dict = Field(default_factory=dict)
    setup_id: str | None = None
    lang: Literal["ru", "en"] = "ru"

    @model_validator(mode="after")
    def _enough(self) -> "AdviceIn":
        if not self.symptom and len(self.text.strip()) < 5:
            raise ValueError("Опишите проблему хотя бы парой слов или выберите, что делает машина")
        return self


class FeedbackIn(BaseModel):
    result: Literal["better", "same", "worse"]
    applied: bool = True
    lap_before: float | None = Field(default=None, gt=0, lt=3600)
    lap_after: float | None = Field(default=None, gt=0, lt=3600)
    comment: str = Field(default="", max_length=500)


def _today_count(db: Session, user: User) -> int:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return db.scalar(select(func.count()).select_from(Advice).where(Advice.user_id == user.id, Advice.created_at >= start)) or 0


def out(a: Advice, feedback: Feedback | None = None) -> dict:
    return {"id": a.id, "created_at": a.created_at.isoformat(), "car_id": a.car_id, "track_id": a.track_id, **a.result, "feedback": feedback.result if feedback else None}


@router.post("")
def create(data: AdviceIn, request: Request, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    c = get_catalog()
    fields = {}
    if data.car_id not in c.cars:
        fields["car_id"] = "Нет такой машины"
    if data.track_id not in c.tracks:
        fields["track_id"] = "Нет такой трассы"
    if fields:
        raise HTTPException(400, {"code": "validation_error", "message": "Проверьте заполнение полей", "fields": fields})
    settings = request.app.state.settings
    used = _today_count(db, user)
    if used >= settings.advice_daily_limit:
        raise HTTPException(429, {"code": "daily_limit", "message": f"На сегодня советы закончились ({settings.advice_daily_limit} в день). Завтра лимит обновится."})

    r = advise(db, request.app.state.llm, settings, user.id, data.model_dump())
    result = {k: r[k] for k in ("status", "mode", "model", "summary", "question", "changes", "check", "diagnosis")}
    a = Advice(
        user_id=user.id,
        setup_id=data.setup_id,
        car_id=data.car_id,
        track_id=data.track_id,
        class_id=c.car_class(data.car_id),
        status=r["status"],
        mode=r["mode"],
        model=r["model"],
        tokens=r["tokens"],
        latency_ms=r["latency_ms"],
        input=data.model_dump(exclude={"setup"}),
        result=result,
    )
    db.add(a)
    db.commit()
    return {**out(a), "remaining_today": max(0, settings.advice_daily_limit - used - 1)}


@router.post("/{advice_id}/feedback")
def feedback(advice_id: str, data: FeedbackIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    a = db.get(Advice, advice_id)
    if not a or a.user_id != user.id:
        raise HTTPException(404, {"code": "not_found", "message": "Совет не найден"})
    fb = db.scalar(select(Feedback).where(Feedback.advice_id == a.id))
    if fb is None:
        fb = Feedback(advice_id=a.id, user_id=user.id)
        db.add(fb)
    fb.result, fb.applied, fb.lap_before, fb.lap_after, fb.comment = data.result, data.applied, data.lap_before, data.lap_after, data.comment
    db.commit()
    return {"status": "ok", "advice_id": a.id, "result": fb.result}


@router.get("")
def list_advice(car_id: str | None = None, track_id: str | None = None, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    stmt = select(Advice).where(Advice.user_id == user.id)
    if car_id:
        stmt = stmt.where(Advice.car_id == car_id)
    if track_id:
        stmt = stmt.where(Advice.track_id == track_id)
    rows = db.scalars(stmt.order_by(Advice.created_at.desc()).limit(20)).all()
    fbs = {f.advice_id: f for f in db.scalars(select(Feedback).where(Feedback.advice_id.in_([a.id for a in rows])))}
    return {"advice": [out(a, fbs.get(a.id)) for a in rows]}
