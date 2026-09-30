#!/bin/bash
# Hava eklentisini (SkyPlugin.swift) GEÇİCİ olarak Xcode hedefine ekleyip yalnız DERLER (Mac, tek komut):
#   bash ~/Projects/eyes/app/scripts/sky-check.sh
# Yaptıkları: kodu çeker → web derlemesi → iOS senkron → SkyPlugin'i hedefe ve MainViewController'a geçici ekler →
# imzasız derleme (telefona kurmaz, TestFlight'a yüklemez) → hataları yazar → iki dosyayı eski hâline döndürür.
# Çıktının son kısmını (✔ ya da hata satırları) sohbete yapıştır.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DD="$APP_DIR/build-sky-check"
PBX="ios/App/App.xcodeproj/project.pbxproj"
MVC="ios/App/App/MainViewController.swift"

step() { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }

main() {
cd "$APP_DIR"
restore() { git checkout -- "$PBX" "$MVC" 2>/dev/null || true; }
trap restore EXIT

step "1/4 Kod güncelleniyor"
git checkout -- "$PBX" ios/App/App/Info.plist package-lock.json 2>/dev/null || true
git pull --ff-only

step "2/4 Web derlemesi ve iOS senkron"
npm install --no-audit --no-fund
VITE_APP_BUILD="dev" npm run build
npx cap sync ios

step "3/4 SkyPlugin geçici olarak hedefe ekleniyor"
python3 - "$PBX" "$MVC" <<'PY'
import sys, re
pbx, mvc = sys.argv[1], sys.argv[2]
s = open(pbx, encoding='utf-8').read()
if 'SkyPlugin.swift' not in s:
    BF, FR = 'A1B2C3D4E5F60718293A4B5C', 'B1C2D3E4F5061728394A5B6C'
    lines = s.split('\n')
    out = []
    for ln in lines:
        out.append(ln)
        if 'HealthPlugin.swift in Sources */ = {isa = PBXBuildFile' in ln:
            out.append(f'\t\t{BF} /* SkyPlugin.swift in Sources */ = {{isa = PBXBuildFile; fileRef = {FR} /* SkyPlugin.swift */; }};')
        elif '/* HealthPlugin.swift */ = {isa = PBXFileReference' in ln:
            out.append(f'\t\t{FR} /* SkyPlugin.swift */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SkyPlugin.swift; sourceTree = "<group>"; }};')
        elif re.match(r'\s+[0-9A-F]{24} /\* HealthPlugin\.swift \*/,$', ln):
            out.append(re.sub(r'[0-9A-F]{24} /\* HealthPlugin\.swift \*/', f'{FR} /* SkyPlugin.swift */', ln))
        elif re.match(r'\s+[0-9A-F]{24} /\* HealthPlugin\.swift in Sources \*/,$', ln):
            out.append(re.sub(r'[0-9A-F]{24} /\* HealthPlugin\.swift in Sources \*/', f'{BF} /* SkyPlugin.swift in Sources */', ln))
    s2 = '\n'.join(out)
    assert s2.count('SkyPlugin.swift') == 6, 'pbxproj kalıbı beklenenden farklı'
    open(pbx, 'w', encoding='utf-8').write(s2)
m = open(mvc, encoding='utf-8').read()
if 'SkyPlugin()' not in m:
    a = 'bridge?.registerPluginInstance(HealthPlugin())'
    assert a in m, 'MainViewController kalıbı beklenenden farklı'
    m = m.replace(a, a + '\n        bridge?.registerPluginInstance(SkyPlugin())', 1)
    open(mvc, 'w', encoding='utf-8').write(m)
print('SkyPlugin hedefte (geçici)')
PY

step "4/4 İmzasız derleme (birkaç dakika)"
mkdir -p "$DD"
set +e
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DD" \
  CODE_SIGNING_ALLOWED=NO \
  build > "$DD/build.log" 2>&1
RC=$?
set -e
echo
grep -E "SkyPlugin.swift:[0-9]+:[0-9]+: (error|warning)" "$DD/build.log" | sort -u | head -40 || true
grep -E "error:" "$DD/build.log" | grep -v SkyPlugin | sort -u | head -20 || true
if [ "$RC" -eq 0 ]; then
  printf '\n\033[1;32m✔ SkyPlugin derlendi. Yukarıdaki uyarıları (varsa) sohbete yapıştır.\033[0m\n'
else
  printf '\n\033[1;31m✖ Derleme başarısız. Yukarıdaki hata satırlarını sohbete yapıştır. Tam kayıt: %s\033[0m\n' "$DD/build.log"
fi
echo "(pbxproj ve MainViewController eski hâline döndürüldü; depoda hiçbir şey değişmedi.)"
}
main "$@"
