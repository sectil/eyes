# Merdivenler ve kademeli sonsuz yol: tek ilerleme sözleşmesi (yol haritası (c), 2026-09-29)

Bu belge bir PLAN ve TASARIMDIR. Depoda hiçbir dosya değişmedi; kod ancak sahibin onayından sonra, yoga yayınından
sonra yazılır (yoga-pilot/SAHIP_ISTEKLERI.md, karar 7). Sağlık iddiası yoktur. Her bilimsel dayanak PubMed kaydıyla
(PMID + DOI) verilir; kanıtı olmayan her sayı **VARSAYIM** diye yazılır. Kod göndermeleri `/home/user/eyes/app/src/`
altındaki dosyalara ve 2026-09-29 tarihli çalışma ağacına aittir. Gün benzetimi gerçek yol kodunun yoga sürümüyle
koşuldu (bkz. §6); betikler bu klasörde: `sim_merdiven.mjs`, `today_v4.js`, `sim_w3.mjs`, `sim_e.mjs`.

---

## 0. On satırda özet

1. **Tek sözleşme:** üç belge üç ayrı ilerleme sözleşmesi öneriyordu (`ctx.progression` + `progression`, `ctx.day` +
   `grow`, yoganın kendi sayaçları). Bu belge tekini seçer: `ctx.progression` ve manifestte `progression` alanı;
   `ctx.day` ve `grow` kullanılmaz (§1, §4).
2. **Seviye saklanmaz, kayıtlardan türetilir; bugün sayılmaz.** D = modülün tamamlandığı ayrı gün sayısı, bugünden
   önceki günler. Bu yüzden basamak gün içinde değişmez; yeni kullanıcının 1. günü D = 0'dır (§4.1).
3. **Merdivenler veridir:** tek dosyada (`lib/ladders.js`) `from` eşikli basamaklar ve merdiven bitince gelen
   varyantlar; testler her merdiveni sınırlarına göre denetler (§4.2).
4. **Nefes, sahibinin son sözüyle 1 → 2 → 3 dk.** Yolda en çok 3 dk'dır (yoga planının onaylı kararı 5.1); 5 dakikalık
   göz molası aynı kalır, kalan süre isteğe bağlı nefes ya da dinlenmedir (§5.1).
5. **Göz egzersizleri:** 1. gün göz kırpma, 2. gün sağ–sol, 3. gün "üçü birlikte", 4. gün yukarı–aşağı, sonra uzağa
   bakış, yakın–uzak ve daire; 9. günden sonra bugünkü beş duraklık yapı, Daire ile Yukarı–aşağı gün aşırı (§5.2).
6. **"Yüzlerce kombinasyon" dürüstçe:** güvenli zarf içinde nefes kalıbı üreteci (tutmasız 40, kısa tutmalı 99,
   bekleme dahil 629 kalıp); çeşitlilik ilgi ve süreklilik içindir, etki için değil (§4.5, §8).
7. **Güvenlik:** hızlı soluma hiç yok; tutma 21. günden önce yok ve en çok 2 sn; 42. günden sonra bekleme en çok 4 sn,
   haftada bir gün; "Zorlandım" işaretinden sonra 7 gün tutmasız; 4-7-8 kendiliğinden hiç gelmez (§4.6).
8. **Yol bütçesi:** benzetimde 30 gün ortalama 15,3 dk (en kısa 8, en uzun 18), 90 gün 15,7 dk; hiçbir gün 20 dk'yı
   aşmıyor ve yoga hiçbir durağı düşürmüyor. Yürüyüş (e) eklenince ortalama ≈ 17 dk olur (§6).
9. **Mevcut kullanıcı:** yol yapısı, ölçümler ve oyunlar aynı kalır. Görünür değişiklikler: yoldaki nefes 5 dk yerine
   3 dk ("2 dk daha" düğmesiyle), Daire ile Yukarı–aşağı gün aşırı, Bugünün görevi herkesin yolunda ve varyantlar
   haftada bir basamak açılır (§7).
10. Açık kararlar §11'dedir: nefes 1-2-3 mü, 1-1-2-2-3 mü; Yılan ile dikkat duraklarının haftalık payı; eski
    kullanıcıda Bugünün görevi; Ara kilidi kuralı ve diğerleri.

---

## 1. Kaynak belgeler: neyi devralıyorum, neyi düzeltiyorum

Bu belge `docs/yol-haritasi/tasarim/YOL.ilerleme.md`'yi temel alır (merdiven fikri, türetilmiş seviye, yumuşak dönüş,
"sonra yaparım", yol payı, 90+ gün plato, `lib/progression.js` taslağı). O belge yazıldıktan sonra verilen kararlar ve
yoga planı bazı maddelerini geçersiz kıldı. Tekrar icat etmemek için yalnız farkları yazıyorum:

| Konu | Eski yazım | Geçerli karar | Kaynak |
|---|---|---|---|
| Gün sayımı | YOL.ilerleme §3: "bugün dahil" | **Bugün sayılmaz** | YAPILACAKLAR.md:74-75 ("gün sayımı bugünü saymaz"); yoga-pilot/v3/PLAN.v3.md §B.2 kural 1 |
| E testi | YOL.ilerleme §5.11: Evre A (ilk 3 hafta her gün) / Evre B | **İlk günden haftada bir**; kısa E testi yolda yok | YAPILACAKLAR.md:55-58, uygulandı: `modules/daily/manifest.js:19-21` |
| Nefes üst sınırı | YOL.ilerleme §5.1: 1-1-2-2-3-3-4-4-5 dk, "meditasyon açıldıysa 3" | **Yolda en çok 3 dk**; 5 dk'lık nefes Ana sayfada | PLAN.v3 karar 5.1 (onaylı, yoga-pilot/SAHIP_ISTEKLERI.md "onay") |
| Meditasyon | YOL.ilerleme §5.3: 15. günde ayrı durak, sakinlik payı 3 + 3 | **Yolda ayrı meditasyon durağı yok**; yolun sesli rehberli dersi yoganın kısa dersleri | PLAN.v3 §B.1 tablosu ve karar 5.1 |
| Yoga | YOL.ilerleme §5.13: bölüm = basamak, yürüyüşle gün aşırı | **Her gün bir dersin kısa sürümü, 3. günden; sayaçlarını kendisi türetir** | PLAN.v3 §B.2 |
| Gün tablosu | YOL.ilerleme §6 (her gün "Günlük E (3)") | **Geçersiz**; yerine §6'daki benzetim | karar 1 |
| İlerleme sözleşmesi | YOL.ilerleme §11 `ctx.progression` + `progression`; YOL.moduller §2.2–2.3 `ctx.day` + `grow` | **Tek sözleşme: `ctx.progression` + `progression`** (§4) | YAPILACAKLAR.md:74 ("tek ilerleme sözleşmesi") |
| Açılma sayacı | YOL.moduller: `ctx.day` = ilk kayıttan beri takvim günü | **Kayıt bulunan ayrı gün sayısı** (`pathDay`) | Gerekçe §4.1 |
| Göz merdiveni | YOL.ilerleme §5.2: yeni `sagsol` grubu; Yukarı–aşağı Isınma+ içinde; döndürme 14. günde | **`isinma` anahtarı basamakla büyür; Yukarı–aşağı 4. günden ayrı grup (`dikey`); döndürme 9. günden** | §5.2 |
| Kod satırları | YOL.ilerleme §1: `today.js:111` ORDER, `:115` PATH, `:197` buildPath | Bugün `lib/today.js:156` ORDER, `:160` PATH, `:242` buildPath | okuma ile doğrulandı |

YOL.ilerleme'den **aynen devralınanlar** (atıfla): yumuşak dönüş (G ≥ 14 ise o gün bir basamak aşağı, §4 formülü),
atlanan günde ceza ve sıfırlama olmaması (§7), "sonra yaparım" bugünlük kaydı (`gozolcum:path-later`, §3), kilometre
taşları (§9), 90+ gün haftalık odak modülü (§8.6), göz varyantları V1–V4'ün eşikleri (§5.2), Çemberler ve Hızlı
Bakış kuralları (§5.6, §5.8), Nef'e giden sinyal adları (§10).

---

## 2. Bugünkü durum (kod)

