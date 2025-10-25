# VisionCare - Proje TODO Listesi

## 📋 Aşama 1: Kimlik Doğrulama (Authentication)

### Email/Şifre Sistemi
- [ ] Email validation service
- [ ] Password hashing (bcrypt)
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] Şifre sıfırlama fonksiyonu
- [ ] Email doğrulama sistemi

### OAuth Entegrasyonu
- [ ] Apple Sign-In setup
- [ ] Google Sign-In setup
- [ ] OAuth callback handler
- [ ] Token exchange logic
- [ ] User sync from OAuth provider

### Session & Token Yönetimi
- [ ] JWT token generation
- [ ] Refresh token logic
- [ ] Token validation middleware
- [ ] Session cookie setup
- [ ] Logout endpoint

### Profil Oluşturma
- [ ] Profil form UI
- [ ] Temel bilgiler (ad, yaş, cinsiyet)
- [ ] Profil kaydetme endpoint
- [ ] Profil güncelleme endpoint

### Testing
- [ ] Unit tests for auth
- [ ] Integration tests for OAuth
- [ ] E2E tests for login flow

---

## 📋 Aşama 2: Göz Algılama & Kalibrasyon

### Kamera Entegrasyonu
- [ ] iOS kamera erişimi
- [ ] Android kamera erişimi
- [ ] Kamera izni yönetimi
- [ ] Video stream setup

### FaceMesh Entegrasyonu
- [ ] TensorFlow.js setup
- [ ] FaceMesh model loading
- [ ] Model caching
- [ ] Performance optimization

### Göz Algılama
- [ ] Göz koordinatları çıkarma
- [ ] Göz merkezi hesaplama
- [ ] Göz açıklığı ölçümü
- [ ] Göz yönü tespiti

### Kalibrasyon Sistemi
- [ ] 5-nokta kalibrasyon UI
- [ ] 9-nokta kalibrasyon UI
- [ ] Kalibrasyon algoritması (linear regression)
- [ ] Kalibrasyon matrisi hesaplama
- [ ] Kalibrasyon veri depolama

### Kalibrasyon Doğrulama
- [ ] Doğrulama testi UI
- [ ] Doğrulama algoritması
- [ ] Doğruluk yüzdesi hesaplama
- [ ] Doğrulama sonucu kaydı

### Göz Kırpma Tespiti
- [ ] Blink detection algoritması
- [ ] EAR (Eye Aspect Ratio) hesaplama
- [ ] Blink counting
- [ ] Blink pattern analizi

### Testing
- [ ] Unit tests for calibration
- [ ] Integration tests with camera
- [ ] Accuracy tests (>95%)
- [ ] Performance benchmarks

---

## 📋 Aşama 3: Göz Testleri

### Snellen Testi
- [ ] Test UI tasarımı
- [ ] Dinamik harf boyutu
- [ ] Harf seçimi algoritması
- [ ] Sonuç hesaplama (20/20)
- [ ] Sağ/Sol göz ayrımı
- [ ] Sonuç kaydı

### Renk Testi
- [ ] Ishihara test UI
- [ ] Renk algısı analizi
- [ ] Renk körlüğü tespiti
- [ ] Sonuç raporlaması

### Kontrast Testi
- [ ] Kontrast seviyeleri UI
- [ ] Threshold bulma algoritması
- [ ] Sonuç hesaplama
- [ ] Sonuç kaydı

### Astigmatizm Testi
- [ ] Astigmatizm çarkı UI
- [ ] Açı tespiti
- [ ] Derece hesaplama
- [ ] Sonuç kaydı

### Yakınlaşma Testi
- [ ] Yakınlaşma ölçümü UI
- [ ] Göz takibi
- [ ] Sonuç analizi
- [ ] Sonuç kaydı

### Semptom Anketi
- [ ] Anket form UI
- [ ] Soru sıralaması
- [ ] Puan hesaplama
- [ ] Sonuç kaydı

