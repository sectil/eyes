# Sabah havası cümleleri v2 (D11) · TASLAK, sahip onayı bekliyor

Sahip (2026-10-01): sabah havası bildirimi "doğallıktan çok uzak". Eski onaylı takım: `sabah-havasi-onay.md`.
Değişen yalnız gövdenin ilk satırı; başlık ("Gaziemir 17° · en çok 26°"), "Kaynak: Apple Weather" satırı, saat kuralları,
yaş öneki ("Sabah 05.40 tahminine göre …", not düşer) ve beş karar aynı kalır. Uzunluk en kötü değerlerle
(hissedilen -12°, %55, yaş öneki) ölçüldü: hepsi 110 sınırının içinde (en uzun 109).

| Hücre | Gövde (örnek değerlerle) |
|---|---|
| yağmur × soğuk | Bugün 21.00–22.00 arası yağmur bekleniyor, hissedilen 5°. Şemsiye ve mont al. |
| yağmur × serin | Bugün 21.00–22.00 arası yağmur bekleniyor, hissedilen 15°. Şemsiye ve hırka al. |
| yağmur × ılık | Bugün 21.00–22.00 arası yağmur bekleniyor, hissedilen 22°. Şemsiyeni unutma. |
| yağmur × sıcak | Bugün 21.00–22.00 arası yağmur bekleniyor, hissedilen 27°. Şemsiye ve su al. |
| yağmur × çok sıcak | Bugün 21.00–22.00 arası yağmur bekleniyor, hissedilen 34°. Şemsiye ve su al. |
| olasılık × soğuk | Bugün %40 yağmur ihtimali var, hissedilen 5°. Mont ve şemsiye al. |
| olasılık × serin | Bugün %40 yağmur ihtimali var, hissedilen 15°. Hırka ve şemsiye al. |
| olasılık × ılık | Bugün %40 yağmur ihtimali var, hissedilen 22°. Yanına şemsiye al. |
| olasılık × sıcak | Bugün %40 yağmur ihtimali var, hissedilen 27°. Su ve şemsiye al. |
| olasılık × çok sıcak | Bugün %40 yağmur ihtimali var, hissedilen 34°. Su ve şemsiye al. |
| kuru × soğuk | Yağmur beklenmiyor; hava soğuk, hissedilen 5°. Çıkarken sıkı giyin. |
| kuru × serin | Yağmur beklenmiyor; hava serin, hissedilen 15°. İnce bir hırka yeter. |
| kuru × ılık | Yağmur beklenmiyor; hava ılık, hissedilen 22°. Dışarıda biraz vakit geçirmeye değer. |
| kuru × sıcak | Yağmur beklenmiyor; hava sıcak, hissedilen 27°. Suyunu yanına al. |
| kuru × çok sıcak | Yağmur beklenmiyor; hava çok sıcak, hissedilen 34°. Suyunu al, gölgede kal. |

Olasılık hücreleri yeni: bugün %30–59 günlerde onaylı cümle olmadığı için sabah bildirimi hiç gelmiyor.

## Metin kapısı (5 kişi, ≥4/5, 2026-10-03)

| Tur | Aday | Yağmur | Olasılık | Kuru |
|---|---|---|---|---|
| 1 | A ("Bugün … arası"; "beklenmiyor; hava …") | **5/5** | 0/5 ("şemsiye de dursun" yarım) | 1/5 ("gölgeyi seç", "çıkmaya değer") |
| 1 | B ("…'den …'ye kadar"; "Yağmur beklenmiyor") | 3/5 | 2/5 ("yağabilir, olasılık" çift) | **5/5** |
| 2 | C1 "yağmur olasılığı %40 … Montunu giy" | — | 1/5 (ses öteki cümlelerden ayrı) | — |
| 2 | C2 "%40 yağmur ihtimali var … Mont ve şemsiye al" | — | **5/5** | — |

Seçilen: yağmur A, olasılık C2, kuru B. Kendi onayım: evet.

## Yürüyüşe yağmur (D11'in ikinci yarısı)

Kodda var, bu takımla değişmez: kişinin yürüyüş hatırlatması yağmura denk gelirse sabah bildiriminin metni Nef'in onaylı
F1 cümlesiyle değişir (`lib/nef/notify.js` zenginleştirme; `lib/nef/bank/tr.js` F1, örnek "Yürüyüş hatırlatman
20.00'de. Bugün yağmur 19.00'da bekleniyor; 18.30'da çıkabilirsin."). Yalnız test derlemesinde açık (SKY_UI);
cihazda denenmedi.
