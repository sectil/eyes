# 13 — Evde Günlük Görme Takibi ve Tekrarlı Test (Tumbling E) — Kanıt Raporu

Tarih: 2026-09-24 · Kapsam: günlük kısa görme testi (tumbling E), tarihsel gelişim grafiği, eğitim takvimi, hatırlatmalar (web/PWA).
Araçlar: PubMed MCP (metadata + tam metin), Scholar Gateway, WebSearch, Context7 (MDN içerik deposu, MDN browser-compat-data, Chrome for Developers).
Not: `webkit.org`, `developer.mozilla.org`, `web.dev`, `developer.chrome.com` sayfaları bu ortamda **WebFetch ile doğrudan açılamadı** (ağ politikası engeli). Teknik bilgiler; WebSearch sonuç özetleri, Context7 üzerinden çekilen MDN kaynak dosyaları (`github.com/mdn/content`, `github.com/mdn/browser-compat-data`) ve Chrome docs içeriğiyle doğrulandı. Her iddianın yanında hangi yoldan görüldüğü belirtilmiştir.

Önemli bağlam uyarısı: Aşağıdaki klinik kanıtın neredeyse tamamı **hastalık popülasyonlarında** (AMD, DMÖ, glokom) ve çoğu **tıbbi cihaz** statüsündeki uygulamalardan gelir. Bizim uygulamamız bir göz eğitimi uygulaması; sonuçlar "tanı" değil "kişisel takip" olarak sunulmalı, belirgin kötüleşmede göz doktoruna yönlendirmeli.

---

## 1. Evde sık tekrarlanan görme testleri — ne öğrendik?

### 1.1 AMD / makula hastalıkları

