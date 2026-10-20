"""Бэкенд «Сетапы для симрейсинга»: аккаунты, сетапы, каталог iRacing, ИИ-ассистент, совместимость с ALE-03."""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import Settings, get_settings
from app.db import make_engine, make_sessionmaker
from app.llm import GroqClient, LLMClient
from app.security import RateLimiter

log = logging.getLogger("simracing")


def error(status: int, code: str, message: str, fields: dict | None = None) -> JSONResponse:
    body: dict = {"status": "error", "error": {"code": code, "message": message}}
    if fields is not None:
        body["error"]["fields"] = fields
    return JSONResponse(status_code=status, content=body)


def create_app(settings: Settings | None = None, llm: LLMClient | None = None) -> FastAPI:
    settings = settings or get_settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    app = FastAPI(title="Simracing Setups API", version="2.0", docs_url="/api/docs", openapi_url="/api/openapi.json")
    app.state.settings = settings
    app.state.engine = make_engine(settings.database_url)
    app.state.sessionmaker = make_sessionmaker(app.state.engine)
    app.state.llm = llm if llm is not None else (GroqClient(settings) if settings.groq_api_key and settings.llm_enabled else None)
    app.state.auth_limiter = RateLimiter(limit=20, window_s=600)

    app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_methods=["GET", "POST"], allow_headers=["*"])

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        fields = {str(e["loc"][-1]): e["msg"] for e in exc.errors()}
        return error(400, "validation_error", "Проверьте заполнение полей", fields)

    @app.exception_handler(HTTPException)
    async def _http(_: Request, exc: HTTPException) -> JSONResponse:
        d = exc.detail if isinstance(exc.detail, dict) else {"code": "error", "message": str(exc.detail)}
        return error(exc.status_code, d.get("code", "error"), d.get("message", ""), d.get("fields"))

    @app.exception_handler(Exception)
    async def _internal(_: Request, exc: Exception) -> JSONResponse:
        log.exception("Internal server error", exc_info=exc)
        return error(500, "internal_error", "Внутренняя ошибка сервера")

    from app.routers import advice, auth, catalog, health, setups, v1

    for r in (health.router, v1.router, auth.router, catalog.router, setups.router, advice.router):
        app.include_router(r)
    return app


app = create_app()
