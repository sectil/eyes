# 5 saniye kapısı · tur 4 (2026-10-02; yalnız result1, sahip onayıyla sadeleşmiş hâl)

Görüntüler `maket/tur4/`. Beş yeni kimlik: F kafe çalışanı (29), G oyun stüdyosu UI tasarımcısı, H emekli bankacı
(64, gözlüklü), I öğrenci (19), J deneysel psikoloji araştırmacısı.

| Görüntü | F | G | H | I | J |
|---|---|---|---|---|---|
| light-390 | E | E | H | E | H |
| dark-390 | E | E | H | E | H |
| light-320 | H | H | E | H | H |
| dark-320 | H | H | H | H | H |

Sonuç: **kaldı**. 390'da 3/5; 320'de bütün görüntülerde geçen yok. Dört tur sonunda bu ekranda durağan kapı bırakıldı.

## Bulgular → bağlayıcı maddeler (kodda uygulanır, kapı kodda)
1. **Günün ızgarası 320'de de görünmeli** (F, G, I, J): ekranın en sevilen parçası; 320'de gizlenince ekran "kuru
   rapor" ve yarısı boş. 320'de beş kapsül satırı kalkar, ızgara kalır (kapsüller ızgarada zaten görünüyor).
2. **"2 yanlış kaydırma" büyük sayının yanında olmaz** (F "azar gibi", G): küçük, ızgaranın altında, nötr.
3. **Nef cümlesi kişiye dönük** (G, I): "Bugünün en hızlısını {x} saniyede buldun." Tek uç değer yerine tur bilgisi
   daha dürüst (J): taslak "Beş diziden dördünü buldun." METINLER'de sahibe.
4. **Büyük sayının ne olduğu** (H, J): ortanca; kişi ortalama sanıyor. Etiket önerisi "Bir diziyi bulma süren" ve
   küçük not "turun orta değeri". Bulunmayan dizi hesaba girmez; kapsülde "bulunmadı" yazar (J'nin itirazı kayıtlı).
5. **Kapalı "Bana hatırlat" anahtarı koyu temada görünmüyor** (F, G, H, I, J): `components/RemindField.jsx` ortak
   bileşen; bu modülün değil, bildirim işinin düzeltmesi. Ana oturum o işin sahibine iletir.
6. Kapsül satırındaki beş kez "7061" (F, H): kapsül içinde yalnız süre, dizi yazısı yok.
