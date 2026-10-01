# Yoga · Süreler ve ders yapısı: ilk yayında 3, 5 ve 15 dakika, sonra 30 dakika

Tarih: 2026-09-29. Konu: sahibinin son talimatı ("10 ders ve her ders 30 dakikadan planlanmıştı… ilk etapta 3-5-15
dakika gibi bölümler olacak"). Depoda hiçbir dosya değişmedi, git yazma komutu çalışmadı, ücretli ElevenLabs çağrısı
yapılmadı. Bütün hesaplar depo dosyalarını yalnız okuyan betiklerle bu klasörde yapıldı:
`calc/measure.py` (ölçülen süre ve hız), `calc/short.py` (3, 4 ve 5 dk planları), `calc/check5.py` (ölçülmüş sürelerle
denetim), `calc/tables.py` (çapa tabloları ve hece bütçesi). `calc/` altındaki `timing.py` ve `ders2.lesson.json`
pilot dosyalarının kopyasıdır.

Kanıt kuralı: bilimsel iddialar yalnız yoga-pilot dosyalarının ikinci turda doğrulanmış kayıtlarından alındı ve PMID ile
DOI taşır. Kanıtın sayı vermediği her değer **VARSAYIM** diye işaretlidir. Kod ve veri iddiaları `dosya:satır`
biçimindedir; hepsini bu görevde kendim okudum.

---

## 0. Kısa cevap

1. **Evet, on dersin her biri 30 dakika olarak tasarlandı.** PLAN.v2 her derse 5/10/15/20/30 dk çapa planı verir
   (PLAN.v2.md:603-769) ve 30 dakikalık dikkat eğrisini ayrıca tanımlar (PLAN.v2.md:455-472). Bugünkü alt sınır
   5 dakikadır: ders verisinde `minutes.min = 5` (pilot/ders2.lesson.json:11-15), planlayıcı testinde
   `MINUTES = range(5, 31)` (pilot/timing.py:65).
2. **3, 5 ve 15 dakika aynı dersten kurulur; ayrı ders yazılmaz.** Planlayıcı önek kuralıyla çalışır, yani 5–15 dk
   arasındaki her plan 15 dakikalık planın alt kümesidir (timing.py:22). Bu yüzden bir dersin 15 dk sesi üretildiğinde
   5–15 arasındaki her dakika ek ses gerektirmez. Yalnız 3 ve 5 dakikanın kısa biçimleri (`short`) ayrıca okutulur.
3. **3 dakika gerçekçidir ama yalnız oturarak yapılan derslerde.** İskelet: giriş ve Varış 0:34, tek çekirdek 1:38,
   kısa gündüz kapanışı 0:48. Metin bütçesi ders başına ≈ 310–330 hecedir (≈ 110–140 sözcük; VARSAYIM modeli, ölçülen
   hızlarla).
4. **3 dakika şu yedi derste var:** 1 Nefesin Ritmi, 4 Zor Anlar İçin (yalnız dayanak), 5 Tek Nokta, 6 Sabah Niyeti,
   8 Sağlam Yer, 9 Kendini Tanımak (yalnız oturarak), 10 Gelecekteki Sen (sınırda).
5. **Üç derste 3 dakika önerilmez.** Ders 2 Derin Dinlenme (Yoga Nidra) sığmaz: uzanarak yapılan dersin güvenli
   kapanışı ölçülmüş sürelerle 1:42–1:44'tür; Varış ve Kapanış tek başına 2:30–2:33 tutar, tek bir çekirdek blokla
   3:23–3:27 olur. Ders 3 Uykuya Geçiş'te 3 dakika anlamsızdır. Ders 7 Kendine Şefkat'te ise güvenlik açısından
   sakıncalıdır, çünkü kademeli öz-şefkat sırası 3 dakikaya sığmaz. Bu üç dersin en kısa sürümü 5 dakikadır.
6. **15 dk pilotunun en önemli dersi şudur:** ölçülen klip süreleri, planlayıcının üretim köşesindeki tahminden
   Neslihan'da %10,9, Hakan'da %5,5 daha uzundur. Bu ölçümle Ders 2'nin 5 dakikalık sürümünde boş pay Neslihan'da
   17,7 sn'den 11,6 sn'ye iner; T6 tabanı olan 15 sn'nin altında kalır. Kısa sürümler bu yüzden modelle değil,
   ölçülmüş sürelerle ve yavaş okuyan sesle kurulmalıdır.
7. **İlk yayında Ders 2'nin hiçbir sürümünde zıtlık çiftleri yoktur.** Bu blok ancak 19. dakikada girer
   (timing.out.txt:103-104), pilotun kendi varsayılanı da bu yüzden 20 dakikadır. Önerim, Ders 2'ye 20 dk çipinin de
   eklenmesidir; karar sahibin.
8. **Aşamalar:** ilk yayında 3 · 5 · 15 çipleri yer alır; Ders 2, 3 ve 7'de 5 · 15 (Ders 2'de önerildiği gibi 20 de).
   30 dakika ve 3/5–30 arasında her dakikayı seçen kaydırıcı Aşama 3'te gelir: 16–30 dk sesi üretilip kilitli ekranda
   30 dakikalık cihaz testi geçtikten sonra. "İstenen bölümden başlama" (sarma) ilk yayında bulunur.
9. **Mevcut sistem bozulmaz.** Gereken değişikliklerin hepsi isteğe bağlı veri alanları ya da test eşikleridir
   (§8). Yeni bir ses hattı, yeni bir planlayıcı ya da yeni bir ders biçimi gerekmez.

---

## 1. Plan bugün ne diyor (okunan satırlar)

| Konu | Bugünkü kural | Kaynak |
|---|---|---|
| Kısa sürümün yeri | "Kısa sürüm yan ürün değil"; 5 dk sürüm en çok dinlenecek sürüm gibi tasarlanır | PLAN.v2.md:487-493 |
| Yapı | Varış (sabit) → öncelik sırasıyla çekirdek → Kapanış (sabit, her zaman çalar); gündüz kapanışı ≥ 45 sn | PLAN.v2.md:494-498 |
| Alt küme ilkesi | Kısa sürümün cümleleri uzun sürümün alt kümesidir; yalnız Varış, Kapanış ve köprüler ayrıca yazılır | PLAN.v2.md:499-501 |
| Kısaltma sırası | Önce sessizlikler, sonra tekrar sayıları, en son bloklar; sessizlik sınıf sınırını aşmaz | PLAN.v2.md:502-505 |
| Klip | 1–3 cümle; yavaş okuyan seste en çok ~15 sn | PLAN.v2.md:537 |
| Planlayıcı | P1 bloklar taban; artımlar sıra ile; kalan süre sessizlikle, sınırı aşmadan; toplam hedefe eşit | PLAN.v2.md:563-577 |
| Tabanlar | Çekirdek blok ≥ 0:55; niyet ve yerleşme bloğu ≥ 0:20 (VARSAYIM); Ders 2'nin 5 dk'sında C2 ≥ 0:30, N2 ≥ 0:15 istisnası | PLAN.v2.md:581-587; timing.py:111-113 |
| Testler | (e) son 60 sn'de nefes tutma, yeni imge ya da zor blok yok; (f) 5 dk = Varış + en az bir P1 blok + Kapanış | PLAN.v2.md:593-594 |
| Boş pay (T6) | 5 dk'nın üretim köşesinde (5,6 hece/sn, yüksek duraklama) min sessizliklerle ≥ 15 sn | timing.py:114, :1362-1365, :1398-1404 |
| Yoğunluk | Herhangi bir 60 sn'de ≤ 150 hece ve ≤ %60 konuşma | timing.py:72-73 |
| "-(y)abil-" | Herhangi bir 60 sn'de en çok 3 | timing.py:104 |
| Şafak | Gündüz kapanışında `k.donus`'tan sona 60–90 sn | timing.py:98, :817-819 |
| Kapanış sessizliği | Kapanış evresinin sessizlikleri sıkıştırılmaz (min = pref) | ders2.lesson.json:122 |
| Kısa biçim | `short{belowSec,text,gapAfter}`: hedef eşiğin altındayken aynı kimlikle kısa metin | timing.py:29-30, :271-282 |
| Zorunlu klibi kısada çıkarmak | `minTarget` | timing.py:364-366 |
| P1 bloğu düşürmek | `planner.p1DropOrder` (en kısa hal sığmazsa) | timing.py:435-439; ders2.lesson.json:129 |
| Çipler ve kaydırıcı | 5–30 kaydırıcı, 5 · 10 · 15 · 20 · 30 çipleri; kütüphanede "5 dakikalık" süzgeci | PLAN.v2.md:1323, :1327-1331 |
| Tamamlandı | Kapanışa ulaşıldı ve dinlenen süre planlanan sürenin ≥ %60'ı (VARSAYIM) | PLAN.v2.md:1476-1478 |
| "Bitti" koşulu | Ders ancak cihazda kilitli ekranda 5 ve 30 dk çalınca `[x]` olur | PLAN.v2.md:13-14 |
| Varsayılan süreler | 1: 10 · 2: 20 · 3: 20 · 4: 5 · 5: 10 · 6: 10 · 7: 10 · 8: 10 · 9: 15 · 10: 10 | PLAN.v2.md:171, :201, :239, :275, :301, :326, :353, :377, :399, :419 |

