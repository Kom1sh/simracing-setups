"""Разовая миграция базы бэкенда: request.stint_moment может быть пустым («Не важно» на фронте).

В модели Requests поле было NOT NULL, и запрос со stint_moment: null падал с 500.
SQLite не умеет снимать NOT NULL со столбца, поэтому таблица пересобирается с сохранением строк.
Повторный запуск ничего не делает.

    python3 2026-10-20-request-stint-nullable.py /var/lib/simracing-api/simracing.db
"""
import sqlite3
import sys

db = sqlite3.connect(sys.argv[1])
cols = {row[1]: row[3] for row in db.execute("PRAGMA table_info(request)")}
if not cols:
    sys.exit("в базе нет таблицы request")
if cols.get("stint_moment") == 0:
    print("stint_moment уже допускает NULL — ничего не делаю")
    sys.exit(0)

ddl = db.execute("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'request'").fetchone()[0]
new_ddl = ddl.replace("stint_moment VARCHAR NOT NULL", "stint_moment VARCHAR")
if new_ddl == ddl:
    sys.exit("не нашёл в схеме «stint_moment VARCHAR NOT NULL» — проверьте таблицу вручную")

with db:
    db.execute("ALTER TABLE request RENAME TO request_old")
    db.execute(new_ddl)
    db.execute("INSERT INTO request SELECT * FROM request_old")
    db.execute("DROP TABLE request_old")

rows = db.execute("SELECT count(*) FROM request").fetchone()[0]
print(f"готово: stint_moment допускает NULL, строк перенесено: {rows}")
