# Metin kapısı taslağı · B1a bildirim cümleleri ve Y1 ekran cümleleri

Tarih: 2026-09-30. Durum: **taslak; sahip onayı ve iki bağımsız model incelemesi bekliyor** (plan §6 "Metin kapısı").
`app/` ve `docs/` değişmedi; git kullanılmadı. Karakterler Python `len` ile sayıldı. "Denetim" sütunu yasak kök
taramasıdır: sağlık iddiası, suçlama, baskı, izlenme, parantez, sayı sözcüğü, bir yan cümlede iki "ve", 30/110 sınırı.
Makine taraması dil incelemesinin yerine geçmez.

Okunanlar: `PLAN.v1.md` §1, §2, §3.A, §5, §6; `app/src/lib/moduleRemind.js`, `notifyAll.js`, `notifyApply.js:60-70`,
`notifyPlan.js` `TEXTS`, `reminders.js`, `sources.js`, `modules/registry.js:105-138`, modül manifestleri;
`kaynak-dogrulama.md` §1–2; `arastirma/nef-bildirim.md` §3, §10.5; `Y1_KOD_RAPORU.md` §3, §6; `screens/Breath.jsx:500-530`;
`lib/breath.js`; `lib/breathMix.js:1-60`. `reminders.js`'te bildirim cümlesi yok; ton için yalnız `notifyPlan.js` `TEXTS`
okundu, cümleleri kopyalanmadı.

---

## Görev 1 · B1a: modül hatırlatmalarının cümleleri

### 1.1 Hangi modül hangi anahtarla hatırlatma alır

Plan §A.1 tablosu ve `moduleRemind.js` birlikte:

