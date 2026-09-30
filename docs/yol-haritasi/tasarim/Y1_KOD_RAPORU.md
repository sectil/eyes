# Y1 kod raporu · Sonsuz yol, ilerleme motoru (düzeltme turu)

Tarih: 2026-09-30. Kapsam: onaylı `SONSUZ_YOL.PLAN.v1.md` §3.A (A.1–A.10), §3.G (G.1, G.3 Y1 satırı, G.4, G.5, G.6 Y1
kısımları), §3.H. Onaylı yoga planıyla uyum: `yoga-pilot/v3/PLAN.v3.md` §B (5 dakikalık nefes Ana sayfada kalır, yolda
en çok 3 dk).

**Durum: `[~]`.** Kod ve testler bitti; bütün takım yeşil, ilerleme kapalıyken eşdeğerlik 0 fark. Cihazda denenmedi.
Metin kapısından (iki bağımsız model incelemesi ve sahibin onayı) geçmesi gereken üç yeni cümle var (§6). Git
kullanılmadı. `modules/yoga/*`, `lib/yoga*.js`, `ios/*`, `lib/native.js`, `lib/dalgaSleep.js`, Apple ve Google girişi
değişmedi. Yeni npm bağımlılığı yok.

## 1. Tek bakışta

- Üç inceleme (eşdeğerlik, nefes ve metin, doğruluk) aynı sorunları birden çok kez verdi. Ayrı ayrı sayınca 3 BLOCKER'ın
  3'ü, 11 SHOULD'un 11'i düzeltildi; 14 NIT'in 11'i koda işlendi, biri bilgiydi, biri §7'ye geçti. Her düzeltmenin testi
  var. Bu turda eklenen ya da değişen testlerin 36'sı düzeltmeden önceki kodda kırmızı, şimdi yeşil (kanıt: §4.4).
- Açık kalan tek NIT, kanıt satırının yanına bir sınır cümlesi eklemektir. Yeni bir cümle gerektirdiği için metin
  kapısına bırakıldı (§6).
- Sahibe söylenecek altı nokta §7'de. En önemlileri: D katmanında seçilebilen nefes bileşimi 629 değil, 230'dur; eski
  kullanıcının yolunda nefes 2 dk kısalınca 20 dk sınırında yer açılır.

## 2. Değişen dosyalar

Yollar `app/src/` altındadır. **K**: bu turda değişti. Öteki dosyalar Y1'in ilk turundandır ve bu turda değişmedi.

