# Ana sayfa · kısayol halkaları · PLAN (ön örnek, tur 2)

Durum: ön örnek kodda, ayrı çalışma kopyasında (`halkalar.patch`). Ana dala girmedi, commit yok. Metinler TASLAK. 5 saniye
kapısı, metin kapısı ve sahip onayı yapılmadı. Cihazda bakılmadı. Tur 2: gözden geçirmenin 22 bulgusu ele alındı (§9);
tur 1'in iki yanlış ya da eksik çıkarımı düzeltildi (§7 "tek kaynak", §6 G9 klavye odağı).

## 1. Sahibin isteği (kelimesi kelimesine)

> "1. Bölüm yazan kısmın hemen üstüne İnstagram hayaleti gibi yuvarlak ama sen farklı birşey de düşünebilirsin yuvarlak
> olabilir bir kısım olacak. Mesela tamılanışdığıdna yoga olsun birisinde, 2 sinde dalga , 3. Sübee nefes olsun , 4. Sünde
> göz kırpma ve gzersizi tam  set olsun… 5  sn kuralı ve mükemmellik önemli"

VARSAYIM: "İnstagram hayaleti" = Instagram'ın öne çıkanlar halkaları; "tamılanışdığıdna" = tıklandığında.

## 2. Sahibin kararları (2026-10-03, seçeneklerden)

- 4. yuvarlak: "Tek ekran Tam set" (rota `routine-full`).
- 8. günden sonra: "Bölüm yazısının üstünde" (yolun başındaki "N. bölüm" hapının hemen üstü).
- Küçük ekran: "Başla kartı hep görünsün" (sığmazsa o sabah yuvarlaklar küçülür, yine sığmazsa o sabah gizlenir; Güne
  başla kartı kaydırmadan hep görünür).
