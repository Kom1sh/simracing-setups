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
| «Машина» — список | `car` |
| «Трасса» — список | `track` |
| «Что делает машина»: недостаточная / избыточная | `symptom_type` |
| «Где в повороте»: вход / середина / выход | `corner_phase` |
| «Когда появляется»: не важно / с начала заезда / после нескольких кругов | `stint_moment`: `null` / `from_start` / `after_laps` |
| «Опишите своими словами» | `comment` (обрезка пробелов) |

До отправки фронт проверяет то же, что бэкенд: выбраны симптом и фаза, комментарий 3–500 знаков.

**Справочник машин и трасс** — `CARS` и `TRACKS` в `src/assistant/types.ts`: NASCAR Cup Series Next Gen (Gen 7) и 16 овалов iRacing. Строки должны буквально совпадать с `applicability` в правилах — менять вместе с базой (VAR-02, VAR-04).

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

- Без адреса API — демо-правила `src/assistant/demoRules.ts`, интерфейс об этом пишет.
- Адрес: `VITE_API_URL=https://… npm run build` или в браузере `…/ru/app/?api=http://localhost:8000` (запоминается, `?api=demo` возвращает заглушку).
- Без Python — фейковый бэкенд по тому же контракту: `node scripts/fake-backend.mjs` (порт 8765).

## Проверка на живом бэкенде (EGO-05), 20.10.2026

```bash
cd backend && python -m app.db.init_db && python seed_test_rule.py && python -m uvicorn main:app --port 8000
npm run build && npx vite preview --port 4173
node scripts/e2e.mjs http://localhost:4173/simracing-setups/ http://localhost:8000
```

Результат: 12 из 13 (проверки 500 и офлайна идут только на заглушке). Работают `health`, `match` с `TEST-001`, `no_match`, `400`, CORS, номер запроса.

## Что нужно от бэкенда (Родион)

1. **500 при «Не важно».** Запрос со `stint_moment: null` (поле необязательное по контракту) падает с внутренней ошибкой: в истории запросов (`Requests.stint_moment`) поле не может быть пустым. Нужно разрешить пустое значение — иначе каждый, кто не выберет момент заезда, получит ошибку.
2. ~~**Публичный адрес.**~~ Сделано 20.10: бэкенд выложен на https://simracing.egorprotasov.ru вместе с сайтом (`docs/deploy.md`). Новую версию бэкенда выкладывает `scripts/deploy-hq.sh api ПАПКА`.
3. **Справочник машин, трасс и параметров** — согласовать с фронтом: значения `car`/`track` в правилах и канонические имена `parameter`.
