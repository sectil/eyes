# Açık işler · SONSUZ YOL (salt okunur denetim, 2026-09-30)

Depo `/home/user/eyes`, dal `claude/cool-pasteur-j5yupf`, HEAD `70ca7d5`; çalışma ağacı temiz ve uzak dalla eşit
(`git status -sb`: 0 önde / 0 geride). Satır numaraları bu HEAD'e göredir. Belge yolları `docs/yol-haritasi/` altına,
kod yolları `app/src/` altına göredir.
Sınıflar: **A** bitmemiş ve kimse yapmıyor · **B** bitmemiş, şu an çalışan bir işte · **C** sahibin kararını ya da
eylemini bekliyor · **D** iş aslında bitmiş ama belgede açık ya da eski görünüyor · **E** cihazda doğrulama bekliyor.

## Kısa durum
- **Y1:** kod depoda (`6ea6890`, 30 Eylül 09.55; `70ca7d5` 5 saniye turunun ara kaydı). §G.3'teki bütün yeni dosyalar var:
  `lib/progression.js`, `lib/ladders.js`, `lib/breathMix.js` ve testleri. Değişecek dosyaların hepsine dokunulmuş;
  iki fark var: `lib/pathLater.js` ve `lib/today.js:431` değişmedi, rapor bunları gerekçesiyle yazıyor
  (`Y1_KOD_RAPORU.md:46-47`, `:195`). Durum `[~]`: TestFlight'a çıkmadı, cihazda denenmedi.
- **Y2–Y6:** başlamadı. Plana göre bu doğru, çünkü aşamalar sıralı ve Y1'in S2 kapısını bekliyor. Tek istisna, Y3
  kapsamındaki "sıfır satırı" kuralının bir kısmı; bu kısım Y1'in 5 saniye turunda erkenden koda girdi.
- **§2.4 belge düzeltmeleri:** hiçbiri yapılmadı.
- **S0 kararları:** D1–D23 plana işlenmedi.

---

## A · Bitmemiş ve kimse yapmıyor

### A1. Plan §2.4'teki belge düzeltmeleri hiç yapılmadı
- **Kanıt:** Plan 30 Eylül 03.26'da onaylandı (`bdbaafd`). Aşağıdaki belgelerin son kaydı bu onaydan öncedir:
  `YOL.nef.md`, `YOL.moduller.md` ve `YOL.ilerleme.md` → `4e6f528` (29 Eylül); `arastirma-v1/*.md` → `d796f99`
  (29 Eylül); `YAPILACAKLAR.md` → `c4ce6b4` (29 Eylül). Yerinde kalan örnekler:
  - `tasarim/YOL.nef.md:488` ve `:498` hâlâ "Günlük test" diyor (§9.1).
  - `tasarim/YOL.moduller.md:355-356` Watson ve Windred'i hâlâ "sources.js" diye gösteriyor.
  - `tasarim/YOL.moduller.md:676-677` Nef satırlarında hâlâ `sleep` ve `steps7` var.
  - `tasarim/YOL.ilerleme.md:1-11` belgenin başında "bu plana göre geçersiz" notu yok.
  - `YAPILACAKLAR.md`'de "4.10" hiç geçmiyor (grep boş döndü).
  - `arastirma-v1/hava-ay.md:58` hâlâ "19:00'dan sonra", `:466` hâlâ "0 ya da 249,99 $" diyor.
  - `arastirma-v1/gunun.md:170` hâlâ "294 kanser hastasında … %95" diyor.
  - `arastirma-v1/merdiven.md:217` hâlâ "0,5 sn adım" diyor.
  - `arastirma-v1/gelisim-nef.md:86` hâlâ `reading/manifest.js:297` gösteriyor.
- **Önerilen adım:** Tek bir belge turu yapılsın: §2.4'teki 8 maddenin hepsi işlensin ve `YOL.ilerleme.md`'nin başına
  not düşülsün. `app/` altına dokunulmayacağı için çalışan işlerle çakışmaz.
- **Kimin işi:** orkestratör ya da belge ajanı.

