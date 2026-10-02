# 08 — Ölçüm Ek Taraması: Akıllı Telefonla Görme Ölçümü ve Göz Takibi (boşluk doldurma)

**Tarih:** 2026-09-24
**Kapsam:** 06_olcum.md taramasının bıraktığı 6 boşluk
**Araçlar:** Scholar Gateway (semanticSearch; Wiley/OPO/CXO/OVS ağırlıklı korpus), PubMed MCP (search + metadata + PMC tam metin), WebSearch (yalnız sonuç özetleri; WebFetch ağ proxy'si tarafından engellendi: arxiv.org, research.google, springer, ncbi erişilemedi).

**Kaynak güvenilirlik etiketi:**
- **[PM]** PubMed metadata/özet araçtan görüldü (PMID + DOI doğrulandı)
- **[PM-TT]** PubMed Central tam metni okundu
- **[SG]** Scholar Gateway pasajı/özeti görüldü (DOI araçtan)
- **[WS]** Yalnızca WebSearch sonuç özeti görüldü; tam metin okunamadı, rakamlar ikincil. Ürün kararından önce doğrulanmalı.

---

## Özet tablo

| # | Boşluk | Durum | En önemli bulgu |
|---|---|---|---|
| 1 | Kamera ile yakın nokta / NPC validasyonu | **Kısmen** | Ön kamerayla yüz-cihaz mesafesi ölçüp hedefi yeniden ölçekleyen push-up uygulaması presbiyop eklentisini (addition) klinikle karşılaştırmış: R²=0.82, fark −0.22±0.38 D, LoA ±0.74 D (n=20). Presbiyop olmayanlarda akomodasyon amplitüdü için ve TrueDepth/iris tabanlı NPC için klinik validasyon **bulunamadı**. |
| 2 | Push-up'ta açısal boyutu sabit tutmak | **Kapandı** | Aynı başlangıç boyutunda sabit açılı elektronik push-up, klasik push-up'tan medyan 1.14 D daha düşük AA veriyor (n=20 alt grup), yine de objektif ölçümden ~5 D yüksek kalıyor. Tekrarlanabilirlik değişmiyor (1.80 D ve 1.77 D). |
| 3 | Mobil ekranda düşük kontrast | **Kısmen** | iPad + bit-stealing ile 0.1 log adım −2.2 logC'ye kadar güvenilir, 0.05 log adım yalnız −1.7'ye kadar. Cihaz başına kalibrasyon gerekiyor. **Telefon OLED + 10-bit için psikofizik validasyon bulunamadı.** |
| 4 | Zamanlama (60/120 Hz, kare düşmesi) | **Kısmen** | Metal ile yazılmış native iOS uygulamasında basit uyaranlarda 0 kare düşmesi ölçüldü. Kare düşmesi yalnızca 120 Hz iPad Pro'da karmaşık uyaranda görüldü. Web tarayıcıda 100 ms'ye kadarki kısa süreler güvenilmez. **ProMotion'ın değişken yenileme hızı ile ilgili validasyon bulunamadı.** |
| 5 | Ön kamera göz takibi mühendisliği | **Büyük ölçüde kapandı** | Kalibrasyonsuz ~1.7 cm (telefon). Yaklaşık 30 sn kişisel kalibrasyonla 0.46 cm, yani 25–40 cm'de 0.6–1°. EyeLink'e karşı 1.32° / 1.20°. ARKit ile kalibrasyonsuz göz ölçümünde %23 hata. **Gözlüğün etkisini sayısal olarak veren telefon çalışması bulunamadı.** |
| 6 | Tablette MNREAD | **Kapandı** (iPad, Türkçe dahil). Telefonda **kısmen** | MNREAD-TR tablet sürümünde RA ve CPS basılı kartla eşdeğer. Maksimum okuma hızı ise tablette belirgin düşük (233 → 169 wpm). Bunun nedeni zamanlama yöntemi. |

---

## 1. Kamera tabanlı YAKIN NOKTA (NPA) / YAKIN KONVERJANS NOKTASI (NPC) validasyonu

### 1.1 Doğrudan ilgili çalışmalar

**Salmerón-Campillo RM, Diaz-Guirado JA, Martinez-Ros G, Jaskulski M, López-Gil N. (2025). *Preliminary evaluation of smartphone-based addition measurement in a presbyopic population.* J Optom 18(3):100561. PMID 40516221, DOI 10.1016/j.optom.2025.100561 [PM]**
- Yöntem: Katılımcılar binoküler push-up ile yakın noktayı buluyor. Uyaran mavi ve yüz-cihaz mesafesine göre yeniden ölçekleniyor. Mesafe telefonun **ön kamerasıyla** ölçülüyor. Referans olarak deneme lensleriyle 0–2.75 D arası 12 düzeyde yetersiz veya aşırı eklenti oluşturulmuş.
- Örneklem: n=20 presbiyop, 52–64 yaş, her koşulda 3 ölçüm.
- Metrikler: R² = 0.82. Bland-Altman ortalama fark −0.22 ± 0.38 D, LoA ±0.74 D. Ölçümlerin %61.7'si 0.25 D, %82.5'i 0.50 D içinde.
- Sınırlılıklar: Ölçülen şey akomodasyon amplitüdü değil, eklenti. Örneklem küçük. Yazarlar Visionapp Solutions S.L. ile bağlantılı (çıkar çatışması riski).

**Salmerón-Campillo RM, Jaskulski M, Lara-Cánovas S, González-Méijome JM, López-Gil N, Mrugacz M. (2019). *Novel Method of Remotely Monitoring the Face-Device Distance and Face Illuminance Using Mobile Devices: A Pilot Study.* J Ophthalmol. PMID 31281665, DOI 10.1155/2019/1946073 [PM][SG]**
- Yöntem: Yüz landmark'ları arası piksel mesafesi, 60 cm veya 200 cm'de alınan tek bir kalibrasyonla (K sabiti) cm'ye çevriliyor. Test optik bench üzerinde, 10 cm adımlarla yapılmış.
- Metrikler: Mesafe hatası ≤5 mm. Bu, 40 cm'de <0.03 D vergence hatası demek. Vergence uyumu 60 cm kalibrasyonla yaklaşık 0.01 D ortalama ve ~±0.05 D 95% sınır, 200 cm kalibrasyonla ~0.02 D ve ~±0.04 D. Pasajdaki işaretler bozuk geldiği için bu değerler yaklaşık.
- Ek bulgu: Tabletin ortam ışık sensörü yüz aydınlığını olduğundan düşük ölçüyor. Eğim 0.292, düzeltme katsayısı ×3.425.
- Sınırlılık: Pilot çalışma. Çene desteği ve optik bench ile yapıldı, serbest el kullanımı test edilmedi.

**Salmeron-Campillo RM, Martinez-Ros G, Diaz-Guirado JA, Travel-Alarcon C, Jaskulski M, Lopez-Gil N. (2025). *Accuracy and precision of a sphero-cylindrical over-refraction app for smartphones.* Ophthalmic Physiol Opt 45(7):1662–1675. DOI 10.1111/opo.13560 [SG]**
- n=307, yaş 22.5±3.4. 7 iOS/Android telefon, piksel yoğunluğu 391–476 dpi.
- Uyaran, ön kameranın 15 fps görüntülerinden landmark'larla (ör. çene–alın) üçgenleme ile hesaplanan mesafeye göre dinamik olarak yeniden ölçekleniyor.
- Tüm güç vektörlerinde bias <0.25 D. LoA, klinik subjektif refraksiyondan en fazla 0.25 D daha geniş.
- OLED mavi ve kırmızıda LCA −0.67 D ve +0.22 D olarak alınmış.
- Tartışmada "akıllı telefonla yakın nokta ölçümü" patentli bir yöntem olarak anılıyor ve çalışmanın kapsamı dışında bırakılıyor. **Yakın nokta validasyonu bu makalede yok.**

**Su et al. (2025). *Innovative myopic screening platform based on smartphones.* Front Bioeng Biotechnol. PMID 41190285, DOI 10.3389/fbioe.2025.1678800 [PM]**
- Göz-ekran mesafesi, ön kamerada görüntülenen **iris çapından** hesaplanıyor. Ölçülen şey uzak nokta (miyopi).
- n=230 (460 göz), 7–40 yaş.
- LoA: S 0.11 ± 0.89 D, C −0.03 ± 0.82 D, SER 0.10 ± 0.89 D. AUC 0.973–0.986.
- Önemi: İris çapıyla mesafe ölçümü klinik bir sonuç ölçütüne karşı dolaylı olarak doğrulanmış. Ancak bu yakın nokta değil.

**Linder SM, Koop MM, Tucker D, Guzi K, Gray DC, Alberts JL. (2021). *Development and Validation of a Mobile Application to Detect Visual Dysfunction Following Mild Traumatic Brain Injury.* Mil Med 186(Suppl 1):584–591. PMID 33499531, DOI 10.1093/milmed/usaa360 [PM]**
- iPad (iOS 11) uygulamasıyla NPC ölçülmüş. n=50 sağlıklı genç yetişkin. Testi optometrist uygulamış.
- r = 0.893 (iPad ve klinik NPC), r = 0.947 (iPad ve eşzamanlı cetvel).
- Sınırlılık: Yalnızca korelasyon raporlanmış, Bland-Altman/LoA yok. Özette iPad'in mesafeyi nasıl ölçtüğü (kamera mı, başka yöntem mi) belirtilmemiş. Tam metin görülmedi.

**Salvador-Roger R, Esteve-Taboada JJ, Venkataraman AP, Domínguez-Vicent A. (2025).** Ayrıntılar Bölüm 2'de. Burada telefon cetvele sabitlenmiş, mesafe cetvelden okunuyor, yani kamera kullanılmıyor.

### 1.2 Kamera ile mesafe ölçümünün doğruluğu (NPA/NPC'ye altyapı)

| Kaynak | Yöntem | Doğruluk |
|---|---|---|
| Nissen et al. 2023, *Sensors* 23(9):4486. PMID 37177690, DOI 10.3390/s23094486 [PM] | ARKit + TrueDepth, göz-telefon mesafesi. Robot kol, sabit baş, farklı açılar | Gerçek mesafeden %0.88–9.07 hata. Baş boyutu, pozisyon, cihaz modeli ve **sıcaklık** doğruluğu etkiliyor |
| Hamilton-Fletcher et al. 2024, *IEEE Open J Eng Med Biol*. PMID 38487094, DOI 10.1109/OJEMB.2024.3358562 [PM] | CoreML, IR grid (ön kamera), LiDAR, ARKit (ön ve arka), 1–3 m | Merkezde <±2.5 cm, CoreML 2–3 m'de ±5.2–6.2 cm. Çevrede IR_self ±32 cm, CoreML ±41 cm |
| MediaPipe Iris, Google Research blog 2020 [WS] | İris yatay çapı 11.7±0.5 mm varsayımı, iPhone 11 derinlik sensörüne karşı, >200 katılımcı | Ortalama göreli hata %4.3 (SD %2.4). **Gözlükle %4.8 (SD %3.1)**. Hakemli yayın değil |
| Ablavatski A, Vakunov A, Grishchenko I, Raveendran K, Zhdanovich M. 2020, arXiv:2006.11341 [WS] | Face mesh ile pupil takibi | Telefonda >50 FPS. Mesafe doğruluğu bu makalede değil, blogda |

**Hesap (bizim çıkarımımız, kaynakta yok):** Yakın nokta ~10 cm (10 D) iken %4 mesafe hatası ~0.4 cm eder. Bu yaklaşık **±0.4 D** amplitüd hatasına karşılık gelir. 25 cm'de (4 D) ise ~±0.16 D. Yani göreli hata sabitse, dioptri hatası yakın noktada kabaca amplitüdle orantılı büyür.

### 1.3 Referans noktası sorunu (kritik)

**Marusic S, Vyas N, Wu CH, Raghuram A. (2024).** *Ophthalmic Physiol Opt* 44(6):1084–1090. DOI 10.1111/opo.13344 [SG]
- n=70, medyan yaş 13.
- NPC'yi lateral kantustan ölçmek, alından ölçmeye göre ortalama **1.8 cm** daha yüksek değer veriyor. AA'da kantus ile kaş arası fark **1.5 cm**.
- Normlara göre başarısızlık oranı NPC'de %39'dan %76'ya, AA'da %7'den %40'a çıkıyor.
- **Uygulama için sonuç:** Kamera/TrueDepth mesafeyi tipik olarak kornea/iris düzleminden veya yüz yüzeyinden ölçer. Klinik normlar ise gözlük düzlemi, alın veya kaş referanslı. Hangi referansın kullanıldığı açıkça belirtilmeli ve normlarla karşılaştırmadan önce sabit bir ofset düzeltmesi uygulanmalı.

### 1.4 Bulunamayanlar
- TrueDepth, iris çapı veya yüz landmark'ı ile ölçülen **akomodasyon amplitüdünü presbiyop olmayan kişilerde** klinik push-up veya minus lens ile Bland-Altman yöntemiyle karşılaştıran hakemli çalışma **bulunamadı**.
- **Kamera ile NPC** (kırılma ve toparlanma noktası) ölçen ve RAF cetveli/klinik ile LoA raporlayan çalışma **bulunamadı**. Linder 2021 yalnızca korelasyon veriyor ve yöntemi belirsiz.

---

## 2. Push-up'ta hedefin açısal boyutunu sabit tutmanın etkisi

**Salvador-Roger R, Esteve-Taboada JJ, Venkataraman AP, Domínguez-Vicent A. (2025). *Subjective and objective measurements of the amplitude of accommodation: Revisiting the existing methods and clinical evaluation of newer techniques.* Ophthalmic Physiol Opt 45(3):761–768. DOI 10.1111/opo.13482 [SG]**
- n=81, yaş 25±5, %82 kadın. 5 yöntem, her biri 3 tekrar. Yöntemler: PU (push-up), EPU (elektronik push-up: cetvele sabit telefon, 0.50 logMAR optotip, **açısal boyut sabit**), MLPh (foropterde minus lens), MLTL (ayarlanabilir lensle minus lens) ve TR (Tonoref III, objektif).
- Medyan AA: EPU 10.51 D (IQR 9.09–12.00), bu en yüksek değer. TR 5.29 D (IQR 0.94–8.46), en düşük. MLTL 6.48 D, MLPh 7.25 D.
- **Tekrarlanabilirlik limiti:** PU 1.77 D, EPU 1.80 D, MLPh 1.38 D, MLTL 0.67 D, TR 1.39 D.
- **Süre:** EPU en hızlısı, medyan 12.3 s. MLPh 57.3 s.
- **Aynı başlangıç boyutuyla alt analiz (n=20, ikisinde de 0.50 logMAR):** EPU 10.55 ± 2.42 D, PU 12.62 ± 4.68 D. PU−EPU farkının medyanı **1.14 D** (IQR −0.14 ile 5.11 D).
- Yorum: Açısal boyutu sabit tutmak, hedefin büyümesinden gelen şişmeyi yaklaşık 1 D azaltıyor ve dağılımı daraltıyor (SD 4.68'den 2.42'ye). Ancak subjektif push-up yine de objektif ölçümden çok yüksek kalıyor, bunun nedenleri derinlik odağı ve bulanıklık kriteri. Tekrarlanabilirliği iyileştirmiyor.

**Sergienko NM, Nikonenko DP. (2015). *Measurement of amplitude of accommodation in young persons.* Clin Exp Optom 98(4):359–361. DOI 10.1111/cxo.12278 [SG]**
- n=155, 8–25 yaş. 5–40 cm arası her mesafede 6/6 görme keskinliğine karşılık gelen sabit açılı Landolt C'ler kullanılmış, elektron ışını litografisiyle üretilmiş.
- Amplitüdler, Donders/Duane gibi tarihsel değerlerden **belirgin şekilde düşük** çıkmış. Sonuç: sabit açılı hedef push-up doğruluğunu artırabilir.

**Atchison DA, Capper EJ, McCabe KL. (1994). *Critical Subjective Measurement of Amplitude of Accommodation.* Optom Vis Sci 71(11):699–706. DOI 10.1002/j.1538-9235.1994.tb03427.x [SG]**
- n=60, 25–45 yaş. Sabit N5 baskı yakın noktada kişiden kişiye farklı açısal boyutlar oluşturuyor. Bu nedenle eşik keskinliğe yakın "kritik" yöntemler önerilmiş, dioptrik ölçekli kart tasarlanmış. Özette sayısal fark görülmedi.

**Somers WW, Ford CA. (1983).** *Am J Optom Physiol Opt* 60(11):920–924. DOI 10.1002/j.2330-9512.1983.tb00615.x [SG]
- Göreceli mesafe büyütmesinin etkisi: push-up, Badal optometreye göre **0.6 D daha fazla** amplitüd veriyor (32–40 yaş).

**Destekleyici bulgular [SG]:**
- Chen A, O'Leary 1998, *Clin Exp Optom* 81(2):63–71, DOI 10.1111/j.1444-0938.1998.tb06628.x: Modifiye push-up, konvansiyonele göre monokülerde 0.40 D, binokülerde 1.30 D düşük.
- Chen Y et al. 2019, *Clin Exp Optom* 102(4):412–417, DOI 10.1111/cxo.12884: Bulanıklık kriteri tek başına ~2 D fark yaratıyor. Modifiye PU "ilk kalıcı bulanıklık" kriteriyle 11.34±2.07 D, "okunamaz" kriteriyle 13.48±2.94 D. Objektif ölçüm 9.01±1.49 D.

**Sonuç:** Mesafeye göre yeniden ölçekleme, literatürde hedef büyümesinden kaynaklı ~0.6–1.1 D'lik sistematik şişmeyi azaltan bir yöntem olarak destekleniyor. Ancak kriter tanımı ("ilk kalıcı bulanıklık" mı "okunamaz" mı) ve optotip boyutu en az bu kadar büyük etki yapıyor.

---

## 3. Mobil ekranlarda düşük kontrast (dithering, bit-stealing, 10-bit, gamma, OLED)

| Kaynak | Cihaz/Yöntem | Sayısal bulgu |
|---|---|---|
| Rodríguez-Vallejo M, Monsoriu JA, Furlan WD. 2016, *Optom Vis Sci* 93(12):1532–1536. PMID 27560848, DOI 10.1097/OPX.0000000000000972 [PM][SG] | 6 adet retina ekranlı iPad, kolorimetre, bit-stealing ile 256'dan 2540 düzeye | Aynı model iPad'ler arasında luminans anlamlı farklı (p<0.0005). **0.1 log adım 0 ile −2.2 logC arasında güvenilir.** 0.05 log adım yalnızca 0 ile −1.7 arasında. ≤0.05 log adım için cihaz başına kalibrasyon şart |
| Wit GC. 2023, *Optom Vis Sci* 100(4):271–275. DOI 10.1097/OPX.0000000000002009 [SG] | 4 IPS LCD, 256 gri düzeyin tamamı ölçüldü, gamma fitiyle karşılaştırıldı | logCS<1.2'de hata kabul edilebilir (≪0.15 log). **logCS>1.5'te hata >0.15 log olabiliyor.** Gamma fiti yerine her gri düzey ayrı ölçülmeli. 10-bit ekranlar dithering ihtiyacını azaltabilir ama test edilmedi |
| To L, Woods RL, Goldstein RB, Peli E. 2013, *Vision Res* 90:15–24. PMID 23643843, DOI 10.1016/j.visres.2013.04.011 [PM] | Fotometresiz psikofizik kalibrasyon: doygunluk tespiti, gamma, bit-stealing için kanal oranları | LCD ve CRT'de fotometreyle doğrulanmış. **%0.5 kontrasta kadar** harf CS testi mümkün |
| Kingsnorth A, Drew T, Grewal B, Wolffsohn JS. 2016, *Clin Exp Optom* 99(4):350–355. DOI 10.1111/cxo.12362 [SG] | iPad, taranan frekanslı CSF, bit-stealing ile 8'den 11 bite (LS-110 ile doğrulandı) | n=20. CoR yakın 0.26–0.37, uzak 0.34–0.39 log. Pelli-Robson 0.14. Uygulama basılı testten **daha yüksek** CS veriyor (p<0.001). Süre 53±15 s |
| Dorr et al. 2013, *IOVS*. PMID 24114545, DOI 10.1167/iovs.13-11743 [PM] | iPad qCSF | n=4 (CRT karşılaştırması) + 6. CoR 0.14–0.40 log. CRT ile fark <0.05 log |
| Kollbaum PS et al. 2014, *Optom Vis Sci* 91(3):291–296. PMID 24413274, DOI 10.1097/OPX.0000000000000158 [PM] | iPad harf CS, logCS 0.1'den 2.3'e (%0.5) | n=20 normal + 20 az gören. Tekrar LoA ±0.19 (az görende ±0.24). Freiburg ile LoA ±0.24. Pelli-Robson daha düşük değer veriyor |
| Aslam et al. 2013, *J R Soc Interface*. PMID 23658115, DOI 10.1098/rsif.2013.0239 [PM] | iPad fiziksel karakterizasyon | Açıldıktan sonra luminansın oturması **15 dakikaya kadar** sürüyor. Kenarlarda ve açılı bakışta luminans düşüyor. Çok düşük kontrast gösterilemeyebilir |
| Hsu C, Ou-Yang M. 2026, *J Soc Inf Disp* 34(7):615–625. DOI 10.1002/jsid.70035 [SG] | **OLED akıllı telefon** paneli (endüstri) | Parlaklık 12-bit DBV ile kontrol ediliyor. En düşük parlaklıkta beyaz ~2 cd/m². Tek gamma mimarisinde koyu tonlarda etkin çözünürlük **~8-bit'e düşüyor**. Çoklu gamma ~10-bit koruyor. **Sıcaklıkla gamma kayıyor** |
| Dimigen O, Stein A. 2026, *Behav Res Methods* 58(6). PMID 42115564, DOI 10.3758/s13428-026-03034-9 [PM] | 240 Hz OLED **masaüstü monitör** | CRT benzeri geçiş süreleri. **ABL (otomatik parlaklık sınırlama)**: luminans aydınlık piksel oranına göre değişiyor. Uzun süre gösterilen yüksek kontrastlı uyaranlar lokal ısınma ile iz bırakıyor |
| Abu Haila T et al. 2025, *J Vis* 25(2):11. PMID 40009394, DOI 10.1167/jov.25.2.11 [PM] | Tüketici OLED monitör/TV | Bazı kritik deneyler için yeterli. Sonuçlar firmware ayarlarına bağımlı |
| Marin-Campos R et al. 2020 (StimuliApp), *Behav Res Methods* 53(3):1301–1307. PMID 33037602, DOI 10.3758/s13428-020-01491-4 [PM-TT] | iOS native, noise-bit yöntemi | Tutarlı luminans için **Auto-Brightness, True Tone ve Night Shift kapatılmalı**. Luminans modele göre tablodan alınıyor, cihazlar arası sapma olabilir |

**Bulunamayanlar:**
- **Akıllı telefon OLED ekranında** düşük kontrastlı psikofizik testi fotometreyle doğrulayan hakemli çalışma **bulunamadı**. OLED bulguları monitör veya endüstri kaynaklı.
- 10-bit (Display P3 / EDR) telefon ekranının CS testi için dithering'e eşdeğer olduğunu gösteren validasyon **bulunamadı**.
- OLED telefonların düşük parlaklıktaki PWM titreşiminin psikofizik sonuçlara etkisi **bulunamadı**.

---

## 4. Mobil ekranlarda zamanlama doğruluğu (60/120 Hz, kare düşmesi, 34–150 ms)

**Marin-Campos R, Dalmau J, Compte A, Linares D. (2020). *StimuliApp: Psychophysical tests on mobile devices.* Behav Res Methods 53(3):1301–1307. PMID 33037602, DOI 10.3758/s13428-020-01491-4 [PM-TT]**
- Metal (GPU) ile native iOS/iPadOS uygulaması. Test cihazları: iPad 6. nesil, iPhone X, iPad Pro 10.5" (60 ve 120 Hz). Her test 120 s × 10 kez.
- **Basit psikofizik uyaranlarda tüm platformlarda sıfır kare düşmesi.** Kare düşmesi yalnızca **iPad Pro'da 120 Hz'de karmaşık uyaranlarla** görülmüş. Aynı uyaranlar 60 Hz'de düşme yapmamış.
- Ses: 100 ms'lik 1000 uyaranda ortalama 100 ms, SD <1 ms (osiloskop). Görsel-işitsel asenkroni cihaza göre −10 ile +10 ms arasında, SD <1 ms (fotodiyot).
- Dokunma örnekleme hızı 120 Hz, iPad Pro'larda 240 Hz. Dokunma yanıtının zamanlama doğruluğu test **edilmemiş**.
- Bir karenin süresi 60 Hz'de 16.67 ms, 120 Hz'de 8.33 ms. Kare içi hesap bu süreyi aşarsa kare düşer.

**Linares D, Marin-Campos R, Dalmau J, Compte A. (2018). *Validation of motion perception of briefly displayed images using a tablet.* Sci Rep 8:16056. PMID 30375459, DOI 10.1038/s41598-018-34466-9 [PM]**
- n=13. Kısa süreli gösterilen görüntülerde hareket ayırt etme tahminleri tablet ve CRT'de benzer.

**Pronk et al. (2020). *Mental chronometry in the pocket? Timing accuracy of web applications on touchscreen and keyboard devices.* Behav Res Methods. PMID 31823223, DOI 10.3758/s13428-019-01321-2 [PM]**
- Web uygulamaları, dokunmatik ve klavyeli cihazlar. Kontrollü koşulda uyaran zamanlaması çok doğru, RT orta doğrulukta ve **sistematik olarak fazla ölçülüyor**.
- Kontrolsüz koşulda **100 ms'ye kadarki kısa süreler daha az doğru**. Cihaz farkı bireysel farkları ölçmenin güvenirliğini etkileyebilir.

**Schatz P, Ybarra V, Leitner D. (2015).** *Assessment* 22(4):405–410. PMID 25612627, DOI 10.1177/1073191114566622 [PM]
- Uyaran ile dokunma arası gecikme hatası: Nexus ve Samsung tabletlerde **81–97 ms**, Kindle Fire ve iPad'de **27–33 ms**. iOS 7, iOS 6'dan iyi. Basit RT'de hata payı %12–40.

**Roussel et al. (2025).** *Sensors* 25(19):6072. PMID 41094896, DOI 10.3390/s25196072 [PM]
- 5 Android cihazdan yalnız **2'si** yeterli hassasiyette.
- 120 Hz dokunma çözünürlüğü 8.33 ms. Dokunmatik + ivmeölçer birleştirilince 4 ms. n=20 davranış deneyi.

**Bridges D, Pitiot A, MacAskill MR, Peirce JW. (2020). *The timing mega-study.* PeerJ 8:e9414. PMID 33005482, DOI 10.7717/peerj.9414 [PM]**
- Masaüstü ve online, >110.000 deneme. Laboratuvar yazılımlarında ortalama hassasiyet <1 ms. Online (PsychoPy/Gorilla) ise ms'ye yakın.
- Öneri: **Her araştırmacı kendi uyaran/donanım kombinasyonu için zamanlamayı ölçmeli.**

**Garaizar P, Reips UD. (2019).** *Behav Res Methods* 51(3):1441–1453. PMID 30276629, DOI 10.3758/s13428-018-1126-4 [PM]
- GPU hızlandırmalı tarayıcılarda CSS animasyonunda kare kaybı yok. requestAnimationFrame çoğu durumda kayıpsız, ama her durumda değil.

**34–150 ms değerlendirmesi (bizim sentezimiz):**
- Native uygulama, 60 Hz ve sabit kare sayısında (34 ms ≈ 2 kare, 50 ms = 3, 150 ms = 9) basit uyaranlar için kanıt olumlu: StimuliApp ve Linares 2018.
- Web ve Android'de kanıt zayıf: Pronk 2020, Roussel 2025.
- **Bulunamadı:** ProMotion/LTPO **değişken yenileme hızının** uyaran süresine etkisi (iOS'un kareyi 120 Hz yerine 80/60/24 Hz'e düşürmesi) ve telefon OLED'lerde fotodiyotla ölçülmüş 34–150 ms süre doğruluğu.

---

## 5. Akıllı telefon ön kamerasıyla göz takibi (mühendislik literatürü)

### 5.1 Doğruluk

| Kaynak | Donanım/Yöntem | Örneklem | Doğruluk |
|---|---|---|---|
| Krafka K, Khosla A, Kellnhofer P, Kannan H, Bhandarkar S, Matusik W, Torralba A. 2016, *CVPR*, s. 2176–2184 [WS] (DOI görülmedi) | iTracker CNN, GazeCapture veri seti | >1450 kişi, ~2.5M kare | Kalibrasyonsuz **1.71 cm (telefon) / 2.53 cm (tablet)**. Kalibrasyonla 1.34 / 2.12 cm. 10–15 fps |
| Valliappan N et al. 2020, *Nat Commun* 11:4553. PMID 32917902, DOI 10.1038/s41467-020-18360-5 [PM-TT] | Hafif ConvNet (170K parametre), GazeCapture + ince ayar + kişiye özel SVR. Pixel 2 XL, 30 Hz | 26 kişi (doğruluk testi), toplamda >100 | Temel model 1.92±0.20 cm. **~100 kare (<30 s) kalibrasyonla 0.46±0.03 cm**, en iyi kişide 0.23, en kötüde 0.75 cm. 25–40 cm'de **0.6–1°**. Tobii Pro Glasses 2 ile karşılaştırma (n=13): standda 0.42 / 0.55 cm, elde 0.50 / 0.59 cm |
| Zhu G et al. 2025, *Behav Res Methods* 57(7):202. PMID 40533681, DOI 10.3758/s13428-025-02718-y [PM] | 7.4M yüz görüntüsüyle eğitilmiş DNN | N=32, EyeLink ile karşılaştırma | **Doğruluk 1.32° (EyeLink 1.20°). Hassasiyet 0.177° (EyeLink 0.028°)** |
| Zhu G et al. 2024, *Int J Intell Syst* 2024(1). DOI 10.1155/2024/2644725 [SG] | MGazeNet + MVO–SVR kalibrasyonu, ZJUGaze (3.2M görüntü) | 119 katılımcı, 19'u test | GazeCapture'da 1.59 cm, kendi setinde 1.48 cm. **≤13 noktalı kalibrasyonla 0.89 cm (~1.42°, 36 cm'de)**. Veri yalnız kapalı ortamda toplanmış |
| Arakawa R, Goel M, Harrison C, Ahuja K. 2022, *ICMI '22* (RGBDGaze). DOI 10.1145/3536221.3556568 [WS] | RGB + TrueDepth derinlik füzyonu | Bir kişi dışarıda bırakılarak değerlendirme | **1.89 cm**. Yalnız RGB ile 2.26 cm (%16.3 iyileşme) |
| Brousseau B, Rose J, Eizenman M. 2020, *Sensors* 20(2):543. PMID 31963823, DOI 10.3390/s20020543 [PM] | **IR aydınlatmalı prototip** telefon, 3B model + CNN | 8 | Elde serbest tutulurken 0.72° bias |
| Brousseau B et al. 2018, *Vision* 2(3):35. PMID 31735898, DOI 10.3390/vision2030035 [PM] | IR prototip, R-Roll kompanzasyonu | – | 90° cihaz dönmesinde yeni yöntemle ~1°, dönme sabit varsayılırsa 3.5° |

### 5.2 ARKit lookAtPoint / ARKit göz transformları
- **Greinacher R, Voigt-Antons JN. 2020**, *Accuracy Assessment of ARKit 2 Based Gaze Estimation*, HCII 2020, LNCS 12181. DOI 10.1007/978-3-030-49059-1_32 [WS]. iPhone XR, kalibrasyon sonrası serbest baş hareketi. Doğruluk **3.18° (ekranda 1.44 cm)**. Rakamlar yalnızca arama özetinden, tam metin görülmedi.
- **Parker TM et al. 2022**, *Front Neurol* 13:789581. PMID 35370913, DOI 10.3389/fneur.2022.789581 [PM]. ARKit ile **kalibrasyonsuz** göz ve baş pozisyonu, duvardaki hedefler. Göz hatası **%23** (yatay %17, dikey %27), baş hatası %15. Göz hassasiyeti 1.3°, baş 0.8°. Yazarlar kalibrasyon kaydı eklenmesini öneriyor.
- Apple'ın lookAtPoint için yayımladığı resmi doğruluk değeri **bulunamadı**.

### 5.3 MediaPipe iris
- Babaria R et al. 2026, *Front Neurol* 17:1860824. PMID 42553253, DOI 10.3389/fneur.2026.1860824 [PM]. iPhone ön kamerası ≤40 cm, **MediaPipe** özellikleri, simüle skew deviasyonu. Spearman 0.93 (0.90–0.95). ≥5 PD skew için AUC 0.90.
- MediaPipe Iris ile mesafe hatası %4.3, gözlükle %4.8 [WS, blog]. Bkz. Bölüm 1.2.
- MediaPipe iris landmark'larının piksel veya derece cinsinden hakemli doğruluk validasyonu **bulunamadı**.

### 5.4 Gözlük, ışık, kalibrasyon süresi
- **Kalibrasyon süresi:** Valliappan 2020'de <30 s (~100 kare) ile hata 1.92 cm'den 0.46 cm'ye iniyor. Zhu 2024'te ≤13 nokta ile 0.89 cm. Valliappan'da her blok başında yeniden kalibrasyon yapılmış.
- **Gözlük:** Valliappan 2020, en iyi sonuç için katılımcıların "gözlüksüz, normal görüşlü" olmasını öneriyor (yansıma nedeniyle). Fuhl W et al. 2017, *J Eye Mov Res* 10(3), PMID 33828657, DOI 10.16910/jemr.10.3.1 [PM], gözlüğü göz takibinin ana zorluğu olarak tanımlıyor ve nüfusun ~%30'unun dışlanamayacağını belirtiyor. Kir ve toz odak dışındaysa etkisi küçük. **Telefon ön kamera takibinde gözlüklü ve gözlüksüz doğruluğu sayısal karşılaştıran hakemli çalışma bulunamadı.** Tek sayısal veri MediaPipe Iris mesafesinde %4.3'ten %4.8'e artış [WS].
- **Işık:** Valliappan 2020'ye göre karanlık oda, parlak ışık, arkadaki pencere ve yansıtıcı ekran başarısızlık nedeni. Hagihara H et al. 2024, *Behav Res Methods* 56(7):7374–7390, PMID 38693440, DOI 10.3758/s13428-024-02424-1 [PM] (webcam): yüz tespiti en çok **ışık kaynağının yönünden**, bakış kodlama doğruluğu ise **kameraya mesafe ve ışıktan** etkileniyor.
- **Poz:** Aşağı bakışta göz kısmen kapandığı için hata artıyor. Eğim, dönme ve uzak tutma performansı düşürüyor (Valliappan 2020).
- **Örnekleme hızı:** Valliappan 2020'de 30 Hz. Bu hızda sakkad latansı, hızı ve fiksasyon süresi hassas ölçülemez.

---

## 6. Tablet/telefonda MNREAD tarzı okuma testlerinin validasyonu

| Kaynak | Test | Örneklem | Bulgu |
|---|---|---|---|
| Calabrèse A, To L, He Y, Berkholtz E, Rafian P, Legge GE. 2018, *J Vis* 18(1):8. PMID 29351351, DOI 10.1167/18.1.8 [PM] | MNREAD iPad uygulaması ve basılı kart | 165 normal + 43 az gören | Normallerde CPS ve RA benzer. **MRS iPad'de daha yavaş**: 100 wpm'de %3, 150'de %6, 200'de %9, 250'de %12. Az görende MRS, ACC ve CPS eşdeğer, RA iPad'de 0.03 logMAR daha iyi. MRS farkı **zamanlama yönteminden** kaynaklanıyor |
| **Altınbay et al. 2022, *Turk J Ophthalmol*.** PMID 35770299, DOI 10.4274/tjo.galenos.2021.33581 [PM] | **MNREAD-TR** basılı ve tablet uygulaması | 116 (92 normal, 24 az gören) | Normallerde RA ve CPS farksız (p=0.083, 0.075). Az görende RA ve ACC farksız. **MRS: normalde 233.1±34.7'ye karşı 169.3±23.4 wpm, az görende 93.2±50.2'ye karşı 68.2±34.7 wpm (p<0.001)** |
| Labiris et al. 2020, *Eye Vis* 7. PMID 33102611, DOI 10.1186/s40662-020-00216-0 [PM] | DDART (Yunanca dijital MNREAD). Metin boyutu kalibrasyonu, ses kaydıyla otomatik zamanlama | 100 (70 normal, 30 az gören) | Normallerde ICC 0.854–0.963. Az görende RA 0.986, ACC 0.894, MRS 0.794, CPS 0.723. Test-tekrar ICC 0.903–0.956. Normallerde MRS ve ACC basılı kartta daha yüksek |
| Almaliotis et al. 2022, *Clin Optom*. PMID 35942276, DOI 10.2147/OPTO.S370215 [PM] | **Akıllı telefon** GDRS (rastgele kelimeler) | 105 görme bozukluğu olan + 32 normal göz | MNREAD ile orta düzey korelasyon (r=0.589 ve 0.617). Test-tekrar uyumu iyi |
| Varadaraj et al. 2020, *Ophthalmic Epidemiol*. PMID 33185485, DOI 10.1080/09286586.2020.1846758 [PM] | Tablet VA, CS ve yakın keskinlik (MNRead'e karşı) | 82, ≥55 yaş | Yakın keskinlik farkı −0.09±0.12 logMAR, LoA −0.34 ile 0.14, r=0.67. CS LoA −0.36 ile 0.14 logCS |
| Xu R, Bradley A. 2015, *Ophthalmic Physiol Opt* 35(5):500–513. DOI 10.1111/opo.12233 [SG] | IURead, bilgisayar tabanlı | – | Kalın Helvetica, x-yüksekliğine göre açısal kalibrasyon. Pasajda sayısal uyum görülmedi |
| Feng HL et al. 2017, *J Ophthalmol*. DOI 10.1155/2017/3584706 [SG] | iPad2 ve Kindle ile basılı kitap | 167, ort. 73.5 yaş | En hızlı okuma iPad2'de 18 pt'de, en yavaş basılı kitapta |

**Sentez:**
- RA ve CPS tablette **klinik olarak eşdeğer**.
- MRS tablette sistematik olarak **%3–27 daha düşük**. Bu fark hızlı okuyucularda büyüyor ve nedeni zamanlama yöntemi (dokunarak başlat/durdur).
- Türkçe MNREAD-TR tablet sürümü mevcut ve Altınbay 2022'de karşılaştırılmış.
- **Bulunamadı:** Akıllı telefon ekranında (≤6.7") **MNREAD formatının** (cümle, log ölçekli boyut, CPS) validasyonu. Telefonun küçük ekranı büyük baskı boyutlarını satıra sığdırmayı sınırlıyor.

---

## Uygulama için mühendislik gereksinimleri

### A. Mesafe ölçümü ve yakın nokta / NPC
1. **Çift mesafe kaynağı:** TrueDepth olan iOS cihazlarda ARKit derinliği birincil kaynak olsun. Diğer cihazlarda iris çapı ve yüz landmark'larına dayalı tahmin kullanılsın. Kabul hedefi: göreli hata ≤%5. Dayanak: Nissen 2023'te %0.88–9.07, MediaPipe Iris'te %4.3 [WS].
2. **Kişiye özel ölçek kalibrasyonu:** İlk kullanımda bilinen bir mesafede (ör. kredi kartı veya A4 ile 40 cm) tek noktalı K kalibrasyonu yapılsın. Salmerón-Campillo 2019 bu yöntemle ≤5 mm hata elde etmiş. Sabit 11.7 mm iris varsayımına güvenilmesin.
3. **Referans düzlemi:** Ölçüm referansı açıkça tanımlansın (kornea, gözlük düzlemi veya alın). Klinik normlarla karşılaştırmadan önce sabit bir ofset uygulansın. Marusic 2024'e göre kantus ile alın arası 1.5–1.8 cm fark başarısızlık oranını iki katına çıkarıyor.
4. **Minimum mesafe:** Ön kameranın görüş alanı yakında yüzü kırpar. Yüz landmark'ları kaybolduğunda ölçüm geçersiz sayılsın. Kaydedilen yakın nokta, "son geçerli kare" ile sınırlandırılsın.
5. **Dioptri hatası bütçesi:** 10 cm'de %4 hata ≈ ±0.4 D. Sonuç ekranında amplitüd ± belirsizlik gösterilsin. 0.5 D'nin altındaki değişimler "anlamlı ilerleme" olarak sunulmasın. Push-up tekrarlanabilirlik limiti zaten ~1.8 D (Salvador-Roger 2025).
6. **NPC** için kamera tabanlı bir yöntem henüz valide değil. Ürün kendi validasyonunu yapana kadar NPC değeri tanısal değil, "eğitim metriği" olarak sunulsun.

### B. Push-up protokolü
7. **Açısal boyutu sabit hedef:** Her karede ölçülen mesafeye göre optotip yeniden ölçeklensin (EPU ilkesi). Hedef ~0.3–0.5 logMAR olsun ve kişinin eşik keskinliğine göre ayarlanabilsin (Atchison 1994).
8. **Tek, net bir bitiş kriteri** tanımlansın, önerimiz "ilk kalıcı bulanıklık". Tek başına kriter farkı ~2 D yaratabiliyor (Chen 2019). En az 3 tekrar alınsın, medyan raporlansın.
9. Push-up yerine veya ek olarak **push-away/modifiye** yöntem ve bir **objektif referansla** kalibrasyon planlansın. Subjektif push-up objektif ölçümden 2–5 D yüksek çıkıyor.

### C. Ekran ve kontrast
10. Kontrast testinden önce Auto-Brightness, True Tone ve Night Shift (Android'de adaptif parlaklık ve göz koruma modu) devre dışı bırakılsın. Parlaklık sabit bir değere kilitlensin (Marin-Campos 2020).
11. Test öncesi **ısınma süresi** uygulansın: ekran açıldıktan sonra ≥10–15 dk ya da en azından ekran açıkken bekleme (Aslam 2013).
12. **Cihaz modeli bazında LUT:** Gamma fiti yerine her gri düzey ölçülsün. En azından sık kullanılan modeller fotometreyle karakterize edilsin (Wit 2023, Rodríguez-Vallejo 2016). Bilinmeyen modellerde psikofizik kalibrasyon yapılsın (To 2013).
13. **Kontrast alt sınırı:** Kalibrasyonsuz cihazda 0.1 log adım ve −2.2 logC tabanı aşılmasın. 0.05 log adım yalnızca cihaz bazında kalibrasyonla sunulsun.
14. **Bit derinliği:** 8-bit ekranda bit-stealing veya noise-bit kullanılsın. OLED'de düşük parlaklıkta etkin bit derinliği ~8-bit'e düşebildiği için (Hsu 2026) CS testi orta-yüksek parlaklıkta yapılsın.
15. **OLED ABL:** Arka plan ortalama luminansı test boyunca sabit tutulsun (orta gri zemin). Tam ekran beyaz ile koyu arasında geçişten kaçınılsın. Uzun süre yüksek kontrastlı sabit görüntü gösterilmesin, çünkü panelde iz kalabilir (Dimigen 2026).
16. **Ekran çözünürlüğü:** Test mesafesinde gerekli uzamsal frekans piksel yoğunluğundan hesaplansın. Referans değer: 391 dpi ile 26.8 cm'de 36 c/deg (Salmeron-Campillo 2025). Bu sınırı aşan optotipler gösterilmesin.

### D. Zamanlama
17. Uyaran sunumu **native** olsun: iOS'ta Metal/CADisplayLink, Android'de Choreographer/SurfaceFlinger. Web veya WebView kullanılmasın (Pronk 2020).
18. Süreler **kare cinsinden** tanımlansın (34 ms değil "2 kare @60 Hz"). ProMotion cihazlarda test sırasında kare hızı `preferredFrameRateRange` ile sabitlensin. Sunulan kare sayısı ve düşen kareler her denemede loglansın, düşen kare içeren denemeler yeniden sunulsun. StimuliApp modelinde kare düşme raporu var.
19. **120 Hz'de GPU bütçesi:** Karmaşık uyaran 120 Hz'de kare düşürebiliyor. Kısa süreli uyaran testlerinde varsayılan 60 Hz'e kilitlensin veya uyaran önceden render edilsin.
20. **Dokunma RT'si** cihaza bağlı 27–97 ms sistematik gecikme içeriyor. RT'ler bireyin kendi başlangıç değerine göre veya koşullar arası fark olarak raporlansın. Mutlak RT normları kullanılmasın (Schatz 2015, Pronk 2020).
21. Referans cihazlar (en az 1 iPhone, 1 iPad, 2 Android) için **fotodiyot + osiloskop** ile iç zamanlama validasyonu yapılsın. Bu Bridges 2020'nin açık önerisi.

### E. Göz takibi
22. Beklenen doğruluk bandı: kalibrasyonsuz ~1.7–2.3 cm, ~30 s kişisel kalibrasyonla ~0.5–0.9 cm (~0.6–1.4°). Bu çözünürlük mikrosakkad veya küçük fiksasyon instabilitesi ölçmeye **yetmez**. Makro görevlerde yeterli: sakkad yönü, pursuit, okuma satırı.
23. **Kalibrasyon:** Oturum başında 20–30 s kalibrasyon yapılsın: hareketli nokta veya ≥9–13 sabit nokta ve kişiye özel regresyon (SVR). Uzun oturumlarda her 3–5 dakikalık blok arasında yeniden kalibre edilsin (Valliappan 2020). Doğrulama hatası >1 cm ise oturum işaretlensin veya reddedilsin.
24. **Poz ve mesafe kapısı:** Baş pozu yaklaşık önden, mesafe 25–40 cm aralığında ve yüz karenin büyük kısmını kaplıyor olmalı. Sınır dışına çıkıldığında veri geçersiz sayılsın. Ekranın alt kısmındaki hedeflerde hata büyüdüğü için kritik hedefler ekranın üst-orta bölgesine yerleştirilsin.
25. **Işık kontrolü:** Ön kamera pozlaması ve yüz luminansı ölçülsün. Arkadan gelen ışık veya karanlık ortam algılanırsa kullanıcı uyarılsın (Hagihara 2024, Valliappan 2020).
26. **Gözlük:** Etkisi sayısal olarak bilinmiyor. Kullanıcının gözlüklü olup olmadığı kaydedilsin, gözlüklü ve gözlüksüz ayrı kalibrasyon profili tutulsun. Doğruluk bu iki alt grupta ayrı raporlansın. Bu ürünün kendi validasyonunda doldurması gereken bir boşluk.
27. **ARKit kalibrasyonsuz göz verisi** (%17–27 açısal hata) tanısal amaçla kullanılmasın. Kullanılacaksa üstüne kalibrasyon katmanı eklensin (Parker 2022).
28. **Örnekleme hızı:** Ön kamera 30–60 fps'dir. Sakkad hızı ve latansı gibi zamansal metrikler ±17–33 ms çözünürlükle sınırlı kabul edilsin.

### F. Okuma testi
29. MNREAD tarzı test **tablet (≥10")** için tasarlansın. Telefonda yalnız RA ve CPS ölçülsün, MRS'nin telefondaki geçerliliği henüz gösterilmedi.
30. **Okuma zamanlaması** dokunmaya değil **ses aktivitesi tespitine** dayansın (ses başlangıcı ve bitişi). DDART'ta ses kaydıyla otomatik zamanlama yapılmış. Dokunmayla zamanlamada MRS %3–27 düşük çıkıyor (Calabrèse 2018, Altınbay 2022).
31. Türkçe için **MNREAD-TR** cümle korpusuyla uyumlu cümleler kullanılsın veya lisans alınsın (Altınbay 2022). Test-tekrar için eşdeğer cümle setleri oluşturulsun.
32. Baskı boyutu x-yüksekliğine göre, ölçülen gerçek mesafeden logMAR olarak hesaplansın. Kamerayla ölçülen mesafe ±%5 içinde değilse deneme geçersiz sayılsın.

### G. Validasyon planı (ürünün kendi çalışması)
33. Yakın nokta için: ≥60 katılımcı, 18–45 yaş, presbiyop olmayan. Uygulamanın ölçtüğü NPA, klinik push-up (RAF cetveli) ve minus lens ile karşılaştırılsın. Bland-Altman LoA ve test-tekrar CoR raporlansın. Kabul hedefi olarak LoA ≤ ±1.0 D önerilir, bu klinik push-up'ın kendi tekrarlanabilirliği olan ~1.8 D'den dar.
34. NPC için: Kamera ile ölçülen kırılma/toparlanma noktası ve RAF cetveli karşılaştırılsın. Referans düzlemi (kantus veya alın) protokolde sabitlensin.
35. Tüm validasyonlarda en az 2 iOS ve 2 Android model yer alsın. Cihazlar arası farklılık ayrıca raporlansın (Rodríguez-Vallejo 2016 aynı model iPad'ler arasında bile anlamlı fark buldu).

---

### Metodolojik notlar
- WebFetch ile arxiv.org, research.google, springer ve ncbi erişilemedi. Krafka 2016, Greinacher 2020, RGBDGaze 2022 ve MediaPipe Iris rakamları yalnızca arama motoru özetlerinden alındı ve [WS] olarak işaretlendi. Ürün belgelerine girmeden önce birincil kaynaktan doğrulanmalı.
- Scholar Gateway korpusu Wiley ağırlıklı (OPO, CXO, OVS, JSID). IEEE, ACM ve CVPR tam metinleri bu araçta yok. Mühendislik tarafı PubMed'de indekslenen IEEE EMBC, Sensors ve BRM ile WebSearch'ten tamamlandı.
