# 19 — Gözlük ve Yakın Görme Testi: Düzeltme Koşulu, Numaradan Tahmin, iOS Gözlük Tespiti

**Tarih:** 2026-09-25
**Kapsam:** EyeTrail yakın görme keskinliği testi (Tumbling E, ~40 cm, ZEST/QUEST, günlük/haftalık izlem, 40+ yaş, sağlık iddiası yok).
**Soru:** Mevcut yönerge "uzak gözlüğün varsa tak, okuma gözlüğünü takma". Kullanıcı gözlükle test yapıyor; uygulama (a) numarayı sorup hesaba katmalı mı, (b) gözlüğü çıkarmasını mı istemeli, (c) kameradan gözlük takılı olup olmadığını anlamalı mı?
**Kaynaklar:** PubMed MCP (search_articles, get_article_metadata, get_full_text_article), Scholar Gateway, Apple geliştirici belgeleri (WebFetch; sayfaların JSON sürümü), WebSearch. Ağ vekili nedeniyle PMC, Nature, Wiley, ClinicalTrials.gov, ResearchGate ve legge.psych.umn.edu erişilemedi; bunlar Bölüm 6'da listelendi.

Tüm PubMed bulguları "PubMed'den alınan makalelere göre" verilmiştir; her satırda PMID ve DOI bağlantısı vardır.

---

## 1. Klinik standart: yakın keskinlik hangi düzeltme koşulunda ölçülür?

### 1.1 Terimler (kısa)

| Terim | Anlamı | Ne zaman kullanılır |
|---|---|---|
| **Uncorrected / unaided near VA (UNVA)** | Hiç gözlüksüz, 40 cm | Epidemiyoloji (ihtiyaç), eREC hesabı |
| **Presenting / habitual near VA (PNVA/HNVA)** | Kişi yakın için ne kullanıyorsa onunla (yoksa gözlüksüz) | DSÖ ICD-11 yakın görme bozukluğu tanımı, saha taramaları, tele-izlem |
| **Distance-corrected near VA (DCNVA)** | Uzak düzeltmesiyle, yakın add olmadan | Presbiyopi büyüklüğü, cerrahi/İOL çalışmaları |
| **Best-corrected near VA (BCNVA)** | Uzak düzeltmesi + uygun yakın add | Hastalık takibi, okuma kartı standardı ("best-corrected reading acuity") |

Elliott'un editoryal notu (Optom Vis Sci 2024, [DOI 10.1097/OPX.0000000000002165](https://doi.org/10.1097/OPX.0000000000002165), Scholar Gateway pasajı): "BCVA" terimi tanımsız kullanılıyor; ana ölçüm türleri **unaided**, **habitual** (kişinin o görevde alışkanlıkla kullandığı düzeltmeyle) ve **corrected/optimal** (tam subjektif refraksiyon sonrası). Habitual VA'daki düşüş "düzeltilmemiş refraksiyon ve/veya hastalık" kaynaklı olabilir; corrected VA'daki düşüş büyük olasılıkla hastalıktır.

### 1.2 Kaynak tablosu