| Kaynak | Cihaz/Test | Örneklem | Sıklık | Temel sayısal bulgu |
|---|---|---|---|---|
| HOME çalışması (AREDS2-HOME; PubMed kaydında yazar alanı boş), 2014 (e-yayın 2013), *Ophthalmology* — DOI 10.1016/j.ophtha.2013.10.027, PMID 24211172 | ForeseeHome (PHP, hiperakuite perimetrisi) | 1520 katılımcı (763 cihaz / 757 standart bakım), ort. 1,4 yıl izlem | **Günlük test önerildi** | KNV tespitinde görme kaybı: cihaz kolu medyan −4 harf vs standart bakım −9 harf (P=0,021). Etkinlik nedeniyle erken sonlandırıldı. |
| Chew EY ve ark., 2014, *Contemp Clin Trials* — DOI 10.1016/j.cct.2014.02.003, PMID 24530651 | HOME çalışma tasarımı | — | — | Tasarım makalesi (55–90 yaş, yüksek riskli AMD). |
| Ho ve ark., 2021, *J Clin Med* — DOI 10.3390/jcm10071355, PMID 33806058 | ForeseeHome gerçek dünya | 8991 hasta, 3.200.999 test | **5,6 ± 3,2 test/hafta** | Dönüşüm anında medyan −3 harf; %81 gözde VA ≥20/40; tespitlerin %69'u sistem alarmıyla. |
| Yu ve ark., 2020, *Ophthalmol Retina* — DOI 10.1016/j.oret.2020.08.003, PMID 32810682 | ForeseeHome gerçek dünya (4 klinik) | 775 göz / 448 hasta | Üretici ≥3/hafta önerir | %83,7 en az bir kez kullandı; bunların %73,7'si baz değer oluşturdu; **%52,3 önerilen sıklığa uymadı**; %24,7 bir yıl içinde bıraktı. Bir merkezde 52 alarmın **47'si (%93,2) yanlış pozitif**, 3'ü (%6,8) gerçek dönüşüm. |
| Kaiser ve ark., 2013, *Retina* — DOI 10.1097/IAE.0b013e3182899258, PMID 23609122 | myVisionTrack (şekil ayrımı hiperakuitesi, iPhone 3GS) | 160 hasta (%64'ü ≥75 yaş), 16 hafta | **Günlük** + sistem hatırlatmaları | Günlük teste ortalama uyum **%84,7**; en az haftalık uyum ≈%98,9; >17.000 test, >9.000 hatırlatma. |
| Joseph ve ark. (Aphelion), 2023, *Ophthalmol Ther* — DOI 10.1007/s40123-023-00854-2, PMID 38015309 (tam metin okundu) | mVTx: **tumbling E**, Landolt C, kontrast, SDH — iPad, 40 cm, çenelik yok, 4AFC (4 E'den farklı olanı seç) | 122 hasta, ort. 67 yaş | Klinikte test–tekrar test | **Tumbling E test–tekrar test %95 LoA ±0,18 logMAR** (ort. fark +0,01); Landolt C ±0,23; SDH ±0,24; kontrast ±0,32 logCT. Uzak ETDRS'ye göre TE LoA ±0,35. Test öncesi **alıştırma testleri** yapıldı; "anlamlı öğrenme etkisi yok". %85 hızlı öğrendi; TE en kolay (%72); %75 TE'yi Landolt C'den kolay buldu. Test başına medyan süre **2,28–3,75 dk**. %34 "haftada 2 kez 11–15 dk"ya razı. |
| Hogg ve ark. (MONARCH), 2024, *JAMA Ophthalmol* — DOI 10.1001/jamaophthalmol.2024.0918, PMID 38662399; aynı çalışma HTA raporu DOI 10.3310/CYRA9912, PMID 39023220 | KeepSight Journal (kâğıt), MyVisionTrack, MultiBit (iPod) | 297 hasta (ort. 74,9 yaş) | **Haftalık istendi** | Gerçekleşen medyan sıklık **3 (IQR 1–4)/ay**. Tüm testlerde AUROC **<0,6** — aktif nAMD'yi yakalamada yetersiz doğruluk. |
| Reeves ve ark., 2024, *BMJ Open* — DOI 10.1136/bmjopen-2023-077196, PMID 38453199 | MONARCH uygulama sorunları | 297 | Haftalık | %46 yardım hattını aradı; 435 aramanın %90'ı uygulama/donanım kaynaklı; ekip 133 hastayı (%44) veri gelmediği için aradı. |
| Hogg ve ark., 2024, *TVST* — DOI 10.1167/tvst.13.3.2, PMID 38427348 | MONARCH eşitsizlik | — | Haftalık | Yaş arttıkça katılma isteği azaldı; en yoksun bölgeler katılmaya %47 daha az istekli (OR 0,53). |
| Faes L ve ark., 2021, *Eye* — DOI 10.1038/s41433-020-01356-2, PMID 33414531 | Alleye (akıllı telefon hiperakuite), 0–100 skor + trafik ışığı | 73 göz / 56 hasta, 2258 test | — | **Alarm = art arda 3 "kırmızı" skor**. Özgüllük %93,8; **yanlış alarm oranı %6,1**; PPV %80,0. |
| Islam M ve ark., 2021, *BMJ Health Care Inform* — DOI 10.1136/bmjhci-2020-100310, PMID 34035050 | Alleye | 245 hasta, 11.592 test (ort. 46,9/kullanıcı) | — | "Eşik alarmı" = 3 ardışık kırmızı; **>7 gün sürerse "kalıcı alarm"**. Alarm veren gözlerin %78,5'inde VA düşüşü/KMK artışı; kalıcı alarmlarda daha büyük kayıp (−4,79 harf). |
| Gross N ve ark., 2021, *BMJ Open* — DOI 10.1136/bmjopen-2021-056940, PMID 34949632 | Alleye (nAMD, **DMÖ**, diğer) | 514 göz (eşleştirilmiş) | — | Ev takibi yapanlarda ≥5 harf iyileşme olasılığı OR 1,67; yılda −0,99 enjeksiyon vizitesi; tedaviye daha uzun devam. |
| Faes L ve ark., 2022, *Eye* — DOI 10.1038/s41433-022-01959-x, PMID 35292773 | Alleye uzun dönem | 72 hasta | — | 18 ayda **retansiyon %73,6**; SUS medyan 90. Bırakanlar mobil cihazı günlük kullanmıyordu (OR 7,40). |
| Teo KYC ve ark., 2021, *Ophthalmol Retina* — DOI 10.1016/j.oret.2021.02.005, PMID 33610833 | Alleye, COVID dönemi (Singapur) | 2272 davet → 732 katılım (%32) | — | **Test uyumu %43** (315/732); 33 tetik olayı, 5 hastada doğrulanmış progresyon. |
| Mendall J ve ark., 2024, *Ophthalmol Ther* — DOI 10.1007/s40123-024-01020-y, PMID 39181973 | Alleye (DR, RVO dahil) | 89 hasta | — | Dijital dışlanma/yoksunluk ile uyum arasında ilişki bulunmadı; IVI gereken hastaların %87,5'inde uygulama kullanımı arttı. |
| Guigou S ve ark., 2021, *J Fr Ophtalmol* — DOI 10.1016/j.jfo.2020.09.034, PMID 34024655 | **OdySight** (tumbling E tabanlı VA + oyunlar) | 60 hasta | — | Dönüşüm (en az 1 test) %61; **9 ayda retansiyon yalnızca %24**; aktif hastaların %75'i oyun oynayanlar/50–70 yaş. VA düşüşü duyarlılık %92, özgüllük %99. |
| Adams ve ark., 2018, *TVST* — DOI 10.1167/tvst.7.5.32, PMID 30386684 | Tablet retina duyarlılığı, orta AMD | 38 | **Haftalık**; yarısına rastgele haftalık hatırlatma | 2. ayda yalnız %55 aktif. Hatırlatma alanlar **daha düzenli** test etti (6,6 ± 3,9 vs 8,7 ± 4,1 gün aralık, p=0,01) ama katılım oranını değiştirmedi (p=0,69). |
| Dieu AC ve ark., 2026, *Retina* — DOI 10.1097/IAE.0000000000004882, PMID 42138607 | Alleye, "time-in-range" (TIR) | 84 hasta / 149 göz | — | Diyabet bakımından uyarlanan **TIR** metriği: daha yüksek TIR → BCVA iyileşmesi ve KMK azalmasıyla ilişkili. Grafik tasarımı için yararlı kavram. |
| Dave S ve ark., 2024, *BMJ Open* — DOI 10.1136/bmjopen-2023-080619, PMID 39002965 | Odak grup (glokom + AMD; Alleye vb. denendi) | 15 kişi | — | Kaygılar: yüz yüze vizitin yerini alması, **endişe verici sonuç görmenin yarattığı anksiyete**, teknolojiye yetişememe. |
| Balaskas ve ark., 2023, *Eye* — DOI 10.1038/s41433-023-02479-y, PMID 36973405 | Derleme | — | — | 7 uygulama tabanlı görme testi belirlendi (4'ü düzenleyici onaylı). |
| Busquets MA & Sabbagh O, 2021, *Curr Opin Ophthalmol* — DOI 10.1097/ICU.0000000000000756, PMID 33710010 | Derleme (PHP, ev OKT) | — | — | Ev OKT'de hastaların >%90'ı analiz edilebilir görüntü elde etti. |

**"Home Vision Monitor"** ayrı bir ürün olarak aranmadı/bulunmadı; Aphelion tam metninde "myVisionTrack (mVT; or Home Vision Monitor)" ifadesi geçiyor, yani **aynı ürünün adı**.

### 1.2 Glokom ev izlemi

| Kaynak | Test | Örneklem | Sıklık | Bulgu |
|---|---|---|---|---|
| Jones PR ve ark., 2020, *Am J Ophthalmol* — DOI 10.1016/j.ajo.2020.08.039, PMID 32882222 | Eyecatcher (tablet perimetri) | 20 (medyan 71 yaş) | **Aylık** | Uyum **%98**; testlerin %9'unda MD medyandan >±3 dB sapma (anomali); ev verisinin eklenmesi ölçüm hatasını gözlerin %97'sinde azalttı, %90'ında yarıdan fazla. Medyan süre 4,5 dk. |
| Tan JCK ve ark., 2025, *Ophthalmol Glaucoma* — DOI 10.1016/j.ogla.2025.08.004, PMID 40865799 | Eyecatcher 3.0 vs HFA + simülasyon | 40 hasta (78 göz) | Haftalıktan 4-aylığa modellendi | Ev cihazının CoR'u daha kötü (6,37 vs 4,25 dB) **ama ayda 1 ev testi, 4 ayda 1 klinik testten daha fazla progresyon yakalar**. |
| Montesano G ve ark., 2026, *Br J Ophthalmol* — DOI 10.1136/bjo-2025-328016, PMID 41494811 | MRF-web (kişinin kendi bilgisayarı) | 100 | — | Daha yüksek test–tekrar test değişkenliği ve **anlamlı öğrenme etkisi**; 4 aylık MRF ≈ 6 aylık HFA gücü. |
| Huang (ilk yazar) ve ark., 2026, *Ophthalmol Glaucoma* — DOI 10.1016/j.ogla.2026.08.007, PMID 42697438 | Olleyes VR perimetri | 53 hasta | **Haftalık** | 4817 test; 24. ayda **%86,7 aktif**, ortalama >2 test/ay; süre 4,93 dk. |
| Freeman ve ark., 2023, *J Glaucoma* — DOI 10.1097/IJG.0000000000002296, PMID 37671465 | MRF tablet (haftalık evde) | 81 | Haftalık | ~3 ay sonra **günlük test etmeye istekli olanlar %23,5 → %9,9'a düştü**; aylık isteyenler %18,5 → %33,3'e çıktı. |
| Chauhan BC ve ark., 2008, *Br J Ophthalmol* — DOI 10.1136/bjo.2007.135012, PMID 18211935 | Görme alanı sıklık önerisi | — | — | 2 yılda 4 dB MD değişimini yakalamak için yılda 3 test gerekir (ortalama değişkenlikte). |
| Diğer: Rathore 2025 TVST (DOI 10.1167/tvst.14.8.7), Schweitzer 2025 Clin Ophthalmol (DOI 10.2147/OPTH.S523260), Berneshawi 2024 TVST (DOI 10.1167/tvst.13.8.7; iCare HOME'u %40 kullanamadı), Hu 2022 Ophthalmol Glaucoma (DOI 10.1016/j.ogla.2022.05.001), Jesus 2025 J Clin Med (DOI 10.3390/jcm14103317, 21 çalışmalık sistematik derleme). |

### 1.3 Diyabetik retinopati / DMÖ
Ayrı bir DR ev izlemi çalışması bulunmadı; DMÖ verisi Alleye çalışmalarının içinde: Gross 2021 (25 DMÖ gözü + 52 kontrol), Faes 2021 (nvAMD + DMÖ; yanlış alarm %6,1), Teo 2021 (katılım DMÖ'de %52 ile en yüksek), Mendall 2024 (DR/RVO).

### 1.4 Çıkarımlar (bölüm 1)
1. **Günlük test mümkün ama uyum çabuk erir**: kontrollü pilotta %84,7 (Kaiser 2013), gerçek dünyada yarısı önerilen sıklığa uymuyor (Yu 2020), klinik program %43 (Teo 2021), OdySight 9 ayda %24.
2. **Tek test = alarm değil**: Alleye "3 ardışık kırmızı" + ">7 gün kalıcı" kuralı yanlış alarmı %6'ya indirdi; ForeseeHome gerçek dünyada alarmların %93'ü yanlış pozitif. Kural tabanlı onay şart.
3. **Sık ama gürültülü test > seyrek ama temiz test** (Tan 2025, Montesano 2026, Jones 2020) — gürültü ortalama alarak telafi edilebilir.
4. Tumbling E, uygulama içi testler arasında **en kolay** bulunan ve **en iyi tekrarlanabilirliğe** sahip olandır (Aphelion).

---

## 2. Günlük tekrarda öğrenme etkisi ve gerçek değişimi gürültüden ayırma

### 2.1 Öğrenme / pratik etkisi kanıtı
- **Aphelion (Joseph 2023)**: alıştırma turundan sonra tumbling E test–tekrar testinde ortalama fark +0,01 logMAR → "anlamlı öğrenme etkisi yok" (aynı seans içi, günlük değil).
- **McMonnies CW**, *Clin Exp Optom* 84(1):26–34 — DOI 10.1111/j.1444-0938.2001.tb04932.x: 24 saat içinde tekrar ölçümde küçük ama anlamlı iyileşme bilinir; tek ölçümden 1 dk sonra hastalar ortalama **2,5 harfi** (0,7–4,7) hatırlıyor, düşük düzey harf-dizisi belleği **10 gün** sürüyor. → Sabit harf/yön dizisi kullanılırsa ezber skoru şişirir. Tumbling E'de yalnız 4 yön olduğundan "harf ezberi" yok, ama **sabit dizi** ezberlenebilir → her denemede rastgele yön.
- **Montesano 2026 (MRF-web)**: evde perimetride **anlamlı öğrenme etkisi**.
- **Wild JM ve ark., 1991**, *Acta Ophthalmol* — DOI 10.1111/j.1755-3768.1991.tb02713.x: naif hastalarda ilk seanslardaki öğrenme etkisi 5–15 ay sonraki izlemde görülmedi (öğrenme ilk seanslarda yoğun).
- **Kelly SA & Tomlinson A, 1987** — DOI 10.1002/j.2330-9512.1987.tb01293.x: 5 günlük tekrarda kontrast duyarlılığında ölçülebilir pratik etkisi yok (n=20), ama değişkenlik yüksek.
- **Astle AT, McGraw PV, Webb BS, 2011**, *Strabismus* — DOI 10.3109/09273972.2011.600420: normal görme sisteminde algısal öğrenme kazanımları **eğitilen uyarana son derece özgüdür**; ambliyopide daha geniş transfer (Huang CB ve ark., 2008, PNAS — DOI 10.1073/pnas.0800824105).
- **Levi DM, 2012** (Prentice Lecture), *Optom Vis Sci* — DOI 10.1097/OPX.0b013e318257a187: yetişkinlerde tekrarlı pratikle algısal öğrenme olur.
- **Bach M & Schäfer K, 2016**, *PLoS One* — DOI 10.1371/journal.pone.0147803, PMID 26824693: 40 kişi, FrACT 24 deneme; **doğru/yanlış geri bildirimi** keskinliği yalnızca 0,02 logMAR etkiledi, test–tekrar test LoA ±1,0 satır değişmedi; geri bildirimsiz koşul "hafif rahatsız edici", geri bildirimli koşullar "hafif rahat" (Likert'te 2 basamak fark).

**Bizim için kritik sonuç:** Uygulama bir *göz eğitimi* uygulaması. Eğitimde tumbling E benzeri yön/keskinlik görevleri kullanılırsa, testteki "iyileşme" kısmen **göreve özgü öğrenme** olabilir (Astle 2011). Bu nedenle: (a) eğitim uyaranı ile test uyaranını ayırın (ör. eğitimde Gabor/farklı optotip, testte tumbling E) ya da (b) grafikte "test performansı" dili kullanın, "görmeniz X satır iyileşti" demeyin. Bu, doğrudan tumbling E günlük tekrarında ölçülmüş bir bulgu değil; literatürden çıkarımdır — **doğrudan "günlük tumbling E tekrarı skoru şişirir mi" sorusunu ölçen bir çalışma bulunamadı.**

### 2.2 Önleme yöntemleri (kanıta dayalı + mantıksal)
- Her denemede **rastgele yön** (ezberlenebilir sabit dizi yok) — McMonnies'ten çıkarım.
- **Isınma/alıştırma turu**: Aphelion'da test öncesi alıştırma testleri yapıldı ve test–tekrar test yanlılığı ≈0 çıktı.
- **Başlangıç (baseline) dönemi**: öğrenme ilk seanslarda yoğun (Wild 1991, Montesano 2026) → ilk günleri baz değere katmayın.
- Adaptif algoritmanın başlangıç boyutu önceki sonuca göre değil sabit/geniş öncülle başlasın ya da öncül (prior) bilerek geniş tutulsun (yanlılığı azaltmak için; bu bir tasarım önerisidir, doğrudan kanıt yok).
- Geri bildirim verilebilir (Bach & Schäfer 2016) — sonuca etkisi ihmal edilebilir, rahatlığı artırır.

### 2.3 Gerçek değişim vs gürültü — sayılar
| Kaynak | Bulgu |
|---|---|
| Arditi A & Cagenello R, 1993, *IOVS* 34(1):120–9, PMID 8425819 | En iyi koşulda ETDRS keskinliği ±0,1 log birim içinde; **anlamlı değişim için ≈±0,14 log birim** gerekir (5 deneyimli denek, 78 test–tekrar test çifti). |
| Siderov J & Tiu AL, 1999, *Acta Ophthalmol Scand* — DOI 10.1034/j.1600-0420.1999.770613.x, PMID 10634561 | Klinik koşulda tekrarlanabilirlik ≈±1,5 satır; gerçek değişim için **≥0,15 logMAR (8 harf)**. |
| Rosser DA ve ark., 2003, *IOVS* — DOI 10.1167/iovs.02-1100, PMID 12882770 | ETDRS'de **≥0,2 logMAR (2 satır)** değişim %95'ten yüksek duyarlılık ve özgüllükle ayırt edilir; **0,1 logMAR ayırt edilemez**. %95 TRV eşiği kullanmak duyarlılığı ≈%50'ye düşürür. |
| Laidlaw DAH ve ark., 2003, *BJO* — DOI 10.1136/bjo.87.10.1232, PMID 14507755 | Harf-harf puanlamada TRV: ETDRS 0,14; cRLM 0,17; Snellen 0,29 logMAR (ambliyop çocuk, n=43). |
| Joseph 2023 (Aphelion) | Tablet **tumbling E: ±0,18 logMAR** (klinikte, denetimli). |
| Roberts TL ve ark., 2026, *Optom Vis Sci* 103(4) — DOI 10.1002/ovs2.70040 (Scholar Gateway) | 452 çocuk, **evde** iPhone uygulaması: ≥20/40 gözlerde evde uygulama test–tekrar test LoA **±0,24**; ≤20/50 gözlerde ±0,33; evde altın standarda göre ≤20/50'de LoA ±0,50 — **ev koşulu ve kötü görmede gürültü belirgin artar**. |
| Bach M, 2007, *Graefes Arch* — DOI 10.1007/s00417-006-0474-4, PMID 17219125 | FrACT, **18 deneme**: süre 1,7 dk, tekrar üretilebilirlik **±0,2 logMAR**; yüksek güvenilirlik için daha fazla deneme önerilir. |
| Bastawrous A ve ark., 2015, *JAMA Ophthalmol* — DOI 10.1001/jamaophthalmol.2015.1468, PMID 26022921 | Peek Acuity (300 yetişkin, Kenya): TRV ±0,033 logMAR; süre 77 sn. (Not: çok dar bir değer; denetimli saha koşulu.) |

**İstatistik araçları (öneri — kaynak: yukarıdaki TRV verileri + standart ölçüm teorisi):**
- **Tekrarlanabilirlik katsayısı (CoR)** = 1,96·√2·Sw ≈ 2,77·Sw. Aphelion ±0,18 → Sw ≈ 0,065 logMAR; ev ±0,24 (Roberts 2026) → Sw ≈ 0,087.
- **En küçük saptanabilir değişim (SDC/MDC95)**: tek test için ≈ CoR → evde **≈0,2–0,25 logMAR**. Yani tek günlük sonuçla 1 satırlık değişim iddia edilemez (Rosser 2003 ile uyumlu).
- **Ortalama alma**: n bağımsız testin ortalamasının SD'si Sw/√n. 7 günlük ortalama (Sw=0,087) → 0,033; iki haftalık ortalama farkı için %95 eşik ≈ 1,96·√2·0,033 ≈ **0,09 logMAR**. Bu, bağımsızlık varsayımına dayanan bir hesaptır (günler arası gerçek dalgalanma — yorgunluk, ışık, mesafe — eşiği büyütür). → Pratik eşik: haftalık medyanlarda **≥0,1 logMAR**.
- **Olay analizi vs trend analizi**: Viswanathan AC, 2011, *Acta Ophthalmol* 89(s248) — DOI 10.1111/j.1755-3768.2011.2355.x: olay analizi (baz değere karşı karşılaştırma) ve trend analizi (tüm serinin doğrusal regresyonu) iki ana yaklaşım. Chong LX ve ark., 2015, *OPO* — DOI 10.1111/opo.12184: noktasal doğrusal regresyonda duyarlılık, test sayısı arttıkça belirgin yükselir (%90 özgüllükte 4. vizitte %8–17 → 12. vizitte %87–93).
- **Ardışık onay kuralı**: Alleye'nin "3 ardışık kırmızı" ve ">7 gün kalıcı" kuralı (Faes 2021; Islam 2021) sahada doğrulanmış, basit ve anlaşılır.
- **CUSUM**: Oftalmolojide ev keskinliği için doğrulanmış bir CUSUM çalışması **bulunamadı** (PubMed'de yalnızca cerrahi öğrenme eğrisi için CUSUM: Vedana 2017, *Int J Ophthalmol* — DOI 10.18240/ijo.2017.07.11). Genel yöntem (endüstriyel süreç izleme kaynağında görüldü: Zhou ve ark., 2026, *steel research int.* — DOI 10.1002/srin.202500997): C⁺ₜ = max(0, C⁺ₜ₋₁ + (Xₜ − μ₀ − k)), referans değer k genellikle δ/2; eşik (h) aşılınca alarm. Bizde X = standartlaştırılmış günlük logMAR sapması; k ve h **kendi verimizle kalibre edilmeli** (varsayım, kanıt değil).
- **Time-in-range** (Dieu 2026): kişinin kendi bandında geçirdiği gün oranı — grafikte anlaşılır bir özet metrik.

---

## 3. Günlük kısa test mi, haftalık uzun test mi?

Kanıt özeti:
- Günlük: HOME/ForeseeHome günlük önerdi (etkinlik kanıtı en güçlü çalışma; HOME, Ophthalmology 2014); gerçek dünyada ortalama 5,6/hafta (Ho 2021). Kaiser 2013'te günlük uyum %84,7 (16 hafta, destekli pilot).
- Haftalık: MONARCH haftalık istedi → gerçekleşen **ayda 3** (Hogg 2024). Glokom VR haftalık → 24 ayda %86,7 aktif ama ayda >2 test (Huang 2026).
- Hasta tercihi: 3 ay sonra günlük teste istekli olanlar %23,5 → %9,9 (Freeman 2023); %34'ü haftada 2 kez 11–15 dk'ya razı (Aphelion).
- Alışkanlık: Lally P ve ark., 2009/2010, *Eur J Soc Psychol* 40(6):998–1009 — DOI 10.1002/ejsp.674 (96 gönüllü, 84 gün, **aynı bağlamda günlük** davranış): otomatikleşmeye ulaşma **18–254 gün** (medyan davranış türüne göre 59–91 gün); **tek bir günü kaçırmak süreci bozmadı**.
- İstatistik: gürültülü ama sık ölçüm + ortalama, seyrek ölçümden daha erken değişim yakalar (Tan 2025; Jones 2020; Chauhan 2008 mantığı).

**Sonuç:** "Kısa ve sık" daha iyi — ama "her gün zorunlu" değil. Hedef: **günlük ≤2 dk hızlı test** (esnek; haftada ≥3–4 geçerli test yeterli kabul edilir) + **haftada 1 "tam test"** (daha çok deneme, her iki göz ayrı, daha dar güven aralığı). Karar ve grafik haftalık medyan üzerinden verilir; tek günlük sonuç yalnızca ham nokta olarak gösterilir.

---

## 4. Tumbling E'nin telefonda uygulanması

### 4.1 Optotip ve 4AFC
- Tumbling E ekranlarda doğrusal hatları nedeniyle Landolt C'ye göre daha kolay üretilir; Alexander KR & McAnany JJ, 2010, *Optom Vis Sci* — DOI 10.1097/OPX.0b013e3181c61117: küçük boyutta TE, Landolt C'ye göre ≈0,1 log birim daha kötü keskinliğe karşılık gelir.
- Plainis S ve ark., 2013, *Optom Vis Sci* — DOI 10.1097/OPX.0b013e31827ce251: tumbling E ve Landolt C, Sloan harf çizelgesine göre ortalama **daha kötü** keskinlik verir; LoA'lar geniş → **uygulama skorunu ETDRS/doktor ölçümüyle birebir karşılaştırmayın**; kişinin kendi baz değerine göre izleyin.
- **4AFC → tahmin olasılığı %25.** Carkeet A, 2001, *Optom Vis Sci* — DOI 10.1097/00006324-200107000-00017: AFC formatı (∞, 26, 10, 8, 4, 2) ve sonlandırma kuralı logMAR skorunun **ortalamasını ve SD'sini anlamlı etkiler**; formata göre farklı sonlandırma kuralı optimaldir. → Psikometrik fonksiyonda γ=0,25 (tahmin) ve küçük bir "lapse" parametresi kullanılmalı.
- Bach M, 1996, *Optom Vis Sci* — DOI 10.1097/00006324-199601000-00008 (FrACT): kendi kendine uygulanan otomatik test; 8 yönlü Landolt C, **Best PEST**, sabit deneme sayısında sonlanır; piksel sınırları için **anti-aliasing** ile küçük optotiplerde çözünürlük 4 kat iyileştirildi (Bach 1997, *Spatial Vision* — DOI 10.1163/156856897x00087).

### 4.2 Adaptif algoritmalar ve deneme sayısı
| Algoritma | Kaynak | Bulgu |
|---|---|---|
| QUEST (Bayesçi) | Watson AB & Pelli DG, 1983, *Percept Psychophys* 33(2):113–20 — DOI 10.3758/bf03202828, PMID 6844102 | Önsel + her denemeden sonra olasılık yoğunluğunu güncelleyen Bayesçi eşik yöntemi. |
| ZEST / QUEST varyantları | King-Smith PE ve ark., 1994, *Vision Res* — DOI 10.1016/0042-6989(94)90039-6, PMID 8160402 | Sonraki uyaranı **ortalamaya (ZEST)** koymak medyan ve moddan daha kesin; Minimum Varyans yöntemi biraz daha iyi; 20 denemeye kadar tam hesapla doğrulandı. |
| Best PEST (FrACT) | Bach 2007 (yukarıda) | **18 deneme ≈1,7 dk → ±0,2 logMAR**; post-hoc eğim fitlemesi değişkenliği azaltmadı; güvenilirlik için daha çok deneme önerilir. Bach & Schäfer 2016: **24 deneme → ±1,0 satır (±0,1 logMAR)** (normal gönüllüler). |
| qVA (aktif öğrenme, eşik + aralık) | Zhao Y ve ark., 2021, *TVST* — DOI 10.1167/tvst.10.1.1, PMID 33505768 | 14 göz, 4 Bangerter folyo koşulu: yanlılıksız, yüksek kesinlik; E-ETDRS ve FrACT ile yüksek korelasyon. Lu ZL ve ark., 2023, *Sci Rep* — DOI 10.1038/s41598-023-43913-1: **15 sıra (45 optotip) qVA**, ETDRS'den daha fazla beklenen bilgi kazancı. Zhao 2021 *TVST* — DOI 10.1167/tvst.10.12.18: hiyerarşik Bayes modeli 0,15 logMAR değişimi %95 doğrulukla saptamak için **3 sıra daha az** gerektirdi. |
| Merdiven (staircase) | Stewart CE ve ark., 2006, *OPO* — DOI 10.1111/j.1475-1313.2006.00407.x | Çocuklarda bilgisayarlı merdiven yöntemi tekrarlanabilirliği 0,13 vs ETDRS 0,11 log birim. |

Pratik sonuç: **tek göz için ~20–30 deneme** (Bayesçi, 4AFC) makul; 18 denemede ±0,2, 24 denemede ±0,1 logMAR civarı tekrarlanabilirlik (normal gözlerde, kontrollü ortam). Süre: FrACT 18 deneme ≈1,7 dk; Aphelion testleri medyan 2,3–3,8 dk; Peek 77 sn.

### 4.3 Kaydırma (swipe) mı buton mu?
**Doğrudan karşılaştıran bir çalışma bulunamadı** (PubMed + Scholar Gateway taraması). Görülen uygulamalar: FrACT — yön düzeninde yerleştirilmiş fiziksel tuşlar (Bach 1996); Huoyan uygulaması — optotip altında yön butonları (Xian Y ve ark., 2022, *Clin Exp Ophthalmol* — DOI 10.1111/ceo.14194); Aphelion — 4 optotipten farklı olana dokunma. Öneri (kanıt değil, tasarım): **varsayılan büyük 4 yön butonu (E'nin açık ucunun yönünü gösteren)** + isteğe bağlı kaydırma; yaşlı kullanıcılar ve titreme için geniş dokunma alanı; yanlış dokunuşu "bilmiyorum/geç" tuşundan ayırın. Yakın mesafe (40 cm) telefon testinde mesafe kontrolü kritik: Aphelion çenelik kullanmadı ve bunun değişkenliği artırabileceğini sınırlılık olarak belirtti.

---

## 5. Hatırlatma ve takvim — davranış kanıtı

| Kaynak | Bulgu |
|---|---|
| Bell L ve ark., 2023, *JMIR mHealth uHealth* — DOI 10.2196/38342, PMID 37294612 (MRT, 350 kullanıcı, 30 gün, 20:00 bildirimi) | Bildirim almak, sonraki 1 saatte uygulamayı açma olasılığını **3,5 kat** artırdı (%95 GA 2,91–4,25); etki zamanla anlamlı değişmedi; **ama** bildirimsiz / sabit / rastgele bildirim kolları arasında **uzun dönem kopma süresi farkı yok**. Zaten etkileşimdeyken bildirim etkisi azalma eğiliminde. |
| Bell L ve ark., 2020, *JMIR* — DOI 10.2196/23369, PMID 33306026 (19.233 kullanıcı) | Günlük 11:00 bildirimi sonraki saatte etkileşimle güçlü ilişkili; kullanıcıların **%50'si 22. günde kopmuş** (≥7 gün kullanmama); %56,7 "hızlı kopan". |
| Bell L ve ark., 2020, *JMIR Res Protoc* — DOI 10.2196/18690, PMID 32763878 | Bildirim saati 11:00'den 20:00'e taşındı (kullanıcının ilgili davranışa yakın an gerekçesiyle). |
| Klasnja P ve ark. (HeartSteps), 2019, *Ann Behav Med* — DOI 10.1093/abm/kay067, PMID 30192907 (44 yetişkin, 6 hafta) | Öneriler **kullanıcının seçtiği 5 zaman noktasında**; başlangıçta +%66 adım etkisi, **zamanla azaldı** (alışma/habituation). |
| Walton A ve ark., 2018, *Clin Pharmacol Ther* — DOI 10.1002/cpt.1079 | Push bildirimleri kişiyi böler; **yük ve kopmaya** yol açabilir; zamanlama optimize edilmeli. |
| Adams 2018 (yukarıda) | Haftalık hatırlatma test düzenliliğini artırdı, katılımı artırmadı. |
| Kaiser 2013 (yukarıda) | Sistem hatırlatmalarıyla günlük uyum %84,7. |
| Jäckle A ve ark., 2023, *Fiscal Studies* — DOI 10.1111/1475-5890.12351 | Günlük 17:00 push + tamamlanmadıysa 20:00'de ikinci hatırlatma; bazı katılımcılar hatırlatmaları görmedi; **bildirim izninin verilip verilmediğini gözlemleyemediler**. |
| Mei X ve ark., 2025, *J Nurs Manag* — DOI 10.1155/jonm/9923240 (16 RKÇ meta-analizi, romatizmal) | Alt grupta **günlük hatırlatmalı** EMI'ler ağrı ve yaşam kalitesinde daha büyük etki. |
| Lally 2009/2010 (yukarıda) | Sabit **bağlam ipucu** ("kahvaltıdan sonra") ile günlük tekrar alışkanlık yapar; tek gün kaçırmak zarar vermez. |
| Judah G ve ark., 2012, *Br J Health Psychol* — DOI 10.1111/j.2044-8287.2012.02086.x | Mevcut rutine bağlanan davranış (diş fırçalamadan **sonra** diş ipi) daha güçlü alışkanlık oluşturdu. |

**Kişinin seçtiği saat vs sabit saat:** İkisini doğrudan karşılaştıran RKÇ **bulunamadı**. Dolaylı kanıt: HeartSteps kullanıcı seçimli zamanlar kullandı; Lally/Judah rutine bağlı ipucunu destekliyor; Drink Less saati davranışa yakın ana kaydırdı. → Varsayılan: kullanıcı kendi saatini ve **rutin ipucunu** seçer.

**.ics (takvime ekleme) için davranışsal kanıt bulunamadı** — yalnızca teknik uygulanabilirlik doğrulandı (bölüm 6).

---

## 6. Teknik doğrulama (web/PWA)

### 6.1 iOS/iPadOS Web Push
- **iOS/iPadOS 16.4** ile **Ana Ekrana eklenmiş web uygulamalarında** Web Push (Push API + Notifications API + Service Worker); bildirimler kilit ekranı, Bildirim Merkezi ve eşlenmiş Apple Watch'ta görünür; **Odak (Focus)** ile entegre; ayrıca **Badging API** desteği. İzin isteği **doğrudan kullanıcı etkileşimine yanıt olarak** (ör. "abone ol" butonuna dokunma) yapılmalı; izin, Ayarlar > Bildirimler'de uygulama bazında yönetilir.
  Kaynak: WebKit Blog, "Web Push for Web Apps on iOS and iPadOS" — https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ (WebSearch sonuç özeti üzerinden; sayfa doğrudan açılamadı).
- MDN browser-compat-data `api/PushManager.json` (Context7 ile ham JSON görüldü): `safari_ios.version_added: "16.4"`, not: **"Notifications are supported in web apps saved to the home screen."**; `webview_ios: false`; Safari macOS 16 (bildirim macOS Ventura+).
- MDN (Context7, `mdn/content`): iOS 16.4+ PWA'lar Safari, Chrome, Edge, Firefox ve Orion'un Paylaş menüsünden kurulabilir; iOS 16.3 ve öncesi yalnız Safari. Badge: iOS/iPadOS 16.4+ Safari'de desteklenir.
- **Declarative Web Push**: Safari 18.4 / iOS 18.4 / iPadOS 18.4 — service worker gerektirmeden abonelik ve görünür bildirim; "bildirim göstermeme" cezası yok. Kaynak: WebKit Blog "Meet Declarative Web Push" — https://webkit.org/blog/16535/meet-declarative-web-push/ ve "WebKit Features in Safari 18.4" — https://webkit.org/blog/16574/webkit-features-in-safari-18-4/ (WebSearch özeti).

### 6.2 Android Chrome
- BCD `PushManager`: Chrome 42+, `chrome_android: mirror` (Context7 ham JSON).
- Android'de yalnız GMS'li cihazlarda Chrome ve Samsung cihazlarda Samsung Internet PWA'yı **WebAPK** olarak kurar (MDN "Making PWAs installable", Context7).
- WebAPK ile kurulan uygulamalara kurulumda bildirim izni otomatik verilmez; **çalışma zamanında istenmeli** (web.dev WebAPKs — https://web.dev/webapks — WebSearch özeti).
- Android'de Badging API Chromium'da desteklenmez; okunmamış bildirim varsa Android kendisi rozet gösterir (MDN, Context7).
- Tüm tarayıcılar push olaylarının **kullanıcıya görünür bildirim** üretmesini şart koşar (`userVisibleOnly: true`) (MDN, Context7).
- İzin isteği kullanıcı etkileşimine (ör. click handler) bağlanmalı (MDN Notifications API, Context7).

### 6.3 Notification Triggers API (yerel zamanlanmış bildirim)
- Chrome for Developers sayfası (Context7 üzerinden): `showTrigger: new TimestampTrigger(...)`; özellik tespiti `'showTrigger' in Notification.prototype`; durum: **açıklayıcı (explainer) ve origin trial aşamaları tamamlandı, tam lansmana geçilmedi**; yerelde yalnızca "Experimental Web Platform features" bayrağıyla denenebilir. WebSearch sonucu: origin trial Chrome 83'e kadar planlanmıştı (https://developer.chrome.com/blog/new-in-chrome-80, https://groups.google.com/a/chromium.org/g/blink-dev/c/xOTmlUxPj7A/m/X7E-BmYwCQAJ).
- **Sonuç: Üretimde kullanılamaz.** Web'de "her gün 20:00'de hatırlat" için **sunucu tarafı zamanlanmış Web Push** (kullanıcı saat dilimine göre cron) gerekir; iOS'ta da Safari desteği yok.
- Periodic Background Sync (MDN, Context7): `periodic-background-sync` izni gerekir; tarayıcı sıklığı kullanıcı etkileşimine bağlayabilir, az kullanılan uygulamaya **hiç olay gelmeyebilir** → hatırlatma için güvenilir değil.

### 6.4 .ics ile tekrarlayan takvim etkinliği
- RFC 5545: `RRULE` içinde `FREQ` zorunlu ve bir kez; `FREQ=DAILY` günlük tekrar; `VALARM` bileşeni `ACTION` ve `TRIGGER` içermeli; TRIGGER varsayılan DURATION (ör. `-PT15M` = 15 dk önce) ya da UTC DATE-TIME. Kaynaklar (WebSearch): https://icalendar.org/iCalendar-RFC-5545/3-6-6-alarm-component.html, https://icalendar.org/iCalendar-RFC-5545/3-8-6-3-trigger.html, https://datatracker.ietf.org/doc/html/rfc5545.
- iPhone Safari: `.ics` bağlantısına dokununca olaylar gösterilir, **"Tümünü Ekle"** ile takvime eklenir (kaynaklar ikincil/blog düzeyinde: https://www.text-2-ics.com/blog/how-to-import-ics-files-into-apple-calendar, https://discussions.apple.com/thread/7685661). **Ana Ekran'a eklenmiş (standalone) PWA içinden .ics indirmenin davranışı doğrulanamadı** → cihazda test edilmeli; gerekirse bağlantıyı Safari'de açtırın.
- Google Takvim şablon bağlantısı: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=BAŞLANGIÇ/BİTİŞ&recur=RRULE:FREQ=DAILY` — `recur` parametresi `RRULE:` önekiyle; değerler URL-encode (kaynak: resmi Google dokümanı değil, topluluk dokümanı — https://interactiondesignfoundation.github.io/add-event-to-calendar-docs/services/google.html). Resmî belge olarak doğrulanamadı.
- Örnek (öneri):
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GozEgitimi//TR
BEGIN:VEVENT
UID:gunluk-test-<kullaniciId>@ornek.app
DTSTAMP:20260924T080000Z
DTSTART;TZID=Europe/Istanbul:20260925T203000
DURATION:PT5M
RRULE:FREQ=DAILY
SUMMARY:Göz eğitimi + 2 dk görme testi
URL:https://ornek.app/test
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Günlük görme testi zamanı
TRIGGER:PT0M
END:VALARM
END:VEVENT
END:VCALENDAR
```
(TZID kullanılıyorsa VTIMEZONE bileşeni eklenmesi RFC 5545 gereğidir; bu ayrıntı ayrıca doğrulanmalı.)

---

## 7. Günlük test protokolü önerisi (süre, deneme sayısı, sıklık, değişim eşiği)

Bu bölüm yukarıdaki kanıtların sentezidir; kanıtın bittiği yerde "tasarım varsayımı" olarak işaretlenmiştir.

**A. Kurulum (bir kez)**
- Ekran kalibrasyonu (fiziksel boyut) + **sabit test mesafesi 40 cm** (Aphelion ile aynı); parlaklığı yükseltme talimatı; gözlük/lens kullanımı kaydı. *(Mesafe/ekran kalibrasyon yöntemi bu raporda araştırılmadı — ayrı doğrulama gerekir.)*
- Optotip: tumbling E, 4 yön, anti-aliasing (Bach 1996/1997); logMAR ölçeği.

**B. Günlük "hızlı test" (hedef ≤2 dk toplam)**
- Monoküler; göz sırası günlere göre değişsin (öğrenme/yorgunluk sırası etkisini dengelemek — Aphelion sırayı randomize etti).
- Her oturum başında **2–3 büyük E ile ısınma** (puanlanmaz) — Aphelion alıştırma turu.
- Her göz için **~20 deneme** (4AFC, γ=0,25, küçük lapse), **QUEST/ZEST** (King-Smith 1994: ortalama kuralı); geniş öncül. Beklenen tek-seans tekrarlanabilirliği ≈±0,2 logMAR (Bach 2007: 18 denemede ±0,2).
- Yön her denemede rastgele (McMonnies 2001).
- Doğru/yanlış geri bildirimi açık (Bach & Schäfer 2016).
- "Göremiyorum" butonu (yanlış yönde tahmin yerine) — tasarım varsayımı; algoritmada yanlış cevap olarak işlenir.

**C. Haftalık "tam test" (≈3–4 dk)**
- Her göz **~30–40 deneme** (Bach & Schäfer 2016: 24 denemede ±0,1 logMAR; qVA 45 optotip — Lu 2023). Baz değer ve eğilim kararlarında ağırlığı daha yüksek.

**D. Sıklık**
- Hedef: günlük; **geçerli kabul: haftada ≥3 hızlı test + 1 tam test**. Freeman 2023 ve MONARCH (ayda 3) göz önüne alındığında "her gün zorunlu" dayatılmamalı; kaçırılan gün cezalandırılmamalı (Lally: tek gün kaçırmak alışkanlığı bozmaz).

**E. Baz değer ve öğrenme dönemi**
- İlk **7 gün** (en az 5 test) "tanışma dönemi": grafikte gri; baz değere dahil değil (Wild 1991, Montesano 2026 — öğrenme ilk seanslarda).
- **Baz değer = 8–21. günlerdeki testlerin medyanı** (≥6 test). Kişisel Sw bu dönemdeki dağılımdan tahmin edilir.

**F. Değişim eşikleri (göz başına)**
- Tek test: hiçbir mesaj üretmez (ev TRV ±0,24 — Roberts 2026; Rosser 2003: 0,1 ayırt edilemez).
- **Sarı ("tekrar test et")**: 7 günlük medyan baz değerden **≥0,10 logMAR kötü** VE son **3 ardışık** test baz+0,10'un üstünde (Alleye "3 ardışık kırmızı" mantığı — Faes 2021).
- **Kırmızı ("göz doktoruna danışın")**: 7 günlük medyan **≥0,20 logMAR kötü** (Rosser 2003: ≥0,2 güvenilir ayırt edilir) ve **≥7 gün sürüyor** (Islam 2021 "kalıcı alarm"), YA DA tek gözde ani belirgin kayıp + kullanıcı semptom bildirimi. Metin tanı koymaz, randevu önerir. (Dave 2024: endişe verici sonuçların anksiyete yaratması — dil sakin olmalı.)
- **"İyileşme" gösterimi**: yalnızca 2 haftalık medyan baz değerden **≥0,10 logMAR iyi** ise; etiket "test performansınız" (göreve özgü öğrenme ihtimali — Astle 2011).
- Opsiyonel ileri analiz: standartlaştırılmış sapmalar üzerinde tek yönlü CUSUM (k≈0,5σ, h≈4–5σ) — **oftalmolojide doğrulanmamış, kendi verimizle kalibre edilmeli**.

**G. Grafik**
- Günlük ham noktalar soluk; **7 günlük medyan çizgisi** kalın; baz değer ± SDC bandı gölgeli; göz başına ayrı seri; "bantta geçen gün oranı" (TIR — Dieu 2026) özet kartı; tanışma dönemi gri.

---

## 8. Hatırlatma/takvim tasarım kuralları

1. **Saati kullanıcı seçer, rutine bağlar**: onboarding'de "Hangi günlük alışkanlığınızdan sonra?" (ör. akşam dişlerden sonra) + saat seçimi (Lally 2009/2010; Judah 2012; HeartSteps kullanıcı seçimli zamanlar). Varsayılan öneri verilebilir ama sabit dayatılmaz. (Kişi-seçimi vs sabit saati karşılaştıran RKÇ bulunamadı.)
2. **Günde en fazla 1 bildirim**; test bugün zaten yapıldıysa gönderme (Bell 2023: zaten etkileşimdeyken etki düşer). İkinci hatırlatma yalnızca kullanıcı açıkça isterse (Jäckle 2023'teki 17:00+20:00 modeli seçenek olarak).
3. **Alışma (habituation) yönetimi**: 3+ gün üst üste yok sayılan bildirimde sıklığı azaltma/“haftalık özet”e geçmeyi öner; mesaj metinlerini döndür (Klasnja 2019 etkinin zamanla azalması; Bell 2023 yeni mesaj bankası standart mesaj kadar etkili).
4. **Bildirim tek başına uzun dönem bağlılığı çözmez** (Bell 2023: kopma süresinde fark yok; Bell 2020: %50 kopma 22. günde) → değer gösterimi (grafik, haftalık özet), kısa test süresi ve oyunlaştırma (OdySight'ta oyun oynayanlar aktif kalanların çoğunluğu — Guigou 2021) birlikte tasarlanmalı.
5. **İzin isteme zamanı**: ilk testi tamamlayıp ilk sonucu gördükten sonra, bir butona dokunma ile (iOS 16.4 kuralı + MDN). Sayfa açılışında otomatik izin isteme yok.
6. **iOS akışı**: Web Push yalnız Ana Ekran'a eklenmiş PWA'da → "Ana Ekrana Ekle" rehberi (Safari/Chrome/Edge/Firefox Paylaş menüsü, iOS 16.4+) ; eklenmemişse **.ics / takvim** yedeğini öner. iOS 18.4+ için Declarative Web Push değerlendirilebilir.
7. **Zamanlama altyapısı**: Notification Triggers stable değil, Periodic Background Sync güvenilir değil → **sunucu tarafı zamanlanmış Web Push** (kullanıcının IANA saat dilimi saklanır, yaz saati değişimine dikkat). Push her zaman görünür bildirim üretmeli (`userVisibleOnly`).
8. **Takvim yedeği (.ics)**: "Takvime ekle" butonu → `RRULE:FREQ=DAILY` (veya kullanıcı seçimine göre `FREQ=WEEKLY;BYDAY=...`) + `VALARM` (TRIGGER PT0M) + test sayfasına `URL`; sabit `UID` ile güncellenebilir. Google Takvim için `action=TEMPLATE&recur=RRULE:...` bağlantısı. iOS standalone PWA içinden .ics davranışı cihazda test edilmeli.
9. **Eğitim takvimi**: eğitim oturumu ile test ayrı etiketlensin; test tercihen eğitimden **önce** (eğitim sonrası yorgunluk/ısınma etkisini ayırmak için — tasarım varsayımı, kanıt yok).
10. **Seri (streak) cezası yok**: kaçırılan gün "zincir kırıldı" demez; haftalık hedef (≥3 test) gösterilir (Lally: tek kaçırma zararsız; Freeman 2023: günlük isteklilik düşüyor).
11. **Alarm dili**: sakin, eyleme dönük ("Sonuçlarınız son 7 günde düştü; yarın tekrar test edin" / "Düşüş sürüyor; bir göz doktoruna görünmenizi öneririz"); asla tanı ifadesi yok (Dave 2024 anksiyete bulgusu).
12. **Sessiz saatler ve kolay kapatma**: gece saatlerinde bildirim yok; bildirim içinden "ertele/bugün atla"; ayarlarda tek tıkla kapatma (Walton 2018: push yükü kopmaya yol açabilir). iOS'ta Focus entegrasyonu zaten var (WebKit).

---

## 9. Bulunamayan / doğrulanamayan noktalar (dürüstlük listesi)
- Günlük tumbling E tekrarının skoru ne kadar şişirdiğini doğrudan ölçen çalışma yok.
- Swipe vs buton yanıtını karşılaştıran çalışma yok.
- Kullanıcı seçimli vs sabit bildirim saatini karşılaştıran RKÇ yok; .ics kullanımının uyuma etkisine dair kanıt yok.
- Ev görme keskinliği için doğrulanmış CUSUM eşikleri yok.
- webkit.org / developer.chrome.com / web.dev / MDN sayfaları doğrudan açılamadı; bilgiler WebSearch özetleri ve Context7 aracılığıyla görülen kaynak dosyalardan alındı.
- Standalone iOS PWA içinden .ics açılışı ve Google Takvim `recur` parametresi resmî belgeyle doğrulanmadı.
- Telefon ekranı fiziksel boyut kalibrasyonu ve 40 cm mesafe doğrulama yöntemleri bu raporun kapsamı dışında kaldı.
