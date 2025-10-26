#!/bin/bash

# Eyes Mobile App - Quick Update & Reload Script

echo "🔄 Updating from remote..."
cd /Users/haydarerkaya/Documents/eyes
git pull origin claude/fix-expo-sdk-version-011CUUpzxfWRueywRAga91go

echo "🧹 Deep cleaning cache..."
cd mobile
rm -rf .expo
rm -rf node_modules/.cache
watchman watch-del-all 2>/dev/null || true

echo "📱 Starting mobile app with clean cache..."
npx expo start --clear
