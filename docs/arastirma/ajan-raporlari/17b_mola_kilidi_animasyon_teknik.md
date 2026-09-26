# 17b — Zorunlu mola kilidi + Yılan bakış animasyonu: teknik araştırma

Tarih: 2026-09-25 · Kapsam: `/home/user/eyes/app` (Capacitor 8.5.x, iOS hedefi 15.0, `ios/App/App.xcodeproj/project.pbxproj:253`)
Not: capacitorjs.com, raw.githubusercontent, bundlephobia, support.apple.com, MDN ve NN/g bu ortamda engelli. Eklenti belgesi bu yüzden **npm tarball'ındaki README ve Swift kaynağından** okundu (`@capacitor/local-notifications-8.3.1.tgz`).

## A1. @capacitor/local-notifications

- **Sürüm:** `latest` = **8.3.1** (2026-08-19). Peer bağımlılığı `"@capacitor/core": ">=8.0.0"`, yani Capacitor 8 ile uyumlu. Kurulum: `npm install @capacitor/local-notifications` + `npx cap sync` (https://registry.npmjs.org/@capacitor/local-notifications).
- **İzin:** `checkPermissions()` ve `requestPermissions()` → `PermissionStatus { display }`. `display` şu değerlerden biri olur: `'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'`. iOS'ta istenen izinler `[.badge, .alert, .sound]` (LocalNotificationsHandler.swift:14). **8.3.0'dan beri `schedule()` izin verilmemişse izni kendisi ister.** Sistem izin penceresinin ne zaman çıkacağını biz belirlemek istiyorsak önce kendi açıklama ekranımızı gösterip `requestPermissions()`'ı açıkça çağırmalıyız.
- **Belirli zamana kurma:** `schedule({ notifications: [{ id, title, body, schedule: { at: Date }, extra, interruptionLevel, foreground }] })` → `ScheduleResult`. iOS'ta `at`, `UNTimeIntervalNotificationTrigger(timeInterval: süre)` olarak kurulur. Geçmiş bir tarih verilirse trigger `nil` olur ve bildirim hemen teslim edilir (LocalNotificationsPlugin.swift:520-548).
- **İptal ve güncelleme:** `cancel({ notifications: [{ id }] })`, `cancelAll()` (8.3.0), `update(...)` (8.3.0, aynı `id` ile), `getPending()`.
- **Dinleyiciler:** `addListener('localNotificationReceived', …)` bildirim ön plandayken gösterildiğinde tetiklenir. `addListener('localNotificationActionPerformed', (a: ActionPerformed) => …)` şu alanları verir: `actionId`, `inputValue`, `notification`. Bildirime dokunulduğunda `actionId === 'tap'`, kaydırılıp kapatıldığında `'dismiss'` gelir (Handler.swift:83-86). Olay `retainUntilConsumed: true` ile gönderiliyor (Handler.swift:98). Uygulama kapalıyken dokunulup açılırsa olay, JS dinleyicisi bağlanana kadar bekletilir.
- **Ön planda gösterim:** `capacitor.config.json` → `plugins.LocalNotifications.presentationOptions: ["badge","sound","banner","list"]` (8.2.0, yalnız iOS). Bildirim başına `foreground: true/false` (8.3.0) de verilebilir; `silent` ile birlikte verilirse `foreground` önceliklidir (Handler.swift:31-41).
- **Info.plist / AppDelegate:** README'de iOS için kurulum adımı yok. Eklenti `load()` içinde kendini `bridge.notificationRouter.localNotificationHandler`'a bağlıyor (LocalNotificationsPlugin.swift:107). Mevcut `AppDelegate.swift` değişmeden kalabilir. Tek istisna Time Sensitive yetkisi (A2).

## A2. iOS sınırları ve Review kuralları

- **Uygulama kapalı veya arka plandayken:** Apple belgesi aynen şöyle diyor: *"If the delivery of the notification occurs when your app isn't running or in the background, the system interacts with the user for you."* (https://developer.apple.com/documentation/usernotifications/scheduling-a-notification-locally-from-your-app). Yani bildirimi UNUserNotificationCenter teslim eder, JS'in çalışması gerekmez.
- **Time Sensitive:** Eklentide `interruptionLevel: 'active' | 'critical' | 'passive' | 'timeSensitive'` alanı var (8.1.0, yalnız iOS). `.timeSensitive` iOS 15.0+ ile geliyor (https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel/timesensitive). README'ye göre "Time Sensitive Notifications capability" gerekiyor. Yetki olsa bile kullanıcı bu özelliği Focus başına kapatabilir. HIG'deki kural: *"make sure the notification is about an event that's happening now or will happen within an hour … Never use the Time Sensitive interruption level to send a marketing notification."* (https://developer.apple.com/design/human-interface-guidelines/managing-notifications). **Önerim:** varsayılan `'active'` kalsın. "Mola bitti" acil bir bilgi değil. `'critical'` ise ayrıca başvuru gerektiren Critical Alerts yetkisini istiyor; kullanılmamalı.
- **App Store Review Guidelines** (https://developer.apple.com/app-store/review/guidelines/):
  - 4.5.4: *"Push Notifications must not be required for the app to function, and should not be used to send sensitive personal or confidential information. …"* Madde push için yazılmış, ama aynı ilkeyi burada da uygulamak gerekir: bildirim izni reddedilse bile mola kilidi uygulama içinde tam çalışmalı.
  - 2.5.4: *"Multitasking apps may only use background services for their intended purposes: VoIP, audio playback, location, task completion, local notifications, etc."*
  - 2.5.16: *"Widgets, extensions, and notifications should be related to the content and functionality of your app."*

## A3. Mevcut mola mekanizması ve kalıcı sayaç

**Depolama:** Tek `localStorage` anahtarı var: `gozolcum:v1` (`src/lib/storage.js:4`). Erişilemezse bellekte çalışan yedeğe düşüyor (18-37). `EMPTY()` içinde `settings`, `tests` ve `sessions` alanları var (6-16). `read()` fonksiyonu `...base, ...parsed` ile birleştirdiği için (48-53) sonradan eklenen üst düzey alanlar eski kayıtlarda boş değerle başlar. Kayıt eklemek için `addSession()` kullanılıyor (84-89). Diğer anahtarlar `gozolcum:prefs`, `gozolcum:snake-opts` vb.

**Uygulama geneli mola (`src/App.jsx`):**
- `REST_AFTER_MS = 10 dk` (38), `REST_IDLE_RESET_MS = 5 dk` (42), `REST_SECONDS = 20` (43).
- `gatesOf(s).active/rest` değerleri modül manifestlerinden geliyor (47-48):
  - snake, track: `{gaze, rest, active}`
  - daily, weekly, reading: `{rest, active}`
  - blink, breath-count: `{active}`
  - routine: `{gaze, active}`
  - breath: `{}`
- `useActiveTime` (71-106) yalnızca aktif ekranda ve görünür durumda geçen süreyi toplar; `visibilitychange` olayını dinler (75-94). 5 dk boşluk sayacı sıfırlar (56-62). `RESTED_EVENT` gelince de sıfırlar (97-101).
- Kontrol **yalnız ekran geçişinde** yapılıyor: `go()` içinde `gates.rest && due >= REST_AFTER_MS` ise `setRestFor` çağrılıyor (119-137).
- Tam ekran `RestBreak`, "Atla" ve ✕ ile birlikte gösteriliyor (285-310). Sayaç yalnızca bellekte tutuluyor; **uygulama kapanınca kaybolur**.

**`components/RestBreak.jsx`:** 20 sn'lik sayaç var. TrueDepth varsa sayaç yalnızca uzağa bakarken ilerliyor (82-108). Kamera yoksa düz sayaca geçiyor (110-136). Sayaç `performance.now()` ile ölçülüyor, bu yüzden kalıcı değil. Bitince veya atlanınca `RESTED_EVENT` yayılıyor (25-33, 62-78). **Kod yorumları molanın bilinçli olarak zorunlu olmadığını söylüyor** (RestBreak.jsx:9-12, App.jsx:34-36): 20-20-20 kuralının etkisi kanıtlanamamış. Zorunlu kilit bu ilkeyle çelişiyor; bu bir ürün kararı olarak açıkça verilmeli.

**Kalıcı "rest-until" zamanı için:**
- Capacitor belgesine göre *"Local Storage … must be considered transient"*; iOS disk alanı azalınca bu veriyi silebilir (https://capacitorjs.com/docs/next/guides/storage, Context7 üzerinden okundu).
- `@capacitor/preferences` **8.0.1** (peer `>=8.0.0`) iOS'ta `UserDefaults` kullanır. API: `Preferences.set/get/remove({ key, value })`. Bu eklenti `PrivacyInfo.xcprivacy` içinde `NSPrivacyAccessedAPICategoryUserDefaults` / `CA92.1` bildirimi ister (npm README). Repoda `PrivacyInfo.xcprivacy` **yok**.
- **Öneri:** `restUntil` (epoch ms) değerini `Preferences`'a (native) ve `gozolcum:v1` içine (web yedeği) yaz. Açılışta ikisinden büyük olanı kullan.
- Kalan süre her zaman `restUntil - Date.now()` ile hesaplanmalı; `performance.now()` uygulama yeniden başlayınca sıfırlandığı için uygun değil.

**Oturum süresi verisi:** snake, track, routine ve breath kayıtlarında `seconds` alanı var (SnakeGame.jsx:595, Routine.jsx:442, Breath.jsx:81). **blink ve reading kayıtlarında süre alanı yok** (BlinkExercise.jsx:125-131, ReadingTest.jsx:131).

## B1. Animasyon yaklaşımı

Boyutlar npm tarball'larından yerelde `gzip -9` ile ölçüldü (bundlephobia'ya erişilemedi):

| Seçenek | JS (ham / gzip) | Ek yük |
|---|---|---|
| Inline SVG + CSS `@keyframes` | 0 | yok |
| `lottie-web` 5.13.0 `lottie.min.js` | 305,7 KB / 76,1 KB | `lottie_light.min.js` 168,4 / 46,4 KB; ayrıca AE→JSON dosyası |
| `@lottiefiles/dotlottie-web` 0.80.0 | 165,1 / 32,8 KB | `dotlottie-player.wasm` 1.238 / 496 KB |
| `@rive-app/canvas` 2.43.1 | 455,8 / 102,0 KB | `rive.wasm` 1.955 / 806 KB |
| `@rive-app/canvas-lite` 2.43.1 | 434,3 / 94,4 KB | `rive.wasm` 882 / 360 KB |

**Önerim: inline SVG + CSS keyframes.**
- Repoda aynı desen zaten var: `SnakeArt` (SnakeGame.jsx:303-323) inline SVG, renkler CSS sınıflarından geliyor ve tema ile uyumlu.
- Gereken içerik az: 6 sn'lik tek bir zaman çizelgesi, 4 yön, iki göz bebeği ve 10×6'lık mini tahta.
- Göz bebekleri `transform: translate()` ile hareket eder. Yılanın dönüşü göz bebeğinin kenara ulaştığı karede başlar. İki animasyon aynı süre (`6s`) ve aynı yüzde anahtarlarıyla eşlenir.
- Lottie ve Rive bir tasarım aracı, ek WASM/JS yükü ve bir çalışma zamanı getirir. Bu küçük döngü için fazla.
- **Erişilebilirlik:**
  - `@media (prefers-reduced-motion: reduce)`: `reduce` true, `no-preference` false döner (MDN, Context7 `/mdn/content`). Repoda bu kalıp zaten kullanılıyor (`styles/track.css:59`, `home.css:118`).
  - Hareket azaltılmışsa sürekli döngü yerine 4 sabit kare gösterilsin ("Sağa bak → yılan sağa döner"). Ya da hareket kaldırılıp yalnızca opaklık geçişi kullanılsın.
  - SVG'ye `role="img"` ve Türkçe `aria-label` eklenmeli.

## B2. Bakışla kontrol nasıl öğretiliyor

- **Google Look to Speak:** Kullanıcı sol sütun için *ekranın kenarının dışına* sola bakar, yukarı bakarak işlemi iptal eder. Kurulumda başını olabildiğince az oynatarak sola, sağa ve yukarı bakma pratiği yapar. Uygulamada bir öğretici, ipuçları ve hassasiyet ayarı var. Sayfalar engelliydi; bu bilgi yalnızca arama özetinden geliyor: https://blog.google/outreach-initiatives/accessibility/look-to-speak/ , https://www.pocket-lint.com/apps/news/google/160559-what-is-google-s-look-to-speak-app-and-how-does-it-work/ . Bizim metaforumuzun ("tahtanın dışına bak") birebir örneği.
- **Apple Eye Tracking (iOS 18):** Kalibrasyonda ekranda beliren noktayı gözle takip ediliyor. Özellik her açıldığında kalibrasyon tekrarlanıyor. Telefon sabit bir yüzeyde, yüzden yaklaşık 45 cm uzakta olmalı. Seçim "dwell" (bakışı tutma) ile yapılıyor. Kaynak yalnız arama özeti: https://support.apple.com/guide/iphone/control-iphone-with-the-movement-of-your-eyes-iph66057d0f6/ios
- **Tobii Eye Tracker 5:** Kalibrasyonda noktalar veri toplanınca kayboluyor, 2×3 noktadan sonra bitiyor (arama özeti): https://help.tobii.com/hc/en-us/articles/360003078874-Calibration-and-Recalibration-for-Eye-Tracker-5
- **NN/g:** Öğreticiler kullanıcıyı böler ve çabuk unutulur. Bağlama göre verilen yardım daha etkili. Öğretici kısa ve atlanabilir olmalı (arama özeti): https://www.nngroup.com/articles/onboarding-tutorials/
- **Sonuç olarak işe yarayan desen:**
  1. Kısa demo döngüsü: göster, anlatma.
  2. Canlı geri bildirimli pratik adımı: 4 yönün her birine bir kez bak, doğru yön yeşile dönsün.
  3. Oyun sırasında bağlamsal ipucu.
  4. Hepsi atlanabilir olsun ve yalnızca ilk seferde gösterilsin.

## B3. SnakeGame.jsx'te bakış kontrolü

- **Kontrol modu:** `control: 'eyes' | 'touch'` (416). Başlangıç değeri `loadSnakeOpts(trueDepth)` ile geliyor (414), seçim kaydediliyor (504, 542). Kamera açılamazsa dokunmaya geçiliyor (666-673).
- **Fazlar:** `intro | countdown | playing | paused | crashed | rest | over` (415). Kamera `countdown/playing/paused` fazlarında açık (65, 663).
- **Eşikler:**
  - `ENTER_DEG = 10` ve `EXIT_DEG = 6` (71-72), `createGazeReader`'a veriliyor (117-118). Gerekçe yorumda yazıyor: telefon ~30 cm'deyken tahta kenarı ≈ ±6–7°, yani dönmek için tahtanın dışına bakmak gerekiyor (68-70).
  - `GAZE_FULL_DEG = 20` (`lib/gaze.js:191`).
  - Dwell süresi `DWELL_MS = 220` (`lib/snake.js:179-182`); `input(dw.fire)` yalnızca `playing` fazında çağrılıyor (643-645).
- **Otomatik duraklatma ve devam:** `FACE_LOST_MS 600`, `EYES_CLOSED_MS 1200` ile oyun duraklıyor (73-74, 683-687). Bakış sabit kalınca otomatik devam ediyor (646-655). Geri sayım "Ekranın ortasına bak" diyerek nötr bakışı yeniden topluyor (467-470, 1040-1045).
- **Tahta kenar okları:** `showEdges` (1037). Oklar `--p` değişkeniyle dolum ilerlemesini gösteriyor (1168-1177).
- **"Bakışla kontrol" kartı:** `GazePanel` (371-409). Dört kenar, `ENTER_DEG` halkası, yönü gösteren ok ve canlı bakış noktası var. Varsayılan metin: "Dönmek için o yöne, tahtanın dışına bak" (374). Başlık 404. satırda. Kart `.snake-controls` içinde gösteriliyor (1181-1186).
- **Giriş ekranı:** 937-1029. Hero'da statik `SnakeArt` var (963). Gözle oynama anlatımında şu satır geçiyor: "Yılanı döndürmek için gözünle o yöne, tahtanın dışına doğru kısaca bak." (939-945)
- **Oyun içi mola:** `REST_AFTER_MS = 3 dk`, `REST_SEC = 20` (79-80). Oyun bitince `rest` fazına geçiliyor (600), `RestBreak` 922-933'te.
- **Kayıt:** `onFinish({ type:'game', game:'snake', score, seconds, best, control })` (595) → `modules/snake/view.jsx:14`.

## Önerilen uygulama

1. **Karar:** "Zorunlu kilit" mevcut kanıt ilkesiyle çelişiyor (A3). Ürün sahibi onaylarsa X ve Y ayarlanabilir olsun. Metin sağlık iddiası taşımasın ("konfor molası").
2. **Kurulum ve iOS ayarı:** `npm i @capacitor/local-notifications@^8.3.1 @capacitor/preferences@^8.0.1`, ardından `npx cap sync`. `ios/App/App/PrivacyInfo.xcprivacy` ekle (UserDefaults, CA92.1).
3. **`src/lib/restLock.js` (saf mantık + test):**
   - `getRestUntil()` ve `startLock(now, yMs)`: Preferences ile localStorage'a birlikte yazar.
   - `remaining(now)` ve `isLocked(now)`.
   - Kalan süre her zaman `Date.now()` ile hesaplanır.
4. **`native.js` sarmalayıcıları:** `getDeviceModel`'deki (18-22) gibi `isIOSApp()` kontrolü ve dinamik `import('@capacitor/local-notifications')` kullanılsın.
   - `scheduleRestEnd(at)`: `schedule({ notifications:[{ id: 7301, title:'Mola bitti', body:'Mola bitti, devam edebilirsin', schedule:{ at }, interruptionLevel:'active' }] })`
   - `cancelRestEnd()`: `cancel({ notifications:[{ id: 7301 }] })`
5. **İzin:** İlk kilit öncesinde kendi açıklama kartını göster, sonra `requestPermissions()` çağır. `display !== 'granted'` ise yalnızca uygulama içi geri sayım kullanılsın (4.5.4 ilkesi).
6. **`App.jsx`:**
   - `useActiveTime` korunsun.
   - Aktif ekrandayken periyodik kontrol eklensin: `read() >= X` olunca `startLock` çağrılıp `scheduleRestEnd` kurulsun.
   - `go()` içinde (119-137) `gatesOf(s).active && isLocked()` ise hedef ekran yerine `RestLock` ekranı gösterilsin.
   - Oyunun ortasında kesmek yerine `gozolcum:lock` olayı yayılsın; SnakeGame ve TrackGame turu bitirip (`endGame`) çıksın.
7. **`RestLock` bileşeni:** `RestBreak` halka görselini (153-185) yeniden kullanır ama "Atla" düğmesi yoktur. Kalan süre dk:sn olarak gösterilir. Gerçek süre `visibilitychange` sonrasında yeniden hesaplanır. Bitişte `RESTED_EVENT` yayılır ve `cancelRestEnd()` çağrılır.
8. **Bildirime dokunma:** `localNotificationActionPerformed` içinde `actionId === 'tap'` ise ana sayfa açılsın. Dinleyici uygulama başlarken bağlansın; olay bekletildiği için kaçmaz.
9. **Süre günlüğü:**
   - `EMPTY()` içine `activity: []` eklensin (storage.js:6-16). `useActiveTime`'ın `pause()` noktasında `{ route, startedAt, endedAt, activeMs }` yazılsın.
   - blink ve reading kayıtlarına `seconds` eklensin.
   - "Tüm verileri sil" bu alanı da temizlesin.
10. **`GazeTutorial.jsx` (inline SVG + CSS):**
    - Göz modundayken giriş ekranında `SnakeArt` (963) yerine gösterilsin.
    - Mini sürümü `GazePanel`'de `!ui.calibrated` iken metnin yanına eklensin.
    - İlk kez gösterildiği `gozolcum:snake-opts` içinde işaretlensin.
    - `prefers-reduced-motion` için statik kareler kullanılsın.
11. **İsteğe bağlı pratik adımı:** Mevcut `GazePanel` kenar dolumuyla 4 yön birer kez denensin. Yeni eşik eklenmesin; `ENTER_DEG`/dwell yeniden kullanılsın.

## Doğrulanamayanlar

- Time Sensitive entitlement anahtar dizesi `com.apple.developer.usernotifications.time-sensitive` yalnızca forum sayfasından geliyor (https://developer.apple.com/forums/thread/683630). Resmi entitlement sayfası 404 döndü: **doğrulanamadı**.
- iOS'ta bekleyen yerel bildirim sayısı sınırı (sıkça "64" deniyor): okunan Apple sayfalarında geçmiyor, **doğrulanamadı**. Bizim için tek bildirim yeterli.
- Kullanıcı uygulamayı zorla kapattığında (app switcher'dan kaydırma) bildirimin yine tetiklendiği: Apple metni yalnızca "isn't running" diyor, zorla kapatma açıkça yazılmıyor. Cihazda test edilmeli.
- Eklentinin web/PWA davranışı okunmadı, **doğrulanamadı**; `isIOSApp()` ile korunmalı.
- Look to Speak, Apple Eye Tracking, Tobii ve NN/g içerikleri sayfalar engelli olduğu için yalnızca arama özetlerinden alındı.
- Tabloda bundlephobia değerleri yok; oradaki sayılar yerelde gzip ile ölçüldü. Tree-shaking sonrası gerçek boyut **doğrulanamadı**.
- Uygulama adı: `capacitor.config.json`'da `appName: "Eyelume"`, `appId: com.sectil.eyelume` yazıyor, "EyeTrail" değil. Hangisinin kullanılacağı netleştirilmeli.
- Kullanıcı sistem saatini ileri alarak kilidi atlatabilir (`Date.now()`); bunun kabul edilebilir bir risk olduğu varsayıldı.