### Test Engine
- [ ] Test orchestration
- [ ] Result storage
- [ ] Result analysis
- [ ] Test history tracking

---

## 📋 Aşama 4: Dashboard & Profil

### Dashboard
- [ ] Dashboard layout
- [ ] Test sonuçları özeti
- [ ] Sağlık metrikleri grafiği
- [ ] Son testler listesi
- [ ] Trend gösterimi

### Profil Yönetimi
- [ ] Profil sayfası
- [ ] Profil düzenleme formu
- [ ] Gözlük bilgisi
- [ ] Aile öyküsü
- [ ] Göz muayene tarihi
- [ ] Profil güncelleme endpoint

### Test Geçmişi
- [ ] Test listesi sayfası
- [ ] Tarih filtreleme
- [ ] Test detayları sayfası
- [ ] Sonuç karşılaştırması
- [ ] Test silme fonksiyonu

### Sağlık Metrikleri
- [ ] Ekran süresi takibi
- [ ] Dış ortam süresi
- [ ] Uyku saati
- [ ] Göz yorgunluğu skoru
- [ ] Metrik görüntüleme

---

## 📋 Aşama 5: Sağlık Takibi & AI

### Sağlık Günlüğü
- [ ] Günlük kayıt formu
- [ ] Göz yorgunluğu skoru (1-10)
- [ ] Ekran süresi input
- [ ] Semptomlar input
- [ ] Notlar input
- [ ] Günlük kayıt endpoint

### Trend Analizi
- [ ] Haftalık trend grafiği
- [ ] Aylık trend grafiği
- [ ] Yıllık trend grafiği
- [ ] Trend hesaplama algoritması
- [ ] Trend gösterimi

### AI Tavsiyesi
- [ ] AI model entegrasyonu
- [ ] Kişiselleştirilmiş öneriler
- [ ] Sağlık uyarıları
- [ ] Egzersiz önerileri
- [ ] Tavsiye gösterimi

### Bildirimler
- [ ] Push notification setup
- [ ] Egzersiz hatırlatıcıları
- [ ] Test hatırlatıcıları
- [ ] Sağlık uyarıları
- [ ] Bildirim yönetimi

---

## 📋 Aşama 6: App Store Deployment

### iOS Deployment
- [ ] Apple Developer Account
- [ ] App Store Connect setup
- [ ] TestFlight build
- [ ] App Store submission
- [ ] App Store approval
- [ ] Live release

### Android Deployment
- [ ] Google Play Developer Account
- [ ] Google Play Console setup
- [ ] Signed APK build
- [ ] Google Play Beta
- [ ] Google Play release
- [ ] Live release

### Build & Release
- [ ] CI/CD pipeline setup
- [ ] Automated testing
- [ ] Versioning strategy
- [ ] Release notes template
- [ ] Update mechanism

### Monitoring
- [ ] Crash reporting setup
- [ ] Analytics setup
- [ ] User feedback system
- [ ] Performance monitoring

---

## 🐛 Bug Fixes & Improvements

### Mevcut Sorunlar
- [ ] iPhone OAuth login sorunu (localStorage fallback eklendi)
- [ ] Cookie domain handling (düzeltildi)
- [ ] Blink detection optimization (yapılıyor)

### Performance
- [ ] Model loading optimization
- [ ] Camera performance
- [ ] Memory usage optimization
- [ ] Battery usage optimization

### UI/UX
- [ ] Mobile responsiveness
- [ ] Accessibility (A11y)
- [ ] Dark mode support
- [ ] Animation optimization

---

## 📊 Durum Özeti

| Aşama | Başlangıç | Bitiş | Durum |
|-------|-----------|-------|-------|
| 1. Auth | - | - | 🚀 In Progress |
| 2. Eye Detection | - | - | ⏳ Planlama |
| 3. Eye Tests | - | - | ⏳ Planlama |
| 4. Dashboard | - | - | ⏳ Planlama |
| 5. Health Tracking | - | - | ⏳ Planlama |
| 6. App Store | - | - | ⏳ Planlama |
