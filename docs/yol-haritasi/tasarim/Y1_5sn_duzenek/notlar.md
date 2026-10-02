## 5 saniye turu 2'den sonra (2026-09-30, yeniden çekim; depoda değişen dosyalar aşağıda)

İlk görünüm yeniden düzenlendi (yalnız Y1 dosyaları ve stilleri; metinler aynı, hiyerarşi ve görsel değişti):
- **Ana sayfa:** günün diyaframı ve büyük "0 / N" kalktı. Selamın altında sayı hapları (seri mercek renginde yalnız
  3 gün ve üstündeyse, değilse "N gün seninle"; aynı sayı iki kez yok; hafta "Bu hafta 1/3 gün"; noktalar yok). Altında
  tek "Bugün" kartı: büyük "≈8 dk" ve "4 durak" (başlayınca "≈11 dk kaldı · 4/10 durak"; bitince "10/10 durak"), günün
  zinciri (her durak yoldaki çizimiyle; biten dolu ve onaylı, sıradaki halkalı) ve büyük düğme. Nef satırı düğmenin
  tekrarıysa ("Güne X ile başla.") çizilmez; durağın alt satırı düğmede. Yol, sıradaki durakta Nef baloncuğu ve "Başla"
  çizmez (büyük düğme söylüyor; az önce biten durak varsa baloncuk yine çıkar); "Yeni" o durakta düğmede. Bölüm
  etiketindeki "≈ N dk göz" yazılmıyor. Sekme çubuğu %95 opak (arkasından yazı okunmasın).
- **Nefes (yoldan):** kanıt cümlesi "Güçlü kanıt ⌄" rozetinin arkasında (dokununca açılır); "Bugünün ritmi: 5 · 5"in
  altında "5 sn al · 5 sn ver · dakikada 6 nefes"; program şeridinin 28 noktası ve "1 dakikada sakinleş" kartı ilk
  görünümden çıktı (kart kalıpların altında). Kanıt rozeti, bölüm başlığı ve "1 · gergin / 5 · çok sakin" gövde yazısıyla.
- **Nefes bitişi (yoldan):** içerik ortada toplu; bitiş işareti 132 → 112 px; altında günün zinciri ve
  "Bugünün yolu · 5/10 durak"; Kaydet ile "2 dk daha" yan yana; puan beklerken Kaydet gri değil, vurgu renginde soluk.
- Ölçü betiğinin "Yeni görünen" sütunu yalnız yoldaki etiketleri sayar; sıradaki durağın "Yeni"si artık büyük düğmede.

## 5 saniye turu 1'den sonra (2026-09-30, yeniden çekim)

Aşağıdaki ilk gözlemlerden 2, 3, 5 ve 8 artık geçerli değil: ilk görünüm Ana sayfanın üstüdür (kaydırma 0; yol yalnız
az önce bir durak bittiyse sıradaki durağa kayar). İlk görünümde selam, günün diyaframı, "N / M durak · ≈X dk kaldı",
Nef satırı ve "Güne başla" düğmesi var; sıradaki durak yeniyse düğmede ve baloncukta "Yeni" hapı var (ölçü betiği
`newNowNoTag`'i erişilebilirlik etiketinden saydığı için 2. gün Sağ–sol'u hâlâ "etiketsiz" yazar). Sayısı 0 olan seri,
hafta ve "gün seninle" satırları çizilmez. Gelişim haritası yolun altına indi. Baloncukta tire bölünmez. Nefes bitiş
ekranında (yoldan açılan seans) "2 dk daha" Kaydet'in altında.

## Gözlemler (2026-09-30 çekimi; kod o günkü depo, hiçbir dosya değiştirilmedi)

1. **Yolda yoga yok.** Düzenek yoga durağını iPhone'daki gibi hesaplatıyor, ama `lib/yogaLessons.js`'te yalnız Ders 2 · 15 dk
   yayımlı; yolun istediği 3 ve 5 dk sürümler yayımlanmadığı için yoga hiçbir günde yola girmiyor. Bu yüzden 9. gün yol
   **15 dk** (plan §3.A.9 tablosu yoga dâhil 18 dk; `today.test.js` bütün dersleri yayımlı sayıyor). Yoga dışındaki duraklar
   test ve tablo ile birebir aynı.
