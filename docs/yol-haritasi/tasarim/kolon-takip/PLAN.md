# Kelime İzi · plan (sürüm 1, 2026-10-02)

Sahibin isteği: `../kolonlar/SAHIP_ISTEGI.md`. Sahibin 2026-10-02 cevapları, kelimesi kelimesine:
"1 evet- 2 mantıklı onay 3 3 mantıklı 4 olabilir 5 etkileemk için kullanıcyı kullanılsın derim ama yine sen bilirsin
5 sn kuralı. 6 Kelime izi diyelim"

Okunuşu: (1) "k/d" kelime/dakika. (2) Takibi kelime değişimini yakalamakla doğrulama onaylı. (3) Hız 120–300 kelime/dk
aralığında onaylı. (4) Turda tek kelimeden ızgara olabilir. (5) Kamera: sahip kullanılmasını istiyor, kararı bana
bıraktı; karar §6'da. (6) Modülün adı **Kelime İzi**.

Sahibin 2026-10-02 ikinci cevabı, kelimesi kelimesine: "önerilerin tamam 5 saniye kuralı önemli.. kişiler etikenmeli".
Onaylanan üç öneri: (a) üçüncü durağan kapı turu yok, kapı cihazdaki hareketli ekranla (§7); (b) iddia cümlesi
değişmez, yalnız ilk turda görünür, sonra "Neye dayanıyor?" içinde; (c) birim "kelime/dk" kalır, sonuç başlığı
"Bugün geçtiğin en yüksek hız".

Dayanaklar: `arastirma/KAYNAKLAR.md` (11 kaynak, PMID ve DOI PubMed ile doğrulandı), maket `maket/maket.html`, kapı
kayıtları `kapi/`, metinler `METINLER.md`.

## 0. Tek bakışta

| Örnek uygulama (yalnız mantık) | Kelime İzi |
|---|---|
| İşaretli kelime ızgarada ilerler, hız ileri bölümlerde artar | Aynı temel mantık |
| Kişinin gerçekten izleyip izlemediği bilinmez | İşaretli kelime bir an benzer bir kelimeye döner; kişi dokunur. Hız ancak yakalanırsa artar |
| Hız sabit bölümlerle artar | Hız kişiye göre: geçilen bölümde +20, geçilmeyende −20; ertesi tur ısınarak başlar |
| Ölçü yok | Gelişim merkezinde "Geçtiğin en yüksek hız", ölçü kuralı v2 ile, Gelişim'in dört sözcüğüyle |
| İz yok | İşaretin geçtiği son üç hücrede sönen iz: gözün yolu görünür |
| Nef yok | Nef ilk gün tanıtır, yeni en yüksek hızı ve doğrulanmış değişimi söyler |
| Kamera yok | İsteğe bağlı kamera: sonuçta "göz izin" çizgisi; ölçüye ve hükme girmez (§6) |

Kopya değil: ad, görsel, renk, düzen, metin ve puan sistemi alınmadı. Görsel dil uygulamanın kendi belirteçleri
(`styles.css`, `styles/exercise.css`): açık ve koyu tema, turkuaz işaret, Unbounded ve Onest yazı.

İddia sınırı: "Bu bir göz takip alıştırması. Okuma hızını artırdığı gösterilmedi." Kanıtın söylediği: hızlı okuma
uygulamalarının okuma hızını anlama kaybı olmadan katlayamadığı (Rayner 2016), alıştırılan görevde ilerleme beklenir,
günlük hayata aktarım için kanıt zayıf (Simons 2016). Ekranda yalnız bu alıştırmadaki hız geçer.

## 1. Tur yapısı (≈ 2 dk)

### 1.1 Izgara
- Turda tek kelime; ızgaranın bütün hücreleri aynı kelime. Kelime havuzu `METINLER.md` §K (sahip onaylı liste),
  her tur tohumla seçilir, son 3 turdakiler tekrar etmez.
- Sütun: 390 pt'de 4, 340 pt altında 3. Satır ekran yüksekliğine göre: 844'te 11, 568'de 7. Yazı 26 pt (dar ekranda
  22). Aralık geniş tutulur, çünkü tekrar eden desen kalabalık etkisi yapar (Rosen 2015); dar ekranda sütun azalır, aralık
  daralmaz.
- İşaret okuma düzeninde ilerler: satırda soldan sağa, satır bitince alttaki satırın başına. Izgara bitince yeni
  ızgara aynı kelimeyle baştan. İşaret hücreden hücreye **sıçrar**, kaymaz: okumadaki sakkad ve fiksasyon düzenine
  benzer (Rayner 1998).
