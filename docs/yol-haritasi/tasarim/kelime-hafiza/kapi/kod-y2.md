# Yakala Yaz · gerçek kod ekranı kapısı (Y2, 2026-10-02)

Ekranlar gerçek kodla çekildi: 390 ve 320, açık ve koyu tema, iPhone güvenli alanı ve klavye taklidi. Mikrofon düğmesi
düzenekte yok: cihaz içi destek yalnız iPhone'da bilinir.

## Tur 1 ve tur 2 · tek ekran, E/H, beş kişi
- Tur 1: giriş 5/5 geçti; öteki ekranlar geçmedi.
- Tur 2: giriş 3, gösterim 3, yazma 3, doğru 3, yanlış 2, sonuç 0. Ortak neden: basamak rozetinin yazısı. Bu düzeltildi.
- Yöntem değişti (İş akışı kuralı 5): kör karşılaştırma. Her ekranın kod ve maket sürümü A/B olarak verildi. Hangisinin
  kod olduğu değerlendiriciye söylenmedi. Anahtar: giriş A=kod, gösterim A=maket, yazma A=kod, doğru A=maket,
  yanlış A=kod, sonuç A=maket.

## Kör tur 1 · beş kişi · kodun E sayısı
| Ekran | E | Kodu daha iyi bulan |
|---|---|---|
| giris | 3/5 | 3/5 |
| goster | 0/5 | 0/5 |
| yaz | 0/5 | 0/5 |
| dogru | **4/5 geçti** | 5/5 |
| yanlis | 3/5 | 5/5 |
| sonuc | 1/5 | 4/5 |

Düzeltilenler:
- 320'de merdiven uç yazıları kesiliyordu.
- Yazmada D4 alt satırı yalnız mikrofonla çıkıyordu. Mikrofonsuz hâli artık "Yaz ve Gönder'e bas." oldu; bu, onaylı
  D4'ün ilk parçasıdır.
- Gösterimde alan sönük.
- Sonuçta grafik boş alanı dolduruyor.
- Düzenek imleci gizliyordu.

## Kör tur 2 · beş yeni kişi · kodun E sayısı
| Ekran | E | Kodu daha iyi bulan |
|---|---|---|
| giris | 3/5 | 4/5 |
| goster | 0/5 | 0/5 |
| yaz | 0/5 | 1/5 |
| dogru | **4/5 geçti** | 5/5 |
| yanlis | 2/5 | 3/5 |
| sonuc | 1/5 | 4/5 |

## Sonuç: kör yöntem iki turda geçmedi; durdu, sahibe soruldu
Tekrarlayan bulgular, bağlayıcı maddelerle çelişenler:
- **Gösterim (madde 3):** kelime görünürken alan ipucusuz. On kişiden on kişi "boş kutu bozuk ya da yarım" dedi.
- **Yazma (madde 4):** merdiven sönük. Yedi kişi "devre dışı gibi" dedi. Maket sürümü mikrofonlu olduğu için ayrıca
  tercih edildi.
- **Sonuç (madde 9):** aşağı inen çizgi hızlanmayı gösteriyor. Üç kişi bunu "kötüleşme gibi" okudu. Ayrıca alt
  boşluk.

Maddelerle çelişmeyen bulgu:
- **Yanlış:** −3 rozeti çıkıyor, ama rozet ve merdiven yalnız yeni basamağı gösteriyor. Üç kişi "düşüş görünmüyor"
  dedi.

## Sahip kararı (2026-10-02, kör turlardan sonra soruldu)
Bağlayıcı maddeler değişti (`5sn-tur2.md`):
- **Madde 3, gösterim:** kelime görünürken alan ve mikrofon görünmez. Odak ve klavye yerinde kalır, ekran zıplamaz.
  Kod bunu geri bildirime de uyguladı. Tur 5'te iki kişi geri bildirim sırasındaki boş alanı "yeniden yaz" sandı.
- **Madde 4, yazma:** merdiven canlı kalır, sönük değil.
- **Madde 9, sonuç:** hızlı tur yukarıda. Eksen ayrı sütunda, "↑ Hızlı / ↓ Yavaş".

Bulgu üzerine eklenen:
- Yanlışta bırakılan üç basamak merdivende işaretli.
- Yanlışta da çerçeve var, parıltısız.

## Tur 5 · yeni tasarım · gerçek ekran, tek başına, beş yeni kişi
| giris | goster | yaz | dogru | yanlis | sonuc |
|---|---|---|---|---|---|
| **4/5** | **5/5** | **5/5** | 3/5 | 3/5 | 2/5 |

## Tur 6 · geçmeyen üç ekran · beş yeni kişi
| dogru | yanlis | sonuc |
|---|---|---|
| **4/5 geçti** | 1/5 | 2/5 |

- Yanlış ekranı: beş kişiden dördü hitabın kaydığını söyledi. Doğru ekranı "hızlandın" diyor, yanlış ekranı
  "yavaşladı".
- Sonuç ekranı: beşinci kişi R cümlesinin ölçüyü yanlış anlattığını gösterdi. Cümle "Denemelerin çoğunda … bu sürede
  doğru yakaladın" idi. Oysa merdiven, +1 ile −3 dengesinde dört denemenin üçünü bildiğin süreye yerleşir. Büyük sayı
  son 10 denemenin ortancasıdır.
- Yanlış ve sonuç iki turda geçmedi. Yöntem değişti: önce/sonra kör karşılaştırma ve cümle doğruluk sorusu.

Metin değişiklikleri (sahip yetkisi "sen onayla", 2026-10-02; METINLER'e işlendi):
- D7–D10: "üç basamak yavaşladı" yerine "üç basamak yavaşladın".
- Sonuç cümlesi: "Bu sürede iki kelimeyi yaklaşık dört denemeden üçünde yakalıyorsun."
- Merdiven uçları D2 harfi harfine yazılıyor: "ms" küçük. Önceden büyük harfe çevrildiği için "MS" görünüyordu.

## Önce/sonra kör karşılaştırma · beş yeni kişi
Anahtar: yanlış A=sonra, sonuç B=sonra.

| | Yeni sürüm E | Yeni sürümü daha iyi bulan | Yeni cümle "tanıma göre doğru" |
|---|---|---|---|
| yanlis | **5/5 geçti** | 5/5 | — |
| sonuc | **5/5 geçti** | 5/5 | **5/5** (eski cümle 5/5 "yanlış") |

**Sonuç: Yakala Yaz'ın altı ekranı da 5 sn kapısından geçti.**
