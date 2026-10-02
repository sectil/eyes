# Nefona Yoga: karar planı (sürüm 2)

Tarih: 2026-09-28. Hazırlayan: tasarım lideri (bu belge). Depoda hiçbir izlenen dosya değiştirilmedi.

**Bu sürümde ne değişti:** `CRITIQUE.md`'deki 35 bulgunun hepsi işlendi. Aynı gün yapılan ElevenLabs hız ölçümleri de
plana girdi. Önceki sürüm konuşmayı saniyede 2,5–3,6 hece varsaymıştı; ölçülen hız bunun yaklaşık iki katı. Bu yüzden
bütün süre, metin uzunluğu, boyut ve maliyet sayıları yeniden hesaplandı. Hangi bulgunun hangi bölümde karşılandığı
`PLAN.v2.changes.md` dosyasında. Sahip kararı gerektiren bulgular §G tablosuna taşındı.

**Durum, açıkça:** Bu bir plandır. Henüz tek satır ders metni seslendirilmedi, tek saniye müzik üretilmedi, kod
yazılmadı. Yalnız hız ölçümü için 76 heceli tek bir deneme paragrafı 7 kez okutuldu (`hiz/*.mp3`); bu bir ders metni
değildir. Sahibin kuralı gereği ("mükemmel değilse olmuş gibi yazma") hiçbir parça "bitti" sayılmaz. Bir ders ancak
şu dört koşul sağlanınca `[x]` olur (YAPILACAKLAR.md:8-9 işaret kuralı): (1) metni üç insan incelemesinden geçer (§C),
(2) sesi ölçülür (§D.6), (3) cihazda kilitli ekranda 5 ve 30 dakika çalar, (4) sahibi dinleyip onaylar.

**Girdiler (hepsi baştan sona okundu):** `SAHIP_ISTEKLERI.md`, `PLAN.md` (sürüm 1), `CRITIQUE.md`,
`dossier-sakin.dogrulanmis.md`, `dossier-benlik.dogrulanmis.md`, `dossier-teslim.dogrulanmis.md`,
`dossier-guvenlik.dogrulanmis.md`, `pazar.md`, `kod-haritasi.md`, `elevenlabs.md`. Ayrıca `hiz/*.mp3` dosyalarının
süreleri bu görevde ölçüldü.

**Kanıt kuralı bu belgede:**
- Yalnız dosyaların **ikinci tur doğrulamasından geçmiş** iddiaları kullanıldı (sakin §13, benlik §19 C01–C50,
  teslim başlık notu, güvenlik §14 C1–C29). İkinci turdan geçmemiş kaynaklar (ör. Zuo 2023, Colzato 2012, Madsen &
  Parra 2024, Lieberman 2007, Matko 2022) kanıt satırlarına konmadı.
- Sürüm 1 için PubMed'den 11 kayıt `get_article_metadata` ile yeniden çekildi: Moszeik 2025, Kirschner 2019,
  Knowlton & Larkin 2006, Lee 2022, Bernardi 2009, Diel 2025, Kross 2014, Harvey & Payne 2002, Marschin 2026, Luu 2024,
  Shuminsky & Davidow 2026. Eleştiri turunda iki kayıt daha yeniden çekildi: Gibbs 2026 (41743305) ve Whitfield 2021
  (34350544). Bu sürüme yeni PMID eklenmedi.
- Dil: "çalışmada … görüldü". Uygulama "tedavi eder / iyileştirir" demez.
- **VARSAYIM** etiketi, kanıtın sayı vermediği yerde konan tasarım değerini gösterir. Pilotta ölçülüp kesinleşir.
  **Tasarım çıkarımı** etiketi ise kanıttan yola çıkan ama doğrudan sınanmamış bir kararı gösterir.
- Kod iddiaları `dosya:satır` biçimindedir ve satır numaraları HEAD `d515702`'ye göredir. Sürüm 1'de kendim okuduklarım:
  registry.js:57, dataHub.js:24-28 ve :36-38, releases.js:1-4, YAPILACAKLAR.md:8-9, dalga/manifest.js:17-23,
  progress.js:70-73, dalgaMusic.js:5-8, DalgaVisual.jsx:4-6 ve :23, breath.js:1-6, :14, :351-354,
  design/dalga-uyku/master.py:1-6, design/uyanma-sesleri/analyze.py ve README. **Bu sürümde ayrıca d515702'de
  okunanlar:** registry.js:40-50, :60-83 ve :112; progress.js:72, :81, :107; lib/dalga.js:14; Dalga.jsx:45-53 ve
  :134-152; Yon.jsx:362; Safety.jsx:7-9; breath.js:350-354; styles.css:16, :18, :55, :57; dalga.css:52. Bu dosyalardan
  Yon.jsx, Safety.jsx, breath.js, Dalga.jsx, progress.js ve registry.js çalışma ağacında da HEAD ile aynı
  (`git diff` boş). Geri kalan kod atıfları `kod-haritasi.md`'nin okumasıdır ve öyle belirtildi.

---

## 0. Tek bakışta

| Konu | Karar |
|---|---|
| Ders sayısı | 10 ders. Hepsi 5–30 dk arasında **her dakika** çalınabilir ve her sürede varış + çekirdek + kapanışla biter |
| Mimari | Blok tabanlı ders + saf JS planlayıcı + çok izli yerel iOS ses motoru (konuşma, yatak A/B, doğa A/B, nefes bordunu). Görsel, sesle **aynı zaman çizelgesini** motorun bildirdiği konumdan okur |
| Ses | Neslihan ve Hakan. Üretim yolu sahibin kararı (§G5): **A)** REST API (anahtar bulut ortamının sırrı olarak durur; hız, kararlılık, seed, cümleler arası süreklilik ve telaffuz sözlüğü ayarlanabilir) ya da **B)** yalnız MCP araçları (`eleven_v4`, her klipte en iyi 2–3 okuma seçilir). Önerim A. Ölçülen klip içi hız 5,6–6,6 hece/sn; REST'te hız 0,8'de ≈ 5,2 (tahmin). Dersin yavaşlığı sözcükleri uzatmaktan değil, uygulamanın klipler arasına koyduğu sessizlikten gelir. "Seslerin eğitilmesi"nin somut karşılığı §D.1.4'te |
| Konuşma ile müzik | Üç mutlak düzey (VARSAYIM): konuşma −18 LUFS, konuşma sırasında kısık yatak ≈ −33 LUFS, duyurulan sessiz pencerede yatak ≈ −27 LUFS. Yatak yalnız duyurulan ve ≥ 20 sn süren pencerelerde kalkar. Kreşendo yok, vokal yok |
| Yükseklik | Gündüz dersi −18 LUFS ±1, gerçek tepe ≤ −1,5 dBTP; gece dersi −20 LUFS (VARSAYIM) |
| Tekrarsız müzik | Çekirdek evresinde 4 varyantlı yatak rastgele ve tekrarsız sırayla çalar. Kuş sesi tek tek çağrılardan kurulur, aynı motif dönmez. Nefes bloklarında periyodu tam bordunu uygulamanın kendi hattı basar |
| Görsel | Neredeyse siyah sahnede tek "nefes formu". Yalnız söylenen nefes ipuçlarıyla büyüyüp küçülür, evreye göre ışık değiştirir. Okunacak yazı yok, Hareketi Azalt'a uyar, ekranı açık tutmaz. 10 dersin her birinin kendi vurgu rengi var (§E.2) |
| Pilot | Önce **Ders 2 "Derin Dinlenme"** (Yoga Nidra) iki sesle ve bütün sürelerde üretilir, ölçülür, tasarım Artifact'ı içinde gerçek sesle sahibine dinletilir. Onay gelmeden kalan 9 derse geçilmez |
| Maliyet | Pilot ≈ 87–106 bin kredi (yol A) ya da 123–141 bin kredi (yol B). 10 dersin tamamı ≈ 536–728 bin (A) ya da 753 bin – 1,17 milyon (B). MCP çalışma alanı oranıyla (5.500 kredi = 1 USD) ≈ 97–132 USD (A), 137–213 USD (B). REST'te hesabın katmanı ve kredi fiyatı doğrulanmadı. ~100 USD tavanı, müzik ElevenLabs'ten üretilirse yetmeyebilir (§F.1, §G5, §G9) |
| Paket boyutu | +≈ 200–280 MB: konuşma 101–136, müzik 87–131, doğa ≈ 11, bordun ve oda sesi ≈ 1 MB (AAC 48/64 konuşma, AAC 64–96 yatak). Karar sahibin (§G2) |
| Açık kararlar | 11 madde, önerileriyle §G'de |

---

## A. On ders

### A.0 Seçim yöntemi

