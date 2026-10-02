# Yakala Yaz · plan (sürüm 1, 2026-10-02)

Sahibin isteği: `SAHIP_ISTEGI.md`. Sahibin bu oturumdaki kararları (2026-10-02):
- Ad **Yakala Yaz**. Hız **basamak ve milisaniye** ile gösterilir (kelime/dakika yok). Ekranda **hep iki kelime**.
- Cevap: önce "yalnız klavye" seçildi, sonra sahip ekledi (kelimesi kelimesine): "yanlız kalvye yazdım ama miktofonda
  olsun sesli söylebilsin". Mikrofon plandadır; ses telefondan çıkmaz (§6).

Dayanaklar: `arastirma/KAYNAKLAR.md` (PMID ve DOI'ler PubMed aracıyla çekildi), `arastirma/merdiven-benzetim.mjs`,
`KELIMELER.md`, `METINLER.md`, maket `maket/maket.html`, kapı kayıtları `kapi/`.

## 0. Tek bakışta

| Örnek uygulama | Yakala Yaz |
|---|---|
| "Kelimeler" adı, yeşil arka plan, turuncu düğme, puan sayacı | Kendi adı, Nefona'nın renkleri, puan yok: **hız merdiveni** (18 basamak, 500 → 50 ms) |
| Hız sabit ya da belirsiz | Her doğru cevapta **bir basamak hızlanır**, yanlışta üç basamak yavaşlar (García-Pérez 1998) |
| Kelimeler sabit bir listeden, tekrar ediyor | 384 kelimelik kendi listemiz; 7 gün tekrar yok, aynı çift hiç yok (testle) |
| "Görme açınızı genişletir", "okuma hızınıza ciddi katkı" | İddia yok: "Okuma hızını artırdığı gösterilmedi" (Rayner 2016; Simons 2016) |
| Gelişim takibi yok | Ölçü `progress.metrics`'te, ölçü kuralı v2, Gelişim → Dikkat; Nef aynı veriden konuşur |
| Konuşma için sunucuya ses gidebilir | Mikrofon yalnız cihaz içinde çalışıyorsa görünür; ses kaydedilmez, gönderilmez |
| Kelime ekranda kalıp yavaşça kaybolur | Kelimeden hemen sonra sakin bir örtü: süre gerçekten o süre olur (Breitmeyer 2000) |

## 1. Tur (≈ 2 dk, 20 deneme)

Bir deneme:
1. **Nokta** 600 ms: kelimelerin çıkacağı yerin ortasında küçük turkuaz nokta (göz oraya gelir).
2. **İki kelime** D ms: tek satır, ekranın ortasında, aralarında boşluk. D = basamağın süresi (§2).
3. **Örtü** 150 ms: kelimelerin tam yerine, kelime uzunluğunda sakin gri bloklar (çizgili desen yok, kırmızı yok,
   parlaklık sahneyle aynı). Sonra pencere boş kalır: "Ne gördün?".
4. **Cevap**: klavye tur boyunca açık kalır, alan kelimelerin hemen altında. Kişi iki kelimeyi yazar (sıra fark
   etmez) ve "Gönder"e basar; ya da mikrofona dokunup söyler (§6). Süre sınırı yok.
5. **Geri bildirim** 900 ms: doğruysa kelimeler yeşile döner, merdivende bir basamak ilerler, "Doğru · bir basamak
   hızlandı". Yanlışsa doğru kelimeler görünür, kişinin yazdığı altında, yanlış harfler işaretli; "Yakındı. Üç
   basamak yavaşlıyoruz: 250 ms." Sonra sıradaki deneme.

Doğru sayılma (VARSAYIM, ilk 30 gün verisiyle denetlenir):
- Karşılaştırma Türkçe küçük harfle (`tr-TR`: İ→i, I→ı; şapka atılır: â→a), baştaki/sondaki boşluklar ve noktalama atılır.
- Türkçe harfin eksik yazılması doğru sayılır ("cinar" = "çınar"): telefon klavyesinde sık. Liste bu yüzden
  harf atınca çakışan kelime içermez (KELIMELER.md).
- Deneme doğru = **iki kelime de** doğru. Tek kelime doğruysa kayıtta `part: 1` (ölçüye girmez, kişiye "Biri doğru"
  diye gösterilir) ama merdiven için yanlış sayılır.
- Bir harf hatası ("fener" yerine "fenar") yanlış sayılır; ekranda "Yakındı" denir.
- Boş cevap ya da "Görmedim" (alan boşken Gönder) yanlış sayılır; suçlayıcı söz yok.
- Klavye: `autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"`, `enterkeyhint="send"`.
  VARSAYIM: iOS öneri çubuğu bu ayarlarla kapanır; cihazda doğrulanır (§10). Kapanmazsa öneri kelimeyi ele verebilir.

Tur sonu: sonuç ekranı (§5). Tur yarıda bırakılırsa 10 denemeden azsa kayıt yazılmaz; 10 ve üstüyse eksik tur olarak
yazılır (`partial: true`), ölçüye girer (eşik son 10 denemeden).

## 2. Hız merdiveni

**Basamaklar** (60 Hz ekran karesi; 120 Hz ekranda aynı süreler iki kat kare):

| Basamak | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Kare | 30 | 27 | 24 | 21 | 19 | 17 | 15 | 13 | 12 | 11 | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 |
| ms | 500 | 450 | 400 | 350 | 317 | 283 | 250 | 217 | 200 | 183 | 167 | 150 | 133 | 117 | 100 | 83 | 67 | 50 |

- Üst uç 500 ms: kelime bu sürede herkes için rahat okunur (Rubin 1992: tek kelimede gereken en kısa süre ort. 69 ms;
  iki kelime ve yazma için geniş pay). Alt uç 50 ms: daha kısası ekranda güvenilir gösterilemez (Elze 2010) ve Tek
  Bakışta'nın alt sınırıyla aynı (`lib/span.js MIN_MS`).
- Adımlar ≈ 0,05 log birim, kareye yuvarlanmış (Chung 2021 0,1 log adım kullandı; biz daha ince, "bir tık" hissi için).

**Kural**: her doğru cevapta **+1 basamak** (hızlanır); her yanlışta **−3 basamak** (yavaşlar). Sınırlar 1–18.
- Dayanak: sabit adımlı merdivende yakınsama adım oranına bağlıdır; bir doğru–bir yanlış kuralında oran 0,2845 olunca
  %77,85 doğruya yakınsar (García-Pérez 1998, PMID 9797963; ağırlıklı yukarı–aşağı, Kaernbach 1991, PMID 2011460).
  Bizim oran 1/3 = 0,33.
- Benzetim (`arastirma/merdiven-benzetim.mjs`): 20 denemede doğru oranı %73–77; tur eşiği gerçek %80 noktasının
  ±%7'si içinde. Kişi denemelerin yaklaşık dörtte üçünü bilir: ne sıkıcı kolay ne bıktıran zor.
- Neden "iki doğruda bir" değil: sahip "her gelişimde bir tık" istedi; her doğru bir tık, hem isteği hem kanıtı karşılar.

**Turlar arası**: yeni turun ilk basamağı = son turun eşik basamağından 2 basamak yavaş (ısınma); ilk tur 3. basamak
(400 ms). 14 gün ve üstü aradan sonra 4 basamak yavaş (Sonsuz yol §A.8-1 yumuşak dönüş ilkesi).

**Tur eşiği (ölçü)**: son 10 denemenin gösterim sürelerinin ortancası, ms. "En hızlı doğru" (turda doğru bilinen en
kısa süre) ayrıca kaydedilir ve sonuçta gösterilir; ölçü değildir (şanslı tek deneme).

## 3. Kelime seçimi ve tekrar etmeme
`KELIMELER.md`: 384 kelime, 4–6 harf, 8 grup. Kurallar (saf işlev, testle): turda tekrar yok; 7 gün tekrar yok; aynı
çift hiç yok; çiftte farklı gruplar, toplam ≤ 12 harf; bir grubun payı ≤ %30; tohumlu. Kelimeler kayıtta tutulur
(`trials[].w`); geçmiş kayıtlardan okunur, ayrı depolama anahtarı yok.

## 4. Ölçüm ve Gelişim'le bağ

### 4.1 Metrik (manifest `progress.metrics`)

| key | label | unit | better | v2 | Seri |
|---|---|---|---|---|---|
| `yakala-yaz-ms` | İki kelimeyi yakaladığın süre | ms | down | `{ familiar: 2, sdFloor: 15 }` | her kaydın `thresholdMs` |

- Alan: `progress.domain: 'focus'` (Gelişim → Dikkat; Tek Bakışta ve Hızlı Bakış ile aynı alan).
- `familiar: 2`: görev metriklerinin ilk 2 ölçüm günü alışmadır (ölçü kuralı v2). `sdFloor: 15` ms: benzetimde tur
  içi yayılım ≈ 0,065 log (150 ms'de ≈ ±23 ms); günlük ortanca bundan dar olur. VARSAYIM; ilk 30 gün verisiyle bakılır.
- Hüküm Gelişim'in `metricStatusV2` kuralıyla kurulur; modül kendi hükmünü kurmaz. Sonuç ekranındaki çip
  `metricStatusV2` + `changeText` + `verdictWord`'den: "250 → 183 ms · başlangıcından iyi", "Başlangıç · 3/8 gün",
  "değişim yok", "henüz belli değil". Gelişim ekranıyla aynı sayı, aynı sözcük.
- `changeText` için yeni birim gerekmez (`ms` var: basamak 0).
- 5. gün raporu, PDF ve CSV metriği manifestten kendiliğinden alır; testle doğrulanır.
- Gelişim ekranlarında "beyin" ve "tanıma" geçmez; mikrofonla verilen cevaplar Gelişim'de ayrı gösterilmez.

### 4.2 Kayıt (`sessions`, `type: 'yakala-yaz'`)
```
{ type: 'yakala-yaz', date, seconds, thresholdMs, thresholdStep, startStep, bestOkMs, accuracy,
  partial?, hz, trials: [{ w: ['çınar','vapur'], step, ms, shownMs, ok, part, mode: 'key'|'voice', typed? }] }
```
- `shownMs`: ekranın gerçekleştirdiği süre (rAF kare sayımıyla; Elze 2010). `ms` ile farkı 1 kareyi aşan deneme
  ölçüye girmez (`bad: true`) ve merdiveni oynatmaz; deneme tekrar edilir.
- `typed`: yalnız yanlış denemede, yalnız kelime alanı (geri bildirim için); Nef paketine girmez.

### 4.3 `coach()` (Nef'e 7 günlük özet, en çok 6 alan)
`{ ms7: son 7 günün tur eşiklerinin ortancası, rounds7, first: ilk tur eşiği, step7: ortanca basamak }`.
Ortanca, Tek Bakışta `span7` ile aynı ilke (en iyi tur değil).

### 4.4 `stats()` (Gelişim → Pratikler)
`[{ label: 'Yakala Yaz', value: '183 ms', sub: 'ilk tur 283 ms' }, { label: 'Tur · 7 gün', value: '5', sub: 'basamak 10' }]`

## 5. Ekranlar (maket `maket/maket.html?s=<ekran>&theme=<light|dark>`)

5 sn kapısı (`kapi/5sn-tur1.md`, `kapi/5sn-tur2.md`): giriş 5/5, gösterim 4/5, yazma 4/5, doğru 5/5, yanlış 5/5, mikrofon
izni 5/5 (anlaşılırlık 5/5) geçti. **Sonuç ekranı iki turda geçmedi** (1/5): `kapi/5sn-tur2.md` madde 7–13 ile gerçek
kodda kurulur ve gerçek ekranla kapıya girer. Madde 1–6 geçen ekranlara küçük düzeltmelerdir; hepsi bağlayıcıdır.

1. **Giriş** (`giris`): "İki kelime, bir an." Bugünün başlangıç basamağı, örnek pencere, +1 / −3 kuralı, iddia
   sınırı (yalnız ilk turda), "Başla". 2 dk.
2. **Gösterim** (`goster`): üstte ilerleme (7/20), koyu sahne: basamak çipi, köşeli pencere, altında 18 basamaklı hız
   merdiveni (geçilen basamaklar mavi, bulunulan basamak parlak). Cevap alanı ve mikrofon düğmesi klavyenin hemen
   üstünde. Klavye tur boyunca açık: kelime görünürken ekran zıplamaz.
3. **Yazma** (`yaz`): pencere boş, "Ne gördün?"; alan dolunca mikrofon düğmesi "Gönder" okuna döner.
4. **Doğru** (`dogru`) ve **yanlış** (`yanlis`): §1 madde 5.
5. **Sonuç** (`sonuc`): bugünkü eşik büyük ("183 ms"), "İki kelimeyi bu sürede yakaladın.", Gelişim hüküm çipi, son
   7 turun çubukları (uzun = hızlı), "20 denemede 15", "En hızlı doğru", "Bana hatırlat" kartı (var olan bileşen),
   "Bitti".
6. **Mikrofon izni** (`sesizin`): §6.

Görsel dil: Nefona'nın yüzey ve turkuaz–mavi geçişi; kelime sahnesi her temada koyu (kısa gösterimde parlak beyaz
zemin göz yorar ve örtü kontrastı değişir). Kelime yazısı Unbounded 600, 26–40 px (genişliğe göre); 40 cm'de rahat
okunur boy (Akutsu 1991: orta harf boyunda yaşlılar da gençler kadar hızlı okur). Hareket yalnız merdiven
basamağında (bir basamak ilerleme 200 ms kayma); `prefers-reduced-motion`'da kayma yok. Ses yok; geri bildirimde hafif
titreşim (doğru: kısa tek; yanlış: yok).

## 6. Mikrofonla cevap (sahip isteği 2026-10-02)

- Bugün var olan `ios/App/App/SpeechPlugin.swift` (Okuma testi için) kullanılır. Eklenti `isAvailable` ile
  `onDevice` bilgisini veriyor; ama `start({ onDevice: true })` cihaz içi tanıma desteklenmiyorsa **sessizce sunucuya
  düşüyor** (satır `if call.getBool("onDevice") ?? false, recognizer.supportsOnDeviceRecognition`). Bu modül için
  yeterli değil.
- Kural: Yakala Yaz mikrofonu **yalnız** `isAvailable({ locale: 'tr-TR' })` → `onDevice: true` ise gösterir ve
  `start`'a yeni bir `strictOnDevice: true` seçeneği verir: eklenti cihaz içi çalışamıyorsa başlamaz, hata döner.
  Böylece ses hiçbir koşulda telefondan çıkmaz. (Eklenti değişikliği: tek seçenek, Okuma testinin davranışı değişmez.)
  VARSAYIM: Türkçe için cihaz içi desteğin hangi iPhone ve iOS sürümlerinde olduğunu bilmiyorum; eklenti çalışırken
  söyler. Desteklemeyen telefonda mikrofon düğmesi hiç görünmez, açıklama yok (yalnız klavye).
- Akış: ilk dokunuşta izin sayfası (`sesizin`): ne istendiği, sesin nereye gittiği, nasıl hayır denileceği; "Mikrofonu
  aç" → iOS mikrofon ve konuşma izinleri; "Klavyeyle devam" → bir daha sorulmaz, Profil'den açılabilir. Rıza sayfası
  ölçütü: beş kişiden en az dördü "ne istendiğini, sesin nereye gittiğini, nasıl hayır diyeceğini" 5 sn'de anlamalı.
- Dinleme: mikrofona dokununca açılır; iki kelime duyulunca ya da 4 sn sessizlikte kapanır. Duyulan metin alana
  yazılır; kişi düzeltebilir ve "Gönder"e basar (otomatik gönderme yok: yanlış duyma kişinin hatası sayılmasın).
  Hiçbir şey duyulmazsa deneme yanlış sayılmaz, alan boş kalır, "Duyamadım, yazabilirsin" denir.
- Kayıt: deneme `mode: 'voice'`. Ses saklanmaz; yalnız yazıya dönmüş iki kelime, öteki denemeler gibi.
- Info.plist izin metinleri bugün yalnız Okuma testini anıyor; Yakala Yaz'ı da kapsayacak biçimde değişir (METINLER
  İ1–İ2, sahip onayı gerekli). Uygulama içinde "tanıma" sözcüğü kullanılmaz ("sesle söyle").
