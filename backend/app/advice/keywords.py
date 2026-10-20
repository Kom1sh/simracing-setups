"""Запасной диагноз по словам пилота — когда модель недоступна. Русский сленг и английский."""

from __future__ import annotations

import re

SYMPTOMS = [
    ("lockup", r"блокир|блокну|lock ?up|locking|locks"),
    ("wheelspin", r"буксу|пробукс|wheel ?spin"),
    ("oversteer", r"занос|заносит|сры[вт]|срывает|крутит|разворач|л[её]гк\w* зад|гуляет|подрулива|ловить|oversteer|loose|steps? out|snap|spins?\b|rear (slides|goes)"),
    ("understeer", r"(не|перестаёт|перестает|плохо) поворач|не доворачива|недоворачива|плохо заходит|кручу руль|не едет|выносит|толкает|тупит|плыв[её]т|к стене|недостаточн|understeer|push|won'?t turn|runs? wide|washes? out"),
]
PHASES = [
    ("entry", r"сбрас\w* газ|сброс\w* газ|(?<!вы)вход|тормож|entry|braking|turn-?in|lift"),
    ("exit", r"выход|на газу|газ\b|даю газ|разгон|exit|throttle|on power|accelerat"),
    ("mid", r"середин|апекс|в повороте|связк|на скорости|mid|apex"),
]
AFTER = r"после .*круг|к \w+ кругу|к концу|через \d+ круг|износ|after .*laps|end of (the )?(run|stint)|worn"


def keyword_diagnosis(text: str) -> tuple[str | None, str | None, str]:
    t = text.lower()
    symptom = next((s for s, rx in SYMPTOMS if re.search(rx, t)), None)
    phase = next((p for p, rx in PHASES if re.search(rx, t)), None)
    when = "after_laps" if re.search(AFTER, t) else "any"
    return symptom, phase, when
