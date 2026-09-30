# C · Ses entegrasyonu raporu: ilk bölüm uygulamada (2026-09-30)

İş: ACIK_ISLER A1 (oynatıcı yeni çizelgeye uyar) ve A2 (ilk bölümün sesleri uygulamaya girer). Sahip onayı
SAHIP_ISTEKLERI madde 10 (ilk bölüm), 17 (Ders 2, 3, 5 sesleri), 18 (Ders 1 sesleri). Çalışma ayrı bir ağaçta yapıldı;
ana dala itilmedi.

## 1. Özet

- Dört dersin on bir süresi yayımlandı: Ders 1 (3 · 5 · 15), Ders 2 (5 · 15 · 20), Ders 3 (5 · 15), Ders 5 (3 · 5 · 15).
  Dosyalar `render/out/ilk-bolum/` ile bayt bayt aynıdır. Eski Ders 2 · 15 (A adımı karışımı, `726417fa…`) onaylı
  dosyayla (`c875dcef…`) değişti. Ders 3'ün "Ders bitince müzik" kuyruğu pakete girdi.
- Oynatıcı iki çizelge biçimini de okuyor. Bilinen üç hata düzeldi: kapanış noktası, açıklamalı evre adları, Ders 1'in
  halkası. İnceleme sırasında bir hata daha bulundu ve düzeldi: Ders 1'in sayımında altyazı bir önceki sayıyı yazıyordu.
- Yolda yoga artık görünüyor: kısa günlerde Ders 1 ve 5 (3 dk), sekiz günde bir Ders 2 (5 dk). Ders 3 yolda yok, akşam
  öneri satırında. Yoga dışındaki duraklar yoga yayımlıyken ve değilken aynıdır: 2 × 20.000 bağlamda 0 fark.
- **Durulan nokta:** `Yoga.test.jsx`'in 11 testi yayın yüzünden kırmızı. Görev bu dosyaya dokunmayı yasakladığı için
  düzeltme yapılmadı; yama ayrı bir dosyada duruyor (§6.3). Yama uygulanınca bütün takım yeşil.

## 2. Değişen dosyalar

| Dosya | Değişiklik |
|---|---|
| `app/src/modules/yoga/timeline.js` | İki biçim; `closing.jumpTo`; evre adı ilk sözcüğe iner (`phaseKey`); halka (`breathCycles`, `breathAt`); Ders 3 kor ipuçları (`emberAt`, sayımla kararma); bırakma pencereleri `release`'ten (`releaseWindows`: imge ve zıtlık); duyurulmuş pencereler (`silenceWindows`); altyazıda o an söylenen parça önce gelir. Dışa açık eski işlevlerin hepsi duruyor |
| `app/src/modules/yoga/timeline.v2.test.js` (yeni) | 11 çizelgenin her biri için 10 test, ayrıca Ders 1, 2, 3, 5'e özgü testler: 129 test |
| `app/src/modules/yoga/timeline.test.js` | Eski biçimin testleri `testdata/`'daki kopyaya bağlandı (beklentiler aynı), 2 test eklendi |
| `app/src/modules/yoga/testdata/ders2-15.v1.timeline.json` (yeni) | Eski `public/yoga/ders2-15.timeline.json`'ın kopyası; yalnız mutlak `/tmp` yolları dosya adına indirildi |
| `app/src/lib/yogaLessons.js` | 11 süre `published: true`; `contentHash`, `seconds`, `sections`, `planVersion`, `voice`, `bg`, `scene`; Ders 3 `musicTailFile: 'yoga/ders3-kuyruk.mp3'` |
| `app/src/lib/yogaLessons.test.js` | Yayın beklentisi güncellendi; yeni testler: çizelge = dosya (`audio.sha256`, ad, süre), MP3 çerçeve sayısından gerçek süre, kuyruk, `public/yoga`'da artık dosya yok |
| `app/src/lib/yogaRecord.test.js`, `modules/yoga/Yoga.data.test.jsx`, `journal.test.js`, `manifest.test.js` | Yalnız yayından doğan beklentiler (§6.2) |
| `app/public/yoga/` | 11 MP3 + 11 çizelge + `ders3-kuyruk.mp3` (§4) |
| `yoga-pilot/C_SES_Yoga.test.jsx.patch` (yeni) | Dokunulmayan `Yoga.test.jsx` için önerilen yama |

