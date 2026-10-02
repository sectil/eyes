# 5 sn kapısı · tur 2 (2026-10-02)

Görüntüler: `maket/tur2/`. Aynı beş kimlik, yeni ve bağımsız değerlendiriciler. 320'de taşma yok (5/5 doğruladı).

| Ekran | A | B | C | D | E | Geçti mi |
|---|---|---|---|---|---|---|
| intro | E | E | E | E | E | **5/5 geçti** |
| search | H | E | H | H | H | 1/5 |
| found | E | E | H | E | E | **4/5 geçti** |
| absent | H | H | H | E | H | 1/5 |
| result | E | H | H | E | H | 2/5 |

## Bulgular
1. **Arama ekranı "yazı duvarı"** (A, C, D, E): oyun değil ödev gibi; 390'da kartın altı boş; süre çizgisinin süre
   olduğu anlaşılmıyor, sayı yok (A, B, D, E).
2. **"Yok" haksız görünüyor** (A, C): aranan "arıların", metindeki "arılarına"nın başında harfi harfine geçiyor.
   Doğru karar ödülü zayıf ve ekranın altında küçük (B, E). Kart bulundu ekranıyla aynı yeşil tikte (A, E).
3. **Sonuç soğuk ve teknik** (B, C, E): "ortanca", "PMID", "Başlangıç · 3/8 gün". "Gelişim her hafta bakar"
   anlaşılmadı (A, B, C, E). Süre iyi mi kötü mü sorusu (C, E).
4. **Giriş örnek cümlesi** (A, B, C, E): "kuzgunlar da benzer bir beceri" bağlamsız.
5. **İçerik hatası** (D): arı metninde "kartı sıranın en başına koydu" deneyin yöntemini yanlış anlatıyor; arılar
   kart dizmedi, iki seçenekten azını seçti. Bu ayrıntı özette yoktu; benim hatam. "Sıfırı sıraladılar" yorumu kesin
   sonuç gibi; "Plan yapan kuzgunlar" başlığı metinden büyük konuşuyor.

## Yapılan
- Arı metni: "Arılar boş kartı, tek şekilli karttan da daha az saydı. Araştırmacılara göre arılar sıfırı sayıların en
  küçüğü gibi ele aldı." Başlık "Sıfırı en küçük sayan arılar". Kuzgun başlığı "17 saat sonrası için seçen kuzgunlar".
  Kural: deney yöntemini anlatan her fiil özetteki fiille aynı olur.
- Denetime yeni kural: hedef kelime metindeki başka bir kelimenin başında geçemez. 11 hedef değişti; benzer biçimli
  hedeflerde artık uzun biçim aranır, kısa biçim çeldiricidir.
- Giriş örneği: "Bir deneyde kuzgunlar, ileride kullanacakları bir aleti 17 saat öncesinden seçebildi."
- S3 "Kelimelerin yarısını bundan hızlı buldun." S6b "8 gün sonra başlangıç ölçün çıkar; sonra her hafta onunla
  karşılaştırılır."

## Yöntem değişikliği
İki tur doldu (IS_AKISI kuralı 5). Arama, yok ve sonuç ekranları için aynı yolla üçüncü tur yapılmadı. Yöntem
değişti: her ekran için üç ayrı yön (a, b, c) çizildi; beş değerlendirici en iyi yönü seçip onu 5 sn sorusuyla
değerlendirdi. Kayıt: `5sn-yonler.md`.
