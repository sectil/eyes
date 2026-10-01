#!/usr/bin/env bash
# Yoga ekranları · tek komutla yeniden çekim (depoya dosya yazmaz).
#   bash cek.sh                      8 ekran × {390×844, 320×640} × {açık, koyu} = 32 PNG + ../shots/INDEX.md
#   SADECE=320-dark bash cek.sh      tek birleşim (INDEX.md yazılmaz)
#   CIKTI=/bir/klasör bash cek.sh    çıktı başka klasöre (../shots'a dokunmadan deneme çekimi)
#   SAAT=gercek | SAFE=0             bkz. cek.mjs başı
# Tema denetimi: her görüntünün görünen teması piksellerden ölçülür; INDEX.md "Tema denetimi" açık temada koyu çıkan
# ekranın nedenini yazar (oynatıcı: plan gereği; .yg-night vb.: uygulamanın kararı). Tema düzenekte uygulanmazsa
# (data-theme ya da prefers-color-scheme yanlış) çekim durur ya da çıkış kodu 2 olur.
# Vite dev sunucusu /home/user/eyes/app içinden 4291'de (--strictPort) açılır, iş bitince (hata olsa da) PID ile durur.
# --configLoader native: yapılandırma derlenip node_modules/.vite-temp içine (depo) geçici dosya yazılmasın.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP=/home/user/eyes/app
PORT=4291
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"

# Düzeneğin vite yapılandırması ve JSX'i uygulamanın paketlerini bu bağla bulur (depoda değişiklik yok)
[ -e "$HERE/node_modules" ] || ln -s "$APP/node_modules" "$HERE/node_modules"

if (exec 3<>"/dev/tcp/127.0.0.1/$PORT") 2>/dev/null; then
  echo "Port $PORT dolu; önce oradaki süreci durdur." >&2
  exit 1
fi

cd "$APP"
node "$APP/node_modules/vite/bin/vite.js" --config "$HERE/vite.duzenek.mjs" --configLoader native --port "$PORT" --strictPort >"$HERE/vite.log" 2>&1 &
VITE_PID=$!
echo "$VITE_PID" >"$HERE/vite.pid"
stop() {
  kill "$VITE_PID" 2>/dev/null || true
  wait "$VITE_PID" 2>/dev/null || true
  rm -f "$HERE/vite.pid"
  echo "vite ($VITE_PID) durduruldu"
}
trap stop EXIT

if ! curl -sf -o /dev/null --retry 60 --retry-delay 1 --retry-connrefused "http://127.0.0.1:$PORT/@fs$HERE/yoga.html"; then
  echo "Vite açılmadı:" >&2
  cat "$HERE/vite.log" >&2
  exit 1
fi
echo "vite hazır (PID $VITE_PID)"

node "$HERE/cek.mjs"
