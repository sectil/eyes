# Gelişim merkezi · Denetim (2026-09-30)

Soru: Gelişim merkezine bugün hangi veri, hangi modülden, nasıl geliyor; doğru mu işleniyor; aynı değer Gelişim'de, 5. gün
raporunda, "Doktoruma göster" PDF/CSV'sinde, Ana sayfada ve Nef'te aynı mı?

**Yöntem.** Üç bağımsız denetçi (kayıt → merkez; merkez → ekran, rapor, Nef; kamera ölçümleri ve kalanlar). Her bulgu
koşan bir betikle gösterildi; betikler depoya yazılmadı (oturum klasöründe: `denetim/A/merkez.test.js` 12 durum,
`denetim/B/tutarlilik.test.jsx` 4 durum, `denetim/C/`). Çalışma ağacı: `ff877e4` (ana oturumun dalıyla aynı nokta).
Uygulama koduna dokunulmadı. Satır numaraları o güne aittir ve kayabilir; işlev adları asıl dayanaktır.

---

## 1. Tek cümlede

Kayıtların çoğu doğru yazılıyor ve doğru alana gidiyor; sorun **okuma** tarafında: merkezi (`lib/dataHub.js hub`) yalnız
Gelişim haritası okuyor, öteki her yüzey (Gelişim satırları, alan ayrıntısı, 5. gün raporu, PDF/CSV, Nef, Ana sayfa)
çekirdek işlevleri kendi başına çağırıp "şimdi" değerini ve hükmü kendisi seçiyor. Bu yüzden aynı kayıt bugün aynı
ekranda iki zıt hüküm ve iki farklı göz değeri üretebiliyor.

## 2. Veri yolları (kaynak → merkez → yüzey)

| Kaynak | Kayıt (yer ve biçim) | Merkezde | Alan | Gelişim | 5. gün | PDF/CSV | Nef | Sorun |
|---|---|---|---|---|---|---|---|---|
| Haftalık E testi, kısa görme testi | `tests[]` `{type:'va-weekly'/'va-daily', eye, logMAR}`, **göz başına ayrı kayıt** | `ownTests` → `eyeCard` → `trend.js analyzeTrend` | Göz | ✔ | mesaj | ✔ | `vaPhase/vaTrend/vaAlert`, `vaDelta` | K2, Ö-5 |
| Okuma testi | `tests[]` `{type:'reading', criticalPrintSize, maxReadingSpeed…}` | yalnız gün şeridi; `pickSeries` okumaz | Göz | ayrı kart | ✘ | ✘ | yalnız `readingWpm` | Ö-4 |
| Göz kırp, egzersiz setleri | `sessions[]` | gün şeridi | Göz | gün | ✔ | ✔ | gün | — (bilerek ölçüsüz) |
| Nefes, Dalga, Gökyüzü | `sessions[]` önce/sonra | `acuteEffects` | Sakinlik (+Dalga: Kendine yaklaşım, İyi oluş) | ✔ | ✔ | ✔ yönsüz | yalnız `calmDelta7` | Ö-3, Ö-8 |
| Hızlı Bakış, Tek Bakışta, Fark Ettin mi?, Bugünün görevi, Nefes sayma | `sessions[]` | `metricCards` → `metricTrend` | Dikkat, Farkındalık | ✔ | ✔ | ✔ | ham ilk/son | K3, K4 |
| Yılan, Çemberler | `sessions[]` `{type:'game'}` | gün şeridi | Dikkat | gün | — | ✔ | ✔ | Kü-2 |
| Yön (Ayna, Dışarıdan bak) | `sessions[]` | metrik + etki | Kendine yaklaşım | ✔ | ✔ | ✔ | — | K3 |
| Yoga | `sessions[]` + `updateSession` | ders alanına etki ve metrik | Sakinlik, Beden, İyi oluş, Dikkat | ✔ | ✔ | ✔ | 4 sayı | Ö-1 |
| WHO-5 | `sessions[]` `{type:'who5', score}` | `who5Card`, alan yayı | İyi oluş | ✔ | yanlış etiket | ✔ | **✘** | Ö-2, Ö-6 |
| Mola, su | `gozolcum:habit-log` | `loadHubHabits` → gün | Beden | gün şeridi | ✘ | **✘** | ✘ | Ö-7, A11 |
| Alarm (uyanış) | `gozolcum:alarm-log` | gün başına 1 | İyi oluş | gün şeridi | ✘ | ✘ | ✘ | Ö-7 |
| Apple Sağlık adımı | bellekte, depoya yazılmaz | **merkeze girmez** | (Beden ekranı) | satırda | ✘ | ✘ | ✘ (bilinçli) | Ö-9 |
| İlk Bakış, 4 soru | `profile.firstLook`, `profile.iris.baseline/recheck` | `answerSeries` (yalnız iris anlık görüntüsünden) | 5 alan | ölçüsüz satır | — | ✘ | yalnız rızayla | Kü-3, Kü-5 |
| İris haritası (kurulum, 28. gün) | `profile.iris` | **merkezi okumaz** (`irisCells` kendi hesabı) | 7 alan | IrisPlan'da | — | ✘ | ✘ | A11 |
| Kamera ölçümleri | §4 | §4 | Göz | §4 | §4 | §4 | §4 | §4 |

