"""Правка из строки эффекта: шаги → новое значение в пределах гаража, текст «+0,2 %» или «P3 → P2»."""

from __future__ import annotations

from app.catalog import SLOT_NAMES, SLOTS
from app.knowledge.effects import Effect


def _fmt(value: float, decimals: int, lang: str) -> str:
    s = f"{abs(value):.{decimals}f}"
    if lang == "ru":
        s = s.replace(".", ",")
    return ("+" if value > 0 else "−" if value < 0 else "") + s


def _current(param: dict, setup: dict) -> list | str | float:
    v = setup.get(param["id"])
    kind = param["kind"]
    if kind == "choice":
        return v if isinstance(v, str) and any(o["value"] == v for o in param["options"]) else param["base"]
    if kind == "scalar":
        return float(v) if isinstance(v, (int, float)) else float(param["range"]["base"])
    n = 2 if kind == "axle" else 4
    if isinstance(v, list) and len(v) == n and all(isinstance(x, (int, float)) for x in v):
        return [float(x) for x in v]
    return [float(param["front"]["base"])] * (n // 2) + [float(param["rear"]["base"])] * (n // 2)


def _range(param: dict, i: int) -> dict:
    if param["kind"] == "scalar":
        return param["range"]
    if param["kind"] == "axle":
        return param["front"] if i == 0 else param["rear"]
    return param["front"] if i < 2 else param["rear"]


def build_change(effect: Effect, param: dict, setup: dict, steps: int, lang: str) -> dict | None:
    """None, если правку некуда делать: значение уже на краю диапазона."""
    sign = 1 if effect.direction == "increase" else -1
    cur = _current(param, setup)
    base = {"effect_id": effect.id, "param": param["id"], "label": param["label"], "group": param["group"], "slot": effect.slot,
            "slot_label": SLOT_NAMES[lang].get(effect.slot, ""), "direction": effect.direction, "unit": param.get("unit", "")}

    if param["kind"] == "choice":
        values = [o["value"] for o in param["options"]]
        labels = {o["value"]: o["label"] for o in param["options"]}
        i = values.index(cur)
        j = max(0, min(len(values) - 1, i + sign * steps))
        if j == i:
            return None
        return {**base, "steps": abs(j - i), "from": cur, "to": values[j], "text": f"{labels[cur]} → {labels[values[j]]}"}

    step, dec = float(param["step"]), int(param["decimals"])
    slots = SLOTS[param["kind"]].get(effect.slot) or ([] if param["kind"] == "scalar" else SLOTS[param["kind"]]["all"])
    idx = [None] if param["kind"] == "scalar" else slots
    for n in range(steps, 0, -1):
        delta = round(sign * n * step, dec)
        ok = True
        for i in idx:
            v = cur if i is None else cur[i]  # type: ignore[index]
            r = _range(param, 0 if i is None else i)
            if not (r["min"] - 1e-9 <= v + delta <= r["max"] + 1e-9):
                ok = False
        if ok:
            unit = f" {param['unit']}" if param.get("unit") else ""
            indexes = [] if param["kind"] == "scalar" else slots
            return {**base, "steps": n, "delta": delta, "indexes": indexes, "text": f"{_fmt(delta, dec, lang)}{unit}"}
    return None
