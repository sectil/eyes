# 20 — "Hızlı Bakış" (UFOV tarzı) görev parametreleri, eğitim dozu, mobil sürümler, güvenlik

**Tarih:** 2026-09-25
**Kapsam:** Ortada kısa süre araba/kamyon, aynı anda kenarda 8 yönden birinde hedef, ardından maske. Kişi önce ortadakini, sonra kenar hedefin yönünü seçer. Doğru yaptıkça süre kısalır. Hedef platform iOS WKWebView (60 Hz rAF), Türkçe, 40 yaş üstü kullanıcı. Uygulama sağlık iddiası taşımıyor.

**Yöntem ve işaretler:** Tüm PMID ve DOI'ler bu oturumda PubMed MCP'de (arama, metadata, PMC tam metin) ya da Scholar Gateway'de görüldü.
- **[TM]**: PMC tam metni okundu.
- **[Ö]**: Yalnızca PubMed özeti okundu.
- **[SG]**: Scholar Gateway'den makale pasajı okundu.
- **VARSAYIM**: Kaynağı olmayan, tasarım için önerilen değer.
- **Bulunamadı**: Bu oturumda doğrulanamadı. Değer uydurulmadı.

**Kısa sonuç:**
- Klasik UFOV parametreleri tam metinden doğrulandı:
  - Süre 16.67–500 ms, 16.67 ms adımlarla (60 Hz'de 1 kare).
  - Kenar hedef 8 radyal konumda, yaklaşık 10.5° uzaklıkta.
  - Merkez hedef 1.91 × 1.43°.
  - Alt test 3'te 47 üçgen çeldirici, üç halkada.
  - Rastgele nokta maskesi.
  - Eşik %75 doğru, çift merdiven (double staircase) ile.
- Eğitimde standart doz yaklaşık **10 saat** (5–6 haftada).
  - Güçlendirme (booster) seansları ACTIVE'de 11. ve 35. ayda, IHAMS'de 11. ayda yapıldı. Smith 2018'de 5. ve 11. ayda 4'er saat.
  - Zorluk kuralı: %75 başarıda bir sonraki seviyeye geçiliyor.
- **Edwards 2006'daki yaşa göre ms normları bulunamadı.** Makalenin yalnızca özetine erişildi, tablolar okunamadı.
- Telefonda 10° uzaklık yalnızca yatay eksende sağlanabiliyor. 8 yönün hepsinde eşit uzaklık için sınır yaklaşık 5–6°. Bu nedenle "UFOV sürümü" değil, "UFOV tarzı pratik" denmeli.
- Kullanıcının kendi hızında yanıt verdiği denemelerde flaş sıklığı 3 Hz'in çok altında kalıyor. Bu tasarım ≥3 Hz sınırıyla uyumlu.
- "Bugün 3 kırmızı şey fark et" türü günlük görev için **doğrudan kanıt bulunamadı**. Yalnızca dolaylı kanıt var: farkındalık (mindfulness) ve inattentional blindness çalışmaları, "awe walk" RKÇ'si.

---

## 1. Görev parametreleri

### 1.1 Klasik UFOV (4 alt testli PC sürümü; ACTIVE ve SKILL'de kullanılan)

| Parametre | Değer | Kaynak |
|---|---|---|
| Görüntü | Siyah zemin üzerinde beyaz uyaranlar | Aust & Edwards 2016, *J Clin Exp Neuropsychol*, PMID 26782018, DOI [10.1080/13803395.2015.1125453](https://doi.org/10.1080/13803395.2015.1125453) [TM] |
| Süre aralığı | **16.67–500 ms**, **16.67 ms adımlarla** (60 Hz ekranda 1 kare) | Aust 2016 [TM]. Eramudugolla 2017 bunu "17–500 ms, çift merdiven" olarak veriyor: PMID 29089888, DOI [10.3389/fnagi.2017.00338](https://doi.org/10.3389/fnagi.2017.00338) [TM] |
| Merkez hedef | Araba ya da kamyon piktogramı, **1.91 × 1.43°**. Fiksasyon kutusu **2.86 × 2.86°** | Aust 2016 [TM] |
| Alt test 1 (işlem hızı) | Yalnızca merkezde araba mı, kamyon mu? İki seçenekli, hızın ölçülmediği zorunlu seçim | Aust 2016 [TM] |
| Alt test 2 (bölünmüş dikkat) | Merkez hedefle aynı anda kenarda bir araba piktogramı. **8 radyal konumdan birinde, yaklaşık 10.47°** uzaklıkta. Önce merkez, sonra kenar hedefin konumu seçiliyor. **İki yanıt da doğruysa deneme doğru sayılıyor** | Aust 2016 [TM] |
| 8 konumun açıları | Üst dikeyden 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°. Kenar hedef uzaklığı 10°. İzleme mesafesi yaklaşık 55 cm, 17" LCD ekran, fare ile yanıt | Eramudugolla 2017 [TM] |
| Alt test 3 (seçici dikkat) | **47 aşağı bakan üçgen çeldirici**, hedefle aynı boyut, kontrast ve parlaklıkta. **3 eş merkezli halkada**, en dıştaki 10.47° | Aust 2016 [TM] |
| Alt test 4 | Alt test 3 gibi, ama merkezde iki piktogram var: "aynı mı, farklı mı?" | Aust 2016 [TM] |
| Maske | Uyarandan hemen sonra **rastgele nokta deseni** ("random dot pattern") | Aust 2016 [TM]. Eramudugolla 2017 bunu "random noise mask" olarak tanımlıyor [TM] |
| Maske süresi | **Bulunamadı** (UFOV için). Karşılaştırma için: VIPS'te 500 ms, Seiple 2001'de 750 ms (§4) | — |
| Eşik tanımı | Deneyenin **%75 doğruya** ulaştığı gösterim süresi. **Çift merdiven** yöntemiyle bulunuyor. Tepki süresi kaydedilmiyor | Aust 2016 [TM] |
| Merdiven kuralı | "**2-down / 1-up**, %75 doğruyu izleyen uyarlamalı merdiven". Her alt test öncesi **4 alıştırma denemesi** | Hutchinson & Badham 2013, *Optom Vis Sci*, PMID 23689679, DOI [10.1097/OPX.0b013e318294c232](https://doi.org/10.1097/OPX.0b013e318294c232) [SG] |
| Merdiven kuralıyla ilgili not | 2-down/1-up kuralı kuramsal olarak %70.7 doğruya yakınsar (Levitt 1971; bu oturumda PubMed'de doğrulanmadı). Kaynaklar "%75" diyor, aradaki fark yazılımın ayrıntısından kaynaklanıyor olabilir | — |
| Alt test başına deneme sayısı | **Bulunamadı** | — |
| Eski sürüm (Visual Attention Analyzer) | Kenar hedef uzaklığı **10, 20 ya da 30°**. Gösterim süresi **40–240 ms**. Puan 0–30 (30° alanda yüzde daralma), toplam 0–90 | Owsley & McGwin 2004, *J Am Geriatr Soc*, PMID 15507069, DOI [10.1111/j.1532-5415.2004.52516.x](https://doi.org/10.1111/j.1532-5415.2004.52516.x) [SG] |

### 1.2 Alt testlerin değeri ve tavan/taban etkileri

- **Aust 2016 [TM]:**
  - Günlük yaşam becerilerini (IADL) bağımsız olarak **yalnızca alt test 2 ve 3** öngördü.
  - Alt test 1 ve 4'ün katkısı ihmal edilebilir düzeydeydi.
  - Tavan ve taban etkileri:
    - SKILL (n=828): Alt test 1'de puanların %91.4'ü, alt test 2'de %31.9'u **32 ms'nin altında**. Alt test 4'te puanların %53.9'u **484–500 ms tavanında**. Alt test 3'te %20.2 üst sınırda.
    - ACTIVE (n=2426): Alt test 1'de %85.0, alt test 2'de %21.9 32 ms'nin altında. Alt test 3'te %26.5, alt test 4'te %58.4 tavanda.
  - **Uygulamaya yansıması:** "Merkez + kenar" (alt test 2) ile başlamak ve sonra çeldirici eklemek (alt test 3) kanıtla uyumlu. Alt test 4'e gerek yok.

### 1.3 Yaşa göre normlar (ms)

| Kaynak | Bulunan |
|---|---|
| Edwards 2006, *Arch Clin Neuropsychol*, PMID 16704918, DOI [10.1016/j.acn.2006.03.001](https://doi.org/10.1016/j.acn.2006.03.001) [Ö] | n=2759, yaş 65–94. Performans yaşa ve eğitime göre değişiyor, varyansın en büyük kısmını yaş açıklıyor. Normatif tablolar makalede var. **Tablolardaki ms değerleri bulunamadı** (tam metne erişilemedi) |
| Eramudugolla 2017 [TM] | Yaş ortalaması yaklaşık 72. **Alt test 2 başlangıç ortalaması 90.0 ms (SS 64.1) ve 108.8 ms (SS 102.0)**, aralık 17–373 ms |
| Wood 2012, *Optom Vis Sci*, PMID 22366710, DOI [10.1097/OPX.0b013e31824c17ee](https://doi.org/10.1097/OPX.0b013e31824c17ee) [Ö+SG] | Yaş 65–88. "Önerilen kesme değerleri": alt test 2 için **>100 veya >150 ms**, alt test 3 için **>350 ms**. Sürüşü en iyi alt test 3 öngördü |
| Smith 2018, *J Am Geriatr Soc*, PMID 29972593, DOI [10.1111/jgs.15423](https://doi.org/10.1111/jgs.15423) [Ö+SG] | Yaş ortalaması 81. Üç alt testin toplamı 51–1500 ms aralığında. **0.5 SS = 158.4 ms** |
| Aul 2023 (VIPS, UFOV'dan türetilmiş web görevi), *Cogn Res*, PMID 37542181, DOI [10.1186/s41235-023-00504-y](https://doi.org/10.1186/s41235-023-00504-y) [TM] | n=4395, yaş 12–62. En iyi performans yaklaşık 22 yaşta. **60 yaşta eşik 20 yaşın iki katı (817 ms'ye karşı 412 ms)**. Bu değerler UFOV ms'leriyle karşılaştırılamaz (farklı görev ve %56.25 hedef doğruluk) |
| **40–64 yaş için UFOV ms normu** | **Bulunamadı** |

---

## 2. Eğitim dozu ve ilerleme

| Çalışma | Seans | Toplam doz | Güçlendirme (booster) | İlerleme kuralı | Kaynak |
|---|---|---|---|---|---|
| **ACTIVE** (n=2832, 65–94 yaş) | **10 seans**, 2–4 kişilik küçük gruplar, yaklaşık **70 dk**, haftada 2, **5–6 hafta** | Yaklaşık 10–12 saat | **4 seans, 11. ayda** (rastgele seçilen %60'a). Seanslar yaklaşık **90 dk**. 10 yıllık makaleye göre 11 ve 35. aylarda. Uygunluk koşulu: ilk 10 seansın en az 8'ini tamamlamak | "Kişi belirli bir görevde ölçütü tuttuğunda zorluk arttı." Sıra: kısa gösterimde tanıma → bölünmüş dikkat → çeldiricili ortam. Ana ayar **gösterim hızı** | Ball 2002, *JAMA*, PMID 12425704, DOI [10.1001/jama.288.18.2271](https://doi.org/10.1001/jama.288.18.2271) [Ö]; Ball 2010, *JAGS*, PMID 21054291, DOI [10.1111/j.1532-5415.2010.03138.x](https://doi.org/10.1111/j.1532-5415.2010.03138.x) [TM]; Rebok 2014, *JAGS*, PMID 24417410, DOI [10.1111/jgs.12607](https://doi.org/10.1111/jgs.12607) [Ö] |
| **IHAMS / Road Tour** (n=681, 50–64 ve ≥65 yaş) | 5 hafta boyunca haftada 1 kez **2 saat** | **10 saat** | 11. ayda 4 saat (2 × 2 saat) | "**%75 başarı oranı korunarak** daha kısa gösterime geçiliyor." Zorluk 3 yoldan artıyor: (a) hedef alanı yakın halkadan orta ve uzak halkalara genişliyor, (b) çeldirici sayısı artıyor (başlangıçta 7, en çok **47**), (c) araç çiftleri **9 aşamada** birbirine benzeşiyor. 81 alıştırma seti var | Wolinsky 2011 protokol, *BMJ Open*, PMID 22021885, DOI [10.1136/bmjopen-2011-000218](https://doi.org/10.1136/bmjopen-2011-000218) [TM] |
| IHAMS ara sonuç | — | — | — | Evde, kendi başına yapılan Road Tour laboratuvardaki kadar etkili. Etki **50–64 yaş** grubunda da ≥65 grubundaki gibi. Etki büyüklüğü −0.558 | Wolinsky 2011, *BMJ Open*, PMID 22106377, DOI [10.1136/bmjopen-2011-000225](https://doi.org/10.1136/bmjopen-2011-000225) [Ö] |
| **Double Decision** (Smith 2018; n=351, 55–102 yaş) | Seans uzunluğu esnek (yorgunluk ve sıkılmayı azaltmak için) | 6 haftada 10 saat + 5. ve 11. aylarda 4'er saat = **18 saat** | Var | "**Denemelerin %75'inden fazlasında** merkez araç ve kenar konum doğruysa zorluk artıyor." Çeldirici sayısı artıyor, hedef uzak halkaya taşınıyor, araçlar benzeşiyor, **arka plan karmaşıklaşıyor**. Başlangıç seviyesi kişiye göre ölçülüyor | Smith 2018 [SG] |
| Eramudugolla 2017 (n=24 eğitim + 24 kontrol, randomize değil) | Evde Double Decision, hedef haftada 2 saat × 5 hafta | **Gerçekleşen: ortalama 7.9 saat**, 16 seans, 43 gün | — | Süre 17–500 ms arasında uyarlamalı. **Kazancı toplam saatten çok eğitimin yayıldığı gün sayısı öngördü** | [TM] |
| JMIR 2026 (ergen sporcu, n=6, pilot) | Haftada 5 seans × yaklaşık **25 dk**, 5 hafta | Yaklaşık 10.4 saat (250 seviye) | — | Uyarlamalı, oyun benzeri | Rosenthal 2026, *JMIR Form Res*, PMID 42726779, DOI [10.2196/93778](https://doi.org/10.2196/93778) [Ö] |
| EFIT protokolü | 10 haftada 20 saat | 20 saat | — | — | Ross 2025, *Contemp Clin Trials*, PMID 39892866, DOI [10.1016/j.cct.2025.107829](https://doi.org/10.1016/j.cct.2025.107829) [Ö] |

**Doz ve etkiyle ilgili bulgular:**
- **Ball 2002 [Ö]:** Hız eğitimi alanların %87'sinde güvenilir kazanç görüldü. Güçlendirme yapılanlarda oran %92, yapılmayanlarda %68.
- **Rebok 2014 [Ö]:** Hedef beceride etki 10 yıl sürdü (ES 0.66). Güçlendirmenin ek etkisi ES 0.62.
- **Edwards 2017 meta-analizi**, *Neurosci Biobehav Rev*, PMID 29175362, DOI [10.1016/j.neubiorev.2017.11.004](https://doi.org/10.1016/j.neubiorev.2017.11.004) [Ö]: 17 RKÇ. **Uyarlamalı eğitimin etkisi uyarlamasızdan büyük.**
- **Yan etkiler ve uyarılar:**
  - Eramudugolla 2017 [TM]: 24 kişiden engel olarak 8'i **sıkılma**, 5'i **göz yorgunluğu**, 1'i **migren** bildirdi. Eğitim sonrası **tehlike algılama testinde yavaşlama** görüldü. Yazarlar bunu hedefe yönelik arama yerine yaygın dikkat stratejisine bağlıyor.
  - Smith 2019, *PLoS One*, PMID 31622386, DOI [10.1371/journal.pone.0223841](https://doi.org/10.1371/journal.pone.0223841) [Ö]: **Destekli yaşam** ortamındaki yaşlılarda Road Tour/Double Decision eğitimi depresif belirtileri **artırdı**. Yazarlar depresyon izlenmesini öneriyor.
- **İddia sınırı:** Sürüş, kaza ve demans sonuçları uygulamada **iddia olarak kullanılmamalı**. Uygulamanın dozu ve görevi bu çalışmalarınkine eşit değil.

---

## 3. Mobil, tablet ve web sürümleri

| Sürüm | Cihaz / mesafe | Açısal ölçü nasıl korundu | Klasik UFOV ile uyum | Süre / güvenilirlik | Kaynak |
|---|---|---|---|---|---|
| UFOV PC (fare ve dokunmatik) | Masaüstü PC | — | Standart sürümle r = 0.658 (fare), 0.746 (dokunmatik). Fare ile dokunmatik arasında r = 0.916 | Test–tekrar test r = 0.884 (fare), 0.735 (dokunmatik) | Edwards 2005, *J Clin Exp Neuropsychol*, PMID 16019630, DOI [10.1080/13803390490515432](https://doi.org/10.1080/13803390490515432) [Ö] |
| **Online UFOV®** | Evden, çevrimiçi. **Cihaz ve mesafe özette yok, bulunamadı** | Bulunamadı | PC sürümüyle **r = 0.39–0.54** (toplam, alt test 2 ve 3) | Yaklaşık 4 ayda test–tekrar test **r = 0.64–0.72** (toplam ve alt test 3). Alt test 1'de değişkenlik çok az olduğu için analiz yapılamadı | Runge 2025, *J Clin Exp Neuropsychol*, PMID 39962792, DOI [10.1080/13803395.2025.2461518](https://doi.org/10.1080/13803395.2025.2461518) [Ö] |
| **PERCEPT (iPad)** | iPad 3 (retina), **40.6 cm (16 inç)**, otomatik parlaklık kapalı, parlaklık en yüksekte, oda 85 cd/m² | Merkezde 8 yönlü "E" (20/200 büyüklüğünde). Kenar hedef Gabor (2.71°, 3.69 c/d), **7.7°** uzaklıkta, **8 konumdan birinde**. **%25 Weber kontrastı** | UFOV ile doğrudan korelasyon **bulunamadı**. Yazarlara göre kaza ve düşme öyküsünü UFOV alt test 2'den daha iyi öngördü | Başlangıç 1000 ms, iPad'de en kısa 16.67 ms. **2 ardışık doğru → bir seviye kısalır. 3 ardışık yanlış → test biter** | Rosen 2015, *PLoS One*, PMID 26445501, DOI [10.1371/journal.pone.0139426](https://doi.org/10.1371/journal.pone.0139426) [TM] |
| **VIPS (web, TestMyBrain)** | 15" MacBook. Mesafe **kontrol edilmedi**, 60 cm varsayıldı | Merkez E 1.8°. Kenar şekiller 2.5°, **9.0°** uzaklıkta. Renk ve şekil birleşimli arama, cihaz farkına dayanıklı olsun diye seçildi. Kenar şekiller, E'nin yönüne göre 22.5° döndürülmüş | UFOV ile doğrudan karşılaştırma yok. Seçici dikkat, TMT-A/B ve işler bellekle ilişkili. Laboratuvar ve online medyanları farksız (430 ve 372 ms) | **50 deneme, 5 dakikadan kısa**, bestPEST. Süre 16–2000 ms. **Her 8. deneme kolay** (eşiğin 3 katı) | Aul 2023 [TM] |
| Double Decision (BrainHQ, web) | Ev bilgisayarı | Bulunamadı | Eğitim aracı, ölçüm validasyonu bulunamadı | Eğitim sonrası UFOV'da ortalama −45.8 ms | Eramudugolla 2017 [TM]; Smith 2018 [SG] |
| **Akıllı telefonda UFOV validasyonu** | — | — | **Bulunamadı** | — | — |

**En kısa güvenilir süre:** VIPS 50 denemeyle 5 dakikanın altında eşik ölçüyor. PERCEPT'in süresi bulunamadı. Klasik UFOV'un toplam süresi de bulunamadı.

**Web/WebView zamanlaması:** 08 numaralı rapora göre (Pronk 2020, PMID 31823223) web tarayıcıda 100 ms'nin altındaki süreler güvenilir değil. Bu uygulama WKWebView'da çalışacağı için bu uyarı doğrudan geçerli.

---

## 4. Maske ve ışığa duyarlılık güvenliği

### 4.1 Maskenin yapısı

| Kaynak | Maske |
|---|---|
| UFOV (Aust 2016 [TM]; Eramudugolla 2017 [TM]) | Rastgele nokta ya da gürültü deseni. **Süresi bulunamadı** |
| VIPS (Aul 2023 [TM]) | **500 ms**. Parlak renkli şekiller rastgele üst üste; hedef ve çeldirici renkleri, siyah çizgiler ve eğriler içeriyor. Amaç art görüntüyü (afterimage) engellemek |
| Seiple 2001, *Optom Vis Sci*, PMID 11327679 (künyeden eşleşti), DOI [10.1002/j.1538-9235.2001.tb01231.x](https://doi.org/10.1002/j.1538-9235.2001.tb01231.x) [SG] | "Beyaz" gürültü ekranı, **750 ms**. Ayrıca 3-down/1-up merdiven: adım 25 kare → 10 kare → 1 kare, 9 dönüşte biter |

### 4.2 Işığa duyarlı nöbet ölçütleri

**Harding 2005 uzman konsensüsü**, *Epilepsia*, PMID 16146438, DOI [10.1111/j.1528-1167.2005.31305.x](https://doi.org/10.1111/j.1528-1167.2005.31305.x) [Ö]. Bir flaş şu üç koşul birlikte sağlanırsa potansiyel risktir:
- Parlaklık **≥20 cd/m²**,
- Sıklık **≥3 Hz**,
- Kapladığı katı açı **≥0.006 sr** (merkezi görme alanının yaklaşık %10'u ya da ekranın yaklaşık %25'i).

Aynı konsensüste ayrıca:
- Doymuş kırmızıya geçiş ya da kırmızıdan geçiş risklidir.
- **5'ten fazla açık-koyu çizgi çifti** içeren desen, çizgiler hareket ediyor, yanıp sönüyor ya da kontrastı ters dönüyorsa risklidir.

**Fisher 2022 güncel derleme**, *Epilepsia*, PMID 35132632, DOI [10.1111/epi.17175](https://doi.org/10.1111/epi.17175) [Ö]:
- Risk: 20 cd/m²'den parlak, **3–60 Hz (özellikle 15–20 Hz)**, görme alanının ≥%10–25'ini kaplayan flaşlar, kırmızı flaşlar ve salınan çizgiler.
- Yaygınlık: 4000 kişide 1'e kadar.

Fisher 2005 derlemesi (PMID 16146439, DOI [10.1111/j.1528-1167.2005.31405.x](https://doi.org/10.1111/j.1528-1167.2005.31405.x) [Ö]): En kışkırtıcı aralık 15–25 Hz, tüm aralık 1–65 Hz.

### 4.3 Deneme hızı ile 3 Hz sınırı uyumlu mu? (hesap VARSAYIM, ölçüt Harding 2005)

- **Alan:** Telefon ekranı (yaklaşık 15.5 × 7.2 cm, 35 cm'den) yaklaşık **0.09 sr** kaplar. Tam ekran bir parlaklık değişimi alan ölçütünü **aşar**. Bu yüzden güvenliği **sıklık** ve **parlaklık farkı** sağlamalı.
- **Bir denemedeki parlaklık değişimleri:** fiksasyon → uyaran açılır → maske açılır → maske kapanır → yanıt ekranı. Maskenin **ortalama parlaklığı zeminle eşitse**, maske geçişleri ortalama parlaklığı değiştirmez. O zaman deneme başına en fazla yaklaşık 1 flaş (uyaran açılıp kapanması) olur.
- **Deneme süresi:** Fiksasyon 500 ms + uyaran (17–500 ms) + maske 500 ms + kullanıcının kendi hızında yanıtı (çift yanıt, gerçekte ≥1 s) + deneme arası 500 ms. Toplam **deneme başına ≥2.5 s**, yani **≤0.4 flaş/s**. Bu, **3 Hz sınırının çok altında. Uyumlu.**
- **Risk yaratabilecek durumlar:**
  - Yanıt beklemeden otomatik akan denemeler,
  - Titreşen (flicker) ya da yanıp sönen maske animasyonu,
  - Çizgili ya da ızgara desenli maske,
  - Kırmızı flaş,
  - Siyah zeminde tam ekran beyaz maske.

---

## 5. Günlük "dış dünyada fark et" görevi

| Soru | Bulgu | Kaynak |
|---|---|---|
| "Bugün 3 kırmızı şey fark et" gibi günlük görevin etkisi | **Bulunamadı.** PubMed ve Scholar Gateway'de doğrudan RKÇ yok | — |
| Yaş ve fark edememe (inattentional blindness, IB) | Yaşlılarda IB belirgin şekilde daha sık. Statik görevde **%89'a karşı %5**, dinamik görevde **%38'e karşı %8**. Beklenmeyen nesnenin rengi kişinin **dikkat setiyle uyuşmuyorsa** IB artıyor | Horwood & Beanland 2016, *Atten Percept Psychophys*, PMID 26758974, DOI [10.3758/s13414-015-1057-4](https://doi.org/10.3758/s13414-015-1057-4) [Ö] |
| | Yaşla birlikte IB artıyor ("gorilla" paradigması) | Graham & Burke 2011, *Psychol Aging*, PMID 21261412, DOI [10.1037/a0020647](https://doi.org/10.1037/a0020647) [Ö] |
| | Sürüş simülatöründe IB her iki yaş grubunda da yüksek. Gençler ilk kritik denemeden sonra iyileşti, yaşlılar iyileşmedi | Saryazdi 2019, *Front Psychol*, PMID 31080422, DOI [10.3389/fpsyg.2019.00880](https://doi.org/10.3389/fpsyg.2019.00880) [Ö] |
| Kısa farkındalık (mindfulness) çalışması ve IB | n=794. Kısa bir farkındalık indüksiyonu beklenmeyen uyaranın fark edilmesini artırdı, yani IB'yi azalttı. Tek oturum, genç yetişkinler | Schofield 2015, *Conscious Cogn*, PMID 26320867, DOI [10.1016/j.concog.2015.08.007](https://doi.org/10.1016/j.concog.2015.08.007) [Ö] |
| 8 haftalık farkındalık programı | Nöroşirürjide randomize olmayan pilot (13 + 15 kişi). "Dikkat dışı" hatalar azaldı | Pandit 2022, *Front Surg*, PMID 35599807, DOI [10.3389/fsurg.2022.916228](https://doi.org/10.3389/fsurg.2022.916228) [Ö] |
| Dışarıda dikkatini çevreye yöneltme | **"Awe walk" RKÇ'si** (n=60 yaşlı): 8 hafta, haftada **15 dk** dış mekân yürüyüşü. Olumlu ve prososyal duygular arttı, günlük sıkıntı azaldı. Kaygı, depresyon ve yaşam doyumu değişmedi | Sturm 2020, *Emotion*, PMID 32955293, DOI [10.1037/emo0000876](https://doi.org/10.1037/emo0000876) [Ö] |
| İçsel dikkat ve eğitim kuramı | Kuramsal makale, veri yok | Morris 2025, *Open Mind*, PMID 40469940, DOI [10.1162/opmi_a_00204](https://doi.org/10.1162/opmi_a_00204) [Ö] |

**Yorum (VARSAYIM):** "3 kırmızı şey bul" görevi, Horwood 2016'daki **dikkat seti** mekanizmasına göre kırmızı nesneleri fark etmeyi kolaylaştırır. Ama başka özellikteki nesnelerde IB'yi azaltacağına dair veri yok. Görevin UFOV performansına ya da genel farkındalığa aktarımı **bulunamadı**. Bu nedenle görev "keyifli farkındalık alıştırması" olarak sunulmalı ve **hedef özelliği her gün değişmeli** (renk, şekil, ses, doku). Bu öneri de kanıtsızdır (VARSAYIM).

---

## 6. Uygulama için önerilen sabitler

| # | Sabit | Değer | Dayanak |
|---|---|---|---|
| 1 | Görev yapısı | Merkezde araba/kamyon (2 seçenek) + kenarda 8 konum. **İki yanıt da doğruysa deneme doğru** | Aust 2016 [TM] |
| 2 | Alt test sırası | Önce çeldiricisiz (alt test 2 benzeri) → sonra çeldiricili (alt test 3 benzeri). Alt test 1 ve 4 yok | Aust 2016 [TM]; Wolinsky 2011 [TM] |
| 3 | Süreler **kare cinsinden** tanımlansın | 1 kare = 16.67 ms @60 Hz. Merdiven adımı 1 kare | Aust 2016 [TM]. Kare temelli tanım 08 numaralı rapordan |
| 4 | Başlangıç süresi | **500 ms (30 kare)** | UFOV üst sınırı (Aust 2016). PERCEPT ve VIPS 1000 ms'den başlıyor; 40 yaş üstü yeni kullanıcı için 500 ms makul (VARSAYIM) |
| 5 | Taban süre (WKWebView) | Varsayılan **100 ms (6 kare)**. Kare sayımı ve düşen kare kaydı doğrulanırsa **50 ms'ye (3 kare)** kadar açılabilir | VARSAYIM. Dayanak: 08 numaralı rapor, Pronk 2020 (web'de 100 ms'nin altı güvenilmez). UFOV tabanı 16.67 ms (Aust 2016) ama WebView için önerilmez |
| 6 | Merdiven | **2-down/1-up**. İlk 2 dönüşe kadar 4 kare, sonra 1 kare. Eşik = son 6 dönüşün ortalaması | Hutchinson 2013 [SG]. Adım küçültme mantığı Seiple 2001'den [SG]. Sayılar VARSAYIM |
| 7 | Eğitimde seviye atlama | Son blokta **≥%75** doğru → daha kısa süre ya da daha zor seviye | Wolinsky 2011 [TM]; Smith 2018 [SG] |
| 8 | Zorluk ekseni sırası | (1) Süre → (2) çeldirici: 0 → 7 (yakın halka) → daha fazla → (3) uzaklık: yakın → orta → uzak halka → (4) araba ve kamyonun benzeşmesi | Wolinsky 2011 [TM]: 7'den 47'ye çeldirici, 3 halka, 9 benzeşme aşaması. Telefonda en fazla çeldirici sayısı VARSAYIM (yaklaşık 23, 2 halka) |
| 9 | 8 konum | 0°, 45°, …, 315° (üst dikeyden) | Eramudugolla 2017 [TM] |
| 10 | Kenar hedef uzaklığı | Tablette (yaklaşık 40 cm) **10°**. Telefonda yatay kullanımda, 35 cm'de 8 yönün hepsi için en fazla yaklaşık **5.5°**. Telefonda halkalar yaklaşık 2.5°, 4°, 5.5° | UFOV 10.47° (Aust 2016). PERCEPT iPad'de 7.7°. Telefon değerleri geometriden hesaplandı (VARSAYIM: kısa kenar 7.2 cm → atan(3.6/35) ≈ 5.9°) |
| 11 | Merkez hedef boyutu | **1.9 × 1.4°** (35 cm'de yaklaşık 1.2 × 0.9 cm). Fiksasyon kutusu 2.9° (yaklaşık 1.75 cm) | Aust 2016 [TM]. cm karşılıkları hesap |
| 12 | İzleme mesafesi | "Yaklaşık 35 cm, yakın gözlüğünüzle" yönergesi. Açılar cihaz modeline göre piksel/cm üzerinden hesaplansın | PERCEPT 40.6 cm (Rosen 2015). VIPS'te mesafe kontrol edilmedi. Yönerge VARSAYIM |
| 13 | Maske | **500 ms**. Rastgele nokta deseni, **ortalama parlaklığı zemine eşit**. Çizgi ya da ızgara yok, doymuş kırmızı yok, titreme yok. Yalnızca uyaran alanını kaplasın | Süre: VIPS [TM]. Desen: UFOV (Aust 2016). Güvenlik kısıtları: Harding 2005 [Ö] |
| 14 | Kontrast | Koyu gri zemin üzerinde açık gri uyaran (tam siyah-beyaz değil). Ekran parlaklığı sistem ayarında kalsın | Harding 2005 parlaklık ölçütüne dayanan VARSAYIM. PERCEPT %25 Weber kontrastı kullandı [TM] |
| 15 | Deneme temposu | Yanıt kullanıcının kendi hızında. Deneme arası ≥500 ms. **Otomatik akış yok** | §4.3 hesabı. Harding 2005 |
| 16 | Oturum uzunluğu | **Yaklaşık 50 deneme (3–5 dk)**. Her **8. deneme kolay** (eşiğin 3 katı) | VIPS 50 deneme, 5 dakikadan kısa, 8 denemede bir kolay deneme [TM]. Süre sınırı için 17a numaralı rapora bakın |
| 17 | Toplam doz beklentisi | Literatürdeki doz yaklaşık 10 saat. 5 dk/gün ile bu yaklaşık 120 güne karşılık gelir. **Düşük dozun etkisi bilinmiyor.** Eğitimin günlere yayılması öneriliyor | ACTIVE, IHAMS. Eramudugolla 2017: yayılan gün sayısı saatten daha belirleyici [TM] |
| 18 | Tekrar dönemi | Yaklaşık 11 ay sonra tekrar bloğu önerilebilir | ACTIVE, IHAMS [TM/Ö] |
| 19 | Puanın gösterimi | "Kişisel eşik (ms)" olarak ve **yalnızca kendi geçmişiyle** karşılaştırılarak. **UFOV normlarıyla ya da sürüş risk kesme değerleriyle karşılaştırma yapılmasın** | Mobil sürümün validasyonu yok (§3). Wood 2012 kesme değerleri klinik bağlamda |
| 20 | İsimlendirme | "UFOV" adı kullanılmasın ("Hızlı Bakış"). Literatürde **UFOV®** tescilli marka olarak geçiyor | Runge 2025 [Ö]. Hukuki kontrol VARSAYIM |
| 21 | Güvenlik ve iyi oluş | Göz yorgunluğu ya da baş ağrısı olursa bırakma yönergesi. Epilepsi uyarısı | Eramudugolla 2017 [TM]: göz yorgunluğu, migren. Harding 2005; Fisher 2022 |
| 22 | Günlük fark etme görevi | İsteğe bağlı, her gün değişen özellik, günde 1 görev, "iddia yok" metni | §5, VARSAYIM |

---

## 7. Bulunamayanlar

1. **Edwards 2006 normatif tabloları:** Yaşa ve eğitime göre ms değerleri bulunamadı (tam metne erişilemedi).
2. **40–64 yaş için UFOV ms normu:** Bulunamadı. IHAMS'de 50–64 yaş grubu var, ama normatif değer verilmemiş.
3. **UFOV maske süresi** ve **alt test başına deneme sayısı:** Bulunamadı.
4. **Merdivenin tam kuralı:** "Double staircase" ve "2-down/1-up" ifadeleri bulundu. Başlangıç değeri, adım büyüklüğü, dönüş sayısı ve durma kuralı bulunamadı.
5. **Klasik UFOV'un toplam test süresi:** Bulunamadı.
6. **Online UFOV® (Runge 2025):** Cihaz türü, izleme mesafesi ve açının nasıl korunduğu özette yok. Bulunamadı.
7. **Akıllı telefonda UFOV veya Double Decision validasyonu** (ICC ya da r): Bulunamadı.
8. **PERCEPT–UFOV korelasyon katsayısı:** Bulunamadı.
9. **Double Decision'ın ölçüm aracı olarak validasyonu:** Bulunamadı. Yalnızca eğitim çalışmaları var.
10. **"Bugün X şey fark et" türü günlük görevin etkisi:** Bulunamadı. Aktarımı ve IB'ye etkisi de bulunamadı.
11. **"Noticing" alıştırmasının (Langer tarzı) PubMed'de RKÇ'si:** Bulunamadı. Scholar Gateway'de yalnızca kuramsal ya da ilgisiz sonuçlar çıktı.
12. **Doz-yanıt:** Günde 3–5 dk gibi düşük dozlarda UFOV tarzı eğitimin etkisi bulunamadı.

---
*Kaynak notu: Makale bilgileri PubMed (NCBI) ve Scholar Gateway'den alındı. DOI bağlantıları tablolarda verildi. [SG] işaretli bilgiler Scholar Gateway pasajlarından geliyor ve ürün kararından önce birincil kaynaktan doğrulanmalı.*
