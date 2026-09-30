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
