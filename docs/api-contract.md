# Фронтенд и API рекомендаций

Контракт — версия **ALE-03** (форма из шести полей), по ней сделан FastAPI-бэкенд Родиона. Здесь — как фронтенд его использует (EGO-01…05) и что проверено на живом бэкенде.

## Контракт коротко

- `GET /health` → `200 {"status": "ok"}`
- `POST /api/v1/recommendations`

| Поле | Тип | Обязательное |
|---|---|---|
| `car` | string — точное название из справочника | да |
| `track` | string — точное название из справочника | да |
| `symptom_type` | `understeer` / `oversteer` | да |
| `corner_phase` | `entry` / `mid` / `exit` | да |
| `comment` | 3–500 знаков, только сохраняется в историю | да |
| `stint_moment` | `from_start` / `after_laps` / `null` | нет |

- `200 {"status": "match", "request_id": "…", "recommendations": [{rule_id, parameter, direction, change_description, expected_effect, limitations, basis}]}`
- `200 {"status": "no_match", "request_id": "…", "message": "…"}`
- `400 {"status": "error", "error": {"code": "validation_error", "message": "…", "fields": {"comment": "…"}}}`
- `500 {"status": "error", "error": {"code": "internal_error", "message": "…"}}`

Как бэкенд подбирает правило: по `symptom_type`, `corner_phase` и статусу `verified`; если `stint_moment` задан — правила с тем же моментом или без него; затем `car` и `track` должны буквально совпасть со списком применимости правила.

Типы на фронте — `src/assistant/types.ts`, клиент — `src/assistant/api.ts`.

## Форма (EGO-01)

| Поле формы | Поле запроса |
|---|---|
| Машина из шапки кабинета | `car`: для NASCAR Next Gen — `NASCAR Cup Series Next Gen (Gen 7)`, для остальных — имя машины в iRacing |
| Трасса из шапки кабинета | `track`: имя трассы в iRacing (`Daytona International Speedway`) |
| «Что делает машина»: недостаточная / избыточная | `symptom_type` |
| «Где в повороте»: вход / середина / выход | `corner_phase` |
| «Когда появляется»: не важно / с начала заезда / после нескольких кругов | `stint_moment`: `null` / `from_start` / `after_laps` |
| «Опишите своими словами» | `comment` (обрезка пробелов) |

До отправки фронт проверяет то же, что бэкенд: выбраны симптом и фаза, комментарий 3–500 знаков.

**Справочник машин и трасс** — каталог кабинета `src/data/cars.json` и `src/data/tracks.json`: 22 машины iRacing (NASCAR Next Gen, GT3, GT4, Cup) и трассы iRacing, у каждой поле `iracing.name` — официальное имя на iracing.com. Правила на бэкенде (`applicability`) пишем этими же именами; для NASCAR Next Gen — одно имя на класс, `NASCAR Cup Series Next Gen (Gen 7)` (`NEXT_GEN_RULES_NAME` в `src/assistant/types.ts`). Ассистент берёт машину и трассу из шапки кабинета; если это не NASCAR Next Gen на овале, он предупреждает, что правил для пары пока нет.

**Имена параметров** бэкенд отдаёт каноническими (`front_brake_bias_pct`); фронт показывает подпись из `src/assistant/params.ts`, а для неизвестных имён — имя без подчёркиваний и единицы. Пополнять вместе со словарём.

## Ответ (EGO-02, EGO-03)

| Ответ | Экран |
|---|---|
| `match` | «Нашли правку», номер запроса, карточки: параметр, «Увеличить» / «Уменьшить», что сделать, что изменится, за чем следить, правило и основание |
| `no_match` | «Подходящего правила нет», номер запроса |
| `400` (и стандартный `422` FastAPI) | «Сервер не принял запрос» и поля из `error.fields` |
| `5xx` | «Ошибка на сервере (код)», `error.message`, «Повторить» |
| нет ответа 15 с | «Сервер не отвечает», «Повторить» |

## Подключение (EGO-04)

- Ассистент всегда ходит в настоящий бэкенд, заглушки в сборке нет. По умолчанию — боевой https://simracing.egorprotasov.ru (`DEFAULT_API` в `src/assistant/api.ts`), при сборке можно задать `VITE_API_URL`.
- Для разработки — `…/ru/app/?api=http://localhost:8000`: адрес действует до закрытия вкладки и виден в строке состояния, `?api=` без значения сбрасывает.
- Связь видна сразу: при открытии вкладки фронт спрашивает `GET /health` и пишет «Сервер правил на связи» или «не отвечает».
- Без Python — фейковый бэкенд по тому же контракту: `node scripts/fake-backend.mjs` (порт 8765, правила — `scripts/fake-rules.ts`, комментарий с `#500` даёт 500).

## Проверка (EGO-05), 20.10.2026

```bash
npm run build && npx vite preview --port 4173
node scripts/e2e.mjs                                   # сборка для Pages + боевой бэкенд
node scripts/e2e.mjs http://localhost:4173/simracing-setups/ http://localhost:8000   # свой бэкенд
node scripts/e2e.mjs https://simracing.egorprotasov.ru/                            # боевой сайт
```

e2e — 21 проверка: контракт API (`/health`, «Не важно» → 200, 400 с полями, CORS для GitHub Pages), вход и кабинет, ассистент (связь с сервером, адрес по умолчанию, найдено, правила нет, «Не важно», ошибка 500 — подменой ответа в браузере — и повтор в настоящий бэкенд, сервер недоступен), язык, лендинг. Все прошли и на сборке для Pages, и на боевом сайте. Тесты бэкенда (`pytest tests`) — 24 из 24.

## Что нужно от бэкенда (Родион)

1. ~~**500 при «Не важно».**~~ Исправлено на сервере 20.10: в истории запросов (`Requests.stint_moment`) поле теперь может быть пустым, плюс два теста на `null` и отсутствующее поле — `deploy/backend-stint-null.patch`. Базу на hq перевела миграция `deploy/migrations/2026-10-20-request-stint-nullable.py`. Нужно влить патч в код бэкенда, иначе следующая выкладка вернёт ошибку.
2. ~~**Публичный адрес.**~~ Сделано 20.10: бэкенд выложен на https://simracing.egorprotasov.ru вместе с сайтом (`docs/deploy.md`). Новую версию бэкенда выкладывает `scripts/deploy-hq.sh api ПАПКА`.
3. **Справочник машин, трасс и параметров** — в правилах писать `car`/`track` официальными именами iRacing (как в `iracing.name` каталога; Атланта в iRacing теперь «EchoPark Speedway (Atlanta)»), для NASCAR Next Gen — `NASCAR Cup Series Next Gen (Gen 7)`; канонические имена `parameter` согласовать.
4. **`pytest` из корня падает** на старом скрипте `app/db/test_db.py` (устаревшие имена полей, а имя файла как у теста). Сами тесты запускаются `pytest tests`; скрипт стоит удалить или переименовать.
5. **Правила.** В базе одно тестовое правило TEST-001 — на сайте оно и отвечает. Нужна настоящая база правил (VAR-02, VAR-04).