- Yola sayım: "Bugünkü kural kalsın" (Pratikler'den açılınca nasıl sayılıyorsa öyle; kod değişmez).

## 3. Tasarım (tur 2)

**Yer.** İlk 7 günde Ana sayfanın ilk sahnesinde (`section.hf`), haplardan (hava, adım, alarm) ve görme uyarısından sonra,
"1. bölüm" yazısının hemen üstünde (`.hf-hero`'dan önce). 8. günden sonra yolun başında, "N. bölüm · N. gün" hapının hemen
üstünde (`.lp-box` içinde, `LongPath`'ten önce). İrisin üstüne konmaz.

**Öğe.** `<nav class="hk" aria-label="Kısayollar">` içinde `<ul role="list">` ve 2–4 düğme. Bileşen
`app/src/components/home/HomeRings.jsx`; stil `app/src/styles/home.css` sonunda (dosya Home.jsx'te zaten içe aktarılıyor).

**Dizilim (tur 2'de değişti; §8.1).** Dört halka içeriğin iki kenarına yaslı: ilk dairenin solu selam ve haplarla,
sonuncunun sağı Başla kartıyla aynı dikey çizgide (`justify-content: space-between`; düğme en az daire çapı genişliğinde,
etiket daireden genişse düğme genişler). Daha az halka (web'de Yoga yok; kartın modülü halkada tekrar etmez, aşağıda) aynı
aralıkla ortada: aralık = (içerik genişliği − 4 × çap) / 3. Aralarında çizgi ve numara yok; gün şeridi küçük, numaralı ve
çizgiyle bağlı dairelerden oluşuyor, halkalar büyük, çizimli ve adlı.

**Halkalar ve açtıkları.** Dokununca Home'un kendi `onStart`'ı çağrılır: günün ilk dokunuşu sayılır (`markDayTap`), yol
sayımı bugünkü kuraldır.

| Sıra | Ad (TASLAK) | Rota | Ne zaman | Çizim | Neden bu çizim |
|---|---|---|---|---|---|
| 1 | Yoga | `yoga` | yalnız iPhone uygulamasında (Ana sayfanın `onHome` kuralı) | yoldaki yoga durağının nilüferi (`TodayPath.jsx` `GLYPH.lotus`) | yolda yoga bu çizimle duruyor |
| 2 | Dalga | `dalga` | her zaman | lucide `Waves` | yoldaki Dalga bandı ve akşamın Dalga kartı bu çizimle (`LongPath.jsx`, `HomeGo.jsx`); modülün Pratikler simgesi `AudioWaveform` |
| 3 | Nefes | `breath` | her zaman | lucide `Wind` (nefes modülünün kendi simgesi) | ay çizimi Ana sayfada "mola" demek |
| 4 | Tam set | `routine-full` | her zaman | lucide `Dumbbell` (Egzersiz setlerinin simgesi) | göz çizimi Ana sayfada mola şeridinin ve Göz kırpma'nın; yolun Göz kırpma çizimi (`GLYPH.lid`) kullanılmadı |

**Kartla ikizlik kuralı (tur 2'de yeni; sahip onayı bekliyor, §8.2).** Büyük kartın açtığı modül o çizimde halkada
tekrar etmez (D9: bugünün ilk işi ekranda bir kez adıyla; Home.jsx'in var olan iki kuralıyla aynı ilke: yoldaki Dalga
bandı `dalga={sug.primary.kind !== 'dalga'}` ve "Nefes · 5 dk mola" bandı `altB`/`restPending`). Home.jsx `ringHide`:

| Kart | Çizilmeyen halka |
|---|---|
| Dalga (yol bitti ya da bugün yol yok; `sug.primary.kind === 'dalga'`) | Dalga |
| Göz molası "Nefes · 5 dk" (`sug.primary.kind === 'breath'`) ya da yolun Nefes durağı ("Yola devam et · Nefes") | Nefes |
| Yolun Yoga durağı (`nextGo.id === 'yoga'`) | Yoga |
| Öteki duraklar | hiçbiri |

Tam set yolun durağı değil (yolun tam set günü "Normal set", `routine-normal`), bu yüzden hep çizilir. Bedeli: halka sayısı
güne göre değişir (iPhone 3–4, web 2–3).

**Görünüm.** İnce nötr halka (1.5 px, `--ink-3` %42), halka ile disk arasında zemin şeridi, disk `--surface-2` üstüne
modülün tonuyla %8 boya, ortada çizim, altında ad (600 ağırlık, en az 0.75rem). Tonlar yoldaki bantların tonları
(`longpath.css .lp-band`): Yoga `--ok`, Dalga `--iris-1`, Nefes `--iris-2`. Tam set'in tonu nötr `--ink-2`, çizimi `--ink`
(koyu temada `--accent` ile `--iris-1` aynı renk, #19c2d1). Çizimlerin optik boyu: nilüfer ×1.18 (28 px), dambıl ×0.88
(21 px), öteki ikisi 24 px. Renkler yalnız `styles.css` tokenlarından. Mercek sarısı ve doygun kırmızı yok. Avatarın iris
halkası tekrarlanmadı. Halkada süre, "Başla" ya da eylem fiili yok.

**Durumlar.**
- Bugün yapılmadı: ince nötr halka, %8 boyalı disk.
- Bugün yapıldı (tur 2'de değişti; §8.6): disk modülün tonuyla dolar (%22), sağ altta tik rozeti (`--accent-grad` zemin,
  `Check`, `--bg` kenar; gün şeridinin "bitti" dili). Halka nötr kalır: renkli kalın halka gün şeridinde "bugün" demek
  (`.cs-d.now`). Çizim ve ad solmaz.
- Kilitli (yalnız Tam set; göz molası sürerken, Home'daki `eyeBudget.locked`): sağ altta koyu kilit rozeti (`--ink-2`
  zemin, `--bg` çizim ve kenar). Kilit tikten önce gelir: hem yapıldı hem kilitliyse kilit rozeti görünür, yapıldı diskin
  dolgusundan okunur. Dokunuş açık; App mola ekranını açar (bugünkü kural). Çizim solmaz (Pratikler'deki kilitli satır da
  solmuyor).
- "Yapıldı" yalnız kayıtlardan, bugün (`isSameDay`): Yoga `isYogaDone` (tamamlanan ders), Dalga `isDalga`, Nefes
  `type 'breath'` ve en az 60 sn (nefes modülünün `breathDone` kuralı), Tam set `type 'routine'` ve `setId 'full'`.
  `buildPath` ve `loadLater` çağrılmaz.

**Hareket.** Sürekli hareket yok. Basınca disk koyulaşır (her cihazda; "hareketi azalt" açıkken tek geri bildirim); hareket
isteyen cihazda halka ayrıca %96'ya iner (120 ms, `prefers-reduced-motion: no-preference`).

**Erişilebilirlik.** Her düğmenin adı (TASLAK): ad + durum eki: "Nefes", "Nefes, bugün yapıldı", "Tam set, mola bitince
açılır", "Tam set, bugün yapıldı, mola bitince açılır". "Göz kırpma" ile başlayan ad yok. Görünür ad, erişilebilir adın
başında. Klavyeyle gelen odakta 2 px vurgu çizgisi (`:focus-visible`). Ana sayfada kaydırma kabının alt payı
(`html:has(.hk) { scroll-padding-bottom: 70 + 12 px + güvenli alan }`): odaklanan öğe sekme çubuğunun ardında kalmaz
(WCAG 2.4.11). Dokunma alanı düğmenin tamamı (halka + ad).

## 4. Ölçüler

| Ekran | Dış çap | Çizim | Ad | En küçük aralık |
|---|---|---|---|---|
| Olağan (≥ 361 pt genişlik ve ≥ 741 pt boy) | 62 | 24 | 0.8rem (12.8 px) | 10 |
| Dar ya da kısa (≤ 360 pt genişlik ya da ≤ 740 pt boy) | 56 | 22 | 0.78rem | 8 |
| Çok kısa (≤ 600 pt boy, 320 × 568) | 50 | 20 | 0.75rem (12 px) | 8 |
| Küçük (ilk 7 gün, kart sığmıyorsa) | 46 | 19 | 0.75rem | 8 |
| Gizli (yine sığmıyorsa) | — | — | — | — |

Dört halkada aralık genişlikle büyür (ölçülen: 390'da 34, 430'da 47.3, 375×667'de 37, 320×640'ta 18.7, 320 "küçük"te
32 px); 2–3 halkada aynı aralık, grup ortada (390'da 34, 320×568'de 26.7).

**Dikey ritim.** İlk 7 günde hap → daire 16 px, etiketin tabanı → "1. bölüm" yazısının büyük harf üstü 14 px (satır
"1. bölüm"ün başlığı gibi okunsun). 8. günden sonra etiketin tabanı → "N. bölüm" hapının üstü 14 px.

**Küçük ekran kuralı (ilk 7 gün).** Güne başla kartının altı sekme çubuğunun üstünden en az 12 px yukarıda kalır. Home'un
var olan `fit()` akışına eklendi (yeni ölçüm döngüsü yok): ilk 7 günde `fit()` her çizimde, pencere boyu değişince ve sahne
boyu değişince (`ResizeObserver`) halkaları önce olağan boyda dener; kart sığmıyorsa `data-fit="sm"`, yine sığmıyorsa
`data-fit="off"` (gizli). Tur 2: sayfa kaydırılmışken verilmiş karar korunur (mobil tarayıcının araç çubuğu kaydırırken
görünüm boyunu değiştirir; karar gidip gelirse içerik zıplardı); karar sayfa en üstteyken yenilenir. 8. günden sonra satır
yolun başında olduğu için bu kural yok.

**Ön örnekte Home.jsx'te değişen yerler** (`halkalar.patch`):
1. `HomeRings` ilk 7 günde sahnede, görme uyarısından sonra ve `.hf-hero`'dan önce; 8. günden sonra `.lp-box` içinde
   `LongPath`'ten önce.
2. `fit()` ilk 7 gün dalında `fitRings` (yukarıdaki kural; `RINGS_GAP = 12`; kaydırılmışken karar korunur).
3. `ringHide`: kartla ikizlik kuralı (§3).
4. `settle()`: yolun başındaki halkalar da sekme çubuğunun kenarında kesilmesin diye `.hk-b` kesilme listesine girdi.
5. `settle()` "Tur 4" kuralına kart altı sınırı: sahne ekrandan uzunsa (320 × 568, 8. günden sonra) yol Başla kartının
   altına girmez. Temelde de "2. bölüm" hapı kartın alt kenarının üstüne biniyordu. Davranış değişikliği (§8.9).

## 5. Düzenek ve çekim

Düzenek: `duzenek/` (okuma-anlama düzeneği deseni; port 4390).

```
APP=<çalışma kopyası>/app bash duzenek/cek.sh <çıktı>                     # ön örnek, bütün senaryolar
bash duzenek/cek.sh <çıktı> temel G2,G2-iki,G2-kilit,G7,G9                 # ön örneksiz (deponun app'i)
APP=<çalışma kopyası>/app SCRIPT=denetim.mjs bash duzenek/cek.sh <çıktı>  # davranış denetimi (denetim.json)
```
Ortam: `JOBS` (aynı anda kaç sayfa), `SIZES` (ör. `390x844,320x568`), `THEMES` (`acik,koyu`).

- Home, App'teki gibi çizilir: `.screen has-tabbar` kabı, `TabBar`, App.jsx'in verdiği prop'lar. Kişi "Haydar"; hava hapı
  "Bornova 16°", Sağlık 506 adım, alarm 07.00, göz bütçesi deponun kendi koduyla (`eyeStatus`, kilitte
  `beginRest('budget')`).
- Geçmiş, yolun gerçek koduyla gün gün kurulur; her gün sonunda yolun bittiği yolun kendi koduyla denetlenir.
- Sayfa parametreleri (`home.jsx` başı): `s=gN` gün, `bugun=nefes,dalga,yoga,full` bugün Pratikler'den yapılanlar,
  `kilit=1` göz molası, `yol=breath|yoga|hepsi` bugünün yolu 08.00'de o modülün durağına dek (ya da tümü) yapıldı, `gec=1`
  haplar geç gelir (App'teki gibi: adım 300 ms, alarm 700 ms sonra), `ruzgar=1` rüzgârlı hava, `yazi=130` kök yazı boyu %130.
- iPhone taklidi: `lib/native.js`'i içe aktaran her dosya, `isIOSApp`'i sayfanın bayrağına (`?ios=1`) bağlayan sanal
  modülü görür. Uygulama dosyalarına dokunulmaz.
- Saat Playwright ile 2026-10-03 09.07 (Cumartesi), Europe/Istanbul. Boylar ve güvenli alanlar (VARSAYIM): 390×844
  (üst 47, alt 34), 393×852 ve 430×932 (59, 34), 375×812 (13 mini; 50, 34), 375×667 (SE 2./3. nesil; 20, 0), 320×568
  (SE 1. nesil; 20, 0); 320×640, 320×620, 320×660 gerçek iPhone boyu değil (kısa ekran sınırı ve "küçük" adımın ara boyları).
  Güvenli alan stili sayfa betiklerinden önce eklenir (`addInitScript`).
- Tur 2'de vite yapılandırması `--configLoader runner` ile okunur: varsayılan yükleyici geçici dosyayı en yakın
  `node_modules`'a, yani bağlantı üzerinden deponun `app/node_modules/.vite-temp`'ine yazıyordu.
- `olcum.json`'da her çekim için: kart altı ile sekme çubuğu arası ve 12 px kuralı, yatay taşma, kesik ya da iki satırlı ad,
  düğme boyu, satırın durumu ve yeri, sağ boşluk ve ilk dairenin solunun selam/hap/içerik kenarından farkı, dikey ritim,
  disk ve zemin rengi ve karşıtlığı, çizimin boyu, kartla ikiz halka, ilk 3 sn'nin kare kare izi (satırın durumu ve kartın
  yeri: zıplama), 390'da dokunuşların rotaları ve klavye odağının sekme çubuğunun üstünde olup olmadığı (iki tema).

VARSAYIMLAR (düzenek): iPhone senaryoları haplı (sahibin cihazı; en sıkışık hâl). Son bir saatte 320 adım (100'ün altı
yürüme önerisini açar; sahibin ekranında büyük kart "Başla"). Alarm her gün 07.00. Profil cevapları Y1 düzeneğindekiyle
aynı. Uygulama iOS Dinamik Yazı'yı izlemiyor (`-webkit-text-size-adjust: 100%`, yazı yakınlaştırma eklentisi yok); büyük
yazı web'de tarayıcının yazı boyu gibi kök boyla (%130) denendi.

## 6. Tur 2 sonuçları

Çekimler: `<scratchpad>/halka-cekim/tur2/` (262 ön örnek + 130 ön örneksiz kayıt, `olcum.json`; davranış denetimi
`denetim.json`; klavye odağı `odak/`). Kayıtlar dosya adına göre. Açık ve koyu tema her hücrede aynı çıktı.

Hücre: satırın durumu (dış çap) · Başla kartının altı ile sekme çubuğunun üstü arası (px); parantezde ön örneksiz çekim.
G2-iki: bugün Nefes ve Dalga; G2-yoga, G2-full: bugün Yoga ya da Tam set; G2-dort: dördü; G2-kilit: göz molası;
G2-full-kilit: Tam set yapıldı + mola; G2-nefes: yolun Nefes durağı sırada (kart "Yola devam et · Nefes"); G2-bitti: yol
bitti (kart Dalga); G3-yoga: yolun Yoga durağı sırada; W: web (Yoga yok, hap yok); -gec: haplar geç gelir; -buyuk: yazı %130.

| Senaryo | 390x844 | 393x852 | 430x932 | 375x812 | 375x667 | 320x640 | 320x568 |
|---|---|---|---|---|---|---|---|
| G1 | normal (62) · 119 | normal (62) · 115 | normal (62) · 195 | normal (62) · 84 | normal (56) · 44 | normal (56) · 26 | gizli · 40 |
| G2 | normal (62) · 128 (temel 223) | normal (62) · 124 (temel 219) | normal (62) · 204 (temel 299) | normal (62) · 93 (temel 188) | normal (56) · 50 (temel 136) | normal (56) · 32 (temel 118) | gizli · 46 (temel 46) |
| G2-iki | normal (62) · 141 (temel 235) | normal (62) · 137 (temel 231) | normal (62) · 217 (temel 311) | normal (62) · 106 (temel 200) | normal (56) · 101 (temel 188) | normal (56) · 54 (temel 141) | gizli · 69 (temel 69) |
| G2-kilit | normal (62) · 101 (temel 196) | normal (62) · 97 (temel 192) | normal (62) · 177 (temel 272) | normal (62) · 66 (temel 161) | normal (56) · 68 (temel 155) | normal (56) · 51 (temel 137) | gizli · 65 (temel 65) |
| G2-yoga | normal (62) · 141 | normal (62) · 137 | normal (62) · 217 | normal (62) · 106 | normal (56) · 101 | normal (56) · 54 | gizli · 69 |
| G2-full | normal (62) · 141 | normal (62) · 137 | normal (62) · 217 | normal (62) · 106 | normal (56) · 101 | normal (56) · 54 | gizli · 69 |
| G2-full-kilit | normal (62) · 101 | normal (62) · 97 | normal (62) · 177 | normal (62) · 66 | normal (56) · 68 | normal (56) · 51 | gizli · 65 |
| G2-dort | normal (62) · 141 | normal (62) · 137 | normal (62) · 217 | normal (62) · 106 | normal (56) · 101 | normal (56) · 54 | gizli · 69 |
| G2-nefes | normal (62) · 143 (temel 238) | normal (62) · 139 (temel 234) | normal (62) · 219 (temel 314) | normal (62) · 108 (temel 203) | normal (56) · 101 (temel 188) | normal (56) · 77 (temel 163) | gizli · 91 (temel 91) |
| G2-bitti | normal (62) · 95 (temel 189) | normal (62) · 91 (temel 185) | normal (62) · 171 (temel 265) | normal (62) · 60 (temel 154) | normal (56) · 84 (temel 171) | normal (56) · 67 (temel 153) | gizli · 81 (temel 81) |
| G3-yoga | normal (62) · 141 | normal (62) · 137 | normal (62) · 217 | normal (62) · 106 | normal (56) · 101 | normal (56) · 84 | normal (50) · 19 |
| G7 | normal (62) · 83 (temel 178) | normal (62) · 79 (temel 174) | normal (62) · 181 (temel 276) | normal (62) · 48 (temel 143) | normal (56) · 30 (temel 116) | gizli · 79 (temel 79) | gizli · 7 (temel 7) |
| G9 | normal (62) · 42 (temel 42) | normal (62) · 42 (temel 42) | normal (62) · 13 (temel 13) | normal (62) · 13 (temel 13) | normal (56) · 13 (temel 13) | normal (56) · 13 (temel 13) | normal (50) · -49 (temel -49) |
| W2 | normal (62) · 218 (temel 312) | normal (62) · 214 (temel 308) | normal (62) · 294 (temel 388) | normal (62) · 183 (temel 277) | normal (56) · 138 (temel 224) | normal (56) · 117 (temel 203) | normal (50) · 53 (temel 131) |
| W2-bitti | normal (62) · 184 | normal (62) · 180 | normal (62) · 260 | normal (62) · 149 | normal (56) · 172 | normal (56) · 151 | normal (50) · 87 |
| G2-gec | normal (62) · 128 (temel 223) | normal (62) · 124 (temel 219) | normal (62) · 204 (temel 299) | normal (62) · 93 (temel 188) | normal (56) · 50 (temel 136) | normal (56) · 32 (temel 118) | gizli · 46 (temel 46) |
| G7-gec | normal (62) · 83 (temel 178) | normal (62) · 79 (temel 174) | normal (62) · 181 (temel 276) | normal (62) · 48 (temel 143) | normal (56) · 30 (temel 116) | gizli · 79 (temel 79) | gizli · 7 (temel 7) |
| G2-ruzgar | normal (62) · 128 | — | — | — | — | normal (56) · 32 | — |
| G2-buyuk | küçük (46) · 30 | — | — | — | gizli · 27 | gizli · -10 | — |
| W2-buyuk | normal (62) · 157 | — | — | — | — | — | gizli · 54 |
| G7-kilit-rozet | normal (62) · 101 | — | — | — | — | — | — |

Ara boylar (rozetli ve koyu "küçük" adım dahil): G7 320×660 küçük (46) · 25 (temel 99); G7-kilit-rozet (bugün Dalga ve Tam
set, göz molası) 320×602 küçük (46) · 25, Dalga'da tik, Tam set'te kilit (yapıldı + kilitli); G2-iki 320×620 normal (56) ·
34 (temel 121); G2-full-kilit 320×620 normal (56) · 31. "Küçük" adım yine yalnız dar aralıklarda çıkıyor. Ara boy
taramasında (`SCAN=…`, `<scratchpad>/halka-cekim/tarama/`) çıktığı boylar: G7 + Tam set + mola 320×601, 603, 605 (607 ve
610'da olağan); G7-kilit-rozet 320×601, 602 (603'te olağan); G7 320×660. Hiç çıkmadığı taramalar: G2-iki, G2-full-kilit,
G2-dort 320×580–630 (590'a dek gizli, 600'den olağan); 7. gün + bugün Nefes ve Dalga 320×601–640 (hep olağan). Pratikte
satır ya olağan ya gizli (§8.4).

**Hepsinde.** Yatay taşma 0; kesik, iki satıra kırılan ya da bitişik ad yok; sayfa ve konsol hatası yok; kartla ikiz halka
yok (`ikiz` boş). Düğme boyları 62×83, 56×76, 50×69, 46×64 (yazı %130'da 62×87, 46×68 ve "Tam set" 57×68); hepsi ≥ 44.
Ad 12.8 / 12.48 / 12 px (yazı %130'da 16.64 / 15.6), ağırlık 600. Çizim: nilüfer 28/26/24/22, dalga ve rüzgâr 24/22/20/19,
dambıl 21/19/18/17 px.

**Hiza.** Dört halkada ilk dairenin solu selam, hap ve içerik kenarıyla aynı (fark 0), son dairenin sağı içerik kenarında
(sağ boşluk 0); tek istisna yazı %130 ve "küçük" adım (390): "Tam set" adı daireden geniş, sağ boşluk 5.6. Üç halkada iki
yanda eşit boşluk (390: 48 / 48; 320×568: 38.3 / 38.3), iki halkada (web, yol bitti) 390'da 96 / 96, 320×568'de
76.7 / 76.7.

**Dikey ritim.** İlk 7 gün: hap → daire 16 (≤ 740 boyda 14), etiketin tabanı → "1. bölüm" büyük harf üstü 14.3 (12.2,
11.9); "g" kuyruğunun altı → yazının üstü 8.3 (6.2, 5.9). 8. günden sonra: etiketin tabanı → "N. bölüm" hapı 14.3 / 14.2 /
13.9. Kart → ilk daire 8. günden sonra 57.7 (390, 393), 29 (375, 430, 320×640), 16 (320×568): bu, yolun başını sekme
çubuğunun kenarına göre yerleştiren var olan `settle()` kuralından; temelde kart → "N. bölüm" hapı da 60.7 / 32 / −30
(320×568'de hap kartın altına giriyordu). Halkalar hapın eski yerini alıyor (§9, bulgu 12).

**Renk.** Disk ile zemin karşıtlığı: açıkta yapılmadı 1.16–1.23 (tur 1'de ~1.03: disk zeminle aynıydı), yapıldı
1.31–1.56; koyuda yapılmadı 1.27–1.37, yapıldı 1.53–1.94. Tam set yapıldı: açıkta rgb(193,200,206), koyuda rgb(56,67,76);
Dalga yapıldı: rgb(185,223,229) / rgb(21,66,77) (artık aynı renk değil). Kilit rozeti zemine karşı 9.65 (açık) ve 11.06
(koyu); tur 1'de 1.18 ve 1.31.

**Dokunuş ve odak (390).** Dokunuşlar Home'un `onStart`'ına kendi rotasını veriyor: G2 `yoga, dalga, breath,
routine-full`; G2-kilit ve G2-nefes `yoga, dalga, routine-full`; G2-bitti `yoga, breath, routine-full`; G3-yoga `dalga,
breath, routine-full`; W2 `dalga, breath, routine-full`; W2-bitti `breath, routine-full`. Klavye odağı bütün 390
çekimlerinde (iki tema) görünür ve sekme çubuğunun üstünde: `solid 2px`, açıkta rgb(11,116,128), koyuda rgb(25,194,209).
G9'da (halkalar yolun başında) Tab ile odak gelince sayfa 434 px kayıyor; halkanın altı 406, sekme çubuğu 741
(`tur2/odak/G9-390x844-*.png`; tur 1'in `tur1/odak/G9-390x844-acik.png` karesinde odak çubuğun ardındaydı).

**Davranış denetimi (`denetim.json`).** G7 320×640 (satır gizli): sayfa 300 px kaydırılıp görünüm 640 → 720'ye uzayınca
karar aynı (`off`), kartın yeri aynı (424); sayfa en üstteyken uzayınca karar yenilendi (`''`, satır görünür). Basma izi:
"hareketi azalt" açıkken disk koyulaşıyor, dönüşüm yok; açık değilken disk koyulaşıyor ve halka `scale(0.96)`.

**Zıplama (ilk 3 sn, kare kare).** Halkanın durumu 31 çekimde ilk karelerde değişiyor; hepsi yazı tipi yüklenirken
(≤ 393 ms) ve hepsi küçükten büyüğe (gizli → olağan, küçük → olağan, gizli → küçük): yedek yazı tipi daha geniş, kart ilk
karede daha aşağıda. Örnek: G2 320×640 ilk kare gizli, 260 ms'de olağan; G7 375×812 ilk kare gizli, 66 ms'de olağan.
Temelde de kart aynı anda kayıyor (130 çekimin 123'ünde, yazı tipi gelince). Haplar geç gelince (`-gec`): G7 320×640'ta
satır önce görünür, haplar gelince (1039 ms) gizlenir; kart 51 px yukarı kayar (temelde aynı anda hapların kendisi kartı
35 px aşağı itiyor). Öteki boylarda haplar satırın kararını değiştirmiyor. Bkz. §8.5.

**Var olan durumlar (temelde de).** G7 320×568'de kart sekme çubuğuna 7 px (12 px kuralının altında; satır gizli, temelde
de 7). G9 320×568'de kart sekme çubuğunun 49 px altına uzanıyor (temelde de −49). Yazı %130'da 320×640'ta kart çubuğun
10 px altına uzanıyor (satır gizli; yazının kendisinden).

## 7. Testler

Çalışma kopyasında `npx vitest run --configLoader runner --no-cache` (tur 2 kodu): 191 dosyanın 191'i geçti; 2989 test
geçti, 5 todo (313 sn). Kalan test yok. Çıktı `<scratchpad>/halka-cekim/tur2/vitest-tam.txt`. İlgili 21 dosya (Home.*,
components/home, orphans, Home'u içe aktaran testler) ayrıca: 21/21, 295 geçti + 5 todo (`tur2/vitest-ilgili.txt`). Test
dosyalarına dokunulmadı. `--configLoader runner` ve `--no-cache`: vitest yapılandırma geçici dosyasını ve sonuç önbelleğini
deponun `app/node_modules`'ına yazmasın diye (çalışma kopyasının `node_modules`'ı oraya bağlantı); deponun `node_modules`'ında
07.50'den sonra değişen dosya yok (denetlendi).

**Tur 1'in "tek kaynak" çıkarımı düzeltmesi.** Tur 1 "tek kaynak testi geçiyor" diye halkaların güvende olduğunu söylüyordu;
bu yanlıştı. `Home.hero.test.jsx` "tek kaynak" testi 1. ve 2. günde cümle "… ve haftalık E testi." ile bittiği için
`continue` ile sayımı atlıyor; sayımı yalnız 9. günde yapıyor, o gün halkalar sahnede değil. Yani test halkaları hiç
kapsamıyor. Gözden geçirmenin yoklaması (tur 1 kodunda, web ve iPhone) bugün her gün oluşabilen üç ikiz buldu:
- (A) 1. gün, E testi ile Çemberler bitmiş: kart "Yola devam et · Nefes · 1 dk" (`breath-rest`) ve Nefes halkası (`breath`).
- (C) Yol bitmiş: kart "Dalga · İstersen Dalga ile gevşe" (`dalga`) ve Dalga halkası (`dalga`): aynı rotaya iki düğme.
- (D) Göz molası: kart "Nefes · 5 dk" (`breath-5`) ve Nefes halkası.

Tur 2'de kartla ikizlik kuralı (§3) bunları kaldırdı. Kanıt: yoklamanın kopyası tur 2 koduyla
(`<scratchpad>/halka-cekim/probe/ikiz.test.jsx`, çıktı `probe/sonuc.txt`; depoya girmez): A, B, C, D ve 1. gün başlangıcı ×
web ve iPhone, 10 durumun hiçbirinde ikiz yok; kartın adı sahnede bir kez (C'de "Dalga" iki kez, ikisi de kartın kendi
yazısı: başlık ve "İstersen Dalga ile gevşe"). Düzenekte de bütün çekimlerde `ikiz` boş: G2-kilit (kart "Nefes · 5 dk",
halkalar Yoga, Dalga, Tam set), G2-nefes (kart "Nefes · 2 dk"), G2-bitti (kart Dalga), G3-yoga (kart Yoga), W2-bitti
(web, 2 halka). Tek kaynak testinin halkaları kapsaması için test değişikliği gerekir; test dosyasına dokunulmadı (§8.2).

## 8. Açık sorular (sahibe)

1. **Dizilim (bulgu 1, 9).** Seçilen tasarım "sola dayalı, sabit aralık" diyordu; tur 1 çekimlerinde satır sağa doğru eksik
   ve hizası kaçmış okundu (390'da sağda 39.5 px, solda 3 px). Tur 2: dört halka iki kenara yaslı (selam, hap ve Başla
   kartıyla aynı dikey çizgiler), 2–3 halka aynı aralıkla ortada. Gün şeridinden ayrışma çizgisiz, numarasız, adlı ve
   büyük dairelerle korunuyor. Bu kararın değişmesi sahibin onayını istiyor; sabit aralığa dönülecekse sütun ve aralık
   genişliğe göre ayarlanmalı (gözden geçirmenin önerisi).
2. **Kartla ikizlik kuralı (bulgu 5, 8).** Büyük kartın modülü halkada tekrar etmez (§3). Bedeli: halka sayısı güne göre
   değişir (iPhone 3–4, web 2–3); "Nefes" halkası göz molasında, yolun Nefes durağı sıradayken yok. Öteki seçenek: ikizliği
   açıkça kabul etmek (o zaman A, C, D geri gelir). İkisi de 5 saniye kapısında sorulsun. Kural kalırsa "tek kaynak"
   testinin halka satırını da sayması önerilir (sahibin onayıyla, test değişikliği).
3. **Göz molası sabahı (bulgu 5).** Kural sonrası molada iki ayrı Nefes yok (halkalar Yoga, Dalga, Tam set; Tam set'te kilit
   rozeti). Gözden geçirmenin en sade seçeneği: molada satırı hiç göstermemek (ekrandan uzak durulması istenen anda üç ek
   dokunma hedefi yok, kilit rozetine de gerek kalmaz). Uygulanmadı; seçilen tasarımın "kilitli" hâli korunuyor. Sahibe.
4. **iPhone SE 1. nesil (320×568) ve "küçük" adım (bulgu 6).** Haplı ilk 7 günde halkalar 320×568'de görünmüyor (G1, G2,
   G2-iki, G2-kilit, G2-yoga, G2-full, G2-full-kilit, G2-dort, G2-nefes, G2-bitti, G7, -gec; yalnız G3-yoga'da üç halkayla
   görünüyor; hapsız web'de görünüyor); 320×640'ta 7. günde de gizli. Sahibin "Başla kartı hep görünsün" kuralı gereği.
   Yeni boylarda (375×667 SE 2./3. nesil, 375×812, 393×852, 430×932) bütün ilk hafta senaryolarında görünüyor (yazı %130
   hariç). "Küçük" adım yalnız dar ara boylarda çıkıyor (§6). Gözden geçirmenin ara yolu (uygulanmadı; sahibin kararı
   "gizlenir" diyor): kart sığmayınca satırı gizlemek yerine 8. gün sonrasındaki gibi
   `.lp-box`'un başına, kartın altına çizmek; kişi kaydırınca bulur, kart yerinde kalır. Seçenek olarak soruluyor.
5. **Açılışta zıplama (bulgu 15).** Ölçüldü (§6): yazı tipi yüklenirken sınırdaki boylarda satır ilk karelerde küçük ya da
   gizli, sonra olağan (31 çekimde, ≤ 393 ms; temelde de kart aynı anda kayıyor). Haplar geç gelince yalnız G7 320×640'ta
   satır görünüp gizleniyor (kart 51 px yukarı, hapların kendi kayması ile aynı karede). Kural gereği; kod değişmedi.
   Seçenekler: (a) olduğu gibi (cihazda yerel yazı tipiyle süre kısalabilir; bakılmadı); (b) karar yazı tipleri yüklenince
   verilsin, o ana dek satır yer tutmadan gizli kalsın (yalnız açılma; büyük ekranlarda satır ilk karede değil ~0.1 sn sonra
   gelir); (c) 4'teki "yolun başına taşı" seçeneği (gizlenme kartı oynatmaz). Cihazda bakılmalı.
6. **"Yapıldı" dili (bulgu 13, 17).** Tur 2: disk modülün tonuyla dolar + tik; halka nötr (tur 1'de renkli kalın halka gün
   şeridinin "bugün" halkasıyla aynıydı: G2-iki koyu). Tik rozeti gün şeridinin "bitti" dairesiyle aynı dilde (seçilen
   tasarımın kararı); halkalar "ikinci yapılacaklar listesi" gibi okunabilir mi? 5 saniye kapısında: "Bugün hangilerini
   yaptın?" ve "Halkalar ile gün daireleri aynı şey mi?". Okunmazsa rozet 16–18 px'e küçülüp nötr kenarlı yapılabilir.
   Yoga'nın tonu `--ok` (yoldaki yoga bandının tonu) başarı rengi; yapılmamışken de yeşil.
7. **Rüzgârlı hava (bulgu 21).** G2-ruzgar: hava hapında lucide `Wind` (gri) ve Nefes halkasında `Wind` (mavi) yan yana; aynı
   çizim iki anlamda. Nefes'te `Wind` kalsın öneriliyor (nefes modülünün kendi simgesi); gerekirse hava hapının rüzgâr
   çizimi değişir (SkyChip, ayrı iş; dokunulmadı). 5 saniye kapısında bu kareyle.
8. **Pratikler'den yapılan iş kahraman alanını değiştiriyor (bulgu 14; bilgi).** G2-iki ve temeli aynı: yolun hiçbir
   durağı yapılmamışken bugün Nefes ve Dalga yapıldığı için cümle yok ve kart "Yola devam et · Yeni" (`G2-iki-*-temel.png`).
   Halka kayıt yazmıyor; bu, Pratikler'den açılan işin bugünkü kuralı (sahip "Bugünkü kural kalsın" dedi). Halkalar bu işi
   tek dokunuşa indirdiği için daha sık görülecek; sahip kareyi görsün.
9. **`settle()` değişikliği (tur 1 §8.5).** 320×568'de 8. günden sonra yol Başla kartının altından başlıyor (temelde
   "2. bölüm" hapı kartın altına 30 px giriyordu). Halkalarla mı gelsin, ayrı iş mi?
10. **Metin:** "Yoga", "Dalga", "Nefes", "Tam set", erişilebilir ad ekleri ", bugün yapıldı" / ", mola bitince açılır" ve
    satırın adı "Kısayollar" TASLAK; metin kapısı ve sahip onayı gerekiyor.
11. **Tam set'in "yapıldı"sı** yalnız Tam setin kaydıyla (`setId 'full'`); yolun "Normal set" günü ya da yol grupları sayılmaz.
    **Tam set dokunuşu** göz kalibrasyonu isteyebilir (`routine` modülü `gates.gaze`; App.jsx `go`, var olan kural).
12. **Büyük yazı (yeni).** Kök yazı %130'da (web'de tarayıcı yazı boyu): 390'da satır "küçük" adıma iniyor ve "Tam set" adı
    daireden geniş (düğme 57×68); 375×667'de ve 320×640'ta gizli (320×640'ta kart yazının kendisinden çubuğun 10 px altına
    uzanıyor); web 390'da olağan. Uygulama iOS Dinamik Yazı'yı izlemiyor (VARSAYIM, §5).

## 9. Tur 2: gözden geçirme bulguları ve yapılanlar

Gözden geçirmenin 22 bulgusu (sırası gözden geçirmedeki gibi). Kanıt yolları `<scratchpad>/halka-cekim/tur2/` altında.

| # | Bulgu (kısaca) | Ne yapıldı | Kanıt |
|---|---|---|---|
| 1 | Satır sola dayalı, sağda 39.5 px boşluk; hizası kaçmış | Düzeltildi: dört halka iki kenara yaslı, 2–3 halka aynı aralıkla ortada (`.hk-row.n4 { space-between }`, öteki `center` + `(100% − 4 × çap) / 3` aralık; düğme en az çap genişliğinde). Seçilen tasarımdan sapma, sahibe §8.1 | `olcum.json` `sagBosluk` 0 (4 halka), 48/48 (3), 96/96 (2); `G2-390x844-*`, `W2-*`, `W2-bitti-*` |
| 2 | Tam set yapıldı = Dalga'nın rengi (koyu temada) | Düzeltildi: `.hk-b.full { --hk-tone: var(--ink-2) }`; ayrıca yapıldı dili disk dolgusu (17) | `G2-full-*`, `G2-dort-*`, `G2-full-kilit-*`; disk rgb(56,67,76) / Dalga rgb(21,66,77) (koyu) |
| 3 | Tam set açıkken devre dışı gibi; kilit rozeti silik | Düzeltildi: disk ötekilerle aynı tabanda (`--surface-2` + %8 ton), çizim `--ink`; kilit rozeti `--ink-2` zemin, `--bg` çizim ve kenar. Çizim solmuyor (Pratikler'deki kilitli satır gibi) | Rozet/zemin 9.65 (açık), 11.06 (koyu); tur 1'de 1.18, 1.31. `G2-kilit-*`, `G2-full-kilit-*` |
| 4 | 8. günden sonra klavye odağı sekme çubuğunun ardında | Düzeltildi: `html:has(.hk) { scroll-padding-bottom: calc(82px + env(safe-area-inset-bottom, 0px)) }`. Tur 1 raporundaki "odak görünür" G9 için yanlıştı | `odak/G9-390x844-*.png`: odak gelince sayfa 434 px kayıyor, halkanın altı 406 < çubuk 741 |
| 5 | Göz molasında iki ayrı Nefes girişi | Düzeltildi (kural 8 ile): molada Nefes halkası yok. "Molada satırı hiç gösterme" seçeneği uygulanmadı, sahibe §8.3 | `G2-kilit-*`, `G2-full-kilit-*`; `probe/sonuc.txt` D |
| 6 | 320×568'de ilk hafta hiç görünmüyor | Uygulanmadı (sahibin kararı "gizlenir"); gözden geçirmenin ara yolu (`.lp-box` başına çizmek) §8.4'te seçenek olarak. Yeni boylarda (375×667 vb.) görünüyor | §6 tablosu |
| 7 | Durumlar ve boylar çekilmemiş | Yapıldı: Yoga yapıldı, Tam set yapıldı, Tam set yapıldı + kilitli, dördü yapıldı, koyu ve rozetli "küçük", koyu odak, büyük yazı; 375×667, 375×812, 393×852, 430×932; G2-iki, G2-kilit (ve G2, G7, G9, G2-nefes, G2-bitti, W2, -gec) temel kareleri; `olcum.json`'a sağ boşluk ve sol fark | §6; `G2-yoga-*`, `G2-full-*`, `G2-full-kilit-*`, `G2-dort-*`, `G7-kilit-rozet-320x602-*`, `G7-320x660-*`, `G2-buyuk-*`, `W2-buyuk-*`, `odak/*-koyu.png`, `*-temel.png` |
| 8 | İlk görünümde ikiz (A, C, D); §7'nin "test geçiyor" çıkarımı | Düzeltildi: kartla ikizlik kuralı (`ringHide`, §3); §7 düzeltildi, A/C/D kanıtıyla yazıldı. Sahip onayı §8.2 | `probe/sonuc.txt` (10 durumda ikiz yok); `olcum.json` `ikiz` hep boş |
| 9 | Dairenin solu başlık ve haplardan 3–6 px içeride | Düzeltildi (1 ile): düğme genişliği = çap (ad daireden darsa) | `solFark` selam/hap/içerik 0 (4 halka, bütün boylar) |
| 10 | Simgelerin optik ağırlığı eşit değil | Düzeltildi: `--hk-k` nilüfer 1.18 (28 px), dambıl 0.88 (21 px), öteki 24 px; gözle karşılaştırıldı (`G2-390x844-acik`, `G2-ruzgar-390x844-acik`) | `olcum.json` `cizimPx` |
| 11 | Açık temada halka–boşluk–disk görünümü kayboluyor | Düzeltildi: disk tabanı `--surface-2` (iki temada); %8 sınırı korunuyor | Disk/zemin 1.16–1.23 (açık; tur 1 ~1.03), 1.27–1.37 (koyu) |
| 12 | Dikey ritim tutarsız | İlk hafta: hap → daire 16, etiket tabanı → "1. bölüm" 14 (satır bölümün başlığı gibi); 8. gün sonrası etiket tabanı → hap 14 (tur 1 kenar paylarıyla 22.3). Reddedilen kısım: 8. günden sonra kart → halka aralığını sabitlemek (ve `settle()` boşluğunu halka ile hap arasına koymak). Gerekçe: sahibin kararı halkaları "N. bölüm" hapının hemen üstüne koyuyor; değişken aralık var olan `settle()` kuralından (temelde kart → hap 60.7 / 32 / −30, ön örnekte kart → halka 57.7 / 29 / 16) | `ritim`, `kartHap`; `G9-*-alt.png` |
| 13 | Tik rozeti gün şeridinin "bitti" diliyle aynı; Yoga'nın yeşili | Tasarım kararı korunuyor (seçilen tasarım bu dili istedi); halka dili değiştiği için (17) gün şeridinin "bugün"üyle karışma kalktı; sahibe ve 5 sn kapısına §8.6 | `G2-iki-*`, `G7-kilit-rozet-*` |
| 14 | G2-iki'de kahraman değişiyor; temel karesi yok | Yapıldı: temel kareleri; temelde de aynı (cümle yok, "Yola devam et · Yeni"): var olan kural. Sahibe bilgi §8.8 | `G2-iki-*-temel.png`, `G2-kilit-*-temel.png` |
| 15 | Geç gelen haplar satırı zıplatabilir (ölçülmemiş) | Ölçüldü: kare kare iz (ilk 3 sn) ve `-gec` senaryoları; yazı tipi yüklenirken 31 çekimde durum değişiyor, haplar geç gelince yalnız G7 320×640'ta görünüp gizleniyor. Kural gereği kod değişmedi; seçenekler §8.5 | `olcum.json` `kareler`, `ziplama`; `G2-gec-*`, `G7-gec-*` |
| 16 | (kod) Tam set yapıldı halkası Dalga ile aynı renk | 2 ile aynı; düzeltildi | 2 |
| 17 | (kod) "Yapıldı" dili gün şeridinin "bugün" diliyle aynı | Düzeltildi: yapıldıda disk dolar (%22), halka nötr kalır; 5 sn sorusu §8.6 | `G2-iki-390x844-koyu` (tur 1'deki aynı halka yok), `G2-dort-*` |
| 18 | (kod) Mobil tarayıcıda kaydırırken karar gidip gelebilir | Düzeltildi: `fitRings` sayfa kaydırılmışken verilmiş kararı korur; en üstte yeniler | `denetim.json` `kaydirmaBoy` |
| 19 | (kod) Yapıldı + kilitli'de kilit görünmüyor | Düzeltildi: kilit rozeti önce; yapıldı disk dolgusunda | `G2-full-kilit-*`, `G7-kilit-rozet-*`; ad "Tam set, bugün yapıldı, mola bitince açılır" |
| 20 | (kod) Hareketi azalt açıkken basma izi yok | Düzeltildi: medya sorgusunun dışında `:active` disk koyulaşır | `denetim.json` `basma_hareketiAzalt` (disk değişti, dönüşüm yok) |
| 21 | (kod) `Wind` iki anlamda (hava hapı ve Nefes) | Ölçüldü (G2-ruzgar); kod değişmedi, Nefes'te `Wind` kalsın önerisi; sahibe §8.7 | `G2-ruzgar-*` |
| 22 | (süreç) İzinli üç yerin dışına yazma; `.vite-temp` | Düzeltildi: bütün çıktılar `halka-wt`, `halka-cekim`, `docs/.../halkalar` içinde (yoklama `halka-cekim/probe`, tarama `halka-cekim/tarama`); vitest `--configLoader runner --no-cache`, düzeneğin vite'ı `--configLoader runner`; deponun `app/node_modules`'ında 07.50'den sonra değişen yok | `find … -newermt` boş; `git status` yalnız `docs/…/halkalar/` |

## 10. Sıradaki adımlar

1. 5 saniye kapısı (beş değerlendirici, iki tema, 390, 375×667 ve 320) tur 2 çekimleriyle; §8'deki sorular kapıda açıkça
   sorulsun.
2. Metin kapısı ve sahip onayı (§8.10).
3. §8'deki kararlardan sonra ana dala alma; tam takım ve derleme; TestFlight; cihazda bakış (güvenli alan, dokunma hissi,
   VoiceOver okuması, yazı tipinin geç gelmesi).
