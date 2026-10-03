# 5 saniye kapısı · B1a yeni ekranlar (2026-09-30)

Ekranlar: Gece sessizliği (varsayılan ve "deney saati sessizlikte" uyarısı), birleşik bildirim (kilit ekranı ve
dokununca açılan ekran). Açık/koyu, 390/320. Beş değerlendirici (sahip, yazılımcı, öğretmen, vardiyalı hemşire,
tasarımcı). Hedef her ekranda en az 4/5.

| Ekran | Tur 1 | Tur 2 |
|---|---|---|
| Birleşik · kilit ekranı | 1/5 | 2/5 |
| Birleşik · uygulama | 2/5 | 3/5 |
| Gece sessizliği · varsayılan | 3/5 | 2/5 |
| Gece sessizliği · uyarı | 0/5 | 2/5 |

Ortak şikâyetler: bildirim "iki mola hazır" derken biri 15 dk sonraydı; eylem düğmeleri belirsizdi (planda birleşik
bildirime düğme yok); bilim kartı ekranın yarısını kaplıyor, asıl eylemi aşağı itiyor; üç yazı ailesi ve mono çipler;
zaman çizelgesi, lejant ve taralı "01–05 sabit" alanı 5 saniyede çözülmüyor; uyarı başlığı "değiştir" derken gövdesi
"yine gelir" diyordu ve "sessizlikte de gelenler" listesi molayı saymıyordu; turuncu "10.00" hata gibi.

**Karar:** İki tur geçmedi; aynı yöntem üçüncü kez denenmez. Yöntem değişti: içerik çelişkileri çözülmüş sabit metin
(zaman çizelgesi yok; birleşik bildirimde iki hatırlatma aynı saatte, düğme yok; bilim kartı eylemlerin altında, en çok
3 satır; uyarı bilgi renginde ve listeye mola eklenir) ve her ekran için üç ayrı yön; değerlendiriciler en iyisini seçer.

## Tur 3 · yöntem değişti: sabit metin, üç yön (A sakin, B iOS Ayarlar, C Nefona gece dili)

| Ekran | Seçilen yön | Seçen | Etkilenen |
|---|---|---|---|
| Gece sessizliği (G, G2) | C | 5/5 | **4/5 · geçti** |
| Birleşik bildirim (B1 kilit, B2 açılan ekran) | A | 5/5 | 1/5 · kaldı |

**Gece sessizliği C geçti.** Kodda giderilecek notlar: uyarı notu turkuaz değil saatlerin kehribar ailesinde; "01.00–05.00
arası her gece sessiz" satırı büyür ve koyulaşır; G2'de pasif "+" nedenini söyler ("en geç 10.00"). Tasarım:
`gece-sessizligi-C/`.

**Birleşik bildirim üç kez geçmedi; yeniden denenmez.** Şikâyetlerin hepsi açılan ekrana (B2) ait: başlık yok, soru
karşılıksız, ekranın alt yarısı boş. Plana göre bu dokunuş Ana sayfayı açar (§5.5 madde 4); B2 aslında Ana sayfanın
üstüdür ve Ana sayfa yeniden tasarlanıyor. Karar: birleşik bildirimin açtığı yer Ana sayfa tasarımına ("teklif yuvası"
ile birlikte) bağlanır; kilit ekranı bildirimi iOS'un kendi kartıdır, Nefona'nın değiştirebileceği yalnız metindir
(metin kapısında BR1–BR3).

## Uygulamadaki hâl (kodlanmış ekranlar, 2026-09-30/10-01)

| Ekran | Tur 1 | Tur 2 (yerleşim düzeltmesi) |
|---|---|---|
| "Bana hatırlat" satırı (bitiş ekranında) | 0/5 | 1/5 |
| Saat sayfası | 3/5 | 1/5 |
| Bildirimler | 1/5 | 2/5 |
| Gece sessizliği | **4/5 · geçti** | — |

