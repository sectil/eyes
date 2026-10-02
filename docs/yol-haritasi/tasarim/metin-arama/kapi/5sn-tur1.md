# 5 sn kapısı · tur 1 (2026-10-02)

Görüntüler: `maket/tur1/`. Beş bağımsız değerlendirici (istem: `degerlendirici-istemi.md`): A ürün tasarımcısı 34,
B emekli öğretmen 61 gözlüklü, C öğrenci 22, D göz doktoru 45, E muhasebeci 38.

| Ekran | A | B | C | D | E | Geçti mi |
|---|---|---|---|---|---|---|
| intro | H | H | H | H | H | 0/5 |
| search | H | H | H | H | H | 0/5 |
| found | H | H | H | H | H | 0/5 |
| absent | H | H | H | H | H | 0/5 |
| result | H | H | E | H | H | 1/5 |

390'a göre ayrıca: A ve D intro, found, absent için "390'da evet" dedi. Düşüşün ana nedeni 320.

## Bulgular
1. **320'de taşma** (5/5): arama, bulundu ve yok ekranlarında metnin son satırı ve kaynak satırı düğmenin altına
   biniyor. Giriş örnek kartı satır ortasından kesik. Sonuç ekranında bulgu başlığı "kuzg…" diye kesiliyor.
   Kendi taşma denetimim kaçırdı: yalnız ekran altını ölçüyordu, metin kutusunun kendi taşmasını değil.
2. **Önceden bulunan kelime vurgulu** (5/5): "papağanlarda" ipucu ya da tuzak gibi okunuyor.
3. **Bulma anı zayıf** (A, C, D): ince çerçeve ve küçük rozet "an" hissi vermiyor.
4. **İddia sınırı girişte** (5/5): "okuma hızını artırdığı gösterilmedi" Başla'nın üstünde motivasyonu düşürüyor.
5. **Sonuç cümlesi muğlak** (5/5): "çoğu zaman" ortanca mı ortalama mı belli değil; maketteki 3,4 sn gösterilen
   2,8 sn ile uyumsuz. Sayının neye göre iyi olduğu ve Gelişim'de neyin geliştiği belirsiz (D, E).
6. **"Yok" notu** (A, C): doğru cevaptan sonra düzeltme gibi okunuyor; "Doğru" iki kez söyleniyor.
7. **Adımlar** (E): "Ne kadar hızlı bulduğun kaydedilir" sınav gibi; "Yok" seçeneği adımlarda yok.
8. **Bilimsel dil** (D): "Yarını düşünen kuzgunlar", "bu düşünceyi sarstı" ve arılarda "anlayış" abartılı.
   B: "birin de altına" tuhaf.

## Tur 2 için değişiklikler
1. Kaynak satırı arama sırasında metin kartından kalkar; metin bitince geçişte ve sonuçta görünür. 320'de yazı 16,5
   px, aranan kelime kartı tek satır. Taşma denetimi metin kutusunun içini de ölçer.
2. Bulunan kelimeler arama sırasında işaretli kalmaz; ilerleme yalnız üstteki çizgilerde.
3. Bulunca kelime dolu renkle parlar, çevresinde halka; aranan kelime kartı yeşile döner ve süre büyük yazılır.
4. İddia sınırı "Neye dayanıyor?" sayfasına taşınır (N5); girişte yalnız bağlantı kalır.
5. S3 "Doğru bulduğun kelimelerde ortanca süre." Maket sayıları tutarlı. Gelişim kutusu metriğin adını söyler.
6. "Yok" notu: "Doğru, metinde yok. Benzer kelimelerin altını çizdik." Kartta ayrıca "Doğru" çipi yok.
7. Adımlar: "Kelime üstte çıkar", "Metinde bul ve dokun", "Yoksa “Yok” de".
8. Kuzgun başlığı "Plan yapan kuzgunlar", "benzer bir beceri"; arılarda "beceri"; arı cümlesi sadeleşir.
