# Nefona Yoga — Kanıt Dosyası: "Sakin / Uyku / Beden" kümesi (DOĞRULANMIŞ KOPYA)

Hazırlanma tarihi: 2026-09-28. Kaynak: PubMed (MCP `search_articles` + `get_article_metadata` / `lookup_article_by_citation`).
Aşağıdaki her makale için başlık, özet ve DOI bu oturumda PubMed kaydından okundu. **Tam metinler okunmadı**; bu yüzden özette yazmayan ayrıntılar (katılımcı sayısı, seans uzunluğu vb.) "doğrulanmadı" olarak işaretlendi.

> **Bağımsız doğrulama notu (2026-09-28, ikinci ajan).** Bu kopya `dossier-sakin.md`'nin karşıt-denetimden geçmiş sürümüdür.
> - **45 iddia** PMID ile PubMed'den yeniden çekildi (`get_article_metadata`): PMID'nin varlığı, DOI eşleşmesi, başlık/tasarım/n/popülasyon ve sayılar özetle karşılaştırıldı. **38'i olduğu gibi doğrulandı, 7'si düzeltildi** (Moszeik 2025, Wahbeh & Fry 2019, Livingston 2018, Van Diest 2014, Balban 2023, Brinsley 2021, Farias 2020). Hiçbir PMID/DOI uyuşmazlığı bulunmadı.
> - İki makalenin **tam metni** PMC'den okundu: Moszeik 2025 (PMC12080877) ve Balban 2023 (PMC9873947). Bu iki madde için yazılanlar tam metne dayanır; diğerleri yalnız özete.
> - Bu turda **yeniden çekilmeyen** PMID'ler (ör. 41144325, 40840566, 38484438, 37489597, 41067763, 41349728, 38595893, 25858651, 39862599, 40868573, 9950067, 35903117, 34727178, 37325754, 37984598, 27684609, 41727805, 40908588, 32863982, 42237303, 41139603, 38281450, 36332326, 37026959, 22843353, 30245619, 36917418, 38179185, 39959506, 29343931, 33461386, 42521250, 42186649, 41743292, 42759488, 42652381, 38350116, 39845426, 35420589, 36169994, 39368335, 41281133, 41968659, 42184377, 6341426) ilk ajanın okumasıdır; bu kopyada **ikinci bir doğrulamadan geçmedi**.
> - Kod atıfları okundu ve doğru bulundu: `app/src/lib/breath.js:2-6` (6/dk, uzun veriş, 4-7-8 yok, sağlık iddiası yok, HRV gösterilmez), `breath.js:14` (`HOLD_MAX = 7`, "VARSAYIM"), `app/src/lib/dataHub.js:13-14` (yeni modül kuralı), `app/src/modules/registry.js:35-39` (`progress.domain` zorunlu, `effects`), `registry.js:57` (`DOMAINS`).
> - Düzeltmeler metinde **[DÜZELTİLDİ]** ile işaretlendi; çıkarılan alt iddialar dosya sonundaki **"Doğrulanamadı / çıkarıldı"** bölümünde.

Dil kuralı (uygulamaya taşınırken): Nefona sağlık iddiası yapmaz. Kanıt tasarım gerekçesidir ve "çalışmada … görüldü" diye yazılır; asla "tedavi eder / iyileştirir" denmez. Aşağıdaki özetler de bu dille yazıldı.

Kısaltmalar: RKÇ = randomize kontrollü çalışma; MA = meta-analiz; SD = sistematik derleme; SMD/g/d = standart etki büyüklüğü; YN = yoga nidra; RoB = yanlılık riski; HRV = kalp hızı değişkenliği; PSQI = Pittsburgh Uyku Kalitesi İndeksi; ISI = Uykusuzluk Şiddet İndeksi.

---

## 0. Tek bakışta

