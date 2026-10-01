# YOL · Nef: değerlendirici ve sözcü (tasarım, 2026-09-29)

Bu belge bir PLAN ve TASARIMDIR; kod değişikliği sahibinin onayından sonra yapılır (`SAHIP_ISTEKLERI.md`, bağlayıcı
kurallar). Kapsam: sahibinin 4. maddesi ("bütün modüller bir şey ölçer, hepsi merkezde değerlendirilir, **Nef modülleri
değerlendirir ve sözcümüz olur**") ile bunun 1–3 ve 6. maddelerle bağı (sonsuz yol, kademeli artış, yeni modüller,
mevcut sistem bozulmaz). Yolun kendisi `YOL.ilerleme.md`'de, yeni modüller `YOL.moduller.md`'de; burada yalnız Nef'in
ne okuduğu, ne söylediği, ne söylemediği ve bunun nasıl sınandığı var. 5 saniye kuralı bu belgenin dışındadır.

Sağlık iddiası yok. Her bilimsel dayanak PubMed'de bu oturumda doğrulandı (§14; PMID ve DOI); dayanağı olmayan her
zamanlama ve eşik **VARSAYIM** diye işaretlidir. Dosya:satır göndermeleri 2026-09-29 tarihli koda aittir
(`/home/user/eyes/app/...`). Uydurma yok: bakılmayan şey "bakmadım" diye yazılı.

---

## 0. On satırda özet

1. **Nef hesap yapmaz; merkez hesaplar, Nef söyler.** Sayılar telefonda kural katmanından (`lib/dataHub.js`,
   `lib/progress.js`, `lib/trend.js`) çıkar; model ya da şablon yalnız bu sayıları Türkçe cümleye döker.
2. Bugün Nef'e giden özet **günlük** ve **7 modülden** ibaret (`coach()` olan canlı modüller: breath, fark-ettin, notice,
   quick-look, snake, tek-bakis, track; §3 envanteri). Dalga, Gökyüzü, Yön, İyi oluş, alarm, mola/su, sağlık Nef'e
   gitmiyor.
3. Yeni katman: **dönem sinyalleri** — `today` (var), `week` (geçen takvim haftası), `month` (son 28 gün, iris ve
   Gelişim haritasıyla aynı pencere). Üçü de aynı merkezden (`hub`, `growthMap`, `verifiedChange`) okur.
4. Modül sözleşmesi değişmez; `coach(sessions, now)` kalır, üç kural eklenir: pencerede kayıt yoksa `null`, en çok
   6 alan, tarih yok. İlerleme basamağı `ctx` ile isteğe bağlı üçüncü parametre olarak gelir (`ctx` yoksa bugünkü çıktı).
5. Her modülün Nef için bir **istem satırı** (`coachNote`) olur; sunucudaki kopya (`coachCore.js MODULE_NOTES`) manifestle
   birebir aynı olmak zorundadır, test bunu denetler.
6. "Değişim" sözü yalnız merkezin **doğrulanmış değişim** işaretinden (`verifiedChange` `up`/`down`, `who5.status`,
   `effects[].sig`, `vaTrend`) çıkar; başka her durumda "doğrulanmış bir değişim yok". Tek ölçümün ±0,2 logMAR
   oynaması kuralı istemde aynen kalır (`coach.test.js:44-49` bunu zaten sınıyor).
7. Doktora yönlendirme cümleleri **sabittir ve kural katmanından gelir**; model bunları yazmaz, kart onları modelden
   bağımsız olarak ilk satırda gösterir. Kırmızı uyarıda "birkaç gün daha ölç" denmez (bugünkü kural yedeğinde bu
   ayrım yok: `coach.js:80-82`, bulgu §8.1).
8. Telefondan çıkmayanlar listesi (§7.3) genişledi ve testle sabitlendi: kamera, bakış noktaları, tarih damgaları,
   ham ölçüm serileri, serbest metin, kimlik, Apple Sağlık.
9. Rıza: haftalık/aylık değerlendirme ve yeni özetler amacı genişletir → `coach` rızası **sürüm 2** (izin vermiş kişiye
   yeniden sorulur, reddetmişe sorulmaz; `consent.js:102-118` mantığı). `coachLife` aynen; sağlık verisi yine gitmez.
10. Çevrimdışı eşdeğerlik: her dönem için kural şablonu var; aynı sinyal, aynı sabit satırlar, aynı eylem listesi;
    test iki yolu aynı sabit veriyle karşılaştırır. Öneri (karar): kural tabanlı Nef rıza olmadan da konuşsun
    (veri telefondan çıkmaz), model yalnız rızayla.

---

## 1. Bugün kodda ne var (Nef hattı)

| Katman | Nerede | Bugünkü davranış |
|---|---|---|
| Sinyal (telefon) | `lib/coach.js:26-61` `buildSignals` | Son 7 gün: aktif gün, dakika, seri, hafta hedefi, egzersiz/test sayısı; görme (`pickSeries` → `analyzeTrend`): `vaPhase`, `vaCurrent7`, `vaBaseline`, `vaDelta`, `vaTrend`, `vaAlert`; okuma hızı; son test/egzersizden bu yana gün; Yılan rekoru; saat; `modules` (`:64-76 moduleSignals`); profil özeti yalnız `coachLife` ile (`:20-24`). |
| Süzgeç (iki tarafta) | `lib/coachCore.js:9-34` `SCHEMA`, `:38-52 sanitizeModules` (en çok 10 modül × 6 alan, sayı ya da ≤ 24 karakter dize), `:54-62 sanitizeSignals` | Şemada olmayan alan düşer; sınır dışı değer düşer. `MAX_SIGNAL_BYTES = 4000` (`:5`). |
| İstem | `lib/coachCore.js:64-79` `SYSTEM_PROMPT`, `:81-83 buildUserPrompt` | Tek istem, yalnız "bugün". Görme kuralları `:71-73` (kırmızı, sarı, takip; ±0,2). Modül açıklaması yalnız track/snake/breath (`:75`). Eylem listesi `:77`. Çıktı JSON `{insight ≤160, action ≤60}` (`:78-79`). |
| Bekçi | `lib/coachCore.js:86-101` `FORBIDDEN`, `passesGuard`; `:103-118 parseCoachReply` | Yasak kalıp (iyileştir, tedavi, gözlükten kurtul, numara düşer, kas güçlenir, teşhis, körlük, garanti) → cevap atılır, şablona düşülür. Uzunluk sınırı 240/90. |
| Sunucu | `api/coach.js` | Yalnız `kind: 'today'` (`:48`, aksi 400); gövde > 4000 bayt → 413 (`:41`); OpenRouter, `temperature 0.4`, `max_tokens 220` (`:66-67`); güvensiz cevap 422 (`:78`); içerik kaydedilmez, `Cache-Control: no-store` (`:27`). |
| İstemci | `lib/coach.js:109-136` `getTodayInsight` | Günde bir kez; sinyal değişince yeniden (`:114`, önbellek `gozolcum:coach-today` `:10`); ağ/model yoksa `fallbackInsight` (`:79-91`), `source: 'rules'`. Zaman aşımı 10 sn (`:12`). |
| Kart | `components/CoachCard.jsx` | Rıza yoksa tanıtım kartı (`:53-66`); varsa "Bugün · Nef" (`:72-95`); `source: 'rules'` → "çevrimdışı öneri" (`:75`); eylem metni → ekran eşlemesi `ACTIONS` (`:14-24`: günlük test, hafif/normal set, kırpma, okuma, nefes, çember, yılan). |
| Rıza | `lib/consent.js:13` `CONSENT_VERSIONS.coach = 1`, `:60-70 CONSENTS.coach` ("Ne" satırı `:64`), `:71-81 coachLife`, `:86-89 coachAllowed` | Tercih tek başına yetmez; kayıtlı rıza + sürüm gerekir. Sağlık rızası "Sunucuya ve Nef'e gitmez" der (`:20`). |
| Nef'in öbür sesleri (yerel, modelsiz) | `lib/today.js:335-393` `JEV_WORDS`, `jevLine` (yol baloncuğu); `lib/homeSuggest.js:12-42` (Ana sayfa "Nef ·" satırı, `Home.jsx:175, :255`) | Kural metni; koça hiçbir şey gitmez. |
| Merkez | `lib/dataHub.js:59-87 hub`, `:137-150 verifiedChange`, `:155-195 growthMap` (28 gün, `:97`), `:199-206 weakestDomain`; `lib/progress.js:36-49 who5Card`, `:74-89 acuteEffects` (`ACUTE_MIN 3`), `:130-150 metricTrend` (`METRIC_MIN 6`), `:159-175 eyeCard`, `:203-216 firstReport` | Nef bugün bunların **hiçbirini** okumuyor; kendi 7 günlük hesabını `buildSignals` içinde kuruyor (veri merkezi ilkesine aykırı: ANA_BELGE §2 "Nef … merkezden okur"). |
| Sabit yönlendirme metinleri | `lib/trend.js:258-266` (kırmızı/sarı), `:275-277` (doğrulanmış değişim yok, ±0,2); `lib/who5.js:27` (düşük WHO-5); `components/ProgressOverview.jsx:383-385` (sarı/kırmızı kuralı ve "beklemeden başvur"); `lib/profile.js:14-21` `RED_FLAGS` | Ekranda var; Nef istemi kırmızı/sarı cümleyi modele yazdırıyor (`coachCore.js:71-72`), kart ayrıca göstermiyor. |

Bugün Nef'in yaptığı: günde bir içgörü, bir eylem; 7 modül özeti; profil özeti isteğe bağlı. Yapmadığı: haftalık ve
aylık değerlendirme, alan (iris) bazında konuşma, ilerleme basamağı, doğrulanmış değişimi merkezden okuma, Dalga /
Gökyüzü / İyi oluş / Yön / alarm / mola-su / sağlık.

---

## 2. İlke: merkez hesaplar, Nef söyler