| Kaynak (PMID / DOI) | Test / bağlam | Düzeltme koşulu | Bulgu |
|---|---|---|---|
| Radner W. *Standardization of Reading Charts: A Review*. Optom Vis Sci 2019. PMID 31592960, [DOI](https://doi.org/10.1097/OPX.0000000000001436) | Okuma kartları (Bailey-Lovie, Colenbrander, RADNER, MNREAD, SKread, C-Read, BAL) | "Kriterler klinik gereksinime veya çalışma tasarımına göre tanımlanmalı"; **"best-corrected reading acuity, best-corrected distance acuity kadar önemli bir sonuçtur"** | Standardizasyon baskı boyutu, logaritmik ilerleme, test maddeleri üzerinedir; tek bir zorunlu düzeltme koşulu dayatmaz. |
| Citek & Radner. *ISO 7921:2024 — reading acuity standardı* (mektup). Optom Vis Sci 2025. PMID 40100086, [DOI](https://doi.org/10.1097/OPX.0000000000002227); Radner ve ark. *DIN EN ISO 7921:2024*. Ophthalmologie 2026. PMID 42608569, [DOI](https://doi.org/10.1007/s00347-026-02483-z) | İlk uluslararası yakın okuma kartı standardı | Erişilen metinlerde düzeltme koşulu **belirtilmiyor** | Standart; x-yüksekliği tabanlı baskı boyutu, geometrik ilerleme, **standart test mesafeleri**, aydınlatma, kontrast, yazı tipi (Helvetica/Times) ve logRAD notasyonunu tanımlar. |
| MacMillan ve ark. Optom Vis Sci 2001. PMID 11444626, [DOI](https://doi.org/10.1097/00006324-200106000-00009) | 44 kişi >60 yaş; MNREAD ve N-metin ile add tayini | Habitual çalışma mesafesi, kendi yakın gözlükleri | Add, ölçüm metnine göre değişir: N-notasyon +2.21 D, MNREAD +2.48 D, çapraz silindir +2.53 D. Add, dioptrik çalışma mesafesiyle ilişkili (r=0.47); **yakın VA düşünce çalışma mesafesi kısalır, add artar**. |
| Pointer JS. *Habitual vs optimal distance VA*. Ophthalmic Physiol Opt 2008. PMID 18761483, [DOI](https://doi.org/10.1111/j.1475-1313.2008.00584.x) | 1288 optometri hastası, uzak VA | Habitual (muayene öncesi) vs optimal (refraksiyon sonrası) | Optimal refraksiyon habitual VA'yı tipik olarak **<1 logMAR satırı (<5 harf)** iyileştirir; yaşlı, gözlük kullanmayanlarda 8 harfe çıkar. Yani "habitual" ile "best" arasındaki fark küçük ama sistematik. |
| Rosenfield M. *Why do we test at 40 cm?* (editoryal). Ophthalmic Physiol Opt 2024. PMID 38523588, [DOI](https://doi.org/10.1111/opo.13309) | Yakın test mesafesi | — | Metne erişilemedi; yalnızca künye doğrulandı (bkz. Bölüm 6). |
| Wolffsohn & Davies. *Presbyopia: effectiveness of correction strategies*. Prog Retin Eye Res 2019. PMID 30244049, [DOI](https://doi.org/10.1016/j.preteyeres.2018.09.004) | Presbiyopi tanımı | **Uzak için optimal düzeltilmiş** durumda | Önerilen tanım: "uzak için optimal düzeltildiğinde yakın netliğin bireyin gereksinimini karşılamaya yetmemesi". Presbiyopi tanımının **DCNVA** koşuluna bağlı olduğu vurgulanır. |
| Katibeh ve ark. (Peek Near Vision). TVST 2022. PMID 36583912, [DOI](https://doi.org/10.1167/tvst.11.12.18) | DSÖ ICD-11 tanımı aktarılıyor | **Presenting** (mevcut düzeltmeyle) | ICD-11 yakın görme bozukluğu: **40 cm'de presenting NVA N6'dan kötü** (~0.27 logMAR). eREC hesabı için hem düzeltmesiz hem presenting NVA gerekir. |
| Hashemi ve ark. Shahroud. Clin Exp Ophthalmol 2012. PMID 22429288, [DOI](https://doi.org/10.1111/j.1442-9071.2012.02799.x) | 5190 kişi, 40–64 yaş | logMAR kart, 40 cm; presbiyopi = N8'e ulaşmak için ≥1 D add | Yaş grubuna göre ortalama add: 40–44: 0.65, 45–49: 1.30, 50–54: 1.70, 55–59: 1.87, 60–64: 2.08 D; her 5 yılda +0.35 D. |
| Sherwin ve ark. Kenya. Clin Exp Ophthalmol 2008. PMID 18412593, [DOI](https://doi.org/10.1111/j.1442-9071.2008.01711.x) | Kırsal, ≥50 yaş | **"participant's usual visual state"** (habitual) + gereken add | Fonksiyonel presbiyopi: 40 cm'de N8 için ≥+1.00 D gerekmesi. |
| Nirmalan ve ark. Andhra Pradesh. IOVS 2006. PMID 16723440, [DOI](https://doi.org/10.1167/iovs.05-1192) | 5587 kişi ≥30 yaş | logMAR yakın VA **presenting ve best corrected** ayrı ayrı | Presbiyopi: en iyi uzak düzeltmesine ek ≥1.0 D ile N8'e ulaşma. |
| Han ve ark. Guangzhou. Br J Ophthalmol 2018. PMID 29367202, [DOI](https://doi.org/10.1136/bjophthalmol-2017-311073) | 1191 kişi ≥35 yaş, 6 yıl | Presenting uzak düzeltmesiyle yakın VA; add 40 cm'de | Fonksiyonel presbiyopi = presenting uzak düzeltmesiyle yakın VA <20/50 ve add ile ≥1 satır iyileşme. |
| Salomão ve ark. Brezilya Amazon. Am J Ophthalmol 2018. PMID 30118685, [DOI](https://doi.org/10.1016/j.ajo.2018.08.012) | 2025 kişi ≥45 yaş | **UCNVA, PNVA, BCNVA üçü de** ölçüldü | Yakın görme bozukluğu prevalansı koşula göre **%96.5 (düzeltmesiz) → %81.1 (presenting) → %20.5 (best-corrected)**. Koşul değişince sonuç tamamen değişir. |
| Marmamula ve ark. RAVI. Ophthalmic Physiol Opt 2012. [DOI](https://doi.org/10.1111/j.1475-1313.2012.00893.x) (Scholar Gateway) | Saha taraması | Binoküler N kartı, **kişinin alışılmış çalışma mesafesinde (35–40 cm)**, düzeltmesiz ve gözlüklüyse gözlüklü; sonra **yaşa göre add** (+1.00 40–45 yaş … en fazla +3.00 >60 yaş) | Presbiyopi: binoküler presenting yakın <N8, düzeltmeyle ≥N8. |
| Casas Luque ve ark. Bogotá RARE. Optom Vis Sci 2019. [DOI](https://doi.org/10.1097/OPX.0000000000001409) (Scholar Gateway) | Saha taraması | 40 cm binoküler | Presbiyopi: yakın VA <20/40, uzak ≥20/40. |
| Xian ve ark. Clin Exp Ophthalmol 2023. PMID 36478363, [DOI](https://doi.org/10.1111/ceo.14194) | 121 kişi, mobil applet öz-test | **UNVA ve "NVA with available spectacle correction" ayrı ayrı**, 0.4 m | Applet ile klinik yöntem uyumu: UNVA için ICC 0.960; **gözlüklü yakın VA için ICC 0.669** (daha zayıf). |
| Satgunam ve ark. Indian J Ophthalmol 2021. PMID 33380619, [DOI](https://doi.org/10.4103/ijo.IJO_2333_20) | SmartOptometry (yakın, 40 cm) + Peek Acuity | Faz II: düzeltmesiz; **Faz III tekrarlanabilirlik habitual düzeltmeyle** ("tele-konsültasyonda hasta habitual düzeltmesiyle ölçüleceği için") | Yakın app sonuçları yaş ve refraksiyon kusurundan etkilendi; genç/emetroplarda app VA'yı düşük tahmin etti (piksel sınırı). |

### 1.3 Presbiyopi izleminde hangisi önerilir? (kaynaklara dayalı sentez)

1. **Tanı/araştırma standardı**: okuma kartı literatürü ve ISO 7921 "best-corrected" (uzak düzeltmesi + uygun add) ölçümünü referans alır (Radner 2019). Bu, **hastalık kaynaklı** değişimi refraksiyon etkisinden ayırmak için gerekli.
2. **Fonksiyon/tarama standardı**: DSÖ ICD-11 ve saha protokolleri **presenting/habitual** (kişinin gündelikte kullandığıyla) koşulunu kullanır; Peek Acuity ve V@home de bunu benimsedi (Bölüm 3).
3. **DCNVA** (uzak gözlükle, add'siz — EyeTrail'in mevcut yönergesi) presbiyopi **büyüklüğünü** ölçer; 40+ yaşta çoğu kullanıcıyı tabana (N8–N20 aralığı) çeker ve gündelik işlevi yansıtmaz (Wolffsohn 2019 tanımı; Shahroud add dağılımı).
4. **Karşılaştırılabilirlik**: Aynı kişide koşullar değişince sonuçlar karşılaştırılamaz — Brezilya verisi (%96.5 → %20.5) ve Pointer 2008 (habitual→optimal ~1 satır) bunun ölçeğini gösteriyor. Trend izlemi için **tek ve sabit koşul** şarttır; koşul her oturumda kaydedilmeli.
5. **Habitual koşulun riski**: gözlük numarası değişince (yeni gözlük) trend kırılır → uygulama "gözlüğün değişti mi?" sorusu ile yeni bir baz çizgisi başlatmalı.

---

## 2. Gözlük numarasından yakın keskinlik tahmin edilebilir mi?

**Kısa yanıt: Hayır — güvenilir bir şekilde tahmin edilemez; literatürde böyle doğrulanmış bir model bulunamadı.** Eldeki kanıt yalnızca kaba bir "makul aralık" verir.

### 2.1 Yaş ↔ add ilişkisi (tablolar)

| Kaynak | Bulgu |
|---|---|
| Blystone. J Am Optom Assoc 1999. PMID 10506813 (DOI yok) — 3645 muayene, tek klinik | Add 40 yaşında ~0.22 D/yıl, 40–50 arası ortalama 0.12 D/yıl (≈0.25 D / 2 yıl), 50'den sonra ~0.03 D/yıl (≈0.25 D / 8 yıl); 40–75 yaş arasında yaklaşık parabolik. |
| Shahroud 2012. PMID 22429288, [DOI](https://doi.org/10.1111/j.1442-9071.2012.02799.x) | 40–44: 0.65 ± 0.41; 45–49: 1.30 ± 0.30; 50–54: 1.70 ± 0.25; 55–59: 1.87 ± 0.29; 60–64: 2.08 ± 0.27 D. Diğer raporlara göre ~0.5 D düşük. |
| Guangzhou (Han ve ark.). Clin Exp Ophthalmol 2018. PMID 29663613, [DOI](https://doi.org/10.1111/ceo.13301) | 35–44: 1.43; 45–54: 1.73; 55–64: 2.03; 65+: 2.20 D; 6 yılda +0.15 D; "Kafkas çalışmalarından farklı". |
| Singapore SEED. Br J Ophthalmol 2020. PMID 32051134, [DOI](https://doi.org/10.1136/bjophthalmol-2019-315629) | 6 yılda ortalama add değişimi +0.25 D; etnik gruba göre farklı (Malay +0.37, Çinli +0.16). |
| Whitefoot & Charman (Scholar Gateway'de [DOI 10.1111/j.1444-0938.2008.00288.x](https://doi.org/10.1111/j.1444-0938.2008.00288.x) içindeki özet) | 221 kişi 10–80 yaş: add yaşla iyi korele; yazarlar yaşa dayalı "tentatif add"in bir başlangıç noktası olduğunu belirtir. |
| Klinik "tentatif add" tabloları (web, hakemsiz: eyedocs.co.uk, optogrid.com) | 40 y +1.00; 43 y +1.25; 45 y +1.50; 48 y +1.75; 50 y +2.00; 55 y +2.25; 60 y +2.50 D (40 cm için; 33 cm'de +0.50). **İkincil kaynak; yalnızca başlangıç tahmini.** |
| Hofstetter formülü (min. amplitüd = 15 − 0.25×yaş) — Cacho ve ark. Optom Vis Sci 2002. PMID 12322932, [DOI](https://doi.org/10.1097/00006324-200209000-00013); Hashemi ve ark. J Ophthalmic Vis Res 2019. PMID 31660110, [DOI](https://doi.org/10.18502/jovr.v14i3.4787) | Formül klinik norm; ancak İran üniversite örnekleminde "her zaman doğru tahmin etmiyor". Yaşa göre amplitüd tahmini bireysel değişkenliği kapsamaz. |

Sonuç: yaş, add'i **popülasyon düzeyinde** ±0.3–0.5 D ile tahmin eder; **bireysel** tahmin için yetersiz (etnisite, çalışma mesafesi, pupilla, VA'nın kendisi add'i etkiler — MacMillan 2001).

### 2.2 Defokus (D) ↔ keskinlik (logMAR) eğimi

| Kaynak | Bulgu |
|---|---|
| Mathur, Suheimat, Atchison. Optom Vis Sci 2015. PMID 25479447, [DOI](https://doi.org/10.1097/OPX.0000000000000459) | Sikloplejik, 4 mm pupilla: sferik defokusta **0.18 logMAR/D**, astigmatizmada 0.33 logMAR/D; genç–yaşlı fark bireysel varyasyonda kayboldu. |
| Weisensee ve ark. Ophthalmic Physiol Opt 2026. PMID 42060245, [DOI](https://doi.org/10.1007/s44402-026-00087-3) | Psödofak gözlerde VA kaybı = **0.195 logMAR/D** defokus eşdeğeri (R²=0.80); astigmatizma türüne göre 0.12–0.24. |
| Sah ve ark. BMJ Open Ophthalmol 2026. PMID 42521356, [DOI](https://doi.org/10.1136/bmjophth-2026-002835) | 300 genç erişkin, +0.50…+2.00 D miyopik defokus: VA kaybını esas olarak defokus miktarı belirler (η²=0.47), kontrast küçük ek etki. |
| Ohlendorf ve ark. 2011. PMID 21460757, [DOI](https://doi.org/10.1097/OPX.0b013e31821281bc); Vincent ve ark. 2020. PMID 31895276, [DOI](https://doi.org/10.1097/OPX.0000000000001463); Dehnert ve ark. 2011. PMID 21752040, [DOI](https://doi.org/10.1111/j.1475-1313.2011.00857.x) | Görsel sistem "gerçek" bulanıklığa simülasyondan daha toleranslı; sferik defokusta simülasyon–gerçek farkı ~0.08 logMAR / ~0.16 D. Yani tek bir eğimle keskin tahmin mümkün değil. |

### 2.3 Neden bir "numara → yakın keskinlik" hesaplayıcısı kurmamalı

- 40 cm'de gereken akomodasyon 2.50 D. Kalan defokus ≈ 2.50 − (kullanılabilir akomodasyon) − (takılı add) − (miyopi varsa sferik). Kullanılabilir akomodasyon **ölçülmeden** bilinemez; yaş tabloları ±0.5 D sapar.
- 0.18–0.20 logMAR/D eğimi grup ortalamasıdır; pupilla, odak derinliği, harf kontrastı ve çalışma mesafesi kişiye göre eğimi değiştirir.
- Klinikte ilişki **ters yöndedir**: önce yakın VA/okuma performansı ölçülür, sonra add seçilir (MacMillan 2001; Radner 2019). Add "eşik" değil "konfor" reçetesidir.
- Xian 2022 gösteriyor ki gözlüklü yakın VA ölçümünde app–klinik uyumu bile düşük (ICC 0.669); numara girdisi bu belirsizliği azaltmaz.

**Kullanılabilir tek şey**: numara/add bilgisi **meta-veri** ve **makullük bandı** olarak (ör. +2.50 add takan 60 yaş kullanıcı 40 cm'de 0.0–0.2 logMAR beklenir; 1.0 logMAR çıkarsa "mesafe/aydınlatma/gözlük hatası" uyarısı). Tahmin/"hesaba katma" olarak kullanılmamalı.

---

## 3. Akıllı telefon görme testi validasyon çalışmaları kullanıcıya hangi gözlükle test yaptırdı?

| Çalışma (PMID / DOI) | Test, mesafe | Düzeltme koşulu (metinden) | Sonuç |
|---|---|---|---|
| **Peek Acuity** — Bastawrous ve ark. JAMA Ophthalmol 2015. PMID 26022921, [DOI](https://doi.org/10.1001/jamaophthalmol.2015.1468) (tam metin PMC5321502) | Uzak, 2 m, Kenya, 300 kişi ≥55 yaş | **"For all tests the presenting acuity was measured, with habitual correction if worn."** | ETDRS ile fark 0.07 logMAR; test-retest ±0.033 logMAR. |
| **Peek Near Vision (PeekNV)** — Katibeh ve ark. TVST 2022. PMID 36583912, [DOI](https://doi.org/10.1167/tvst.11.12.18) (tam metin PMC9807182) | Yakın, 40 cm, çene desteği, 150–180 lux, Tumbling E, 483 kişi | **"Vision was tested without correction to maximize the range of near acuities"** — tüm ölçümler düzeltmesiz; katılımcıların %27'si gündelikte okuma gözlüğü takıyordu | Kart ile fark 0.008 logMAR, LoA ±0.22; uyum yakın görme bozukluğu olanlarda daha düşük (akomodasyon yorgunluğu). |
| **Vision at Home (V@home)** — Han ve ark. TVST 2019. PMID 31440424, [DOI](https://doi.org/10.1167/tvst.8.4.27) (tam metin PMC6701871) | Uzak 2 m monoküler; **yakın 40 cm binoküler**, Tumbling E | Katılımcılar **"wearing their habitual spectacle correction"**; uygulama yönergesi kullanıcıya **"to wear their glasses"** der | Yakın ETDRS ile fark −0.042 … −0.092 logMAR; TQWK 0.74–0.84. |
| **OdySight** — Brucker ve ark. Ophthalmol Ther 2019. PMID 31346977, [DOI](https://doi.org/10.1007/s40123-019-0203-9) (tam metin PMC6692804) | Yakın, 40 cm, çene desteği, Tumbling E, monoküler, 120 göz | **"the eye tested was equipped with the adequate correction"**; kontakt lensler ≥1 saat önce çıkarıldı (klinik koşul, best-corrected'a yakın) | 40 cm Sloan ETDRS ile bias 0.53 harf, LoA −9.75…+10.82 harf. |
| **Alleye** — Schmid ve ark. Eye 2019. PMID 31043690, [DOI](https://doi.org/10.1038/s41433-019-0455-6) | Hiperakuite (metamorfopsi), VA değil | **Bulunamadı** (PMC'de tam metin yok; nature.com engelli) | AUC ıslak AMD 0.845. |
| **EyeQue Insight** | — | **Bulunamadı**: PubMed'de hakemli validasyon yayını yok; yalnızca kayıt NCT04474041 (ClinicalTrials.gov engelli, içerik doğrulanamadı) | — |
| **Home Acuity Test (HAT)** — Crossland ve ark. JAMA Ophthalmol 2021. PMID 33410910, [DOI](https://doi.org/10.1001/jamaophthalmol.2020.5972) | Basılı uzak kart, telefonla yönlendirme | Özet: **"corrected visual acuity measured with the HAT"** klinik ETDRS ile karşılaştırıldı; ayrıntı (habitual mı best mı) tam metinde, erişilemedi | Hastalarda fark −0.10 logMAR, LoA −0.44…+0.23. |
| Bellsmith ve ark. (basılı kart, mobil app, web). JAMA Ophthalmol 2022. PMID 35357405, [DOI](https://doi.org/10.1001/jamaophthalmol.2022.0396) | Uzak, evde | Referans: klinikte **best-corrected Snellen**; ev koşulu tam metinde, erişilemedi | Fark −0.07 / −0.12 / −0.13 logMAR. |
| Xian ve ark. (mobil applet). Clin Exp Ophthalmol 2023. PMID 36478363, [DOI](https://doi.org/10.1111/ceo.14194) | Uzak 2.5 m + **yakın 0.4 m** | **Hem düzeltmesiz hem mevcut gözlükle** ayrı ayrı | ICC: UNVA 0.960, NVA-gözlüklü 0.669. |
| Satgunam ve ark. (SmartOptometry yakın + Peek). Indian J Ophthalmol 2021. PMID 33380619, [DOI](https://doi.org/10.4103/ijo.IJO_2333_20) (tam metin PMC7933864) | Yakın 40 cm (ip ile), tablet | Öz-test anketi ve validasyon **gözlüksüz**; tekrarlanabilirlik **habitual düzeltmeyle** ("tele-konsültasyonda habitual düzeltmeyle ölçülecek") | Yakın app 2 satır içinde ama farklı; yaş ve refraksiyon etkili. |
| Ben-Eli ve ark. HSVA (basılı yakın kart). J Clin Med 2024. PMID 38610827, [DOI](https://doi.org/10.3390/jcm13072064) (tam metin PMC11012905) | Yakın 40 cm, öz-test | **"wear their habitual reading glasses if they were aged 40 years or older"**; <40 yaş uzak gözlüğü | Öz-test vs teknisyen ICC 0.96. |
| WHOeyes (iOS) — Br J Ophthalmol 2024. PMID 38514167, [DOI](https://doi.org/10.1136/bjo-2023-324913) | Uzak + yakın, otomatik mesafe kalibrasyonu | Özette belirtilmiyor | ETDRS ile fark −0.084…0.012 logMAR. |
| Sightbook — Kim ve ark. OSLI Retina 2022. PMID 35148218, [DOI](https://doi.org/10.3928/23258160-20220121-05) | Yakın Snellen | Özette belirtilmiyor | Tekrarlanabilirlik SD ±0.054 logMAR. |
| **"Bailey 2021"** | — | **Bulunamadı**: PubMed'de 2021 tarihli, ev/telefon görme testi validasyonu yapan "Bailey" yazarlı çalışma bulunamadı (arama: yazar + yıl + smartphone/home/remote). | — |

**Örüntü:** Fonksiyonel/ev testleri (Peek Acuity, V@home, HSVA, HAT, SmartOptometry tekrar fazı) **habitual/presenting** koşulu seçiyor; ölçüm aralığını genişletmek isteyen tek çalışma (PeekNV) bilerek **düzeltmesiz** ölçüyor; klinik-standart karşılaştırması yapan OdySight **best-corrected** koşulunu kullanıyor. Hiçbir çalışma "uzak gözlükle ama okuma gözlüksüz" (DCNVA) koşulunu ev testi için önermemiş.

---

## 4. iOS'ta ön kameradan gözlük tespiti: yerleşik API var mı?

**Sonuç: Yerleşik, belgelenmiş bir "gözlük takılı mı" API'si yok.**

| Kontrol edilen | Bulgu | Kanıt |
|---|---|---|
| **ARKit `ARFaceAnchor`** | Özellikler: `geometry`, `blendShapes`, `leftEyeTransform`, `rightEyeTransform`, `lookAtPoint` (+ `transform`). Gözlük/aksesuar yok. | https://developer.apple.com/documentation/arkit/arfaceanchor |
| **`ARFaceAnchor.BlendShapeLocation`** | 52 katsayı: eyeBlink/LookDown/LookIn/LookOut/LookUp/Squint/Wide (L/R), jaw (4), mouth (23), brow (5), cheek (3), nose (2), tongueOut. **Gözlükle ilgili hiçbir katsayı yok.** | https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation |
| **Vision `VNDetectFaceLandmarksRequest` / `VNFaceLandmarks2D`** | 13 bölge: allPoints, faceContour, leftEye, rightEye, leftEyebrow, rightEyebrow, nose, noseCrest, medianLine, outerLips, innerLips, leftPupil, rightPupil. Gözlük yok. | https://developer.apple.com/documentation/vision/vnfacelandmarks2d |
| **`VNFaceObservation`** | `landmarks`, `roll`, `yaw`, `pitch`, `faceCaptureQuality`. Gözlük/oklüzyon yok. | https://developer.apple.com/documentation/vision/vnfaceobservation |
| **`VNDetectFaceCaptureQualityRequest`** | 0–1 kalite: aydınlatma, keskinlik, merkezleme. Gözlükten söz etmiyor. | https://developer.apple.com/documentation/vision/vndetectfacecapturequalityrequest |
| **`VNClassifyImageRequest`** | Apple belgesi sınıf listesini yayımlamıyor (`supportedIdentifiers()` çalışma zamanında döner; `knownClassifications(forRevision:)` kullanımdan kaldırıldı). **Üçüncü taraf dökümlerde** (gist: ktustanowski, Revision1 = 1303 kimlik; gist: alexdong = 1995 kimlik) `"eyeglasses"`, `"sunglasses"`, `"goggles"` kimlikleri var. Bu **sahne/nesne sınıflandırıcısı**dır, yüz özniteliği değil; yüz kırpıntısında güvenilirliği belgelenmemiş. | https://developer.apple.com/documentation/vision/vnclassifyimagerequest ; https://gist.github.com/ktustanowski/56c0d7541813868fed4aceb60ab5d149 ; https://gist.github.com/alexdong/5da51b09d4fc07139f6ce98ceb8705ab |
| **Core ML hazır modeller** | FastViT, Depth Anything V2, DETR, BERT-SQuAD, DeepLabv3, MNIST, MobileNetV2, ResNet-50, Drawing Classifier, YOLOv3. **Yüz özniteliği/gözlük modeli yok.** | https://developer.apple.com/machine-learning/models/ |
| Google ML Kit / MediaPipe (karşılaştırma) | ML Kit yüz sınıflandırması yalnızca gülümseme/göz açık; gözlük için açık özellik isteği (#727) yanıtsız kapanmış. MediaPipe'ta da yok. | https://github.com/googlesamples/mlkit/issues/727 |

### 4.1 Gerçekçi seçenekler

**(a) Küçük CoreML ikili sınıflandırıcı (gözlük var/yok)**

| Konu | Bulgu |
|---|---|
| Veri setleri | **CelebA**: ~200k yüz, 40 öznitelik ("Eyeglasses" dâhil; pozitif oranı ~%6). **Lisans: yalnızca ticari olmayan araştırma** ("non-commercial research purposes only… not… exploit for any commercial purposes… any portion of derived data") → App Store'da satılan bir uygulama için eğitim verisi olarak **kullanılmamalı** (türev model de kapsanır). **MeGlass** (cleardusk/MeGlass): 47 917 görüntü, 1 710 kimlik, MegaFace'ten türetilmiş; repo MIT lisansı gösteriyor ancak kaynak MegaFace'in kendi kullanım koşulları var — hukuk kontrolü gerekir. **Specs on Faces**, Roboflow setleri: mantasu/glasses-detector (MIT) 32 set kullanıyor. |
| Boyut/doğruluk örnekleri | acheshkov/eyeglasses_classifier_lightweight: SqueezeNet, **2.75 MB**, 723k parametre, MeGlass 120×120, F1 = 0.984. Sorour190/Glasses-Detector: MobileNetV3-Small ~2.5M parametre, CelebA'da ~%98 doğrulama; ONNX dışa aktarım. hpnkv/eyeglasses_on_photo: MeGlass %99.7, CelebA %98.6 (dlib yüz kırpıntısı üzerinde). Literatür (arXiv taramaları): CelebA "Eyeglasses" için ResNet/DenseNet %90.7–93.6; 4 satırlık ImageNet-transfer denemesinde %71. |
| iOS entegrasyonu | Vision `VNDetectFaceRectanglesRequest` → yüz kırpıntısı → CoreML (coremltools ile PyTorch/ONNX'ten dönüşüm; ya da **Create ML Image Classifier** ile kendi/lisanslı veriyle eğitim). Çıktı yalnızca `Bool` + güven. Model 1–5 MB. |
| Riskler | Çerçevesiz/ince metal gözlük, düşük ışık, yansıma, güneş gözlüğü ↔ şeffaf ayrımı, yaşlı yüzlerde/Türkiye örnekleminde dağılım kayması. %95–99 doğruluk "iyi ışık, ön yüz" varsayımıyla; **yanlış-negatifte test geçersiz sayılacaksa insan onayı şart**. |

**(b) Tek dokunuşla sorma** — Model yok, gizlilik riski yok, %100 açıklanabilir; tek risk kullanıcı hatası. Literatürdeki tüm ev testleri bunu yönergeyle çözüyor (V@home "gözlüğünü tak"; HSVA "40+ ise okuma gözlüğünü tak").

**(c) Hibrit** — Kullanıcı seçer; kamera (zaten mesafe ölçümü için açık) ile küçük sınıflandırıcı yalnızca **tutarsızlıkta uyarı** üretir ("Gözlüksüz seçtin ama gözlük görüyor gibiyim — kontrol et"). Karar kullanıcıda kalır.

### 4.2 App Store 5.1.2(vi) etkisi

Kılavuz metni (doğrulandı, https://developer.apple.com/app-store/review/guidelines/):
> "Data gathered from the HomeKit API, HealthKit, Clinical Health Records API, MovementDisorder APIs, ClassKit or from depth and/or facial mapping tools (e.g. ARKit, Camera APIs, or Photo APIs) may not be used for marketing, advertising or use-based data mining, including by third parties."

Değerlendirme:
- Kural **kullanım amacını** kısıtlar (pazarlama/reklam/veri madenciliği), tespiti yasaklamaz. Cihazda kalan, yalnızca "evet/hayır + oturum meta-verisi" üreten, kare/yüz verisi saklamayan bir kontrol bu maddeyle çelişmez.
- Tavsiye: ARKit yüz haritası yerine **Vision + CoreML** kullan (ARKit "facial mapping" ifadesinin doğrudan hedefi); `NSCameraUsageDescription`'da amacı "test mesafesi ve gözlük kontrolü" olarak açıkla; kareleri diske yazma, sunucuya gönderme; sonucu analitik/reklam SDK'larına iletme.
- 5.1.3 (sağlık verisi): gözlük bayrağı test sonucuyla birlikte saklanacaksa "sağlık/fitness verisi" gibi işlenmeli — üçüncü taraf paylaşımı ve reklam kullanımı yasak, iCloud'da kişisel sağlık verisi saklama yasağı (5.1.3(ii)) dikkate alınmalı. Uygulama sağlık iddiası taşımadığı için 5.1.3(iii–iv) (araştırma onamı/etik kurul) tetiklenmez.

---

## 5. EyeTrail için öneri: 3 seçenek ve gerekçe

### Ortak zemin (her seçenekte)
- Mevcut yönerge ("uzak gözlük tak, okuma gözlüğü takma" = DCNVA) **değiştirilmeli**: 40+ yaşta presbiyopi büyüklüğünü ölçer, gündelik işlevi değil; kullanıcıları tabana yığar ve değişime duyarlılığı azaltır (Bölüm 1.3). Hiçbir ev testi validasyonu bu koşulu kullanmamış (Bölüm 3).
- Her oturuma zorunlu alan: `nearCorrection ∈ {none, readingGlasses, progressive/bifocal, distanceOnly, contactLens(+readers?)}` + `glassesChangedSinceLast: Bool`. Trend grafikleri **yalnızca aynı koşuldaki** oturumları birleştirir; koşul değişince yeni baz çizgisi.
- Numara/add **hesaba katılmaz** (Bölüm 2); yalnızca isteğe bağlı meta-veri ve makullük bandı.

### Seçenek A — "Alışkanlık koşulu" (habitual near, önerilen varsayılan)
- Yönerge: "Yakını (telefon/kitap) normalde nasıl görüyorsan öyle test et. Okuma/progresif gözlük kullanıyorsan tak; kullanmıyorsan takma. Her seferinde aynısını yap."
- Gerekçe: DSÖ ICD-11 "presenting NVA"; Peek Acuity, V@home, HSVA, SmartOptometry tekrarlanabilirlik fazı ve HAT bu koşulu kullandı; kullanıcının gerçek yaşamdaki görmesini izler; en az sürtünme.
- Zayıf yanı: refraksiyon değişimini hastalık değişiminden ayıramaz → "gözlüğün değişti mi?" sorusu ve yeni baz çizgisi zorunlu.

### Seçenek B — "İki kanal" (düzeltmesiz + alışkanlık)
- Haftada bir (veya ayda bir) ek olarak **gözlüksüz** yakın test; fark = "düzeltme kazancı". Xian 2022, Brezilya ve RAVI protokolleri iki ölçümü ayrı raporlar.
- Gerekçe: gözlüksüz kanal refraksiyondan bağımsız daha kararlı bir eğri verir; alışkanlık kanalı işlevi verir. İkisi birlikte "gözlük eskidi mi / göz mü değişti" ayrımına yardımcı.
- Zayıf yanı: test süresi ×2; PeekNV'de düzeltmesiz ölçümde presbiyoplarda uyum düştü (akomodasyon yorgunluğu); 60+ kullanıcı gözlüksüz büyük harfleri bile okuyamayabilir (taban etkisi).

### Seçenek C — "Kamera destekli tutarlılık kontrolü" (A veya B'nin üstüne)
- Kullanıcı yine tek dokunuşla seçer; mesafe ölçümü için zaten açık olan ön kamerada Vision yüz kırpıntısı + 1–3 MB CoreML ikili sınıflandırıcı yalnızca **çelişkide** uyarır. Sonuç cihazda, kare saklanmaz.
- Gerekçe: yerleşik API yok (Bölüm 4); tek dokunuşla sorma literatürün yaptığıdır; sınıflandırıcı %95–99 doğrulukla "unuttum" hatasını yakalar ama son sözü söylemez.
- Şartlar: eğitim verisi lisansı (CelebA ticari kullanım dışı — kullanma; MeGlass/MegaFace koşullarını hukukla doğrula ya da kendi/lisanslı veri ile Create ML), ince çerçeve ve düşük ışıkta yanlış-negatif kabul edilebilir çünkü karar kullanıcıda.

**Önerilen yol:** A'yı hemen uygula (yönerge + zorunlu koşul alanı + baz çizgisi mantığı); B'yi isteğe bağlı "gelişmiş izlem" olarak sun; C'yi ancak kamera mesafe ölçümü zaten üründe ise ve hukuk/lisans temizlendikten sonra ekle. Numara sorma **yapma**; sadece "yakın için ne kullanıyorsun?" sor.

---

## 6. Bulunamayanlar / erişilemeyenler

| Öğe | Durum |
|---|---|
| "Bailey 2021" ev/telefon görme testi validasyonu | **Bulunamadı** (PubMed yazar+yıl+konu aramaları boş; Bailey-Lovie kart tasarımına dair de eşleşme yok). |
| EyeQue (Insight/VisionCheck) hakemli validasyon | **Bulunamadı** PubMed'de; NCT04474041 kaydı var, ClinicalTrials.gov erişilemedi. |
| Alleye validasyonunda gözlük koşulu | **Bulunamadı** (PMC tam metin yok; nature.com erişilemedi). |
| HAT (Crossland 2021) ve Bellsmith 2022 ev koşulu ayrıntısı | Tam metinler PMC'de boş döndü; pmc.ncbi.nlm.nih.gov ve repository.essex.ac.uk erişilemedi. Özetlerdeki "corrected VA" / "best-corrected Snellen referans" ifadeleriyle sınırlı. |
| MNREAD resmi yönergesi (okuma gözlüğü/add) | legge.psych.umn.edu erişilemedi; yalnızca ikincil özetler ("uygun yakın düzeltmesi ile 40 cm"). |
| Rosenfield 2024 "Why do we test at 40 cm?" gövde metni | Wiley erişilemedi; künye doğrulandı. |
| ISO 7921:2024'te düzeltme koşulu maddesi | Erişilen mektup/özet metinlerinde geçmiyor; standardın kendisi ücretli. |
| "Limitation of tables indicating the relation between age and reading addition" (ResearchGate) | Erişilemedi; PubMed'de kayıt bulunamadı. |
| Apple resmi VNClassifyImageRequest sınıf listesi | Apple yayımlamıyor; yalnızca üçüncü taraf çalışma-zamanı dökümleri (gist) kullanıldı. |
| Apple'da gözlük tespit API'si | **Yok** (ARFaceAnchor, BlendShapeLocation, VNFaceLandmarks2D, VNFaceObservation, faceCaptureQuality, Core ML model sayfası tek tek kontrol edildi). |
| Gözlük numarasından yakın keskinlik hesaplayan doğrulanmış model | **Bulunamadı**; yalnızca defokus eğimleri (0.18–0.20 logMAR/D) ve yaş→add tabloları var. |