## 3. Bulgular

### Kritik (kişi yanlış ya da çelişen sonuç görüyor)

**K1. Aynı satırda "iyileşiyor" hapı ile "geriliyor" noktası.** Satırın hapı `ProgressOverview.jsx tileOf → metricStatus`'tan
(tek metrik), noktası ve ayrıntı başlığı `dataHub.verifiedChange`'ten geliyor; `verifiedChange` herhangi bir "worse"
metrikte ya da anlamlı düşen etkide "down" döner. Betik B-A: Dikkat satırı "90 ms · Algı hızı eşiği **iyileşiyor**",
noktası **geriliyor**, ayrıntı başlığı "11 / 28 gün · geriliyor"; Ana sayfa bu alanı hiç anmıyor. **Düzeltme:** alan hükmü
merkezde bir kez hesaplanır (plan §3.B.4 "karışık" kuralıyla); satır, ayrıntı ve Ana sayfa yalnız onu okur.

**K2. Göz için aynı ekranda iki "şimdi" değeri.** Gelişim satırı ve Ana sayfa `current7 ?? last` (tek test) gösteriyor;
alan ayrıntısı, alttaki Görme kartı ve PDF `current` (son 3 testin ortancası). Betik B-A: satır **0,16** logMAR, ayrıntı
ve PDF **0,10**. Haftalık test yapan herkeste olağan durum budur (son 7 günde 3 test olmaz). **Düzeltme:** her yüzey
`eyeCard.current`'ı `currentWindow` etiketiyle ("son 3 test") gösterir; `current7 ?? last` kalkar.

**K3. Genel ölçü kuralı bütün geçmişe bakıyor; eski iyileşme yeni gerilemeyi örtüyor.** `lib/progress.js metricTrend`
ilk yarı / son yarı ortalamasını karşılaştırıyor, pencere yok. Betik A-S1b: 30 ölçüm 260 ms → 30 ölçüm 200 ms → son 6
ölçüm yine 260 ms (düşük iyi) → hüküm **"better"**. Plan §3.B.2 madde 1 bugün de geçerli. **Düzeltme:** ölçü kuralı v2
(plan §3.B.3; onaylı karar 2).

**K4. Aynı günün turları ayrı ölçüm sayılıyor.** Betik A-S2: dün 5 Tek Bakışta turu (6,0 → 6,8) + bugün 1 tur → iki
günlük kullanıcıya **"iyileşiyor"**. Değişim bir günün içindeki alışmadır. **Düzeltme:** v2'nin günlük ortanca adımı.

### Önemli (eksik ya da yanlış işlenen veri)

**Ö-1. Yoga "yalnız nasıl hissettin" ilkesi haritada çiğneniyor.** Metin yoga için bilerek "iyileşme" demiyor
(`feelOnlyText`, `effectStatus`), ama `verifiedChange` `FEEL_ONLY_MODULES`'e bakmadan yoga etkilerini hükme katıyor.
Betik B-D: yoga gerginlik 7 → 3,3 → Sakinlik yayı **up**, Ana sayfada "İyileşiyor: Sakinlik". **Düzeltme:**
`verifiedChange` bu modüllerin metrik ve etkilerini hükme katmaz.

**Ö-2. Nef, Gelişim'in hükümlerini ve WHO-5'i hiç görmüyor.** `lib/coach.js buildSignals` göz dışında hiçbir hüküm
göndermiyor; Hızlı Bakış için ham ilk/son oturum (120 → 89), nefes için 7 günlük `calmDelta7` gidiyor; Gelişim aynı veriye
başka sayılar ve "iyileşiyor" diyor. WHO-5 pakette yok. **Düzeltme:** plan §3.C.5 paketi (`{ key, status }`) merkezden
üretilir; WHO-5 durumu eklenir (rıza v2 kuralıyla).