### A2. S0'ın D1–D23 düzeltmeleri ve Y1 raporunun plan düzeltmeleri plana işlenmedi
- **Kanıt:**
  - S0 tarafı: `tasarim/S0/plan-duzeltmeleri.md:3-4` "Plan dosyası bu işte **değiştirilmedi**" diyor.
  - Y1 raporunun istediği düzeltmeler (`Y1_KOD_RAPORU.md:173-190`):
    - 629 → "zarfta 629, seçilen 230". Plan hâlâ 3 yerde 629 diyor, 230 hiç geçmiyor (grep).
    - `steps` → `stepIds`. Planda `stepIds` yok.
    - §G.6'daki izinli fark listesine iki madde eklenecek.
    - §A.9'un 3 dakikalık bütçe satırı: planda 12,7 / 12,9, kodda 12,5 / 12,8.
  - §G.3'ün Y1 satırında `lib/pathLater.js` ve `lib/today.js:431` hâlâ "değişen" diye yazılı (`Y1_KOD_RAPORU.md:46`,
    `:195`).
- **Önerilen adım:** S0'ın 5 saniye turu bitince PLAN v1.1 çıkarılsın ve D1–D23 ile Y1'in §7 maddeleri tek seferde
  işlensin. Tur plan-duzeltmeleri'ne yeni madde ekleyebilir, bu yüzden turun bitmesi beklensin.
- **Kimin işi:** orkestratör.

### A3. Y1 metin kapısı: iki bağımsız model incelemesi yapılmadı
- **Kanıt:** Rapor, metin kapısını bekleyen 3 cümle ve açık NIT #23 listeliyor (`Y1_KOD_RAPORU.md:154-167`, `:77`).
  Plan §H `:1216-1220` metin kapısını üç denetimle tanımlıyor. Bunların inceleme kaydı başka hiçbir belgede yok (grep
  "metin kapısı").
- **Önerilen adım:** 5 saniye turu bitince yapılsın, çünkü tur bu metinleri değiştirebilir. İki bağımsız dil
  incelemesinden sonra cümleler sahibe gitsin (C4).
- **Kimin işi:** dil inceleme ajanları.

### A4. Y1'in eşdeğerlik ve benzetim düzenekleri depoda değil; son değişiklikten sonra yeniden koşulmadı
- **Kanıt:**
  - Rapor düzeneklerin yerini oturumun karalama alanında gösteriyor (`Y1_KOD_RAPORU.md:109-110`, `:114`):
    `scratchpad/y1-5sn/esdeger/esdeger_y1.mjs`, `sim_gercek.mjs` ve `y1fix/eq/`.
  - `git ls-files | grep esdeger_y1` boş döndü.
  - `70ca7d5` `screens/Home.jsx:211` (`startSuggest`) ve `components/TodayPath.jsx`'i değiştirdi. Kayıt mesajında yalnız
    "136 dosya / 1855 test yeşil" yazıyor; eşdeğerlik (§G.6: ilerleme kapalıyken 0 fark) yeniden koşulmamış.
- **Önerilen adım:** Düzenekler depoya alınsın (ör. `tasarim/y1-esdeger/`). 5 saniye turu bitince 20.000 bağlamlık iki
  koşu (ilerleme kapalı ve açık) yeniden yapılsın. Y2 de aynı düzeneğe dayanacak.
- **Kimin işi:** Y1'in 5 saniye iş akışının sonunda ya da orkestratör.

### A5. 90. günden sonraki haftalık odak hiçbir aşamaya bağlı değil
- **Kanıt:**
  - Plan haftalık odağı birkaç yerde anlatıyor: `SONSUZ_YOL.PLAN.v1.md:33`, `:55-57` ("benzetilmedi"), `:311`, `:389`,
    `:1091`.
  - §G.3 tablosunun (`:1146-1151`) hiçbir satırında yok.
  - Kodda da yok: `grep -i 'odak|focus' lib/progression.js lib/ladders.js` boş döndü.
  - Rapor bunu açıkça yazıyor: "90. günden sonraki nefes odak haftası Y1'de yok" (`Y1_KOD_RAPORU.md:192-193`).
