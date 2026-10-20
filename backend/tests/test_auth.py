def test_register_sets_httponly_session_and_hint(client):
    r = client.post("/api/v2/auth/register", json={"email": " Pilot@Example.com ", "name": "Pilot", "password": "secret-pass-1"})
    assert r.status_code == 201
    assert r.json()["user"]["email"] == "pilot@example.com"
    cookies = r.headers.get_list("set-cookie")
    sid = next(c for c in cookies if c.startswith("srs_sid="))
    hint = next(c for c in cookies if c.startswith("srs_in="))
    assert "HttpOnly" in sid and "SameSite=lax" in sid
    assert "HttpOnly" not in hint
    assert client.get("/api/v2/auth/me").json()["user"]["name"] == "Pilot"


def test_password_is_hashed(app, user):
    from app.models import User

    db = app.state.sessionmaker()
    u = db.query(User).one()
    assert u.password_hash.startswith("$argon2id$") and "secret-pass-1" not in u.password_hash


def test_duplicate_email_and_validation(client, user):
    r = client.post("/api/v2/auth/register", json={"email": "pilot@example.com", "name": "X", "password": "secret-pass-1"})
    assert r.status_code == 409 and r.json()["error"]["code"] == "email_taken"
    r = client.post("/api/v2/auth/register", json={"email": "bad", "name": "", "password": "short"})
    assert r.status_code == 400
    assert {"email", "name", "password"} <= set(r.json()["error"]["fields"])


def test_login_errors_logout(client, user):
    client.post("/api/v2/auth/logout")
    assert client.get("/api/v2/auth/me").status_code == 401
    assert client.post("/api/v2/auth/login", json={"email": "nobody@example.com", "password": "x"}).json()["error"]["code"] == "no_account"
    assert client.post("/api/v2/auth/login", json={"email": "pilot@example.com", "password": "wrong-pass"}).json()["error"]["code"] == "wrong_password"
    r = client.post("/api/v2/auth/login", json={"email": "PILOT@example.com", "password": "secret-pass-1"})
    assert r.status_code == 200 and client.get("/api/v2/auth/me").status_code == 200


def test_forged_cookie_is_rejected(client):
    client.cookies.set("srs_sid", "forged-token")
    assert client.get("/api/v2/auth/me").status_code == 401


def test_rate_limit(client):
    codes = [client.post("/api/v2/auth/login", json={"email": "a@b.cd", "password": "x"}).status_code for _ in range(22)]
    assert codes[-1] == 429
