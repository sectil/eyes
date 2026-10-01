# Yoga Ders 2 · 15 dakikalık ses pilotu — üretim şartnamesi (bağlayıcı)

Kök: `Y=/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga`. Her şey `$Y/render/` altına yazılır.
Depoya (`/home/user/eyes`) hiçbir dosya yazılmaz; git komutu çalıştırılmaz; süreç öldürülmez (`pkill -f` yasak).

## 0. Neden ve ölçüt
Sahibinin isteği: dinleyen **sıkılmasın, bırakmasın, aboneliği sürsün**; **kaliteden ödün yok**; kuraldan çıkılmaz.
Sahip bitmiş dersi kulağıyla dinleyip karar verecek: iki ses (Neslihan, Hakan) × iki müzik (A, B; kör) = 4 karışım.

## 1. Girdiler (salt okunur)
- `$Y/pilot/ders2.lesson.json` (ders verisi; `music`, `qa`, `limits`, `voicePhaseGainDb`, `sentenceGapByPhase`, `visual`)
- `$Y/pilot/timing.py` (planlayıcı: `plan(lesson, T, rate, prof)`, `with_scene`, `sub_texts`, `sub_durs`, `check_plan`)
- `$Y/render/units.json`: üretilecek 68 birim (54 klip + 14 taşıyıcı), sahne **orman**. `tts` = okutulacak metin
  (değiştirilmez), `screen` = ekranda yazan metin, `sentences` = klibin cümleleri (1'den çoksa cümle sonlarından
  kesilir), taşıyıcıda `items` + `itemText` (üç nokta duraklarından öğe sayısı kadar parçaya kesilir).
- `$Y/PLAN.v2.md` §D.1.3–D.3 (üretim ve işleme kuralları), `$Y/elevenlabs.md` (araç davranışları).

## 2. Konuşma üretimi (yalnız MCP)
- Akış: `zAYOhRc6cOKeStKp4ijv` (hepsi bu akışa). Model **`eleven_v4`**. Sesler: Neslihan `wQ7dVQFxIqwokkwsMqqn`
  (`nes`), Hakan `DwjDVVARfPVjBKepXK2c` (`hak`). Her birim **tek istek**, `generations_count: 3`.
- `creative_generate_speech` bir kez çağrılır; aynı birim için ikinci çağrı **yalnız §4'teki yeniden çekim kuralıyla**.
  Durum `creative_get_flow_run_status` ile toplu yoklanır (birkaç istek ateşle, sonra hepsini birlikte yokla).
- Her çekim indirilir: `render/raw/<ses>/<birim>/t<n>.mp3`; aynı klasöre `takes.json`
  (`generation_id`, `url`, `node_id`, `duration_secs`, istek zamanı). Dosya bozuksa (soundfile açamıyorsa) yeniden indir.
- **Maliyet defteri** `render/ledger.jsonl`: her ücretli çağrıda bir satır (`who`, `what`, `chars|sec`, `credits_est`,
  `cents_est`). Ölçü: konuşma 0,926 kredi/karakter/çekim ≈ 0,01684 sent/karakter/çekim (tahmin çağrısından);
  müzik 0,30 $/dk (27,5 kredi/sn). **Tavanlar:** konuşma iki ses toplam 550 sent; ElevenLabs müzik + doğa + ton toplam
  900 sent. Tavanı aşacak çağrı yapılmaz; rapora yazılır.

## 3. Klip işleme (`render/tools/audio.py`, numpy/scipy/soundfile/pyloudnorm; ffmpeg YOK)
- Kırpma: −50 dBFS eşik, önde 60 ms, sonda 250 ms pay, 10 ms yumuşak uç. Klip içindeki duraklamalara dokunulmaz.
- Yüksek geçiren 2. derece: kadın 90 Hz, erkek 70 Hz. Islıklı ses: 5–9 kHz bandı eşiği aşarsa en çok −4 dB.
- Seviye: ≥ 1 sn klip −18 LUFS (±0,5), gerçek tepe ≤ −1,5 dBTP (4× üst örnekleme ile). < 1 sn: aynı evrenin
  referans klibinin konuşma RMS'ine; tek heceli mikro klip +1 dB (`qa.microClipRmsOffsetDb`).