**Ö-3. Önce → sonra etkileri bütün geçmişten.** `domainSummary` ve `exportData` `acuteEffects`'i `since` vermeden
çağırıyor. Betik A-S5: 20 eski etkili + son 12 günde 6 etkisiz nefes → bütün geçmiş "anlamlı" (gain 1,54), son 28 gün
0. Ortalamaya dönüş notu hiçbir yerde yok. **Düzeltme:** `acuteEffects({ since: 28 gün })` (plan §3.B.4).

**Ö-4. Okuma testi Göz alanının ölçüsüne ve yayına girmiyor.** `lib/vaSeries.js isVa` yalnız E testlerini alıyor,
`modules/reading/manifest.js` `metrics` vermiyor. Betik A-S6: 8 okuma testi, rahat okunan yazı boyu her hafta büyüyor
(kötüleşiyor) → Göz alanında hiçbir işaret. Nef yalnız hızı görüyor. **Düzeltme:** plan §3.B.6 okuma satırı (`reading-cps`).

**Ö-5. Bir görme testi merkezde 2–3 kayıt sayılıyor.** Göz başına kayıt; `hub` ve `growthMap` her birini sayıyor.
Ekranda "Haftalık görme testi **3 kayıt**" (`ProgressOverview` kaynak satırı). `stats.js activitiesFrom` ise 5 dakika
içindekileri tek aktivite sayıyor; Gelişim ile Takvim uyuşmuyor. **Düzeltme:** merkez test kayıtlarını
`activitiesFrom` kuralıyla gruplar.

**Ö-6. 5. gün raporu ikinci WHO-5'ten sonra da "İlk puanın 60" diyor;** Gelişim ve PDF aynı veriye "+20, anlamlı artış"
diyor (`FirstReport.jsx` İyi oluş kartı). **Düzeltme:** n > 1 ise son puan ve hüküm.

**Ö-7. Mola, su ve alarm kayıtları merkezde ve şeritte var; PDF/CSV'de, Nef'te ve takvimde yok.** Betik B-A: Beden
şeridinde 3/28 gün, CSV'de 0 satır. `screens/Calendar.jsx` alışkanlık günlüğünü okumuyor (A11 (c) bugün de geçerli).
**Düzeltme:** CSV ve takvim `loadHubHabits`'i okur.

**Ö-8. Etki metninde yön karışıyor.** Alan ayrıntısı "ortalama **artış −2,3**", aynı etki 5. gün raporunda "ortalama
azaldı: −2,3"; düşük daha iyi ölçüde güven aralığının işareti iki ekranda ters. PDF etki sütunu yalnız
"belirgin/belirsiz" yazıyor, iyi mi kötü mü yazmıyor. **Düzeltme:** tek metin işlevi (`FirstReport.changeOf` kalıbı)
bütün yüzeylerde.

**Ö-9. Apple Sağlık adımları merkeze girmiyor.** `hub`/`growthMap` imzasında `health` yok; Beden satırı doğrudan
`health` özelliğinden geliyor. Her gün yürüyen ama mola/su yapmayan kişinin Beden dilimi boş; "en az düzenli alan"
önerisi (`weakestDomain`) onu Beden'e yönlendirebilir. Beden'deki yoga etkisi genel bakışta görünmüyor. **Düzeltme:**
adımlı gün Beden gününe katılır; Beden satırı öteki alanlar gibi merkezden beslenir. Adım sayısı telefonda kalır.

**Ö-10. A11'in üç parçası bugün de geçerli.** (a) Profilim'de İris satırı yok: IrisPlan yalnız ilk kez açılıyor
(`App.jsx irisPlanSeen`). (b) İris merkezi okumuyor: `lib/iris.js irisCells` kendi hesabını yapıyor; betik A-S10'da tek
bir Yılan oyunu Dikkat hücresini dolduruyor, WHO-5 ve mola/su hücre doldurmuyor. Cevap → alan eşlemesi iki yerde yazılı
(`irisCells` ve `dataHub.ANSWER_FIELDS`). (c) Mola/su takvimde yok. **Düzeltme:** iris hücreleri `hub` alanlarından;
takvim işaretleri `loadHubHabits`'ten.

### Küçük

- **Kü-1.** `hub().records.days7` günü değil kaydı sayıyor (bugün 5 nefes → 5); bugün okuyan ekran yok. Nef'e
  bağlanmadan önce düzeltilmeli.
