#!/bin/bash

# Eyes Mobile App - Quick Update & Reload Script

echo "🔄 Updating from remote..."
cd /Users/haydarerkaya/Documents/eyes
git pull origin claude/fix-expo-sdk-version-011CUUpzxfWRueywRAga91go

echo "📱 Starting mobile app..."
cd mobile
rm -rf .expo
npm start -- --clear
