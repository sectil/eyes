# Yoga · Bugün'ün yolunda günlere göre yeri (tek karar önerisi)

Tarih: 2026-09-29. Durum: **PLAN**. Kod yazılmadı, depoda hiçbir dosya değişmedi, git yazma komutu ve ücretli
ElevenLabs çağrısı yapılmadı. Sayılar bugünkü `app/src/lib/today.js` kurallarıyla yapılan bir benzetimden gelir
(§10); cihazda denenmedi. Kod göndermeleri `dosya:satır` biçimindedir ve yalnız bu görevde okuduğum satırlardır.

**Okunanlar:** `yoga-pilot/SAHIP_ISTEKLERI.md` (tamamı), `yoga-pilot/PLAN.v2.md` (§0, §A.0–A.3, §B.1–B.3, §E.1, §E.4–E.9,
§G, §H, Ek), `yoga-pilot/render/SPEC.md`, `render/out/report.md`, `pilot/timing.out.txt` (özet satırları),
`pilot/ders2.lesson.json` ve `render/units.json` (kısa metinli klipler), `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md`,
`YOL.ilerleme.md` (tamamı), `YOL.moduller.md` (§0–§2, §4.1, §4.5–§4.8, §5–§7), `YAPILACAKLAR.md` (1–209);
kod: `lib/today.js` (tamamı), `modules/registry.js` (tamamı), `modules/dalga/manifest.js`, `breath`, `weekly`, `reading`,
`routine`, `daily` manifestleri (tamamı), `notice`, `snake`, `track`, `tek-bakis`, `fark-ettin`, `quick-look`,
`gokyuzu` manifestlerinin yol satırları, `components/TodayPath.jsx` (22–34, 130–211, 290–300, 386),
`screens/Home.jsx` (162, 168), `lib/eyeBudget.js` (15–30), `lib/routines.js` (60–80), `lib/today.test.js` (1–80).

---

## 0. Karar (on madde)

1. **Giriş günü:** yoga yola **3. gün** girer. Kural: ilerleme sayacında `totalDays ≥ 2` (yolda bir şey yapılan ayrı gün
   sayısı; bugün sayılmaz). 1. gün haftalık E testi günüdür; 2. gün okuma testi, Yılan ve Bugünün görevi ilk kez gelir;
   3. gün yeni durağı olmayan ilk gündür. Gün atlayan kişide yoga, yolu açtığı 3. günde gelir.
2. **Süre:** yolda her gün **3 dakikalık kısa ders**. Altı kısa yoga gününden sonra, ölçüm olmayan ilk gün **5 dakikalık
   tam ders** gelir (yaklaşık haftada bir). **15 dk yolda değildir:** Ana sayfa → Yoga'da ve durağın açtığı ders
   ekranındaki süre seçiminde (3 · 5 · 15) durur. Kişi yoldan açtığı dersi 15 dakikaya uzatabilir; yol bütçesine yine
   3 ya da 5 yazılır.
3. **Ders sırası:** PLAN.v2 §A.3 kütüphane sırası: Nefesin Ritmi → Derin Dinlenme → Tek Nokta → Kendine Şefkat → Zor
   Anlar İçin → Sabah Niyeti → Sağlam Yer → Kendini Tanımak → Gelecekteki Sen. Her gün, şimdiye kadar **en az
   tamamlanmış** uygun ders gelir; eşitlikte kütüphane sırası. Derin Dinlenme (uzanarak) ve Kendine Şefkat'in en kısa
   sürümü 5 dk olduğu için bu iki ders yalnız tam ders günlerinde, sırayla gelir. Sabah Niyeti yalnız 05.00 ile 12.00
   arasında gelir. **Uykuya Geçiş sıraya girmez:** 20.00'den sonra yoldan açılan ders ekranında "uyku dersi" seçeneği
   olarak durur; tamamlanırsa durak da tamamlanır.
4. **Yolda yeri:** 2. bölümün **son durağı** (Yılan'dan sonra, Bugünün görevi'nden önce). Göz bütçesine sayılmaz; göz
   molası kilidi sırasında "sıradaki durak" olabilir.
5. **Dönüşüm yok:** Nefes her gün kalır (sahibinin kuralı, `modules/breath/manifest.js:53-54`), yalnız yönlendirilen
   nefes en çok 3 dk olur (mola yine 5 dk). Yürüyüş her gün kalır. **Meditasyon ayrı bir yol durağı değildir:** yoganın
   kısa dersleri o durağın kendisidir (tek sakin durak).
6. **Ölçüm günleri:** haftalık E testinin zamanının geldiği gün yoga yolda yoktur. E testi o gün yapılmazsa yoga ertesi
   gün yine gelir (okuma testinin "en çok bir gün" kuralının aynısı, `lib/today.js:124-127`). Okuma günü yoga 3 dk'dır;
   tam ders o güne düşmez.
7. **20 dk tavanı:** 30 günlük benzetimde hiç aşılmadı. Yol 8–20 dk, ortalama **17,1** (aynı ilerleme merdivenleriyle
   yogasız 16,0). Yoga 30 günde yalnız 2 okuma gününde bir oyun durağını (Tek Bakışta ya da Fark Ettin mi?) yoldan
   çıkardı; haftalık 3 gün kotası sürdüğü için o durak benzetimde ertesi gün geldi.
8. **Atlanan gün ceza değildir:** sıradaki ders bekler, hiçbir sayaç düşmez. Son yoga gününden 14 gün ya da daha uzun
   aradan sonraki ilk gün ders 3 dk'dır, tam ders o gün gelmez. **"Sonra yaparım":** durak yerinde kalır, yol "tamam"
   sayılır, gün bitince durak sessizce düşer, yarına taşınmaz.
9. **Kayıt ve Gelişim:** kayıt PLAN.v2 §E.4'teki `{ type: 'yoga', lesson, planned, seconds, completed, … }` kaydıdır;
   yoldan yapılan ders de Ana sayfadan yapılan ders de aynı kayıttır ve Gelişim'e aynı yoldan girer.
10. **Kod:** saf `pathYoga(ctx)` işlevi (`lib/yoga.js`); yoga manifestinin `today()` işlevi yalnız `ctx.progression`
    varken durak verir; `today.js`'e üç küçük ek. Bu üç ek 20.000 rastgele bağlamda bugünkü yolu birebir aynı verdi (§5.3).

---

## 1. İki tasarım belgesi neden olduğu gibi alınamıyor

| Konu | YOL.ilerleme §5.13 | YOL.moduller §4.5–4.6 | Sorun | Bu karar |
|---|---|---|---|---|
| Yola giriş | Gün yazmıyor; meditasyon `D_toplam ≥ 14` ile 15. günde açılıyor (§5.3, satır 190) | Yoga Keşfet'ten bir kez dinlenince yola giriyor (satır 598–600); meditasyon 2. günden her gün (satır 530–532) | Sahibi "günlere göre yoga modülleri yollarda yer alacak" dedi (`yoga-pilot/SAHIP_ISTEKLERI.md:27-28`); dinleme şartı yola girişi kişinin yogayı kendiliğinden bulmasına bırakır | 3. gün, günle |
| Süre | Her bölüm 3 dk (satır 264) | Yoga 5 dk (satır 603), meditasyon 3 dk | 3 dakikalık Derin Dinlenme olamaz (§3.2). Her gün 5 dk yoga, yolu 30 günün 21'inde 19–20 dk'ya dayar ve iki okuma gününde yoganın kendisini düşürür (§3.8) | Her gün 3, haftada bir 5 |
| "Bölüm" nedir | "Bölüm n = merdiven basamağı n (1–10)" | Ders | 30 dakikalık dersi 3'er dakikalık on parçaya bölmek, her sürümün karşılamayla başlayıp kapanışla bitmesi kuralını bozar (PLAN.v2 §B.1). Bölüm ders demekse merdiven 10. günde biter; oysa yol sonsuzdur | Her gün bütün bir kısa ders; sıra sonsuz döner |
| Dönüşüm | Yürüyüş ile `beden` grubu, gün aşırı (satır 265, 339) | Meditasyon ile `sessiz` grubu (satır 607–608) | Yürüyüş YOL.moduller'de Gökyüzü molasıyla `disari` grubunda da (satır 659–663); bir durak tek grup taşır (`lib/today.js:195`). Benzetimde `beden` okuması yürüyüşü 30 günün 13'ünde yoldan çıkarıyor | Dönüşüm yok |
| Yolda yeri | Belirtilmemiş | `slot: 'practice'`, `order: 97` | R5 kuralı açık uçlu durağı (Yılan) bölümün en sonuna taşır (`lib/today.js:294-298`); yoga Yılan'dan önce kalır, gün bir oyunla biter | Son durak (`order: 105`) ve R5'e küçük bir ek (§5.3) |
| Kayıt | `{ type: 'yoga', part, seconds }` | PLAN.v2 §E.4 | İki şema | PLAN.v2 §E.4 |
| Meditasyon zamanı | 15. gün, 3→5 dk | 2. gün, her gün 3 dk | YAPILACAKLAR.md:74-75 "meditasyon zamanlaması tek" maddesini açık bırakıyor | Tek sakin durak: yoga |