`YogaPlayer.jsx` ve `BreathForm.jsx` değişmedi: evre adı `visualAt`'te yalın ada indiği için `BreathForm.jsx:99`
çalışıyor. Yoga ekran dosyalarına (`Yoga.jsx`, `YogaParts.jsx`, `text.js`, `yoga.css`, `Yoga.test.jsx`) ve ana sayfa
dosyalarına dokunulmadı. Ekranda yeni metin yok.

## 3. Oynatıcı (A1)

### 3.1 Kapanış noktası

`closingAt` artık `closing.jumpTo`'yu okuyor; alan yoksa eski yöntem sürüyor. "Kapanışa geç", sarma koruması
(`guardClosing`) ve "kapanışa ulaştı" kaydı (`session.js reachedClosing`, `yogaRecord.js recordFromJournal`) bu
noktayı kullanıyor.

| Çizelge | Eski hesap (ilk tını − 2 sn) | Yeni (`jumpTo`) |
|---|---|---|
| Ders 5 · 15 | **577,45** (pencere dönüşü; Derin evrenin ortası) | 757,393 |
| Ders 2 · 20 | **956,50** (`c4.donus1` penceresi) | 1059,483 |
| Ders 1 · 3 / 5 / 15 | 127,164 / 228,280 / 791,748 | 124,902 / 226,630 / 789,557 |
| Ders 2 · 5 / 15 | 198,298 / 751,124 | 204,600 / 757,426 |
| Ders 3 · 5 / 15 | 254,386 / 831,825 | 250,386 / 827,825 |
| Ders 5 · 3 / 5 | 125,812 / 226,699 | 121,812 / 222,699 |

Testler her çizelgede şunu sınıyor: nokta sessizliktedir; kapanışın ilk sözünden ve dönüş tınısından öncedir; ondan
sonra yalnız K bölümü çalar; ondan önceki pencere tınılarında dinlemeyi bırakan kişi "kapanışa ulaştı" sayılmaz.

### 3.2 Evreler

Ders 3 ve 5'in evre adları açıklamalıydı (`derin (kor)`, `varis (ışık noktası geniş ve soluk)`). Eski kodda bu adlar
`PHASE_LIGHT`'ta yoktu; ışık hep 0,8'de, Ders 5'in halesi hep 24'te kalıyordu. `phaseKey` adın ilk sözcüğünü alıyor
(`Varış` → `varis`). Evre sırası her dosyada varış → derinleşme → (derin) → (kapanış). Ders 5'te hale evreyle 30 → 22 →
14 daralıyor; bu `BreathForm` çizimiyle sınandı.

### 3.3 Görsel ipuçları

- **Ders 1 halkası:** Her "Al…" ipucu bir döngü açar: alış `in` sn, varsa "biraz daha…" `topUp` sn, veriş `out` sn.
  Sessiz döngü ipucu ("Sıradaki nefes sende; ben susuyorum.") ritmi `count` döngü sürdürür: 15 dk'da 245,417 ve
  295,417 sn. Ayrı yazılmış "ver…" ve "biraz daha…" ipuçları hesaplanan anlara ±50 ms içinde düşüyor. Halka en çok
  %10 genişliyor (`RING_GROW`, VARSAYIM). Bu yalnız nöbet cevabı "Hayır" ve Hareketi Azalt kapalıyken oluyor.
- **Ders 2:** 15 ve 20 dk'da on sayım nabzı var (değişmedi). Bırakma pencereleri `release`'ten okunuyor. 20 dk'da zıtlık
  (C3) bırakması (`c3.birak`) da çalıyor; eskiden yalnız imge bırakması (`c4.solma`) vardı. Ders verisinin kuralı
  (`ders2.lesson.v3.json` `extras.quickClosing.rule`) da bunu istiyor.
- **Duyurulmuş pencereler** (Ders 5 · 15'te iki, Ders 2 · 20'de bir): pencerenin sessizliğinde "Kapanışa geç"e basılırsa
  önce dönüş tınısı ve karşılama klibi çalıyor, sonra kapanışa geçiliyor (modul.md §4). Sarmada bu adım yok.
- **Ders 3 koru:** Kor, "Bugün bitti." ile gelen `kor kehribara döner` ipucunda kehribara dönüyor. "Gece senin." ile gelen
  `kor söner, ekran siyah` ipucunda sönmüş oluyor; eskiden dosyanın sonuna kadar sönüyordu. Sayım ipuçlarında
  (`kor: sayıyla bir soluk kararır`) kor her sayıda en çok %12 kararıp geri geliyor (`COUNT_DIM`, VARSAYIM). Bu da yalnız
  izin varken oluyor (`ders3.lesson.json visual.pulse`).
