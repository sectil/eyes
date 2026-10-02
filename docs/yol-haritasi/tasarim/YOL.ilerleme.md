# YOL · İlerleme motoru — sonsuz, kademeli günlük yol (tasarım, 2026-09-29)

Bu belge bir PLAN ve TASARIMDIR; kod değişikliği sahibinin onayından sonra yapılır (SAHIP_ISTEKLERI.md, bağlayıcı
kurallar). Kapsam: `SAHIP_ISTEKLERI.md` 1–6. maddeleri (sonsuz döngü, kademeli artış, modül listesi, altın kural,
bağlılık, mevcut sistem bozulmaz). 5 saniye kuralı ve Nef'in "sözcü" metinleri bu belgenin dışında; burada yalnız
Nef'e giden sinyaller yazılı. Sağlık iddiası yok; her zamanlama ya bir kaynağa (PMID/DOI, PubMed'de doğrulandı) ya
da **VARSAYIM** etiketine dayanır.

Dosya:satır göndermeleri 2026-09-29 tarihli koda aittir (`/home/user/eyes/app/src/...`).

---

## 0. On satırda özet

1. "Seviye" saklanmaz, **kayıtlardan türetilir**: bir modülün seviyesi = o modülün tamamlandığı **ayrı gün sayısı** (D).
2. Her modülün bir **merdiveni** vardır (basamak = gün sayısına göre içerik); merdiven bitince içerik **varyantla**
   (tekrar, süre, kalıp, oyun seviyesi) ve **döndürmeyle** değişir; döngü 28 değil, sonsuz.
3. Atlanan gün ceza değildir: D düşmez, basamak geri gitmez; ≥ 14 gün aradan sonra yalnız o gün bir basamak
   **yumuşak** (ısınma günü), yine sıfırlanmaz.
4. "Sonra yaparım" durağı bugünün sonuna taşır; gün bitince sessizce düşer; yarına iz bırakmaz.
5. Yol ≈ 15 dk kalır: her durağın **yol payı** (üstü isteğe bağlı uzatma), **sakinlik payı** (nefes + meditasyon
   ≤ 6 dk), döndürme grupları, mevcut düşme sırası (R7) ve E testinin haftalığa inmesi.
6. Haftalık E testi, 5. gün raporu, 14 günde bir İyi oluş ve 28. gün iris haritası **oldukları yerde** kalır; yol
   yalnızca onları gün sayacıyla duyurur.
7. Yeni modüller (yürüyüş, meditasyon, yoga, gökyüzü molası yolda) aynı sözleşmeyle eklenir: `sessions.match` +
   `progress.domain` → veri merkezine kendiliğinden bağlanır (`dataHub.test.js` bunu denetler).
8. Teknik olarak tek yeni dosya: `lib/progression.js`; `today.js`'e 4 satır ek; manifestlere `progression` alanı ve
   `today(ctx)` içinde `stageOf(ctx, id)` çağrısı.
9. Her şey **ctx üzerinden isteğe bağlıdır**: `ctx.progression` yoksa manifestler bugünkü çıktıyı verir; mevcut 66 test
   (`today`, `registry`, `dataHub`, `breath`) değişmeden geçer (bugün çalıştırıldı: 4 dosya, 66 test, geçti).
10. Bekleyen kararlar §13'te: günlük E testinin yoldan çıkma günü, meditasyon/yoga adları, 56. gün iris.

---

## 1. Bugün kodda ne var (dokunacağım yerler)

| Ne | Nerede | Bugünkü davranış |
|---|---|---|
| Yol şablonu ve kurallar | `lib/today.js:6-17` (durak sözleşmesi), `:111` ORDER, `:115` PATH (hedef 15, üst 20, VARSAYIM), `:118-164` collect, `:197-317` buildPath | Duraklar manifestlerin `today(ctx)` sonucundan gelir; `ctx = { tests, sessions, now, profile?, eye?, gate? }` (`:198` her ek alan `...ctx` ile geçer). Döndürme `:210-221`, düşme `:241-247`, mola `:226-230`. |
| Modül sözleşmesi | `modules/registry.js:85-116` validateManifest | Yalnız bilinen alanlar denetlenir; bilinmeyen alan (ör. `progression`) hata vermez. `:159` klasörden toplar. |
| Egzersiz grupları | `lib/routines.js:71-78` PATH_GROUPS (5 grup), `:16-31` EXERCISES; `modules/routine/manifest.js:38-49` today() | Her gün beş grup sabit: Isınma, Uzağa bakış, Yakın–uzak, Daire, Göz kırpma; her biri 1 dk. Yukarı–aşağı bakış (`lookUp`/`lookDown`) yalnız setlerde var, yolda yok. |
| Nefes molası | `modules/breath/manifest.js:55-58`; `modules/breath/view.jsx:25` (`presetSec = PROGRAM_DAY_SEC` = 300 sn); `lib/breath.js:13-17` (süreler 60/180/300, kademe ilk 3 seans, 28 günlük program) | Her gün 5 dk mola durağı; ≥ 60 sn nefes kaydıyla tamam. |
| Ölçümler | `modules/weekly/manifest.js:20-27`, `modules/daily/manifest.js:19-26`, `modules/reading/manifest.js:17-21` | Haftalık tam test zamanı gelince (S3/S4 `today.js:44-108`); günlük test **her gün** (VARSAYIM `daily/manifest.js:16`); okuma haftada bir. |
| Pratikler | `snake:36-38` (her gün, bonus, dropRank 1), `track:47-49` (her gün 1 dk), `fark-ettin:40-45` ve `tek-bakis:42-48` (haftada 3, döndürme), `quick-look:41-48` (bir kez oynandıysa), `notice:30-33` (bir kez yapıldıysa, final) | Açılma sırası yok: ilk günden hepsi. |
| Yolda olmayanlar | `gokyuzu`, `dalga`, `yon`, `mola`, `water`, `who5`, `blink` (today yok) | Ana sayfadan açılır. |
| Seri ve hedef | `lib/stats.js:223` streakFrom (bugün boşsa dün sayılır), `lib/calendar.js:47` weekProgress | Seri görüntüdür; içerik seriye bağlı değil. |
| Kilometre taşları | 5. gün raporu `lib/progress.js:198-201`, `App.jsx:782-789` (5–14. gün arası bir kez); iris 28. gün `lib/iris.js:44-48` recheckDue → `lib/profileQuestions.js:192` → Ana sayfa kartı → `iris-recheck`; WHO-5 14 gün `lib/progress.js:19` | Hepsi yolun dışında, kendi kapısından. |
| Veri merkezi | `lib/dataHub.js` (hub, growthMap), `lib/dataHub.test.js:7-21` | Canlı her modül `sessions.match` tanımlar ya da istisna listesinde yazılıdır. |
| Sağlık verisi | `lib/health.js:27-31` walkNudge (son 1 saatte < 100 adım → "kalk, yürü") | Adım canlı okunur, depoya yazılmaz. |
| Ana sayfa | `screens/Home.jsx:161` buildPath çağrısı | ctx'e `progression` eklenecek tek yer. |

Yol bugün: normal gün 9 durak, 16 dk (`lib/today.test.js:20` DAY ve ilk test); haftalık gün 19 dk.

---

## 2. Tasarım ilkeleri

1. **Sonsuz:** yolun "son günü" yoktur. Merdivenler biter, varyant ve döndürme sürer. 28. gün bir kilometre taşıdır.
2. **Kademeli:** her modül küçük başlar (nefes 1 dk, tek egzersiz), yapılan gün sayısına göre büyür.
3. **Ceza yok:** atlamak, yarım bırakmak, "sonra yaparım" demek hiçbir sayacı geri almaz. Bunun davranış bilimi
   dayanağı §12'de (Lally 2010: bir günü kaçırmak alışkanlık oluşumunu bozmadı).