- **Önerilen adım:** PLAN v1.1'de bir aşamaya bağlansın (öneri: Y1 ek işi ya da Y2) ve sahibe tek cümleyle söylensin.
- **Kimin işi:** orkestratör, ardından sahip.

### A6. Site yayını Y1 sürümüne bağlı, ama bu koşul hiçbir yerde takip edilmiyor
- **Kanıt:**
  - `6ea6890`, `site/pages/index.html` ile `home-path-*.webp`'yi Y1 yoluna göre güncelledi (nefes 3 dk, ilk gün 8 dk).
  - Rapor sitenin Y1 sürümüyle aynı gün yayınlanmasını istiyor (`Y1_KOD_RAPORU.md:62`, `:196-197`).
  - `YAPILACAKLAR.md`'de bununla ilgili bir kayıt yok.
  - Depoda otomatik yayın ayarı yok (kökte `vercel.json` yok).
  - Risk: site bundan önce yayınlanırsa uygulamada henüz olmayan yolu anlatır.
- **Önerilen adım:** `YAPILACAKLAR.md`'ye bir yayın koşulu yazılsın: "site yalnız Y1'in TestFlight ya da App Store
  sürümüyle".
- **Kimin işi:** orkestratör.

### A7. S0' kapsamında iki kanıt kartının PubMed doğrulaması yapılmadı
- **Kanıt:**
  - Plan §I `:1254` bu doğrulamayı S0' işi sayıyor: "`az-hareket` ve `goz-yorgun` kaynaklarının PubMed doğrulaması".
  - `:809-810`: Paluch 2022 notlarda yeniden doğrulanmamış; Galinsky 2000'in PMID'i yok.
  - `S0/ekranlar-ozet.md:622`: "metni ve doğrulanmış kaynağı yoktur, çizilmez".
- **Önerilen adım:** PubMed MCP ile PMID ve DOI doğrulansın; kart metni Y4'ün tasarımına girsin.
- **Kimin işi:** araştırma ajanı. Acil değil, Y4'ten önce yeter.

### A8. Y2–Y6 hiç başlamadı (plana göre sırası gelmedi)
- **Kanıt:**
  - Yeni dosyaların hiçbiri yok: `lib/dayOpen.js`, `lib/dayCards.js`, `lib/moon.js`, `lib/sky.js`, `lib/rainNotify.js`,
    `components/SkyCard.jsx`, `modules/gunun/`, `ios/App/App/SkyPlugin.swift`.
  - `metricStatusV2` kodda 0 kez geçiyor.
  - Y6'nın değiştireceği yerler olduğu gibi duruyor: `lib/coachCore.js:44` sınırı hâlâ `slice(0, 10)`;
    `lib/coach.js:24` hâlâ `screenHours` gönderiyor.
  - `git log --grep 'Y[2-6]'` yalnız iki kayıt veriyor: `ba3b394` (Y3 notu) ve `70ca7d5`.
  - Y3 için bekleyen girdi: `tasarim/Y3_NOTLAR.md:3-11`, Pratikler bölümü 5 saniye sınamasını geçmedi.
- **Önerilen adım:** Y2'nin kodu Y1'in S2 kapısından sonra başlasın. Plan `:1265-1266`'ya göre Y4 ve Y5'in tasarımı
  şimdiden hazırlanabilir. Y3'ün tasarımı Y3_NOTLAR bulgularını karşılamalı.
- **Kimin işi:** orkestratör (sıra).

### A9. Kontrastta iki küçük açık
- **Kanıt:** `tasarim/S0/ekranlar-inceleme.md:84`: avatar harfi 3,25:1, "başlangıcından iyi" hapı 4,47:1. İkisi de
  4,5:1'in altında.
- **Önerilen adım:** Y2'nin hap rengi baştan en az 4,5:1 seçilsin.
- **Kimin işi:** Y2'nin tasarımı.

---

## B · Bitmemiş ve şu an çalışan bir işte

