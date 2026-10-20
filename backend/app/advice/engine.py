"""Совет: диагноз → кандидаты из таблицы эффектов → модель выбирает и объясняет → проверка по гаражу. Без модели — по таблице."""

from __future__ import annotations

import logging
import time

from sqlalchemy.orm import Session

from app.advice.candidates import DEFAULT_PHASE, Diagnosis, find_candidates, track_speed
from app.advice.changes import build_change
from app.advice.keywords import keyword_diagnosis
from app.advice.context import CONDITION_KEYS, current_changes, excerpts, history
from app.advice.prompt import diagnose_messages, diagnose_schema, select_messages, select_schema
from app.catalog import get_catalog
from app.config import Settings
from app.knowledge.effects import Effect, manuals
from app.llm import LLMClient, LLMError

log = logging.getLogger("simracing.advice")

TEXT = {
    "ru": {
        "question": "Уточните, что делает машина и где в повороте: недостаточная или избыточная, на входе, в середине или на выходе?",
        "unknown": "Для такого сочетания в руководствах iRacing нет подходящей правки — советовать наугад не будем.",
        "rules_summary": "Модель сейчас недоступна, поэтому совет собран по таблице правок из руководств iRacing.",
        "check": "Сделайте одну правку, проедьте 3–5 кругов и сравните поведение и время круга.",
    },
    "en": {
        "question": "Tell us what the car does and where: understeer or oversteer, on entry, mid-corner or on exit?",
        "unknown": "The iRacing manuals have no matching change for this combination, so we will not guess.",
        "rules_summary": "The model is unavailable right now, so this advice comes from the change table built from the iRacing manuals.",
        "check": "Make one change, run 3-5 laps and compare the behaviour and lap time.",
    },
}


def diagnose(llm: LLMClient | None, settings: Settings, req: dict, track: dict) -> tuple[Diagnosis | None, int]:
    symptom, phase, when, speed, tokens = req.get("symptom"), req.get("phase"), req.get("when") or "any", req.get("speed") or "any", 0
    if symptom in DEFAULT_PHASE and not phase:
        phase = DEFAULT_PHASE[symptom]  # блокировка — на торможении, пробуксовка — на выходе
    if (not symptom or not phase) and llm and req.get("text"):
        r = None
        for model in (settings.model_main, settings.model_fast):
            try:
                r = llm.complete_json(model, diagnose_messages(req["text"]), diagnose_schema(), "diagnosis")
                break
            except LLMError as e:
                log.warning("диагноз: %s не ответила: %s", model, e)
        if r is not None:
            tokens = r.tokens
            symptom = symptom or (r.data["symptom"] if r.data["symptom"] != "unclear" else None)
            phase = phase or (r.data["phase"] if r.data["phase"] != "unclear" else None)
            when = when if when != "any" else r.data["when"]
            speed = speed if speed != "any" else (r.data["speed"] if r.data["speed"] in ("slow", "fast") else "any")
    if (not symptom or not phase) and req.get("text"):
        # Модели нет или она не поняла — пробуем по словам пилота
        kw_symptom, kw_phase, kw_when = keyword_diagnosis(req["text"])
        symptom, phase = symptom or kw_symptom, phase or kw_phase
        when = when if when != "any" else kw_when
    if symptom and not phase:
        phase = DEFAULT_PHASE.get(symptom)
    if not symptom or not phase:
        return None, tokens
    return Diagnosis(symptom, phase, when, speed if speed != "any" else track_speed(track)), tokens


def _source(e: Effect) -> dict:
    m = manuals()[e.source["manual"]]
    return {"manual": m["id"], "title": m["title"], "url": m["url"], "quote": e.source["quote"]}


def _changes(picks: list[tuple[Effect, int, str, str]], params: dict, setup: dict, lang: str) -> list[dict]:
    out, used = [], set()
    for e, steps, why, watch in picks:
        if e.param in used:
            continue
        ch = build_change(e, params[e.param], setup, max(1, min(3, steps)), lang)
        if ch is None:
            continue
        used.add(e.param)
        out.append({**ch, "why": why or e.effect[lang], "watch": watch or e.tradeoff[lang], "effect": e.effect[lang], "tradeoff": e.tradeoff[lang], "source": _source(e)})
        if len(out) == 3:
            break
    return out


