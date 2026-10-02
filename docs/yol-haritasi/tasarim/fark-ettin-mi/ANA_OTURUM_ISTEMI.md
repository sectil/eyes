# Fark Ettin mi? · ana oturum istemi (sürüm 2, 2026-10-01)

Sahip "kararlar senin olsun" dedi; plan kararları PLAN §9'da. "---" altındaki metin ana oturuma olduğu gibi yapıştırılır.

---

# Görev: "Fark Ettin mi?" modülünü baştan profesyonel hâle getir ve Gelişim ile Nef'e tam bağla

Sahibin istediği (kelimesi kelimesine özet): modül şu an basit duruyor; uygulamalı, profesyonel, eğlenceli ama kişiyi
geliştiren bir modül olacak. Gelişim'in istatistik bölümüne tam entegre çalışacak; Fark Ettin mi, Gelişim ve Nef
mükemmel uyum içinde olacak. Nef bu modülü bilecek, kullanımı anlatacak ve kişi bildirimleri açarsa gerçek hayatta
(evde, yolda, işte) canlı "fark ettin mi?" görevleri gönderecek. Kişi sıkılmayacak: Nef her gün asla aynı şeyi
yapmayacak. Her şey PubMed'deki test, deney ve makalelere dayanacak. 5 saniye kuralı ve mükemmellik geçerli.

## 0. Önce oku (sırayla, atlamadan)

Tasarım klasörü: `docs/yol-haritasi/tasarim/fark-ettin-mi/`
1. `PLAN.md` tamamı. Özellikle: §1 tur yapısı, §2 sahneler ve merdiven, §3 ölçüm ve Gelişim bağı, §4 Nef, §5 ekranlar,
   **§5b 15 bağlayıcı tasarım maddesi**, §6 aşamalar, §7 değişebilecek testler, §8 riskler, §9 kararlar, **§9b canlı
   görevler**, **§9c 13 sıkmama kuralı**, §10 cihaz denetim listesi.
2. `METINLER.md`: kullanıcıya görünen her cümle buradan gelir.
3. `arastirma/KAYNAKLAR.md`: 33 kaynak, PMID ve DOI'ler PubMed ile doğrulandı. §7 ve §8 ekleri değişim bulma ve canlı
   görev kaynaklarıdır.
4. `ARA_RAPOR_1_envanter.md`: modülün bugünkü hâli.
5. `kapi/` altındaki bütün kayıtlar: beş tur 5 sn kapısının bulguları. Aynı hataları tekrar etmemek için.
6. Maketler (yön ve içerik içindir, kapıdan geçmiş tasarım değildir): `maket/son.html?s=<ekran>&theme=<light|dark>`
   ekranlar: intro, change, found, ask, ask2, result, home, lock, hunt, lock2, evening, liveResult. Sahne çizim motoru
   taslağı `maket/scene.js`.

Uygulama tarafında oku:
- `app/src/modules/registry.js` (sözleşme; `progress`, `remind`, `routes`, `today`, `coach`)
- `app/src/modules/fark-ettin/manifest.js`, `view.jsx`; `app/src/screens/StreetWalk.jsx`; `app/src/lib/street.js`,
  `streetSvg.js`, `styles/street.css` ve `lib/street.test.js`
- `app/src/lib/progress.js` (ölçü kuralı v2, `V2_PARAMS`, satır 282–284: manifestteki `metrics[].v2` önce gelir)
- `app/src/lib/changeText.js` (`DIGITS`, `TRIM`, `verdictWord`), `app/src/lib/growthCenter.js`
- `app/src/lib/sources.js` (kaynak biçimi), `app/src/lib/ladders.js`, `app/src/lib/progression.js`
- `app/src/lib/moduleRemind.js`, `remindTexts.js`, `notifyApply.js` (kimlik aralıkları: modül hatırlatmaları 7800–7859)
- `docs/yol-haritasi/tasarim/nef/PLAN.md` §4.1–§4.8 (an motoru, tekrar etmeme hafızası, susma kuralları, `nef` alanı)
- `docs/yol-haritasi/IS_AKISI_KURALLARI.md`, `docs/yol-haritasi/HATA_GUNLUGU.md` (Build 29: Tek Bakışta ile
  `week3` dönüşümü bozulmaz)

