# PLAN.v1 (tur 1 düzeltmeli) ve DEVIR · Doğruluk ve tutarlılık eleştirisi, tur 2 (bağımsız denetçi, 2026-09-30)

İncelenenler: `PLAN.v1.md` (709 satır), `DEVIR.md` (117 satır), `tasarim.html` (yalnız metinleri). Bağlam için okunanlar:
`SAHIP_ISTEKLERI.md`, `elestiri-dogruluk.md` (tur 1), `arastirma/*.md`, `arastirma/apple*/`, `BILDIRIM_PLANI.md`.
Karşılaştırılan kod: `app/src/lib/{reminders,notifyPlan,notifyLog,notifyApply,alarm,alarmNative,consent,dataHub}.js`,
`dataHub.test.js`, `consent.test.js`, `modules/registry.test.js`, `screens/Reminders.jsx`, `App.jsx`,
`app/ios/App/App/{HealthPlugin,AlarmPlugin}.swift`. Karakterler Python `len` ile sayıldı. Hiçbir dosya değiştirilmedi,
git kullanılmadı.

Önem derecesi: **yüksek**, plan uygulanırsa yanlış davranış, kırılan test ya da iç çelişki çıkar; **orta**, yanlış ya da
eksik bilgi, plan ile tasarım arasında fark var; **düşük**, izlenebilirlik ya da ifade sorunu.

---

## 1. Tur 1'in 34 bulgusu: hangisi düzeldi?

| # | Durum | Not |
|---|---|---|
| Y1 pencere | **Kısmen** | Legacy türler 09.00–21.00'e bağlandı, nefes örneği 09.15 oldu. Ama tur 1'in açıkça yanlış dediği "Gece 22.00–08.00" cümlesi §1'de duruyor (T2-Y1). Yol örneği pencerenin dışında kaldı (T2-Y3). |
| Y2 legacy çok saat | **Yanlış düzeltildi** | Sahip 3 saate karar verdi, §2'ye satır eklendi. Ama §A.1 kendi içinde çelişiyor. Günlükte saat sayısını tutmak `notifyLog.js`'i değiştirmeyi gerektiriyor, oysa plan bu dosyayı "dokunulmaz" sayıyor (T2-Y4). |
| Y3 timeSensitive | Düzeldi | §2'de satır var. |
| Y4 eşdeğerlik | **Kısmen** | Gece kuralı yeni kaynaklarla sınırlandı. Ama §5.3'teki "23.00–07.00'de alarm dışında bildirim yok" testi eski kaynaklarda da aranıyor (T2-O3). |
| Y5 geçici kesin konum | Düzeldi | §C.2 ve §4 Info.plist listesinde var. |
| Y6 WeatherKit atfı | Düzeldi | Bağlayıcı cümle `apple-json/weatherkit_get-started.txt`'te aynen geçiyor. |
| Y7 §2 satırları | Düzeldi | Dört satırın dördü de var. |
| O1 Stecher, O2 Fincham, O3 Morrison, O4 Evans, O5 Morris, O6 Werner/Gilgen-Ammann, O7 Togo/Ho/Yamanaka | Düzeldi | Yedi cümle de önerilen biçimde. |
| O8 tempo anonsu | **Kısmen** | "Verdiğim kararlar"a yazıldı. §C.3 "bilgi satırı bunu yazar" diyor, ama §C.2'deki bilgi satırı ±%4–8'i yazmıyor. |
| O9 karakter sınırları | **Kısmen** | Sınırlar yazıldı, ama planın kendi örnekleri bu sınırları aşıyor. Yürüyüş sorusu 84 karakter, planda 86 yazıyor (T2-O6). |
| O10 30/60 ve alarm | **Kısmen** | 30 ile 60 ayrıldı, alarm istisnası ve erteleme eklendi. Ama çakışma örneği 60 kuralını bozuyor (T2-O1) ve "iOS 25" diye bir sürüm yok (T2-O9). |
| O11 15 dk önce | **Kısmen** | Kural ve nefes örneği düzeldi. Üç örnek hâlâ kurala uymuyor (T2-D4). |
| O12 yürüyüş sorusunun izni | **Kısmen** | İzin sütunu düzeldi. `health` rızasıyla çelişki var (T2-O8), WalkGuard cümlesi eksik (§4 aşağıda). |
| O13 BGAppRefresh | Düzeldi | `fetch`, `BGTaskSchedulerPermittedIdentifiers` ve `AppDelegate` yazıldı. |
| O14 bütçe | **Kısmen** | Ufuk kuralı yazıldı. Legacy türlerin ek saatleri hesaba katılmadı (T2-O2). |
| O15 ses parçaları | **Kısmen** | "Süre" seçeneği kalktı, "bu kalıpta" ifadesi düzeldi. Parça sayısı hâlâ eksik (T2-O5). |
| D1–D5, D7, D8, D10–D12 | Düzeldi | |
| D6 §9 "planda anılanlar" | **Düzelmedi** | Carter 2016, Van den Bulck 2007 ve Brosnan 2024 yalnız §9'da geçiyor (satır 681–682); metinde yoklar. |
| D9 bilim satırı | Düzeldi (not) | Dolunay satırının kaynağı Laborde 2022, 223 çalışmayı toplayan bir analiz; kişi sayısı yok. Kanıt kapısı buna göre yazılsın. |
| Türkçe 1, 2, 4–8 | Düzeldi | |
| Türkçe 3 ve 9 | **Planda düzeldi, tasarımda kaldı** | `tasarim.html`: "Apple Watch da takılıysa birkaç dakika farklı görünebilir."; "Bedeli: bazı kişilerde güvensizlik ve App Review'da gerekçe." |
| Türkçe 10 | **Düzelmedi** | §A.1 tablosu: "aynı güne 30 dk'dan yakın düşerse". |

---

## 2. Yeni bulgular

### A. Yüksek

#### T2-Y1 · Gece için üç ayrı saat yazılmış
- **Yer:** §1 "gece 22.00–08.00 alarm dışında hiçbir bildirim gelmez"; §A.4 tablosu "Hiçbir bildirim | 23.00–07.00";
  §C.1 yürüyüş sorusu "07.00–23.00"; §5.3 "22.10'da yürüyene soru gider"; `tasarim.html` Bildirimler "Gece sessizliği
  22.00–08.00 · değiştir"; DEVIR §2 "23.00–07.00".
- **Sorun:** Kişiye verilen söz (§1) ve tasarımdaki varsayılan 22–08. Planlayıcının kuralı, testler ve DEVIR ise 23–07.
  22–08 geçerli olursa planın kendi testi yanlış çıkar: 22.10'daki yürüyüş sorusu gece sessizliğine düşer. Sakin
  pratiklerin 08.00'deki başlangıcı da sessizliğin tam sınırına denk gelir. Tur 1'in Y1'i bu cümleyi zaten işaretlemişti.
- **Kanıt:** PLAN satır 23, 229, 231, 411, 550; tasarim.html satır 884; DEVIR satır 41–42.
- **Düzeltme:** §1: "Gece 23.00–07.00 arası alarm ve alarma bağlı sabah havası dışında hiçbir bildirim gelmez (saatleri
  Bildirimler'den değiştirebilirsin)." Tasarım: "Gece sessizliği · 23.00–07.00 · değiştir". §A.4'e: "Varsayılan gece
  sessizliği 23.00–07.00'dir."

