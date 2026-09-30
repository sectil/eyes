# C adımı · Yoga ilk bölüm kodu · Düzeltici raporu (2026-09-30)

Kapsam: ajanların İSTEK'leri ve iki incelemenin (doğruluk; metin ve güvenlik) bütün BLOCKER ve SHOULD bulguları, kolay
NIT'ler. Git kullanılmadı. Giriş akışına (AccountStart, auth, AppleSignInPlugin, AuthSessionPlugin) dokunulmadı. Yeni npm
bağımlılığı yok. Swift kodu bu ortamda derlenmedi.

## 1. Sonuç

- Bütün takım (`npx vitest run`, /home/user/eyes/app): **123 dosya, 1640 test, hepsi geçti.**
  - Başlangıçta 120 dosya, 1611 test; 1 test düşüyordu (`AlarmCard.test.jsx:295`, saate bağlı; §4).
  - Yoga ile ilgili dosyalar ayrıca Europe/Istanbul, America/Los_Angeles, Asia/Tokyo ve Pacific/Kiritimati saat
    dilimlerinde koşuldu: 189/189.
- `npm run build`: geçti ("built in 3.56s"). Tek uyarı, bugün de var olan 500 kB'lık parça uyarısı.
- `dist/yoga/` yerel derlemede var (iOS paketi için); `.vercelignore` `public/yoga` satırını taşıyor.

## 2. Değişen ve eklenen dosyalar (app/ altında)

**Kod**
- `src/modules/yoga/Yoga.jsx`: ses denetimi, başlatma, kayıt, "Çok" metni, "Sonra yaparım", yeniden bağlanma,
  yenileme, 3 dk kaynak kartı, müzik kuyruğu, uyku sonu, erişilebilirlik.
- `src/modules/yoga/YogaPlayer.jsx`: yerel duruma dayalı `applyStatus`, sarmada kapanış koruması, `lessonMeta`, hata
  gösterimi, denetimlerin erişilebilirliği, durgun form.
- `src/modules/yoga/bridge.js`: yeniden yazıldı; `start` bütün alanları geçirir, `meta`, `status` (state, reason,
  listened, file, prelude), `journal`, `journalClear`, `hopeless`.
- `src/modules/yoga/session.js`: `newLessonSession`, `newRunId`, `reachedClosing` buraya taşındı.
- `src/modules/yoga/journal.js` (**yeni**): yerel kayıt uzlaştırması (`reconcileLessonJournal`), oturum kaydı
  (`sessionRecord`), yerelde süren derse yeniden bağlanma (`liveLesson`).
- `src/modules/yoga/timeline.js`: `resumeSpans`, `guardClosing`.
- `src/modules/yoga/text.js`: yeni metinler (§6) ve `listTr`.
- `src/modules/yoga/BreathForm.jsx`: `still` kipi.
- `src/modules/yoga/yoga.css`: opaklık geçişi, 44 px dokunma alanları, uyku sonu, `.yg-sr`.
- `src/modules/yoga/manifest.js`: `PATH_LATER_KEY = LATER_KEY`.
- `src/lib/yogaLessons.js`: `lessonByFile`, Ders 3'te `musicTailFile: null`, sürüm verisinde isteğe bağlı `intro`, N1 ekran
  adı.
- `src/lib/yogaRecord.js`: `recordFromJournal`, `journalWritten`, `journalEndedAt`.
- `src/lib/yoga.js`: bitmiş durakta `hideMinutes`.
- `src/components/ProgressOverview.jsx`: yoga ölçüsünün etiketi.
- `src/screens/FirstReport.jsx`: `changeOf`, yani fiil ve güven aralığının yönü.
- `src/styles/yogaMorning.css`: sabah kartında 44 px düğme.
- `src/App.jsx`: `onYogaMorning`, "Tüm verileri sil"de `lessonJournalClear`, açılışta ve öne gelişte uzlaştırma.
- `src/lib/dalgaSleep.js`: yalnız yorum.
- `ios/App/App/AlarmPlugin.swift`: `holdsAudio`, `sleepStart` yorumu ve dosya başındaki not.