2. **İlk görünüm Ana sayfanın üstü değil.** `TodayPath` açılışta sıradaki durağı ekranın ortasına kaydırıyor (390'da
   ≈ 475 px, 320'de ≈ 550–585 px). Bu yüzden "durak · ≈N dk kaldı" satırı, seri ve hafta sayıları ilk görünümde yok.
   1. günün "8 dk"sı ilk görünümde hiçbir yerde yazmıyor; görünenler "1. bölüm ≈ 1 dk göz" ve "Mola · 1 dk".
3. **Sıradaki durak yeniyse "Yeni" yazmıyor.** 2. gün Sağ–sol hem yeni hem sırada; etiketinin yerinde Nef baloncuğu
   ("Hadi · İlk durak: Sağ–sol · 1 dk") var ve "Yeni" yok. Rozet yalnız erişilebilirlik etiketinde (", yeni"). 2. günün ilk
   görünümünde görünen tek rozet "Mola · Yeni / Nefes · 2 dk"; 390'da Okuma'nın rozeti sekme çubuğunun altında kalıyor.
4. **9. gün ve güncelleme günü ilk görünümde rozet yok.** Rozetli duraklar 2. bölümde: 9. gün Daire; eski kullanıcıda
   Nefes ("Günün ritmi"), Yukarı–aşağı ve Bugünün görevi. Kişi ilk 5 saniyede yeni bir şey görmüyor (üst satırdaki rozet
   plana göre Y3'te geliyor).
5. **320'de baloncuk "Sağ–sol"u tireden bölüyor:** "İlk durak: Sağ–" / "sol · 1 dk" (`2-gun2-320-*`). Bölünmeyen tire
   (U+2011) ya da `white-space: nowrap` gerekebilir.
6. **"Bugünün ritmi" kartında kanıt cümlesi.** Kalıp üretilince kart, kısa tanıtım yerine ailenin `evidence` metnini
   gösteriyor: "5:5 oranı, 4:6 kadar kalp ritmi değişkenliğini artırdı; ikisi de kutu ve 4-7-8'den önde (Marchant 2025,
   n=84; Laborde 2022)." Bu yeni bir iddia değil, mevcut metin (§3.A.4). Ama ilk ekranda bir fizyolojik etki cümlesi
   olarak duruyor; metin kapısındaki "sağlık iddiası yok" denetiminde bakılmalı.
7. **9. günde "28 günlük program · 1. gün".** Yoldaki 3 dk program günü saymıyor; yalnız "2 dk daha" ile 5 dk'ya
   tamamlanan gün sayılıyor (§3.A.4). Bu geçmişte kişi "2 dk daha"yı 6 uygun günün yalnız birinde kullandı (üretici her
   gün %50 olasılıkla kullandırıyor). Plan gereği böyle, ama 8 gün nefes yapmış kişi "1. gün" görüyor.
8. **"2 dk daha" ekranı** (5): düğme sonuç başlığının hemen altında, sade biçimde. Ekranda neden 2 dk olduğu (program günü 5 dk)
   ya da molanın kalanının ne olduğu yazmıyor.
9. **Sürüm notu yok.** `lib/releases.js`'in son kaydı 2026-09-29-2; Y1 için not yok. Düzenek `releaseSeen`'i son sürüme
   koyduğu için Ana sayfa doğrudan açılıyor. Y1 notu eklenirse eski kullanıcı güncelleme günü önce "Yenilikler"i görür.
10. **Web kipi.** iPhone'da Ana sayfada ek olarak hatırlatma izni kartı (izin sorulmadıysa), alarm satırı ve Sağlık satırı
    olabilir. Bunlar web'de yok. Yolun dizilişi, mola bandı ve rozetler iki kipte aynı kodla çiziliyor.
11. Yatayda taşma yok (`scrollWidth − innerWidth = 0`), sayfa hatası ya da konsol hatası yok.
