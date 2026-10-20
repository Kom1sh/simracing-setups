"""Контекст для совета: машина, трасса, условия, текущие правки, история, куски руководств."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.knowledge.effects import Effect, manuals
from app.models import Advice, Feedback, KnowledgeChunk

CONDITION_KEYS = ("airTemp", "trackTemp", "sky", "rain", "wetness", "rubber", "sessionType", "duration")


def manual_for(car_id: str, class_id: str) -> list[str]:
    """Сначала руководство этой машины, потом остальные руководства класса."""
    ms = manuals().values()
    own = [m["id"] for m in ms if car_id in m["cars"]]
    rest = [m["id"] for m in ms if m["class"] == class_id and m["id"] not in own]
    return own + rest


def excerpts(db: Session, car_id: str, class_id: str, candidates: list[Effect], limit: int = 4) -> list[dict]:
    wanted = {e.param for e in candidates}
    order = manual_for(car_id, class_id)
    rows = db.scalars(select(KnowledgeChunk).where(KnowledgeChunk.manual_id.in_(order))).all()
    rows = [r for r in rows if wanted & set(r.params)]
    rows.sort(key=lambda r: (order.index(r.manual_id), -len(wanted & set(r.params))))
    out, seen = [], set()
    for r in rows:
        key = (r.heading, tuple(r.params))
        if key in seen:
            continue
        seen.add(key)
        out.append({"manual": manuals()[r.manual_id]["title"], "section": r.heading, "text": r.text[:450]})
        if len(out) >= limit:
            break
    return out


def current_changes(params: dict, setup: dict) -> list[dict]:
    """Что уже изменено от базового сетапа iRacing — чтобы модель не советовала то же самое вслепую."""
    out = []
    for pid, v in (setup or {}).items():
        p = params.get(pid)
        if not p or pid == "fuel":
            continue
        if p["kind"] == "choice":
            if v != p["base"]:
                out.append({"adjustment": p["label"], "value": v})
        elif isinstance(v, list) and any(abs(x) > 1e-9 for x in v):
            out.append({"adjustment": p["label"], "values": v, "unit": p.get("unit", "")})
        elif isinstance(v, (int, float)) and p.get("relative") and abs(v) > 1e-9:
            out.append({"adjustment": p["label"], "value": v, "unit": p.get("unit", "")})
    return out


def history(db: Session, user_id: int | None, car_id: str, track_id: str, limit: int = 5) -> tuple[list[dict], set[str]]:
    """Прошлые советы на этой машине и трассе с отзывами; правки с отзывом «хуже» больше не предлагаем."""
    if user_id is None:
        return [], set()
    rows = db.scalars(
        select(Advice).where(Advice.user_id == user_id, Advice.car_id == car_id, Advice.track_id == track_id, Advice.status == "advice").order_by(Advice.created_at.desc()).limit(limit)
    ).all()
    out, worse = [], set()
    for a in rows:
        fb = db.scalar(select(Feedback).where(Feedback.advice_id == a.id))
        ids = [c["effect_id"] for c in a.result.get("changes", [])]
        out.append({"changes": [c.get("text", "") + " " + c.get("label", "") for c in a.result.get("changes", [])], "result": fb.result if fb else "no feedback yet"})
        if fb and fb.result == "worse":
            worse.update(ids)
    return out, worse