| Modül | textKey | Kim kurar | Not |
|---|---|---|---|
| routine, blink, snake, track, tek-bakis, quick-look, fark-ettin, notice | `remind.<id>` | `planModuleReminders` 1. bölüm | `move`, 09.00–21.00. routine Ana sayfayı, yani yolu açar |
| yoga, dalga, gokyuzu, yon | `remind.<id>` | aynı | `calm`, 08.00–22.00. Dalga uyku kipi hatırlatılmaz |
| yol (`path`) | `remind.path` | aynı, `PATH_REMIND` | günde 1 saat, Ana sayfa |
| breath, mola, water, walk | 1. saat 74xx, bugünkü `TEXTS`; 2. ve 3. saat `nudge.<type>` | `planNotifications` + `planModuleReminders` 2. bölüm | legacy türler `remind.<id>` üretmez (`moduleRemind.js` 1. bölüm `legacy`'yi atlar). walk modülü B3'te gelir, tür bugün var |
| iki ya da daha çok modül | `remind.merged` | `notifyAll.js:38`, `:272` | Ana sayfayı açar, görünür bilim satırı yok, ilk modülün `evidence`'ı |
| weekly, daily, reading, who5, alarm, awareness, emekliler, breath-count | yok | — | plan tablosunda "yok" ya da hiç anılmıyor |

Metin bağlanmadan kurulum olmaz: `notifyApply.js:65-66` yalnız `textKey` taşıyan bildirimi atlar.

### 1.2 Modül cümleleri (`remind.<id>`)

Her satır tek başına bir bildirimdir; güne göre sırayla döner. Kaynak sütunu o cümleye bağlanan `evidence` anahtarıdır.
Yalnız `sources.js`'te `pmid` ve `doi` ile duran, koşulsuz (`only` yok) anahtarlar yazıldı.
#### `remind.path` · Bugünün yolu

Pencere: move 09.00–21.00; Ana sayfa. Kaynak havuzu: kodda `PATH_REMIND.science` boş (moduleRemind.js:42); öneri `singh2024`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| YL1 | Bugünün yolu hazır | Birkaç dakikan varsa yola başlayabilirsin. Duraklar sırayla açılır. | 18 | 67 | `singh2024` | temiz |
| YL2 | Yola başlamak ister misin? | Bugünkü duraklar Ana sayfada. Seçim senin: şimdi ya da biraz sonra. | 26 | 67 | `singh2024` | temiz |
| YL3 | Günün yolu | İlk durak kısa. Dokun, oradan birlikte başlayalım. | 10 | 50 | `singh2024` | temiz |

#### `remind.routine` · Göz egzersizi

Pencere: move; Ana sayfa (yol) açılır. Kaynak havuzu: `talens2022`; `kim2020` yalnız yolda Göz kırpma grubu olduğu için.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| GE1 | Göz egzersizi | Birkaç dakikalık göz hareketleri hazır. Dokun, Ana sayfadan başla. | 13 | 66 | `talens2022` | temiz |
| GE2 | Kısa bir göz turu | Ekrandan başını kaldır. Bugünkü göz hareketleri birkaç dakika sürer. | 17 | 68 | `talens2022` | temiz |
| GE3 | Göz hareketleri | İstersen önce uzağa bak, sonra egzersize geç. Dokunman yeter. | 15 | 61 | `kim2020` | temiz |

#### `remind.blink` · Göz kırpma

Pencere: move. Kaynak havuzu: `kim2020`, `wolffsohn2025`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| GK1 | Göz kırpma egzersizi | Yaklaşık 2,5 dakika sürer. Dokun, rehberli kırpma başlasın. | 20 | 59 | `kim2020` | temiz |
| GK2 | Kısa bir kırpma arası | Ekrandan başını kaldır, yavaşça kırp. Egzersiz birkaç dakika sürer. | 21 | 67 | `wolffsohn2025` | temiz |
| GK3 | Kırpma egzersizi | Birkaç dakikan varsa egzersiz hazır. Şimdi ya da sonra, sen seç. | 16 | 64 | `wolffsohn2025` | temiz |

#### `remind.snake` · Yılan

Pencere: move. Kaynak havuzu: modüle uyan anahtar yok; genel seçenek `bell2023` (soru 3).

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| YI1 | Yılan oyunu hazır | Klasik oyun, kısa bir tur. Dokun, oyun başlasın. | 17 | 48 | `bell2023` | temiz |
| YI2 | Bir el Yılan? | Kısa bir oyun arası. Dokun, yeni bir tur başlasın. | 13 | 50 | `bell2023` | temiz |
| YI3 | Yılan | Birkaç dakikalık bir oyun ister misin? Seçim senin. | 5 | 51 | `bell2023` | temiz |

#### `remind.track` · Çemberler

Pencere: move. Kaynak havuzu: modüle uyan anahtar yok; genel seçenek `bell2023`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| CE1 | Çemberler hazır | Parlayan merceği gözünle takip et. Kısa bir tur yeter. | 15 | 54 | `bell2023` | temiz |
| CE2 | Kısa bir Çemberler turu | İstersen şimdi bir tur. Dokun, çemberler başlasın. | 23 | 50 | `bell2023` | temiz |
| CE3 | Çemberler | Gözle izleme pratiği hazır. Seçim senin: şimdi ya da sonra. | 9 | 59 | `bell2023` | temiz |

#### `remind.tek-bakis` · Tek Bakışta

Pencere: move. Kaynak havuzu: modüle uyan anahtar yok (Chung 2004, Yu 2010 sources.js'te yok); genel `bell2023`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| TB1 | Tek Bakışta | Harfler kısa süre görünür. Tek bakışta kaç tanesini tanırsın? | 11 | 61 | `bell2023` | temiz |
| TB2 | Kısa bir bakış turu | Tek Bakışta hazır. Birkaç dakikan varsa dokun, başla. | 19 | 53 | `bell2023` | temiz |
| TB3 | Tek Bakışta hazır | Gözünü ortada tut, harfleri tanı. İstersen şimdi bir tur. | 17 | 57 | `bell2023` | temiz |

#### `remind.quick-look` · Hızlı Bakış

Pencere: move. Kaynak havuzu: modüle uyan anahtar yok; genel `bell2023`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| HB1 | Hızlı Bakış | Kısa bir dikkat turu hazır. Dokun, birkaç dakikada biter. | 11 | 57 | `bell2023` | temiz |
| HB2 | Bir dikkat turu | Hızlı Bakış hazır. Birkaç dakikan olduğunda dokunman yeter. | 15 | 59 | `bell2023` | temiz |
| HB3 | Hızlı Bakış hazır | Ekranda beliren şeyleri yakala. Birkaç dakikalık bir tur yeter. | 17 | 63 | `bell2023` | temiz |

#### `remind.fark-ettin` · Fark Ettin mi?

Pencere: move. Kaynak havuzu: modüle uyan anahtar yok; genel `bell2023`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| FE1 | Kalabalık caddede bir tur | Caddede bir görev, sonra birkaç soru. İstersen şimdi başla. | 25 | 59 | `bell2023` | temiz |
| FE2 | Cadde turu hazır | Birkaç dakikalık bir dikkat oyunu. Dokun, oyun başlasın. | 16 | 56 | `bell2023` | temiz |
| FE3 | Bir dikkat oyunu | Kalabalık caddede kısa bir görev hazır. Seçim senin. | 16 | 52 | `bell2023` | temiz |

#### `remind.notice` · Bugünün görevi

Pencere: move. Kaynak havuzu: modüle uyan anahtar yok; genel `bell2023`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| BG1 | Bugünün görevi | Bugün etrafında aranacak küçük bir şey var. Dokun, görevi aç. | 14 | 61 | `bell2023` | temiz |
| BG2 | Küçük bir görev | Ekrandan başını kaldır, etrafına bak. Bugünün görevi hazır. | 15 | 59 | `bell2023` | temiz |
| BG3 | Etrafına bir bak | Bugünün görevi hazır. Gün içinde bulduklarını sonra kaydedersin. | 16 | 64 | `bell2023` | temiz |

#### `remind.yoga` · Yoga

Pencere: calm 08.00–22.00. Kaynak havuzu: `moszeik2025`; `luu2024` (finding alanı yok); `radin2025` koşullu, girmez.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| YG1 | Yoga dersi hazır | Sesli bir ders seni bekliyor. Rahat bir yer bul, gerisini ders anlatır. | 16 | 71 | `moszeik2025` | temiz |
| YG2 | Biraz yoga | İstersen kısa bir ders seç. Dersi istediğin an bitirebilirsin. | 10 | 62 | `luu2024` | temiz |
| YG3 | Yoga | Sesli bir ders ister misin? Süresini sen seçersin. | 4 | 50 | `moszeik2025` | temiz |

#### `remind.dalga` · Dalga

Pencere: calm; uyku kipi hatırlatılmaz. Kaynak havuzu: modüle uyan anahtar yok (doğa sesi kaynakları müziğe uymaz; de Witte 2019 sources.js'te yok); genel `bell2023`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| DA1 | Dalga | Birkaç dakikalık bir ses arası. Sakin, Güç ya da Motivasyon: seçim senin. | 5 | 73 | `bell2023` | temiz (Sakin mod adı; ı/i katlaması yanlış alarm) |
| DA2 | Kısa bir ses arası | Kulaklığın yakındaysa tak. Dalga hazır, birkaç dakika yeter. | 18 | 60 | `bell2023` | temiz |
| DA3 | Dalga hazır | Birkaç dakika yalnız dinle. Dokun, sesi başlat. | 11 | 47 | `bell2023` | temiz |

#### `remind.gokyuzu` · Gökyüzü molası

Pencere: calm. Kaynak havuzu: `yamashita2021`, `talens2022`; `martens2026` kişi sayısı doğrulanınca.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| GY1 | Gökyüzü molası | Ekrandan başını kaldır, 2 dakika gökyüzüne bak. | 14 | 47 | `yamashita2021` | temiz |
| GY2 | 2 dakika gökyüzü | Bir pencere ya da balkon yeter. Dokun, molayı birlikte yapalım. | 16 | 63 | `talens2022` | temiz |
| GY3 | Uzağa, yukarıya | Ufka ve gökyüzüne 2 dakika bakmak ister misin? Dokun, başlayalım. | 15 | 65 | `yamashita2021` | temiz |

#### `remind.yon` · Yön

Pencere: calm. Kaynak havuzu: modüle uyan anahtar yok (öz-şefkat kaynağı sources.js'te yok); genel `bell2023`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| YN1 | Yön | Kendine birkaç dakika ayır. Kısa bir yazı egzersizi hazır. | 3 | 58 | `bell2023` | temiz |
| YN2 | Kendine bir soru | Yön'de kısa bir egzersiz var. Hazır hissettiğinde dokun. | 16 | 56 | `bell2023` | temiz |
| YN3 | Yön hazır | Dışarıdan bak ya da Ayna: bugün hangisi? Seçim senin. | 9 | 53 | `bell2023` | temiz |

### 1.3 Birleşik bildirim (`remind.merged`, iki modül)

Adlar yer tutucuyla gelir, ek almaz; bu yüzden ses uyumu gerekmez. Gövde uzunluğu en uzun adla sayıldı.

| # | Başlık | Gövde kalıbı | B | G (en uzun adla, {A}={B}=14) | Kaynak | Denetim |
|---|---|---|---|---|---|---|
| BR1 | 2 hatırlatma bir arada | {A} ve {B} hazır. Hangisiyle başlarsın? | 22 | 61 | ilk modülün `evidence`'ı (§A.4 (2)); kendi anahtarı yok | temiz |
| BR2 | Sırada 2 kısa pratik | {A} ile {B} hazır. Dokun, Ana sayfadan birini seç. | 20 | 72 | ilk modülün `evidence`'ı (§A.4 (2)); kendi anahtarı yok | temiz |

Ad tablosu (öneri; `{A}` ve `{B}` bundan doldurulur):

| Modül | Ad | Karakter |
|---|---|---|
| `routine` | Göz egzersizi | 13 |
| `blink` | Göz kırpma | 10 |
| `snake` | Yılan | 5 |
| `track` | Çemberler | 9 |
| `tek-bakis` | Tek Bakışta | 11 |
| `quick-look` | Hızlı Bakış | 11 |
| `fark-ettin` | Fark Ettin mi? | 14 |
| `notice` | Bugünün görevi | 14 |
| `yoga` | Yoga | 4 |
| `dalga` | Dalga | 5 |
| `gokyuzu` | Gökyüzü molası | 14 |
| `yon` | Yön | 3 |
| `path` | Bugünün yolu | 12 |

### 1.4 Legacy türlerin ek saatleri (`nudge.<type>`): **ADAY**, soru 1'e bağlı

Plan ek saatlerin metnini yazmıyor (soru 1). Sahip "yeni cümle" derse bunlar kullanılır. Walk cümlelerinde rakam yok;
`notifyPlan.js` kilit ekranı kuralı bunu istiyor.
#### `nudge.breath` · Nefes

Pencere: 09.00–21.00; breath-1 açılır. Kaynak havuzu: `fincham2023`, `laborde2022`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| NF1 | 1 dakika nefes | Yavaş al, uzun ver. Dokun, 1 dakikalık nefes başlasın. | 14 | 54 | `laborde2022` | temiz |
| NF2 | Omuzlarını bırak | 1 dakikalık nefes hazır. Gerisini birlikte sayarız. | 16 | 51 | `fincham2023` | temiz |
| NF3 | Nefes | 1 dakika yeter. Dokun, yavaş nefes birlikte başlasın. | 5 | 53 | `laborde2022` | temiz |

#### `nudge.mola` · Mola

Pencere: 09.00–21.00. Kaynak havuzu: `talens2022`, `morris2020`, `galinsky2007`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| ML1 | 1 dakikalık mola | Kalk, pencereden uzağa bak. Sonra kaldığın yerden sürdürürsün. | 16 | 62 | `talens2022` | temiz |
| ML2 | Uzağa bir bak | Pencereden en uzak noktayı bul. 1 dakika orada kal. | 13 | 51 | `talens2022` | temiz |
| ML3 | Kalk, biraz gerin | Omuzlarını aç, sonra uzağa bak. Dokun, molayı birlikte yapalım. | 17 | 63 | `morris2020` | temiz |

#### `nudge.water` · Su

Pencere: 09.00–18.00. Kaynak havuzu: `stout2022`, `desai2026` (düzeltme PMID 42624152 açılmadan girmez).

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| SU1 | Bir yudum su | Bardağın yakındaysa birkaç yudum iç. İstersen dokunup kaydet. | 12 | 61 | `stout2022` | temiz |
| SU2 | Su bardağın nerede? | Suyunu tazelemek için uygun bir an olabilir. | 19 | 44 | `stout2022` | temiz |
| SU3 | Su | Suyunu yanına al. Dokununca kaydı birlikte yaparız. | 2 | 51 | `stout2022` | temiz |

#### `nudge.walk` · Yürüyüş

Pencere: 09.00–21.00; rakam yok (kilit ekranı). Kaynak havuzu: `klasnja2019`, `tucker2007`, `sturm2020`.

| # | Başlık | Gövde | B | G | Kaynak (`sources.js`) | Denetim |
|---|---|---|---|---|---|---|
| YR1 | Biraz yürüyelim mi? | Koridorda ya da sokakta birkaç dakika. Sonra kaldığın yerden sürdürürsün. | 19 | 73 | `klasnja2019` | temiz |
| YR2 | Yürüme arası | Kalk, koridorda ya da dışarıda kısa bir tur at. | 12 | 47 | `klasnja2019` | temiz |
| YR3 | Hava almaya ne dersin? | Birkaç dakikalık yürüyüş hazır. İçeride de olur, dışarıda da. | 22 | 61 | `klasnja2019` | temiz |

### 1.5 Bağlanan anahtarların görünür bilim satırı (`finding`, ≤ 100)

Görünen bilim satırı günde en çok bir bildirimde çıkar; o zaman gövde ≤ 160 olur (plan §A.6). `finding`'i olmayan anahtar
yalnız dokununca açılan kartı taşır.

| Anahtar | `finding` | Karakter |
|---|---|---|
| `bell2023` | yok (görünen bilim satırı olamaz, yalnız kart) | — |
| `fincham2023` | 12 denemede (785 kişi) nefes çalışması, algılanan streste küçük–orta azalmayla ilişkiliydi. | 91 |
| `kim2020` | 41 kişilik kontrolsüz bir çalışmada eksik kırpma oranı 4 haftada %54'ten %34'e indi. | 84 |
| `klasnja2019` | yok (görünen bilim satırı olamaz, yalnız kart) | — |
| `laborde2022` | 223 çalışmalık bir incelemede kalp atışı değişkenliği yavaş nefes sırasında arttı. | 82 |
| `luu2024` | yok (görünen bilim satırı olamaz, yalnız kart) | — |
| `morris2020` | yok (görünen bilim satırı olamaz, yalnız kart) | — |
| `moszeik2025` | 362 kişilik 2 aylık bir denemede 11 dakikalık yoga nidranın bekleme grubuna göre etkisi küçüktü. | 96 |
| `singh2024` | yok (görünen bilim satırı olamaz, yalnız kart) | — |
| `stout2022` | 85 kişilik bir denemede az su içmenin başlıca nedeni unutmaktı (%60). | 69 |
| `talens2022` | yok (görünen bilim satırı olamaz, yalnız kart) | — |
| `wolffsohn2025` | 98 kişilik bir denemede en uygun düzen günde 3 kez 15 tekrar çıktı. | 67 |
| `yamashita2021` | yok (görünen bilim satırı olamaz, yalnız kart) | — |

### 1.6 Sorular (sahip)

1. **Ek saatler bugünkü metni mi kullanır?** Plan §5.5 madde 1 ek saatin kimliğini, zarını ve dokunuşunu yazıyor, metnini
   yazmıyor. Madde 6'daki "bugünkü metinler" hangi bildirimi kapsıyor, açık değil. Seçenek A: bugünkü `TEXTS`,
   `textFor(type, key, TYPE_INDEX[type] + slot + 1)` ile. Kaydırma şart, yoksa aynı gün 74xx ile aynı cümle gelir.
   Seçenek B: §1.4'teki aday cümleler. Önerim A: deney türünün sesi değişmez, sahip onayı gereken yeni cümle azalır.
2. **Kaynağı olmayan 8 modül:** snake, track, tek-bakis, quick-look, fark-ettin, notice, dalga, yon. `sources.js`'te bu
   modüllere uyan anahtar yok. `registry.js:131` en az bir anahtar istiyor; yoksa bu modüllerin `remind`'i düşer ve
   kart çıkmaz. Seçenek: genel `bell2023` (`nef-bildirim.md` §3.6 "Modül hatırlatması" satırı) ya da her modül için yeni
   kaynak, kanıt kapısından geçerek. Tablolarda `bell2023` geçici olarak yazıldı. Dalga için doğa sesi kaynakları
   (`buxton2021`, `fan2024`, `alvarsson2010`) uymaz: Dalga müzik çalıyor.
3. **Yolun kaynağı:** `moduleRemind.js:42` `PATH_REMIND.science` boş; bildirimin `evidence`'ı `null` olur. Plan "her
   hatırlatma bir kaynak taşır" diyor (§A.6). Öneri `singh2024`, alışkanlık oluşumu. `finding` alanı yok.
4. **Üç ya da daha çok modül:** günlük tavan taşınca fazlası son gruba eklenir (`notifyAll.js:230`); "{A} ve {B}" yetmez.
   Aday: başlık "Birkaç hatırlatma bir arada" (27), gövde "Bugünkü pratiklerin Ana sayfada hazır. Dokun, birini seç." (57).
5. **"Fark Ettin mi?" adı:** soru işareti birleşik gövdede cümleyi böler; "fark ettin" kökü izlenme süzgecine takılabilir.
   Tekli cümlelerde adı kullanmadım. Birleşik için seçenek: "Fark Ettin mi" (işaretsiz) ya da "Cadde oyunu".
6. **Yoga ve meditasyon:** modül "Yoga ve Meditasyon". `radin2025` yalnız meditasyonda geçerli ve `remind` havuzuna
   giremiyor (`registry.js:138`). Meditasyon dersine ayrı cümle gerekirse ders düzeyinde hatırlatma ister; bu B1'de yok.
7. **Su:** `desai2026`'nın düzeltmesi (PMID 42624152) açılmadan su cümlesine bağlanmadı; üç cümle `stout2022`'de.
8. **İlk 14 gün kuralı:** "her modülün ilk bildirimi en güçlü kaynağı taşır" (§A.6). Görünür satır için `finding`
   gerekir. Bugünkü bağlarla yol, gökyüzü ve soru 2'deki 8 modül görünür satır taşıyamıyor; routine yalnız GE3'te
   (`kim2020`). Ek saatlerde mola ve walk da taşıyamıyor: `talens2022`, `morris2020`, `galinsky2007`, `klasnja2019`'da
   `finding` yok.
9. **routine ile Çalışma günleri:** ikisi de Ana sayfayı açar. `TEXTS.study` "Göz çalışması" diyor; routine cümleleri
   karışmasın diye "Göz egzersizi" ve "göz hareketleri" diyor.

---

## Görev 2 · Y1: metin kapısı bekleyen ekran cümleleri

### 2.1 Üç cümle (`Y1_KOD_RAPORU.md` §6, aynen)

| # | Yer | Cümle | Karakter |
|---|---|---|---|
| Y1-1 | Baloncuk, `components/TodayPath.jsx` (S0 kararı 8) | Sırada mola: 3 dk nefes, 2 dk dinlenme | 38 |
| Y1-2 | Site alt metni, `site/pages/index.html` | Haftalık E testinin olmadığı bir günün yolu: ısınma ve uzağa bakış tamam, sırada çemberler; ardından yakın–uzak ve 3 dakikalık nefesle başlayan 5 dakikalık mola; yolda E testi yok | 179 |
| Y1-3 | Site figcaption, aynı dosya | Yol ilk gün 8 dakikadır ve her gün bir adım büyür. Göz hareketleri, uzağa bakış, bakışla oynanan bir oyun ve 3 dakikalık nefesle başlayan 5 dakikalık mola sırayla gelir; tam yol yaklaşık 15 dakika sürer. E testi haftada bir gün yola eklenir. | 241 |

Taramada her yan cümlede en çok bir "ve" var; parantez, sağlık iddiası ve baskı yok. Sayılar rakamla. Tek istisna Y1-3'teki
"haftada bir gün"; rakam kuralı bildirimler için, bu site metni. Sahip isterse "haftada 1 gün" olur.

### 2.2 NIT #23: sınır cümlesi

- **Kanıt satırı nerede:** `app/src/screens/Breath.jsx:515`, `<p>{def.evidence}</p>`. Satır `:513-516`'daki
  `<details className="br-why">` içinde duruyor ve yalnız `mix` varken çiziliyor. "Bugünün ritmi" satırı `:520`'de.
  Kanıt metinleri `app/src/lib/breath.js` içinde: `:48` Sakin ritim, `:60` Eşit ritim, `:71` Uzun veriş, `:83` Karın
  nefesi, `:95` Burun değiştir, `:108` Vızıltı, `:121` Kutu. Yolda gelen aileler `app/src/lib/breathMix.js:43-48`
  (`TIER_FAMILIES`). `custom` yolda gelmez (`Breath.jsx:116`).
- **Sorun:** satırlar ailenin kalıbını anlatıyor, günün sürelerini anlatmıyor. `:71` "Günde 5 dk, 28 gün" diyor, yolda
  nefes 1–3 dk sürüyor. Saniyeler de her gün değişiyor (`breathMix.js:10-11`: "kanıt satırı ailenin mevcut metnidir").
- **Öneri (67 karakter):** **"Bulgu bu kalıbın çalışmalarından; bugünkü süreler ayrıca denenmedi."**
- **Yer:** `Breath.jsx:515`'in hemen altı, aynı `<details>` içinde. Kanıtla birlikte açılır, ilk görünümü değiştirmez.
- Rapordaki öneri "…bugünkü süreler çeşitleme içindir." sürelerin sınanmadığını söylemiyor; öneri bunu açıkça söylüyor.
  Cümle yedi ailenin hepsine uyuyor.
- Ek bulgu, kapsam dışı: `breath.js:71` "Balban 2023, n=108" yazıyor. `kaynak-dogrulama.md` §1'e göre kişi sayısı özette
  yok, tam metin gerekli.
