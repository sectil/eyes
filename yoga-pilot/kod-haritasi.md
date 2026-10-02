# Yoga bölümü: kod haritası (yalnız okuma, 2026-09-28)

Amaç: 10 dersli, her biri en çok ~30 dk süren, istenen dakikada (ör. 5 dk) da bütün hissettiren sesli Yoga bölümünü
kurmadan önce, bugünkü kodun nereye dokunulacağını ve nerede kırılacağını göstermek. Bu belgede tahmin yok. Bakılmayan
ya da cihazda görülmeyen yerlerde "doğrulanmadı" yazıyor. Kodla ilgili her iddia `dosya:satır` ile verildi.

## 0. Okuma notları

- Depo `/home/user/eyes`, dal `claude/cool-pasteur-j5yupf`, HEAD `d515702`. **Satır numaraları HEAD'e göredir.**
- Çalışma ağacında başka bir iş sürüyor ve şu dosyaları değiştiriyor (git status): `app/src/lib/native.js`,
  `app/src/lib/voicePack.js` (yeni `acu*` cümleleri), `app/public/voice/index.json`, 22 yeni `acu*.mp3`,
  `FaceDistancePlugin.swift`, `today.js`, `trend.js`, `daily/weekly` modülleri ve başka dosyalar. Aşağıda atıf yapılan
  dosyalardan yalnız `native.js` ile `voicePack.js` bu işten etkileniyor. Onlar için HEAD satırları verildi. Öteki
  atıf dosyaları (`dalgaAudio.js`, `dalgaSleep.js`, `sleepSession.js`, `audioUnmute.js`, `Dalga.jsx`, `registry.js`,
  `dataHub.js`, `progress.js`, `Progress.jsx`, `ProgressOverview.jsx`, `AlarmPlugin.swift`, `FeedbackPlugin.swift`,
  `App.jsx`, `Home.jsx`, `releases.js`, `styles.css`) HEAD ile aynı (`git diff --quiet` temiz).
- Bu görev depodaki izlenen hiçbir dosyayı değiştirmedi. Tek çıktı bu dosya.
- **Sahibin ilettiği terminal çıktısı:** Mac'te `app/ios/App/App.xcodeproj/project.pbxproj` dosyasında birleştirme
  çakışması var ("ikimiz de değiştirdik"). Ayrıca `app/build-dev/` ve `…/project.xcworkspace/xcshareddata/swiftpm/`
  izlenmiyor ve zulada (stash) bir girdi duruyor. Bu bulut kopyasında çakışma yok. Yoga için eklenecek yeni bir Swift
  dosyası aynı `project.pbxproj` dosyasını değiştirir (§8.2 N4). Bu yüzden önce sahibin çakışması çözülmeli.

---

## 1. Modül sözleşmesi ve Gelişim bağlantısı

### 1.1 Kayıt defteri (`app/src/modules/registry.js`)

| Alan | Anlamı | Satır |
|---|---|---|
| Keşif | `import.meta.glob('./*/manifest.js')`. Klasör konunca modül kendiliğinden bağlanır | registry.js:159-160; views.js:7-10 |
| `id`, `routes?`, `title`, `label` | kimlik, açtığı ekran adları, kart adı, cümle içindeki ad | :10-13, doğrulama :90-95 |
| `ring` | `'eye' \| 'attention' \| 'life'` | :14, :54 |
| `kind` | `'measure' \| 'exercise' \| 'practice'` | :15, :55 |
| `gates?` | `gaze` (göz kalibrasyonu), `eyeBudget: 'eye' \| 'test'` (mola kilidi) | :16-20, :98 |
| `storageKeys?` | "Tüm verileri sil"de silinecek anahtarlar | :21, :152 |
| `home?` | `{ section: 'measure'\|'exercise'\|'practice', order }` | :22, :97, sıralama :136, :146 |
| `ask?`, `retired?` | yerinde profil soruları; emekli modül | :23-27 |
| `today?()` | Bugünün yolu durakları | :28-31 |
| `coach?()` | Nef'e giden 7 günlük özet (en çok 6 alan) | :32-33 |
| `stats?()` | Gelişim → Pratikler satırları (en çok 3) | :34 |
| `progress` (**ZORUNLU**) | `domain` (7 alandan biri) + `effects[]` (önce→sonra) + `metrics[]` (zaman serisi) | :35-44, doğrulama :60-83 |
| `sessions?` | `match(s)`, `countsTowardGoal`, `describe()`, `best?`, `bestLabel?` | :45-51, :108-113 |
| Alanlar | `DOMAINS = ['eye','calm','self','awareness','focus','wellbeing','body']` | :57 |
| Etki/metrik alanı | etki ya da metrik kendi `domain`'ini verebilir, yoksa modülünkü | :154-155 |
| **Premium alanı** | **yok**. Sözleşmede abonelik kapısı tanımlı değil | :9-52 |

### 1.2 Dört örnek manifest

| | dalga | who5 | breath | gokyuzu |
|---|---|---|---|---|
| ring / kind | life / practice (:14-15) | life / measure (:9-10) | life / practice (:16-17) | life / practice (:11-12) |
| progress.domain | calm (:18) | wellbeing (:11) | calm (:20) | calm (:15) |
| effects | 3 mod. Sakin→calm, Güç→**self**, Motive→**wellbeing** (alan geçersiz kılma), 1–10 (:19-23) | yok (puan serisi progress.js who5Card) | breath-calm 1–5 (:21) | gokyuzu-rest 1–10 (:16) |
| sessions.match | `type==='dalga'` (:29) | `type==='who5'` (:14) | `type==='breath'` (:27) | `type==='gokyuzu'` (:21) |
| countsTowardGoal | true (:30) | false (:15) | true (:28) | true (:22) |
| home | practice, 35 (:27) | yok | practice, 30 (:25) | practice, 36 (:19) |
| gates | `{}` (:25) | `{}` (:12) | `{}` (:23) | `{}` (:18) |
| premium | yok | yok | yok | yok |
| stats / coach / today | stats (:38-49) | — | coach (:37-41), stats (:42-50), today (:55-58) | stats (:30-36) |

(Satırlar ilgili `src/modules/<ad>/manifest.js` dosyasınındır.)

