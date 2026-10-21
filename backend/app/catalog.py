"""Каталог iRacing: классы, машины, трассы, гаражи. Источник — app/data/catalog.json (scripts/export-catalog.mjs)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

DATA = Path(__file__).parent / "data"

# Слоты регулировки: у оси — перед/зад, у колёс — ПЛ ПП ЗЛ ЗП. «all» — все сразу.
SLOTS = {
    "scalar": {"all": []},
    "choice": {"all": []},
    "axle": {"all": [0, 1], "front": [0], "rear": [1]},
    "corners": {"all": [0, 1, 2, 3], "front": [0, 1], "rear": [2, 3], "lf": [0], "rf": [1], "lr": [2], "rr": [3], "left": [0, 2], "right": [1, 3]},
}

SLOT_NAMES = {
    "ru": {"all": "", "front": "спереди", "rear": "сзади", "lf": "левое переднее", "rf": "правое переднее", "lr": "левое заднее", "rr": "правое заднее", "left": "слева", "right": "справа"},
    "en": {"all": "", "front": "front", "rear": "rear", "lf": "left front", "rf": "right front", "lr": "left rear", "rr": "right rear", "left": "left side", "right": "right side"},
}


@dataclass(frozen=True)
class Catalog:
    classes: dict[str, dict]
    cars: dict[str, dict]
    tracks: dict[str, dict]
    templates: dict[str, list[dict]]
    garages: dict[str, list[dict]]

    @staticmethod
    def _by_id(groups: list[dict]) -> dict[str, dict]:
        out: dict[str, dict] = {}
        for group in groups:
            for p in group["params"]:
                out[p["id"]] = {**p, "group": group["id"], "group_title": group["title"]}
        return out

    def params(self, class_id: str) -> dict[str, dict]:
        """Регулировки шаблона класса по id (с названием группы)."""
        return self._by_id(self.templates[class_id])

    def car_params(self, car_id: str) -> dict[str, dict]:
        """Регулировки гаража конкретной машины: шаблон класса с отличиями из её руководства iRacing."""
        return self._by_id(self.garages[car_id])

    def car_class(self, car_id: str) -> str:
        return self.cars[car_id]["category"]

    def track_fits(self, track_id: str, class_id: str) -> bool:
        return self.tracks[track_id]["kind"] in self.classes[class_id]["tracks"]


@lru_cache
def get_catalog() -> Catalog:
    raw = json.loads((DATA / "catalog.json").read_text(encoding="utf-8"))
    return Catalog(
        classes={c["id"]: c for c in raw["classes"]},
        cars={c["id"]: c for c in raw["cars"]},
        tracks={t["id"]: t for t in raw["tracks"]},
        templates=raw["templates"],
        garages=raw["garages"],
    )


def param_available(param: dict, car: dict, rain_possible: bool) -> bool:
    req = param.get("requires")
    if req == "abs":
        return car.get("abs") is not False
    if req == "tc":
        return car.get("tc") is not False
    if req == "rain":
        return rain_possible
    return True