Tur 2'nin ortak şikâyetleri yerleşim değil, içerik ve etkileşim kararı: satırda açık/kapalı durumu yok ("öneri mi,
kurulu mu?"; altındaki "Kaydet" neyi kaydediyor); "Sen karar ver"de konuşanın kim olduğu belli değil (değerlendiricilerin
önerisi "Nef seçsin" — onaylı metin değişikliği, sahip onayı ister); saat sayfası 16.30 derken Bildirimler "Nef seçti
11.15" diyor (tutarsızlık, doğrulanacak); bütün satırlarda aynı zil simgesi; bitiş ekranının ilk cümlesi "Tedavi
değildir…" kutlamayı söndürüyor (mevcut güvenlik metni; ayrı konu); vardiyalı çalışan için gündüz sessizliği yok (plan sınırı).

**Karar:** iki tur geçmedi; aynı yöntem üçüncü kez denenmez. Arayüz `App.jsx` `REMIND_UI = false` ile kapatıldı (satır ve
Bildirimler girişi görünmez; kimse modül hatırlatması kuramaz; plan bugünkü gibi). Yöntem değişikliği sahibe sunuldu.

## Yeni yöntem (sahip onayı "önerini uygula": anahtar, "Nef seçsin", modül simgeleri; üç yön) · 2026-10-01

Tutarsızlık denetimi: 16.30 / 11.15 farkı çekim düzeneğinin iki ekrana farklı tohum vermesinden; kodda hata yok. Not:
saat sayfası kayıtlı saati değil öneriyi gösterir; Bildirimler'den açılınca iki saat farklı görünebilir (tasarım konusu).

| Ekran | Seçilen yön | Etkilenen |
|---|---|---|
| F · bitiş ekranı + "Bana hatırlat" (anahtarlı) | B (kart yoğun) | 3/5 |
| S · saat sayfası ("Nef seçsin") | C (Nef öne çıkar) | 3/5 |
| N · Bildirimler (modül simgeleri) | C | 1/5 |

Kural: tasarım aşamasında bir ekran 3/5'in altında kaldığı için koda aktarılmadı. Ortak şikâyetler: F'de amber onay
işareti, turkuaz kart ve gradyanlı Kaydet düğmesi çatışıyor (onay işareti ve düğme bitiş ekranının mevcut öğeleri);
S'de Nef simgesi iki kez; "Önerilen" soluk; N'de her satırdaki Nef rozeti ve kapalı satırdaki gri nokta gürültü,
liste "sıradan ayar listesi", Gece sessizliği ikincil. Karar sahibe soruldu.

## Son tur (sahip seçimi "Son bir tur") · birleşik tasarım

| Ekran | Etkilenen |
|---|---|
| S · saat sayfası ("Nef seçsin", tek Nef simgesi, balon) | **5/5 · geçti** |
| N · Bildirimler (rozetsiz satırlar, gece sessizliği üstte) | **4/5 · geçti** |
| F · egzersiz bitiş ekranı + "Bana hatırlat" satırı | 0/5 |

F'nin şikâyetleri çoğunlukla bitiş ekranının MEVCUT öğelerine ait: amber onay rozeti ile turkuaz→mavi gradyanlı "Kaydet"
çatışması, uzun ve soluk uyarı paragrafı, "15 tekrar" tekrarı, anahtar ile "Kaydet" iki onay adımı gibi. Karar: bitiş
ekranındaki satır kapalı kalır (sahip: "4/5 çıkmazsa durdur"); geçen S ve N koda aktarılır, "Bana hatırlat" Profil →
Bildirimler'den kurulur. Bitiş ekranlarının renk ve düzen sorunu ayrı iş (bütün modüllerin bitiş ekranı). Tasarım: `b1a-son/`.

## Son tur · uygulamadaki hâl (koda aktarım sonrası) · S 2/5, N 1/5 · İŞ DURDU

