# 5 sn kapısı · tur 2 (2026-10-02, son tur)

Görüntüler `maket/tur2/`. Beş yeni değerlendirici (tur 1'dekilerden farklı): D6 57 yaşında emekli bankacı · D7 33
yaşında ürün tasarımı yöneticisi · D8 46 yaşında lise müdür yardımcısı · D9 24 yaşında yazılım geliştirici · D10 40
yaşında klinik psikolog (nöropsikoloji).

Tur 1'den sonra yapılanlar: iddia sınırı 320'de de görünür ve yumuşatıldı; yanlış ekranında "Doğrusu / Sen" iki satır ve
yanlış harf işaretli; doğru ekranında yeşil parıltı ve "+1" rozeti, geri bildirim sahnenin içinde; yazma ekranında
"Ne gördün?" parlak, alt satırla; tek gönderme yolu (klavyenin Gönder'i), alanın yanında yalnız mikrofon; sonuç
grafiği basamak çubuklarına döndü; izin sayfasına geri alma yolu ve "Hayır, klavyeyle devam".

| Ekran | D6 | D7 | D8 | D9 | D10 | Sonuç |
|---|---|---|---|---|---|---|
| giris | E | E | E | E | E | **5/5 geçti** |
| goster | E | E | E | E | H | **4/5 geçti** |
| yaz | E | H | E | E | E | **4/5 geçti** |
| dogru | E | E | E | E | E | **5/5 geçti** |
| yanlis | E | E | E | E | E | **5/5 geçti** |
| sonuc | H | H | H | E | H | 1/5 kaldı (iki turda da) |
| sesizin | E | E | E | E | E | **5/5 geçti**; anlaşılırlık 5/5 (tur 1'de de 5/5) |

## Yöntem kararı
Sonuç ekranı iki turda geçmedi. Üçüncü maket turu yapılmaz (İş akışı kuralları 5). Yöntem değişir: ana oturum sonuç
ekranını aşağıdaki maddelerle gerçek kodda kurar ve **gerçek ekranla** (390 ve 320, iki tema, beş yeni kişi, ≥ 4/5)
kapıya sokar. Geçmezse sahibe gösterilmez, sahibe sorulur. Sonuç ekranının metinleri (METINLER R) taslak kalır.

## Bağlayıcı tasarım maddeleri (ana oturum uygular)

Geçen ekranlarda (küçük düzeltmeler; ekranın geçmiş hâlini bozmaz):
1. Doğru: "+1" rozeti pencere köşesine binmez; basamak çipinin yanında durur. "Sıradaki {ms} ms" yazılmaz (çip zaten
   söylüyor).
2. Yanlış: "Sen" satırında yalnız yanlış harf işaretlenir; doğru yazılan harfler beyaz kalır. "Doğrusu / Sen"
   etiketleri en az 13 px ve daha açık renk. "Sıradaki {ms} ms" yazılmaz.
3. Gösterim: kelime görünürken alan ipucu ("İki kelimeyi yaz") ve odak halkası gizlenir; klavye açık kalır (ekran
   zıplamasın), sahne baskındır. Sağ üstteki "HIZ" yazısı kalkar.
4. Yazma: merdiven aynı yerde kalır (yerleşim değişmesin) ama sönük.
5. İzin sayfası: metin geçtiği gibi kalır (anlaşılırlık iki turda 5/5). Klavye simgesi öteki iki simgeyle aynı çizgi
   biçiminde.
6. Merdiven uç yazıları ("Yavaş · 500 ms", "50 ms · Hızlı") en az 12 px ve daha açık renk.

Sonuç ekranı (iki turda bulunanlar):
7. Tek büyük sayı ve ne olduğu tek cümlede: "183 ms" altında "Bugünkü hızın: denemelerin çoğunu bu sürede doğru
   yazdın." gibi (metin sahip onayına gider). "Yerleştiğin" ve "basamak" büyük sayının yanında anlatılmaz; basamak
   yalnız küçük çipte.
8. "Gelişim:" öneki kalkar. Hüküm çipi Gelişim sözcüğüyle: başlangıç dönemindeyse "Başlangıç · 3/8 gün" ve hemen altında
   tek satır "8 günlük başlangıçtan sonra Gelişim değişimi söyler." (Gelişim'deki açıklamayla aynı sözcüklerle).
9. Grafik kendi kendini anlatır: çubuk yerine son 7 turun **ms** noktaları, eksen aşağı doğru hızlı ("hızlı" yazısı
   eksenin altında), kesikli başlangıç çizgisi; "Yüksek çubuk, hızlı tur" gibi açıklama yazısı olmaz.
10. "Bir kez yetiştin" kalkar; yerine "En hızlı doğru · 133 ms" (320'de de görünür) ya da hiç (sahip kararı).
11. Kavram sayısı en çok üç: bugünkü hız (ms), Gelişim hükmü, doğru sayısı. Tur, basamak, gün aynı anda yan yana durmaz.
12. 320'de satır düşmez; sığmazsa grafik kısalır.
13. Tavır: abartı yok (D10): büyük sayının yanında "yaklaşık" ya da ölçünün tanımı bulunur.

Not: Giriş'teki iddia sınırı cümlesi 5/5 geçti; üç kişi "heves kırıyor" dedi, bir kişi (D10) olumlu buldu. Sahibin
isteği gereği (dürüstlük) yerinde kalır.