- Evre kazancı: `voicePhaseGainDb` (Varış 0, Derinleşme −1,5, Derin −3, Kapanış 0; kapanış geçişi rampası, basamak yok).
- Kesim (cümle ve taşıyıcı): sessizlik aralıklarından; parça sayısı hedefe eşit olmalı (taşıyıcıda `items`, klipte
  `sentences`). En uzun N−1 duraklama sırayla seçilir; kesim noktası sessizliğin ortasına yakın sıfır geçiş, 5 ms uç.
  Parça sayısı tutmazsa o çekim o birim için elenir (başka çekime geçilir).
- Ölçümler (her çekim ve her parça): süre, konuşma süresi, eklemleme (hece / sesli süre), duraklama deseni, F0 ortalama
  ve yayılımı (numpy otokorelasyon/YIN), ıslıklı oran, kırpılma, DC, LUFS/RMS, tık (10 kHz üstü ani enerji).
- Taşıyıcı eklemi: ardışık parçaların son/ilk 500 ms F0 farkı ≤ 2 yarım ton (`qa.carrierJoinF0StepSemitones`).

## 4. Çekim seçimi ve doğrulama
1. Üç çekim nesnel puanla sıralanır: (a) kırpılma/tık yok (zorunlu), (b) kesim tutuyor (zorunlu), (c) eklemleme bandı:
   Derin evrede ≤ 5,0 hece/sn tavanı raporlanır (`qa.derinClipRateCeil`, VARSAYIM), öteki evrelerde 5,0–6,2 tercih,
   (d) süre üç çekimin ortancasına yakın, (e) F0 yayılımı düşük (sakin), (f) taşıyıcı eklemi ≤ 2 yarım ton.
2. En iyi çekim **Scribe** ile doğrulanır: çekimin URL'si `creative_attach_reference_file` ile akışa eklenir, düğüm
   `creative_transcribe_audio`'ya bağlanır (connect_from), sonuç yoklanır. Normalleştirme: Türkçe küçük harf (İ→i, I→ı),
   noktalama/üç nokta/tırnak atılır, boşluk tekleşir, 0–10 rakamları Türkçe sözcüğe çevrilir. **Sözcük dizisi birebir
   aynı** olmalı. Tutmazsa sıradaki çekim; üçü de tutmazsa **bir kez** yeniden çekim (3 çekim, deftere yazılır); yine
   tutmazsa en iyi çekim `flag: "kulak"` ile işaretlenir ve raporda tek tek listelenir (sahip o cümleyi özellikle dinler).
3. Kesilen parçalar, sırasıyla şu yollardan ilk çalışanla doğrulanır: (a) çekimin Scribe sonucunda **sözcük zaman
   damgası** varsa her kesim noktası iki öğenin sözcükleri arasına düşmeli (hiçbir sözcüğün içine değil); (b) yerel
   dosya yükleme aracı varsa (`get_more_tools` ile bak: asset upload) parçalar aralarına 1,0 sn sessizlik konarak
   birleştirilir ve tek Scribe ile okunur, her öğe kendi sırasında birebir çıkmalı; (c) ikisi de yoksa kesim yalnız
   ölçüyle denetlenir (parça sayısı, parça başına hece/süre bandı, sessizlik ortası) ve birim `flag: "kesim-kulak"` alır.
   Yanlış kesim = o çekim elenir. Hangi yolun kullanıldığı selection.json'a yazılır.
4. Sağ ve sol taşıyıcılar ayrı isteklerdir; sol için, sağınkine perde ve hızca en yakın geçerli çekim seçilir
   (`qa.carrierTakesRule`).
