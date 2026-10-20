"""Сборка базы знаний: скачать руководства iRacing, нарезать, сложить в knowledge_chunks и FTS5.

    python -m app.knowledge.build            # на сервере после миграций
Нужен pdftotext (poppler-utils). PDF кэшируются в <data_dir>/manuals.
"""

from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

from sqlalchemy import delete, text

from app.catalog import get_catalog
from app.config import get_settings
from app.db import make_engine, make_sessionmaker
from app.knowledge.chunks import chunk_manual
from app.knowledge.effects import manuals
from app.knowledge.pdftext import pdf_to_layout_text, reading_order
from app.models import KnowledgeChunk

UA = "simracing-setups knowledge builder"


def download(url: str, dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 10_000:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r:
        dest.write_bytes(r.read())
    return dest


def rebuild_fts(db) -> None:  # noqa: ANN001
    db.execute(text("DELETE FROM knowledge_fts"))
    db.execute(text("INSERT INTO knowledge_fts(rowid, heading, text) SELECT id, heading, text FROM knowledge_chunks"))


def build(only: set[str] | None = None) -> dict[str, int]:
    settings = get_settings()
    catalog = get_catalog()
    session = make_sessionmaker(make_engine(settings.database_url))()
    counts: dict[str, int] = {}
    try:
        for m in manuals().values():
            if only and m["id"] not in only:
                continue
            pdf = download(m["url"], settings.data_dir / "manuals" / f"{m['id']}.pdf")
            available = set(catalog.params(m["class"]))
            chunks = chunk_manual(reading_order(pdf_to_layout_text(pdf)), available)
            session.execute(delete(KnowledgeChunk).where(KnowledgeChunk.manual_id == m["id"]))
            session.add_all(KnowledgeChunk(manual_id=m["id"], class_id=m["class"], **c) for c in chunks)
            counts[m["id"]] = len(chunks)
            session.flush()
        rebuild_fts(session)
        session.commit()
    finally:
        session.close()
    return counts


if __name__ == "__main__":
    result = build(set(sys.argv[1:]) or None)
    for k, v in result.items():
        print(f"{k}: {v}")
    print(f"всего кусков: {sum(result.values())}")
