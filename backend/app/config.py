"""Настройки из окружения. На сервере — /etc/simracing-api.env (ключ Groq) и Environment= в службе."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path


def _bool(name: str, default: bool) -> bool:
    v = os.environ.get(name)
    return default if v is None else v.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    database_url: str
    groq_api_key: str | None
    groq_base_url: str = "https://api.groq.com/openai/v1"
    # Строгая JSON-схема у Groq официально работает на gpt-oss-120b и gpt-oss-20b
    model_main: str = "openai/gpt-oss-120b"
    model_fast: str = "openai/gpt-oss-20b"
    llm_enabled: bool = True
    llm_timeout_s: float = 40.0
    cookie_secure: bool = True
    session_days: int = 30
    advice_daily_limit: int = 40
    admin_token: str | None = None
    cors_origins: list[str] = field(default_factory=list)


@lru_cache
def get_settings() -> Settings:
    data_dir = Path(os.environ.get("SIMRACING_DATA_DIR", "./data")).resolve()
    return Settings(
        data_dir=data_dir,
        database_url=os.environ.get("SIMRACING_DATABASE_URL", f"sqlite:///{data_dir / 'simracing.db'}"),
        groq_api_key=os.environ.get("GROQ_API_KEY") or None,
        model_main=os.environ.get("SIMRACING_MODEL_MAIN", "openai/gpt-oss-120b"),
        model_fast=os.environ.get("SIMRACING_MODEL_FAST", "openai/gpt-oss-20b"),
        llm_enabled=_bool("SIMRACING_LLM", True),
        cookie_secure=_bool("SIMRACING_COOKIE_SECURE", True),
        advice_daily_limit=int(os.environ.get("SIMRACING_ADVICE_DAILY_LIMIT", "40")),
        admin_token=os.environ.get("SIMRACING_ADMIN_TOKEN") or None,
        cors_origins=[o for o in os.environ.get("SIMRACING_CORS", "https://kom1sh.github.io,http://localhost:5173,http://localhost:4173").split(",") if o],
    )
