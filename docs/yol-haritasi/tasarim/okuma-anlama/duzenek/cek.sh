#!/usr/bin/env bash
# Gerçek ekran çekimi: vite'ı başlatır, verilen betiği çalıştırır, vite'ı kapatır.
# Kullanım: bash cek.sh <çıktı klasörü> [betik]   (betik: cek.mjs varsayılan; ör. stres.mjs, cek-mic.mjs)
# Ortam: PORT (varsayılan 4388), PW_DIR (playwright'ın node_modules yolu), CHROME (chromium yolu).
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$D/../../../../../app" && pwd)"
PORT="${PORT:-4388}"
[ -e "$D/node_modules" ] || ln -s "$APP/node_modules" "$D/node_modules"   # vite eklentisi uygulamanın node_modules'ından
OUT="${1:-$D/tur}"; SCRIPT="${2:-cek.mjs}"
mkdir -p "$OUT"
cd "$APP"
PORT="$PORT" node "$APP/node_modules/vite/bin/vite.js" --config "$D/vite.config.mjs" > "$D/vite.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
for _ in $(seq 1 120); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/@fs$D/oa.html" && break; sleep 0.5; done
PORT="$PORT" node "$D/$SCRIPT" "$OUT"
