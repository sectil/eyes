# Fark Ettin mi? · plan (sürüm 1, 2026-10-01)

Sahibin isteği: `SAHIP_ISTEGI.md`. Sonradan eklenen iki söz (2026-10-01, kelimesi kelimesine):
- "5 saniye kualları ve senin için mükemmel olmaaynı bana gönderme"
- "farkettin mi gelişimi istatisktle bölümüne tam entegre çalışır - farkettin mi - gelişim vee nef mükemmle uyum içinde
  olmalı --- herşey bilimsel pubmed test deney makalalerine dayanır"

Dayanaklar: `ARA_RAPOR_1_envanter.md` (bugünkü hâl), `arastirma/KAYNAKLAR.md` (29 kaynak, PMID'ler PubMed ile
doğrulandı), maketler `maket/`, kapı kayıtları `kapi/`, onaylı metinler `METINLER.md`.

## 0. Tek bakışta

| Bugün | Yeni |
|---|---|
| Tek sahne, düz çizim, ekranın yarısı boş gök | Ekranı dolduran, katmanlı, ışıklı sahneler: Cadde, Pazar yeri, Park, Akşam caddesi |
| Tek görev türü: say | Tur üç bölüm: **Caddeden geç** (say) → **Ne değişti?** (dokun, ölçü) → **Gözünden kaçan** (2 soru) |
| Seviye 1–3, yalnız kalabalık | Zorluk merdiveni: sahnedeki nesne sayısı, her turda kişiye göre (Simons & Jensen 2009; Luck & Vogel 1997) |
| Ölçü 0/33/67/100, soru beklenince bozuluyor | Ana ölçü **"Değişimi bulduğun sahne: N nesne"**; Gelişim'in ölçü kuralı v2 ile, değişim sözcükleri Gelişim'den |
| Sonuç yalnız bu tur | Sonuç ekranında başlangıç çizgisi, son turlar, Gelişim'le aynı hüküm sözcüğü |
| Nef'e öğretilmemiş | Manifest `nef` alanı, kaynaklar `sources.js`'te PMID ile; Nef ilk gün tanıtır, rekor ve doğrulanmış değişimi söyler |

İddia sınırı aynen kalır: "Bu bir fark etme alıştırması. Gerçek hayatta daha çok fark ettirdiği gösterilmedi."
Kanıtın söylediği: alıştırılan görevde ilerleme beklenir, günlük hayata aktarım için kanıt zayıftır (Simons 2016, PMID
27697851; Sala 2018, PMID 29239631). Bu yüzden ekranda yalnız "bu alıştırmadaki" ölçü ve "başlangıcından iyi" gibi
Gelişim sözcükleri geçer.

## 1. Tur yapısı (≈ 2 dk)

