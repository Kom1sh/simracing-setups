import os
import tempfile
from pathlib import Path

os.environ.setdefault("SIMRACING_DATA_DIR", tempfile.mkdtemp(prefix="simracing-test-"))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.config import Settings  # noqa: E402
from app.db import Base  # noqa: E402
from app.llm import LLMError, LLMResult  # noqa: E402
from app.main import create_app  # noqa: E402


class FakeLLM:
    """Модель-заглушка: по умолчанию выбирает первого кандидата; можно задать свой ответ или ошибку."""

    def __init__(self) -> None:
        self.calls: list[dict] = []
        self.diagnosis: dict = {"symptom": "oversteer", "phase": "exit", "when": "any", "speed": "any"}
        self.select = None  # функция(schema) -> dict
        self.fail = False

    def complete_json(self, model, messages, schema, name):  # noqa: ANN001
        self.calls.append({"model": model, "name": name, "messages": messages, "schema": schema})
        if self.fail:
            raise LLMError("недоступна")
        if name == "diagnosis":
            return LLMResult(dict(self.diagnosis), model, 100)
        ids = schema["properties"]["picks"]["items"]["properties"]["candidate"]["enum"]
        data = self.select(ids) if self.select else {
            "status": "advice", "question": "", "summary": "Тест", "check": "Проверьте 3–5 кругов",
            "picks": [{"candidate": ids[0], "steps": "1", "why": "Потому что", "watch": "Следите"}],
        }
        return LLMResult(data, model, 1000)


def make_settings(tmp: Path) -> Settings:
    return Settings(data_dir=tmp, database_url=f"sqlite:///{tmp / 'test.db'}", groq_api_key=None, cookie_secure=False, advice_daily_limit=5)


@pytest.fixture
def llm() -> FakeLLM:
    return FakeLLM()


@pytest.fixture
def app(tmp_path, llm):  # noqa: ANN001
    application = create_app(make_settings(tmp_path), llm=llm)
    Base.metadata.create_all(application.state.engine)
    with application.state.engine.begin() as conn:
        conn.execute(text("CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(heading, text)"))
    return application


@pytest.fixture
def client(app):  # noqa: ANN001
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def user(client):  # noqa: ANN001
    r = client.post("/api/v2/auth/register", json={"email": "pilot@example.com", "name": "Pilot", "password": "secret-pass-1"})
    assert r.status_code == 201, r.text
    return r.json()["user"]