| Ne | Nerede | Davranış |
|---|---|---|
| Yol şablonu | `lib/today.js:6-18` durak sözleşmesi, `:156` ORDER, `:160` PATH (hedef 15, üst sınır 20 dk, VARSAYIM), `:163-209` collect, `:242-362` buildPath | Duraklar manifestlerin `today(ctx)` sonucundan gelir; `ctx` olduğu gibi yayılır (`:243`). Döndürme `:255-266`, göz payı `:277-288`, 20 dk sınırı `:289-293`. `collect` bilmediği alanı düşürür (`:178-205`). |
| Ana sayfa çağrısı | `screens/Home.jsx:162` | `buildPath(registry.live, { tests, sessions, now, profile, eye, gate })`; ilerleme alanı yok. |
| Mola kilidi | `screens/Home.jsx:165-170`, `lib/eyeBudget.js:17-29` | Nefes durağı açılınca, son moladan beri ≥ 1 dk göz çalışması varsa 5 dk göz molası başlar (`restMs: 5 * MIN`). |
| Nefes durağı | `modules/breath/manifest.js:55-58`; `modules/breath/view.jsx:25`; `lib/breath.js:12-17` | Her gün 5 dk (`PROGRAM_DAY_SEC = 300`); ≥ 60 sn kayıtla tamam. İlk 3 seans kademeli hız (`RAMP_SESSIONS = 3`). |
| Nefes kalıpları | `lib/breath.js:39-135` PATTERNS, `:136` PATTERN_ORDER, `:30` LIMITS, `:14` HOLD_MAX = 7 | Sakin ritim (4·6), Eşit (5·5), Uzun veriş (2+1·5), Karın (5·7), Burun değiştir, Vızıltı, Kutu (4·4·4·4), Özel. Başlık yorumu: "4-7-8 ve hızlı soluma yok" (`:4`). Güvenlik satırları `:351-355`. "Zorlandım" işareti kayda yazılır (`screens/Breath.jsx:86, :241, :466-469`). |
| Nefes programı | `lib/breath.js:277-294` programProgress | Son 28 günde ≥ 300 sn nefes yapılan gün sayısı (Balban 2023 dozu). |
| Göz egzersizleri | `lib/routines.js:16-31` EXERCISES, `:33-65` SETS, `:71-77` PATH_GROUPS; `modules/routine/manifest.js:8-14` yerler, `:38-49` today | Her gün beş grup, her biri 1 dk: Isınma [kırp, sağ, sol], Uzağa bakış, Yakın–uzak, Daire (`dropRank: 3`), Göz kırpma. Yukarı–aşağı yalnız setlerde. Kayıt `{ type: 'routine', setId, seconds, steps }` (`screens/Routine.jsx:415`). |
| Çemberler | `modules/track/manifest.js:46-49` | Her gün 1 dk, 1. bölüm. |
| Yılan | `modules/snake/manifest.js:36-38`; seviye `lib/snake.js:34, :64-66` | Her gün, açık uçlu, `dropRank: 1`; oyun içi seviye 5 yemde bir. |
| Bugünün görevi | `modules/notice/manifest.js:30-33`; `lib/notice.js:10-24` | Yalnız bir kez yapılmışsa, final; 7 görev güne göre döner. |
| Fark Ettin mi? / Tek Bakışta | `modules/fark-ettin/manifest.js:40-45`, `modules/tek-bakis/manifest.js:42-48` | İkisi `week3` döndürmesinde; her biri son 7 günde 3 günden azsa aday; Tek Bakışta nöbet cevabıyla kapanır. |
| Hızlı Bakış | `modules/quick-look/manifest.js:41-48` | Bir kez oynandıysa, haftada 3; o gün 2. bölüm yalnız onun (R5). |
| Ölçümler | `modules/weekly/manifest.js:22-29`, `modules/reading/manifest.js:18-23`, `modules/daily/manifest.js:19-21`; `lib/today.js:102-146` | Haftalık E testi 1. gün ve son tam koşudan 7 takvim günü sonra; okuma testi 2. gün ve haftada bir (E testi günü bir gün kayar); kısa E testi yolda yok. |
| Yolda olmayanlar | `gokyuzu`, `dalga`, `yon`, `mola`, `water`, `who5`, `blink`, `alarm`, `awareness` (today yok); `breath-count` emekli (`retired: true`) | Ana sayfadan ya da bildirimden açılır. |
| Testler | `lib/today.test.js:22` DAY = 8 durak | Normal gün: Isınma, Uzağa bakış, Çemberler, Yakın–uzak, Nefes, Daire, Göz kırpma, Yılan (13 dk; `:25`). |

Kısacası bugün yol her gün aynıdır: ilk günden bütün duraklar, nefes 5 dk, göz grupları sabit; kademeli artış yok.

---

## 3. Sahibin isteği (bu konuya ait sözler)

- "Bu yol sonsuz devam eder." "Yolda kullanılan her modül Gelişim tarafından takip edilir ve kişi gelişimi verilerle
  değerlendirilir."
- "İlk gün göz hareketi, 2. gün göz + yana bak." (Önceki sözü: 1. gün kırpma, 2. gün sağ–sol, 3. gün üçü birlikte,
  4. gün yukarı–aşağı birlikte; `tasarim/SAHIP_ISTEKLERI.md` 2. madde.)
- "Nefes egzersizi ilk önce 1 dakika yapılır, sonraki gün 2, 3 gibi gider veya farklı nefes egzersizleri olur (4-2-4-4
  gibi), yüzlerce kombine olur." (Önceki sözü: 1, 1, 2 dk.)
- "Şu anki modelleri bozmayacaksın ama nefes ilk seferinde 5 dakika değil 1 dakika olur." "Arada nefes bölümü gibi
  aralar olmalı."
- "İlk 4 saniyede etkilemek gerekiyor; kullanıcıların devamlı olması lazım."

---

## 4. Tek ilerleme sözleşmesi

### 4.1 Sayaçlar (hepsi türetilir, hiçbiri saklanmaz)

```
pathDay   = yola ait herhangi bir kaydın (tests + sessions) bulunduğu ayrı yerel gün sayısı, BUGÜNDEN ÖNCE
D(m)      = m modülünün progression.match ile "yapıldı" sayılan kaydının bulunduğu ayrı gün sayısı, bugünden önce
G(m)      = m'nin son yapıldığı günden bugüne takvim günü (hiç yoksa null)
Dstage(m) = m'nin `stage` alanı taşıyan (yani (c)'den sonra yazılmış) kayıtlarının ayrı gün sayısı, bugünden önce
Dvar(m)   = min(D(m), Dstage(m) + 14)          // varyantlar için; eski kullanıcıya haftada bir basamak (§7)
```

Karar ve gerekçeler:
- **Bugün sayılmaz.** Kişi nefesi bitirdiği an basamak değişmez; kartın süresi, kaydın `stage` alanı ve ekrandaki
  metin gün boyunca aynıdır. Yeni kullanıcının 1. günü D = 0'dır. Yoga planı aynı kuralı kullanır (PLAN.v3 §B.5).
- **Açılma sayacı `pathDay`'dir, takvim günü değil.** YOL.moduller'in `ctx.day`'i ilk kayıttan beri geçen takvim
  gününü sayıyordu; 30 gün sonra dönen biri ilk dönüşünde bütün durakları birden görürdü. Kayıtlı gün sayısı, yoganın
  "kayıt bırakılan iki ayrı günden sonra" kuralıyla da aynıdır (PLAN.v3 §B.2 kural 1).
- Gün anahtarı ölçümlerde `runDayOf` (`lib/today.js:53-57`), diğer kayıtlarda yerel gün (`dayKey`); takvim farkı
  `calendarDaysBetween` (`:98`). Yeni bir tarih kuralı icat edilmez.

### 4.2 Merdiven veri olarak (`lib/ladders.js`)

Bütün merdivenler tek bir veri dosyasında durur; sahibi ve incelemeci hepsini bir yerde görür. Manifest isterse kendi
merdivenini `progression.ladder` ile verir (ör. yeni bir modül), ama varsayılan yer bu dosyadır.

