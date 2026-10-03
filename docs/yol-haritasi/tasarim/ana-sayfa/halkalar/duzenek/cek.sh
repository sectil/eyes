#!/usr/bin/env bash
# Ana sayfa halkaları: gerçek Home ekranının çekimi. vite'ı başlatır, betiği çalıştırır, vite'ı kapatır.
# Kullanım: bash cek.sh <çıktı klasörü> [ek ad] [senaryolar]
#   APP=<app klasörü>  vite kökü (varsayılan deponun app'i; ön örnek için çalışma kopyasının app'i)
#   ek ad: dosya adının sonuna (ör. temel → G2-390x844-acik-temel.png); senaryolar: virgüllü (ör. G2)
# Ortam: PORT (varsayılan 4390), PW_DIR (playwright'ın node_modules yolu), CHROME (chromium yolu), JOBS (aynı anda kaç
# sayfa), SIZES (ör. 390x844,320x568), THEMES (acik,koyu), SCRIPT (cek.mjs yerine denetim.mjs: kaydırırken boy değişimi ve
# basma izi denetimi).
# vite yapılandırması --configLoader runner ile okunur: varsayılan (bundle) yükleyici geçici dosyayı en yakın node_modules'a
# (buradaki bağlantı üzerinden deponun app/node_modules/.vite-temp'ine) yazıyordu.
# Örnek: APP=/yol/halka-wt/app bash cek.sh /tmp/tur1 && bash cek.sh /tmp/tur1 temel G2
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "${APP:-$D/../../../../../../app}" && pwd)"
PORT="${PORT:-4390}"
ln -sfn "$APP/node_modules" "$D/node_modules"   # vite eklentisi uygulamanın node_modules'ından (kök değişince yeniden bağlanır)
OUT="${1:-$D/tur}"; TAG="${2:-}"; ONLY="${3:-}"
mkdir -p "$OUT"
rm -rf "$D/.vite-cache"   # kök değişince eski ön paketler karışmasın
cd "$APP"
APP="$APP" PORT="$PORT" node "$APP/node_modules/vite/bin/vite.js" --config "$D/vite.config.mjs" --configLoader runner > "$D/vite.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
ok=0
for _ in $(seq 1 120); do
  if curl -sf -o /dev/null "http://127.0.0.1:$PORT/@fs$D/home.html"; then ok=1; break; fi
  kill -0 "$PID" 2>/dev/null || { cat "$D/vite.log"; exit 1; }
  sleep 0.5
done
[ "$ok" = 1 ] || { echo "sunucu açılmadı"; cat "$D/vite.log"; exit 1; }
APP="$APP" PORT="$PORT" TAG="$TAG" ONLY="$ONLY" JOBS="${JOBS:-2}" SIZES="${SIZES:-}" SCAN="${SCAN:-}" THEMES="${THEMES:-}" node "$D/${SCRIPT:-cek.mjs}" "$OUT"