- İz: işaretin geçtiği son üç hücrenin altında sönen turkuaz çizgi (opaklık 0,75 / 0,45 / 0,2), yalnız işaretin
  satırında; üst satıra ve ileriye çizilmez. Yazılar işarete uzaklıkla söner (odak ışığı: işaret 1, en uzak 0,28).
  Kapı tur 1: iz hapları ayrı hedef gibi okundu; tur 2: üst satırdaki iz ileride gibi göründü.
- Ritim bölüm boyunca sabittir: kelime başına süre = 60 000 / hız ms (`lib/firstLook.js` `msPerWord` ile aynı formül;
  yeniden kullanılır). Sabit ritim önceden bakmayı mümkün kılar (Wong 2011; Carpenter 1995). Zamanlama
  `requestAnimationFrame` ve `performance.now()` ile; sapma birikmez, her adımın zamanı başlangıçtan hesaplanır.

### 1.2 Değişim ve dokunma (takibin kanıtı)
- Her bölümde 3 değişim. İşaret bir hücreye geldiğinde o hücredeki kelime **bir harfi farklı** gerçek bir kelimeye
  döner (Kale → Kare). İşaret ayrılınca hücre eski kelimeye döner. Değişim yalnız işaretliyken görünür; bu yüzden
  ancak izleyen kişi görür.
- Değişim bölümün ilk 4 sn'sinde ve son 2 sn'sinde olmaz; iki değişim arasında en az 6 kelime. Yerleri tohumla.
- Dokunma ekranın herhangi bir yerine. Değişimin başladığı andan sonraki 1500 ms içinde dokunma = yakaladı.
  Pencere dışındaki dokunma = yanlış dokunuş. VARSAYIM: 1500 ms (tepki süresi ile işaretin sonraki hücreye geçmesi
  arasında; cihazda ayarlanacak).
- Geri bildirim: yakalanınca dokunulan yerde altın halka ve "Yakaladın", hafif titreşim. Kaçırılınca hiçbir şey
  gösterilmez (oyunu bölmez). Yanlış dokunuşta yalnız hafif titreşim.
- Değişim kelimesi çiftleri `METINLER.md` §K'de; ikisi de gerçek ve yaygın Türkçe kelime, harf sayısı aynı.

### 1.3 Bölümler ve hız merdiveni (tur içinde)
- 3 bölüm × 36 sn ≈ 2 dk (bölüm arası 4 sn: "Bölüm 2 · 160 kelime/dk").
- Bölüm geçti: 3 değişimden en az 2'si yakalandı ve yanlış dokunuş en çok 1. Geçti → sonraki bölüm +20 kelime/dk.
  Geçmedi → −20. Sınırlar 120 ve 300.
- Turun ilk bölümü: son turun geçilen en yüksek hızından 20 aşağı (ısınma). İlk tur 140. VARSAYIM: adım 20, başlangıç
  140; dayanak IReST ortalaması 184 ± 29 k/dk (Trauzettel-Klosinski 2012) ve yaşlılarda ≈ 167–170 (Altpeter 2015).
  Merdiven bu bandın altından başlar, yaşa göre ayar gerekmez; yaş sorulmaz (Munoz 1998, Peltsch 2011 yaşla sakkad
  başlatmanın yavaşladığını gösterir, merdiven kendiliğinden uyar).
- Tavan 300: göz her kelimeye gitmek zorunda kalınca hız sayfa okuma bandında tıkanıyor (Rubin 1992). Üstüne çıkmak
  takibi çevre görüşe bırakır; bu alıştırmanın amacı dışında. VARSAYIM.

## 2. İlerleyiş (günlere göre)

Merdiven `lib/ladders.js` biçiminde; `D` = modülün yapıldığı ayrı gün sayısı. Manifestte `progression.ladder` ile
(modül kendi merdivenini taşır, `ownLadder`).

| Basamak | from (D) | Ne açılır |
|---|---|---|
| K1 | 0 | Okuma düzeni, 4 harfli kelimeler |
| K2 | 3 | 5 harfli kelimeler |
| K3 | 7 | Sütun düzeni: işaret yukarıdan aşağı, sütun bitince sağdaki sütunun başına |
| çeşitleme V1 | 14 | Değişim harfi kelimenin ortasında (daha ince fark) |

Eşikler VARSAYIM. Hız merdiveni günlere değil başarıya bağlıdır (§1.3); bu tablo yalnız içerik çeşitliliği.
Düzen değişince (K3) ölçü serisi ayrılmaz: ölçü hızdır, düzen değil; ama ilk K3 günü alışma sayılır (§3.1).

