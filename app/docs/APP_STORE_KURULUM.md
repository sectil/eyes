# Eyelume — App Store, abonelik ve TestFlight kurulumu

Bu rehber, kodun hazır olduğu noktadan TestFlight'ta kendi iPhone'unda denemeye kadar senin
yapman gereken adımları anlatır.

> **Not:** Bu rehberi yazan ortam App Store Connect ve RevenueCat panellerine erişemedi. Menü
> adları Apple/RevenueCat tarafından değiştirilmiş olabilir; ⚠️ işaretli yerlerde panelde
> benzer adı ara. Kodla eşleşmesi **zorunlu** olan değerler `kod` biçiminde yazıldı.

## Kodda sabit olan değerler (değiştirirsen kodu da değiştir)

| Ne | Değer | Nerede |
|---|---|---|
| Paket kimliği (Bundle ID) | `com.sectil.eyelume` | `capacitor.config.json` |
| Uygulama adı | `Eyelume` | `capacitor.config.json`, Info.plist |
| RevenueCat entitlement | `premium` | `src/lib/subscription.js` |
| RevenueCat offering | "current" (varsayılan) offering | `getOfferings().current` |
| Paketler | Annual + Monthly (RevenueCat'in hazır paket türleri) | `offering.annual`, `offering.monthly` |
| Ortam değişkenleri | `VITE_RC_IOS_KEY`, `VITE_PRIVACY_URL` | `app/.env.production` |

---

## 1. Apple Developer / App Store Connect

1. **Sözleşmeler:** App Store Connect → ⚠️ *Business* (eski adı *Agreements, Tax, and Banking*).
   **Ücretli uygulamalar sözleşmesini** kabul et, banka ve vergi bilgilerini gir. Bu tamamlanmadan
   abonelik ürünleri satın alınamaz; sandbox testleri de sorun çıkarabilir.
2. **Bundle ID:** developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → **+** →
   App IDs → Bundle ID: `com.sectil.eyelume` → Capabilities listesinde **In-App Purchase**
   işaretli olsun.
3. **Uygulama kaydı:** App Store Connect → Apps → **+ New App** → Platform iOS, ad: *Eyelume: Görme
   Takibi* (isim alınmışsa: *Eyesmith* / *Eyelio*), dil Türkçe, Bundle ID: `com.sectil.eyelume`,
   SKU: `eyelume-ios`.
4. **Abonelik grubu ve ürünler:** Uygulama → ⚠️ *Monetization → Subscriptions* →
   - Abonelik grubu: `Eyelume Premium`
   - Ürün 1: Referans adı *Aylık*, Product ID `eyelume_premium_monthly`, süre **1 ay**, fiyat
   - Ürün 2: Referans adı *Yıllık*, Product ID `eyelume_premium_yearly`, süre **1 yıl**, fiyat
   - Her iki üründe de: **Introductory Offer → Free Trial → 1 hafta (7 gün)**, tüm ülkeler
   - Türkçe görünen ad ve açıklama, inceleme için ekran görüntüsü (ödeme ekranının görüntüsü)

   (Product ID'ler kodda geçmiyor; RevenueCat'te eşleştirilecek. Yine de bu adları kullan.)

## 2. RevenueCat

1. revenuecat.com'da hesap aç → yeni proje: *Eyelume*.
2. ⚠️ *Apps* → **App Store** uygulaması ekle → Bundle ID `com.sectil.eyelume`. RevenueCat'in
   Apple'la konuşması için istediği anahtarı (panel yönlendirir; App Store Connect'te oluşturulan
   In-App Purchase anahtarı) yükle.
3. ⚠️ *Products* → App Store'daki iki ürünü içe aktar (`eyelume_premium_monthly`, `eyelume_premium_yearly`).
4. ⚠️ *Entitlements* → yeni entitlement: identifier **`premium`** → iki ürünü de ekle.
5. ⚠️ *Offerings* → **default** offering (current olarak işaretli) → paketler:
   **Monthly** → aylık ürün, **Annual** → yıllık ürün.
6. ⚠️ *API Keys* → **iOS için herkese açık (public) SDK anahtarını** kopyala (genelde `appl_` ile başlar).
   Bu anahtar gizli değildir, uygulamanın içine gömülür. *Secret* anahtarı **asla** uygulamaya koyma.

## 3. Gizlilik politikası (zorunlu)

- App Store abonelikli uygulamalarda gizlilik politikası bağlantısı ister. Kısa bir sayfa yeterli:
  "Ölçüm verileri yalnızca cihazda saklanır; kamera görüntüsü kaydedilmez; abonelik için Apple ve
  RevenueCat satın alma bilgisini işler."
- Bu sayfayı yayınla (ör. kendi siten, Notion herkese açık sayfa, GitHub Pages) ve adresini
  `VITE_PRIVACY_URL` olarak ver. App Store Connect'te de aynı adresi gir.
- ⚠️ *App Privacy* etiketleri: Uygulama sağlık verisini sunucuya göndermiyor; ancak RevenueCat
  satın alma geçmişi ve cihaz/uygulama kimliği işler. RevenueCat'in kendi rehberindeki beyanları
  kullan.

