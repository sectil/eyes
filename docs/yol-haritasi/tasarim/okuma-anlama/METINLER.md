# Oku ve Anla · metin, soru ve ekran metinleri kuralları (taslak, 2026-10-02)

Modül adı **Oku ve Anla**: sahip onaylı, 2026-10-02. §5'teki bütün görünür cümleler de sahip onaylı (2026-10-02, "Onay"; `ARA_RAPOR_1.md` §11).
Yeni ya da değişen cümle sahip onayı olmadan koda girmez: taslak → 5 kişilik kapı → kendi onayım → sahip.

## 1. Kaynak kuralı
- Her metin tek bir PubMed kaydına dayanır. PMID ve DOI bu oturumda PubMed aracıyla çekilir; ezberden yazılmaz.
- Metin yalnız **özette yazanı** söyler. Özette olmayan sayı, yer, yöntem eklenmez. Genel bilgi, örneğin "Sumatra
  bir adadır", yalnız bulguyu taşımak için ve tartışmasız olduğunda kullanılır.
- Makale cümlesi çevrilmez, kopyalanmaz. Metin Nefona'nın kendi sade Türkçesiyle baştan yazılır.
- Konu seçimi: hayvan, bitki, duyu ve günlük merak. Sağlık iddiası, hastalık, ilaç, korku yok. İnsan için çıkarım
  yok; hayvan bulgusu insana taşınmaz.
- Bir bulgu yalnız bir metinde kullanılır. Metin Arama'nın 10 bulgusu ortak banka kararına kadar kullanılmaz.

## 2. Metin kuralı
- **Uzunluk:** 95–115 kelime ve 730–850 harf. İkisi birlikte aranır; böylece günden güne okunan iş aynı büyüklükte
  kalır (trauzettel2012). Türkçede ekler kelimeyi uzattığı için kelime sayısı tek başına yetmez.
- **Yapı:** bir merak cümlesi, yöntem, bulgu, kısa sonuç. 8–11 cümle. Paragraf yok, tek blok.
- **Dil:** 8. sınıf okurunun rahat okuyacağı sözcükler; terim varsa aynı cümlede açıklanır. Parantez yok.
  Sayılar rakamla yazılabilir. "Beyin", "hastalık", "tehlike" geçmez.
- **Başlık:** 2–6 kelime, merak uyandırır, bulguyu ele vermez.
- **Eşdeğerlik:** pilotta metin başına okuma süresi toplanır; ortalamadan çok sapan metin düzeltilir ya da çıkar
  (hairol2026 yöntemi). VARSAYIM: sapma eşiği ± 0,25 SD.

## 3. Soru kuralı
- Her metnin 6 sorusu var: 1 **ana fikir** sorusu, 5 **ayrıntı** sorusu. Her turda ana fikir sorusu ve 5 ayrıntıdan
  rastgele 3'ü sorulur; böylece aynı metin bir gün yeniden gelse bile soru takımı değişir.
- Dört seçenek, tek doğru. Doğru cevap metinde açıkça yazar; yorum ya da genel kültür gerekmez.
- Tuzak yok: "hangisi yanlıştır", "değildir", çift olumsuz yok. Yanlış seçenekler metinde hiç geçmeyen ya da açıkça
  başka bir şey söyleyen seçeneklerdir. Doğruya yarım yamalak benzeyen, "kısmen doğru" seçenek yazılmaz.
- Seçenekler aşağı yukarı aynı uzunlukta. Doğru seçenek bir takımda soruların %15–35'inde en uzun olur; böylece ne
  "en uzun doğrudur" ne "en uzun yanlıştır" tahmini işler. `denetle.mjs` ölçer.
- Bankada doğru seçenek ilk sıradadır; uygulama şıkları her gösterimde karıştırır.

## 4. Banka
- Biçim: `banka/taslak-NN.json`, alanlar `id`, `baslik`, `kaynak`, `metin`, `sorular[{tur, soru, secenekler}]`.
  Kaynak ayrıntısı `arastirma/KAYNAKLAR.md` §B'de.
- Denetim: `node banka/denetle.mjs banka/*.json`. Uzunluk, tekrar kimlik, tekrar kaynak, parantez, yasak sözcük,
  soru sayısı, seçenek sayısı ve olumsuz soru kurallarına bakar.
- **120 metin tamam** (2026-10-02): `taslak-01..12.json`.
  - Her takım iki adımdan geçti: önce yazıldı, sonra bağımsız doğrulayıcı özetle karşılaştırdı (`banka/DOGRULAMA.md`).
  - Liste: `banka/METIN_LISTESI.md`.
  - 120 metnin hepsi sahip onaylı (2026-10-02).

