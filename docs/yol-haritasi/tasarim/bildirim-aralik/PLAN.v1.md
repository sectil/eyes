# Aralıklı ve çok saatli hatırlatmalar · Bildirimler yeni görünüm · PLAN v1 (onay bekliyor)

Tarih 2026-10-03. Sahip isteği: "bildirimler bölümündeki hatırlatmalar Dik Dur'daki gibi saatte bir, iki saatte bir
kurulabilsin ... su için her saatte bir diyebilirim veya istediğim saatte birden fazla hatırlatma kurabilmeliyim ...
hatırlatmalar bölümünü daha estetik hale getirmelisin, hatırlatmalar birbiri ile karışıyor. 5 saniye ve mükemmellik kuralı."

## Sahip kararları (2026-10-03, bu oturum)
- Günlük sınır: **yok**. Kaç saat kurulursa o kadar gelir. (Eski karar "her modülde günde en çok 3 saat" ve planlayıcının
  "modül hatırlatmalarından günde en çok 6" kuralı kalkar.)
- Bildirimler ekranı: üstte "Bugün" şeridi (günün bütün hatırlatmaları saat çizgisinde, yarım saat içinde çakışanlar
  işaretli); liste saate göre sıralı, Sabah · Öğle · Akşam bölümlü; modül hatırlatmaları ile mola, yürüyüş, nefes, su aynı
  görünümde; "Hatırlatma ekle" iki sütun eşit kutu. Çizilir, 5 sn kapısı (≥4/5), sonra kod.
- Çakışma: yarım saat içindekiler bugünkü gibi tek bildirimde birleşir; ekranda uyarı satırı.

## Dokunulmaz
- `lib/notifyPlan.js`, `lib/reminders.js`, `lib/restNotify.js` (yalnız okunur, değişmez).
- Eşdeğerlik: yeni özellik kapalıyken plan bugünküyle bayt bayt aynı (0 fark).
- Dik Dur'un aralıklı hatırlatması (7868–7899) olduğu gibi kalır; yeni motor onu da kapsayacak şekilde yazılmaz, yanına konur.

## Parçalar (sırayla; her biri test + build + TestFlight + cihaz)
1. **Motor** `lib/intervalRemind.js`: `postureRemind.js`'in genel hâli; her modül ve dört deney türü (su, nefes, mola,
   yürüyüş) için "belli aralıklarla" ve "belirli saatlerde (sınırsız)". Kimlikler **7920–7999** (80; depoda boş,
   doğrulandı). Ortak bütçe: iPhone en çok 64 bekleyen bildirim; JS payı 58. Önce sabit bildirimler, kalan yere bütün
   aralıklı/çok saatliler gün gün sığdırılır; sığan son günün sonuncusu "burada bitiyor" bildirimi. Gece 01–05 ve
   gece sessizliği kuralları bugünkü gibi.
   - Deney türleri: `reminders.js` dokunulmadan; aralık ya da çok saat açılınca o türün eski tek saati ayarda kapatılır,
     bildirimleri yeni motor kurar. Metin: türün bugünkü onaylı cümleleri (yalnız okunur).
2. **Sınırların kalkması**: `maxTimes` 3 → sınırsız (saat sayfasında "Saat ekle" tekrarlanır); `DAY_CAP` 6 kalkar;
   30 dk birleştirme kalır.
3. **Saat sayfası**: her modülde ve dört türde üstte "Belirli saatlerde · Belli aralıklarla" (Dik Dur'daki onaylı
   görünüm). Deney türlerine dokununca da bu sayfa açılır.
4. **Bildirimler yeni görünüm**: Bugün şeridi, saat sıralı bölümler, çakışma satırı, eşit kutular, bütçe satırı
   ("Bu kadar hatırlatmayla uygulamayı en geç N günde bir açman gerekir"). Önce çizim, 5 sn kapısı.

## Bilerek değişecek testler (sahip izni gerekir)
- `notifyAll.test.js:210–214` ve `:322–326` (DAY_CAP 6 tavanı ve "altıncıda birleşir") → sınırsız.
- `moduleRemind.test.js:190` ("günde en çok 3 saat") → sınırsız.
- `registry.test.js:198–199` (`maxTimes` en çok 3 doğrulaması) → üst sınır yok.
- `notifyApply.test.js` kimlik kümeleri (7920–7999 eklenir; Dik Dur'da da aynı satırlar değişmişti: 268, 273, 420).
- Ekran testleri (`Notifications.remind.test.jsx`, `RemindSheet.posture.test.jsx`) yeni görünüme göre.
- Başka test değişmek zorunda kalırsa durup sorulur.

## Onay gereken metinler (yeni; koda sahip onayıyla girer)
- Son bildirim: "Hatırlatmaların burada bitiyor. Uygulamayı açınca yeniden kurulur." (taslak)
- Ekran: "Bugün", "Sabah", "Öğle", "Akşam"; çakışma "10.00 Su ile 10.15 Göz kırpma tek bildirimde gelir.";
  bütçe "Bu kadar hatırlatmayla uygulamayı en geç 2 günde bir aç; açmazsan hatırlatmalar durur." (taslaklar)
- Metin kapısı (5 değerlendirici, ≥4/5) geçtikten sonra sahibe.

## Risk
- Sınır yokken saatte bir su + iki saatte bir Dik Dur + modüller → günde 25+ bildirim olabilir; 58 payı 2 günü
  ancak doldurur. Uygulama açılmazsa hatırlatmalar durur; ekran bunu açıkça söyler.
- iOS bildirim yorgunluğu: kişi çok kurarsa bildirimleri tümden kapatabilir (VARSAYIM; kaynak aranmadı).
