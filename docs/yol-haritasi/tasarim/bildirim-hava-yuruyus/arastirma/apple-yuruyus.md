# Yürüyüş eşliği — Apple tarafı araştırması

Tarih: 2026-09-30 · Kapsam: Nefona iOS (Capacitor 8, alt sınır iOS 15.0 — `app/ios/App/App.xcodeproj/project.pbxproj` `IPHONEOS_DEPLOYMENT_TARGET = 15.0`).
Yöntem: Apple belgeleri `https://developer.apple.com/tutorials/data/documentation/<yol>.json` uç noktasından okundu; ham JSON'lar
`arastirma/apple/` altında (`/` yerine `__` ile adlandırılmış). Her iddianın yanında okunan sayfanın yolu var (`coremotion/cmpedometer` gibi).
Okunmayan şey "bakmadım / belgede yok" diye, tahmin "VARSAYIM:" diye işaretli. Bu bulut ortamında Swift derlenemez; aşağıdaki
her yerel kod önerisi Mac'te Xcode ile derlenip gerçek cihazda denenmeli.

## Sonuçlar

(Belgenin sonunda doldurulacak.)

---

## 0. Bugünkü durum (depodan okundu)

- `HealthPlugin.swift`: HealthKit yalnız okuma (adım, yürüme/koşu mesafesi, egzersiz dakikası). Günlük toplam
  `HKStatisticsCollectionQuery` + `.cumulativeSum` ile. `WalkGuard`: `HKObserverQuery` + `enableBackgroundDelivery(for: stepCount,
  frequency: .hourly)`; bugünün adımı eşiği geçince bekleyen yürüyüş bildirimini siler. AppDelegate açılışında başlatılıyor.
- `Info.plist`: `UIBackgroundModes` = yalnız `audio`. `NSMotionUsageDescription` YOK, `NSLocation…UsageDescription` YOK,
  `NSSupportsLiveActivities` YOK. `NSHealthShareUsageDescription` var ("uygulama kapalıyken de okur" dahil).
- `App.entitlements`: `healthkit`, `healthkit.background-delivery`, `usernotifications.time-sensitive`, Sign in with Apple.
- Ses: `FeedbackPlugin.swift` içindeki `AppAudioSession` tekil nesnesi kategoriyi yönetiyor: tercih "ses açık" →
  `.playback` + `.mixWithOthers`; "kapalı" → `.ambient`; uyku sesi / yoga dersi → `.playback` (seçeneksiz, yani başka sesi keser);
  `SpeechPlugin` kayıtta `.playAndRecord` + `.measurement`, bitince tercihe döner. `AlarmPlugin.swift` `LessonPlayer`
  `AVAudioSession.interruptionNotification` / `routeChangeNotification` / `mediaServicesWereResetNotification` dinliyor,
  kilit ekranı için `MPNowPlayingInfoCenter` + `MPRemoteCommandCenter` kullanıyor.
- Hedefler: `project.pbxproj` içinde tek `PBXNativeTarget` (`com.apple.product-type.application`). Widget / uygulama uzantısı YOK.
  `AlarmPlugin.swift` sonundaki `OpenNefonaIntent: LiveActivityIntent` yalnız AlarmKit alarmının (iOS 26) ikinci düğmesi için;
  ActivityKit / `ActivityAttributes` kullanılmıyor.

---

## 1. "Yürüyüşe çıktın" algısı — uygulama arka planda ya da kapalıyken

### 1.1 CoreMotion hareket etkinliği (`CMMotionActivityManager`)

Apple ne diyor:
- "Motion data reflects whether the user is walking, running, in a vehicle, or stationary … you can ask for notifications when the
  current type of motion changes or you can gather past motion change data." — `coremotion/cmmotionactivitymanager` (iOS 7+).
- İzin: "you must include the NSMotionUsageDescription key … If you don't include a usage description string, your app crashes when
  you call this API." — aynı sayfa. (Bizde bu anahtar yok → eklenmeli; "Hareket ve Fitness" izin penceresi çıkar.)
- Canlı: "`handler` block is executed on a best effort basis and **updates are not delivered while your app is suspended**. If updates
  arrived while your app was suspended, the last update is delivered to your app when it resumes execution. To get all of the updates
  that occurred while your app was suspended, use the queryActivityStarting(from:to:to:withHandler:) method."
  — `coremotion/cmmotionactivitymanager/startactivityupdates(to:withhandler:)`.
- Geçmiş: "A delay of up to several minutes in reported activities is expected. The system stores only the last seven days worth of
  activity data at most." — `coremotion/cmmotionactivitymanager/queryactivitystarting(from:to:to:withhandler:)`.
- Özellikler birbirini dışlamaz; hepsi `false` olabilir; `confidence` = `low / medium / high`
  — `coremotion/cmmotionactivity`, `coremotion/cmmotionactivityconfidence`.

Bizim için sonuç: CoreMotion etkinliği **uygulamayı uyandırmaz**; askıdaki / kapalı uygulamaya teslim edilmez. Yalnız uygulama
bir sebeple çalışırken (ön plan, ya da başka bir mekanizmanın uyandırdığı kısa arka plan süresi) "son X dakikada walking var mı,
confidence high mı" diye **geçmişi sorgulamak** için işe yarar. Yani tetikleyici değil, **doğrulayıcı**dır.

VARSAYIM: Uyandırmayı başka bir kaynak (HealthKit, konum) yapar; o kısa arka plan süresinde `queryActivityStarting` çağırmak
mümkündür — belgede arka planda sorgunun yasak olduğu yazmıyor, ama izin verildiği de açıkça yazmıyor. Cihazda denenmeli.