### 1.3 Yeni "yoga" modülü nasıl bağlanır

- **Dosyalar:** `src/modules/yoga/manifest.js` + `view.jsx`. Glob kendiliğinden bulur (registry.js:159-160; views.js:7-10).
  "Başka hiçbir dosya değişmez" (registry.js:6) yalnız kayıt düzeyi için doğrudur. Ekran, lib, CSS, ses motoru ve
  içerik ayrıca yazılır.
- **Yönlendirme:** App ekran adını tanıyan modülün `view.render(ctx, screen)` işlevini çağırır (App.jsx:952-964).
  `ctx` = `{ native, settings, tests, sessions, exercise, common, go, back, refresh, store, saveTests, focusBlock }`
  (App.jsx:957; views.js:6).
- **Ana sayfa:** "Pratikler" ızgarası `registry.inSection('practice')` ile `home.order`'a göre dizilir
  (Home.jsx:418-431). Bugünkü sıra: Nefes 30, Dalga 35, Gökyüzü 36.
- **Kayıt:** görünüm `ctx.store.addSession(s); ctx.refresh()` çağırır (modules/dalga/view.jsx:14). Depo kayda `id` ve
  `date` ekler (storage.js:87-91). Hepsi localStorage `gozolcum:v1` anahtarında durur (storage.js:4).
- **Gelişim'e akış:**
  - Alan: `dataHub.domainOfSession(s)` → `registry.forSession(s).progress.domain` (dataHub.js:36-38; registry.js:145).
    28 günlük "düzen" dilimi (dataHub.js:102-120) ve kaynak listesi (dataHub.js:172-180) **modülün tek alanını** sayar.
  - Önce→sonra etkisi: `registry.effects()` (registry.js:154) → `acuteEffects`. Anlamlı sayılması için en az 3 oturum
    ve %95 GA sıfırı içermemeli (progress.js:73-89). Haftalara göre gidişat 6 hafta (progress.js:93-111). Anlamlı etki
    `verifiedChange` ile haritanın dış yayına çıkar (dataHub.js:137-150; ProgressOverview.jsx:239+).
  - Metrik (isteğe bağlı): `series()` → `metricTrend` (progress.js:130-156).
  - Pratikler kartı: `m.stats()` ilk 3 satır (Progress.jsx:318-353).
  - Özet, seri ve haftalık hedef: `countsTowardGoal: true` → `kind: 'exercise'` (stats.js:124-130, 191-194).
  - Rekor kutusu: `sessions.best` + `bestLabel` (Progress.jsx:102-105).
  - Alan sırası ve kutucuklar: `ORDER = ['eye','wellbeing','self','awareness','calm','focus','body']`
    (ProgressOverview.jsx:29).
- **Testler:** `registry.test.js` "yeni modül takılınca her yere bağlanır" (:59), "Gelişim'e ne kattığını söylemeyen
  modül reddedilir" (:70), "kayıt tutanların etkisi/metriği kendi kayıt türünü okur" (:79). `dataHub.test.js:18-20`:
  canlı her modülde `sessions.match` olmalı.
- **Sözleşme kısıtı (karar gerekir):** bir modülün bütün oturumları Gelişim'in 28 günlük düzeninde **tek alana**
  sayılır. Yalnız önce→sonra etkileri alan başına ayrılabilir (registry.js:154). "Özgüven dersi Kendine yaklaşım
  dilimini, rahatlama dersi Sakinlik dilimini doldursun" isteniyorsa iki şey birlikte değişmeli: sözleşmeye
  oturum başına alan (ör. `sessions.domainOf(s)`) eklenmeli, `dataHub.js:36-38` ile `:180` ve testler de buna göre
  güncellenmeli.

---

## 2. Ses altyapısı

### 2.1 Bugün iki ayrı çalma yolu var

| | Dalga canlı (Web Audio) | Uyku sesi (iOS yerel) |
|---|---|---|
| Nerede | lib/dalgaAudio.js, screens/Dalga.jsx `play` | lib/dalgaSleep.js `createNativeSleepPlayer` → AlarmPlugin.swift `sleepStart` |
| Kaynak | dosya yok; beste olaylardan anlık sentez (dalgaAudio.js:1; dalgaMusic.js:1-2) | tek dosya `public/sleep/sakin-loop.wav` (AlarmPlugin.swift:231) |
| Zamanlama | JS `setInterval` 25 ms + 0,3 sn ileri bakış; olaylar `ac.currentTime` ile örnek hassasiyetinde (dalgaAudio.js:7-8, 268-279) | AVAudioPlayer `numberOfLoops = -1`; kısılma `setVolume(0, fadeDuration:)`; bitiş `DispatchQueue.main.asyncAfter` (AlarmPlugin.swift:244-264) |
| Karışım | çalgılar → bus → kuru + yankı → sıkıştırıcı → master (dalgaAudio.js:19-44) | tek iz, karışım yok |
| Sessiz tuşu | `navigator.audioSession.type='playback'` (VARSAYIM) + sessiz `<audio>` döngüsü (dalgaAudio.js:209-222; audioUnmute.js:1-3, 30-55) | AVAudioSession `.playback` (FeedbackPlugin.swift:286-295) |
| Kilitli ekran | VARSAYIM: "ekran kilitlenince ses durabilir" (dalgaAudio.js:2-3). Dalga ekranı açık kalsın diye Wake Lock ister (Dalga.jsx:134-152) | UIBackgroundModes `audio` (Info.plist:56-59). Tam süre kilitte çaldığı cihazda işaretlenmedi (YAPILACAKLAR.md:212 madde 6 `[ ]`) |
| Cihaz durumu | kilitli ekran ve sessiz mod cihazda doğrulanmadı (ENVANTER_VE_PLAN.md:305-306) | çalıyor ve duyuluyor: "çalıyor 15 sn · kazanç 100 · medya sesi 40/100 · Speaker · Playback" (HATA_GUNLUGU.md:623-625) |

### 2.2 Dalga canlı motor (`lib/dalgaAudio.js`)

