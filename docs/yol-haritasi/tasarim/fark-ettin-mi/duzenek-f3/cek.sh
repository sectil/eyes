#!/usr/bin/env bash
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-4377}"
cd /home/user/eyes/app
PORT="$PORT" node /home/user/eyes/app/node_modules/vite/bin/vite.js --config "$D/vite.config.mjs" --port "$PORT" --strictPort > "$D/vite.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
for _ in $(seq 1 120); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/@fs$D/sw.html" && break; sleep 0.5; done
PORT="$PORT" PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node "$D/cek.mjs" "${1:-$D/../ekran}" "${2:-$D/../kayit}"
