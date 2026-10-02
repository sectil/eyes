# Nefona Yoga: karar planı

Tarih: 2026-09-28. Hazırlayan: tasarım lideri (bu belge). Depoda hiçbir izlenen dosya değiştirilmedi.

**Durum, açıkça:** Bu bir plandır. Henüz tek satır ders metni seslendirilmedi, tek saniye müzik üretilmedi, kod yazılmadı.
Sahibin kuralı gereği ("mükemmel değilse olmuş gibi yazma") hiçbir parça "bitti" sayılmaz. Bir ders ancak (1) metni
üç denetimden geçtiğinde, (2) sesi ölçüldüğünde, (3) cihazda kilitli ekranda 5 ve 30 dakika çaldığında ve (4) sahibi
dinleyip onayladığında `[x]` olur (YAPILACAKLAR.md:8-9 işaret kuralı).

**Girdiler (hepsi baştan sona okundu):** `dossier-sakin.dogrulanmis.md`, `dossier-benlik.dogrulanmis.md`,
`dossier-teslim.dogrulanmis.md`, `dossier-guvenlik.dogrulanmis.md`, `pazar.md`, `kod-haritasi.md`, `elevenlabs.md`,
`SAHIP_ISTEKLERI.md`.

**Kanıt kuralı bu belgede:**
- Yalnız dosyaların **ikinci tur doğrulamasından geçmiş** iddiaları kullanıldı (sakin §13, benlik §19 C01–C50,
  teslim başlık notu, güvenlik §14 C1–C29). İkinci turdan geçmemiş kaynaklar (ör. Zuo 2023, Colzato 2012, Madsen &
  Parra 2024, Lieberman 2007, Matko 2022) kanıt satırlarına konmadı.