- `unlock()` dokunuş içinde bağlamı açar, oturumu 'playback'e alır ve sessiz döngüyü başlatır (:220-240).
- `start({mode, seconds, binaural, volume})`: master kazancı 3 sn'de açılır, son 3 sn'de kapanır, sonra planlayıcı
  çalışır (:289-304). `pause/resume` = `ac.suspend/resume` (:315-324). `kick()` kesintiden sonra dokunuşla yeniden
  başlatır (:347-350). `stop()` 1,5 sn sonra oturumu 'auto'ya döndürür (:325-339).
- Ekran sayacı motordan okunur (`engine.left()`, Dalga.jsx:120-132). Ses açılmadıysa "Ses başlamadı · dokun ve
  başlat" düğmesi çıkar (Dalga.jsx:393-395).
- Ekrandan çıkınca ses durur (Dalga.jsx:97-111). 30 sn'den kısa dinleme kaydedilmez (Dalga.jsx:20, 175-178).
- Süre seçici: 1–90 dk kaydırıcı ve 5/15/30/60/90 çipleri (dalga.js:9-12; Dalga.jsx:524-530).

### 2.3 Uyku sesi (`lib/dalgaSleep.js`, `lib/sleepSession.js`, `AlarmPlugin.swift`)

- iOS uygulamasında yerel oynatıcı, tarayıcıda `<audio>` kullanılır (dalgaSleep.js:72-74).
- Yerel oynatıcı: JS yalnız ekran sayacını ve bitişi izler. Sayaç duvar saatiyle (`Date.now`) 500 ms'de bir tıklar
  (dalgaSleep.js:88-101). Çalmayı `plugin.sleepStart({seconds, fade})` başlatır (:104).
- Swift tarafı (AlarmPlugin.swift:217-311): önce öncekini durdurur (:236). Kayıt sürüyorsa başlamaz (:240-243;
  FeedbackPlugin.swift:289). Kesinti gözlemcisi yalnız `.ended` + `.shouldResume` durumunda `play()` çağırır
  (:302-311). Bitişte oturumu bırakır (:286-300).
- `sleepSession.js`: müzik alarm kurulumundaki dokunuşta başlar ve ekran ona sonradan bağlanır. Modül düzeyinde tek
  oturum tutulur (sleepSession.js:10-27). Ders sürerken başka ekrana geçilecekse örnek alınacak kalıp budur.

### 2.4 Sessiz tuşu yardımcıları (`lib/audioUnmute.js`)

- `silentWav` (:8-28), `mediaKeepAlive` (:30-55), `mediaPlay` (:61-76), `mediaProbe` tanı (:78-90), `mediaPlayOnce`
  seslendirme yedeği (:94-113), `setAudioSessionType` (:116-123). Hepsi WKWebView varsayımlarıyla yazıldı (:1-3).

### 2.5 AVAudioSession yönetimi (`FeedbackPlugin.swift` → `AppAudioSession`)

- Tek yer: `AppAudioSession` (FeedbackPlugin.swift:234-320). Kullanıcı tercihi "ses açık" ise `.playback +
  .mixWithOthers`, kapalıysa `.ambient` (:309-319).
- Uyku sesi: `beginSleep()` `.playback` (karışmaz) ile başlar (:286-295). `endSleep()` `notifyOthersOnDeactivation`
  ile bırakır ve tercihe döner (:298-306). Uyku sürerken tercih uygulanmaz (`sleepActive`, :247, :255).
- JS, ekran her açıldığında tercihi yeniden uygular (native.js:228-255 HEAD). Bu, çalan uyku sesini susturuyordu.
  `sleepActive` koruması bu yüzden eklendi (HATA_GUNLUGU.md:601-604).

### 2.6 Kesinti, Bluetooth, kilit ekranı

- `AVAudioSession.interruptionNotification`: yalnız uyku sesinde ve yalnız sürdürme var (AlarmPlugin.swift:255-258,
  302-311). Başlangıçta (`.began`) JS'ye haber verilmiyor.
