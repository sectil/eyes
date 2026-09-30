# Yoga ilk bölüm · 5 saniye yeniden tasarımı · Uygulama raporu (2026-09-30)

Kapsam: `app/src/modules/yoga/*` (yalnız Ders 2 · 15 dk yayımlı). Beş değerlendiricinin üç yön maketine (A "sakin güven",
B "ders bir yer", C "ölçüm ve ilerleme") verdiği ekran ekran seçimler, çoğunluğun yönü ve aşı önerileriyle koda geçirildi.
Yoga dışındaki hiçbir dosyaya dokunulmadı (Home.jsx, TodayPath.jsx, today.js, breath, styles.css, lib/* aynı). Git
kullanılmadı. Yeni npm bağımlılığı yok.

## 1. Sonuç

- Bütün takım (`npx vitest run`, app/): **138 dosya, 1870 test, hepsi geçti.** Başlangıç: 138 dosya, 1863 test.
  - Yeni 7 test. `Yoga.test.jsx`'te dört: güvenlik kartının açılır satırları ve Geri; önce atlanınca satır yok; ölçeğin
    klavye ve VoiceOver davranışı; oynatıcının karşılama cümlesi. `timeline.test.js`'te üç: iki yeni işlev ve önbellek.
  - Var olan testlere eklenen beklentiler: "1 ders" yok, "Derse git", "Nefona Hoca".
  - Ara koşulardan birinde, yükün en ağır olduğu anda (99 sn) bir test düştü ve kaydı alınamadı. Sonraki dört tam
    koşu ve üç yoga + lib koşusu temiz geçti. Zamana bağlı bir testin yük altındaki oynaması olabilir; izlenmeli.
- `npm run build`: geçti ("built in 2.75s"). Tek uyarı, bugün de var olan 500 kB'lık parça uyarısı. CSS uyarısı yok.
- Gerçek ekranlar (`cek.sh`, Playwright Chromium, uygulamanın kendi bileşenleri): 11 an × 2 genişlik × 2 tema = 44 PNG.
  Anlar: 1 (Ana sayfa, kapsam dışı), 2, 3, 4, 5, 6, 6b, 7, 7b, 7c (zorlanma), 8.
  - Yer: `/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga-uygula/shots/`
    (INDEX.md ve son-calisma.json yanında).
  - Önceki turun çekimleri `scratchpad/yoga-5sn/shots/` altında olduğu gibi duruyor.
  - Ölçüm, 390 ve 320 genişlikte, açık ve koyu temada, yoga ekranlarının hepsi için temiz:
    - yatay taşma yok;
    - görünüm dışına taşan öğe yok;
    - kırpılmış metin yok;
    - üst üste binen öğe yok;
    - alt kenarda kesilen öğe yok;
    - konsol hatası yok.
  - Açık temada koyu çıkan tek ekran oynatıcı (6 ve 6b), plan gereği. Sonra puanı ve zorlanma sorusu artık açık temada
    açık çıkıyor (ortalama parlaklık 234 ve 241; eskiden koyuydu).
  - Yazılan kayıt dört birleşimde de doğru: önce 7, sonra 4, zorlanma "Hayır", tamamlandı.

## 2. Çoğunluk sayımı ve uygulanan yön

| Ekran | A | B | C | Hiçbiri | Uygulanan |
|---|---|---|---|---|---|
| 4 Güvenlik kartı | 2, 3, 5 | 4 | — | 1 | **A** (3/5) |
| 2 Kütüphane | 3 | 2, 4, 5 | 1 | — | **B** (3/5) |
| 3 Ders 2 ayrıntısı | — | 1–5 | — | — | **B** (5/5) |
| 5 Önce puanı | 1–5 | — | — | — | **A** (5/5) |
| 6 Oynatıcı 2:47 | 2, 3, 5 | 4 | — | 1 | **A** (3/5) |
| 6b Oynatıcı ilk 5 sn | — | 2 | 3, 4 | 1, 5 | Çoğunluk yok. Aşıların beşi aynı yöne gidiyor: **A'nın düzeni + C'nin "Karşılama / Hoş geldin." ikilisi** |
| 7 Sonra puanı | — | 1–5 | — | — | **B** (5/5) |
| 7b Sonra, seçimden sonra | 1, 3, 4, 5 | 2 | — | — | **A** (4/5). 7 ile aynı ekranın ikinci hâli: B'nin göğü üstte, A'nın ölçeği ve başparmağı |
| 8 Bitiş | 1–5 | — | — | — | **A** (5/5) |

Numaralar değerlendiricinin sırası (görevdeki JSON'un sırası). Ana sayfa (1) kapsam dışı: başka iş akışının dosyaları.

## 3. Ekran ekran: ne yapıldı, hangi aşı alındı

### 4 · Güvenlik kartı "Başlamadan önce" (A)

Beş madde açılır satır (`details/summary`). Özette yalnız ana cümle var, beşi de ilk bakışta görünür. Gövdeler aynen
satırın içinde; VoiceOver satırın açık ya da kapalı olduğunu okur. Hiçbir madde gizlenmedi, metin değişmedi.

Alınan aşılar:
- **Sağlık maddesi ve "tedavi değildir · 112" aynı ayrı kartta** (değerlendirici 3 ve 5; 1 de söyledi). Acil numarası
  artık sahipsiz kalmıyor. A'daki "uyarı ile Anladım arasındaki ölü boşluk" da bu kartla doldu.
- **Başlığın altında tek satır: "Dersi yarıda bırakmak da pratiğin bir parçası."** (değerlendirici 2).
  - Cümle ilk maddenin gövdesinden aynen alındı; koddaki `SAFETY_LEAD` onu metinden türetir.
  - Kısa ekranda (≤ 700 px) bu satır gizlenir: beş başlık ve 112 notu sığsın. Cümle ilk maddenin içinde yine duruyor.
- **Bütün maddeler kapalı gelir** (değerlendirici 1, 2, 3, 5).
  - Değerlendirici 4, B'nin ilk maddeyi açık getirmesini istemişti. Çoğunluk tersini söyledi.
  - Uzlaşma: o maddenin en değerli cümlesi başlığın altındaki satırda.
- A'nın ferahlığı ve başlıkla liste arasındaki nefes payı (değerlendirici 4). Sol üstte Geri düğmesi (`YT.back`).
  - İlk girişte Geri, Ana sayfaya döner; kart bir sonraki girişte yeniden çıkar.
  - (i) ile açıldıysa Geri, ayrıntıya döner.
- A'nın kusurları giderildi. "İstediğin an / dersi bitirebilirsin" 390 px'te tek satır. Başlık tek satır.
- "Nefona" uygulamanın başlık yazı tipinde (ad olduğu belli olsun). Metin aynı.

### 2 · Kütüphane "Yoga ve Meditasyon" (B)

Kart beyaz; dersin yeri kartın içinde çerçeveli bir pencerede. Altında süre ve duruş, tam ad, söz, derine inip geri çıkan
bölüm yolu ve kartın altında yazılı eylem "Derse git →". Kartın tamamı tek düğme.

- **Çerçeveli pencere** (değerlendirici 2): açık temada soluk gök arka plana karışmasın. Pencere kenarı dersin renginde.
- **Güneş ufukta ve görünür** (değerlendirici 3; 1'in "güneş neredeyse görünmüyor" notu): yarı doğmuş disk ve ışık.
- **Adlar noktaya yaslı** (değerlendirici 4). Nokta ile harf arasında 12 px (değerlendirici 5: "nokta harfe değiyor").
  - Derinlik bölümün sırasından (yarım sinüs): ilk ve son bölüm yüzeyde, dolu nokta.
  - Eğri SVG'de, noktalar CSS'te. Her derste aynı biçim; zaman çizelgesi beklenmez.
- **"1 ders" satırı eklenmedi.** Değerlendirici 5 istedi. 1, 2 ve 4 "boş raf hissi, kaldırılmalı" dedi.
- Birden çok ders varken eski karanlık poster kartı kullanılır (değişmedi).

### 3 · Ders 2 ayrıntısı (B)

Sayfanın üstünde kenardan kenara dersin yeri: kıyıya varış, güneş yarı doğmuş. Geri ve (i) bu göğün üstünde. Sırasıyla:
- üst satır: "☀ 15 dk · Uzanarak · 〰 Nefona Hoca";
- ad ve söz;
- hazırlık üç karoda, simgeyle (örtü, yastık, yüzey);
- açılış satırları tek sakin kartta, "Başla"nın hemen üstünde;
- "Başla";
- bölüm şeridi;
- Kaynaklar (19).

Alınan aşılar:
- **Süreyle orantılı bölüm şeridi ve adları, "Başla"nın hemen altında açık** (C'den; değerlendirici 1, 2, 4, 5).
  - Parçaların boyu `ders2-15.timeline.json`'dan gelir (`sectionSpans`); çizelge okunana kadar eşit bölünür.
  - Adlar " · " ile şeridin altında. Metin ve sıra değişmedi.
- **Gök daha kısa, "Başla" daha yukarıda** (değerlendirici 3). "Başla"nın ortası 390×844'te 746 px'te; şeridin başı
  ilk görünümde.
  - 320×640'ta hazırlık "Başla"nın altına iner. Açılış satırları yine "Başla"nın hemen üstünde.
- Değerlendirici 1'in kusur notları giderildi:
  - Karolar eşit. Sütun, en uzun sözcükten dar olmaz; 390'da üçüncü karo birkaç piksel geniş.
  - Yastık simgesi yeniden çizildi.
  - "İnce bir / örtü" kırılması yok: son iki sözcük bölünmez boşlukla birlikte kırılır.
- Açılış satırları:
  - İzin satırı davet gibi: `ink`, 16 px, 600 kalınlık, dersin renginde kapı simgesi.
  - Araç ve kalkış satırları ikincil ama okunur: 15 px, `ink-2`; eskiden 13,4 px ve `ink-3`.
  - Satırlar aynen, katlanmaz.
- Üst satırdaki yazı sayfa zemininde olduğu için `ink-2`. Ders rengi yalnız simgelerde; açık temada ders rengi yazı
  yalnız beyaz kartta kuralı korunur.

### 5 · Önce puanı (A)

Dersin yolu "● Önce — Derin Dinlenme — ○ Sonra", iri soru, altında "Ders bitince aynı soruyu yeniden soracağız.", ufuk
ölçeği, altta yalnız "Atla".

- **Ölçek = ufuk:** 1–10 tek çizgide.
  - Tek ayarlanabilir öğe (`role="slider"`; VoiceOver'da yukarı/aşağı kaydır, klavyede oklar, Home/End).
  - Dokunma alanı çizginin tamamı: kenardan kenara, 64 px yükseklik. Sürüklenebilir.
  - Seçim yapılana kadar başparmak ve değer yok. Seçim yokken "artır" 1'den, "azalt" 10'dan başlar; ortadaki bir sayı
    öne çıkmaz.
  - Seçim parmak kalkınca olur. Dikey kaydırmaya başlayan dokunuş seçim yapmaz.
  - Neden sürgü: 10 ayrı 44 px düğme 320 px'te tek sıraya sığmıyor (OZET.md §5 seçenek b).
- **Göğün katmanı** (B'den; değerlendirici 1). Ekranın üstü güneşi henüz doğmamış bir sabah göğü; ufuk ölçeğin çizgisi.
  - Altında kısa bir deniz geçişi.
  - Bulut şeridi yok: B'deki şeritler üç değerlendiriciye "render hatası" gibi gelmişti.
- **Duraklar 1'den 10'a hafifçe büyür ve koyulaşır** (14 → 22 px; değerlendirici 2, 4, 5). "Daha çok" yazısız okunur.
- Soru ve ölçek başparmağa yakın, üstteki gök boşluğu dolduruyor.
- **Pasif "Devam" gösterilmedi.** Değerlendirici 3 istedi; 1 ve 4, A'da "gürültü yok, baskı yok" diye övdü.
  - "Devam"ın yeri baştan ayrılmış; düğme görünmez ve pasif.
  - Seçimle aynı yerde görünür; ölçek kaymaz.

### 6 · Oynatıcı (A) ve 6b · ilk 5 saniye

Hep karanlık (#050A12); nefes formu, parlaklık tavanı ve motor davranışı değişmedi. Yerleşim:
- Üstte X ve dersin adı; Altyazı üst sağda, sakin çerçeveli.
- Altta, ortada bölüm adı ince çizgiler arasında ("— Beden dolaşımı —") ve hemen altında söylenen cümle.
- Bölüm şeridi 6 px; altında solda "12:13 kaldı", sağda "Kapanışa geç".
- En altta tek büyük Duraklat (72 px).
- Denetimler 5 sn sonra kaybolur. Bölüm adı ve altyazı kalır.

Alınan aşılar:
- **Şeritte kapanışın yerinde gün doğumu işareti; "Kapanışa geç" aynı simgeyi taşır** (değerlendirici 1, 5; 4 de övdü).
  - Uyku dersinde işaret ay simgesidir.
  - Değerlendirici 3'ün "çubuğun sonuna 'Kapanış' yazmak" isteği yazıyla değil bu işaretle karşılandı. Düğme çubuğun
    ucunun altında.
- **Karşılama cümlesi altyazı kapalıyken de yazılır** (değerlendirici 1, 3, 5; C'nin ortalanmış "Karşılama / Hoş
  geldin." ikilisi).
  - Yalnız dersin ilk klibi: "Hoş geldin." · "Bu dakikalar senin." (`welcomeCaption`).
  - Altyazı ayarı değişmedi, varsayılan kapalı. Ekrandaki cümle söylenen cümledir (timeline `screen_text`).
- **Altyazı düğmesi sakin** (değerlendirici 4, 5: A'daki parlak çerçeve gözü çekiyordu). Açıkken yalnız hafif ders rengi.
- **Duraklat simgesi dolu** (değerlendirici 1: "içi boş iki dikdörtgen ucuz"). Sürdür de dolu.
- "12:13 kaldı" biraz daha okunur (15,7 px, %68 opaklık) ama ikincil (değerlendirici 3).
- **Alınmayan:** B'nin altyazının üstündeki soluk önceki satırı (değerlendirici 2 istedi, 4 övdü).
  - A'yı seçen iki değerlendirici (3 ve 5) "okunmuyor, gürültü" dedi.
  - Önceki cümle ("Rahatsız eden bir bölge olursa atla.") "her adı" cümlesine bağlam da vermiyor. Bağlamı bölüm adı
    veriyor.

### 7 · Sonra puanı (B) ve 7b · seçimden sonra (A)

Üstte kenardan kenara şafak: güneş ufuktan doğmuş, sıcak. Altında dersin yolu "✓ Önce — ✓ Derin Dinlenme — ● Sonra",
aynı soru, "Aynı soru, şimdi dersten sonra.", önce puanıyla birebir aynı ölçek.

- **"Aynı soru, şimdi dersten sonra."** (C'den; değerlendirici 2, 4, 5).
- **Sıcak şeftali-altın şafak** (A'dan; değerlendirici 1: "soğuk beyaz güneş kış öğlenine benziyor").
  - Açık tema: tepede sabah mavisi, ufukta şeftali; sıcak ışık mavinin üstünde griye dönmesin diye.
  - Koyu tema: gök lacivert kalır, kehribar ışık ufukta toplanır.
- **A'nın iri yuvarlak durakları** (değerlendirici 3): ölçek iki ekranda aynı, bu ölçümün geçerliği için de gerekli.
- **7b:** seçilen sayı 48 px'lik parlayan başparmağın içinde (A; değerlendirici 2). Işık o noktada toplanır.
  - Altta, ortada "Dersten önce: 7".
  - **Ölçekte 7'nin çevresinde içi boş halka** (değerlendirici 1, 2; 3 ve 5 de "7'nin yeri işaretli değil" dedi). Yalnız
    seçimden sonra (bkz. §4).
  - Aynı puan seçilirse halka başparmağın çevresinde, büyük çizilir.
- **Tema:** ekran artık iki temada; eskiden temadan bağımsız karanlıktı (§5). Oynatıcının karanlığından temaya ~1,4 sn'de
  açılır. Hareketi Azalt'ta hemen açılır.

### 8 · Bitiş (A)

Üstte sıcak şafak (akıştaki ilk sıcak renk). "Derin Dinlenme", iri "Ders bitti". Altında tek bir kayıt kartı, kalkış
satırı, "Bu dersi neden böyle kurduk (19)" ve "Tamam".

- **Tek kayıt kartı** (değerlendirici 2): üst satırda "15 dk" ve "✓ Kapanış", altında dolu bölüm şeridi, altında sonuç.
  - VoiceOver "15 dk · Kapanış" okur (plan: dinlenen dakika ve ulaşılan bölüm).
  - C'deki iri "15 dk" alınmadı: değerlendirici 3 ve 5 "iki büyük sayı yarışıyor" dedi. Dakika küçük.
  - A'daki anlamsız "Karşılama" etiketi kalktı (değerlendirici 5).
- **7 ——→ 4:** iki sayı kartın iki ucunda, aralarında uzun ok, "Sonra" dersin renginde (C'den; değerlendirici 1, 3, 5).
  7 sönük, 4 net. VoiceOver aynen "Beden gerginliği 7 → 4" okur.
- **Kalkış satırı çerçeveli bir notta** (değerlendirici 4): "Uzanarak yaptığın derslerden sonra önce yana dön, otur,
  sonra kalk." Metin onaylı; açılış satırından aynen.
- Kutlama sözü, "işe yaradı" gibi bir cümle yok (PLAN.v3 §D.5). Sıcaklık yalnız şafaktan ve kişinin kendi sayısından.

### Zorlanma sorusu (çekimde 7c)

Görünüm değişmedi, yalnız temaya alındı. Sonra puanından geliyorsa zaten temada. Durdurma ekranından geliyorsa temaya
yavaşça açılır. Bu ekran 5 saniye sınamasının dışındaydı.

## 4. Ölçme sorusu: önceki puan ne zaman görünür (OZET.md §10'un önerisi uygulandı)

**Karar:** Sonra puanında önceki puan, kişi bir seçim yapana kadar ekranda hiçbir biçimde yok. İlk dokunuştan sonra iki şey
çıkar:
- ölçeğin altında tek satır: "Dersten önce: **7**";
- ölçekte 7'nin çevresinde içi boş bir halka.

Ayrıntılar:
- Satır `aria-live="polite"` ile okunur ve animasyonsuz belirir. Satırın yeri baştan ayrılmıştır, ekran kaymaz.
- Kişi seçimini değiştirebilir. "Devam" seçimle görünür.
- Önce puanı "Atla" ile geçildiyse satır da halka da hiç çıkmaz.
- Karşılaştırmanın asıl yeri bitiş ekranıdır ("Beden gerginliği 7 → 4"). Kayıt şeması değişmedi (`before`, `after`).

**Gerekçe:**
1. **Önceki cevabı göstermenin yararı uzun aralıklarda.** Scott & Huskisson 1979 (PMID 317238) ile Guyatt 1985
   (PMID 4066888) ve 1989 (PMID 2778469) haftalar ya da aylar arayla ölçüyor. Kişi önceki cevabını hatırlamadığı için
   gösterim ona bilgi veriyor. Bizde ara 15 dakika: kişi 7'yi zaten biliyor, gösterimin bilgi katkısı küçük.
2. **Yargı anında göz önündeki sayı yargıyı kaydırabilir.** Lewinson & Katz 2020 (PMID 32149719): randomize, n = 385;
   ilgisiz bir sayı bile ağrı puanını kaydırdı. Sınırı: gözlemci yargısı, kişinin kendi bedeni değil. Seçenekler
   arasında duran bir "7", sayısal çıpayı ve "daha iyi görünme" isteğini (talep etkisi) kolaylaştırabilir. Üçüncü turda
   bir değerlendirici tam bunu yazdı: "çıpalama, 7→4'e güvenim düştü".
3. **Önce → sonra farkı zaten özgül etki değil.** Sparacio 2025 (PMID 40828581): sahte grupta da aynı düşüş. Bu yüzden
   ikinci ölçümün kişinin o anki hissine olabildiğince temiz kalması önemli.
4. **Seçimden sonra göstermek, değerlendiricilerin isteğini de karşılıyor.** 1. ve 2. turda istek "önceki puanım
   hatırlatılmıyor" idi; 7b'de beş değerlendiricinin dördü "7'nin yeri ölçekte görünsün" dedi. Gösterim yargıdan
   sonra gelir. Ölçeği ters kullanan kişi ("10 = rahat" sanmak) kendi referansını görünce bunu fark edebilir.
5. **Metin:** "Dersten önce: 7" seçildi, "Başta 7" değil. "Başta" tek başına "özellikle" diye de okunabiliyor.

**Sınır (dürüst):** Aynı oturumda, dakikalar arayla önceki puanı görmenin ikinci puana etkisini doğrudan sınayan bir
çalışma bulunamadı. Bu bir tasarım çıkarımıdır, kanıtlanmış bir üstünlük değildir. Bir kalıntı risk de var: kişi 7'yi
seçimden sonra görüp cevabını değiştirebilir. Bunu ölçmek yeni bir kayıt alanı ister (ör. "gösterimden sonra
değiştirdi"). Ayrı bir karardır, yapılmadı.

## 5. Tema kararı

Sonra puanı ve zorlanma sorusu artık iki temada. `Night` bileşeni ve `.yg-night` jetonları kalktı.

- Neden: modul.md §2 ve PLAN.v3 G3 yalnız oynatıcıyı istisna sayıyor. Görev kuralı da "öteki yoga ekranları iki
  temada" diyor. OZET.md §9 bu çelişkiyi bulmuştu.
- "Gözünü yeni açana ani ışık" kaygısı: ekran oynatıcının karanlığında açılır, ~1,4 sn'de temaya döner
  (`.yg-dawn-in`). Hareketi Azalt açıkken perde hiç yoktur.
- Durdurma ekranı (X) oynatıcının parçası sayıldı ve karanlık kaldı (OZET.md §9'daki açık soru). Sahibe sorulmalı.

## 6. Onay bekleyenler

**Türkçe editör. Yeni metinler (hepsi `text.js`'te işaretli; `text.test.js`'in sağlık iddiası süzgecinden geçti):**
1. "Derse git" (`YT.library.open`): kütüphane kartının eylemi. "Başla" değil, çünkü ses bu dokunuşta başlamaz.
2. "Ders bitince aynı soruyu yeniden soracağız." (`YT.rate.why`).
3. "Aynı soru, şimdi dersten sonra." (`YT.rate.again`).
4. "Dersten önce:" ve ardından sayı (`YT.rate.was`).
5. "Nefona Hoca" (`YT.voices.hoc`): ayrıntıda dersin sesinin adı, çizelgedeki `voice_name` ile aynı. **Sahip de onaylamalı.**
   - Ses kişi gibi sunulmuyor: yüz ya da fotoğraf yok, yalnız ses dalgası simgesi.
   - Değerlendirici 4: "kimin sesi olduğu belirsiz kalırsa 'Hoca' iddialı kaçabilir".

**Türkçe editör. Yerleşim kararları (metin aynı):**
- Güvenlik kartında başlığın altında ilk maddenin son cümlesinin yinelenmesi.
- Bitişte kalkış satırının çerçeveli notta yeniden kullanılması.
- Bitişte ulaşılan bölümün "✓ Kapanış" ve dolu şeritle gösterilmesi.
- Oynatıcıda altyazı kapalıyken karşılama klibinin yazılması.

**Klinik gözden geçirme:** Güvenlik kartında gövdeler varsayılan olarak kapalı. Buna sağlık maddesinin gövdesi de
dahil (gebelik, epilepsi, psikoz…). Ana cümleler hep görünür; görev kuralı buna izin veriyor. Karar klinikte.

**Sahip:**
- Tek ders yayımlıyken "başka ders var mı?" sorusu. Değişmedi; plan yalnız yayımlı dersi gösteriyor.
- Güvenlik kartının yeri: PLAN.v3 §D.2 "ayrıntıdan sonra" diyor, modul.md §2.2 ve kod "ilk girişte". Kod değişmedi.
- Durdurma ekranının teması (§5).

## 7. Değişen dosyalar (yalnız `app/src/modules/yoga/`)

- `Yoga.jsx`: güvenlik kartı, kütüphane, ayrıntı, önce ve sonra puanı, zorlanma, bitiş yeniden kuruldu.
  - Akış, kayıt, ses ve güvenlik mantığı değişmedi.
  - `Night`, eski `Rate` (10 radyo) ve `DeltaTrack` kalktı.
  - Yeni: `LessonScene`, `SafetyItem`, `SAFETY_LEAD`.
- `YogaParts.jsx` (**yeni**): ortak parçalar.
  - `Scene`: dersin yeri; anları far, shore, before, dawn, done.
  - `HorizonScale`: ufuk ölçeği, `role="slider"`.
  - `LessonPath`: dersin yolu.
  - `DiveList`: derine inen bölüm yolu.
  - `SectionStrip`: orantılı şerit.
  - `useTimeline`, hazırlık simgeleri (`PrepIcon`, `prepKind`), `glueLast`.
- `YogaPlayer.jsx`: yerleşim (§3-6). Motor, konum, sarma, kapanış koruması ve kayıt mantığı değişmedi.
- `timeline.js`: `welcomeCaption`, `sectionSpans`, `loadTimelineCached` ve `cachedTimeline` eklendi (aynı dosya bir kez
  okunur).
- `text.js`: beş yeni metin (§6).
- `yoga.css`: yeniden yazıldı.
  - Sahne jetonları iki temada; oynatıcı stilleri korundu.
  - Kısa ekran (≤ 700 px) ve dar ekran (≤ 360 px) kuralları.
  - Hareketi Azalt: ışık kayması, perde ve başparmak geçişi kapalı.
- `Yoga.test.jsx`, `timeline.test.js`: §8.

Değişmeyen: `LessonArt.jsx` (öteki derslerin imgesi için), `BreathForm.jsx`, `bridge.js`, `session.js`, `journal.js`,
`manifest.js`, `view.jsx`, `opts.js`. Yedek (değişiklikten önceki hâl):
`scratchpad/yoga-uygula/once/`.

## 8. Değişen test beklentileri ve gerekçeleri (yalnız yoga testleri)

- **`r.tap('6')` → `r.rate(6)`**, beş yerde. Ölçek artık 10 radyo düğmesi değil, tek ayarlanabilir öğe (§3-5). Puanlar
  eskisi gibi 1–10 tam sayı.
  - Yeni yardımcılar: `slider`, `rate` (durağa dokunur), `key` (klavye ve VoiceOver), `cls`.
- **Ayrıntı:** "İnce bir örtü · Dizlerinin altı için bir yastık · Uzanabileceğin rahat bir yüzey" tek satır beklentisi →
  üç madde ayrı ayrı. Hazırlık artık üç karoda. Metin aynı; son iki sözcük arasında bölünmez boşluk var.
  - "Nefona Hoca" beklentisi eklendi.
- **"Sonra puanı ve zorlanma sorusu karanlıkta" → "temada"** (plan G3; §5).
- **"6 Önce" radyo adı (önceki puan seçeneklerin arasında) → seçimden önce hiçbir iz yok; seçimden sonra satır ve
  halka** (§4).
- **"Sonra · Derin Dinlenme" üst yazısı → dersin yolunda `aria-current="step"` olan "Sonra".**
- **Değişmeden geçenler:**
  - güvenlik metinleri harfi harfine ve sırası;
  - "Nefona tedavi değildir … Acil durumda 112.";
  - önce puanında "Devam" pasif;
  - "14 dk · Kapanış";
  - "Beden gerginliği 6 → 3";
  - kayıt alanları, "Çok" metinleri, oynatıcı, sarma ve kapanış koruması.
- **Yeni testler:** §1'deki yedi test.

## 9. Kurallar denetimi

- **Sağlık iddiası:** yok. Yeni metinler süzgeçten geçti. Bitişte kutlama ya da etki cümlesi yok.
- **Ekrandaki cümle = söylenen cümle:** altyazı ve karşılama cümlesi çizelgenin `screen_text`'inden aynen. Onaylı
  metinlerin hiçbiri kısaltılmadı ya da değiştirilmedi.
- **Güvenlik kartı:**
  - Beş maddenin ana cümlesi hep görünür; gövdeler aynen, açılır satırda.
  - "Tedavi değildir · 112" sağlık maddesiyle aynı kartta.
  - Açılış satırları "Başla"nın hemen üstünde, katlanmaz.
- **320 px:** iki temada bütün yoga ekranlarında yatay taşma yok (otomatik ölçüm, §1).
  - Kısa ekranda "Başla", "Derse git", "Anladım" ve "Tamam" ilk görünümde.
- **Dokunma alanı ≥ 44 px:**
  - ölçek: tam genişlik, 64 px;
  - güvenlik satırları: 64 px, kısa ekranda 54 px;
  - X, Altyazı, Kapanışa geç: 44 px;
  - Duraklat: 72 px;
  - Atla: 48 px.
- **Hareketi Azalt:** tek sürekli hareket ışığın 12 sn'lik opaklık kayması; Hareketi Azalt'ta kapalı. Temaya açılma
  perdesi ve başparmak geçişi de kapalı. Yanıp sönme yok.
- **Tasarım dili:** uygulamanın jetonları (`--bg`, `--surface`, `--ink*`, `--border`, `--shadow*`, `--radius`), `.btn`,
  `.btn-icon`, `.screen`, Unbounded ve Onest. Ders rengi `--yg-c` / `--yg-cl`. Turkuaz yalnız odak halkasında.

## 10. Düzenek (`scratchpad/yoga-5sn/duzenek/cek.mjs`) değişiklikleri

Uygulama dışında; yeni yerleşim için zorunlu olanlar ve üç ek an:
- Puan seçimi `.yg-rate button` yerine `.yg-hz-stop[data-v="7"]` (ölçeğin durağına dokunma).
- "Sonra" beklemesi `.yg-rating.is-after`. Bölüm ölçümü `.yg-sec-name`.
- Ek çekimler:
  - **6b:** oynatıcı 0:05, altyazı varsayılan kapalı.
  - **7b:** sonra puanında 4 seçildikten sonra.
  - **7c:** zorlanma sorusu.
- Önceki hâlin yedeği: `scratchpad/yoga-uygula/cek.mjs.once`.
- Tek komut: `CIKTI=<klasör> bash scratchpad/yoga-5sn/duzenek/cek.sh`. CIKTI verilmezse `yoga-5sn/shots/` üzerine yazar.

## 11. Kendi bakışım ve sınırlar

- Gerçek ekranlara iki genişlik ve iki temada tek tek baktım. Akış artık tek bir hikâye anlatıyor: aynı kıyı, günün
  başka bir anı. Kütüphanede güneş ufukta, ayrıntıda yarı doğmuş; önce puanında güneş doğmamış ve ölçek ufkun kendisi;
  oynatıcıda gece; sonra puanında sıcak şafak; bitişte sabah ve 7 ——→ 4. Önce ile sonra ekranı bir bakışta ayrılıyor;
  güvenlik kartı bir metin duvarı değil, beş kısa satır.
- **Bu bakış bir 5 saniye sınaması değildir.** Sahibin kuralı gereği bu ekranlar, birbirini görmeyen en az üç
  değerlendiriciye gerçek akış sırasıyla gösterilmeden (4 → 2 → 3 → 5 → 6b → 6 → 7 → 7b → 8) sahibe gitmemeli.
  Değerlendirici talimatına "Uygulamanın adı Nefona" satırı eklenmeli (OZET.md §12-3).
- Cihazda doğrulanmadı `[~]`:
  - VoiceOver'ın `role="slider"` üstünde yukarı/aşağı kaydırması; WebKit bunu ok tuşu olayına çeviriyor, bileşen
    okları dinliyor.
  - Açılır satırların okunuşu.
  - `color-mix` ve `text-wrap` görünümü iOS Safari'de. `color-mix` modülde zaten kullanılıyordu.
- Zorlanma sorusu ve durdurma ekranı 5 saniye sınamasının dışındaydı; görünümleri yalnız temaya uyarlandı.

## 12. Kapı turu 1: kök neden ve düzeltme (2026-09-30, 12:25)

Kapı turu 1'de beş değerlendiricinin üçü beş ekranda etkilenmedi: 2 kütüphane, 3 ayrıntı, 4 güvenlik, 5 önce puanı,
7 sonra puanı. Notlar iki ayrı nedene dayanıyordu.

### 12.1 Kök neden 1: değerlendiriciler eski çekimlere baktı

- **Kanıt.** Notların anlattığı öğeler §1–§11'deki kodda yok, `scratchpad/yoga-5sn/shots/`'taki 10:01 çekimlerinde var:
  - 2×5 dizilmiş ölçek ("PIN ekranı", "hiç sol üstte, çok sağ altta");
  - pasif gri "Devam" bloğu;
  - kütüphanede yazısız, beyaz halkalı yuvarlak ok düğmesi;
  - gövdeleri açık, yaklaşık 130 kelimelik güvenlik kartı;
  - temadan bağımsız karanlık sonra puanı ve kesik çizgili "7 · Önce" halkası.
- **Nasıl oldu.** Uygulama turu yeni çekimi `CIKTI` ile `yoga-uygula/shots/`'a yazdı. `cek.sh`'in varsayılan klasörü
  (`yoga-5sn/shots/`) 10:01'de kaldı ve kapı onu gösterdi.
- **Düzeltme:**
  - Varsayılan klasör yeniden çekildi: 44 PNG, 12:25.
  - Eski 33 dosya ve eski elle notlar yedeklendi: `scratchpad/yoga-kapi1/shots-10-01/`.
  - `cek.mjs` artık INDEX.md'nin başına bir **Kod** satırı yazıyor. Satırda yoga modülünün sha256'sı (testler hariç
    14 dosya) ve en yeni dosyanın saati var. Aynı bilgi `son-calisma.json`'daki her birleşimde de `code` alanında.
    - Bu çekimin kodu: `f084ba278e06e59f`.
    - Denetim: `cd app/src/modules/yoga && cat $(ls | grep -E '\.(jsx?|css)$' | grep -v '\.test\.' | sort) | sha256sum`.
  - Kod bu değerden sonra değiştiyse görüntüler eskidir; değerlendiriciye gösterilmemeli.
  - INDEX.md'deki eski elle notlar (önceki tasarımın kusurları) kaldırıldı, yerine kısa bir güncel not kondu.

### 12.2 Kök neden 2: akış aynı içeriği art arda gösteriyordu

Notların bir kısmı şimdiki kodda da geçerliydi. Hepsinin ortak nedeni, ekranların işini birbirine yüklemesiydi:
- (a) Güvenlik kartı Yoga'ya ilk dokunuşta, dersin hiçbir şeyi görünmeden çıkıyordu. Değerlendirici 1, 2 ve 5: "ilk
  gördüğüm şey bir uyarı", "en çok burada çıkıp giderim".
- (b) İki ekran sonra ayrıntıdaki açılış satırları kartın maddelerini yineliyordu (beş değerlendiricinin dördü).
- (c) Kütüphane kartında 7 maddelik bölüm listesi vardı: kart ayrıntının kopyası gibi okunuyordu ve bölümler üç kez
  görünüyordu (üç değerlendirici).
- (d) Ayrıntıdaki (i) düğmesinin adı yazmıyordu (bir değerlendirici).
- (e) "15 dk · Uzanarak"ın yanındaki güneş simgesi bir şey anlatmıyordu (bir değerlendirici).
- (f) Önce puanında ekranın üstü boştu (iki değerlendirici).

Yapılanlar (metin değişmedi; yeni metin yok):
1. **Güvenlik kartı ilk derste "Başla"ya dokununca çıkıyor** (PLAN.v3 §D.2'nin akışı: "ders ayrıntısı → (ilk kez:
   güvenlik kartı ve 10 sn'lik ses denetimi) → önce puanı").
   - Yoga'ya ilk dokunuşta kütüphane açılır. Kart bir kez çıkar ve ders ondan önce başlamaz.
   - "Anladım" aynı dokunuş zincirini sürdürür: ses denetimi (dosyası varsa) ya da önce puanı. Puanı olmayan derste ses
     bu dokunuşta başlar.
   - Kartta "Geri" ayrıntıya döner. Kart onaylanmadıysa bir sonraki "Başla"da yeniden çıkar.
   - Yoldan açılan ders (`yoga-2`) de aynı: önce ayrıntı, kart "Başla"da.
   - Böylece (a) ve (b) birlikte çözüldü: açılış satırları artık kartın tekrarı değil, önünde duruyor. Satırlar
     ayrıntıda aynen ve "Başla"nın hemen üstünde (modul.md §2.4-12; §10.1 "her ders ekranında").
2. **Kütüphane kartı dersin vitrini.**
   - Bölüm listesi kalktı; bölümler yalnız ayrıntıda (şerit ve adlar).
   - Dersin yeri büyük pencerede ve ekranı dolduruyor: güneş ve ışık büyüdü. Kartın altı artık boş kalmıyor.
   - Üst satır "☀ Gündüz · 15 dk · Uzanarak". "Gündüz" süzgeç çipinin ve simgenin VoiceOver adının aynısı; yeni söz değil.
   - Kullanılmayan `DiveList` ve CSS'i silindi.
3. **Ayrıntıdaki (i) artık "ⓘ Başlamadan önce".** Ad kartın başlığı; eskiden yalnız VoiceOver adıydı. Düğme 44 px.
   - Ayrıntının üst satırında "Gündüz" yazılmadı. Yazılınca 320 px'te ses adı "·" ile başlayan ikinci satıra düşüyordu.
     Ad VoiceOver'da okunuyor; simgenin anlamı kütüphane kartında yazılı.
4. **Önce puanında dersin yolu ve soru üstte, gök ortada, ufuk ölçeği altta.**
   - Göz önce soruyu okur; ölçek başparmağa yakın kalır.
   - Yolun çizgileri açık gökte görünür oldu.
   - Sonra puanı değişmedi.

### 12.3 Alınmayanlar

- **"Tek kart, raf hissi yok", "Yoga ve Meditasyon geniş bir vaat" (üç değerlendirici).** Yayımlı ders tek.
  - Yayımlanmamış dersleri "yakında" diye göstermek PLAN.v3 §D.1'e aykırı: bir ders ancak §E.7'deki dört koşulu geçince
    görünür.
  - Kart artık yarım bir liste değil, tek dersin vitrini. Sahip sorusu §6'da duruyor.
- **Başlık yazı tipi "çok geniş ve ağır" (bir değerlendirici).** Unbounded, uygulamanın başlık yazı tipi (styles.css
  `h1`); değişmedi.
- **"Sayıyı seçince Devam'a da basmak gerekiyor" (bir değerlendirici).** Değişmedi: sürgüde dokunuş seçimi
  değiştirebilir, ders sesi de iOS'ta bu dokunuşta başlar.
- **Önce puanında "Devam"ın yeri.** Seçimden önce boş kalıyor. Yeri baştan ayrılmış; seçim yapılınca ölçek kaymasın diye.

### 12.4 Sonuç

- **Testler:** `npx vitest run` → 138 dosya, **1871 test, hepsi geçti** (önce 1870).
  - Yeni bir test: yoldan açılan derste kart "Başla"da çıkıyor, "Geri" ayrıntıya dönüyor, kart yeniden çıkıyor.
  - Beklentisi değişen dört test:
    - güvenlik kartının yeri (girişte değil, ilk "Başla"da; ders kart onaylanmadan başlamıyor; "Anladım" önce puanına
      geçiyor);
    - kart testleri artık ayrıntıdan "Başla" ile açılıyor;
    - ilk kartta "Geri" Ana sayfaya değil, ayrıntıya dönüyor;
    - kütüphane kartında bölüm listesi yok, "Gündüz · 15 dk · Uzanarak" var.
  - Ayrıntı testine bir beklenti eklendi: "Başlamadan önce" düğmesinin adı yazılı.
  - Güvenlik metinleri harfi harfine ve sırası değişmeden sınanıyor.
- **Derleme:** `vite build` geçti. Çıktı scratchpad'e alındı, depoya yazılmadı. Tek uyarı, önceden de olan 500 kB uyarısı.
- **Çekim:** `bash scratchpad/yoga-5sn/duzenek/cek.sh` ile varsayılan klasöre, 44 PNG.
  - Yoga ekranlarının hiçbirinde yatay taşma, görünüm dışı öğe, kırpılmış metin, üst üste binme ya da alt kenarda
    kesilen öğe yok. Konsolda hata yok.
  - Kayıt dört birleşimde de doğru: ders 2, 900/900 sn, 7 → 4, "Hayır".
  - Açık temada koyu çıkan tek ekran oynatıcı (plan gereği).
- **Kendi bakışım** (390 ve 320, açık ve koyu):
  - Yoga'nın ilk ekranı artık dersin kendisi: büyük, sakin bir kıyı ve tek eylem.
  - Ayrıntıda neyin ne işe yaradığı yazılı. Kart dersi başlatan dokunuşta ve bir kez geliyor.
  - Önce puanında soru ilk bakışta okunuyor, ölçek ufukta.
  - **Bu bakış bir 5 saniye sınaması değildir.** Değerlendiriciye gerçek sırayla gösterilmeli: 2 → 3 → 4 → 5 → 6b → 6 →
    7 → 7b → 7c → 8. Bu sıra §11'deki "4 → 2 → 3 …" sırasının yerini alır.

### 12.5 Onay bekleyenler

- **Sahip: güvenlik kartının yeri.**
  - Kod artık PLAN.v3 §D.2'ye uyuyor; modul.md §2.2 ise "yoga bölümüne ilk girişte" diyor. modul.md buna göre
    düzeltilmeli.
  - Sahip girişte istiyorsa geri dönüş küçük: `Yoga.jsx`'te ilk ekran durumu ve `pressStart`'taki koşul.
  - Nefes modülü (`screens/Breath.jsx`) kartı girişte gösteriyor; iki modül bu konuda farklı davranıyor.
- **Klinik:** Kart artık ilk dersin başlatılmasından hemen önce çıkıyor ve ders onsuz başlamıyor. Dersi hiç başlatmayan
  kişi kartı görmüyor. Kartın içeriği ve kapalı gövdeler (§6) aynı.
- **Türkçe editör:** Yeni metin yok. Yerleşim değişiklikleri:
  - "Başlamadan önce" ayrıntıda düğmenin yazılı adı oldu;
  - "Gündüz" kütüphane kartında yazılı.

### 12.6 Değişen dosyalar

- `app/src/modules/yoga/`:
  - `Yoga.jsx`: kartın yeri ve "Başla" zinciri, vitrin kartı, "Başlamadan önce" düğmesi, `DayIcon`'un yazılı adı, önce
    puanının dizilimi;
  - `YogaParts.jsx`: `DiveList` silindi;
  - `yoga.css`: vitrin, düğme, önce puanı; bölüm yolu CSS'i silindi;
  - `text.js`: yalnız yorum;
  - `Yoga.test.jsx`: §12.4.
- Düzenek (depo dışı): `scratchpad/yoga-5sn/duzenek/cek.mjs`. Yeni akış (kart "Başla"dan sonra), Kod satırı, gerçek akış
  sırası; `son-calisma.json` dizi biçiminde kaldı.
- Yedek (değişiklikten önceki hâl): `scratchpad/yoga-kapi1/once/`.
- Deneme çekimleri: `scratchpad/yoga-kapi1/deneme1/` (penceredeki sahne boş çıkmıştı, düzeltildi) ve `deneme2/`.
- Yoga dışında hiçbir dosyaya dokunulmadı; git kullanılmadı.

## 13. Kapı turu 2: kök neden ve düzeltme (2026-09-30, 13:15)

Kapı turu 2'de beş değerlendiricinin üçü altı ekranda etkilenmedi: 2 kütüphane (2/5), 3 ayrıntı (1/5), 4 güvenlik (2/5),
6b oynatıcının ilk 5 saniyesi (2/5), 6 oynatıcı 3. dakika (2/5), 7c zorlanma (0/5). Geçen ekranlara (1, 5, 7, 7b, 8) bu
turda dokunulmadı; yeni çekimleri 12:25 çekimleriyle bayt bayt aynı (sha1 eşit).

### 13.1 Kök neden

Notlar tek tek kusur gibi görünüyordu, ama iki ortak nedene dayanıyordu:

1. **Ekranın biçimi içeriğine ve anına uymuyordu.**
   - Kütüphane bir katalog gibi kurulmuştu, ama içinde tek ders vardı. Değerlendiriciler "boş raf", "başka ders yok
     mu?", "yarım kalmış liste" dedi (beşin dördü). Ekranın yarısını kaplayan resim bilgi taşımıyordu. Açık temada beyaz
     güneş, beyaz ışığın içinde kayboluyordu.
   - Güvenlik kartı beş eşit akordeon satırıydı ve her satırda aşağı ok vardı. Bu, ayarlar menüsü ya da kullanım
     koşulları kalıbı (beşin beşi).
   - Oynatıcının zemini düz #050A12'ydi. Nefes formu parlaklık tavanında (bağıl %15) kalınca ekranın üçte ikisi boş
     görünüyordu: "donmuş mu", "yüklenmemiş" (6b'de üç, 6'da üç değerlendirici). Sesin çaldığını gösteren hiçbir
     işaret yoktu. Denetimlerin ağırlığı da tersti: çerçeveli "Kapanışa geç" duraklat kadar belirgindi (6b'de beşin
     dördü), duraklat ise karanlıkta göz alan beyaz bir diskti.
   - Zorlanma sorusu yeniden tasarımın dışında kalmıştı; yalnız temaya alınmıştı. Sahne yoktu, adım şeridi yoktu,
     sol üstte üç küçük hap vardı: "taslak form" (beşin beşi).
2. **İlk derste güvenlik bilgisi üç kez, art arda geliyordu.** Ayrıntıda sağ üstte "Başlamadan önce" düğmesi, "Başla"nın
   hemen üstünde "Başla"dan iri bir uyarı kartı ("ilaç prospektüsü"), sonra "Başla"ya dokununca aynı maddelerle güvenlik
   kartı. Ayrıntıda etkilenmeyen dört değerlendiricinin dördü de uyarı bloğunu yazdı. Güvenlik kartında beşin dördü
   tekrarı yazdı; kartta etkilenen iki değerlendirici de tekrarı "en zayıf yan" saydı.
   Ayrıntının üstündeki ince sahne şeridi de bundandı: güneş, Geri ile "Başlamadan önce" düğmesinin arasına
   sıkışmıştı.

### 13.2 Ekran ekran yapılanlar (metinler aynı; yeni metin yok)

**2 · "Yoga ve Meditasyon": liste değil, dersin kapağı** (yalnız tek ders yayımlıyken; birden çok derste liste
değişmedi).
- Dersin yeri, kenardan kenara bütün ekranın zemini: aynı kıyı, güneş ufukta. Yazılar altta, sahnenin zemine eridiği
  yerde:
  - dersin tam adı iri;
  - söz;
  - iki simgeli etiket: "15 dk", "Uzanarak";
  - "Derse git".
- Ekranın adı ("Yoga ve Meditasyon", h1) Geri'nin yanında ve küçük. Değerlendirici notu: "fısıldaması gereken yerde
  bağırıyor".
- Açık temada gök belirgin bir sabah mavisi, ufukta krem bir ışık. Güneş beyaz ve keskin kenarlı, denizde ışık yolu var.
  Bulut şeritleri kalktı: bulanık bir çizim hatası gibi okunuyordu.
- "Gündüz" yazısı kalktı; yalnız VoiceOver okur: "Gündüz · 15 dk · Uzanarak". İki değerlendirici bunu "gece yapamaz
  mıyım?" diye okumuştu. Tek derste ayırt edici değil ve sahnedeki güneş zaten gündüzü gösteriyor.

**3 · Ayrıntı yeniden dizildi.**
- Üstteki sahne daha uzun: 390×844'te 292 px, eskiden 203 px. Alt kenarı zemine eriyor (maske), ek yeri yok. Güneş
  yarı doğmuş ve yalnız Geri'nin yanında.
- Sırasıyla:
  - tam ad, söz, "15 dk" · "Uzanarak" etiketleri;
  - izin satırı, "Başla"nın hemen üstünde bir davet olarak: "İstediğin an gözlerini açabilir, kıpırdayabilir ya da
    dersi bitirebilirsin." Kutusuz, ink, kapı simgesiyle. Bir değerlendirici bu cümleyi "saygılı, alan tanıyan dil"
    diye övdü;
  - "Başla";
  - hemen altında öteki iki açılış satırı (araç, kalkış): küçük (14 px), kutusuz, okunur;
  - "Başlamadan önce ›" satırı: kartı yeniden açar, **yalnız kart bir kez görüldükten sonra** çıkar. İlk derste kart
    zaten "Başla"yla gelir;
  - hazırlık karoları, bölümler, Kaynaklar.
- Sağ üstteki "Başlamadan önce" düğmesi kalktı.
- "Nefona Hoca" ayrıntıda yazılmıyor. İlk yayında ses seçimi yok (PLAN.v3 §D.2) ve iki değerlendirici "gerçek bir hoca
  mı?" diye sordu. Metin `text.js`'te kaldı, ekranda değil.
- "Başla" 390×844'te y ≈ 508–560'ta: ilk görünümün ortası. 320×640'ta da ilk görünümde.

**4 · Güvenlik kartı: karolar ve üstte dersin yeri.**
- Beş eşit akordeon satırı yerine, ayrıntıdaki hazırlık karolarıyla aynı dilde karolar:
  - ilk madde ("İstediğin an dersi bitirebilirsin.") geniş, dersin renginde bir davet karosu;
  - öteki dördü iki sütunda. Sıra aynı: araç, kalk, ses, sağlık;
  - "Nefona tedavi değildir … Acil durumda **112**." notu karoların hemen altında, tek başına. Bir madde gibi
    okunmuyor ("112 ile 'Sesi kısık tut' aynı seviyede" notu). Sağlık maddesinin hemen ardında.
- Açılır işareti, her satırdaki aşağı ok yerine sönük küçük bir artı. Açılan karo tam genişliğe yayılır, gövde aynen
  altında. Hiçbir madde gizlenmedi; ana cümleler hep görünür.
- Üstte ayrıntıdaki aynı yer, kısa: kart ayrı bir "koşullar sayfası" gibi değil, dersin kapısında açılıyor. Kısa ekranda
  yalnız Geri.
- "Nefona" artık başlık yazı tipinde değil: satırın ritmini bozuyordu.
- Kısa ekranda (≤ 700 px) başlığın altındaki satır yine gizli. Aynı cümle ilk maddenin gövdesinde duruyor. 320×640'ta
  beş karo, 112 notu ve "Anladım" ilk görünümde.

**6b ve 6 · Oynatıcı: dersin yerinin gecesi.** Parlaklık tavanı, nefes formu ve motor değişmedi.
- Zemin: ufka (y %44, formun çizgisi) doğru açılan lacivert gök, altında deniz. En açık yerin bağıl ışıklılığı ≈ 0,01;
  formun tavanının çok altında.
- Gökte on iki sönük, küçük ve hareketsiz yıldız. Kapanışın şafağında 3 sn'de sönerler (`visualAt` dawn).
- Altyazı kapalıyken dersin karşılama cümlesi ("Hoş geldin.") gökte, ufkun üstünde bir selam olarak yazılır. Altyazı
  yerinde değil: "Altyazı düğmesi sönükken metin ekranda duruyor" notu. Ekrandaki cümle söylenen cümle.
- **Ses işareti:** bölümün adının önünde dört ince çubuk. Çalarken farklı boylarda, duraklatılınca yere iner.
  - Denetimler kaybolsa da kalır ("donmuş mu?" notu).
  - Kıpırtı yalnız Hareketi Azalt kapalı ve nöbet cevabı "Hayır"ken; yavaş (1,3–2,1 sn), yanıp sönme yok. Öteki
    durumlarda hareketsiz, boyları yine "çalıyor" der.
- Altyazı açıkken bir önceki cümle sönük yazılır: yalnız aynı bölümde ve ara ≤ 8 sn ise (`timeline.captionBefore`).
  3. dakikada: "Rahatsız eden bir bölge olursa atla." / "Hissetmesen de her adı içinden tekrarlayabilirsin."
  Değerlendiricilerin beşi de "her adı hangi ad?" diye sormuştu.
- Altyazı düğmesi: kapalıyken çizili simge ve sönük yazı, açıkken dersin renginde dolu zemin.
- Şeritteki açıklamasız gün doğumu simgesi kalktı. Kapanışın bölümü şeritte sıcak renkte (şafak). "Kapanışa geç"
  çerçevesiz, sönük bir yazı düğmesi; simgesi aynı sıcak renkte, dokunma alanı 44 px.
- Duraklat, beyaz dolu disk yerine yarı saydam bir halka (72 px). Konum noktası 18 px'ten 13 px'e indi: ilk bölümün
  kısa parçasını örtmesin.

**7c · Zorlanma sorusu: sonra puanıyla aynı dil.**
- Üstte dersin yeri: bitirdiyse şafak, durdurduysa kıyı (kapanışa ulaşılmadı). Bitirdiyse dersin yolu: ✓ Önce · ✓
  Derin Dinlenme · ● Sonra. Sonra puanındaki adım bu; modul.md §2.8 ikisini aynı adım sayıyor.
- Soru iri. Üç eşit, iri seçenek tek sırada (64 px; kısa ekranda 56 px); altta "Atla".
- "Çok" metni ve "Devam" 320×640'ta da sığıyor. Yer yalnız kısa ekranda kısalıyor.

### 13.3 Alınmayanlar

- **Ayrıntıdaki açılış satırlarıyla güvenlik kartındaki maddelerin ilk derste art arda gelmesi** tamamen giderilemedi.
  - İkisi de planın zorunlu öğesi: açılış satırları "her ders ekranında" (PLAN.v3 §D.6), kart ilk derste ayrıntıdan
    sonra (§D.2).
  - Tekrarın ağırlığı azaltıldı: ayrıntıda araç ve kalkış satırları küçük ve "Başla"nın altında; kartı yeniden açan
    düğme ilk derste yok; kart ayrı bir sayfa gibi değil.
  - Bu, ekran 4 için kalan en büyük risk. Kesin çözüm bir plan kararı ister, ör. ilk derste açılış satırlarının yerini
    kartın alması; sahibe sorulmalı (§13.5).
- **"Kapanışa geç"i ilk bölümde gizlemek** alınmadı. Denetim modul.md §2.6'da hep var (kapanıştayken yok) ve ilk ders
  giriş cümlesi düğmeyi adıyla anıyor (PLAN.v3 §D.3). Yalnız görsel ağırlığı düştü.
- **Oynatıcıda gerçek ses dalgası.** Yerel oynatıcı ses düzeyi vermiyor (`lessonStatus`: time, duration, playing,
  route). İşaret yalnız "çalıyor / duraklatıldı" durumunu gösterir, ses düzeyini taklit etmez.
- **Başlık yazı tipi** (Unbounded) değişmedi: uygulamanın başlık yazı tipi. Kapakta ekranın adı küçültüldü.
- **"Neden soruluyor?" satırı (7c).** Yeni metin gerektirir; eklenmedi.

### 13.4 Sonuç

- **Testler:** `npx vitest run` → 138 dosya, **1877 test, hepsi geçti**. Yoga: 7 dosya, 100 test (önce 99).
  - Yeni bir test (`timeline.test.js`): önceki cümle yalnız aynı bölümde ve kısa arada; ekrandaki her cümle söylenmiş
    bir cümle.
  - Beklentisi değişen dört test (`Yoga.test.jsx`):
    - ilk derste ayrıntıda "Başlamadan önce" yok;
    - ayrıntıda "Nefona Hoca" yok; izin satırı "Başla"nın hemen üstünde, öteki satırlar hemen altında;
    - kart karolarda: ilk madde geniş, sağlık maddesi son, 112 notu karoların hemen ardında (eskiden `.yg-acc-health`);
    - oynatıcıda karşılama cümlesi gökte (`.yg-greet`), önceki cümle, ses işareti (çalıyor / duraklatıldı) ve
      kapanışın bölümü (`.yg-seg.k`; eskiden `.yg-kmark`).
  - Güvenlik metinleri harfi harfine ve sırası değişmeden sınanıyor.
- **Derleme:** `vite build` geçti. Çıktı `scratchpad/yoga-kapi2/build/` altında, depoya yazılmadı. Tek uyarı, önceden
  de olan 500 kB uyarısı.
- **Çekim:** `bash scratchpad/yoga-5sn/duzenek/cek.sh`, varsayılan klasöre 44 PNG. Kod satırı: `2c71469e7267d3cd`.
  - Yoga ekranlarının hiçbirinde yatay taşma, görünüm dışı öğe, kırpılmış metin, üst üste binme ya da alt kenarda
    kesilen öğe yok. Konsolda hata yok.
  - Kayıt dört birleşimde de doğru: ders 2, 900/900 sn, 7 → 4, "Hayır".
  - Açık temada koyu çıkan tek ekran oynatıcı (plan gereği).
  - 12:25 çekimleri: `scratchpad/yoga-kapi2/shots-12-25/`.
- **Ek anlar** (`scratchpad/yoga-kapi2/ek/`, `ek.sh`): dönüş ziyaretinde ayrıntı ve "Başlamadan önce" satırı, kartta
  açılan karolar, zorlanma "Çok" (390 ve 320, iki tema), duraklatılmış oynatıcı, Hareketi Azalt, durdurmadan gelen
  zorlanma. Hepsinde yatay taşma 0.
  - "Çok" 320×640'ta sayfaya sığıyor (640/640).
  - Hareketi Azalt'ta ses işaretinin, selamın ve ışık kaymasının animasyonu yok.
- **Kendi bakışım** (390 ve 320, açık ve koyu; gerçek sırayla):
  - 2 artık bir kapak;
  - 3'te göz sırayla sahneye, ada, davete ve "Başla"ya gidiyor;
  - 4 bir form değil, dersin kapısında kısa bir not;
  - oynatıcı gece gökyüzü, selam ve canlı işaretle "çalışıyor" diyor;
  - 7c, 7'nin devamı.
  - **Bu bakış bir 5 saniye sınaması değildir.** Değerlendiricilere gerçek sırayla gösterilmeli: 2 → 3 → 4 → 5 → 6b →
    6 → 7 → 7b → 7c → 8.
- Cihazda doğrulanmadı `[~]`: iOS WebKit'te `mask-image` (-webkit- önekiyle), `backdrop-filter`, 3× ekranda yıldızların
  görünümü, ses işaretinin VoiceOver'da okunmaması (`aria-hidden`).

### 13.5 Onay bekleyenler

- **Klinik:**
  - Araç satırı artık "Başla"nın hemen altında; modul.md §2.4-12 "hemen üstünde" diyor. İlk derste kart araç maddesini
    "Başla"dan sonra, ders başlamadan gösteriyor. Sonraki derslerde satır "Başla"nın altında, ilk görünümde.
  - Güvenlik kartında sağlık maddesinin gövdesi yine kapalı; §6'daki soru açık duruyor.
- **Sahip:**
  - Tek ders yayımlıyken "Yoga ve Meditasyon" ekranı liste değil, dersin kapağı. İkinci ders yayımlanınca liste
    kendiliğinden döner.
  - İlk dersteki tekrar (§13.3) için plan kararı gerekiyor.
  - "Nefona Hoca" adı ekrandan kalktı.
- **Türkçe editör:** Yeni metin yok. Yerleşim kararları:
  - izin satırı "Başla"nın üstünde, araç ve kalkış satırları altında;
  - karşılama cümlesi altyazı kapalıyken gökte;
  - altyazı açıkken önceki cümle sönük;
  - "Gündüz" yalnız VoiceOver'da.

### 13.6 Değişen dosyalar

- `app/src/modules/yoga/`:
  - `Yoga.jsx`: kapak (`Library`, `Facts`); ayrıntının dizilimi ve kartı yeniden açan satır (yalnız kart görüldükten
    sonra); güvenlik kartı karoları ve sahnesi; zorlanma ekranı;
  - `YogaPlayer.jsx`: gök, selam, ses işareti, önceki cümle, altyazı düğmesinin iki hâli, kapanışın bölümü; motor,
    konum, kayıt ve güvenlik mantığı değişmedi;
  - `timeline.js`: `captionBefore`;
  - `yoga.css`: kapak, gündüz sahnesinin renkleri (kapak, ayrıntı, kart, durdurmadan gelen zorlanma), ayrıntı, karolar,
    zorlanma, oynatıcı, kısa ve dar ekran, Hareketi Azalt;
  - `text.js`: yalnız iki yorum;
  - `Yoga.test.jsx`, `timeline.test.js`: §13.4.
- Düzenek (depo dışı): `cek.mjs`'te yalnız 2 ve 7c'nin açıklaması. Yedeği: `scratchpad/yoga-kapi2/cek.mjs.once`.
- Yedek (değişiklikten önceki hâl): `scratchpad/yoga-kapi2/once/`.
- Deneme çekimleri: `scratchpad/yoga-kapi2/deneme1/`, `deneme2/`, `deneme3/`.
- Yoga dışında hiçbir dosyaya dokunulmadı; git kullanılmadı.

## 14. Sahip kararları 19–20 (2026-09-30, 14:10)

Kararlar `SAHIP_ISTEKLERI.md` 19 ve 20'de. Yalnız beş dosya değişti: `Yoga.jsx`, `YogaParts.jsx`, `text.js`, `yoga.css`,
`Yoga.test.jsx`. Git kullanılmadı.

### 14.1 Karar 19: güvenlik kartı ilk girişte, ayrıntıda tek izin cümlesi

**Doğrulama: "bugünkü davranış" değildi.** Kapı turu 1'den beri (§12.2-1) kart, ilk derste "Başla"ya dokununca
çıkıyordu. `SAHIP_ISTEKLERI.md` 19'daki "bugünkü kod" notu ve `C_5SN_SONUCLARI.md`'deki "gerçek akış 1 → 4 (güvenlik,
ilk girişte)" satırı bu yüzden koddan farklıydı. Kod sahibin seçimine göre değişti:
- Kart yogaya ilk girişte bir kez çıkar. Kütüphaneden de yoldan da (`yoga-2`) girilse ilk ekran karttır.
- "Anladım" girilen yere geçer: kütüphaneye ya da ayrıntıya.
- İlk girişte "Geri" Ana sayfaya döner; kart onaylanmadığı için bir sonraki girişte yeniden çıkar.
- Kart onaylanmadan ders başlamaz. Yedek olarak "Başla"da da denetlenir.

**Ayrıntıdaki uyarılar:**
- Yalnız onaylı izin cümlesi kaldı, "Başla"nın hemen üstünde: "İstediğin an gözlerini açabilir, kıpırdayabilir ya da
  dersi bitirebilirsin." (`OPENING_PERMISSION`, aynen).
- "Başlamadan önce ›" artık her zaman görünür. Eskiden yalnız kart görüldükten sonra çıkıyordu.
- Derse özel tek uyarı Uykuya Geçiş'te: "Bu dersten hemen sonra araç kullanma."
  - Cümle Ders 3'ün açılış satırından türetilir (`vehicleExtra`): ortak araç cümlesinin ardındaki cümle, aynen.
  - Ders 3 bu ağaçta yayımlı değil. Test, veriyi geçici olarak yayımlayıp sınıyor.

**Ayrıntıdan kalkan satırlar kaybolmadı:**
- Ortak araç satırı: kartta "Araç kullanırken açma." maddesi var (gövdesi: araç, makine, su).
- Kalkış satırı "Uzanarak yaptığın derslerden sonra önce yana dön, otur, sonra kalk.":
  - kartın "Yavaşça kalk." maddesinin gövdesinde harfi harfine zaten var, karta ekleme gerekmedi;
  - bitiş ekranının çerçeveli notunda da duruyor (değişmedi);
  - Ders 2 kapanışında seste de var: "Uzanıyorsan önce yana dön, sonra otur."
- Ders 3'ün gece kalkış satırı "Gece kalkman gerekirse önce yana dön, otur, sonra kalk.":
  - durdurma ekranının gece metninde aynen duruyor (`YT.stopped.night`);
  - kartta "Yavaşça kalk." maddesi var;
  - Ders 3 kapanışında seste: "Kalkacaksan önce yana dön, otur ve bekle; başın dönerse biraz daha otur."
- İki ders satırı karar gereği ayrıntıda yok. Bu dersler yayımlanınca etkilenir:
  - Ders 1 "Başın dönerse ya da ellerin karıncalanırsa normal nefesine dön.": derste her sürümde söyleniyor (`c1.guven`).
  - Ders 5 "Gözlerin yorulursa kapatman ya da kırpman yeterli.": derste söylenmiyor. Yakın söz var: "Gözlerini kapatmak
    ya da açık tutmak sana kalmış…". Ekranda da artık yok (§14.4).

**Üst kısım kapağı tekrar etmiyor** (kapı turu 3'te beş değerlendiricinin beşi de "üst yarı kapağın neredeyse aynısı"
dedi; etkilenen tek değerlendirici de bunu en zayıf yer saydı):
- Sahne kısa bir şerit: 390×844'te 182 px (eskiden 292), 320×640'ta 108 px (eskiden 152). Güneş yarı doğmuş; kapaktaki
  ufuktan bir adım ileri.
- Ad daha küçük: 390'da ≈ 25 px (eskiden 30), kısa ekranda 1,3rem (eskiden 1,45rem).
- Süre ve duruş çerçevesiz tek satırda: "15 dk · Uzanarak". Kapaktaki iki çip tekrarlanmıyor.
- Dersin sözü yalnız yoldan açılınca yazılır, çünkü o zaman kapak görülmemiştir. Kütüphaneden gelince tekrar yok.

**Dersin içeriği öne alındı**, sırasıyla:
- süre çipleri (birden çok süre yayımlıysa);
- Bölümler: şerit ve adlar;
- "Neye dayanıyor":
  - kanıt cümlesi açıkta; eskiden kapalı Kaynaklar kartının içindeydi;
  - metin aynen, yalnız cümlenin kendi başındaki "Neye dayanıyor:" kalın;
  - kaynak listesi aynı kartta açılır;
- Hazırlık;
- "Başlamadan önce ›".

**Alt şerit:** İzin cümlesi ve "Başla" alt şeritte duruyor; güvenlik kartındaki "Anladım" şeridiyle aynı kalıp. İçerik
uzasa da ikisi hep görünür (320 px, Uykuya Geçiş'in uzun kanıt cümlesi). Yoldan açılınca "Sonra yaparım" da şeritte,
"Başla"nın altında yazı düğmesi olarak duruyor.

### 14.2 Karar 20: zorlanma sorusu sonra puanının altında tek satır

- **Soru:** "Derste kendini kötü hissettin mi?" (onaylı metin). `text.js`'te yalnız `hard.question` değişti. Aynı
  kalanlar: seçenekler, "Atla", "Devam", "Çok"un dört metni ve kayıttaki kimlikler (`no`, `some`, `much`).
- **Yer:** Sonra puanında "Devam"dan (puan yazılır) ya da "Atla"dan (yazılmaz) sonra ekran değişmez.
  - Ölçek yerinde kalır ama sönükleşir; puan artık değiştirilemez. VoiceOver ölçeği "sönük" okur.
  - "Devam · Atla"nın yerine zorlanma satırı iner. Ayrı zorlanma ekranı yok.
- **Satır:** güvenlik okumasının iki yerleşim notuna uyar.
  - Ölçekten ince bir ayraç ve boşlukla ayrılır.
  - Soru 1,02rem Onest'le tek satır. Çekimde 320 px'te 256/280 px ölçüldü.
  - Seçenekler ölçeğin duraklarından farklı: üç hap. Yanında "Atla" yazı düğmesi, hep görünür. Dokunma alanı 46 px.
- **Davranış** (cevapların anlamı aynı):
  - "Hayır" ve "Biraz" yazılır, bitiş ekranına geçilir.
  - "Çok" yazılır; metni kendi kutusunda, 1rem boyunda çıkar. Metin iki biçimden biridir; dersin daha kısa süresi yoksa
    kısa biçim. "Devam" hemen altında durur ve sayfa kendiliğinden metne ve "Devam"a kayar (Hareketi Azalt'ta kaymadan).
  - "Atla" hiçbir şey yazmaz. "Çok"tan sonra basılırsa "Çok" da silinir (`hard: null`).
  - "Çok"un sonucu değişmedi: bitişte aynı dersin en kısa süresi ve "Gözlerin açık kalabilir."
- **Durdurma yolu** (X → "Tamam", ders 30 sn'yi geçtiyse; modul.md §2.7):
  - Yalnız bu satır çıkar, aynı bileşenle. Tek soru olduğu için başlık `h1` ve ayraç yok.
  - Üstte dersin yeri (kıyı) boşluğu doldurur, satır başparmağa yakın durur. Kapı turu 3'teki "adım çizgisiyle soru
    arasında kocaman bir boşluk" notu böyle karşılandı.
  - 320 px'te soru 1,06rem, tek satır (265/280 px).
- **Küçük hata düzeltildi:** Kişi sonra puanında bir sayı seçip "Atla"ya basarsa, yazılmayan sayı bitişte "6 → 4" diye
  görünüyordu. Artık görünmez.
- **Kalan zayıflık** (güvenlik okuması): "Hayır" bir "sorun yok" kanıtı değildir. Kod bu cevabı yalnız kaydeder; hiçbir
  yerde onu güvence gibi kullanmaz.

### 14.3 Testler, derleme, çekim

- **Testler:** `npx vitest run` → 141 dosya, **1906 test, hepsi geçti.**
  - Başlangıçtaki koşuda başka iş akışının Home testlerinde 4 kırmızı vardı; son koşuda yok.
  - Yoga: 7 dosya, 103 test (önce 100).
- **`Yoga.test.jsx`'te değişen beklentiler ve gerekçeleri:**
  - Kartın yeri artık ilk giriş (karar 19). Üç test yeniden yazıldı: ilk giriş, yoldan ilk giriş, kart karoları. İlk giriş
    kartında "Geri" Ana sayfaya döner.
  - Ayrıntı (karar 19 ve kapı turu 3): tek uyarı izin cümlesi; araç ve kalkış satırı yok; "Neye dayanıyor" açıkta ve bir
    kez; içerik sırası; alt şerit; "Başlamadan önce" her zaman; ayrıntıdan açılan kartta "Geri" ayrıntıya döner.
  - Zorlanma (karar 20): yeni soru metni ve aynı ekranda inen satır. Ana akış, tema testi ve durdurma yolu buna göre.
  - Yeni üç test:
    - kalkış ve araç satırlarının kartta kaldığı ve Ders 3 satırının türetilmesi;
    - Uykuya Geçiş ayrıntısı (veri test süresince yayımlı);
    - satırda "Biraz", "Atla" ve "Çok → Atla"nın kayda ne yazdığı.
  - `Yoga.data.test.jsx`'e dokunulmadı, değişmeden geçiyor. Akış buna göre kuruldu: "Atla" puanı geçer, satır iner,
    "Hayır" bitişe götürür.
- **Derleme:** `vite build` geçti. Çıktı `scratchpad/yoga-kapi3/build/` altında, depoya yazılmadı. Tek uyarı önceden de
  olan 500 kB uyarısı.
- **Çekim:** `cek.sh` → 44 PNG, Kod `f520d40d3d757fe4` (son kodla aynı).
  - Yoga ekranlarının hiçbirinde yatay taşma, görünüm dışı öğe, kırpılmış metin ya da üst üste binme yok.
  - Konsolda hata yok.
  - Kayıt dört birleşimde de doğru: ders 2, 900/900 sn, 7 → 4, "Hayır".
- **Düzenek** (depo dışı, `scratchpad/yoga-5sn/duzenek/cek.mjs`; yedeği `scratchpad/yoga-kapi3/cek.mjs.once`):
  - yeni akış: kart ilk girişte, 7c aynı ekranda;
  - gerçek sıra 4 → 2 → 3 → 5 → 6b → 6 → 7 → 7b → 7c → 8;
  - alt şeridin (`.yg-sticky`) altından kayan içerikle binişme sayılmıyor. Bu tasarım gereği; sekme çubuğu için de öyle.
- **Kapı turu 3'ün çekimleri:** `shots/`'ta üzerine yazıldılar. Aynı kodla yeniden üretildi (Kod `2c71469e7267d3cd`,
  doğrulandı): `scratchpad/yoga-kapi3/tur3/shots/`.
- **Ek anlar:** `scratchpad/yoga-kapi3/ek/` (`ek.sh`), 20 an.
  - Anlar: ayrıntının aşağısı, sonra puanında "Çok", durdurma yolunda satır ve "Çok", yoldan ilk giriş.
  - Hepsinde yatay taşma, görünüm dışı öğe ve 44 px altı dokunma alanı yok.
  - "Çok" 320×640'ta: sayfa kayar, "Devam" ekranın altında (586–640).
- **Kendi bakışım** (390 ve 320, açık ve koyu):
  - Kart kapının önünde, kapak ondan sonra temiz açılıyor.
  - Ayrıntı:
    - kısa şerit, ad ve "15 dk · Uzanarak" var;
    - göz Bölümler'e ve "Neye dayanıyor"a iniyor, altta izin cümlesi ve "Başla";
    - kapak ile ayrıntı artık bir bakışta iki ayrı ekran.
  - 7c: soru küçük ve tek satır, ölçek sönük, üç hap ve "Atla".
  - Durdurma yolu: sahne ekranı dolduruyor, satır altta.
  - **Bu bakış bir 5 saniye sınaması değildir.**
- **Cihazda doğrulanmadı `[~]`:**
  - VoiceOver odağının inen satırda soruya gelmesi;
  - iOS WebKit'te alt şerit (`position: sticky`);
  - `scrollIntoView` davranışı.

### 14.4 Onay bekleyenler

- **Belgeler** (kod aşamasının dışında, dokunulmadı). Sahip kararları 19–20'ye bağlanarak güncellenmeli:
  - modul.md §2.4-12 ve §10.1: açılış satırları ve "araç uyarısı her ders ekranında";
  - modul.md §2.8: soru metni ve yerleşim;
  - PLAN.v3 §D.2: kartın yeri;
  - PLAN.v3 §D.6: açılış satırları;
  - dossier-guvenlik §11.F: soru metni.
  - modul.md §2.2 zaten "ilk girişte" diyor.
- **Klinik:**
  - Ders 5'in "Gözlerin yorulursa kapatman ya da kırpman yeterli." satırı ayrıntıdan kalktı ve derste söylenmiyor. Ders 5
    yayımlanmadan önce bakılmalı.
  - "Çok"tan sonra "Atla" cevabı siliyor. İstenirse "Çok" korunabilir; küçük bir değişiklik.
- **Türkçe editör:** Yeni metin yok. Yerleşim kararları:
  - "Neye dayanıyor:" kalın;
  - izin cümlesi alt şeritte;
  - dersin sözü yalnız yoldan açılınca.
- **5 saniye kapısı:** Değişen ekranlar yeniden sınanmadı: 3 (ayrıntı), 4 (yeni yeri) ve 7c (aynı ekranda satır). Gerçek
  sırayla gösterilmeli: 4 → 2 → 3 → 5 → 6b → 6 → 7 → 7b → 7c → 8.

### 14.5 Değişen dosyalar

- `app/src/modules/yoga/`:
  - `Yoga.jsx`: kartın yeri ve ilk giriş "Geri"si; ayrıntı (kısa üst kısım, içerik, "Neye dayanıyor", alt şerit, derse
    özel araç cümlesi); zorlanma satırı (`HardRow`) ve sonra puanının ikinci adımı; durdurma yolu; alt şerit çizgisi için
    ortak `useStickyOver` (kart ve ayrıntı);
  - `YogaParts.jsx`: `HorizonScale`'e `disabled`;
  - `text.js`: `hard.question` ve yorumlar;
  - `yoga.css`: ayrıntı, "Neye dayanıyor", alt şerit, zorlanma satırı, durdurma yolu, kısa ve dar ekran; eski zorlanma
    ekranının ve açılış satırlarının CSS'i silindi;
  - `Yoga.test.jsx`: §14.3.
- Yedek (değişiklikten önceki hâl): `scratchpad/yoga-kapi3/once/`.
- Dokunulmayanlar: `timeline.js`, `YogaPlayer.jsx`, `BreathForm.jsx`, `lib/yogaLessons.js`, `Yoga.data.test.jsx` ve yoga
  dışındaki bütün dosyalar. Git kullanılmadı.

### 14.6 Son kapı düzeltmesi (2026-09-30, 14:52–15:01 UTC)

Etkilenmeyenler: 3 (2/5), 3c (1/5), 7c-kötü (1/2), 7c-zorlanma (0/3). Kök nedenler ve düzeltmeler (yalnız sunuş; onaylı
metin ve güvenlik içeriği aynen, yeni söz yok):
- **3 · ayrıntı:** Kanıt cümlesi kartlı ve bölümlerin hemen altındaydı, ilk ekranın en büyük bloğu oluyordu. Artık
  hazırlıktan sonra geliyor ve kart değil, sakin bir not: küçük, sönük yazı, "Neye dayanıyor:" kalın. Hâlâ açıkta ve
  aynen. Üst görsel daha geniş: 844'te 150–212 px, kısa ekranda 112 px.
- **3c · Uykuya Geçiş:** Ders süresi sırası ile müzik sırası birbirinin aynısıydı. Ders süresinin üstüne onaylı "Süre"
  etiketi geldi ve büyük hap olarak kaldı. "Ders bitince müzik" artık küçük bölmeli bir seçici. Gece göğünün açık
  temadaki geçişi %90'dan sonra kısa bir kenar: çamurlu gri bant yok. Kanıt notu artık alt şeridin arkasında değil,
  kaydırınca okunuyor.
- **7c · zorlanma satırı:** Ayraç altındaki form satırı yerine kendi kartı var: dersin renginde üst kenar, büyük başlık.
  Böylece ölçekten ayrılıyor ve "Çok" ile ölçeğin "çok"u karışmıyor. "Atla"nın altı çizili; dokunulabilir olduğu belli.
- Testler: `Yoga.test.jsx` sıra beklentisi güncellendi (bölümler → hazırlık → "Neye dayanıyor" → "Başlamadan önce").
  Yoga testleri 236/236 geçti. Bütün takım 143 dosya / 2051 test geçti, derleme de sorunsuz.
- Çekim: `scratchpad/yoga-son/shots/` aynı adlarla (48 PNG, 15:00). Varsayılan çıktı da yenilendi:
  `scratchpad/yoga-5sn/shots/`.
- Dosyalar: `Yoga.jsx` (Detail: `is-night`, `yg-len`, `yg-tail`/`yg-segctl`, Basis yeri), `yoga.css` (dosya sonunda
  tek blok), `Yoga.test.jsx` (tek sıra satırı). Git kullanılmadı.
- **Kalan (bu dosyalarla çözülmez):**
  - Ders 2'de ilk açılışta 20 dk seçili geliyor. `defaultMinutes` `lib/yogaLessons.js`'te; 3 değerlendirici "uzun"
    dedi, sahip kararı gerekiyor.
  - "3'te 20, oynatıcıda 15": düzenek bilerek 15'i seçiyor (sahte oynatıcı yalnız ders2-15'i tanıyor). Uygulama hatası
    değil.
  - Zorlanma sorusunun metni (sahip kararı 20) ve ölçeğin "çok" ucu değişmedi. Bir değerlendiricinin önerdiği yumuşak
    soru editör ve güvenlik onayına gider.
  - Değişen ekranlar (3, 3c, 7c) 5 saniye kapısında yeniden sınanmadı.