**Testler**
- Yeni dosyalar: `src/modules/yoga/journal.test.js`, `src/modules/yoga/Yoga.data.test.jsx`,
  `src/modules/yoga/BreathForm.test.jsx`.
- Değişen dosyalar:
  - `src/modules/yoga/Yoga.test.jsx`, `src/modules/yoga/text.test.js`
  - `src/lib/yoga.test.js`, `src/lib/yogaLessons.test.js`, `src/lib/exportData.test.js`
  - `src/components/ProgressOverview.yoga.test.jsx`, `src/screens/FirstReport.test.jsx`, `src/components/AlarmCard.test.jsx`

## 3. İSTEK'ler

| İSTEK | Sonuç |
|---|---|
| manifest `today()` → `yogaPathStop(ctx, { LESSONS, publishedMinutes })` | Zaten uygulanmıştı (`modules/yoga/manifest.js:95-101`) |
| `PATH_LATER_KEY` `LATER_KEY`'den | Yapıldı (`manifest.js:15`) |
| registry.test (yoga, `sleepEase` örneği) | Zaten var (`modules/registry.test.js:8`, `:102`) |
| stats.test `bests.yoga` | Gerek yok: yoga `sessions.best` tanımlamıyor, `bests`'e anahtar girmiyor (bkz. §7 rekor kutusu) |
| "Sonra yaparım" → `markLater('yoga', new Date())` | Yapıldı: yalnız yoldan açılan derste, sonra Ana sayfa (`Yoga.jsx:248`, `:573`) |
| Yoldan açılan ders süreyi `stage.minutes`'tan | Zaten vardı (`modules/yoga/view.jsx` `pathMinutesFor`) |
| Gece satırı `stage.night` ile | Eşdeğer: ayrıntıdaki koşul (20.00–04.59 ve Uykuya Geçiş yayımlı) `pathYoga`'nın `night`'ıyla aynı. Ders ekranı kütüphaneden de açıldığı için koşul orada kaldı |
| `YogaMorningCard.jsx` | Zaten var |
| App.jsx Home'a `onYogaMorning={refresh}` | Yapıldı (`App.jsx:1107`) |
| FirstReport:45 güven aralığı ve fiil | Yapıldı (`FirstReport.jsx:19`, `changeOf`) |
| native.js `lesson*` işlevleri | Zaten var (`lib/native.js:478-526`) |
| storage `updateSession` | Zaten var (`lib/storage.js:97`) |
| stats.test:224 gevşetilmesi (rekor kutusu için) | Yapılmadı; rekor kutusu açık iş (§7) |
| sources.js'e ders PMID/DOI'leri | Yapılmadı; açık iş (§7) |
| YogaPlayer/bridge: `lessonMeta`, `id`, sesli dönüşte `journal: false`, `state`/`reason`/`prelude` | Yapıldı (`YogaPlayer.jsx:145`, `Yoga.jsx:151-158`, `Yoga.jsx` sesli dönüş düğmesi, `YogaPlayer.jsx:33-80`) |
| Yoga.jsx: ilk ders girişi ve "Kaldığın yerden" için `next` | Giriş yapıldı: sürüm verisinde `intro` varsa `lessonStart({ file: giriş, next })` (`Yoga.jsx:151-158`). Dosya henüz olmadığı için çalışmıyor. "Kaldığın yerden" yok (§7) |
| Ders 3 `tail` | Yapıldı: `L.musicTailFile` varsa `tail: { file, seconds: dk*60, fade: 180 }`. Dosya yokken seçici gizli, kayıtta `musicTail: 0` |
| Ders başlayınca `stopSleepSession()` | Yapıldı (`Yoga.jsx:160`) |
| Yerel kayıt uzlaştırması | Yapıldı (`modules/yoga/journal.js`, §5) |
| App.jsx "Tüm verileri sil" → `lessonJournalClear()` | Yapıldı (`App.jsx:1069`) |
| AlarmCard.test:295 saatten bağımsız | Yapıldı (§4) |

