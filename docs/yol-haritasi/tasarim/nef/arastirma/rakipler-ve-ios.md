# Rakipler ve iOS olabilirliği (araştırma, 2026-10-01)

Bu oturumda bir araştırma ajanı web'de taradı; her iddianın yanında kaynak var. Doğrulanamayanlar "DOĞRULANAMADI"
diye işaretli. Kapalı uygulamaların içi görülemez; "bulamadık" "yok" demek değildir.

## A. Rakip uygulamalar

| # | Fikir | Bulunan | Kaynak |
|---|---|---|---|
| 1 | Yürüyüş başlayınca soru + sesli eşlik | Apple Watch 10–15 dk sonra "antrenman yapıyor gibisin" der; kısa gezintiler çoğu zaman yakalanmaz. Workout Buddy (watchOS 26) sesli cesaret verir; Apple Intelligence'lı iPhone ve kulaklık ister. İkisini birleştiren bulunamadı. Nike Run Club, Runkeeper: DOĞRULANAMADI | myhealthyapple.com/automatic-workout-detection-not-working-on-apple-watch-fix-it-today/ · apple.com/newsroom/2025/06/watchos-26-delivers-more-personalized-ways-to-stay-active-and-connected/ · engadget.com/wearables/how-to-use-workout-buddy-with-apple-watch-and-ios-26-130000922.html |
| 2 | Geçmiş etkini hatırlayan koç | Oura Advisor "Memories", Whoop "My Memory", Headspace Ebb hafızası, Garmin Active Intelligence (stres–uyku bağı), Welltory. Ders bazında "o dersten sonra puanın X'ten Y'ye" bulunamadı | businesswire.com/news/home/20250331565896 · whoop.com/us/en/thelocker/new-ai-guidance-from-whoop/ · businesswire.com/news/home/20251208896917 · garmin.com/en-US/newsroom/press-release/wearables-health/elevate-your-health-and-fitness-goals-with-garmin-connect/ · welltory.com/science/ |
| 3 | Bilerek susan, tekrar etmeyen koç | Bulunamadı. En yakını: Oura'da sıklığı kişi seçer; Fabulous ayarlanabilir dürtüler | ouraring.com/blog/oura-advisor/ · design.google/library/engagement-is-fabulous-health-app |
| 4 | Havaya göre su | Waterllama hedefi iklim türüne göre ayarlar (günün sıcaklığı değil). WaterMinder: DOĞRULANAMADI | makeuseof.com/waterllama-ios-app-hydration-fun-challenges/ · waterllama.com |
| 5 | Yağmur + eylem önerisi | Apple Weather sonraki saat yağmuru (AU, IE, JP, UK, US), Carrot Premium. Eylemle birleştiren yalnız küçük uygulamalar: Kairos Coach, Runners Weather | support.apple.com/en-us/105038 · apps.apple.com/us/app/-/id6746157421 · apps.apple.com/us/app/runners-weather/id6747822231 |
| 6 | Gün ışığına göre mola | Yalnız gün batımı uygulamaları (Sundown, Sunsets Reminder, Sol) | apps.apple.com/us/app/sundown-sunrise-sunset-alerts/id6711351809 · sol.juggleware.com |
| 7 | Aylık hikâye | Gentler Streak, Whoop Month in Review, Oura raporları; Strava ve Garmin yıllık | docs.gentler.app/using-insights-and-recaps/understand-your-monthly-recap · whoop.com/us/en/thelocker/monthly-performance-assessment/ |
| 8 | Haftalık yapay zekâ özeti | Whoop Weekly Plan, Oura haftalık; Garmin Rundown (yapay zekâ olduğu DOĞRULANAMADI); Strava etkinlik başına. "Mektup" biçimi bulunamadı | whoop.com/us/en/thelocker/everything-whoop-launched-in-2025/ · support.strava.com/en-us/articles/15401629 |
| 9 | Kişinin saatini öğrenen hatırlatma | Streaks "Automatic Time" (yöntemi DOĞRULANAMADI); Rise vücut saatine göre | macstories.net/reviews/achieving-personal-goals-with-streaks/ · risescience.com/blog/personal-energy-tracker |
| 10 | Modelsiz cümle bankası | Bulunamadı; büyük koçların hepsi dil modeli kullanıyor (Fitbit Gemini, Whoop, Oura, Workout Buddy) | gentlerstories.com/gentlerstreak |

## B. iOS olabilirliği (Apple belgeleri)