4. **Türetilmiş seviye:** yeni depo alanı yok; seviye kayıtlardan hesaplanır (§3).
5. **Mevcut sistem bozulmaz:** ilerleme `ctx.progression` ile açılır; verilmezse her manifest bugünkü çıktısını verir.
   `buildPath` şablonu, R1–R8, göz bütçesi, S3/S4 test kuralları aynen kalır.
6. **Altın kural:** her yeni durak bir kayıt yazar (`sessions` ya da `tests`), `progress.domain` ile alanını söyler,
   Nef'e `coach()` ile özet sayı verir. Kayıt yazmayan durak yolda yer alamaz.
7. **Yol ≈ 15 dk:** içerik büyürken süre büyümez (§8).
8. **Bağlılık, spor gibi:** aynı saat, kısa ve basit başlangıç, düzen > yoğunluk (Kaushal & Rhodes 2015: tutarlılık ve
   düşük karmaşıklık alışkanlığı yordadı). Bu ilkeler yalnız tasarımı yönlendirir; kullanıcıya iddia olarak söylenmez.

---

## 3. "Seviye" nerede durur: türetilmiş (tercih) mi, saklanan mı?

**Karar: türetilmiş.** Bir modülün ilerleme sayacı:

```
D(modül) = o modülün tamamlanmış kaydının bulunduğu AYRI yerel gün sayısı (bugüne kadar, bugün dahil)
```

"Tamamlanmış" = manifestin bugün `done` saydığı ölçüt (ör. nefes ≥ 60 sn; egzersiz grubu kaydı; yürüyüş ≥ 90 sn).
Basamak = merdiven[min(D, merdiven uzunluğu − 1)].

Neden saklamıyoruz:
- **Veri merkezi ilkesi** (ANA_BELGE §2): tek kaynak `sessions`/`tests`. Saklanan seviye ikinci bir gerçek olur; silme,
  dışa aktarma, hesap taşıma ve "Tüm verileri sil" ile uyumsuz düşebilir.
- **Kendiliğinden geçiş:** aylardır egzersiz yapan kullanıcı ilk açılışta zaten üst basamakta görünür (D büyük); yeni
  kullanıcı 1. basamaktan başlar. Göç betiği gerekmez.
- **Saf ve test edilebilir:** `stageOf(ctx, id)` saf fonksiyon; `today.test.js` gibi sabit tarihle test edilir.
- **Ceza yok kuralı bedava:** D yalnız artar; geri alma diye bir işlem yoktur.

