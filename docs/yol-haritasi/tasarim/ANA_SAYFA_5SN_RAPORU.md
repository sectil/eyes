# Ana sayfa · 5 saniye yeniden tasarımı · uygulama raporu

Tarih: 30 Eylül 2026. Sahip kararı (`SAHIP_ISTEKLERI.md`, 2026-09-30): ana sayfa şimdi yeniden tasarlanır; yöntem üç ayrı
tasarım yönü ve beş bağımsız değerlendirici. Bu belge, değerlendiricilerin seçtiği yönün ana sayfa koduna nasıl
uygulandığını, hangi aşıların alındığını, neyin değişmediğini ve metin kapısına giden yeni cümleleri yazar. Git
kullanılmadı. Yoga dosyalarına, `App.jsx`'e, `lib/releases.js`'e, `site/` ve `ios/` altına dokunulmadı.

## 1. Seçim ve gerekçe

**Seçilen yön: B, "Senin gözün".** Beş değerlendiricinin beşi de "her gün açmak istediğim yön" olarak B'yi seçti
(`overall`: 5/5).

| Senaryo | En iyi (5 değerlendirici) | B'den etkilenen |
|---|---|---|
| 1 · 1. gün, 10.00 | B 3, A 2 | 5/5 |
| 2 · 2. gün, 10.00 | B 3, A 2 | 5/5 |
| 3 · 9. gün, 10.00 | B 5 | 5/5 |
| 4 · 30. gün, 10.00 | B 5 | 5/5 |
| 5 · eski kullanıcı, güncelleme günü | B 4, C 1 | 5/5 |
| 6 · 9. gün, 20.30, yol bitmiş | A 2, C 2, B 1 | 3/5 |

Ortak gerekçe: ilk görünümün ortasında kopyalanamayacak bir imza var, kişinin kendi günlerinden örülen ve her gün bir
ışınla dolan gözü. En sık şikâyeti ("her gün aynı ekran, bildik pano", 148 notun 43'ü) doğrudan karşılıyor: 1., 9., 30.
ve 68. günün gözleri birbirine benzemiyor. Ekran sade: tek odak, tek cümle, tek büyük düğme, yol katlanmış. Kopan seriyi
utandırmıyor ("68 gün"). Değerlendiricilerin B'de gördüğü zayıflıklar (açık temada soluk ilk günler, küçük ve genel
cümle, zayıf "yeni" haberi, 30. günün kutlanmaması, akşamın sabahtan ayrışmaması, küçük oynat dairesi, 30. ile 68. günün
aynı görünmesi) aşağıdaki aşılarla giderildi.

A'nın ve C'nin tamamı alınmadı: A her gün aynı sağ–sol çizimini gösterip başlıkla çelişiyor (9., 30., 68. gün), C sabah
kalabalık bir yol haritası. Onlardan yalnız değerlendiricilerin adıyla istediği parçalar alındı.

## 2. Aşılar (senaryo senaryo)

