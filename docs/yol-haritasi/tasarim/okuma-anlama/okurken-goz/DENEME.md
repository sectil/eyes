# Okurken göz · cihaz denemesi (2026-10-03)

## Sahibin isteği (kelimesi kelimesine)

"İlk bence hızı yazalım k/d hızını göz ile takip etsin göz takibi yapalım kelimeleri göz ile takip etmesini ve ne kadar
takip ettiğimi yakalayalım anladınmı cümlelerde hıza başlı olarak her kelime üzerine yanacak, göz yyalipli okuyup
okumadığını anlayacağız az senin yeteneğin gerekiyor yapabilir miyiz ilk önce anla"

## Sahibin kararları

- Yanan kelimeli okuma Oku ve Anla ölçümünün yerine geçmez: "Ayrı alıştırma kipi" (ölçüm aynen kalır).
- Göz takibi: "Önce cihazda deneyelim". Deneme planı sahibe yazıldı, "ok. 5 san ve mükemmlik gerekiyor".

## Neden kelime değil satır

Telefon ekranında sağ–sol göz dönüşü küçük; kalibrasyon sürüm 2'de ekranın içindeki sağ ile sol ayrılamadı
(`app/src/lib/gazeCalib.js` başındaki not). Bir kelime bunun çok küçük bir parçası: "şu kelimeye baktı" ölçülemez.
Ekrandaki en büyük göz hareketi satır sonundan satır başına dönüş. Deneme bunun yakalanıp yakalanmadığını ölçer.

## Deneme (yalnız test derlemesi)

- Yeri: Bilgi → "Okurken göz (deneme)" (App.jsx `SKY_UI`: TestFlight `VITE_TEST_UNLOCK=1`; App Store derlemesinde yok;
  Face ID kamerası yoksa satır yok).
- Ekran `app/src/screens/OkuGozDeneme.jsx`, hesap `app/src/lib/readGaze.js` (testli).
- Akış: hız seç (150/200/250 kelime/dk) → Başla → bugünün Oku ve Anla metni; yüz görülünce 3 sn geri sayım → kelimeler
  sırayla yanar (kaydırma yok; sığmazsa cümle sonunda sayfa) → sonuç.
- Kayıt: saniyede 30 TrueDepth karesi (ekrandaki bakış noktası `scrX/scrY` mm, `camX/camY`, `headX`, `scrZ`) ve her
  kelimenin ekrandaki yeri. Kamera görüntüsü kaydedilmez; sayılar bellekte; "Ham veriyi paylaş" yalnız kişinin isteğiyle.
  Oku ve Anla'ya kayıt yazılmaz.
- Hesap: beklenen dönüşler = yanan kelimenin yeni satıra (ya da sayfaya) geçtiği anlar. Göz sinyalinde 300 ms içinde
  satır genişliğinin en az %40'ı kadar sola sıçrama = yakalanan dönüş. İşaret veriden bulunur. Eşleşme ±500 ms.
  Uyum: gözün yanan kelimenin yeriyle ilişkisi, ölçülen gecikme kadar kaydırılarak.
- Karar ölçütü (VARSAYIM, sahibe yazıldı): dönüşlerin en az %80'i yarım saniye içinde yakalanırsa takip ölçülebilir;
  o zaman asıl alıştırma ve takip sonucu kurulur. Yakalanmazsa göz takibi yapılmaz.

## Düzenek ve kapı

- `okuma-anlama/duzenek/og.html`, `og.jsx`, `og-face.js` (yüz takibi yerine yanan kelimeyi 150 ms gecikmeyle izleyen
  sayı üretir; `vite.config.mjs` og-face eklentisi), çekim `cek-og.mjs` (`bash cek.sh <çıktı> cek-og.mjs`).
- 5 sn kapısı tur 1: giriş 5/5, okuma 390 5/5; yüz yok 2/5, okuma 320 0/5, sonuç 390 0/5, sonuç 320 0/5. Kusurlar: durum
  yazısı yüzün görülmediğini ve kendiliğinden başlayacağını söylemiyordu; "1/2" sayfa olduğu anlaşılmıyordu; sayfa
  cümle ortasında bölünüyordu; "30" ile "Fransız" satır sonunda ayrılıyordu; uyum, gecikme ve sinyal kartları teknikti;
  grafikte açıklamasız gri nokta; sonuç cümlesinde tek kalan kelime. Hepsi düzeltildi (tur 2).

## Sahipten beklenen

TestFlight'ta Bilgi → "Okurken göz (deneme)": iki üç kez oku (200 ve 250), sonuç ekranının görüntüsünü ve "Ham veriyi
paylaş" çıktısını gönder. Karar o veriyle verilir.

### Tur 2 (son tur; tur sınırı kuralı, üçüncü tur yok)

- Yüz yok 390 koyu 5/5, sonuç 320 5/5 (geçti).
- Okuma 320: 0/5. Kalan kusur: 1. sayfanın son satırında "baktı." tek başına; "30 Fransız" bağlanınca "Bir ekip" satırı
  kısa kalıyor.
- Sonuç 390 koyu: 0/5. Kalan kusur: grafik açıklamasında yeşil nokta bir satırda, "Yakalanan dönüş" yazısı alt satırda;
  "Ayrıntılar"ın açılır olduğunu gösteren ok yok, altında boşluk.
- İki kare iki turda da geçmedi; sahibe gösterildi, karar onun. Deneme ekranı yalnız test derlemesinde.

## Anlama soruları (sahip 2026-10-03: "Sonunda Testler ve okurun anladığını da tabii test edeceğiz"; karar "Şimdi denemeye")

- Okuma bitince Oku ve Anla'nın aynı dört sorusu (`questionSet`); sonuçta "Anlama · 4 sorunun N'i doğru" (Oku ve Anla
  sonuç çipiyle aynı söz). Kayıt yazılmaz; paylaşılan ham veride `correct`.
- Soru ekranı ortak parçaya ayrıldı: `app/src/components/OkuSoru.jsx` (Oku ve Anla da onu kullanır). Oku ve Anla'nın
  28 düzenek çekimi (soru ekranları dahil) değişiklikten önce ve sonra piksel piksel aynı (`cmp`, 28/28).
- Sonuç ekranı kapısı tur 1: 390 açık ve koyu 5/5; 320 0/5 (grafik kartı düğmenin arkasında kesik). Tur 2: ölçüt cümlesi
  "Ayrıntılar"a, kısa ekranda büyük sayı küçük; ölçüm: kart düğmenin 48 px üstünde biter (320), 219 px (390). Ayrıca
  önceki kapının iki kusuru düzeldi: açıklamada nokta yazısıyla aynı satırda, "Ayrıntılar"da açılır ok.
- Sonuç ekranı kapısı tur 2: 320 açık 5/5, 320 koyu 5/5, 390 koyu 4/5 (bir kişi "Ayrıntılar" ile düğme arası boşluğu
  kusur saydı). Geçti.
- Kalan (önceki kapıdan, sahibe bildirildi): 320 okumada 1. sayfanın son satırında "baktı." tek başına.