### 1.2 `CMPedometer` arka plan davranışı

- "When the app is suspended, the delivery of updates stops temporarily. Upon returning to foreground or background execution, the
  pedometer object begins updates again." — `coremotion/cmpedometer/startupdates(from:withhandler:)`.
- Geçmiş sorgu: "Only the past seven days worth of data is stored" — `coremotion/cmpedometer/querypedometerdata(from:to:withhandler:)`.
- `startEventUpdates` → `CMPedometerEvent` tipi yalnız `pause` / `resume` ("The user's pedestrian activity stopped.")
  — `coremotion/cmpedometer/starteventupdates(handler:)`, `coremotion/cmpedometereventtype` (iOS 10+). Belgede bunun uygulamayı
  uyandırdığına dair bir ifade yok.

Sonuç: Pedometre de **uyandırmaz**. Uygulama bir biçimde çalışır tutulduğunda (bkz. §3 konum oturumu) sürekli veri verir.

### 1.3 HealthKit arka plan teslimi (bugün WalkGuard'ın kullandığı yol)

- "HealthKit wakes your app whenever a process saves or deletes samples of the specified type. The system wakes your app at most once
  per time period defined by the specified frequency. Some sample types have a maximum frequency of hourly … **For example, on iOS,
  stepCount samples have an hourly maximum frequency.**" — `healthkit/hkhealthstore/enablebackgrounddelivery(for:frequency:withcompletion:)`.
- iOS 15+ için `com.apple.developer.healthkit.background-delivery` yetkisi şart (aynı sayfa) — bizde var.
- Tamamlayıcı çağrılmazsa "HealthKit continues to attempt to launch your app using a backoff algorithm … If your app fails to respond
  three times, HealthKit assumes your app can't receive data and stops sending background updates." — aynı sayfa.
- Gözlemciler `application(_:didFinishLaunchingWithOptions:)` içinde kurulmalı — aynı sayfa ve `healthkit/executing-observer-queries`.
- Gözlemci "does not receive any information about the change—just that a change occurred" — `healthkit/executing-observer-queries`.

Sonuç: stepCount için **en sık saatte bir** uyanış. "Yürüyüşe çıktın" anında algı için yetersiz: kişi yürümeye başladıktan
0–60 dk sonra (ve iPhone'un adım örneğini Sağlık'a ne zaman yazdığına göre daha da geç) uyanabiliriz. Uyandığımızda
`CMMotionActivityManager.queryActivityStarting` ile "son 10 dk walking/high" + `CMPedometer.queryPedometerData` ile "son 10 dk
adım" bakılabilir; ikisi de tutarsa bildirim atılabilir. Yürüyüş kısa (≤ 20 dk) ise çoğu zaman **bittikten sonra** fark ederiz.

VARSAYIM: iPhone'un adım örneklerini Sağlık'a hangi sıklıkla yazdığını belgede görmedim (bakmadım / belgede yok). Saatlik sınır
"en fazla", gerçek aralık daha seyrek olabilir.

### 1.4 CoreLocation: önemli konum değişikliği, ziyaretler, bölge

- Önemli değişiklik: "If you start this service and your app is subsequently terminated, the system automatically relaunches the app
  into the background if a new event arrives." "Apps can expect a notification as soon as the device moves **500 meters or more** from
  its previous notification. It should not expect notifications more frequently than **once every five minutes**."
  — `corelocation/cllocationmanager/startmonitoringsignificantlocationchanges()`.
- Ziyaretler: "If your app is terminated while this service is active, the system relaunches your app when new visit events are ready
  to be delivered." Ayrılış olayında hem varış hem ayrılış zamanı olabilir; eksik de gelebilir.
  — `corelocation/cllocationmanager/startmonitoringvisits()`, `corelocation/clvisit`.
- Bölge (koşul) izleme: "If an iOS app isn't running when a condition is satisfied, the system tries to launch it." Bir uygulama en
  fazla 20 koşul izler. — `corelocation/monitoring-the-user-s-proximity-to-geographic-regions`.
- **Kapalı uygulamayı yeniden başlatma yalnız "Always" izninde:** tablo "Launches a terminated app automatically — When in Use: No.
  The user must launch the app. — Always: Yes for significant location change, visits, and region monitoring services; no for others"
  — `corelocation/requesting-authorization-to-use-location-services`. Always isteği "only once" yapılabilir (aynı sayfa).

Sonuç: Kapalı uygulamayı hareketle uyandırmanın Apple'ın izin verdiği en hızlı yolu **Always + ev çevresinde bölge (ör. 150–200 m)
çıkışı** ya da **Always + ziyaret ayrılışı**. Bu, "evden çıktı" demektir, "yürüyor" demek değildir; uyanınca CoreMotion ile
walking doğrulanır. Önemli değişiklik 500 m/5 dk kaba olduğu için yürüyüşü ancak 5–10 dk sonra yakalar.
Risk: "Always" konum izni hem kullanıcıda güvensizlik yaratır hem App Review'da gerekçe ister (bkz. §3.5). Nefona "veri telefondan
çıkmaz" söylemiyle tutarlı olsa da ev konumunu kaydetmek hassas veri demektir.

VARSAYIM: Bölge çıkışının gecikmesi belgede sayı olarak yok (bakmadım / belgede yok). Deneyimle genelde birkaç dakika denir;
cihazda ölçülmeli.

### 1.5 BGTaskScheduler

- `BGAppRefreshTask`: "short task typically used to refresh content"; `fetch` arka plan kipi gerekir — `backgroundtasks/bgapprefreshtask`.
- `earliestBeginDate`: "the system doesn't guarantee launching the task at the specified date, but only that it won't begin sooner."
  — `backgroundtasks/bgtaskrequest/earliestbegindate`.

