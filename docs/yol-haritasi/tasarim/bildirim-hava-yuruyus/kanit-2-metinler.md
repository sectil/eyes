# Kanıt metinleri (2. tur)

Kaynak: PubMed (get_article_metadata; Moszeik için PMC tam metin). Hiçbir proje dosyası değiştirilmedi.

## Görev 1 — moszeik2025 (PMID 40373021, doi:10.1002/smi.70049, PMC12080877)

Künye (PubMed): Moszeik EN, Rohleder N, Renner KH. Stress Health 2025;41(3):e70049. RCT.
Kişi sayısı (özet, aynen): "EG1: 11 min Yoga Nidra, n = 101; EG2: 30 min Yoga Nidra, n = 80 ... AC: 10 min music, n = 74 ... WC, n = 107" → sources.js'teki "362 kişi, 4 kol (101 + 80 + 74 + 107)" doğru.

Özette etki cümlesi (aynen):
> "Significant improvements were observed for the 11-min Yoga Nidra group compared to the WC (effect sizes d = 0.08-0.16)."

Özet, d = 0.08–0.16'nın HANGİ ölçüye ait olduğunu söylemiyor. Tam metin (Results) söylüyor, aynen:
> "Compared to the WC group, the 11-min Yoga Nidra short form resulted in a significant reduction in stress, anxiety, depression, and rumination."
> "The effect sizes for the 11-min Yoga Nidra short form compared to the waitlist control group indicate improvements ranging from 8% to 16% of the standard deviation, corresponding to effect sizes of d = 0.08–0.16."
Tartışma: "The most significant impact was observed in the reduction of anxiety (d = −0.16)"
Yani küçük etki = öz-bildirim anketleri (stres, kaygı, depresyon, ruminasyon); kortizol değil. Kapanış cümlesi de aynen: "The importance of small effects through economic interventions for health-promoting behaviour is highlighted."

Mevcut finding (92 kr.): "362 kişilik 2 aylık bir denemede 11 dakikalık yoga nidranın bekleme grubuna göre etkisi küçüktü." — doğru ama ölçü belirsiz.

ÖNERİ (97 kr., rakamla, parantezsiz, sağlık iddiası yok):
**362 kişilik 2 aylık denemede 11 dakikalık yoga nidranın bekleme grubuna göre anket farkı küçüktü.**

Not: "stres/kaygı azaldı" demedim; bu, sağlık iddiası gibi okunur. Ölçüyü `limit` alanında vermek istenirse: "Küçük fark öz-bildirim anketlerinde: stres, kaygı, depresyon, ruminasyon."

## Görev 2 — breath.js evidence cümleleri

### breath.js:95 (nose)
Mevcut: "Kaygı azaldı, ama sessiz dinlenmede de azaldı (Telles 2026, n=45). Göz içi basıncını artırmadı (Kulkarni 2022, n=164)."

**Telles 2026** → PMID 41765327, doi:10.17761/2025-D-25-00026. Int J Yoga Therap 35 (2025 sayısı; PubMed yayın tarihi 2026-02-17). Randomize çapraz deneme.
- DİKKAT künye: ilk yazar Telles DEĞİL. PubMed yazar sırası: Gandharva K, Sharma SK, Balkrishna A, Telles S. Doğru kısa ad "Gandharva 2026".
- Kişi (aynen): "Forty-five participants" → n=45 doğru. Oturum 15 dakika.
- Bulgu (aynen): "State-Trait Anxiety Inventory scores decreased after right-uninostril breathing, left-uninostril breathing, alternate-nostril breathing, and quiet rest ..."
- Uyum: cümle özetle uyuşuyor; "sessiz dinlenmede de" dürüst bir sınırlama. Sağlık iddiası gibi okunmuyor.

