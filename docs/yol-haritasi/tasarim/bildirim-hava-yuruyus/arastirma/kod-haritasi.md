# Bildirim, hava, yürüyüş: kod haritası (araştırma notu)

Kaynak: `app/` HEAD `d1eea7e` (2026-09-30). Yalnız okundu; `app/` altında hiçbir şey değişmedi. Satır numaraları bu
commit'e göredir. Ana oturum `Home.jsx`'i ve gece bildirimi düzeltmesini yaparken numaralar kayacaktır: her atıfta dosya
adı ve işlev adı da var, satır bulunamazsa onlarla aranır. Planlardaki atıflar da kaymış: `SONSUZ_YOL.PLAN.v1.md` §E.6
"`App.jsx:478-513`" diyor, plan kurulumu bugün `App.jsx:494-530`'da; §E.7 "`Home.jsx:207`" diyor, tarih satırı bugün
`Home.jsx:259`'da.

## Sonuçlar (12 madde)

1. **Bugün tek plan var.** `planNotifications` (`lib/notifyPlan.js:121-210`) saf bir işlevdir; 7 gün (`:17`) için
   dört deney türünü (mola, yürüyüş, nefes, su) ve Çalışma günlerini `7400 + gün×10 + tür` kimliğiyle (`:18`, `:185`,
   `:193`), çalışma oturumunu `7500 + k − 1` ile (`:19`, `:204`) üretir. `notifyApply.js` kendi aralığında (7400–7499,
   7500–7509; `:15-18`) planda olmayan her bekleyeni iptal eder (`:90-98`). Plan dışı bildirimler üç ayrı yoldan
   kurulur ve bu aralığın dışındadır: 7301 mola bitti, 7302 deneme (`restNotify.js`), 7600–7607 alarm yedeği
   (`alarmNative.js:9-11`).
2. **En kötü durumda bugün 48 bildirim bekler:** 35 (7 gün × 5 tür) + 4 oturum + 7301 + 7302 + 7 alarm yedeği. Planlanan
   yağmur (7700–7701) ile 50 olur. Plan bu sayıyı ≈49 ve ≈51 diye yazıyor (§E.6). 64 sınırı VARSAYIM.
3. **Gece "kalk" bildiriminin kaynağı doğrulandı.** Çalışma oturumu bildirimleri 09–21 penceresine bakmaz ve
   `timeSensitive` düzeyindedir (`notifyPlan.js:199-206`). Metinlerin hepsi "Kalk", "uzağa bak" der (`:84-90`). Oturum
   iki yerden başlar: Mola bitti ekranı (`modules/mola/view.jsx:90-96`) ve Hatırlatmalar (`Reminders.jsx:136-145` →
   `App.jsx:693-696`). Örnek: 20.30'da başlayan 4 saatlik oturum 21.30, 22.30, 23.30 ve 00.30'da "Kalk" der.
4. **Gece bildirimi kurabilen başka yollar da var** ("kalk" demeseler de): Çalışma günleri saati pencereye hiç
   bakılmadan kurulur (`reminders.js:285-290`, `notifyPlan.js:189-196`; saat seçici her saati kabul eder,
   `Schedule.jsx:13, 55`). 7302 denemenin başladığı saatin 5 gün sonrasına kurulur (`restNotify.js:115`); 23.40'ta
   başlayan deneme 23.40'ta bildirim verir. 7301 molanın bittiği ana kurulur (`restNotify.js:69-91`). Alarm yedeği
   kişinin seçtiği saattedir (bilerek). `walkNudge` bildirim değildir, uygulama içi karttır ve 09–21 dışında çıkmaz
   (`health.js:11, 27-31`). WalkGuard yalnız iptal eder, bildirim kurmaz (`HealthPlugin.swift:314-337`).
5. **Bugün de "üst üste" binme var.** (a) Oturumun son bildirimi oturumun bittiği andadır
   (`notifyPlan.js:201-202`), ama `inFocus` bitiş anını dışarıda bırakır (`:132`, `t < span.end`). 11.30'da başlayan 1
   saatlik oturumda 12.30 mola hatırlatması ile 12.30 oturum bildirimi aynı dakikada gelir. (b) 60 dk kuralı yalnız
   ayar anında ve yalnız deney türleri ile Çalışma günleri arasında denetlenir (`reminders.js:286-297`). Oturum, 7301,
   7302, alarm ve yağmur bu kurala girmez.
6. **Ortak bir bitiş bileşeni yok.** On beş modülün her birinin kendi sonuç ekranı var ve her biri farklı bir dosyada
   (§3 tablosu). En az dokunuşlu yol: ortak bir `RemindField` bileşeni. App, `ctx` içinde bunu modüle ve rotaya bağlı
   olarak verir (`App.jsx:991`). Her modül bu alanı kendi bitiş bloğuna tek satırla koyar. Bunun için her modülde iki
   satır değişir: `view.jsx` ve ekran dosyası.
7. **Yeni ayar `settings.reminders` içine konamaz.** `normalizeReminders` yalnız bildiği alanları döndürür
   (`reminders.js:259-282`). Hatırlatmalar ekranı her kayıtta normalize edilmiş nesneyi yeniden yazar
   (`Reminders.jsx:185, 192-236`). Oraya eklenen her yeni alan ilk dokunuşta silinir. Modül hatırlatmaları için ayrı bir
   ayar anahtarı gerekir (öneri: `settings.moduleReminders`).