- Nef paketine, sunucuya ya da Gelişim'e ses, konuşma metni ve mikrofon kullanımı gitmez.

## 7. Nef: modülü bilir, aynı veriden konuşur

Manifest `nef` alanı (registry.js sözleşmesi; `modules/nef.contract.test.js`):
```js
nef: {
  name: { tr: { '': 'Yakala Yaz alıştırması', ABL: 'Yakala Yaz alıştırmasından', ACC: 'Yakala Yaz alıştırmasını',
                LOC: 'Yakala Yaz alıştırmasında', DAT: 'Yakala Yaz alıştırmasına', INS: 'Yakala Yaz alıştırmasıyla' } },
  metricWords: { tr: { 'yakala-yaz-ms': { word: 'iki kelimeyi yakaladığın süre', unit: 'ms' } } },
  moments: ['metricChange', 'firstTime', 'returnAfterGap'],
  cells: ['FYY-1'],   // METINLER N1, sahip onayından sonra lib/nef/bank/tr.js'e
  evidence: ['rubin1992', 'garcia1998', 'rayner2016', 'simons2016'],
  note: 'Yakala Yaz alıştırması: kısa süre gösterilen iki kelimeyi yakalayıp yazma; ölçü iki kelimenin doğru yakalandığı gösterim süresi (ms, düşük daha iyi). Okuma hızına aktarımı gösterilmedi.',
}
```
- Sözleşme testinin `APPROVED_NAMES` listesine "Yakala Yaz alıştırması" eklenir (sahip onayından sonra). Çekimler
  `bank/tr.grammar.js nounForms` ile tutarlı olmalı ("alıştırma" + iyelik); test bunu denetler.
