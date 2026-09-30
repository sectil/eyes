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