#### T2-Y2 · Sabah havası kendi gece kuralını ve testini bozuyor
- **Yer:** §1 "06.10'da Nef: …"; §A.4 tablosu "Hiçbir bildirim | 23.00–07.00 (alarm dışında)"; "01.00–05.00 hiçbir
  ayarla açılmaz"; §5.3 "23.00–07.00'de alarm dışında bildirim yok".
- **Sorun:** 06.10'daki sabah havası alarm değil, bir bildirim. Kural "alarm dışında" diyor. Öyleyse 06.10 bildirimi
  yasak, 20.000 ayarlık test de ilk alarmlı senaryoda kırılır. 30 dakika kuralında "alarma bağlı sabah havası" istisnası
  yazılmış, gece kuralında yazılmamış. Ayrıca vardiyalı çalışan biri alarmı 04.30'a kurarsa sabah havası 04.40'a düşer,
  yani 01.00–05.00 aralığının içine.
- **Kanıt:** PLAN satır 14, 212, 231, 234, 541.
- **Düzeltme:** Tabloda "23.00–07.00 (alarm ve alarma bağlı sabah havası dışında)". §A.4'e: "Alarma bağlı sabah havası
  alarmla gelir. 01.00–05.00 arasına düşerse gönderilmez." Test aynı istisnayla yazılsın.

#### T2-Y3 · Yol hatırlatmasının önerilen saati kendi penceresinin dışında
- **Yer:** §A.2 "Yolunu her gün hatırlatayım mı? Genelde 08.30'da başlıyorsun."; §A.1 tablosu "routine … window `move`"
  (09.00–21.00); `tasarim.html` yol kartında önerilen saat "08.15".
- **Sorun:** "15 dakika önce" kuralı 08.15'i veriyor, ama `move` penceresi 09.00'da açılıyor. Yani kartın önerdiği saat
  kurulamaz ya da planlayıcıda atlanır. Tur 1'in Y1'indeki hata yol örneğinde tekrar etti.
- **Kanıt:** PLAN satır 123, 139, 153–154; tasarim.html "Genelde 08.30'da başlıyorsun … 08.15".
- **Düzeltme:** Örnek "Genelde 09.30'da başlıyorsun" olsun, kartın sağında "09.15" yazsın. Ya da §A.3'e şu satır
  eklensin: "Önerilen saat pencerenin dışına düşerse pencerenin ilk saati önerilir ve nedeni söylenir: 'Genelde 08.30'da
  başlıyorsun; hatırlatmalar 09.00'da başlıyor.'"

#### T2-Y4 · Legacy türlerin ek saatleri: A.1 kendi içinde çelişiyor, günlük yazılamıyor
- **Yer:** §A.1 kod yorumu "ilk saat settings.reminders.types[legacy]'ye, ek saatler moduleReminders'a yazılır" (satır
  119–120); aynı bölümün son cümlesi "`moduleReminders` onlar için yalnız `mode`'u tutar" (satır 148–149); §1 "günlük
  türün o gün kaç saat kurulduğunu da yazar"; §2 "günlükte saat sayısı durur"; §5.2 "`lib/notifyPlan.js`, … **dokunulmaz**";
  §5.3 "`notifyLog.test.js` … değişmeden yeşil".
- **Sorun:** (1) İki cümle aynı alan için zıt şeyi söylüyor. (2) Günlüğü `notifyLog.js`'teki `clean()` yazıyor ve yalnız
  `date, type, eligible, arm, skipReason, plannedAt, tapped` alanlarını koruyor; bilinmeyen alanı siliyor. Günlüğe saat
  sayısı yazmak için `notifyLog.js` değişmek zorunda, ama bu dosya §5.2'nin listesinde yok. (3) Ek saatlerin kimliği
  (7400 aralığı tür başına günde tek kimlik veriyor) ve hangi zarla kurulacağı yazılmamış. `dice(seed, date, type)`
  deterministik olduğu için `planModuleReminders` aynı zarı yeniden hesaplayabilir; bu, cümle olarak yazılmalı.
- **Kanıt:** `app/src/lib/notifyLog.js:53-65` (`clean`); `notifyPlan.js:21-35` (`dice`), `:185` (kimlik).
- **Düzeltme:** A.1 son cümlesi: "Legacy türlerde ilk saat `settings.reminders`'ta kalır. İkinci ve üçüncü saat
  `moduleReminders[tür].times`'ta tutulur ve 7800–7859 aralığında kurulur. Zar `dice(seed, gün, tür)` ile yeniden
  hesaplanır; `arm` 'silent' ise o günün bütün saatleri kurulmaz." Günlük için iki yoldan biri seçilsin: ya "`notifyLog.js`
  `count` alanını tanır" diye §5.2'ye eklenir ve `notifyLog.test.js` "bilerek değişen" beklentilere taşınır, ya da §1 ile
  §2'deki "saat sayısı" cümlesi silinir.

#### T2-Y5 · "Bana hatırlat" ana anahtar olmadan çalışmaz; ana anahtar da molayı sessizce açar
- **Yer:** §A.2 (kart ve saat sayfası); §A.5 "Ana anahtar kapalıysa bütün satırlar gri"; §5.4 "'Bana hatırlat'tan
  kurulan nefes hatırlatması, Hatırlatmalar ekranından kurulanla aynı ayarı … üretir".
- **Sorun:** `planNotifications` `optIn !== 'yes'` iken hiçbir şey kurmuyor. Ana sayfa kartına hiç cevap vermemiş
  (`optIn: null`) biri nefeste "Bana hatırlat"a basarsa kurulan hatırlatma sessizce hiç gelmez. Bunu çözmek için `optIn`
  'yes' yapılırsa bu kez varsayılanı açık olan mola (`mola: { on: true, time: '12:30' }`) da kişi istemeden başlar.
  Plan ikisini de anmıyor.
- **Kanıt:** `app/src/lib/notifyPlan.js:115` (`if (r.optIn !== 'yes') return`); `reminders.js:23-26` (varsayılanda mola
  açık); `App.jsx:507`, `:680`.
- **Düzeltme:** §A.2'ye: "'Bana hatırlat' ilk kez açıldığında `optIn` 'yes' değilse 'yes' yazılır; kişi Ana sayfa
  kartına 'Evet' demediyse aynı anda `types.mola.on = false` yazılır. Yalnız seçilen tür açılır." Test: "optIn null iken
  nefeste Bana hatırlat → nefes kurulur, mola kurulmaz."

#### T2-Y6 · `notifyApply` Swift'in kurduğu bildirimleri iptal eder
- **Yer:** §5.2 "`lib/notifyApply.js` (kendi aralığına 7700–7719 ve 7800–7859 …)"; §A.4 "7710–7719 yürüyüş sorusu (Swift
  kurar …)"; §B.4 "7700'ü … aynı kimlikle yeniden kurar; … `planAll` o gün 7700'ü yeniden yazmaz".
- **Sorun:** `reconcile`, kendi aralığındaki her bekleyen bildirimi ya yeni plandakiyle aynıysa tutuyor ya da iptal
  ediyor. 7710–7719 kendi aralığa girerse, Swift'in kurduğu ve henüz bekleyen yürüyüş sorusu ya da "fark et" teklifi,
  uygulama bir sonraki açılışta planı kurduğunda silinir. `planAll` 7700'ü "yeniden yazmaz" diye plandan çıkarırsa da
  `reconcile`, Swift'in yenilediği 7700'ü "istenmeyen" sayıp iptal eder. Yani "yazmamak" korumak demek değil.
