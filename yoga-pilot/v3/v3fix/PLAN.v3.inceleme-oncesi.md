# Nefona Yoga · İlk yayın ve yola entegrasyon planı (sürüm 3)

Tarih: 2026-09-29. Durum: **PLAN, sahibin onayına**. Depoda hiçbir dosya değişmedi, git yazma komutu çalışmadı, ücretli
ElevenLabs çağrısı yapılmadı. Bu belge `yoga-pilot/PLAN.v2.md`'yi (on dersin tasarımı, metin kılavuzu, ses kuralları) ve
yol tasarım belgelerini tekrar etmez; onlara atıf yapar. Yalnız **ilk yayını (Yoga v1)** ve **yola entegrasyonu** kesin
kararlarla anlatır.

**Dayandığı çalışma notları** (bu klasörde; her biri kendi kaynaklarını satır satır verir): `sure.md` (süreler ve 3/5/15
blokları), `yol.md` (yoldaki yer, 30 günlük benzetim), `uretim.md` (teslim biçimi, boyut, kredi), `modul.md` (ekranlar,
kayıt, Gelişim, Nef, güvenlik). Notlar arasındaki çelişkiler §2.0'da tek tek seçildi. Onaydan sonra bu belge ve dört not
`yoga-pilot/` altına taşınır.

**Bu belgede ayrıca doğrulananlar:** harcama defteri satır satır yeniden toplandı (`render/ledger.jsonl`, 399 satır);
Ders 2'nin 20 dakikası için gereken ek birimler pilot planlayıcısıyla, kredi ve boyut bu planın kapsamıyla yeniden
hesaplandı (`v3calc/d2_20.py`, `v3calc/kredi.py`; ikisi de depoyu yalnız okur); yol benzetimi yeniden koşuldu
(`sim/yolsim_b.mjs`, 10.00 ve 19.00, 30 ve 90 gün; sonuçlar `yol.md` ile aynı) ve `today.js` eklerinin eşdeğerlik
sınaması tekrarlandı (`sim/esdeger.mjs`). Kod iddiaları `dosya:satır` biçimindedir
ve yalnız bu görevde okuduğum satırlardandır.

**Kanıt kuralı:** bilimsel iddialar yalnız yoga-pilot dosyalarında ikinci turda doğrulanmış kayıtlardandır, PMID ve DOI
taşır. Kanıtın sayı vermediği her değer **VARSAYIM** diye işaretlidir. Sağlık iddiası yoktur; uygulama "tedavi eder,
iyileştirir" demez.

---

## 1. Tek sayfada

**Ne yapılacak.** On dersten oluşan sesli bir yoga modülü. Her ders 30 dakikalık bütün bir ders olarak tasarlanır; ilk
yayında 3, 5 ve 15 dakikalık sürümlerle gelir. Kısa sürüm kesilmiş bir parça değildir: karşılamayla başlar, kapanışla
biter, hiçbir cümle yarıda kalmaz. On dersi tek hoca sesi anlatır; modül Gelişim'e, Nef'e ve Bugün'ün yoluna bağlanır.

**On ders ve ilk yayındaki süreleri (dakika):** 1 Nefesin Ritmi 3·5·15 · 2 Derin Dinlenme 5·15·20 · 3 Uykuya Geçiş 5·15 ·
4 Zor Anlar İçin 3·5·15 · 5 Tek Nokta 3·5·15 · 6 Sabah Niyeti 3·5·15 · 7 Kendine Şefkat 5·15 · 8 Sağlam Yer 3·5·15 ·
9 Kendini Tanımak 3·5·15 · 10 Gelecekteki Sen 3·5·15. Üç derste 3 dakika yok: uzanarak yapılan Derin Dinlenme güvenli
kalkış adımlarıyla 3 dakikaya sığmaz, Uykuya Geçiş'in imgelemesi 3 dakikada kurulamaz, Kendine Şefkat'in kademeli sırası
3 dakikada güvenli değildir. 30 dakika ve "istediğin dakika" ikinci aşamada gelir.

**Yolda (kural).** Yoga yola 3. günde girer, 2. bölümün son durağı olur, göz bütçesine sayılmaz. Her gün 3 dakikalık bir
ders; altı kısa yoga gününden sonra, ölçüm olmayan ilk gün 5 dakikalık tam ders (yaklaşık haftada bir). Haftalık
E testi günü yoga yoktur; okuma testi günü yoga 3 dakikadır. Her gün o güne kadar en az yapılmış ders seçilir. 15 dakika
yolda durak değildir; kişi dersi ekranda 15 dakikaya uzatabilir. Her gün 10.00'da açan yeni kullanıcının ilk 14 günü
(süresi yazılmayanlar 3 dk): 1 E testi, yoga yok · 2 okuma, yoga henüz açılmadı · 3 Nefesin Ritmi · 4 Tek Nokta · 5 Zor
Anlar İçin · 6 Sabah Niyeti · 7 Sağlam Yer · 8 E testi, yoga yok · 9 Kendini Tanımak · **10 Derin Dinlenme, 5 dk** ·
11 Gelecekteki Sen · 12 Nefesin Ritmi · 13 Tek Nokta · 14 Zor Anlar İçin. Benzetimde yol 30 günün hiçbirinde 20 dakikayı
aşmadı (ortalama 17,1). Durak, sonsuz yolun ilerleme sayacıyla (yol planındaki (c) adımı) birlikte açılır.

**Elde olan.** Yalnız Ders 2'nin 15 dakikası iki sesle (Neslihan, Hakan) ve iki müzik kaynağıyla kör A/B olarak üretildi;
ölçüm eşiklerini geçti ama henüz kulakla dinlenmedi. Uygulamada yoga kodu yok.

**Sıradaki adımlar ve onay kapıların.** Kapı 1: bu planı onaylarsın; pilotun küçük kusurları düzeltilir, tasarlanan hoca
sesi üçüncü aday olur. Kapı 2: kör karışımları dinler, sesi ve müzik kaynağını seçersin. Kapı 3: ekran tasarımını ve
seçilen sesle Ders 2'nin 5 · 15 · 20 dakikasını tarayıcıda görür, dinlersin; kod ancak bundan sonra yazılır. Kapı 4:
Ders 2'yi iPhone'da, kilitli ekranda dinlersin. Kapı 5–7: kalan dokuz ders üçer üçer gelir (1-3-5, 4-7-8, 6-9-10); metin
önce insan inceleyicilerden geçer, sonra seslendirilip ölçülür; her partiyi TestFlight'ta dinlersin. Kapı 8: on dersin
hepsi onaylanınca modül yayına girer. Plan onayından yayına ≈ 8–10 hafta (tahmin).

**Maliyet ve boyut (tahmin).** Tek ses ve ElevenLabs müziğiyle ≈ 370–530 bin kredi (≈ 67–96 USD); tasarlanan ses adayı
ve %15 düzeltme payıyla ≈ 405–575 bin (≈ 74–105 USD). Müzik uygulamanın kendi motorundan gelirse, aday ve pay dahil
≈ 185–270 bin. Pilot 62,9 bin (11,44 USD) tuttu. Ses dosyaları uygulamaya ≈ 113–125 MB ekler (AAC 64; kodek testi 96
isterse ≈ 170–188 MB); uygulamanın bugünkü ses ve model dosyaları ≈ 80 MB.

**Senden istenen kararlar (önerimle):**
1. Tasarlanan hoca sesi kör dinlemeye girsin mi? Öneri: evet (29 Eylül kararın); tarif "sıcak, alçak perdeli, orta yaşta,
   İstanbul Türkçesiyle konuşan bir meditasyon hocası", örnek cümle Ders 2'nin açılışı; ≈ 14–15 bin kredi + önizleme.
2. İnsan inceleyiciler kim olsun? Türkçe editör, usta hoca, Ders 4 ve 7 için klinik psikolog ve en az beş kişilik dinleme
   paneli (biri 65 yaş üstü). Öneri: adlarını sen belirle; onayları olmadan hiçbir metin seslendirilmez.
3. Bütçe tavanı. Öneri: parti başına 185 bin, toplam 580 bin kredi (≈ 105 USD).
4. Süre istisnaları. Öneri: Derin Dinlenme'ye 20 dakika da eklensin ve varsayılanı olsun (zıtlık çiftleri ancak 19.
   dakikada giriyor); 3 dakikada Sağlam Yer'in ve Gelecekteki Sen'in birer bloğu 0:55 tabanının altında kalabilsin (0:38
   ve 0:43); 3 dakikada kapanış şafağı 60 yerine 45 saniye sürsün.
5. Yol. Öneri: meditasyon ayrı durak olmasın, yoganın kısa dersleri yolun tek sakin durağı olsun; Nefes yolda 3 dakikada
   dursun (5 dakikası Ana sayfada); yolun ilerleme motoru ((c) adımı) yoga üretimiyle aynı dönemde yazılsın.

---

## 2. Ayrıntı

### 2.0 Dört çalışma notu arasındaki çelişkiler ve seçimler