## 1. Başlarken

- Sahibe bitiş saatini yaz: her aşama en çok 90 dk.
- Aynı anda en çok 2 iş akışı. Ajan sürelerine uy: uygulayıcı 25 dk, düzeltici 20, inceleyici 15, değerlendirici 3.
- Dal: ana oturumun çalıştığı dal; her aşama ayrı commit.
- Gelişim, Nef, Ana sayfa ve bildirim dosyaları başka oturumların alanı. Onlara yalnız aşağıda yazan **bağlantı
  satırları** için ve o işin sahibiyle sıraya koyarak dokun. Ana sayfa bileşenine (`TodayPath.jsx`, `Home.jsx`)
  dokunma; modül yalnız `today()` çıktısına `sub` verir.

## 2. Aşamalar (sırayla; her biri bitmeden sonrakine geçme)

### F1 · Sahne çizimi
Yap:
- `lib/streetScenes.js` (yeni): katmanlı sahne motoru. Katmanlar: gök → uzak silüet + pus → bina sırası (dükkân katı
  150 birim, tabela, tente, vitrin, kapı, üst katlarda pencere ve balkon) → kaldırım (kişiler, ağaç, lamba, bisiklet,
  kedi, satıcı) → yol (iki şerit araba) → ön kaldırım. Yükseklik 844 birim, ekranı doldurur, gök ≤ %20.
- Sahneler: Cadde, Pazar yeri, Park, Akşam caddesi; çeşitleme: yağmurlu cadde. Gündüz ve akşam paleti.
- Kişiler adım atar (bacak ve kol salınımı), arabalar kendi hızında akar; `prefers-reduced-motion`'da kişiler durur,
  sahne kayar.
- Tabelayı ağaç, lamba ya da kişi başı kesmez: ağaç ve lambalar bina aralarına konur, tabela kişi başının üstündedir.
- Görünüm kırpımı `vx, vy, vw, vh` ile yapılır (maketteki `renderStreet` gibi).
- `lib/streetSvg.js` bu motoru kullanır; eski dışa aktarımlar (`car`, `cat`, `bike`, `streetSVG`) testler için kalır
  ya da testler birlikte güncellenir.
Bitti: `street.test.js` çizim testleri geçer; yeni test: tabela kutusuyla ağaç, lamba ve kişi kutuları kesişmez.

### F2 · Mantık
Yap:
- Tur üç bölüm (PLAN §1): **Caddeden geç** (35–40 sn, sayma; görev sorusu 4 seçenek, puan 1 / ½ / 0),
  **Ne değişti?** (4 sahne), **Gözünden kaçan** (2 soru).
- `lib/streetChange.js` (yeni): değişiklik üretimi. Türler: renk, nesne gelir ya da gider, yer değiştirir, tabela.
  Değişen nesne tek başına durur, başka nesneyle örtüşmez, dokunma alanı ≥ 44 pt.
- Merdiven: kare nesne sayısı 8'den başlar; ilk bakışta bulunursa +2, ikinci bakışta aynı, bulunamazsa −2; sınır 6–30;
  son değer sonraki turun başlangıcı. Turun ölçüsü `changeN` = ilk ya da ikinci bakışta bulunan en kalabalık karenin
  nesne sayısı; hiç bulunmazsa `null`.
- Gözünden kaçan (sahip kararı 2026-10-02): "… vardı. Onu fark ettin mi?" Gördüm · Görmedim, sonra iki cevapta da
  seçenek. Yakalama sorusu yok (PLAN §9 madde 1).
- Sahne merdiveni `LADDERS['fark-ettin']` (PLAN §2 tablosu: F1 D0 Cadde, F2 D2 4 sahne, F3 D4 Pazar, F4 D7 Park,
  F5 D10 Akşam; V1 D14 yağmur, V2 D21 tabela değişikliği).