Sonuç: Zamanı sistem seçer; "şimdi yürüyor" algısı için güvenilmez. En fazla "son 1 saatte yürüdü mü" yoklaması olur — bunu zaten
HealthKit uyanışı yapıyor. Eklemeye değmez.

### 1.6 Apple Watch'un "Egzersiz yapıyor gibisin" uyarısı

- HealthKit'in egzersiz konu listesinde (`healthkit/workouts-and-activity-rings`) otomatik egzersiz algısını üçüncü taraf
  uygulamaya bildiren bir tür / sorgu / olay **yok**: listede yalnız `HKWorkoutSession`, `HKLiveWorkoutBuilder`, rota, bölge (zone),
  etkinlik halkaları var. Bu, belgede bulamadığım anlamına gelir; "kesinlikle yok" iddiası değil.
- Watch'tan iPhone'a yansıtma var ama **bizim Watch uygulamamız** başlatırsa: `startMirroringToCompanionDevice` "Call this method in
  your watchOS app … If your iOS app isn't running, the system launches it in the background." (watchOS 10+)
  — `healthkit/hkworkoutsession/startmirroringtocompaniondevice(completion:)`. Nefona'nın Watch uygulaması yok.
- Kişi Apple'ın Egzersiz uygulamasıyla yürüyüşü başlatıp bitirirse Sağlık'a bir `HKWorkout` yazılır; `HKObserverQuery` ile
  `workoutType` gözlenebilir. VARSAYIM: `HKWorkout` için arka plan teslim sıklık sınırını belgede görmedim (yalnız stepCount'un saatlik
  olduğu yazıyor); ayrıca antrenman çoğunlukla **bittiğinde** kaydedilir, yani "başladın" değil "bitirdin" sinyalidir. Ayrıca
  bugünkü izinlerimizde `workoutType` okuma yok.

### 1.7 Gerçekçi gecikme ve dürüst yedek

| Yol | Kapalı uygulamayı uyandırır mı | Ek izin | Gerçekçi gecikme |
|---|---|---|---|
| HealthKit stepCount arka plan teslimi | Evet | Yok (var) | 0–60+ dk (saatlik tavan) |
| Konum bölge çıkışı / ziyaret ayrılışı | Evet, yalnız Always | Konum Always | VARSAYIM: birkaç dk |
| Önemli konum değişikliği | Evet, yalnız Always | Konum Always | ≥ 500 m ve ≥ 5 dk → ~5–10 dk yürüyüş |
| CoreMotion etkinlik / pedometre | Hayır | Hareket | yalnız çalışırken; geçmiş 7 gün |
| BGAppRefreshTask | Sistem seçer | `fetch` kipi | belirsiz |
| Watch otomatik algısı | Üçüncü tarafa açık API bulamadım | — | — |

