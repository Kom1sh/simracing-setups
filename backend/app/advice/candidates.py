"""Кандидаты в правки: строки таблицы эффектов для класса, симптома и фазы, с учётом машины и прошлых провалов."""

from __future__ import annotations

from dataclasses import dataclass

from app.catalog import Catalog, param_available
from app.knowledge.effects import Effect, all_effects

DEFAULT_PHASE = {"lockup": "entry", "wheelspin": "exit"}


@dataclass(frozen=True)
class Diagnosis:
    symptom: str  # understeer | oversteer | lockup | wheelspin
    phase: str  # entry | mid | exit
    when: str  # from_start | after_laps | any
    speed: str  # slow | fast | any


def track_speed(track: dict) -> str:
    """Скорость поворотов по характеру трассы: суперспидвей — быстро, короткий овал — медленно."""
    meta = track.get("meta") or {}
    if meta.get("downforce") == "low":
        return "fast"
    if track.get("kind") == "oval" and meta.get("downforce") == "high":
        return "slow"
    return "any"


def find_candidates(catalog: Catalog, car: dict, track: dict, d: Diagnosis, worse: set[str], limit: int = 7) -> list[Effect]:
    class_id = car["category"]
    params = catalog.params(class_id)
    rain_possible = bool(car.get("rain")) and bool(track.get("rain"))
    found = [
        e
        for e in all_effects()
        if class_id in e.classes
        and (not e.cars or car["id"] in e.cars)
        and e.param in params
        and param_available(params[e.param], car, rain_possible)
        and e.treats(d.symptom, d.phase)
        and e.id not in worse
    ]

    def score(e: Effect) -> float:
        s = e.priority * 10.0
        if e.when == "after_laps":
            s += -8 if d.when == "after_laps" else 6
        if e.speed != "any":
            if d.speed == "any":
                s += 2
            elif e.speed != d.speed:
                s += 8
        return s

    return sorted(found, key=score)[:limit]