```js
// lib/ladders.js — saf veri. Basamak: { from: D eşiği, ...içerik }; D ≥ from olan son basamak geçerlidir.
// Varyant: merdiven bittikten sonra Dvar ile açılan yama; sonsuzluğu varyantlar ve döndürme taşır.
export const LADDERS = {
  breath: {
    pathCapMin: 3,                                           // PLAN.v3 karar 5.1
    steps: [
      { from: 0, minutes: 1, mix: 'calm' },                  // ilk 3 seansta kademeli hız zaten var (breath.js:14)
      { from: 1, minutes: 2, mix: 'calm' },
      { from: 2, minutes: 3, mix: 'calm' },
      { from: 7, minutes: 3, mix: 'tierB' },                 // günün ritmi: tutmasız aileler
      { from: 21, minutes: 3, mix: 'tierC' },                // + kısa tutma (≤ 2 sn), Vızıltı, Burun değiştir
      { from: 42, minutes: 3, mix: 'tierD' },                // + yumuşak kutu (bekleme ≤ 4 sn), haftada bir gün
    ],
  },
  routine: {
    steps: [
      { from: 0, groups: [['kirpma', ['blink', 'rest']]] },
      { from: 1, groups: [['isinma', ['lookRight', 'lookLeft', 'rest'], 'Sağ–sol'], ['kirpma']] },
      { from: 2, groups: [['isinma', ['blink', 'lookRight', 'lookLeft']], ['kirpma']] },
      { from: 3, groups: [['isinma'], ['dikey', ['lookUp', 'lookDown', 'rest']], ['kirpma']] },
      { from: 4, groups: [['isinma'], ['uzak'], ['dikey'], ['kirpma']] },
      { from: 6, groups: [['isinma'], ['uzak'], ['yakinuzak'], ['dikey'], ['kirpma']] },
      { from: 8, groups: [['isinma'], ['uzak'], ['yakinuzak'], ['daire', null, null, 'donus'], ['dikey', null, null, 'donus'], ['kirpma']] },
    ],
    variants: [                                              // YOL.ilerleme §5.2 V1–V4 eşikleri, Dvar ile
      { from: 21, patch: { blink: { blinks: 10 } } },
      { from: 28, patch: { lookRight: { seconds: 8 }, lookLeft: { seconds: 8 }, lookUp: { seconds: 8 }, lookDown: { seconds: 8 }, farLook: { seconds: 30 } } },
      { from: 42, patch: { blink: { blinks: 15 }, nearFar: { switches: 10 }, circleCw: { laps: 3 }, circleCcw: { laps: 3 } } },
      { from: 56, weekly: 'fullSetDay' },                   // haftada bir "tam set günü" (YOL.ilerleme V4)
    ],
  },
}
export const UNLOCK = { snake: 1, notice: 1, 'fark-ettin': 5, 'tek-bakis': 7 } // pathDay eşiği, VARSAYIM
```

Testler (yeni `lib/ladders.test.js`) her merdiveni denetler: `from` artan; `minutes ≤ pathCapMin`; her adım
`EXERCISES`'te var; her grubun süresi ≤ 75 sn (yol payı 1 dk, VARSAYIM); nefes ailelerinin ürettiği her kalıp §4.6
zarfının içinde; varyantlar `blinks ≤ 15`, `laps ≤ 3`.

### 4.3 Manifest alanı ve bağlam

```
manifest.progression?: {
  match(s) → bool,            // hangi kayıt "yapıldı" sayılır (çoğunda sessions.match ile aynı; nefeste ≥ 60 sn)
  ladder?: {...},             // LADDERS[id]'yi ezer
  unlock?: { pathDay: n },    // UNLOCK[id]'yi ezer
}
ctx.progression = { pathDay, mod: { [id]: { D, G, Dstage } }, later: [...], light: false, seedDay: 'YYYY-MM-DD' }
stageOf(ctx, id) → null | { index, soft, D, Dvar, ...basamak, variant }
unlocked(ctx, id) → ctx.progression yoksa true
```

