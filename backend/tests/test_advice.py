from app.knowledge.effects import all_effects

BASE = {"car_id": "nascar-next-gen-chevrolet-camaro", "track_id": "daytona", "lang": "ru"}
BY_ID = {e.id: e for e in all_effects()}


def ask(client, **kw):  # noqa: ANN001
    return client.post("/api/v2/advice", json={**BASE, **kw})


def test_needs_login(client):
    assert ask(client, text="Заносит на выходе").status_code == 401


def test_ai_advice_from_candidates_only(client, user, llm):
    d = ask(client, symptom="oversteer", phase="exit", text="Заносит на выходе на газу").json()
    assert d["status"] == "advice" and d["mode"] == "ai"
    ch = d["changes"][0]
    effect = BY_ID[ch["effect_id"]]
    assert effect.treats("oversteer", "exit") and "nascar" in effect.classes
    assert ch["source"]["quote"] and ch["source"]["url"].startswith("https://s100.iracing.com/")
    schema = llm.calls[-1]["schema"]
    allowed = schema["properties"]["picks"]["items"]["properties"]["candidate"]["enum"]
    assert all(BY_ID[i].treats("oversteer", "exit") for i in allowed)
    assert d["remaining_today"] == 4


def test_free_text_goes_through_diagnosis(client, user, llm):
    llm.diagnosis = {"symptom": "understeer", "phase": "mid", "when": "after_laps", "speed": "any"}
    d = ask(client, text="К концу стинта машина не поворачивает в середине").json()
    assert [c["name"] for c in llm.calls] == ["diagnosis", "advice"]
    assert d["diagnosis"] == {"symptom": "understeer", "phase": "mid", "when": "after_laps", "speed": "fast"}
    assert BY_ID[d["changes"][0]["effect_id"]].treats("understeer", "mid")


def test_after_laps_prefers_lr_spring(client, user, llm):
    llm.select = lambda ids: {"status": "advice", "question": "", "summary": "", "check": "", "picks": [{"candidate": ids[0], "steps": "1", "why": "", "watch": ""}]}
    d = ask(client, symptom="understeer", phase="mid", when="after_laps", text="к концу стинта").json()
    assert d["changes"][0]["effect_id"] == "nas-lr-spring-soft"
    assert d["changes"][0]["indexes"] == [2] and d["changes"][0]["delta"] < 0


def test_rules_mode_when_model_fails(client, user, llm):
    llm.fail = True
    d = ask(client, symptom="oversteer", phase="entry", text="зад гуляет на входе").json()
    assert d["status"] == "advice" and d["mode"] == "rules" and 1 <= len(d["changes"]) <= 2
    assert all(BY_ID[c["effect_id"]].treats("oversteer", "entry") for c in d["changes"])


def test_unclear_text_without_model_asks_question(client, user, llm):
    llm.fail = True
    d = ask(client, text="что-то не так с машиной").json()
    assert d["status"] == "question" and d["question"]


def test_model_question(client, user, llm):
    llm.select = lambda ids: {"status": "question", "question": "На каком повороте?", "summary": "", "check": "", "picks": []}
    d = ask(client, symptom="understeer", phase="entry", text="странно").json()
    assert d["status"] == "question" and d["question"] == "На каком повороте?"


def test_steps_clamped_to_range(client, user, llm):
    llm.select = lambda ids: {"status": "advice", "question": "", "summary": "", "check": "", "picks": [{"candidate": "nas-cross-up", "steps": "3", "why": "", "watch": ""}]} if "nas-cross-up" in ids else None
    d = ask(client, symptom="oversteer", phase="exit", text="заносит", setup={"crossWeight": 1.9}).json()
    ch = d["changes"][0]
    assert ch["effect_id"] == "nas-cross-up" and ch["steps"] == 1 and abs(ch["delta"] - 0.1) < 1e-9


def test_choice_param_moves_one_option(client, user, llm):
    llm.select = lambda ids: {"status": "advice", "question": "", "summary": "", "check": "", "picks": [{"candidate": "nas-farm-soft", "steps": "1", "why": "", "watch": ""}]}
    d = ask(client, symptom="understeer", phase="mid", text="толкает в середине").json()
    assert d["changes"][0]["from"] == "P3" and d["changes"][0]["to"] == "P2"


def test_feedback_worse_excludes_change_next_time(client, user, llm):
    first = ask(client, symptom="oversteer", phase="exit", text="заносит").json()
    bad = first["changes"][0]["effect_id"]
    r = client.post(f"/api/v2/advice/{first['id']}/feedback", json={"result": "worse", "lap_before": 47.9, "lap_after": 48.3})
    assert r.json()["result"] == "worse"
    ask(client, symptom="oversteer", phase="exit", text="всё ещё заносит")
    allowed = llm.calls[-1]["schema"]["properties"]["picks"]["items"]["properties"]["candidate"]["enum"]
    assert bad not in allowed
    hist = client.get("/api/v2/advice?car_id=nascar-next-gen-chevrolet-camaro").json()["advice"]
    assert hist[1]["feedback"] == "worse"


def test_daily_limit(client, user):
    codes = [ask(client, symptom="oversteer", phase="exit", text="заносит").status_code for _ in range(6)]
    assert codes[:5] == [200] * 5 and codes[5] == 429


def test_validation(client, user):
    assert ask(client, text="").status_code == 400
    assert ask(client, car_id="nissan", symptom="oversteer").status_code == 400


def test_road_car_gets_abs_for_lockup_nascar_does_not(client, user):
    d = ask(client, car_id="ferrari-296-gt3", track_id="spa", symptom="lockup", text="блокирую передние").json()
    assert d["status"] == "advice"
    llm_free = client.app.state.llm
    allowed = llm_free.calls[-1]["schema"]["properties"]["picks"]["items"]["properties"]["candidate"]["enum"]
    assert "road-abs-up" in allowed