Yolda yeri: ana oturum kararı (Ana sayfa uzun yol planı). Öneri: 4. günden açılır, haftada 3 gün, `rotate: 'week3'`,
süre 2 dk. `UNLOCK` tablosuna `'kelime-izi': 4` (VARSAYIM).

## 3. Ölçüm ve Gelişim bağı

### 3.1 Metrik (manifest `progress.metrics`)

| key | label | unit | better | Seri |
|---|---|---|---|---|
| `kelime-izi-hiz` | Geçtiğin en yüksek hız | `kelime/dk` | up | Turun **geçilen en yüksek bölüm hızı**; hiç bölüm geçilmediyse nokta yazılmaz |

- Alan: `focus` → Gelişim'de "Dikkat" (`growthCenter.js` `AREA_DOMAINS`). `eye` alanı seçilmez: `nef/moments.js`
  `EXCLUDED_DOMAINS` `eye`'ı dışarıda tutar, Nef anı üretilmezdi.
- Ölçü kuralı v2 aynen (`metricStatusV2`): günlük ortanca, alışma, 6 günlük başlangıç, Pazartesi bakışı, art arda
  2 bakış. Modül kendi hükmünü kurmaz.
- Manifestte `v2: { familiar: 2, sdFloor: 10 }`. Alışma 2 gün: ilk turlarda düzen ve dokunma alışkanlığı oturur.
  SD tabanı 10 kelime/dk: merdiven adımının yarısı. VARSAYIM; ilk 30 günlük veriyle denetlenir (§8).
- `changeText.js`: `DIGITS['kelime/dk'] = 0` ve kısaltma "kelime/dk" (Gelişim dosyası; ana oturum).
- Güvenirlik: bu görevin tekrar güvenirliği ölçülmedi. Kanıtsız iddia yok: Gelişim'de yalnız dört sözcük.

### 3.2 Kayıt
`store.addSession` ile `{ type: 'kelime-izi', v: 1, word, layout: 'row'|'col', stage: 'K1'.., blocks: [{ wpm, swaps:
3, hits, falseTaps }], topWpm (sayı | null), startWpm, seed, cam: null | { coverage, follow } }`. `topWpm` metrik
serisinin kaynağı.

### 3.3 Sonuç ekranı ile Gelişim aynı sayıyı söyler
Sonuç ekranının hüküm çipi `metricStatusV2` + `changeText` + `verdictWord`'den gelir; Gelişim ekranıyla aynı sayı ve
sözcük. Başlangıç oluşurken "Başlangıç · {k}/8 gün".

## 4. Nef

Nef'in manifest `nef` alanı bugün kodda yok (`registry.js` doğrulamıyor; Nef PLAN §4.8 önerisi). Bu modül alanı
öneriye göre taşır; Nef kodu gelince bağlanır, o güne dek zararsız veri:

```js
nef: {
  name: { '': 'Kelime İzi alıştırması', LOC: 'Kelime İzi alıştırmasında', ABL: 'Kelime İzi alıştırmasından',
          ACC: 'Kelime İzi alıştırmasını', DAT: 'Kelime İzi alıştırmasına' },
  metricWords: { 'kelime-izi-hiz': { word: 'geçtiğin en yüksek hız', unit: 'kelime/dk' } },
  evidence: ['rayner2016', 'trauzettel2012', 'rubin1992', 'simons2016'],
  note: 'Kelime İzi: sütunlarda işaretli kelimeyi gözle izleme alıştırması. Ölçü: değişen kelimeleri yakalayarak izlenen en yüksek hız (kelime/dk). Okuma hızına etkisi gösterilmedi.',
  cells: { /* METINLER.md §N, sahip onaylı */ },
}
```

| An | Ne zaman | Kanal | Cümle |
|---|---|---|---|
| `firstTime` | Durağın yola ilk geldiği gün | Ana sayfa Nef kartı | METINLER N1 |
| `metricBest` | `topWpm` yeni en yükseğe çıktı (alışma günleri sayılmaz) | Ana sayfa satırı, ertesi açılış | METINLER N2 |
| `metricChange` | Hüküm `better` oldu | Ana sayfa kartı | METINLER N3 |
| Görev ekranı satırı | Her tur | Modül içinde | METINLER G5 |
| bilim satırı | Turdan sonra, 7 günde en çok bir | Sonuç altı | METINLER N4 |

