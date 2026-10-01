# Ders 1 · Nefesin Ritmi · 30 dakikalık iskelet (metinsiz)

PLAN.v3 §A.4: ilk yayında 30 dk'nın **iskeleti** sabitlenir (blok listesi, giriş ve dolum sıraları, anahtar cümleler, imge yayı, müzik teması) ve usta hocadan (inceleyici bulunamazsa karar 2 yedeği: iki bağımsız model incelemesi) geçer. 16–30 dk'nın **metni ikinci aşamada** (Kapı 9–11) yazılır; bu dosyada metin yoktur. ≤ 15 dk'nın metni ve planı `ders1.script.md`, `ders1.lesson.json` ve `timing.txt`'tedir. Bütün süreler VARSAYIM'dır (PLAN.v2 §B.4 çapaları).

## 1. Blok listesi ve çalma sırası

Çalma sırası (PLAN.v2 §B.4): **A → C1 → C2 → [BR.orta] → C4 → C3 → C5 → K**. Kapaklar (A, K) her sürede çalar; çekirdek bloklar öncelik ve giriş sırasıyla eklenir.

| Blok | Öncelik | Çalma | Giriş (entryRank) | İçerik | 5 | 10 | 15 | 20 | 30 | Metin |
|---|---|---|---|---|---|---|---|---|---|---|
| A Varış | sabit | 0 | — | duruş, eller, gözler, ortak çıkış cümlesi, derse özgü açılış, omuz ve çene, normalleştirme, kontrol | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 | ≤ 15 dk yazıldı (`ders1.lesson.json`) |
| C1 Doğal nefes → 4 al / 6 ver | P1 | 1 | — | doğal nefesi izleme, nefesin sesi, güvenlik cümlesi, sayılı döngüler, ipuçlu döngüler, sessiz döngüler, anahtar 1 | 3:00 | 4:30 | 4:30 | 5:00 | 6:00 | ≤ 15 dk yazıldı (`ders1.lesson.json`) |
| C2 İç çekiş | P2 | 2 | 295 | öğretim, güvenlik, ipuçlu döngüler, doğal nefes arası, ikinci tur, anahtar 2 | — | 3:00 | 3:00 | 3:00 | 3:30 | ≤ 15 dk yazıldı (`ders1.lesson.json`) |
| BR.orta (köprü) | — | 2,5 | C4 ile | ortadaki çıkış kapısı ("istediğin an…" + açık gözde bakış serbest + oturma yüzeyi dayanağı); ≥ 20 dk her sürümde | — | — | — | — | — | **ikinci aşama** |
| C4 Nadi şodana, tutmasız | P4 | 3 | 520 | "burnun tıkalıysa atla" ile açılır; el konumu (parmaklar göze değmez; eller serbest değilse zihinde değiştirme seçeneği); sesli sayımlı turlar → sessiz turlar; tek burun deliğinden 4 al / 6 ver, tur 20 sn; tutma yok | — | — | — | 4:00 | 6:00 | **ikinci aşama** |
| C3 Vızıltılı nefes | P3 | 4 | 400 | öğretim, güvenlik ve sessiz seçenek, birinci tur (ipuçlu), titreşim, ikinci tur (yalnız "Al…"), sesin ardından sessizlik, anahtar 3 | — | — | 4:30 | 4:30 | 5:30 | ≤ 15 dk yazıldı (`ders1.lesson.json`) |
| C5 Sessiz nefes tanıklığı | P5 | 5 | 700 | iki duyurulu pencere (≤ 90 sn; duyuru bir kapı taşır, sonra karşılama); ikinci pencerede pad çekilir, yalnız bordun kalır | — | — | — | — | 5:00 | **ikinci aşama** |
| K Kapanış (gündüz, oturarak) | sabit | 99 | — | dönüş → nefes → sesler → parmaklar ve gerinme → gözler → oda → zaman → günlük hayata köprü → son cümle | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 | ≤ 15 dk yazıldı (`ders1.lesson.json`) |

Çapalar PLAN.v2 §B.4'tendir; ≤ 15 dk'da planlayıcının kurduğu gerçek süreler (hoc köşesi) çapadan sapar: 15 dk'da A 1:20, C1 4:49, C2 2:55, C3 4:10, K 1:43 (bkz. `timing.txt`). 16–30 dk artımları ölçülmüş sürelerle kurulduğunda 20 ve 30 dk çapaları da yeniden hesaplanır.

## 2. Giriş ve dolum sıraları (önek kuralı)

