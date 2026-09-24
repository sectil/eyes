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

### Abonelik kurulmadan test (VITE_TEST_UNLOCK)
RevenueCat henüz yoksa uygulama ilk ölçümden sonra ödeme ekranında kilitli kalır. Yalnızca test
derlemesi için kilidi kapatmak:
```bash
VITE_TEST_UNLOCK=1 npm run build
npx cap sync ios
```
Sonra Archive → Upload. ⚠️ **App Store'a incelemeye gönderilecek derleme bu değişken olmadan**
(`npm run build`) yapılmalı; aksi halde uygulama herkese ücretsiz açılır.

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
- [ ] Elle ayar ekranı yine de çıkarsa altında gri bir "Otomatik ölçüm yapılamadı: …" satırı olur;
  bu satırın ekran görüntüsünü gönder (model/çözünürlük bilgisi sorunu gösterir).
- [ ] **Egzersiz setleri (Face ID'li iPhone):** Kırpma adımında sayaç "1/5, 2/5…" diye gerçek kırpmaları
  sayıyor mu (tek kırpma iki kez sayılmamalı)? Üstte ✕ ve "3/9" gibi adım göstergesi var mı?
  Daire adımında turlar sayılıyor mu, bakış noktası dönen halkanın üstünde mi?
- [ ] **Göz takibi — sola/sağa bakış:** "Sola bak" adımında bakış panelindeki nokta **sola**, "Sağa bak"ta
  **sağa** gidiyor mu? Sola bakış sağ kadar kolay algılanıyor mu (eskiden sol zayıftı)? Başını
  çevirmeden yalnızca gözle bakınca da nokta hedef halkaya ulaşıyor mu? Ters gidiyorsa hangi yönün
  ters olduğunu yaz (uygulama birkaç saniyede kendini düzeltmeli; düzeltmiyorsa ekran kaydı gönder).
- [ ] **Gözler kapalıyken / yüz yokken bekleme:** "Gözlerini kapat" adımında sayaç yalnızca gözler
  kapalıyken ilerliyor mu, bitince "Gözlerini aç" sesi geliyor mu? Yüzünü kameradan çekince sayaç
  duruyor ve "Yüzünü kameraya göster" kartı çıkıyor mu? 15 sn ilerleme olmazsa "Bu adımı atla"
  büyük düğmeye dönüşüyor mu? Avuçla gözlerini kapatınca ne oluyor (yüz kayboluyor mu)? Yaz.
- [ ] **Uzağa bak / Yakın–uzak:** Uzağa bak adımında süre yalnızca uzaktaki bir noktaya odaklanınca
  işliyor mu? Yakın–uzak adımında başparmak↔uzak geçişleri "1/6, 2/6…" sayılıyor mu? (Eşikler
  VARSAYIM; yanlış sayıyorsa hangi durumda saydığını/saymadığını yaz.)
- [ ] **Titreşim:** Her kırpmada hafif, her daire turunda orta, adım bitince başarı titreşimi var mı?
- [ ] **Bilgi → Ses ve titreşim → "Titreşimi dene":** Basınca kısa bir titreşim hissediliyor mu ve
  altında "Gönderildi…" yazıyor mu? *Ayarlar → Ses ve Dokunuş → Sistem Dokunuşları* **kapalıyken** de
  dene; hissedilip hissedilmediğini yaz. "Titreşim" anahtarı kapalıyken "dene" düğmesi pasif mi ve
  egzersiz/oyunda hiç titreşim olmuyor mu? Okuma testinde (mikrofon açıkken ve bitince) titreşim var mı?
- [ ] **Sesler anahtarı:** Kapatınca egzersizde sesli yönlendirme ve tonlar tamamen susuyor mu (konuşma
  ortasında kapatınca hemen kesilmeli)? Açıkken iPhone'un yan **sessiz tuşu** açıkken de ses geliyor
  mu? Arkada müzik çalarken uygulama müziği kesiyor mu (kesmemeli, üstüne karışmalı)?
- [ ] **E testi (yeni akış: iniş + ince ayar):** Sağ üstteki ✕ ile çıkılabiliyor mu (koyu temada ✕
  açık renk mi)? Üstte evre adı "Alıştırma" → "Boyut küçülüyor" → "İnce ayar" sırayla değişiyor,
  3 parçalı gösterge ve "~N harf kaldı" doğru ilerliyor mu (ilerleme çubuğu geri gitmemeli)? İlk
  yanlışa kadar harf her doğruda **gözle görülür şekilde** küçülüyor mu (aynı boyut iki kez gelmemeli)?
  "İnce ayar"da harf sınır çevresinde biraz büyüyüp küçülüyor mu? "Göremiyorum" yanlış sayılıp
  sıradakine geçiyor mu? Göz başına ~18–24 harf; günlük test toplam kaç dakika sürdü, yaz.
  Telefonu 25–60 cm arasında ileri-geri oynatınca harf boyutu anlık değişiyor mu?
- [ ] **E testi — gözler arası mola:** Sağ göz bitince 20 sn'lik "Gözlerini dinlendir" ekranı çıkıyor mu?
  Face ID'li iPhone'da sayaç yalnızca telefonun üstünden **uzağa** bakarken ilerliyor, ekrana bakınca
  "sayaç bekliyor" diyor mu? "Atla" hemen sıradaki göze geçiriyor mu? Bitince titreşim + "Mola bitti"
  sesi var mı? Sonuç ekranında değer 1,0'dan gerçek değere akıyor, Snellen karşılığı görünüyor mu?
- [ ] **Uzun kullanımda konfor molası:** Test/egzersiz/oyunda toplam ~10 dk geçirdikten sonra ana
  sayfadan yeni bir etkinlik başlatınca önce "Kısa bir mola" ekranı çıkıyor mu, "Atla" ile hemen
  geçilebiliyor mu? Moladan sonra aynı etkinlik kendiliğinden açılıyor mu? 5 dk+ ara verince (ya da
  uygulama arka plandayken) mola tekrar sorulmamalı.
- [ ] **Gelişim → aktivite takvimi:** Üst kartta Aktivite / Dakika / Aktif gün (ve oynadıysan Yılan
  rekoru) doğru mu? Takvimde test, egzersiz ve oyun yapılan günler işaretli mi (1 aktivite açık, 2+
  koyu), bugün noktalı mı? Bir güne dokununca altta o günün etkinlikleri saatleriyle listeleniyor mu?
  Ay okları çalışıyor mu (gelecek ay pasif)? Bir test akışı (Sağ/Sol/İki göz) **tek** aktivite sayılıyor mu?
  "N gün üst üste" serisi ve "Bu hafta · n/7" doğru mu? Veri yokken boş durum anlamlı mı?
- [ ] **Yılan oyunu (Ana sayfa → Göz oyunu → Yılan):** Face ID'li iPhone'da "Gözlerinle" varsayılan mı?
  3-2-1'de "Ekranın ortasına bak" deniyor mu? Sağa/sola/yukarı/aşağı kısa bakışla yılan o yöne dönüyor
  mu (aşağı bakış da çalışmalı; göz kapağı inip oyun "Gözlerin kapalı" diye duruyorsa yaz)? Yüzünü
  çekince ya da gözlerini 1 sn'den uzun kapatınca oyun duruyor, ekrana bakınca kendiliğinden devam
  ediyor mu? "Dokunarak" modunda kaydırma ve alttaki yön tuşları çalışıyor mu? Yem yiyince skor artıyor,
  her 5 yemde hızlanıyor, rekor geçince "Rekor" rozeti çıkıyor mu? Oyun bitince "Tekrar oyna",
  "Seçenekler", "Çık" var mı; skor Gelişim'de ve Ana sayfadaki "En iyi" rozetinde görünüyor mu?
  Oyundaki ses düğmesi ve Bilgi'deki "Sesler" kapalıyken hiç ses çalmıyor mu? ✕ ile çıkılabiliyor mu?
  Uygulamayı arka plana alınca oyun duruyor mu? 3 dk'dan uzun oynayınca oyun sonunda mola çıkıyor mu?
- [ ] **Tüm verileri sil** sonrası Yılan "En iyi" rozeti de sıfırlanıyor mu?
- [ ] **Okuma testi (sesli):** İlk "Başla"da mikrofon + konuşma tanıma izni soruyor mu? Cümleyi sesli
  okuyunca "Dinliyorum" altında duyulan metin görünüyor ve doğru okuyunca kendiliğinden sıradakine
  geçiyor mu? "Okudum" düğmesi yedek olarak çalışıyor mu? ✕ ile çıkılabiliyor mu?

### Yerel Swift eklentileri (FaceDistance, Feedback, Speech)

- `ios/App/App/FaceDistancePlugin.swift` (TrueDepth + ARKit; yüz olayı ~30 Hz, bakış açıları
  `gazeLeftX/Y`, `gazeRightX/Y` derece), `FeedbackPlugin.swift` (titreşim: Core Haptics, yoksa UIKit;
  ses modu: sessiz tuşunda da ses), `SpeechPlugin.swift` (konuşma tanıma) ve `MainViewController.swift`
  (eklentileri kaydeder) projeye eklidir; `Main.storyboard` bu denetleyiciyi kullanır.
- Swift dosyası eklendiği/değiştiği için her güncellemede `npm run build && npx cap sync ios` ve
  ardından Xcode'da yeniden derleme gerekir. Eski bir derlemede `Feedback` eklentisi yoksa uygulama
  titreşimde `@capacitor/haptics`'e geri düşer (çalışır ama Sistem Dokunuşları kapalıyken hissedilmeyebilir).
- Bu dosyalar Linux ortamında yazıldı, **Xcode'da ilk kez derlenecek**. Derleme hatası çıkarsa
  hata metnini gönder. En riskli satırlar: `FeedbackPlugin.swift` içinde `override public func load()`,
  `CHHapticEngine(audioSession: nil)`, `reason == .systemError`; `FaceDistancePlugin.swift` içindeki
  uzun `[String: Any]` sözlüğü (derleyici "too complex" derse haber ver).
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