**Kulkarni 2022** → PMID 36532821, doi:10.2147/OPTH.S389495. Clin Ophthalmol 2022;16:4047-4054. Randomize deneme, 4 kol.
- Kişi (aynen): "One hundred and sixty-four normal subjects were randomly assigned to one of four specific breathing groups" → n=164 toplam; alternate nostril kolu tek başına 164 değil (kol sayısı özette yok).
- Bulgu (aynen): "There was no significant IOP change in ANB and NB." Sonuç cümlesi: "... are safe and do not raise IOP in normal subjects."
- Uyum: "artırmadı" yazarların sonucuyla uyuşuyor ama ölçülen şey "değişmedi". Ayrıca "normal subjects" bilgisi eksik; cümle hastalara da güvence gibi okunabilir (örtük sağlık/güvenlik iddiası).

ÖNERİ (:95):
**15 dakikada kaygı puanı düştü, ama sessiz oturmada da düştü (Gandharva 2026, n=45). Sağlıklı kişilerde göz içi basıncı değişmedi (Kulkarni 2022, n=164, 4 kol).**

### breath.js:108 (hum)
Mevcut: "5 dk vızıltılı nefes, yavaş nefese göre toparlanmada kalp ritmi değişkenliğini daha çok artırdı; tansiyon farkı yok (Ghati 2020, n=70, hipertansif). Mırıldanmak burundaki nitrik oksidi artırır (Maniscalco 2003)."

**Ghati 2020** → PMID 32620379, doi:10.1016/j.explore.2020.03.009. Explore (NY) 2020;17(4):312-319. RCT.
- Kişi (aynen): "70 patients with essential hypertension ... BHB exercise (n=35) or placebo slow breathing exercise (n = 35) for 5-minutes duration" → n=70, hipertansif, 5 dk doğru.
- Tansiyon (aynen): "There was no significant decrease in systolic ..., diastolic ... and mean blood pressures ... after BHB exercise in comparison to the control group" → "tansiyon farkı yok" uyuşuyor.
- KKD (aynen): "significant increase in the HF power ... and decrease in the LF power ... during the recovery phase" → özet "HRV arttı" demiyor; HF arttı, LF azaldı. "Kalp ritmi değişkenliğini daha çok artırdı" fazla genel. Yazarların "augments the parasympathetic tone" yorumunu metne taşımamak gerekir (fizyolojik yorum/sağlık iması).

**Maniscalco 2003** → belirsiz: PubMed'de 2003'te Maniscalco'nun 3 mırıldanma yayını var:
- PMID 12952268, doi:10.1183/09031936.03.00017903, Eur Respir J 22(2):323-9 — "10 healthy subjects"; aynen: "humming results in a large increase in nasal nitric oxide". En olası kaynak bu.
- PMID 14636292, doi:10.1111/j.1365-2362.2003.01277.x, Eur J Clin Invest 33(12):1090-4 — 38 kişi; art arda mırıldanma sonrası burun NO'su daha düşük.
- PMID 12525230, doi:10.1001/jama.289.3.302-b, JAMA mektubu; ilk yazar Lundberg, özet yok.
- Uyum: "artırır" genel geniş zaman; özet ölçümü tek nefeste ve 10 sağlıklı kişide yapıyor, üstelik aynen: "The NO peak decreased in a step-wise manner during repeated consecutive humming manoeuvres". n de yok. Faydaya işaret etmese de mekanizma iddiası gibi okunuyor.

ÖNERİ (:108):
**5 dakikalık vızıltılı nefeste tansiyon farkı yok; toparlanmada HF gücü arttı, LF azaldı (Ghati 2020, n=70, hipertansif). Tek nefeslik mırıldanmada burundan çıkan nitrik oksit arttı, art arda yapınca tepe düştü (Maniscalco 2003, n=10).**

Daha sade seçenek (HF/LF teknik geliyorsa): "... toparlanmada kalp ritmi ölçümleri farklıydı ..." ya da Maniscalco cümlesini tümden çıkarmak (egzersizle ilgili bir sonuç ölçmüyor; yalnızca burun gazı ölçümü).

Karar gerektiren: sources.js'te bu 4 kaynağın kaydı yok (grep boş); eklenecekse Maniscalco için PMID 12952268 öneriliyor, Telles yerine "Gandharva 2026" yazılmalı.
