#!/bin/bash

echo "🔥 FORCE UPDATE - Tüm cache'leri temizle"
cd /Users/haydarerkaya/Documents/eyes

echo "1️⃣ Git pull..."
git pull origin claude/fix-expo-sdk-version-011CUUpzxfWRueywRAga91go

echo "2️⃣ Metro bundler'ı durdur..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19000 | xargs kill -9 2>/dev/null || true
lsof -ti:19001 | xargs kill -9 2>/dev/null || true

echo "3️⃣ Watchman temizle..."
watchman watch-del-all 2>/dev/null || true

echo "4️⃣ Tüm cache'leri sil..."
cd mobile
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.expo/web-cache 2>/dev/null || true
rm -rf ~/.expo/metro-cache 2>/dev/null || true

echo "5️⃣ Expo başlat (tamamen temiz)..."
npx expo start -c

echo ""
echo "✅ Tamam! Şimdi:"
echo "   1. Expo Go'yu tamamen kapatın (swipe away)"
echo "   2. QR kodu yeniden taratın"
echo ""
