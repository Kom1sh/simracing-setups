#!/usr/bin/env bash
# Выкладка на hq — https://simracing.egorprotasov.ru (подробно — docs/deploy.md)
#   scripts/deploy-hq.sh setup        один раз: пакеты, пользователь, папки, venv, службы, бэкап по ночам, nginx
#   scripts/deploy-hq.sh api          бэкенд из backend/: код, зависимости, миграции, рестарт
#   scripts/deploy-hq.sh knowledge    база знаний: скачать руководства iRacing и нарезать (после api)
#   scripts/deploy-hq.sh front        сборка фронта на Mac и заливка (на hq не собираем — мало памяти)
#   scripts/deploy-hq.sh golden       золотой набор против настоящей модели на сервере
set -euo pipefail

HOST=${DEPLOY_HOST:-hq}
ORIGIN=${SITE_ORIGIN:-https://simracing.egorprotasov.ru}
cd "$(dirname "$0")/.."
RUN_AS='cd /opt/simracing-api/src && runuser -u simracing -- env SIMRACING_DATA_DIR=/var/lib/simracing-api PYTHONDONTWRITEBYTECODE=1'

setup() {
  scp deploy/simracing-api.service deploy/simracing-backup.service deploy/simracing-backup.timer "$HOST:/etc/systemd/system/"
  scp deploy/nginx-simracing.conf "$HOST:/etc/nginx/sites-available/simracing"
  scp deploy/backup.py "$HOST:/opt/simracing-api/backup.py"
  ssh "$HOST" 'set -e
    command -v pdftotext >/dev/null || apt-get install -y -q poppler-utils
    python3 -c "import ensurepip" 2>/dev/null || apt-get install -y -q python3-venv
    id simracing >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin simracing
    mkdir -p /opt/simracing-api/src /var/www/simracing /var/lib/simracing-api /var/backups/simracing
    chown simracing:simracing /var/lib/simracing-api
    [ -x /opt/simracing-api/venv/bin/python ] || python3 -m venv /opt/simracing-api/venv
    [ -f /etc/simracing-api.env ] || { echo "нет /etc/simracing-api.env с GROQ_API_KEY" >&2; exit 1; }
    systemctl daemon-reload
    systemctl enable simracing-api simracing-backup.timer
    systemctl start simracing-backup.timer
    ln -sf /etc/nginx/sites-available/simracing /etc/nginx/sites-enabled/simracing
    nginx -t
    systemctl reload nginx'
}

api() {
  rsync -az --delete --exclude __pycache__ --exclude .pytest_cache --exclude /data --exclude '*.db' --exclude eval/last-report.json backend/ "$HOST:/opt/simracing-api/src/"
  ssh "$HOST" "set -e
    /opt/simracing-api/venv/bin/pip install -q --disable-pip-version-check -r /opt/simracing-api/src/requirements.txt
    $RUN_AS /opt/simracing-api/venv/bin/alembic upgrade head
    systemctl restart simracing-api
    sleep 2
    curl -fsS http://127.0.0.1:8100/api/v2/status; echo"
}

knowledge() {
  ssh "$HOST" "set -e; $RUN_AS /opt/simracing-api/venv/bin/python -m app.knowledge.build | tail -3"
}

front() {
  # Сайт на hq закрыт от индексации (просьба Егора 20.10): robots.txt с Disallow и X-Robots-Tag в nginx
  SITE_NOINDEX=1 SITE_BASE=/ VITE_SITE_ORIGIN="$ORIGIN" npm run build
  rsync -az --delete dist/ "$HOST:/var/www/simracing/"
}

golden() {
  ssh "$HOST" "set -e; set -a; . /etc/simracing-api.env; set +a; cd /opt/simracing-api/src && SIMRACING_DATA_DIR=/var/lib/simracing-api /opt/simracing-api/venv/bin/python -m eval.run $*"
}

cmd=${1:-}
shift || true
case "$cmd" in
  setup | api | knowledge | front | golden) "$cmd" "$@" ;;
  *) sed -n 2,7p "$0"; exit 1 ;;
esac
