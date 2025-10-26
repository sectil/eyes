#!/bin/bash

echo "🔥 FORCE UPDATE - Tüm cache'leri temizle"
cd /Users/haydarerkaya/Documents/eyes

echo "1️⃣ Git pull..."
git fetch --all
git reset --hard origin/claude/fix-expo-sdk-version-011CUUpzxfWRueywRAga91go

echo "2️⃣ Tüm cache'leri sil..."
cd mobile
rm -rf .expo
rm -rf node_modules/.cache
rm -rf node_modules
rm -rf ~/Library/Caches/Expo
rm -rf ~/.expo

echo "3️⃣ Watchman temizle..."
watchman watch-del-all 2>/dev/null || true

echo "4️⃣ Metro bundler'ı durdur..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

echo "5️⃣ npm install..."
npm install

echo "6️⃣ Expo başlat (tamamen temiz)..."
npx expo start --clear --reset-cache

echo "✅ Tamam! QR kodu yeniden taratın."