```
kayıtlar (sessions, tests, profile, habits)            ← modüller yazar (altın kural)
        │
        ▼
MERKEZ  lib/dataHub.js hub · growthMap · verifiedChange   ← tek hesap yeri
        lib/progress.js who5Card · acuteEffects · metricTrend · eyeCard
        lib/trend.js analyzeTrend (görme: faz, uyarı, eğilim)
        lib/progression.js stageOf · next (YOL.ilerleme §11; henüz yok)
        │  yalnız sayılar ve kısa durum dizeleri
        ▼
SİNYAL  lib/coach.js buildSignals (today) · lib/coachPeriods.js weekSignals, monthSignals (yeni)
        + sabit satırlar fixedLines() (doktor, WHO-5)          ← modelden bağımsız
        │  sanitizeSignals (şema) → ≤ 4000 bayt
        ▼
SÖZCÜ   (a) model: api/coach.js → OpenRouter (yalnız rızayla)   (b) şablon: fallbackToday/Week/Month (her zaman)
        │
        ▼
BEKÇİ   parseCoachReply(kind) → yasak kalıp, uzunluk, satır sayısı, eylem listesi → geçmezse (b)
        │
        ▼
KART    CoachCard (Bugün) · Gelişim "Nef'in değerlendirmesi" (hafta, ay) · yol baloncuğu · Ana sayfa satırı
```

Üç kural:
1. **Değişim yalnız merkezden.** Nef, iki sayıyı kendisi karşılaştırıp "arttı/azaldı" diyemez. Yalnız merkezin verdiği
   durum alanlarını söyler (§6.2).
2. **Tehlike ve yönlendirme modele bırakılmaz.** Sabit cümleler kural katmanından gelir, kart onları önce gösterir (§7.2).
3. **Modül eklemek = klasör koymak.** Yeni modül `coach()` ve `coachNote` verir; başka hiçbir dosyaya elle satır eklenmez;
   sunucudaki istem kopyası testle eşitlenir (§4.4).

---

## 3. Modül envanteri (21 manifest, `app/src/modules/*/manifest.js`, 2026-09-29)

Sütunlar: `coach()` Nef özeti · `stats()` Gelişim "Pratikler" satırları · `progress` (alan; e = önce→sonra etkisi,
m = zaman serisi ölçüsü) · `today()` yol durağı · `sessions.match` merkeze giriş yolu.

| id | Ad | halka · tür | progress | sessions.match | coach() | stats() | today() | Not |
|---|---|---|---|---|---|---|---|---|
| alarm | Alarm | life · practice | wellbeing | ✘ (alarm günlüğü `lib/alarmLog.js alarmHabits` → merkez) | ✘ | ✘ | ✘ | `alarm/manifest.js:14-16` |
| awareness | Farkındalık | attention · practice | awareness | ✘ (giriş kapısı, kaydı yok) | ✘ | ✘ | ✘ | `awareness/manifest.js:10` |
| blink | Göz kırpma egzersizi | eye · exercise | eye | ✔ `type 'blink'` | ✘ | ✘ | ✘ | Nef'e `exercises7`/`minutes7` içinde toplu gider (`coach.js:41-46`) |
| breath-count | Nefes sayma | attention · measure | awareness · m (doğruluk %) | ✔ | ✔ `sessions7, accuracy7, best` | ✔ | ✘ | **emekli** (`:24`), koça gitmez (`registry.live`) |
| breath | Nefes | life · practice | calm · e (sakinlik 1–5) | ✔ | ✔ `sessions7, minutes7, calmDelta7` (`:37-41`; boşken de döner) | ✔ | ✔ mola durağı (`:55-58`) | |
| daily | Günlük test | eye · measure | eye | ✘ (`tests` → Göz) | ✘ | ✘ | ✔ | görme özeti `buildSignals` içinde (`coach.js:33, 47-52`) |
| dalga | Dalga | life · practice | calm · e ×3 (sakin/güç→self/motive→wellbeing) | ✔ | ✘ | ✔ | ✘ | Nef'e **gitmiyor** |
| fark-ettin | Fark Ettin mi? | attention · practice | awareness · m (fark etme %) | ✔ | ✔ `rounds7, noticedPct7, level` (`:46-51`; boşken null) | ✔ | ✔ haftada 3, döndürme | |
| gokyuzu | Gökyüzü molası | life · practice | calm · e (dinlenmişlik 1–10) | ✔ | ✘ | ✔ | ✘ | Nef'e **gitmiyor** |
| mola | Mola | life · practice | body | ✘ (habit-log; bilerek, `mola/manifest.js:4-5`) | ✘ | ✘ | ✘ | seriye/Nef'e girmesin kararı (BILDIRIM_PLANI §7) |
| notice | Bugünün görevi | attention · practice | awareness · m (fark edilen sayısı) | ✔ (`countsTowardGoal: false`) | ✔ `days7, avgCount7` (`:34-38`; boşken null) | ✔ | ✔ final | |
| quick-look | Hızlı Bakış | attention · practice | focus · m (eşik ms, `better: down`) | ✔ | ✔ `first, last, sessions7, hours` (`:49-54`; hiç yoksa null) | ✔ | ✔ | |
| reading | Okuma | eye · measure | eye | ✘ (`tests`) | ✘ | ✘ | ✔ haftada bir | `readingWpm` `buildSignals`te (`coach.js:38, 53`) |
| routine | Egzersiz setleri | eye · exercise | eye | ✔ `type 'routine'` | ✘ | ✘ | ✔ beş grup | toplu `exercises7` |
| snake | Yılan | attention · practice | focus | ✔ (`countsTowardGoal: false`, rekor) | ✔ `best, sessions7, eyes7` (`:39-42`; boşken de döner) | ✔ | ✔ açık uçlu | |
| tek-bakis | Tek Bakışta | eye · practice | focus · m (harf) | ✔ | ✔ `span7, rounds7, first` (`:49-53`; boşken null) | ✔ | ✔ haftada 3 | |
| track | Çemberler | attention · practice | focus | ✔ (rekor) | ✔ `best, sessions7, follow7, arrive7?` (`:50-59`; boşken de döner) | ✔ | ✔ her gün | |
| water | Su | life · practice | body | ✘ (habit-log) | ✘ | ✘ | ✘ | |
| weekly | Haftalık tam test | eye · measure | eye | ✘ (`tests`) | ✘ | ✘ | ✔ 7 günde bir | |
| who5 | İyi oluş | life · measure | wellbeing | ✔ (`countsTowardGoal: false`) | ✘ | ✘ | ✘ | 14 günde bir; Nef'e **gitmiyor** |
| yon | Yön | life · practice | self · e (rahatsızlık, `better: down`) · m (Ayna /5) | ✔ | ✘ ("Koça gitmez", `yon/manifest.js:2`) | ✔ | ✘ | serbest metin → ayrı rıza (YAPILACAKLAR "Nef'e Yön serbest metni") |

Sayım: `coach()` 8 manifestte (7 canlı), `stats()` 11, `today()` 11, `progress.effects` 4 modülde (breath, dalga,
gokyuzu, yon), `progress.metrics` 6 modülde (breath-count, fark-ettin, notice, quick-look, tek-bakis, yon).
İstem (`coachCore.js:75`) yalnız 3 modülü açıklıyor; öbür 4 canlı modülün alanları (`rounds7`, `noticedPct7`, `span7`,
`hours`…) modele **tanımsız** gidiyor. Bu, "modül ekle, Nef anlasın" zincirinin bugün kopuk olduğu yer.

**Nef'e bugün ne gidiyor, ne gitmiyor (veri sınıfı bazında)**

| Veri sınıfı | Gidiyor mu | Nereden | Rıza "Ne" satırında var mı (`consent.js:64`) |
|---|---|---|---|
| Düzen (gün, dakika, seri, hedef) | ✔ | `buildSignals` | ✔ |
| Görme: faz, ortanca, başlangıç, fark, eğilim, uyarı | ✔ | `pickSeries` → `analyzeTrend` | ✔ ("ölçüm ortancası, başlangıçtan farkı, uyarı düzeyi") |
| Okuma hızı | ✔ | son `reading` testi | ✔ |
| Oyun/pratik puanları (7 modül) | ✔ | `coach()` | ✔ ("oyun ve egzersiz puanları; nefes önce/sonra dahil") |
| Saat | ✔ | `hourNow` | ✔ |
| Profil özeti (uyku, ekran, gece telefonu, stres) | yalnız `coachLife` | `lifeSignals` | ✔ ayrı rıza |
| Dalga / Gökyüzü önce→sonra | ✘ | — | ✘ → v2'de eklenir |
| İyi oluş (WHO-5) | ✘ | — | ✘ → v2'de yalnız **değişim durumu** |
| Alan bazında kayıtlı gün (7 alan, 7 ve 28 gün) | ✘ | — | ✘ → v2 |
| İlerleme basamağı, ara verilen gün, "sonra yaparım" sayısı | ✘ (katman yok) | — | ✘ → v2 |
| Yön (puan ve yazı) | ✘ | — | yazı için ayrı rıza kararı; puan §13.4 |
| Apple Sağlık (adım, uyku) | ✘ | — | sağlık rızası "Nef'e gitmez" (`consent.js:20`); değişmez |
| Kamera, bakış noktası, tarih, kimlik | ✘ | — | "gitmez" cümlesi var (`:64` son cümle) |

---

## 4. Modül başına özet: `coach()` sözleşmesi v2

### 4.1 İmza aynı kalır

```js
coach(sessions, now, ctx?) → null | { alan: sayı | kısaDize }   // ctx isteğe bağlı: { progression?, tests? }
```

Kayıt defteri denetimi değişmez (`registry.js:106` "coach fonksiyon olmalı"). Üçüncü parametreyi bilmeyen eski
manifestler aynen çalışır; `ctx` verilmezse çıktı bugünkü çıktıdır (böylece `coachStats.test.js:19-30`'daki birebir
eşitlikler geçmeye devam eder).

### 4.2 Yedi kural (test edilir, §10 T3–T5)