Sonuç: plan 3 dakikayı hiç öngörmez. 3 dakikalık sürüm yeni bir basamaktır ve aşağıdaki kurallarla eklenir.

---

## 2. 15 dakikalık pilotun ölçümünden 3 ve 5 dakika için çıkanlar

Pilot yalnız Ders 2'nin 15 dk halini iki sesle üretti (render/out/report.md:7-15). Aşağıdaki sayılar pilotun
kaydettiği planlardan (`render/out/plan-nes.json`, `plan-hak.json`; her parçanın gerçek başlangıç ve bitişi) ve
planlayıcının ölçülmüş sürelerle yeniden çalıştırılmasından gelir. Doğrulama: yöntem, 15 dk için rapordaki yoğunluk
değerlerini birebir veriyor (Neslihan 119,0 hece / 0,47; Hakan 125,96 hece / 0,454; report.md:14-15).

### 2.1 Ölçülen klip süreleri modelden uzun

| | Neslihan | Hakan | Kaynak |
|---|---|---|---|
| 15 dk'da konuşma | 286,4 sn (%31,8) | 278,4 sn (%30,9) | report.md:11-12 |
| Ortak kliplerde ölçülen / model (5,6 hece/sn, yüksek duraklama) | **1,109** (110 klip) | **1,055** (111 klip) | `calc/measure.py` |
| Brüt hız (uç payı ve klip içi duraklama dahil), ders geneli | 4,29 hece/sn | 4,51 hece/sn | `calc/measure.py` |
| Varış / Derinleşme / Derin / Kapanış | 4,62 / 3,80 / 4,49 / 4,61 | 4,80 / 4,05 / 4,71 / 4,76 | `calc/measure.py` |
| 15 dk'da esneme (sessizlik pref → max) | f = 0,113 | f = 0,046 | report.md:11-12 |

Model (timing.py:52-58) üretim köşesini "5,6 hece/sn + Hakan v2'nin uzun duraklamaları" diye kurar. Gerçek
okumalarda Neslihan bu köşeden de yavaş çıktı. Derinleşme evresinin düşük brüt hızı beden dolaşımı listelerinden gelir
(tek heceli "diz…" gibi öğeler ≈ 0,9 sn sürüyor).

**3 ve 5 dk için anlamı:** kısa sürümlerde sessizlik payı zaten azdır; %5–11'lik fark doğrudan boş payı yer. Metin
bütçesi yavaş okuyan sese (bugün Neslihan) göre, ölçülmüş brüt hızla hesaplanmalıdır. §4'teki bütün bütçeler böyle
hesaplandı.

### 2.2 Ders 2'nin 5 dakikası ölçülmüş sürelerle

Pilot 5 dk'yı üretmedi. 5 dk planındaki 36 klibin 33'ü 15 dk'da üretildiği için ölçülmüş süreleri var; üç kısa biçim
(`n1.soyle`, `c2.akis`, `n2.hatirla`) okutulmadı, bunların süresi model × ölçülen oranla tahmin edildi.

| | Model (5,6 yüksek) | Neslihan (ölçülen) | Hakan (ölçülen) |
|---|---|---|---|
| Giriş + A / N1 / C1 / C2 / N2 / K (sn) | 3,5 + 52 / 28 / 57 / 40 / 17 / 102 | 3,3 + 50,6 / 27,8 / 56,9 / 39,7 / 17,5 / 104,2 | 3,4 + 51,4 / 27,4 / 57,2 / 40,0 / 17,4 / 103,2 |
| Konuşma | 110,3 sn (%37) | 119,9 sn (%40) | 114,8 sn (%38) |
| Boş pay (min sessizliklerle; T6 tabanı 15 sn) | 17,7 sn (timing.out.txt:246) | **11,6 sn** | 16,4 sn |
| En yoğun 60 sn (tavan 150 hece, %60) | 147 hece, %53 | **149,5 hece**, %55 | 148,5 hece, %52 |
| `check_plan` | geçti | geçti | geçti |

Okuma: Ders 2'nin 5 dakikası geçer ama iki sınırın dibindedir. Neslihan'la T6 boş payı 3,4 sn eksiktir ve en yoğun
dakika tavanın 0,5 hece altındadır. Tasarlanacak hoca sesi Neslihan'dan ≈ %10 daha yavaş okursa konuşma ≈ 12 sn uzar
ve 5 dk sürümü en kısa sessizliklerle bile sığmaz.
**Öneri:** 5 dk'ya özgü kısa biçimle (`short`, belowSec 360) Varış'tan ≈ 16 hece kısaltmak (ör. `a.gozler`'in kısa
biçimi). Sessizlik korunur, T6 geri gelir. Metin Türkçe editörden geçer. T6 tabanını düşürmek ise ikinci seçenektir ve
sahibe görünür bir değişiklik olur.

### 2.3 Kapaklar sabittir; 3 dakikanın asıl sınırı budur

Kapanış evresinin sessizlikleri sıkıştırılmaz (ders2.lesson.json:122), güvenli kalkış adımları da kısaltılmaz
(PLAN.v2.md:851; pilot 3. tur G2-04). Ölçülmüş sürelerle Ders 2'nin en kısa halleri (giriş dahil, bütün sessizlikler
min değerinde; `calc/short.py`):

| İçerik | Neslihan | Hakan | Model |
|---|---|---|---|
| Yalnız Varış + Kapanış | 153,3 sn (2:33) | 151,3 sn (2:31) | 150,3 sn |
| + C1 beden dolaşımı | **207,4 sn (3:27)** | **204,4 sn (3:24)** | 203,1 sn |
| + N1 + C1 (4 dk planı) | 233,9 sn | 230,0 sn | 229,0 sn |

Uzanarak yapılan bir derste Kapanış tek başına 1:42–1:44'tür: `k.yan` 6 sn, `k.otur` 8 sn, `k.bekle` 12 sn ve
`k.kalk` sessizlikleri, konuşmalarıyla birlikte ≈ 45 sn tutar (`calc/dump5.py`). Bu adımlar yaşlı dinleyicide ayağa
kalkınca görülen kan basıncı düşüşü yüzünden var (Tran 2021, PMID 34260686, DOI
[10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090)). **Sonuç: uzanarak yapılan bir derste 3 dakika
olanaksızdır.**

