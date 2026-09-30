> **Durum (2026-09-30): gönderilmedi, şimdilik gönderilmeyecek.** Önceki nottaki "App Store Connect → Contact Us → App Review"
> yolu yoktur (doğrulanmadan yazılmıştı). Apple'ın App Review sayfasına (https://developer.apple.com/distribute/app-review/)
> göre iki yol var: (1) App Review ile 30 dakikalık görüntülü görüşme, kılavuza uyum soruları için
> (https://developer.apple.com/events/view/upcoming-events?search=Review); (2) iletişim formu
> (https://developer.apple.com/contact/request/app-review/support/), Apple bunu reddedilen ya da kaldırılan uygulamalar
> için tarif ediyor. Plan yedeği sormadan kurala uyar: başlıkta yalnız ay, hava yalnız tam atıflı "Hava ve ay" kartında,
> bildirimde "Kaynak: Apple Weather" satırı (aşağıdaki İngilizce mektupta çevirisi "Source: Apple Weather"). Hava başlıkta istenirse Y5'ten önce görüşmede aşağıdaki metin kullanılır.

---

**Subject:** WeatherKit attribution in a one-line header and a local notification

Hello App Review team,

Nefona (iOS, Turkish interface) plans to add WeatherKit (Swift framework) in a future update. Weather would appear in three places:

1. **"Weather and moon" card:** current temperature, hourly chance of rain, daily high and low. It always shows the Apple Weather mark (light or dark, matching the theme) and a "Data sources" link that opens `legalPageURL`.
2. **Home screen header:** one line after the date, e.g. "29 September · waning gibbous · 18° · rain this afternoon". It has no mark or link; tapping it opens the card above.
3. **Morning local notification** (opt-in, at most one a day): "Rain expected today. 70% chance of rain between 14:00 and 17:00. Source: Apple Weather". Tapping it opens the card.

Guideline 5.2.5 says: "If your app displays Apple Weather data, it should follow the attribution requirements provided in the WeatherKit documentation." The WeatherKit documentation says "Attribution is required for publishing software using WeatherKit." and defines it as "The required attribution which includes a legal attribution page and Apple Weather mark."

Is this sufficient for the header and the notification? If not, which form do you require?

Thank you,
[Your name]

---

**Kaynaklar (gönderilmez).** Alıntılar `docs/yol-haritasi/tasarim/arastirma-v1/` altındaki Apple kopyalarından aynen alındı:
- Kural 5.2.5: `apple/guidelines.html:1645` (App Store Review Guidelines, "5.2.5 Apple Products").
- "Attribution is required for publishing software using WeatherKit.": `weatherkit_weatherattribution.json` (WeatherAttribution, Overview).
- "The required attribution which includes a legal attribution page and Apple Weather mark.": `weatherkit_weatherservice_attribution.json` (WeatherService.attribution, özet).
- `legalPageURL` ("A link to the legal attribution page…") ve açık/koyu marka URL'leri: `weatherkit_weatherattribution.json` (üye listesi).
- Kuralın atıf ettiği get-started sayfasının ("attribution requirements") kopyası klasörde yok; yalnız Türkçe özeti var (`hava-ay.md:95-97`). Bu yüzden metinde ondan alıntı yapılmadı.
- Üç yerin tasarımı: plan §3.E.6 (bildirim metni, satır 956–958) ve §3.E.7 (başlık şeridi ve kart, satır 966–973). Metindeki İngilizce örnekler, Türkçe arayüz metinlerinin çevirisidir.