Tasarımda geçen S (5/5) ve N (4/5) koda aktarıldı; uygulamadan çekilen hâl geçmedi. Başlıca neden bir içerik farkı:
aktarımda Bildirimler listesine hatırlatma alabilen yedi modülün hepsi eklendi; kurulmamış beşi aynı "Her gün 16.30"
önerisiyle alt alta duruyor ("yer tutucu gibi", "Hiçbiri üst üste gelmez" sözüyle çelişiyor). Ayrıca seçili sekme
dolgu yerine kontur (tasarımda dolgu). Sahip kararı ("4/5 çıkmazsa durdur") gereği B1a arayüzü durdu: iki bayrak da
kapalı (REMIND_ROW, NOTIFY_PAGE); kod ve testler duruyor. Yeniden açmak için gereken karar: Bildirimler yalnız kurulu
hatırlatmaları mı listelesin (+ "Hatırlatma ekle"), veri yokken öneri saati modül başına farklı mı olsun (plan: 16.30).

## D14 · yeniden açılış (sahip 2026-10-03: "Yalnız kurduklarım", "Modüle göre farklı"; testler için izin)

- Bildirimler yalnız kurulan hatırlatmaları listeler (kapatılan listede kalır); kurulmamışlar altta "Hatırlatma ekle"
  haplarında (saatsiz, anahtarsız; dokununca saat sayfası ya da Hatırlatmalar). Hiç yoksa "Henüz kurduğun hatırlatma
  yok." `NOTIFY_PAGE = true`; bitiş satırı (`REMIND_ROW`) kapalı kalır. Yürüyüş hapı zil yerine adım simgesi.
- Saat sayfası: belgedeki "seçili sekme dolgu yerine kontur" notu onaylı tasarımın kendi CSS'iyle (b1a-son/ekranlar.html
  `.seg > span.on`, kontur) çelişiyordu; uygulama tasarımla aynı, değiştirilmedi. Düzenekte Nef simgesi home.css ile.
- Düzenek `duzenek/` (nt.html, cek-nt.mjs; gerçek `registry.reminders()`), uygulamanın kendi ekranları.
- 5 sn kapısı tur 1 (5 kişi): kurulu 390 açık 5/5, kurulu 320 koyu 4/5, boş 390 koyu 5/5, boş 320 açık 4/5, saat sayfası
  390 açık 5/5, 320 koyu 5/5; "Hatırlatma ekle" 5/5, "Henüz kurduğun hatırlatma yok." 5/5. GEÇTİ.
- Notlar: Hızlı Bakış ile Yakala Yaz aynı şimşek simgesi (modüllerin kendi simgesi; ayrı iş). 320'de haplar tek tek alt
  alta düşüp uzun bir merdiven oluyor (geçti ama düzensiz denildi).
- Testler (sahibin izniyle değişti): `Notifications.remind.test.jsx` "kurulmamış modül…" → "yalnız kurulan…", yeni
  "hiç hatırlatma yoksa…", "App bayrakları" (NOTIFY_PAGE true). İkinci test değişmeden geçti. Eşdeğerlik testi geçti.
- Öneri saatleri (modüle göre, kaynaklı) ayrı adım: tablo sahibe; onaya dek 16.30.

## B2-2 · hava sayfası saatlik şerit (2026-10-03) · İKİ TUR GEÇMEDİ, sahibe gösterildi

Sahip: "saatlik şerit sağda kesiliyor". Düzenek: `duzenek/sky.jsx`, sahte 30 saatlik tahmin.

| Tur | 390 açık | 320 koyu | 320 açık | Başlıca sebep |
|---|---|---|---|---|
| 1 | 1/5 | 0/5 | — | "Şimdi" kart kenarına yapışık; 320'de "Değiştir" ve saat satırı kırılıyor |
| 2 | 0/5 | 2/5 | 2/5 | 390'da 7 sütun tam sığıyor, kaydırılabildiği belli değil; 320'de sağda 1–2 px kıymık; büyük 16° ile "Şimdi 14°" çelişkisi |

Tur 2 kodu `serit-tur2.patch`ta; uygulamaya girmedi. 16°/14°: düzenek verisi uç örnek, ama uygulamada da olabilir:
büyük sayı canlı `forecast.now`, şeridin "Şimdi" sütunu saatlik tahmin (`lib/skyView.js` nowView ve şerit).
İki tur kuralı gereği üçüncü tur yok; karar sahipte.
