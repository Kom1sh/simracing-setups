"""Groq (OpenAI-совместимый API) со строгой JSON-схемой. Бесплатный тариф: 1000 запросов/день, 8000 токенов/мин."""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Protocol

import httpx

from app.config import Settings


class LLMError(Exception):
    pass


@dataclass
class LLMResult:
    data: dict
    model: str
    tokens: int


class LLMClient(Protocol):
    def complete_json(self, model: str, messages: list[dict], schema: dict, name: str) -> LLMResult: ...


class GroqClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.http = httpx.Client(
            base_url=settings.groq_base_url,
            timeout=settings.llm_timeout_s,
            headers={"Authorization": f"Bearer {settings.groq_api_key}", "User-Agent": "simracing-setups/2.0"},
        )

    def complete_json(self, model: str, messages: list[dict], schema: dict, name: str) -> LLMResult:
        body = {
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "response_format": {"type": "json_schema", "json_schema": {"name": name, "strict": True, "schema": schema}},
        }
        for attempt in range(2):
            try:
                r = self.http.post("/chat/completions", json=body)
            except httpx.HTTPError as e:
                raise LLMError(f"нет связи с Groq: {e}") from e
            if r.status_code == 429 and attempt == 0:
                wait = float(r.headers.get("retry-after", "5") or 5)
                if wait <= 12:
                    time.sleep(wait)
                    continue
            if r.status_code != 200:
                raise LLMError(f"Groq {r.status_code}: {r.text[:200]}")
            data = r.json()
            try:
                content = json.loads(data["choices"][0]["message"]["content"])
            except (KeyError, IndexError, json.JSONDecodeError) as e:
                raise LLMError("Groq вернул не JSON") from e
            return LLMResult(content, data.get("model", model), int(data.get("usage", {}).get("total_tokens", 0)))
        raise LLMError("Groq: лимит запросов")
