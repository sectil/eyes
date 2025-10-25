# VisionCare - Proje Yol Haritası

## 🎯 Aşama 1: Kimlik Doğrulama (Authentication)
**Hedef:** Güvenli kullanıcı giriş sistemi

### Features
- [ ] Email/Şifre Kaydı
- [ ] Email/Şifre Girişi
- [ ] Apple Sign-In Entegrasyonu
- [ ] Google Sign-In Entegrasyonu
- [ ] JWT Token Yönetimi
- [ ] Refresh Token Sistemi
- [ ] Şifre Sıfırlama
- [ ] Email Doğrulama
- [ ] Session Yönetimi
- [ ] Kullanıcı Profili (Temel)

### Technical Tasks
- [ ] Email validation service
- [ ] Password hashing (bcrypt)
- [ ] JWT middleware
- [ ] OAuth provider integration
- [ ] Session database schema
- [ ] Email sending service

### Testing
- [ ] Unit tests for auth logic
- [ ] Integration tests for OAuth
- [ ] E2E tests for login flow

---

## 🎯 Aşama 2: Göz Algılama & Kalibrasyon
**Hedef:** Kamera ile göz tespiti ve doğru kalibrasyon

### Features
- [ ] Kamera Erişimi (iOS/Android)
- [ ] FaceMesh Entegrasyonu
- [ ] Gerçek Zamanlı Göz Algılama
- [ ] Göz Koordinatları Hesaplama
- [ ] 5-Nokta Kalibrasyon
- [ ] 9-Nokta Kalibrasyon
- [ ] Kalibrasyon Doğrulama
- [ ] Kalibrasyon Matrisi Hesaplama
- [ ] Göz Kırpma Tespiti
- [ ] Göz Açıklığı Ölçümü

### Technical Tasks
- [ ] TensorFlow.js setup
- [ ] FaceMesh model loading
- [ ] Eye coordinate extraction
- [ ] Calibration algorithm (linear regression)
- [ ] Calibration validation logic
- [ ] Blink detection algorithm
- [ ] Performance optimization

### Testing
- [ ] Unit tests for calibration algorithm
- [ ] Integration tests with camera
- [ ] Accuracy tests (>95%)
- [ ] Performance tests

---

## 🎯 Aşama 3: Göz Testleri
**Hedef:** Çeşitli göz sağlığı testleri

### Snellen Testi
- [ ] Test UI
- [ ] Dinamik harf boyutu
- [ ] Sonuç hesaplama (20/20 format)
- [ ] Sağ/Sol göz ayrımı

### Renk Testi
- [ ] Ishihara test entegrasyonu
- [ ] Renk algısı analizi
- [ ] Renk körlüğü tespiti

### Kontrast Testi
- [ ] Kontrast seviyeleri
- [ ] Threshold bulma
- [ ] Sonuç raporlaması

### Astigmatizm Testi
- [ ] Astigmatizm çarkı
- [ ] Açı tespiti
- [ ] Derece hesaplama

### Yakınlaşma Testi
- [ ] Yakınlaşma ölçümü
- [ ] Göz takibi
- [ ] Sonuç analizi

### Semptom Anketi
- [ ] Anket formu
- [ ] Soru sıralaması
- [ ] Puan hesaplama

### Technical Tasks
- [ ] Test engine architecture
- [ ] Result storage
- [ ] Result analysis
- [ ] Test history tracking

---

## 🎯 Aşama 4: Dashboard & Profil
**Hedef:** Kullanıcı verilerini görüntüleme ve yönetme

### Dashboard
- [ ] Test sonuçları özeti
- [ ] Sağlık metrikleri grafiği
- [ ] Son testler listesi
- [ ] Trend gösterimi

### Profil Yönetimi
- [ ] Profil bilgileri düzenleme
- [ ] Gözlük bilgisi
- [ ] Aile öyküsü
- [ ] Göz muayene tarihi

### Test Geçmişi
- [ ] Test listesi
- [ ] Tarih filtreleme
- [ ] Test detayları
- [ ] Sonuç karşılaştırması

### Sağlık Metrikleri
- [ ] Ekran süresi takibi
- [ ] Dış ortam süresi
- [ ] Uyku saati
- [ ] Göz yorgunluğu skoru

---

## 🎯 Aşama 5: Sağlık Takibi & AI
**Hedef:** Kullanıcı sağlığını takip et ve AI analizi

### Sağlık Günlüğü
- [ ] Günlük kayıt formu
- [ ] Göz yorgunluğu skoru (1-10)
- [ ] Ekran süresi
- [ ] Semptomlar
- [ ] Notlar

### Trend Analizi
- [ ] Haftalık trend
- [ ] Aylık trend
- [ ] Yıllık trend
- [ ] Grafik gösterimi

### AI Tavsiyesi
- [ ] AI model entegrasyonu
- [ ] Kişiselleştirilmiş öneriler
- [ ] Sağlık uyarıları
- [ ] Egzersiz önerileri

### Bildirimler
- [ ] Push notifications
- [ ] Egzersiz hatırlatıcıları
- [ ] Test hatırlatıcıları
- [ ] Sağlık uyarıları

---

## 🎯 Aşama 6: App Store Deployment
**Hedef:** Uygulamayı iOS ve Android'de yayınla

### iOS
- [ ] Apple Developer Account
- [ ] App Store Connect setup
- [ ] TestFlight build
- [ ] App Store submission
- [ ] App Store approval
- [ ] Live release

### Android
- [ ] Google Play Developer Account
- [ ] Google Play Console setup
- [ ] Signed APK build
- [ ] Google Play Beta
- [ ] Google Play release
- [ ] Live release

### Build & Release
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Versioning strategy
- [ ] Release notes
- [ ] Update mechanism

### Monitoring
- [ ] Crash reporting
- [ ] Analytics
- [ ] User feedback
- [ ] Performance monitoring

---

## 📊 Durum Özeti

| Aşama | Başlangıç | Bitiş | Durum |
|-------|-----------|-------|-------|
| 1. Auth | Week 1 | Week 2 | 🚀 In Progress |
| 2. Eye Detection | Week 3 | Week 5 | ⏳ Planlama |
| 3. Eye Tests | Week 6 | Week 8 | ⏳ Planlama |
| 4. Dashboard | Week 9 | Week 10 | ⏳ Planlama |
| 5. Health Tracking | Week 11 | Week 12 | ⏳ Planlama |
| 6. App Store | Week 13 | Week 14 | ⏳ Planlama |

---

## 🗓️ Timeline

**Total Duration:** 14 weeks

### Week 1-2: Authentication
- Email/Password system
- OAuth integration
- JWT token management
- Basic profile

### Week 3-5: Eye Detection & Calibration
- Camera integration
- FaceMesh setup
- Calibration system
- Blink detection

### Week 6-8: Eye Tests
- Snellen test
- Color test
- Contrast test
- Astigmatism test
- Convergence test
- Symptom survey

### Week 9-10: Dashboard & Profile
- Dashboard UI
- Profile management
- Test history
- Health metrics

### Week 11-12: Health Tracking & AI
- Health logs
- Trend analysis
- AI recommendations
- Notifications

### Week 13-14: App Store Deployment
- iOS deployment
- Android deployment
- CI/CD setup
- Monitoring

---

## 🔗 İlişkili Belgeler

- [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) - Sistem mimarisi
- [TODO.md](./TODO.md) - Detaylı görev listesi
