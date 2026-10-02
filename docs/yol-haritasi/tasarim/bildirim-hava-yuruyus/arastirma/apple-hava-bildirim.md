# Hava bildirimi, ana sayfa hava satırı ve Apple'ın arka plan kuralları — araştırma (2026-09-30)

Kapsam: sahibinin iki isteği. (a) Ana sayfada adım satırının üstünde konum ve hava ("İzmir Gaziemir · 23°"); dokununca
ayrıntılı tahmin ve Nef'in yorumu. (b) İsteyene her gün hava bildirimi: alarm 06.00'daysa alarmdan sonraki ~10 dakika
içinde **güncel** hava ve Nef'in kısa yorumu ("bugün 21.00–22.00 arası yağmur bekleniyor" + bir cümle).

Bu belge önceki araştırmanın **üstüne** kurulur, onu tekrar etmez: `arastirma-v1/hava-ay.md` (WeatherKit seçimi, yaklaşık
konum, 81 il tablosu, yağmur bildirimi 7700/7701), plan `SONSUZ_YOL.PLAN.v1.md` §3.E, `S0/sorular-kararlar.md` (karar 10,
11, 12, 15, Ç3) ve `S0/app-review-sorusu.md`. Depoda uygulama dosyası değiştirilmedi.

Kural: Apple iddiaları, bu oturumda okunan resmî belge sayfasıyla verilir. Sayfa yolu `developer.apple.com/documentation/`
köküne göredir (ör. `alarmkit/alarmmanager/alarmconfiguration`); HIG sayfaları `developer.apple.com/design/…`. Okunan
JSON'ların kopyası `arastirma/apple-json/` klasöründedir. Belgede bulunamayan her şey "belgede yok" ya da **VARSAYIM**
diye işaretlidir.

---

## Sonuçlar (10 madde)