- **CoreMotion:** `startActivityUpdates` "updates are not delivered while your app is suspended". Uygulama askıdayken
  yürüyüşün başladığı an öğrenilemez. `queryActivityStarting` 7 güne kadar geçmiş verir, birkaç dakika gecikebilir.
  developer.apple.com/documentation/coremotion/cmmotionactivitymanager
- **Bildirim tetikleri** yalnız süre, takvim ve konum; harekete bağlı tetik yok.
  developer.apple.com/documentation/usernotifications/unnotificationtrigger
- **`UNLocationNotificationTrigger`:** bölgeye giriş ya da çıkışta, uygulama çalışmadan bildirim gösterir; "Kullanırken"
  izni yeter; sınırı geçiş algısı gecikmeli olabilir.
  developer.apple.com/documentation/usernotifications/unlocationnotificationtrigger · **cihazda denenmeli**.
- **HealthKit arka plan teslimi:** iOS'ta adım için en sık saatlik.
  developer.apple.com/documentation/healthkit/hkhealthstore/enablebackgrounddelivery(for:frequency:withcompletion:)
- **iPhone'da `HKWorkoutSession`:** başlatıcı iOS 26+; antrenmanı kendiliğinden algılamaz.
  developer.apple.com/documentation/healthkit/hkworkoutsession
- **Önemli konum değişikliği:** ≥ 500 m, en sık 5 dk; kapalı uygulamayı uyandırır; "Her Zaman" ister.
  developer.apple.com/documentation/corelocation/cllocationmanager/startmonitoringsignificantlocationchanges()
- **BGAppRefreshTask:** zaman garantisi yok, en çok 30 sn.
  developer.apple.com/documentation/backgroundtasks/bgtaskrequest/earliestbegindate
- **64 bekleyen bildirim:** eski `UILocalNotification` sayfasında yazılı; yeni belgede bulunamadı (DOĞRULANAMADI).
- **WeatherKit:** dakikalık yağmur "where available"; sonraki saat bildirimleri yalnız AU, IE, JP, UK, US.
  **Türkiye listede yok.** Ayda 500.000 çağrı ücretsiz. developer.apple.com/weatherkit/ · support.apple.com/en-us/105038
- **Yürürken ses:** `playback` ses oturumu ve Audio arka plan kipi; App Review 2.5.4 yalnız amacına uygun kullanım.
  developer.apple.com/app-store/review/guidelines/ · Canlı Etkinlik en çok 8 saat (kilit ekranında 12).

## C. Fiyatlar (2026-10-01)

- Claude Haiku 4.5: giriş 1, çıkış 5 USD / 1M token. platform.claude.com/docs/en/about-claude/pricing
- OpenRouter `/api/v1/models`: `google/gemini-2.5-flash-lite` 0,10 / 0,40; `openai/gpt-5-nano` 0,05 / 0,40;
  `anthropic/claude-haiku-4.5` 1 / 5. `google/gemini-3.1-flash-lite` 0,25 / 1,50 (2026-09-30,
  `bildirim-hava-yuruyus/arastirma/nef-bildirim.md` §4.1).
- ElevenLabs API: Multilingual v2 ve v3 1.000 karakter 0,08 USD; Flash/Turbo 0,04. elevenlabs.io/pricing/api

## D. PubMed (bu oturumda açılanlar)

- Schepps MA ve ark. 2018, Sci Rep 8:6602. PMID 29700376, doi:10.1038/s41598-018-25145-w. 16.741 yaşlı kadın,
  ivmeölçer; 14 saatten uzun gün ışığında 10 saatten kısaya göre %5,5 daha çok adım (sıcaklık ve yağış düzeltilmiş).
  Gözlemsel.
- Vongsachang H ve ark. 2021, Sensors 21(10):3415. PMID 34068938, doi:10.3390/s21103415. 240 glokomlu yaşlı; sıcaklık,
  yağış ve mevsim günlük adımla anlamlı ilişkili bulunmadı.
- Knapová L ve ark. 2026, Appl Psychol Health Well Being 18(4):e70186. PMID 42415238, doi:10.1111/aphw.70186. 693
  yetişkin, 14 gün; havadaki PM10 kişinin ortalamasından yüksek olduğu günlerde adım daha az (1 SS ≈ 361 adım).
  Sıcaklık, güneş ve yağış düzeltilmiş. Bankaya aday değil (hava kirliliği verisi alınmıyor); bilgi için.
- Daha önceki oturumlarda doğrulananlar: `BILDIRIM_PLANI.md` kaynakçası (Klasnja 2019, Bell 2023, NeCamp 2020,
  Atluri 2026, Golbus 2026, Silva 2018 …) ve `bildirim-hava-yuruyus/arastirma/pubmed-bilim-satirlari.md`.
