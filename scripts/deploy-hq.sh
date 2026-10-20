#!/usr/bin/env bash
# Выкладка на hq — https://simracing.egorprotasov.ru (подробно — docs/deploy.md)
#   scripts/deploy-hq.sh setup                  один раз: пользователь, папки, venv, служба, nginx
#   scripts/deploy-hq.sh api ПАПКА_БЭКЕНДА      код бэкенда (main.py, requirements.txt) и рестарт службы
#   scripts/deploy-hq.sh seed                   один раз: тестовое правило TEST-001 из seed_test_rule.py
#   scripts/deploy-hq.sh front                  сборка фронта на Mac и заливка (на hq не собираем — мало памяти)
set -euo pipefail

HOST=${DEPLOY_HOST:-hq}
ORIGIN=${SITE_ORIGIN:-https://simracing.egorprotasov.ru}
cd "$(dirname "$0")/.."

setup() {
  scp deploy/simracing-api.service "$HOST:/etc/systemd/system/simracing-api.service"
  scp deploy/nginx-simracing.conf "$HOST:/etc/nginx/sites-available/simracing"
  ssh "$HOST" 'set -e
    python3 -c "import ensurepip" 2>/dev/null || apt-get install -y -q python3-venv
    id simracing >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin simracing
    mkdir -p /opt/simracing-api/src /var/www/simracing /var/lib/simracing-api
    chown simracing:simracing /var/lib/simracing-api
    [ -x /opt/simracing-api/venv/bin/python ] || python3 -m venv /opt/simracing-api/venv
    systemctl daemon-reload
    systemctl enable simracing-api
    ln -sf /etc/nginx/sites-available/simracing /etc/nginx/sites-enabled/simracing
    nginx -t
    systemctl reload nginx'
}

api() {
  local src=${1:?укажите папку бэкенда}
  [ -f "$src/main.py" ] && [ -f "$src/requirements.txt" ] || { echo "в $src нет main.py или requirements.txt" >&2; exit 1; }
  rsync -az --delete --exclude __pycache__ --exclude '*.db' --exclude venv --exclude .venv --exclude .git "$src/" "$HOST:/opt/simracing-api/src/"
  ssh "$HOST" 'set -e
    /opt/simracing-api/venv/bin/pip install -q --disable-pip-version-check -r /opt/simracing-api/src/requirements.txt
    cd /var/lib/simracing-api
    runuser -u simracing -- env PYTHONPATH=/opt/simracing-api/src PYTHONDONTWRITEBYTECODE=1 /opt/simracing-api/venv/bin/python -m app.db.init_db
    systemctl restart simracing-api
    sleep 2
    curl -fsS http://127.0.0.1:8100/health; echo'
}

seed() {
  ssh "$HOST" 'cd /var/lib/simracing-api && runuser -u simracing -- env PYTHONPATH=/opt/simracing-api/src PYTHONDONTWRITEBYTECODE=1 /opt/simracing-api/venv/bin/python /opt/simracing-api/src/seed_test_rule.py'
}

front() {
  # Сайт на hq закрыт от индексации (просьба Егора 20.10): robots.txt с Disallow и X-Robots-Tag в nginx
  SITE_NOINDEX=1 SITE_BASE=/ VITE_SITE_ORIGIN="$ORIGIN" VITE_API_URL="$ORIGIN" npm run build
  rsync -az --delete dist/ "$HOST:/var/www/simracing/"
}

cmd=${1:-}
shift || true
case "$cmd" in
  setup | api | seed | front) "$cmd" "$@" ;;
  *) sed -n 2,6p "$0"; exit 1 ;;
esac