- **Kanıt:** `app/src/lib/notifyApply.js:86-94` (`if (!isOwnId(id)) continue … else cancel.push`).
- **Düzeltme:** §5.2: "`notifyApply` kendi aralığına 7700–7701 ve 7800–7859'u ekler; 7710–7719 Swift'indir ve hiç
  dokunulmaz. 'Yerelde yenilendi' işareti varken 7700 bekleyen hâliyle tutulur (iptal ve yeniden kurma yok)." §5.3'e test:
  "yerelde yenilenmiş 7700 ve bekleyen 7712 `reconcile`'dan sonra yerinde."

#### T2-Y7 · "Değişmeden yeşil kalmalı" denen iki test kesin kırılır; veri merkezinde yürüyüşün yolu yok
- **Yer:** §5.3 "Değişmeden yeşil kalmalı: … `dataHub.test.js`, `consent.test.js` …" ve "Başka hiçbir mevcut beklenti
  değişmez; değişmesi gerekirse iş durur"; §C.2 "`dataHub.js` bu anahtarı okur; modül `walk`: `progress.domain: 'body'`,
  `metrics`: haftalık yürüyüş dakikası".
- **Sorun:** (1) `dataHub.test.js`, canlı her modül için `sessions.match` ya da `OTHER_ROUTE` kaydı arıyor. `walk`
  kaydını `sessions`'a yazmadığı için test kırılır; `OTHER_ROUTE`'a `walk` eklenmesi gerekir. (2) `consent.test.js:74`
  `CONSENT_VERSIONS`'ı birebir `{ profileSync, health, coach, coachLife }` diye sınıyor. `walk`, `walkDetect` ve
  `weather` eklenince kırılır. (3) `hub()` yalnız `tests`, `sessions`, `profile` ve `habits` alıyor. `metrics` de
  `progress.js` üzerinden yalnız `sessions`'tan hesaplanıyor. `progress.domain` yazmak `walk-log`'u merkeze taşımaz;
  `hub()`, `domainDays`, `firstDay` ve `exportData.js` için yeni bir girdi gerekir. (4) `weather` rızası kodda hiç yok;
  "v1 iki satırla genişler" demek yanlış, bu rıza yeni yazılacak.
- **Kanıt:** `app/src/lib/dataHub.test.js:7-21`; `consent.test.js:74`; `dataHub.js:78-100` (`hub` imzası);
  `consent.js:13` (`CONSENT_VERSIONS`).