| # | Kural | Neden |
|---|---|---|
| K1 | Pencerede (son 7 gün) kayıt yoksa `null` döner. Bugün breath (`:37-41`), snake (`:39-42`) ve track (`:50-59`) boşken de nesne döndürüyor; fark-ettin, notice, quick-look, tek-bakis zaten `null` | 10 modül sınırı (`coachCore.js:41`) boş modüllerle dolmasın; istem kısa kalsın. `YOL.moduller.md` §2.6 ile aynı öneri |
| K2 | En çok 6 alan; sayı (|v| ≤ 10⁶, 3 hane) ya da `[\w-]{1,24}` dize | `sanitizeModules` (`:44-49`) fazlasını zaten düşürür; kural yazılı olsun |
| K3 | Tarih, saat, kimlik, ham dizi yok | telefondan çıkmayanlar (§7.3); `coach.test.js:59` benzeri test her modül için |
| K4 | Alan adları ortak sözlükten (§4.3); modüle özgü alan sözlüğe eklenir ve `coachNote`'ta açıklanır | model tanımsız alanı yorumlamasın |
| K5 | `ctx.progression` varsa `stage` (basamak, 1'den) ve `days` (o modülün yapıldığı ayrı gün sayısı D) eklenebilir; toplam yine ≤ 6 | ilerleme dili (§6) |
| K6 | `moduleSignals` (`coach.js:64-76`) modülleri `sessions7` (yoksa `rounds7`/`days7`) büyükten küçüğe sıralayıp öyle verir; 10'u aşarsa en az yapılanlar düşer | sınır aşımı belirsiz değil, öngörülebilir olsun |
| K7 | Puan/istatistik görmeyle ilişkilendirilmez (istemde yazılı, `coachCore.js:75`) | sağlık iddiası yok |

### 4.3 Ortak alan sözlüğü (istemde bir kez açıklanır; modüle özgü alanlar `coachNote`'ta)

| Alan | Anlam | Kim kullanır |
|---|---|---|
| `sessions7` / `rounds7` / `days7` | son 7 günde seans / tur / gün sayısı | hepsi |
| `minutes7` | son 7 gün toplam dakika | breath, dalga, meditasyon |
| `best` | tüm zamanların rekoru | snake, track |
| `first` / `last` | ilk ve son ölçüm (modülün kendi biriminde) | quick-look, tek-bakis |
| `xDelta7` (`calmDelta7`, `restDelta7`, `energyDelta7`) | önce→sonra puan farkının 7 günlük ortalaması, modülün ölçeğinde | breath, dalga, gokyuzu, meditasyon |
| `level` | modülün kendi seviyesi (oyun içi) | fark-ettin, track |
| `stage` / `days` | yol basamağı ve yapılan gün sayısı (yalnız `ctx.progression` ile) | yolda olan modüller |

`sanitizeModules` alan adı desenini (`/^[a-zA-Z][a-zA-Z0-9]{0,23}$/`, `:45`) değiştirmeye gerek yok.

### 4.4 `coachNote`: modülün Nef'e kendini tanıtan tek satırı

- Manifeste isteğe bağlı alan: `coachNote: 'dalga = birkaç dakikalık ses (minutes7 dakika; calmDelta7 sakinlik 1–10 farkı). Müzik-sağlık iddiası yazma; yalnız düzen dilinde.'`
  `validateManifest`'e bir satır: `if (m.coachNote != null) need(typeof m.coachNote === 'string' && m.coachNote.length <= 240, …)`.
- Sunucu `registry`'yi içe aktaramaz (`import.meta.glob`, `registry.js:159`, Vite'a özgü; `api/coach.js` yalnız
  `coachCore.js`'i alır). Bu yüzden istem satırları `coachCore.js`'te sabit `MODULE_NOTES = { breath: '…', … }` olarak
  durur; istem `MODULE_NOTES`'tan üretilir (bugünkü `:75` tek satırının yerine).
- **Eşitlik testi** (§10 T6): `registry.live` içinde `coach` olan her modül için `MODULE_NOTES[m.id] === m.coachNote`.
  Not eksik ya da farklıysa test kırılır. Böylece "klasör koy" ilkesi korunur (manifest tek kaynak), sunucu kopyası
  unutulamaz.
- Yeni `coach()` alacak var olan modüller: **dalga** (`sessions7, minutes7, calmDelta7, energyDelta7`), **gokyuzu**
  (`breaks7, restDelta7`). Yön puanı ve alarm §13'te karar. `blink` ve `routine` toplu alanlarda kalır (K1 gereksiz
  tekrar olmasın). Yeni modüllerin alanları `YOL.moduller.md` §5 tablosunda (walk, sleep, tepki, meditasyon, yoga);
  sağlık kaynaklı olanlar (sleep, walk adım doğrulaması) o verinin rızası "Nef'e gider" demedikçe **gönderilmez** (§7.4).

### 4.5 Emekli modül

`registry.live` emekliyi dışarıda bırakır (`registry.js:137`), `moduleSignals` yalnız `live` üzerinde döner
(`coach.js:66`). Emekli modülün eski kayıtları Gelişim'de okunur ama Nef'e gitmez; değişmez (breath-count örneği,
`coachStats.test.js:21`).

---

## 5. Dönemler: günlük, haftalık, aylık

### 5.1 Ne zaman, nerede, ne kadar

| Dönem (`kind`) | Pencere | Tetik | Görünüm | Ne kadar görünür | Önbellek | Etiket |
|---|---|---|---|---|---|---|
| `today` (var) | son 7 gün (kayan) + bugünün yolu | her açılış; günde bir istek, sinyal değişince yeniden (`coach.js:114`) | Ana sayfa "Bugün · Nef" (`Home.jsx:375`) | gün boyu | `gozolcum:coach-today` | var |
| `week` (yeni) | **geçen takvim haftası** Pazartesi–Pazar (`calendar.js:25 startOfWeek`; Ana sayfadaki "Bu hafta n/hedef" ile aynı sınır) | Pazartesi (ya da o hafta ilk açılış) ve o haftada ≥ 4 takvim günü veri varsa | Ana sayfa Nef kartında ikinci satır "Haftalık değerlendirmen hazır →" + Gelişim'in başında "Nef'in değerlendirmesi" kartı | Pazartesi–Çarşamba Ana sayfada; sonra yalnız Gelişim'de (son 4 hafta saklanır) | `gozolcum:coach-week` (`{ weekKey, sig, lines, action, source }`) | VARSAYIM (takvim haftası, ≥ 4 gün, 3 gün görünürlük) |
| `month` (yeni) | **son 28 gün** = `WINDOW_DAYS` (`dataHub.js:97`) = iris 28 (`iris.js:8`) | `sinceStart` (`growthMap`, `:160`) 28'in katını geçince: 29., 57., 85. gün… | Gelişim "Nef'in değerlendirmesi" (ay sekmesi) + Ana sayfa kartında bir satır (3 gün) | 3 gün Ana sayfada, Gelişim'de son 3 ay | `gozolcum:coach-month` | VARSAYIM (28 gün merkezle aynı; 3 gün) |

