# Sonsuz yol — Yeni modüller ve veri merkezi eşlemesi

Tarih: 2026-09-29. Kapsam: sahibin isteklerinin (`SAHIP_ISTEKLERI.md` 1–6) **yeni modül** kısmı: 2 dakikalık yürüyüş,
uyku kalitesi, hareket ölçümü, dikkat tespiti, meditasyon, yoga, Bugünün görevi / farkındalık ve gökyüzü molasının
büyümesi. Kademeli gün planı (nefes 1-1-2 dk, kırpma → sağ-sol → üçü birlikte …) ayrı belgede; burada yalnız yeni
modüllerin yola giriş kuralı ve kendi gün tabloları var.

Bu bir PLAN ve TASARIM belgesidir; izlenen hiçbir dosya değiştirilmedi, kod yazılmadı, hiçbir şey "bitti" değildir.

**Okunanlar (baştan sona):** `SAHIP_ISTEKLERI.md`, `docs/ANA_BELGE.md`, `docs/yol-haritasi/YAPILACAKLAR.md` (1–300),
`app/src/lib/today.js`, `app/src/modules/registry.js`, `app/src/lib/dataHub.js` (+ `dataHub.test.js`),
`app/src/lib/progress.js`, `app/src/lib/health.js`, `app/ios/App/App/HealthPlugin.swift`, `Info.plist` (Sağlık satırları),
`App.entitlements`, `app/src/lib/consent.js`, `app/src/lib/iris.js`, `app/src/lib/storage.js`, `app/src/lib/coach.js`,
`app/src/lib/coachCore.js`, `app/src/lib/evidence.js`, `app/src/lib/sources.js`, `app/src/lib/blink.js`,
`app/src/lib/breath.js` (1–80), `app/src/lib/notice.js`, `app/src/lib/gokyuzu.js`, `app/src/lib/habitLog.js`,
`app/src/lib/quicklook.js`, `app/src/lib/span.js`, `app/src/lib/track.js` (baş kısımları), 21 modül manifesti,
`app/src/modules/registry.test.js`, `app/src/lib/today.test.js` (1–35, 136–158), `App.jsx` ve `Home.jsx`/
`Progress.jsx`/`ProgressOverview.jsx` Sağlık satırları (grep), `scratchpad/yoga/PLAN.v2.md` (§0, §A tablo, §E.1–E.4, Ek).
Satır numaraları bugünkü çalışma ağacına aittir.

**Kanıt kuralı bu belgede:** Her PMID bu görevde PubMed'den (`get_article_metadata`) çekilip başlık ve DOI'si
doğrulandı; doğrulanmayan hiçbir kayıt kanıt satırına konmadı. `lib/sources.js`'de zaten olan kaynaklar
"(sources.js)" diye işaretli. Kanıtın sayı vermediği her tasarım değeri **VARSAYIM**. Sağlık iddiası yok:
ekrana yazılacak cümleler "gösterir / sayar / kaydeder" dilindedir; "tedavi eder, iyileştirir, önler" yoktur.

---

## 0. Tek bakışta

| İstek (sahibi) | Karar | Modül id | Halka · tür · alan | Ne kaydeder | Yolda |
|---|---|---|---|---|---|
| 2 dk yürüyüş, sistem izler; yapmayabilir, "sonra yaparım" diyebilir | **Yeni modül** | `walk` | life · practice · body | süre, adım farkı (Sağlık varsa), doğrulandı mı, ertelendi mi | ctx.day ≥ 3'ten itibaren her gün, Nefes'in hemen önünde; göz bütçesine sayılmaz |
| Uyku kalitesi (Sağlık'tan alınıyorsa) | **Yeni modül** (iki kaynak: Apple Sağlık geceleri + tek soruluk sabah cevabı) | `sleep` | life · measure · wellbeing | gece: yatakta/uyuyor dk, orta nokta; sabah: 0–10 tek soru | sabah kartı; yol durağı değil |
| Hareket ölçümü | **Var olanın genişletilmesi** (modül değil) | — (`lib/health.js`, Beden alanı) | body | günlük adım tarihçesi telefonda kalıcı; saat başı hareketsizlik | yol durağı değil; Nef ve Beden kartı |
| Dikkat tespiti | **Yeni ölçüm modülü** + var olan dört dikkat görevi | `tepki` | attention · measure · focus | tepki hızı (1/RT ortalaması), kaçırma sayısı (≥ 500 ms), yanlış başlama | haftada 2 gün, ölçüm yuvasında; nefesten hemen sonra değil |
| Meditasyon (ilk gün 3 dk, sonraki gün yine 3 dk…) | **Yeni modül** (yoga motorunun kısa parçaları) | `meditasyon` | life · practice · calm | parça, planlanan/dinlenen sn, tamamlandı, önce→sonra | ctx.day ≥ 2'den itibaren her gün 3 dk; süre kademesi ayrı belgede |
| Yoga (10 × 30 dk, istenen dakikası) | **Gelecek modül**; taslak `yoga/PLAN.v2.md` §E.4'te var, burada yalnız yola bağlanışı | `yoga` | life · practice · calm (+ ders alanı) | PLAN.v2 §E.4 kaydı | yoga bir kez açıldıysa 2. bölüm sonu, 5 dk durak |
| Bugünün görevi / farkındalık | **Var** (`notice`, `awareness`) → büyüme kuralı | `notice` | attention · practice · awareness | fark edilen sayı 0–3+ | var: finale; büyüme: görev katmanı |
| Gökyüzü molası | **Var** (`gokyuzu`) → yola giriş kuralı | `gokyuzu` | life · practice · calm | dinlenmişlik önce→sonra | yeni: haftada 2 gün, Nefes'le dönüşümlü |

---

## 1. Zaten var olanlar (ikinci kez yapılmaz)

| Sahibinin adı | Modül / dosya | Durum | Not |
|---|---|---|---|
| Yılan oyunu | `app/src/modules/snake/manifest.js`, `app/src/screens/SnakeGame.jsx` | yolda her gün, 2. bölüm sonu (`snake/manifest.js:36-38`) | oyun; görmeyi ölçmez |
| Uzağa bakma | `app/src/modules/routine/manifest.js` grup `uzak` (`lib/routines.js:73`), `screens/Routine.jsx` | yolda 1. bölüm, order 30 (`routine/manifest.js:10`) | |
| Yakın–uzak | aynı modül, grup `yakinuzak` (`lib/routines.js:74`) | yolda order 50 | |
| Göz kırpma | `routine` grubu `kirpma` (`lib/routines.js:76`) **ve** ayrı `blink` modülü (`modules/blink/manifest.js`, `lib/blink.js:61-69`: Kim 2020 + Wolffsohn 2025 döngüsü, 15 tekrar) | `kirpma` yolda order 90; `blink` yolda değil (today yok) | Sahibinin "1. gün kırpma, 2. gün sağ-sol, 3. gün üçü birlikte, 4. gün yukarı-aşağı" dizisi `routines.js` adımlarından (`blink`, `lookRight`, `lookLeft`, `farLook`, `nearFar`, `circleCw`…) kurulur → kademe belgesi |
| E testi (haftada bir) | `modules/weekly/manifest.js` + `lib/today.js:95-101 weeklyStatus` | **zaten haftada bir**: son tam günden 7 gün geçince (`today.js:33 isDue`, `:74-90 lastComplete`) | Günlük E testi (`modules/daily`) haftalık yolda olmayan günlerde her gün (`daily/manifest.js:19-26`); "her gün değil" kararı kademe belgesinde |
| Okuma testleri | `modules/reading/manifest.js:17-21` | haftada bir (`isDue`) | |
| Çemberler | `modules/track/manifest.js:47-49` | yolda her gün, 1. bölüm | |
| Nefes | `modules/breath/manifest.js:55-58`, `lib/breath.js` | yolda her gün 5 dk mola (`PROGRAM_DAY_SEC = 300`, `breath.js:16`); süreler 60/180/300 (`:12`) | 1-1-2 dk kademesi kademe belgesinde |
| Farkındalık | `modules/awareness/manifest.js` (dikkat halkasının merkezi; kendi kaydı yok) | Ana sayfa girişi | |
| Bugünün görevi | `modules/notice/manifest.js`, `lib/notice.js` (7 görev, güne göre döner `:24`) | yolda finale, yalnız bir kez yapıldıysa (`notice/manifest.js:30-33`) | büyüme §4.7 |
| Gökyüzü molası | `modules/gokyuzu/manifest.js`, `lib/gokyuzu.js` (120 sn, 6 soru × 20 sn) | yolda değil (today yok) | yola giriş §4.8 |
| Hızlı Bakış, Tek Bakışta, Fark Ettin mi? | `modules/quick-look`, `modules/tek-bakis`, `modules/fark-ettin` | yolda haftada 3 (dönüşümlü `rotate: 'week3'`) | dikkat ölçüleri §4.4 |
| Adım (Apple Sağlık) | `lib/health.js`, `ios/App/App/HealthPlugin.swift`, `App.jsx:433-459`, `components/ProgressOverview.jsx:165-166, 439-449` | canlı okunur, **depoya yazılmaz** (ANA_BELGE §4 tablosu) | §4.3 |
| Uyku sorusu (profil) | `lib/profile.js:98` `sleep 0–10` (kurulum ve 28. gün) | iris İyi oluş hücresi (`iris.js:22`) | §4.2 bunu bozmaz, yanına ekler |
| Alarm sabah soruları | `modules/alarm`, `lib/alarmLog.js` ("Ses bittiğinde uyumuş muydun?", uyanma günü → İyi oluş) | var | uyku sabah kartı bununla **tek kart** olur (§4.2) |
| Nefes sayma (farkındalık ölçüsü) | `modules/breath-count` **emekli** (`retired: true`) | eski kayıtlar okunur | §4.4'te "dikkat tespiti" için yeniden açılmaz |

---

## 2. Sözleşme ve eklenti noktaları: mevcut sistem nasıl bozulmaz

### 2.1 Modül takma = klasör koymak (değişmez)
- `registry.js:159` bütün `./*/manifest.js` dosyalarını toplar; `validateManifest` (`registry.js:85-115`) yalnız bildiği
  alanları denetler, **bilmediği alanı reddetmez**. Bu yüzden yeni manifestlere eklenecek `grow` alanı (§2.3)
  sözleşmeyi değiştirmeden geçer.
- Zorunlu: `progress.domain` (`registry.js:61-63`), yoksa modül reddedilir (`registry.test.js:70-77`).
- Kayıt tutan modül `sessions.match` verir (`dataHub.js:13-14` "yeni modül kuralı"); vermeyen modül
  `dataHub.test.js:7-15 OTHER_ROUTE` listesine **açıkça** yazılır, yoksa test kırılır (`:18-21`). Bu bir bekçidir:
  `sleep` gece kayıtları bilerek `sessions` dışında tutulacağı için (§4.2) o listeye bir satır eklenir.
- Her modülün `view.jsx`'i olmalı (`registry.test.js:10-15`, `views.js:7-11`).
- `registry.test.js:7` gerçek modül kimliklerinin tam listesini tutar; her yeni modül bu listeye **bir kimlik** ekler
  (envanter bekçisi; kırılma değil, bilinçli güncelleme).
- `registry.test.js:79-108`: metriği olan her modülün kayıt türü için `metSample`'a bir örnek kayıt eklenir
  (`:96-101` `expect(s, x.key).toBeTruthy()`); `tepki` ve `sleep` (sabah sorusu metriği) için birer satır.

### 2.2 Yol (today.js) — ek alan: `ctx.day`
- `buildPath(modules, ctx)` `ctx`'i olduğu gibi yayar (`today.js:198`); modüllerin `today(ctx)`'si `tests, sessions,
  now, profile` ve **istenen her ek alanı** alır. Yeni: `ctx.day` = yolun kaçıncı günü (App, `dataHub.firstDay`
  (`dataHub.js:123-131`) + `calendarDays` (`:134`) ile hesaplar; kurulum günü = 1). `today.js`'e satır eklenmez.
- **Testler nasıl aynı kalır:** `today.test.js:9` planı gerçek `registry.live` ile kurar ve `:20` `DAY` dizisiyle tam
  durak listesini bekler; `path()` `ctx.day` vermez. Yeni modüllerin `today()`'si `ctx.day == null` iken **null**
  döner ("gün bilinmiyorsa yola girme"); böylece `DAY`, `minutesLeft 16`, `blocks [4,4]` ve bütün eski senaryolar
  değişmez. Yeni davranış yalnız `ctx.day` verilen yeni testlerde sınanır (fark-ettin için `STREET3` fikstürü nasıl
  eklendiyse, `today.test.js:16-19`).
- Yeni durak alanı **eklenmez**; "sonra yaparım" için mevcut `slot/order` yeniden verilir (§4.1). `collect`
  (`today.js:118-164`) bilmediği alanı zaten düşürür; bir modül fazladan alan yazsa da yol düşmez (`:125-127`).

### 2.3 Kademe (progression) katmanı — manifestte isteğe bağlı `grow`
```js
// manifest (isteğe bağlı; validateManifest bilmediği alanı reddetmez: registry.js:85-115)
grow: {
  // yol günü → bu durağın o günkü hedefi; kademe belgesi tabloyu verir, today() buradan okur
  level(ctx) → { minutes, variant, label },
  unlockDay: 3,          // bu günden önce yolda görünmez (ctx.day yoksa: görünmez)
}
```
Kademe belgesi (ayrı ajan) nefes/kırpma tablolarını verir; buradaki yeni modüller yalnız kendi `unlockDay` ve
`level()`'ını tanımlar. Katman **modülün içinde** yaşar; `today.js`, `registry.js`, `dataHub.js` değişmez.

### 2.4 Veri merkezi — ek girdi: `nights` (uyku) ve `healthDays` (hareket)
- `hub({ tests, sessions, profile, habits, now })` (`dataHub.js:59`) ve `growthMap` (`:155`) varsayılanlı parametre
  alır; **yeni isteğe bağlı** `nights = []` ve `healthDays = []` eklenir. Mevcut çağrılar (`dataHub.test.js:42, 47, 58`
  `hub({ now })`, `hub({ profile, now })`…) değişmeden geçer.
- `domainSummary` (`progress.js:185-194`) `out.wellbeing.who5 = who5Card(...)` (`:192`) kalıbıyla
  `out.wellbeing.sleep = sleepCard(nights, now)` ve `out.body.move = moveCard(healthDays, now)` ekler; `verifiedChange`
  (`dataHub.js:137-150`) `who5?.status` gibi `sleep?.status` ve `move?.status`'ı okur; `sleep` alanı olmayan nesnelerde
  `?.` sayesinde eski test (`dataHub.test.js:95-101`) aynen geçer.
- Gün doluluğu (`domainDays`, `dataHub.js:102-120`): **yalnız kişinin yaptığı** kaydı sayar (`sessions`, `tests`,
  `habits`). Sağlık'tan kendiliğinden gelen gece ve adım kayıtları dilimi **doldurmaz** (harita "düzen = yapılan"
  ilkesi, `dataHub.js:93`); onlar yalnız alan kartına ve dış kenar yayına girer. Sabah sorusu cevabı ise kişinin
  yaptığı iştir → `sessions`'a yazılır, İyi oluş gününü doldurur (sahibin 8. maddedeki (a) sorusuna da cevap olur:
  İyi oluş dilimi artık yalnız 14 günde bir dolmaz).