Sahibinin sözü iki belgeyi de aşıyor: "10 ders ve her ders 30 dakika … ilk etapta 3-5-15 dakika gibi bölümler olacak …
yolda modül entegre olacak" (`yoga-pilot/SAHIP_ISTEKLERI.md:27-31`) ve daha önce "aralarda nefes, meditasyon … ilk gün
3 dk, sonraki gün yine 3 dk … 30 dakikadan oluşuyor ve 10 bölüm … bunları yayman lazım"
(`docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md:5-7`). Bu kararın okuması: yolun sakin durağı her gün 3 dakikadır ve
on dersin içeriği bu durakla günlere yayılır.

---

## 2. Bugünkü kodda yoganın dayandığı kurallar

| Kural | Nerede | Yoga için anlamı |
|---|---|---|
| Durak sözleşmesi (`title, minutes, done, route, slot, order, dropRank, rotate …`) | `lib/today.js:6-17`, `modules/registry.js:28-31` | Yoga da `today(ctx)` ile durak verir |
| Şablon sırası `ORDER` (warmup 10 … open 100, finale 110) | `lib/today.js:156` | `order: 105`: 2. bölümün sonu, finalden önce |
| Yol hedefi 15, tavanı 20 dk (VARSAYIM) | `lib/today.js:160` | Tavan R7 ile korunur |
| `collect` bilinmeyen alanı düşürür; `rotate` tek dizedir | `lib/today.js:163-209`, `:195` | Ders bilgisi `stage` ile taşınır (§5.3) |
| Dönüşüm: gruptan günde biri | `lib/today.js:255-266` | Yoga kullanmaz |
| R2: bölümün göz payı ≤ bütçe − 1 dk | `lib/today.js:277-288` | Yoga göz bütçesine sayılmaz (`gates: {}`); payı değiştirmez |
| R7: tavan aşılırsa `dropRank` sırasıyla düşme | `lib/today.js:289-293` | Yoga `dropRank: 1.8` |
| R5: açık uçlu durak bölümün sonuna | `lib/today.js:294-298` | Ek gerekli (§5.3) |
| Sıradaki durak; kilitliyse bütçesiz ilk durak (R8) | `lib/today.js:322-323` | Göz molası sırasında yoga sıradaki olabilir |
| `allDone`: final durakları beklemez | `lib/today.js:325-327` | "Sonra yaparım" için ek (§5.3) |
| Haftalık E testi durumu, takvim günüyle | `lib/today.js:102-116` | E testi günü kuralı |
| Okuma testi, "en çok bir gün" kayma | `lib/today.js:118-146` | Aynı kalıp yogada |
| Nefes her gün mola durağı, 5 dk | `modules/breath/manifest.js:51-58`; `lib/breath.js:12, 16` | Nefes kalır; yönlendirilen kısmı en çok 3 dk |
| Göz bütçesi 5 dk, mola 5 dk | `lib/eyeBudget.js:18, 20`; `screens/Home.jsx:162, 168` | Değişmez |
| Final durağı yolda "günün görevi" diye okunur | `components/TodayPath.jsx:135-136, 386` | Yoga final değil, pratik durağı olmalı |
| Pratik durağının alt satırında yalnız süre yazar | `components/TodayPath.jsx:203-208` | Ders adının görünmesi için küçük ek (§5.4) |
| Bilinmeyen çizim adı boş kalır | `components/TodayPath.jsx:22-34, 154` | Yeni çizim gerekir |

---

## 3. Karar ayrıntısı

### 3.1 Giriş günü: 3. gün

- Kural `totalDays ≥ 2`. `totalDays`, YOL.ilerleme §11.1'deki `progressionCtx` sayacıdır. YAPILACAKLAR.md:66'daki karara
  göre bugün sayılmaz.
- Neden 3. gün: YOL.ilerleme §8.4 "yeni modül yeni gün ekler, aynı güne yığılmaz" der. Bugünkü kodda okuma testi 2. güne
  kaydı (`lib/today.js:126-127`); 2. günde Yılan ve Bugünün görevi de ilk kez geliyor. 3. gün yeni durağı olmayan ilk
  gündür ve yol o gün yogasız 8 dk'dır (benzetim). 1. gün hem E testi günü hem kurulum günüdür.
- İlk yoga dersinde PLAN.v2 §A.1'deki ilk ders cümlesi ("Bugün yalnızca tanışıyoruz; zorlanırsan kısalt.") ve §E.1'deki
  güvenlik kartı bir kez gelir. Bunlar ders ekranının işidir; yol yalnız dersi açar.

### 3.2 Süre: kısa ders 3 dk, tam ders 5 dk, 15 dk Ana sayfada

**Neden 3 dk:** Gerçek kullanımda meditasyona özgü süre günde ortalama 3,36 dk'ydı ve kullanıcıların %69,7'si günde
5 dakikanın altında kaldı (Radin 2025; §7). Yol, kişinin her gün gerçekten yapacağı süreyi ister. 3 dk aynı zamanda
YOL.ilerleme §4'teki sakinlik payına (nefes 3 + sakin durak 3 = 6 dk) oturur.

**Neden haftada bir 5 dk:** 5 dakikalık sürüm PLAN.v2'de "bütün bir ders"tir (§B.1). Derin Dinlenme'nin 3 dakikalık
sürümü olamaz: `pilot/timing.out.txt` 201. satır, 5 dakikalık planın üretim köşesinde Varış 52 sn, niyet 45 sn, çekirdek
97 sn, Kapanış 102 sn ayırıyor; yalnız Varış ve Kapanış 154 sn eder. 246. satır, 5 dakikada kalan boş payın 17,7 sn
olduğunu (taban 15 sn) söylüyor. Uzanarak yapılan dersin kapanışındaki güvenli kalkış sırası kısaltılmaz (Tran 2021,
Howard 2017; §7). Kendine Şefkat'in kademeli sırası da 3 dakikaya sığmaz (süre belgesi, aşağıda). 3 dakikaya inemeyen bu
iki ders için yolun basamağı bir "tam ders günü"dür.

**Merdiven (basamaklar, sonsuz):**

| Basamak | Koşul | Yolda |
|---|---|---|
| Tanışma | İlk 6 yoga günü | Her gün 3 dk; en kısa sürümü 3 dk olan dersler sırayla |
| Düzen | 6 kısa yoga gününden sonra | Ölçüm olmayan ilk gün 5 dk tam ders, sonra yine 6 kısa gün (yaklaşık haftada bir tam ders) |
| Yumuşak dönüş | Son yoga gününden bu yana ≥ 14 gün | O gün 3 dk, tam ders yok; ertesi gün kaldığı yerden |
| 90+ gün | YOL.ilerleme §8.6 "haftalık odak modülü" yoga olduğunda | O hafta ölçüm olmayan her gün 5 dk |

"Tam ders" sayacı yoga günlerini sayar, takvim günlerini değil: gün atlamak tam dersi öne çekmez. Kişi Ana sayfadan
5 ya da 15 dakikalık bir dersi tamamlarsa o gün tam ders sayılır ve sayaç baştan başlar.

**15 dk:** yolda durak olarak yoktur. 15 dakikalık bir durak, yolun geri kalanıyla birlikte 20 dk tavanını her gün
aşar. 15 dk, Ana sayfa → Yoga'da ve yoldan açılan ders ekranındaki süre seçiminde durur. Yoldan açılan ders o günün
süresiyle (3 ya da 5) hazır gelir; kişi 15'i seçip tamamlarsa durak tamamlanır, yol bütçesine yine 3 ya da 5 yazılır
(YOL.ilerleme §4 "yol payı").