5. Sonuç: `render/sel/<ses>/<birim>/` altında işlenmiş parçalar (`<parça-id>.wav`, 44,1 kHz mono float) ve
   `render/sel/<ses>/selection.json` (birim → çekim, ölçümler, Scribe metni, bayrak).

## 5. Müzik (iki yol, kör A/B)
- **ElevenLabs** (`eleven_music_v2_5`, `instrumental: true`, `lyrics_type: instrumental`, `duration_seconds` düğümde
  `creative_update_node` ile): istem "very slow, pulseless, no drums, no percussion, no vocals, no choir, no crescendo,
  flat dynamics, sustained", Mi♭ majör pad + alçak yaylılar (`music.key`). Parçalar: Varış-Derinleşme ailesi 2 × 300 sn
  + ilk izlenim için bir ek Varış adayı 180 sn, Derin ailesi 2 × 240 sn, İmge katmanı (seyrek, uzak piyano) 1 × 180 sn,
  Kapanış 1 × 180 sn (toplam 1.620 sn ≈ 810 sent; kalan pay doğa ve dönüş tınısı için). Önce her düğüm
  `estimate_only` ile fiyatlanır, deftere yazılır.
  Doğa (orman): rüzgâr ve yaprak `eleven_text_to_sound_v2`, `loop: true`, 4 × 30 sn. Dönüş tınısı: tek, yumuşak, 4 sn
  (sfx). Oda sesi tabanı: sentezlenir (pembe gürültü, −58 dBFS RMS, 2 × 30 sn).
- **Dalga motoru** (uygulamanın kendi müziği, ücretsiz): `/home/user/eyes/app/src/lib/dalgaMusic.js` "sakin" kipi,
  `app/design/dalga-uyku/render.mjs` + `render.html` yöntemiyle (vite port **4290**, `--strictPort`, işin sonunda o PID
  durdurulur) ayrı tohumlarla ≥ 16 dk benzersiz, aynı evre ailesi mantığıyla; imge katmanı: aynı motorun tınısıyla,
  seyrek, bir oktav yukarıda, Mi♭ majör pentatonik (VARSAYIM). Doğa, oda sesi ve dönüş tınısı iki yolda **ortak**.
- Seçim: vokal/davul olmamalı (Scribe metni boş, başlangıç (onset) gücü düşük), dinamik düz (3 sn LUFS yayılımı dar),
  döngü eklerinde tık yok. Hepsi `render/music/<A|B-kaynak>/...wav` 44,1 kHz stereo.

## 6. Karışım (`render/tools/mix.py`)
- Yeniden planlama: `timing.sub_durs` ölçülen parça süreleriyle değiştirilir; `plan(with_scene(L,'orman'), 900, 5.6,
  'hi')` ölçülmüş sürelerle kurulur; `check_plan` bütün denetimleri raporlar. Plan birimleri üretilenlerin dışına
  çıkarsa eksik birim listelenir ve üretilir (tavan içinde).
- Zaman çizelgesi: leadIn, klipler, cümle arası ve klip sonrası sessizlikler plandan; taşıyıcı öğeleri kendi olayları.
- Yatak düzeyi (konuşma altında): `music.duckedBedLufs` (Varış −33, Derinleşme −34,5, Derin −36, Kapanış −33 LUFS);
  ≥ 20 sn pencerelerde yatak +6 dB, 6 sn rampa, sonraki sözden 8 sn önce iner (`windowSwell`); artış ≤ 1 dB/sn.
  Konuşma yatağın ≥ 15 dB üstünde (3 sn kısa süreli LUFS, her evrede ayrı; `qa.speechOverBedDbMin`).
  Çapraz geçişler ≥ 8 sn, eşit güç, konuşmanın altında; 20 sn'den kısa boşlukta doku değişmez. İmge katmanı
  c4.yer → c4.solma. Dönüş tınısı k.donus'tan 2 sn önce. Son 5 sn yumuşak kapanış (`music.endFadeSec`). Oda sesi hep alt
  katmanda. Doğa katmanı yatağın ≈ 10 dB altında (VARSAYIM; raporlanır).
