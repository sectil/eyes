# VisionCare - Göz Kalibrasyonu ve Egzersiz Uygulaması

Profesyonel göz takibi, kalibrasyon ve egzersiz sistemi. Web tabanlı, AI-powered.

## ✨ Özellikler

### 🎯 9 Noktalı Kalibrasyon
- Ekranda 3x3 grid (9 nokta) gösterilir
- Her nokta için 5 örnek toplanır
- Göz bebeği pozisyonları kaydedilir
- Screen coordinate mapping hesaplanır
- LocalStorage'da saklanır

### 👁️ Gerçek Zamanlı Göz Takibi
- Kalibrasyondan sonra göz bebeği hareketlerini ekran koordinatlarına map eder
- Sarı nokta ile bakış noktasını gösterir
- Göz hareketlerinin izini bırakır (trail)
- Göz kırpmalarda son bilinen pozisyonu korur

### 💪 Göz Egzersizleri
- 7 farklı egzersiz modülü:
  - Merkeze bakış
  - Sola/sağa bakış
  - Yukarı/aşağı bakış
  - Göz kırpma egzersizi
  - Dairesel hareket
- Göz kırpma sayacı
- Egzersiz süresi takibi
- Real-time göz bebeği ve kas hareketi gösterimi

### 😑 Akıllı Göz Kırpma Tespiti
- EAR (Eye Aspect Ratio) algoritması ile göz kırpma tespit edilir
- Göz kapalı olduğunda son bilinen göz bebeği pozisyonu korunur
- Göz açıldığında tekrar güncel pozisyon kullanılır

## 🚀 Nasıl Çalıştırılır?

### 1. AI Service'i Başlat

**Terminal 1:**
```bash
cd /home/user/eyes/ai-service
source venv/bin/activate
PORT=5001 python app.py
```

### 2. Kalibrasyon Uygulamasını Aç

**Basit HTTP Server:**
```bash
cd /home/user/eyes/calibration-app
python3 -m http.server 8080
```

Veya Node.js ile:
```bash
npx serve .
```

### 3. Tarayıcıda Aç

```
http://localhost:8080
```

## 📋 Kullanım Adımları

### 1. Sistem Kontrolleri
- ✅ AI Service bağlantısı
- ✅ Kamera erişimi
- ✅ Kalibrasyon durumu

### 2. Kalibrasyon Yapma

1. **"Kalibrasyon Yap"** butonuna tıkla
2. Ekranda **9 nokta** görünecek (3x3 grid)
3. Her noktaya **sırayla bak**
4. Nokta **yeşil** olduğunda gözünü o noktada tut
5. Her nokta için **5 örnek** toplanacak
6. Nokta **mavi** olunca tamamlanmış demektir
7. Tüm noktalar tamamlandığında **"Kalibrasyonu Kaydet"** butonuna tıkla

### 3. Göz Egzersizi

1. **"Göz Egzersizi"** butonuna tıkla
2. Ekrandaki talimatları takip et:
   - Merkeze bak
   - Sola bak
   - Sağa bak
   - Yukarı bak
   - Aşağı bak
   - 10 kez göz kırp
   - Dairesel hareket yap
3. Real-time data:
   - Egzersiz süresi
   - Göz kırpma sayısı
   - Bakış yönü
   - Göz bebeği pozisyonu

### 4. Göz Takibi

1. **"Göz Takibi Başlat"** butonuna tıkla
2. **Sarı nokta** gözünün baktığı yeri gösterecek
3. Ekranda gezdikçe gözün izini görebilirsin
4. Göz kırptığında son pozisyon korunur

## 🎓 Teknik Detaylar

### Kalibrasyon Algoritması

1. **Veri Toplama:**
   - 9 nokta × 5 örnek = 45 veri noktası
   - Her örnek: `{pupilX, pupilY, screenX, screenY}`

2. **Mapping Hesaplama:**
   - Inverse Distance Weighted (IDW) interpolation
   - Her kalibrasyon noktasının ağırlığı mesafeye göre hesaplanır
   - Formula: `weight = 1 / (distance²)`

3. **Screen Coordinate Mapping:**
```javascript
function mapPupilToScreen(pupilX, pupilY) {
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (const point of calibrationPoints) {
        const distance = sqrt((pupilX - point.pupilX)² + (pupilY - point.pupilY)²);
        const weight = 1 / (distance² + 0.0001);

        totalWeight += weight;
        weightedX += weight * point.screenX;
        weightedY += weight * point.screenY;
    }

    return {
        x: weightedX / totalWeight,
        y: weightedY / totalWeight
    };
}
```

### Göz Kırpma Handling

