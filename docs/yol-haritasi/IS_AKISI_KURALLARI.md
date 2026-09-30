# İş akışı kuralları (2026-09-30)

Sahibin isteği (kelimesi kelimesine): "belirli bir saatte ajanlar tamamlasın bazen 4 saat sürüyor gerekesiz işlerde
yapıyorsanırırm en kalitlei işi daha zamanda yapamalrını sağla"

## Ölçüm (bugünkü iş akışlarının kayıtlarından)
- Sonsuz yol Y1: duvar saati 239 dk. En uzun ajanlar: kod 53 dk (114 araç çağrısı), düzeltme 50 dk (169), eşdeğerlik
  incelemesi 43 dk, tasarım turu 35 dk.
- S0 ekran sayfası: 228 dk. Ekran görüntüsü ajanları 38–47 dk (her turda düzeneği yeniden onardılar, ≈ 140 araç çağrısı).
- Yoga kapısı 3. tur: 7 dk (beş değerlendirici, her biri 2–3 dk).
- Makine 4 çekirdekli: bir iş akışında aynı anda en çok 2 ajan çalışır; öteki ajanlar sıra bekler. Tam test takımı
  (≈ 138 dosya) ≈ 60 sn sürer ve dört çekirdeği doldurur; iki iş akışı aynı anda koşunca ikisi de yavaşlar.

## Kurallar (bundan sonra her iş akışında)
1. **Bitiş saati:** iş akışı başlarken bitiş saati sahibe yazılır (varsayılan en çok 90 dk). Saat gelince çalışan ajan
   durdurulur; iş test edilmiş hâliyle kaydedilir, kalan iş yazılır.
2. **Ajan süresi istemde:** ajan başında saati alır (`date`) ve süresine uyar: uygulayıcı 25 dk, düzeltici 20 dk,
   inceleyici 15 dk, denetçi 10 dk, ekran çekimi 8 dk, değerlendirici 3 dk. Süre dolunca işi yarım bırakmaz: yaptığı
   kısmı testten geçirir, kalanı yazar.
3. **Ekran düzeneği bir kez kurulur**, sonra tek komutla çalışır. Tasarım ya da kapı turunda düzenek onarılmaz; bozuksa
   ayrı, kısa bir iş olarak onarılır.
4. **Test:** çalışırken yalnız ilgili test dosyaları (`npx vitest run <dosyalar>`); bütün takım ve derleme ajan başına
   bir kez, sonda.
5. **Kapı:** en çok iki tur (bir düzeltme). Kalite ölçütü değişmez: her ekranda beş bağımsız değerlendiriciden en az üçü.
6. **Aynı anda en çok iki iş akışı.** Ağır işler (kod + test) sıraya konur.
7. **Kapsam:** izinli dosya listesi; kapsam dışı iş yok. Rapor en çok 30 satır; ayrıntı dosyada.

Kaliteden kısılmayan: 5 saniye kapısı, bağımsız inceleme, tam test takımı ve derleme (sonda). Kısılan: tekrar eden tam
test koşuları, turlarda düzenek onarımı, ikiden fazla düzeltme turu, uzun raporlar, beklemede duran paralel iş akışları.