- `ctx.progression` yalnız `Home.jsx:162`'de bir kez hesaplanır (`useMemo`, bağımlılık: kayıt sayısı + gün anahtarı).
  Verilmezse her manifest bugünkü çıktısını verir; `today.test.js`, `registry.test.js`, `dataHub.test.js` değişmeden
  geçer (YOL.ilerleme §11.7'deki gerekçe aynen geçerli).
- `validateManifest` (`modules/registry.js:85`) bilinmeyen alanı reddetmez; yeni kural tek satır:
  `progression` varsa `match` fonksiyon olmalı.
- Yoga ilk yayında kendi sayaçlarıyla gelir (PLAN.v3 §B.5). (c)'de yoganın `yogaCounters` işlevi aynı anlamdaki ortak
  yardımcıyı (`doneDays`, `gapDays`) çağırır; davranış değişmez, yalnız iki tanım teke iner.
- Kayıtlar küçük alanlarla zenginleşir: egzersizde `stage`, `steps` (adım kimlikleri), `variant`; nefeste `stage`,
  `mix` (aile). Eski kayıtlar bu alanlar olmadan okunur. Gelişim ve Nef bu alanları okuyabilir; zorunlu değildir.

### 4.4 Günlük seçim kuralı

1. **Basamak:** `index = son (from ≤ D) basamağı`; `G ≥ 14` ise o gün bir basamak aşağı (`soft: true`), yarın
   kaldığı yerden (YOL.ilerleme §4). Basamak gün içinde değişmez (D bugünü saymaz).
2. **Açılma:** `pathDay ≥ UNLOCK[id]` değilse durak yok. Yeni durak yeni güne düşer; aynı güne iki yeni durak
   yığılmaz (eşikler buna göre seçildi, §6).
3. **Döndürme:** mevcut `rotate` kuralı (`lib/today.js:255-266`) aynen; yeni grup yalnız `donus` (Daire ⇄
   Yukarı–aşağı).
4. **Çeşitleme tohumu:** üreteçlerin günlük seçimi `hash(seedDay + id)` ile belirlenir. Aynı gün uygulama kaç kez
   açılırsa açılsın aynı kalıp gelir; iki cihazda da aynıdır.
5. **Kişinin seçimi üstündür:** kişi Nefes ekranında kalıp ya da süre ayarladıysa (`loadBreathOpts()` varsayılandan
   farklıysa) yol o kalıbı kullanır, üreteç devreye girmez. Merdiven yalnız varsayılanı belirler.
6. **Kayıt:** tamamlanan durak `stage` alanıyla yazılır. Yarım kalan egzersiz kayıt yazmaz (bugünkü gibi).

### 4.5 Kombinasyon üretimi ve tekrar sıkıcılığı

**Nefes: "günün ritmi" üreteci** (`lib/breathMix.js`, saf). Çıktısı `{ pattern, edits, minutes }`; Nefes ekranı bunu
bugünkü `resolveSecs` yoluyla oynatır (`lib/breath.js:201-206`; `edits` verilince kademe devre dışı kalır).

| Katman | D | Aileler (kodda var olan kalıplar) | Mikro çeşitleme (0,5 sn adım) | Kalıp sayısı |
|---|---|---|---|---|
| A | 0–6 | Sakin ritim (ilk 3 seans 3,5·4,5) | yok | 1 |
| B | 7–20 | Sakin ritim, Eşit ritim, Uzun veriş, Karın nefesi | alış 3–6 sn, veriş ≥ alış ve ≤ 8 sn, 5–7,5 nefes/dk, tutma yok | 40 süre bileşimi × 4 aile |
| C | 21–41 | + Vızıltı, Burun değiştir; alıştan sonra kısa tutma (ör. 4·2·6) | tutma 0–2 sn | 99 süre bileşimi |
| D | 42+ | + Yumuşak kutu (ör. 4·2·4·2; sahibinin 4·2·4·4'ü dakikada 4,3 nefes) | bekleme 0–4 sn, 4–7,5 nefes/dk | 629 süre bileşimi |

Sayılar bu klasördeki hesapla bulundu (alış 3–6, veriş alıştan 8'e, 0,5 sn adım). Aileler ve üç süre (1–3 dk) ile
birlikte kalıp sayısı yüzlerle ifade edilir; sahibinin "yüzlerce kombinasyon" sözü doğru, ama **kanıt kalıplar arasında
büyük fark göstermiyor** (§8): çeşitlilik ilgiyi ve sürekliliği korumak içindir, etkiyi artırmak için değil. Bu yüzden
her aile dakikada 6 nefes çevresinde tutulur ve veriş hiçbir zaman alıştan kısa değildir.

Sıkıcılık kuralları (VARSAYIM; dayanak Eather 2023'ün çeşitlilik bulgusu, §8):
- Aynı süre bileşimi iki gün art arda gelmez; aynı aile haftada en çok 3 gün (Sakin ritim hariç, o varsayılandır).
- Tutmalı gün (C, D) art arda gelmez; D katmanında bekleme günü haftada en çok 1.
- Kart kalıbı adıyla söyler ("Bugünün ritmi: 4 · 1 · 6"); ekranda "neden" satırı yoksa kanıt cümlesi aileninkidir
  (`PATTERNS[...].evidence`), yeni iddia yazılmaz.

**Göz: çeşitleme** (içerik eklemeden). Döndürme (Daire ⇄ Yukarı–aşağı), varyantlar (tekrar, saniye, tur), 28. günden
sonra haftada bir "karışık gün" (Isınma adımlarının sırası tohumla değişir; VARSAYIM), 56. günden sonra haftada bir tam
set günü. Yeni egzersiz türü bu işin kapsamında değil; eklenirse yalnız `EXERCISES` + merdiven verisi değişir.

### 4.6 Güvenlik sınırları (kural, VARSAYIM etiketleriyle)

| Kural | Değer | Dayanak |
|---|---|---|
| Hızlı soluma, döngüsel hiperventilasyon | **Hiç yok** (Balban 2023'ün hiperventilasyon kolu alınmaz) | Elia 2024: tutmadan önce hiperventilasyon daha uzun tutma ve daha düşük oksijenle bayılma yatkınlığını artırabilir (PMID 38314699) |
| Nefes hızı zarfı | 4–7,5 nefes/dk; veriş ≥ alış | Laborde 2022, Marchant 2025 (6/dk en tutarlı); alt sınır 4 VARSAYIM |
| Tutma | 21. günden önce yok; alıştan sonra ≤ 2 sn; 42. günden sonra veriş sonu bekleme ≤ 4 sn | VARSAYIM (bu sürelerde zarar kanıtı bulunamadı; kısa tutma yine de sempatik yükü artıran bir uyarandır: Badrov 2016, en uzun tutmalarda, PMID 27542408) |
| Tutmanın ön koşulu | Güvenlik kartı görülmüş (`safetySeen`, `lib/breath.js:335`) ve son 7 günde "Zorlandım" yok | `SAFETY_ROWS` (`lib/breath.js:351`: baş dönmesi, gebelik, kalp/akciğer, glokom, nöbet, panik) |
| "Zorlandım" sonrası | Ertesi gün bir basamak aşağı süre, 7 gün tutmasız | VARSAYIM; ekrandaki cümle zaten "Baş dönmesi olduysa bugün tekrar etme" (`screens/Breath.jsx:469`) |
| 4-7-8 | Kendiliğinden hiç gelmez; kişi "Özel" ile kurabilir (sınırlar izin veriyor: tutma ≤ 7, veriş ≤ 12) | Marchant 2025: 6/dk kalp ritmi değişkenliğini 4-7-8 ve kutudan fazla artırdı; kodda bugün de yok (`lib/breath.js:4`) |
| Göz: kırpma tekrarı | ≤ 15 | Wolffsohn 2025: 15 tekrar en iyi; üstü denenmedi |
| Göz: daire turu | ≤ 3; baş oynamadan | VARSAYIM; mevcut takip kuralı (`lib/routines.js:11-13`) |
| Hareket tutması öyküsü | Göz bütçesi 3 dk (bugünkü gibi) | `lib/eyeBudget.js:19` |

Gebelik, kalp ve akciğer hastalığı için PubMed'de kısa (≤ 4 sn) tutmanın zararını ya da güvenliğini gösteren bir
kayıt bulamadım; bu yüzden kural kanıta değil ihtiyata dayanır ve mevcut güvenlik kartının cümlesi aynen kalır.

### 4.7 Yol bütçesi ve "Ara"

- Yol payı: her durağın yola yazdığı en çok dakika (`pathCapMin`); Nefes 3, göz grubu 1, yoga 3 (tam ders günü 5).
  Hedef 15, üst sınır 20 dk (`lib/today.js:160`, değişmez). Düşme sırası ve yoganın `yields` kuralı aynen (PLAN.v3
  §B.5 R7b).
- **Ara (sahibin "arada nefes bölümü gibi aralar"):** iki göz bölümü arasındaki mola, yolun zorunlu arasıdır. İçi
  merdivenle dolar: 1. gün 1 dk nefes, 2. gün 2 dk, 3. günden 3 dk; molanın geri kalanı "2 dk daha nefes" düğmesi ya
  da gözler kapalı dinlenmedir. Kilit sürerken göz dışı duraklar (yoga; (e)'den sonra yürüyüş) sıradaki durak olabilir
  (R8, `lib/today.js:321-323`).
- **Ara kilidi (öneri, VARSAYIM):** bugün kilit "son moladan beri ≥ 1 dk göz çalışması" varsa başlar
  (`screens/Home.jsx:168`). Nefes 1 dk olunca 1. ve 2. günde kişi 1 dk nefesten sonra 4 dk boş bekler; ilk günlerin
  en kötü anı olur. Öneri: yol molası ancak `kullanılan + 2. bölümün göz dakikası > göz bütçesi` ise başlasın. Eski
  kullanıcıda (1. bölüm 4 dk göz) kilit her gün yine başlar; yeni kullanıcıda ilk günlerde başlamaz, çünkü toplam göz
  süresi 5 dk'yı aşmaz. Göz bütçesi kuralı (`budget` nedeni) hiç değişmez.
- **Kapanış nefesi (öneri, VARSAYIM):** yoganın yolda olmadığı günlerde (E testi günü, yoganın sığmadığı gün) Göz
  kırpma grubunun sonuna 30 sn'lik "Üç nefes" (`breathReset`, `lib/routines.js:29`) eklenir; yol her gün sakin biter.
  Grup yine 1 dk'dır (20 + 10 + 30 sn).

### 4.8 Atlanan gün, "sonra yaparım", uzun ara, hafif gün

YOL.ilerleme §7 aynen geçerlidir: ceza ve sıfırlama yok; 14 gün ve üstü aradan sonra yalnız o gün bir basamak aşağı;
"sonra yaparım" durağı bugünün sonuna kayar ve gün bitince düşer (yoga planı bu kaydı ilk yayında `lib/pathLater.js`
ile getirir; (c) aynı anahtarı `progressionCtx`'e taşır). Hafif gün kararı açıktır (§11.5).

---

## 5. Modül merdivenleri

Gösterim: D = modülün yapıldığı ayrı gün sayısı (bugün sayılmaz); pathDay = yola ait kayıt bulunan ayrı gün sayısı.
Her gün yapan yeni kullanıcıda n. günde D = pathDay = n − 1.

### 5.1 Nefes (`breath`), Ara durağı

| Basamak | D (gün) | Yolda | Kalıp | Tutma | Not |
|---|---|---|---|---|---|
| N1 | 0 (1. gün) | 1 dk | Sakin ritim, kademeli 3,5·4,5 | yok | sahibinin "ilk seferinde 1 dk"sı |
| N2 | 1 (2. gün) | 2 dk | Sakin ritim (3. seansa kadar kademeli) | yok | |
| N3 | 2–6 (3.–7. gün) | 3 dk | Sakin ritim 4·6 | yok | yol üst sınırı 3 (PLAN.v3 karar 5.1) |
| Ç-B | 7–20 | 3 dk | günün ritmi: Sakin, Eşit, Uzun veriş, Karın | yok | §4.5 |
| Ç-C | 21–41 | 3 dk | + Vızıltı, Burun değiştir; kısa tutma | ≤ 2 sn, haftada ≤ 2 gün | ön koşul §4.6 |
| Ç-D | 42+ | 3 dk | + Yumuşak kutu | bekleme ≤ 4 sn, haftada ≤ 1 gün | |
| 90+ | | Nefes odak haftası: Ara'nın tamamı (5 dk) | | | YOL.ilerleme §8.6 |

- Ana sayfadaki Nefes (1, 3, 5 dk, bütün kalıplar, Özel) ve 28 günlük program değişmez.
- **Program ile uyum:** program günü ≥ 300 sn ister (`lib/breath.js:277-294`). Yoldaki 3 dk sayılmaz; bu yüzden 3 dk
  bitince ekran "2 dk daha" düğmesi gösterir; basınca aynı kalıpla sürer ve o gün 5 dk'yı tamamlar. Mola kilidi zaten 5
  dk olduğu için kişiye ek süre maliyeti yoktur. (Öbür yol, programın yoldaki 3 dk'yı sayması, Balban 2023'ün 5 dk
  dozundan ayrılır; önermiyorum.)
- `modules/breath/view.jsx:25`: `presetSec` yoldan gelen basamakla (`stage.minutes * 60`); `ctx.progression` yoksa
  eski değer (300).

### 5.2 Göz egzersizleri (`routine`)

| Basamak | D (gün) | Yoldaki gruplar ve adımları | Yol dk | Kaynak/etiket |
|---|---|---|---|---|
| K1 | 0 (1. gün) | Göz kırpma [kırp, kapat] | 1 | Kim 2020, Wolffsohn 2025 (kırpma, kanıtı en güçlü adım) |
| K2 | 1 (2. gün) | **Sağ–sol** [sağa bak, sola bak, kapat] · Göz kırpma | 2 | sahibinin "göz + yana bak"ı; rahatlama hareketi, kanıt yok |
| K3 | 2 (3. gün) | Isınma [kırp, sağa, sola] ("üçü birlikte") · Göz kırpma | 2 | = bugünkü Isınma |
| K4 | 3 (4. gün) | Isınma · **Yukarı–aşağı** [yukarı, aşağı, kapat] · Göz kırpma | 3 | sahibinin 4. günü; yeni grup `dikey` |
| K5 | 4–5 | + **Uzağa bakış** [uzağa bak, kapat] | 4 | Talens-Estarelles 2022 (20-20-20 hatırlatması) |
| K6 | 6–7 | + **Yakın–uzak** [yakın–uzak, uzağa bak] | 5 | konfor; kanıt karışık |
| K7 | 8+ | + **Daire**; Daire ⇄ Yukarı–aşağı gün aşırı (`donus`) | 5 | bugünkü beş duraklık yapı |
| V1 | Dvar 21+ | kırpma 5 → 10 tekrar | 5 | Wolffsohn 2025 |
| V2 | Dvar 28+ | bakış adımları 5 → 8 sn, uzağa bakış 20 → 30 sn; haftada bir karışık gün | 5 | VARSAYIM |
| V3 | Dvar 42+ | kırpma 15 tekrar, yakın–uzak 10 geçiş, daire 3 tur | 5 | Wolffsohn 2025 (tekrar); diğerleri VARSAYIM |
| V4 | Dvar 56+ | haftada bir tam set günü (yalnız o gün) | 5 | YOL.ilerleme V4, VARSAYIM |

Tasarım notları:
- `isinma` anahtarı basamakla büyür (K2 başlığı "Sağ–sol", K3'ten "Isınma"); yeni `sagsol` kimliği gerekmez, Gelişim ve
  kayıt eşlemesi (`findRoutine`, `lib/routines.js:80`) değişmez. Tek yeni grup `dikey`'dir (`PATH_GROUPS`'a eklenir,
  `order: 70`, `rotate: 'donus'`).
- Grupların yerleri bugünküyle aynıdır: Isınma 1. bölümün başı, Uzağa bakış ve Yakın–uzak 1. bölüm, Daire/Yukarı–aşağı
  ve Göz kırpma 2. bölüm (`modules/routine/manifest.js:8-14`).
- K2–K4 sahibinin dizisini birebir izler; merdiven yalnız 9. günde bugünkü yapıya ulaşır. Bu, ilk günleri kısa tutar
  (1. gün yol 8 dk) ve her güne bir "yeni" bırakır.
- Adım ekranı (`screens/Routine.jsx`) grubun adımlarını `stage.steps` gelirse ondan, gelmezse grubun kendisinden alır;
  varyant `EXERCISES`'in üstüne yama olarak geçer, `EXERCISES` değişmez.
- 75 sn'yi aşan grup yoktur (V3 kırpma 15 × 4 sn + 10 sn = 70 sn; cihazda ölçülecek).

### 5.3 Çemberler (`track`)

1. günden her gün 1 dk; merdiven yok, oyunun kendi seviyesi ve kipi kayıtta (`s.level`, `s.mode`). 7. günden sonra
TrueDepth varsa kart bir kez "gözle oyna" önerir (YOL.ilerleme §5.6). 30+: değişmez; Nef rekor ve varış süresi
özetini zaten alır (`modules/track/manifest.js:50-55`).

### 5.4 Yılan (`snake`)

Açılma pathDay ≥ 1 (2. gün). Açık uçlu, `dropRank: 1`, oyun içi seviye (`lib/snake.js:64`). 30+: değişmez.
**Bulgu:** 2. bölümün göz payı 4 dk'dır; Fark Ettin mi? ya da Tek Bakışta (2 dk) yoldayken Yılan düşer. Bu bugünkü
kodun davranışıdır (`lib/today.test.js:66-80`); benzetimde yeni kullanıcı 90 günün yalnız 24'ünde yolda Yılan görür.
Seçenek §11.2'de.

### 5.5 Bugünün görevi (`notice`)

Açılma pathDay ≥ 1 ("bir kez yapıldıysa" kuralının yerine; `modules/notice/manifest.js:31`). Final, `dropRank: 2`.
Büyüme YOL.moduller §4.7'deki katmanlarla (içerik: 7 görev → 21; ayrı iş). 30+: katman 2–3 görevleri.

### 5.6 Fark Ettin mi? ve Tek Bakışta

Fark Ettin mi? pathDay ≥ 5, Tek Bakışta pathDay ≥ 7 (YOL.ilerleme §5.8). Bundan sonra bugünkü kural aynen: `week3`
döndürmesi, her biri haftada 3 gün, nöbet kapısı. Merdiven yok; zorluk oyunların kendi uyarlamasındadır.

### 5.7 Hızlı Bakış

Bugünkü kural aynen (bir kez oynandıysa, haftada 3, R5). pathDay ≥ 10 olunca Nef bir kez tanıtır (YOL.ilerleme §5.8).

### 5.8 Ölçümler

Haftalık E testi (1. gün ve haftada bir), okuma testi (2. gün ve haftada bir, E testi gününden bir gün kayar) ve kısa E
testinin yolda olmaması **aynen kalır**; merdiven yok. Ölçüm günleri yolun en uzun günleridir (17–18 dk, §6).

### 5.9 Yoga

PLAN.v3 §B.2'deki kural aynen: 3. günden, her gün bir dersin kısa sürümü (3 dk), yaklaşık 8 günde bir 5 dk'lık tam
ders, E testi günü yok, hiçbir durağı düşürmez. (c) yalnız sayaç yardımcısını ortaklaştırır.

### 5.10 Yolda olmayan modüller

| Modül | Karar | Neden |
|---|---|---|
| Gökyüzü molası (`gokyuzu`) | (c)'de yolda değil; (e) ile, yürüyüşle birlikte karara bağlanır | İki belge farklı kural yazıyor: YOL.ilerleme §5.5 (4. günden, Uzağa bakış ile gün aşırı), YOL.moduller §4.8 (5. günden, haftada 2, 07.00–20.00, yürüyüşle `disari`). Öneri: YOL.moduller kuralı; yürüyüş gelince aynı döndürme grubu |
| Dalga, Yön, Mola, Su, Alarm, Farkındalık merkezi | Yolda yok, merdiven yok | Kendi girişleri var (Ana sayfa, bildirim, akşam kartı) |
| İyi oluş (WHO-5) | Kilometre taşı (14 günde bir), yolun dışında | YOL.ilerleme §9 |
| Göz kırpma modülü (`blink`) | Yolda yok; yoldaki kırpma `routine` grubudur | çift sayım olmasın |
| Nefes sayma | Emekli | `retired: true` |

---

## 6. Gün gün 1–30 (yeni kullanıcı, her gün 10.00'da açar, her durağı yapar, 5 dk göz bütçesi)

Benzetim, yoga planının benzeticisinin kopyasıdır (`yoga-pilot/v3/v3fix2/yolsim_c_v4.mjs`); yol kuralları gerçek
koddan (`lib/today.js` + yoganın beş eki, `today_v4.js`), haftalık E testi ve okuma testi gerçek manifestlerden gelir.
Merdivenler §5'teki tablolardan sahte manifestlerle kuruldu. Yumuşak dönüş ve hafif gün benzetimde yoktur. **Cihazda
denenmedi.** "Ara" sütunu Nefes durağıdır. 2. günün "Isınma"sı K2 basamağında "Sağ–sol" başlığıyla görünür.

| Gün | pathDay | 1. bölüm | Ara | 2. bölüm | Final | Yol dk | Düşen |
|---|---|---|---|---|---|---|---|
| 1 | 0 | Haftalık E testi 5 · Çemberler 1 | Nefes 1 | Göz kırpma 1 | — | 8 | — |
| 2 | 1 | Sağ–sol 1 · Çemberler 1 | Nefes 2 | Okuma 3 · Göz kırpma 1 · Yılan 2 | Bugünün görevi 1 | 11 | — |
| 3 | 2 | Isınma 1 · Çemberler 1 | Nefes 3 | Göz kırpma 1 · Yılan 2 · Yoga 3 (Nefesin Ritmi) | Bugünün görevi 1 | 12 | — |
| 4 | 3 | Isınma 1 · Çemberler 1 | Nefes 3 | Yukarı–aşağı 1 · Göz kırpma 1 · Yılan 2 · Yoga 3 (Tek Nokta) | Bugünün görevi 1 | 13 | — |
| 5 | 4 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 | Nefes 3 | Yukarı–aşağı 1 · Göz kırpma 1 · Yılan 2 · Yoga 3 (Zor Anlar İçin) | Bugünün görevi 1 | 14 | — |
| 6 | 5 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 | Nefes 3 | Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Yoga 3 (Sabah Niyeti) | Bugünün görevi 1 | 14 | Yılan |
| 7 | 6 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Yoga 3 (Sağlam Yer) | Bugünün görevi 1 | 15 | Yılan |
| 8 | 7 | Isınma 1 · Haftalık E testi 5 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yukarı–aşağı 1 · Göz kırpma 1 · Tek Bakışta 2 | Bugünün görevi 1 | 17 | Yılan |
| 9 | 8 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Okuma 3 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Kendini Tanımak) | Bugünün görevi 1 | 18 | Yılan |
| 10 | 9 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Daire 1 · Göz kırpma 1 · Yoga 5 (Derin Dinlenme) | Bugünün görevi 1 | 17 | Yılan |
| 11 | 10 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Gelecekteki Sen) | Bugünün görevi 1 | 15 | Yılan |
| 12 | 11 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Yılan 2 · Yoga 3 (Nefesin Ritmi) | Bugünün görevi 1 | 15 | — |
| 13 | 12 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yukarı–aşağı 1 · Göz kırpma 1 · Yılan 2 · Yoga 3 (Tek Nokta) | Bugünün görevi 1 | 15 | — |
| 14 | 13 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Yoga 3 (Zor Anlar İçin) | Bugünün görevi 1 | 15 | Yılan |
| 15 | 14 | Isınma 1 · Haftalık E testi 5 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 | Bugünün görevi 1 | 17 | Yılan |
| 16 | 15 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yukarı–aşağı 1 · Okuma 3 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Sabah Niyeti) | Bugünün görevi 1 | 18 | Yılan |
| 17 | 16 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Sağlam Yer) | Bugünün görevi 1 | 15 | Yılan |
| 18 | 17 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Daire 1 · Göz kırpma 1 · Yoga 5 (Kendine Şefkat) | Bugünün görevi 1 | 17 | Yılan |
| 19 | 18 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Kendini Tanımak) | Bugünün görevi 1 | 15 | Yılan |
| 20 | 19 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Yılan 2 · Yoga 3 (Gelecekteki Sen) | Bugünün görevi 1 | 15 | — |
| 21 | 20 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yukarı–aşağı 1 · Göz kırpma 1 · Yılan 2 · Yoga 3 (Nefesin Ritmi) | Bugünün görevi 1 | 15 | — |
| 22 | 21 | Isınma 1 · Haftalık E testi 5 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 | Bugünün görevi 1 | 17 | Yılan |
| 23 | 22 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Yukarı–aşağı 1 · Okuma 3 · Göz kırpma 1 · Yoga 3 (Tek Nokta) | Bugünün görevi 1 | 18 | Yılan |
| 24 | 23 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yukarı–aşağı 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Zor Anlar İçin) | Bugünün görevi 1 | 15 | Yılan |
| 25 | 24 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Sabah Niyeti) | Bugünün görevi 1 | 15 | Yılan |
| 26 | 25 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Daire 1 · Göz kırpma 1 · Yoga 5 (Derin Dinlenme) | Bugünün görevi 1 | 17 | Yılan |
| 27 | 26 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga 3 (Sağlam Yer) | Bugünün görevi 1 | 15 | Yılan |
| 28 | 27 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Daire 1 · Göz kırpma 1 · Yılan 2 · Yoga 3 (Kendini Tanımak) | Bugünün görevi 1 | 15 | — |
| 29 | 28 | Isınma 1 · Haftalık E testi 5 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yukarı–aşağı 1 · Göz kırpma 1 · Yılan 2 | Bugünün görevi 1 | 17 | — |
| 30 | 29 | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Fark Ettin mi? 2 · Yukarı–aşağı 1 · Okuma 3 · Göz kırpma 1 · Yoga 3 (Gelecekteki Sen) | Bugünün görevi 1 | 18 | Yılan |