Planlayıcı artımları tek bir sıralı listeden alır (pilot `timing.py`): bir artım, sessizlikler pref iken hedefe sığıyorsa eklenir; ilk sığmayanda durulur. Bu yüzden plan(T) ⊆ plan(T+1). **≤ 15 dk'nın sırası sabittir** (aşağıdaki tablo) ve **16–30 dk'nın bütün artımları 500 ve üstü sıradadır**; böylece ikinci aşamada eklenen hiçbir artım ≤ 15 dk planlarını değiştirmez.

**Ek koşul (bu çalışmada ölçüldü):** 15 dk planında hedef ile pref sessizliklerle toplam arasındaki pay hoc köşesinde 1,8 sn, hoc-lo'da 10,1 sn, nes'te 12,8 sn'dir. Sıra 500'ün ilk artımı bundan kısa olursa 15 dk planına girer ve yayındaki 15 dk dosyası değişir. Kural: **ilk artım (sıra 500–519) ≥ 15 sn olmalı; en güvenlisi ilk artımın BR.orta + C4 tabanı (≈ 1 dk) olmasıdır** (sıra 520). Tek döngülük (10 sn) artım 520'den önce konmaz. Derleme testi bunu her ses ve hız köşesinde denetler.

### 2.1 ≤ 15 dk sırası (sabit; `ders1.lesson.json`)

| Sıra | Tür | Artım |
|---|---|---|
| 101 | C1 | c1.d1 (2 klip) |
| 102 | K | k.sesler |
| 108 | K | k.oda |
| 110 | C1 | c1.s2 (10 klip) |
| 120 | C1 | c1.ses |
| 140 | C1 | c1.uzunluk |
| 150 | C1 | c1.d4 (3 klip) |
| 160 | C1 | c1.d5 (2 klip) |
| 170 | C1 | c1.burun |
| 190 | C1 | c1.d7 (2 klip) |
| 200 | C1 | c1.d8 (3 klip) |
| 210 | C1 | c1.d9 (3 klip) |
| 250 | A | a.omuz |
| 260 | A | a.eller |
| 262 | K | k.zaman |
| 270 | A | a.kolay |
| 285 | C1 | c1.d12 |
| 290 | C1 | c1.d13 |
| 292 | K | k.say |
| 295 | blok | C2 tabanı (zorunlu klipleri) |
| 302 | C2 | c2.d2 (3 klip) |
| 305 | C2 | c2.d3 (4 klip) |
| 306 | C2 | c2.d4 (3 klip) |
| 315 | C2 | c2.d5 (3 klip) |
| 340 | C2 | c2.tur2 (5 klip) |
| 355 | A | a.karar |
| 365 | K | k.gun |
| 370 | C2 | c2.d8 |
| 375 | C1 | c1.d10 (3 klip) |
| 380 | C1 | c1.d11 |
| 385 | C1 | c1.d14 |
| 390 | C2 | c2.d9 |
| 397 | C2 | c2.sonra |
| 400 | blok | C3 tabanı (zorunlu klipleri) |
| 400.5 | C3 | c3.d3 (2 klip) |
| 401 | C3 | c3.agiz |
| 401 | C3 | c3.kisa |
| 402 | C3 | c3.titresim |
| 403 | C3 | c3.d4 |
| 404 | C3 | c3.d5 |
| 405 | C3 | c3.el |
| 410 | C3 | c3.d6 |
| 415 | C3 | c3.dogal |
| 420 | C3 | c3.d7 |
| 450 | C1 | c1.d15 |
| 455 | C1 | c1.d16 |
| 465 | C3 | c3.d8 |
| 470 | C3 | c3.d9 |

### 2.2 16–30 dk sırası (ikinci aşamada kesinleşir; önerilen yerleşim)

| Sıra | Artım | Neden |
|---|---|---|
| 500–519 | (boş bırakılır) | 15 dk payından küçük artım 15 dk planına girerdi |
| 520 | BR.orta + C4 tabanı (nadi şodana: açılış, el konumu, 2 sesli sayımlı tur, 1 sessiz tur, bırakma) | 16–19. dakikada girer; ≥ 20 dk'da ortadaki çıkış kapısı zorunlu (pilot check_plan) |
| 530–590 | C4'ün sessiz turları; C1, C2, C3'ün 30 dk genişletmeleri (ek ipuçlu ve sessiz döngüler, üçüncü vızıltı turu, "vızıltı turlarının arasına sessiz nefesler") | A.2.2 dikkat eğrisi: 19:45 |
| 600–690 | Varış ve Kapanış'ın 30 dk biçimleri (A 1:30, K 2:30 çapası) | kapaklar süreyle büyür |
| 700 | C5 tabanı (iki duyurulu pencere) | ≈ 24–25. dakikada girer (A.2.2: 22:30 ilk pencere) |
| 710–790 | C5'in karşılama ve dönüş ayrıntıları; genişletme klipleri (hızlı ses için) | 30:00'a sınır aşmadan ulaşmak (PLAN.v2 §B.3 test g) |