- **Kü-2.** Yılan, Çemberler ve Bugünün görevi Dikkat/Farkındalık dilimini dolduruyor ama seriye ve haftalık hedefe
  girmiyor; iki sayı çelişiyor. Tasarım kararıdır (§ plan).
- **Kü-3.** Profil cevapları yalnız iris başlangıç kaydı varsa merkeze giriyor; eski kurulumda hiç girmiyor.
- **Kü-4.** Gelişim satırında "−0,0" (`ProgressOverview signed` işareti yuvarlamadan önce alıyor; rapor ve PDF doğru).
- **Kü-5.** Düzen sayılarının penceresi yazılmıyor: aynı durumda PDF 23 gün (tüm kayıtlar), 5. gün raporu 21 gün
  (başlangıçtan beri), Nef 7 gün; hepsinin etiketi "aktif gün".
- **Kü-6.** Ondalık basamak yüzeyler arasında farklı (Gelişim 119,5 ms; PDF ve rapor 120 ms).
- **Kü-7.** Modül özetleri iki ayrı işlevde (`stats()` Pratikler için, `coach()` Nef için); merkezde değil.
- **Kü-8.** Plandaki satır atıfları kaymış: `metricCards` bugün `progress.js:162` (plan 152–156), Yöntem metni
  `ProgressOverview.jsx:478` (plan 463), `exportData.js` `:118/:161/:288` (plan 117/139/266). Görevde adı geçen
  `GrowthMap` ayrı dosya değil; `components/ProgressOverview.jsx` içinde bir işlev.

## 4. Kamera ölçümleri

