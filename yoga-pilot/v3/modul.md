# Yoga modülü · Ekranlar, kayıt, Gelişim ve güvenlik (ilk yayın: 3 · 5 · 15 dakika)

Tarih: 2026-09-29. Durum: **PLAN**. Kod yazılmadı, depoda hiçbir dosya değişmedi, git yazma komutu ve ücretli
ElevenLabs çağrısı yapılmadı. Bu belge birleşik yoga planının "uygulama modülü" parçasıdır. Sürelerin ders ders
dökümü `sure.md`, yoldaki yeri `yol.md` belgesindedir (ikisi de bu klasörde); burada yalnız onlara bağlanılır.

**Okunanlar.** yoga-pilot: `SAHIP_ISTEKLERI.md` (tamamı), `PLAN.v2.md` (§0, §A.1, Ders 1–4 ve 7 kartları, bütün
derslerin "Gelişim" satırları, §A.3, §B.1–B.3, §B.5–B.6, §E tamamı, §F.2, §G, §H, Ek), `CRITIQUE.md` (madde 15–19,
28–30), `dossier-guvenlik.dogrulanmis.md` (§0, §1, §5, §7–§12, §14–§15), `kod-haritasi.md` (tamamı), `render/SPEC.md`,
`render/out/report.md`, `render/out/ders2-15dk-*.timeline.json` (yapısı), `pilot/ders2.lesson.json` (arayüz alanları),
`_tur4_fixlog.md` ve `pilot/fixlog.md` (ilgili satırlar), `dossier-benlik.dogrulanmis.md` (Radin 2025 satırı).
docs/yol-haritasi: `YAPILACAKLAR.md` (1–206, 417–430), `tasarim/SAHIP_ISTEKLERI.md`, `tasarim/YOL.moduller.md` (§2.6,
§4.5, §4.6, §5, §6). Bu klasörden `sure.md` (§0, §3.4, §8–§10) ve `yol.md` (§0, §3.9, §5.1–§5.2, §9).

**Kod** (HEAD `eb1f0ed`; aşağıdaki her `dosya:satır` bu görevde kendi okuduğum satırdır): `modules/registry.js`
(tamamı), `modules/dalga/manifest.js` (tamamı), `modules/breath/manifest.js` (1–60), `modules/registry.test.js`
(1–110), `modules/coachStats.test.js` (tamamı), `lib/progress.js` (tamamı), `lib/dataHub.js` (tamamı),
`lib/coachCore.js` (tamamı), `lib/coach.js` (40–95), `lib/consent.js` (13, 50–83), `lib/storage.js` (tamamı),
`lib/dalga.js` (1–30, 95–139), `screens/Dalga.jsx` (1–330), `lib/subscription.js` (1–80), `lib/trialGate.js` (1–60),
`App.jsx` (776–800, 892–912, 960–990), `components/CoachCard.jsx` (1–40), `screens/Home.jsx` (410–440),
`screens/Progress.jsx` (96–110), `lib/stats.js` (120–140), `lib/releases.js` (1–12), `screens/Safety.jsx` (1–14),
`lib/breath.js` (1–16, 345–356), `lib/profileQuestions.js` (11–12, 25–45), `lib/profile.js:198`, `lib/prefs.js`
(10–25), `lib/voiceCue.js` (1–20), `components/DalgaVisual.jsx` (1–30), `styles/dalga.css` (48–56),
`components/NightClock.jsx` (1–8), `components/ProgressOverview.jsx:433`, `screens/FirstReport.jsx:45`,
`lib/sources.js` (1–30), `lib/alarmLog.js:19`, `components/AlarmCard.jsx:173`, `lib/today.test.js` (1–30).
PLAN.v2'deki satır numaraları `d515702`'ye göreydi; bugün kayanlar: `keepAwake` Dalga.jsx:136 (eskiden 134),
deneme teklifi App.jsx:782 (eskiden 763), abonelik kilidi App.jsx:895–908 (eskiden 876–890).

**Kanıt kuralı.** Bilimsel iddialar yalnız yoga-pilot dosyalarında ikinci turda doğrulanmış kayıtlardandır ve PMID ile
DOI taşır. Güvenlik dosyasında yalnız doğrulama tablosundaki C1–C29 kullanıldı (dossier-guvenlik.dogrulanmis.md §14).
Kanıtın sayı vermediği her değer **VARSAYIM**, kanıttan çıkan ama sınanmamış karar **tasarım çıkarımı** diye
işaretlidir. Sağlık iddiası yoktur; bulgular "çalışmada … görüldü" diye yazılır.

---

## 0. Kısa cevap

1. **İlk yayında on dersin hepsi var.** Süre çipleri yedi derste 3 · 5 · 15, Derin Dinlenme, Uykuya Geçiş ve Kendine
   Şefkat'te 5 · 15 dakikadır (gerekçesi ve Derin Dinlenme için 20 dakika önerisi `sure.md` §0, §3.4, §9). Kaydırıcı,
   30 dakika ve "istediğin dakika" sonraki aşamaya kalır. İstenen bölümden başlamak (sarma) ilk yayında vardır.
2. **Akış:** Ana sayfa → Pratikler → Yoga kütüphanesi → ders ayrıntısı → (ilk kez: güvenlik kartı ve 10 sn'lik ses
   denetimi) → önce puanı → oynatıcı → sonra puanı ve zorlanma sorusu → bitiş. Yoldan açılan ders aynı ekranlardan
   geçer; süresi hazır gelir (`yol.md` §5.2).
3. **Oynatıcı** hep karanlıktır, kilitli ekranda sürer ve ekranı açık tutmaz. Duraklatılan ders klibin başından sürer.
   "Kapanışa geç" o anki cümlenin bitmesini bekler ve kapanışı kısaltmaz. X onay sormaz, ses 2 sn'de söner, ardından
   dönüş ekranı gelir.
4. **Görsel:** her derste tek bir "nefes formu". Form, sesle aynı zaman çizelgesinden okunur; pilotun `timeline.json`
   dosyası bu biçimi zaten üretiyor. "Hareketi Azalt" açıksa ya da nöbet sorusunun cevabı "Hayır" değilse form
   büyüyüp küçülmez, yalnız ışığı yavaşça değişir.
5. **Kayıt:** `type: 'yoga'`. 30 sn'den kısa dinleme yazılmaz. Tamamlandı = kapanışa ulaşıldı **ve** planlanan sürenin
   en az %60'ı dinlendi. Kayıt ses bittiği anda yazılır, puanlar sonra eklenir. Bunun için `storage.js`'e küçük bir
   `updateSession` eki gerekir; bugün depo yalnız ekleme yapabiliyor (storage.js:87-92).
6. **Gelişim:** dokuz dersin önce → sonra etkisi dersin kendi alanına düşer. Uykuya Geçiş'te önce → sonra puanı
   yerine ertesi sabahın sorusu vardır. Pratikler kartı üç satırdır; rekor kutusu "pratik yapılan gün" sayısını gösterir. 28 günlük şeritte
   yoga Sakinlik alanını doldurur (G1-a).
7. **Nef'e dört sayı gider:** ders sayısı, dakika, tamamlanan ders ve pratik günü. Puanlar, ders adı, zorlanma cevabı
   ve uyku cevabı gitmez. Son 7 günde yoga yoksa özet hiç gönderilmez (`null`); mevcut test bunu şart koşuyor
   (coachStats.test.js:22). Nef'in "Yoga" önerebilmesi için sunucu isteminde bir satır ve CoachCard'da bir eşleme
   gerekir.
8. **Sabah sorusu** yalnız 18:00–05:59 arasında başlamış bir Uykuya Geçiş dersinden sonra, ertesi sabah 04:00–11:59
   arasında gelir. Aynı sabah alarmın sorusu bekliyorsa önce o sorulur. Cevap o gecenin ders kaydına eklenir; mevcut
   kayıt defteri testi de metriğin kayıttan okunmasını istiyor (registry.test.js:95-108).
9. **Güvenlik:** kart (bir kez), ders ekranında iki ya da üç satır, sesli açılış cümlesi, onaysız durdurma ve dönüş
   ekranı, kesilmeyen kapanış, zorlanma sorusu, uyandırmasız ve tamamen susan uyku dersi. Hazır metinlerde dört kusur
   bulundu ve düzeltildi (§10.3): karttaki iki başlık iki anlama geliyor; "Çok" cevabının metni dersi bitiren kişiye
   "durman doğruydu" diyor ve var olmayan bir "gözleri açık sürüm" öneriyor; akşam uyarısı için iki ayrı saat (20:00 ve
   21:00) yazılmış.
10. **Ücret:** bugün bütün uygulama tek `premium` yetkisinin arkasında (App.jsx:895-908). İlk yayında yoga da oradadır;
    deneme süresinde on ders açıktır. Not: `trialGate.js` abonelikle ilgili değildir, E testinin "deneme" (cevap)
    kapısıdır (trialGate.js:1-3).
11. **PLAN.v2 §G:** 11 karardan ikisi kapandı: G5'te ses yolu (yalnız MCP) ve G6 (Neslihan, Hakan ve tasarlanacak
    hoca sesi). G9, sahibin hazır kör A/B karışımlarını dinlemesiyle kapanır. G1'i ilk yayın için (a) ile kapatmayı
    öneriyorum. G2, G3, G4, G7, G8, G10 ve G11 sahipte açıktır. En ağırı G10: pilot, insan inceleyici atanmadan
    seslendirildi; yayının kapısı insan onayıdır.
12. **Mevcut sistem bozulmaz.** Gereken: yeni `modules/yoga` klasörü, `lib/yoga.js` ve dört küçük ek:
    `storage.updateSession`, Ana sayfada sabah kartı, `coachCore.js`'te bir istem satırı ile CoachCard'da bir eşleme,
    `sources.js`'te bir kaynak türü. Değişecek mevcut testler: registry.test.js:7 ve :32'deki listeler, :84 ve :95'teki
    örnek kayıtlar.

---

## 1. İlk yayının kapsamı

| Konu | İlk yayında | Sonra |
|---|---|---|
| Dersler | 10 ders | — |
| Süre | Çipler: 3 · 5 · 15 (Ders 1, 4, 5, 6, 8, 9, 10); 5 · 15 (Ders 2, 3, 7); Ders 2'de 20 önerisi sahibin onayında (`sure.md` §9) | 5–30 kaydırıcı ve 30 dk (Aşama 3, `sure.md` §6) |
| İstenen yerden dinleme | Bölüm işaretli ilerleme çizgisi ve bölüme atlama | — |
| Ses | Neslihan · Hakan; tasarlanan hoca sesi kör dinlemeyi kazanırsa o da | — |
| Arka plan | Yalnız o derste tanımlı ve ölçümden geçmiş seçenekler: Müzik · Doğa · Sessizlik | — |
| Oynatıcı | Kilit ekranı, Now Playing, duraklat/sürdür, kapanışa geç, durdur, sarma, altyazı | Uyku dersinden sonra uyku müziğine devir (PLAN.v2 §B.6, v2) |
| Görsel | 10 derse özgü nefes formu, Hareketi Azalt | — |
| Ölçüm | Önce/sonra puanı (1–10), zorlanma sorusu, Uykuya Geçiş için sabah sorusu | Oturum başına alan (G1-b) |
| Gelişim | Pratikler kartı, rekor kutusu, alan kartları, 5. gün raporu, PDF | — |
| Nef | 4 sayılık özet ve "Yoga" önerisi | Nef haftalık/aylık yorumu (sonsuz yol (f)) |
| Yol | `yol.md`: 3. günden itibaren 3 dk, haftada bir 5 dk | — |
| Güvenlik | §10'daki her şey | Kullanıcı araç sürüyorsa dersi başlatmama (iOS'ta mümkün olup olmadığı doğrulanmadı; güvenlik §8) |

