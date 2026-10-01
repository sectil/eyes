#!/usr/bin/env bash
# Yılan ekranları: bash cek.sh [önek]. Vite sunucusu 4293'te açılır, iş bitince kapanır.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$D/../../../../../app" && pwd)"
ln -sfn "$APP/node_modules" "$D/node_modules"
cd "$APP"
node "$APP/node_modules/vite/bin/vite.js" --config "$D/vite.config.mjs" > "$D/vite.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
for _ in $(seq 1 120); do curl -sf -o /dev/null "http://127.0.0.1:4293/@fs$D/yilan.html" && break; sleep 0.5; done
node "$D/cek.mjs" "$@"
