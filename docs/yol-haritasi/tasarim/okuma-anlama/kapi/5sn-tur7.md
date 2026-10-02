# 5 saniye kapısı · tur 7 (2026-10-02, sahip "Onay")

Yalnız soru ve sayılmadı ekranları. Yeni beş bağımsız değerlendirici.

| Ekran | D1 | D2 | D3 | D4 | D5 | Sonuç |
|---|---|---|---|---|---|---|
| soru | H | E | E | H | E | 3/5 ✘ (ölçüt 4/5) |
| sayilmadi | H | H | H | E | H | 1/5 ✘ |

## Bulgular
- **Sayılmadı:** tur 6'da "348 soluk" denmişti. Bu kez kalın ve renkli 348 "kazanılmış sonuç gibi" okundu; beş
  kişinin dördü söyledi. İkisini birden karşılamak için iki ayrı satır gerekiyor:
  - "Hız sayılmadı" güçlü bir etiket.
  - Altında okunaklı ama ikincil gri satır: "Ölçülen hız 348 kelime/dk".
- 320'de kart, düğmenin altında sert kesiliyor gibi duruyor (D3, D5); solma daha uzun olmalı.
- **Soru:**
  - 320'de doğru şıkta "yön bulmasını" erken kırılıyor (D1, D3, D4).
  - Şu anki yay parıltı yüzünden bulanık duruyor (D2, D5).
  - 390'da şıklar ile düğme arasında boşluk var (D1, D5).

## Hazırlanan düzeltmeler
- Etiket yalnız "Hız sayılmadı". Altında `--ink-2` renginde, normal ağırlıkta "Ölçülen hız 348 kelime/dk".
- 320'de alt solma 72 px.
- Şık metninde dengeli kırma kalktı.
- Şu anki yay düz, açık ton; parıltı yok.
- 390'da halka 170 px; boşluğu halka doldurur.