```javascript
// Son bilinen pozisyonu sakla
if (eyes.both_open) {
    lastPupilPosition = {
        x: (leftPupil.x + rightPupil.x) / 2,
        y: (leftPupil.y + rightPupil.y) / 2
    };
} else {
    // Göz kapalı - son pozisyonu kullan
    screenPos = mapPupilToScreen(
        lastPupilPosition.x,
        lastPupilPosition.y
    );
}
```

### AI Service İletişimi

```javascript
// Face detection API call
const response = await fetch('http://localhost:5001/api/detect-face', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        image: imageBase64,
        timestamp: new Date().toISOString()
    })
});

const result = await response.json();
// result.analysis.eyes.left.pupil.{x, y}
// result.analysis.eyes.right.pupil.{x, y}
// result.analysis.eyes.both_open
// result.analysis.gaze.direction
```

## 📊 Veri Formatı

### Kalibrasyon Verisi (LocalStorage)
```json
{
    "version": "1.0",
    "timestamp": 1698012345678,
    "points": [
        {
            "screenX": 15,
            "screenY": 15,
            "pupilX": -0.234,
            "pupilY": 0.123
        },
        ...
    ]
}
```

### AI Service Response
```json
{
    "success": true,
    "face_detected": true,
    "analysis": {
        "eyes": {
            "left": {
                "open": true,
                "aspect_ratio": 0.28,
                "pupil": {
                    "x": -0.123,
                    "y": 0.045,
                    "center": [320, 240]
                }
            },
            "right": {...},
            "both_open": true,
            "blinking": false
        },
        "gaze": {
            "direction": "center",
            "x": 0.0,
            "y": 0.0
        },
        "glasses": {
            "detected": false,
            "confidence": 0.85
        },
        "face_quality": {
            "landmarks_count": 478,
            "has_iris_tracking": true
        }
    }
}
```

## 🎨 UI Özellikleri

### Kalibrasyon Noktaları
- **Normal**: Beyaz nokta, mavi border
- **Aktif**: Yeşil, büyük, pulse animasyonu
- **Veri Toplama**: Collecting animasyonu (büyü-küçül)
- **Tamamlanmış**: Mavi nokta

### Bakış İndikatörü
- **Sarı nokta**: Aktif bakış noktası
- **Kırmızı border**: Kolay görünürlük
- **Soluk**: Göz kırpma sırasında (opacity: 0.3)
- **Trail**: Göz hareketinin izi (fade out 1s)

### Real-time Data Display
- Sol/sağ göz durumu (açık/kapalı)
- Göz bebeği pozisyonu (normalized -1 to 1)
- Ekran koordinatları (percentage)
- Bakış yönü (center, left, right, up, down)
- Gözlük tespiti
- Landmark sayısı (478)

## ⚙️ Ayarlar

### Kalibrasyon
```javascript
const CALIBRATION_POINTS = 9;      // 3x3 grid
const SAMPLES_PER_POINT = 5;       // Her nokta için örnek sayısı
const SAMPLE_INTERVAL = 200;        // ms between samples
```

### Tracking
```javascript
const TRACKING_FPS = 10;            // ~100ms interval
const TRAIL_LENGTH = 20;            // Maksimum trail point sayısı
const TRAIL_FADE_TIME = 1000;       // ms
```

### Kamera
```javascript
video: {
    facingMode: 'user',             // Ön kamera
    width: { ideal: 640 },
    height: { ideal: 480 }
}
```

## 🔧 Troubleshooting

### Kalibrasyon Noktaları Çalışmıyor
- AI Service bağlantısını kontrol et
- Kamera izni verildiğinden emin ol
- Console'da hata mesajlarını kontrol et
- Her noktada yeterli ışık olduğundan emin ol

### Göz Takibi Yanlış
- Kalibrasyonu tekrar yap
- Kalibrasyon sırasında başını sabit tut
- Tüm 9 noktaya düzgün baktığından emin ol
- Yeterli örneklerin toplandığını kontrol et

### Göz Kırpma Tespit Edilmiyor
- AI Service'in EAR threshold değerini kontrol et
- Kamera kalitesini artır
- Işıklandırmayı iyileştir

### Performance Sorunları
- TRACKING_FPS değerini düşür
- TRAIL_LENGTH değerini azalt
- Kamera resolution'u düşür

## 📝 Geliştirilecekler

- [ ] 5 noktalı hızlı kalibrasyon modu
- [ ] Kalibrasyon accuracy göstergesi
- [ ] Egzersiz skorlama sistemi
- [ ] Egzersiz geçmişi ve istatistikler
- [ ] Özelleştirilebilir egzersiz programları
- [ ] Export/import kalibrasyon verisi
- [ ] Multi-user profil sistemi
- [ ] Gece modu / tema seçimi

## 📄 Lisans

VisionCare AI Eye Tracking System

---

**Son Güncelleme**: 2025-10-26
**Versiyon**: 1.0.0
