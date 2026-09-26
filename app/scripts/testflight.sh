#!/bin/bash
# Tek komutla TestFlight'a yükleme (Mac):
#   bash ~/Projects/eyes/app/scripts/testflight.sh
# Yaptıkları: kodu çeker → web derlemesi (test kilidi açık) → iOS senkron →
# yeni build numarası → Xcode arşivi → App Store Connect'e yükleme.
# Gerekli: Xcode'da Apple hesabı ekli (Settings → Accounts), ekip: haydar erkaya.
# App Store'a gönderilecek derleme için: TEST_UNLOCK=0 bash scripts/testflight.sh
set -euo pipefail

TEAM_ID="B39WKYD399"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$APP_DIR/build-ios"
COUNTER_FILE="$HOME/.eyetrail-build-number"
TEST_UNLOCK="${TEST_UNLOCK:-1}"

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }

# Gövde fonksiyon içinde: git pull bu dosyayı güncellese bile çalışan kopya bozulmaz.
main() {

cd "$APP_DIR"

step "1/6 Kod güncelleniyor"
# Xcode'un arayüzde yaptığı yerel ayar değişiklikleri (ekip, build no) çekmeyi engellemesin;
# bu ayarlar aşağıda komut satırından veriliyor.
git checkout -- ios/App/App.xcodeproj/project.pbxproj ios/App/App/Info.plist package-lock.json 2>/dev/null || true
git pull --ff-only

step "2/6 Build numarası"
LAST=$(cat "$COUNTER_FILE" 2>/dev/null || echo 1)
BUILD=$((LAST + 1))
echo "$BUILD" > "$COUNTER_FILE"
echo "Build: $BUILD"

step "3/6 Paketler ve web derlemesi (test kilidi: $TEST_UNLOCK)"
npm install --no-audit --no-fund
if [ "$TEST_UNLOCK" = "1" ]; then
  VITE_APP_BUILD="$BUILD" VITE_TEST_UNLOCK=1 npm run build
else
  VITE_APP_BUILD="$BUILD" npm run build
fi

step "4/6 iOS senkron"
npx cap sync ios

step "5/6 Arşiv (birkaç dakika sürer)"
rm -rf "$BUILD_DIR"
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$BUILD_DIR/App.xcarchive" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  CURRENT_PROJECT_VERSION="$BUILD" \
  archive | grep -E "error:|warning: .*signing|ARCHIVE (SUCCEEDED|FAILED)" || true

if [ ! -d "$BUILD_DIR/App.xcarchive" ]; then
  echo "Arşiv oluşmadı. Yukarıdaki 'error:' satırlarını gönder."
  exit 1
fi

step "6/6 App Store Connect'e yükleme"
cat > "$BUILD_DIR/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>$TEAM_ID</string>
  <key>signingStyle</key><string>automatic</string>
</dict>
</plist>
PLIST

xcodebuild -exportArchive \
  -archivePath "$BUILD_DIR/App.xcarchive" \
  -exportOptionsPlist "$BUILD_DIR/ExportOptions.plist" \
  -exportPath "$BUILD_DIR/export" \
  -allowProvisioningUpdates

printf '\n\033[1;32m✔ Build %s yüklendi.\033[0m 10–30 dk sonra iPhone'"'"'da TestFlight → Güncelle.\n' "$BUILD"
}

main "$@"
