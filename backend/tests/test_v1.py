"""Контракт ALE-03 (тесты Родиона, перенесены) плюс «Не важно»."""

import pytest

from app.models import Parameter, Rule

PAYLOAD = {"car": "NASCAR Cup Series Next Gen (Gen 7)", "track": "Daytona International Speedway", "symptom_type": "understeer", "corner_phase": "entry", "comment": "Машина плохо поворачивает на входе", "stint_moment": "from_start"}


@pytest.fixture
def rule(app):
    db = app.state.sessionmaker()
    db.add(Rule(rule_id="R-1", symptom_type="understeer", corner_phase="entry", stint_moment=None, parameter=Parameter(name="front_brake_bias_pct", unit="%", description="", limits=""), direction="decrease",
                change_description="Сдвиньте баланс назад", expected_effect="Легче вход", limitations="Стабильность", applicability={"car": [PAYLOAD["car"]], "track": [PAYLOAD["track"]]}, verification_status="verified", basis="Руководство"))
    db.commit()


def test_match(client, rule):
    d = client.post("/api/v1/recommendations", json=PAYLOAD).json()
    assert d["status"] == "match" and d["recommendations"][0]["rule_id"] == "R-1" and d["request_id"]


@pytest.mark.parametrize("stint", [None, "missing"])
def test_any_time(client, rule, stint):
    body = dict(PAYLOAD)
    if stint is None:
        body["stint_moment"] = None
    else:
        del body["stint_moment"]
    r = client.post("/api/v1/recommendations", json=body)
    assert r.status_code == 200 and r.json()["status"] == "match"


def test_no_match(client):
    d = client.post("/api/v1/recommendations", json=PAYLOAD).json()
    assert d["status"] == "no_match" and "message" in d


def test_validation(client):
    r = client.post("/api/v1/recommendations", json={**PAYLOAD, "comment": "ab", "symptom_type": "x"})
    e = r.json()
    assert r.status_code == 400 and e["status"] == "error" and e["error"]["code"] == "validation_error"
    assert {"comment", "symptom_type"} <= set(e["error"]["fields"])