## 3. Anahtar cümleler (sabit)

1. "Alış kendiliğinden gelir; verişi sen uzatırsın." · `c1.anahtar1` · c1.anahtar1 · C1 sonu
2. "Alış gelir, veriş uzar." · `c2.anahtar2` · c2.anahtar2 · C2 sonu
3. "Veriş uzar." · `c3.anahtar3` · c3.anahtar3 · C3 sonu (30 dk'da C5'ten önce)

30 dk'da da üç kez söylenir (PLAN.v2 §C.4); C4 anahtar cümle taşımaz. Ardışık geçişler arası ≥ 90 sn (pilot H3).

## 4. İmge yayı (sabit; işitsel)

1. kendi nefesinin sesi (C1 c1.ses, C2 veriş sesi)
2. vızıltının dudaklarda, yüzde, göğüste titreşimi (C3)
3. sesin ardından kalan sessizlik (C3 sonu; 30 dk'da C5 pencereleri)

30 dk'da yayın son adımı C5'in pencereleridir: "sesin ardından kalan sessizlik" duyurulu, ≤ 90 sn'lik sessizliğe açılır; ikinci pencerede pad çekilir ve yalnız bordun kalır (PLAN.v2 Ders 1 kartı).

## 5. Müzik teması (sabit)

- Ton: Re. Nefes bloklarında (C1, C2, C4, C3) tanpura benzeri bordun (Re + La), uygulamanın kendi hattı (render.mjs); döngü nefes döngüsüne eşit: C1, C2 ve C4 10,000 sn; C3 13,000 sn. Melodi yok.
- Varış, Kapanış ve C5 pencerelerinde aynı tonda yumuşak pad (müzik A, ElevenLabs Music; ~60 BPM hissi istemde, ölçülür). 3, 5, 15 ve 30 dk'da aynı tema (PLAN.v2 §A.1).
- C5'in ikinci penceresinde pad çekilir, yalnız bordun kalır; pencere dönüşünden 2 sn önce dönüş tınısı.
- Doğa katmanı kapalı. Açık not: Ders 8'in imzası da "Re'de açık beşli bordun"; iki dersin tonu ya da tınısı Ders 8 yazılırken ayrıştırılmalı.

## 6. 30 dakikalık dikkat eğrisi (PLAN.v2 §A.2.2; VARSAYIM)

0:00 varış · 1:30 doğal nefes · 4:00 uzun verişe geçiş (sayılı) · 7:30 iç çekiş · 11:00 nadi şodana, sesli sayım · 14:00 nadi şodana, sessiz turlar · 17:00 vızıltılı nefes · 19:45 vızıltı turlarının arasına sessiz nefesler · 22:30 tanıklık, ilk pencere · 25:00 ikinci pencere, pad çekilir · 27:30 kapanış. En uzun değişimsiz aralık 3:30 (sınır 5 dk; pilot test k).

## 7. İkinci aşamada yazılacaklar (metinsiz liste)

- **BR.orta:** ortak açılış cümlesinin ortadaki biçimi (pilot Ders 2 `br.orta` kalıbı: "İstediğin an gözlerini açmak, kıpırdamak ya da dersi bitirmek senin elinde." + bakış serbest + dayanak); Ders 1'de dayanak oturma yüzeyidir.
- **C4 Nadi şodana:** Sanskritçe ad seste bir kez ("nadi şodana", PLAN.v2 §C.7); "burnun tıkalıysa atla"; el konumu parmaklar göze ve yüze değmeden; eller serbest değilse zihinde değiştirme seçeneği; sayım 4/6; tutma yok (güvenlik §11.C isteğe bağlı satırı); "başın dönerse normal nefese dön" (her nefes bloğunda olduğu gibi).
- **C5:** iki duyurulu pencere (duyuru bir kapı taşır: "gözlerini açmak da olur" kalıbı), karşılama klipleri; son 60 sn'ye pencere düşmez (pilot check_plan e).
- **C1, C2, C3 genişletmeleri:** 30 dk çapası C1 6:00, C2 3:30, C3 5:30; ek ipuçlu, yalnız "Al…" ve sessiz döngüler; ≤ 20 sn sessizlik kuralı pencere dışında sürer.
- **A ve K 30 dk biçimleri:** A 1:30, K 2:30; yeni klipler "-(y)abil-" ≤ 3 / 60 sn sınırını korur.
- **Testler:** her ses köşesinde 3 ve 5–30 dk'nın her dakikası (pilot + D1 denetimleri); 30:00'a sınır aşmadan ulaşma (test g); ≥ 20 dk ortada hatırlatma; 21. dakikadan sonra iki ardışık düzlük yok (pilot T2).

