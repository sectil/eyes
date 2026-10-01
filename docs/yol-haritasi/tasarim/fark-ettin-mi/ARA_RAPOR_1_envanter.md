# Fark Ettin mi? · 1. ara rapor: envanter (2026-10-01)

Okunan dosyalar: `app/src/modules/fark-ettin/manifest.js`, `view.jsx`, `app/src/screens/StreetWalk.jsx`,
`app/src/lib/street.js`, `streetSvg.js`, `styles/street.css`, `lib/ladders.js` (UNLOCK), `lib/progress.js` (V2_PARAMS),
`lib/growthCenter.js` (alanlar), `modules/registry.js` (sözleşme), `nef/PLAN.md` §4, §4.8, `IS_AKISI_KURALLARI.md`,
`HATA_GUNLUGU.md` (Build 29), testlerdeki `street` fikstürleri, sahibin iki cihaz görüntüsü.

## Bugün ne var

| Konu | Bugünkü hâl | Yer |
|---|---|---|
| Akış | Görev ekranı → cadde ~40 sn kayar → sayı sorusu → 3 fark etme sorusu → sonuç + "Doğru mu, efsane mi?" kartı | `StreetWalk.jsx` |
| Sahne | Tek sahne: gündüz cadde. 9 dükkân, kişiler, kedi, bisiklet, satıcı, araba. Hepsi düz SVG; kişiler 1,5 px zıplar | `streetSvg.js` |
| Görev | 4 tür, hepsi sayma: mavi araba, sarı taksi, kedi, bisiklet | `street.js TASKS` |
| Sorular | 6 şablon, her turda 3'ü: gülen kadının elbisesi, sarışın kadının çantası, çocuğun elindeki, şapka rengi, satıcı, yeşil tenteli dükkân | `makeQuestions` |
| Seviye | 1–3; yalnız kalabalık (14/18/22 kişi) ve süre (40/36/32 sn). İki tur görev tam → üst; görev 0 → alt | `LEVELS`, `nextLevel` |
| Kayıt | `{type:'street', seed, level, taskId, count, countAnswer, task, noticed, guessedRight, asked, answers[], seconds}` | `makeRecord` |
| Gelişim | Tek metrik `street-noticed` = 100 × noticed / asked, alan `awareness` → Dikkat. Ölçü kuralı v2: alışma 2 gün, SD tabanı 5 | `manifest.progress`, `progress.js:190` |
| Nef | `coach()`: 7 günde tur sayısı, fark yüzdesi, seviye. `nef` alanı yok, `remind` yok, `sources.js`'te bu modülün kaynağı yok | `manifest.coach` |
| Yol | 6. günden açılır, haftada 3 gün, Tek Bakışta ile dönüşümlü, 2 dk, glyph `street` | `ladders.js UNLOCK`, `today()` |
| Bilim | 7 kart `FACTS`; DOI var, PMID yok | `street.js FACTS` |

## Zayıflıklar

1. **Görüntü basit.** Cihazda sahne ekranın alt yarısında; üstte büyük boş gök var. Lamba direği "TERZİ" tabelasını
   kesiyor. Arabalar yolda duruyor, cadde kayıyor; trafik gibi değil. Derinlik, ışık ve gölge yok.
2. **Tek sahne, tek görev türü.** Dört görevin hepsi sayma. Altı soru şablonu tekrar ediyor; 2.–3. turdan sonra kişi
   soruları bekliyor. Kodun kendisi de bunu yazıyor ("ilk turdan sonra kişi soruları bekler").
3. **Seviye sığ.** Üç seviye var ve yalnız kalabalığı değiştiriyor. Kişi bir haftada tavana ulaşıyor.
4. **Ölçü kaba ve karışık.** Turda 3 soru var; değer yalnız 0, 33, 67 ya da 100 olabiliyor. 4 seçenekte şans %25.
   Seviye değişince seri karışıyor. Onaylı SONSUZ_YOL §3 "v2, seviye içinde; seviye değişince başlangıç yeniden
   kurulur" diyor; kodda bu yok (`progress.js:190` VARSAYIM notu). Sayma görevinin isabeti Gelişim'e hiç girmiyor.
5. **Gelişimi göstermiyor.** Sonuç ekranı yalnız bu turu gösteriyor; önceki turlarla ilişki yok. "Görev ½" ilk
   bakışta anlaşılmıyor.
6. **Nef'e öğretilmemiş.** Nef planı §4.8 sözleşme testi `nef.evidence` anahtarlarının `sources.js`'te PMID ve DOI ile
   kayıtlı olmasını istiyor. Bu modülün kaynakları yalnız `FACTS` içinde ve PMID'siz; test düşer.
7. **Metin kuralı.** Tahmin geri bildiriminde "Beynin görmüş olabilir" yazıyor. Gelişim ekranları için "beyin" yasak;
   bu modülün ekranında da kaldırılması önerilecek (sahip onayına).
8. **Ad.** Y3 notunda "Fark Ettin mi?" ilk bakışta anlaşılmayan adlar arasında.

## Korunacaklar

- Saf mantık + çizim ayrımı (`street.js` / `streetSvg.js`), tohumlu üretim, testler.
- "Fark etmedim, tahmin edeceğim" ayrımı ve tahminin puana katılmaması.
- İddia sınırı cümlesi.
- Yolda yeri (6. gün, haftada 3, `week3` dönüşümü; HATA_GUNLUGU Build 29 düzeltmesi bozulmaz).
- Eski kayıtlar: `type:'street'` kayıtlarının hepsi okunmaya devam eder.
