# DEVİR · Bildirimler, hava ve yürüyüş eşliği (ana oturuma)

Tarih: 2026-09-30. Plan: `PLAN.v1.md` (**onaylandı**). Tasarım: `tasarim.html`
(https://claude.ai/artifact/8hZrrTGoMxnmqZuxTfjX1V). Sahibin sözleri: `SAHIP_ISTEKLERI.md`. Dayanaklar: `arastirma/`.
**Tek kaynak `PLAN.v1.md`'dir** (tur 2 düzeltmeli); bu belge özetler ve sıralar. Çelişki görürsen plan geçerlidir;
uygulama ayrıntıları plan §5.5'te. Bu oturum `app/` altında hiçbir dosyaya dokunmadı. Satır numarası verilmez; işlev ve dosya adıyla aranır (ana oturumun
işleri numaraları kaydırıyor; `arastirma/kod-haritasi.md`'deki `reminders.js` ve `habitLog.js` satır numaraları hatalı).

---

## 1. Onaylı kararlar

1. **Sıra:** yoga kodu ve Build 60 → **B1** bildirim çekirdeği ve "Bana hatırlat" → **B2** hava (onaylı Y5'in yerine) →
   Y2 → Y3 → Y4 → **B3** yürüyüş eşliği → Y6. Her parça ayrı TestFlight ve cihaz kapısı.
2. **"Yürürken beni fark et":** ayrı anahtar, varsayılan kapalı; "Her Zaman" konumla ≥ 500 m yer değişiminde uyanır.
   Kapalıyken Nef, kaçırdığı bir yürüyüşten sonra bildirimle açmayı teklif eder (WhatsApp'ın anlık konum paylaşımında
   yaptığı gibi; plan §3.C.1 madde 4: kime, ne zaman, metin, rıza sayfası, izin durum makinesi, sınırlar). Hukukçu
   cevabına kadar bu anahtar App Store'a gitmez (derleme bayrağı `NEFONA_WALK_DETECT`, Info.plist'te "Her Zaman" metni yok).
3. **Nef'in dili:** cümle bankası (model yalnız bankayı üretirken çalışır; sayılar ve saatler telefondaki koddan). Her
   hatırlatma ve Nef bildirimi bir PubMed kaynağına bağlı, dokununca bilim kartı açılır; görünür bilim satırı günde bir
   bildirimde. Kaynaksız istisnalar: alarm, 7302, çalışma oturumu, "Kulaklık çıktı", fark et izin teklifi (plan §A.6).
4. **Sahibin oturum içi kararları:** her modülde günde en çok 3 saat (nefes, mola, su, yürüyüş dâhil; deney gün
   düzeyinde, bir türün sessiz gününde bütün saatleri sessiz; ek saatlerin düzeni plan §5.5 madde 1); sesli koçta aralık 250 m / 500 m / 1 km kişinin seçimi,
   tam kilometrede aralık cümlesinin yerine o kilometrenin süresi; Ana sayfada hava için Apple'a soru gönderilmez, atıf kuralı satırın
   kendisinde karşılanır (işaret + "Veri kaynakları" bağlantısı).
5. **Plandaki "Verdiğim kararlar" tablosu** (itiraz gelmedi, geçerli): deney sessiz gününde yürüyüş sorusu yok (yalnız
   yürüyüş hatırlatmasını açmış kişide); yürüyüş sorusu kilit ekranında mesafeyi gösterir, "Kilit ekranında sayı gösterme"
   anahtarıyla; sesli koç sayıları söyler, aynı cümle ekranda; bildirimde sayılar rakamla, sıcaklık sözcüğü hissedilene
   göre; "ideal" yazılmaz; bilim satırında ölüm ve hastalık riski bulgusu yok; dolunay yalnız takvim anı; Nefona Apple
   Sağlık'a yazmaz.

## 2. Kod sözleşmesi (özet; ayrıntı `PLAN.v1.md` §3 ve §5)

- **Manifest yeteneği `remind`** (`modules/registry.js`): `route`, `legacy` ('mola'|'walk'|'breath'|'water'), `window`
  ('move' 09–21 | 'calm' 08–22), `defaultTime`, `maxTimes` (≤ 3), `doneToday`, `science` (sources.js anahtarları).
  `validateManifest` kuralları ve `reminders()` erişicisi. `remind` hatası yalnız `remind`'i düşürür, modülü değil
  (`remindProblems`). "Bana hatırlat" ilk kez açılınca `optIn` 'yes' olur, varsayılanı açık mola kapatılır. Ayar `settings.moduleReminders` (asla `settings.reminders`
  içine değil: `normalizeReminders` bilinmeyen alanı siler).
- **Yol birimdir:** yol içinde açılan modülde kart çıkmaz; yol bitince tek "Yolunu her gün hatırlatayım mı?" kartı.
- **Tek planlayıcı `planAll`** (`lib/notifyAll.js`): `planNotifications` (dokunulmaz) + `planModuleReminders` + sabah
  havası + yürüyüş sorusunun yasak dilimleri. Kurulumda iki bildirim arası ≥ 60 dk, planlayıcıda ≥ 30 dk
  (alarm ve alarma bağlı hava hariç); deney bildirimi (74xx) asla birleşmez, kaymaz, metni ve kimliği değişmez; yalnız
  elle seçilmiş iki modül hatırlatması birleşir; oturum sürerken modül hatırlatması yok; günde en çok 6 modül bildirimi;
  JS'in bekleyeni ≤ 58 (2 yuva Swift'e); tek `threadIdentifier: 'nefona'` (yalnız yeni özellik açıkken); eski teslim
  edilmişler uygulama açılınca kaldırılır (74xx hariç).