Nef doğrulanmamış farkı söylemez; gerilemeyi söylemez. `coach()` alanları: `rounds7`, `topWpm7` (7 günün ortancası).
`remind: { route: 'kelime-izi', window: 'move', science: ['rayner2016'] }`.

`lib/sources.js`'e eklenecek anahtarlar (biçim `chung2004` gibi; `design`, `n`, `finding`, `limit` dolu):
rayner1998, rayner2016, trauzettel2012, altpeter2015, rubin1992, carpenter1995, munoz1998, peltsch2011, wong2011,
rosen2015. `simons2016` sources.js'te varsa yeniden eklenmez (ana oturum denetler).

## 5. Ekranlar (son maket: `maket/maket.html?s=…&theme=…`; görüntüler `maket/son/`)

1. **Görev** (`intro`; ilk tur `intro1`): üstte ızgaranın önizlemesi (iz ile), ad, görev cümlesi, üç bölüm kartı
   eşit boyda, aralarında ›, her kartta "kelime/dk" ve alttan yükselen ince çizgi; Nef satırı; "Başla"; altında
   "Neye dayanıyor?". İddia sınırı cümlesi **yalnız modülün ilk turunda** Başla'nın altında (sahip onayı 2026-10-02),
   sonra yalnız "Neye dayanıyor?" sayfasında. Kamera anahtarı bu ekranda (§6).
2. **Alıştırma** (`play`): üstte "Bölüm 2/3" ve 3 parçalı ilerleme (boş parçalar belirgin); altında büyük hız sayısı
   ve sağda "yakalanan ●○○"; ızgara camın içinde, odak ışığı ve satır içi iz; altta ipucu (yalnız ilk 2 tur).
   Yanıp sönme yok; ekran sabit, yalnız işaret sıçrar.
3. **Yakaladın** (`catch`): değişen kelime altın hap olur (hücre içinde kalır, halka ve rozet kelimelerin üstüne
   binmez); alt satırda "Yakaladın: Kale → Kare"; üstte yakalanan noktası dolar; hafif titreşim.
4. **Sonuç** (`result`): "Bugün geçtiğin en yüksek hız" (sahip onayı), sayı büyük; hüküm çipi "{n} günde B → C ·
   sözcük"; üç bölüm sıfırdan ölçekli sütunlar (gerçek oran; kapı tur 1'de orantısız sütun eleştirildi), altlarında
   yakalanan noktaları; "Her nokta bir kelime değişimi; 3'te 2 yakalayınca bölüm geçilir." (320'de yalnız sayı
   satırı); "Son 7 gün" çizgisi, değer etiketleri çizginin solunda ayrı sütunda, kesikli başlangıç; Bitti; altında
   "Neye dayanıyor?".
