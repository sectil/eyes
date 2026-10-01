# nefona.com güncellemesi · Kurallar, gizlilik ve kapılar (2026-09-30)

**Kapsam.** Sahibin isteği (2026-09-30): "yaptığın yeni işleri de en son plana ekle; Nefona.com sitesini güncellemelisin,
yeni özellikler ekledik: yoga, sonsuzluk, alarm, hava durumu vs. Ama bunları modüller bittikten sonra görerek düzeltmen
gerekiyor." Bu belge sitenin güncellenmesinden önce uyulacak kuralları ve bugünkü açıkları toplar: (1) gizlilik sayfası
ile uygulamanın gerçekte topladığı veri, App Store gizlilik etiketi; (2) sağlık iddiası kuralları ve yoga ile alarm
kaynakları; (3) Apple'ın pazarlama kuralları; (4) sitenin 5 saniye kapısı.

**Yöntem.** Depo yalnız okundu; hiçbir dosya değişmedi, test ve derleme koşulmadı. Kod iddiaları `dosya:satır`
biçimindedir (yollar depo köküne göre). Sitede kaynak dosya `site/pages/*.html`'dir; derlenmiş `site/*.html` satır
numaraları farklıdır (ör. hukukçu belgesindeki `site/gizlilik.html:76` = `site/pages/gizlilik.html:49`). Makale künyeleri
bu görevde PubMed'den yeniden açıldı (2026-09-30). Kanıtı olmayan her şey **VARSAYIM** diye işaretlidir.

---

## 0. Tek bakışta

| # | Bulgu | Önem | Ne yapılmalı |
|---|---|---|---|
| 1 | Gizlilik sayfasında mikrofon ve konuşma tanıma hiç yok; telefon Türkçeyi kendisi tanıyamıyorsa ses Apple sunucusuna gidiyor | Yüksek | Yeni satır; "ses kaydı sunucuya hiç gitmez" cümlesi düzeltilir |
| 2 | "Tüm verileri sil"den sonra "yalnız tema, ses ve titreşim tercihleri kalır" yanlış | Yüksek | Kod ya da metin; ikisi aynı sürümde |
| 3 | "Görme ölçümü … telefonda kalsa da … ayrı açık rıza alınır" yanlış: telefonda kalan görme ölçümü için rıza yok | Yüksek | Cümle daraltılır; hukukçu Soru 2 genişler |
| 4 | Alarm günlüğü, iki sabah sorusu ve yoga puanları gizlilik sayfasında adıyla yok | Orta | "Telefonda tutulanlar"a eklenir |
| 5 | Hareket izni sitede 1. sürüm metniyle anlatılıyor (arka planda adım okuma ve yürüyüş hatırlatması yok) | Orta | Tablo satırı rıza 2. sürümüyle eşitlenir |
| 6 | E-posta ile giriş sitede yok; SMTP bağlanınca "e-posta başka hiçbir servise gitmez" yanlış olur | Orta | Hesap satırı ve e-posta cümlesi |
| 7 | Nef satırında yoga özeti adıyla yok (rıza metni de öyle) | Orta | Rıza "Ne" listesi ve site aynı anda |
| 8 | RevenueCat'in ülkesi ve işlediği veri yazılmamış; hukukçu soruları arasında yok | Orta | Hukukçuya 4. soru |
| 9 | App Store gizlilik etiketi için belge yok; `PrivacyInfo.xcprivacy` yok | Orta | Etiket taslağı (§2) |
| 10 | Sitenin modül listesi süzgeçsiz: emekli "Nefes sayma" görünüyor, yoga açıklamasız görünecek | Yüksek (2.3.1) | Süzgeç ve yoga açıklaması |
| 11 | Yogada yalnız 1 ders, 1 süre yayımlı; hava kodda yok | Yüksek (2.3.1) | Site yalnız yayımlı olanı gösterir |
| 12 | Alarm ve yoga kaynaklarının DOI'si sitede yok (kanıt kartları yalnız PMID yazıyor; yoga kaynakçada değil) | Orta | Kaynakça veri hattı genişler |
| 13 | Site hiçbir zaman 5 saniye sınamasından geçmedi; onaylı yeni ilk ekran (karar 5b) uygulanmadı | Yüksek | Sınama protokolü (§4) |

---

## 1. Gizlilik: sitenin söylediği ve uygulamanın yaptığı

Karşılaştırılan: `site/pages/gizlilik.html` (55 satır, "taslak" etiketli: `:8`) ile `app/` kodu (HEAD, `93dd037`).

### 1.1 Veri veri karşılaştırma