## 5. Görünür metinler (sahip onaylı, 2026-10-02)

### Modül adı
**Oku ve Anla**: sahip onaylı, 2026-10-02.

### Giriş
- Başlık: "Oku ve Anla"
- Alt satır: "Bilimden kısa, şaşırtıcı bir bulgu oku. Sonra dört soru gelir."
- Adımlar: "Oku" · "Bitir" · "Dört soru"
- Kart: "BUGÜNÜN METNİ" · {başlık} · "{n} kelime"
- Not: "Hızın, anladığınla birlikte sayılır."
- Düğme: "Okumaya başla"

### Okuma
- Üst satır: "Kendi hızında oku"
- Üst etiket: "Bugünün metni"
- Düğme: "Bitirdim"
- Not: "Süre, sen dokununca durur."

### Soru
- Etiket: "{n}. soru"
- Doğru cevaptan sonra: "Doğru."
- Yanlış cevaptan sonra: "Doğrusu bu." Doğru seçenek yeşil olur.
- Düğme: "Sonraki soru"; son soruda "Sonucu gör"

### Sonuç
- Sayı altı: "kelime / dakika"
- Anlama: "4 sorunun {k}’{ek} doğru"
- Hız sayıldı: "Hızın sayıldı, çünkü metni anladın."
- Hız sayılmadı, anlama düşük: "Bu sefer hız sayılmadı. Hız, en az 3 doğruyla sayılır; bir dahakine biraz daha yavaş oku."
- Hız sayılmadı, çok hızlı: "Bu sefer hız sayılmadı; bu kadar hızlı okuma göz gezdirmeye döner. Bir dahakine her cümleyi oku."
- Hız sayılmadı, ara verildi: "Okurken uygulamadan çıktın, bu yüzden hız sayılmadı."
- Satır: "Başlangıç" · "İki okuma daha, sonra karşılaştırırız" · "{k} / 5"
- Satır: "Bu metin bir çalışmadan" · "{yazar} ve ark. · {dergi} · {yıl}"
- Satır: "Bana hatırlat" · "Her gün bir okuma"
- Düğme: "Bitti"

### Gelişim satırları
- Ölçü adları: "Okuma hızı" `kelime/dk`; "Anlama" `%`.
- Değişim sözcükleri yalnız: "başlangıcından iyi", "değişim yok", "henüz belli değil", "başlangıç".

### Nef cümleleri (N1 biçiminde, taslak)
- firstTime: "İlk okuman tamam. Hızın ancak anladığında sayılır; acele etme."
- metricChange, iyi: "Okuma hızın başlangıcından iyi, anlaman da yerinde."
- returnAfterGap: "Bir süredir okumadın. Bugün kısa bir bulgu seni bekliyor."
- VARSAYIM: Nef cümlelerinde rakam yok; `tests` deposunda değil `sessions` deposunda olduğumuz için metricChange
  anı izinli.

### Hatırlatma cümleleri (remindTexts biçimi, başlık ≤ 30, gövde ≤ 110 harf)
1. "Bugünün bulgusu hazır" · "Kısa bir bilim metni ve dört soru. İki dakika yeter."
2. "Bir metin, dört soru" · "Bugün hangi hayvanın sırrını okuyacaksın? Kendi hızında."
3. "Okuma molası" · "Kısa bir bulgu oku; hızın anladığınla birlikte sayılır."

### Sahip onayı sonradan (2026-10-02, "onay"; kapi/metin-tur1.md)
- Hız sayılmadı, çok yavaş: "Bu okuma çok uzun sürdü; hız ancak ara vermeden okuyunca sayılır." (5/5)
- Sürüm notu 2026-10-02-3: "Oku ve Anla geldi: kısa bir bilim bulgusu oku, dört soruyu cevapla. Hızın yalnız metni
  anladığında sayılır." (4/5) · "Okuma testi artık günün yolunda değil; istediğinde Pratikler'den açabilirsin. Yoldaki
  yerini Oku ve Anla aldı." (5/5; VARSAYIM: sahip a/b seçmedi, ilk aday)
- Sayılmadı (düşük anlama) Nef satırı ve kaynak satırı ekranda sahip onaylı maketteki biçimle: "Hız, en az 3 doğruyla
  sayılır. Bir dahakine biraz daha yavaş oku." · "{yazar}, {yıl}" (kapi/kod-tur1.md, kod-tur2.md).