## 4. İnceleme bulguları

### Doğruluk merceği

| # | Önem | Sonuç |
|---|---|---|
| 1 | BLOCKER · `ranOut` yanlış "bitti" | **Düzeltildi.** `bridge.status()` artık `state`, `reason`, `listened`, `file` ve `prelude` geçiriyor. `applyStatus` yerel durum varken bitişe yalnız şu durumlarda karar veriyor: `finished`, `tail`, ya da çalarken son 0,75 sn (`YogaPlayer.jsx:63`). `paused` hiçbir zaman bitiş sayılmıyor. Duvar saati tahmini yalnız `state` göndermeyen eski derlemede kaldı. Dinlenen süre yerelin saydığıyla sınırlanıyor (en büyüğü). Test: kilitte uzaktan duraklatma, 20 dk sonra dönüş → bitti değil, `extPaused`, dinlenen 180 sn (`Yoga.test.jsx`, "kilitte uzaktan duraklatma…") |
| 2 | BLOCKER · yerel kayıt silinmiyor | **Düzeltildi.** "Tüm verileri sil" `lessonJournalClear()` çağırıyor (`App.jsx:1069`). Kayıt artık okunuyor ve uzlaştırılıyor. JS kaydı yazınca yerel kaydı siliyor (`Yoga.jsx:178`), böylece veri birikmiyor. Sesli dönüş `journal: false` |
| 3 | SHOULD · AlarmCard testi saate bağlı | **Düzeltildi.** Testte `vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime(EVE)` (`AlarmCard.test.jsx` ilgili `it`); beklenti değişmedi |
| 4 | SHOULD · duraklatılmış ders uyku sesini engelliyor | **Düzeltildi (yerel).** `holdsAudio()` duraklatılmış dersi `stop()` ile kapatıyor ve uyku sesine yer açıyor; yalnız `playing` ve `tail` reddediliyor (`AlarmPlugin.swift:884-900`). Böylece "Önce çalan dersi durdur." yalnız gerçekten çalan derste görünür. JS tarafı: yerel oturum `idle` olunca oynatıcı bunu "başka yerden durdu" diye işliyor ve kaydı yerel kaydın bitiş anıyla yazıyor (`YogaPlayer.jsx:37`, test var). Ayrıca yerelde süren derse yeniden bağlanma eklendi (`journal.js:76` `liveLesson`, `Yoga.jsx:86`). Swift derlenmedi |
| 5 | SHOULD · kayıt ve yenileme | **Düzeltildi.** Kaydın tarihi ve dinlenen süre bu dersin yerel kaydından alınıyor (`journal.js:19` `sessionRecord`). Uygulama kapanırsa açılışta, ders Yoga ekranı dışında biterse öne gelişte kayıt yazılıyor (`App.jsx:360`). Sonra puanı, zorlanma ve akıştan çıkış `onRefresh` çağırıyor (`Yoga.jsx:98`, `:291`, `answerHard`) |
| 6 | SHOULD · Home `onYogaMorning` | **Düzeltildi** (`App.jsx:1107`) |
| 7 | SHOULD · köprü ekleri | **Düzeltildi.** Eklenenler: `id`, `journal`, `lessonMeta` (bölüm adları ve klip başlarıyla sürdürme aralıkları; `resumeSpans` `resumePoint` ile birebir, test var), veride varsa `next` ve `tail` |
| 8 | SHOULD · dosyasız ses denetimi ekranı | **Düzeltildi.** `SOUND_CHECK_FILE` yokken adım görünmüyor. İlk derste `soundCheck: 'nofile'` yazılıyor; dosya gelince bir kez soruluyor. Dosya varken ses dokunuşta çalıyor (`journal: false`) ve geri düğmesi var. "Hayır"dan sonra "Yeniden dinle" düğmesi var (`Yoga.jsx:121-137`, `SoundCheck`) |
| 9 | SHOULD · "Sonra yaparım" | **Düzeltildi** (İSTEK satırı) |
| 10 | SHOULD · Yön kutucuğu ve PDF değişimi beyan edilmedi | **Beyan ve sabitleme.** Aşağıda "bilerek değişen beklentiler". Testler: `exportData.test.js` (değişim sütunu ve aralık yönü), `ProgressOverview.yoga.test.jsx` (Yön kutucuğu) |
| 11 | SHOULD · FirstReport fiil ve güven aralığı | **Düzeltildi.** Fiil gösterilen değişimin işaretinden seçiliyor (arttı, azaldı, değişmedi). Güven aralığı değerle aynı yönde. Test var |
| 12 | NIT · yoga ölçüsü "iyileşiyor" | **Düzeltildi.** Yoga ölçüsünde "belirgin artış" ya da "belirgin düşüş" yazıyor, tonu aynı kalıyor (`ProgressOverview.jsx:42`) |
| 13 | NIT · `PATH_LATER_KEY` kopyası | **Düzeltildi** |
| 14 | NIT · başlatma hatası geç görünüyor | **Düzeltildi.** `s.starting` sözü oynatıcıda bekleniyor (`YogaPlayer.jsx:162`) |

