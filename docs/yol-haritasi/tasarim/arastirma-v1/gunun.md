# "Günün nasıl geçti / geçiyor" — yeniden tasarım (plan, 2026-09-29)

Bu belge bir PLAN ve TASARIMDIR; kod değişikliği sahibinin onayından sonra yapılır (`SAHIP_ISTEKLERI.md`, bağlayıcı
ilkeler). Kod iddiaları yalnız okunan dosya:satır ile; bilimsel iddialar PubMed'den bu oturumda çekilen PMID + DOI ile;
Apple iddiaları developer.apple.com belgelerinden (bağlantılı). Doğrulanamayan her şey **VARSAYIM** diye yazılır.
Yollar `app/src/` altına göredir.

---

## 0. On satırda özet

1. **Ekran süresini okumuyoruz ve iOS buna sayı olarak izin vermiyor.** Screen Time verisi yalnız Apple'ın kum
   havuzundaki (sandbox) rapor uzantısında bir *görünüm* olarak çizilebilir; uzantı ağa çıkamaz, veriyi dışarı
   taşıyamaz (Apple belgesi, §3). Sahibinin "biz zaten görebiliyoruz" cümlesi kodla uyuşmuyor (`App.entitlements`'ta
   Family Controls yetkisi yok).
2. Bu yüzden **"Bugün kaç saat ekrana baktın?" sorusu kalkar**; yerine ölçtüğümüz şey gösterilir (Nefona içindeki göz
   çalışması süresi, molalar, adım, ileride uyku). Sayı bizde değil diye tahmin de sorulmaz: öz bildirimle kayıt
   arasındaki uyum zayıf (Parry 2021, 106 etki büyüklüğü).
3. Bugünkü "Günün nasıl geçti?" kartı aslında **bir kerelik profil formu**: cevaplanınca bir daha çıkmaz, "Bugün"
   diye sorduğu şey tek bir profil değeri olarak saklanır (§1, B1). Günlük bir kayıt değil; Gelişim onu izleyemez.
4. Yeni akış **10 saniyede biter**: önce ölçülenler (sorulmadan), sonra **tek dokunuş**la 5 yüzlü ölçek, sonra o güne
   göre **tek bir kanıt kartı**. İsteğe bağlı ikinci dokunuş: "Günü en çok ne etkiledi?" etiketleri.
5. **Emoji mi puan mı: çizilmiş 5 yüz + altında Türkçe etiket** (sistem emojisi değil). Gerekçe: tek dokunuş; emoji
   sıralı ölçeklerin sırası %95 aynı anlaşıldı ve iyi oluş ölçeğiyle r = 0,70 (Thompson 2025); sistem emojileri
   kültüre göre ters okunabiliyor (Cui 2024). Türkçe, genel toplulukta doğrulanmış bir yüz ölçeği yok (sınır).
6. **Günde en çok 1 zorunlu + 1 isteğe bağlı soru.** Uzun anket yükü ve özensiz cevabı artırıyor (Eisele 2020);
   gündeki soru sayısı uyuma etkisiz (Wrzus 2022, 477 çalışma, ortalama uyum %79).
7. **Kanıt kartı canlı PubMed araması değildir:** kaynakları önceden doğrulanmış, sınırları yazılı küçük bir kart
   kütüphanesinden kural seçer (`lib/evidence.js` kalıbı). Nef kartı yeniden yazmaz, kaynak uyduramaz.
8. Kayıt tek merkeze: yeni oturum türü `day-check` (sessions) → Gelişim İyi oluş alanı, iris günü, Nef haftalık
   paketi. Hava/ay bağlamı ayrı depoda; kişinin işi olmadığı için haritayı doldurmaz (YOL.moduller §2.4 ilkesi).
9. Ekranın üst şeridi: ay evresi, hava, yağmur (ayrıntı hava belgesinde); burada yalnız yer ve veri sözleşmesi.
10. Önce küçük düzeltmeler (S), sonra `day-check` modülü (M), kanıt kartları (M); Screen Time raporu en sona ve ancak
    Apple onayı + ücretsiz sunma şartıyla (App Store 4.10).

---

## 1. Bugünkü durum (kod)

| Konu | Kod (dosya:satır) | Ne yapıyor |
|---|---|---|
| Akşam soruları | `lib/profileQuestions.js:74-102` | `screenHours` "Bugün kaç saat ekrana baktın? (iş + kişisel)", `sleep` "Son 7 gündeki uykunu 0–10…", `nightPhone` "Uykuya daldıktan sonra ya da gece uyanınca telefona bakar mısın?" |
| Grup ve saat | `profileQuestions.js:169-174` | `GROUPS.evening = ['screenHours','sleep','nightPhone']`; `EVENING_HOUR = 18` (yorumda VARSAYIM) |
| Ne zaman çıkar | `profileQuestions.js:177-178, 193` | `answered()` profil değeri `null` değilse doğru; kart yalnız `missing(p, GROUPS.evening).length` iken çıkar |
| Kart | `screens/Home.jsx:334-344` | Eyebrow "Akşam kontrolü · 3 soru · 30 sn" (`:336`), başlık "Günün nasıl geçti?" (`:337`), "Ekran, uyku ve gece telefonu." (`:338`); Başla / Sonra |
| Cevaplama | `App.jsx:1075` | `onAsk('evening')` → yalnız eksik soruları sorar |
| Saklama | `lib/profile.js:53-58, 97-99, 155-157` | Tek değer: `screenHours` ('lt2' / '2-4' / '4-6' / '6+'), `sleep` 0–10, `nightPhone` |
| Kullanım | `profile.js:199` | `heavyScreen` "bilgi amaçlı; mola bütçesini KISALTMAZ" |
| Nef'e | `lib/coach.js:24`, `lib/coachCore.js:32, 79` | `lifeSignals` → `screenHours, sleep7, nightPhone, stress8`; istemde "kişinin kendi cevaplarıdır" |
| İyi oluş | `modules/who5/manifest.js:1`, `lib/progress.js:19` | WHO-5, `WHO5_EVERY_DAYS = 14`; Türkçe geçerlilik Eser 2019 (`lib/who5.js:2-3`) |
| Sabah uyku | `lib/alarmLog.js:19` | Alarm çaldıysa "Ses bittiğinde uyumuş muydun?" (yes/no/early); günlük alarm günlüğüne, sessions'a değil |
| Apple Sağlık | `ios/App/App/HealthPlugin.swift:34-38` | Yalnız `stepCount`, `distanceWalkingRunning`, `appleExerciseTime`; **uyku, nabız okunmuyor**. `health.js:15-23 summarizeHealth`, `:27-31 walkNudge` |
| Yetkiler | `ios/App/App/App.entitlements:1-18` | Apple ile Giriş, HealthKit (+ arka plan teslimi), time-sensitive bildirim. **Family Controls yok** |
| Uygulama içi süre | `lib/eyeBudget.js:8-11` | Göz çalışması ve test parçaları `{ kind, start, end }` olarak tutuluyor (Nefona içi, cihazın toplamı değil) |
| Şehir | `lib/account.js:31, 44`, `components/CityField.jsx` | Profilde serbest metin şehir (81 il önerisi) |
| Kanıt kartı kalıbı | `lib/evidence.js:4-110` | `{ id, title, claim, level, basis, limits, sources[] }`; ör. `alarm` kartı `:89-110` |

