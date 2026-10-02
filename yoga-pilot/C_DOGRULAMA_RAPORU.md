# C adımı · Yoga ilk bölüm kodu · Doğrulama düzeltmeleri (2026-09-30)

Kapsam: üç bağımsız incelemenin (js, swift, veri-metin) 16 bulgusu. Her bulgu önce kanıtlandı: kodu okuyarak ve
incelemecinin kanıt testleriyle (`scratchpad/rv/race.test.js`, `scratchpad/rv/flow.test.jsx`). Kanıt testlerinin üçü de
düzeltmeden önce hatayı gösterdi. Düzeltmeden sonra "iki kez yazılır" ve "bugüne yazılır" beklentileri artık tutmuyor:
tek kayıt yazılıyor ve tarih 29 Eylül. Bu, düzeltmenin kanıtıdır.

Git kullanılmadı. Giriş akışına ve kimlik koduna dokunulmadı. Yeni npm bağımlılığı eklenmedi. DOKUNMA listesindeki
dosyalara (`lib/today.js`, `screens/Home.jsx`, `components/TodayPath.jsx`, `modules/breath/*`, `modules/routine/*`)
dokunulmadı; oralarda değişiklik gerekmedi, bu yüzden İSTEK yok. Swift bu ortamda derlenemedi; ayraç dengesi ve metin
sözleşmesi testle denetlendi.

Yedek: `yoga-pilot/_yedekler/2026-09-30_08-04-50___c-dogrulama/`. Kopyalar SHA-256 ile doğrulandı. Geri alma komutları
`_manifest.md` içinde.

## 1. Sonuç

- **Bütün takım** (`npx vitest run`, /home/user/eyes/app): **135 dosya, 1821 test; hepsi geçti.**
  - Başlangıçta 132 dosya ve 1770 test vardı.
  - Başlangıçtaki ilk koşuda `screens/Breath.path.test.jsx` içinde 3 test düştü. İkinci koşuda hepsi geçti. Bu dosya
    öbür iş akışının alanında (nefes); bu işte dokunulmadı.
  - Aradaki 3 dosya öbür iş akışının eklediği testler.
  - Bu işin eklediği test sayısı 26, genişlettiği test sayısı 3.
- **Saat dilimleri:** yogayla ilgili 12 dosya dört saat diliminde de geçti (141/141): Europe/Istanbul,
  America/Los_Angeles, Asia/Tokyo ve Pacific/Kiritimati.
- **`npm run build`:** geçti ("built in 5.23s"). Tek uyarı, önceden de olan 500 kB parça uyarısı. `dist/yoga/` yerinde.

## 2. Bulgular ve sonuçları

### js merceği