### B1. Y1'in 5 saniye turu (Home, TodayPath, Breath)
- **Kanıt:** `70ca7d5` "Tasarım turu sürüyor" diyor. Bu kayıttan sonra Y1 raporu ve cihaz listesi eskidi:
  - Büyük düğme artık yolun Nefes durağının basamağını açıyor (`screens/Home.jsx:211-214`). Rapor ise hâlâ şunları
    yazıyor: #2 "Ana sayfa önerisi her zaman 5 dk" (`Y1_KOD_RAPORU.md:56`) ve cihaz listesinin 8. maddesi (`:146`).
  - Sıfır değerli satırlar çizilmiyor (`Home.jsx:221`, `:287`). Bu, Y3'ün karar 5d'sinin erken ve kısmi bir hâli.
    Hafta satırı hâlâ `4✓ hafta` biçiminde, S0 kararı Ç19'a (`sorular-kararlar.md:304-305`) uymuyor; Y3'te düzelir.
  - Gelişim haritası yolun altına indi (`Home.jsx:435`). Bu, onaylı Ana sayfa düzenini değiştiriyor.
- **Önerilen adım:** Tur bitince `Y1_KOD_RAPORU.md` (§2, §3 #2 ve §5 madde 8) güncellensin. Haritanın yer değişikliği
  sahibe açıkça gösterilsin. Ardından A4 (eşdeğerlik) yapılsın.
- **Kimin işi:** Y1'in 5 saniye iş akışı.

### B2. S0 tasarım sayfası sahibe gitmedi (S1 kapısı)
- **Kanıt:**
  - `e19d81f` "sahibe gitmedi" diyor; `8a42d62` "sürüyor (ara kayıt)".
  - `S0/sorular-kararlar.md:333-336`.
  - İkinci 5 saniye turunda değerlendiriciler "etkilenmedi" dedi (`S0/ekranlar-inceleme.md:90`).
  - Kalan açık (`S0/ekranlar-inceleme.md:85`): Ç16–Ç18, `ekranlar-ozet.md` Bölüm 3'e eklenmedi.
  - Not: Plan §H `:1212`'ye göre sıra "tasarım → sahibin onayı → kod"dur. Y1'in kodu S1 onayından önce yazıldı; S1,
    Y1'in görünüşünü de geriye dönük onaylayacak.
- **Önerilen adım:** Tur geçince sahibe gönderilsin ve C1 ile tek pakete konsun.
- **Kimin işi:** S0'ın 5 saniye iş akışı.

---

## C · Sahibin kararını ya da eylemini bekliyor

### C1. Yoga sabah kartının Ana sayfadaki yeri (S0 madde 19)
- **Kanıt:** `S0/sorular-kararlar.md:23-52` (45 sorudan sahibe kalan tek soru). `S0/plan-duzeltmeleri.md:6`.
- **Önerilen adım:** S0 sayfasıyla birlikte sorulsun. Öneri hazır: kart ilk dokunuştan sonra, büyük düğmenin altında.
- **Kimin işi:** sahip.

### C2. Hukukçu ve psikolog adları
- **Kanıt:**
  - Hukukçu: `tasarim/SAHIP_ISTEKLERI.md:78-79` "Hukukçu adı verilmedi → plandaki yedek". Üç soru hazır ama
    gönderilmedi (`S0/hukukcu-sorulari.md:1-4`). Son tarih Y4'ün cihaz kapısı S5 (plan `:190`, `:1230`).
  - Psikolog: yoga tarafında ad verilmedi (`yoga-pilot/SAHIP_ISTEKLERI.md:38`). Bu yüzden Zor Anlar İçin yolda gelmiyor,
    Kendine Şefkat yalnız 17.00'den sonra geliyor (plan `:289-295`).
- **Önerilen adım:** Sahibe bir kez hatırlatılsın, bugünkü yedeğin bedeli tek cümleyle söylensin. Acil değil.
- **Kimin işi:** sahip.

### C3. App Review sorusu: plan "sen gönderirsin" diyor, belge "gönderilmeyecek" diyor
- **Kanıt:**
  - Plan: `:194-196` ve §H `:1233-1235` ("S0'da istenir", sahip App Store Connect'ten gönderir).
  - Belge: `S0/app-review-sorusu.md:1-7` "gönderilmedi, şimdilik gönderilmeyecek"; önceki notta verilen App Store Connect
    yolu doğrulanmadan yazılmıştı ve öyle bir yol yok (`9a02bda`).
  - `SAHIP_ISTEKLERI.md`'de bu değişikliğe dair bir kayıt yok.
- **Önerilen adım:** Sahibe söylensin: yedek kural geçerli (başlıkta yalnız ay). Başlıkta hava istenirse Y5'ten önce App
  Review ile 30 dakikalık görüşme yapılsın. Plan §H de buna göre düzeltilsin (A2'ye eklenebilir).
- **Kimin işi:** sahip (karar), orkestratör (belge).

### C4. Y1 raporunun sahibe söylenecek maddeleri ve kod ajanlarının kararları
- **Kanıt:** `Y1_KOD_RAPORU.md:171-193` şunları sıralıyor:
  1. Nefes bileşimi 629 değil, 230.
  2. Eski kullanıcının yolunda 20 dakikalık sınırda yer açılıyor.
  3. 2. günün molası.
  4. Benzetim farkı.
  5. `steps` → `stepIds`.
  6. Kod ajanlarının kararları: tam set gününün adı "Normal set", yolun Nefes durağı basamağı açar, 90+ odak Y1'de yok,
     kısa E testi `pathDay`'e sayılmaz.

  Bunlara ek olarak A3'teki metin kapısı cümlelerinin onayı gerekiyor. `tasarim/SAHIP_ISTEKLERI.md`'de (1–96. satırlar)
  bunlarla ilgili bir kayıt yok.
- **Önerilen adım:** 5 saniye turu ve A3 bitince tek mesajla sahibe gitsin (5 saniye sınamasından geçerek). Cevaplar
  `SAHIP_ISTEKLERI.md`'ye yazılsın.
- **Kimin işi:** sahip; mesajı orkestratör hazırlar.

### C5. `YOL.*` belgelerinde plana girmemiş sorular (Y6'dan önce)
- **Kanıt:**
  - `tasarim/YOL.nef.md:627-631`: Yön'ün Ayna puanı Nef'e gitsin mi; alarm günleri; aylık Nef "Doktoruma göster" PDF'ine
    girmesin mi; WHO-5 düşükse kriz hattı satırı (hukukçu sorusu).
  - `tasarim/YOL.ilerleme.md:626`: 56. gün iris `rechecks[]`.
  - Planda bunların hiçbiri geçmiyor: `grep 'kriz|Ayna|rechecks|56\. gün'` boş döndü.
- **Önerilen adım:** Y6 tasarımına girilmeden önce sahibe sorulsun. Kriz hattı hukukçu sorularına eklensin.
- **Kimin işi:** sahip.

---

## D · İş bitmiş ama belgede açık ya da eski görünüyor

### D1. "Kod yoga yayınından sonra" yazan yerler eskidi
- **Kanıt:**
  - Eski yazan yerler:
    - Plan: `:3-5`, `:89`, `:142`, `:1255`.
    - `yoga-pilot/v3/PLAN.v3.md:171-172`.
    - `yoga-pilot/SAHIP_ISTEKLERI.md:42`.
  - Karşı kanıt: sahip 30 Eylül'de kodu erkene aldı (`tasarim/SAHIP_ISTEKLERI.md:92-96`, `8e61960`) ve Y1 kodu girdi
    (`6ea6890`).
  - Yoga belgelerinde "erkene" kaydı yok (grep boş).
- **Önerilen adım:** Plan (v1.1) ve iki yoga belgesine tek satırlık bir not eklensin.
- **Kimin işi:** orkestratör. Yoga belgeleri için yoga iş akışının bitmesi beklensin.

### D2. `YAPILACAKLAR.md`'de Y1 ((c)) hiç görünmüyor ve "Tasarımın özü" eski
- **Kanıt:**
  - `grep '^- \['` yalnız (a) `:80` ve (b) `:178` maddelerini buluyor; (c) için satır yok.
  - `:66-70` hâlâ eski tasarımı anlatıyor: "hafif gün ≈ 7 dk", "nefes 1-1-2-2-3…5 dk", "14. günde tam set",
    "meditasyon 3-3-4-4-5 dk".
  - Y1 ise kodda (`6ea6890`) ve `[~]` durumunda (`Y1_KOD_RAPORU.md:7`).
- **Önerilen adım:** Bir "(c) = Y1 `[~]`" satırı eklensin (cihaz listesine ve A6'nın yayın koşuluna bağlansın). "Tasarımın
  özü" plana bağlansın (§2.4'ün maddesi).
- **Kimin işi:** orkestratör.

### D3. Y1 raporu "Git kullanılmadı" diyor
- **Kanıt:** `Y1_KOD_RAPORU.md:9`; oysa kod `6ea6890` ile kaydedildi ve uzak dala gönderildi.
- **Önerilen adım:** B1'deki güncellemeyle birlikte düzeltilsin.
- **Kimin işi:** Y1'in 5 saniye iş akışı.

### D4. `YOL.*` belgelerinde, §2.4'ün dışında kalan eski yerler
- **Kanıt:**
  - `tasarim/YOL.nef.md:313` "`lib/progression.js` … henüz kodda yok" diyor; dosya var.
  - `tasarim/YOL.ilerleme.md:242` "E testi … KARAR gerekir" diyor; karar verildi ve (a) ile koda girdi
    (`YAPILACAKLAR.md:80`).
  - `YOL.ilerleme.md` §13'ün 1., 2., 4. ve 5. soruları plan tarafından kapatıldı (plan §2.1 #20, `:446`, karar 5.1).
  - `YOL.nef.md` §13'ün 1., 8. ve 9. soruları da plan tarafından kapatıldı (`:184-185`, §2.1 #21, karar 6).
- **Önerilen adım:** A1'deki "belgenin başına not" adımında bu yerler de "kapandı / geçersiz" diye işaretlensin.
- **Kimin işi:** orkestratör.

### D5. S0 incelemesindeki "320 pt Y1 cihaz listesine yazılmadı" notu eskidi
- **Kanıt:** `S0/ekranlar-inceleme.md:85` bunu açık diye gösteriyor. Oysa madde Y1 listesinde var
  (`Y1_KOD_RAPORU.md:145`, madde 7: 390 ve 320 pt, bant, baloncuk, bölüm etiketi) ve kodda düzeltildi (`:69`, #15).
- **Önerilen adım:** S0 turu belgeyi güncellerken bu satır kapatılsın.
- **Kimin işi:** S0'ın 5 saniye iş akışı.

---

## E · Cihazda doğrulama bekliyor

### E1. Y1 TestFlight'a çıkmadı; 14 maddelik cihaz listesi (S2 kapısı) bekliyor
- **Kanıt:**
  - Rapor durumu açıkça yazıyor: "`[~]` … Cihazda denenmedi" (`Y1_KOD_RAPORU.md:7`); cihaz listesi `:134-152`.
  - Son TestFlight Build 59 (`26419b4`, `YAPILACAKLAR.md:131`) ve Y1'den öncedir.
  - `HATA_GUNLUGU.md`'de Y1 kaydı yok (grep "Y1" boş).
- **Önerilen adım:** Önce B1, A3, A4 ve C4 bitsin. Sonra TestFlight çıkılsın, cihazda 1., 2., 4. ve 9. günlere ve eski
  hesaba bakılsın, bulgular `HATA_GUNLUGU`'na yazılsın.
- **Kimin işi:** orkestratör (derleme ve Mac), sahip (cihaz).

### E2. Yolun önceki adımları (a) ve (b) hâlâ cihazda doğrulanmadı
- **Kanıt:** `YAPILACAKLAR.md:80` (a) "Build 59'da; cihazda doğrulanıyor". `:178` (b) "CİHAZDA DENENMEDİ". Y1 bu iki
  adımın üstüne kuruldu (onaylı sıra `:77-79`).
- **Önerilen adım:** Y1'in cihaz turuyla aynı oturumda (a) ve (b) listeleri de kapatılsın.
- **Kimin işi:** sahip (cihaz).
