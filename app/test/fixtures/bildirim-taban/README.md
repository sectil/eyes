# Bildirim eşdeğerlik tabanı (dondurulmuş)

Kaynak kayıt: `57a7734` (gece düzeltmeleri Bug 33 `0daf495` ve Bug 34 `57a7734` sonrası). Bildirim, hava ve yürüyüş
planı `docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/PLAN.v1.md` §5.4 ve §5.5 madde 5 gereği: B1'de yeni özellikler
kapalıyken `planAll` çıktısı bu `planNotifications` ile, yeni `notifyApply` çağrı dizisi bu `notifyApply` ile
20.000 tohumlu bağlamda aynı olmalıdır.

- `notifyPlan.js`, `notifyApply.js`, `focus.js`: o kayıttaki hâlleri (`notifyPlan.js` ve `focus.js` 2026-10-01'de yeniden
  donduruldu, aşağıya bkz.); birbirlerine yerel, öteki bağımlılıklara
  (`reminders.js`, `habitLog.js`, `notifyLog.js`, `breath.js`, `calendar.js`, `native.js`) `src/lib` yoluyla bağlanır.
- Bu dosyalar değiştirilmez. Taban yeniden dondurulacaksa (ör. yeni bir gece düzeltmesi) sahibe sorulur ve bu not
  güncellenir. Uygulama derlemesine girmez (yalnız testler kullanır).

## Yeniden dondurma · 2026-10-01 (D5+D6)

Sahip kararı (D5+D6 plan, `docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/D5-D6-plan.md`): hatırlatmalarda saat
kısıtı ve sessiz gün deneyi kalktı, türlere gün seçimi geldi. `notifyPlan.js` yeni kurala göre donduruldu: 'window' ve
'thin' atlamaları ve sessiz gün zarı (`dice`, `SILENT_RATE`) yok; seçilmeyen gün 'day'; uygun gün her zaman 'send'.
`focus.js` yalnız gece penceresini kendi sabitine (`BREAK_WINDOW`, 09.00–21.00) taşıdı; davranışı aynı. `notifyApply.js`
değişmedi. İki dosya `src/lib`'deki hâllerinin aynısı (yalnız içe aktarma yolları farklı).

## Yeniden dondurma · 2026-10-01 (çalışma oturumu)

Sahip kararı (2026-10-01): "Çalışma oturumu sürerken, senin kurduğun hatırlatmalar gelsin." `notifyPlan.js` yeni
kurala göre donduruldu: 74xx ve Çalışma günleri oturum içinde de kurulur ('focus' atlaması oluşmaz); bir hatırlatmayla
±60 sn içinde (uç dahil, `FOCUS_CLASH_MS`) çakışan oturum molası (75xx) kurulmaz, hatırlatma kalır. `focus.js`'te
yalnız baş yorumu güncellendi (davranış aynı). `notifyApply.js` değişmedi. İki dosya yine `src/lib`'deki hâllerinin
aynısı (yalnız içe aktarma yolları farklı).

## Yeniden dondurma · 2026-10-01 (onaylı metinler)

Sahibin onayladığı bildirim metinleri: `notifyPlan.js`'te yalnız `TEXTS` (ve üstündeki yorum) değişti; her türün
listesi 2–3 metin. Seçim kuralı aynı (`(dönem günü + kaydırma) % n`); liste boyu değiştiği için aynı gün başka metin
düşebilir. `focus.js` ve `notifyApply.js` değişmedi. `notifyPlan.js` yine `src/lib`'deki hâlinin aynısı (yalnız içe
aktarma yolları farklı).