def advise(db: Session, llm: LLMClient | None, settings: Settings, user_id: int | None, req: dict) -> dict:
    """req: car_id, track_id, text, symptom?, phase?, when?, speed?, conditions?, setup?, lang. Возвращает результат и служебные поля."""
    t0 = time.monotonic()
    lang = req.get("lang") if req.get("lang") in TEXT else "ru"
    catalog = get_catalog()
    car, track = catalog.cars[req["car_id"]], catalog.tracks[req["track_id"]]
    params = catalog.params(car["category"])
    setup = req.get("setup") or {}
    diag, tokens = diagnose(llm, settings, req, track)
    meta = {"mode": "rules", "model": None, "tokens": tokens}

    if diag is None:
        return {**meta, "status": "question", "question": TEXT[lang]["question"], "summary": "", "changes": [], "check": "", "diagnosis": None, "latency_ms": int((time.monotonic() - t0) * 1000)}

    past, worse = history(db, user_id, car["id"], track["id"])
    cands = find_candidates(catalog, car, track, diag, worse)
    diag_out = {"symptom": diag.symptom, "phase": diag.phase, "when": diag.when, "speed": diag.speed}
    if not cands:
        return {**meta, "status": "unknown", "question": "", "summary": TEXT[lang]["unknown"], "changes": [], "check": "", "diagnosis": diag_out, "latency_ms": int((time.monotonic() - t0) * 1000)}

    by_id = {e.id: e for e in cands}
    result = None
    if llm:
        context = {
            "car": f"{car['brand']} {car['model']}",
            "class": catalog.classes[car["category"]]["label"],
            "track": {"name": track["nameOriginal"], "kind": track["kind"], "length_km": track["lengthKm"], "character": track.get("meta")},
            "conditions": {k: v for k, v in (req.get("conditions") or {}).items() if k in CONDITION_KEYS},
            "already_changed_from_baseline": current_changes(params, setup),
            "driver_says": req.get("text", ""),
            "diagnosis": diag_out,
            "history": past,
        }
        try:
            msgs, schema, r = select_messages(context, cands, params, excerpts(db, car["id"], car["category"], cands), lang), select_schema(list(by_id)), None
            for model in (settings.model_main, settings.model_fast):
                try:
                    r = llm.complete_json(model, msgs, schema, "advice")
                    break
                except LLMError as e:
                    log.warning("совет: %s не ответила: %s", model, e)
            if r is None:
                raise LLMError("обе модели не ответили")
            meta.update(mode="ai", model=r.model, tokens=tokens + r.tokens)
            d = r.data
            if d["status"] == "question" and d["question"].strip():
                result = {"status": "question", "question": d["question"].strip(), "summary": d["summary"], "changes": [], "check": ""}
            else:
                picks = [(by_id[p["candidate"]], int(p["steps"]), p["why"], p["watch"]) for p in d["picks"] if p["candidate"] in by_id]
                changes = _changes(picks, params, setup, lang)
                if changes:
                    result = {"status": "advice", "question": "", "summary": d["summary"], "changes": changes, "check": d["check"] or TEXT[lang]["check"]}
        except (LLMError, KeyError, ValueError, TypeError) as e:
            log.warning("совет без модели: %s", e)
            meta.update(mode="rules", model=None)

    if result is None:
        meta.update(mode="rules", model=None)
        changes = _changes([(e, 1, "", "") for e in cands], params, setup, lang)[:2]
        if not changes:
            result = {"status": "unknown", "question": "", "summary": TEXT[lang]["unknown"], "changes": [], "check": ""}
        else:
            result = {"status": "advice", "question": "", "summary": TEXT[lang]["rules_summary"], "changes": changes, "check": TEXT[lang]["check"]}

    return {**meta, **result, "diagnosis": diag_out, "latency_ms": int((time.monotonic() - t0) * 1000)}
