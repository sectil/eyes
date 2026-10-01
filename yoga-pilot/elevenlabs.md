# ElevenLabs yetenek ve maliyet dosyası — Nefona "Yoga" bölümü

Tarih: 2026-09-28. Hazırlayan: araştırma alt görevi (salt okuma).
Kapsam: Bu oturumdaki ElevenLabs MCP araçları, 10 dersli rehberli yoga/meditasyon bölümü için ne yapabilir, ne yapamaz, kaça mal olur.

## 0. Yöntem ve dürüstlük notları

- Yalnızca salt okuma çağrıları ve `estimate_only=true` fiyat tahminleri yapıldı. **Hiçbir üretim başlatılmadı, kredi harcanmadı.**
  Her tahmin yanıtı şunu döndürdü: `"notes":"Estimate only — nothing was generated and nothing was charged."`
- Yan etki: İlk tahmin çağrısı çalışma alanında boş bir akış (flow) açtı ve her tahmin bu akışa çalıştırılmamış bir düğüm ekledi.
  Akış: `C2klJLqoOq4YwTw08blb` (https://elevenlabs.io/app/flows/C2klJLqoOq4YwTw08blb). `creative_get_flow` ile okundu:
  10 düğümün hepsi `"status":"not_run"`. Maliyeti yok; istenirse panelden silinebilir (bu oturumda silme aracı kullanılmadı).
- Kaynak türleri üç ayrı katmandır ve karıştırılmamalıdır:
  1. **[MCP]** Bu oturumdaki araçların kendi çıktısı (en güçlü kanıt; oturumda gerçekten ne yapılabileceğini gösterir).
  2. **[DOC-C7]** Context7 üzerinden alınan ElevenLabs resmi doküman parçaları (ham metin, kaynak URL'si yanında).
  3. **[DOC-WF]** WebFetch ile çekilen resmi doküman sayfaları. **Uyarı:** WebFetch sayfayı küçük bir modelle özetleyerek döndürür;
     "verbatim" istendi ama birebir alıntı garantisi yoktur. Sayılar kritik karar öncesi sayfada tekrar görülmelidir.
- Görülmeyen her şey "doğrulanmadı" diye işaretlendi.
- API anahtarı hiçbir yere yazılmadı; repoda ElevenLabs anahtar/URL izi de yok (`elevenlabs.io|xi-api-key|text-to-speech|ELEVEN` araması: eşleşme yok).

## 1. Oturumdaki ElevenLabs araçları — kısa harita

`creative_get_flow_node_types` [MCP] çıktısına göre bu çalışma alanı şunları çalıştırabiliyor (ilgili olanlar):

| Düğüm türü | Modeller | Açığa çıkan parametreler [MCP] |
|---|---|---|
| `tts` | eleven_multilingual_v2, eleven_turbo_v2_5, eleven_flash_v2_5, eleven_v3, eleven_v4 | yalnızca `voice_id`, `language_code` |
| `music` | eleven_music_v1, eleven_music_v2, eleven_music_v2_5 | `duration_seconds` (3–600), `lyrics_type` (auto/custom/instrumental), `instrumental` (bool), `lyrics` |
| `sfx` | eleven_text_to_sound_v2 | `duration_seconds` (0.5–30), `prompt_influence` (0–1, vars. 0.3), `loop` (bool) |
| `composition` | eleven_composition | parametre yok; çıktı modalitesi **video** |
| `speech-to-text` | eleven_scribe_v1 | parametre yok (kalite kontrol için transkript) |
| `voice-isolator` | audio_isolation | parametre yok |

Üretim araçlarının ortak davranışı [MCP, araç açıklaması]: `generations_count` **varsayılan 4**, en çok 4; "Costs scale with the count."
Yani parametre verilmezse her istek **4 varyasyon** üretir ve **4 kat** ücretlendirilir.

## 2. Konuşma (TTS) — eleven_multilingual_v2

### 2.1 Oturum araçlarıyla ne ayarlanabiliyor [MCP]

`creative_get_model_schema(tts, eleven_multilingual_v2)` çıktısı:

```json
{"model_id":"eleven_multilingual_v2","model_name":"ElevenLabs Multilingual v2","node_type":"tts",
 "parameters":[{"name":"voice_id","type":"text","required":false,"description":"Deprecated: legacy alias of `voice`. ..."},
               {"name":"language_code","type":"text","required":false,"description":"BCP-47 language code for multilingual models."}],
 "input_ports":[{"key":"prompt","modality":"text","required":false}]}
```

eleven_v3 ve eleven_v4 için de şema aynı: yalnızca `voice_id` ve `language_code`.

`creative_generate_speech` aracının parametreleri: `prompt`, `model_id`, `voice_id`, `flow_id`, `generations_count`, `estimate_only`, `context`, `view_state_id`.

**Sonuç (oturum araçları için):** stability, similarity_boost, style, speed, use_speaker_boost, output_format, seed,
previous_text/next_text, previous_request_ids/next_request_ids, pronunciation_dictionary_locators
**MCP araçlarında yok.** Bunlar yalnızca doğrudan REST API ile ayarlanabilir (anahtar ile, repo dışında çalışan bir üretim betiği gerekir).
MCP ile üretilen dosyanın çıktı biçimi (mp3 bit hızı/örnekleme hızı): **doğrulanmadı**.

Model rehberi [MCP, `creative_get_model_guide(eleven_multilingual_v2)`], birebir:

> - **Punctuate for delivery.** Commas and periods create natural pauses. Ellipses (…) create longer thoughtful pauses. Em-dashes (—) create short beats.
> - **For emphasis, capitalize key words sparingly** ...
> - **Spell tricky names phonetically** the first time if pronunciation matters.
> - **Voice choice is at least as important as the text.**

### 2.2 REST API düzeyinde var olan kontroller (doküman)

| Konu | Bulgu | Kaynak |
|---|---|---|
| İstek başına karakter | Multilingual v2: "10,000" karakter, "~10 minutes"; v3: "5,000", "~5 minutes"; Flash v2.5: "40,000" | [DOC-WF] https://elevenlabs.io/docs/overview/models |
| Türkçe desteği | Multilingual v2 "29 languages including Turkish"; v3 ve v4 listelerinde Türkçe var | [DOC-WF] aynı sayfa |
| voice_settings | stability (vars. 0.5), similarity_boost (vars. 0.75), style (vars. 0), use_speaker_boost (vars. true), speed (vars. 1.0) | [DOC-WF] https://elevenlabs.io/docs/api-reference/text-to-speech/convert |
| speed aralığı | "Speed controls the playback tempo with values ranging from 0.7 to 1.2 (defaulting to 1.0). Style and speaker boost parameters are supported on V2 and newer models." | [DOC-C7] .../text-to-speech/v-1-text-to-speech-voice-id-multi-stream-input |
| stability/similarity aralığı | Swift SDK örneğinde "stability ... (0.0 to 1.0)", "similarityBoost ... (0.0 to 1.0)" | [DOC-C7] .../eleven-agents/customization/personalization/overrides |
| Duraklama `<break>` | "On Multilingual v2, Flash v2, and Flash v2.5, SSML break tags like `<break time="1.5s" />` provide the most consistent way to insert exact, natural pauses up to 3 seconds. The model dynamically integrates these pauses rather than inserting static silence, though excessive breaks may cause speech speedup or audio artifacts." | [DOC-C7] https://elevenlabs.io/docs/product-guides/playground/text-to-speech |
| v3/v4'te `<break>` | "All models except Eleven v3 support SSML break tags." (C7) ve "Eleven v4 and Eleven v3 do not support SSML break tags." (WF) — v4 konusunda iki kaynak çelişiyor, **v4 durumu doğrulanmadı** | [DOC-C7] help-center/.../do-pauses-and-ssml-phoneme-tags-work-with-the-api; [DOC-WF] best-practices/prompting/controls |
| Çıktı biçimleri | varsayılan `mp3_44100_128`; mp3_44100_32/64/96/128/192, mp3_22050_32, mp3_24000_48, opus_48000_32…192, pcm_8000…48000, wav_8000…48000, ulaw/alaw_8000. "MP3 with 192kbps bitrate requires ... Creator tier or above. PCM and WAV formats with 44.1kHz sample rate requires ... Pro tier or above." | [DOC-WF] api-reference/text-to-speech/convert |
| Parça birleştirme (stitching) | `previous_text`, `next_text` alanları var; `previous_request_ids`/`next_request_ids` "A maximum of 3 request_ids can be send."; "The request IDs should be no older than two hours."; "Request stitching is not available for the `eleven_v3` model." | [DOC-WF] api-reference/.../convert ve cookbooks/text-to-speech/request-stitching |
| seed | "best effort to sample deterministically ... integer between 0 and 4294967295" | [DOC-WF] convert |
| language_code | "This parameter is not supported for multilingual_v2 models." — **MCP şeması ise multilingual_v2 için language_code listeliyor; çelişki, etkisi doğrulanmadı** | [DOC-WF] convert |
| Telaffuz (Türkçe) | "Dictionary phoneme tags only work with the eleven_flash_v2 and eleven_v3 models; other models ignore phoneme tags and require alias tags to substitute spellings. For IPA and CMU pronunciations in non-English languages, the eleven_v3 model is required." Sözlük kuralı türleri: `alias` ve `phoneme`; istek başına "A maximum of 3 locators" | [DOC-C7] eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries; [DOC-WF] convert |

**Multilingual v2 + Türkçe için pratik anlamı:** IPA/phoneme ile telaffuz zorlanamaz; yalnızca **alias** (yazımı değiştirme) ve
rehberdeki gibi fonetik yazım + noktalama kullanılabilir. Alias sözlüğü MCP araçlarında yok (yalnız REST API).

### 2.3 `<break>` etiketi tahmin testi [MCP]

| Metin | Düğümde saklanan uzunluk (`creative_get_flow`) | Tahmin (kredi) |
|---|---|---|
| `Nefes al. Nefes ver.` | 20 karakter | 19.998 |
| `Nefes al. <break time="3.0s" /> Nefes ver.` | "(42 chars)" | 30.9969 |

Etiket reddedilmedi ve metin olduğu gibi saklandı; 22 ek karakter ~11 kredi olarak tahmin edildi (tek gözlem).
**Etiketin gerçekten 3 sn sessizlik ürettiği bu oturumda doğrulanmadı** (üretim gerektirir).

### 2.4 Uzun metin testi [MCP]

10.754 karakterlik metin (belgelenen 10.000 sınırının üstü) için tahmin **hata vermedi**:
`{"credits":10752.924599999998,"price_cents":195.50771999999998,"generations_count":1,...}`.
Aracın gerçek üretimde metni böldüğü mü yoksa hata verdiği mi: **doğrulanmadı**.

### 2.5 Sesler [MCP, `creative_list_voices`]

- **Neslihan** — `"voice_id":"wQ7dVQFxIqwokkwsMqqn"`, `"name":"Neslihan – Psikoloji & Zihin Odaklı Sıca"`, `"category":"professional"`,
  labels `{"language":"tr","accent":"istanbul","age":"middle_aged","use_case":"conversational","descriptive":"calm","gender":"female"}`,
  açıklama: "Ideal for psychology, mind and subconscious-focused podcasts, meditations, and educational content; a warm, calm, and confident voice." **Var, doğrulandı.**
- **Hakan** — `"voice_id":"DwjDVVARfPVjBKepXK2c"`, `"name":"Hakan - Calm & Soothing"`, `"category":"professional"`,
  labels `{"gender":"male","accent":"istanbul","age":"young","use_case":"narrative_story","descriptive":"calm","language":"tr"}`,
  açıklama: "Calm, deep, and soothing Turkish narration voice. Perfect for sleep content, meditation, audiobooks, documentaries, and relaxation videos. Warm and steady tone." **Var, doğrulandı.**
- Ses başına fiyat farkı yok: aynı 1.000 karakter iki sesle de `"credits":999.9,"price_cents":18.18`.

Uygulamadaki mevcut durum (salt okuma):
- `docs/ANA_BELGE.md:57-58`: "Sesler ElevenLabs'ten: kadın Neslihan (`wQ7dVQFxIqwokkwsMqqn`), erkek Hakan (`DwjDVVARfPVjBKepXK2c`), model `eleven_multilingual_v2`."
- `app/public/voice/index.json:63` ve `:126`: `"model": "eleven_multilingual_v2"`; `app/public/voice/tr/female` ve `male` altında 56'şar mp3.
- `file` çıktısı (`female/acuBoth.mp3`): "MPEG ADTS, layer III, v1, 128 kbps, 44.1 kHz, Monaural" → mevcut kliplerle aynı biçim `mp3_44100_128` ile tutarlı.
- Bu kliplerin hangi araçla/ayarla üretildiği: **doğrulanmadı** (repoda üretim betiği bulunamadı).

## 3. Müzik — eleven_music_v2_5

`creative_get_model_schema(music, eleven_music_v2_5)` [MCP]:

```json
{"parameters":[{"name":"duration_seconds","type":"number","min_value":3,"max_value":600,"number_type":"float"},
 {"name":"lyrics_type","type":"select","default":"auto","options":["auto","custom","instrumental"]},
 {"name":"instrumental","type":"boolean","default":false,"description":"Generate instrumental music without vocals."},
 {"name":"lyrics","type":"text", ...}],
 "input_ports":[{"key":"prompt","modality":"text"},{"key":"lyrics","modality":"text"},{"key":"audio","modality":"audio"}]}
```

| Konu | Bulgu | Kaynak |
|---|---|---|
| Üretim başına süre | MCP: 3–600 sn. API: "music_length_ms ... between 3000ms and 600000ms". Yetenek sayfası: "minimum duration of 3 seconds and a maximum duration of 5 minutes." **Kaynaklar çelişiyor (10 dk vs 5 dk); gerçek üst sınır doğrulanmadı.** | [MCP]; [DOC-WF] api-reference/music/compose; [DOC-WF] capabilities/music |
| Enstrümantal | MCP: `instrumental` + `lyrics_type: instrumental`. API: "force_instrumental: If true, guarantees that the generated song will be instrumental." | [MCP]; [DOC-WF] |
| Bölümlü kompozisyon | API `composition_plan`: `positive_global_styles`, `negative_global_styles`, `sections[]` (section_name 1–100 karakter, `duration_ms` "between 3000ms and 120000ms", local styles, lines), `respect_sections_durations`. **MCP araçlarında composition_plan yok.** | [DOC-WF] api-reference/music/compose |
| Tempo / ton (key) | Ne MCP'de ne API'de parametre var ("Documentation contains no specifications for tempo, BPM, key"). Yalnız istem metniyle: rehber "Tempo / rhythm cues — 'slow tempo,' ..." diyor. | [DOC-WF]; [MCP rehber] |
| Döngü (loop) | Müzik modelinde loop parametresi yok (MCP); dokümanda "Loops/looping: Not stated". **Kesintisiz döngü uygulamada crossfade ile yapılmalı (çıkarım).** | [MCP]; [DOC-WF] |
| `audio` giriş portu | Şemada var; ne işe yaradığı (referans ses mi) **doğrulanmadı**. | [MCP] |
| Çıktı | "MP3 (44.1kHz, 128-192kbps) and WAV formats" | [DOC-WF] capabilities/music |
| Ticari kullanım | "cleared for nearly all commercial uses ..." | [DOC-WF] capabilities/music |

Müzik rehberi [MCP], birebir: "Music prompts should describe how the music sounds, not visual or narrative details. Aim for 1–3 sentences." ve
"**For longer pieces**, describe how the energy evolves across the duration."

## 4. Ses efekti / doğa ambiyansı — eleven_text_to_sound_v2

| Konu | Bulgu | Kaynak |
|---|---|---|
| Süre | 0.5–30 sn (MCP); "30 seconds per generation" (doküman) | [MCP]; [DOC-WF] capabilities/sound-effects |
| Döngü | `loop` bool, açıklama: "Whether to generate a seamlessly looping sound effect." | [MCP] |
| prompt_influence | 0–1, varsayılan 0.3, "(0=loose, 1=strict)" | [MCP] |
| Çıktı | "MP3 for all effects; WAV at 48 kHz for non-looping effects" | [DOC-WF] |
| Ücret kuralı | "40 credits per second when duration is specified" | [DOC-WF] (tahminle doğrulanmadı) |
| Rehber | "**One clear sound per generation.** For layered sound design, give each layer its own node" ; "**Keep generations short.** ... longer clips often loop or drift." | [MCP rehber] |

## 5. Kompozisyon (karışım) düğümü

[MCP] açıklama: "Compose video and audio clips (video, music, voiceover, SFX) into a single output video using a timeline."
Yönergeler: "Audio sources (TTS, music, SFX) each get their own track with independent volume control." ; "Use set_track_property to adjust volume/mute, set_clip_property for gaps/trimming."
Çıktı portu: `"modality":"video"`. Model rehberi: "No model-specific or family-specific prompting guide is available for this model."

**Çıkarım:** Çıktı video olduğu ve kullanıcı süreyi (ör. 30 dakikanın 5'i) kendisi seçeceği için, ses + müzik + ambiyans karışımı
sabit bir dosyaya "pişirilmemeli"; uygulama içinde (katmanlar ayrı, zaman çizelgesi uygulamada) yapılmalı.

## 6. Fiyat tahminleri (hepsi `estimate_only=true`, `generations_count=1`)

### 6.1 Ham tahminler [MCP]

| Çağrı | Girdi | Yanıt |
|---|---|---|
| TTS multilingual_v2, Neslihan | tam 1.000 karakter Türkçe | `"credits":999.9,"price_cents":18.18,"estimated_runtime_seconds":5` |
| TTS multilingual_v2, Hakan | aynı 1.000 karakter | `"credits":999.9,"price_cents":18.18` |
| TTS multilingual_v2 | 20 karakter | `"credits":19.998,"price_cents":0.3636` |
| TTS eleven_v3 | aynı 20 karakter | `"credits":19.998,"price_cents":0.3636` |
| TTS eleven_v4 | aynı 20 karakter | `"credits":19.998,"price_cents":0.3636,"estimated_runtime_seconds":3` |
| TTS multilingual_v2 | 10.754 karakter | `"credits":10752.9246,"price_cents":195.50772` |
| Müzik v2.5, istemde "3 minutes" | süre parametresi verilemedi | `"credits":1650,"price_cents":30,"estimated_runtime_seconds":61` |
| Müzik v2.5, istemde "30 seconds" | süre parametresi verilemedi | `"credits":1650,"price_cents":30` (aynı) |
| SFX v2 (yağmur) | süre parametresi verilemedi | `"credits":55,"price_cents":1,"estimated_runtime_seconds":26` |

Gözlenen oranlar: TTS ≈ **0.9999 kredi/karakter** (üç TTS modelinde aynı); tüm tahminlerde 1 kredi = 0.018182 sent → **1 USD = 5.500 kredi**
(bu çalışma alanının plan fiyatı; API liste fiyatından farklı olabilir).

**Önemli boşluk — "3 dakika müzik":** `creative_generate_in_flow` süre parametresi almıyor; istemdeki "3 minutes" ile "30 seconds" aynı
tahmini (1650 kredi) verdi. Yani 1650 kredi **varsayılan (bilinmeyen) süre** içindir; **3 dakikalık tahmin doğrulanmadı.**
Kesin rakam için düğüme `creative_update_node` ile `duration_seconds: 180` yazıp `creative_run_flow_nodes(estimate_only=true)` çağırmak gerekir;
`update_node` ücretsizdir ve üretim başlatmaz, ama görev kuralı "yalnız salt okuma + estimate_only" olduğu için yapılmadı. Onay verilirse yapılabilir.

Resmi API liste fiyatları [DOC-WF] https://elevenlabs.io/pricing/api (farklı fiyat kanalı, karşılaştırma için):
TTS v2 Multilingual "$0.08" / 1K karakter; v3 "$0.08"; Eleven v4 "$0.022" ("72% off until Oct 12"); Music "$0.15" / dakika; Sound Effects "$0.12" / dakika.

### 6.2 Dışdeğerleme (çıkarım; varsayımlar açık)

Varsayım: Türkçe meditasyon metninde kelime başına 7,19 karakter (boşluk ve noktalama dahil; 1.000 karakterlik örnek metinde 139 kelime, ölçüldü)
ile 8,0 karakter arası → 2.000 kelime ≈ **14.380–16.000 karakter**.

| Kalem | Kredi | USD (5.500 kredi/USD) |
|---|---|---|
| 1 ders, 1 ses (14.380–16.000 kar.) | ≈ 14.379–15.998 | ≈ 2,61–2,91 |
| 1 ders, 2 ses (Neslihan + Hakan) | ≈ 28.760–32.000 | ≈ 5,23–5,82 |
| **10 ders × 2 ses (anlatım)** | **≈ 287.600–320.000** | **≈ 52,3–58,2** |
| Aynısı `generations_count` varsayılan 4 bırakılırsa | ≈ 1,15–1,28 milyon | ≈ 209–233 |
| 10 müzik yatağı × 1 üretim (varsayılan süre, 1650 kr.) | 16.500 | 3,00 |
| 20 ambiyans döngüsü × 30 sn (doküman kuralı 40 kr./sn → 1.200 kr./adet; tahminle doğrulanmadı) | 24.000 | ≈ 4,36 |

Ek notlar:
- `<break>` etiketleri de faturalanan karaktere ekleniyor gibi görünüyor (tek gözlem: +22 karakter → +11 kredi); ölçeklemesi doğrulanmadı.
- Yeniden çekim (hatalı telaffuz, kesik kelime) payı bu tabloda yok; oranı **doğrulanmadı**, bütçeye ayrıca eklenmeli.
- 2.000 kelimenin kaç dakika konuşma ettiği: dokümandaki "10,000 karakter ≈ ~10 minutes" oranıyla ≈ 14–16 dk konuşma; kalan süre sessizlik/müzik olur.
  Bu oran genel anlatım içindir; yavaş meditasyon temposunda gerçek süre **doğrulanmadı**.
- 30 dakikalık her ders için tek parça müzik üretmek (üst sınır 5 veya 10 dk, çelişkili) gerekmez; çıkarım: kısa, döngülenebilir yataklar + uygulama içi crossfade.

## 7. Özelliğe etkisi (çıkarım — araç çıktılarından türetildi, test edilmedi)

1. **Zamanlayıcı (30 dk'nın 5'i):** Anlatım tek uzun dosya değil, ipucu düzeyinde kısa kliplere bölünmeli (her klip < 10.000 karakter sınırının çok altında).
   Uzun sessizlikler `<break>` ile değil (en çok 3 sn, fazlası "speedup or audio artifacts" riski) uygulama zaman çizelgesinde verilmeli.
   Böylece seçilen süreye göre açılış → çekirdek → kapanış klipleri seçilebilir ve kısa oturum da "tam" hisseder.
2. **"Ses kesilmeyecek":** Klipler arası ton sürekliliği için `previous_text`/`next_text` veya `previous_request_ids` gerekir; bunlar **yalnız REST API'de**,
   MCP'de yok. Request ID'ler 2 saat geçerli, istek başına en çok 3. v3'te stitching yok → multilingual_v2 seçimi bununla uyumlu.
3. **Ses ayarlarının sabitlenmesi** (stability, similarity, style, speed 0.7–1.2, seed) 10 ders boyunca tutarlılık için gereklidir ama MCP'de yok;
   MCP ile üretimde bu değerlerin ne olduğu **doğrulanmadı**. "Dünyanın en iyi hocası" standardı için üretimin REST API betiğiyle, sabit ayar + seed ile yapılması önerilir.
4. **Türkçe telaffuz:** multilingual_v2'de phoneme/IPA yok; yalnız alias ve yazım. Riskli kelimeler (ör. yabancı terimler: "prana", "savasana") için
   alias listesi hazırlanmalı; hangi kelimelerin sorunlu olduğu **doğrulanmadı** (kısa deneme üretimi gerekir).
5. **Kalite kontrol:** `speech-to-text` (eleven_scribe_v1) ile üretilen her klibin transkripti metinle karşılaştırılıp eksik/kesik kelime yakalanabilir; maliyeti **doğrulanmadı**.
6. **Müzik:** tempo/ton parametresi yok; istemde "very slow tempo", "no drums", "no vocals" gibi ifadelerle ve `instrumental: true` ile yönlendirilmeli.
   Döngü parametresi yok → uygulama içi crossfade. Ambiyans (yağmur, orman, su) `sfx` + `loop: true` ile 30 sn'lik katmanlar hâlinde (döngülü olanlar yalnız MP3).
7. **Karışım:** kompozisyon düğümü video üretir; ses/müzik/ambiyans uygulamada ayrı katmanlar olarak çalınmalı (ses seviyesi, sönümleme uygulamada).

## 8. Doğrulanmayanlar (açık liste)

- `<break time="3.0s"/>` etiketinin MCP üretiminde gerçekten sessizlik ürettiği.
- MCP'nin 10.000 karakter üstü metinde üretimde ne yaptığı (bölme / hata).
- MCP ile üretilen TTS dosyasının biçimi ve kullanılan voice_settings değerleri.
- MCP şemasındaki `language_code`'un multilingual_v2'de etkisi (API dokümanı "not supported" diyor).
- Müzik üst süresi (600 sn MCP/API vs "5 minutes" yetenek sayfası) ve 3 dakikalık müziğin kredi karşılığı.
- Müzik düğümündeki `audio` giriş portunun işlevi.
- SFX'te süre belirtildiğinde kredi (doküman: 40 kr./sn) — tahminle test edilmedi.
- eleven_v4'ün `<break>` desteği (iki doküman kaynağı çelişiyor).
- Mevcut `app/public/voice` kliplerinin hangi yolla üretildiği.
- Speech-to-text (Scribe) maliyeti.
