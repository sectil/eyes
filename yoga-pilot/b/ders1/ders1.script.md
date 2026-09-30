# Ders 1 · Nefesin Ritmi · metin (B adımı, Parti 1)

Sürüm: B-parti1-taslak-2 (2026-09-30; karar 2 yedeği iki model incelemesi işlendi, b/INCELEME.md; sahibin kulağı bekliyor). Tek kaynak `ders1_kaynak.py` (+ `lesson_meta.json`) → `ders1.lesson.json`; bu dosya ve `timing.txt` `ders1_md.py` ve `timing_d1.py` ile aynı veriden üretilir. Planlayıcı pilotun `timing.py`sidir (birebir kopya, değiştirilmedi); Ders 2'ye özgü birkaç sabiti yalnız çalışma anında Ders 1 verisine göre ayarlanır (`timing.txt` başındaki "YAMA" satırları).

**Durum, açıkça.** Bu, Ders 1'in ilk yayın metnidir (3 · 5 · 15 dk ve 30 dk iskeleti). Hiçbir cümle seslendirilmedi: ElevenLabs bağlantısı bu oturumda yoktu, ücretli çağrı yapılmadı. Metin PLAN.v3 §E.1'in model ilk denetiminden (makineyle denetlenen kurallar) ve karar 2 yedeği olan **iki bağımsız model incelemesinden** (Türkçe editör ve usta hoca mercekleri) geçti; bulgular işlendi (`b/INCELEME.md`). Sahibin kulağı ve Scribe geri çevirisi bekleniyor. Ders 1 klinik psikolog incelemesi gerektiren derslerden değildir (yalnız Ders 4 ve 7). Bütün süreler hece modelinden tahmindir (VARSAYIM); ses üretilince ölçülen sürelerle yeniden kurulur. Bu yüzden ders "bitti" sayılmaz.

## 0. Tek bakışta

| | |
|---|---|
| Söz (kart) | Nefesini yavaşlatmayı ve verişini uzatmayı adım adım öğreniyorsun. |
| Kartın kanıt satırı (5 ve 15 dk) | "Neye dayanıyor: yavaş nefesle ilgili 223 çalışmayı birleştiren bir incelemede kalp atışı değişkenliği seans sırasında ve hemen sonrasında arttı; kısa alış ve uzun verişle yapılan nefes, uzun alış ve kısa verişe göre daha çok gevşeme bildirimiyle ilişkiliydi. Bu ders bir sonuç vaadi taşımaz." |
| 3 dk kartı (PLAN.v3 §A.2 kural 12) | "Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma bulamadık. Bir çalışmada meditasyon uygulamasını kullananların çoğu günde beş dakikanın altında kaldı; bu sürüm o gerçek kullanım için var." |
| Süreler ve varsayılan | 3 · 5 · 15 dk; varsayılan 5 dk (PLAN.v3 §A.1). 30 dk ve kaydırıcı ikinci aşamada; 30 dk iskeleti `iskelet30.md` |
| Duruş | yalnız oturarak (sandalye ya da yer); ayakta ve uzanarak hiçbir şey yok |
| Açılış ekranı (`openingScreen`, `openingNotice`) | "İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin." · "Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle." · "Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön." |
| Hazırlık kartı | Sırtını dik tutabileceğin bir sandalye ya da minder · 15 dakikalık sürümde vızıltılı nefes var; sesinin kimseyi rahatsız etmeyeceği bir yer seçmek iyi olur |
| İlk yoga dersiyse | ayrı giriş dosyası: "Bugün yalnızca tanışıyoruz; zorlanırsan ekrandaki "Kapanışa geç" düğmesine dokunman yeterli." (PLAN.v3 §D.3; planın dışında, ≈ 7 sn) |
| Derse özgü açılış (her sürümde aynı) | "Bütün gün seninle olan nefesine şimdi kulak veriyorsun." |
| Ortak çıkış cümlesi | "İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin." |
| Anahtar cümle, giderek kısa | 1) "Alış kendiliğinden gelir; verişi sen uzatırsın." (17 hece; her sürümde, C1 sonu) · 2) "Alış gelir, veriş uzar." (8; C2 varken) · 3) "Veriş uzar." (4; C3 varken) |
| İmge yayı (işitsel, seçim gerekmez) | kendi nefesinin sesi (C1, C2) → vızıltının dudakta, yüzde, göğüste titreşimi (C3) → sesin ardından kalan sessizlik (C3 sonu; 30 dk'da C5) |
| Nefes kalıpları | C1 4 al / 6 ver (10,000 sn), tutma yok · C2 iç çekiş 2,5 + 1,5 al / 6 ver (10,000 sn) · C3 vızıltılı nefes 4 al / 9 vızıltılı ver (13,000 sn; Trivedi 2023: 12–14 sn) |
| Nefes güvenliği (seste) | "Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön." (her sürümde) · "Alışlar zorlamadan olsun; başın dönerse doğal nefesine dön." (C2) · "Arada nefesi tutmak yok." (3 dk: "nefesi tutmak yok") · "Altı uzun gelirse beş de olur." · "Ses çıkarmak istemezsen vızıltıyı içinden duyman da olur." |
| Kapanış (gündüz, oturarak) | dönüş → nefes → parmaklar ve gerinme ("ağrı ya da baş dönmesi olursa bırak") → gözler ve oda → son cümle "Buradasın; nefesin de hep seninle." |
| Müzik | Re: nefes bloklarında tanpura benzeri bordun (uygulama hattı, döngü nefes döngüsüne eşit); Varış ve Kapanış'ta aynı tonda pad (müzik A, ElevenLabs Music); doğa kapalı; 3 dk'da iki doku geçişi |
| Görsel | genişleyen halka (adaçayı yeşili `#8CCB9E`); yalnız söylenen "Al…"/"ver…" ipuçlarına ve sessiz döngü cümlesine kilitli; şafak 60–90 sn (3 dk'da 45) |
| Zamanlama (`timing.txt`) | 3 köşe × 13 dakika (3, 4, 5–15): **39/39 vaka geçti**; yayın süreleri 3 dk GEÇTİ, 5 dk GEÇTİ, 15 dk GEÇTİ (üç köşede). Köşeler VARSAYIM: Nefona Hoca 4,68 hece/sn (yüksek ve düşük duraklama), Neslihan ölçülmüş süreleri |
| Metin envanteri | 129 klip kimliği (50 cümle birimi, 79 mikro ipucu) + 3 ayrı 3 dk kısa biçimi; TTS'e 64 istek (50 cümle birimi + 3 kısa biçim + 11 taşıyıcı), 3256 karakter; cümle birimleri 946 hece, 387 sözcük; mikro ipuçları 114 hece. Ortak yardımcı klipler (Durdur dönüşü, ilk ders girişi) ayrıca 4 istek, 224 karakter |
| 3 dk | A → C1 → K |
| 5 dk | A → C1 → K |
| 15 dk | A → C1 → C2 → C3 → K |

## 1. Hocanın kurgusu

### 1.1 Akış, evreler; ses, müzik ve görüntü

Ders bir nefes dersidir; imge yoktur, dinleyicinin işi kendi nefesini duymak ve verişi uzatmayı öğrenmektir. Önce nefes değiştirilmeden izlenir (güvenlik §11.B-6; Toussaint 2021: "derin nefes" talimatı önce uyarılmayı artırdı), sonra ritim sayılarak öğretilir, sonra ses çekilir ve ritim dinleyiciye bırakılır. Evre geçişleri ses, müzik ve görüntüde aynı klipte olur.

| Evre | Bloklar | Ses | Müzik (konuşmada kısık) | Görsel (genişleyen halka) |
|---|---|---|---|---|
| Varış | A | 0 dB; cümle arası 0,6–1 sn | pad (Re), ≈ −33 LUFS; ders 3 sn'de açılır | en aydınlık (yine koyu), halka nefes almaz |
| Derinleşme | C1, C2, C3'ün öğretimi ve vızıltı turları | −1,5 dB; cümleler kısalır | `c1.izle`'de ≥ 8 sn çapraz geçişle bordun (Re + La), döngü 10,000 sn; `c3.ad`'da 13,000 sn | daha loş; halka yalnız "Al…" (büyür) ve "ver…" (küçülür) ipuçlarında, sessiz döngü cümlesinde `cue.breath.count` kadar sessizce sürer |
| Derin | C3 sonu (`c3.sessizlik`, `c3.dogal`, `c3.anahtar3`) | −3 dB; en kısa cümleler | bordun kısılır | en loş |
| Kapanış | K | ≥ 4 sn'lik sessizlikte rampa, 0 dB | `k.donus`'ta bordun çekilir, pad girer; 2 sn önce dönüş tınısı; son 5 sn söner | şafak: max(`k.donus`, son − 90 sn)'den sona, ≥ 60 sn (3 dk'da 45) |

### 1.2 Nefes kilidi ve azalan anlatım

Nefes bloklarında zamanlama sessizlikle değil **periyotla** kurulur: her ipucunun `onsetPeriod`'u sabittir (min = pref = max), sessizlik = periyot − gerçek klip süresi. Böylece "Al…" ile bir sonraki "Al…" arası her seste ve her sürede tam 10,000 sn (C3'te 13,000 sn) olur; bordun ve halka buna kilitlenir. Planlayıcı bu klipleri esnetmez; dersin esnemesi nefes serilerinin arasındaki cümlelerden gelir. Kilit `timing_d1.py`'de her planda ±0,02 sn ile denetlenir (D1-kilit, D1-döngü).

