#!/bin/bash

echo "🔄 Güncellenen Göz Projesi Başlatılıyor..."

# Mevcut geliştirme sunucusunu durdur
echo "⏹️  Önceki süreçler durduruluyor..."
pkill -f "vite" 2>/dev/null || true

# Node modüllerini temizle
echo "🧹 Eski dosyalar temizleniyor..."
rm -rf node_modules package-lock.json 2>/dev/null || true

# Bağımlılıkları yükle
echo "📦 Bağımlılıklar yükleniyor..."
npm install

# Başarı mesajı
echo ""
echo "✅ Kurulum tamamlandı!"
echo "🚀 Geliştirme sunucusu başlatılıyor..."
echo ""
echo "📱 Mobil cihazınızdan erişmek için:"
echo "   - Yerel ağınızdaki IP adresini kullanın (örn: http://192.168.1.X:5173)"
echo "   - Tarayıcınızda kamera izni vermeyi unutmayın!"
echo ""

# Geliştirme sunucusunu başlat
npm run dev