**Bulgular (bugünkü tasarımın sorunları):**
- **B1. "Bugün" diye soruluyor, bir kez soruluyor.** Cevap profilde tek değerdir; `answered()` doğru olduğu an kart
  bir daha çıkmaz (`profileQuestions.js:177, 193`). Başlık "Günün nasıl geçti?" günlük bir kayıt vaat ediyor, oysa
  günün nasıl geçtiği hiç kaydedilmiyor. Gelişim bu cevaplardan bir seri kuramaz.
- **B2. "3 soru" yazısı çoğu kişide yanlış.** `sleep` kurulumdaki iris sorularında da var (`IRIS_QUESTIONS`,
  `profileQuestions.js:166`); kurulumu yapan kişide akşam kartı 2 soru sorar, eyebrow ise sabit "3 soru" der
  (`Home.jsx:336`). Kural: ekranda yazan = olan.
- **B3. Ekran sorusu hiçbir şeyi değiştirmiyor.** `heavyScreen` "bilgi amaçlı" (`profile.js:199`); yalnız Nef'e
  gidiyor. Sahibinin itirazı haklı: ölçemediğimiz bir sayıyı her gün sormanın karşılığı yok.
- **B4. Belgelerde küçük hata:** `YOL.moduller.md` §4.2 Watson 2015 ve Windred 2024'ü "sources.js `watson2015`,
  `windred2024`" diye anıyor; `lib/sources.js` anahtarlarında ikisi de yok, ikisi `lib/evidence.js:99-101` (alarm
  kartı) içinde. Kart kütüphanesi kurulurken bu düzeltilmeli.

**Zaten kararlaştırılmış olan (yeniden icat edilmez, atıf):**
- Uyku Sağlık'tan okunur, ayrı açık rızayla (`YAPILACAKLAR.md` "Sonsuz yol ve ilk 5 saniye" karar 4); tasarımı
  `YOL.moduller.md` §4.2 (`sleep` modülü, `sleepNights`, sabah tek soru 0–10, tek "Sabah" kartı). Bu belge onu değiştirmez;
  akşam kartından uyku sorusu bu yüzden kalkar (sabah kartına aittir).
- Ekran süresi işi: `YAPILACAKLAR.md` "2. Ekran süresi" (satır 496-508). §3 bunu Apple belgeleriyle doğrular ve bir
  eksik ekler (4.10 ücretlendirme kuralı).
- Nef dönemleri ve bekçi: `YOL.nef.md` §5 (günlük/haftalık/aylık), §7.1 (`FORBIDDEN`), §7.3 (telefondan çıkmayanlar).
- Veri merkezi ek girdileri: `YOL.moduller.md` §2.4 (`nights`, `healthDays`; kendiliğinden gelen kayıt haritayı doldurmaz).

---

## 2. Sahibin isteği (bu bölüme düşenler)

> "günün nasıl geçti bölümünde PubMed bilgilerini de kullanarak o günle ilgili bilgiler almak, basit sorular değil;
> şu an sorulan 'kaç saat ekrana baktın', biz zaten ekran süresini görebiliyoruz neden soruyoruz... günün nasıl geçti
> emoji olabilir veya puanlama, ama tasarım iyi olmalı... hava durumu alınmalı, bugün yağmurlu mu bilgilendirilmeli,
> konum tespit edilmeli... ayın durumunu göster... günün nasıl geçiyor ekranında ay durumu, hava durumu, yağmur durumu
> gözükecek; yağmur varsa 'bugün yağmur bekleniyor' bildirimi gönderilebilir... ilk 4 saniyede etkilemek gerekiyor."

Ayrıştırma: (a) bildiğimizi sorma; (b) tek bakışta güzel bir ruh hali girişi; (c) güne özgü, kaynaklı bilgi;
(d) hava/yağmur/ay şeridi ve yağmur bildirimi; (e) 5 saniye kuralı; (f) her şey Gelişim ve Nef'e bağlanır.

---

## 3. Soru 1 — iOS'ta bir uygulama toplam ekran süresini okuyabilir mi?

**Cevap: Sayı olarak hayır.** Apple'ın belgeleri şunu söylüyor (kelimesi kelimesine):

- DeviceActivityReport: "To protect the user's privacy, your extension runs in a sandbox. This sandbox prevents your
  extension from making network requests or moving sensitive content outside the extension's address space."
  ([DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport), iOS 16+)
- Aynı sayfa: "The system will only provide your extension with device activity data if the user has authorized your
  app for family controls…"
