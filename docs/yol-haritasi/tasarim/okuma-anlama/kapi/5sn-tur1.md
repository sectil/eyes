# 5 saniye kapısı · tur 1 (2026-10-02)

Maket: `maket/maket.html`, ilk sürüm. Beş ekran × açık/koyu × 390/320 = 20 görüntü. Beş bağımsız değerlendirici,
soru "5 saniyede etkilendin mi?", "idare eder" = hayır. Geçme ölçütü en az 4/5.

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| giris | H | H | H | H | H | 0/5 ✘ |
| metin | H | H | H | H | E | 1/5 ✘ |
| soru | H | H | H | H | H | 0/5 ✘ |
| sonuc | H | H | H | H | H | 0/5 ✘ |
| sayilmadi | H | H | H | H | H | 0/5 ✘ |

## Ortak bulgular
1. **320'de ana düğme taşıyor ya da görünmüyor:** soru, sonuç, sayılmadı. Beş kişinin beşi söyledi.
2. **Giriş 320:**
   - Adım çipleri kayboluyor.
   - Kart başlığında "böcek" tek başına alt satıra düşüyor.
   - Alt not düğmeye yapışıyor.
   - Halkanın alt yarısındaki yazı baş aşağı okunuyor (D5).
3. **Okuma:**
   - Son satır düğmenin arkasında yarım kesiliyor.
   - İlerleme çubuğu saat gibi okunuyor ve "kendi hızında oku" ile çelişiyor (D2, D5).
   - "Bitirdim" baştan görünüyor; okumadan bitirmeye çağırıyor, ölçümü bozar (D3).
4. **Soru:** seçilmemiş şıklar soluk, devre dışı gibi duruyor; koyu temada kontrast düşük.
5. **Sonuç:**
   - Dört parçalı halkanın anlamı belli değil, süs gibi duruyor.
   - Kart kenarı 34 px, düğme kenarı 40 px; hizasız.
6. **Sayılmadı:**
   - Sayılmayan 348 ekranın en büyük öğesi; "sayılmadı" mesajıyla çelişiyor.
   - Doğru yaylar çapraz dolu, sırayla değil.
   - "2 / 5" ile "başlangıca sayılmadı" birbirini tutmuyor.

## Tur 2 için düzeltmeler
- Bütün ekranlarda alt düğme sabit; altında opak zemin ve üstünde 48 px solma var. İçerik düğmenin altında kalmaz.
  Kartlar ve düğmeler aynı 20 px kenarda.
- **Giriş:**
  - 320'de halka küçülür, adımlar geri gelir.
  - Kelime sayısı başlığın altına iner, başlık tek satıra sığar.
  - Halkanın alt yarısındaki yazı soldan sağa, düz okunur.
- **Okuma:**
  - İlerleme çubuğu kalkar.
  - "Bitirdim" metnin sonunda durur; kişi sona gelince görür.
  - Alttaki solma kaydırılacak metin olduğunu söyler, satır kesmez.
- **Soru:**
  - Şık metinleri tam kontrastta.
  - Seçimden sonra yalnız seçilen ve doğru olan renk alır.
  - 320'de iç boşluk daralır.
- **Sonuç:**
  - Halka dört soruyu gösterir: doğru sayısı kadar parça sırayla dolar.
  - Her parçanın ortasında ✓ ya da ✕ durur.
- **Sayılmadı:**
  - Hız küçük ve gri, altında "sayılmadı" yazar.
  - Asıl vurgu anlama satırında ve Nef'in cümlesinde.
  - Başlangıç satırı "2 okuma sayıldı, 3 okuma kaldı" der.