| # | Konu | Notlar ne diyor | Seçim | Gerekçe |
|---|---|---|---|---|
| 1 | Teslim biçimi | `uretim.md` §2: her ders × süre için hazır karışım (tek dosya). `modul.md` §4: hazır karışım önerilmez (iki sesle 212–231 MB, tek arka plan, ek kapanış karışımları) | **Hazır karışım** (§C.1) | Boyut tek ses kararıyla ≈ 113–125 MB'a iner; ek kapanış karışımı gerekmez, çünkü "Kapanışa geç" aynı dosyanın kendi kapanışına atlar; tek arka plan ilk yayında bilinçli bir sınırdır (satır 5). "Ses asla kesilmez" ancak dosyada, yayından önce ölçülerek kanıtlanır |
| 2 | Ses sayısı | `uretim.md`: 1 ses. `modul.md`: Neslihan · Hakan seçimi | **Tek ses** | Sahibin kararı: "pilotta üçü kör karşılaştırılır, sahibi dinleyip seçer" (yoga-pilot/SAHIP_ISTEKLERI.md:23-24). On derste tek hoca; konuşma kredisi ve dosya boyutu yarıya iner |
| 3 | 3 dk'nın kapsamı | `uretim.md` §6: on derste 3 dk. `sure.md` §3.4: yalnız yedi derste | **Yedi ders** (1, 4, 5, 6, 8, 9, 10) | Ölçülmüş sürelerle kuruldu (§A.3). Kredi ve boyut bu kapsamla yeniden hesaplandı |
| 4 | 3 dk'nın biçimi | `uretim.md` §2.4: "oturarak ya da gözler açık; usta hoca kararı". `sure.md` §3: yalnız oturarak, kendi kısa karşılama ve kapanış metniyle | **`sure.md`** | Ölçümle kurulmuş iskelet ve 12 kural; usta hoca yine onaylar |
| 5 | Seçenekler | `modul.md` §2.4: arka plan (Müzik · Doğa · Sessizlik), sahne, duruş, netlik anahtarı. `uretim.md` §2.3: ilk yayında tek sahne | **İlk yayında her derste tek ses manzarası**; Ders 2'de Orman; Ders 7 ve 9 oturarak; netlik anahtarı yok | Her seçenek dosya sayısını katlar. Sahibin ölçütü ses, müzik ve görselin tam uyumudur; bu, her derste ölçülmüş tek bir birleşimle en güvenli biçimde sağlanır; seçenekler ikinci aşamada motorla, ek dosya olmadan gelir. Anlaşılırlık panelde 65 yaş üstü dinleyiciyle sınanır (§E.4) |
| 6 | "Kaldığın yerden" kartı | `yol.md` §3.9: Ana sayfada 7 gün. `modul.md` §2.10: kütüphanenin üstünde, yalnız 15 ve 20 dk | **`modul.md`** | PLAN.v2 §E.1 kartı kütüphaneye koyar; 3 ve 5 dk'lık dersi ortasından sürdürmek karşılama–kapanış bütünlüğünü bozar |
| 7 | Akşam önerisi | `yol.md`: 20.00, "Akşam uyumadan önce dinliyorsan uyku dersi daha uygun olabilir." `modul.md` §10.3-d: 20.00, "Uyumadan önce dinliyorsan Uykuya Geçiş daha uygun olabilir." | **`modul.md` metni** | Tek saat; dersin adı söylenir; "akşam" ile "uyumadan önce" aynı şeyi iki kez söylemez |
| 8 | Uygulama içi planlayıcı | `yol.md`, `modul.md`: `lib/yoga.js` planlayıcıyla aynı dosya. `uretim.md`: hazır karışımda gerekmez | **İlk yayında uygulamada planlayıcı yok** | Planlayıcı üretimde (Python) kalır. `lib/yoga.js` yol durağını, kaydı, görsel durumunu ve sabah sorusunu taşır. Planlayıcı ikinci aşamada motorla gelir |
| 9 | Boyut | `modul.md` G2: ≈ 165–180 MB (iki ses, ayrı izler). `uretim.md` §4: ≈ 110 MB (230 dk) | **≈ 113–125 MB** (AAC 64) | Tek ses; 7 × 3 + 10 × 5 + 10 × 15 = 221 dk, Ders 2'nin 20 dk'sıyla 241 dk, ayrıca ≈ 15–20 dk yardımcı dosya (§C.2) |
| 10 | İlk ders cümlesi | PLAN.v2 §A.1 ve `sure.md` §3.1: Varış'ın içinde, süreye dahil | **Ders başına kısa bir giriş dosyası** | Hazır karışımda her dosyanın iki sürümü gerekirdi. Kişinin ilk yoga dersinde ders ≈ 5 sn uzar (§D.3) |
| 11 | Yoldaki pay | `uretim.md` §2.4, YOL.ilerleme okumasıyla: "her bölüm 3 dk, yürüyüşle gün aşırı" | **`yol.md`** | §B.1 |
| 12 | 30 dk metni ne zaman | `uretim.md` §8: metin 30 dk tasarımına göre yazılır. `sure.md` §6: 16–30 dk metni ikinci aşamada | **İskelet şimdi, 16–30 dk metni ikinci aşamada** (§A.4) | İnsan incelemesi yayına girecek metne yoğunlaşır; önek kuralı ≤ 15 dk planlarını korur |
| 13 | "Bitti" koşulu | PLAN.v2 başlık notu: cihazda 5 ve 30 dk | **En kısa sürüm ve 15 dk (Ders 2'de 20)** | İlk yayında 30 dk yok; 30 dk koşulu ikinci aşamaya geçer (sahibe görünür değişiklik) |

---

### A. Süreler ve ders blokları

#### A.1 Ders ders ilk yayın

| Ders | Duruş | Süreler (dk) | Varsayılan | 3 dk'nın çekirdeği | Not |
|---|---|---|---|---|---|
| 1 Nefesin Ritmi | oturarak | 3 · 5 · 15 | 5 | doğal nefesi fark etme → 4 sn al, 6 sn ver, ≈ 6 döngü, tutma yok → anahtar cümle | — |
| 2 Derin Dinlenme (Yoga Nidra) | uzanarak | 5 · 15 · 20 | 20 (karar 4 onaylanmazsa 15) | — | 5 dk'da Varış'ın kısa biçimi (§A.3) |
| 3 Uykuya Geçiş | yatakta | 5 · 15 | 15 | — | müzik kuyruğu sürenin dışında |
| 4 Zor Anlar İçin | oturarak, gözler yarı açık | 3 · 5 · 15 | 5 | yalnız dayanak: ayak tabanları, eller, odadaki sesler, üç uzun veriş, "huzursuzluk normal" cümlesi | duyguyu bedende bulma bloğu 3 dk'da yok; sonda 112 satırı |
| 5 Tek Nokta | oturarak | 3 · 5 · 15 | 5 | nefes çapası, iki kısa sessiz odak aralığı (≤ 18 sn), "Fark ettiğin an, zaten geri döndün." | — |
| 6 Sabah Niyeti | oturarak | 3 · 5 · 15 | 5 | doğal nefes ve oturarak omurga hareketi → tek kelimelik niyet | yolda yalnız 05.00–12.00 |
| 7 Kendine Şefkat | oturarak | 5 · 15 | 5 | — | uzanarak seçeneği ikinci aşamada |
| 8 Sağlam Yer | oturarak | 3 · 5 · 15 | 5 | oturarak dağ duruşu (0:38, istisna) → sakin iç ses | — |
| 9 Kendini Tanımak | oturarak | 3 · 5 · 15 | 15 | kısa beden taraması, bir kez "Dikkatin şimdi nerede?" | uzanarak seçeneği ikinci aşamada |
| 10 Gelecekteki Sen | oturarak | 3 · 5 · 15 | 5 | tek sahne, kişisel alan → küçük adım ve eğer-ise cümlesi (0:43, istisna); niyet son cümle | — |

Varsayılanlar PLAN.v2'nin "5 dk en çok dinlenecek sürüm gibi tasarlanır" ilkesine ve gerçek kullanıma dayanır: bir
RKÇ'nin tam metninde meditasyona özgü kullanım günde ortalama 3,36 dk idi; kullanıcıların %69,7'si günde 5 dakikanın
altında kaldı (Radin 2025, PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435)).
3 dk hiçbir dersin varsayılanı değildir; yoldaki kısa durak ve zor an içindir. Her dersin blok blok 3/5/15 çapa süreleri
`sure.md` §4'tedir (hepsi VARSAYIM; metin okutulunca ölçülen sürelerle yeniden hesaplanır).

#### A.2 3 dakika nasıl kurulur

İskelet (oturarak yapılan gündüz dersi; `sure.md` §3.1): giriş müziği 0:04 → Varış 0:30 → çekirdek 1:38 → Kapanış 0:48.
Metin ≈ 310–330 hece (≈ 110–140 sözcük), konuşma payı ≈ %41. Varış ve Kapanış'ın hecesi Ders 2'nin ölçülmüş kliplerinden
türetildi; çekirdek hecesi süre × pay × ölçülmüş brüt hız ile hesaplandı (Neslihan: rehberli 4,29, liste 3,80 hece/sn).
Bu bir **VARSAYIM modelidir** (±%15); ilk 3 dk metni okutulunca ölçülür.

Kurallar (hepsi planlayıcı testine girer; ayrıntı `sure.md` §3.2):
1. **Yalnız oturarak.** Uzanarak yapılan dersin kapanışı ölçülmüş sürelerle 1:42–1:44'tür; Derin Dinlenme'de Varış ile
   Kapanış tek başına 2:30–2:33 tutar. Yana dönme, oturma, bekleme ve kalkma adımları kısaltılmaz: 65 yaş üstünde ayağa
   kalkınca ilk anda görülen kan basıncı düşüşü, sürekli ölçümle havuzlanmış olarak %29 sıklıkta bulundu (Tran 2021, PMID
   34260686, DOI [10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090)).
2. **Kapaklar kendi kısa metinleriyle kurulur, sıkıştırılarak değil.** Kapanış sessizlikleri kısalmaz; kısalık,
   `short` biçimli kliplerden ve `minTarget` ile dışarıda kalan kliplerden gelir.
3. **Zaman verir:** her yönergeden sonra eylem süresi + en az 2 sn; çekirdekte en az bir 12–20 sn'lik nefes payı; 20 sn'yi
   aşan sessizlik yok.
4. **Tabanlar:** çekirdek blok ≥ 0:55, niyet ve yerleşme bloğu ≥ 0:20 (timing.py:111). İki istisna karar 4'tedir.
5. **Anahtar cümle bir kez;** başarısızlığı olağan sayan bir cümle bulunur.
6. **"-(y)abil-" sınırı:** herhangi bir 60 sn'de en çok üç (timing.py:103-104). Ortak açılış cümlesi tek başına üç taşıdığı
   için, 3 dk'da dersin kendi açılış cümlesi "-(y)abil-"siz bir kısa biçimle söylenir (Ders 1, 5, 6, 8, 9, 10).
7. **Son 60 sn'de** nefes tutma, yeni imge ya da zor blok yok; çekirdeğin son klibi dönüş cümlesi ya da niyettir.
8. **Şafak:** gündüz kapanışında görsel şafak bugün en az 60 sn ister (timing.py:98); 3 dk'da 45 sn (karar 4).
9. **Zor blok 3 dk'da açılmaz:** duygu açan bloklar (Ders 4'te duyguyu bedende bulmak, Ders 7'de kendine dönüş) 3 dk'ya
   girmez, çünkü hemen ardından kapanış gelirdi.
10. **Alt küme:** 3 dk planı 5 dk planının alt kümesidir; 5 ile 15 dk arasında her plan bir sonraki dakikanın planının
    alt kümesidir (önek kuralı, timing.py:22). Planlayıcı testi bugün 5–30 dk'yı denetler (timing.py:65); ilk yayında
    3 dk da eklenir.
