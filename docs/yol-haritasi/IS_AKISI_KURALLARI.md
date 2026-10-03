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
5. **Kapı:** en çok iki tur (bir düzeltme); sonra iki sürümden en iyisi seçilir, üçüncü tur yok (aşağıda "Tur sınırı"). Kalite ölçütü değişmez: her ekranda beş bağımsız değerlendiriciden en az üçü.
6. **Aynı anda en çok iki iş akışı.** Ağır işler (kod + test) sıraya konur.
7. **Kapsam:** izinli dosya listesi; kapsam dışı iş yok. Rapor en çok 30 satır; ayrıntı dosyada.

Kaliteden kısılmayan: 5 saniye kapısı, bağımsız inceleme, tam test takımı ve derleme (sonda). Kısılan: tekrar eden tam
test koşuları, turlarda düzenek onarımı, ikiden fazla düzeltme turu, uzun raporlar, beklemede duran paralel iş akışları.

## Rıza sayfaları için 5 saniye ölçütü (sahip kararı 2026-10-01)

Rıza (açık rıza, izin) sayfalarında değerlendiriciye "etkilendin mi?" sorulmaz. Soru: "5 saniyede ne istendiğini, verinin
nereye gittiğini ve nasıl hayır diyeceğini anladın mı?" Beş kişinin en az dördü anlamalı. Metin harfi harfine kalır.

## Her tasarım: 5 saniyede etkileme ve mükemmellik (sahip, 2026-10-01: "her tasarım 5 sn etkileme ve mükemmellik üzerine olacak")

- Her yeni ya da değişen ekran, kart ve bildirim görünümü beş bağımsız değerlendiriciye 5 saniyelik ilk bakışla
  gösterilir; soru "etkilendin mi?" ("idare eder" = hayır). En az 4/5. İki tema, 390 ve 320.
- Değerlendiriciler geçirse de ben görüntülere bakar, mükemmel bulmazsam sahibe göndermem; yalnız sonucu yazarım.
- Rıza sayfalarında anlaşılırlık ölçütü (yukarıda) da kalır: ikisi birlikte aranır.
- Yalnız "anlaşılırlık" ile geçmiş ekranlar (ör. Hatırlatmalar sayfası, D5+D6: 5/5 anlaşıldı) etkileme için yeniden
  sınanır.

## Tur sınırı: en çok iki tur, sonra en iyisi seçilir (sahip, 2026-10-03)

Sahibin sözü, kelimesi kelimesine: "şöyle bazen çok uğraşıyrosun örneğin 2 tur düzeltme yaptım içerisinde hangisi en iyisi ise onu seç... 3. tura kalmasın çok fazla token harcıyorsun bunnu bir kural olarak yaz . yoksa devvamlı döngüde kalıyorsun... 5 sn ve mükemmlik kuralna uygun olarak."

- Her iş en çok iki tur yapılır. Tur, bir sürüm üretip denemektir: ilk sürüm 1. tur, bir düzeltme 2. tur.
  **Üçüncü tur açılmaz.**
- İki turun sonunda iki sürüm karşılaştırılır ve en iyisi seçilir. Ölçüt 5 sn ve mükemmellik: önce kapıda daha çok E
  alan; eşitse ölçüm kusuru daha az olan (taşma, kesik yazı, dokunma alanı, sığma); o da eşitse daha az değişiklik
  isteyen.
- Seçilen sürüm kapıdan geçtiyse iş biter. Geçmediyse yeni tur açılmaz, yöntem de değiştirilmez: en iyi sürüm, kapı
  sonucu ve kalan kusurlar sahibe gösterilir, karar onundur. Bu durumda kusurlar açıkça yazılır.
- Gözden geçirme, doğrulama ve kapı turları da bu sınırdadır: her biri en çok iki tur.
- İş akışlarında (Workflow, paralel Agent) döngüler en çok iki turla kurulur; üçüncü tura izin veren döngü yazılmaz.
- Bu kural kişisel kural 5'i ("aynı yöntem 2 kez başarısız olduysa 3.'yü deneme") sıkılaştırır: iki turdan sonra yeni
  yöntem de denenmez; en iyisi seçilir ya da sahibe sorulur.