**İçerik koşulu (üretime etkisi §6):** Bu çalışmanın süre belgesi (`scratchpad/yoga-v3/sure.md` §0) 3 dakikalık
sürümü yalnız oturarak yapılan yedi derste kuruyor: Nefesin Ritmi, Zor Anlar İçin (yalnız dayanak bloğu), Tek Nokta,
Sabah Niyeti, Sağlam Yer, Kendini Tanımak (yalnız oturarak), Gelecekteki Sen. Derin Dinlenme, Uykuya Geçiş ve Kendine
Şefkat'in en kısa sürümü 5 dakikadır. Bu belge o listeyi olduğu gibi kullanır (`minMin`); her dersin 3 dakikalık planı,
Ders 2'deki gibi `timing` denetiminden geçmedikçe o ders 3 dakikalık günlerde aday olmaz, kural bunu kendiliğinden
uygular. Süre belgesi ayrıca ölçülmüş klip süreleriyle Ders 2'nin 5 dakikalık sürümündeki boş payın Neslihan'da 15 sn
tabanının altına indiğini hesaplıyor (§0.6); bu belge o hesabı yeniden yapmadı. Tam ders günündeki Derin Dinlenme, o
sürüm ölçülmüş sürelerle yeniden kurulup geçince yola girer.

### 3.3 Hangi gün hangi ders

- Sıra: `PATH_SEQ = [1, 2, 5, 7, 4, 6, 8, 9, 10]` (PLAN.v2 §A.3). Ders 3 (Uykuya Geçiş) sırada yoktur.
- O günün adayları: en kısa sürümü o günün süresine sığan ve saati uygun dersler. Sabah Niyeti'nin açılış cümlesi
  "Gün henüz başlıyor" olduğu için bu ders yalnız 05.00 ile 12.00 arasında aday olur (PLAN.v2 §A.2.1).
- Seçim: şimdiye kadar tamamlanma sayısı en az olan ders; tam ders gününde eşitlikte tam dinlenme sayısı az olan; sonra
  kütüphane sırası. Böylece kısa dersler kendi aralarında eşit sıklıkta döner; tam ders günleri Derin Dinlenme ile
  Kendine Şefkat'e sırayla kalır. Yeni bir ders eklendiğinde (11. ders) hiç dinlenmediği için ilk uygun gün kendiliğinden
  öne gelir.
- Gün içinde değişmez: seçim yalnız bugünden önceki kayıtlarla yapılır; ders bugün tamamlandıysa durak o dersi gösterir.
  Tek istisna Sabah Niyeti'dir: sabah görünüp öğleden sonra açılırsa yerine sıradaki uygun ders gelir.
