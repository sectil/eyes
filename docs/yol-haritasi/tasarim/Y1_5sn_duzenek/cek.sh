#!/usr/bin/env bash
# Y1 ekran görüntüleri (yalnız ilk görünüm; 390×844 ve 320×640, açık ve koyu).
#   bash cek.sh        hepsi + ../shots/INDEX.md
#   bash cek.sh 2      adı "2" ile başlayanlar (INDEX yazılmaz)
# Vite sunucusu /home/user/eyes/app içinden 4292'de --strictPort ile açılır; iş bitince (hata olsa da) PID ile kapanır.
# Y1_YOGA=0 bash cek.sh   yoga durağını iPhone kipinde hesaplatmaz (saf web).
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
APP=/home/user/eyes/app
ln -sfn "$APP/node_modules" "$D/node_modules" # vite.config.mjs ve düzenek dosyalarının çıplak içe aktarımları için
cd "$APP"
node "$APP/node_modules/vite/bin/vite.js" --config "$D/vite.config.mjs" --port 4292 --strictPort > "$D/vite.log" 2>&1 &
PID=$!
echo "$PID" > "$D/vite.pid"
stop() { kill "$PID" 2>/dev/null || true; wait "$PID" 2>/dev/null || true; rm -f "$D/vite.pid"; }
trap stop EXIT
ok=0
for _ in $(seq 1 120); do
  if curl -sf -o /dev/null "http://127.0.0.1:4292/@fs$D/seed.html"; then ok=1; break; fi
  kill -0 "$PID" 2>/dev/null || { cat "$D/vite.log"; exit 1; }
  sleep 0.5
done
[ "$ok" = 1 ] || { echo "sunucu açılmadı"; cat "$D/vite.log"; exit 1; }
node "$D/cek.mjs" "$@"
