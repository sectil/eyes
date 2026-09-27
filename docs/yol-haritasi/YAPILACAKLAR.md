# Yapılacaklar (tek liste)

Her oturumun başında bu dosya okunur; iş bitince işaretlenir, yeni iş buraya eklenir.
Kural: her özellik PubMed kaynaklı bilimsel dayanakla gelir (uygulamadaki kaynaklar listesine
makalesi ve DOI'siyle girer); sağlık iddiası yok; KVKK açık rıza her veri amacı için ayrı.
Son güncelleme: 2026-09-27.

## Sıradaki iş (sırayla)

### 0. Yeniden düşünme planı (docs/yol-haritasi/YENIDEN_DUSUNME.md) — kararlar alındı
- [x] Küçük düzeltmeler: kamerasız devam, "yalnızca bu cihazda" metni, Nef'in iki ayrı izni (Bilgi anahtarı dahil), 18 yaş sınırı
      (6743d54) + denetimin 29 doğrulanmış bulgusu düzeltildi (Nef rızası kayıtlı ve sürümlü, eski izinsiz kayıt kapanır;
      kamera izni mesajları; kamerasız mod tüm uygulamada; 18 altına "Hesabımı sil")
- [ ] İlk açılış sırası: film → güvenlik → 20 sn göz kırpma → ad/doğum tarihi → 7 gün deneme → Bugün (hesap, 40 cm, bildirim, Apple Sağlık, Ekran Süresi sonraya)
      — yaş kapısı böylece hesaptan ÖNCE olur (denetim: şu an 18 altı kişinin hesabı sunucuda açılıyor, sonra durduruluyor)
- [ ] Yol 4–5 durak (~11 dk); Isınma/Daire/Yakın–uzak Keşfet'e; Çemberler dönüşümlü; yol yalnız yoldan başlatılan oturumla tamamlanır
- [ ] Seri kalır; Takvim "Seri yok, baskı yok" metni seriyle uyumlu hale gelir
- [ ] Ana sayfa ilk ekran ≤5 öğe + "Gözlerin" satırı; sekmeler Bugün · Keşfet · Gelişim
- [ ] Gabor algısal öğrenme modülü (iddiasız; SENTEZ_RAPORU.md §6 protokolü; <100 ms uyaran için yerel/native zamanlama gerekebilir — önce doğrulanacak)

### 0b. Bildirimler (docs/yol-haritasi/BILDIRIM_PLANI.md) — v2 plan onay bekliyor
- [x] Kararlar: ana bildirim göz + kalkma molası; odak (çalışma) oturumu; ölçme yalnız telefonda;
      yürüyüş, nefes, su da BU SÜRÜMDE ("8 hafta" kuralı kaynaksız çıkarımdı, kaldırıldı)
- [ ] v2 uygulaması: Mola ve Su ekranları, Hatırlatmalar ekranı (tür başına aç/kapa + saat), 7 günlük kayan plan,
      tek dokunma dinleyicisi, sessiz gün ölçümü + Gelişim kartı, çalışma oturumu, rıza başına sürüm, kaynaklar
- [ ] Karar: yürüyüş bildirimi uygulama açılmayan günlerde de mi? (evet → HealthKit background delivery, Swift)
- Kanıtla EKLENMEYECEKLER: "çok oturdun" uyarısı, "su içtin mi / nefes yaptın mı" soruları, nabız/HRV tetikli bildirim,
  "bugün 4 saat oldu" mesajı; nabız/HRV yalnızca Gelişim'de, yorumsuz

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
- [ ] Nef yurt dışı aktarımı: hukuki dayanak (KVKK md. 9, 7499 s. Kanun sonrası), OpenRouter ve model sağlayıcısının
      saklama süresi, Vercel fonksiyon bölgesi — hukukçuya/doğrulamaya (rıza metni "yurt dışı" diyor, ülke yazmıyor)
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