### Metin ve güvenlik merceği

| # | Önem | Sonuç |
|---|---|---|
| 1 | BLOCKER · ses denetimi ekranı | **Düzeltildi** (doğruluk 8) |
| 2 | BLOCKER · "Çok" metni, daha kısa süre yokken | **Düzeltildi.** Dersin daha kısa yayımlanmış süresi yoksa onaylı metinden yalnız "daha kısa bir süre seçebilir," çıkarılıyor (`text.js` `muchStoppedNoShorter` / `muchFinishedNoShorter`; test: metin = onaylı metin eksi o parça). Bitişte aynı ders "en kısa" diye önerilmiyor ve süre yazılmıyor (`Yoga.jsx:584`). Daha kısa süre varken eski davranış sürüyor (test: `Yoga.data.test.jsx`, Ders 1 5 dk → "Nefesin Ritmi · 3 dk"). Türkçe editör onayına |
| 3 | SHOULD · sarma kapanışı kısaltıyor | **Düzeltildi.** `guardClosing`: kapanıştan önceden kapanışın içine sarma kapanışın başına iner (`timeline.js:99`, `YogaPlayer.jsx:91`). Geri sarma serbest. Test: 400 → 880 sarmasında hedef 750,929 |
| 4 | SHOULD · Hareketi Azalt / nöbette biçim değişiyor | **Düzeltildi.** `still = reduceMotion \|\| flashSafe !== true` iken ufuk ve nokta halesi sabit; imge yalnız opaklıkla gösteriliyor (`BreathForm.jsx`). `.yg-soft` için 3 sn opaklık geçişi eklendi; Hareketi Azalt'ta da kalıyor (`yoga.css:68`, reduced-motion bloğu). Test var |
| 5 | SHOULD · VoiceOver denetimlere ulaşamıyor | **Düzeltildi.** `aria-hidden` kaldırıldı, gizleme yalnız görsel. Odak denetimlere gelince denetimler görünüyor ve odak içerideyken gizlenmiyor (`YogaPlayer.jsx:288`). Test var |
| 6 | SHOULD · "Tüm verileri sil" yerel kaydı silmiyor | **Düzeltildi** (doğruluk 2) |
| 7 | SHOULD · 3 dk'da genel etki cümlesi | **Düzeltildi.** 3 dk'da yalnız `THREE_MIN_LINE` gösteriliyor (`Yoga.jsx:489`). Test var |
| 8 | SHOULD · müzik kuyruğu seçicisi işlevsiz; uyku sonunda "Durdur" | **Düzeltildi.** Seçici yalnız `musicTailFile` varken görünüyor. Dosya varken `tail` geçiriliyor. "Durdur" ilk dokunuşta görünüyor, ikincide durduruyor; DOM'da kalıyor ve VoiceOver onu odaklayabiliyor (`Yoga.jsx:421`, `yoga.css:108-109`). Test var |
| 9 | NIT · Ders 3 açılış satırları | **Değiştirilmedi.** Kod ders verisini izliyor; modul.md §10.3-e ile çelişki Türkçe editöre ya da sahibe kalıyor (§7) |
| 10 | NIT · N1 adı | **Veriye uyuldu:** "Niyet (sankalpa)" (`yogaLessons.js:129`; kaynak `b/ders2/ders2.lesson.v3.json` `blocks.N1.screenLabel`). Öteki bölüm adları öneri olarak kalıyor, editör onayına |
| 11 | NIT · "ve" bağlacı | **Düzeltildi** (`listTr`, `Yoga.jsx:543`). Test var |
| 12 | NIT · umutsuz hata kodlarında "yeniden dene" | **Düzeltildi.** UNAVAILABLE, UNIMPLEMENTED ve MISSING kodlarında yalnız "Ses açılamadı." yazıyor ve düğme çıkmıyor (`YogaPlayer.jsx:281-282`). Bu, onaylı metnin ilk cümlesidir. Test var |
| 13 | NIT · 44 px dokunma alanları | **Düzeltildi.** Şerit ve kaydırıcı 44 px, `summary` en az 44 px, sabah kartı düğmesi 44 px |
| 14 | NIT · gündüz/gece simgesi, bölüm şeridi | **Düzeltildi.** Simgenin yanında görünmez "Gündüz" ya da "Gece" (süzgeç çipiyle aynı söz) var. Bölüm şeridi `role="group"` ve görünmez "Bölümler:" etiketi taşıyor |
| 15 | NIT · kaynak kartında tür | **Yapılmadı.** Kaynaklara doğrulanmamış tür yazmamak için bırakıldı (§7) |
| 16 | NIT · bitmiş durak "5 dakika" | **Düzeltildi.** Bitmiş durakta `hideMinutes` (`yoga.js:147`) |
| 17 | NIT · Yön değişikliği beyanı | Aşağıda |