### 2.5 İris haritası
- Gelişim/Ana sayfa haritası `growthMap` üzerinden `registry.forSession` ile dolar (`dataHub.js:172, 180`); yeni modül
  `sessions.match` verdiği an alanı kendiliğinden dolar.
- Kurulum ve 28. gün irisi (`iris.js:19-28 irisCells`) hâlâ sorulardan; Dikkat ve Farkındalık "o alandan bir oturum
  var mı" ile (`:24`). `tepki` (focus) ve `notice` (awareness) bu hücreleri doldurur. Değişmez.

### 2.6 Nef'e giden özet
- `moduleSignals` (`coach.js:64-76`) `registry.live` içindeki her `coach()`'u toplar; `sanitizeModules`
  (`coachCore.js:36-52`) en çok **10 modül × 6 alan** geçirir. Bugün coach() veren modüller: breath, breath-count
  (emekli, girmez), fark-ettin, notice, quick-look, snake, tek-bakis, track = 7. Yeni: walk, sleep, tepki, meditasyon,
  yoga = 12 > 10. **Karar gerekir:** sınırı 12'ye çıkarmak (`coachCore.js:41 .slice(0, 10)`, sunucuda da aynı
  dosya) ya da yalnız son 7 günde kaydı olan modüllerin coach() döndürmesi (fark-ettin `:48` ve tek-bakis `:51`
  zaten `null` döndürüyor; breath `:37-41` ve snake `:39-42` her zaman döndürüyor → onlar da boşken `null` dönsün).
  Önerim ikincisi: sınır kalır, sıra kalabalığı kalkar.
- `SYSTEM_PROMPT` (`coachCore.js:75`) yalnız track/snake/breath'i açıklar; yeni modül alanları (ör. `walk.verified7`)
  sunucu isteminde tanımlanmazsa model onları yorumlayamaz → her yeni modül için istemde bir satır (sunucu dosyası;
  bu belgede metni hazır, §5).
- KVKK: `consent.js` coach "Ne" satırı (`:57`) "Ne listesi buildSignals + modül coach() özetleriyle birebir
  tutulmalı" der. Uyku ve yürüyüş özetleri sağlık verisidir → coach rızası metni sürüm 2 olur (`CONSENT_VERSIONS.coach`
  `consent.js:14`), izin vermiş kişiye yeniden sorulur (hukukçu).

---

## 3. Sağlık (HealthKit) — bugün ne var, ne yok

| Konu | Durum (dosya:satır) |
|---|---|
| Okunan türler | `stepCount`, `distanceWalkingRunning`, `appleExerciseTime` (`HealthPlugin.swift:34-38 readTypes`) — **uyku yok** |
| Yöntemler | `isAvailable`, `requestAuthorization`, `dailyTotals({days ≤ 60})`, `recentSteps({minutes 5–1440})`, `setWalkGuards`, `walkGuardLog` (`:22-29`) |
| Arka plan | `WalkGuard`: adım yazılınca saatte bir uyanır, günün toplamı eşiği geçtiyse yürüyüş bildirimini siler (`:158-…`); `com.apple.developer.healthkit.background-delivery` yetkisi `App.entitlements` |
| İzin | iOS okuma iznini söylemez; izin yoksa 0 döner, JS "veri yok" gösterir (`HealthPlugin.swift:8-9`, `health.js:13-14`) |
| Metinler | `Info.plist:13-14 NSHealthShareUsageDescription` (adım, mesafe, egzersiz dakikası); `:9-10 NSHealthUpdateUsageDescription` (yazmayız) |
| Rıza | `consent.js:14 CONSENT_VERSIONS.health = 2`; v1 = "yan yana göstermek" (okuma yeter, `App.jsx:436`), v2 = yürüyüş hatırlatması ve ölçümü (`:437`) |
| Okuma | `App.jsx:454` `readHealth({ days: 60 })`, son 7 gün özet + 60 günlük satırlar bellekte (`:455`); **depoya yazılmaz** |
| Gösterim | Ana sayfa "adım bugün" (`Home.jsx:240-243`), Beden kutucuğu (`ProgressOverview.jsx:166`), Beden ayrıntısı 7 günlük çizgi (`:439-449`), "kalk, 2 dk yürü" önerisi (`health.js:27-31`, `homeSuggest.js:24-26`) |
| Sunucuya | gitmez; Nef'e gitmez (`HealthPlugin.swift:10`, `consent.js:19-21`) |