**Kamera görüntüsü telefondan çıkmıyor.** JS kodunda kare, tuval ya da görüntü verisi gönderen bir ağ çağrısı yok
(`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `toDataURL`, `toBlob`, `getImageData` taraması). MediaPipe modeli
yalnız indiriliyor. Nef'e kamera kökenli yalnız özet sayılar gidiyor (`vaDelta`, `track.arrive7`, `snake.eyes7`), o da
rızayla. Swift tarafına bakılmadı.

| Ölçü | Kayıt | Merkezde | Gelişim / Rapor / Nef | Sorun |
|---|---|---|---|---|
| İlk Bakış 20 sn kırpma | `profile.firstLook {blinks, seconds, method}`; iris anlık görüntüsüne **yöntemsiz** | yalnız iris anlık görüntüsünden | Gelişim satırı / ✘ / ✘ | Kü-9 |
| Göz kırp egzersizi (algılanan kapanma) | `sessions {type:'blink', detectedClosures…}` | gün | ayrıntı metni / CSV notu / ✘ | bilerek ölçü değil |
| Egzersiz setinde sensör sayıları | **kaydedilmiyor** (`routineRecord` yalnız `setId, seconds, steps`) | ✘ | ✘ | Kü-10 |
| Görme testinde mesafe | göz kaydı `meanDistanceMm`, `distanceTracked`, `camFailedMidTest` | seri anahtarı | not / PDF sütunu / dolaylı | **Ö-11** |
| Parlaklık başlangıcı | göz kaydı `brightness {from, forced}` | ✘ | hiçbir yerde okunmuyor | Kü-11 |
| Bakış kalibrasyonu | `gozolcum:gaze-model-v1` | ✘ (ayar) | ✘ | **Kü-12** |
| Çemberler varış süresi (gözle) | `sessions {arriveMs, control:'eyes'}` | gün | Pratikler / ✘ / `arrive7` | — |

**Ö-11. Tek bir kamerasız E testi, görme serisini ve kırmızı uyarıyı bir hafta siliyor; ekran "Alışma dönemi" diyor.**
`lib/trend.js comparableTests` seri anahtarını son testten alıyor; kamera test ortasında durunca kayıt
`distanceTracked:false` olur ve öteki bütün kayıtlar seriden düşer. Betik C-T8: 36. günde kırmızı uyarılı seri + 43. günde
kamerası duran tek test → `phase: familiarization, alert: null`, ekranda "Alışma dönemi"; Nef de uyarıyı kaybeder.
**Düzeltme:** seri, en çok kaydı olan (ya da son kameralı) mesafe modundan seçilir; kamerasız tek test ayrı not olur.
Bu, Gelişim tasarımından bağımsız bir güvenlik bulgusudur; ana oturuma ayrıca bildirilir.

**Ö-12. Nef, ölçüsü olan üç modülü (Dalga, Gökyüzü, Yön) hiç bilmiyor; boş üç modül (nefes, Yılan, Çemberler) her
kullanıcı için sıfırlı özet gönderiyor.** `coach()` yok ya da boş veride `null` dönmüyor. **Düzeltme:** üç modüle
`coach()`; boş veride `null` zorunluluğu `registry.test`'te.

- **Kü-9.** İlk Bakış kırpma sayısı yöntemsiz saklanıyor; başlangıçta kendi sayımı, 28. günde TrueDepth yan yana
  karşılaştırılabilir. Anlık görüntüye yöntem eklenmeli; farklı yöntemler yan yana konmamalı.
- **Kü-10.** Egzersiz setinde kameranın saydığı hareketler ve "takıldım, atla" kaydedilmiyor; ileride "kamerayla
  doğrulandı" bilgisi geri getirilemez.
- **Kü-11.** Parlaklık başlangıç değeri kaydediliyor, hiçbir yerde okunmuyor.
- **Kü-12.** Bakış kalibrasyonu "Tüm verileri sil"de silinmiyor (`clearGazeModel` hiç çağrılmıyor). Silme sözü
  eksik kalıyor; ana oturuma ayrıca bildirilir.
- **Kü-13.** Yoga: 30 sn dinlenip durdurulan ders "ders" ve "pratik günü" sayılıyor, Beden alanına gün yazıyor;
  uygulama ders sırasında kapanırsa önce puanı kayboluyor. Nef yoganın önce → sonra değişimini almıyor.
- **Kü-14.** Modüllerin `coach()`'unda "7 gün" iki anlamda (takvim günü ve kayan 7 × 24 saat).

**E testi kuralının takvimi (betik C, sağ göz, haftalık):** 1. gün "Alışma dönemi"; 9. gün "Başlangıç değerin 3 haftalık
testle oluşuyor; 1 test tamam"; başlangıç en erken 22. gün; 30. gün "doğrulanmış değişim yok" ve "Başlangıç / Son 3 test"
kutusu. 29. günde başlayan +0,15'lik gerçek kötüleşme 43. günde sarı uyarı veriyor (art arda 3 test kuralının doğal
sonucu; 22–35. günlerde son 3 test başlangıç testleriyle çakışıyor). Bu kurala dokunulmaz (onaylı; plan §3.B.3).

## 5. Plan §3.B.2'deki altı sorunun bugünkü durumu

| # | Sorun | Bugün | Kanıt |
|---|---|---|---|
| 1 | `metricTrend` bütün geçmiş | var | A-S1, A-S1b |
| 2 | Aynı gün turları | var | A-S2 |
| 3 | Öğrenme etkisi | kısmen gösterildi (aynı gün turlarında) | A-S2; farklı günlere yayılmış örnekte "noise" |
| 4 | `days7` kaydı sayıyor | var, okuyan yok | A-S4 |
| 5 | Önce → sonra bütün geçmiş | var; ortalamaya dönüş notu yok | A-S5 |
| 6 | Okuma yaya girmiyor | var | A-S6 |

Plan §3.B.5 "tek hesap" iddiası bugün karşılanmıyor: kodda `verdict` yok; `status`'u `metricStatus`, `feelOnlyText`,
`exportData STATUS_TEXT` ve `verifiedChange` ayrı ayrı okuyor; Nef hiç okumuyor. §3.B.4 "karışık" kuralı ve etkilerde 28
gün sınırı yok. §3.C.5: `readingWpm` ve `screenHours` hâlâ şemada, modül sınırı hâlâ 10.

## 6. Doğru çalışanlar (betikle görüldü)

- Yoga kaydı ders başına doğru alana gidiyor; etkiler ve uykuya dalma ölçüsü doğru alanda.
- Alarm: aynı günün uyanış ve sabah olayları tek gün; kurma olayı sayılmıyor.
- Mola/su gün sayısı gün sayıyor.
- Metrik alan adları yazanla okuyan arasında tutarlı.
- Göz hükmü ve mesajı (`trendMessage`) Gelişim, rapor ve PDF'te aynı.

## 7. Bakmadıklarım

Home göz kartının ekrana basılmış metni; `NudgeSection`, takvim ve okuma kartının içeriği; 28. gün karşılaştırma
ekranı; sarı/kırmızı göz uyarısının bütün yüzeylerde aynı olup olmadığı; `growthMap` "ilk 28 gün" penceresinin
sayıları; `HealthPlugin.swift`; sunucu (`api/coach`). Bunlar kodlama öncesi eşdeğerlik düzeneğinde sınanır (PLAN §7).