Maliyet: her çizimde kayıtlar bir kez taranır (yüzlerce kayıt; `Home.jsx` içinde `useMemo` ile `sessions.length` +
gün anahtarına bağlanır). Saklanan tek şey **bugüne ait geçici durum**: "sonra yaparım" listesi ve "bugün hafif olsun"
işareti, `gozolcum:path-later` anahtarında `{ day: 'YYYY-MM-DD', later: ['snake', 'yuruyus'], light: false }`.
Gün değişince geçersizdir (habit-log gibi, kasıtlı olarak `sessions` dışında; Nef'e ve seriye girmez). Anahtar
`routine/manifest.js storageKeys`'e eklenir ki "Tüm verileri sil" temizlesin (registry `resetKeys`).

Kullanıcı isteğiyle "hız" (yavaş/normal) ayarı istenirse `settings.progressionPace` tek alan yeter; ilk sürümde yok
(VARSAYIM: merdivenler zaten yavaş).

---

## 4. Motorun kavramları

| Kavram | Tanım | Kaynak/etiket |
|---|---|---|
| **D** | modülün yapıldığı ayrı gün sayısı | türetilir |
| **G** | o modülde son yapılan günden bugüne takvim günü farkı (`dataHub.calendarDays`) | türetilir |
| **Merdiven** | basamak dizisi; her basamak: `{ minutes, steps?, variant?, sub }` | modül başına, §5 |
| **Yumuşak dönüş** | G ≥ 14 ise yalnız bugün için basamak − 1 (en az 1. basamak); D değişmez, yarın kaldığı yerden | VARSAYIM |
| **Açılma** | modülün yola girmesi için eşik: `unlockAfter: { totalDays: n }` (yolun herhangi bir durağının yapıldığı ayrı gün sayısı, D_toplam) | VARSAYIM (ilk günler kısa olsun) |
| **Yol payı** | durağın yola yazdığı en çok dakika (`pathCapMin`); basamak süresi bunun üstündeyse kart "3 dk · uzatabilirsin" der, ekran isteğe bağlı uzatma sunar; `minutes` yol bütçesine hep pay kadar yazılır | §8 |
| **Sakinlik payı** | nefes + meditasyon yol içinde günde ≤ 6 dk (ikisi de açıksa 3 + 3) | VARSAYIM |
| **Döndürme** | `today.js:210-221` rotate: gruptan günde biri; yeni gruplar: `donus` (Daire ⇄ Yukarı–aşağı), `uzak` (Uzağa bakış ⇄ Gökyüzü molası), `week3` (var) | var + yeni |
| **Hafif gün** | 6 ardışık tam günden sonra 7. gün ya da kullanıcı "bugün hafif" derse: yalnız Göz kırpma + Nefes + Gökyüzü/Görev (≈ 5 dk); D yine artar | VARSAYIM (göz egzersizinde dinlenme günü kanıtı yok; kalp/kas sporundan alınmadı, sadece yorgunluğu önleme) |
| **Varyant** | merdiven bitince içeriğin değişme yolu: tekrar, saniye, kalıp, oyun seviyesi, görev metni | §5, §6 |

Basamak hesabı tek formülde:

```
index = min(D, L−1); if (G >= 14 && index > 0) index -= 1 (soft = true)
```

---

## 5. Modül merdivenleri

Gösterim: **D** = o modülün yapılan gün sayısı; "Yol" = yola yazılan dakika; kaynak sütununda PMID/DOI ya da VARSAYIM.

### 5.1 Nefes (`breath`) — mola durağı, her gün

| Basamak | D | Yönlendirilen nefes | Kalıp | Yol payı | Not |
|---|---|---|---|---|---|
| N1 | 0 | 1 dk | Sakin ritim, kademeli (3,5/4,5) | 1 | mevcut `RAMP_SESSIONS = 3` (`lib/breath.js:14`, VARSAYIM) |
| N2 | 1 | 1 dk | Sakin ritim | 1 | sahibinin dizisi: 1 → 1 → 2 |
| N3 | 2–3 | 2 dk | Sakin ritim (4/6) | 2 | |
| N4 | 4–5 | 3 dk | Sakin ritim | 3 | |
| N5 | 6–7 | 4 dk | Sakin ritim | 4 | |
| N6 | 8+ | 5 dk | Sakin ritim | 5 (meditasyon açıldıysa 3) | Balban 2023: günde 5 dk, 28 gün (PMID 36630953) |
| Varyant | 14+ | 5 dk | kart Eşit ritim'i önerir (kullanıcı seçer) | 5/3 | Laborde 2022 meta-analiz: ~6 nefes/dk (PMID 35623448) |
| Varyant | 21+ | 5 dk | Uzun veriş önerisi | | Balban 2023 |
| Varyant | 28+ | 5 dk | Karın nefesi / Burun değiştir / Vızıltı sırayla haftada bir kez önerilir | | kodda "sınırlı kanıt" etiketiyle var; öneri, zorlama değil |

Kurallar:
- Mola durağı göz molası olarak **5 dk** kalır (göz bütçesi `eyeBudget.js:17-29`, Home `beginRest('path')`);
  yönlendirilen nefes basamak kadardır, kalan süre sessiz dinlenme (ekran kapalı sayacı). Böylece `Nefes her gün yolda;
  en az 60 sn nefes kaydıyla tamam` testi (`today.test.js`) ve `PATH.restMinUsed` mantığı değişmez.
- Basamak süresi `presetSec` olarak Nefes ekranına gider (`modules/breath/view.jsx:25`: `PROGRAM_DAY_SEC` yerine
  `stage.minutes * 60`, `ctx.progression` yoksa eski değer).
- Kullanıcı ekranda 3 ya da 5 dk seçerse seçtiği geçerlidir (tercih zaten `DURATIONS_SEC`); merdiven yalnız varsayılanı
  ayarlar.

### 5.2 Göz egzersizleri (`routine`) — gövde, her gün

Sahibinin dizisi: kırpma → sağ–sol → üçü birlikte → yukarı–aşağı birlikte → … Bu diziye kodun beş grubu ve
setlerdeki iki adım (`lookUp`, `lookDown`) eklenir. Adımlar yalnız `EXERCISES`'ten (`routines.js:16-31`).

| Basamak | D | Yoldaki gruplar (sırayla) ve adımları | Yol | Kaynak |
|---|---|---|---|---|
| K1 | 0 | **Göz kırpma** [blink, rest] | 1 | Kim 2020 (PMID 32409236): 10 sn'lik kırpma döngüsü, 4 hafta; Wolffsohn 2025 (PMID 40467388): kapat-sık-aç 15 tekrar |
| K2 | 1 | **Sağ–sol** [lookRight, lookLeft, rest] · Göz kırpma | 2 | bakış hareketleri "rahatlama" (`routines.js` kind relax; kanıt yok, iddia yok) |
| K3 | 2 | **Isınma** [blink, lookRight, lookLeft] ("üçü birlikte") · Göz kırpma | 2 | VARSAYIM (sıra sahibinin) |
| K4 | 3 | Isınma+ [blink, lookRight, lookLeft, lookUp, lookDown] · Göz kırpma | 2 | VARSAYIM |
| K5 | 4–5 | + **Uzağa bakış** [farLook, rest] | 3 | Talens-Estarelles 2022 (PMID 35963776): 20-20-20 hatırlatması 2 haftada yakınmaları azalttı, bırakınca sürmedi |
| K6 | 6–7 | + **Yakın–uzak** [nearFar, farLook] | 4 | kind comfort (kanıt karışık) |
| K7 | 8–9 | + **Daire** [circleCw, rest] | 5 | relax |
| K8 | 10–13 | Daire [circleCw, circleCcw, rest] → **bugünkü beş grup** | 5 | = `PATH_GROUPS` |
| K9 | 14+ | Döndürme başlar: `donus` = Daire ⇄ **Yukarı–aşağı** [lookUp, lookDown, rest] (yeni grup `dikey`), `uzak` = Uzağa bakış ⇄ Gökyüzü molası | 4–5 | VARSAYIM |
| V1 | 21+ | kırpma tekrar 5 → 10 | | Wolffsohn 2025: 15 tekrar × 3/gün en iyi; yolda tek set, üstü Ana sayfadan (VARSAYIM: yol payı) |
| V2 | 28+ | bakış adımları 5 → 8 sn; uzağa bakış 20 → 30 sn | | VARSAYIM |
| V3 | 42+ | kırpma 15 tekrar; yakın–uzak geçiş 6 → 10; daire 2 → 3 tur | | Wolffsohn 2025 (tekrar); diğerleri VARSAYIM |
| V4 | 56+ | haftada bir "tam set günü": `SETS.normal` tek durak (yalnız o gün; 2 dk) | | VARSAYIM |

Uygulama: `routine/manifest.js today()` basamağa göre grup listesini ve adım dizisini verir; kayıt `{ type: 'routine',
setId, stage, steps }` (yeni alan `stage`, eski kayıtlar `stage` olmadan okunur). Varyant (tekrar/saniye) `Routine`
ekranına `variant` ile geçer; `EXERCISES` değişmez, üstüne yazılır. Yeni grup `dikey` `PATH_GROUPS`'a eklenir ama
yalnız basamak K9+ ile yola girer; `ctx.progression` yokken `today()` beş grubu aynen döndürür (test korunur, §11.7).

### 5.3 Meditasyon (yeni modül `meditasyon`, ring life, domain calm)

Sahibinin dizisi: ilk gün 3 dk, ertesi gün yine 3 dk…

| Basamak | D | Süre | Yol payı | Kaynak |
|---|---|---|---|---|
| M1 | 0–1 | 3 dk | 3 | VARSAYIM (giriş) |
| M2 | 2–3 | 4 dk | 3 (uzatma isteğe bağlı) | |
| M3 | 4–7 | 5 dk | 3 | |
| M4 | 8+ | 5 dk yolda; uzatma hedefi 13 dk | 3 | Basso 2019 (PMID 30153464): 13 dk/gün, 8 hafta (4 hafta yetmedi); yalnız "sekiz haftalık program hedefi" olarak yazılır, etki iddiası yok |

Açılma: D_toplam ≥ 14 (üçüncü hafta; ilk iki hafta nefes tek sakinlik durağıdır). Açılınca sakinlik payı 3 + 3.
Kayıt: `{ type: 'meditasyon', seconds, calmBefore, calmAfter }` (nefesle aynı ölçek → `progress.effects`).
İçerik (rehberli ses, ElevenLabs) bu belgenin dışı; süre ve yer burada.

### 5.4 Yürüyüş (yeni modül `yuruyus`, ring life, domain body)

| Basamak | D | İçerik | Yol | Doğrulama |
|---|---|---|---|---|
| Y1 | 0+ | 2 dk kalk-yürü; molanın hemen ardından (2. bölümün ilk durağı, `order: 61`) | 2 | Sağlık izni varsa: durak açıkken adım farkı (`health.recentSteps` mantığıyla) ≥ 100 adım → `verified: true` (VARSAYIM: 100 adım ≈ 1 dk, `health.js:8`); izin yoksa "Yürüdüm" düğmesi → `verified: false` |
| Varyant | 14+ | 3 dk; haftada 2 gün "dışarı çık" görevi (Bugünün görevi ile birleşir) | 2 (uzatma) | VARSAYIM |

Dayanak: Dunstan 2012 (PMID 22374636): 20 dk'da bir 2 dk hafif yürüyüş, kesintisiz oturmaya göre yemek sonrası glukoz
ve insülin cevabını düşürdü (19 kişi, 45–65 yaş, fazla kilolu; çapraz deney). Yolda günde bir kez yapılması bu dozun
karşılığı değildir; bu yüzden kart "kalk, biraz yürü" der, sağlık sonucu vaat etmez. Açılma: D_toplam ≥ 3.
Düğmeler: **Yürüdüm** · **Sonra yaparım** (§7) · **Bugün olmaz** (kayıt yok, ceza yok).

### 5.5 Gökyüzü molası (`gokyuzu`, var; yola girer)

`today()` eklenir: D_toplam ≥ 4'ten sonra `uzak` döndürme grubunda Uzağa bakış ile gün aşırı; 2 dk (`DURATION_SEC`),
`done` = bugün ≥ 30 sn kayıt (`MIN_SAVE_SEC`). Kart "dışarıya ya da pencereye" der; doğrulanamaz, kişinin beyanı.
Kaynaklar `lib/sources.js` (Ulrich 1984, Yamashita 2021, Sturm 2020, Talens-Estarelles 2022). Varyant: 28+ günde
akşam sürümü (gece soruları zaten `gokyuzu.js promptsFor`).

### 5.6 Çemberler (`track`) — her gün 1 dk

Açılma: 1. gün. Merdiven yok; oyunun kendi seviyesi kayıtta (`s.level`, `s.mode`) ve `stats()` ile zaten izlenir.
Varyant: D ≥ 7 ve TrueDepth varsa kart "gözle oyna" önerir (opsiyon zaten var). Yol payı 1.

### 5.7 Yılan (`snake`) — bonus, açık uçlu

Açılma: D_toplam ≥ 1 (2. gün, "yeni açıldı" rozeti). Kalanı aynen: `openEnded`, `dropRank: 1`, yol uzarsa ilk düşen.
1. günün kısa kalması ve 2. güne bir "yeni şey" bırakılması bilinçli (VARSAYIM; 5 saniye işiyle uyumlu).

### 5.8 Fark Ettin mi? / Tek Bakışta / Hızlı Bakış

- **Fark Ettin mi?**: açılma D_toplam ≥ 5; haftada 3 gün, `week3` döndürmesi aynen (`fark-ettin:40-45`).
  Dayanak Schofield 2015 (PMID 26320867): kısa farkındalık yönlendirmesi dikkatsizlik körlüğünü azalttı (794 kişi,
  laboratuvar). Uygulamada aktarım iddiası yok (manifest yorumu korunur).
- **Tek Bakışta**: açılma D_toplam ≥ 7; nöbet kapısı aynen.
- **Hızlı Bakış**: bugün "bir kez oynadıysa" kuralı (`quick-look:43`); ilerleme D_toplam ≥ 10'da Nef bir kez önerir;
  yola girişi yine ilk oyundan sonra. R5 (o gün 2. bölüm yalnız onun) değişmez.

### 5.9 Bugünün görevi (`notice`) — final

Açılma: D_toplam ≥ 1 (bugünkü "bir kez yapıldıysa" kuralı `notice:31` yerine; eski kullanıcıda fark yok, yeni
kullanıcıda 2. gün kendiliğinden gelir). Görev metni zaten güne göre döner (`notice.js promptFor`); 7 metin 7 günde
tükenir → havuz 21 metne çıkarılır ve mevsime/saate göre seçilir (VARSAYIM; içerik ayrı iş).

### 5.10 Okuma (`reading`) — haftada bir

Açılma: D_toplam ≥ 2 (ilk iki gün ölçüm yükü olmasın; VARSAYIM). Kalanı aynen: son kayıttan 7 gün geçtiyse.

### 5.11 E testi — günlük → haftalık (sahibinin kuralı; KARAR gerekir)

Sahibi: "E testi haftada bir olacak, her gün değil." Kod: günlük test her gün (`daily/manifest.js:16` VARSAYIM),
haftalık tam test 7 günde bir (S3). Gelişim motoru (`lib/trend.js`) başlangıç değeri için 8.–21. günlerde en az 7 test
ister (`lib/evidence.js` "trend" kartı) ve son 7 günün ortancasına bakar; seyrek seride son 3 testin ortancasına düşer
(`trend.js:184-188`, karar S9).

Öneri (iki isteği bağdaştıran):

| Evre | Koşul | Yolda | Gerekçe |
|---|---|---|---|
| A · Başlangıç | D_test < 14 (yaklaşık ilk 3 hafta) | günlük test her gün (bugünkü gibi); haftalık gün yerine geçer | başlangıç ortancası için 7+ test gerekir (`evidence.js` trend; Faes 2021 PMID 33414531 yanlış alarm gerekçesi) |
| B · Takip | D_test ≥ 14 | **yalnız haftalık tam test** (7 günde bir); günlük test Ana sayfada kalır, yolda yok | sahibinin kuralı; trend S9 seyrek seriyle çalışır |
| B' · Uyarı | `vaAlert` sarı/kırmızı iken | günlük test 3 gün yola döner ("birkaç gün daha ölç") | koç kuralı `coachCore.js:72` ile aynı |

Not: Evre B'de "Son 7 gün ortancası" etiketi çoğu hafta tek test görür; `trend.js` bunu S9 ile karşılar ama Gelişim
grafiğindeki nokta sıklığı azalır. Sahibine soru §13.1.

### 5.12 İyi oluş (WHO-5), 28. gün, 5. gün — kilometre taşları (§9)

### 5.13 Yoga (gelecek modül, sahibinin "30 dk, 10 bölüm"u)

Bölüm n = merdiven basamağı n (1–10), her bölüm 3 dk, yol payı 3; yolda günde tek bölüm, Yürüyüş ile `beden`
döndürmesinde (gün aşırı). Tam 30 dk ve "istediğim dakikayı dinle" Ana sayfadan. Kayıt `{ type: 'yoga', part, seconds }`.
Dayanak yoga içeriği hazırlanınca ayrı rapor; bu belgede yalnız yeri ve süresi (VARSAYIM).

### 5.14 Ölçüm modülleri (durağı olmayanlar)

Uyku kalitesi (Sağlık'tan), hareket ölçümü (adım), dikkat tespiti: yolda durak değil, Nef'e giden sinyal ve Gelişim
kutusu. Yalnız kural: **hepsi `progress.domain` ile alanını söyler ve ölçtüğünü `sessions`'a ya da ayrı günlüğe yazar,
merkez okur** (`dataHub.js` HABIT_DOMAIN örüntüsü). Tasarımları başka iş.

---

## 6. Gün gün tablo (yeni kullanıcı, her gün yapıyor, ilerleme açık)

D_toplam gün başında; "≈ dk" yola yazılan toplam (`minutesLeft`); Yılan açık uçlu 2 dk, yol 20'yi aşarsa ya da 2. bölüm
payı taşarsa ilk düşen (R7/R2). E testi süresi kartta yazılmaz, bütçeye 3/5 yazılır.

| Gün | 1. bölüm | Mola | 2. bölüm | Final | ≈ dk | Yeni açılan |
|---|---|---|---|---|---|---|
| 1 | Haftalık E testi (5, R6: ilk durak) · Göz kırpma (1) · Çemberler (1) | Nefes 1 | — | — | 8 | — |
| 2 | Günlük E (3) · Sağ–sol (1) · Çemberler (1) | Nefes 1 | Göz kırpma (1) · Yılan (2) | Bugünün görevi (1) | 10 | Yılan, Görev |
| 3 | E (3) · Isınma "üçü birlikte" (1) · Çemberler (1) · Okuma (3) | Nefes 2 | Göz kırpma (1) · Yılan (2) | Görev (1) | 14 | Okuma |
| 4 | E (3) · Isınma+ yukarı–aşağı (1) · Çemberler (1) | Nefes 2 | **Yürüyüş (2)** · Göz kırpma (1) · Yılan (2) | Görev (1) | 13 | Yürüyüş |
| 5 | E (3) · Isınma (1) · **Uzağa bakış (1)** · Çemberler (1) | Nefes 3 | Yürüyüş (2) · Göz kırpma (1) · Yılan (2) | Görev (1) | 15 | Uzağa bakış · **5. gün raporu** |
| 6 | E (3) · Isınma (1) · **Gökyüzü molası (2)** · Çemberler (1) | Nefes 3 | Yürüyüş (2) · **Fark Ettin mi? (2)** · Göz kırpma (1) | Görev (1) | 16 (Yılan düştü: 2. bölüm payı) | Gökyüzü, Fark Ettin mi? |
| 7 | E (3) · Isınma (1) · Uzağa bakış (1) · Çemberler (1) · **Yakın–uzak (1)** | Nefes 4 | Yürüyüş (2) · Göz kırpma (1) · Yılan (2) | Görev (1) | 17 | Yakın–uzak |
| 8 | **Haftalık E (5)** · Isınma (1) · Gökyüzü (2) · Çemberler (1) · Yakın–uzak (1) | Nefes 4 | Yürüyüş (2) · **Tek Bakışta (2)** · Göz kırpma (1) | Görev (1) | 20 → Görev düşer (R7) 19 | Tek Bakışta |
| 9 | E (3) · Isınma (1) · Uzak (1) · Çemberler (1) · Yakın–uzak (1) | Nefes 5 | Yürüyüş (2) · **Daire (1)** · Göz kırpma (1) · Yılan (2) | Görev (1) | 19 | Daire |
| 10 | E (3) · Isınma · Gökyüzü (2) · Çemberler · Yakın–uzak · Okuma (3) | Nefes 5 | Yürüyüş · Fark Ettin mi? (2) · Daire · Göz kırpma | Görev | 20 → Yılan yok, Görev düşer 19 | Nef: Hızlı Bakış'ı tanıt |
| 11–13 | E · Isınma · Uzak/Gökyüzü · Çemberler · Yakın–uzak | Nefes 5 | Yürüyüş · Daire (iki yön) · Göz kırpma · Yılan | Görev | 17–18 | K8 = bugünkü beş grup |
| 14 | E · Isınma · Uzak · Çemberler · Yakın–uzak | Nefes 5 | Yürüyüş · Daire · Göz kırpma | Görev · **İyi oluş 5 soru** | 17 | WHO-5 (kapı zaten var) |
| 15 | Haftalık E (5) · Isınma · Gökyüzü · Çemberler · Yakın–uzak | Nefes 3 | **Meditasyon 3** · Yürüyüş · Yukarı–aşağı (döndürme) · Göz kırpma | Görev | 20 → düşmeler | Meditasyon; `donus` döndürmesi |
| 16–21 | E · Isınma · Uzak⇄Gökyüzü · Çemberler · Yakın–uzak | Nefes 3 | Meditasyon 3 · Yürüyüş · Daire⇄Yukarı–aşağı · Göz kırpma (10 tekrar, V1 21. gün) · Yılan | Görev | 16–18 | |
| 22 | **Evre B: günlük E testi yoldan çıkar** | | | | 13–15 | haftalık test kalır |
| 22–27 | Isınma · Uzak⇄Gökyüzü · Çemberler · Yakın–uzak | Nefes 3 | Meditasyon 3 · Yürüyüş · Daire⇄Yukarı–aşağı · Göz kırpma · Yılan | Görev | 15 | hedefe oturur |
| 28 | Haftalık E (5) · … | | | Görev · **İris haritası yeniden** (kart) | 18 | 28. gün |
| 29–41 | V2: bakış adımları 8 sn, uzağa bakış 30 sn; nefes kalıp önerileri | | | | 15–16 | |
| 42+ | V3: kırpma 15 tekrar, yakın–uzak 10 geçiş, daire 3 tur | | | | 15–16 | |
| 56+ | V4: haftada bir "tam set günü"; İyi oluş 4. kez; iris 2. yeniden bakış (KARAR §13.3) | | | | | |
| 90+ | plato yönetimi §8.6: haftalık "odak modülü" (+1 dk), yeni modüller (yoga bölümleri) aynı kapıdan | | | | | |

Hafif gün (7 ardışık tam günün 7'sinde ya da kullanıcı isterse): Göz kırpma (1) · Nefes 3 · Gökyüzü (2) · Görev (1) ≈ 7 dk.

Dakika toplamları `today.js` kurallarıyla elle hesaplandı; kodda `today.test.js`'e aynı senaryolar test olarak
yazılacak (§11.7), sayı orada doğrulanır (**cihazda denenmedi**).

---

## 7. Atlanan gün, "sonra yaparım", yarım kalan, uzun ara

| Durum | Ne olur | Ne olmaz | Nef'e giden sinyal |
|---|---|---|---|
| Gün atlandı | hiçbir kayıt yok; D aynı; ertesi gün aynı basamak | basamak düşmez, "seri bozuldu" ekranı yok (seri sayısı Gelişim'de yine görünür, `stats.js:223`) | `gapDays` |
| 3–13 gün ara | aynı basamak; Nef "kaldığın yerden" der | | `gapDays` |
| ≥ 14 gün ara | o gün basamak − 1 (ısınma günü, `soft: true`), yarın normal | sıfırlanma yok | `soft: 1` |
| "Sonra yaparım" (durakta) | durak `later` listesine; sırası bugünün sonuna (final öncesi) kayar; `next` onu atlar | yarına taşınmaz; bildirim yalnız kullanıcı isterse (var olan hatırlatma sistemi; VARSAYIM) | sayı olarak `later7` (7 günde kaç kez) |
| "Bugün olmaz" (yürüyüş) | kayıt yok, durak kalır ama `next` atlar | ceza yok | — |
| Yarım kalan ölçüm | mevcut S3/S4 ("Kalan: Sol göz"), değişmez | | var |
| Yarım kalan egzersiz grubu | kayıt yazılmaz (bugünkü gibi); tekrar açılınca baştan | | — |
| Hafif gün seçildi | kısa yol; D artar | basamak atlamaz (hafif gün de "yapılan gün") | `light7` |

Dayanak (davranış bilimi, sağlık iddiası değil): Lally 2010 (Eur J Soc Psychol, doi:10.1002/ejsp.674, PubMed'de yok,
web ile doğrulandı): 96 kişide alışkanlık otomatikliğe ortanca 66 günde ulaştı, kişiler arası büyük fark; **bir günü
kaçırmak** süreci ölçülür biçimde bozmadı. Gardner 2012 (PMID 23211256): aynı bağlamda (aynı zaman/yer) tekrar.
Kaushal & Rhodes 2015 (PMID 25851609): 111 yeni spor salonu üyesinde haftada ≥ 4 kez, 6 hafta; tutarlılık, düşük
karmaşıklık, ortam ve keyif alışkanlığı yordadı. Bu yüzden: kısa başlangıç, aynı saat (hatırlatma var), ceza yok, keyif
(Yılan 2. gün).

---

## 8. Yol ≈ 15 dk nasıl kalır (içerik aylarca büyürken)

1. **Yol payı (`pathCapMin`)**: durağın `minutes`'ı hiçbir zaman payın üstüne çıkmaz; fazlası ekranda "uzat" (Nefes 5 → 13
   dk meditasyon hedefi gibi) ve `sessions`'a gerçek süre yazılır; Gelişim gerçek süreyi görür, yol payı görür.
2. **Sakinlik payı**: nefes + meditasyon yol içinde ≤ 6 dk.
3. **Döndürme grupları** (`rotate`, `today.js:210-221`): `donus`, `uzak`, `beden` (yürüyüş ⇄ yoga), `week3` (var).
   Bir gruptan günde bir durak.
4. **Açılma sırası**: yeni modül yeni gün ekler, aynı güne yığılmaz (§5 eşikleri).
5. **Mevcut düşme sırası** (R2/R7, `dropRank`): Yılan → Tek Bakışta/Fark Ettin mi? → Görev → Daire (değişmez).
6. **Plato yönetimi (90+ gün)**: her hafta bir "odak modülü" (`weekIdx % N`) +1 dk alır, bir diğeri döndürmede
   dinlenir; varyantlar (tekrar, saniye, kalıp, seviye, görev metni) merdiven bitince değişimi sürdürür. Yeni modül
   eklemek = klasör + `progression` alanı; yol uzamaz, çünkü yeni modül bir döndürme grubuna ya da açılma gününe bağlanır.
7. **Günlük E testi haftalığa iner** (Evre B): en büyük tasarruf (6 günde 3'er dk).

Kanıtla ilgisi: Wolffsohn 2025 ve Talens-Estarelles 2022'de etkiler bırakınca 1–2 haftada başlangıca döndü; bu,
"bitmiş" yol olmamasının gerekçesi (iddia değil, sürekliliğin nedeni).

---

## 9. Kilometre taşları sonsuz yolun içinde

| Taş | Bugün nasıl | İlerleme motoruyla |
|---|---|---|
| 5. gün raporu | `App.jsx:782-789`: `trialOffer.date`/`identitySetup.date`'ten 5–14. günde bir kez | değişmez; yol başlığı 5. gün "İlk raporun hazır" satırını `milestones(ctx)` ile gösterir; rapor açıldıysa satır düşer |
| 14 gün İyi oluş | `progress.js:19` WHO5_EVERY_DAYS, Ana sayfa kartı | değişmez; `milestones` "İyi oluş · bugün 5 soru" |
| 28. gün iris | `iris.js:44-48` → `profileQuestions.js:192` → kart → `iris-recheck` | değişmez; 21.–27. günlerde başlık "28. güne n gün"; 28'de "İris haritan yeniden" |
| 56, 84, … | yok (`iris.recheck` tek alan) | `milestones` 56. günü sayar; ikinci yeniden bakış için `iris.rechecks[]` gerekir → KARAR §13.3 |
| Aylık rapor | yok | `firstReport` her 28 günde bir "Ay raporu" olarak yeniden kullanılabilir (aynı fonksiyon, `start` = 28 gün önce) → sonraki iş |

Gün sayacı: `sinceStart` (`dataHub.growthMap`), takvim günü (`calendarDays`), ilk kayıt gününden.

---

## 10. Nef'e ne gider

`lib/coach.js buildSignals` → `modules` alanına modül `coach()` özetleri zaten gider (`coachCore.js sanitizeModules`,
en çok 10 modül × 6 alan). İlerleme ek alan ister: `SCHEMA`'ya `pathDay` (0–3650), `pathStage` (modül başına
`coach()` içinde `stage: n`), `gapDays`, `later7`, `light7` (hepsi sayı). Yasak ifade taraması aynen.
Örnek kural cümleleri (şablon, model değil): "3. basamaktasın: bugün nefes 2 dk." · "Beş gündür yoksun; kaldığın yerden,
bugün bir basamak yumuşak." · "Yürüyüşü üç kez erteledin; saatini değiştirelim mi?" (Trinquart 2023 notu YAPILACAKLAR'da).

---

## 11. Entegrasyon planı

### 11.1 Yeni dosya `lib/progression.js` (saf, React yok)

```js
// İlerleme motoru: seviye kayıtlardan türetilir (ayrı yapılan gün sayısı). ctx.progression yoksa hiçbir modül
// davranış değiştirmez (stageOf → null). Tasarım: scratchpad/yol/YOL.ilerleme.md.
import { dayKey } from './calendar.js'
import { keyDay } from './habitLog.js'

export const LATER_KEY = 'gozolcum:path-later'
export const SOFT_AFTER_DAYS = 14   // VARSAYIM
export const LIGHT_AFTER_STREAK = 6 // VARSAYIM

// Modül merdivenleri (basamak = { minutes, sub, steps?, variant? }); modül manifesti kendi merdivenini de verebilir
export const LADDERS = {
  breath: [{ minutes: 1 }, { minutes: 1 }, { minutes: 2 }, { minutes: 2 }, { minutes: 3 }, { minutes: 3 }, { minutes: 4 }, { minutes: 4 }, { minutes: 5 }],
  routine: [ /* K1..K9: { groups: [{ id, steps }], variant } */ ],
  meditasyon: [{ minutes: 3 }, { minutes: 3 }, { minutes: 4 }, { minutes: 4 }, { minutes: 5 }],
  yuruyus: [{ minutes: 2 }],
}
export const UNLOCK = { snake: 1, notice: 1, reading: 2, yuruyus: 3, gokyuzu: 4, 'fark-ettin': 5, 'tek-bakis': 7, meditasyon: 14 } // D_toplam eşiği, VARSAYIM

// records: [{date}] (tamamlanmış sayılan kayıtlar) → ayrı yerel gün sayısı ve son güne uzaklık
export function doneDays(records = [], now = new Date()) { /* Set(dayKey) boyutu, now'a kadar */ }
export function gapDays(records = [], now = new Date()) { /* keyDay(now) − keyDay(son kayıt) | null */ }

// merdiven + D + G → { index, soft }
export function stageIndex(ladder, D, G, { softAfter = SOFT_AFTER_DAYS } = {}) {
  let index = Math.min(D, ladder.length - 1)
  const soft = G != null && G >= softAfter && index > 0
  return { index: soft ? index - 1 : index, soft }
}

// Ana sayfa bir kez hesaplar (useMemo); buildPath ctx'ine girer. done: modül id → { D, G } (manifest.progression.match ile)
export function progressionCtx({ sessions = [], tests = [], now = new Date(), modules = [], later = null } = {}) {
  /* her modül için m.progression?.match ile kayıtları süz → D, G; totalDays = tüm yol duraklarının ayrı günleri;
     streak (ardışık tam gün) → light; later listesi bugüne aitse geçerli */
  return { day: totalDays, totalDays, done: { [id]: { D, G } }, light, later: later?.later ?? [], soft: {} }
}

// Manifestin çağırdığı tek kapı. ctx.progression yoksa null → manifest bugünkü çıktısını verir.
export function stageOf(ctx, id, ladder = LADDERS[id]) {
  const p = ctx?.progression
  if (!p || !ladder) return null
  const d = p.done[id] ?? { D: 0, G: null }
  const { index, soft } = stageIndex(ladder, d.D, d.G)
  return { index, soft, D: d.D, G: d.G, ...ladder[index] }
}
export function unlocked(ctx, id) { const p = ctx?.progression; return !p || (p.totalDays >= (UNLOCK[id] ?? 0)) }
export const isLater = (ctx, key) => Boolean(ctx?.progression?.later?.includes(key))

// Bugünlük geçici durum (habit-log gibi sessions dışında; gün değişince geçersiz)
export function loadLater(now = new Date(), storage) { /* { day, later: [], light } ya da null */ }
export function markLater(key, now = new Date(), storage) { /* listeye ekler, aynı günün nesnesini korur */ }
export function setLight(yes, now = new Date(), storage) {}

// Kilometre taşları (yol başlığı için): [{ day, key: 'report'|'who5'|'iris', title, due }]
export function milestones(ctx, { reportSeen, who5Due, irisDue }) {}
```

### 11.2 `lib/today.js` ekleri (4 satır, davranış korunur)

- `collect()` `:133-160`: durak nesnesine `later: isLater(c, key)` ve `stage: it.stage ?? null` eklenir; `order`:
  `later ? ORDER.open + 5 : …` (final öncesi sona kayar). `isLater` `ctx.progression` yokken false → eski sıra.
- `buildPath()` `:277`: `next` seçiminde `!s.later` koşulu (`stops.find((s) => !s.done && !s.finale && !s.later)`);
  hepsi later ise eski davranış.
- Durak sözleşmesi yorumuna (`:6-17`) `stage?: { index, minutes, soft }` ve `later?` satırı.
- `PATH` ve `ORDER` değişmez. `separateMeasures`, R2, R5, R7, R8 değişmez.

### 11.3 `screens/Home.jsx:161`

```js
const progression = useMemo(() => progressionCtx({ sessions, tests, now, modules: registry.live, later: loadLater(now) }), [sessions, tests, dayKey(now)])
const plan = buildPath(registry.live, { tests, sessions, now, profile: settings.profile, eye: eyeBudget, gate: { … }, progression })
```

Tek yeni `ctx` alanı. `TodayPath` karta `stop.stage?.minutes` ve `soft` rozetini, başlığa `milestones` satırını yazar.

### 11.4 `modules/registry.js` — yeni isteğe bağlı manifest alanı

```
progression?: { match(s) → bool,          // hangi kayıt "yapıldı" sayılır (çoğu modülde sessions.match ile aynı)
                ladder?: [...],            // LADDERS'ı ezer
                unlockAfter?: { totalDays } }
```

`validateManifest:85-116`'ya iki satır: `if (m.progression != null) need(typeof m.progression.match === 'function', …)`.
Bilinmeyen alan zaten reddedilmediği için eski manifestler geçerli kalır (`registry.test.js` "hepsi geçerli" geçer).

### 11.5 Üç örnek manifest farkı (metin; uygulanmadı)

**(a) `modules/breath/manifest.js:55-58`**

```diff
-import { SESSION_TYPE, PATTERNS, BREATH_OPTS_KEY, BREATH_SAFETY_KEY, PROGRAM_DAY_SEC, isBreath } from '../../lib/breath.js'
+import { SESSION_TYPE, PATTERNS, BREATH_OPTS_KEY, BREATH_SAFETY_KEY, PROGRAM_DAY_SEC, isBreath } from '../../lib/breath.js'
+import { stageOf } from '../../lib/progression.js'
 …
+  // İlerleme (YOL.ilerleme.md §5.1): yapılan gün sayısına göre 1→1→2→2→3→3→4→4→5 dk; ctx.progression yoksa 5 dk
+  progression: { match: (s) => isBreath(s) && s.seconds >= 60 },
-  today({ sessions, now }) {
+  today(ctx) {
+    const { sessions, now } = ctx
     const done = sessions.some((s) => isBreath(s) && s.seconds >= 60 && isSameDay(s, now))
-    return { title: 'Nefes', sub: 'Gözlerin dinlenirken nefes al.', minutes: PROGRAM_DAY_SEC / 60, route: 'breath-rest', slot: 'rest', glyph: 'moon', done }
+    const st = stageOf(ctx, 'breath')
+    const minutes = st ? st.minutes : PROGRAM_DAY_SEC / 60
+    const sub = st && st.minutes < 5 ? `${st.minutes} dk nefes, kalanı sessiz dinlenme.` : 'Gözlerin dinlenirken nefes al.'
+    return { title: 'Nefes', sub, minutes, route: 'breath-rest', slot: 'rest', glyph: 'moon', done, stage: st }
   },
```

`modules/breath/view.jsx:25`: `presetSec={route === 'breath-rest' ? (stageSec ?? PROGRAM_DAY_SEC) : …}`; `stageSec`
App'ten `plan.stops.find(k === 'breath')?.stage?.minutes * 60` ile gelir (yoksa eski değer).

**(b) `modules/routine/manifest.js:38-49`**

```diff
 import { SETS, PATH_GROUPS } from '../../lib/routines.js'
 import { isSameDay } from '../../lib/today.js'
+import { stageOf, LATER_KEY } from '../../lib/progression.js'
 …
+  storageKeys: [LATER_KEY], // bugünlük "sonra yaparım" ve "hafif gün" (Tüm verileri sil temizler)
+  progression: { match: (s) => s?.type === 'routine' },
-  today({ sessions, now }) {
+  today(ctx) {
+    const { sessions, now } = ctx
     const doneIds = new Set(sessions.filter((s) => s.type === 'routine' && isSameDay(s, now)).map((s) => s.setId))
-    return PATH_GROUPS.map((g) => ({
+    const st = stageOf(ctx, 'routine')
+    // ctx.progression yoksa (eski çağrı, testler) beş grup aynen; varsa basamağın grupları ve adımları
+    const groups = st ? st.groups.map((sg) => ({ ...PATH_GROUPS.find((g) => g.id === sg.id), steps: sg.steps })) : PATH_GROUPS
+    return groups.map((g) => ({
       key: g.id,
       title: g.title,
       minutes: 1,
       glyph: g.glyph,
       route: `routine-${g.id}`,
       done: doneIds.has(g.id),
+      ...(st ? { stage: st, steps: g.steps, variant: st.variant ?? null, rotate: ROTATE[g.id] } : {}),
       ...PATH_PLACE[g.id],
     }))
   },
```

`lib/routines.js:71-78`'e `{ id: 'dikey', title: 'Yukarı–aşağı', glyph: 'arrows', steps: ['lookUp', 'lookDown', 'rest'] }`
ve `{ id: 'sagsol', title: 'Sağ–sol', … }` eklenir; `PATH_PLACE`'e yerleri (`dikey` Daire ile aynı `order: 70`,
`rotate: 'donus'`). `Routine.jsx:415` kaydına `stage: st?.index` ve `steps` (adım sayısı zaten var) eklenir; ekran
`steps` üstünden gelirse onu, yoksa grubun kendi adımlarını kullanır.

**(c) `modules/snake/manifest.js:36-38`** (açılma + sonra yaparım)

```diff
+import { unlocked } from '../../lib/progression.js'
 …
+  progression: { match: isSnake, unlockAfter: { totalDays: 1 } },
-  today({ sessions, now }) {
-    return { title: 'Yılan', sub: '1 tur', minutes: 2, slot: 'open', glyph: 'snake', openEnded: true, game: true, dropRank: 1, done: sessions.some((s) => isSnake(s) && isSameDay(s, now)) }
+  today(ctx) {
+    const { sessions, now } = ctx
+    if (!unlocked(ctx, 'snake')) return null // ctx.progression yoksa unlocked → true (eski davranış)
+    return { title: 'Yılan', sub: '1 tur', minutes: 2, slot: 'open', glyph: 'snake', openEnded: true, game: true, dropRank: 1, done: sessions.some((s) => isSnake(s) && isSameDay(s, now)) }
   },
```

### 11.6 Yeni modül örneği `modules/yuruyus/manifest.js` (özet)

```js
import { stageOf, unlocked } from '../../lib/progression.js'
import { isSameDay, withinDays } from '../../lib/today.js'
export const SESSION_TYPE = 'walk'
const isWalk = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.seconds)
export default {
  id: 'yuruyus', title: 'Yürüyüş', label: 'kısa yürüyüş', ring: 'life', kind: 'practice',
  progress: { domain: 'body', metrics: [{ key: 'walk-steps', label: 'Yürüyüşte adım', unit: 'adım', better: 'up',
    series: ({ sessions }) => sessions.filter((s) => isWalk(s) && Number.isFinite(s.steps)).map((s) => ({ date: s.date, value: s.steps })) }] },
  gates: {}, home: { section: 'practice', order: 38 },
  sessions: { match: isWalk, countsTowardGoal: true, describe: (s, { seconds }) => ({ title: 'Yürüyüş', detail: s.verified ? `${s.steps} adım` : 'beyan' }) },
  progression: { match: (s) => isWalk(s) && s.seconds >= 90, unlockAfter: { totalDays: 3 } },
  today(ctx) {
    if (!unlocked(ctx, 'yuruyus')) return null
    const st = stageOf(ctx, 'yuruyus')
    return { title: 'Yürüyüş', sub: 'Kalk, 2 dk yürü.', minutes: st?.minutes ?? 2, slot: 'body', order: 61, glyph: 'steps', rotate: 'beden', done: ctx.sessions.some((s) => isWalk(s) && isSameDay(s, ctx.now)), stage: st }
  },
  coach(sessions, now) { const w = withinDays(sessions.filter(isWalk), now); return { days7: new Set(w.map((s) => new Date(s.date).toDateString())).size, verified7: w.filter((s) => s.verified).length } },
}
```

`unlocked` `ctx.progression` yokken `true` döner; bu modül **yeni** olduğu için eski testlere de girer (normal gün 9 →
10 durak). Bu yüzden ilk sürümde `today()` başına `if (!ctx.progression) return null` konur: yeni modüller yalnız
ilerleme açıkken yola girer; `today.test.js` DAY listesi değişmez. (Meditasyon, yoga, gökyüzü `today()` için aynı kural.)

### 11.7 Mevcut testler neden geçer, yeni testler neler

- `lib/today.test.js` (33 test): bütün çağrılar `buildPath(registry.live, { tests, sessions, now, … })` — `progression`
  yok → `stageOf` null, `unlocked` true, `isLater` false → her manifest bugünkü nesneyi döndürür; `later`/`stage`
  alanları `collect`'te `false`/`null` olur, sıralama ve `next` aynı. Yeni modüller `ctx.progression` yokken `null`.
- `modules/registry.test.js` (9 test): `progression` isteğe bağlı; "yeni modül takılınca her yere bağlanır" testi yeni
  manifestlerde `sessions.match` + `progress` bulur.
- `lib/dataHub.test.js`: yeni modüllerin hepsi `sessions.match` tanımlar → istisna listesine ekleme gerekmez.
- `lib/breath.test.js`: `breath.js` değişmez.
- Yeni: `lib/progression.test.js` (doneDays, gapDays, stageIndex sınırları, yumuşak dönüş, açılma, later günü
  değişince düşer, milestones), `today.test.js`'e "ilerleme açık" bloğu (§6 tablosunun 1., 2., 5., 8., 22. günleri
  ve hafif gün), `TodayPath.test.jsx`'e basamak rozeti ve "sonra" düğmesi. Ekran testleri koyu/açık temada ve 320 px'te
  (ANA_BELGE §2) — cihazda doğrulanana kadar `[~]`.

### 11.8 Yapım sırası (her adım ayrı onay, ayrı TestFlight)

1. `lib/progression.js` + testleri; `today.js` 4 satır; Home ctx; `TodayPath` basamak rozeti ve "Sonra" düğmesi.
2. Nefes ve egzersiz merdivenleri (breath, routine, `dikey`/`sagsol` grupları, Routine `steps` üstüne yazma).
3. Açılma sırası (snake, notice, reading, fark-ettin, tek-bakis) ve `milestones` başlığı.
4. Yürüyüş modülü (Sağlık adım doğrulaması **cihazda denenecek**); Gökyüzü `today()`.
5. E testi Evre A/B (sahibinin kararından sonra); Nef sinyalleri (`coachCore SCHEMA`).
6. Meditasyon modülü (ses içeriği ayrı iş); yoga bölümleri hazır olunca aynı kapı.
7. `releases.js` sürüm notu her adımda; YAPILACAKLAR'a açık işler; HATA_GUNLUGU'na bulgular.

---

## 12. Kanıt tablosu (PubMed'de doğrulandı, 2026-09-29) ve VARSAYIM listesi

PubMed kayıtlarına göre (DOI bağlantıları):

| Kullanıldığı yer | Kaynak | Ne diyor (sınırıyla) |
|---|---|---|
| Kırpma 1. gün, kırpma her gün | Kim 2020, Cont Lens Anterior Eye, PMID 32409236, [DOI](https://doi.org/10.1016/j.clae.2020.04.014) | 54 kuru göz yakınmalı katılımcı, 4 hafta, 20 dk'da bir 10 sn kırpma döngüsü; yakınma ve yarım kırpma oranı azaldı; kontrol grubu yok (öncesi–sonrası) |
| Kırpma tekrar 5 → 10 → 15 (V1, V3) | Wolffsohn 2025, PMID 40467388, [DOI](https://doi.org/10.1016/j.clae.2025.102453) | RKÇ, 98 + 28 kişi; kapat-sık-aç 15 tekrar × 3/gün en iyi; 2 hafta sonra bırakınca çoğu ölçü başlangıca döndü |
| Uzağa bakış, süreklilik gerekçesi | Talens-Estarelles 2022, PMID 35963776, [DOI](https://doi.org/10.1016/j.clae.2022.101744) | 29 ekran kullanıcısı, 2 hafta 20-20-20 hatırlatması; yakınmalar azaldı, bırakınca 1 haftada sürmedi; iki göz ölçülerinde değişim yok |
| Nefes 6/dk kalıbı | Laborde 2022, Neurosci Biobehav Rev, PMID 35623448, [DOI](https://doi.org/10.1016/j.neubiorev.2022.104711) | sistematik derleme ve meta-analiz, 223 çalışma; yavaş nefes sırasında ve sonrasında vagal HRV arttı; özette etki büyüklüğü yok |
| Nefes hedef 5 dk/gün | Balban 2023, Cell Rep Med, PMID 36630953, [DOI](https://doi.org/10.1016/j.xcrm.2022.100895) | RKÇ, uzaktan, 1 ay, günde 5 dk; uzun verişli döngü, farkındalık meditasyonuna göre ruh hâlinde daha çok iyileşme ve solunum hızında düşüş |
| Meditasyon uzatma hedefi 13 dk | Basso 2019, Behav Brain Res, PMID 30153464, [DOI](https://doi.org/10.1016/j.bbr.2018.08.023) | 18–45 yaş, deneyimsiz; günde 13 dk, 8 hafta (4 hafta yetmedi) dikkat, bellek ve ruh hâli; kontrol podcast |
| Yürüyüş 2 dk | Dunstan 2012, Diabetes Care, PMID 22374636, [DOI](https://doi.org/10.2337/dc11-1931) | 19 fazla kilolu yetişkin, çapraz; 20 dk'da bir 2 dk yürüyüş yemek sonrası glukoz/insülini düşürdü; günde tek yürüyüş bu doz değil |
| Fark Ettin mi? açılış | Schofield 2015, Conscious Cogn, PMID 26320867, [DOI](https://doi.org/10.1016/j.concog.2015.08.007) | 794 kişi; kısa farkındalık yönlendirmesi dikkatsizlik körlüğünü azalttı; laboratuvar görevi |
| Ceza yok, aynı bağlam | Gardner 2012, Br J Gen Pract, PMID 23211256, [DOI](https://doi.org/10.3399/bjgp12X659466) | alışkanlık oluşumu için aynı bağlamda tekrar; derleme/yorum yazısı |
| Tutarlılık, basitlik | Kaushal & Rhodes 2015, J Behav Med, PMID 25851609, [DOI](https://doi.org/10.1007/s10865-015-9640-7) | 111 yeni salon üyesi, 12 hafta; ≥ 4 kez/hafta × 6 hafta; tutarlılık, düşük karmaşıklık, ortam, keyif |
| Bir gün kaçırmak bozmaz | Lally 2010, Eur J Soc Psychol, doi:10.1002/ejsp.674 (PubMed'de yok; Wiley sayfası web ile doğrulandı) | 96 kişi, 84 gün; ortanca 66 gün, 18–254 arası; tek kaçırma süreci bozmadı |

VARSAYIM listesi (kanıtsız, sahibinin onayına açık): yumuşak dönüş 14 gün · açılma eşikleri (§5) · yol payları ·
sakinlik payı 6 dk · hafif gün (7. gün) · göz merdiveni sırası (sahibinin dizisi) ve süre/tekrar varyantları ·
yürüyüş 100 adım doğrulaması · Gökyüzü gün aşırı · haftalık "tam set günü" · E testi Evre B eşiği D_test ≥ 14 ·
görev havuzu 21 metin · Nef cümleleri.

---

## 13. Sahibine karar soruları

1. **E testi:** Evre A (ilk ~3 hafta günlük) sonra yalnız haftalık; uyarıda 3 gün günlük — uygun mu? Yoksa ilk günden
   yalnız haftalık mı (başlangıç ortancası 7 hafta sürer)?
2. **Meditasyon** ilk sürümde mi, yoga ile birlikte mi? Adı "Meditasyon" mu, "Sessiz an" mı (sağlık çağrışımı yok)?
3. **56. gün iris:** ikinci yeniden bakış için profil yapısı genişlesin mi (`iris.rechecks[]`)?
4. **Hafif gün** otomatik mi (7. gün), yalnız kullanıcı isteğiyle mi?
5. **Yılan 2. gün** açılışı (1. gün kısa kalsın) doğru mu, yoksa 1. günden mi?
6. Yürüyüşte "Sonra yaparım" 1 saat sonra hatırlatma göndersin mi (bildirim sistemi var)?
