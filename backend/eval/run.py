"""Золотой набор против настоящей модели: python -m eval.run [--pause 20] [--ids g01,g02]

Каждый случай — только текст пилота (без кнопок): проверяем диагноз и что хотя бы одна правка из допустимых.
Отчёт — eval/last-report.json. Нужен GROQ_API_KEY.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from app.advice.engine import advise
from app.config import get_settings
from app.db import make_engine, make_sessionmaker
from app.llm import GroqClient

HERE = Path(__file__).parent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pause", type=float, default=20.0)
    ap.add_argument("--ids", default="")
    args = ap.parse_args()
    settings = get_settings()
    if not settings.groq_api_key:
        raise SystemExit("нужен GROQ_API_KEY")
    llm = GroqClient(settings)
    db = make_sessionmaker(make_engine(settings.database_url))()
    cases = json.loads((HERE / "golden.json").read_text(encoding="utf-8"))
    if args.ids:
        cases = [c for c in cases if c["id"] in args.ids.split(",")]
    rows, passed, diag_ok = [], 0, 0
    for i, c in enumerate(cases):
        if i:
            time.sleep(args.pause)
        r = advise(db, llm, settings, None, {"car_id": c["car_id"], "track_id": c["track_id"], "text": c["text"], "lang": c.get("lang", "ru")})
        symptoms = c["symptom"] if isinstance(c["symptom"], list) else [c["symptom"]]
        d = r.get("diagnosis") or {}
        good_diag = d.get("symptom") in symptoms and d.get("phase") == c["phase"]
        picked = [ch["effect_id"] for ch in r.get("changes", [])]
        ok = r["status"] == "advice" and any(p in c["ok"] for p in picked)
        passed += ok
        diag_ok += good_diag
        rows.append({"id": c["id"], "ok": ok, "diagnosis_ok": good_diag, "mode": r["mode"], "status": r["status"], "diagnosis": d, "picked": picked,
                     "texts": [ch["text"] + " " + ch["label"] for ch in r.get("changes", [])], "summary": r.get("summary", ""), "tokens": r["tokens"], "ms": r["latency_ms"]})
        print(f"{c['id']}: {'OK ' if ok else 'BAD'} диагноз {'ok' if good_diag else 'нет'} {d.get('symptom')}/{d.get('phase')} режим {r['mode']} → {', '.join(picked) or r['status']}", flush=True)
    report = {"total": len(cases), "passed": passed, "diagnosis_ok": diag_ok, "cases": rows}
    (HERE / "last-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nитог: {passed}/{len(cases)} советов в допустимых, диагноз верен в {diag_ok}/{len(cases)}")


if __name__ == "__main__":
    main()