- Apple çerçeve mühendisi (Apple Developer Forums, Nisan 2023): "No, moving Device Activity data outside of your
  extension's sandbox is not possible in order to preserve the user's privacy."
  ([forum 727958](https://developer.apple.com/forums/thread/727958); resmî belge değil, Apple çalışanının cevabı)
- Family Controls: "This capability adds the com.apple.developer.family-controls entitlement to your app. Before
  submitting your app to the App Store, you must [request permission] to use the entitlement."
  ([Family Controls](https://developer.apple.com/documentation/familycontrols);
  başvuru: https://developer.apple.com/contact/request/family-controls-distribution). Bireysel yetki (`individual`,
  iOS 16+): "the device asks to authorize that individual using Face ID or Touch ID"
  ([AuthorizationCenter](https://developer.apple.com/documentation/familycontrols/authorizationcenter)).
- DeviceActivity: uzantı "warnings … when an activity is about to reach a predefined threshold" alır
  ([DeviceActivity](https://developer.apple.com/documentation/deviceactivity),
  [DeviceActivityMonitor](https://developer.apple.com/documentation/deviceactivity/deviceactivitymonitor)).
  Etkinlik = "the amount of time an application, category, or web domain is frontmost on the screen"
  ([DeviceActivityEvent](https://developer.apple.com/documentation/deviceactivity/deviceactivityevent)).
- **App Store 4.10:** "You may not monetize built-in capabilities provided by … Apple services and technologies, such as
  … Screen Time APIs." ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)). Nefona
  abonelikli; Screen Time özelliği abonelik arkasına konamaz. Bu kural `YAPILACAKLAR.md` §2'de **yok**; eklenmeli.

**Ne mümkün, ne değil:**

| Yol | Mümkün mü | Bize ne kalır | Not |
|---|---|---|---|
| Toplam ekran süresini sayı olarak okumak | Hayır | — | Apple sandbox (yukarıda) |
| Nefona içinde Apple'ın raporunu *göstermek* (DeviceActivityReport görünümü) | Evet, yetki + onayla | Kişi görür; biz, Gelişim ve Nef görmez | Capacitor WebView üstüne yerel SwiftUI görünüm gerekir (VARSAYIM: `UIHostingController` ile; Mac'te denenmeli) |
| Eşik olayından kaba bilgi ("bugün seçtiğin uygulamalarda 2 saati geçtin") | Belgelerde açıkça yasak yok | Belki "eşik aşıldı mı" bayrağı | App Group'a yazmak Apple'ın niyetine aykırı sayılabilir; **VARSAYIM, inceleme riski** (`YAPILACAKLAR.md` §2 "DOĞRULANACAK" ile aynı) |
| Seçilen uygulamalarda süre dolunca "göz molası" kalkanı (ManagedSettings shield) | Evet, yetki + onayla | Mola sayısı (bizim olayımız) | `YAPILACAKLAR.md` §2'deki plan; ücretsiz olmalı (4.10) |

**Karar önerisi (net):**
1. **Soru kalkar.** `screenHours` akşam grubundan çıkar; Profilim → Sorularım'da isteğe bağlı satır olarak kalır
   (eski cevaplar ve Nef alanı bozulmaz: `coachCore.js:32` `null` kabul ediyor).
2. **Yerine ölçtüğümüz gösterilir, adıyla:** "Nefona'da bugün 11 dk göz çalışması, 2 mola" (`eyeBudget` parçaları,
   `eyeBudget.js:8-11`). Asla "ekran süren" denmez; cihazın toplamı değildir.
3. **Screen Time raporu sonra (seçenek C):** Apple onayı gelince "Günün" ekranında Apple'ın kendi raporu, kişinin
   gözü için; altında "Bu sayıyı yalnız sen görüyorsun; Nefona kaydetmez." Ücretsiz. Gelişim'e girmez (giremez).
4. **Tahmin sorusu sorulmaz.** Öz bildirim kayıtla yalnız orta düzeyde ilişkili ve nadiren doğru (Parry 2021).

Seçenekler: (A) hiç sormamak ve göstermemek; (B) önerilen: ölçtüğümüzü göstermek; (C) B + Apple raporu (onaydan
sonra); (D) haftada bir kaba soru — önerilmez (Parry 2021).

---

## 4. Soru 2 — Ne ölçülebilir, ne sorulmalı?

| Bilgi | Kaynak | Bugün | Durum / karar |
|---|---|---|---|
| Adım, mesafe, egzersiz dk | HealthKit | **Okunuyor** (`HealthPlugin.swift:34-38`) | Şeritte gösterilir; sorulmaz |
| Uyku süresi ve düzeni | HealthKit `sleepAnalysis` ([Apple](https://developer.apple.com/documentation/healthkit/hkcategoryvaluesleepanalysis)) | Okunmuyor | Karar 4 + `YOL.moduller.md` §4.2; akşam kartından uyku sorusu kalkar, sabah kartına gider |
| Gün ışığında süre | HealthKit `timeInDaylight` (iOS 17 / watchOS 10, [Apple](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/timeindaylight)) | Okunmuyor | Seçenek; yalnız Apple Watch'ta dolar (VARSAYIM). Ayrı rıza satırı; sonraki aşama |
| Nabız / HRV | HealthKit | Okunmuyor | `YAPILACAKLAR.md` "Kanıtla EKLENMEYECEKLER": yalnız Gelişim'de, yorumsuz. Bu ekrana girmez |
| Ruh hali | HealthKit `HKStateOfMind` (iOS 18, [Apple](https://developer.apple.com/documentation/healthkit/hkstateofmind)) | — | **Yazılmaz**: izin metni "hiçbir veri yazmaz" diyor (`Info.plist:9-10`). Okuma seçeneği açık karar |
| Nefona içi göz çalışması, mola | `eyeBudget` | Var | Şeritte "Nefona'da bugün" |
| Yol ilerlemesi | `lib/today.js` | Var | "Bugünkü yol 4/6" |
| Uyanış, alarm | `alarmLog.js` | Var | Sabah kartına ait; burada yalnız özet |
| Ekran süresi (cihaz) | Screen Time | Okunamaz | §3 |
| Gece telefonu | — | Soru (`nightPhone`) | Akşam grubundan çıkar; Profilim'de kalır. Seçenek: ayda bir (VARSAYIM) |
| Hava, yağış, ay | WeatherKit / yerel hesap | Yok | Şerit; ayrıntı hava belgesinde (§7.3) |
| **Günün nasıl geçti** | Kişi | Yok (B1) | **Sorulur**: tek dokunuş, her akşam |
| Günü ne etkiledi | Kişi | Yok | İsteğe bağlı etiket; zorunlu değil |

**İlke:** Makinenin bildiği sorulmaz; kişinin *yaşadığı* sorulur. Günün değerlendirmesi ölçülemez, sorulur.

---

## 5. Soru 3 — Emoji mi, puan mı? Günde kaç soru?

**Kanıt (PubMed, bu oturumda çekildi):**
- **Emoji sıralı ölçek:** 294 kanser hastasında Emoji-Ordinal ölçeğinin sırası hastaların %95'inde aynı anlaşıldı;
  doğrusal analog ölçekle duygusal iyi oluşta r = 0,70, genel yaşam kalitesinde 0,74 (Thompson 2025, PMID 39772639,
  [DOI](https://doi.org/10.1200/CCI-24-00148)). Sınır: hasta örneklemi, İngilizce, Türkçe doğrulama yok.
- **Tek maddelik duygu ölçekleri (sözel ve görsel):** travmatik beyin hasarlı 61 kişide geçerlik "orta" düzey
  korelasyonla destekli; iki ölçüm arası uyum orta (Gertler & Tate 2020, PMID 32126846,
  [DOI](https://doi.org/10.1080/02699052.2020.1733087)). Görsel analog tek madde, 284 öğrencide çökkün ruh halini
  çok maddeli ölçeklere yakın ayırdı (Killgore 1999, PMID 10710979, [DOI](https://doi.org/10.2466/pr0.1999.85.3f.1238)).
  Tek maddelik öznel iyi oluş PANAS'la yapı geçerliği gösterdi (Dewey 2025, mektup, PMID 40625342,
  [DOI](https://doi.org/10.1002/pcn5.70140)). Kanıt tutarlı ama küçük örneklemli; tek madde **tanı aracı değildir**.
- **İki boyutlu emoji ızgarası (EmojiGrid, Affect Grid'den türetilmiş):** hoşluk (valence) puanları görsel analog
  ölçekle güçlü uyumlu; uyarılmışlık (arousal) yalnız hoş uyaranlarda uyumlu, sözel ölçekte kavram yanlış anlaşıldı
  (Toet 2018, PMID 30546339, [DOI](https://doi.org/10.3389/fpsyg.2018.02396)); kültürler arası benzer ama Japon
  grubunda sistematik fark (Kaneko 2018, PMID 30599977, [DOI](https://doi.org/10.1016/j.foodres.2018.09.049)).
  Yalnız yiyecek görselleriyle denendi. Russell 1989 Affect Grid'in kendisi PubMed'de kayıtlı değil (yalnız başka
  makalelerde atıf: PMID 29334821); bu yüzden kaynak kartına girmez.
- **Sistem emojisi riski:** WeChat'te Çinli gençler 🙂 emojisini alaycı ve olumsuz okudu (Cui 2024, PMID 39717587,
  [DOI](https://doi.org/10.1016/j.heliyon.2024.e39796)). Emoji gülümsemesi içtenlik ipucu taşımıyor (Mazerolle 2026,
  PMID 41642797, [DOI](https://doi.org/10.1037/cep0000394)). Sonuç: sistem emojisi değil, kendi çizdiğimiz yüzler.
- **Yük ve uyum:** 477 EMA çalışmasında ortalama uyum %79; gündeki ölçüm sayısı uyumu ve bırakmayı yordamadı
  (Wrzus & Neubauer 2022, PMID 35016567, [DOI](https://doi.org/10.1177/10731911211067538)). 163 öğrencide uzun anket
  (60 madde) yükü ve özensiz cevabı artırdı, sıklık artırmadı (Eisele 2020, PMID 32909448,
  [DOI](https://doi.org/10.1177/1073191120957102)); aynı veride yeniden çözümlemede ise yüksek sıklık özensiz cevabı
  artırdı (Ulitzsch 2025, PMID 40338562, [DOI](https://doi.org/10.1037/pas0001379)) — **çelişkili**; ikisinin ortak
  sonucu: kısa tut.
- **Gerçek kullanımda bırakma:** 93 ruh sağlığı uygulamasında 30. gün tutma ortancası %3,3; nefes uygulamalarında
  %0 (Baumel 2019, PMID 31573916, [DOI](https://doi.org/10.2196/14567)). İlk saniyeler ve düşük yük bu yüzden kritik.
- **Günün geriye dönük değerlendirmesi:** Gün Yeniden Kurma Yöntemi, günü yapılandırılmış biçimde hatırlatınca anlık
  örneklemeye yakın sonuç verdi (Kahneman 2004, PMID 15576620, [DOI](https://doi.org/10.1126/science.1103572)).
  Bizim tek maddemiz DRM değildir; önce günün ölçülenlerini göstermek hatırlamaya yardımcı olabilir (VARSAYIM).

**Karar önerisi:**
- **Ölçek:** 5 çizilmiş yüz, yatay, her birinin altında etiket: "Çok kötü · Kötü · İdare eder · İyi · Çok iyi".
  Değer 1–5. Tek dokunuş kaydeder (ayrı "Kaydet" yok); 3 sn içinde "Geri al" görünür.
- **Neden 0–10 kaydırıcı değil:** kaydırıcı sürükleme ister, 5 sn kuralını zorlar; uyku sorusu 0–10 kalır (SQS,
  `profile.js:59-61`), ruh hali yüzlerle ayrışır ve karışmaz.
- **Neden 2B ızgara değil:** uyarılmışlık boyutu kolay yanlış anlaşılıyor (Toet 2018) ve ızgara hassas dokunuş ister.
  Seçenek olarak 60. günden sonra "ayrıntılı mod" (açık karar).
- **Soru sayısı:** zorunlu 1 (yüz); isteğe bağlı 1 (etiketler, çoklu seçim, en çok 3): "İş yoğundu", "Hareketliydim",
  "Dışarıdaydım", "İnsanlarla", "Gözlerim yoruldu", "Ekran çoktu". Etiketler 7. günden sonra açılır (VARSAYIM;
  ilk hafta yalnız yüz, 5 sn kuralı).
- **Sıklık:** her akşam 18.00'den (`EVENING_HOUR`) 03.59'a kadar; kaçan gün boş kalır, tahmin yazılmaz; ceza, seri
  kırılması yok (YOL.ilerleme §7 ilkesi).
- WHO-5 (14 günde bir) doğrulanmış çapa olarak kalır; günlük yüzler onun yerini tutmaz.

---

## 6. Soru 4 — "PubMed bilgisiyle o güne özel bilgi": günün kanıt kartı

**Neden canlı arama değil:** Uygulama içinden PubMed'e canlı sorgu, doğrulanmamış bir özeti kişiye gösterir; etki
büyüklüğünü ve tekrarlanamamayı otomatik değerlendiremez; sağlık iddiası üretme riski taşır; kişinin gününü (uyku,
ruh hali) üçüncü bir hizmete taşır. Bunun yerine **kart kütüphanesi**: her kart yayından önce PubMed'le doğrulanır
(PMID + DOI), `lib/evidence.js`'teki gibi `basis` ve `limits` taşır, sürümle güncellenir.

**Kural motoru (saf fonksiyon, telefonda):** `dayCard({ day, history, shown })` → en çok **1 kart**; aynı kart 7 gün
içinde tekrar etmez; hiçbir tetik yoksa kart çıkmaz (dolgu yok). Kart her zaman "bilgi"dir, öneri ya da yargı değil.
Nef kartı yeniden yazmaz; yalnız kart kimliğini bilir (§8).

| Kart | Tetik (günün kaydından) | Ekranda (tek cümle + kaynak satırı) | Kanıt ve sınır |
|---|---|---|---|
| `kisa-gece` | Sağlık gecesi < 6 sa **ya da** sabah uyku cevabı ≤ 3 | "Laboratuvarda iki hafta gecede 6 saat uyuyanların dikkat hataları gün gün arttı; kişiler bunu pek fark etmedi. Bugünkü dikkat sonucunu buna göre oku." | Van Dongen 2003, 48 kişi, RKÇ (PMID 12683469, [DOI](https://doi.org/10.1093/sleep/26.2.117)); tam uykusuzlukta basit dikkat kaymaları g = −0,78, akıl yürütme etkisiz (Lim & Dinges 2010, PMID 20438143, [DOI](https://doi.org/10.1037/a0018883)). Sınır: tek kısa gece bu deneylerle aynı şey değil |
| `yagmurlu-gun` | Hava şeridinde yağış | "Havanın ruh haline etkisi ortalamada küçük; kişiden kişiye değişiyor. Senin günlerinde fark olup olmadığını zamanla birlikte görürüz." | Denissen 2008, 1.233 kişi günlük (PMID 18837616, [DOI](https://doi.org/10.1037/a0013497)). Kişisel karşılaştırma ancak ≥ 10 yağışlı + ≥ 10 kuru kayıtlı günden sonra, yalnız betimsel (VARSAYIM eşik) |
| `dolunay` | Dolunaydan önceki/sonraki 2 gece (yerel hesap) | "Dolunayın uykuya etkisi tartışmalı: bir laboratuvar çalışması 20 dk daha kısa uyku buldu, daha büyük veriler bulamadı; saha ölçümleri dolunay öncesi daha geç ve kısa uyku gösterdi." | Cajochen 2013 (PMID 23891110, [DOI](https://doi.org/10.1016/j.cub.2013.06.029)); Cordi 2014, "çekmece sorunu" (PMID 24937275, [DOI](https://doi.org/10.1016/j.cub.2014.05.017)); Casiraghi 2021 (PMID 33571126, [DOI](https://doi.org/10.1126/sciadv.abe0465)). 2026 çekim hipotezi **ön baskı**, hakemli değil (PMID 41659491) → karta girmez |
| `az-hareket` | Adım < kişinin 7 gün ortancasının yarısı ve saat ≥ 18 | "Daha çok adım daha düşük ölüm riskiyle ilişkili; fayda yaşa göre günde 6–10 bin adımda düzleşiyor (gözlemsel)." | Paluch 2022 (`lib/sources.js` `paluch2022`, kodda var). Günlük değil haftalık gösterim daha doğru olabilir (açık karar) |
| `gece-ekran` | Etiket "Ekran çoktu" + saat ≥ 22 | "Çalışmaların %90'ında ekran süresi daha kısa ve daha geç uykuyla birlikte görüldü; neden-sonuç gösterilmedi." | Hale & Guan 2015, 67 çalışma, **çocuk ve ergen** (PMID 25193149, [DOI](https://doi.org/10.1016/j.smrv.2014.07.007)). Sınır kartta yazılır; yetişkin kanıtı ayrıca aranmalı |
| `goz-yorgun` | Etiket "Gözlerim yoruldu" | Mola kanıt kartı (var olan `eyeBudget.js:2-5` kaynakları: Galinsky 2000) | `YAPILACAKLAR.md` §2: 20-20-20 etkisiz (Johnson 2022) → bu söylenmez |

Kartın altında: "Kaynak" (dokununca kart ayrıntısı: kanıt türü, kişi sayısı, sınır), "Bu kart işime yaradı mı?" yok
(yük). Metinde "iyileştirir, korur, önler, kanıtlanmış" yok (`YOL.nef.md` §7.1).

---

## 7. Ekran tasarımı

### 7.1 Gündüz: "Günün nasıl geçiyor" (soru yok)
Ana sayfa başlığındaki gün satırına dokununca açılan **Bugün** sayfası; üstte şerit, altında ölçülenler:
- Şerit (tek satır, ikonlu): ay evresi · hava ve sıcaklık · yağış olasılığı ("16.00'dan sonra yağmur").
- "Bugün ölçülenler": adım (Sağlık), Nefona'da göz çalışması ve mola, yol ilerlemesi, (izin varsa) dün gece uyku.
- Akşamsa altında 7.2'nin kartı.

### 7.2 Akşam: "Günün nasıl geçti?" — 10 saniyelik akış
Bugünkü akşam kartının yerine (`Home.jsx:334-344`), aynı yuvada (tek kart kuralı, `Home.jsx:187-188`):

| Saniye | Ekranda | Kişi |
|---|---|---|
| 0–2 | Eyebrow "Akşam · 1 dokunuş". Üstte ölçülenler tek satır: "7.412 adım · Nefona'da 11 dk · yol 5/6 · 🌧 yağmurlu". Başlık "Günün nasıl geçti?" | Okur (soru yok, "biliyoruz" etkisi) |
| 2–4 | 5 yüz, büyük dokunma alanı (≥ 44 pt, Apple HIG; VARSAYIM ölçü) | Bir yüze dokunur → kaydedilir, hafif titreşim |
| 4–8 | Kart yerinde dönüşür: seçilen yüz + günün kanıt kartı (varsa) tek cümle, kaynak satırı | Okur ya da geçer |
| 8–10 | (7. günden sonra) etiket çipleri, isteğe bağlı; "Tamam" | Dokunur ya da kapatır |

Kurallar: "Sonra" düğmesi kalır (ertesi akşama değil, 2 saat sonrasına; VARSAYIM); cevaplanmazsa gece yarısı değil
03.59'da düşer; "Geç" yok (günlük kayıt, profil sorusu değil). İki tema, 390 ve 320 px'te denenir (320 px taşma
sorunu `YAPILACAKLAR.md:44` hatırlatması).

### 7.3 Hava, yağmur, ay, konum, bildirim (yalnız sözleşme; ayrıntı hava belgesinde)
- **Kaynak:** WeatherKit (Apple Weather; Swift ve REST; ayda 500.000 çağrı üyelikle dahil; atıf şartı var:
  https://developer.apple.com/weatherkit/, App Review 5.1.5 sonrası "follow the attribution requirements"). Ay evresi
  WeatherKit günlük tahmininde var ([MoonPhase](https://developer.apple.com/documentation/weatherkit/moonphase)) ya da
  telefonda astronomik formülle ağsız hesaplanır (öneri: yerel hesap; VARSAYIM ±1 gün yeter).
- **Konum:** önce profildeki şehir (`account.js:31`; izin gerekmez). "Konumumu kullan" isteğe bağlı, "uygulama
  kullanılırken" ve yaklaşık konum; App Review 5.1.5: "notify and obtain consent before collecting, transmitting, or
  using location data". Nef bunu yapmaz (sahibinin "belki Nef yapabilir" önerisi): model hava verisinin kaynağı olamaz.
- **Yağmur bildirimi:** akşam açılışında ertesi günün tahmini alınır, kişi açtıysa sabah için yerel bildirim kurulur
  ("Bugün öğleden sonra yağmur bekleniyor"); sabah açılışında yenilenir. Arka planda güvenilir sabah yenilemesi iOS'ta
  garanti değil (VARSAYIM, hava belgesinde Apple'dan doğrulanacak). Varsayılan kapalı; tek cümleyle bir kez sorulur.

---

## 8. Veri merkezi, Gelişim ve Nef bağlantısı

**Yeni modül** `modules/gunun/manifest.js` (klasör koymak = modül takmak, `YOL.moduller.md` §2.1):
```js
export default {
  id: 'gunun', title: 'Günün', label: 'günün kaydı', ring: 'life', kind: 'measure',
  progress: {
    domain: 'wellbeing',
    metrics: [{ key: 'day-mood', label: 'Günün nasıl geçti', unit: '/5', better: 'up',
      series: ({ sessions }) => sessions.filter((s) => s?.type === 'day-check').map((s) => ({ date: s.date, value: s.score })) }],
  },
  gates: {},
  storageKeys: ['gozolcum:day-context', 'gozolcum:day-cards'],   // hava/ay bağlamı; gösterilen kartlar (7 gün kuralı)
  sessions: { match: (s) => s?.type === 'day-check', countsTowardGoal: false,
    describe: (s) => ({ title: 'Günün nasıl geçti', detail: `${s.score} / 5` }) },
  // coach(sessions, now) → { mood7: ortalama 1–5, n7, mood28, n28 } (≤ 6 alan; boşken null, YOL.moduller §2.6 önerisi)
}
```
- **Kayıt:** `sessions` ← `{ type: 'day-check', date: ISO, day: 'YYYY-MM-DD', score: 1–5, tags: [], card: 'kisa-gece'|null, seconds }`.
  Kişinin işi olduğu için İyi oluş gününü doldurur (`dataHub.js:102-120 domainDays` `sessions` üzerinden, değişmeden).
- **Bağlam:** `gozolcum:day-context` → `{ 'YYYY-MM-DD': { rain: bool, precipMax, tempMax, moon: 'full'|…, city } }`;
  sessions'a yazılmaz, haritayı doldurmaz (kişinin işi değil). Kişisel "yağmurlu günlerin" karşılaştırması buradan.
- **Gelişim, İyi oluş alanı:** yeni satır "Günün nasıl geçti · son 7 gün ortalama 3,6 / 5 (6 gün)". Değişim yayı:
  28 günde ≥ 14 kayıt varsa `metricTrend` ilk yarı / son yarı (`progress.js:130-150`, sleep kartıyla aynı kural);
  yoksa "henüz belirsiz". WHO-5 yanında durur; ikisinin yönü yan yana yazılır, yorum yapılmaz.
- **Etiketler:** Gelişim'de 28 günden sonra betimsel: "'Dışarıdaydım' dediğin günlerin ortalaması 4,1, diğerleri 3,3
  (9 ve 17 gün)". Neden-sonuç cümlesi yok; ≥ 5 gün olmayan etiket gösterilmez (VARSAYIM eşik).
- **Nef:** `coach()` → `mood7, n7, mood28, n28` yalnız sayı; etiketler, hava, şehir, kart metni gitmez. Nef bunu
  `YOL.nef.md` §5.2 haftalık paketinde yorumlar ("bu hafta 6 akşam kayıt; ortalama geçen haftaya yakın"); günlük
  10 saniyelik akışta Nef çağrısı yok (ağ gecikmesi 5 sn kuralını bozar). Rıza: ruh hali sağlıkla ilgili kişisel veri
  sayılabilir → coach rızası sürüm artışına (`YOL.moduller.md` §2.6'daki v2) ruh hali de yazılır.
- **Eski alanlar:** `lifeSignals` (`coach.js:24`) değişmez; `screenHours` yeni kullanıcıda `null` kalır.

---

## 9. Gizlilik ve güvenlik
- Ruh hali, etiketler, bağlam yalnız telefonda (`localStorage` + var olan dışa aktarma). Nef'e yalnız ortalama ve
  sayı, açık rızayla. Apple Sağlık verisi Nef'e gitmez (var olan söz, `HealthPlugin.swift:15`).
- Konum: şehir yeterli; GPS isteğe bağlı ve yaklaşık. Koordinat sunucumuza gitmez; WeatherKit isteği Apple'a gider
  (Swift API cihazdan). Koordinatı yuvarlamak (≈ 0,1°) VARSAYIM, hava belgesinde karar.
- Screen Time verisi (ileride) hiçbir koşulda bize ulaşmaz; teknik olarak da ulaşamaz (§3).
- HealthKit verisi pazarlama/reklamda kullanılamaz (App Review 5.1.2(vi), 5.1.3(i)); zaten kullanılmıyor.
- Düşük ruh hali serisi (ör. 14 günde ≥ 10 "çok kötü/kötü") için sabit, modelden bağımsız cümle: WHO-5 `low`
  metni kalıbı (`who5.js:27`) — "Bu bir tanı değil…". Eşik VARSAYIM; `YOL.nef.md` §7.2 yükseltme kurallarına bağlanır.
- KVKK: ruh hali verisinin "özel nitelikli" sayılıp sayılmadığı hukukçuya (VARSAYIM; `YAPILACAKLAR.md` §3 listesine).

---

## 10. Uygulanabilirlik, iş büyüklüğü ve sıra (her adım ayrı onay, ayrı TestFlight)

| # | İş | Dosyalar | Büyüklük | Risk |
|---|---|---|---|---|
| 1 | Akşam grubundan `screenHours`, `sleep` çıkar (`nightPhone` açık karar); eyebrow sayıyı eksik soru sayısından üret (B2) | `profileQuestions.js:169-172`, `Home.jsx:336-338`, testler | S (≤ 0,5 gün) | Düşük; eski cevaplar korunur |
| 2 | `gunun` modülü: kart, 5 yüz, kayıt, Gelişim satırı, `coach()` | `modules/gunun/*`, `Home.jsx` yuva, testler | M (1–2 gün) | Düşük; registry sözleşmesi aynı |
| 3 | Kart kütüphanesi + `dayCard` kural motoru (+ B4 düzeltmesi) | `lib/dayCards.js`, `lib/evidence.js` | M (1 gün + PubMed doğrulaması) | Metin incelemesi gerekir |
| 4 | Ay evresi (yerel hesap) ve şerit | `lib/moon.js` | S | Düşük |
| 5 | Uyku (zaten tasarlandı) | `YOL.moduller.md` §4.2 | L; Mac'te derleme `[~]` | Yerel kod |
| 6 | WeatherKit eklentisi + konum + yağmur bildirimi | Swift eklenti, entitlement, Info.plist | L; Mac + cihaz | Yetki, atıf, bildirim zamanlaması |
| 7 | Screen Time raporu (seçenek C) | uzantı hedefi, Family Controls başvurusu | XL; Apple onayı haftalar | 4.10: ücretsiz olmalı; Capacitor'da SwiftUI |

Mevcut testlerin bozulmaması: `profileQuestions.test.js:45-51` akşam kartının çıkıp ertelendiğini sınıyor; grup
daralınca `nightPhone` kalırsa geçer, grup tümüyle kalkarsa bu test yeni karta taşınır. `dataHub.test.js` varsayılanlı parametrelerle değişmeden geçer (yeni tür yalnız
`registry.forSession` ile eşlenir).

---

## 11. Kaynak tablosu (PubMed, bu oturumda doğrulandı)

| Kaynak | PMID | DOI | Tür, n | Bu belgede |
|---|---|---|---|---|
| Parry 2021, Nat Hum Behav | 34002052 | [10.1038/s41562-021-01117-5](https://doi.org/10.1038/s41562-021-01117-5) | Meta-analiz, 106 etki | Öz bildirim ekran süresi ≠ kayıt |
| Thompson 2025, JCO Clin Cancer Inform | 39772639 | [10.1200/CCI-24-00148](https://doi.org/10.1200/CCI-24-00148) | Geçerlik, 294 hasta | Emoji sıralı ölçek |
| Gertler & Tate 2020, Brain Inj | 32126846 | [10.1080/02699052.2020.1733087](https://doi.org/10.1080/02699052.2020.1733087) | Geçerlik, 61 | Tek madde sözel/görsel |
| Killgore 1999, Psychol Rep | 10710979 | [10.2466/pr0.1999.85.3f.1238](https://doi.org/10.2466/pr0.1999.85.3f.1238) | 284 öğrenci | Görsel analog tek madde |
| Dewey 2025, PCN Rep | 40625342 | [10.1002/pcn5.70140](https://doi.org/10.1002/pcn5.70140) | Mektup | Tek madde iyi oluş ↔ PANAS |
| Toet 2018, Front Psychol | 30546339 | [10.3389/fpsyg.2018.02396](https://doi.org/10.3389/fpsyg.2018.02396) | Deney | EmojiGrid, uyarılmışlık sınırı |
| Kaneko 2018, Food Res Int | 30599977 | [10.1016/j.foodres.2018.09.049](https://doi.org/10.1016/j.foodres.2018.09.049) | Kültürler arası | EmojiGrid |
| Cui 2024, Heliyon | 39717587 | [10.1016/j.heliyon.2024.e39796](https://doi.org/10.1016/j.heliyon.2024.e39796) | 597 genç | Emoji alaycı okunuyor |
| Mazerolle 2026, Can J Exp Psychol | 41642797 | [10.1037/cep0000394](https://doi.org/10.1037/cep0000394) | Deney | Emoji gülümsemesi |
| Wrzus & Neubauer 2022, Assessment | 35016567 | [10.1177/10731911211067538](https://doi.org/10.1177/10731911211067538) | Meta-analiz, 477 çalışma | EMA uyumu %79 |
| Eisele 2020, Assessment | 32909448 | [10.1177/1073191120957102](https://doi.org/10.1177/1073191120957102) | Deney, 163 | Uzun anket yükü |
| Ulitzsch 2025, Psychol Assess | 40338562 | [10.1037/pas0001379](https://doi.org/10.1037/pas0001379) | Yeniden çözümleme | Sıklık ve özensiz cevap (çelişki) |
| Baumel 2019, JMIR | 31573916 | [10.2196/14567](https://doi.org/10.2196/14567) | 93 uygulama | 30. gün tutma %3,3 |
| Kahneman 2004, Science | 15576620 | [10.1126/science.1103572](https://doi.org/10.1126/science.1103572) | 909 kişi | Gün Yeniden Kurma |
| Van Dongen 2003, Sleep | 12683469 | [10.1093/sleep/26.2.117](https://doi.org/10.1093/sleep/26.2.117) | RKÇ, 48 | Kısa gece kartı |
| Lim & Dinges 2010, Psychol Bull | 20438143 | [10.1037/a0018883](https://doi.org/10.1037/a0018883) | Meta-analiz, 70 makale | Kısa gece kartı |
| Denissen 2008, Emotion | 18837616 | [10.1037/a0013497](https://doi.org/10.1037/a0013497) | Günlük, 1.233 | Yağmurlu gün kartı |
| Cajochen 2013, Curr Biol | 23891110 | [10.1016/j.cub.2013.06.029](https://doi.org/10.1016/j.cub.2013.06.029) | Geriye dönük lab | Dolunay (lehte) |
| Cordi 2014, Curr Biol | 24937275 | [10.1016/j.cub.2014.05.017](https://doi.org/10.1016/j.cub.2014.05.017) | Mektup, büyük veri | Dolunay (aleyhte) |
| Casiraghi 2021, Sci Adv | 33571126 | [10.1126/sciadv.abe0465](https://doi.org/10.1126/sciadv.abe0465) | Saha aktimetri | Dolunay (lehte) |
| Hale & Guan 2015, Sleep Med Rev | 25193149 | [10.1016/j.smrv.2014.07.007](https://doi.org/10.1016/j.smrv.2014.07.007) | Derleme, 67 çalışma | Gece ekranı (çocuk/ergen) |

Kullanılmayan: Ferrante 2026 (PMID 41659491, ön baskı); Russell 1989 Affect Grid (PubMed kaydı yok).

## 12. Apple kaynakları (developer.apple.com, 2026-09-29'da okundu)
DeviceActivityReport · DeviceActivityReportExtension · DeviceActivity · DeviceActivityMonitor · DeviceActivityEvent ·
FamilyControls · AuthorizationCenter · ManagedSettings · HKCategoryValueSleepAnalysis · timeInDaylight ·
HKStateOfMind (iOS 18; sayfa özeti boş, değer aralığı doğrulanmadı) · WeatherKit (+ MoonPhase) · App Review
Guidelines 4.10, 5.1.2(vi), 5.1.3, 5.1.5 · Apple Developer Forums 727958 (Apple çalışanı cevabı; belge değil).

## 13. VARSAYIM listesi
Capacitor'da SwiftUI rapor görünümü; eşik olayından App Group'a bayrak yazmanın inceleme riski; `timeInDaylight`'ın
yalnız Watch'la dolması; 44 pt dokunma alanı; 7. günde etiketlerin açılması; "Sonra" = 2 saat; 03.59 kapanış;
yağışlı gün karşılaştırma eşiği (10 + 10); etiket gösterim eşiği (5 gün); düşük ruh hali eşiği; ay evresi ±1 gün;
koordinat yuvarlama; sabah arka plan yenilemesinin güvenilmezliği; ruh halinin KVKK sınıfı; ölçülenleri önce
göstermenin hatırlamaya yardımı.

## 14. Sahibinin kararını bekleyen sorular
1. Ekran süresi: (B) yalnız Nefona içi süreyi göstermek mi, (C) Apple onayından sonra Apple raporunu da eklemek mi?
   C seçilirse ücretsiz sunulur (4.10).
2. Ölçek: 5 çizilmiş yüz (öneri) mi, 1–5 sayı mı, yüz + sayı mı? Etiket kelimeleri uygun mu ("İdare eder")?
3. İsteğe bağlı etiketler olsun mu; hangi altı etiket?
4. `nightPhone` sorusu: tamamen Profilim'e mi, ayda bir akşam kartına mı?
5. Kanıt kartları: altı kart listesi ve metinleri; `az-hareket` günlük mü, haftalık mı?
6. Konum: yalnız profil şehri mi, "Konumumu kullan" seçeneği de mi?
7. Yağmur bildirimi: varsayılan kapalı ve bir kez sorulsun mu?
8. Ruh hali Apple Sağlık'a (State of Mind) yazılsın mı? Öneri: hayır (bugünkü "hiçbir veri yazmaz" sözü).
9. Nef ruh hali ortalamasını görsün mü (coach rızası v2 ile)?