8. **Deney bozulmasın diye:** nefes, mola ve su modüllerinde "Bana hatırlat" yeni bir kayıt açmaz, mevcut deney türünü
   (`reminders.types.breath|mola|water`) açıp saatini yazar. Bu türlerde v1'de tek saat seçilir. Birden çok saat
   seçilirse sessiz günde de bildirim gider ve karşılaştırma bozulur. `routine` için Çalışma günleri (`study`) ile aynı
   iş iki kez yapılmamalı: öneri, routine hatırlatmasının `study`'ye yazılması. Öteki modüller deney dışıdır: zar yok,
   günlük yok.
9. **"Sen karar ver" için uygulama açılış saati tutulmuyor.** `lib/dayOpen.js` yok (plan §F.3'te Y3 olarak duruyor).
   Saat bilgisi taşıyan kayıtlar şunlar: `sessions[].date` (kaydın yazıldığı an, ISO; `storage.js:89-93`) ve varsa
   `seconds` (başlangıç ≈ `date − seconds`), `tests[].date` (`storage.js:83-87`), habit-log `at` (`habitLog.js:297`),
   yoga `date = endedAt` (`yogaRecord.js:52`), alarm günlüğü (`alarmLog.js:7-19`). Gece kayıtları (Dalga uyku sesi
   `sleep: true`, alarm) sayılmamalı. Veri yoksa manifestteki `remind.defaultTime` kullanılır.
10. **Profil'de "Bildirimler" yeni bir bölüm olmalı; Hatırlatmalar ekranı detay olarak kalır.** `ProfileHome` sırası:
    hesap → Alarm (`ProfileHome.jsx:175`, `AlarmPref` `:320-353`) → Seslendirme (`:177`) → İzinlerim (`:179`). Öneri:
    Alarm'dan sonra, `alarmProfile()` kalıbıyla (`App.jsx:840-852`) App'ten gelen bir `notifications` özeti.
    Hatırlatmalar ekranı (`Reminders.jsx`; Bilgi → Günlük düzen, `Info.jsx:201-207`) deney türlerinin, oturumun ve
    Çalışma günlerinin detay ekranı olarak kalır. Tek değişiklik: nereye döneceği parametreye bağlanır. Bugün sabit
    olarak `go('info')` yapıyor (`App.jsx:1020`).
11. **Adım satırı `Home.jsx:288-293`'te.** Satır `hh-facts hh-chips` şeridinin (`:283-296`) bir hapıdır. Hava için en
    az dokunuşlu yer bu şeridin hemen üstü, yani `:283`'ten önce. Plan (§E.7) havayı tarih satırına (`:259`)
    koyuyordu. Ana oturum Ana sayfayı yeniden tasarladığı için hava kendi başına çalışan bir bileşen olmalı
    (`<SkyLine now data />`) ve tek satırla takılmalı.
12. **Eşdeğerlik ve sayı sınırı:** `planNotifications`'a dokunulmaz. Modül hatırlatmaları ayrı ve saf bir
    `planModuleReminders` işlevinden gelir. İki çıktıyı `planAll` birleştirir. Hiç modül hatırlatması yokken
    `planAll ≡ planNotifications` olmalı; bu, 20.000 rastgele bağlamla ve derin eşitlikle sınanır. Modül
    hatırlatmaları için öneri: kısa ufuk (3 gün), ortak saat dilimleri (bir dilimde tek bildirim; birden çok modül tek
    metinde birleşir) ve toplam bekleyen bütçesi (≤ 60). `repeats`'li takvim tetiği önerilmez: "bugün yaptıysan
    gönderme" kuralını ve sessiz günü uygulayamaz (`notifyApply.js:8`).

## Önerilen `remind` manifest alanı (taslak)

`modules/registry.js`'teki sözleşme yorumuna, `sessions?` bloğundan önce eklenecek biçimde:

```js
//   remind?: {                          "Bana hatırlat": modülün bitiş ekranındaki ortak alan (components/RemindField.jsx)
//                                       ve Profil → Bildirimler. Planı lib/moduleRemind.js kurar; lib/notifyPlan.js'e
//                                       dokunulmaz. Yoksa modülde alan çıkmaz (ör. alarm, awareness, emekliler).
//     route?: string,                   dokununca açılacak ekran; routes'tan biri ya da 'home' (günden güne değişen
//                                       yol durakları için). Yoksa alanın gösterildiği ekran, o da yoksa routes[0].
//                                       Açılış App.jsx go() üzerinden: göz kalibrasyonu, göz bütçesi ve ask.before aynen.
//     legacy?: 'mola'|'walk'|'breath'|'water'|'study',
//                                       bu modülün hatırlatması zaten var olan tür (lib/reminders.js). Ayar
//                                       settings.reminders.types[legacy]'ye (study'de settings.reminder'a) yazılır;
//                                       zar, sessiz gün, günlük ve 'doneBefore' aynen işler. Tek saat (maxTimes 1).
//     defaultTime?: 'HH:MM',            "Sen karar ver" için veri yokken saat; WINDOW (09:00–21:00) içinde olmalı
//     maxTimes?: 1 | 2 | 3,             elle seçilebilecek en çok saat (varsayılan 2; legacy varsa 1)
//     doneToday?(sessions, now) → bool  bugün yapıldıysa o günün kalan hatırlatması kurulmaz. Yoksa bugün
//                                       progression.match ?? sessions.match tutan kayıt var mı.
//     texts?: [{ title, body }]         Nef dili, 3–6 metin (kısa, "sen", suçlamasız, sağlık iddiasız, gece "kalk" yok;
//                                       en az biri öz-yeterlik ifadesi). Yoksa ortak şablon (lib/moduleRemind.js).
//   }
```

`validateManifest` (`registry.js:94-126`) bilinmeyen alanı reddetmez; bu alan eklenince bugünkü modüller geçerli kalır.
Yeni kurallar şunlar olur: `remind` bir nesnedir; `route` `routes`'ta ya da `'home'`dur; `legacy` beş türden biridir;
`defaultTime` pencerenin içindedir; `maxTimes` 1–3 arası bir tam sayıdır ve `legacy` varsa 1'dir; `doneToday`
işlevdir; `texts` her biri `title` ve `body` taşıyan bir dizidir. `createRegistry` bir `reminders()` erişicisi
(`live.filter((m) => m.remind)`) kazanır.

Ayar (öneri; `settings.reminders`'tan ayrı, bkz. Sonuç 7):

```js
// settings.moduleReminders = { [moduleId]: { on: bool, mode: 'auto'|'manual', times: ['HH:MM', …],
//                                            route: string, autoAt: ISO|null, setAt: ISO } }
// legacy'li modüller burada tutulmaz: onların tek kaynağı settings.reminders (ve study'de settings.reminder).
```

---

## 1. Bugünkü bildirim sistemi

### 1.1 Türler ve kimlikler

| Kimlik | Ne | Kim kurar | Düzey | Pencere |
|---|---|---|---|---|
| 7400 + gün×10 + tür (tür 0–3: mola, walk, breath, water) | deney türleri | `notifyPlan.js:185-186` | active | 09–21, su ≤ 18 (`:175`) |
| 7400 + gün×10 + 4 | Çalışma günleri | `notifyPlan.js:190-195` | active | **yok** |
| 7500–7503 (7509'a dek ayrılmış) | çalışma oturumu, k. saat | `notifyPlan.js:200-206` | **timeSensitive** | **yok** |
| 7301 | "Mola bitti" (göz bütçesi kilidi) | `restNotify.js:69-91` (`eyeBudgetStore.js:38`, `RestLock.jsx:39`) | active, `foreground: false` | yok |
| 7302 | deneme raporu (5. gün) | `restNotify.js:112-139`, App `:545-556` | active | yok |
| 7600–7606, 7607 | alarm yedeği (iOS < 26): haftalık `schedule.on`, tek sefer | `alarmNative.js:50-54, 82-100` | timeSensitive | kişinin saati |
| 7700–7701 (plan) | yağmur | plan §E.6; kod yok | active | sabah |

`TYPE_INDEX` (`reminders.js:224`), `NUDGE_TYPES` (`:223`). Kimlikler: `notifyPlan.js:18-19`. Kendi aralığı:
`notifyApply.js:13-20`. `cancelAll` hiç kullanılmaz (`notifyApply.js:8`).

### 1.2 Ufuk, sayı, pencere, aralık

- **Ufuk:** `HORIZON_DAYS = 7` (`notifyPlan.js:17`); döngü `:162`. Geçmiş an kurulmaz (`:170`). 60 sn'den yakın yeni an
  kurulmaz; ama aynı an önceden planlandıysa planda kalır (`:171`, `LEAD_MS` `:20`).
- **En kötü durumda bekleyen:** 7 × 5 = 35 (74xx) + 4 (75xx) + 7301 + 7302 + 7 (7600–7606; `alarmNative.js:52`) = **48**.
  Tek seferlik alarm kurulursa haftalık olanlar iptal edildiği için (`:93-95`) ikisi aynı anda bulunmaz. Yağmurla
  **50** olur. Plan v2 §7 "7×4+4 = 32" diyor; o sayı Çalışma günleri bildirimi eklenmeden önce hesaplanmıştı.
- **Pencere:** `WINDOW = 09:00–21:00`, `WATER_LAST = 18:00` (`reminders.js:226-227`). Pencerenin dışındaki saat
  kaydırılmaz; `skipReason: 'window'` ile atlanır (`notifyPlan.js:175`). Saat seçici pencerenin dışındaki saati kabul
  etmez (`reminders.js:290-291`). Çalışma günleri bunun dışındadır (`:285`, `:290`).
- **60 dk kuralı:** `MIN_GAP_MIN = 60` (`reminders.js:228`) yalnız ayar anında denetlenir (`timeError` `:286-297`).
  Karşılaştırmaya açık deney türleri ile Çalışma günleri saati girer. Planlayıcı saat kaydırmaz (`notifyPlan.js:7-8`).
  Oturum, 7301, 7302, alarm ve yağmur bu kurala girmez.

### 1.3 Deney (sessiz gün, zar, günlük)

- Zar: `dice(seed, date, type)` FNV-1a ve mulberry32 ile hesaplanır (`notifyPlan.js:24-35`). `SILENT_RATE = 0.25`
  (`:16`). Zar yalnız uygun günde atılır (`:180-182`). Her (gün, tür) için günlüğe bir kayıt yazılır (`:183`); yalnız
  `'send'` kurulur (`:184`).
- Atlama nedenleri: `window`, `thin` (gün aşırı, `:176`), `noData` (yürüyüşte ortalama yok, `:177`), `focus` (`:178`) ve
  `doneBefore` (yalnız gün 0, `:152-157`, `:179`).
- Günlük `gozolcum:notify-log`, tohum `gozolcum:notify-seed` (`notifyLog.js:12-13`). `LOG_DAYS = 120` (`:14`).
  `mergePlanned` geçmişi ve zamanı gelmiş kaydı dondurur (`:99-117`). `mergeForPermission` izin `granted` değilse boş
  planla birleştirir (`:123-126`). `evaluate` (`:162-186`) ve `thinCandidate` (`:192-205`) yalnız `NUDGE_TYPES`'a
  bakar. Günlükteki bozuk tür düşer (`clean`, `:54`), yani yeni bir tür adı günlüğe hiç giremez.
- Anahtarlar "Tüm verileri sil"de mola modülünün `storageKeys` listesinden silinir (`modules/mola/manifest.js:22`).

### 1.4 Uygulayıcı ve "tek plan" ilkesi

- `createApplier` (`notifyApply.js:58-207`). `applyPlan` 400 ms'lik birleştirme penceresi kullanır; pencerede son
  gelen plan kazanır (`:23`, `:115-130`). İşler tek sırada yürür (`:65-69`).
- `reconcile` (`:79-112`) izin `granted` değilse hiçbir şey yapmaz (`:84-85`). Önce bekleyenleri okur, kendi
  aralığında olup planda bulunmayanı ya da planla aynı olmayanı iptal eder (`:87-98`), sonra eksikleri kurar
  (`:99-100`). Aralığın dışındaki bekleyenlere dokunmaz (`:92`). WalkGuard'a yalnız kurulmuş yürüyüş bildirimleri
  gider (`:102-107`).
- **İlkenin sonucu:** kendi aralığına ayrıca kurulan her bildirim bir sonraki planlamada silinir. Bu yüzden yağmur
  bildirimi de modül hatırlatmaları da aynı plana eklenmelidir; ya da ayrı ve dokunulmayan bir aralıkta durmalıdır.
- `cancelOwn` (`:133-159`) bütün aralığı iptal eder (110 kimlik) ve korumaları boşaltır.

### 1.5 Dokunma dinleyicisi

- Uygulamada tek dinleyici bağlanır ve hiç kaldırılmaz. Dinleyici yokken gelen dokunuş en çok 5 tanesi saklanarak
  bekletilir (`notifyApply.js:161-204`).
- Dağıtım `App.jsx:155-196`'da: 7301 Ana sayfayı açar (`:164-169`); 7302 İlk raporu açar (`:170-173`);
  `kind: 'focus'` mola ekranını açar (`:174-177`); `kind: 'alarm'` uyanma işareti koyar (`:178-182`);
  `kind: 'nudge'` günlüğe `tapped` yazar, yeniden planlar ve `TAP_ROUTE`'a gider (`:183-187`). `TAP_ROUTE`: `mola`,
  `walk: 'home'`, `breath: 'breath-1'`, `water`, `study: 'home'` (`App.jsx:92`). Açılış `go` üzerinden olur
  (`:204-253`); kapılar (göz kalibrasyonu, göz bütçesi, `ask.before`) aynen işler.
- Yeni türler için dağıtıcıya `kind: 'remind'` → `goRef.current(extra.route)` ve `kind: 'rain'` eklenir. Deney
  günlüğüne yalnız `NUDGE_TYPES` yazıldığı için (`:184`) yeni türler günlüğü değiştirmez.

### 1.6 Plan tetikleyicileri

`App.jsx:494-530` etkisi şu bağımlılıklarla çalışır: `[planTick, data, health, healthOk, healthWait, notifyPerm]`
(`:530`). `planTick` şu durumlarda artar: öne gelme (`:344-348`), dokunuş (`:185`), oturum başlayıp bitince
(`beginFocus`/`endFocus` `:693-700`), modülde `ctx.refresh` çağrılınca (`:991`) ve Mola ekranı `onSaved`'da
(`mola/view.jsx:181`). `data` her kayıtta ve her ayar değişiminde değişir. Sağlık rızası varken ilk okuma beklenir
(`healthWait`, `:503`; en çok 15 sn, `:101`). Ana anahtar kapalıysa plan bir kez `cancelOwn` ile iptal edilir
(`:522-526`).

## 2. Gece "kalk" bildirimi: kaynak ve öteki yollar (düzeltme ana oturumda)

**Doğrulanan kaynak.** Oturum bildirimlerinin hesaplandığı yer `notifyPlan.js:199-206`: k = 1..hours için `start +
k×HOUR`. Burada ne `WINDOW` ne `inFocus` ne de bir gece denetimi var. Düzey sabit olarak `timeSensitive` (`:204`); bu
düzey İş ve Rahatsız Etme modlarını deler. Metinler `TEXTS.focus` (`:84-90`) ve hepsi "Kalk" ya da "uzağa bak" der.
Başlatma yolları: Mola bitti ekranı (`modules/mola/view.jsx:90-96`, `startFocus`, sonra `onSaved` → `ctx.refresh` →
yeniden plan) ve Hatırlatmalar → Çalışma oturumu (`Reminders.jsx:136-145` → `App.jsx:693-696`). Oturum süresi 1, 2 ya
da 4 saattir (`focus.js:7`) ve başlatma saatine sınır yoktur (`focus.js:36-45`).

Mevcut test bugünkü davranışı sabitliyor: `notifyPlan.test.js:112-130`. Özellikle `:122` (`timeSensitive`) ve `:121`
(saatler). Düzeltme bu testin beklentisini bilerek değiştirir.

**Öteki yollar (tarama):**

| Yol | Gece kurulabilir mi | Metin | Kanıt |
|---|---|---|---|
| Deney türleri (74x0–74x3) | Hayır: pencere dışı `window` | "Kalk…" (mola) | `notifyPlan.js:175`, `reminders.js:290` |
| Çalışma günleri (74x4) | **Evet**: saat serbest (varsayılan 20:00) | "Göz çalışması…" | `reminders.js:285, 290`; `notifyPlan.js:189-196`; `Schedule.jsx:13` |
| 7301 mola bitti | **Evet**: kilit bittiği an | "Mola bitti…" | `restNotify.js:69-91` |
| 7302 deneme | **Evet**: başlangıç saati + 5×24 sa | rapor ve abonelik | `restNotify.js:115` |
| Alarm yedeği 7600–7607 | Evet, bilerek (uyanma) | "Güne başlama vakti." | `alarmNative.js:12-13, 50-54` |
| `walkNudge` | Bildirim değil; 09–21 dışında çıkmaz | "Kalk, 2 dk yürü" | `health.js:11, 27-31`; `Home.jsx:222` |
| WalkGuard | Bildirim kurmaz, yalnız siler | — | `HealthPlugin.swift:314-337` |

"Kalk" diyen tek gece yolu oturumdur. Ama "bütün bildirimlerde gece yok" kuralı konacaksa Çalışma günleri, 7301 ve
7302 de ele alınmalı. 7302 için en basit çözüm: saatin pencereye kıstırılması (5. günün 09–21 aralığına).

## 3. Modül başına "Bana hatırlat": bitiş ekranları ve takma yolu

### 3.1 Modüller ve bitiş ekranları

| Modül (id) | kind | routes | today | progression | sessions.match | Bitiş ekranı | Hatırlatma önerisi |
|---|---|---|---|---|---|---|---|
| alarm | practice | alarm, alarm-pro, alarm-sleep, alarm-sleep-pro, alarm-morning (`manifest.js:9`) | — | — | — | kendi kurulumu | yok (kendisi alarm) |
| awareness | practice | [awareness] | — | — | — | merkez, bitiş yok | yok |
| blink | exercise | [blink] | — | — | `type === 'blink'` (`:12`) | `BlinkExercise.jsx:176` (`phase === 'done'`) | route `blink` |
| breath-count | measure, **retired** (`:24`) | [breath-count] | — | — | `:45` | — | yok |
| breath | practice | breath, breath-rest, breath-1, breath-5 (`:41`) | var (`:88`) | `breathDone` (`:66`) | `:55` | `Breath.jsx:573` (sonuç; Kaydet → `onFinish` Ana sayfaya gider, `breath/view.jsx:77`) | `legacy: 'breath'`, route `breath-1` (`TAP_ROUTE` ile aynı) |
| daily | measure | [daily] | `null` (`:19-21`) | — | — (tests) | `AcuityTest.jsx:951` (`summary`) | yok (karar: E testi haftada bir) |
| dalga | practice | [dalga] | — | — | `:29` | `Dalga.jsx:450` (uyku), `:471` | route `dalga` (uyku kipi hatırlatılmaz) |
| fark-ettin | practice | [fark-ettin] | var (`:42`) | — (`unlocked`) | `:30` | `StreetWalk.jsx:175` | route `fark-ettin` |
| gokyuzu | practice | [gokyuzu] | — | — | `:21` | `Gokyuzu.jsx:216` (`after`) | route `gokyuzu` |
| mola | practice | [mola] (`:13`) | — | — | — (habit-log) | `mola/view.jsx:98-147` ("Mola tamam") | `legacy: 'mola'` |
| notice | practice | [notice] | var (`:33`) | — | `:26` | `NoticeTask.jsx:34` (`done \|\| saved`) | route `notice` |
| quick-look | practice | [quick-look] | var (`:41`) | — | `:31` | `QuickLook.jsx:231` | route `quick-look` |
| reading | measure | [reading] | var (`:18`) | — | — (tests) | `ReadingTest.jsx:518` | yok (haftada bir) |
| routine | exercise | `routine-<set>` (`:136`) | var (`:164`) | `isRoutine` (`:156`) | `:150` | `Routine.jsx:478` (grup), `:495` | `legacy: 'study'`, route `'home'` (gruplar günden güne değişir) |
| snake | practice | [snake] | var (`:38`) | — | `:20` | `SnakeGame.jsx:1156, 1263` (`over`) | route `snake` |
| tek-bakis | practice | [tek-bakis] | var (`:44`) | — | `:33` | `SpanGame.jsx:204` | route `tek-bakis` |
| track | practice | [track] | var (`:47`) | — | `:23` | `TrackGame.jsx:557` | route `track` |
| water | practice | [water] (`:6`) | — | — | — (habit-log) | `water/view.jsx:22-36` ("Kaydedildi") | `legacy: 'water'` |
| weekly | measure | [weekly] | var (`:22`) | — | — (tests) | `AcuityTest.jsx:951` | yok (haftalık; günlük saat modeline uymaz) |
| who5 | measure | [who5] | — | — | `:14` | `screens/Who5.jsx` | yok (14 günde bir) |
| yoga | practice | yoga, yoga-N (`:35`) | var (`:98`) | — | `isYoga` (`:61`) | `modules/yoga/Yoga.jsx:393` (`screen === 'done'`) | route `yoga` |
| yon | practice | [yon] | — | — | `:31` | `Yon.jsx:176` (ayna), `:273`, `:331` | route `yon` |

`routes` yoksa `[id]` alınır (`registry.js:11, 137`). `views.js:1-11` ekran sözleşmesini tanımlar
(`render(ctx, route)`, `ctx` alanları `views.js:6`). `ctx` App'te kurulur (`App.jsx:991`).

### 3.2 Ortak bileşen var mı

Yok. `components/` altında ortak bir "tamamlandı" kartı bulunmuyor. `DayChain` yalnız Breath sonucunda
(`Breath.jsx:578`) ve Ana sayfada (`Home.jsx:316`) kullanılıyor. `DoneMark` Breath'e özel (`Breath.jsx:41`).
`ui.jsx`'te `PageHeader` ve `StepHeader` var (`ui.jsx:73, 92`), ama bitişle ilgili bir bileşen yok.

### 3.3 En az dokunuşlu takma yolu

1. **Tek bileşen:** `components/RemindField.jsx`. Girdisi `{ module, route, state, onSet }`, çizdiği satır "Bana
   hatırlat" ya da "Hatırlatma açık · 16.00 ›". Açılınca iki seçenek sunar: [Sen karar ver] [Saat seç]. Manifestten
   `remind` okunur (`registry.forRoute(route).remind`).
2. **App bağlar:** `ctx` içine `remindField: (route) => <RemindField …/>` eklenir (`App.jsx:991`). Durum
   `settings.moduleReminders` ile `settings.reminders`'tan (legacy) okunur. Kaydetme App'te yapılır: `optIn` null ise
   `'yes'` yazılır ve izin istenir (`answerReminders` kalıbı, `App.jsx:675-680`).
3. **Modül başına:** `view.jsx`, ekrana `remind={ctx.remindField?.(route)}` geçirir; ekran `{remind}`'ı kendi bitiş
   bloğuna koyar. Bu, yukarıdaki tabloda hatırlatması önerilen 14 modülde en çok iki satırdır. `remind` alanı olmayan
   modülde `remindField` `null` döner.
4. **Alternatif (sıfır ekran dokunuşu):** `ask.after` kalıbıyla çıkışta açılan bir sayfa (`App.jsx:204-215`). Girişte
   `entryTests` yerine oturum sayısı tutulur (`:147`, `:252`). Daha az dokunuş ister, ama istenen "modülün sonunda bir
   alan" değil, çıkışta bir sayfa olur. Yedek yol olarak kalabilir.
5. **"Aktif" görünüm:** `RemindField`, modüle yeniden girildiğinde bitiş ekranında durumu okur ("Hatırlatma açık ·
   11.00, 16.00"). İstenirse aynı bilgi modülün Ana sayfa satırındaki `badge` alanına da eklenebilir
   (`views.js:1-5`).
6. **Dokunuşta açılacak rota:** önce `remind.route`. O yoksa bitişin gösterildiği `route` (routine ve breath'te
   önemli: `breath-rest` yol bağlamına bağlıdır, `breath/view.jsx:63`, bu yüzden legacy rotası `breath-1`). O da yoksa
   `routes[0]`. Rota ayarla birlikte saklanır ve dokunuşta `extra.route` ile `go`'ya verilir.

## 4. Mevcut `reminders` türleriyle ilişki

- **Çakışma:** nefes modülündeki "Bana hatırlat", bugünkü `breath` türüyle aynı işi yapar. Mola (`mola`), su
  (`water`) ve Çalışma günleri (`routine` ↔ `study`) da öyle. İki ayrı kayıt olursa aynı gün iki nefes bildirimi gelir.
  Ayrıca sessiz günde bile gelen modül bildirimi deneyin "gelen ve gelmeyen günler" karşılaştırmasını bozar
  (`notifyLog.js:162-186`).
- **Öneri:** `remind.legacy`. Alan, legacy'li modülde `reminders.types[legacy]`'yi okuyup yazar (`on` ve `time`),
  `timeError`'dan geçer (`reminders.js:286`) ve bir saatle sınırlıdır. Böylece deney, günlük, zar ve seyreltme aynen
  kalır. `study` için `settings.reminder`'ın `{ days, time }` alanı kullanılır; alan açıkken günler boşsa "her gün"
  önerilir (Schedule'la aynı kural, `Schedule.jsx:23-27`).
- **Geçiş:** hiçbir veri taşınmaz. Eski ayar zaten legacy'nin kaynağı olduğu için kaybolmaz. Yeni modüllerin ayarı
  yeni anahtarda başlar (`settings.moduleReminders`). "Tüm verileri sil" `store.clearAll` ile bunu da siler
  (`App.jsx:1056`, `storage.js:113-120`). Sonuç 7'deki tuzağa dikkat: yeni alan `settings.reminders` içine
  konmamalıdır.
- **Deneyi bozmamak:** modül hatırlatmaları `planNotifications` dışında kurulur ve günlüğe yazılmaz. Dokunuşları
  `kind: 'remind'` olarak gelir, `markTapped` çağrılmaz. Deney dışı modüllerin bildirimleri iki kola da eşit düşer:
  bu yağmurla aynı gerekçedir (§E.6) ve yalnız gürültü ekler. Legacy türlerde birden çok saat istenirse ayrı bir
  karar gerekir: o günün bütün saatleri aynı zarı paylaşmalı (sessiz günde hepsi sessiz kalır) ve günlükte tek kayıt
  olmalı. Bu, deney tasarımında bir değişikliktir ve sahibin onayını ister.
- **Ana anahtar:** modül hatırlatmaları da `optIn === 'yes'` iken çalışır (`notifyPlan.js:126`, `App.jsx:522-526`).

## 5. "Sen karar ver" için zaman verisi

| Veri | Saat var mı | Nerede | Not |
|---|---|---|---|
| `sessions[].date` | Evet, ISO; kaydın yazıldığı an (çoğunda bitiş) | `storage.js:89-93` | `seconds` varsa başlangıç ≈ `date − seconds` (ör. `Breath.jsx:330`, `Dalga.jsx:305`) |
| yoga kaydı | Evet, `date = endedAt` | `yogaRecord.js:52` | |
| `tests[].date` | Evet, ISO | `storage.js:83-87` | ölçümler |
| habit-log | Evet, `at` ISO | `habitLog.js:263, 297` | mola ve su |
| notify-log | `plannedAt` var, dokunuş saati yok | `notifyLog.js:5-6` | `tapped` yalnız evet/hayır |
| alarm günlüğü | `at`; kurulumda `hour`/`minute`; `sleep`, `wake` | `alarmLog.js:7-19` | gece ve sabah; "kullanım saati" sayılmamalı |
| Dalga uyku sesi | `sleep: true` kaydı gece | `Dalga.jsx:249` | dışarıda bırakılmalı |
| Günün ilk açılışı | **Yok** | plan §F.3 `gozolcum:day-open` (Y3); `lib/dayOpen.js` yok | gelirse en iyi kaynak bu olur |

**Öneri (saf işlev, `lib/moduleRemind.js suggestTime`):** son 28 günün kayıtları alınır, gece kayıtları atılır
(`sleep: true`, alarm). Yerel saat 09:00–20:59 arasında kalanlarda saat başına **farklı gün** sayılır (tek günün beş
turu tek sayılsın). Önce modülün kendi kayıtlarına bakılır (`sessions.match`); bunlar en az 3 günse onlar, değilse
bütün etkinlik kullanılır. En yüksek saat seçilir, dakika 15'e yuvarlanır (`alarm.js:15, 42` `roundTo` kalıbı). Sonra
dolu dilimlerden en az 60 dk uzaktaki en yakın boş dilime kaydırılır. Veri yoksa `remind.defaultTime`, o da yoksa
12:00'den sonraki ilk boş dilim kullanılır. Saat her planlamada değişirse kişinin kafası karışır. Bu yüzden `mode:
'auto'` kaydında saat en çok 7 günde bir yeniden hesaplanır (`autoAt`). Ekranda alarmdaki "Sana göre · şu an …"
kalıbıyla gösterilir (`App.jsx:849`).

## 6. Profil'de "Bildirimler" bölümü

- `ProfileHome` bugünkü sırası: başlık ve avatar (`:100-`), hesap (`:160-173` civarı), Alarm (`:175`; `AlarmPref`
  `:320-353`), Seslendirme (`:177`; `VoicePref` `:355-`), İzinlerim (`:179-`), Profil soruları ve Giriş ekranı listesi
  (`:232-243`). Props App'te `:854-883`'te verilir.
- Hatırlatmalar ekranı (`Reminders.jsx`) Bilgi → "Günlük düzen"den açılır (`Info.jsx:201-207`; yalnız iPhone'da).
  İçinde ana anahtar (`:251`), deney türleri (`:256-`), Çalışma günleri (`:346-370`) ve Çalışma oturumu (`:373-377`)
  var. Dönüşü sabit olarak `go('info')` (`App.jsx:1020`).
- **Öneri:** Profil'de, Alarm'dan sonra yeni bir `NotificationsPref` bölümü (`<h2 className="ph-sec">Bildirimler</h2>`).
  Veriyi App, `alarmProfile()` gibi bir `notificationsProfile()` ile hazırlar (`App.jsx:840-852`). Bölümde şunlar
  listelenir: ana anahtar, legacy türler, modül hatırlatmaları (modül adı ve saatleri, aç/kapa), yağmur haberi (Y5)
  ve alarm için "Alarm bölümünde" bağlantısı. En altta "Ayrıntılar" satırı Hatırlatmalar ekranını açar.
  Hatırlatmalar ekranı değişmez (deney notları, Wilson notu, seyreltme, oturum orada kalır); yalnız dönüşü
  parametreye bağlanır (`scheduleBack` kalıbı, `App.jsx:153, 701-704`). İstenirse ekrana bir "Modüller" bölümü
  eklenir. Bilgi'deki satır kalır, çünkü aynı ekrana gider.
- Bölüm yalnız iPhone'da görünür; web'de bildirim yok (`Info.jsx:204`, `App.jsx:722`).

## 7. Ana sayfa: adım satırı ve hava

- Başlık `Home.jsx:257-273`: tarih (`:259`), selam (`:260-263`), avatar (`:265-272`). Sonra oturum şeridi (`:275`),
  yoga sabah kartı (`:278`), sayı şeridi `hh-facts hh-chips` (`:283-296`). **Adım hapı `:288-293`'tedir**
  (`health.hasData` → `fmtSteps(health.today?.steps)` "adım bugün"). Alarm satırı `:294`'tedir.
- **En az dokunuşlu yer:** `:283`'ten hemen önce tek satır, `{sky && <SkyLine sky={sky} now={now} />}`. Adım
  şeridinin üstünde durur ve şeridin koşuluna (`:283`) dokunmaz. Plan §E.7'nin yeri tarih satırıydı (`:259`, eskiden
  `:207`); sahibin isteği "adım satırının üstü" olduğu için ikisinden biri seçilmeli.
- **Bağımlılık:** ana oturum Ana sayfayı yeniden tasarlıyor. Bu yüzden hava işi Home'un iç yapısına bağlanmamalı.
  Sözleşme şöyle olmalı: App bir `sky` prop'u verir (önbellekten; ağ beklenmez, §E.7); `SkyLine` kendi CSS'iyle
  gelir; Home'da tek bir satır değişir ve o satır "adım hapının bulunduğu şeridin hemen üstü" diye tarif edilir.
  Satır numarası tasarımdan sonra yeniden bulunur.

## 8. Testler ve eşdeğerlik

- **Değişmeden yeşil kalmalı:** `lib/notifyPlan.test.js` (26 test; oturum testi `:112-130` gece düzeltmesiyle
  bilerek değişir), `lib/notifyLog.test.js` (21), `lib/reminders.test.js` (10), `modules/registry.test.js` (9; `:8`
  modül listesi yeni modül yoksa aynen kalır), ve `lib/notifyApply.test.js` (17). Bu sonuncusunda bir istisna var:
  `cancelOwn` testi aralığın 110 kimlik olduğunu sabitliyor (`notifyApply.test.js:256`). Aralık genişlerse (yağmur
  7700–7701, modül aralığı) bu beklenti bilerek değişir ve plan §G.4'e yazılmalıdır. Yabancı kimlik testi 7399,
  7510 ve 9999'u kullanıyor (`:117-122`); yeni aralık bunları içermemeli. Ayrıca plan §G.5 listesi.
- **Eşdeğerlik düzeneği (öneri):**
  1. `planNotifications`'a dokunulmaz. `lib/moduleRemind.js` saf `planModuleReminders(input, busy)` verir.
     `planAll(input) = merge(planNotifications(input), planModuleReminders(input, busyFrom(planNotifications(input))))`.
  2. `notifyPlanAll.equiv.test.js`: belirlenimci bir tohumla 20.000 rastgele bağlam üretilir (`now` farklı saatler ve
     yaz saati günleri, `reminders` rastgele açık/saat/`thin`, `study`, `habits`, `sessions`, `health`, `focus`,
     `log`). `moduleReminders` boş, `{}` ya da `undefined` verilir. Beklenen: `expect(planAll(i)).toEqual(
     planNotifications(i))`, yani `notifications` (id, `at`, metin, `extra`, `level`), `log` ve `walkGuards` derin
     eşit. Kalıp: `modules/pathModules.equiv.test.js` ve plan §G.6.
  3. Uygulayıcı düzeyi: aynı plan ile sahte LN'de (`notifyApply.test.js` `fakeLN`) `cancel` ve `schedule` çağrıları
     aynı olmalı. Tek fark `cancelOwn` listesinin uzunluğu olabilir.
  4. Taban çizgisi, gece düzeltmesi girdikten **sonraki** commit olmalıdır; yoksa düzeltmenin kendisi "fark"
     görünür.
- **Yeni testler:** üst üste binmeme (herhangi iki bildirim arası ≥ `MIN_GAP_MIN`; oturum bitiş dakikasındaki
  çakışma dahil, Sonuç 5a); gece yok (bütün bildirimler 09:00–21:00, alarm hariç); modül hatırlatmasında deney
  günlüğü ve `evaluate` değişmez (§E.6'daki yağmur testiyle aynı kalıp); metin denetimi `coachCore.js:91-105`
  (`passesGuard`) ve `notifyPlan.test.js:306` kalıbıyla.

## 9. Bekleyen bildirim sınırı ve ufuk stratejisi

- Senaryo: 10 modülde günde 3 saat seçilirse 7 günde 210 bildirim eder. Bu, 64'ün (VARSAYIM) çok üstünde ve
  bugünkü 48'e eklenecek.
- Asıl sınır zaten "üst üste binmez" kuralından gelir. 09:00–21:00 arasında ve 60 dk aralıkla günde en çok 13
  bildirim kurulabilir. Yani 30 saatlik bir istek hiçbir ufukla karşılanamaz. **Dilim** kavramı gerekir: aynı dilime
  düşen modüller tek bildirimde birleşir (Nef dili: "Nefes ve Yılan seni bekliyor").
- **Öneri:**
  1. Deney türleri 7 günlük ufukta aynen kalır; eşdeğerlik bunu ister.
  2. Modül hatırlatmalarının ufku **3 gündür** (VARSAYIM; plan her açılışta yeniden kurulur). Tek seferliktir: günde
     dilim başına bir bildirim, üç günde en çok 39.
  3. **Toplam bütçe:** `PENDING_BUDGET = 60`. Önce sabitler ayrılır (7301, 7302, alarm 7, yağmur 2, oturum 4 = 15),
     sonra deney türleri (≤ 35), kalan pay (≥ 10) en yakın zamanlı modül bildirimleriyle doldurulur. Uygulama açıldıkça
     ileri kayar. Kişi günlerce açmazsa modül hatırlatmaları kendiliğinden seyrelir. Bu Head 2013'ün
     "azalan sıklık" bulgusuyla çelişmez, ama VARSAYIM'dır.
  4. **Kimlik:** 7800 + gün×20 + dilim sırası (0..12) → 7800–7852; `OWN_RANGES`'e `[7800, 7859]` eklenir. 7510,
     7600–7607 ve 7700–7701 ile çakışmaz. `extra: { kind: 'remind', modules: [id…], route, date }`.
  5. **`repeats`'li takvim tetiği (`schedule.on`) önerilmez.** Bekleyen sayısını dilim başına 1'e indirirdi, ama tek
     günü atlayamaz (`notifyApply.js:8`). Bu yüzden "bugün yaptıysan gönderme" (`doneToday`) uygulanamaz, metin
     dönmez ve `reconcile` onu `same` ile eşleştiremez (`notifyApply.js:40-45`, `every`/`on` varsa hep iptal eder).
     Uygulanırsa ayrı bir aralık ve ayrı bir iptal yolu gerekir.
- **Yürüyüş algılama bildirimi (3) için not:** kodun tek arka plan uyanışı HealthKit gözlemcisidir (saatte bir,
  `HealthPlugin.swift:256-269`). Bu bildirim native tarafta ve hemen gönderilmeli (bekleyen olarak değil). Kimliği JS'in
  kendi aralığının dışında olmalı; yoksa `reconcile` onu siler (`notifyApply.js:90-98`). Gece ve 60 dk kuralı için
  JS, `setWalkGuards` kalıbıyla native'e yasak dilimleri geçirebilir: 09–21 dışı ve kurulu bildirimlerin ±60 dk'sı.
- **Hava bildirimi (2):** plan §E.6'daki gibi `rainNotify` yalnız nesne üretir ve tek plana girer. Dilim ve bütçe
  kuralına o da tabidir; sabitlerden sayılır.
