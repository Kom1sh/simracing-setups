"""Ночной бэкап базы бэкенда: копия через SQLite backup API, хранить 14 дней.
python3 backup.py /var/lib/simracing-api/simracing.db /var/backups/simracing"""
import sqlite3
import sys
import time
from datetime import date
from pathlib import Path

src, dest_dir = Path(sys.argv[1]), Path(sys.argv[2])
dest_dir.mkdir(parents=True, exist_ok=True)
dest = dest_dir / f"daily-{date.today():%Y%m%d}.db"
s, d = sqlite3.connect(src), sqlite3.connect(dest)
s.backup(d)
d.close()
s.close()
for old in dest_dir.glob("daily-*.db"):
    if time.time() - old.stat().st_mtime > 14 * 86400:
        old.unlink()
print(f"backup: {dest} ({dest.stat().st_size} байт)")