- `routeChangeNotification` (kulaklık/AirPods çıkması): **yok** (src ve Swift'te grep boş).
- `MPNowPlayingInfoCenter` / `MPRemoteCommandCenter` / `navigator.mediaSession`: **yok** (grep boş). Kilit ekranında
  ders adı ve oynat/duraklat görünmez, AirPods dokunuşu da işlemez (doğrulanmadı).
- `@capacitor/app` yok (package.json). Yaşam döngüsü yalnız `visibilitychange` ile izleniyor (App.jsx:120, 281, 346,
  365, 461; Dalga.jsx:289-294).
- AppDelegate'te ses için hiçbir şey yok (AppDelegate.swift:17-33 boş şablon).

### 2.7 HATA_GUNLUGU: ses hataları ve düzeltmeleri (Bug 20, 22)

- **Bug 22, hazırlık süresi:** müziği cihazda basmak (OfflineAudioContext, 96 sn döngü) Chromium'da 10,5 sn sürdü ve bu
  sürede "Başlat" kapalı kaldı (HATA_GUNLUGU.md:552-554). Düzeltme: müzik derlemede bir kez basılıp pakete konuldu.
  Döngü WAV oldu çünkü MP3 başa ve sona ~50 ms boşluk ekliyordu (:555-558).
- **Bug 22, cihaz kanıtı:** WKWebView `<audio>` "çalıyor 6,4 sn" gösterdiği halde ses çıkmıyordu (:590-593). Dört tur
  uğraşıldı ve yöntem değişti: iOS'un kendi oynatıcısı kullanıldı (AlarmPlugin.sleepStart) (:594-597).
- **Bug 22, oturum:** ekran açılınca "ses kapalı" tercihi yeniden uygulanıp çalan sesi susturabiliyordu. Düzeltme
  `beginSleep/endSleep` oldu. Arama ya da Siri kesintisinden sonra iOS izin verirse ses sürer (:601-604).
- **Bug 20/22, asıl kök neden:** eski seslerin enerjisinin %77–87'si 300 Hz altındaydı ve iPhone hoparlörü bu bandı
  çalmıyor. Düzeltme: bir oktav yukarı basma, 300/400 Hz yüksek geçiren filtre, 1 kHz rafı, LUFS hedefi
  (:606-612). Uyku müziğinde 300 Hz altı artık %8,2.
- **Cihaz sonucu:** uyku müziği çalıyor ve duyuluyor (:623-625). Kilitli ekranda tam süre sürdüğü belgede yok.
- **Belge ile dosya uyuşmuyor:** HATA_GUNLUGU.md:562 kısılma parçalarını "64 kbit/sn" diye yazıyor. Dosyalar 96 kbit/sn
  (`file` çıktısı; design/dalga-uyku/master.py:40 `'96'`).

### 2.8 Soru: Bugünkü motor ses + müzik + kısma + örnek hassasiyeti + kilitli ekran işini yapar mı?

| Yetenek | Web Audio (Dalga canlı) | Yerel uyku oynatıcısı |
|---|---|---|
| Ses izi + müzik yatağı karışımı | yapabilir (grafik var) ama seslendirme `ctx.destination`'a doğrudan bağlanıyor, ortak bus yok (voicePack.js:199 HEAD) | **hayır**: tek AVAudioPlayer |
| Konuşma altında müzik kısma | yapabilir (kazanç otomasyonu) ama bugün yok | **hayır** |
| Örnek hassasiyetinde zamanlama | evet (`start(t)`, lookahead) ama JS zamanlayıcısına bağlı | **hayır**: yalnız `asyncAfter` ile kısılma ve bitiş |
| 30 dk sesi belleğe çözmek | **olmaz**: 44,1 kHz stereo Float32 ≈ 635 MB; parça parça çözülmeli | akıştan çalar (dosya) |
| Kilitli ekranda sürmek | **risk**: JS askıya alınınca planlayıcı durur (VARSAYIM, cihazda denenmedi); WKWebView sesi Bug 22'de duyulmadı | Info.plist izin veriyor; tam süre cihazda işaretlenmedi |
| Kesinti sonrası tutarlılık | `kick()` dokunuş ister | yalnız `.ended` sürdürme; JS sayacı duvar saatiyle ayrışır |

**Sonuç:** bugünkü iki yolun hiçbiri bu beş işi birlikte yapmıyor. Yeni bir yerel motor gerekiyor (§8.2 N4).

---

## 3. Seslendirme hattı

- **Cümleler:** `PHRASES.tr` (voicePack.js:14-65 HEAD; 45 cümle). Kimlik → `public/voice/tr/{female|male}/{id}.mp3`
  (voicePack.js:1-4). Liste `public/voice/index.json`: dile ve sese göre `phrases[]`, `voiceName` (Neslihan / Hakan),
  `model: eleven_multilingual_v2`, `date: 2026-09-27`.
- **Biçim:** MP3 128 kbit/sn, 44,1 kHz, mono, ID3 (`file` çıktısı: in.mp3, exNoFace.mp3). HEAD'de ses başına 45 dosya:
  kadın 1.844.600 bayt (~115 sn), erkek 2.168.102 bayt (~136 sn). En kısa 26,9 kB (open.mp3), en uzun 84,2 kB
  (exNoFace.mp3). Toplam `du`: 4,1 MB.
- **Çalma:** `fetch` + `decodeAudioData`. Baştaki ve sondaki sessizlik kırpılır (eşik tepenin %2'si, 10 ms pay) ve
  tepe 0,8'e eşitlenir (kazanç en çok 4). Uçlara 8 ms geçiş konur (voicePack.js:87-109, 158-174). **Yeni cümle
  öncekini keser** (voicePack.js:176, 183-187). Web Audio çözemezse medya öğesi çalar (:208-212). Dosya yoksa
  iOS'un kendi konuşma sesi okur (voiceCue.js:11-14). Ses kapalı tercihinde hiç konuşmaz (voiceCue.js:13).
- **Ses seçimi:** Profilim → Seslendirme, `prefs.voice` (varsayılan 'female', prefs.js:17). Modüller sormaz
  (ANA_BELGE.md:57-59).
- **Üretim betiği:** depoda **yok**. voicePack.js:3 "betikle üretim" diyor ama `elevenlabs|eleven_multilingual`
  araması `design/uyanma-sesleri` (müzik) dışında betik bulmadı. `fabfe15` commit mesajına göre cümleler ElevenLabs'ten
  alınıp yazıya çevrilerek metinle birebir doğrulandı ve gürültü tabanı −80 dB altında ölçüldü. Test her dosyanın
  varlığını denetler (voicePack.test.js:43-51 HEAD).
- **Seviye:** konuşma tepeye göre eşitleniyor, LUFS'e göre değil. Müzik LUFS'e göre (uyku −16, alarm −12). Ses ile
  müzik bugün aynı ölçekte değil.

## 4. Ses üretim hattı (`app/design/`)

- `dalga-uyku/render.mjs:1-3`: Vite + Playwright Chromium ile müzik motoru çevrimdışı basılır. `master.py:1-6, 14-41`:
  çembersel 300 Hz yüksek geçiren, +4 dB raf, −16 LUFS, ≤ −1,5 dBTP, 22,05 kHz, dikişsiz WAV döngü, kısılma parçaları
  MP3 (to_mp3.py, lameenc).
- `uyanma-sesleri/master_eleven.py:1-4`: ElevenLabs Music çıktısını hoparlöre göre hazırlar (stereo daraltma, yüksek
  geçiren, LUFS, CAF). `README.md:50-61`: telefon hoparlörü ölçütleri (`analyze.py`).
- Bu ortamda kullanılabilen araçlar: numpy, scipy, soundfile, pyloudnorm, lameenc (MP3). **ffmpeg ve afconvert yok**,
  yani AAC/M4A burada üretilemez (Mac'te afconvert ile; doğrulanmadı).

## 5. Paket boyutu bugün (`du -sh`, 2026-09-28 21:23 derlemesi)

| Yer | Boyut | Not |
|---|---|---|
| `app/dist` (Capacitor `webDir`, capacitor.config.json) | **56 MB** | |
| └ mediapipe-wasm | 34 MB | üç varyant 11,0–11,8 MB (+ JS). Hangisinin yüklendiği doğrulanmadı |
| └ sleep | 16 MB | sakin-loop.wav 8,47 MB (96 sn, 22,05 kHz stereo 16 bit) + 6 kısılma MP3'ü ~7,56 MB (96 kbit/sn) |
| └ voice | 4,1 MB | MP3 128 kbit/sn mono |
| └ assets | 2,3 MB | index JS 1,40 MB, CSS 0,26 MB, yazı tipleri |
| `app/ios/App/App/Sounds` | **25 MB** | 6 CAF × 4,32 MB (alarm sesleri, pbxproj'da tek tek referanslı: :43-48) |
| `app/ios/App/App/public` | 36 MB | **eski** (25 Eylül) ve gitignore'da. Ölçü alınmadı |

Ham toplam ≈ 81 MB. Sıkıştırılmış IPA ya da App Store indirme boyutu ölçülmedi.

## 6. Uzak dosya ve abonelik

- **Supabase:** yalnız hesap ve `profiles` tablosu (supabase.js:1-4; account.js:116; docs/supabase/001_hesap.sql).
  Storage/bucket kullanımı **yok**. İstemcide yalnız herkese açık (publishable) anahtar var. Gizli anahtar reddediliyor
  (supabase.js:10-15).
- **İndirme/önbellek altyapısı yok:** `@capacitor/filesystem` yok (package.json). Uygulama içi dosyalar yalnız
  `fetch('./voice/...')` ile okunuyor (voicePack.js:125, 160 HEAD). Çalışma anında dışarıdan dosya alınan iki örnek var:
  MediaPipe yüz modeli storage.googleapis.com'dan (distance.js:9-11 HEAD) ve Nef koçu Vercel'de (coach.js:9).
- **Abonelik:** RevenueCat, tek `premium` yetkisi (subscription.js:12). Web'de her zaman açık (:67-69). **Bütün
  uygulama** tek kapının arkasında: deneme teklifi (App.jsx:763-774), sonra kilit; açık kalan tek ekran "evidence"
  (App.jsx:876-890). **Dalga'ya özel bir premium kapısı yok.** Modül sözleşmesinde premium alanı da yok. Ana sayfadaki
  `premium` yalnız yol önerisini daraltır (Home.jsx:161).

## 7. Arayüz sistemi ve belge biçimleri

- **Tasarım jetonları:** styles.css:10-51 (açık), :53-91 (sistem koyu), :92-128 (`data-theme='dark'`). Vurgu iris
  turkuaz→mavi, "mercek sarısı" yalnız ödül ve seri için (:4-6). Tema tercihi system/light/dark
  (theme.js:1-33; useDarkTheme.js tuval bileşenleri için).
- **Yazı tipleri:** Unbounded (başlık ve büyük sayı), Onest (gövde), JetBrains Mono (veri) (styles.css:7, 11-13;
  main.jsx:3-5).
- **Oynatıcı benzeri ekranlar:** Dalga oynatıcısı temadan bağımsız, hep karanlık (`.dg-play` #050a12, dalga.css:52).
  Gece saati "tema dışı: hep karanlık" (NightClock.jsx:6). DalgaVisual yanıp sönmez (Fisher 2005), parlaklık yalnız
  nefes hızında değişir (DalgaVisual.jsx:4-6) ve "Hareketi Azalt"a uyar (:23; dalga.css:85, 125). Kural: her ekran
  koyu ve açık temada kusursuz olmalı (YAPILACAKLAR.md:260). Oynatıcının hep karanlık olması bu kuralla çelişiyor,
  sahibinin kararı gerekir.
- **Bilim kartı kalıbı:** `FACTS` (Doğru / Kanıt yok / Belirsiz + ref + DOI) (dalga.js:119-138). Merkezi kaynakça
  `lib/sources.js` (PMID, DOI, tür, n; :1-4, 6-22, 24+).
- **Sürüm notu:** `RELEASES = [{ id: 'YYYY-MM-DD', title, items: [{ kind: 'new'|'fix'|'change', text }] }]`, en yeni
  üstte, her iş dizisi bir madde ekler (releases.js:1-9).
- **Yol haritası:** `docs/yol-haritasi/YAPILACAKLAR.md` tek liste. İşaretler: `[x]` cihazda doğrulanmış ve mükemmel,
  `[~]` kodda bitti ama cihazda görülmedi, `[ ]` yapılmadı (:8-9). `ENVANTER_VE_PLAN.md` numaralı bölümler kullanır:
  "## N. Ad (tarih, Build — durum)", sonra taslak bağlantısı, dosyalar, kanıt, VARSAYIMlar ve cihazda doğrulanacaklar
  (ör. Dalga §17, :292-306). Son bölüm §19 (:330).
- **Kurallar (ANA_BELGE.md):** her özellik PubMed dayanakla gelir, sağlık iddiası yok (:42-46). "Bitti" demeden önce
  her durum iki temada görülür (:53-56). Sesler Neslihan/Hakan, `eleven_multilingual_v2`, ekrandaki cümle ile ses aynı
  (:57-59). Her modül veri merkezine yazar ve oradan okur (:61-67). Anahtarlar asla depoya girmez (:84-86). Swift bu
  ortamda derlenmez (:90-91).
- **Depoda yogaya dokunan araştırma** (bu görevde PubMed'de yeniden doğrulanmadı): baş aşağı asanalar göz içi basıncını
  artırıyor, glokom uyarısı gerekir (docs/arastirma/ajan-raporlari/12_tr_ru_he_fa_ar_hi.md:208, 273; Chetry 2023).
  30 dk Hatha yoga RKÇ notu (BILDIRIM_PLANI.md:335).

---

## 8. Yoga için gereken değişiklikler ve riskler

### 8.1 Kısa sonuç

- Bugünkü iki çalma yolunun hiçbiri şu beş işi birlikte yapmıyor: ses, müzik yatağı, konuşma altında kısma, örnek
  hassasiyetinde zamanlama ve kilitli ekranda sürme.
  - **Web Audio yolu** (Dalga canlı) ilk dördünü yapabilir. Ama kilitli ekranda sürmesi kodda VARSAYIM
    (dalgaAudio.js:2-3) ve cihazda denenmedi (ENVANTER_VE_PLAN.md:305-306). WKWebView sesi Bug 22'de cihazda
    "çalıyor" görünüp duyulmadı (HATA_GUNLUGU.md:590-597).
  - **Yerel yol** (AlarmPlugin.sleepStart) cihazda duyuldu (HATA_GUNLUGU.md:623-625). Ama tek, adı sabit bir dosya,
    tek iz ve karışım yok (AlarmPlugin.swift:231, 244-247). Kilitli ekranda tam süre sürdüğü bile işaretlenmedi
    (YAPILACAKLAR.md:212 (6) `[ ]`).
- **Öneri:**
  - saf JS "ders planlayıcı" (seçilen süreye göre bölüm seçer),
  - ses ve müzik için ayrı "stem" dosyaları (her süre için ayrı karışım yerine),
  - yeni bir iOS yerel ses motoru.
  - Görsel, motorun bildirdiği konumu izler.
  - Önce 2 dersle cihazda doğrulanır, sonra 10 derse genişletilir.

### 8.2 Gereken değişiklikler (katman katman)

- **N1. Modül** `src/modules/yoga/` (manifest + view). Aşağıdaki alanlar öneridir, kodda yok:
  - Temel alanlar: `id: 'yoga'`, `ring: 'life'`, `kind: 'practice'`, `home: { section: 'practice', order: 33 }`
    (VARSAYIM; Nefes 30, Dalga 35). `gates: {}` (gözler kapalı ders göz bütçesine sayılmaz).
    `storageKeys: ['gozolcum:yoga-opts']`.
  - Oturumlar: `sessions.match: s.type === 'yoga'`, `countsTowardGoal: true`. `describe`: ders adı, dakika,
    önce→sonra.
  - Kayıt biçimi Dalga'daki `makeRecord` kalıbıdır (dalga.js:99-117): `{ type:'yoga', lesson, planned, seconds,
    completed, before, after, delta, voice }`. 30 sn'den kısa dinleme kaydedilmez (Dalga.jsx:20).
  - Gelişim bağlantısı: `progress.domain` tek alan (öneri 'calm'). Her ders için bir `effects` girdisi, kendi
    alanıyla (özgüven → 'self', odak → 'focus'; registry.js:154). `stats` en çok 3 satır: 7 günde dakika, tamamlanan
    ders, ortalama değişim. `coach` en çok 6 alan. `today` eklenip eklenmeyeceği karar ister.
  - **Sahibinin kararı gerekir:** 28 günlük düzen dilimi modül başına tek alan sayıyor (dataHub.js:36-38, 108-111,
    180). Her ders kendi dilimini doldursun isteniyorsa sözleşme, dataHub ve testler değişir (§1.3).
- **N2. Ekran** `screens/Yoga.jsx`: ders listesi → süre seçici → önce puanı → oynatıcı → sonra puanı → sonuç ve kaynak
  kartı.
  - Dalga'nın puan bileşeni ve süre kaydırıcısı ile çipleri yeniden kullanılabilir (Dalga.jsx:45-53, 524-530).
  - Oynatıcı iki temada tasarlanacak mı, yoksa Dalga gibi hep karanlık mı kalacak? Sahibinin kararı gerekir
    (dalga.css:52 ile YAPILACAKLAR.md:260 çelişiyor).
  - Önce tasarım (Artifact), onaydan sonra kod (ANA_BELGE.md:51-52).
- **N3. Saf planlayıcı** `lib/yoga.js`:
  - Ders bölümlere ayrılır: giriş (sabit), öncelik sırasıyla çekirdek bloklar (atlanabilir), kapanış (sabit). Bölüm
    geçişlerinde esnek sessizlik payı bulunur.
  - `planLesson(ders, dakika)` → zaman çizelgesi. Her olay: t, klip, düzey, müzik kısma.
  - Testler: her sürede giriş ve kapanış var, toplam hedefin ±N sn'sinde (VARSAYIM ±15 sn), klipler kesilmiyor ve
    üst üste binmiyor, 5 dk = giriş + en az 1 çekirdek + kapanış. Nefes'teki `makePlan` gibi testli olur.
- **N4. Yerel ses motoru (Swift)**, örneğin `YogaAudio` eklentisi:
  - **Oturum:** `.playback` (sessiz tuşunda ve kilitli ekranda çalar). Bitince `notifyOthersOnDeactivation`
    (beginSleep/endSleep kalıbı: FeedbackPlugin.swift:286-306). `sleepActive` bayrağı ders için genelleştirilmeli,
    yoksa uyku sesi ile ders birbirinin oturumunu kapatır (:247).
  - **İki iz:** müzik yatağı (döngü ve çapraz geçiş) ve zaman çizelgesine göre konuşma. Konuşma sırasında müzik kısılır.
    - Aday A: AVAudioEngine + iki AVAudioPlayerNode (`scheduleBuffer/scheduleFile`, `AVAudioTime` ile örnek
      hassasiyeti).
    - Aday B: AVMutableComposition + AVAudioMix hacim rampaları ile tek AVPlayer.
    - Bu API'ler depoda kullanılmıyor ve cihazda denenmedi.
  - **Kesinti:** `.began` → duraklat ve JS'ye bildir. `.ended` + `shouldResume` → yarıda kalan cümlenin başından
    sürdür. Rota değişimi gözlemcisi eklenmeli (bugün yok).
  - **Kilit ekranı:** MPNowPlayingInfoCenter (ders adı, süre, konum) ve MPRemoteCommandCenter (oynat/duraklat).
    Bugün yok.
  - **Kayıt güvenliği:** dinlenen süre yerelde de yazılmalı (UserDefaults; `consumeOpen` kalıbı:
    AlarmPlugin.swift:325-332). Uygulama açılınca JS uzlaştırır.
  - **Xcode projesi:** yeni `.swift` dosyası pbxproj'a elle referans ister (AlarmPlugin satırları :33, :62, :108,
    :226). Bu dosya sahibin Mac'inde şu an çakışmada. Çakışmasız yol: sınıfı var olan bir Swift dosyasına koymak
    (AppAudioSession'ın FeedbackPlugin.swift:241'de durması gibi) ve MainViewController.swift:25-35'e bir kayıt satırı
    eklemek. Ses dosyaları `public/` klasör referansıyla pakete kendiliğinden girer (pbxproj :24, :194).
    AlarmPlugin bunu zaten kullanıyor (`subdirectory: "public/sleep"`, AlarmPlugin.swift:231).
  - Swift burada derlenmez. İlk Mac derlemesinde doğrulanır (ANA_BELGE.md:90-91).
- **N5. JS köprüsü** `lib/yogaAudio.js`: `registerPlugin` kalıbı (native.js:345 HEAD), olaylarla konum ve bölüm
  bildirimi. Web önizlemesi için Web Audio yedeği olur (yalnız tarayıcı testi).
- **N6. Seslendirme paketi** `PHRASES`'ten ayrı tutulur. Önerilen yer: `public/yoga/<ders>/<ses>/<bölüm>.<ext>` ve
  süreleri, metni, sesi, modeli, tarihi içeren `yoga/index.json`.
  - Üretim ve doğrulama betiği yazılmalı. Adımlar: ElevenLabs'ten al → yazıya çevir → metinle karşılaştır → LUFS ölç.
    Bugün betik yok (§3).
  - Anahtar depoya ve uygulamaya girmez (ANA_BELGE.md:84-86).
  - Tek kez kodlama için ElevenLabs'in PCM/WAV çıktısı seçilebiliyor mu: doğrulanmadı (bugünkü dosyalar MP3 128).
- **N7. Müzik yatağı** `design/yoga/` altında dalga-uyku kalıbıyla üretilir: çembersel filtre, LUFS, dikişsiz döngü
  (master.py). Ölçüt için analyze.py kullanılır. Hoparlör bandı dersi uygulanmalı: 300 Hz altı hoparlörde kayboluyor
  (HATA_GUNLUGU.md:606-612). Konuşma ve müzik için ortak LUFS hedefi konmalı (bugün konuşma tepeye göre
  eşitleniyor, §3).
- **N8. Kanıt:** kaynaklar `lib/sources.js`'e PMID ve DOI ile girer. Ders kartları FACTS kalıbını kullanır
  (dalga.js:119-131). Sağlık iddiası yok, dil "çalışmada … görüldü". Baş aşağı duruş olmayacak (depodaki not, §7).
- **N9. Belgeler:**
  - `releases.js` maddesi (:1-4).
  - YAPILACAKLAR.md: `[~]` ve `[x]` kuralıyla (:8-9).
  - ENVANTER_VE_PLAN.md: yeni "## 20. Yoga …" bölümü.
  - HATA_GUNLUGU: cihaz bulguları.
- **N10. Görsel:** DalgaVisual ilkeleri korunur: yanıp sönme yok, Hareketi Azalt'a uyulur (DalgaVisual.jsx:4-6, 23).
  Görsel zamanı `Date.now` ile değil, motorun konumuyla ilerlemeli. Bluetooth gecikmesi ölçülmeden ses ile görselin
  eşzamanlı olduğu söylenemez (doğrulanmadı).

### 8.3 Paket boyutu tahmini (10 ders × 30 dk = 18.000 sn; MB = 10⁶ bayt)

| Yaklaşım | WAV 44,1 kHz 16 bit | MP3 128 | MP3 96 | AAC 64 | AAC 48 | 32 kbit/sn |
|---|---|---|---|---|---|---|
| A. Tek karışım dosyası, tek ses (stereo) | 3.175 | 288 | 216 | 144 | 108 | 72 |
| A2. Aynısı, iki ses | 6.350 | 576 | 432 | 288 | 216 | 144 |
| B. Her süre için ayrı karışım (5+10+15+20+30 = 80 dk/ders), tek ses | 8.467 | 768 | 576 | 384 | 288 | 192 |
| B2. Aynısı, iki ses | 16.934 | 1.536 | 1.152 | 768 | 576 | 384 |
| C. Stem: yalnız konuşma klipleri, mono, tek ses (VARSAYIM ders başına 12 dk konuşma = 7.200 sn) | 635 | 115 | 86 | 58 | 43 | 29 |
| C. Konuşma, iki ses | 1.270 | 230 | 173 | 115 | 86 | 58 |
| C. Müzik yatakları, 10 × 180 sn stereo döngü | 318 (22,05 kHz: 159) | 29 | 22 | 14 | 11 | 7 |

- **C'nin toplamı** (iki ses, konuşma ve yatak AAC 64): ≈ 115 + 14 ≈ **130 MB ek**, uygulama ham ≈ 210 MB. Bugünkü ses
  biçimiyle (MP3 128) ≈ 230 + 29 ≈ **260 MB ek**.
- **Konuşma oranı** (%40) VARSAYIM. Metinler yazılınca ölçülmeli. İyi bir yönlendirmede sessizlik çok olduğu için oran
  düşebilir.
- **Döngü biçimi:** MP3 döngüsü dikişli (~50 ms boşluk; HATA_GUNLUGU.md:556). Bugünkü döngü bu yüzden WAV (8,47 MB /
  96 sn). AAC'nin dikişsiz döngüsü denenmedi. Yerel motor döngüyü PCM'e çözüp çalabilir. Bellekte 180 sn 44,1 kHz
  stereo Float32 ≈ 63,5 MB, 22,05 kHz ≈ 31,8 MB tutar.
- **Web Audio'da tek parça 30 dk:** çözülmüş hali 44,1 kHz stereo Float32 ≈ 635 MB → olmaz.
- **Azaltma yolları:**
  - Yalnız seçilen sesi indirmek. Uzak dosya altyapısı gerekir ve bugün yok (§6).
  - 1–2 dersi pakete koyup gerisini indirmek.
  - Bugünkü ölü yükü atmak: `public/sleep/sakin-fade-*.mp3` (~7,6 MB) iOS'ta hiç çalınmıyor. Yerel oynatıcı yalnız
    `sakin-loop.wav` kullanıyor (AlarmPlugin.swift:231). Kısılma dosyaları yalnız tarayıcı yolunda
    (dalgaSleep.js:52-64, 146-227).
  - mediapipe-wasm'deki üç varyant (her biri ~11 MB): hangisinin gerektiği doğrulanmadı.
- App Store hücresel indirme eşiği bu görevde doğrulanmadı.

### 8.4 Arka planda çalma riskleri

- **R1. Web Audio planlayıcısı kilitte durabilir.** 25 ms `setInterval` ve 0,3 sn ileri bakış kullanıyor
  (dalgaAudio.js:7-8, 268-279). JS askıya alınırsa en geç ~0,3 sn sonra ses biter (VARSAYIM, cihazda denenmedi).
  Konuşma Web Audio'ya kurulursa aynı risk geçerli.
- **R2. WKWebView sesi cihazda duyulmayabilir.** Bug 22'de böyle oldu (HATA_GUNLUGU.md:590-597). Sessiz tuşunda çalma
  `navigator.audioSession` VARSAYIMINA dayanıyor (dalgaAudio.js:209-219).
- **R3. Tek yerel oynatıcı.** Yeni başlatma öncekini durdurur (AlarmPlugin.swift:236). Ders ile uyku sesi aynı anda
  çalamaz. Oturum bayrağı tek (`sleepActive`, FeedbackPlugin.swift:247).
- **R4. Kesinti.** Yalnız `.ended` + `shouldResume` ele alınıyor (AlarmPlugin.swift:302-311). JS sayacı duvar saatiyle
  sayıyor (dalgaSleep.js:88-101). Aramadan sonra ekrandaki süre ile ses ayrışır. iOS `shouldResume` göndermezse ses
  durur ama ekran saymayı sürdürür. Çözüm: zaman çizelgesi oynatıcının konumundan okunmalı.
- **R5. Kulaklık çıkınca ne olacağı belirsiz.** Rota değişimi gözlemcisi yok. Ders hoparlörden sürebilir (doğrulanmadı).
- **R6. Kilit ekranı denetimi yok.** Now Playing ve uzaktan komut yok. 30 dk derste kilitten duraklatma ve AirPods
  dokunuşu çalışmayabilir.
- **R7. Kayıt kaybı.** Oturum kaydı yalnız JS'de yazılıyor (Dalga.jsx:239-252). JS kilitte askıdaysa ya da uygulama
  kapanırsa dinlenen süre Gelişim'e yazılmayabilir.
- **R8. Ekrandan çıkınca ses durur** (Dalga.jsx:97-111). Ders sürerken başka ekrana geçilecekse `sleepSession.js`
  gibi modül dışı bir oturum gerekir.
- **R9. Ses tercihi.** Tercih her görünürlükte yeniden uygulanıyor (native.js:237-239 HEAD). Koruma olmazsa çalan
  dersi susturabilir (HATA_GUNLUGU.md:601-604). Ayrıca ses tercihi kapalıyken seslendirme hiç çalmıyor
  (voiceCue.js:13). Bu kuralın derste de geçerli olup olmayacağı karar ister.
- **R10. Mikrofon kaydı sürerken** yerel ses başlamaz (FeedbackPlugin.swift:289).
- **R11. "Ses kesilmeyecek" isteği.** Bugünkü `playPhrase` yeni cümlede öncekini keser (voicePack.js:176, 183-187).
  Bitir ve Duraklat cümle sınırını beklemeli ya da kısa kapanışa geçmeli.
- **R12. Hoparlör bandı.** Erkek ses ve alçak müzik iPhone hoparlöründe zayıf kalabilir (Bug 20/22 kök nedeni;
  ölçülmedi).
- **R13. Uyku sesinde bile doğrulanmadı.** Kilitli ekranda tam süre çalma cihazda görülmedi (YAPILACAKLAR.md:212).
- **R14. Derleme.** pbxproj sahibin Mac'inde çakışmada ve Swift bu ortamda derlenmiyor.

### 8.5 Değişken süre: yaklaşım seçenekleri

- **V1. 30 dk'lık tek karışım, istenen dakikada kesilir.** 5 dk'da kapanışsız biter ve cümle ortasında kesilebilir.
  **Uygun değil.**
- **V2. Her süre için ayrı karışım (5/10/15/20/30).**
  - Artısı: her biri bütün. Tek dosya ve tek AVPlayer olduğu için kilit ekranında en sağlamı.
  - Eksisi: boyut 2,67 kat (tablo B) ve yalnız sabit süreler var, "istediğim dakika" karşılanmaz. Uzaktan indirmeyle
    olabilir.
- **V3. Bölümlü ders + planlayıcı + çalışma anında karışım (önerilen).**
  - Her dakika (5–30, 1 dk adım) ±birkaç sn'de dolar. 5 dk = giriş + 1 çekirdek + kapanış.
  - Yerel motor zaman çizelgesini örnek hassasiyetinde çalar, müziği döngüler ve konuşma sırasında kısar.
  - Boyut tablo C'deki gibi.
  - Zorlukları: bölüm geçişleri metinde doğal yazılmalı, klip uçlarındaki nefes ve oda sesi eşleşmeli, yerel motor
    yazılmalı.
- **V4. V3'ün başlamadan önce tek dosyaya basılmış hali.**
  - Artısı: kilitte en sağlamı.
  - Eksisi: tarayıcıda 96 sn'yi basmak 10,5 sn sürmüştü (HATA_GUNLUGU.md:552-554), yani web tarafında olmaz. Yerelde
    basma süresi ve belleği denenmedi.
- **Hepsinde geçerli:**
  - "Bitir" iki seçenek sunar: "kapanışa geç" (30–60 sn) ya da "hemen çık".
  - Duraklatınca cümlenin başına sarılır.
  - Sayaç planın toplamını gösterir ve oynatıcının konumundan okunur.
  - Yarıda bırakılan ders `completed: false` ve dinlenen saniyeyle kaydedilir.
- **Öneri:** V3 ve yerel motor. İlk sürüm en fazla 2 dersle cihazda denenir: kilit, arama, AirPods çıkarma, sessiz
  tuş, 5 ve 30 dk, iki ses. Sonra 10 derse geçilir.
- **Boyut kararı sahibinin:** ya hepsi pakette (~+130 MB, AAC 64) ya da indirme altyapısı kurulur.

### 8.6 Doğrulanmayanlar

- WKWebView'de JS zamanlayıcılarının kilitte askıya alınması (dalgaSleep.js:4-5 ve dalgaAudio.js:2-3'de VARSAYIM).
- `navigator.audioSession`'ın WKWebView'de çalışması.
- AAC'nin dikişsiz döngüsü. AVAudioEngine ve AVMutableComposition'ın bu uygulamadaki davranışı.
- Bluetooth gecikmesi. Rota değişiminde AVAudioPlayer'ın ne yaptığı.
- App Store boyut eşikleri. Sıkıştırılmış IPA boyutu.
- ElevenLabs'te PCM/WAV çıktı seçeneği.
- mediapipe-wasm'in üç varyantından hangisinin yüklendiği.
- Kilitli ekranda uyku sesinin tam süre çalması.
