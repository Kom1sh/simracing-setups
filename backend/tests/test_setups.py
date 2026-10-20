SETUP = {"name": "Дайтона", "car_id": "nascar-next-gen-chevrolet-camaro", "track_id": "daytona", "data": {"setup": {"crossWeight": 0.2}, "conditions": {"airTemp": 25}}}


def test_crud(client, user):
    assert client.get("/api/v2/setups").json() == {"setups": []}
    s = client.post("/api/v2/setups", json=SETUP).json()["setup"]
    assert s["data"]["setup"]["crossWeight"] == 0.2
    upd = client.post(f"/api/v2/setups/{s['id']}", json={**SETUP, "name": "Дайтона 2"}).json()["setup"]
    assert upd["name"] == "Дайтона 2"
    assert [x["id"] for x in client.get("/api/v2/setups").json()["setups"]] == [s["id"]]
    assert client.post(f"/api/v2/setups/{s['id']}/delete").json() == {"status": "ok"}
    assert client.get(f"/api/v2/setups/{s['id']}").status_code == 404


def test_needs_login_and_validates(client, user):
    bad = client.post("/api/v2/setups", json={**SETUP, "car_id": "nissan-gtr", "track_id": "yas-marina"})
    assert bad.status_code == 400 and set(bad.json()["error"]["fields"]) == {"car_id", "track_id"}
    client.post("/api/v2/auth/logout")
    assert client.get("/api/v2/setups").status_code == 401


def test_other_user_cannot_see(client, user):
    s = client.post("/api/v2/setups", json=SETUP).json()["setup"]
    client.post("/api/v2/auth/logout")
    client.post("/api/v2/auth/register", json={"email": "other@example.com", "name": "O", "password": "secret-pass-2"})
    assert client.get(f"/api/v2/setups/{s['id']}").status_code == 404
    assert client.post(f"/api/v2/setups/{s['id']}/delete").status_code == 404
    assert client.get("/api/v2/setups").json()["setups"] == []