### Bilerek değişen beklentiler (gerekçeleriyle)

1. **Yön kutucuğu ve PDF.** Bu değişiklik yoga ajanınındı; ben beyan ettim ve sabitleme testi ekledim.
   - Gelişim kutucuğunda "düşük daha iyi" etkinin değeri puanın kendi değişimi: azalan rahatsızlık "−3,0" yazıyor,
     önceden "+3,0" yazıyordu.
   - PDF raporunda sütun başlığı "değişim (%95 GA)". Değer ve aralık aynı yönde: "−3,0 (−3,9 – −2,1)". Önceden aralık
     çevrilmiyordu.
   - Gerekçe: FirstReport ile tutarlılık ve aralığın değerle aynı yönde olması.
2. **FirstReport.** Fiil değişimin işaretinden seçiliyor. Artan gerginlik artık "azaldı: +2,0" yazmıyor.
3. **Yoga testleri** (bu işin kendi testleri; bugünkü sistemin testi değil):
   - `Yoga.test.jsx`: ses denetimi dosyası yokken adım yok. `lessonStart` çağrısında `id` var. Durdurmadan sonra
     `journalClear` çağrılıyor. "Çok" cevabında daha kısa süre olmadığı için yeni metin çıkıyor ve bitişte öneri kartı
     yok.
   - `yogaLessons.test.js`: N1 adı "Niyet (sankalpa)".
4. **AlarmCard.test.jsx:295.** Beklenti aynı; yalnız saat sabitlendi.

## 5. Yerel kayıt uzlaştırması (yeni davranış)

