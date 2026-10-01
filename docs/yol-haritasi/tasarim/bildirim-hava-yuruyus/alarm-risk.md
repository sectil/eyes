# Alarm riski: AlarmKit ertelemesi, haftalık tekrar ve "ertesi gün çalmadı" (DEVIR §8.4, D4)

Tarih: 2026-10-01. Yalnız araştırma; kod değişmedi. Kaynak: depodaki Apple belgelerinin kopyaları
(`arastirma/apple-json/alarmkit*.json`), `arastirma/apple-hava-bildirim.md` §1 ve §9, `app/ios/App/App/AlarmPlugin.swift`
ve JS tarafı (`lib/alarmNative.js`, `lib/alarmLog.js`, `lib/alarm.js`, `components/AlarmLine.jsx`,
`screens/AlarmSetup.jsx`). Satır numarası verilmez; işlev ve dosya adıyla aranır. Belgede olmayan şey "belgede yok"
diye yazılmıştır, VARSAYIM'lar açıkça işaretlidir.

**Sahibin sorunu (YAPILACAKLAR D4, SAHIP_ISTEKLERI "Cihazdan düzeltmeler 2026-10-01"):** Pzt–Cmt 06.35 alarmı ilk gün
çaldı, ertesi gün çalmadı; 09.32'deki Ana sayfa görüntüsünde üst satır "— alarm yok" diyordu. Ardından 09.44–09.50
arasında (Build 70) 09.50'ye bir deneme alarmı kuruldu ve çaldı.

---

## 1. Kısa sonuç

1. **"— alarm yok" yazısı AlarmKit'ten değil, uygulamanın kendi kaydından gelir.** `AlarmLine.jsx` yalnız
   `nextRing(loadAlarm(), now)`'a bakar; `nextRing` (`lib/alarm.js`) kayıt açık ve günleri doluysa **her zaman** bir
   sonraki çalışı döndürür. Yani kayıt Pzt–Cmt ve açık olsaydı, AlarmKit alarmı sistem tarafından silinmiş olsa bile
   satır "06:35 alarm · yarın" derdi. "— alarm yok" görüldüğüne göre kayıt o anda ya kapalıydı, ya yoktu, ya da **tek
   seferlikti** (günler boş). Bu yüzden Apple'ın "unexpectedly dismiss" uyarısı tek başına sahibin gördüğünü
   **açıklamaz**; uygulama tarafında bir şey kaydı değiştirmiş olmalı (§3, N1–N3).
