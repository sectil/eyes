# Yoga modülü: üretim, teslim biçimi ve maliyet (v3 çalışma notu)

Tarih: 2026-09-29. Konu: ilk yayındaki 10 ders × 3, 5 ve 15 dakikalık sürümlerin nasıl üretileceği, uygulamaya hangi
biçimde gireceği, ne kadar yer tutacağı ve kaç krediye mal olacağı. Depodaki hiçbir dosya değiştirilmedi, git yazma
komutu çalıştırılmadı, ücretli ElevenLabs çağrısı yapılmadı. Hesap betikleri bu klasörde: `calc.py` (defter toplamı ve
dışdeğerleme), `plans.py`, `plans2.py`, `plans3.py` (pilot planlayıcısı `pilot/timing.py` salt okunarak içe aktarıldı).

**Kanıt kuralı.** Kod iddiaları yalnız bu görevde kendim okuduğum satırlardan gelir. Sayıların kaynağı:
`render/ledger.jsonl` (399 satır, satır satır toplandı), `render/out/report.md`, `render/sel/*/selection-*.json`,
`render/units.json`, `render/music/el/manifest.json`. Doğrulanamayan her değer **VARSAYIM** diye işaretlidir. Bu
belgede sağlık ya da bilimsel etki iddiası yoktur; bu yüzden PMID de yoktur.

**Kör dinleme notu.** A/B eşlemesi (`render/out/_ab_key.json`) bu belgede açılmadı. Müzik kaynakları yalnız
"ElevenLabs" ve "Dalga motoru" diye anılır; hangisinin A olduğu yazılmadı.

---

## 0. Tek bakışta