| Veri | Uygulamada gerçekte (kanıt) | Sitede | Durum |
|---|---|---|---|
| **Kamera** | Görüntü kaydedilmiyor, sayılar kalıyor. Ayrıca kişiye özel bakış kalibrasyon modeli saklanıyor: `gozolcum:gaze-model-v1` (`app/src/lib/gazeCalib.js:12`, yazma `:453`); silen işlev `clearGazeModel` (`:459`) tanımlı ama hiçbir yerden çağrılmıyor (grep). Kamera izin metni (`app/ios/App/App/Info.plist:16`) yalnız 40 cm doğrulamasını ve kırpma egzersizini sayıyor; bakışla oynanan Yılan, Çemberler ve İlk Bakış'ın kırpma sayımı metinde yok (plan bunu Y3'e bırakmış: `SONSUZ_YOL.PLAN.v1.md:1226-1228`). | `:12-13` "Kaydedilen yalnız sayıdır: mesafe (mm), kırpma sayısı, bakış yönü" | **Eksik**: kalibrasyon modeli adıyla yazılmalı ve silinmeli |
| **Kamera modeli indirme** | TrueDepth'siz yolda MediaPipe modeli çalışma anında Google'ın sunucusundan indiriliyor (`app/src/lib/distance.js:9-11`). Görüntü gitmez; istek (IP adresi) gider. VARSAYIM: iPhone uygulamasında bu yolun kullanılıp kullanılmadığı doğrulanmadı (sitede "kamera ölçümleri Face ID'li modellerde": `index.html:228`). | Yok | **Doğrulanacak** |
| **Mikrofon ve konuşma tanıma** | Okuma testinde mikrofon ve Apple konuşma tanıma (`app/ios/App/App/SpeechPlugin.swift`; izin metinleri `Info.plist:81-84`). Telefon Türkçeyi kendisi tanıyabiliyorsa tanıma telefonda (`requiresOnDeviceRecognition`, `SpeechPlugin.swift:78-79`); tanıyamıyorsa ses Apple'ın sunucusuna gider. Uygulama bunu ekranda kendisi söylüyor: "tanıma için Apple sunucusu kullanılır." (`app/src/screens/ReadingTest.jsx:497`). | Hiç yok. `:49` "Kamera görüntüsü, ses kaydı ve konum sunucuya hiç gitmez" | **Eksik ve yanıltıcı** |
| **Apple Sağlık** | Yalnız okuma: adım, yürüme mesafesi, egzersiz dakikası (`HealthPlugin.swift:34`). Rıza 2. sürüm (`app/src/lib/consent.js:13`, `:18-19`): yürüyüş hatırlatması açıksa bugünkü adım toplamı uygulama kapalıyken de okunur (`App.entitlements` background-delivery; `Info.plist:14`). Telefonda kalır, sunucuya ve Nef'e gitmez. | `:31` yalnız 1. sürümün kapsamı: "Adım, yürüme mesafesi, egzersiz dakikası (Apple Sağlık, yalnız okuma)" | **Eksik**: arka planda okuma ve yürüyüş hatırlatması |
| **Alarm ayarı ve günlüğü** | `gozolcum:alarm` ve `gozolcum:alarm-log` (`app/src/lib/alarmLog.js:7-20`, en çok 800 kayıt `:24`): alarmı kurma ve kapatma, "Bu akşam değil", uykuya dalarken çalan sesin süresi, uyanma anı, sabah kartındaki seçim, sabah cevabı "Ses bittiğinde uyumuş muydun?". Yalnız telefonda; Nef'e gitmez (alarm manifestinde `coach` yok); "Tüm verileri sil" siler (`app/src/modules/alarm/manifest.js:16`). | Yok | **Eksik** |
| **Sabah soruları** | (a) Alarm: "Ses bittiğinde uyumuş muydun?" (evet, hayır, erken). (b) Yoga Uykuya Geçiş'ten sonraki sabah: "Dün gece uykuya dalmak ne kadar kolaydı?" 1–10, ders kaydına `sleepEase` olarak eklenir; Nef'e gitmez (`app/src/components/YogaMorningCard.jsx:15-19`). | Yok | **Eksik** |
| **Yoga kayıtları** | Ders, dinlenen süre, tamamlandı mı, önce ve sonra puanı 1–10, fark, "Ders sırasında zorlandın mı?" (Hayır, Biraz, Çok), ses, müzik ve duruş seçimi (`app/src/lib/yogaRecord.js:36-70`; sorular `yogaLessons.js:53`, `:95`, `:203`; `modules/yoga/text.js:88-94`). Yerel oynatıcı dinleme süresini `UserDefaults`'a da yazar (`modules/yoga/journal.js:1-3`); "Tüm verileri sil" onu da siler (`App.jsx:1062-1064`). Nef'e yalnız dört sayı gider: ders, dakika, tamamlanan ders, pratik günü (`modules/yoga/manifest.js:89-93`). | `:19` "pratik kayıtları (süre, önce ve sonra puanları)" | **Kısmen doğru**: zorlanma cevabı ve uyku kolaylığı adıyla yok |
| **Sonsuz yol (Y1)** | Yeni veri saklanmıyor: sayaçlar mevcut kayıtlardan türetiliyor (`app/src/lib/progression.js`). Tek yeni anahtar `gozolcum:path-later` bugüne ait "Sonra yaparım" kaydı; Nef'e ve seriye gitmez; "Tüm verileri sil" siler (`app/src/lib/pathLater.js:1-6`; `modules/yoga/manifest.js:41`). | `:19` "günlük yol ve seri" | **Doğru**. Y4–Y6 (ruh hâli, hava, Nef v2) gelince değişir |
| **Hava ve konum** | Kodda yok (lib'de hava ya da konum kodu bulunamadı; `hukukcu-sorulari.md:18-19` "henüz kodda yoktur"). Y5'te gelecek. | `:49` "konum sunucuya hiç gitmez" | **Bugün doğru**; Y5'le aynı sürümde değişir |
| **Nef** | Paket (`app/src/lib/coach.js:40-63`, alanlar `coachCore.js:9-37`): çalışma günü, dakika, seri, görme ortancası, başlangıç farkı, uyarı, okuma hızı, haftalık test zamanı, son test ve egzersizden beri gün, Yılan rekoru, saat ve modül özetleri: Nefes (sakinlik farkı), Yoga (4 sayı), Yılan, Çemberler, Fark Ettin mi?, Tek Bakışta, Hızlı Bakış. Sunucu içeriği kaydetmiyor (`app/api/coach.js`, günlük kaydı yok). Varsayılan model OpenRouter üzerinden `google/gemini-3.1-flash-lite` (`app/api/coach.js:9`, "VARSAYIM" diye işaretli). | `:32` rıza 1. sürümünün "Ne" satırıyla birebir | **Kısmen eksik**: "oyun ve egzersiz puanları" genel; yoga adı yok. Kod kuralı: "Ne" listesi `buildSignals` ve modül özetleriyle birebir tutulmalı (`consent.js:55-56`) |
| **Hesap (Supabase)** | Üç yol: Apple, Google, e-posta ile 6 haneli kod (`app/src/lib/account.js:1`; `screens/AccountStart.jsx:132`). Sunucu satırı: ad, doğum tarihi, şehir, gözlük/lens (`docs/supabase/001_hesap.sql`), e-posta Supabase'in giriş tablosunda. Frankfurt (`docs/supabase/KURULUM.md:3`). E-postayla giriş kendi SMTP servisi (ör. Resend) bağlanmadan gerçek kişilerde çalışmıyor (`KURULUM.md:11-15`). Hesap silme sunucu kaydını siler (`delete_my_account`). | `:40` yalnız "Apple ile giriş ya da Google ile giriş"; `:48` "E-posta adresin başka hiçbir servise gönderilmez" | **Eksik**; SMTP bağlanınca `:48` **yanlış** olur |
| **Abonelik (RevenueCat)** | Anonim kimlik; hesap varsa hesap kimliğiyle `logIn` (`app/src/lib/subscription.js:43`, `:194`). Satın alma geçmişi ve cihaz/uygulama kimliği işlenir (`app/docs/APP_STORE_KURULUM.md:63-65`). Sunucunun ülkesi depoda yazmıyor (VARSAYIM: ABD). | `:41` "anonim kimlik; hesabın varsa hesap kimliği" | **Doğru ama eksik**: yurt dışı aktarım ve işlenen veri |
| **Serbest yazılar** | Yön notları `gozolcum:yon-notes` (`app/src/lib/yon.js:9`); Bugünün görevi notu (`lib/notice.js:26` `note`). Telefonda; "Tüm verileri sil" Yön notlarını siler (`modules/yon/manifest.js:28`). | Yok | **Eksik**: "yazdığın notlar" eklenmeli |

### 1.2 "Tüm verileri sil" (site: `gizlilik.html:21`, `destek.html:15`)

Site: "onayladığın an silinir; yalnız tema, ses ve titreşim tercihlerin kalır." Kod (`app/src/App.jsx:1051-1080`)
bunlara ek olarak şunları bırakıyor:

- Denemenin zaman çizelgesi ve deneme hatırlatması (`App.jsx:104-106` `TRIAL_KEYS`, bilerek).
- Otomatik ekran ölçüsü (cihaz modelinden gelen kalibrasyon, `App.jsx:1054`, bilerek).
- Bakış kalibrasyon modeli `gozolcum:gaze-model-v1` ve `gozolcum:gaze-flip` (`lib/gaze.js:197`); hiçbir `storageKeys` listesinde yok.
- Nef'in bugünkü cevabının önbelleği `gozolcum:coach-today` (`lib/coach.js:11`); kişinin verisinden üretilmiş metin.
- Gökyüzü molası tercihleri `gozolcum:gokyuzu-opts` (`lib/gokyuzu.js:73`); Gökyüzü manifestinde `storageKeys` yok.
- Hesap açıksa oturum anahtarı `gozolcum:auth` (`lib/supabase.js:17`; hesap silme ayrı iş, bu beklenen olabilir).

Öneri: bakış modeli, Nef önbelleği ve Gökyüzü tercihleri silinsin (kod işi, sahibin onayıyla); gizlilik metni bilerek
kalanları saysın: "Tema, ses ve titreşim tercihlerin, ekran ölçün ve deneme süren kalır."

### 1.3 Sağlık verisi ve rıza cümlesi (`gizlilik.html:36`)

Site: "Görme ölçümü ve hareket verisi sağlığa ilişkin veridir (KVKK md. 6); bu yüzden bu verileri işleyen her amaç için,
telefonda kalsa da yurt dışına gitse de, açık rıza ayrı alınır." Kodda yalnız dört rıza var: `profileSync`, `health`,
`coach`, `coachLife` (`consent.js:13`). Hareket için telefonda kalsa da rıza alınıyor (doğru); **telefonda kalan görme
ölçümü için rıza yok** (yanlış). Aynı durumda olan öteki öz bildirimler: WHO-5, profilin uyku ve stres cevapları, alarm
sabah cevabı, yoga gerginlik ve uyku kolaylığı puanları. Öneri: cümle bugünkü davranışa daraltılır ("Hareket verisi
telefonda kalsa da ayrı açık rızayla okunur; görme ölçümün yalnız Nef'e gidecekse ayrı açık rıza istenir.") ve hukukçu
Soru 2 (`docs/yol-haritasi/tasarim/S0/hukukcu-sorulari.md`) şu soruyla genişler: "Yalnız telefonda işlenen ve bizim
erişmediğimiz ölçüm ve öz bildirimler (görme, WHO-5, uyku ve gerginlik puanları) için açık rıza gerekir mi?"

### 1.4 Yayından önce açık kalanlar

- Sayfa hâlâ taslak: veri sorumlusunun unvanı ve adresi yok (`gizlilik.html:8`); rıza metinleri hukukçudan geçmedi
  (`consent.js:6`). Apple 5.1.1(i) gizlilik politikasında toplanan veriyi, üçüncü tarafları, saklama ve silmeyi, rızanın
  geri çekilmesini açıkça ister (`docs/yol-haritasi/tasarim/arastirma-v1/apple/guidelines.html`, 5.1.1).
- Sitede adı geçmeyen üçüncü taraflar: Apple konuşma tanıma, Google ile giriş, RevenueCat'in ayrıntısı, OpenRouter'ın
  arkasındaki model sağlayıcısı, (e-posta girişi açılınca) SMTP servisi.
- Uygulama içi gizlilik bağlantısı boş: `VITE_PRIVACY_URL` (`app/.env.example`; `app/src/screens/Paywall.jsx:16`).
- Hukukçuya **4. soru** önerisi: RevenueCat'e (VARSAYIM: ABD) giden anonim ya da hesap kimliği ve satın alma geçmişi
  KVKK m. 9 kapsamında hangi dayanakla aktarılır?
- Plandaki yeni gizlilik cümlesi taslağı (`hukukcu-sorulari.md` Soru 1; `arastirma-v1/hava-ay.md:244`) "Kamera
  görüntüsü ve ses kaydı sunucuya / telefondan hiç çıkmaz" diyor. Konuşma tanıma yüzünden bu cümle yanlış olur;
  "Kamera görüntüsü telefondan çıkmaz. Okuma testinde sesin, telefonun Türkçe tanıması yoksa yalnız tanıma için Apple'a
  gider; kaydedilmez." gibi yazılmalı (hukukçu onayıyla).

### 1.5 Gizlilik sayfasına eklenecek satırlar (taslak, hukukçu onayına)

- **Telefonda tutulanlar:** "… alarm ayarın ve alarm günlüğün (kurma saatleri, uykuya dalarken çalan ses, uyanma anı,
  sabah cevapların), yoga derslerinin kayıtları (süre, önce ve sonra puanların, zorlanma cevabın, ertesi sabahki uyku
  kolaylığı puanın), yazdığın notlar, kişisel bakış ayarın."
- **Mikrofon:** "Okuma testinde cümleyi sesli okursan mikrofon açılır. Ses kaydedilmez. Telefonun Türkçeyi kendisi
  tanıyabiliyorsa tanıma telefonda yapılır; tanıyamıyorsa yalnız tanıma için Apple'ın konuşma servisine gider."
- **Hareket:** rıza 2. sürümünün "Ne" satırı aynen.
- **Nef:** "… oyun, egzersiz ve yoga özetleri (yoga için yalnız ders sayısı, dakika, tamamlanan ders ve pratik günü) …"
  VARSAYIM: yoga özetinin adıyla eklenmesi rıza sürümünü artırmayı gerektirir mi, hukukçu Soru 3'e eklenir.
- **Hesap:** "Apple ile, Google ile ya da e-postana gelen kodla giriş."

---

## 2. App Store gizlilik etiketi

**Belge yok.** `docs` ve `app/docs` içinde "gizlilik etiketi | privacy label | nutrition | App Privacy" araması yalnız
şunları buldu: `app/docs/APP_STORE_KURULUM.md:63-65` (üç satırlık not: "RevenueCat'in kendi rehberindeki beyanları
kullan"), plan `SONSUZ_YOL.PLAN.v1.md:127` (konum eklenecek) ve `:1225` (gizlilik kapısı), `arastirma-v1/hava-ay.md:243-252`
(yaklaşık konum için temkinli beyan). App Store Connect'te ne cevaplandığı depoda kayıtlı değil. `PrivacyInfo.xcprivacy`
yok (`find app/ios`); yerel kod `UserDefaults` kullanıyor (yoga oynatıcısı), bu da Apple'ın gerekçe isteyen API'leri
arasında (VARSAYIM; `docs/arastirma/ajan-raporlari/17b_mola_kilidi_animasyon_teknik.md:45`, `:103` aynı şeyi önermiş).

**Etiket taslağı (tamamı VARSAYIM; Apple'ın "App privacy details" tanımıyla sahip ve hukukçu doğrular).** Apple'a
göre "toplama", verinin cihazdan çıkıp isteği anında karşılamaktan uzun süre erişilebilir olmasıdır (`hava-ay.md:247-248`).

| Tür | Neden | Kimliğe bağlı mı | Not |
|---|---|---|---|
| Ad, e-posta, doğum tarihi, şehir | Hesap ve profil yedeği (uygulama işlevi) | Evet | Yalnız hesap ve `profileSync` rızasıyla |
| Kullanıcı kimliği | Hesap (Supabase), abonelik (RevenueCat) | Evet | |
| Satın alma geçmişi | Abonelik (RevenueCat) | Hesap varsa evet | `APP_STORE_KURULUM.md:63-65` |
| Sağlık ve fitness (görme ölçümü özeti) | Nef (uygulama işlevi) | Hayır | Sunucu saklamıyor; model sağlayıcısının saklaması bilinmiyor → temkinli beyan |
| Yaklaşık konum | Hava (Y5) | Hayır | `hava-ay.md:251-252`; Y5 ile aynı sürümde |
| Ses verisi | Konuşma tanıma | — | Apple'ın kendi servisi; beyan gerekip gerekmediği doğrulanacak |
| İzleme | Yok | — | Reklam ve izleme yok (`gizlilik.html:47`), bağımlılıklarda analiz kitaplığı yok (`app/package.json`) |

Kural (plan `:1225`): gizlilik sayfası, App Store etiketi, rıza metni ve "Tüm verileri sil" kapsamı değişen özellikle
**aynı sürümde** güncellenir; biri eksikse sürüm çıkmaz. Site bu kapının bir parçasıdır.

---

## 3. Sağlık iddiası kuralları

### 3.1 Önceki kararlar (tek yerde)

- Bağlayıcı: "Sağlık iddiası yok (tedavi etmez, iyileştirmez, önler, kanıtlanmış vb. yok); her özellik PubMed kaynaklı
  dayanakla gelir (DOI/PMID), kanıtın türü ve sınırı yazılır." (`docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md` bağlayıcı
  kurallar; `docs/ANA_BELGE.md:42-45`).
- Yasak liste (yoga planı §C.6, `yoga-pilot/PLAN.v2.md:966-970`): tedavi, iyileştirir, şifa, detoks, kanıtlanmış,
  bilimsel olarak, "kaygını yok eder", "uykusuzluğa son", "stresini azaltır"; kanıtsız mekanizma (frekans, Hz, teta
  dalgası, bilinçaltı, çakra açma, enerji bedeni); kontrol kaybı dili. Ayrıca "korur" (`yoga-pilot/dossier-guvenlik.md:8`),
  "uyutur" (`yoga-pilot/v3/sure.md:285`), "garanti", "teşhis" (`app/src/lib/coachCore.js` yasak tarama).
- Biçim: bulgu "bir çalışmada … görüldü" diye; türü (meta-analiz, randomize, gözlemsel), kişi sayısı ve sınırı yazılır;
  her ders kartı "Bu ders bir sonuç vaadi taşımaz." ile biter (`app/src/lib/yogaLessons.js` `evidenceLine`).
- Yol durağında iddia yok; kart yalnız ders adını ve süreyi yazar (`yoga-pilot/v3/PLAN.v3.md:380`).
- Gerekçe: 73 ruh sağlığı uygulamasının mağaza açıklamasının %64'ü etkinlik iddia etti (Larsen 2019; aşağıda).
- Kanıt kapısı: her kaynak kartı yayından önce PubMed'de yeniden açılır; PMID ve DOI'si olmayan kart yayına girmez
  (`SONSUZ_YOL.PLAN.v1.md:1222-1223`).

### 3.2 Sitedeki kaynak biçimi (`site/pages/bilim.html`)

- Kaynakça `app/src/lib/sources.js`'ten üretilir (`site/scripts/data.mjs:13`): 31 kaynak; yazar, yıl, özgün başlık ve
  Türkçesi, dergi, DOI, PMID, çalışma türü.
- Kanıt kartları `app/src/lib/evidence.js`'ten: 6 kart (acuity, trend, reading, blink, brain, alarm); kaynak satırı yalnız
  PMID yazar. Kartlardaki 28 PMID'in 21'i kaynakçada yok, yani sitede DOI'leri görünmüyor. **Alarm kartının 12 kaynağının
  hiçbiri kaynakçada değil.**
- Yoga: dört dersin kaynakları `app/src/lib/yogaLessons.js`'te PMID, DOI ve kısa künyeyle duruyor (37 ayrı PMID);
  `data.mjs` bu dosyayı okumuyor. Sitede yalnız 1'i (Luu 2024) kaynakçada; yoga kanıt kartı yok.
- Öneri: `data.mjs` yoga kaynaklarını ve kart kaynaklarını DOI'leriyle kaynakçaya taşısın (kopya tutulmaz; kaynak tek yer).
  Sitede yalnız **yayımlı** derslerin kaynakları görünür (§4.2).

### 3.3 Sitede ve uygulamada riskli cümleler

| Yer | Cümle | Risk | Öneri |
|---|---|---|---|
| `site/pages/index.html:58` | "Mola hatırlatıldıkça işe yaradı" | Etki vaadi tonunda başlık; dayanak 29 kişilik önce-sonra çalışması | "29 kişilik bir çalışmada, hatırlatıldıkça yakınmalar azaldı" gibi bulgu dili |
| `app/src/screens/AlarmSetup.jsx:190` | "Her gün aynı saatte kalkmak uyku düzenini korur." | "korur" yasak listede; Windred 2024 gözlemsel | Siteye taşınmaz; uygulama için ayrı düzeltme önerisi |
| `app/src/lib/coach.js:105` | "Kırpma egzersizi — ekran yorgunluğuna iyi gelir" | Fayda vaadi | Siteye taşınmaz; uygulama için ayrı öneri |
| `app/src/lib/coachCore.js:77` | "kırpma egzersizi ekran yorgunluğunda kanıtlı" | Model istemi; "kanıtlı" yasak kök | Aynı |

Sitede bugün "yoga", "hava", "yağmur", "sonsuz" sözcükleri yok (grep); yeni metin baştan bu kurallarla yazılır.

### 3.4 Yoga ve alarm için doğrulanmış kaynaklar (PubMed, 2026-09-30)

Aşağıdaki künyeler PubMed'den yeniden açıldı; PMID ve DOI eşleşiyor. "Sitede" sütunu, cümlenin nasıl kurulacağını söyler.

**Yoga**

| Künye | PMID · DOI | Tür, kişi | Sitede kullanım |
|---|---|---|---|
| Laborde 2022, Neurosci Biobehav Rev | 35623448 · [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711) | Meta-analiz, 223 çalışma | Yavaş nefeste kalp atışı değişkenliği seans sırasında ve hemen sonra arttı; sağlık sonucu değil |
| Moszeik 2025, Stress Health | 40373021 · [10.1002/smi.70049](https://doi.org/10.1002/smi.70049) | Randomize, 11 ve 30 dk çevrim içi yoga nidra | Etkiler küçük (d = 0,08–0,16); "iki sürüm arasındaki fark küçüktü" |
| Ghai 2025, Ann N Y Acad Sci | 41327816 · [10.1111/nyas.70149](https://doi.org/10.1111/nyas.70149) | Meta-analiz, 73 çalışma, 5.201 kişi | Özet stres, kaygı, depresyon dili taşır; yazarlar düşük yöntem kalitesi ve şişkin tahmin uyarıyor. Sitede yalnız sınırıyla |
| Sharpe 2023, J Psychosom Res | 36731199 · [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169) | Randomize, 22 kişi | Karşı kanıt: tek 30 dk kayıt uykuya dalma süresini değiştirmedi |
| Eide 2026, Sleep Med Rev | 41886931 · [10.1016/j.smrv.2026.102284](https://doi.org/10.1016/j.smrv.2026.102284) | Sistematik derleme, 9 çalışma, 457 kişi | Öznel uyku iyileşti; nesnel ölçüm belirsiz. "Uyutur" denmez |
| Mrazek 2012, Emotion | 22309719 · [10.1037/a0026678](https://doi.org/10.1037/a0026678) | Deney | 8 dk nefes farkındalığından sonra zihin dağılması göstergeleri azaldı |
| Lieutaud 2026, Front Psychol | 42466037 · [10.3389/fpsyg.2026.1833806](https://doi.org/10.3389/fpsyg.2026.1833806) | Randomize, 137 acemi | Rehberli ile sessiz pratik karşılaştırması; yalnız tasarım gerekçesi |
| Gibbs 2026, Int J Yoga | 41743305 · [10.4103/ijoy.ijoy_2_25](https://doi.org/10.4103/ijoy.ijoy_2_25) | Yarı deneysel, 23 kişi, kronik ağrı | Ağrı bağlamı; sitede kullanılmaması önerilir |
| Shuminsky 2026, J Speech Lang Hear Res | 42757902 · [10.1044/2026_JSLHR-25-00691](https://doi.org/10.1044/2026_JSLHR-25-00691) | Deney | Ses üretiminin gerekçesi (konuşma hızı ve doğallık); fayda cümlesi değil |
| Larsen 2019, NPJ Digit Med | 31304366 · [10.1038/s41746-019-0093-1](https://doi.org/10.1038/s41746-019-0093-1) | 73 uygulama | Neden iddiasız yazdığımızın gerekçesi |

**Alarm** (kanıt kartının 12 kaynağı; DOI'ler sitede yok, eklenmeli)

| Künye | PMID · DOI |
|---|---|
| Jespersen 2022, Cochrane (uykusuzlukta müzik) | 36000763 · [10.1002/14651858.CD010459.pub3](https://doi.org/10.1002/14651858.CD010459.pub3) |
| Watson 2015 (yetişkinde en az 7 saat) | 26039963 · [10.5665/sleep.4716](https://doi.org/10.5665/sleep.4716) |
| Windred 2024 (uyku düzenliliği) | 37738616 · [10.1093/sleep/zsad253](https://doi.org/10.1093/sleep/zsad253) |
| Windred 2024 (gündüz ve gece ışığı) | 39405349 · [10.1073/pnas.2405924121](https://doi.org/10.1073/pnas.2405924121) |
| Robbins 2025 (erteleme) | 40389592 · [10.1038/s41598-025-99563-y](https://doi.org/10.1038/s41598-025-99563-y) |
| Sundelin 2023 (erteleme ve uyku ataleti) | 37849039 · [10.1111/jsr.14054](https://doi.org/10.1111/jsr.14054) |
| McFarlane 2020 (melodik alarm, anket) | 31990906 · [10.1371/journal.pone.0215788](https://doi.org/10.1371/journal.pone.0215788) |
| McFarlane 2020 (melodi ve ritim) | 33089201 · [10.3390/clockssleep2020017](https://doi.org/10.3390/clockssleep2020017) |
| Bruck 2009 (sesin perdesi) | 19302343 · [10.1111/j.1365-2869.2008.00710.x](https://doi.org/10.1111/j.1365-2869.2008.00710.x) |
| Smith 2019 (çocuklarda 500 Hz ton) | 31276840 · [10.1016/j.acap.2019.06.016](https://doi.org/10.1016/j.acap.2019.06.016) |
| Kaida 2005 (kendiliğinden uyanma) | 15732320 · [10.2486/indhealth.43.179](https://doi.org/10.2486/indhealth.43.179) |
| Bernardi 2006 (müzik temposu) | 16199412 · [10.1136/hrt.2005.064600](https://doi.org/10.1136/hrt.2005.064600) |

Not: Kaida 2005'in özgün başlığı "prevents" der; kartın cümlesi ("bu ani artış görülmedi") doğrudur. Sitede başlık
"önler" diye çevrilmez. Alarm kartının sınır satırı ("Tedavi değildir; uykusuzluk sürüyorsa bir hekime danış.",
`evidence.js`) sitede de aynen durur.

**Hava, ay ve sonsuz yol:** bu görevde kaynak doğrulanmadı. Hava ve ay kartları Y5'te kanıt kapısından geçer
(plan `:1222`). Sonsuz yolun kademeli artışı sitede bir fayda olarak değil, bir düzen olarak anlatılır (VARSAYIM:
kademeli artış için ayrı bir PubMed dayanağı gerekmez, çünkü sağlık sonucu söylenmiyor).

---

## 4. Apple'ın pazarlama kuralları

### 4.1 İlgili maddeler (`arastirma-v1/apple/guidelines.html`)

- **2.3.1(a):** "marketing your app in a misleading way, such as by promoting content or services that it does not
  actually offer … whether within or outside of the App Store, is grounds for removal". Site, App Store dışıdır ama
  kapsamdadır.
- **2.3:** açıklama, ekran görüntüleri ve **gizlilik bilgisi** uygulamanın gerçek deneyimini yansıtmalı ve sürümlerle
  güncel tutulmalı.
- **2.3.3:** ekran görüntüleri uygulamayı kullanımda göstermeli. **2.3.7:** alt başlıkta doğrulanamaz ürün iddiası yok.
- **1.4.1:** sağlık ölçümlerinin doğruluk iddiası için veri ve yöntem açıklanmalı; "doktora danış" hatırlatması.
- **5.1.3(i):** cihazdan toplanan sağlık verisi türleri açıkça bildirilmeli.
- **5.2.5:** Apple Weather verisi gösteren uygulama WeatherKit atıf kurallarına uyar (Apple Weather markası ve yasal
  atıf sayfası; `S0/app-review-sorusu.md`).
- Apple'ın ayrı "Marketing Guidelines" belgesi (marka adlarının yazımı: Apple Sağlık, Face ID, TrueDepth) depoda yok;
  VARSAYIM: yazım ve ™ gerekleri doğrulanmadı.

### 4.2 Sitedeki somut riskler

| # | Risk | Kanıt | Kural |
|---|---|---|---|
| R1 | **Yoga:** yalnız Ders 2 "Derin Dinlenme"nin 15 dakikalık sürümü yayımlı; öteki dersler ve süreler uygulamada hiç görünmez. Sitede "dört ders", "10 bölüm", "30 dakika" yazmak sunulmayan içeriği tanıtmaktır. Yoga yalnız iPhone uygulamasında. | `app/src/lib/yogaLessons.js:6-7`, `:134` (`published: true` tek yerde); `coachCore.js:79` | 2.3.1(a) |
| R2 | **Hava, yağmur, ay:** kodda yok; Y5 planlı; hukukçu cevabı ve App Review sorusu bekliyor ("gönderilmedi"). Sitede ne ekran ne "yakında" satırı. VARSAYIM: "yakında" ibaresi de App Store dışı sitede risklidir, Apple açık bir tanım vermiyor. Hava ekranı ileride kullanılırsa Apple Weather markası ve veri kaynakları bağlantısı görselde de durur (VARSAYIM). | `hukukcu-sorulari.md:18-19`; `S0/app-review-sorusu.md` başı | 2.3.1(a), 5.2.5 |
| R3 | **Süzgeçsiz modül listesi:** `data.mjs` bütün manifestleri alıyor, `retired` bakmıyor. Emekli "Nefes sayma" sitede açıklamasıyla görünüyor; Yoga'nın açıklaması yok, adıyla boş satır olarak görünecek. | `site/scripts/data.mjs:16-29`; `app/src/modules/breath-count/manifest.js:24` (`retired: true`); `site/src/main.js:76-98` (yoga yok, `:86` Nefes sayma) | 2.3.1(a) |
| R4 | **Yanlış süre:** sitede Gökyüzü molası "Bir dakika"; uygulamada 2 dakika. | `site/src/main.js:92`; `app/src/lib/gokyuzu.js:1`, `:8` (`DURATION_SEC = 120`) | 2.3 |
| R5 | **Sonsuz yol dili:** "sonsuz" pazarlamada sınırsız içerik vaadi gibi okunabilir; bugün yeni duraklar açılma günleriyle geliyor ve modüllerin çoğu henüz yok. Ölçülü dil: "Yol her gün sürer; yeni duraklar zamanla açılır." VARSAYIM: Y1'in TestFlight'ta olup olmadığı bu görevde doğrulanmadı. | `6ea6890` mesajı; `SONSUZ_YOL.PLAN.v1.md:100` (Y1–Y6) | 2.3.1(a) |
| R6 | **Ekran görüntüleri:** bugünküler ayrı bir çalışma ağacında 28 günlük örnek veriyle çekildi. Yeni ekranlar (yoga, alarm, yol) **yayımlanacak derlemeden**, modül bittikten sonra çekilir (sahibin şartı). "Örnek veri" notu önerilir (VARSAYIM: zorunlu değil). | `518afb0` mesajı | 2.3, 2.3.3 |
| R7 | **Fiyat:** sitede fiyat yok (doğru). Satın alma ekranındaki TL tutarları yalnız önizleme verisidir; siteye yazılmaz. | `app/src/screens/Paywall.jsx:23-25` | 2.3.1(a) "false price" |
| R8 | **Ölçüm doğruluğu:** site "Nefona'nın kendi testi henüz ayrı bir klinik karşılaştırmadan geçmedi" diyor; bu satır her güncellemede kalır. | `site/pages/index.html:71` | 1.4.1 |

---

## 5. 5 saniye kapısı: site geçti mi?

**Hayır; site hiç sınanmadı.**

- `git log -- site/`: 7 kayıt. Hiçbiri 5 saniye sınamasının sonucunu yazmıyor.
  - `5047748` (ilk sürüm): "Bağımsız inceleme bulguları uygulandı" (erişilebilirlik ve düzen).
  - `518afb0` (ana sayfa yeniden): sahibin "çok basit, Nefona'yı anlatmıyor; 5 saniyede çıkarsın" sözü üzerine yapıldı.
    Doğrulama **yabancı testi**ydi: ürünü bilmeyen bağımsız inceleyici beş soruya siteden cevap verebilmeli. İki tur:
    32 metin ve 13 düzen bulgusu, sonra 11 metin ve 8 kusur; hepsi uygulandı; 320/390/820/1280 × iki tema ölçüldü.
  - `6ea6890`: "site yol görseli ve metni"; aynı mesajdaki "Y1 5 saniye sınaması sürüyor" uygulama ekranları içindir.
- Yabancı testi anlaşılırlığı ölçer; 5 saniye kuralı ise ilk izlenimi ve "etkilendim" oyunu ister. Kural bağlayıcı
  hâle 2026-09-30'da geldi (`docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md`, "Bağlayıcı kural: gönderimde 5 saniye");
  site işleri 29 Eylül'de.
- Onaylı yeni ilk ekran uygulanmadı: karar 5(b) (`SONSUZ_YOL.PLAN.v1.md:1025-1033`) "Bu cümleyi okurken kaç kez göz
  kırptın?" başlığını ister; S0 kararları 21, Ç11, Ç15 ayrıntıyı verir (`S0/sorular-kararlar.md:176`, `:266`, `:283`).
  Sayfada bugün hâlâ "Gözün değişiyor. Sen de gör." (`site/pages/index.html:7`).
- 8,3/10 "şaşırtma" puanı bir ajan iş akışının kavram puanıdır; 20 kavramın listesi depoda yok (`arastirma-v1/bes-saniye.md:66-70`).
  Yapılmış bir sayfanın 5 saniye sınaması değildir.
- S0 tasarım sayfasındaki iki 5 saniye turu (`S0/ekranlar-inceleme.md:89-91`: "Üç bağımsız değerlendirici … ilk 5
  saniyede etkilenmedi") tasarım belgesi içindir, site için değil.
- Sitede analiz kitaplığı yok; gerçek ziyaretçide 5 saniyenin etkisi ölçülemez (plan `:1033`). Bu dürüst bir sınırdır.

**Sınama protokolü (site için; sahibin tarifinden):**
1. En az 3 (öneri 5) bağımsız, birbirini görmeyen, ürünü bilmeyen değerlendirici.
2. Yalnız ilk ekran: telefon 390 × 844 ve 320 × 568, masaüstü 1280; açık ve koyu tema ayrı.
3. 5 saniye gösterim, sonra üç soru: "Ne anladın? Etkilendin mi (evet/hayır)? Neden?"
4. Çoğunluk "evet" demezse ilk ekran yeniden tasarlanır, sınama tekrarlanır; sahibe gönderilmez.
5. Geçen sürümde ayrıca yabancı testi (beş soru) koşulur: 5 saniye kapısı anlaşılırlığın yerini tutmaz.
6. Sonuç (değerlendirici sayısı, oylar, gerekçeler) kayıt mesajına ve bu klasöre yazılır.

---

## 6. Siteye özellik ekleme kapısı (her özellik için sırayla)

1. **Yayımlı mı?** Özellik, siteyle aynı anda çıkacak App Store derlemesinde var ve açık mı (yoga için `published: true`,
   modül için `retired` değil)? Değilse sitede yok.
2. **Ekran:** o derlemeden çekilir, iki tema; örnek veri notu.
3. **Metin:** iddiasız (§3.1), bulgu dili; ekrandaki cümle uygulamadaki cümleyle aynı; ses örneği varsa uygulamadaki
   gerçek mp3 ve altında aynı cümle.
4. **Kaynak:** PubMed'de yeniden açılmış PMID ve DOI; türü, kişi sayısı ve sınırı.
5. **Gizlilik:** gizlilik sayfası, App Store etiketi, rıza metni ve "Tüm verileri sil" kapsamı aynı sürümde (§1, §2).
6. **5 saniye** sınaması (§5) ve yabancı testi.

**Özellik özellik durum (bugün):**

| Özellik | Uygulamada | Siteye girebilir mi | Önce gereken |
|---|---|---|---|
| Alarm | Var; sitede zaten anlatılıyor | Evet | Gizlilik satırı (§1.1), kart kaynaklarına DOI |
| Yoga | Modül var, yalnız Ders 2 · 15 dk yayımlı | Yalnız yayımlı ders | Modül açıklaması, kaynakça hattı, Nef satırı, yayımlı derlemeden ekran |
| Sonsuz yol (Y1) | Kodda (`6ea6890`); Y2–Y6 yok | Yalnız Y1'in yaptığı | Ölçülü dil (R5); TestFlight durumu doğrulanır |
| Hava, yağmur, ay | Kodda yok | Hayır | Y5, hukukçu Soru 1, App Review cevabı ya da yedek kural, WeatherKit atfı, etikete yaklaşık konum |
| "Günün nasıl geçti?" | Kodda yok (Y4) | Hayır | Hukukçu Soru 2 |

Gizlilik sayfasındaki bugünkü yanlışlar (§1.1 mikrofon, §1.2, §1.3, e-posta girişi) yeni modülleri beklemez: bugünkü
uygulamayı anlatır. VARSAYIM: site henüz yayında değil (`5047748` "canlıya çıkmadan yerelde geliştirilir"), bu yüzden
düzeltme yayından önceki ilk site işine girer.

---

## 7. VARSAYIM listesi

- RevenueCat sunucularının ülkesi (ABD) depoda yazmıyor.
- iPhone uygulamasında TrueDepth'siz cihazlarda MediaPipe modelinin indirilip indirilmediği doğrulanmadı.
- App Store etiketi taslağının tamamı; Apple konuşma tanımanın beyan gerektirip gerektirmediği.
- `PrivacyInfo.xcprivacy` gerekliliği (UserDefaults gerekçesi).
- "Yakında" ibaresinin App Store dışı sitede 2.3.1 riski taşıdığı.
- Y1'in TestFlight'ta olup olmadığı; site yayında olmadığı.
- Yoga özetinin rıza metnine eklenmesinin sürüm artışı gerektirip gerektirmediği (hukukçu).
- Apple Marketing Guidelines'ın marka yazımı gerekleri.
