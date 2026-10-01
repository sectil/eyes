# D5 + D6 · Hatırlatmalarda gün seçimi, saat kısıtı yok (ONAYLANDI, UYGULANDI) · 2026-10-01

Sahip kararları (2026-10-01): `lib/reminders.js` ve `lib/notifyPlan.js` değişebilir; eşdeğerlik testi bilerek değişir;
sessiz gün deneyi (%25) kalkar; 09.00–21.00 penceresi, "su en geç 18.00" ve "iki hatırlatma arası en az 1 saat" kalkar.
"Kullanıcı istediği saate kurar, bunu kısıtlayamazsın."

## Ne değişir
1. `lib/reminders.js`: her türe gün listesi (`days`, 0 = Pazar; alarmdakiyle aynı). VARSAYIM: eski kayıtta gün yoksa
   her gün. `timeError` yalnız geçersiz saati yakalar. `thin` (gün aşırı) ve seyreltme sorusu kalkar; eski kayıt
   okunur, yok sayılır.
2. `lib/notifyPlan.js`: 'window' ve 'thin' atlamaları ve sessiz gün zarı kalkar; seçilmeyen gün 'day' diye atlanır.
   Kişinin seçtiği saat kaydırılmaz. VARSAYIM: gece sessizliği kişinin kendi seçtiği hatırlatma saatini engellemez
   (açık seçim kazanır); Nef'in kendi önerdiği saatler gece kurallarına uymaya devam eder.
3. `lib/focus.js`: otomatik mola bildirimlerinin gece koruması (Bug 33) kendi sabitine taşınır, değişmez. Bu kişinin
   seçtiği saat değil, Nefona'nın kendiliğinden kurduğu bildirim.
4. `screens/Reminders.jsx`: "Çoğu gün / Gün aşırı" yerine alarm kurulumundaki gün çipleri (Pt…Pz, "Her gün");
   "Bazı günler bilerek göndermiyoruz" notu kalkar. Ana sayfadaki "Gün aşırı" sorusu kalkar.
5. Bilgi satırı (engel değil): seçilen saatin 30 dk içinde başka bildirim varsa "Yarım saat içinde N bildirimin daha
   var · Bildirimleri göster" (sahip onayı); dokununca o saatteki bildirimler listelenir. Cümleler taslak, onaya.
6. Göz çalışması hatırlatması (Çalışma günleri, `Schedule.jsx`): pencere zaten yok; "1 saat aralık" engeli kalkar,
   yerine aynı bilgi satırı.
7. Gelişim'deki "hatırlatma gelen / gelmeyen gün" karşılaştırması sessiz güne dayanıyor (`Progress.jsx`,
   `notifyLog.js`). Deney kalkınca bu kart ya kalkar ya da seçilmeyen günlerle kıyaslar — sahibe soru.

## Testler
Bilerek değişecekler: `reminders.test.js` (pencere, su, aralık), `notifyPlan.test.js` (window, thin, silent),
`notifyAll.equiv` fikstürleri (yeniden dondurulur), Reminders/Home ekran testleri (gün aşırı). Liste, kod bitince
tek tek yazılır. Öteki testler değişmek zorunda kalırsa durulur, sahibe sorulur.

## Kapı
Hatırlatma sayfası iki temada 390/320 çekilir; beş kişilik anlaşılırlık sınaması: "günleri ve saati nasıl
değiştireceğini, aynı saatte başka bildirim olduğunu 5 sn'de anladı mı" (en az 4/5). En çok 2 tur.

## Sonuç (2026-10-01)
Uygulandı; bağımsız inceleme; anlaşılırlık kapısı 5/5 (ilk tur). Sahip onaylı ek kararlar: plan dışı iki test
(moduleRemind.test, notifyAll.test) "seçilmeyen günde kurulmaz" diye yeniden yazıldı; cümle "Yarım saat içinde …";
Çalışma günleri de yuvarlak gün çipleri; "Gece mola bildirimi gelmez (21.00–09.00)." Sıradaki: gizli "Bana hatırlat"
kısmında da pencere/su/aralık kuralları kalkar (sahip: "orada da kalksın"); değişecek testler sahibe listelenir.
Açık: notifyLog.js evaluate/thinCandidate artık kullanılmıyor; QuietHours/Bildirimler'deki "gece sessizliğinin
içinde; saatini değiştir" uyarısı (gizli sayfalar) yeni kurala göre yanıltıcı.
