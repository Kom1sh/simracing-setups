"""Запросы к модели и строгие схемы ответа. Модель видит только кандидатов из таблицы эффектов и куски руководств."""

from __future__ import annotations

import json

from app.knowledge.effects import Effect

LANG = {"ru": "по-русски", "en": "in English"}


def diagnose_schema() -> dict:
    return {
        "type": "object",
        "properties": {
            "symptom": {"type": "string", "enum": ["understeer", "oversteer", "lockup", "wheelspin", "unclear"]},
            "phase": {"type": "string", "enum": ["entry", "mid", "exit", "unclear"]},
            "when": {"type": "string", "enum": ["from_start", "after_laps", "any"]},
            "speed": {"type": "string", "enum": ["slow", "medium", "fast", "any"]},
        },
        "required": ["symptom", "phase", "when", "speed"],
        "additionalProperties": False,
    }


def diagnose_messages(text: str) -> list[dict]:
    return [
        {
            "role": "system",
            "content": (
                "You classify a sim racer's complaint about car handling in iRacing. "
                "understeer = the front loses grip, the car runs wide, will not turn. oversteer = the rear steps out, loose, spins, slides. "
                "lockup = wheels lock under braking. wheelspin = wheels spin under power. "
                "Russian driver slang: выносит, толкает, не поворачивает, тупит, плывёт передок, уходит к стене = understeer; "
                "заносит, срывает зад, крутит, разворачивает, лёгкий зад, гуляет зад, подруливает задом, приходится ловить = oversteer; "
                "буксуют = wheelspin; блокируются колёса = lockup. на газу / на выходе = exit; на торможении / на входе / при сбросе газа = entry; в середине / на апексе = mid. "
                "entry = braking and turn-in, mid = apex and steady throttle, exit = getting on the power. "
                "when: after_laps if it gets worse over a run or with worn tyres. speed: fast or slow corners if stated. "
                "Use unclear when the text does not say it."
            ),
        },
        {"role": "user", "content": text},
    ]


def select_schema(candidate_ids: list[str]) -> dict:
    pick = {
        "type": "object",
        "properties": {
            "candidate": {"type": "string", "enum": candidate_ids},
            "steps": {"type": "string", "enum": ["1", "2", "3"]},
            "why": {"type": "string"},
            "watch": {"type": "string"},
        },
        "required": ["candidate", "steps", "why", "watch"],
        "additionalProperties": False,
    }
    return {
        "type": "object",
        "properties": {
            "status": {"type": "string", "enum": ["advice", "question"]},
            "question": {"type": "string"},
            "summary": {"type": "string"},
            "picks": {"type": "array", "items": pick},
            "check": {"type": "string"},
        },
        "required": ["status", "question", "summary", "picks", "check"],
        "additionalProperties": False,
    }


def select_messages(context: dict, candidates: list[Effect], params: dict, excerpts: list[dict], lang: str) -> list[dict]:
    cands = [
        {
            "id": e.id,
            "adjustment": params[e.param]["label"],
            "where": e.slot,
            "direction": e.direction,
            "priority": e.priority,
            "effect": e.effect[lang],
            "tradeoff": e.tradeoff[lang],
            "manual_quote": e.source["quote"],
        }
        for e in candidates
    ]
    system = (
        "You are a race engineer for iRacing setups. The driver describes a handling problem. "
        "Choose 1 to 3 changes ONLY from the candidates list (by id). Every candidate is backed by the official iRacing manual. "
        "Prefer one or two changes at a time and lower priority numbers unless the context says otherwise. "
        "steps: 1 for a mild problem, 2-3 only if the driver says it is strong. Never repeat a change that the history marks as worse. "
        "If the driver's words contradict the diagnosis or the problem is unclear, set status=question and ask one short question; picks may be empty then. "
        f"Write summary, why, watch, check and question {LANG[lang]}, short and concrete, mention the car and track when useful. "
        "summary: one or two sentences on what is happening. why: why this change helps here. watch: what may get worse. check: what to verify after 3-5 laps."
    )
    user = json.dumps({"context": context, "candidates": cands, "manual_excerpts": excerpts}, ensure_ascii=False)
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]
