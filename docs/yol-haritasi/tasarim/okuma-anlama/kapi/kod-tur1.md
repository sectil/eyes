# 5 saniye kapısı · gerçek kod · tur 1 (2026-10-02)

Ekranlar `screens/OkuAnla.jsx`, Playwright ile çekildi (iPhone güvenli alanları elle verildi: 390 üst 47 / alt 34,
320 üst 20 / alt 0). Ön denetim (`maket/onden.mjs` kuralları, uygulama sınıflarıyla) çekimden önce temiz.
Her değerlendirici iki birleşim gördü (390 açık + 320 koyu ya da 390 koyu + 320 açık; dönüşümlü).

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| giris | H | H | H | H | H | 0/5 ✘ |
| metin | E | E | E | E | E | 5/5 ✔ |
| soru | H | E | H | H | H | 1/5 ✘ |
| sonuc | H | H | H | H | H | 0/5 ✘ |
| sayilmadi | H | H | H | H | H | 0/5 ✘ |

## Bulgular
- giris: 320'de (kısa ekran) kelimeli iris yerine noktalı halkalar; imza öğesi kayboluyor (5/5). 390'da kartla ipucu
  arası geniş (2/5). Koyuda iç halkanın yazısı soluk (1/5).
- soru: 320'de halka sola, soru sağa sıkışıyor; "eder?" son satırda tek kalıyor (4/5).
- sonuc: 320'de Nef cümlesi gereksiz dar genişlikte kırılıyor (4/5); kaynak "Current / Biology" bölünüyor (3/5);
  390'da kartla düğme arasında ölü alan (2/5); "Başlangıç · 5 okumayla belirlenir" anlaşılmıyor (2/5).
- sayilmadi: kaynak satırı bölünüyor (2/5); "Hız sayılmadı" etiketi Nef cümlesinde aynen tekrar ediyor (2/5); üstü
  çizgi rakamın alt yarısından geçiyor (1/5); "3" satır sonunda "doğruyla"dan ayrı (1/5).

## Tur 2 için yapılanlar (yeni metin yok)
- Kısa ekranda iki halkalı kelime irisi; aynı onaylı cümlelerin parçaları, 160 px'te yazı ≥ 9,5 px.
- Kısa ekranda soru halkanın altında, ortalı; `text-wrap: balance`.
- Nef satırı tam genişlik; kaynak satırı parça parça kırılır ("yazar ·" / "dergi · yıl").
- Üstü çizili hız: çizgi rakamların ortasından.
- Düşük anlama cümlesi: sahip onaylı sayılmadı ekranının cümlesi ("Hız, en az 3 doğruyla sayılır. Bir dahakine biraz
  daha yavaş oku."); etiketi tekrarlamaz. Öteki nedenlerde METINLER §5.
- Başlangıç satırı 3/5'te METINLER §5'in "İki okuma daha, sonra karşılaştırırız".
- Sonuç gövdesi dikeyde ortalı; alt boşluk payı düğme şeridine indirildi.
- Ön denetimde "başlık erken kırılıyor" kuralı kelime sayısıyla değil satır genişliğiyle ölçülür (ilk kelime çok
  uzunsa kelime sayısı yanıltıyordu: "Doğduklarında bebekler / kimin sesini tercih eder?").