1. **iOS 26+ AlarmKit en güçlü yol, ama yalnız alarmı elle durduran kişi için.** `stopIntent` "the intent to execute when a
   person taps the stop button" ve `LiveActivityIntent` için Apple "the system launches your app process without opening
   the app, performs the intent" diyor. Yani alarm durdurulunca uygulama ön plana gelmeden Swift kodu çalışır; bu kodda
   WeatherKit isteği ve yeni yerel bildirim kurmak **belgeye göre yasak değil, ama açıkça anlatılmıyor da**. Süre sınırı
   belgede **yok** (VARSAYIM: 30 sn civarı; tasarım 10 sn'ye göre yapılmalı). İkinci düğme intent'i için "only available
   after first unlock". Kodda şu an `stopIntent` hiç verilmiyor (`AlarmPlugin.swift:143-148`).
2. **iOS 15–25'te (bildirimle alarm) alarm anında hiçbir kod çalışmaz.** Bildirim gelir; kişi dokunursa uygulama açılır,
   dokunmazsa hiçbir şey olmaz. "Kapat" hareketi bile güvenilir tetik değil: Apple, bildirimi yana kaydırmanın dismiss
   eylemini tetiklemediğini yazıyor.
3. **Arka plan yenilemesi (`BGAppRefreshTask`) yalnız "olursa iyi" katmanıdır.** Apple: tarih garantisi yok, gecikme "can be
   many hours", çalışma süresi "up to 30 seconds", Düşük Güç Modu'nda kapanır; kişi Ayarlar'dan kapatabilir. Zorla
   kapatılmış uygulama için belge bir şey söylemiyor (VARSAYIM: çalışmaz). 06.10 bildirimini buna bağlamak güvenilir değil.
4. **Push + Notification Service Extension teknik olarak "saatinde ve taze" veren tek yol, ama bedeli yüksek.** NSE yalnız
   `mutable-content: 1` ve görünür uyarısı olan **uzak** bildirimde çalışır, "no more than 30 seconds". Sunucu kişinin
   bildirim saatini (yani alarm/uyanma saatini) ve cihaz belirtecini bilmek zorunda kalır; APNs anahtarı (.p8) gerekir;
   Vercel'de dakika hassasiyetli zamanlayıcı yalnız Pro planda var. WeatherKit'in uzantıda kullanımı belgede yok
   (VARSAYIM: uzantının App ID'sinde ayrıca açılır). Öneri: şimdi yapılmasın.
5. **Önerilen birleşim (dürüst ve ucuz):** (i) Uygulamanın son açılışında yarının tahminiyle alarm+10 dk bildirimi kurulur,
   metin tahminin yaşını söyler; (ii) iOS 26+ ve AlarmKit alarmı olan kişide alarm durdurulunca Swift intent'i taze tahmini
   alıp **aynı kimlikle** bekleyen bildirimi değiştirir; (iii) isteğe bağlı `BGAppRefreshTask` alarmdan önce şansını dener;
   (iv) kişi uygulamayı bildirimden önce açarsa bildirim iptal edilir, bilgi uygulamada gösterilir. Push ikinci sürüme
   kalır.
6. **Tahminin yaşı her zaman yazılır.** WeatherKit her yanıtta isteğin anını verir (`WeatherMetadata.date`). Metin: 1 saatten
   taze ise ek yok; değilse "Dün akşam 22.40 tahminine göre…". 18 saatten eski tahminle bildirim kurulmaz (plan kuralı).
7. **Hava bildirimi `active` düzeyinde olmalı, `timeSensitive` değil.** HIG: Time Sensitive yalnız "an event that's happening
   now or will happen within an hour" için; 21.00 yağmuru sabah 06.10'da "bir saat içinde" değil. Kişi Time Sensitive'i
   kapatabilir. `active` bildirim Planlı Özet'e düşebilir; bu kabul edilir. Gruplama `threadIdentifier` ile, sıralama
   `relevanceScore` ile; üçü de Capacitor eklentisinde var (kaynak kodda doğrulandı).
8. **64 bekleyen bildirim sınırı** UserNotifications belgelerinde yok; yalnız eski (iOS 10'da kullanımdan kalkan)
   `UILocalNotification` sayfasında yazıyor: "the system keeps the soonest-firing 64 notifications". Hava bildirimi günde 1
   ekler; bugünkü en dolu plan ≈ 51'den 52'ye çıkar.
9. **Ana sayfa satırı "İzmir Gaziemir · 23°" iki karara takılıyor:** (1) S0 karar 10 ve plan §3.E.7: App Review cevabı
   gelene kadar başlıkta hava yok, yalnız ay (Apple kuralı "clearly display the Apple Weather trademark ( Weather), as well
   as the legal link to other data sources"). (2) İlçe adı: yaklaşık konum 1–20 km sapar; Gaziemir'in 20 km çevresinde 9
   ilçe merkezi var (GeoNames ile hesaplandı) → yaklaşık konumdan ilçe adı **güvenilir değil**.
10. **İlçe için en iyi yol ters coğrafi kodlama değil, seçim ya da tablo:** GeoNames Türkiye verisinde 974 ADM2 (ilçe)
    kaydı var, koordinatlı, lisansı **CC BY 4.0** (readme.txt'den doğrulandı). Konum izni olmadan "İl + ilçe seç" listesi
    hem kesin hem gizlidir; konumdan ilçe yalnız kesin konum izni verilmişse ve "(yaklaşık)" işaretiyle önerilmeli. Apple'ın
    ters coğrafi kodlaması koordinatı ikinci kez Apple'a gönderir; `CLGeocoder` iOS 26'da kullanımdan kalktı, yerine
    `MKReverseGeocodingRequest` geldi ve bunun Türkiye'de ilçe adını hangi alanda döndürdüğü belgede yok.

---

## 1. AlarmKit (iOS 26+): alarm durunca kod çalışır mı?

### 1.1 Apple ne diyor
| İddia | Alıntı | Sayfa |
|---|---|---|
| Yapılandırma iki intent alır | "You can pass in an optional secondary intent that the system executes when a person taps a secondary button. This is only available after first unlock." | `alarmkit/alarmmanager/alarmconfiguration` |
| Durdur düğmesi intent'i | `stopIntent`: "The intent to execute when a person taps the stop button." İmza: `stopIntent: (any LiveActivityIntent)? = nil, secondaryIntent: (any LiveActivityIntent)? = nil` | `alarmkit/alarmmanager/alarmconfiguration/alarm(schedule:attributes:stopintent:secondaryintent:sound:)` |
| Geri sayımlı yapılandırmada | `stopIntent`: "The intent to execute when a person stops the countdown." | `…/init(countdownduration:schedule:attributes:stopintent:secondaryintent:sound:)` |
| Düğmelere ek eylem | "You can add additional actions for each button type using App Intents, which you can configure using AlarmManager.AlarmConfiguration." Örnek kod: `stopIntent: StopIntent(alarmID: id.uuidString)` | `alarmkit/scheduling-an-alarm-with-alarmkit` |
| Intent uygulamayı açmadan çalışır | "When the system performs the intent, the system launches your app process without opening the app, performs the intent, and starts the Live Activity." | `appintents/liveactivityintent` |
| Ön plan/arka plan kipi (iOS 26) | `supportedModes`: "Specify `background` to run the action entirely in the background." | `appintents/appintent/supportedmodes` |
| `openAppWhenRun` eskidi | "This property is deprecated. Use `supportedModes` instead." | `appintents/appintent/openappwhenrun` |
| Ertele düğmesi | `.countdown`: "re-triggers the alarm after a certain TimeInterval, as specified in postAlert"; `.custom`: "displays an Open action to launch the app" | `alarmkit/scheduling-an-alarm-with-alarmkit` |
| Durdurma sonrası | Tekrarlayan alarm "rescheduled to alert … at the next scheduled time" | `alarmkit/alarmmanager/stop(id:)` |
| Geri sayım ve widget | "AlarmKit expects a widget extension if an app supports a countdown presentation. Otherwise, the system may unexpectedly dismiss alarms and fail to alert." | `alarmkit/scheduling-an-alarm-with-alarmkit` |

**Belgede olmayanlar:** intent'in çalışma süresi sınırı; intent içinde ağ isteğinin (WeatherKit) izinli ya da yasak
olduğu; alarm kişi dokunmadan kendiliğinden susarsa (zaman aşımı, Apple Watch'tan durdurma) `stopIntent`'in çalışıp
çalışmadığı; uygulama app switcher'dan kapatılmışsa intent'in yine çalışıp çalışmadığı (belge "launches your app process"
diyor; kapatılmış uygulama için ayrıca bir şey demiyor).

### 1.2 Bizim kod bugün
- Alarm, ertelemeli yolla kuruluyor: `AlarmConfiguration(countdownDuration:schedule:attributes:sound:)`, **stopIntent ve
  secondaryIntent yok** (`AlarmPlugin.swift:143-148`). Erteleme reddedilirse ikinci düğme `.custom` +
  `secondaryIntent: OpenNefonaIntent()` (`:155-166`).
- `OpenNefonaIntent: LiveActivityIntent`, `openAppWhenRun = true` (eskimiş özellik), `perform` yalnız
  `UserDefaults`'a an yazıyor (`AlarmPlugin.swift:1405-1412`). Yorumdaki "VARSAYIM: openAppWhenRun ile perform uygulama
  sürecinde çalışır" bu belgeyle **kısmen doğrulandı**: `LiveActivityIntent` uygulama sürecinde çalışır; `openAppWhenRun`
  eskidi, yerine `supportedModes` önerilir.
- Kodda widget uzantısı yok (`App.xcodeproj/project.pbxproj`'da tek hedef: `com.apple.product-type.application`), ama ertele
  düğmesi `AlarmPresentation(alert:countdown:)` ile geri sayım sunumu kullanıyor. Apple'ın yukarıdaki uyarısına göre bu,
  alarmın "unexpectedly dismiss" edilmesi riskini taşır. **Bu, hava işinden bağımsız, önemli bir yan bulgu** (§9).

### 1.3 Bizim için sonuç: "alarmdan 10 dk sonra güncel hava" nasıl olur
1. Alarm kurulurken `stopIntent: NefonaWakeIntent()` verilir (`LiveActivityIntent`, `supportedModes = .background`).
2. `perform()` Swift'te şunu yapar: (a) bugün bu iş yapıldıysa çık (erteleme sonrası ikinci durdurma da tetikler);
   (b) kişi hava bildirimini açtıysa, kayıtlı il/ilçe merkez koordinatıyla (ya da son yuvarlanmış koordinatla, §8)
   `WeatherService.shared.weather(for:including: .hourly, .daily)` çağırır; (c) kendi zaman sınırı ~8 sn; (d) başarılıysa
   bekleyen hava bildirimini **aynı kimlikle** yeniden kurar ("If the identifier matches a pending request, the new request
   replaces the pending request." — `usernotifications/unnotificationrequest/init(identifier:content:trigger:)`), tetik
   `UNTimeIntervalNotificationTrigger` ile 2–10 dk sonra; (e) başarısızsa hiçbir şey yapmaz, akşam kurulmuş yedek bildirim
   yerinde kalır.
3. **WebView bu anda yoktur (VARSAYIM):** uygulama arka planda başlatıldığında sahne bağlanmaz, Capacitor'ın JS'i çalışmaz.
   Bu yüzden eşik, metin şablonları ve Nef cümleleri JS tarafından önceden hesaplanıp `UserDefaults`'a "reçete" olarak
   yazılır; Swift yalnız sayıları doldurur.
4. **Konum bu anda alınmaz:** "Uygulamayı Kullanırken" izniyle arka planda konum alınmaz (Apple: "the system suspends the
   execution of most apps … and don't receive location updates", `corelocation/handling-location-updates-in-the-background`).
   Bu zaten istenmiyor; kayıtlı il/ilçe merkezinin koordinatı (herkese açık tablo verisi) kullanılır.
5. **Kimlik çakışması:** `notifyApply.js` kendi aralığındaki bekleyen bildirimi, gelen planda yoksa iptal eder; `same()`
   başlık/gövde farklıysa JS kendi eski metnini yeniden kurar (`notifyApply.js:40-45`). Swift'in taze metni bir sonraki JS
   planlamasında **eski metinle ezilebilir.** Çözüm: Swift yenilediğinde `UserDefaults`'a "yerelde yenilendi: tarih, an"
   yazar; JS planı o gün için 7700'ü bekleyen hâliyle bırakır. Test gerekir.

### 1.4 Risk
- Yalnız iOS 26+, AlarmKit izni verilmiş, alarmı açık ve **düğmeye dokunarak** durduran kişide çalışır.
- Süre sınırı belgede yok; ağ yavaşsa taze veri gelmeyebilir → yedek bildirim.
- App Review 2.5.4: "Multitasking apps may only use background services for their intended purposes" (`arastirma-v1/apple/guidelines.html:1317`).
  Alarm durdurulunca kişinin açıkça istediği sabah bilgisini hazırlamak amaca uygun görünür, ama bu **VARSAYIM**; aynı
  gerekçeyle HealthKit arka plan uyandırmasını (WalkGuard) hava için kullanmak **önerilmez**.
- Erteleme (`.countdown`) sırasında `secondaryIntent` verilmedikçe kod çalışmaz; iş `stopIntent`'e bağlanmalı.

### 1.5 iOS 15–25: alarm bildirimle kurulu (`alarmNative.js` 7600–7607)
- Alarm, `timeSensitive` yerel bildirimdir (`alarmNative.js:50-55`). Bildirim gelince uygulama kodu çalışmaz.
- Kişi bildirime dokunursa uygulama ön plana gelir → plan yenilenir, hava taze alınır, bekleyen hava bildirimi iptal edilip
  bilgi uygulamada gösterilir (HIG: ön plandaki uygulama bildirim göstermez, bilgiyi ekranda "discoverable but not
  distracting" sunar — `design/human-interface-guidelines/notifications`).
- Bildirime eylem düğmesi eklemek (§6.3) kişi dokunursa uygulamayı arka planda başlatır ("When the user selects an action, the
  system launches your app in the background" — `usernotifications/handling-notifications-and-notification-related-actions`),
  ama Capacitor bu olayı JS'e iletir (`retainUntilConsumed: true`, eklenti kaynağı `LocalNotificationsHandler.swift:98`);
  JS arka planda çalışmadığı için (VARSAYIM) iş ancak yerel Swift temsilcisiyle yapılır ve Capacitor'ın bildirim
  temsilcisini paylaşmak gerekir → karmaşık, önerilmez.
- "Kapat"a (yana kaydırma) güvenilmez: "Ignoring a notification or flicking away a notification banner doesn't trigger this
  action." (`usernotifications/unnotificationdismissactionidentifier`).
- **Sonuç:** iOS 15–25'te hava bildirimi yalnız akşam kurulan (yaşı yazılı) metinle gelir; taze veri yalnız kişi uygulamayı
  açınca.

---

## 2. Arka plan yenilemesi: `BGAppRefreshTask` ve `BGProcessingTask`

### 2.1 Apple ne diyor
| İddia | Alıntı | Sayfa |
|---|---|---|
| Zaman garantisi yok | "the system doesn't guarantee launching the task at the specified date, but only that it won't begin sooner." | `backgroundtasks/bgtaskrequest/earliestbegindate` |
| Gecikme saatlerce olabilir | "The delay between the time you schedule a background task and when the system launches your app to run the task can be many hours." | `backgroundtasks/starting-and-terminating-tasks-during-development` |
| Süre | "The system decides the best time to launch your background task, and provides your app up to 30 seconds of background runtime." | `choosing-background-strategies-for-your-app` (kopya: `arastirma-v1/bgchoose.json`) |
| Kip | "Executing app refresh tasks requires setting the `fetch` UIBackgroundModes capability." | `backgroundtasks/bgapprefreshtask` |
| İzin listesi | Kimlik `BGTaskSchedulerPermittedIdentifiers`'da değilse `register` false döner; "Registration of all launch handlers must be complete before the end of applicationDidFinishLaunching(_:)"; aynı kimliği iki kez kaydetmek: "The system kills the app" | `backgroundtasks/bgtaskscheduler/register(fortaskwithidentifier:using:launchhandler:)` |
| Sayı | "There can be a total of 1 refresh task and 10 processing tasks scheduled at any time." | `backgroundtasks/bgtaskscheduler/submit(_:)` |
| Düşük Güç | "Background App Refresh is disabled automatically when a device is operating in low-power mode." | `uikit/uiapplication/backgroundrefreshstatus` |
| Kişi kapatabilir | `UIBackgroundRefreshStatus`: `restricted`, `denied`, `available` | `uikit/uibackgroundrefreshstatus` |
| İşleme görevi | "Processing tasks run only when the device is idle. The system terminates any background processing tasks running when the user starts using the device." `processing` kipi gerekir | `backgroundtasks/bgprocessingtask` |
| Uzantı | "An extension can schedule a task, but your main app must register the task." | `uikit/using-background-tasks-to-update-your-app` |

**Belgede olmayan:** kişi uygulamayı app switcher'dan kapatınca yenileme görevinin çalışıp çalışmadığı. Sessiz push için
Apple bunu açıkça yazıyor (§3.1); `BGAppRefreshTask` için bu oturumda okunan sayfalarda yok → **VARSAYIM: çalışmaz ya da
çok seyrek çalışır.** Sistemin görevi kişinin kullanım alışkanlığına göre zamanladığı da bu sayfalarda yazmıyor (yaygın
bilgi, VARSAYIM).

### 2.2 Sonuç
- 05.30'da tahmin alıp 06.10 bildirimini kurmak **güvenilir değil**: ne zaman, hatta o gece çalışıp çalışmayacağı belli
  değil. Kazanç yalnız "olursa daha taze".
- `BGProcessingTask` bu iş için uygun değil: cihaz boştayken ve genellikle uzun iş için; kişi telefonu eline alınca
  sonlandırılır.
- Yapılırsa gerekenler: `Info.plist`'e `UIBackgroundModes` → `fetch` ve `BGTaskSchedulerPermittedIdentifiers` →
  `com.…nefona.weather-refresh` (ad önerisi); `AppDelegate`'te kayıt; `earliestBeginDate = alarm − 60 dk`. Görev yalnız
  bekleyen 7700'ü değiştirir, JS'e dokunmaz (aynı kimlik sorunu §1.3/5).
- `BGTaskSchedulerPermittedIdentifiers` eklemek eski `performFetchWithCompletionHandler`'ı kapatır
  (`uikit/using-background-tasks-to-update-your-app`); uygulamada zaten kullanılmıyor (Swift aramasında yok).

---

## 3. Push seçenekleri

### 3.1 Apple ne diyor
| İddia | Alıntı | Sayfa |
|---|---|---|
| NSE yalnız uzak bildirimde | "lets you customize the content of a remote notification before the system delivers it"; koşullar: uygulama uyarı göstermeye ayarlı **ve** "`mutable-content` key with the value set to `1`"; "You can't modify silent notifications or those that only play a sound or badge" | `usernotifications/unnotificationserviceextension` |
| Uyarı kapalıysa çalışmaz | "If alerts are disabled for your app, or if the payload specifies only the playing of a sound or the badging of an icon, the extension isn't employed." | `usernotifications/modifying-content-in-newly-delivered-notifications` |
| Süre | "Your extension has a limited amount of time (no more than 30 seconds)…"; süre dolarsa `serviceExtensionTimeWillExpire()`; dönmezse "the system presents the notification's original content" | `usernotifications/unnotificationserviceextension/didreceive(_:withcontenthandler:)` |
| Cihaz verisiyle güncelleme meşru | "Update the notification's content, perhaps by incorporating data from the user's device." | `usernotifications/modifying-content-in-newly-delivered-notifications` |
| Yerel bildirimde NSE yok | `add(_:)`: "This method schedules local notifications only" — NSE'nin yerel bildirimde çalıştığına dair belge yok; belge yalnız "remote" diyor | `usernotifications/unusernotificationcenter/add(_:withcompletionhandler:)` |
| Sessiz push güvenilmez | "the system doesn't guarantee their delivery … don't try to send more than two or three per hour." "If something force quits or kills the app, the system discards the held notification." Süre 30 sn | `usernotifications/pushing-background-updates-to-your-app` |
| Zorla kapatılan uygulama | "the system does not automatically launch your app if the user has force-quit it" | `uikit/uiapplicationdelegate/application(_:didreceiveremotenotification:fetchcompletionhandler:)` |
| APNs "en iyi çaba" | "As a best-effort service, APNs may reorder notifications…"; `apns-priority 10` "send the notification immediately"; `apns-expiration` | `usernotifications/sending-notification-requests-to-apns` |
| Anahtar | Belirteç tabanlı bağlantı `.p8` imzalama anahtarı ister; belirteç "no more than once every 20 minutes and no less than once every 60 minutes" yenilenir | `usernotifications/establishing-a-token-based-connection-to-apns` |
| Yük alanları | `thread-id`, `interruption-level` ("passive", "active", "time-sensitive", "critical"), `relevance-score`, `mutable-content` | `usernotifications/generating-a-remote-notification` |

### 3.2 "Sunucu zamanlar, NSE telefonda WeatherKit'i çağırır" fikri
- **Olur mu:** Belgeye göre NSE 30 sn içinde içeriği cihaz verisiyle değiştirebilir. Sunucu yalnız "hava zamanı" diye boş
  bir uyarı (ör. "Günün havası hazırlanıyor") gönderir; konum sunucuya gitmez; NSE App Group'taki il/ilçe koordinatıyla
  WeatherKit'i çağırır ve metni yazar. Zaman aşımında yedek metin ("Havaya bakmak için dokun") görünür.
- **WeatherKit NSE'de:** WeatherKit yetkisi belgesi yalnız "enable the WeatherKit capability in Xcode" diyor
  (`bundleresources/entitlements/com.apple.developer.weatherkit`); hesap yardım sayfası App ID'de WeatherKit servisinin
  açılmasını anlatıyor (`developer.apple.com/help/account/configure-app-services/weatherkit/`). Uzantılarda kullanım
  **belgede yok**. VARSAYIM: uzantının kendi App ID'sinde WeatherKit açılır ve yetki uzantıya da eklenir; NSE'nin bellek
  sınırı bu oturumda **bakılmadı**.
- **Gerekenler:** APNs anahtarı (.p8) **gerekir** (yalnız ortam değişkeninde, sunucuda); `aps-environment` yetkisi (bugün
  `App.entitlements`'ta yok); push eklentisi ya da yerel kayıt kodu; NSE hedefi; App Group; sunucuda cihaz belirteci +
  kişinin bildirim saati + saat dilimi tablosu (Supabase); dakikalık zamanlayıcı.
- **Vercel:** Hobby planda cron "once per day" ve "Per-hour (±59 min)" hassasiyet; dakikalık cron Pro planda
  (`vercel.com/docs/cron-jobs/usage-and-pricing`, kopya `apple-json/vercel_cron-usage-and-pricing.md`). Projenin hangi
  planda olduğuna **bakılmadı**.
- **Gizlilik bedeli:** sunucu kişinin her sabahki bildirim saatini, dolayısıyla uyanma saatini bilir. Bu, bugünkü
  "konum/alarm sunucuya gitmez" çizgisini değiştirir; rıza metni, gizlilik sayfası ve App Store etiketi değişir. App Review
  4.5.4: "Push Notifications must not be required for the app to function" (`guidelines.html:1515`).

### 3.3 Sonuç ve risk
- En "saatinde + taze" yol budur (alarmı olmayanlar ve iOS 15–25 için de çalışır), ama ilk sürüm için pahalı: sunucu işi,
  anahtar yönetimi, uzantı hedefi, gizlilik metni, belki ücretli Vercel planı.
- Sessiz push (`content-available`) bu iş için **uygun değil**: teslim garantisi yok, zorla kapatılmış uygulamada atılıyor.
- Öneri: ikinci sürüm; önce (i)+(ii) katmanlarının sahadaki başarısı ölçülsün (§4.3).

---

## 4. Çok katmanlı tasarım

### 4.1 Katmanlar ve gerçek güvenilirlikleri
| Katman | Ne yapar | Kime çalışır | Güvenilirlik (belgeye göre) | Maliyet |
|---|---|---|---|---|
| (i) Son açılışta kur | Yarının saatlik tahminiyle alarm+10 dk'ya 7700 kurar; metin tahminin yaşını söyler | Herkes (izin + hava açık) | Bildirim **kesin gelir**; veri 8–18 saat eski olabilir | Düşük; plan §3.E.6 zaten bunu öneriyor |
| (ii) AlarmKit `stopIntent` | Alarm durdurulunca taze tahminle 7700'ü değiştirir | iOS 26+, AlarmKit alarmı, düğmeyle durduran | Tetik belgede var; ağ süresi ve kapatılmış uygulama belgede yok | Orta: Swift intent + reçete + test |
| (iii) `BGAppRefreshTask` | Alarmdan ~1 saat önce şansını dener | Arka plan yenilemesi açık, Düşük Güç kapalı | Garanti yok, "many hours" gecikebilir | Düşük–orta |
| (iv) Açılışta iptal | Kişi bildirimden önce açarsa 7700 iptal, bilgi uygulamada | Herkes | Kesin | Düşük |
| (v) Push + NSE | Sunucu saatinde gönderir, NSE taze yazar | Herkes (push izni) | APNs "best-effort"; NSE 30 sn | Yüksek |

### 4.2 Önerilen birleşim
**(i) + (ii) + (iv)**, isteğe bağlı (iii). Push (v) ikinci sürüm. Gerekçe: (i) bildirimin geleceğini garanti eder, (ii)
en çok kullanılan yolda (alarmı iOS 26'da AlarmKit ile olan kişi) tazeliği ücretsiz getirir, (iv) çift bilgiyi önler.

Ayrıntı:
- **Saat:** alarm varsa alarm + 10 dk (sahibinin isteği); plan §3.E.6'daki "alarm + 15 dk" yerine. Alarm yoksa kişinin
  seçtiği saat (varsayılan 07:30, VARSAYIM). AlarmKit ertelemesi 9 dk (`AlarmPlugin.swift`, `snoozeSeconds` = 9 dk, :67): alarm+10 dk
  ertelemeyle çakışabilir → (ii) yolunda bildirim durdurma anına göre kurulur (durdurma + 2–5 dk), (i) yedeği ise durdurma
  olunca iptal edilip yenisiyle değiştirilir.
- **Bir kez:** gün başına tek kimlik (7700 bugün, 7701 yarın; plan). Erteleme sonrası ikinci durdurma yeni bildirim
  kurmaz.
- **Nef'in yorumu:** Plan §3.E.1 "Nef hava verisi üretmez" kararı korunur: sayılar WeatherKit'ten, cümle telefondaki
  şablondan (Nef'in sesiyle yazılmış 20–30 değişken cümle). Arka plandaki Swift intent'inde sunucuya (Nef'e) istek atmak hem
  süreyi zorlar hem hava verisini sunucuya taşır (rıza değişir, plan A2). Seçenek: iOS 26 Foundation Models (cihaz üstü
  dil modeli) "To use Apple Foundation Models, people need a device that supports Apple Intelligence" (`foundationmodels`);
  Türkçe desteği bu oturumda **bakılmadı** → şimdilik şablon.

### 4.3 Ölçülmesi gereken
Her sabah telefonda: 7700 hangi katmanla son hâlini aldı (akşam / intent / arka plan / açılış), tahminin yaşı dakika olarak.
Bu sayaç yalnız telefonda tutulur (plan G8 sayaçları gibi). 30 günde (ii)'nin payı düşükse push (v) değerlendirilir.

### 4.4 Tahminin yaşı metinde nasıl söylenir
- Yaşın kaynağı: `WeatherMetadata.date` — "The time of the weather data request." (`weatherkit/weathermetadata/date`);
  `expirationDate` — "The time the weather data expires." (`weatherkit/weathermetadata/expirationdate`). Bildirim,
  `expirationDate` geçmiş veriyle kuruluyorsa metin mutlaka yaş söyler.
- Kurallar (VARSAYIM, sahada ayarlanır):
  - < 1 saat: ek yok. "Bugün 21.00–22.00 arası yağmur bekleniyor (%70)."
  - Aynı gün, ≥ 1 saat: "Sabah 05.40 tahminine göre…"
  - Önceki akşam: "Dün akşam 22.40 tahminine göre…"
  - ≥ 18 saat: bildirim kurulmaz (plan).
- Örnek (taze, alarm sonrası):
  - Başlık: "Bugün akşam yağmur var"
  - Gövde: "21.00–22.00 arası yağmur olasılığı %70; gündüz 23°. Şemsiye akşama kalsın, sabah yürüyüşü kuru. Kaynak: Apple Weather"
- Örnek (yedek, akşam kurulmuş): "Dün akşam 22.40 tahminine göre 21.00–22.00 arası yağmur olasılığı %70. Güncelini görmek
  için dokun. Kaynak: Apple Weather"
- HIG: "Provide concise, informative notifications" ve "Avoid sending multiple notifications for the same thing"
  (`design/human-interface-guidelines/notifications`) → günde tek hava bildirimi, yağmur bildirimiyle **birleşik**
  (ayrı yağmur bildirimi değil; yağmur yoksa "Bugün yağış beklenmiyor, en yüksek 24°").

---

## 5. Bildirim düzeyleri, özet, gruplama, sınır

### 5.1 Apple ne diyor
| Düzey | Alıntı | Sayfa |
|---|---|---|
| passive | "adds the notification to the notification list without lighting up the screen or playing a sound." | `usernotifications/unnotificationinterruptionlevel/passive` |
| active | "presents the notification immediately, lights up the screen, and can play a sound." "This is the default interruption level. Active notifications won't break through system notification controls." | `…/active` |
| timeSensitive | "…can break through system controls such as Notification Summary and Focus. The user can turn off the ability for time sensitive notification interruptions." | `…/timesensitive` |
| critical | "requires an approved entitlement" | `…/critical` |

HIG tablosu (`design/human-interface-guidelines/managing-notifications`): Passive ve Active planlı teslimi (özet) ve Odak'ı
**aşmaz**; Time Sensitive ikisini aşar, sessiz düğmesini aşmaz; Critical hepsini aşar. Önemli cümleler:
- "Use the Time Sensitive interruption level only for notifications that are relevant in the moment … make sure the
  notification is about an event that's happening now or will happen within an hour."
- "The first time a Time Sensitive notification arrives from your app, the system describes how such a notification works
  and gives people a way to turn it off…"
- "Build trust by accurately representing the urgency of each notification."

Gruplama ve özet:
- `threadIdentifier`: "assign the same thread identifier string to all notifications that you want to group together
  visually." (`usernotifications/unmutablenotificationcontent/threadidentifier`)
- `relevanceScore`: "a value between 0 and 1, to sort the notifications from your app. The highest score gets featured in
  the notification summary." (`usernotifications/unmutablenotificationcontent/relevancescore`)
- `summaryArgument` iOS 15+'ta yok sayılır (Capacitor tanımı: "@deprecated Use relevanceScore instead. This property is
  ignored on iOS 15+").
- Aynı kimlik: "If the identifier matches a previously delivered notification, the system alerts the user again, replaces
  the old notification with the new one…" (`usernotifications/unnotificationrequest/init(identifier:content:trigger:)`) →
  gelmiş bildirimi güncellemek kişiyi **yeniden uyarır**; teslimden sonra düzeltme yapılmamalı.

Bekleyen bildirim sınırı: UserNotifications sayfalarında (`add`, `getPendingNotificationRequests`,
`scheduling-a-notification-locally-from-your-app`) sayı yok. Yalnız `uikit/uilocalnotification` (kullanımdan kalkmış):
"An app can have only a limited number of scheduled notifications; the system keeps the soonest-firing 64 notifications
(with automatically rescheduled notifications counting as a single notification) and discards the rest." Güncel API için
geçerliliği **VARSAYIM**.

### 5.2 Bizim için öneri
| Bildirim | Düzey | Gerekçe |
|---|---|---|
| Alarm yedeği (iOS 15–25, 7600–7607) | timeSensitive (bugünkü, `alarmNative.js:51`) | "şimdi olan olay"; doğru |
| Çalışma oturumu molası (7500–7509) | timeSensitive (bugünkü, `notifyPlan.js:204`) | "şimdi"; uygun, ama kişi kapatabilir |
| Sabah hava bildirimi (7700/7701) | **active** | yağmur saatler sonra; HIG "within an hour" koşulu yok |
| Yürüyüş, su, nefes, mola hatırlatmaları | active (bugünkü) | davranış hatırlatması; acil değil |
| "Sessiz hava özeti" seçeneği (isteğe bağlı) | passive | ekranı yakmaz, yalnız listede |

- `threadIdentifier`: `hava`, `hatirlatma`, `alarm`, `calisma` (kilit ekranında ayrı yığınlar). Capacitor eklentisi
  destekliyor (`LocalNotificationsPlugin.swift:443-445`); bugünkü `toLN` bu alanı göndermiyor (`notifyApply.js:47-54`).
- `relevanceScore`: hava 0,8; hatırlatmalar 0,3–0,5 (VARSAYIM) — özet açık kişide hava öne çıkar. Eklentide var (`:453-455`).
- "Üst üste binmesin": (1) hava bildirimi alarm+10'da, hatırlatma penceresi 09:00'da başlıyor (`reminders.js:16`) → çakışmaz;
  (2) aynı gün tek hava bildirimi; (3) ayrı yığın; (4) kişi uygulamadaysa bildirim yerine ekranda.
- Planlı Özet açık kişide `active` hava bildirimi özete düşer ve 06.10'da görünmez. Bu kabul edilmeli; `timeSensitive`
  yapmak HIG'e aykırı olur ve kişi "Time Sensitive"ı kapatınca kazanç da kalmaz. Kişinin özet ayarı
  `UNNotificationSettings.scheduledDeliverySetting` ile okunabilir (`usernotifications/unnotificationsettings/scheduleddeliverysetting`);
  Capacitor bunu vermiyor → gerekirse ayar ekranında "Bildirim özeti açıksa hava özette gelir" notu için yerel okuma.

---

## 6. İzin türleri ve eylem düğmeleri

### 6.1 Provisional
- "The system delivers provisional notifications quietly — they don't interrupt the person with a sound or banner, or
  appear on the lock screen. Instead, they only appear in the notification center's history." Kişi "Keep"/"Turn Off" seçer
  (`usernotifications/asking-permission-to-use-notifications`).
- Sonuç: sabah havası kilit ekranında görünmezse amacı kaybolur → hava için **önerilmez**. Ayrıca Capacitor eklentisi izni
  yalnız `[.badge, .alert, .sound]` ile istiyor (`LocalNotificationsHandler.swift:14`), `provisional` seçeneği yok; yerel
  kod gerekir. Eklenti `provisional` durumunu "granted" sayar (`LocalNotificationsPlugin.swift:250`).

### 6.2 İzin isteme zamanı
- "Make the request in a context that helps people understand why your app needs authorization … better experience than
  automatically requesting authorization on first launch" (aynı sayfa).
- Uygulama zaten böyle yapıyor (hatırlatma kartına 'yes' denince; alarm "Kur"a dokununca, `alarmNative.js:87-88`). Hava
  bildirimi teklifi ilk yağmurlu günde kartta (plan §3.E.6) kalır.

### 6.3 Eylem düğmeleri Capacitor ile
- **Mümkün:** `registerActionTypes({ types: [{ id, actions: [{ id, title, foreground?, destructive?, requiresAuthentication? }] }] })`
  → `UNNotificationCategory` + `UNNotificationAction`; bildirimde `actionTypeId` (eklenti kaynağı
  `LocalNotificationsPlugin.swift:386-395, 644-738`).
- **Dikkat:** `registerActionTypes` her çağrıda `setNotificationCategories` ile **tüm** kategorileri değiştirir (`:678`);
  başka yerel kod kategori kaydederse silinir.
- Eylem dokunuşu JS'e `localNotificationActionPerformed` olayıyla, `retainUntilConsumed: true` ile gelir
  (`LocalNotificationsHandler.swift:98`) → arka planda başlatılan uygulamada JS çalışmıyorsa (VARSAYIM) olay bir sonraki
  açılışta işlenir.
- HIG: "Avoid providing an action that merely opens your app." ve en çok dört düğme (`design/human-interface-guidelines/notifications`).
- Hava bildirimine uygun tek eylem: "Yarın gönderme" (bir günlük susturma; JS açılışta işler) — bir sonraki açılışa kadar
  7701 zaten kurulu olabileceği için etkisi gecikir. **Öneri: ilk sürümde eylem yok**; ayar ekranı yeter.

---

## 7. WeatherKit ekleri (önceki araştırmanın eksikleri)

### 7.1 Veri
- Saatlik yağış: `HourWeather.precipitationChance` (0–1) ve `precipitationAmount` ("liquid equivalent of all precipitation
  amounts" — `weatherkit/hourweather/precipitationamount`); ikisi iOS 16. Türkiye'de saatlik tahmin var, dakikalık yok
  (önceki araştırma, Apple Destek 105038).
- Aralık: `hourly(startDate:endDate:)` — "Forecasts are available up to 10 days (~240 hours) in the future." (`weatherkit/weatherquery/hourly(startdate:enddate:)`)
- Günlük özet (iOS 18+): `DayWeather.daytimeForecast` "from 7AM - 7PM", `overnightForecast`, `restOfDayForecast` "from now
  until midnight local time … only available for the current day" (`weatherkit/dayweather/…`); `DayPartForecast` içinde
  `precipitationChance`, `precipitationAmountByType`, sıcaklıklar (`weatherkit/daypartforecast`). iOS 16–17'de yalnız
  günlük toplam + saatlik liste → "21.00–22.00" aralığı saatlik listeden hesaplanır (iki yolda aynı yöntem önerilir).
- Uygulamanın alt sınırı iOS 15; WeatherKit iOS 16 ister (önceki araştırma). AlarmKit yolu iOS 26 olduğu için orada sorun yok.

### 7.2 Atıf
- Kural (get-started, 30.09.2026 okundu): "If your apps … display any weather data from Apple (other than weather alerts or
  value-added services or products …), you must clearly display the Apple Weather trademark ( Weather), as well as the
  legal link to other data sources."
- "Value-added" istisnası: veri "transformed so that no user or other third party can discover … the original weather data"
  olursa atıf " Weather" + "data … has been modified" notudur. "21.00–22.00 arası %70" ham veriyi açık eder → istisna
  **uygulanmaz**. Nef'in yorumu tek başına (sayısız, "akşama şemsiye") belki "value-added" sayılır — **VARSAYIM**, App
  Review'a sorulacak sorulara eklenebilir.
- `legalAttributionText`: "should be made available to users for apps that cannot display the attributionURL contents in a
  Safari view" (`weatherkit/weatherattribution/legalattributiontext`, iOS 16.4).
- Bildirimde atıf: S0 karar 15 → gövde sonu "Kaynak: Apple Weather"; bildirim `legalPageURL` bağlantısı taşıyamaz,
  dokununca atıflı kart açılır. Kuralın bildirime uygulanışı belgede **yok**; App Review sorusu (`S0/app-review-sorusu.md`)
  bunu zaten soruyor.
- **Ana sayfa satırı:** sahibinin istediği "İzmir Gaziemir · 23°", S0 karar 10 ve plan §3.E.7 ile **çelişir** (başlıkta
  App Review cevabına kadar yalnız ay). Seçenekler: (A) karar korunur, satır "İzmir Gaziemir · ☾ küçülen ay" + hava kartı
  ilk ekranda; (B) satırın sonuna marka ve bağlantı eklenir (" Weather" işareti + "Veri kaynakları"), tek satıra sığmaz,
  320 pt'de iki satır olur; (C) App Review görüşmesi (S0 notu: 30 dk görüntülü görüşme yolu). Öneri: (C), beklerken (A).

### 7.3 Uzantılarda kullanım
- App Intent (§1) ayrı uzantı değil, **uygulama sürecinde** çalışır → uygulamanın WeatherKit yetkisi yeterli (VARSAYIM:
  aynı süreç, aynı imza).
- NSE ve widget ayrı pakettir; WeatherKit'in uzantıda kullanımı **belgede yok** (§3.2).

### 7.4 İstek sınırları ve maliyet
- Ayda 500.000 çağrı üyelikte; üst basamaklar 1 M 49,99 $, 2 M 99,99 $, 5 M 249,99 $… (get-started, 30.09.2026).
- Yeni akışlar kişi başına günde en çok +1 (intent) ve +1 (arka plan) istek ekler. 10.000 kişide +300.000–600.000
  istek/ay; tek istekte birden çok veri kümesinin kaç çağrı sayıldığı hâlâ **belgede yok** (önceki araştırmanın VARSAYIM'ı).
  Plan'ın "kişi başına günde 8 istek" sınırı bu iki isteği de saymalı.
- `WeatherService.init()`: ayrı örnekler "to separate out high-priority and low-priority requests for performance"
  (`weatherkit/weatherservice/init()`) — arka plan istekleri için ayrı örnek kullanılabilir.
- Hata türleri yalnız `permissionDenied` ve `unknown` (`weatherkit/weathererror`) → kota aşımı ayrı bir türle gelmiyor;
  "15 dk bekle" kuralı genel hata için uygulanır.

---

## 8. Konum: "İzmir Gaziemir" gibi ilçe adı

### 8.1 Apple'ın ters coğrafi kodlaması
- `CLGeocoder` iOS 26'da **kullanımdan kalktı** (JSON meta: `deprecatedAt: 26.0`, `corelocation/clgeocoder`); `CLPlacemark`
  için `deprecatedAt: 27.2`. Yerine `MKReverseGeocodingRequest` (iOS 26): "looks up address strings for the provided
  geographic coordinates" (`mapkit/mkreversegeocodingrequest`); sonuç `MKMapItem`, adres parçaları
  `MKAddressRepresentations`: `cityName`, `cityWithContext`, `regionName` (`mapkit/mkaddressrepresentations`). **İlçe
  (subadministrative) için ayrı alan yok**; Türkiye'de `cityName`'in ilçe mi il mi döndürdüğü belgede yok (**bakılmadı**,
  cihazda denenmeli).
- Eski `CLPlacemark.subAdministrativeArea`: "typically correspond to counties" (`corelocation/clplacemark/subadministrativearea`).
- Ağ ve sınır: "a network-based service"; "Geocoding requests are rate-limited for each app"; "Do not start a geocoding
  request at a time when the user will not see the results immediately … do not start a request if your application is
  inactive or in the background." (`corelocation/clgeocoder`). MapKit isteğinin ücreti ya da kotası bu oturumda **bakılmadı**.
- **Gizlilik bedeli:** koordinat WeatherKit'ten ayrı olarak ikinci bir Apple servisine (Haritalar) gider; rıza metni
  ("Nerede: Apple'ın hava servisi") ve gizlilik sayfası buna göre genişler. Önceki plan bu yüzden reddetmişti; gerekçe
  hâlâ geçerli.

### 8.2 İlçe tablosu (ağsız)
- **GeoNames** Türkiye dökümü (`download.geonames.org/export/dump/TR.zip`, 30.09.2026 indirildi): özellik kodu `ADM2`
  olan **974** kayıt, her biri enlem/boylamlı; `admin2Codes.txt`'te de 974 `TR.` satırı. Örnek: Gaziemir 38.31098,
  27.15178 (İzmir, 35); Kadıköy 40.98229, 29.09032. İlçe merkezi yerleşimleri (`PPLA2`) 835 kayıt.
- Lisans: readme.txt — "This work is licensed under a Creative Commons Attribution 4.0 License" (doğrulandı). Atıf
  gizlilik/kaynaklar sayfasına yazılır.
- Resmî sayı 973; GeoNames 974. Fark **incelenmedi** (VARSAYIM: bir fazla ya da eski kayıt); tablo eklenirken il başına
  sayı resmî listeyle karşılaştırılmalı. `ADM2` noktasının ilçe merkezi mi yoksa alanın ortası mı olduğu GeoNames
  belgesinde bu oturumda **bakılmadı**.
- Boyut (VARSAYIM): 974 × (ad + 2 koordinat) ≈ 30–40 KB JSON, sıkıştırılmış çok daha az.
- Sınır poligonu (en doğru yöntem; "hangi ilçenin içindeyim") için OpenStreetMap (ODbL) ya da geoBoundaries gerekir; lisans
  ve boyut bu oturumda **doğrulanmadı**. Nokta tablosu "en yakın merkez" verir; büyük ilçelerde sınıra yakın kişi komşu
  ilçeye düşebilir.

### 8.3 Yaklaşık konumda ilçe güvenilir mi?
- Yaklaşık konum "typically preserves the city, and is usually within 1–20 kilometers" (önceki araştırma,
  `corelocation/kcllocationaccuracyreduced`).
- GeoNames ADM2 noktalarıyla bu oturumda hesaplandı: Türkiye'de en yakın komşu ilçe merkezine uzaklığın ortancası 18,5 km
  (%10'u 6,8 km'nin altında); İstanbul'da ortanca 4,5 km, İzmir'de 17,6 km, Ankara'da 15,0 km. Gaziemir'in 20 km içinde 9,
  10 km içinde 3 ilçe merkezi var; Kadıköy'ün 10 km içinde 5.
- **Sonuç:** yaklaşık konumdan ilçe adı büyük şehirlerde çoğu zaman yanlış olabilir (Apple'ın kodlaması da aynı bulanık
  koordinatla çalışır). İl adı genellikle doğrudur ("typically preserves the city").

### 8.4 Öneri
1. **İl + ilçe seçimi** (konum izni gerekmez): Profil'deki şehir alanı iki basamaklı olur (81 il → o ilin ilçeleri). Satır
   kişinin seçimini yazar: "İzmir Gaziemir". Koordinat tablodan gelir; Apple'a yalnız ilçe merkezi gider. S0 karar 11
   ("hukukçu yedeği sürerken şehir seçimi") ile uyumlu.
2. Konum izni verildiyse: kesin konumda en yakın ilçe merkezi önerilir ("Gaziemir mi?" onayıyla); yaklaşık konumda yalnız il
   ve "(yaklaşık)" yazılır (S0 karar 12).
3. Ters coğrafi kodlama kullanılmaz.

---

## 9. Yan bulgular (hava işinden bağımsız, önemli)

1. **AlarmKit ertelemesi widget uzantısı olmadan kurulu.** Apple: "AlarmKit expects a widget extension if an app supports a
   countdown presentation. Otherwise, the system may unexpectedly dismiss alarms and fail to alert."
   (`alarmkit/scheduling-an-alarm-with-alarmkit`). Kod `countdown:` sunumu kullanıyor (`AlarmPlugin.swift:139-143`) ve
   projede uzantı yok. Kodun kendi yorumu bunu VARSAYIM olarak sezmiş (`:151-152`). Alarmın çalmaması riski — ayrı iş olarak
   ele alınmalı.
2. `AlarmPresentation.Alert(title:stopButton:secondaryButton:secondaryButtonBehavior:)` ve `stopButton` belgede
   "Deprecated" başlığı altında (`alarmkit/alarmpresentation/alert-swift.struct`); kod bunu kullanıyor (`AlarmPlugin.swift:134-138`).
3. `openAppWhenRun` eskidi, yerine `supportedModes` (iOS 26) (`appintents/appintent/openappwhenrun`).
4. `CLGeocoder` iOS 26'da eskidi (§8.1) — önceki plan zaten kullanmıyor.
5. Bugünkü `notifyApply.js` bildirimlere `threadIdentifier`/`relevanceScore` vermiyor; eklenti destekliyor (§5.2).

---

## 10. VARSAYIM ve bakılmayanlar
- AlarmKit intent'inin süre sınırı (tasarım 8–10 sn); intent içinde ağ isteğine izin; alarm kendiliğinden susunca ya da
  Apple Watch'tan durdurulunca `stopIntent`; uygulama zorla kapatılmışken intent.
- Arka planda başlatılan uygulamada Capacitor WebView'ın/JS'in çalışmaması.
- `BGAppRefreshTask`'ın zorla kapatılmış uygulamada çalışmaması; kullanım alışkanlığına göre zamanlama.
- WeatherKit'in NSE/widget uzantısında kullanımı; NSE bellek sınırı.
- 64 bekleyen bildirim sınırının UserNotifications için de geçerli olması.
- Tek WeatherKit isteğinin kaç çağrı sayıldığı.
- MapKit ters kodlamanın Türkiye'de ilçe döndürüp döndürmediği; MapKit kotası/ücreti.
- GeoNames 974 ile resmî 973 farkı; ADM2 noktasının anlamı; OSM/geoBoundaries lisansı.
- Foundation Models'in Türkçe desteği.
- Nef yorumunun "value-added" sayılıp sayılmayacağı; bildirimde atıf biçimi (App Review).
- Vercel projesinin planı; 2.5.4 açısından alarm-sonrası hava yenilemesinin "intended purpose" sayılması.
- Eşikler: yaş kuralları (1 sa / aynı gün / 18 sa), relevanceScore değerleri, 07:30 varsayılan saat, durdurma + 2–5 dk.

## Kaynaklar (bu oturumda okundu; kopyalar `apple-json/`)
**AlarmKit:** `alarmkit`, `alarmkit/alarmmanager`, `alarmkit/alarmmanager/alarmconfiguration`,
`…/alarm(schedule:attributes:stopintent:secondaryintent:sound:)`, `…/alarm(schedule:attributes:appentityidentifier:stopintent:secondaryintent:sound:)` (iOS 27),
`…/init(countdownduration:schedule:attributes:stopintent:secondaryintent:sound:)`, `alarmkit/alarm`, `alarmkit/alarmmanager/stop(id:)`,
`alarmkit/alarmpresentation`, `alarmkit/alarmpresentation/alert-swift.struct`, `…/secondarybuttonbehavior-swift.enum`,
`alarmkit/alarmbutton`, `alarmkit/scheduling-an-alarm-with-alarmkit`.
**App Intents:** `appintents/appintent`, `appintents/appintent/perform()`, `appintents/appintent/openappwhenrun`,
`appintents/appintent/supportedmodes`, `appintents/intentmodes`, `appintents/liveactivityintent`,
`appintents/foregroundcontinuableintent`, `appintents/openintent`, `appintents/audioplaybackintent`.
**Background Tasks / UIKit:** `backgroundtasks`, `backgroundtasks/bgtaskscheduler`, `…/register(fortaskwithidentifier:using:launchhandler:)`,
`…/submit(_:)`, `backgroundtasks/bgapprefreshtask`, `backgroundtasks/bgapprefreshtaskrequest`, `backgroundtasks/bgprocessingtask`,
`backgroundtasks/bgprocessingtaskrequest` (+ `requiresexternalpower`, `requiresnetworkconnectivity`), `backgroundtasks/bgtask/expirationhandler`,
`backgroundtasks/bgcontinuedprocessingtask`, `backgroundtasks/performing-long-running-tasks-on-ios-and-ipados`,
`backgroundtasks/starting-and-terminating-tasks-during-development`, `uikit/using-background-tasks-to-update-your-app`,
`xcode/configuring-background-execution-modes`, `bundleresources/information-property-list/bgtaskschedulerpermittedidentifiers`,
`bundleresources/information-property-list/uibackgroundmodes`, `uikit/uiapplication/backgroundrefreshstatus`,
`uikit/uibackgroundrefreshstatus`, `uikit/uiapplicationdelegate/application(_:didreceiveremotenotification:fetchcompletionhandler:)`,
`uikit/uilocalnotification`; önceki kopyalar `arastirma-v1/backgroundtasks_*.json`, `bgchoose.json`, `bgreq.json`.
**UserNotifications:** `usernotifications/unnotificationserviceextension`, `…/didreceive(_:withcontenthandler:)`,
`usernotifications/modifying-content-in-newly-delivered-notifications`, `usernotifications/generating-a-remote-notification`,
`usernotifications/sending-notification-requests-to-apns`, `usernotifications/establishing-a-token-based-connection-to-apns`,
`usernotifications/pushing-background-updates-to-your-app`, `usernotifications/unnotificationinterruptionlevel` (+ dört durum),
`usernotifications/unmutablenotificationcontent` (+ `relevancescore`, `threadidentifier`, `interruptionlevel`),
`usernotifications/unnotificationcontent/filtercriteria`, `…/summaryargument`, `usernotifications/unauthorizationoptions/provisional`,
`usernotifications/asking-permission-to-use-notifications`, `usernotifications/unnotificationcategory`,
`usernotifications/unnotificationaction`, `usernotifications/unnotificationactionoptions/foreground`,
`usernotifications/declaring-your-actionable-notification-types`, `usernotifications/handling-notifications-and-notification-related-actions`,
`usernotifications/unnotificationcategoryoptions/customdismissaction`, `usernotifications/unnotificationdismissactionidentifier`,
`usernotifications/unusernotificationcenterdelegate/usernotificationcenter(_:didreceive:withcompletionhandler:)`,
`usernotifications/unnotificationrequest/init(identifier:content:trigger:)`, `usernotifications/untimeintervalnotificationtrigger`,
`usernotifications/unnotificationsettings/{timesensitivesetting,scheduleddeliverysetting}`,
`usernotifications/unusernotificationcenter/getpendingnotificationrequests(completionhandler:)`.
**HIG:** `design/human-interface-guidelines/notifications`, `design/human-interface-guidelines/managing-notifications`.
**WeatherKit:** `weatherkit/dayweather`, `weatherkit/daypartforecast`, `weatherkit/dayweather/{restofdayforecast,daytimeforecast}`,
`weatherkit/dayprecipitationsummary`, `weatherkit/hourweather`, `weatherkit/weatherquery`, `weatherkit/weatherquery/hourly(startdate:enddate:)`,
`weatherkit/weathermetadata` (+ `date`, `expirationdate`), `weatherkit/weathererror`, `weatherkit/weatherservice/{init(),shared}`,
`weatherkit/weatherattribution/{legalattributiontext,combinedmarklighturl,squaremarkurl,servicename}`, `weatherkit/weather`;
`developer.apple.com/weatherkit/get-started/` (kopya `apple-json/weatherkit_get-started.txt`);
`developer.apple.com/help/account/configure-app-services/weatherkit/`; önceki kopyalar `arastirma-v1/weatherkit_*.json`.
**Konum / Haritalar:** `corelocation/clgeocoder`, `corelocation/clgeocoder/reversegeocodelocation(_:completionhandler:)`,
`corelocation/clplacemark` (+ `subadministrativearea`, `locality`), `corelocation/handling-location-updates-in-the-background`,
`corelocation/cllocationmanager/accuracyauthorization`, `mapkit/mkreversegeocodingrequest` (+ `init(location:)`, `getmapitems(completionhandler:)`),
`mapkit/mkaddress` (+ `shortaddress`), `mapkit/mkaddressrepresentations` (+ `cityname`, `citywithcontext`, `regionname`, `contextstyle`),
`mapkit/mkmapitem/addressrepresentations`.
**Diğer:** `healthkit/hkhealthstore/enablebackgrounddelivery(for:frequency:withcompletion:)`, `foundationmodels`,
`foundationmodels/systemlanguagemodel/{availability-swift.property,supportedlanguages}`; App Review Guidelines 2.5.4 ve
4.5.4 (`arastirma-v1/apple/guidelines.html:1317,1515`); Vercel cron (`vercel.com/docs/cron-jobs/usage-and-pricing`);
GeoNames `TR.zip`, `admin2Codes.txt`, `readme.txt` (lisans); `@capacitor/local-notifications` 8.3.1 npm paketi
(`ios/Sources/LocalNotificationsPlugin/*.swift`, `dist/esm/definitions.d.ts`; `app/node_modules` bu ortamda yoktu, paket
npm'den indirildi).
**Kod (okundu, değiştirilmedi):** `app/src/lib/notifyPlan.js`, `notifyApply.js`, `reminders.js`, `alarm.js`,
`alarmNative.js`, `app/ios/App/App/AlarmPlugin.swift`, `HealthPlugin.swift`, `Info.plist`, `App.entitlements`,
`App.xcodeproj/project.pbxproj`, `app/api/coach.js`.