### 1.1 Caddeden geç (35–40 sn)
- Sahne sağdan sola kayar; kişi görevdeki şeyi aklından sayar (bugünkü gibi). Arabalar artık yolda kendi hızında akar
  (sahne kaymasından ayrı katman), kişiler adım atar (bacak salınımı, `prefers-reduced-motion`'da durur).
- Görev türleri sahneye göre: Cadde → mavi araba, sarı taksi, bisiklet, kedi; Pazar → karpuz, şapkalı satıcı, kırmızı
  sandık; Park → köpek, uçurtma, koşucu; Akşam → yanan vitrin, taksi.
- Sayı sorusu bugünkü gibi 4 seçenek; puanı (`task` 1 / ½ / 0) kayıtta kalır.
- Zorluk: görev yükü (sayılacak şeyin sayısı ve benzer çeldiriciler: mavi araba sayarken lacivert araba) — görev yükü
  arttıkça fark etme azalır (Simons & Chabris 1999, PMID 10694957; Cartwright-Finch & Lavie 2007, PMID 16480973).

### 1.2 Ne değişti? (4 sahne, ≈ 60 sn) — ana ölçü
- Sahnenin bir karesi 3 sn görünür. Ardından "göz kırpması": ekran 0,4 sn yumuşakça kararır (yanıp sönme yok, tek geçiş).
  Aynı kare tek bir değişiklikle geri gelir. Kişi değişene dokunur.
- Bulamazsa "Bulamadım, bir daha göster" (en çok 3 bakış). Üçüncüde de bulamazsa değişen yer gösterilir.
- Değişiklik türleri: renk (şapka kırmızı → mavi), nesne çıkar ya da gelir (bisiklet yok olur), konum (kedi yer
  değiştirir), tabela harfi. Değişim tek ve sahnede açık seçik görünür büyüklüktedir (≥ 44 pt dokunma alanı).
- Merdiven: karedeki nesne sayısı 8'den başlar. İlk bakışta bulunursa +2, ikinci bakışta aynı, bulunamazsa −2
  (en az 6, en çok 30). Son sahnenin sayısı bir sonraki turun başlangıcıdır (Tek Bakışta `span` ile aynı düzen).
  Dayanak: değişim bulmada başarı nesne sayısına bağlı (Luck & Vogel 1997, PMID 9384378; Rensink 2000, PMID
  10788653); merdiven yöntemi görev başarısını eşitler (Simons & Jensen 2009, PMID 19293113). Adım büyüklüğü VARSAYIM.
- Turun ölçüsü: değişimin ilk ya da ikinci bakışta bulunduğu en kalabalık sahnenin nesne sayısı (`changeN`).
  Bulunan hiç yoksa ölçü yazılmaz (kayıt yine olur, `changeN: null`).
- Kaçınılanlar: yanıp sönen tekrar (flicker) yok; değişim geçiş anında olur, ses yok.

### 1.3 Gözünden kaçan (2 soru)
- Önce "Onu fark ettin mi?" (Evet, gördüm / Hayır), sonra seçenek. Gerekçe: fark etmeyen kişi seçenekli soruda şanstan
  iyi tahmin ediyor (Kreitz 2020, PMID 32075496); önce beyan, sonra seçenek bu ikisini ayırır. Bugünkü "Fark etmedim,
  tahmin edeceğim" düğmesinin yerini alır; kayıtta `guess` aynı anlamı taşır.
- Sorulan ayrıntı her turda değişir: soru havuzu sahne başına ≥ 12 şablon, son 3 turda sorulan şablon tekrar edilmez.
  Gerekçe: bilen kişi bildiğini yakalar, başkasını yine kaçırır (Simons 2010, PMID 23397479).
- Ayrıntının zorluğu ayrı düğme: hedefe benzeyen ayrıntı (mavi şapka) kolay, uzak renk zor (Most 2001, PMID 11294235).
  İlk sürümde rastgele, kayıtta `similar: true|false` tutulur.
- Bu bölüm ölçü vermez (Gelişim'de hüküm kurmaz): soru beklendiği için fark etme ölçüsü değildir. Sonuç ekranında
  sonucu yazılır.

## 2. Sahneler ve ilerleyiş

- Merdiven `lib/ladders.js` biçiminde (`LADDERS['fark-ettin']`), `D` = modülün yapıldığı ayrı gün sayısı:

| Basamak | from (D) | Ne açılır |
|---|---|---|
| F1 | 0 | Cadde (gündüz). Ne değişti? 3 sahne |
| F2 | 2 | Ne değişti? 4 sahne |
| F3 | 4 | Pazar yeri |
| F4 | 7 | Park |
| F5 | 10 | Akşam caddesi |
| çeşitleme V1 | 14 | Yağmurlu cadde (şemsiyeler, ıslak yol yansıması) |
| çeşitleme V2 | 21 | Değişiklik türüne "tabela harfi" eklenir |

Eşikler VARSAYIM. Her gün sahne, açılmış olanlardan tohumla seçilir; aynı sahne art arda iki gün gelmez.
- Yaş ve kişi: başlangıç nesne sayısı herkes için 8 (Horwood 2016, PMID 26758974 yaşla fark etmenin düştüğünü gösterir;
  merdiven kişiye kendiliğinden uyar, yaş sorulmaz).
- Yolda yeri değişmez: 6. günden açılır, haftada 3 gün, Tek Bakışta ile `week3` dönüşümü (HATA_GUNLUGU Build 29
  düzeltmesi korunur). Süre 2 dk.

## 3. Ölçüm ve Gelişim'le tam bağ

### 3.1 Metrikler (manifest `progress.metrics`)

| key | label | unit | better | Hüküm | Seri |
|---|---|---|---|---|---|
| `street-change` (yeni, ana) | Değişimi bulduğun sahne | nesne | up | ölçü kuralı v2 | `changeN` olan kayıtlar |
| `street-noticed` (var) | Fark etme isabeti | % | up | **`v2: { rule: 'none' }`** | bugünkü seri aynen |

- `street-noticed` silinmez: eski kullanıcının grafiği kalır. Hüküm kurmaz, çünkü soru beklendiği için ölçü değil
  (Simons 2010) ve 3 soruda değer kaba. Gelişim'de görünür, "henüz belli değil" ile sınırlı kalır (Bugünün görevi
  `notice-count` ile aynı yol).
- `street-change` için `V2_PARAMS['street-change'] = { familiar: 2, sdFloor: 1 }` (ilk 2 ölçüm günü alışma; ilk
  turlarda öğrenme etkisi büyük: Moon 2024, PMID 39159930). SD tabanı 1 nesne VARSAYIM.
- Günlük ortanca, başlangıç (alışmadan sonraki 6 gün), haftalık Pazartesi bakışı, art arda 2 bakış: Gelişim'in
  `metricStatusV2` kuralı aynen. Modül kendi hükmünü kurmaz (DENETIM K1).
- Seviye karışması yok: ölçü zorluğun kendisidir (nesne sayısı), seviye ayrı değildir. Bu, onaylı SONSUZ_YOL §3
  "seviye içinde" şartını eski metrik için gereksiz kılar; eski metrik hüküm kurmadığı için sorun kalmaz.
- Güvenirlik: değişim bulma görevinde kişi-içi ölçüm makul tekrarlanıyor (Dai 2019, PMID 30718809: r 0,50–0,76; aynı
  saatte daha yüksek). Bizim sahne görevimiz için ölçülmedi: ilk 30 gün verisiyle denetim (§8).

### 3.2 Gelişim'e bağlanan yüzeyler (Gelişim ve ana oturum dosyaları; bu planda yalnız istek)
- `lib/progress.js` `V2_PARAMS`: `'street-change': { familiar: 2, sdFloor: 1 }`, `'street-noticed': { rule: 'none' }`
  (ya da manifestte `v2`; manifest yolu tercih: Gelişim dosyasına dokunmaz).
- `lib/changeText.js` `DIGITS.nesne = 1` ve `TRIM`'e `nesne` ("11 → 15 nesne", "14,5 nesne"). Gelişim dosyası.
- Gelişim alanı: Dikkat (awareness → dikkat), değişmez. Alan çipi örneği: "Dikkat: 11 → 15 nesne, başlangıcından iyi".
- 5. gün raporu, PDF ve CSV: metrik manifestten kendiliğinden girer; ek iş yok, testle doğrulanır.
- Sonuç ekranı hüküm satırını `metricStatusV2` + `changeText` + `verdictWord`'den alır; Gelişim ekranıyla aynı sayı ve
  sözcük (§5.5).

### 3.3 Kayıt (geriye uyumlu)
`type: 'street'` aynen. Eklenen alanlar: `scene` ('cadde'|'pazar'|'park'|'aksam'|'yagmur'), `changeN` (sayı | null),
`changes: [{ n, looks, found, kind }]`, `askedIds`, `answers[].saw` (beyan), `answers[].similar`. Eski alanlar
(`noticed`, `asked`, `task`, `level`, `seed`…) yazılmaya devam eder: `level` artık sahne basamağıdır (F1..F5 → 1..5).
Eski kayıtlarda `changeN` yok → yeni metrik onları atlar; `isStreet` aynı kalır.

## 4. Nef: modülü bilir, kullanımı anlatır, aynı veriden konuşur

Nef planı §4.8 sözleşmesine göre manifest `nef` alanı (Nef kodu gelince bağlanır; alanlar o güne dek zararsız veri):

```js
nef: {
  name: { yalın: 'Fark Ettin mi? alıştırması', de: "Fark Ettin mi? alıştırmasında", den: "Fark Ettin mi? alıştırmasından" },
  metricWords: { 'street-change': 'nesne' },
  evidence: ['simons1999', 'drew2013', 'kreitz2020', 'luck1997', 'dai2019', 'simons2016'],
  note: 'Fark Ettin mi?: sahnede bir şeyi sayarken ve iki görüntü arasındaki değişikliği ararken yapılan gözlem alıştırması. Ölçü: değişimin bulunduğu en kalabalık sahne (nesne). Günlük hayata aktarım gösterilmedi.',
  cells: { /* METINLER.md §N onaylı cümleleri */ },
}
```

| An (Nef planı §4.8) | Ne zaman | Kanal | Cümle |
|---|---|---|---|
| `firstTime` (modül tanıtımı) | Durağın yola ilk geldiği gün | Ana sayfa Nef kartı | METINLER N1 |
| `metricBest` | `changeN` ilk kez yeni en yükseğe çıktı (alışma günleri sayılmaz) | Ana sayfa satırı, ertesi açılış | METINLER N2 |
| `metricChange` | `street-change` hükmü `better` oldu (Gelişim'in doğrulanmış değişimi) | Ana sayfa kartı | METINLER N3 |
| bilim satırı | Turdan sonra, 7 günde en çok bir | Sonuç ekranı altı | METINLER N4 (Drew 2013) |
| `drift` | Turları farklı saatlerde; Dai 2019 aynı saat güvenirliği | Hatırlatma önerisi | Nef bankasındaki genel `drift` hücresi |
| Görev ekranı satırı | Her tur | Modül içinde (bugünkü Nef balonu) | METINLER M3 |

- Nef doğrulanmamış farkı söylemez (yalnız `better` hükmünde). Gerilemeyi söylemez (Gelişim ile aynı: sözcüksüz).
- Yeni sahne basamağı Nef kartı olmaz: Nef planı §9 kapısında basamak kartı 0/5 aldı; yeni sahne yol durağının alt
  satırında görünür (METINLER Y2).
- Haftalık mektup ve sohbet paketi: `coach()` aynen kalır, alanları güncellenir: `rounds7`, `changeN7` (7 günün
  ortancası, Tek Bakışta `span7` ile aynı ilke), `sceneStage`. `noticedPct7` kaldırılır (hüküm kurmayan ölçüyü Nef'e
  taşımamak için). Nef paketine kişisel metin girmez.
- `remind`: `{ route: 'fark-ettin', window: 'move', science: ['simons1999'] }` — "Bana hatırlat" kartı ve bilim
  satırı (bildirim planı A.1).
- Kaynaklar `lib/sources.js`'e eklenir (pmid, doi, design, n, finding, limit): simons1999, simonsJensen2009, drew2013,
  kreitz2020, simons2024, schofield2015, pandit2022, simons2010, most2001, luck1997, dai2019, simons2016. `FACTS`
  kartları bu anahtarlara bağlanır (DOI ve PMID tek yerden).

## 5. Ekranlar (maketler `maket/maket.html?s=…`, kapı sonuçları `kapi/`)

1. **Görev** (`intro`): üstte sahnenin kendisi (tam genişlik), görev kartı ikonla, tur bölümleri 01–03, Nef satırı,
   iddia sınırı, "Yürümeye başla".
2. **Caddeden geç** (`walk`): sahne bütün ekranı doldurur (gök ≤ %20), üstte görev çipi ve halka sayaç, altta ilerleme
   çizgisi.
3. **Ne değişti?** (`change`, `found`): kare 470 pt, bakış noktaları ve nesne sayısı; bulununca turkuaz halka ve "ne
   değişti" yazısı; "İlk bakışta · sıradaki sahne 16 nesne".
4. **Gözünden kaçan** (`ask`, `ask2`): önce Evet/Hayır, sonra renk ya da nesne seçenekleri; arada bulanık sahne
   (cevabı vermeyen, yalnız atmosfer).
5. **Sonuç** (`result`): bugünün sayısı büyük; altında Gelişim'in hüküm çipi ("11 → 15 nesne · başlangıcından iyi" ya
   da "başlangıç · 3/8 gün"); son turların çizgisi ve kesikli başlangıç çizgisi; sayma, fark ettin satırları; Bitti.
6. **Ana sayfa** (`home`): Nef kartı ilk gün (N1) ve yol durağı ("Ne değişti? · 2 dk", yeni sahne günü "Yeni sahne:
   Pazar yeri"). Durak görünümü Ana sayfa oturumunun bileşenidir; bu modül yalnız `today()` çıktısına `sub` verir.

Görsel dil: düz illüstrasyon + katman (uzak silüet, bina, kaldırım, yol, ön kaldırım), soldan ışık, sağ kenar gölgesi,
yere düşen yumuşak gölgeler, sınırlı renk paleti (uygulama turkuazı yalnız arayüzde ve bulunan değişimde). Akşam
paleti, lambaların ışığı. Tabelaları ağaç ve lamba kesmez (aralara konur). Hareket: kişilerde adım, arabalarda tekerlek
dönüşü; `prefers-reduced-motion`'da sahne kayar ama kişiler durur. Ses: ilk sürümde yok (§9 soru).

## 6. Aşamalar (ana oturum uygular)

| Aşama | İş | Dosyalar (izinli) | Bitti tanımı |
|---|---|---|---|
| F1 Çizim | Yeni sahne motoru: katmanlar, kişiler, arabalar, 4 sahne + yağmur; maket `scene.js`'ten taşınır | `lib/streetSvg.js` (yeniden), `lib/streetScenes.js` (yeni), `styles/street.css` | `street.test.js` çizim testleri; 4 sahnede tabela kesişmesi yok (test: ağaç/lamba x'i bina aralığında) |
| F2 Mantık | Ne değişti? üretimi (değişiklik seçimi, nesne sayısı), merdiven, soru havuzu ve tekrar etmeme, beyan → seçenek, kayıt alanları | `lib/street.js`, `lib/streetChange.js` (yeni), testleri | Tohumlu üretim; merdiven 6–30; son 3 turda aynı şablon yok; eski kayıtlar okunur |
| F3 Ekran | Akış: görev → geçiş → Ne değişti? → Gözünden kaçan → sonuç | `screens/StreetWalk.jsx` | Maketle birebir; 390/320, iki tema; erişilebilirlik (renk adı + yuvarlak, dokunma ≥ 44 pt) |
| F4 Gelişim | Metrikler, `v2` parametreleri, `nesne` birimi, sonuç ekranı hükmü | `modules/fark-ettin/manifest.js`; Gelişim dosyaları için §3.2 istekleri (Gelişim sahibiyle) | Gelişim alanı, rapor ve PDF'te "nesne" satırı; eşdeğerlik testi eski metrikte 0 fark |
| F5 Nef ve kaynak | `nef` alanı, `remind`, `coach()` alanları, `sources.js` kaynakları, `FACTS` bağlama | `modules/fark-ettin/manifest.js`, `lib/sources.js`, `lib/street.js` | Nef sözleşme testi (§4.8 madde 3) bu modülde geçer; her `evidence` anahtarı PMID+DOI taşır |
| F6 Cihaz | Cihaz denetimi (§10), 5 sn kapısı cihaz görüntüleriyle | — | §10 listesi tamam |

Her aşama sonunda yalnız ilgili testler; sonda tam takım ve derleme (İş akışı kuralları 4).

## 7. Değişebilecek testler

- `lib/street.test.js`: çizim ve üretim testleri yeniden yazılır (eski `LEVELS`, `nextLevel` 1–3 kalkar ya da sahne
  basamağına döner); tohum, tekillik, sayım tutarlılığı testleri korunur.
- `modules/registry.test.js` satır 97 fikstürü (`noticed/asked`) geçerli kalır; metrik sayısı testi varsa 2'ye çıkar.
- `lib/progress.test.js` satır 75–79: `street-noticed` `status` beklentisi `rule: 'none'` ile değişir (eski `metricTrend`
  aynen kalırsa değişmez; v2 hükmü 'unclear').
- `lib/growthCenter.test.js` satır 117–118: street serisiyle Dikkat hükmü; `rule: 'none'` sonrası beklenti değişebilir.
- `lib/today.test.js` (`STREET3`, satır 85, 95, 473, 536–538, 633–636, 678, 726): `today()` çıktısına `sub` eklenirse
  anahtar karşılaştırmaları etkilenmez; fikstür kopyası (633) güncellenir.
- `lib/progression.test.js` satır 173–227: açılma eşiği aynı; merdiven eklenince `stageOf('fark-ettin')` testleri eklenir.
- `components/TodayPath.test.jsx` satır 15: değişmez.
- `lib/exportData.test.js` satır 14: yeni metrik satırı eklenir.
- Yeni: `streetChange.test.js`, Nef sözleşme testi bu modül için.

## 8. Riskler

| Risk | Önlem |
|---|---|
| Sahne çizimi yavaş (uzun SVG, eski iPhone) | Sahne parçalara bölünür, ekran dışı katman çizilmez; F6'da 60 fps ölçümü |
| Ne değişti? çok kolay ya da çok zor | Merdiven; ilk 30 günün verisinde `changeN` dağılımı ve tavana vuran oranı denetlenir |
| Ölçü güvenirliği bilinmiyor | Dai 2019 benzer görevde makul; bizim görev için ilk 30 gün test-tekrar (ardışık iki gün) bakılır, düşükse SD tabanı yükseltilir |
| Eski kullanıcının grafiği değişir | `street-noticed` kalır, yalnız hüküm kurmaz |
| Renk körlüğü | Renk sorularında ad + yuvarlak (var); değişiklik türlerinin yarısı renk dışı (nesne, konum) |
| Işığa duyarlılık | Yanıp sönme yok; tek, yumuşak 0,4 sn kararma. Yine de `seizure` sorusu Tek Bakışta'daki gibi istenirse sahip kararı (§9) |
| Gelişim ve Nef dosyaları başka oturumda | §3.2 ve §4 bağlantı noktaları istek olarak yazıldı; F4–F5 o oturumlarla sıraya konur |

## 9. Sahibe sorular

1. Ses: sahne sesi (cadde uğultusu) ilk sürümde yok. İstenirse ücretli üretim (ElevenLabs ses efekti) onayınla.
2. Işığa duyarlılık sorusu: Ne değişti? geçişi yanıp sönme değil. Yine de Tek Bakışta'daki soruyu burada da soralım mı?
   Önerim: hayır.
3. "Beynin görmüş olabilir" cümlesi kalksın mı? Önerim: evet (METINLER Ş1 yerine).

## 10. Cihaz denetim listesi

- [ ] 390 ve 320 (iPhone SE), açık ve koyu: hiçbir ekranda taşma, kesik yazı yok; "Yürümeye başla" ilk ekranda.
- [ ] Geçişte sahne ekranı doldurur, gök ≤ %20; tabelaları ağaç ya da lamba kesmez.
- [ ] 60 fps (Instruments ya da `performance.now` kaydı), 40 sn boyunca takılma yok.
- [ ] Ne değişti? dokunma alanı ≥ 44 pt; yanlış yere dokunma "bir daha bak" sayılmaz, yalnız bakış düğmesi sayar.
- [ ] `prefers-reduced-motion`: kişiler durur, sahne kayar.
- [ ] VoiceOver: görev, soru ve seçenekler okunur; sahne `aria-label` ile.
- [ ] Mola kilidi ve göz bütçesi (`gates.eyeBudget: 'eye'`) aynen.
- [ ] Gelişim → Dikkat: "nesne" satırı, hüküm sözcüğü sonuç ekranıyla aynı.
- [ ] 5. gün raporu ve PDF'te yeni satır.
- [ ] Nef: 6. gün kartı (N1) bir kez; rekor satırı ertesi açılışta.
- [ ] Eski kayıtlı telefonda: Gelişim'de eski isabet grafiği duruyor.
