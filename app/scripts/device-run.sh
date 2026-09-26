#!/bin/bash
# Telefona doğrudan kurulum (kablo ile bağlı iPhone, Mac) — Xcode'a dokunmadan, TestFlight beklemeden:
#   bash ~/Projects/eyes/app/scripts/device-run.sh
# Yaptıkları: kodu çeker → web derlemesi (test kilidi açık) → iOS senkron → Debug derleme →
# imzada "Sign in with Apple" izni var mı yazar → bağlı iPhone'a kurar ve açar.
# Gerekli: iPhone kabloyla bağlı, kilidi açık, "Bu bilgisayara güven" onaylı, Geliştirici Modu açık.
set -euo pipefail

TEAM_ID="B39WKYD399"
BUNDLE_ID="com.sectil.eyelume"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DD="$APP_DIR/build-dev"

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }

# Gövde fonksiyon içinde: git pull bu dosyayı güncellese bile çalışan kopya bozulmaz.
main() {
cd "$APP_DIR"

step "1/5 Kod güncelleniyor"
git checkout -- ios/App/App.xcodeproj/project.pbxproj ios/App/App/Info.plist package-lock.json 2>/dev/null || true
git pull --ff-only

step "2/5 Paketler, web derlemesi, iOS senkron"
npm install --no-audit --no-fund
VITE_APP_BUILD="dev" VITE_TEST_UNLOCK=1 npm run build
npx cap sync ios

step "3/5 iOS derlemesi (birkaç dakika sürebilir)"
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DD" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  build | grep -E "error:|BUILD (SUCCEEDED|FAILED)" || true

APP="$(find "$DD/Build/Products/Debug-iphoneos" -maxdepth 1 -name '*.app' 2>/dev/null | head -1)"
if [ -z "$APP" ]; then
  echo "Derleme olmadı. Yukarıdaki 'error:' satırlarını Claude'a gönder."
  exit 1
fi

step "4/5 İmza kontrolü: Apple ile giriş izni"
if codesign -d --entitlements - "$APP" 2>/dev/null | grep -q "com.apple.developer.applesignin"; then
  echo "✔ Apple ile giriş izni imzada VAR"
else
  echo "✖ Apple ile giriş izni imzada YOK"
fi

step "5/5 Telefona kurulum"
xcrun devicectl list devices --json-output "$DD/devices.json" >/dev/null 2>&1 || true
# VARSAYIM: devicectl JSON'u result.devices[] { identifier, deviceProperties.name, hardwareProperties.platform,
# connectionProperties.{tunnelState,transportType} }. Bulunamazsa liste yazdırılır, elle seçilir.
DEV="$(node -e '
  const fs = require("fs")
  try {
    const d = JSON.parse(fs.readFileSync(process.argv[1], "utf8")).result.devices
      .filter((x) => x.hardwareProperties?.platform === "iOS")
    const pick = d.find((x) => x.connectionProperties?.tunnelState === "connected")
      ?? d.find((x) => x.connectionProperties?.transportType === "wired") ?? d[0]
    if (pick) { console.error("Cihaz: " + (pick.deviceProperties?.name ?? pick.identifier)); console.log(pick.identifier) }
  } catch {}
' "$DD/devices.json")"
if [ -z "$DEV" ]; then
  echo "Bağlı iPhone bulunamadı. Kablo, kilit, 'Güven' ve Geliştirici Modu'nu kontrol et. Görünen cihazlar:"
  xcrun devicectl list devices || true
  exit 1
fi
xcrun devicectl device install app --device "$DEV" "$APP"
xcrun devicectl device process launch --device "$DEV" "$BUNDLE_ID" || echo "Uygulama kuruldu; telefonda simgesinden aç."

printf '\n\033[1;32m✔ Telefona kuruldu.\033[0m Apple ile devam et → hata çıkarsa altındaki küçük yazının ekran görüntüsünü gönder.\n'
}

main "$@"