**Yayın kapısı (PLAN.v2 başlık notu, 3/5/15'e uyarlanmış):** bir ders ancak şu dört koşulu geçince listede görünür:
(1) metni üç insan incelemesinden geçmiş (Türkçe editör; usta hoca 18 ölçüt; Ders 4 ve 7'de klinik psikolog),
(2) her klibi yazıya geri çevrilip metinle birebir eşleşmiş ve karışımı ölçümden (qa) geçmiş, (3) cihazda kilitli
ekranda 3, 5 ve 15 dakika çalmış, (4) sahibi dinleyip onaylamış. Ders verisindeki bir `published` alanı hangi süre, ses
ve arka plan birleşiminin bu kapıdan geçtiğini yazar; arayüz yalnız onları gösterir. Böylece ölçülmemiş bir
birleşim kullanıcıya hiç ulaşmaz. Sahibin "tam bir istiyorum" sözü gereği yayın için on dersin hepsi bu kapıdan geçer.

---

## 2. Ekranlar ve metinler

Her ekran açık ve koyu temada, 320 px genişlikte yana taşmadan çizilir (YAPILACAKLAR.md:418; Bug 21 notu :44).
Oynatıcı bunun istisnasıdır, hep karanlıktır (G3). Bütün metinler tek bir dil nesnesinde durur, çizime gömülmez ve
Türkçe ek koda yapıştırılmaz (YAPILACAKLAR.md:419-421). Sayılar dile göre yazılır (7,4).

### 2.1 Giriş noktaları

- **Ana sayfa → Pratikler → "Yoga" kutucuğu.** Sıra `home.order: 33`: Nefes (30) ile Dalga (35) arasında
  (breath/manifest.js:25, dalga/manifest.js:27; ızgara Home.jsx:420). Bir ders çalıyorsa kutucuk doğrudan oynatıcıyı
  açar.
- **Bugün'ün yolu:** "Yoga" durağı, `yoga-<ders>` ekranını yolun süresiyle açar (`yol.md` §5.2).
- **Nef:** "Yoga" önerisi kütüphaneyi açar (§8).
- **Sabah kartı:** Ana sayfanın üstünde, yalnız §9'daki koşullarda.

### 2.2 İlk kez: güvenlik kartı ve ses denetimi

**Güvenlik kartı**, yoga bölümüne ilk girişte bir kez görünür; sonra ders ayrıntısındaki (i) düğmesiyle yeniden açılır.
Onay kutusu ve kilit yoktur; bu, mevcut güvenlik ekranının kararıyla aynıdır (Safety.jsx:7-9: "soru değil, bilgi …
işaret kutusu ve kilit yok"). Metin güvenlik §11.A'dandır; iki başlıktaki düzeltme ve gövdedeki iki küçük değişiklik §10.3'te
gerekçelendirildi:

> **Başlamadan önce**
>
> **İstediğin an dersi bitirebilirsin.** Gözlerini açabilir, kıpırdayabilir, nefesini kendi hâline bırakabilirsin.
> Buradaki her şey bir davet. Bazen gevşerken huzursuz ya da tuhaf hissedebilirsin; bu olabilir. Dersi yarıda bırakmak
> da pratiğin bir parçası.
>
> **Araç kullanırken açma.** Bu dersler uyku getirebilir. Araç ya da makine kullanırken, suda ya da dikkat isteyen bir
> işteyken açma.
>
> **Bir sağlık durumun varsa önce danış.** Gebelik, epilepsi, kalp ya da akciğer rahatsızlığı, psikoz ya da bipolar
> bozukluk öyküsü ya da seni hâlâ zorlayan bir travma varsa başlamadan önce hekimine ya da terapistine sor.
>
> **Yavaşça kalk.** Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk. Başın dönerse otur ve bekle.
>
> **Sesi kısık tut.** Konuşmayı zorlanmadan duyacağın kadar yeter. Uyku dersleri kendiliğinden kısılıp biter. Uyurken
> kulak içi kulaklık yerine hoparlör daha iyi.
>
> Nefona tedavi değildir. Uzun süredir çok zorlanıyorsan bir uzmanla konuşmak en güçlü adım. Acil durumda **112**.

Düğme: "Anladım". Son satır uygulamanın bugünkü diliyle aynıdır (Yon.jsx:362).

**Ses denetimi** (ders2.lesson.json `soundCheck`), ilk yoga dersinde "Başla"dan önce 10 sn sürer. Seçilen seste Derin
evre düzeyinde üç kısa klip çalar; ekranda "Sağ kürek kemiği… diz… üç…" yazar. Soru: "Sözcükleri rahatça seçebildin
mi?" Evet · Hayır · Atla. "Hayır" cevabı netlik anahtarını açar ve hatırlar. Klipler Ders 2'nindir; hangi dersle
başlanırsa başlansın aynı üç klip kullanılır.

### 2.3 Kütüphane

- **Başlık:** "Yoga". G8 (b) seçilirse "Yoga ve Meditasyon"; (a) seçilirse alt satır "Nefes, meditasyon ve derin
  dinlenme".
- **En üstte, varsa:** çalan ders ("Şu an çalıyor · Derin Dinlenme" → oynatıcı) ya da "Kaldığın yerden" kartı (§2.10).
- **Sıra** (PLAN.v2 §A.3, numarasız bir başlangıç yolu; dersler serbest): 1 Nefesin Ritmi → 2 Derin Dinlenme → 5 Tek
  Nokta → 7 Kendine Şefkat → 4 Zor Anlar İçin → 6 Sabah Niyeti → 8 Sağlam Yer → 9 Kendini Tanımak → 10 Gelecekteki
  Sen. 3 Uykuya Geçiş 20:00–04:59 arasında en üste çıkar (VARSAYIM saat; §10.3-d).
- **Kart:** ders adı, tek satırlık söz (ör. "Uyanıkken derin bir dinlenmeye davet."), süreler ("3 · 5 · 15 dk" ya da
  "5 · 15 dk"), duruş ("Oturarak", "Uzanarak", "Oturarak ya da uzanarak"), gündüz ya da gece simgesi, dersin vurgu
  rengi (PLAN.v2 §E.2 tablosu; açık temada ders rengi yazısı yalnız beyaz kart üstünde). Renk tek başına bilgi taşımaz.
  Kartta etki vaadi yoktur.
- **Süzgeç çipleri:** "Gündüz" · "Gece" · "3 dakikalık".

### 2.4 Ders ayrıntısı

Yukarıdan aşağıya:

1. **Ad ve söz.**
2. **Süre çipleri:** yalnız dersin yayımlanmış süreleri. Açılışta o derste son seçilen süre, yoksa dersin varsayılanı
   (`sure.md` §9-7) seçilidir; yoldan açılınca yolun süresi seçili gelir.
3. **Bölüm şeridi:** seçilen sürenin planındaki bölümler ("Karşılama · Nefes · Kapanış"). Süre değişince canlı
   güncellenir ve eklenen bölüm vurgulanır ("15 dakikada imgeleme eklendi"). PLAN.v2 §E.1'deki sabit "Bu derste" üç
   maddesi kaldırıldı: sabit bir liste, seçilen sürede çalmayan bölümü de sayar (ör. Ders 2'nin 15 dakikasında zıtlık
   çiftleri yok, `sure.md` §0-7). Ekranda yalnız o sürede gerçekten çalacak bölümler yazar.
4. **Ses:** "Neslihan · Hakan" (+ tasarlanan ses, kör dinlemeyi kazanırsa). Varsayılan, yogada son seçilen sestir;
   yoksa uygulamanın ses tercihi: `female` → Neslihan, `male` → Hakan (prefs.js:16). Yoganın kendi ses seçimi
   `gozolcum:yoga-opts`'ta ayrıca tutulur, çünkü `prefs.voice` yalnız iki değer kabul ediyor (prefs.js:16) ve üçüncü
   bir ses oraya sığmaz. Dersin önerdiği ses yalnız ilk dinleyişte küçük bir "önerilen" etiketiyle görünür
   (PLAN.v2 §A.1).
5. **Arka plan:** "Müzik · Doğa · Sessizlik", yalnız o dersin verisinde tanımlı ve ölçümden geçmiş olanlar. Doğa
   katmanı Ders 1, 4 ve 7'de varsayılan olarak kapalıdır; Ders 4'te hiç sunulmaz, çünkü dere yalnız imgede anlatılır ve
   sesle taklit edilmez (PLAN.v2 ders kartları). "Sessizlik" çok alçak bir oda sesidir, dijital sessizlik değildir.
6. **Duruş** (yalnız Ders 7 ve 9): "Oturarak · Uzanarak". Uzanarak seçilince 3 dk çipi kalkar (`sure.md` §9-6).
7. **Sahne** (yalnız Ders 2): "Orman · Kıyı · Ders içinde seçerim"; son seçim hatırlanır, ilk seferde Orman
   (ders2.lesson.json `scenePicker`).
8. **Netlik:** tek anahtar, "Konuşmayı daha net duymak istiyorum" (ders2.lesson.json `preparationToggles`). Profildeki
   yaş aralığı 60-69 ya da 70+ ise önceden açıktır. Bu alan kodda var (profileQuestions.js:11-12, `ageBand`); pilot
   verisindeki "profil alanı doğrulanmadı" notu böylece kapanır. PLAN.v2 §E.1'deki serbest "konuşma ↔ müzik dengesi"
   kaydırıcısı ilk yayında **yoktur**: kaydırıcı, konuşmanın yatağın en az 15 dB üstünde kalması kuralını kişinin eliyle
   bozdurabilir. Anahtar ise yalnız konuşmayı öne alır.
9. **Uyku dersinde:** "Ders bitince müzik: Kapalı · 5 dk · 10 dk · 20 dk" (varsayılan 10 dk).
10. **Hazırlık kartı** (uzanarak yapılan derslerde): "İnce bir örtü · Dizlerinin altı için bir yastık · Uzanabileceğin
    rahat bir yüzey".
11. **Kaynaklar kartı:** dersin `evidenceLine` cümlesi ve kaynak satırları (yazar, yıl, tür, PMID, DOI; `lib/sources.js`
    kalıbı, sources.js:1-4). 3 dakika seçiliyken karta bir satır eklenir: "Bir çalışmada günde 10 dakika meditasyon
    yapması istenen çalışanların %69,7'si günde 5 dakikanın altında kaldı (Radin 2025). Üç dakikalık sürümün etkisini
    doğrudan sınayan bir çalışma ise bulamadık." (Radin 2025, PMID 39808431, DOI
    [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435); `sure.md` §10: 3 dk'da
    etki cümlesi yok.)
12. **"Başla"nın hemen üstünde açılış satırları** (ders2.lesson.json `openingScreen`, pilot 4. tur metni):
    - "İstediğin an gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin."
    - "Bu dersi yalnızca araç ya da makine kullanmadığın ve suda olmadığın bir sırada dinle."
    - Uzanarak yapılan gündüz dersinde: "Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk."
    - Uyku dersinde üçüncü satırın yerine: "Bu dersten hemen sonra araç kullanma."
13. **Akşam satırı** (gündüz dersinde, 20:00–04:59): "Uyumadan önce dinliyorsan Uykuya Geçiş daha uygun olabilir."
    (§10.3-d). Dokununca Uykuya Geçiş açılır.
14. **Düğme:** "Başla". Ses iOS'ta yalnız dokunuşun içinde başlatılabildiği için motor bu dokunuşta başlar (Bug 22
    dersi; kod-haritasi §2.7).

### 2.5 Önce puanı

- Tek soru, 1–10 düğmeleri, "Atla". Ölçek Dalga'nınkiyle aynıdır (dalga.js:14 `RATE_MAX = 10`). Dalga'nın puan bileşeni
  dosyanın içinde yerel bir işlevdir, dışa açılmamıştır (Dalga.jsx:45). Bu yüzden ortak bir bileşene taşınır ya da
  kopyalanır; Dalga'ya dokunulmadan kopyalamak önerimdir.
- Sorular (PLAN.v2 ders kartları; iki uç etiketi VARSAYIM):

| Ders | Soru | Alt uç · üst uç | Ölçü adı | Yön |
|---|---|---|---|---|
| 1 Nefesin Ritmi | Şu an ne kadar gerginsin? | hiç · çok | gerginlik | düşük iyi |
| 2 Derin Dinlenme | Bedenin şu an ne kadar gergin? | hiç · çok | beden gerginliği | düşük iyi |
| 3 Uykuya Geçiş | **Sorulmaz** (yatakta en az dokunuş) | — | — | — |
| 4 Zor Anlar İçin | Bu duygu şu an ne kadar yoğun? | hafif · çok yoğun | duygu yoğunluğu | düşük iyi |
| 5 Tek Nokta | Dikkatin şu an ne kadar toplanmış? | dağınık · toplanmış | odak | yüksek iyi |
| 6 Sabah Niyeti | Enerjin şu an ne düzeyde? | düşük · yüksek | enerji | yüksek iyi |
| 7 Kendine Şefkat | Şu an kendine ne kadar yumuşak davranıyorsun? | hiç · çok | kendine yumuşaklık | yüksek iyi |
| 8 Sağlam Yer | Şu an kendini ne kadar sağlam hissediyorsun? | hiç · çok | sağlamlık hissi | yüksek iyi |
| 9 Kendini Tanımak | Bedenini şu an ne kadar hissedebiliyorsun? | az · çok | beden farkındalığı | yüksek iyi |
| 10 Gelecekteki Sen | Geleceğe şu an ne kadar umutla bakıyorsun? | az · çok | umut | yüksek iyi |

Ders 8'in ölçü adı PLAN.v2'deki "sağlamlık" yerine "sağlamlık hissi"dir: Gelişim cümlesi "Yoga · Sağlam Yer sonrası
sağlamlık hissi ortalama arttı" diye kurulur (FirstReport.jsx:45 kalıbı) ve "sağlamlık" tek başına o cümlede eşya
dayanıklılığı gibi okunabiliyordu.

### 2.6 Oynatıcı

- **Zemin** `#050A12`, Dalga oynatıcısıyla aynı (dalga.css:52); tema dışıdır (G3). Ortada dersin nefes formu (§3).
- **Denetimler** 5 sn sonra kaybolur, dokununca döner: kalan süre (motordan okunur), ince bölüm çizgisi (sarma ve
  bölüme atlama), "Duraklat" / "Sürdür", "Kapanışa geç" (uyku dersinde "Uykuya geç"; kapanıştayken görünmez), X
  (VoiceOver etiketi "Dersi bitir"), "Altyazı" (varsayılan kapalı; o anki cümle altta sönük yazar, ekrandaki cümle
  söylenen cümledir: timeline `screen_equals_spoken`).
- **Ekran açık tutulmaz.** Dalga'nın `keepAwake` kalıbının tersine (Dalga.jsx:136) Wake Lock istenmez; ekran sistemin
  süresinde kararır, ders kilitte sürer (CRITIQUE #15).
- **Kilit ekranında** ders adı, bölüm adı, geçen ve toplam süre, oynat/duraklat görünür; başka düğme eklenmez
  (PLAN.v2 §B.5).
- **Uyku dersinde** müzik kuyruğu sırasında ekran kararır; dokununca yalnız "Durdur" görünür (PLAN.v2 §B.6).

### 2.7 Durdurma ekranı (X)

- Ses 2 sn'de söner; onay sorusu yoktur.
- Metin: "Gözlerini aç, etrafına bak, acele etme. Uzanıyorsan önce yana dön, sonra otur."
- Düğmeler: "Sesli dönüşü dinle" (20–30 sn; "Birkaç nefes böyle kal; başın dönerse biraz daha bekle." ile biter;
  PLAN.v2 §B.5) ve "Tamam".
- "Tamam"dan sonra, ders 30 sn'yi geçtiyse, yalnız zorlanma sorusu sorulur (§2.8); sonra puanı sorulmaz, çünkü ders
  kapanışa ulaşmadı. Ders "Kaldığın yerden" kartına düşer (§2.10).

### 2.8 Sonra puanı ve zorlanma sorusu

- Ders kapanışa ulaştıysa (süre doldu ya da "Kapanışa geç" kullanıldı): önce puanındaki soru aynen yeniden sorulur,
  "Atla" vardır. Uyku dersinde bu ekran yoktur.
- Ardından isteğe bağlı: "Ders sırasında zorlandın mı?" Hayır · Biraz · Çok · Atla (güvenlik §11.F).
- "Çok" cevabının metni, dersin nasıl bittiğine göre iki biçimdedir (§10.3-c):
  - Durdurduysa: "Böyle anlar olabiliyor; durman doğruydu. Bir dahaki sefere daha kısa bir süre seçebilir, gözlerini
    açık tutabilirsin. Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112."
  - Bitirdiyse: "Böyle anlar olabiliyor. Bir dahaki sefere daha kısa bir süre seçebilir, gözlerini açık tutabilirsin.
    Sık tekrarlarsa ya da geçmezse bir uzmanla konuşmak iyi olur. Acil durumda 112."
- Cevap telefonda kalır, Gelişim'de puan olarak görünmez, Nef'e gitmez. Tek işi, bir sonraki önerinin aynı dersin en
  kısa süresi olmasıdır (güvenlik §11.F; tasarım çıkarımı).

### 2.9 Bitiş ekranı

- Başlık: "Ders bitti". Satırlar: dinlenen dakika ve ulaşılan bölüm; önce → sonra ("Beden gerginliği 6 → 3");
  "Bu dersi neden böyle kurduk" (Kaynaklar kartı); sıradaki öneri.
- Sıradaki öneri: kütüphane sırasındaki bir sonraki ders. Zorlanma cevabı "Çok" ise aynı dersin en kısa süresi ve altında
  "Gözlerin açık kalabilir." satırı.
- Ders 4'ün sonunda her zaman: "Sık tekrarlarsa bir uzmanla konuşmak iyi olur. Acil durumda 112." (PLAN.v2 Ders 4
  kartı; dil Yon.jsx:362 ile aynı).
- Yarıda bırakılan ders bu ekranı göstermez (PLAN.v2 §E.1-6).

### 2.10 Kaldığın yerden

PLAN.v2 §E.1 bu kartı Yoga kütüphanesinin üstüne koyar; Ana sayfaya ayrı kart eklenmez. (`yol.md` §3.9'daki "kart
Ana sayfada 7 gün durur" ifadesi buna göre düzeltilmeli.) İki iyileştirme öneriyorum; ikisi de VARSAYIM ve tasarım kararı:

- **Yalnız 15 ve 20 dakikalık derslerde** çıkar. 3 ve 5 dakikalık ders yeniden başlar: bu kadar kısa bir derste ortadan
  sürdürmek, karşılama → çekirdek → kapanış bütünlüğünü bozar (PLAN.v2 §B.1).
- **Bölümün başından** sürdürülür (PLAN.v2'de klibin başından) ve önce dersin açılış izni klibi çalar: "İstediğin an
  gözlerini açabilir, kıpırdayabilir ya da dersi bitirebilirsin." Saatler, hatta günler sonra derin evrenin ortasına
  hazırlıksız girilmez; dersin "çıkış kapısı" cümlesi yeniden duyulur (güvenlik §11.B-3 ve -8). Bu klip her derste ve
  her seste zaten var; yeni üretim gerekmez.
- Kart metni: "Kaldığın yerden · Derin Dinlenme · 15 dk · 6:40'ta kaldın" ve "Sürdür" · "Baştan başla". Ders metni ya da
  sesi güncellendiyse (`contentHash` değiştiyse): "Bu ders güncellendi; baştan başlayacak." Kayıt 7 gün sonra silinir
  (PLAN.v2).

Sürdürülen ders, ilk oturumun kaydına eklenir (aynı `recordId`); dinlenen saniyeler toplanır, tamamlanma yeniden
hesaplanır, sonra puanı dersin sonunda sorulur.

### 2.11 Sabah kartı

"Dün gece uykuya dalmak ne kadar kolaydı?" · 1–10 (1 "çok zor", 10 "çok kolay") · "Atla". Ne zaman çıktığı ve nereye
yazıldığı §9'da.

---

## 3. Görsel: nefes formu

- **Tek gerçek kaynak, planın olay listesidir.** Pilotun `timeline.json` dosyası bunu zaten taşıyor: her konuşma
  parçasının başı ve sonu, ekran metni, evresi, görsel ipucu ve `visual_state`; ayrıca görsel olaylar listesi
  (`phase:varis|derinlesme|derin`, nefes sayımında `pulse`, `image:on/off`, `dawn`, `end`). Form `Date.now` ile değil,
  motorun bildirdiği konum ile cihazın çıkış gecikmesi toplanarak ilerler. Bluetooth gecikmesi ölçülmeden ses ile
  görüntünün eşzamanlı olduğu söylenmez (PLAN.v2 §E.2; kod-haritasi N10).
- **Saf bir işlev:** `visualAt(timeline, t, { reduceMotion, flashSafe })` → `{ phase, luminance, scale, image, dawn,
  ember }`. Test edilebilir ve belirlenimcidir (§16).
- **Kurallar** (PLAN.v2 §E.2): form yalnız söylenen nefes ipuçlarına kilitlenir (Ders 1'de 4 sn al, 6 sn ver); ipucu yoksa
  nefes almaz, ≥ 20 sn periyotlu çok yavaş bir ışık kayması sürer. Evreler: Varış en aydınlık, Derin en loş. Gündüz
  kapanışında en az 60 sn'lik bir "şafak" vardır; 3 dakikada `sure.md` 45–48 sn öneriyor, sahibin onayında. Gece
  dersinde form kehribar bir köze dönüp söner ve ekran siyah kalır.
- **Derse özgü biçimler:** 1 genişleyen halka · 2 ince, yatay ufuk çizgisi · 3 sönen kor · 4 akan tek çizgi · 5 tek ışık
  noktası · 6 yükselen yarım güneş diski · 7 göğüs hizasında sıcak ışık · 8 yere yakın taban çizgisi · 9 yavaşça dağılan
  sis · 10 uzaktaki bir ışığa uzanan yol çizgisi.
- **Yasaklar:** yanıp sönme yok (uygulamanın ilkesi, DalgaVisual.jsx:4-6), okunacak yazı yok (altyazı isteğe bağlı), ani
  renk geçişi yok. Ekran parlaklığı en çok bağıl %15, gece %4 (VARSAYIM).
- **Hareketi Azalt:** form ölçeklenmez, yalnız opaklığı çok yavaş değişir (DalgaVisual.jsx:23 kalıbı).
- **Nöbet cevabı:** `flashSafe` yalnız profil sorusunun cevabı "Hayır" ise `true`, cevap yoksa `null`dır
  (profile.js:198). Ders verisi "flashSafe yanlışsa nabız yok" diyor (ders2.lesson.json `visual.pulse`). İhtiyatla
  `flashSafe !== true` olan herkeste (cevapsız dahil) form nabız atmaz; Hareketi Azalt davranışına geçer. Nöbet sorusu
  yogaya girerken ayrıca sorulmaz: sorunun gerekçe metni Hızlı Bakış ve Tek Bakışta'dan söz ediyor
  (profileQuestions.js:30-41) ve yoga bağlamında yanlış olurdu.
- **Renkler** PLAN.v2 §E.2 tablosundaki gibidir; kontrastlar orada hesaplandı. Ders 1 ile 4 ve Ders 3 ile 10'un yan yana
  ayırt edilebilirliği tasarım Artifact'ında görülerek kesinleşir.

---

## 4. Oynatıcı davranışı ("ses asla kesilmez")

Motor seçimi (PLAN.v2 §E.3: AVAudioEngine ya da AVMutableComposition) bu belgenin konusu değildir; aşağıdaki sözleşme
iki adayda da aynıdır. 3/5/15 kararıyla her süreyi önceden tek dosyaya karıştırma seçeneği (kod-haritasi §8.5 V2)
yeniden düşünüldü ve önerilmedi. İki sesle toplam 26.520–28.920 sn stereo ses eder (AAC 64'te ≈ 212–231 MB; hesap:
yedi derste 23 dk, üç derste 20 dk, Derin Dinlenme'ye 20 dk eklenirse +20 dk, × 2 ses). Üstelik tek arka planla sınırlı kalır;
"Kapanışa geç" ve bırakma ön klibi için ayrıca kapanış karışımları gerekir.

| Olay | Davranış (PLAN.v2 §B.5 ve §B.6'dan; ilk yayın) |
|---|---|
| Süre doluyor | Kapanış süreye dahildir, ders kapanışını bitirmeden süre dolmaz; son söz son saniyede biter; gündüz dersi son 2 sn'de söner |
| Duraklat / Sürdür | Ses ve müzik 1 sn'de söner; sürdürünce o anki **klibin başından** 1 sn'de gelir |
| Kapanışa geç | O anki cümle biter; 4 sn'lik ön sessizlik (dönüş tınısı ilk sözden 2 sn önce); kapanış kısaltılmadan çalar. İmge ya da zor blok içindeyse önce o bloğun bırakma ön klibi; duyurulmuş bir pencerenin sessizliğindeyse önce dönüş tınısı ve karşılama klibi. Uyku dersinde "Uykuya geç" uyku iznine atlar |
| X | Hemen, onaysız; 2 sn'de söner; durdurma ekranı (§2.7) |
| Sarma / bölüme atlama | En yakın klip başına oturur; müzik o evreye çapraz geçer, görsel 2 sn'de o evrenin durumuna kayar. İmge ya da zor bloktan bırakma klibi çalmadan çıkılırsa önce bırakma klibi |
| Telefon araması, Siri | Duraklar; iOS sürdürme izni verirse klibin başından sürer, vermezse duraklatılmış kalır. Sayaç motordan okunduğu için ekran ayrışmaz |
| Kulaklık ya da AirPods çıktı | Hemen duraklar (bugün rota gözlemcisi yok, eklenecek; kod-haritasi R5) |
| Yeni çıkış (AirPods takıldı, araç Bluetooth'u, Denetim Merkezi) | Duraklatılmaz; ses grafiği yeniden kurulur, klibin başından sürer. Doğrulanmadı, cihaz testi |
| Medya hizmetleri sıfırlandı | Her şey baştan kurulur; kurulamazsa duraklatılmış kalır ve "Sürdür" görünür. Doğrulanmadı |
| Kilit ekranı, arka plan | Çalmayı sürdürür; Now Playing ve uzaktan komut (bugün yok, kod-haritasi R6) |
| Uygulama arka planda biter ya da kapanır | Dinlenen süre yerelde de yazılır; açılışta JS kaydı uzlaştırır, kaydın tarihi dersin gerçek bitiş anıdır (kod-haritasi R7). Uyku dersinin sabah sorusu buna dayanır |
| Bildirimden başka ekrana geçiş | Ders sürer (modül dışı oturum, sleepSession.js kalıbı); Yoga kutucuğu ve kütüphane oynatıcıya döndürür. Oynatıcıdan uygulama içinde başka çıkış yoktur; tam ekran akışlarda sekme çubuğu yoktur |
| Dalga'nın uyku sesi çalarken yoga başlatılırsa | Tek yerel oynatıcı kuralı (AlarmPlugin; kod-haritasi R3): "Başla"nın üstünde "Çalan uyku sesi duracak." satırı görünür; ikisi aynı anda çalmaz |
| Mikrofon kaydı sürüyorsa | Yerel ses başlamaz (kod-haritasi R10); "Ses açılamadı. Telefonun sesini ve sessiz modunu kontrol edip yeniden dene." (Dalga'nın metni) |
| Ses tercihi "kapalı" | Ders yine konuşur: anlatım dersin kendisidir. `voiceCue.js`'teki "ses kapalıysa konuşma" kuralı (voiceCue.js:11-14) yogaya uygulanmaz |
| Uyku dersinin sonu | Uyku izni cümlesinden sonra ses susar; müzik kuyruğu seçilen süre çalar, son 3 dk kosinüs eğrisiyle kısılır ve **tamamen durur**; uyandırma cümlesi yok |

---

## 5. Modül kaydı (`src/modules/yoga/manifest.js`)

Sözleşme `eb1f0ed`'de yeniden okundu: `effects` girdisi `key`, `label`, `measure`, `max` ve `pick` ister, `domain`
isteğe bağlıdır (registry.js:66-71). `better` alanını kayıt defteri denetlemez ama Gelişim okur; verilmezse "yukarı iyi"
sayılır (progress.js:81, :107). Etki ve metriğin alanı modülünkünü geçersiz kılabilir (registry.js:154-155).
`metrics` girdisi `better: 'up'|'down'` ve `series` ister (registry.js:73-81). `sessions.best` bir işlevdir ve
`bestLabel` ister (registry.js:112). Kayıt defteri bilinmeyen alanı reddetmez, bu yüzden `yol.md`'nin `progression`
alanı sözleşmeyi bozmaz.

```js
// Yoga: 10 sesli ders (3 · 5 · 15 dk). Yaşam halkası; pratik. Tedavi değildir; puanlar kişi içi gidişattır.
import { LESSONS, isYoga, minutesOf, dayCount, pathYoga, PATH_YOGA, isYogaDone } from '../../lib/yoga.js'
import { withinDays } from '../../lib/today.js'
import { join, durationPart } from '../../lib/format.js'

const lessonPick = (n) => (s) => (isYoga(s) && s.lesson === n ? [s.before, s.after] : null)
const effect = (n, key, measure, extra = {}) =>
  ({ key, label: `Yoga · ${LESSONS[n].title}`, measure, max: 10, domain: LESSONS[n].domain, pick: lessonPick(n), ...extra })

export default {
  id: 'yoga',
  routes: ['yoga', ...Object.keys(LESSONS).map((n) => `yoga-${n}`)],   // yol.md §5.2 ile aynı
  title: 'Yoga',                                                        // G8 kararına bağlı
  label: 'yoga dersi',
  ring: 'life',
  kind: 'practice',
  gates: {},                                   // gözler kapalı ders: göz bütçesine sayılmaz, molada açık
  storageKeys: ['gozolcum:yoga-opts', 'gozolcum:yoga-resume'],
  home: { section: 'practice', order: 33 },    // Nefes 30 ile Dalga 35 arası (VARSAYIM)
  progress: {
    domain: 'calm',                            // 28 günlük şerit (G1-a)
    effects: [
      effect(1, 'yoga-nefes', 'gerginlik', { better: 'down' }),
      effect(2, 'yoga-nidra', 'beden gerginliği', { better: 'down' }),       // domain 'body'
      effect(4, 'yoga-zor', 'duygu yoğunluğu', { better: 'down' }),
      effect(5, 'yoga-odak', 'odak'),                                          // domain 'focus'
      effect(6, 'yoga-sabah', 'enerji'),                                       // domain 'wellbeing'
      effect(7, 'yoga-sefkat', 'kendine yumuşaklık'),                          // domain 'self'
      effect(8, 'yoga-saglam', 'sağlamlık hissi'),                             // domain 'self'
      effect(9, 'yoga-tanima', 'beden farkındalığı'),                          // domain 'awareness'
      effect(10, 'yoga-gelecek', 'umut'),                                      // domain 'wellbeing'
    ],                                         // Ders 3'te önce puanı yok, etki de yok
    metrics: [{
      key: 'yoga-uyku-dalma', label: 'Uykuya dalma kolaylığı (ertesi sabah)', unit: 'puan', better: 'up', domain: 'wellbeing',
      series: ({ sessions }) => sessions.filter((s) => isYoga(s) && s.lesson === 3 && Number.isFinite(s.sleepEase))
        .map((s) => ({ date: s.date, value: s.sleepEase })),
    }],
  },
  sessions: {
    match: isYoga,                             // s?.type === 'yoga'
    countsTowardGoal: true,
    describe(s, { seconds }) {
      const L = LESSONS[s.lesson]
      const rated = Number.isFinite(s.before) && Number.isFinite(s.after) ? `${L?.measure ?? 'puan'} ${s.before}→${s.after}` : null
      return { title: `Yoga · ${L?.title ?? ''}`.trim(), detail: join([rated, s.completed ? null : 'yarıda kaldı', durationPart(seconds, false)]) }
    },
    best: (sessions) => dayCount(sessions.filter(isYoga)),      // pratik yapılan farklı gün (yerel takvim günü)
    bestLabel: 'Yoga · pratik yapılan gün',
  },
  stats(sessions, now) {                       // en çok 3 satır; kayıt yoksa [] (coachStats.test.js:38-46)
    const week = withinDays(sessions.filter(isYoga), now)
    if (!week.length) return []
    return [
      { label: 'Yoga · 7 gün', value: `${minutesOf(week)} dk`, sub: `${week.length} ders` },
      { label: 'Tamamlanan', value: `${week.filter((s) => s.completed).length} ders`, sub: 'son 7 gün' },
      { label: 'Pratik günü', value: `${dayCount(week)} gün`, sub: 'son 7 gün' },
    ]
  },
  coach(sessions, now) {                       // §8; boşken null (coachStats.test.js:22)
    const week = withinDays(sessions.filter(isYoga), now)
    if (!week.length) return null
    return { sessions7: week.length, minutes7: minutesOf(week), completed7: week.filter((s) => s.completed).length, days7: dayCount(week) }
  },
  progression: { match: isYogaDone, unlockAfter: { totalDays: PATH_YOGA.unlockTotalDays } },   // yol.md §5.2
  today(ctx) { /* yol.md §5.2: ctx.progression yoksa null; bugünkü yol değişmez */ },
}
```

- `LESSONS` ders verisinden gelir: `{ 1: { title: 'Nefesin Ritmi', domain: 'calm', measure: 'gerginlik', … }, … }`.
  Etiketler "Yoga · Ders adı" biçimindedir (Dalga'daki "Dalga · Sakin" kalıbı, dalga/manifest.js:20).
- `ask` alanı kullanılmaz (§3'teki nöbet sorusu gerekçesi).
- `NBSP` ve dil nesnesi kullanımı uygulama kodunda yapılır; yukarıdaki dizeler okunaklılık için düz yazıldı.

---

## 6. Kayıt biçimi ve depolama

### 6.1 Ders kaydı (`sessions`, localStorage `gozolcum:v1`)

```js
{
  id, date,                  // storage ekler (storage.js:88); date açıkça verilirse onu kullanır: dersin bitiş anı
  type: 'yoga',
  lesson: 2,                 // 1–10, PLAN.v2 ders numarası (yol.md ile aynı)
  planned: 900,              // seçilen süre, sn: 180 | 300 | 900 | 1200
  seconds: 874,              // gerçekten çalan ders süresi, sn; duraklamalar ve uyku dersinin müzik kuyruğu hariç (motordan)
  startedAt: '2026-10-01T22:48:10.000Z',   // sabah sorusunun gece penceresi bundan hesaplanır
  voice: 'nes',              // 'nes' | 'hak' | tasarlanan sesin kimliği
  bg: 'music',               // 'music' | 'nature' | 'silence'
  posture: 'lie',            // 'sit' | 'lie'
  scene: 'orman',            // yalnız Ders 2: 'orman' | 'kiyi' | 'serbest'
  clarity: false,
  musicTail: 10,             // yalnız Ders 3: 0 | 5 | 10 | 20
  reachedClosing: true,      // kapanışa (uyku dersinde uyku iznine) ulaşıldı
  completed: true,           // reachedClosing && seconds >= 0,6 × planned (VARSAYIM %60; CRITIQUE #16)
  quickClose: false,         // "Kapanışa geç" kullanıldı
  resumed: false,            // "Kaldığın yerden" ile sürdü
  before: 6, after: 3, delta: -3,          // 1–10 ya da null; Ders 3'te hep null
  hard: 'no',                // 'no' | 'some' | 'much' | null
  sleepEase: 7,              // yalnız Ders 3; ertesi sabah eklenir (§9)
  planVersion: 'pilot-4', contentHash: '…',
}
```

- **30 sn kuralı:** 30 sn'den kısa dinleme kaydedilmez (Dalga.jsx:20 ile aynı eşik, VARSAYIM).
- **Ne zaman yazılır:** ses bittiği ya da durduğu anda, puanlar gelmeden. Dalga kaydı ancak sonra puanından sonra
  yazıyor (Dalga.jsx:302-308); o ekranda uygulama kapanırsa ders hiç kaydedilmez. Yogada ders kaydı önce yazılır, puan
  ve zorlanma cevabı sonra eklenir.
- **Gereken ek:** `store.updateSession(id, patch)`. Bugünkü depo yalnız ekler (storage.js:87-92). Ek, var olan kaydı
  birleştirerek günceller; `id`, `date` ve `type` değişmez; kimlik yoksa `null` döner. Başka hiçbir çağrı değişmez.
- `delta` ve `before/after` Dalga'nın `makeRecord` kalıbıyla aynı kurulur (dalga.js:99-116).
- Uyku dersinin müzik kuyruğu "dakika"ya sayılmaz; yoksa pratik dakikası kişinin uyuduğu süreyle şişerdi (VARSAYIM).

### 6.2 Tercihler (`gozolcum:yoga-opts`)

`{ voice, minutesByLesson, bgByLesson, postureByLesson, scene, clarity, musicTail, captions, safetySeen, soundCheck,
morningSkipped: [kayıt kimlikleri] }`. İlk ders olup olmadığı ayrıca saklanmaz, kayıtlardan anlaşılır
(`!sessions.some(isYoga)`); böylece "Tüm verileri sil"den sonra ilk ders cümlesi yeniden çalar.

### 6.3 Kaldığın yer (`gozolcum:yoga-resume`)

`{ recordId, lesson, planned, voice, bg, posture, scene, clarity, musicTail, planVersion, contentHash, seed,
variantIndex, blockId, positionSec, savedAt }`. Planlayıcı belirlenimci olduğu için bu kayıt aynı planı yeniden kurar
(PLAN.v2 §B.3 adım 7; CRITIQUE #30).

### 6.4 Tüm verileri sil

İki anahtar `storageKeys` ile kendiliğinden silinir (registry.js:152). Yerel motorun uzlaştırma için yazdığı değer
(UserDefaults) localStorage'da değildir; silme akışı onu da temizleyen bir köprü çağrısı yapmalıdır.

---

## 7. Gelişim

| Yer | Yoga ne gösterir | Nasıl bağlanır |
|---|---|---|
| Pratikler kartı | "Yoga · 7 gün: 23 dk (4 ders)", "Tamamlanan: 3 ders", "Pratik günü: 3 gün" | `stats()`, ilk 3 satır (Progress.jsx:325) |
| Rekor kutusu | "Yoga · pratik yapılan gün" | `sessions.best` + `bestLabel` (Progress.jsx:101-105). Ödül süre değil gün sayısıdır: süre rekoru yok (PLAN.v2 §E.5; güvenlik §11.F) |
| Alan kartları | Her dersin önce → sonra etkisi kendi alanında: Sakinlik (1, 4), Beden (2), Dikkat (5), İyi oluş (6, 10), Kendine yaklaşım (7, 8), Farkındalık (9) | `registry.effects()` (registry.js:154) → `acuteEffects` (progress.js:74-89); alan adları progress.js:188 |
| Uyku ölçüsü | "Uykuya dalma kolaylığı (ertesi sabah)", İyi oluş alanında | `metricCards` (progress.js:152-156); 6 ölçümden azsa "henüz belirsiz" (progress.js:143) |
| 28 günlük şerit | Yoga yapılan gün Sakinlik diliminde dolu | `domainOfSession` → modülün tek alanı (dataHub.js:36-38, :108-111, :181); G1-a |
| Oturum geçmişi | "Yoga · Derin Dinlenme — beden gerginliği 6→3 · 14 dk 34 sn" | `describe` (stats.js:128-134) |
| 5. gün raporu ve PDF | Etki satırları kendiliğinden girer | FirstReport.jsx:45; exportData |

- **"Anlamlı" demek için** en az 3 oturum ve %95 GA'nın sıfırı içermemesi gerekir (progress.js:73, :85). Kartın altındaki
  not zaten var: "Kontrol grubu yok: bir kısmı beklenti ya da yalnızca mola vermenin etkisi olabilir."
  (ProgressOverview.jsx:433).
- **Hiçbir metinde** "stresini azalttı", "bilimsel olarak kanıtlandı", "dikkatin gelişti" yoktur. Uygulama
  açıklamalarında etkinlik iddiası yaygın: 73 ruh sağlığı uygulamasının açıklamasının %64'ü etkinlik iddia etti
  (Larsen 2019, PMID 31304366, DOI [10.1038/s41746-019-0093-1](https://doi.org/10.1038/s41746-019-0093-1)). Ders 5
  için ayrıca: farkındalık çalışmalarının meta-analizinde nesnel bilişteki genel etki küçüktü (g=0,15) ve aktif
  karşılaştırmalardan üstün değildi (Whitfield 2021, 45 çalışma, PMID 34350544, DOI
  [10.1007/s11065-021-09519-y](https://doi.org/10.1007/s11065-021-09519-y)); bu yüzden "odak" puanı için "gelişti" denmez.
- **Önce → sonra puanları** neredeyse her zaman iyileşme gösterir (tavan ve beklenti etkisi; teslim §6.2; PLAN.v2 §H).
  Kartlar bunları "nasıl hissettin" gidişatı olarak gösterir, etki kanıtı olarak değil.
- **Zorlanma cevabı** Gelişim'de hiç görünmez (güvenlik §11.F).
- **Dikkat:** oturum geçmişindeki satır ve PDF, kişinin "Zor Anlar İçin" dersini ne sıklıkla açtığını gösterir. Bu,
  kişinin kendi telefonundaki kendi verisidir; paylaşım yalnız kişinin "Doktoruma göster" dokunuşuyla olur.

---

## 8. Nef'e giden özet

**Gönderilen:** `yoga: { sessions7, minutes7, completed7, days7 }`, dört sayı. Son 7 günde yoga yoksa `coach()` `null`
döner.

**Neden bu kadar az:**
- Süzgeç yalnız ASCII sözcük karakterli, boşluksuz, en çok 24 karakterlik dizeleri geçirir (coachCore.js:48, :50).
  "Derin Dinlenme" gibi Türkçe ve boşluklu bir ders adı zaten düşerdi.
- Rıza metni "Ne gider" listesinin `coach()` özetleriyle birebir tutulmasını şart koşuyor (consent.js:55-56). Bugünkü
  metin "çalışma günü, dakika ve seri" ile "oyun ve egzersiz puanları (nefes öncesi/sonrası sakinlik farkı dahil)"
  diyor (consent.js:64). Dört sayı ilk kalemin içine girer; önce/sonra puanı ya da ders adı gönderilirse metin
  değişmeli, rıza sürümü artmalı (`CONSENT_VERSIONS.coach`, consent.js:13) ve herkese yeniden sorulmalıdır. Bu yorumun
  hukukçuya teyit ettirilmesini öneririm.
- Uyku cevabı sağlık verisidir; "uyku Nef'e gitmez" sözü yol haritasında zaten verildi (YAPILACAKLAR.md:64).
- Zorlanma cevabı telefonda kalır (güvenlik §11.F).

**Gereken ekler (sunucu ve istemci; ikisi de ekleme):**
- `coachCore.js` sistem istemi (sunucu `api/coach.js` aynı dosyayı içe aktarıyor): modül satırına (coachCore.js:78)
  "yoga = rehberli yoga dersleri (sessions7 ders, minutes7 dakika, completed7 kapanışına kadar dinlenen ders, days7
  pratik günü). Puan ya da sağlık yorumu yapma; yalnız düzen dilinde yorumla." ve eylem listesine (coachCore.js:81)
  "Yoga". Sunucu yeniden yayımlanır.
- `CoachCard.jsx` eşlemesine `[/^yoga/i, 'yoga']` (CoachCard.jsx:16-26); yoksa "Yoga" önerisi düğme olmaz, düz yazı kalır.

**Sınır riski:** süzgeç en çok 10 modül geçirir (coachCore.js:44). Bugün `coach()` veren canlı modüller breath,
fark-ettin, notice, quick-look, snake, tek-bakis ve track; yogayla 8 olur. Modüller klasör adının alfabe sırasıyla
dizildiği için (registry.js:159-160) `yoga`, `coach()` veren modüller arasında en sonda kalır. Meditasyon, uyku, yürüyüş ve tepki eklenince 10'u
aşan ilk modül yoga olur ve Nef'e hiç ulaşmaz. Karar YOL.moduller §2.6'da bekliyor (boş modüller `null` dönsün ya da
sınır yükselsin); yoga kendi payına boşken `null` döndürüyor.

---

## 9. Sabah "uykuya dalma" sorusu

| Kural | Değer |
|---|---|
| Hangi ders | Yalnız Ders 3 Uykuya Geçiş, kaydı olan (≥ 30 sn) |
| Gece penceresi | Ders 18:00–05:59 arasında başlamış olmalı (VARSAYIM). Öğleden sonra dinlenen dersten sonra "Dün gece" diye sorulmaz |
| Hangi sabah | 18:00–23:59 arasında başladıysa ertesi takvim günü; 00:00–05:59 arasında başladıysa aynı takvim günü. PLAN.v2'deki "ertesi gün" kuralı gece yarısından sonra dinlenen dersi atlıyordu |
| Saat aralığı | O sabah 04:00–11:59 (12:00 sınırı PLAN.v2'den, 04:00 VARSAYIM: gece 02:00'de telefona bakana "dün gece" diye sorulmasın) |
| Nerede | Ana sayfanın üstünde tek kart; uygulama o aralıkta ilk açıldığında |
| Alarmla çakışma | Alarmın sabah sorusu ("Ses bittiğinde uyumuş muydun?", AlarmCard.jsx:173; alarmLog.js:19) bekliyorsa önce o görünür; yoga sorusu onun cevabından ya da kapanmasından sonra çıkar. İki soru aynı anda görünmez. Uyku modülü geldiğinde tek sabah kartında birleşir (YOL.moduller §6, soru 3) |
| Birden çok ders | O geceye düşen en son kayıt |
| "Atla" | O kaydın kimliği `morningSkipped`'e yazılır; kart o sabah yeniden çıkmaz |
| 12:00 | Kart kendiliğinden kalkar; o gecenin değeri boş kalır |
| Nereye yazılır | `updateSession(kayıt.id, { sleepEase })`. Metrik, o gecenin kaydından okunur; tarihi gecenin tarihidir. Ayrı bir kayıt türü açılmaz, çünkü açılsaydı soruyu cevaplamak "yoga yapılan gün" sayılırdı (`countsTowardGoal` modül düzeyindedir) |
| Kanıt ve dil | Uygulama "uyutur" demez. Tek 30 dk'lık yoga nidra kaydı sessiz uzanmaya göre uykuya dalma süresini değiştirmedi (Sharpe 2023, n=22, PMID 36731199, DOI [10.1016/j.jpsychores.2023.111169](https://doi.org/10.1016/j.jpsychores.2023.111169)); ilgi çekici imgeyle dikkat dağıtma talimatı uykusuzluk yaşayan 41 kişide daha kısa uykuya dalma süresiyle birlikte gitti (Harvey & Payne 2002, PMID 11863237, DOI [10.1016/s0005-7967(01)00012-2](https://doi.org/10.1016/s0005-7967(01)00012-2)) |

Kayıt defteri testi her metriğin, modülün kendi eşleştirdiği tek bir kayıttan okunabilmesini istiyor
(registry.test.js:95-108). Bu tasarım o testi `{ type: 'yoga', lesson: 3, sleepEase: 7, date }` örneğiyle geçer.

---

## 10. Güvenlik

### 10.1 Modüldeki güvenlik öğeleri

| Öğe | Nerede | Dayanak |
|---|---|---|
| Güvenlik kartı, bir kez; (i) ile yeniden | §2.2 | İstenmeyen etkiler seyrek değil: deneysel çalışmalarda %3,7, gözlemsel çalışmalarda %33,2 (Farias 2020, PMID 32820538, DOI [10.1111/acps.13225](https://doi.org/10.1111/acps.13225)); nüfus anketinde %32,3 (Goldberg 2021, PMID 34074221, DOI [10.1080/10503307.2021.1933646](https://doi.org/10.1080/10503307.2021.1933646)) |
| Açılış cümlesi (ses ve ekran) ve "dersi bitirebilirsin" | §2.4-12, derslerin Varış'ı | Travma-duyarlı yoga nidranın bileşenleri arasında özerklik ve onay (Luu 2024, PMID 39690521, DOI [10.17761/2024-D-24-00021](https://doi.org/10.17761/2024-D-24-00021)) |
| Araç uyarısı, her ders ekranında; uyku dersinde ikinci satır | §2.4-12 | Direksiyonda uykululuk kazayla ilişkili, OR 2,51 (Bioulac 2017, PMID 28958002, DOI [10.1093/sleep/zsx134](https://doi.org/10.1093/sleep/zsx134)); 30 dk'dan uzun şekerlemeden sonra uyku ataleti (Lovato & Lack 2010, PMID 21075238, DOI [10.1016/B978-0-444-53702-7.00009-9](https://doi.org/10.1016/B978-0-444-53702-7.00009-9)) |
| "Önce yana dön, otur, sonra kalk" | Uzanarak derslerin ekranı ve kapanışı | 65 yaş üstünde ayağa kalkınca ilk KB düşüşü %29,0 (Tran 2021, PMID 34260686, DOI [10.1093/ageing/afab090](https://doi.org/10.1093/ageing/afab090)); tek 16 dk yoga nidradan sonra KB düştü, kontrol grubu yok (Ahuja 2025, PMID 39974253, DOI [10.7759/cureus.77717](https://doi.org/10.7759/cureus.77717)) |
| Onaysız durdurma ve dönüş ekranı; kesilmeyen kapanış | §2.7, §4 | Hipnozda uyandırma başarısızlığı istenmeyen etkilerde önemli bir etken sayılıyor (Howard 2017, PMID 28300508, DOI [10.1080/00029157.2016.1203281](https://doi.org/10.1080/00029157.2016.1203281)); yeterli yerleşme ve dışa dönüş (Luu 2024) |
| Zor blok bölünmez, kapanıştan hemen önceye konmaz; son 60 sn'de yeni imge yok | Planlayıcı testi | Travma yaşamış kişilerde kendine şefkat yöneltmek tehdit tepkisi doğurabildi (Creaser 2022, PMID 35391975, DOI [10.3389/fpsyg.2022.765602](https://doi.org/10.3389/fpsyg.2022.765602)); son 60 sn kuralı tasarım çıkarımı |
| "Huzursuzluk normal" cümlesi | Kart ve Ders 4 | Tek kayıttan gevşeme seansında 30 kişinin 5'inde kaygı arttı (Braith 1988, PMID 3069875, DOI [10.1016/0005-7916(88)90040-7](https://doi.org/10.1016/0005-7916(88)90040-7)) |
| Zorlanma sorusu, "Çok" metni | §2.8 | Kalıcı kötü etki %6–14, aşırı uyarılma ve dissosiyasyonla ilişkili (Britton 2021, PMID 35174010, DOI [10.1177/2167702621996340](https://doi.org/10.1177/2167702621996340)) |
| "Derin nefes al" komutu yok; hızlı nefes, hiperventilasyon ve nefes tutma hiçbir derste yok | İçerik; veri denetimi (§16-G) | Derin nefes talimatı uyarılmayı önce artırdı (Toussaint 2021, PMID 34306146, DOI [10.1155/2021/5924040](https://doi.org/10.1155/2021/5924040)). On dersin hiçbirinde tutma planlanmadı (PLAN.v2 ders kartları); böylece nöbet cevabına göre "tutmasız" klip gerekmiyor |
| Ayakta hareket yok, ders boyunca oturarak ya da uzanarak | İçerik | Gözetimsiz, kendi başına yoga yan etki riskinin artmasıyla ilişkili bulundu (Cramer 2019, PMID 31357980, DOI [10.1186/s12906-019-2612-7](https://doi.org/10.1186/s12906-019-2612-7)) |
| Anı arama, geriye gitme yok | İçerik; §11.B-11 | Bazı terapötik işlemler sahte anılara yol açabiliyor (Loftus & Davis 2006, PMID 17716079, DOI [10.1146/annurev.clinpsy.2.022305.095315](https://doi.org/10.1146/annurev.clinpsy.2.022305.095315)); "geriye gitme" bağlantısı tasarım çıkarımı |
| Uyku dersi: uyandırma yok, ses tamamen durur, hoparlör önerisi | §4, §10.2 | Kulaklıkla uyumak, işitme çalışmasında riskli davranış olarak ele alındı (Wang 2021, PMID 33562129, DOI [10.3390/ijerph18041560](https://doi.org/10.3390/ijerph18041560)); hoparlör önerisi tasarım çıkarımı |
| Ekranda dB iddiası yok; sistem sesini uygulama yükseltmez; açılış 3 sn'de yükselir | Motor | Uygulama kulaktaki ses basıncını ölçemez (güvenlik §9, §11.D-7/8) |
| Yanıp sönme yok; nöbet cevabı "Hayır" değilse nabız yok | §3 | Uygulama ilkesi (DalgaVisual.jsx:4-6); ihtiyat |
| Ders 4 sonunda 112 satırı; "tedavi değildir" | §2.9, kart | Uygulamanın dili (Yon.jsx:362) |

### 10.2 Uyku dersi (Ders 3), ayrıca

- Önce puanı ve sonra ekranları yoktur. Kayıt ders bitince kendiliğinden yazılır; uygulama arka plandaysa açılışta
  uzlaştırılır (§4).
- "Uykuya geç" düğmesi uyku iznine atlar. Uyku izni: "Uykuya dalarsan bu da güzel; sesim yavaşça kısılacak."
- Gündüz dersi gece dinlenirse kapanıştaki uyandırma yine çalar; uyku izni yalnız uyku dersinde verilir (güvenlik
  §11.D-6).
- En kısa sürümü 5 dakikadır; 3 dakika yoktur (`sure.md` §3.4). Yolda sıraya girmez (`yol.md` §0-3).

### 10.3 Hazır metinlerde bulunan kusurlar ve düzeltmeler

Sahibin kuralı gereği ("kusuru sormadan düzelt") düzeltmeler plana işlendi. Güvenlik metni oldukları için Türkçe editör
onayından geçmeden yayına girmezler.

| # | Yer | Kusur | Düzeltme |
|---|---|---|---|
| a | Kart, 1. başlık "İstediğin an durabilirsin." | "durabilirsin" uzanan dinleyici için "olduğun gibi kalabilirsin" diye de okunuyor; pilotta sesli cümle bu yüzden "dersi bitirebilirsin"e çekildi (pilot/fixlog.md G2-03; PLAN.v2 §A.1 kartın da aynı fiile çekilmesini istiyor) | "İstediğin an dersi bitirebilirsin." Gövdedeki "Durmak da pratiğin bir parçası." → "Dersi yarıda bırakmak da pratiğin bir parçası."; "kendi haline" → "kendi hâline" (durum anlamındaki "hâl" düzeltme işaretiyle yazılır; PLAN.v2 metni de "kendi hâlinde" yazıyor) |
| b | Kart, 2. başlık "Araç kullanırken dinleme." | "dinleme" hem ad hem olumsuz emir olarak okunabiliyor; ders ekranı için aynı kusur pilotta düzeltildi (TR2-23) | "Araç kullanırken açma." Gövde zaten "… işteyken açma." diye bitiyor |
| c | "Çok" cevabının metni (güvenlik §11.F; ders2.lesson.json `afterCheck.onCok`) | Dersi sonuna kadar dinleyen kişiye de "durman doğruydu" diyor. "Gözleri açık bir sürüm" diye bir içerik yok: gözleri açık tutmak her derste sözle sunulan bir seçim, ayrı bir ses dosyası değil | İki biçim (§2.8): durdurduysa ve bitirdiyse. "sürüm" yerine "daha kısa bir süre seçebilir, gözlerini açık tutabilirsin" |
| d | Akşam önerisi | İki saat yazılmış: kütüphanede 21:00 (PLAN.v2 §E.1-1), ders kartında 20:00 (ders2.lesson.json `eveningHint`). Metin dersin adını söylemiyor ve "Akşam uyumadan önce" aynı şeyi iki kez söylüyor | Tek saat, 20:00 (`yol.md` ile aynı; VARSAYIM). Metin: "Uyumadan önce dinliyorsan Uykuya Geçiş daha uygun olabilir." |

Ek iki tutarlılık notu: (e) Açılış ekranının üçüncü satırı ("… sonra kalk") yalnız uzanarak yapılan gündüz derslerinde
görünür; oturarak yapılan derste ve uyku dersinde anlamsız olurdu. (f) PLAN.v2 §E.1'deki araç satırı ("Bu dersi araç ya
da makine kullanmıyorken dinle.") ile pilot 4. turun satırı ("Bu dersi yalnızca araç ya da makine kullanmadığın ve suda
olmadığın bir sırada dinle.") farklı; geçerli olan pilot 4. tur metnidir (_tur4_fixlog.md S3-07).

### 10.4 Travma-duyarlı dil: modülün denetlediği kısım

Güvenlik §11.B'nin 18 kuralı metin incelemesinde uygulanır (Türkçe editör ve usta hoca). Modül ve planlayıcı bunlardan
makineyle denetlenebilenleri test eder (§16-G, -H): her derste açılış satırları var; ekran ve klip metinlerinde yasak
sözcük listesi (PLAN.v2 §C.6) ve "kontrolü bırak", "kıpırdayamıyorsun" gibi ifadeler yok; 20 sn'yi aşan her sessizlik
duyurulu; Ders 4'te hiçbir pencere 45 sn'yi aşmıyor; zor blok bölünmüyor; son 60 sn'de yeni imge yok.

---

## 11. Ücretsiz / ücretli

- **Kodda bugün:** tek yetki `premium` (subscription.js:12). Web'de uygulama her zaman açık, test derlemesinde
  `VITE_TEST_UNLOCK` ile açık (subscription.js:68-71). Deneme teklifi kurulumun sonunda bir kez (App.jsx:782-791);
  abonelik yoksa bütün uygulama kilitli, açık kalan tek ekran güvenlik bilgisi "evidence" (App.jsx:895-908). Modül
  sözleşmesinde premium alanı yok (registry.js:9-52). `trialGate.js` bununla ilgili değildir.
- **İlk yayın önerisi (G4-a):** yoga bu tek kapının arkasındadır; 7 günlük denemede on ders açıktır. "Bir ders hep
  açık" seçeneği (G4-b) bugünkü kilit düzeninde yeni bir "ücretsiz kip" ister: kilit ekranına yoga için bir istisna
  ve kilitliyken görünecek ayrı bir giriş. Bu, ilk yayının kapsamı dışında kalır.
- Ödeme ekranındaki özellik satırlarına yoganın eklenmesi G4 kararının parçasıdır. Öneri metni: "Yoga: 10 sesli ders,
  3 ile 15 dakika arası."

---

## 12. Usta hoca ölçütleri: 3 · 5 · 15'te değişenler

PLAN.v2 §E.6'daki 18 ölçüt her ders için yayın kapısıdır. Kısa süreler üç ölçütü etkiliyor:

| Ölçüt | PLAN.v2 | İlk yayında |
|---|---|---|
| 1 Zaman verir: hiçbir çekirdek blok 0:55'ten kısa değil | Ders 2'nin 5 dakikasında görünür istisna | 3 dakikada iki istisna daha: Ders 8 C1 0:38, Ders 10 C5 0:43 (`sure.md` §9-3, sahibin onayında) |
| 2 Sessizliği kullanır: 5 dakikada bile en uzun boşluk ≥ 8 sn | — | 3 dakikada da ≥ 8 sn; nefes payı ≥ 12 sn (`sure.md` §8) |
| 11 Çıkış kapısı: 30 dakikada ortada tekrar | — | İlk yayında 30 dakika yok; ortada tekrar gerekmez. "Kaldığın yerden" sürdürmesi açılış izniyle başlar (§2.10) |

Öteki 15 ölçüt değişmeden geçerlidir.

---

## 13. Sürüm notu (releases.js; yalnız cihazda doğrulanmış derlemede, yeni bir kimlikle)

Biçim `{ id: 'YYYY-MM-DD-n', title, items: [{ kind: 'new', text }] }`; TestFlight'a gitmiş bir girdiye madde eklenmez,
her TestFlight yeni kimlik alır (releases.js:1-6, Bug 31). Jargon yok ("varış" yerine "karşılama", CRITIQUE #28).

```
{ kind: 'new', text: 'Yoga: 10 sesli ders (Nefesin Ritmi, Derin Dinlenme, Uykuya Geçiş, Zor Anlar İçin, Tek Nokta, Sabah Niyeti, Kendine Şefkat, Sağlam Yer, Kendini Tanımak, Gelecekteki Sen). Dersleri 3, 5 ya da 15 dakika dinleyebilirsin; Derin Dinlenme, Uykuya Geçiş ve Kendine Şefkat 5 dakikadan başlar. Kısa sürüm de karşılamayla başlar ve kapanışla biter; süre dolduğunda hiçbir cümle yarıda kalmaz. Neslihan ya da Hakan anlatır. Ekran kilitliyken de çalar. Neye dayandığı ve sınırları her dersin "Kaynaklar" kartında.' },
{ kind: 'new', text: 'Gelişim: yoga yaptığın günler ve dersten önce ve sonra verdiğin puanlar, dersin ilgili olduğu alanda görünür (ör. Tek Nokta, Dikkat alanında). Uykuya Geçiş\'i dinlediğin gecenin sabahında tek bir soru gelir: "Dün gece uykuya dalmak ne kadar kolaydı?"' },
```

Koşullu eklemeler: arka plan seçeneklerinin hepsi ölçümden geçerse ilk maddeye "Müzik, doğa sesi ya da sessizlik
seçebilirsin." cümlesi; Derin Dinlenme'ye 20 dakika onaylanırsa "(Derin Dinlenme'de 20 dakika da var)"; yol
bağlantısı aynı derlemedeyse üçüncü madde: "Bugün'ün yolunda 3. günden itibaren kısa bir yoga dersi yer alır."
G8 kararıyla bölümün adı değişirse ilk sözcük de değişir. Cümleler Türkçe editörden geçer.

---

## 14. Yol haritası maddesi (YAPILACAKLAR.md, "Sonsuz yol" bölümündeki (g) için hazır metin)

```
- [ ] **(g) Yoga modülü, ilk yayın: 10 ders × 3 · 5 · 15 dk** (sahibinin iş sırası: önce yoga). Plan: yoga-pilot/PLAN.v2.md
      + 2026-09-29 birleşik plan (süre, yol, modül belgeleri). Kural: bir ders ancak metni üç insan incelemesinden
      (Türkçe editör; usta hoca 18 ölçüt; Ders 4 ve 7'de klinik psikolog) geçip, klipleri yazıya geri çevrilerek
      birebir doğrulanıp, karışımı ölçümden geçip, cihazda kilitli ekranda 3, 5 ve 15 dk çalıp sahibi dinleyip
      onaylayınca [x] olur.
  1. [ ] Sahip kararları: G2 paket, G3 oynatıcı teması, G4 ücret, G7 yaş, G8 ad, G10 inceleyiciler, G11 build-dev ve
         swiftpm; tasarlanan hoca sesinin tarifi; 3 dk istisnaları ve Derin Dinlenme'ye 20 dk (süre belgesi).
  2. [ ] Ders 2 pilotunun dinlenmesi (4 karışım, kör A/B): ses ve müzik kaynağı (G9) seçimi.
  3. [ ] Tasarım Artifact'ı: güvenlik kartı, ses denetimi, kütüphane, ders ayrıntısı, önce puanı, oynatıcı (gerçek
         pilot sesiyle eşzamanlı görsel), durdurma, sonra puanı ve zorlanma, bitiş, kaldığın yerden, sabah kartı;
         iki tema, 320 px.
  4. [ ] Kalan 9 dersin metni ve sesi (3'lü partiler), her biri 3/5/15 dk ölçümle.
  5. [ ] Kod: lib/yoga.js (planlayıcı, kayıt, sabah sorusu, görsel durumu), modules/yoga (manifest + view),
         storage.updateSession, Ana sayfa sabah kartı, coachCore istem satırı + CoachCard eşlemesi (sunucu yeniden
         yayımlanır), sources.js kaynakları ve kaynak türü; testler.
  6. [ ] YogaAudio yerel motor ve cihaz kontrol listesi → HATA_GUNLUGU.
  7. [ ] Sürüm notu (yeni kimlik; Bug 31 kuralı) ve ENVANTER_VE_PLAN.md "## 20. Yoga (tarih, Build — durum)".
```

---

## 15. PLAN.v2 §G: 11 kararın bugünkü durumu

| # | Konu | Durum | İlk yayın için |
|---|---|---|---|
| G1 | Her ders kendi alanını doldursun mu? | Açık, ama ilk yayını bekletmiyor | **(a) ile kapatmayı öneriyorum:** önce → sonra etkileri zaten dersin kendi alanında (registry.js:154); 28 günlük şerit Sakinlik. (b) (oturum başına alan) ortak dosyalara (dataHub.js:36-38, :181) dokunduğu için sonsuz yolun "her modül Gelişim'e bağlanır" işine taşınır |
| G2 | Paket mi, indirme mi? | **Açık (sahip)** | Sayılar küçüldü. İlk yayın ≈ 165–180 MB ek (VARSAYIM): konuşma 10 ders × 2 ses × ≈ 320 sn, mono AAC 48 → ≈ 38 MB (pilotun 15 dakikasında 278–286 sn konuşma, report.md; kısa biçimler için pay VARSAYIM); yataklar ders başına 1.440–1.620 sn stereo AAC 64 → 115–130 MB (pilot yatak takımı, SPEC §5); doğa ≈ 10 MB. PLAN.v2'nin 30 dakikalık tahmini 200–280 MB idi. Öneri yine (a) hepsi pakette; IPA boyutu pilotta ölçülür |
| G3 | Oynatıcı hep karanlık mı? | **Açık (sahip)** | Öneri (a): Dalga oynatıcısı (dalga.css:52) ve gece saati (NightClock.jsx:6) emsal; YAPILACAKLAR.md:418 kuralına açık istisna olarak yazılır. Kütüphane ve ayrıntı iki temada |
| G4 | Yoga ücretli mi? | **Açık (sahip)** | (a) fiilen tek yol (§11) |
| G5 | Seslendirme yolu ve bütçe | **Yol kapandı:** yalnız MCP, `eleven_v4` (SAHIP_ISTEKLERI.md kararlar). **Bütçe açık:** Ders 2'nin 15 dakikalık pilotu (iki ses, iki müzik kaynağı) 11,44 USD tuttu (report.md "Maliyet"); on dersin 3/5/15 tahmini süre belgesinde (`sure.md` §2.6) | Bütçe tavanı sahibe sorulur |
| G6 | "Seslerin eğitilmesi" | **Kapandı: (b)** Neslihan + Hakan + tasarlanan aday (SAHIP_ISTEKLERI.md kararlar) | İki alt adım açık: tasarlanacak sesin tarifi ve örnek cümlesi sahipten gelir (ses tasarımı aracı ikisini de kullanıcıdan ister); kör dinleme sonucu. Aday henüz üretilmedi (harcama kaydında ses tasarımı satırı yok). Modül 1–3 sesi veriden okur |
| G7 | Yaş sınırı | **Açık (sahip)** | Öneri (a): hızlı nefes, hiperventilasyon ve tutma hiçbir derste yok |
| G8 | Ad ve kapsam | **Açık (sahip)** | Öneri (b) "Yoga ve Meditasyon" sürüyor; yeni bir gerekçesi de var: `yol.md` yoganın kısa derslerini yolun tek sakin durağı yapıyor, yani yol boyunca "meditasyon" durağının işini de yoga görüyor |
| G9 | Müzik yataklarının kaynağı | **Kapanmak üzere** | İki kaynaktan kör A/B karışımları hazır (`render/out`, eşleme `_ab_key.json`'da kapalı); sahip dinleyince kapanır |
| G10 | İnceleyiciler | **Açık ve en ağırı** | PLAN.v2 "inceleyici bulunmadan pilot metni seslendirilmez" diyordu; pilot, dört model incelemesi turuyla seslendirildi, insan onayı bekleyen maddeler duruyor (ör. _tur4_checkpoint.md: "ön kol" insan editöre işaretli). İlk yayının kapısı insan onayıdır; adları sahip belirler |
| G11 | `build-dev` ve `swiftpm` izlensin mi? | **Açık (sahibin Mac'i)** | Kod aşamasının ön koşulu (pbxproj çakışması); bu kopyada `.gitignore`'da ikisi de yok |

**Bu belgede verilen tasarım kararları** (sahibin kuralı gereği sorulmaz; itiraz gelmezse uygulanır): sabit "Bu
derste" listesinin kaldırılması (§2.4-3); serbest denge kaydırıcısı yerine netlik anahtarı (§2.4-8); arka plan
seçeneklerinin ölçüme bağlanması (§2.4-5); yoganın kendi ses tercihi (§2.4-4); kaldığın yer kuralları (§2.10); kaydın
puandan önce yazılması ve `updateSession` (§6.1); sabah sorusunun gece penceresi ve alarmla sırası (§9); Nef'e yalnız
dört sayı (§8); dört metin düzeltmesi (§10.3); tek saat eşiği 20:00.

**Sahibe yeni soru yok.** Bu belgeden doğan her şey ya tasarım kararıdır ya da zaten açık olan G maddelerine bağlanır.

---

## 16. Testler (birim)

**A. `lib/yoga.test.js` (yeni)**
1. Kayıt: 29 sn → `null`; `completed` yalnız `reachedClosing && seconds ≥ 0,6 × planned`; "Kapanışa geç" ile 60. sn'de
   kapanışa geçilen 3 dakikalık ders `reachedClosing: true`, `completed` süreye göre; puan 1–10 dışında → `null`;
   `delta`; Ders 3'te `before/after` hep `null`; müzik kuyruğu `seconds`'a girmez.
2. Sabah sorusu: 23:10'da başlamış ders → ertesi gün 04:00'te var, 11:59'da var, 12:00'de yok, 03:59'da yok; 00:40'ta
   başlamış → aynı gün var; 14:00'te başlamış → hiç yok; cevaplanmış → yok; "Atla" → yok; alarm sorusu bekliyor → yok,
   alarm cevaplanınca var; aynı gece iki ders → sonuncusu; 29 sn'lik ders (kayıt yok) → yok.
3. Kaldığın yer: 3 ve 5 dakikada kart yok; 15 dakikada bölüm başından ve açılış izni klibiyle; `contentHash` değişti →
   baştan başlama metni; 7 günden eski → silinir; sürdürülen oturum aynı kaydı günceller, saniyeler toplanır.
4. Görsel durumu `visualAt`: pilot zaman çizelgesiyle evreler doğru sırada; `flashSafe` `null` ya da `false` → ölçek
   1; Hareketi Azalt → ölçek 1; `image:on/off`; şafak rampası ≥ 60 sn (3 dakikada onaylanırsa ≥ 45); `end` → karanlık;
   aynı girdi aynı çıktı.

**B. `modules/yoga/manifest.test.js` (yeni)**
- `validateManifest` boş hata; 9 etki, anahtarlar tekil; her `pick` yalnız kendi dersinin `type: 'yoga'` kaydında çift
  döndürür; Ders 3'ün etkisi yok; `better: 'down'` yalnız 1, 2, 4.
- `yoga-uyku-dalma` yalnız `sleepEase`'i olan Ders 3 kayıtlarından okur.
- `stats([])` → `[]`; satırlar ≤ 3 ve hepsi dize; `best` aynı gün iki dersi bir sayar (yerel takvim günü).
- `coach` son 7 günde yoga yoksa `null`; varsa 4 sayı; `sanitizeModules({ yoga })` değiştirmeden geçirir.
- `describe` başlığı ve ayrıntısı; `storageKeys` `resetKeys()` içinde; yollar `yoga`, `yoga-1` … `yoga-10`;
  `progression` yokken `today()` → `null`.

**C. Değişecek mevcut testler**
- registry.test.js:7 modül listesine `'yoga'`; :32 Pratikler sırası `…, 'breath', 'yoga', 'dalga', …`; :84-89 etki
  örneğine `yoga: { type: 'yoga', lesson: 2, before: 6, after: 3, date }`; :95-102 metrik örneğine
  `yoga: { type: 'yoga', lesson: 3, sleepEase: 7, date }`.
- Değişmeden yeşil kalması gerekenler (mevcut sistem bozulmadı kanıtı): coachStats.test.js:22 (örnek veride yoga yok →
  `null`), today.test.js:22-27 (yoga `today()` ilerleme yokken `null`; bugünkü gün şablonu aynı), dataHub.test.js:19.

**D. `lib/storage.test.js`:** `updateSession` birleştirir; `id`, `date`, `type` değişmez; bilinmeyen kimlik → `null`;
yazma kalıcı.

**E. `lib/dataHub.test.js` ve `lib/progress.test.js`:** yoga kaydı Sakinlik gününe düşer; Ders 5'in etkisi Dikkat'te,
Ders 2'ninki Beden'de; `better: 'down'` etkide iyileşme işareti doğru; metrik İyi oluş'ta.

**F. Nef:** `screenFor('Yoga')` → `'yoga'`; sistem istemi yoga satırını içerir; `passesGuard` davranışı aynı.

**G. Ders verisi denetimi (her yayımlanmış ders):** açılış satırları var; uzanarak derste kalkış satırı, uyku dersinde
ikinci araç satırı ve önce sorusunun yokluğu; ekran ve klip metinlerinde yasak liste (PLAN.v2 §C.6) ve §11.B-4
ifadeleri yok; hiçbir klipte nefes tutma yok; Ders 4'te pencere ≤ 45 sn; her Kaynaklar satırının PMID ve DOI'si
`sources.js`'te; yayımlanmış süreler 3/5/15 ya da 5/15; `published` bayrağı olmayan birleşim arayüzde görünmüyor.

**H. Planlayıcı:** `sure.md` §8'deki liste (her ders × 3/5/15 × her ses; üç hız senaryosu; kısa biçimler; T6 boş payı).

`lib/sources.js`: Luu 2024 bir öneri makalesidir ve bugünkü kaynak türleri arasında buna uyan yok (sources.js:6-19).
`DESIGNS`'a yeni bir tür eklenir (ör. "Uzman önerisi"); ekleme, mevcut kartları etkilemez.

---

## 17. Cihaz kontrol listesi (iPhone; her madde HATA_GUNLUGU'na)

**Ekranlar**
- [ ] Kütüphane, ayrıntı, önce puanı, bitiş, sabah kartı, güvenlik kartı açık ve koyu temada; 320 px'te yana taşma
      yok; en uzun ders adıyla satır kırılıyor.
- [ ] Oynatıcı hep karanlık; denetimler 5 sn'de kayboluyor, dokununca dönüyor; VoiceOver her düğmeyi okuyor; "Altyazı"
      açıkken yazı söylenen cümleyle aynı.
- [ ] Süre çipi değişince bölüm şeridi anında güncelleniyor; Derin Dinlenme, Uykuya Geçiş ve Kendine Şefkat'te 3 dk
      çipi yok; Ders 7 ve 9'da "Uzanarak" seçilince 3 dk kalkıyor.
- [ ] İlk girişte güvenlik kartı bir kez; (i) ile yeniden açılıyor. İlk derste ses denetimi bir kez; "Hayır" netliği
      açıyor ve hatırlıyor. İlk yoga dersinde "Bugün yalnızca tanışıyoruz; zorlanırsan kısalt." bir kez çalıyor.

**Ses ve kilit** (her ders için en az bir süre, iki sesle; Ders 2 için 3 sürenin hepsi)
- [ ] "Başla" dokunuşunda ses gecikmesiz başlıyor; açılış 3 sn'de yükseliyor, ani yüksek ses yok.
- [ ] Ekran kendi süresinde kararıp kilitleniyor, ders kesintisiz sürüyor: 3, 5 ve 15 dakika. Sessiz tuşu açıkken de
      çalıyor.
- [ ] Kilit ekranında ders adı, bölüm, geçen/toplam süre; oynat/duraklat kilit ekranından ve AirPods dokunuşundan
      çalışıyor; başka düğme yok.
- [ ] Duraklat → 1 sn'de sönüyor; Sürdür → klibin başından. Kapanışa geç → cümle bitiyor, 4 sn sessizlik, kapanış
      kısalmadan; imge bloğunun içindeyken önce bırakma ön klibi.
- [ ] X → 2 sn'de sönüyor; dönüş ekranı; "Sesli dönüşü dinle" 20–30 sn; sonra yalnız zorlanma sorusu.
- [ ] Bölüme atlama ve sarma en yakın klip başına oturuyor; müzik ve görsel o evreye geçiyor.
- [ ] Görsel ile ses: hoparlörde ve AirPods'ta nefes formunun büyüme anı ile "al" sözü arasındaki fark ölçülüyor
      (ölçülmeden "eşzamanlı" denmiyor).
- [ ] iPhone hoparlöründe Hakan'ın sesi anlaşılır (kod-haritasi R12); netlik anahtarı açıkken konuşma belirgin öne
      çıkıyor.

**Kesintiler ve çıkışlar**
- [ ] Telefon araması ve Siri: duruyor; bitince izin varsa klibin başından sürüyor, yoksa duraklatılmış kalıyor; ekran
      sayacı sesle aynı.
- [ ] AirPods çıkarılınca hemen duruyor; ders ortasında AirPods takılınca, araç Bluetooth'una ve Denetim Merkezi'nden
      çıkışa geçilince durmadan sürüyor; 90 sn'lik sessizlikten sonra AirPods'ta ilk hece yutulmuyor.
- [ ] Bildirime dokunup başka ekrana geçince ders sürüyor; Yoga kutucuğu oynatıcıyı açıyor.
- [ ] Uygulama ders sırasında sistemce kapatılınca: yeniden açılışta kayıt yerinde (dinlenen süre doğru), 15 dakikalık
      derste "Kaldığın yerden" kartı; "Sürdür" bölüm başından ve açılış izni klibiyle.
- [ ] Dalga'nın uyku sesi çalarken ders ekranında "Çalan uyku sesi duracak." satırı; ikisi aynı anda çalmıyor. Mikrofon
      kaydı sürerken ses açılamadı metni.
- [ ] Düşük güç kipinde ve 15 dakikalık kilitli çalmada pil tüketimi ölçülüyor.

**Uyku dersi ve sabah**
- [ ] 23:00'te Uykuya Geçiş, müzik kuyruğu 10 dk: uyku izninden sonra ses susuyor, müzik son 3 dk'da kısılıp tamamen
      duruyor; ekran kararıp kilitleniyor; önce ve sonra ekranı yok.
- [ ] Ertesi sabah 04:00–11:59 arasında ilk açılışta tek kart; cevap Gelişim → İyi oluş'ta; 12:00'de kart yok.
      00:40'ta başlanan derste aynı sabah kart var; 14:00'te dinlenen derste kart yok.
- [ ] Aynı sabah alarm sorusu da varsa önce o, sonra yoga sorusu; ikisi aynı anda görünmüyor.

**Gelişim ve Nef**
- [ ] Aynı dersten 3 oturumdan sonra alan kartında etki ve GA; rekor kutusunda "Yoga · pratik yapılan gün"; Pratikler
      kartı 3 satır; oturum geçmişinde "yarıda kaldı".
- [ ] 28 günlük şeritte yoga günü Sakinlik'te; 5. gün raporunda yoga etkileri; "Doktoruma göster" PDF'inde etki
      satırları; zorlanma cevabı hiçbir yerde görünmüyor.
- [ ] Nef açıkken: öneri kartı çalışıyor; "Yoga" önerisi düğme olarak kütüphaneyi açıyor. Nef kapalıyken hiçbir veri
      gitmiyor.
- [ ] "Tüm verileri sil" yoga tercihlerini, kaldığın yeri ve yerel uzlaştırma değerini siliyor; sonra güvenlik kartı
      ve ilk ders cümlesi yeniden geliyor.

**Güvenlik ve abonelik**
- [ ] Nöbet sorusu cevapsız ya da "Evet / Emin değilim" iken form nabız atmıyor; "Hareketi Azalt" açıkken de.
- [ ] Deneme bitince yoga kilitli; güvenlik bilgisi ekranı açık kalıyor.
- [ ] Zorlanma "Çok": durduran ve bitiren için doğru metin; bitiş önerisi aynı dersin en kısa süresi ve "Gözlerin açık
      kalabilir." satırı. Ders 4'ün sonunda 112 satırı.

---

## 18. VARSAYIM ve doğrulanmayanlar

- **VARSAYIM:** `home.order` 33; tamamlanma eşiği %60; 30 sn kayıt eşiği; kaldığın yer kuralları (yalnız 15/20 dk,
  bölüm başı, 7 gün); sabah penceresi (18:00–05:59 başlangıç, 04:00–11:59 soru); akşam eşiği 20:00; puan uç etiketleri;
  parlaklık tavanları (%15 / %4); yataklar için ders başına 1.440–1.620 sn ve konuşma için ≈ 320 sn; müzik kuyruğunun
  dakikaya sayılmaması; ses denetiminin Ders 2 klipleriyle yapılması.
- **Doğrulanmadı:** yerel motorun bu uygulamada kilitte 15 dakika sürmesi (mevcut uyku sesinde bile işaretlenmedi,
  kod-haritasi R13); rota değişimi, yapılandırma değişikliği ve medya hizmetleri sıfırlanması sonrası davranış;
  Bluetooth gecikmesi; iPhone hoparlöründe erkek sesin anlaşılırlığı; IPA boyutu; kilit ekranında uzlaştırma değerinin
  yazılması; tasarlanacak hoca sesinin hızı (Neslihan'dan yavaşsa kısa sürüm bütçeleri yeniden hesaplanır, `sure.md`
  §10); tasarlanan sesin kullanım koşulları; kütüphane seslerinin ticari kullanım koşulları; Nef rıza metninin dört
  sayıyı kapsadığı yorumu (hukukçu).
- **Kulakla dinleme yapılmadı.** Pilot karışımları ölçüldü ama sahibi tarafından henüz dinlenmedi (report.md
  "Doğrulanmayanlar"). Bu belgedeki hiçbir ekran henüz çizilmedi; önce tasarım Artifact'ı, onaydan sonra kod.

---

## Kaynaklar (hepsi yoga-pilot dosyalarının ikinci tur doğrulamasından)

| PMID | Kısa künye | DOI | Dosya |
|---|---|---|---|
| 32820538 | Farias 2020 | 10.1111/acps.13225 | güvenlik C1 |
| 34074221 | Goldberg 2021 | 10.1080/10503307.2021.1933646 | güvenlik C2 |
| 35174010 | Britton 2021 | 10.1177/2167702621996340 | güvenlik C3 |
| 3069875 | Braith 1988 | 10.1016/0005-7916(88)90040-7 | güvenlik C5 |
| 34306146 | Toussaint 2021 | 10.1155/2021/5924040 | güvenlik C6 |
| 28300508 | Howard 2017 | 10.1080/00029157.2016.1203281 | güvenlik C7 |
| 39690521 | Luu 2024 | 10.17761/2024-D-24-00021 | güvenlik C10 |
| 35391975 | Creaser 2022 | 10.3389/fpsyg.2022.765602 | güvenlik C13 |
| 31357980 | Cramer 2019 | 10.1186/s12906-019-2612-7 | güvenlik C20 |
| 39974253 | Ahuja 2025 | 10.7759/cureus.77717 | güvenlik C22 |
| 34260686 | Tran 2021 | 10.1093/ageing/afab090 | güvenlik C23 |
| 28958002 | Bioulac 2017 | 10.1093/sleep/zsx134 | güvenlik C24 |
| 21075238 | Lovato & Lack 2010 | 10.1016/B978-0-444-53702-7.00009-9 | güvenlik C25 |
| 33562129 | Wang ve ark. 2021 (kulaklık) | 10.3390/ijerph18041560 | güvenlik C27 |
| 17716079 | Loftus & Davis 2006 | 10.1146/annurev.clinpsy.2.022305.095315 | güvenlik C28 |
| 31304366 | Larsen 2019 | 10.1038/s41746-019-0093-1 | teslim; PLAN.v2 Ek |
| 39808431 | Radin 2025 | 10.1001/jamanetworkopen.2024.54435 | benlik C09; PLAN.v2 Ek |
| 34350544 | Whitfield 2021 | 10.1007/s11065-021-09519-y | benlik; PLAN.v2 Ek |
| 36731199 | Sharpe 2023 | 10.1016/j.jpsychores.2023.111169 | sakin; PLAN.v2 Ek |
| 11863237 | Harvey & Payne 2002 | 10.1016/s0005-7967(01)00012-2 | sakin; PLAN.v2 Ek |

Kaynak: PubMed (National Library of Medicine). DOI'ler `https://doi.org/` önekiyle açılır.