- Anlar: `metricChange` yalnız Gelişim'in doğrulanmış değişiminde (`better`); `metricBest` kullanılmaz (Nef PLAN kapısı
  rekor kartını geçirmedi). `firstTime`: ilk tur. `returnAfterGap`: uzun aradan dönüş. Gerilemeyi söylemez.
- `remind`: `{ route: 'yakala-yaz', window: 'move', science: ['rubin1992'] }`. Bildirim metinleri METINLER H1–H3
  (`lib/remindTexts.js`'e `remind.yakala-yaz` anahtarıyla, bildirim oturumunun onay dosyası yoluyla). Kimlik aralığı
  modül hatırlatmalarının 7800–7859 aralığı; yeni aralık gerekmez.
- Kaynaklar `lib/sources.js`'e (pmid, doi, design, n, finding, limit; yalnız özette yazan): rubin1992, legge2001,
  akutsu1991, chung2021, garcia1998, kaernbach1991, breitmeyer2000, elze2010, harding2005, rayner2016, schotter2014,
  simons2016, goz2017. Değerler `arastirma/KAYNAKLAR.md`'den kopyalanır, ezberden yazılmaz. `finding` ve `limit`
  metinleri METINLER B1–B4 (sahip onayı).

## 8. Manifest özeti (`app/src/modules/yakala-yaz/manifest.js`)

`id: 'yakala-yaz'`, `title: 'Yakala Yaz'`, `label: 'Yakala Yaz'`, `ring: 'attention'`, `kind: 'practice'`,
`gates: { eyeBudget: 'eye' }`, `ask: { before: ['seizure'] }` (kısa gösterim; Tek Bakışta ve Hızlı Bakış ile aynı;
`profileSignals(profile).flashSafe === false` ise `today()` null), `home: { section: 'practice', order: 17 }`
(VARSAYIM: Tek Bakışta 15'ten sonra), `progress` (§4.1), `sessions` (match, `countsTowardGoal: true`, describe:
"Yakala Yaz · 183 ms · basamak 10"), `coach`, `stats`, `remind`, `nef`.

**Yol (`today()`)**: VARSAYIM, Sonsuz yol sahibiyle sıraya konur: `lib/ladders.js UNLOCK['yakala-yaz'] = 9` (10. gün),
haftada 3 gün, 2 dk, `slot: 'body'`, `dropRank: 1.5`. Tek Bakışta ile aynı gün gelmez (ikisi de kısa gösterim; göz
bütçesi). HATA_GUNLUGU Build 29: Tek Bakışta'nın `week3` dönüşümü bozulmaz; testle.

**Güvenlik (Harding 2005)**: saniyede en çok bir gösterim (deneme ≥ 1,5 sn); kelime ve örtü ekranın %25'inden azını
kaplar; doymuş kırmızı yok; örtüde çizgili desen yok. İlk turdan önce nöbet sorusu (var olan `seizure`).

## 9. Aşamalar (ana oturum uygular)

| Aşama | İş | Dosyalar | Bitti tanımı |
|---|---|---|---|
| Y1 Mantık | Merdiven, eşik, cevap denetimi, kelime seçimi ve tekrar etmeme, kayıt | `lib/yakalaYaz.js`, `lib/yakalaYazWords.js` (liste, sahip onaylı) + testler | Tohumlu; 90 günlük benzetim testinde §3 kuralları hiç çiğnenmez; merdiven 1–18; eşik son 10 denemenin ortancası |
| Y2 Ekran | Giriş → deneme döngüsü → sonuç; kare sayımıyla gösterim; klavye hep açık | `modules/yakala-yaz/view.jsx`, `screens/YakalaYaz.jsx`, `styles/yakalayaz.css` | Maketle birebir; 390/320, iki tema; `shownMs` kaydı |
| Y3 Gelişim | Metrik, v2, sonuç çipi | manifest | Gelişim → Dikkat'te satır; rapor/PDF/CSV'de satır |
| Y4 Nef ve kaynak | `nef`, `remind`, `coach`, `sources.js`, bankaya FYY-1, `APPROVED_NAMES` | manifest, `lib/sources.js`, `lib/nef/bank/tr.js`, `modules/nef.contract.test.js` | Sözleşme testi bu modülde geçer |
| Y5 Mikrofon | `strictOnDevice`, izin sayfası, dinleme | `SpeechPlugin.swift`, `lib/native.js`, ekran, Info.plist | Cihaz içi değilse düğme yok (test: `onDevice:false` → düğme yok); Okuma testi değişmez |
| Y6 Cihaz | §10 listesi, 5 sn kapısı gerçek ekranla | — | §10 tamam |

Her aşamada yalnız ilgili testler; sonda tam takım ve derleme (İş akışı kuralları 4).

## 10. Cihaz denetim listesi
- [ ] Gösterim süresi: 60 Hz ve 120 Hz telefonda `shownMs` istenen süreden en çok 1 kare sapıyor (100 deneme kaydı).
- [ ] Klavye tur boyunca açık; kelime görünürken düzen kaymıyor; 320 (iPhone SE) ekranda pencere, alan ve klavye sığıyor.
- [ ] iOS öneri çubuğu kelimeyi önermiyor (otomatik düzeltme kapalı).
- [ ] Mikrofon: cihaz içi desteklemeyen telefonda düğme yok; destekleyen telefonda uçak modunda da çalışıyor
      (sesin çıkmadığının kanıtı).
- [ ] VoiceOver: kelimeler gösterim sırasında okunmuyor (ele verir); cevap alanı ve sonuç okunuyor.
- [ ] Mola kilidi ve göz bütçesi (`eyeBudget: 'eye'`).
- [ ] Gelişim → Dikkat'te "İki kelimeyi yakaladığın süre" satırı; sonuç çipiyle aynı sözcük.
- [ ] 5 sn kapısı gerçek ekranla (390 ve 320, iki tema; beş yeni kişi, ≥ 4/5).

## 11. Riskler
| Risk | Önlem |
|---|---|
| Kısa sürede ekran süreyi tutmaz | Kare sayımı, `shownMs`, sapan deneme ölçüye girmez |
| Klavye önerisi cevabı ele verir | Öneri kapalı; cihazda denetim |
| Mikrofon yanlış duyar | Otomatik gönderme yok; kişi düzeltir |
| Ses sunucuya gider | `strictOnDevice`; desteklemeyen telefonda düğme yok |
| Kelimeler sıkar | 384 kelime, 7 gün tekrar yok, çift hiç tekrar yok |
| Ölçü güvenirliği bilinmiyor | Benzetimde tur içi ±%7; gerçek veriyle ilk 30 gün test–tekrar bakılır, `sdFloor` gerekirse yükselir |
| Hızlı okuma iddiası gibi algılanır | Kelime/dakika yok; iddia sınırı cümlesi; kanıt kartında Rayner 2016 |
