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
# Önceki derlemenin uygulaması silinir: derleme başarısız olursa ESKİ uygulama kurulmasın (önceden oluyordu).
mkdir -p "$DD"
rm -rf "$DD"/Build/Products/Debug-iphoneos/*.app
set +e
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DD" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  build > "$DD/build.log" 2>&1
RC=$?
set -e
grep -E "error:|BUILD (SUCCEEDED|FAILED)" "$DD/build.log" | head -40 || true

APP="$(find "$DD/Build/Products/Debug-iphoneos" -maxdepth 1 -name '*.app' 2>/dev/null | head -1)"
if [ "$RC" -ne 0 ] || [ -z "$APP" ]; then
  printf '\n\033[1;31m✖ Derleme başarısız; telefona hiçbir şey kurulmadı.\033[0m\n'
  echo "Yukarıdaki 'error:' satırlarını Claude'a gönder. Satır yoksa şunun çıktısını gönder:"
  echo "  tail -40 \"$DD/build.log\""
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
# VARSAYIM: devicectl JSON'u result.devices[] { identifier, deviceProperties.name, hardwareProperties.{platform,deviceType,
# reality,udid}, connectionProperties.{tunnelState,transportType}, capabilities[].featureIdentifier }. Bulunamazsa liste yazdırılır.
# Seçim: DEVICE="ad, kimlik ya da UDID" verilirse o; yoksa yalnız gerçek cihazlar (simülatör asla: listede "simulated"
# iPad simülatörü seçilip "Install Application is not supported" hatası alınmıştı), önce iPhone, sonra kurulum yeteneği
# görünen, bağlı ve kablolu olan. Eşleşmeli ama bağlı olmayan ("available (paired)") iPhone'a devicectl kendisi bağlanır.
DEV="$(DEVICE="${DEVICE:-}" node -e '
  const fs = require("fs")
  try {
    const all = JSON.parse(fs.readFileSync(process.argv[1], "utf8")).result.devices
      .filter((x) => x.hardwareProperties?.platform === "iOS")
    const want = process.env.DEVICE
    if (want) {
      const m = all.find((x) => x.identifier === want || x.hardwareProperties?.udid === want || x.deviceProperties?.name === want)
      if (m) { console.error("Cihaz (seçilen): " + (m.deviceProperties?.name ?? m.identifier)); console.log(m.identifier) }
      else { console.error("DEVICE=" + want + " listede eşleşmedi; devicectl programına aynen veriliyor (UDID ya da ad kabul eder)."); console.log(want) }
      process.exit(0)
    }
    const canInstall = (x) => Array.isArray(x.capabilities) && x.capabilities.some((c) => c.featureIdentifier === "com.apple.coredevice.feature.installapp")
    const isPhone = (x) => x.hardwareProperties?.deviceType === "iPhone" || /iphone/i.test(x.deviceProperties?.name ?? "")
    const ok = all.filter((x) => x.hardwareProperties?.reality !== "simulated")
    const rank = (x) => (isPhone(x) ? 0 : 16) + (canInstall(x) ? 0 : 8) + (x.connectionProperties?.tunnelState === "connected" ? 0 : 2) + (x.connectionProperties?.transportType === "wired" ? 0 : 1)
    const pick = ok.sort((a, b) => rank(a) - rank(b))[0]
    if (pick) { console.error("Cihaz: " + (pick.deviceProperties?.name ?? pick.identifier)); console.log(pick.identifier) }
  } catch {}
' "$DD/devices.json")"
if [ -z "$DEV" ]; then
  echo "Uygulama kurabilen bir iPhone bulunamadı. Kablo, kilit, 'Güven' ve Geliştirici Modu'nu kontrol et."
  echo "Elle seçmek için aşağıdaki listede Reality sütunu 'physical' olan iPhone'un UDID'sini kullan:"
  echo "  DEVICE=00008110-… bash app/scripts/device-run.sh   (… yerine UDID'nin tamamı)"
  xcrun devicectl list devices || true
  exit 1
fi
xcrun devicectl device install app --device "$DEV" "$APP"
xcrun devicectl device process launch --device "$DEV" "$BUNDLE_ID" || echo "Uygulama kuruldu; telefonda simgesinden aç."

printf '\n\033[1;32m✔ Telefona kuruldu.\033[0m Apple ile devam et → hata çıkarsa altındaki küçük yazının ekran görüntüsünü gönder.\n'
}

main "$@"