| # | Önem · bulgu | Kanıt | Sonuç |
|---|---|---|---|
| J1 | SHOULD · `reconcileLessonJournal` iki kez aynı anda çalışınca aynı dersi iki kez yazıyor | **Doğrulandı.** Kanıt testinin çıktısı: "yoga kaydı sayısı 2". Denetim ile `addSession` arasında `await loadTimeline` var | **Düzeltildi** (`modules/yoga/journal.js:51-95`). (1) İşlev tek uçuşlu: ikinci çağrı süren uzlaştırmanın sonucunu bekliyor. (2) Çizelge yüklendikten sonra, yazmadan hemen önce ve arada bekleme olmadan `journalWritten` yeniden denetleniyor. Testler (`journal.test.js`): iki eşzamanlı çağrıda tek kayıt yazılıyor, ikisi de aynı sonucu alıyor; çizelge yüklenirken başka yoldan yazılan ders ikinci kez yazılmıyor. Kanıt testi artık "kayıt sayısı 1" veriyor |
| J2 | SHOULD · duraklatılmış ders saatler sonra X ile kapanınca kayıt X gününe yazılıyor | **Doğrulandı.** Kanıt testinin çıktısı: "yerel gün 2026-09-30". Yerelde de `stop()` `.paused` dalında `endedAt = Date()` yazıyordu | **Düzeltildi, JS ve yerel tarafta.** JS: oturumda `pausedAt` tutuluyor. Değer duraklatma dokunuşunda ya da yerelin bildirdiği duraklatma anında yazılıyor, çalınca ve bitince siliniyor (`YogaPlayer.jsx:30` `notePause`, `:250`, `runSteps`). `sessionRecord` bitiş anını şu sırayla seçiyor: yerel kaydın `endedAt`'i, sonra `pausedAt`, sonra şimdi (`journal.js:18`, `:29`). `journalEndedAt` da `pausedAt`'e bakıyor (`lib/yogaRecord.js:127`). Köprü `pausedAt`'i geçiriyor (`bridge.js`). Swift: `pause()`, `halt()` ve `mediaServicesReset` duraklatma anını tutuyor; `stop()` `.paused` dalında `endedAt = pausedAt ?? Date()` (`AlarmPlugin.swift:868`). Aynı değer `status()` ve yerel kayıtla da gidiyor. Testler: arayüzden 23.50'de duraklatma, 08.00'de X → kayıt 29 Eylül 23.50; kilit ekranından duraklatmada yerelin anı kullanılıyor; `applyStatus` birim testi; `sessionRecord` ve `journalEndedAt` testleri; Swift metin sözleşmesi |
| J3 | SHOULD · "Tüm verileri sil" süren dersi bitirmiyor; silinen önce puanı sonra yeniden yazılıyor | **Doğrulandı.** Kanıt testinin çıktısı: "silmeden sonra yazılan [{ before: 7 }]" | **Düzeltildi** (V1 ile aynı düzeltme). `session.js:21` `forgetLesson`: oturum bitmiş sayılıyor, yazıcısı düşüyor, bellekten siliniyor. `journal.js:99` `resetLessonData` sırasıyla şunu yapıyor: silme sayacını artırıyor, oturumu unutuyor, `lessonStop` çağırıyor, sonra `lessonJournalClear` çağırıyor. Silmeden önce başlamış bir uzlaştırma da artık silinmiş depoya yazmıyor. `App.jsx:1070` bunu çağırıyor. Testler: arayüz akışı (önce puanı 7, 400 sn, silme, Yoga yeniden açılıyor → kütüphane, kayıt yok); çağrı sırası stop → journalClear; durdurma reddedilse de kaydın silinmesi; uçuştaki uzlaştırma; App.jsx bağlantısı (kaynak metin denetimi) |

### swift merceği

