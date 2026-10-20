from uuid import UUID

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.db.database import Base, get_db
from app.db.models import Parameter, Rule, Requests
from app.services.recommendation import RecommendationService


# ---------------------------
# Тестовая база данных
# ---------------------------

@pytest.fixture
def session_factory():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(bind=engine)

    yield SessionLocal

    Base.metadata.drop_all(bind=engine)
    engine.dispose()


# ---------------------------
# Тестовый HTTP-клиент
# ---------------------------

@pytest.fixture
def client(session_factory):

    def override_get_db():
        with session_factory() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(
            app,
            raise_server_exceptions=False
        ) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db, None)


# ---------------------------
# Тестовые данные
# ---------------------------

@pytest.fixture
def payload():
    return {
        "car": "NASCAR Cup Series Next Gen (Gen 7)",
        "track": "Daytona International Speedway",
        "symptom_type": "understeer",
        "corner_phase": "entry",
        "comment": "Машина плохо поворачивает на входе",
        "stint_moment": "from_start",
    }


@pytest.fixture
def seed_rule(session_factory):

    def create_rule(
        verification_status="verified",
        corner_phase="entry",
    ):
        with session_factory() as db:
            parameter = Parameter(
                name="front_brake_bias_pct",
                unit="%",
                description="Front brake bias",
                limits="0-100",
            )

            rule = Rule(
                rule_id="TEST-001",
                symptom_type="understeer",
                corner_phase=corner_phase,
                stint_moment=None,
                parameter=parameter,
                direction="decrease",
                change_description="Уменьшить тормозной баланс",
                expected_effect="Улучшение поворачиваемости",
                limitations="Тестовое ограничение",
                applicability={
                    "car": ["NASCAR Cup Series Next Gen (Gen 7)"],
                    "track": ["Daytona International Speedway"],
                },
                verification_status=verification_status,
                basis="TEST",
            )

            db.add(rule)
            db.commit()

    return create_rule


# ---------------------------
# Тесты API
# ---------------------------

def test_recommendations_match(client, payload, seed_rule):
    seed_rule()

    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "match"
    assert UUID(data["request_id"])
    assert len(data["recommendations"]) == 1

    recommendation = data["recommendations"][0]

    assert recommendation["rule_id"] == "TEST-001"
    assert recommendation["parameter"] == "front_brake_bias_pct"
    assert recommendation["direction"] == "decrease"


def test_recommendations_no_match(client, payload):
    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "no_match"
    assert UUID(data["request_id"])
    assert "message" in data


def test_recommendations_validation_error(client, payload):
    payload["comment"] = "ab"
    payload["symptom_type"] = "unknown"

    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 400

    data = response.json()

    assert data["status"] == "error"
    assert data["error"]["code"] == "validation_error"
    assert "comment" in data["error"]["fields"]
    assert "symptom_type" in data["error"]["fields"]


def test_recommendations_internal_error(
    client,
    payload,
    monkeypatch,
):
    def broken_service(*args, **kwargs):
        raise RuntimeError("Test internal error")

    monkeypatch.setattr(
        RecommendationService,
        "get_recommendations",
        staticmethod(broken_service),
    )

    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 500

    data = response.json()

    assert data["status"] == "error"
    assert data["error"]["code"] == "internal_error"
    assert "Test internal error" not in response.text


def test_request_saved_match(
    client,
    payload,
    seed_rule,
    session_factory,
):
    seed_rule()

    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 200

    request_id = UUID(response.json()["request_id"])

    with session_factory() as db:
        saved = db.get(Requests, request_id)

        assert saved is not None
        assert saved.status == "match"
        assert saved.rule_ids == ["TEST-001"]
        assert saved.comment == payload["comment"]


def test_request_saved_no_match(
    client,
    payload,
    session_factory,
):
    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 200

    request_id = UUID(response.json()["request_id"])

    with session_factory() as db:
        saved = db.get(Requests, request_id)

        assert saved is not None
        assert saved.status == "no_match"
        assert saved.rule_ids == []


def test_draft_rule_not_returned(
    client,
    payload,
    seed_rule,
):
    seed_rule(verification_status="draft_not_allowed")

    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "no_match"


def test_different_corner_phase(
    client,
    payload,
    seed_rule,
):
    seed_rule(corner_phase="exit")

    response = client.post(
        "/api/v1/recommendations",
        json=payload,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "no_match"


def test_cors_github_pages(client):
    response = client.options(
        "/api/v1/recommendations",
        headers={
            "Origin": "https://kom1sh.github.io",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert (
        response.headers["access-control-allow-origin"]
        == "https://kom1sh.github.io"
    )