- **Sıkmama kuralları PLAN §9c madde 1–6** saf işlevler olarak; seçimler tohumlu ve geçmiş kayıtlara bakar.
- Kayıt (`makeRecord`): `type: 'street'` aynen; eklenen alanlar `scene`, `changeN`, `changes: [{ n, looks, found,
  kind }]`, `askedIds`, `answers[].saw`, `answers[].similar`, `answers[].catch`. Eski alanlar yazılmaya devam eder;
  `level` sahne basamağı olur (1..5).
Bitti: `streetChange.test.js` (yeni) ve `street.test.js`; **90 günlük tohumlu simülasyon testi**: §9c'nin modül
kuralları hiç çiğnenmez, aynı (sahne, sayma hedefi, soru seti) üçlüsü hiç tekrar etmez; eski kayıtlarla `isStreet`
ve `nextLevel` çalışır.

### F3 · Ekranlar
Yap (`screens/StreetWalk.jsx`, `styles/street.css`):
- Görev → Caddeden geç → Ne değişti? → Gözünden kaçan → Sonuç. Maketteki A yönü (sade kartlar).
- **PLAN §5b madde 1–7 hepsi.** Özetle: "Ne değişti?" karesi her genişlikte aynı 4:5; iki görüntü gerçekten görünür
  (3 sn, göz kırpar gibi yumuşak kararma, ikinci kare, "Değişen yere dokun"); bulununca sahne karartılmaz, değişen
  nesne parlar, halka dalgası ve hafif titreşim; silüet ya da sis cevabı ele vermez; üç seçenek tek satır; sonuç
  ekranında "her nokta bir nesne", 320 ve 390 aynı satırlar, boşluk yok; iddia sınırı cümlesi zafer anının altında
  değil, "Neye dayanıyor?" sayfasında ve ilk turun görev ekranında bir kez.
- Yanıp sönme yok; geçiş tek ve yumuşak (≥ 300 ms). Ses yok.
- Erişilebilirlik: renk seçeneklerinde ad + yuvarlak; VoiceOver etiketleri; dokunma ≥ 44 pt.
Bitti: 390 ve 320, iki tema, cihaz kaydı; **5 sn kapısı** (§4 bu istemde).

### F4 · Gelişim bağı
Yap:
- Manifest `progress.metrics`:
  - yeni `street-change`: label "Değişimi bulduğun sahne", unit `nesne`, better `up`, `v2: { familiar: 2, sdFloor: 1 }`,
    seri `changeN` olan kayıtlardan.
  - var olan `street-noticed`: silinmez, `v2: { rule: 'none' }` eklenir (soru beklendiği için hüküm kurmaz; eski
    kullanıcının grafiği kalır).
- Bağlantı satırı (Gelişim sahibiyle): `lib/changeText.js` `DIGITS.nesne = 1` ve `TRIM`'e `nesne` ("11 → 15 nesne",
  "14,5 nesne").
- Sonuç ekranı hüküm sözcüğünü ve sayıyı kendisi kurmaz: `metricStatusV2` + `changeText` + `verdictWord`'den alır;
  Gelişim ekranıyla aynı sayı ve sözcük. Başlangıç oluşurken "Başlangıç · k/8 gün".
- 5. gün raporu, PDF ve CSV metriği manifestten kendiliğinden alır; testle doğrula.
Bitti: Gelişim → Dikkat'te "nesne" satırı; `progress.test.js` ve `growthCenter.test.js` beklentileri PLAN §7'deki gibi;
eski metrik için eşdeğerlik testi 0 fark.

### F5 · Nef ve kaynaklar
Yap:
- `lib/sources.js`'e kaynaklar (pmid, doi, design, n, finding, limit; yalnız özette yazan): simons1999, simonsJensen2009,
  drew2013, kreitz2020, simons2024, schofield2015, pandit2022, simons2010, most2001, most2005, luck1997, dai2019,
  simons2016, chabris2011, labonte2022, jiang2018, killingsworth2010. Değerler `arastirma/KAYNAKLAR.md`'den; PMID'yi
  oradan kopyala, ezberden yazma (HATA_GUNLUGU Build 29 kuralı).
