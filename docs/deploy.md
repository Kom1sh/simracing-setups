# Выкладка на hq

Сайт и API — https://simracing.egorprotasov.ru, сервер `hq` (Франкфурт, Ubuntu, 1 ядро, ~900 МБ памяти; рядом живут Ultracker и angryclaudes.com). GitHub Pages (`kom1sh.github.io/simracing-setups/`) работает как раньше, сборка по умолчанию — для него.

**Сайт закрыт от индексации**: nginx отдаёт `X-Robots-Tag: noindex, nofollow` на все ответы, robots.txt собирается с `Disallow: /` (`SITE_NOINDEX=1` в `scripts/deploy-hq.sh`).

## Как устроено

| Что | Где |
|---|---|
| Сайт (статика) | `/var/www/simracing` |
| Код бэкенда | `/opt/simracing-api/src`, venv — `/opt/simracing-api/venv` |
| База SQLite | `/var/lib/simracing-api/simracing.db` (рабочая папка службы: путь к базе в бэкенде относительный) |
| Служба | `simracing-api` — uvicorn на `127.0.0.1:8100`, пользователь `simracing`, лимит памяти 200 МБ (`deploy/simracing-api.service`) |
| nginx | `/etc/nginx/sites-available/simracing` = `deploy/nginx-simracing.conf`: статика, `/api/` и `/health` — в службу, 30 запросов в минуту с адреса, остальное API (`/docs`) наружу не открыто |
| HTTPS | Let's Encrypt через `certbot --nginx`, продлевается сам |

## Команды (с Mac, из корня репозитория)

```bash
scripts/deploy-hq.sh front                    # собрать фронт под корень домена и залить
scripts/deploy-hq.sh api ~/path/to/backend    # папка с main.py и requirements.txt: залить, поставить зависимости, init_db, рестарт
scripts/deploy-hq.sh seed                     # тестовое правило TEST-001 (один раз; повтор упадёт на уникальном rule_id)
scripts/deploy-hq.sh setup                    # первичная настройка сервера; повтор безопасен
```

- На hq ничего не собираем: памяти мало, фронт собирается на Mac.
- Повторная заливка бэкенда базу не трогает: `*.db` исключены, база лежит отдельно.
- certbot дописал SSL в конфиг nginx на сервере — `deploy/nginx-simracing.conf` уже с этими блоками. Меняете конфиг — правьте файл в репозитории и запускайте `setup`.
- Логи бэкенда: `ssh hq journalctl -u simracing-api -n 50`.
- **Пока Родион не влил исправление «Не важно»**, накладывайте патч перед выкладкой: `patch -p1 -d ПАПКА_БЭКЕНДА < deploy/backend-stint-null.patch`. Миграция базы на hq уже сделана (бэкап — `/var/lib/simracing-api/simracing.db.bak-2026-10-20`).

## Сборка под свой домен

`SITE_BASE=/` — корень сайта (по умолчанию `/simracing-setups/` для Pages), `VITE_SITE_ORIGIN` — адрес для canonical, hreflang и sitemap, `VITE_API_URL` — адрес API.

## Проверено 20.10.2026

- HTTPS, редирект с HTTP, `noindex` на страницах, ассетах и API
- e2e по боевому сайту: `node scripts/e2e.mjs https://simracing.egorprotasov.ru/` — 21 из 21
- На сервере бэкенд из архива Родиона от 20.10 с исправлением «Не важно» и одно тестовое правило TEST-001