Varyantlar tabloda görünmez, çünkü süreyi değiştirmezler: 22. günden (D = 21) kırpma 10 tekrar; 29. günden bakışlar 8
sn ve uzağa bakış 30 sn; 43. günden V3; 57. günden haftada bir tam set günü. Nefeste 8. günden "günün ritmi", 22.
günden kısa tutmalı günler, 43. günden bekleme günleri.

**Özet (benzetim çıktısı):**

| Senaryo | Gün | En kısa | En uzun | Ortalama | > 20 dk | Yoga günü | Yoga yüzünden düşen |
|---|---|---|---|---|---|---|---|
| 5 dk göz bütçesi, 10.00 | 30 | 8 | 18 | 15,3 | 0 | 24 | 0 |
| 5 dk göz bütçesi, 10.00 | 90 | 8 | 18 | 15,7 | 0 | 76 | 0 |
| 5 dk göz bütçesi, 19.00 | 90 | 8 | 18 | 15,7 | 0 | 76 | 0 |
| 3 dk göz bütçesi | 30 / 90 | 8 | 15 / 16 | 12,7 / 12,9 | 0 | 24 / 76 | 0 |
| Yogasız (karşılaştırma) | 30 / 90 | 8 | 17 | 12,7 / 12,9 | 0 | — | — |
| Nefes 1-1-2-2-3 (seçenek) | 30 | 8 | 18 | 15,2 | 0 | 24 | 0 |
| (e) sonrası tahmin: + yürüyüş 2 dk (4. günden) | 30 / 90 | 8 | 20 | 17,1 / 17,6 | 0 | 24 / 76 | 0 |

