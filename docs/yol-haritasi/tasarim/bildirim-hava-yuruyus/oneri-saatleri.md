# Veri yokken öneri saati, modüle göre (D14; sahip kararı 2026-10-03 "Modüle göre farklı") · ONAYLANDI (sahip 2026-10-03), koda girdi

Bugün hepsi `lib/moduleRemind.js` FALLBACK_TIME 16.30. Öneri saati yalnız "Nef seçsin" kipinde ve kişinin o modülde beş
farklı günden az kaydı varken kullanılır; beş günden sonra Nef kişinin kendi saatine geçer. Kişi her zaman değiştirir.
Uygulama: modül manifestinde `remind.defaultTime` (planlayıcı zaten okuyor; notifyPlan/reminders/restNotify değişmez).
Saatler Nef'in pencereleri içinde: hareket 09.00–21.00, sakin 08.00–22.00.

**Dürüst not:** saat için doğrudan kaynağı olan yalnız göz kırpma (Wolffsohn 2025: günde 3 kez). Ötekilerin kaynakları
etkiyi gösteriyor, günün saatini değil; o saatler VARSAYIM ve gerekçesi yazılı. Ortak amaç: hepsi aynı 16.30'a yığılmasın.

| Modül | Pencere | Önerilen | Dayanak |
|---|---|---|---|
| Göz kırpma | hareket | 10.30 | Wolffsohn 2025 (wolffsohn2025): günde 3 kez; ilk seans sabah ekran işi içinde. Kişi 14.30 ve 18.30'u ekleyebilir. KAYNAK |
| Egzersiz setleri (routine; Göz egzersizi) | hareket | 11.30 | Talens 2022 (talens2022): ekran işinde mola göz yorgunluğunu azaltır; sabah ekran bloğunun sonu. VARSAYIM saat |
| Gökyüzü molası | sakin | 15.00 | Talens 2022, Yamashita 2021: mola ve doğaya bakış; öğleden sonra düşüşü. VARSAYIM saat |
| Hızlı Bakış | hareket | 10.00 | Ball 2002 (ball2002): hız alıştırması; dikkatin taze olduğu sabah. VARSAYIM saat |
| Tek Bakışta | hareket | 12.30 | Chung 2004 (chung2004): yan görüş alıştırması; öğle arası. VARSAYIM saat |
| Yakala Yaz | hareket | 13.30 | Rubin 1992 (rubin1992): kısa sürede kelime tanıma; öğle sonrası kısa tur. VARSAYIM saat |
| Oku ve Anla | sakin | 20.00 | Rayner 2016 (rayner2016): okuma; akşam okuma saati. VARSAYIM saat |
| Dalga | sakin | 18.30 | de Witte 2019 (dewitte2019): müzik stres ölçülerini düşürür; iş çıkışı. VARSAYIM saat |
| Yoga | sakin | 21.30 | Moszeik 2025 (moszeik2025), Luu 2024 (luu2024): yoga nidra; uykuya geçiş dersi akşam. Sakin pencerenin sonu 22.00. VARSAYIM saat |

Deney türleri (Mola, Yürüyüş, Nefes, Su) kendi varsayılan saatlerinde kalır (`lib/reminders.js`, dokunulmaz).

**Uygulama (2026-10-03):** dokuz manifestte `remind.defaultTime`. Gerçek kayıt defteriyle denendi: her modülde
veri yokken ilk saat tablodaki saat. Değişen test yok; tam takım yeşil.

**"Nef seçsin" cümlesi (sahip onayı 2026-10-03):** "Henüz saatini bilmiyorum; şimdilik saat {saat} olsun. Beş ayrı gün
yaptıktan sonra senin saatine göre ayarlarım." Metin kapısı: tur 1'de iki aday 0/5 ("beş kez" yanlış söz; planlayıcı beş
ayrı gün bekler), tur 2'de 5/5. Eski 16.30 cümlesi de bu biçime geçti (sahip: "Yeni biçime geçsin"). İki testte yalnız
beklenen cümle değişti (sahip izni); 10.30 için yeni test eklendi.