- **Gece kuralı (yeni kaynaklar):** hareket 09.00–21.00; sakin 08.00–22.00; deney türleri bugünkü kural; yürüyüş sorusu
  gece sessizliğinin dışı; fark et teklifi 09.00–21.00; varsayılan sessizlik 23.00–07.00 (alarm ve alarma bağlı sabah
  havası hariç); sessizlik Bildirimler'den 22–24 / 06–10 arası ayarlanır ve yalnız yeni kaynaklara uygulanır (sessizliğe
  düşen deney saati düşürülmez, Bildirimler'de uyarı); 01.00–05.00 hiçbir ayarla açılmaz (sabah havası dâhil);
  yatmadan önceki 60 dk yok (yatma saati her gün için ertesi çalıştan, `bedtimeFor` değil).
- **Kimlikler:** 7400–7499, 7500–7509, 7301, 7302, 7600–7607 dokunulmaz. Yeni: 7700–7701 sabah havası; 7710–7714 yürüyüş
  sorusu ve 7715–7719 fark et teklifi (Swift kurar; JS uzlaştırmaz, yalnız iptal eder); 7800–7859 modül hatırlatmaları;
  7860–7867 legacy ek saatleri. Kimlik kümeleri, bildirim kategorileri (Swift kurar; JS `registerActionTypes` çağırmaz),
  `cap_extra` biçimi ve dokunma sözlüğü: plan §5.5 madde 2–4.
- **Nef bankası:** yer tutuculu cümleler (`{rainFrom:LOC}`), model rakam yazamaz; saat ekleri tablodan; Swift'e hücre
  şablonları ve saat eki tablosu gider (plan §5.5 madde 7). B1a bankasız çıkar (elle yazılmış cümleler), B1b banka
  (madde 6: betik, ortam anahtarı, iki sahip onayı). Başlık ≤ 30, gövde ≤ 110 (bilim satırıyla Nef cümlesi ≤ 70, bilim ≤ 100, gövde ≤ 160).
- **Hava:** `SkyPlugin.swift` (WeatherKit, konum "Kullanırken", varsayılan yaklaşık); il yaklaşık konumdan, ilçe listeden
  (GeoNames ADM2, CC BY 4.0) ya da kesin konumda onayla; ters coğrafi kodlama yok; ilçe profile yazılmaz. Ana sayfa kartı
  `SkyLine.jsx` tek satırla takılır (Ana sayfa yeniden tasarlanıyor; bileşen yerinden bağımsız). Sabah havası: son
  açılışta kurulur (tahminin yaşı metinde), iOS 26'da AlarmKit `stopIntent` (iki alarm yolunda) seçilen yerin tablodaki
  kamusal noktası için taze tahminle aynı kimliği yeniden kurar; "yerelde yenilendi" günü JS 7700'ü tutar; 18 saatten
  eski tahminle kurulmaz. `SkyPlugin.setMorningKit`, `SkyPlugin.takeLocalRefresh`. İl/ilçe tablosu: plan §5.5 madde 8.