| Pratik | En güçlü kanıt (bu taramada) | Kısa seans / doz kanıtı | Güven |
|---|---|---|---|
| Yoga nidra (YN) | 3 MA (73 çalışma stres/kaygı/depresyon; 12 çalışma ağrı; uyku MA'sı) — hepsi düşük kalite uyarılı | **11 dk ile 30 dk YN doğrudan karşılaştırıldı (RKÇ, n=362)**: ikisi de küçük etki; doğrudan 30–11 karşılaştırmasında yalnız "farkında davranma" farklıydı (d=0,10; %95 GA −0,01–0,44) [DÜZELTİLDİ]. Ağrı MA'sında tek seans / çok seans farkı bulunmadı | Düşük–çok düşük |
| iRest | Küçük pilot RKÇ'ler (n=29, n=30) | 20 dk/gün ev pratiği; uzun izlemde kontrol (tatil+müzik) grubu bazı ölçütlerde daha iyi | Çok düşük |
| Beden taraması | MA (14 RKÇ): tek başına yalnızca farkındalık puanında küçük etki | 10 dk tek seans: klinikte etki var, evde yok (n=55) | Düşük |
| Progresif kas gevşetme (PMR) | 2 MA (14 ve 31 RKÇ) uyku kalitesinde büyük ama çok heterojen etki | Seans sayısı ile uyku etkisi ilişkili bulunmadı; 20 dk tek ses kaydı seansı gevşemeyi artırdı | Düşük |
| Yavaş nefes / pranayama | MA (223 çalışma): tek seans sırasında ve hemen sonrasında vagal HRV artışı; breathwork MA'sı stres g=−0,35 | 5 dk/gün uzun verişli nefes 1 ay (RKÇ, n=108): olumlu duygulanım ve solunum hızında meditasyondan fazla değişim, kaygıda fark yok [DÜZELTİLDİ]; düşük alış/veriş oranı gevşeme bildirimini artırdı | Orta (fizyoloji) / düşük–orta (psikolojik) |
| Rehberli imgeleme | Klinik popülasyonlarda MA'lar (ör. kanser, kaygı SMD −1,30) | Uyku öncesi tek gece imgeleme talimatı uykuya dalışı kısalttı (n=41); 20 dk ses kaydı gevşemeyi artırdı | Düşük |
| Sesli rehberli gevşeme / uyku | Müzik için Cochrane (13 RKÇ, PSQI MD −2,79, orta güven); doğal sesler MA | 10 dk NSDR: bir RKÇ'de küçük etki, diğerinde etki yok | Düşük–orta |
| Restoratif / yin yoga | Küçük RKÇ'ler, çoğu kanser popülasyonu | **Yalnız sesle sunulan restoratif/yin yoga RKÇ'si bulunamadı** | Çok düşük |

"Güven" sütunu bu dosyanın özet değerlendirmesidir; resmî GRADE derecesi yalnızca metinde "GRADE" diye anılan yerlerde MA'ların kendi değerlendirmesidir.

---

## 1. Yoga nidra (YN)

### 1.1 Meta-analizler ve sistematik derlemeler

- **Stres, kaygı, depresyon — Ghai, Odyniec & Ghai 2025.** SD/MA, 73 çalışma, 5.201 katılımcı. Aktif karşılaştırmaya göre stres g=−0,80, kaygı −1,35, depresyon −0,69; karşılaştırmasız: −1,70 / −1,43 / −0,92. Yazarlar düşük metodolojik kalite ve müdahale farklılığı nedeniyle bu etkilerin "muhtemelen şişirilmiş" olduğunu yazıyor. PMID 41327816, DOI [10.1111/nyas.70149](https://doi.org/10.1111/nyas.70149).
- **Uyku — Singh ve ark. 2026.** SD/MA (PROSPERO). PSQI: 2 RKÇ (n=181) SMD −1,04, anlamlı değil (p=0,50); 2 gözlemsel (n=45) SMD −1,82 (p=0,026); ISI: 2 RKÇ (n=99) SMD −1,00 (p=0,06). GRADE: **çok düşük güven**; çalışmalar Hindistan'da toplanmış. PMID 42043659, DOI [10.1007/s11325-026-03685-0](https://doi.org/10.1007/s11325-026-03685-0).
- **Uyku bozuklukları — Dutta ve ark. 2025.** SD, 6 RKÇ, n=244; karşılaştırmalar BDT-U (CBT-I), PMR ve müzikli gevşeme. Çoğu çalışma orta–yüksek RoB; yan etki raporlaması eksik. PMID 41144325, DOI [10.1177/27683605251390728](https://doi.org/10.1177/27683605251390728).
- **Ağrı + doz-yanıt — Ghai & Ghai 2025.** 12 çalışma, n=1.176. Pasif kontrole göre g=−2,05; aktif kontrole göre g=−0,31 (anlamlı değil). **Tek seans ile çok seans alt grupları ve meta-regresyon anlamlı bir doz-yanıt ilişkisi göstermedi.** PMID 41187098, DOI [10.1159/000549416](https://doi.org/10.1159/000549416).
- **Kardiyovasküler — Ghai & Ghai 2025.** 28 çalışma; aktif kontrole göre sistolik KB g=−1,65, diyastolik −1,01, kalp hızı −0,73, LF/HF −0,35; çoğu çalışmada metodolojik sınırlılık. PMID 40840566, DOI [10.1016/j.ctim.2025.103231](https://doi.org/10.1016/j.ctim.2025.103231).
- **Hipertansiyon — Ahuja ve ark. 2024.** 5 RKÇ + 3 RKÇ-dışı, n=482; SKB WMD 12,03 mmHg, DKB 6,32 mmHg düşüş. Not: özet kendi içinde tutarsız (RoB cümlesinde "3 RKÇ / 5 RKÇ-dışı" yazıyor); RoB yüksek/ciddi. PMID 38484438, DOI [10.1016/j.jaim.2023.100882](https://doi.org/10.1016/j.jaim.2023.100882).
- **Bütünleştirici derleme — Musto & Hazard Vallerand 2023.** 29 çalışma (12 RKÇ); seans uzunluğu, sıklığı ve süresi çok farklı olduğu için sonuç çıkarmanın zor olduğu belirtiliyor. PMID 37489597, DOI [10.1111/jnu.12927](https://doi.org/10.1111/jnu.12927).

### 1.2 Kısa seans ve doz (dinleyici dersi kısaltabileceği için kritik)

- **11 dk ve 30 dk YN doğrudan karşılaştırması — Moszeik, Rohleder & Renner 2025.** RKÇ, çevrimiçi, önceden kaydedilmiş ses; 11 dk YN (n=101), 30 dk YN (n=80), 10 dk müzik aktif kontrol (n=74), bekleme listesi (n=107); "ideal olarak her gün", 2 ay. 11 dk grup bekleme listesine göre iyileşme gösterdi (d=0,08–0,16, **küçük**); kısa form aktif kontrole göre depresyonda d=0,13. **[DÜZELTİLDİ — tam metin PMC12080877 okundu]** 30 dk ile 11 dk'nın **doğrudan** karşılaştırmasında yalnızca "farkında davranma" alt boyutunda fark bulundu (d=0,10; %95 GA −0,01 ile 0,44, yani sıfıra çok yakın); "diğer değişkenlerde EG2 ile EG1 arasında anlamlı fark bulunmadı", toplam kortizol farkı yalnızca anlamlılığa yaklaştı; bu fark izlemde kısmen korundu. Özetteki "daha düz kortizol uyanış yanıtı" 30 dk'nın **11 dk'ya değil, aktif kontrol ve bekleme grubuna** karşı sonucudur; aktif kontrole karşı stres, ruminasyon ve kortizol uyanış yanıtı etkileri yalnızca sınırda (p=0,06–0,09) idi. Tam metinde yazarlar "hem uzun hem kısa form stres, kaygı ve depresyonu küçük etki büyüklükleriyle azalttı" diye özetliyor. Pratik sıklığı: 11 dk grupta daha düzenli pratik daha düşük toplam kortizol ve daha dik kortizol eğimleriyle ilişkiliydi; **30 dk formu daha sık yapanlarda ise toplam kortizol daha az düştü ve uyanış yanıtı yükseldi** (yazarlar bunu "daha fazla aktivasyon" olarak yorumluyor). Çalışma sonrası pratiğe devam edenlerin çoğu 11 dk grubundaydı. Çoklu karşılaştırma düzeltmesi yapılmadı; 10 dk müzik (AC) bekleme grubundan anlamlı farklı değildi. PMID 40373021, DOI [10.1002/smi.70049](https://doi.org/10.1002/smi.70049).
  - Tasarım okuması: 11 dakikalık bir sürüm tek başına "tam" bir pratik olarak işlev gördü; 30 dakikanın 11 dakikaya üstünlüğü tek bir alt boyutla ve sıfıra yakın bir güven aralığıyla sınırlı. Etkiler her iki uzunlukta da küçük.
- **Tek 16 dk seans — Ahuja ve ark. 2025.** Tek kollu, n=32 hipertansif yetişkin; tek 16 dk YN sonrası SKB −7, DKB −6 mmHg ve HRV artışı görüldü. **Kontrol grubu yok.** PMID 39974253, DOI [10.7759/cureus.77717](https://doi.org/10.7759/cureus.77717).
- **Tek 30 dk seans, uyku laboratuvarı — Sharpe ve ark. 2023.** n=22 (kendi bildirimli uykusuzluk). 30 dk ses kaydıyla YN, sessiz uzanmaya göre alfa EEG, HRV ve **uykuya dalma süresinde fark yaratmadı**; solunum hızı YN sırasında −1,4, sonrasında −2,1 nefes/dk düştü (kontrol +0,2/+0,4; p=0,03). Kabul edilebilirlik iyi, bırakma %5. PMID 36731199, DOI [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169).
- **12 dk kayıtlı YN protokolü — Kumari ve ark. 2025.** Protokol (sonuç yok): 12 dk önceden kaydedilmiş YN, haftada 3, 4 hafta, uyku eğitimine karşı, n=160 tıp öğrencisi. PMID 41067763, DOI [10.1136/bmjopen-2025-103725](https://doi.org/10.1136/bmjopen-2025-103725).
- **iRest'te katılım ile ilişki — Livingston & Collette-Merrill 2018.** Öncesi-sonrası, n=15 sağlık çalışanı, 8 hafta. Epworth uykululuk ortalamasında anlamlı fark yok; ancak "ortalama ESS iyileşme puanı" ile katılınan hafta sayısı arasında güçlü **negatif** korelasyon (rs=−0,705, p=0,003). **[DÜZELTİLDİ]** İyileşme puanının nasıl hesaplandığı özette yok; bu yüzden ilişkinin "daha çok hafta = daha çok iyileşme" yönünde olduğu **doğrulanmadı** (tam metin PMC'de yok). FFMQ öncesi-sonrası artışı: z=−3,294, p=0,001. Kontrol grubu yok. PMID 29642130, DOI [10.1097/HNP.0000000000000266](https://doi.org/10.1097/HNP.0000000000000266).

### 1.3 Aktif karşılaştırmalı RKÇ'ler

- **BDT-U'ya karşı — Datta ve ark. 2021.** RKÇ, n=41 kronik uykusuzluk (BDT-U n=20, YN n=21). Her iki grupta da öznel toplam uyku süresi, uyku verimliliği ve uyku sonrası uyanıklıkta iyileşme; PSG (yalnız gönüllülerde) YN'de N2% ve N3% artışı; YN sonrası tükürük kortizolü azaldı (p=0,041). Yazarlar "gözetimli pratik seanslarından sonra" kullanımı öneriyor. PMID 34825538, DOI [10.25259/NMJI_63_19](https://doi.org/10.25259/NMJI_63_19).
- **Müzikle gevşemeye karşı — Gunjiganvi ve ark. 2023.** Açık etiketli RKÇ, n=79 COVID-19 ön saf sağlık çalışanı; YouTube üzerinden günde 30 dk, 2 haftalık görev dönemi. YN grubunda PHQ-9 5,17→3,03, GAD-7 4,93→2,33, ISI 6,10→3,03 (grup içi p≤0,002); müzik grubunda anlamlı değişim yok. Özette gruplar arası test değil grup içi p'ler raporlanmış. PMID 37327384, DOI [10.17761/2023-D-22-00011](https://doi.org/10.17761/2023-D-22-00011).
- **Sahte YN'ye karşı (negatif sonuç) — Gomathy ve ark. 2026.** Açık etiketli pilot RKÇ, n=50 fonksiyonel dissosiyatif nöbet; ses kaydıyla standart YN + psikoeğitim, sahte YN + psikoeğitime karşı. Birincil sonuçta fark yok (p=0,88). PMID 42402245, DOI [10.1016/j.yebeh.2026.111180](https://doi.org/10.1016/j.yebeh.2026.111180).
- **Kanser, olağan bakıma karşı — Baruah ve ark. 2025.** RKÇ, n=40; 25 dk, günde 2, haftada 5 gün, 1 ay; sıkıntı (p=0,001) ve yaşam kalitesi alanlarında kontrolden iyi. PMID 41349728, DOI [10.1016/j.ctim.2025.103313](https://doi.org/10.1016/j.ctim.2025.103313).
- **YN + pranayama, serviks kanseri — Nuzhath ve ark. 2024.** RKÇ, n=70; 30 dk, günde 2, haftada 5, 6 hafta; HADS iyileşmesi. PMID 38595893, DOI [10.7759/cureus.55871](https://doi.org/10.7759/cureus.55871).

### 1.4 iRest (Integrative Restoration)

- **Yaşlı yetişkinler, pilot RKÇ — Wahbeh & Nelson 2018.** n=30, 55–90 yaş, depresif belirtiler; 2 günlük iRest ya da "tatil" inzivası, ardından 6 hafta günde 20 dk ev pratiği (rehberli iRest ya da **müzik**). Uygulanabilir; 6. haftada uyku bozukluğunda kontrole göre iyileşme. PMID 30354905, DOI [10.17761/2019-00036](https://doi.org/10.17761/2019-00036).
- **Aynı çalışmanın 6/12 ay izlemi — Wahbeh & Fry 2019.** n=25 (12. ayda 9 kişi hâlâ pratik yapıyordu: 5 iRest, 4 tatil). Her iki grupta başlangıca göre depresyon puanı iyileşti; depresyon ve diğer ölçütlerde gruplar arasında fark yok; **olumsuz duygu durumu ve algılanan stres "tatil" (müzik) grubunda daha iyi**; meditasyon pratiği **depresyon puanındaki** iyileşmeyi anlamlı biçimde yordamadı [DÜZELTİLDİ: özet yalnız depresyon puanı için söylüyor]. Makale PubMed'de RKÇ olarak etiketli değil (RKÇ izlemi). PMID 30664388, DOI [10.17761/2019-00029](https://doi.org/10.17761/2019-00029).
- **Uyku, 3 kollu RKÇ — Gutman ve ark. 2017.** n=29; 7 gün uyku hijyeni sonrası 14 gün: iRest (n=9) / özel yastık (n=10) / yalnız hijyen (n=10). iRest grubunda uyku süresi yastığa (d=1,87) ve hijyene (d=1,80) göre daha uzun; uyku kalitesi, uykuya dalma süresi ve ertesi gün yorgunlukta fark yok. (iRest kurucusu R. Miller ortak yazar.) PMID 27760887, DOI [10.1177/1539449216673045](https://doi.org/10.1177/1539449216673045).
- **Cinsel travma, pilot — Pence ve ark. 2014.** 15 kayıt, 10 tamamlayan; 90 dk, haftada 2, 10 hafta; PTSD belirtileri d=0,66. Kayıtta DOI yok. PMID 25858651, DOI: kayıtta yok (doğrulanmadı).
- **Ağrı, nitel — Barber ve ark. 2025.** 6 haftalık iRest ağrı grubu; "Ben ağrı değilim, ağrım var" teması (ağrıdan kimlik ayrışması). PMID 39862599, DOI [10.1016/j.ctcp.2025.101955](https://doi.org/10.1016/j.ctcp.2025.101955).

### 1.5 Klasik yapı (Satyananda) ve aşamaların test edilip edilmediği

- **Köken:** Pandi-Perumal ve ark. 2022 anlatı derlemesi, uygulamanın 1960'larda Swami Satyananda Saraswati tarafından sistemleştirildiğini; rehberli imgelemenin şavasana ile birleştiğini ve çevreye dair farkındalığın sürdüğünü yazıyor; hafif (ağır değil) depresyon/kaygıda fayda bildirimi. PMID 35496325, DOI [10.1007/s41782-022-00202-7](https://doi.org/10.1007/s41782-022-00202-7).
- **Aşama adları PubMed'de nerede doğrulandı:** Luu 2024 travma-duyarlı YN için 10 bileşen sayıyor: (1) güvenli ve rahat ortam, (2) özerklik, sınır ve onay, (3) becerikli farkındalık, (4) **uygun uzunluk ve hazırlık**, (5) **yeterli yerleşme ve dışa dönüş**, (6) **uyku izni**, (7) **kendi seçtiği niyet**, (8) **esnek beden dolaşımı ve nefes farkındalığı**, (9) **bedende hissedilen zıtlık çiftleri**, (10) **özenli imgeleme**. Aynı makale YN sonrası bildirilen olumsuz tepkileri (bunaltıcı geri dönüşler, duygusal sıkıntı, uzamış dissosiyasyon) not ediyor. PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021).
- **Sankalpa (niyet):** di Fronso 2025 görüş yazısı; YN'yi "nefes, rehberli beden farkındalığı, imgeleme ve bilişsel yeniden yapılandırma" dizisi olarak tanımlıyor; sankalpa'nın mekanizmasının araştırılmadığını söylüyor. PMID 40868573, DOI [10.3390/healthcare13161957](https://doi.org/10.3390/healthcare13161957).
- **Sekiz aşamalı sıra** (hazırlık → sankalpa → beden dolaşımı → nefes farkındalığı → zıtlık çiftleri → imgeleme → sankalpa → dışa dönüş): aşamaların adları yukarıdaki PubMed kayıtlarıyla örtüşüyor; **bu tam sıranın özgün Satyananda metnindeki hali PubMed'de doğrulanmadı.**
- **Aşamaları ayrı ayrı test eden çalışma: bulunamadı.** "sankalpa / rotation of consciousness / stages / Satyananda" aramasında (12 kayıt) yalnızca görüş, anlatı derlemesi ve mekanizma çalışmaları çıktı. (İkinci ajan ayrı bir aramayla — `yoga nidra (component OR components OR dismantling OR sankalpa OR "rotation of consciousness")`, 11 kayıt — da bileşen/ayrıştırma çalışması bulmadı; bu, böyle bir çalışmanın olmadığını kanıtlamaz, yalnızca bu iki aramada çıkmadığını gösterir.) Moszeik 2025 tam metnine göre her iki ses kaydı da Satyananda / Bihar Yoga Okulu öğretisine dayanıyor ve başta ve sonda tekrarlanan kişisel niyet içeriyordu; kayıtlar Almanca ve **arka plan müziği olmadan** sunuldu. İki sürümün bileşen listeleri PMC metninde çıkarılamadı (doğrulanmadı). Tasarım için anlamı: bu alandaki tek doğrudan uzunluk karşılaştırması müziksiz sesle yapıldı; ses + müzik birleşiminin etkisi bu çalışmadan çıkarılamaz. Bileşen karşılaştırmasına en yakın veri: **Gibbs ve ark. 2026**, yarı deneysel, n=23 kronik ağrı; tek 45 dk YN (n=12; niyet, imgeleme ve gevşeme içeriyor) ile beden taraması (n=11) karşılaştırıldı: ikisi de ağrı şiddetini ve ağrı kaygısını azalttı; **YN hemen sonrasında iyi oluşta daha fazla artış** gösterdi (p=0,01). PMID 41743305, DOI [10.4103/ijoy.ijoy_2_25](https://doi.org/10.4103/ijoy.ijoy_2_25).

### 1.6 Mekanizma / fenomenoloji (tasarım için, iddia için değil)

- **Dopamin, PET — Kjaer ve ark. 2002.** 11C-raklopride PET: YN sırasında ventral striatumda bağlanma %7,9 azaldı (yaklaşık %65 endojen dopamin artışına karşılık geliyor); EEG teta artışıyla ilişkili; katılımcılar eyleme isteğin azaldığını ve duyusal imgelemin arttığını bildirdi. **Gevşeme derinliği ve hoşnutluk, konuşma dinleme koşulundan farklı değildi.** Katılımcı sayısı özette yok (doğrulanmadı). PMID 11958969, DOI [10.1016/s0926-6410(01)00106-9](https://doi.org/10.1016/s0926-6410(01)00106-9).
- **Kan akımı, PET — Lou ve ark. 1999.** n=9 deneyimli yoga öğretmeni; YN'de imgeleme ağlarında (arka duyusal/çağrışım korteksi) göreli artış, dinlenmede yürütücü ağda artış. PMID 9950067, DOI [10.1002/(SICI)1097-0193(1999)7:2<98::AID-HBM3>3.0.CO;2-M](https://doi.org/10.1002/(SICI)1097-0193(1999)7:2<98::AID-HBM3>3.0.CO;2-M).
- **"Yerel uyku" — Datta ve ark. 2022.** n=30 (PSG n=26); 2 haftalık pratik sonrası YN seansı boyunca kişi uyanık olarak puanlandı, merkezi bölgede delta gücü arttı; uyku günlüğü iyileşti (kontrol yok). PMID 35903117, DOI [10.3389/fneur.2022.910794](https://doi.org/10.3389/fneur.2022.910794).
- **Fenomenoloji — Zaccaro ve ark. 2021.** n=6, 12 adet 2 saatlik seans; uyku belirteci (K-kompleks, iğcik) görülmedi; değişmiş bilinç, beden imgesi değişimi, istemli düşünce kontrolünde azalma bildirildi. PMID 34727178, DOI [10.17761/2021-D-20-00014](https://doi.org/10.17761/2021-D-20-00014).

---

## 2. Beden taraması (body scan / "bilinç dolaşımı")

- **MA — Gan, Zhang & Chen 2022.** 14 RKÇ. Tek başına beden taraması yalnızca pasif kontrole göre farkındalıkta küçük etki gösterdi (g=0,268, %95 GA 0,032–0,504); çalışma kalitesi düşük, heterojenlik yüksek. Yazarların sonucu: "Tek başına beden taraması sağlıkla ilgili sonuçları iyileştirmeye yetecek kadar etkili değil." Uzun süreli müdahalelerde bırakma düşük. PMID 35538557, DOI [10.1111/aphw.12366](https://doi.org/10.1111/aphw.12366).
- **10 dk tek seans, klinik ve ev — Ussher ve ark. 2014.** RKÇ, n=55 kronik ağrı; 10 dk ses kaydı beden taraması (n=27) ile doğa tarihi okumasına (n=28) karşı, 24 saat içinde 2 kez. Klinikte ağrıyla ilgili sıkıntı (p=0,005) ve sosyal etkileşim (p=0,036) daha iyi; **kişinin kendi ortamında fark yok.** PMID 23129105, DOI [10.1007/s10865-012-9466-5](https://doi.org/10.1007/s10865-012-9466-5).
- **Kısa seans fizyolojisi — Ditto, Eclache & Goldman 2006.** Çalışma 1: n=32 beden taraması / PMR / bekleme; Çalışma 2: n=30 kişi-içi, beden taraması ile sesli roman dinleme. Beden taraması sırasında solunumsal sinüs aritmisi diğer gevşetici etkinliklerden fazla arttı; kalp hızı değişmedi. PMID 17107296, DOI [10.1207/s15324796abm3203_9](https://doi.org/10.1207/s15324796abm3203_9).
- **10 dk, olumsuz sonuç — Aras ve ark. 2023.** Çapraz RKÇ, n=9 profesyonel kadın basketbolcu; efor sonrası 10 dk video beden taraması, 10 dk doğa belgeseline göre HRV/bilişsel toparlanmaya ek fayda sağlamadı. PMID 37325754, DOI [10.3389/fpsyg.2023.1196066](https://doi.org/10.3389/fpsyg.2023.1196066).
- **10 dk, durum farkındalığı — Ahmadyar, Robinson & Tapper 2023.** n=137; 10 dk beden taraması 10 dk görselleştirmeye göre anlık farkındalığı artırdı; yeme davranışına etkisi yok. PMID 37984598, DOI [10.1016/j.appet.2023.107131](https://doi.org/10.1016/j.appet.2023.107131).
- **Beden sınırlarının çözülmesi ve mutluluk — Dambrun 2016.** RKÇ, n=53; beden taraması algılanan beden sınırı belirginliğini azalttı; mutluluk arttı, kaygı azaldı; mutluluk artışı beden sınırı değişimiyle aracılandı. PMID 27684609, DOI [10.1016/j.concog.2016.09.013](https://doi.org/10.1016/j.concog.2016.09.013). Kuramsal çerçeve: Becattini ve ark. 2026, PMID 41727805, DOI [10.1093/nc/niag001](https://doi.org/10.1093/nc/niag001).
- **Çok seans, iç algı — Fischer, Messner & Pollatos 2017.** Günde 20 dk ses kaydı beden taraması, 8 hafta; Ç1 n=25 vs sesli kitap n=24; Ç2 n=18 vs pasif n=18; kalp atışı algı doğruluğu yalnızca beden taraması grubunda anlamlı arttı. PMID 28955213, DOI [10.3389/fnhum.2017.00452](https://doi.org/10.3389/fnhum.2017.00452).
- **2 hafta, iki ön-kayıtlı RKÇ — Schwerdtfeger, Weber & Rominger 2025.** Ç1 n=85 beden taraması vs **rehberli imgeleme** (her iki grupta zaman etkisi; üstünlük yok); Ç2 n=90 vs pasif kontrol (iç algı ölçütlerinde iyileşme). Yazarlar rehberli imgelemenin benzer etki verebileceğini not ediyor. PMID 40908588, DOI [10.1111/aphw.70073](https://doi.org/10.1111/aphw.70073).
- **PTSD'li gaziler, 4 kollu RKÇ — Colgan ve ark. 2016.** n=102: beden taraması (27) / farkındalıklı nefes (25) / yavaş nefes (25) / sessiz oturma (25). Farkındalık grupları PTSD ve depresyonda azalma gösterdi; yavaş nefes ve sessiz oturma göstermedi. PMID 32863982, DOI [10.1007/s12671-015-0453-0](https://doi.org/10.1007/s12671-015-0453-0).
- **Günde 10 dk, 4 hafta — Yaemrattanakul ve ark. 2026.** Değerlendirici-kör RKÇ, n=56; oturarak meditasyon ile beden taraması arasında hiçbir sonuçta fark yok. PMID 42237303, DOI [10.1186/s40359-026-04923-6](https://doi.org/10.1186/s40359-026-04923-6).
- **Doğa sesleri ile karşılaştırma — Kim, Nam & Lee 2025.** fNIRS, n=40 acemi; dorsolateral–medial prefrontal bağlantı **doğa sesleriyle dinlenmede** beden taramasından daha yüksekti. PMID 41139603, DOI [10.9758/cpn.25.1277](https://doi.org/10.9758/cpn.25.1277).

---

## 3. Progresif kas gevşetme (PMR)

- **Uyku, MA + seans sayısı meta-regresyonu — Li ve ark. 2026.** 14 RKÇ, n=957; uyku kalitesi g=−1,24 (−1,71 ile −0,77), I²=%85,5. 55 yaş altı anlamlı (g=−1,40), 55 ve üstü anlamlı değil (g=−1,17; GA −2,67 ile 0,32). **Seans sayısı ile uyku kalitesi arasında ilişki bulunmadı (p=0,21).** PMID 42625730, DOI [10.3389/fpubh.2026.1906525](https://doi.org/10.3389/fpubh.2026.1906525).
- **Uyku ve ruh sağlığı, MA — Donato ve ark. 2026.** 31 RKÇ, n=2.277; uyku SMD −1,74 (I²=%92,1), PSQI MD −3,79; kaygı SMD −1,11; yaşam kalitesi 1,32. Hafta cinsinden süre alt gruplarının hepsinde etki. PMID 41633054, DOI [10.1016/j.jpsychores.2026.112563](https://doi.org/10.1016/j.jpsychores.2026.112563).
- **Kanser, MA'lar.** Wang ve ark. 2024: 12 RKÇ, n=1.047; yorgunluk SMD −1,06, kaygı −1,09, depresyon −1,43, uyku MD −1,41; GRADE düşük/çok düşük. PMID 38281450, DOI [10.1016/j.ijnurstu.2024.104694](https://doi.org/10.1016/j.ijnurstu.2024.104694). Tan ve ark. 2022: 12 RKÇ, n=1.147; kaygı −1,32, ağrı −1,02; yorgunlukta anlamlı değil. PMID 36332326, DOI [10.1016/j.ctcp.2022.101676](https://doi.org/10.1016/j.ctcp.2022.101676).
- **COVID-19, MA (uyku anlamlı değil) — Seid ve ark. 2023.** 4 çalışma, n=227; uyku SMD −0,23 (p=0,13, anlamlı değil); kaygı −1,35. PMID 37026959, DOI [10.1097/MD.0000000000033464](https://doi.org/10.1097/MD.0000000000033464).
- **Tek 20 dk ses kaydı: PMR, derin nefes ve imgeleme yan yana — Toussaint ve ark. 2021.** RKÇ, n=60 üniversite öğrencisi, 4 kol; 20 dk kayıtlı ses talimatı. Üç yöntem de kontrole göre psikolojik gevşemeyi artırdı. PMR ve imgeleme fizyolojik gevşemeye (deri iletkenliği, kalp hızı) doğrusal bir eğilim gösterdi; **derin nefes grubunda önce fizyolojik uyarılma arttı, sonra başlangıç düzeyine döndü.** PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040).
- **Şizofreni, SD — Vancampfort ve ark. 2013.** 3 RKÇ, n=146; PMR anlık durum kaygısını ve sıkıntıyı azalttı; yan etki bildirilmedi; **doz-yanıt belirlenemedi.** PMID 22843353, DOI [10.1177/0269215512455531](https://doi.org/10.1177/0269215512455531).

---

## 4. Yavaş nefes ve pranayama

### 4.1 Yavaş tempo (~6 nefes/dk), tek seans

- **Tek seans sırasında ve hemen sonrasında — Laborde ve ark. 2022.** SD/MA, 223 çalışma (172 "seans sırasında", 16 "tek seanstan hemen sonra", 49 "çok seanslı program sonrası"). Üç zaman noktasında da vagal aracılı HRV arttı. PMID 35623448, DOI [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711).
- **Psikofizyoloji SD — Zaccaro ve ark. 2018.** 15 makale, sağlıklı kişilerde <10 nefes/dk: HRV ve RSA artışı, EEG alfa artışı/teta azalması; rahatlık, gevşeme, canlılık ve uyanıklıkta artış; kaygı, öfke ve karışıklıkta azalma. PMID 30245619, DOI [10.3389/fnhum.2018.00353](https://doi.org/10.3389/fnhum.2018.00353).
- **Breathwork MA — Fincham ve ark. 2023.** 12 RKÇ, n=785; stres g=−0,35 (−0,55 ile −0,14), kaygı g=−0,32 (k=20), depresyon g=−0,40 (k=18); çoğu çalışma orta RoB. Yazarlar "abartı ile kanıt arasında yanlış ayar" konusunda uyarıyor. PMID 36624160, DOI [10.1038/s41598-022-27247-y](https://doi.org/10.1038/s41598-022-27247-y).
- **Yatmadan önce yavaş nefes ve uyku, SD — Eide, Hernes & Grønli 2026.** 9 çalışma, n=457, ≤10 nefes/dk. Öznel uyku süresi ve kalitesi iyileşti; aktigrafi (2) ve PSG (3) ile objektif sonuçlar **belirsiz**. Objektif çalışmaların 3'ü tek günlük protokol; öznel çalışmaların 5'i 28–30 gün. PMID 41886931, DOI [10.1016/j.smrv.2026.102284](https://doi.org/10.1016/j.smrv.2026.102284).
- **6/dk "sabit tempo" protokolü — Lalanza ve ark. 2023.** 143 HRV biyogeribildirim çalışmasının SD'si; 51'i herkesin aynı tempoda (çoğunlukla 6 nefes/dk) nefes aldığı protokol. Çalışmaların yaklaşık 2/3'ü süre, alış/veriş oranı ve beden pozisyonunu tekrarlanabilir biçimde raporlamamış. PMID 36917418, DOI [10.1007/s10484-023-09582-6](https://doi.org/10.1007/s10484-023-09582-6).
- **Ritmik okuma 6/dk — Bernardi ve ark. 2001.** n=23; tespih duası ve yoga mantrası dakikada 6 kez okunduğunda kardiyovasküler ritimler senkron biçimde güçlendi; barorefleks duyarlılığı 9,5→11,5 ms/mmHg. PMID 11751348, DOI [10.1136/bmj.323.7327.1446](https://doi.org/10.1136/bmj.323.7327.1446).

### 4.2 Uzun veriş

- **Alış/veriş oranı — Van Diest ve ark. 2014.** n=30; 6 ya da 12 nefes/dk × alış/veriş oranı 0,42 ya da 2,33. **Kısa alış / uzun veriş (0,42)**, yüksek orana (2,33; uzun alış / kısa veriş) göre daha fazla gevşeme, stres azalması, farkındalık ve olumlu enerji bildirimiyle ilişkiliydi [DÜZELTİLDİ: karşılaştırma "düşük orana karşı yüksek oran"dır, "tempoyu yavaşlatmaya karşı" değil]; daha düşük tempo (6'ya karşı 12/dk) yalnızca "olumlu enerji" puanıyla ilişkiliydi. Yüksek frekanslı HRV artışı yalnızca yavaş + uzun veriş kombinasyonunda. PMID 25156003, DOI [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x).
- **Günde 5 dk — Balban ve ark. 2023.** Uzaktan RKÇ (NCT05304000); günde 5 dk, 1 ay: döngüsel iç çekme (uzun veriş), kutu nefes, döngüsel hiperventilasyon ve 5 dk farkındalık meditasyonu. Nefes egzersizleri, özellikle uzun verişli döngüsel iç çekme, meditasyona göre duygu durumunda daha fazla iyileşme ve solunum hızında daha fazla azalma gösterdi (p<0,05). **[DÜZELTİLDİ — tam metin PMC9873947 okundu]** n=108 (meditasyon 24, döngüsel iç çekme 30, kutu 21, döngüsel hiperventilasyon 33); çoğu Stanford lisans öğrencisi. "Duygu durumu" = **günlük olumlu duygulanım (PANAS)**; durumluk kaygı ve olumsuz duygulanımdaki günlük azalmada **gruplar arasında fark yoktu** (dört grupta da seans öncesi→sonrası azalma vardı). Solunum hızı WHOOP bilekliğiyle uyku sırasında ölçülen günlük değerin 28 günlük eğimidir; HRV, dinlenik kalp hızı ve uyku ölçütlerinde hiçbir grupta değişim yoktu. Döngüsel iç çekme: burundan iki alış (ikincisi kısa) + ağızdan uzun veriş. Olumlu duygulanım artışı uyum günleriyle büyüdü. Çalışma geriye dönük kayıtlı, keşif amaçlı; alt grup karşılaştırmaları için güç düşük. PMID 36630953, DOI [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895).
- Uyarı: Toussaint 2021'de (bkz. §3) "derin nefes" talimatı önce uyarılmayı artırdı. "Derin/büyük nefes" talimatı ile "yavaş, yumuşak, verişi uzun nefes" aynı şey değil.

### 4.3 Nadi şodhana / anulom vilom (sırayla burun deliği)

- **Nefes egzersizleri ve kan basıncı, MA — Garg ve ark. 2023.** 15 RKÇ (bhramari, sırayla burun deliği, derin, yavaş dahil); SKB −7,06, DKB −3,43 mmHg, kalp hızı −2,41/dk; yazarlar yanlılıktan arınmış olmadığını belirtiyor. PMID 38179185, DOI [10.1016/j.ijcrp.2023.200232](https://doi.org/10.1016/j.ijcrp.2023.200232).
- **Tek seans — Pai ve ark. 2024.** RKÇ, n=132 normotansif; Chandra anulom vilom ve sırayla burun deliği nefesi, Surya anulom vilom'a göre SKB/DKB'de daha fazla düşüş; sırayla burun deliği nefesinde ortalama arter basıncı kontrolden düşük. PMID 39959506, DOI [10.4103/ijoy.ijoy_115_24](https://doi.org/10.4103/ijoy.ijoy_115_24).
- **12 hafta — Naik, Gaur & Pal 2018.** RKÇ, n=100 genç erkek; günde 30 dk, haftada 5, 12 hafta, gözetimli; algılanan stres, kalp hızı, SKB, DKB azaldı. PMID 29343931, DOI [10.4103/ijoy.IJOY_41_16](https://doi.org/10.4103/ijoy.IJOY_41_16).
- **Oksijen tüketimi — Singh, Sharma, Telles & Balkrishna 2024.** Çapraz, n=47 erkek, 33 dk seanslar: sağ/sol/sırayla burun deliği yoga nefeslerinde oksijen tüketimi yaklaşık %9–10 arttı; nefes farkındalığı ve sessiz dinlenmede artmadı. Diyastolik KB tüm seanslardan sonra düştü. PMID 38899139, DOI [10.4103/ijoy.ijoy_248_23](https://doi.org/10.4103/ijoy.ijoy_248_23).
- SD — Rung ve ark. 2021: RKÇ'lerde sırayla burun deliği nefesinin stresi azalttığı; örneklemler çoğunlukla Hintli ve erkek. PMID 33461386, DOI [10.1177/0898010120983659](https://doi.org/10.1177/0898010120983659).

### 4.4 Bhramari (arı vızıltısı nefesi)

- **Nefes uzunluğu — Trivedi ve ark. 2023.** Randomize kişi-içi çapraz, n=118; vızıltılı nefeste 8, 10, 12 ve 14 sn döngüler denendi; en yüksek HRV **12–14 sn** döngüde (biyogeribildirimde bildirilen ~10 sn yerine). PMID 38204770, DOI [10.4103/ijoy.ijoy_113_23](https://doi.org/10.4103/ijoy.ijoy_113_23).
- **Tek 5 dk seans, kontrolsüz — Malhotra ve ark. 2026.** n=20; RMSSD 29,95→45,83 ms; LF/HF 0,8→11,03; EEG'de delta/teta azalması, beta/gama artışı ("kortikal uyanıklık"). Kontrolsüz ve küçük. PMID 42521250, DOI [10.17761/2026-D-25-00058](https://doi.org/10.17761/2026-D-25-00058).
- **Tek 10 dk seans, kontrolsüz — Devipriya ve ark. 2026.** n=60; 15 döngü, 4 sn alış / 6 sn vızıltılı veriş; tepki süresi kısaldı. PMID 42186649, DOI [10.7759/cureus.107617](https://doi.org/10.7759/cureus.107617).
- **Yavaş nefese karşı RKÇ — Poojary ve ark. 2025.** n=68 tip 2 diyabet + ağız kuruluğu; 20 dk değiştirilmiş bhramari, 20 dk yavaş nefese göre tükürük nitrik oksidi ve HRV'de daha fazla artış. PMID 41743292, DOI [10.4103/ijoy.ijoy_253_24](https://doi.org/10.4103/ijoy.ijoy_253_24).

### 4.5 Uygulamada zaten var olan nefes kuralları (kod)

- `app/src/lib/breath.js:2-6` — uygulamanın nefes motoru "dakikada ~6 nefes" (Laborde 2022), uzun veriş (Balban 2023), "4-7-8 ve hızlı soluma yok", "ilk seanslarda 6/dk nefes darlığı hissi verebilir (You 2021) → ilk 3 seans daha hızlı kademe" ve "Sağlık iddiası yok ... HRV ölçülmez, gösterilmez" kurallarını yazıyor. `breath.js:14` nefes tutma üst sınırı `HOLD_MAX = 7` sn. Bu dosyada anılan **Marchant 2025 ve You 2021 bu oturumda PubMed'den çekilmedi (doğrulanmadı).** Yoga nefesleri bu kurallarla çelişmemeli.

---

## 5. Rehberli imgeleme

- **Uyku öncesi imgeleme — Harvey & Payne 2002.** Kontrollü klinik çalışma, n=41 uykusuzluk; deney gecesinde "imgelemeyle dikkat dağıtma", genel dikkat dağıtma ya da talimat yok. İmgeleme grubu talimatsız gruba göre daha kısa uykuya dalma süresi ve daha az uyku öncesi zihinsel etkinlik bildirdi. Yazarlar etkiyi, ilgi çekici ve belirli bir imgenin "bilişsel alanı doldurmasına" bağlıyor. PMID 11863237, DOI [10.1016/s0005-7967(01)00012-2](https://doi.org/10.1016/s0005-7967(01)00012-2).
- **Kanser, MA — Bozkurt-Duman ve ark. 2025.** 9 RKÇ, n=837; kaygı SMD −1,30, depresyon −1,11, yaşam kalitesi 1,11. **Seans süresi ve sıklığı için standart yok.** PMID 41094273, DOI [10.1007/s00520-025-10016-8](https://doi.org/10.1007/s00520-025-10016-8).
- **Yoğun bakım, MA — Talhaoğlu, Demir & Uzun 2026.** 8 çalışma; genel iyi oluş SMD 0,557 (0,174–0,940), I²=%67. PMID 42759488, DOI [10.1016/j.explore.2026.103528](https://doi.org/10.1016/j.explore.2026.103528).
- **Kadın sağlığı, SD — Şen & Gözen 2026.** 29 çalışma (27 RKÇ), n=1.939; kaygı, stres, depresyon, ağrı ve yorgunlukta azalma bildirimi. PMID 42652381, DOI [10.3390/ijerph23081066](https://doi.org/10.3390/ijerph23081066).
- **Palyatif bakım, SD — Correa-Morales ve ark. 2024.** 14 RKÇ; 10'unda etkili; RoB: 4 yüksek, 9 "bazı endişeler", 1 düşük. PMID 38350116, DOI [10.1089/jpm.2023.0445](https://doi.org/10.1089/jpm.2023.0445).
- **Ameliyat öncesi kaygı, SD — Anamagh ve ark. 2024.** 9 çalışma; içerik, süre ve sıklık çok farklı; hasta memnuniyeti yüksek. PMID 39845426, DOI [10.1016/j.sipas.2024.100255](https://doi.org/10.1016/j.sipas.2024.100255).
- Tek seans 20 dk ses kaydı ile fizyolojik gevşeme eğilimi: Toussaint 2021 (§3).

---

## 6. Sesli rehberli gevşeme; müzik, doğa sesi ve sessizlik

- **Müzik ve uykusuzluk, Cochrane — Jespersen ve ark. 2022.** 13 RKÇ, n=1.007; günde 25–60 dk kayıtlı müzik, 3 gün–3 ay. PSQI MD −2,79 (10 çalışma, 708 kişi, **orta güven**); uykusuzluk şiddetinde net fark yok (çok düşük güven); uykuya dalma süresinde düşük güvenli iyileşme; **objektif ölçümlerde iyileşme görülmedi** (3 çalışma, 136 kişi); yan etki bildirilmedi. PMID 36000763, DOI [10.1002/14651858.CD010459.pub3](https://doi.org/10.1002/14651858.CD010459.pub3).
- **Doğal sesler, SD/MA — Buxton ve ark. 2021.** 36 yayın, 18'i MA'da; stres ve rahatsızlıkta azalma (−0,60; −0,97 ile −0,23), sağlık ve olumlu duygu sonuçlarında artış (1,63; 0,09 ile 3,16). Su, rüzgâr ve hayvan sesleri öne çıkıyor. PMID 33753555, DOI [10.1073/pnas.2013097118](https://doi.org/10.1073/pnas.2013097118).
- **Tempo ve sessizlik — Bernardi, Porta & Sleight 2006.** n=24 (12 müzisyen, 12 kontrol); 6 müzik türü + rastgele eklenen 2 dk'lık **sessizlik**. Hızlı tempo **ve daha basit ritim yapıları** solunumu, kan basıncını ve kalp hızını başlangıca göre artırdı. **Sessizlik aralığı kalp hızını, kan basıncını ve dakika ventilasyonunu başlangıç düzeyinin de altına indirdi**; yavaş/meditatif müzik gevşetici, gevşeme en çok duraklamada belirgin. PMID 16199412, DOI [10.1136/hrt.2005.064600](https://doi.org/10.1136/hrt.2005.064600).
- **Sesli hipnotik telkin ve derin uyku — Cordi, Schlarb & Rasch 2014.** Kişi-içi, plasebo kontrollü çapraz, n=70 sağlıklı genç kadın; 90 dk öğle uykusu öncesi "daha derin uyu" telkinli ses metni ya da kontrol kaydı. Yavaş dalga uykusu %81 arttı, uyanık süre %67 azaldı; **etki yalnızca telkine yatkın kişilerde vardı, düşük yatkınlıkta görülmedi** (bu, özette "ek deneyler" olarak geçiyor; ana deney ile ek deneylerin n dağılımı özette yok — doğrulanmadı). Kayıt süresi özette yok (doğrulanmadı). PMID 24882909, DOI [10.5665/sleep.3778](https://doi.org/10.5665/sleep.3778).
- **Uygulama tabanlı çalışmalar (ses kaydı ile sunum):**
  - Lew ve ark. 2025, pilot RKÇ n=80: Calm uyku bölümü günde 20 dk, haftada 5 gün, 30 gün; kaygı, stres ve PSQI'de uygulamasız gruba göre iyileşme; **katılımcıların yalnızca %54'ü önerilen asgari süreyi tuttu.** PMID 40498669, DOI [10.2196/66131](https://doi.org/10.2196/66131).
  - Daniel ve ark. 2025, RKÇ n=606 çalışan: 10 günlük uygulama farkındalık programı; uyku faydası hemen görüldü, **yaklaşık 3 ay sonra kayboldu**; depresyonda etki, kaygıda yok. PMID 39945273, DOI [10.1002/smi.70017](https://doi.org/10.1002/smi.70017).
  - Gao ve ark. 2022, RKÇ n=80: endişeye bağlı uyku bozukluğu 2 ayda %27 vs %6 azaldı; **Fitbit ile ölçülen uyku süresi/verimliliğinde fark yok.** PMID 35420589, DOI [10.1097/PSY.0000000000001083](https://doi.org/10.1097/PSY.0000000000001083).
  - Espel-Huynh ve ark. 2022, RKÇ ikincil analiz n=1.029 (yazarlar Calm bağlantılı): uygulama grubunda uykusuzluk belirtileri daha fazla azaldı. PMID 36169994, DOI [10.2196/40500](https://doi.org/10.2196/40500).
- **"Uykusuz derin dinlenme" (NSDR, 10 dk: yavaş nefes + sıralı beden farkındalığı).**
  - Boukhris ve ark. 2026a, RKÇ n=102: uykululuk, yorgunluk ve streste küçük azalma (η²=0,03–0,05), toparlanmada artış; tepki süresi yalnız hemen sonra iyi; kalp hızında göreli azalma. PMID 42383502, DOI [10.1111/aphw.70180](https://doi.org/10.1111/aphw.70180).
  - Boukhris ve ark. 2026b, RKÇ n=60: 25 dk şekerleme / 10 dk NSDR / kontrol; **NSDR'nin hiçbir sonuçta anlamlı etkisi yok.** PMID 42783005, DOI [10.3390/clockssleep8030052](https://doi.org/10.3390/clockssleep8030052).
- Karşılaştırma koşulu olarak müziğin kendisi de etkin olabilir: Wahbeh & Fry 2019'da (§1.4) müzikli "tatil" grubu uzun izlemde bazı ölçütlerde daha iyiydi; Moszeik 2025'te (§1.2) 10 dk müzik aktif kontrol olarak kullanıldı ve tam metne göre bekleme grubundan anlamlı farklı değildi [DÜZELTİLDİ]; yani müziğin etkinliği çalışmadan çalışmaya değişiyor.

---

## 7. Restoratif ve yin yoga

- **Restoratif ile güçlü yoga — Deng ve ark. 2022.** Pilot RKÇ, n=35 hareketsiz meme/over kanseri sonrası kadın; 60 dk, haftada 3, 12 hafta gözetimli + 12 hafta ev. Restoratif grupta genel ve akışkan biliş anlamlı arttı (d=0,3–0,6); 24. haftada akışkan bilişte restoratif daha iyi. PMID 35861215, DOI [10.1177/15347354221089221](https://doi.org/10.1177/15347354221089221).
- **YOCAS (hafif Hatha + restoratif) — Arana-Chicas ve ark. 2024.** Faz 3 RKÇ'nin ikincil analizi, n=177; haftada 2–3, 4 hafta. Hem ≤59 hem 60+ yaşta yorgunluk ve yaşam kalitesinde grup içi iyileşme; katılımcıların %92,8 / %88,5'i uykusuna iyi geldiğini bildirdi. PMID 39368335, DOI [10.1016/j.jgo.2024.102076](https://doi.org/10.1016/j.jgo.2024.102076).
- **Jinekolojik kanser, SD — Giridharan ve ark. 2025.** 6 RKÇ, n=320; meditatif yoga (YN, pranayama) depresyonda anlatısal SMD −0,56 (GRADE orta); **restoratif yogada uyum, güçlü formlardan yüksek**; yan etki yok. PMID 41281133, DOI [10.7759/cureus.95017](https://doi.org/10.7759/cureus.95017).
- **Yin yoga + stres yönetimi, ergenler — Arslan & Ardic 2026.** Küme RKÇ, n=120; 4 hafta, haftalık 50 dk; kontrol tek seferlik kısa eğitim; büyük etkiler (kısmi η² 0,65–0,75), yazarlar aktif kontrollü çalışma gerektiğini yazıyor. PMID 41968659, DOI [10.1002/jad.70155](https://doi.org/10.1002/jad.70155).
- **Yalnız sesle sunulan restoratif/yin yoga RKÇ'si: bu taramada bulunamadı.** Çalışmaların hepsi yüz yüze ya da canlı gözetimli.

---

## 8. Doz-yanıt ve kısa seans: sentez

**Seans içi uzunluk (dakika) doğrudan test edildi mi?**
- Yalnızca bir çalışma iki uzunluğu doğrudan karşılaştırdı: Moszeik 2025, 11 dk ile 30 dk YN. İkisi de küçük etki; doğrudan karşılaştırmada 30 dk yalnız "farkında davranma"da farklı (d=0,10; GA −0,01–0,44), diğer değişkenlerde fark yok [DÜZELTİLDİ: kortizol uyanış yanıtı farkı 11 dk'ya karşı değil, kontrol gruplarına karşıydı]. PMID 40373021.
- Nefes döngüsü uzunluğu (seans değil): Trivedi 2023, bhramari'de 12–14 sn döngü. PMID 38204770.

**Seans sayısı / sıklık:**
- İlişki bulunmayanlar: YN ve ağrı (tek vs çok seans, meta-regresyon; PMID 41187098), PMR ve uyku (seans sayısı p=0,21; PMID 42625730), yoga ve algılanan stres (pratik saati moderatör değil; Rhoads ve ark. 2024, 36 çalışma, etki 0,48; PMID 39511914, DOI [10.1080/17437199.2024.2420974](https://doi.org/10.1080/17437199.2024.2420974)).
- İlişki bulunanlar: haftalık yoga sıklığı ile depresif belirtideki azalma (Brinsley ve ark. 2021, 13 RKÇ, n=632, β=−0,44; PMID 32423912, DOI [10.1136/bjsports-2019-101242](https://doi.org/10.1136/bjsports-2019-101242)) — **[DÜZELTİLDİ] bu MA yalnız fiziksel olarak aktif yogayı (≥%50 fiziksel etkinlik) ve DSM tanılı ruhsal bozukluğu olan yetişkinleri kapsıyor; yalnız sesle sunulan yoga nidra/meditasyona doğrudan aktarılamaz**; VR ile stres azaltmada çok seans (R²=%15; Strauch ve ark. 2026, 39 çalışma, n=4.024; PMID 42184377, DOI [10.2196/78212](https://doi.org/10.2196/78212); bu turda yeniden doğrulanmadı); iRest'te katılınan hafta sayısı ile uykululuk iyileşme puanı arasında korelasyon (rs=−0,705; PMID 29642130; **yönü özetten belirlenemiyor, doğrulanmadı**); Moszeik 2025 tam metninde her iki YN grubunda pratik sıklığı bazı sonuçlarla ilişkiliydi (11 dk: kortizol ölçütleri; 30 dk: ruminasyon, tepkisizlik, farkında davranma) (PMID 40373021).
- Kısa farkındalık eğitimleri (tek seans–2 hafta) MA'sı: olumsuz duygulanımda g=0,21; **yayın yanlılığı düzeltmesinden sonra g=0,04** (Schumer, Lindsay & Creswell 2018; 65 RKÇ, n=5.489; PMID 29939051, DOI [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)).
- Etki kalıcılığı: 10 günlük uygulama programının uyku faydası ~3 ayda kayboldu (PMID 39945273).

**Süreye göre örnekler (bu taramadan):**

| Süre | Tek seans / günlük | Ne görüldü | Kaynak (PMID) |
|---|---|---|---|
| 5 dk | Günlük, 1 ay | Uzun verişli nefes: olumlu duygulanım ve (uyku sırası) solunum hızında meditasyondan fazla değişim; kaygıda gruplar arası fark yok | 36630953 |
| 5 dk | Tek seans | Bhramari: HRV artışı (kontrolsüz, n=20) | 42521250 |
| 10 dk | Tek seans (2 kez) | Beden taraması: klinikte sıkıntı azaldı, evde fark yok | 23129105 |
| 10 dk | Tek seans | NSDR: bir RKÇ'de küçük etki, diğerinde etki yok | 42383502, 42783005 |
| 10 dk | Tek seans | Beden taraması: efor sonrası ek fayda yok (n=9) | 37325754 |
| 11 dk | Günlük, 2 ay | YN: bekleme listesine göre küçük iyileşme | 40373021 |
| 16 dk | Tek seans | YN: KB düşüşü (kontrolsüz) | 39974253 |
| 20 dk | Tek seans | PMR, imgeleme, derin nefes: psikolojik gevşeme arttı | 34306146 |
| 20 dk | Günlük, 8 hafta | Beden taraması: iç algı doğruluğu arttı | 28955213 |
| 30 dk | Tek seans | YN: uykuya dalma süresi değişmedi; solunum hızı düştü | 36731199 |
| 30 dk | Günlük, 2 ay | YN: 11 dk'ya göre yalnız "farkında davranma"da küçük fark (d=0,10) | 40373021 |
| 30 dk | Günlük, 2 hafta | YN: depresyon, kaygı, uykusuzluk puanları azaldı (grup içi) | 37327384 |

**Sonuç:** Kısa (5–15 dk) seanslar için anlık/durumsal değişim kanıtı var ve genelde küçük. 30 dk bazı ek farklar gösterebilir ama "uzun = kesin daha iyi" diyen tutarlı bir doz-yanıt yok. Tekrarın (gün sayısı/sıklık) önemli olduğunu gösteren veriler, uzunluğun önemli olduğunu gösterenlerden daha fazla.

---

## 9. Güvenlik ve olumsuz etkiler

- **Meditasyon yan etkileri, SD — Farias ve ark. 2020.** 83 çalışma, n=6.703; toplam yaygınlık %8,3 (deneysel %3,7; gözlemsel %33,2); 83 çalışmanın 55'inde (%65) en az bir olumsuz olay bildirildi; en sık türler kaygı (18 çalışma, %33), depresyon (15, %27), bilişsel anormallikler (14, %25) — **[DÜZELTİLDİ] bu yüzdeler katılımcı oranı değil, o türü bildiren çalışma oranıdır**; ruh sağlığı öyküsü olmayanlarda da görülebiliyor. Yoga duruşları gibi fiziksel pratikler kapsam dışı. PMID 32820538, DOI [10.1111/acps.13225](https://doi.org/10.1111/acps.13225).
- **Travma-duyarlı YN — Luu 2024** (§1.5): geri dönüşler, duygusal sıkıntı, uzamış dissosiyasyon bildirilmiş; 10 bileşen öneriliyor. PMID 39690521.
- **Gevşemeye bağlı kaygı — Heide & Borkovec 1983.** "Relaxation-induced anxiety: paradoxical anxiety enhancement due to relaxation training." **PubMed'de özet yok; yalnız başlık doğrulandı; oranlar ve ayrıntılar doğrulanmadı.** PMID 6341426, DOI [10.1037//0022-006x.51.2.171](https://doi.org/10.1037//0022-006x.51.2.171).
- Derin nefes talimatında ilk anda uyarılma artışı: Toussaint 2021 (PMID 34306146).
- Hipnotik telkin etkisi yalnız yatkın kişilerde: Cordi 2014 (PMID 24882909).

---

## 10. Zayıf / karışık kanıt

1. **YN meta-analizlerinin tümü düşük kaliteli çalışmalara dayanıyor**; en kapsamlı MA (73 çalışma) etkilerin "muhtemelen şişirilmiş" olduğunu söylüyor (PMID 41327816). Uyku MA'sı çok düşük güvenli ve RKÇ havuzunda PSQI etkisi anlamlı değil (PMID 42043659). Çalışmalar coğrafi olarak Hindistan'da yoğun.
2. **Aktif kontrole karşı YN etkisi küçülüyor ya da kayboluyor:** ağrıda aktif kontrole karşı g=−0,31 anlamsız (PMID 41187098); sahte YN'ye karşı fark yok (PMID 42402245); iRest'in uzun izleminde müzikli kontrol bazı ölçütlerde daha iyi (PMID 30664388).
3. **Objektif uyku ölçümleri öznel bildirimle uyuşmuyor:** müzik (PMID 36000763), yatmadan önce yavaş nefes (PMID 41886931), uygulama tabanlı farkındalık (PMID 35420589) ve tek seans YN (PMID 36731199) objektif uykuda net değişim göstermedi. Uygulama "uykuya daldırır" diyemez.
4. **Beden taraması tek başına zayıf** (MA; PMID 35538557); evde tek seans etkisi yok (PMID 23129105); 10 dk ek fayda yok (PMID 37325754); oturma meditasyonundan farkı yok (PMID 42237303).
5. **PMR MA'larında çok yüksek heterojenlik** (I² %85–92); düşük/çok düşük GRADE yalnız kanser MA'sında (Wang 2024, PMID 38281450; bu turda yeniden doğrulanmadı) — Li 2026 ve Donato 2026 özetlerinde GRADE yok [DÜZELTİLDİ]; 55 yaş üstünde uyku etkisi anlamlı değil (PMID 42625730); COVID-19'da uyku etkisi anlamsız (PMID 37026959).
6. **Kısa farkındalık eğitimlerinde yayın yanlılığı:** düzeltme sonrası etki g=0,04 (PMID 29939051).
7. **Bhramari ve sırayla burun deliği çalışmaları çoğunlukla küçük, kontrolsüz ya da tek merkezli**; bhramari EEG'si "uyanıklık" yönünde değişim gösterdi (PMID 42521250), yani uyku için sakinleştirici olduğu varsayılamaz. Sırayla burun deliği nefesi oksijen tüketimini artırdı (PMID 38899139).
8. **NSDR çelişkili:** bir RKÇ küçük etki, diğeri etki yok (PMID 42383502, 42783005).
9. **Rehberli imgeleme MA'ları klinik popülasyonlarda** (kanser, yoğun bakım, ameliyat); sağlıklı yetişkinlerde günlük kullanım için doğrudan kanıt sınırlı; süre/sıklık standardı yok (PMID 41094273).
10. **Restoratif/yin yogada** yalnız ses ile sunuma ait RKÇ yok; mevcut çalışmalar küçük ve çoğunlukla kanser popülasyonunda.
11. **YN aşamalarının ayrı ayrı katkısı hiç test edilmemiş** (bu taramada bulunamadı). Kısaltırken hangi aşamanın atılacağı kanıta değil tasarım kararına dayanır.
12. **Bu taramada bakılmayan / doğrulanmayanlar:** anlatıcı sesin cinsiyeti ya da konuşma hızının etkisi; ElevenLabs sesleriyle ilgili herhangi bir çalışma; `breath.js`'te anılan Marchant 2025 ve You 2021; Kjaer 2002 ve Balban 2023'ün katılımcı sayıları; Satyananda sıralamasının özgün metni.

---

## 11. Tasarıma etkisi (ders yapısı, uzunluk, zamanlayıcı, ses–müzik–görsel)

Aşağıdakiler **tasarım önerisidir**; parantez içindeki PMID'ler gerekçedir, önerinin kendisi test edilmedi.

### 11.1 Bu kümeden çıkabilecek dersler (öneri; 10 konunun son listesi başka dosyada belirlenecek)

1. Derin Dinlenme — yoga nidra (rahatlama)
2. Uykuya Geçiş — yoga nidra uyku sürümü + imgeleme + uzun veriş
3. Beden Taraması ve Gevşeme — beden taraması + hafif PMR
4. Nefesin Ritmi — ~6/dk, uzun veriş, sırayla burun deliği, bhramari
5. Kaygıyı Yumuşatmak — nefes + beden + imgeleme bileşimi

### 11.2 Her uzunlukta "tam" hissettiren iskelet: sabit kapaklar + esnek çekirdek

- **Açılış (sabit, ~45–60 sn):** varış, rahat pozisyon, gözü açık kalma ya da istediği an durma izni, kısa niyet (sankalpa). Gerekçe: Luu 2024 "uygun uzunluk ve hazırlık", "özerklik ve onay", "kendi seçtiği niyet" (PMID 39690521).
- **Esnek çekirdek:** kullanıcının seçtiği süreye göre büyüyen/küçülen bölüm.
- **Kapanış (sabit, ~45–60 sn):** niyetin tekrarı + gündüz derslerinde **dışa dönüş** (beden hareketi, çevre sesleri, gözleri açma); uyku derslerinde **uyku izni** ve dışa dönüş yok (Luu 2024, PMID 39690521).
- **Kural:** Hangi süre seçilirse seçilsin açılış ve kapanış her zaman tam çalınır; süre çekirdekten kesilir. 11 dk YN'nin tek başına bir pratik olarak işlev gördüğü (PMID 40373021) ve 10 dk NSDR'nin bir çalışmada küçük etki verdiği (PMID 42383502) bu modeli destekliyor.

### 11.3 Yoga nidra: süreye göre aşama planı (öneri, test edilmedi)

| Aşama | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|
| Yerleşme + izin | var | var | var | var | var (uzun) |
| Niyet (başta) | kısa | var | var | var | var |
| Beden dolaşımı | az nokta, hızlı | tam tur | tam tur | tam tur | tam tur, yavaş |
| Nefes farkındalığı (uzun veriş) | 4–6 nefes | sayma kısa | sayma | sayma | sayma uzun |
| Zıtlık çiftleri (ağır/hafif, sıcak/serin) | yok | yok | 1 çift | 2 çift | 2–3 çift |
| İmgeleme | yok | kısa, tek sahne | kısa | var | uzun + sessiz boşluklar |
| Niyet (sonda) | var | var | var | var | var |
| Kapanış / dışa dönüş ya da uyku izni | var | var | var | var | var |

- Kısaltma sırası (öneri): önce **sessizlik süreleri**, sonra **tekrar sayıları**, en son **aşamalar** (imgeleme → zıtlık çiftleri). Aşamaların ayrı katkısı test edilmediği için (§10 madde 11) bu sıra bir tasarım kararıdır.
- YN ile beden taramasının karşılaştırıldığı tek çalışmada iyi oluş artışı YN'de daha fazlaydı (PMID 41743305); beden taraması tek başına zayıf (PMID 35538557). Öneri: "Beden Taraması" dersini çıplak tarama yerine nefes ve kısa imgelemeyle birleştirmek.

### 11.4 Nefes ipuçlarının temposu

- Genel gevşeme: ~6 nefes/dk (Lalanza 2023 PMID 36917418; Bernardi 2001 PMID 11751348) ve **verişin alıştan uzun olması** (Van Diest 2014 PMID 25156003; Balban 2023 PMID 36630953). Uygulamanın mevcut nefes kuralları ile aynı (`breath.js:2-6`).
- "Derin nefes al" yerine "yavaş ve yumuşak al, verişi uzat" dili: derin nefes talimatı ilk anda uyarılmayı artırdı (PMID 34306146).
- Bhramari döngüsü 12–14 sn civarında (PMID 38204770); bhramari ve sırayla burun deliği nefesi **gündüz / odak** derslerine daha uygun (EEG uyanıklık: PMID 42521250; oksijen tüketimi artışı: PMID 38899139). Uyku dersinde yalnızca yavaş + uzun veriş.
- Nefes tutma kullanılacaksa uygulamanın mevcut 7 sn üst sınırı (`breath.js:14`; kodda "VARSAYIM" diye işaretli) aşılmamalı.

### 11.5 Ses, müzik ve sessizlik

- **Sessizlik bir tasarım öğesi:** 2 dk'lık duraklama kalp hızını, kan basıncını ve ventilasyonu başlangıcın altına indirdi (PMID 16199412). Öneri: anlatım aralarında müziğin tek başına kaldığı, ders uzadıkça uzayan planlı boşluklar (5 dk sürümde birkaç sn, 30 dk sürümde 30–90 sn). Konuşmanın hiçbir zaman cümle ortasında kesilmemesi için zamanlayıcı yalnızca cümle/segment sınırlarında keser.
- **Müzik temposu yavaş; belirgin, tekrarlı vuruş yok:** hızlı tempo **ve daha basit ritim yapıları** uyarılmayı (solunum, KB, kalp hızı) artırdı; yavaş/meditatif müzik gevşetici bulundu (PMID 16199412). [DÜZELTİLDİ: ilk sürümdeki "ritim sade" önerisi, bu çalışmada basit ritimlerin uyarılmayı *artırdığı* bulgusuyla çelişiyordu. Ritimsiz/pulssuz dokular (drone, pad) öneridir, test edilmedi.]
- **Doğa sesi katmanı** (su, rüzgâr, kuş): stres ve rahatsızlıkta azalma MA'sı (PMID 33753555); fNIRS çalışmasında doğa sesleriyle dinlenmede dorsolateral–medial prefrontal bağlantı beden taramasındakinden yüksekti (PMID 41139603; bunun anlamı yorumlanmamalı, yalnızca doğa sesinin "pasif dolgu" olmadığına işaret).
- **Uyku dersi kuyruğu:** anlatım bitince müzik/doğa sesi bir süre devam edip yavaşça sönebilir; müzik çalışmalarında dinleme 25–60 dk idi (PMID 36000763). Kuyruk süresi kullanıcı ayarı olmalı; objektif uyku kanıtı zayıf olduğu için "uyutur" denmez.
- **Müzik tek başına da etkin olabilir** (PMID 30664388: müzikli "tatil" grubu uzun izlemde olumsuz duygu durumu ve algılanan streste daha iyiydi; PMID 36000763: müzik ile öznel uyku kalitesi). [DÜZELTİLDİ] PMID 40373021 bu iddiaya kanıt değildir: Moszeik 2025 tam metninde 10 dk müzik bekleme grubundan anlamlı farklı değildi; Gunjiganvi 2023'te (PMID 37327384) müzik grubunda anlamlı grup içi değişim yoktu. Yine de ses–müzik birleşiminde müzik yalnızca "dolgu" değil; ducking (anlatım sırasında müziğin alçalması) ve sessiz boşluklarda müziğin görünür olması önerilir.
- **"Hipnoz" hissi için telkin dili:** sesli "daha derin uyu" telkini yalnızca telkine yatkın kişilerde derin uyku artışı gösterdi (PMID 24882909). Öneri: telkinler davet dilinde ("belki fark edersin ki…"), vaat içermeden; bunun herkes için işe yarayacağı söylenemez.
- Anlatıcı sesin cinsiyeti, tınısı ya da konuşma hızına dair PubMed kanıtı bu taramada aranmadı/bulunmadı (doğrulanmadı). Neslihan/Hakan seçimi ürün kararıdır.

### 11.6 Uyku dersleri ile gündüz dersleri ayrımı

- Uyku: dışa dönüş yok, uyku izni var (PMID 39690521); ilgi çekici, tek sahneli, ayrıntılı imgeleme (Harvey & Payne 2002, PMID 11863237); yalnız yavaş + uzun veriş.
- Gündüz: dışa dönüş zorunlu; sırayla burun deliği ve bhramari burada.
- 11 dk YN'nin günlük kullanımı (PMID 40373021) "kısa günlük ders" varsayılanı için makul bir çıpa.

### 11.7 Güvenlik ve dil

- Her derste: "Rahatsız hissedersen gözlerini açabilir, hareket edebilir ya da durdurabilirsin." (Luu 2024; Farias 2020 PMID 32820538.)
- Beden dolaşımı esnek: ağrılı ya da rahatsız eden bölgeyi atlama izni (Luu 2024).
- İmgeleme özenli ("conscientious visualizations", Luu 2024 bileşen 10). [DÜZELTİLDİ] "Su/derinlik/kapalı alan" gibi somut örnekler Luu 2024 **özetinde yok** (doğrulanmadı); bunlar tasarım önerisidir. Öneri: imgelemede seçenek sunmak.
- Sağlık iddiası yok (`breath.js:6` ile tutarlı): "Çalışmalarda yoga nidra sonrası kişilerin kendini daha az gergin bildirdiği görüldü" gibi.

### 11.8 Gelişim istatistikleri ve yol haritası

- Uygulamanın modül kuralı: yeni modül kaydını `sessions`'a yazar ve manifestinde `progress.domain` + `sessions.match` tanımlar (`app/src/lib/dataHub.js:13-14`). Alanlar `['eye', 'calm', 'self', 'awareness', 'focus', 'wellbeing', 'body']` (`app/src/modules/registry.js:57`); `progress.domain` zorunlu (`registry.js:35-37`); isteğe bağlı `effects` oturum öncesi → sonrası "şu an nasıl hissediyorsun" puanıdır (`registry.js:38-39`).
- Öneri: bu kümedeki dersler `calm` (derin dinlenme, kaygı, nefes), `wellbeing` (uyku) ve `body` (beden taraması/PMR) alanlarına; her oturumda seçilen süre, dinlenen süre, kapanışa ulaşıldı mı, öncesi/sonrası 0–10 gerginlik.
- İstatistikte **uzunluktan çok gün sayısı/sıklık** öne çıkarılmalı: sıklık bazı çalışmalarda etkiyle ilişkili (PMID 32423912 — fiziksel aktif yoga, tanılı popülasyon; PMID 40373021 — YN, tam metin; PMID 42184377 — VR, bu turda yeniden doğrulanmadı; PMID 29642130'un yönü doğrulanmadı), uzunluk ise tutarlı biçimde değil (PMID 41187098, 42625730, 39511914; bu üçü "seans sayısı / program süresi / pratik saati" ölçüyor, dakika cinsinden seans uzunluğunu değil). 5 dk ile tamamlanan bir ders "tamamlandı" sayılmalı. Not: Moszeik 2025'te 30 dk formu daha sık yapanlarda kortizol ölçütleri "aktivasyon" yönünde değişti; "daha uzun ve daha sık = daha sakin" varsayılamaz.
- HRV ya da fizyolojik ölçüm gösterilmez (`breath.js:6`); uyku dersleri için yalnızca kişinin kendi bildirimi (ör. "uykuya dalmak kolay mıydı?").
- Uzun vadeli bağlılık düşük olabilir: öneri süresine uyan katılımcı oranı %54 (PMID 40498669); 10 günlük programın uyku faydası ~3 ayda kayboldu (PMID 39945273). Bu, hatırlatma ve kısa sürüm seçeneklerinin önemli olduğunu düşündürür.

---

## 12. Kaynak listesi (hepsi ilk ajan tarafından PubMed kaydından okundu; ikinci ajanın yeniden çektiği 45 PMID başlıktaki doğrulama notunda sayıldı — listede olup notta "yeniden çekilmeyen" diye anılanlar ikinci doğrulamadan geçmedi)

| PMID | Yazar, yıl | Tür | DOI |
|---|---|---|---|
| 41327816 | Ghai 2025 | SD/MA | 10.1111/nyas.70149 |
| 42043659 | Singh 2026 | SD/MA | 10.1007/s11325-026-03685-0 |
| 41144325 | Dutta 2025 | SD | 10.1177/27683605251390728 |
| 41187098 | Ghai 2025 | SD/MA + meta-regresyon | 10.1159/000549416 |
| 40840566 | Ghai 2025 | SD/MA | 10.1016/j.ctim.2025.103231 |
| 38484438 | Ahuja 2024 | SD/MA | 10.1016/j.jaim.2023.100882 |
| 37489597 | Musto 2023 | Bütünleştirici derleme | 10.1111/jnu.12927 |
| 40373021 | Moszeik 2025 | RKÇ (11 vs 30 dk) | 10.1002/smi.70049 |
| 39974253 | Ahuja 2025 | Tek kollu | 10.7759/cureus.77717 |
| 36731199 | Sharpe 2023 | RKÇ (pilot) | 10.1016/j.jpsychores.2023.111169 |
| 41067763 | Kumari 2025 | Protokol | 10.1136/bmjopen-2025-103725 |
| 29642130 | Livingston 2018 | Öncesi-sonrası | 10.1097/HNP.0000000000000266 |
| 34825538 | Datta 2021 | RKÇ | 10.25259/NMJI_63_19 |
| 37327384 | Gunjiganvi 2023 | RKÇ | 10.17761/2023-D-22-00011 |
| 42402245 | Gomathy 2026 | Pilot RKÇ (negatif) | 10.1016/j.yebeh.2026.111180 |
| 41349728 | Baruah 2025 | RKÇ | 10.1016/j.ctim.2025.103313 |
| 38595893 | Nuzhath 2024 | RKÇ | 10.7759/cureus.55871 |
| 30354905 | Wahbeh 2018 | Pilot RKÇ | 10.17761/2019-00036 |
| 30664388 | Wahbeh 2019 | İzlem | 10.17761/2019-00029 |
| 27760887 | Gutman 2017 | RKÇ | 10.1177/1539449216673045 |
| 25858651 | Pence 2014 | Pilot | kayıtta DOI yok |
| 39862599 | Barber 2025 | Nitel | 10.1016/j.ctcp.2025.101955 |
| 35496325 | Pandi-Perumal 2022 | Anlatı derlemesi | 10.1007/s41782-022-00202-7 |
| 39690521 | Luu 2024 | Uzman önerisi | 10.17761/2024-D-24-00021 |
| 40868573 | di Fronso 2025 | Görüş | 10.3390/healthcare13161957 |
| 41743305 | Gibbs 2026 | Yarı deneysel | 10.4103/ijoy.ijoy_2_25 |
| 11958969 | Kjaer 2002 | PET | 10.1016/s0926-6410(01)00106-9 |
| 9950067 | Lou 1999 | PET | 10.1002/(SICI)1097-0193(1999)7:2<98::AID-HBM3>3.0.CO;2-M |
| 35903117 | Datta 2022 | PSG | 10.3389/fneur.2022.910794 |
| 34727178 | Zaccaro 2021 | Fenomenoloji/EEG | 10.17761/2021-D-20-00014 |
| 35538557 | Gan 2022 | SD/MA | 10.1111/aphw.12366 |
| 23129105 | Ussher 2014 | RKÇ | 10.1007/s10865-012-9466-5 |
| 17107296 | Ditto 2006 | Deneysel | 10.1207/s15324796abm3203_9 |
| 37325754 | Aras 2023 | Çapraz RKÇ | 10.3389/fpsyg.2023.1196066 |
| 37984598 | Ahmadyar 2023 | Deneysel | 10.1016/j.appet.2023.107131 |
| 27684609 | Dambrun 2016 | Deneysel | 10.1016/j.concog.2016.09.013 |
| 41727805 | Becattini 2026 | Kuramsal | 10.1093/nc/niag001 |
| 28955213 | Fischer 2017 | Deneysel | 10.3389/fnhum.2017.00452 |
| 40908588 | Schwerdtfeger 2025 | 2 RKÇ | 10.1111/aphw.70073 |
| 32863982 | Colgan 2016 | RKÇ | 10.1007/s12671-015-0453-0 |
| 42237303 | Yaemrattanakul 2026 | RKÇ | 10.1186/s40359-026-04923-6 |
| 41139603 | Kim 2025 | fNIRS | 10.9758/cpn.25.1277 |
| 42625730 | Li 2026 | SD/MA | 10.3389/fpubh.2026.1906525 |
| 41633054 | Donato 2026 | SD/MA | 10.1016/j.jpsychores.2026.112563 |
| 38281450 | Wang 2024 | SD/MA | 10.1016/j.ijnurstu.2024.104694 |
| 36332326 | Tan 2022 | SD/MA | 10.1016/j.ctcp.2022.101676 |
| 37026959 | Seid 2023 | SD/MA | 10.1097/MD.0000000000033464 |
| 34306146 | Toussaint 2021 | RKÇ | 10.1155/2021/5924040 |
| 22843353 | Vancampfort 2013 | SD | 10.1177/0269215512455531 |
| 35623448 | Laborde 2022 | SD/MA | 10.1016/j.neubiorev.2022.104711 |
| 30245619 | Zaccaro 2018 | SD | 10.3389/fnhum.2018.00353 |
| 36624160 | Fincham 2023 | MA | 10.1038/s41598-022-27247-y |
| 41886931 | Eide 2026 | SD | 10.1016/j.smrv.2026.102284 |
| 36917418 | Lalanza 2023 | SD | 10.1007/s10484-023-09582-6 |
| 11751348 | Bernardi 2001 | Karşılaştırmalı | 10.1136/bmj.323.7327.1446 |
| 25156003 | Van Diest 2014 | Deneysel | 10.1007/s10484-014-9253-x |
| 36630953 | Balban 2023 | RKÇ | 10.1016/j.xcrm.2022.100895 |
| 38179185 | Garg 2023 | SD/MA | 10.1016/j.ijcrp.2023.200232 |
| 39959506 | Pai 2024 | RKÇ | 10.4103/ijoy.ijoy_115_24 |
| 29343931 | Naik 2018 | RKÇ | 10.4103/ijoy.IJOY_41_16 |
| 38899139 | Singh/Telles 2024 | Çapraz | 10.4103/ijoy.ijoy_248_23 |
| 33461386 | Rung 2021 | SD | 10.1177/0898010120983659 |
| 38204770 | Trivedi 2023 | Çapraz | 10.4103/ijoy.ijoy_113_23 |
| 42521250 | Malhotra 2026 | Kontrolsüz pilot | 10.17761/2026-D-25-00058 |
| 42186649 | Devipriya 2026 | Kontrolsüz | 10.7759/cureus.107617 |
| 41743292 | Poojary 2025 | RKÇ | 10.4103/ijoy.ijoy_253_24 |
| 11863237 | Harvey 2002 | Kontrollü klinik | 10.1016/s0005-7967(01)00012-2 |
| 41094273 | Bozkurt-Duman 2025 | SD/MA | 10.1007/s00520-025-10016-8 |
| 42759488 | Talhaoğlu 2026 | SD/MA | 10.1016/j.explore.2026.103528 |
| 42652381 | Şen 2026 | SD | 10.3390/ijerph23081066 |
| 38350116 | Correa-Morales 2024 | SD | 10.1089/jpm.2023.0445 |
| 39845426 | Anamagh 2024 | SD | 10.1016/j.sipas.2024.100255 |
| 36000763 | Jespersen 2022 | Cochrane SD/MA | 10.1002/14651858.CD010459.pub3 |
| 33753555 | Buxton 2021 | SD/MA | 10.1073/pnas.2013097118 |
| 16199412 | Bernardi 2006 | Deneysel | 10.1136/hrt.2005.064600 |
| 24882909 | Cordi 2014 | Çapraz, plasebo kontrollü | 10.5665/sleep.3778 |
| 40498669 | Lew 2025 | Pilot RKÇ | 10.2196/66131 |
| 39945273 | Daniel 2025 | RKÇ | 10.1002/smi.70017 |
| 35420589 | Gao 2022 | RKÇ | 10.1097/PSY.0000000000001083 |
| 36169994 | Espel-Huynh 2022 | RKÇ ikincil | 10.2196/40500 |
| 42383502 | Boukhris 2026a | RKÇ | 10.1111/aphw.70180 |
| 42783005 | Boukhris 2026b | RKÇ | 10.3390/clockssleep8030052 |
| 35861215 | Deng 2022 | Pilot RKÇ | 10.1177/15347354221089221 |
| 39368335 | Arana-Chicas 2024 | Faz 3 RKÇ ikincil | 10.1016/j.jgo.2024.102076 |
| 41281133 | Giridharan 2025 | SD | 10.7759/cureus.95017 |
| 41968659 | Arslan 2026 | Küme RKÇ | 10.1002/jad.70155 |
| 39511914 | Rhoads 2024 | MA | 10.1080/17437199.2024.2420974 |
| 32423912 | Brinsley 2021 | SD/MA | 10.1136/bjsports-2019-101242 |
| 42184377 | Strauch 2026 | SD/MA | 10.2196/78212 |
| 29939051 | Schumer 2018 | SD/MA | 10.1037/ccp0000324 |
| 32820538 | Farias 2020 | SD | 10.1111/acps.13225 |
| 6341426 | Heide 1983 | Kontrollü (yalnız başlık) | 10.1037//0022-006x.51.2.171 |

Kaynak: PubMed (National Library of Medicine). DOI bağlantıları yukarıdaki bölümlerde verildi.

---

## 13. Doğrulama tablosu (ikinci ajan, 45 iddia)

Her satır için PMID `get_article_metadata` ile yeniden çekildi; DOI kayıttakiyle birebir karşılaştırıldı (45/45 eşleşti). "Özet" = yalnız özet okundu; "Tam metin" = PMC tam metni de okundu.

| Kimlik | PMID | DOI eşleşti | Sonuç | Dayanak | Not |
|---|---|---|---|---|---|
| yn-ma-stress | 41327816 | evet | Doğrulandı | Özet | 73 çalışma, n=5201; g değerleri birebir; "likely reflect inflated estimates" |
| yn-ma-sleep | 42043659 | evet | Doğrulandı | Özet | PSQI RKÇ I²=0; ISI p=0,0616; GRADE çok düşük; Hindistan yoğunluğu özette |
| yn-pain-dose | 41187098 | evet | Doğrulandı | Özet | "dose-response ... across intervention durations" = seans sayısı/program, dakika değil |
| yn-11vs30 | 40373021 | evet | **Düzeltildi** | Tam metin | 30–11 doğrudan: yalnız farkında davranma d=0,10 (GA −0,01–0,44); CAR farkı kontrollere karşı |
| yn-single16 | 39974253 | evet | Doğrulandı | Özet | Tek kollu, n=32; kontrol yok |
| yn-single30-lab | 36731199 | evet | Doğrulandı | Özet | Sayılar birebir |
| yn-vs-cbti | 34825538 | evet | Doğrulandı | Özet | N2%/N3% için p özette yok ("marked improvement") |
| yn-vs-music | 37327384 | evet | Doğrulandı | Özet | Yalnız grup içi p; pilot RKÇ |
| yn-null-sham | 42402245 | evet | Doğrulandı | Özet | Birincil sonuç aylık nöbet sıklığı; iki grup da iyileşti |
| irest-sleep | 27760887 | evet | Doğrulandı | Özet | Yastık grubu gece uyanmalarında daha iyiydi |
| irest-fu | 30664388 | evet | **Düzeltildi** | Özet | "Pratik yordamadı" yalnız depresyon puanı için |
| irest-attendance | 29642130 | evet | **Düzeltildi** | Özet | Korelasyon negatif; iyileşme yönü doğrulanmadı |
| yn-trauma-components | 39690521 | evet | Doğrulandı | Özet | 10 bileşen birebir |
| yn-origin | 35496325 | evet | Doğrulandı | Özet | — |
| yn-vs-bodyscan | 41743305 | evet | Doğrulandı | Özet | "Aşama çalışması bulunamadı" ek aramayla da desteklendi (kanıt yokluğu, yokluk kanıtı değil) |
| yn-dopamine | 11958969 | evet | Doğrulandı | Özet | n özette yok (doğrulanmadı) |
| bodyscan-ma | 35538557 | evet | Doğrulandı | Özet | — |
| bodyscan-10min | 23129105 | evet | Doğrulandı | Özet | — |
| bodyscan-rsa | 17107296 | evet | Doğrulandı | Özet | Ç1 kontrolleri PMR ve bekleme; Ç2 sesli roman |
| bodyscan-interoception | 28955213 | evet | Doğrulandı | Özet | Ç1'de artış grup içi (T1–T3); Ç2'de pasif kontrole karşı |
| pmr-sleep-ma | 42625730 | evet | Doğrulandı | Özet | — |
| pmr-ma-31 | 41633054 | evet | Doğrulandı | Özet | PSQI I²=%94,2; GRADE özette yok |
| toussaint-20min | 34306146 | evet | Doğrulandı | Özet | — |
| breath-laborde | 35623448 | evet | Doğrulandı | Özet | Tempo (6/dk) özette belirtilmiyor |
| breathwork-ma | 36624160 | evet | Doğrulandı | Özet | — |
| breath-bedtime | 41886931 | evet | Doğrulandı | Özet | Öznel çalışma sayısı 7 |
| ie-ratio | 25156003 | evet | **Düzeltildi** | Özet | Karşılaştırma düşük/yüksek alış-veriş oranı |
| cyclic-sigh | 36630953 | evet | **Düzeltildi** | Tam metin | n=108; "duygu durumu" = olumlu duygulanım; kaygıda fark yok |
| six-per-min | 11751348 | evet | Doğrulandı | Özet | — |
| bhramari-length | 38204770 | evet | Doğrulandı | Özet | — |
| nostril-vo2 | 38899139 | evet | Doğrulandı | Özet | Karşılaştırmalar her seansın kendi öncesine göre |
| presleep-imagery | 11863237 | evet | Doğrulandı | Özet | Ölçüm yöntemi (öznel/objektif) özette yok |
| gi-cancer-ma | 41094273 | evet | Doğrulandı | Özet | Müdahale "GI tek başına ya da PMR ile birlikte" |
| music-cochrane | 36000763 | evet | Doğrulandı | Özet | Karşılaştırma tedavisiz/olağan bakım |
| natural-sounds | 33753555 | evet | Doğrulandı | Özet | — |
| silence | 16199412 | evet | Doğrulandı | Özet | Basit ritim yapıları da uyarılmayı artırdı (§11.5 düzeltildi) |
| hypnotic-sleep | 24882909 | evet | Doğrulandı | Özet | Yatkınlık bulgusu "ek deneyler"den |
| nsdr-10min | 42383502 / 42783005 | evet | Doğrulandı | Özet | İkinci çalışma PubMed'de RKÇ etiketli değil ama "randomly assigned" |
| app-adherence | 40498669 | evet | Doğrulandı | Özet | %54 = 20/37; hedef haftada 130 dk |
| app-fade | 39945273 | evet | Doğrulandı | Özet | "seemingly wore off about three months later" |
| restorative-cognition | 35861215 | evet | Doğrulandı | Özet | d değerleri grup içi (başlangıca göre) |
| yoga-frequency | 32423912 | evet | **Düzeltildi** | Özet | Fiziksel aktif yoga (≥%50); özette SMD işareti ile GA tutarsız (0,41; −0,65 ile −0,17) |
| yoga-stress-hours | 39511914 | evet | Doğrulandı | Özet | — |
| brief-mindfulness-bias | 29939051 | evet | Doğrulandı | Özet | — |
| meditation-ae | 32820538 | evet | **Düzeltildi** | Özet | Tür yüzdeleri çalışma oranı; yoga duruşları kapsam dışı |

---

## Doğrulanamadı / çıkarıldı

Hiçbir PMID tümüyle desteksiz çıkmadı; aşağıdaki **alt iddialar** kaynaklarınca desteklenmediği ya da doğrulanamadığı için çıkarıldı veya "doğrulanmadı" olarak yeniden yazıldı.

1. **"30 dk YN, 11 dk'ya göre kortizol uyanış yanıtında ek fark gösterdi"** (yn-11vs30; §0, §1.2, §8) — **Çıkarıldı.** Tam metinde (PMC12080877) 30 dk ile 11 dk'nın doğrudan karşılaştırmasında yalnız "farkında davranma" farklıydı; "diğer değişkenlerde anlamlı fark bulunmadı". Daha düz kortizol uyanış yanıtı 30 dk'nın aktif kontrol ve bekleme grubuna karşı sonucudur (aktif kontrole karşı yalnız sınırda, p=0,06–0,09).
2. **"30 dk bazı ek farklar sağladı" genellemesi** (yn-11vs30) — **Daraltıldı:** tek bir alt boyut, d=0,10, güven aralığı sıfırı içeriyor (−0,01–0,44).
3. **"İyileşme katılınan hafta sayısıyla güçlü biçimde ilişkiliydi"** (irest-attendance) — **Yön doğrulanamadı.** Özet "ortalama ESS iyileşme puanı ile katılınan hafta sayısı arasında güçlü negatif korelasyon" diyor; puanın işareti tanımlanmadığı için "daha çok katılım = daha çok iyileşme" yorumu doğrulanmadı. Tam metin PMC'de yok.
4. **"Pratik iyileşmeyi yordamadı" (genel)** (irest-fu) — **Daraltıldı:** özet yalnız depresyon puanındaki iyileşme için söylüyor.
5. **"Kısa alış/uzun veriş, yalnızca tempoyu yavaşlatmaya göre…"** (ie-ratio) — **Yeniden yazıldı:** karşılaştırma düşük (0,42) ile yüksek (2,33) alış/veriş oranı arasındadır.
6. **"Döngüsel iç çekme duygu durumunda daha fazla iyileşme" (genel duygu durumu)** (cyclic-sigh) — **Daraltıldı:** tam metinde (PMC9873947) fark yalnız olumlu duygulanımda; durumluk kaygı ve olumsuz duygulanımda gruplar arası fark yok; HRV, dinlenik kalp hızı ve uyku ölçütlerinde değişim yok. "Katılımcı sayısı doğrulanmadı" notu kaldırıldı: n=108.
7. **Farias 2020 tür yüzdelerinin katılımcı oranı gibi okunması** (meditation-ae, §9) — **Düzeltildi:** %33/%27/%25 o türü bildiren çalışma oranıdır.
8. **Brinsley 2021'in yalnız sesle sunulan yoga/meditasyon için sıklık gerekçesi olarak kullanılması** (yoga-frequency, §8, §11.8) — **Sınırlandı:** MA yalnız ≥%50 fiziksel etkinlik içeren yoga ve DSM tanılı yetişkinler.
9. **"Müzik tek başına etkin bir koşul" için PMID 40373021 atfı** (§11.5) — **Çıkarıldı:** tam metinde 10 dk müzik bekleme grubundan anlamlı farklı değildi.
10. **"Müzikte ritim sade" önerisi** (§11.5) — **Çıkarıldı:** PMID 16199412'de daha basit ritim yapıları uyarılmayı *artırdı*; öneri bulguyla çelişiyordu.
11. **"Su/derinlik/kapalı alan imgeleri herkes için güvenli değildir" (Luu 2024'e atıfla)** (§11.7) — **Doğrulanmadı:** bu örnekler Luu 2024 özetinde yok; tasarım önerisi olarak bırakıldı, atıf kaldırıldı.
12. **"PMR MA'larında düşük/çok düşük GRADE" (genel)** (§10 madde 5) — **Daraltıldı:** Li 2026 ve Donato 2026 özetlerinde GRADE yok; bu ifade yalnız Wang 2024 kanser MA'sına ait (bu turda yeniden doğrulanmadı).

Doğrulanmadı olarak kalanlar (değişmedi): Kjaer 2002 katılımcı sayısı; Cordi 2014 kayıt süresi ve deneylerin n dağılımı; Moszeik 2025 ses kayıtlarının aşama listesi; Luu 2024'ün tam metin ayrıntıları; `breath.js`'te anılan Marchant 2025 ve You 2021; Satyananda sıralamasının özgün metni; anlatıcı sesin cinsiyeti/hızı üzerine kanıt.

Kaynak: PubMed (National Library of Medicine); PMC tam metinleri PMC12080877 (DOI [10.1002/smi.70049](https://doi.org/10.1002/smi.70049)) ve PMC9873947 (DOI [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895)).
