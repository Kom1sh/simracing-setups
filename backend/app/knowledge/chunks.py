"""Нарезка текста руководства iRacing на разделы-регулировки с метками параметров гаража."""

from __future__ import annotations

import re

# pdftotext рвёт разрядку заголовков: «SET TING», «BL ADES»
FIXES = {"SET TING": "SETTING", "BL ADES": "BLADES", "T YPE": "TYPE", "L AST": "LAST", "THROT TLE": "THROTTLE", "AT TACH": "ATTACH", "COLL AR": "COLLAR", "DISPL AY": "DISPLAY", "ST ACK": "STACK"}

HEADING = re.compile(r"^[A-Z][A-Z0-9 /&().'’-]{2,40}$")
SKIP = re.compile(r"USER MANUAL|TABLE OF CONTENTS|^\d+$|DASH|PAGE \d")

# Порядок важен: сначала длинные и уточняющие ключи
KEYS: list[tuple[str, str]] = [
    ("BRAKE PRESSURE BIAS", "brakeBias"), ("FRONT BRAKE BIAS", "brakeBias"), ("BRAKE BIAS", "brakeBias"),
    ("BRAKE PAD", "brakePads"), ("ABS", "abs"), ("DSC", "abs"), ("TC", "tc"), ("TRACTION", "tc"),
    ("THROTTLE", "throttleShape"), ("COLD PRESSURE", "pressure"), ("STARTING PRESSURE", "pressure"), ("COLD AIR PRESSURE", "pressure"),
    ("ARB ARM", "arbArm"), ("ARB PRELOAD", "arbPreload"), ("DIAMETER", "arbDiameter"), ("ARB", "arb"),
    ("TOE", "toe"), ("CAMBER", "camber"), ("CASTER", "caster"), ("SPRING RATE", "springRate"),
    ("RIDE HEIGHT", "rideHeight"), ("SPRING PERCH OFFSET", "rideHeight"), ("SHOCK COLLAR OFFSET", "rideHeight"),
    ("CROSS WEIGHT", "crossWeight"), ("NOSE WEIGHT", "noseWeight"), ("DIFF PRELOAD", "diffPreload"), ("PRELOAD", "diffPreload"),
    ("FRICTION FACES", "frictionFaces"), ("DIFF CLUTCHES", "frictionFaces"), ("WING", "wing"), ("FUEL", "fuel"),
    ("HS COMP SLOPE", "hsCompSlope"), ("HS REBOUND SLOPE", "hsReboundSlope"),
    ("LS COMPRESSION", "lsComp"), ("LS COMP", "lsComp"), ("LOW SPEED COMPRESSION", "lsComp"),
    ("HS COMPRESSION", "hsComp"), ("HS COMP", "hsComp"), ("HIGH SPEED COMPRESSION", "hsComp"),
    ("LS REBOUND", "lsRebound"), ("LOW SPEED REBOUND", "lsRebound"), ("HS REBOUND", "hsRebound"), ("HIGH SPEED REBOUND", "hsRebound"),
    ("BUMP STIFFNESS", "bump"), ("REBOUND STIFFNESS", "rebound"),
]


def _params_for(heading: str, side: str | None, available: set[str]) -> list[str]:
    for key, tag in KEYS:
        if re.search(rf"\b{re.escape(key)}\b", heading):
            if tag in {"arb", "arbArm", "arbPreload", "arbDiameter"}:
                end = {"arb": "", "arbArm": "Arm", "arbPreload": "Preload", "arbDiameter": "Diameter"}[tag]
                sides = ["Front", "Rear"] if side is None else [side]
                ids = [f"arb{s}{end}" for s in sides]
            elif tag == "caster":
                ids = ["casterLf", "casterRf"]
            else:
                ids = [tag]
            return [i for i in ids if i in available]
    return []


def chunk_manual(text: str, available: set[str], max_len: int = 1400) -> list[dict]:
    """Разделы «ADVANCED SETUP OPTIONS» и дальше: заголовок → текст, метки — регулировки класса."""
    for bad, good in FIXES.items():
        text = text.replace(bad, good)
    start = text.find("ADVANCED SETUP OPTIONS", text.find("ADVANCED SETUP OPTIONS") + 1)
    body = text[start:] if start > 0 else text
    chunks: list[dict] = []
    side: str | None = None
    heading, buf = None, []

    def flush() -> None:
        if heading and buf:
            body_text = re.sub(r"\s+", " ", " ".join(buf)).strip()
            if len(body_text) > 60:
                chunks.append({"heading": heading.title(), "text": body_text[:max_len], "params": _params_for(heading, side, available)})

    for raw in body.splitlines():
        line = raw.strip()
        if not line or line == "\f" or SKIP.search(line):
            continue
        if HEADING.match(line) and len(line.split()) <= 6:
            if line in {"FRONT", "FRONT CORNERS", "FRONT ARB"}:
                side = "Front"
            elif line in {"REAR", "REAR CORNERS", "REAR ARB", "REAR END"}:
                side = "Rear"
            flush()
            heading, buf = line, []
        elif heading:
            buf.append(line)
    flush()
    return chunks