- Yalnız açıklama taşıyan ipucu yok sayılıyor. Örnek: Ders 5'teki "ışık noktası her sayıyla değil, yalnız doku
  değişiminde kayar". Bunun için ayrı bir test var.
- Her dosyada yanıp sönme yok: ışık saniyede en çok 0,35, ölçek saniyede en çok 0,1 değişiyor. İzin yokken ölçek hep 1.
  Gündüz derslerinde şafak 3 dk'da en az 45 sn, öteki sürelerde en az 60 sn. Sonda ekran karanlık.

### 3.4 Altyazı

Ekrandaki cümle her parçada söylenen cümle (`screenText == spokenText`, 11 dosyada 775 parça). Eski kodda cümle bittikten
sonra 0,8 sn ekranda kalıyordu. Ders 1'in sayımında parçalar 1 sn arayla geldiği için yeni sayı söylenirken bir önceki
sayı yazılıyordu: 3 dk'da 8/31, 5 dk'da 18/58, 15 dk'da 18/133 parça. Şimdi o an söylenen parça önce geliyor. Bir cümle
bitip sessizlik başlayınca 0,8 sn'lik kalma aynen sürüyor.

## 4. Dosyalar (A2) ve boyut

| Dosya | Süre | Bayt | SHA-256 (ilk 16) |
|---|---|---|---|
| ders1-3.mp3 | 180 sn | 2.494.305 | 08a93d0a56b9a1c8 |
| ders1-5.mp3 | 300 sn | 4.139.216 | 98234d291b894f66 |
| ders1-15.mp3 | 900 sn | 12.224.095 | c5db519ffc854ef0 |
| ders2-5.mp3 | 300 sn | 4.232.770 | ccf41e3801bb23a9 |
| ders2-15.mp3 | 900 sn | 12.684.787 | c875dcef4885db95 |
| ders2-20.mp3 | 1200 sn | 13.677.031 | 7d64336d1c5ffdea |
| ders3-5.mp3 | 300 sn | 4.362.322 | 76ab8a403478696c |
| ders3-15.mp3 | 900 sn | 13.051.262 | fea337327a711018 |
| ders5-3.mp3 | 180 sn | 2.453.450 | a72587e780826447 |
| ders5-5.mp3 | 300 sn | 4.102.791 | 21c25353e2f59dfc |
| ders5-15.mp3 | 900 sn | 12.418.862 | 06b1ed2d716e5566 |
| ders3-kuyruk.mp3 | 600 sn | 8.690.417 | dd75085219aeed9e |

- Adlar `yogaLessons.js`'teki `yoga/dersN-DK.mp3` ile aynı. Yerel oynatıcının ad kuralına da uyuyor
  (`AlarmPlugin.swift:637`, `^[A-Za-z0-9._-]+$`).
- `seconds`, çizelgenin `T`'si (hedef süre). MP3 çerçeve sayısından ölçülen süre bundan 0,036–0,049 sn uzun: bu
  kodlayıcının dolgusu. Çözücü (mpg123) 0,024–0,037 sn uzun ölçüyor. Test farkın 0,1 sn'nin altında kaldığını sınıyor.
