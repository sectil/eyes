# Gelişim merkezine girebilecek ölçülen veriler (koddan doğrulandı, 2026-09-30)

Amaç: Gelişim ekranının ortasına "kaç gün" yerine **ölçülen gelişim** konacak. Bu liste, uygulamada bugün gerçekten
bulunan ölçümleri gösterir. Her satırın kaynağı bir dosya ve bir alan adıdır; uydurma yoktur. `app/` altında hiçbir şey
değiştirilmedi.

## Alan başına ölçümler

| Alan | Ölçüm | Kaynak (dosya · alan) | İlk değer ne zaman | Hüküm ne zaman |
|---|---|---|---|---|
| Göz | E testi (görme keskinliği, logMAR) | `lib/progress.js eyeCard` · `baseline`, `current`, `delta`, `trend` | ilk testte | `lib/trend.js` evreleri; başlangıçtan sonra |
| Göz | İlk Bakış: 20 sn'de kırpma sayısı | `lib/dataHub.js ANSWER_FIELDS` · `profile.iris.baseline.blinks`, `recheck.blinks` | 1. gün | yalnız yeniden ölçümde (`recheck`) |
| Dikkat | Tek Bakışta kavranan harf | `modules/tek-bakis/manifest.js` · `span` | ilk oturum | en az 6 ölçüm (`METRIC_MIN`) |
| Dikkat | Algı hızı eşiği (ms, düşük iyi) | `modules/quick-look/manifest.js` · `threshold` | ilk oturum | en az 6 ölçüm |
| Farkındalık | Fark etme isabeti (%) | `modules/fark-ettin/manifest.js` · `noticed/asked` | ilk oturum | en az 6 ölçüm |
| Farkındalık | Bugünün görevinde fark edilen (kez) | `modules/notice/manifest.js` · `count` | ilk oturum | en az 6 ölçüm |
| Nefes / sakinlik | Nefesten önce → sonra sakinlik (5 üzerinden) | `modules/breath/manifest.js` · `calmBefore`, `calmAfter` | ilk oturum | en az 3 oturum (`ACUTE_MIN`) ve güven aralığı |
| Nefes / sakinlik | Gökyüzü molası: önce → sonra dinlenmişlik (10 üzerinden) | `modules/gokyuzu/manifest.js` · `before`, `after` | ilk oturum | en az 3 oturum |
| Nefes / sakinlik | Stres (başlangıç sorusu) | `ANSWER_FIELDS` · `stressNow` | başlangıç sorularında | yeniden sorulunca |
| Kendine yaklaşım | Ayna puanı (5 üzerinden) | `modules/yon/manifest.js` · `score` | ilk oturum | en az 6 ölçüm |
| Kendine yaklaşım | Kendine şefkat (başlangıç sorusu) | `ANSWER_FIELDS` · `selfCompassion` | başlangıç sorularında | yeniden sorulunca |
| Ruh hâli | WHO-5 iyi oluş (100 üzerinden) | `lib/progress.js who5Card` | 14 günde bir | anlamlı fark 10 puan (`WHO5_MEANINGFUL`) |
| Ruh hâli | Uyku (başlangıç sorusu) | `ANSWER_FIELDS` · `sleep` | başlangıç sorularında | yeniden sorulunca |
| Hareket | Hareketli gün (başlangıç sorusu) | `ANSWER_FIELDS` · `activityDays` | başlangıç sorularında | yeniden sorulunca |
| Hareket | Apple Sağlık adımı | yalnız bellekte; merkeze girmiyor (DENETIM Ö-9) | izin verilince | yok (kaydedilmiyor) |

Alanın toplu hükmü `lib/dataHub.js verifiedChange` fonksiyonundan gelir: `'up'` (başlangıcından iyi), `'down'`
(başlangıcının gerisinde) ya da `null` (henüz belli değil / değişim yok).

## Tasarım için sonuçlar (dürüst sınırlar)

1. **Başlangıç soruları, ilk E testi ve İlk Bakış yapıldıysa 1. günde her alanın bir başlangıç değeri olur.** VARSAYIM:
   yeni kullanıcı bunları ilk gün yapar; akış kontrol edilmedi (bakmadım). İlk
   gün boş değildir; "başlangıç çizgin" gösterilebilir.
2. **İlk haftalarda doğrulanmış hüküm çoğunlukla yoktur.** Ölçümler için en az 6, anlık etkiler için en az 3 oturum
   gerekir. O zamana kadar ekran "iyileşti" diyemez. Yalnız "ölçtün: X; başlangıcın: Y" diyebilir.
3. **Her ölçümün ölçeği farklıdır** (harf, ms, %, 5 üzerinden, 100 üzerinden). Alanlar arası karşılaştırma yapılmaz.
   Her alan yalnız kendi başlangıcına göre gösterilir.
4. **Adım verisi bugün merkeze girmiyor** (DENETIM Ö-9). Canlı yürüyüş gösterilebilir, ama geçmişe dönük adım gelişimi
   için kodda değişiklik gerekir (G4).
5. **Kamera görüntüsü telefondan çıkmaz.** Gösterilecek yalnız ölçülen sayıdır.
