# PLAN.v1 · Doğruluk eleştirisi (bağımsız denetçi, 2026-09-30)

İncelenen: `PLAN.v1.md` (644 satır). Karşısına konan kaynaklar: `arastirma/*.md`, `arastirma/apple/` ve `arastirma/apple-json/`
(DocC JSON'ları düz metne çevrilip arandı), `app/src`, `app/ios/App/App`, `SONSUZ_YOL.PLAN.v1.md`, `BILDIRIM_PLANI.md`,
`SAHIP_ISTEKLERI.md`, `S0/*.md`. PubMed E-utilities ile 27 PMID'in künyesi (esummary) ve 13 özet (efetch) bu oturumda
yeniden açıldı: 33322678, 30192907, 36624160, 34941558, 28046034, 42692370, 37005465, 39226046, 32396865, 35623448,
34065588, 22898122, 24784909. Hiçbir dosya değiştirilmedi; git kullanılmadı.

Önem: **yüksek** = plan uygulanırsa yanlış davranış, kural ihlali ya da onaylı kararla gizli çelişki; **orta** = yanlış ya da
fazla genellenmiş olgu, iç çelişki; **düşük** = yol, yıl, adlandırma, izlenebilirlik.

---

## A. Yüksek

### Y1 · Nefes hatırlatması 08.45'te hiç gelmez (pencere çelişkisi)
- **Yer:** §1 tablo B1 "Hatırlatma açık · her gün 08.45"; §A.1 tablo `breath | legacy breath, route breath-1, window calm`;
  §A.1 yorum "'calm' (nefes, yoga, dalga): 08.00–22.00"; §A.2 "Nefesi genelde 08.30 ile 09.00 arasında yapıyorsun.
  08.45'te hatırlatayım."; §A.2 "Gece 22.00–08.00 arası bildirim göndermiyoruz."
- **Sorun:** `legacy: 'breath'` ayarı `settings.reminders.types.breath`'e yazılır ve bugünkü `planNotifications` kurar. Bugünkü
  kod 09.00'dan önceki ve 21.00'den sonraki saati ayar anında reddeder, planda da `skipReason: 'window'` ile atlar. Plan
  `notifyPlan.js` ve `reminders.js`'e "dokunulmaz" diyor (§5.2). Sonuç: 08.45 nefes hatırlatması kurulamaz; kurulsa bile
  gönderilmez, günlüğe "window" düşer. Ayrıca "Gece 22.00–08.00" cümlesi `move` penceresindeki (09.00–21.00) modüller için
  yanlış.
- **Kanıt:** `app/src/lib/reminders.js:15-16` (`WINDOW = { from: '09:00', to: '21:00' }`), `:80` (timeError);
  `app/src/lib/notifyPlan.js:175` (`if (m < from || m > to …) skipReason = 'window'`); PLAN §5.2 son satır.
- **Düzeltme:** "Legacy türler (mola, walk, breath, water) bugünkü 09.00–21.00 penceresinde kalır; `window` alanı yalnız
  legacy olmayan modüllere uygulanır." Örnek saatleri 09.15 yap ("Nefesi genelde 09.00 ile 09.30 arasında yapıyorsun.
  09.15'te hatırlatayım."). Saat sayfasındaki cümle pencereye göre yazılsın: "Bu hatırlatma 09.00–21.00 arasında gelir."

### Y2 · Legacy türlerde "en çok 3 saat" onaylı kuralla ve bugünkü kodla uyuşmuyor
- **Yer:** §A.1 `maxTimes?: 1 | 2 | 3`; §2 tablo "birden çok saat seçilirse o günün zarı hepsine birlikte uygulanır";
  §A.1 son paragraf "`moduleReminders` onlar için yalnız `mode` ve ek saatleri tutar".
- **Sorun:** Onaylı bildirim planı "Her türden günde en çok 1 hatırlatma" diyor. Kodda kimlik `7400 + gün×10 + tür`,
  günlük de gün ve tür başına tek kayıt. Yani legacy türün ikinci ve üçüncü saati ne kimlik bulur ne günlüğe girer.
  `notifyPlan.js` dokunulmaz kalırsa ek saatleri kimin kuracağı ve deneyin nasıl ölçüleceği yazılmamış. §2 tablosunda bu
  onaylı kural yok.
- **Kanıt:** `BILDIRIM_PLANI.md:23`, `:40`; `app/src/lib/notifyPlan.js:5`, `:185`; `BILDIRIM_PLANI.md:74` (günlük biçimi).
- **Düzeltme:** "Legacy türlerde `maxTimes` 1'dir; ek saat yalnız legacy olmayan modüllerde seçilebilir." Ya da §2'ye satır:
  "Her türden günde en çok 1 (BILDIRIM_PLANI §1, §3) | Legacy türlerde 3'e çıkar; `notifyPlan.js` ve `notifyLog.js` değişir |
  …" ve §5.2'deki "dokunulmaz" cümlesi kaldırılır.

### Y3 · "`timeSensitive` yalnız alarmda kalır" onaylı çalışma oturumu kararını sessizce değiştiriyor
- **Yer:** §A.4 "`timeSensitive` yalnız alarmda kalır. Hatırlatmalar, hava ve yürüyüş sorusu `active`tir".
- **Sorun:** Çalışma oturumu molası bugün bilerek `timeSensitive` (onaylı bildirim planı §5: "İş ya da Rahatsız Etme modu
  açıkken de gelmesi için yalnız bu bildirimler `timeSensitive`"). Cümle bunu da kapsıyor, ama §2'de satır yok. Üstelik
  §5.2'de `notifyPlan.js` "dokunulmaz".
- **Kanıt:** `app/src/lib/notifyPlan.js:199-205`; `BILDIRIM_PLANI.md:70`.
- **Düzeltme:** "`timeSensitive` alarmda ve kişinin başlattığı çalışma oturumu molasında kalır (bugünkü kural). Modül
  hatırlatmaları, hava ve yürüyüş sorusu `active`tir."

### Y4 · Gece kuralı "her kaynağa" uygulanırsa §5.4 eşdeğerliği sağlanamaz
- **Yer:** §A.4 "Hiç yeni özellik açık değilken `planAll` çıktısı bugünkü `planNotifications` çıktısıyla derin eşit
  olmalıdır"; aynı bölümde gece kuralı, "21.00'e yaklaşırsa kalan saatlerin bildirimi kurulmaz", "7302 … 10.00'a
  kaydırılır"; §5.4.
- **Sorun:** Gece kuralı B1'in çekirdeği ve her zaman açık. Çalışma günleri (pencere denetimi yok), 21.00 sonrasındaki
  oturum bildirimleri ve 7302 bu kuralla değişir. Yani yeni hiçbir özellik açılmasa da çıktı değişir. Taban çizgisi "ana
  oturumun gece düzeltmesi" olarak verilmiş ama o düzeltmenin içeriği (7302'yi, Çalışma günlerini kapsıyor mu) bilinmiyor.
  Ayrıca 7301 ve 7302 `restNotify.js`'te kuruluyor, bu dosya §5.2'de yok.
- **Kanıt:** `app/src/lib/notifyPlan.js:190-195` (Çalışma günlerinde pencere yok), `:200-205`;
  `app/src/lib/restNotify.js:112-139` (7302); PLAN §5.2.
- **Düzeltme:** §5.4'e: "Eşdeğerlik, gece kuralının değiştirdiği bildirimler (liste: …) dışında aranır; bu bildirimlerin
  beklenen hâli ayrı testte sınanır." §5.2'ye `lib/restNotify.js` (7301 ve 7302 gece kuralı) eklenir.

### Y5 · Yaklaşık konum varsayılanı, 250 m tempo anonsu için gereken konum doğruluğunu kapatır
- **Yer:** §B.1 "Konum yalnız 'Kullanırken' ve varsayılan yaklaşık (`NSLocationDefaultAccuracyReduced`)"; §C.2 "Konum
  oturumu açıksa mesafe konumdan"; §C.3 250 m anonsu.
- **Sorun:** `NSLocationDefaultAccuracyReduced` bütün uygulamanın izin penceresini yaklaşık konumla açar. Apple: azaltılmış
  doğrulukta `desiredAccuracy` ayarı "has no effect on the location information". Yaklaşık konum 1–20 km saptığı için
  250 m'lik mesafe ve tempo ölçülemez. Plan geçici tam doğruluk isteğini
  (`requestTemporaryFullAccuracyAuthorization`, `NSLocationTemporaryUsageDescriptionDictionary`) anmıyor. Bu yüzden
  "mesafe konumdan" yolu, varsayılan izinle çalışmaz.
- **Kanıt:** `arastirma/apple-json/corelocation_cllocationmanager_accuracyauthorization.json` (Discussion);
  `arastirma/apple-hava-bildirim.md:437-438` (1–20 km).
- **Düzeltme:** §C.2'ye: "Yürüyüş başlarken konum yaklaşıksa bir kez geçici tam doğruluk istenir
  (`NSLocationTemporaryUsageDescriptionDictionary`, amaç: 'Yürüyüşün mesafesini ve temposunu ölçmek için'). Kişi vermezse
  mesafe adım sayarının tahmininden gelir." §4'teki Info.plist listesine bu anahtar eklenir.

### Y6 · WeatherKit atıf kuralı yanlış sayfadan alıntılanmış; asıl kural satırın yetersiz olduğunu söylüyor
- **Yer:** §B.2 "Apple'ın kuralı hava verisi gösterilen yerde Apple Weather işaretini ve yasal atıf sayfası bağlantısını
  ister ('The required attribution which includes a legal attribution page and Apple Weather mark',
  `weatherkit/weatherservice/attribution`)"; §1 "Okunan Apple sayfalarının kopyaları `arastirma/apple/` ve
  `arastirma/apple-json/` altında".
- **Sorun:** (1) Alıntılanan cümle `WeatherService.attribution` özelliğinin tanımıdır, bir kural değildir. Kopyası bu
  klasörde değil, `tasarim/arastirma-v1/weatherkit_weatherservice_attribution.json`'da. (2) Bağlayıcı kural bu klasörde
  kayıtlı olan get-started sayfasında: "you must clearly display the Apple Weather trademark ( Weather), as well as the legal
  link to other data sources." Bu kurala göre hava verisi gösterilen yerde bağlantı da açıkça görünmeli. Satırda yalnız
  işaret var, bağlantı "bir dokunuş ötede". Sabah bildiriminde ise yalnız "Apple Weather" yazısı var, işaret ve bağlantı yok.
  §8 bunu "Apple yetersiz bulursa" diye anıyor, ama asıl kuralı alıntılamadığı için risk olduğundan küçük görünüyor.
- **Kanıt:** `arastirma/apple-json/weatherkit_get-started.txt` ("Apple Weather and third-party attribution");
  `arastirma/apple-hava-bildirim.md:371-373`; `S0/app-review-sorusu.md:33`.
- **Düzeltme:** §B.2: "Apple'ın kuralı (WeatherKit get-started): hava verisi gösteren her yerde 'Apple Weather' işareti ve
  diğer veri kaynaklarının yasal bağlantısı açıkça görünmeli. Satırda işaret var, bağlantı yok; bu kuralın harfiyle
  uyuşmaz ve App Review reddi riski taşır (§8)." Alıntının yolu `tasarim/arastirma-v1/…` diye düzeltilir.

### Y7 · §2 tablosunda değişen dört onaylı karar yok ("çelişkiler gizlenmez" başlığıyla çelişiyor)
- **Yer:** §2 başlığı ve tablosu.
- **Sorun:** Plan şu onaylı kararları değiştiriyor, ama tabloda satırları yok:
  1. "Arka planda konum yoktur" ve "Yeni izin yalnız 'Uygulamayı Kullanırken' konum iznidir" → B3 arka plan konum kipi
     ekliyor, karar 2 de "Her Zaman" iznini açıyor.
  2. "Her türden günde en çok 1" ve "bildirim anında kaydırma yapılmaz" → Y2 ve §A.4 (2).
  3. Çalışma oturumunun `timeSensitive` düzeyi → Y3.
  4. "Sunucudan push … reddedildi" → §B.4 push'u "ikinci sürüme bırakıldı" diye yeniden açıyor.
- **Kanıt:** `SONSUZ_YOL.PLAN.v1.md:121`, `:885`, `:931`; `BILDIRIM_PLANI.md:40-41`, `:70`.
- **Düzeltme:** Dört satır eklenir, örneğin: "Arka planda konum yok (§3.E.2, §1 Gizlilik) | Yürüyüş sırasında
  'Kullanırken' + `location` arka plan kipi; isteğe bağlı 'Her Zaman' (karar 2) | Sahibin yürüyüş eşliği isteği".

---

## B. Orta

### O1 · Stecher 2021: "PMID … tutarsızlık" yok; bulgu da "Sen karar ver"i desteklemiyor
- **Yer:** §A.3 "(Stecher 2021, RKÇ; PMID ve kişi sayısındaki tutarsızlık `pubmed.md` A'da)".
- **Sorun:** `pubmed.md` A yalnız kişi sayısındaki tutarsızlığı yazıyor (özetteki kollar 56 + 49 + 62 = 167, analiz 101);
  PMID 34941558 doğru. Ayrıca çalışma saatle değil, **günlük bir rutine** ("kahveden sonra") bağlamayı sınadı ve kişiye özel
  çapa sabit çapadan iyi çıkmadı. "Sen karar ver" saat seçer, rutine bağlamaz.
- **Kanıt:** `arastirma/pubmed.md:34`; efetch 34941558 (özet: "(1) PA (n=56), (2) FA (n=49), and (3) control group (n=62)";
  "FA group had a significantly higher average odds … 1.14").
- **Düzeltme:** "Hatırlatmayı günlük bir rutine bağlamak (sabit 'çapa'), meditasyon uygulamasının günlük kullanımını
  artırdı (Stecher 2021, RKÇ, 101 kişi; kol sayıları özette tutarsız, `pubmed.md` A). Kişiye özel çapa sabitinden iyi
  değildi; saat seçimini doğrudan sınamadı."

### O2 · Fincham 2023 bilim satırı: "yavaş nefes" değil, "nefes çalışmaları"
- **Yer:** §A.6 Nefes örneği "12 denemelik bir analizde yavaş nefes, algılanan streste küçük–orta azalmayla ilişkiliydi."
- **Sorun:** Meta-analizin konusu "breathwork" (her türlü bilinçli nefes denetimi), yalnız yavaş nefes değil.
  Kullanıcıya gösterilecek satır, bulguyu daha dar bir uygulamaya bağlıyor. Ayrıca satırda kişi sayısı yok, oysa §A.6
  bilim satırını "kişi sayısı ve süresiyle" tanımlıyor.
- **Kanıt:** efetch 36624160 ("Deliberate control of the breath (breathwork)… 12 randomised-controlled trials … 785 adult
  participants … g = −0.35").
- **Düzeltme:** "12 denemelik bir analizde nefes çalışmaları, algılanan streste küçük–orta azalmayla ilişkiliydi." (96
  karakter). Kartta: 785 yetişkin, yanlılık riski orta.

### O3 · Morrison 2017: "kişinin seçtiği saat" değil, önceden belirlenmiş aralık
- **Yer:** §A.3 "Sistemin seçtiği saatin kişinin seçtiği saatten üstün olduğu gösterilmedi (Morrison 2017, RKÇ, 77 kişi)".
- **Sorun:** Özette karşılaştırma "intelligent notifications" ile "daily notifications within pre-defined time frames"
  arasında. Aralığı kişinin seçtiği yazmıyor. Çalışma kendini "exploratory" diye tanımlıyor.
- **Kanıt:** efetch 28046034; `pubmed.md:38` ("önceden belirlenmiş saat aralığında").
- **Düzeltme:** "Bağlama göre seçilen bildirim saati, önceden belirlenmiş bir saat aralığından daha iyi değildi (Morrison
  2017, keşif amaçlı RKÇ, 77 kişi)."

### O4 · "Kalk bildirimleri iş saatinde … işe yaradı" fazla genelliyor
- **Yer:** §A.4 Dayanak "kalk bildirimleri yalnız iş saatlerinde sınandı ve orada işe yaradı (Evans 2012; Swartz 2014)".
- **Sorun:** Evans 2012'de 30 dakikadan uzun oturma sayısı ve süresi azaldı, ama toplam oturma anlamlı değişmedi
  (p = 0,084). Swartz 2014'te kontrol grubu yok (iki aktif kol), azalma grup içi. İkisinde de uyarı bilgisayardan geldi
  (Swartz'ta bilekten de), telefondan değil.
- **Kanıt:** `pubmed.md:103-104`; efetch 22898122, 24784909.
- **Düzeltme:** "Bilgisayardan gelen kalk uyarıları iş saatinde uzun oturma sürelerini azalttı; toplam oturma süresi
  anlamlı değişmedi (Evans 2012, 28 kişi) ve bir çalışmada kontrol grubu yoktu (Swartz 2014, 60 kişi). Akşam için kanıt yok."

### O5 · Morris 2020 bilim satırı sonucu genelliyor
- **Yer:** §A.6 Mola "56 ofis çalışanıyla 12 haftalık bir çalışmada telefondan gelen mola hatırlatması oturmayı azalttı."
- **Sorun:** Anlamlı fark yalnız 60 dakikalık kolda ve yalnız iş saatindeki oturmada çıktı. 30 dakikalık kolda uzun
  oturmalardaki azalma anlamlı değildi, adım değişmedi. Tasarım yarı-randomize.
- **Kanıt:** efetch 33322678; `BILDIRIM_PLANI.md:266`.
- **Düzeltme:** "56 ofis çalışanıyla yarı-randomize bir çalışmada saatlik hatırlatma iş saatinde oturmayı azalttı." (97
  karakter).

### O6 · Tempo ve mesafe doğruluğu için anılan iki kaynak başka şeyi ölçmüş
- **Yer:** §C.2 "(iPhone'un yürüme hızı ölçümü geçerli çıktı, Werner 2023; kentte GPS mesafesi %3–9 eksik çıkabiliyor,
  Gilgen-Ammann 2020.)"
- **Sorun:** Werner 2023, Apple Sağlık uygulamasının 6 dakika yürüme testindeki "yürüme hızı" değerini sınadı. Planın
  kullandığı `CMPedometer.currentPace` bu değer değil. Gilgen-Ammann 2020 sekiz **spor saatini** sınadı, telefonu değil:
  ortalama mutlak hata %3,2–6,1, en çok %9'a varan eksik ölçüm; kent ve ormanda daha kötü.
- **Kanıt:** efetch 37005465, 32396865; `pubmed.md:225-226`, `:255` ("Güncel iPhone'un … mesafe/tempo doğruluğu: güncel
  çalışma bulunamadı").
- **Düzeltme:** "(Apple Sağlık'ın yürüme hızı değeri bir çalışmada geçerli çıktı, Werner 2023; `currentPace` ayrıca
  sınanmadı. Spor saatlerinde GPS mesafesi kentte %9'a kadar eksik çıktı, Gilgen-Ammann 2020; güncel iPhone için çalışma
  bulunamadı.)"

### O7 · "16–21 °C (Togo 2005; Ho 2022)": üst sınır bu iki kaynaktan gelmiyor
- **Yer:** §B.4 Dayanak.
- **Sorun:** Togo 2005'te adım 17 °C'ye kadar arttı, sonra azaldı. Ho 2022'de tepe 16–19,3 °C. 21 °C Yamanaka 2026'dan
  geliyor, ama o kaynak cümlede yok.
- **Kanıt:** `pubmed.md:172-174`, `:183`.
- **Düzeltme:** "adımın en yüksek olduğu aralık gözlemsel çalışmalarda ≈ 16–21 °C ve iklime göre değişiyor (Togo 2005;
  Ho 2022; Yamanaka 2026)".

### O8 · Sesli tempo anonsu, dayandığı notun önerisinden habersizce ayrılıyor
- **Yer:** §C.3 "'250 metre. Kilometre başına 9 dakika 40 saniye.' Saniye 5'e yuvarlanır"; §C.2 "Sayılar ekranda
  'yaklaşık' diye işaretlenmez".
- **Sorun:** `pubmed.md` I bölümüne göre 250 m'lik bölümdeki 10–20 m hata tempoyu ±%4–8 oynatır. Not bu yüzden anonsun
  "yaklaşık" dille ve saniye vermeden yapılmasını, ilk 250 m anonsunun atlanabileceğini öneriyor (Sonuç 12: "250 m tempo
  'yaklaşık' dille söylenir"). Plan tersini seçiyor ama bunu "kendi karar verdiklerim" arasında yazmıyor.
- **Kanıt:** `pubmed.md:21`, `:233`.
- **Düzeltme:** Ya notun önerisi uygulanır ("250 metre. Tempo yaklaşık 9 buçuk dakika."), ya §1'deki "Kendi
  karar verdiklerim" listesine şu eklenir: "Anons saniyeyi söyler; 250 m'lik bölümde tempo ±%4–8 oynayabilir (pubmed.md I),
  bilgi satırı bunu yazar."

### O9 · Karakter sınırları plandaki örneklerle çelişiyor
- **Yer:** §A.6 "Nef cümlesi (en çok 70 karakter) … Başlık en çok 30, gövde en çok 160"; §C.1 soru gövdesi; §B.3 ve §B.4
  örnekleri.
- **Sorun:** Bilim satırı taşımayan gövdeler 70'i aşıyor: yürüyüş sorusu 86, W1 107, "Öğleden sonra 23 dereceye çıkıyor…"
  89, hava sayfası yorumu 109 karakter. `nef-bildirim.md` iki sınırı ayırıyor: bilim satırı yoksa gövde ≤ 110, varsa Nef
  cümlesi ≤ 70 ve gövde ≤ 160. Plan yalnız ikincisini yazmış.
- **Kanıt:** `nef-bildirim.md:39`, `:388-389`, `:707`; Python `len` ile sayıldı.
- **Düzeltme:** §A.6'ya: "Bilim satırı yoksa gövde en çok 110 karakterdir; bilim satırı varsa Nef cümlesi en çok 70, gövde
  en çok 160." VARSAYIM listesine "gövde 110" eklenir.

### O10 · 30 dk, 60 dk ve "alarmdan 5 dk sonra" kuralları birbirini tutmuyor
- **Yer:** §A.3 "başka bildirimlere 60 dakikadan uzak"; §A.1 tablo routine "60 dk'dan yakın düşerse tek bildirimde
  birleşir"; §A.4 "en az 30 dakika … aynı 30 dakikaya düşen … birleşir"; §B.4 "Alarmından 10 dakika sonra (5 / 10 / 20 dk)";
  §5.3 "hiçbir iki bildirim 30 dk'dan yakın değil".
- **Sorun:** (1) Birleştirme eşiği bir yerde 60, bir yerde 30. (2) Sabah havası alarmdan 5–20 dk sonra geliyor, bu da 30
  dk kuralını ve §5.3 testini bozuyor. İstisna yalnız gece kuralı için yazılmış. (3) AlarmKit ertelemesi 9 dakika; alarm +
  10 dk bildirimi ertelenen alarmla çakışabilir (`apple-hava-bildirim.md` §4.2 bunu yazıyor). Plan anmıyor, ayrıca
  istisnanın gerekçesi "kişi zaten uyanık", erteleyen kişi için doğru değil.
- **Kanıt:** `app/ios/App/App/AlarmPlugin.swift:67` (`snoozeSeconds = 9 * 60`); `arastirma/apple-hava-bildirim.md:234-237`.
- **Düzeltme:** Tek eşik seçilir (öneri: birleştirme 30 dk, "Sen karar ver" uzaklığı 60 dk; iki sayının ayrı işi açıkça
  yazılır). §A.4'e: "Alarm ve alarma bağlı sabah havası 30 dk kuralının dışındadır." §B.4'e: "Alarm ertelenirse sabah
  havası son durdurmadan sonra kurulur (durdurma + 2–5 dk); 1. katmanın bildirimi iptal edilir."

### O11 · "15 dk önce" kuralı örnekle çelişiyor; gerekçesi kaynaksız
- **Yer:** §A.3 "Kişi yaptığı saatten biraz önce hatırlatılır (VARSAYIM: 15 dk önce), çünkü hatırlatma yapılmadan önce işe
  yarar." §A.2 örneği "08.30 ile 09.00 arasında … 08.45'te".
- **Sorun:** 08.45, yapılan aralığın ortası; 15 dk önce kuralıyla 08.15 olmalıydı. "İşe yarar" cümlesi kaynaksız bir etki
  iddiası; planın kendi kuralı ("etki iddiası yoktur") ile çelişiyor.
- **Düzeltme:** "Hatırlatma, kişinin genelde başladığı saatten 15 dakika önce kurulur (VARSAYIM; bir işi başlamadan önce
  anmak için)." Örnek: "Nefesi genelde 09.30 ile 10.00 arasında yapıyorsun. 09.15'te hatırlatayım."

### O12 · Yürüyüş sorusunun izin ve rıza satırı eksik; "bugünkü WalkGuard altyapısı" herkes için çalışmıyor
- **Yer:** §4 tablo "Nef'in yürüyüş sorusu (varsayılan) | … | `walk` | — (Apple Sağlık arka plan teslimi bugün var)";
  §C.1.2 "bugünkü WalkGuard altyapısı … `CMPedometer.queryPedometerData`".
- **Sorun:** (1) `CMPedometer` ve `CMMotionActivityManager` "Hareket ve Fitness" iznini ve `NSMotionUsageDescription`'ı
  ister. Apple'a göre anahtar yoksa uygulama çöker. İzin sütunundaki "—" yanlış. (2) Arka planda HealthKit okuması bugün
  `health` v2 rızasına dayanıyor ve v2'nin "Neden" satırı yürüyüş algılamayı kapsamıyor. `nef-bildirim.md` §5.3 bunun için
  `health` v3 gerekebileceğini yazıyor, plan bu notu atlamış. (3) WalkGuard gözlemcisi yalnız etkin yürüyüş koruması varken
  başlıyor. Yürüyüş hatırlatması kapalı kişide uyanış hiç yok.
- **Kanıt:** `app/ios/App/App/HealthPlugin.swift:245-253` (`guard !active.isEmpty else { stopLocked() … }`, satır 250); `app/src/lib/consent.js:17-21`;
  `arastirma/apple-yuruyus.md:74-75`; `nef-bildirim.md:574`.
- **Düzeltme:** İzin sütunu: "Hareket ve Fitness; Apple Sağlık (bugünkü)". Rıza sütunu: "`walk` + `health` 'Neden'
  satırına 'yürürken sana eşlik teklifi' (sürüm 3; hukukçu)". §C.1.2'ye: "WalkGuard gözlemcisi, yürüyüş koruması olmasa da
  `walk` rızası açıkken başlatılacak biçimde değişir."

### O13 · Arka plan yenilemesi ve gece kuralı için gereken dosya ve anahtarlar listede yok
- **Yer:** §B.4 katman 3 (`BGAppRefreshTask`); §4 Info.plist listesi; §5.2 değişen dosyalar.
- **Sorun:** `BGAppRefreshTask` `UIBackgroundModes` → `fetch`, `BGTaskSchedulerPermittedIdentifiers` ve
  `AppDelegate`'te kayıt ister. Info.plist'te bugün yalnız `audio` var. Plan bunları anmıyor. 7301 ve 7302 gece kuralı için
  `lib/restNotify.js` değişir, ama bu dosya da listede yok (bkz. Y4).
- **Kanıt:** `arastirma/apple-hava-bildirim.md:149-150`, `:167-168`; `app/ios/App/App/Info.plist:56-59`.
- **Düzeltme:** §4 Info.plist satırına "(3. katman yapılırsa) `fetch`, `BGTaskSchedulerPermittedIdentifiers`"; §5.2'ye
  `AppDelegate.swift` (görev kaydı) ve `lib/restNotify.js`.

### O14 · Bekleyen bildirim bütçesi "3 günlük ufku" taşımıyor
- **Yer:** §A.4 "modül hatırlatmaları 3 günlük ufukla kurulur, toplam bekleyen ≤ 60 … bütçe dolarsa en uzak gün kırpılır";
  kimlik aralığı 7800–7859.
- **Sorun:** Bugünkü en kötü durum 48, hava ile 50 bekleyen bildirim. ≤ 60 sınırıyla modül hatırlatmalarına 10 yer kalıyor.
  Bu durumda, örneğin 4 modülün her biri 1 saatle, 3 günlük ufuk sığmıyor. Hangi kaynağın kırpılacağı da belirsiz; bugünkü
  7 günlük deney planı (35 kimlik) dokunulmaz. `kod-haritasi.md` 210 bildirimlik bir senaryo veriyor.
- **Kanıt:** `arastirma/kod-haritasi.md:17-18`, `:130`, `:372-373`.
- **Düzeltme:** "En kötü durumda modül hatırlatmalarına 10 yer kalır; ufuk önce yarına, sonra bugüne iner. Deney türlerinin
  7 günlük planı kırpılmaz." Test: "en dolu ayarda bekleyen ≤ 60 ve modül hatırlatması en az bugünü kapsar".

### O15 · Sesli koçta "süre" seçeneğinin ses parçası yok; "sayılar ek almaz" genellemesi yanlış
- **Yer:** §C.3 "ne söylensin: tempo (her zaman), mesafe, süre"; "Parçalar: … 28 dakika (3–30) …"; "Sayılar Türkçede ek
  almadığı için parça birleştirmek dil bilgisi açısından güvenlidir."
- **Sorun:** 3–30 dakikalık parçalar tempo içindir. 31 ile 60+ dakikalık geçen süre ve saat parçaları sayılmamış, bu yüzden
  "≈ 64 / ses" hesabı süre seçeneğini karşılamıyor. Türkçede sayılar ek alır ("9'da", "3'üncü"); güvenli olan, bu kalıpta
  ek almamalarıdır.
- **Düzeltme:** "Bu kalıpta sayılar ek almadığı için parça birleştirmek güvenlidir." Süre için ya seçenek kaldırılır ya
  parça listesine "31–120 dakika, 1–3 saat" eklenip sayı güncellenir.

---

## C. Düşük

| # | Yer | Sorun ve kanıt | Düzeltme |
|---|---|---|---|
| D1 | §A.4 "7400–7599 bugünkü" | Kodda kendi aralık 7400–7499 ve 7500–7509 (`notifyApply.js:15-18`) | "7400–7499 ve 7500–7509 bugünkü" |
| D2 | §A.2 deney cümlesi "(bugünkü cümle, `BILDIRIM_PLANI.md` §4)" | Bugünkü metin "…yaramadığını Gelişim'de görmen için." (`screens/Reminders.jsx:340`); BILDIRIM_PLANI §4'teki metin daha da farklı (`:57`) | Metni `Reminders.jsx:340`'tan aynen al; kaynak olarak dosyayı göster |
| D3 | §C.1 "(sahibin cümlesine yakın; `nef-bildirim.md` D1–D10)"; §B.4 "Yağmur yoksa: …" (W1–W10'a atıfla) | D1–D10'da mesafe yok, fiil "edelim"; W1–W10'un hepsi yağmurlu. Plandaki iki örnek notta yok, uzunlukları sayılmamış | "Yeni örnek, notta yok; uzunluk 86 / 89" diye işaretle ya da nota ekle |
| D4 | §9 künyeler | PubMed basım yılları: Kim AD 2021 Haz (e-yayın 2020), Sturm VE 2022 Ağu (e-yayın 2020), Talens-Estarelles 2023 Nis (e-yayın 2022) | Kartta hangi yılın yazılacağı kurala bağlansın (ör. "basım yılı") |
| D5 | §1 "Sahibin isteği (2026-09-30, özet)"; §2 "Sahip (2026-09-30): 'gerek yok, böyle bir bölüm yok…'" | Bu istek ve alıntı `SAHIP_ISTEKLERI.md`'de ya da depoda başka bir yerde kayıtlı değil (grep) | İstek ve alıntı `SAHIP_ISTEKLERI.md`'ye tarihle yazılsın; plan oraya atıf yapsın |
| D6 | §9 "bu planda anılanlar" | Fournier, Peng, Wrzus, Jones, Stothart, Murtagh, Zhao, Yerrakalva, Compernolle, Tudor-Locke 2020, McAvoy, Terry, Singh 2023 metinde anılmıyor | Başlık "bu plana dayanak notlarda" olsun ya da liste kısaltılsın |
| D7 | §1 sınır 1 "yürüyüşün 5–10. dakikasına düşer (hesap…)" | VARSAYIM listesinde yok; Apple teslimin ağa bağlı olduğunu yazıyor ("If the device is able to retrieve data from the network … much more likely … timely") | VARSAYIM listesine ekle; "ağ yoksa daha geç" |
| D8 | §2 tablo "Apple HIG: aynı konu için birden çok bildirim gönderme (`apple-hava-bildirim.md` §5)" | Alıntı notun §4.4'ünde (`:264-266`) | "§4.4" |
| D9 | §A.6 "Bilim satırı: tek bulgu, kişi sayısı ve süresiyle" | N1 (Fincham) ve dolunay satırı (Laborde) kişi sayısı taşımıyor | "mümkünse tasarım ya da kişi sayısıyla" (nef §10.1'deki gibi) |
| D10 | §1 Maliyet "WeatherKit onaylı planın hesabıyla aynı" | Durdurma niyeti ve arka plan yenilemesi kişi başına günde +1/+1 istek ekler; onaylı plandaki günde 8 istek sınırı bunları saymalı (`apple-hava-bildirim.md:395-397`) | "Onaylı hesap + kişi başına günde en çok 2 ek istek; günlük 8 sınırına sayılır" |
| D11 | §2 tablo "(e) … `YOL.moduller.md`'deki '2 dakikalık yürüme' durağı" | Notta ad "2 dakikalık yürüyüş", modül kimliği `walk` (`YOL.moduller.md:167`, `:189`); plan `yuruyus` diyor | Kimlik farkı ve hangisinin kalacağı yazılsın |
| D12 | §A.4 Dayanak (Carter 2016; Van den Bulck 2007; Brosnan 2024) | Üçü çocuk ve ergen örneklemi; yetişkinde yalnız Exelmans 2016 (844 kişi) | "(çoğu çocuk ve ergende; yetişkinde Exelmans 2016)" |

---

## D. Türkçe: en önemli 10 örnek

| # | Yer | Plandaki | Sorun | Öneri |
|---|---|---|---|---|
| 1 | §A.3 | "Kişi yaptığı saatten biraz önce hatırlatılır" | "Hatırlatmak" kişiyi değil işi nesne alır; "kişi hatırlatılır" bozuk | "Kişiye, genelde başladığı saatten biraz önce hatırlatılır." |
| 2 | §1 sınır 3 | "…taze olması yalnız iOS 26 ve alarmı elle durduran kişide denenebilir." | Yüklem yanlış: kastedilen "mümkündür" | "…yalnız iOS 26'da ve alarmı elle durduran kişide mümkündür." |
| 3 | §1 sınır 2 | "Apple Watch da takılıysa birkaç dakika farklı görünebilir." | Özne yok, "birkaç dakika farklı" anlamsız | "Apple Watch da takılıysa Sağlık'taki sayı birkaç dakika geç güncellenir; iki sayı bu sürede farklı görünebilir." |
| 4 | §A.4 gece kuralı | "Sakin bildirimler (nefes, yoga, dalga, su hariç her şey): 08.00–22.00." | Parantez iki okunuşlu | "Sakin bildirimler (nefes, yoga, dalga): 08.00–22.00. Su en geç 18.00." |
| 5 | §C.2 | "siyah zemin (açık temada da koyu değil, açık zemin çizilir)" | Kendi içinde çelişik | "Koyu temada siyah zemin; açık temada açık zemin." |
| 6 | §C.2 | "ekranda son 30 saniyenin yumuşatılmışı." | Yüklemsiz; "smoothed" çevirisi | "Ekranda son 30 saniyenin ortalaması gösterilir." |
| 7 | §A.3 | "pencere içindeki ve başka bildirimlere 60 dakikadan uzak en yüksek dilim seçilir" | "En yüksek dilim" çeviri kokuyor | "…en çok günde kullanılan dilim seçilir." |
| 8 | §1 | "Kendi karar verdiklerim" | Anlatım bozukluğu | "Kendi verdiğim kararlar" |
| 9 | §1 karar 2 | "Bedeli: kişide güvensizlik, App Review'da gerekçe." | Yüklemsiz; "gerekçe" bedel değil | "Bedeli: kimi kişi güvensizlik duyabilir; App Review gerekçe ister." |
| 10 | §A.1 tablo | "ikisi aynı güne 60 dk'dan yakın düşerse" | "Güne yakın düşmek" bozuk | "ikisi aynı günde birbirine 60 dakikadan yakın düşerse" |

Ek (daha küçük): §A.4 "Kural, aynı dakikadaki bugünkü çakışmayı da kapatır" → "…çakışmayı da önler"; §1 sınır 3 "18 saatten
eski tahminle kurulmaz" → "Bildirim, 18 saatten eski tahminle kurulmaz."

---

## E. Sağlık iddiası ve "kanıtlandı" dili

- "Kanıtlandı", "iyileştirir", "bilimsel olarak" ifadeleri plan metninde yalnız yasak listesinde geçiyor; kullanıcı
  metinlerinde yok.
- Kaynaksız iki etki cümlesi var: §A.3 "çünkü hatırlatma yapılmadan önce işe yarar" (O11) ve §A.4 "orada işe yaradı" (O4).
- Kullanıcıya gidecek üç bilim satırı kaynağından geniş: Fincham "yavaş nefes" (O2), Morris "telefondan gelen mola
  hatırlatması" (O5) ve §C.2 bilgi satırının dayanakları (O6).

---

## F. Doğrulandı (kontrol edildi, doğru bulundu)

**Kod**
- Çalışma oturumu bildirimleri pencereye bakmıyor ve `timeSensitive` kuruluyor (`notifyPlan.js:199-205`). Çalışma günleri
  pencere denetimsiz (`:190-195`). `inFocus` bitiş anını dışarıda bırakıyor (`:132`, `t < span.end`).
- 7302 deneme bildirimi başlangıçtan tam 5 gün sonraya kuruluyor (`restNotify.js:112-127`); 23.40 örneği doğru.
- `normalizeReminders` bilinmeyen alanı atıyor (`reminders.js:49-72`); Hatırlatmalar ekranı normalize nesneyi geri yazıyor
  (`Reminders.jsx:185-195`). `reminders.js` 96, `habitLog.js` 48 satır; `kod-haritasi.md`'deki satır numaraları gerçekten
  hatalı. Su en geç 18.00, iki tür arası 60 dk (`reminders.js:15-18`).
- `validateManifest` bilinmeyen alanı reddetmiyor; `createRegistry`'de `reminders()` yok (`registry.js:96-170`).
- `alarm.js` `bedtimeFor(next, now)` var (`:227`): sıradaki çalıştan 7 saat önce; geçmişse null.
- `AlarmPlugin.swift`'te `stopIntent` hiç verilmiyor (`:143-166`); erteleme `.countdown` ve geri sayım sunumu kullanıyor;
  projede widget uzantısı yok.
- `HealthPlugin.swift`: WalkGuard `HKObserverQuery` + `enableBackgroundDelivery(… .hourly)` (`:256-269`); `dailyTotals` ve
  WalkGuard `.strictStartDate` kullanıyor (`:90`, `:295`).
- `FeedbackPlugin.swift`'te `AppAudioSession` var (`:244`); uyku ve ders bayrakları var, yürüyüş durumu yok.
- `ProfileHome.jsx`'te Alarm bölümü var (`:176`, `:320-351`); `Home.jsx`'te tarih satırı (`:259`) ve adım satırı (`:291`).
- `consent.js`: rıza sürümü rıza başına (`health: 2`), hareket verisi özel nitelikli sayılıyor (`:39`).
- `sources.js`'te `kim2020` ve `wolffsohn2025` yok; ikisi yalnız `evidence.js:69-71`'de metin olarak geçiyor. Listelenen
  diğer 15 anahtar da yok.
- En kötü durumda 48 bekleyen bildirim hesabı tutarlı (35 + 4 + 2 + 7).

**Apple (kaydedilmiş sayfalarda aynen var)**
- "updates are not delivered while your app is suspended" (`coremotion/…/startactivityupdates`).
- stepCount için iOS'ta saatlik en sık teslim (`healthkit/hkhealthstore/enablebackgrounddelivery…`, `HKUpdateFrequency.hourly`).
- "500 meters or more … not … more frequently than once every five minutes" (`corelocation/…/startmonitoringsignificantlocationchanges()`).
  "Her Zaman" izni kapalı uygulamayı yeniden başlatıyor (`requesting-authorization-to-use-location-services`).
- "automatically merge the data from all of your data sources" (`healthkit/hkstatistics`).
- "launches your app process without opening the app" (`appintents/liveactivityintent`); `stopIntent` tipi
  `(any LiveActivityIntent)?` (alarmkit yapılandırma sayfası).
- HIG: "happening now or will happen within an hour" (`design/human-interface-guidelines/managing-notifications`).
- 64 sınırı yalnız `uikit/uilocalnotification`'da.
- Canlı Etkinlik "up to eight hours" ve "combined size of 4 KB" (`activitykit/displaying-live-data-with-live-activities`).
- "the system may unexpectedly dismiss alarms and fail to alert" (`alarmkit/scheduling-an-alarm-with-alarmkit`).
- `currentPace` "seconds per meter"; pedometre verisi "past seven days" (`coremotion/…`).
- `CLGeocoder` `deprecatedAt: 26.0`; `CLBackgroundActivitySession` iOS 17.0; `HKWorkoutSession(healthStore:configuration:)` iOS 26.0.
- App Review 2.5.4 cümlesi; WeatherKit iOS 16 ve ayda 500.000 çağrı (get-started).
- `.duckOthers` ve `.interruptSpokenAudioAndMixWithOthers` sayfaları "exercise app" örneğini veriyor.

**Bilim (PubMed'de yeniden açıldı)**
- Klasnja 2019 (30192907): MRT, 44 kişi, 6 hafta; yürüyüş önerisi sonraki 30 dk'daki adımı %24 artırdı, etki azaldı.
- Morris 2020 (33322678): 56 kişi, 12 hafta, yarı-randomize (satırın genellemesi için O5).
- Fincham 2023 (36624160): 12 RKÇ, g = −0,35 (ifade için O2).
- Schlicht 2026 (42692370): 587 ergen, dil üslubu uyarlaması davranışa ek katkı yapmadı.
- Brosnan 2024 (39226046): yatakta her 10 dk ekran, uykuyu 3 dk kısalttı; 79 genç.
- Laborde 2022 (35623448): 223 çalışma. Yamashita 2021 (34065588): 30 genç yetişkin, çapraz.
- Stecher 2021 (34941558), Morrison 2017 (28046034; 77 kişi), Schumacher 2019 (31267674) künyeleri doğru.
- §9'daki bütün PMID'ler doğru yazara, konuya ve dergiye gidiyor. Kontrol edilenler: 30192907, 33322678, 17920646,
  35151273, 18837616, 36624160, 35623448, 35963776, 32409236, 40467388, 40373021, 39808431, 35283036, 41864748, 34065588,
  32955293, 23891110, 26498230, 27047907, 27928860, 33571126.
- Noar r = 0,074, Hao g = 0,16, Tudor-Locke ≈ 100 adım/dk, Stutz 23 çalışma, Amagasa + Duncan %12–22, Toloo "uyarının
  varlığı tek başına davranışı çoğunlukla değiştirmedi", Bell 2023 "yeni mesaj bankası standart mesajla benzer": `pubmed.md`
  ve `BILDIRIM_PLANI.md` ile birebir.

**Onaylı planlarla ilişki (§2)**
- Şu satırlar kaynağında yazıldığı gibi: Y5 sırası (karar 1, §3.I), App Review yedeği (§1 son paragraf, §3.H, S0 karar
  10), tarih satırında hava (§3.E.7), konum kararı (karar 4, §3.E.2), yağmur bildirimi 7700–7701 (§3.E.6), "Nef hava verisi
  üretmez" (§3.E.1), sessiz gün %25 (BILDIRIM_PLANI §6, sahip kararı 3), 09.00–21.00 (BILDIRIM_PLANI §3), (e) sonra (§3.I),
  Nef paketi v2 (§3.C.5, karar 6), Neslihan / Hakan (ANA_BELGE §2).
- `S0/app-review-sorusu.md` sorunun gönderilmediğini ve gönderilmeyeceğini doğruluyor.

**İç sayılar**
- B1 + B2 + B3 = 27–33 iş günü. Y2–Y4 ≈ 14 iş günü ≈ 3 hafta. Eksik kaynak sayısı 12 + 5 = 17. Ses parçaları 1 + 28 + 12
  + 15 + 3 + ≈ 6 ≈ 64 (yalnız tempo ve mesafe için; O15).