- `street.js` `FACTS` kartları bu anahtarlara bağlanır (DOI ve PMID tek yerden).
- Manifest `nef` alanı (Nef planı §4.8): `name` çekimleri ("Fark Ettin mi? alıştırması", "…alıştırmasında",
  "…alıştırmasından"), `metricWords: { 'street-change': 'nesne' }`, `evidence` (yukarıdaki anahtarlar), `note`,
  `cells` (METINLER N1–N4 ve canlı görev cümleleri). VARSAYIM: registry bilinmeyen alanı reddetmiyor; kontrol et.
  Nef kodu henüz yoksa alan veri olarak durur; Nef oturumu geldiğinde sözleşme testi bu modülde geçmeli.
- `coach()`: `rounds7`, `changeN7` (7 günün ortancası, Tek Bakışta `span7` gibi), `sceneStage`, `live7` (canlı görev
  sayısı). `noticedPct7` kalkar.
- `remind`: `{ route: 'fark-ettin', window: 'move', science: ['simons1999'] }`.
- "Beynin görmüş olabilir" cümlesi kalkar (METINLER Ş1).
Bitti: Nef planı §4.8 madde 3 sözleşme testi bu modül için yazılır ve geçer; her `evidence` anahtarı PMID + DOI taşır.

### F6 · Cihaz
PLAN §10 cihaz denetim listesinin hepsi; 60 fps ölçümü; eski kayıtlı telefonda eski grafik duruyor.

### F7 · Canlı görevler (PLAN §9b)
Yap:
- `lib/streetLive.js` (yeni): görev bankası ve seçimi. Türler: **Renk avı** (ev ya da iş: "Bulunduğun yerde 5 kırmızı
  şey bul", 60 sn), **Say ve sürpriz** (yürüyüş saatinden önce: "Yürürken sarı kapıları say. Cevabını akşam sorarım.";
  akşam 19.00–20.30: sayı + sürpriz soru Gördüm · Görmedim · Emin değilim), **Başını kaldır** (iş saatleri:
  "Ekrandan başını kaldır: etrafında daha önce fark etmediğin bir şey bul").
