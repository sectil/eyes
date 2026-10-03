# 5 saniye kapısı · son tur (2026-10-02, sahip onayıyla)

Bu tur, yöntem 2 turunun altı bulgusu düzeltildikten sonra yapıldı. Önce ön denetim (`maket/onden.mjs`) 20 görünümün
hepsinde temiz geçti; bu sürüm SVG yazı boyunu ve ayraçla başlayan satırı da ölçüyor. Sonra yeni beş bağımsız
değerlendirici baktı.

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| giris | E | E | E | E | E | **5/5 ✔** |
| metin | E | H | E | E | E | **4/5 ✔** |
| soru | H | H | H | H | H | 0/5 ✘ |
| sonuc | E | E | E | E | E | **5/5 ✔** |
| sayilmadi | H | H | E | E | E | 3/5 ✘ |

Kendi bakışım: giriş, okuma ve sonuç ekranlarını dört görünümde de mükemmel buluyorum.

## Geçmeyenler: bulgular aynı yerde birleşiyor
- **Soru, 5/5 aynı bulgu:** halkada cevaplanan soru ile şu anki soru iki benzer mavi tonla ayrılıyor, ne olduğu
  okunmuyor.
  - Öneri: cevaplanan dolu, şu anki çerçeveli ya da vurgulu, bekleyen gri.
  - "Doğru" etiketi seçenek metnini üç satıra itiyor; işaretin yanına ya da kartın altına alınacak.
  - 320'de "2 / 4" sıkışık; tek satır "2/4" olacak.
- **Sayılmadı (D1, D2):** yanlış yaylar cevaplanmamış gri ile aynı renkte. Öneri: yanlış yay ve ✕ kehribar renkte.
- Küçük, geçen ekranlarda:
  - 320'de giriş halkası noktalı çembere dönüyor; kelime halkası küçük de olsa korunsun (4/5 değinildi).
  - "Başlangıç 3/5" satırı ne demek olduğunu söylemiyor (D3, D1).
  - Koyu temada kapalı anahtar açık gibi görünüyor (D4).
- Önerilip **alınmayan**: "Tekrar oku" düğmesi (D4). Aynı metni ikinci kez okumak hız ölçümünü bozar (PLAN §4).

## Karar
- Üç ekran geçti.
- Soru ve sayılmadı ekranları için düzeltme belli. Ek kapı turu sahip kararına bırakıldı.
