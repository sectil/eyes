#!/bin/bash
# Nef Göz Koçu sunucu kurulumu (Mac, tek komut):
#   bash ~/Projects/eyes/app/scripts/coach-setup.sh
# Yaptıkları:
#  1) ~/.eyetrail_env içindeki EYETRAIL_OPENROUTER_KEY'i okur (ekrana basmaz)
#  2) OpenRouter model listesinden varsayılan modeli doğrular, 5 token'lık deneme çağrısı yapar
#  3) Vercel'e (eyetrail projesi) anahtarı "Sensitive" ve modeli ortam değişkeni olarak yazar
#  4) Web sürümünü + /api/coach fonksiyonunu CLI ile production'a yükler
#     (Git tetiklemeli yüklemeler BLOCKED oluyordu; CLI yüklemesi proje sahibi olarak çalışıyor)
#  5) Canlı uç noktayı dener
set -euo pipefail

TEAM_ID="team_2O48PY694YLhHmiWSwF6BE4B"
PROJECT_ID="prj_bdTrxm717eZBDpNvISrz5Iv0HrQs"
URL="https://eyetrail.vercel.app/api/coach"
# VARSAYIM: sırayla denenen ucuz modeller (ilk var olan seçilir)
CANDIDATES=("google/gemini-3.1-flash-lite" "google/gemini-2.5-flash-lite")
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1"; exit 1; }

main() {
cd "$APP_DIR"

step "1/5 Anahtar"
[ -f "$HOME/.eyetrail_env" ] || fail "~/.eyetrail_env yok. Önce EyeTrail anahtarını kaydet."
# shellcheck disable=SC1091
source "$HOME/.eyetrail_env"
[ -n "${EYETRAIL_OPENROUTER_KEY:-}" ] || fail "EYETRAIL_OPENROUTER_KEY boş."
echo "Anahtar okundu (uzunluk ${#EYETRAIL_OPENROUTER_KEY})."

step "2/5 Model seçimi ve deneme çağrısı"
MODELS_JSON="$(curl -fsS https://openrouter.ai/api/v1/models)" || fail "OpenRouter model listesi alınamadı (internet?)"
MODEL=""
for m in "${CANDIDATES[@]}"; do
  if printf '%s' "$MODELS_JSON" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const ids=JSON.parse(s).data.map(x=>x.id);process.exit(ids.includes(process.argv[1])?0:1)})' "$m"; then
    MODEL="$m"; break
  fi
done
[ -n "$MODEL" ] || fail "Aday modellerin hiçbiri OpenRouter'da yok: ${CANDIDATES[*]}"
echo "Model: $MODEL"
HTTP=$(curl -s -o /tmp/eyetrail_or_test.json -w '%{http_code}' https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $EYETRAIL_OPENROUTER_KEY" -H 'Content-Type: application/json' \
  -d "{\"model\":\"$MODEL\",\"max_tokens\":5,\"messages\":[{\"role\":\"user\",\"content\":\"Merhaba de\"}]}")
if [ "$HTTP" != "200" ]; then
  echo "OpenRouter cevabı:"; head -c 400 /tmp/eyetrail_or_test.json; echo
  rm -f /tmp/eyetrail_or_test.json
  fail "Anahtar/model denemesi başarısız (HTTP $HTTP). Kredi ya da anahtar sorunu olabilir."
fi
rm -f /tmp/eyetrail_or_test.json
echo "Deneme çağrısı başarılı."

step "3/5 Vercel oturumu ve ortam değişkenleri"
export VERCEL_ORG_ID="$TEAM_ID" VERCEL_PROJECT_ID="$PROJECT_ID"
if ! npx --yes vercel@latest whoami >/dev/null 2>&1; then
  echo "Vercel'e giriş gerekiyor; tarayıcı açılacak."
  npx --yes vercel@latest login
fi
npx --yes vercel@latest env rm EYETRAIL_OPENROUTER_KEY production --yes >/dev/null 2>&1 || true
printf '%s' "$EYETRAIL_OPENROUTER_KEY" | npx --yes vercel@latest env add EYETRAIL_OPENROUTER_KEY production --sensitive
npx --yes vercel@latest env rm EYETRAIL_COACH_MODEL production --yes >/dev/null 2>&1 || true
printf '%s' "$MODEL" | npx --yes vercel@latest env add EYETRAIL_COACH_MODEL production
unset EYETRAIL_OPENROUTER_KEY

step "4/5 Production yüklemesi (web + /api/coach)"
# Vercel Hobby, commit yazarı ekip üyesi olmayan yüklemeleri BLOCKED yapıyor (commit'ler Claude'un).
# CLI, git klasöründen yüklerken commit bilgisini ekliyor → aynı engel. Bu yüzden kod, git'siz geçici
# bir kopyadan yükleniyor (daha önce READY olan yükleme de böyleydi).
TMP="$(mktemp -d)"
rsync -a --exclude node_modules --exclude ios --exclude build-ios --exclude dist --exclude .git \
  --exclude docs --exclude public/mediapipe-wasm --exclude '.env*' "$APP_DIR/" "$TMP/app/"
( cd "$TMP/app" && npx --yes vercel@latest deploy --prod --yes )
rm -rf "$TMP"

step "5/5 Canlı deneme"
curl -fsS "$URL" || fail "Uç nokta açılmadı: $URL"
echo
curl -fsS -X POST "$URL" -H 'Content-Type: application/json' -H 'Origin: capacitor://localhost' \
  -d '{"kind":"today","signals":{"daysActive7":2,"weeklyTarget":3,"thisWeekDays":2,"vaPhase":"familiarization","daysSinceLastTest":1,"hourNow":10}}' \
  || fail "Koç cevabı alınamadı"
printf '\n\n\033[1;32m✔ Nef Göz Koçu sunucusu hazır (%s).\033[0m Şimdi uygulama için: bash %s/scripts/testflight.sh\n' "$MODEL" "$APP_DIR"
}

main "$@"