Oturarak yapılan derste bu dört adım düşer. Ders 2'nin kendi kapanış klipleriyle (`k.donus`, `k.nefes`, `k.hareket`,
`k.goz`, `k.son`) hesaplanan oturarak kapanış ≈ 98 hece, ≈ 20 sn konuşma ve oturarak kısalan sessizliklerle ≈ 0:46–0:52
eder. Gündüz kapanışının ≥ 45 sn tabanı karşılanır (dossier-teslim.dogrulanmis.md:44, :251-253; Hilditch 2017, PMID
28366332, DOI [10.1016/j.sleep.2016.12.016](https://doi.org/10.1016/j.sleep.2016.12.016); Hilditch & McHill 2019, PMID
31692489, DOI [10.2147/NSS.S188911](https://doi.org/10.2147/NSS.S188911); dolaylı kanıt + VARSAYIM). **3 dakika bu
yüzden yalnız oturarak mümkündür.**

### 2.4 Kapakların konuşma payı süreye göre değişir

15 dk'da Varış'ın konuşma payı %36, Kapanış'ınki %33 ölçüldü (`calc/measure.py`, blok toplamları). 5 dk'da Varış
≈ %49 (24,9 / 50,6 sn), uzanarak yapılan Kapanış ise ≈ %36'dır (37,6 / 104,2 sn), çünkü kalkış beklemeleri sessizdir.
PLAN'ın kapak bandı %45–60'tır (PLAN.v2.md:781); bu bant yalnız 5 dk'nın Varış'ına uyuyor. Bu yüzden §4'te kapak metni
paydan değil, içerikten (kliplerin hecesinden) hesaplandı.

### 2.5 Üretimden çıkan metin dersleri (kısa biçimlere de uygulanır)

- **İki nokta üst üste kesimi bozuyor.** `n1.sec` ve `n2.hatirla`'da en uzun duraklama cümle sonunda değil, "şu:" ve
  "şunu:" sonrasında çıktı; kesim kuralı yanlış yerden bölüyordu (report.md:116-120). 5 dk'nın `n2.hatirla` kısa biçimi
  de "Ya da yine şunu:" taşıyor. Üretimden önce yeniden yazılmalı. Kural: çok cümleli birimde iki nokta kullanılmaz.
- **Birleşik sözcük:** Scribe "Sırtüstü"nü her çekimde "Sırt üstü" yazdı (report.md:115, :118). Doğrulama
  normalleştirmesine birleşik sözcük istisnası eklenmeli. Aksi halde kısa biçimlerde de gereksiz yeniden çekim yapılır.
- **Hakan'da mikro parçalar:** 1 sn'den kısa 8–9 parça konuşma/yatak farkında 15 dB'in altında kaldı (13,0–14,9 dB;
  report.md:55-59). 3 dk'lık Ders 1 (al/ver) ve Ders 9 (beden taraması) bu tür parçalarla dolu. Mikro klip RMS ofseti
  Hakan için yeniden ayarlanmalı. Ayrıca Hakan'da 40 parça tepe sınırlayıcıda 3 dB'den çok kısıldı (report.md:127).
- **Kısa biçimler üretilmedi:** 5 dk Ders 2 için 3 birim × 2 ses eksik. Bu yüzden 5 dk karışımı henüz kurulamaz.

### 2.6 Maliyet dersi (yalnız aşama kararı için)

15 dk'lık Ders 2'nin konuşması ve Scribe doğrulaması iki seste 520,83 sent tuttu (report.md:109-110). Aynı dersin
30 dakikası modelde 1.263 yerine 2.211 hece ve 111 yerine 214 klip ister (timing.out.txt:96, :126); yani konuşma
üretimi ≈ 1,75–1,9 katına çıkar. 3 ve 5 dk'nın kısa biçimleri ders başına birkaç klip ekler. Öteki derslerin
maliyeti bu orandan ancak tahmin edilir (VARSAYIM); müzik maliyeti bu belgenin konusu değil.

---

## 3. 3 dakika: ne gerekir, gerçekçi mi

### 3.1 İskelet (oturarak yapılan gündüz dersi)

| Parça | Süre | İçerik | Hece (≈) | Konuşma (≈) |
|---|---|---|---|---|
| Giriş (müzik) | 0:04 | yatak açılır; söz yok | — | — |
| Varış (3 dk kısa biçimi) | 0:30 | duruş + gözler (tek klip) → ortak açılış cümlesi → dersin kendi açılışı; ilk dersse "Bugün yalnızca tanışıyoruz; zorlanırsan kısalt." (≈ 5 sn bu payın içinde) | 70–75 | 15–17 sn |
| Çekirdek | 1:38 | tek P1 blok ya da bir çekirdek + bir niyet/yerleşme bloğu | 135–160 | 33–36 sn |
| Kapanış (3 dk kısa biçimi) | 0:48 | dönüş → nefes → parmaklar ve gerinme ("ağrı ya da baş dönmesi olursa bırak") → gözler ve oda → son cümle | 95–100 | 20–21 sn |
| **Toplam** | **3:00** | | **≈ 310–330** (≈ 110–140 sözcük) | **≈ 74 sn (%41)** |

Hesap: Varış ve Kapanış hecesi Ders 2'nin ölçülmüş kliplerinden (yatış adımları hariç) türetildi. Çekirdek hecesi
= süre × %37 (PLAN.v2.md:782, rehberli çekirdeğin orta payı) × 4,29 hece/sn (Neslihan'ın ölçülen brüt hızı). Liste
ağırlıklı çekirdekte (beden taraması, al/ver) 3,80 hece/sn kullanıldı. Bu bir **VARSAYIM modelidir**; ilk 3 dk metni
yazılıp okutulunca ölçülür.

Varış 0:30'u gerçekten karşılar mı? Ders 2'de ölçülen üç klip: ortak açılış cümlesi 5,2 sn (29 hece), gözler 5,0 sn
(22 hece), dersin açılışı 4,3 sn (16 hece). Oturarak kısalan aralarıyla (3 + 4 + 3 sn) toplam ≈ 24,5 sn eder;
ilk ders cümlesi eklenince ≈ 30 sn olur.

### 3.2 3 dakikanın kuralları (hepsi planlayıcı testine girer)

1. **Tek duruş: oturarak.** Uzanarak yapılan dersin kapanışı 3 dk'ya sığmaz (§2.3). Ders 9'da duruş seçicisi
   "uzanarak" ise 3 dk çipi kapalı olur.
2. **Kapaklar kendi kısa metinleriyle kurulur, sıkıştırılarak değil.** Kapanış sessizlikleri min = pref kuralı
   (ders2.lesson.json:122) 3 dk'da da geçerlidir. Kısalık, `short` biçimli ve `minTarget` ile dışarıda kalan kliplerden
   gelir.
3. **Zaman verir:** her yönergeden sonra eylem süresi + ≥ 2 sn (PLAN.v2.md:1502). Çekirdekte en az bir 12–20 sn'lik
   nefes payı bulunur (en uzun boşluk ≥ 8 sn kuralı: PLAN.v2.md:1505). 20 sn'yi aşan sessizlik 3 dk'da olmaz; böylece
   duyurulu pencere de gerekmez.
4. **Tabanlar:** çekirdek blok ≥ 0:55, niyet ve yerleşme bloğu ≥ 0:20 (PLAN.v2.md:581-583). İki ders bu tabanı
   karşılayamaz ve sahibe görünür istisna ister: Ders 8'in C1'i (yere basmak) 0:38, Ders 10'un C5'i (küçük adım)
   0:43 (§4).
5. **Anahtar cümle bir kez** söylenir (5 dk için de kural bu: PLAN.v2.md:429-430). Başarısızlığı normalleştiren bir
   cümle bulunur (PLAN.v2.md:1515).
6. **"-(y)abil-" sınırı:** ortak açılış cümlesi ("…açabilir, kıpırdayabilir ya da dersi bitirebilirsin.") tek başına
   üç "-(y)abil-" taşır (ABIL_RE, timing.py:103). 3 dk'nın 30 sn'lik Varış'ı tek bir 60 sn penceresine düştüğü için
   bu pencerede başka "-(y)abil-" olamaz (timing.py:104). Oysa A.2.1'deki açılış cümlelerinin sekizi "-(y)abil-" ile
   biter (Ders 1, 3, 5, 6, 7, 8, 9, 10; PLAN.v2.md:436-445); 3 dk'sı olan derslerden altısı bunlardandır (1, 5, 6, 8,
   9, 10). Bu derslerin 3 dk Varış'ında açılış cümlesi `short` ile "-(y)abil-"siz bir biçimde söylenir. Metni Türkçe
   editör yazar; burada yalnız kural var.
7. **Son 60 sn:** nefes tutma, yeni imge ya da zor blok yok (PLAN.v2.md:593). 3 dk'da son 60 sn = Kapanış'ın 48 sn'si +
   çekirdeğin son 12 sn'si. Bu yüzden çekirdeğin son klibi yeni bir imge açmaz; ya dönüş cümlesidir ya da niyettir.
8. **Şafak:** gündüz kapanışındaki görsel şafak bugün ≥ 60 sn ister (timing.py:98, :817-819; PLAN.v2.md:1376-1377).
   3 dk'nın Kapanış'ı 48 sn'dir. Öneri: 3 dk'da şafak Kapanış'ın başından sona 45–48 sn sürer (sahibe görünür istisna,
   VARSAYIM). Şafağı çekirdeğin içine taşımak önerilmez.
9. **Zor blok 3 dk'da açılmaz.** Kısaltılmış sürüm bir zor bloğun ortasında ya da hemen ardından kapanışa geçmez
   (dossier-guvenlik.dogrulanmis.md:350, §11.D-2). 3 dk'da çekirdeğin hemen arkası Kapanış olduğu için duygu açan
   bloklar (Ders 4 C2, Ders 7 C3) 3 dk'ya girmez.
10. **Hızlı kapanış:** "Kapanışa geç" alt sınırı olan 60 sn (timing.py:95) Ders 2'nin uzanarak kapanışına aittir.
    Oturarak derslerde hızlı kapanış 3 dk Kapanış'ının kendisidir (≈ 45–55 sn).
11. **Alt küme:** 3 dk planı 5 dk planının alt kümesidir. Planlayıcı testi ardışık dakikalar arasında düşen klibi
    hata sayar (timing.py:1389); ilk yayında bu denetim 3 → 4 → 5 dk için de koşar. P1 bloğu düşen derslerde (Ders 4
    C2, Ders 10 C1) kalan bloklar 3 dk'da 5 dk'dakinden fazla klip almaz; artan süre sessizliğe gider.
12. **Müzik:** 3 dk'da iki doku geçişi yeter (Varış → çekirdek, çekirdek → Kapanış); çekirdek varyantı dönmez. Dersin
    müzik teması 3 dk'da da aynı kalır (PLAN.v2.md:135-137).

### 3.3 Kanıt ve pazar: dürüst durum

- **3 dakikalık bir oturumun etkisini sınayan çalışma bu dosyalarda yok.** Dosyalardaki en kısa oturumlar şunlar:
  günde 5 dk nefes (Balban 2023, PMID 36630953, DOI
  [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895)), günde 5 dk imgeleme (Meevissen 2011, PMID
  21450262, DOI [10.1016/j.jbtep.2011.02.012](https://doi.org/10.1016/j.jbtep.2011.02.012)), tek 7 dk'lık oturum
  (Marschin 2026, PMID 42453615, DOI [10.3389/fspor.2026.1774292](https://doi.org/10.3389/fspor.2026.1774292)), 8 dk
  nefes (Mrazek 2012, PMID 22309719, DOI [10.1037/a0026678](https://doi.org/10.1037/a0026678)), 10 dk kayıt (Norris
  2018, PMID 30127731, DOI [10.3389/fnhum.2018.00315](https://doi.org/10.3389/fnhum.2018.00315)), 11 dk Yoga Nidra
  (Moszeik 2025, PMID 40373021, DOI [10.1002/smi.70049](https://doi.org/10.1002/smi.70049)). Bu yüzden 3 dk sürümün
  kaynak kartı yalnız dersin kendi kaynaklarını gösterir ve 3 dakikaya özgü hiçbir etki cümlesi taşımaz.
- **Gerçek kullanım kısa:** bir RKÇ'nin tam metninde meditasyona özgü kullanım ortalama günde 3,36 dk idi,
  kullanıcıların %69,7'si günde 5 dk'nın altında kaldı. Keşif amaçlı ve randomize olmayan analizde günde 5–9,9 dk
  kullananların algılanan stres puanı −6,58, 5 dk'nın altındakilerinki −5,42 değişti; fark 4. ayda anlamlı değildi
  (Radin 2025, PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435);
  dossier-benlik.dogrulanmis.md:57). Okuma: 3 dakika gerçek davranışa uyar, ama varsayılan süre 5 dakika kalmalıdır.
- **Kısa farkındalık etkisi küçük:** yayın yanlılığı düzeltilince g = 0,04 (Schumer 2018, PMID 29939051, DOI
  [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). 3 dk sürümün ekrandaki dili buna göre alçakgönüllü olur.
- **Pazar (kanıt değil, sinyal):** Headspace'te 3, 5 ya da 10 dk sürüm seçilebiliyor; Medito 3–30 dk, Balance 3–10 dk
  sunuyor (pazar.md:364, :367, :370). Meditopia TR'nin "3 Dk'lık Rahatlama Meditasyonu" videosu 252.528 izlenmiş
  (pazar.md:313). Buna karşılık bakılan Yoga Nidra uygulamasında ve NSDR protokollerinde en kısa sürüm 10 dk
  (pazar.md:371-372). Özet: "Pazarda 5 / 10 / 15 / 20 / 30 basamakları standart; 3 dk en kısa uç" (pazar.md:376).

### 3.4 Ders ders karar

| Ders | 3 dk | Neden | 3 dk'nın çekirdeği |
|---|---|---|---|
| 1 Nefesin Ritmi | **var** | oturarak; tek P1 blok (C1) 1:38'e rahat sığar | C1: doğal nefesi fark etme (≈ 20 sn) → "Başın döner ya da karıncalanırsa normal nefesine dön." → 4 al / 6 ver, ≈ 6 döngü (60 sn; bordun 10,000 sn) → anahtar cümle |
| 2 Derin Dinlenme | **yok** (en kısa 5) | uzanarak; Varış + Kapanış tek başına 2:30–2:33, tek blokla 3:23–3:27 (§2.3); niyetin başta ve sonda söylenmesi Yoga Nidra yayının parçası (5 dk istisnası bile bu yüzden var: PLAN.v2.md:584-587) | — |
| 3 Uykuya Geçiş | **yok** (en kısa 5) | anlamsız: dersin özü olan ilgi çekici tek sahneli imgeleme (Harvey & Payne 2002) ve ders boyunca yavaşlayan ses (Knowlton & Larkin 2006) 1:40'ta kurulamaz; kısa yol zaten "Uykuya geç" düğmesi ve müzik kuyruğudur (PLAN.v2.md:851, :865). Gece dersi olduğu için gündüz yolunda da yeri yok | — |
| 4 Zor Anlar İçin | **var, yalnız dayanak** | oturarak; C2 (duyguyu bedende bulmak ve adlandırmak) duygu açar ve 3 dk'da hemen ardından kapanış gelirdi (§11.D-2); bu yüzden C2 3 dk'da düşer (`p1DropOrder`) | C1: ayak tabanları → eller → odadaki sesler → üç uzun veriş → "huzursuzluk normal" cümlesi (Braith 1988) → anahtar cümle bir kez; gözler yarı açık; bitişte 112 kartı aynen |
| 5 Tek Nokta | **var** | oturarak; tek P1 blok | C1: nefese yerleşme → ≤ 18 sn sessiz odak → geri çağırma ve "Fark ettiğin an, zaten geri döndün." → ikinci ≤ 18 sn aralık |
| 6 Sabah Niyeti | **var** | oturarak; iki P1 blok tabanları karşılar (C1 0:58 ≥ 0:55; C2 niyet 0:40 ≥ 0:20) | C1: doğal nefes + oturarak omurga hareketi, "ağrı ya da baş dönmesi olursa bırak" → C2: tek kelimelik niyet ve anahtar cümle |
| 7 Kendine Şefkat | **yok** (en kısa 5) | güvenlik: öz-şefkat kademelidir, yani önce tarafsız dayanak, sonra "istersen" diye davet, kısa süre ve dayanağa dönüş (dossier-guvenlik.dogrulanmis.md:320; Creaser 2022). Üç P1 blok tabanlarıyla 0:04 + 0:30 + 3 × 0:55 + 0:48 = 4:07 eder. Sığdırmak için "sevdiğin biri" adımı atılırsa doğrudan kendine yönelen, daha riskli yol kalır; "kendine dönüş" atılırsa ders adını kaybeder | — |
| 8 Sağlam Yer | **var (istisnayla)** | oturarak; iki P1 blok ancak C1 yerleşme bloğu sayılırsa sığar (0:38; çekirdek tabanı 0:55'in altında, yerleşme tabanı 0:20'nin üstünde) | C1: yere basmak, oturarak dağ duruşu, anahtar cümle ("Hava değişir, dağ yerinde kalır.") → C2: içinden adınla ya da "sen" diye konuşan sakin iç ses (Kross 2014) |
| 9 Kendini Tanımak | **var, yalnız oturarak** | tek P1 blok; uzanarak seçilirse kalkış adımları sığmaz | C1: kısa beden taraması (ayaklar → bacaklar → gövde → eller → yüz; hassas bölgede durulmaz, atlama izni) → bir kez "Dikkatin şimdi nerede?" → anahtar cümle |
| 10 Gelecekteki Sen | **var, sınırda** | oturarak; C1 yerleşme düşer (Varış bu işi görür), C5 0:43 ile çekirdek tabanının altında kalır. Anlamlı ama ince: imgeleme ≈ 55 sn, oysa dosyalardaki en kısa imgeleme günde 5 dk (Meevissen 2011) | C2: tek sahne, "o günün sabahı", kişisel alan, duyularla → C5: bugün atılabilecek küçük adım + tek eğer-ise cümlesi; niyet son cümle |

Kaynaklar: Harvey & Payne 2002, PMID 11863237, DOI
[10.1016/s0005-7967(01)00012-2](https://doi.org/10.1016/s0005-7967(01)00012-2); Knowlton & Larkin 2006, PMID
16941239, DOI [10.1007/s10484-006-9014-6](https://doi.org/10.1007/s10484-006-9014-6); Braith 1988, PMID 3069875, DOI
[10.1016/0005-7916(88)90040-7](https://doi.org/10.1016/0005-7916(88)90040-7); Creaser 2022, PMID 35391975, DOI
[10.3389/fpsyg.2022.765602](https://doi.org/10.3389/fpsyg.2022.765602); Galante 2014 ("başta zorlayıcı olabilir"),
PMID 24979314, DOI [10.1037/a0037249](https://doi.org/10.1037/a0037249); Kross 2014, PMID 24467424, DOI
[10.1037/a0035173](https://doi.org/10.1037/a0035173); Luu 2024 ("uygun uzunluk ve hazırlık", "yeterli yerleşme ve dışa
dönüş"), PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021); Howard 2017
(uyandırma başarısızlığı), PMID 28300508, DOI
[10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281).

Ders 3 için dürüst not: tek bir 30 dk'lık Yoga Nidra kaydı sessiz uzanmaya göre uykuya dalma süresini değiştirmedi
(Sharpe 2023, PMID 36731199, DOI [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169)).
Yani hiçbir süre için "uyutur" denmez; 3 dakikanın reddi etki iddiasına değil, dersin kendi kurgusuna dayanır.

---

## 4. Ders başına 3 / 5 / 15 dakika blok tablosu (çapa süreler)

Kurallar: süreler blok başına konuşma + içindeki sessizlik toplamıdır (dk:sn) ve her sütun tam hedefi verir
(`calc/tables.py` doğruladı; aynı betik her bloğun süre arttıkça kısalmadığını da denetler). Satırlar çalma sırasıyladır. 3 dk sütunu bu belgenin önerisidir. 5 ve 15 dk sütunları
PLAN.v2 §B.4'ün çapalarıdır (PLAN.v2.md:612-769); değişen hücreler **kalın** yazıldı. Bütün değerler **VARSAYIM**'dır ve
ders metni okutulunca gerçek klip süreleriyle yeniden hesaplanır. "Giriş" (0:03–0:04 müzik) 3 dk'da Varış'ın içinde
gösterildi; PLAN'ın 5 ve 15 dk Varış değerleri de onu içerir.

**Ders 1 · Nefesin Ritmi** (oturarak)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | 0:34 | 0:45 | 1:15 |
| C1 Doğal nefes → uzun veriş (4 al / 6 ver, tutma yok) | P1 | 1:38 | 3:00 | 4:30 |
| C2 İç çekiş | P2 | — | — | 3:00 |
| C3 Bhramari (parmaklar yüze değmez) | P3 | — | — | 4:30 |
| K Kapanış (gündüz, oturarak) | sabit | 0:48 | 1:15 | 1:45 |

**Ders 2 · Derin Dinlenme** (uzanarak; 3 dk yok). 5 ve 15 dk sütunları pilotun ölçülmüş süreleridir (Neslihan /
Hakan); PLAN'ın çapalarının yerine geçer.

| Blok | Öncelik | 3 dk | 5 dk (ölçülmüş sürelerle plan) | 15 dk (pilot karışımı) |
|---|---|---|---|---|
| Giriş | — | — | 0:03 | 0:04 |
| A Varış | sabit | — | **0:51** | **1:41 / 1:38** |
| N1 Niyet, başta | P1 | — | **0:28 / 0:27** | **0:50 / 0:48** |
| C1 Beden dolaşımı | P1 | — | **0:57** | **3:11 / 3:07** |
| C2 Nefes + geri sayma | P1 | — | **0:40** | **3:02 / 3:20** |
| BR.K2 anahtar cümle köprüsü | köprü | — | — | 0:15 |
| C3 Zıtlık çiftleri | P3 | — | — | **— (19. dk'da girer)** |
| BR.orta kapı ve dayanak | köprü | — | — | 0:27 / 0:26 |
| C4 İmgeleme | P2 | — | — | **2:18 / 2:14** |
| N2 Niyet, sonda | P1 | — | **0:18 / 0:17** | **0:38 / 0:37** |
| K Kapanış (uzanarak) | sabit | — | **1:44 / 1:43** | **2:33 / 2:29** |

Not: 15 dk'da seçilen bloklar N1, C1, C2, N2 ve C4'tür (report.md:11-12). Kıyı sahnesinin sahneye özgü klipleri
okutulmadı; ilk yayında iki sahne de sunulacaksa bunlar da üretilir.

**Ders 3 · Uykuya Geçiş** (yatakta; 3 dk yok; "Kapanış" yerine uyku izni; müzik kuyruğu sürenin dışında)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | — | 0:45 | 1:15 |
| C1 Yavaş, uzun veriş | P1 | — | 1:00 | 1:45 |
| C2 Bedenin ağırlaşması | P1 | — | 1:10 | 3:30 |
| C4 Nefesle geri sayma | P2 | — | — | 2:30 |
| C3 Tek sahneli imgeleme | P1 | — | 1:25 | 5:00 |
| K Uyku izni | sabit | — | 0:40 | 1:00 |

**Ders 4 · Zor Anlar İçin** (oturarak)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | 0:35 | 0:45 | 1:15 |
| C1 Dayanak + uzun veriş | P1 | 1:30 | 1:30 | 2:30 |
| C2 Bedende bulmak, adlandırmak, "sen" diye seslenmek | P1 | **— (3 dk'da düşer)** | 1:30 | 3:00 |
| C4 Duyguya nefesle yer açmak | P3 | — | — | 2:30 |
| C3 Derede yapraklar ya da bulutlar | P2 | — | — | 4:00 |
| K Kapanış | sabit | 0:55 | 1:15 | 1:45 |

Not: Ders 4'te C1'in 3 dk'daki içeriği 5 dk'dakiyle aynıdır. C2 düşünce açılan süre C1'e yeni klip olarak değil,
Varış ve Kapanış'ın sessizliklerine gider. Böylece "blok süre arttıkça kısalmaz" kuralı (PLAN.v2.md:582) ve 3 → 5 dk
alt küme kuralı korunur.

**Ders 5 · Tek Nokta** (oturarak)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | 0:34 | 0:45 | 1:15 |
| C1 Nefes çapası | P1 | 1:38 | 3:00 | 4:00 |
| C2 Nefes sayma 1–10 | P2 | — | — | 4:00 |
| C3 Uzayan sessiz odak aralıkları | P3 | — | — | 4:00 |
| K Kapanış | sabit | 0:48 | 1:15 | 1:45 |

**Ders 6 · Sabah Niyeti** (oturarak)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | 0:34 | 0:45 | 1:15 |
| C1 Uyanış: doğal nefes + oturarak omurga hareketi | P1 | 0:58 | 1:30 | 2:00 |
| C3 Hafif akış, oturarak | P2 | — | — | 5:00 |
| C4 Şükran üçlüsü | P3 | — | — | 3:30 |
| C2 Niyet: tek kelime | P1 | 0:40 | 1:30 | 1:30 |
| K Kapanış | sabit | 0:48 | 1:15 | 1:45 |

**Ders 7 · Kendine Şefkat** (oturarak ya da uzanarak; 3 dk yok)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | — | 0:45 | 1:15 |
| C1 Dayanak + şefkatli beden taraması | P1 | — | 1:00 | 3:00 |
| C2 Sevdiğin birine iyi dilek | P1 | — | 0:55 | 2:30 |
| C3 Kendine dönüş: el kalpte | P1 | — | 1:05 | 3:30 |
| C4 Genişleyen çember | P3 | — | — | 3:00 |
| K Kapanış | sabit | — | 1:15 | 1:45 |

Duruş notu: bu tablo oturarak içindir. Uzanarak seçilirse kapanış, Ders 2'deki gibi yatış adımlarını taşır
(≈ 1:40–1:45). O zaman 5 dk'ya sığmaz: 0:46 + 3 × 0:55 + 1:42 = 5:13. **Ders 7'nin uzanarak en kısa sürümü 6 dk'dır**
(tahmin); 5 dk yalnız oturarak sunulur.

**Ders 8 · Sağlam Yer** (oturarak)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | 0:34 | 0:45 | 1:15 |
| C1 Yere basmak: oturarak dağ duruşu | P1 | **0:38 (istisna)** | 1:30 | 2:30 |
| C3 Değer hatırlama + küçük an | P2 | — | — | 3:30 |
| C4 Zorlanmaya şefkatli bakış + küçük adım | P3 | — | — | 3:30 |
| C2 İç ses | P1 | 1:00 | 1:30 | 2:30 |
| K Kapanış | sabit | 0:48 | 1:15 | 1:45 |

**Ders 9 · Kendini Tanımak** (oturarak; uzanarak da olur)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | 0:34 | 0:45 | 1:15 |
| C1 Beden taraması, geri çağırmayla | P1 | 1:38 | 3:00 | 4:30 |
| C3 Nefesin kendiliğinden akışı | P3 | — | — | 3:30 |
| C2 "Şu an ne hissediyorum?" | P2 | — | — | 4:00 |
| K Kapanış | sabit | 0:48 | 1:15 | 1:45 |

Duruş notu: 3 dk yalnız oturarak sunulur. Uzanarak seçilirse 5 dk'da kapanış ≈ 1:40 olur, C1 2:35'e iner (≥ 0:55,
kural tutar); 15 dk'da kapanış ≈ 2:00–2:30 olur (Ders 2'de ölçülen 2:29–2:33), fark isteğe bağlı kliplerden düşer.

**Ders 10 · Gelecekteki Sen** (oturarak)

| Blok | Öncelik | 3 dk | 5 dk | 15 dk |
|---|---|---|---|---|
| A Varış | sabit | 0:34 | 0:45 | 1:15 |
| C1 Yerleşme nefesi + dayanak | P1 | **— (Varış karşılar)** | 0:20 | 1:00 |
| C2 En iyi olası gün: kişisel alan | P1 | 0:55 | 1:25 | 4:00 |
| C3 İlişkiler | P3 | — | — | 3:30 |
| C5 Engel + eğer-ise planı, niyet son cümle | P1 | **0:43 (istisna)** | 1:15 | 3:30 |
| K Kapanış | sabit | 0:48 | 1:15 | 1:45 |

### 4.1 Metin bütçesi (hece; yavaş okuyan ses, orta pay; `calc/tables.py`)

| Ders | 3 dk | 5 dk | 15 dk | Ölçülen karşılaştırma |
|---|---|---|---|---|
| 1 | ≈ 310 | ≈ 480 | ≈ 1.410 | — |
| 2 | — | 527 (plan) | 1.228–1.257 (pilot) | report.md, `calc/measure.py` |
| 3 | — | ≈ 420 | ≈ 1.180 | — |
| 4 | ≈ 320 | ≈ 510 | ≈ 1.460 | — |
| 5 | ≈ 330 | ≈ 510 | ≈ 1.250 | — |
| 6 | ≈ 330 | ≈ 510 | ≈ 1.460 | — |
| 7 | — | ≈ 510 | ≈ 1.460 | — |
| 8 | ≈ 330 | ≈ 510 | ≈ 1.460 | — |
| 9 | ≈ 310 | ≈ 480 | ≈ 1.410 | — |
| 10 | ≈ 330 | ≈ 510 | ≈ 1.460 | — |

Model: kapak hecesi içerikten (3 dk: 75 + 98; 5 dk: 105 + 120; 15 dk: 150 + 170; uyku dersinde uyku izni 45 / 60);
çekirdek hecesi = süre × pay × brüt hız. Paylar: rehberli %37, derin %20, uyku ×0,8 (PLAN.v2.md:781-785). Brüt hız
Neslihan'ın ölçülen değerleri: rehberli 4,29, liste 3,80, derin 4,49 hece/sn. Bu **VARSAYIM** modeli ±%15 oynar.
Hızlı okuyan ses (Hakan) aynı metinde sessizlikleri biraz daha uzun kullanır. Ders 2'nin 15 dk pilotunda iki ses de
sessizlik sınırına yaklaşmadı (esneme f = 0,05–0,11; report.md:11-12); öteki derslerde 3–15 dk için genişletme klibi
gerekip gerekmediğini derleme testi (g) gösterir (PLAN.v2.md:595). Sözcük karşılığı: pilot metinde 2,4 hece/sözcük ölçüldü
(PLAN.v2.md:1016), PLAN'ın bütçe varsayımı 2,8'dir (PLAN.v2.md:807-809); yani 3 dk ≈ 110–140 sözcük eder.

---

## 5. 5 ve 15 dakikada PLAN'a göre değişenler

1. **Ders 2'nin çapaları pilot ölçümüyle değişir** (§4 tablosu). 15 dk'da Varış 1:38–1:41, Kapanış 2:29–2:33'tür;
   PLAN'ın 1:15 ve 1:45 değerleri Ders 2 için geçersizdir.
2. **Ders 2'nin 5 dk'sı sınırda** (§2.2): Varış'ta ≈ 16 hecelik 5 dk kısa biçimi önerisi.
3. **Uzanarak yapılabilen dersler (7, 9) duruşa göre ayrı kapanış ister.** Tek Kapanış bloğu kuralı (T4) korunur;
   yatış adımları (`k.yan`, `k.otur`, `k.bekle`, `k.kalk` kalıbı) yalnız "uzanarak" seçildiğinde çalar (§8).
4. **Ders 2'de ilk yayın süreleri zıtlık çiftlerini dışarıda bırakır.** C3 5,6 hece/sn'de 19. dakikada girer
   (timing.out.txt:103-104). Pilot 3. turda varsayılan bu yüzden 20 dk yapılmıştı (PLAN.v2.md:201-202). Öneri: ilk
   yayında Ders 2'ye 20 dk çipi eklenir ve varsayılan olur. Bunun maliyeti, 20 dk planının 15 dk'yı aşan birimleridir.
   Diğer seçenek, 15 dk'yı varsayılan yapıp zıtlık çiftlerini Aşama 3'e bırakmaktır.
5. **Varsayılan süreler ilk yayında yalnız sunulan çiplerden seçilir:** 5 dk (1, 4, 5, 6, 7, 8, 10; Radin 2025 ve
   PLAN.v2.md:492-493 gereği "en çok dinlenecek sürüm"), 15 dk (3 ve 9), 20 dk ya da 15 dk (2; madde 4'teki karara
   bağlı). 3 dk hiçbir dersin varsayılanı olmaz; yoldaki kısa durak ve zor an içindir.

---

## 6. 30 dakika ve "istenen dakika" ne zaman gelir

| Aşama | Ne olur | Sesi üretilen birimler | Kullanıcı ne görür | Geçiş koşulu |
|---|---|---|---|---|
| **0 · Karar** | Bu belgedeki kararlar (§9); inceleyiciler ve ses kararı PLAN §G'deki gibi | yok | — | sahip onayı |
| **1 · Pilotun tamamlanması** | (a) Ders 2'nin 5 dk kısa biçimleri (3 birim × 2 ses) + 5 dk karışımı; sahibin 15 ve 5 dk'yı dinlemesi. (b) **3 dk'nın ilk ölçümü Ders 1'de**, çünkü Ders 2'nin 3 dk'sı yok. Ders 1 kütüphanenin ilk dersi ve en zor eşzamanlamayı (al/ver, bordun, görsel) sınıyor | Ders 2: 5 dk kısa biçimleri; Ders 1: 3 dk planının birimleri | tasarım Artifact'ında 3, 5 ve 15 dk örnekleri | ölçüm (qa) + sahibin dinlemesi |
| **2 · İlk yayın ("ilk etap")** | 10 dersin 30 dk iskeleti sabitlenir: bloklar, sıralar (`entryRank`, `fillRank`), anahtar cümleler, imge yayı. ≤ 15 dk'da çalabilecek bütün metin (hızlı sesin genişletmeleri dahil) ve 3/5 dk kısa biçimleri yazılır, üç insan incelemesinden geçer | her ders ve her ses için 15 dk planının birimleri ∪ 5 ve 3 dk kısa biçimleri | çipler: **3 · 5 · 15** (Ders 3 ve 7: 5 · 15; Ders 2: 5 · 15 · 20 önerisi); bölüme atlama (sarma) var | planlayıcı testleri 3 ve 5–15'in her dakikasında; qa örnekleri 3/5/7/10/12/15; cihazda kilitli ekranda 3, 5 ve 15 dk |
| **3 · Tam modül** | 16–30 dk metni yazılır, incelenir, okutulur | 30 dk planlarının kalan birimleri | **30 dk** ve **3/5–30 her dakika kaydırıcısı** | "30:00'a sınır aşmadan ulaşılır" testi (PLAN.v2.md:595) ölçülmüş sürelerle; cihazda kilitli ekranda 30 dk kesintisiz çalma (aday A/B, PLAN.v2.md:1424-1426); qa 20/23/30 |

Gerekçeler:
- **Neden 30 dk ilk yayında değil:** konuşma üretimi ≈ 1,75–1,9 katına çıkar (§2.6). Kilitli ekranda 30 dk'lık
  kesintisiz çalma bu uygulamada doğrulanmadı (PLAN.v2.md:1722-1723). Ders 2'nin derin evresinin konuşma payı da sahibe
  görünür bir istisna olarak açık duruyor (PLAN.v2.md:831-843).
- **Neden 16–30 metni sonra yazılabilir:** önek kuralı gereği, yeni artımların sırası 15 dk'nın durduğu sıradan
  (Ders 2'de Neslihan 285, Hakan 290; report.md:11-12) yüksek kaldıkça ≤ 15 dk planları değişmez. Bu, her ses ve hız
  köşesinde derleme testiyle denetlenir. Tek yan etki şudur: ders verisi büyüyünce `contentHash` değişir ve yarım kalan
  dersler "Bu ders güncellendi; baştan başlayacak." der (PLAN.v2.md:1352-1355). Öneri: hash planın kullandığı
  birimlerden hesaplansın; o zaman ≤ 15 dk kayıtları bozulmaz.
- **"İstenen dakika" aslında Aşama 2'de ses olarak hazırdır:** 5–15 arasındaki her dakika 15 dk'nın birimleriyle
  kurulur. Kaydırıcıyı erken açmanın bedeli yalnız test yüküdür. Sahibinin sözü "ilk etapta 3-5-15" olduğu için önerim
  kaydırıcının 30 dk ile birlikte Aşama 3'te açılmasıdır; ama karar sahibindir (§9).
- **"Bitti" koşulu değişir:** PLAN'ın "cihazda kilitli ekranda 5 ve 30 dakika çalar" koşulu (PLAN.v2.md:13-14) ilk
  yayın için "en kısa sürüm ve 15 dakika" olur; 30 dk koşulu Aşama 3'e geçer. Bu, sahibe görünür bir değişikliktir.

---

## 7. Yol ile ilişki (yalnız süre açısından)

İki yol belgesi yoganın yoldaki süresini farklı yazıyor: "her bölüm 3 dk, yol payı 3; yolda günde tek bölüm"
(docs/yol-haritasi/tasarim/YOL.ilerleme.md:264-265) ve "yol bütçesi 5 dk sayar" (YOL.moduller.md:606). Bu belgenin
süre bulguları birleşik karar için şunları söyler:

- Yoldaki yoga durağının süresi dersin en kısa sürümüdür: **3 dk** (1, 4, 5, 6, 8, 9, 10) ya da **5 dk** (2, 7).
  "Her bölüm 3 dk" kuralı Ders 2 ve 7'de tutmaz.
- **Ders 3 gündüz yolunda durak olmaz.** Gece dersidir, sonrasında tepki testi ve araç kullanımı yoktur
  (YOL.moduller.md:611). Akşam kütüphanenin en üstünde durur (PLAN.v2.md:479).
- Yol durağının "tamam" koşulu `s.completed || s.seconds >= 300` biçiminde yazılmış (YOL.moduller.md:601). 3 dk sürüm
  bu koşulu yalnız `completed` ile karşılar; bu doğrudur, çünkü tamamlanma kapanışa ulaşmak + planlananın %60'ıdır
  (PLAN.v2.md:1476-1478).
- Meditasyon modülünün 3 dk'lık `sefkat` parçası (kendine iyi dilek; YOL.moduller.md:507) Ders 7 için bulunan
  güvenlik sorununu taşır: 3 dk'da dayanak, davet, kısa süre ve dayanağa dönüş sırası (güvenlik §11.B-12) kurulamaz.
  Birleşik planda bu parça ya 5 dk'dan başlamalı ya da kendine yöneltme olmadan yalnız "sevdiğin birine iyi dilek"
  ile sınırlanmalıdır. Meditasyon modülünün `nefes` ve `beden` 3 dk parçaları, "iki ayrı ürün, tek motor" kararı
  gereği (YOL.moduller.md:496-503) Ders 5 ve Ders 9'un 3 dk sürümleriyle aynı birimleri paylaşabilir.

---

## 8. Sözleşme, planlayıcı ve test değişiklikleri (hepsi isteğe bağlı; mevcut sistem bozulmaz)

| Yer | Bugün | Öneri |
|---|---|---|
| Ders verisi `minutes` | `{min: 5, max: 30, step: 1}` (ders2.lesson.json:11-15) | Ders başına `min`: 3 (1, 4, 5, 6, 8, 9, 10) ya da 5 (2, 3, 7). İlk yayında `max: 15` (Ders 2'de 20 önerisi), Aşama 3'te 30. Yeni isteğe bağlı alan `presets: [3, 5, 15]` (çipler) |
| Kısa biçim | `short` tek nesne, tek eşik (timing.py:271-282) | `short` bir liste de olabilir: `[{belowSec: 240, …}, {belowSec: 360, …}]`; planlayıcı hedefin altında kalan en küçük eşiği seçer. Tek nesne biçimi aynen geçerli kalır |
| 3 dk'da çalmayan zorunlu klip | `minTarget` (timing.py:364-366) | aynı alan, 240 değeriyle |
| 3 dk'da düşen P1 blok (Ders 4 C2, Ders 10 C1) | `planner.p1DropOrder` (timing.py:435-439) | aynı alan; ders verisine yazılır |
| Duruşa göre kapanış (Ders 7, 9) | yok | planlayıcı girdisi `{ posture }` (`firstEver` gibi) ve Kapanış kliplerinde isteğe bağlı `posture: 'lying'` etiketi; etiketli klip yalnız uzanarak çalar |
| 3 dk tabanları | `BLOCK_MIN_AMEND`, `AMEND_BELOW_SEC = 360` (timing.py:112-113) | 3 dk için ikinci istisna kümesi (T < 240): Ders 8 C1 ≥ 0:35, Ders 10 C5 ≥ 0:40; sahibe görünür |
| Şafak | `DAWN_SPAN = (60, 90)` (timing.py:98) | T < 240 için (45, 90) |
| Hızlı kapanış | `QUICK_BOUNDS = (60, 110)` (timing.py:95), Ders 2'nin değeri | ders başına: uzanarak (60, 110), oturarak (45, 110) |
| Boş pay (T6) | 5 dk'da üretim köşesi modeliyle ≥ 15 sn (timing.py:114) | ölçülmüş sürelerle ve yavaş seste denetlenir; en kısa sürüm için tavan (3 dk'da ≥ 10 sn önerisi, VARSAYIM) |
| Test dakikaları | `MINUTES = range(5, 31)` (timing.py:65) | derse göre `minutes.min … minutes.max`; ilk yayında 3 ve 5–15 |
| Test (f) | "5 dk = Varış + en az bir P1 blok + Kapanış" (PLAN.v2.md:594) | "en kısa sürüm = …"; 3 dk'da ayrıca: yalnız oturarak, nefes payı ≥ 12 sn, anahtar cümle ≥ 1, "-(y)abil-" ≤ 3 / 60 sn |
| Ekran | kaydırıcı 5–30, çipler 5 · 10 · 15 · 20 · 30, süzgeç "5 dakikalık" (PLAN.v2.md:1323, :1327-1331) | ilk yayında çipler 3 · 5 · 15 (derse göre), süzgeç "3 dakikalık"; kaydırıcı Aşama 3'te |
| Sürüm notu | "5 ile 30 dakika arasında istediğin sürede" (PLAN.v2.md:1559) | ilk yayında "3, 5 ya da 15 dakika" (Ders 2, 3 ve 7'de 5 dakikadan); cümle Türkçe editörden geçer |

---

## 9. Sahibe kararlar

1. **3 dakika yalnız yedi derste olsun mu?** Önerim evet: Ders 2 ve 3'te anlamsız ya da sığmıyor, Ders 7'de
   güvenlik açısından sakıncalı (§3.4).
2. **Ders 2'ye 20 dk çipi eklensin mi?** Önerim evet ve varsayılan 20. Eklenmezse ilk yayında zıtlık çiftleri hiç
   duyulmaz (§5-4).
3. **3 dk istisnaları:** Ders 8 C1 0:38 ve Ders 10 C5 0:43 (çekirdek tabanı 0:55'in altında); 3 dk'da şafak 45–48 sn
   (60 yerine). Önerim üçüne de onay.
4. **Ders 2'nin 5 dakikası:** Varış'tan ≈ 16 hecelik 5 dk kısa biçimi (önerim) ya da T6 tabanını düşürmek.
5. **Kaydırıcı ("istenen dakika") ne zaman açılsın?** Önerim Aşama 3'te, 30 dk ile birlikte. İstenirse 5–15 arası
   ilk yayında açılabilir; ek ses gerektirmez, yalnız test gerektirir.
6. **Uzanarak kısa sürümler:** Ders 7 uzanarak en kısa 6 dk, Ders 9 uzanarak en kısa 5 dk (3 dk yalnız oturarak).
7. **Varsayılan süreler:** 5 dk (1, 4, 5, 6, 7, 8, 10), 15 dk (3, 9), Ders 2 için 2. karara göre 20 ya da 15.

---

## 10. VARSAYIM ve doğrulanmayanlar

- 3 dk iskeleti (0:34 / 1:38 / 0:48), kapak hece sayıları, paylar, ±%15 bant ve bütün çapa süreleri VARSAYIM'dır.
  Metin okutulunca ölçülür.
- Ders 2'nin 5 dk hesabındaki üç kısa biçimin süresi tahmindir (okutulmadı).
- Oturarak kapanışın 0:46–0:52 sürmesi Ders 2'nin kapanış klipleriyle hesaplandı; öteki derslerin kapanış metni henüz
  yok.
- Uzanarak Ders 7'nin 6 dk, uzanarak Ders 9'un kapanışının ≈ 1:40 sürmesi Ders 2'nin ölçülmüş kapanışından çıkarıldı.
- Tasarlanacak hoca sesinin hızı bilinmiyor. Neslihan'dan yavaş çıkarsa bütün kısa sürüm bütçeleri yeniden hesaplanır.
- 3 dakikalık oturumun etkisi için dosyalarda doğrulanmış bir çalışma yok (§3.3). 3 dk sürümün kartında etki cümlesi
  olmaz.
- Maliyet oranları (≈ 1,75–1,9 kat) yalnız Ders 2'nin modelinden gelir.
- Kulakla dinleme yapılmadı; pilot karışımları da sahibi tarafından henüz dinlenmedi (report.md:152).

---

## Kaynaklar

**PubMed (hepsi yoga-pilot dosyalarında ikinci turda doğrulanmış):** Radin 2025 (39808431,
10.1001/jamanetworkopen.2024.54435) · Moszeik 2025 (40373021, 10.1002/smi.70049) · Balban 2023 (36630953,
10.1016/j.xcrm.2022.100895) · Meevissen 2011 (21450262, 10.1016/j.jbtep.2011.02.012) · Marschin 2026 (42453615,
10.3389/fspor.2026.1774292) · Mrazek 2012 (22309719, 10.1037/a0026678) · Norris 2018 (30127731,
10.3389/fnhum.2018.00315) · Schumer 2018 (29939051, 10.1037/ccp0000324) · Luu 2024 (39690521,
10.17761/2024-D-24-00021) · Howard 2017 (28300508, 10.1080/00029157.2016.1203281) · Tran 2021 (34260686,
10.1093/ageing/afab090) · Hilditch 2017 (28366332, 10.1016/j.sleep.2016.12.016) · Hilditch & McHill 2019 (31692489,
10.2147/NSS.S188911) · Harvey & Payne 2002 (11863237, 10.1016/s0005-7967(01)00012-2) · Knowlton & Larkin 2006
(16941239, 10.1007/s10484-006-9014-6) · Sharpe 2023 (36731199, 10.1016/j.jpsychores.2023.111169) · Braith 1988
(3069875, 10.1016/0005-7916(88)90040-7) · Creaser 2022 (35391975, 10.3389/fpsyg.2022.765602) · Galante 2014
(24979314, 10.1037/a0037249) · Kross 2014 (24467424, 10.1037/a0035173).

**Dosyalar (okunan satırlar):** yoga-pilot/PLAN.v2.md:13-14, :129-137, :147-479, :483-870, :1016, :1323-1355,
:1376-1377, :1476-1478, :1502-1515, :1559, :1622-1667, :1722-1723 · yoga-pilot/SAHIP_ISTEKLERI.md:1-33 ·
yoga-pilot/pilot/timing.py:1-45, :48-155, :158-520, :1352-1406 · yoga-pilot/pilot/timing.out.txt:1-249 ·
yoga-pilot/pilot/ders2.lesson.json:9-15, :122-129, :270-278 · yoga-pilot/render/SPEC.md:1-97 ·
yoga-pilot/render/out/report.md:1-169 · yoga-pilot/render/out/plan-nes.json, plan-hak.json (olay listeleri) ·
yoga-pilot/render/sel/*/selection-*.json (ölçümler) · yoga-pilot/dossier-benlik.dogrulanmis.md:57, :84, :504 ·
yoga-pilot/dossier-guvenlik.dogrulanmis.md:300-352 · yoga-pilot/dossier-teslim.dogrulanmis.md:44, :251-253 ·
yoga-pilot/pazar.md:313, :360-376 · docs/yol-haritasi/YAPILACAKLAR.md:55-79 ·
docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md:1-30 · docs/yol-haritasi/tasarim/YOL.ilerleme.md:179-191, :262-266,
:334-352 · docs/yol-haritasi/tasarim/YOL.moduller.md:496-617.