- Çizelgelerde mutlak yol yok; `file` yalnız dosya adı. Eski çizelgedeki `/tmp/…` yolu gitti.
- **Boyut:** `public/yoga` 95.249.302 bayt (≈ 95,2 MB): 11 ders 85.840.891, kuyruk 8.690.417, çizelgeler 717.994.
  Önce 12.754.615 bayttı; artış +82.494.687 bayt. Toplam ses 116 dk (dersler 106 dk, kuyruk 10 dk). Pakete girenler:
  `public` 151.515.019 bayt (`copy-wasm`'ın ürettiği `mediapipe-wasm` 35.444.140 dahil) ve iOS `Sounds` 25.931.208 bayt.
  Toplam ≈ 177,4 MB; Y-01'deki tahminle aynı. `npm run build` çıktısı: `dist` 154.035.817 bayt, `dist/yoga`
  95.249.302 bayt. Web'e yüklenmiyor (`.vercelignore: public/yoga`).
- MP3 bilinçli bir ara karar. Kodek testinden sonra (SPEC.v3 §14) dosyalar AAC olarak değişecek (§7).

## 5. Yol (lib/yoga.js pathYoga)

`lib/yoga.js` değişmedi. Kısa günde Ders 1 ve 5 (3 dk), tam ders gününde 5 dk'lık ders, Ders 3 yalnız akşam önerisi
(`PATH_SEQ`'te yok). R7b de aynı: yoga yalnız 20 dk'ya sığarsa yolda.

### 5.1 Eşdeğerlik: 20.000 bağlam

Düzenek `…/scratchpad/yoga-ses/esdeger/esdeger_yoga.test.js`, sonuç `sonuc_esdeger.txt`. Koşu:
`cd app && npx vitest run --globals --dir <klasör> esdeger_yoga`.

Düzenek gerçek kayıt defterini (`registry.live`), gerçek yoga manifestini ve gerçek `buildPath`'i kullanıyor. Bağlam Ana
sayfanın kurduğu bağlam: `Home.jsx:176-187`, `progressionCtx`. iPhone taklit ediliyor. Aynı bağlam iki kez kuruluyor: bir
kez 11 süre yayımlıyken, bir kez bütün `published` bayrakları kaldırılmışken. Bağlamların yarısı yeni ya da kısa
geçmişli, yarısı uzun geçmişli kullanıcı. Saatler 00–23 (Koşu 1'de 7.532 bağlam 20.00–04.59 arası). Göz bütçesi 3/5 dk, kilit ve dolma,
nöbet cevabı, abonelik kapısı ve "Sonra yaparım" da rastgele.

| | Koşu 1: ilerleme açık | Koşu 2: ilerleme kapalı |
|---|---|---|
| Yoga yolda (yayımlıyken) | 13.772 (gece önerili 5.192) | 6.760 |
| Yoga dışındaki durak farkı (her alan) | **0** | **0** |
| Yogasız günde bütün yol farkı (sıradaki, allDone, minutesLeft, bölümler, mola yeri, önceden görülen kilit) | **0** | **0** |
| "Yeni" rozeti · ara kilidi · mola bandı farkı | 0 · 0 · 0 | 0 · 0 · 0 |
| Yogalı günde bölüm göz payı / mola yeri farkı | 0 | 0 |
| 20 dk'yı aşan yol · yayımlanmamış süreli durak · 2. bölüm dışında | 0 · 0 · 0 | 0 · 0 · 0 |
| Aday vardı ama sığmadığı için yolda yok | 4.470 (hepsinde yogasız yol + ders > 20 dk) | 11.562 (hepsi aynı) |

Yayımlanmamışken de yolda görünen yoga 2.769 / 2.812 bağlamda var. Bunların hepsi o gün tamamlanmış bir ders kaydı
taşıyor: tamamlanmış durak yayından bağımsız gösteriliyor ve bu önceden de böyleydi.

### 5.2 Benzetim: 30 ve 90 gün

Düzenek `…/esdeger/sim_yoga.test.js`, sonuç `sonuc_benzetim.txt`, gün gün dökümler `gun_gun_*.txt`. Düzenek Y1'in
`sim_gercek.mjs` kalıbını izliyor, ama taklit yerine gerçek yoga manifesti ve gerçek yayın verisi kullanılıyor. Yeni
kullanıcı 1 Ekim'den her gün aynı saatte açıyor ve yolu bitiriyor. Her gün aynı bağlam yoga yayımlanmamışken de kuruluyor.

| Senaryo | Yol (en kısa / en uzun / ortalama) | > 20 dk | Yoga günü (3 dk + 5 dk) | Dağılım | 5 dk günleri | Yoga dışı fark |
|---|---|---|---|---|---|---|
| 10.00 · 5 dk bütçe · 30 gün | 8 / 18 / 15,3 | 0 | 24 (21 + 3), 78 dk | D1 11 · D5 10 · D2 3 | 10, 18, 26 | 0 |
| 10.00 · 5 dk bütçe · 90 gün | 8 / 18 / 15,7 | 0 | 76 (66 + 10), 248 dk | D1 33 · D5 33 · D2 10 | 10, 18 … 84 (ara 8, bir kez 10) | 0 |
| 19.00 · 5 dk bütçe · 90 gün | 8 / 18 / 15,7 | 0 | 76 (66 + 10) | aynı | aynı | 0 |
| 21.00 · 30 / 90 gün (gece) | 8 / 18 / 15,3 · 15,7 | 0 | 24 · 76, hepsinde Uykuya Geçiş önerisi | aynı | aynı | 0 |
| 10.00 · 3 dk bütçe · 30 / 90 gün | 8 / 15 / 12,5 · 12,8 | 0 | 24 · 76 | aynı | aynı | 0 |
| 13.–28. günler açılmadı (40 gün) | 8 / 19 / 15,0 | 0 | 19 (17 + 2) | D1 9 · D5 8 · D2 2 | 10, 34 | 0 |

Ders 3 hiçbir gün yolda değil. Sayılar Y1_KOD_RAPORU §4.3'teki gerçek kod satırıyla aynı: 8 / 18 / 15,3, yoga 24
(3'ü tam ders); 90 günde 15,7, yoga 76 (10'u tam ders); 3 dk bütçede 12,5 ve 12,8. Y1 bunları taklit veriyle
bulmuştu; aynı sonuç şimdi gerçek ilk bölüm verisiyle çıkıyor.

## 6. Testler ve derleme

### 6.1 Sayılar

- Önce: 138 dosya, 1.877 test, hepsi yeşil.
- Bu dal (commit'teki hâli): 139 dosya, 2.013 test. 2.002 yeşil, **11 kırmızı, hepsi `Yoga.test.jsx`'te** (§6.3).
  10'u her koşuda kırmızı. 11.'si ("yerel oturum başka yerden kapandı") yalnız tam takımda, yük altında kırmızı;
  tek başına yeşil.
- `Yoga.test.jsx` yamasıyla: 139 dosya, 2.013 test, **hepsi yeşil**. İki tam koşu yapıldı. `Yoga.test.jsx` ayrıca üç kez
  tek başına koşuldu, üçünde de 35/35 yeşil.
- `pathModules.equiv.test.js`, `today.test.js` ve `today.yoga.test.js` değişmedi; üçü de yeşil.
- `npm run build` yeşil (3,5 sn). 500 kB'lık parça uyarısı önceden de vardı.

### 6.2 Beklentisi değişen testler (hepsinin nedeni yayın)

- `yogaLessons.test.js`: "bugün yalnız Ders 2 · 15 yayımlı" beklentisi ilk bölüme çevrildi. "`published` bayrağı olmayan
  süre seçilemez" testi aynı kuralı artık geçici veriyle sınıyor. `sectionsOf(1, 3) = []` satırı kalktı: bölüm verisi
  artık dosyadan dolu.
- `yogaRecord.test.js`, `Yoga.data.test.jsx`: kuyruk dosyası artık var. Dosyasız hâl geçici veriyle sınanıyor.
- `journal.test.js`: `contentHash` 726417fa… yerine c875dcef… (dosya değişti).
- `manifest.test.js`: "yalnız Ders 2 · 15 yayımlıyken durak yok" testi geçici veriyle korundu. Yeni test: ilk bölümde kısa
  günde Ders 1 · 3 dk durağı var.
- `timeline.test.js`: eski biçimin beklentileri aynen duruyor, yalnız kaynak dosya `testdata/`'ya taşındı.

### 6.3 DUR: `Yoga.test.jsx` (dokunulmadı)

Bu dosya tek ders (Ders 2 · 15) yayımlıyken yazılmış. Yayından sonra şu testler kırmızı:

- Kütüphanede öteki dersler görünüyor.
- Ders 2'nin açılış süresi artık varsayılan 20 dk.
- Yeni Ders 2 · 15 çizelgesinin sayıları farklı: kapanış 750,929 yerine 757,426, `a.hosgeldin` 4,1768 yerine 4,165,
  `c4.solma` 687,49 yerine 687,065.
- `contentHash` değişti.

Önerilen yama `yoga-pilot/C_SES_Yoga.test.jsx.patch` (+21 / −9 satır). Yama iki şey yapıyor. Test
süresince yayını Ders 2 · 15'e indiren bir `beforeEach`/`afterEach` ekliyor; akışlar böylece aynı veriyle sınanıyor, çok
dersli kütüphane zaten `Yoga.data.test.jsx`'te. Ayrıca yeni çizelgenin sayılarını ve özetini yazıyor. Yama bu dalın
tabanındaki (e1f6148) dosyaya `git apply` ile uygulanıyor. Öteki ajan dosyayı değiştirdiyse aynı iki değişiklik elle
yapılmalı.

## 7. Açık kalanlar

1. **Kodek.** Dosyalar MP3 (ABR 120, 20 dk'da 96). SPEC.v3 §14'teki AAC-LC 64/96 kararı kodek testini bekliyor (A7, C3).
   AAC'ye geçince değişecekler:
   - dosyalar ve `contentHash`;
   - çizelgelerin `audio` alanı (`decoderOffsetSamples` MP3'te 576);
   - ad sözleşmesi: SPEC `yoga-dNN-MMdk.m4a` diyor (çizelgede `appFile`), kod `yoga/dersN-DK.mp3` bekliyor (Y-03e);
   - `yogaLessons.test.js`'in `.mp3` ad kalıbı ve MP3 çerçeve sayacı.

   AAC dosyası MP3'ten kodlanamaz; önce WAV ana kopyaları gerekiyor (Y-05).
2. **SPEC §10 yardımcı dosyaları yok.** Kod bunları yokken atlıyor; öyle bırakıldı:
   - ilk ders girişi: `versions[dk].intro` yok, `Yoga.jsx:180` doğrudan dersi çalıyor;
   - kaldığın yerden izni (`a.izin`): kart yok (Y-07);
   - bırakma ön klipleri (`release.*.prefixFile`): pakette yok, oynatıcı dosyanın içindeki bırakma klibini çalıyor;
   - durdurma sonrası sesli dönüş: "Sesli dönüşü dinle" düğmesi görünmüyor;
   - ses denetimi: `SOUND_CHECK_FILE = null`, adım görünmüyor.
3. **Ders 2'nin hızlı kapanışı.** Ders 2'de `jumpTo` "Artık dönüş zamanı." cümlesinden ve dönüş tınısından sonraya
   düşüyor (15 dk'da 757,426; tını 753,124). Sebep: ders verisinin hızlı kapanış dizisi `k.nefes` ile başlıyor ve kendi
   tınısını istiyor (`returnTone:-2s`); tek dosyada bu tını yok. Görev `jumpTo`'nun okunmasını istediği için böyle
   bırakıldı. Tınısız geçişin kulağa nasıl geldiği cihazda dinlenmeli; gerekirse `mixib.py` ya da ders verisi düzeltilir.
4. **Uygulama kopyasında pilot alanları.** SPEC §11 "pilot alanları uygulama kopyasına girmez" diyor. Çizelgeler onaylı
   dosyalarla bayt bayt aynı bırakıldı (`flags`, `plan`, `levels`, `music_events` dahil). Oynatıcı bilinmeyen alanı yok
   sayıyor ve mutlak yol yok. Ayıklanırsa ≈ 0,7 MB'ın bir kısmı kazanılır.
5. **Varsayımlar.** Halkanın genişlemesi (%10) ve korun sayımla kararması (%12) VARSAYIM. Cihazda ve tasarım turunda
   bakılmalı.
6. **Rastgele geçmişte 5 dk'lık gün.** `pathYoga` tam ders gününde en az tamamlanan dersi seçiyor. Yolu izleyen kişide
   bu hep Ders 2 (benzetim). Ders 2'yi kütüphaneden çok dinlemiş kişide ise Ders 1 ya da 5 · 5 dk seçilebiliyor: 20.000
   bağlamda 83 / 103 kez. Kural değişmedi; bilgi olarak yazıldı.
7. **Cihaz listesi** (TestFlight):
   - kilitli ekranda çalma: 11 dosya baştan sona kesintisiz; özellikle Ders 2 · 20 ve Ders 3 · 15;
   - "Kapanışa geç": her derste; Ders 5 · 15 ve Ders 2 · 20 pencere sessizliğinde (önce tını ve karşılama klibi); Ders
     2 · 20'de zıtlık ve imge içinden (önce `c3.birak` ya da `c4.solma`); Ders 2'de tınısız geçiş (madde 3); Ders 3'te
     "Uykuya geç";
   - kuyruk: Ders 3 "Ders bitince müzik" 5 / 10 / 20 dk. 20 dk'da 10 dk'lık dosya döngüye girmeli; sönüş ve "Durdur"
     denenmeli;
   - Ders 1 halkasının sesle eşzamanlılığı (Bluetooth gecikmesi ölçülmedi, modul.md §3); sarma koruması; kilitten
     sürdürmede klip başı;
   - eski Ders 2 · 15'i yarım bırakmış kişinin güncellemeden sonraki durumu (`contentHash` farkı);
   - paket boyutu ≈ 177 MB: indirme süresi ve depolama uyarısı.
8. Belgeler güncellenmedi: ACIK_ISLER A1–A2, YAPILACAKLAR ve sürüm notu (A3). Bunlar belge turunun işi.