**Swift bu ortamda derlenmez** (ANA_BELGE §2): aşağıdaki her yeni yerel yöntem "Mac'te derlenip cihazda doğrulanana
kadar `[~]`".

---

## 4. Yeni modüller

Her modül aynı şablonla: Amaç · Ne ölçer, ne ölçemez · Cihaz ve rıza · Manifest taslağı · Kayıt · Merkeze eşleme ·
Yol kuralı ve gün tablosu · Kanıt · Ekrana yazılacak cümleler · Yapılmayan iddialar · VARSAYIM listesi.

### 4.1 `walk` — 2 dakikalık yürüyüş

**Amaç.** Kişi ekrandan kalkar, 2 dakika yürür; sistem yürüyüşü adımla doğrular (Sağlık izni varsa) ya da kişinin
"Yürüdüm" demesini kaydeder. Kişi "Sonra" diyebilir ya da hiç yapmayabilir; her üç durum da veridir.

**Ne ölçer.** Süre (uygulamanın sayacı), başlangıç–bitiş arasındaki adım farkı, doğrulama durumu. **Ne ölçemez:**
yürüyüşün "faydası", tempo, kalori (istenmez).

**Cihaz ve rıza.**
- Var olan `recentSteps({ minutes })` (`HealthPlugin.swift:130-146`) "son N dakika"yı verir; yürüyüş bitince
  `recentSteps({ minutes: 3 })` çağrılır. HealthKit'e adımlar geç yazılabilir (VARSAYIM: iPhone hareket işlemcisi
  toplu yazar, dakikalar sürebilir; cihazda ölçülecek). Bu yüzden iki aşamalı doğrulama: bitişte anlık, uygulamanın
  bir sonraki açılışında `stepsBetween({ start, end })` ile kesin. **Yeni yerel yöntem**: `stepsBetween` (HKStatisticsQuery,
  `recentSteps` ile aynı gövde, tarih aralıklı; `[~]`).
- Rıza: `health` v2'nin "Neden" satırı hareketi göstermek ve yürüyüş hatırlatmasıdır (`consent.js:16-21`). "2 dakikalık
  yürüyüşü adımla doğrulamak" yeni bir amaç → **health v3** (metne bir cümle; izin vermiş kişiye `healthUpdate`
  kalıbıyla yeniden sorulur, `consent.js:37-43`). Hukukçu onayı. İzin yoksa modül **timer + beyan** ile çalışır;
  hiçbir şey kapanmaz (sahibin "izin vermesen de her şey açık kalır" ilkesi, `consent.js:31`).

**Manifest taslağı** (`app/src/modules/walk/manifest.js`):
```js
export default {
  id: 'walk', routes: ['walk'], title: 'Yürüyüş', label: '2 dakikalık yürüyüş',
  ring: 'life', kind: 'practice',
  progress: {
    domain: 'body',
    metrics: [{ key: 'walk-steps', label: '2 dakikada adım', unit: 'adım', better: 'up',
                series: ({ sessions }) => sessions.filter((s) => s?.type === 'walk' && s.verified && Number.isFinite(s.steps)).map((s) => ({ date: s.date, value: s.steps })) }],
  },
  gates: {},                                   // ekrandan uzak; göz bütçesine sayılmaz, molada açık
  storageKeys: ['gozolcum:walk-defer'],        // bugünkü "Sonra" damgası (gün anahtarı)
  home: { section: 'practice', order: 34 },    // Nefes 30, Dalga 35 arası (VARSAYIM)
  sessions: {
    match: (s) => s?.type === 'walk',
    countsTowardGoal: false,                   // 2 dk; haftalık egzersiz hedefini şişirmesin (notice ile aynı gerekçe)
    describe: (s, { seconds }) => ({ title: 'Yürüyüş', detail: join([s.verified ? `${s.steps} adım` : s.selfReport ? 'yürüdüm dedi' : null, durationPart(seconds, false)]) }),
  },
  grow: { unlockDay: 3, level: (ctx) => ({ minutes: 2 }) },      // sabit 2 dk (Dunstan 2012'nin 2 dk'sı); kademe yok
  today({ sessions, now, day }) {
    if (day == null || day < 3) return null                     // gün bilinmiyorsa (testler) yola girmez
    const done = sessions.some((s) => s?.type === 'walk' && s.seconds >= 90 && isSameDay(s, now))   // VARSAYIM ≥ 90 sn
    const deferred = deferredToday(now)                          // 'gozolcum:walk-defer' === bugünün anahtarı
    return { title: 'Yürüyüş', sub: 'Kalk, 2 dakika yürü.', minutes: 2, glyph: 'walk', done,
             slot: 'body', order: deferred ? 105 : 58, dropRank: 4, eyeMin: 0 }   // 58: Nefes molasının (60) hemen önü; 105: finale sonrası
  },
  coach(sessions, now) { const w = withinDays(sessions.filter(isWalk), now); if (!w.length) return null
    return { walks7: w.length, verified7: w.filter((s) => s.verified).length, steps7: sum(w, 'steps'), deferred7: countDefers7 } },
  stats(sessions, now) → [{ label: 'Yürüyüş · 7 gün', value: `${n} kez`, sub: `${verified} adımla doğrulandı` }],
}
```
"Sonra yaparım": ekranda **Sonra** düğmesi `gozolcum:walk-defer = bugün` yazar; durak silinmez, günün sonuna kayar
(order 105). Ertesi gün damga geçersizdir. "Yapmadı" = o gün kaydı yok; bu da Gelişim'de görünür ("7 günde 2 yürüyüş,
3 ertelendi").

**Kayıt** (`store.addSession`, `storage.js:87-92`):
`{ type: 'walk', seconds, steps: number|null, verified: bool, selfReport: bool, pendingVerify: { start, end }|null, deferredFirst: bool }`.
Sonraki açılışta `pendingVerify` olan kayıtlar `stepsBetween` ile güncellenir (kayıt yerinde değişir; `storage.js`'e
`updateSession(id, patch)` eklenir — küçük, geriye uyumlu ek).

**Merkeze eşleme.** `sessions.match` → Beden (`dataHub.domainOfSession`); gün doluluğu yalnız kişinin kaydıyla.
İris: Beden hücresi (Gelişim haritası). Nef: `walk` özeti (≤ 6 alan).

**Yol kuralı ve ilk günler** (yol günü = `ctx.day`; sonsuz: 10. günden sonra aynı kural sürer)

| Gün | Yolda mı | Nerede | Kural |
|---|---|---|---|
| 1–2 | hayır | — | kişi yolu tanısın (VARSAYIM) |
| 3 | evet, 2 dk | 1. bölüm sonu, Nefes molasının önü | ilk kez: ekranda tek cümle "Nefes'ten önce 2 dakika yürü; adımını sayarız." |
| 4 → ∞ | evet, 2 dk | aynı yer; "Sonra" dendiyse günün sonu | süre sabit; büyüme sayıda değil düzende (7 günde kaç gün) |
| her 7. gün | evet | aynı | Gelişim satırı: "Bu hafta N yürüyüş, M adımla doğrulandı" |

