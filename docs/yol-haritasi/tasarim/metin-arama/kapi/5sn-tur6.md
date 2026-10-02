# 5 sn kapısı · tur 6 (2026-10-02, sahip onayı: rekor anı ekranın en büyük öğesi, önceki → bu süre)

Görüntüler: `maket/tur6/`. İstem: `degerlendirici-tur6.md`.

| Ekran | A | B | C | D | E | Geçti mi |
|---|---|---|---|---|---|---|
| result-rekor | E | E | E | E | E | **5/5 geçti** |
| result (sıradan tur) | H | H | H | H | H | 0/5 |

## Son durum (tasarım oturumu)
| Ekran | Soru | Sonuç |
|---|---|---|
| Giriş | etkilendin mi | 5/5 (tur 2) |
| Arama | anladın mı (sahip kararı) | 5/5 (tur 5) |
| Bulma anı | etkilendin mi | 4/5 (tur 4) |
| Yok kararı | etkilendin mi | 5/5 (tur 4) |
| Sonuç, rekor | etkilendin mi | 5/5 (tur 6) |
| Sonuç, sıradan tur | etkilendin mi | **geçmedi**; sahip kararıyla ana oturumda gerçek kodla cihazda yeniden sınanır |

## Bulgular
1. Sıradan tur (5/5): büyük süre bağlamsız, "iyi mi kötü mü" belli değil; seri, hedef ya da "dünden hızlı" isteği
   (C, E) sahibin "puan ve yıldız yok" ve Gelişim değişim sözcükleri kurallarıyla çelişiyor. Ana oturumda
   denenebilecek, kurallara uyan yol: rekor kırılmadığında küçük bir "En iyi turun {x} sn" satırı. Sahip kararı ister.
2. Kuzgun başlığı Türkçe olarak bozuk (B, E): "Saatler sonrası için alet seçen kuzgunlar" oldu.
3. 320'de kaynak satırları gizliydi (A, D): artık 320'de de görünüyor.
4. "papağanlarda" 320'de kutuya sıkışık sığıyor (B, C, D, E): ana oturumda kutu iç boşluğu ayarlanır.
5. Rekor kartında 3,4 iki kez yazıyor (A); D: 4 ölçüme dayanan rekor gürültülü olabilir, kutlama ölçülü kalsın.