- `screens/StreetLive.jsx` ve route `fark-ettin-canli` (manifest `routes`). Ekranlar: renk avı (büyük 3/5 sayı, altında
  ince süre çubuğu, aranan rengin örnek noktası, "+1 Buldum"), akşam sorusu (sayı seçici, sayılan nesnenin göründüğü
  çizim, sürpriz soru), sonuç (sayı, Chabris 2011 bilim satırı, hafta şeridi, Nef sorusu iki açık düğmeyle: "Evet,
  gönder" · "Şimdilik hayır").
- Açma: modülde "Canlı görevler" anahtarı ve Profil → Bildirimler. Kapalıysa hiç bildirim yok.
- Bildirim modül hatırlatması yolundan (7800–7859), Nef'in kendi bütçesine sayılmaz. Planlayıcı kuralları: 01–05 yasak,
  sessizlik 23–07, iki bildirim arası ≥ 30 dk, çalışma oturumunda gelmez. Varsayılan haftada 2, kişi 4'e çıkarabilir.
  Akşam sorusu yalnız sabah görevi verildiyse gelir. Ekranda aynı anda tek canlı görev bildirimi kalır (süresi geçen
  silinir; köprü yoksa yeni iş olarak yaz, uydurma).
- **Sıkmama kuralları PLAN §9c madde 7–11** (tür dönüşümü, hedef 21 gün, sürpriz 30 gün, cümle 21 gün, saat ±20 dk,
  3 yanıtsızda 14 gün dinlenme ve bir kez "Canlı görevleri azaltayım mı?").
- Kayıt `type: 'street-live'`; Gelişim'de hüküm kurmaz, Dikkat alanında "canlı görev günü" olarak görünür.
- Güvenlik ve gizlilik: bildirim "telefona bakma" demez; araç kullanırken görev yok; kamera ve konum yok; tek
  kelimelik cevap telefonda kalır, Nef paketine girmez.
- Bağlantı satırları bildirim oturumuyla: `remindTexts` metin kaynağı, `notifyAll` sınır testleri.
Bitti: `streetLive.test.js`; 90 günlük simülasyonda §9c'nin bütün maddeleri; `moduleRemind.test.js` ve
`notifyAll.test.js`'te haftalık sınır ve 30 dk kuralı; cihazda kilit ekranı görüntüsü.

## 3. Metinler

- Görünür her cümle `METINLER.md`'den. Orada olmayan bir cümle gerekiyorsa: taslak yaz → 5 kişilik kapı → kendi
  onayın → sahibe sor. Kendin uydurup koyma.
- Her an hücresi için en az 6 cümle (sıkmama kuralı §9c madde 9 ve 12); eksik olanları bu yöntemle üret.
- Yasaklar: sağlık iddiası yok ("dikkatini artırır", "beynini geliştirir" yok); "beyin" ve "tanıma" yok; değişim
  sözcükleri yalnız "başlangıcından iyi", "değişim yok", "henüz belli değil", "başlangıç"; başkasıyla kıyas yok;
  emoji yok; suçlama ve "özledik" yok.
- İddia sınırı cümlesi: "Bu bir gözlem alıştırması. Günlük hayatta fark etmeyi artırdığı gösterilmedi."

## 4. 5 saniye kapısı (her ekranda, zorunlu)

- Değerlendirilen şey **cihazdaki hareketli ekranın kaydı** ve görüntüleri: 390 ve 320, açık ve koyu.
- Beş yeni, bağımsız değerlendirici (farklı yaş ve meslek; en az biri tasarımcı, biri tasarımdan anlamayan, biri 50
  yaş üstü). Soru: "5 saniyede etkilendin mi?" Yalnız evet ya da hayır; "idare eder" hayır. Geçme: en az 4/5.
- En çok iki tur. Geçmezse yöntemi değiştir ya da sahibe sor. Geçmeyen ekranı sahibe gösterme.
- Değerlendiriciler geçirse bile sen görüntülere bak; mükemmel bulmazsan sahibe gönderme.
- Sonuçları `docs/yol-haritasi/tasarim/fark-ettin-mi/kapi/` altına yaz.

## 5. Test ve doğrulama

- Aşama içinde yalnız ilgili test dosyaları: `npx vitest run <dosyalar>`. Sonda tam takım ve derleme bir kez.
- PLAN §7'deki listenin dışında bir test değişirse dur ve nedenini yaz.
- Yeni testler: `streetChange.test.js`, `streetLive.test.js`, 90 günlük sıkmama simülasyonu, tabela kesişme testi,
  Nef sözleşme testi bu modül için.

## 6. Kurallar

- Doğrulamadan iddia etme. Bilmediğin API, dosya ya da komutu uydurma; bakmadıysan "bakmadım" de.
- Varsayımları "VARSAYIM:" diye işaretle.
- Aynı yöntem iki kez başarısız olursa üçüncüyü deneme: dur, yöntemi değiştir ya da sor.
- İstenmeyen ek iş yok; kapsam bu istem ve PLAN.
- Ücretli çağrı yok (ses, görsel üretim, model) sahip onayı olmadan.
- Anahtarlar yalnız ortam değişkeninden; depoya ve sohbete yazılmaz. Kullanıcının e-postası dış servise gitmez.
- Daha önce düzeltilmiş bir hatayı yeniden "düzeltmeden" önce HATA_GUNLUGU ve git log'a bak.
- Commit yazarı `Claude <noreply@anthropic.com>`; ileti sonunda Co-Authored-By ve Claude-Session satırları; model adı
  geçmez. Push'tan önce `git fetch`.
- Sahibe yazarken sade, kısa Türkçe; parantez kullanma.

## 7. Bitti tanımı

- F1–F7 tamam, her biri kendi "Bitti" şartıyla.
- Tam test takımı ve derleme geçer.
- Her ekran cihazda 5 sn kapısından 4/5 ile geçti; kayıtlar `kapi/` altında.
- PLAN §10 cihaz denetim listesi tamam.
- Gelişim → Dikkat'te "nesne" satırı ve sonuç ekranı aynı sayıyı ve sözcüğü gösterir.
- Bu işte yapılan hatalar `HATA_GUNLUGU.md`'ye kural olarak yazıldı.
- Sahibe kısa rapor: ne yapıldı, ne kaldı, hangi VARSAYIM'lar ölçülecek.