- Çıktı: `render/out/ders2-15dk-<nes|hak>-<A|B>.mp3` (44,1 kHz stereo, dosya ≤ 14 MB), aynı adla `.timeline.json`
  (her konuşma parçasının başlangıç/bitiş sn'si, ekran metni, evre, görsel ipucu; müzik/doğa olayları). A/B eşlemesi
  `render/out/_ab_key.json` (sahibe dinlemeden önce gösterilmez).

## 7. Bitti sayılmak için (hepsi ölçülür)
Süre 900 ± 1 sn; her olay planla aynı sırada; eksik/çift cümle yok (tam karışımın Scribe metni plan metniyle hizalanır);
ekran metni = söylenen metin; tık yok; dijital sessizlik yok (oda sesi); konuşma/yatak farkı ≥ 15 dB; gerçek tepe
≤ −1 dBTP; bütünleşik ≈ −18/−20 LUFS (raporla); `check_plan` sonucu raporda. Kulak kararı gereken her şey listelenir.

## v3 eki (PLAN.v3 §A.3, §E.2, §E.3, §F A adımı; 2026-09-29)
Bu ek yukarıdaki maddelerin yerini aldığı yerde açıkça söyler; söylemediği yerde yukarısı geçerlidir. Eski sürüm:
`render/out/_onceki_v2/SPEC.v2.md`.

### v3.1 Kesim kuralı (§3 ve §4.3'e ek)
- **Metin:** çok cümleli birimde iki nokta üst üste (`:`) kullanılmaz. Seslendirmede iki noktadan sonra uzun bir
  duraklama geliyor. Bu duraklama cümle sonundakinden uzun olunca "en uzun N−1 duraklama" kuralı birimi yanlış yerden,
  cümlenin içinden böler.
- **Kesim:** çok cümleli birimde kesim, cümle sonundaki duraklamadan yapılır. §3'teki "en uzun N−1 duraklama" kuralı
  yerinde kalır. Seçilen kesimin parçaları hece payıyla hizalanmıyorsa (`boundary_misalign` > 0,12) o çekim yanlış
  kesilmiş sayılır. Böyle birimlerde cümle sonuna düşen başka bir duraklama kullanılırsa bu **kural dışı kesimdir**:
  birim "kesim-kuraldisi" bayrağı alır ve kulak listesine girer. Yalnız ölçüyle denetlenen her kesim de kulak listesine
  girer (§4.3 c).
- **Pilotta kural dışı kesilen birim: Neslihan `n2.hatirla`** ("Başta seçtiğin niyeti içinden üç kez söylemek yeterli.
  Ya da yine şunu: "Kendime dinlenmeye izin veriyorum.""). Altı çekimin (3 ilk çekim + 3 yeniden çekim) hepsinde en uzun
  duraklama, ikinci cümlenin içinde "şunu:" sözünden sonra geliyordu. Kurala göre kesim "… yeterli. Ya da yine şunu:" |
  "Kendime dinlenmeye izin veriyorum." olurdu: hizasızlık 0,165–0,186, parça hızları ≈ 3,9 ve 8,0 hece/sn, ekrandaki
  cümle söylenen parçayla uyuşmaz. Seçilen çekimde (retake-t2) kesim, ikinci en uzun duraklamadan, yani cümle sınırından
  yapıldı: boşluk 3,791–4,255 sn, kesim 4,0229 sn, hizasızlık 0,023, hızlar 5,04 / 5,52 hece/sn. Kuralın verdiği kesim
  5,318–5,847 sn'deki boşluktaydı. Bu kesim sahibin kulak onayını bekliyor (`render/out/kulak_listesi.md`).
- Aynı nedenle Neslihan `n1.sec` ("… önerim şu: "Kendime dinlenmeye izin veriyorum."") de kuraldan saptı. Altı çekimin
  hepsinde en uzun duraklama "önerim şu:" sonrasındaydı (0,55–0,56 sn). Kesim, cümle sonundaki 2,699–3,168 sn
  boşluğundan yapıldı: hizasızlık 0,015, hızlar 5,70 / 5,49. Kural 5,473–6,036 sn'yi verirdi (hizasızlık 0,314). Bu kesim
  de kulak onayı bekliyor. Hakan'da iki birim kuralla doğru kesildi, ama pay çok dar: `n1.sec` 1,009, `n2.hatirla` 1,072
  (en kısa seçilen / en uzun seçilmeyen duraklama). Bunlar da kulak listesinde.
- Ders 2 metninin bu iki birimi, insan incelemesinde (PLAN.v3 §E.1) iki nokta olmadan yeniden yazılır ve yeniden
  seslendirilir. Bu adımda metne ve sese dokunulmadı.

### v3.2 Scribe yazım istisnaları (§4.2'ye ek)
Normalleştirilmiş sözcük dizisi birebir aynı olmalıdır (§4.2). Yalnız iki yazım farkı eş sayılır:
(1) bitişik birleşik sözcüğün ayrı yazımı ("sırtüstü" = "sırt üstü"; de/da, ki, mi ayrık yazımı istisna değildir);
(2) ek-fiilin bitişik ya da ayrı yazımı: -(y)sA / ise, -(y)DI / idi, -(y)mIş / imiş; ünlü uyumu, y kaynaştırması ve
sert ünsüz kuralıyla ("nefesteyse" = "nefeste ise").
Uygulama `audio.py compare` içindedir (istisnasız eski davranış: `--strict`). Kullanılan istisna sonuçta ayrıca yazılır.
Liste ve örnekler `render/scribe_istisnalari.md` dosyasındadır. Liste Türkçe editörün onayına gider; onay gelene kadar
yalnız istisnayla eşleşen klip kulak listesinde kalır.

### v3.3 Kısa parça ve tepe yönetimi (§3 "Seviye" yerine, < 1 sn ve tepe kısmı)
- **Düzey:** 1 sn'den kısa parça, LUFS ölçülebiliyorsa (≥ 0,4 sn), uzun kliplerle aynı ölçüye ve hedefe getirilir:
  −18 LUFS, BS.1770 kapılı. Konuşma/yatak denetimi de bu ölçüyü kullanır. Gerekçe: pilotta RMS'le eşitlenen kısa
  parçalar LUFS'te uzun kliplerin 0–4,6 dB altında kaldı (Hakan'da ortalama −19,7, Neslihan'da −19,1 LUFS). Sabit bir
  RMS ofseti bunu düzeltemez, çünkü fark parçadan parçaya değişir.
  `qa.microClipRmsOffsetDb` yeniden ayarlandı: tek heceli mikro parçanın ek ofseti bu ölçekte **0 dB**
  (`audio.MICRO_OFFSET_V3_DB`). Pilotun "+1 dB RMS" kuralı mikro parçaları zaten ≈ −18,1 LUFS'e (Neslihan) ve
  ≈ −19,0 LUFS'e (Hakan) koymuştu. Sayımda tek ve iki heceli sayılar aynı yükseklikte duyulsun diye ek ofset konmaz.
  `pilot/ders2.lesson.json` salt okunurdur ve değiştirilmedi; ders verisine taşınması B adımının işidir.
  0,4 sn'den kısa parçada eski RMS yolu kalır.
- **Tepe (klip düzeyinde):** her klipte gerçek tepe ≤ −1,5 dBTP korunur. Eski sınırlayıcı 1 dB'den çok kısacaksa ikinci
  bir aday denenir: yumuşak dizli tepe sıkıştırma (3:1, 6 dB diz, 10 ms Hann ileriye bakan atak, 0,04 dB/ms bırakma,
  en çok 6 dB) ve ardından kalan tepe için sınırlayıcı. Bozulma göstergesi (`fast_sdr_db`, perde içi hızlı kazanç
  kıpırtısı) daha iyi olan aday seçilir. Sınırlayıcı 1 dB ya da daha az kısıyorsa klip v2 ile örnek örnek aynı kalır.
- **Kısa parça sınırı:** seçilen zincirde sınırlayıcı payı 3 dB'i aşıyorsa kısa parçanın hedefi 0,5 dB adımlarla en çok
  3 dB iner (en az −21 LUFS). Konuşma/yatak eşiğinin kalan açığı karışımda kapanır (v3.4).
- Araçlar: `tools/audio.py` `process --level-rule v3|v2 --peak-mode auto|limiter` ve `tools/reprocess_v3.py`
  (bütün seçilmiş parçalar, çıktı `sel/<ses>/_v3/` ve `sel/<ses>/reprocess-v3.json`). Kaynaklar seçim ajanlarının
  kesim dosyalarıdır; kaynak eşlemesi v2 ayarlarıyla 316 parçanın 315'inde örnek örnek aynı çıktıyı verdi.

### v3.4 Sıkı konuşma/yatak eşiği (§6 ve §7'ye ek)
- Konuşma yataktan en az **15 dB** yüksek olmalı. Bu, **1 sn'den kısa parçalar dahil her konuşma parçası** için
  geçerlidir (PLAN.v3 §E.3). Ölçü §6'daki gibidir: parçanın BS.1770 kapılı yüksekliği (stereo, evre kazancı dahil) eksi
  parça boyunca yatağın 3 sn ST en yükseği.
- Evre ofseti (≥ 1 sn parçalar için, evrenin bütün yatağı) eskisi gibi kalır. Bu düzeltmeden sonra eşiğin altında
  kalan parça için **yerel yatak kısması** uygulanır. Müzik, imge ve doğa katmanları parça ±1,5 sn boyunca düz −d dB
  kısılır. İki yanda max(1 sn, d / 1 dB/sn) rampa vardır, yani iniş ve çıkış ≤ 1 dB/sn. Hedef ≥ 15,5 dB'dir. Kısma A ve
  B karışımlarında ortaktır (kör karşılaştırma). Kısmalar `timeline.json` içinde `local-duck` olayı olarak yazılır.

### v3.5 Tam karışımın Scribe denetimi yerine parça konum denetimi (§7'ye ek)
- Tam karışım Scribe ile yazıya çevrilmez. Yerel dosyayı yükleme aracı yok; üretimde 241 dk × 5,5 kredi/sn ≈ 80 bin
  kredi tutar ve toplam tavanı aşar (PLAN.v3 §C.3).
- Yerine: her konuşma parçası, Scribe'dan geçmiş çekimden gelir (§4.2 ve v3.2). Plan ile zaman çizelgesi aynı sırada
  ve aynı metinle birebir karşılaştırılır. Kodlanmış dosyada her parçanın dalga biçimi ±50 ms içinde aranır:
  **ilinti ≥ 0,95 (VARSAYIM)** ve **kayma ≤ 1 ms**. AAC'de aynı denetim Mac'te, çözülmüş dosyada yapılır.
- §7'nin "tam karışımın Scribe metni plan metniyle hizalanır" maddesi bu denetimle değiştirildi. Bitti ölçütlerine
  `speech_over_bed_ge15_all_pieces_v3` (v3.4) eklendi.

### v3.6 Parça konum denetimi, ilinti (orkestratör kararı, 2026-09-29)
Denetim parçanın YERİNİ ölçer, tınısını değil. Bu yüzden B adımından başlayarak ilinti, iki sinyal 4 kHz altına
süzüldükten sonra hesaplanır; eşik 0,95 ve kayma sınırı değişmez. Neden: pilotta hak-B c1.l10'da ilinti 0,948 çıktı,
kayma 0,05 ms idi (parça yerinde); düşüklük MP3'ün ıslıklı /s/ bandını korumamasından geliyordu. Pilotun dört karışımı
için bu parça, ölçülen kaymayla yerinde sayılır.
