# 5 saniye kapısı · B2 hava ekranları (2026-10-01)

Üç yön (A sakin, B iOS yerlisi, C Nefona gökyüzü dili), beş değerlendirici (sahip, gizliliğe dikkat eden yazılımcı,
öğretmen, Gaziemir'de yaşayan vardiyalı hemşire, tasarımcı). Hedef en az 4/5.

| Ekran | Seçilen yön | Etkilenen |
|---|---|---|
| K · konum ve il/ilçe seçimi | C | **4/5 · geçti** (`K-C/`) |
| G · "Gaziemir'de misin?" | C | 3/5 |
| T · hava teklif kartı | C | 2/5 |
| R · weather rıza sayfası | B | 1/5 |

Notlar: R "metin duvarı" (onaylı rıza metni uzun; düzen uygulamanın mevcut rıza sayfasına alınacak); G'de ortada ölü
boşluk, neden bu ilçenin önerildiği yazmıyor; T çevresindeki Ana sayfa yer tutucu olduğu için "yarım" görünüyor —
T, birleşik bildirim gibi Ana sayfa tasarımına bağlandı. K için değerlendirici notu: "Yalnız İzmir" (ilçesiz devam)
seçeneği C'de yok; en yakın ilçe listenin başında önerilmeli.

Yeni metin adayları (sahip onayına): "Hangi ilçedesin?", "İlçe ara", "Yalnız İzmir", "Konumuna en yakın ilçe merkezi
bu.", "Konum" (sayfa başlığı).

## Tur 2 (2026-10-01)

| Ekran | Etkilenen |
|---|---|
| G · "Gaziemir'de misin?" (ölü boşluk azaldı, neden satırı, uzun ilçe adı) | **4/5 · geçti** (`G-tur2/`) |
| R · weather rızası, uygulamanın mevcut rıza sayfası düzeninde | 0/5 |

R iki turda geçmedi (1/5, 0/5); aynı yol üçüncü kez denenmez. Beşinin ortak şikâyeti: onay kutusu ve "İzin ver" ilk
ekranın altında; dört gri bilgi kutusu "sözleşme" gibi; pasif düğme soluk. Bu, mevcut rıza düzeninin (Sağlık rızası da
böyle) sorunu. Sahibe soru: katmanlı rıza (kısa özet + kutu + düğme ilk ekranda, dört bölüm açılır ayrıntı; metin harfi
harfine aynı). Metin notu: "90 günlük günlük hava özeti" tekrarı → "son 90 günün günlük hava özeti" önerisi (onaylı metin
değişikliği, sahip onayı ister). G değerlendirici notu: ekranın üst üçte biri hâlâ boş gradyan (NIT).

## Tur 3 · katmanlı rıza (sahip kararı) · 1/5

Üç turda geçmedi (1/5, 0/5, 1/5); yeniden denenmez. Şikâyetler: pasif "İzin ver" bozuk görünüyor ve neden basılamadığı
yazmıyor; dört kapalı başlık cevabı saklıyor (gizliliğe dikkat eden kişi cevabı ilk ekranda istiyor); sayfada faydanın
örneği yok; "resmî form" hissi. Gizlilik değerlendiricisinin içerik bulgusu: "Ne kadar kalır?" izin kapanınca yalnız
"il adı ve önbellek silinir" diyor; ilçe adı ve son 90 günün hava özeti için bir şey söylemiyor. Sahibe iki soru:
rıza sayfaları için ölçüt (etkilenme yerine anlaşılırlık) ve silme cümlesinin kapsamı.

## Tur 4 · anlaşılırlık ölçütü (sahip kararı) · **5/5 anladı · geçti** (`R-katmanli/`)

Beşi de ne istendiğini, verinin yurt dışındaki Apple hava servisine gittiğini ve "Şimdi değil" ile nasıl hayır
diyeceğini doğru yazdı (67 yaşında, teknolojiye alışkın olmayan değerlendirici dahil). Kodda giderilecek notlar: 320'de
"Nerede durur?" satırı solma efektinin altında kalıyor — yurt dışı bilgisi ilk ekranda tam görünmeli (sıra ya da
sabit alan); "Önce kutuyu işaretle" daha büyük ve koyu; "Ne işe yarar?" satırında açılır ok eksik.

## Hava sayfası · uygulamadaki hâl (2026-10-01) · yağmurlu gün 0/5 → 3/5, kuru gün 0/5 → 0/5 · GEÇMEDİ

Tasarım 07 (5/5) koda aktarıldı; il ve en yakın ilçe konumdan kendiliğinden (sahip kararı), "…'de misin?" adımı kalktı.
Uygulamadaki hâl iki turda 4/5'e ulaşmadı. Başlıca nedenler: kuru günde Nef'in cümlesi yok (onaylı metin yok, yer
tutucu `sky.nef.yagmurYok`) ve sayfa "sıradan hava parçası"na dönüyor; saatlik şerit kenarda kesik ("taşma hatası
gibi"); yağmurlu günde gökyüzü sözcüğü yok (`sky.gok`); 320'de başlık bloğu dağılıyor. Kod depoda ve yalnız TestFlight
test derlemesinde Bilgi → "Hava (deneme)" altında: amaç WeatherKit verisinin cihazda gelip gelmediğini sahibin görmesi.
Tasarım işi kapanmadı; eksik cümleler sahip onayına gidecek.