5. **Ana sayfa** (`home`): Nef kartı ilk gün (N1) küçük ızgara görseliyle (320'de görselsiz), "Dene"; yol
   durakları gerçek ikonlarıyla, Kelime İzi "Yeni" rozetiyle, tamamlanan durakta yeşil tamam işareti. Durak görünümü
   Ana sayfa oturumunun bileşenidir; bu modül yalnız `today()` çıktısına `sub` verir.

Hareket ve erişilebilirlik: `prefers-reduced-motion`'da halka dalgası yok, iz yine çizilir (iz hareket değil).
Ekran okuyucuda ızgara tek öğe ("Kelime İzi alıştırması, 160 kelime/dk"); alıştırma görerek yapılır, bunu ekran
okuyucuya da söyler. Nöbet sorusu: `ask: { before: ['seizure'] }` (Tek Bakışta ile aynı; ekranda hızlı değişim var).

## 6. Kamera (sahip: "etkilemek için kullanılsın", karar bende)

Karar: **isteğe bağlı, varsayılan kapalı, ölçüye girmez.**
- Gerekçe: uygulamanın bakış okuyucusu ARKit göz değerleri verir (`lib/gaze.js`): kaba yön, kelime düzeyinde değil.
  Çemberler'de bakış duraklatması cihazda takılma yaptı (HATA_GUNLUGU Bug 23). Bu yüzden kamera burada oyunu asla
  durdurmaz, "Ekrana bak" demez, ölçü ve hüküm kurmaz.
- Ne yapar: alıştırma sırasında yatay bakışı kaydeder. Sonuçta "Göz izin" paneli: işaretin satırdaki yatay konumu
  ile bakışının yatay konumu üst üste iki çizgi. Altında tek satır: "Telefonun kabaca gördüğü; ölçüye girmez."
- Kayıtta yalnız iki özet sayı (`cam.coverage`: yüzün görüldüğü süre oranı, `cam.follow`: satır içi yatay eşleşme);
  ham kare ve görüntü saklanmaz, telefondan çıkmaz.
- Açılış: görev ekranında "Kamerayla göz izini çiz" anahtarı; ilk açılışta uygulamanın bugünkü kamera izni akışı.
- `gates: { gaze: 'optional', eyeBudget: 'eye' }` gerekiyorsa registry sözleşmesine yeni değer: ana oturum kararı.
  VARSAYIM: bugün `gaze: true` zorunlu kapı anlamında; isteğe bağlı kamera için yeni alan gerekebilir.
- Kamera ekranları (anahtar ve "Göz izin" paneli) ayrı maket ve ayrı 5 sn kapısıyla gelir; kapıdan geçmezse ilk
  sürüm kamerasız çıkar.

## 7. Bağlayıcı tasarım maddeleri ve kapının yeri (kapı bulguları; `kapi/`)

Durağan maket iki turda: görev ekranı 4/5 ve 4/5, yakalama 1/5 → 5/5 geçti. Alıştırma 1/5 → 2/5, ana sayfa 2/5 →
3/5, sonuç 4/5 → 0/5 (tur 2'de beşi de yalnız 320 bozulması için; düzeltildi, `maket/son/`). Sahip kararı
(2026-10-02, "önerilerin tamam 5 saniye kuralı önemli.. kişiler etikenmeli"): üçüncü durağan tur yok; ana oturum
uygularken aşağıdakilerin hepsini sağlar ve **bütün ekranları cihazdaki hareketli ekranın kaydıyla** 5 sn kapısına
sokar (390 ve 320, iki tema; 5 yeni kişi, ≥ 4/5). Geçmeyen ekran sahibe gösterilmez.

1. Alıştırma hareketiyle değerlendirilir: kayıt en az 5 sn işaretin sıçramasını ve bir yakalamayı gösterir. Durağan
   görüntüde "aynı kelime duvarı" eleştirisi iki turda sürdü; hareket ve odak ışığı bu ekranın asıl görünüşüdür.
2. Odak ışığı ve satır içi iz (§1.1). İz hap değil çizgi; üst satıra ve ileriye çizilmez; 320'de işaretin halesine
   değmez.
3. Yakalama: değişen kelime altın hap, hücre içinde; rozet ve halka başka kelimeyi örtmez. "Yakaladın" alt satırda.
4. Bölüm sayacı ile yakalama sayacı karışmaz: "Bölüm 2/3" ilerleme çubuğunun yanında, "yakalanan ●●○" hız satırında,
   sözcüğüyle.
5. Sonuç 320'de: etiketler çizgiye binmez, Bitti karta yapışmaz, açıklama kısa. Sütunlar sıfırdan ölçekli kalır.
6. Görev ekranında bölüm kartları eşit boy, birim kartın içinde. Nef satırında en çok iki sayı.
7. Ana sayfada boş ikon kutusu yok; tamam işareti iki temada da okunur (kapı tur 2: koyu temada görünmüyordu,
   kök neden `.stop span` renginin işareti boyaması; maket düzeltildi).
8. "kelime/dk" birimi kalır (sahip onayı). Sonuçta ve Nef'te "okuma hızı" sözcüğü geçmez; hüküm çipi yalnız
   Gelişim'in sözcükleriyle.
9. Ana oturum da kapıyı en çok iki tur yapar; geçmezse yöntemi değiştirir ya da sahibe sorar.

## 8. Denetim ve testler (ana oturum)
- Saf işlevler `lib/kelimeIzi.js`: `msPerWord` (yeniden), `planBlock(seed, wpm, cells)` → değişim yerleri,
  `judgeTap(t, swaps)`, `blockPassed`, `nextWpm`, `startWpm(sessions)`, `makeRecord`. Hepsi birim testli; zamanlama
  sahte saatle test edilir (sapma birikmez: 3 bölüm sonunda ±1 kare).
- Manifest: `registry.test.js` listeleri (modül kimlikleri, `practice` sırası, `metSample`, `remind` listesi)
  güncellenir.
- 30 gün sonra: `kelime-izi-hiz` için kişi içi gün gün SD'si, `sdFloor` 10'un uygunluğu, tavana (300) dayanan kişi
  oranı. Tavana çok dayanılıyorsa tavan değil zorluk (çeşitleme) artırılır.

## 9. Açık sorular
- Yoldaki açılış günü ve haftalık sıklık (ana oturum, uzun yol planı).
- Kamera için registry'de isteğe bağlı kapı alanı (ana oturum).