- Bu plan için PubMed'den 11 kayıt ayrıca `get_article_metadata` ile yeniden çekildi ve dosyalardaki okumayla
  karşılaştırıldı (PubMed'e göre): Moszeik 2025, Kirschner 2019, Knowlton & Larkin 2006, Lee 2022, Bernardi 2009,
  Diel 2025, Kross 2014, Harvey & Payne 2002, Marschin 2026, Luu 2024, Shuminsky & Davidow 2026. Uyuşmazlık yok.
- Dil: "çalışmada … görüldü". Uygulama "tedavi eder / iyileştirir" demez.
- **VARSAYIM** etiketi: kanıtın sayı vermediği yerde koyduğum tasarım değeri. Pilotta ölçülüp kesinleşir.
- Kod iddiaları `dosya:satır` ile. Satır numaraları HEAD `d515702`'ye göredir. Bir kısmını bu görevde kendim okudum
  (registry.js:57, dataHub.js:24-28 ve :36-38, releases.js:1-4, YAPILACAKLAR.md:8-9, dalga/manifest.js:17-23,
  progress.js:70-73, dalgaMusic.js:5-8, DalgaVisual.jsx:4-6 ve :23, breath.js:1-6, :14, :351-354,
  design/dalga-uyku/master.py:1-6, design/uyanma-sesleri/analyze.py ve README). Geri kalanı `kod-haritasi.md`'nin
  okumasıdır ve öyle belirtildi.

---

## 0. Tek bakışta

| Konu | Karar |
|---|---|
| Ders sayısı | 10 ders; hepsi 5–30 dk arasında **her dakika** çalınabilir ve her sürede varış + çekirdek + kapanışla biter |
| Mimari | Blok tabanlı ders + saf JS planlayıcı + iki izli yerel iOS ses motoru (konuşma izi, müzik/doğa izi). Görsel, sesle **aynı zaman çizelgesini** motorun bildirdiği konumdan okur |
| Ses | Neslihan ve Hakan, `eleven_multilingual_v2`, **REST API** ile sabit ayar + seed + `previous_text/next_text`. Sesler "eğitilmez"; ayar, telaffuz ve metinle hocaya dönüştürülür |
| Konuşma ile müzik | Konuşma sırasında müzik ≥ 15 dB aşağıda; sessiz pencerede en çok +6 dB, ≥ 2 sn rampa; kreşendo yok; vokalsiz müzik |
| Yükseklik | Gündüz dersi ortalama −18 LUFS ±1, gerçek tepe ≤ −1,5 dBTP; gece dersi −20 LUFS (VARSAYIM) |
| Görsel | Neredeyse siyah sahnede tek "nefes formu": söylenen nefes ipuçlarıyla büyür-küçülür, evreye göre ışık değiştirir; okunacak yazı yok; Hareketi Azalt'a uyar |
| Pilot | Önce **Ders 2 "Derin Dinlenme"** (Yoga Nidra) iki sesle, bütün sürelerde üretilir, ölçülür, tasarım Artifact'ı içinde gerçek sesle sahibine dinletilir. Onay gelmeden kalan 9 derse geçilmez |
| Maliyet | ElevenLabs: pilot ≈ 46–63 bin kredi (≈ 8–12 USD); 10 dersin tamamı ≈ 300–480 bin kredi (≈ 55–87 USD). Ayrıntı §F |
| Paket boyutu | +≈ 125–215 MB (seçilen bit hızına ve gerçek metin uzunluğuna göre). Karar sahibin (§G2) |

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
| 1 | Nefesin Ritmi | 6/8 uygulamada nefes kategorisi; TR 581 bin + 577 bin (§7 #8) | Yavaş nefeste vagal HRV artışı MA'sı; uzun verişte daha çok gevşeme bildirimi | calm |
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

- **Açılış cümlesi, her derste aynı:** "İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin." (güvenlik
  §11.A; Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021)).
- **İki ses:** her ders Neslihan ve Hakan ile ayrı ayrı kaydedilir. Anlatıcı tercihleri kişiden kişiye değişiyor
  (Huberty 2022, PMID 36416880, DOI [10.2196/39228](https://doi.org/10.2196/39228)); pazarda da ses seçimi standart
  (pazar.md §6.1). Varsayılan, kişinin `prefs.voice` seçimidir (kod-haritasi.md §3: prefs.js:17). Dersin kartında
  "önerilen ses" yalnız ilk dinleyişte gösterilir.
- **Nefes:** önce doğal nefes fark edilir; "derin nefes al" komutu yok (Toussaint 2021'de derin nefes talimatı önce
  uyarılmayı artırdı: PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040)). Hızlı ya da
  zorlu nefes, hiperventilasyon ve ardından tutma **hiçbir derste yok** (güvenlik §11.C). Tutma varsa isteğe bağlı,
  en çok 7 sn (breath.js:14 `HOLD_MAX = 7`).
- **Müzik ailesi:** 48–72 BPM, belirgin vuruş yok, vokal ve insan sesine benzeyen koro yok, kreşendo yok, ~10 sn'lik
  cümleler (teslim §0 M1–M3). Her dersin kendi teması vardır ve 5 ile 30 dk sürümünde aynı kalır (Opheij & Brouwer
  2025: aynı müzikle yeniden duyulan cümleler daha iyi tanındı; PMID 41331213, DOI
  [10.3758/s13414-025-03159-7](https://doi.org/10.3758/s13414-025-03159-7)).
- **Arka plan seçimi:** Müzik / Doğa / Sessizlik; dersin varsayılanı aşağıda. Seçim yönteminin tek başına belirleyici
  olduğu gösterilmedi (teslim §3.3), bu yüzden kişiye bırakılır.
- **Gelişim ölçüsü:** her derste tek madde, 0–10, önce ve sonra; atlanabilir. Uyku dersinde "sonra" ertesi sabah
  sorulur (aşağıda). Puanlar "nasıl hissettin" gidişatıdır, etki kanıtı değildir (progress.js:71 notu).

### A.2 Ders kartları

Her kartta: başlık, tek satırlık söz (sağlık iddiası yok), teknik, kanıt satırı, zaman ve duruş, ses, müzik, güvenlik,
Gelişim ölçüsü. Müzik değerlerinin (BPM, ton, çalgı) hepsi **VARSAYIM**'dır: kanıt yalnız tempo aralığını, vokalsizliği,
düz dinamiği ve ~10 sn cümleyi destekliyor; ton ve çalgı seçimi estetik karardır.

---

#### Ders 1 · Nefesin Ritmi
- **Söz:** "Nefesini yavaşlatmayı ve verişini uzatmayı öğren; kısa bir mola, sakin bir ritim."
- **Teknik (pranayama):** doğal nefesi fark etme → dakikada ~6 nefes, 4 sn alış / 6 sn veriş, tutma yok; iç çekiş
  (iki kısa alış + uzun veriş); bhramari (vızıltılı veriş, döngü 12–14 sn); nadi shodhana (burun deliği değiştirme,
  **tutmasız**, "burnun tıkalıysa atla"). Uygulamadaki nefes motoruyla aynı kurallar (breath.js:2-6).
- **Kanıt:** Yavaş nefeste tek seans sırasında ve hemen sonrasında vagal HRV artışı görüldü (Laborde 2022, 223 çalışma,
  PMID 35623448, DOI [10.1016/j.neubiorev.2022.104711](https://doi.org/10.1016/j.neubiorev.2022.104711)). Kısa alış /
  uzun veriş, tersine göre daha çok gevşeme bildirimiyle ilişkiliydi (Van Diest 2014, PMID 25156003, DOI
  [10.1007/s10484-014-9253-x](https://doi.org/10.1007/s10484-014-9253-x)). Günde 5 dk döngüsel iç çekmede, 1 ayda
  olumlu duygulanım ve solunum hızında meditasyondan fazla değişim görüldü; kaygıda gruplar arası fark yoktu (Balban
  2023, n=108, PMID 36630953, DOI [10.1016/j.xcrm.2022.100895](https://doi.org/10.1016/j.xcrm.2022.100895)). Vızıltılı
  nefeste en yüksek HRV 12–14 sn döngüdeydi (Trivedi 2023, PMID 38204770, DOI
  [10.4103/ijoy.ijoy_113_23](https://doi.org/10.4103/ijoy.ijoy_113_23)). Güç: fizyolojide orta, psikolojik sonuçta
  düşük–orta.
- **Zaman ve duruş:** gün içinde, oturarak. İlk ders; varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Neslihan (TR etiketi "calm, confident"; elevenlabs.md §2.5).
- **Müzik:** 60 BPM, 5/4 ölçü (2 ölçü = 10 sn = bir nefes döngüsü), Re'de tanpura benzeri bordun + yumuşak pad;
  nefes bloklarında melodi yok, yalnız bordun (nefesle yarışmasın). Doğa sesi varsayılan kapalı. Yay: düz; son
  bloklarda pad çekilir, yalnız bordun kalır.
- **Güvenlik:** "Başın döner ya da karıncalanırsa normal nefesine dön." Bhramari için "sesin kimseyi rahatsız
  etmeyeceği bir yerde". Nöbet sorusuna "Evet / Emin değilim" diyen profilde tutma alternatifleri kapalı (güvenlik
  §11.E).
- **Gelişim:** `calm` · "Şu an ne kadar gerginsin?" 0–10, düşük iyi.

#### Ders 2 · Derin Dinlenme (Yoga Nidra) — pilot ders
- **Söz:** "Uyumadan, uyanık kalarak derin bir dinlenme."
- **Teknik:** klasik yoga nidra akışı: hazırlık → niyet (sankalpa) → beden dolaşımı (bilinç dolaşımı) → nefes
  farkındalığı ve geri sayma → zıtlık çiftleri (ağır/hafif, sıcak/serin) → seçimli imgeleme → niyetin tekrarı →
  dışa dönüş. Aşamaların adları PubMed kayıtlarıyla örtüşüyor; bu tam sıranın özgün Satyananda metni **doğrulanmadı**
  (sakin §1.5).
- **Kanıt:** 11 dk ve 30 dk YN'nin doğrudan karşılaştırıldığı RKÇ'de (n=362) ikisi de küçük etki gösterdi; 30 dk
  yalnız "farkında davranma"da farklıydı (d=0,10, GA sıfıra çok yakın) (Moszeik 2025, PMID 40373021, DOI
  [10.1002/smi.70049](https://doi.org/10.1002/smi.70049); tam metin sakin §1.2). 73 çalışmalık MA'da etkiler var ama
  yazarlar "muhtemelen şişirilmiş" diyor (Ghai 2025, PMID 41327816, DOI
  [10.1111/nyas.70149](https://doi.org/10.1111/nyas.70149)). Tek 45 dk YN, beden taramasına göre hemen sonrasında iyi
  oluşta daha çok artışla birlikte gitti (Gibbs 2026, n=23, yarı deneysel, PMID 41743305, DOI
  [10.4103/ijoy.ijoy_2_25](https://doi.org/10.4103/ijoy.ijoy_2_25)). Travma-duyarlı 10 bileşen yapıyı belirliyor
  (Luu 2024, yukarıda). Güç: düşük.
- **Neden pilot:** en zor ders bu. Uzun sessizlik, yatarak dinleme, kesintisiz beden dolaşımı, dışa dönüş, imgelem
  seçimi ve iki sesin hepsini bir arada sınar. Türkçe pazarda da açık burada (pazar.md §3.3: en fazla ~84 bin).
- **Zaman ve duruş:** öğleden sonra ya da akşam, **yatarak** (dizaltına yastık önerisi). Varsayılan 15 dk.
- **Ses:** ikisi de. Önerilen: Hakan ("sleep content, meditation"; elevenlabs.md §2.5). Hoparlörde erkek sesin
  zayıf kalma riski ölçülecek (kod-haritasi R12).
- **Müzik:** ~50 BPM hissi, vuruşsuz; Mi♭ majör pad + alçak yaylılar + seyrek, uzak piyano notaları. Doğa katmanı
  varsayılan açık: uzak, sürekli akarsu (ani ses yok). Yay: ders ilerledikçe müzik kaydı alçalır, parlaklık azalır;
  kapanışta tek bir sıcak akor "şafak" gibi yükselir (ses yüksekliği değil, tını parlaklığı).
- **Güvenlik:** beden dolaşımında "Bu bölge rahatsız ederse bir sonrakine geç"; imgelemde seçenek ("bir kıyı ya da bir
  orman"); sessizlik penceresi ≤ 90 sn ve öncesinde haber verilir; kapanışta "yana dön, otur, bekle, kalk" (Tran 2021:
  65 yaş üstünde ayağa kalkınca ilk KB düşüşü %29, PMID 34260686, DOI
  [10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090)).
- **Gelişim:** `body` · "Bedenin şu an ne kadar gergin?" 0–10, düşük iyi.

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
  önerisi (Wang 2021, PMID 33562129, DOI [10.3390/ijerph18041560](https://doi.org/10.3390/ijerph18041560)). Bu dersten
  hemen sonra araç kullanılmaz (Bioulac 2017, PMID 28958002, DOI
  [10.1093/sleep/zsx134](https://doi.org/10.1093/sleep/zsx134)).
- **Gelişim:** `wellbeing` · Önce: "Zihnin şu an ne kadar meşgul?" 0–10. Sonra yerine **ertesi sabah** uygulama ilk
  açıldığında tek soru: "Dün gece uykuya dalmak ne kadar kolaydı?" 0–10. Bu bir `effects` çifti değil, `metrics` zaman
  serisidir (registry.js sözleşmesi, kod-haritasi §1.1).

#### Ders 4 · Zor Anlar İçin
- **Söz:** "Zor bir duyguyla, onu itmeden ve ona kapılmadan birkaç dakika kalmak."
- **Teknik:** dayanak (ayak tabanları, eller, odadaki sesler) + uzun veriş → duyguyu bedende bulmak ve kısaca
  adlandırmak ("Bu… huzursuzluk.") → kendine içinden adınla ya da "sen" diye seslenmek → derede yapraklar (düşünceden
  ayrışma) → duyguya nefesle yer açmak → şefkatli el → dayanağa dönüş. Gözler **açık** kalabilir; bu derste varsayılan
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
  iyi olur. Acil durumda 112." kartı (güvenlik §11.F; Yon.jsx:362 dili).
- **Gelişim:** `calm` · "Bu duygu şu an ne kadar yoğun?" 0–10, düşük iyi.

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
  Kapanışta isteğe bağlı "avuçlama" (ısıtılmış avuçları kapalı gözlerin üstüne koymak) yalnız bir dinlenme ritüeli
  olarak; etkisi için kaynak aranmadı, **iddiasız** (doğrulanmadı).
- **Gelişim:** `focus` · "Zihnin şu an ne kadar toplu?" 0–10. Gelişim'de "dikkatin gelişti" denmez (Whitfield 2021).

#### Ders 6 · Sabah Niyeti
- **Söz:** "Güne bedenini uyandırarak ve tek bir niyetle başlamak."
- **Teknik:** oturarak omurga hareketi (kedi-inek, yan esneme) ve doğal nefes → hafif akış (boyun, omuz, kollar
  nefesle, ayakta ya da oturarak dağ duruşu) → şükran üçlüsü (bir kişi, bir an, bir beden duyusu; adlandırmadan tadını
  çıkarmak) → niyet (sankalpa: tek kelime) → günün provası + eğer-ise planı. Durgun meditasyon değil.
- **Kanıt:** Tek 7 dk'lık rehberli oturumda üç kolda da stres, olumsuz duygu ve kaygı azaldı; olumlu duygu en çok
  dayanıklılık/kuvvetten sonra, yoga hareketliliğinden sonra daha az arttı, meditasyondan sonra neredeyse hiç
  değişmedi (etkileşim p=.05, sınırda; Marschin 2026, n=131, PMID 42453615, DOI
  [10.3389/fspor.2026.1774292](https://doi.org/10.3389/fspor.2026.1774292)). Engel + eğer-ise planı hedefe ulaşmada
  g=0,336 (Wang 2021, PMID 34054628, DOI [10.3389/fpsyg.2021.565202](https://doi.org/10.3389/fpsyg.2021.565202)).
  Sabah çapası süreklilikle ilişkili bulundu ama randomize değildi (Stecher 2021, PMID 34941558, DOI
  [10.2196/32794](https://doi.org/10.2196/32794)). Meditasyon uygulamalarında kullanımın iki tepesi sabah ve gece
  (Baumel 2019, PMID 31573916, DOI [10.2196/14567](https://doi.org/10.2196/14567)). Güç: zayıf.
- **Zaman ve duruş:** sabah; oturarak başlar, isteyen ayağa kalkar. Varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Neslihan.
- **Müzik:** 72 BPM (ailenin üst sınırı), Re majör; kalimba/tahta çalgı + akustik gitar + pad; hafif vuruş hissi
  hareket bölümünde tınıyla verilir, davul yok. Doğa varsayılan açık: uzak, seyrek kuş sesi (ani ötüş yok). Yay:
  **parlaklık** kapanışa doğru artar, ses yüksekliği düz kalır (Bernardi 2009: kreşendo KB'yi artırdı; PMID 19569263,
  DOI [10.1161/circulationaha.108.806174](https://doi.org/10.1161/circulationaha.108.806174)).
- **Güvenlik:** hareketler hafif, "ağrı ya da baş dönmesi olursa bırak"; ters duruş ve uzun öne eğilme yok (Cramer
  2013, PMID 24146758, DOI [10.1371/journal.pone.0075515](https://doi.org/10.1371/journal.pone.0075515)); gözetimsiz
  pratik yan etki riskiyle ilişkili bulunduğu için görsel denetim isteyen hiçbir şey yok (Cramer 2019, PMID 31357980,
  DOI [10.1186/s12906-019-2612-7](https://doi.org/10.1186/s12906-019-2612-7)). Enerji veren hızlı nefes yok.
- **Gelişim:** `wellbeing` · "Enerjin şu an ne düzeyde?" 0–10 (Dalga · Motive ile aynı ölçü adı: dalga/manifest.js:22).

#### Ders 7 · Kendine Şefkat
- **Söz:** "Başkasına gösterdiğin yumuşaklığı kendine de gösterebilmek."
- **Teknik (metta, maitri):** dayanak + şefkatli beden taraması (dolaylı yol) → sevdiğin birine iyi dilek → (20+ dk)
  tarafsız biri → (30 dk) zorlandığın biri, isteğe bağlı → kendine dönüş (el kalpte, iyi dilek) → genişleyen çember.
  İyi dilekler dilek kipinde: "Huzurlu olmanı diliyorum." Olumlama cümlesi yok.
- **Kanıt:** 11,5 dk'lık iki öz-şefkat kaydında (sevilen birine şefkat → kendine; ve şefkatli beden taraması) düşük
  uyarılma ve KAD artışı örüntüsü yalnız öz-şefkat koşullarına özgüydü (Kirschner 2019, n=135, PMID 32655984, DOI
  [10.1177/2167702618812438](https://doi.org/10.1177/2167702618812438); tam metin: kayıtlar 610–630 kelime, KAD
  beden taramasında ~4. dakikada plato). Öz-eleştiride g=0,51 azalma (Wakelin 2021, 19 RKÇ, PMID 33749936, DOI
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
- **Gelişim:** `self` · "Şu an kendine ne kadar yumuşak davranıyorsun?" 0–10. Başlangıç sorusu "Kendine şefkat" ile
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
- **Gelişim:** `self` · "Şu an kendini ne kadar sağlam hissediyorsun?" 0–10. Madde geçerlenmedi (benlik §16).

#### Ders 9 · Kendini Tanımak
- **Söz:** "Bedeninden, nefesinden ve duygularından kendine bakmak."
- **Teknik (svadhyaya):** beden taraması, 30–60 sn arayla yumuşak geri çağırma ("Dikkatin şimdi nerede?") → nefesin
  kendiliğinden akışını izlemek → "Şu an ne hissediyorum?": duyguyu bedende bulmak → (30 dk) tanıklık (sakshi) →
  "Bugün neyi önemsiyorum?" ile değerlere bakış. Soyut "kim olduğunu düşün" görevi yok.
- **Kanıt:** 3 ay günlük beden taraması ve nefes meditasyonunda 8 MAIA ölçeğinin 5'inde iyileşme; pratiği sevmek ve
  günlük hayata katmak ölçeklerin çoğunda değişimi yordadı, pratik süresi zayıf yordadı (Bornemann 2015, n=148, PMID
  25610410, DOI [10.3389/fpsyg.2014.01504](https://doi.org/10.3389/fpsyg.2014.01504)). Günde 20 dk beden taramasında
  kalp atışı algı doğruluğu arttı (Fischer 2017, PMID 28955213, DOI
  [10.3389/fnhum.2017.00452](https://doi.org/10.3389/fnhum.2017.00452)). Kaygı için yardım arayanlarda "beden ve
  duygularından habersiz" kümedekiler kontrole göre yanıt vermedi (Taylor 2023, PMID 36810609, DOI
  [10.1038/s41598-023-28660-7](https://doi.org/10.1038/s41598-023-28660-7)): bu yüzden dış tutunma noktaları (sesler,
  temas) da sunulur. Güç: orta–zayıf.
- **Zaman ve duruş:** akşam; oturarak (yatarak da olur). Varsayılan 15 dk.
- **Ses:** ikisi de. Önerilen: Neslihan ("psychology, mind" etiketi).
- **Müzik:** 52 BPM hissi, Mi majör/Lidya; camsı pad + seyrek arp. Doğa varsayılan açık: uzak okyanus dalgası, dalga
  periyodu ~10 sn (nefes periyoduyla aynı; VARSAYIM, sınanmadı).
- **Güvenlik:** hassas bölgelerde (göğüs, karın, kalça) uzun durulmaz; atlama izni (güvenlik §11.B-9).
- **Gelişim:** `awareness` · "Bedenini şu an ne kadar hissedebiliyorsun?" 0–10.

#### Ders 10 · Gelecekteki Sen (gelişim)
- **Söz:** "Olmak istediğin kişiyi canlı bir gün olarak görmek ve bugün atacağın küçük adımı seçmek."
- **Teknik:** yerleşme nefesi → en iyi olası gün, kişisel alan (5 dk'da yalnız bu) → ilişkiler → iş ya da uğraş →
  (30 dk) gelecekteki senden bugüne bir cümle ve sessizlik → **kapanıştan önce gerçeğe dönüş:** engel + eğer-ise planı.
  Sankalpa (niyet) bu dersin son cümlesi olur.
- **Kanıt:** En iyi olası benlik MA'sında olumlu duyguda d=0,511, iyimserlikte 0,334; daha kısa toplam pratikte
  eğilim daha iyi (Carrillo 2019, 29 çalışma, N=2909, PMID 31545815, DOI
  [10.1371/journal.pone.0222386](https://doi.org/10.1371/journal.pone.0222386)). Yalnız imgeleme, yazma+imgeleme kadar
  etki gösterdi (Boselie 2023, PMID 36724699, DOI [10.1016/j.jbtep.2023.101837](https://doi.org/10.1016/j.jbtep.2023.101837)).
  Günde 5 dk imgelemede iyimserlik ilk oturumdan itibaren arttı (Meevissen 2011, PMID 21450262, DOI
  [10.1016/j.jbtep.2011.02.012](https://doi.org/10.1016/j.jbtep.2011.02.012)). Eğer-ise planı: Wang 2021 (yukarıda).
  Güç: anlık orta.
- **Zaman ve duruş:** sabah ya da hafta başı; oturarak. Varsayılan 10 dk.
- **Ses:** ikisi de. Önerilen: Hakan.
- **Müzik:** 66 BPM, La majör; piyano + yaylılar; doğa kapalı. Yay: imgelem doruğunda tını hafifçe açılır, eğer-ise
  bölümünde sadeleşir. Kreşendo yok.
- **Güvenlik:** "ya başaramazsan" gibi olumsuz gelecek imgesi yok (benlik §6). Engel bölümü korkutmaz, somut ve küçük
  tutulur.
- **Gelişim:** `wellbeing` · "Geleceğe şu an ne kadar umutla bakıyorsun?" 0–10.

### A.3 Kütüphane sırası

Önerilen sıra ekranda numarasız bir "başlangıç yolu" olarak gösterilir, dersler serbesttir: 1 Nefesin Ritmi (ilk ders
en yumuşak ve kısa olmalı: güvenlik §5, Shatrova 2024'te bırakmanın çoğu ilk seanstan sonra) → 2 Derin Dinlenme →
5 Tek Nokta → 7 Kendine Şefkat → 4 Zor Anlar İçin → 6 Sabah Niyeti → 8 Sağlam Yer → 9 Kendini Tanımak → 10 Gelecekteki
Sen; 3 Uykuya Geçiş gece saatlerinde en üste çıkar.

---

## B. Değişken süre: 30 dakikanın 5'i de bütün bir ders

### B.1 İlke

- Kısa sürüm yan ürün değil: 11 dk YN tek başına bir pratik olarak işlev gördü (Moszeik 2025) ve gerçek kullanımda
  meditasyona özgü ortalama günde 3,36 dk idi, kullanıcıların %69,7'si günde 5 dk'nın altında kaldı (Radin 2025,
  n=1458, tam metin; PMID 39808431, DOI [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435)).
  Günde bir kez 20 dk ile iki kez 10 dk arasında fark bulunmadı (Riordan 2024, PMID 38376930, DOI
  [10.1037/cou0000725](https://doi.org/10.1037/cou0000725)). Bu yüzden **5 dakikalık sürüm, en çok dinlenecek sürüm gibi
  tasarlanır.**
- Yapı: **Varış (sabit) → öncelik sırasıyla çekirdek bloklar → Kapanış (sabit, her zaman çalar)**. Sabit kapaklar
  travma-duyarlı YN'nin "uygun uzunluk ve hazırlık" ile "yeterli yerleşme ve dışa dönüş / uyku izni" bileşenleridir
  (Luu 2024). Gündüz kapanışı en az 45 sn (teslim Y3), uyandırma başarısızlığı hipnozda istenmeyen etkilerde önemli
  bir etken (Howard 2017, PMID 28300508, DOI [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)).
- **Alt küme ilkesi:** kısa sürümün cümleleri, uzun sürümün cümlelerinin alt kümesidir. Yalnız Varış ve Kapanış'ın kısa
  ve uzun iki metni ve birkaç "köprü" cümlesi ayrıca yazılır. Böylece ses aynı kalır, üretim ve paket boyutu küçük olur.
- Kısaltma sırası: önce **sessizlikler**, sonra **tekrar sayıları** (ör. beden dolaşımındaki nokta sayısı, sayma
  turu), en son **bloklar** (öncelik sırasının tersinden). Aşamaların ayrı katkısı test edilmediği için (sakin §10
  madde 11) bu sıra bir tasarım kararıdır.

### B.2 Blok sözleşmesi (veri)

Her ders bir JSON'dur (`public/yoga/<ders>/lesson.json`). Her blok:

```
{ id, priority: 1..5, playOrder, kind: 'arrival'|'core'|'closing'|'sleepPermission',
  clips: [ { id, text, voice: {female: {file, sec}, male: {file, sec}},
             required: true|false,          // kısa sürümde düşebilir mi
             gapAfter: {min, pref, max},    // bu klipten sonra sessizlik (sn), planlayıcı esnetir
             cue: { breath?: {in, out, hold?, count}, visual?: 'phase:deep', music?: 'duck'|'swell'|'phase:B' } } ],
  silenceWindows: [ { afterClip, min, max, announce: clipId } ],   // müzik penceresi; gündüz ≤ 90 sn, Ders 4'te ≤ 45 sn
  minSec, prefSec: {5,10,15,20,30}, maxSec }
```

- Her klip 1–3 tam cümledir ve **en çok ~15 sn** sürer. Neden: duraklatınca klibin başına sarılır, "Kapanışa geç"
  en çok bir klibin bitmesini bekler.
- Nefes sayma ve "al / ver" ipuçları ayrı, tek sözcüklük mikro-kliplerdir. Başlangıç anları bilindiği için görsel
  bunlara saniyesi saniyesine kilitlenir (kelime düzeyinde zaman damgası gerekmez).

### B.3 Planlayıcı (`lib/yoga.js`, saf, testli)

`planLesson(ders, hedefSn, ses) → { events: [{t, type:'clip'|'silence'|'breath'|'phase'|'duck'|'swell', …}], chapters, total }`

1. Sabit kapakları koy: Varış (hedef ≤ 12 dk ise kısa metin, değilse uzun), Kapanış (aynı eşik).
2. Bloklar öncelik sırasıyla (P1 → P5) eklenir; bir blok ancak **en kısa hali** (`minSec` = zorunlu kliplerin toplamı +
   en kısa sessizlikler) kalan bütçeye sığıyorsa girer. Zor bloklar (Ders 7 C6 gibi) sığmıyorsa tümüyle düşer, yarım
   girmez; kapanıştan hemen önceye de konmaz (güvenlik §11.D-2).
3. Artan süre sırayla dağıtılır: (a) seçilen blokların isteğe bağlı klipleri (öncelik sırasıyla), (b) sessizlikler
   `pref` değerine kadar, (c) sessizlikler `max` değerine kadar orantılı. Hâlâ artan varsa bir sonraki bloğun en kısa
   hali denenir; o da sığmazsa kalan saniyeler kapanıştan önceki "iniş" sessizliğine gider.
4. Toplam her zaman **hedefe eşit** çıkar (sessizlikler sürekli değer alır). Konuşma kliplerinin süresi hiç değişmez;
   ses asla hızlandırılmaz ya da kırpılmaz.
5. Aşağıdaki tablolar 5/10/15/20/30 dk için planlayıcının hedeflediği **çapa planlardır** (toplamlar bir betikle
   doğrulandı: `_plan/tables.py`, "TOPLAMLAR TAMAM"; her blok süre arttıkça kısalmaz). Ara dakikalar (7, 12, 23 …)
   aynı kurallarla kurulur. Her ders için bir önceki çapanın blok kümesiyle başlanır, fark sessizlik ve isteğe bağlı
   kliplerle dolar; bir sonraki çapaya yaklaşıldıkça yeni blok girer.
6. Birim testleri (Nefes'teki `makePlan` testleri gibi): her ders × her dakika 5–30 × iki ses için (a) toplam = hedef
   ±1 sn, (b) Varış ve Kapanış var ve eksiksiz, (c) klipler üst üste binmiyor, (d) hiçbir sessizlik sınırını aşmıyor,
   (e) son 60 sn'de nefes tutma, yeni imge ya da zor blok yok (güvenlik §11.D-3), (f) 5 dk = Varış + en az bir P1
   blok + Kapanış.

### B.4 Ders başına blok planı (çapa süreler)

Süre sütunları blok başına konuşma + içindeki sessizlik toplamıdır (dk:sn). Gündüz dersleri: Varış 0:45 / 1:00 / 1:15 /
1:30 / 1:30, Kapanış 1:15 / 1:30 / 1:45 / 2:00 / 2:30. Gece dersi (Ders 3): Kapanış yerine uyku izni 0:40–1:30; müzik
kuyruğu bu sürenin **dışındadır**. Bütün değerler **VARSAYIM**; pilotta metin seslendirilince gerçek klip süreleriyle
yeniden hesaplanır.

{{TABLES}}

### B.5 "Ses asla kesilmez" kuralları

| Olay | Davranış |
|---|---|
| Süre doldu | Olmaz: plan kapanışı süreye dahil eder; son söz son saniyede biter. Gündüz dersi son 2 sn müzik kuyruğuyla söner |
| **Duraklat** | Ses ve müzik 1 sn'de söner. Sürdürünce 1 sn geri gelir ve **o anki klibin başından** başlar (cümle ortasından değil) |
| **Kapanışa geç** | O anki klip biter (en çok ~15 sn), müzik kapanış evresine geçer, kısa kapanış (gündüz 45–60 sn: nefes, parmaklar, gözler, yana dön, otur) çalar. Uyku dersinde bu düğme "Uykuya bırak" olur ve uyku iznine geçer |
| **Durdur (X)** | Hemen çalışır, onay sorusu yok (özerklik). Ses 2 sn'de söner. Ekran: "Gözlerini aç, etrafına bak, acele etme. Uzanıyorsan önce yana dön, sonra otur." + isteğe bağlı 20 sn'lik sesli dönüş (güvenlik §11.D-4). Teslim dosyasının "≥ 3 sn" önerisi yerine güvenlik dosyasının "1–2 sn"si seçildi: durmak isteyen hemen durabilmeli |
| **Sarma (seek)** | İnce ilerleme çizgisinde bölüm işaretleri var. Parmak bıraktığı yerde **en yakın klip başına** oturur; bölüm listesinden "Beden dolaşımı" gibi bir bölüme de atlanabilir. Müzik çapraz geçişle o evreye geçer, görsel o evrenin durumuna 2 sn'de kayar. Kapanışın içine sarılırsa kapanışın başından çalar. "İstediğim dakikasını dinlerim" isteği böyle karşılanır: seçilen süre + istenen bölümden başlama |
| Telefon araması, Siri | `.began` → duraklat ve JS'ye bildir. `.ended` + `shouldResume` → klibin başından sürdür; `shouldResume` yoksa duraklatılmış kalır, ekran da durur (sayaç motordan okunduğu için ayrışmaz; kod-haritasi R4) |
| Kulaklık çıktı | Hemen duraklat (Apple HIG, pazar.md §6.3). Bugün rota gözlemcisi yok (kod-haritasi R5), eklenecek |
| Ekrandan çıkmak | Ders modül dışı bir oturumda sürer (`sleepSession.js` kalıbı, kod-haritasi §2.3); başka ekrana geçmek dersi kesmez |
| Kilitli ekran | Yerel motor `.playback` oturumunda çalar; kilit ekranında ders adı, bölüm adı, geçen/toplam süre ve oynat/duraklat (MPNowPlayingInfoCenter + MPRemoteCommandCenter; bugün yok, kod-haritasi R6). Başka düğme eklenmez ("Avoid repurposing audio controls") |

### B.6 Uyku dersinin sonu

- Uyku izni cümlesi, ardından ses kademeli olarak susar. Müzik ve yağmur, kişinin seçtiği kuyruk süresince çalar, son
  3 dk kosinüs eğrisiyle kısılır ve **tamamen durur**. Uyandırma cümlesi yoktur (güvenlik §11.B-15).
- Kuyruk sırasında ekran kararır (neredeyse siyah); dokununca yalnız "Durdur" görünür.
- İsteğe bağlı (v2): ders bitince mevcut uyku müziğine ve alarm kurulumuna devam (aynı yerel oynatıcı; kod-haritasi
  §2.3). Bugün ders ile uyku sesi aynı anda çalamaz (R3), bu yüzden devir sırayla yapılır.

---

## C. Metin stil kılavuzu (Türkçe)

Her ders metni ElevenLabs'e gitmeden önce **üç ayrı incelemeden** geçer: (1) Türkçe editör (TDK yazımı, anlatım bozukluğu,
cümle düşüklüğü, çeviri kokusu; sahibin 5. isteği), (2) güvenlik listesi (güvenlik §11.B'nin 18 kuralı), (3) "usta hoca"
ölçütleri (§E.6). Seslendirmeden sonra her klip yazıya geri çevrilir ve metinle karşılaştırılır.

### C.1 Ses ve kip
- **İkinci tekil "sen"**, şimdiki ya da geniş zaman: "Nefesin göğsünü yavaşça dolduruyor."
- **Davet, komut değil:** "İstersen gözlerini kapatabilirsin." / "Dikkatini ellerine getirebilirsin." Emir kipi
  yalnız güvenlik cümlelerinde ve bedensel yönergelerde kısa ve net: "Başın dönerse otur." (güvenlik §11.B-1; Ciaramella
  2024'te hem doğrudan hem dolaylı telkin etki gösterdi, hangisinin üstün olduğu kanıtlanmadı: PMID 39243923, DOI
  [10.1016/j.jpain.2024.104671](https://doi.org/10.1016/j.jpain.2024.104671)).
- **Beden dolaşımında isim cümlesi:** bloğun başında izin çerçevesi kurulur ("Adını söylediğim yeri yalnızca fark et;
  bir şey yapman gerekmiyor."), sonra yalnız yer adları: "Sağ elin başparmağı… işaret parmağı… orta parmak…". Yön
  sırası her derste aynı: sağ → sol → arka → ön → bütün.
- **Kontrol kişide:** "Ne kadar gevşeyeceğine sen karar verirsin." Sınama telkini yok ("Kolların öyle ağır ki
  kaldıramıyorsun" yok).
- **Başarısızlık yok:** "Zihnin dağıldıysa bu da pratiğin parçası. Fark ettiğin an, zaten geri döndün."

### C.2 Cümle, hız ve yoğunluk
- Bir cümlede bir yönerge; **6–12 sözcük**, en çok 14 (teslim §4.5, VARSAYIM).
- **Cümle içi hız:** Varış 3,0–3,6 hece/sn → derin bölüm 2,5–3,0 hece/sn; **hiçbir cümle 2,5 hece/sn'nin altına
  inmez** (teslim S4, VARSAYIM). Dayanak: aşırı yavaş (1,72 hece/sn) ve çok duraklamalı konuşma en az doğal bulundu;
  alışkın okuma 3,89 hece/sn ile en doğaldı (Shuminsky & Davidow 2026, PMID 42757902, DOI
  [10.1044/2026_JSLHR-25-00691](https://doi.org/10.1044/2026_JSLHR-25-00691)). Yavaşlık sözcükleri uzatarak değil,
  **cümleler arası sessizlikle** verilir.
- **Yoğunluk** (sessizlik dahil, dakikadaki hece): Varış 90–110; beden dolaşımı 100–120; derinleşme 50–70; sessiz
  pencere 0. Ders ortalaması 5 dk'da ≈ 85, 30 dk'da ≈ 55–65 hece/dk (VARSAYIM). Karşılaştırma: Kirschner 2019
  kayıtlarında 11,5 dk'da 610–630 İngilizce sözcük vardı (dakikada ~53–55 sözcük); bu bir deney kaydının yoğunluğudur,
  en iyi değer olarak test edilmedi (benlik §1.5). Türkçe için sözcük değil hece ölçülür, çünkü Türkçe sözcükler daha
  uzun.
- **Tahmini metin uzunluğu:** 30 dk sürüm ≈ 1.650–2.100 hece (≈ 600–750 sözcük); kısa Varış/Kapanış ve köprülerle
  ders başına benzersiz metin ≈ 800–1.200 sözcük (VARSAYIM; metin yazılınca ölçülür).
- **Azalan anlatım:** her ders içinde hız, yükseklik ve perde varıştan derinleşmeye kademeli azalır (Knowlton &
  Larkin 2006). Gündüz kapanışında hız ve yükseklik yeniden konuşma düzeyine çıkar.

### C.3 Duraklama gösterimi ve TTS'e aktarımı
| Gösterim | Anlamı | Nasıl üretilir |
|---|---|---|
| `,` `.` `…` `—` | cümle içi doğal duraklar | TTS'in kendisi (model rehberi: virgül/nokta doğal duraklama, üç nokta daha uzun, uzun çizgi kısa vuruş; elevenlabs.md §2.1) |
| `‖` | klip sınırı | her klip ayrı TTS isteği; komşu cümleler `previous_text` / `next_text` olarak verilir |
| `[4]` | klipten sonra 4 sn sessizlik (sabit) | uygulamanın zaman çizelgesi (dijital sessizlik; müzik sürer) |
| `[4–10]` | esnek sessizlik (min–maks) | planlayıcı süreye göre seçer |
| `[P≤90: "Birkaç nefes sessizlik… sonra sesim geri gelecek."]` | müzik penceresi, önce duyurulur | zaman çizelgesi; duyuru bir klip |
| `{nefes 4/6 ×3}` | nefes döngüsü ipucu | "al" / "ver" mikro-klipleri döngü sınırlarına konur; görsel buna kilitlenir |

- `<break>` etiketi **kullanılmaz**: en çok 3 sn, fazlası "hızlanma ya da ses bozulması" yapabilir (elevenlabs.md §2.2)
  ve gerçekten sessizlik ürettiği doğrulanmadı (§2.3). Bütün uzun sessizlikler uygulamada.

### C.4 Tekrar ve derinleşme kalıpları
- Dersin **anahtar cümlesi** çekirdekte üç kez, her seferinde biraz daha kısa ve yumuşak (VARSAYIM).
- Geri sayma: her sayı bir nefes döngüsüne denk ("On… nefes veriyorsun… dokuz…"). Sayı kaybolursa: "Sayıyı
  kaybettiysen baştan başla; bu da olur."
- İmge somut duyuya bağlanır: sıcaklık, ağırlık, temas, ses, koku; görme tek başına bırakılmaz.
- Her dersin **tek bir imge yayı** vardır (ör. Ders 2: kıyıya iniş → suyun kenarında dinlenme → kıyıdan dönüş). Ani
  dramatik kırılma yok.
- Aynı dersin tekrarında ezber şikâyeti (pazar.md §6.2) için v2'de imge ve geçiş cümlelerinden küçük bir havuz; ilk
  sürümde tek metin.

### C.5 Travma-duyarlı kurallar (özet; tam liste güvenlik §11.B)
Gözleri açık seçeneği her zaman; "istediğin an durabilirsin" açılışta, 30 dk'da ortada bir kez daha; zor bölümden önce
tarafsız dayanak ve çıkış kapısı; ağrılı bölgeyi atlama izni; imgede seçenek (su, derinlik, kapalı alan, yükseklik,
karanlık herkese iyi gelmeyebilir); anı arama, geriye gitme, "en acı anını hatırla" yok; öz-şefkat kademeli; sessizlik
rehberli ve ≤ 90 sn; hareket hafif ve "ağrı olursa bırak"; kişiye özel tıbbi uyarı derste değil kartta.

### C.6 Yasak sözcük ve iddialar
- Sağlık iddiası: tedavi, iyileştirir, şifa, detoks, kanıtlanmış, bilimsel olarak, "kaygını yok eder", "uykusuzluğa
  son", "stresini azaltır".
- Kanıtsız mekanizma: frekans, Hz, teta dalgası, bilinçaltı, programlama, çekim yasası, bolluk, çakra açma, enerji
  bedeni.
- Kontrol kaybı: "kontrolü bırak", "kendini kaybet", "iraden eriyor", "kıpırdayamıyorsun", "tamamen gevşedin".
- Varsayılan nefes komutu olarak "derin bir nefes al… tut".
- Olumlama tekrarı: "Ben harikayım", "Sevilmeye değerim" (Wood 2009).
- Uygulama metninde "hipnoz" klinik yöntem adı olarak geçmez; sahibin "hipnoz olmalıyım" isteği "içine çeken, kesintisiz
  deneyim" diye karşılanır ve kimseye vaat edilmez (Cordi 2014: telkin etkisi düşük yatkınlıkta görülmedi; PMID
  24882909, DOI [10.5665/sleep.3778](https://doi.org/10.5665/sleep.3778)).
- "Şükür" yerine "şükran" (dinî çağrışım; pazar.md §7 #10).

### C.7 TTS için Türkçe söyleyiş tuzakları
- `eleven_multilingual_v2`'de fonem/IPA etiketi çalışmaz; yalnız **alias** (yazım değiştirme) sözlüğü ve fonetik yazım
  kullanılabilir (elevenlabs.md §2.2). Hangi sözcüklerin yanlış okunacağı **doğrulanmadı**; pilotta ölçülür.
- **Sanskritçe terimler seste en aza iner.** Ekranda "Yoga Nidra", "sankalpa" yazabilir; seste ilk geçişte bir kez,
  Türkçe yazımla: "şavasana", "sankalpa", "bramari", "nadi şodana", "drişti". Sonrası Türkçe: "niyet", "vızıltılı nefes".
- Sayılar sözcükle yazılır ("dört", "on"); kısaltma yok ("dk" değil "dakika").
- Düzeltme işaretleri doğru kullanılır (hâlâ / hala, kâr / kar); ğ'li sözcükler ("değil", "ağırlık", "yumuşacık")
  ve soru eki ("mı") vurgusu dinlenerek denetlenir.
- Eşyazımlılar bağlamla netleştirilir: "yüz" (surat / sayı), "gül", "dolu", "kurt".
- İngilizce sözcük yok (mindfulness, body scan yerine farkındalık, beden taraması).
- Vurgu için büyük harf yalnız gerektiğinde ve seyrek (model rehberi).

### C.8 Örnek (Ders 2, Varış, 15 dk sürüm; biçimi göstermek için, son metin değil)

```
Hoş geldin. [2]
‖ Sırtüstü uzan ya da sana en rahat gelen biçimde yerleş. [4]
‖ İstersen dizlerinin altına bir yastık koyabilirsin. [4–6]
‖ İstediğin an gözlerini açabilir, kıpırdayabilir ya da durabilirsin. [3]
‖ Gözlerini kapatabilir ya da bakışını tavanda bir noktaya yumuşakça bırakabilirsin. [5]
‖ Bedeninin ağırlığını altındaki zemine bırakabilirsin. [6–10]
‖ Nefesini değiştirmeden, yalnızca fark et. [8–12]
‖ Şimdi kendine kısa bir niyet seç. Bugün sana iyi gelecek, basit bir cümle. [3]
‖ Kendi cümleni bulamazsan şunu kullanabilirsin: "Dinlenmeye izin veriyorum." [3]
‖ Niyetini içinden bir kez söyle. [8]
```

---

## D. Ses üretim özellikleri

### D.1 Seslendirme (TTS)
- **Yol:** ElevenLabs **REST API** betiği (`app/design/yoga/tts.py`), anahtar yalnız ortam değişkeninden
  (`ELEVENLABS_API_KEY`); anahtar depoya, uygulamaya ve belgelere girmez (ANA_BELGE.md:84-86, kod-haritasi §7).
  Neden MCP değil: MCP araçları yalnız `voice_id` ve `language_code` alıyor; stability, similarity, style, speed, seed,
  `previous_text/next_text`, çıktı biçimi ve telaffuz sözlüğü yalnız REST'te (elevenlabs.md §2.1). MCP ayrıca
  varsayılan olarak **4 varyasyon** üretir ve 4 kat ücretler.
- **Model ve sesler:** `eleven_multilingual_v2`; Neslihan `wQ7dVQFxIqwokkwsMqqn`, Hakan `DwjDVVARfPVjBKepXK2c`. Yeni ses
  tasarlanmaz, klonlanmaz. Sahibin "sesleri eğitmen gerekecek" isteği şöyle karşılanır: ayar ızgarası + telaffuz
  sözlüğü + metin biçimi + klip başına seçim.
- **Ayar ızgarası (pilot):** stability {0,55 · 0,65 · 0,75} × speed {0,85 · 0,90 · 0,95} (izinli aralık 0,7–1,2),
  similarity 0,75 ve style 0 (varsayılanlar), speaker boost açık. Her iki ses için altı temsilî klip (varış, beden
  dolaşımı, geri sayma, imge, uyku izni, gündüz kapanışı). Her hücre ölçülür (hız, F0, doğallık) ve kör dinletilir.
  Kazanan ayar, dersin **üç evresi** için sabitlenir: Varış, Derinleşme, Derin (hız ve stability evreye göre; Knowlton
  2006 yönünde). Başlangıç değerleri **VARSAYIM**.
- **Süreklilik:** her klip için sabit `seed`; komşu cümleler `previous_text` / `next_text`. `previous_request_ids`
  (en çok 3, 2 saat geçerli) aynı blok içinde kullanılır (elevenlabs.md §2.2).
- **Çıktı biçimi:** tercih `pcm_44100` (Pro katman ister); olmazsa `mp3_44100_192` (Creator); o da olmazsa
  `mp3_44100_128`. Hesabın katmanı **doğrulanmadı**.
- **Seçim:** her istek tek üretim (`generations_count` karşılığı 1). Yalnız başarısız klip yeniden üretilir.

### D.2 Klip işleme (`app/design/yoga/voice.py`, numpy/scipy/soundfile/pyloudnorm; bu ortamda var)
- Baş ve son sessizlik kırpma: −50 dBFS eşik, önde 60 ms, sonda doğal nefes kuyruğu için 250 ms pay, 10 ms yumuşak
  uçlar (VARSAYIM; voicePack.js'teki %2 eşik ve 8 ms geçişle aynı mantık, kod-haritasi §3).
- Yüksek geçiren: kadın ses 90 Hz, erkek ses 70 Hz, 2. derece (VARSAYIM).
- Sızıltı (de-ess): yalnız 5–9 kHz bandı eşiği aşarsa, en çok 4 dB (VARSAYIM). Ağır sıkıştırma yok: +10 dB SBR'de
  sıkıştırma algılanan konuşma netliği puanını düşürdü (Rallapalli 2026, işitme cihazı simülatörü, n=15, PMID 41949420,
  DOI [10.1044/2026_AJA-25-00171](https://doi.org/10.1044/2026_AJA-25-00171)). Ses ve müzik ayrı işlenir.
- Seviye: her klip −18 LUFS (±0,5), gerçek tepe ≤ −1,5 dBTP. Bugünkü kısa komutlar tepe değerine göre eşitleniyor
  (voicePack.js:104-105, kod-haritasi §3); dersler LUFS'e göre eşitlenir.
- Evre eğrisi: aynı ders içinde Derinleşme evresi klipleri −1,5 dB, Derin evre −3 dB (azalan anlatım; VARSAYIM).
- Oda sesi eklenmez; müzik yatağı boşlukları taşır.

### D.3 Müzik yatakları ve doğa katmanı
- **Her ders için üç evre yatağı:** Varış, Derin, Kapanış (gece dersinde Kapanış yerine "Uyku" yatağı ve kuyruk).
  Her biri 120–180 sn, döngülenebilir.
- **Üretim:** ElevenLabs Music `eleven_music_v2_5`, `instrumental: true`, istemde "very slow, no drums, no percussion,
  no vocals, no choir, no crescendo, flat dynamics, sustained" ve derse özgü tını (§A.2). Tempo ve ton parametresi yok,
  yalnız istemle (elevenlabs.md §3). Evre başına 2–3 aday üretilir, en iyisi seçilir. Doğa katmanı `eleven_text_to_sound_v2`,
  `loop: true`, 30 sn (döngülü olanlar yalnız MP3; elevenlabs.md §4). Nefes blokları için yatak müzik değil **bordun**
  olur (cümle yapısı nefes ipuçlarıyla çatışmasın).
- **Son işlem** (`app/design/yoga/master_bed.py`, design/dalga-uyku/master.py:1-6 kalıbı): çembersel filtre (dikiş
  yok), yüksek geçiren 150 Hz (VARSAYIM; uyku müziği 300 Hz kullanıyor ama o konuşmasız), 1,5–4 kHz'de 3–6 dB çukur
  (konuşmaya yer; teslim §2.4, VARSAYIM), −24 LUFS yatak seviyesi, ≤ −1,5 dBTP.
- **Döngü:** motor iki kopyayı 8 sn eşit güçte çapraz geçişle çalar. MP3/AAC başındaki ~50 ms boşluk (HATA_GUNLUGU.md:556,
  kod-haritasi §2.7) çapraz geçiş altında kalır; bu yüzden WAV zorunlu değil. Evreler arası geçiş de 8 sn çapraz geçiş.
- **Hoparlör dersi:** Bug 20/22'nin kök nedeni, enerjinin 300 Hz altında olmasıydı (kod-haritasi §2.7). Yatakta ölçüt:
  300 Hz altı ≤ %10, 500 Hz–4 kHz ≥ %40 (VARSAYIM; uyanma-sesleri README'deki Dalga profili 300 Hz altı ≤ %5 ve
  500 Hz–4 kHz ≥ %50 arıyor, yatak konuşmaya yer açmak için bundan biraz ayrılır).
- **Binaural katman yok** (hoparlörde anlamsız; kanıt karışık: Ingendoh 2023, PMID 37205669, DOI
  [10.1371/journal.pone.0286023](https://doi.org/10.1371/journal.pone.0286023)).

### D.4 Karışım (motorda, çalışma anında)
| Değer | Hedef | Dayanak |
|---|---|---|
| Konuşma sırasında müzik | konuşmanın ≥ 15 dB altında (3 sn kısa süreli LUFS) | Lee 2022: konuşma dinlerken kabul edilen arka plan ortalama 7,2 dB aşağıda (12 konuşmacılı uğultu; PMID 34759206, DOI [10.1097/AUD.0000000000001157](https://doi.org/10.1097/AUD.0000000000001157)); telefon hoparlörü ve yaşlı dinleyici payı → **VARSAYIM** |
| Kısma (ducking) | zaman çizelgesinden önceden hesaplanır: klipten 1,5 sn önce iner, klip bittikten 2,5 sn sonra kalkar; iki klip arası < 6 sn ise inik kalır (pompalama olmasın) | VARSAYIM |
| Sessiz pencerede müzik | en çok +6 dB, rampa ≥ 2 sn | teslim K3; Bernardi 2009 kreşendo yönü |
| Konuşma ↔ müzik kaydırıcısı | kişi ±6 dB oynatabilir, varsayılan 0 | pazar.md §6.1 (Headspace) |
| Ders geneli | gündüz −18 LUFS ±1, gece −20 LUFS ±1; gerçek tepe ≤ −1,5 dBTP; iki ses arasında ±1 LU | teslim K5, VARSAYIM |
| Başlangıç | ses 3 sn'de açılır, sistem ses düzeyine dokunulmaz | dalgaAudio.js:296 kalıbı; güvenlik §11.D-7 |

### D.5 Biçim, bit hızı ve boyut
- **Arşiv (depoya girmez, sahibin Mac'inde):** konuşma 44,1 kHz 16 bit mono WAV, yataklar 44,1 kHz stereo WAV.
- **Uygulama:** konuşma AAC-LC mono 48 ya da 64 kbit/sn (M4A), yataklar AAC-LC stereo 80–96 kbit/sn, doğa MP3
  (döngülü SFX yalnız MP3). AAC bu ortamda üretilemez (ffmpeg ve afconvert yok; kod-haritasi §4), Mac'te `afconvert`
  ile üretilir (doğrulanmadı). Yedek: MP3 128 mono (bugünkü biçim, lameenc burada var). 48 ile 64 arasında seçim
  pilotta kör dinlemeyle yapılır.
- **Boyut tahmini** (10 ders × 2 ses; konuşma = benzersiz sözcük × 2,8 hece/sözcük ÷ 2,8 hece/sn; hepsi VARSAYIM):

| Benzersiz metin / ders | Konuşma / ders / ses | AAC 48 | AAC 64 | MP3 128 (bugünkü) |
|---|---|---|---|---|
| 800 sözcük | 13,3 dk | 96 MB | 128 MB | 256 MB |
| 1.200 sözcük | 20,0 dk | 144 MB | 192 MB | 384 MB |

  Yataklar (10 × 3 × 150 sn, AAC 80–96 stereo) ≈ 45–54 MB; doğa (8 × 30 sn MP3 128) ≈ 4 MB. **Toplam ek ≈ 125–215 MB**
  (AAC 48/64). Bugünkü ham paket ≈ 81 MB (kod-haritasi §5). elevenlabs.md'deki "ders başına 2.000 sözcük" varsayımı bu
  tasarımla uyuşmaz: 2.000 sözcük ≈ 33 dk konuşma eder, 30 dk derse sığmaz; üst sınır olarak yalnız maliyette tutuldu.
- Ölü yük temizliği (öneri): iOS'ta çalınmayan `public/sleep/sakin-fade-*.mp3` ≈ 7,6 MB (kod-haritasi §8.3).

### D.6 Nesnel kalite denetimi (`app/design/yoga/qa.py`; design/uyanma-sesleri/analyze.py üslubu: her ölçüm + eşik, biri geçmezse çıkış kodu 1)

**Klip düzeyi** (her klip, her ses):
- Yazıya geri çevirme (ElevenLabs Scribe) ile metin **harf harf** aynı (noktalama ve büyük harf normalize). Sapma → yeniden üretim.
- Cümle içi hız 2,5–3,6 hece/sn bandında, evre hedefine uygun.
- F0 ortalaması ve yayılımı aynı sesin normal okumasından düşük ve dar (Diel 2025: sakin ElevenLabs seslerinde ortalama
  perde ve perde değişkenliği daha düşüktü, heyecanlı sesler daha tekinsiz bulundu; PMID 41057603, DOI
  [10.1038/s41598-025-21290-1](https://doi.org/10.1038/s41598-025-21290-1)). F0 aracı bu ortamda **doğrulanmadı**
  (Praat ya da pyin).
- Baş kesikliği yok (ilk 30 ms'de sıfırdan yükselen zarf), son kesikliği yok (son 10 ms < −40 dBFS).
- Tık yok (analyze.py `clicks_db` kalıbı, 10 kHz üstü kısa tepe), DC < 1e-4, kırpılma yok, −18 LUFS ±0,5, ≤ −1,5 dBTP.
- Sızıltı oranı (5–9 kHz enerji payı) eşiği aşmıyor (eşik pilotta konur).

**Plan düzeyi** (her ders × 5, 7, 10, 12, 15, 20, 23, 30 dk × iki ses, çevrimdışı tam karışım basılır):
- Toplam = hedef ±1 sn; Varış ve Kapanış eksiksiz; kesilen klip yok; üst üste binme yok.
- En uzun sessizlik sınırı aşmıyor (≤ 90 sn; Ders 4'te ≤ 45 sn).
- Konuşma anlarında konuşma − müzik ≥ 15 dB; müzik kabarması ≤ +6 dB ve rampa ≥ 2 sn; kreşendo yok (10 sn pencerede
  müzik yüksekliği tekdüze artmıyor).
- Ders geneli LUFS ve gerçek tepe hedefte.
- **Anlaşılırlık vekili:** tam karışım (müzikli) yazıya geri çevrilir; sözcük hata oranı ≤ %2 (VARSAYIM). Aynı test
  **hoparlör benzetimiyle** tekrarlanır (350 Hz yüksek geçiren + 8 kHz alçak geçiren; README'deki "350 Hz yüksek
  geçirende kayıp" fikri).
- Konuşma anlarında 1–4 kHz bandında konuşma/müzik farkı ≥ 15 dB (VARSAYIM).
- Müzik izinde 20 ms'den uzun boşluk ya da döngü dikişinde tık yok; mono uyumu.

**İnsan düzeyi:**
- Kör dinleme: en az 5 dinleyici, her sürüm için 0–10 doğallık, sakinlik, anlaşılırlık; ortalama ≥ 8 ve hiçbir puan
  < 6 (VARSAYIM). Eşik altı olan klip ya da karışım yeniden yapılır.
- Cihaz: iPhone hoparlörü + kablolu kulaklık + AirPods; sessiz oda + beyaz gürültülü oda.

---

## E. Uygulama tasarımı

### E.1 Ekranlar
1. **Yoga kütüphanesi.** Üstte "Kaldığın yerden" kartı (yarım kalan ders). 10 ders kartı: başlık, alt başlık, günün
   saati simgesi (gündüz/gece), duruş simgesi (oturarak/yatarak), varsayılan süre. Süzgeç çipleri: Gündüz · Gece ·
   5 dakikada. Gece 21:00 sonrası Uykuya Geçiş en üstte (VARSAYIM saat). İlk girişte güvenlik kartı bir kez (güvenlik
   §11.A metni aynen; Safety.jsx:7-9 kararıyla uyumlu: kilit ve onay kutusu yok).
2. **Ders ayrıntısı + ZAMANLAYICI.** Başlık, tek satır söz, "Bu derste" üç madde. **Süre seçici** ekranın merkezinde:
   büyük dakika sayısı, altında 5–30 kaydırıcı (1 dk adım) ve 5 · 10 · 15 · 20 · 30 çipleri; dersin varsayılanı ile
   açılır, son seçim hatırlanır (Calm'da bu özellik kaldırılınca şikâyet geldi: pazar.md §9-1). Seçici değiştikçe
   hemen altında o sürenin **bölüm şeridi** canlı güncellenir ("Varış · Beden dolaşımı · Nefes · Kapanış") ve ne
   değiştiği görünür (ör. 15'e çıkınca "Zıtlık çiftleri eklendi"). Ses (Neslihan / Hakan), arka plan (Müzik / Doğa /
   Sessizlik), konuşma ↔ müzik dengesi, duruş cümlesi, "Kaynaklar" kartı (FACTS kalıbı: dalga.js:119-131), "Başla".
   Uyku dersinde ek: müzik kuyruğu 0 / 5 / 10 / 20 dk.
3. **Önce puanı** (tek kaydırıcı 0–10, "Atla" var). Dalga'nın puan bileşeni yeniden kullanılır (Dalga.jsx:45-53,
   kod-haritasi §8.2).
4. **Oynatıcı** (§E.2). Denetimler 5 sn sonra kaybolur, dokununca döner: kalan süre (motordan), ince bölüm çizgisi
   (sarma), Duraklat, "Kapanışa geç", X.
5. **Sonra puanı** + isteğe bağlı "Ders sırasında zorlandın mı? Hayır / Biraz / Çok" (güvenlik §11.F; "Çok" cevabına
   sabit metin, veri telefonda kalır, puan olarak gösterilmez).
6. **Tamamlandı.** Dinlenen dakika, ulaşılan bölüm, önce → sonra, "Bu derse neden böyle kurduk" kaynak kartı, bir
   sonraki öneri (zorlandıysa aynı dersin daha kısa ve gözleri açık sürümü).
7. **Durdurma ekranı** (§B.5).

Önce tasarım Artifact'ı, onaydan sonra kod (ANA_BELGE.md:51-52, kod-haritasi §8.2 N2). "Bitti" demeden önce her ekran
iki temada görülür (ANA_BELGE.md:53-56); oynatıcının tema dışı kalması sahibin kararı (§G3).

### E.2 Ders içi görsel: ses, müzik ve görüntü tek zaman çizelgesinde

**Tek gerçek kaynak:** planlayıcının ürettiği olay listesi. Yerel motor bu listeyi örnek hassasiyetinde çalar ve
~20 Hz'de konumunu (`positionSec`, o anki olay kimliği) JS'ye bildirir. Görsel `Date.now` ile değil, bu konum +
cihazın bildirdiği çıkış gecikmesiyle ilerler (`AVAudioSession.outputLatency`; Bluetooth gecikmesi ölçülmeden
eşzamanlılık iddia edilmez; kod-haritasi N10). Böylece duraklatma, arama ve sarmada ses ile görüntü ayrışmaz.

**Nefes formu (her derste aynı dil, derse özgü biçim):**
- Neredeyse siyah sahnede tek, yumuşak kenarlı ışık formu. Nefes ipucu olan yerde (`{nefes 4/6}`) form "al"
  mikro-klibiyle aynı anda 4 sn'de büyür, "ver" ile 6 sn'de küçülür. Ses ne diyorsa görüntü onu yapar.
- Nefes ipucu yoksa form, yatağın ~10 sn'lik cümle periyodunda çok küçük genlikle "kendi kendine" nefes alır.
- Sessiz pencerede form biraz daha kararır ve yavaşlar; pencere bitmeden 3 sn önce hafifçe aydınlanır (ses geri
  gelecek).
- **Evre ışığı:** Varış en aydınlık (ama yine koyu), Derinleşme daha loş, Derin en loş. Gündüz kapanışında 60–90 sn'lik
  bir "şafak": form ve zemin yavaşça ısınır ve aydınlanır (dışa dönüşe eşlik). Gece dersinde son dakikalarda form
  kehribar bir köze dönüp söner ve ekran siyah kalır (gece saatinin kehribar dili; releases.js 28 Eylül maddesi).
- **Derse özgü biçimler** (aynı gramer): 1 genişleyen halka · 2 ufuk çizgisi · 3 sönen kor · 4 akan tek çizgi (dere) ·
  5 tek ışık noktası · 6 yükselen ufuk ışığı · 7 göğüs hizasında sıcak ışık · 8 yere yakın, genişleyen taban çizgisi
  (dağ) · 9 yavaş halkalanan su yüzeyi · 10 uzakta bir ışığa uzanan yol çizgisi.
- **Yasaklar:** yanıp sönme yok (DalgaVisual.jsx:4-6 ilkesi), okunacak yazı yok (gözler kapalı), ani renk geçişi yok.
  Ekran parlaklığı en fazla ~%15 bağıl (gece ~%4) (VARSAYIM).
- **Hareketi Azalt:** form ölçeklenmez; yalnız opaklığı çok yavaş değişir (DalgaVisual.jsx:23 kalıbı).
- **Erişilebilirlik:** "Altyazı" isteğe bağlı (varsayılan kapalı): o anki cümle altta, sönük; işitme güçlüğü olanlar
  için. Ekran ile ses aynı cümleyi söyler (ANA_BELGE.md:57-59).

**Paleti:** zemin #050A12 (dalga.css:52 ile aynı aile), her dersin tek vurgu rengi (ör. Derin Dinlenme soluk deniz
mavisi, Uyku kehribar, Sabah şafak turuncusu). Tasarım Artifact'ında kesinleşir.

### E.3 Yerel ses motoru (N4) ve köprü (N5), özet
- iOS: `YogaAudio` sınıfı, AVAudioEngine + iki AVAudioPlayerNode (konuşma, müzik) + üçüncü düğüm (doğa). Olaylar
  `AVAudioTime` ile planlanır; kısma ve kabarma kazanç otomasyonuyla (Aday A; kod-haritasi §8.2 N4). Yataklar dosyadan
  akışla okunur (180 sn stereo Float32 ≈ 63,5 MB belleğe çözülmez).
- Oturum `.playback`; `AppAudioSession`'daki `sleepActive` bayrağı "medya oturumu sahibi" diye genelleştirilir, yoksa
  ekran açılınca tercih yeniden uygulanıp dersi susturur (FeedbackPlugin.swift:247, HATA_GUNLUGU.md:601-604;
  kod-haritasi R9). Ders, "seslendirme kapalı" tercihinden etkilenmez: anlatım dersin kendisidir (voiceCue.js:13 kuralı
  derse uygulanmaz; öneri).
- Now Playing + uzaktan komut; kesinti ve rota gözlemcisi; dinlenen süre UserDefaults'a da yazılır ve uygulama
  açılınca JS uzlaştırır (kod-haritasi R7).
- **pbxproj:** sahibin Mac'inde `project.pbxproj` birleştirme çakışması var. Sınıf yeni dosya yerine var olan bir Swift
  dosyasına eklenir ve MainViewController.swift:25-35'e bir kayıt satırı yazılır; böylece pbxproj'a dokunulmaz
  (kod-haritasi §8.2 N4). Ses dosyaları `public/` klasör referansıyla kendiliğinden pakete girer.
- Swift bu ortamda derlenmez; ilk doğrulama Mac'te (ANA_BELGE.md:90-91).
- Web yedeği yalnız tarayıcı önizlemesi içindir (Web Audio; kilit ekranı riski R1–R2 nedeniyle iOS'ta kullanılmaz).

### E.4 Modül kaydı (`src/modules/yoga/manifest.js`, öneri)
```
id: 'yoga', ring: 'life', kind: 'practice', title: 'Yoga', label: 'yoga',
home: { section: 'practice', order: 33 },        // Nefes 30, Dalga 35, Gökyüzü 36 arası (VARSAYIM)
gates: {},                                        // göz bütçesine sayılmaz
storageKeys: ['gozolcum:yoga-opts'],
progress: {
  domain: 'calm',                                 // modülün tek alanı (bugünkü sözleşme; §G1)
  effects: [                                      // her ders kendi alanıyla (dalga/manifest.js:19-23 kalıbı)
    { key: 'yoga-nefes',   measure: 'gerginlik',      max: 10, better: 'down', domain: 'calm' },
    { key: 'yoga-nidra',   measure: 'beden gerginliği', max: 10, better: 'down', domain: 'body' },
    { key: 'yoga-zor',     measure: 'duygu yoğunluğu', max: 10, better: 'down', domain: 'calm' },
    { key: 'yoga-odak',    measure: 'toplanmışlık',   max: 10, domain: 'focus' },
    { key: 'yoga-sabah',   measure: 'enerji',         max: 10, domain: 'wellbeing' },
    { key: 'yoga-sefkat',  measure: 'kendine yumuşaklık', max: 10, domain: 'self' },
    { key: 'yoga-saglam',  measure: 'sağlamlık',      max: 10, domain: 'self' },
    { key: 'yoga-tanima',  measure: 'beden farkındalığı', max: 10, domain: 'awareness' },
    { key: 'yoga-gelecek', measure: 'umut',           max: 10, domain: 'wellbeing' } ],
  metrics: [ { key: 'yoga-uyku-dalma', label: 'Uykuya dalma kolaylığı (ertesi sabah)', max: 10, domain: 'wellbeing' } ] },
sessions: { match: (s) => s?.type === 'yoga', countsTowardGoal: true, describe, best: 'gün sayısı' },
stats(): 3 satır — son 7 günde dakika · tamamlanan ders · gün sayısı,
coach(): en çok 6 alan — ders adı, süre, tamamlandı mı, önce→sonra.
```
- **Kayıt:** `{ type:'yoga', lesson, voice, bg, planned, seconds, reachedClosing, completed, before, after, delta,
  hard: 'no'|'some'|'much'|null }` (dalga.js:99-117 `makeRecord` kalıbı). 30 sn'den kısa dinleme kaydedilmez
  (Dalga.jsx:20). **Tamamlandı = kapanışa ulaşıldı**; 5 dk'lık ders de tamamlanmış sayılır (sakin §11.8).
- `effects` içindeki `pick` işlevleri `s.lesson` değerine göre çift döndürür (dalga manifestindeki gibi). `acuteEffects`
  en az 3 oturum ve %95 GA sıfırı içermiyorsa "anlamlı" der (progress.js:72-73); kartta "Kontrol grubu yok…" notu
  (progress.js:71) kalır.

### E.5 Gelişim istatistikleri
- **Pratikler kartı** (`stats`, en çok 3 satır): son 7 günde dakika, tamamlanan ders, pratik yapılan gün.
- **Ödül gün sayısıdır, süre değil.** Süre rekoru yok: gözetimsiz ve aşırı pratik vakalarıyla tutarlı (güvenlik §4) ve
  tekrarın uzunluktan daha çok önemli olduğunu gösteren veri daha fazla (sakin §8 sonucu).
- **Alan kartları:** her dersin önce → sonra etkisi kendi alanına düşer (registry.js:154 alan geçersiz kılma;
  kod-haritasi §1.1). Metin: "Son 6 oturumda ortalama −1,8 puan (GA …). Kontrol grubu yok; dinlenmenin ve beklentinin
  etkisi ayrılamaz." "Stresini azalttı", "bilimsel olarak kanıtlandı" gibi cümle yok (Larsen 2019: 73 uygulama
  açıklamasının %64'ü etkinlik iddia etti; PMID 31304366, DOI [10.1038/s41746-019-0093-1](https://doi.org/10.1038/s41746-019-0093-1)).
- **28 günlük düzen dilimi** bugün modülün tek alanını sayıyor (dataHub.js:36-38; kod-haritasi §1.3). Her dersin kendi
  dilimine düşmesi için sözleşme değişikliği gerekir (§G1).

### E.6 "Usta hoca" ölçütleri (metin ve dinleme incelemesinde işaretlenir)

Kanıt bu ölçütlerin çoğunu doğrudan sınamadı; bunlar ustalığı **denetlenebilir** kılmak içindir. Her madde evet/hayır;
tek "hayır" metni yeniden yazdırır.

1. **Zaman verir:** her yönergeden sonra, istenen eylemin süresi + en az 2 sn boşluk var (ör. "omuzlarını bırak" → ≥ 4 sn).
2. **Sessizliği kullanır:** her blokta en az bir bilinçli sessizlik var; 5 dk sürümde bile en uzun boşluk ≥ 8 sn.
3. **Sessizliği korur:** sessiz pencereden önce duyuru, sonra geri dönüş cümlesi var; hiçbir pencere sınırı aşmıyor.
4. **Somut beden dili:** duyum sözcükleri somut (sıcaklık, ağırlık, temas, basınç, akış); belirsiz "enerji" yok.
5. **Tutarlı yön:** beden dolaşımı her derste aynı sırada; sağ/sol karışmıyor.
6. **Dolgu yok:** "şimdi", "sadece", "hafifçe", "yavaşça" her biri dakikada en çok bir kez; aynı sözcük art arda iki
   cümlede (bilinçli tekrar dışında) yok.
7. **Anlatmaz, yaşatır:** pratik sırasında açıklama cümlesi blok başına en çok bir (Levin 2012).
8. **Tek imge yayı:** her dersin tek bir imgesel yolculuğu var; ani kırılma yok.
9. **Davet dili:** güvenlik ve beden yönergeleri dışında emir kipi yok.
10. **Başarısızlığı normalleştirir:** zihin dağılması ya da gevşeyememe için en az bir cümle.
11. **Çıkış kapısı:** açılış cümlesi var; 30 dk'da ortada tekrar; her zor bloktan önce dayanak.
12. **Kapanış ritüeli:** gündüzde nefes → parmaklar → gerinme → gözler → oda → yana dön → otur; gecede uyku izni.
13. **Azalan anlatım:** ölçülen hız ve yükseklik evreden evreye azalıyor (Knowlton 2006); gündüz kapanışında geri çıkıyor.
14. **Doğal hız:** hiçbir cümle 2,5 hece/sn altında değil; sözcük uzatılmamış.
15. **Ses–müzik:** konuşma anında müzik ≥ 15 dB aşağıda, kör dinlemede "müzik sözü örtüyor" diyen yok.
16. **Kusursuz Türkçe:** editör incelemesinden çıktı; geri çevirmede harf harf aynı; yanlış vurgu yok.
17. **Benzersizlik:** açılış cümlesi (ortak güvenlik cümlesi dışında), imgesi, müziği ve görsel biçimi başka hiçbir
    derste yok.
18. **Yasak liste temiz** (§C.6) ve güvenlik §11.B'nin 18 kuralı işaretli.

### E.7 Yol haritası maddesi (YAPILACAKLAR.md için hazır metin)

```
N. [ ] **Yoga bölümü (10 sesli ders, 5–30 dk her dakika).** Plan: scratchpad PLAN.md → docs/yol-haritasi/YOGA.md.
   Kural: bir ders ancak metin 3 denetimden (Türkçe editör, güvenlik 18 kural, usta hoca 18 ölçüt) geçip, klipler
   harf harf doğrulanıp, karışım qa.py'den geçip, cihazda kilitli ekranda 5 ve 30 dk çalıp sahibi onaylayınca [x] olur.
   1. [ ] Sahip kararları (PLAN.md §G1–G5).
   2. [ ] Pilot: Ders 2 "Derin Dinlenme" metni (kısa/uzun Varış-Kapanış, bütün bloklar), iki ses, ayar ızgarası.
   3. [ ] Pilot ses: klipler + 3 evre yatağı + doğa; qa.py raporu (5/7/10/12/15/20/23/30 dk, iki ses).
   4. [ ] Tasarım Artifact'ı: kütüphane, ayrıntı + zamanlayıcı, oynatıcı (gerçek pilot sesiyle eşzamanlı görsel), bitiş.
   5. [ ] Planlayıcı lib/yoga.js + testler (her ders × her dakika × iki ses).
   6. [ ] YogaAudio yerel motor (var olan Swift dosyasında), Now Playing, kesinti ve rota gözlemcisi.
   7. [ ] Cihaz: kilit, arama, AirPods çıkarma, sessiz tuş, hoparlör/kulaklık, 5 ve 30 dk, iki ses → HATA_GUNLUGU.
   8. [ ] Modül + Gelişim bağlantısı (manifest, effects, uyku metriği, stats).
   9. [ ] Kalan 9 ders (3'lü partiler; her parti 2–7. adımların ses/metin kısmını tekrarlar).
```
ENVANTER_VE_PLAN.md'ye "## 20. Yoga (tarih, Build — durum)" bölümü aynı düzenle açılır (kod-haritasi §7).

### E.8 Sürüm notu maddesi (releases.js; yalnız cihazda doğrulanmış sürümde eklenir)

```
{ kind: 'new', text: 'Yoga: 10 sesli ders (Nefesin Ritmi, Derin Dinlenme, Uykuya Geçiş, Zor Anlar İçin, Tek Nokta, Sabah Niyeti, Kendine Şefkat, Sağlam Yer, Kendini Tanımak, Gelecekteki Sen). Her dersi 5 ile 30 dakika arasında istediğin sürede dinleyebilirsin; kısa sürüm de varışla başlar ve kapanışla biter, hiçbir cümle yarıda kesilmez. Neslihan ya da Hakan anlatır; müzik, doğa sesi ya da sessizlik seçebilirsin. Ekran kilitliyken de çalar. Neye dayandığı ve sınırları her dersin "Kaynaklar" kartında.' }
```
(biçim: releases.js:1-4; `kind: 'new'|'fix'|'change'`).

### E.9 Ücretli / ücretsiz sorusu (sahibe)
Bugün bütün uygulama tek `premium` yetkisinin arkasında ve modül sözleşmesinde premium alanı yok (kod-haritasi §6:
subscription.js:12, App.jsx:763-774). Soru: Yoga da bu kapının arkasında mı kalsın, yoksa bir ders (öneri: Nefesin
Ritmi, 5 dk) deneme bittikten sonra da açık mı olsun? Öneri §G4'te.

---

## F. Maliyet ve aşamalı üretim

### F.1 ElevenLabs kredisi (bu hesabın tahmin oranı: 1 USD = 5.500 kredi; elevenlabs.md §6.1)
| Kalem | Varsayım | Kredi | USD |
|---|---|---|---|
| Pilot metin, 2 ses, %50 yeniden üretim payı | 800–1.200 sözcük × 7,19–8,0 karakter | 17k–29k | 3,1–5,2 |
| Ayar ızgarası | 6 klip × 3 stability × 3 hız × 2 ses × ~150 karakter | ≈ 16k | ≈ 2,9 |
| Pilot yatakları | 3 evre × 2–3 aday × 1.650 (süresi bilinmeyen varsayılan) | 10k–15k | 1,8–2,7 |
| Pilot doğa | 1–3 döngü × 30 sn × 40 kredi/sn (belge kuralı, tahminle doğrulanmadı) | 1,2k–3,6k | 0,2–0,7 |
| **Pilot toplam** | | **≈ 46k–63k** | **≈ 8–12** |
| Kalan 9 ders (aynı kalemler, ızgarasız) | | ≈ 255k–415k | ≈ 46–75 |
| **Hepsi** | | **≈ 300k–480k** | **≈ 55–87** |

- Scribe (yazıya geri çevirme) maliyeti **doğrulanmadı**, ayrıca eklenir.
- 3 dk'lık müziğin gerçek kredisi **doğrulanmadı** (elevenlabs.md §6.1: süre parametresi verilemediği için 1.650 kredi
  bilinmeyen bir varsayılan süreye ait). Ücretsiz doğrulama yolu: düğüme `duration_seconds: 180` yazıp `estimate_only`
  ile tahmin istemek; akışı değiştirdiği için sahibin onayı gerekir.
- MCP ile üretimde `generations_count` 1'e çekilmezse maliyet 4 katına çıkar.
- elevenlabs.md'nin boş akışı (`C2klJLqoOq4YwTw08blb`, 10 çalıştırılmamış düğüm) panelden silinebilir; maliyeti yok.

### F.2 Aşamalar
**Aşama 0 — ön koşullar (sahip):** `project.pbxproj` çakışması Mac'te çözülür; §G kararları verilir; API anahtarı
Mac'te ortam değişkeni olarak hazır olur.

**Aşama 1 — tek pilot ders, tam üretim ve ölçüm: Ders 2 "Derin Dinlenme".**
1. Metin: bütün bloklar, kısa/uzun Varış ve Kapanış, köprüler. Üç inceleme (Türkçe editör, güvenlik, usta hoca).
2. Ses ayarı: ızgara → ölçüm → kör dinleme → evre ayarları sabit; telaffuz alias listesi.
3. Klipler: iki ses, geri çevirme ile harf harf doğrulama; yeniden üretim döngüsü.
4. Müzik: 3 evre yatağı + akarsu; master_bed.py; yatak ölçütleri.
5. Karışım: Python ile çevrimdışı planlayıcı + karıştırıcı (motorun kurallarının aynısı); 5/7/10/12/15/20/23/30 dk ×
   iki ses; qa.py raporu (hepsi geçmeden sahibe gitmez).
6. **Tasarım Artifact'ı:** kütüphane, ayrıntı + zamanlayıcı (bölüm şeridiyle), oynatıcı ve görsel **gerçek pilot sesiyle
   eşzamanlı** (5 dk tam karışım + 30 dk'dan bölümler; Artifact 16 MB sınırına sığacak biçimde), bitiş ekranı, iki tema.
7. Sahip dinler ve bakar. Kusur varsa sormadan düzeltilir ve yinelenir (SAHIP_ISTEKLERI.md madde 3).
8. Onaydan sonra: planlayıcı + yerel motor + cihaz testleri (kilit, arama, AirPods, sessiz tuş, 5 ve 30 dk, iki ses).
   Cihazda mükemmel değilse Aşama 2 başlamaz.

**Aşama 2 — kalan 9 ders, 3'lü partiler:** (1 Nefesin Ritmi, 3 Uykuya Geçiş, 5 Tek Nokta) → (4 Zor Anlar İçin,
7 Kendine Şefkat, 8 Sağlam Yer) → (6 Sabah Niyeti, 9 Kendini Tanımak, 10 Gelecekteki Sen). İlk parti gece dersini ve
nefes-görsel kilidini içerdiği için önce. Her parti Aşama 1'in 1–5. adımlarını ve kör dinlemeyi tekrarlar; motor
değişmez.

---

## G. Sahibin açık kararları (5)

| # | Soru | Seçenekler | Önerim |
|---|---|---|---|
| G1 | Gelişim'de her ders kendi alanını doldursun mu? | (a) Bugünkü sözleşme: modül tek alan (`calm`), önce→sonra etkileri ders başına kendi alanında. (b) Sözleşmeye oturum başına alan (`sessions.domainOf`) eklenir; dataHub.js:36-38 ve testler güncellenir | **Pilotta (a), 10 ders tamamlanırken (b).** Dersler açıkça farklı alanlara ait; (b) küçük ama ortak dosyalara dokunduğu için pilotu bekletmesin |
| G2 | Paket mi, indirme mi? | (a) Hepsi pakette, +≈ 125–215 MB. (b) 1–2 ders pakette, gerisi indirme (Supabase Storage + `@capacitor/filesystem`; bugün yok) | **(a), AAC 48 kbit/sn konuşma** (kör dinlemede 64'ten ayırt edilemezse). Çevrimdışı çalışmama en sık şikâyetlerden (pazar.md §6.2); yeni altyapı riski eklemez. IPA boyutu pilotta ölçülür |
| G3 | Oynatıcı hep karanlık mı, iki temada mı? | (a) Hep karanlık sahne (Dalga ve gece saati gibi). (b) Açık temada açık oynatıcı | **(a), kütüphane ve ayrıntı ekranları iki temada.** Gözler kapalıyken ve yatakta parlak ekran dersin kendisine ters; gece saati de "tema dışı" (NightClock.jsx:6). YAPILACAKLAR.md:260 kuralına açık bir istisna olarak yazılır |
| G4 | Yoga ücretli mi? | (a) Bugünkü tek kapının arkasında. (b) Bir ders her zaman açık | **(a)**, ayrı kapı açılmaz (sözleşmede premium alanı yok, yeni altyapı ister). Deneme süresinde 10 dersin hepsi açık |
| G5 | Seslendirme yolu ve bütçe | (a) REST API betiği, anahtar Mac'te ortam değişkeninde, bütçe tavanı ~100 USD. (b) Yalnız MCP (ayar, seed, süreklilik yok) | **(a).** "Dünyanın en iyi hocası" standardı sabit ayar, seed ve cümleler arası süreklilik ister; bunlar MCP'de yok |

---

## H. Dürüst sınırlar

**Kanıtın zayıf olduğu yerler**
- Yoga nidra MA'larının hepsi düşük kaliteli çalışmalara dayanıyor ve etkiler "muhtemelen şişirilmiş" (Ghai 2025);
  uyku MA'sı çok düşük güvenli (Singh 2026, PMID 42043659, DOI
  [10.1007/s11325-026-03685-0](https://doi.org/10.1007/s11325-026-03685-0)). Aktif kontrole karşı etkiler küçülüyor.
- "Özgüven" için doğrudan meditasyon MA'sı bulunamadı; Sağlam Yer dersi dolaylı bileşenlere dayanıyor.
- "Sabah enerjisi" için meta-analiz yok; tek RKÇ ve sınırda bir etkileşim.
- Oturum uzunluğunu doğrudan karşılaştıran tek çalışma Moszeik 2025; o da **müziksiz** sesle yapıldı (tam metin).
  Ses + müzik birleşiminin etkisi bu çalışmadan çıkarılamaz.
- Kısa farkındalık eğitimlerinde yayın yanlılığı düzeltmesiyle etki neredeyse sıfır (Schumer 2018).
- Rehberli meditasyonda anlatıcı cinsiyeti, ses tınısı, ideal sessizlik uzunluğu, Türkçe hece hızı normu, sesin üstündeki
  müzik için ses–müzik farkı ve dil kalıplarının (sen, şimdiki zaman, tekrar, geri sayma) karşılaştırmalı etkisi için
  kanıt bulunamadı. Bu değerlerin hepsi VARSAYIM ya da uzman tercihidir.
- "Hipnoz" hissi: kayıttan telkin çalışabiliyor ama telkine yatkınlık kişiden kişiye çok değişiyor; herkesin aynı
  derinliğe ineceği vaat edilemez (teslim §10).
- Önce → sonra tek madde puanları neredeyse her zaman iyileşme gösterir (tavan ve beklenti etkisi; teslim §6.2);
  maddeler geçerlenmedi.

**Tasarımdaki VARSAYIMlar (pilotta ölçülecek)**
- Blok süreleri, Varış/Kapanış süreleri, sessizlik sınırları (90 / 45 sn), konuşma yoğunluğu, hece hızı bandı.
- ≥ 15 dB konuşma–müzik farkı, +6 dB kabarma, −18 / −20 LUFS, kısma zamanlamaları, yatak EQ çukuru ve filtre değerleri.
- Müzik tempoları, tonlar, çalgılar; ~10 sn cümle = nefes periyodu eşlemesi (Bernardi 2009 tek deney).
- Anlaşılırlık vekili eşiği (%2 sözcük hatası), kör dinleme eşikleri.
- Paket boyutu (gerçek metin uzunluğu bilinmiyor), AAC 48'in yeterliliği.
- ElevenLabs ayar ızgarası başlangıç değerleri; `pcm_44100` erişimi (hesap katmanı bilinmiyor).

**Doğrulanmayan teknik noktalar**
- Yerel motorun (AVAudioEngine) bu uygulamada kilitli ekranda 30 dk sürmesi; mevcut uyku sesinde bile tam süre
  kilitte çalma işaretlenmedi (YAPILACAKLAR.md:212, kod-haritasi R13).
- Bluetooth gecikmesi ve ses–görsel eşzamanlılığı.
- ElevenLabs `<break>` etiketinin davranışı (kullanılmıyor), 10.000 karakter üstü davranış, Türkçe telaffuz hataları,
  Scribe maliyeti, müzik üst süresi (5 ya da 10 dk; kaynaklar çelişiyor).
- AAC'nin bu ortamda üretilememesi (ffmpeg/afconvert yok); Mac'te `afconvert` beklenir.
- App Store hücresel indirme eşiği ve sıkıştırılmış IPA boyutu.
- Avuçlama ritüeli için kanıt aranmadı.
- Yaş sınırı: hızlı nefes olmadığı için yoga bölümüne ayrı yaş kapısı önermiyorum; karar sahibin (güvenlik §12).

**Bu plan ne değildir:** bitmiş bir ders, dinlenmiş bir ses ya da cihazda görülmüş bir özellik değildir. "Mükemmel"
yargısı ancak pilot üretilip ölçüldükten ve sahibi dinledikten sonra verilebilir.

---

## Ek: Kullanılan kaynaklar (PubMed; hepsi dosyaların ikinci tur doğrulamasından, * işaretliler bu görevde ayrıca yeniden çekildi)

| PMID | Kısa künye | DOI | Dosya |
|---|---|---|---|
| 40373021* | Moszeik 2025 | 10.1002/smi.70049 | sakin |
| 41327816 | Ghai 2025 (YN MA) | 10.1111/nyas.70149 | sakin |
| 42043659 | Singh 2026 (YN uyku MA) | 10.1007/s11325-026-03685-0 | sakin |
| 41743305 | Gibbs 2026 | 10.4103/ijoy.ijoy_2_25 | sakin |
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
| 34350544 | Whitfield 2021 | 10.1007/s11065-021-09519-y | benlik |
| 34560133 | Feruglio 2021 | 10.1016/j.neubiorev.2021.09.032 | benlik |
| 42453615* | Marschin 2026 | 10.3389/fspor.2026.1774292 | benlik |
| 34054628 | Wang 2021 (MCII) | 10.3389/fpsyg.2021.565202 | benlik |
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
| 36416880 | Huberty 2022 | 10.2196/39228 | benlik |
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
| 33562129 | Wang 2021 (kulaklık) | 10.3390/ijerph18041560 | güvenlik |

Kaynak: PubMed (National Library of Medicine). DOI'ler `https://doi.org/` önekiyle açılır.
