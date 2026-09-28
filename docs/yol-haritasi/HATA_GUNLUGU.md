# Hata günlüğü (tek yer)

Debug sürecinin kaydı: her kontrol, hipotez, deneme ve sonuç. Kural (debug protokolü): bir şeyi ikinci kez kontrol
etmeden önce burası okunur; aynı yöntem iki kez başarısızsa yöntem değişir. Oturumlar arasında kaybolmasın diye
repoda durur (önce /home/claude/.debug-journal.md idi; 2026-09-28'de buraya taşındı). Yeni kayıt buraya eklenir.
Hata numaraları: Bug 1–20. "Bug 12" iki kez kullanılmıştı; kalibrasyon olanı Bug 17 oldu.

# Debug Journal
## Bug: Kalibrasyon x puanı 2.01 < minScore 2.5 → "tekrar dene"; kullanıcı nokta bazlı canlı onay (yeşil) istiyor
## Başlangıç: 2026-09-25
## Durum: AÇIK

### Semptomlar
- Build 15 raporu: x: angX 2.01, lookX 2.01, blendX 1.36; y: 2.7 (geçti). minScore 2.5.
- angX: left 1.75, right -0.30 (ayrım 2.05°), center 1.13 → center2 0.19 (kayma ~0.9°)
- camX: left 0.34, right -2.08 (ayrım 2.43°)
- headX kayma: -2.10 → -0.99 (session boyunca ~1.1°)
- Kullanıcı: kamera zaten tespit ediyor; noktaya bakınca nokta yeşil olsun; sonda "tekrar dene" olmasın.

### İlk Hipotezler
1. [ ] HİP-1: Puan formülü (ayrım/gürültü?) yatayda ekran dar olduğu için doğal olarak düşük; eşik 2.5 yatay için fazla sıkı.
2. [ ] HİP-2: center→center2 kayması (sürüklenme) modeli bozuyor; c merkezi 0.65 iken sol 1.10, sağ 0.95 uzakta.
3. [ ] HİP-3: Kalibrasyon akışı toplu (sonda) değerlendiriyor; hedef bazlı kabul (sabit + baş sabit + örnek yeterli) yok.

### Kontrol Logu

### Deneme Logu

### Çıkmaz Yollar
- (önceki oturum) Baş-göreli sinyallerle ekran dışı hedefler: ayrım ~1°, başarısız → v2 ekran-içi noktalara geçildi.

### Sonuç

#### KONTROL-1 gazeCalib.js fitAxis (satır 105-125)
- score = min(|neg-c|,|pos-c|) / max(c.mad, neg.mad, pos.mad, floor). c = center+center2 BİRLEŞİK özet.
- Hesap: angX birleşik merkez med≈0.65 (center 1.13, center2 0.19) → birleşik MAD≈0.47 (kayma!). sep=min(1.10,0.95)=0.95 → 0.95/0.47=2.01 ✔ rapordaki değer.
- angY: c≈-4.39, birleşik MAD≈0.84 (kayma 1.7°), sep 2.26 → 2.7 ✔.
- HİP-2 DOĞRULANDI: center→center2 kayması birleşik merkez MAD'ını şişiriyor; hedef-içi MAD yalnızca 0.02-0.15.
- camX kayması 0.26° (angX 0.94°): kameraya-göre bakış baş kaymasından etkilenmiyor (VOR). camX left 0.34 / right -2.08 / c≈-0.9 → sep 1.18.
- camX/camY AXIS_FEATURES'ta YOK (yalnızca rapor). NOISE_FLOOR'da cam yok.

#### KONTROL-2 GazeCalibration.jsx + gaze.js createModelReader
- Ekran: her hedef MOVE 450 + SETTLE 1200 + COLLECT 1300 ms; kararlılık kontrolü YOK; sonda fitModel → !ok ise "Bir kez daha deneyelim / Tekrar dene" (tüm akış baştan).
- Okuyucu: applyModel FEATURES[model.x.feature] — camX de FEATURES'ta var → modelde camX seçilirse çalışma zamanı değişmeden çalışır.
- Test: calibReport keys ['angX','lookX','blendX'] bekleniyor (satır 209) → camX eklenince güncellenecek.

### FIX PLANI (HİP-2 doğrulandı; HİP-1 kısmen: eşik değil, gürültü tanımı yanlış)
1. gazeCalib.js: AXIS_FEATURES'a camX/camY (ilk sırada); NOISE_FLOOR cam 0.25 (VARSAYIM).
   fitAxis(center, neg, pos, feats, center2): merkez = iki merkez ortancasının ortalaması; noise = max(hedef-içi MAD'lar, floor, drift/2); drift = |c1-c2| raporda.
   Bu veriyle beklenen: camX 1.17/0.25=4.7, camY 1.57/0.42=3.7 → ok.
2. Ekran: hedef kabulü = COLLECT_MS dolu + pencere kararlı (MAD ≤ floor) → nokta yeşil + titreşim, sonra sıradaki. Kararsızsa MAX_MS'e kadar bekle.
   right bitince x ekseni anında sınanır; zayıfsa sol+sağ bir kez daha (kuyruk). down bitince y için aynı. Sonda !ok ise yalnızca zayıf eksenin hedefleri + center2 (en fazla 2 tur). Hâlâ zayıfsa skor ≥1.5 → kaba model kaydet (VARSAYIM).

#### DENEME-1 gazeCalib.js (fitAxis drift/hedef-içi gürültü + camX/camY aday + windowStable)
- Uygulandı. Build 15 sayılarıyla test: angX 2.04 (weak), camX 4.7 → ok. gazeCalib.test 33/33 EXIT=0.
- Test güncellemesi: "cam alanı yoksa" ve "phone yoksa" testleri artık cam:false pencereyle kalibre model kullanıyor (cam modeli cam alanı gerektirir — aynı eklenti, gerçek hayatta çelişki yok).
- Başarılı mı: EVET (birim). Cihaz doğrulaması Build 16'da.

#### DENEME-2 GazeCalibration.jsx akışı (hedef bazlı kabul + yeşil nokta + eksen tekrarı)
- Playwright cal16.mjs A: 6 hedef ~3 sn, hepsi yeşil, "Hazır", model camX 67.6 / camY 55.7, önizleme sol/orta doğru. ERR [].
- Senaryo B: gezinen bakışta "Noktada kal…" → 5 sn'de kabul; sağda göz merkezde → x zayıf → yalnızca sol+sağ "Bir kez daha" eklendi (3/8, 4/8) → "Hazır". ERR [].
- Tüm testler 402/402 EXIT=0.
- Yan bulgu: ses düğmesi sol üstte kesik (styles.css .sound-toggle position:relative sonradan yüklenip .gazecal-sound'u eziyor) → .gazecal-stage .gazecal-sound özgüllüğü. Build 14'te de bozuktu.
## Durum: ÇÖZÜLDÜ (birim + tarayıcı); cihaz doğrulaması Build 16

## Bug 2 (Build 16): x camX 1.51 < 2.5; y 8.4 ok. Durum: AÇIK
#### KONTROL-3 Build 16 raporu
- camX: center -2.63 (mad .028), left -2.17 (.023), right -2.98 (.025), c2 -2.58 → sep 0.38°, drift 0.05. noise = floor 0.25 → 1.51.
- angX: left 2.11 ≈ center 2.13 (sol gözde hareket YOK), right 1.73 (0.4°). lookX/blendX aynı: sol = orta.
- head: left dx +0.36 → soldaki camX farkının çoğu baş (0.36/0.46); sağda baş 0.06, göz 0.4.
- Dikey: camY up 1.84 / down -2.56 → ±2.2°; ARKit yatay kazancı dikeyin ~1/5'i (aynı ekran geometrisinde beklenen oran 1.5).
- HİP-4: taban gürültü (0.25, Build 15 camY MAD'ından) yatay için fazla; hedef-içi MAD 0.02–0.04 → floor 0.1 ile 3.8 → ok. DOĞRULANDI (hesap).
- HİP-5: "başını çevirme" yönergesi camX ile çelişiyor: camX = baş+göz = ekranda bakılan nokta; Build 15'te hafif baş hareketiyle ayrım 2.4° idi. Yönerge yumuşatılacak (guard 5° kalır).
- Rapor eksiği: göz başına cam değeri yok → camLX/camRX eklenecek (gözlük/tek göz sorununu görmek için).
#### DENEME-3 NOISE_FLOOR cam 0.1 + STABLE_MAD ayrı + göz başına rapor + yönerge yumuşatma
- Build 16 sayılarıyla birim testi: camX 3.8 ok; angX weak. 403/403 EXIT=0. Playwright A: Hazır, ERR [].
- Cihaz doğrulaması Build 17'de. Durum: ÇÖZÜLDÜ (birim) / cihaz bekliyor

## Bug 3 (Build 17?): Yılan gözle hareket etmiyor; giriş animasyonunda adamın gözleri komutlara uymuyor. Durum: AÇIK
### Hipotezler
- HİP-6: Oyun okuyucusu kalibrasyon modelini yüklemiyor / eşikler (ENTER_DEG) 0.38° ayrımda tetiklenmiyor.
- HİP-7: Oyun içinde baş dönüşü guard'ı camX sinyalini eliyor.
- HİP-8: Build 16 verisi: sola bakışta göz sinyali sıfır → sensör bu kişide yatayı vermiyor; kalibrasyon geçse de oyun sinyali yok.
- HİP-9: GazeTutorial pratik aşamasında frame/yön eşleşmesi yanlış (ayna: adam bize bakıyor).
#### KONTROL-4 / DENEME-4 (Bug 3)
- HİP-6 ÇÜRÜTÜLDÜ: createGazeReader modeli loadGazeModel ile yükler (gaze.js 365); ENTER 10/20 = kalibrasyon aralığının %50'si.
- HİP-7 ÇÜRÜTÜLDÜ: SnakeGame'de headTurned/lookingAtPhone kullanılmıyor.
- HİP-9: CSS kapsamı doğru (.gt-anim animasyon, .gt-fixed inline transform). Chromium'da pratik kareleri çalıştı (önceki oturum). iOS WebKit'te <g> inline CSS transform şüpheli → SVG transform özniteliğine geçildi (her tarayıcıda çalışır). Cihazda doğrulanacak.
- HİP-8 (asıl): Build 16'da göz-only sola bakış sinyali 0; camX'teki 0.46'nın 0.36'sı baş. Oyun sinyali ancak doğal (baş+göz) bakışla oluşur. "Başını çevirmeden" metni kaldırıldı; teşhis kaydı (snake-gaze) + "Bakış verisini paylaş" eklendi → Build 19 verisi bekleniyor.
- Testler 414/414; Playwright pr3: pratik sağ→yukarı→sol→aşağı tamam, ERR [].

## Bug 4 (Build 20): tek E testinden sonra mola kilidi. Bug 5: okuma testi büyük yazıyla, işaretlemeden sıra ile geçiyor. Durum: AÇIK
### Hipotezler
- HİP-10: 'test' türü segmentler 5 dk bütçeye sayılıyor (usage.sinceRest tüm segs) + profil ekran 6+ → bütçe 3 dk (benim VARSAYIM'ım) → bir E testi (3 göz × ~1 dk) bütçeyi bitiriyor.
- HİP-11: Okuma testinde konuşma tanıma eşiği düşük ya da ortam sesi cümleyi "okundu" sayıyor → kendiliğinden geçiyor. Boyut merdiveni büyükten başlıyor (2/10 büyük normal), ama 10 boyut kamera mesafesine göre ölçekleniyor.

## Bug 6 (Build 19 raporu): x "veri yok", y 1.1. Durum: AÇIK
#### KONTROL-5
- center: n=60 (rolling 60 kare = 5 sn dolunca kararsızken kabul edildi), camX MAD 1.52, headX MAD 1.83, closure 0.21 → ilk orta penceresi hareketli/kırpmalı ÇÖP. center2 temiz (MAD 0.02–0.10).
- head ref bu çöp ortadan (-1.96) → diğer hedeflerde baş -6.3/-5.3 → guard (5°) "sağ"da 13 kare attı.
- x null: fitAxis dNeg*dPos<0 şartı; center(−0.27) ile left(−3.42)/right(−4.30) aynı tarafta. center2 ile de: left −3.42 ≈ c2 −3.34, right −4.30 → aynı taraf → yine null. Yani sağ–sol gerçekten ayrışmadı: sola bakışta kamera-göre bakış ortayla aynı (baş 1° sola dönmüş, göz 1.27° sağa telafi etmiş).
- y weak: noise = max(center camY MAD 1.66, ...) → 1.67/1.66 = 1.0. center2 ile: sep 1.67 / max(0.10, 0.05, 0.11, floor .1, drift .18) = ~9 → GEÇERDİ. Çöp orta y'yi de öldürdü.
- Sonuç: (1) kararsız orta ASLA kabul edilmemeli; (2) fit temiz ortayı kullanmalı; (3) sensör yatay göz sinyali bu kullanıcıda 3 oturumun 2'sinde ~0 → yalnızca göz yetmiyor; baş+göz (camX) ve baş (headX) aday olmalı, yönerge başı serbest bırakmalı; guard 5° → 15°.
#### DENEME-5 (Bug 6): usableCenters (kararsız orta atılır), ekranda orta asla kararsız kabul edilmez (ipucu 6 sn), headX/headY aday, guard 15°, yönerge "başını çevirmen serbest".
- Build 19 sayılarıyla: y camY 1.1 → ~9 (geçer); x aynı tarafta → null (gerçek). Testler 433/433. Playwright A: Hazır; C (ilk orta 7 sn gezinir): 8.7 sn'de sabitlenince kabul, Hazır. Durum: ÇÖZÜLDÜ (kod) / cihaz Build 21.

---
# Debug Journal — YENİ BUG
## Bug: Yılan (Snake) göz kontrolü aşırı hassas; bakış sağa-sola/aşağı kaçıyor, yılan istenen yöne dönmüyor
## Başlangıç: 2026-09-25
## Durum: AÇIK

### Semptomlar (kullanıcı, kelimesi kelimesine özet)
- "göz çok hassaslaştı, istemeden sağa sola kaçıyor, yılan doğru düzgün girmiyor"
- "göz bebeği devamlı hareket ediyor, sanki devamlı sağ sol yapıyor"
- "gözümü yukarıda yapıyorum ama ekrana bakarken göz aşağı yapıyor veya hemen aşağı dönüyor"
- "sistem kalibre etti ama göz bebeği hızlı hareket ettiği için ve hassas olduğu için oynanamıyor"
- İstek: önce sorunu anla; matematiksel/geometrik çözüm

### İlk Hipotezler
1. [ ] HİP-1: Yön kararı ham/az filtreli bakıştan anlık veriliyor; sakkad ve mikro-sakkad (göz doğal titremesi) yön komutuna dönüşüyor (bekleme/histerezis yok veya çok kısa).
2. [ ] HİP-2: Komut "ekran merkezine göre bakış yönü"; oyuncu yılanı/yemi izlemek için ekranın farklı yerlerine bakınca bu da komut sayılıyor (Midas dokunuşu problemi). "Aşağı dönüyor": ekranın alt yarısındaki yılana bakmak = aşağı komutu.
3. [ ] HİP-3: Kalibrasyon ölçeği (Build 20: baş duruşu headX/headY adayları) küçük baş hareketini büyük bakış değişimine çeviriyor; eşik (GAZE_ENTER_DEG 8°) kalibre ölçekte çok dar.

### Kontrol Logu

#### KONTROL-1 (Yılan hassasiyet)
- **Ne:** SnakeGame.jsx 80-83, 126-127; gaze.js createGazeReader 364-367 → createModelReader 280-345; gazeCalib.js applyModel 253, normAxis 241; GazeCalibration.jsx POS 41-48.
- **Sonuç:** Kalibrasyon modeli varsa okuyucu v = normAxis × GAZE_FULL_DEG(20). ±20 = kalibrasyon noktaları (x %8 / %92, y %12 / %84 ekran). Oyun ENTER_DEG=10, EXIT_DEG=6 aynı birimde → sağ/sol dönüş eşiği = orta ile kenar noktasının YARISI. Yorumdaki tasarım "gerçek 10°, tahta kenarı ±6–7°" idi; model birimi derece değil.
- **Anlam:** iPhone 13 (390×844 pt, 35 cm): kenar noktası ±164 pt ≈ ±4,4° → 10 birim ≈ 82 pt ≈ 2,2° gerçek. Tahta ≈ 358 pt geniş (±179 pt) → tahtanın sağ ve sol üçte biri zaten "dönüş bölgesi". Tasarımdan ~4,5 kat hassas. HİP-3 DOĞRULANDI (birim uyuşmazlığı), HİP-2 DOĞRULANDI (tahtaya bakmak = komut).
#### KONTROL-2
- **Ne:** gazeCalib.js createOneEuro (minCutoff 1.2, beta 0.05) değer birimi ×20; snake.js createDwell DWELL_MS 220.
- **Sonuç:** Sakkadda hız ~yüzlerce birim/sn → cutoff ~40 Hz → süzgeç sakkadı geçirir. Bekleme 220 ms → her bakış duraklaması (fixation) bölgedeyse komut olur.
- **Anlam:** HİP-1 DOĞRULANDI: sakkad ayrımı yok, her duraklama komut. "Devamlı sağ-sol" bununla açıklanır.
#### KONTROL-3
- **Ne:** Dikey: orta y %46, üst %12, alt %84. Tahta altındaki GazePanel (durum yazısı, yön göstergesi) ≈ ekranın %62–85'i.
- **Sonuç:** Aşağı eşik (10 birim) ≈ y 548 pt; panel/ yazı bu çizginin altında → yazıya bakmak = "aşağı".
- **Anlam:** "Yukarı bakıyorum, hemen aşağı dönüyor" için geometrik açıklama. Cihaz verisi (Bakış verisini paylaş) HENÜZ YOK; sayılar koddan ve ekran geometrisinden.
#### PLAN (Yılan) — onay bekliyor; kullanıcı madde 8'i ekletti (StepCards gözle Kaydır). Belge: ENVANTER_VE_PLAN §11.

---
## Bug 8 (Build 24, cihaz): tek göz örtme kontrolü çalışmıyor. Durum: AÇIK
- Semptom (ekran görüntüsü): Sağ göz testi, kullanıcı SOL gözünü kapatıyor → Sağ 0,88 "kapalı", Sol 0,87 "kapalı" → "Sağ gözünü aç", Başla kapalı.
- Semptom 2: el ile örtünce "gözükmüyor" (VARSAYIM: ARKit yüz takibi düşüyor → tracked:false → no-face).
- ÇÜRÜTÜLDÜ VARSAYIM-2 (occlusion.js): ARKit eyeBlinkLeft/Right bu kişide tek göz kapatmada ayrışmıyor (0,88/0,87). Blendshape yöntemi tek göz için KULLANILAMAZ.
- VARSAYIM-1 (sol/sağ yönü) test EDİLEMEDİ (iki değer eşit).
- Sonuç: test şu an başlatılamıyor (kapı hiç açılmıyor) → Build 24 görme testi kullanılamaz durumda.
#### KARAR (Bug 8): kullanıcı "ikisi de" → A (24.1) + B (derinlik).
- DENEME-A: tek göz kuralı = "iki göz birden açık değil" (max(l,r) ≥ 0,55). Hangi göz ayırt edilmez (blendshape birlikte hareket ediyor). El yerine göz kapağı (yüz takibi sürsün). İki göz testi değişmez.
- DENEME-B: Swift'te ARFrame.capturedDepthData; iki göz bölgesinin ortanca derinliği; örtülen tarafta avuç daha yakın. Göz konumu yüz izlenirken önbelleğe alınır, el yüzü kapatınca son konum kullanılır. Açık göz derinliği = mesafe yedeği.
- DENEME-A SONUÇ: Playwright (sahte kare, cihaz değerleri 0,87/0,88): iki göz açık → Başla kapalı; 0,87/0,88 → 1 sn sonra açık; yüz yok → kapalı + "elini değil göz kapağını"; testte iki göz açılınca duraklama, kapatınca devam. 455/455, build 0. Commit A gönderildi. Cihazda doğrulanacak.
- DENEME-B SONUÇ (kod): Swift depth olayı + occlusion füzyonu + hook mesafe yedeği. Playwright sahte derinlik: yüz yok+fark yok → kapalı; avuç sağda → wrong-eye; avuç solda → 1 sn açık, mesafe 40 cm; testte avuç yer değiştirince duraklama; kayıt camera-depth. 460/460, build 0. Swift DERLENMEDİ (swiftc yok) → cihaz derlemesi ilk doğrulama. Durum: cihaz bekleniyor.

## 2026-09-25 Build 26 yol
- Hızlı Bakış günü: 5 dk'lık HB, 2. bölüm pay kontrolüne (4 dk) takılıp düşüyordu → exclusive durak varken pay döngüsü atlanır (today.js). Test: today.test "Hızlı Bakış günü".
- Playwright: setViewportSize screen.width'i değiştiriyor → calibrationStillValid bozuluyor, uygulama kart kalibrasyonuna düşüyor. Kural: pencere boyutu değiştirme, fullPage + clip kullan.
- "Burada 5 dk mola var" işareti "Başla" düğmesiyle çakışıyordu → önceki durağın yanına alındı.

## 2026-09-25 Build 27 profil
- QuestionFlow: geçişte picked/draft useEffect ile sıfırlanıyordu → bir kare eski cevabın "neden sordum"u ve çubuk %67 görünüyordu. Kural: ekran durumu geçişin içinde (setI ile aynı anda) sıfırlanır.
- Native range + accent-color: tutamaç gizli olsa da dolgu yarıya kadar çiziliyor → kendi çizilen iz (--pct).
- Playwright clock.install CSS geçişlerini ve bazı effect'leri dondurur; ekran görüntüsündeki çubuk genişliği yanıltıcı. Değeri DOM'dan oku.

## Build 29 — Fark Ettin mi? (2026-09-25)
- Hata: iki yeni durak (Tek Bakışta, Fark Ettin mi?) hep aynı gün vadesi geliyordu; 2. bölüm payında Tek Bakışta hep düşüyordu.
  Kural: yeni bir durak eklerken, aynı vade kuralına sahip duraklarla aynı gün yolu kur ve her birinin en az bir gün çıktığını test et.
  Çözüm: lib/today.js `rotate` grubu.
- Hata: plan belgesine koddaki kartlarda olmayan bir kaynak (Kreitz 2015) yazdım. Kural: belgede kaynak listelerken FACTS dizisini grep'le, ezberden yazma.
- Hata (Dalga): sonuç ekranı ilk deney oturumunda "2/6" dedi; onSave → refresh sonrası sessions kaydı zaten içeriyordu, ben bir kez daha ekledim.
  Kural: kaydettikten sonra sessions'tan hesap yaparken kaydın zaten listede olup olmadığını kontrol et (type+date).
- Hata (süreç): Playwright betiğini eski betikten satır keserek kurdum, iki kez artık satır taşıdı. Kural: yeni betiği başlıktan sonra elle yaz ve çalıştırmadan önce grep ile eski ekran adlarını ara.
- Hata (Yön taslağı): kurgusal "Ali" örnekleri kullanıcının anlattığı hikâyeye yakındı (okul, sınav). Kural: kurgusal örnekler kullanıcının anlattığı olaylara benzemeyecek.
- Hata (Yön taslağı): bilim kartına özette olmayan cümle yazdım. Kural: kart metni yalnız özette geçen bulgularla yazılır.
- Hata (Xcode komutu): VITE_TEST_UNLOCK=1 olmadan derleme verdim, abonelik ekranı çıktı. Kural: Xcode komutunu testflight.sh ile karşılaştır.
- Hata (Gökyüzü sahnesi): dağda vurgu öndeki tepeyi izledi; gökyüzüyle birleşen kenar en üst katman. Kural: vurgu, bütün katmanların en üst sınırını izler.
- Hata (Gökyüzü sahnesi): rAF zaman damgası vurgudan önce olabildi → negatif ilerleme → NaN. Kural: zamana bağlı oranları 0..1'e sıkıştır.
- Hata (bulut): yarıçap bulut tuvalini aşınca bulut düz çizgiyle kesildi. Kural: ekran dışı tuvalde çizilen şekil tuval sınırına sığdırılır.
- Hata (ses): telefonun hazır okuma sesi yapay; varsayılan açık olmamalı. Kural: yapay ses isteğe bağlı ve varsayılan kapalı.

## Bug 9 (Build 30 raporu): "Ayırt edemedim" — x camX 3.7 ok, y camY 1.8 < 2.5. Durum: AÇIK (2026-09-26)
#### KONTROL-9 (b30.json ile fitAxis tekrar oynatıldı)
- y camY: center 2.74 (headY 6.78), center2 1.42 (headY 4.07) → drift 1.32 → noise 0.66; up 3.30 (h 3.66), down −0.55 (h 4.01). sep 1.22 (ortalama merkeze) → 1.847 ✔ rapordaki değer.
- Yalnız center2 ile: 16.1. İlk orta başka baş duruşunda (6.8° vs diğer hedefler 3.7–5.6°).
- Nötr hedeflerde (center, left, right, center2; dikeyde orta) camY ~ headY eğimi β=0.46, baş aralığı 2.7° → camY baş eğimini tam telafi etmiyor; drift'in çoğu duruş.
- Tekrar turu yalnızca up/down'ı yeniden topluyor; bayat ilk orta hiç yenilenmiyor → tekrarlar işe yaramıyor (Build 15/19 aynı desen).
- Ekran axisWeak usableCenters KULLANMIYOR (fitModel kullanıyor) → ara kontrol ile son model farklı merkezle hesaplanabiliyor.
#### FIX PLANI
1. fitAxis: isteğe bağlı nötr hedefler + baş anahtarı → merkez, baş duruşuna göre (β en küçük kareler, [0,1] sıkıştırma, baş aralığı ≥0,8° VARSAYIM). Gürültü = MAD'lar, taban, düzeltilmiş drift/2, nötr artıkların ortancası. Baş sinyalinin kendisine düzeltme yok. Nötr yoksa eski yol (Build 15/16/19 testleri aynen).
2. Tek fonksiyon (fitWindowsAxis) — fitModel, calibReport ve ekran aynı hesabı kullanır.
3. Tekrar turu ortayı da yeniden toplar (orta + iki yan).
4. İlk hedefte yerleşme 2,5 sn (VARSAYIM).
5. Son tur da zayıfsa: skor ≥1,5 → kaba model kaydedilir, "Hazır" + nazik not (VARSAYIM); altı → sade tekrar ekranı.
#### DENEME-9 (uygulandı)
- gazeCalib.js: postureFit + fitAxis(posture) + axisFrom/fitWindowsAxis (tek hesap) + roughModel (1,5). Ekran: tekrar turu 'center' + yanlar; ilk hedef 2,5 sn yerleşme; kaba model "Hazır" + nazik not.
- Build 30 sayıları: y camY 1,85 → 11,4 (β 0,46, düzeltilmiş drift 0,06); x camX 3,73 (değişmedi; baş aralığı 0,47 < 0,8). Ara kontrol (orta2 yok) y 5,9 → tekrar turu açılmaz.
- Uydurma ayrım testi: yukarı/aşağı duruşun öngördüğü yerdeyse eksen geçmiyor ✔.
- Testler 594/594; build EXIT=0. Akış testi (sahte DOM, scratchpad/__scratch_gazecal.test.jsx): A Build 30 deseni 6 hedef → Hazır (y 13,2); B tekrar turu orta+üst+alt → Hazır; C hep ~1,9 → 2 tur sonra kaba model, duvar yok; D ayrışma yok → kayıt yok.
- Durum: ÇÖZÜLDÜ (kod + akış) / cihaz doğrulaması sonraki TestFlight derlemesinde.
- Kural: kalibrasyon ekranının ara kontrolü ile son model AYNI fonksiyonu kullanır (fitWindowsAxis). Kural: tekrar turu referansı (ortayı) da yeniler.

## Bug 10 (Build 31?, cihaz, 2026-09-26): Rahatlama hareketinde yönler ters. Durum: AÇIK
### Semptomlar
- Routine "Sola bak — Başını çevirmeden": kullanıcı gözünü sola çevirince algılanmıyor; "uygulama sağ diyor". Tüm yönler yanlış.
- "Daire yap saat yönünde": ters yönde yapınca algılıyor.
- Cihaz iPhone TrueDepth; kalibrasyon sonrası (Build 30/31).
### İlk Hipotezler
1. [ ] HİP-1: Routine yön kararı modelsiz ham sinyalden (blend/ang) ve ayna işaretiyle alınıyor; kalibre modeli kullanmıyor.
2. [ ] HİP-2: Kalibre model x işareti doğru ama Routine/gaze.js dir eşlemesi (left/right) ters.
3. [ ] HİP-3: Kalibrasyon hedefleri ayna: "right" hedefi kullanıcının soluna düşüyor (ekran vs kullanıcı perspektifi).
### Kontrol Logu
#### KONTROL-10a gaze.js createModelReader (satır 280–360) + gazeCalib normAxis
- Model yolu işaretten bağımsız: pos = kalibrasyondaki "right" hedefi (ekran %92 = kişinin sağı). stepDir p.x>=0 → right. İşaret DOĞRU.
#### KONTROL-10b Kullanıcının cihazı hangi yolda?
- Ekran görüntüsündeki giriş filmi ESKİ (SVG) → kullanıcı Build 30'da; Build 30 kalibrasyonu "Ayırt edemedim" → model KAYDEDİLMEDİ → Routine createGazeReader() modelsiz yola düşer.
#### KONTROL-10c Modelsiz yol (gaze.js 364–520): x = flip*(angX - nötr), flip varsayılan 1; blend: gazeVector x = FLIP_X*(right-left), FLIP_X=1 (VARSAYIM satır 8: "ARKit Left = kişinin sol gözü").
- checkSign yalnızca açı ile blend'i KARŞILAŞTIRIR; ikisi birlikte tersse hiç çevirmez.
#### KONTROL-10d Gerçek cihaz verisi (Build 30 raporu, ayrıca Build 15/16 journal)
- Sol hedef (ekran %8 = kişinin solu): angX +0.905, blendX +0.0256; sağ hedef: angX −0.629, blendX −0.0178. Build 15: angX sol 1.75 / sağ −0.30. Build 16: sol 2.11 / sağ 1.73.
- Yani açı x ve blend x (bizim formülle) POZİTİF = KİŞİNİN SOLU. FaceDistancePlugin.swift: lookInLeft ← .eyeLookInLeft doğrudan (eşleme hatası yok) → ARKit değerleri cihazda aynalı / VARSAYIM yanlış.
- HİP-1 DOĞRULANDI (modelsiz yol x işareti ters; checkSign ikisi de ters olduğu için yakalamıyor). Daire: tek eksen ters → saat yönü tersine döner ✔ semptom.
#### DENEME-10 (HİP-1)
- gaze.js: FLIP_X = −1 (blend), yeni ANGLE_FLIP = −1 (açı yolu, checkSign ve neutral). Kayıtlı flip anahtarı aynı kaldı: açı/blend GÖRECE uyumu değişmediği için öğrenilmiş düzeltme geçerli.
- gaze.test.js: yardımcılar kişinin yönüyle yazılır, cihaz ham değerine aynalanır (look(): In↔Out; frame(): ham x = −x). Build 30 değerleriyle regresyon testi eklendi.
- Sonuç: 597/597, build EXIT=0. Başarılı mı: EVET (birim). Model (kalibrasyonlu) yolu etkilenmez (işaret veriden).
- Dikey eksen doğrulandı: angY/blendY yukarı > aşağı (Build 30) → y doğru; daire tersliği yalnız x'ten.
- Kural: sensör işareti VARSAYIM ise ilk cihaz raporu geldiğinde veriyle kontrol edilir (Build 15'ten beri veri vardı, bakılmadı).
## Durum: ÇÖZÜLDÜ (kod) / cihaz doğrulaması sonraki TestFlight

---
## Bug 11: TestFlight (Nefona ilk derleme) — giriş filmi oynamıyor; Apple ile giriş "Bir sorun çıktı"
## Başlangıç: 2026-09-26
## Durum: AÇIK

### Semptomlar
- Kullanıcı ekranı: "Hoş geldin" hesap ekranı açık, altında turuncu "Bir sorun çıktı. Biraz sonra yeniden dene." (Apple ile devam et'e basınca).
- "Giriş videosu oynamıyor" (film görünmüyor mu, donuk mu — belirsiz).
- İstek: Google ile giriş de olsun (yeni özellik, bug değil).

### Hipotezler
- HİP-A1: Supabase Apple sağlayıcısında "Client IDs" içinde paket kimliği (com.sectil.eyelume) yok → signInWithIdToken reddediliyor. Test: Supabase auth logları.
- HİP-A2: Apple yerel penceresi hiç açılmadı / eklenti hata verdi (App ID'de Sign in with Apple yeteneği kapalı ya da entitlement imzada yok). Test: auth loglarında istek hiç yoksa bu.
- HİP-I1: Film tasarım gereği atlandı: eski kurulumdan settings.intro.seen kalmış (güncelleme kurulumu). Test: App.jsx akış koşulu.
- HİP-I2: Film gösterildi ama cihazda çizim/animasyon çalışmadı. Test: kullanıcıya sor / koşulu incele.

### Kontrol Logu
#### KONTROL-1 Supabase auth_logs (son 24 saat)
- Sonuç: yalnız /admin/custom-providers GET (panel) ve yeniden başlatma kayıtları; en son 09:16Z. /token ya da id_token isteği YOK. Kullanıcı denemesi ~15:55Z.
- Anlam: HİP-A1 ÇÜRÜTÜLDÜ (istek Supabase'e hiç gelmedi). Hata telefonda: eklenti ya da istemci yapılandırması.
#### KONTROL-2 Eklenti iOS paketinde mi (CapApp-SPM/Package.swift)
- Sonuç: CapacitorCommunityAppleSignIn paket ve ürün olarak var.
- Anlam: "eklenti yok" hatası değil.
#### KONTROL-3 Eklenti Swift kaynağı (ios/Sources/SignInWithApple/Plugin.swift)
- Sonuç: authorize → ASAuthorizationController; hata olursa call.reject(error.localizedDescription). presentationContextProvider yok.
- account.js friendlyError: yalnız /cancel|1001/ iptal sayılır; diğer her şey "Bir sorun çıktı" → gerçek hata kodu kullanıcıdan gizleniyor.
- Anlam: HİP-A2 güçlü (ASAuthorizationError 1000 tipik olarak imzada/App ID'de Sign in with Apple yok). Doğrulanmadı.
#### KONTROL-4 Film koşulu (lib/intro.js shouldPlayIntro, App.jsx:329)
- Sonuç: film yalnız !settings.intro.seen ve Hareketi Azalt kapalıyken oynar. Eski sürümlerde (eski film) seen:true yazıldı.
- Anlam: HİP-I1 DOĞRULANDI (kodla): güncelleme kurulumunda yeni film hiç oynamaz. Ek ihtimal HİP-I3: iOS Hareketi Azalt açıksa bilerek oynamaz.
#### DENEME-1 (HİP-I1) film sürümü: INTRO_VERSION=2; seen kaydında version yoksa ya da küçükse bir kez oynar.
#### DENEME-2 (HİP-A2 teşhisi) friendlyError Apple hata kodunu gösterir ("kod 1000") — kök neden değil, görünürlük.
- DENEME-1 sonucu: tarayıcıda {seen:true} → film oynadı, sonra {seen:true,version:2}; {seen:true,version:2} → oynamadı. Birim testleri 636/636. Başarılı mı: EVET (cihazda doğrulanacak; Hareketi Azalt açıksa yine oynamaz — HİP-I3 açık).
- DENEME-2: friendlyError "kod 1000" gösterir; test eklendi. Kök neden (HİP-A2) cihaz/Apple Developer kontrolü bekliyor.

---
## Bug 12 (TestFlight, 2026-09-26): "Seni tanıyalım" 26 / 07 / 1976 → "Bu tarih olamaz" (geçerli tarih reddediliyor). Durum: AÇIK
#### KONTROL-1 validBirthDate (lib/identity.js:28-33)
- new Date(`${s}T00:00:00`) (yerel) → toISOString().slice(0,10) (UTC) karşılaştırması. TZ=Europe/Istanbul: '1976-07-26' false, '2000-01-01' false; New York true; konteyner (UTC) true.
- KÖK NEDEN DOĞRULANDI: UTC+ saat dilimlerinde her tarih reddediliyor. Testler UTC'de koştuğu için yakalanmadı.
#### DENEME-1: validBirthDate parçalarla + yerel Date(y,m-1,d) karşılaştırması.
- Sonuç: düzeltmesiz İstanbul/Kiritimati testleri düşüyor, düzeltmeyle geçiyor; tüm paket UTC'de ve TZ=Europe/Istanbul'da 639/639. Başarılı mı: EVET (cihazda doğrulanacak).
- Ders: tarih kodunu yalnız UTC'de test etme; İstanbul saatiyle de koş.
## Bug 12 Durum: ÇÖZÜLDÜ (kod), cihaz doğrulaması bekliyor

---
## Bug 13 (TestFlight, 2026-09-26): "tarih seçilmiyor, şehir seçilmiyor, açılır menüler açılmıyor". Durum: AÇIK
- Not: tarih kutuları Bug 12 (UTC) ile aynı derlemede; Bug 12 düzeltmesi (43fbfda) henüz cihazda değil.
- HİP-C1: CityField öneri listesi iOS'ta açılmıyor / seçilemiyor (blur-tıklama sırası). Test: kodu oku + dokunmatik olayıyla tarayıcıda dene.
- HİP-C2: Kullanıcı "açılır menü" = yerel seçici (tarih çarkı, şehir listesi) bekliyor; tasarım kutucuk/yazarak arama. Test: kullanıcıya sor.
#### KONTROL-1 CityField + suggestCities
- suggestCities('') → [] : boş alana dokununca liste hiç açılmıyordu (HİP-C1 kısmen DOĞRULANDI: "açılmıyor"). Seçim onMouseDown/onClick'e bağlıydı (iOS klavye kapanması riski; cihazda doğrulanmadı).
#### DENEME-1: boşken 81 il kaydırılır liste, yazınca süzülür (8); pointerdown/mousedown'da varsayılan engellenir (odak/klavye kalır), seçim click'te (kaydırma seçim sayılmaz).
- Sonuç (Chromium dokunmatik, Europe/Istanbul): boşken 81, Bursa seçildi ve liste kapandı, "iz" → İzmir/Denizli/Rize, İzmir seçildi; tarih 26.07.1976 kabul (50 yaş), Kaydet aktif. 639/639. Başarılı mı: EVET (iPhone'da doğrulanacak).
## Bug 13 Durum: ÇÖZÜLDÜ (kod), cihaz doğrulaması bekliyor
#### KONTROL-5 (Bug 11, 23:54 deneme) auth_logs tekrar
- Sonuç: yine giriş isteği yok (son kayıtlar 07:13Z yeniden yükleme). Ekranda kod yok.
- Anlam: hata cihazda; mesajda "error NNNN" yok → Apple yetkilendirme hatası olmayabilir. HİP-A3: SignInWithApple eklentisi çalışma anında kayıtlı değil ("not implemented") → packageClassList kontrol.
- Kullanıcı Xcode konsolundan UIKBRenderingLog (klavye, ilgisiz) satırı getirdi. Yöntem değişti (konsol aramak yerine):
#### DENEME-3 (Bug 11 teşhis): AccountStart genel hatada ham hata metnini (errorDetail) küçük yazıyla gösterir; scripts/device-run.sh terminalden kurar + imzada applesignin var/yok yazar.
#### KONTROL-6 device-run.sh (Mac, 2026-09-26 gece)
- BUILD SUCCEEDED; "✔ Apple ile giriş izni imzada VAR"; kurulum başarılı; açma hatası yalnız telefon kilitli olduğu için (FBS Locked).
- Anlam: HİP-A2 (imzada izin yok) bu derleme için ÇÜRÜTÜLDÜ. Sıradaki kanıt: ekrandaki ham hata metni (errorDetail).
#### SONUÇ Bug 11 (Apple): device-run (Debug) derlemesinde Apple girişi ÇALIŞTI — Supabase auth.users: 2 kullanıcı, son kayıt 2026-09-26 21:13Z, sağlayıcılar apple,email. Eski TestFlight derlemesindeki hatanın kök nedeni belirlenmedi (yeni TestFlight derlemesinde yeniden denenecek).
## Bug 14: Ödeme ekranı "Abonelik seçenekleri yüklenemedi" (device-run Debug). Gerçek hata gizli (aynı kalıp).
#### DENEME-1 (Bug 14 teşhis): Paywall getPlans hatasında errorDetail küçük yazıyla. Olası nedenler (doğrulanmadı): VITE_RC_IOS_KEY derlemede yok; App Store Connect'te abonelik ürünleri/Ücretli Uygulamalar sözleşmesi hazır değil; RevenueCat'te "default" offering yok.
#### SONUÇ Bug 14 KÖK NEDEN (cihaz ekranı): "VITE_RC_IOS_KEY tanımlı değil" — RevenueCat iOS anahtarı derlemeye hiç girmiyor (Mac'te .env'de yok). Çözüm: herkese açık anahtarı (appl_…) kodda varsayılan yap (supabase.js gibi), gizli anahtarı (sk_…) reddet. Anahtar kullanıcıdan bekleniyor.

---
## Bug 15: Paywall "Planlar yükleniyor…" takılı (device-run, RC anahtarı gömülü, 2026-09-27 02:11)
- Semptom: plans==null kalıyor → getPlans() ne resolve ne reject (Paywall.jsx:43-52).
- HİP-1: purchases()/getOfferings sonsuza kadar bekliyor (ağ / StoreKit ürün isteği). Test: zaman aşımı + ham hata göster.
- HİP-2: kullanıcı erken ekran aldı (henüz yükleniyor). Test: 30 sn bekle.
- Ek bulgu: getPlans [] dönerse ekranda hiçbir mesaj yok (boş liste, düğme kapalı) → teşhis edilemez.
- KONTROL 02:14: 3 dk sonra hâlâ "Planlar yükleniyor…" (eski derleme) → HİP-2 ÇÜRÜTÜLDÜ (yavaşlık değil, gerçek takılma).
- KONTROL 02:16 yeni derleme: 'TIMEOUT · RevenueCat başlatılamadı' → takılma purchases() içinde (dynamic import ya da Purchases.configure). getOfferings'e hiç gelinmedi.
- HİP-3 DOĞRULANDI: kök neden subscription.js purchases(): async fonksiyon Capacitor eklentisini (Proxy) döndürüyordu. Capacitor proxy'si 'then' için de metot sarmalayıcı veriyor (@capacitor/core dist/index.js ~l.158 switch'te 'then' yok) → söz eklentiyi thenable sanıp Purchases.then() çağırıyor → yerelde yok, hata yutulur, söz hiç çözülmez. configure() yerelde call.resolve() ediyor (PurchasesPlugin.swift:152) yani takılma dönüşte.
- DÜZELTME: eklenti { P } kutusunda taşınıyor. Test: Capacitor benzeri Proxy ile; eski kodda "takıldı" ile FAIL, yeni kodda PASS (kanıtlandı). 647 test geçti.
- KURAL: Capacitor eklentisi asla Promise/async dönüşüyle taşınmaz.
- SONUÇ 02:19: Cihazda planlar geldi (Yıllık ₺899,99 / Aylık ₺99,99 / Haftalık ₺29,99, 7 gün ücretsiz). Bug 15 KAPANDI.
- Yan bulgu: aylık fiyat App Store'da ₺99,99 görünüyor (istenen ₺89,99) → ASC'de aylık fiyat kontrol edilecek. Kod değil, mağaza verisi.

---
## Bug 16: Yılan oyunu aşağı bakışı algılamıyor (kalibrasyon "başarılı" dedi) — 2026-09-27
- Semptom (kullanıcı): kalibrasyon başarılı mesajı; Snake'te aşağı bakış yön vermiyor, oynanmıyor.
- Kısıt: kalibrasyon doğruysa BOZMA.
- Kod okuması (değişiklik yok): model varsa createModelReader (gaze.js ~l.300). Aşağı yön ancak v.y ≤ −10 (ENTER_DEG 10, ±20 = kalibrasyon hedefi).
  Kapanma: eyeClosure ≥ model.closeAt (kalibrasyondaki aşağı ortancası +0,2, 0,5–0,85) → "kapalı", yön null.
- HİP-A: aşağı bakışta kapak iner → closure ≥ closeAt → "Gözlerin kapalı" (yön hiç çıkmaz). En olası (yalnız aşağı bozuk).
- HİP-B: y ekseni (camY/angY) zayıf/baş eğimi → aşağı bakış −10'a ulaşmıyor → status boş ("ortada").
- HİP-C: y işareti ters ya da x baskın → "Yukarı/Sağa bakıyorsun".
- Ayırt edici test: pratikte "Aşağı bak" iken durum yazısı + "Bakış verisini paylaş" (kareler: cl, vy, dir, cy/ay/hy).
- KONTROL 02:39 (ekran): oyunda aşağı bakış → "Sağa bakıyorsun", halka işareti sağ-ALT. HİP-C DOĞRULANDI (eksen karışması: aşağı bakış x'i + yönde itiyor, |x|≥|y|). HİP-A/B çürütüldü (kapalı değil, yön okunuyor).
- ÇIKMAZ: pbpaste ile veri aktarımı 2 kez başarısız (pano Mac'e geçmedi; komut metni kaldı). Bu yol bir daha denenmez.
- Kullanıcı gözlemi: aşağı komutu gidiyor, sonra göz istemsiz sağa kayınca yön hemen değişiyor; yukarı verildikten sonra istemsiz göz hareketi yeni yön vermemeli.
- HİP-D: dwell (yön kabulü) bir yönü kabul ettikten sonra merkeze dönüş şartı / bekleme yok → dönüş sakkadı ya da kayma yeni komut sayılıyor. Oyun kuralı; kalibrasyona dokunmaz.
- HİP-D DOĞRULANDI (kod): createDwell komut sonrası orta şartı yoktu (snake.js). DÜZELTME: komut kilidi — orta REARM_MS 150 + en kısa ara MIN_GAP_MS 400; kırpma kilidi açmaz. 6 yeni test (kayma, kısa orta, kırpma, ara, reset). 657 test geçti. Kalibrasyon/gaze.js DEĞİŞMEDİ.
- AÇIK: saf aşağı bakışın "sağ" okunması (eksen karışması, 02:39 ekranı) veri olmadan doğrulanamadı; kilit bunu çözmez. Cihaz testi bekleniyor.
- DENEME-1 BAŞARISIZ (cihaz): komut kilidi → hiçbir yön alınmıyor (pratik 1. adım bile). Neden: kilit 'center' okunmasına bağlı; kullanıcının nötrü sapık → center gelmiyor → kalıcı kilit. GERİ ALINDI.
- ÇIKMAZ-2: "orta'ya dönmeyi şart koşan" kilit. Ders: bakış nötrü güvenilmezken 'center'a bağımlı hiçbir kural koyma (kilitlenir). Kilit gerekiyorsa zaman aşımıyla kendiliğinden açılmalı.
- Asıl kök: nötr/eksen sapması (dinlenen göz center okunmuyor, aşağı → sağ). Kalibrasyon verisi olmadan düzeltilmeyecek.

---
## Bug 11 yeniden (TestFlight Build, 2026-09-28): ekranda "UNIMPLEMENTED · "SignInWithApple" plugin is not implemented on ios"
- HİP-A3 (26 Eylül'de açık kalmıştı) KANITLANDI: eklenti çalışma anında köprüde kayıtlı değil. Debug (device-run) çalışıyor, Release (TestFlight) değil.
#### KONTROL-7 Kayıt yolu
- capacitor.config.json packageClassList: "SignInWithApple" VAR. Plugin.swift: @objc(SignInWithApple) class SignInWithApple, jsName SignInWithApple → ad uyuşmazlığı YOK.
- CapacitorBridge.registerPlugins: NSClassFromString(ad) nil ise sessizce atlar. registerPluginInstance aynı jsName'i ezer (çift kayıt zararsız).
- VARSAYIM (doğrulanmadı, swiftc yok): Release bağlamasında sınıf uygulamaya girmiyor / adla bulunamıyor.
#### DENEME-4: MainViewController'da `import SignInWithApple` + registerPluginInstance(SignInWithApple()) — sınıfa doğrudan başvuru.
- Sonuç: BEKLİYOR (Mac'te arşiv derlemesi + TestFlight'ta Apple ile giriş). Derleme hatası çıkarsa (modül içe alınamıyor) YÖNTEM DEĞİŞTİR: kendi AppleSignInPlugin.swift (uygulama içi, ASAuthorizationController).

---
## Bug 17 (önceden yanlışlıkla "Bug 12" yazıldı): Kalibrasyon "Ayırt edemedim" — build 38 (kullanıcı: ışık etkiliyor olabilir)
### KONTROL (build 38 JSON, scratchpad/b38)
- x: şimdiki fitAxis → null. Yan hedeflerde baş duruşu merkezlerden ~4° farklı → orta, sağ–sol arasında kalmıyor (dNeg*dPos<0 şartı bozuk). Sağ ile sol arasındaki baş farkı 0,03° (aynı duruş). camX sağ–sol ayrımı 1,13; hedef içi gürültü düşük.
- y: duruş düzeltmeli camY 1,76 zayıf (nötr hedef = sağ/sol, onlar kaymış duruşta → artık büyük). Düzeltmesiz lookY 5,92 geçiyor.
- Hedef içi MAD'ler küçük → sinyal kalitesi iyi; ışık kanıtı yok.
### HİP-12a: kök neden ışık değil; duruş kayması + algoritma şartları — DOĞRULANDI (veriyle)
### Prototip (proto.mjs, uygulamaya dokunmadan)
- A (duruşlu+duruşsuz, en iyisi): x null, y lookY 5,92
- B (iki nokta, yanlar aynı duruştaysa ≤1,5°): x camX 4,88, y camY 7,33
- Plan kullanıcı onayı bekliyor. Build 15/16/19 regresyon kontrolü henüz YAPILMADI.
#### KONTROL (Bug 12): build 38 retry {x:2,y:2}. Sıra: ... y tekrarı 'center' yeniden topladı → x'in ortası sağ/sol'dan SONRA başka duruşta. Kök neden: ortak orta penceresi öbür eksenin tekrarında eziliyor.
#### DENEME-12 (kullanıcı onayı: "iki düzeltmeyi birden çalıştıracağım")
- fitAxis: duruşlu + duruşsuz, en iyi skor; üç nokta geçmezse twoPointAxis (yanlar aynı duruş ≤1,5°, TÜM ortalar eksenin kendi baş açısında ≥2° kaymış).
- İlk sürüm kayma ölçütü iki baş eksenine bakıyordu → Build 19 x yanlış geçti (camX 3,77). Kendi eksen başına daraltıldı → Build 19 x yine null (doğru).
- Regresyon (eski→yeni): b8 aynı; b15 x lookX 8,07→camX 9,01; b16 aynı; b19 aynı (yalnız orta2: x null, y 16,8); b30 aynı; b38 x null→camX 4,88 [2n], y 1,76→lookY 5,92.
- Eksene özel orta: center@x / center@y; tekrar sırası yan→orta→yan.
- SONUÇ DENEME-12: kod b531b8a (push). Testler 834/834, build OK. Ekran akışı (sahte kamera, jsdom-benzeri): B30 Hazır tekrarsız; B38 Hazır tekrarsız (x camX [2n]); yan-orta-yan tekrar → üç nokta geçer; zayıf → kaba model; ayrışma yok → "Temel ayarla devam", Devam=onSkip. CİHAZDA DENENMEDİ. Durum: KOD ÇÖZÜLDÜ / cihaz bekleniyor.

## Bug 17 devam — kullanıcı: "idare eder değil, mükemmel olmalı" (2026-09-28)
#### KONTROL: FaceDistancePlugin.swift angleToCamera (satır ~376): camX/camY = göz ışını ile göz→kamera doğrusu arasındaki açı, YERÇEKİMİNE HİZALI dünya çerçevesinde (yatay = dünya y etrafında). Telefonun ekran eksenleri kullanılmıyor.
- Anlam 1: telefon yana yatınca (roll) ekranda dikey bakış dünya-yatay bileşen üretir → Bug 16 (Yılan: aşağı → "sağ") ile uyumlu. HİP-16x: eksen karışması ölçüm çerçevesinden. AÇIK (cihaz verisi gerek).
- Anlam 2: aynı ekran noktasına bakarken baş/telefon konumu değişince açı değişir → B38 duruş kayması.
- Apple ARCamera.transform: kamera uzayı cihaza sabit; x uzun kenar boyunca ön kameradan Home'a (portrede aşağı), z ekran tarafına (kullanıcıya). → ekran düzlemi (z=0) ile göz ışını kesişimi hesaplanabilir.
#### KONTROL: gaze.js createModelReader recenter: kayma ≤ %35 aralık değilse KABUL ETMEZ. B38'de duruş kayması camX'i ~1 birim (aralık 0,57) oynattı → çalışırken yeniden ortalama reddedilir, okuma kalıcı kayar.
#### Kaynak: ARKit 2 bakış doğruluğu ~3,2° / 1,44 cm (Springer 2020); kalibrasyonsuz ARKit ~6,4 cm (RGBDGaze 2022). Telefon ekranı ~7 cm → 5 bölge (orta/sağ/sol/üst/alt) gerçekçi, piksel hassasiyeti değil.
#### Önceki DENEME-12 (iki nokta vb.) belirtiyi tolere ediyor; kök (ölçüm çerçevesi) çözülmedi.
#### DENEME-13 (onay: "evet"): Swift screenHit (kamera uzayı, ışın × z=0 düzlemi, mm) → scrLX/LY/RX/RY/scrZ; takipte dikey kilit (MainViewController.portraitLock). JS: scrX/scrY aday + tercih, NOISE_FLOOR 0,5 mm, model v3, geomCheck raporu (eşik yok: ARKit yatay kazanç bilinmiyor), 5 nokta doğrulama (VERIFY_MIN 0,8 → rough).
- Hata: render'daki `done` ile aynı ad → build kırıldı, `complete` yapıldı (testler ekranı render etmiyor). Kural: yeni ad eklemeden grep.
- Sonuç: 838 test, build OK, ekran akışı 4 senaryo OK (sahte). Swift DERLENMEDİ, CİHAZDA DENENMEDİ.
#### Bug 11 DENEME-4 SONUÇ (Mac arşivi 2026-09-28): BAŞARISIZ — MainViewController.swift:3 "Unable to resolve module dependency: 'SignInWithApple'". App hedefi yalnız CapApp-SPM ürününe bağlı; eklenti modülü dolaylı, import edilemez.
#### ÇIKMAZ: npm eklentisini uygulama hedefinden import/kayıt. Tekrar denenmeyecek.
#### DENEME-5 (yöntem değişti): kendi AppleSignInPlugin.swift (jsName "AppleSignIn", ASAuthorizationController + presentationContextProvider, aynı yanıt biçimi), pbxproj'e eklendi, MainViewController kaydı; account.js AppleSignIn kullanır. 838 test, build OK. Swift DERLENMEDİ.
#### Kendini iyileştirme (madde 5, kullanıcı: "beklemeden şimdi"): lib/gazeAdapt.js — gözlem = (hedefin ekran konumu, ham ortanca); kalibrasyon 3 noktası dayanak (ağırlık 1) + gözlemler (0,5 × 0,92^yaş) → doğrusal düzeltme; korumalar: hedef tarafı + çapraz değil, yerleşme 1 sn, ≥20 kare, yayılım ≤ %25 aralık, sapma ≤ 1 aralık, kazanç [0,5; 2].
- HATA (ekran akışı testiyle bulundu): toplayıcı exRef.current.dir ile kuruluyordu; adım değişiminin ilk karesinde exRef eski adım → Sola bak "sağ" toplayıcısıyla toplandı, gözlem yok. Düzeltme: steps[idxRef.current].dir. Kural: ref ile adım değişiminde idxRef'ten türet.
- Sonuç: 847 test, build OK. CİHAZDA DENENMEDİ.


---
## 2026-09-28 cihaz sonucu (kullanıcı, TestFlight, fe06f26'dan önceki derleme)
- "apple giriş tamam... göz takibi tamam": Bug 11 (Apple ile giriş, AppleSignInPlugin.swift) ÇÖZÜLDÜ (cihaz).
- Ekrana göre ölçüm (scrX/scrY) derlemesi cihazda çalıştı (kullanıcı beyanı); "Verileri paylaş" raporu henüz gelmedi →
  geom oranı, model.verify yüzdeleri, model.x/y.feature doğrulanmadı.
- Kullanıcı önerisi uygulandı: "göz bebeğinin içindeki noktaya bak" (fffa276).


---
# İlk Bakış hata kaydı (eski debug-ilk-bakis.md, aynen)

# Debug Journal
## Bug: İlk Bakış (FirstLook) — kullanıcı göz kırptı, kırpmalar algılanmadı / yanlış sayıldı
## Başlangıç: 2026-09-27 20:35
## Durum: AÇIK

### Semptomlar
- Kullanıcı (iPhone, TrueDepth) okuma sırasında göz kırptı; sonuç ekranı kırpmaları algılamadı ya da düzgün saymadı.

### İlk Hipotezler
1. [ ] HİP-1: FirstLook sayacı eşiği (blink değeri) TrueDepth blendshape ölçeğine uymuyor / taban ölçümü yanlış
2. [ ] HİP-2: Kamera oturumu okuma başlayınca başlamıyor ya da kareler sayaca ulaşmıyor (onFrame bağlanmıyor)
3. [ ] HİP-3: Kırpma çok hızlı (100–150 ms), kare hızı/UI kısma (100 ms) yüzünden kaçıyor

### Kontrol Logu

#### KONTROL-1
- Ne: src/screens/FirstLook.jsx 56-104 (onFrame, taban, sayaç kurulumu)
- Sonuç: TrueDepth karelerinde closure=(blinkL+blinkR)/2. 2 sn taban: base = median(1-closure); sayaç trueDepthCounter(1-b) = taban kapanma.
  Taban ölçümü okuma sırasında (metin ekranda, kişi aşağı bakıyor).
- Anlam: taban aşağı bakışın göz kapağını içeriyor (yüksek) → eşikler yükselir.

#### KONTROL-2
- Ne: src/lib/gaze.js createBlinkCounter + blinkThresholds (56-122), sabitler 19-24
- Sonuç: sayım için closure ≥ closeAt (max(0.5, base+0.3)), doruk ≥ minPeak (max(0.6, closeAt+0.1)), kapalı süre ≥ minClosedMs=80 ms,
  açılma ≤ openAt (max(0.25, base+0.12)). base 0.45'e kırpılır → closeAt 0.75, minPeak 0.85'e kadar çıkar.
- Anlam: HİP-1 (eşik çok yüksek) ve HİP-3 (80 ms: 30 Hz'de 2 karelik hızlı kırpma reddedilir) ikisi de kodla uyumlu.

#### KONTROL-3
- Ne: ios/App/App/FaceDistancePlugin.swift 13, 201-207
- Sonuç: "face" olayı ~30 Hz (yorum); blinkLeft/Right = ARKit eyeBlink blendshape. Kare hızı cihazda ölçülmedi.
- Anlam: HİP-2 (kareler gelmiyor) için kanıt yok; hook onFrame'i her karede çağırıyor (useFaceTracking.js 60).

### Durum
- Cihaz izi (closure dizisi) YOK → hangi kapının reddettiği kesin değil. VARSAYIM: aşağı bakışta taban 0,3–0,45; hızlı kırpma 2–3 kare, doruk 0,6–0,8.
- Plan: (1) sentetik izle eski sayacın kaçırdığını gösteren test (repro), (2) okumaya dayanıklı sayaç: kayan taban + sıçrama (spike),
  minClosedMs yok, refrakter; (3) dev derlemesinde sonuç ekranına tanı satırı (kare/sn, taban, doruklar) → cihazdan gerçek veri.

#### KONTROL-4 (repro, sentetik 30 Hz iz)
- Sonuç: okurken taban 0.38 → 5 kırpmadan 2 sayıldı (trueDepthCounter). Kaçanlar: 2 karelik hızlı kırpmalar (minClosedMs 80) ve
  doruğu minPeak'in (0.78) altında kalanlar.
- HİP-1 + HİP-3: DOĞRULANDI (sentetik izde; cihaz izi yok — VARSAYIM şekiller)

#### DENEME-1 plan
- lib/blinkCounters.js readingBlinkCounter: kayan taban (yalnız açıkken güncellenen EMA) + sıçrama eşiği (taban+0.2), en kısa süre yok,
  refrakter 250 ms, yavaş iniş (aşağı bakış) sayılmaz. FirstLook bunu kullanır; BlinkExercise eski sayaçta kalır.

#### DENEME-1 sonuç
- readingBlinkCounter + 7 test: okurken 5/5, düz bakış 3/3, yavaş iniş/titreşim 0, titreyen kırpma 1, uzun kapatma sayılmaz, 60 Hz aynı.
- FirstLook bağlandı; dev derlemede tanı satırı. Başarılı mı: SENTETİKTE EVET — cihazda doğrulanmadı (tanı satırından veri beklenecek).

## Bug 18: Gelişim haritası (ee417db) "bitti" denip her durumu görülmeden gönderildi (2026-09-28)
## Durum: DÜZELTİLDİ (ee417db'den sonraki commit)

### Kök neden (süreç)
- ee417db'de yalnız "dolu veri" durumu ekranda görüldü; yeni kullanıcı, boş veri, "İlk 28 gün", gerileme, etki
  grafiği, WHO-5 son soru görülmeden "bitti" yazıldı. Kullanıcı sordu: "mükemmel mi?" Cevap: hayır.
- Kural (ANA_BELGE §2'ye eklendi): bir ekranın her durumu (boş, 1. gün, dolu, iyileşme, gerileme, dar ekran) iki
  temada görülmeden ve kod bağımsız gözle incelenmeden "bitti" denmez.

### Bulgular ve düzeltmeler (ekran incelemesi + bağımsız kod incelemesi)
1. Ana sayfa önerisi "İyi oluş → Dalga" her gün dönebilirdi: Dalga kaydı Sakinlik'e yazar, İyi oluş'u doldurmaz.
   Düzeltme: İyi oluş en az düzenli alan önerisinden çıktı (WHO-5 vakti gelince ayrıca önerilir); öneri modülünün
   kendi alanına yazdığı testle denetleniyor (HomeMap.test.js).
2. WHO-5 kaydı Ana sayfa haftalık hedefinde, takvimde ve Nef'te egzersiz günü sayılıyordu (filtre yalnız 'game').
   Düzeltme: `stats.isExerciseSession` (oyun ve WHO-5 hariç) üç yerde.
   Ayrıca görüldü, DOKUNULMADI: "Bugünün görevi" (notice) de `countsTowardGoal: false` ama aynı filtreden geçip
   sayılıyor; önceden var, davranış değişikliği → sahibine soruldu (YAPILACAKLAR).
3. "GÜN" sayısı saat farkıyla hesaplanıyordu (dün 23.00 → bugün 07.00 "1. gün"). Düzeltme: takvim günü
   (`dataHub.calendarDays`); alan ayrıntısındaki "N. gün" de.
4. WHO-5 son soruda yanlış dokunuş anında kaydediliyordu (sonra 14 gün düzeltilemez). Düzeltme: son soru "Kaydet".
5. WHO-5'te çift dokunuş sonraki soruyu da cevaplıyordu. Düzeltme: seçimden sonra 180 ms işaret, bu arada dokunuş
   yok sayılır.
6. "İlk 28 gün" seçilince harita değişiyor, satırlar "son 28 gün"de kalıyordu (Beden haritada 1/28, satırda
   "Henüz kayıt yok"). Düzeltme: satırlar seçili pencereyi izler; durum (pill, nokta) yalnız "Son 28 gün"de.
7. "geriliyor" rengi: açık temada harita yayı açık turuncu, lejant koyu kahve. Düzeltme: `--mark-down` tek jeton;
   canvas aynı rengi kullanır.
8. Boş veride ortada "1 GÜN" yazıyordu. Düzeltme: kayıt yoksa gün yazılmaz.
9. Yeni kullanıcıda 7 satır "henüz ölçü yok" diyordu; başlangıç cevapları vardı. Düzeltme: ölçüsü olmayan satır
   başlangıç cevabını gösterir ("Stres: Epey", "İlk Bakış: 20 sn'de 9 kırpma").
10. İyi oluş ayrıntısı "klinik olarak anlamlı" ve farklı düşük puan cümlesi kullanıyordu; WHO-5 ekranı başka. Düzeltme:
    tek kaynak `who5.js` (meaningful, low).
11. Türkçe ek hatası: "İlk ölçümün 60'di" (60'tı olmalı). Düzeltme: "İlk ölçümün: 60."
12. Kaynak listesinde günlük/haftalık test aynı adla iki satır, aynı React anahtarı. Düzeltme: ayrı ad, ayrı anahtar.
13. Pencere sınırı yaz saati geçişinde bir saat kayıyordu. Düzeltme: pencere gün anahtarlarıyla.
14. Küçük haritada durum yayı ~0,5 px (görünmez). Düzeltme: en az 2 CSS px.
15. Bozuk kayıt (null) haritayı düşürüyordu. Düzeltme: merkez girişte eler.
16. Erişilebilirlik: pencere düğmeleri 30 px (44'e çıktı); WHO-5'te yeni soru ekran okuyucuya okunmuyordu (odak soruya);
    durum noktası role="img".
17. Metin: "en sağdaki bugün" (şerit iki satır) → "Çerçeveli kare bugün"; etki grafiği "son N hafta" yanlış sayıyordu.
18. Gece yarısı geçince açık ekranda pencere kaymıyordu (memo bağımlılığına gün eklendi).
19. İris ayraç çizgileri kenardan taşıyordu (1.01R → 0.98R; önceden vardı).
20. Ana sayfa kartında "14 gün oldu" sabit yazılmıştı → gerçek gün sayısı (ee417db içinde düzeltildi).
21. İyi oluş satırında "68 /100" → "68/100" (ee417db içinde düzeltildi).

### Karar bekleyen (tasarım): İyi oluş dilimi hep boşa yakın
- Doluluk = son 28 günde kayıtlı gün; İyi oluş'un tek kaydı WHO-5 (14 günde bir) → en fazla 2/28. Düzenli cevaplayan
  kişide de dilim boş görünür. Sahibine soruldu (YAPILACAKLAR "Şimdi").

## Bug 19: Açılış ekranında Capacitor'ın varsayılan logosu; koyu temada açık gri yanıp sönme (2026-09-28)
## Durum: DÜZELTİLDİ (cihazda doğrulanacak)
- Bulgu: `Splash.imageset` Capacitor şablonundan hiç değişmemişti (beyaz zeminde mavi "X"); `LaunchScreen.storyboard`
  her açılışta gösteriyor. `capacitor.config.json` `ios.backgroundColor` tek renk (#f5f7f7): koyu temada açılıştan
  sonra web görünümü açık gri.
- Düzeltme: Splash açık (#f3f6f8) ve koyu (#070c12) zeminde Nefona işareti (`app/design/simge/simge.py`);
  `MainViewController.capacitorDidLoad` web görünümü zeminini temaya göre ayarlar.
- Simge: iOS 26 için `AppIcon.icon` (Icon Composer biçimi; anahtarlar gerçek bir Icon Composer kaydından, proje
  satırları Proxmox'un Flutter yamasındaki `folder.iconcomposer.icon` ile aynı). Risk: Capacitor projelerinde .icon
  ile derleme hatası bildirilmiş (ionic-team/capacitor#8179, "None of the input catalogs contained ... 'AppIcon'");
  PNG seti aynı adla korunduğu için beklenmiyor, ama DOĞRULANMADI (bu ortamda Xcode yok).

## Bug 20: Alarm denemesi — Dalga sesli alarm çaldı ama Dalga sesi çalmadı (2026-09-28, TestFlight, iOS 26)
## Durum: AÇIK

### Semptomlar (sahibinin raporu, 14:05)
- İzin: authorized. İki alarm da 2 dk sonra çaldı (varsayılan sesli ve "Dalga sesli").
- Dalga sesli olanda Dalga müziği çalmadı. VARSAYIM: yerine varsayılan alarm sesi çaldı (sahibine soruldu).
- Günlük: `writeSound` 1.102.544 bayt yazdı (Library/Sounds/nefona-dalga.wav; 25 sn, 22050 Hz, tek kanal, 16 bit PCM).

### Hipotezler
1. [ ] HİP-1 (en olası): AlarmKit Library/Sounds'taki dosyayı çalmıyor, varsayılana düşüyor. Kanıt: Apple forumları
   798140, 795417, 797172 ("Library/Sounds do not play", "App Bundle — play once, without repeat"); olmayan bir ad
   verilince de varsayılan çalıyor (802620). Apple DTS: "desteklenen biçim ve 30 sn'den kısa" olmalı, düzeldi diyor.
   Test: aynı Dalga parçasını uygulama paketine göm (Resources), `.named("nefona-dalga-sakin.wav")` ile kur.
2. [ ] HİP-2: Biçim (WAV 22050 Hz tek kanal) reddediliyor. Test: HİP-1 çürürse aynı parçayı 44100 Hz stereo / CAF dene.
3. [ ] HİP-3: Ses çaldı ama Sakin'in ilk saniyeleri çok yumuşak, duyulmadı. Test: sahibine "hiç ses yok mu,
   telefonun alarm sesi mi" diye soruldu.

### Deneme logu
- DENEME-1 (HİP-1): üç Dalga modunu (Sakin, Güç, Motivasyon) derleme anında 25 sn WAV'a basıp uygulama paketine
  gömmek; panelde "Paketteki Dalga sesiyle 2 dk" düğmesi.
  SONUÇ (sahibi, 16:38): BAŞARISIZ — "Okyanus sesi vs ayarlı ses gelmiyor". Paketteki WAV da çalmadı.
- KONTROL: Apple forum 802620 — iOS 26.0'da özel ses hiç çalmıyor, Apple mühendisi "bilinen sorun, iOS 26.1'de
  düzeltildi". 797172 — paketteki ses çalar ama tekrar etmez (bir kez, < 30 sn). Çalıştığı bilinen örnek (SnoozePay
  PR 857): CAF, `afconvert -f caff -d LEI16@44100` (2 kanal), paket kökünde, `.named("<ad>.caf")`.
- DENEME-2 (HİP-2 biçim + iOS sürümü): üç parça CAF'a çevrildi (16 bit, 44100 Hz, 2 kanal; design/alarm-sesleri/
  to_caf.py, libsndfile ile doğrulandı); WAV'lar paketten çıktı. Swift kurmadan önce dosyanın pakette olduğuna bakar
  (yoksa hata; sessizce varsayılana düşmez). Sahibine iOS sürümü soruldu: 26.0.x ise dosyayla düzelmez, iOS güncellenmeli.
  Not: özel ses tekrar etmez (Apple sınırı); 25 sn çalar, sonra susar.

## Bug 21: Ana sayfa 320 px'te 14 px yana taşıyor (2026-09-28, tarayıcıda görüldü)
## Durum: AÇIK (sahibine soruldu; alarm işinin kapsamı dışında)
- Bulgu: alarm kartı görsel kontrolünde `document.scrollWidth − innerWidth = 14` (320 px, iki tema). Kart yokken
  (18.30, kart çıkmaz) de aynı 14 px → alarm kartından değil. Görüntüde "DURAK · ≈19 DK KALDI" satırı kesiliyor
  (`.hh-num`, günün diyaframının yanı).
- Düzeltilmedi: sorulmadan kapsam büyütülmez.

## Bug 22: Alarm/uyku sesi çalmıyor (2026-09-28 15:37, sahibi, TestFlight, iOS 26, yan ses düğmesi açık)
## Durum: DÜZELTME YAZILDI (cihazda doğrulanacak); alarm sesi kısmı AÇIK
- Semptom: "Alarm kurdum ama dalga sesi çıkmıyor veya uyku için istediğim ses çalmıyor." Ekran: alarm 15:40, saat 15:37.
- HİP-4 (DOĞRULANDI, kodla): 3 dk sonraki alarmda uyku sesi tasarım kuralı gereği çalmaz (alarmdan ≥ 1 saat önce
  bitmeli); ekran "bu gece çalmıyor" diyordu, Başlat yoktu → kişi arıza sanar. Düzeltme: "Yine de çal · N dk"
  (alarmdan 5 dk önce susar).
- HİP-1 (OLASI, cihazda doğrulanacak): uyku müziği dokunuştan SONRA saniyelerce hazırlanıp çalınıyordu; iOS
  dokunuş dışı çalmayı reddedebilir ve kod sonucu yok sayıyordu. Düzeltme: `dalgaSleep` prepare() ekran açılınca,
  start() hazırsa dokunuşla aynı çağrıda çalar; reddedilirse "Ses başlamadı · dokun, başlat" (resume()).
  Eski Dalga uyku modu (ac5e143) da hiç cihazda doğrulanmamıştı.
- HİP-2 (AÇIK): 15:40'ta alarmda Dalga sesi mi, varsayılan ses mi çaldı — sahibine soruldu (Bug 20 deneme 2 ile aynı soru).
- Günlük: scratchpad/debug-alarm-ses.md

## Bug 22 (devam): Uyku sesi hâlâ çalmıyor (sahibi, 2026-09-28 17:35, iOS 27.0, iPhone 14 Plus)
- Aynı yöntem (dokunuş içinde çal + önceden hazırla) iki kez denendi, sahibi yine "çalmıyor" dedi → YÖNTEM DEĞİŞTİ:
  tahmin yerine ölçüm.
- ÖLÇÜM (Chromium, tanı satırı): müziği cihazda üretmek (OfflineAudioContext, 96 sn döngü) **10,5 sn** sürdü; bu
  sürede "Başlat" kapalı ve "Müzik hazırlanıyor…" yazıyor. Beklemeden dokunan kişi için hiçbir şey çalmaz. Telefonda
  süre bilinmiyor (VARSAYIM: benzer ya da daha uzun).
- DÜZELTME: müzik derlemede bir kez basılır ve uygulamanın içinde gelir: `public/sleep/sakin-loop.wav` (96 sn, boşluksuz
  döngü; MP3 başa/sona ~50 ms boşluk ekliyordu) ve `sakin-fade.mp3` (180 sn, yavaşça susar; kısa kısılmada `#t=` ile
  ortasından). Üretim `design/dalga-uyku` (aynı müzik motoru, Chromium). Tarayıcıda: "Başlat" 0,1 sn'de açıldı, müzik
  hemen çaldı, 30. sn'de kısılan parçaya doğru yerden (150. sn) geçti.
- TANI: test derlemesinde uyku ekranlarında 4 satır (hazırlık, çal: evet/HAYIR + hata, ses öğesinin durumu, ses
  bağlamı). Telefonda yine çalmazsa ekran görüntüsü nedeni gösterir.
- Bağımsız inceleme: tek 180 sn kısılma parçasını ortasından başlatmak kısa seslerde ani düşüş yapıyordu (2 dk'da
  %100 → %25). Artık her kısılma süresi (30, 60 … 180 sn) için tam uzunlukta ayrı parça (`sakin-fade-{F}.mp3`, 64
  kbit/sn); başlangıç noktası geçiş anında kalan süreden (kilitli ekranda zamanlayıcı gecikse de tam bitişte susar).
  Test: çalma isteği dokunuşla aynı çağrıda mı (araya await konunca test düşüyor, denendi); dosyalar var mı.
- Cihazda doğrulanmadı.

## Bug 21 (düzeltildi, cihazda doğrulanacak)
- Sahibinin ekranında (iPhone 14 Plus, 428 px) de görüldü: adım satırı varken hafta noktaları ve alarm satırının oku
  sağdan kesiliyordu (telefondaki yazı tipi tarayıcıdakinden geniş). `.hh-day` ızgarası: sayı sütunu yazının tamamı
  kadar (max-content), diyafram kalan yere (96–172 px). Ölçüm: 428/390/375/320 px'te içerik kesilmiyor, sayfa yana
  kaymıyor (320'deki 14 px taşma da kalktı).

## Bug 22 (kök neden, 2026-09-28 18:03): sahibi "Kur"a basınca müziğin başlamasını bekliyordu
- Ekran görüntüsü: kurulum ekranı 18:03, alarm 18:05, uyku sesi 5 dk; "Kurulu ama yine uyku sesi yok".
- KÖK NEDEN (akış): "Kur" yalnız alarmı kuruyordu; müzik ayrı yoldan (Ana sayfa → satır → Uyku sesini başlat →
  Başlat) açılıyordu. Ayrıca 2 dk sonraki alarmda kural müziği tamamen kapatıyordu (alarmdan 1 sa önce bitmeli;
  "Yine de çal" payı 5 dk).
- Hata (benim): dört tur boyunca ses çalma tekniğini düzelttim, kişinin neye dokunup ne beklediğini ekran
  görüntüsünden çıkarmadım. KURAL: "çalışmıyor" raporunda önce kişinin dokunduğu düğmeyi ve beklediği sonucu yaz.
- DÜZELTME: uyku sesi Evet ise kurulumda "Kur ve uyku sesini başlat" (müzik AYNI dokunuşta, alarm kurulmadan önce
  başlar; kurulamazsa durur; `lib/sleepSession.js`), ardından uyku ekranı ona bağlanır. "Yalnız kur" ayrıca var.
  Süre: kuraldaki süre, yetmezse alarmdan 1 dk önceye kadar (LATE_GAP_MIN 5 → 1). Tarayıcıda uçtan uca denendi:
  dokunuşta çaldı, 1 dk sonra kısılıp sustu, uyku kaydı yazıldı.
- Bağımsız inceleme (9d9e901): sahibinin tam durumu (18:03:xx'te 18:05) yine müziksizdi: süre dakikaya aşağı
  yuvarlanıp 1 dk pay çıkınca 0 oluyordu. Artık saniye (`lateSleepSeconds`; 18:03:30 → 30 sn, en az 30 sn). Ekrandaki
  süre 10 sn'de bir tazelenir; dokunduğun an süre bittiyse sessizce müziksiz kurmaz, söyler. Web'de müzik düğmesi yok.
  Kurulum sürerken X kapalı. Geliştirmede StrictMode sahte sökümü devredilen müziği susturuyordu: söküm bir tik sonra.
  Test: çalma isteği alarm kurulmadan ÖNCE (sıra değişince test düşüyor, denendi); kurulamazsa müzik durur.

## Bug 22 (cihaz kanıtı, 2026-09-28 19:55): ses öğesi çalıyor ama duyulmuyor
- Sahibinin ekranı (tanı satırı): "çal: evet · öğe: çalıyor 6.4 sn · müzik · hazır 4 · ses bağlamı: none"; "Müzik
  sesi yok". Yani çalma başlıyor, dosya yüklü, zaman ilerliyor; ses hoparlöre ulaşmıyor. Dosya sessiz değil (tepe
  0,43, rms 0,075).
- Web görünümündeki <audio> ile 4 tur uğraşıldı → YÖNTEM DEĞİŞTİ: uyku sesi iOS'un kendi oynatıcısıyla
  (AlarmPlugin.sleepStart: AVAudioPlayer, public/sleep/sakin-loop.wav döngüde, son F sn'de setVolume(0, fadeDuration:),
  süre bitince durur; ses oturumu .playback, bitince kullanıcının tercihine döner). Dokunuş gerekmez; kilitli ekranda
  iOS sürdürür. Tarayıcıda eski <audio> yolu kalır.
- Tanı satırı artık: oynatıcı, çalıyor mu + saniye, telefonun MEDYA ses düzeyi (0–100), çıkış (Speaker / kulaklık /
  Bluetooth), kategori. Yine duyulmazsa neden bu satırda görünür (ör. medya sesi 0, çıkış Bluetooth).
- Swift bu ortamda derlenmedi; cihazda derlenip denenecek.
- Bağımsız inceleme (7763ba2): derlenir, engelleyici yok. Düzeltildi: ekran açılınca yeniden uygulanan "ses kapalı"
  tercihi (ambient) çalan uyku sesini sessiz tuşuna bağlayıp arka planda durdurabiliyordu → AppAudioSession
  beginSleep/endSleep (uyku sesi sürerken tercih uygulanmaz; kayıt sürüyorsa başlamaz); arama/Siri kesintisinden sonra
  iOS izin verirse kaldığı yerden sürer; bitince oturum bırakılır (kesilen podcast/müzik devam eder).

## Bug 20/22 (asıl kök neden, 2026-09-28 20:30): sesler telefon hoparlörünün çalamadığı bantta
- Ölçüm (design/uyanma-sesleri/analyze.py): eski uyku müziği ve üç Dalga alarm sesinin enerjisinin %77–87'si 300 Hz
  altında. iPhone hoparlörü ~250 Hz altında neredeyse ses vermez, 1–4 kHz'de en verimlidir. Tanı satırı "çalıyor"
  derken sahibinin "müzik sesi yok" demesi bununla uyumlu: dosya çalıyor, hoparlörden çıkan çok az.
- Düzeltme: Dalga parçaları bir oktav yukarıda basılır (`renderLoop(..., {transpose: 12})`), 400 Hz yüksek geçiren
  + 1 kHz üstü +4/+6 dB raf + −12 LUFS (design/alarm-sesleri/master_dalga.py). Uyku müziği 300 Hz yüksek geçiren +
  +4 dB raf, −16 LUFS, dikişsiz döngü (design/dalga-uyku/master.py). Sonuç (ölçüldü): 300 Hz altı uyku müziğinde %8,2, Dalga seslerinde %0–1,6.
- Yeni üç uyandırma sesi (Gün Işığı, Kuş Bahçesi, Uyanış Marşı) baştan 500 Hz–4 kHz'de üretildi (≥ %93);
  kanıt ve ölçütler design/uyanma-sesleri/README.md. Varsayılan ses artık Gün Işığı.
- Cihazda duyulduğu DOĞRULANMADI; sahibinden: uyku müziği duyuluyor mu (tanı satırında medya ses düzeyi ve çıkış),
  alarmda hangi ses çaldı.
- Bağımsız inceleme (ee5894e): engelleyici yok, 4 düzeltilmeli + 5 küçük. Düzeltildi: AlarmKit sesi bir kez (~24 sn)
  çaldığı için Gün Işığı 11,5 sn'de, Kuş Bahçesi 16 sn'de tam sese çıkıyordu → ikisi de ~6 sn (Marşı zaten 5 sn);
  Kaida 2005 cümlesi çalışmanın söylediğine indirildi (9 yaşlı kişi, öğle uykusu, zorla vs kendiliğinden uyanma);
  alt yazılar betimleyici ("hafif/derin uykuya" kanıtsızdı); sıra etkisi ve Dalga tık ölçütü belgelendi; eski
  Dalga üretim yolu README'de "kullanılmaz"; __pycache__ depodan çıktı; CAF testine biçim/bayrak (mutasyonla denendi).
