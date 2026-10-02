# Nefona Yoga · Üretim şartnamesi, sürüm 3 (bağlayıcı)

Tarih: 2026-09-30. Dayanak: PLAN.v3 (`/home/user/eyes/yoga-pilot/v3/PLAN.v3.md`, onaylı), §F'nin B satırı. Sahibin
kararları: `/home/user/eyes/yoga-pilot/SAHIP_ISTEKLERI.md` madde 7 ve 8.

Bu belge tek üretim şartnamesidir. Pilotun şartnamesi (`$Y/render/SPEC.md`, v3 eki v3.1–v3.6 dahil) bu belgeye
taşındı. Pilot şartnamesinin buraya taşınmayan ya da bu belgeyle çelişen her kuralı §17'de adıyla "geçersiz" diye
yazılıdır. Bir konuda PLAN.v3 ile bu belge çelişirse PLAN.v3 geçerlidir ve çelişki orkestratöre yazılır.
**VARSAYIM** sözcüğü, kanıtın ya da ölçümün vermediği her değeri işaretler.

Kök: `Y=/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga`. B adımının çalışma yeri `$Y/b/`.

---

## 0. Kapsam ve değişmezler

- Bu şartname ilk yayının bütün seslerini bağlar: on ders, 3, 5, 15 dk sürümleri (Ders 2'de 5, 15 ve 20 dk) ve yardımcı
  dosyalar. 16–30 dk ve "istediğin dakika" ikinci aşamadır. O aşama bu şartnameyi değiştirmeden kendi ekini yazar.
- **Kalıp kilidi (PLAN.v3 Kapı 4):** Kapı 4'ten sonra bu şartname ve karıştırıcı değişmez. Değişirse Ders 2 yeniden
  basılır.
- **Ücretli çağrı:** yalnız ElevenLabs MCP bağlantısıyla yapılır. Her çağrıdan önce deftere yazılır (§15). Bağlantı
  yoksa ses üretilmez ve bu durum rapora yazılır. Uydurma çıktı üretilmez.
- **Yazma yeri:** üretim dosyaları `$Y` altına yazılır. Depoya (`/home/user/eyes`) yalnız C adımında, onaylı son
  dosyalar parti başına bir kez girer (PLAN.v3 §C.2). Git komutu çalıştırılmaz. Süreç öldürülmez (`pkill -f` yasak);
  açılan süreç yalnız kendi PID'iyle durdurulur.
- **Sahibe yalnız bitmiş ve ölçülmüş iş gider** (SAHIP_ISTEKLERI madde 3). §12'nin bir ölçütü geçmezse dosya sahibe
  gitmez. Kusur sormadan düzeltilir, yeniden ölçülür.

## 1. Girdiler

| Girdi | Yer | Not |
|---|---|---|
| Ders verisi | ders başına `lesson.json`; Ders 2 için `$Y/b/ders2/ders2.lesson.v3.json` | Ders 2'de pilotun `ders2.lesson.json`'ı salt okunur kalır; v3 kopyası metin deltasını ve §1.1'deki alanları taşır |
| Seslendirilecek birimler | ders başına `units-v3.json`; Ders 2 için `$Y/b/ders2/units-v3.json` | alanlar: `id, clip, kind, form, tts, screen, sentences, phase, syllables, chars, neden, gerekli` (+ taşıyıcıda `items, itemText, cut`; kısa biçimde `belowSec, gapAfter`) |
| Kayıtlı birimler (Ders 2) | `$Y/render/units.json` (68 birim) ve `$Y/render/sel/hoc/` | Nefona Hoca'nın A adımında seslendirdiği 15 dk takımı |
| Planlayıcı | `$Y/pilot/timing.py` (`plan`, `check_plan`, `with_scene`, `sub_durs`, `lint_text`, `run_all`) | salt okunur içe aktarılır; ölçülmüş sürelerle koşturma yardımcısı `$Y/b/work/v3plan.py` |
| Ölçülmüş süreler | `/home/user/eyes/yoga-pilot/v3/calc/measured_durs.json` (nes, hak) ve `$Y/b/ders2/measured_durs.v3.json` (+ hoc) | hoc, `render/out/plan-hoc.json`'dan `v3/calc/measure.py` yöntemiyle türetildi |
| Metin kuralları | PLAN.v2 §A.1, §C (tamamı), §E.6; PLAN.v3 §A.2, §E.1 | §4'te özetlendi |

### 1.1 Ders verisindeki v3 alanları

- `releaseMinutes`: ilk yayındaki süreler (Ders 2'de `[5, 15, 20]`; 3 dk'lı derslerde `[3, 5, 15]`, öteki üçünde `[5, 15]`).
- `voiceProduction.chosen`: `{name, voice_id, sex_param, model, generations_count}` (§2).
- `qa.microClipRmsOffsetDb = 0.0` (§5.4; pilot verisinde 1,0 idi).
- `qa.speechOverBedAllPieces = true`; `qa.positionCheck = {lowpassHz: 4000, corrMin: 0.95, searchMs: 50, maxShiftMs: 1.0}`.
- `timingModel.measuredRatioVsModel`: seçilen sesin ölçülen/model süre oranı (Ders 2'de hoc 1,127).
- `extras.firstLesson`: ilk ders cümlesi (`g.ilk`, §10).
- Kısa biçim (`short`) planlayıcının bugünkü sözleşmesiyle yazılır: `{belowSec, text, gapAfter, syllables, words,
  sentences, voice[, subclips]}`. Kısa biçimin sessizliği tam biçimle aynıdır (PLAN.v3 §A.3: "sessizlik ve taban korunur").

## 2. Ses (TTS)

| Alan | Değer |
|---|---|
| Hoca sesi | **Nefona Hoca**, `voice_id` **`Sr5w7dIZaRDglJ2cLaJm`** (SAHIP_ISTEKLERI madde 8; orkestratör seçimi, VARSAYIM: sahip itiraz ederse değişir) |
| Cinsiyet parametresi | **`m`** (`audio.py --sex m`: 70 Hz yüksek geçiren, erkek F0 aralığı) |
| Model | **`eleven_v4`** |
| Çekim sayısı | **`generations_count: 3`**, her çağrıda açıkça yazılır (verilmezse araç 4 üretir). Düşürülmez: pilotta en iyi okuma birimlerin Neslihan'da %31'inde, Hakan'da %25'inde üçüncü çekimdi |
| Yol | yalnız MCP `creative_generate_speech`. Hız, kararlılık, seed, `previous_text` ve telaffuz sözlüğü yok. v3 yön etiketi ve `<break>` kullanılmaz (etiket okunuyor) |
| Akış | Ders 2: pilot akışı `zAYOhRc6cOKeStKp4ijv`. Öteki dersler: ders başına bir akış (VARSAYIM; akış kimliği deftere yazılır) |
| İstek | her TTS birimi (`units-v3.json` satırı) tek istek. Aynı birime ikinci istek yalnız §6.3'teki yeniden çekim kuralıyla |
| İndirme | imzalı adresler 2 saat geçerli: çekimler hemen `raw/hoc/<birim>/t<n>.mp3` olarak indirilir; aynı klasöre `takes.json` (`unit, voice, voice_name, voice_id, sex_param, model_id, flow_id, requests[node_id, session_ids, requested_at], tts, generations_count, takes[take, file, generation_id, session_id, url, node_id, duration_secs]`). Dosya açılamazsa yeniden indirilir |
| Durum yoklama | birkaç istek ateşlenir, sonra hepsi `creative_get_flow_run_status` ile birlikte yoklanır |

Hız: `eleven_v4`'te hız ayarı yok. Dersin yavaşlığı klipler arası sessizlikten gelir (PLAN.v2 §B.1, §C.2). Nefona
Hoca'nın ölçülen süreleri, planlayıcının üretim köşesinden (5,6 hece/sn, yüksek duraklama) **%12,7 uzundur**
(Neslihan %10,9, Hakan %5,5; 15 dk'nın 110 ortak birimi). Bütün kısa sürüm bütçeleri bu oranla ve ölçülmüş sürelerle
hesaplanır (§9, `b/ders2/timing.txt`).

## 3. Metin (seslendirmeden önce)

Metin, PLAN.v3 §E.1'deki üç onaydan geçmeden seslendirilmez. İnceleyici adı verilmediği için karar 2'nin yedeği
uygulanır: Türkçe editör ve usta hoca yerine birbirinden bağımsız iki model incelemesi aynı ölçütlerle okur, son kulak
kararı sahibindir. Klinik psikolog yerine karar 5.3'ün yedek kuralı uygulanır (Ders 4 ve 7).

**Makineyle denetlenen kurallar** (`timing.lint_text`, `check_plan` ve bu belgenin ekleri):
1. **Ekrandaki cümle = söylenen cümle.** `tts` ile `screen` harfi harfine aynıdır. `ttsText` yalnız söyleyiş zorunlu
   kılarsa kullanılır; o zaman bile ekran söyleneni gösterir.
2. **Çok cümleli birimde iki nokta üst üste (`:`) yok** (pilot SPEC v3.1). İki noktadan sonra gelen uzun duraklama
   birimi cümlenin içinden böldürüyordu. Tırnak içindeki söz cümlenin ortasındaysa tırnağın içinde nokta olmaz
   (`INNER_QUOTE_PERIOD`). Taşıyıcının kesilip atılan ön sözü (ör. `car.sayi` "sayıyorum:") bu kuralın dışındadır.
3. **"-(y)abil-":** herhangi bir 60 sn'de en çok üç (timing.py:103-104). 3 dk'da ek sınırlar §9'da.
4. **Yasak sözcük ve iddialar:** PLAN.v2 §C.6 listesi ve planlayıcının `FORBIDDEN`, `FORBIDDEN_E12` listeleri.
   Sağlık iddiası, sonuç vaadi, kontrol kaybı dili, İngilizce sözcük yok; Sanskritçe terim seste en çok bir kez.
5. **Biçim:** klip 1–3 tam cümle; cümle en çok 14 sözcük (hedef 6–12); yavaş seste birimin konuşması ≤ 15 sn.
   Emir kipi yalnız güvenlik cümlelerinde ve bedensel yönergelerde. Sayılar sözcükle.
6. **Düzgün Türkçe (insan ya da yedek inceleme):** TDK yazımı; cümle düşüklüğü, eksik öğe, gereksiz sözcük, yanlış ek,
   çeviri kokan yapı yok. **Yüklemsiz cümle yok.** Tek istisna PLAN.v2 §C.1'in liste biçimidir: beden dolaşımında yer
   adları ve taşıyıcı dizileri. Metin yüksek sesle okunarak denetlenir.
7. **Azalan anlatım (H12):** her planda evre başına ortalama cümle uzunluğu (hece/cümle) Varış > Derinleşme > Derin.
   Kısa biçim yazılırken bu sıra bozulmamalıdır (Ders 2'nin 5 dk'sında pay dardır: Varış 14,83, Derinleşme 14,75).
8. **Uyku dersinde uyandırma cümlesi yok** (PLAN.v2 §B.6).

## 4. Kesim kuralları (pilot SPEC §3 ve v3.1)

1. Çok cümleli birim tek TTS isteğidir ve cümle sonlarından kesilir. Parça sayısı `sentences` sayısına eşit olmalıdır.
2. Kesim yeri: sessizlik aralıklarından en uzun N−1 duraklama seçilir; kesim noktası sessizliğin ortasına yakın sıfır
   geçişidir, uçlar 5 ms yumuşatılır.
3. Parçalar hece payıyla hizalanmalıdır: `boundary_misalign` > 0,12 ise çekim yanlış kesilmiş sayılır ve elenir.
4. Cümle sonuna düşen başka bir duraklama kullanılırsa bu **kural dışı kesimdir**: birim `kesim-kuraldisi` bayrağı
   alır ve kulak listesine girer. En kısa seçilen / en uzun seçilmeyen duraklama oranı ≤ 1,1 ise (VARSAYIM; pilotta 1,009 ve 1,072 dar sayıldı) birim `kesim-dar-pay` alır ve kulak listesine girer.
5. Taşıyıcı, üç nokta duraklarından `items` sayısı kadar parçaya kesilir. Tutmazsa çekim elenir.
6. Kesim doğrulama sırası (ilk çalışan): (a) Scribe sözcük zaman damgası varsa her kesim noktası iki öğenin arasına
   düşer; (b) yerel dosya yükleme aracı varsa parçalar aralarında 1,0 sn sessizlikle birleştirilip tek Scribe ile okunur;
   (c) ikisi de yoksa kesim yalnız ölçüyle denetlenir ve birim `kesim-kulak` alır. Kullanılan yol `selection.json`'a
   yazılır.

## 5. Klip işleme (`render/tools/audio.py`; numpy, scipy, soundfile, pyloudnorm)

1. **Kırpma:** −50 dBFS eşik, önde 60 ms, sonda 250 ms pay, 10 ms yumuşak uç. Klip içindeki duraklamalara dokunulmaz.
2. **Süzgeç:** 2. derece yüksek geçiren, `sex m` için 70 Hz (f için 90 Hz). Islıklı ses: 5–9 kHz bandı eşiği aşarsa
   en çok −4 dB.
3. **Düzey (≥ 1 sn parça):** −18 LUFS ± 0,5 (BS.1770 kapılı), gerçek tepe ≤ −1,5 dBTP (4× üst örnekleme).
4. **Kısa parça (v3.3):** 1 sn'den kısa parça, LUFS ölçülebiliyorsa (≥ 0,4 sn) aynı ölçüye ve hedefe (−18 LUFS)
   getirilir. Tek heceli mikro parçanın ek ofseti **0 dB** (`audio.MICRO_OFFSET_V3_DB`; ders verisinde
   `qa.microClipRmsOffsetDb = 0`). 0,4 sn'den kısa parçada RMS yolu kalır, evrenin referans klibinin konuşma RMS'ine.
5. **Tepe (klip düzeyi, v3.3):** sınırlayıcı 1 dB'den çok kısacaksa ikinci aday denenir: yumuşak dizli tepe sıkıştırma
   (3:1, 6 dB diz, 10 ms Hann ileriye bakan atak, 0,04 dB/ms bırakma, en çok 6 dB) + kalan tepe için sınırlayıcı.
   `fast_sdr_db` göstergesi daha iyi olan seçilir. Seçilen zincirde sınırlayıcı payı 3 dB'i aşarsa kısa parçanın
   hedefi 0,5 dB adımlarla en çok 3 dB iner (en az −21 LUFS); kalan açık karışımda kapanır (§8.4).
6. **Evre kazancı** (`voicePhaseGainDb`): Varış 0, Derinleşme −1,5, Derin −3, Kapanış 0 dB. Düzey yalnız ≥ 4 sn'lik
   sessizlikte rampayla değişir; basamak yok. Kapanış geçişi rampası `k.anahtar3` sonundan `k.donus` başına.
7. **Ölçümler** (her çekim ve her parça): süre, konuşma süresi, eklemleme (hece / sesli süre), duraklama deseni, F0
   ortalama ve yayılımı, ıslıklı oran, kırpılma, DC, LUFS/RMS, tık (10 kHz üstü ani enerji), veri kenarı basamağı.
8. **Taşıyıcı eklemi:** ardışık parçaların son/ilk 500 ms F0 farkı ≤ 2 yarım ton (`qa.carrierJoinF0StepSemitones`).
   Seçimde yumuşak ölçüttür; aşılırsa `eklem>2yt` bayrağıyla kulak listesine girer. (Nefona Hoca'nın 15 dk takımında 13
   taşıyıcıda 4,05–11,83 yt ölçüldü; `render/out/kulak_listesi.md`.)
9. Sonuç: `sel/hoc/<birim>/<parça>.wav` (44,1 kHz mono float) ve `sel/hoc/selection-*.json` (birim → çekim, ölçümler,
   Scribe metni, bayraklar).

## 6. Çekim seçimi ve Scribe doğrulaması

### 6.1 Nesnel sıralama (pilot SPEC §4.1, PLAN.v2 §D.1.4)
(a) kırpılma ve tık yok (zorunlu); (b) kesim tutuyor (zorunlu, §4); (c) eklemleme: Derin evrede ≤ 5,0 hece/sn tavanı
raporlanır (VARSAYIM), öteki evrelerde 5,0–6,2 tercih; (d) süre üç çekimin ortancasına yakın; (e) F0 yayılımı düşük;
(f) taşıyıcı eklemi ≤ 2 yarım ton; (g) komşu klibe süreklilik. Sağ ve sol taşıyıcılar ayrı isteklerdir; sol için sağınkine
perde ve hızca en yakın, ama F0 çizgisi farklı geçerli çekim seçilir (`qa.carrierTakesRule`).

### 6.2 Scribe ile harf harf eşleşme (PLAN.v3 §E.2)
Seçilen çekim `creative_attach_reference_file` ile akışa eklenir, düğüm `creative_transcribe_audio`'ya bağlanır
(`connect_from`). Normalleştirme: Türkçe küçük harf (İ→i, I→ı); noktalama, üç nokta ve tırnak atılır; boşluk tekleşir;
0–10 rakamları sözcüğe çevrilir. **Sözcük dizisi birebir aynı olmalıdır.**
Eş sayılan yalnız iki yazım farkı vardır (`audio.py compare`; istisnasız davranış `--strict`):
1. **Bitişik birleşik sözcüğün ayrı yazımı** ("sırtüstü" = "sırt üstü", "başparmağı" = "baş parmağı"; en çok üç parça).
   Parçalardan biri de/da, ki, mi/mı/mu/mü ya da tek harfliyse eş sayılmaz.
2. **Ek-fiilin bitişik ya da ayrı yazımı:** -(y)sA / ise, -(y)DI / idi, -(y)mIş / imiş; ünlü uyumu, y kaynaştırması ve
   sert ünsüz kuralıyla ("nefesteyse" = "nefeste ise"). Kişi eki iki yazımda aynı olmalı.

Kullanılan istisna sonuçta `exceptions` alanına yazılır; sessizce geçilmez. Liste (`render/scribe_istisnalari.md`)
Türkçe editörün, yoksa karar 2 yedeğinin onayına gider. **Onay gelene kadar istisnayla eşleşen klip kulak listesinde
kalır** (Nefona Hoca'da bugün `a.durus`, `car.sag1`, `c2.yer`, `c2.alt`).

### 6.3 Eşleşmezse
Sıradaki çekim denenir. Üçü de tutmazsa **bir kez** yeniden çekim (3 çekim; deftere yazılır). Yine tutmazsa en iyi
çekim `kulak` bayrağıyla kulak listesine girer. Kulak kararı yanlış vurgu ya da söyleyiş derse klip yeniden üretilir
(düzeltme payından). Scribe vurgu hatasını yakalamaz; yazım eşleşmesi doğru söyleyişin kanıtı sayılmaz.

## 7. Müzik: A = ElevenLabs Music (SAHIP_ISTEKLERI madde 8)

B (Dalga motoru) seçilmedi: yatakta ≈ 24 sn'de bir ≈ 20 dB iniş ve 6,8 dB/sn geri çıkış ölçüldü (sınır ≤ 1 dB/sn).
Karma senaryo (PLAN.v3 §C.3) ayrı karar ister; karar yoksa on derste ElevenLabs.

### 7.1 Üretim
- Model `eleven_music_v2_5`; `instrumental: true`, `lyrics_type: instrumental`; `duration_seconds` düğümde
  `creative_update_node` ile. Önce `estimate_only` ile fiyatlanır ve deftere yazılır, sonra çalıştırılır, sonra gerçek
  fiyatla uzlaştırılır (§15).
- **İstem kalıbı:** dersin imzası (PLAN.v2 §A.2.1 "Müzik ve doğa imzası") + evre dokusu + her isteme harfi harfine
  eklenen zorunlu son cümle: *"Very slow, pulseless, no drums, no percussion, no vocals, no choir, no crescendo, flat
  dynamics, sustained."* Ders 2'nin istemleri pilottakilerle aynıdır (`render/music/el/prompts.json`):
  - `varis`: "Ambient meditation drone in E-flat major: a warm, soft pad with low strings (cellos and double basses)
    holding long, gently overlapping chords that change only rarely, quiet and even from the first second to the last." + son cümle
  - `derin`: "Ambient meditation drone in E-flat major, darker and lower: a thin, muted, warm pad with low, long-held
    strings (cellos and double basses) in a low register, very little brightness, chords changing only rarely, the same
    quiet energy throughout." + son cümle
  - `imge`: "Solo soft felt piano in E-flat major, sparse and distant: single notes and quiet two-note intervals far away
    in a large soft reverb, with long gaps of near silence between them, the same sparse calm throughout." + son cümle
  - `kapanis`: "Ambient meditation pad in E-flat major with low strings (cellos and double basses), the same warm palette
    but slightly brighter and more open, with a soft high-string halo, gently resolving onto a warm, long-held E-flat
    major chord." + son cümle
  - doğa (sfx, `eleven_text_to_sound_v2`, `loop: true`, 4 × 30 sn): "Gentle distant wind through forest leaves, soft
    continuous leaf rustle, calm and even, quiet open forest air"
- **Aile yapısı (ders başına, pilottan):** açılış adayı 1 × 180 sn (Varış) · Varış-Derinleşme ailesi 2 × 300 sn · Derin
  ailesi 2 × 240 sn · İmge katmanı 1 × 180 sn · Kapanış 1 × 180 sn = 1.620 sn. Bir dersin 3, 5, 15 (Ders 2'de 20) dk'sı
  aynı yatakları kullanır; dersler arasında yatak paylaşılmaz. Bir dosyada aynı müzik bölümü iki kez çalmaz.
- **Ton:** ElevenLabs istenen tonu tutmuyor. Pilotta 7 parçanın 5'i Mi♭ dışında çıktı; set A/Re ailesinde toplandı, iki
  parça 1 yarım ses yerel hız değişimiyle aileye alındı (`el-v-aday.keyA`, `el-derin-b.keyD`; `music/el/manifest.json`
  `key_finding`). Kural: her parçanın tonu ölçülür ve deftere yazılır; bir dersin bütün parçaları aynı aileden olmalıdır
  (geçiş çatışma endeksi ≤ 0,2, VARSAYIM; pilotta aile içi 0,11–0,14, aileler arası 0,35–0,42). Aileye en çok 1 yarım
  seslik yerel hız değişimiyle giren parça kulak listesine yazılır; daha büyük kayma yasak (tını bozuluyor), parça
  yeniden üretilir. Ders 2'nin ailesi A/Re'dir; `music.key` alanındaki "Mi♭ majör" istemdir, ölçülen ton değildir.
- **Doğa, dönüş tınısı, oda sesi:** Ders 2'de orman döngüleri `music/common/orman-1..4.wav`; dönüş tınısı yerel
  sentez `common/donus.synth-D5.wav` (ElevenLabs tınısı ölçümde "kaba" çıktı; pilot kararı); oda sesi pembe gürültü,
  −58 dBFS RMS, `common/oda-sesi-1..2.wav`.

### 7.2 Denetim (her parça; biri geçmezse parça kullanılmaz)
Vokal ve koro yok (Scribe metni boş; vokal denetimi 5,5 kredi/sn); davul ve vuruş yok (nabız belirginliği < 0,5,
güçlü başlangıç ≤ 10/dk; imge katmanında ≤ 30/dk); dinamik düz (gövdede 3 sn ST yayılımı p5–p95 ≤ 6 LU; 6–9 kulak;
> 9 ret); döngü ekinde ve gövdede tık yok; ton ölçümü (§7.1). Eşikler pilotun `manifest.json` `thresholds_VARSAYIM`
alanındakilerdir.

### 7.3 Ders 2'nin 20 dakikası için ek müzik (ölçülmüş sürelerle hesap)
Nefona Hoca'nın 20 dk planında (`b/ders2/timing.txt`) evre aralıkları: açılış 0–115 sn (123 sn gerekir, 157 sn var),
Varış-Derinleşme 115–407 (301 / ≈ 548), **Derin 407–1057 (658 sn gerekir; iki Derin parçasının kullanılabilir toplamı
≈ 412 sn)**, **İmge `c4.yer` → `c4.solma` 766–999 (241 sn gerekir; imge parçası 164,5 sn)**, Kapanış 1057–1200
(143 / 166), **C3 zıtlık 647–723 (76 sn; "daha ince pad" dokusu pilotta hiç üretilmedi)**. Karıştırıcı bir aileyi
tekrar etmeden kapsayamazsa durur (`mix.py` "aile kapsamı yetmiyor"). Gereken üretim:

| Parça | İstem | Süre | Müzik kredisi (15,0/sn) | Vokal denetimi (5,5/sn × 1,077) |
|---|---|---|---|---|
| Derin ailesi 3. parça | `derin` | 300 sn | 4.500 | 1.777 |
| İmge ailesi 2. parça (imge iki parçalı aile olur; karıştırıcıda araç işi) | `imge` | 180 sn | 2.700 | 1.066 |
| Zıtlık dokusu (C3; `layer:zitlik`) | `derin` istemi + "even thinner and higher, fewer low notes" (VARSAYIM) | 120 sn | 1.800 | 711 |
| **Toplam** | | **600 sn** | **9.000** | **3.554** |

PLAN.v3 §F bu kalem için "≤ ≈ 6 bin" yazıyordu (VARSAYIM). Ölçülmüş sürelerle müzik 9,0 bin, vokal denetimiyle
≈ 12,6 bin kredi eder; fark ≈ 6,6 bin, toplam tavandaki ≈ 19 binlik paydan düşer (§15.3).
Zıtlık dokusu için önce ücretsiz yol denenir: yeni Derin parçasından yerel süzgeçle türetilen ince doku (≥ 300 Hz yüksek
geçiren; VARSAYIM). Kulak onaylarsa 120 sn'lik üretim yapılmaz ve kalem 1.800 + 711 kredi düşer.

## 8. Karışım (`render/tools/mix.py`; motorun kuralları çevrimdışı)

1. **Yeniden planlama:** `timing.sub_durs` seçilen sesin ölçülen parça süreleriyle değiştirilir; her süre için
   `plan(with_scene(L, sahne), T, 5.6, 'hi')` ölçülmüş sürelerle kurulur ve `check_plan` bütün denetimleri raporlar
   (§12.2). Plan, üretilenlerin dışında bir birim isterse eksik birim listelenir ve üretilir (tavan içinde).
2. **Zaman çizelgesi:** giriş (`leadIn` 3–6 sn), klipler, cümle arası ve klip sonrası sessizlikler plandan; taşıyıcı
   öğeleri kendi olaylarıdır.
3. **Yatak düzeyi:** konuşma altında `music.duckedBedLufs` (Varış −33, Derinleşme −34,5, Derin −36, Kapanış −33 LUFS);
   duyurulu, ≥ 20 sn'lik pencerede +6 dB, 6 sn rampa, sonraki sözden 8 sn önce iner (`windowSwell`); kısa süreli
   yükseklik artışı ≤ 1 dB/sn. Yatak EQ'su: 150 Hz 2. derece yüksek geçiren + 2.449 Hz'de −3 dB çukur (Q 0,98).
4. **Konuşma/yatak ≥ 15 dB, her konuşma parçasında, 1 sn'den kısalar dahil** (v3.4). Ölçü: parçanın BS.1770 kapılı
   yüksekliği (stereo, evre kazancı dahil) eksi parça boyunca yatağın 3 sn ST en yükseği. Evre ofsetinden sonra eşiğin
   altında kalan parçada **yerel yatak kısması**: müzik, imge ve doğa katmanları parça ±1,5 sn boyunca düz −d dB,
   iki yanda max(1 sn, d / 1 dB/sn) rampa; hedef ≥ 15,5 dB. Kısmalar `timeline.json`'da `local-duck` olayıdır.
5. **Geçişler:** doku çapraz geçişi ≥ 8 sn, eşit güç, konuşmanın altında; 20 sn'den kısa boşlukta doku değişmez; blok
   başına en çok bir doku değişimi. İmge katmanı `c4.yer` → `c4.solma` (yatağın 8 dB altında). Zıtlık dokusu `c3.agir`
   → `c3.birak`. Dönüş tınısı her pencere dönüşünden ve `k.donus`'tan 2 sn önce (−30 LUFS, VARSAYIM). Ses 3 sn'de
   açılır, son 5 sn'de yumuşak kapanır (`music.endFadeSec`). Oda sesi hep alt katmanda; doğa katmanı yatağın 10 dB
   altında (VARSAYIM).
6. **Yükseklik hedefleri:** konuşma klibi −18 LUFS; dosyanın bütünleşik yüksekliği gündüz **−18 ± 1 LUFS**, gece
   (Ders 3) **−20 ± 1 LUFS** (VARSAYIM); dosyada gerçek tepe **≤ −1 dBTP**, kodlamadan önce stereo bağlı sınırlayıcı
   tavanı −2 dBTP (kodlama taşmasına pay; −2,5 / −3'e iner).
7. **Tek karışım** (PLAN.v3 §C.1): netlik anahtarı, arka plan, sahne ve duruş seçenekleri ilk yayında yok. Ders 2'de sahne
   Orman; dönüşümlü seçenekler (`alternates`) dosyada sabit, ilk seçenek.

## 9. 3 dakika biçimi (PLAN.v3 §A.2; Ders 1, 4, 5, 6, 8, 9, 10)

İskelet (oturarak yapılan gündüz dersi): giriş müziği 0:04 → Varış 0:30 → çekirdek 1:38 → Kapanış 0:48. Metin
≈ 310–330 hece (≈ 130–140 sözcük), konuşma payı ≈ %41 (VARSAYIM modeli, ±%15; ilk 3 dk metni okutulunca ölçülür).
Kurallar (hepsi planlayıcı testine girer):
1. Yalnız oturarak. Uzanarak yapılan derste 3 dk yok (Tran 2021, PMID 34260686, DOI 10.1093/ageing/afab090).
2. Varış ve Kapanış kendi kısa metinleriyle kurulur, sıkıştırılarak değil; kapanış sessizlikleri kısalmaz. Kısalık `short`
   biçimli kliplerden ve `minTarget` ile dışarıda kalan kliplerden gelir.
3. Zaman verir: her yönergeden sonra eylem süresi + ≥ 2 sn; çekirdekte en az bir 12–20 sn'lik nefes payı; 20 sn'yi aşan
   sessizlik yok.
4. Tabanlar: çekirdek blok ≥ 0:55, niyet ve yerleşme bloğu ≥ 0:20. İstisnalar (karar 4c): Sağlam Yer'in dağ duruşu
   0:38, Gelecekteki Sen'in küçük adım bölümü 0:43.
5. Anahtar cümle bir kez; başarısızlığı olağan sayan bir cümle bulunur.
6. "-(y)abil-": herhangi bir 60 sn'de ≤ 3. Dersin kendi açılış cümlesi "-(y)abil-"siz kısa biçimle söylenir; `a.izin`'den
   sonraki 60 sn'de "-(y)abil-" yok. **3 dk Kapanış'ı en çok bir "-(y)abil-" taşır**; `k.nefes` ve `k.goz` karşılıkları
   "-(y)abil-"siz yazılır.
7. Son 60 sn'de nefes tutma, yeni imge ya da zor blok yok; çekirdeğin son klibi dönüş cümlesi ya da niyettir.
8. Görsel şafak 3 dk'da 45 sn (karar 4d); öteki sürelerde ≥ 60 sn.
9. Zor blok 3 dk'da açılmaz (Ders 4'te duyguyu bedende bulma, Ders 7'de kendine dönüş).
10. Alt küme: 3 ⊂ 5 ⊂ … ⊂ 15 (Ders 2'de 5 ⊂ … ⊂ 20; önek kuralı, timing.py:22).
11. Müzik: iki doku geçişi (Varış → çekirdek, çekirdek → Kapanış); dersin teması aynı kalır.
12. Kaynak kartında 3 dk'ya özgü etki cümlesi yok; kart yalnız Radin 2025'in kullanım bulgusunu (PMID 39808431, DOI
    10.1001/jamanetworkopen.2024.54435) ve "Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık."
    cümlesini yazar.

Boş pay (min sessizliklerle): 3 dk'da ≥ 10 sn (VARSAYIM), 5 dk'da ≥ 15 sn (timing.py:114), seçilen sesin ölçülmüş
süreleriyle. **Araç işi (henüz yapılmadı):** timing.py bugün 5–30 dk'yı denetler (`MINUTES`); `minutes.min` = 3, 3 dk
tabanları, 45 sn şafak, 3 dk Kapanış'ının "-(y)abil-" sınırı ve test dakikaları eklenecek (`v3/sure.md` §8).

## 10. Dosya adları ve biçimler

Adlar ASCII, küçük harf; ders iki haneli (`d02`), süre iki haneli (`05dk`). Uygulama dosyasının adında ses ve müzik
kaynağı yoktur (tek ses, tek karışım); üretim adında vardır.

| Dosya | Üretim (render, ana kopya) | Uygulama (`app/public/yoga/dNN/`) |
|---|---|---|
| Ders × süre | `dNN-MMdk-hoc-A.wav` (44,1 kHz stereo, 32 bit float) | `yoga-dNN-MMdk.m4a` |
| Zaman çizelgesi | `dNN-MMdk-hoc-A.timeline.json` | `yoga-dNN-MMdk.timeline.json` |
| Tarayıcı önizlemesi (Kapı 3) | `dNN-MMdk-hoc-A.mp3`: 5 ve 15 dk ABR 120 kbit/sn, 20 dk 96 kbit/sn; dosya ≤ 15.000.000 bayt | — |
| İlk ders girişi (dersin giriş müziği + `g.ilk`) | `dNN-giris-hoc-A.wav` | `yoga-dNN-giris.m4a` |
| Kaldığın yerden açılış izni (`a.izin`) | `dNN-izin-hoc-A.wav` | `yoga-dNN-izin.m4a` |
| Bırakma ön klibi (imge / zıtlık) | `dNN-birak-imge-hoc-A.wav`, `dNN-birak-zitlik-hoc-A.wav` | `yoga-dNN-birak-imge.m4a`, `yoga-dNN-birak-zitlik.m4a` |
| Durdurma sonrası sesli dönüş (`d.goz`, `d.kalk`, `d.bekle`; 20–30 sn) | `ortak-durdur-hoc.wav` | `yoga-ortak-durdur.m4a` |
| Ses denetimi (10 sn; `c1.b01`, `c1.s16`, `c2.n03`) | `ortak-ses-denetimi-hoc.wav` | `yoga-ortak-ses-denetimi.m4a` |
| Uyku dersinin müzik kuyruğu (döngü) | `d03-kuyruk-A.wav` | `yoga-d03-kuyruk.m4a` |

Ham çekimler `raw/hoc/<birim>/t<n>.mp3`, seçilmiş parçalar `sel/hoc/<birim>/<parça>.wav`. Ana kopyalar (WAV) depoya
girmez: sahibin Mac'inde ve bulutta iki kopya (PLAN.v3 §C.2). `timeline.json` ve uygulama dosyalarında mutlak yol
yazılmaz; `file` alanı yalnız dosya adıdır.

## 11. `timeline.json` şeması (`nefona.yoga.timeline/2`)

Pilot biçiminin (`render/out/ders2-15dk-hoc-A.timeline.json`) genişletilmiş hali. Oynatıcı görseli, sarmayı,
"Kapanışa geç"i ve kaldığın yeri bu dosyadan okur (PLAN.v3 §D.3). Aşağıdaki sayılar biçim örneğidir, ölçüm değildir.

```
{
  "schema": "nefona.yoga.timeline/2",
  "lesson": "ders2-derin-dinlenme", "lessonNo": 2, "title": "Derin Dinlenme (Yoga Nidra)",
  "minutes": 20, "T": 1200, "file": "yoga-d02-20dk.m4a",
  "audio": { "sha256": "…", "codec": "aac-lc", "bitrateKbps": 64, "sampleRate": 44100, "channels": 2,
             "durationSec": 1200.0, "decoderOffsetSamples": 0 },
  "voice": { "id": "hoc", "name": "Nefona Hoca", "voice_id": "Sr5w7dIZaRDglJ2cLaJm" },
  "music": { "source": "A", "family": "A/Re", "scene": "orman" },
  "plan": { "status": "ok", "mode": "pref→max", "f": 0.016, "checkPlanPass": true, "sel": ["N1","C1",…],
            "planner": "pilot/timing.py", "plannerSha256": "…", "lessonSha256": "…" },
  "blocks":   [ { "id": "C1", "title": "Beden dolaşımı", "start": 116.0, "end": 361.0 } ],
  "speech":   [ { "i": 0, "piece": "a.hosgeldin#1", "clip": "a.hosgeldin", "unit": "a.hosgeldin", "block": "A",
                  "phase": "Varış", "start": 4.18, "end": 5.14, "screenText": "Hoş geldin.",
                  "spokenText": "Hoş geldin.", "voiceGainDb": 0.0, "resumeAt": 4.18,
                  "visualCue": { "visual": "phase:varis" },
                  "visualState": { "phase": "varis", "image": "off", "dawn": false } } ],
  "closing":  { "jumpTo": 1049.0, "returnToneAt": 1055.0, "firstWordAt": 1057.0 },
  "release":  { "C4": { "activeFrom": 766.0, "activeUntil": 985.0, "prefixFile": "yoga-d02-birak-imge.m4a" },
                "C3": { "activeFrom": 647.0, "activeUntil": 716.0, "prefixFile": "yoga-d02-birak-zitlik.m4a" } },
  "windows":  [ { "announce": "c4.pencere", "start": 880.0, "end": 925.0, "welcome": "c4.donus1" } ],
  "visual":   [ { "t": 4.18, "cue": "phase:varis", "clip": "a.hosgeldin" } ],
  "dawn":     { "start": 1110.0, "spanSec": 90 },
  "music_events": [ { "layer": "bed", "label": "yatak/Derin-1", "t0": …, "t1": … },
                    { "layer": "bed", "event": "crossfade", "t0": …, "t1": …, "law": "equal-power" },
                    { "layer": "bed", "event": "local-duck", "t0": …, "t1": …, "db": -2.1, "piece": "c1.s09" } ],
  "nature_events": [ … ], "room_tone_events": [ … ],
  "levels": { "speechClipLufs": -18.0, "musicTargetLufsByPhase": {…}, "natureBelowMusicDb": 10.0,
              "imgeBelowBedDb": 8.0, "roomToneDbfsRms": -58.0, "voicePhaseGainDb": {…} },
  "qa": { "pass": true, "report": "rapor-d02.json#yoga-d02-20dk" }
}
```

- Süreler saniye, ondalık üç haneye kadar; `start` ve `end` kodlanmış dosyada ölçülen konumdur (§13).
- `resumeAt`: "Duraklat / sürdür" ve "kaldığın yer" o anki **birimin** ilk parçasının başına oturur (PLAN.v2 §B.5).
- `closing.jumpTo`: "Kapanışa geç" hedefi, dönüş tınısından önceki sessizlik; `release`: imge ya da zıtlık açıkken önce
  çalınacak bırakma ön klibi ve etkin aralığı.
- Pilot alanları (`speech[].flags`, üretim yolları) yalnız üretim kopyasında kalır; uygulama kopyasına girmez.
  Ek alan eklenebilir; var olan alan kaldırılmaz (oynatıcı bilinmeyen alanı yok sayar).

## 12. Kalite eşikleri (her dosya; biri geçmezse dosya sahibe gitmez)

### 12.1 Karışım (PLAN.v3 §E.3)

| Ölçüt | Eşik |
|---|---|
| Süre | hedef ± 1 sn (kodlanmış dosyada, kodlayıcı ön doldurması düşüldükten sonra) |
| Olay sırası; eksik ya da çift cümle | plan ile birebir |
| Her konuşma parçası kodlanmış dosyada kendi yerinde | **ilinti ≥ 0,95 (iki sinyal 4 kHz altına süzüldükten sonra), kayma ≤ 1 ms** (§13; VARSAYIM eşik) |
| Kurgu noktasında tık | yok (hem float karışımda hem kodlanmış dosyada) |
| Dijital sessizlik | < 100 ms |
| Konuşma / yatak | **≥ 15 dB, 1 sn'den kısa parçalar dahil her parça** (§8.4) |
| Yatak yükselişi | ≤ 1 dB/sn |
| Gerçek tepe | ≤ −1 dBTP (kodlanmış dosya çözülerek) |
| Bütünleşik yükseklik | gündüz −18 ± 1 LUFS, gece −20 ± 1 LUFS (VARSAYIM) |
| Ekrandaki = söylenen | birebir (`screenText == spokenText`, metin = seçilen çekimin Scribe'la eşleşmiş metni) |
| Klip kaynağı | her parça Scribe'dan geçmiş (ya da kulak listesinde adıyla duran) çekimden gelir |

### 12.2 Plan (her ders × süre, seçilen sesin ölçülmüş süreleriyle)
`check_plan` hatasız; boş pay 5 dk'da ≥ 15 sn, 3 dk'da ≥ 10 sn (VARSAYIM); 60 sn'de ≤ 150 hece ve ≤ %60 konuşma;
"-(y)abil-" (§3, §9); şafak; son 60 sn; zor blok bölünmez ve kapanıştan hemen önceye gelmez; H12 azalan anlatım;
alt küme (3 ⊂) 5 ⊂ … ⊂ 15 (⊂ 20) her dakikada; T5 esneme sınırı; "Kapanışa geç" ön klipleri (S3-01).
Ölçülmemiş birim (yeni metin, kısa biçim) için iki kestirim koşulur ve **ikisinde de** geçmesi gerekir: birimin pilot
oranı ve max(genel oran, birim oranı). Birimler seslendirilince karar ölçülmüş süreyle yeniden verilir; geçmezse metin
ya da kısa biçim düzeltilir, sessizlik tabanı düşürülmez.

### 12.3 Bitti (PLAN.v3 §E.7)
Ders ancak (1) metni üç incelemeden (ya da karar 2 yedeğinden) geçmiş, (2) her klibi Scribe ile eşleşmiş, her dosyası
§12.1'den geçmiş ve baştan sona dinlenmiş (panel yoksa sahibince), (3) cihazda kilitli ekranda bütün süreleri kesintisiz
çalmış, (4) sahibi bütün sürelerini onaylamışsa `[x]` olur. Cihazda doğrulanmamış iş `[~]`'dir.

## 13. Tam karışımın Scribe denetimi yerine parça konum denetimi (v3.5, v3.6)

- Tam karışım Scribe ile yazıya çevrilmez: yerel dosyayı yükleme aracı pilot oturumunda yoktu ve 241 dk × 60 × 5,5
  kredi/sn ≈ 80 bin kredi toplam tavanı aşar (PLAN.v3 §C.3).
- Yerine: (1) her konuşma parçası Scribe'dan geçmiş çekimden gelir (§6); (2) plan ile zaman çizelgesi aynı sırada ve
  aynı metinle birebir karşılaştırılır; (3) kodlanmış dosya çözülür, dosya başına tek bir kodlayıcı kayması (ön doldurma;
  pilot MP3'ünde 1.105 örnek) bütün dosyanın ilintisinden bulunur ve düşülür; (4) her parçanın dalga biçimi ±50 ms içinde
  aranır. İlinti, iki sinyal 4 kHz alçak geçirenden geçtikten sonra hesaplanır (8. derece Butterworth, sıfır fazlı
  `sosfiltfilt`; `render/_verify_hoc_tur2/pos_check.py:7`); **ilinti ≥ 0,95 ve kayma ≤ 1 ms**. Gerekçe: denetim yeri ölçer, tınıyı değil; pilotta hak-B `c1.l10`'da
  tam bantta ilinti 0,948, kayma 0,05 ms idi, düşüklük MP3'ün ıslıklı /s/ bandından geliyordu.
- AAC'de aynı denetim Mac'te, çözülmüş dosyada yapılır (§14.4).

## 14. Kodek

### 14.1 Adaylar
Uygulama dosyası m4a içinde **AAC-LC, 44,1 kHz stereo, sabit bit hızı**. Adaylar **64 kbit/sn** ve **96 kbit/sn**.
HE-AAC kullanılmaz (düşük bit hızında yumuşak, sessiz müzikte yapay tını riski; VARSAYIM). Değişken bit hızlı MP3
kullanılmaz (konuma oturma kesin olmalı). Bu ortamda AAC üretilemez (ffmpeg ve afconvert yok); kodlama sahibin Mac'inde
`afconvert` ile yapılır. Komutlar bu ortamda denenmedi.

### 14.2 Test malzemesi (render ortamında hazırlanır)
Aynı Ders 2 karışımının (seçilen ses, müzik A) ana kopyasından üç kesit, her biri 60–90 sn:
1. Varış: konuşma + açılış yatağı (`a.hosgeldin` → `a.izin`);
2. Beden dolaşımı: mikro parçalar ve ıslıklı sesler (`car.sag1` → `car.sag3`);
3. Derin + imge: seyrek piyano, alçak yatak, uzun sessizlik (`c4.yer` → `c4.ses` ve ardındaki boşluk).
Her kesit `parcaN.wav` (kodlanmamış) ve `parcaN.mp3` (pilot biçimi, ABR 120, aynı WAV'dan) olarak Mac'e gider.
AAC hiçbir zaman MP3'ten kodlanmaz.

### 14.3 Kör dinleme (karar 2 yedeği: panel yok, sahip dinler)
Mac'te (`$Y/b/mac/kodek_testi.sh`, tam hali orada):

```
afconvert -f m4af -d aac@44100 -b 64000 -s 0 -q 127 parcaN.wav parcaN.aac64.m4a
afconvert -f m4af -d aac@44100 -b 96000 -s 0 -q 127 parcaN.wav parcaN.aac96.m4a
afinfo parcaN.aac64.m4a            # bit hızı, süre, ön doldurma (priming) karelerini yazar
afconvert -f WAVE -d LEI24@44100 parcaN.mp3        parcaN.mp3.dec.wav
afconvert -f WAVE -d LEI24@44100 parcaN.aac64.m4a  parcaN.aac64.dec.wav
afconvert -f WAVE -d LEI24@44100 parcaN.aac96.m4a  parcaN.aac96.dec.wav
```

Betik üç çözülmüş dosyayı her kesit için rastgele A/B/C adıyla `dinle/` klasörüne koyar. Üçü de aynı kapta (24 bit
WAV) olduğu için uzantı ve boyut adayı ele vermez. Anahtar `_anahtar/anahtar.txt`'tedir ve dinlemeden önce açılmaz.
Sahip dosyaları AirDrop ile iPhone'un Dosyalar uygulamasına alır; sessiz odada, önce iPhone hoparlörüyle sonra
AirPods ile dinler. Her kesitte üç dosyayı en iyiden en kötüye sıralar ve duyduğu kusuru yazar ("boğuk", "cızırtı",
"ıslıklı s bozuk", "piyano titriyor" gibi). Mümkünse 65 yaş üstü biri de dinler.
**Karar kuralı (VARSAYIM):** 6 denemede (3 kesit × 2 cihaz) AAC 64 en az 4 kez en sona konursa ya da AAC 64 için
adıyla bir kusur yazılırsa **96** seçilir; yoksa **64**. (Rastgele sıralamada 6 denemenin ≥ 4'ünde sona düşme olasılığı
≈ %10.) Sonuç ve sıralamalar deftere `kind: "kodek-karari"` satırıyla yazılır.

### 14.4 Üretim kodlaması ve yeniden ölçüm (Mac, `$Y/b/mac/aac_kodla.sh`)
```
afconvert -f m4af -d aac@44100 -b $BIT -s 0 -q 127 yoga-dNN-MMdk.wav yoga-dNN-MMdk.m4a
afinfo yoga-dNN-MMdk.m4a > _olcum/yoga-dNN-MMdk.afinfo.txt
afconvert -f WAVE -d LEF32@44100 yoga-dNN-MMdk.m4a _olcum/yoga-dNN-MMdk.dec.wav
```
Çözülmüş dosya §12.1'in bütün ölçütlerinden ve §13'ün konum denetiminden yeniden geçer (süre, tık, dijital sessizlik,
gerçek tepe, bütünleşik yükseklik, parça konumu). Ön doldurma kareleri `afinfo` çıktısından okunur ve
`audio.decoderOffsetSamples`'a yazılır. **Açık araç işi:** Mac'te koşacak ölçüm betiği (render araçlarının numpy, scipy,
soundfile, pyloudnorm ile çalışan kısmı) henüz yazılmadı; Mac'te `python3 -m pip install --user numpy scipy soundfile
pyloudnorm` gerekir (VARSAYIM: Mac'te python3 var). Kodlanmış dosyanın AVAudioPlayer'da konuma oturma kesinliği ve ön
doldurmanın oynatıcıda düşülmesi cihazda doğrulanmadı (PLAN.v3 §G).

### 14.5 Boyut
AAC-LC 64 = 8.000 bayt/sn = 0,48 MB/dk; AAC-LC 96 = 0,72 MB/dk (ondalık MB). Karar 6'nın ölçümü PLAN.v3 §C.2'dedir
(C adımı, yer tutucu dosyalarla TestFlight).

## 15. Maliyet defteri ve tavanlar

### 15.1 Defter (`render/ledger.jsonl`; B adımında aynı dosyaya eklenir)
Her ücretli çağrıdan **önce** bir satır yazılır: `ts, who, kind (speech | music | sfx | scribe-speech | scribe-music |
voice-design), what, voice, voice_id, unit, flow_id, chars | sec, takes, chars_billed, credits_est, cents_est,
estimate_source`. Çağrıdan **sonra** gerçek fiyat okunur ve bir uzlaştırma satırı yazılır: `reconcile: true,
generation_id, est_credits, actual_credits, credits_est = actual − est`. **TTS dahil** (pilotta ve A adımında TTS
uzlaştırılmadı; 144 + 68 satır). Tahmin yanıtlarına güvenilmez: pilotta Scribe'ın tahmini gerçeğin 16 katı düşük,
müziğinki ≈ 1,8 katı yüksekti.

### 15.2 Birim fiyatlar (1 kredi = 0,01818 sent; 5.500 kredi = 1 USD, MCP çalışma alanı oranı)
| Kalem | Değer | Durum |
|---|---|---|
| TTS, Nefona Hoca, `eleven_v4` | 0,99989 kredi / karakter / çekim (3 çekimde ≈ 3,0 / karakter) | tahmin (`estimate_only`); uzlaştırılmadı |
| Scribe | 5,5 kredi/sn | gerçek |
| Müzik | 15,0 kredi/sn | gerçek |
| Doğa sfx | 3,33 kredi/sn | gerçek |
| Ses tasarımı önizlemesi | bilinmiyor (defterde `credits_est: null`) | doğrulanmadı |

### 15.3 Tavanlar (karar 3) ve sayaç
- **Parti başına 195 bin**, **toplam 600 bin kredi.** Toplam sayaç A adımıyla başlar (PLAN.v3 §C.3 tablosu pilotun
  62.940,3 kredisini içermez). Bugün sayaçta **14.338,1 kredi** var (defterin 400.–541. satırları: Nefona Hoca TTS
  12.124,7, Scribe 2.213,4; ses tasarımı önizlemesinin fiyatı yazılmadı).
- Her parti ve B adımı başlamadan tahmin edilir, tavanla karşılaştırılır. Bir çağrı tavanı aşacaksa yapılmaz, durulur ve
  rapora yazılır.
- **B adımı tahmini (Ders 2):** konuşma `b/ders2/units-v3.json` 26 birim, 1.422 karakter → TTS ≈ 4,3 bin + Scribe
  ≈ 0,8 bin = **≈ 5,0 bin**; 20 dk müziği §7.3 **≈ 9,0 bin + vokal denetimi ≈ 3,6 bin**; yeniden çekim payı konuşmanın
  %15'i ≈ 0,7 bin. Toplam **≈ 18,2 bin** (zıtlık dokusu yerelden türetilirse ≈ 15,7 bin). PLAN.v3 §F B satırı
  "≈ 3–5 bin konuşma + ≤ ≈ 6 bin 20 dk müziği" diyordu; fark müzik kaleminden gelir (§7.3) ve toplam tavandaki
  ≈ 19 binlik paydan düşer.

## 16. Kulak listesi ve rapor
Rapor pilotun `report.md` biçimindedir: her dosya için §12.1 tablosu, `check_plan` sonucu, defter özeti ve kulak listesi.
Kulak listesine girenler: Scribe istisnasıyla eşleşen klipler; kural dışı ve dar paylı kesimler; yalnız ölçüyle
denetlenen kesimler (`kesim-kulak`); taşıyıcı eklemi > 2 yt; Derin evrede > 5,0 hece/sn parçalar; veri kenarı basamağı;
sınırlayıcının 3 dB'den çok kıstığı parçalar; yerel yatak kısması; ≤ 1 yarım sesle aileye alınan müzik parçaları;
ölçüm eşiğinin sınırında kalan her değer. Kör karşılaştırma sürerken liste sesleri adıyla anmaz.

## 17. Pilot şartnamesinin geçersiz kuralları

| Pilot kuralı (render/SPEC.md) | Durum | Yerine |
|---|---|---|
| §0 iki ses × iki müzik = 4 kör karışım | **geçersiz** | tek ses (Nefona Hoca), tek müzik kaynağı (A); kör anahtar yok (§2, §7) |
| §1 girdi `render/units.json` (68 birim) | **geçersiz** (yeni üretim için) | `units-v3.json`; 68 birim kayıtlı takım olarak kalır |
| §2 sesler Neslihan `wQ7dVQFxIqwokkwsMqqn`, Hakan `DwjDVVARfPVjBKepXK2c` | **geçersiz** | Nefona Hoca `Sr5w7dIZaRDglJ2cLaJm`, `sex m` |
| §2 ölçü 0,926 kredi/karakter/çekim; müzik 27,5 kredi/sn (0,30 $/dk) | **geçersiz** | §15.2 (gerçek müzik 15,0 kredi/sn; hoc TTS 0,99989 tahmin) |
| §2 tavanlar: konuşma 550 sent, müzik + doğa + ton 900 sent | **geçersiz** | parti 195 bin, toplam 600 bin kredi (§15.3) |
| §3 "< 1 sn: evre referansının konuşma RMS'i; tek heceli mikro klip +1 dB" | **geçersiz** (v3.3) | ≥ 0,4 sn parçada −18 LUFS, ek ofset 0 dB (§5.4) |
| Ders verisi `qa.microClipRmsOffsetDb = 1.0` | **geçersiz** | 0,0 (`ders2.lesson.v3.json`) |
| §3 "kadın 90 Hz" süzgeci | kural kalır, bu seste kullanılmaz | `sex m`: 70 Hz |
| §5 Dalga motoru yolu (B), port 4290 | **geçersiz** (ilk yayında) | yalnız ElevenLabs Music; karma senaryo ayrı karar |
| §5 "Mi♭ majör" müziğin tonu sayılır | **geçersiz** | ton ölçülür; aile kuralı (§7.1); Ders 2 A/Re ailesi |
| §5 "1.620 sn ≈ 810 sent" | **geçersiz** | 1.620 sn = 24,3 bin kredi (gerçek) |
| §6 yalnız `plan(…, 900, …)` | **geçersiz** | her yayımlanan süre (3/5/15, Ders 2'de 5/15/20) |
| §6 çıktı `ders2-15dk-<nes|hak>-<A|B>.mp3` ≤ 14 MB ve `_ab_key.json` | **geçersiz** | WAV ana kopya + AAC m4a + tarayıcı MP3 (§10) |
| §6 "konuşma yatağın ≥ 15 dB üstünde (3 sn kısa süreli LUFS)", yalnız ≥ 1 sn parçalar denetlenir | **geçersiz** (v3.4) | her parça, 1 sn'den kısalar dahil; yerel yatak kısması (§8.4) |
| §7 "tam karışımın Scribe metni plan metniyle hizalanır" | **geçersiz** (v3.5) | parça konum denetimi (§13) |
| v3.5 ilinti tam bantta | **geçersiz** (v3.6) | 4 kHz altına süzülmüş ilinti (§13) |
| §7 "bütünleşik ≈ −18/−20 LUFS (raporla)" | **geçersiz** (yalnız raporlama) | eşik: gündüz −18 ± 1, gece −20 ± 1 LUFS (§12.1) |
| §7 gerçek tepe yalnız MP3'te | **geçersiz** | kodlanmış AAC çözülerek (§14.4) |
| PLAN.v2 §D.5 konuşma AAC mono 48/64 + ayrı yataklar | **geçersiz** (PLAN.v3 §C.1) | hazır karışım, AAC-LC stereo 64 ya da 96 |
| Ders 2 metninde iki noktalı `n1.sec`, `n2.hatirla` (ve kısa biçimi), `c3.hafif`; yüklemsiz `c3.agir` 1. cümlesi | **geçersiz** | `ders2.lesson.v3.json` (§3 kural 2 ve 6) |

Taşınan ve geçerli kalanlar: pilot §3 kırpma, süzgeç, ıslıklı, düzey, evre kazancı, kesim ve ölçümler (§4, §5); §4 çekim
sıralaması, Scribe normalleştirmesi, kesim doğrulama yolları, taşıyıcı çekim kuralı (§6); §5 istem kalıbı, aile yapısı,
doğa, oda sesi, denetimler (§7); §6 yatak düzeyleri, kabarma, çapraz geçiş, imge katmanı, dönüş tınısı, kapanış
(§8); §7 bitti ölçütleri (§12); v3.1–v3.6 (§4, §5.4–5.5, §6.2, §8.4, §13).

## 18. Açık konular (VARSAYIM ve doğrulanmayanlar)
- Ses ve müzik kaynağı seçimi orkestratörün varsayımıdır; sahip itiraz ederse değişir (SAHIP_ISTEKLERI madde 8).
- Konum ilintisi eşiği 0,95 ve 4 kHz süzgeci; gece −20 LUFS; 3 dk boş pay tabanı 10 sn; kodek karar kuralı; müzik aile
  çatışma eşiği 0,2; zıtlık dokusu istemi; doğa −10 dB, imge −8 dB, dönüş tınısı −30 LUFS.
- `afconvert` komutları ve `afinfo` alanları bu ortamda denenmedi. AVAudioPlayer'ın ön doldurmayı düşmesi cihazda sınanır.
- TTS gerçek fiyatı ve ses tasarımı önizlemesinin fiyatı bilinmiyor.
- Ders 2'nin yeni ve kısa biçimli birimlerinin süresi kestirimdir (§12.2); karar seslendirmeden sonra ölçülmüş süreyle
  yeniden verilir (`b/ders2/timing.txt`).
- 3 dk kuralları ve Mac ölçüm betiği için araç işleri yapılmadı (§9, §14.4).
