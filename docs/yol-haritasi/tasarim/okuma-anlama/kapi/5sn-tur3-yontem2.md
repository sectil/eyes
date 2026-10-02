# 5 saniye kapısı · yöntem 2, tur 1 (2026-10-02)

Yöntem 2 iki adımdan oluştu:
1. Ön denetim betiği (`maket/onden.mjs`) 20 görünümün hepsinde "tamam" verdi.
2. Okuma ekranına künye eklendi; soru ekranına dört soru halkası geldi.

Sonra yeni beş bağımsız değerlendirici bakıp oy verdi.

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| giris | H | E | H | E | H | 2/5 ✘ |
| metin | E | H | H | E | H | 2/5 ✘ |
| soru | H | H | H | H | H | 0/5 ✘ |
| sonuc | H | H | H | H | H | 0/5 ✘ |
| sayilmadi | H | H | H | E | H | 1/5 ✘ |

## İlerleme
- Ölü boşluk ve kopuk geri bildirim kapandı.
- Düğmeye benzeyen ipucu ve başlık kırılması 390'da kapandı.
- Değerlendiriciler artık yalnız 320 genişliğe ve küçük dizgi hatalarına takılıyor.

## Kalan bulgular (hepsi somut ve küçük)
1. **Soru, 320:** dört soru halkası gizleniyor. Beş kişinin beşi "küçült ama gösterme" dedi; önerilen boy 120 px.
2. **Sonuç, 320:** künye "· 2013" diye noktayla başlayan bir satıra kırılıyor (5/5). Çözüm: "Dacke ve ark., 2013".
   Ön denetim bunu kaçırdı: nokta da kelime sayıldı.
3. **Sayılmadı, 320:** iki etiket alt alta düşüyor, dağınık duruyor (5/5). Çözüm: tek etiket, "2/4 doğru · hız
   sayılmadı". 348 ya daha da geri plana alınır ya da üstü çizilir (D2, D5).
4. **Giriş, 320:** halka yazısı yaklaşık 7 px'e iniyor, okunmuyor (4/5). Çözüm: 320'de tek halka ve en az 10 px, ya
   da yazısız iris.
5. **Okuma, 320:** kaydırma oku solan satırın üstüne biniyor (D2, D3, D5). Çözüm: ok ve ipucu kendi boş şeridinde
   dursun.
6. Doğru rengi iki ekranda tutarsız: soruda yeşil, sonuç halkasında mavi (D5). Halkadaki onay rozetleri yayın
   ortasında olmalı (D2).

## Karar
- Yöntem 2 de geçmedi. Kural gereği sahibe soruldu.
- Maket sahibe gösterilmedi.
