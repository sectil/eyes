# Yapılacaklar (tek liste)

Her oturumun başında bu dosya okunur; iş bitince işaretlenir, yeni iş buraya eklenir.
Kural: her özellik PubMed kaynaklı bilimsel dayanakla gelir (uygulamadaki kaynaklar listesine
makalesi ve DOI'siyle girer); sağlık iddiası yok; KVKK açık rıza her veri amacı için ayrı.
Son güncelleme: 2026-09-27.

## Sıradaki iş (sırayla)

### 1. Hareket: Apple Sağlık (HealthKit) — kod bitti, CİHAZDA DENENMEDİ
- [ ] Telefonda: izin sayfaları (bizim + iOS), adım satırı, Beden kartı; Swift derlemesi Mac'te (burada derlenemiyor)
- [ ] Uyku süresi (Gelişim yer tutucusunda vardı) — ayrı karar
- [x] Kendi Capacitor eklentimiz (yalnız okuma): adım, yürüme mesafesi, egzersiz dakikası; bugün + son 7 gün (`HealthPlugin.swift`)
- [x] Info.plist `NSHealthShareUsageDescription`, `App.entitlements` HealthKit, Xcode projesine dosya
- [x] Açık rıza sayfası (`lib/consent.js` yeni amaç `health`): ne / neden / nerede (yalnız telefonda) / ne kadar
- [x] Ana sayfa: adım satırı; Nef önerisi "Önce kalk, 2 dk yürü" (son 1 saatte <100 adım, 09–21)
- [x] Profilim → İzinlerim: Apple Sağlık satırı (aç/kapat; kapatma iOS Ayarlar'a yönlendirir)
- [x] Kaynaklar listesi (Gelişim → Beden): Paluch 2022 Lancet Public Health (doi:10.1016/S2468-2667(21)00302-9),
      Paluch 2022 Circulation (doi:10.1161/CIRCULATIONAHA.122.061288), Dunstan 2012 Diabetes Care
      (doi:10.2337/dc11-1931). Metin: gösterir, iddia etmez (gözlemsel çalışmalar)

### 2. Ekran süresi (Screen Time: FamilyControls / DeviceActivity / ManagedSettings) — sistem önce, başvuru sonra
- [ ] Geliştirme sürümünde (onaysız çalışır): kullanıcının seçtiği uygulamalarda süre dolunca
      5 dk "göz molası" kalkanı + Nefona içinde ekran süresi raporu (DeviceActivityReport; sayı uygulamaya aktarılamaz)
- [ ] Eşik olaylarından kaba bilgi (ör. saatlik) App Group ile alınabilir mi: Apple kurallarına uygunluğu DOĞRULANACAK
- [ ] Kaynaklar: Redondo 2025 Exp Eye Res (doi:10.1016/j.exer.2025.110463, sık/kişisel mola ↓ belirti),
      Johnson & Rosenfield 2022 Optom Vis Sci (doi:10.1097/OPX.0000000000001971, 20 sn/20 dk mola etkisiz),
      Zimmermann & Sobolev 2022 Cyberpsychol Behav Soc Netw (doi:10.1089/cyber.2022.0027, sürtünme süreyi ↓;
      iyi oluşa anında etki YOK → "ekranı azalt, iyi hisset" vaadi yazılmaz)
- [ ] **SONRA: Apple Family Controls (Distribution) başvurusu** — sistem hazır olunca
      (https://developer.apple.com/contact/request/family-controls-distribution). Uygulama + her eklenti
      ayrı bundle ID ile. Gerekçe: kişisel dijital iyi oluş / göz molası. Başvuru metnini Claude yazar.
      Bekleme günler–haftalar; onaysız TestFlight/App Store'a çıkmaz

### 3. Mağazaya çıkmadan önce zorunlu
- [ ] Gizlilik politikası sayfası + adresi (`VITE_PRIVACY_URL`; HealthKit ve abonelik için Apple zorunlu)
- [ ] KVKK aydınlatma metni: veri sorumlusu adı/adresi (kullanıcıdan), hukukçu onayı
- [ ] Abonelik inceleme ekran görüntüleri (App Store Connect, 3 abonelik) + ilk abonelik yeni sürümle gönderilir
- [ ] Sandbox satın alma denemesi (7 gün ücretsiz başla) — henüz yapılmadı
- [ ] Aylık fiyat App Store'da ₺99,99 görünüyor, istenen ₺89,99 → düzeltilecek
- [ ] DSA: "trader değilim" seçildiyse AB ülkeleri kaldırılacak; tüzel kişi posta kodu (48000) kontrol
- [ ] Sandbox test hesabı örnek e-postayla açıldı (ornek.kisi+nefona1@gmail.com): gerçek adresle yenilenmeli

## Açık hatalar
- [ ] Yılan (gözle): aşağı bakış "sağ" okunuyor (eksen karışması). Kalibrasyon verisi gerek; "orta"ya bağlı kilit
      denendi, geri alındı (c48eca6). Kullanıcıdan: geri almadan sonra gözle yön alma çalışıyor mu?
- [ ] "Aboneliği yönet" bağlantısının iPhone'da App Store abonelik sayfasını açtığı doğrulanmadı

## Bekleyen kararlar / içerik
- [ ] Boy ve kilo: kullanım amacı yok → amaç belirlenmedikçe eklenmez
- [ ] Google ile giriş: Google Cloud istemci kimlikleri kullanıcıdan
- [ ] WHO-5 resmi Türkçe madde metni kullanıcıdan
- [ ] Nef'e "Yön" serbest metni: ayrı açık rıza
- [ ] i18n, kronotip, özel SMTP
- [ ] Small Business Program başvurusu (isteğe bağlı)
