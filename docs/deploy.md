# Выкладка на hq

Сайт и API — https://simracing.egorprotasov.ru, сервер `hq` (Франкфурт, Ubuntu, 1 ядро, ~900 МБ памяти; рядом живут Ultracker и angryclaudes.com). GitHub Pages (`kom1sh.github.io/simracing-setups/`) работает как раньше, сборка по умолчанию — для него.

**Сайт закрыт от индексации**: nginx отдаёт `X-Robots-Tag: noindex, nofollow` на все ответы, robots.txt собирается с `Disallow: /` (`SITE_NOINDEX=1` в `scripts/deploy-hq.sh`).

## Как устроено

| Что | Где |
|---|---|
| Сайт (статика) | `/var/www/simracing` |
| Код бэкенда | `/opt/simracing-api/src`, venv — `/opt/simracing-api/venv` |
| База SQLite и руководства iRacing | `/var/lib/simracing-api/` (`SIMRACING_DATA_DIR`); ключ Groq — `/etc/simracing-api.env`, права 600 |
| Бэкапы | `/var/backups/simracing/daily-ГГГГММДД.db` — каждую ночь в 04:00 (таймер `simracing-backup`), хранятся 14 дней |
| Служба | `simracing-api` — uvicorn на `127.0.0.1:8100`, пользователь `simracing`, лимит памяти 300 МБ (`deploy/simracing-api.service`) |
| nginx | `/etc/nginx/sites-available/simracing` = `deploy/nginx-simracing.conf`: статика, `/api/` и `/health` — в службу, 30 запросов в минуту с адреса, остальное API (`/docs`) наружу не открыто |
| HTTPS | Let's Encrypt через `certbot --nginx`, продлевается сам |

## Команды (с Mac, из корня репозитория)

```bash
scripts/deploy-hq.sh api          # бэкенд из backend/: код, зависимости, миграции Alembic, рестарт
scripts/deploy-hq.sh knowledge    # база знаний: скачать 19 руководств iRacing и нарезать (после первой выкладки и при новых руководствах)
scripts/deploy-hq.sh front        # собрать фронт под корень домена и залить
scripts/deploy-hq.sh golden       # золотой набор против настоящей модели на сервере
scripts/deploy-hq.sh setup        # первичная настройка сервера; повтор безопасен
```

- На hq ничего не собираем: памяти мало, фронт собирается на Mac.
- Повторная заливка бэкенда базу не трогает: она лежит отдельно, `*.db` исключены.
- certbot дописал SSL в конфиг nginx на сервере — `deploy/nginx-simracing.conf` уже с этими блоками. Меняете конфиг — правьте файл в репозитории и запускайте `setup`.
- Логи бэкенда: `ssh hq journalctl -u simracing-api -n 50`.
- Старая база бэкенда Родиона — `/var/lib/simracing-api/simracing-ale03.db`, его код — в архиве (`archive/backend-rodion-ale03/`).
- Устройство бэкенда и ассистента — `docs/backend.md`.

## Сборка под свой домен

`SITE_BASE=/` — корень сайта (по умолчанию `/simracing-setups/` для Pages), `VITE_SITE_ORIGIN` — адрес для canonical, hreflang и sitemap, `VITE_API_URL` — адрес API.

## Проверено

См. итоги в `docs/backend.md` и отчёт золотого набора на сервере: `backend/eval/last-report.json`.
