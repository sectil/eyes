# Kelime Avı · ana oturum istemi (sürüm 2, 2026-10-02)

Tasarım oturumu `claude/metin-arama` dalında yürüdü (taslak PR #10). Sahip kararları PLAN §1'de. "---" altındaki metin
ana oturuma olduğu gibi yapıştırılır; tek başına okunacak biçimde yazıldı.

---

# Görev: "Kelime Avı" modülünü uygula; Gelişim ve Nef'e bağla

## 0. Ne yapılıyor, neden

Sahip başka bir uygulamanın "Metin Arama" alıştırmasını örnek gösterdi: kişi metinde istenen kelimeyi zaman bitmeden
bulur. Sahibin istekleri, kelimesi kelimesine özetle:
- Mantık benzer, uygulama kopya değil. O uygulamanın adı, simgesi, düzeni, renkleri, metinleri, puan ve yıldız sistemi
  alınmaz. Lisans riski yok.
- Metinler PubMed'deki bilimsel ve ilgi çekici çalışmalardan. Makale metni kopyalanmaz; bulgu Nefona'nın kendi sade
  Türkçesiyle kısa metne dönüşür, PMID ve DOI taşır. Sağlık iddiası ve korkutma yok.
- Gelişim merkezine bağlı, ölçü kuralı v2'ye uygun bir ölçü.
- "Ağ bağlı" = Nef'e bağlı. Metinler uygulama paketinde durur, internetsiz çalışır; yeni metinler sürümle gelir.
- Mükemmel ve kusursuz; 5 saniye kuralı.

Tasarım oturumunun çıktıları hazır: plan, 24 metin, görünen bütün cümleler, maket, 36 doğrulanmış kaynak, 6 tur kapı
kaydı. Sen uygulama kodunu yazarsın.

## 1. Önce oku (sırayla, atlamadan)

Tasarım klasörü `docs/yol-haritasi/tasarim/metin-arama/`. Ana dalda yoksa `claude/metin-arama` dalından oku
(`git show origin/claude/metin-arama:<yol>`).

| Dosya | Ne için |
|---|---|
| `SAHIP_ISTEGI.md` ve `sahip-ekran/` | Sahibin sözleri ve örnek uygulamanın 4 görüntüsü. Yalnız mantık örneği; hiçbir öğesi kopyalanmaz |
| `PLAN.md` tamamı | §1 sahip kararları, §3 tur yapısı, §4 metin kuralları, §5 ölçü ve Gelişim, §6 Nef, **§7 bağlayıcı tasarım maddeleri**, §8 aşamalar, §9 değişebilecek testler, §10 riskler, §11 cihaz listesi |
| `METINLER.md` | Görünen her cümle (A bölümü, kimlikli) ve 24 metin (B bölümü). Bu dosya dışında görünen cümle yok |
| `arastirma/KAYNAKLAR.md` | 36 kaynak; PMID ve DOI'ler PubMed aracıyla doğrulandı. A: alıştırmanın bilimsel temeli (12). B: metin kaynakları (24) |
| `ARA_RAPOR_1.md` | Araştırmadan çıkan tasarım sonuçları |
| `kapi/5sn-tur1.md` … `5sn-tur6.md`, `5sn-yonler.md` | 5 sn kapısının bütün bulguları. Aynı hataları tekrar etmemek için hepsini oku |
| `maket/maket.html` | Ekranların son hâli. `?s=intro|search|found|absent|result&theme=light|dark`; rekor hâli `?s=result&r=rekor`. Yön ve içerik içindir; tasarım tokenları uygulamanınki |
| `maket/metinler.js` | 24 metnin tek kaynağı: `{ id, src, type, title, text, targets: [{ w, t, r }] }` |
| `maket/denetle.mjs` | Metin kuralları; `node maket/denetle.mjs` "temiz · 24 metin" demeli |
| `maket/cek.mjs` | Maket ekran çekimi (Playwright; `node maket/cek.mjs <klasör> [ekranlar]`) |

Uygulama tarafında oku:
- `app/src/modules/registry.js` (sözleşme: `progress`, `sessions`, `today`, `remind`, `coach`, `routes`, `storageKeys`)
- `app/src/modules/tek-bakis/manifest.js` (en yakın örnek modül)
- `app/src/lib/progress.js` (ölçü kuralı v2: `V2`, `V2_PARAMS`, `UNIT_SD_FLOOR`, `metricStatusV2`, `metricParams`)
- `app/src/lib/changeText.js` (`DIGITS`, `TRIM`, `verdictWord`), `app/src/lib/growthCenter.js`
- `app/src/lib/sources.js` (kaynak biçimi, `DESIGNS`), `app/src/lib/ladders.js`, `app/src/lib/progression.js`
- `app/src/lib/moduleRemind.js`, `app/src/lib/remindTexts.js`
- `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.8 (manifest `nef` alanı ve sözleşme testi), `app/src/lib/nef/`
- `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/HATA_GUNLUGU.md`

## 2. Sahip kararları (bağlayıcı; tartışmaya açma)

| Konu | Karar |
|---|---|
| Ad | Kelime Avı (`id: 'kelime-avi'`) |
| "Ağ bağlı" | Nef'e bağlı; metinler pakette, internetsiz |
| Metin | PubMed'deki ilginç çalışmalar, 30–40 kelime, yalnız özette yazan, sağlık iddiası ve korku yok |
| Süre | Kelime başına 20 sn; ince çizgi ve "{s} sn kaldı"; büyük geri sayım yok |
| "Yok" hedefleri | Hedeflerin beşte biri (her turda 6 hedeften 1'i) |
| Ölçü | Doğru bulunan kelimelerin ortalama süresi; her kelime en çok 20 sn sayılır; ekranda "ortalama" yazılır |
| Sonuçta kıyas | Rekor yalnız kırılınca; rekor kartı ekranın en büyük öğesi, "{önceki} → {bu} sn" |
| Sonuç ekranı | PMID yok; Gelişim kutusu ilk 8 gün yok; puan, seri, yıldız yok |
| Arama ekranı kapısı | Soru "5 saniyede ne yapman gerektiğini anladın mı?"; öbür ekranlar "etkilendin mi?" |

## 3. Kurallar

- Görünen her cümle `METINLER.md`'den gelir. **METINLER henüz sahip onayında.** K2'ye başlamadan sahibe sor:
  "METINLER.md'deki ekran cümleleri ve 24 metin onaylı mı?" Onay gelmeden ekran koduna cümle girmez. Yeni cümle
  gerekirse önce sahibe sorulur.
- "beyin" ve "tanıma" sözcükleri Gelişim ekranlarında geçmez. Değişim sözcükleri yalnız "başlangıcından iyi",
  "değişim yok", "henüz belli değil", "başlangıç".
- Okuma hızı iddiası yok; iddia sınırı yalnız "Neye dayanıyor?" sayfasında (N5).
- Metin yazılırsa ya da değişirse: yalnız PubMed özetinde yazan söylenir; deneyi anlatan fiil özetteki fiille aynı
  olur; PMID ezberden yazılmaz, PubMed aracıyla doğrulanır.
- Gelişim, Nef, Ana sayfa ve bildirim dosyaları başka oturumların alanı. Onlara yalnız §5 K4'teki bağlantı satırları
  için ve o işin sahibiyle sıraya koyarak dokun. Ana sayfa bileşenine (`TodayPath.jsx`, `Home.jsx`) dokunma.
- Ücretli çağrı yok. Doğrulamadan iddia yok. Bilinmeyen API, dosya ya da komut uydurulmaz; varsayımlar "VARSAYIM:"
  diye yazılır. Aynı yöntem iki kez başarısız olursa üçüncüsü denenmez: yöntem değişir ya da sahibe sorulur.
- IS_AKISI: her aşama en çok 90 dk, sahibe bitiş saati yazılır; ajan süreleri (uygulayıcı 25, düzeltici 20,
  inceleyici 15, değerlendirici 3 dk); aynı anda en çok 2 iş akışı; çalışırken yalnız ilgili testler, tam takım ve
  derleme sonda bir kez. Her aşama ayrı commit; aşama sonunda sahibe en çok 15 satır sade Türkçe rapor.

## 4. İzinli dosyalar

Yeni: `app/src/lib/kelimeAvi.js`, `app/src/lib/kelimeAviTexts.js` (24 metin), `app/src/lib/kelimeAvi.test.js`,
`app/src/screens/KelimeAvi.jsx`, `app/src/styles/kelimeAvi.css` (ya da projenin stil düzeni neyse),
`app/src/modules/kelime-avi/manifest.js`, `app/src/modules/kelime-avi/view.jsx`.
Bağlantı satırı (sahibiyle sıraya): `app/src/lib/changeText.js`, `app/src/lib/progress.js`, `app/src/lib/sources.js`,
`app/src/lib/remindTexts.js` (KA1), Nef bankası (NF1–NF3, Nef oturumunun biçimiyle).
Değişebilecek testler: `registry.test.js` (canlı modül sayısı), `changeText.test.js` (`sn`), Nef sözleşme testi.
Başka bir test değişirse dur ve sebebini yaz.

## 5. Aşamalar (sırayla; biri bitmeden sonrakine geçme)

### K1 · Mantık (`lib/kelimeAvi.js`, `lib/kelimeAviTexts.js`)
Yap:
- Metinler `maket/metinler.js`'ten aynen taşınır. Alanlar: `id, src (sources.js anahtarı), type ('A'|'B'), title,
  text, targets: [{ w (aranan kelime), t ('E' kolay | 'S' benzer | 'Z' iki benzer | 'Y' metinde yok), r (kök) }]`.
  A tipi E, S, Y; B tipi E, S, Z.
- Tur: bir A + bir B metni = 6 hedef: 2 kolay, 2 benzer, 1 iki benzer, 1 yok. Zorluk merdiveni yok; sabit karışım,
  böylece günden güne süre aynı işi ölçer.
- Sıra: 12 A ve 12 B metni çiftler hâlinde sırayla; 12 turda havuz tekrar etmez. İkinci döngüde çiftler kayar ki aynı
  ikili tekrar etmesin (ör. A'nın i'si B'nin i+1'i ile). İmleç `localStorage['kelime-avi:next']`.
- Hedef sırası metin içinde karışık sunulur, metindeki sırayla değil (tohumlu).
- Eşleşme: dokunulan kelime baştaki ve sondaki noktalama atılıp `toLocaleLowerCase('tr')` ile küçültülünce hedefle
  aynıysa doğru. Kesme işareti kelimenin parçası ("Renoir'a").
- Sonuçlar: `hit` (doğru bulundu, ms), `wrongTap` (yanlış kelime; süre işlemeye devam eder, sayılır), `rightNo`
  (yok hedefinde "Yok"), `wrongNo` (kelime vardı ama "Yok"), `timeout` (20 sn doldu).
- `meanSec` = `hit` sürelerinin ortalaması, her süre en çok 20 sn, bir basamak. 3'ten az `hit` varsa `null`; tur
  kaydedilir ama Gelişim serisine girmez.
- Rekor: `best` = önceki turların en düşük `meanSec`'i; bu tur `meanSec < best` ise rekor. İlk turda rekor yok.
- Kayıt:
  ```js
  { type: 'kelime-avi', date, durationMs, texts: [idA, idB],
    items: [{ w, kind, ms, result, wrongTaps }], meanSec, hits, present, rightNo, noItems, wrongTaps }
  ```
Bitti (`kelimeAvi.test.js`):
- `denetle.mjs` kurallarının hepsi test olarak: 24 metin; her metin 30–40 kelime; tür dizilişi A=ESY, B=ESZ; E, S, Z
  hedefi metinde tam bir kez; S'de kökle başlayan en az 1, Z'de en az 2 başka biçim; Y metinde yok ama kökle başlayan
  biçim var; **hedef metindeki başka bir kelimenin başında geçmez** (kapı tur 2'nin "haksız yok" bulgusu); aynı
  kaynak iki kez yok; yasak sözcükler (beyin, beyni, tanıma, tedavi, hastalık, kanser, ölüm) yok.
- `meanSec`: 20 sn sınırı, 3'ten az doğruda `null`, bir basamak.
- Eşleşme: büyük harf, Türkçe İ/ı, noktalama, kesme işareti.
- 90 günlük tohumlu simülasyon: aynı metin ikilisi tekrar etmez; her turda karışım 2E+2S+1Z+1Y.

### K2 · Ekranlar (`screens/KelimeAvi.jsx`, stil)
**Önce METINLER onayı (§3).** Akış: Giriş → Metin 1 (3 hedef) → geçiş → Metin 2 (3 hedef) → Sonuç. Ayrıca "Neye
dayanıyor?" sayfası. Cümle kimlikleri METINLER'deki gibi.
- **Giriş** (kapı 5/5): G1 "Dikkat · 2 dk", G2 başlık, G3; örnek kart: küçük aranan kelime kartı ("kuzgunlar",
  "2,4 sn" çipi) ve G3b metni, "kuzgunlar" halkalı vurguyla; adımlar G4a–G4c; "Neye dayanıyor?" bağlantısı; Başla.
  İddia sınırı girişte yok (kapı tur 1: 5/5 motivasyonu düşürdü). Sonraki turlarda kısa giriş: başlık ve Başla.
- **Arama** (kapı 5/5, anlaşılırlık): üstte çarpı, 6 parçalı ilerleme çizgisi, "{n}/6". Ortada A1 "Bu kelimeyi bul ve
  dokun", altında aranan kelime büyük ve renkli (görüntü yazı tipi), altında süre çizgisi ve A1b "{s} sn kaldı"
  ikincil renkte, kelimeyle yarışmaz. Metin kartı: kâğıt rengi, sol kenarda renkli şerit, içerik kadar yüksek; yazı
  390'da 24 px / 1,55, 320'de 18,5 px / 1,5. Aranan kelime ve kart birlikte dikey ortalı; A2 "Metinde yok" düğmesi
  altta. Arama sırasında kartta yalnız metin: kaynak satırı yok, daha önce bulunan kelimeler işaretli kalmaz (kapı tur
  1: ipucu gibi okundu), puan yok. 40 kelimelik metin 320×568'de kaydırmasız sığar; sığmazsa yazı küçülmez, metin
  kısalır (sahibe sorulur).
- **Bulma anı** (kapı 4/5): üstte A4a "Buldun" onay işaretiyle, aranan kelime ve A4b "{s} saniyede" yeşil; süre
  çizgisi kalkar. Metindeki kelime dolu renk ve halka. Hafif titreşim; 0,9 sn sonra sıradaki hedef. "Metinde yok"
  soluk.
- **Yanlış dokunuş**: kelime kısa sallanır, renk değişmez; A5 "Bu değil" yalnız sesli okuyucuya.
- **"Yok" doğru** (kapı 5/5): A7a "Doğru, metinde yok" yeşil, aranan kelime yeşil; altında A7b "Kesik çizgili kelimeler
  benzer ama aynı değil."; metinde kökle başlayan biçimler kesik çizgili kutuda, **üstü çizili değil** (kapı: "yanlış"
  gibi okundu); düğme A7c "Devam".
- **"Yok" yanlış**: A8 ve kelime işaretlenir. **Süre doldu**: A6a ya da A6b.
- **Geçiş**: A9 "Sıradaki metin", biten metnin başlığı ve A3 kaynak satırı (yazar · dergi · yıl · PMID); 1,5 sn ya da
  dokununca.
- **Sonuç**:
  - Rekor kırıldıysa (kapı 5/5): rekor kartı en büyük öğe; S0 "Yeni en iyi turun", S0b "{önceki} → {bu} sn"
    (önceki üstü çizili), S0c "Önceki en iyin {önceki} sn idi · {d}/6 doğru". Ton ölçülü (birkaç ölçüme dayanır).
  - Rekor yoksa: S1 "Bu turdaki ortalaman", büyük S2 "{x} sn", sağda S2b "{d}/6 doğru". 3'ten az doğruysa S3b.
  - Altında S4 "Kelimelerin": altı kutu üç sütunda, kelime üstte, sonuç altta (S4b: "{s} sn", "yok, doğru",
    "metindeydi", "süre doldu"). 320'de başlık gizli, kutular görünür.
  - S7 "Bugün okuduğun": iki metnin başlığı ve "{Yazar} ve ark. · {Dergi} {Yıl}"; PMID yok; 320'de kaynak satırı
    görünür (kaynak, ekran daralınca ilk feda edilen olmaz).
  - Gelişim satırı: başlangıç oluşana kadar (2 alışma + 6 başlangıç günü) yok; sonra tek satır S5 + S6, hüküm sözcüğü
    ve sayı `metricStatusV2` + `changeText` + `verdictWord`'den; modül kendisi kurmaz.
  - S8 "Tamam". Puan, seri, yıldız, XP yok.
- **Neye dayanıyor?**: N1–N6 ve kaynakları (sireteanu1995, rayner1996, rayner-raney1996, chun1996, wolfe2021,
  rayner2016).
- Genel: yanıp sönme yok, geçişler tek ve yumuşak; ses yok; her kelimenin dokunma alanı ≥ 44 pt yüksekliğe genişler,
  komşuya taşmaz; kelimeler sesli okuyucuda tek tek seçilebilir; renk tek başına bilgi taşımaz; `prefers-reduced-
  motion`'da halka ve sallanma yok; ikincil metin en az 12 px ve `ink-2`; ekran gizlenirse süre durur, hedef yeniden
  başlar.
Bitti: 390 ve 320, iki tema, cihaz kaydı; §6 kapısı.

### K3 · Manifest (`modules/kelime-avi/manifest.js`, `view.jsx`)
```js
id: 'kelime-avi', title: 'Kelime Avı', label: 'Kelime Avı', ring: 'attention', kind: 'practice',
home: { section: 'practice', order: /* ana oturum */ },
storageKeys: ['kelime-avi:next'],
progress: { domain: 'focus', metrics: [{
  key: 'kelime-avi-time', label: 'Kelime bulma süresi', unit: 'sn', better: 'down',
  v2: { familiar: 2, sdFloor: 0.3 },
  series: ({ sessions }) => sessions.filter(isKelimeAvi).filter((s) => Number.isFinite(s.meanSec))
    .map((s) => ({ date: s.date, value: s.meanSec })) }] },
sessions: { match: isKelimeAvi, countsTowardGoal: true, describe(s, { seconds }) { /* "3,0 sn · 5/6" */ } },
remind: { route: 'kelime-avi', window: 'move', science: ['sireteanu1995'] },
coach(sessions, now) { /* rounds7, mean7 (7 günün tur ortalamalarının ortancası), hitRate7, best */ },
today(ctx) { /* haftada 2 gün, 2 dk durak, sub: KA2 "Bilimden iki kısa metin"; açılma günü lib/ladders.js kararı */ },
```
- `gates` yok: göz bütçesine sayılmaz (okuma işi). VARSAYIM: `eyeBudget` kuralı farklı yorumlanırsa sahibe sor.
- `sdFloor: 0.3` sn VARSAYIM; ilk kullanıcı verisiyle gözden geçirilir.
- `today`: VARSAYIM yol 10. günden sonra; `lib/ladders.js` sahibinin kararı.
Bitti: `registry.test.js` geçer; Gelişim → Dikkat'te "Kelime bulma süresi" satırı görünür; 5. gün raporu, PDF ve
CSV metriği manifestten alır (testle doğrula).

### K4 · Bağlantı satırları, kaynaklar, Nef
Yap (her biri o dosyanın sahibiyle sıraya):
- `lib/changeText.js`: `DIGITS.sn = 1` ("3,0 sn"); `TRIM`'e eklenmez.
- `lib/progress.js`: `UNIT_SD_FLOOR.sn = 0.3` (manifestteki `v2` zaten önce gelir; tutarlılık için).
- `lib/sources.js`: 36 anahtar, değerler `arastirma/KAYNAKLAR.md`'den kopyalanır (authors, year, title, journal, cite,
  doi, pmid, design, n yalnız özette yazdığı kadar, finding). **PMID ve DOI ezberden yazılmaz** (HATA_GUNLUGU).
  - A (alıştırmanın temeli): treisman1980, duncan1989, wolfe1994, wolfe2017, wolfe2021, chun1996, rayner1996,
    rayner-raney1996, rayner1998, sireteanu1995, pambakian2004, rayner2016.
  - B (metinler): howard2018, kabadayi2017, pardo2024, ishiyama2016, reinhold2019, khait2023, dolensek2020,
    medeiros2021, andics2016, shwartz2020, kohda2019, saito2019, nawroth2018, kareklas2013, porter2007,
    hashimoto2016, king2013, vangiesen2020, nath2017, bohm2016, johnson1991, watanabe1995, newport2016, smith2016.
- `remindTexts.js`: KA1 "Bugünün metni hazır: iki dakikalık Kelime Avı."
- Manifest `nef` alanı (Nef PLAN §4.8): `name` (Kelime Avı · Kelime Avı'nda · Kelime Avı'ndan · Kelime Avı'nı ·
  Kelime Avı'na), `metricWords: { 'kelime-avi-time': 'saniye' }`, `evidence` (sireteanu1995, chun1996, rayner1996,
  rayner2016, wolfe2021 ve metin kaynakları), `note` ("Bilimden kısa metinlerde aranan kelimeyi bulma alıştırması;
  ölçü kelime bulma süresi."), `cells` NF1–NF3 (taslak; son biçim Nef oturumunun onaylı cümle düzeniyle).
  VARSAYIM: registry bilinmeyen alanı reddetmiyor; kontrol et. Nef kodu henüz yoksa alan veri olarak durur.
Bitti: `changeText` ve `progress` testleri; Nef sözleşme testi (Nef PLAN §4.8 madde 3) bu modül için geçer; her
`evidence` anahtarı PMID + DOI taşır.

### K5 · Cihaz (PLAN §11)
- 320×568 ve 390×844'te en uzun metin kaydırmasız sığıyor; iki tema.
- Kenar ve satır sonu kelimelerine dokununca doğru kelime seçiliyor.
- Süre dokunma anından ölçülüyor; uygulama arka plana gidince süre duruyor, hedef yeniden başlıyor.
- Sesli okuyucu sırası: aranan kelime, metin, "Metinde yok".
- Gelişim → Dikkat'te satır; 8 gün sonra hüküm sözcükleri.
- İnternetsiz açılıyor. 60 fps.

## 6. 5 saniye kapısı

- Her ekran **gerçek koddan** 390 ve 320, açık ve koyu temada beş bağımsız değerlendiriciye gösterilir. Değerlendirici
  kimlikleri tasarımdakiyle aynı olabilir: ürün tasarımcısı 34, emekli öğretmen 61 gözlüklü, öğrenci 22, göz doktoru
  45, muhasebeci 38 (istem örnekleri `kapi/degerlendirici-*.md`).
- Soru "5 saniyede etkilendin mi?", "idare eder" hayır; arama ekranında "5 saniyede ne yapman gerektiğini anladın mı?".
  En az 4/5. 320'de taşma, kesilme ya da okunmama varsa hayır. En çok iki tur; geçmezse yöntem değiştir ya da sahibe
  sor. Değerlendiriciler geçirse de kendin mükemmel bulmazsan sahibe gösterme.
- Tasarım oturumundaki sonuç (maket): giriş 5/5, arama 5/5, bulma anı 4/5, yok kararı 5/5, sonucun rekor hâli 5/5.
  **Sonucun sıradan tur hâli geçmedi (tur 6: 0/5).** Gerçek kodda bütün ekranlar yeniden sınanır.

## 7. Açık konular (sahip kararı ister; kendin karar verme)

1. **Sonucun sıradan tur hâli.** Beş değerlendiricinin beşi "büyük sayı iyi mi kötü mü belli değil" diyor; seri, XP,
   "dünden hızlı" istekleri sahibin "puan ve yıldız yok" ve Gelişim değişim sözcükleri kurallarıyla çelişiyor.
   Kurallara uyan öneri: rekor kırılmadığında küçük bir "En iyi turun {x} sn" satırı. Bu, sahibin "rekor yalnız
   kırılınca" kararını değiştirir; sahibe sor.
2. **METINLER onayı** (§3): K2'den önce.
3. **"papağanlarda"** 320'de sonuç kutusuna sıkışık sığıyor: kutu iç boşluğu ayarlanır, yazı küçültülmez.

## 8. Tasarımda bulunan ve tekrarlanmayacak hatalar (kapı kayıtlarından)

- Metne özette olmayan yöntem ayrıntısı yazıldı (arılar "kartı sıranın başına koydu"); düzeltildi. Kural: deneyi
  anlatan fiil özetteki fiille aynı.
- Aranan kelime metindeki daha uzun bir kelimenin başında geçiyordu ("arıların" / "arılarına"); "Yok" haksız göründü.
  Kural: hedef başka kelimenin başında geçmez; benzer biçimli hedefte uzun biçim aranır.
- Taşma denetimi yalnız ekran altını ölçtü, kutunun iç taşmasını kaçırdı; 320 beş kişide de bozuk çıktı. Kural:
  kutu içi taşma da ölçülür.
- "ortanca", "tipik", "Gelişim her hafta bakar", "Başlangıç · 3/8 gün" sonuç ekranında anlaşılmadı; kaldırıldı.
- "17 saat" özette "17 saate kadar"; başlık bozuk Türkçeye düştü; "Bugün öğrendiğin" kazanım ima etti ("okuduğun"
  oldu). Bilim dilinde abartı yok.
- Arama sırasında daha önce bulunan kelimenin vurgulu kalması ipucu gibi okundu; bulunan kelime işaretli kalmaz.
- Bir CSS sınıf adı başka bileşenin yazı tipini taşıdı (`.big`); stil sınıfları bileşene özgü olur.

## 9. Bitince
- `node maket/denetle.mjs` ve `npx vitest run app/src/lib/kelimeAvi.test.js` temiz; tam test takımı ve derleme sonda
  bir kez.
- Sahibe 15 satırı geçmeyen rapor: aşamalar, kapı sonuçları, açık konular.