| # | Aşı (değerlendirici) | Kaynak yön | Uygulama |
|---|---|---|---|
| 1 | 7. ve 28. gün kilometre taşları irisin halkasında (1, 2) | C | Halkanın dışında mercek renginde küçük hap: "7. gün", "28. gün" (kısa ekranda yalnız sayı). Yeri, her gün gelinirse o ışının bugünden kaç gün sonra düşeceği (bugün tepede, saat yönünde). Tepeye 3 yuvadan yakın olan çizilmez ("bugün" yazısıyla çakışmasın; o günlerin cümlesi zaten söyler). 1. günde yalnız 7 görünür, 28'i cümle söyler ("28. gün yeniden bakacağız."). |
| 1 | Açık temada iris soluk, gri, "boş" (1, 5) | — | Taslak lifler açık temada vurgu renginde ve daha belirgin; gözün yeri çok hafif vurgu renginde; limbus çizgisi daha belirgin. |
| 1 | Günün cümlesi büyük ve kalın (5; 3'ün genel notu) | A | Cümle gövde yazısıyla 1,55rem, kalın (uzun 1. gün cümlesi 1,24rem); yardımcı satırlar ("Her gün bir ışın", açıklama) koyu ve bir boy büyük. |
| 2 | Hareketi gösteren çizim düz oynat dairesinin yerinde (1, 5) | A | Büyük düğmenin sağ üstünde durağın kendi çizimi (↔ sağ–sol, ↻ daire, ↕ yukarı–aşağı, E, ay); yoldaki çizimlerle aynı (`GLYPH`). |
| 2 | "Bugün yeni: ↔ sağ–sol bakış" büyük başlık (2, 3, 4) | A | 2. gün cümlesi "Bugün yeni: sağ–sol bakış." (plan öncelik 6), adın önünde satır içi çizim rozeti. |
| 3 | Haber satırında satır içi ikon rozeti, iri yazı (1) | A | Aynı rozet her "Bugün yeni" cümlesinde; 9. gün "Bugün yeni: ↻ daire." ve altında "Havada yavaşça büyük bir daire çiz." |
| 3 | "Başla · 1 dk" yazan geniş düğme (3, 4; 3'ün ve 4'ün genel notu) | A | Büyük düğmenin içinde tam genişlikte "▶ Başla" şeridi; kısa ekranda (≤ 740 pt yükseklik) sağda çizimli "Başla" sütunu. Süre durağın adında kalır ("Isınma · 1 dk"). |
| 3 | "Yeni" rozetli duraktan o durağa gitmek; "Bugünün yolu"nda "1 yeni" hapı (2, 5) | C | "Bugünün yolu" satırında "N yeni" hapı; satıra dokununca sayfa bugünün yeni durağına iner (yol sıralı olduğu için durak açılmaz, görünür olur; yolun mantığı değişmez). |
| 4 | "Bugün 30. gün: ilk ayını tamamlıyorsun." (1, 2, 3, 4, 5) | C | 30. gün cümlesi (kilometre taşı, öncelik 2). Yeni cümle: metin kapısına (§6). |
| 5 | Güncelleme gününde ilk söz yenilik: "Bugün yeni: yukarı–aşağı." (1, 3, 4, 5; 2 C'yi seçti) | A, C | Eski kullanıcının güncelleme gününde cümle "Bugün yeni: ↕ yukarı–aşağı." ve altında "Yukarı bak, aşağı bak, gözlerini kapat". "E testi günü" cümlesi ile "Isınma" düğmesinin çelişkisi kalktı (§5-2). |
| 5 | 30. ile 68. gün aynı görünüyor; yeni bir katman gerekli (2'nin ve 5'in genel notu) | — | Biten her tur (28 ışın) gözün dışına ince bir halka bırakır: 30. gün bir halka, 68. gün iki halka (en çok üç; §7). |
| 6 | Akşam bugünkü ışın parlasın, ışıma yaysın (1, 2) | C | Yol bitince bugünün ışını parlar, tepesinde mercek renginde yay ve beş kısa ışıltı çizgisi; "✓ bugün". |
| 6 | Akşamın sakin, koyu dalga görseli (3, 5) | A | Akşam ve serbest günde Dalga sakin bir kart (degrade iş düğmesi değil); üstünde durgun, koyu dalga görseli. |
| 6 | "Bu hafta 3 gün · hedef tamam" (3, 4) | C | Akşam cümlesinin altında yeşil tikle "3 gün bu hafta" (S0 Ç19 biçimi; yalnız hedef tutunca). |
| 6 | "Tamam" en büyük harflerle (4) | A | "Bugünkü yol tamam." büyük ve kalın. |

Alınmayanlar: 2. gün "✓ Dün 4/4 durak" (3): dünün emeğini ilk ışın ve göz bebeğindeki "1 gün" gösteriyor, cümle yeniliği
söylüyor; ikinci bir iddia satırı eklenmedi. Gece ışınların parlaklığını kısmak (3): akşamın ödül parıltısıyla çelişir,
yapılmadı; cihazda bakılmalı.

## 3. Ne değişti (yalnız sunuş)

**İlk görünüm artık ekran boyunda tek sahnedir** (`screens/Home.jsx` `.hf`): tarih ve selam, (varsa) çalışma şeridi ve
yoga sabah kartı (bugünkü yerinde, selamın altında), (varsa) görme uyarısı, göz, günün cümlesi, büyük düğme, "Bugünün
yolu" satırı. Sahne en az ekran boyudur; ardından gelen her şey ekranın altından başlar, son satır sekme çubuğunun 12 pt
üstünde biter. Gözün boyu sahneye sığdırılır (en az 132, en çok 336 pt; yoga kartı ya da uyarı olan sabahlarda göz
küçülür, düğme ilk görünümde kalır).

- **Göz** (`components/home/DayIris.jsx`, çizim `dayIrisDraw.js`, veri `dayRays.js`): kaydı olan her geçmiş gün bir ışın;
  ışının boyu o gün yapılan ayrı durak sayısı (en çok 10); bugünün yeri tepede, geçmiş saat yönünün tersine; seri ≥ 3
  günse mercek renginde seri yayı; bugün bir durak yapılınca bugünün ışını yanmaya başlar; yol bitince parlar. Göz bebeğinde
  tek sayı: hiç gün yokken "İlk gün", seri ≥ 3 ve gün sayısıyla aynıysa "N gün seri", değilse "N gün" (ayrışınca seri
  gözün altında hapta). Göze dokununca Gelişim açılır. Çizim dili uygulamanın iris dilidir (`lib/irisDraw.js` renkleri).
- **Günün tek cümlesi** (`components/home/dayLead.js`, `HomeGo.jsx` `HomeLead`): plan §3.F.4 tablosu, "ilk tutan kazanır"
  (§4). Görme uyarısında cümle yok; göz molası ve yürüme önerisinde önerinin satırı ("Gözlerin mola istiyor.").
- **Günün ilk açılışı kaydı** (`components/home/dayOpen.js`, `gozolcum:day-open`, plan §3.F.3): gün, ilk açılış ve ilk
  dokunuş saati, bugün ve dün yazılan önceliğin numarası. Cümle ilk dokunuşa kadar ya da en çok 1 saat görünür; bugün bir
  durak yapıldıysa ilk dokunuş olmuştur. Ana sayfadan açılan her şey ilk dokunuş sayılır.
- **Büyük düğme** (`HomeGo.jsx`): tek `<button>`; "Güne başla" (+ "Yeni"), durağın adı ve süresi, durağın ne olduğu
  (ölçümde kendi satırı, egzersizde adımlar: "Göz kırp, sağa bak, sola bak"), sağ üstte durağın çizimi, altta "▶ Başla".
  Ad yolun sıradaki durağından yazılır: "Sağ–sol bakış" (S0 kararı 4), ölçüm durağında süre yok (S0 kararı 22).
  Önceliği, rotası ve başlattığı mola kararı aynı (`homeSuggestion` → `startSuggest`).
- **"Bugünün yolu" satırı**: "N durak · ≈X dk" (sıfır yok; başlayınca "3/10 durak · ≈12 dk kaldı", bitince "✓ 10/10 durak"),
  "N yeni" hapı, aşağı ok. Dokununca yola iner.
- **İlk görünümden inenler**: sayı hapları ("N gün seri", "Bu hafta N/3 gün", "N gün seninle"; seri ve gün sayısı göz
  bebeğine geçti, hafta akşam cümlesinin altına ve yolun altına), "Bugün" kartı ve günün zinciri (`DayChain` nefesin
  bitişinde kullanılmaya devam ediyor, dosyası değişmedi), sakin seçenekler ("Nefes · 5 dk mola", "Dalga · sakinleş";
  sahnenin hemen altında), adım ve alarm hapları (iPhone; sahnenin hemen altında).
- **Görme uyarısı kartı** (kırmızı, sarı) "Ölçümlerin"in altından sahnenin başına çıktı (plan §3.F.3 "en üstte"); metni ve
  rolü aynı.
- **Sıfır kuralı** (S0 kararı 23): yolun altındaki hafta satırı sıfırken ("Bu hafta 0/3 gün") yazılmıyor.
- **Yol** (`components/TodayPath.jsx`): durak düğmesine `data-key` eklendi (satırdan yeni durağa inmek için). Çizim ve
  davranış aynı.
- **Stil** (`styles/home.css`): yeni bölüm "Ana sayfa 5 saniye yeniden tasarımı"; artık kullanılmayan "Bugün kartı"
  kuralları (`.hh-today`, `.hh-sum`, `.hh-min`, `.hh-cnt`, `.hh-nef*`, `.hh-go`) silindi. `styles.css`'e dokunulmadı.
  Renkler tokenlardan; iki tema tokenlardan. Sabit renkler yalnız her temada koyu kalan yüzeylerde: göz bebeğinin yazısı
  (koyu temanın `ink` değerleri) ve akşamın dalga görselinin gece zemini (çizgileri iris tokenlarından). Tuvalin renkleri
  `components/IrisMap.jsx` gibi temaya göre çizimdedir.
- Kullanılmayan `Aperture` bileşeni `Home.jsx`'ten silindi.

**Dosyalar.** Değişen: `screens/Home.jsx`, `components/TodayPath.jsx` (yalnız `data-key`), `styles/home.css`. Yeni:
`components/home/DayIris.jsx`, `HomeGo.jsx`, `dayIrisDraw.js`, `dayRays.js`, `dayLead.js`, `dayOpen.js` ve testleri
(`dayRays.test.js`, `dayLead.test.js`, `dayOpen.test.js`). Değişmeyen: `DayChain.jsx`, `CoachCard.jsx`, `todaypath.css`,
`styles.css`.

## 4. Yolun mantığı değişmedi

`lib/today.js`, `lib/progression.js`, `lib/ladders.js`, `lib/breathMix.js`, `lib/homeSuggest.js`, `lib/pathLater.js`,
`modules/*/manifest.js` açılmadı, değişmedi; `modules/pathModules.equiv.test.js` ve `lib/today.test.js`'e dokunulmadı.
Durakların sırası, sıralı açılma, büyük düğmenin önceliği (göz molası → sıradaki durak → Dalga), rotalar, mola kararı
(`startStop`, `startSuggest`), "Yeni" kuralı (`newStopKeys`), mola süresi, seri ve hafta sayıları aynen okunur.

Günün cümlesi için "dün yol tamamdı mı" (öncelik 7) dünün yolu gerçek yol koduyla (`buildPath`, `progressionCtx`)
dünün sonundaki kayıtlarla yeniden kurularak bulunur; hesap Ana sayfada kayıtlar ya da gün değişince bir kez yapılır.
Dikkat: `modules/routine/manifest.js` bugünün grup adlarını modülün içinde tutar (kilit ekranının "Devam: …" satırı); bu
yüzden dünün yolu bugünün yolundan önce kurulur (`Home.jsx`'teki sıra ve `dayLead.js` notu).

**Testler.** `npx vitest run`: 141 dosya, 1906 test, hepsi yeşil (son koşu). `npm run build` başarılı. Değişen beklentiler:
- `screens/Home.hero.test.jsx` yeniden yazıldı: eski dosya kalkan "Bugün kartı"nı (`hh-today`, `hh-min`, `hh-cnt`,
  günün zinciri `dc-s`, hap satırı `hh-chips`, Nef satırı `hh-nef`) sınıyordu. Yeni beklentiler aynı kuralları yeni sahnede
  sınar: sıfır yok ("İlk gün", "0/4" yok), zincir ve hap satırı yok, "gün seninle" yok, göz bebeğinde "N gün" / "N gün
  seri" (S0 kararı 24), ölçüm durağında süre yok (S0 kararı 22), düğmede "Başla", kurulum günü İlk Bakış cümlesi ve 7. gün
  işareti, göz molasında "Gözlerin mola istiyor.", bugün durak yapılınca cümlenin düşmesi ve "1/N durak · ≈X dk kaldı",
  hafta satırında sıfır yok. Yolun baloncuk, "Başla" ve TodayPath beklentileri aynen kaldı.
- `screens/Home.progression.test.jsx`: "dün yolu yapan kişi" testi `buildPath`'in ilk çağrısını okuyordu; Ana sayfa artık
  dünün yolunu da kurduğu için bugünün çağrısı "Sonra yaparım" kaydını taşıyan çağrı olarak bulunur. Beklentiler
  (pathDay 1, Yılan ve Bugünün görevi, "Yeni") aynı.
- `screens/Home.suggest.test.jsx` ve `Home.yoga.test.jsx` değişmeden yeşil (düğmenin yazısı "Nefes · 5 dk", "Yola devam
  et · Nefes · 1 dk", sakin seçenek "5 dk mola" aynı).
- Yeni: `components/home/dayRays.test.js` (ışınlar, göz bebeği, kilometre taşları, çizim yuvaları), `dayLead.test.js`
  (öncelik sırası, "aynı öncelik iki gün üst üste gelmez", onaylı cümleler, "Sağ–sol bakış", adım satırı, dünün yolu gerçek
  kodla), `dayOpen.test.js` (dünün önceliği, 1 saat, ilk dokunuş, bozuk depolama).

## 5. Günün cümlesi: uygulanan sıra

| Öncelik | Durum | Cümle |
|---|---|---|
| 0 | kırmızı ya da sarı görme uyarısı | yok; uyarı sahnenin başında |
| 1 | kurulum günü (18.00'den sonra kurulduysa ertesi gün), İlk Bakış kırpması > 0 | "İlk Bakış'ta 20 saniyede 3 kez kırptın. 28. gün yeniden bakacağız." |
| 2 | 7. gün / 30. gün / iris haritası 28. gün / E testi büyük düğmedeyse | "Bugün 7. gün: ilk haftanı tamamlıyorsun." / "Bugün 30. gün: ilk ayını tamamlıyorsun." / "Bugün 28. gün: iris haritan başlangıçla yan yana geliyor." / "Bugün haftalık E testi günü." |
| 3 | 2–13 gün aradan dönüş | "Kaldığın yerden: basamakların aynı." |
| 6 | bugün yeni durak (göz egzersizi önce, sonra yol sırası; nefes molası hariç) | "Bugün yeni: sağ–sol bakış." (+ durağın satırı; düğmenin durağıysa satır yok) |
| 2 | haftalık E testi günü, E testi düğmede değilse | "Bugün haftalık E testi günü." + "3 bölüm · sağ, sol, iki göz" |
| 7 | dün yolun bütün durakları bitti | "Dün yolunun bütün duraklarını tamamladın." |
| 8 | iris haritası 1–3 gün sonra | "İris haritan 3 gün sonra başlangıçla yan yana gelecek." |
| 9 | hiçbiri ya da cümlenin süresi doldu | Ana sayfa önerisinin satırı ("Bugünkü yol tamam.", "Bugün yol yok."); düğmeyi tekrar ediyorsa hiçbiri |

Aynı öncelik iki gün üst üste gelmez; 0, 1 ve 2 hariç (plan §3.F.4, S0 kararı 5). 4 (dünkü ilk ya da rekor) ve 5
(doğrulanmış değişim) uygulanmadı: ölçü kuralı v2'nin (Y2) işidir.

Altı senaryoda cümleler: 1. gün öncelik 1; 2. gün 6 ("Bugün yeni: sağ–sol bakış."); 9. gün 6 ("Bugün yeni: daire." +
"Havada yavaşça büyük bir daire çiz."); 30. gün 2 ("Bugün 30. gün: ilk ayını tamamlıyorsun."); eski kullanıcı 6 ("Bugün
yeni: yukarı–aşağı." + "Yukarı bak, aşağı bak, gözlerini kapat"); akşam 9 ("Bugünkü yol tamam." + "✓ 3 gün bu hafta").

## 6. Metin kapısına (yeni ya da yeni yerde kullanılan metinler)

Onaylı olup aynen kullanılanlar: tarih ve selamlar, plan §3.F.4 cümleleri, S0 kararı 5'in 7. gün cümlesi, `homeSuggest`
satırları ve üst başlıkları ("Güne başla", "Yola devam et", "Göz molası"), `WEEKLY_SUB`, "Bugünün yolu", "N durak · ≈X dk",
"Sağ–sol bakış" (S0 4), "N gün seri", "3 gün bu hafta" + tik (S0 Ç19), "Yeni", "İstersen Dalga ile gevşe".

Metin kapısına gidenler:
1. "Bugün 30. gün: ilk ayını tamamlıyorsun." (30. gün kilometre taşı; Yön C'den, beş değerlendiricinin beşi istedi; S0
   kararı 5'in 7. gün kalıbı. Plan §3.F.5'te 30. gün kilometre taşı olarak geçmiyor.)
2. "Bugün yeni: daire." ve "Bugün yeni: yukarı–aşağı." (plan öncelik 6 kalıbının doldurulmuşları; ad, durağın adının
   küçük harfle yazılışı).
3. "Havada yavaşça büyük bir daire çiz." (`EXERCISES.circleCw.sub` + nokta; "Bugün yeni: daire."nin alt satırı).
4. Egzersiz durağının adım satırı, `EXERCISES` adlarından: "Göz kırp, sağa bak, sola bak" (Isınma), "Sağa bak, sola bak,
   gözlerini kapat" (Sağ–sol bakış), "Yukarı bak, aşağı bak, gözlerini kapat" (Yukarı–aşağı) vb.
5. "Her gün bir ışın" (gözün altı).
6. "bugün" (gözün tepesi; yol bitince "✓ bugün").
7. "İlk gün" (göz bebeği; hiç gün yokken, sıfır yerine) ve "N gün" (göz bebeği; "N gün seninle"nin kısası).
8. "7. gün", "28. gün" (halkadaki kilometre taşı hapları; kısa ekranda "7", "28").
9. "Başla" (büyük düğmenin şeridi; uygulamada başka düğmelerde de var, bu yerde yeni).
10. "N yeni" ("Bugünün yolu" satırındaki hap).
11. "N/M durak · ≈X dk kaldı" (yol başlayınca satır; önceki kartın "≈X dk kaldı" ve "N/M durak"ının birleşimi).
12. Ekran okuyucu etiketleri: "Gözün: 8 gün seri. Her gün bir ışın; bugünün ışını da yandı. Gelişim'i aç." ve "Bugünün
    yolu: 10 durak · ≈15 dk, 1 yeni. Yola in".

Sağlık iddiası yok: hiçbir metin etki, iyileşme ya da sağlık söylemez; karşılaştırma yalnız kişinin kendi günleri.

## 7. Gerçek ekranlar

Çekim: `bash …/ana-5sn/duzenek/cek.sh …/ana-5sn/shots` (gerçek uygulama, gerçek yol koduyla kurulan kayıtlar; 6 senaryo ×
390 × 844 ve 320 × 640 × açık ve koyu = 24 görüntü; `shots/INDEX.md`). Sunucu betiğin içinde PID ile kapandı. Birleşik
bakış: `…/ana-5sn/sheet390.png`, `sheet320.png`.

Denetim (24/24): yatay taşma yok; sekme çubuğunun altında yazı yok; 44 pt altı dokunma alanı yok; açılış kaydırması yok;
açık tema kenar parlaklığı 245, koyu 11–12 (temalar doğru); sayfa ve konsol hatası yok. Her görüntüye tek tek bakıldı.
390 × 844'te gözün kutusu ≈ 300 pt (y 133–447; irisin kendisi ≈ 250 pt), büyük düğme y ≈ 544–700, "Bugünün yolu" satırı
sekme çubuğunun (y 775) 12 pt üstünde biter. 320 × 640'ta gözün kutusu ≈ 130–205 pt (cümlenin uzunluğuna göre), düğme tek
satır (çizim ve "Başla" sağda), yol satırı çubuğun (y 571) üstünde; 2. gün "Sağ–sol bakış · 1 dk" iki satıra "Sağ–sol" /
"bakış · 1 dk" diye bölünür. Ek bakış (`…/ana-5sn/tam/`): ilk görünümün altı (sakin seçenekler, "Bugünün yolu" başlığı,
yol) yerinde; 9. günde satıra dokununca sayfa "Yeni" Daire durağına iner; tarayıcıda `gozolcum:day-open` kaydı
`{ day, firstAt, firstTapAt: null, lead: 6, prev: null }` olarak yazıldı; sayfa ve konsol hatası yok.

## 8. Dürüst sınırlar ve açık noktalar

1. **5 saniye sınaması bu işte yapılmadı.** Gerçek ekranlar sahibe gitmeden önce bağımsız değerlendiricilere gösterilmeli
   (bağlayıcı kural).
2. **Cihazda görülmedi.** Web Chromium'da çekildi; iPhone'a özgü öğeler (yoga sabah kartı, hatırlatma kartı, adım ve
   alarm hapları, deneme şeridi) düzenekte çizilmez. Yoga sabah kartı olan sabah göz küçülür; cihazda bakılmalı.
3. **"Tüm verileri sil" `gozolcum:day-open`'ı silmez**: silme listesi `App.jsx` ve manifestlerin `storageKeys`'inde, ikisi
   de bu işte değişmez. Kayıt kişisel veri taşımaz (gün, iki saat, iki öncelik numarası; cümle yazılmaz). Bir sonraki
   `App.jsx` ya da manifest işinde listeye eklenmeli.
4. **Öncelik sırasında tek sapma**: "Bugün haftalık E testi günü." (öncelik 2) E testi büyük düğmenin durağı değilse
   "Bugün yeni"nin (6) ardına düşer. Gerekçe: dört değerlendirici güncelleme gününde ilk sözün yenilik olmasını istedi;
   "E testi günü" yazıp "Isınma"yı başlatan düğme çelişki diye okundu. Onay gerekir.
5. **Tur halkaları en çok üç** (84 günden sonra halka sayısı artmaz); daha uzun kullanımda gözün nasıl büyüyeceği ayrı bir
   tasarım sorusu.
6. **Işın boyu** gün başına ayrı kayıt türünden sayılır (egzersiz grubu, oyun, ölçüm türü); yolda olmayan kayıtlar da
   (ör. yoldan açılmamış bir oyun) bir durak sayılır.
7. **Kilometre taşı hapları ışın sırasıdır** (7. ve 28. kayıtlı gün); ara veren kişide takvimdeki 7. günle ayrışabilir.
   Cümleler (7. gün, 30. gün) takvim günüyle (kurulum günü 1. gün) yazılır.
8. **Öncelik 4 ve 5 yok** (Y2'ye bağlı). **S0 Ç20** (Nef kartı haftayı söylüyorsa yolun altındaki hafta satırı yazılmaz)
   bu işte yapılmadı.
9. **Hareketi Azalt**: göz durgundur; yalnız ilk çizimde 0,6 sn yumuşak beliriş vardır, Hareketi Azalt açıkken yoktur.
   Sayfa kaydırması (satırdan yola iniş) Hareketi Azalt'ta anlıktır.
10. **Başarım**: tuvalde en çok ≈ 1.100 taslak lif ve dolu yuva başına 96–192 lif; göz boyu ya da tema değişince yeniden
    çizilir. Cihazda ölçülmedi.
11. **Yoga testleri**: bir ara koşuda `modules/yoga/Yoga.test.jsx`'in 8 testi kırmızıydı; o dosyalar başka bir iş
    akışında o sırada değişiyordu (dosya saatleri 13.51–13.54). Bu iş yoga dosyalarına dokunmadı; bekleyip yeniden koşunca
    bütün takım yeşil.

## 9. Kapı turu 1 (30 Eylül 2026): 1. gün geçmedi → kök neden ve düzeltme

**Sonuç.** Beş değerlendiricinin yalnız biri 1. günün ilk görünümünden etkilendi (1/5). Öteki senaryolar bu turda
kapıda değildi. Notlarda beş ortak neden vardı:

| # | Değerlendiricilerin gördüğü | Kök neden |
|---|---|---|
| A | İlk günün gözü sönük, "gri bir tel yumağı", "zaten dolu"; bugünün ışını açık temada seçilmiyor, hiçbir yeri parlamıyor (1, 2, 4, 5) | 1. günde yanan ışın yoktu (İlk Bakış kayıt sayılmıyordu); gözün tamamı sık, gri-turkuaz taslak liflerle doluydu |
| B | Üç ayrı gün sayısı: göz bebeğinde "İlk gün", halkada anlaşılmayan turuncu "7. gün", cümlede "28. gün" (5/5) | Kilometre taşı hapı ilk günde de çiziliyordu; günün cümlesi bir gün sayısı daha taşıyordu |
| C | "20 saniyede 3 kez kırptın" iyi mi kötü mü, söylemiyor; "İlk Bakış" bir ad (5/5) | Cümle sayıyı veriyor, anlamını vermiyordu; onaylı anlam cümlesi yalnız İlk Bakış'ın sonuç ekranındaydı |
| D | İlk iş "Haftalık E testi": ilk günde "haftalık" tuhaf, "E testi" teknik, daire içindeki "E" anlamsız; muayene hissi (1, 2, 3, 5) | Düğme yolun adını aynen yazıyordu; ne yapılacağını söyleyen satır yoktu |
| E | Koyu temada kart fazla parlak turkuaz, "Başla" orta mavide soluk (3) | Düğme her iki temada vurgu degradesiyle çiziliyordu |

**Düzeltme (yalnız sunuş).**
- A · **İlk Bakış gözün ilk ışınını yakar** (`components/home/dayRays.js` `lookDates`, `todayRayN`): İlk Bakış o günün
  bir durağı sayılır (profilde `firstLook.date`, iris haritasının başlangıcı ve yenilemesi). Kurulum günü bugünün ışını
  yanar; ertesi gün o ışın yerinde kalır (hiçbir ışın sönmez). Kayıt değildir: seriye, haftaya, yola, günün cümlesinin
  "bugün durak yapıldı" ve "aradan dönüş" hesabına girmez. Göz bebeğine yalnız bugünden önceki, kaydı olmayan İlk Bakış
  günü eklenir (1. gün yine "İlk gün").
  Çizim (`dayIrisDraw.js`): taslak lifler yarı yoğunlukta ve irisin renklerinde (turkuaz, mavi; gri değil), açık temada
  zemin turkuazdan maviye yumuşak degrade; bugünün yanan ışınına açık renkli parlak lifler ve çevresine ışıma; bugünün
  dilimi ince bir vurgu çizgisiyle çevrilir (ışının dolacağı yer bir bakışta seçilir), dilimin rengi yanan ışının üstüne
  binmez.
- B · **İlk günde halkada kilometre taşı yok** (`milestoneSlots(0)` boş; 2. günden sonrası aynı). Cümledeki "28. gün"
  "4 hafta sonra" oldu (iris haritası kurulumdan 28 gün sonra yenilenir, `RECHECK_DAYS`). İlk günün ekranında tek gün
  sözü göz bebeğindeki "İlk gün".
- C · **Günün cümlesi ikiye bölündü** (`dayLead.js` `LINES.first`, `firstSub`): büyük satır "20 saniyede 3 kez göz
  kırptın." (sayı "kez"den bölünmez), altında "Senin sayın bir yargı değil, bir başlangıç. 4 hafta sonra yeniden
  bakacağız." İlk cümle İlk Bakış sonuç ekranının onaylı cümlesidir (`lib/firstLookText.js`). "İlk Bakış" adı ilk
  görünümden kalktı. Öncelik (1) ve koşulu aynı.
- D · **Büyük düğmede haftalık E testi** (`dayLead.js` `goFace`, `HomeGo.jsx`): "E testi" ve yanında "haftada bir"
  etiketi, satırı "E hangi yöne bakıyor?"; çizim ortada E, dört yanında yön okları. Yarım kalmış testte satır aynen
  ("Kalan: …"). Ölçüm durağında süre yine yok (S0 kararı 22). Yoldaki durağın adı ("Haftalık E testi"), satırı ve günün
  cümlesi ("Bugün haftalık E testi günü.") değişmedi.
- E · **Düğmenin renkleri yerel tokenlarda** (`styles/home.css` `.hf` `--go-*`, açık ve koyu): açık temada iris degradesi
  ve beyaz yazı, "Başla" beyaz şerit, vurgu renginde yazı; koyu temada kart derin iris renginde (koyu turkuazdan koyu
  maviye) ve açık yazılı, "Başla" parlak vurgu renginde koyu yazılı. 320 pt'deki sağ "Başla" sütunu da aynı tokenları
  okur. `styles.css`'e dokunulmadı.

**Yolun mantığı değişmedi.** `lib/today.js`, `lib/progression.js`, `lib/ladders.js`, `lib/breathMix.js`,
`lib/homeSuggest.js`, `lib/pathLater.js`, `modules/*/manifest.js` açılmadı; 1. günün ilk işi yine haftalık E testidir,
düğmenin önceliği ve rotası aynı. Yoga dosyalarına, `App.jsx`'e, `lib/releases.js`'e, `site/` ve `ios/` altına
dokunulmadı; yoga sabah kartı yerinde.

**Dosyalar.** Değişen: `components/home/dayRays.js`, `dayIrisDraw.js`, `dayLead.js`, `HomeGo.jsx`, `screens/Home.jsx`,
`styles/home.css`; testler `components/home/dayRays.test.js`, `dayLead.test.js`, `screens/Home.hero.test.jsx` (yeni
beklentiler: İlk Bakış ışını ve gözün etiketi "ilk ışının yandı", ilk günde halkada işaret yok, cümle ve alt satırı,
düğmede "E testi", "haftada bir", "E hangi yöne bakıyor?"). `npx vitest run`: 141 dosya, 1909 test, hepsi yeşil;
`npm run build` başarılı.

**Öteki senaryolara etkisi (bakıldı).** Taslak liflerin azalması ve bugünün dilim çizgisi 2., 9., 30. gün ve eski
kullanıcının gözünde de var (yanan ışınlar daha seçik); düğmenin yeni renkleri her senaryoda. Eski kullanıcının göz
bebeği "68 gün"den "69 gün"e çıktı: kurulum günü kaydı yoktu, İlk Bakış'ı vardı; artık o gün de sayılıyor. Akşam (6)
değişmedi (yol bitmiş: parıltı ve Dalga kartı aynı).

**Gerçek ekranlar.** `bash …/ana-5sn/duzenek/cek.sh …/ana-5sn/shots` (24 görüntü; `shots/INDEX.md`, birleşik bakış
`sheet390.png`, `sheet320.png`); sunucu betiğin içinde PID ile kapandı. Denetim 24/24: yatay taşma yok, sekme
çubuğunun altında yazı yok, 44 pt altı dokunma alanı yok, açılış kaydırması yok, temalar pikselden doğru (açık kenar 245,
koyu 11). Her görüntüye bakıldı. 1. gün 390 × 844: gözün kutusu y 133–413 (≈ 280 pt), tepedeki ışın iki temada da parlak
bir demet; cümle tek satır, alt satır iki satır; düğme üç satır ve "Başla" şeridi. 320 × 640: göz en küçük boyda (kutu
132 pt), cümle "20 saniyede / 3 kez göz kırptın.", düğme tek satır ve sağda çizimli "Başla".

**Metin kapısına (bu tur).**
1. "20 saniyede 3 kez göz kırptın." (plan §3.F.4 öncelik 1 cümlesinin ilk yarısı; "İlk Bakış'ta" düştü, "göz" eklendi).
2. "Senin sayın bir yargı değil, bir başlangıç. 4 hafta sonra yeniden bakacağız." (ilk cümle onaylı, İlk Bakış sonuç
   ekranından; ikincisi plandaki "28. gün yeniden bakacağız."ın gün sayısız hâli).
3. Büyük düğmede "E testi" + "haftada bir" (onaylı ad "Haftalık E testi" düğmede ikiye bölündü; "haftada bir" sürüm
   notunun sözü). Adın her yerde aynı olması kararı (`modules/weekly/manifest.js`) yolda korunuyor; düğmedeki bölünme
   onay ister.
4. "E hangi yöne bakıyor?" (sitenin onaylı düğme metninden, S0 Ç11; uygulamada bu yerde yeni).
5. Ekran okuyucu: "Gözün: bugün ilk günün. Her gün bir ışın; ilk ışının yandı. Gelişim'i aç."

**Dürüst sınırlar.** 5 saniye sınaması bu düzeltmeden sonra yeniden yapılmadı (bir sonraki kapı turunun işi). İlk günün
ilk işi hâlâ bir ölçüm (yolun mantığı; sahibin 2026-09-29 kararı) ve düğmede süre yok (S0 kararı 22); değerlendirici 2'nin
"önce muayene" notu ancak bu kararlarla çözülür. 320 × 640'ta göz en küçük boyunda, ışın küçük. Cihazda görülmedi.

## 10. Kapı turu 2 (30 Eylül 2026): 2. gün ve eski kullanıcı geçmedi → kök neden ve düzeltme

**Sonuç.** 2. günün ilk görünümü 1/5, eski kullanıcının güncelleme günü 2/5. Notlarda dört ortak neden vardı:

| # | Değerlendiricilerin gördüğü | Kök neden |
|---|---|---|
| A | Göz bebeğinde "1 gün", halkada turuncu "7. gün": "hangi gündeyim?", "hedef mi, rozet mi?" (2. gün 5/5); "69 neyi sayıyor?" (eski 1) | İlk görünümde iki ayrı gün sayısı vardı: halkadaki kilometre taşı hapı (ışın sırası) ve göz bebeğindeki sayı; göz bebeği yalnız "N gün" yazıyor, neyin günü olduğunu söylemiyordu |
| B | "Bugün yeni: sağ–sol bakış" başlığı hemen altındaki kartta "Yeni · Sağ–sol bakış" diye tekrarlanıyor, üstüne "5 yeni" (2. gün 3/5); "5 yeni: bugün 5 yeni şey mi öğreneceğim?" (1) | Günün cümlesi büyük düğmenin durağını haber veriyordu; düğme de aynı haberi "Yeni" rozetiyle veriyordu; yol satırının hapı üçüncü kez söylüyordu |
| C | Güncelleme günü görünmüyor, 30. günün aynısı; tek iz küçük "3 yeni" (eski 4/5) | Güncelleme günü için ayrı bir yüz yoktu; cümle öteki günlerin "Bugün yeni: X." kalıbını kullanıyordu |
| D | Başlık "yukarı–aşağı" (↕) diyor, düğme ↔ çizimli "Isınma"yı başlatıyor: "üç ayrı hareket, hangisi bugünkü iş?" (eski 4/5) | Güncelleme gününde cümle tek bir hareketi adıyla ve çizimiyle öne çıkarıyordu; o hareket düğmenin durağı değildi |

**Düzeltme (yalnız sunuş).**
- A · **Halkada kilometre taşı yok** (`components/home/DayIris.jsx`; `dayRays.js` `milestoneSlots`, `dayIrisDraw.js`
  `markerPos` ve `.hi-mark` stilleri silindi). İlk görünümde tek gün sayısı göz bebeğindedir; 7., 28. ve 30. gün o günün
  cümlesiyle söylenir (öncelik 2, değişmedi). **Göz bebeği "N gün seninle"** yazar (`dayRays.js` `pupilOf`; plan §3.F.3
  ve S0 kararı 24'ün onaylı ifadesi); seri ≥ 3 ve aynı sayıysa yine "N gün seri", 1. günde yine "İlk gün". 320 pt'de
  "gün" / "seninle" iki satıra iner (`.hi-pupil small` göz bebeğinin genişliğine sığar).
- B · **Cümle büyük düğmeyi tekrar etmez** (`dayLead.js` `leadCandidates`; öncelik 9'daki "düğmeyi tekrar ediyorsa
  hiçbiri" kuralının genişletilmesi). Bugünün yeni durağı düğmenin durağıysa haberi düğme verir ("Yeni" rozeti) ve "Bugün
  yeni" adayı yazılmaz; sıradaki aday gelir. 2. gün cümlesi böylece "Dün yolunun bütün duraklarını tamamladın." olur
  (plan öncelik 7, onaylı): dünün ışınını anlatır, düğme bugünün yenisini. Aynı kural haftalık E testine de uygulanır:
  E testi düğmedeyse ("E testi · haftada bir") "Bugün haftalık E testi günü." yazılmaz. Düğme yolun durağını
  göstermiyorsa (göz molası, yürüme) haber cümlede kalır (`Home.jsx` `leadCandidates`'e düğmenin durağını `plan.next`
  olarak verir). **"N yeni" hapı**, yenilik ilk görünümde zaten söyleniyorsa yazılmaz: düğmenin durağı yeniyse ya da
  cümle güncelleme gününün yenilerini sayıyorsa (`Home.jsx` `newCount`). 9. günde (düğme Isınma, yeni Daire) hap
  "1 yeni" olarak kalır; yoldaki "Yeni" rozetleri aynı.
- C, D · **Güncelleme günü kendi cümlesiyle** (`dayLead.js` `LINES.update`, `newsStops`; `HomeGo.jsx` `HomeLead`
  `lead.list`; `styles/home.css` `.hl-list`, `.hl-item`). Eski kullanıcının güncelleme gününde (`lib/progression.js`
  `updateDay`, yalnız okunur) büyük satır "Yolun yenilendi.", altında "Bugün yeni:" ve bugünün yeni durakları yol
  sırasıyla, yoldaki çizimleri ve adlarıyla hap olarak (en çok üç; nefes molası hariç, "Bugünün ritmi"ni nefes ekranı
  söyler). Tek bir hareket öne çıkmaz, cümle düğmeyle yarışmaz: düğme yine yolun ilk durağını ("Isınma") başlatır.
  Öncelik 2 (kilometre taşı; günde bir kez olur, tekrar kuralı dışında), 7., 30. gün ve iris 28. gün cümlelerinden
  sonra, "Kaldığın yerden"den önce. Bu senaryoda "Bugün yeni:" altında ↕ Yukarı–aşağı ve Bugünün görevi.

**Yolun mantığı değişmedi.** `lib/today.js`, `lib/progression.js` (yalnız `updateDay` okundu), `lib/ladders.js`,
`lib/breathMix.js`, `lib/homeSuggest.js`, `lib/pathLater.js`, `modules/*/manifest.js` açılmadı; düğmenin önceliği,
rotası, "Yeni" kuralı (`newStopKeys`) aynı. Yoga dosyalarına, `YogaMorningCard`'a, `App.jsx`'e, `lib/releases.js`'e,
`site/` ve `ios/` altına dokunulmadı; yoga sabah kartı yerinde.

**Dosyalar.** Değişen: `components/home/dayLead.js`, `dayRays.js`, `DayIris.jsx`, `dayIrisDraw.js`, `HomeGo.jsx`,
`screens/Home.jsx`, `styles/home.css`; testler `components/home/dayLead.test.js` (düğmeyi tekrar etmeme, E testi
düğmedeyken cümle yok, güncelleme günü listesi), `dayRays.test.js` (kilometre taşı testleri çıktı, "gün seninle"),
`screens/Home.hero.test.jsx` (1. gün profilsizken cümle yok, göz bebeğinde "2 gün seninle", halkada işaret yok).
`npx vitest run`: 142 dosya, 2047 test, hepsi yeşil; `npm run build` başarılı.

**Gerçek ekranlar.** `bash …/ana-5sn/duzenek/cek.sh …/ana-5sn/shots` (24 görüntü; `shots/INDEX.md`, birleşik bakış
`sheet390.png`, `sheet320.png`: üst sıra açık, alt sıra koyu); sunucu betiğin içinde PID ile kapandı. Denetim 24/24:
yatay taşma yok, sekme çubuğunun altında yazı yok, 44 pt altı dokunma alanı yok, açılış kaydırması yok, temalar pikselden
doğru (açık kenar 245, koyu 11), sayfa ve konsol hatası yok. Her görüntüye bakıldı.
- 2. gün 390 × 844: göz bebeğinde "1 / gün seninle", halkada işaret yok; cümle "Dün yolunun bütün duraklarını
  tamamladın." (iki satır); düğme "Güne başla · Yeni · Sağ–sol bakış · 1 dk"; yol satırı "7 durak · ≈11 dk", hap yok.
  320 × 640: göz bebeği "1 / gün / seninle", aynı düzen.
- Eski kullanıcı 390 × 844: "69 / gün seninle", "Her gün bir ışın · 14 gün seri"; "Yolun yenilendi."; "Bugün yeni:"
  ve tek satırda iki hap (↕ Yukarı–aşağı, Bugünün görevi); düğme Isınma; yol satırı "10 durak · ≈17 dk", hap yok.
  320 × 640'ta da haplar tek satır.
- 1., 9., 30. gün ve akşam: halkadaki "28. gün" / "7. gün" işaretleri kalktı; öteki her şey aynı. 9. günün cümlesi yine
  "Bugün yeni: daire." (düğme Isınma), hap "1 yeni".

**Düzenek notu (bu işten değil).** Yoga iş akışı bu tur sırasında yoga derslerini yayımladı (`lib/yogaLessons.js`
14.40): düzenek geçmişi gerçek yol koduyla kurduğu için yoga artık geçmiş günlerin yoluna giriyor. Bu yüzden 9., 30. gün
ve akşamın yolu 10 yerine 11 durak (≈18 dk), eski kullanıcının geçmişinde yoga kayıtları var ve serisi 14 gün ("14 gün
seri" hapı ve seri yayı ilk kez görünüyor; önceki turda seri 3'ün altındaydı). Bu iş yoga dosyalarına dokunmadı.

**Metin kapısına (bu tur).**
1. "Yolun yenilendi." (eski kullanıcının güncelleme günü, öncelik 2; yeni cümle).
2. "Bugün yeni:" + durak hapları (onaylı öncelik 6 kalıbının başı; adlar yoldaki gibi: "Yukarı–aşağı", "Bugünün görevi").
3. Göz bebeğinde "N gün seninle" (onaylı; "N gün"ün yerine).
4. Kural değişikliği, onay ister: E testi düğmedeyken "Bugün haftalık E testi günü." yazılmaz; yeni durak düğmedeyse
   "Bugün yeni: …" yazılmaz (plan §3.F.3 tablosu 2. gün için cümle ve rozetin ikisini birden öngörüyordu; beş
   değerlendiricinin üçü bunu tekrar diye okudu).

**Dürüst sınırlar.** 5 saniye sınaması bu düzeltmeden sonra yeniden yapılmadı (bir sonraki kapı turunun işi). Eski
kullanıcının yolu hâlâ ≈17 dk (yolun mantığı; iki değerlendirici "birkaç dakikama uymuyor" dedi; "Sonra yaparım" yolun
içinde, ilk görünümde değil). 2. günün gözü hâlâ büyük ölçüde boş (28 günlük turun ikinci günü; iki değerlendirici).
Isınma'nın çizimi yolda da ↔ (`lib/ladders.js`, değişmez). Güncelleme günü düzenekte yalnız bir eski kullanıcı geçmişiyle
görüldü; cihazda görülmedi.
