"""Миграции: адрес базы — из настроек приложения (SIMRACING_DATA_DIR / SIMRACING_DATABASE_URL)."""

from alembic import context

from app import models  # noqa: F401 — регистрирует таблицы
from app.config import get_settings
from app.db import Base, make_engine

target_metadata = Base.metadata


def run_migrations_online() -> None:
    settings = get_settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    engine = make_engine(context.config.get_main_option("sqlalchemy.url") or settings.database_url)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, render_as_batch=True)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