| Dosya | Ne |
|---|---|
| `lib/progression.js` **K** | İlerleme bağlamı, `stageOf`, `unlocked`, `newStopKeys`, `restDecision`, `pathRestMinutes`. Bu tur: kısa E testi `pathDay`'e sayılmaz; manifestin `progression.ladder` ve `progression.unlock` alanları okunur; "Yeni" rozetinde 1. gün durakları ve eski kullanıcının güncelleme günü; ara kilidinde Y1 kuralı yalnız nefes 3 dk'dan kısayken uygulanır; `used` karşılaştırması Y1 öncesiyle birebir aynıdır; mola süresi, mola sürerken ve bittikten sonra 5 dk olarak yazılır |
| `lib/ladders.js` **K** | Merdivenler. Bu tur: `DAY_ONE`, `UPDATE_NEW` |
| `lib/breathMix.js` **K** | "Bugünün ritmi" üreteci. Bu tur: Sakin ritim tutmasız; kutu alış = veriş; etikette sayıların yeri her ailede aynıdır (bekleme varsa dört sayı); Sakin ritim de haftada en çok 3 gün; ilk "Günün ritmi" günü dünkü 4 · 6'yı vermez; `selectable` |
| `lib/stats.js` **K** | Etkinlik geçmişi basamaklı grubu yoldaki adıyla yazar (2. gün "Sağ–sol") |
| `lib/routines.js` | `dikey` grubu, çeşitleme yaması |
| `modules/registry.js` | Tek kural: `progression` varsa `match` işlev olmalıdır |
| `modules/pathContext.js` **K** | Ekranların ilerleme bağlamı; bu tur: kayıtlar ve gün aynıysa önbellekten |
| `modules/breath/manifest.js` **K**, `modules/breath/view.jsx` **K** | Yol durağı 1 → 2 → 3 dk; bu tur: Ana sayfa önerisi için ayrı rota `breath-5` (her zaman 5 dk) |
| `modules/routine/manifest.js` **K**, `modules/routine/view.jsx` | Göz merdiveni; bu tur: Daire ile Yukarı–aşağı gün aşırı (`rotationRanks`), kilit ekranında yoldaki ad |
| `modules/snake`, `fark-ettin`, `tek-bakis`, `notice` manifestleri | Açılma eşikleri; Bugünün görevi ilerleme yokken eski kuralla |
| `screens/Home.jsx` **K** | İlerleme bağlamı bir kez; ara kilidi `restDecision`; bu tur: göz molası önerisi `breath-5` açar ve molayı Y1 öncesi kuralla başlatır; bant için `restStarted`; TodayPath'e `staged` |
| `screens/Breath.jsx` **K** | "2 dk daha", tutma ön koşulu, günün kalıbı; bu tur: boş "nasıl yapılır" listesi çizilmez |
| `screens/Routine.jsx` **K** | Kayıtta `stage`, `variant`; bu tur: adım kimlikleri `stepIds` alanında, `steps` hareket sayısı olarak kalır |
| `components/TodayPath.jsx` **K**, `styles/todaypath.css` **K** | "Yeni" rozeti, mola süresi; bu tur: baloncukta S0 kararı 8'in metni; Ç17 yıldızı ve 320 pt düzeltmesi yalnız `staged` yolda |
| Testler | `lib/progression.test.js` **K**, `lib/ladders.test.js`, `lib/breathMix.test.js` **K**, `lib/today.test.js` **K** (yalnız Y1'in eklediği bloklar; 45 eski test aynen), `modules/registry.progression.test.js`, `modules/routine/manifest.test.js` **K**, `modules/routine/view.test.jsx` **K**, `modules/breath/manifest.test.js`, `modules/pathModules.equiv.test.js`, `screens/Breath.path.test.jsx` **K**, `screens/Routine.record.test.js` **K**, `screens/Home.progression.test.jsx`, `screens/Home.suggest.test.jsx` (**yeni**), `components/TodayPath.yeni.test.jsx` **K** |
| `site/pages/index.html` **K**, `site/index.html` **K** (üretildi: `node scripts/pages.mjs`; başka sayfa değişmedi), `site/public/screens/home-path-light.webp` **K**, `home-path-dark.webp` **K** | §G.3 Y1 satırı: yolun görseli ve metni. Nefes 3 dk, "Mola · 5 dk", ilk gün 8 dk |
| `app/_harness/y1path.html`, `y1path.jsx` (**yeni**, yalnız geliştirici düzeneği, derlemeye girmez) | Site görselinin çekildiği sayfa |

Dokunulmayanlar: `lib/today.js` (motor ve `jevLine` değişmedi), `lib/homeSuggest.js`, `lib/pathLater.js` ("Sonra yaparım"
kaydı ilerleme bağlamında taşınır, yoga `ctx.later`'ı okur), bütün yoga dosyaları.

## 3. Bulgular ve sonuçları

Önem: B BLOCKER, S SHOULD, N NIT. Aynı bulguyu birden çok inceleme verdiyse tek satırdır.

| # | Bulgu | Önem | Sonuç | Test |
|---|---|---|---|---|
| 1 | Mola bandı, 5 dk'lık yol molası sürerken ve bittikten sonra "Mola · 3 dk" yazıyordu | B | Düzeltildi. Yolun molası sürüyorsa ya da bugün başladıysa (`eyeBudgetStore.restHistory`) bant 5 dk yazar. Nefes durağı bittiyse ve yolun molası başlamadıysa (1.–2. gün) nefesin süresini yazar | `progression.test.js` "yolun molası sürerken ve bittikten sonra 5 dk"; `Home.suggest.test.jsx` bant testi: 80 günlük eski kullanıcı, dört durum; düzeltmeden önce "Mola · 3 dk" |
| 2 | Ana sayfanın "Nefes · 5 dk" ve "5 dk mola" önerisi yolun basamağını açıyordu (1, 2 ya da 3 dk) | B | Düzeltildi. Öneri ayrı rotayla açılır (`breath-5`): her zaman 5 dk, basamaksız, kayda `stage` yazılmaz. Mola Y1 öncesi kuralla başlar, yeni kullanıcının yol istisnası öneriye uygulanmaz. `lib/homeSuggest.js` ve testi değişmedi. Yolun durağı yine `breath-rest` | `Home.suggest.test.jsx`: birincil ve sakin seçenek `breath-5`; ekran 300 sn, `stage` yok; yol durağı `breath-rest` ile 1 dk |
| 3 | `Breath.path.test.jsx` "2 dk daha" testi yük altında zaman aşımına düşüyordu | B | Düzeltildi. Adım 250 ms'den 1–2 sn'ye çıktı, iki teste 30 sn süre verildi. Test 2842 ms'den ≈ 0,8 sn'ye indi | Bütün takım koşuları yeşil (§4.1) |
| 4 | 2. ve 3. günde ara kilidi eşikte duruyordu; bant gün içinde 3 ↔ 5 değişebiliyordu | S | Düzeltildi. Y1 kuralı yalnız yoldaki nefes 3 dk'dan kısayken uygulanır. 3. günden başlayarak Y1 öncesi kural geçerlidir: mola 5 dk, kullanılan saniyelere bağlı değil (S0 kararı 8). 2. gün (2 dk nefes) plan §3.A.8-6 kuralıyla karar verir (§7 madde 3) | `today.test.js` gerçekçi kullanılan süreler 1,6–2,6 dk, 2.–5. gün; `progression.test.js` "3 dk'lık nefeste bugünkü kural" |
| 5 | Baloncuk "Sırada Nefes · 5 dk mola" yazıyor, durak "Nefes · 3 dk" diyordu | S | Düzeltildi. Mola nefesten uzunsa baloncuk S0 kararı 8'in metnini yazar: "Sırada mola: 3 dk nefes, 2 dk dinlenme". Mola nefes kadarsa "Sırada Nefes · 1 dk mola". Metin kapısı bekliyor (§6) | `TodayPath.yeni.test.jsx` |
| 6 | §G.6 izinli listesi eksikti (nefes kısalınca 20 dk sınırında yer açılması, yoganın yer vermesi, yumuşak dönüş) | S | Testle sabitlendi, sahibe tek cümle (§7 madde 2). Plan metni değişmedi | `today.test.js` "fark (1)" ve "fark (2)" |
| 7 | `Breath.path.test.jsx` zamanlaması | S | #3 ile aynı | — |
| 8 | Site yol görseli ve metni güncellenmemişti | S | Düzeltildi. Görseller gerçek uygulamadan çekildi (390 pt, iki tema); alt metin ve figcaption yenilendi; derlenmiş `site/index.html` üretildi. Metin kapısı bekliyor (§6). `site/dist` yeniden derlenmedi; site Y1 sürümüyle aynı gün yayınlanmalı | 390 ve 320 pt'de görsel denetim, taşma yok |
| 9 | Tutmasız kutunun etiketi ("3 · 4,5 · 2") tutmalı kalıp gibi okunuyordu | S | Düzeltildi. Sayıların yeri her ailede aynı aşamadır (al · tut · ver · bekle). Bekleme varsa dört sayı yazılır, sıfır tutma da ("4 · 0 · 4 · 2") | `breathMix.test.js` "her ailede aynı konum aynı aşamadır" (3 katman × 400 gün) |
| 10 | "Kutu" adıyla kutu olmayan kalıplar geliyordu (ör. al 6, ver 8, bekle 1) | S | Düzeltildi. Kutu ailesi alış = veriş ister (plan §A.4 "yumuşak kutu, ör. 4·2·4·2"; tutma isteğe bağlı, `PATTERNS.box` "0 yap"). Zarftaki bileşim sayısı değişmedi (B 40, C 99, D 629); seçilebilen D 230'dur (§7 madde 1) | `breathMix.test.js` "seçilebilen bileşim" ve 2 yıllık katman testleri |
| 11 | Tutmalı gün "Sakin ritim" ailesine düşüp "Güçlü kanıt" rozetiyle görünebiliyordu | S | Düzeltildi. Sakin ritim ve Eşit ritim tutmasızdır; tutma günleri Karın nefesi, Vızıltı ve Burun değiştir'dedir | `breathMix.test.js` katman testleri |
| 12 | Sakin ritim "haftada en çok 3 gün" kuralından muaftı (plan istisnasız diyor) | S | Düzeltildi. İstisna kalktı. Yedek de kurala uyar: günün türünde aile kalmazsa düz güne düşülür | `breathMix.test.js` "365 farklı başlangıç × 120 gün" ve 2 yıllık pencere testleri |
| 13 | Daire ile Yukarı–aşağı gün aşırı değil, dörder günlük bloklarla geliyordu | S | Düzeltildi. Bugünden önce en son yapılanın ötekisi gelir; ikisi de yapılmamışsa yerel günün tekliği karar verir. `lib/today.js` değişmedi. 9. gün Daire, sonra her gün sırayla; eski kullanıcının güncelleme günü Yukarı–aşağı | `routine/manifest.test.js` "9.–40. gün sırayla"; `today.test.js` 9.–45. gün |
| 14 | Egzersiz ekranında ilerleme bağlamı saniyede bir baştan hesaplanıyordu (730 günde ≈ 121 ms) | S | Düzeltildi. `pathCtx` aynı kayıt dizileri ve aynı gün için önbellekten verir. `App.jsx`'e dokunulmadı | `routine/view.test.jsx`: 2 yıllık geçmişte 200 çizim aynı nesne, toplam < 200 ms |
| 15 | İlerleme kapalıyken de TodayPath çıktısı değişiyordu (Ç17 yıldızı, 320 pt baloncuğu) | N | Düzeltildi. S0 çizimleri yalnız `staged` yolda (Ana sayfa, ilerleme bağlamıyla). İlerleme kapalıyken çizim Y1 öncesiyle aynıdır | Düzenek: 400 bağlam, 0 fark; `TodayPath.yeni.test.jsx` |
| 16 | K2 gününde kilit ekranı "Devam: ısınma egzersizi", geçmiş "Isınma" diyordu | N | Düzeltildi. Kilit ekranı yoldaki adı yazar ("sağ–sol egzersizi"); geçmiş, kaydın `stage` alanından "Sağ–sol" yazar. İlerleme yokken ikisi de eskisi gibidir | `routine/manifest.test.js`, `Routine.record.test.js` |
| 17 | Kayıttaki `steps` alanının türü değişiyordu | N | Düzeltildi. `steps` hareket sayısı olarak kalır, adım kimlikleri yeni `stepIds` alanındadır (§7 madde 5) | `Routine.record.test.js` |
| 18 | Manifestin `progression.ladder` ve `unlock` alanları okunmuyordu | N | Düzeltildi. `progressionCtx` bunları `mod[id]`'ye taşır (yalnız manifest verirse); `stageOf`, `unlocked` ve `newStopKeys` okur | `progression.test.js` "manifestin kendi merdiveni" |
| 19 | Sakin ritim gününde "nasıl yapılır" listesi boş kalıyordu | N | Düzeltildi. Boş liste çizilmez; süreleri adım kutuları gösterir. Yeni cümle yazılmadı | `Breath.path.test.jsx` |
| 20 | `restDecision`: `used` Infinity ya da dize olunca Y1 öncesinden farklıydı | N | Düzeltildi. Karşılaştırma Y1 öncesiyle birebir aynıdır | `progression.test.js`; düzenek kenar değerleri |
| 21 | Yoga testlerindeki kırmızılar | N | Bilgi. Y1 ile ilgili değil (yoga iş akışının dosyaları); bu turun koşularında yoga testleri yeşil | — |
| 22 | İlk "Günün ritmi" günü dünkü Sakin ritim 4 · 6'yı verebiliyordu | N | Düzeltildi. Dünün kaydında kalıp yoksa dün 4 · 6 sayılır | `breathMix.test.js`: 3.650 gün × 3 katman, hiç 4 · 6 yok |
| 23 | Kanıt satırı günün kalıbının yanında sınandığı sanılabilir | N | **Açık.** Yeni bir sınır cümlesi gerekiyor; metin kapısına bırakıldı (§6) | — |
| 24 | "Yeni" rozeti: 1. gün atlanan Çemberler 2.–7. günlerde "Yeni" oluyordu; eski kullanıcı Yukarı–aşağı'yı ve Bugünün görevi'ni rozetsiz görüyordu | N | Düzeltildi. 1. günden yolda olan duraklar (E testi, Çemberler) hiç "Yeni" olmaz. Eski kullanıcının güncelleme gününde (§3.A.10: Dstage 0, D ≥ 14) Yukarı–aşağı, nefesin "Günün ritmi" ve hiç yapılmamışsa Bugünün görevi rozetlidir; Y1 öncesi yoldaki duraklar rozetsizdir | `progression.test.js` iki test |
| 25 | `pathRestMinutes` yorumu "3. günden 5 dk" diyordu, kod 3. günde 3 yazıyordu | N | #4 ile giderildi: 3. günden 5 dk | `today.test.js` |
| 26 | Dönüşümde eşitlik UTC gününe bağlıydı (TR'de 03.00'te değişebiliyordu) | N | #13 ile giderildi: eşitlikte yerel gün | `routine/manifest.test.js` "rotationRanks" |
| 27 | `pathDay` yolda olmayan kısa E testini de sayıyordu | N | Düzeltildi. Kısa E testi (`daily`) sayılmaz, kendi D sayacı tutulur | `progression.test.js` |
| 28 | Plan §G.6 metni izinli listeyi eksik veriyor | N | #6 ile aynı; §7 madde 2 | — |
| İSTEK | `jevLine` ve `TodayPath:340` molayı nefes süresi sanıyordu; `homeSuggest` 3 dk açıyordu; `mixLabel` tutmasız kutu | — | #1, #2, #5 ve #9 ile giderildi. `App.jsx`'e bağlam vermek yerine `pathCtx` önbelleği (#14) | — |

## 4. Sayılar

### 4.1 Test ve derleme

- Bütün takım (`npx vitest run`, `app/` içinde): **136 dosya, 1854 test, hepsi yeşil**; üç ayrı koşuda üçü de yeşil (yoga
  testleri dahil). Bu turdan önce 135 dosya, 1822 test yeşildi.
- §G.5'teki testler değişmedi: `lib/today.test.js`'in 45 eski testi (Y1 yalnız yeni bloklar ekler), `TodayPath.test.jsx`,
  `registry.test.js`, `dataHub.test.js`, `progress.test.js`, `breath.test.js`, `homeSuggest.test.js`, `notifyLog.test.js`,
  `notifyPlan.test.js`. Y1 öncesi kopyayla satır satır karşılaştırıldı: silinen ya da değişen satır 0. §G.4'teki satırlar
  Y1'de değişmez; Y1 hiçbir mevcut beklentiyi değiştirmedi.
- `npm run build`: başarılı (4,2 sn). 500 kB'lık parça uyarısı önceden de vardı.

### 4.2 Eşdeğerlik (§G.6)

| Düzenek | Bağlam | Sonuç |
|---|---|---|
| `esdeger_y1.mjs` koşu 1, ilerleme kapalı (yol, bölümler, sıradaki, `allDone`, `minutesLeft`, mola ve kilit; ara kilidi; Bugünün görevi) | 20.000 | **0 fark** (ara kilidi 0, Bugünün görevi 0) |
| İnceleme düzeneği `a_off`: `buildPath`, `jevLine`, `restDecision`, Bugünün görevi; `progression` yok, `undefined`, `null` | 60.000 | **0 fark**; `pathRestMinutes` hepsinde `null`, "Yeni" rozeti 0 |
| İnceleme düzeneği `c_render`: TodayPath, Nefes ve göz egzersizi ekranlarının çizimi, ilerleme kapalı | 400 + 6 + 12 | **0 fark** (önceki turda TodayPath 400/400 farklıydı) |
| `today.test.js` kalıcı eşdeğerlik, ilerleme kapalı | 3.000 | 0 fark |
| `pathModules.equiv.test.js`, ilerleme kapalı | 5.000 | 0 fark |
| `esdeger_y1.mjs` koşu 2, ilerleme açık, eski kullanıcı (D ≥ 60, Dstage 0–60) | 20.000 | İzinli liste dışında **0 fark** (manifest katmanı 0, yol katmanı 0), ara kilidi 0 fark. İzinli farklar: nefes payı 20.000, göz çeşitlemesi 17.005, Bugünün görevi 8.986, Daire ile Yukarı–aşağı 5.003, "Yeni" rozeti 1.005, tam set günü 995. 20 dk sınırında geri gelen durak 11.005 bağlamda (§7 madde 2) |
| `esdeger_y1.mjs` koşu 3 (bilgi), 14–60 gün sonra dönen eski kullanıcı | 5.000 | Manifest dışı 0, ara kilidi 0. Yol dışı 1: düzeneğin rastgele "bugün Daire yapıldı" kaydı yumuşak günde (K6, Daire yok) yolda görünmüyor; gerçekte olamaz, çünkü yol grubu ancak o günün yolundan açılır. Bu turdan önce de aynıydı |

Düzenekler: `scratchpad/y1-5sn/esdeger/esdeger_y1.mjs` (sonuç `scratchpad/y1fix/esdeger_20000.txt`),
`scratchpad/y1fix/eq/harness/` (Y1 öncesi kopyaya ve çalışan ağaca bağlı).

### 4.3 Benzetim (§A.9)

Gerçek kodla (`scratchpad/y1-5sn/esdeger/sim_gercek.mjs`) ve planın benzetimiyle (`arastirma-v1/sim_merdiven.mjs`):

| Senaryo | Plan §A.9 | Gerçek kod |
|---|---|---|
| 5 dk bütçe, 10.00, 30 gün | 8 / 18 / 15,3; > 20 dk 0; yoga 24 (tam ders 3) | 8 / 18 / 15,3; 0; 24 (3) |
| 5 dk bütçe, 10.00, 90 gün | 15,7; yoga 76 | 8 / 18 / 15,7; 0; 76 (10) |
| 5 dk bütçe, 19.00, 90 gün | 15,7; yoga 76 | 8 / 18 / 15,7; 0; 76 (10) |
| 3 dk bütçe, 30 / 90 gün | 8 / 15 / 12,7 · 8 / 16 / 12,9 | 8 / 15 / 12,5 · 8 / 15 / 12,8 |

Gün gün: Daire ile Yukarı–aşağı aynı durak sayılınca 30 günün 30'u ve 90 günün 85'i benzetimle birebir aynıdır. Kalan 5 gün
V4 tam set günüdür: benzetim tam set gününü içermez, dakika aynıdır. Benzetim Daire ile Yukarı–aşağı'yı dörder günlük
bloklarla veriyor; kod planın metnindeki gibi gün aşırı veriyor (§7 madde 4). 3 dk bütçe satırındaki fark bu turdan
önce de vardı (§7 madde 4).

### 4.4 Düzeltmeden önce kırmızı

Bu turda eklenen ya da değiştirilen testler, düzeltmeden önceki Y1 koduna (`scratchpad/y1fix/prefix`, incelemenin
kopyası) karşı koşuldu: 9 dosyanın 197 testinden **36'sı kırmızı**, şimdi 197'si yeşil. Aralarında mola bandı ("Mola · 3 dk" yerine 5 dk), öneri
rotası, 2. ve 3. gün kararı, dönüşüm, Sakin ritim sınırı, etiket, kutu, önbellek, "Yeni" rozeti ve çizim testleri var.

## 5. Cihaz listesi (§H Y1)

Her madde `HATA_GUNLUGU`'na yazılır. İlk yedisi plandandır, sonrakiler bu turun düzeltmelerini cihazda sınar.

1. Yeni kurulum: 1. gün (8 dk; Nefes 1 dk; bant "Mola · 1 dk"; nefesten sonra kilit yok), 2. gün, 4. gün, 9. gün (Daire).
2. Eski hesap, ilk açılış: merdivenin üstünde; göz çeşitlemesi yok; nefeste "Günün ritmi" tutmasız; "Yeni" rozeti yalnız
   Yukarı–aşağı, Nefes ve (hiç yapılmadıysa) Bugünün görevi'nde.
3. Ara kilidinin 1. ve 2. günkü hissi. 2. günde 1. bölüm 2 dk'dan uzun sürerse mola 5 dk olur ve bant bunu yazar.
4. Yolu gün içinde ara vererek yapan kişide molanın başlayıp başlamadığı.
5. V3 kırpma grubunun gerçek süresi (≤ 75 sn).
6. "2 dk daha": 3 dk bitince çıkar, 5 dk'ya tamamlar, "Zorlandım"da çıkmaz.
7. 390 ve 320 pt, iki tema: bant, baloncuk, bölüm etiketi kabın içinde; ilk yıldız etiketin altında.
8. Ana sayfa "Nefes · 5 dk" önerisi ve "5 dk mola" sakin seçeneği: 1. gün, 2. gün ve eski hesapta 5 dk açılır.
9. Bant eski hesapta nefese dokunmadan önce, mola sürerken, nefes bitip kilit sürerken ve mola bitince "Mola · 5 dk".
10. Baloncuk 3. günden "Sırada mola: 3 dk nefes, 2 dk dinlenme", 1.–2. gün "Sırada Nefes · 1 dk mola" (2 dk).
11. Daire ile Yukarı–aşağı: iki gün üst üste açınca sırayla gelir.
12. 2. gün kilit ekranı "Devam: sağ–sol egzersizi"; Takvim'de kayıt "Sağ–sol".
13. Göz egzersizi sırasında takılma yok: 1 yıllık geçmişi olan hesapta TrueDepth'li egzersiz.
14. Nefes ekranında "Bugünün ritmi" satırı: kutu gününde dört sayı; Sakin ritim gününde ayrıntıda boş liste yok.

## 6. Metin kapısı bekleyen cümleler

Makine denetiminden geçti: yasak sözcük ve sağlık iddiası yok, ekranda ne yazıyorsa o olur. İki bağımsız model incelemesi
ve sahibin onayı bekleniyor.

1. Baloncuk (S0 kararı 8'in metni): "Sırada mola: 3 dk nefes, 2 dk dinlenme" (sayılar mola ve nefes süresinden).
2. Site alt metni: "Haftalık E testinin olmadığı bir günün yolu: ısınma ve uzağa bakış tamam, sırada çemberler; ardından
   yakın–uzak ve 3 dakikalık nefesle başlayan 5 dakikalık mola; yolda E testi yok".
3. Site figcaption: "Yol ilk gün 8 dakikadır ve her gün bir adım büyür. Göz hareketleri, uzağa bakış, bakışla oynanan bir
   oyun ve 3 dakikalık nefesle başlayan 5 dakikalık mola sırayla gelir; tam yol yaklaşık 15 dakika sürer. E testi haftada
   bir gün yola eklenir."
4. Açık (NIT #23): "Bugünün ritmi" satırının altındaki kanıt cümlesi ailenin temel kalıbından. Öneri: altına tek bir
   sınır cümlesi ("Kanıt bu ailenin temel kalıbından; bugünkü süreler çeşitleme içindir.") ya da kartta `blurb`, kanıt
   ayrıntıda. Kod yazılmadı.

Etiket biçimi değişti ama yeni sözcük yok: bekleme günü "Bugünün ritmi: 4 · 0 · 4 · 2".

## 7. Sahibe söylenecekler ve plan düzeltmeleri

1. **Nefes bileşimi sayısı.** Plan §1 ve §A.4 "43. günden başlayarak 629 bileşimden seçilir" diyor. 629 zarftaki süre
   bileşimidir. Beklemeli 472 bileşimin çoğu kutu biçiminde değildi (ör. al 6, ver 8, bekle 1) ama "Kutu" adıyla ve kutunun
   kanıt satırıyla görünüyordu. Kod artık yalnız ailesinin adına uyan bileşimi seçer: 157 beklemesiz + 73 yumuşak kutu =
   **230**. "Yüzlerce bileşim" sözü tutar. Öbür yol (629'u koruyup kutu olmayanlara yeni bir aile adı ve kanıt metni
   yazmak) yeni kanıt ve metin ister. Plan düzeltmesi: "629 bileşim zarfta; ailesine uyan 230'u seçilir".
2. **Eski kullanıcının yolu, tek cümle:** "Yolda nefes 5 dakikadan 3'e indiği için 20 dakikalık sınırda yer açılır:
   eskiden o gün düşen bir durak (çoğu Daire ya da Yukarı–aşağı, Fark Ettin mi? ya da yoga) artık yolda kalır; 14 günden
   uzun aradan sonra dönen kişi o gün bir basamak hafif yol görür." §G.6 izinli listesine eklenmeli; iki testle
   sabitlendi. Yoga ancak sığmadığında (R7b) yer verir.
3. **2. günün molası.** S0 kararı 8 "2. gün mola 2 dk, nefesle biter" diyor. Plan §3.A.8-6 ise "kullanılan göz süresi +
   2. bölümün göz dakikası > bütçe" ise molanın başlamasını istiyor. 2. günde bu toplam tam 5 dk'dır: 1. bölüm 2 dk'dan uzun
   sürerse mola 5 dk olur ve bant bunu yazar. 3. günden başlayarak karar eşiğe bağlı değildir (her zaman 5 dk).
4. **Benzetim ve plan metni.** Plan metni Daire ile Yukarı–aşağı'nın gün aşırı geldiğini söylüyor; planın benzetimi dörder
   günlük bloklar veriyordu. Kod metne uyar (dakikalar aynı). 3 dk bütçe satırında kod 12,5 / 12,8 dk ve en uzun 15 dk
   veriyor (plan 12,7 / 12,9 ve 15 / 16). Nedeni, kodda Yukarı–aşağı'nın Daire'nin düşme sırasını taşıması; benzetimde
   düşmüyordu. Bu, bu turdan önce de böyleydi. Plan tablosu düzeltilmeli.
5. **Veri alanı.** Plan §A.8-4 ve §A.10 göz egzersizi kaydı için `steps` diyor. Bu alan zaten hareket sayısıydı; adım
   kimlikleri yeni `stepIds` alanına yazıldı ("veride yalnız yeni alanlar eklenir"). Plan düzeltmesi: `steps` → `stepIds`.
6. **Kod ajanlarının kararları (onay bekliyor):** tam set gününün adı "Normal set" (EDİTÖR); yolun Nefes durağı kayıtlı
   süre tercihini değil basamağı açar, ekranda değiştirilen süre geçerlidir; 90. günden sonraki nefes odak haftası Y1'de
   yok. Kısa E testi `pathDay`'e sayılmaz (plan: "yola ait kayıt").

Ek notlar: S0 kararı D8 `lib/today.js:431`'i değişecek dosya sayıyor; baloncuk metni `TodayPath.jsx`'te uygulandı,
`lib/today.js` değişmedi. Site görselleri ve metni, uygulamanın Y1 sürümüyle aynı gün yayınlanmalı; `site/dist`
yayın sırasında derlenir. Ç17 yıldızı ve 320 pt düzeltmesi yalnız ilerlemeyle kurulan yolda çizilir; üretimde yol her
zaman böyledir.

## 8. §7'deki altı notun kararı (2026-09-30)

Sahip onayı devretti: "Senin için onayda; mükemmelse onay, değilse onaylama, tekrar gözden geçir." Her not plana ve koda
karşı okundu.

1. **Onay.** 230 bileşim doğru seçim: "Kutu" adı ve kanıtı kutu olmayan kalıba verilmez. Plan §1 ve §A.4 düzeltmesi:
   "629 bileşim zarfta; ailesinin adına uyan 230'u seçilir".
2. **Onay.** Eski kullanıcının yolunda açılan yer iki testle sabit; §G.6 izinli farklar listesine §7-2'deki cümleyle girer.
3. **Onay, plan metni düzeltilerek.** 2. günün 5 dk'ya çıkması S0 kararı 8'i bozmaz: 1. bölüm uzarsa göz bütçesi
   (5 dk) dolar; bütçe kuralı "aynen" korunur ve bant 5 dk yazar. D8 cümlesine eklenir: "1. bölüm uzar da göz bütçesi
   dolarsa mola 5 dakikadır; bant bunu yazar."
4. **Onay.** Plan tablosu koda göre düzeltilir: 3 dk bütçe 12,5 / 12,8 dk, en uzun 15 dk; Daire ile Yukarı–aşağı gün aşırı.
5. **Onay.** `steps` hareket sayısı olarak kalır; adım kimlikleri `stepIds` (veride yalnız yeni alan). Plan §A.8-4, §A.10.
6. **Onay.** "Normal set" Ana sayfadaki setin adıyla aynı, yeni sözcük değil; yol Nefes durağı basamağı açar; 90. gün
   sonrası odak haftası Y2'ye; kısa E testi `pathDay`'e sayılmaz (plan: "yola ait kayıt").

§6'daki üç cümle ve NIT #23 metin kapısında (iki bağımsız inceleme: B1a metin iş akışı); §5'teki 14 madde cihaz işi.