- `begin` her derse bir `runId` verir ve `lessonStart({ id })` ile geçirir.
- JS kaydı yazınca yerel kaydı siler (`bridge.journalClear`), böylece aynı ders iki kez yazılmaz.
- `reconcileLessonJournal` (`journal.js:45`) üç durumu ayırır:
  - **Ders yerelde sürüyor** (playing, paused, stopping): hiçbir şey yapmaz.
  - **Bellekte aynı `runId` var, Yoga ekranı açık değil:** kaydı sessizce yazar ve oturumu kapatır. Sonra puanı
    sorulmaz.
  - **Bellekte oturum yok** (uygulama kapandı): kaydı yerel kayıttan yazar. Tarih `endedAt`, yoksa `updatedAt`. Kapanışa
    ulaşma `finished` ya da `maxTime ≥ closingAt` ile belirlenir. Aynı ders ±10 sn içinde yazılmışsa ikinci kez yazmaz.
- Çağrı yerleri: App açılışı ve `visibilitychange → visible`, yalnız iPhone uygulamasında.
- `liveLesson` (`journal.js:76`): WebView yeniden yüklendiyse ve ders yerelde sürüyorsa, Yoga açılınca oynatıcı derse
  yeniden bağlanır; ders yeniden başlamaz.
- Testler: `journal.test.js` (7 test) ve `Yoga.test.jsx`'teki yeniden bağlanma ile dışarıdan kapanma testleri.

## 6. Yeni metinler (Türkçe editör onayına)

- `YT.hard.muchStoppedNoShorter` / `muchFinishedNoShorter`: onaylı metinden yalnız "daha kısa bir süre seçebilir,"
  silindi.
- `YT.detail.later`: "Sonra yaparım" (PLAN.v3 §B.2-9'daki ad).
- `YT.detail.day` / `night`: "Gündüz", "Gece" (VoiceOver; süzgeç çipleriyle aynı).
- `YT.player.audioErrorShort`: "Ses açılamadı." (Dalga metninin ilk cümlesi).
- `YT.soundCheck.again`: "Yeniden dinle". Yalnız ses denetimi dosyası gelince görünecek.
- FirstReport fiili: "değişmedi" (değişim tam 0 olduğunda).

## 7. Açık kalanlar

1. **Swift derlenmedi, cihazda denenmedi.** Değişen tek yer `holdsAudio`; `stop()`'un `.paused` dalını kullanıyor
   (`AlarmPlugin.swift:884-900`). Xcode derlemesi gerekli.
2. **Ses dosyası olmadığı için çalışmayanlar:** ses denetimi, ilk ders girişi (`intro`), sesli dönüş, müzik kuyruğu.
   Kod hazır; dosya adı verilince görünür.
3. **"Kaldığın yerden" kartı yok.** Açılış izni klibi dosyası ve `gozolcum:yoga-resume` kaydı yazılmadı (modul.md §2.10).
4. **Rekor kutusu "Yoga · pratik yapılan gün" yok.** `summary().bests` bir modülün en yüksek puanını alıyor
   (`lib/stats.js:250-256`); "gün sayısı" rekoru bu kalıba uymuyor. Ayrıca `stats.test.js:224` birebir beklentisi
   değişir. Sahip ya da Gelişim sahibi karar vermeli.
5. **Kaynaklar kartında çalışma türü** (modul.md §2.4-11) ve ders kaynaklarının `lib/sources.js`'e eklenmesi yok. Türler
   PubMed'den doğrulanmadan yazılmadı.
6. **Ders 3 açılış satırları:** kod ders verisini izliyor, modul.md §10.3-e'den farklı. Editör ya da sahip kararı
   gerekli.
7. **Bölüm adları:** N1 dışındakiler öneri; editör onayına.
8. **Ders Yoga ekranı dışında biterse,** uygulama önde ve kişi başka ekrandayken kayıt ancak bir sonraki öne gelişte ya
   da Yoga açılınca yazılıyor. Tarih yine doğru (yerel `endedAt`).
9. **Veri merkezi ajanının açık kararları:**
   - `dataHub.js:151` `verifiedChange` yoganın puanlarını sayıyor.
   - Nef rıza metni (`consent.js:64`).
   - Nef süzgecindeki 10 modül sınırı (`coachCore.js:44`).
10. **Ortam ajanının notu:** iOS 27'nin yeni kesinti bildirimleri.
11. **Başka saatte düşebilen, yoga dışı test:** `trend.weekly.test.js:211`. İnceleme TZ=Asia/Tokyo'da bir saatte
    düştüğünü bildirdi. Bu işte dokunulmadı; bugün dört saat diliminde koşulan takımda yeşil.

## 8. Cihazda denenmesi gerekenler (PLAN.v3 §E.5'ten ilk bölüme uyanlar)

Kapı 4 derlemesinde yalnız Ders 2 · 15 dk yayımlı. Yol durağı cihazda görünmez: kısa günde 3 dk'lık, tam ders gününde
5 dk'lık yayımlı ders yok (`lib/yoga.js:117-124`). Yol maddeleri Kapı 5'e kalır.

- [ ] Ders 2 · 15 dk kilitli ekranda kesintisiz. Sessiz tuşu açıkken de çalıyor. 15 dk kilitli çalmada pil tüketimi.
- [ ] Sarma, bölüme atlama ve "Kapanışa geç" geçişlerinde tık ya da faz sorunu yok.
- [ ] "Kapanışa geç" imge bloğundayken önce bırakma klibi çalıyor.
- [ ] Kapanıştan önceden sona sarınca kapanışın başına iniyor (yeni).
- [ ] Now Playing'de ders adı ve **bölüm adı** görünüyor (yeni: `lessonMeta`).
- [ ] Kilit ekranından ve AirPods dokunuşuyla duraklat/sürdür çalışıyor. Sürdürme klibin başından başlıyor (yeni:
      `resume` aralıkları).
- [ ] Ders kilit ekranından duraklatılıp ekran uzun süre kapalı kalınca uygulamaya dönülüyor: ders "bitti" sayılmıyor,
      "Sürdür" görünüyor (BLOCKER 1).
- [ ] Arama ve Siri; kulaklık çıkınca duraklama; Bluetooth'a geçiş.
- [ ] Nefes formunun büyüme anı ile "al" sözü arasındaki fark hoparlörde ve AirPods'ta ölçülüyor (nöbet cevabı "Hayır"
      olan profilde).
