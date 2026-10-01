# Bildirim eşdeğerlik tabanı (dondurulmuş)

Kaynak kayıt: `57a7734` (gece düzeltmeleri Bug 33 `0daf495` ve Bug 34 `57a7734` sonrası). Bildirim, hava ve yürüyüş
planı `docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/PLAN.v1.md` §5.4 ve §5.5 madde 5 gereği: B1'de yeni özellikler
kapalıyken `planAll` çıktısı bu `planNotifications` ile, yeni `notifyApply` çağrı dizisi bu `notifyApply` ile
20.000 tohumlu bağlamda aynı olmalıdır.

- `notifyPlan.js`, `notifyApply.js`, `focus.js`: o kayıttaki hâlleri; birbirlerine yerel, öteki bağımlılıklara
  (`reminders.js`, `habitLog.js`, `notifyLog.js`, `breath.js`, `calendar.js`, `native.js`) `src/lib` yoluyla bağlanır.
- Bu dosyalar değiştirilmez. Taban yeniden dondurulacaksa (ör. yeni bir gece düzeltmesi) sahibe sorulur ve bu not
  güncellenir. Uygulama derlemesine girmez (yalnız testler kullanır).