| Konu | Öneri | Kısa gerekçe |
|---|---|---|
| Teslim biçimi | **Ön-karışım:** her ders × süre × ses için tek ses dosyası ve aynı hesaptan çıkan `timeline.json` | "Ses asla kesilmez" yayından önce dosya üzerinde ölçülerek kanıtlanır. Oynatıcı, uygulamada uyku sesini kilitte çalan sınıfın (AVAudioPlayer) aynısıdır |
| Çalışma anında karışım motoru | **2. aşamaya** (30 dk ve "her dakika" geldiğinde) | Üç sabit süre için gerekmiyor; bu uygulamada hiç yok ve Swift bu ortamda derlenmiyor |
| Ses sayısı | **1 ses** (sahibin kör dinlemede seçtiği hoca sesi); ikinci ses sonra indirme olarak eklenebilir | Sahibin kararı zaten "dinleyip birini seçmek". Kredi ve boyut yarıya iner |
| Biçim | Ana kopya 44,1 kHz stereo WAV (depo dışında). Uygulamada AAC-LC 64 kbit/sn stereo; kör kodek testini geçemezse AAC-LC 96 | AAC bu ortamda üretilemiyor, sahibin Mac'inde üretilir |
| Boyut (1 ses, 10 × 3/5/15 = 230 dk) | ≈ 110 MB (AAC 64) · ≈ 166 MB (AAC 96) · ≈ 190–196 MB (pilotun MP3'ü) | §4 |
| Yer | **Hepsi pakette** (AAC 64 ile). Sahip büyük bulursa 3 ve 5 dk pakette, 15 dk'lar tek paket hâlinde indirilir | Ağ bağımlılığı ve gizlilik akışı yok |
| Kredi (ilk yayın, 1 ses) | ElevenLabs müziğiyle ≈ 371–533 bin (≈ 68–97 USD); Dalga müziğiyle ≈ 150–228 bin (≈ 27–41 USD) | Pilotun ölçülmüş defterinden (§6) |
| Müzik | Yataklar dersler arasında **paylaşılmaz**; bir dersin 3/5/15 sürümleri aynı yatakları kullanır | "Her ders benzersiz" isteği |
| Onay kapıları | Pilotu kapat → sahip dinler → kalıp kilidi (Ders 2'nin 3/5/15'i cihazda) → 3 parti (1-3-5, 4-7-8, 6-9-10) → yayın | §8 |

---

## 1. Pilotta gerçekte harcanan kredi (defter, satır satır)

`render/ledger.jsonl` 399 satırdır. Her ücretli çağrı önce tahmin fiyatıyla yazılmış; müzik, ses efekti ve Scribe
çağrılarının ardından "uzlaştırma" satırları (gerçek fiyat − tahmin) eklenmiştir. Toplamlar bu iki satır türünün
toplamıdır.

| Kalem | Satır | Kredi | Sent | Fiyatın durumu |
|---|---|---|---|---|
| Konuşma (TTS, `eleven_v4`, birim başına 3 çekim), Neslihan | 73 | 12.381,5 | 225,17 | tahmin fiyatı (0,926 kredi/karakter/çekim); **gerçek fiyatla uzlaştırılmadı** |
| Konuşma, Hakan | 71 | 11.770,4 | 214,05 | aynı |
| Scribe, konuşma doğrulaması | 166 + 47 uzlaştırma | 4.488,4 | 81,61 | gerçek (5,5 kredi/sn) |
| Müzik (7 parça, 1.620 sn) | 7 + 7 | 24.294,6 | 441,72 | gerçek (15,0 kredi/sn) |
| Doğa (4 × 30 sn) ve dönüş tınısı (4 sn) | 2 + 2 | 413,3 | 7,51 | gerçek |
| Scribe, müzikte vokal denetimi (1.744 sn) | 12 + 12 | 9.592,0 | 174,40 | gerçek |
| **Toplam** | **399** | **62.940,3** | **1.144,46 (11,44 USD)** | |

- **Ses ve müzik ayrı:** konuşma kovası (TTS + Scribe) 28.640,3 kredi = 520,83 sent (tavan 550). Müzik kovası (müzik +
  doğa + tını + müzik Scribe'ı) 34.299,9 kredi = 623,63 sent (tavan 900). Bu sayılar `report.md`'deki kova
  toplamlarıyla birebir aynıdır. Defterde 1 kredi = 0,01818 sent, yani 5.500 kredi = 1 USD (MCP çalışma alanının
  oranı; aboneliğin gerçek fiyatı ve kalan kotası doğrulanmadı).
- **Tahmin ile gerçek arasındaki fark** (`render/music/el/manifest.json`, `cost.estimate_errors`): müzik tahmini
  27,5 kredi/sn, gerçekte 15,0; ses efekti tahmini 11, gerçekte 3,33; Scribe tahmini 0,336 kredi/sn, gerçekte 5,5
  (16 kat düşük tahmin). Sonuç: üretim bütçesinde `estimate_only` yanıtına güvenilmez; her partiden sonra gerçek fiyat
  okunup deftere yazılmalıdır.
- **TTS'in gerçek fiyatı bilinmiyor.** 144 TTS satırının hiçbirinde uzlaştırma yok. Aşağıdaki bütün TTS hesapları bu
  tahmin fiyatına dayanır (VARSAYIM). Müzikte gerçek fiyat tahminin %55'iydi; TTS'te durum ölçülmeden bilinemez.

**Sonraki hesapların tabanı olan ölçülmüş birim değerler:**

| Ölçü | Değer | Kaynak |
|---|---|---|
| Ders 2'nin 15 dk birim takımı | 68 birim, 4.042 karakter, 1.405 hece (karakter/hece 2,88) | `units.json` |
| Ses başına TTS, karakter başına | Neslihan 3,06 · Hakan 2,91 kredi (3 çekim × 0,926 = 2,78 + yeniden çekim) | defter |
| Yeniden çekim | Neslihan 5 birim (68'in %7,4'ü; 1.152,8 kredi), Hakan 3 birim (%4,4; 541,7 kredi) | defter |
| Scribe (konuşma), ses başına | 83 çağrı, 0,56 kredi/karakter | defter |
| Müzik | 15,0 kredi/sn; vokal denetimi 5,5 kredi/sn; 12 denetimin 12'si "boş metin, geçti" | defter, müzik manifestosu |
| Seçilen okumanın çekim sırası | Neslihan: 1. çekim 20, 2. çekim 22, 3. çekim 21, yeniden çekim 5 · Hakan: 27 / 23 / 17 / 1 | `selection-*.json` |

İki gözlem üretimi doğrudan etkiler:

1. **Çekim sayısı 3 kalmalı.** En iyi okuma Neslihan'da birimlerin %31'inde, Hakan'da %25'inde üçüncü çekimdi. Çekim
   sayısını 2'ye indirmek TTS kredisini üçte bir azaltır, ama birimlerin dörtte biri ile üçte biri arasında en iyi
   okumayı kaybettirir. "Mükemmel" ölçütüyle bu tasarruf önerilmez.
2. **Boşa giden yeniden çekimler.** İki seste de `a.durus` ve `k.yan` birimleri, Scribe "Sırtüstü" sözcüğünü
   "Sırt üstü" diye yazdığı için yeniden çekildi ve yine eşleşmedi (`report.md`, "Kulak listesi"). Scribe
   normalleştirmesine bitişik yazılan birleşik sözcükler için bir kural eklenirse bu harcama olmaz (CRITIQUE.md
   13. bulgudaki "yanlış alarm yüzünden gereksiz yeniden üretim" uyarısının somut örneği).

---

## 2. Ön-karışım mı, çalışma anında karışım mı?

### 2.1 3/5/15 kararı neyi değiştiriyor

PLAN.v2 çalışma anında karışım motorunu (kod-haritasi §8.5 V3) "5–30 dakikanın her dakikası", sahne seçimi ve
dönüşümlü seçenekler için önermişti. Aynı yerde ayrı süreler için ayrı karışımın (V2) eksisi "boyut 2,67 kat ve yalnız
sabit süreler" diye yazılmıştı. Sahibin son talimatı ilk yayını üç sabit süreye indirdi. Böylece V2'nin asıl eksisi
ortadan kalkıyor, boyut farkı da küçülüyor (§4). Pilot zaten ön-karışımla yapıldı: `render/tools/mix.py`, motorun
kurallarını (PLAN §D.4) çevrimdışı uygulayan bir karıştırıcıdır.

### 2.2 Karşılaştırma

| Ölçüt | (a) Ön-karışım | (b) Çalışma anında karışım |
|---|---|---|
| "Ses asla kesilmez" | Her dosya yayından önce ölçülür: süre, her konuşma parçasının kendi yerinde bulunması, tık, dijital sessizlik, konuşma/yatak farkı. Pilotun dört dosyası bu denetimlerin hepsinden geçti (§2.5) | Doğruluk her oynatımda cihazdaki zamanlamaya bağlıdır; ancak cihazdan kayıt alınarak denetlenebilir |
| Kilitli ekran | Tek AVAudioPlayer. Uygulamanın uyku sesi aynı sınıfla çalıyor (AlarmPlugin.swift:244-248) | AVAudioEngine, en az 5 oynatıcı düğüm ve yerel rampa katmanı (PLAN §E.3). Uygulamada yok |
| Yeni yerel kod | Küçük: uyku oynatıcısının genelleştirilmesi (§3) | Büyük: motor, olay zamanlaması, rampalar, yapılandırma değişimi, medya hizmetlerinin sıfırlanması |
| Ses–görsel uyumu | `timeline.json` karışımla aynı hesaptan çıkar; ekran oynatıcının konumunu okur | Aynı ilke; konum motordan okunur |
| Uygulamada JS planlayıcı | Gerekmez (planlayıcı üretimde, Python'da kalır) | Gerekir (`lib/yoga.js`, testleriyle) |
| Boyut, 1 ses (AAC 64) | ≈ 110 MB | ≈ 96 MB (VARSAYIM: ders başına 900 sn stereo yatak + ≈ 400 sn mono konuşma; Ders 2'de seçilen okumaların toplamı 334–339 sn) |
| Boyut, 2 ses | ≈ 221 MB | ≈ 120 MB |
| Esneklik | Yalnız 3/5/15; sahne ve dönüşümlü açılış dosyada sabit; konuşma/müzik dengesi yok | Her dakika, sahne, dönüşüm, denge kaydırıcısı |
| Üretim aracı | Var (`mix.py`; genelleştirilecek, §9) | Motorun yanında aynı çevrimdışı araç yine gerekir (denetim için) |

### 2.3 Öneri: ilk yayında ön-karışım

Gerekçe: sahibin en katı iki kuralı ("ses asla kesilmez" ve "mükemmel değilse gönderme") ancak yayından önce
ölçülebilen bir çıktıyla güvenceye alınır. Ön-karışımda bu ölçüm dosyanın kendisinde yapılır. Motor yolunda ise aynı
güvence, bu ortamda derlenemeyen ve cihazda henüz hiç denenmemiş bir yerel kodun doğruluğuna bağlı kalır. Üstelik
onaylanmış ön-karışım dosyaları, 2. aşamada yazılacak motor için hazır bir **karşılaştırma ölçütü** olur: motor aynı
dersi aynı süreyle çaldığında kaydı bu dosyayla örtüşmelidir.

Ön-karışımın kaybettirdikleri ve ilk yayındaki karşılıkları:

- **Sahne seçimi.** Ders 2'nin sahne seçicisinde üç seçenek var: "Kıyı", "Orman" ve "Ders içinde seçerim"
  (`pilot/ders2.lesson.json`, `scenePicker`). İlk yayında her ders tek sahneyle gelir (Ders 2: pilotta üretilen Orman). Kıyı istenirse kıyıya özgü
  birimler seslendirilir ve ayrı dosyalar basılır (kredi ve boyut artar); karar sahibindir.
- **Dönüşümlü seçenekler.** Ders 2'de `a.acilis` ve `n1.sec` ikişer seçeneklidir; ön-karışımda biri sabitlenir. En
  sık dinlenecek dosya yoldaki 3 dk sürümü olduğu için yalnız onun iki seçenekli basılması düşünülebilir; bedeli
  10 ders × 3 dk × AAC 64 ≈ +14 MB ve küçük bir TTS payıdır (VARSAYIM).
- **Konuşma/müzik dengesi** (±6 dB; PLAN §D.4) ilk yayında yok. 2. aşamada iki izli ön-karışım (aynı uzunlukta
  konuşma izi ve yatak izi, iki oynatıcı aynı anda) ya da motor ile gelir.
- **Duraklat / sürdür.** PLAN §B.5 "o anki klibin başından sürdür" der. Karşılığı: `timeline.json`'daki klip başına
  `currentTime` ile oturmak ve 1 sn'de ses açmak; kısma ve açma için uygulamadaki `setVolume(_, fadeDuration:)`
  kalıbı kullanılır (AlarmPlugin.swift:259).
- **Kapanışa geç.** 15 dk dosyasından, aynı ders ve aynı sesin 5 dk dosyasındaki Kapanış başına 2 sn'lik çapraz
  geçişle geçilir (iki oynatıcı). Ek dosya gerekmez. İmge ya da zor blok içinde basılırsa PLAN'ın "bırakma ön klibi" kuralı için ders
  başına bir iki küçük ön-karışım dosyası (ön klip + yatak kuyruğu) basılır. Bu, B.5 kuralının ön-karışımdaki
  karşılığıdır ve cihazda denenecek bir tasarım önerisidir (VARSAYIM).
- **"İstediğim dakikası."** Süre seçimi 3/5/15'tir; ders içinde bölüm işaretlerine atlama `timeline.json`'dan yapılır.

### 2.4 Üç dakikalık sürüm dersten türetilemiyor (planlayıcı ölçümü)

Pilot planlayıcısı 5–30 dk için kuruludur (timing.py:65 `MINUTES = list(range(5, 31))`). Bu görevde aynı planlayıcıyı
Ders 2 için 180, 240 ve 300 sn'de çalıştırdım (`plans2.py`; üretim hızı 5,6 hece/sn, yüksek duraklama profili):

- **300 sn:** plan kuruluyor, `check_plan` hatasız. Varış 3,5–55,4 sn (≈ 52 sn), Kapanış 197,9–300 sn (≈ 102 sn).
  Bu sürüm, pilotta seslendirilmemiş üç kısa metin ister (`n1.soyle`, `c2.akis`, `n2.hatirla` kısa biçimleri,
  toplam 194 karakter).
- **240 sn:** iki P1 blok (C2, N2) düşüyor; dört denetim bulgusu var.
- **180 sn:** plan sığmıyor. P1 blokların üçü de düştükten sonra en kısa sessizliklerle toplam 203,1 sn kalıyor;
  `check_plan` yedi bulgu veriyor (ör. "C1 bloğu 52,7 sn < 55").

Neden: Kapanış tek başına ≈ 102 sn sürüyor ve hızlı kapanışın alt sınırı 60 sn (timing.py:95
`QUICK_BOUNDS = (60.0, 110.0)`); bekleme ve kalkış adımları güvenlik gereği kısaltılmıyor (PLAN §B.5). Varış
bugünkü uzunluğunda (≈ 52 sn) kalır ve Kapanış hızlı kapanışın alt sınırına (60 sn) inerse, uzanarak yapılan bir derste
3 dakikanın yalnız ≈ 65 sn'si çekirdeğe kalır. **Sonuç:** her dersin 3 dk sürümü için yeni ve kısa bir Varış ile
Kapanış yazılması gerekir. Bu sürüm büyük olasılıkla oturarak ya da gözler açık yapılacak biçimde tasarlanmalıdır;
böylece yana dönme ve oturma adımlarına gerek kalmaz. Bu, usta hoca ve güvenlik incelemesinin kararıdır. Üretim hesabına ders başına
430–720 karakterlik yeni metin konmuştur (VARSAYIM: 150–250 hece). Yol yogayı 3 dk'lık bölümlerle çaldığı için (YOL.ilerleme
§5.13: "her bölüm 3 dk", yürüyüşle gün aşırı) en çok dinlenecek dosya budur; tasarımı ve sahibin dinlemesi önce onunla
yapılmalıdır. YOL.moduller §4.6 yoldaki süreyi 5 dk yazıyor; iki sürüm de üretildiği için üretim bu çelişkiden
etkilenmez.

### 2.5 "Ses asla kesilmez" dosyada nasıl kanıtlanır

Pilotun SPEC §7 denetimleri (`report.md`) her üretim dosyasına aynen uygulanır ve biri geçmezse dosya sahibe
gitmez:

- süre hedef ±1 sn (pilot 900,049 sn);
- olaylar plan sırasında; eksik ya da çift cümle yok (yapı gereği);
- her konuşma parçası kodlanmış dosyada kendi yerinde bulunur (pilot: 127–129 parça, en düşük ilinti 0,962, en büyük
  kayma 0,05 ms; kodlayıcı gecikmesi düzeltilerek);
- kurgu noktasında tık yok; 100 ms'den uzun dijital sessizlik yok (pilot en uzun 0,0264 sn);
- ≥ 1 sn parçalarda konuşma yatağın en az 15 dB üstünde; gerçek tepe ≤ −1 dBTP; bütünleşik yükseklik raporlanır
  (pilot −17,39 … −18,10 LUFS).

AAC seçilirse bu denetim, kodlanmış dosya yeniden çözülerek yapılmalıdır. Bu ortamda AAC çözülemediği için (§4) son
denetim adımı da Mac'te çalışır.

Pilotta yapılamayan tek denetim, tam karışımın Scribe ile metne hizalanmasıdır: yerel dosyayı yükleyecek araç yok ve
maliyeti kovayı aşıyordu (`report.md`, "Doğrulanmayanlar"). Üretimde de yükleme yolu yoksa pilottaki konum denetimi
(parça ilintisi) kullanılır; yükleme yolu bulunursa bedeli ses başına ≈ 75,9 bin kredidir (§6).

---

## 3. Uygulamadaki mevcut ses yolu ve gereken ek

**Okunan satırlar (bu görevde):**

- `app/ios/App/App/Info.plist:56-59`: `UIBackgroundModes` → `audio`. Kilitli ekranda çalma izni var.
- `app/src/lib/dalgaSleep.js:70-74`: iPhone uygulamasında uyku sesi iOS'un kendi oynatıcısıyla çalar; gerekçe Bug 22
  (web görünümündeki `<audio>` "çalıyor görünüp duyulmuyordu"). Tarayıcıda `<audio>` kalır.
- `dalgaSleep.js:88-101`: ekrandaki sayaç duvar saatiyle (`Date.now`, 500 ms aralık) sayıyor, oynatıcının konumuyla
  değil. Yoga için sayaç ve görsel **oynatıcının konumundan** okunmalıdır.
- `dalgaSleep.js:104`: JS yalnız `plugin.sleepStart({ seconds, fade })` çağırır.
- `app/ios/App/App/AlarmPlugin.swift:224-271` (`sleepStart`): çalınan dosya sabittir, `sakin-loop.wav` (:231);
  AVAudioPlayer sonsuz döngüde (:245); son `fade` saniyede `setVolume(0, fadeDuration:)` (:259); kesinti gözlemcisi
  kurulur (:256-258) ve yalnız kesinti bitip iOS `shouldResume` verirse sürdürür (:302-311); başka bir başlatma
  öncekini durdurur (:236). `audioInfo` oynatıcının `currentTime` değerini döndürür (:313-320, "time" :317).
- `app/ios/App/App/FeedbackPlugin.swift:286-296` (`beginSleep`): oturum `.playback`, seçeneksiz (başka uygulamanın sesi
  susar); `sleepActive` bayrağı (:247) çalarken kullanıcının ses tercihinin oturumu değiştirmesini engeller (:255).
  `endSleep` (:298) oturumu bırakır ve tercihe döner.
- `app/ios/App/App/MainViewController.swift:35`: `AlarmPlugin` kaydı; `app/src/lib/native.js:431`: JS adı `Alarm`.
- `app/src/lib/dalgaMusic.js:5-11`: Dalga'nın "sakin" kipi 60 BPM, her 6 ölçünün sonuncusu sessiz, Re majör sabit
  akor dizisi.

**Olmayanlar (arama sonucu):** `ios/App/App/*.swift` içinde `MPNowPlayingInfoCenter` ve `MPRemoteCommandCenter` yok
(kilit ekranında ders adı ve oynat/duraklat görünmez). `AlarmPlugin`'de rota değişimi gözlemcisi yok (kulaklık
çıkarılınca ne olacağı belirsiz). `package.json`'da `@capacitor/filesystem` yok (indirme altyapısı yok).
`app/src` içinde Supabase Storage çağrısı (`storage.from`) yok; `supabase.js:1-4` istemcinin yalnız hesap ve profil
için olduğunu yazıyor.

**Gereken ek (öneri; Swift bu ortamda derlenmez, ilk doğrulama Mac'te):** pbxproj'a dokunmamak için yeni sınıf mevcut
bir Swift dosyasına, örneğin `AlarmPlugin.swift`'e eklenir (PLAN §E.3 ile aynı yol). Mevcut `sleepStart`,
`sleepStop` ve `sleepStatus` değişmez.

- `lessonStart({ file, at, title })`: paketteki ya da indirilmiş dosyayı AVAudioPlayer ile açar, `currentTime = at`
  yapar. Oturum `AppAudioSession.beginSleep()` ile alınır; böylece `FeedbackPlugin.swift` değişmez. Uyku sesi
  çalıyorsa önce durdurulur; ikisi aynı oturum bayrağını paylaştığı için aynı anda çalmamalıdır.
- `lessonPause()` (1 sn kısma, sonra duraklatma), `lessonResume({ at })` (klip başına oturup 1 sn'de açma),
  `lessonSeek({ at })`, `lessonCrossTo({ file, at })` (kapanışa geç için ikinci oynatıcıya 2 sn geçiş),
  `lessonStop()`, `lessonStatus()` → `{ time, duration, playing, route }`.
- Gözlemciler: kesinti (mevcut kalıp), rota değişimi (eski çıkış kaybolunca duraklat), medya hizmetleri sıfırlanınca
  oynatıcıyı aynı konumdan yeniden kurma.
- Now Playing ve uzaktan komut (yalnız oynat ve duraklat).
- Dinlenen saniye yerelde (UserDefaults) de yazılır; JS açılışta uzlaştırır (Gelişim kaydı kilitte kaybolmasın).

Ekranda JS, `lessonStatus().time` değerini ekran açıkken saniyede birkaç kez okur ve `timeline.json`'daki olayları
çizer. Bluetooth gecikmesi doğrulanmadı; gerekirse oturumun çıkış gecikmesi eklenir (VARSAYIM).

---

## 4. Biçim ve boyut

**Üretim zinciri:** ElevenLabs'ten konuşma 44,1 kHz mono MP3, müzik 48 kHz / 192 kbit/sn MP3 olarak geliyor (pilot
`takes.json` ve müzik manifestosu). Karışım 44,1 kHz stereo kayan noktalı olarak kurulur. Ana kopya WAV olarak depo dışında
(sahibin Mac'i ve bulut) saklanır. Uygulama dosyası bu ana kopyadan tek seferde kodlanır.

**Ortam kısıtı:** bu ortamda `ffmpeg` ve `afconvert` yok; `soundfile` (libsndfile 1.2.2) MP3 ve OGG yazabiliyor, AAC
yazamıyor. MP3 burada `lameenc` ile üretilir (pilot böyle yaptı). AAC ancak sahibin Mac'inde `afconvert` ile üretilir
(komut ve ayarlar doğrulanmadı).

**Seek doğruluğu:** pilot MP3'ü ortalama bit hızlı (ABR) kodlandı. Değişken bit hızlı MP3'te `currentTime` ile klip
başına oturmanın ne kadar kesin olduğu doğrulanmadı. Klip başından sürdürme ve görsel uyum kesin konum istediği için
m4a içinde AAC ya da sabit bit hızlı MP3 tercih edilir (VARSAYIM; cihazda bilinen anlarda tık olan bir deneme
dosyasıyla sınanır).

**Boyut** (1 ses; 10 ders × (3 + 5 + 15) = 230 dk; pilot MP3'ü 15 dk'da 12,38–12,80 MB ölçüldü):

| Biçim | MB/dk | Hepsi (230 dk) | Yalnız 3 + 5 (80 dk) | Yalnız 15 (150 dk) | 2. aşama 30 dk (300 dk) |
|---|---|---|---|---|---|
| MP3 ABR 120 (pilot, ölçülen) | 0,83–0,85 | 190–196 MB | 66–68 MB | 124–128 MB | 248–256 MB |
| MP3 CBR 96 ya da AAC-LC 96 | 0,72 | 166 MB | 58 MB | 108 MB | 216 MB |
| AAC-LC 64 | 0,48 | 110 MB | 38 MB | 72 MB | 144 MB |
| HE-AAC 48 | 0,36 | 83 MB | 29 MB | 54 MB | 108 MB |

İki ses her sütunu iki katına çıkarır. `timeline.json` pilotta 15 dk için 73–76 KB; 30 dosya ≈ 1 MB (gerekmeyen
alanlar atılırsa daha az).

**Bugünkü paket:** `app/public` 54 MB (bu görevde ölçüldü: mediapipe-wasm 34 MB, sleep 16 MB, voice 4,8 MB);
kod-haritasi §5'e göre ham toplam ≈ 81 MB (Sounds klasörü dahil). AAC 64 ile 1 ses eklenince ham toplam ≈ 190 MB olur.
Ses dosyaları IPA sıkıştırmasında pek küçülmez (VARSAYIM). App Store'un hücresel indirme eşiği bu çalışmada
doğrulanmadı; bilinen değer 200 MB'tır (VARSAYIM).

**Dengeleme olanağı:** iOS'ta `sakin-fade-*.mp3` dosyaları (≈ 7,6 MB) çalınmıyor. Yerel oynatıcı yalnız
`sakin-loop.wav`'ı açıyor (AlarmPlugin.swift:231); kısılma MP3'lerini yalnız web oynatıcısı kullanıyor
(dalgaSleep.js:60-64, :183-185). Bunları iOS paketinden çıkarmak bir derleme adımı ister (ayrı iş).

**Kodek kararı pilotta, kör testle:** aynı Ders 2 15 dk karışımı MP3 ABR 120, AAC 96, AAC 64 ve HE-AAC 48 olarak
basılır; iPhone hoparlörü ve AirPods ile, sessiz odada, panelde dinlenir. AAC 64 pilot MP3'ünden ayırt edilemezse
AAC 64 seçilir; edilirse AAC 96.

**Depo:** `app/public` altındaki dosyalar depoya girer (`app/.gitignore` yalnız `public/mediapipe-wasm`'ı dışlıyor;
Git LFS yok; `.git` bugün 211 MB). Bu yüzden depoya yalnız onaylanmış son dosyalar, parti başına bir kez girer. Ana
kopyalar ve ham çekimler depo dışında durur (pilotun ham çekimleri tek ders × iki ses için 44 MB tuttu).

---

## 5. Paket içi mi, indirme mi? Gizlilik

| Seçenek | Artısı | Eksisi |
|---|---|---|
| **(A) Hepsi pakette** (öneri; 1 ses, AAC 64 ≈ 110 MB) | Ağ yok, sunucu yok, gizlilik akışı yok; ders her koşulda ve uçak kipinde çalar; "asla kesilmez" ağa bağlı değildir | Uygulama büyür; her ses güncellemesi yeni sürüm ister |
| (B) 3 ve 5 dk pakette, 15 dk'lar tek paket hâlinde indirilir | Yoldaki günlük sürüm (3 dk) her zaman yerelde; paket ≈ 38 MB büyür | İndirme altyapısı yok, yazılmalı (yerel URLSession ya da `@capacitor/filesystem`); depolama, bütünlük, gizlilik işi |
| (C) iOS On-Demand Resources / Background Assets | Dosyaları Apple barındırır, yeni sunucu yok | Bu projede ve Capacitor ile uyumu doğrulanmadı |
| (C') Varsayılan ses pakette, ikinci ses indirilir | İki ses sunulacaksa boyutu sınırlar | (B) ile aynı altyapı işi |

**İndirme seçilirse gizlilik ve güvence kuralları:**

1. Sunucu erişim kaydı IP adresini, zamanı ve dosya yolunu görür. `ders4-zor-anlar.m4a` gibi bir ad, kişinin hangi
   derse ihtiyaç duyduğunu ele verir. Bu yüzden dosya adları içerik özeti (SHA-256) olur ve dersler tek tek değil,
   **tek paket** hâlinde indirilir; istekte kullanıcı kimliği ve oturum anahtarı taşınmaz.
2. Supabase Storage bugün kullanılmıyor. Açık (public) bir kova içerik korumasını zayıflatır: adresi bilen herkes
   dosyayı indirebilir. İmzalı adres ve abonelik denetimi (yeni bir Edge Function) ise kimliği indirmeyle eşleştirir.
   Öneri: gizlilik öncelikli, yani açık kova + nötr adlar + tek paket; içerik koruması bilinçli olarak ikinci planda.
   Supabase erişim kayıtlarının saklama süresi doğrulanmadı.
3. Bütünlük: dosya özetlerinin listesi uygulamanın içinde gelir. İndirilen her dosya özetle karşılaştırılır, ancak
   tamamı indirilip doğrulanınca açılır. Akışla (streaming) çalma yoktur; 15 dk'lık bir ders ağ yüzünden yarıda
   kesilemez. Paket hazır değilse aynı dersin 3 ve 5 dk sürümü önerilir.
4. Dosyalar iOS'un kendiliğinden silebileceği önbellek klasörüne değil, kalıcı uygulama desteği klasörüne yazılır ve
   yedeklemeden hariç tutulur (API ayrıntıları doğrulanmadı).
5. Sunucudan indirme eklenirse App Store gizlilik etiketi ve aydınlatma metni gözden geçirilir (doğrulanmadı).

---

## 6. Kredi tahmini: ilk yayın (10 ders × 3/5/15)

**Kapsam:** Ders 2'nin 15 dk birimleri iki seste de hazır. Ders 2 için yalnız 5 dk kısa metinleri ve 3 dk'nın yeni
Varış–Kapanış metni eklenir. Kalan 9 ders baştan üretilir.

**Varsayımlar:**
- TTS: 0,926 kredi/karakter/çekim (uzlaştırılmamış tahmin fiyatı), 3 çekim, yeniden çekim pilot oranında (karakter
  başına 3,47–3,62 kredi, Scribe dahil).
- Ders başına metin: alt uç Ders 2'nin ölçülen 15 dk takımı (4.042 karakter) + 5 dk kısa metinleri (194) + 3 dk yeni
  metni (430) = 4.666 karakter. Üst uç, PLAN §B.4.1'deki yol B tam metin bütçesinin Ders 2'de ölçülen orana (15 dk
  takımı / tam metin = 1.405 / 2.270 = 0,62) göre ölçeklenmesi + 3 dk için 720 karakter: derse göre 5.760–7.553
  karakter. Ders 2 uyku odaklı ve seyrek bir ders olduğu için öteki derslerin daha yoğun olması beklenir.
- ElevenLabs müziği: ders başına 1.200–1.620 sn üretim (pilot 1.620), 15,0 kredi/sn; bütün üretilen saniyelere Scribe
  vokal denetimi (5,5 kredi/sn). Doğa: 5 tür × 4 × 30 sn + 12 kuş çağrısı (PLAN §D.3), 3,33 kredi/sn ≈ 2,2 bin kredi.
- Dalga motoru müziğinde kredi yoktur (§7'deki iş yükü ayrıdır).

| Senaryo | Kredi | USD (5.500 kredi = 1 USD) |
|---|---|---|
| **1 ses + ElevenLabs müziği** | **371 bin – 533 bin** | **67,5 – 96,9** |
| 1 ses + karma müzik (bordun/ton dersleri 1, 4, 5, 8 uygulama hattından; 5 ders ElevenLabs) | 273 bin – 397 bin | 49,6 – 72,2 |
| 1 ses + Dalga motoru müziği | 150 bin – 228 bin | 27,3 – 41,4 |
| 2 ses + ElevenLabs müziği | 519 bin – 759 bin | 94,4 – 137,9 |
| 2 ses + Dalga motoru müziği | 298 bin – 454 bin | 54,1 – 82,5 |

Bileşenler (1 ses + ElevenLabs): 9 dersin konuşması 145,6–222,0 bin; Ders 2'nin eki 2,2–3,7 bin; 9 dersin müziği
221,4–305,0 bin (ders başına 24,6–33,9 bin); doğa 2,2 bin. **En büyük kalem müziktir.**

**Parti başına** (3 ders, 1 ses + ElevenLabs): 122 bin – 184 bin kredi (≈ 22–33 USD). Ders başına yalnız konuşma:
16,2–27,3 bin kredi.

**Tabloda olmayan ek kalemler:**
- **Tasarlanmış hoca sesi adayı.** Sahibin kararı "Neslihan, Hakan + yeni aday; pilotta üçü kör karşılaştırılır"
  idi, ama pilot yalnız iki sesle üretildi. Üçüncü adayla Ders 2'nin 15 dk'sı ≈ 14,0–14,6 bin kredi (≈ 2,6 USD) +
  ses tasarımı önizlemeleri (maliyeti doğrulanmadı).
- **Kulak ve sahip düzeltmeleri için yedek pay:** konuşmanın %15'i (VARSAYIM) → 1 seste ≈ 22–34 bin kredi.
- **Tam karışım Scribe hizalaması** (isteğe bağlı, yükleme yolu bulunursa): 230 dk × 5,5 kredi/sn ≈ 75,9 bin kredi
  (≈ 13,8 USD) ses başına.
- PLAN §F.1'deki "seslerin eğitilmesi" (yol B'de ≈ 22 bin; model ve biçim denemeleri) defterde görünmüyor; pilot
  doğrudan `eleven_v4` ile üretildi. Yapılacaksa ayrıca eklenir.

**2. aşama (30 dk; kaba tahmin, VARSAYIM):** Ders 2'de 30 dk'ya çıkmak, 15 dk takımında olmayan 79 klip ve 2.490
karakter ister (planlayıcı 5–30 dk × üç hız ile çalıştırıldı; `plans3.py`), yani metin ≈ %62 büyür. 10 ders için 1
seste konuşma ≈ 86–148 bin kredi tutar. ElevenLabs müziği kullanılırsa Derin evre aileleri için ders başına ≈ 900 sn
daha üretilir; bu da ≈ 185 bin kredi eder.

**Kıyas:** PLAN.v2 pilotu yol B için 123–141 bin kredi öngörmüştü; gerçek pilot 62,9 bin kredi tuttu (yalnız 15 dk, ses
eğitimi turu yok, müzik tahminin %55'i). 10 dersin tamamı için öngörülen 753 bin – 1,17 milyon kredi, ilk yayının
daraltılmış kapsamında (1 ses, üç süre) 371–533 bine iner.

**Bütçe denetimi (pilottaki gibi, sıkılaştırılmış):** her parti başlamadan tahmin edilir ve sahibin onayladığı tavanla
karşılaştırılır; her ücretli çağrı önce deftere yazılır; her çağrıdan sonra gerçek fiyat okunup uzlaştırma satırı
yazılır (**TTS dahil**; pilotta TTS uzlaştırılmadı); tavan aşılacaksa durulur ve rapora yazılır. `generations_count`
her çağrıda açıkça 3 verilir (verilmezse varsayılan 4'tür; elevenlabs.md §1).

---

## 7. Müzik yatakları: paylaşım ve benzersizlik

- **Ders içinde paylaşım (öneri).** Bir dersin 3, 5 ve 15 dk sürümleri aynı yatak ailelerini kullanır: kısa sürümler
  Varış ailesinin başını ve Kapanış yatağını çalar. Benzersizlik ders düzeyinde korunur ve kısa sürümler için ek müzik
  kredisi gerekmez.
- **Dersler arasında yatak paylaşılmaz.** Her dersin müzik imzası farklıdır (PLAN §A.2.1: Ders 2 Mi♭ majör pad +
  alçak yaylılar, Ders 3 La♭ majör pad + keçe piyano, Ders 6 Re majör kalimba + akustik gitar vb.). Yatakları
  paylaşmak ≈ 221–305 bin kredi (≈ 40–55 USD) kazandırırdı ama sahibin "her ders benzersiz" isteğine aykırıdır;
  önerilmez. Daha küçük ve ilkeye uygun tasarruf: ders başına aday müzik süresini 1.620 sn'den 1.200 sn'ye indirmek
  (ders başına ≈ 6,3 bin kredi az).
- **Paylaşılabilecek işlevsel katmanlar:** oda sesi (−58 dBFS; neredeyse duyulmaz, dijital sessizliği önler); doğa
  türleri (5 tür; PLAN §A.2.1'deki iki yakınlık kararı uygulanır: Ders 2 kıyı ile Ders 9 okyanus, Ders 2 orman ile
  Ders 6 zemini); dönüş tınısı yerelde sentezlenir (pilotta D5) ve her dersin tonuna taşınabilir, kredisi yoktur.
- **Dalga motorunun sınırı:** "sakin" kipi tek bir sentez motoru ve Re majör sabit bir akor dizisidir
  (dalgaMusic.js:5-11). On ayrı imza için ders başına yeni bir besteci ve tını gerekir: kredi yok ama kod işi var ve
  keçe piyano, kalimba ya da viyola gibi akustik tınıları sentezle karşılamak sınanmadı (VARSAYIM). Kör A/B sonucu bu
  kararı verir. Karma yol makuldür: imzası bordun ya da ton olan Ders 1, 4, 5 ve 8 uygulama hattından (PLAN §A.2.1
  Ders 1 için bunu zaten öngörüyor), akustik çalgılı dersler ElevenLabs'ten.
- **Ders içinde tekrarsızlık:** 15 dk içinde aynı döngü duyulmaz. Pilot bunu iki aile × iki parça, ayrı bir Varış
  adayı, imge katmanı ve Kapanış parçasıyla sağladı (1.620 sn üretim, 900 sn kullanım).

---

## 8. Üretim partileri ve sahibin onay kapıları

Sahibin kuralı: kendisine yalnız bitmiş ve ölçülmüş iş gider; kusur sormadan düzeltilir (SAHIP_ISTEKLERI 2 ve 3).
**Model sesi dinleyemez;** kulak kararı gereken her şey insanla verilir (PLAN §G10'daki inceleyiciler ya da sahip).

**Kapı 0: pilotun kapatılması (sahibe gitmeden, ücretsiz ya da küçük işler).**
1. Hakan'da gerçek tepe sınırlayıcısının 3 dB'den fazla kıstığı 40 parça, klip düzeyinde tepe yönetimiyle yeniden
   karıştırılır ve ölçülür.
2. Scribe normalleştirmesine birleşik sözcük kuralı eklenir ("sırtüstü" = "sırt üstü") ve `a.durus` ile `k.yan`
   bayrakları yeniden değerlendirilir.
3. `n1.sec` ve `n2.hatirla`'daki kesim sapması kurala dönüştürülür: iki nokta duraklaması en uzun olsa bile kesim cümle
   sonundaki duraklamadan yapılır. SPEC'e yazılır.
4. Yalnız ölçüyle denetlenen kesimler (ses başına 32 birim) ve kulak listesi, inceleyicinin kulağına gider.
5. Üçüncü aday ses (tasarlanmış hoca sesi): ya üretilir (≈ 14–15 bin kredi + önizlemeler) ya da sahip bu adımdan
   vazgeçtiğini söyler. Pilot bu hâliyle sahibin kararındaki "üç aday" koşulunu karşılamıyor.

**Kapı 1: sahip dinler.** Sahip dört kör karışımı (üçüncü aday ses eklenirse altısını) dinler. Sesi ve müzik kaynağını seçer; kusur
görürse söyler, görmezse onaylar. Bu kapı kredi harcamaz (düzeltmeler dışında).

**Kapı 2: kalıp kilidi.** Seçilen ses ve müzikle üretim şartnamesi (SPEC v3) sabitlenir: ses, model, çekim sayısı,
yükseklik hedefleri, kodek ve bit hızı (kör kodek testi), dosya adları, `timeline.json` şeması, QA eşikleri, Scribe
normalleştirmesi, kesim kuralı, 3 dk biçimi. Ders 2'nin 3, 5 ve 15 dk'sı seçilen sesle basılır (≈ 2,2–3,7 bin kredi).
Yerel oynatıcı (§3) yazılır ve cihazda denenir: kilitli ekranda 15 dk, arama, sessiz tuş, AirPods çıkarma, Bluetooth'a
geçiş, ekranın kendiliğinden kilitlenmesi, duraklat ve klip başından sürdür, kapanışa geç. Sonuç HATA_GUNLUGU'na yazılır.
Sahip Ders 2'yi **cihazda** dinler ve onaylar. Bu kapıdan sonra motor ya da şartname değişmez; değişirse Ders 2
yeniden basılır.

**Kapı 3–5: üç parti** (PLAN §F.2 sırası; ilk parti gece dersini ve nefes–görsel kilidini içerdiği için önce gelir):
Parti 1 = Ders 1, 3, 5 · Parti 2 = Ders 4, 7, 8 · Parti 3 = Ders 6, 9, 10. Her partinin adımları:
1. Metin: 30 dk tasarımına göre yazılır; bu yayında 3/5/15'in kullandığı birimler seslendirilir. Üç insan incelemesi
   (Türkçe editör, usta hoca, Ders 4 ve 7'de psikolog) **seslendirmeden önce** biter. (PLAN §C.8'e göre Ders 2 metni
   insan editör onayı bekliyordu; dosyalarda bu onayın kaydı görülmedi.)
2. TTS'te birim başına 3 çekim alınır, çekimler nesnel ölçütlerle sıralanır, Scribe ile birebir eşleşme aranır ve en
   çok bir yeniden çekim yapılır. Ham dosyalar hemen indirilir (ElevenLabs imzalı adresleri 2 saat geçerli: `takes.json`'da `X-Goog-Expires=7200`).
3. Müzik dersin kendi imzasıyla üretilir; düzlük, vuruşsuzluk, döngü eki ve vokal denetimlerinden geçer.
4. Karışım 3, 5 ve 15 dk için basılır; §2.5'teki bütün denetimlerden ve kodlama sonrası konum denetiminden geçer.
5. Rapor pilotun `report.md` biçiminde yazılır; kulak listesi inceleyiciye gider.
6. Sahip her dersin en az 3 ve 15 dk sürümünü dinler; onaylanan parti TestFlight'a girer.
Parti kredisi başlamadan tahmin edilir (≈ 122–184 bin, 1 ses + ElevenLabs) ve kalan bütçeyle karşılaştırılır.

**Kapı 6: yayın.** On dersin 3/5/15 sürümlerinin hepsi onaylanınca modül yayına ve yola girer. Kısmi yayın (yalnız
onaylı derslerle) teknik olarak mümkündür ama sahibin "mükemmel değilse gönderme" kuralına göre karar onundur.

---

## 9. Üretim araçlarında yapılacaklar (kredisiz)

- `render/tools/mix.py` bugün Ders 2'ye bağlı: `T = 900` (mix.py:47), sahne Orman (:48), 14 MB sınırı (:60; Artifact
  içinde dinletmek için). Kodlayıcı önce VBR V2'yi dener, 14 MB'ı aşarsa ABR 120'ye, sonra CBR 112'ye düşer
  (:906-937). Üretim için ders, süre, sahne, ses ve müzik kaynağı parametre olur; kodek boyuta göre değil, kalıp
  kilidindeki karara göre sabitlenir.
- `pilot/timing.py` Ders 2'ye bağlı (`LESSON_PATH` :49) ve 5–30 dk için kurulu (:65). Ders dosyası parametre olur,
  Ders 2'ye özgü sabitler ders JSON'una taşınır, 3 dk için kısa Varış–Kapanış kuralı ve denetimi eklenir.
- Deftere TTS uzlaştırması ve parti tavanı eklenir; Scribe için tahmin yerine gerçek fiyat (5,5 kredi/sn) kullanılır.
- Seçim hattında Scribe normalleştirmesine birleşik sözcük kuralı eklenir; kesim, cümle sonundaki duraklamadan yapılır.
- Ham çekimler, seçim dosyaları ve WAV ana kopyalar depo dışında iki kopya hâlinde saklanır (sahibin Mac'i ve bulut).

---

## 10. VARSAYIMlar ve doğrulanmayanlar

- TTS'in gerçek kredi fiyatı (defterde yalnız tahmin var); aboneliğin kotası ve kalan kredisi.
- Öteki 9 dersin metin uzunluğu (alt uç Ders 2'nin ölçümü, üst uç PLAN bütçesi); 3 dk metninin uzunluğu (150–250 hece).
- 3 dk sürümün biçimi (oturarak ya da gözler açık) ve güvenlik kapanışının 3 dk'daki karşılığı.
- AAC 64'ün pilot MP3'ünden ayırt edilemeyeceği (kör test yapılmadı); AAC'nin Mac'te `afconvert` ile üretimi.
- AVAudioPlayer'da kodlanmış dosyada `currentTime` ile oturmanın kesinliği; Bluetooth gecikmesi.
- Uyku sesinde bile kilitli ekranda tam süre çalmanın cihazda görülmemiş olması (kod-haritasi R13); ders oynatıcısı
  için de aynı test gerekir.
- Rota değişiminde AVAudioPlayer'ın davranışı; medya hizmetleri sıfırlanınca yeniden kurma.
- Ses dosyalarının IPA'da ne kadar sıkıştığı; App Store hücresel indirme eşiği (bilinen değer 200 MB).
- Supabase erişim kayıtlarının saklama süresi; iOS On-Demand Resources'un Capacitor ile uyumu.
- Dalga motorunun akustik tınıları karşılaması; ders başına 1.200 sn müziğin tekrarsızlık için yetmesi.
- Tasarlanmış sesin önizleme maliyeti ve kullanım koşulları; kütüphane seslerinin ticari kullanım koşulları.
- Yedek düzeltme payı (%15).

---

## 11. Sahibin vereceği kararlar (bu konuda)

1. İlk yayında ön-karışım (öneri) mı, çalışma anında motor mu?
2. Tek ses (öneri) mi, iki ses mi? Tasarlanmış üçüncü aday pilota eklensin mi?
3. Müzik kaynağı: kör A/B'nin sonucu; ElevenLabs, Dalga ya da karma.
4. Hepsi pakette (öneri, ≈ 110 MB) mı, 15 dk'lar indirme mi? İndirmede gizlilik öncelikli kurgu (öneri) mu, içerik
   koruması öncelikli kurgu mu?
5. İlk yayında sahne seçimi ve dönüşümlü açılış olmasın mı (öneri), 3 dk için iki seçenekli dosya mı?
6. 3 dk sürümün biçimi (usta hoca ve güvenlik incelemesiyle).
7. Parti başına kredi tavanı ve toplam tavan (öneri: 1 ses + ElevenLabs için parti başına 185 bin, toplam 570 bin
   kredi ≈ 104 USD; yedek pay dahil, tasarlanmış ses hariç).