2. **Tek seferlik alarm, gördüğümüzü birebir açıklar:** tek seferlik alarm durdurulunca sistem onu siler ("If the alarm is
   a one-shot … the system deletes the alarm", `stop(id:)`), kayıt da geçmiş tek sefer olarak `nextRing`'de boş döner.
   "Bir kez çaldı, ertesi gün çalmadı, Ana sayfa alarm yok" üçlüsü budur. Bunun doğru olup olmadığını tanı ekranı ayırır (§4).
3. **Haftalık tekrar belgeye göre kalıcıdır:** tekrarlayan alarm durdurulunca "rescheduled to alert or begins counting down
   at the next scheduled time" (`stop(id:)`). Sistemin kendi "Kapat" düğmesinin de aynı kuralla işlediği belgede açıkça
   yazmaz; örnek proje yalnız "the AlarmManager automatically handles stop or countdown functionalities" der.
4. **Erteleme (geri sayım sunumu) widget uzantısı olmadan Apple'a göre güvenilir değildir.** Uyarı koşulludur ("if an app
   supports a countdown presentation") ve nasıl, ne zaman, ne sıklıkla olduğu belgede yoktur. Nefona geri sayım sunumu
   veriyor, projede uzantı yok. Bu, sahibin gördüğünden bağımsız **ayrı ve gerçek bir risktir**; ya uzantı eklenir ya
   erteleme kaldırılır (§5, Adım 3).

---

## 2. Bulgular (kaynaklı)

### 2.1 "may unexpectedly dismiss alarms" uyarısının tam bağlamı

Uyarı `alarmkit/scheduling-an-alarm-with-alarmkit` sayfasında (Apple'ın örnek projesi, WWDC25 oturum 230), **"Create a
Widget Extension for Live Activities"** başlığının altında, "Important" kutusundadır. Bölüm şöyle:

> The sample app adds a widget extension target to customize non-alerting presentations in the Dynamic Island, Lock
> Screen, and StandBy. The widget extension receives the same `AlarmAttributes` structure that you provide to `shared`
> when scheduling alarms. […]
>
> **Important:** AlarmKit expects a widget extension if an app supports a countdown presentation. Otherwise, the system
> may unexpectedly dismiss alarms and fail to alert. For more information, see ActivityKit.

Sayfanın girişinde de: "This project also includes a widget extension for setting up the custom countdown Live Activity
associated with an alarm."

Bağlamdan çıkan ve çıkmayan:

| Soru | Belge |
|---|---|
| Koşul ne? | "if an app supports a countdown presentation". Geri sayım sunumu = `AlarmPresentation.Countdown` (`alarmpresentation`: `countdown` "The content for the snooze or countdown mode of the alarm."). Yani erteleme modu da bu sunumu kullanır. |
| Uzantı ne işe yarar? | "customize non-alerting presentations in the Dynamic Island, Lock Screen, and StandBy" (geri sayım/duraklatılmış gibi çalmayan durumlar). |
| Ne olur? | "the system may unexpectedly dismiss alarms and fail to alert". |
| Hangi durumda (yalnız geri sayım sürerken mi, yoksa kurulu alarmın ilk çalışında da mı)? | **Belgede yok.** |
| Ne sıklıkla, hangi iOS sürümünde? | **Belgede yok.** |
| Alarm yalnız o çalış için mi kapanır, yoksa AlarmKit'ten tamamen mi silinir (tekrarı da biter mi)? | **Belgede yok.** |
| `preAlert: nil` olan, geri sayımı yalnız ertelemeden sonra (`postAlert`) gelen alarm da "supports a countdown presentation" sayılır mı? | **Belgede yok.** Apple'ın kendi ertelemeli örneği (`alarmkit/alarm`: "an alarm that includes a 9 minute snooze option", `CountdownDuration(preAlert: nil, postAlert: 9 * 60)`) uzantıdan söz etmez; ama uyarı geneldir. İhtiyatlı okuma: sayılır. |
| Ayrıntı | "For more information, see ActivityKit": ActivityKit sayfası depoda **yok, okunmadı**. |

### 2.2 Erteleme (`.countdown`) nasıl çalışır

- `secondaryButtonBehavior = .countdown`: "the secondary button is a `Repeat` action, which re-triggers the alarm after a
  certain `TimeInterval`, as specified in `postAlert`" (`scheduling-an-alarm-with-alarmkit`). `.custom`: "displays an
  `Open` action to launch the app".
- `postAlert`: "The duration applied after the alarm has alerted at least once and moves back to the countdown state."
- `init(countdownDuration:schedule:…)`: "Creates a configuration that behaves like a countdown"; `countdownDuration`:
  "When set to a non-nil value, a countdown shows in the Lock Screen for the specified duration."
- `AlarmPresentation.Alert.SecondaryButtonBehavior` sayfasının kendi cümlesi: "The secondary button displays if you use
  `custom`." Bu cümle örnek projeyle (countdown → "Repeat" düğmesi) çelişkili okunabiliyor; belgede açıklaması yok.
- "When a person taps the button in the alerting UI, the `AlarmManager` automatically handles stop or countdown
  functionalities, depending on the button type." Yani erteleme için intent gerekmez; Nefona da vermiyor.
- Uzantı olmadan erteleme **güvenilir mi?** Apple'ın tek cümlesi "AlarmKit expects a widget extension"; güvenilir olduğuna
  dair bir şey belgede yok, güvenilmez olduğuna dair uyarı var. Ölçülmüş bir sıklık yok.

### 2.3 Haftalık tekrar kalıcı mı

- Takvim: `.relative(.init(time:, repeats: weekdays.isEmpty ? .never : .weekly(Array(weekdays))))`; "For recurring
  alarms, the `repeats` property is set to `Alarm.Schedule.Relative.Recurrence.weekly(_:)` with an associated array
  `Locale.Weekday`, indicating the days of the week the alarm alerts." Nefona'nın `AlarmPlugin.schedule` kodu bununla
  birebir aynı.
- `stop(id:)`: "If the alarm is a one-shot, meaning it doesn't have a repeating schedule, then the system deletes the
  alarm. If the alarm repeats then it's rescheduled to alert or begins counting down at the next scheduled time."
- `alarmUpdates` notu: "An `Alarm` that's not included in the `alarmUpdates` asynchronous stream is no longer scheduled
  with AlarmKit." `alarms`: "Fetches all alarms from the daemon that belong to the current client."
- **Belgede yok:** kişinin sistem arayüzündeki "Kapat"a (ya da Apple Watch'tan durdurmaya, zaman aşımıyla susmaya)
  dokunmasının `stop(id:)` ile aynı sonucu verdiği. Makul okuma bu (örnek projenin "automatically handles stop"
  cümlesi), ama yazılı değil.
- **Yanlış yorum (kodda):** `lib/alarmLog.js` başındaki "Çalıp kapanan alarm iOS'ta silinir (Apple belgesi)" ve
  `AlarmPlugin.swift` belge yorumundaki `current()` notu ("çalıp kapanan alarm iOS'ta silinir") yalnız **tek seferlik**
  alarm için doğrudur; tekrarlayan alarm silinmez.

### 2.4 Nefona'nın bugünkü kodu

- `AlarmPlugin.schedule`: önce ertelemeli kurulum denenir: `AlarmPresentation(alert:countdown:)` (geri sayım sunumu
  **var**), `Alarm.CountdownDuration(preAlert: nil, postAlert: 9 * 60)`, `secondaryButtonBehavior: .countdown`,
  stopIntent ve secondaryIntent yok. `schedule` hata atarsa ikinci yol: `.alarm(schedule:…)` + `.custom` +
  `OpenNefonaIntent` (geri sayım sunumu yok). Hangisinin kurulduğu JS'e `snooze` olarak döner ve `set` olayına yazılır.
- Kod yorumu ("VARSAYIM: geri sayım (erteleme) widget uzantısı isteyebilir; reddedilirse …") Apple'ın uyarısını
  **eksik** karşılıyor: Apple kurulumun reddedileceğini söylemiyor, kurulan alarmın sonra kapanabileceğini söylüyor.
  Yani `snooze: true` dönmesi güvende olduğumuz anlamına gelmez.
- Kullanılan `AlarmPresentation.Alert(title:stopButton:secondaryButton:secondaryButtonBehavior:)` ve `stopButton`
  belgede "Deprecated" başlığı altında; yerine `init(title:secondaryButton:secondaryButtonBehavior:)` ("system-provided stop
  control"). Çalışmayı bozduğuna dair bir şey belgede yok.
- Projede tek hedef var (`project.pbxproj`: yalnız `com.apple.product-type.application`); widget uzantısı yok,
  `Info.plist`'te `NSSupportsLiveActivities` yok. Uygulamanın alt sınırı iOS 15; AlarmKit zayıf bağlı.
- **Tek alarm:** `AlarmPlugin.schedule` yenisini kurduktan sonra `cancelStored()` ile eskisini iptal eder; JS
  (`AlarmSetup.submit`) kaydı `saveAlarm(cfg)` ile üzerine yazar. Yani **her yeni kurulum (deneme alarmı dâhil) önceki
  alarmı siler.**
- **Uygulama AlarmKit'i hiç sormuyor:** JS'te `Alarm.current()` çağrısı yok (YAPILACAKLAR D4); "kurulu" yazısı yalnız
  kayıttan. `Alarm.list()` yalnız test derlemesindeki tanıda (Bilgi → "Alarm ve bildirim (tanı)", `alarmDiag`).
- Kaydı değiştiren yollar (hepsi bu kadar): `AlarmSetup.submit` (kur/değiştir), `AlarmSetup.remove` ve
  `AlarmLine.turnOff` (kapat: AlarmKit iptal + `on: false` + `cancel` olayı), `AlarmLine.restore` ("Geri al"),
  `AlarmCard`'ın iOS 26 öncesi "Yalnız yarın" yolu (`kind: 'notify'`) ve "Tüm verileri sil" (`cancelAlarm` + kayıt ve
  günlük silinir).
- Günler boşsa (`AlarmSetup`'ta "Yalnız yarın · gün seçersen her hafta çalar") `buildAlarm` tek seferlik `at` yazar, Swift
  `.never` kurar.

---

## 3. Olası nedenler

Sahibin gördüğü iki şey birlikte açıklanmalı: (a) ikinci gün çalmadı, (b) 09.32'de Ana sayfa "— alarm yok".

| # | Neden | (a)'yı açıklar mı | (b)'yi açıklar mı | Kanıt | Nasıl doğrulanır |
|---|---|---|---|---|---|
| N1 | **Kayıt tek seferlik kuruldu ya da tek seferlik bir alarmla değiştirildi** (06.35 kurulurken gün seçimi boş kaldı / "Yalnız yarın"; ya da 06.35'ten sonra, 09.32'den önce başka bir tek seferlik alarm kuruldu) | Evet: tek seferlik alarm durunca silinir (`stop(id:)`) ya da yenisi eskisini iptal eder (`cancelStored`) | Evet: geçmiş tek sefer → `nextRing` boş | `nextRing`, `buildAlarm`, `stop(id:)`, `AlarmPlugin.schedule` tek alarm kuralı | Alarm günlüğündeki `set` olaylarının `days` alanı (06.35 kaydı `[1,2,3,4,5,6]` mi `[]` mi; arada başka `set` var mı). Bugünkü tanı yalnız olay türünü yazar, `days`'i yazmaz (bkz. Adım 1). |
| N2 | **Alarm kapatıldı**: Ana sayfa satırındaki "Kapat", kurulum ekranındaki "Kaldır" ya da "Tüm verileri sil" | Evet (AlarmKit iptal) | Evet (`on: false` ya da kayıt yok) | `AlarmLine.turnOff`, `AlarmSetup.remove`, App `onReset` | Günlükte `cancel` olayı (via `home` ise Ana sayfa). "Tüm verileri sil" günlüğü de siler: tanıda "Kayıt: yok" ve olay listesi boş/yeni. |
| N3 | **Uygulama verisi (localStorage) kayboldu** ve ayrıca AlarmKit alarmı kayboldu | Yalnız ikinci olayla | Evet ("Kayıt: yok") | İki bağımsız olayın aynı gece olması gerekir: zayıf. WKWebView yerel depolamasının silinmesi belgelerde aranmadı (VARSAYIM) | Tanıda "Kayıt: yok" ama başka modül verileri (oturumlar) duruyorsa bu değil. |
| N4 | **Apple'ın uyarısı: sistem geri sayım sunumlu alarmı uzantı olmadığı için kapattı** | Evet (belgenin sözü bu) | **Hayır**: kayıt açık ve Pzt–Cmt kalırdı, satır "06:35 alarm" derdi | §2.1 | Kayıt açık + günler `[1..6]` + `cancel` yok + AlarmKit'te saklanan kimlik yok (alarm sayısı 0) → N4 (ya da başka bir sistem silmesi) tek aday kalır. |
| N5 | Erteleme sonrası durumda takılma (kişi "9 dk ertele"ye bastı; geri sayım Canlı Etkinliği uzantısız) | Belki | Hayır (aynı nedenle) | Erteleme durumunun uzantısız ne yaptığı belgede yok | Sahibe sor: ilk gün "Kapat" mı "Ertele" mi? Tanıda AlarmKit alarmının `state`'i (`countdown`/`paused` kalmışsa). Erteleme olayını uygulama kaydetmiyor. |

Önemli zaman notu: 09.44–09.50 deneme alarmı, tek alarm kuralı yüzünden o anki kaydın ve AlarmKit alarmının **yerine
geçti**. Bugün tanı açılırsa "Kayıt" satırı 09.50 denemesini gösterir; 06.35'in izini yalnız günlükteki eski `set` ve
`cancel` olayları taşır (günlük en çok 800 olay tutar, tanı son 10'unu gösterir).

---

## 4. Önerilen plan

### Adım 0 · Kod yok: tanıyı oku (sahip)
Test derlemesinde Bilgi → "Alarm ve bildirim (tanı)" ekran görüntüsü. Okuma:
- "Son olaylar"da 09.50'den önce `cancel` var → **N2**.
- `set` olayları: 06.35'ten sonra 09.32'den önce başka `set` var → **N1** (değiştirildi).
- Yalnız tek `set` (06.35) ve `cancel` yok → `days` bilinmeli (Adım 1 ya da Veri merkezi dışa aktarımı); `[]` ise **N1**.
- `days` `[1..6]`, `cancel` yok → (b) açıklanamıyor; kaydın kendisi bozulmuş olabilir, ayrıca bakılır.

### Adım 1 · Küçük JS değişikliği (Xcode hedefi gerekmez)
1. `alarmDiag`: `set` olaylarında saat, `days`, `kind`, `snooze` ve `via`'yı da yazsın (bugün yalnız tür ve `via`).
   `alarmDiag.test.js`'e beklenti eklenir.
2. **Kayıt ile AlarmKit'i karşılaştır:** açılışta ve öne gelişte (App'in `alarmStatus` yenilediği yerde) `Alarm.current()`
   çağrılır. Kayıt açık, `kind: 'alarmkit'` ve `scheduled: false` ise: günlüğe yeni bir olay (ör. `lost`, `EVENT_TYPES`'a
   eklenir) ve Ana sayfa satırında "Alarm telefonda kurulu değil · Yeniden kur". Böylece N4 bir daha sessiz kalmaz ve
   ilk kez ölçülür. (`lib/alarmLog.js` `EVENT_TYPES` ve `AlarmLine.jsx` değişir; metin sahip onayına.)
3. Kurulum ekranında günler boşken "Kur" düğmesinin metni "Yalnız yarın kur" olsun (N1'in kullanıcı hatası yolunu
   kapatır; metin sahip onayına).
4. Yanlış yorumlar düzeltilir: "çalıp kapanan alarm iOS'ta silinir" → "tek seferlik alarm çalıp durunca silinir;
   tekrarlayan bir sonraki güne kurulur (`stop(id:)`)".

### Adım 2 · Ertelemeye karar (sahip)
- **Seçenek A (Apple'ın beklediği):** Widget Extension hedefi eklenir (Adım 3). Erteleme kalır.
- **Seçenek B (en az risk, bugün yapılabilir):** Erteleme geçici kaldırılır; alarm `AlarmPlugin.schedule`'daki ikinci yolla
  (`.alarm(schedule:…)`, `.custom`, "Nefona'yı aç", geri sayım sunumu **yok**) kurulur. Apple'ın uyarısının koşulu ortadan
  kalkar. Bedeli: 2026-09-28 sahip kararı olan "9 dk ertele" düğmesi gider.
- **Seçenek C:** Önce B, uzantı hazır ve cihazda sınanınca A.

### Adım 3 · Xcode hedefi değişikliği (yalnız Seçenek A/C; Mac'te Xcode ile, burada derlenemez)
1. File → New → Target → **Widget Extension** ("Include Live Activity" işaretli). Uzantının dağıtım hedefi iOS 26.0
   (AlarmKit'in alt sınırı); ana uygulama iOS 15'te kalır.
2. Uzantıda `ActivityConfiguration(for: AlarmAttributes<NefonaAlarmMeta>.self)`: kilit ekranı, Dynamic Island ve
   StandBy görünümü ("Ertelendi · 8:59" geri sayımı). Belgedeki tanım: "The widget extension receives the same
   `AlarmAttributes` structure that you provide … when scheduling alarms."
3. `NefonaAlarmMeta` bugün `AlarmPlugin.swift`'in içinde; ayrı bir dosyaya taşınır ve **iki hedefin de** Target
   Membership'ine eklenir (aynı tür iki tarafta da olmalı).
4. Ana uygulamanın `Info.plist`'ine `NSSupportsLiveActivities = YES` (VARSAYIM: ActivityKit belgesi depoda yok; Adım 3'ten
   önce okunmalı).
5. Yeni bundle kimliği (ör. `<uygulama kimliği>.AlarmWidget`), Apple Developer'da kimlik ve provizyon profili; ana
   hedefin "Embed Foundation Extensions" adımına uzantı eklenir. App Group gerekmez (uzantı yalnız `AlarmAttributes`'u
   gösterir; VARSAYIM).
6. İsteğe bağlı aynı işte: kullanımdan kalkan `Alert(title:stopButton:…)` yerine `init(title:secondaryButton:secondaryButtonBehavior:)`.

### Adım 4 · Cihazda sınama (her seçenekte)
1. **Tekrarın kalıcılığı (kısa):** her gün seçili, 2 dk sonraya alarm; çalınca "Kapat"; tanıda AlarmKit alarmları 1,
   `state` `scheduled`, Ana sayfa "yarın". Aynısı "Ertele" → yeniden çalış → "Kapat" ile.
2. **Gerçek gün:** Pzt–Cmt bir sabah saati; üç gün üst üste çalıp çalmadığı ve her sabah tanı görüntüsü.
3. Seçenek A'da aynı testler uzantılı derlemeyle; uzantısız derlemeyle fark varsa N4/N5 ölçülmüş olur.
4. Sonuç `cihaz-B*.md` tablosuna yazılır.

---

## 5. Sahibe sorular

1. Test derlemesinde Bilgi → "Alarm ve bildirim (tanı)" ekran görüntüsünü gönderir misin? (Bütün "Son olaylar" görünsün.)
2. 06.35'i kurarken gün düğmelerinde Pzt–Cmt seçili görünüyor muydu, yoksa altta "Yalnız yarın" mı yazıyordu?
3. 06.35'i kurduktan sonra, ertesi sabaha kadar başka bir alarm kurdun mu, Ana sayfa satırından "Kapat" dedin mi ya da
   "Tüm verileri sil"e dokundun mu?
4. İlk gün alarm çalınca "Kapat"a mı, "9 dk ertele"ye mi dokundun? Apple Watch'tan mı durdurdun?
5. Erteleme şart mı? Seçenek A (widget uzantısı: yeni Xcode hedefi, yeni bundle kimliği ve profil, Mac'te iş) mi,
   Seçenek B (erteleme şimdilik kalkar, ikinci düğme "Nefona'yı aç") mı, Seçenek C (önce B, sonra A) mı?
6. Adım 1'deki "Alarm telefonda kurulu değil · Yeniden kur" satırı ve "Yalnız yarın kur" düğme metni uygun mu?
7. Telefondaki iOS sürümü?

---

## 6. Belgede olmayanlar (özet)

- Uzantısız geri sayım sunumunda alarmın hangi durumda, ne sıklıkla kapandığı; tekrarın da bitip bitmediği.
- `preAlert: nil` ertelemeli alarmın "countdown presentation" sayılıp sayılmadığı.
- Sistem arayüzündeki "Kapat"ın, Apple Watch'tan durdurmanın ve zaman aşımıyla susmanın `stop(id:)` ile aynı sonucu
  verdiği.
- `SecondaryButtonBehavior` sayfasındaki "displays if you use `custom`" cümlesinin `.countdown` için anlamı.
- ActivityKit ayrıntısı ve `NSSupportsLiveActivities` gerekliliği (sayfa depoda yok, okunmadı).
