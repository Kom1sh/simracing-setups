from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import KnowledgeChunk

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/api/v2/status")
def status(request: Request, db: Session = Depends(get_db)) -> dict:
    """Что работает: ИИ (есть ли ключ) и сколько кусков руководств в базе знаний."""
    return {
        "status": "ok",
        "ai": request.app.state.llm is not None,
        "knowledge_chunks": db.scalar(select(func.count()).select_from(KnowledgeChunk)) or 0,
    }