Her ders üç süzgeçten geçti: **popülerlik** (pazar.md §7 sırası ve kaynak URL'leri), **doğrulanmış kanıt**
(yalnız ikinci turdan geçen PMID'ler) ve **Nefona'ya uyum** (7 alan: `DOMAINS = ['eye','calm','self','awareness','focus','wellbeing','body']`,
registry.js:57). Sahibin saydığı sözcükler (meditasyon, gelişim, özgüven, kendini geliştirme, rahatlama) listenin
içinde. Göz sağlığı kökeni iki yerde yaşar: gözlerin açık kalabildiği her ders ("gözlerini kapatabilir ya da bakışını
yumuşakça bırakabilirsin") ve Tek Nokta dersindeki yumuşak bakış (drishti) bölümü; göze zorlayan hiçbir şey yok
(kırpmadan bakma, trataka yok).

| # | Ders | Pazar sinyali (pazar.md) | Kanıt dayanağı (özet) | Gelişim alanı |
|---|---|---|---|---|
| 1 | Nefesin Ritmi | 6/8 uygulamada nefes kategorisi; TR 581 bin + 577 bin (§7 #8) | Yavaş nefeste vagal KAD (kalp atışı değişkenliği) artışı MA'sı; uzun verişte daha çok gevşeme bildirimi | calm |
| 2 | Derin Dinlenme (Yoga Nidra) | Insight Timer "Popular" 1. sıra Yoga Nidra; "yoga nidra türkçe" aranıyor, içerik az (§7 #4, #2) | 11 dk ve 30 dk YN doğrudan karşılaştırması; travma-duyarlı YN'nin 10 bileşeni | body |
| 3 | Uykuya Geçiş | Calm başlama nedeni %62,97; TR 6,44 milyon (§7 #1) | Uyku öncesi imgeleme; yatmadan önce yavaş nefes (öznel); müzik Cochrane | wellbeing |
| 4 | Zor Anlar İçin | "Anxiety" 8/8 listede; Calm %54,47 (§7 #3) | Kısa farkındalık indüksiyonu; mesafeli iç konuşma; ACT deneyimsel bileşenler | calm |
| 5 | Tek Nokta (odak) | Headspace ana bölüm "Focus"; 6/8 uygulama (§7 #9) | 8 dk nefes ve 10 dk kayıt; dikkatte küçük etki | focus |
| 6 | Sabah Niyeti | Insight Timer "Popular Search: Morning"; TR 699 bin, "sabah meditasyonu 5 dakika" (§7 #5, #15) | 7 dk hareketli oturumda olumlu duygu; eğer-ise planı MA'sı | wellbeing |
| 7 | Kendine Şefkat | "meditation for self…" ilk öneri self love; TR 312 bin (§7 #7, #13) | 11,5 dk öz-şefkat kaydı; öz-eleştiri MA'sı; metta MA'sı | self |
| 8 | Sağlam Yer (özgüven) | Insight Timer "Confidence", Meditopia "Özgüven"; TR 822 bin / 331 bin (§7 #6) | Özgüven için doğrudan MA yok; dolaylı: mesafeli iç konuşma, öz-onaylama, öz-şefkat | self |
| 9 | Kendini Tanımak | Healthy Minds "Insight: Know Yourself Better"; TR "kendini tanıma testi" (§7 #12) | Beden farkındalığı eğitimi; bedenden habersiz kümede yanıt yok | awareness |
| 10 | Gelecekteki Sen (gelişim) | Calm/Headspace "personal growth"; Insight Timer "Life Purpose" (§7 #12, #15) | En iyi olası benlik MA'sı; günde 5 dk imgeleme; eğer-ise planı | wellbeing |

Dışarıda kalanlar ve nedeni: **Şükran** ayrı ders değil, Sabah Niyeti içinde blok (etki küçük ve aktif karşılaştırmadan
üstün değil: Davis 2015, PMID 26575348, DOI [10.1037/cou0000107](https://doi.org/10.1037/cou0000107); Choi 2025 g=0,19,
PMID 40627390, DOI [10.1073/pnas.2425193122](https://doi.org/10.1073/pnas.2425193122)). **Olumlama** ayrı ders değil,
çünkü öz-saygısı düşük kişilerde "Sevilmeye değer biriyim" tekrarı daha kötü hissettirdi (Wood 2009, PMID 19493324,
DOI [10.1111/j.1467-9280.2009.02370.x](https://doi.org/10.1111/j.1467-9280.2009.02370.x)). **Sevgi-şefkat (metta)**
Kendine Şefkat dersinin omurgası. **Bırakma** Zor Anlar İçin dersinde blok. **Şifa, bolluk, frekans, iç çocuk**
sağlık iddiası taşıdığı için yok (pazar.md §3.4).

### A.1 Ortak kurallar (her ders için geçerli, tekrar yazılmadı)

- **Açılış cümlesi, her derste aynı:** "İstediğin an gözlerini açabilir, kıpırdayabilir ya da ara verebilirsin." (pilot
  2. tur, T08: uzanan dinleyici için "durabilirsin" "olduğun gibi kalabilirsin" diye de anlaşılabiliyordu; güvenlik
  §11.A'daki kural aynı, sözcük netleşti. Gözler için seçim sunulan derslerde bu cümle o seçimden sonra, varışın içinde
  söylenir, çünkü "gözlerini açabilir" kapalı gözü varsayar; pilot T33. Güvenlik
  §0-2 ve §11.A; Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021)).
  Luu 2024'ün 10 bileşeni özette var; "gözleri açma" seçeneği bu bileşenlerden çıkarılmış bir **tasarım çıkarımıdır**
  (güvenlik C10). Dersin kendine özgü açılış cümlesi bunun hemen ardından gelir (§A.2.1).
- **İlk ders cümlesi:** kişinin dinlediği ilk yoga dersi hangisiyse, açılış cümlesinden hemen sonra bir kez şu söylenir:
  "Bugün yalnızca tanışıyoruz; zorlanırsan kısalt." (güvenlik §11.A). Planlayıcıya `firstEver: true` girdisiyle
  eklenir ve süreye dahildir. Her ders ve iki ses için ayrı üretilir (klipler arası süreklilik §D.6).
- **Araç uyarısı her dersin açılış ekranında:** ders ayrıntısı ekranında "Başla" düğmesinin üstünde tek satır: "Araç
  kullanırken dinleme." Uyku dersinde ikinci satır: "Bu dersten hemen sonra araç kullanma." (güvenlik §11.E; Bioulac
  2017, PMID 28958002, DOI [10.1093/sleep/zsx134](https://doi.org/10.1093/sleep/zsx134)). Onboarding kartındaki satır
  da korunur.
- **Ayakta hiçbir şey yok:** bütün dersler oturarak ya da uzanarak yapılır. Ayakta nefes pratiği ve ayakta hareket
  yok; ders içinde "ayağa kalk" yönergesi yok (breath.js:354: "Araç kullanırken, suda ya da ayaktayken yapma"; güvenlik
  §0-5 ve §11.C). Dağ duruşu yalnız oturarak yapılır. Uzanarak yapılan derslerin kapanışında yalnız güvenli kalkış
  sırası söylenir: "yana dön, otur, bekle, sonra kalk" (güvenlik §11.A).
- **Gözlere dokunan yönerge yok** (uygulamanın göz sağlığı kökeni): bhramari ağız kapalıyken vızıltıyla yapılır;
  parmaklarla gözleri, kulakları ve yüzü kapatma (shanmukhi) yoktur, parmaklar gözlere değmez. Avuçlamada avuçlar
  gözlerin üstüne bastırmadan konur, avuç kenarları alına ve elmacık kemiklerine yaslanır.
- **İki ses:** her ders Neslihan ve Hakan ile ayrı ayrı kaydedilir. Bir fizibilite çalışmasının görüşmelerinde
  anlatıcı tercihlerinin kişiden kişiye değiştiği raporlandı (Huberty 2022; kanser hastaları ve kanserden kurtulanlar,
  görüşme n=6; PMID 36416880, DOI [10.2196/39228](https://doi.org/10.2196/39228); benlik C49). Pazarda da ses seçimi
  standart (pazar.md §6.1). Varsayılan ses kişinin `prefs.voice` seçimidir (kod-haritasi.md §3: prefs.js:17). Dersin
  kartında "önerilen ses" yalnız ilk dinleyişte gösterilir.
- **Nefes:** önce doğal nefes fark edilir; "derin nefes al" komutu yok (Toussaint 2021'de derin nefes talimatı önce
  uyarılmayı artırdı: PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040)). Hızlı ya da
  zorlu nefes, hiperventilasyon ve ardından tutma **hiçbir derste yok** (güvenlik §11.C). Tutma varsa isteğe bağlıdır,
  en çok 7 sn sürer (breath.js:14 `HOLD_MAX = 7`).
- **Müzik ailesi:** hedef 48–72 BPM hissi; belirgin vuruş, vokal ve insan sesine benzeyen koro yok; kreşendo yok
  (teslim §0 M1, M3, K1). Teslim M2'deki "~10 sn'lik müzik cümlesi" ElevenLabs Music'te ayarlanamaz, çünkü tempo ve ton
  parametresi yok (elevenlabs.md §3). Bu yüzden istemde istenir, üretilen yatağın temposu ölçülür (§D.6) ama müziğin
  nefese eşlik ettiği iddia edilmez. Nefesle aynı periyot gereken yerde (nefes blokları) bordunu uygulamanın kendi
  hattı basar ve periyot tam olur (§D.3). Her dersin kendi teması vardır ve 5 ile 30 dk sürümünde aynı kalır (Opheij &
  Brouwer 2025: aynı müzikle yeniden duyulan cümleler daha iyi tanındı; PMID 41331213, DOI
  [10.3758/s13414-025-03159-7](https://doi.org/10.3758/s13414-025-03159-7)).
- **Arka plan seçimi:** Müzik / Doğa / Sessizlik; dersin varsayılanı aşağıda. Seçim yönteminin tek başına belirleyici
  olduğu gösterilmedi (teslim §3.3), bu yüzden karar kişiye bırakılır. "Sessizlik" seçilince tam dijital sessizlik
  olmaz, çok alçak bir oda sesi tabanı çalar (§D.2).
- **Gelişim ölçüsü:** her derste tek madde, **1–10** ölçeğinde, önce ve sonra sorulur; atlanabilir. Dalga'nın puan
  bileşeni yeniden kullanılır (lib/dalga.js:14 `RATE_MAX = 10`; Dalga.jsx:45-53 düğmeleri 1'den 10'a dizer). Uyku
  dersinde önce puanı sorulmaz; ertesi sabah tek soru gelir (§E.1-8, §E.4). Puanlar "nasıl hissettin" gidişatıdır,
  etki kanıtı değildir (progress.js:71 notu).
- **Ekran:** oynatıcı ekranı açık tutmaz. Ekran sistemin kendi süresinde kilitlenir, ders kilitte sürer (§B.5).

### A.2 Ders kartları

Her kartta: başlık, tek satırlık söz (sağlık iddiası yok), teknik, kanıt satırı, zaman ve duruş, ses, müzik, güvenlik,
Gelişim ölçüsü. Her dersin benzersiz açılış cümlesi, anahtar cümlesi, imge yayı, görsel biçimi (§A.2.1) ve 30 dk dikkat
eğrisi (§A.2.2) kartlardan sonra tablo olarak verildi; böylece benzersizlik yan yana denetlenebilir. Müzik değerlerinin (BPM, ton, çalgı) hepsi **VARSAYIM**'dır: kanıt yalnız tempo aralığını, vokalsizliği,
düz dinamiği ve ~10 sn cümleyi destekliyor; ton ve çalgı seçimi estetik karardır.

---

#### Ders 1 · Nefesin Ritmi
- **Söz:** "Nefesini yavaşlatmayı ve nefes verişini uzatmayı öğrenmek; kısa bir mola, sakin bir ritim."
- **Teknik (pranayama):** doğal nefesi fark etme → dakikada ~6 nefes, 4 sn alış / 6 sn veriş, tutma yok; iç çekiş
  (iki kısa alış + uzun veriş); bhramari (ağız kapalıyken vızıltılı veriş, döngü 12–14 sn; parmaklar göze ve yüze
  değmez, shanmukhi yok); nadi shodhana (burun deliği değiştirme,
  **tutmasız**, "burnun tıkalıysa atla"). Uygulamadaki nefes motoruyla aynı kurallar (breath.js:2-6).
- **Kanıt:** Yavaş nefeste tek seans sırasında ve hemen sonrasında vagal KAD (kalp atışı değişkenliği) artışı görüldü (Laborde 2022, 223 çalışma,
  PMID 35623448, DOI [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711)). Kısa alış /
  uzun veriş, tersine göre daha çok gevşeme bildirimiyle ilişkiliydi (Van Diest 2014, PMID 25156003, DOI
  [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x)). Günde 5 dk döngüsel iç çekmede, 1 ayda
  olumlu duygulanım ve solunum hızında meditasyondan fazla değişim görüldü; kaygıda gruplar arası fark yoktu (Balban
  2023, n=108, PMID 36630953, DOI [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895)). Vızıltılı
  nefeste en yüksek KAD 12–14 sn döngüdeydi (Trivedi 2023, PMID 38204770, DOI
  [10.4103/ijoy.ijoy_113_23](https://doi.org/10.4103/ijoy.ijoy_113_23)). Güç: fizyolojide orta, psikolojik sonuçta
  düşük–orta.
- **Zaman ve duruş:** gün içinde, oturarak. İlk ders; varsayılan 10 dk.
- **Nefes modülünden farkı:** Nefes modülü tek bir kalıbı sayaç ve görselle çalıştırır; bu ders ise dört tekniği sesli
  bir hocanın rehberliğinde, varışı ve kapanışı olan bir ders olarak sırayla öğretir.
- **Ses:** ikisi de. Önerilen: Neslihan (TR etiketi "calm, confident"; elevenlabs.md §2.5).
- **Müzik:** nefes bloklarında (C1–C4) melodi yok, yalnız Re'de tanpura benzeri bordun. Bordunu uygulamanın kendi
  hattı basar (§D.3) ve döngüsü tam nefes döngüsüne eşittir: C1'de 10,000 sn (4 al / 6 ver), C3'te 13,000 sn.
  Varış, Kapanış ve C5'teki pencerelerde yumuşak bir pad çalar (ElevenLabs; ~60 BPM hissi istemde istenir, ölçülür).
  Doğa sesi varsayılan kapalı. Yay: düz; C5'in son penceresinde pad de çekilir ve yalnız bordun kalır.
- **Güvenlik:** "Başın döner ya da karıncalanırsa normal nefesine dön." Bhramari için "sesin kimseyi rahatsız
  etmeyeceği bir yerde" ve "parmakların gözlerine değmeden". Nöbet sorusuna "Evet / Emin değilim" diyen profilde tutma alternatifleri kapalı (güvenlik
  §11.E).
- **Gelişim:** `calm` · "Şu an ne kadar gerginsin?" 1–10, düşük iyi.

#### Ders 2 · Derin Dinlenme (Yoga Nidra) — pilot ders
- **Söz:** "Uyanık kalarak derin bir dinlenme."
- **Teknik:** klasik yoga nidra akışı: hazırlık → niyet (sankalpa) → beden dolaşımı (bilinç dolaşımı) → nefes
  farkındalığı ve geri sayma → zıtlık çiftleri (ağır/hafif, sıcak/serin) → seçimli imgeleme → niyetin tekrarı →
  dışa dönüş. Aşamaların adları PubMed kayıtlarıyla örtüşüyor; bu tam sıranın özgün Satyananda metni **doğrulanmadı**
  (sakin §1.5).
- **Kanıt:** 11 dk ve 30 dk YN'nin doğrudan karşılaştırıldığı RKÇ'de (n=362) ikisi de küçük etki gösterdi; 30 dk
  yalnız "farkında davranma"da farklıydı (d=0,10, GA sıfıra çok yakın) (Moszeik 2025, PMID 40373021, DOI
  [10.1002/smi.70049](https://doi.org/10.1002/smi.70049); tam metin sakin §1.2). 73 çalışmalık MA'da etkiler var ama
  yazarlar "muhtemelen şişirilmiş" diyor (Ghai 2025, PMID 41327816, DOI
  [10.1111/nyas.70149](https://doi.org/10.1111/nyas.70149)). Kronik ağrılı 23 yetişkinle yapılan yarı deneysel bir
  çalışmada tek 45 dk YN (n=12), beden taramasına (n=11) göre hemen sonrasında iyi oluşta daha fazla artışla birlikte
  gitti (p=0,01) (Gibbs 2026, PMID 41743305, DOI [10.4103/ijoy.ijoy_2_25](https://doi.org/10.4103/ijoy.ijoy_2_25);
  sakin §1.5 ve §13 "yn-vs-bodyscan" satırı; eleştiri turunda PubMed'den yeniden çekildi). Travma-duyarlı 10 bileşen yapıyı belirliyor
  (Luu 2024, yukarıda). Güç: düşük.
- **Neden pilot:** en zor ders bu. Uzun sessizlik, yatarak dinleme, kesintisiz beden dolaşımı, dışa dönüş, imgelem
  seçimi ve iki sesin hepsini bir arada sınar. Türkçe pazarda da açık burada (pazar.md §3.3: en fazla ~84 bin).
- **Zaman ve duruş:** öğleden sonra ya da akşam, **yatarak** (dizaltına yastık önerisi). Varsayılan 15 dk.
- **Ses:** ikisi de. Önerilen: Hakan ("sleep content, meditation"; elevenlabs.md §2.5). Hoparlörde erkek sesin
  zayıf kalma riski ölçülecek (kod-haritasi R12).
- **Müzik:** ~50 BPM hissi, vuruşsuz; Mi♭ majör pad + alçak yaylılar + seyrek, uzak piyano notaları. Doğa katmanı
  varsayılan açık: uzak rüzgâr ve yaprak dokusu, **su yok** (pilot 2. tur, S12: su herkese iyi gelmeyebilir ve orman
  seçene dayatılmamalı; su katmanı ayarda, varsayılan kapalı; ani ses yok; 4 varyant, tekrarsız sıra, §D.3). Yay: ders ilerledikçe müzik kaydı alçalır, parlaklık azalır;
  kapanışta tek bir sıcak akor "şafak" gibi yükselir (ses yüksekliği değil, tını parlaklığı).
- **Güvenlik:** beden dolaşımında "Bu bölge rahatsız ederse bir sonrakine geçebilirsin." (güvenlik §11.B-9); imgelemde seçenek ("bir kıyı ya da bir
  orman"); sessizlik penceresi ≤ 90 sn ve öncesinde haber verilir; kapanışta "yana dön, otur, bekle, kalk" (Tran 2021:
  65 yaş üstünde ayağa kalkınca ilk anda görülen KB düşüşü, sürekli ölçümle havuzlanmış %29; PMID 34260686, DOI
  [10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090)).
- **Gelişim:** `body` · "Bedenin şu an ne kadar gergin?" 1–10, düşük iyi.

#### Ders 3 · Uykuya Geçiş
- **Söz:** "Günü bırakıp uykuya yavaşça geçmek için."
- **Teknik:** uyku sürümü yoga nidra: yavaş uzun veriş (tutma yok) → bedenin ağırlaşması (yavaş beden dolaşımı) →
  nefesle geri sayma → **tek sahneli, ayrıntılı, ilgi çekici imgeleme** → uyku izni. Dışa dönüş yok.
- **Kanıt:** Uykusuzluk yaşayan 41 kişide, ilgi çekici bir imgeyle dikkat dağıtma talimatı talimatsız gruba göre daha
  kısa uykuya dalma süresi ve daha az uyku öncesi zihinsel etkinlik bildirimiyle birlikte gitti (Harvey & Payne 2002,
  PMID 11863237, DOI [10.1016/s0005-7967(01)00012-2](https://doi.org/10.1016/s0005-7967(01)00012-2)). Yatmadan önce
  yavaş nefeste öznel uyku iyileşti, objektif ölçümler belirsizdi (Eide 2026, PMID 41886931, DOI
  [10.1016/j.smrv.2026.102284](https://doi.org/10.1016/j.smrv.2026.102284)). Uyku güçlüğü olan yetişkinlerde kayıtlı
  müzik öznel uyku kalitesinde fark gösterdi, objektif ölçümde göstermedi (Jespersen 2022, Cochrane, PMID 36000763,
  DOI [10.1002/14651858.CD010459.pub3](https://doi.org/10.1002/14651858.CD010459.pub3)). Dürüst karşı kanıt: tek 30 dk
  YN kaydı sessiz uzanmaya göre uykuya dalma süresini değiştirmedi (Sharpe 2023, n=22, PMID 36731199, DOI
  [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169)). Uygulama "uyutur" demez.
- **Zaman ve duruş:** yatakta, ışıklar kapalı, yatarak. Varsayılan 20 dk.
- **Ses:** ikisi de. Önerilen: Hakan. Ses ders boyunca kademeli olarak yavaşlar, alçalır ve yumuşar (Knowlton &
  Larkin 2006: yalnız bu tarz seste EMG diğer üç gruba göre düştü; PMID 16941239, DOI
  [10.1007/s10484-006-9014-6](https://doi.org/10.1007/s10484-006-9014-6)).
- **Müzik:** 48 BPM hissi, vuruşsuz; La♭ majör sıcak pad + çok seyrek keçe piyano. Doğa katmanı varsayılan açık:
  çatıda hafif yağmur (sürekli, gök gürültüsü yok). Yay: sürekli incelen doku; son bölümde yalnız pad ve yağmur.
  **Müzik kuyruğu** ayrı ayar: 0 / 5 / 10 / 20 dk (varsayılan 10), son 3 dk kosinüs eğrisiyle kısılır ve **tamamen
  durur** (dalgaSleep.js:12,18 kalıbı; kod-haritasi §2.3). Sabaha kadar çalmaz (güvenlik §11.D-5).
- **Güvenlik:** uyku izni: "Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak." Kulak içi kulaklık yerine hoparlör
  önerisi; bu bir **tasarım çıkarımıdır** (Wang ve ark. 2021, kulaklık çalışması: küme RKÇ'sinde sağlık eğitimi
  kulaklıkla uyumayı azalttı ve çalışma bunu işitme açısından riskli davranış olarak ele aldı; PMID 33562129, DOI
  [10.3390/ijerph18041560](https://doi.org/10.3390/ijerph18041560); güvenlik C27). Bu dersten
  hemen sonra araç kullanılmaz (Bioulac 2017, PMID 28958002, DOI
  [10.1093/sleep/zsx134](https://doi.org/10.1093/sleep/zsx134)).
- **Gelişim:** `wellbeing` · **Önce puanı sorulmaz** (yatakta en az dokunuş; sürüm 1'deki "Zihnin ne kadar meşgul?"
  sorusu hiçbir `effects` ya da `metrics` girdisine bağlanmadığı için kaldırıldı). **Ertesi sabah** uygulama ilk
  açıldığında, ertesi gün saat 12:00'ye kadar tek soru: "Dün gece uykuya dalmak ne kadar kolaydı?" 1–10. Soru 12:00'den
  sonra sorulmaz, o gece için veri boş kalır. Bu bir `metrics` zaman serisidir: `unit: 'puan'`, `better: 'up'`,
  `series()` (registry.js:40, doğrulama :73-82). Ekranı §E.1 madde 8.

#### Ders 4 · Zor Anlar İçin
- **Söz:** "Zor bir duyguyla, onu itmeden ve ona kapılmadan birkaç dakika kalmak."
- **Teknik:** dayanak (ayak tabanları, eller, odadaki sesler) + uzun veriş → duyguyu bedende bulmak ve kısaca
  adlandırmak ("Bu… huzursuzluk.") → kendine içinden adınla ya da "sen" diye seslenmek → derede yapraklar (düşünceden
  ayrışma; imge seçimli: "bir derenin kıyısı ya da gökte geçen bulutlar", güvenlik §11.B-10) → duyguya nefesle yer açmak → şefkatli el → dayanağa dönüş. Gözler **açık** kalabilir; bu derste varsayılan
  öneri gözlerin yarı açık olması.
- **Kanıt:** Tek bir farkındalık indüksiyonu, uyandırılmış olumsuz duyguyu düzenlemede karşılaştırmalardan üstündü
  (d=−0,28; Leyland 2018, PMID 29578742, DOI [10.1037/emo0000425](https://doi.org/10.1037/emo0000425)). Kendine ad ya da
  "sen" ile seslenmek, kendinden uzaklaşmayı artırdı ve stres anında daha az sıkıntıyla birlikte gitti (Kross 2014,
  7 çalışma, N=585, PMID 24467424, DOI [10.1037/a0035173](https://doi.org/10.1037/a0035173)). ACT laboratuvar
  bileşenlerinde deneyimsel yöntem (metafor, egzersiz) yalnız açıklamadan daha büyük etki gösterdi (Levin 2012,
  PMID 23046777, DOI [10.1016/j.beth.2012.05.003](https://doi.org/10.1016/j.beth.2012.05.003)). Olumlu anlarda
  adlandırma hazzı azalttı (Lieberman 2011, PMID 21534661, DOI
  [10.1037/a0023503](https://doi.org/10.1037/a0023503)), bu yüzden adlandırma yalnız zor duyguda. Uyarı: kısa
  farkındalık eğitimlerinde etki yayın yanlılığı düzeltmesiyle g=0,04'e düştü (Schumer 2018, PMID 29939051, DOI
  [10.1037/ccp0000324](https://doi.org/10.1037/ccp0000324)). Güç: zayıf–orta.
- **Zaman ve duruş:** zorlandığın an, oturarak. Varsayılan **5 dk**.
- **Ses:** ikisi de. Önerilen: Neslihan.
- **Müzik:** 56 BPM hissi, Sol majör; viyolonsel benzeri alçak-orta bordun + yumuşak gitar armonikleri; doğa varsayılan
  kapalı (dere yalnız imgede anlatılır, sesle taklit edilmez; imgeyi kişi kendisi kursun). Yay: ilk dakikada biraz daha
  dolu doku, sonra incelir (VARSAYIM: "önce karşıla, sonra yönlendir" zanaat ilkesi; kanıtla sınanmadı).
- **Güvenlik:** sessizlik penceresi ≤ 45 sn (VARSAYIM; kaygılı dinleyicide uzun rehbersiz boşluk verilmez, güvenlik
  §4). "Huzursuzluk normal" cümlesi (Braith 1988: tek kayıttan seansta 30 kişinin 5'inde kaygı arttı; PMID 3069875,
  DOI [10.1016/0005-7916(88)90040-7](https://doi.org/10.1016/0005-7916(88)90040-7)). Geçmiş olay çağrılmaz, yalnız şu
  anki beden duyumu. Adında ve metninde "kaygı tedavisi", "anksiyete" yok. Sonda "Sık tekrarlarsa bir uzmanla konuşmak
  iyi olur. Acil durumda 112." kartı (güvenlik §11.F; dil Yon.jsx:362 ile aynı; bu satır sürüm 2'de d515702'de
  yeniden okundu).
- **Gelişim:** `calm` · "Bu duygu şu an ne kadar yoğun?" 1–10, düşük iyi.

#### Ders 5 · Tek Nokta
- **Söz:** "Dikkatini tek bir noktada toplamak ve dağıldığında nazikçe geri getirmek."
- **Teknik (dhyana, ekagrata):** nefes çapası ("Fark ettiğin an, zaten geri döndün.") → nefes sayma 1–10 → uzayan
  sessiz odak aralıkları (15 → 30 → 45 → 60 sn), her aralık sonunda yumuşak geri çağırma → ses çapası ya da yumuşak
  bakış (gözler yarı açık, bakış önde bir noktada, **kırpmak serbest**) → 30 dk'da açık izleme.
- **Kanıt:** 8 dk farkındalıkla nefes, zihin gezinmesinin davranışsal göstergelerini pasif gevşemeye ve okumaya göre
  azalttı (Mrazek 2012, PMID 22309719, DOI [10.1037/a0026678](https://doi.org/10.1037/a0026678)). Acemilerde 10 dk kayıt
  dikkat görevlerinde daha iyi sonuçla birlikte gitti, yalnız "bazı acemilerde" (Norris 2018, PMID 30127731, DOI
  [10.3389/fnhum.2018.00315](https://doi.org/10.3389/fnhum.2018.00315)). 45 RKÇ'de nesnel bilişte küçük etki (g=0,15),
  aktif karşılaştırmaya göre yok (Whitfield 2021, PMID 34350544, DOI
  [10.1007/s11065-021-09519-y](https://doi.org/10.1007/s11065-021-09519-y)). Zihin gezinmesindeki azalma çoğunlukla
  en az 2 haftalık pratikten sonra (Feruglio 2021, PMID 34560133, DOI
  [10.1016/j.neubiorev.2021.09.032](https://doi.org/10.1016/j.neubiorev.2021.09.032)). Güç: anlık orta, kalıcı zayıf.
- **Zaman ve duruş:** gün içinde, iş öncesi; oturarak. Varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Neslihan.
- **Müzik:** 60 BPM, neredeyse yok: tek, sürekli bir sinüs benzeri ton ve seyrek, yumuşak saldırılı bir çan. Çan
  **ses çapası** olarak kullanılır ("Çanı duyduğunda dikkatini nefese getir."). Sessiz odak aralıklarında müzik çekilir,
  gerçek sessizliğe yakın kalır (Bernardi 2006: 2 dk sessizlik KH, KB ve ventilasyonu başlangıcın altına indirdi;
  PMID 16199412, DOI [10.1136/hrt.2005.064600](https://doi.org/10.1136/hrt.2005.064600)). Doğa kapalı.
- **Güvenlik:** gözler yarı açık bölümünde "gözlerin yorulursa kapat ya da kırp" (göz sağlığı kökeniyle tutarlı).
  Kapanışta isteğe bağlı "avuçlama": ısıtılmış avuçlar kapalı gözlerin üstüne **bastırmadan** konur, avuç kenarları
  alına ve elmacık kemiklerine yaslanır ("Avuçların gözlerine değmesin, yalnızca üstünde dursun."); yalnız bir dinlenme ritüeli
  olarak; etkisi için kaynak aranmadı, **iddiasız** (doğrulanmadı).
- **Gelişim:** `focus` · "Dikkatin şu an ne kadar toplanmış?" 1–10; ölçü etiketi "odak". Gelişim'de "dikkatin gelişti" denmez (Whitfield 2021).

#### Ders 6 · Sabah Niyeti
- **Söz:** "Güne bedenini uyandırıp tek bir niyet seçerek başlamak."
- **Teknik:** oturarak omurga hareketi (kedi-inek, yan esneme) ve doğal nefes → oturarak hafif akış (boyun, omuz, yan
  esneme, kollar nefesle) → oturarak dağ duruşunda kısa durgunluk → şükran üçlüsü (bir kişi, bir an, bir beden duyusu; adlandırmadan tadını
  çıkarmak) → niyet (sankalpa: tek kelime) → günün provası + eğer-ise planı. Durgun meditasyon değil.
- **Kanıt:** Tek 7 dk'lık rehberli oturumda üç kolda da stres, olumsuz duygu ve kaygı azaldı; olumlu duygu en çok
  dayanıklılık/kuvvetten sonra, yoga hareketliliğinden sonra daha az arttı, meditasyondan sonra neredeyse hiç
  değişmedi (etkileşim p=.05, sınırda; Marschin 2026, n=131, PMID 42453615, DOI
  [10.3389/fspor.2026.1774292](https://doi.org/10.3389/fspor.2026.1774292)). Engel + eğer-ise planı hedefe ulaşmada
  g=0,336 (Wang ve ark. 2021, eğer-ise MA'sı; PMID 34054628, DOI [10.3389/fpsyg.2021.565202](https://doi.org/10.3389/fpsyg.2021.565202)).
  Sabah çapası süreklilikle ilişkili bulundu ama randomize değildi (Stecher 2021, PMID 34941558, DOI
  [10.2196/32794](https://doi.org/10.2196/32794)). Meditasyon uygulamalarında kullanımın iki tepesi sabah ve gece
  (Baumel 2019, PMID 31573916, DOI [10.2196/14567](https://doi.org/10.2196/14567)). Güç: zayıf.
- **Zaman ve duruş:** sabah; baştan sona oturarak (sandalyede ya da yerde). Ayakta bölüm yok (breath.js:354; güvenlik
  §0-5, §11.C). Varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Neslihan.
- **Müzik:** 72 BPM (ailenin üst sınırı), Re majör; kalimba/tahta çalgı + akustik gitar + pad; hafif vuruş hissi
  hareket bölümünde tınıyla verilir, davul yok. Doğa varsayılan açık: uzak, seyrek kuş sesi (ani ötüş yok). Yay:
  **parlaklık** kapanışa doğru artar, ses yüksekliği düz kalır (Bernardi 2009: kreşendo KB'yi artırdı; PMID 19569263,
  DOI [10.1161/circulationaha.108.806174](https://doi.org/10.1161/circulationaha.108.806174)).
- **Güvenlik:** hareketler hafif, "ağrı ya da baş dönmesi olursa bırak"; ters duruş ve uzun öne eğilme yok (Cramer
  2013, PMID 24146758, DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515)); gözetimsiz
  pratik yan etki riskiyle ilişkili bulunduğu için görsel denetim isteyen hiçbir şey yok (Cramer 2019, PMID 31357980,
  DOI [10.1186/s12906-019-2612-7](https://doi.org/10.1186/s12906-019-2612-7)). Enerji veren hızlı nefes yok.
- **Gelişim:** `wellbeing` · "Enerjin şu an ne düzeyde?" 1–10 (Dalga · Motive ile aynı ölçü adı: dalga/manifest.js:22).

#### Ders 7 · Kendine Şefkat
- **Söz:** "Başkasına gösterdiğin yumuşaklığı kendine de gösterebilmek."
- **Teknik (metta, maitri):** dayanak + şefkatli beden taraması (dolaylı yol) → sevdiğin birine iyi dilek → (20+ dk)
  tarafsız biri → (30 dk) zorlandığın biri, isteğe bağlı → kendine dönüş (el kalpte, iyi dilek) → genişleyen çember.
  İyi dilekler dilek kipinde: "Huzurlu olmanı diliyorum." Olumlama cümlesi yok.
- **Kanıt:** 11,5 dk'lık iki öz-şefkat kaydında (sevilen birine şefkat → kendine; ve şefkatli beden taraması) düşük
  uyarılma ve KAD artışı örüntüsü yalnız öz-şefkat koşullarına özgüydü (Kirschner 2019, n=135, PMID 32655984, DOI
  [10.1177/2167702618812438](https://doi.org/10.1177/2167702618812438); tam metin: kayıtlar 610–630 kelime, KAD
  beden taramasında ~4. dakikada plato; deri iletkenliğindeki etki yalnız "kendine sevgi-şefkat" (LKM-S) koşulunda
  anlamlıydı, şefkatli beden taramasında anlamlı değildi; benlik C01). Öz-eleştiride g=0,51 azalma (Wakelin 2021, 19 RKÇ, PMID 33749936, DOI
  [10.1002/cpp.2586](https://doi.org/10.1002/cpp.2586)). Sevgi-şefkatte pasif kontrole göre öz-şefkat g=0,45; "başta
  zorlayıcı olabilir" uyarısı (Galante 2014, PMID 24979314, DOI [10.1037/a0037249](https://doi.org/10.1037/a0037249));
  sevgi odaklı müdahaleler şefkat odaklılardan büyük etki gösterdi, uzunluk etkiyi değiştirmedi (Zeng 2015, PMID
  26579061, DOI [10.3389/fpsyg.2015.01693](https://doi.org/10.3389/fpsyg.2015.01693)). Güç: orta.
- **Zaman ve duruş:** akşam ya da zor bir günün sonu; oturarak ya da yatarak. Varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Neslihan.
- **Müzik:** 54 BPM hissi, Fa majör; sıcak viyola + keçe piyano; doğa kapalı. Yay: "kendine dönüş" bloğunda en sıcak
  ve en yakın tını (daha kuru, daha az yankı), çemberde yankı açılır.
- **Güvenlik:** travma yaşamış kişilerde kendine şefkat yöneltmek tehdit tepkisi doğurabildi (Creaser 2022, PMID
  35391975, DOI [10.3389/fpsyg.2022.765602](https://doi.org/10.3389/fpsyg.2022.765602)); bu yüzden önce tarafsız
  dayanak, sonra "istersen", her zor bloktan önce "Bu an zor gelirse ayaklarına ya da nefesine dönebilirsin". "Zorlandığın
  biri" yalnız 30 dk'da ve atlanabilir (planlayıcı onu kapanıştan hemen önceye koymaz).
- **Gelişim:** `self` · "Şu an kendine ne kadar yumuşak davranıyorsun?" 1–10. Başlangıç sorusu "Kendine şefkat" ile
  aynı alan (dataHub.js:27).

#### Ders 8 · Sağlam Yer (özgüven)
- **Söz:** "İçindeki sağlam yeri bulmak ve kendine destek olan bir sesle konuşmak."
- **Teknik:** oturarak dağ duruşu (tadasana; sthira-sukha: sabit ve rahat), yalnız dikkat ve yerleşme ipucu olarak →
  dağ imgesi (hava değişir, dağ kalır) → değer hatırlama ve onu yaşadığın küçük an → bir zorlanmaya şefkatli bakış ve
  küçük bir sonraki adım → içinden kendi adınla ya da "sen" diye seslenen sakin iç ses → sessiz duruş.
- **Kanıt:** "Özgüven" sonucunu doğrudan ölçen meditasyon MA'sı bu taramalarda bulunamadı (benlik §4). Dolaylı ve daha
  sağlam dayanaklar: mesafeli iç konuşma (Kross 2014, yukarıda); öz-onaylamada öz-algı ES=0,32 (Zhang 2025, 129 test,
  PMID 41143765, DOI [10.1037/amp0001591](https://doi.org/10.1037/amp0001591)); öz-şefkat koşulunda başarısızlıktan
  sonra daha uzun çalışma ve değişme isteği (Breines & Chen 2012, PMID 22645164, DOI
  [10.1177/0146167212445599](https://doi.org/10.1177/0146167212445599)). Kaçınılan: tekrar edilen olumlu cümle (Wood
  2009) ve "güç duruşu" gerekçesi (Barel 2024 tekrarında güç hissi tekrarlanamadı; PMID 39633430, DOI
  [10.1186/s40359-024-02194-7](https://doi.org/10.1186/s40359-024-02194-7)). Güç: özgüven sonucu için zayıf/yok,
  bileşenler için orta.
- **Zaman ve duruş:** önemli bir işten önce ya da sabah; oturarak. Varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Hakan (tok, olgun ses isteği: pazar.md §6.2 Meditopia yorumları).
- **Müzik:** 60 BPM hissi, Re'de açık beşli bordun + alçak ahşap üflemeli. Ney benzeri üflemeli yalnız sessiz
  pencerelerde çalar (nefesli tınısı 1–4 kHz'de konuşmayla çakışır). Doğa varsayılan kapalı; seçilirse dağ rüzgârı.
  Yay: dağ imgesinde en geniş doku, iç ses bölümünde en yakın ve en sade.
- **Güvenlik:** ad "özgüvenini artır" vaadi taşımaz; alt başlık "Özgüven için: kendine destek olmak". Değer "üstün
  olmak" değil "önemsediğin şey" diye çerçevelenir.
- **Gelişim:** `self` · "Şu an kendini ne kadar sağlam hissediyorsun?" 1–10. Madde geçerlenmedi (benlik §16).

#### Ders 9 · Kendini Tanımak
- **Söz:** "Bedenine, nefesine ve duygularına bakarak kendini tanımak."
- **Teknik (svadhyaya):** beden taraması, 30–60 sn arayla yumuşak geri çağırma ("Dikkatin şimdi nerede?") → nefesin
  kendiliğinden akışını izlemek → "Şu an ne hissediyorum?": duyguyu bedende bulmak → (30 dk) tanıklık (sakshi) →
  "Bugün neyi önemsiyorum?" ile değerlere bakış. Soyut "kim olduğunu düşün" görevi yok.
- **Kanıt:** 3 ay günlük beden taraması ve nefes meditasyonunda 8 MAIA ölçeğinin 5'inde iyileşme; pratiği sevmek ve
  günlük hayata katmak ölçeklerin çoğunda değişimi yordadı, pratik süresi zayıf yordadı (Bornemann 2015, n=148, PMID
  25610410, DOI [10.3389/fpsyg.2014.01504](https://doi.org/10.3389/fpsyg.2014.01504)). 8 hafta boyunca günde 20 dk beden
  taramasında kalp atışı algı doğruluğu arttı (Fischer 2017, PMID 28955213, DOI
  [10.3389/fnhum.2017.00452](https://doi.org/10.3389/fnhum.2017.00452)). Kaygı için yardım arayanlarda "beden ve
  duygularından habersiz" kümedekiler kontrole göre yanıt vermedi (Taylor 2023, PMID 36810609, DOI
  [10.1038/s41598-023-28660-7](https://doi.org/10.1038/s41598-023-28660-7)): bu yüzden dış tutunma noktaları (sesler,
  temas) da sunulur. Güç: orta–zayıf.
- **Zaman ve duruş:** akşam; oturarak (yatarak da olur). Varsayılan 15 dk.
- **Ses:** ikisi de. Önerilen: Neslihan ("psychology, mind" etiketi).
- **Müzik:** 52 BPM hissi, Mi majör/Lidya; camsı pad + seyrek arp. Doğa varsayılan açık: uzak okyanus dalgası (4 varyant).
  Dalga aralığı istemde ~10 sn istenir ve ölçülür; SFX modelinde periyot ayarlanamadığı için nefesle eşleştiği
  iddia edilmez.
- **Güvenlik:** hassas bölgelerde (göğüs, karın, kalça) uzun durulmaz; atlama izni (güvenlik §11.B-9).
- **Gelişim:** `awareness` · "Bedenini şu an ne kadar hissedebiliyorsun?" 1–10.

#### Ders 10 · Gelecekteki Sen (gelişim)
- **Söz:** "Olmak istediğin kişinin bir gününü canlı biçimde görmek ve bugün atacağın küçük adımı seçmek."
- **Teknik:** yerleşme nefesi → en iyi olası gün, kişisel alan (5 dk'da yalnız bu) → ilişkiler → iş ya da uğraş →
  (30 dk) gelecekteki senden bugüne bir cümle ve sessizlik → **kapanıştan önce gerçeğe dönüş:** engel + eğer-ise planı.
  Sankalpa (niyet) bu dersin son cümlesi olur.
- **Kanıt:** En iyi olası benlik MA'sında olumlu duyguda d=0,511, iyimserlikte 0,334; daha kısa toplam pratikte
  eğilim daha iyi (Carrillo 2019, 29 çalışma, N=2909, PMID 31545815, DOI
  [10.1371/journal.pone.0222386](https://doi.org/10.1371/journal.pone.0222386)). Yalnız imgeleme, yazma+imgeleme kadar
  etki gösterdi (Boselie 2023, PMID 36724699, DOI [10.1016/j.jbtep.2023.101837](https://doi.org/10.1016/j.jbtep.2023.101837)).
  Günde 5 dk imgelemede iyimserlik ilk oturumdan itibaren arttı (Meevissen 2011, PMID 21450262, DOI
  [10.1016/j.jbtep.2011.02.012](https://doi.org/10.1016/j.jbtep.2011.02.012)). Eğer-ise planı: Wang ve ark. 2021, eğer-ise MA'sı (Ders 6'da).
  Güç: anlık orta.
- **Zaman ve duruş:** sabah ya da hafta başı; oturarak. Varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Hakan.
- **Müzik:** 66 BPM, La majör; piyano + yaylılar; doğa kapalı. Yay: imgelem doruğunda tını hafifçe açılır, eğer-ise
  bölümünde sadeleşir. Kreşendo yok.
- **Güvenlik:** "ya başaramazsan" gibi olumsuz gelecek imgesi yok (benlik §6). Engel bölümü korkutmaz, somut ve küçük
  tutulur.
- **Gelişim:** `wellbeing` · "Geleceğe şu an ne kadar umutla bakıyorsun?" 1–10.

### A.2.1 Benzersizlik: açılış, anahtar cümle, imge yayı, görsel, ses imzası

Benzersiz açılış cümlesi, ortak güvenlik cümlesinden hemen sonra gelir. Anahtar cümle çekirdekte üç kez söylenir; her
seferinde biraz daha kısa ve yumuşaktır (5 dk sürümde en az bir kez; C.4, VARSAYIM). Her derste imge seçimlidir; su,
kapalı alan ya da karanlık herkese iyi gelmeyebilir (güvenlik §11.B-10). Bu tablodaki cümleler son metin değil, yön
belirler; Türkçe editör incelemesinden geçmeden seslendirilmez (§C).

| Ders | Benzersiz açılış cümlesi | Anahtar cümle (1. → 2. → 3. söyleyiş) | İmge yayı (seçenekli) | Görsel biçim | Müzik ve doğa imzası |
|---|---|---|---|---|---|
| 1 Nefesin Ritmi | "Bütün gün seninle olan nefesini şimdi yalnızca dinleyebilirsin." | "Alış kendiliğinden gelir; verişi sen uzatırsın." → "Alış gelir, veriş uzar." → "Veriş uzar…" | İşitsel yay: kendi nefesinin sesi → vızıltının göğüste ve yüzde titreşimi → sesin ardından kalan sessizlik (görsel imge yok, seçim gerekmez) | genişleyen halka | tanpura benzeri bordun (uygulama hattı); doğa kapalı |
| 2 Derin Dinlenme | "Hoş geldin; bu dakikalar senin." ardından "Yapman gereken hiçbir şey yok; yalnızca dinlenmek var." (iki dönüşümlü seçenekle; pilot 2. tur) | "Bedenin dinlenebilir; sen uyanık kalıyorsun." → "Beden dinleniyor; sen uyanıksın." (7 dk ve üstünde) → "Dinleniyorsun; uyanıksın." (üç nokta yok) | Bir kıyı ya da bir orman (görüntü gelmese de, gözler açık kalsa da olur): patikanın başında kendini bulmak → kendi hızında yürüyüş (iniş yok) → uzaktan gelip giden ses, koku, güneş, esinti → dinlenme yeri: ılık taş, ışık, gökyüzü → sessiz pencere → aynı patikadan dönüş → görüntü silinir, seni taşıyan zemin | ince, yatay ufuk çizgisi | Mi♭ majör pad + alçak yaylılar; uzak rüzgâr ve yaprak (su yok; su katmanı isteğe bağlı) |
| 3 Uykuya Geçiş | "Günün sesleri geride kalıyor; şimdi yatağına yerleşebilirsin." | "Bugün bitti; şimdi dinlenebilirsin." → "Bugün bitti." → "Dinlenme zamanı…" | Yağmurlu bir akşam, sıcak bir oda ya da üstü örtülü bir veranda: yağmuru dinlemek → örtünün ağırlığı ve sıcaklığı → lambanın ışığı yavaşça kısılır | sönen kor | La♭ majör sıcak pad + keçe piyano; çatıda yağmur |
| 4 Zor Anlar İçin | "Zor bir andaysan buraya gelmiş olman yeterli; acele etmene gerek yok." | "Bu duygu burada, sen de buradasın; ikisine de yer var." → "Duygu burada, sen de buradasın." → "İkisine de yer var…" | Bir derenin kenarı ya da gökte geçen bulutlar: kenarda oturmak → her düşünceyi bir yaprağa ya da buluta bırakmak → akış sürer, sen yerinde kalırsın | akan tek çizgi | viyolonsel benzeri bordun + gitar armonikleri; doğa kapalı |
| 5 Tek Nokta | "Dikkatin bir el feneri gibi; şimdi ışığını tek bir noktaya toplayabilirsin." | "Fark ettiğin an, zaten geri döndün." → "Fark ettin; döndün." → "Döndün…" | El fenerinin ışığı: geniş ve dağınık → tek noktada toplanmış ve parlak → yeniden genişleyip bütün odayı aydınlatan ışık (açık izleme) | tek ışık noktası | sinüs benzeri sürekli ton + çan (ses çapası); doğa kapalı |
| 6 Sabah Niyeti | "Gün henüz başlıyor; bedeninle ve nefesinle birlikte uyanabilirsin." | "Bugün için tek bir kelime yeter." → "Tek bir kelime yeter." → "Kelimen seninle…" | Şafak: karanlık oda → pencereye vuran ilk ışık → güne açılan kapı | yükselen yarım güneş diski | Re majör kalimba + akustik gitar; tek tek, uzak kuş çağrıları |
| 7 Kendine Şefkat | "Bugün kendine, sevdiğin birine davrandığın gibi davranmayı deneyebilirsin." | İçinden: "Kendime de huzur diliyorum." → "Kendime huzur diliyorum." → "Huzur…" | Ellerin sıcaklığı: göğüsteki elin sıcaklığı → bu sıcaklığın sevdiğin birine uzanması → sana geri dönmesi → çemberin genişlemesi | göğüs hizasında sıcak ışık | Fa majör viyola + keçe piyano; doğa kapalı |
| 8 Sağlam Yer | "Ayaklarının bastığı yer seni taşıyor; oradan başlayabilirsin." | "Hava değişir, dağ yerinde kalır." → "Dağ yerinde kalır." → "Dağ…" | Bir dağ ya da yaşlı, büyük bir ağaç: toprağa oturan taban → mevsimler, bulut, yağmur ve güneş gelip geçer → dağ ya da ağaç yerinde kalır | yere yakın, genişleyen taban çizgisi | Re'de açık beşli bordun + alçak ahşap üflemeli; seçilirse dağ rüzgârı |
| 9 Kendini Tanımak | "Şimdi kendine, merakla bakan bir dost gibi bakabilirsin." | "Değiştirmeden, yalnızca bakabilirsin." → "Yalnızca bakabilirsin." → "Yalnızca bakmak…" | Sisli bir sabah vadisi ya da buğulu bir cam: sis çekilir ya da buğu silinir → yollar, ağaçlar ya da camın ardındaki oda görünür → açık bakış | yavaşça dağılan sis | Mi Lidya camsı pad + seyrek arp; uzak okyanus dalgası |
| 10 Gelecekteki Sen | "Bir süreliğine, olmak istediğin kişinin gününe bakabilirsin." | "Bugün atabileceğin küçük adım hangisi?" → "Küçük adım hangisi?" → "Küçük adım…" | Yol: bugünkü kapıdan çıkış → o günün sabahı, öğlesi, akşamı → akşam dönüp yola bakmak → bugüne küçük bir adım | uzakta bir ışığa uzanan yol çizgisi | La majör piyano + yaylılar; doğa kapalı |

Benzersizlik denetimi (E.6 #17): bu 10 satırda aynı açılış cümlesi, anahtar cümle, imge, görsel biçim ya da müzik ve
doğa imzası iki kez geçmiyor. "Fark ettiğin an, zaten geri döndün." yalnız Ders 5'e aittir (C.1'deki genel örnekten
çıkarıldı).

**Ders 2, 5 ve 9 sınırı (pilot 2. tur, S5-hoca, B1):** Ders 2'nin tanıklığı bedene, zemine ve dinlenmeye bağlıdır ("Uzanırken kendini baştan ayağa tek bir bütün olarak fark edebilirsin.", "Ağırlığın ve zeminin desteği: İkisi de burada."); sesleri ve düşünceleri açık izleme Ders 5'in (21:30, 24:30), izleyen farkındalık Ders 9'un içeriğidir. Ders 2'de düşünceler yalnız bir kez ve imgedeki "gelip giden bir ses"e geri çağrı olarak geçer. "Fark ettiğin an, zaten geri döndün." Ders 2 pilotundan çıkarıldı. Ders 2'nin dayanak dili ("seni taşıyan zemin") Ders 8'in açılış cümlesiyle ("Ayaklarının bastığı yer seni taşıyor") aynı imgeye yakındır; Ders 8 yazılırken açılış cümlesi bu yakınlık gözetilerek yeniden sınanmalıdır.

### A.2.2 30 dakikalık dikkat eğrisi

Kural (VARSAYIM): 30 dk sürümde her 3–5 dk'da doku, teknik ya da sessizlik değişir. 5 dk'dan uzun her blok en az bir
iç değişim noktası (`segment`, §B.2) taşır ve planlayıcı testi bunu denetler (§B.3 test k). Aşağıdaki anlar B.4'teki
30 dk çapa planından hesaplandı (dk:sn); ara sürelerde aynı sıra, planlayıcının kurduğu sürelerle çalar.

| Ders | Değişim anları (30 dk sürüm) | En uzun değişimsiz aralık |
|---|---|---|
| 1 | 0:00 varış · 1:30 doğal nefes · 4:00 uzun verişe geçiş (sayılı) · 7:30 iç çekiş · 11:00 nadi shodhana, sesli sayım · 14:00 nadi shodhana, sessiz turlar · 17:00 bhramari · 19:45 bhramari turlarının arasına sessiz nefesler · 22:30 tanıklık, ilk pencere · 25:00 ikinci pencere, pad çekilir · 27:30 kapanış | 3:30 |
| 2 | 0:00 varış · 1:30 niyet · 2:15 beden dolaşımı: sağ yan, sol yan · 5:15 arka, ön, bütün beden · 8:15 nefes farkındalığı ve geri sayma · 11:45 zıtlık: ağırlık ve hafiflik · 14:00 zıtlık: sıcaklık ve serinlik · 16:15 imge: yola çıkış · 19:30 imgede dinlenme ve ilk sessiz pencere · 23:00 tanıklık · 26:30 niyet · 27:30 kapanış | 3:30 |
| 3 | 0:00 varış · 1:30 yavaş veriş · 4:00 beden ağırlaşır: ayaklardan bele · 7:00 belden başa, ağırlıktan sıcaklığa · 10:00 nefesle geri sayma · 14:30 sahne: yağmur ve oda · 17:30 ayrıntılar: dokunma, koku, ses · 20:30 cümleler seyrekleşir · 23:30 imgede sessiz yürüyüş · 28:30 uyku izni | 4:30 |
| 4 | 0:00 varış · 1:30 dayanak: ayaklar, eller · 3:15 odadaki sesler ve uzun veriş · 5:00 duyguyu bedende bulmak, adlandırmak · 7:15 kendine "sen" diye seslenmek · 9:30 duyguya nefesle yer açmak · 14:00 dere ya da bulutlar · 17:15 yapraklar ya da bulutlar seyrekleşir, sessiz izleme · 20:30 şefkatli el · 22:30 dayanağa dönüş · 24:30 sessiz dayanak (pencereler ≤ 45 sn) · 27:30 kapanış | 4:30 |
| 5 | 0:00 varış · 1:30 nefes çapası · 4:00 dağılıp geri dönme · 6:00 1'den 10'a sayma · 8:30 yalnız verişte sayma · 11:00 ses çapası (çan) · 13:00 yumuşak bakış, gözler yarı açık · 15:00 sessiz odak aralıkları 15 → 30 sn · 18:30 45 → 60 sn · 21:30 açık izleme: sesler · 24:30 düşünceler gelip gider · 27:30 kapanış ve isteğe bağlı avuçlama | 3:30 |
| 6 | 0:00 varış · 1:30 uyanış: doğal nefes, omurga hareketi · 4:30 akış: boyun, omuz · 7:30 akış: yan esneme, kollar nefesle · 10:30 ikinci akış · 13:30 oturarak dağ duruşunda durgunluk · 17:00 şükran üçlüsü · 21:00 niyet: tek kelime · 23:00 günün provası ve eğer-ise planı · 27:30 kapanış | 4:30 |
| 7 | 0:00 varış · 1:30 dayanak · 3:30 şefkatli beden taraması · 6:00 sevdiğin biri · 9:30 tarafsız biri · 13:00 zorlandığın biri (isteğe bağlı) · 16:00 çıkış kapısı, dayanağa dönüş, sessiz nefesler · 19:00 kendine dönüş: el kalpte · 22:00 kendine iyi dilekler, sessiz · 24:00 genişleyen çember · 27:30 kapanış | 3:30 |
| 8 | 0:00 varış · 1:30 yere basmak, oturarak dağ duruşu · 5:00 dağ imgesi: taban · 8:00 mevsimler gelip geçer · 11:00 değer hatırlama · 13:30 o değeri yaşadığın küçük an · 15:30 zorlanmaya şefkatli bakış · 18:00 küçük sonraki adım · 20:00 iç ses · 23:30 sessiz duruş · 25:30 tek cümlelik niyet · 27:30 kapanış | 3:30 |
| 9 | 0:00 varış · 1:30 beden taraması: ayaklar, bacaklar · 4:45 gövde, kollar, baş · 8:00 nefesin kendiliğinden akışı · 10:30 nefesin bedende değdiği yerler · 12:30 "Şu an ne hissediyorum?" · 15:00 duyguyu bedende bulmak · 17:00 tanıklık: sesler · 20:00 izleyen farkındalık · 23:00 "Bugün neyi önemsiyorum?" · 27:30 kapanış | 4:30 |
| 10 | 0:00 varış · 1:30 yerleşme nefesi · 3:30 en iyi olası gün: sabah · 6:15 öğle ve akşam · 9:00 ilişkiler · 13:30 iş ya da uğraş · 18:00 gelecekteki senden bir cümle · 20:00 sessiz pencereler · 23:00 engel · 25:00 eğer-ise planı ve niyet · 27:30 kapanış | 4:30 |

### A.3 Kütüphane sırası

Önerilen sıra ekranda numarasız bir "başlangıç yolu" olarak gösterilir, dersler serbesttir: 1 Nefesin Ritmi (ilk ders
en yumuşak ve kısa olmalı: güvenlik §5, tasarım çıkarımı) → 2 Derin Dinlenme →
5 Tek Nokta → 7 Kendine Şefkat → 4 Zor Anlar İçin → 6 Sabah Niyeti → 8 Sağlam Yer → 9 Kendini Tanımak → 10 Gelecekteki
Sen; 3 Uykuya Geçiş gece saatlerinde en üste çıkar.

---

## B. Değişken süre: 30 dakikanın 5'i de bütün bir ders

### B.1 İlke

- Kısa sürüm yan ürün değil. 11 dk YN'de bekleme listesine göre küçük iyileşmeler görüldü (d=0,08–0,16; Moszeik 2025,
  tam metin sakin §1.2). Gerçek kullanımda meditasyona özgü ortalama günde 3,36 dk idi ve kullanıcıların %69,7'si
  günde 5 dk'nın altında kaldı (Radin 2025, n=1458, tam metin; PMID 39808431, DOI
  [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435)). Günde bir kez 20 dk ile
  iki kez 10 dk arasında fark bulunmadı (Riordan 2024, PMID 38376930, DOI
  [10.1037/cou0000725](https://doi.org/10.1037/cou0000725)). Bu yüzden **5 dakikalık sürüm, en çok dinlenecek sürüm gibi
  tasarlanır.**
- Yapı: **Varış (sabit) → öncelik sırasıyla çekirdek bloklar → Kapanış (sabit, her zaman çalar)**. Sabit kapaklar,
  travma-duyarlı YN'nin "uygun uzunluk ve hazırlık" ile "yeterli yerleşme ve dışa dönüş / uyku izni" bileşenleridir
  (Luu 2024). Gündüz kapanışı en az 45 sn sürer (teslim Y3). Hipnozda uyandırma başarısızlığı, istenmeyen etkilerde
  önemli bir etken sayılıyor (Howard 2017, PMID 28300508, DOI
  [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)).
- **Alt küme ilkesi:** kısa sürümün cümleleri, uzun sürümün cümlelerinin alt kümesidir. Yalnız Varış ve Kapanış'ın kısa
  ve uzun metinleri ile birkaç "köprü" cümlesi ayrıca yazılır. **Genişletme klipleri** (§B.2) de bu kümenin içindedir:
  yalnız 30:00'a sessizlik sınırlarını aşmadan ulaşmak için çalarlar ve en çok hızlı okuyan seste gerekirler.
- Kısaltma sırası: önce **sessizlikler**, sonra **tekrar sayıları** (ör. beden dolaşımındaki nokta sayısı, sayma turu),
  en son **bloklar** (öncelik sırasının tersinden). Aşamaların ayrı katkısı test edilmediği için (sakin §10 madde 11)
  bu sıra bir tasarım kararıdır. Uzatma sırası bunun tersidir (§B.3). **Sessizlik hiçbir zaman sınıfının üst sınırını
  aşacak kadar esnetilmez.**
- Dersin yavaşlığı nereden gelir: klip içindeki hız sesin ve üretim yolunun doğal hızıdır (ölçülen 5,6–6,6 hece/sn;
  §C.2, §D.1.1). Yavaşlık, planlayıcının klipler arasına koyduğu sessizlikten gelir; sözcükler uzatılmaz, ses
  yavaşlatılmaz.

### B.2 Blok sözleşmesi (veri)

Her ders bir JSON'dur (`public/yoga/<ders>/lesson.json`):

```
lesson: { id, contentHash, planVersion, bedPhases, nature, drone?, blocks: [...] }
block:  { id, priority: 1..5, playOrder, kind: 'arrival'|'core'|'closing'|'sleepPermission',
          phase: 'varis'|'derinlesme'|'derin'|'kapanis', gapClass: 'guided'|'deep'|'deep45', hard: bool,
          segments: [clipId, …],                         // iç değişim noktaları (A.2.2)
          clips: [ { id, text, syllables,
                     voice: { female: {file, sec, level}, male: {file, sec, level} },   // level: LUFS ya da <1 sn'de RMS
                     role: 'required'|'optional'|'extension',
                     gapAfter: {min, pref, max},        // sınıf sınırları içinde (aşağıda)
                     carrier?: { before, after },       // mikro-klip: taşıyıcı cümlede üretildi, kesildi
                     cue: { breath?: {in, out, hold?, count}, visual?: 'phase:deep', music?: 'window'|'phase:B' } } ],
          silenceWindows: [ { afterClip, min: 20, max: 90 /* Ders 4: 45 */, announce: clipId, returnClip } ],
          minSec, prefSec: {5,10,15,20,30}, maxSec }
```

- **Ders düzeyi ek alanlar (pilot 2. tur; S11, E10, P-S13, P-N5, P-S6, P-S10, S18, P-B3):** `openingNotice` (araç ya da
  makine uyarısı) ve `openingScreen` (üç satır: ortak çıkış cümlesi, araç uyarısı, "önce yana dön, otur, sonra kalk")
  uygulamanın derse başlamadan önce gösterdiği metindir; sesli metne bırakılmaz, denetimi veriden yapılır. Uzanarak
  yapılan derslerde `preparationCard` (örtü, yastık, yüzey) aynı ekranda görünür. Klipte `alternates` dönüşümlü
  seçeneklerdir (seçenek = oturum sayısı mod (1 + seçenek sayısı); kaldığın yer kaydına `variantIndex` yazılır),
  `pairWith` / `pairGap` bağlı çifttir, `returnTone` pencere dönüşünden 2 sn önceki tınıdır. `visual.pulse.respectFlashSafe`,
  `visual.dawn` (en az 60 sn rampa, parlaklık tavanı), `music.duckedBedLufs` (evre başına) ve `qa` (konuşma − yatak
  >= 15 dB, taşıyıcı eklem F0) pilot `ders2.lesson.json`'daki biçimiyle bu sözleşmeye eklenir (değerler VARSAYIM).
- **Klip:** 1–3 tam cümle; **yavaş okuyan seste en çok ~15 sn**. Neden: duraklatınca klibin başına dönülür, "Kapanışa
  geç" en çok bir klibin bitmesini bekler.
- **Klip rolleri:** `required` kısa sürümde de çalar; `optional` süre arttıkça eklenir; `extension` yalnız hedefe
  sessizlik sınırlarını aşmadan ulaşılamadığında eklenir (ek nefes turu, ek beden noktası, ek imge ayrıntısı).
  Genişletme klibi bir blokta tek başına anlamlı olmalı ve atlandığında akış bozulmamalı (Türkçe editör ve usta hoca
  denetimi).
- **Boşluk sınıfları (VARSAYIM):**

| Sınıf | Nerede | Süre | Duyuru | Yatak |
|---|---|---|---|---|
| Eylem payı | her yönergeden sonra | istenen eylemin süresi + ≥ 2 sn; en çok 12 sn | gerekmez | kısık (≈ −33 LUFS) |
| Nefes payı | rehberli bloklarda | 12–20 sn | ayrı duyuru gerekmez; önceki cümle ne yapılacağını söyler ("birkaç nefes boyunca yalnızca izleyebilirsin") | kısık |
| Sessiz pencere | derin bloklar, imge sonları | 20–90 sn (Ders 4: 20–45 sn) | zorunlu: önce duyuru ("Birkaç nefes sessizlik… sonra sesim geri gelecek."), sonra dönüş cümlesi | +6 dB (≈ −27 LUFS), ≥ 2 sn rampa |

  20 sn eşiği güvenlik §11.B-16'daki "sessizlikler rehberlidir" kuralını uygulanabilir kılar: 20 sn'yi aşan her boşluk
  duyurulur ve müziğin kalktığı tek yer burasıdır (§D.4).
- **Mikro-klipler:** "al", "ver" ve sayılar tek başına üretilmez, çünkü tek sözcükte prozodi bozuk çıkar. Bir taşıyıcı
  cümlenin içinde üretilip kesilir (yol A: `previous_text` / `next_text`; yol B: bütün cümle üretilir ve sözcük,
  çevresindeki sessizlikten kesilir; §D.1). 1 sn'den kısa kliplerde LUFS ölçülemez (400 ms kapılama). Bu yüzden
  bunlar evre referansına göre RMS ile eşitlenir (§D.2). Başlangıç anları bilindiği için görsel bunlara saniyesi
  saniyesine kilitlenir; sözcük düzeyinde zaman damgası gerekmez.

### B.3 Planlayıcı (`lib/yoga.js`, saf, belirlenimci, testli)

`planLesson(ders, hedefSn, ses, { firstEver, seed }) → { events: [{t, type:'clip'|'silence'|'window'|'breath'|'phase'|'duck'|'swell', …}], chapters, total, planVersion }`

1. Sabit kapakları koy: Varış (hedef ≤ 12 dk ise kısa metin, değilse uzun), Kapanış (aynı eşik). `firstEver` ise ilk
   ders cümlesi Varış'a eklenir (§A.1).
2. Bloklar öncelik sırasıyla (P1 → P5) eklenir. Bir blok ancak **en kısa hali** (`minSec` = zorunlu kliplerin toplamı +
   en kısa boşluklar) kalan bütçeye sığıyorsa girer. Zor bloklar (`hard`, ör. Ders 7 C6) sığmıyorsa tümüyle düşer,
   yarım girmez; kapanıştan hemen önceye de konmaz (güvenlik §11.D-2).
3. **Artan süre şu sırayla dağıtılır:** (a) seçilen blokların `optional` klipleri, öncelik sırasıyla; (b) boşluklar
   `pref` değerine kadar; (c) bir sonraki bloğun en kısa hali sığıyorsa o blok (adım 2'ye dönülür); (d) `extension`
   klipleri, öncelik sırasıyla; (e) boşluklar `max` değerine doğru, sınıf içinde orantılı.
4. **Hâlâ artan varsa bu bir içerik hatasıdır.** Planlayıcı sessizliği sınırın üstüne esneterek kapatmaz. Derleme
   testi (aşağıda g) kırmızı olur ve eksik genişletme klibi yazılır. Her ders × her dakika × iki ses derlemede test
   edildiği için bu durum çalışma anında oluşamaz. Olursa plan hedeften kısa kurulur, ekrandaki süre gerçek toplamı
   gösterir ve yine hiçbir sınır aşılmaz.
5. **Süre fazlaysa** (yavaş okuyan ses) ters sırayla çıkarılır: `extension` → `optional` → boşluklar `min`'e → bloklar
   (öncelik sırasının tersinden).
6. Toplam **hedefe eşittir** (±1 sn). Konuşma kliplerinin süresi hiç değişmez; ses asla hızlandırılmaz, yavaşlatılmaz ya
   da kırpılmaz.
7. **Belirlenimci:** aynı girdi her zaman aynı planı verir. Müzik varyantlarının sırası ve kuş çağrılarının anları da
   `seed`'den türetilir. `seed` "Kaldığın yerden" kaydında saklanır (§E.1).
8. Aşağıdaki tablolar 5/10/15/20/30 dk için planlayıcının hedeflediği **çapa planlardır**. Toplamlar ve kurallar bir
   betikle doğrulandı (`_plan/tables_v2.py`, "B.4 TABLOLARI TAMAM"): her blok süre arttıkça kısalmaz; çekirdek blok
   hiçbir sürümde 0:55'ten kısa değildir; niyet ve yerleşme blokları 0:20'den kısa değildir (VARSAYIM). Ara dakikalar
   (7, 12, 23 …) aynı kurallarla kurulur.
9. **Birim testleri** (Nefes'teki `makePlan` testleri gibi), her ders × her dakika 5–30 × iki ses için:
   - (a) toplam = hedef ±1 sn;
   - (b) Varış ve Kapanış var ve eksiksiz;
   - (c) klipler üst üste binmiyor;
   - (d) hiçbir boşluk sınıfının sınırını aşmıyor; her pencere duyurulu ve ≤ 90 sn (Ders 4'te ≤ 45 sn);
   - (e) son 60 sn'de nefes tutma, yeni imge ya da zor blok yok (güvenlik §11.D-3);
   - (f) 5 dk = Varış + en az bir P1 blok + Kapanış;
   - (g) **30:00'a ve her ara dakikaya sınır aşılmadan ulaşılıyor**; ulaşılamıyorsa test kırmızı olur (içerik hatası);
   - (h) ses dosyaları gelmeden önce aynı testler hece sayısından tahmin edilen klip süreleriyle üç hız senaryosunda
     koşar: artikülasyon 5,2 / 5,6 / 6,6 hece/sn × klip içi duraklama çarpanı 0,07–0,46 (§B.4.1);
   - (i) aynı girdi aynı planı verir;
   - (j) "Kaldığın yerden" kaydı aynı planı yeniden kurar; `contentHash` değişmişse ders baştan başlar;
   - (k) 30 dk sürümde değişimsiz aralık 5 dk'yı aşmıyor (A.2.2);
   - (l) ilk ders cümlesi yalnız `firstEver` ile ve açılış cümlesinden hemen sonra çalıyor.

### B.4 Ders başına blok planı (çapa süreler)

Süre sütunları blok başına konuşma + içindeki sessizlik toplamıdır (dk:sn). Gündüz dersleri: Varış 0:45 / 1:00 / 1:15 /
1:30 / 1:30, Kapanış 1:15 / 1:30 / 1:45 / 2:00 / 2:30. Gece dersi (Ders 3): Kapanış yerine uyku izni 0:40–1:30; müzik
kuyruğu bu sürenin **dışındadır**. Bütün değerler **VARSAYIM**; pilotta metin seslendirilince gerçek klip süreleriyle
yeniden hesaplanır. Sürüm 1'e göre değişenler: Ders 2 5 dk (C1 1:25, C2 0:55), Ders 7 5 dk (C1 1:00, C2 0:55,
C3 1:05), Ders 10 5 dk (C1 0:20, C2 1:25, C5 1:15). Böylece 5 dk sürümde de "zaman verir" kuralına (E.6 #1) yetecek
süre kalır. Ders 6'daki akış ve dağ duruşu baştan sona oturarak yapılır.

**Ders 1 Nefesin Ritmi** (çalma sırası: A → C1 → C2 → C4 → C3 → C5 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Doğal nefes → uzun veriş (≈6/dk, 4 al / 6 ver, tutma yok) | P1 | 3:00 | 4:30 | 4:30 | 5:00 | 6:00 |
| C2 İç çekiş: iki kısa alış + uzun veriş | P2 | — | 3:00 | 3:00 | 3:00 | 3:30 |
| C3 Bhramari: ağız kapalı vızıltılı veriş, döngü 12–14 sn (parmaklar yüze değmez) | P3 | — | — | 4:30 | 4:30 | 5:30 |
| C4 Nadi shodhana, tutmasız | P4 | — | — | — | 4:00 | 6:00 |
| C5 Sessiz nefes tanıklığı (pencere ≤ 90 sn) | P5 | — | — | — | — | 5:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 2 Derin Dinlenme** (çalma sırası: A → N1 → C1 → C2 → C3 → C4 → C5 → N2 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| N1 Niyet (sankalpa), başta | P1 | 0:20 | 0:30 | 0:30 | 0:40 | 0:45 |
| C1 Beden dolaşımı (sağ → sol → arka → ön → bütün) | P1 | 1:25 | 3:00 | 4:00 | 4:30 | 6:00 |
| C2 Nefes farkındalığı + geri sayma | P1 | 0:55 | 1:30 | 2:00 | 2:30 | 3:30 |
| C3 Zıtlık çiftleri (ağır/hafif, sıcak/serin) | P3 | — | — | 2:00 | 3:00 | 4:30 |
| C4 İmgeleme (seçimli: kıyı ya da orman) + sessiz pencere | P2 | — | 2:00 | 3:00 | 5:00 | 6:45 |
| C5 Tanıklık: sessiz farkındalık | P5 | — | — | — | — | 3:30 |
| N2 Niyet, sonda | P1 | 0:20 | 0:30 | 0:30 | 0:50 | 1:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 3 Uykuya Geçiş** (çalma sırası: A → C1 → C2 → C4 → C3 → C5 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Yavaş, uzun veriş (tutma yok) | P1 | 1:00 | 1:30 | 1:45 | 2:00 | 2:30 |
| C2 Bedenin ağırlaşması (yavaş beden dolaşımı) | P1 | 1:10 | 2:30 | 3:30 | 4:30 | 6:00 |
| C3 Tek sahneli, ayrıntılı imgeleme | P1 | 1:25 | 3:15 | 5:00 | 6:45 | 9:00 |
| C4 Nefesle geri sayma | P2 | — | 1:00 | 2:30 | 4:00 | 4:30 |
| C5 İmgede sessiz yürüyüş (seyrek ses) | P5 | — | — | — | — | 5:00 |
| K Uyku izni (dönüş yok) → müzik kuyruğu ayrı | sabit | 0:40 | 0:45 | 1:00 | 1:15 | 1:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 4 Zor Anlar İçin** (çalma sırası: A → C1 → C2 → C4 → C3 → C5 → S → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Dayanak (ayaklar, eller, sesler) + uzun veriş | P1 | 1:30 | 2:00 | 2:30 | 2:30 | 3:30 |
| C2 Bedende bulmak, adlandırmak, kendine "sen" diye seslenmek | P1 | 1:30 | 2:30 | 3:00 | 3:30 | 4:30 |
| C3 Derede yapraklar ya da geçen bulutlar (düşünceden ayrışma) | P2 | — | 3:00 | 4:00 | 4:30 | 6:30 |
| C4 Duyguya nefesle yer açmak | P3 | — | — | 2:30 | 3:00 | 4:30 |
| C5 Şefkatli el + dayanağa dönüş | P4 | — | — | — | 3:00 | 4:00 |
| S Sessiz dayanak (pencere ≤ 45 sn) | P5 | — | — | — | — | 3:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 5 Tek Nokta** (çalma sırası: A → C1 → C2 → C4 → C3 → C5 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Nefes çapası: dağıl, fark et, dön | P1 | 3:00 | 3:30 | 4:00 | 4:00 | 4:30 |
| C2 Nefes sayma 1–10 | P2 | — | 4:00 | 4:00 | 4:30 | 5:00 |
| C3 Uzayan sessiz odak aralıkları (15→30→45→60 sn) | P3 | — | — | 4:00 | 5:00 | 6:30 |
| C4 Ses çapası ya da yumuşak bakış (drishti, kırpmak serbest) | P4 | — | — | — | 3:00 | 4:00 |
| C5 Açık izleme (sesler, düşünceler gelip gider) | P5 | — | — | — | — | 6:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 6 Sabah Niyeti** (çalma sırası: A → C1 → C3 → C6 → C4 → C2 → C5 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Uyanış: doğal nefes + oturarak omurga hareketi | P1 | 1:30 | 2:00 | 2:00 | 2:30 | 3:00 |
| C2 Niyet (sankalpa): bugün için tek kelime | P1 | 1:30 | 1:30 | 1:30 | 1:30 | 2:00 |
| C3 Hafif akış, oturarak: boyun, omuz, yan esneme, kollar nefesle | P2 | — | 4:00 | 5:00 | 5:00 | 6:00 |
| C4 Şükran üçlüsü (kişi, an, beden duyusu) | P3 | — | — | 3:30 | 3:30 | 4:00 |
| C5 Günün provası + eğer-ise planı | P4 | — | — | — | 4:00 | 4:30 |
| C6 İkinci akış, oturarak + oturarak dağ duruşunda durgunluk | P5 | — | — | — | — | 6:30 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 7 Kendine Şefkat** (çalma sırası: A → C1 → C2 → C5 → C6 → C3 → C4 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Dayanak + şefkatli beden taraması (dolaylı yol) | P1 | 1:00 | 2:30 | 3:00 | 3:30 | 4:30 |
| C2 Sevdiğin birine iyi dilek | P1 | 0:55 | 2:00 | 2:30 | 3:00 | 3:30 |
| C3 Kendine dönüş: el kalpte, iyi dilek | P1 | 1:05 | 3:00 | 3:30 | 4:00 | 5:00 |
| C4 Genişleyen çember: herkese | P3 | — | — | 3:00 | 3:00 | 3:30 |
| C5 Tarafsız biri | P4 | — | — | — | 3:00 | 3:30 |
| C6 Zorlandığın biri (isteğe bağlı, çıkış kapısıyla) | P5 | — | — | — | — | 6:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 8 Sağlam Yer** (çalma sırası: A → C1 → C5 → C3 → C4 → C2 → C6 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Yere basmak: oturarak dağ duruşu, sabit ve rahat | P1 | 1:30 | 2:00 | 2:30 | 2:30 | 3:30 |
| C2 İç ses: kendine adınla ya da "sen" diye seslenmek | P1 | 1:30 | 2:30 | 2:30 | 3:00 | 3:30 |
| C3 Değer hatırlama + onu yaşadığın küçük an | P2 | — | 3:00 | 3:30 | 3:30 | 4:30 |
| C4 Zorlanmaya şefkatli bakış + küçük sonraki adım | P3 | — | — | 3:30 | 3:30 | 4:30 |
| C5 Dağ imgesi (hava değişir, dağ kalır) | P4 | — | — | — | 4:00 | 6:00 |
| C6 Sessiz duruş + tek cümlelik niyet | P5 | — | — | — | — | 4:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 9 Kendini Tanımak** (çalma sırası: A → C1 → C3 → C2 → C5 → C4 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Beden taraması, 30–60 sn arayla geri çağırma | P1 | 3:00 | 4:00 | 4:30 | 5:00 | 6:30 |
| C2 "Şu an ne hissediyorum?": duyguyu bedende bulmak | P2 | — | 3:30 | 4:00 | 4:00 | 4:30 |
| C3 Nefesin kendiliğinden akışını izlemek | P3 | — | — | 3:30 | 3:30 | 4:30 |
| C4 "Bugün neyi önemsiyorum?": değerlere bakış | P4 | — | — | — | 4:00 | 4:30 |
| C5 Tanıklık (sakshi): izleyen farkındalık | P5 | — | — | — | — | 6:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

**Ders 10 Gelecekteki Sen** (çalma sırası: A → C1 → C2 → C3 → C4 → C6 → C5 → K)

| Blok | Öncelik | 5 dk | 10 dk | 15 dk | 20 dk | 30 dk |
|---|---|---|---|---|---|---|
| A Varış (izin, duruş, gözler) | sabit | 0:45 | 1:00 | 1:15 | 1:30 | 1:30 |
| C1 Yerleşme nefesi + dayanak | P1 | 0:20 | 1:00 | 1:00 | 1:30 | 2:00 |
| C2 En iyi olası gün: kişisel alan | P1 | 1:25 | 3:30 | 4:00 | 4:00 | 5:30 |
| C3 İkinci alan: ilişkiler | P3 | — | — | 3:30 | 3:30 | 4:30 |
| C4 Üçüncü alan: iş ya da uğraş | P4 | — | — | — | 3:30 | 4:30 |
| C5 Engel + eğer-ise planı | P1 | 1:15 | 3:00 | 3:30 | 4:00 | 4:30 |
| C6 Gelecekteki senden bugüne bir cümle + sessizlik | P5 | — | — | — | — | 5:00 |
| K Kapanış: dışa dönüş (gündüz) | sabit | 1:15 | 1:30 | 1:45 | 2:00 | 2:30 |
| **Toplam** | | **5:00** | **10:00** | **15:00** | **20:00** | **30:00** |

### B.4.1 Uygulanabilirlik: konuşma payı ve metin bütçesi

Sürüm 1 konuşmayı saniyede 2,5–3,6 hece varsaymıştı. Ölçülen hız bunun yaklaşık iki katı (§D.1.1). Aynı metin iki kat
kısa sürdüğü için, 30 dakikayı sessizlik sınırlarını aşmadan doldurmak daha çok metin ister. Hesap
`_plan/tables_v2.py` ile yapıldı.

**Konuşma payı** (duvar saatinde sesin duyulduğu oran; alt – orta – üst; VARSAYIM):

| Blok türü | Pay | Neden bu alt sınır |
|---|---|---|
| Varış, Kapanış | %45 – %52 – %60 | yönergesi yoğun kapaklar |
| Rehberli çekirdek (beden dolaşımı, nefes yönergesi, imge) | %30 – %37 – %45 | ~7 sn'lik kliplerle en uzun boşluk 20 sn olunca pay en az ≈ %26 olur |
| Derin blok (pencere ≤ 90 sn) | %8 – %12 – %20 | 90 sn'lik pencerelerle en az ≈ %7 |
| Ders 4 sessiz dayanak (pencere ≤ 45 sn) | %16 – %20 – %28 | 45 sn'lik pencerelerle en az ≈ %13 |
| Uyku dersi | rehberli bloklar ×0,8; uyku izni ×0,77 | ders boyunca seyrekleşen anlatım |

Kıyas: Kirschner 2019'daki kayıtlarda 11,5 dk'da 610–630 İngilizce sözcük vardı (benlik C01). Bu kısa ve yönergesi
yoğun bir deney kaydıdır; en iyi değer olarak test edilmedi ve dil farkı yüzünden hece payına çevrilmedi.

**Klip brüt hızı** (hece / klip süresi, klip içindeki noktalama duraklamaları dahil). Bu görevde `hiz/*.mp3`
dosyalarının süresinden hesaplandı (76 hece; baş ve sondaki sessizlik dahil, yani gerçek değer biraz daha yüksek):
Neslihan v2 12,35 sn → 6,15 · Hakan v2 17,65 sn → 4,31 · Neslihan v2 "…" 15,00 sn → 5,07 · Hakan v2 "…" 22,01 sn →
3,45 · Neslihan v4 15,76 sn → 4,82 hece/sn. Aynı metinde Hakan, Neslihan'dan belirgin biçimde daha çok duraklıyor. Bu
yüzden **aynı metin iki seste farklı sürer** ve planlayıcı her ses için ayrı kurar. Planlama çarpanı: g = r / (1 + q).
Burada r artikülasyon hızıdır, q klip içi duraklama çarpanıdır (0,07 Neslihan … 0,46 Hakan, düz metin; ölçüm).

**Metin bütçesi kuralı:** metin, ses yolu seçildikten sonra yazılır (§F.2 Aşama 0). *Çekirdek* metin (zorunlu +
isteğe bağlı klipler), yavaş okuyan seste orta payı aşmayacak uzunluktadır. *Tam* metin (+ genişletme klipleri), hızlı
okuyan seste orta paya ulaşacak uzunluktadır. Aradaki fark genişletme klipleridir.

| Senaryo | g hızlı / yavaş (hece/sn) | 30 dk'da konuşma (ders ortalaması) | Çekirdek metin / ders | Tam metin / ders | Genişletme payı | Benzersiz metin / ders (≈ sözcük) |
|---|---|---|---|---|---|---|
| Yol A · REST, hız ≈ 0,8 (r ≈ 5,2, tahmin) | 4,9 / 3,6 | 626 sn (%35) | 2.229 hece | 3.041 hece | %27 | 3.505 hece ≈ 1.250 |
| Yol B · MCP `eleven_v4` (r ≈ 5,6) | 5,2 / 3,8 | 626 sn | 2.400 hece | 3.275 hece | %27 | 3.762 hece ≈ 1.340 |
| `eleven_multilingual_v2` varsayılan (r ≈ 6,6) | 6,2 / 4,5 | 626 sn | 2.828 hece | 3.859 hece | %27 | 4.403 hece ≈ 1.570 |

"Benzersiz metin" = 30 dk tam metin + kısa Varış ve Kapanış + köprüler (~150 hece) + ilk ders cümlesi. Sözcük sayısı
2,8 hece/sözcükle çevrildi (VARSAYIM). C.8 örneğinde 3,0 hece/sözcük ölçüldü; yani sözcük sayısı en çok ≈ %7 daha az
olabilir. Hece sayısı ve maliyet bundan etkilenmez.

Ders başına (30 dk; çekirdek – tam hece):

| Ders | 30 dk'da konuşma (sn, orta pay) | Yol A · REST hız≈0,8 (g 4,9 / 3,6) | Yol B · MCP v4 (g 5,2 / 3,8) | v2 varsayılan (g 6,2 / 4,5) |
|---|---|---|---|---|
| 1 Nefesin Ritmi | 627 | 2.233 – 3.047 | 2.405 – 3.281 | 2.834 – 3.867 |
| 2 Derin Dinlenme | 650 | 2.313 – 3.156 | 2.491 – 3.399 | 2.936 – 4.006 |
| 3 Uykuya Geçiş | 510 | 1.815 – 2.476 | 1.954 – 2.667 | 2.303 – 3.143 |
| 4 Zor Anlar İçin | 671 | 2.391 – 3.263 | 2.575 – 3.514 | 3.035 – 4.141 |
| 5 Tek Nokta | 515 | 1.832 – 2.500 | 1.973 – 2.693 | 2.326 – 3.174 |
| 6 Sabah Niyeti | 702 | 2.500 – 3.412 | 2.693 – 3.674 | 3.173 – 4.330 |
| 7 Kendine Şefkat | 702 | 2.500 – 3.412 | 2.693 – 3.674 | 3.173 – 4.330 |
| 8 Sağlam Yer | 642 | 2.287 – 3.120 | 2.462 – 3.360 | 2.902 – 3.960 |
| 9 Kendini Tanımak | 612 | 2.180 – 2.974 | 2.347 – 3.203 | 2.767 – 3.775 |
| 10 Gelecekteki Sen | 627 | 2.233 – 3.047 | 2.405 – 3.281 | 2.834 – 3.867 |

Okuma: sürüm 1'in "ders başına 800–1.200 sözcük" tahmini, ölçülen hızla 30 dakikayı sınır aşmadan doldurmaya yetmez.
Yeni hedef ders başına ≈ 1.250–1.570 benzersiz sözcüktür (seçilen yola göre); 10 ders için ≈ 12.500–15.700 sözcük
kusursuz Türkçe metin gerekir. Pilot bu tahmini gerçek klip süreleriyle düzeltir. Konuşma saniyesi iki ses için aynı
tasarım payından geldiği için paket boyutu yoldan neredeyse bağımsızdır (§D.5).

**Ders 2 notu (pilot 2. tur, S12-hoca, T2):** Ders 2'nin tam metni 2.388 hecedir (ilk tur 1.955). 30 dakikadaki
konuşma payı %23,4–%29,3'tür; yani yukarıdaki tablonun orta payına (≈ 650 sn, ≈ %36) bilinçli olarak ulaşmaz. Neden:
yoga nidranın derin evresi sessizlikle çalışır (bu bölümün "derin blok" bandı %8–20), derste üç duyurulmuş pencere
vardır ve derin evredeki 60 sn'lik yoğunluk sınırı (<= 110 hece, VARSAYIM) daha çok söze izin vermez. Sessizlik
doldurulmaz: içerik her dakika büyür ve 30:00'da sessizlikler pref'ten max'a doğru en çok %3 esner
(`pilot/timing.py`, `pilot/ders2.script.md` §2.5). Öteki derslerin bütçesi bu tabloyla kalır; Ders 2'nin satırı gerçek
klip süreleri ölçüldükten sonra düzeltilir.

### B.5 "Ses asla kesilmez" kuralları

| Olay | Davranış |
|---|---|
| Süre doldu | Olmaz: plan kapanışı süreye dahil eder; son söz son saniyede biter. Gündüz dersi son 2 sn'de müzik kuyruğuyla söner |
| **Duraklat** | Ses ve müzik 1 sn'de söner. Sürdürünce 1 sn'de geri gelir ve **o anki klibin başından** başlar (cümle ortasından değil) |
| **Kapanışa geç** | O anki klip biter (en çok ~15 sn), müzik kapanış evresine geçer ve kısa kapanış çalar (gündüz 60–90 sn: nefes, parmaklar ve gerinme, gözler ve oda, yana dön, otur, birkaç nefes bekle, kalk; pilot 2. tur S10, B2, T1, E7: bekleme ve kalkış hızlı kapanışta da kısaltılmaz). Uyku dersinde bu düğmenin adı **"Uykuya geç"** olur ve uyku iznine geçer |
| **Durdur (X)** | Hemen çalışır, onay sorusu yok (özerklik). Ses 2 sn'de söner. Ekran: "Gözlerini aç, etrafına bak, acele etme. Uzanıyorsan önce yana dön, sonra otur." + isteğe bağlı 20–30 sn'lik (pilot 2. tur, S4: yana dönüp oturmaya 10 sn) sesli dönüş (güvenlik §11.D-4). Teslim dosyasının "≥ 3 sn" önerisi yerine güvenlik dosyasının "1–2 sn"si seçildi: durmak isteyen hemen durabilmeli |
| **Sarma (seek)** | İnce ilerleme çizgisinde bölüm işaretleri var. Parmağın bıraktığı yerde **en yakın klip başına** oturur; bölüm listesinden "Beden dolaşımı" gibi bir bölüme de atlanabilir. Müzik çapraz geçişle o evreye geçer, görsel o evrenin durumuna 2 sn'de kayar. Kapanışın içine sarılırsa kapanışın başından çalar. "İstediğim dakikasını dinlerim" isteği böyle karşılanır: seçilen süre + istenen bölümden başlama |
| Telefon araması, Siri | `.began` → duraklat ve JS'ye bildir. `.ended` + `shouldResume` → klibin başından sürdür; `shouldResume` yoksa duraklatılmış kalır, ekran da durur (sayaç motordan okunduğu için ayrışmaz; kod-haritasi R4) |
| Kulaklık ya da AirPods çıkarıldı (`routeChange`, `.oldDeviceUnavailable`) | Hemen duraklat (Apple HIG, pazar.md §6.3). Bugün rota gözlemcisi yok (kod-haritasi R5), eklenecek |
| **Çıkış değişti** (AirPods takıldı, araç Bluetooth'una geçildi, Denetim Merkezi'nden çıkış seçildi, örnekleme hızı değişti) → `AVAudioEngineConfigurationChange` | Motor bu olayla kendiliğinden durur. Ses grafiği yeni çıkışın biçimiyle yeniden kurulur, o anki klibin başından sürdürülür, yatak aynı evrede kaldığı yerden 1 sn'de açılır. Yeni bir çıkış bağlandı diye duraklatılmaz; yalnız çıkış kaybolunca duraklatılır (bir üst satır). Bu uygulamadaki davranışı **doğrulanmadı**; cihaz testi §E.7 madde 7 |
| **Medya hizmetleri sıfırlandı** (`AVAudioSession.mediaServicesWereResetNotification`) | Bütün ses nesneleri geçersiz olur. Oturum, motor ve düğümler baştan kurulur, dosyalar yeniden bağlanır, o anki klibin başından sürdürülür. Kurulum başarısız olursa ders duraklatılmış kalır ve ekranda "Sürdür" çıkar. **Doğrulanmadı** |
| Ekrandan çıkmak | Ders modül dışı bir oturumda sürer (`sleepSession.js` kalıbı, kod-haritasi §2.3); başka ekrana geçmek dersi kesmez |
| Kilitli ekran | Yerel motor `.playback` oturumunda çalar. Kilit ekranında ders adı, bölüm adı, geçen/toplam süre ve oynat/duraklat görünür (MPNowPlayingInfoCenter + MPRemoteCommandCenter; bugün yok, kod-haritasi R6). Başka düğme eklenmez ("Avoid repurposing audio controls") |
| **Ekranın açık kalması** | Oynatıcı Wake Lock **tutmaz** (Dalga.jsx:134-152'deki `keepAwake` kalıbının tersine). Ekran sistemin kendi süresinde kararır ve kilitlenir, ders kilitte sürer. Uyku dersi ekranı hiçbir durumda gece boyu açık tutmaz |
| Uygulama arka planda ya da ekran kilitli | Motorun konum olayları 20 Hz'den 1 Hz'e iner (JS büyük olasılıkla askıdadır; kod-haritasi R1). Dinlenen süre yerelde de yazılır ve uygulama açılınca JS uzlaştırır (kod-haritasi R7) |

### B.6 Uyku dersinin sonu

- Uyku izni cümlesinin ardından ses kademeli olarak susar. Müzik ve yağmur, kişinin seçtiği kuyruk süresince çalar.
  Son 3 dk kosinüs eğrisiyle kısılır ve **tamamen durur**. Uyandırma cümlesi yoktur (güvenlik §11.B-15).
- Kuyruk sırasında ekran kararır ve sistemin kendi süresinde kilitlenir. Dokununca yalnız "Durdur" görünür.
- İsteğe bağlı (v2): ders bitince mevcut uyku müziğine ve alarm kurulumuna devam edilir (aynı yerel oynatıcı;
  kod-haritasi §2.3). Bugün ders ile uyku sesi aynı anda çalamaz (R3), bu yüzden devir sırayla yapılır.

---

## C. Metin stil kılavuzu (Türkçe)

Her ders metni ElevenLabs'e gitmeden önce **üç ayrı insan incelemesinden** geçer:

1. **Türkçe editör:** anadili Türkçe, yayın ya da seslendirme metni deneyimi olan bir insan editör. TDK yazımı,
   anlatım bozukluğu, cümle düşüklüğü (özne-yüklem uyumu, eksik öğe, gereksiz sözcük, yanlış ek), çeviri kokusu, doğal
   söyleyiş (sahibin 5. isteği).
2. **Güvenlik listesi:** güvenlik §11.B'nin 18 kuralı, madde madde işaretlenir. Ders 4 (Zor Anlar İçin) ve Ders 7
   (Kendine Şefkat) metinleri ayrıca bir **klinik psikolog** tarafından travma-duyarlı dil açısından okunur.
3. **Usta hoca:** yoga nidra ya da rehberli meditasyon eğitimi almış bir hoca, §E.6'daki 18 ölçütü işaretler.

Bu belgeyi hazırlayan model her metinde ilk denetimi yapar ama insan onayının yerine geçmez. İnceleyicilerin kim
olacağı sahibin kararıdır (§G10). Seslendirmeden sonra her klip yazıya geri çevrilir ve metinle karşılaştırılır (§D.6).

### C.1 Ses ve kip
- **İkinci tekil "sen"**, şimdiki ya da geniş zaman: "Nefesin göğsünü yavaşça dolduruyor."
- **Davet, komut değil:** "İstersen gözlerini kapatabilirsin." / "Dikkatini ellerine getirebilirsin." Emir kipi
  yalnız güvenlik cümlelerinde ve bedensel yönergelerde kısa ve net kullanılır: "Başın dönerse otur." (güvenlik
  §11.B-1; Ciaramella 2024'te hem doğrudan hem dolaylı telkin etki gösterdi, hangisinin üstün olduğu kanıtlanmadı:
  PMID 39243923, DOI [10.1016/j.jpain.2024.104671](https://doi.org/10.1016/j.jpain.2024.104671)).
- **Beden dolaşımında isim cümlesi:** bloğun başında izin çerçevesi kurulur ("Adını söylediğim yeri yalnızca fark
  edebilirsin; bir şey yapman gerekmiyor."), sonra yalnız yer adları gelir: "Sağ elin başparmağı… işaret parmağı… orta
  parmak…". Yön sırası her derste aynı: sağ → sol → arka → ön → bütün.
- **Kontrol kişide:** "Ne kadar gevşeyeceğine sen karar verirsin." Sınama telkini yok ("Kolların öyle ağır ki
  kaldıramıyorsun" yok).
- **Başarısızlık yok:** "Zihnin dağıldıysa bu da pratiğin parçası." ("Fark ettiğin an, zaten geri döndün." cümlesi
  Ders 5'in anahtar cümlesidir; başka derste kullanılmaz, §A.2.1.)

### C.2 Cümle, hız ve yoğunluk
- Bir cümlede bir yönerge; **6–12 sözcük**, en çok 14 (teslim §4.5, VARSAYIM).
- **Klip içi hız (artikülasyon, duraklamalar hariç) ölçüldü** (§D.1.1): `eleven_multilingual_v2` varsayılan ayarda
  Neslihan 6,61, Hakan 6,52 hece/sn; `eleven_v4` Neslihan 5,63 hece/sn; REST'te hız 0,8 ile ≈ 5,2 hece/sn
  (**tahmin, ölçülmedi**). Bu hız, yol ve ses seçilince sabitlenir. Metinle ya da düzenlemeyle yavaşlatılmaz.
- **Hız bandı (VARSAYIM):** klip içi artikülasyon **5,0–6,8 hece/sn** ve seçilen ayarın pilot ölçümünün ±%8'i içinde
  olur. 5,0 hece/sn'nin altına indiren ayar (ör. REST'te hız < 0,8) kullanılmaz, çünkü sözcükler uzar. Dayanak yönü:
  aşırı yavaş (1,72 hece/sn) ve çok duraklamalı konuşma en az doğal bulundu, alışkın okuma 3,89 hece/sn ile en doğaldı
  (Shuminsky & Davidow 2026, PMID 42757902, DOI
  [10.1044/2026_JSLHR-25-00691](https://doi.org/10.1044/2026_JSLHR-25-00691)). Bu sayılar İngilizce ve farklı bir
  ölçümdür; Türkçe hedef olarak kullanılmaz, yalnız "aşırı yavaşlatma doğallığı bozar" yönünü verir. Türkçe hece/sn
  normu bulunamadı (teslim §1.3).
- **Yavaşlık klipler arasından gelir:** dersin sakin temposu, planlayıcının koyduğu eylem payı, nefes payı ve sessiz
  pencerelerle kurulur (§B.2). Üç nokta (`…`) sese bağlı ek duraklama getirir (Hakan'da aynı paragrafta 5,4 sn'den 10,0
  sn'ye çıktı; artikülasyon değişmedi, ≈ 6,6). Bu yüzden üç nokta yalnız beden dolaşımı gibi listelerde kullanılır;
  uzun sessizlik hiçbir zaman üç noktayla değil, uygulamanın `[n]` boşluğuyla verilir.
- **Yoğunluk, konuşma payıyla tanımlanır** (duvar saatinde sesin duyulduğu oran; §B.4.1): Varış ve Kapanış %45–60,
  rehberli çekirdek %30–45, derin blok %8–20, sessiz pencere %0 (VARSAYIM). 30 dk sürümde ders ortalaması ≈ %35.
  Dakikadaki hece sayısı yola göre değişir: aynı %37 pay, yol A'da (g ≈ 3,6–4,9) dakikada ≈ 80–110, v2'de (g ≈ 4,5–6,2)
  dakikada ≈ 100–140 hece eder.
- **Tahmini metin uzunluğu:** 30 dk tam metin ders başına ≈ 3.040–3.860 hece. Kısa Varış ve Kapanış, köprüler ve
  genişletme klipleriyle birlikte ders başına benzersiz metin ≈ 3.500–4.400 hece (≈ 1.250–1.570 sözcük; §B.4.1).
  Metin yazılınca ölçülür.
- **Azalan anlatım** (Knowlton & Larkin 2006): varıştan derinleşmeye doğru (1) boşluklar uzar, (2) cümleler kısalır,
  (3) seviye evre eğrisiyle alçalır (§D.2: −1,5 / −3 dB), (4) yol A'da REST hızı evre başına bir basamak düşer
  (ör. 0,85 → 0,80; artikülasyon bandının içinde kalarak). Yol B'de hız ayarı yok; azalma yalnız 1–3. maddelerle
  sağlanır. Gündüz kapanışında boşluklar kısalır ve seviye konuşma düzeyine döner.

### C.3 Duraklama gösterimi ve TTS'e aktarımı
| Gösterim | Anlamı | Nasıl üretilir |
|---|---|---|
| `,` `.` `—` | cümle içi doğal duraklar | TTS'in kendisi (model rehberi: virgül ve nokta doğal duraklama, uzun çizgi kısa vuruş; elevenlabs.md §2.1) |
| `…` | yalnız listelerde, sese bağlı daha uzun durak | TTS; ölçüm: Hakan'da duraklamayı neredeyse iki katına çıkarıyor, artikülasyonu değiştirmiyor |
| `‖` | klip sınırı | Yol A: her klip ayrı istek; komşu cümleler `previous_text` / `next_text`. Yol B: blok tek istekte üretilip cümle sonlarından kesilir (§D.1.3) |
| `[4]` | klipten sonra 4 sn sessizlik (sabit) | uygulamanın zaman çizelgesi (dijital sessizlik; yatak sürer) |
| `[4–10]` | esnek boşluk (min–maks), sınıf sınırları içinde | planlayıcı süreye ve sese göre seçer |
| `[P≤90: "Birkaç nefes sessizlik… sonra sesim geri gelecek."]` | sessiz pencere, önce duyurulur | zaman çizelgesi; duyuru ve dönüş birer klip |
| `{nefes 4/6 ×3}` | nefes döngüsü ipucu | "al" / "ver" mikro-klipleri taşıyıcı cümlede üretilip kesilir ve döngü sınırlarına konur; bordun aynı periyotta döner; görsel buna kilitlenir |
| `+[…]` | genişletme klibi | yalnız §B.3 adım 3d'de çalar |

- `<break>` etiketi **kullanılmaz**: en çok 3 sn sürer, fazlası "hızlanma ya da ses bozulması" yapabilir
  (elevenlabs.md §2.2) ve gerçekten sessizlik ürettiği doğrulanmadı (§2.3); v3 ve v4'te desteği de belirsiz. Bütün
  uzun sessizlikler uygulamadadır.
- Satır içi yönetim etiketi (ör. v3'te köşeli parantezli İngilizce yönerge) **kullanılmaz**: ölçümde transkript etiketi
  içeriyordu, yani büyük olasılıkla sesli okundu (§D.1.1).

### C.4 Tekrar ve derinleşme kalıpları
- Dersin **anahtar cümlesi** (§A.2.1) çekirdekte üç kez söylenir, her seferinde biraz daha kısa ve yumuşaktır
  (VARSAYIM); 5 dk sürümde en az bir kez.
- Geri sayma: her sayı bir nefes döngüsüne denk gelir ("On… nefes veriyorsun… dokuz…"). Sayı kaybolursa: "Sayıyı
  kaybettiysen baştan başlayabilirsin; bu da olur."
- İmge somut duyuya bağlanır: sıcaklık, ağırlık, temas, ses, koku. Görme tek başına bırakılmaz.
- Her dersin **tek bir imge yayı** vardır (§A.2.1). Ani dramatik kırılma yok.
- Aynı dersin tekrarında ezber şikâyeti (pazar.md §6.2) için v2'de imge ve geçiş cümlelerinden küçük bir havuz
  düşünülür; ilk sürümde tek metin.

### C.5 Travma-duyarlı kurallar (özet; tam liste güvenlik §11.B)
Gözleri açık seçeneği her zaman; "istediğin an durabilirsin" kuralı (söylenen biçimi A.1'de: "… ya da ara
verebilirsin") açılışta, 30 dk'da ortada bir kez daha; zor bölümden önce tarafsız dayanak, zor bölüm sırasında ona dönüş
kapısı (güvenlik §11.B-8); ağrılı bölgeyi atlama izni; imgede seçenek (su, derinlik, kapalı alan, yükseklik,
karanlık herkese iyi gelmeyebilir); anı arama, geriye gitme, "en acı anını hatırla" yok; öz-şefkat kademeli; 20 sn'yi
aşan her sessizlik duyurulu ve ≤ 90 sn; hareket hafif, oturarak ve "ağrı olursa bırak"; kişiye özel tıbbi uyarı derste
değil kartta.

### C.6 Yasak sözcük ve iddialar
- Sağlık iddiası: tedavi, iyileştirir, şifa, detoks, kanıtlanmış, bilimsel olarak, "kaygını yok eder", "uykusuzluğa
  son", "stresini azaltır".
- Kanıtsız mekanizma: frekans, Hz, teta dalgası, bilinçaltı, programlama, çekim yasası, bolluk, çakra açma, enerji
  bedeni.
- Kontrol kaybı: "kontrolü bırak", "kendini kaybet", "iraden eriyor", "kıpırdayamıyorsun", "tamamen gevşedin".
- Varsayılan nefes komutu olarak "derin bir nefes al… tut".
- Olumlama tekrarı: "Ben harikayım", "Sevilmeye değerim" (Wood 2009).
- Uygulama metninde "hipnoz" bir yöntem adı olarak geçmez. Sahibin "hipnoz olmalıyım" isteği "içine çeken, kesintisiz
  deneyim" diye karşılanır ve kimseye vaat edilmez (Cordi 2014: telkin etkisi düşük yatkınlıkta görülmedi; PMID
  24882909, DOI [10.5665/sleep.3778](https://doi.org/10.5665/sleep.3778)).
- "Şükür" yerine "şükran" (dinî çağrışım; pazar.md §7 #10).

### C.7 TTS için Türkçe söyleyiş tuzakları
- `eleven_multilingual_v2`'de fonem/IPA etiketi çalışmaz; yalnız **alias** (yazım değiştirme) sözlüğü ve fonetik yazım
  kullanılabilir (elevenlabs.md §2.2). Sözlük yalnız REST'te var; yol B'de aynı düzeltme metnin içine fonetik yazımla
  girilir. `eleven_v4`'ün sözlük ve fonem desteği **doğrulanmadı**. Hangi sözcüklerin yanlış okunacağı doğrulanmadı;
  pilotta ölçülür. Ölçülen tek v4 okumasında Scribe transkripti metinle aynıydı (tek örnek).
- **Sanskritçe terimler seste en aza iner.** Ekranda "Yoga Nidra", "sankalpa" yazabilir. Seste ilk geçişte bir kez,
  Türkçe yazımla söylenir: "şavasana", "sankalpa", "bramari", "nadi şodana", "drişti". Sonrasında Türkçe karşılığı
  kullanılır: "niyet", "vızıltılı nefes".
- Sayılar sözcükle yazılır ("dört", "on"); kısaltma yok ("dk" değil "dakika").
- Düzeltme işaretleri doğru kullanılır (hâlâ / hala, kâr / kar). ğ'li sözcükler ("değil", "ağırlık", "yumuşacık") ve
  soru eki ("mı") vurgusu dinlenerek denetlenir.
- Eşyazımlılar bağlamla netleştirilir: "yüz" (surat / sayı), "gül", "dolu", "kurt".
- İngilizce sözcük yok (mindfulness, body scan yerine farkındalık, beden taraması).
- Vurgu için büyük harf yalnız gerektiğinde ve seyrek kullanılır (model rehberi).

### C.8 Örnek (Ders 2, Varış + N1 Niyet, 15 dk sürüm; biçimi göstermek için, son metin değil)

```
Hoş geldin. [2]
‖ İstediğin an gözlerini açabilir, kıpırdayabilir ya da ara verebilirsin. [3]
‖ Şimdi hiçbir şey yapmadan, uyanık kalarak dinlenebilirsin. [4]
‖ Sırtüstü uzanabilir ya da sana en rahat gelen biçimde yerleşebilirsin. [4–8]
‖ (isteğe bağlı) İstersen dizlerinin altına bir yastık koyabilirsin. [4–8]
‖ Gözlerini kapatabilir ya da bakışını tavanda bir noktaya yumuşakça bırakabilirsin. [5–8]
‖ Bedeninin ağırlığını altındaki zemine bırakabilirsin. [8–15]
‖ Nefesini değiştirmeden yalnızca fark edebilirsin. [10–20]
‖ İstersen kendine kısa bir niyet seçebilirsin; bugün sana iyi gelecek, basit bir cümle. [4–8]
‖ Kendi cümleni bulamazsan şunu kullanabilirsin: "Dinlenmeye izin veriyorum." [3–5]
‖ Niyetini içinden bir kez söyleyebilirsin. [8–12]
```

Bu örnekte 237 hece, 79 sözcük ve 653 karakter var (3,0 hece/sözcük, 8,3 karakter/sözcük; bu görevde sayıldı). Yola ve
sese göre ≈ 38–66 sn konuşma eder. 15 dk sürümde Varış + N1 = 1:45'tir; kalan süre boşluklardan gelir. En yavaş seste
konuşma payı %60'ı aşarsa önce isteğe bağlı yastık cümlesi düşer (§B.3 adım 5). Sürüm 1'deki örnekte davet kuralını
çiğneyen iki emir ("Niyet seç", "İçinden söyle") davet kipine çevrildi.

---

## D. Ses üretim özellikleri

### D.1 Seslendirme (TTS): iki yol, ölçümler ve "seslerin eğitilmesi"

#### D.1.1 Ölçülen gerçekler (2026-09-28, bu oturum)

76 heceli Türkçe bir meditasyon paragrafı ElevenLabs'te 7 kez okutuldu (`hiz/*.mp3`). Artikülasyon = konuşulan
hece / gerçek konuşma süresi (duraklamalar hariç). Transkript ElevenLabs Scribe ile alındı.

| Dosya | Model ve ayar | Artikülasyon (hece/sn) | Dosya süresi (bu görevde ölçüldü) | Not |
|---|---|---|---|---|
| nes-duz | `eleven_multilingual_v2`, varsayılan, Neslihan | 6,61 | 12,35 sn | |
| hak-duz | `eleven_multilingual_v2`, varsayılan, Hakan | 6,52 | 17,65 sn | duraklamalar toplam 5,4 sn |
| nes-uc / hak-uc | v2 + metinde üç nokta "…" | ≈ 6,6 | 15,00 / 22,01 sn | Hakan'da duraklamalar 5,4 → 10,0 sn; hız değişmedi |
| nes-v3 / hak-v3 | `eleven_v3` + satır içi İngilizce yönerge etiketi | ≈ 6,2–6,3 | 15,04 / 19,20 sn | transkript etiketi içeriyordu → büyük olasılıkla sesli okundu; bu kullanım **elenir** |
| nes-v4 | `eleven_v4`, düz metin, Neslihan | 5,63 | 15,76 sn | Scribe transkripti metinle harfi harfine aynı (tek örnek) |
| — | REST, `speed` 0,8 | ≈ 5,2 | — | **tahmin, ölçülmedi** |

Sonuçlar:
1. Klip içi hız, sürüm 1'in varsaydığı 2,5–3,6 hece/sn değil, 5,2–6,6 hece/sn bandındadır. Bu yüzden bütün süre,
   metin, boyut ve maliyet hesapları yeniden yapıldı (§B.4.1, §C.2, §D.5, §F.1).
2. Üç nokta yalnız duraklama ekler ve bu sese göre değişir. Hız ayarı yerine geçmez.
3. v3'ün satır içi yönetim etiketleri bu iş için kullanılamaz.
4. MCP araçlarında hız, kararlılık, seed ve `previous_text` yok. Hız ayarı (0,7–1,2) yalnız REST'te var
   (elevenlabs.md §2.1–2.2).
5. Hangi yol seçilirse seçilsin dersin yavaşlığı uygulamanın koyduğu sessizlikten gelir. İki yol da zamanlama
   tasarımını taşır; farkları denetim ve tekrarlanabilirliktedir.

#### D.1.2 Yol A: REST API (anahtar bulut ortamının sırrı olarak)

- **Nasıl:** bir üretim betiği (`app/design/yoga/tts.py`, sonraki aşamada yazılacak) ElevenLabs REST API'sini çağırır.
- **Anahtar nerede durur:** yalnız bu bulut ortamının sırlarında. Sahip anahtarı oturumun başlık çubuğundaki bulut
  ortamı menüsünden **Edit** ile ekler: "API credentials" bölümü varsa oraya, yoksa `ELEVENLABS_API_KEY` adlı ortam
  değişkeni olarak. Yeni bir oturum bu değeri görür. Betik yalnız `os.environ['ELEVENLABS_API_KEY']` okur ve günlüğe
  yazmaz. Anahtar **hiçbir zaman** sohbete yapıştırılmaz, depoya, uygulamaya, belgelere ya da Artifact'a girmez
  (ANA_BELGE.md:84-86, kod-haritasi §7). Mümkünse yalnız bu işe ayrılmış, kredi sınırı konmuş ayrı bir anahtar
  kullanılır (ElevenLabs'te anahtar kapsamı ve kota ayarı **doğrulanmadı**). Bu ortamdan api.elevenlabs.io'ya çıkış
  izni **doğrulanmadı**; ilk çağrıda proxy durumuna bakılır.
- **Yapabildikleri:** `speed` 0,7–1,2; `stability`, `similarity_boost`, `style`, `use_speaker_boost`; `seed`;
  `previous_text` / `next_text`; `previous_request_ids` (en çok 3 ve en çok 2 saatlik; v3'te yok); çıktı biçimi
  (`pcm_44100` Pro katman ister, `mp3_44100_192` Creator katman ister); telaffuz sözlüğü (v2'de yalnız alias; istek
  başına en çok 3 sözlük); istek başına tek üretim (elevenlabs.md §2.2).
- **Yapamadıkları ya da bilinmeyenler:** hesabın katmanı ve aylık kotası **doğrulanmadı**. `speed` 0,8'in Türkçede
  ≈ 5,2 hece/sn verdiği bir tahmindir. `eleven_v4`'ün REST'te `voice_settings`, `speed` ve cümle birleştirmeyi
  destekleyip desteklemediği doğrulanmadı. v2'de fonem/IPA yok.
- **Artısı:** tekrarlanabilir (sabit seed), cümleler arası süreklilik, hızın evreye göre ayarlanabilmesi, kayıpsız
  arşiv (PCM varsa), klip başına tek üretim (düşük maliyet).

#### D.1.3 Yol B: yalnız MCP araçları (`eleven_v4`, her klipte en iyi okuma seçilir)

- **Nasıl:** `creative_generate_speech` ile `model_id: eleven_v4`, `voice_id` ve `generations_count: 2–3`. Her klibin 2–3
  okuması alınır, en iyisi nesnel ölçütlerle seçilir (§D.1.4). Anahtar gerekmez; üretim bu oturumun ElevenLabs
  çalışma alanı kredisinden düşer.
- **Yapabildikleri:** model seçimi (v2, v3, v4, turbo, flash), `voice_id`, `language_code`; `generations_count` 1–4
  (maliyet okuma sayısıyla çarpılır); `estimate_only` ile ücretsiz tahmin; Scribe ile yazıya çevirme; Voice Design
  (`creative_design_voice`) (elevenlabs.md §1, §2.1).
- **Yapamadıkları:** hız, kararlılık, stil, seed, cümle birleştirme, telaffuz sözlüğü ve çıktı biçimi ayarlanamaz.
  Çıktı MP3, 44,1 kHz; bit hızı dosya boyutu ve süresinden kaba hesapla ≈ 128–140 kbit/sn (bu görevde; resmî değer
  doğrulanmadı). Arşiv bu yüzden kayıplıdır ve uygulamadaki AAC'ye ikinci kez kayıplı çevrilir; bu kayıp kör dinlemede
  denetlenir.
- **Süreklilik çaresi (taşıyıcı ve kesim):** blok tek istekte üretilir (v2 için istek başına 10.000 karakter sınırı
  bunun çok üstündedir; v4'ün sınırı doğrulanmadı). Sonra cümle sonlarındaki duraklamalardan kliplere kesilir. Kesilen
  her klip Scribe ile doğrulanır. Aynı yöntem mikro-kliplere de uygulanır (§B.2).
- **Tekrarlanabilirlik yok:** seed olmadığı için aynı okuma bir daha alınamaz. Kabul edilen her okuma, ham dosyası ve
  seçim ölçümleriyle arşivlenir.
- **Artısı:** anahtar ve yeni bir hesap ayarı gerektirmez. v4, ölçülen en yavaş doğal okumayı verdi (5,63 hece/sn).
  **Eksisi:** her klip 2–3 kez ücretlendirilir (§F.1), ayar yok, kayıplı arşiv.

#### D.1.4 "Seslerin eğitilmesi" (sahibin 4. isteği): somut olarak ne yapılacak

"Eğitmek", bir modeli veriyle yeniden eğitmek anlamına gelmiyor. Gerçek bir hocanın izinli kayıtlarıyla ses klonlamak
da önerilmiyor. Burada eğitim, iki hazır sesi bir **meditasyon hocasının anlatım profiline** getiren ayar, seçim ve
ölçüm döngüsüdür. Hedef profil (ölçülebilir):

- klip içi artikülasyon §C.2 bandında; evreden evreye azalan anlatım;
- ortalama perde (F0) aynı sesin düz okumasından düşük, perde yayılımı dar (Diel 2025: sakin ElevenLabs seslerinde
  ortalama perde ve perde değişkenliği daha düşüktü; PMID 41057603, DOI
  [10.1038/s41598-025-21290-1](https://doi.org/10.1038/s41598-025-21290-1)); cümle sonu düşüşleri korunur;
- fısıltı yok, "yumuşak ama sesli" (teslim §1.5);
- Scribe ile harfi harfine doğru okuma; ıslıklı sesler (sibilans) sınırda; klipler arasında tını ve perde sürekliliği.

**Yol A'da eğitim adımları:**
1. **Ayar ızgarası, 1. tur:** `speed` {0,75 · 0,80 · 0,85 · 0,90} × `stability` {0,50 · 0,60 · 0,70}; `similarity_boost`
   0,75, `style` 0, speaker boost açık; sabit seed. Üç temsilî klip (varış, beden dolaşımı, imge) × iki ses = 72 klip.
2. **2. tur:** en iyi 3 hücre × `style` {0 · 0,1 · 0,2} × altı temsilî klip (ek olarak geri sayma, uyku izni, gündüz
   kapanışı) × iki ses.
3. **Model karşılaştırması:** aynı altı klip `eleven_multilingual_v2` ve (REST'te ayarları kabul ediyorsa)
   `eleven_v4` ile.
4. **Evre profilleri:** Varış, Derinleşme ve Derin için ayrı `speed` / `stability` değerleri. Ölçülen artikülasyon
   evreden evreye düşmeli (VARSAYIM: her basamakta ≥ %3) ama 5,0 hece/sn'nin altına inmemeli.
5. **Telaffuz sözlüğü:** pilot metnindeki riskli sözcükler (Sanskritçe terimler, ğ'li sözcükler, eşyazımlılar, soru
   eki, sayılar) okutulur. Yanlış okunanlar için alias kuralı yazılır; her kural Scribe ve kulakla yeniden denenir.
6. **Birleştirme:** her klipte `previous_text` / `next_text`, aynı blokta `previous_request_ids`. Seed = klip
   kimliğinden türetilen sabit sayı. Böylece aynı klip gerektiğinde aynen yeniden üretilir.

**Yol B'de eğitim adımları:**
1. **Model seçimi:** altı temsilî klip × iki ses × {`eleven_v4`, `eleven_multilingual_v2`} × 3 okuma. v3 elenir
   (satır içi etiketler okunuyor, birleştirme yok).
2. **Metin biçimi, tek ayar düğmesidir:** cümle uzunluğu, virgül yeri, üç noktanın yalnız listelerde kullanılması (sese
   göre değişen ek duraklama getirir), büyük harf kullanılmaması, riskli sözcüklerde fonetik yazım, satır içi etiket
   yok. Her kural iki sesle ve iki biçimde denenir.
3. **En iyi okuma seçimi:** pilotta `generations_count: 3`. Üretimde, ilk seçimde ≥ %80 başarı görülürse 2'ye iner
   (VARSAYIM). Okumalar önce aşağıdaki nesnel puanla sıralanır, ilk iki aday kör dinlenir.
4. **Taşıyıcı ve kesim** (D.1.3) ile süreklilik ve mikro-klipler.
5. Kabul edilen her okuma arşivlenir.

**Nesnel seçim ölçütleri (iki yolda da):** Scribe ile normalleştirilmiş tam eşleşme (§D.6); artikülasyon bandı;
duraklama deseni; F0 ortalaması ve yayılımı (sesin düz okumasına göre); ıslıklı ses oranı; tık, kırpılma, DC; LUFS;
komşu klibe süreklilik (son ve ilk 500 ms'de F0 farkı ve tını uzaklığı). Eşikler pilotta konur (VARSAYIM).

**İsteğe bağlı üçüncü aday (sahibin kararı, §G6): Voice Design.** ElevenLabs'in ses tasarımı aracıyla bu uygulamaya
özgü bir "hoca sesi" tasarlanır ve kör dinlemede Neslihan ile Hakan'ın yanına üçüncü aday olarak konur. ElevenLabs
kuralı gereği sesin tarifini ve okutulacak örnek cümleyi sahip verir (ör. tarif: "sıcak, alçak perdeli, orta yaşta,
İstanbul Türkçesiyle konuşan bir meditasyon hocası"). Önizlemelerden biri kaydedilir ve pilotun altı klibiyle aynı
ölçütlerden geçer. Artısı: kütüphane sesinin kaldırılma riskini ortadan kaldırır (§F.2 Aşama 0). Tasarlanan sesin
ticari kullanım koşulları ve önizleme maliyeti **doğrulanmadı**.

**Dinleme:** her turun sonunda en iyi 3 aday, en az 5 kişilik kör panele (§D.6) dinletilir. Sahip yalnız bitmiş ve
ölçülmüş aday çiftini dinler (SAHIP_ISTEKLERI #3).

#### D.1.5 Öneri

**Yol A.** Gerekçe: hızı ölçülen banda sabitleyebilen, aynı klibi aynen yeniden üretebilen, cümleler arası sürekliliği
ve telaffuz sözlüğünü kullanabilen tek yol bu. Klip başına tek üretim olduğu için de daha ucuz (§F.1). Yol B tam
çalışan bir yedektir: `eleven_v4` ölçülen en yavaş doğal okumayı verdi ve zamanlama tasarımı iki yolda da aynıdır.
Sahip anahtarı ortam sırrı olarak eklemek istemezse yol B ile devam edilir; kararı etkileyen bilgi §G5'te.

### D.2 Klip işleme (`app/design/yoga/voice.py`, numpy/scipy/soundfile/pyloudnorm; bu ortamda var)
- Baş ve sondaki sessizlik kırpılır: −50 dBFS eşik, önde 60 ms, sonda doğal nefes kuyruğu için 250 ms pay, 10 ms
  yumuşak uçlar (VARSAYIM; voicePack.js'teki %2 eşik ve 8 ms geçişle aynı mantık, kod-haritasi §3). Klip içindeki
  duraklamalara dokunulmaz.
- Yüksek geçiren filtre: kadın ses 90 Hz, erkek ses 70 Hz, 2. derece (VARSAYIM).
- **Islıklı sesler (sibilans):** yalnız 5–9 kHz bandı eşiği aşarsa, en çok 4 dB azaltılır (VARSAYIM). Ağır sıkıştırma
  yok: +10 dB SBR'de sıkıştırma, algılanan konuşma netliği puanını düşürdü (Rallapalli 2026, işitme cihazı
  simülatörü, n=15, PMID 41949420, DOI [10.1044/2026_AJA-25-00171](https://doi.org/10.1044/2026_AJA-25-00171)). Ses ve
  müzik ayrı işlenir.
- **Seviye:** 1 sn ve daha uzun her klip −18 LUFS (±0,5), gerçek tepe ≤ −1,5 dBTP. **1 sn'den kısa kliplerde LUFS
  geçersizdir** (400 ms kapılama); bunlar aynı evrenin referans klibindeki konuşma bölümünün RMS'ine eşitlenir. Bugünkü
  kısa komutlar tepe değerine göre eşitleniyor (voicePack.js:104-105, kod-haritasi §3); dersler LUFS'e göre eşitlenir.
- **Evre eğrisi:** aynı ders içinde Derinleşme evresi klipleri −1,5 dB, Derin evre −3 dB (azalan anlatım; VARSAYIM).
- **Mikro-kliplerin kesimi:** taşıyıcı cümleden sözcüğün çevresindeki sessizlik noktalarında, sıfır geçişe yakın ve
  5 ms yumuşak uçla kesilir. Kesilen her parça Scribe ile tek başına doğrulanır.
- Konuşma kliplerine oda sesi eklenmez; boşlukları yatak taşır.
- **"Sessizlik" arka planı:** tam dijital sessizlik yerine −55 ile −60 dBFS RMS arasında bir **oda sesi tabanı**
  çalar. İki varyant × 30 sn, rastgele sırayla ve çapraz geçişle; motor da üretebilir. Neden: 90 sn'lik tam sessizlikte
  bazı Bluetooth kulaklıklar enerji tasarrufuna geçip dönüşteki ilk heceyi yutabilir (**doğrulanmadı**). Ayrıca
  dinleyen uygulamanın durduğunu sanabilir. AirPods'ta "90 sn sessizlikten sonraki ilk hece" testi yapılır (§E.7
  madde 7).

### D.3 Müzik yatakları, nefes bordunu ve doğa katmanı
- **Yatak evreleri:** Varış, Çekirdek (Derinleşme + Derin) ve Kapanış. Gece dersinde Kapanış yerine "Uyku" yatağı ve
  kuyruk var.
- **Tekrarsızlık:** 30 dk'da aynı döngünün 10–60 kez duyulması "kimse sıkılmayacak" isteğine aykırıdır. Bu yüzden:
  - Varış (≤ 1:30) ve Kapanış (≤ 2:30) evreleri tek parça, döngüsüz yataktır: Varış 1 × 120 sn, Kapanış 1 × 180 sn.
  - Çekirdek evresi **4 varyant × 180 sn**'dir (≈ 12 dk benzersiz müzik). Motor bunları `seed`'e bağlı rastgele sırayla
    çalar; aynı varyant art arda gelmez ve 8 sn eşit güçte çapraz geçişle bağlanır. Varyantlar aynı istemden farklı
    üretimlerdir; ton ve tını ortaktır.
  - Uyku dersinin "Uyku" evresi ve kuyruğu (20 dk'ya kadar) da 4 varyant × 180 sn'dir.
  - Doğa katmanı her tür için **4 varyant × 30 sn** döngüdür, rastgele sırayla çalar. Türler: uzak rüzgâr ve yaprak (Ders 2 varsayılanı, kuşsuz;
    ayardan açılan akarsu katmanı varsayılan kapalı ve sahip kararıdır; pilot 2. tur, S12), yağmur (Ders 3), okyanus (Ders 9), dağ rüzgârı (Ders 8, isteğe bağlı), uzak orman ve yaprak sesi (Ders 6 zemini;
    doğası kapalı olan derslerde "Doğa" seçilirse bu beş türden derse en uygun olanı çalar).
  - **Kuş sesi döngü olarak çalmaz.** 12 tek çağrı (her biri 2–5 sn, döngüsüz SFX) üretilir. Motor bunları seyrek ve
    rastgele anlarda (ortalama 12–25 sn arayla, VARSAYIM) orman zemininin üstüne koyar; aynı çağrı 2 dk içinde
    tekrarlanmaz. Böylece tanınır bir motif dönmez.
- **Üretim:** ElevenLabs Music `eleven_music_v2_5`, `instrumental: true`, istemde "very slow, no drums, no percussion,
  no vocals, no choir, no crescendo, flat dynamics, sustained" ve derse özgü tını (§A.2.1). Tempo ve ton parametresi
  yoktur, yalnız istemle yönlendirilir (elevenlabs.md §3). Her parça için 2–3 aday üretilir, en iyisi seçilir. Doğa
  katmanı `eleven_text_to_sound_v2` ile üretilir: döngüler `loop: true` ile (yalnız MP3), kuş çağrıları döngüsüz.
  **Kaynak kararı sahibin (§G9):** yatakların hepsi ElevenLabs'ten mi, yoksa uygulamanın kendi müzik motorundan mı
  (dalgaMusic ve render.mjs hattı) gelecek? Pilotta Ders 2 yatakları iki yoldan da üretilip kör dinlemeyle
  karşılaştırılır.
- **Nefes bordunu (uygulamanın kendi hattı):** ElevenLabs Music'te tempo ayarı olmadığı için nefes bloklarının altındaki
  bordun `design/dalga-uyku/render.mjs` hattıyla (Vite + Playwright ile çevrimdışı basım; kod-haritasi §4) basılır.
  Döngü uzunluğu nefes döngüsüne tam eşittir (ör. 4/6 için 10,000 sn = 441.000 örnek). Motor bunu örnek hassasiyetinde
  döngüler ve "al" / "ver" mikro-klipleri döngü sınırlarına oturur. Bordun durağandır, belirgin melodik motif taşımaz.
  Dosya başına ≈ 0,1–0,2 MB.
- **Son işlem** (`app/design/yoga/master_bed.py`, design/dalga-uyku/master.py:1-6 kalıbı): çembersel filtre (dikiş
  yok), yüksek geçiren 150 Hz (VARSAYIM; uyku müziği 300 Hz kullanıyor ama o konuşmasız), 1,5–4 kHz'de 3–6 dB çukur
  (konuşmaya yer açmak için; teslim §2.4, VARSAYIM), **yatak ana seviyesi −24 LUFS**, ≤ −1,5 dBTP. Motor bu seviyeyi
  kısık düzeye (−9 dB) ya da pencere düzeyine (−3 dB) çeker (§D.4).
- **Döngü dikişi:** MP3/AAC başındaki ~50 ms boşluk (HATA_GUNLUGU.md:556, kod-haritasi §2.7) 8 sn'lik çapraz geçişin
  altında kalır; bu yüzden WAV zorunlu değil. Bordun ise örnek hassasiyetinde döngülendiği için WAV ya da CAF olur
  (boşluksuz döngü).
- **Hoparlör dersi:** Bug 20/22'nin kök nedeni enerjinin 300 Hz altında olmasıydı (kod-haritasi §2.7). Yatak ölçütü:
  300 Hz altı ≤ %10, 500 Hz–4 kHz ≥ %40 (VARSAYIM; uyanma-sesleri README'deki Dalga profili 300 Hz altı ≤ %5 ve
  500 Hz–4 kHz ≥ %50 arıyor; yatak konuşmaya yer açmak için bundan biraz ayrılır).
- **Binaural katman yok** (hoparlörde anlamsız; kanıt karışık: Ingendoh 2023, PMID 37205669, DOI
  [10.1371/journal.pone.0286023](https://doi.org/10.1371/journal.pone.0286023)).

### D.4 Karışım (motorda, çalışma anında)

Üç mutlak düzey (hepsi kısa süreli LUFS, 3 sn pencere; VARSAYIM). Gece dersinde hepsi 2 dB aşağıda.

| Değer | Hedef | Dayanak |
|---|---|---|
| Konuşma | −18 LUFS (klip) | teslim K5, VARSAYIM |
| Kısık yatak: konuşma sırasında ve 20 sn'den kısa boşluklarda | ≈ −33 LUFS (konuşmanın 15 dB altı) | Lee 2022: konuşma dinlerken kabul edilen arka plan ortalama 7,2 dB aşağıdaydı (12 konuşmacılı uğultu; PMID 34759206, DOI [10.1097/AUD.0000000000001157](https://doi.org/10.1097/AUD.0000000000001157)); telefon hoparlörü ve yaşlı dinleyici payı → **VARSAYIM** |
| Sessiz pencerede yatak (duyurulu, ≥ 20 sn) | ≈ −27 LUFS (kısık düzeyden +6 dB), çıkış ve iniş rampası ≥ 2 sn | teslim K3; Bernardi 2009 kreşendo yönü |
| Doğa katmanı müzikle birlikte çalarsa | ikisi de 3 dB aşağı; toplam yukarıdaki düzeyleri aşmaz | VARSAYIM |
| "Sessizlik" arka planı | oda sesi −55 … −60 dBFS RMS | §D.2 |
| **Kısma kuralı** | Rehberli bloklarda yatak **kısık kalır**; eylem payı ve nefes payı boşluklarında (< 20 sn) kalkmaz. Yatak yalnız duyurulan ve ≥ 20 sn süren pencerelerde kalkar: pencere başlarken 2 sn'de yükselir, pencere bitmeden 3 sn önce inmeye başlar ve dönüş cümlesinden 1,5 sn önce kısık düzeydedir | CRITIQUE #8; VARSAYIM. Böylece müzik her cümlede inip kalkmaz |
| Kazanç değişimi sınırı | herhangi bir 60 sn'lik pencerede en çok 2 yatak düzeyi geçişi (bir yükseliş + bir iniş) | qa.py ölçütü (§D.6), VARSAYIM |
| Konuşma ↔ müzik kaydırıcısı | kişi ±6 dB oynatabilir, varsayılan 0 | pazar.md §6.1 (Headspace) |
| Ders geneli | gündüz −18 LUFS ±1, gece −20 LUFS ±1; gerçek tepe ≤ −1,5 dBTP; iki ses arasında ±1 LU. Göreli kapılama yüzünden bu değeri konuşma belirler | teslim K5, VARSAYIM |
| Başlangıç | ses 3 sn'de açılır; sistem ses düzeyine dokunulmaz | dalgaAudio.js:296 kalıbı; güvenlik §11.D-7 |

### D.5 Biçim, bit hızı ve boyut
- **Arşiv (depoya girmez; sahibin Mac'inde ve bulut depolamada iki kopya):** yol A'da konuşma 44,1 kHz 16 bit mono WAV
  (`pcm_44100` erişimi yoksa ElevenLabs'in verdiği en yüksek MP3). Yol B'de ElevenLabs'in MP3 dosyaları. Yataklar
  44,1 kHz stereo WAV. Kütüphane sesinin kaldırılma riskine karşı (§F.2 Aşama 0) 10 dersin sesi sınırlı bir zaman
  penceresinde üretilir ve arşiv tamamlanmadan üretim bitmiş sayılmaz.
- **Uygulama:** konuşma AAC-LC mono 48 ya da 64 kbit/sn (M4A); yataklar AAC-LC stereo 64–96 kbit/sn; doğa MP3 (döngülü
  SFX yalnız MP3); bordun ve oda sesi WAV/CAF. AAC bu ortamda üretilemez (ffmpeg ve afconvert yok; kod-haritasi §4); Mac'te
  `afconvert` ile üretilir (doğrulanmadı). Yedek: MP3 128 mono (bugünkü biçim; lameenc burada var). 48 ile 64 arasında
  ve yatak bit hızında seçim pilotta kör dinlemeyle yapılır.
- **Boyut tahmini** (10 ders × 2 ses; her ses bütün klipleri okur, genişletme klipleri dahil). Konuşma süresi = benzersiz
  hece ÷ o sesin klip brüt hızı (§B.4.1). Metin yola göre ölçeklendiği için toplam konuşma süresi yoldan neredeyse
  bağımsızdır. Hepsi VARSAYIM:

| Senaryo | Benzersiz metin / ders | Konuşma, iki ses, 10 ders | AAC 48 | AAC 64 | MP3 128 (bugünkü) |
|---|---|---|---|---|---|
| Yol A · REST hız ≈ 0,8 | 3.505 hece | ≈ 284 dk | ≈ 102 MB | ≈ 136 MB | ≈ 273 MB |
| Yol B · MCP `eleven_v4` | 3.762 hece | ≈ 283 dk | ≈ 102 MB | ≈ 136 MB | ≈ 272 MB |
| v2 varsayılan | 4.403 hece | ≈ 281 dk | ≈ 101 MB | ≈ 135 MB | ≈ 270 MB |

| Diğer katman | Süre | Boyut |
|---|---|---|
| Yataklar: ders başına 120 + 180 + 4 × 180 sn; uyku dersine ek 4 × 180 sn | 10.920 sn (182 dk) stereo | AAC 64: ≈ 87 MB · AAC 80: ≈ 109 MB · AAC 96: ≈ 131 MB |
| Doğa: 5 tür × 4 × 30 sn + 12 kuş çağrısı × ~4 sn + 2 oda sesi × 30 sn | ≈ 708 sn | MP3 128: ≈ 11 MB |
| Nefes bordunları (≈ 6 dosya) | kısa döngüler | ≈ 1 MB |

  **Toplam ek ≈ 200–280 MB.** Alt uç: konuşma AAC 48 + yatak AAC 64. Üst uç: konuşma AAC 64 + yatak AAC 96. Bugünkü ham
  paket ≈ 81 MB (kod-haritasi §5). Sürüm 1'deki "125–215 MB" konuşmayı saniyede 2,8 hece varsayıyordu ve yatakları
  tekrarlı 150 sn'lik döngüler sayıyordu; iki varsayım da düzeltildi. Artış çoğunlukla tekrarsız müzikten gelir.
  Azaltma yolları §G2'de (ör. ikinci sesi indirmek, yatakları uygulamanın kendi motoruna bırakmak).
- Ölü yük temizliği (öneri): iOS'ta çalınmayan `public/sleep/sakin-fade-*.mp3` ≈ 7,6 MB (kod-haritasi §8.3).

### D.6 Nesnel kalite denetimi (`app/design/yoga/qa.py`; design/uyanma-sesleri/analyze.py üslubu: her ölçüm + eşik, biri geçmezse çıkış kodu 1)

**Klip düzeyi** (her klip, her ses):
- **Yazıya geri çevirme** (ElevenLabs Scribe) sonrası metinle **normalleştirilmiş tam eşleşme.** Normalleştirme
  kuralları: Türkçeye uygun küçük harf (İ → i, I → ı); noktalama, üç nokta, uzun çizgi ve tırnak silinir; kesme işareti
  silinir ("Ahmet'in" → "ahmetin"); düzeltme işareti her iki tarafta kaldırılır (â → a, î → i, û → u); transkriptteki
  rakamlar Türkçe sözcüğe çevrilir ("10" → "on"; 0–100 arası küçük bir işlevle); boşluklar teke indirilir. Bu
  kurallardan sonra kalan her fark bir **insan kararına** gider: kişi klibi dinler ve "yeniden üret" ya da "doğru okunmuş,
  transkripsiyon farkı" der. Otomatik yeniden üretim yoktur; böylece yanlış alarm maliyeti şişirmez.
- **Yeniden üretim tavanı:** klip başına en çok 3 deneme (ilk + 2 yeniden; yol B'de her deneme 2–3 okumadır). Üçüncüde
  de geçmezse metin Türkçe editörle yeniden yazılır (ör. telaffuzu zor sözcük değiştirilir). "Sormadan yinele" kuralı
  (SAHIP_ISTEKLERI #3) bu tavanla uygulanır.
- **Artikülasyon hızı** §C.2 bandında ve evre hedefinde. Ölçüm: hece sayısı metinden (Türkçede ünlü sayısı), konuşma
  süresi 150 ms'den uzun duraklamalar çıkarılarak (VARSAYIM).
- **F0** ortalaması ve yayılımı aynı sesin düz okumasından düşük ve dar (Diel 2025). F0 aracı (pyin ya da Praat) bu
  ortamda **doğrulanmadı**.
- **Klipler arası süreklilik** (ayrı isteklerle üretildikleri için): ardışık iki klipte, öncekinin son ve sonrakinin ilk
  500 ms'lik konuşma bölümünde F0 ortalaması farkı ≤ 1,5 yarım ton ve tını uzaklığı (MFCC ortalamaları arasındaki fark)
  pilotta konan eşiğin altında (VARSAYIM). Aşan çift dinlenir; gerekirse ikinci klip yeniden üretilir.
- Baş kesikliği yok (ilk 30 ms'de sıfırdan yükselen zarf), son kesikliği yok (son 10 ms < −40 dBFS).
- Tık yok (analyze.py `clicks_db` kalıbı, 10 kHz üstü kısa tepe), DC < 1e-4, kırpılma yok; −18 LUFS ±0,5 (1 sn'den
  kısa kliplerde RMS eşleşmesi ±1 dB), ≤ −1,5 dBTP.
- Islıklı ses oranı (5–9 kHz enerji payı) eşiği aşmıyor (eşik pilotta konur).

**Yatak ve doğa düzeyi:**
- Tempo ölçümü (başlangıç tespitiyle): istemdeki tempo hissine yakın ve belirgin vuruş yok. Nefesle eşleşme iddia
  edilmez.
- **Tekrarsızlık (özilinti):** motorun kurduğu 30 dk'lık müzik izinde, 20 sn ile 10 dk arasındaki gecikmelerde
  normalleştirilmiş özilinti tepesi ≤ 0,5 (VARSAYIM). Kuş katmanında aynı çağrı 2 dk içinde iki kez yok.
- Döngü dikişinde tık yok; 20 ms'den uzun boşluk yok; mono uyumu.

**Plan düzeyi** (her ders × 5, 7, 10, 12, 15, 20, 23, 30 dk × iki ses; çevrimdışı tam karışım basılır):
- Toplam = hedef ±1 sn; Varış ve Kapanış eksiksiz; kesilen klip yok; üst üste binme yok.
- Hiçbir boşluk sınıf sınırını aşmıyor (pencere ≤ 90 sn; Ders 4'te ≤ 45 sn); 20 sn'yi aşan her boşluk duyurulu.
- Konuşma anlarında konuşma − yatak ≥ 15 dB; pencerede yatak ≤ kısık düzey + 6 dB, rampa ≥ 2 sn; kreşendo yok
  (10 sn pencerede müzik yüksekliği tekdüze artmıyor).
- **Kazanç değişimi:** herhangi bir 60 sn'lik pencerede en çok 2 yatak düzeyi geçişi.
- Ders geneli LUFS ve gerçek tepe hedefte.
- **Anlaşılırlık vekili:** tam karışım (müzikli) yazıya geri çevrilir; sözcük hata oranı ≤ %2 (VARSAYIM). Aynı test
  **hoparlör benzetimiyle** tekrarlanır (350 Hz yüksek geçiren + 8 kHz alçak geçiren; README'deki "350 Hz yüksek
  geçirende kayıp" fikri).
- Konuşma anlarında 1–4 kHz bandında konuşma ile müzik arasındaki fark ≥ 15 dB (VARSAYIM).

**İnsan düzeyi:**
- **Kör dinleme paneli:** en az 5 dinleyici; en az biri 65 yaş üstü, en az biri meditasyona yeni başlamış, iki cinsiyet
  de var. Kimlerin olacağı sahibin kararı (§G10). Her sürüm için 1–10 doğallık, sakinlik ve anlaşılırlık puanı verilir;
  ortalama ≥ 8 ve hiçbir puan < 6 olmalı (VARSAYIM). Eşik altında kalan klip ya da karışım yeniden yapılır.
- Cihaz: iPhone hoparlörü + kablolu kulaklık + AirPods; sessiz oda + beyaz gürültülü oda.

---

## E. Uygulama tasarımı

### E.1 Ekranlar
1. **Yoga kütüphanesi.** Üstte "Kaldığın yerden" kartı (yarım kalan ders; aşağıda). 10 ders kartı: başlık, alt başlık,
   günün saati simgesi (gündüz/gece), duruş simgesi (oturarak/uzanarak), varsayılan süre, dersin vurgu rengi (§E.2).
   Süzgeç çipleri: Gündüz · Gece · **5 dakikalık**. Saat 21:00'den sonra Uykuya Geçiş en üste çıkar (VARSAYIM saat).
   İlk girişte güvenlik kartı bir kez gösterilir (güvenlik §11.A metni aynen). Kilit ve onay kutusu yoktur; bu,
   Safety.jsx:7-9'daki "soru değil, bilgi … işaret kutusu ve kilit yok" kararıyla tutarlıdır (bu satırlar sürüm 2'de
   d515702'de yeniden okundu).
2. **Ders ayrıntısı + ZAMANLAYICI.** Başlık, tek satır söz, "Bu derste" üç madde. **Süre seçici** ekranın merkezindedir:
   büyük dakika sayısı, altında 5–30 kaydırıcı (1 dk adım) ve 5 · 10 · 15 · 20 · 30 çipleri. Dersin varsayılanıyla
   açılır, son seçim hatırlanır (Calm'da bu özellik kaldırılınca şikâyet geldi: pazar.md §9-1). Seçici değiştikçe hemen
   altında o sürenin **bölüm şeridi** canlı güncellenir ("Varış · Beden dolaşımı · Nefes · Kapanış") ve ne değiştiği
   görünür (ör. 15'e çıkınca "Zıtlık çiftleri eklendi"). Ayrıca: ses (Neslihan / Hakan), arka plan (Müzik / Doğa /
   Sessizlik), konuşma ↔ müzik dengesi, duruş cümlesi, "Kaynaklar" kartı (FACTS kalıbı: dalga.js:119-131). "Başla"
   düğmesinin hemen üstünde tek satır: **"Araç kullanırken dinleme."** (uyku dersinde ikinci satır: "Bu dersten hemen
   sonra araç kullanma."; güvenlik §11.E). Uyku dersinde ek ayar: müzik kuyruğu 0 / 5 / 10 / 20 dk.
3. **Önce puanı:** 1–10 düğmeleri, "Atla" var. Dalga'nın puan bileşeni yeniden kullanılır (Dalga.jsx:45-53;
   lib/dalga.js:14 `RATE_MAX = 10`). Uyku dersinde bu ekran yoktur.
4. **Oynatıcı** (§E.2). Denetimler 5 sn sonra kaybolur, dokununca döner: kalan süre (motordan), ince bölüm çizgisi
   (sarma), Duraklat, "Kapanışa geç" (uyku dersinde **"Uykuya geç"**), X. Oynatıcı ekranı açık tutmaz (§B.5).
5. **Sonra puanı** + isteğe bağlı "Ders sırasında zorlandın mı? Hayır / Biraz / Çok" (güvenlik §11.F). "Çok" cevabına
   sabit metin gösterilir; veri telefonda kalır ve puan olarak gösterilmez.
6. **Tamamlandı.** Dinlenen dakika, ulaşılan bölüm, önce → sonra, "Bu derse neden böyle kurduk" kaynak kartı, bir
   sonraki öneri (zorlandıysa aynı dersin daha kısa ve gözleri açık sürümü). Yarıda bırakılan ders bu ekranı göstermez;
   yalnız "Kaldığın yerden" kartına düşer.
7. **Durdurma ekranı** (§B.5).
8. **Sabah sorusu kartı (yeni).** Önceki akşam Uykuya Geçiş dinlenmişse, ertesi gün uygulama ilk açıldığında ve saat
   12:00'ye kadar Ana sayfanın üstünde tek kart: "Dün gece uykuya dalmak ne kadar kolaydı?" 1–10 ve "Atla". 12:00'den
   sonra kart kendiliğinden kalkar ve o gece için veri boş kalır. Cevap `yoga-uyku-dalma` metriğine yazılır (§E.4).

**"Kaldığın yerden" kaydı:** `{ lesson, targetSec, voice, bg, musicTail?, planVersion, contentHash, seed, positionSec,
eventIndex, savedAt }`. Planlayıcı belirlenimci olduğu için (§B.3 adım 7) bu kayıt aynı planı yeniden kurar ve ders o
olayın, yani o klibin başından sürer. `contentHash` değişmişse (ders metni ya da sesi güncellenmiş) ders baştan başlar
ve kart bunu söyler: "Bu ders güncellendi; baştan başlayacak." Kayıt 7 gün sonra silinir (VARSAYIM).

Önce tasarım Artifact'ı, onaydan sonra kod (ANA_BELGE.md:51-52, kod-haritasi §8.2 N2). "Bitti" demeden önce her ekran
iki temada görülür (ANA_BELGE.md:53-56). Oynatıcının tema dışı kalması sahibin kararıdır (§G3).

### E.2 Ders içi görsel: ses, müzik ve görüntü tek zaman çizelgesinde

**Tek gerçek kaynak:** planlayıcının ürettiği olay listesi. Yerel motor bu listeyi örnek hassasiyetinde çalar ve
~20 Hz'de konumunu (`positionSec`, o anki olay kimliği) JS'ye bildirir (arka planda 1 Hz; §B.5). Görsel `Date.now` ile
değil, bu konum + cihazın bildirdiği çıkış gecikmesiyle ilerler (`AVAudioSession.outputLatency`). Bluetooth gecikmesi
ölçülmeden eşzamanlılık iddia edilmez (kod-haritasi N10). Böylece duraklatma, arama ve sarmada ses ile görüntü ayrışmaz.

**Nefes formu (her derste aynı dil, derse özgü biçim):**
- Neredeyse siyah sahnede tek, yumuşak kenarlı ışık formu. **Form yalnız söylenen nefes ipuçlarına kilitlenir:** nefes
  ipucu olan yerde (`{nefes 4/6}`) "al" mikro-klibiyle aynı anda 4 sn'de büyür, "ver" ile 6 sn'de küçülür. Ses ne
  diyorsa görüntü onu yapar. Nefes bloklarında bordunun döngüsü de aynı periyottadır (§D.3).
- **Nefes ipucu yoksa form nefes almaz.** Yalnız çok yavaş bir ışık kayması (≥ 20 sn periyot) sürer; nefes gibi
  görünmesi istenmez. Sürüm 1'deki "yatağın ~10 sn'lik cümle periyoduyla nefes alma" kaldırıldı, çünkü ElevenLabs
  Music'te tempo ayarlanamıyor.
- Sessiz pencerede form biraz daha kararır ve yavaşlar; pencere bitmeden 3 sn önce hafifçe aydınlanır (ses geri
  gelecek).
- **Evre ışığı:** Varış en aydınlık (ama yine koyu), Derinleşme daha loş, Derin en loş. Gündüz kapanışında 60–90 sn'lik
  bir "şafak" vardır: form ve zemin yavaşça ısınır ve aydınlanır (dışa dönüşe eşlik). Gece dersinde son dakikalarda form
  kehribar bir köze dönüp söner ve ekran siyah kalır (gece saatinin kehribar dili; releases.js 28 Eylül maddesi).
- **Derse özgü biçimler** (aynı gramer; §A.2.1): 1 genişleyen halka · 2 ince, yatay ufuk çizgisi · 3 sönen kor ·
  4 akan tek çizgi · 5 tek ışık noktası · 6 yükselen yarım güneş diski · 7 göğüs hizasında sıcak ışık · 8 yere yakın,
  genişleyen taban çizgisi · 9 yavaşça dağılan sis · 10 uzakta bir ışığa uzanan yol çizgisi.
- **Yasaklar:** yanıp sönme yok (DalgaVisual.jsx:4-6 ilkesi), okunacak yazı yok (gözler kapalı), ani renk geçişi yok.
  Ekran parlaklığı en fazla ~%15 bağıl (gece ~%4) (VARSAYIM).
- **Hareketi Azalt:** form ölçeklenmez; yalnız opaklığı çok yavaş değişir (DalgaVisual.jsx:23 kalıbı).
- **Erişilebilirlik:** "Altyazı" isteğe bağlıdır (varsayılan kapalı): o anki cümle altta, sönük görünür; işitme
  güçlüğü olanlar için. Ekran ile ses aynı cümleyi söyler (ANA_BELGE.md:57-59).

**Palet.** Oynatıcı zemini `#050A12` (dalga.css:52 ile aynı). Kütüphane ve ayrıntı ekranları uygulamanın jetonlarını
kullanır: açık tema zemini `#F3F6F8`, kart `#FFFFFF` (styles.css:16, :18); koyu tema zemini `#070C12`, kart `#0F171F`
(styles.css:55, :57). Her dersin iki vurgu tonu var: **koyu ton** oynatıcıdaki form ve koyu temadaki grafikler için,
**açık tema tonu** açık temadaki yazı ve simgeler için. Kontrast WCAG 2.1 formülüyle bu görevde hesaplandı
(`_plan/palette.py`). Hedef: yazı ≥ 4,5:1, grafik ≥ 3:1.

| Ders | Renk | Koyu ton | #050A12'de | #0F171F'de | Açık tema tonu | #FFFFFF'te | #F3F6F8'de |
|---|---|---|---|---|---|---|---|
| 1 Nefesin Ritmi | adaçayı yeşili | `#8CCB9E` | 10,5 | 9,6 | `#397E4C` | 4,9 | 4,5 |
| 2 Derin Dinlenme | soluk deniz mavisi | `#7EB2DD` | 8,8 | 8,0 | `#2E75B0` | 4,9 | 4,5 |
| 3 Uykuya Geçiş | kehribar | `#E3A857` | 9,5 | 8,6 | `#9B651A` | 4,9 | 4,5 |
| 4 Zor Anlar İçin | dere camgöbeği | `#6FC7C1` | 10,0 | 9,1 | `#307C77` | 4,9 | 4,5 |
| 5 Tek Nokta | soğuk ışık beyazı | `#D6E4F2` | 15,3 | 14,0 | `#4F5D6E` (arduvaz) | 6,7 | 6,2 |
| 6 Sabah Niyeti | şafak turuncusu | `#F0916A` | 8,5 | 7,7 | `#C44714` | 4,9 | 4,5 |
| 7 Kendine Şefkat | sıcak gül | `#E59AB0` | 9,1 | 8,2 | `#CB3762` | 4,9 | 4,5 |
| 8 Sağlam Yer | taş rengi | `#BCA88A` | 8,6 | 7,8 | `#836D4B` | 4,9 | 4,5 |
| 9 Kendini Tanımak | leylak | `#B59BE0` | 8,2 | 7,5 | `#8459CB` | 4,9 | 4,5 |
| 10 Gelecekteki Sen | yol altını | `#D9C76A` | 11,6 | 10,6 | `#7F7020` | 5,0 | 4,6 |

Hepsi iki temada hedefi geçiyor. Açık tema tonlarının çoğu `#F3F6F8` zemininde tam 4,5 sınırında. Bu yüzden açık temada
ders rengi yazısı kart üstünde (`#FFFFFF`) kullanılır, zemin üstünde kullanılmaz. Ders 1 ve 4 (yeşil ile camgöbeği) ve
Ders 3 ile 10 (kehribar ile altın) yan yana ayırt edilebilirlik için tasarım Artifact'ında görülerek kesinleşir; renk tek
başına bilgi taşımaz, her kartta dersin adı ve simgesi de var.

### E.3 Yerel ses motoru (N4) ve köprü (N5), özet
- **iOS: `YogaAudio` sınıfı.** Aday A: AVAudioEngine. Döngüler ve evre geçişleri için **en az 5 oynatıcı düğüm** gerekir:
  konuşma, yatak A, yatak B (çapraz geçiş), doğa A, doğa B. Bunlara ek olarak kuş çağrıları için tek atımlık bir düğüm,
  nefes bordunu için bir düğüm ve "Sessizlik" kipinde oda sesi düğümü gelir. **Her düğümün kendi karıştırıcısı**
  (AVAudioMixerNode) vardır; ana karıştırıcıda konuşma ve müzik ayrı kazanç yollarından geçer. Olaylar `AVAudioTime` ile
  planlanır. Yataklar dosyadan akışla okunur (180 sn stereo Float32 ≈ 63,5 MB belleğe çözülmez).
- **Rampalar yerelde yürür, JS'de değil.** AVAudioMixerNode'un `outputVolume` değeri için örnek hassasiyetinde yerleşik
  bir rampa API'si yok (**doğrulanmadı**). Bu yüzden kısma ve kabarma, render döngüsünde blok blok kazanç uygulayan
  küçük bir yerel katmanla ya da önceden hesaplanmış kazanç zarflarıyla yapılır. JS yalnız planı gönderir.
- **Aday B yeniden değerlendirilir:** AVMutableComposition + AVAudioMix, parça başına ses düzeyi rampalarını
  (`setVolumeRamp`) kendi zaman çizelgesinde yerleşik olarak destekler ve tek AVPlayer'la kilit ekranında sağlamdır.
  Eksisi: varyant sırası, sarma ve kaldığın yerden sürme her seferinde kompozisyonun yeniden kurulmasını ister;
  çıkış değişimindeki davranışı ayrıca denenmelidir. **Karar yöntemi:** pilotun 8. adımında (§F.2) iki aday birer günlük
  denemeyle aynı 30 dk'lık Ders 2 planını cihazda çalar. Ölçütler: kilitte 30 dk kesintisiz çalma, rampa pürüzsüzlüğü
  (qa.py ile kayıttan), çıkış değişimi ve kesintiden dönüş, sarma gecikmesi, CPU ve pil. Sonuç HATA_GUNLUGU'na yazılır.
- **Oturum:** `.playback`. `AppAudioSession`'daki `sleepActive` bayrağı "medya oturumu sahibi" diye genelleştirilir;
  yoksa ekran açılınca tercih yeniden uygulanır ve dersi susturur (FeedbackPlugin.swift:247, HATA_GUNLUGU.md:601-604;
  kod-haritasi R9). Ders, "seslendirme kapalı" tercihinden etkilenmez: anlatım dersin kendisidir (voiceCue.js:13 kuralı
  derse uygulanmaz; öneri).
- **Gözlemciler:** kesinti, rota değişimi, `AVAudioEngineConfigurationChange` ve `mediaServicesWereReset` (§B.5). Now
  Playing + uzaktan komut. Dinlenen süre UserDefaults'a da yazılır ve uygulama açılınca JS uzlaştırır (kod-haritasi R7).
- **Arka planda** konum olayları 20 Hz'den 1 Hz'e iner (§B.5).
- **pbxproj:** sınıf yeni bir dosya yerine var olan bir Swift dosyasına eklenir ve MainViewController.swift:25-35'e bir
  kayıt satırı yazılır; böylece pbxproj'a dokunulmaz (kod-haritasi §8.2 N4). Ses dosyaları `public/` klasör
  referansıyla kendiliğinden pakete girer. Sahibin Mac'indeki pbxproj çakışması önce Aşama 0'da çözülür (§F.2).
- Swift bu ortamda derlenmez; ilk doğrulama Mac'te (ANA_BELGE.md:90-91).
- Web yedeği yalnız tarayıcı önizlemesi içindir (Web Audio; kilit ekranı riski R1–R2 nedeniyle iOS'ta kullanılmaz).

### E.4 Modül kaydı (`src/modules/yoga/manifest.js`, öneri)

Sözleşme bu sürümde d515702'de doğrulandı: `effects` girdisi `key`, `label`, `measure`, `max` ve `pick` ister
(registry.js:67-69), `domain` isteğe bağlıdır (:70). `better` alanı registry açıklamasında ve doğrulamasında yok ama
progress.js okur; verilmezse "yukarı iyi" sayılır (progress.js:72, :81, :107). `metrics` girdisi `key`, `label`, `unit`,
`better: 'up'|'down'` ve `series` ister (registry.js:40, :76-78). `sessions.best` bir **işlevdir** ve sayı döndürür;
`bestLabel` ister (registry.js:49-50, doğrulama :112). Sürüm 1'deki `best: 'gün sayısı'` dizesi bu doğrulamadan geçmezdi.

```
id: 'yoga', ring: 'life', kind: 'practice', title: 'Yoga', label: 'yoga',     // ad §G8'e bağlı
home: { section: 'practice', order: 33 },        // Nefes 30, Dalga 35, Gökyüzü 36 arası (VARSAYIM)
gates: {},                                        // göz bütçesine sayılmaz
storageKeys: ['gozolcum:yoga-opts', 'gozolcum:yoga-resume'],
progress: {
  domain: 'calm',                                 // modülün tek alanı (bugünkü sözleşme; §G1)
  effects: [                                      // 1–10 puan; her ders kendi alanıyla (dalga/manifest.js:19-23 kalıbı)
    { key: 'yoga-nefes',   label: 'Yoga · Nefesin Ritmi',    measure: 'gerginlik',          max: 10, better: 'down', domain: 'calm',      pick },
    { key: 'yoga-nidra',   label: 'Yoga · Derin Dinlenme',   measure: 'beden gerginliği',   max: 10, better: 'down', domain: 'body',      pick },
    { key: 'yoga-zor',     label: 'Yoga · Zor Anlar İçin',   measure: 'duygu yoğunluğu',    max: 10, better: 'down', domain: 'calm',      pick },
    { key: 'yoga-odak',    label: 'Yoga · Tek Nokta',        measure: 'odak',               max: 10, domain: 'focus',     pick },
    { key: 'yoga-sabah',   label: 'Yoga · Sabah Niyeti',     measure: 'enerji',             max: 10, domain: 'wellbeing', pick },
    { key: 'yoga-sefkat',  label: 'Yoga · Kendine Şefkat',   measure: 'kendine yumuşaklık', max: 10, domain: 'self',      pick },
    { key: 'yoga-saglam',  label: 'Yoga · Sağlam Yer',       measure: 'sağlamlık',          max: 10, domain: 'self',      pick },
    { key: 'yoga-tanima',  label: 'Yoga · Kendini Tanımak',  measure: 'beden farkındalığı', max: 10, domain: 'awareness', pick },
    { key: 'yoga-gelecek', label: 'Yoga · Gelecekteki Sen',  measure: 'umut',               max: 10, domain: 'wellbeing', pick } ],
    // Uykuya Geçiş'in önce→sonra etkisi yok: önce puanı sorulmaz (§A.2 Ders 3)
  metrics: [ { key: 'yoga-uyku-dalma', label: 'Uykuya dalma kolaylığı (ertesi sabah)', unit: 'puan', better: 'up',
               domain: 'wellbeing', series } ] },
sessions: { match: (s) => s?.type === 'yoga', countsTowardGoal: true, describe,
            best: (sessions) => /* pratik yapılan farklı gün sayısı */, bestLabel: 'Yoga · pratik yapılan gün' },
stats(): 3 satır — son 7 günde dakika · tamamlanan ders · pratik yapılan gün,
coach(): en çok 6 alan — ders adı, süre, tamamlandı mı, önce→sonra.
```
- **Kayıt:** `{ type:'yoga', lesson, voice, bg, planned, seconds, reachedClosing, completed, before, after, delta,
  hard: 'no'|'some'|'much'|null, planVersion }` (dalga.js:99-117 `makeRecord` kalıbı). 30 sn'den kısa dinleme
  kaydedilmez (Dalga.jsx:20).
- **Tamamlandı = kapanışa (uyku dersinde uyku iznine) ulaşıldı VE dinlenen süre planlanan sürenin en az %60'ı**
  (VARSAYIM). Sarmayla doğrudan kapanışa atlayan kişi `reachedClosing: true` ama `completed: false` olur. 5 dk'lık ders
  de bu iki koşulla tamamlanmış sayılır (sakin §11.8; güvenlik §11.F).
- `effects` içindeki `pick` işlevleri `s.lesson` değerine göre çift döndürür (dalga manifestindeki gibi). `acuteEffects`
  en az 3 oturum ve %95 GA sıfırı içermiyorsa "anlamlı" der (progress.js:72-73). Kartta "Kontrol grubu yok…" notu
  (progress.js:71) kalır.
- `yoga-uyku-dalma` metriğinin `series` işlevi, sabah sorusu kartının (§E.1-8) cevaplarını tarihiyle döndürür.

### E.5 Gelişim istatistikleri
- **Pratikler kartı** (`stats`, en çok 3 satır): son 7 günde dakika, tamamlanan ders, pratik yapılan gün.
- **Ödül gün sayısıdır, süre değil.** Süre rekoru yok. Bu, gözetimsiz ve aşırı pratik vakalarıyla tutarlıdır (güvenlik
  §4); tekrarın uzunluktan daha çok önemli olduğunu gösteren veri de daha fazladır (sakin §8 sonucu). Rekor kutusu
  (`best`) pratik yapılan farklı gün sayısını gösterir.
- **Alan kartları:** her dersin önce → sonra etkisi kendi alanına düşer (registry.js:154 alan geçersiz kılma;
  kod-haritasi §1.1). Metin: "Son 6 oturumda ortalama −1,8 puan (GA …). Kontrol grubu yok; dinlenmenin ve beklentinin
  etkisi ayrılamaz." "Stresini azalttı", "bilimsel olarak kanıtlandı" gibi cümle yok (Larsen 2019: 73 uygulama
  açıklamasının %64'ü etkinlik iddia etti; PMID 31304366, DOI
  [10.1038/s41746-019-0093-1](https://doi.org/10.1038/s41746-019-0093-1)).
- **28 günlük düzen dilimi** bugün modülün tek alanını sayıyor (dataHub.js:36-38; kod-haritasi §1.3). Her dersin kendi
  dilimine düşmesi için sözleşme değişikliği gerekir (§G1).

### E.6 "Usta hoca" ölçütleri (metin ve dinleme incelemesinde işaretlenir)

Kanıt bu ölçütlerin çoğunu doğrudan sınamadı; bunlar ustalığı **denetlenebilir** kılmak içindir. Her madde evet/hayır
diye işaretlenir; tek "hayır" metni yeniden yazdırır. İşaretleyen: usta hoca incelemecisi (§C, §G10).

1. **Zaman verir:** her yönergeden sonra istenen eylemin süresi + en az 2 sn boşluk var (ör. "omuzlarını
   bırakabilirsin" → ≥ 4 sn). Bu yüzden hiçbir çekirdek blok 0:55'ten kısa değil (§B.3 adım 8).
2. **Sessizliği kullanır:** her blokta en az bir bilinçli sessizlik var; 5 dk sürümde bile en uzun boşluk ≥ 8 sn.
3. **Sessizliği korur:** 20 sn'yi aşan her sessizlikten önce duyuru, sonra dönüş cümlesi var; hiçbir pencere sınırı
   aşmıyor.
4. **Somut beden dili:** duyum sözcükleri somut (sıcaklık, ağırlık, temas, basınç, akış); belirsiz "enerji" yok.
5. **Tutarlı yön:** beden dolaşımı her derste aynı sırada; sağ ve sol karışmıyor.
6. **Dolgu yok:** "şimdi", "sadece", "hafifçe", "yavaşça" her biri dakikada en çok bir kez; aynı sözcük art arda iki
   cümlede (bilinçli tekrar dışında) yok.
7. **Anlatmaz, yaşatır:** pratik sırasında açıklama cümlesi blok başına en çok bir (Levin 2012).
8. **Tek imge yayı:** her dersin tek bir imgesel yolculuğu var (§A.2.1); ani kırılma yok.
9. **Davet dili:** güvenlik ve beden yönergeleri dışında emir kipi yok.
10. **Başarısızlığı normalleştirir:** zihin dağılması ya da gevşeyememe için en az bir cümle.
11. **Çıkış kapısı:** açılış cümlesi var; 30 dk'da ortada tekrar ediliyor; her zor bloktan önce dayanak var.
12. **Kapanış ritüeli:** gündüzde nefes → parmaklar → gerinme → gözler → oda → yana dön → otur; gecede uyku izni.
13. **Azalan anlatım:** evreden evreye boşluklar uzuyor, cümleler kısalıyor ve seviye alçalıyor; yol A'da ölçülen hız da
    azalıyor (Knowlton 2006). Gündüz kapanışında geri çıkıyor.
14. **Doğal hız:** klip içi artikülasyon §C.2 bandında (5,0–6,8 hece/sn; VARSAYIM); sözcük uzatılmamış; yavaşlık klipler
    arası sessizlikten geliyor.
15. **Ses–müzik:** konuşma anında müzik ≥ 15 dB aşağıda; kör dinlemede "müzik sözü örtüyor" diyen yok; müzik cümle
    başına inip kalkmıyor.
16. **Kusursuz Türkçe:** Türkçe editör incelemesinden çıktı; geri çevirmede normalleştirilmiş tam eşleşme var; yanlış
    vurgu yok.
17. **Benzersizlik:** açılış cümlesi (ortak güvenlik cümlesi dışında), anahtar cümlesi, imgesi, müziği ve görsel biçimi
    başka hiçbir derste yok (§A.2.1).
18. **Yasak liste temiz** (§C.6) ve güvenlik §11.B'nin 18 kuralı işaretli.

### E.7 Yol haritası maddesi (YAPILACAKLAR.md için hazır metin)

```
N. [ ] **Yoga bölümü (10 sesli ders, 5–30 dk her dakika).** Plan: scratchpad PLAN.v2.md → docs/yol-haritasi/YOGA.md.
   Kural: bir ders ancak metni 3 insan incelemesinden (Türkçe editör; güvenlik 18 kural, Ders 4 ve 7'de psikolog; usta
   hoca 18 ölçüt) geçip, klipleri normalleştirilmiş tam eşleşmeyle doğrulanıp, karışımı qa.py'den geçip, cihazda kilitli
   ekranda 5 ve 30 dk çalıp sahibi onaylayınca [x] olur.
   1. [ ] Aşama 0: pbxproj çakışması (PLAN.v2 §F.2 adımları), sahip kararları (§G1–G11), kütüphane sesi lisansı,
          ses yolu (REST anahtarı ortam sırrı olarak ya da yalnız MCP), inceleyiciler.
   2. [ ] Seslerin eğitilmesi: seçilen yolun ayar ya da seçim döngüsü, telaffuz listesi, kör dinleme (§D.1.4).
   3. [ ] Pilot: Ders 2 "Derin Dinlenme" metni (kısa/uzun Varış-Kapanış, bütün bloklar, genişletme klipleri), 3 inceleme.
   4. [ ] Pilot ses: iki ses, klipler + yataklar (1 + 1 + 4 varyant) + rüzgâr ve yaprak (4 varyant; su katmanı sahip kararıyla); qa.py raporu
          (5/7/10/12/15/20/23/30 dk, iki ses).
   5. [ ] Tasarım Artifact'ı: kütüphane, ayrıntı + zamanlayıcı, oynatıcı (gerçek pilot sesiyle eşzamanlı görsel), bitiş,
          sabah sorusu kartı, iki tema.
   6. [ ] Planlayıcı lib/yoga.js + testler (her ders × her dakika × iki ses; üç hız senaryosu; 30:00'a sınır aşmadan).
   7. [ ] YogaAudio yerel motor (aday A ve B birer günlük deneme), Now Playing, kesinti, rota, yapılandırma değişikliği
          ve medya hizmetleri sıfırlanması gözlemcileri. Cihaz testleri: kilit, arama, sessiz tuş, hoparlör ve kulaklık,
          ders ortasında AirPods takma ve çıkarma, araç Bluetooth'una geçiş, Denetim Merkezi'nden çıkış değiştirme,
          AirPods'ta 90 sn sessizlikten sonraki ilk hece, ekranın kendiliğinden kilitlenmesi, 5 ve 30 dk, iki ses →
          HATA_GUNLUGU.
   8. [ ] Modül + Gelişim bağlantısı (manifest, effects, uyku metriği ve sabah kartı, stats, best işlevi).
   9. [ ] Kalan 9 ders (3'lü partiler; her parti 2–7. adımların ses ve metin kısmını tekrarlar).
```
ENVANTER_VE_PLAN.md'ye "## 20. Yoga (tarih, Build — durum)" bölümü aynı düzenle açılır (kod-haritasi §7).

### E.8 Sürüm notu maddesi (releases.js; yalnız cihazda doğrulanmış sürümde eklenir)

```
{ kind: 'new', text: 'Yoga: 10 sesli ders (Nefesin Ritmi, Derin Dinlenme, Uykuya Geçiş, Zor Anlar İçin, Tek Nokta, Sabah Niyeti, Kendine Şefkat, Sağlam Yer, Kendini Tanımak, Gelecekteki Sen). Her dersi 5 ile 30 dakika arasında istediğin sürede dinleyebilirsin; kısa sürüm de karşılamayla başlar ve kapanışla biter, süre dolduğunda hiçbir cümle yarıda kalmaz. Neslihan ya da Hakan anlatır; müzik, doğa sesi ya da sessizlik seçebilirsin. Ekran kilitliyken de çalar. Neye dayandığı ve sınırları her dersin "Kaynaklar" kartında.' }
```
(biçim: releases.js:1-4; `kind: 'new'|'fix'|'change'`). Bölümün adı §G8 kararına göre değişirse ilk sözcük de değişir.

### E.9 Ücretli / ücretsiz sorusu (sahibe)
Bugün bütün uygulama tek `premium` yetkisinin arkasında ve modül sözleşmesinde premium alanı yok (kod-haritasi §6:
subscription.js:12, App.jsx:763-774). Soru: Yoga da bu kapının arkasında mı kalsın, yoksa bir ders (öneri: Nefesin
Ritmi, 5 dk) deneme bittikten sonra da açık mı olsun? Öneri §G4'te.

---

## F. Maliyet ve aşamalı üretim

### F.1 ElevenLabs kredisi

**Birimler ve dürüst sınırlar:**
- "1 USD = 5.500 kredi" oranı **bu oturumdaki MCP çalışma alanının** tahmin yanıtlarından gelir (elevenlabs.md §6.1).
  Yol A (REST) üretimi sahibin ElevenLabs aboneliğinin kredisinden düşer. Hesabın katmanı, aylık kotası ve kredinin
  gerçek fiyatı **doğrulanmadı**. Bu yüzden asıl birim kredidir; USD yalnız kıyas içindir.
- TTS ≈ 1 kredi/karakter (MCP tahmini, v2, v3 ve v4'te aynı). REST'te karakter başına kredi doğrulanmadı. Resmî API liste
  fiyatı başka bir kanaldır: v2 ve v3 1.000 karakter başına 0,08 USD, v4 0,022 USD ("12 Ekim'e kadar %72 indirim")
  (elevenlabs.md §6.1).
- `pcm_44100` çıktısı Pro katman ister; yoksa `mp3_44100_192` (Creator) ya da `mp3_44100_128` kullanılır (§D.1.2).
- Müzik: MCP tahmini "3 dakika" istemi için 1.650 kredi verdi, ama bu süresi bilinmeyen varsayılan bir üretime ait
  (elevenlabs.md §6.1). 180 sn'lik parçanın gerçek kredisi **doğrulanmadı**. Ücretsiz doğrulama yolu: düğüme
  `duration_seconds: 180` yazıp `estimate_only` ile tahmin istemek; akışı değiştirdiği için sahibin onayı gerekir. API
  liste fiyatı dakika başına 0,15 USD.
- Doğa: belgedeki kural 40 kredi/sn; tahminle doğrulanmadı.
- **Scribe** (yazıya geri çevirme) maliyeti **doğrulanmadı**; aşağıdaki toplamlara ayrıca eklenir.

**Varsayımlar:** karakter = hece ÷ 2,8 × 7,19–8,0 (elevenlabs.md §6.2; C.8 örneğinde hece başına 2,76 karakter
ölçüldü, bu aralığın içinde). Yol A'da klip başına ortalama 1,3–1,6 deneme (tavan 3). Yol B'de pilotta en iyi 3 okuma
ve %20 yeniden üretim (×3,6), üretimde 2–3 okuma (×2,4–3,6). Müzik parçası başına 2–3 aday. Hepsi VARSAYIM; hesap
`_plan/cost_v2.py`.

| Kalem | Yol A · REST | Yol B · MCP `eleven_v4` |
|---|---|---|
| Pilot (Ders 2) konuşma, iki ses | 24k–33k | 72k–80k |
| Seslerin eğitilmesi (§D.1.4; yalnız pilotta) | ≈ 34k (ızgara iki tur + model karşılaştırması + telaffuz) | ≈ 22k (model seçimi + biçim denemeleri) |
| Pilot yatakları (1 + 1 + 4 parça × 2–3 aday) | 20k–30k | 20k–30k |
| Pilot doğa (rüzgâr ve yaprak 4 × 30 sn × 2 aday; su katmanı üretilirse + ≈ 10k, sahip kararı) | ≈ 10k | ≈ 10k |
| **Pilot toplam** | **≈ 87k–106k** (≈ 16–19 USD) | **≈ 123k–141k** (≈ 22–26 USD) |
| 10 ders konuşma, iki ses (karakter/ses: A 90k–100k, B 97k–107k) | 234k–320k | 464k–774k |
| 10 ders yatakları (64 parça × 2–3 aday) | 211k–317k | 211k–317k |
| 10 ders doğa (708 sn × 2 aday) | ≈ 57k | ≈ 57k |
| **Hepsi (pilot dahil)** | **≈ 536k–728k** (≈ 97–132 USD) | **≈ 753k–1,17 milyon** (≈ 137–213 USD) |
| Hepsi, yataklar uygulamanın kendi motorundan gelirse (§G9) | ≈ 325k–411k (≈ 59–75 USD) | ≈ 542k–852k (≈ 99–155 USD) |

USD değerleri MCP çalışma alanı oranıyladır. API liste fiyatıyla yataklar tek başına ≈ 55–82 USD tutar
(182 dk × 2–3 aday × 0,15 USD).

**Bütçe tavanıyla uzlaştırma (§G5):**
- Sürüm 1'deki ~100 USD tavanı, yol A'da ancak yataklar uygulamanın kendi motorundan gelirse ya da yatak başına aday
  sayısı 2'ye inerse karşılanır. Yol B'de tavanı aşar.
- Öneri: **pilot tavanı 25 USD karşılığı kredi.** Pilotta gerçek tüketim (deneme oranı, müzik kredisi, Scribe maliyeti)
  ölçülür; 10 dersin tavanı bu ölçümle yeniden kurulur ve sahibe sorulur.
- Aylık kota yetmezse üretim fatura aylarına bölünür (3'lü partiler zaten buna uygun, §F.2). Kütüphane sesinin
  kaldırılma riskine karşı bütün partilerin en çok 2 fatura ayı içinde üretilmesi önerilir (VARSAYIM).
- **Yeniden üretim tavanı:** klip başına en çok 3 deneme; sonra metin yeniden yazılır (§D.6). Tavan "sormadan yinele"
  kuralının maliyetini sınırlar.
- MCP ile üretimde `generations_count` bilinçli seçilir: verilmezse varsayılan 4'tür ve maliyet 4 katına çıkar.
- elevenlabs.md'nin boş akışı (`C2klJLqoOq4YwTw08blb`, 10 çalıştırılmamış düğüm) panelden silinebilir; maliyeti yok.

### F.2 Aşamalar

**Aşama 0: ön koşullar (sahip ve ben; hiçbiri ses üretmez).**

1. **pbxproj çakışması (sahibin Mac'i).** Sahibin terminali şu an bir `git stash pop` çakışmasında:
   1. `git diff app/ios/App/App.xcodeproj/project.pbxproj` ile işaretler görülür. Stash pop'ta "Updated upstream"
      bölümü ours (HEAD), "Stashed changes" bölümü theirs (zuladaki değişiklik) olur.
   2. İki taraf farklı girdiler eklediyse işaretler silinir ve iki taraf da korunur. Zuladaki değişiklik yalnız Xcode'un
      kendiliğinden yaptığı bir SwiftPM değişikliğiyse `git checkout --ours app/ios/App/App.xcodeproj/project.pbxproj`
      kullanılır.
   3. `plutil -lint app/ios/App/App.xcodeproj/project.pbxproj` çalıştırılır; "OK" görülünce
      `git add app/ios/App/App.xcodeproj/project.pbxproj`.
   4. `npx cap sync ios` ve Xcode derlemesi başarılı olduktan sonra `git stash drop`. (Çakışma çözülmeden zula
      düşürülmez; stash pop çakışmada zula zaten silinmez.)
   5. `app/build-dev/` ve `…/project.xcworkspace/xcshareddata/swiftpm/` izlensin mi, yok mu sayılsın: sahibin kararı
      (§G11).
2. **§G kararları** (11 madde).
3. **Kütüphane sesleri:** Neslihan ve Hakan ElevenLabs kütüphanesindeki "professional" seslerdir (elevenlabs.md §2.5).
   Ticari bir uygulamada kullanım koşulları ve sesin kütüphanede kalıp kalmayacağı **doğrulanmadı**. Pilottan önce
   sahibin hesabındaki koşullardan doğrulanır. Kaldırılma riskine karşı 10 ders sınırlı bir zaman penceresinde üretilir
   ve arşiv tutulur (§D.5). İstenirse Voice Design ile tasarlanan bir ses bu riski ortadan kaldırır (§G6).
4. **Ses yolu:** yol A seçilirse sahip anahtarı bulut ortamının sırrı olarak ekler (§D.1.2). Anahtar sohbete yazılmaz.
   Yol B seçilirse bu adım yoktur.
5. **İnceleyiciler** (§G10): Türkçe editör, usta hoca, psikolog ve kör dinleme paneli adlarıyla belirlenir.

**Aşama 1: tek pilot ders, tam üretim ve ölçüm: Ders 2 "Derin Dinlenme".**
1. **Seslerin eğitilmesi** (§D.1.4): seçilen yolun ayar ya da seçim döngüsü, telaffuz listesi, kör dinleme. Evre
   ayarları ya da metin biçimi kuralları sabitlenir.
2. **Metin:** bütün bloklar, kısa ve uzun Varış ile Kapanış, köprüler, genişletme klipleri. Uzunluk §B.4.1'deki bütçeye
   göre. Üç insan incelemesi (§C).
3. **Klipler:** iki ses; normalleştirilmiş tam eşleşmeyle doğrulama; yeniden üretim tavanıyla döngü.
4. **Müzik:** Varış, Kapanış ve 4 çekirdek varyantı; rüzgâr ve yaprak 4 varyant (su katmanı sahip kararıyla); master_bed.py; yatak ölçütleri. §G9 için aynı
   yataklar uygulamanın kendi motoruyla da basılır ve kör dinlemede karşılaştırılır.
5. **Karışım:** Python ile çevrimdışı planlayıcı + karıştırıcı (motorun kurallarının aynısı); 5/7/10/12/15/20/23/30 dk ×
   iki ses; qa.py raporu. Hepsi geçmeden sahibe gitmez.
6. **Tasarım Artifact'ı:** kütüphane, ayrıntı + zamanlayıcı (bölüm şeridiyle), oynatıcı ve görsel **gerçek pilot sesiyle
   eşzamanlı** (5 dk tam karışım + 30 dk'dan bölümler; Artifact'ın 16 MB sınırına sığacak biçimde), bitiş ekranı,
   sabah sorusu kartı, iki tema.
7. Sahip dinler ve bakar. Kusur varsa sormadan düzeltilir ve yinelenir (SAHIP_ISTEKLERI.md madde 3).
8. Onaydan sonra: planlayıcı + yerel motor (aday A ve B birer günlük deneme, §E.3) + cihaz testleri (§E.7 madde 7).
   Cihazda mükemmel değilse Aşama 2 başlamaz.

**Aşama 2: kalan 9 ders, 3'lü partiler:** (1 Nefesin Ritmi, 3 Uykuya Geçiş, 5 Tek Nokta) → (4 Zor Anlar İçin,
7 Kendine Şefkat, 8 Sağlam Yer) → (6 Sabah Niyeti, 9 Kendini Tanımak, 10 Gelecekteki Sen). İlk parti gece dersini ve
nefes-görsel kilidini içerdiği için önce gelir. Her parti Aşama 1'in 2–5. adımlarını ve kör dinlemeyi tekrarlar; motor
değişmez. Her partinin kredisi başlamadan önce tahmin edilir ve kalan bütçeyle karşılaştırılır.

---

## G. Sahibin açık kararları (11)

| # | Soru | Seçenekler | Önerim |
|---|---|---|---|
| G1 | Gelişim'de her ders kendi alanını doldursun mu? | (a) Bugünkü sözleşme: modülün tek alanı (`calm`), önce→sonra etkileri ders başına kendi alanında. (b) Sözleşmeye oturum başına alan (`sessions.domainOf`) eklenir; dataHub.js:36-38 ve testler güncellenir | **Pilotta (a), 10 ders tamamlanırken (b).** Dersler açıkça farklı alanlara ait; (b) küçük bir değişiklik ama ortak dosyalara dokunduğu için pilotu bekletmesin |
| G2 | Paket mi, indirme mi? (ek ≈ 200–280 MB) | (a) Hepsi pakette. (b) 1–2 ders pakette, gerisi indirilir (Supabase Storage + `@capacitor/filesystem`; bugün yok). (c) iOS On-Demand Resources ya da Background Assets: dosyaları Apple barındırır, yeni sunucu gerekmez (bu projede ve Capacitor ile uyumu **doğrulanmadı**). (c') Yalnız kişinin varsayılan sesi pakette, ikinci ses (c) ile indirilir | **(a), konuşma AAC 48 + yatak AAC 64 (≈ 200 MB), kör dinlemede 64/96'dan ayırt edilemezse.** Çevrimdışı çalışmama en sık şikâyetlerden biri (pazar.md §6.2) ve (a) yeni altyapı riski eklemez. Pilotta IPA boyutu ölçülür; kabul edilemez çıkarsa ikinci tercih (c'). App Store hücresel indirme eşiği doğrulanmadı |
| G3 | Oynatıcı hep karanlık mı, iki temada mı? | (a) Hep karanlık sahne (Dalga ve gece saati gibi). (b) Açık temada açık oynatıcı | **(a); kütüphane ve ayrıntı ekranları iki temada.** Gözler kapalıyken ve yatakta parlak ekran dersin kendisine ters; gece saati de "tema dışı" (NightClock.jsx:6). YAPILACAKLAR.md:260 kuralına açık bir istisna olarak yazılır |
| G4 | Yoga ücretli mi? | (a) Bugünkü tek kapının arkasında. (b) Bir ders her zaman açık | **(a)**, ayrı kapı açılmaz (sözleşmede premium alanı yok, yeni altyapı ister). Deneme süresinde 10 dersin hepsi açık |
| G5 | Seslendirme yolu ve bütçe | (a) **REST API:** anahtar bu bulut ortamının sırrı olarak eklenir (başlık çubuğu → bulut ortamı → Edit → API credentials ya da `ELEVENLABS_API_KEY`); asla sohbete, depoya ya da uygulamaya girmez. Hız, kararlılık, seed, süreklilik, telaffuz sözlüğü, PCM. (b) **Yalnız MCP:** `eleven_v4`, her klipte en iyi 2–3 okuma; ayar, seed ve süreklilik yok; anahtar gerekmez. Bütçe: pilot ≈ 87k–106k kredi (a) ya da 123k–141k (b); 10 ders ≈ 536k–728k (a) ya da 753k–1,17 milyon (b) (§F.1) | **(a).** "Dünyanın en iyi hocası" standardı sabit hız, tekrarlanabilir üretim ve cümleler arası süreklilik ister; bunlar yalnız REST'te var. (a) klip başına tek üretimle daha da ucuz. **Bütçe:** pilot tavanı 25 USD karşılığı kredi; 10 dersin tavanı pilottaki gerçek tüketimle yeniden kurulup sorulur. Kota yetmezse üretim fatura aylarına bölünür. Klip başına en çok 3 deneme, sonra metin yeniden yazılır |
| G6 | "Seslerin eğitilmesi" nasıl yorumlansın? | (a) §D.1.4'teki ayar, seçim ve ölçüm döngüsü; yalnız Neslihan ve Hakan. (b) (a) + Voice Design ile bu uygulamaya özgü bir hoca sesi tasarlanır ve kör dinlemede üçüncü aday olur; tarifi ve örnek cümleyi sahip verir. (c) Gerçek bir hocanın izinli kayıtlarıyla ses klonlama (önerilmiyor: kayıt, izin ve lisans işi) | **(b).** Sahibin istediği "eğitim" somut olarak (a)'dır; bu yorum onayınıza sunuluyor. Tasarlanmış bir ses, kütüphane sesinin kaldırılma riskini de ortadan kaldırır. Kör dinlemede Neslihan ya da Hakan kazanırsa tasarlanan ses kullanılmaz. Tasarlanan sesin kullanım koşulları ve önizleme maliyeti doğrulanmadı |
| G7 | Yoga bölümüne yaş sınırı konsun mu? | (a) Ayrı yaş sınırı yok; uygulamanın genel kuralı geçerli. (b) Güvenlik kartına "18 yaşından küçüksen bir yetişkinle birlikte dene" satırı. (c) Yaş kapısı | **(a).** Hızlı nefes, hiperventilasyon ve 7 sn'yi aşan tutma hiçbir derste yok. Güvenlik dosyasındaki çocuklarda daha yüksek risk kanıtı hiperventilasyonla ilgili (güvenlik §12). Karar sahibin; (b) de makul |
| G8 | Ad ve kapsam | 10 dersin 9'u nefes, meditasyon ya da yoga nidra; hareket yalnız Ders 6'da ve oturarak. Neden: yalnız sesle ve gözetimsiz dinlenen bir formatta gözetimsiz pratik yan etki riskiyle ilişkili bulundu (Cramer 2019, PMID 31357980, DOI [10.1186/s12906-019-2612-7](https://doi.org/10.1186/s12906-019-2612-7)). (a) Bölümün adı "Yoga" kalır, alt başlık "Nefes, meditasyon ve derin dinlenme". (b) Ad "Yoga ve Meditasyon". (c) Bir ders yerine ya da 11. ders olarak hafif, oturarak ya da uzanarak yapılan bir hareket dersi eklenir | **(b).** "Yoga" arayan kişi duruş (asana) dersi bekleyebilir; ad, içeriği dürüstçe söylemeli. (c) ilk sürümde önerilmez: ekransız ses dersinde hareketi denetleyecek görsel yok; istenirse hareket dersi ayrı bir iş olarak ekrana görsel eklenerek planlanır |
| G9 | Müzik yataklarının kaynağı | (a) Hepsi ElevenLabs Music (10 ders ≈ 211k–317k kredi; tempo ayarlanamaz). (b) Hepsi uygulamanın kendi müzik motoru (dalgaMusic + render.mjs; API maliyeti yok, tempo tam, tını kalitesi bu iş için sınanmadı). (c) Karma: nefes bordunları her durumda uygulama hattından, yataklar ElevenLabs'ten, parça başına 2 aday | **Pilotta Ders 2 yatakları (a) ve (b) ile üretilip kör dinlemede karşılaştırılır; o güne kadar varsayılan (c).** Bütçe tavanı (G5) (b) ya da (c) ile daha rahat tutulur |
| G10 | İnceleyiciler kim? | Türkçe editör (anadili Türkçe, seslendirme metni deneyimli); usta hoca (yoga nidra ya da rehberli meditasyon eğitimi almış); klinik psikolog (Ders 4 ve 7); kör dinleme paneli (en az 5 kişi, en az biri 65 yaş üstü, en az biri yeni başlayan, iki cinsiyet). Ücretli mi, gönüllü mü? | **Adları sahip belirler.** Bu belgeyi hazırlayan model her metinde ilk denetimi yapar ama insan onayının yerine geçmez. İnceleyici bulunmadan pilot metni seslendirilmez |
| G11 | `app/build-dev/` ve `…/xcshareddata/swiftpm/` izlensin mi? | (a) İkisi de `.gitignore`'a. (b) `build-dev` yok sayılır, `swiftpm/Package.resolved` izlenir, gerisi yok sayılır. (c) İkisi de izlenir | **(b).** Derleme çıktısı depoya girmez. `Package.resolved` ise paket sürümlerini sabitler ve derlemeyi tekrarlanabilir kılar. Klasörün içeriği bu görevde görülmedi (doğrulanmadı) |

---

## H. Dürüst sınırlar

**Kanıtın zayıf olduğu yerler**
- Yoga nidra MA'larının hepsi düşük kaliteli çalışmalara dayanıyor ve etkiler "muhtemelen şişirilmiş" (Ghai 2025);
  uyku MA'sı çok düşük güvenli (Singh 2026, PMID 42043659, DOI
  [10.1007/s11325-026-03685-0](https://doi.org/10.1007/s11325-026-03685-0)). Aktif kontrole karşı etkiler küçülüyor.
- "Özgüven" için doğrudan meditasyon MA'sı bulunamadı; Sağlam Yer dersi dolaylı bileşenlere dayanıyor.
- "Sabah enerjisi" için meta-analiz yok; tek RKÇ ve sınırda bir etkileşim var.
- Oturum uzunluğunu doğrudan karşılaştıran tek çalışma Moszeik 2025; o da **müziksiz** sesle yapıldı (tam metin).
  Ses + müzik birleşiminin etkisi bu çalışmadan çıkarılamaz.
- Kısa farkındalık eğitimlerinde yayın yanlılığı düzeltmesiyle etki neredeyse sıfır (Schumer 2018).
- Rehberli meditasyonda anlatıcı cinsiyeti, ses tınısı, ideal sessizlik uzunluğu, Türkçe hece hızı normu, konuşma payı,
  sesin üstündeki müzik için ses–müzik farkı ve dil kalıplarının (sen, şimdiki zaman, tekrar, geri sayma)
  karşılaştırmalı etkisi için kanıt bulunamadı. Bu değerlerin hepsi VARSAYIM ya da uzman tercihidir.
- "Hipnoz" hissi: kayıttan telkin çalışabiliyor ama telkine yatkınlık kişiden kişiye çok değişiyor; herkesin aynı
  derinliğe ineceği vaat edilemez (teslim §10).
- Önce → sonra tek madde puanları neredeyse her zaman iyileşme gösterir (tavan ve beklenti etkisi; teslim §6.2);
  maddeler geçerlenmedi.

**Tasarımdaki VARSAYIMlar (pilotta ölçülecek)**
- Blok süreleri, en kısa blok süresi (0:55 / 0:20), Varış ve Kapanış süreleri, boşluk sınıfları (12 / 20 / 90 / 45 sn),
  konuşma payları, genişletme payı (%27), dikkat eğrisi (3–5 dk).
- Klip içi hız bandı (5,0–6,8 hece/sn, ±%8), klip içi duraklama çarpanı, 2,8 hece/sözcük; REST hız 0,8'in ≈ 5,2
  hece/sn vermesi.
- ≥ 15 dB konuşma–müzik farkı, üç mutlak düzey (−18 / −33 / −27 LUFS), +6 dB kabarma, dakikada en çok 2 kazanç geçişi,
  özilinti eşiği 0,5, −18 / −20 LUFS, oda sesi tabanı, yatak EQ çukuru ve filtre değerleri.
- Müzik tempoları, tonlar, çalgılar; kuş çağrısı aralığı; yatak varyant sayısı ve süreleri.
- Anlaşılırlık vekili eşiği (%2 sözcük hatası), kör dinleme eşikleri, klipler arası süreklilik eşikleri.
- Paket boyutu (gerçek metin uzunluğu bilinmiyor), AAC 48 ve AAC 64 yatağın yeterliliği.
- Deneme oranları (yol A 1,3–1,6; yol B ×2,4–3,6), müzik adayı sayısı; tamamlanma eşiği %60; "Kaldığın yerden" kaydının
  7 gün tutulması; palet tonları.

**Doğrulanmayan teknik noktalar**
- Yerel motorun (AVAudioEngine ya da AVMutableComposition) bu uygulamada kilitli ekranda 30 dk sürmesi. Mevcut uyku
  sesinde bile tam süre kilitte çalma işaretlenmedi (YAPILACAKLAR.md:212, kod-haritasi R13).
- `AVAudioEngineConfigurationChange` ve `mediaServicesWereReset` sonrası yeniden kurulumun bu uygulamadaki davranışı;
  AVAudioMixerNode'da örnek hassasiyetinde rampa olmaması.
- Bluetooth gecikmesi ve ses–görsel eşzamanlılığı; uzun sessizlikte Bluetooth kulaklığın ilk heceyi yutup yutmadığı.
- ElevenLabs: REST'te `eleven_v4`'ün ayar ve birleştirme desteği; hız 0,8'in gerçek Türkçe hızı; MCP çıktısının bit
  hızı; `<break>` davranışı (kullanılmıyor); 10.000 karakter üstü davranış; v4'ün karakter sınırı ve telaffuz sözlüğü
  desteği; Türkçe telaffuz hataları; Scribe maliyeti; 180 sn müziğin kredisi ve müzik üst süresi (5 ya da 10 dk;
  kaynaklar çelişiyor); Voice Design önizleme maliyeti ve tasarlanan sesin kullanım koşulları; kütüphane seslerinin
  ticari kullanım koşulları; API anahtarının kapsam ve kota sınırlaması; bu ortamdan api.elevenlabs.io'ya çıkış izni.
- AAC'nin bu ortamda üretilememesi (ffmpeg ve afconvert yok); Mac'te `afconvert` beklenir.
- iOS On-Demand Resources ya da Background Assets'in bu projede ve Capacitor ile çalışması; App Store hücresel indirme
  eşiği ve sıkıştırılmış IPA boyutu.
- Avuçlama ritüeli için kanıt aranmadı.

**Bu plan ne değildir:** bitmiş bir ders, dinlenmiş bir ses ya da cihazda görülmüş bir özellik değildir. "Mükemmel"
yargısı ancak pilot üretilip ölçüldükten ve sahibi dinledikten sonra verilebilir.

---

## Ek: Kullanılan kaynaklar (PubMed; hepsi dosyaların ikinci tur doğrulamasından, * işaretliler sürüm 1'de, ** işaretliler eleştiri turunda ayrıca yeniden çekildi)

Sürüm 2'de listeye yeni kaynak eklenmedi.

| PMID | Kısa künye | DOI | Dosya |
|---|---|---|---|
| 40373021* | Moszeik 2025 | 10.1002/smi.70049 | sakin |
| 41327816 | Ghai 2025 (YN MA) | 10.1111/nyas.70149 | sakin |
| 42043659 | Singh 2026 (YN uyku MA) | 10.1007/s11325-026-03685-0 | sakin |
| 41743305** | Gibbs 2026 (kronik ağrı, yarı deneysel) | 10.4103/ijoy.ijoy_2_25 | sakin |
| 39690521* | Luu 2024 | 10.17761/2024-D-24-00021 | sakin, güvenlik |
| 36731199 | Sharpe 2023 | 10.1016/j.jpsychores.2023.111169 | sakin |
| 35623448 | Laborde 2022 | 10.1016/j.neubiorev.2022.104711 | sakin |
| 25156003 | Van Diest 2014 | 10.1007/s10484-014-9253-x | sakin |
| 36630953 | Balban 2023 | 10.1016/j.xcrm.2022.100895 | sakin |
| 38204770 | Trivedi 2023 | 10.4103/ijoy.ijoy_113_23 | sakin |
| 34306146 | Toussaint 2021 | 10.1155/2021/5924040 | sakin, güvenlik |
| 11863237* | Harvey & Payne 2002 | 10.1016/s0005-7967(01)00012-2 | sakin |
| 41886931 | Eide 2026 | 10.1016/j.smrv.2026.102284 | sakin |
| 36000763 | Jespersen 2022 (Cochrane) | 10.1002/14651858.CD010459.pub3 | sakin, teslim |
| 16199412 | Bernardi 2006 | 10.1136/hrt.2005.064600 | sakin, teslim |
| 24882909 | Cordi 2014 | 10.5665/sleep.3778 | sakin, teslim, güvenlik |
| 32655984* | Kirschner 2019 | 10.1177/2167702618812438 | benlik |
| 33749936 | Wakelin 2021 | 10.1002/cpp.2586 | benlik |
| 24979314 | Galante 2014 | 10.1037/a0037249 | benlik |
| 26579061 | Zeng 2015 | 10.3389/fpsyg.2015.01693 | benlik |
| 35391975 | Creaser 2022 | 10.3389/fpsyg.2022.765602 | benlik, güvenlik |
| 24467424* | Kross 2014 | 10.1037/a0035173 | benlik |
| 22645164 | Breines & Chen 2012 | 10.1177/0146167212445599 | benlik |
| 41143765 | Zhang 2025 | 10.1037/amp0001591 | benlik |
| 19493324 | Wood 2009 | 10.1111/j.1467-9280.2009.02370.x | benlik |
| 39633430 | Barel 2024 | 10.1186/s40359-024-02194-7 | benlik |
| 29578742 | Leyland 2018 | 10.1037/emo0000425 | benlik |
| 29939051 | Schumer 2018 | 10.1037/ccp0000324 | benlik, sakin |
| 23046777 | Levin 2012 | 10.1016/j.beth.2012.05.003 | benlik |
| 21534661 | Lieberman 2011 | 10.1037/a0023503 | benlik |
| 22309719 | Mrazek 2012 | 10.1037/a0026678 | benlik |
| 30127731 | Norris 2018 | 10.3389/fnhum.2018.00315 | benlik |
| 34350544** | Whitfield 2021 | 10.1007/s11065-021-09519-y | benlik |
| 34560133 | Feruglio 2021 | 10.1016/j.neubiorev.2021.09.032 | benlik |
| 42453615* | Marschin 2026 | 10.3389/fspor.2026.1774292 | benlik |
| 34054628 | Wang ve ark. 2021 (eğer-ise MA'sı) | 10.3389/fpsyg.2021.565202 | benlik |
| 34941558 | Stecher 2021 | 10.2196/32794 | benlik |
| 25610410 | Bornemann 2015 | 10.3389/fpsyg.2014.01504 | benlik |
| 36810609 | Taylor 2023 | 10.1038/s41598-023-28660-7 | benlik |
| 28955213 | Fischer 2017 | 10.3389/fnhum.2017.00452 | sakin |
| 31545815 | Carrillo 2019 | 10.1371/journal.pone.0222386 | benlik |
| 36724699 | Boselie 2023 | 10.1016/j.jbtep.2023.101837 | benlik |
| 21450262 | Meevissen 2011 | 10.1016/j.jbtep.2011.02.012 | benlik |
| 40627390 | Choi 2025 | 10.1073/pnas.2425193122 | benlik |
| 26575348 | Davis 2015 | 10.1037/cou0000107 | benlik |
| 39808431 | Radin 2025 | 10.1001/jamanetworkopen.2024.54435 | benlik |
| 36416880 | Huberty 2022 (kanser; görüşme n=6) | 10.2196/39228 | benlik |
| 16941239* | Knowlton & Larkin 2006 | 10.1007/s10484-006-9014-6 | teslim |
| 42757902* | Shuminsky & Davidow 2026 | 10.1044/2026_JSLHR-25-00691 | teslim |
| 41057603* | Diel 2025 | 10.1038/s41598-025-21290-1 | teslim |
| 34759206* | Lee 2022 | 10.1097/AUD.0000000000001157 | teslim |
| 41949420 | Rallapalli 2026 | 10.1044/2026_AJA-25-00171 | teslim |
| 19569263* | Bernardi 2009 | 10.1161/circulationaha.108.806174 | teslim |
| 41331213 | Opheij & Brouwer 2025 | 10.3758/s13414-025-03159-7 | teslim |
| 37205669 | Ingendoh 2023 | 10.1371/journal.pone.0286023 | teslim |
| 39243923 | Ciaramella 2024 | 10.1016/j.jpain.2024.104671 | teslim |
| 38376930 | Riordan 2024 | 10.1037/cou0000725 | teslim |
| 31573916 | Baumel 2019 | 10.2196/14567 | teslim |
| 31304366 | Larsen 2019 | 10.1038/s41746-019-0093-1 | teslim |
| 28300508 | Howard 2017 | 10.1080/00029157.2016.1203281 | güvenlik |
| 3069875 | Braith 1988 | 10.1016/0005-7916(88)90040-7 | güvenlik |
| 24146758 | Cramer 2013 | 10.1371/journal.pone.0075515 | güvenlik |
| 31357980 | Cramer 2019 | 10.1186/s12906-019-2612-7 | güvenlik |
| 34260686 | Tran 2021 | 10.1093/ageing/afab090 | güvenlik |
| 28958002 | Bioulac 2017 | 10.1093/sleep/zsx134 | güvenlik |
| 33562129 | Wang ve ark. 2021 (kulaklık küme RKÇ'si) | 10.3390/ijerph18041560 | güvenlik |

Kaynak: PubMed (National Library of Medicine). DOI'ler `https://doi.org/` önekiyle açılır.
