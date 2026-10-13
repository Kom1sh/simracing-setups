# Контракт API рекомендаций — черновик фронтенда

Статус: **черновик**, предложение к KIR-02 (контракт утверждает Кирилл, документирует Алёна в ALE-03). Фронтенд уже работает по нему с заглушкой, поэтому любое изменение полей здесь — это правка в `src/assistant/types.ts` и `src/assistant/AssistantPanel.tsx`.

Поля — в `snake_case`, как их по умолчанию отдают FastAPI и Pydantic.

## GET /health

```json
200 {"status": "ok"}
```

## POST /api/v1/recommendations

### Запрос

```json
{
  "car_id": "ferrari-296-gt3",
  "car_class": "gt3",
  "track_id": "spa",
  "symptom": "understeer",
  "corner_phase": "mid",
  "corner_speed": "any",
  "conditions": {
    "air_temp_c": 22,
    "track_temp_c": 30,
    "track_grip": "fast",
    "wetness": "dry",
    "rain_pct": 0
  },
  "setup": { "arb": [5, 3], "brakeBias": 57.5, "pressure": [26, 26, 26, 26] },
  "comment": "В Пуоне передок уходит наружу на ровном газу",
  "locale": "ru"
}
```

| Поле | Тип | Обязательно | Значения |
|---|---|---|---|
| `car_id`, `track_id` | string | да | id из `src/data/cars.json` и `tracks.json` |
| `car_class` | string | да | `gt3`, `gt4`, `gt2`, `cup` |
| `symptom` | string | да | `understeer`, `oversteer`, `braking_instability`, `front_lockup`, `wheelspin`, `kerbs`, `bottoming`, `tyre_overheating` |
| `corner_phase` | string \| null | для `understeer` и `oversteer` | `entry`, `mid`, `exit`; для остальных симптомов `null` |
| `corner_speed` | string | да | `any`, `slow`, `fast` |
| `conditions.*` | number / string | да | `track_grip`: `green`, `fast`, `optimum`; `wetness`: `dry`, `damp`, `wet`, `flooded` |
| `setup` | object \| null | нет | текущие значения регулировок по id шаблона; `null`, если пользователь не отправил сетап |
| `comment` | string \| null | нет | до 500 знаков |
| `locale` | string | да | `ru`, `en` — на каком языке вернуть тексты |

### Ответ: правило найдено

```json
200
{
  "status": "found",
  "recommendations": [
    {
      "rule_id": "R-003",
      "parameter": "arb",
      "position": "front",
      "parameter_label": "Передний стабилизатор",
      "change": { "direction": "decrease", "amount": 1, "unit": "click" },
      "effect": "Передок держит траекторию в установившемся повороте.",
      "limitations": ["Отклик на перекладках станет медленнее."],
      "explanation": null,
      "verification": "verified",
      "source": "Мануал iRacing, раздел Anti-roll bars"
    }
  ],
  "message": null
}
```

- `recommendations` — от одной до трёх правок, самая полезная первой.
- `parameter` — id регулировки из шаблона кабинета (`src/data/carSetup.ts`). Если регулировки там нет, кнопки «Применить» не будет, но совет покажется.
- `position` — `front`, `rear`, `both` для регулировок по осям и колёсам; `null` для одного значения.
- `change.amount` — в единицах самой регулировки, как в гараже: 1 щелчок, 0.5 (%), 2 (мм). `unit` — подсказка для подписи: `click`, `step`, `percent`, `psi`, `mm`, `nm`, `deg`.
- `verification` — `verified` или `unverified`. Непроверенные правила бэкенд по задаче ROD-04 вообще не отдаёт; поле нужно, чтобы интерфейс честно подписал статус.

### Ответ: правила нет

```json
200 {"status": "not_found", "recommendations": [], "message": null}
```

`message` можно заполнить своим текстом; если `null`, интерфейс покажет стандартное «Подходящего правила нет».

### Ошибки

| Код | Тело | Что показывает интерфейс |
|---|---|---|
| 422 | стандартный ответ FastAPI: `{"detail": [{"loc": ["body", "symptom"], "msg": "…"}]}` | «Сервер не принял запрос» и список полей |
| 5xx | любое | «Ошибка на сервере (код)» и «Повторить» |
| нет ответа 15 с, нет сети | — | «Сервер не отвечает» и «Повторить» |
| 200, но не по контракту | — | «Непонятный ответ сервера» |

## Как фронтенд подключается к бэкенду

- Без адреса API ассистент работает на демо-правилах из `src/assistant/demoRules.ts` и пишет об этом в интерфейсе.
- Адрес задаётся при сборке (`VITE_API_URL=http://localhost:8000 npm run build`) или прямо в браузере: `…/ru/app/?api=http://localhost:8000` — запоминается, `?api=demo` возвращает заглушку.
- Бэкенду нужен CORS для `http://localhost:5173`, `http://localhost:4173` и `https://kom1sh.github.io`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "https://kom1sh.github.io"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
```

## Сопоставление формы с API (EGO-01)

| Поле интерфейса | Поле запроса | Преобразование |
|---|---|---|
| «Что делает машина» | `symptom` | вариант списка → его id |
| «Где в повороте» | `corner_phase` | показывается и обязательно только для недо- и избыточной поворачиваемости, иначе `null` |
| «В каких поворотах» | `corner_speed` | по умолчанию `any` |
| «Своими словами» | `comment` | обрезка пробелов, пустое → `null` |
| «Отправить текущий сетап» | `setup` | включено → значения вкладки «Машина», выключено → `null` |
| Машина и трасса из полосы кабинета | `car_id`, `car_class`, `track_id` | без изменений |
| Вкладка «Трасса и погода» | `conditions` | `airTemp` → `air_temp_c`, `trackTemp` → `track_temp_c`, `grip` → `track_grip`, `wetness` → `wetness`, `rain` → `rain_pct` |
| Язык страницы | `locale` | из адреса `/ru/` или `/en/` |

Проверка на клиенте до отправки: симптом выбран; для недо- и избыточной поворачиваемости выбрана часть поворота.

## Проверка целиком (EGO-05)

```bash
npm run build && npx vite preview --port 4173
node scripts/e2e.mjs                                   # с заглушкой
node scripts/e2e.mjs http://localhost:4173/simracing-setups/ http://localhost:8000   # с живым бэкендом
```