Anlatım dört basamakta azalır (PLAN.v2 §C.2, Knowlton & Larkin 2006):
1. **Sayılı döngü** (`c1.s1`, 5 dk'dan `c1.s2`): "Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…", öğeler 1,0 sn arayla.
2. **İpuçlu döngü**: "Al…" alışın başında, "ver…" verişin başında. Bazı döngülerde "ver…"den 1,2 sn sonra verişin içinde biten kısa bir cümle gelir ("Altı uzun gelirse beş de olur.", "Omuzların aşağı insin.").
3. **Yalnız "Al…"** (15 dk'da C1 ve C2'nin son döngüleri, C3'ün ikinci turu): veriş halkada ve bordunda sürer.
4. **Sessiz döngü**: "Sıradaki nefes sende; ben susuyorum." (her sürümde) ve 15 dk'da "Bu nefes de sende."; ardından ≈ 11–13 sn hiçbir söz yok, sonra ses bir sonraki alışın başında döner. ≤ 15 dk'da hiçbir sessizlik 20 sn'yi aşmaz; duyurulu pencere yoktur (pencereler 30 dk'nın C5'inde).

### 1.3 Anahtar cümle (PLAN.v2 §A.2.1, §C.4)

Dersin fikri: alış kendiliğinden gelir, verişi kişi uzatır. Üç geçiş giderek kısalır (17 → 8 → 4 hece) ve her biri bir nefes bloğunun sonundadır; 3 ve 5 dk'da bir kez (PLAN.v3 §A.2 kural 5), 15 dk'da üç kez söylenir. PLAN.v2'deki üçüncü biçimin üç noktası ("Veriş uzar…") PLAN.v2 §C.2 gereği atıldı (üç nokta yalnız listelerde).

### 1.4 İmge yayı: işitsel

Görsel imge yoktur, bu yüzden seçim de gerekmez (güvenlik §11.B-10 burada uygulanmaz). Yay: kendi nefesinin sesi ("Burnundan giren ve çıkan havanın hafif bir sesi var.", "Verişin sesi alışınkinden uzun.", iç çekişte "Uzun, yumuşak bir ses çıkıyor.") → vızıltının titreşimi ("Titreşimi dudaklarında, burnunda ya da yüzünde fark edebilirsin.", isteğe bağlı el göğüste) → sesin ardından kalan sessizlik ("Ses dindi. Ardından kalan sessizliği de duyuyorsun."; yalnız C3 sonunda: düzeltme turunda C2'deki erken sessizlik cümlesi çıktı). Kapanış yayı odaya açar: "Odadaki sesler de yeniden duyuluyor." Son cümle açılışa döner: "Bütün gün seninle olan nefes" → "Buradasın; nefesin de hep seninle."

### 1.5 Benzersizlik (PLAN.v2 §A.2.1, §E.6 #17)

| Öğe | Ders 1 | Yakınlık denetimi |
|---|---|---|
| Açılış | "Bütün gün seninle olan nefesine şimdi kulak veriyorsun." | PLAN.v2 yönündeki "…şimdi yalnızca dinleyebilirsin" "-(y)abil-"siz yazıldı; öteki dokuz dersin açılışıyla örtüşmez |
| Anahtar cümle | alış/veriş cümleleri | "Fark ettiğin an, zaten geri döndün." (Ders 5) kullanılmadı; normalleştirme "Sayıyı kaçırırsan yeniden başlamak yeter." ile |
| İmge | işitsel yay | Ders 2'nin rüzgâr/yaprak, Ders 9'un okyanus dokusu yok; doğa kapalı |
| Görsel | genişleyen halka | tek kilitli form; öteki derslerin biçimleriyle çakışmaz |
| Müzik | Re bordun + pad | Ders 8'in "Re'de açık beşli bordun + alçak ahşap üflemeli" imzasıyla aynı ton ve bordun ailesi: **yakınlık, kayda alındı** (§7) |
| Nefes modülünden farkı | dört teknikten üçü ≤ 15 dk'da (4/6, iç çekiş, vızıltı), sesli hoca, varış ve kapanış | Nefes modülü tek kalıbı sayaç ve görselle çalıştırır (PLAN.v2 Ders 1 kartı) |

### 1.6 Dikkat eğrisi (15 dk, hoc köşesi; doku ya da teknik değişim anları)

0:04 varış · 1:26 doğal nefes · 2:45 sayılı 4/6 · 3:05 ipuçlu 4/6 · 4:01 ilk sessiz döngü · 5:05 yalnız "Al…" · 6:16 iç çekiş: öğretim · 6:51 iç çekiş döngüleri · 7:41 doğal nefes arası · 8:02 iç çekiş, ikinci tur · 9:01 vızıltılı nefes: öğretim · 9:47 vızıltı, birinci tur · 10:46 titreşim · 11:12 vızıltı, ikinci tur (yalnız "Al…") · 12:30 sesin ardından sessizlik (Derin) · 13:14 kapanış

En uzun tek doku koşusu: "K/cümle" 106 sn (pilot sınırı 300 sn). 30 dk'nın değişim anları `iskelet30.md`'de.

### 1.7 Neden böyle: kanıt ve güvenlik (yalnız doğrulanmış dosyalardan; "çalışmada görüldü" dili)

- **Yavaş nefes:** 223 çalışmalık sistematik derleme ve meta-analizde vagal aracılı kalp atışı değişkenliği seans sırasında, tek seanstan hemen sonra ve çok seanslı programdan sonra arttı (Laborde 2022, PMID 35623448, DOI [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711); tempo özette verilmiyor). Dakikada 6 kez okunan ritmik dualarda ve mantralarda kardiyovasküler ritimler eşzamanlı güçlendi (Bernardi 2001, PMID 11751348, DOI [10.1136/bmj.323.7327.1446](https://doi.org/10.1136/bmj.323.7327.1446)). 4 al / 6 ver = dakikada 6 soluk.
- **Uzun veriş:** kısa alış / uzun veriş (oran 0,42), uzun alış / kısa verişe (2,33) göre daha çok gevşeme bildirimiyle ilişkiliydi; yüksek frekanslı KAD artışı yalnız yavaş + uzun verişte görüldü (Van Diest 2014, n=30, PMID 25156003, DOI [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x)).
- **İç çekiş:** günde 5 dk, 1 ay; döngüsel iç çekmede olumlu duygulanımda ve uyku sırasındaki solunum hızında meditasyondan fazla değişim görüldü; olumsuz duygulanım ve durumluk kaygıda gruplar arası fark yoktu; keşif amaçlı, çoğu üniversite öğrencisi (Balban 2023, n=108, PMID 36630953, DOI [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895); tam metin). Tekniğin tarifi (burundan iki alış, ikincisi kısa; ağızdan uzun veriş) aynı çalışmadan. Alış süreleri (2,5 + 1,5 sn) VARSAYIM.
- **Vızıltılı nefes:** 8–14 sn döngülerde en yüksek KAD 12–14 sn döngüde görüldü (Trivedi 2023, kişi-içi çapraz, n=118, PMID 38204770, DOI [10.4103/ijoy.ijoy_113_23](https://doi.org/10.4103/ijoy.ijoy_113_23)) → 13 sn. Bir EEG çalışmasında vızıltılı nefes "uyanıklık" yönünde değişim gösterdi (dossier-sakin §4.4, PMID 42521250; bu PMID ikinci turda yeniden doğrulanmadı): bu yüzden vızıltı gündüz dersinde, uyku dersinde değil.
- **Hızlı nefes ve tutma yok:** hiperventilasyon jeneralize epilepside hastaların %50'sine kadarında klinik nöbet tetikleyebilir (Rana 2023, PMID 37813123, DOI [10.1055/s-0043-1774808](https://doi.org/10.1055/s-0043-1774808)); HV sonrası tutma oksijen düşüşünü derinleştirdi (Pernett 2023, PMID 37060440). Ders 1'de tutma hiç yok; nadi şodana da 30 dk iskeletinde tutmasız.
- **Varış ve dönüş:** travma-duyarlı yoga nidranın bileşenlerinden "uygun uzunluk ve hazırlık" ile "yeterli yerleşme ve dışa dönüş" (Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021); kavramsal); uyandırma başarısızlığı istenmeyen etkilerde önemli bir etken sayıldı (Howard 2017, PMID 28300508, DOI [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)).
- **Hareket:** zorlu nefes yoganın yan etki vaka raporlarında en sık anılanlardandı (Cramer 2013, PMID 24146758, DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515)) → her harekette "ağrı ya da baş dönmesi olursa bırak".
- **3 dk:** 3 dakikalık bir oturumun etkisini sınayan çalışma dosyalarda yok; kısa farkındalık eğitimlerinde olumsuz duygulanımdaki etki yayın yanlılığı düzeltilince g = 0,04'e indi (Schumer 2018, PMID 29939051, DOI [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). Gerçek kullanımda meditasyona özgü kullanım günde ortalama 3,36 dk, kullanıcıların %69,7'si günde 5 dk'nın altında (Radin 2025, PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435); tam metin). 3 dk kartı yalnız bunu söyler.

## 2. Süre modeli, planlayıcı ve sonuç

Model pilotunkidir: alt klip süresi = hece / eklemleme hızı + TTS-içi duraklamalar + uç payı (0,31 sn; mikro 0,15 sn). **Ders 1 için ölçülmüş süre yok.** Köşeler (hepsi VARSAYIM):

- `hoc`: 4.68 hece/sn, hi duraklama, süre × 1.000. Nefona Hoca önizleme eklemleme hızı 4,68 hece/sn (render/sel/hoc; orkestratör verisi) + yüksek (Hakan v2) duraklama profili. VARSAYIM. Denetim: aynı model Ders 2'nin ölçülmüş hoc kliplerinden %3,6 uzun (ölçülen/model 0,965; 110 ortak klip) → muhafazakâr.
- `hoc-lo`: 4.68 hece/sn, lo duraklama, süre × 1.000. aynı hız, düşük duraklama profili. VARSAYIM. Ders 2'nin ölçülmüş hoc kliplerine en yakın model (ölçülen/model 0,990, 110 ortak klip).
- `nes`: 5.60 hece/sn, hi duraklama, süre × 1.109. Neslihan'ın Ders 2'de ölçülmüş süreleri: ölçülen/model(5,6 yüksek) = 1,109 (110 ortak klip; v3/calc/measure.py). VARSAYIM: Ders 1 metnine aynı oranla taşındı.

Denetimler: pilot `check_plan` (toplam ±1 sn; kapaklar eksiksiz; sessizlik sınırları; son 60 sn; P1 bloklar; anahtar cümle sırası, kısalması ve aralığı; kapanış ritüeli; blokta ≥ 5 sn ve planda ≥ 8 sn sessizlik; dolgu sözcükleri; klip ≤ 15 sn; 60 sn'de ≤ 150 hece ve ≤ %60 konuşma; Derin evre sınırları; duyurusuz sessiz 60 sn yok; ortalama hece/dk bandı; 10 dk ve üstünde doku koşusu ≤ 300 sn; T1 nefes beklemesi; "-(y)abil-" ≤ 3 / 60 sn; art arda ≤ 3 "-abilir"; şafak; blok tabanları; H12; L3-03) + Ders 1 ekleri (D1-kilit, D1-döngü, D1-sessizlik ≤ 20 sn, D1-normal, D1-güvenlik, D1-nefes-payı, 3 dk'nın PLAN.v3 §A.2 kuralları, üretim köşesinde boş pay) + önek kuralı (3 ⊆ 5; 5 → 15 her dakika) + T5.

| Köşe | 3 dk | 5 dk | 15 dk | 3–15 dk (13 dakika) | Boş pay 3 / 5 dk (min sessizlik) |
|---|---|---|---|---|---|
| hoc | GEÇTİ | GEÇTİ | GEÇTİ | 13/13 geçti | 10.1 / 23.1 sn |
| hoc-lo | GEÇTİ | GEÇTİ | GEÇTİ | 13/13 geçti | 13.2 / 26.8 sn |
| nes | GEÇTİ | GEÇTİ | GEÇTİ | 13/13 geçti | 13.0 / 28.0 sn |

Boş pay tabanı (VARSAYIM): 3 dk'da 10 sn (sure.md §8 önerisi), 5 dk'da 15 sn (pilot T6); yalnız üretim sesinde (hoc, hoc-lo) denetlenir, `nes` bilgi içindir (pilot T6 kalıbı). **3 dk'nın hoc köşesindeki boş payı tabana çok yakındır** (§7).

**Blok süreleri (sn; Giriş Varış'a dahil) ve çapalar:**

| Sürüm | Çapa (PLAN.v3 §A.2; PLAN.v2 §B.4) | hoc | hoc-lo | nes |
|---|---|---|---|---|
| 3 dk | A 0:34 · C1 1:38 · K 0:48 | A 0:36 · C1 1:36 · K 0:48 | A 0:36 · C1 1:35 · K 0:48 | A 0:36 · C1 1:36 · K 0:48 |
| 5 dk | A 0:45 · C1 3:00 · K 1:15 | A 0:48 · C1 3:00 · K 1:12 | A 0:48 · C1 3:00 · K 1:12 | A 0:48 · C1 3:00 · K 1:12 |
| 15 dk | A 1:15 · C1 4:30 · C2 3:00 · C3 4:30 · K 1:45 | A 1:26 · C1 4:51 · C2 2:45 · C3 4:13 · K 1:46 | A 1:26 · C1 4:50 · C2 2:44 · C3 4:13 · K 1:46 | A 1:25 · C1 4:51 · C2 2:45 · C3 4:13 · K 1:46 |

Blokların girdiği dakika (üç köşede aynı): C1 3 dk, C2 8 dk, C3 12 dk. PLAN.v2 §B.4'ün 10 dk çapası C2'yi 10 dk'da tam ister; planlayıcıda C2 8. dakikada, C3 12. dakikada girer (önek kuralı büyük bir bloğun tabanını ancak esneme payı yettiğinde alır). 15 dk'da C1 çapadan uzun, C3 çapadan kısadır (§7).

## 3. Metin

Sütunlar: kimlik · kat (Z zorunlu, İ isteğe bağlı + sıra, G genişletme + sıra) · metin · sonraki sessizlik min / pref / max sn (nefes kilitli kliplerde "periyot" = başlangıçtan başlangıca) · not. "3 dk:" satırı aynı kimliğin 3 dk'daki kısa biçimidir (`short`, belowSec 240). `minTarget 240` olan klip 3 dk'da çalmaz. Çok cümleli birim tek TTS isteğidir, cümle sonlarından kesilir; araya uygulamanın cümle arası sessizliği girer (Varış 0,6–1,0; Derinleşme 0,8–1,3; Derin 1,2–2,5; Kapanış 0,8–1,2 sn).

### A · Varış (tek kapak; isteğe bağlılar süreyle eklenir)

Öncelik sabit, çalma sırası 0. Tahmini süre (hoc): en kısa 39 sn, 3/5/15 dk planında 32.3 / 43.9 / 81.4 sn, en uzun 111 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| a.durus | Z | Bir sandalyede ya da yerde, sırtını germeden dik tutarak oturman yeterli. | 2,5 / 4 / 8 |  |
| ↳ 3 dk | | Sırtını germeden dik oturman yeterli; gözlerini kapatmak ya da açık tutmak sana kalmış. | 2,5 / 3 / 4 | 3 dk: duruş ve gözler tek klipte (PLAN.v3 §A.2, sure.md §3.1) |
| a.eller | İ 260 | Ellerin dizlerinde ya da kucağında dinleniyor. | 3 / 4 / 8 |  |
| a.gozler | Z | Gözlerini kapatmak ya da açık tutmak sana kalmış; gözlerin açıksa bakışın yere insin. | 4 / 4 / 8 | 3 dk'da yok |
| a.izin | Z | İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin. | 3 / 4 / 8 | "-(y)abil-" ×3 |
| a.acilis | Z | Bütün gün seninle olan nefesine şimdi kulak veriyorsun. | 5 / 6 / 10 | derse özgü açılış |
| a.omuz | İ 250 | Omuzların gevşek dursun, çenen rahat kalsın. | 4 / 5 / 9 |  |
| a.kolay | İ 270 | Nefesine dikkat etmek ilk başta tuhaf gelirse bu da olur. | 4 / 5 / 9 | başarısızlığı olağan sayar |
| a.karar | İ 355 | Verişini ne kadar uzatacağına her an sen karar veriyorsun. | 4 / 5 / 9 |  |

### C1 · Doğal nefes → uzun veriş (4 al / 6 ver, tutma yok)

Öncelik P1, çalma sırası 1. Tahmini süre (hoc): en kısa 95 sn, 3/5/15 dk planında 95.7 / 180.4 / 290.7 sn, en uzun 317 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| c1.izle | Z | Birkaç nefes boyunca hiçbir şeyi değiştirmeden izlemen yeterli. | 13 / 16 / 20 |  |
| ↳ 3 dk | | Birkaç nefes boyunca hiçbir şeyi değiştirmeden izlemen yeterli. | 12 / 13 / 16 | 3 dk: aynı metin, nefes payı 12–16 sn |
| c1.ses | İ 120 | Burnundan giren ve çıkan havanın hafif bir sesi var. | 5 / 8 / 12 | imge yayı 1 |
| c1.uzunluk | İ 140 | Alış mı daha uzun, veriş mi? Fark etmen yeter; bir şey yapman gerekmiyor. | 7 / 10 / 14 |  |
| c1.guven | Z | Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön. | 2,5 / 3 / 7 | güvenlik (emir kipi) |
| c1.burun | İ 170 | Burnun açıksa alış da veriş de burnundan olsun. | 2,5 / 3 / 7 |  |
| c1.ritim | Z | Sıradaki nefeslerde alış dört sayı, veriş altı sayı sürecek. Arada nefesi tutmak yok. | 2,5 / 4 / 8 | açıklama (blokta tek) |
| ↳ 3 dk | | Alış dört, veriş altı sayı sürecek; nefesi tutmak yok. | 2,5 / 3 / 5 | 3 dk: aynı yönerge tek cümlede |
| c1.s1 | Z | Al… · iki… · üç… · dört… · ver… · iki… · üç… · dört… · beş… · altı… | periyot 1 × 10 | taşıyıcı car.say1 |
| c1.s2 | İ 110 | Al… · iki… · üç… · dört… · ver… · iki… · üç… · dört… · beş… · altı… | periyot 1 × 10 | taşıyıcı car.say2 |
| c1.d1 | İ 101 | Al… · ver… | periyot 4 + 6 | taşıyıcı car.c1a |
| c1.d2 | Z | Al… · ver… · Altı uzun gelirse beş de olur. | periyot 4 + 1,2 + 4,8 | taşıyıcı car.c1a; başarısızlığı olağan sayar |
| c1.d3 | Z | Al… · ver… · Sayıyı kaçırırsan yeniden başlamak yeter. | periyot 4 + 1,2 + 4,8 | taşıyıcı car.c1a; başarısızlığı olağan sayar |
| c1.d4 | İ 150 | Al… · ver… · Omuzların aşağı insin. | periyot 4 + 1,2 + 4,8 | taşıyıcı car.c1a |
| c1.d5 | İ 160 | Al… · ver… | periyot 4 + 6 | taşıyıcı car.c1b |
| c1.d6 | Z | Al… · ver… · Sıradaki nefes sende; ben susuyorum. | periyot 4 + 1,2 + 14,8 | taşıyıcı car.c1b; sessiz döngü |
| c1.d7 | İ 190 | Al… · ver… | periyot 4 + 6 | taşıyıcı car.c1b |
| c1.d8 | İ 200 | Al… · ver… · Yüzün ve çenen de gevşek kalsın. | periyot 4 + 1,2 + 4,8 | taşıyıcı car.c1b |
| c1.d9 | İ 210 | Al… · ver… · Verişin sesi alışınkinden uzun. | periyot 4 + 1,2 + 4,8 | taşıyıcı car.c1c; imge yayı 1 |
| c1.d10 | İ 375 | Al… · ver… · Bu nefes de sende. | periyot 4 + 1,2 + 14,8 | taşıyıcı car.c1c; sessiz döngü |
| c1.d11 | İ 380 | Al… | periyot 10 | taşıyıcı car.c1c |
| c1.d12 | İ 285 | Al… | periyot 10 | taşıyıcı car.c1c |
| c1.d13 | İ 290 | Al… | periyot 10 | taşıyıcı car.c1c |
| c1.d14 | İ 385 | Al… | periyot 10 | taşıyıcı car.c1c |
| c1.d15 | G 450 | Al… | periyot 10 | taşıyıcı car.c1c |
| c1.d16 | G 455 | Al… | periyot 10 | taşıyıcı car.c1d |
| c1.anahtar1 | Z | Alış kendiliğinden gelir; verişi sen uzatırsın. | 4 / 6 / 10 | anahtar 1 |

### C2 · İç çekiş: iki alış + ağızdan uzun veriş

Öncelik P2, çalma sırası 2. Blok giriş sırası (entryRank) 295. Tahmini süre (hoc): en kısa 69 sn, 3/5/15 dk planında 0 / 0 / 165 sn, en uzun 188 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| c2.ad | Z | Sırada iç çekiş var. | 3 / 4 / 8 | açıklama (blokta tek) |
| c2.nasil | Z | Burnundan bir nefes alıyorsun, ardından üstüne küçük bir alış daha ekliyorsun. Sonra nefesi ağzından, uzun ve yumuşak bir verişle bırakıyorsun. | 5 / 6 / 10 |  |
| c2.guven | Z | Alışlar zorlamadan olsun; başın dönerse doğal nefesine dön. | 3 / 4 / 8 | güvenlik (emir kipi) |
| c2.d1 | Z | Al… · biraz daha… · ağzından ver… | periyot 2,5 + 1,5 + 6 | taşıyıcı car.c2a |
| c2.d2 | İ 302 | Al… · biraz daha… · ver… | periyot 2,5 + 1,5 + 6 | taşıyıcı car.c2a |
| c2.d3 | İ 305 | Al… · biraz daha… · ver… · Uzun, yumuşak bir ses çıkıyor. | periyot 2,5 + 1,5 + 1,2 + 4,8 | taşıyıcı car.c2a; imge yayı 1 |
| c2.d4 | İ 306 | Al… · biraz daha… · ver… | periyot 2,5 + 1,5 + 6 | taşıyıcı car.c2b |
| c2.d5 | İ 315 | Al… · biraz daha… · ver… | periyot 2,5 + 1,5 + 6 | taşıyıcı car.c2b |
| c2.dogal | Z | İç çekişi bırakıyorsun; birkaç nefes boyunca her şey kendi hâlinde. | 12 / 14 / 18 |  |
| c2.tur2 | İ 340 | Bir tur daha iç çekişle devam etmek sana kalmış. | 2 / 3 / 7 |  |
| c2.d6 | İ 340 | Al… · biraz daha… · ver… | periyot 2,5 + 1,5 + 6 | taşıyıcı car.c2b |
| c2.d7 | İ 340 | Al… | periyot 10 | taşıyıcı car.c2c |
| c2.d8 | İ 370 | Al… | periyot 10 | taşıyıcı car.c2c |
| c2.d9 | İ 390 | Al… | periyot 10 | taşıyıcı car.c2c |
| c2.anahtar2 | Z | Alış gelir, veriş uzar. | 8 / 10 / 14 | anahtar 2 |

### C3 · Vızıltılı nefes (bramari): ağız kapalı, döngü 13 sn, parmaklar yüze değmez

Öncelik P3, çalma sırası 4. Blok giriş sırası (entryRank) 400. Tahmini süre (hoc): en kısa 90 sn, 3/5/15 dk planında 0 / 0 / 252.9 sn, en uzun 294 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| c3.ad | Z | Sıradaki nefesin adı bramari, yani vızıltılı nefes. | 5 / 6 / 10 | açıklama (blokta tek) |
| c3.nasil | Z | Verişte dudakların kapalı kalıyor ve arı vızıltısına benzer alçak bir ses çıkıyor. | 5 / 6 / 10 |  |
| c3.eller | Z | Parmaklarınla kulaklarını ya da yüzünü kapatman gerekmiyor. | 4,5 / 5,5 / 9,5 |  |
| c3.sessiz | Z | Ses çıkarmak istemezsen vızıltıyı içinden duyman da olur. | 5 / 6 / 10 |  |
| c3.d1 | Z | Al… · vızıltıyla ver… | periyot 4 + 9 | taşıyıcı car.c3a |
| c3.d2 | Z | Al… · vızıltıyla ver… | periyot 4 + 9 | taşıyıcı car.c3a |
| c3.agiz | İ 401 | Dişlerin birbirine değmesin; dilin ağzında rahat dursun. | 4 / 5 / 9 |  |
| c3.kisa | İ 401 | Vızıltı erken biterse bir sonraki alışı beklemen yeterli. | 3 / 4 / 8 | başarısızlığı olağan sayar |
| c3.d3 | İ 400,5 | Al… · ver… | periyot 4 + 9 | taşıyıcı car.c3a |
| c3.titresim | İ 402 | Titreşimi dudaklarında, burnunda ya da yüzünde fark edebilirsin. | 8 / 10 / 14 | imge yayı 2; "-(y)abil-" ×1 |
| c3.el | İ 405 | Bir elini göğsüne koyup titreşimi avucunda da hissedebilirsin. | 4 / 5 / 9 | imge yayı 2; "-(y)abil-" ×1 |
| c3.d4 | İ 403 | Al… | periyot 13 | taşıyıcı car.c3a |
| c3.d5 | İ 404 | Al… | periyot 13 | taşıyıcı car.c3a |
| c3.d6 | İ 410 | Al… | periyot 13 | taşıyıcı car.c3a |
| c3.d7 | İ 420 | Al… | periyot 13 | taşıyıcı car.c3b |
| c3.d8 | G 465 | Al… | periyot 13 | taşıyıcı car.c3b |
| c3.d9 | G 470 | Al… | periyot 13 | taşıyıcı car.c3b |
| c3.sessizlik | Z | Ses dindi. Ardından kalan sessizliği de duyuyorsun. | 12 / 15 / 19 | imge yayı 3 |
| c3.dogal | İ 415 | Nefes yeniden kendi hâlinde; bir şey yapman gerekmiyor. | 8 / 10 / 14 |  |
| c3.anahtar3 | Z | Veriş uzar. | 5 / 6 / 10 | anahtar 3 |

### K · Kapanış: dışa dönüş (gündüz, oturarak)

Öncelik sabit, çalma sırası 99. Tahmini süre (hoc): en kısa 50 sn, 3/5/15 dk planında 47.9 / 71.7 / 105.9 sn, en uzun 143 sn.

| Kimlik | Kat | Metin | Sonra (sn) | Not |
|---|---|---|---|---|
| k.donus | Z | Artık dönüş zamanı. | 3,5 / 3,5 / 7,5 |  |
| k.nefes | Z | Nefesin kendi ritmini buluyor. | 4 / 4 / 8 | adım: nefes |
| k.say | İ 292 | Saymadan, kendi hızında birkaç soluk alıp veriyorsun. | 10 / 10 / 14 | adım: nefes |
| k.sesler | İ 102 | Odadaki sesler de yeniden duyuluyor. | 5 / 5 / 9 | imge yayı dönüş; adım: sesler |
| k.hareket | Z | Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak. | 7 / 7 / 11 | güvenlik (emir kipi); adım: parmak+gerin; "-(y)abil-" ×1 |
| k.goz | Z | Gözlerin kapalıysa ışığa alıştıra alıştıra açıp çevrende birkaç şeye bakmak yeter. | 7 / 7 / 11 | adım: goz+oda |
| ↳ 3 dk | | Gözlerin kapalıysa açıp çevrene bakmak yeter. | 7 / 7 / 10 | 3 dk: Kapanış 0:48 içinde kalmak için kısa biçim |
| k.oda | İ 108 | Bir renge ya da ışığın düştüğü bir yere biraz daha uzun bakabilirsin. | 6 / 6 / 10 | adım: oda; "-(y)abil-" ×1 |
| k.zaman | İ 262 | Günün hangi saatinde ve nerede olduğunu hatırlıyorsun. | 4,5 / 4,5 / 8,5 | adım: oda |
| k.gun | İ 365 | Bu ritmi gün içinde, kısa bir molada yeniden bulabilirsin. | 4 / 4 / 8 | "-(y)abil-" ×1 |
| k.son | Z | Buradasın; nefesin de hep seninle. | 6 / 6 / 10 | adım: son |

### Taşıyıcılar (mikro ipuçları tek istekte üretilir, üç nokta duraklarından kesilir)

| Taşıyıcı | TTS metni | Öğe | Hece |
|---|---|---|---|
| car.say1 | Al… iki… üç… dört… ver… iki… üç… dört… beş… altı… | 10 | 13 |
| car.say2 | Al… iki… üç… dört… ver… iki… üç… dört… beş… altı… | 10 | 13 |
| car.c1a | Al… ver… al… ver… al… ver… al… ver… | 8 | 8 |
| car.c1b | Al… ver… al… ver… al… ver… al… ver… | 8 | 8 |
| car.c1c | Al… ver… al… ver… al… al… al… al… al… | 9 | 9 |
| car.c1d | Al… | 1 | 1 |
| car.c2a | Al… biraz daha… ağzından ver… al… biraz daha… ver… al… biraz daha… ver… | 9 | 21 |
| car.c2b | Al… biraz daha… ver… al… biraz daha… ver… al… biraz daha… ver… | 9 | 18 |
| car.c2c | Al… al… al… | 3 | 3 |
| car.c3a | Al… vızıltıyla ver… al… vızıltıyla ver… al… ver… al… al… al… | 9 | 17 |
| car.c3b | Al… al… al… | 3 | 3 |

### Ekler: hızlı kapanış, Durdur dönüşü, ilk ders girişi

- **"Kapanışa geç":** PLAN.v3 §D.3: o anki cümle biter; aynı dosyada Kapanış'ın başına, dönüş tınısından önceki sessizliğe 2 sn'lik geçişle atlanır; kapanış kısalmaz. Ders 1'de imge ya da zor blok yok, bu yüzden bırakma ön klibi yok; k.nefes ('Nefesin kendi ritmini buluyor.') nefes kalıbını bırakır. Oturarak derste hızlı kapanış = dosyanın kendi Kapanış'ı (sure.md §3.2 kural 10: ≈ 45–55 sn en kısa sürümde). Aşağıdaki klipler denetim içindir: en kısa Kapanış'ın zorunlu klipleri.
- **Durdur (X) sonrası sesli dönüş** (her derste aynı metin; pilot ders2'den aynen): "Gözlerini aç, etrafına bak, acele etme." · "Uzanıyorsan önce yana dön, sonra otur." · "Birkaç nefes böyle kal; başın dönerse biraz daha bekle."
- **İlk ders girişi** (ayrı dosya): "Bugün yalnızca tanışıyoruz; zorlanırsan ekrandaki "Kapanışa geç" düğmesine dokunman yeterli."

## 4. Sürümler (hoc köşesi: 4,68 hece/sn, yüksek duraklama; `nes` başlangıcı yanında)

Her satır: başlangıç (hoc) · [nes] · blok · metin · ardından sessizlik (hoc). Mikro ipuçları döngü başına tek satırda; sayılı döngüde öğeler 1 sn arayla.

### 4.1 3 dakika · hoc toplam 180.0 sn, konuşma 74.2 sn (%41), sessizlik kipi pref→max f=0.06 · nes konuşma 70.9 sn

```
 0:04.1 [ 0:04.1] A   Sırtını germeden dik oturman yeterli; gözlerini kapatmak ya da açık tutmak sana kalmış. (3 dk kısa biçimi)  [3.1]
 0:14.4 [ 0:14.2] A   İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [4.2]
 0:25.6 [ 0:25.2] A   Bütün gün seninle olan nefesine şimdi kulak veriyorsun.  [6.2]
 0:36.4 [ 0:36.1] C1  Birkaç nefes boyunca hiçbir şeyi değiştirmeden izlemen yeterli. (3 dk kısa biçimi)  [13.2]
 0:54.6 [ 0:54.2] C1  Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön.  [3.2]
 1:03.1 [ 1:02.6] C1  Alış dört, veriş altı sayı sürecek; nefesi tutmak yok. (3 dk kısa biçimi)  [3.1]
 1:11.3 [ 1:10.8] C1  Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…  [0.4]
 1:21.3 [ 1:20.8] C1  Al… ver… Altı uzun gelirse beş de olur.  [2.1]
 1:31.3 [ 1:30.8] C1  Al… ver… Sayıyı kaçırırsan yeniden başlamak yeter.  [1.3]
 1:41.3 [ 1:40.8] C1  Al… ver… Sıradaki nefes sende; ben susuyorum.  [11.1]
 2:01.3 [ 2:00.8] C1  Alış kendiliğinden gelir; verişi sen uzatırsın.  [6.2]
 2:12.1 [ 2:11.7] K   Artık dönüş zamanı.  [3.7]
 2:17.7 [ 2:17.5] K   Nefesin kendi ritmini buluyor.  [4.2]
 2:24.6 [ 2:24.5] K   Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.  [7.2]
 2:39.4 [ 2:39.2] K   Gözlerin kapalıysa açıp çevrene bakmak yeter. (3 dk kısa biçimi)  [7.2]
 2:50.3 [ 2:50.1] K   Buradasın; nefesin de hep seninle.  [6.2]
```

### 4.2 5 dakika · hoc toplam 300.0 sn, konuşma 117.8 sn (%39), sessizlik kipi pref→max f=0.06 · nes konuşma 112.3 sn

```
 0:04.1 [ 0:04.1] A   Bir sandalyede ya da yerde, sırtını germeden dik tutarak oturman yeterli.  [4.3]
 0:14.4 [ 0:14.4] A   Gözlerini kapatmak ya da açık tutmak sana kalmış; gözlerin açıksa bakışın yere insin.  [4.3]
 0:25.9 [ 0:25.8] A   İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [4.3]
 0:37.1 [ 0:36.9] A   Bütün gün seninle olan nefesine şimdi kulak veriyorsun.  [6.3]
 0:47.9 [ 0:47.7] C1  Birkaç nefes boyunca hiçbir şeyi değiştirmeden izlemen yeterli.  [16.3]
 1:09.2 [ 1:08.9] C1  Burnundan giren ve çıkan havanın hafif bir sesi var.  [8.3]
 1:21.4 [ 1:21.1] C1  Alış mı daha uzun, veriş mi? Fark etmen yeter; bir şey yapman gerekmiyor.  [10.3]
 1:39.2 [ 1:39.0] C1  Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön.  [3.3]
 1:47.7 [ 1:47.4] C1  Burnun açıksa alış da veriş de burnundan olsun.  [3.3]
 1:54.6 [ 1:54.5] C1  Sıradaki nefeslerde alış dört sayı, veriş altı sayı sürecek. Arada nefesi tutmak yok.  [4.3]
 2:07.5 [ 2:07.3] C1  Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…  [0.4]
 2:17.5 [ 2:17.3] C1  Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…  [0.4]
 2:27.5 [ 2:27.3] C1  Al… ver…  [5.6]
 2:37.5 [ 2:37.3] C1  Al… ver… Altı uzun gelirse beş de olur.  [2.1]
 2:47.5 [ 2:47.3] C1  Al… ver… Sayıyı kaçırırsan yeniden başlamak yeter.  [1.3]
 2:57.5 [ 2:57.3] C1  Al… ver… Omuzların aşağı insin.  [2.6]
 3:07.5 [ 3:07.3] C1  Al… ver…  [5.6]
 3:17.5 [ 3:17.3] C1  Al… ver… Sıradaki nefes sende; ben susuyorum.  [11.1]
 3:37.5 [ 3:37.3] C1  Alış kendiliğinden gelir; verişi sen uzatırsın.  [6.3]
 3:48.3 [ 3:48.2] K   Artık dönüş zamanı.  [3.8]
 3:53.9 [ 3:53.9] K   Nefesin kendi ritmini buluyor.  [4.3]
 4:00.8 [ 4:01.0] K   Odadaki sesler de yeniden duyuluyor.  [5.3]
 4:09.4 [ 4:09.6] K   Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.  [7.3]
 4:24.2 [ 4:24.3] K   Gözlerin kapalıysa ışığa alıştıra alıştıra açıp çevrende birkaç şeye bakmak yeter.  [7.3]
 4:38.4 [ 4:38.3] K   Bir renge ya da ışığın düştüğü bir yere biraz daha uzun bakabilirsin.  [6.3]
 4:50.3 [ 4:50.1] K   Buradasın; nefesin de hep seninle.  [6.3]
```

### 4.3 15 dakika · hoc toplam 900.0 sn, konuşma 266.0 sn (%30), sessizlik kipi pref→max f=0.07 · nes konuşma 253.8 sn

```
 0:04.1 [ 0:04.1] A   Bir sandalyede ya da yerde, sırtını germeden dik tutarak oturman yeterli.  [4.3]
 0:14.4 [ 0:14.4] A   Ellerin dizlerinde ya da kucağında dinleniyor.  [4.3]
 0:22.6 [ 0:22.7] A   Gözlerini kapatmak ya da açık tutmak sana kalmış; gözlerin açıksa bakışın yere insin.  [4.3]
 0:34.3 [ 0:34.2] A   İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin.  [4.3]
 0:45.4 [ 0:45.2] A   Bütün gün seninle olan nefesine şimdi kulak veriyorsun.  [6.3]
 0:56.3 [ 0:56.1] A   Omuzların gevşek dursun, çenen rahat kalsın.  [5.3]
 1:05.3 [ 1:05.2] A   Nefesine dikkat etmek ilk başta tuhaf gelirse bu da olur.  [5.3]
 1:15.2 [ 1:15.0] A   Verişini ne kadar uzatacağına her an sen karar veriyorsun.  [5.3]
 1:25.5 [ 1:25.3] C1  Birkaç nefes boyunca hiçbir şeyi değiştirmeden izlemen yeterli.  [16.3]
 1:46.8 [ 1:46.5] C1  Burnundan giren ve çıkan havanın hafif bir sesi var.  [8.3]
 1:59.1 [ 1:58.8] C1  Alış mı daha uzun, veriş mi? Fark etmen yeter; bir şey yapman gerekmiyor.  [10.3]
 2:16.9 [ 2:16.7] C1  Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön.  [3.3]
 2:25.4 [ 2:25.2] C1  Burnun açıksa alış da veriş de burnundan olsun.  [3.3]
 2:32.4 [ 2:32.2] C1  Sıradaki nefeslerde alış dört sayı, veriş altı sayı sürecek. Arada nefesi tutmak yok.  [4.3]
 2:45.4 [ 2:45.1] C1  Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…  [0.4]
 2:55.4 [ 2:55.1] C1  Al… iki… üç… dört… ver… iki… üç… dört… beş… altı…  [0.4]
 3:05.4 [ 3:05.1] C1  Al… ver…  [5.6]
 3:15.4 [ 3:15.1] C1  Al… ver… Altı uzun gelirse beş de olur.  [2.1]
 3:25.4 [ 3:25.1] C1  Al… ver… Sayıyı kaçırırsan yeniden başlamak yeter.  [1.3]
 3:35.4 [ 3:35.1] C1  Al… ver… Omuzların aşağı insin.  [2.6]
 3:45.4 [ 3:45.1] C1  Al… ver…  [5.6]
 3:55.4 [ 3:55.1] C1  Al… ver… Sıradaki nefes sende; ben susuyorum.  [11.1]
 4:15.4 [ 4:15.1] C1  Al… ver…  [5.6]
 4:25.4 [ 4:25.1] C1  Al… ver… Yüzün ve çenen de gevşek kalsın.  [2.4]
 4:35.4 [ 4:35.1] C1  Al… ver… Verişin sesi alışınkinden uzun.  [1.9]
 4:45.4 [ 4:45.1] C1  Al… ver… Bu nefes de sende.  [13.2]
 5:05.4 [ 5:05.1] C1  Al…  [9.6]
 5:15.4 [ 5:15.1] C1  Al…  [9.6]
 5:25.4 [ 5:25.1] C1  Al…  [9.6]
 5:35.4 [ 5:35.1] C1  Al…  [9.6]
 5:45.4 [ 5:45.1] C1  Al…  [9.6]
 5:55.4 [ 5:55.1] C1  Al…  [9.6]
 6:05.4 [ 6:05.1] C1  Alış kendiliğinden gelir; verişi sen uzatırsın.  [6.3]
 6:16.2 [ 6:16.0] C2  Sırada iç çekiş var.  [4.3]
 6:22.3 [ 6:22.3] C2  Burnundan bir nefes alıyorsun, ardından üstüne küçük bir alış daha ekliyorsun. Sonra nefesi ağzından, uzun ve yumuşak bir verişle bırakıyorsun.  [6.3]
 6:41.7 [ 6:41.3] C2  Alışlar zorlamadan olsun; başın dönerse doğal nefesine dön.  [4.3]
 6:51.4 [ 6:51.0] C2  Al… biraz daha… ağzından ver…  [5.0]
 7:01.4 [ 7:01.0] C2  Al… biraz daha… ver…  [5.6]
 7:11.4 [ 7:11.0] C2  Al… biraz daha… ver… Uzun, yumuşak bir ses çıkıyor.  [2.0]
 7:21.4 [ 7:21.0] C2  Al… biraz daha… ver…  [5.6]
 7:31.4 [ 7:31.0] C2  Al… biraz daha… ver…  [5.6]
 7:41.4 [ 7:41.0] C2  İç çekişi bırakıyorsun; birkaç nefes boyunca her şey kendi hâlinde.  [14.3]
 8:01.5 [ 8:01.1] C2  Bir tur daha iç çekişle devam etmek sana kalmış.  [3.3]
 8:08.6 [ 8:08.2] C2  Al… biraz daha… ver…  [5.6]
 8:18.6 [ 8:18.2] C2  Al…  [9.6]
 8:28.6 [ 8:28.2] C2  Al…  [9.6]
 8:38.6 [ 8:38.2] C2  Al…  [9.6]
 8:48.6 [ 8:48.2] C2  Alış gelir, veriş uzar.  [10.3]
 9:01.3 [ 9:01.1] C3  Sıradaki nefesin adı bramari, yani vızıltılı nefes.  [6.3]
 9:12.5 [ 9:12.4] C3  Verişte dudakların kapalı kalıyor ve arı vızıltısına benzer alçak bir ses çıkıyor.  [6.3]
 9:25.5 [ 9:25.2] C3  Parmaklarınla kulaklarını ya da yüzünü kapatman gerekmiyor.  [5.8]
 9:36.3 [ 9:36.0] C3  Ses çıkarmak istemezsen vızıltıyı içinden duyman da olur.  [6.3]
 9:47.2 [ 9:46.8] C3  Al… vızıltıyla ver…  [7.8]
10:00.2 [ 9:59.8] C3  Al… vızıltıyla ver…  [7.8]
10:13.2 [10:12.8] C3  Dişlerin birbirine değmesin; dilin ağzında rahat dursun.  [5.3]
10:23.5 [10:23.2] C3  Vızıltı erken biterse bir sonraki alışı beklemen yeterli.  [4.3]
10:32.6 [10:32.2] C3  Al… ver…  [8.6]
10:45.6 [10:45.2] C3  Titreşimi dudaklarında, burnunda ya da yüzünde fark edebilirsin.  [10.3]
11:01.5 [11:01.1] C3  Bir elini göğsüne koyup titreşimi avucunda da hissedebilirsin.  [5.3]
11:12.2 [11:11.7] C3  Al…  [12.6]
11:25.2 [11:24.7] C3  Al…  [12.6]
11:38.2 [11:37.7] C3  Al…  [12.6]
11:51.2 [11:50.7] C3  Al…  [12.6]
12:04.2 [12:03.7] C3  Al…  [12.6]
12:17.2 [12:16.7] C3  Al…  [12.6]
12:30.2 [12:29.7] C3  Ses dindi. Ardından kalan sessizliği de duyuyorsun.  [15.3]
12:51.6 [12:51.2] C3  Nefes yeniden kendi hâlinde; bir şey yapman gerekmiyor.  [10.3]
13:06.7 [13:06.4] C3  Veriş uzar.  [6.3]
13:14.1 [13:14.0] K   Artık dönüş zamanı.  [3.8]
13:19.7 [13:19.8] K   Nefesin kendi ritmini buluyor.  [4.3]
13:26.7 [13:26.9] K   Saymadan, kendi hızında birkaç soluk alıp veriyorsun.  [10.3]
13:41.5 [13:41.8] K   Odadaki sesler de yeniden duyuluyor.  [5.3]
13:50.1 [13:50.5] K   Parmaklarını oynatıp zorlamadan gerinebilirsin; ağrı ya da baş dönmesi olursa bırak.  [7.3]
14:05.0 [14:05.2] K   Gözlerin kapalıysa ışığa alıştıra alıştıra açıp çevrende birkaç şeye bakmak yeter.  [7.3]
14:19.2 [14:19.2] K   Bir renge ya da ışığın düştüğü bir yere biraz daha uzun bakabilirsin.  [6.3]
14:31.2 [14:31.0] K   Günün hangi saatinde ve nerede olduğunu hatırlıyorsun.  [4.8]
14:40.8 [14:40.6] K   Bu ritmi gün içinde, kısa bir molada yeniden bulabilirsin.  [4.3]
14:50.2 [14:50.1] K   Buradasın; nefesin de hep seninle.  [6.3]
```

## 5. Denetim listeleri (model ilk denetimi; insan ya da yedek inceleme değildir)

### 5.1 PLAN.v3 §A.2: 3 dakikanın 12 kuralı

| Kural | Durum | Kanıt (hoc 3 dk planı) |
|---|---|---|
| 1 Yalnız oturarak | evet | posture = seated; kapanışta yana dönme, oturma, kalkma adımı yok |
| 2 Kapaklar kendi kısa metinleriyle | evet | `a.durus` (duruş + gözler tek klip), `c1.ritim`, `k.goz` kısa biçimleri; `a.gozler` minTarget 240; Kapanış sessizlikleri min = pref |
| 3 Zaman verir; nefes payı 12–20 sn; > 20 sn sessizlik yok | evet | `c1.izle` sonrası 13.2 sn; en uzun sessizlik 13.2 sn |
| 4 Tabanlar (çekirdek ≥ 0:55) | evet | C1 1:36 |
| 5 Anahtar cümle; başarısızlığı olağan sayan cümle | evet | `c1.anahtar1` bir kez; "Altı uzun gelirse beş de olur.", "Sayıyı kaçırırsan yeniden başlamak yeter." |
| 6 "-(y)abil-" | evet | derse özgü açılış "-(y)abil-"siz; `a.izin`'den sonraki 60 sn'de başka yok; Kapanış'ta 1 (`k.hareket`) |
| 7 Son 60 sn | evet | yeni imge, tutma, zor blok yok; çekirdeğin son klibi anahtar cümle |
| 8 Şafak 45 sn | evet | `k.donus` bitişe 48 sn kala başlar |
| 9 Zor blok yok | evet | Ders 1'de zor blok yok |
| 10 Alt küme | evet | 3 ⊆ 5 (üç köşede); ayrıca 3 ⊆ 4 ⊆ 5 |
| 11 Müzik: iki doku geçişi, aynı tema | evet | pad → bordun (`c1.izle`) → pad (`k.donus`) |
| 12 Kartta 3 dk'ya özgü etki cümlesi yok | evet | `evidenceByVersion["3"]` |

İskelet: giriş 4.1 sn · Varış 0:32 · çekirdek 1:36 · Kapanış 0:48 (hedef 0:04 / 0:30 / 1:38 / 0:48).

### 5.2 Usta hoca ölçütleri (PLAN.v2 §E.6, 18 madde; model ilk işareti)

| Ölçüt | Durum | Gerekçe |
|---|---|---|
| 1 Zaman verir | evet | her yönergeden sonra eylem süresi + ≥ 2 sn; veriş cümleleri verişin içinde biter, ardından ≥ 0,6 sn |
| 2 Sessizliği kullanır | evet | her blokta ≥ 5 sn, her sürümde en uzun ≥ 12 sn (denetim) |
| 3 Sessizliği korur | evet | ≤ 15 dk'da 20 sn'yi aşan sessizlik yok; sessiz döngü önce söylenir |
| 4 Somut beden dili | evet | omuz, çene, yüz, dudak, diş, dil, burun, avuç, göğüs; "enerji" yok |
| 5 Tutarlı yön | uygulanmaz | beden dolaşımı yok |
| 6 Dolgu yok | evet | dolgu denetimi her planda geçti ("şimdi" yalnız açılışta) |
| 7 Anlatmaz, yaşatır | evet | blok başına tek açıklama (`c1.ritim`, `c2.ad`, `c3.ad`); C3'ün ince ayarları (`c3.agiz`, `c3.kisa`) ilk iki vızıltıdan sonra (düzeltme turu, usta hoca UH7) |
| 8 Tek imge yayı | evet | işitsel yay (§1.4) |
| 9 Davet dili | açık soru | emir kipi yalnız güvenlikte ("dön", "bırak"); beden yönergelerinde 3. kişi istek kipi ("insin", "kalsın", "dursun", "olsun") ve mikro ipuçlarında "Al…", "ver…" var; Türkçe editör ve usta hoca kararı |
| 10 Başarısızlığı normalleştirir | evet | `c1.d2.s`, `c1.d3.s`, `c3.kisa`, `a.kolay` |
| 11 Çıkış kapısı | evet | açılış cümlesi her sürümde; 30 dk'da ortada `BR.orta` (iskelet); zor blok yok |
| 12 Kapanış ritüeli | evet | oturarak gündüz: nefes → parmaklar → gerinme → gözler → oda |
| 13 Azalan anlatım | evet | sayılı → ipuçlu → yalnız "Al…" → sessiz döngü; 15 dk'da cümle uzunluğu Varış > Derinleşme > Derin (H12 geçti); Kapanış'ta geri çıkış |
| 14 Doğal hız | açık | ses yok; üretimde ölçülür |
| 15 Ses–müzik | açık | ses yok; karışımda ölçülür (SPEC v3.4) |
| 16 Kusursuz Türkçe | açık | iki bağımsız model incelemesi işlendi (INCELEME.md); sahibin kulağı ve Scribe geri çevirisi bekliyor |
| 17 Benzersizlik | evet (bir not) | §1.5; müzikte Ders 8 ile ton/bordun yakınlığı |
| 18 Yasak liste ve güvenlik | evet | lint GEÇTİ; §5.3 |

### 5.3 Güvenlik senaryo kuralları (güvenlik §11.B, 18 kural)

| Kural | Durum | Not |
|---|---|---|
| 1 Davet | evet | bkz. E.6 #9 |
| 2 Gözler açık seçeneği | evet | Varış'ta her sürümde (`a.durus` kısa biçimi ya da `a.gozler`) ve `a.izin` |
| 3 "İstediğin an…" | evet | açılışta; 30 dk'da ortada (iskelet `BR.orta`) |
| 4 Kontrol kişide | evet | `a.karar`; yasak ifade yok |
| 5 Gevşeme zorunlu değil | kısmen | 5 ve 15 dk'da `a.kolay` 6. dakikadan girer; 3 ve 5 dk'da normalleştirme nefes kalıbı üzerinden ("Altı uzun gelirse…", "Sayıyı kaçırırsan…") |
| 6 Önce doğal nefes | evet | `c1.izle` her sürümde ilk çekirdek klibi; "derin nefes al" yok |
| 7 Tutma | evet | hiç yok; "Arada nefesi tutmak yok." (3 dk: "…; nefesi tutmak yok.") |
| 8 Dayanak ve kapı | uygulanmaz | zor bölüm yok |
| 9 Beden taraması | uygulanmaz | yok |
| 10 İmge seçimli | uygulanmaz | görsel imge yok |
| 11 Anı arama yok | evet |  |
| 12 Öz-şefkat | uygulanmaz |  |
| 13 Sağlık iddiası yok | evet | lint (PLAN.v2 §C.6 + E12); kart "Bu ders bir sonuç vaadi taşımaz." |
| 14 Gündüz dersi dönüşle biter | evet | oturarak: yana dönme ve kalkma yok |
| 15 Uyku izni | uygulanmaz |  |
| 16 Sessizlik rehberli | evet | ≤ 20 sn; sessiz döngü önce söylenir, ses bir sonraki alışta döner |
| 17 Hareket hafif | evet | `k.hareket`: "ağrı ya da baş dönmesi olursa bırak" |
| 18 Tıbbi uyarı kartta | evet | derste yalnız teknik düzeyde güvenlik cümlesi (`c1.guven`, `c2.guven`) |

### 5.4 "-(y)abil-" ve yasak sözcükler

"-(y)abil-" taşıyan cümle birimleri: `a.izin`, `c3.titresim`, `c3.el`, `k.hareket`, `k.oda`, `k.gun`. Herhangi bir 60 sn'de en çok 3 ve art arda en çok 3 "-abilir" cümlesi her planda denetlendi. Yasak sözcük ve iddia listesi (PLAN.v2 §C.6 + pilot E12), İngilizce, Sanskritçe ("bramari" bir kez), cümle başına ≤ 14 sözcük, birim başına 1–3 cümle, iki nokta üst üste (yok), mikro ipucu dışında üç nokta (yok): `timing.txt` "Metin denetimi" GEÇTİ.

## 6. Üretim notları (seslendirme; bu adımda yapılmadı)

- Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`), `eleven_v4`, birim başına 3 çekim, Scribe birebir (SPEC §2–§4, v3.1–v3.3).
- İstekler: 50 cümle birimi + 3 kısa biçim + 11 taşıyıcı = **64 istek, 3256 karakter**. SPEC §2 fiyatıyla (0,926 kredi / karakter / çekim, 3 çekim) ≈ **9045 kredi** (tahmin; yeniden çekimler ve Scribe hariç). Ortak yardımcılar (Durdur dönüşü, ilk ders girişi; her derste aynı, bir kez üretilir): 4 istek, 224 karakter.
- Metni ana biçimle aynı olan kısa biçimler (yalnız sessizlik değişir, ayrı ses gerekmez): `c1.izle`.
- Mikro ipuçları: sayılı taşıyıcıda öğeler arası duraklama kısadır; "en uzun N−1 duraklama" kesimi riskli. Kesim ölçüyle denetlenir ve kulak listesine girer (SPEC §4.3 c). Kesilemezse yedek: sayılı döngünün her öğesi kendi taşıyıcı cümlesinde ("…ve iki…" gibi) ayrı üretilir (maliyet artar, VARSAYIM).
- Tek heceli ipuçları ("Al…", "ver…", "üç…", "beş…"): SPEC v3.3 kısa parça düzeyi; konuşma/yatak ≥ 15 dB her parçada (v3.4). Karışımda "Al…" başlangıçları ±20 ms kilitli olmalı (`qa.breathLockToleranceSec`).
- Kulak denetimi listesi (insan kulağı; Scribe yakalayamaz):
  - D1-01: sayılı döngüde 1 sn arayla gelen 'iki… üç…' öğeleri Derinleşme düzeyinde (−1,5 dB) net ve doğal mı; kesilmiş mikro parçalar kopuk duyuluyor mu?
  - D1-02: 'Al…' ve 'ver…' ipuçları makine gibi mi duyuluyor? Her döngünün kendi çekimi var; yine de tekdüzeyse kulak listesine
  - D1-03: veriş cümleleri ('Altı uzun gelirse beş de olur.' vb.) verişin içinde bitiyor mu; sonraki 'Al…'dan önce en az 0,6 sn boşluk kalıyor mu (karışımda ölçülür)
  - D1-04: bordun döngüsü (10,000 / 13,000 sn), halka ve 'Al…' başlangıçları cihazda aynı anda mı (kilitli ekran dahil)
  - D1-05: 'Sıradaki nefes sende; ben susuyorum.' ve ardından gelen ≈ 11 sn'lik sessiz döngü doğal mı, dinleyici ritmi sürdürebiliyor mu
  - D1-06: 'bramari' söyleyişi (Türkçe yazım, PLAN.v2 §C.7) ve 'vızıltıyla ver…' vurgusu
  - D1-07: vurgu ve eşyazımlılar insan kulağıyla: 'Yüzün' (surat), 'Al…' (fiil), 'dört… beş… altı…' sayılar

## 7. VARSAYIM'lar, açık noktalar ve kendi gördüğüm zayıf yerler

1. **Ses yok, süreler tahmin.** Nefona Hoca köşesi önizleme hızına (4,68) dayanır; aynı model Ders 2'nin ölçülmüş hoc kliplerinden yüksek duraklamayla %3,6, düşük duraklamayla %1 uzun çıktı (110 ortak klip). Mikro ipuçlarının (0,4 sn) ve 1 sn'lik sayıların gerçek süresi kesimden sonra ölçülmeli; sayı 0,7 sn'yi aşarsa sayılı döngünün kilidi bozulur (D1-kilit kırmızı olur).
2. **3 dk'nın boş payı tabanın dibinde** (hoc 10.1 sn; taban 10 sn, VARSAYIM). Sarsıntı taramasında süreler %5 uzarsa 3 dk yalnız bu denetimden kalır. Ses ölçülünce daha yavaş çıkarsa ilk kısaltma adayı `c1.d2` (3 dk'daki ilk ipuçlu döngü) ya da `a.durus` kısa biçimidir.
3. **Sayılı döngünün 1 sn'lik öğeleri** hem üretimde (kesim) hem dinleyicide (hız) en riskli yer. İpuçlarının tekdüze ya da makine gibi duyulması D1-02 kulak denetimine bırakıldı.
4. **Veriş cümleleri verişin içinde bitmeli** (≤ 4,2 sn). En uzunu hoc köşesinde "Sıradaki nefes sende; ben susuyorum." ≈ 3,7 sn; ölçülen süre uzun çıkarsa cümle kısaltılır.
5. **15 dk dağılımı çapadan sapıyor:** C1 ≈ 4:48 (çapa 4:30), C3 ≈ 4:09 (çapa 4:30); C2 8., C3 12. dakikada girer. Neden: önek kuralı bir bloğun tabanını ancak esneme payı yettiğinde alır; C3'ün tabanı (öğretim + iki vızıltı + sessizlik + anahtar) ≈ 90 sn. Dolgu için 6–12. dakikalar arasında C1 ve C2'ye yalnız "Al…"lı döngüler eklendi; 15 dk'da C1'in son 60 sn'si yalnız "Al…" ipuçlarıdır (azalan anlatım, ama uzun).
6. **Ara dakikalar (4, 6–14) yayında yok** ama önek kuralı ve kaydırıcı için denetlendi. 7 ve 12. dakikalar esneme sınırına yakın (T5 f ≈ 0,4–0,6); ara dakikaların içeriği ikinci aşamada ölçülmüş sürelerle yeniden sınanmalı.
7. **Müzik imzası Ders 8'e yakın:** PLAN.v2 §A.2.1'de Ders 1 "tanpura benzeri bordun", Ders 8 "Re'de açık beşli bordun"; ikisi de Re. Ders 8 yazılırken ton ya da tını ayrışmalı (öneri: Ders 8 La ya da ahşap üflemeli öne); kör dinlemede yan yana ayırt edilmeli.
8. **Emir ve istek kipi:** "Al…", "ver…" ve "Omuzların aşağı insin." gibi 3. kişi istek kipi davet dilinin sınırında (E.6 #9). Nefes dersinde ipucu kısa olmak zorunda; karar Türkçe editör ve usta hoca yedeğinin.
9. **"Sırada iç çekiş var." ve "Sıradaki nefesin adı bramari…"**: iki blok aynı kalıpla açılıyor (Sıra-). Bilinçli bir işaret olarak bırakıldı; editör isterse biri değişir.
10. **Güvenlik §11.B-5** ("gevşeme zorunlu değil") 3 ve 5 dk'da yalnız nefes kalıbı üzerinden karşılanıyor; `a.kolay` 6. dakikadan girer. 3 dk'nın payı buna yetmedi.
11. **Hazırlık kartındaki "sesinin kimseyi rahatsız etmeyeceği bir yer"** yalnız 15 dk için geçerli; kart sürüme göre değişmiyorsa 3 ve 5 dk'da gereksiz bir satır olur (tasarım kararı).
12. **Vızıltının EEG'de uyanıklık yönü** (PMID 42521250) ikinci turda yeniden doğrulanmamış bir kayıttır; kartta kullanılmadı, yalnız §1.7'de gerekçe olarak anıldı.
13. **İnceleme yok:** PLAN.v3 §E.1'in Türkçe editör ve usta hoca onayları (karar 2 yedeği: iki bağımsız model incelemesi) ve sahibin kulağı henüz yok; metin seslendirilmeden önce bu iki incelemeden geçmeli.

## 8. Kaynaklar (hepsi `*.dogrulanmis.md` dosyalarından; DOI'ler https://doi.org/ önekiyle açılır)

- Laborde 2022 (SD/MA, 223 çalışma; seans sırasında, tek seanstan hemen sonra ve çok seanslı programdan sonra vagal aracılı KAD arttı; tempo özette verilmiyor) — PMID 35623448, DOI [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711) (sakin)
- Van Diest 2014 (n=30; alış/veriş oranı 0,42 ile 2,33 karşılaştırıldı; kısa alış/uzun veriş daha çok gevşeme bildirimiyle ilişkili; yüksek frekanslı KAD artışı yalnız yavaş + uzun verişte) — PMID 25156003, DOI [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x) (sakin)
- Bernardi 2001 (n=23; dakikada 6 kez okunan ritmik dualar ve mantralarda kardiyovasküler ritimler eşzamanlı güçlendi) — PMID 11751348, DOI [10.1136/bmj.323.7327.1446](https://doi.org/10.1136/bmj.323.7327.1446) (sakin)
- Balban 2023 (uzaktan RKÇ, n=108, 1 ay, günde 5 dk; döngüsel iç çekmede olumlu duygulanımda ve uyku sırasındaki solunum hızında meditasyondan fazla değişim; olumsuz duygulanım ve durumluk kaygıda gruplar arası fark yok; keşif amaçlı; tam metin) — PMID 36630953, DOI [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895) (sakin, benlik)
- Trivedi 2023 (kişi-içi çapraz, n=118; 8–14 sn döngüler; en yüksek KAD 12–14 sn döngüde) — PMID 38204770, DOI [10.4103/ijoy.ijoy_113_23](https://doi.org/10.4103/ijoy.ijoy_113_23) (sakin)
- Toussaint 2021 (RKÇ, n=60; derin nefes grubunda fizyolojik uyarılma önce arttı, sonra başlangıca döndü) → ders önce doğal nefesle başlar, 'derin nefes al' demez — PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040) (sakin, güvenlik)
- Rana 2023 (derleme; hiperventilasyon jeneralize epilepside hastaların %50'sine kadarında klinik nöbet tetikleyebilir) → derste hızlı ya da zorlu nefes yok — PMID 37813123, DOI [10.1055/s-0043-1774808](https://doi.org/10.1055/s-0043-1774808) (güvenlik)
- Luu 2024 (travma-duyarlı YN'nin 10 bileşeni; uygun uzunluk ve hazırlık, yeterli yerleşme ve dışa dönüş; kavramsal) — PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021) (sakin, güvenlik)
- Howard 2017 (klinik yorum ve 3 vaka; uyandırma başarısızlığı istenmeyen etkilerde önemli) — PMID 28300508, DOI [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281) (güvenlik)
- Cramer 2013 (vaka raporları; zorlu nefes en sık anılanlardan) → her harekette 'ağrı ya da baş dönmesi olursa bırak' — PMID 24146758, DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515) (güvenlik)
- Radin 2025 (RKÇ, n=1458; tam metin: meditasyona özgü kullanım ortalama 3,36 dk/gün, kullanıcıların %69,7'si günde 5 dk'nın altında) — PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435) (benlik)
- Ayrıca metinde anılan: Schumer 2018 (PMID 29939051, DOI [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324), benlik), Pernett 2023 (PMID 37060440, DOI [10.1007/s00421-023-05202-7](https://doi.org/10.1007/s00421-023-05202-7), güvenlik), Knowlton & Larkin 2006 (PMID 16941239, DOI [10.1007/s10484-006-9014-6](https://doi.org/10.1007/s10484-006-9014-6), teslim).

