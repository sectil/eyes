# Gelişim eşdeğerlik tabanı (dondurulmuş)

Kaynak kayıt: `e1b35b0` ("Gelişim merkezi: sahibin DEVIR §6 cevapları"), G1'den önce; çalışma ağacı temizken alındı.
Gelişim merkezi planı `docs/yol-haritasi/tasarim/gelisim-merkezi/PLAN.v1.md` §8.4 gereği: G1'de (veri) `growthMap`'in
`days`, `strip`, `sinceStart`, `frac` alanları bu tabanla 20.000 tohumlu depoda 0 farkla aynı kalmalıdır; fark yalnız
izinli listede olabilir (hüküm metni ve `verdict`: K1–K4, Ö-1, Ö-3, Ö-8; Ö-5 kayıt sayıları; Ö-9 Apple Sağlık günleri).
Düzenek: `src/lib/growth.equiv.test.js`; depo üreteci `test/growthStore.js`; karşılaştırma ve fark grupları
`test/growthEquiv.js`.

- `dataHub.js`, `progress.js`, `stats.js`, `exportData.js`: PLAN §8.4'ün saydığı dört dosya.
- `trend.js`, `vaSeries.js`: G1'de değişecek yardımcılar. PLAN §13: Ö-11 (kamerasız tek E testi seriyi siliyor) G1'in ilk
  adımıdır ve `trend.js`'te seri seçimini değiştirir. Taban, göz kartını eski `trend.js` ile hesaplasın diye ikisi de
  donduruldu (`vaSeries.js` yalnız `trend.js`'i yerel olandan alsın diye).
- Altı dosya birbirine yerel (`./x.js`); öteki bağımlılıklara (`registry.js` ve modül manifestleri, `profile.js`,
  `calendar.js`, `habitLog.js`, `routines.js`, `ladders.js`, `format.js`, `reading.js`, `optotype.js`, `identity.js`)
  `src/` yoluyla bağlanır. Dosyalar `src/lib`'deki hâllerinin aynısıdır; yalnız içe aktarma yolları farklı.
- VARSAYIM: modül manifestleri dondurulmadı. G1'in manifest değişiklikleri (`reading-cps` metriği, Tek Bakışta `span7`
  ortancası) iki tarafa birden girer; gün sayımı (`sessions.match`, `domainOf`) değişmediği için `days`/`strip`
  karşılaştırması etkilenmez. Manifestte gün sayımını değiştiren bir değişiklik gerekirse taban yeniden düşünülür.
- Bu dosyalar değiştirilmez. Taban yeniden dondurulacaksa sahibe sorulur ve bu not güncellenir. Uygulama derlemesine
  girmez (yalnız testler kullanır).