- Benzetimde (her gün 10.00'da yapan kişi) ilk tur: 3. gün Nefesin Ritmi, 4. Tek Nokta, 5. Zor Anlar İçin, 6. Sabah
  Niyeti, 7. Sağlam Yer, 9. Kendini Tanımak, **10. gün ilk tam ders: Derin Dinlenme (5 dk)**, 11. Gelecekteki Sen,
  12. günden ikinci tur; **18. gün ikinci tam ders: Kendine Şefkat (5 dk)**. 19.00'da yapan kişide Sabah Niyeti hiç
  gelmez, sıra bir kayar (§4).
- **Gece:** 20.00'den sonra yol aynı dersi gösterir; yoldan açılan ders ekranında PLAN.v2'nin Derin Dinlenme kartı
  için aynı saatle yazdığı cümle çıkar (§A.2, Ders 2; saat VARSAYIM): "Akşam uyumadan önce dinliyorsan uyku dersi daha
  uygun olabilir." Altında Uykuya Geçiş'e geçiş düğmesi durur. Uykuya Geçiş'i yoldaki durağın yerine kendiliğinden
  koymuyorum: yolu akşam açan herkes yatağa gitmiyor; her akşam aynı uyku dersini gören kişi öteki dokuz dersle hiç
  karşılaşmazdı. O gece yatağa girecek kişi "Sonra yaparım" der, Bugünün görevi'ni bitirir ve uyku dersini yatakta
  dinler; durak böyle de tamamlanır.

### 3.4 Yolda yeri: 2. bölümün son durağı

- `slot: 'practice'`, `order: 105`. Sıra: … Göz kırpma → Tek Bakışta → Yılan → **Yoga** → Bugünün görevi (final).
- Neden sonda: uzanarak yapılan Derin Dinlenme'den sonra kalkıp göz egzersizine dönmek gerekmez; yol sakin biter; kişi
  dersi 15 dakikaya uzatırsa yolun geri kalanını bekletmez.
- Neden final değil: final durağı yolda "günün görevi" diye okunur ve altın halkayla çizilir
  (`components/TodayPath.jsx:135-136, 386`); ayrıca `allDone` finali beklemez (`lib/today.js:325-327`), yoga isteğe
  bağlı bir ek gibi görünürdü. Yoga yolun gerçek durağıdır; kişi istemezse "Sonra yaparım" der.
- Göz bütçesi yok (`gates: {}`), bu yüzden R2 bölüm payını değiştirmez. Hızlı Bakış gününde de yolda kalır: o gün
  yalnız 2. bölümün göz durakları düşer (`lib/today.js:251-254`).
- Göz molası kilidinde sıradaki durak bütçesiz ilk duraktır (`lib/today.js:322-323`); önceki bütçesiz duraklar bittiyse
  bu yogadır. Ekran karanlık kaldığı için ders, zorunlu molanın içinde yapılabilir.

### 3.5 Neyle dönüşümlü: hiçbiriyle

- **Nefes molası:** sahibinin isteğiyle her gün yolda (`modules/breath/manifest.js:53-54`); dönüşüme girmez.
- **Yürüyüş:** YOL.moduller §4.1 onu her gün 2 dk olarak tasarlıyor; yoga yüzünden gün aşırıya indirmek için bir
  gerekçe yok. Yürüyüşün Gökyüzü molasıyla ilişkisi o belgelerin işi.
- **Meditasyon:** yolda ayrı durak değil. YOL.moduller §4.5 zaten "iki ayrı ürün, tek motor" diyor (satır 501–504) ve
  on dersin dokuzu nefes, meditasyon ya da yoga nidradır (PLAN.v2 §G8). Meditasyonun 3 dakikalık parçaları (nefes,
  beden, şefkat) yoganın 3 dakikalık dersleriyle aynı içeriktir; ikinci bir ses hattı ve ikinci bir günlük sakin durak
  gerekmez. Ana sayfada "Meditasyon" girişi istenirse yoga kütüphanesinin bir süzgeci olur (PLAN.v2 §G8 adı). Süre
  belgesi (§7), meditasyonun 3 dakikalık `sefkat` parçasının Kendine Şefkat'teki güvenlik sorununu taşıdığını yazıyor
  (dayanak, davet ve dönüş sırası 3 dakikaya sığmıyor); tek sakin durak kararıyla bu parça hiç yapılmaz, Kendine Şefkat
  yolda yalnız 5 dakikalık tam ders olarak gelir.
- Sahibi ayrı bir meditasyon modülü isterse tek değişiklik: iki durak da `rotate: 'sessiz'` taşır ve aynı `order: 105`
  yuvasını paylaşır; gün tablosundaki süreler değişmez.

### 3.6 Sakinlik payı: Nefes'in yönlendirilen kısmı en çok 3 dk

YOL.ilerleme'nin nefes merdiveni 1-1-2-2-3-3-4-4-5 dk'dır ve "meditasyon açıldıysa 3" notunu taşır (§5.1, satır 139;
sakinlik payı ≤ 6 dk, satır 113). Yoga 3. günden itibaren o sakin durak olduğu için nefes yolda 1-1-2-2-3'te durur. Mola
durağı göz molası olarak yine 5 dakikadır (YOL.ilerleme §5.1, satır 145–147). Günde 5 dakikalık nefes hedefi (Balban 2023)
Ana sayfadaki Nefes'te kalır. Benzetim: nefes 3'te durmasaydı yoga 30 günün 2'sinde yoldan düşüyor ve 7 gün başka bir
durağı yoldan çıkarıyordu; durunca yoga her yoga gününde yolda kalıyor ve yalnız 2 gün bir oyun durağı ertesi güne
kalıyor.

### 3.7 Haftalık E testi ve okuma günleri

- **E testi günü:** haftalık E testinin zamanı bugün geldiyse (son tam koşudan tam 7 takvim günü; hiç kaydı olmayan
  kişide 1. gün) yoga yolda yoktur. Hesap gün başındaki kayıtlarla yapılır, gün içinde değişmez.
- **En çok bir gün:** E testi o gün yapılmazsa ertesi gün hem E testi hem yoga yoldadır. E testini hiç yapmayan kişi
  yogadan da mahrum kalmaz. Aynı kalıp okuma testinde sahibinin onayıyla var (`lib/today.js:124-127`, YAPILACAKLAR.md:122-127).
- **Okuma günü:** yoga 3 dk; tam ders o güne düşmez (ölçüm günü). E testinin geciktiği günler de ölçüm günüdür.
- Benzetimde E testi günleri 1, 8, 15, 22, 29; okuma günleri 2, 9, 16, 23, 30. 2. gün dışındaki okuma günlerinde yol
  19–20 dk'dır.

### 3.8 20 dk tavanı

Benzetim (§10): gerçek `buildPath`, gerçek E testi ve okuma kuralları, YOL.ilerleme §5 merdivenleri.

| Seçenek | 30 günde yoga günü | Yol (en kısa / ortalama / en uzun) | Yoganın başka durağı çıkardığı gün | Yoganın kendisinin düştüğü gün |
|---|---|---|---|---|
| **Bu karar** | 24 (3 dk: 21, 5 dk: 3) | 8 / **17,1** / 20 | 2 (okuma günleri 16, 30; Tek Bakışta, Fark Ettin mi?) | 0 |
| Yogasız (aynı merdivenler) | 0 | 8 / 16,0 / 20 | — | — |
| Her gün 5 dk | 22 | 8 / 18,0 / 20 | 4 | 2 (okuma günleri 16, 30) |
| YOL.ilerleme okuması (yürüyüşle `beden`, gün aşırı) | 14 | 8 / 15,5 / 19 | 13 (yürüyüş) | — |
| YOL.moduller okuması (yoga 1. gün Keşfet'ten dinlenmiş; meditasyon 3 dk ⇄ yoga 5 dk, `sessiz`) | meditasyon 9, yoga 5 | 8 / 17,4 / 20 | 5 | 15 gün ikisi de yok (yoga `dropRank: 1.2` ile ilk düşen) |

90 günde bu kararla: 76 yoga günü, 10 tam ders günü, ortalama 17,9 dk (yogasız 16,9), hiçbir gün 20'yi aşmıyor; yoganın
başka bir durağı çıkardığı 6 günün hepsi okuma günü.

**Açık söylemem gereken iki bulgu (yogadan bağımsız):**
- YOL.ilerleme merdivenleriyle yol zaten 15 dk hedefinin üstünde: yogasız ortalama 16,0 dk; 30 günün 8'inde 19–20 dk.
  YOL.ilerleme §6 tablosu (a) kararından önce yazıldı ve günlük E testinin 3 dakikasını içeriyor; bu belgedeki sayılar
  o tabloyu değil, benzetimi kullanır.
- Yılan, 2. bölümün göz payına (4 dk; R2, `lib/today.js:286-288`) takılıp yogasız da 30 günün 21'inde düşüyor. Yoga göz
  bütçesine sayılmadığı için bunu değiştirmiyor (bu kararla 20 gün). Bu, ilerleme belgesinin çözmesi gereken ayrı bir iş.

### 3.9 Atlanan gün, uzun ara, "Sonra yaparım", yarım kalan ders

| Durum | Ne olur | Ne olmaz |
|---|---|---|
| Gün atlandı | Sıradaki ders, yolun yeniden açıldığı gün gelir; tam ders sayacı yoga günlerini saydığı için öne çekilmez | Ceza, sıfırlama, "seri bozuldu" ekranı |
| Son yoga gününden ≥ 14 gün | O gün 3 dk, tam ders yok (YOL.ilerleme §4 yumuşak dönüş eşiği) | Sıranın başa dönmesi |
| Uzun aradan dönüş günü, E testi ve okuma gecikmişse | Yol ağırdır; R7 önce oyunları, sonra yogayı düşürebilir (benzetimde 16 günlük aradan sonraki gün: 20 dk, yoga düştü) | Bu yogadan değil, iki gecikmiş ölçümden gelir |
| "Sonra yaparım" | YOL.ilerleme §7'deki `later` listesi; sıradaki durak onu atlar, yol "tamam" sayılır, durak gece yarısına kadar açılabilir | Yarına taşınma, bildirim (VARSAYIM: hatırlatma sistemi ayrı karar) |
| Ders yarıda bırakıldı | Tamamlanmadıkça durak tamam değildir (PLAN.v2 §E.4: kapanışa ulaşılmış ve planlananın en az %60'ı dinlenmiş); "Kaldığın yerden" kartı Ana sayfada 7 gün durur (PLAN.v2 §E.1) | Ertesi gün yolun aynı yarım dersi zorlaması; yol yine sıradaki dersi önerir |
| Ders Ana sayfadan yapıldı | Bugün tamamlanan herhangi bir yoga dersi (Uykuya Geçiş dahil) durağı tamamlar | İkinci bir yoga durağı |
| Gece yarısından sonra dinlenen uyku dersi | Yeni günün yoga durağını tamamlar (gün anahtarı yerel takvim günüdür) | — |
| Hafif gün (YOL.ilerleme §13.4, karar bekliyor) | Yoga 3 dk olarak kalır; göz yükü yok | — |

---

## 4. Gün gün tablo (1–30. gün)

Kurgu: yeni kullanıcı 1 Ekim 2026'da başlar, hiç gün atlamaz ve yoldaki her durağı yapar; bir koşuda her gün 10.00'da,
ayrı bir koşuda 19.00'da açar. E testi ve okuma günleri bugünkü kodla (`weeklyStatus`, `readingStatus`) hesaplandı;
öteki duraklar YOL.ilerleme §5 merdivenleriyle (henüz kodda yok, VARSAYIM). "Yol" sütunu yolun bütçeye yazdığı toplamdır
(`minutesLeft`, gün başında); ilk sayı bu kararla, ikinci sayı yoga olmadan aynı merdivenlerle.

| Gün | Ölçüm | Yoga (10.00'da açan) | Yoga (19.00'da açan) | Nefes dk (yogalı / yogasız) | Yol dk (yogalı / yogasız) | Yoga yüzünden ertesi güne kalan |
|---|---|---|---|---|---|---|
| 1 | Haftalık E testi | — | — | 1 / 1 | 8 / 8 | — |
| 2 | Okuma | — | — | 1 / 1 | 10 / 10 | — |
| 3 | — | Nefesin Ritmi · 3 dk | Nefesin Ritmi · 3 dk | 2 / 2 | 11 / 8 | — |
| 4 | — | Tek Nokta · 3 dk | Tek Nokta · 3 dk | 2 / 2 | 13 / 10 | — |
| 5 | — | Zor Anlar İçin · 3 dk | Zor Anlar İçin · 3 dk | 3 / 3 | 15 / 12 | — |
| 6 | — | Sabah Niyeti · 3 dk | Sağlam Yer · 3 dk | 3 / 3 | 16 / 13 | — |
| 7 | — | Sağlam Yer · 3 dk | Kendini Tanımak · 3 dk | 3 / 4 | 16 / 14 | — |
| 8 | Haftalık E testi | — | — | 3 / 4 | 19 / 20 | — |
| 9 | Okuma | Kendini Tanımak · 3 dk | Gelecekteki Sen · 3 dk | 3 / 5 | 20 / 19 | — |
| 10 | — | Derin Dinlenme · 5 dk | Derin Dinlenme · 5 dk | 3 / 5 | 20 / 17 | — |
| 11 | — | Gelecekteki Sen · 3 dk | Nefesin Ritmi · 3 dk | 3 / 5 | 17 / 16 | — |
| 12 | — | Nefesin Ritmi · 3 dk | Tek Nokta · 3 dk | 3 / 5 | 18 / 17 | — |
| 13 | — | Tek Nokta · 3 dk | Zor Anlar İçin · 3 dk | 3 / 5 | 17 / 16 | — |
| 14 | — | Zor Anlar İçin · 3 dk | Sağlam Yer · 3 dk | 3 / 5 | 18 / 17 | — |
| 15 | Haftalık E testi | — | — | 3 / 5 | 19 / 19 | — |
| 16 | Okuma | Sabah Niyeti · 3 dk | Kendini Tanımak · 3 dk | 3 / 5 | 19 / 20 | Tek Bakışta |
| 17 | — | Sağlam Yer · 3 dk | Gelecekteki Sen · 3 dk | 3 / 5 | 17 / 16 | — |
| 18 | — | Kendine Şefkat · 5 dk | Kendine Şefkat · 5 dk | 3 / 5 | 20 / 17 | — |
| 19 | — | Kendini Tanımak · 3 dk | Nefesin Ritmi · 3 dk | 3 / 5 | 17 / 16 | — |
| 20 | — | Gelecekteki Sen · 3 dk | Tek Nokta · 3 dk | 3 / 5 | 18 / 17 | — |
| 21 | — | Nefesin Ritmi · 3 dk | Zor Anlar İçin · 3 dk | 3 / 5 | 17 / 16 | — |
| 22 | Haftalık E testi | — | — | 3 / 5 | 20 / 20 | — |
| 23 | Okuma | Tek Nokta · 3 dk | Sağlam Yer · 3 dk | 3 / 5 | 20 / 19 | — |
| 24 | — | Zor Anlar İçin · 3 dk | Kendini Tanımak · 3 dk | 3 / 5 | 18 / 17 | — |
| 25 | — | Sabah Niyeti · 3 dk | Gelecekteki Sen · 3 dk | 3 / 5 | 17 / 16 | — |
| 26 | — | Derin Dinlenme · 5 dk | Derin Dinlenme · 5 dk | 3 / 5 | 20 / 17 | — |
| 27 | — | Sağlam Yer · 3 dk | Nefesin Ritmi · 3 dk | 3 / 5 | 17 / 16 | — |
| 28 | — | Kendini Tanımak · 3 dk | Tek Nokta · 3 dk | 3 / 5 | 18 / 17 | — |
| 29 | Haftalık E testi | — | — | 3 / 5 | 19 / 19 | — |
| 30 | Okuma | Gelecekteki Sen · 3 dk | Zor Anlar İçin · 3 dk | 3 / 5 | 19 / 20 | Fark Ettin mi? |

Tablonun okunuşu:
- 1. ve 2. gün yoga yok (kilitli). 3. gün ilk ders: Nefesin Ritmi, 3 dk (ilk ders cümlesi ve güvenlik kartı).
- E testi günleri (8, 15, 22, 29) yoga yok. Okuma günleri (9, 16, 23, 30) yoga 3 dk.
- Tam ders günleri 10, 18, 26: Derin Dinlenme, Kendine Şefkat, Derin Dinlenme (5 dk). Tam ders günlerinde yol 20 dk'dır,
  tavanı aşmaz.
- Kısa günlerde 10.00'da açan kişide 7 ders, 19.00'da açan kişide 6 ders döner (Sabah Niyeti akşam gelmez).
- Nefes 7. günden itibaren yogasız yolda 4–5 dk'ya çıkıyor; bu kararla 3'te duruyor (§3.6). Yogalı yolun bazı ölçüm
  günlerinde yogasızdan kısa olmasının nedeni budur.
- 30 günün tam durak listesi Ek A'da.

**31. günden sonra (sonsuz):** aynı kural sürer. 90 günlük koşuda 76 yoga günü, 10 tam ders günü (beşi Derin Dinlenme,
beşi Kendine Şefkat, sırayla), ortalama 17,9 dk. Bu iki ders yalnız tam ders günlerinde gelebildiği için "en az
tamamlanan" kuralı onları o günlerde öne çeker; öteki yedi ders kısa günlerde eşit sıklıkta döner. Onların 5 ve 15
dakikası Ana sayfadadır. 90. günden sonra YOL.ilerleme §8.6'daki haftalık odak modülü yoga
olduğunda o hafta ölçüm olmayan her gün 5 dk'dır. On birinci bir ders eklenince hiç dinlenmediği için ilk uygun gün
kendiliğinden öne gelir.

---

## 5. Kod sözleşmesi taslağı

Ön koşul: YOL.ilerleme §11'deki `lib/progression.js` ve `ctx.progression` (YAPILACAKLAR.md:73, uygulama sırası (c)).
Yoga (uygulama sırası (g)) bu sözleşmenin üstüne kurulur; `ctx.day` ve `grow` (YOL.moduller §2.2–2.3) kullanılmaz, çünkü
YAPILACAKLAR.md:74 "tek ilerleme sözleşmesi" diyor.

### 5.1 `lib/yoga.js`: yol durağı (saf, belirlenimci; PLAN.v2 §B.3 planlayıcısıyla aynı dosya)

```js
import { dayKey } from './calendar.js'
import { runDayOf, lastComplete, calendarDaysBetween, weeklyStatus, readingStatus } from './today.js'

export const PATH_SEQ = [1, 2, 5, 7, 4, 6, 8, 9, 10]   // PLAN.v2 §A.3; 3 (Uykuya Geçiş) sırada yok
export const PATH_YOGA = {
  unlockTotalDays: 2,        // her gün açan kişide 3. gün; bugün sayılmaz (VARSAYIM)
  shortMin: 3, fullMin: 5,   // sahibi: "3-5-15"; 15 yolda değil
  shortBeforeFull: 6,        // 6 kısa yoga gününden sonra ölçüm olmayan ilk gün tam ders (VARSAYIM)
  softAfterDays: 14,         // YOL.ilerleme §4 yumuşak dönüş (VARSAYIM)
  morning: { 6: [5, 12] },   // Sabah Niyeti yalnız 05.00–12.00 (VARSAYIM)
  nightFrom: 20, nightTo: 5, // PLAN.v2 Ders 2 kartındaki saat (VARSAYIM): ders ekranında uyku dersi seçeneği
  dropRank: 1.8,             // Yılan 1, Hızlı Bakış 1, Tek Bakışta 1,5, Fark Ettin mi? 1,6'dan sonra; Görev 2, Daire 3'ten önce
}
const FULL_SEC = PATH_YOGA.fullMin * 60
export const isYogaDone = (s) => s?.type === 'yoga' && s.completed === true   // PLAN.v2 §E.4 tamamlanma ölçütü
const dayset = (list) => new Set(list.map(runDayOf).filter(Boolean))

// Haftalık E testinin zamanı BUGÜN mü geldi? Yalnız bugünden önceki kayıtlarla hesaplanır, gün içinde değişmez.
// Zamanı dünden beri geldiyse false: yoga o gün yine yolda ("en çok bir gün", today.js:124-127 kalıbı).
export function weeklyDayToday(tests = [], sessions = [], now = new Date()) {
  const today = dayKey(now)
  const before = (r) => { const k = runDayOf(r); return k != null && k < today }
  const last = lastComplete(tests.filter(before), 'va-weekly')
  if (last) return calendarDaysBetween(runDayOf(last), today) === 7
  return ![...tests, ...sessions].some(before)   // hiç kaydı yok: 1. gün
}

// null | { lesson, minutes, full, soft, night, done }
// lessonMin: { dersNo: yayımlanmış en kısa sürüm (dk) }; yayımlanmamış ders listede yoktur, aday olmaz.
export function pathYoga({ tests = [], sessions = [], now = new Date(), progression } = {}, lessonMin = {}) {
  if (!progression || progression.totalDays < PATH_YOGA.unlockTotalDays) return null
  const today = dayKey(now)
  const hour = new Date(now).getHours()
  const night = hour >= PATH_YOGA.nightFrom || hour < PATH_YOGA.nightTo
  const done = sessions.filter(isYogaDone)
  const mine = done.filter((s) => runDayOf(s) === today).at(-1)
  if (mine) {                                     // bugün yapılan ders gösterilir; yol payı 3 ya da 5
    const full = mine.planned >= FULL_SEC
    return { lesson: mine.lesson, minutes: full ? PATH_YOGA.fullMin : PATH_YOGA.shortMin, full, soft: false, night, done: true }
  }
  if (weeklyDayToday(tests, sessions, now)) return null
  const prior = done.filter((s) => runDayOf(s) < today)
  const w = weeklyStatus(tests, now).state
  const r = readingStatus(tests, now, sessions).state
  const measureDay = w !== 'idle' || r === 'due' || r === 'done'
  const soft = (progression.done?.yoga?.G ?? 0) >= PATH_YOGA.softAfterDays
  const lastFull = [...dayset(prior.filter((s) => s.planned >= FULL_SEC))].sort().at(-1) ?? ''
  const shortDays = dayset(prior.filter((s) => s.planned < FULL_SEC && runDayOf(s) > lastFull)).size
  const full = !soft && !measureDay && shortDays >= PATH_YOGA.shortBeforeFull
  const minutes = full ? PATH_YOGA.fullMin : PATH_YOGA.shortMin
  const n = (l, onlyFull) => prior.filter((s) => s.lesson === l && (!onlyFull || s.planned >= FULL_SEC)).length
  const timeOk = (l) => { const m = PATH_YOGA.morning[l]; return !m || (hour >= m[0] && hour < m[1]) }
  const lesson = PATH_SEQ
    .filter((l) => (lessonMin[l] ?? Infinity) <= minutes && timeOk(l))
    .sort((a, b) => n(a) - n(b) || (full ? n(a, true) - n(b, true) : 0) || PATH_SEQ.indexOf(a) - PATH_SEQ.indexOf(b))[0]
  return lesson == null ? null : { lesson, minutes, full, soft, night, done: false }
}
```

### 5.2 `modules/yoga/manifest.js`: PLAN.v2 §E.4 alanlarına yalnız iki ek

```js
import { pathYoga, PATH_YOGA, isYogaDone } from '../../lib/yoga.js'
import { LESSONS, LESSON_MIN } from '../../lib/yogaLessons.js'   // ders adı ve yayımlanmış en kısa sürüm (ders verisinden)

export default {
  id: 'yoga',
  routes: ['yoga', ...Object.keys(LESSONS).map((n) => `yoga-${n}`)],
  // … PLAN.v2 §E.4: title, label, ring: 'life', kind: 'practice', gates: {}, home, storageKeys, progress, sessions, stats, coach
  progression: { match: isYogaDone, unlockAfter: { totalDays: PATH_YOGA.unlockTotalDays } },   // YOL.ilerleme §11.4
  today(ctx) {
    if (!ctx.progression) return null   // ilerleme kapalıyken yol bugünkü gibi kalır (YOL.ilerleme §11.6 kuralı)
    const p = pathYoga(ctx, LESSON_MIN)
    if (!p) return null
    return {
      title: 'Yoga', sub: LESSONS[p.lesson].title, minutes: p.minutes,
      route: `yoga-${p.lesson}`, slot: 'practice', order: 105, glyph: 'lotus',
      dropRank: PATH_YOGA.dropRank, done: p.done,
      stage: { lesson: p.lesson, minutes: p.minutes, full: p.full, soft: p.soft, night: p.night },
    }
  },
}
```

- Ders ekranı yoldan açıldığında süreyi `stage.minutes` ile hazır getirir (YOL.ilerleme §11.5'teki Nefes `stageSec`
  kalıbı: App, `plan.stops.find((s) => s.id === 'yoga')?.stage` değerini ekrana verir). `stage.night` doğruysa ekranda
  uyku dersi satırı ve Uykuya Geçiş düğmesi çıkar.
- Kayıt PLAN.v2 §E.4'teki kayıttır. Yol ek alan istemez; `planned` (sn) tam ders ayrımı için yeterlidir.
- `registry.js` bilinmeyen alanı reddetmez (`modules/registry.js:85-115`); `progression` alanının denetimi YOL.ilerleme
  §11.4'teki iki satırdır.

### 5.3 `lib/today.js`: üç küçük ek (bugünkü yolu değiştirmez)

```diff
@@ collect (lib/today.js:203'ten sonra) — YOL.ilerleme §11.2'deki ekin aynısı
         hideMinutes: Boolean(it.hideMinutes),
+        later: isLater(c, it.key ? `${m.id}:${it.key}` : m.id),   // "Sonra yaparım" (isLater: lib/progression.js)
+        stage: it.stage ?? null,                                  // basamak; yogada { lesson, minutes, full, soft, night }
@@ R5 (lib/today.js:294-298)
-  // R5: açık uçlu durak bölümünün son göz durağı
+  // R5: açık uçlu durak bölümünün son göz durağı; ardından yalnız göz bütçesiz durak (Yoga) gelebilir
   for (const sec of [sec1, sec2]) {
     const k = sec.findIndex((s) => s.openEnded)
-    if (k >= 0 && k < sec.length - 1) sec.push(...sec.splice(k, 1))
+    if (k < 0) continue
+    const [o] = sec.splice(k, 1)
+    sec.splice(sec.findLastIndex((s) => s.budget) + 1, 0, o)
   }
@@ allDone (lib/today.js:326)
-  const core = stops.filter((s) => !s.finale)
+  const core = stops.filter((s) => !s.finale && !s.later)   // "Sonra yaparım" denen durak yolun tamamlanmasını beklemez
```

Neden gerekli: R5 eki olmadan Yılan yoganın arkasına geçer (benzetim, 3. gün: "Göz kırpma · Yoga · Yılan"); ekle
birlikte sıra "Göz kırpma · Yılan · Yoga" olur. `allDone` ekiyle "Sonra yaparım" ceza olmaktan çıkar. YOL.ilerleme §11.2'nin `next`
eki (`!s.later`) de gerekir; o ilerleme işinin parçasıdır.

**Bugünkü yol değişmiyor mu?** Üç ekin kopyası (scratchpad `sim/today_patched.js`), 19 canlı gerçek manifestle ve
`ctx.progression` olmadan 20.000 rastgele bağlamda (test ve oturum geçmişi, göz bütçesi kilidi ve dolması, nöbet
cevabı, abonelik kapısı) bugünkü `today.js` ile karşılaştırıldı: durak listesi, bölümler, süreler, sıradaki durak,
`allDone`, `minutesLeft`, mola ve kilit işaretleri **0 farkla** aynı. Nedeni: bugünkü bölümlerde en sondaki durak her zaman
bütçelidir, `later` her zaman yanlıştır. (`who5` manifesti Node'da yüklenmedi, çünkü `import.meta.glob` istiyor; yol
durağı yok.)

### 5.4 `components/TodayPath.jsx`: iki küçük ek (tasarım Artifact'ı ve onaydan sonra)

- `GLYPH` (`:22-34`): yeni `lotus` çizimi. Bilinmeyen ad boş kalır (`:154`).
- Alt satır (`:203-208`): bugün yalnız ölçüm durağı `sub · dk` yazar. Kural "alt satırı olan her açık uçlu olmayan
  durak" diye genişler; bugün bu kümede yalnız Haftalık E testi var, onun yazısı değişmez. Yoga kartı: "Yoga" ve altında
  "Nefesin Ritmi · 3 dk". Erişilebilirlik etiketi (`:386`) aynı alt satırı okur: "Yoga, pratik, Nefesin Ritmi,
  3 dakika, sırada".
- "Sonra yaparım" düğmesi YOL.ilerleme §11.8 adım 1'in işidir.

### 5.5 `rotate`: yoga kullanmaz

Yoga hiçbir dönüşüm grubunda değildir (§3.5). Sahibi ayrı bir meditasyon modülü isterse tek değişiklik: iki manifest de
`rotate: 'sessiz'` ve `weekDays` verir, ikisi de `order: 105` taşır; `today.js` bugünkü dönüşüm kuralıyla
(`:255-266`) günde birini bırakır.

### 5.6 Testler (kod aşamasında)

- `lib/yoga.path.test.js`: (1) `ctx.progression` yok ya da `totalDays` 0–1 → null; 2 → Nefesin Ritmi, 3 dk.
  (2) E testinin zamanı bugün geldi → null; dün geldi, yapılmadı → 3 dk. (3) Okuma günü → 3 dk, sayaç dolmuş olsa da.
  (4) 6 kısa günden sonra ölçüm olmayan gün → 5 dk, hiç dinlenmemişse Derin Dinlenme. (5) Derin Dinlenme 3 dk'da hiç
  gelmez; `lessonMin`'de olmayan ders hiç gelmez. (6) Sabah Niyeti 12.00'den sonra ve 05.00'ten önce aday değil.
  (7) Bugün tamamlanan ders gün içinde değişmez (Uykuya Geçiş dahil); 15 dakikalık ders tam ders sayılır ve sayacı
  sıfırlar. (8) Son yoga gününden 14 gün sonra 3 dk, tam ders yok. (9) Aynı girdi aynı çıktıyı verir.
- `lib/today.test.js`'e "ilerleme açık" bloğu: 3., 8., 9. ve 10. gün; yoga 2. bölümün son durağı; Yılan yogadan önce;
  `later` yogada `allDone` doğru; 30 günlük koşuda `minutesLeft` ≤ 20. Bugünkü testler `ctx.progression` vermediği
  için yoga onlarda yoktur; `DAY` listesi (`lib/today.test.js:20`) değişmez.
- `modules/registry.test.js` ve `lib/dataHub.test.js`: YOL.moduller §2.1'deki envanter satırları (yeni kimlik, metrik
  örneği).

---

## 6. İçerik ve üretime etkisi

- Yolun istediği sürümler: yedi dersin 3 dakikalık sürümü (Ders 1, 4, 5, 6, 8, 9, 10) ve tam ders günleri için Ders 2
  ile Ders 7'nin 5 dakikalık sürümü, iki sesle; akşam seçeneği için Uykuya Geçiş. Öteki 5 ve 15 dakikalık sürümler Ana
  sayfa içindir (sahibinin "3-5-15" isteği; süre belgesi §0.8).
- PLAN.v2'nin planlayıcısı bugün 5–30 dk kurar (§B.3 test f). 3 dk için alt sınır ders verisiyle 3'e iner ve 3 dakikalık
  plan da aynı denetimlerden geçer (her ders, iki ses, üç hız; `pilot/timing.py` kalıbı).
- Ders 2'nin 5 dakikalık sürümü için pilotta üretilmemiş üç kısa metinli klip gerekir: `n1.soyle`, `c2.akis`,
  `n2.hatirla` (ders verisinde `short.belowSec: 360`; `render/units.json`'da yalnız uzun metinleri var). Örnek:
  `n1.soyle` kısa metni "Niyetini içinden bir kez söylemek yeterli."
- İçerik geldikçe yol kendiliğinden dolar: yayımlanmamış ders aday olmaz. Yalnız Derin Dinlenme yayımlanmışsa yoga yolda
  yalnız tam ders günlerinde görünür.
- Yol entegrasyonu en erken PLAN.v2 §E.7 adım 8'de (modül ve Gelişim bağlantısı) ve sahibin dinleyip onayladığı en az bir
  ders hazırken açılır. 15 dakikalık Ders 2 pilotunun dört karışımı ölçüldü ama sahibi henüz dinlemedi
  (`render/out/report.md`, "Kulakla dinleme yapılmadı"). Bu görevde ücretli üretim yapılmadı.

---

## 7. Kanıt (yalnız yoga-pilot dosyalarında doğrulanmış kayıtlar; PLAN.v2 Ek listesi)

| Kararda kullanıldığı yer | Kaynak | Ne diyor (sınırıyla) |
|---|---|---|
| Günlük 3 dk yol payı | Radin 2025, JAMA Netw Open, PMID 39808431, [DOI](https://doi.org/10.1001/jamanetworkopen.2024.54435) | Gerçek kullanımda meditasyona özgü süre günde ortalama 3,36 dk; kullanıcıların %69,7'si günde 5 dakikanın altında (n=1458). Etki değil, kullanım gerçeği |
| Kısa ders yan ürün değil | Moszeik 2025, PMID 40373021, [DOI](https://doi.org/10.1002/smi.70049) | 11 dk ve 30 dk yoga nidra doğrudan karşılaştırıldı (n=362); ikisi de küçük etki; 30 dk yalnız bir alt ölçekte farklı (d=0,10) |
| Pratiğin yol ile Ana sayfa arasında bölünebilmesi | Riordan 2024, PMID 38376930, [DOI](https://doi.org/10.1037/cou0000725) | Günde bir kez 20 dk ile iki kez 10 dk arasında fark bulunmadı |
| Her kısa ders karşılama ve kapanışla biter; ders parçalara bölünmez | Luu 2024, PMID 39690521, [DOI](https://doi.org/10.17761/2024-D-24-00021) | Travma-duyarlı yoga nidranın bileşenleri arasında uygun uzunluk ve hazırlık, yeterli yerleşme ve dışa dönüş var |
| Kapanış kısaltılmaz | Howard 2017, PMID 28300508, [DOI](https://doi.org/10.1080/00029157.2016.1203281) | Hipnozda uyandırma başarısızlığı, istenmeyen etkilerde önemli bir etken sayılıyor |
| Derin Dinlenme'nin 3 dakikalık sürümü yok | Tran 2021, PMID 34260686, [DOI](https://doi.org/10.1093/ageing/afab090) | 65 yaş üstünde ayağa kalkınca ilk anda görülen kan basıncı düşüşü, sürekli ölçümle havuzlanmış %29 |
| Sabah dersi sabah, uyku dersi gece | Baumel 2019, PMID 31573916, [DOI](https://doi.org/10.2196/14567) | Meditasyon uygulamalarında kullanımın iki tepesi sabah ve gece (tasarım çıkarımı) |
| Nefes'in 5 dk hedefi Ana sayfada kalır | Balban 2023, Cell Rep Med, PMID 36630953, [DOI](https://doi.org/10.1016/j.xcrm.2022.100895) | Günde 5 dk döngüsel iç çekme, 1 ay; olumlu duygulanımda meditasyondan fazla değişim; kaygıda gruplar arası fark yok (n=108) |

Yol durağında sağlık iddiası yoktur; kart yalnız ders adını ve süreyi yazar.

---

## 8. VARSAYIM listesi (kanıtın sayı vermediği tasarım değerleri; sahibinin onayına açık)

3. gün girişi (`totalDays ≥ 2`) · kısa ders 3 dk, tam ders 5 dk · tam ders için 6 kısa yoga günü · oturarak yapılan
derslerde 3 dakikalık sürümün yapılabileceği (her ders için ölçülecek) · Sabah Niyeti 05.00–12.00 · akşam 20.00
(PLAN.v2'deki Derin Dinlenme satırının saati) · yumuşak dönüş 14 gün (YOL.ilerleme ile aynı) · `dropRank: 1.8` · `order: 105` · nefes yolda
en çok 3 dk (YOL.ilerleme'nin sakinlik payı) · E testinde "en çok bir gün" (okuma testindeki VARSAYIM'ın aynısı) ·
"en az tamamlanan ders" seçimi · "Sonra yaparım" için bildirim yok · benzetimin girdisi olan ilerleme merdivenlerinin
hepsi (YOL.ilerleme §12 VARSAYIM listesi).

---

## 9. Sahibinin onayına dört nokta

1. **Meditasyon ayrı bir yol durağı olmasın; yoganın kısa dersleri yolun tek sakin durağı olsun.** Önerim bu. Ayrı
   durak istenirse ikisi `sessiz` dönüşümünü paylaşır (§5.5); gün tablosundaki süreler değişmez.
2. **Nefes yolda 3 dakikada dursun, 5 dakika Ana sayfada kalsın.** Önerim bu. Nefes 5'e çıkarsa benzetimde yol
   ortalaması 17,9 dk olur, yoga 2 gün yoldan düşer ve 7 gün başka bir durağı çıkarır.
3. **"Sonra yaparım" denince yol "tamam" sayılsın.** Yoga yolun gerçek durağıdır; ama bir gün yapılmaması ceza olmasın.
4. **Zor Anlar İçin sırasıyla yolda gelsin mi?** Önerim evet (PLAN.v2 §A.3 sırası). 3 dakikalık sürümü yalnız dayanak
   bloğudur (süre belgesi §0.4) ve açılışı koşulludur ("Zor bir andaysan…"). Sonundaki "Sık tekrarlarsa bir uzmanla
   konuşmak iyi olur. Acil durumda 112." kartı yoldan açıldığında da aynen çıkar. Hayır denirse ders `PATH_SEQ`'ten
   çıkar, Ana sayfada kalır; öteki her şey aynıdır.

Durağın adı yolda kısa kalır: "Yoga" (320 px). Bölümün Ana sayfadaki adı PLAN.v2 §G8 kararına bağlıdır.

---

## 10. Nasıl doğrulandı ve sınırları

- Benzetim: `scratchpad/yoga-v3/sim/yolsim_b.mjs`. Gerçek `buildPath` (üç ekli kopyası `today_patched.js`), gerçek
  `weeklyStatus` ve `readingStatus`, gerçek `modules/weekly` ve `modules/reading` manifestleri; öteki duraklar YOL.ilerleme
  §5 merdivenleriyle kurulmuş sahte manifestler. Çalıştırma: `node yolsim_b.mjs karar 10 30 --md` (ölçüt: `karar`,
  `yok`, `karar5`; saat; gün sayısı; atlanan günler). Öteki belgelerin okumaları bugünkü `today.js` ile
  `yolsim.mjs ilerleme|moduller` koşusunda.
- Nefes 3'te durmasaydı: `sim/yolsim_b_nocap.mjs karar 10 30` (§3.6 ve §9'daki sayılar).
- Eşdeğerlik: `scratchpad/yoga-v3/sim/esdeger.mjs` (20.000 bağlam, 0 fark).
- Sınırlar: ilerleme merdivenleri henüz kodda yok (VARSAYIM); benzetim göz bütçesi bağlamı vermez (varsayılan 5 dk,
  `lib/today.js:245`); Hızlı Bakış'ı hiç oynamamış kullanıcı; vitest koşulmadı (depoya önbellek yazmamak için); cihazda
  denenmedi. Bu belge bir plandır; hiçbir parçası "bitti" değildir.

---

## Ek A. 30 günün tam yolu (10.00'da açan kullanıcı, bu kararla)

"Başka nedenle düşen" sütunundaki Yılan düşüşleri R2'den (2. bölüm göz payı) gelir; yogasız koşuda da vardır.
"Dönüşümde bugün olmayan" duraklar grubundan başka birinin seçildiği duraklardır.

| Gün | D (bugün sayılmaz) | Ölçüm | 1. bölüm | Mola | 2. bölüm (yoga son durak) | Final | Toplam dk | Yoga yüzünden düşen | Başka nedenle düşen · dönüşümde bugün olmayan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | E testi | Haftalık E testi 5 · Çemberler 1 | Nefes 1 | Göz kırpma 1 | — | 8 | — | — |
| 2 | 1 | Okuma | Sağ–sol 1 · Çemberler 1 | Nefes 1 | Okuma 3 · Göz kırpma 1 · Yılan 2 | Bugünün görevi 1 | 10 | — | — |
| 3 | 2 | — | Isınma 1 · Çemberler 1 | Nefes 2 | Göz kırpma 1 · Yılan 2 · Yoga · Nefesin Ritmi 3 | Bugünün görevi 1 | 11 | — | — |
| 4 | 3 | — | Isınma 1 · Çemberler 1 | Nefes 2 | Yürüyüş 2 · Göz kırpma 1 · Yılan 2 · Yoga · Tek Nokta 3 | Bugünün görevi 1 | 13 | — | — |
| 5 | 4 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 | Nefes 3 | Yürüyüş 2 · Göz kırpma 1 · Yılan 2 · Yoga · Zor Anlar İçin 3 | Bugünün görevi 1 | 15 | — | Gökyüzü molası |
| 6 | 5 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Göz kırpma 1 · Yoga · Sabah Niyeti 3 | Bugünün görevi 1 | 16 | — | Yılan (düştü), Uzağa bakış |
| 7 | 6 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Göz kırpma 1 · Yoga · Sağlam Yer 3 | Bugünün görevi 1 | 16 | — | Yılan (düştü), Gökyüzü molası |
| 8 | 7 | E testi | Isınma 1 · Haftalık E testi 5 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Göz kırpma 1 · Tek Bakışta 2 | Bugünün görevi 1 | 19 | — | Yılan (düştü), Uzağa bakış, Fark Ettin mi? |
| 9 | 8 | Okuma | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Okuma 3 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Kendini Tanımak 3 | Bugünün görevi 1 | 20 | — | Yılan (düştü), Gökyüzü molası, Fark Ettin mi? |
| 10 | 9 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Daire 1 · Göz kırpma 1 · Yoga · Derin Dinlenme 5 | Bugünün görevi 1 | 20 | — | Yılan (düştü), Uzağa bakış, Tek Bakışta |
| 11 | 10 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Gelecekteki Sen 3 | Bugünün görevi 1 | 17 | — | Yılan (düştü), Gökyüzü molası |
| 12 | 11 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Yılan 2 · Yoga · Nefesin Ritmi 3 | Bugünün görevi 1 | 18 | — | Uzağa bakış |
| 13 | 12 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Yılan 2 · Yoga · Tek Nokta 3 | Bugünün görevi 1 | 17 | — | Gökyüzü molası |
| 14 | 13 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Daire 1 · Göz kırpma 1 · Yoga · Zor Anlar İçin 3 | Bugünün görevi 1 | 18 | — | Yılan (düştü), Uzağa bakış |
| 15 | 14 | E testi | Isınma 1 · Haftalık E testi 5 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 | Bugünün görevi 1 | 19 | — | Yılan (düştü), Daire, Gökyüzü molası |
| 16 | 15 | Okuma | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Yukarı–aşağı 1 · Okuma 3 · Göz kırpma 1 · Yoga · Sabah Niyeti 3 | Bugünün görevi 1 | 19 | Tek Bakışta | Yılan (düştü), Uzağa bakış, Daire |
| 17 | 16 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Sağlam Yer 3 | Bugünün görevi 1 | 17 | — | Yılan (düştü), Daire, Gökyüzü molası |
| 18 | 17 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Yoga · Kendine Şefkat 5 | Bugünün görevi 1 | 20 | — | Yılan (düştü), Uzağa bakış, Daire, Tek Bakışta |
| 19 | 18 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Kendini Tanımak 3 | Bugünün görevi 1 | 17 | — | Yılan (düştü), Yukarı–aşağı, Gökyüzü molası |
| 20 | 19 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Gelecekteki Sen 3 | Bugünün görevi 1 | 18 | — | Yılan (düştü), Uzağa bakış, Yukarı–aşağı |
| 21 | 20 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Yılan 2 · Yoga · Nefesin Ritmi 3 | Bugünün görevi 1 | 17 | — | Yukarı–aşağı, Gökyüzü molası |
| 22 | 21 | E testi | Isınma 1 · Haftalık E testi 5 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Daire 1 · Göz kırpma 1 | Bugünün görevi 1 | 20 | — | Yılan (düştü), Uzağa bakış, Yukarı–aşağı |
| 23 | 22 | Okuma | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Yukarı–aşağı 1 · Okuma 3 · Göz kırpma 1 · Yoga · Tek Nokta 3 | Bugünün görevi 1 | 20 | — | Yılan (düştü), Daire, Gökyüzü molası |
| 24 | 23 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Yılan 2 · Yoga · Zor Anlar İçin 3 | Bugünün görevi 1 | 18 | — | Uzağa bakış, Daire |
| 25 | 24 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Sabah Niyeti 3 | Bugünün görevi 1 | 17 | — | Yılan (düştü), Daire, Gökyüzü molası |
| 26 | 25 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Fark Ettin mi? 2 · Yukarı–aşağı 1 · Göz kırpma 1 · Yoga · Derin Dinlenme 5 | Bugünün görevi 1 | 20 | — | Yılan (düştü), Uzağa bakış, Daire |
| 27 | 26 | — | Isınma 1 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Sağlam Yer 3 | Bugünün görevi 1 | 17 | — | Yılan (düştü), Yukarı–aşağı, Gökyüzü molası |
| 28 | 27 | — | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Tek Bakışta 2 · Yoga · Kendini Tanımak 3 | Bugünün görevi 1 | 18 | — | Yılan (düştü), Uzağa bakış, Yukarı–aşağı |
| 29 | 28 | E testi | Isınma 1 · Haftalık E testi 5 · Uzağa bakış 1 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Göz kırpma 1 · Yılan 2 | Bugünün görevi 1 | 19 | — | Yukarı–aşağı, Gökyüzü molası |
| 30 | 29 | Okuma | Isınma 1 · Gökyüzü molası 2 · Çemberler 1 · Yakın–uzak 1 | Nefes 3 | Yürüyüş 2 · Daire 1 · Okuma 3 · Göz kırpma 1 · Yoga · Gelecekteki Sen 3 | Bugünün görevi 1 | 19 | Fark Ettin mi? | Yılan (düştü), Uzağa bakış, Yukarı–aşağı |