- **Yürüyüş:** modül `walk`; `WalkPlugin.swift` (CMPedometer, CMMotionActivity, konum oturumu + `CLBackgroundActivitySession`,
  geçici kesin konum, anons çalar, yarım yürüyüş durumu); kayıt `gozolcum:walk-log` (koordinat yok; `store.sessions`'a
  yazılmaz, Nef'e gitmez; veri merkezine `loadHubHabits` + `HABIT_DOMAIN.walk = 'body'` yoluyla); bitişte adım Apple
  Sağlık istatistik sorgusundan (yalnız `health` rızası varsa; yoksa `stepsSource: 'phone'`). WalkGuard gözlemcisi
  `walk` + `health` rızası ve Yürüyüş eşliği açıkken de çalışır (`stopLocked`/`check` birlikte). B3'ün `walk`'ı sonsuz
  yolun (e) modülünün ilk sürümü. Sesli koç `AppAudioSession`'a yürüyüş durumu; ses Profilim'den, koç ekranında seçim
  yok; ElevenLabs parçaları ses başına ≈ 66, `voice/tr/<female|male>/walk-*.mp3`.
- **Rızalar:** üçü de yeni yazılır: `weather` v1 (kodda yok; onaylı metin + ilçe ve sabah havası), `walk`, `walkDetect`.
  Taslaklar `rizalar-taslak.md`; sahip onaylamadan koda girmez. Rıza sayfası her zaman iOS izin penceresinden önce.
  `health` v2 değişmez; Apple Sağlık'ı okuyan her amaç ayrıca `health` ister.

## 3. Değişecek dosyalar

Yeni ve değişen dosyaların tam listesi `PLAN.v1.md` §5.1 ve §5.2'de. `lib/notifyPlan.js`, `lib/reminders.js`,
`lib/restNotify.js`'e dokunulmaz. Swift değişiklikleri (`AlarmPlugin`, `HealthPlugin`, `FeedbackPlugin`,
`MainViewController`, yeni `SkyPlugin`, `WalkPlugin`), `Info.plist` (`NSMotionUsageDescription`,
`NSLocationWhenInUseUsageDescription`, `NSLocationTemporaryUsageDescriptionDictionary`, `UIBackgroundModes` → `location`,
karar 2 için `NSLocationAlwaysAndWhenInUseUsageDescription` yalnız TestFlight iç derlemesinde; arka plan yenilemesi
yapılırsa `fetch` ve `BGTaskSchedulerPermittedIdentifiers`; B3+ için `NSSupportsLiveActivities`;
`NSHealthShareUsageDescription` güncellenir) ve `App.entitlements` (WeatherKit) Mac'te derlenir.

## 4. Sıra (her parçada: tasarım kapısı → kod → testler → iki inceleme → TestFlight → cihaz → sahip)

0. **B0 (kodun önü):** B1–B3 ve B3+ `YAPILACAKLAR.md`'ye `[ ]`; hukukçu soruları `S0/hukukcu-sorulari.md`'ye (plan §4);
   rıza taslakları sahibe; v2 bildirim sisteminin cihaz listesi B1 kodundan önce geçer ya da sahip bilerek atlar;
   eşdeğerlik tabanı dondurulur (plan §5.5 madde 5).
1. **B1a:** `sources.js` kayıtları ve kanıt kapısı (ilk adım; 11 kaynak ve koşullu olanlar, plan §5.5 madde 9) →
   `remind` sözleşmesi ve doğrulama → eşdeğerlik düzeneği → `moduleRemind.js` → `notifyAll.js` (ek saatler, kimlik
   kümeleri) → `notifyApply` (`actionId`, açılışta temizlik) → `RemindField`/`RemindSheet` → modüllere tek satır →
   Profil → Bildirimler (gece sessizliği sayfası dâhil) → bilim kartı → elle yazılmış cümleler → sürüm notu.
   **B1b:** Nef bankası (plan §5.5 madde 6). Tasarım kapısında yeni çizilecekler: Gece sessizliği sayfası, birleşik
   bildirim, Ana sayfa teklif yuvası.
2. **B2** (tasarım kapısında yeni: konum ve il/ilçe seçimi, "Gaziemir'de misin?", hava teklif kartı, `weather` rıza
   sayfası; Ana sayfa işi Ana sayfa tasarımı onaylandıktan sonra): `SkyPlugin` + `sky.js` + il/ilçe tablosu → `SkyLine` + hava sayfası → `weather` rızası ve gizlilik sayfası →
   sabah havası katman 1 → AlarmKit `stopIntent` katman 2 → (cihaz ölçümünden sonra karar) arka plan yenilemesi.
