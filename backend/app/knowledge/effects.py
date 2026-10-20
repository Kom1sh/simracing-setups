"""Таблица эффектов: какая правка гаража лечит какой симптом. Каждая строка — с цитатой из руководства iRacing.

Модель выбирает только из этих строк, поэтому не может посоветовать регулировку не туда.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

DIR = Path(__file__).resolve().parent.parent / "data" / "effects"

SYMPTOMS = ("understeer", "oversteer", "lockup", "wheelspin")
PHASES = ("entry", "mid", "exit")


@dataclass(frozen=True)
class Effect:
    id: str
    classes: tuple[str, ...]
    param: str
    slot: str
    direction: str
    priority: int
    fixes: tuple[tuple[str, str], ...]
    speed: str  # any | fast | slow
    when: str  # any | after_laps
    cars: tuple[str, ...]  # пусто — все машины класса
    effect: dict
    tradeoff: dict
    source: dict

    def treats(self, symptom: str, phase: str | None) -> bool:
        return any(s == symptom and (phase is None or p == phase) for s, p in self.fixes)


def _load(path: Path) -> list[Effect]:
    default_classes = ("nascar",) if path.stem.startswith("nascar") else ()
    out = []
    for e in json.loads(path.read_text(encoding="utf-8")):
        out.append(
            Effect(
                id=e["id"],
                classes=tuple(e.get("classes", default_classes)),
                param=e["param"],
                slot=e["slot"],
                direction=e["direction"],
                priority=int(e["priority"]),
                fixes=tuple((s, p) for s, p in e["fixes"]),
                speed=e.get("speed", "any"),
                when=e.get("when", "any"),
                cars=tuple(e.get("cars", ())),
                effect=e["effect"],
                tradeoff=e["tradeoff"],
                source=e["source"],
            )
        )
    return out


@lru_cache
def all_effects() -> tuple[Effect, ...]:
    effects: list[Effect] = []
    for f in sorted(DIR.glob("*.json")):
        effects.extend(_load(f))
    return tuple(effects)


@lru_cache
def manuals() -> dict[str, dict]:
    raw = json.loads((DIR.parent / "manuals.json").read_text(encoding="utf-8"))
    return {m["id"]: m for m in raw["manuals"]}