Yorum: yoga planının (c) benzetimi 30 günde 17,0 dk buluyordu (PLAN.v3 §B.3); fark, o benzetimin yürüyüşü ve gökyüzünü
de içermesidir. (e) geldiğinde yürüyüşü Ara'nın içine (kilit sürerken, göz dışı) koymak duvar saatindeki süreyi
kısaltır, ama yol payında yine 2 dk'dır; bu karar (e)'nin işidir. 13.–28. günler atlanınca 29. gün E testi ve okuma
birlikte gelir, yol 20 dk olur, Yılan ve yoga o gün düşer; ertesi gün yol 15 dk'ya döner (benzetimde görüldü).

---

## 7. Geçiş: "şu anki modelleri bozmadan" mevcut kullanıcı ne görür

Sayaçlar kayıtlardan türediği için göç betiği yoktur; eski kullanıcı ilk açılışta merdivenin üstündedir. Varyantlar
ise `Dvar = min(D, Dstage + 14)` ile haftada bir basamak açılır; aylardır egzersiz yapan biri güncellemenin ertesi günü
15 tekrarlık kırpmayla karşılaşmaz.

| Ne | Bugün | (c) sonrası, eski kullanıcı | Neden |
|---|---|---|---|
| Durak yapısı, bölümler, ölçümler, oyunlar | 8–9 durak, iki bölüm, haftalık E, okuma | Aynı | `buildPath`, `PATH`, `ORDER`, R1–R8 değişmez |
| Nefes (Ara) | 5 dk yönlendirilen nefes | 3 dk + "2 dk daha" düğmesi; mola kilidi yine 5 dk | PLAN.v3 karar 5.1; program günü düğmeyle tamamlanır |
| Nefes kalıbı | Kişinin seçtiği ya da Sakin ritim | Kişi kalıp seçtiyse aynı; varsayılandaysa "günün ritmi" | §4.4 kural 5 |
| Göz grupları | Beş grup her gün | Beş durak; Daire ile Yukarı–aşağı gün aşırı | tek yeni içerik: `dikey` |
| Varyantlar | yok | İlk hafta yok; sonra haftada bir basamak (V1 → V4) | `Dvar` |
| Bugünün görevi | Yalnız denediysen | Herkesin yolunda, final (1 dk) | açılma pathDay ≥ 1; §11.3'te seçenek |
| Kapanış nefesi | yok | Yoganın olmadığı günlerde Göz kırpma'nın sonunda 30 sn | §4.7; §11.7'de seçenek |
| Ara kilidi | ≥ 1 dk göz çalışmasında 5 dk | Eski kullanıcıda her gün yine başlar | kural yalnız yeni kullanıcının ilk günlerini etkiler |
| Veri | — | Yeni kayıtlarda `stage`, `steps`, `variant`, `mix` alanları | eski kayıtlar aynen okunur |