Dürüst yedek (öneri):
1. **Birincil: kişinin başlatması.** Uygulama içi "Yürüyüşe çık" düğmesi + planlı yürüyüş hatırlatması ("Saat 18:00, hava 23°,
   yürüyelim mi?") bildiriminden tek dokunuşla yürüyüş ekranı. Bu, zaten var olan yürüyüş bildirimi altyapısının doğal uzantısı.
2. **İkincil (isteğe bağlı): gecikmeli fark etme.** HealthKit saatlik uyanışında CoreMotion geçmişinde "şu an hâlâ walking" görürsek
   "Yürüyüştesin gibi görünüyor — kalan yolda eşlik edelim mi?" bildirimi. Metin "hâlâ yürüyorsan" diye yumuşak olmalı; çünkü çoğu
   uyanışta yürüyüş bitmiş olacak (o zaman "Bugün X adım yürüdün" tebriki daha dürüst).
3. **Always konum ile anında algı** yalnız sahip bilinçli seçerse ve ayrı bir "Evden çıkınca sor" ayarı olarak; varsayılan kapalı.
   Bildirim metni "Yürüyüşe mi çıktın?" (soru) olmalı, "Yürüyüşe çıktın" (iddia) değil.

---

## 2. Adımın Apple Sağlık'la "birebir aynı" olması

### 2.1 Apple ne diyor

- Birleştirme: "By default, these queries **automatically merge the data from all of your data sources** before performing the
  calculations. If you want to merge the data yourself, you can set the separateBySource option." — `healthkit/hkstatistics`.
- `.cumulativeSum`: "the system calculates the sum of all the quantities for the samples"; `.separateBySource`: "calculates the
  specified statistics separately for each source"; ikisi birlikte kullanılabilir — `healthkit/hkstatisticsoptions`,
  `healthkit/hkstatisticsoptions/cumulativesum`, `healthkit/hkstatisticsoptions/separatebysource`.
  Kaynak başına toplam: `sumQuantity(for: HKSource)` — `healthkit/hkstatistics/sumquantity(for:)`.
- Kaynak önceliğinin (Sağlık > Veri Kaynakları sırası) istatistik sorgusunu nasıl etkilediğini okuduğum sayfalarda **bulamadım**
  (`healthkit/hkstatistics`, `healthkit/hkstatisticsoptions`, `healthkit/about-the-healthkit-framework`). Bakmadım / belgede yok.
  VARSAYIM: "automatically merge" birleştirmesi, Sağlık uygulamasının gösterdiği toplamla aynı çakışma gidermeyi kullanır;
  yaygın geliştirici deneyimi de budur ama Apple bunu bu sayfalarda **açıkça** "Sağlık'la aynı" diye yazmıyor.
- `HKSampleQuery` ile ham örnekleri kendimiz toplarsak iPhone + Watch çift sayılır (birleştirme yalnız istatistik sorgularında
  anlatılıyor — `healthkit/hkstatistics`). Yani ham örnek toplamı **kullanılmamalı**.
- Canlı güncelleme: `HKStatisticsCollectionQuery.statisticsUpdateHandler` ayarlanırsa sorgu "continues to run … If any new, matching
  samples are saved to the store … the query executes the update handler" — `healthkit/hkstatisticscollectionquery/statisticsupdatehandler`.
- Senkron: "iPhone, Apple Watch … each have their own HealthKit store … HealthKit automatically syncs data between these devices."
  — `healthkit/about-the-healthkit-framework`. Senkron gecikmesi için sayı yok (belgede yok).
- Kilit: "the device encrypts the HealthKit store when the user locks the device. As a result, your app may not be able to read data
  from the store when it runs in the background." — `healthkit/protecting-user-privacy`. (WalkGuard yorumunda da not edilmiş.)

### 2.2 `CMPedometer` ile HealthKit farkı

- `CMPedometer` "system-generated live walking data" verir, yalnız **bu cihazın** (iPhone'un) sensör verisidir; son 7 gün
  — `coremotion/cmpedometer`, `coremotion/cmpedometer/querypedometerdata(from:to:withhandler:)`. Watch'un adımı bunda yok
  (VARSAYIM: belgede "yalnız bu cihaz" diye yazmıyor ama Watch verisinin iPhone pedometresine geldiğine dair de hiçbir şey yok).
- HealthKit toplamı ise iPhone + Watch + (varsa) başka uygulamaların yazdıkları, çakışma giderilmiş.
- Sonuç: Kişi telefonu cebinde, saati kolunda yürürken `CMPedometer` ile Sağlık **çoğu zaman yakın ama birebir değil**; telefon
  masada, saat kolda yürürse `CMPedometer` ~0 gösterir, Sağlık Watch'un adımını gösterir.

### 2.3 `HKWorkoutSession` / `HKLiveWorkoutBuilder` iPhone'da

- `HKWorkoutSession` sınıfı iOS 17+ (`healthkit/hkworkoutsession`), ama iPhone'da **bağımsız** oturum açan
  `init(healthStore:configuration:)` iOS **26.0**+ (`healthkit/hkworkoutsession/init(healthstore:configuration:)`);
  `HKLiveWorkoutBuilder` iOS 26.0+ (`healthkit/hkliveworkoutbuilder`); `HKLiveWorkoutDataSource` iOS 26.0+
  (`healthkit/hkliveworkoutdatasource`). Apple'ın örneği: "Building a workout app for iPhone and iPad — Start a workout in iOS,
  control it from the Lock Screen with App Intents, and present the workout status with Live Activities." (iOS 26)
  — `healthkit/building-a-workout-app-for-iphone-and-ipad`.
- `HKWorkoutSession` sayfası: "iPhone typically locks during workouts … health data usually isn't accessible while the device is locked.
  However, the system can prompt someone to provide your app access to workout data even when their device is locked. You can then
  display Live Activities on the Lock Screen" — `healthkit/hkworkoutsession`.
- Antrenman kaydetmek **yazma izni** ister (`HKQuantityType.workoutType()` paylaşım) — `healthkit/running-workout-sessions`.
  Bugünkü `NSHealthUpdateUsageDescription` metni "Nefona Apple Sağlık'a hiçbir veri yazmaz" diyor → bu yola girersek **metin ve
  söz değişir**; sahibin kararı gerekir.
- Watch'un adımını iPhone ekranında canlı almanın belgelenmiş yolu: Watch'ta **bizim** antrenman oturumumuzun iPhone'a yansıtılması
  (`startMirroringToCompanionDevice`, watchOS 10+) — bizim Watch uygulamamız yok. Watch uygulaması olmadan Watch adımı iPhone'a ancak
  HealthKit senkronuyla, gecikmeli gelir (`statisticsUpdateHandler` bunu yakalar).
  VARSAYIM: iOS 26 bağımsız iPhone antrenmanında `HKLiveWorkoutDataSource`'un eşleşmiş Watch'tan canlı adım toplayıp toplamadığını
  belgede görmedim (bakmadım / belgede yok).

### 2.4 Önerilen gösterim (iOS 15 alt sınırıyla uyumlu)

1. **Yürüyüş başında taban:** `HKStatisticsQuery(.stepCount, bugün 00:00 → şimdi, .cumulativeSum)` = `H0` (Sağlık'ın bugünkü toplamı).
   Aynı anda `CMPedometer.startUpdates(from: başlangıç)` başlat.
2. **Canlı:** Yürüyüş kartında "Bu yürüyüş: `numberOfSteps` adım" (pedometreden, yalnız bu yürüyüş). Günlük sayıyı göstereceksek
   `H0 + pedometre` DEĞİL — bu Watch varken çift sayabilir (Watch adımı HealthKit'e senkronlandıkça `H0`'ı büyütür).
   Bunun yerine `HKStatisticsCollectionQuery` + `statisticsUpdateHandler` ile **günlük toplamı doğrudan Sağlık'tan** okuyup göster;
   değiştikçe güncellenir. Ekran kilitliyken okuma başarısız olabilir (§2.1) — son değeri tut.
3. **Bitişte uzlaştır:** Yürüyüş bitince (ve uygulama bir sonraki açılışta) `HKStatisticsQuery(başlangıç → bitiş, .cumulativeSum)`
   ile "bu yürüyüşün Sağlık'taki adımı"nı al ve kayda **bunu** yaz; pedometre sayısı yalnız canlı tahmindi.
4. **Tutarlılık notu (kendi kodumuz):** `dailyTotals` ve `WalkGuard` `.strictStartDate` kullanıyor: "The sample's start time must be
   equal to or later than the target's start time" — `healthkit/hkqueryoptions/strictstartdate`. Gece yarısını kesen bir adım örneği
   bizde düşer; VARSAYIM: Sağlık uygulaması onu orantılayarak gösteriyor olabilir. Birebir eşitlik hedefleniyorsa seçeneksiz
   (`[]`) sorgu ile karşılaştırma cihazda yapılmalı.

### 2.5 Sayılar ne zaman farklı çıkar

- Watch adımı iPhone Sağlık'ına henüz senkronlanmadı (süre belgede yok).
- Telefon cepte değil (pedometre az sayar); ya da tersi, Watch takılı değil.
- Kilitli ekranda HealthKit okunamıyor → ekrandaki günlük sayı son okunan değerde kalır.
- Pedometre canlı değeri, sonradan Sağlık'a yazılan örnekle birkaç adım farklı olabilir (VARSAYIM: aynı sensör, farklı işleme anı).
- Gece yarısını geçen yürüyüş (§2.4-4).

### 2.6 Dürüst ekran metni önerisi

- Canlı: "Bu yürüyüş · 1.240 adım" + altında küçük: "Canlı sayım telefonundan. Apple Saat'in adımları Sağlık'a geldikçe eklenir."
- Bitiş: "Apple Sağlık'a göre bu yürüyüş: 1.268 adım · bugün toplam 7.412 adım." Sağlık'tan okunamadıysa: "Sağlık verisi telefon
  açılınca güncellenecek."
- "Apple'la birebir aynı" sözü yalnız **bitiş/uzlaştırılmış** sayı için verilebilir; canlı sayı için verilmemeli.

---

## 3. Mesafe ve hız (tempo)

### 3.1 `CMPedometer` alanları

| Alan | iOS | Birim (Apple) | Not |
|---|---|---|---|
| `numberOfSteps` | 8.0 | adım | `coremotion/cmpedometerdata/numberofsteps` |
| `distance` | 8.0 | "estimated distance (in meters)"; cihaz desteklemezse `nil` | `coremotion/cmpedometerdata/distance` |
| `currentPace` | 9.0 | "seconds per meter"; tarihsel sorguda ve "not yet available" iken `nil` | `coremotion/cmpedometerdata/currentpace` |
| `currentCadence` | 9.0 | "steps per second" | `coremotion/cmpedometerdata/currentcadence` |
| `averageActivePace` | 10.0 | "seconds per meter"; "averages the user's pace only during periods of activity and it omits all periods of inactivity" | `coremotion/cmpedometerdata/averageactivepace` |
| `isPaceAvailable()` | 9.0 | "This capability is not supported on all devices." | `coremotion/cmpedometer/ispaceavailable()` |

- Güncelleme aralığı: belgede sayı yok; yalnız "starts calling your handler block regularly" ve verinin başlangıçtan bu yana
  **birikimli** olduğu yazıyor — `coremotion/cmpedometer/startupdates(from:withhandler:)`. Sıklık için bakmadım / belgede yok.
- Tempo dönüşümü: `dk/km = currentPace × 1000 / 60`. Örnek: 0,58 s/m → 580 s/km → "1 km 9 dk 40 sn".
- 250 m tetikleyicisi: her güncellemede `distance` bir önceki 250 m katını geçti mi diye bakılır. Pedometre güncellemesi seyrekse
  anons birkaç metre geç çalar; kabul edilebilir (VARSAYIM).
- Anons içeriği için öneri: son 250 m'nin **kendi temposu** = (bu dilimin süresi) / 0,25 km — `currentPace` anlık ve oynak
  olabilir; dilim ortalaması hem daha kararlı hem ekranda aynen gösterilebilir. Toplam ortalama için `averageActivePace`.
- **GPS'siz doğruluk:** Apple belgesi yalnız "estimated" diyor, yüzde vermiyor (belgede yok). VARSAYIM: adım uzunluğu tahmini
  kişiye ve yokuşa göre %5–15 sapabilir; kısa yürüyüşte 250 m işaretleri gerçek 220–280 m'ye denk gelebilir. Ekranda "yaklaşık"
  demek dürüst olur.

### 3.2 CoreLocation ile (GPS)

- `activityType = .fitness`: "positioning during dedicated fitness sessions, such as walking workouts … This activity might cause the
  system to pause location updates when the user doesn't move … When activityType is fitness, the system disables indoor positioning."
  — `corelocation/clactivitytype/fitness`.
- Otomatik duraklama: "For apps that have in-use authorization, a pause to location updates **ends access to location changes until the
  app launches again**" → yürüyüş boyunca `pausesLocationUpdatesAutomatically = false` önerilir — `corelocation/cllocationmanager/pauseslocationupdatesautomatically`.
- Arka plan: `UIBackgroundModes` içinde `location` + `allowsBackgroundLocationUpdates = true`; "When the value of this property is true
  and you start location updates while the app is in the foreground, Core Location configures the system to keep the app running …
  and arranges to show the background location indicator (blue bar or pill) if needed. Updates continue even if the app subsequently
  enters the background." Anahtar olmadan `true` yapmak "a fatal error that terminates the app".
  — `corelocation/cllocationmanager/allowsbackgroundlocationupdates` (iOS 9+).
- iOS 17+: `CLBackgroundActivitySession` "allows a **when-in-use** authorized app to receive location updates or monitoring events"
  — `corelocation/clbackgroundactivitysession-3mzv3`; `CLLocationUpdate.liveUpdates(_:)` iOS 17+, yapılandırmada `.fitness` var
  — `corelocation/cllocationupdate/liveupdates(_:)`, `corelocation/cllocationupdate/liveconfiguration`. `CLServiceSession` iOS 18+
  — `corelocation/clservicesession-2ddhd`. Rehber: oturumu ön planda başlat; uygulama sonlanırsa açılışta yeniden kur
  — `corelocation/handling-location-updates-in-the-background`.
- İzin düzeyi: "If you enable background location updates, an app with When in Use authorization **continues to run in the background
  when location services are active** … If the system terminates the app or the app isn't running, the system doesn't launch an app with
  When in Use authorization" — `corelocation/requesting-authorization-to-use-location-services`.
  → **Yürüyüşü uygulamada başlatıyorsak "When In Use" yeter**; "Always" yalnız §1.4'teki kapalıyken algı için gerekir.
- Mavi gösterge: When In Use uygulaması arka planda konum kullanınca sistem durum çubuğunu değiştirir
  — `corelocation/cllocationmanager/showsbackgroundlocationindicator`. Kullanıcı bunu görür; bu şeffaflık iyi.
- Kilit ekranı: yukarıdaki "keep the app running" ifadesi gereği ölçüm kilitte de sürer (kilit, arka plan sayılır).
  VARSAYIM: kilitte `CMPedometer` de çalışır çünkü uygulama askıya alınmamıştır ("Upon returning to foreground or background execution,
  the pedometer object begins updates again" — `coremotion/cmpedometer/startupdates(from:withhandler:)`). Cihazda denenmeli.
- iOS 15–16 cihazlar için yol: klasik `CLLocationManager` + `allowsBackgroundLocationUpdates` + When In Use. iOS 17+ için
  `CLBackgroundActivitySession` + `liveUpdates(.fitness)` eklenebilir. İkisi aynı `location` arka plan kipini ister.

### 3.3 Pil (Apple enerji rehberi)

Kaynak: Energy Efficiency Guide for iOS Apps, "Location Best Practices" (arşiv belgesi, JSON uç noktasında yok; HTML kopyası
`arastirma/apple/archive__EnergyGuide-iOS__LocationBestPractices.html`).
- "Requesting higher accuracy than you need causes Core Location to power up additional hardware and waste power … Unless your app
  really needs to know the user's position within a few meters, don't set the accuracy level to best or nearest ten meters."
- "By default, standard location updates on iOS devices run with an accuracy level of best. Change these settings to match your app's
  requirements."
- Önemli değişiklik hizmeti "run continuously, around the clock, until you stop them, and can actually result in higher energy use";
  "Region and visit monitoring are sufficient for most use cases and should always be considered before significant-change".
- Güncel belge de aynısını söylüyor: "To reduce your app's impact on battery life, assign a value to this property that's appropriate"
  — `corelocation/cllocationmanager/desiredaccuracy`.

Öneri: yürüyüşte `desiredAccuracy = kCLLocationAccuracyNearestTenMeters` değil `kCLLocationAccuracyBest` de değil; VARSAYIM:
250 m anonsu için ~10–20 m yeterli → `NearestTenMeters` makul üst sınır; `distanceFilter` ~10 m. Yürüyüş bitince konumu hemen durdur.
Pil etkisinin sayısal değerini belgede görmedim (belgede yok).

### 3.4 Karar: pedometre mi, GPS mi?

- **Pedometre yalnız** (izin: Hareket ve Fitness): kolay, GPS izni yok, pil hafif; ama **uygulamayı arka planda uyanık tutmaz**
  (§1.2). Kilit ekranına geçince uygulama askıya alınır ve 250 m anonsu durur — meğerki başka bir arka plan kipi (ses, §4.5) uygulamayı
  çalışır tutsun.
- **Konum + pedometre**: konum oturumu uygulamayı kilitte meşru biçimde uyanık tutar (Apple'ın saydığı kullanım: "Track the precise
  path taken during a hike or fitness workout" — `corelocation/handling-location-updates-in-the-background`); mesafe GPS'ten, adım
  pedometreden. Açık havada daha doğru mesafe. Bedeli: konum izni + `location` arka plan kipi + mavi gösterge.
- Öneri: **Konum (When In Use) + pedometre** birincil; kişi konum iznini vermezse "yalnız pedometre, ekran açıkken" yedeği.

### 3.5 İzin metinleri ve App Review

- Gerekli yeni anahtarlar: `NSMotionUsageDescription` (CoreMotion; yoksa çöker — `coremotion/cmpedometer`),
  `NSLocationWhenInUseUsageDescription` ("required if your iOS app uses APIs that access the user's location information while the app is
  in use" — `bundleresources/information-property-list/nslocationwheninuseusagedescription`), Always istenecekse ek olarak
  `NSLocationAlwaysAndWhenInUseUsageDescription` (`corelocation/requesting-authorization-to-use-location-services`).
- İzin isteme zamanı: "make authorization requests only when someone engages a part of your app that requires that data"
  — aynı sayfa. → "Yürüyüşe başla"ya ilk dokunuşta sor, açılışta değil.
- App Review Yönergeleri (kopya: `arastirma/apple/app-store-review-guidelines.html`):
  - 2.5.4: "Multitasking apps may only use background services for their intended purposes: VoIP, audio playback, location, task
    completion, local notifications, etc."
  - 5.1.5: "Use Location Services in your app only when it is directly relevant to the features and services provided by the app …
    If your app uses Location Services, be sure to explain the purpose in your app".
- Taslak metinler (sade Türkçe, "telefondan çıkmaz" sözüyle tutarlı):
  - Hareket: "Nefona, yürüyüşte adımını ve hızını telefonun hareket sensöründen ölçer. Veriler telefonundan çıkmaz."
  - Konum (kullanımda): "Yürüyüş sırasında kaç metre yürüdüğünü ve 1 km'yi kaç dakikada yürüdüğünü ölçmek için konumun kullanılır.
    Yalnız sen yürüyüşü başlattığında, bitirene dek. Konumun kaydedilmez, telefonundan çıkmaz."
  - (İsteğe bağlı) Her zaman: "Evden çıkınca 'Yürüyüşe mi çıktın?' diye sorabilmemiz için. İstediğin an Ayarlar'dan kapatabilirsin."
- Risk: Always izni ve `location` kipi incelemede gerekçe ister; yürüyüş ekranı ve mavi gösterge açık bir fitness amacı gösterdiği
  için When In Use + oturum düşük risk (VARSAYIM). Ev çevresi bölgesi için Always daha yüksek risk.

---

## 4. Sesli koç

### 4.1 `AVSpeechSynthesizer` ve Türkçe ses

- `AVSpeechSynthesisVoice(language:)` "Retrieves a voice for the BCP 47 code … if the code is valid; otherwise, nil"
  — `avfaudio/avspeechsynthesisvoice/init(language:)`; cihazdaki sesler `speechVoices()` — `avfaudio/avspeechsynthesisvoice/speechvoices()`.
- Kalite düzeyleri: `default`, `enhanced` ("you must download to use", iOS 9+), `premium` ("you must download to use", iOS 16+)
  — `avfaudio/avspeechsynthesisvoicequality`, `.../enhanced`, `.../premium`.
- `usesApplicationAudioSession = false` ise "the system creates a separate audio session to automatically manage speech, interruptions,
  and mixing and ducking" (iOS 13+) — `avfaudio/avspeechsynthesizer/usesapplicationaudiosession`.
- Hangi dillerin (tr-TR dahil) ve hangi kalitede geldiği Apple belgesinde **listelenmiyor** (bakmadım / belgede yok).
  Depodaki kanıt: `src/lib/cue.js` ElevenLabs dosyası yoksa `speechSynthesis` ile `tr-TR` konuşuyor ve önce `getVoices()` içinde
  `tr` sesi var mı diye bakıyor — yani ekip cihazda Türkçe sistem sesi bulunduğunu varsaymış. VARSAYIM: iOS'ta varsayılan kalite
  Türkçe ses hazır gelir; enhanced/premium kişi indirirse olur. Kalite ElevenLabs sesinden belirgin düşük (VARSAYIM, dinleyerek
  karar verilmeli).
- Sonuç: sentez yalnız **yedek** olmalı (dosya eksik / çözülemedi). Sahibin kuralı ("ekrandaki cümle = sesteki cümle" ve sesler
  ElevenLabs Neslihan / Hakan) sentezle ses kimliğini bozar.

### 4.2 Ses oturumu: kilit ekranında, müziğin üstüne

- `.voicePrompt` modu: "your app plays audio using text-to-speech … An example … is a turn-by-turn navigation app that plays short
  prompts to the user. Typically, apps of the same type also configure their sessions to use the duckOthers and
  interruptSpokenAudioAndMixWithOthers options." (iOS 12+) — `avfaudio/avaudiosession/mode-swift.struct/voiceprompt`.
- `.duckOthers`: "reduces the volume of other audio sessions … If your app provides occasional spoken audio, such as in a turn-by-turn
  navigation app **or an exercise app**, you should also set the interruptSpokenAudioAndMixWithOthers option. Ducking begins when you
  activate your app's audio session and ends when you deactivate the session … **Set this option on a temporary basis only. Don't use it
  to duck the audio of other apps for more than a few seconds.**" — `avfaudio/avaudiosession/categoryoptions-swift.struct/duckothers`.
- `.interruptSpokenAudioAndMixWithOthers`: müziği kısar, podcast/sesli kitabı (`spokenAudio` modundakileri) duraklatır; "Set this option if
  your app's audio is occasional and spoken, such as … an exercise app"; bitince `setActive(false, options: .notifyOthersOnDeactivation)`
  — `avfaudio/avaudiosession/categoryoptions-swift.struct/interruptspokenaudioandmixwithothers`.
- `.spokenAudio` modu podcast gibi **sürekli** konuşma içindir; bize uymaz — `avfaudio/avaudiosession/mode-swift.struct/spokenaudio`.
- `.playback` kategorisi sessiz tuşunda susturulmaz; arka planda çalmak için `audio` kipi gerekir — `avfoundation/configuring-your-app-for-media-playback`.

Öneri (yerel, Swift): Her anonsta
`setCategory(.playback, mode: .voicePrompt, options: [.duckOthers, .interruptSpokenAudioAndMixWithOthers])` → `setActive(true)` →
parçaları çal → bitince `setActive(false, options: .notifyOthersOnDeactivation)`. Anonslar arasında oturum **kapalı** kalır (duck
"birkaç saniyeden uzun" sürmesin). Bu, bugünkü `AppAudioSession` (FeedbackPlugin.swift) durum makinesine yeni bir "walkPrompt" durumu
olarak eklenmeli; yoksa uyku sesi / ders / kayıt ile yarışır (bugün her biri `.playback`'i kendine göre kuruyor).
Kesinti (telefon araması) ve rota değişimi (kulaklık çıktı) için `LessonPlayer`'daki bildirim dinleyicileri örnek alınabilir.

Risk: Oturum kapalıyken ve konum kipi yoksa uygulama arka planda askıya alınır → sonraki anons hiç çalmaz. Uyanıklığı **konum
oturumu** sağlamalı (§3.2), ses değil.

### 4.3 Önceden üretilmiş parça birleştirme

Mevcut düzen: `src/lib/voicePack.js` — cümleler `public/voice/{dil}/{ses}/{anahtar}.mp3`, `female`/`male`, her birinde 53 dosya;
çalarken baştaki/sondaki sessizlik kırpılıyor (WebAudio, WebView içinde). Yürüyüşte arka planda WebView'e güvenilmez
(VARSAYIM: iOS arka plandaki WKWebView işini kısıtlar; belgesini okumadım) → anonslar **yerel** çalınmalı (AVAudioPlayer / AVAudioEngine;
dosyalar pakette zaten var).

Türkçe'de ek uyumu sorununu yaşamamak için sayı sona **ek almadan** gelmeli. Öneri kalıp (ekran ve ses aynı):
- "**Kilometre başına dokuz dakika kırk saniye.**" (ekranda: "Kilometre başına 9 dakika 40 saniye")
- Mesafe (isteğe bağlı, anonsun başında): "**İki kilometre iki yüz elli metre.**"

Parça sayısı (ses başına):

| Parça | Aralık | Dosya |
|---|---|---|
| "Kilometre başına" | — | 1 |
| "N dakika" (sayı + "dakika" birlikte, doğal vurgu için) | 3–30 | 28 |
| "N saniye" — 5 sn'ye yuvarlanmış | 5, 10 … 55 (0 ise söylenmez) | 11 |
| (alternatif) 10 sn'ye yuvarlanmış | 10 … 50 | 5 |
| "N kilometre" | 1–15 | 15 |
| "iki yüz elli / beş yüz / yedi yüz elli metre" | — | 3 |
| Başlangıç, bitiş, "koç kapalı", "hız ölçülemedi" gibi sabit cümleler | — | ~6 |
| **Toplam** | | **~64** (×2 ses ≈ 128) |

- Yuvarlama önerisi: **5 saniye**. Gerekçe: pedometre/GPS tempo tahmini zaten ± birkaç saniye/km oynar (VARSAYIM, §3.1);
  5 sn hem doğruluğu abartmaz hem 10 sn'den daha "koç gibi" duyulur. 30 dk/km üstü ya da 3 dk/km altı → sabit cümle
  ("Çok yavaş ilerliyorsun, istersen dinlen." / sayı söylenmez).
- 60 saniyeye yuvarlanma: 9:58 → "10 dakika" (saniye 0 → söylenmez).
- Ekler: "dakika"/"saniye"/"kilometre" sayıdan sonra ek almadığı için birleştirme dilbilgisi olarak güvenli.
- Risk: parçalar ayrı üretildiği için tonlama dikişi duyulabilir (VARSAYIM). Azaltmak için: her parçayı aynı ses ayarıyla, cümle
  içindeki yerine uygun noktalamayla üret (ör. "dokuz dakika," virgüllü, "kırk saniye." noktalı); araya ~80–120 ms sessizlik; seviye
  eşitleme (voicePack zaten yapıyor). Parçalar arka arkaya `AVAudioEngine` / `AVAudioPlayerNode.scheduleFile` ya da `AVQueuePlayer`
  ile boşluksuz sıralanabilir (bu API'lerin belge sayfalarını bu turda okumadım).
- Alternatif: 28 × 12 = 336 tam cümle dosyası (ses başına) — dikiş yok ama üretim/paket boyutu 5 kat. Önce parça yöntemi dinlenmeli.

### 4.4 Sentez ile karşılaştırma

| | ElevenLabs parçaları | `AVSpeechSynthesizer` tr-TR |
|---|---|---|
| Ses kimliği (Neslihan/Hakan) | Aynı | Farklı (sistem sesi) |
| "Ekran = ses" | Kalıp sabit, sağlanır | Sağlanır (aynı metin okunur) |
| Dinamik sayı | Parça sınırında | Sınırsız |
| Kalite | Yüksek, dikiş riski | VARSAYIM: belirgin düşük |
| Çevrimdışı | Evet (pakette) | Evet (varsayılan ses cihazda — VARSAYIM) |
| Paket boyutu | ~130 küçük dosya | 0 |

Öneri: parçalar birincil, sentez yalnız eksik parça / bilinmeyen dil yedeği (bugünkü `cue.js` davranışıyla aynı).

### 4.5 `audio` arka plan kipi uygulamayı uyanık tutar mı? App Review?

- Apple: `audio` kipi "The app plays audible content in the background" — `xcode/configuring-background-execution-modes`; `.playback` +
  kip ile "your app's audio continues when people switch to another app or lock their iOS device" — `avfoundation/configuring-your-app-for-media-playback`.
- Aynı sayfa: "Use background execution modes sparingly … If an alternative to executing in the background exists, use the alternative."
- App Review 2.5.4: arka plan hizmetleri "only … for their intended purposes".
- Sonuç: `audio` kipi, **ses çalarken** uygulamayı çalışır tutar. Anonslar arasında (250 m ≈ 2,5–3 dk) ses yoksa uygulama askıya alınır
  (VARSAYIM: belgede "sessizken askıya alınır" cümlesini okumadım, ama kip tanımı "plays audible content" ile sınırlı). Uyanık kalmak için
  sessiz ses döngüsü çalmak **bu kipin amacı dışı** kullanım olur → 2.5.4 ret riski yüksek. Doğru yol: yürüyüş süresince **`location` kipi +
  konum oturumu** (Apple'ın açıkça saydığı kullanım: fitness rotası), anonslar için mevcut `audio` kipi.