Sahibin "yürüme egzersizi modüllerin birinde olabilir" sözü: yürüyüş ayrıca **Mola** ekranının (`modules/mola`, "kalk
→ uzağa yürü") ve gökyüzü molasının içine "2 dk yürü" adımı olarak da girebilir; kayıt yine `walk` türünde olur
(tek kayıt türü, tek merkez).

**Kanıt** (PubMed'den doğrulandı):
- Dunstan 2012 (sources.js `dunstan2012`, PMID 22374636, [DOI](https://doi.org/10.2337/dc11-1931)): 20 dk'da bir 2 dk hafif
  yürüyüş, kesintisiz oturmaya göre yemek sonrası glukoz ve insülini düşürdü; 19 kişi, 45–65 yaş, fazla kilolu → 2 dk
  buradan.
- Buffey 2022 (PMID 35147898, [DOI](https://doi.org/10.1007/s40279-022-01649-4)): 7 tek günlük çapraz çalışmanın
  meta-analizi; hafif yürüyüş molaları oturmaya göre glukoz (Δ −0,72) ve insülini (Δ −0,83) düşürdü; çoğu katılımcı
  fazla kilolu; kan basıncında fark yok; uzun dönem bilinmiyor.
- Paluch 2022 (sources.js `paluch2022`, PMID 35247352): günlük adım–ölüm ilişkisi gözlemsel.
- Höchsmann 2018 (PMID 29460319, [DOI](https://doi.org/10.1111/sms.13074)): iPhone SE cepte/çantada ≥ 3,2 km/sa
  yürüyüşte adım hatası < %3 (20 kişi, koşu bandı + serbest yürüyüş). **Sınır:** telefon elde tutulurken ve çok yavaş
  yürüyüşte ölçülmedi; bizim 2 dk'lık yürüyüşte telefon çoğu zaman eldedir → doğrulama "yaklaşık"tır.

**Ekrana yazılacak cümleler:** "2 dakikada 214 adım saydık." · "Adımını okuyamadık; 'Yürüdüm' dediğini kaydettik." ·
"Bu hafta 4 yürüyüş." Gelişim kaynak kartı: "Küçük bir çapraz çalışmada 20 dakikada bir 2 dakika yürümek, kesintisiz
oturmaya göre yemek sonrası kan şekerini düşürdü (19 kişi). Bu bir sağlık tavsiyesi değildir."
**Yapılmayan iddialar:** kalp, şeker, kilo, "sağlıklı" yargısı; adım hedefi; "10.000".

**VARSAYIM:** unlockDay 3; ≥ 90 sn "yapıldı"; HealthKit yazma gecikmesi; order 58/105; dropRank 4; home order 34;
health v3 metninin hukuki gerekliliği.

---

### 4.2 `sleep` — uyku (Sağlık geceleri + tek soruluk sabah)

**Amaç.** Sahibinin sözü: "uyku, eğer sağlık bilgilerinden alınıyorsa, uyku kalitesi takibi olacak." İki kaynak:
(A) Apple Sağlık uyku kayıtları (varsa), (B) sabah tek soru (herkeste). Kişi hiçbir şey yapmasa da (A) okunur; (B)
kişinin işi olduğu için haritayı doldurur.

**Ne ölçer.**
- (A) HealthKit `HKCategoryTypeIdentifier.sleepAnalysis`: `inBed`, `asleepUnspecified`, iOS 16+ `asleepCore/Deep/REM`,
  `awake`. Hesaplananlar: gece başına yatakta dk, uyuyor dk (asleep* toplamı), uyku orta noktası (saat), uyanık dk,
  kaynak (Apple Watch / üçüncü uygulama / iPhone). 7 gecelik **düzen**: orta noktaların standart sapması (dk) ve
  uyanma saati farkı.
- (B) Sabah tek soru: "Dün gece uykun nasıldı?" 0–10 (SQS; Snyder 2018). Yalnız iPhone'la uyuyan kişide (A) çoğu zaman
  boştur (VARSAYIM: Watch yoksa iOS yalnız "Yatakta" yazar; cihazda doğrulanacak); (B) her zaman vardır.
- **Ne ölçemez / ne demez:** uyku evreleri yorumu ("derin uykun az"), "uyku kalitesi puanı" (ölçüm değil), uykusuzluk
  tanısı. Evre sayıları **gösterilmez**; yalnız toplam uyku dk ve düzen gösterilir (gerekçe kanıtta).

**Cihaz ve rıza.**
- **Yeni okuma türü** `sleepAnalysis` → `readTypes`'a ekleme (`HealthPlugin.swift:34-38`) ve **yeni yöntem**
  `sleepNights({ days ≤ 60 })` → `{ nights: [{ date, inBedMin, asleepMin, awakeMin, start, end, source }] }` (gece
  = öğlen–öğlen penceresi, VARSAYIM). `[~]` Mac'te derlenir.
- `Info.plist NSHealthShareUsageDescription` (`:13-14`) uykuyu saymıyor → metne "uyku kayıtların" eklenir (Apple
  inceleme).
- Rıza: uyku ayrı amaç → **yeni anahtar `healthSleep` v1** (`CONSENT_VERSIONS`, `consent.js:14`); metin kalıbı
  `HEALTH_FACTS` gibi: Ne (uyku kayıtları, yalnız okuma) · Neden (uyku süreni ve düzenini kendi gözünle görmek; İyi
  oluş haritan) · Nerede (yalnız bu telefon) · Ne kadar (izin geri çekilene dek). `health` v2 iznine dokunulmaz.
- (B) için rıza gerekmez (kişi kendi yazıyor); WHO-5 ve 4 soru gibi profil verisi.

**Manifest taslağı** (`app/src/modules/sleep/manifest.js`):
```js
export default {
  id: 'sleep', routes: ['sleep', 'sleep-morning'], title: 'Uyku', label: 'uyku kaydı',
  ring: 'life', kind: 'measure',
  progress: {
    domain: 'wellbeing',
    metrics: [{ key: 'sleep-morning', label: 'Sabah uyku cevabı', unit: '/10', better: 'up',
                series: ({ sessions }) => sessions.filter((s) => s?.type === 'sleep-check' && Number.isFinite(s.score)).map((s) => ({ date: s.date, value: s.score })) }],
    // Sağlık geceleri metrik değil: progress.js sleepCard (who5Card kalıbı, :36-47) okur; alan kartına ve yaya girer
  },
  gates: {},
  storageKeys: ['gozolcum:sleep-log', 'gozolcum:sleep-opts'],   // gece kayıtları (habit-log kalıbı) ve "sabah sorusu açık mı"
  home: { section: 'measure', order: 50 },
  sessions: {
    match: (s) => s?.type === 'sleep-check',              // yalnız sabah cevabı sessions'ta
    countsTowardGoal: false,
    describe: (s) => ({ title: 'Sabah: uyku', detail: `${s.score} / 10` }),
  },
  // today yok: yol durağı değil, Ana sayfa sabah kartı (alarm sabah kartıyla tek kart, aşağıda)
  coach(sessions, now) → { morning7: ortalama 0–10, nights7: kaç gece Sağlık kaydı, asleepMean7: dk, midpointSd7: dk }  // ≤ 6 alan
  stats(sessions, now) → [{ label: 'Uyku · 7 gece', value: `${asleepMean} sa`, sub: `orta nokta ± ${sd} dk` }, { label: 'Sabah cevabı', value: `${mean}/10` }],
}
```

**Kayıt.**
- Geceler: `gozolcum:sleep-log` → `[{ date: 'YYYY-MM-DD', asleepMin, inBedMin, awakeMin, midpoint: 'HH:MM', source }]`
  (`habitLog.js:5` kalıbı; en yeni 120 gece, VARSAYIM). App açılışta `sleepNights({ days: 14 })` okur, olmayan geceleri
  ekler (Sağlık silinse de tarihçe kalır — ANA_BELGE §4'teki "depoya yazılmaz" eksiğinin uyku için kapanışı).
- Sabah: `sessions` ← `{ type: 'sleep-check', score: 0–10, night: 'YYYY-MM-DD', seconds: 0 }`.

**Tek sabah kartı (üç istek çakışıyor).** Bugün alarm modülünün "Ses bittiğinde uyumuş muydun?" ve "Uyanınca" kartı var
(`YAPILACAKLAR.md` alarm v3), yoga planı "Dün gece uykuya dalmak ne kadar kolaydı?" kartı istiyor (`PLAN.v2.md` §E.1-8),
bu modül "uykun nasıldı?" istiyor. **Karar önerisi:** Ana sayfada 12.00'ye kadar **tek** "Sabah" kartı; sırayla en
fazla iki soru: (1) uyku 0–10 (her sabah, `sleep-check`), (2) o gece yoga Uykuya Geçiş dinlendiyse "uykuya dalmak"
0–10 (`yoga-uyku-dalma`, PLAN.v2 §E.4), alarm çaldıysa alarmın kendi sorusu **3 günde bir** (mevcut kural). Kart iki
temada, "Atla" var; cevapsız gün boş kalır, tahmin yazılmaz.

**Merkeze eşleme.** `hub({ …, nights })` → `domains.wellbeing.sleep = sleepCard(nights, now)`:
`{ n, asleepMean7, asleepMean28, midpointSd7, regular: sd ≤ 45 dk (VARSAYIM), status: 'first'|'noise'|'up'|'down' }`.
Status kuralı: 28 günde ≥ 14 gece varsa ilk yarı / son yarı `metricTrend` (`progress.js:130-150`, `halves`) uyku
dakikasına uygulanır; `verifiedChange` "down"ı sadece süre azalışı için verir. Gün doluluğu: yalnız `sleep-check`.
İris: İyi oluş hücresi (kurulum: soru; Gelişim: `sleep-check` günleri). Nef: `sleep` özeti (rıza v2, §2.6).

**Yol kuralı ve gün tablosu**

| Gün | Ne olur |
|---|---|
| 1 | kurulumda 4 sorudan "uyku" zaten var (`profile.js:98`); modül sessiz |
| 2 | ilk sabah kartı (yalnız soru; Sağlık sorulmaz) — VARSAYIM: 2. gün |
| 5 | Beden/İyi oluş ayrıntısında "Apple Sağlık'tan uykunu da okuyalım mı?" satırı → `healthSleep` rızası (kurulumda sorulmaz; bir istek bir ekran) |
| 7 → ∞ | her sabah kart; 7 gecede bir Gelişim satırı; 28. günde iris yeniden bakışında uyku sorusu ve gece ortalaması yan yana |

**Kanıt** (PubMed'den doğrulandı):
- Robbins 2024 (PMID 39460013, [DOI](https://doi.org/10.3390/s24206532)): Apple Watch S8, PSG'ye göre uyku/uyanık
  duyarlılığı ≥ %95; toplam uyku süresi PSG'ye yakın; **derin uykuyu 43 dk az, hafif uykuyu 45 dk fazla** gösterdi
  (35 sağlıklı yetişkin, tek gece) → evreler gösterilmez, süre gösterilir.
- Chinoy 2021 (PMID 33378539, [DOI](https://doi.org/10.1093/sleep/zsaa291)): 7 tüketici cihazı; uyku saptama yüksek,
  uyanıklık özgüllüğü düşük (0,18–0,54), evreler tutarsız, kötü gecelerde daha kötü (34 genç yetişkin).
- Kolla 2016 (PMID 27043070, [DOI](https://doi.org/10.1586/17434440.2016.1171708)): tüketici cihazları toplam uykuyu
  fazla, bölünmeyi az gösterir (derleme).
- Snyder 2018 (PMID 30373688, [DOI](https://doi.org/10.5664/jcsm.7478)): tek maddelik uyku kalitesi ölçeği (0–10),
  PSQI ile güçlü ilişki; uykusuzluk ve depresyon hastalarında geçerlik; **sağlıklı toplulukta ayrıca doğrulanmadı**
  (sınır olarak yazılır).
- Watson 2015 (sources.js `watson2015`, PMID 26039963): yetişkine ≥ 7 saat.
- Windred 2024 (sources.js `windred2024`, PMID 37738616): uyku düzenliliği ölümle uyku süresinden güçlü ilişkili
  (gözlemsel) → "orta nokta sapması" gösterilir, yargı yazılmaz.
- Scott 2021 (YAPILACAKLAR'da DOI 10.1016/j.smrv.2021.101556; **PMID bu görevde doğrulanmadı**, kanıt kartına girmeden
  önce çekilir).

**Ekrana yazılacak cümleler:** "Son 7 gecede ortalama 6 sa 40 dk uyudun (Apple Sağlık)." · "Uyku ortan gece 03.10;
geceler arası sapma 38 dk." · "Sabah cevapların ortalaması 6,4 / 10." Kaynak kartı: "Akıllı saatler uyku süresini
laboratuvara yakın ölçüyor; uyku evrelerini ise tutarsız gösteriyor (Robbins 2024, 35 kişi; Chinoy 2021, 34 kişi).
Bu yüzden evre değil, süre ve düzen gösteriyoruz. Tanı değildir."
**Yapılmayan iddialar:** "uyku kaliten iyi/kötü", evre yorumu, uykusuzluk, "daha iyi uyutur".

**VARSAYIM:** gece penceresi öğlen–öğlen; Watch'sız iPhone'un yazdığı tür; 120 gece sınırı; düzen eşiği 45 dk;
sabah kartı 2. gün; Sağlık uyku önerisi 5. gün; 14 gece eşiği; 12.00 sınırı.

---

### 4.3 Hareket ölçümü — var olanın genişletilmesi (yeni modül değil)

Bugün: adım canlı okunur, yazılmaz (`App.jsx:454-455`); Beden kutucuğu (`ProgressOverview.jsx:166`); 7 günlük çizgi
(`:445`); saatlik "kalk" önerisi (`health.js:27-31`, eşik 100 adım/sa `:10`, VARSAYIM kodda işaretli). Eksik:
tarihçe kalıcı değil, 28 günlük şerit ve doğrulanmış değişim yayı Beden için yok, hareketsiz saat sayılmıyor.

**Ekler (modül değil, merkez):**
1. `gozolcum:health-log` → `[{ date, steps, distanceM, exerciseMin }]` (App açılışta `dailyTotals` ile eksik günleri
   tamamlar; `health` v2 iznine ek amaç değil: aynı veri, yalnız telefonda saklanır — VARSAYIM, hukukçuya "saklama
   süresi" sorulur; rıza metnine "telefonunda 1 yıl saklanır" cümlesi).
2. **Yeni yerel yöntem** `hourlySteps({ date })` (HKStatisticsCollectionQuery, saatlik) → gün içinde 09–21 arası
   < 100 adımlı saat sayısı = **hareketsiz saat** (`WALK_NUDGE_STEPS` ile aynı eşik). `[~]`.
3. `progress.js` `moveCard(healthDays)`: `{ steps7, steps28, stillHours7, status }`; status = `metricTrend` halves (28
   günde ≥ 14 gün). `hub` → `domains.body.move`; `verifiedChange` okur. Gün doluluğu değişmez (adım kişinin "Nefona'da
   yaptığı" iş değil; yürüyüş modülü kaydı doldurur).
4. Nef: bugün `buildSignals` (`coach.js:26-61`) adım göndermiyor; `health` rızası "Nef'e gitmez" diyor
   (`consent.js:19`). **Gönderilmez**; Nef yalnız `walk` özetini görür. Sahibin "hareket etme ölçülecek" isteği
   telefonda karşılanır.

**Kanıt:** Paluch 2022 (sources.js), Paluch 2022 CVD (sources.js `paluch2022cvd`), Buffey 2022 (§4.1), Zhang 2025
(sources.js `zhang2025`: adım–WHO-5 ters U, gözlemsel). **Ekrana:** "Bu hafta günde ortalama 5.130 adım; 3 saat
neredeyse hiç kalkmadın." **Yapılmayan:** hedef, "az/çok", kalori.

---

### 4.4 `tepki` — dikkat tespiti: dürüstçe ne ölçülebilir

**"Dikkat tespiti" ne demek olabilir, ne olamaz.**
| Olabilir (cihazda, kişi-içi karşılaştırma) | Olamaz (bu uygulamada söylenmez) |
|---|---|
| Tepki hızı ve **kaçırma** (≥ 500 ms) sayısı — PVT tarzı 1–3 dk görev | "Dikkat düzeyin düşük/yüksek" yargısı, DEHB ya da yorgunluk tanısı |
| Bölünmüş dikkat eşiği — **var:** Hızlı Bakış (`quick-look`, ms) | Kameradan "dalıp gitme" algısı: bakış takibi (`lib/gaze.js`) bakışın ekran dışına çıktığını görebilir ama bunun dikkat olduğu **doğrulanmamıştır**; kamera görüntüsü telefondan çıkmaz ilkesi korunur; yapılmaz (VARSAYIM etiketiyle bile) |
| Görsel menzil — **var:** Tek Bakışta (`tek-bakis`, harf) | Klavye/dokunma hızından dikkat çıkarımı (kanıt yok) |
| Göz izleme isabeti ve varış süresi — **var:** Çemberler (`track`, `arriveMs`) | Nefes sayma doğruluğu — emekli (`breath-count`), yeniden açılmaz |
| Fark etme isabeti — **var:** Fark Ettin mi? (`fark-ettin`, %) | Gerçek hayattaki dikkate aktarım iddiası (`fark-ettin/manifest.js:2`, `quick-look/manifest.js:2` zaten reddediyor) |
| Zihin gezinmesi **kendi beyanı** — Nefes/meditasyon sonunda tek soru "aklın ne kadar dağıldı?" 1–5 | |

**Yeni modül `tepki`** (Dikkat alanına zaman içinde ölçülen, en yalın ve en çok doğrulanmış görev):
- Görev: karanlık ekranda rastgele 2–10 sn sonra beliren işarete dokun; 60 sn (VARSAYIM; Grant 2017 3 dk'yı
  doğruladı, 1 dk doğrulanmadı → ilk sürümde **90 sn**, ölçüm yükü sahibin kararı). Ölçüler: **1/RT ortalaması**
  ("hız", Basner 2011'in önerdiği birincil ölçü), **kaçırma** sayısı (RT ≥ 500 ms), **yanlış başlama** (işaret gelmeden
  dokunma). Ortalama/ortanca RT birincil ölçü **değildir** (Basner 2011: uç değerlerden etkilenir).
- Zamanlama sınırı: WKWebView'de 100 ms altı güvenilmez (`quicklook.js:14` notu, Pronk 2020 atfı); PVT'de RT
  200–500 ms bandındadır, kare (16,7 ms) ve dokunma gecikmesi (VARSAYIM ~30–80 ms, cihaza bağlı) sabit kayma yapar →
  yalnız **aynı telefonda kişinin kendisiyle** karşılaştırma; ekranda yazılır.
- **Nefes etkileşimi:** Riedl 2026 pilotu 1 dk nefes egzersizinden sonra tepki sürelerinin **uzadığını** buldu →
  `tepki` durağı Nefes molasından **önce** (1. bölüm) ya da moladan ≥ 5 dk sonra (VARSAYIM); today() bunu `order` ile
  sağlar (order 25, E testinden sonra; R1 iki ölçümü ayırır, `today.js:184-193`).

**Manifest taslağı** (`app/src/modules/tepki/manifest.js`):
```js
export default {
  id: 'tepki', title: 'Tepki', label: 'tepki ölçümü', ring: 'attention', kind: 'measure',
  progress: {
    domain: 'focus',
    metrics: [
      { key: 'tepki-speed', label: 'Tepki hızı', unit: '1/s', better: 'up',
        series: ({ sessions }) => sessions.filter((s) => s?.type === 'tepki' && Number.isFinite(s.speed)).map((s) => ({ date: s.date, value: s.speed })) },
      { key: 'tepki-lapses', label: 'Kaçırma (≥ 500 ms)', unit: 'kez', better: 'down',
        series: ({ sessions }) => sessions.filter((s) => s?.type === 'tepki' && Number.isFinite(s.lapses)).map((s) => ({ date: s.date, value: s.lapses })) },
    ],
  },
  gates: { eyeBudget: 'test' },          // ölçüm; ortasında kesilmez (registry.js:16-20)
  storageKeys: ['gozolcum:tepki-opts'],
  home: { section: 'measure', order: 45 },
  sessions: { match: (s) => s?.type === 'tepki', countsTowardGoal: false,
              describe: (s, { seconds }) => ({ title: 'Tepki', detail: join([`${Math.round(1000 / s.speed)} ms`, `${s.lapses} kaçırma`, durationPart(seconds, false)]) }) },
  grow: { unlockDay: 4, level: () => ({ seconds: 90 }) },
  today({ sessions, now, day }) {
    if (day == null || day < 4) return null
    const week = withinDays(sessions.filter(isTepki), now)
    const done = doneToday(sessions, 'tepki', now)
    if (!done && week.length >= 2) return null                   // haftada 2 (VARSAYIM)
    return { title: 'Tepki', sub: '90 saniye', minutes: 2, hideMinutes: false, slot: 'test', order: 25, glyph: 'pulse', done, dropRank: 3.5 }
  },
  coach(sessions, now) → { n7, speed7, lapses7, first: ilk oturum hızı }   // "yorgunluk" yorumu istemde yasak
  stats(sessions, now) → [{ label: 'Tepki hızı', value: `${ms} ms`, sub: `ilk ölçüm ${first} ms` }, { label: 'Kaçırma · 7 gün', value: `${lapses}` }],
}
```
`registry.test.js:96-101 metSample`'a `tepki: { type: 'tepki', date, speed: 3.6, lapses: 1 }` eklenir.

**Kayıt:** `{ type: 'tepki', seconds, trials, rts: [ms…] (en çok 40 sayı; Nef'e gitmez), speed: mean(1000/rt), lapses,
falseStarts, medianMs, hourOfDay, afterBreathMin: son nefes kaydından bu yana dk|null }`.
`afterBreathMin` Riedl etkisini kişi-içi ayırmak için saklanır; Gelişim'de yorumlanmaz, yalnız araştırma dışa aktarımına
(Doktoruma göster CSV) girer.

**Merkeze eşleme.** Dikkat (focus); iris Dikkat hücresi ilk oturumla dolar (`iris.js:24`); `metricTrend` halves ile ≥ 6
ölçümde "değişim var / henüz belirsiz" (`progress.js:116, 143`). Nef: `tepki` özeti.

**Gün tablosu**

| Gün | Yolda mı | Kural |
|---|---|---|
| 1–3 | hayır | önce göz ölçümleri otursun (VARSAYIM) |
| 4 | evet | ilk ölçüm; ekranda: "Bu bir tepki oyunu değil, ölçüm: işareti görünce dokun. Sonuçlar yalnız kendi önceki sonuçlarınla karşılaştırılır." |
| 5–7 | haftada 2 | 2. ölçüm E testi olmayan bir günde (R1 iki ölçümü ayırır) |
| 8 → ∞ | haftada 2, dönüşümsüz | 6. ölçümden sonra Gelişim "değişim" satırı açılır (`METRIC_MIN = 6`) |
| 28 | + | iris yeniden bakışında Dikkat hücresi: ilk 6 ölçüm ortalaması ↔ son 6 |

**Kanıt** (PubMed'den doğrulandı):
- Basner & Dinges 2011 (PMID 21532951, [DOI](https://doi.org/10.1093/sleep/34.5.581)): 74 kişi; PVT'de uyku kaybına
  en duyarlı ölçüler kaçırma ve tepki hızı (1/RT); ortalama/ortanca RT birincil olmamalı; kısa sürümler bazı ölçülerde
  duyarlı olabilir.
- Grant 2017 (PMID 27325169, [DOI](https://doi.org/10.3758/s13428-016-0763-8)): 3 dk akıllı telefon PVT'si 10 dk
  dizüstü PVT ile 38 saatlik uykusuzlukta uyumlu; etki büyüklüğü telefonda orta (16 kişi); kaçırma eşiği kısa sürümde
  ayarlanabilir.
- Robertson 1997 (PMID 9204482, [DOI](https://doi.org/10.1016/s0028-3932(97)00015-8)): SART, sürdürülen dikkat ve
  günlük dikkat hatalarıyla ilişkili — `tepki`'nin ileride "durma" (go/no-go) sürümüne dayanak; ilk sürümde yok.
- Mrazek 2012 (PMID 22309719, [DOI](https://doi.org/10.1037/a0026678)): 8 dk bilinçli nefes, SART'ta zihin gezinmesi
  göstergelerini azalttı (tek deney) — meditasyon ↔ dikkat ölçümü bağı için.
- Riedl 2026 (PMID 42002307, [DOI](https://doi.org/10.1080/10615806.2026.2659809)): 47 öğrenci, pilot; 1 dk kutu
  nefesi/uzun veriş kaygıyı düşürdü **ama tepki süreleri uzadı** → sıralama kuralı.
- Killingsworth 2010 (PMID 21071660, [DOI](https://doi.org/10.1126/science.1192439)): telefonla anlık zihin gezinmesi
  örneklemesi — "aklın ne kadar dağıldı?" tek sorusunun yöntem dayanağı; mutlulukla ilişkisi iddia edilmez.

**Ekrana:** "Tepki hızın 3,7 (1/sn) · 1 kaçırma. Yalnız kendi ölçümlerinle karşılaştırılır." Kaynak kartı: "Tepki
testinin uyku kaybına duyarlı olduğu gösterildi (74 kişi); telefonda 3 dk'lık sürümü laboratuvarla uyumlu bulundu (16
kişi). 90 saniyelik sürümümüz ayrıca doğrulanmadı. Dikkatini ölçer demiyoruz; bu görevdeki hızını ölçer."
**Yapılmayan iddialar:** "dikkatin arttı/azaldı" (görevdeki hız artar denir), yorgunluk/uyku tanısı, sürüş.

**VARSAYIM:** 90 sn; haftada 2; unlockDay 4; order 25; nefes sonrası 5 dk; dokunma gecikmesi; rts 40 sayı.

---

### 4.5 `meditasyon` — kısa rehberli meditasyon (3 dk'dan)

**Yoga projesiyle ilişki.** `yoga/PLAN.v2.md` on dersi 5–30 dk, her dakika çalınabilir kurar (§0, §B); dersler 4 (Zor
Anlar), 5 (Tek Nokta), 7 (Kendine Şefkat), 9 (Kendini Tanımak) fiilen meditasyondur ve ses üretimi (Neslihan/Hakan,
MCP yolu, `yoga/SAHIP_ISTEKLERI.md` kararları) aynı hattan gelir. Sahibinin yoldaki isteği ise **3 dk** ("ilk gün 3 dk,
sonraki gün yine 3 dk"); yoga planının alt sınırı 5 dk. Karar: **iki ayrı ürün, tek motor.** `meditasyon` modülü
yoga planlayıcısını (`lib/yoga.js`, PLAN.v2 §B.3, saf ve belirlenimci) ve ses motorunu kullanır; içeriği 1–5 dk'lık
"kısa parçalar"dır. Yoga bitince kısa parçalar ilgili dersin 5 dk sürümüyle birleştirilebilir; kayıt türleri ayrı
kalır (`meditasyon` / `yoga`), merkez ikisini de okur. **İkinci bir ses hattı yazılmaz.**

**Parçalar (VARSAYIM; metinler yoga planındaki stil kılavuzu §C ve üç insan incelemesiyle):** `nefes` (nefese dikkat,
1/2/3/5 dk), `beden` (kısa beden taraması, 3/5 dk), `sefkat` (kendine iyi dilek, 3/5 dk). Her parça varış–çekirdek–
kapanış; gözler açık ya da kapalı serbest; "kırpmadan bakma" yok (yoga §A.0 ile aynı sınır).

**Manifest taslağı** (`app/src/modules/meditasyon/manifest.js`; Dalga kalıbı `dalga/manifest.js:17-24`):
```js
export default {
  id: 'meditasyon', routes: ['meditasyon', 'meditasyon-rest'], title: 'Meditasyon', label: 'kısa meditasyon',
  ring: 'life', kind: 'practice',
  progress: {
    domain: 'calm',
    effects: [
      { key: 'med-nefes',  label: 'Meditasyon · Nefes',  measure: 'sakinlik', max: 10, pick: (s) => (s?.type === 'meditasyon' && s.track === 'nefes' ? [s.before, s.after] : null) },
      { key: 'med-beden',  label: 'Meditasyon · Beden',  measure: 'beden gerginliği', max: 10, better: 'down', domain: 'body', pick },
      { key: 'med-sefkat', label: 'Meditasyon · Şefkat', measure: 'kendine yumuşaklık', max: 10, domain: 'self', pick },
    ],
    metrics: [{ key: 'med-wander', label: 'Aklın dağılması (kendi beyanı)', unit: '/5', better: 'down',
                series: ({ sessions }) => sessions.filter((s) => s?.type === 'meditasyon' && Number.isFinite(s.wander)).map((s) => ({ date: s.date, value: s.wander })) }],
  },
  gates: {},                                   // ekran karanlık; göz bütçesine sayılmaz, molada açık
  storageKeys: ['gozolcum:med-opts', 'gozolcum:med-resume'],
  home: { section: 'practice', order: 32 },
  sessions: { match: (s) => s?.type === 'meditasyon', countsTowardGoal: true,
              describe: (s, { seconds }) => ({ title: `Meditasyon · ${TRACKS[s.track].title}`, detail: join([s.before != null ? `sakinlik ${s.before}→${s.after}` : null, durationPart(seconds, false)]) }) },
  grow: { unlockDay: 2, level: (ctx) => KADEME(ctx.day) },     // kademe belgesi: 1. hafta 3 dk, sonra 3→5 (sahibi: "sonraki gün yine 3 dk")
  today({ sessions, now, day }) {
    if (day == null || day < 2) return null
    const lvl = this.grow.level({ day })
    const done = sessions.some((s) => s?.type === 'meditasyon' && s.seconds >= lvl.minutes * 60 * 0.6 && isSameDay(s, now))  // %60 kuralı PLAN.v2 §E.4
    return { title: 'Meditasyon', sub: `${lvl.minutes} dk · ${TRACKS[lvl.track].title}`, minutes: lvl.minutes, slot: 'practice', order: 75, glyph: 'lotus', done, dropRank: 2.5, route: 'meditasyon-rest' }
  },
  coach(sessions, now) → { sessions7, minutes7, calmDelta7, wander7 },
  stats(sessions, now) → [{ label: 'Meditasyon · 7 gün', value: `${dk} dk`, sub: `${n} seans` }, { label: 'Sakinlik değişimi', value: signed(d), sub: 'seans başı, 1–10' }],
}
```
Yolda yeri: 2. bölüm başı (order 75, Daire 70 ile Kırpma 90 arası): göz durakları arasında ekranı karartan bir mola
(göz bütçesini tüketmez, `eyeMin 0`). Nefes molası (order 60) ile art arda gelmesin diye order 75 (VARSAYIM; kademe
belgesi "araya nefes, meditasyon" sırasını kesinleştirir).

**Kayıt** (PLAN.v2 §E.4 `makeRecord` kalıbı): `{ type: 'meditasyon', track, voice, bg, planned, seconds, completed,
before, after, delta, wander: 1–5|null, hard: 'no'|'some'|'much'|null, planVersion }`. 30 sn altı kaydedilmez
(Dalga kuralı). "Kaldığın yerden" `gozolcum:med-resume` (PLAN.v2 §E.1 kaydı, 7 gün).

**Merkeze eşleme.** Sakinlik (calm); `beden` parçası etkisi Beden'e, `sefkat` Kendine yaklaşım'a (`effects[].domain`,
`registry.js:154`). İris: Sakinlik (Gelişim); kurulumdaki Sakinlik hücresi stres sorusundan kalır. `acuteEffects`
"anlamlı" için ≥ 3 oturum ve %95 GA (`progress.js:73, 85`); kartta "kontrol grubu yok" notu kalır (`:71`).

**Gün tablosu (ilk 10 gün; sonrası kademe belgesinden, döngü sonsuz)**

| Gün | Parça | Süre | Not |
|---|---|---|---|
| 1 | — | — | yolda yok |
| 2 | nefes | 3 dk | ilk kez: önce puanı atlanabilir |
| 3 | nefes | 3 dk | "sonraki gün yine 3 dk" (sahibi) |
| 4 | beden | 3 dk | |
| 5 | nefes | 3 dk | |
| 6 | sefkat | 3 dk | |
| 7 | serbest seçim | 3 dk | Gelişim: ilk hafta özeti |
| 8–14 | dönüşümlü nefes/beden/sefkat | 3 dk; 12. günden 5 dk seçeneği | 3 seans üst üste "hard: no" ise 5 dk önerilir (VARSAYIM) |
| 15 → ∞ | dönüşümlü | 3 ya da 5 dk (kişi seçer; yol bütçesi 3 sayar) | yoga gelince "5 dk dersin tamamını dinle" bağlantısı |

**Kanıt** (PubMed'den doğrulandı):
- Schumer 2018 (PMID 29939051, [DOI](https://doi.org/10.1037/ccp0000324)): 65 RKÇ, 5.489 kişi; kısa farkındalık eğitimi
  olumsuz duygulanımı **küçük** ölçüde azalttı (g = 0,21); **yayın yanlılığı düzeltilince g = 0,04**. Kartta bu sayı
  yazılır.
- Gál 2020 (PMID 33049431, [DOI](https://doi.org/10.1016/j.jad.2020.09.134)): 34 RKÇ, 7.566 kişi; farkındalık
  uygulamaları algılanan streste g = 0,46, kaygıda 0,28; yanlılık riski belirsiz, heterojenlik yüksek.
- Mrazek 2012 (PMID 22309719): 8 dk bilinçli nefes, SART'ta zihin gezinmesini pasif gevşemeye göre azalttı (tek deney).
- Galante 2014 (PMID 24979314, [DOI](https://doi.org/10.1037/a0037249)): iyilik temelli meditasyon; öz-şefkat g = 0,45
  (pasif kontrole karşı); "başlangıçta zorlayıcı olabilir" → `hard` sorusu ve zorlanana kısa/gözler açık sürüm.
- Ghai 2025 (PMID 41327816, [DOI](https://doi.org/10.1111/nyas.70149)): Yoga Nidra 73 çalışma; etkiler orta-büyük ama
  **düşük yöntem kalitesi, şişkin tahmin** — yalnız yoga dersi 2'ye dayanak; `beden` parçası bunu iddia etmez.
- Riedl 2026 (PMID 42002307): nefes sonrası tepki süresi uzuyor → meditasyondan hemen sonra `tepki` yok (§4.4).

**Ekrana:** "3 dakika · Nefes. Gözlerini kapatabilirsin." · Bitiş: "Sakinlik 4 → 7. Aklın ne kadar dağıldı? 1–5."
Kaynak kartı: "Kısa farkındalık çalışmalarının etkisi küçük (65 çalışma; yayın yanlılığı düzeltilince neredeyse sıfır).
Uygulamalarla yapılan çalışmalarda algılanan stres küçük-orta düzeyde azaldı. Kendi önce→sonra puanın bunlardan
bağımsızdır; dinlenme ve beklenti etkisi ayrılamaz."
**Yapılmayan:** "kaygını azaltır", "stresi yener", "beynini değiştirir", hipnoz sözü (sahibin "hipnoz olmalıyım"
beklentisi deneyim hedefidir, ekrana yazılmaz).

**VARSAYIM:** parça listesi ve süreleri; unlockDay 2; order 75; %60 tamamlanma; 5 dk'ya geçiş kuralı; 30 sn eşiği.

---

### 4.6 `yoga` — gelecek modül; yalnız yola bağlanışı

Manifest, kayıt ve Gelişim eşlemesi **PLAN.v2 §E.4–E.5'te hazır** (`id: 'yoga'`, `ring: 'life'`, `kind: 'practice'`,
`progress.domain: 'calm'`, ders başına `effects[].domain`, `yoga-uyku-dalma` metriği, `sessions.best` = pratik gün
sayısı). Burada tekrar edilmez; eklenen yalnız `today()`:

```js
grow: { unlockDay: null },                     // günle açılmaz: kişi Keşfet'ten bir kez dinleyince yola girer (notice/manifest.js:31 kalıbı)
today({ sessions, now, day }) {
  if (day == null || !sessions.some(isYoga)) return null
  const done = sessions.some((s) => isYoga(s) && isSameDay(s, now) && (s.completed || s.seconds >= 300))   // 5 dk = bütün bir ders (PLAN.v2 §B)
  const last = sessions.filter(isYoga).at(-1)
  return { title: 'Yoga', sub: `${LESSONS[last.lesson].title} · 5 dk'dan`, minutes: 5, slot: 'practice', order: 97, glyph: 'sun', done, dropRank: 1.2, openEnded: false }
}
```
- Yol bütçesi 5 dk sayar; kişi 30 dk dinlerse durak yine "tamam" (PLAN.v2 "istenen dakikası").
- Aynı gün `meditasyon` ve `yoga` ikisi de yolda olmasın: ikisi `rotate: 'sessiz'` grubunda (`today.js:210-221`
  gruptan günde biri; bugün yapılan kalır). Yoga yoksa meditasyon her gün.
- Sabah "uykuya dalma" sorusu §4.2'deki tek sabah kartında.
- Nef: PLAN.v2 §E.4 coach() ≤ 6 alan; istem satırı §5.
- Uyku dersinden hemen sonra `tepki` yok (§4.4); araç kullanma uyarısı PLAN.v2 §E.1-2.

Kanıt PLAN.v2 Ek tablosundadır (ikinci tur doğrulama); bu görevde yeniden çekilenler: Ghai 2025 (41327816), Mrazek 2012
(22309719), Schumer 2018 (29939051), Galante 2014 (24979314).

---

### 4.7 `notice` — Bugünün görevi ve farkındalık: nasıl büyür

Bugün: 7 görev güne göre döner (`notice.js:10-18, 24`), akşam 0–3+ kaydı (`:26-30`), yolda finale ve **yalnız bir kez
yapıldıysa** (`notice/manifest.js:31`), `countsTowardGoal: false` (`:26`), metrik "fark edilen" (`:15-20`).

**Büyüme (modülün içinde, manifest `grow`):**
| Katman | Açılış kuralı (VARSAYIM) | Görevler |
|---|---|---|
| 1 (var) | başlangıç | 7 görev: "3 kırmızı şey", "3 engel", … |
| 2 | son 7 kayıtta ortalama ≥ 2 ("2" ya da "3+") | daha ince: "aynı sokakta dün olmayan bir şey", "3 farklı kuş sesi", "bir kişinin gözünün rengi" |
| 3 | 2. katmanda 7 kayıt ≥ 2 | zamanlı: "yürürken 1 dakika yalnız sesleri say" (kişi süre girer), "gökyüzü: bulutun 1 dakikada nasıl değiştiğini söyle" (gökyüzü modülüne bağlanır) |
| geri düşme | 7 kayıtta ortalama < 1 | bir katman aşağı; ekranda yazılmaz ("kolaylaştırdık" denmez) |
- `today()` ilk kez açılışı **yol gününe** bağlar: `day ≥ 2` ise bir kez yapılmamış olsa da finale'de görünür (bugün:
  kullanıcı Keşfet'ten bulmazsa hiç başlamıyor); `ctx.day` yoksa eski davranış (testler aynı).
- Kayda `tier` alanı eklenir; metrik seriye katman girmez (sayı katmanlar arası karşılaştırılmaz; Gelişim "katman 2'ye
  geçtin" satırı yazar).
- **Farkındalık merkezi** (`awareness`) değişmez; dikkat halkasına takılan her modül (tepki dahil) orada görünür
  (`awareness/manifest.js:1-2`).
- Kanıt: Schofield 2015 (PMID 26320867, [DOI](https://doi.org/10.1016/j.concog.2015.08.007)): 794 kişi; kısa
  farkındalık uyarımı beklenmedik uyaranı fark etmeyi artırdı (dikkatsizlik körlüğü azaldı) — notice.js:4'teki atıf
  bu görevde doğrulandı. Gerçek hayata aktarım gösterilmedi (`notice.js:4` zaten yazıyor).
- Ekrana: "Bugün 3 farklı yeşil tonu fark et." · Akşam: "Kaç tane? 0 · 1 · 2 · 3+". **Yapılmayan:** "dikkatin
  gelişti", "farkındalığın arttı".

---

### 4.8 `gokyuzu` — gökyüzü molası: yola giriş ve büyüme

Bugün: 2 dk, 6 soru × 20 sn, 4 manzara, gece sürümü (`gokyuzu.js:8, 26-28`); önce→sonra dinlenmişlik (`gokyuzu/
manifest.js:16`); **yolda değil**.

**Ek `today()`** (`gokyuzu/manifest.js`'e; `dataHub`/`today.js` değişmez):
```js
grow: { unlockDay: 5, level: (ctx) => ({ seconds: 120 }) },
today({ sessions, now, day, profile }) {
  if (day == null || day < 5) return null
  const hour = new Date(now).getHours()
  if (hour < 7 || hour >= 20) return null                        // gündüz (gece sürümü kişi isterse Keşfet'ten; VARSAYIM saatler)
  const days = new Set(withinDays(sessions.filter(isGokyuzu), now).map(dayKeyOf)).size
  const done = sessions.some((s) => isGokyuzu(s) && isSameDay(s, now))
  if (!done && days >= 2) return null                            // haftada 2 (VARSAYIM)
  return { title: 'Gökyüzü molası', sub: 'Pencereye ya da dışarı çık.', minutes: 2, slot: 'body', order: 58, glyph: 'sky', done, rotate: 'disari', weekDays: days, dropRank: 4, eyeMin: 0 }
}
```
- `rotate: 'disari'` grubu: yürüyüş (`walk`) ile aynı grup → günde biri "dışarı çıkma" durağı (haftada en az yapılan
  önce, `today.js:216-219`). Sahibin "yürüyüş bir modülün içinde olabilir" sözüne uygun ikinci yol: gökyüzü molası
  ekranına "yürüyerek bak" seçeneği; o zaman kayıt `gokyuzu` + `walk` iki kayıt olur (iki alan, iki gerçek).
- Büyüme: süre sabit 2 dk (kanıt süre vermiyor); büyüme **çeşitlilikte**: 3. haftadan sonra "bulutun değişimini söyle"
  görevi (notice katman 3 ile ortak), gece sürümü 20.00'den sonra Keşfet'te.
- Kanıt sources.js'de (ulrich1984, yamashita2021, sturm2020, martens2026, talens2022) — değişmez; dürüstlük sınırı
  `gokyuzu.js:2-3`.

---

## 5. Nef'e giden özetler ve istem satırları (sunucu `api/coach.js`, `coachCore.js:75` kalıbı)

| Modül | coach() alanları (≤ 6) | İstem satırı (sunucu; Türkçe, sayı uydurma yasak) |
|---|---|---|
| walk | walks7, verified7, steps7, deferred7 | "walk = 2 dakikalık yürüyüş (walks7 kaç kez, verified7 adımla doğrulanan, deferred7 ertelenen). Sağlık yorumu yapma; yalnız düzen dilinde yorumla." |
| sleep | morning7, nights7, asleepMean7, midpointSd7 | "sleep = uyku (morning7 sabah cevabı 0–10 ortalaması; asleepMean7 dk; midpointSd7 geceler arası sapma dk). Uyku kalitesi yargısı, tanı, 'daha iyi uyu' tavsiyesi yazma; düşükse daha kısa ve dinlendirici bir durak öner." |
| tepki | n7, speed7, lapses7, first | "tepki = tepki ölçümü (speed7 1/sn ortalaması, lapses7 kaçırma). Yorgunluk, uyku ya da dikkat düzeyi çıkarımı yapma." |
| meditasyon | sessions7, minutes7, calmDelta7, wander7 | "meditasyon = kısa rehberli meditasyon (calmDelta7 sakinlik değişimi 1–10; wander7 aklın dağılması 1–5). Ruh sağlığı iddiası yok." |
| yoga | PLAN.v2 §E.4 | "yoga = rehberli ders (ders adı, dakika, tamamlandı mı, önce→sonra)." |
`FORBIDDEN` (`coachCore.js:86-95`) listesine `uyku(suzluğ)?u(nu)? (iyileştir|tedavi)`, `dikkat eksikliği`, `yorgunluk`
kalıpları eklenir (VARSAYIM: yeni alanlar yeni yasaklar gerektirir). Rıza: `coach` v2 (§2.6).

---

## 6. Uygulama sırası (öneri) ve sahibin kararları

**Sıra (her adım: tasarım Artifact → onay → kod → iki temada her durum → bağımsız inceleme → cihaz):**
1. `ctx.day` + `grow` katmanı (App tarafı 5 satır; test: `today.test.js` yeni `describe('ctx.day')`).
2. `notice` yol günü 2'de kendiliğinden (tek satır) ve `gokyuzu` today().
3. `meditasyon` (yoga ses hattı pilotu ders 2 ile paralel; ilk parça `nefes` 3 dk).
4. `tepki` (saf JS, native yok; en ucuz ölçüm).
5. `walk` (native `stepsBetween`, health v3 metni; Mac derlemesi).
6. `sleep` (native `sleepNights`, `healthSleep` rızası, tek sabah kartı; Mac derlemesi; Watch'lı ve Watch'sız cihazda
   ayrı ayrı doğrulama).
7. Hareket kalıcı tarihçe + `hourlySteps`.
8. `yoga` today() (yoga modülü PLAN.v2'ye göre bittiğinde).

**Sahibin kararını bekleyen sorular:**
1. Nef modül sınırı: 10'da kalıp boş modüller `null` mı dönsün, sınır 12'ye mi çıksın? (§2.6; önerim ilki)
2. Uyku için Apple Sağlık ayrı rıza (`healthSleep`) — hukukçuya gidecek metin onayı; Watch'sız kullanıcıya bu seçenek
   hiç gösterilmesin mi (yalnız sabah sorusu)?
3. Sabah tek kart: uyku 0–10 her sabah + yoga "uykuya dalma" (o gece dinlendiyse) + alarm sorusu (3 günde bir) — bu
   sıra ve "en fazla iki soru" kuralı uygun mu?
4. `tepki` süresi 90 sn mi 3 dk mı (Grant 2017 yalnız 3 dk'yı doğruladı; 90 sn ölçüm yükü düşük ama doğrulanmamış)?
5. Meditasyon 3 dk parçaları yoga ses hattında ayrı üretim (kredi) — pilot ders 2'den sonra mı, önce mi?
6. Yürüyüş adım doğrulaması için health v3 (yeniden rıza) mı, yoksa yalnız beyan ("Yürüdüm") ile mi başlayalım?
7. Hareket tarihçesinin telefonda saklama süresi (öneri 1 yıl) ve rıza metni.

---

## 7. Kaynak tablosu (bu görevde PubMed'den doğrulananlar; sources.js'e girecekler)

| Anahtar (sources.js) | Künye | PMID | DOI | Tür · n | Kullanıldığı modül |
|---|---|---|---|---|---|
| dunstan2012 (var) | Dunstan 2012, Diabetes Care | 22374636 | 10.2337/dc11-1931 | crossover · 19 | walk |
| buffey2022 | Buffey 2022, Sports Med | 35147898 | 10.1007/s40279-022-01649-4 | meta · 7 çalışma | walk, hareket |
| hochsmann2018 | Höchsmann 2018, Scand J Med Sci Sports | 29460319 | 10.1111/sms.13074 | validation · 20 | walk |
| paluch2022 (var) | Paluch 2022, Lancet Public Health | 35247352 | 10.1016/S2468-2667(21)00302-9 | meta · 47 471 | hareket |
| robbins2024sleep | Robbins 2024, Sensors | 39460013 | 10.3390/s24206532 | validation · 35 | sleep |
| chinoy2021 | Chinoy 2021, Sleep | 33378539 | 10.1093/sleep/zsaa291 | validation · 34 | sleep |
| kolla2016 | Kolla 2016, Expert Rev Med Devices | 27043070 | 10.1586/17434440.2016.1171708 | review | sleep |
| snyder2018 | Snyder 2018, J Clin Sleep Med | 30373688 | 10.5664/jcsm.7478 | validation · 70 + 651 (hasta) | sleep |
| watson2015 (var) | Watson 2015 | 26039963 | 10.5665/sleep.4716 | uzlaşı | sleep |
| windred2024 (var) | Windred 2024, Sleep | 37738616 | 10.1093/sleep/zsad253 | cohort · 60 977 | sleep |
| basner2011 | Basner & Dinges 2011, Sleep | 21532951 | 10.1093/sleep/34.5.581 | experiment · 74 | tepki |
| grant2017 | Grant 2017, Behav Res Methods | 27325169 | 10.3758/s13428-016-0763-8 | validation · 16 | tepki |
| robertson1997 | Robertson 1997, Neuropsychologia | 9204482 | 10.1016/s0028-3932(97)00015-8 | experiment · 34 + 75 | tepki (ileride) |
| riedl2026 | Riedl 2026, Anxiety Stress Coping | 42002307 | 10.1080/10615806.2026.2659809 | pilot · 47 | tepki, meditasyon |
| killingsworth2010 | Killingsworth & Gilbert 2010, Science | 21071660 | 10.1126/science.1192439 | experience sampling | tepki (beyan) |
| mrazek2012 | Mrazek 2012, Emotion | 22309719 | 10.1037/a0026678 | experiment | meditasyon, tepki |
| schumer2018 | Schumer 2018, J Consult Clin Psychol | 29939051 | 10.1037/ccp0000324 | meta · 65 RKÇ, 5 489 | meditasyon |
| gal2020 | Gál 2020, J Affect Disord | 33049431 | 10.1016/j.jad.2020.09.134 | meta · 34 RKÇ, 7 566 | meditasyon |
| galante2014 | Galante 2014, J Consult Clin Psychol | 24979314 | 10.1037/a0037249 | meta · 22 RKÇ | meditasyon |
| ghai2025 | Ghai 2025, Ann N Y Acad Sci | 41327816 | 10.1111/nyas.70149 | meta · 73 çalışma (düşük kalite) | yoga |
| schofield2015 | Schofield 2015, Conscious Cogn | 26320867 | 10.1016/j.concog.2015.08.007 | experiment · 794 | notice |
| gardner2012 | Gardner 2012, Br J Gen Pract | 23211256 | 10.3399/bjgp12X659466 | derleme (özet yok) | bağlılık (alışkanlık dili; sayı vermez) |

Aranıp **bulunamayanlar** (kanıt satırına konmadı): Strohmaier 2021 doz–yanıt meta-regresyonu (PubMed'de kayıt
bulunamadı); Scott 2021 (DOI YAPILACAKLAR'da, PMID çekilmedi).
