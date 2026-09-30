# DEVİR · Bildirimler, hava ve yürüyüş eşliği (ana oturuma)

Tarih: 2026-09-30. Plan: `PLAN.v1.md` (**onaylandı**). Tasarım: `tasarim.html`
(https://claude.ai/artifact/8hZrrTGoMxnmqZuxTfjX1V). Sahibin sözleri: `SAHIP_ISTEKLERI.md`. Dayanaklar: `arastirma/`.
Bu oturum `app/` altında hiçbir dosyaya dokunmadı. Satır numarası verilmez; işlev ve dosya adıyla aranır (ana oturumun
işleri numaraları kaydırıyor; `arastirma/kod-haritasi.md`'deki `reminders.js` ve `habitLog.js` satır numaraları hatalı).

---

## 1. Onaylı kararlar

1. **Sıra:** yoga kodu ve Build 60 → **B1** bildirim çekirdeği ve "Bana hatırlat" → **B2** hava (onaylı Y5'in yerine) →
   Y2 → Y3 → Y4 → **B3** yürüyüş eşliği → Y6. Her parça ayrı TestFlight ve cihaz kapısı.
2. **"Yürürken beni fark et":** ayrı anahtar, varsayılan kapalı; "Her Zaman" konumla ≥ 500 m yer değişiminde uyanır.
   Kapalıyken Nef, geç fark ettiği ya da kaçırdığı bir yürüyüşten sonra bildirimle açmayı teklif eder (WhatsApp'ın anlık
   konumdaki gibi; `PLAN.v1.md` §3.C.1 madde 4). Hukukçu cevabına kadar bu anahtar App Store'a gitmez.
3. **Nef'in dili:** cümle bankası (model yalnız bankayı üretirken çalışır; sayılar ve saatler telefondaki koddan). Her
   bildirim bir PubMed kaynağına bağlı, dokununca bilim kartı açılır; görünür bilim satırı günde bir bildirimde.
4. **Sahibin oturum içi kararları:** her modülde günde en çok 3 saat (nefes, mola, su, yürüyüş dâhil; deney gün
   düzeyinde, bir türün sessiz gününde bütün saatleri sessiz); sesli koçta aralık 250 m / 500 m / 1 km kişinin seçimi,
   her tam kilometrede ayrıca o kilometrenin süresi; Ana sayfada hava için Apple'a soru gönderilmez, atıf kuralı satırın
   kendisinde karşılanır (işaret + "Veri kaynakları" bağlantısı).
5. **Plandaki "Verdiğim kararlar" tablosu** (itiraz gelmedi, geçerli): deney sessiz gününde yürüyüş sorusu yok (yalnız
   yürüyüş hatırlatmasını açmış kişide); yürüyüş sorusu kilit ekranında mesafeyi gösterir, "Kilit ekranında sayı gösterme"
   anahtarıyla; sesli koç sayıları söyler, aynı cümle ekranda; bildirimde sayılar rakamla, sıcaklık sözcüğü hissedilene
   göre; "ideal" yazılmaz; bilim satırında ölüm ve hastalık riski bulgusu yok; dolunay yalnız takvim anı; Nefona Apple
   Sağlık'a yazmaz.

## 2. Kod sözleşmesi (özet; ayrıntı `PLAN.v1.md` §3 ve §5)

- **Manifest yeteneği `remind`** (`modules/registry.js`): `route`, `legacy` ('mola'|'walk'|'breath'|'water'), `window`
  ('move' 09–21 | 'calm' 08–22), `defaultTime`, `maxTimes` (≤ 3), `doneToday`, `science` (sources.js anahtarları).
  `validateManifest` kuralları ve `reminders()` erişicisi. Ayar `settings.moduleReminders` (asla `settings.reminders`
  içine değil: `normalizeReminders` bilinmeyen alanı siler).
- **Yol birimdir:** yol içinde açılan modülde kart çıkmaz; yol bitince tek "Yolunu her gün hatırlatayım mı?" kartı.
- **Tek planlayıcı `planAll`** (`lib/notifyAll.js`): `planNotifications` (dokunulmaz) + `planModuleReminders` + sabah
  havası + yürüyüş sorusunun yasak dilimleri. Alarm ve alarma bağlı hava dışında iki bildirim arası ≥ 30 dk; aynı yarım
  saate düşen modül hatırlatmaları tek bildirimde birleşir; deney türü kaymaz; oturum sürerken modül hatırlatması yok;
  günde en çok 6 modül bildirimi; toplam bekleyen ≤ 60; tek `threadIdentifier: 'nefona'`, eski teslim edilmişler
  kaldırılır.
- **Gece kuralı (yeni kaynaklar):** hareket 09.00–21.00; sakin 08.00–22.00; deney türleri bugünkü kural; yürüyüş sorusu
  07.00–23.00; 23.00–07.00 alarm dışında hiçbir şey; gece sessizliği Bildirimler'den 21–24 / 06–10 arası ayarlanır,
  01.00–05.00 hiçbir ayarla açılmaz; yatmadan önceki 60 dk (Uykuya Geçiş 30 dk) yok.
- **Kimlikler:** 7400–7499, 7500–7509, 7301, 7302, 7600–7607 dokunulmaz. Yeni: 7700–7701 sabah havası, 7710–7719 yürüyüş
  sorusu ve "fark et" teklifi (Swift kurar; sayısal kimlik ve Capacitor `extra` biçimi; tek `onNotifyTap`), 7800–7859 modül
  hatırlatmaları.
- **Nef bankası:** yer tutuculu cümleler (`{rainFrom:LOC}`), model rakam yazamaz; saat ekleri tablodan; Swift için
  doldurulmuş şablonlar JS'de üretilir. Başlık ≤ 30, gövde ≤ 110 (bilim satırıyla Nef cümlesi ≤ 70, bilim ≤ 100, gövde ≤ 160).
- **Hava:** `SkyPlugin.swift` (WeatherKit, konum "Kullanırken", varsayılan yaklaşık); il yaklaşık konumdan, ilçe listeden
  (GeoNames ADM2, CC BY 4.0) ya da kesin konumda onayla; ters coğrafi kodlama yok; ilçe profile yazılmaz. Ana sayfa kartı
  `SkyLine.jsx` tek satırla takılır (Ana sayfa yeniden tasarlanıyor; bileşen yerinden bağımsız). Sabah havası: son
  açılışta kurulur (tahminin yaşı metinde), iOS 26'da AlarmKit `stopIntent` taze tahminle aynı kimliği yeniden kurar,
  "yerelde yenilendi" işareti; 18 saatten eski tahminle kurulmaz.
- **Yürüyüş:** modül `walk`; `WalkPlugin.swift` (CMPedometer, CMMotionActivity, konum oturumu + `CLBackgroundActivitySession`,
  geçici kesin konum, anons çalar, yarım yürüyüş durumu); kayıt `gozolcum:walk-log` (koordinat yok; `store.sessions`'a
  yazılmaz, Nef'e gitmez; `dataHub.js` okur); bitişte adım Apple Sağlık istatistik sorgusundan. WalkGuard gözlemcisi
  `walk` rızasıyla da başlar. Sesli koç `AppAudioSession`'a yürüyüş durumu; ElevenLabs parçaları ses başına ≈ 65.
- **Rızalar:** `weather` v1 (ilçe ve sabah havası satırları), `walk` (yeni; Apple Sağlık'ın arka plan okuması ve yürüyüş
  sorusu bu rızada), `walkDetect` (yeni, "Her Zaman"). `health` v2 değişmez.

## 3. Değişecek dosyalar

Yeni ve değişen dosyaların tam listesi `PLAN.v1.md` §5.1 ve §5.2'de. `lib/notifyPlan.js`, `lib/reminders.js`,
`lib/restNotify.js`'e dokunulmaz. Swift değişiklikleri (`AlarmPlugin`, `HealthPlugin`, `FeedbackPlugin`,
`MainViewController`, yeni `SkyPlugin`, `WalkPlugin`), `Info.plist` (`NSMotionUsageDescription`,
`NSLocationWhenInUseUsageDescription`, `NSLocationTemporaryUsageDescriptionDictionary`, `UIBackgroundModes` → `location`,
karar 2 için `NSLocationAlwaysAndWhenInUseUsageDescription`) ve `App.entitlements` (WeatherKit) Mac'te derlenir.

## 4. Sıra (her parçada: tasarım kapısı → kod → testler → iki inceleme → TestFlight → cihaz → sahip)

1. **B1:** `remind` sözleşmesi ve doğrulama → `moduleRemind.js` → `notifyAll.js` (eşdeğerlik düzeneği önce) →
   `RemindField`/`RemindSheet` → modüllere tek satır → Profil → Bildirimler → Nef bankası v1 ve sınavı → bilim kartı ve
   `sources.js`'e ≈ 17 kaynak (her biri PubMed'de yeniden açılır) → sürüm notu.
2. **B2:** `SkyPlugin` + `sky.js` + il/ilçe tablosu → `SkyLine` + hava sayfası → `weather` rızası ve gizlilik sayfası →
   sabah havası katman 1 → AlarmKit `stopIntent` katman 2 → (cihaz ölçümünden sonra karar) arka plan yenilemesi.
3. **B3:** tasarım kapısı (fark et teklifi bildirimi ve açıklama sayfası dâhil) → `WalkPlugin` → `walk` modülü, ekran,
   kayıt ve veri merkezi → sesli koç (parçalar sahibin onayıyla üretilir; ücretli) → yürüyüş sorusu (saatlik yol) →
   `walkDetect` ve "fark et" teklifi (hukukçu cevabıyla App Store'a) → isteğe bağlı B3+ Canlı Etkinlik.

## 5. Testler

`PLAN.v1.md` §5.3'teki yeni testler; bilerek değişen iki beklenti (`notifyApply.test.js` kimlik sayısı,
`registry.test.js` modül listesine `walk`); değişmeden yeşil kalması gerekenler (`notifyPlan`, `reminders`, `notifyLog`,
`today`, `dataHub`, `consent`, `alarm`, `coach`, yoga ve Y1 testleri, bütün takım). Eşdeğerlik: yeni özellik kapalıyken
`planAll` ≡ `planNotifications`, 20.000 rastgele bağlam; taban, ana oturumun gece düzeltmesini içeren commit. Karar 2'nin
teklifine ek test: 14 günde ≤ 1, toplam ≤ 3, iki "Hayır"dan sonra yok, iOS penceresi daha önce gösterildiyse Ayarlar yolu.

## 6. Cihaz listesi

`PLAN.v1.md` §6'daki durum çizelgesi ve cihaz listesi (ortak, B1, B2, B3). Karar 2 için ek: anahtar kapalıyken kaçırılan
yürüyüşten sonra teklifin gelmesi; [Aç] ile iOS "Her Zaman" penceresi; ikinci kez Ayarlar'a götürmesi; açıldıktan sonra
sorunun yürüyüşün kaçıncı dakikasında geldiği; kapatınca bir gün boyunca uygulamanın arka planda açılmaması.

## 7. Açık sorular ve bekleyenler

- **Hukukçu** (`S0/hukukcu-sorulari.md`'ye eklenecek): `walk` rızasının kapsamı; "Her Zaman" konumun "yer değişti" sinyali
  olarak kullanılması; kullanım saati analizinin rıza gerektirip gerektirmediği. Ad gelmezse onaylı yedek: "Her Zaman"
  App Store'a gitmez; hava konumsuz (il/ilçe seçimi).
- **Apple:** AlarmKit durdurma niyetinde ağ isteğinin yetişip yetişmediği; Swift'in kurduğu bildirimin dokunuşunun
  Capacitor'a ulaşması; atfın bildirimde yeterliliği; "Her Zaman" izni için App Review; App Store etiketinde telefonda
  kalan verinin durumu. Hepsi cihazda ve App Store Connect'te doğrulanır.
- **Ücretli işler (sahibin onayıyla):** sesli koç parçaları (iki ses × ≈ 65); Nef bankasının üretimi (≈ 1 USD / sürüm).
- **Tasarım kapısı bekleyenler:** B3'ün "fark et" teklifi ve açıklama sayfası; Profil → Bildirimler'in "Gece sessizliği"
  ayar sayfası; yarım yürüyüş kurtarma sorusu.

## 8. Ana oturuma bu işin dışındaki bulgular (düzeltilmedi)

1. Gece "kalk": çalışma oturumu bildirimleri 09–21 penceresine bakmıyor ve `timeSensitive` (ana oturum düzeltiyor).
2. Başka gece yolları: Çalışma günleri saati pencereye bakılmadan kuruluyor; 7302 deneme bildirimi denemenin başladığı
   saate kuruluyor (23.40'ta başlayan deneme 5 gün sonra 23.40'ta çalar); 7301 molanın bittiği ana.
3. Oturumun son bildirimi ile aynı dakikadaki hatırlatma bugün de üst üste gelebilir (`inFocus` bitiş anını dışarıda
   bırakıyor).
4. AlarmKit ertelemesi geri sayım sunumu kullanıyor, projede widget uzantısı yok; Apple: "the system may unexpectedly
   dismiss alarms and fail to alert" (`arastirma/apple-hava-bildirim.md` §9). Alarmın çalmama riski.
5. `YOL.nef.md` §14, Kim 2020 ve Wolffsohn 2025'in `lib/sources.js`'te olduğunu söylüyor; yoklar (yalnız `evidence.js`'te
   metin).
6. `SONSUZ_YOL.PLAN.v1.md` §E.6 ve §E.7'deki satır atıfları kaymış (`App.jsx` plan kurulumu, `Home.jsx` tarih satırı).
