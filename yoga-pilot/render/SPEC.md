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
