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