3. **B3** (tasarım kapısında yeni: `walk` rıza sayfası, bitiş özeti, yarım yürüyüş sorusu; fark et bildirimi ve rıza
   sayfası 5 saniyeden geçti, `5sn-tur5.md`, `5sn-tur6.md`) → `WalkPlugin` → `walk` modülü, ekran,
   kayıt ve veri merkezi → sesli koç (parçalar sahibin onayıyla üretilir; ücretli) → yürüyüş sorusu (saatlik yol) →
   `walkDetect` ve "fark et" teklifi (hukukçu cevabıyla App Store'a) → isteğe bağlı B3+ Canlı Etkinlik.

## 5. Testler

Plan §5.3'teki yeni testler. Bilerek değişen beklentiler: `notifyApply.test.js` (kimlik sayısı ve tam biçim),
`registry.test.js` (modül listesi ve `inSection` sırası), `dataHub.test.js` (`OTHER_ROUTE.walk`), `consent.test.js`
(`CONSENT_VERSIONS`). Değişmeden yeşil kalması gerekenler: `notifyPlan`, `reminders`, `notifyLog`, `today`, `alarm`,
`coach`, yoga ve Y1 testleri, bütün takım. Başka bir beklenti değişmek zorunda kalırsa iş durur ve sahibe sorulur.
Eşdeğerlik iki katmanda (plan §5.4 ve §5.5 madde 5).

## 6. Cihaz listesi

Plan §6'daki durum çizelgesi ve cihaz listesi (ortak, B1, B2, B3). Sonuçlar `cihaz-B1.md`, `cihaz-B2.md`,
`cihaz-B3.md`'ye. Karar 2 için ek: kaçırılan yürüyüşten sonra teklifin gelmesi; [İzin ver] → rıza → iOS penceresi, üç
izin başlangıç durumu ve "Bir Kez"; ikinci kez Ayarlar yolu; açıldıktan sonra sorunun kaçıncı dakikada geldiği;
kapatınca bir gün boyunca uygulamanın arka planda açılmaması.

## 7. Açık sorular ve bekleyenler

- **Sahibe soruldu (cevap gelince buraya yazılır):** B3'ün "Kullanırken" konumla hukukçudan önce çıkması (onaylı
  yedeğin değişmesi; plan §2 son satır). Hayırsa B3 konumsuz çıkar, mesafe adım sayarından.
- **Hukukçu** (`S0/hukukcu-sorulari.md`'ye eklenecek): `walk` rızasının kapsamı; "Her Zaman" konumun "yer değişti" sinyali
  olarak kullanılması; kullanım saati analizinin rıza gerektirip gerektirmediği; Soru 1'in güncellenmesi (ilçe, arka
  planda WeatherKit isteği). Ad gelmezse onaylı yedek: "Her Zaman"
  App Store'a gitmez; hava konumsuz (il/ilçe seçimi).
- **Apple:** AlarmKit durdurma niyetinde ağ isteğinin yetişip yetişmediği; Swift'in kurduğu bildirimin dokunuşunun
  Capacitor'a ulaşması; atfın bildirimde yeterliliği; "Her Zaman" izni için App Review; App Store etiketinde telefonda
  kalan verinin durumu. Hepsi cihazda ve App Store Connect'te doğrulanır.
- **Ücretli işler (sahibin onayıyla):** sesli koç parçaları (iki ses × ≈ 65); Nef bankasının üretimi (≈ 1 USD / sürüm).
- **Tasarım kapısı bekleyenler:** §4'teki parça başına listeler.
- **Kaynak açıkları:** U3 (su ↔ göz) kaynak yok, bankaya girmez; Klimek, Balban, Cajochen, Casiraghi kişi sayısı tam
  metinden; Moszeik kartındaki "alanın kalitesi düşük" cümlesinin kaynağı bulunmadan kullanılmaz
  (`arastirma/pubmed-bilim-satirlari.md`).

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
7. `lib/yogaLessons.js`'teki Radin 2025 atfı ("gerçek kullanım kısa"): çalışma yoga değil meditasyon RKÇ'si ve bu bulgu
   özette yok (`arastirma/pubmed-bilim-satirlari.md`).
8. `Info.plist`'te `NSHealthUpdateUsageDescription` duruyor, oysa Nefona Sağlık'a yazmıyor.