| # | Önem · bulgu | Kanıt | Sonuç |
|---|---|---|---|
| S1 | SHOULD · ders çalarken ses kaydı bitince oturum kapatılıyor, ders duruyor; kayıt da çalan dersin üstüne başlıyor | **Doğrulandı (kodla).** `endRecording` bayrak denetiminden önce koşulsuz `setActive(false)` çağırıyordu. Apple belgesi: çalan ses nesneleri varken oturumu kapatmak onları durdurur. Sonra tik `halt("stalled")` diyordu. `SpeechPlugin.start` ders durumuna bakmıyordu. Yol erişilebilir: ders sürerken başka ekrana geçilir (modul.md §4), `ReadingTest.jsx:157` kaydı başlatır | **Düzeltildi.** (1) `FeedbackPlugin.swift:271` `endRecording`: uyku sesi ya da ders açıksa oturum kapatılmıyor, yalnız `.playback` kategorisine geçiliyor ve `setActive(true)` çağrılıyor. Bu, eski uyku sesi yolundaki aynı kusuru da gideriyor. (2) Kayıt başlarken çalan ders, kesintideki gibi hemen duraklıyor (`reason: "recording"`, "Sürdür" ile klibin başından). Müzik kuyruğu bitiyor, sönen ders kapanıyor, duraklatılmış ders olduğu gibi kalıyor (`AlarmPlugin.swift:892` `yieldToRecording`; `SpeechPlugin.swift` içinde `beginRecording`'den önce). Reddetmek yerine duraklatmayı seçtim: okuma testi bugünkü gibi mikrofonla çalışıyor, mevcut sistemin davranışı değişmiyor. `holdsAudio()` kullanılmadı. Testler: metin sözleşmesi (`native.lesson.test.js`: sıra, dal içeriği, ana kuyruk). Derlenmedi |
| S2 | NIT · müzik kuyruğunda kesinti olunca Now Playing çalıyor görünüyor; kuyruk sessiz ve açık kalabiliyor | **Doğrulandı (kodla).** `.began` içinde `.tail` için `default: break` vardı | **Düzeltildi.** `.began` geldiğinde `.tail` durumunda `closeSession(finished: true)` çağrılıyor. Böylece kuyruk "tamamen durur" kuralına uyuyor; Now Playing, oturum ve bayrak kapanıyor. `.ended` içindeki kuyruk dalı artık erişilemez olduğu için kaldırıldı. Test: metin sözleşmesi |
| S3 | NIT · Now Playing bilgisi iOS Günlük önerilerine gidiyor | Apple belgesiyle uyumlu; veri cihazda kalıyor | **Yapılmadı: sahip kararı.** İncelemeci de "sahip onaylarsa" diyor. Onay gelirse şu satır eklenir: `if #available(iOS 18.0, *) { info[MPNowPlayingInfoPropertyExcludeFromSuggestions] = true }`. Bu ortamda derleyici olmadığı için sembol doğrulanamadı |
| S4 | NIT · istenmeyen uzaktan komutlar açıkça kapatılmıyor | **Doğrulandı (kodla ve Apple belgesiyle).** `isEnabled` varsayılanı true | **Düzeltildi** (`AlarmPlugin.swift:1286`). Şu komutlar ders boyunca `isEnabled = false` oluyor: nextTrack, previousTrack, skipForward, skipBackward, seekForward, seekBackward, changePlaybackPosition. `removeRemote` hepsini eski değerine döndürüyor. Test: metin sözleşmesi. Eski test "bu adlar hiç geçmez" diyordu; şimdi "hedef eklenmez, kapatılır" diyor |

### veri-metin merceği

| # | Önem · bulgu | Kanıt | Sonuç |
|---|---|---|---|
| V1 | SHOULD · "Tüm verileri sil" süren dersi durdurmuyor, bellekteki oturumu silmiyor | J3 ile aynı | **Düzeltildi** (J3) |
| V2 | SHOULD · iki sarmayla kapanış atlanıyor | **Doğrulandı.** Birinci sarma kapanışın başına (750,929) iniyordu, ikincisi 891'e. `guardClosing` kapanışın içinden ileri sarmaya izin veriyordu | **Düzeltildi.** `timeline.js:100` `guardClosing`: kapanışın içinden ileri sarılamıyor, hedef bulunduğu yer oluyor; geri sarma serbest. `YogaPlayer.jsx:265`: hedef bulunduğu yerse yerel oynatıcıya hiç çağrı gitmiyor (aynı yere geçiş sesi bozardı). Testler: `guardClosing` birim testi; arayüzden iki sürükleme (ikincisinde çağrı yok) ve geri sarma. `seekGoal` testindeki "kapanışın içinde serbest" beklentisi bilerek değiştirildi |
| V3 | SHOULD · PDF'te yoga ölçüsü "iyileşiyor/geriliyor" yazıyor, Gelişim'de "belirgin artış/düşüş" | **Doğrulandı.** `reportHtml` `STATUS_TEXT` kullanıyordu | **Düzeltildi.** Metin artık tek bir yardımcıdan geliyor: `lib/progress.js:156` `feelOnlyText`. Gelişim (`ProgressOverview.metricStatus`), 5. gün raporu ve PDF (`exportData.js:289`) aynı metni yazıyor. Test: `exportData.test.js`. Yoga ölçüsü "belirgin artış/düşüş" yazıyor, "geriliyor" yazmıyor; başka ölçüler değişmedi ("iyileşiyor") |
| V4 | NIT · Ders 4 bitiş satırının öznesi yok | **Doğrulandı.** PLAN.v3 §B.2 kural 11 ve K10 düzeltilmiş biçimi veriyor | **Düzeltildi** (`text.js:113`): "Zor anlar sık sık geliyorsa bir uzmanla konuşmak iyi olur. Acil durumda 112." Son biçim Türkçe editörün ve klinik psikoloğun onayına. Ders 4 bu bölümde yok. modul.md §2.9'daki eski satır belgede kaldı. Test var |
| V5 | NIT · uyku dersinde X'ten sonra uyandıran dönüş ekranı çıkıyor | **Doğrulandı** | **Düzeltildi** (`Yoga.jsx:305`). Gece dersinde metin, dersin kendi onaylı gece satırı: "Gece kalkman gerekirse önce yana dön, otur, sonra kalk." (Ders 3 açılış satırı; yeni söz yok). "Sesli dönüşü dinle" düğmesi gece dersinde hiç çıkmıyor. Testler: arayüz akışı (Ders 3 geçici olarak yayımlanmış) ve metin testi. Ders 3 henüz yayımlı değil |
| V6 | NIT · "Çok" dendiğinde daha kısa süre yoksa bitişte başka bir ders öneriliyor | **Doğrulandı.** Birden çok ders görünürken sıradaki ders öneriliyordu | **Düzeltildi** (`Yoga.jsx:592`). "Çok" cevabında öneri yalnız aynı dersin daha kısa süresi olabilir. Daha kısa süre yoksa öneri kartı çıkmıyor. İki seçenekten bu seçildi, çünkü önceki düzeltmenin (C_KOD metin 2: aynı süre "en kısa" diye önerilmez) kararıyla da uyumlu. Öteki cevaplarda davranış değişmedi. Testler: Ders 1 · 3 dk → "Çok" → kart yok; "Hayır" → sıradaki ders |
| V7 | NIT · "Kapanışa geç" ile bitirilen ders ekranda "Ders bitti" diyor, geçmişte "yarıda kaldı" yazıyor | **Doğrulandı** | **Düzeltildi** (`manifest.js:70`). "yarıda kaldı" yalnız kapanışa ulaşılmamışsa yazılıyor. Kapanışa ulaşılmış ama %60 dolmamışsa hiçbir şey yazılmıyor; yeni metin eklenmedi. Tamamlanan sayısına yine girmiyor. Değişiklik oturum geçmişini, CSV notunu ve PDF'i birlikte düzeltiyor. Test genişletildi |
| V8 | NIT · 5. gün raporunda "azaldı: −0,0" | **Doğrulandı.** Fiil yuvarlanmamış değerden seçiliyordu | **Düzeltildi.** `FirstReport.jsx:25` `changeOf` değeri ekrandaki gibi bir haneye yuvarlıyor ve fiili ondan seçiyor ("değişmedi: 0,0"). `signed` işaretini yuvarlanmış değerden alıyor; bu hem FirstReport'ta hem `exportData.js`'te geçerli. Böylece PDF'te "−0,0" da çıkmıyor. Testler: `FirstReport.test.jsx` ve `exportData.test.js` |
| V9 | NIT · yerel kayıttan yazılan uyku dersi kaydında `musicTail: null` | **Doğrulandı** | **Düzeltildi** (`lib/yogaRecord.js:75`). Gece dersinde kuyruk bilinmiyorsa ve kuyruk dosyası yoksa `0` yazılıyor, dosya varken `null`. Bu tek nokta, yerel kayıt yolunu ve yeniden bağlanan ders yolunu birlikte kapsıyor. Test var |

## 3. Değişen dosyalar (app/ altında)

- **Kod:**
  - `src/modules/yoga/`: `journal.js`, `session.js`, `bridge.js`, `YogaPlayer.jsx`, `timeline.js`, `text.js`, `Yoga.jsx`,
    `manifest.js`
  - `src/lib/`: `yogaRecord.js`, `progress.js`, `exportData.js`, `native.js` (yalnız yorum)
  - `src/components/ProgressOverview.jsx`, `src/screens/FirstReport.jsx`, `src/App.jsx`
  - `ios/App/App/`: `AlarmPlugin.swift`, `FeedbackPlugin.swift`, `SpeechPlugin.swift`
- **Testler:**
  - `src/modules/yoga/`: `journal.test.js`, `Yoga.test.jsx`, `Yoga.data.test.jsx`, `timeline.test.js`, `text.test.js`,
    `manifest.test.js`
  - `src/lib/`: `yogaRecord.test.js`, `exportData.test.js`, `native.lesson.test.js`
  - `src/screens/FirstReport.test.jsx`

**Bilerek değişen beklentiler.** Üçü de bu işin kendi testleri:
1. Kapanışın içinden ileri sarma artık serbest değil (`Yoga.test.jsx`, `seekGoal`).
2. Uzaktan komut adları artık kaynakta geçiyor, ama hedefleri yok ve kapatılıyorlar (`native.lesson.test.js`).
3. "yarıda kaldı" yalnız kapanışa ulaşılmamış derste yazılıyor (`manifest.test.js`).

## 4. Onaya giden metinler

- `YT.done.lesson4`: PLAN.v3 §B.2 kural 11'deki biçim. Türkçe editör ve klinik psikolog onayına.
- `YT.stopped.night`: Ders 3'ün onaylı açılış satırının aynısı; yeni söz değil.
- "Çok" cevabında kısa süre yokken öneri kartı çıkmıyor; metin değişmedi.

## 5. Cihaz listesine eklenecekler (C_KOD_RAPORU §8'e ek)

- [ ] Ders çalarken okuma testi başlatılıyor. Ders hemen duraklıyor, okuma testinde mikrofon çalışıyor. Test bitince
      ders duraklatılmış kalıyor; "Sürdür" klibin başından çalıyor. Okuma testi bitince oturum `.playback`'e dönüyor.
- [ ] Uyku sesi çalarken okuma testi yapılıyor. Test bitince uyku sesi durmuyor (eskiden oturum kapatıldığı için
      durabiliyordu).
- [ ] Kilit ekranında ve Denetim Merkezinde yalnız oynat/duraklat görünüyor: atlama, 15 sn ve konum çubuğu yok.
- [ ] Ders gece duraklatılıyor, sabah X ile ya da Dalga'nın uyku sesiyle kapatılıyor. Kayıt duraklatma gününde,
      Gelişim'in 28 günlük şeridinde de o günde görünüyor.
- [ ] Müzik kuyruğu çalarken arama ya da Siri geliyor. Kuyruk kapanıyor, kilit ekranında Now Playing kalmıyor.
- [ ] Ders çalarken "Tüm verileri sil" seçiliyor. Ders 2 sn'de sönüyor; Yoga açılınca kütüphane görünüyor; Gelişim'de
      yoga kaydı yok.

## 6. Açık kalanlar

1. **Swift derlenmedi ve cihazda denenmedi.** Değişen yerler:
   - `endRecording`
   - `yieldToRecording`: `DispatchQueue.main.sync`, Capacitor'ın köprü kuyruğundan çağrılıyor
   - `pausedAt`
   - kuyrukta kesinti
   - uzaktan komutların kapatılması
2. **S3 (Günlük önerileri):** sahip kararı bekliyor.
3. **modul.md §2.9'daki Ders 4 satırı belgede eski biçimde.** Belgenin PLAN.v3 §B.2-11'e göre düzeltilmesi öneriliyor.
4. **İncelemecinin "Tüm verileri sil" kanıt testi (`scratchpad/rv/flow.test.jsx`) hâlâ geçiyor.** Test App'in eski
   adımlarını (`clearAll` + `lessonJournalClear`) elle taklit ediyor. Yeni yol (`resetLessonData`) bu işin testleriyle
   sınandı.