- [ ] Hareketi Azalt açıkken ufuk halesi boyut değiştirmiyor, yalnız yavaşça parlıyor.
- [ ] Ses oturumu, **ders çalarken:**
  - Dalga'dan uyku sesi başlamıyor, ders kesilmiyor, ekran "Önce çalan dersi durdur." diyor.
  - Alarm kurulumunda "Kur" ile istenince uyku ekranı aynı metni gösteriyor ve "dokun, başlat" düğmesi çıkmıyor.
- [ ] Ses oturumu, **ders duraklatılmışken** Dalga'dan uyku sesi istenince ders kapanıyor, uyku sesi başlıyor ve ders
      kaydı yazılıyor (yeni, Swift).
- [ ] Ses oturumu, **uyku sesi çalarken** ders başlatılınca uyku sesi duruyor ve ders kilitte sürüyor.
- [ ] Ses oturumu, **ses kapalı tercihiyle:** ekran birkaç kez açılıp kapanırken ders kilitte sürüyor.
- [ ] Uygulama ders sırasında sistemce kapatılıyor: yeniden açılışta kayıt yerinde, dinlenen süre doğru, tarih dersin
      bitiş anı (yeni: uzlaştırma).
- [ ] Ders bittiğinde kişi başka ekrandaysa, uygulama öne gelince kayıt yazılıyor ve Gelişim'de görünüyor.
- [ ] "Tüm verileri sil"den sonra yerel ders kaydı yok; güvenlik kartı yeniden geliyor.
- [ ] VoiceOver: denetimler 5 sn sonra da okunuyor ve odaklanınca görünüyor. Gündüz simgesi "Gündüz" diye okunuyor.
- [ ] 320 px'te kütüphane, ayrıntı, puan, bitiş ve güvenlik kartı iki temada yana taşmıyor. Oynatıcı hep karanlık.
- [ ] Web sürümünde yoga görünmüyor (kutucuk, yol, rota tek satır).
