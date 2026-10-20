# Архив: MVP команды на 20.10.2026

Снимок перед тем, как начать полный бэкенд с ИИ-ассистентом. Ничего из этого не удалено — всё можно поднять как было.

## Что здесь

| Что | Где |
|---|---|
| Бэкенд Родиона (контракт ALE-03), исходный код из архива `simracing-20261020T145747Z-1-001.zip` без правок | `archive/backend-rodion-ale03/` |
| Фронтенд на момент снимка (кабинет iRacing, лендинг, ассистент на ALE-03) | весь остальной репозиторий в этой ветке; тег `mvp-ale03-2026-10-20` |
| Исправление «Не важно» (`stint_moment: null` → 500), с тестами | `deploy/backend-stint-null.patch` |
| Выкладка на hq (simracing.egorprotasov.ru) | `deploy/`, `scripts/deploy-hq.sh`, `docs/deploy.md` |
| Снимок сервера: код бэкенда, сайт, база | на hq: `/var/backups/simracing/2026-10-20/` |

## Как поднять бэкенд Родиона как было

```bash
cd archive/backend-rodion-ale03
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db && python seed_test_rule.py
python -m uvicorn main:app --port 8000
```

Тесты: `python -m pytest tests` — 22 из 22 (`pytest` из корня падает на старом `app/db/test_db.py`).

## Кто что делал

- Бэкенд ALE-03 — Родион
- Контракт и архитектура — Кирилл (ветка `kir` в командном репозитории)
- Фронтенд, лендинг, выкладка — Егор