İstek sayısı kişi başına: ≈ 30 günlük + 4 haftalık + 1 aylık = ~35/ay (maliyet VARSAYIM: JEV_GOZ_KOCU "ayda birkaç
cent" notu; model fiyatı belli olunca hesaplanır). Aylık ve haftalık `max_tokens` 400 (VARSAYIM; bugün 220).

Aylık değerlendirme "Doktoruma göster" PDF'ine (`lib/exportData.js:271`) **girmez**: doktora giden belge yalnız kural
metni taşır (`trendMessage`, `droppedNotes`); model cümlesi tıbbi belgeye konmaz. Karar §13.6.

### 5.2 Haftalık sinyal paketi (`kind: 'week'`)

Hepsi merkezden; `buildSignals`'ın 7 günlük alanları da (görme ve profil özeti dahil) aynı pakette gider.

| Alan | İçerik | Kaynak (dosya:satır) |
|---|---|---|
| `week.daysActive`, `week.target`, `week.met` | geçen hafta aktif gün (0–7), hedef, tutuldu mu | `stats.js:236-247 summary` (haftayı `now` = geçen Pazar 23:59 ile çağırarak) |
| `week.minutes` | geçen hafta toplam dakika | aynı |
| `week.prevDaysActive` | bir önceki hafta (kıyas için yalnız sayı; "artış" sözünü model kurmaz, K-değişim kuralı) | aynı |
| `week.streakDays` | seri | `stats.js:262 streakFrom` |
| `domains[d].days7`, `.days28` | 7 alanda kayıtlı gün (mola/su/alarm günleri dahil, `dataHub.js:32`) | `hub().domains[d].records/habits` (`:80-81`) |
| `domains[d].status` | `'up'` / `'down'` / `null` (doğrulanmış değişim) | `verifiedChange` (`dataHub.js:137-150`) |
| `domains[d].top` | penceredeki en sık modülün id'si | `growthMap` `sources[0].key` (`:190`) |
| `who5.status` | `'none'`/`'first'`/`'noise'`/`'up'`/`'down'`; `who5.due` | `who5Card` (`progress.js:36-49`). **Puanın kendisi ve `low` gitmez** (§7.3) |
| `effects[]` (en çok 3) | `{ key, sig, dir }` — anlamlı önce→sonra etkisi var mı, yönü | `acuteEffects` (`progress.js:74-89`); `gain` sayısı gitmez, yalnız yön |
| `va*` | bugünkü görme alanları (faz, ortanca, başlangıç, fark, eğilim, uyarı) | `buildSignals` (`coach.js:33, 47-52`) |
| `modules` | 7 günlük modül özetleri (`coach()`) | `moduleSignals` |
| `path.day`, `path.stage{}`, `path.next`, `path.gapDays`, `path.later7`, `path.light7` | ilerleme (yalnız `lib/progression.js` gelince) | `YOL.ilerleme.md` §10 |
| `weekIdx` | kaçıncı hafta (1'den) | `calendarDays(firstDay, now)` (`dataHub.js:123-134`) / 7 |

### 5.3 Aylık sinyal paketi (`kind: 'month'`)

| Alan | İçerik | Kaynak |
|---|---|---|
| `month.idx` | kaçıncı 28 gün (1'den) | `sinceStart` |
| `month.canCompare` | iki pencere en az bir hafta ayrıştı mı (`sinceStart ≥ 35`) | `COMPARE_MIN_DAYS` (`dataHub.js:99`) |
| `domains[d].days28`, `.frac`, `.status`, `.top` | son 28 gün | `growthMap({ window: 'recent' })` |
| `domains[d].firstDays28` | ilk 28 gün (yalnız `canCompare`) | `growthMap({ window: 'first' })` |
| `who5.status`, `who5.n` | 28 günde en çok 2 cevap; yön | `who5Card` |
| `effects[]` | anlamlı etkiler (yön) | `acuteEffects({ since: 28 gün önce })` |
| `metrics[]` (en çok 5) | `{ key, status }` — `'better'`/`'worse'`/`'noise'`/`'unsure'`/`'first'`; sayı yok | `metricCards` → `metricTrend` (`progress.js:130-150`) |
| `va*`, `vaTests28` | görme (aynı alanlar) + 28 günde test sayısı | `analyzeTrend` |
| `iris.recheckDue`, `iris.rechecked` | 28. gün haritası | `iris.js:43-47 recheckDue` |
| `path.*` | ilerleme özeti (basamaklar, en uzun ara) | ilerleme katmanı |

### 5.4 Anlatı şablonu (model ve şablon aynı iskelet)

| Dönem | Satırlar | Eylem |
|---|---|---|
| `today` | 1 içgörü (≤ 160) | 1 eylem (≤ 60), eylem listesinden |
| `week` | 3 satır (her biri ≤ 140): **(1) düzen** — "Geçen hafta 5 gün çalıştın; hedefin 3 gündü." **(2) alan** — doğrulanmış değişimi olan **tek** alan, yoksa en düzenli alan + "doğrulanmış bir değişim yok" **(3) sıradaki** — ilerleme `path.next`'ten ("Bu hafta Nefes 3 dakikaya çıkıyor.") | 1 eylem |
| `month` | 4 satır: **(1) düzen** (28 günde alan alan gün sayıları, iris sırasıyla, en fazla üç alan adı) **(2) doğrulanmış değişimler** (her `status` olan alan; hiç yoksa tek cümle "doğrulanmış bir değişim yok") **(3) görme** (yalnız kural cümlesi: sabit satır ya da "doğrulanmış bir değişim yok") **(4) sıradaki 28 gün** (`path.next`, yeni açılacak modül) | 1 eylem (28. günde "İris haritan · yeniden bak") |

Satır sayısı ve uzunluk bekçide (`parseCoachReply(text, kind)`), aşarsa şablona düşülür.

### 5.5 Gün gün: yeni kullanıcı için ilk 8 hafta Nef ne söyler

Yol günleri `YOL.ilerleme.md` §6 ile uyumlu; burada yalnız Nef. "Sabit" = kural katmanı, modelden bağımsız.
Hafta başlangıcı kişinin başladığı güne bağlıdır; tabloda Pazartesi başladığı varsayıldı (VARSAYIM, yalnız örnek).

| Gün | Bugün · Nef (içgörü → eylem) | Sabit satır | Haftalık | Aylık | Kaynak/etiket |
|---|---|---|---|---|---|
| 1 | "Henüz ölçüm yok; ilk ölçüm başlangıç noktan olacak." → Günlük test (`coach.js:84`; ilerlemeyle haftalık test ilk durak, R6 `today.js:256-260`) | — | — | — | var |
| 2–7 | alışma dönemi: görme hakkında hiçbir şey (`vaPhase 'familiarization'`, `coachCore.js:70`); düzen ve basamak: "2. gün: Nefes yine 1 dk, göz kırpmaya sağ–sol eklendi." | — | — | — | `trend.js:5 FAMILIARIZATION_DAYS`; basamaklar YOL.ilerleme §5 |
| 5 | "İlk raporun hazır." → İlk rapor (yerel kural; model gerekmez) | — | — | — | `progress.js:198 REPORT_DAY`, `App.jsx:783-789` |
| 8 (Pzt) | düzen + basamak | — | **1. haftalık**: (1) "İlk haftanda 6 gün çalıştın." (2) "Göz alanı en düzenli; doğrulanmış bir değişim yok (başlangıç değerin oluşuyor)." (3) "Bu hafta Yakın–uzak ve Daire açılıyor." | — | ≥ 4 gün veri (VARSAYIM) |
| 8–21 | `vaPhase 'baseline'`: "başlangıç değerin oluşuyor, düzenli test et" dışında görme yorumu yok | — | 15. gün 2. haftalık | — | `trend.js:6-10` (8. günden ≥ 7 test, en erken 21. güne kadar) |
| 14 | "İyi oluş soruları bugün (5 soru, 1 dk)." → İyi oluş | — | — | — | `progress.js:19 WHO5_EVERY_DAYS` |
| 22 | faz `tracking`'e geçtiği gün bir kez: "Başlangıç değerin oluştu; bundan sonra değişimi kural doğrularsa söylerim." | — | 3. haftalık | — | `trend.js:170-179` |
| 22–28 | görme için üç olasılık: "doğrulanmış bir değişim yok" / iyileşme cümlesi / **sabit** sarı-kırmızı | sarı/kırmızı sabit satır (§7.2) | — | — | `coachCore.js:71-73` |
| 28 | "28. gün: iris haritana yeniden bak." → İris haritası | — | — | — | `iris.js:8, 43-47` |
| 29 | düzen | — | 4. haftalık (Pzt 29) | **1. aylık** (karşılaştırma yok: 29 < 35): 4 satır; eylem "İris haritan · yeniden bak" (yapılmadıysa) | `COMPARE_MIN_DAYS` |
| 30–56 | basamak varyantları (kırpma 10 tekrar, kalıp önerisi…) Nef bir kez tanıtır: "Bu haftadan sonra nefes kalıbı olarak Eşit ritim'i deneyebilirsin." | WHO-5 düşükse sabit satır (`who5.js:27`) | her Pzt | — | YOL.ilerleme §5.1 |
| 57 | — | — | — | **2. aylık**: "İlk 28 gün / Son 28 gün" karşılaştırması; alan gün sayıları yan yana; doğrulanmış değişimler | `growthMap window 'first'` |
| 57+ | döngü sonsuz: her Pzt haftalık, her 28 günde aylık; yeni modül açıldığında Nef bir kez tanıtır (`path.next`) | sabitler her zaman | ✔ | ✔ | — |
| Ara (3–13 gün) | "Kaldığın yerden; basamağın aynı." | — | o hafta ≥ 4 gün yoksa haftalık atlanır | — | ceza yok (YOL.ilerleme §7) |
| Ara ≥ 14 gün | "Uzun aradan sonra bugün bir basamak yumuşak; yarın kaldığın yerden." | — | — | — | `soft` (YOL.ilerleme §4, VARSAYIM) |

### 5.6 Nef'in söylemediği şeyler (bütün dönemler)

- Sayı uydurmaz; sayı yazarsa verilenle birebir (`coachCore.js:67`).
- "Arttı/azaldı/iyileşti/geriledi" yalnız durum alanlarından (§6.2). `week.prevDaysActive` gibi kıyas sayıları
  cümlede "geçen haftadan fazla" diye yorumlanmaz; iki sayı yan yana yazılabilir.
- Kişiyi başkalarıyla karşılaştırmaz (nüfus ortalaması, yaş grubu yok; sinyalde de yok).
- Sağlık sonucu, tanı, risk, "normal/anormal" yargısı yazmaz (§7.1).
- "Seri bozuldu", "kaçırdın", "geride kaldın" demez (ceza yok dili; yasak kalıp §7.1).
- Doktora yönlendirmeyi yumuşatmaz, ertelemez, kendi cümlesiyle yeniden yazmaz (§7.2).

---

## 6. İlerleme basamağı ve sıradaki adım: Nef nasıl söyler

### 6.1 Girdi (ilerleme katmanı `lib/progression.js`, YOL.ilerleme §10–11; henüz kodda yok)

| Sinyal | Tanım | Şema (`coachCore.js SCHEMA`'ya eklenir) |
|---|---|---|
| `path.day` | yolun yapıldığı ayrı gün sayısı D_toplam | `NUM(0, 3650)` |
| `modules[id].stage`, `.days` | modül basamağı (1'den) ve D(modül) | `sanitizeModules` içinde sayı |
| `path.next` | `{ module, stage, minutes }` — bir sonraki basamak | `module` `MODULE_KEY_RE`, sayılar |
| `path.gapDays` | son yol gününden bugüne takvim günü | `NUM(0, 3650)` |
| `path.soft` | bugün yumuşak basamak (≥ 14 gün ara) | `0/1` |
| `path.later7`, `path.light7` | 7 günde "sonra yaparım" ve "hafif gün" sayısı | `NUM(0, 50)` |
| `path.unlocked` | bugün yeni açılan modül id'si (varsa) | `MODULE_KEY_RE` |

### 6.2 Kurallar (istemde ve şablonda aynı)

| # | Kural | Örnek cümle (Nef) |
|---|---|---|
| İ1 | Basamak yalnız verilen `stage` sayısıyla söylenir; adı, süresi `path.next`/`modules[id]`'den. Nef basamak icat etmez | "Nefes 3. basamakta: bugün 2 dakika." |
| İ2 | Sıradaki adım yalnız `path.next`'ten; yoksa sıradaki adım cümlesi yazılmaz | "Sıradaki basamak: Nefes 3 dakika (2 gün sonra)." |
| İ3 | Yeni açılan modül (`path.unlocked`) bir kez, bir cümleyle tanıtılır; ne ölçtüğü söylenir, fayda vaat edilmez | "Bugün Gökyüzü molası açıldı: 2 dakika ufka bak; önce ve sonra nasıl hissettiğini kaydederiz." |
| İ4 | Ara: `gapDays` 1–13 → "kaldığın yerden"; `soft` → "bugün bir basamak yumuşak, yarın kaldığın yerden"; hiçbir zaman "seri bozuldu/kaçırdın" | "Beş gündür yoktun; basamağın aynı, kaldığın yerden." |
| İ5 | `later7 ≥ 3` aynı modülde → soru cümlesi, yargı değil (saat değişikliği önerisi Trinquart 2023 notuna göre kişinin seçimi; YAPILACAKLAR) | "Yürüyüşü bu hafta üç kez erteledin; saatini değiştirmek ister misin?" |
| İ6 | `light7` yorumlanmaz (hafif gün de yapılan gündür) | — |
| İ7 | Basamak ile ölçüm birbirine bağlanmaz ("basamak arttı, görmen düzeldi" yok) | — |

### 6.3 Şablon (kural yedeği) için karar ağacı — `fallbackToday` v2, sırayla ilk tutan

1. `vaAlert` red/yellow → içgörü sabit satırın **dışında** kalır (sabit satır kartta zaten var): "Bugün ölçümü atlama." → Günlük test.
2. `path.unlocked` → İ3 cümlesi → o modül.
3. `path.soft` → İ4 → yolun ilk durağı.
4. `path.gapDays ≥ 3` → "kaldığın yerden" → ilk durak.
5. `who5.due` → "İyi oluş soruları bugün." → İyi oluş.
6. `iris.recheckDue` → "28. gün: iris haritana yeniden bak." → İris.
7. bugünkü kurallar (`coach.js:83-90`): ölçüm yok / hafta hedefi / hedef tamam.
8. `path.next` varsa eylem sonuna basamak notu ("· 3. basamak").

---

## 7. Bekçi kuralları

### 7.1 Tanı yok, sağlık iddiası yok — `FORBIDDEN` v2 (`coachCore.js:86-95` listesine eklenir)

| Kalıp (regex, i) | Neden |
|---|---|
| bugünküler: iyileştir, tedavi, gözlükten kurtul, numara düş, kas güçlen, teşhis, körlük, garanti | var |
| `tanı`, `hastalı(k|ğ)`, `bozukluk`, `sendrom`, `depres`, `anksiyete`, `kaygı bozuk` | ruh sağlığı ve tanı dili (WHO-5 alanı geldi) |
| `uyku(suzluk)?(sun)?u?\s*(iyileştir|düzelt|tedavi)`, `dikkat eksikliği`, `yorgun(luk|sun)` | uyku/dikkat/yorgunluk çıkarımı (YOL.moduller §5 ile aynı) |
| `risk(in|iniz)?\s*(yüksek|düşük|var)`, `normal(in)? (altında|üstünde)`, `anormal`, `sağlıksız` | yargı ve risk dili |
| `kanıtlanmış`, `bilimsel olarak`, `önler`, `korur` | sağlık iddiası (sahibinin listesi) |
| `seri(n)? bozuldu`, `kaçırdın`, `geride kaldın`, `tembel` | ceza dili (İ4) |
| `doktora gitmene gerek yok`, `endişelenme`, `merak etme` | yönlendirmeyi yumuşatma |
| `%\s*\d+ (daha )?(iyi|kötü)` (sinyalde yüzde varsa hariç: `follow7`, `noticedPct7`) | uydurma yüzde |

Bekçi ayrıca: satır sayısı ve uzunluk (`kind`'a göre), eylem `ACTIONS`/`CoachCard` listesinde mi (yeni: "İyi oluş",
"Gökyüzü molası", "Dalga", "Haftalık test", "İris haritası", "Yürüyüş"), JSON dışı metin yok.

### 7.2 Yükseltme (doktor) cümleleri — sabit, kural katmanından, modelden bağımsız

Tasarım: `fixedLines(signals)` (`coachCore.js`, iki tarafta aynı) sabit satırları üretir; istemci kartı `fixed` satırları
**önce** basar, sonra modelin (ya da şablonun) satırlarını. Model istemde bu konularda **yazmaması** için uyarılır
(bugün `coachCore.js:71-72` modele yazdırıyor; v2'de "görme uyarısı hakkında hiçbir şey yazma, kart onu söylüyor").
Böylece JEV_GOZ_KOCU "kabul kriteri 6" (sabit güvenlik uyarısı) modelden bağımsız sağlanır.

| Kademe | Koşul (kural, dosya:satır) | Sabit cümle (ekrandaki ile aynı) | Nef ne yapamaz |
|---|---|---|---|
| Kırmızı | `vaAlert === 'red'` (`trend.js:219`: bir hafta boyunca her test ≥ 0,20 kötü; seyrekte son 3) | "Son bir haftadır görme ölçümlerin başlangıcına göre belirgin şekilde kötü. Lütfen bir göz doktoruna başvur." (`trend.js:258-261`; seyrek: "Son 3 ölçümün de…") | "birkaç gün daha ölç" diyemez, bekletemez, yumuşatamaz; eylem "Günlük test"ten başka şey olabilir ama cümle kalır |
| Sarı | `vaAlert === 'yellow'` (`:220`) | "Son ölçümlerin başlangıcından biraz kötü. Işık, yorgunluk ve mesafeyi kontrol edip birkaç gün daha test et; devam ederse göz doktoruna danış." (`:263-266`) | ortanca/fark yorumu ekleyemez |
| Takip, uyarı yok | `vaPhase 'tracking'`, `vaAlert null` | model ya "doğrulanmış bir değişim yok" ya iyileşme cümlesi (`coachCore.js:73`); ±0,2 cümlesi aynen | sayı yazamaz |
| İyi oluş düşük | `who5Card().low` (puan < 52, `progress.js:21`) — **yalnız telefonda** hesaplanır, `low` sunucuya gitmez | "Bu bir tanı değil. İyi oluşun bir süredir düşükse bir sağlık uzmanıyla konuşmak iyi gelebilir." (`who5.js:27`) | WHO-5 hakkında başka cümle kuramaz; kriz hattı kararı sahibinde (YAPILACAKLAR §8) |
| Belirtiler | Nef sormaz, sorgulamaz; bilgi satırı aylık kartın altında sabit | "Ani görme kaybı, perde inmesi, ışık çakması ya da ağrı: beklemeden başvur." (`ProgressOverview.jsx:385`; liste `profile.js:14-21`) | — |
| Uzun ara + uyarı | `gapDays ≥ 14` ve son bilinen `vaAlert` sarı/kırmızı | sarı/kırmızı cümle aynen + "Uyarı eskidi; bugün ölç." (VARSAYIM) | — |

Kural: sabit cümle **metin olarak** `trend.js`/`who5.js`'ten içe aktarılır (kopyalanmaz), böylece ekrandaki cümle ile
Nef'inki hiç ayrışmaz (sahibinin kuralı: ekranda yazan cümle = söylenen cümle).

### 7.3 Telefondan asla çıkmayanlar (test T8 her dönem paketini bunlara karşı tarar)

| Asla gitmez | Neden / nerede kalır |
|---|---|
| Kamera görüntüsü, bakış noktaları (`scrX/scrY`), kalibrasyon modeli | ANA_BELGE §2; TrueDepth yalnız telefonda |
| Tarih ve saat damgaları (kayıt tarihleri, `date`); yalnız "kaç gün önce", "kaç gün", "hafta no" | `coach.test.js:59` kalıbı (`/date/` yok) genişletilir: `/\d{4}-\d{2}-\d{2}|T\d{2}:\d{2}/` yok |
| Ham seriler (logMAR listesi, `rts[]`, `answers[]`, harf harf sonuçlar) | yalnız ortanca/fark/durum |
| WHO-5 puanı ve `low` | yalnız `status` ve `due`; sabit satır telefonda |
| Serbest metin (Yön yazıları, notlar) | ayrı rıza kararı; bu tasarımda hiç gitmez |
| Ad, e-posta, doğum tarihi, şehir, cihaz kimliği, hesap kimliği | `consent.js:64` son cümle; sunucu kimliksiz |
| Apple Sağlık (adım, mesafe, uyku) | `consent.js:20`; `YOL.moduller.md` §3 |
| Alarm saati, ses, erteleme sayısı | yalnız alan gün sayısında toplu (`wellbeing.days7`) |
| Konum, şehir | — |
| Profil cevapları | yalnız `coachLife` ile ve yalnız 4 özet alan (`coach.js:20-24`) |

Ek: paket boyutu `MAX_SIGNAL_BYTES` 4000 kalır; haftalık/aylık paketlerin en dolu hâli testte üretilip ölçülür (T9).

### 7.4 Rıza sürümleri

`consent.js` mantığı hazır: sürüm artınca izin vermiş kişiye yeniden sorulur, reddetmişe sorulmaz, eski izin geri
çekilmez (`:96-118`; `healthUpdate` örneği `:49-56`).

| Değişiklik | Sürüm etkisi | Gerekçe |
|---|---|---|
| Haftalık ve aylık değerlendirme (aynı veri, yeni amaç: "günlük tek içgörü" → "günlük, haftalık, aylık değerlendirme") | `coach` **1 → 2** | "Neden" satırı değişiyor (`consent.js:65`) |
| Yeni özetler: alan gün sayıları, Dalga/Gökyüzü önce→sonra, WHO-5 değişim durumu, ilerleme basamağı ve ara günleri | `coach` 2 ("Ne" satırı) | "Ne listesi buildSignals + modül coach() özetleriyle birebir tutulmalı" (`consent.js:56` yorumu); test T10 bunu dener |
| `coachLife` | değişmez (1) | aynı 4 alan |
| Sağlık (adım/uyku) Nef'e | **yapılmaz**; istenirse `health` 3 + `coach` 3, hukukçu | `consent.js:20` |
| Yön puanı/yazısı | bu sürümde yok; yazı için ayrı rıza (YAPILACAKLAR) | — |

`CONSENTS.coach` v2 taslağı (hukukçu görmedi; sahibinin metin sadeleştirme kuralına uygun kısa cümleler):

- **Başlık:** "Nef seni her gün, her hafta ve her ay değerlendirsin mi?"
- **Giriş:** "Karar senin. Kapalıyken Nef'e hiçbir veri gitmez; uygulamanın geri kalanı aynen çalışır."
- **Ne:** "Son 7 günün, geçen haftanın ve son 28 günün özetleri: her alanda kayıtlı gün sayısı (mola, su ve alarm günleri dahil); çalışma dakikası ve seri; görme ölçümü ortancası, başlangıçtan farkı ve uyarı düzeyi; okuma hızı; oyun ve pratik puanları (Nefes, Dalga ve Gökyüzü molasında önce/sonra puanları dahil); iyi oluş sorularının değişim yönü (puanın kendisi gitmez); yoldaki basamağın ve ara verdiğin gün sayısı; günün saati. Kamera görüntüsü, adın, e-postan, cihaz kimliğin, Yön yazıların ve Apple Sağlık verilerin gitmez."
- **Neden:** "Nef'in sana günlük bir öneri, haftalık ve aylık bir değerlendirme yazması (tıbbi tavsiye değildir)."
- **Nerede / Ne kadar:** bugünkü metin (`consent.js:66-67`).
- **Onay cümlesi:** "Bu özetlerin (görme ölçümü ve iyi oluş değişimi sağlığa ilişkin veridir) yukarıdaki amaçla yurt dışına aktarılmasına açık rıza veriyorum."
- `coachUpdate` (v1'e izin vermiş kişiye): "Nef'in izin metni güncellendi: haftalık ve aylık değerlendirme ile yeni özetler eklendi; bu yüzden yeniden soruyoruz. 'Şimdi değil' dersen günlük öneri eski kapsamıyla sürer, haftalık ve aylık değerlendirme açılmaz." (`healthUpdate` kalıbı `:49-56`; `recordDecline` `:114-118`).

Sürüm 2'ye "Şimdi değil" diyen kişide: `hasConsent(consents, 'coach', 1)` günlük paketi **eski kapsamla** gönderir
(yeni alanlar `buildSignals`'ta süzülür: `consentVersion` parametresi), `week`/`month` istenmez. Bu, `health` v1/v2
ayrımıyla aynı yol (`App.jsx:430-437`).

### 7.5 Sunucu tarafı (`api/coach.js`)

- `kind` izin listesi `['today','week','month']` (`:48`); başka her şey 400.
- Gövde sınırı 4000 bayt aynen (`:41`); `sanitizeSignals` her dönemi kendi şemasıyla süzer (istemci ne gönderirse
  göndersin sunucu yeniden süzer: bugünkü ilke, `coach.test.js:108-113`).
- `max_tokens`: today 220, week/month 400 (VARSAYIM). `temperature 0.4` aynen.
- Kayıt yok, `no-store` aynen. Kimlik yok. İstek sınırı: kaynak başına dakikada 10 (VARSAYIM; Vercel tarafı, ayrı iş).
- İstem `promptFor(kind)`: ortak gövde + dönem bölümü (§9).

---

## 8. Çevrimdışı / kural yedeği eşdeğerliği

### 8.1 Bugünkü açık (bulgu)

`fallbackInsight` (`coach.js:80-82`) `vaAlert` sarı ve kırmızıyı ayırmıyor; ikisinde de "birkaç gün daha ölç; sürerse
göz doktoruna görün" yazıyor. İstem ise kırmızıda "birkaç gün daha ölç" demeyi yasaklıyor (`coachCore.js:71`). Yani
çevrimdışı kişi kırmızı uyarıda çevrimiçi kişiden **daha yumuşak** bir cümle görüyor. §7.2 tasarımı (sabit satır kural
katmanından) bunu kökten kapatır: her iki yolda da cümle `trend.js:258-261`'den gelir. HATA_GUNLUGU'na girecek.

### 8.2 Eşdeğerlik kuralları

| # | Kural | Nasıl sağlanır |
|---|---|---|
| E1 | Aynı sinyal paketi | `getInsight({ kind })` önce paketi kurar, sonra yola göre modele ya da şablona verir (`coach.js:109-136` yapısı) |
| E2 | Sabit satırlar her iki yolda aynı | `fixedLines` kartta, modelden önce |
| E3 | Şablon iskeleti modelinkiyle aynı (satır sayısı, eylem listesi) | `fallbackWeek`, `fallbackMonth` `coachCore.js`'te (sunucu da test edebilsin) |
| E4 | Şablon her durumda bir şey söyler (boş kart yok) | son dal "düzen" cümlesi |
| E5 | Etiket dürüst: model → "Nef", şablon → "çevrimdışı öneri" (`CoachCard.jsx:75`); rıza yokken şablon → "yalnız bu telefonda" | — |
| E6 | Test iki yolu aynı sabit veriyle çalıştırır: eylem aynı listeden, sabit satırlar birebir, yasak kalıp yok | T11 |

### 8.3 Öneri (karar §13.1): Nef rıza olmadan da konuşsun

Bugün rıza yoksa yalnız tanıtım kartı var (`CoachCard.jsx:51-66`). Şablon Nef'in verisi telefondan çıkmaz; KVKK
açısından yeni bir işleme amacı değildir (aynı veri zaten Gelişim'de gösteriliyor). Öneri: rıza yokken kart şablon
metniyle konuşur (`source: 'local'`, etiket "yalnız bu telefonda"), altında tek satır "Nef'i yapay zekâyla aç". Böylece
sahibinin "Nef sözcümüz" isteği bütün kullanıcılar için karşılanır; model isteğe bağlı kalır.

---

## 9. İstem tasarımı (Türkçe)

Yapı: `SYSTEM_PROMPT` = ortak gövde + `MODULE_NOTES` satırları + dönem bölümü (`promptFor(kind)`). `coach.test.js:38-49`
şu ifadeleri sınıyor ve v2'de aynen kalır: `UYDURMA`, `Teşhis koyma`, "tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir";
şunlar geçmez: "bir testten diğerine", "tek testler", "tek testi".

### 9.1 Ortak gövde (v2 taslağı)

```
Sen Nefona uygulamasının koçu "Nef"sin. Kendinden söz edersen adın Nef; başka ad kullanma. Türkçe, "sen" diliyle, sıcak ama kısa konuşursun.
Görevin: sana verilen SAYILARI (kullanıcının kendi verisi; hepsi uygulamanın kural katmanında hesaplandı) okuyup istenen dönem için kısa bir değerlendirme ve tek bir somut eylem yazmak.
KESİN KURALLAR:
- Yalnızca verilen sayıları kullan; yeni sayı, yüzde, tarih ya da kişi UYDURMA. Sayı yazarsan verilenle birebir aynı olsun; ondalıkları Türkçe virgülle yaz (0,18; 0.18 değil). Kişiyi başkalarıyla karşılaştırma.
- Tıbbi iddia yok: "iyileştirir", "tedavi eder", "önler", "korur", "kanıtlanmış", "gözlükten kurtarır", "numara düşürür", "göz kaslarını güçlendirir" gibi ifadeler YASAK. Teşhis koyma; tanı, hastalık, risk, "normal/anormal", "sağlıksız" yargısı yazma.
- DEĞİŞİM KURALI: "arttı", "azaldı", "iyileşti", "geriledi", "düzeldi", "kötüleşti" ancak sana verilen bir durum alanı bunu söylüyorsa yazılır: domains.*.status "up"/"down", who5.status "up"/"down", effects[].sig true, metrics[].status "better"/"worse", vaTrend "improving". Bu alanlar yoksa ya da null ise iki sayıyı kendin karşılaştırma; yalnızca "doğrulanmış bir değişim yok" de. İki sayıyı yan yana yazabilirsin, aralarında yön çıkarımı yapamazsın.
- Görme keskinliği: vaDelta, son 7 günün ortancası ile başlangıç ortancası arasındaki farktır (logMAR; artı değer kötüleşme demektir). Görme için "ortalama" deme; "ortanca" ya da "son 7 günün ortadaki değeri" de.
- vaPhase "tracking" değilse (alışma ya da başlangıç dönemi) görme değişimi hakkında HİÇBİR şey söyleme: "değişim var", "değişim yok", "doğrulanmış", iyileşme ya da kötüleşme deme. İstersen yalnızca "başlangıç değerin oluşuyor, düzenli test et" diyebilirsin.
- vaAlert "red" ya da "yellow" ise görme hakkında HİÇBİR ŞEY yazma: uygulama doktora yönlendirme cümlesini senin metninden önce zaten gösteriyor. Onu tekrarlama, yumuşatma, "endişelenme" deme, bekletme. Eylem olarak "Günlük test" öner.
- vaPhase "tracking" ve vaAlert yoksa: vaTrend "improving" ise yalnızca "son ölçümlerin başlangıcından daha iyi; bir kısmı teste alışmaktan olabilir" de. Değilse, vaDelta kaç olursa olsun, yalnızca "doğrulanmış bir değişim yok" de; iyileşme ya da kötüleşme deme, vaDelta, vaCurrent7 ya da vaBaseline sayılarını yazma, "küçük", "yakın", "normal" ya da "aralıkta" gibi gerekçe ekleme (değişim yok denmesinin nedeni sayının küçüklüğü değil, kuralın doğrulamamasıdır). vaDelta'yı tek testlerin oynamasıyla (±0,2) karşılaştırma; ±0,2 yalnızca tek bir testin sonucu sorulursa geçerlidir: tek bir ölçüm yaklaşık ±0,2 logMAR oynayabilir; tek bir ölçümü değişim diye yorumlama.
- who5 alanı iyi oluş sorularıdır: yalnız status "up"/"down" ise "iyi oluş cevapların arttı/azaldı" diyebilirsin; "noise", "first", "none" ise iyi oluştan söz etme. Puan yazma, yorumlama, ruh sağlığı sözü etme; due true ise yalnız "iyi oluş soruları bugün" diyebilirsin.
- domains: 7 alan (eye Göz, focus Dikkat, awareness Farkındalık, calm Sakinlik, self Kendine yaklaşım, wellbeing İyi oluş, body Beden). days7/days28 o alanda kayıtlı gün sayısı; status doğrulanmış değişim; top en sık modül. Alanları yalnız düzen (kaç gün) ve doğrulanmış değişim diliyle anlat.
- effects: önce→sonra puanlı pratiklerin anlamlı etkisi (sig true, dir "up"/"down"). sig false ise etkiyi anma. Beklenti ve dinlenme etkisi ayrılamaz; "sakinlik puanın seans sonunda artıyor" de, "nefes seni sakinleştirdi" deme.
- path: yolun basamakları. day yapılan gün sayısı; modules[id].stage basamak; next sıradaki basamak {module, stage, minutes}; gapDays son yoldan bu yana gün; soft 1 ise bugün bir basamak yumuşak; unlocked bugün açılan modül. Basamağı yalnız verilen sayıyla söyle; sıradaki adımı yalnız next'ten söyle; next yoksa sıradaki adım yazma. Ara için "kaldığın yerden" de; "seri bozuldu", "kaçırdın", "geride kaldın" YASAK. later7 ≥ 3 ise soru sor, yargılama.
- Egzersizleri "konfor" ve "düzen" diliyle öner; kırpma egzersizi ekran yorgunluğunda çalışılmış, bakış hareketleri yalnızca rahatlama. Puanları ve basamağı görmeyle ilişkilendirme.
- modules alanı son 7 günün pratik özetleridir; anlamları:
  <MODULE_NOTES: her canlı modül için bir satır; manifest coachNote ile birebir>
- screenHours, sleep7, nightPhone, stress8 varsa kişinin kendi cevaplarıdır; tanı, risk ya da "kötü/iyi" yargısı yazma. Yalnızca öneriyi seçerken dikkate al (uyku puanı düşükse daha kısa, dinlendirici bir öneri; stres yüksekse nefes).
- Uygulamadaki eylemlerden birini öner: "Günlük test", "Haftalık test", "Hafif set", "Normal set", "Kırpma egzersizi", "Okuma testi", "Uzağa bakış molası", "Nefes pratiği", "Çemberler", "Yılan oyunu", "Gökyüzü molası", "Dalga", "İyi oluş soruları", "İris haritası", "Yürüyüş". Eylem adıyla başla.
```

### 9.2 Dönem bölümleri

```
[today]
Bugün için 1 içgörü ve 1 eylem yaz.
ÇIKTI: yalnızca şu JSON, başka hiçbir şey yazma:
{"lines":["en fazla 160 karakter"],"action":"en fazla 60 karakter, eylem adıyla başlar"}

[week]
Geçen hafta (week alanı: Pazartesi–Pazar) için tam 3 satır yaz:
1) düzen: week.daysActive / 7 ve week.target; met true ise hedef tutuldu de, false ise sayıyı söyle, yargı yok.
2) alan: status olan TEK alan; yoksa days7'si en yüksek alan + "doğrulanmış bir değişim yok".
3) sıradaki: path.next varsa "bu hafta <modül> <dakika> dakikaya çıkıyor"; yoksa düzeni sürdürmeye dair tek cümle.
ÇIKTI: {"lines":["≤140","≤140","≤140"],"action":"≤60"}

[month]
Son 28 gün (month alanı) için tam 4 satır yaz:
1) düzen: iris sırasıyla (Göz, Dikkat, Farkındalık, Sakinlik, Kendine yaklaşım, İyi oluş, Beden) en çok üç alan adı ve gün sayısı; canCompare true ise ilk 28 günün sayısını yanına yaz, yön çıkarma.
2) doğrulanmış değişimler: status olan her alan tek cümlede; hiç yoksa "Bu ay doğrulanmış bir değişim yok."
3) görme: yalnız vaPhase/vaTrend kuralına göre tek cümle (uyarı varsa hiçbir şey yazma; o satırı düzen cümlesiyle doldur).
4) sıradaki 28 gün: path.next ve unlocked varsa; iris.recheckDue true ise "28. gün haritana yeniden bak".
ÇIKTI: {"lines":["≤140","≤140","≤140","≤140"],"action":"≤60"}
```

Kullanıcı istemi (`buildUserPrompt`) aynen: `Kullanıcı verisi (JSON, sayılar kural katmanından):\n${JSON}\n<dönem> için değerlendirme üret.`

### 9.3 Bekçi (`parseCoachReply(text, kind)`)

`lines` dizisi; uzunluk: today 1 (≤ 240 kabul, ≤ 160 istenir), week 3, month 4; her satır ≤ 200 kabul; `action` ≤ 90;
her satır ve eylem `passesGuard`; eylem eşleşmezse (`ACTIONS` listesi) kart onu düz metin gösterir (bugünkü `static`
davranışı, `CoachCard.jsx:86`). Geri uyum: `{insight, action}` biçimi `today` için `lines: [insight]`'a çevrilir.

---

## 10. Test planı (`coach.test.js` tarzı; vitest, `app/package.json:13`)

Sabit veri: `NOW = 2026-09-28T10:00 (Pazartesi)`, `day(n)` yardımcıları; `hub`/`growthMap` gerçek fonksiyonlarla.

| # | Dosya | Test adı | Doğrular |
|---|---|---|---|
| T1 | `lib/coach.test.js` | sanitizeSignals: dönem alanları şemadan geçer, bilinmeyen düşer | `week`, `month`, `domains`, `who5`, `effects`, `path` alanları sınırlarıyla; `who5.score`, `who5.low`, `effects[].gain` düşer |
| T2 | `lib/coachPeriods.test.js` (yeni) | weekSignals geçen takvim haftasını alır, bu haftayı almaz | Pazartesi 10:00'da pencere önceki Pzt 00:00 – Paz 23:59; `daysActive`, `met`, `prevDaysActive` |
| T3 | `modules/coachStats.test.js` | coach() boş pencerede null döner (breath, snake, track dahil) | K1; mevcut `moduleSignals` beklentileri (`:22-29`) aynı veriyle aynen geçer |
| T4 | `modules/coachStats.test.js` | coach() ≤ 6 alan, tarih yok, sayı/dize | K2, K3; her canlı modül için `JSON.stringify` `/\d{4}-\d{2}-\d{2}|T\d{2}:/` içermez |
| T5 | `modules/coachStats.test.js` | ctx.progression verilince stage/days eklenir, verilmezse çıktı değişmez | K5; `coach(sessions, NOW)` ve `coach(sessions, NOW, {})` birebir eşit |
| T6 | `modules/registry.test.js` | coach() olan her canlı modülün coachNote'u var ve MODULE_NOTES ile birebir aynı | §4.4; `validateManifest` `coachNote` dize denetimi |
| T7 | `lib/coach.test.js` | moduleSignals sıralar ve 10'da keser; en az yapılan düşer | K6 |
| T8 | `lib/coachPeriods.test.js` | telefondan çıkmayanlar: en dolu paket (12 modül, profil, WHO-5 düşük, alarm, Yön yazısı, sağlık) → paket içinde tarih, ad, e-posta, puan, `low`, `rts`, `notes`, `steps` yok | §7.3 |
| T9 | `lib/coachPeriods.test.js` | en dolu week ve month paketi ≤ MAX_SIGNAL_BYTES | §7.3 son satır |
| T10 | `lib/consent.test.js` | coach sürümü 2: v1 izinli kişiye `shouldAsk` true, `hasConsent(…,'coach',1)` true kalır; "Şimdi değil" (`recordDecline`) eski izni korur, v2 alanları gitmez; `CONSENTS.coach.facts` "Ne" satırı yeni özetlerin her birini (Dalga, Gökyüzü, iyi oluş, basamak) anıyor | §7.4 |
| T11 | `lib/coachPeriods.test.js` | eşdeğerlik: aynı sinyalle `fallbackWeek/Month` ve model yolu (sahte fetch) → eylem listeden, sabit satırlar birebir, satır sayısı, yasak kalıp yok | §8.2 E6 |
| T12 | `lib/coachCore.test.js` (yeni ya da coach.test.js) | fixedLines: red → `trend.js` kırmızı cümlesi (seyrek/sık), yellow → sarı, WHO-5 low → `who5.js:27`, ikisi birden → iki satır sırayla; hiçbiri → [] | §7.2 |
| T13 | `lib/coach.test.js` | kırmızı uyarıda şablon "birkaç gün daha ölç" demez (bugünkü açık §8.1) | — |
| T14 | `lib/coach.test.js` | parseCoachReply(kind): week 3 satır ister, 2 ya da 4 → null; month 4; today eski `{insight, action}` biçimini kabul eder | §9.3 |
| T15 | `lib/coach.test.js` | FORBIDDEN v2: "seri bozuldu", "riskin yüksek", "endişelenme", "dikkat eksikliği", "kanıtlanmış" → reddedilir; "%85 isabet" (sinyalde var) → kabul | §7.1 |
| T16 | `lib/coach.test.js` | SYSTEM_PROMPT v2: eski üç kontrol aynen (`:38-49`) + "DEĞİŞİM KURALI", "seri bozuldu" yasak satırı, MODULE_NOTES'un her satırı istemde | §9 |
| T17 | `lib/coach.test.js` (api) | kind week/month → 200 (sahte upstream), `kind: 'x'` → 400, `max_tokens` dönemle değişir | §7.5 |
| T18 | `lib/coach.test.js` | getInsight önbelleği: week aynı `weekKey` + aynı sig → istek yok; sig değişince yeniden; month `monthIdx` ile aynı | §5.1 |
| T19 | `lib/coachPeriods.test.js` | periodDue: haftalık yalnız ≥ 4 gün veriyle; aylık 29., 57. günde bir kez; 28. günde değil | §5.1, §5.5 |
| T20 | `lib/coachPeriods.test.js` | monthSignals: canCompare false iken `firstDays28` yok; ≥ 35 günde var ve `growthMap('first')` ile eşit | §5.3 |
| T21 | `lib/coachPeriods.test.js` | değişim yalnız merkezden: `verifiedChange` null iken paket `status` null; şablon "doğrulanmış bir değişim yok" yazar; `up` iken alan cümlesi | §6.2 |
| T22 | `lib/coach.test.js` | ilerleme: `path.next` yokken şablon sıradaki adım cümlesi yazmaz; `soft` → "yumuşak"; `gapDays 5` → "kaldığın yerden"; hiçbirinde "kaçırdın" yok | §6.2–6.3 |
| T23 | `components/CoachCard.test.jsx` (yeni; `AlarmCard.test.jsx` kalıbı) | haller: rıza yok + şablon ("yalnız bu telefonda"), rıza var + model, çevrimdışı, sabit satır önde, haftalık satırı Pzt–Çar var Per yok, eylem eşleşmeyince düz metin | §5.1, §8.3 |
| T24 | `lib/dataHub.test.js` | dokunulmaz; yeni coach() alan modüller zaten `sessions.match` veriyor (dalga, gokyuzu) | — |

**Mevcut testler neden geçmeye devam eder**

| Test | Risk | Neden güvenli |
|---|---|---|
| `coach.test.js:19-22` `sanitizeSignals` birebir eşitlik | şemaya alan eklenmesi | `sanitizeSignals` yalnız girdide olan ve geçerli alanları yazar (`coachCore.js:54-62`); girdide yeni alan yok |
| `coach.test.js:38-49` istem kontrolleri | istem metni değişiyor | zorunlu ifadeler v2 gövdesinde aynen (§9.1), yasaklı üç kalıp yok; T16 bunu iki kez sınar |
| `coach.test.js:69-84, 86-126` today akışı ve api | kind genişliyor | `today` yolu ve cevap biçimi geri uyumlu (§9.3); 503/204/413/422 dalları aynen |
| `coachStats.test.js:19-30` birebir modül nesneleri | K1, K5 | sabit veride üç modülün de 7 günde kaydı var; `ctx` verilmiyor → alan eklenmez; quick-look nesnesi aynen |
| `coachStats.test.js:37-50` stats() | dokunulmuyor | — |
| `registry.test.js:6-9` modül listesi | yeni manifest alanı | `validateManifest` bilinmeyen alanı yok sayar; `coachNote` isteğe bağlı |
| `consent.test.js:37` `both` fikstürü | `coach` 2 | `recordConsent` varsayılan sürümü `versionOf('coach')` = 2 yazar; `hasConsent` aynı sürümle bakar |
| `today.test.js`, `dataHub.test.js`, `breath*.test.js` | — | bu belge `today.js`, `dataHub.js`, modül `today()`'lerine dokunmaz |

Bu belge yazılırken hiçbir test çalıştırılmadı ve hiçbir kod değişmedi (bakılmadı: cihaz; CİHAZDA DENENMEDİ).

---

## 11. Nereye dokunulur (dosya:satır) ve dokunulmayanlar

| Dosya | Değişiklik | Neden mevcut sistem bozulmaz |
|---|---|---|
| `lib/coachCore.js` | `SCHEMA` (`:9-34`) yeni alanlar; `sanitizePeriod`; `MODULE_NOTES`; `promptFor(kind)` (`SYSTEM_PROMPT` dışa aktarımı kalır = `promptFor('today')`); `FORBIDDEN` (`:86-95`) ekleri; `fixedLines`; `parseCoachReply(text, kind)` (`:103-118`) | eklemeler; today biçimi geri uyumlu |
| `lib/coach.js` | `moduleSignals` (`:64-76`) sıralama + `ctx`; `getInsight({ kind })`, `getTodayInsight` sarmalayıcı kalır (`:109`); `fallbackToday` v2 (kırmızı/sarı ayrımı) | imzalar korunur |
| `lib/coachPeriods.js` (yeni) | `weekSignals`, `monthSignals`, `periodDue`, `fallbackWeek`, `fallbackMonth` — yalnız `dataHub`/`progress` okur | saf, React yok |
| `api/coach.js` | `:48` kind listesi; `:66-67` max_tokens dönemle; istem `promptFor(kind)` | — |
| `modules/registry.js` | `validateManifest` `coachNote` (isteğe bağlı) | bilinmeyen alan zaten sorun değildi |
| `modules/dalga/manifest.js`, `modules/gokyuzu/manifest.js` | `coach()` + `coachNote`; öbür 7 canlı modüle `coachNote`; breath/snake/track `coach()` boşken null | K1 |
| `lib/consent.js` | `CONSENT_VERSIONS.coach = 2` (`:13`); `CONSENTS.coach` v2, `coachUpdate` | `recordDecline` mantığı hazır |
| `components/CoachCard.jsx` | `ACTIONS` (`:14-24`) yeni eşlemeler; sabit satırlar; "yalnız bu telefonda" hâli; haftalık/aylık satırı | tasarım Artifact'i sonra |
| `components/ProgressOverview.jsx` | "Nef'in değerlendirmesi" kartı (hafta/ay) `:161` bileşeninin başında | tasarım Artifact'i sonra |
| `screens/Info.jsx:26-53`, `screens/ProfileHome.jsx:181-210` | rıza metni v2 ve `coachUpdate` sorusu | — |
| `lib/releases.js` | sürüm notu maddesi (kural, ANA_BELGE §2) | — |
| **Dokunulmaz** | `lib/today.js` (buildPath, jevLine), `lib/dataHub.js`, `lib/progress.js`, `lib/trend.js`, `lib/iris.js`, `lib/storage.js`, modül `today()`'leri, `lib/health.js`, `HealthPlugin.swift` | Nef okur, yazmaz; merkez tek hesap yeri kalır |

Sıra (her adım: tasarım Artifact → onay → kod → iki temada her durum → bağımsız inceleme → cihaz):
1. `fixedLines` + kırmızı/sarı şablon düzeltmesi (bugünkü açık; küçük, bağımsız).
2. `coach()` K1 + `coachNote` + `MODULE_NOTES` + T3–T7.
3. `coachPeriods.js` + week/month şema + sunucu kind + T1, T2, T8, T9, T14–T22 (ilk sürümde yalnız şablon yolu).
4. Rıza v2 + `coachUpdate` + T10 (hukukçu metni görsün).
5. Kartlar (CoachCard, Gelişim) tasarım Artifact'i → kod → T23.
6. Model yolu week/month (sunucu) açılır; 30 soruluk sınav (JEV_GOZ_KOCU kabul kriteri 5) dönemler için tekrarlanır.
7. İlerleme katmanı (`YOL.ilerleme.md`) gelince `path.*` alanları bağlanır (T5, T22 o zaman tamamlanır).

---

## 12. Ekran halleri (tasarım Artifact'inde iki temada, 390 ve 320 px görülecek)

Bugün kartı: rıza yok + şablon · rıza yok + gizlenmiş · model · çevrimdışı · sabit satır (kırmızı) + model · sabit satır
(sarı) + şablon · WHO-5 düşük satırı · yeni modül tanıtımı · uzun ara (yumuşak) · haftalık satırı (Pzt–Çar) · aylık satırı
(3 gün) · eylem eşleşmedi (düz metin) · "Nef düşünüyor" iskeleti · 320 px'te üç satır taşmıyor.
Gelişim kartı: hafta yok (ilk 4 gün) · 1 hafta · 4 hafta sekmeli · ay yok (ilk 28 gün) · 1. ay (karşılaştırma yok) ·
2. ay (İlk/Son 28 gün) · doğrulanmış değişim var/yok · belirti satırı sabit altta.

---

## 13. Sahibinin kararını bekleyen sorular

1. Rıza olmadan kural tabanlı Nef konuşsun mu ("yalnız bu telefonda"; §8.3)? Önerim: evet.
2. Haftalık değerlendirme takvim haftası (Pzt–Paz) mı, kişinin başladığı güne göre 7'şer gün mü? Önerim: takvim haftası
   (Ana sayfadaki "Bu hafta n/hedef" ile aynı).
3. Aylık pencere 28 gün (iris ve Gelişim haritasıyla aynı) — onay.
4. Yön'ün Ayna puanı (sayı, yazı değil) Nef'e gitsin mi? Manifest "Koça gitmez" diyor (`yon/manifest.js:2`). Önerim:
   bu sürümde hayır; yazı hiçbir zaman.
5. Alarm günleri yalnız alan gün sayısında (toplu) — onay; saat/ses/erteleme hiç gitmez.
6. Aylık Nef metni "Doktoruma göster" PDF'ine girmesin (yalnız kural metni) — onay.
7. WHO-5 düşükse kriz hattı satırı (YAPILACAKLAR §8 sorusuyla aynı; hukukçu).
8. `modules` sınırı: 10 kalsın + boş modül null + sıralı kesme (önerim) mi, 12–16'ya çıksın mı?
9. Görme sayıları (`vaCurrent7`, `vaBaseline`, `vaDelta`) modele gitmeye devam etsin mi? İstem zaten yazdırmıyor; veri
   asgariliği için yalnız `vaPhase`, `vaTrend`, `vaAlert` göndermek mümkün. Önerim: yalnız üçü.
10. Model yolunun week/month için açılması 30 soruluk sınavdan (uydurma %0, doğruluk ≥ %90) sonra — onay.

---

## 14. Kaynaklar (bu oturumda PubMed'den doğrulananlar; `lib/sources.js`'te zaten var)

PubMed'den alınan bilgiye göre (get_article_metadata, 2026-09-29):

| Anahtar | Künye | PMID | DOI | Bu belgede nerede |
|---|---|---|---|---|
| joseph2023 | Joseph A, Bullimore M ve ark. 2023, Ophthalmol Ther 13(1):409-422 — tumbling E test-tekrar %95 uyum sınırı ±0,18 logMAR (122 hasta, klinikte) | 38015309 | [10.1007/s40123-023-00854-2](https://doi.org/10.1007/s40123-023-00854-2) | ±0,2 kuralı (§7.2, §9.1) |
| katibeh2022 | Katibeh M ve ark. 2022, Transl Vis Sci Technol 11(12):18 — PeekNV, 483 kişi; özette karta göre uyum sınırı −0,218/+0,235 logMAR. `sources.js:118`'deki test-tekrar sayısı (−0,19/+0,26) tam metinden; bu oturumda **doğrulanmadı** | 36583912 | [10.1167/tvst.11.12.18](https://doi.org/10.1167/tvst.11.12.18) | ±0,2 kuralı |
| han2019 | Han X ve ark. 2019, Transl Vis Sci Technol 8(4):27 — V@home yakın test-tekrar %95 sınırı −0,235/+0,199 | 31440424 | [10.1167/tvst.8.4.27](https://doi.org/10.1167/tvst.8.4.27) | ±0,2 kuralı |
| faes2021 | Faes L ve ark. 2021, Eye 35(11):3035-3040 — art arda 3 "kırmızı" = alarm; yanlış alarm %6,1 (56 hasta, 2258 test) | 33414531 | [10.1038/s41433-020-01356-2](https://doi.org/10.1038/s41433-020-01356-2) | "tek test yetmez, ardışık" (§7.2 kırmızı/sarı kuralının dayanağı, `trend.js:2`) |
| eser2019 | Eser E ve ark. 2019, Prim Health Care Res Dev 20:e100 — WHO-5 Türkçe geçerlilik (1752 kişi) | 32800004 | [10.1017/S1463423619000343](https://doi.org/10.1017/S1463423619000343) | WHO-5 durumu (§5.2, §7.2); 10 puan eşiği `progress.js:15-20` |
| kim2020 | Kim AD ve ark. 2020, Cont Lens Anterior Eye 44(3):101329 — 4 hafta kırpma egzersizi, 41 kişi, kontrolsüz | 32409236 | [10.1016/j.clae.2020.04.014](https://doi.org/10.1016/j.clae.2020.04.014) | "kırpma egzersizi ekran yorgunluğunda çalışılmış" istem satırı (§9.1) |
| wolffsohn2025 | Wolffsohn JS ve ark. 2025, Cont Lens Anterior Eye 48(5):102453 — RKÇ; 15 tekrar × 3/gün; bırakınca 2 haftada başlangıca dönüş | 40467388 | [10.1016/j.clae.2025.102453](https://doi.org/10.1016/j.clae.2025.102453) | "düzen" dilinin gerekçesi (etki sürmez → yol bitmez; iddia değil) |

Kaynağı olmayanlar (**VARSAYIM**): haftalık dönem takvim haftası ve ≥ 4 gün veri şartı; haftalık/aylık kartın 3 gün
görünmesi; aylık pencere 28 gün (merkezle uyum gerekçesi, klinik değil); `max_tokens` 400; istek sınırı; "uyarı eskidi"
satırı; yumuşak basamak 14 gün (YOL.ilerleme'den devralındı). Haftalık ya da aylık geri bildirimin bağlılığı artırdığına
dair bir kaynak bu oturumda aranmadı ve iddia edilmiyor.