- **Düzeltme:** §5.3 "Bilerek değişen beklentiler"e şu satır eklensin: "`dataHub.test.js` (`OTHER_ROUTE`'a `walk:
  'walk-log (Beden; bilerek sessions dışında)'`), `consent.test.js` (`CONSENT_VERSIONS`'a `weather: 1, walk: 1,
  walkDetect: 1`)." §C.2: "`hub()` yeni bir `walks` girdisi alır; Beden alanına habit kalıbıyla girer; haftalık dakika
  `dataHub.js`'te hesaplanır. `exportData.js` ve Gelişim ekranı da bunu okur." §5.2'ye `lib/exportData.js` ve Gelişim
  ekranının dosyası eklensin. §B.1: "`weather` rızası (onaylı §3.E.2 metni ve iki yeni satır) ilk kez yazılır."

### B. Orta

#### T2-O1 · Çakışma örneği 60 dakika kuralını bozuyor
- **Yer:** §A.2 ve tasarım: *"12.30'da Mola hatırlatman var. … 13.00'ü öneriyorum."*; §A.4 "Kurulum anında 60,
  planlamada 30 dakika: ilki ayar kuralı (bugünkü `MIN_GAP_MIN`)"; §A.3 "Başka bir bildirimle arası 60 dakikadan azsa bir
  sonraki uygun dilime kayar".
- **Sorun:** 13.00 ile 12.30 arası 30 dakika. Kurulum kuralına göre öneri 13.30 olmalı. Ayrıca bugünkü `MIN_GAP_MIN`
  (`timeError`) yalnız deney türleri ve Çalışma günleri arasında geçerli. Modül hatırlatmaları ve legacy türlerin ek
  saatleri için bu kural yeni; "bugünkü" demek yanıltıyor.
- **Kanıt:** `reminders.js:87-89`.
- **Düzeltme:** Örnek şöyle olsun: *"12.30'da Mola hatırlatman var. Arada bir saat kalsın diye 13.30'u öneriyorum."*
  [13.30'a al]. Tasarımdaki saat ve Bildirimler satırı da "10.00 · 13.30 · 18.00" olsun. §A.4: "Kurulumda en az 60 dakika
  (deney türleri arasında bugünkü `MIN_GAP_MIN`; aynı kural modül hatırlatmalarına ve ek saatlere de uygulanır)."

#### T2-O2 · Deney bildirimiyle birleştirme, günlük tavan ve bütçe tanımsız
- **Yer:** §A.2 "Kişi yine de 12.30'da ısrar ederse ikisi tek bildirimde birleşir"; §A.4 (1) "aynı 30 dakikaya düşen modül
  hatırlatmaları birleşir"; "günde en çok 6 bildirim; fazlası birleşir"; bütçe "48 … sabah havasıyla 50".
- **Sorun:** Mola bir deney türü. Onaylı plana göre "Sessiz kalan türün yerine başka tür gönderilmez" ve "Tavan … ölçümü
  bozuyordu". Molanın sessiz gününde birleşik metin "Mola" dememeli. Molanın gönderildiği günde de birleştirme deney
  bildiriminin metnini ve kimliğini değiştirir. Legacy ek saatleri 6'lık tavana sayılırsa deney birleştirilip bozulur.
  Bütçe de bu ek saatleri saymıyor: 4 tür × 2 ek saat × 3 gün = 24 bildirim, 50 + 24 = 74, yani 60 sınırının üstü.
- **Kanıt:** `BILDIRIM_PLANI.md` §3 ("Ayrı bir toplam tavan … yok"), §6 ("Sessiz kalan türün yerine başka tür
  gönderilmez").
- **Düzeltme:** §A.4'e: "Deney bildirimi hiçbir zaman birleştirilmez ve tavana sayılmaz. Deney saatine 60 dakikadan
  yakın modül hatırlatması kurulamaz (ısrar seçeneği yok). Legacy ek saatleri deney bildirimidir (aynı zar, birleşmez) ve
  bütçede önce gelir; en kötü durum 48 + 2 + 24 = 74 olduğu için ek saatlerin ufku 1 gündür." Bütçe cümlesi buna göre
  yeniden hesaplansın.

#### T2-O3 · Gece sessizliği ayarı deney kuralıyla ve eşdeğerlikle çatışıyor
- **Yer:** §A.4 "Gece sessizliğinin başlangıcı 21.00–24.00 … hareket bildirimleri her ayarda sessizlik başlamadan en az
  bir saat önce biter"; "Deney türünün saati kaymaz ve onaylı nedenler dışında düşmez"; §5.3 "23.00–07.00'de alarm dışında
  bildirim yok" (20.000 rastgele ayar).
- **Sorun:** Sessizlik 21.00'e alınırsa 20.00–21.00 arasındaki deney molası "hareket" olarak düşer. Bu, onaylı
  nedenlerden biri değil ve günlükte `skipReason` karşılığı da yok. Ayrıca test bütün bildirimleri kapsıyor. Oysa
  Çalışma günleri (pencere yok), çalışma oturumu ve 7302 `planNotifications` ile `restNotify`'dan geliyor ve bu plan
  onlara dokunmuyor. Ana oturumun gece düzeltmesi bunları kapsamıyorsa test kırılır.
- **Düzeltme:** "Sessizlik ayarı yalnız yeni kaynaklara uygulanır. Deney türleri bugünkü 09.00–21.00'de kalır; sessizlik
  21.00'den önce başlatılamaz (başlangıç aralığı 22.00–24.00)." Test: "Yeni kaynaklardan hiçbiri sessizlikte değil;
  eski kaynaklar taban commit'teki gibi."

#### T2-O4 · §1'deki gerekçe §2 ile çelişiyor: B1 gece "kalk" sorununu kapatmıyor
- **Yer:** §1 karar 1 "Gerekçe: B1 gece 'kalk' sorununu kalıcı kapatır"; tasarımda "bildirim çekirdeği gece 'kalk'
  sorununu kalıcı kapatır"; §2 "Ana oturuma bildirilecek (bu planın işi değil). (1) Gece 'kalk' … B1 bunlara dokunmaz";
  §1 "21.00'den sonra 'kalk' gelmez".
- **Sorun:** Gece "kalk" bildirimi çalışma oturumundan geliyor ve onu ana oturum düzeltiyor. B1 yalnız yeni kaynaklarda
  gece kuralı kuruyor. Sahip, planın vermediği bir güvenceye bakarak sırayı onaylamış oluyor.
- **Düzeltme:** "Gerekçe: gece 'kalk' sorununu ana oturum şimdi düzeltiyor. B1, yeni gelecek her bildirimin de geceye
  düşmemesini tek planlayıcıda sağlar ve her modüle aynı anda değer katar." Tasarımdaki cümle de böyle değişsin.

#### T2-O5 · Ses parçası sayısı (≈ 65) eksik
- **Yer:** §C.3 "Parçalar: 28 dakika (3–30), 12 saniye (0–55), 15 kilometre sırası, ≈ 10 sabit cümle → ses başına ≈ 65";
  "Bu kalıpta sayılar ek almadığı için parça birleştirmek güvenlidir"; §C giriş *"Birlikte yürüyoruz. 1,1
  kilometredesin."*; DEVIR "ses başına ≈ 65".
- **Sorun:**
  1. 10'a ve 5'e yuvarlama ayrı parça istemez. 10'un katları 5'in katlarının içinde; "0 saniye" söylenmeyeceği için 11
     parça (5–55) yeter.
  2. Kilometre cümlesi *"9 dakika 50 saniye**de**"* ek alıyor. Tempo cümlesi *"40 saniye."* ek almıyor. Saniye 0 çıkarsa
     kilometre cümlesi *"10 dakika**da**"* olur. Yani 11 "saniyede" ve 28 "dakikada" parçası daha gerekir.
  3. Açılış cümlesi *"1,1 kilometredesin"* ondalıklı bir sayı ve ek istiyor. 800 m eşiğinden sonra 0,8–3 km için ≈ 20
     parça daha çıkar.
  4. "Son 500 metre" ve "Son 250 metre" iki ayrı sabit parça.

  Bugünkü cümlelerle doğru sayı ses başına ≈ 120'dir. "Sayılar ek almaz" iddiası kilometre cümlesi için yanlış.
- **Düzeltme:** Cümleler ek almayacak biçime getirilsin: *"1. kilometre: 9 dakika 50 saniye."*, açılış *"Birlikte
  yürüyoruz."* (sayı ekranda). O zaman parçalar 28 + 11 + 15 + ≈ 12 sabit = ses başına ≈ 66, iki ses için ≈ 132 olur.
  Bu değişmezse sayı "≈ 120 / ses, ≈ 240 kayıt" diye düzeltilsin. DEVIR ve §7 de buna göre güncellensin.

#### T2-O6 · Planın kendi örnekleri karakter sınırlarını aşıyor
- **Yer:** §A.6 "başlık ≤ 30. Bilim satırı yoksa gövde ≤ 110; varsa Nef cümlesi ≤ 70"; §C.1 "(86 karakter)".
- **Sorun (Python `len` ile sayıldı):**
  - Sabah havası gövdesi 107 karakter. Son satır *"Kaynak: Apple Weather"* ile birlikte 129, yani 110'un üstünde.
  - Başlık "Gaziemir 17°, akşam yağmur" 26 karakter. §B.2'nin en uzun ilçe örneğiyle ("Mustafakemalpaşa 17°, akşam
    yağmur") 34, yani 30'un üstünde.
  - Yürüyüş sorusu 84 karakter (planda 86 yazıyor). Bilim satırı önceliğinde yürüyüş 2. sırada; bilim satırı eklenirse
    Nef cümlesi 84 > 70.
  - "Takvim anı" örneği 75, "Aradan dönüş" örneği 76 karakter. Dolunayın bilim satırı taşıdığı yazılı; iki cümle de
    70'i aşıyor.
- **Düzeltme:** §A.6'ya: "Kaynak satırı gövdeye sayılır. Başlıkta ilçe adı 14 harften uzunsa yalnız sıcaklık ve durum
  yazılır ('17°, akşam yağmur'). Sabah havası ve yürüyüş sorusu bilim satırı taşımaz." Sabah gövdesi 110'a indirilsin
  (öneri T2-O7'de). "(86 karakter)" → "(84 karakter)". Dolunay: *"Bu gece dolunay. Aya bakarak 3 dakika yavaş nefes."*
  (50 karakter).

#### T2-O7 · Sabah havası metni kendi kurallarına uymuyor
- **Yer:** §1, tasarım: *"En çok 26°. 21.00–22.00 arası yağmur bekleniyor; yürüyüşü 20.30'dan önce bitirirsen
  şemsiyeye gerek kalmaz."*; §B.4 "yağmur varsa ilk cümle yağmur"; §A.6 örnek "…şemsiyeye gerek kalma**yabilir**";
  tasarımdaki hava sayfası: 20.00'de yağmur olasılığı %45.
- **Sorun:** Gövdenin ilk cümlesi yağmur değil, sıcaklık. "Gerek kalmaz" kesin bir söz; oysa aynı tasarım 20.00'de %45
  yağmur olasılığı gösteriyor. Bu, "bekleniyor" dilinin ve planın kendi örneğinin tersi. Hava sayfasındaki yorum da aynı
  kesinlikte.
- **Düzeltme:** Gövde: *"21.00–22.00 arası yağmur bekleniyor; yürüyüşü 20.30'dan önce bitirirsen şemsiyeye gerek
  kalmayabilir."* (93 karakter). "En çok 26°" başlığa geçsin: "Gaziemir 17° · en çok 26°" (25 karakter). Hava
  sayfasındaki yorum da "kalmayabilir" olsun.

#### T2-O8 · `walk` rızası ile `health` rızası çatışıyor
- **Yer:** §4 tablosu (yürüyüş sorusu: "Apple Sağlık'ın arka plan okuması", rıza `walk`); "`health` v2 rızası değişmez:
  yeni amaçlar `walk` rızasına yazılır"; §C.2 "Bitişte … Apple Sağlık toplamı okunur".
- **Sorun:** `health` metninde "Ne kadar: … geri çekince Nefona bu verileri okumaz" yazıyor. "Ne" satırı arka plan
  okumasını yalnız "Yürüyüş hatırlatması açıksa" diye sınırlıyor. `health`'i vermemiş ya da geri çekmiş ama `walk`'u
  vermiş bir kişide Apple Sağlık'ı okumak, `health` metnindeki sözü bozar. WalkGuard da bugün `avgSteps` olmadan (yani
  sağlık okuması olmadan) kurulmuyor.
- **Kanıt:** `consent.js:18-22`; `notifyPlan.js:181` (`walk && avg == null → noData`).
- **Düzeltme:** §4'e: "Apple Sağlık okumaları (arka plan uyanışı, bitişteki toplam) `walk` ile birlikte `health`
  rızasını da ister. `health` yoksa adım ve mesafe adım sayarından gelir (`stepsSource: 'phone'`), yürüyüş sorusu
  kurulmaz ve bitiş özetinde 'Apple Sağlık'a göre' yazmaz." Durum çizelgesine "`walk` var, `health` yok" satırı eklensin.

#### T2-O9 · "iOS 25" diye bir sürüm yok
- **Yer:** §B.4 "iOS 25 ve öncesinde 1. katmanın bildirimi ertelenen alarmla çakışabilir"; §6 cihaz listesi "iOS 25'te yaş
  metni".
- **Sorun:** Apple, iOS 18'den sonra doğrudan iOS 26'ya geçti. Ayrıca iOS 26'dan önce AlarmKit yok; alarm oralarda
  7600–7607 yedek bildirimleriyle çalışıyor ve erteleme davranışı farklı. Cihaz listesinde ayrıca "iOS 26'da `stopIntent`
  yetişmedi" durumu da olmalı: plan "yetişmezse 1. katman kalır" diyor.
- **Kanıt:** `alarmNative.js:3-10`; PLAN §6 "iOS 15, 16, 17, 26".
- **Düzeltme:** "iOS 26'dan önceki sürümlerde (AlarmKit yok, yedek bildirim alarmı) ve iOS 26'da durdurma niyeti
  yetişmezse, 1. katmanın bildirimi ertelenen alarmla çakışabilir." Cihaz listesi: "iOS 17'de yaş metni; iOS 26'da
  durdurma niyeti yetişmediğinde yaş metni."

#### T2-O10 · "Yürürken beni fark et" teklifi (§3.C.1 madde 4) rıza, kimlik ve kurallar bakımından eksik
- **Yer:** §C.1.4; §4 tablosu; §A.4 kimlikler; DEVIR §2 "7710–7719 yürüyüş sorusu ve 'fark et' teklifi"; §A.2 "reddedilen
  teklif 30 gün sorulmaz"; §8 VARSAYIM listesi.
- **Sorun:**
  1. Teklif bildirimi, `walk` verisinden (saatlik uyanış, kaçan yürüyüş) üretiliyor. Ama §4'te bu amacın satırı yok;
     `walk` rızasının "Neden" satırında da geçmiyor.
  2. Kimliği yalnız DEVIR'de var, planda yok.
  3. Metinde bir süre geçiyor ("20 dakika geç fark ettim"). "Kilit ekranında sayı gösterme" anahtarına bağlı olup
     olmadığı yazılmamış.
  4. "Gece kuralı geçerli" deniyor ama hangi pencere (07–23 mü, 09–21 mi) belirsiz.
  5. Ana sayfa teklif kuralı (reddedilirse 30 gün) ile bu teklifin kuralı (14 günde bir, toplam 3, iki "Hayır") ayrı ve
     ilişkileri belirsiz. Bu sınırların üçü ve 800 m eşiği VARSAYIM listesinde yok.
  6. Apple'a göre "Her Zaman" izni ancak uygulamanın "Kullanırken" izni varsa ve yalnız bir kez istenebilir ("If your
     app already has When in Use authorization, you can make a separate request for Always authorization later.
     However, you can make the request only once."). "Kullanırken" izni hiç verilmemiş kişide [Aç] önce "Kullanırken"
     penceresini açar. Plan bu durumu anlatmıyor.
- **Kanıt:** `arastirma/apple/corelocation__requesting-authorization-to-use-location-services.json`; PLAN satır 246–248;
  DEVIR satır 44–45.
- **Düzeltme:** §4'e satır: "'Fark et' teklifi | kaçan yürüyüşün süresi | Telefon | Hiçbir yer | `walk` ('Neden' satırına:
  'yürüyüşü geç fark edersem Her Zaman iznini önerebilirim') | —". §A.4'e: "7710–7714 yürüyüş sorusu, 7715–7719 fark et
  teklifi; pencere 09.00–21.00; kilit ekranı anahtarı kapalıysa süre yazılmaz." §C.1.4'e: "'Kullanırken' izni yoksa [Aç]
  önce onu ister; 'Her Zaman' sonraki yürüyüşün sonunda bir kez istenir." VARSAYIM listesine 800 m, 14 gün, 3 kez ve iki
  "Hayır" eklensin.

#### T2-O11 · Ana sayfa hava satırı: plan iki biçim anlatıyor
- **Yer:** §1 madde 2 *"İzmir Gaziemir · 23° · 21.00'de yağmur"*; §B "İlk 5 saniye" aynı tek satır; §B.2 kart
  ("23°", "İzmir Gaziemir", "21.00–22.00 yağmur bekleniyor", 12 saatlik çubuklar, "Apple Weather", "Veri kaynakları");
  tasarımın bölüm metni "Ana sayfada tek satır.".
- **Sorun:** Tur 1'de "sıradan" bulunan tek satırlık hâl, §1'de ve §B girişinde hâlâ kişiye anlatılıyor. Tasarımdaki
  ekran ise kartı gösteriyor. Ayrıca yer adının sırası tutarsız: kartta "İzmir Gaziemir", hava sayfasında "Gaziemir,
  İzmir".
- **Düzeltme:** §1 ve §B: "Ana sayfada adımların üstünde küçük bir kart: 23°, İzmir Gaziemir, '21.00–22.00 yağmur
  bekleniyor', önümüzdeki 12 saatin yağmur çubukları." Tasarım: "Ana sayfada adımların üstünde tek kart." Yer adının
  sırası tek biçime bağlansın ("Gaziemir, İzmir").

#### T2-O12 · Yürüyüş ekranındaki sayılar bildirimle ve §1 ile tutarsız
- **Yer:** Tasarım: 18.32'de gelen bildirim "Son 15 dakikada 1,1 km"; 18.51'deki ekran "Süre 00:18:42 · 1,94 km · 9'40"";
  §C "süre sayacı zaten akıyor (son 15 dakika eklenmiş)"; §1 "*1. kilometre 9 dakika 50 saniyede*".
- **Sorun:** Son 15 dakika eklendiyse yürüyüş ≈ 18.17'de başlamıştır; 18.51'de süre ≈ 34 dakika olmalı. 18:42 süre,
  yürüyüşün 18.32'de başladığı anlamına geliyor. Mesafe de uymuyor: ilk 15 dakikada 1,1 km yürüyen biri (13'38"/km)
  sonra 9'40" tempoyla 19 dakika daha yürüyünce toplam ≈ 3,1 km eder, 1,94 değil. §1'deki "1. kilometre 9 dakika 50
  saniyede" de 15 dakikada 1,1 km ile bağdaşmıyor. Sayılar "örnek" diye işaretli, ama 5 saniye testi bu ekranla yapıldı.
- **Düzeltme:** Ekran 18.51'de: "Süre 00:33:40 · 3,05 km · 9'40"". Bildirim: "Son 15 dakikada 1,3 km" (11'32"/km).
  §1'deki kilometre cümlesi "1. kilometre 11 dakika 30 saniyede" olsun ya da bu örnek bildirimle bağlantısız bir ana
  taşınsın.

#### T2-O13 · Tasarım, onayı ve tur 1 düzeltmelerini yansıtmıyor
- **Yer:** `tasarim.html` "Senden 3 karar" ve "Üç karar, her birinde önerim"; KARAR 2 metni; bitiş kartındaki
  *"Yarın da bu saatlerde, tek dokunuşla."*; KARAR 3 *"Güçlü bir model senin onayından geçen yüzlerce cümleyi bir kez
  üretir"*.
- **Sorun:**
  - Kararlar hâlâ "bekliyor" gibi sunuluyor; karar 2'de sahibin eklediği "kapalıyken bildirimle açmayı iste" yok.
  - Kartın alt yazısı planınkiyle aynı değil (§A.2: *"Her gün, senin için uygun saatte. Saati Nef de seçebilir."*).
  - KARAR 3'te sıra ters: cümleler önce üretilir, sonra onaylanır.
  - Tur 1'in Türkçe 3 ve 9'u tasarımda duruyor.
  - "Yürürken beni fark et" satırı Bildirimler ekranında yok.
- **Düzeltme:** Başlık "Onaylanan 3 karar (30 Eylül)". Karar 2'ye: "Kapalıyken Nef, geç fark ettiği bir yürüyüşten sonra
  açmayı bildirimle önerir." Kart alt yazısı planla aynı olsun. Karar 3: "Güçlü bir model yüzlerce cümle üretir; senin
  onayından geçenler uygulamaya girer." Türkçe düzeltmeleri de planla aynı olsun.

#### T2-O14 · Uykuya Geçiş istisnası pencereyle ve manifestle uyuşmuyor
- **Yer:** §A.4 "Uykuya Geçiş dersi istisnadır (yatma saatinden en çok 30 dk önce)"; yoga `calm` (08.00–22.00).
- **Sorun:** Yatma saati 23.00 ise ders 22.30'a düşer, bu da `calm` penceresinin dışı. `remind` modül düzeyinde bir alan;
  tek bir derse (yoga içindeki Uykuya Geçiş) istisna vermenin yolu tanımlanmamış.
- **Düzeltme:** "Uykuya Geçiş hatırlatması yoga modülünün ayrı bir `remind` girdisidir (`window: 'sleep'`, yatma
  saatinden 30 dk önce, en geç sessizlik başlangıcı)." Ya da istisna kaldırılsın.

#### T2-O15 · `bedtimeFor` üç günlük ufka yetmiyor
- **Yer:** §A.4 "yatma saati hesaplanabiliyorsa (`lib/alarm.js` `bedtimeFor`) yatmadan önceki 60 dakikada hatırlatma
  gelmez"; modül hatırlatmaları 3 gün önceden kurulur.
- **Sorun:** `bedtimeFor(next, now)` yalnız sıradaki çalışa bakıyor. Çalış 24 saatten uzaksa ya da yatma saati geçmişse
  `null` dönüyor. Bu yüzden yarının ve öbür günün hatırlatmalarında kural hiç işlemez.
- **Kanıt:** `app/src/lib/alarm.js:226-231` (`SLEEP_TARGET_H = 7`; `> 24 * HOUR` → null; geçmişse null).
- **Düzeltme:** "Her plan günü için o günün ertesi sabahki çalışından `SLEEP_TARGET_H` saat önce hesaplanır
  (`nextRing(alarm, günün 12.00'si)`); `bedtimeFor` yalnız bugün için kullanılabilir."

### C. Düşük

| # | Yer | Sorun | Düzeltme |
|---|---|---|---|
| T2-D1 | §C.1 "Günde en çok 2 soru … iki kez 'Şimdi değil' denirse o gün bir daha sorulmaz" | Günde en çok 2 soru varken "iki 'Şimdi değil'den sonra sorma" kuralı hiçbir durumu değiştirmez | "Bir 'Şimdi değil'den sonra o gün sorulmaz" |
| T2-D2 | §C.3 250 m ve 500 m aralıkları | Her tam kilometrede aralık anonsu ile kilometre anonsu üst üste gelir; sırası yazılmamış | "Tam kilometrede yalnız kilometre cümlesi söylenir" |
| T2-D3 | §1 "Verdiğim kararlar": "tempo son 250 metrenin ortalamasıdır" | Aralık artık seçilebiliyor | "tempo son aralığın (250 m / 500 m / 1 km) ortalamasıdır" |
| T2-D4 | §A.2 "Göz egzersizini genelde 10.00'da ve 18.00'de yapıyorsun. İkisinde de hatırlatayım mı?"; §A.3 "Nefesi son iki haftada 09.15'te yapıyorsun. Hatırlatmayı oraya alayım mı?" | "15 dk önce" kuralına uymuyor: ilki 09.45 ve 17.45'i, ikincisi 09.00'ı vermeli | "…İkisinden 15 dakika önce, 09.45'te ve 17.45'te hatırlatayım mı?"; "…Hatırlatmayı 09.00'a alayım mı?" |
| T2-D5 | §9 "Planda anılanlar" | Carter 2016, Van den Bulck 2007 ve Brosnan 2024 metinde geçmiyor (D6 sürüyor) | §A.4 Dayanak'a "(Carter 2016; Van den Bulck 2007; Brosnan 2024; yetişkinde Exelmans 2016)" |
| T2-D6 | Başlık "ONAYLANDI (sahip …: "1. senin öngördüğün şekilde, 2. kapalı ise …")" | Tırnak içinde ama sahibin sözü kelimesi kelimesine değil (`SAHIP_ISTEKLERI.md` satır 19) | "(sahip, 2026-09-30; sözleri aynen `SAHIP_ISTEKLERI.md`'de)" |
| T2-D7 | §B.4 katman 2 "7700'ü durdurma anından 10 dk sonraya" | 20 ve 30 dakika seçeneklerini görmüyor | "kişinin seçtiği süre sonrasına" |
| T2-D8 | §C.1.2 "WalkGuard gözlemcisi bugün yalnız yürüyüş hatırlatması açıkken başlıyor" | Koşul daha dar (aşağıda §4) | Metin §4'teki gibi |
| T2-D9 | DEVIR ile plan arasındaki farklar | (a) 7710–7719'daki "fark et" teklifi yalnız DEVIR'de; (b) DEVIR'de gözlemci "`walk` rızasıyla da başlar", planda "`walk` rızası ve 'Yürüyüş eşliği' açıkken"; (c) DEVIR §5'teki teklif testleri plandaki §5.3'te yok; (d) DEVIR'in Info.plist listesinde `fetch`/`BGTaskSchedulerPermittedIdentifiers` (koşullu) ve `NSSupportsLiveActivities` (B3+) yok; (e) bu raporun Y4–Y7 ve O8 bulguları DEVIR'de yok | Plan tek kaynak olsun: (a)–(c) plana işlensin, DEVIR yalnız atıf yapsın |
| T2-D10 | §1 "Her bildirimin arkasında bir PubMed çalışması durur"; §A.6 "her bildirim bir `evidence` anahtarı taşır" | 7302 deneme bildirimi, çalışma oturumu, alarm, "Kulaklık çıktı" ve fark et teklifi kaynak taşımıyor | "Her hatırlatma ve Nef bildirimi…" diye daraltılsın; istisnalar yazılsın |
| T2-D11 | §A.6 bilim satırı önceliği "kişinin kurduğu hatırlatma > yürüyüş > mola > su > hava" | Mola ve su da kişinin kurduğu hatırlatma; sıra iki okunuşlu | "modül hatırlatması > yürüyüş sorusu > deney türleri (mola, su) > sabah havası" |
| T2-D12 | §A.3 Peng 2022 | Kaynağın sınırı yazılmamış: "uygulama içi plan için ayrı tahmin yok" (`pubmed.md:31`) | Cümlenin sonuna "; uygulama içi planlama ayrıca ölçülmedi" |

---

## 3. Plan ile tasarım metinlerinin karşılaştırması

| Ekran | Tasarımdaki metin ya da sayı | Plan | Uyum |
|---|---|---|---|
| Sabah bildirimi | 06:10; "Gaziemir 17°, akşam yağmur"; gövde; "Kaynak: Apple Weather" | §1 ve §B.4 | Metin §1 ile aynı. İlk cümle yağmur değil, "gerek kalmaz" kesin, gövde 129 karakter (T2-O6, T2-O7) |
| Tarih | "Perşembe 1 Ekim" | — | Doğru (2026-10-01 perşembe) |
| Bitiş kartı (nefes) | "Bana hatırlat · Yarın da bu saatlerde, tek dokunuşla." · 09.15 | §A.2 "Her gün, senin için uygun saatte. Saati Nef de seçebilir." | **Farklı** (T2-O13) |
| Yol kartı | "Genelde 08.30'da başlıyorsun. Durak durak değil, tek hatırlatma." · 08.15 | §A.2; window `move` 09–21 | **Pencere dışında** (T2-Y3) |
| Nefes saat sayfası | "Nefesi genelde 09.30 ile 10.00 arasında yapıyorsun. 09.15'te hatırlatayım; iki hafta sonra yeniden bakarım." | §A.2 | Aynı |
| Nefes saat sayfası | "Günde en çok 3 saat seçebilirsin. Bazı günler neden gelmez?" | §A.2 pencere cümlesi "09.00–21.00 arasında, günde en çok 3 saat." | Pencere yazmıyor; "3 saat" iki kez geçiyor. "09.00–21.00 arasında, günde en çok 3 saat. Bazı günler neden gelmez?" olsun |
| Göz saat sayfası | 10.00 · 12.30 · 18.00; "…13.00'ü öneriyorum." | §A.2 aynı; §A.4 kurulumda 60 dk | Planla aynı, ama ikisi de 60 dk kuralına aykırı (T2-O1) |
| Yeniden giriş | "09.15 · açık"; "Tam zamanında. Dün bitirirken kendini 4/5 sakin işaretledin."; "3 dk · Sakin ritim"; "4 saniye al, 6 saniye ver" | §A.2 | Aynı |
| Bildirimler | "Bugünün düzeni · Hiçbiri üst üste değil"; "Sıradaki: 10.00 Göz egzersizi. Aralarında en az yarım saat var." | §A.5 | Aynı biçim |
| Bildirimler | "Sayılı nokta: yarım saat arayla gelen iki bildirim." | §A.5 "Dar ekranda 60 dakikadan yakın iki nokta tek noktada birleşir" | 390 pt'de de birleşik görünüyor; "Dar ekranda" koşulu tasarımda yok |
| Bildirimler | "Gece sessizliği 22.00–08.00" | §A.4 23.00–07.00 | **Farklı** (T2-Y1) |
| Bildirimler | "Yürüyüş eşliği · Yürürken sorar" | §A.5 Nef'in haberleri: Sabah havası, Yürüyüş eşliği, **Yürürken beni fark et** | "Fark et" satırı yok; "Kilit ekranında sayı gösterme" ve "Değiştirilemeyenler" de yok |
| Ana sayfa kartı | 23° · İzmir / Gaziemir · "21.00–22.00 yağmur bekleniyor" · şimdi–01 çubukları · Apple Weather · Veri kaynakları | §B.2 | Aynı. §1 ve §B girişi eski tek satırı anlatıyor (T2-O11) |
| Hava sayfası | "Gaziemir, İzmir · 12.40'ta alındı"; 26°/17°; yorum "…gerek kalmaz." | §B.3 | Yer adının sırası ve yorumun kesinliği (T2-O7, T2-O11) |
| Yürüyüş bildirimi | Metin; [Eşlik et] [Şimdi değil] | §C.1 | Aynı (84 karakter) |
| Yürüyüş ekranı | 00:18:42 · 9'40" · 1,94 km · 2.316 adım; "Bugün toplam 7.482 adım · Apple Sağlık"; [Koç · 250 m] | §C.2 | Düzen aynı; sayılar bildirimle tutarsız (T2-O12) |
| Koç ayarı | "Ne sıklıkla konuşayım?"; 250 m / 500 m / 1 km cümleleri; "Her tam kilometrede ayrıca…" | §C.3 | Aynı. "Kulaklık yokken hoparlörden" satırı tasarımda görünmüyor |
| Nef kartı (15.02) | "Hava 25 derece, yağmur akşam. Şimdi 10 dakikalık bir tur tam zamanında." | Planda bu ekran tanımlanmamış (bilim kartının üstündeki Nef cümlesi olmalı) | Planda karşılığı yok; Türkçe bozuk (§6) |
| Bilim kartı | "Bir denemede yürüyüş önerisi, sonraki 30 dakikada atılan adımı artırdı. 44 kişi · 6 hafta · Deneme · Etki haftalar içinde azaldı. Klasnja ve ark., 2019" | §A.6 | Aynı (DOI tasarımda yok) |
| Karar 1, 2, 3 | "Önerim…" | §1 | Onay yansıtılmamış (T2-O13, T2-O4) |

---

## 4. Kod iddialarının sınanması

| İddia (plan ya da DEVIR) | Kod | Sonuç |
|---|---|---|
| `bedtimeFor` ile yatma saati | `alarm.js:227-231`: sıradaki çalış 24 saatten uzaksa `null`; çalıştan 7 saat önce (`SLEEP_TARGET_H`); geçmişse `null` | İşlev var ve kural doğru, ama 3 günlük ufka yetmiyor (T2-O15) |
| `normalizeReminders` bilinmeyen alanı atar; Hatırlatmalar ekranı normalize nesneyi yazar | `reminders.js:47-71` yalnız `optIn, askedAt, types{mola,walk,breath,water,study}, thin, thinAsked` döndürüyor; `Reminders.jsx:195` `onSave({ ...r, optIn })` | **Doğru**. `times` dizisini `settings.reminders.types`'a koymak gerçekten silinir |
| WalkGuard "bugün yalnız yürüyüş hatırlatması açıkken başlıyor" | `notifyApply.js:100` korumaları yalnız planda **kurulan** yürüyüş bildirimleri için gönderiyor (`wanted.has(g.id)`); `notifyPlan.js:181-188` sessiz, `thin`, `noData` ya da `doneBefore` günlerinde bildirim yok; `HealthPlugin.swift:248-252` bugün ya da sonrası için koruma yoksa `stopLocked()` (arka plan teslimini de kapatır); `check()` bugünün koruması yoksa hiçbir şey yapmaz | **Eksik.** Doğrusu: "Gözlemci yalnız önümüzdeki 7 günde en az bir yürüyüş bildirimi **kuruluyken** (hatırlatma açık, sağlık ortalaması var, gün sessiz değil) çalışır; bugün bildirim yoksa uyansa da bakmaz; koruma kalmayınca arka plan teslimi kapatılır." "`walk` rızasıyla başlaması" `stopLocked` ile `check` koşulunun birlikte değişmesini gerektirir |
| `MIN_GAP_MIN` "bugünkü" kurulum kuralı, 60 | `reminders.js:18` `MIN_GAP_MIN = 60`; `:87-89` yalnız deney türleri ve Çalışma günleri arasında | Sayı doğru, kapsamı dar (T2-O1) |
| `Reminders.jsx` cümlesi | `Reminders.jsx:340` "Bazı günler bilerek göndermiyoruz; hatırlatmanın işine yarayıp yaramadığını Gelişim'de görmen için." | **Aynen doğru** (D2 kapandı) |
| `notifyApply` aralıkları 7400–7499, 7500–7509; 7301/7302 dışarıda; 7600–7607 alarm | `notifyApply.js:15-18`; `alarmNative.js:3-10` (7600 + gün, 7607 tek sefer) | **Doğru**. Yeni aralığa 7710–7719'u almak Swift'in bildirimini siler (T2-Y6) |
| "Günde 1 onaylı karar değil VARSAYIM'dı" | `BILDIRIM_PLANI.md` §1 "Her türden günde en çok 1 hatırlatma gelir (VARSAYIM)" | **Doğru** |
| "Günlükte saat sayısı durur" | `notifyLog.js:53-65` `clean()` bilinmeyen alanı atıyor | **Olmaz** (T2-Y4) |
| `planNotifications` optIn'e bağlı | `notifyPlan.js:115` | Planda yazmıyor (T2-Y5) |
| `dataHub` `walk-log`'u "okur" | `dataHub.js:78` `hub({ tests, sessions, profile, habits })` | Yeni girdi gerekiyor (T2-Y7) |
| `consent.test.js` değişmez | `consent.test.js:74` `CONSENT_VERSIONS` birebir | **Kırılır** (T2-Y7) |
| `registry.test.js` yalnız modül listesi değişir | `registry.test.js:32` `inSection('practice')` sırası da birebir | `walk` 'practice'e girerse ikinci beklenti de değişir; plan bunu yazsın |
| AlarmKit ertelemesi 9 dk | `AlarmPlugin.swift:67` | Doğru |
| "Uykuya Geçiş dersi" | `modules/yoga/*` içinde bir ders | Var; ama modül düzeyindeki `remind` ile istisna tanımlanamıyor (T2-O14) |

---

## 5. Sağlık iddiası ve "kanıtlandı" dili

- Plan ve DEVIR'de "kanıtlandı", "iyileştirir", "bilimsel olarak" yalnız yasak listesinde geçiyor. Tur 1'in kaynaksız iki
  etki cümlesi ("işe yarar", "orada işe yaradı") kalkmış.
- Kalan kesin sözler:
  1. Sabah ve hava sayfası: "şemsiyeye gerek kalmaz" (T2-O7).
  2. Karar 3, plan ve tasarım: "uydurma sayı olamaz". Doğru ifade: "model sayı yazamaz; sayıları telefondaki kod yazar ve
     testle sınanır".
  3. Nef kartı (tasarım 15.02): "Şimdi 10 dakikalık bir tur tam zamanında." "Tam zamanında" bir zamanlama üstünlüğü ima
     ediyor; plan "Sen karar ver"in üstünlüğünü bile söylemiyor. Öneri: "Şimdi 10 dakikalık bir tur için uygun bir an."
  4. §1 "Her bildirimin arkasında bir PubMed çalışması durur" fazla genel (T2-D10).
- Bilim satırları (Fincham, Klasnja, Morris) tur 1'deki düzeltilmiş hâlleriyle kaynağa uyuyor.

---

## 6. Türkçe: en önemli 10 örnek

| # | Yer | Metin | Sorun | Öneri |
|---|---|---|---|---|
| 1 | §A.1 tablosu | "aynı güne 30 dk'dan yakın düşerse" | "Güne yakın düşmek" bozuk (tur 1'de de vardı) | "aynı günde birbirine 30 dakikadan yakın düşerse" |
| 2 | Tasarım, Nef kartı | "Hava 25 derece, yağmur akşam." | Yüklem yok, sıra devrik | "Hava 25 derece; yağmur akşam bekleniyor." |
| 3 | Tasarım, karar 2 | "Bedeli: bazı kişilerde güvensizlik ve App Review'da gerekçe." | Yüklem yok; "gerekçe" bir bedel değil | "Bedeli: kimi kişi güvensizlik duyabilir; App Review gerekçe ister." |
| 4 | Tasarım, dürüst sınır | "Apple Watch da takılıysa birkaç dakika farklı görünebilir." | Özne yok | "Apple Watch da takılıysa ekrandaki adım Sağlık'taki sayıdan birkaç dakika farklı görünebilir." |
| 5 | Tasarım, karar 3 | "Güçlü bir model senin onayından geçen yüzlerce cümleyi bir kez üretir" | Mantık sırası ters | "Güçlü bir model yüzlerce cümle üretir; senin onayından geçenler uygulamaya girer." |
| 6 | §8 | "Canlı adım, Apple Watch da takılıyken Sağlık'la bir süre farklı görünebilir" | "Sağlık'la farklı" eksik | "…Sağlık'taki sayıdan bir süre farklı görünebilir" |
| 7 | §C.1.4 başlığı | "WhatsApp'ın anlık konumdaki gibi" | Tamlama eksik | "WhatsApp'ın anlık konum paylaşımında yaptığı gibi" |
| 8 | Tasarım, bölüm 1 başlığı | "Bitirdin, bir dokunuşla yarını kur" | "Yarını kurmak" anlamsız | "Bitirdin; yarınki hatırlatmanı bir dokunuşla kur" |
| 9 | §A.4 | "Kurulum anında 60, planlamada 30 dakika: ilki ayar kuralı (…), ikincisi planlayıcının güvenlik ağıdır." | Birimsiz sayı, yüklemsiz ilk kısım | "Kurulumda iki bildirim arasında en az 60 dakika aranır; planlayıcı ise en az 30 dakikayı güvence altına alır." |
| 10 | §1 madde 3 | "Dokununca Apple Watch gibi dört büyük sayı" | Benzetme eksik (tasarımda doğrusu var) | "Dokununca Apple Watch'taki gibi dört büyük sayı" |

Ek (daha küçük): §C.1.4 "bir yürüyüşü geç fark ettiyse ya da kaçırdıysa … 'Yürüyüşünü 20 dakika geç fark ettim.'"
cümlesi yürüyüşün kaçırıldığı durumda yanlış olur; o durum için ikinci bir cümle gerekir: "Bugünkü yürüyüşünü ancak
bittikten sonra fark ettim."

---

## 7. Doğrulandı (tur 2'de yeniden bakıldı, doğru bulundu)

- Tur 1'in yedi kaynak düzeltmesi (Stecher, Fincham, Morrison, Evans, Morris, Werner, Gilgen-Ammann) ve O7 (16–21 °C,
  Yamanaka eklendi) planda doğru.
- WeatherKit get-started cümlesi `apple-json/weatherkit_get-started.txt`'te aynen var.
- "Her Zaman" isteğinin yalnız bir kez yapılabildiği Apple sayfasında yazılı (§C.1.4'ün dayanağı doğru).
- Kimlikler: 7400–7499, 7500–7509, 7301, 7302 ve 7600–7607 kodla birebir.
- `Reminders.jsx` cümlesi aynen.
- 2026-10-01 perşembe (tasarım doğru).
- Karakter sayıları: Nefes bilim satırı 96, Mola 97, Yürüyüş 81, birleşik bildirim 52, yağmur sorusu 47, yaş metni 67;
  hepsi sınır içinde.
- §2'deki "Günde 1 VARSAYIM'dı" iddiası `BILDIRIM_PLANI.md` §1 ile doğrulandı.
- Sesli koçta 10 saniyelik ve 5 saniyelik yuvarlama ayrı saniye parçası istemez (10'un katları 5'in katlarının içinde);
  eksik parçalar yuvarlamadan değil, eklerden geliyor (T2-O5).