Testler: `lib/today.test.js` (DAY ve 33 senaryo), `modules/registry.test.js`, `lib/dataHub.test.js`,
`lib/breath.test.js` ilerleme bağlamı vermediği için değişmeden geçmelidir; kod adımında ilk iş budur. Yeni testler:
`lib/progression.test.js` (sayaçlar, bugün sayılmaz, yumuşak dönüş, açılma, `Dvar`), `lib/ladders.test.js` (§4.2
sınırları), `lib/breathMix.test.js` (zarf, art arda tekrar yok, tutma ön koşulları, belirlenimcilik), `today.test.js`'e
"ilerleme açık" bloğu (§6'nın 1., 2., 4., 8., 9. günleri ve 29. gün uzun dönüş).

---

## 8. Kanıt (PubMed ile doğrulandı, 2026-09-29)

PubMed kayıtlarına göre:

| Kullanıldığı yer | Kaynak | Ne diyor, sınırıyla |
|---|---|---|
| Nefesin yeri ve 6/dk zarfı | Laborde 2022, Neurosci Biobehav Rev, PMID 35623448, [DOI](https://doi.org/10.1016/j.neubiorev.2022.104711) | Sistematik derleme ve meta-analiz, 223 çalışma: gönüllü yavaş nefes sırasında, tek seanstan hemen sonra ve çok seanslı programdan sonra vagal kalp ritmi değişkenliği arttı. Özette etki büyüklüğü verilmiyor. |
| Etkinin büyüklüğü (dürüst çerçeve) | Fincham 2023, Sci Rep, PMID 36624160, [DOI](https://doi.org/10.1038/s41598-022-27247-y) | RKÇ meta-analizi: stres 12 çalışma, 785 yetişkin, g = −0,35 (%95 GA −0,55 ile −0,14), I² = %42; kaygı g = −0,32, depresif belirti g = −0,40. Çoğu çalışmada orta yanlılık riski; yazarlar "abartı ile kanıt arasında uyumsuzluk" uyarısı yapıyor. Küçük–orta etki. |
| Uzun veriş, 5 dk hedefin Ana sayfada kalması | Balban 2023, Cell Rep Med, PMID 36630953, [DOI](https://doi.org/10.1016/j.xcrm.2022.100895) | Uzaktan RKÇ, günde 5 dk, 1 ay: uzun verişli döngüsel iç çekme, farkındalık meditasyonuna göre ruh hâlinde daha çok iyileşme ve solunum hızında daha çok düşüş. Karşılaştırma aktif bir kontrolle; hiperventilasyon kolu bu uygulamada kullanılmaz. |
| Veriş ≥ alış kuralı (lehine) | Van Diest 2014, Appl Psychophysiol Biofeedback, PMID 25156003, [DOI](https://doi.org/10.1007/s10484-014-9253-x) | 30 kişi, laboratuvar: düşük alış/veriş oranı (uzun veriş) daha çok gevşeme ve 6/dk'da daha çok yüksek frekans gücü. Tek seans, küçük örneklem. |
| Veriş ≥ alış kuralı (aleyhine, tekrarlanamama) | Birdee 2023, Complement Ther Med, PMID 36871835, [DOI](https://doi.org/10.1016/j.ctim.2023.102937) | RKÇ, 100 sağlıklı yetişkin, 12 hafta: yavaş nefes kaygıyı düşürdü, kalp ritmi değişkenliğini değiştirmedi; uzun veriş ile eşit oran arasındaki fark küçük (d ≈ 0,2) ve anlamlı değil. Bu yüzden uzun veriş "daha iyi" diye sunulmaz; yalnız zarfın bir kuralıdır. |
| Kutu ve 4-7-8'in kendiliğinden gelmemesi | Marchant 2025, Appl Psychophysiol Biofeedback, PMID 39864026, [DOI](https://doi.org/10.1007/s10484-025-09688-z) | 84 üniversite öğrencisi, tek oturum: 6/dk (4:6 ve 5:5) kalp ritmi değişkenliğini kutu ve 4-7-8'den daha çok artırdı (küçük–orta etki); hiçbir kalıp tansiyonu ya da ruh hâlini anlamlı değiştirmedi; 6/dk hafif fazla solumaya yol açtı (baş dönmesi uyarısının gerekçesi). |
| 4-7-8'in anlık etkisi | Vierra 2022, Physiol Rep, PMID 35822447, [DOI](https://doi.org/10.14814/phy2.15389) | 43 sağlıklı genç yetişkin, öncesi–sonrası (nefes için kontrol koşulu yok): 4-7-8 sonrası kalp hızı ve sistolik tansiyon düştü. Zayıf tasarım; öneri gerekçesi değil. |
| 1 dk'dan başlama, ilk seanslarda kademe | You 2021, Int J Environ Res Public Health, PMID 34203020, [DOI](https://doi.org/10.3390/ijerph18126630) | 61 kişi, 5 dk yavaş nefes: vagal etkinlik arttı, ama algılanan stres ve uyarılmışlık da arttı; yazarlar nefes darlığını ve alışma gereğini gösteriyor. Kısa başlangıcın dayanağı. |
| Hızlı soluma + tutma yasağı | Elia 2024, Am J Physiol Regul Integr Comp Physiol, PMID 38314699, [DOI](https://doi.org/10.1152/ajpregu.00260.2023) | 9 dalgıç olmayan kişi, açken en uzun tutmalar: öncesinde 30 sn hiperventilasyon tutmayı uzattı, oksijeni düşürdü ve bayılma yatkınlığını artırabilir. Uç doz; kısa tutmaya doğrudan aktarılmaz. |
| Tutmada ihtiyat | Badrov 2016, Am J Physiol Heart Circ Physiol, PMID 27542408, [DOI](https://doi.org/10.1152/ajpheart.00334.2016) | Genç, yaşlı ve koroner hastalığı olan 42 kişide en uzun tutmalar kas sempatik sinir etkinliğini artırdı; hastalıkta örüntü farklı. Yalnız fizyolojik gerekçe; 2–4 sn tutma için risk kanıtı değil. |
| Göz egzersizlerinde konfor dili | Singh 2022, Ophthalmology, PMID 35597519, [DOI](https://doi.org/10.1016/j.ophtha.2022.05.009) | 45 RKÇ, 4497 kişi: ekran kaynaklı göz yorgunluğu için incelenen tedavilerin hiçbirinde yüksek kesinlikte kanıt yok (özette sayılanlar: çok odaklı ve mavi ışık gözlükleri, meyve özü, omega-3, karotenoid). Göz hareketi egzersizleri özette yer almıyor; bu yüzden etkileri için iddia yok. |
| Kırpma 1. gün, tekrar varyantları | Kim 2020, Cont Lens Anterior Eye, PMID 32409236, [DOI](https://doi.org/10.1016/j.clae.2020.04.014) | 54 kişi (41 tamamladı), kontrol grubu yok: 4 hafta, 20 dk'da bir 10 sn kırpma; yakınma ve yarım kırpma oranı azaldı. |
| Kırpma 10 → 15 tekrar | Wolffsohn 2025, Cont Lens Anterior Eye, PMID 40467388, [DOI](https://doi.org/10.1016/j.clae.2025.102453) | RKÇ, 98 + 28 kişi: kapat-sık-aç 15 tekrar × günde 3 en iyi; bıraktıktan 2 hafta sonra ölçülerin çoğu başlangıca döndü (yolun sonsuz olmasının gerekçesi). |
| Uzağa bakış | Talens-Estarelles 2022, Cont Lens Anterior Eye, PMID 35963776, [DOI](https://doi.org/10.1016/j.clae.2022.101744) | 29 kişi, 2 hafta 20-20-20 hatırlatması: yakınmalar azaldı, bırakınca bir haftada sürmedi; iki göz ölçülerinde uyum esnekliği dışında değişim yok. |
| Göz hareketi eğitimi (dolaylı, zayıf) | Zhong 2026, Front Neurosci, PMID 42516552, [DOI](https://doi.org/10.3389/fnins.2026.1878323) | RKÇ, 200 öğrenci, 12 hafta çok bileşenli spor görme eğitimi: bildirilen yakınmalar azaldı. Göz hareketlerinin payı ayrılamıyor, sonuçlar kişinin beyanı; yalnız "incelenmekte" çerçevesi. |
| Kullanılmayan kaynak | Sadhwani 2024, Cureus, PMID 39185289, [DOI](https://doi.org/10.7759/cureus.67653) | 38 kişilik denemede kırpma egzersiziyle kırma kusurunun düzeldiği bildiriliyor; beklenmedik ve küçük bir çalışma. Hiçbir metne dayanak yapılmaz. |
| Çeşitlilik, sıkıcılık | Eather 2023, J Sport Exerc Psychol, PMID 37169353, [DOI](https://doi.org/10.1123/jsep.2020-0355) | 28 çalışmalık sistematik derleme: fiziksel etkinlikte çeşitlilik sunmak ve algılamak katılım, motivasyon, keyif ve programa bağlılıkla ilişkili; deneysel çalışma az. |
| Kısa ve düzenli başlangıç | Kaushal & Rhodes 2015, J Behav Med, PMID 25851609, [DOI](https://doi.org/10.1007/s10865-015-9640-7) | 111 yeni spor salonu üyesi, 12 hafta: haftada ≥ 4 kez, 6 hafta; tutarlılık, düşük karmaşıklık, ortam ve keyif alışkanlığı yordadı. |

Lally 2010 (bir günü kaçırmak alışkanlığı bozmadı) PubMed'de yok; YOL.ilerleme §7'deki doğrulamaya atıf yapıyorum.
Gebelikte ve kalp/akciğer hastalığında kısa tutma üzerine PubMed'de doğrudan kayıt bulamadım (§4.6).

**VARSAYIM listesi:** açılma eşikleri (Yılan 1, görev 1, Fark Ettin mi? 5, Tek Bakışta 7); nefes basamak günleri ve
katman günleri (7, 21, 42); nefes zarfının alt sınırı 4/dk; tutma süreleri ve haftalık sıklıkları; "Zorlandım" sonrası 7
gün; göz merdiveninin gün eşikleri ve V2–V4; `Dvar` hızı (haftada bir basamak); gruplarda 75 sn sınırı; Ara kilidi
kuralı; kapanış nefesi; sıkıcılık kuralları; karışık gün.

---

## 9. Gizlilik ve güvenlik

- Bütün hesap telefonda, kayıtlardan yapılır; yeni bir kişisel veri toplanmaz. Kamera görüntüsü yine telefondan çıkmaz;
  TrueDepth takibi bugünkü gibi yalnız sayı üretir.
- Kayıtlara eklenen alanlar (`stage`, `steps`, `variant`, `mix`) yereldir; dışa aktarma bu alanları yok sayabilir.
  "Tüm verileri sil" bunları `sessions` ile birlikte siler; bugünlük `gozolcum:path-later` anahtarı `storageKeys`'e girer
  (YOL.ilerleme §3).
- Nef'e yalnız açık rızayla ve yalnız sayı gider: `pathDay`, modül başına basamak numarası, `gapDays`, `later7`
  (YOL.ilerleme §10, YOL.nef). Kalıp adı ya da güvenlik işaretleri ("Zorlandım") gitmez.
- Sağlık güvenliği: §4.6. Ekranda yeni sağlık iddiası yazılmaz; basamak rozeti yalnız "3. gün · 2 dk" gibi sayı söyler.

---

## 10. Uygulanabilirlik ve iş büyüklüğü

Sıra: yoga yayınından sonra (iki iş `lib/today.js`'e dokunur; karar 7). Her adım ayrı onay, test ve TestFlight.

| Adım | Dosyalar | Büyüklük (tahmin) |
|---|---|---|
| 1. Motor | `lib/progression.js` (sayaçlar, `stageOf`, `unlocked`, `Dvar`), `lib/ladders.js`, testleri; `screens/Home.jsx:162` bağlam; `modules/registry.js:85` tek kural; yoga sayaçlarının ortak yardımcıya geçmesi | ≈ 250 satır kod, ≈ 300 satır test |
| 2. Nefes | `lib/breathMix.js` + test; `modules/breath/manifest.js` ve `view.jsx` (basamak süresi, üreteç, kişinin seçimi); `screens/Breath.jsx` ("2 dk daha", tutma ön koşulu) | ≈ 200 kod, ≈ 200 test |
| 3. Göz | `lib/routines.js` (`dikey` grubu, varyant yaması); `modules/routine/manifest.js` (basamak grupları, döndürme); `screens/Routine.jsx:415` (kayıtta `stage`, adım listesi) | ≈ 150 kod, ≈ 150 test |
| 4. Açılma ve ekran | snake, notice, fark-ettin, tek-bakis manifestlerinde `unlocked`; `components/TodayPath.jsx` basamak rozeti; Ara kilidi kuralı (`Home.jsx:165-170`) | ≈ 100 kod, ≈ 100 test |
| 5. Nef ve Gelişim | `coachCore.js` SCHEMA'ya sayı alanları; Gelişim'de "basamak" satırı | küçük; YOL.nef ile |
| Cihaz | 1., 2., 4., 9. gün, uzun dönüş, eski hesap; iki tema, 320 px | 1–2 gün cihaz denemesi |

Toplam: orta büyüklükte bir iş (≈ 12 dosya, ≈ 700 satır kod, ≈ 750 satır test). En riskli parçalar: Ara kilidi
kuralının cihazdaki hissi, V3 kırpma grubunun gerçek süresi ve eski hesabın ilk açılışı.

---

## 11. Açık kararlar (sahibine)

1. **Nefes merdiveni:** son sözün 1 → 2 → 3 dk (öneri) mi, önceki sözün 1 → 1 → 2 → 2 → 3 mü? Benzetimde yol farkı
   0,1 dk; You 2021 kısa başlangıcı destekliyor, ikisi de 1 dk'dan başlıyor.
2. **Yılan ile dikkat durakları:** bugünkü kuralda Fark Ettin mi? ve Tek Bakışta her biri haftada 3 gün, toplam 6 gün
   yoldadır; Yılan 90 günün 24'ünde görünür. Seçenek: ikisi birlikte haftada 3 gün; o zaman Yılan 56 gün, dikkat
   durakları 33 gün (`sim_w3.mjs`). Öneri: bugünkü kural kalsın, çünkü dikkat durakları kayıt ve ölçüm üretiyor; Yılan
   Ana sayfadan hep açık. Karar senin.
3. **Bugünün görevi eski kullanıcıda:** hiç denememiş eski kullanıcının yoluna da girsin mi (öneri: evet, farkındalık
   yolda istenen bir modül) yoksa onlarda eski kural mı kalsın?
4. **Ara kilidi:** yol molası yalnız kalan göz çalışması bütçeyi aşacaksa başlasın mı (öneri), yoksa bugünkü "≥ 1 dk"
   kuralı mı kalsın (1. ve 2. gün 4 dk boş bekleme)?
5. **Hafif gün:** YOL.ilerleme §13.4'teki soru açık; öneri: yalnız kişinin isteğiyle (kanıt yok, otomatik kısa gün
   ilerlemeyi yavaşlatır).
6. **Nefes çeşitlemesi:** "günün ritmi" 8. günde mi başlasın (öneri), tutmalı günler 22. ve 43. günde mi; sahibinin
   4-2-4-4'ü yalnız 43. günden sonra, haftada bir gün ve ön koşullarla mı gelsin (öneri), yoksa yalnız Ana sayfadaki
   "Özel" ile mi?
7. **Kapanış nefesi:** yoganın olmadığı günlerde Göz kırpma grubunun sonunda 30 sn "Üç nefes" olsun mu?
8. **Eski kullanıcıda varyant hızı:** haftada bir basamak (`Dvar`, öneri) mi, hemen kayıtlardaki yere mi?
9. **Gökyüzü molası:** (e)'de YOL.moduller §4.8 kuralı mı (haftada 2, gündüz, yürüyüşle aynı döndürme; öneri),
   YOL.ilerleme §5.5 kuralı mı (4. günden, Uzağa bakışla gün aşırı)?
