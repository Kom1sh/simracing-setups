"""Контракт ALE-03 (бэкенд Родиона): форма из шести полей → экспертные правила. Поведение то же, «Не важно» работает."""

from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import RecommendationRequest, Rule

router = APIRouter()


class RecommendationIn(BaseModel):
    car: str
    track: str
    symptom_type: Literal["understeer", "oversteer"]
    corner_phase: Literal["entry", "mid", "exit"]
    comment: str = Field(min_length=3, max_length=500)
    stint_moment: Literal["from_start", "after_laps"] | None = None


@router.post("/api/v1/recommendations")
def recommendations(data: RecommendationIn, db: Session = Depends(get_db)) -> dict:
    stmt = select(Rule).where(Rule.symptom_type == data.symptom_type, Rule.corner_phase == data.corner_phase, Rule.verification_status == "verified")
    if data.stint_moment is not None:
        stmt = stmt.where(or_(Rule.stint_moment == data.stint_moment, Rule.stint_moment.is_(None)))
    rules = [
        r
        for r in db.scalars(stmt.order_by(Rule.id))
        if isinstance(r.applicability, dict) and data.car in (r.applicability.get("car") or []) and data.track in (r.applicability.get("track") or [])
    ]
    request_id = str(uuid4())
    db.add(
        RecommendationRequest(
            request_id=request_id,
            car=data.car,
            track=data.track,
            symptom_type=data.symptom_type,
            corner_phase=data.corner_phase,
            stint_moment=data.stint_moment,
            comment=data.comment,
            status="match" if rules else "no_match",
            rule_ids=[r.rule_id for r in rules],
        )
    )
    db.commit()
    if not rules:
        return {"status": "no_match", "request_id": request_id, "message": "Подходящее правило не найдено."}
    return {
        "status": "match",
        "request_id": request_id,
        "recommendations": [
            {
                "rule_id": r.rule_id,
                "parameter": r.parameter.name,
                "direction": r.direction,
                "change_description": r.change_description,
                "expected_effect": r.expected_effect,
                "limitations": r.limitations,
                "basis": r.basis,
            }
            for r in rules
        ],
    }