## 4. Mac'te derleme ve TestFlight'a yükleme

Gereken: Xcode (App Store'dan), Node.js 22+, git.

```bash
git clone https://github.com/sectil/eyes.git
cd eyes
git checkout claude/cool-pasteur-j5yupf     # veya PR birleştiyse: master
cd app
cp .env.example .env.production            # ve içini doldur (aşağıya bak)
npm install
npm run build
npx cap sync ios
npx cap open ios                            # Xcode açılır
```

`.env.production`:
```
VITE_RC_IOS_KEY=appl_XXXXXXXXXXXXXXXX
VITE_PRIVACY_URL=https://…/gizlilik
```

Xcode'da:
1. Sol üstte **App** projesi → **Signing & Capabilities** → *Team*: kendi geliştirici ekibin.
   *Automatically manage signing* açık.
2. **+ Capability → In-App Purchase** ekle.
3. *General* → Version `1.0.0`, Build `1` (her yüklemede Build'i artır).
4. Üstte hedef cihaz olarak **Any iOS Device (arm64)** seç → menü **Product → Archive**.
5. Organizer açılınca **Distribute App → App Store Connect → Upload**.
6. 10–30 dk sonra App Store Connect → uygulama → **TestFlight** sekmesinde build görünür.
   *Internal Testing* grubuna kendini ekle → iPhone'una **TestFlight** uygulamasını kur → davet
   e-postasından yükle.

### TestFlight'ta satın alma
- TestFlight'ta abonelik satın almaları **sandbox**'tır: gerçek para çekilmez; süreler
  hızlandırılmıştır (7 günlük deneme birkaç dakika sürebilir). ⚠️ Kesin hızlandırma oranları için
  Apple'ın güncel sandbox dokümanına bak.

## 5. Uygulamayı denerken kontrol listesi

- [ ] İlk açılışta güvenlik soruları → kart kalibrasyonu → 40 cm kamera kalibrasyonu çalışıyor mu?
- [ ] İlk "E hangi yönde" testi ücretsiz yapılabiliyor mu?
- [ ] Test sonrası ödeme ekranı çıkıyor mu, fiyatlar **Türk lirası** ve doğru mu?
- [ ] "7 gün ücretsiz başla" → Apple ödeme penceresi → sonra uygulama açılıyor mu?
- [ ] Uygulamayı silip yeniden kur → "Satın alımları geri yükle" aboneliği geri getiriyor mu?
- [ ] Kilitliyken "Güvenlik bilgisi" ve "Verilerimi indir" çalışıyor mu?
- [ ] Kamera izni metni Türkçe görünüyor mu?
- [ ] Göz kırpma egzersizinde sesli yönlendirme duyuluyor mu?
- [ ] **Akıllı kurulum (Face ID'li iPhone):** İlk açılışta "Adım 2 / 2" görünüyor mu (ekran ayarı
  adımı atlanmalı)? "40 cm'yi bul" ekranında cm değeri yüzünü yaklaştırıp uzaklaştırınca değişiyor mu?
  Bir cetvelle 40 cm'de tutunca ekran ~40 cm gösteriyor mu?
- [ ] **Face ID'siz iPhone (SE, 8):** Mesafe adımı ön kamera + kalibrasyon ile açılıyor mu?
- [ ] Tabloda olmayan yeni bir model çıkarsa uygulama elle ayar ekranını (cetvel/kart) göstermeli.

### Yerel Swift eklentisi (FaceDistancePlugin)

- `ios/App/App/FaceDistancePlugin.swift` (TrueDepth + ARKit) ve `MainViewController.swift`
  (eklentiyi kaydeder) projeye eklidir; `Main.storyboard` bu denetleyiciyi kullanır.
- Bu dosyalar Linux ortamında yazıldı, **Xcode'da ilk kez derlenecek**. Derleme hatası çıkarsa
  hata metnini gönder.
- TrueDepth **Simülatör'de çalışmaz**; gerçek Face ID'li iPhone gerekir.
- Ekran ölçüsü tablosu: `src/lib/iphoneScreens.json` (kaynaklar `docs/iphone_ekran_tablosu.md`).
  Yeni iPhone modelleri çıktıkça bu tabloya eklenmeli.

## 6. İnceleme (App Review) notları

- Uygulama tıbbi teşhis/tedavi iddiası yapmamalı (Guideline 1.4.1). Mağaza açıklamasında
  "görmeyi iyileştirir", "gözlükten kurtarır", "göz kaslarını güçlendirir" gibi ifadeler
  **kullanma**. Önerilen dil: *"Yakın görmeni evde ölç, gelişimini takip et, göz molası
  egzersizleri yap."*
- İnceleme notuna: "Ölçüm yöntemi ve kaynaklar uygulama içinde *Bilgi → Bu neye dayanıyor?*
  bölümündedir. Uygulama teşhis koymaz." yaz.
- Ödeme ekranında fiyat, dönem, deneme koşulu, otomatik yenileme, geri yükleme, kullanım şartları ve
  gizlilik bağlantısı var (Guideline 3.1.2).
