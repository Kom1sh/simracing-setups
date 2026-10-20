# Контракт API

С 20.10.2026 фронт работает с новым бэкендом (`backend/`): аккаунты, сетапы, каталог iRacing и ИИ-ассистент `POST /api/v2/advice`. Описание — `docs/backend.md`, схема OpenAPI — `/api/docs` на сервере.

## ALE-03 — сохранён для совместимости

Контракт команды (бэкенд Родиона, архив — `archive/backend-rodion-ale03/`) работает как раньше:

- `GET /health` → `{"status": "ok"}`
- `POST /api/v1/recommendations` — поля `car`, `track`, `symptom_type` (`understeer` / `oversteer`), `corner_phase` (`entry` / `mid` / `exit`), `comment` (3–500), `stint_moment` (`from_start` / `after_laps` / `null`)
- ответы `match` (с `request_id` и `recommendations`), `no_match`, ошибка `400` с `fields`, `500`

Правила для него — таблица `rules` (как у Родиона). «Не важно» (`stint_moment: null`) работает: в истории запросов поле может быть пустым — то самое исправление, о котором писали Родиону.

## Что изменилось для команды

- **Правила.** Основной источник советов — таблица эффектов `backend/app/data/effects/*.json`: правка, направление, какой симптом лечит и цитата из руководства iRacing. Экспертная проверка — дополнять и править её (каждая строка с цитатой; тест сверяет, что регулировка есть в гараже класса).
- **Проверка качества** — золотой набор `backend/eval/golden.json`: жалоба пилота и допустимые правки. Новые случаи от эксперта — сюда.
- **Справочник** — каталог iRacing из кабинета (`src/data/cars.json`, `tracks.json`), имена — как на iracing.com.