11. **Müzik:** 3 dk'da iki doku geçişi (Varış → çekirdek, çekirdek → Kapanış); dersin müzik teması aynı kalır.
12. **Kaynak kartında 3 dk'ya özgü etki cümlesi yoktur.** Bu dosyalarda 3 dakikalık bir oturumun etkisini sınayan çalışma
    yok; kısa farkındalık eğitimlerinde olumsuz duygulanımdaki etki, yayın yanlılığı düzeltilince g = 0,04'e indi
    (Schumer 2018, PMID 29939051, DOI [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). Kart yalnız Radin
    2025'in kullanım bulgusunu ve "Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık." cümlesini yazar.

#### A.3 Üç dersin 3 dakikası neden yok; Ders 2'nin özel durumu

- **Derin Dinlenme:** uzanarak yapılır; Varış + Kapanış 2:30–2:33, tek bir çekirdek blokla 3:23–3:27 (`sure.md` §2.3).
- **Uykuya Geçiş:** dersin özü ilgi çekici, tek sahneli imgelemedir; dayanağı, uykusuzluk yaşayan 41 kişide ilgi çekici
  bir imgeyle dikkat dağıtma talimatının daha kısa uykuya dalma süresiyle birlikte gitmesidir (Harvey & Payne 2002, PMID
  11863237, DOI [10.1016/s0005-7967(01)00012-2](https://doi.org/10.1016/s0005-7967(01)00012-2)). Böyle bir sahne 1:40'ta
  kurulamaz. Hiçbir süre için
  "uyutur" denmez: tek bir 30 dk'lık yoga nidra kaydı, sessiz uzanmaya göre uykuya dalma süresini değiştirmedi (Sharpe
  2023, PMID 36731199, DOI [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169)).
- **Kendine Şefkat:** öz-şefkat kademeli kurulur (tarafsız dayanak → "istersen" daveti → kısa süre → dayanağa dönüş).
  Travma yaşamış kişilerde öz-şefkati kendine yöneltmek tehdit tepkisi oluşturdu (Creaser 2022, PMID 35391975, DOI
  [10.3389/fpsyg.2022.765602](https://doi.org/10.3389/fpsyg.2022.765602)). Üç P1 blok tabanlarıyla 4:07 eder. Sığdırmak için
  bir blok çıkarılırsa ders ya adının karşılığını yitirir ya da geriye daha riskli, doğrudan kendine yönelen yol kalır.
- **Ders 2'nin 5 dakikası sınırdadır.** Ölçülmüş klip süreleri, planlayıcının üretim köşesindeki tahminden Neslihan'da
  %10,9, Hakan'da %5,5 uzun çıktı. Bu ölçümle 5 dk sürümün boş payı Neslihan'da 11,6 sn'ye iner; taban 15 sn'dir
  (timing.py:114). **Düzeltme (sormadan):** Varış'a 5 dk'ya özgü, ≈ 16 hece kısa bir biçim yazılır; sessizlik ve taban
  korunur. Tasarlanan ses seçilirse ve daha yavaş okursa bütün kısa sürüm bütçeleri yeniden hesaplanır.
- **Ders 2'de 20 dakika (karar 4):** zıtlık çiftleri bloğu ancak 19. dakikada girer (`sure.md` §5-4); pilot ders
  verisinin varsayılanı da 20'dir (`defaultMinutes: 20`, ders2.lesson.json:10). 20 dk, 15 dk takımına 18 klip ve
  653 karakter (232 hece) ekler (üç hız köşesinin hepsiyle hesaplandı; `v3calc/d2_20.py`).
- **Pilot kusurlarından çıkan metin kuralları:** çok cümleli birimde iki nokta kullanılmaz (kesim yanlış yerden
  bölünüyordu); "sırtüstü" gibi bitişik birleşik sözcükler Scribe denetiminde ayrı yazımla eş sayılır.

#### A.4 30 dakikalık tasarım: şimdi ne yapılır, sonra ne gelir

- **İlk yayında sabitlenir:** her dersin 30 dakikalık iskeleti (blok listesi, giriş ve dolum sıraları, anahtar
  cümleler, imge yayı, müzik teması). Bu iskelet usta hocadan geçer. ≤ 15 dk'da (Ders 2'de ≤ 20 dk) çalabilecek bütün
  metin ve 3/5 dk kısa biçimleri yazılır, incelenir, seslendirilir.
- **İkinci aşamada gelir:** 16–30 dk metni, 30 dk ve 3/5–30 arasında her dakikayı seçen kaydırıcı, çalışma anında karışım
  motoru, arka plan, sahne ve duruş seçenekleri, isteğe bağlı ikinci ses. Önek kuralı gereği yeni artımların sırası
  15 dk'nın durduğu sıranın üstünde kaldıkça ≤ 15 dk planları değişmez; bu, derleme testiyle denetlenir. İlk yayının
  onaylı dosyaları motorun **karşılaştırma ölçütü** olur: motor aynı dersi aynı süreyle çaldığında kaydı bu dosyayla
  örtüşmelidir.
- **Neden 30 dk ilk yayında değil:** Ders 2'de 30 dk, 15 dk takımında olmayan 79 klip ve 2.490 karakter ister (metin
  ≈ %62 büyür; `uretim.md` §6). Kilitli ekranda 30 dk kesintisiz çalma bu uygulamada doğrulanmadı. Sahibin sözü de
  "ilk etapta 3-5-15".

---

### B. Yol entegrasyonu

#### B.1 İki yol belgesi arasındaki çelişki ve çözüm

İki tasarım belgesi yoganın yoldaki yerini farklı yazıyor. YOL.ilerleme §5.13: "Bölüm n = merdiven basamağı n (1–10), her
bölüm 3 dk, yol payı 3; yolda günde tek bölüm, Yürüyüş ile `beden` döndürmesinde (gün aşırı)"
(docs/yol-haritasi/tasarim/YOL.ilerleme.md:264-265). YOL.moduller §4.6: yoga Keşfet'ten bir kez dinlenince yola girer,
"Yol bütçesi 5 dk sayar", meditasyonla `sessiz` dönüşümünde (YOL.moduller.md:598-608).

| Konu | YOL.ilerleme §5.13 | YOL.moduller §4.5–4.6 | Karar | Gerekçe |
|---|---|---|---|---|
| Yola giriş | gün belirtilmemiş | Keşfet'ten bir kez dinleyince | **3. gün** (`totalDays ≥ 2`, bugün sayılmaz) | Sahibi "günlere göre" dedi; dinleme şartı girişi kişinin yogayı kendiliğinden bulmasına bırakır. 1. gün E testi ve kurulum, 2. gün okuma testi, Yılan ve Bugünün görevi ilk kez gelir; 3. gün yeni durağı olmayan ilk gündür |
| Süre | her bölüm 3 dk | 5 dk | **Her gün 3, yaklaşık haftada bir 5** | Derin Dinlenme ve Kendine Şefkat'in 3 dk'sı yok. Her gün 5 dk, benzetimde iki okuma gününde yoganın kendisini düşürüyor |
| "Bölüm" | merdiven basamağı 1–10 | ders | **Her gün bütün bir kısa ders; sıra sonsuz döner** | 30 dk'yı 3'er dakikalık on dilime bölmek her sürümün karşılama ve kapanışla bitmesi kuralını bozar; merdiven 10. günde biterdi, oysa yol sonsuz |
| Dönüşüm | yürüyüşle, gün aşırı | meditasyonla (`sessiz`) | **Yok** | Bir durak tek dönüşüm grubu taşır (`rotate` tek dizedir, lib/today.js:195); `beden` okuması benzetimde yürüyüşü 30 günün 13'ünde yoldan çıkarıyor. Meditasyon ayrı durak değil (karar 5) |
| Yolda yeri | belirtilmemiş | `practice`, `order: 97` | **2. bölümün son durağı, `order: 105`** | Yol sakin biter; uzanarak yapılan dersten sonra göz egzersizine dönülmez; kişi dersi 15 dk'ya uzatırsa yolun geri kalanı beklemez |
| Kayıt | `{ type: 'yoga', part, seconds }` | PLAN.v2 §E.4 | **PLAN.v2 §E.4** (§D.4) | Tek şema |
| Meditasyon | 15. günde açılır | 2. günden her gün 3 dk | **Yoganın kısa dersleri yolun tek sakin durağı** | İkinci bir ses hattı ve ikinci günlük sakin durak gerekmez; meditasyonun 3 dk'lık `sefkat` parçası Kendine Şefkat'teki güvenlik sorununu taşır |

Sahibin son sözleri iki belgeyi de aşar (yazımı düzeltilerek): "yolda modül entegre olacak, günlere göre yoga modülleri
yollarda yer alacak" (yoga-pilot/SAHIP_ISTEKLERI.md:27-28) ve "sonsuz yolun içinde yoga bölümleri de parça parça yer alacak"
(docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md:64-65). Bu planın okuması: her gün on dersten birinin kısa sürümü, bir
"parça" olarak yola girer; dersler günlere yayılır ve sıra sonsuz döner.

#### B.2 Kural

1. **Giriş:** yolda bir şey yapılan iki ayrı günden sonra (her gün açan kişide 3. gün). Gün atlayan kişide yoga, yolu
   açtığı 3. günde gelir.
2. **Yer:** 2. bölümün son durağı (Yılan'dan sonra, Bugünün görevi'nden önce). Göz bütçesine sayılmaz; göz molası
   kilidinde sıradaki durak olabilir.
3. **Süre:** kısa gün 3 dk. Altı kısa yoga gününden sonra, ölçüm olmayan ilk gün 5 dk'lık tam ders. Sayaç yoga günlerini
   sayar, takvim günlerini değil; gün atlamak tam dersi öne çekmez. Ana sayfadan 5 ya da 15 dk'lık bir ders tamamlanırsa o
   gün tam ders sayılır ve sayaç baştan başlar.
4. **Ölçüm günleri:** haftalık E testinin zamanı geldiği gün yoga yolda yoktur (E testi 5 dk'lık bir ölçümdür; benzetimde
   8., 15., 22. ve 29. günlerde yol yogasız da 19–20 dk). E testi o gün yapılmazsa ertesi gün yoga yine gelir ("en çok
   bir gün"; okuma testindeki kuralın aynısı, lib/today.js:124-127). Okuma günü yoga 3 dk'dır; tam ders o güne düşmez.
5. **Ders seçimi:** o güne kadar en az tamamlanmış uygun ders; eşitlikte kütüphane sırası: 1, 2, 5, 7, 4, 6, 8, 9, 10
   (PLAN.v2 §A.3). Kısa günlerde yalnız 3 dk'sı olan yedi ders aday olur; tam ders günlerinde Derin Dinlenme ve Kendine
   Şefkat kendiliğinden öne çıkar. Sabah Niyeti yalnız 05.00–12.00 arasında adaydır. Seçim gün içinde değişmez; tek
   istisna, sabah görünen Sabah Niyeti'nin öğleden sonra açılmasıdır: o zaman yerine sıradaki uygun ders gelir.
6. **Uykuya Geçiş sırada yoktur.** 20.00'den sonra yoldan açılan ders ekranında "Uyumadan önce dinliyorsan Uykuya Geçiş
   daha uygun olabilir." satırı ve geçiş düğmesi çıkar; tamamlanırsa durak da tamamlanır.
7. **15 dk yolda durak değildir;** ders ekranında seçilip tamamlanırsa durak tamamlanır, yol bütçesine yine 3 ya da 5 yazılır.
8. **Uzun ara:** son yoga gününden 14 gün ya da daha uzun süre sonraki ilk gün ders 3 dk'dır, tam ders o gün gelmez.
9. **"Sonra yaparım":** durak yerinde kalır, yol "tamam" sayılır, gün bitince durak sessizce düşer; yarına taşınmaz.
10. **Nefes:** yolda yönlendirilen nefes en çok 3 dk olur; mola yine 5 dk'dır. Bu, YOL.ilerleme'nin kendi kuralıdır:
    nefes merdiveninin son basamağı "5 (meditasyon açıldıysa 3)" (YOL.ilerleme.md:139). Günde 5 dk'lık nefes Ana sayfada
    kalır (Balban 2023: günde 5 dk, 1 ay; uzun verişli nefeste olumlu duygulanımda meditasyondan fazla değişim, kaygıda
    gruplar arası fark yok; PMID 36630953, DOI [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895)).
11. **Zor Anlar İçin yolda sırasıyla gelir.** 3 dk sürümü yalnız dayanak bloğudur; açılışı koşulludur ("Zor bir
    andaysan…") ve sonundaki "Sık tekrarlarsa bir uzmanla konuşmak iyi olur. Acil durumda 112." satırı yoldan açılınca da
    aynen çıkar.
12. **Durakta sağlık iddiası yoktur;** kart yalnız ders adını ve süreyi yazar ("Yoga · Nefesin Ritmi · 3 dk").

#### B.3 Gün gün, 1–30 (yeni kullanıcı, 1 Ekim 2026'da başlar, gün atlamaz)

E testi ve okuma günleri bugünkü kodun kurallarıyla, öteki duraklar YOL.ilerleme §5 merdivenleriyle (henüz kodda yok,
VARSAYIM) hesaplandı. "Yol dk": yolun bütçeye yazdığı toplam, bu kararla / yogasız aynı merdivenlerle. Süresi yazılmayan
dersler 3 dk'dır. Tam durak listesi `yol.md` Ek A'da.

| Gün | Ölçüm | Yoga, 10.00'da açan | Yoga, 19.00'da açan | Nefes dk | Yol dk |
|---|---|---|---|---|---|
| 1 | E testi | — | — | 1 / 1 | 8 / 8 |
| 2 | okuma | — (henüz açılmadı) | — | 1 / 1 | 10 / 10 |
| 3 | — | Nefesin Ritmi | Nefesin Ritmi | 2 / 2 | 11 / 8 |
| 4 | — | Tek Nokta | Tek Nokta | 2 / 2 | 13 / 10 |
| 5 | — | Zor Anlar İçin | Zor Anlar İçin | 3 / 3 | 15 / 12 |
| 6 | — | Sabah Niyeti | Sağlam Yer | 3 / 3 | 16 / 13 |
| 7 | — | Sağlam Yer | Kendini Tanımak | 3 / 4 | 16 / 14 |
| 8 | E testi | — | — | 3 / 4 | 19 / 20 |
| 9 | okuma | Kendini Tanımak | Gelecekteki Sen | 3 / 5 | 20 / 19 |
| 10 | — | **Derin Dinlenme, 5 dk** | **Derin Dinlenme, 5 dk** | 3 / 5 | 20 / 17 |
| 11 | — | Gelecekteki Sen | Nefesin Ritmi | 3 / 5 | 17 / 16 |
| 12 | — | Nefesin Ritmi | Tek Nokta | 3 / 5 | 18 / 17 |
| 13 | — | Tek Nokta | Zor Anlar İçin | 3 / 5 | 17 / 16 |
| 14 | — | Zor Anlar İçin | Sağlam Yer | 3 / 5 | 18 / 17 |
| 15 | E testi | — | — | 3 / 5 | 19 / 19 |
| 16 | okuma | Sabah Niyeti | Kendini Tanımak | 3 / 5 | 19 / 20 |
| 17 | — | Sağlam Yer | Gelecekteki Sen | 3 / 5 | 17 / 16 |
| 18 | — | **Kendine Şefkat, 5 dk** | **Kendine Şefkat, 5 dk** | 3 / 5 | 20 / 17 |
| 19 | — | Kendini Tanımak | Nefesin Ritmi | 3 / 5 | 17 / 16 |
| 20 | — | Gelecekteki Sen | Tek Nokta | 3 / 5 | 18 / 17 |
| 21 | — | Nefesin Ritmi | Zor Anlar İçin | 3 / 5 | 17 / 16 |
| 22 | E testi | — | — | 3 / 5 | 20 / 20 |
| 23 | okuma | Tek Nokta | Sağlam Yer | 3 / 5 | 20 / 19 |
| 24 | — | Zor Anlar İçin | Kendini Tanımak | 3 / 5 | 18 / 17 |
| 25 | — | Sabah Niyeti | Gelecekteki Sen | 3 / 5 | 17 / 16 |
| 26 | — | **Derin Dinlenme, 5 dk** | **Derin Dinlenme, 5 dk** | 3 / 5 | 20 / 17 |
| 27 | — | Sağlam Yer | Nefesin Ritmi | 3 / 5 | 17 / 16 |
| 28 | — | Kendini Tanımak | Tek Nokta | 3 / 5 | 18 / 17 |
| 29 | E testi | — | — | 3 / 5 | 19 / 19 |
| 30 | okuma | Gelecekteki Sen | Zor Anlar İçin | 3 / 5 | 19 / 20 |

Özet: 30 günde 24 yoga günü (21 kısa, 3 tam ders); yol en kısa 8, en uzun 20, ortalama 17,1 dk (yogasız 16,0); 20 dk hiç
aşılmadı. Yoga 30 günde iki okuma gününde (16 ve 30) bir oyun durağını (Tek Bakışta, Fark Ettin mi?) yoldan çıkardı;
haftalık kota sürdüğü için o durak ertesi gün geldi. 19.00'da açan kişide Sabah Niyeti hiç gelmez, sıra bir kayar. 90
günde: 76 yoga günü, 10 tam ders (beşi Derin Dinlenme, beşi Kendine Şefkat), ortalama 17,9 dk, hiçbir gün 20'yi aşmıyor.
90. günden sonra YOL.ilerleme §8.6'daki haftalık odak modülü yoga olduğunda, o hafta ölçüm olmayan her gün 5 dk'dır.

İki yan bulgu (yogadan bağımsız, ilerleme işinin konusu): YOL.ilerleme merdivenleriyle yol yogasız da 15 dk hedefinin
üstünde (ortalama 16,0); Yılan 2. bölümün göz payına takılıp yogasız da 30 günün 21'inde düşüyor.

#### B.4 Özel durumlar

| Durum | Ne olur |
|---|---|
| Gün atlandı | Sıradaki ders bekler; ceza, sıfırlama, "seri bozuldu" ekranı yok |
| Ders yarıda bırakıldı | Tamamlanmadıkça durak tamam değildir; 15 ve 20 dk'lık derste "Kaldığın yerden" kartı kütüphanenin üstünde 7 gün durur; yol ertesi gün yine sıradaki dersi önerir |
| Ana sayfadan ders yapıldı | Bugün tamamlanan herhangi bir yoga dersi (Uykuya Geçiş dahil) durağı tamamlar |
| Gece yarısından sonra dinlenen uyku dersi | Yeni günün durağını tamamlar (gün anahtarı yerel takvim günü) |
| Uzun aradan dönüş, E testi ve okuma birlikte gecikmiş | Yol ağırdır; 20 dk sınırı önce oyunları, sonra yogayı düşürebilir (benzetimde 16 günlük aradan sonraki gün) |
| Hafif gün (YOL.ilerleme §13.4, karar bekliyor) | Yoga 3 dk kalır |

#### B.5 Kod sözleşmesi ve bağımlılık

**Bağımlılık:** yoga durağı, YOL.ilerleme §11'deki `ctx.progression` sayacına (`totalDays`, modül başına yapılan gün)
dayanır. Bu sayaç yol planının (c) adımıdır ("ilerleme motoru + nefes ve göz merdivenleri"; YAPILACAKLAR.md, "Sonsuz yol
ve ilk 5 saniye" bölümü) ve kendi onayını bekliyor. Karar 5 onaylanırsa (c) yoga üretimi sürerken yazılır. (c) yoga
yayınına yetişmezse yoga önce Ana sayfada yayımlanır; durak (c) ile kendiliğinden açılır. Benzetimin 20 dk sonuçları (c)'nin
merdivenleriyle hesaplandığı için durağı (c)'den önce açmıyorum.

```js
// lib/yoga.js (saf, belirlenimci): yol durağı. Tam taslak: yol.md §5.1
export const PATH_SEQ = [1, 2, 5, 7, 4, 6, 8, 9, 10]      // PLAN.v2 §A.3; Uykuya Geçiş sırada yok
export function pathYoga(ctx, lessonMin) { /* null | { lesson, minutes: 3|5, full, soft, night, done } */ }

// modules/yoga/manifest.js → today(ctx). Tam taslak: yol.md §5.2
today(ctx) {
  if (!ctx.progression) return null                         // ilerleme kapalıyken bugünkü yol aynen kalır
  const p = pathYoga(ctx, LESSON_MIN)                       // LESSON_MIN: her dersin yayımlanmış en kısa dosyası
  if (!p) return null
  return { title: 'Yoga', sub: LESSONS[p.lesson].title, minutes: p.minutes, route: `yoga-${p.lesson}`,
           slot: 'practice', order: 105, glyph: 'lotus', dropRank: 1.8, done: p.done,
           stage: { lesson: p.lesson, minutes: p.minutes, full: p.full, soft: p.soft, night: p.night } }
}
```

`lib/today.js`'e üç küçük ek (`yol.md` §5.3):
- `collect` (lib/today.js:163) durak alanlarını tek tek kopyalar (:190-203) ve bilinmeyen alanı düşürür; `later` ("Sonra
  yaparım") ve `stage` alanları eklenir.
- R5 (lib/today.js:294-298) bugün açık uçlu durağı bölümün en sonuna taşır; ek kuralla açık uçlu durak son **göz
  bütçeli** durağın arkasına gelir, yoga ondan sonra kalır. Eksiz sıra "Göz kırpma · Yoga · Yılan" olurdu.
- `allDone` (lib/today.js:326) `later` işaretli durağı beklemez.

Bu üç ekin kopyası, bugünkü `today.js` ile `ctx.progression` olmadan 20.000 rastgele bağlamda karşılaştırıldı: durak
listesi, süreler, sıradaki durak, `allDone` ve kilit işaretleri **0 farkla** aynı (`yol.md` §5.3; `sim/esdeger.mjs`, bu
görevde 19 canlı manifestle yeniden koşuldu: 20.000 bağlam, 0 fark).
Bugünkü testler `ctx.progression` vermediği için yoga onlarda görünmez. `TodayPath.jsx`'e yeni `lotus` çizimi ve alt
satır (ders adı · süre) eklenir (`yol.md` §5.4). Testler `yol.md` §5.6'daki listedir.

---

### C. Üretim

#### C.1 Teslim biçimi: hazır karışım

Her ders × süre için tek bir hazır karışım ses dosyası ve aynı hesaptan çıkan bir `timeline.json` üretilir. Pilot zaten
böyle üretildi: `render/tools/mix.py`, motorun kurallarını çevrimdışı uygulayan bir karıştırıcıdır.

Gerekçe:
- **"Ses asla kesilmez" yayından önce dosyada kanıtlanır.** Süre, her konuşma parçasının kendi yerinde bulunması, tık,
  dijital sessizlik ve konuşma/yatak farkı son dosyada ölçülür (§E.3). Motor yolunda aynı güvence, bu ortamda
  derlenemeyen ve cihazda hiç denenmemiş bir yerel koda bağlı kalırdı.
- **Oynatıcı, uygulamanın bugün kilitte çalan oynatıcısıyla aynı sınıftır:** uyku sesi AVAudioPlayer ile çalıyor
  (ios/App/App/AlarmPlugin.swift:244-248), arka planda çalma izni var (ios/App/App/Info.plist:56-59).
- **Uygulamada planlayıcı gerekmez;** yeni yerel kod küçüktür (§D.3).
- **Onaylı dosyalar ikinci aşamanın motoruna karşılaştırma ölçütü olur** (§A.4).

İlk yayında bu yüzden olmayanlar ve karşılıkları:

| Olmayan | İlk yayında | Ne zaman |
|---|---|---|
| Ses seçimi | Sahibin seçtiği tek hoca sesi | İkinci ses, istenirse indirilebilir ek olarak |
| Arka plan seçimi (Müzik · Doğa · Sessizlik) | Her derste tasarlanmış tek ses manzarası (müzik; derste varsa doğa katmanı) | İkinci aşama, motorla |
| Sahne seçimi (Ders 2) | Orman (pilotta üretilen) | Kıyı, ikinci aşama |
| Duruş seçimi (Ders 7, 9) | Oturarak | Uzanarak, ikinci aşama |
| Netlik anahtarı, konuşma/müzik dengesi | Tek karışım; anlaşılırlık panelde 65 yaş üstü dinleyiciyle sınanır, gerekirse bütün karışımlarda eşik yükselir (§E.4) | İkinci aşama, motorla |
| Dönüşümlü açılışlar (Ders 2'de `a.acilis`, `n1.sec`) | Biri dosyada sabit | İkinci aşama |

#### C.2 Dosya takımı, biçim, boyut ve dağıtım

**Dosyalar (1 ses):** 7 × 3 dk + 10 × 5 dk + 10 × 15 dk = 221 dk; Ders 2'nin 20 dk'sıyla 241 dk. Ayrıca ≈ 15–20 dk
yardımcı dosya (VARSAYIM): ders başına kısa giriş (ilk ders cümlesi), açılış izni (kaldığın yerden sürdürmek için),
sesli dönüş (durdurma ekranı), imge ya da zor bloklar için bırakma ön klipleri; Uykuya Geçiş için döngülenen müzik kuyruğu;
ilk derste çalan 10 sn'lik ses denetimi. Her dosyanın yanında `timeline.json` (pilotta 15 dk için ≈ 73–76 kB).

**Biçim:** ana kopya 44,1 kHz stereo WAV, depo dışında (sahibin Mac'i ve bulut, iki kopya). Uygulama dosyası m4a içinde
AAC-LC; bit hızı kör kodek testiyle seçilir: AAC-LC 64 pilot MP3'ünden ayırt edilemezse 64, edilirse 96 (§E.4). HE-AAC
seçilmez: düşük bit hızında yumuşak, sessiz müzikte yapay tını riski taşır (VARSAYIM). Değişken bit hızlı MP3 kullanılmaz: klip başından sürdürme ve görsel uyum kesin konum ister. Bu ortamda
AAC üretilemiyor (ffmpeg ve afconvert yok); kodlama ve kodlanmış dosyanın yeniden ölçümü sahibin Mac'inde tek bir
betikle yapılır.

**Boyut** (1 ses). Alt uç: 221 dk + 15 dk yardımcı dosya = 236 dk (Ders 2'ye 20 dk eklenmezse); üst uç: 241 dk + 20 dk
yardımcı dosya = 261 dk. MB/dk bit hızından; MP3 satırı pilotun ölçülen dosyalarından (15 dk'da 12,38–12,80 MB):

| Biçim | MB/dk | Ses dosyaları (236–261 dk) | Uygulamanın yeni toplamı (bugün ≈ 80 MB) |
|---|---|---|---|
| **AAC-LC 64 (kodek testini geçerse)** | 0,48 | **≈ 113–125 MB** | **≈ 193–205 MB** |
| AAC-LC 96 | 0,72 | ≈ 170–188 MB | ≈ 250–268 MB |
| MP3 ABR 120 (pilot) | 0,83–0,85 | ≈ 196–222 MB | ≈ 276–302 MB |

Bugünkü ≈ 80 MB bu görevde ölçüldü: `app/public` 54 MB (34 MB mediapipe-wasm, 16 MB uyku sesi, 4,8 MB `voice` klasörü) ve iOS
`Sounds` klasörü 25 MB. iOS'ta çalınmayan uyku kısılma MP3'leri (≈ 7,6 MB; `uretim.md` §4) paketten çıkarılabilir (ayrı
iş). App Store'un hücresel indirme eşiği bu çalışmada doğrulanmadı; bilinen değer 200 MB'tır (VARSAYIM).

**Dağıtım: hepsi pakette** (AAC 96 gerekse de). Ağ yok, sunucu yok, gizlilik akışı yok; ders uçak kipinde de çalar ve
"asla kesilmez" ağa bağlı değildir. İndirme altyapısı bugün yok (`@capacitor/filesystem` yok, Supabase Storage kullanılmıyor; `uretim.md`
§3). İkinci aşamada boyut büyürse indirme, `uretim.md` §5'teki gizlilik kurallarıyla (içerik özetinden dosya adı, tek
paket, kimliksiz istek, bütünlük denetimi, akışla çalma yok) planlanır.

**Depo:** `app/public` altındaki dosyalar depoya girer (Git LFS yok). Bu yüzden depoya yalnız onaylanmış son dosyalar,
parti başına bir kez girer; ham çekimler ve WAV ana kopyalar depo dışında kalır.

#### C.3 Kredi: ölçülmüş birim maliyetle

**Pilotta harcanan (defter satır satır toplandı; 1 kredi = 0,01818 sent, yani 5.500 kredi = 1 USD, MCP çalışma alanının
oranı):**

| Kalem | Kredi | Sent | Fiyatın durumu |
|---|---|---|---|
| Konuşma (TTS, `eleven_v4`, birim başına 3 çekim), Neslihan, 73 satır | 12.381,5 | 225,17 | tahmin fiyatı; **gerçek fiyatla uzlaştırılmadı** |
| Konuşma, Hakan, 71 satır | 11.770,4 | 214,05 | aynı |
| Scribe, konuşma doğrulaması | 4.488,4 | 81,61 | gerçek (5,5 kredi/sn) |
| Müzik (7 parça, 1.620 sn) | 24.294,6 | 441,72 | gerçek (15,0 kredi/sn) |
| Doğa ve dönüş tınısı | 413,3 | 7,51 | gerçek |
| Scribe, müzikte vokal denetimi | 9.592,0 | 174,40 | gerçek |
| **Toplam (399 satır)** | **62.940,3** | **1.144,46 (11,44 USD)** | |

**Birim değerler:** konuşma (3 çekim, pilot oranında yeniden çekim ve Scribe dahil) 3,47–3,62 kredi/karakter; müzik
15,0 kredi/sn + vokal denetimi 5,5 kredi/sn, ders başına 1.200–1.620 sn üretimle 24,6–33,9 bin kredi. Ders 2'nin 15 dk
birim takımı 68 birim, 4.042 karakter, 1.405 hecedir.

**Kapsam:** Ders 2'nin 15 dk birimleri iki seste hazır. Ders 2'ye yalnız 5 dk kısa biçimleri (194 karakter), 20 dk'nın
ek birimleri (653 karakter) ve yardımcı klipler eklenir. Kalan dokuz ders baştan üretilir. Ders başına metin: alt uç
Ders 2'nin ölçülen takımı + kısa biçimler + 3 dk metni (3 dk'sı olan derslerde 4.666, olmayanlarda 4.236 karakter); üst uç
PLAN.v2 §B.4.1 metin bütçesinin Ders 2'de ölçülen oranla ölçeklenmesi (5.040–7.553 karakter). Müziği ElevenLabs'ten gelen
her ders için yatak takımı ayrıca üretilir; bir dersin 3, 5 ve 15 dk'sı aynı yatakları kullanır, dersler arasında yatak
paylaşılmaz ("her ders benzersiz").

| Senaryo (1 ses) | Çekirdek kredi | + tasarlanan ses adayı + %15 düzeltme payı |
|---|---|---|
| **ElevenLabs müziği (9 ders)** | **≈ 370–530 bin (≈ 67–96 USD)** | **≈ 405–575 bin (≈ 74–105 USD)** |
| Karma: bordun ya da ton imzalı Ders 1, 4, 5, 8 uygulama hattından, 3, 6, 7, 9, 10 ElevenLabs | ≈ 270–390 bin (≈ 49–71 USD) | ≈ 305–440 bin (≈ 56–80 USD) |
| Dalga motoru müziği | ≈ 150–220 bin (≈ 27–40 USD) | ≈ 185–270 bin (≈ 33–49 USD) |

Bileşenler (ElevenLabs senaryosu): dokuz dersin konuşması 142,6–216,8 bin; Ders 2'nin eki (5 dk kısa biçimleri ve
20 dk birimleri) 2,9–3,4 bin; dokuz dersin müziği 221,4–305,0 bin; doğa ≈ 2,2 bin. **En büyük kalem müziktir.** Tasarlanan ses adayı (Ders 2'nin 15 dk'sı) 14,0–14,6
bin + ses tasarımı önizlemeleri (maliyeti doğrulanmadı); düzeltme payı konuşmanın %15'i, 21,8–33,0 bin (VARSAYIM).
Yardımcı kliplerin konuşması (ilk ders cümlesi, sesli dönüş; her derste aynı metin) ≈ 1 bin tutar ve düzeltme payından
karşılanır (VARSAYIM).

**Partiler** (1 ses + ElevenLabs müziği): Parti 1 (Ders 1, 3, 5) ≈ 121–166 bin · Parti 2 (Ders 4, 7, 8) ≈ 121–178 bin ·
Parti 3 (Ders 6, 9, 10) ≈ 122–178 bin. Sıra PLAN.v2 §F.2'dir: ilk parti gece dersini ve nefes–görsel kilidini içerdiği
için önce gelir.

**Tabloya girmeyenler:** tam karışımın Scribe ile yazıya çevrilmesi (241 dk × 5,5 kredi/sn ≈ 80 bin; yerel dosyayı
yükleme yolu yok; yapılmaz, yerine parça konum denetimi: §E.3); Ders 2'nin 20 dk'sı için ek müzik gerekirse ≤ ≈ 6 bin
(VARSAYIM). İkinci aşama (30 dk; kaba tahmin, VARSAYIM): konuşma ≈ 86–148 bin, ElevenLabs müziği kullanılırsa ≈ 185 bin
(`uretim.md` §6).

**Karşılaştırma:** PLAN.v2 on dersin tamamı için 753 bin – 1,17 milyon kredi öngörmüştü (iki ses, 5–30 dk). Pilot, öngörülen
123–141 bin yerine 62,9 bin tuttu (yalnız 15 dk; müziğin gerçek fiyatı tahminin %55'i).

#### C.4 Üretim hattı (her ders için aynı)

1. **Metin:** 30 dk iskeletine göre; ≤ 15 dk'da çalabilecek bütün birimler ve 3/5 dk kısa biçimleri. Model ilk denetimi
   yapar; sonra üç insan incelemesi (§E.1) **seslendirmeden önce** biter.
2. **Planlar:** her süre için pilot planlayıcısıyla, model hızıyla değil **seçilen sesin ölçülmüş süreleriyle** kurulur
   ve bütün plan denetimlerinden geçer (§E.3).
3. **Seslendirme:** `eleven_v4`, birim başına 3 çekim (`generations_count` her çağrıda açıkça 3; verilmezse varsayılan 4);
   ham dosyalar hemen indirilir (imzalı adresler 2 saat geçerli). Çekim sayısı düşürülmez: en iyi okuma, birimlerin
   Neslihan'da %31'inde, Hakan'da %25'inde üçüncü çekimdi.
4. **Seçim:** nesnel sıralama + Scribe ile harf harf eşleşme + en çok bir yeniden çekim (§E.2).
5. **Müzik:** dersin kendi imzasıyla; düzlük, vuruşsuzluk, döngü eki ve vokal denetimleri. Dalga ya da karma seçilirse
   ilgili dersler uygulamanın müzik hattından.
6. **Karışım:** her süre için hazır karışım + `timeline.json`; bütün ölçümler (§E.3).
7. **Kodlama (Mac):** AAC; kodlanmış dosya çözülüp aynı ölçümlerden yeniden geçer.
8. **Rapor:** pilotun `report.md` biçiminde; kulak listesi inceleyiciye gider. Rapor temiz değilse dosya sahibe gitmez.

**Araç işleri (kredisiz):** `render/tools/mix.py` ve `pilot/timing.py` bugün Ders 2'ye bağlı; ders, süre, ses ve müzik
kaynağı parametre olur, Ders 2'ye özgü sabitler ders verisine taşınır, 3 dk kuralları ve denetimleri eklenir (`sure.md`
§8'deki liste: `minutes.min`, `short` listesi, 3 dk tabanları, şafak, hızlı kapanış, T6 ve test dakikaları). Scribe
normalleştirmesine birleşik sözcük kuralı, kesim kuralına "iki nokta değil, cümle sonu" kuralı eklenir.

#### C.5 Bütçe denetimi

Her parti başlamadan tahmin edilir ve onaylı tavanla karşılaştırılır (karar 3). Her ücretli çağrı önce deftere yazılır;
her çağrıdan sonra gerçek fiyat okunup uzlaştırma satırı yazılır, **TTS dahil** (pilotta TTS uzlaştırılmadı). Tavan
aşılacaksa durulur ve rapora yazılır. Tahmin yanıtlarına güvenilmez: pilotta Scribe'ın tahmini gerçeğin 16 katı düşüktü,
müziğin tahmini ise gerçeğin ≈ 1,8 katıydı (`uretim.md` §1).

---

### D. Uygulama modülü

Ayrıntılar `modul.md`'dedir; burada yalnız ilk yayının kesin hâli ve §2.0'daki seçimlerin modüle etkisi var.

#### D.1 Kapsam

| Konu | İlk yayında |
|---|---|
| Dersler | On ders; bir ders ancak §E.7'deki dört koşulu geçince görünür (ders verisinde süre başına `published`) |
| Süreler | §A.1; kaydırıcı yok; ders içinde bölüm işaretli ilerleme çizgisi ve bölüme atlama var |
| Ses ve arka plan | Tek hoca sesi; derste tasarlanmış tek ses manzarası |
| Oynatıcı | Kilit ekranında çalma, Now Playing, duraklat/sürdür, kapanışa geç, durdur, sarma, altyazı |
| Görsel | Her derse özgü tek "nefes formu"; Hareketi Azalt'a uyar; yanıp sönme yok |
| Ölçüm | Önce ve sonra puanı (1–10), zorlanma sorusu, Uykuya Geçiş için ertesi sabah sorusu |
| Gelişim ve Nef | `modul.md` §7–§9 |
| Yol | §B |

#### D.2 Ekranlar

Akış: Ana sayfa → Pratikler → "Yoga" kutucuğu → kütüphane → ders ayrıntısı → (ilk kez: güvenlik kartı ve 10 sn'lik ses
denetimi) → önce puanı → oynatıcı → sonra puanı ve zorlanma sorusu → bitiş. Yoldan açılan ders aynı ekranlardan geçer,
süresi yolun süresiyle hazır gelir. Ekranların metinleri ve kuralları `modul.md` §2'dedir; ilk yayındaki değişiklikler:

- Ders ayrıntısında **ses, arka plan, sahne ve duruş seçimleri ile netlik anahtarı yoktur.** Kalanlar: ad ve söz, süre
  çipleri, bölüm şeridi (yalnız o sürede gerçekten çalan bölümler), hazırlık kartı (uzanarak yapılan derslerde), uyku
  dersinde "Ders bitince müzik: Kapalı · 5 dk · 10 dk · 20 dk", Kaynaklar kartı, "Başla"nın üstünde açılış satırları,
  akşam satırı.
- **Ses denetimi** ilk derste, "Başla"dan önce 10 sn: seçilen sesle, Derin evre düzeyinde üç kısa sözcük. Soru: "Sözcükleri
  rahatça seçebildin mi?" Evet · Hayır · Atla. "Hayır" cevabında: "Sesi biraz açıp yeniden dene; kulaklık da
  kullanabilirsin." Netlik anahtarı olmadığı için anlaşılırlık yayından önce panelde güvenceye alınır (§E.4).
- **Ad (PLAN.v2 G8-b):** kütüphane başlığı "Yoga ve Meditasyon"; 320 px'te sığması gereken kutucuk ve yol durağı "Yoga".
- Güvenlik kartındaki ve sonuç ekranlarındaki dört metin düzeltmesi `modul.md` §10.3'teki gibidir; hepsi Türkçe editör
  onayından geçer.
- Önce tasarım Artifact'ı çizilir (iki tema, 320 px, gerçek Ders 2 sesiyle eşzamanlı görsel); kod ancak sahibin
  onayından sonra yazılır (Kapı 3).

#### D.3 Oynatıcı ve yerel kod

Yeni yerel sınıf, pbxproj'a dokunmamak için mevcut `AlarmPlugin.swift`'e eklenir; mevcut `sleepStart`, `sleepStop` ve
`sleepStatus` değişmez. Uyku sesi bugün tek bir AVAudioPlayer ile çalıyor (AlarmPlugin.swift:244-248), oturumu
`AppAudioSession.shared.beginSleep()` ile alıyor (:240) ve kesinti gözlemcisi kuruyor (:256-258). Ders oynatıcısı aynı
kalıbı kullanır.

- **Köprü:** `lessonStart({ file, at, title })`, `lessonPause()`, `lessonResume({ at })`, `lessonSeek({ at })`,
  `lessonCrossTo({ file, at })` (iki oynatıcı arasında 2 sn'lik geçiş), `lessonStop()`, `lessonStatus()` →
  `{ time, duration, playing, route }`.
- **Eklenecek gözlemciler:** rota değişimi (kulaklık çıkınca duraklat), medya hizmetlerinin sıfırlanması (aynı konumdan
  yeniden kur). Now Playing ve uzaktan komut (yalnız oynat ve duraklat) eklenir. Dinlenen saniye yerelde de yazılır; JS
  açılışta kaydı uzlaştırır.
- **Ekran:** JS, `lessonStatus().time`'ı ekran açıkken saniyede birkaç kez okur ve görseli `timeline.json`'dan çizer
  (duvar saatinden değil). Ekran açık tutulmaz; ders kilitte sürer.

| Olay | Hazır karışımda nasıl |
|---|---|
| Süre doluyor | Dosya kapanışla biter; hiçbir cümle yarıda kalmaz (planlayıcı bunu dosyayı kurarken sağlar, ölçüm doğrular) |
| Duraklat / sürdür | 1 sn'de söner; sürdürünce `timeline.json`'daki o anki klibin başına oturur, 1 sn'de açılır |
| Kapanışa geç | O anki cümle biter; aynı dosyada Kapanış'ın başına, dönüş tınısından önceki sessizliğe 2 sn'lik geçişle atlanır; kapanış kısalmaz. İmge ya da zor bloğun içindeyse önce o bloğun bırakma ön klibi çalar. Uyku dersinde "Uykuya geç" uyku iznine atlar |
| Sarma, bölüme atlama | En yakın klip başına 1–2 sn'lik geçişle; imge ya da zor bloktan çıkılıyorsa önce bırakma klibi |
| X (durdur) | Onaysız; 2 sn'de söner; durdurma ekranı ve isteğe bağlı sesli dönüş dosyası (20–30 sn) |
| İlk ders cümlesi | Kişinin ilk yoga dersinde önce kısa giriş dosyası çalar (dersin giriş müziği + "Bugün yalnızca tanışıyoruz; zorlanırsan kısalt."), sonra dersin başına 2 sn'lik geçiş. Ders bu tek seferde ≈ 5 sn uzar |
| Kaldığın yerden (15 ve 20 dk) | Önce açılış izni dosyası ("İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin."), sonra bölümün başına geçiş |
| Uyku dersinin sonu | Uyku izninden sonra ses susar; müzik kuyruğu, bugünkü uyku sesinin kalıbıyla (döngü + son 3 dk'da kısılma; varsayılan kısılma 180 sn, AlarmPlugin.swift:230, :245, :259) seçilen süre çalar ve **tamamen durur**; uyandırma yok |
| Arama, Siri, kulaklık, Bluetooth, uygulamanın kapanması | `modul.md` §4 tablosundaki gibi; hepsi cihaz listesinde (§E.5) |
| Dalga'nın uyku sesi çalıyorsa | "Başla"nın üstünde "Çalan uyku sesi duracak." satırı; ikisi aynı anda çalmaz |

Geçiş noktaları hep sessizlik ya da yatak üzerindedir; tık ve faz sorunu cihazda, bilinen anlarında tık olan bir deneme
dosyasıyla sınanır (VARSAYIM: AVAudioPlayer'ın konuma oturma kesinliği doğrulanmadı).

#### D.4 Kayıt

Şema `modul.md` §6.1'dir (`type: 'yoga'`, `lesson`, `planned` 180 | 300 | 900 | 1200, `seconds`, `reachedClosing`,
`completed`, `before`, `after`, `hard`, `sleepEase`, `contentHash` …). İlk yayında sabit olan alanlar (ses, arka plan,
duruş, sahne) yine yazılır; böylece ikinci aşamada şema değişmez. Kurallar:
- 30 sn'den kısa dinleme kaydedilmez (VARSAYIM).
- **Tamamlandı** = kapanışa ulaşıldı **ve** planlanan sürenin en az %60'ı dinlendi (VARSAYIM).
- Kayıt ses bittiği anda yazılır, puanlar sonra eklenir. Bugünkü depo yalnız ekleme yapıyor (lib/storage.js:87-92); küçük
  bir `updateSession(id, patch)` eki gerekir. Başka hiçbir çağrı değişmez.
- `contentHash` dosyanın özetidir; dosya değişirse yarım kalan ders "Bu ders güncellendi; baştan başlayacak." der.

#### D.5 Gelişim ve Nef

- **Gelişim** (`modul.md` §7): Pratikler kartında üç satır (7 günde dakika ve ders, tamamlanan, pratik günü); rekor kutusu
  "Yoga · pratik yapılan gün" (süre rekoru yok); dokuz dersin önce → sonra puanı kendi alanında (Ders 3'te yok); Uykuya
  Geçiş için "Uykuya dalma kolaylığı (ertesi sabah)"; 28 günlük şeritte Sakinlik (PLAN.v2 G1-a). Kartlar puanları "nasıl
  hissettin" gidişatı olarak gösterir, etki kanıtı olarak değil; "stresini azalttı", "bilimsel olarak kanıtlandı" gibi bir
  cümle hiçbir yerde yok. Nedeni: 73 ruh sağlığı uygulamasının mağaza açıklamasının %64'ü etkinlik iddia etti (Larsen 2019,
  PMID 31304366, DOI [10.1038/s41746-019-0093-1](https://doi.org/10.1038/s41746-019-0093-1)).
- **Nef** (`modul.md` §8): yalnız dört sayı gider (7 günde ders, dakika, tamamlanan ders, pratik günü). Puan, ders adı,
  zorlanma ve uyku cevabı gitmez; son 7 günde yoga yoksa özet `null`'dır. Nef'in "Yoga" önerisi için sunucu isteminde bir
  satır ve CoachCard'da bir eşleme eklenir. **Risk:** özet süzgeci ilk 10 modülü geçirir (lib/coachCore.js:44); yeni
  modüller geldikçe yoga dışarıda kalabilir. Karar YOL.moduller §2.6'da bekliyor.
- **Sabah sorusu** (`modul.md` §9): yalnız gece başlanmış Uykuya Geçiş'ten sonra, ertesi sabah tek kart; alarm sorusu
  bekliyorsa önce o.

#### D.6 Güvenlik

`modul.md` §10'daki her şey ilk yayındadır: bir kez gösterilen güvenlik kartı; her ders ekranında açılış satırları ve araç
uyarısı; onaysız durdurma ve dönüş ekranı; kısalmayan kapanış; zorlanma sorusu ve "Çok" cevabının iki biçimi; nefes tutma,
hızlı nefes ve ayakta hareket yok; uyku dersinde uyandırma yok, ses tamamen durur; Ders 4'ün sonunda 112 satırı; nöbet
cevabı "Hayır" değilse nefes formu nabız atmaz.

Dayanaklar (seçme): açılıştaki "dersi bitirebilirsin" izni, travma-duyarlı yoga nidranın özerklik ve onay bileşenlerine
dayanır (Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021)); gündüz
derslerinin kısalmayan dışa dönüşü, hipnoz sonrası "uyandırma" başarısızlığının istenmeyen etkilerde önemli bir etken
sayılmasına dayanır (Howard 2017, PMID 28300508, DOI
[10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)). Öteki dayanaklar `modul.md` §10.1'de.

#### D.7 Ücret

Bugün bütün uygulama tek yetkinin arkasında: abonelik ya da deneme yoksa yalnız güvenlik bilgisi ekranı açık kalır
(App.jsx:895-908). Yoga da bu kapının arkasındadır; deneme süresinde on ders açıktır (PLAN.v2 G4-a). "Bir ders hep açık"
seçeneği yeni bir ücretsiz kip ister; ilk yayının kapsamı dışındadır.

#### D.8 Değişen ve eklenen dosyalar (mevcut sistem bozulmaz)

Yeni: `modules/yoga/` (manifest ve ekranlar), `lib/yoga.js` (yol durağı, kayıt, `visualAt`, sabah sorusu),
`lib/yogaLessons.js` (ders verisi, `published` ve dosya adları), `public/yoga/` (ses ve `timeline.json`),
`AlarmPlugin.swift`'e yeni sınıf. Küçük ekler: `storage.updateSession`, Ana sayfada sabah kartı, `coachCore.js`'te bir istem
satırı (sunucu yeniden yayımlanır), CoachCard'da bir eşleme, `sources.js`'te bir kaynak türü, `today.js`'te üç ek,
`TodayPath.jsx`'te çizim ve alt satır. Değişecek mevcut testler ve eklenecek testler `modul.md` §16 ve `yol.md` §5.6'dadır.
Değişmeden yeşil kalması gereken testler, mevcut sistemin bozulmadığının kanıtıdır.

---

### E. Kalite kapıları

#### E.1 Metin (seslendirmeden önce, üç insan onayı)

- **Model ilk denetimi** (makineyle denetlenen kurallar): yasak sözcük ve iddia listesi (PLAN.v2 §C.6); herhangi bir 60 sn'de
  ≤ 150 hece ve ≤ %60 konuşma (timing.py:72-73); "-(y)abil-" ≤ 3 / 60 sn; çok cümleli birimde iki nokta yok; ekrandaki
  cümle = söylenen cümle; uyku dersinde uyandırma cümlesi yok.
- **Türkçe editör:** TDK yazımı; anlatım bozukluğu ve cümle düşüklüğü (özne–yüklem uyumu, eksik öğe, gereksiz sözcük,
  yanlış ek, çeviri kokan yapı); doğal söyleyiş; metin yüksek sesle okunarak denetlenir (yoga-pilot/SAHIP_ISTEKLERI.md:13-17).
- **Usta hoca:** PLAN.v2 §E.6'daki 18 ölçüt; 3 dk'da değişen üçü `modul.md` §12'de.
- **Klinik psikolog:** Ders 4 ve 7, kısa sürümleri dahil.
- **Ders 2 metni de bu üç onaydan geçer;** pilot, insan editör onayı beklenirken seslendirildi (PLAN.v2 §C.8 başlığı).
  Değişen birimler yeniden seslendirilir (düzeltme payından).

#### E.2 Ses (her klip)

- 3 çekim; nesnel sıralama (PLAN.v2 §D.1.4: eklemleme bandı, duraklama deseni, F0, tık, yükseklik, komşu klibe süreklilik).
- **Scribe ile harf harf:** her klip yazıya geri çevrilir; normalleştirilmiş metin sözcük sözcük aynı olmalıdır. Tek
  istisna, bitişik yazılan birleşik sözcüklerin ayrı yazımıdır (liste tutulur). Eşleşmezse en çok bir yeniden çekim;
  yine eşleşmezse klip "kulak listesi"ne girer ve Türkçe editör dinler. Yanlış vurgu ya da söyleyiş varsa klip yeniden
  üretilir.
- Kesim, çok cümleli birimde cümle sonundaki duraklamadan yapılır; yalnız ölçüyle denetlenen kesimler kulak listesine
  girer (pilotta ses başına 32 birim).
- Hakan seçilirse üretimde mikro kliplerin RMS ofseti yeniden ayarlanır ve tepe yönetimi klip düzeyinde yapılır (pilotta
  1 sn'den kısa 8–9 parça 13,0–14,9 dB'de kaldı; 40 parça sınırlayıcıda 3 dB'den çok kısıldı).

#### E.3 Karışım ve plan ölçümleri (her dosya; biri geçmezse dosya sahibe gitmez)

| Ölçüt | Eşik | Pilot (15 dk, 4 dosya) |
|---|---|---|
| Süre | hedef ± 1 sn | 900,049 sn |
| Olay sırası, eksik ya da çift cümle | plan ile birebir | geçti |
| Her konuşma parçası kodlanmış dosyada kendi yerinde | ilinti ≥ 0,95 (VARSAYIM), kayma ≤ 1 ms | 127–129 parça, en düşük 0,962, en büyük kayma 0,05 ms |
| Kurgu noktasında tık | yok | yok |
| Dijital sessizlik | < 100 ms | en uzun 0,0264 sn |
| Konuşma / yatak | ≥ 15 dB, **mikro parçalar dahil** | ≥ 1 sn parçalarda geçti; ortanca 17–18 dB; 1 sn'den kısa parçalardan Hakan'da 8–9'u, Neslihan'ın bir karışımında 1'i altında |
| Gerçek tepe | ≤ −1 dBTP | geçti |
| Bütünleşik yükseklik | gündüz −18 ± 1 LUFS, gece −20 (PLAN.v2 VARSAYIM) | −17,39 … −18,10 |
| Ekrandaki = söylenen | birebir | geçti |

Plan denetimleri (her ders × süre, seçilen sesin ölçülmüş süreleriyle): `check_plan` hatasız; boş pay 5 dk'da ≥ 15 sn
(timing.py:114), 3 dk'da ≥ 10 sn (VARSAYIM); yoğunluk ve "-(y)abil-"; şafak; son 60 sn; zor blok bölünmez ve kapanıştan
hemen önceye gelmez; alt küme 3 ⊂ 5 ⊂ 15 ⊂ 20. Kodlama sonrası: AAC dosyası Mac'te çözülüp konum ve tık denetiminden yeniden
geçer. Tam karışımın Scribe ile yazıya çevrilmesi yapılmaz (§C.3); yerine her parça, Scribe'dan geçmiş çekimden gelir ve
kodlanmış dosyada konumuyla bulunur.

#### E.4 Dinleme paneli ve kodek testi

Panel (PLAN.v2 G10): en az beş kişi; en az biri 65 yaş üstü, biri yeni başlayan, iki cinsiyet. Görevleri:
1. **Kodek testi** (Kapı 3'ten önce): aynı Ders 2 karışımı pilot MP3'ü, AAC-LC 96 ve AAC-LC 64 olarak; iPhone hoparlörü
   ve AirPods ile, sessiz odada, kör. AAC-LC 64 ayırt edilemezse o seçilir, edilirse 96.
2. **Anlaşılırlık:** 65 yaş üstü üye Derin evrede her sözcüğü rahatça seçebilmelidir. Seçemezse bütün karışımlarda
   konuşma/yatak eşiği yükseltilir (pilot verisinde netlik kipi için 21 dB yazılı; VARSAYIM).
3. **Her parti:** en az bir 3 dk ve bir 15 dk dosyası; "aceleci", "boş", "tekrar eden müzik" işaretleri.

Model sesi dinleyemez; kulak kararı gereken her şey insanla verilir.

#### E.5 Cihaz listesi (iPhone; her madde HATA_GUNLUGU'na)

`modul.md` §17'deki liste aynen, şu eklerle: kilitli ekranda 3, 5, 15 ve 20 dk kesintisiz; sarma, bölüme atlama, kapanışa
geç, ilk ders girişi ve kaldığın yerden geçişlerinde tık ya da faz sorunu yok; "Kapanışa geç" imge bloğundayken önce
bırakma klibi; Now Playing ve AirPods dokunuşu; arama ve Siri; kulaklık çıkınca duraklama; Bluetooth'a geçiş; nefes
formunun büyüme anı ile "al" sözü arasındaki fark hoparlörde ve AirPods'ta ölçülür (ölçülmeden "eşzamanlı" denmez);
15 dk kilitli çalmada pil tüketimi. Bu uygulamada kilitli ekranda uzun çalma, uyku sesi için bile henüz cihazda
işaretlenmedi (`uretim.md` §10); ilk cihaz testi bu yüzden Kapı 4'tür ve kalan partiler ondan sonra seslendirilir.

#### E.6 Sahibin dinlemesi

| Kapı | Ne dinler ya da görür | Nerede |
|---|---|---|
| 2 | Ders 2'nin 15 dk'sı: 3 ses × 2 müzik = 6 kör karışım (tasarlanan ses girmezse 4) | Artifact ya da dosya |
| 3 | Ekran tasarımı; seçilen sesle Ders 2'nin 5, 15 ve 20 dk'sı, görselle eşzamanlı | Tarayıcı (tasarım Artifact'ı; dosya sınırı yüzünden MP3, 20 dk'da 96 kbit/sn; asıl kodek Kapı 4'te iPhone'da) |
| 4 | Ders 2, kilitli ekranda | iPhone, TestFlight |
| 5–7 | Partinin her dersi: en kısa sürüm ve 15 dk (ilk partide bütün süreler) | iPhone, TestFlight |
| 8 | Yayın derlemesi | iPhone, TestFlight |

Kusur görülürse sormadan düzeltilir, ölçülür ve yeniden sunulur (yoga-pilot/SAHIP_ISTEKLERI.md:5-6).

#### E.7 "Bitti" tanımı

Bir ders ancak şu dört koşulla `[x]` olur: (1) metni üç insan incelemesinden geçmiş; (2) her klibi Scribe ile eşleşmiş ve
her dosyası §E.3'ten geçmiş; (3) cihazda kilitli ekranda en kısa sürümü ve 15 dk'sı (Ders 2'de 20) kesintisiz çalmış;
(4) sahibi dinleyip onaylamış. PLAN.v2'deki "5 ve 30 dakika" koşulu ikinci aşamaya geçer. Cihazda doğrulanmamış iş `[~]`'dir.

---

### F. Aşamalar ve takvim

| Adım | İş | Çıktı | Onay | Kredi | Süre (VARSAYIM) |
|---|---|---|---|---|---|
| **Kapı 1** | Bu plan ve beş karar | Onay | Sahip | 0 | — |
| A | Pilotun kapatılması (sahibe gitmez): Hakan'ın 40 parçası klip düzeyinde tepe yönetimiyle yeniden karıştırılır, mikro kliplerin RMS ofseti ayarlanır; Scribe birleşik sözcük kuralı; kesim kuralı SPEC'e yazılır; kulak listesi. Tasarlanan ses: tarifle tasarım, önizlemelerden biri kaydedilir, Ders 2'nin 15 dk birimleri seslendirilir, iki kör karışım | Ölçülmüş 6 (ya da 4) kör karışım ve rapor | — | ≈ 14–15 bin + önizleme | 2–4 gün |
| **Kapı 2** | Kör dinleme | Ses ve müzik kaynağı seçildi (PLAN.v2 G9 kapanır) | Sahip | 0 | sahibin zamanı |
| B | Kalıp: SPEC v3 (ses, model, çekim sayısı, yükseklik, kodek, dosya adları, `timeline.json` şeması, qa eşikleri, Scribe kuralları, 3 dk biçimi). Ders 2 metninin insan incelemesi; 5 dk kısa biçimleri ve 20 dk birimleri seçilen sesle; 5/15/20 karışımları; kodek testi (panel); tasarım Artifact'ı. Parti 1'in metni yazılıp inceleyicilere gider | Ders 2'nin üç dosyası ve raporu; Artifact | — | ≈ 3–5 bin (+ düzeltme) | 1–2 hafta |
| **Kapı 3** | Tasarım ve Ders 2, tarayıcıda | Kod onayı | Sahip | 0 | — |
| C | Kod: yerel oynatıcı, modül, kayıt, Gelişim, Nef, sabah sorusu, yol durağı (yalnız `ctx.progression` varken); testler; TestFlight (yalnız Ders 2 yayımlı). Parti 1 metni incelemede | Derleme, test raporu | — | 0 | 1–2 hafta |
| **Kapı 4** | Ders 2, iPhone'da; cihaz listesi | **Kalıp kilidi:** motor ve şartname bundan sonra değişmez; değişirse Ders 2 yeniden basılır | Sahip | 0 | — |
| **Kapı 5** | Parti 1: Ders 1, 3, 5 (seslendirme → müzik → karışım → ölçüm → rapor → TestFlight). Parti 2'nin metni incelemede | Üç dersin bütün dosyaları | Sahip | ≈ 121–166 bin | 1–2 hafta |
| **Kapı 6** | Parti 2: Ders 4, 7, 8 | aynı | Sahip | ≈ 121–178 bin | 1–2 hafta |
| **Kapı 7** | Parti 3: Ders 6, 9, 10 | aynı | Sahip | ≈ 122–178 bin | 1–2 hafta |
| **Kapı 8** | Yayın: on dersin cihaz listesi, sürüm notu (yeni kimlik), ENVANTER_VE_PLAN.md satırı, YAPILACAKLAR (g) maddesi | App Store derlemesi | Sahip | 0 | ≈ 1 hafta |
| Paralel | (c) ilerleme motoru (karar 5; kendi onayı ve testleriyle) | Yol durağı açılır | Sahip | 0 | Kapı 8'e kadar |

**Takvim:** plan onayından yayına ≈ 8–10 hafta (VARSAYIM). En büyük belirsizlik insan inceleyicilerin hızıdır; tahmin,
bir partinin metninin ≈ bir haftada dönmesine dayanır. Metin incelemesi bir önceki partinin seslendirilmesiyle üst üste
yürür; kalan dokuz dersin seslendirmesi ise Kapı 4'ün kalıp kilidinden önce başlamaz.

**Kısmi yayın yoktur:** sahibi "tam bir istiyorum" dedi; modül on dersin hepsi onaylanınca yayına girer.

**PLAN.v2 §G'nin durumu:** G1 → (a), ilk yayını bekletmez. G2 → hepsi pakette (§C.2). G3 → oynatıcı hep karanlık, kütüphane
ve ayrıntı iki temada. G4 → (a), tek abonelik kapısı. G5 → yol kapandı (yalnız MCP, `eleven_v4`); bütçe karar 3. G6 → (b),
tarif karar 1. G7 → (a), ayrı yaş sınırı yok (hızlı nefes, hiperventilasyon ve tutma hiçbir derste yok). G8 → (b), §D.2.
G9 → Kapı 2. G10 → karar 2. G11 → (b), `build-dev` yok sayılır, `Package.resolved` izlenir (sahibin Mac'inde). Karar
listesinde olmayanlar bu önerilerle uygulanır; itiraz edilirse değişir.

---

### G. Dürüst sınırlar ve VARSAYIM listesi

**Sınırlar:**
- **Kulakla dinleme yapılmadı.** Model sesi dinleyemez; pilotun dört karışımı ölçüldü ama sahibi tarafından henüz
  dinlenmedi. Bu belgedeki hiçbir ses kararı kulakla doğrulanmış değildir.
- **İnsan inceleyici henüz yok** (PLAN.v2 G10). Pilot metni, insan editör onayı beklerken seslendirildi.
- **Cihazda hiçbir şey denenmedi.** Swift bu ortamda derlenmiyor; AAC burada üretilemiyor; kilitli ekranda 15–20 dk
  çalma, rota değişimi, medya hizmetlerinin sıfırlanması, AVAudioPlayer'ın konuma oturma kesinliği ve Bluetooth
  gecikmesi doğrulanmadı.
- **TTS'in gerçek kredi fiyatı bilinmiyor;** defterdeki 144 TTS satırının hiçbiri uzlaştırılmadı. Aboneliğin kotası ve
  kalan kredisi de doğrulanmadı.
- **Tasarlanan sesin** hızı, önizleme maliyeti ve kullanım koşulları bilinmiyor; Neslihan ve Hakan kütüphane
  seslerinin ticari kullanım koşulları doğrulanmadı.
- **3 dakikalık oturumun etkisini sınayan bir çalışma bu dosyalarda yok;** kısa sürümün kartında etki cümlesi olmaz.
  Önce → sonra puanları beklenti ve tavan etkisi taşır; kişi içi gidişat olarak gösterilir.
- **Yol sayıları bir benzetimdir;** öteki durakların merdivenleri henüz kodda yok ve benzetim göz bütçesi bağlamı vermez.
- Nef rıza metninin dört sayıyı kapsadığı yorumu hukukçuya teyit ettirilmelidir (`modul.md` §8).

**VARSAYIM listesi (sahibin onayına açık):**
- Süre: 3 dk iskeleti (0:34 / 1:38 / 0:48), kapak hece sayıları, bütün çapa süreler ve metin bütçeleri (±%15); 3 dk'da
  boş pay tabanı 10 sn; 3 dk'da şafak 45 sn; oturarak kapanışın 0:46–0:52 sürmesi (Ders 2'nin klipleriyle hesaplandı).
- Kayıt: tamamlanma eşiği %60; 30 sn kayıt eşiği; kaldığın yer kuralları; sabah sorusu pencereleri.
- Yol: 3. gün girişi; 3 ve 5 dk; tam ders için 6 kısa yoga günü; 14 günlük yumuşak dönüş; Sabah Niyeti 05.00–12.00;
  akşam 20.00; `order: 105`; `dropRank: 1.8`; nefesin yolda 3 dk'da durması; E testinde "en çok bir gün"; "en az
  tamamlanan ders" seçimi; benzetimin girdisi olan bütün ilerleme merdivenleri.
- Üretim: dokuz dersin metin uzunluğu; ders başına 1.200–1.620 sn müziğin tekrarsızlığa yetmesi; %15 düzeltme payı;
  Ders 2'nin 20 dk'sı için müzik eki; 5.500 kredi = 1 USD.
- Boyut: yardımcı dosyaların 15–20 dk tutması; AAC 64'ün pilot MP3'ünden ayırt edilemeyeceği; HE-AAC'nin yapay tını riski; ses dosyalarının IPA'da
  pek küçülmemesi; App Store'un 200 MB eşiği.
- Parça konum denetiminde ilinti eşiği 0,95; gece dersinin yükseklik hedefi −20 LUFS.
- Takvim süreleri.

---

## Kaynaklar

**PubMed (hepsi yoga-pilot dosyalarında ikinci turda doğrulanmış):**

| PMID | Künye | DOI | Bu belgede |
|---|---|---|---|
| 39808431 | Radin 2025, JAMA Netw Open | 10.1001/jamanetworkopen.2024.54435 | §A.1, §A.2 (kullanım gerçeği; etki değil) |
| 29939051 | Schumer 2018 | 10.1037/ccp0000324 | §A.2 (kısa farkındalıkta küçük etki) |
| 34260686 | Tran 2021 | 10.1093/ageing/afab090 | §A.2 (kalkış adımları) |
| 11863237 | Harvey & Payne 2002 | 10.1016/s0005-7967(01)00012-2 | §A.3 (uyku dersinin imgelemesi) |
| 36731199 | Sharpe 2023 | 10.1016/j.jpsychores.2023.111169 | §A.3 ("uyutur" denmez) |
| 35391975 | Creaser 2022 | 10.3389/fpsyg.2022.765602 | §A.3 (öz-şefkatin kademeli kurulması) |
| 36630953 | Balban 2023, Cell Rep Med | 10.1016/j.xcrm.2022.100895 | §B.2 (5 dk nefes Ana sayfada) |
| 31304366 | Larsen 2019 | 10.1038/s41746-019-0093-1 | §D.5 (etkinlik iddiası yok) |
| 39690521 | Luu 2024 | 10.17761/2024-D-24-00021 | §D.6 (özerklik ve dışa dönüş) |
| 28300508 | Howard 2017 | 10.1080/00029157.2016.1203281 | §D.6 (kısalmayan kapanış) |

Kaynak: PubMed (National Library of Medicine). DOI'ler `https://doi.org/` önekiyle açılır.

**Dosyalar:** yoga-pilot/SAHIP_ISTEKLERI.md (tamamı) · yoga-pilot/PLAN.v2.md (1–60, 100–110, 156–430 kart başları,
474–482, 563–566, 1130–1150, 1622–1685) · yoga-pilot/render/out/report.md (tamamı) · yoga-pilot/render/ledger.jsonl
(399 satır, yeniden toplandı) · yoga-pilot/pilot/timing.py (20–24, 60–74, 93–115) · yoga-pilot/pilot/ders2.lesson.json
(9–60, 185–290) · yoga-pilot/dossier-*.dogrulanmis.md (kaynak satırları) · docs/yol-haritasi/YAPILACAKLAR.md (40–215) ·
docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md (tamamı) · YOL.ilerleme.md (136–148, 258–268) · YOL.moduller.md (494–510,
594–612) · app/ios/App/App/AlarmPlugin.swift (224–271) · app/ios/App/App/Info.plist (54–60) · app/src/lib/today.js
(118–130, 154–170, 190–209, 289–299, 322–328) · app/src/lib/storage.js (85–93; oturum yazan tek satır :89) · app/src/lib/coachCore.js (42–46) ·
app/src/App.jsx (893–909) · bu klasördeki `sure.md`, `yol.md`, `uretim.md`, `modul.md` (tamamı).
