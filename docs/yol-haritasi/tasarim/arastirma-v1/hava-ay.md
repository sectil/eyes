# Konum, hava durumu, yağmur, ay ve bildirim — araştırma ve tasarım (v1, 2026-09-29)

Kapsam: sahibinin 29 Eylül isteğindeki "hava durumu, yağmur, konum, ay durumu, PubMed makaleleri, yağmur bildirimi"
parçası (`docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md:58-61`). Bu belge plan ve tasarımdır; depoda hiçbir dosya
değiştirilmedi. Kod iddiaları yalnız bu oturumda okunan dosya:satır ile, bilimsel iddialar PubMed kaydıyla (PMID + DOI),
Apple iddiaları Apple'ın resmî sayfalarıyla verilir. Doğrulanamayan her şey **VARSAYIM** diye işaretlidir.
Sağlık iddiası yoktur: hava ve ay kartı bilgi verir; kimseye "iyi gelir", "uykunu bozar" demez.

---

## 0. On iki satırda karar

1. **Hava kaynağı: Apple WeatherKit, Swift çerçevesiyle** (yerel eklenti). REST değil: REST her istekte ES256 imzalı
   geliştirici belirteci ister, yani anahtar sunucuda durmalı; Apple'ın kendi REST belgesi de yerel iOS uygulamaları için
   Swift çerçevesini önerir. Aylık 500.000 çağrı üyeliğe dahil.
2. **Open-Meteo yedek olarak bile ilk sürümde yok**: abonelikli uygulama "ticari kullanım" sayılır (ayda 49 $'dan başlar),
   ikinci bir yurt dışı alıcı ve ikinci bir atıf demektir. **MGM**'nin belgelenmiş, herkese açık bir geliştirici API'si
   bulunamadı; ürünleri MEVBİS üzerinden satılıyor. Resmî olmayan kazıma servisleri kullanılmaz.
3. **Nef hava verisi üretmez.** Sayılar WeatherKit'ten gelir; kart ve bildirim cümleleri telefondaki sabit şablonlardan
   çıkar. Nef (dil modeli) ilk sürümde hava hakkında hiçbir şey almaz ve söylemez.
4. **Konum: yalnız "Uygulamayı Kullanırken", varsayılan yaklaşık konum** (`NSLocationDefaultAccuracyReduced = true`).
   Capacitor Geolocation eklentisi kullanılmaz; aynı Swift eklentisi CoreLocation'ı doğrudan çağırır.
5. Hava sağlayıcısına giden koordinat **2 ondalığa yuvarlanır** (≈1,1 km). Konum kaydı telefonda da yalnız yuvarlanmış
   hâliyle tutulur; sunucumuza ve Nef'e hiç gitmez.
6. İzin yoksa ya da reddedilirse kişi **şehir seçer**; Profil'de şehir zaten yazılıysa o önerilir (`identity.js:24`).
7. **Ay evresi ağsız, telefonda hesaplanır** (Meeus, *Astronomical Algorithms* bölüm 48–49). Bu oturumda USNO'nun 2026
   evre tablosuyla sınandı: 50 evrede en büyük sapma 1,9 dk; Türkiye saatine göre hiçbir tarih kaymadı.
8. **Ay kartında bilim, dürüst hâliyle**: "Ayın uykuya etkisi tartışmalı; bazı çalışmalar dolunaya yakın gecelerde
   uykunun biraz kısaldığını buldu, daha büyük çalışmalar bulamadı." Tavsiye yok.
9. **Yağmur bildirimi** ayrı bir tercihtir, varsayılan kapalıdır, günde en çok 1 tanedir. Uygulama açıkken en son
   tahmine göre kurulur (arka planda yenilemeye güvenilmez); metin tahminin ne zaman alındığını dürüstçe söyler.
10. Yağmur bildiriminin kimliği **7700–7701** olur: 7600–7607 alarmın yedek bildirimlerine ayrılmış
    (`alarmNative.js:3,9-10`); görevdeki ilk fikir çakışırdı.
11. Ekran: Ana sayfa başlığındaki tarih satırına tek bir hava parçası ("18° · öğleden sonra yağmur"); ayrıntı
    "Günün nasıl geçiyor" ekranındaki **Gökyüzü kartında** (hava, yağmur saatleri, ay).
12. İş büyüklüğü: orta (≈ 6–8 iş günü + cihaz denemesi). iOS 16 altı cihazda hava gizlenir, ay kartı çalışır.

---

## 1. Bugünkü durum (kod, 2026-09-29'da okundu)

| Konu | Durum | Dayanak |
|---|---|---|
| Konum | **Yok.** `navigator.geolocation`, CoreLocation, `@capacitor/geolocation` kullanılmıyor | `app/src` altında arama boş; `app/package.json:15-31` bağımlılıklarda eklenti yok |
| Konum izni metni | **Yok.** `NSLocationWhenInUseUsageDescription` anahtarı yok | `app/ios/App/App/Info.plist` (kamera `:15`, Sağlık `:9,13`, mikrofon, konuşma var; konum yok) |
| Hava durumu | **Yok.** WeatherKit yetkisi yok; hiçbir hava çağrısı yok | `App.entitlements` yalnız Apple ile giriş, HealthKit, `time-sensitive` (`:13,15`) |
| Ay | **Gerçek evre yok.** "Ay" yalnız süs: yol üzerindeki dinlenme durağı simgesi, gece sahnesinde geri sayım halkası | `components/TodayPath.jsx:34,170`, `DayDial.jsx:58`, `NightScene.jsx:22` |
| Şehir | Var: Profil'de serbest metin + 81 il önerisi; koordinat yok | `lib/cities.js:3-13`, `components/CityField.jsx:12`, `lib/identity.js:24` |
| Şehir rızası | Profil eşitleme rızasında "şehrin" yazıyor (sunucuya yalnız bu rızayla) | `lib/consent.js:32,37` |
| Gizlilik sayfası | "Kamera görüntüsü, ses kaydı **ve konum sunucuya hiç gitmez**" | `site/gizlilik.html:76` (aynısı `site/pages/gizlilik.html:49`) |
| Nef'e gitmeyenler | "Konum, şehir" asla gitmez | `docs/yol-haritasi/tasarim/YOL.nef.md:399` |
| Nef'in sayı kuralı | "yeni sayı, yüzde veya tarih UYDURMA" | `lib/coachCore.js:66-69`; şema dışı alan düşer (`coachCore.js:9,57`) |
| Bildirim planı | 7 günlük yerel plan; metin ve saat kurulduğu anda sabitlenir; uygulama kapalıyken kod çalışmaz | `lib/notifyPlan.js:1-3,17` |
| Bildirim penceresi | Hatırlatmalar 09:00–21:00; iki hatırlatma arası en az 60 dk | `lib/reminders.js:15-18,85` |
| Bildirim kimlikleri | 7301/7302 mola ve deneme; 7400–7499 hatırlatma; 7500–7509 çalışma oturumu; **7600–7607 alarm yedeği** | `restNotify.js:10,112`, `notifyPlan.js:18-19`, `notifyApply.js:13-20`, `alarmNative.js:3,9-10` |
| Arka plan | Yalnız `audio` arka plan kipi; `fetch` yok, BGTaskScheduler yok | `Info.plist:56-58`; Swift dosyalarında `BGTask` araması boş |
| Arka planda bildirim silme | Var, ama yalnız HealthKit arka plan teslimiyle (yürüyüş koruması) | `HealthPlugin.swift:315-320` |
| "Günün nasıl geçti?" | Ana sayfada akşam kartı: "Ekran, uyku ve gece telefonu. Her ekranda tek soru." 19:00'dan sonra | `screens/Home.jsx:334-344`, `lib/profileQuestions.js:74-80,170,193` |
| Ana sayfa başlığı | Tarih satırı (eyebrow) + selam | `screens/Home.jsx:205-210`, `lib/greeting.js:2-9` |
| Alarm kartları | Akşam kartı 19:00'dan sonra, "Uyanınca" kartı çaldıktan sonra 4 saat | `lib/alarm.js:9,28,271,309` |
| iOS alt sınırı | iOS 15.0 | `ios/App/App.xcodeproj/project.pbxproj:301`, `CapApp-SPM/Package.swift` `platforms: [.iOS(.v15)]` |
| Yerel eklenti kaydı | Uygulama içi eklentiler elle kaydediliyor | `ios/App/App/MainViewController.swift:25-30` |

Sonuç: görevdeki "bugün kodda konum/hava yok" tespiti doğru. Ek bulgu: görevde önerilebilecek 76xx aralığı alarmın
yedek bildirimleriyle çakışır; yağmur için 77xx kullanılmalı.

---

## 2. Sahibin isteği (özet, kelimesi kelimesine parçalar)

> "hava durumu alınmalı, bugün yağmurlu mu bilgilendirilmeli, konum tespit edilmeli, en iyi en doğru kaynaktan veri
> almalı, belki JEV AI bunu yapabilir... ayın durumunu göster, bununla ilgili makaleler varsa göster (PubMed)... günün
> nasıl geçiyor ekranında ay durumu, hava durumu, yağmur durumu gözükecek; yağmur varsa 'bugün yağmur bekleniyor'
> bildirimi gönderilebilir... biz üst akıl olmalıyız" (`SAHIP_ISTEKLERI.md:58-61`)

Buradan çıkan gereksinimler: (G1) konumdan otomatik hava; (G2) en güvenilir kaynak; (G3) yağmur bilgisi ve bildirimi;
(G4) ay evresi; (G5) ay ile ilgili makaleler; (G6) hepsi "Günün nasıl geçiyor" ekranında; (G7) Nef'in rolü.

---

## 3. Hava kaynağı: WeatherKit, Open-Meteo, MGM

### 3.1 Doğrulanan bilgiler

**Apple WeatherKit** ([developer.apple.com/weatherkit/get-started](https://developer.apple.com/weatherkit/get-started/))
- "WeatherKit provides up to 500,000 API calls a month per Apple Developer Program membership." Ücretli basamaklar:
  1 M çağrı 49,99 $, 2 M 99,99 $, 5 M 249,99 $ (aylık). Kullanılmayan çağrı devretmez.
- Swift çerçevesi iOS 16 ve sonrası ister ("WeatherKit requires iOS 16…"). Uygulamanın alt sınırı iOS 15 (§1).
- Yetki: `com.apple.developer.weatherkit`; "enable the WeatherKit capability in Xcode"
  ([belge](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.weatherkit)).
- REST: her istekte ES256 imzalı JWT (Team ID, Service ID, anahtar kimliği) gerekir
  ([belge](https://developer.apple.com/documentation/weatherkitrestapi/request-authentication-for-weatherkit-rest-api)).
  Apple'ın REST sayfası: "For native iOS, macOS, tvOS, and watchOS apps, use WeatherKit"
  ([belge](https://developer.apple.com/documentation/weatherkitrestapi)).
- **Atıf zorunlu:** Apple verisi gösteren her ekran "Apple Weather" markasını ve veri kaynakları sayfasının yasal
  bağlantısını açıkça göstermeli. Uyarı gösterilirse her uyarıda Apple'ın ayrıntı bağlantısı ve uyarıyı yayımlayan kurumun
  tam adı bulunmalı, uyarı metni değiştirilmemeli (get-started sayfası). Swift'te `WeatherService.shared.attribution`
  şunları verir: `combinedMarkLightURL`, `combinedMarkDarkURL`, `squareMarkURL`, `legalPageURL`, `legalAttributionText`
  ("…is a legal requirement of using WeatherKit")
  ([WeatherAttribution](https://developer.apple.com/documentation/weatherkit/weatherattribution)). Eski yasal bağlantı
  `weatherkit.apple.com/legal-attribution.html` bu oturumda 308 ile
  [developer.apple.com/weatherkit/data-source-attribution](https://developer.apple.com/weatherkit/data-source-attribution/)
  sayfasına yönlendi.
- **Veri kümeleri:** 10 günlük saatlik tahmin (sıcaklık, yağış, rüzgâr, UV…); "Minute-by-minute precipitation for the next
  hour and severe weather alerts are available for select regions." `WeatherAvailability`: dakikalık tahmin ve uyarılar
  bazı bölgelerde yok; güncel hava gibi diğer kümelerin her yerde olması beklenir
  ([belge](https://developer.apple.com/documentation/weatherkit/weatheravailability)).
- Saatlik ve günlük **yağış olasılığı** 0–1 arası (`HourWeather.precipitationChance`, `DayWeather.precipitationChance`);
  saatlik yağış miktarı `HourWeather.precipitationAmount` (iOS 16). Günlük **ay olayları** da var: `DayWeather.moon`
  (`MoonEvents`: evre, ay doğuşu/batışı; iOS 16).
- **Türkiye:** Apple Destek sayfasına göre "Next-hour precipitation forecasts and precipitation notifications are available
  for Australia, Ireland, Japan, the United Kingdom, and the United States" — **Türkiye'de dakikalık yağış yok.** Şiddetli
  hava bilgisi "…and most countries and regions in Europe" için var; Türkiye adıyla anılmıyor. Hava kalitesi listesinde
  Türkiye yok. "Unless otherwise specified, the 10-day forecast data is provided by Apple Weather."
  ([support.apple.com/105038](https://support.apple.com/en-us/105038)). Veri kaynakları sayfasında Türkiye'ye özgü
  sağlayıcı yok; genel model kaynakları arasında Met Office/ECMWF, DWD, Météo-France, NOAA var.
- **Gizlilik (Apple'ın cümlesi):** "Location information is used only to provide weather forecasts, is not associated with
  any personally identifiable information, and is never tracked between requests."
  ([developer.apple.com/weatherkit](https://developer.apple.com/weatherkit/))

**Open-Meteo** ([terms](https://open-meteo.com/en/terms), [pricing](https://open-meteo.com/en/pricing),
[docs](https://open-meteo.com/en/docs))
- Anahtarsız ücretsiz API yalnız ticari olmayan kullanım için; "Operating websites or apps that have subscriptions or
  display advertisements" **ticari** sayılır. Nefona abonelikli → ücretli plan gerekir: Standard 49 $/ay (1 M çağrı).
- Veri lisansı CC BY 4.0 (atıf gerekir).
- Sunucu günlükleri koordinat içerebilir ve 90 gün sonra silinir (terms).
- Yağış olasılığı "ensemble weather models with 0.25° (~27 km) resolution" üzerinden; 15 dakikalık veri "Only available in
  Central Europe and North America". Varsayılan "Best Match" modelinin bileşimi sayfada açıkça yazmıyor.
- "…uninterrupted provision are not guaranteed" (ücretsiz katman; Professional planda %99,9 SLA).

**MGM (Meteoroloji Genel Müdürlüğü)**
- Resmî ve belgelenmiş, herkese açık bir geliştirici API'si **bulunamadı** (arama: mgm.gov.tr, turkiye.gov.tr).
  Meteorolojik veriler MEVBİS ("Meteorolojik Veri Bilgi Satış ve Sunum Sistemi") üzerinden, e-Devlet kimliğiyle ve
  ücretli ürün olarak sunuluyor ([turkiye.gov.tr/mevbis](https://www.turkiye.gov.tr/mevbis-meteorolojik-veri-bilgi-satis-sunum-sistemi),
  [mgm.gov.tr ürünler](https://www.mgm.gov.tr/site/urunler.aspx)). GitHub'da MGM sitesini kazıyan resmî olmayan
  "API"ler var; kullanım koşulu belirsiz ve her an bozulabilir → **kullanılmaz**.

### 3.2 "En doğru ve en güvenilir" hangisi?

Dürüst cevap: Türkiye için WeatherKit ile Open-Meteo'yu karşılaştıran bağımsız bir doğrulama çalışması bu oturumda
**bulunamadı**. İkisi de küresel sayısal hava modellerine (ECMWF vb.) dayanır; resmî ulusal kaynak MGM'dir ama uygulamaya
bağlanabilecek bir API'si yok. Bu yüzden "en doğru" iddiası yazılmaz; seçim güvenilirlik, gizlilik ve bakım üzerinden
yapılır:

| Ölçüt | WeatherKit (Swift) | Open-Meteo | MGM |
|---|---|---|---|
| Ticari kullanım | Üyeliğe dahil, 500 k/ay | 49 $/aydan başlar | Resmî API yok |
| Anahtar / sunucu | Gerekmez (yetki uygulamada) | Ücretli planda API anahtarı → sunucu ya da uygulama içi anahtar | — |
| Türkiye'de saatlik yağış olasılığı | Var (her yerde beklenen küme) | Var (27 km topluluk modeli) | — |
| Türkiye'de dakikalık yağış | **Yok** (Apple Destek) | 15 dk veri Türkiye'de enterpolasyon | — |
| Konum gizliliği | Apple: kimlikle ilişkilendirilmez, istekler arasında izlenmez | Koordinat 90 gün günlükte | — |
| Atıf | Apple Weather markası + yasal bağlantı | CC BY 4.0 | — |
| iOS 15 | Çalışmaz | Çalışır (JS'ten) | — |
| Ek bağımlılık | Swift eklentisi (zaten 9 yerel eklenti var) | Yok (fetch) | — |

**Karar: WeatherKit, Swift çerçevesi.** Gerekçe: ek ücret yok; anahtar saklama sorunu yok; konumun kimliksiz işlendiği
Apple tarafından yazılı; uygulama zaten Sağlık, alarm ve kamera için Swift eklentileri taşıyor (`MainViewController.swift:25-30`).
iOS 15'teki az sayıdaki cihazda hava kartı gizlenir, ay kartı çalışır (Open-Meteo'yu yalnız bunlar için eklemek, ikinci
yurt dışı alıcı, ikinci atıf ve ücret demek — değmez).

**Seçenek (açık karar A1):** ileride iOS 15 kullanıcıları ya da web sürümü için Open-Meteo ücretli planı eklenebilir;
eklenirse gizlilik sayfasına ikinci alıcı yazılır.

### 3.3 Nef ve hava verisi

Sahibi "belki JEV AI bunu yapabilir" dedi. Yapmamalı, çünkü:
- Nef bir dil modelidir; canlı ölçüme ya da hava modeline erişimi yoktur. Ona "bugün yağmur yağacak mı?" diye sorulursa
  cevap bir tahmin değil, olası görünen bir metin olur; yanlış olma olasılığı yüksektir ve yanlış olduğu anlaşılmaz.
- Nef'in kendi kuralı zaten bunu yasaklar: "yeni sayı, yüzde veya tarih UYDURMA" (`coachCore.js:66-69`); şemada
  olmayan alan modele hiç gitmez (`coachCore.js:9,57`).
- YOL.nef.md ilkesi "merkez hesaplar, Nef söyler" (`YOL.nef.md:66`): hava da böyle olur. **Veri WeatherKit'ten, hesap
  telefonda, cümle sabit şablondan.** Nef'in sesine uyan kısa cümleler şablonda yazılır (örnekler §8).
- İlk sürümde Nef'in sinyal paketine hava alanı **eklenmez**; `YOL.nef.md:399` "Konum, şehir" satırı olduğu gibi kalır.
- İkinci sürüm seçeneği (açık karar A2): Nef'in haftalık değerlendirmesine yalnız "bu hafta yağışlı gün sayısı" gibi tek
  bir sayı. Bu, rıza metninin "Ne" satırını değiştirir → `coach` rızası sürüm artışı (`consent.js:13,56` kuralı).

---

## 4. Konum

### 4.1 Bugünkü durum
Konum hiç kullanılmıyor; Info.plist'te konum izni metni yok (§1). Gizlilik sayfası konumun sunucuya gitmediğini söylüyor
(`site/gizlilik.html:76`).

### 4.2 Doğrulanan iOS bilgileri
- İzin türleri: "Allow While Using App", "Allow Once" (uygulama kullanılmadığında sona erer), "Don't Allow". İzin istemi
  için `NSLocationWhenInUseUsageDescription` zorunlu
  ([requestWhenInUseAuthorization](https://developer.apple.com/documentation/corelocation/cllocationmanager/requestwheninuseauthorization()),
  [anahtar](https://developer.apple.com/documentation/bundleresources/information-property-list/nslocationwheninuseusagedescription)).
- "When in Use authorization … is the preferred choice, because it has better privacy and battery life implications."
  İzin, kişi konumu gerektiren bölüme dokunduğu anda istenmeli; açılışta istenirse reddedilme olasılığı artar
  ([Requesting authorization](https://developer.apple.com/documentation/corelocation/requesting-authorization-to-use-location-services)).
- `NSLocationDefaultAccuracyReduced = true`: izin penceresi yaklaşık konumu harita üzerinde gösterir, "Precise Location"
  kapalı gelir; kişi Ayarlar'dan değiştirebilir
  ([belge](https://developer.apple.com/documentation/bundleresources/information-property-list/nslocationdefaultaccuracyreduced)).
- Yaklaşık konum: "preserves the user's country or region, typically preserves the city, and is usually within 1–20
  kilometers of the actual location"; saatte en çok birkaç kez güncellenir
  ([kCLLocationAccuracyReduced](https://developer.apple.com/documentation/corelocation/kcllocationaccuracyreduced)).
- `requestLocation()`: tek seferlik konum; sonuçtan sonra konum servisi kapanır
  ([belge](https://developer.apple.com/documentation/corelocation/cllocationmanager/requestlocation())).
- **Capacitor Geolocation 8.2.2** (npm, bu oturumda indirildi): README iOS için hem `NSLocationWhenInUseUsageDescription`
  hem `NSLocationAlwaysAndWhenInUseUsageDescription` ister (arka plan kitaplığı nedeniyle); `coarseLocation` iOS'ta
  `location` ile aynı değeri döndürür; yaklaşık konum seçeneği yalnız Android için anlatılıyor.

### 4.3 Önerilen tasarım
- **Eklenti kararı:** Capacitor Geolocation **kullanılmaz**. WeatherKit için zaten yazılacak `SkyPlugin.swift` (ad
  önerisi) CoreLocation'ı doğrudan çağırır: `requestWhenInUseAuthorization`, `desiredAccuracy = kCLLocationAccuracyReduced`,
  `requestLocation()`. Böylece "Always" metni Info.plist'e girmez (App Review'da gereksiz soru), bağımlılık artmaz.
- Info.plist'e iki anahtar: `NSLocationWhenInUseUsageDescription` ve `NSLocationDefaultAccuracyReduced = true`.
  İzin metni önerisi (ekranda yazan = söylenen): "Nefona, bulunduğun yerin hava durumunu ve yağmur olasılığını göstermek
  için yaklaşık konumunu kullanır. Konumun kaydedilmez; hava bilgisi için yalnız yuvarlanmış koordinat Apple'a gider."
- **Ne zaman istenir:** yalnız kişi Gökyüzü kartındaki "Havayı göster" düğmesine dokunduğunda; önce kendi tek cümlelik
  sayfamız (neden + ne gider), sonra sistem penceresi. Açılışta, kurulumda ya da İlk Bakış'ta asla (5 sn kuralı ve Apple
  önerisi).
- **Yuvarlama:** koordinat Swift tarafında WeatherKit'e verilmeden önce 2 ondalığa yuvarlanır (enlemde ≈1,1 km; 40° enlemde
  boylamda ≈0,85 km). Yaklaşık konum zaten 1–20 km saptığı için doğruluk kaybı pratikte yok. Apple'ın gizlilik etiketi
  tanımına göre 3'ten az ondalık "Coarse Location" sayılır (§4.5).
- **Saklama:** telefonda yalnız yuvarlanmış koordinat ve etiket (şehir adı) tutulur; ham konum hiçbir yerde yazılmaz.
  Şehir adı için ters coğrafi kodlama (CLGeocoder) **kullanılmaz** (koordinatı ayrıca Apple'a gönderir); onun yerine
  81 il merkezinin koordinat tablosundan en yakın il bulunur (telefonda, ağsız). Tablo yeni bir veri dosyasıdır
  (`lib/cities.js` yanına); kaynağı ve lisansı eklenirken yazılır (VARSAYIM: GeoNames, CC BY 4.0).
- **Yenileme:** konum, ön planda en çok saatte bir istenir; hava önbelleği 60 dk (VARSAYIM). Arka planda konum yok.
- **İzin yoksa / reddedildiyse:** kart "Şehir seç" der; Profil'deki şehir (`identity.js:24`) 81 ilden biriyse düğmede
  önerilir ("İstanbul için göster"). Seçilen ilin merkez koordinatı kullanılır. Yurt dışı serbest metin şehirler için ilk
  sürümde hava gösterilmez (açık karar A3: küçük bir dünya şehirleri listesi).
- "Allow Once" seçilirse o oturumda çalışır; sonraki açılışta izin yeniden "belirsiz" olur → kart yine tek dokunuşla sorar,
  ısrar etmez (en çok 3 kez; sonra yalnız şehir seçimi).

### 4.4 KVKK
- Konum, kişiyle ilişkilendirilebildiğinde kişisel veridir (özel nitelikli değil). Yuvarlanmış koordinat, kimlik ve
  hesap bilgisi olmadan gider; ama IP adresiyle birlikte gittiği için "kimliksiz" demek hukuken tartışmalıdır.
- **Yurt dışı aktarım:** 7499 sayılı Kanunla değişen KVKK m. 9, 1 Haziran 2024'te yürürlüğe girdi; aktarım artık
  yeterlilik kararı ya da uygun güvenceye (standart sözleşme vb.) dayanıyor, açık rıza yalnız arızi aktarımlarda istisna
  ([KVKK Yurt Dışına Aktarım](https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim)). Her gün tekrarlanan hava
  isteği "arızi" sayılmayabilir. **Bu konu hukukçuya gider** (aynı soru Nef için zaten açık, `consent.js:57-59`).
- Tasarım yine de açık onay ister: izin sayfası ayrı ve işaretsizdir, "Şimdi değil" hiçbir şeyi kapatmaz (mevcut rıza
  ilkesi, `consent.js:1-5`). Önerilen rıza anahtarı `weather` (sürüm 1); metin:
  - **Ne:** yaklaşık konumun, 2 ondalığa yuvarlanmış koordinat olarak (ya da seçtiğin şehrin merkezi).
  - **Neden:** hava durumunu, yağmur olasılığını ve istersen yağmur bildirimini göstermek.
  - **Nerede:** Apple'ın hava servisi (WeatherKit), yurt dışı; sunucumuza ve Nef'e gitmez.
  - **Ne kadar:** Koordinat telefonda yalnız son konum olarak kalır; izni kapattığın an silinir.

### 4.5 Gizlilik sayfası ve App Store gizlilik etiketi
- `site/gizlilik.html:76` cümlesi yanlış hâle gelir. Önerilen yeni cümle: "Kamera görüntüsü ve ses kaydı telefondan hiç
  çıkmaz. Hava durumunu açarsan yaklaşık konumun, yuvarlanmış koordinat olarak yalnız Apple'ın hava servisine gider;
  sunucumuza ve Nef'e gitmez." Ayrıca Apple Weather atfı ve veri kaynakları bağlantısı bu sayfaya da eklenir.
- App Store "App Privacy": Apple'a göre "collect" = veriyi cihazdan, isteği gerçek zamanlı karşılamak için gerekenden uzun
  erişilebilecek biçimde göndermek; "Coarse Location" = 3'ten az ondalık çözünürlük
  ([app-privacy-details](https://developer.apple.com/app-store/app-privacy-details/)). WeatherKit'in veriyi saklamadığı
  Apple'ın cümlesinden çıkarılabilir, ama Apple'ın kendisinin "üçüncü taraf ortak" sayılıp sayılmadığı belgede açık
  değil (VARSAYIM). **Karar: temkinli beyan** — "Coarse Location · App Functionality · Not Linked to You · Not used for
  Tracking". Open-Meteo eklenirse beyan zorunlu olur (koordinat 90 gün günlükte).

---

## 5. Ay evresi: ağsız hesap

### 5.1 Yöntem ve bu oturumdaki sınama
- Evre anları (yeniay, ilk dördün, dolunay, son dördün): Meeus, *Astronomical Algorithms*, bölüm 49 (düzeltme terimleriyle;
  gezegen kaynaklı 14 küçük terim çıkarıldı). TT→UT için ΔT ≈ 69 sn (VARSAYIM, 2026 için yeterli).
- Aydınlanma yüzdesi: Meeus bölüm 48 düşük hassasiyetli formül, `(1 + cos i) / 2`.
- Sınama (`scratchpad/yol-v1/moontest.mjs`): ABD Deniz Rasathanesi'nin (USNO) 2026 evre tablosu
  (`aa.usno.navy.mil/api/moon/phases/year?year=2026`, 50 evre, dakika hassasiyetli) ile karşılaştırıldı:

| Yöntem | En büyük sapma | Türkiye saatine göre tarihi kayan evre |
|---|---|---|
| Meeus bölüm 49 (bizim yazacağımız, ≈60 satır) | **1,9 dk** | **0 / 50** |
| astronomy-engine kitaplığı (MIT, karşılaştırma için) | 1,3 dk | — |
| "Ortalama ay çevrimi" (29,53 gün ile bölme) | **19,4 saat** | **18 / 50** |
| Aydınlanma: Meeus 48 ile astronomy-engine farkı (2026, 7 saatte bir) | 0,32 yüzde puan | — |

Sonuç: basit "29,53 güne böl" yöntemi dolunay tarihini her üç evreden birinde yanlış güne atar; kullanılmaz. Meeus'un
formülü kitaplık eklemeden yeterli. Kontrol değeri: 29.09.2026 12:00 (TR) aydınlanma %91,1 (küçülen ay); USNO'ya göre
dolunay 26 Eylül 16:49 UT; sonraki yeniay 10 Ekim 15:50 UT, dolunay 26 Ekim 04:12 UT.

### 5.2 Önerilen tasarım
- Yeni saf modül `lib/moon.js`: `moonPhase(date)` → `{ illum, waxing, phaseName, nextNew, nextFull }`; testleri USNO 2026
  tablosunun bir kısmıyla (≤ 2 dk tolerans, TR günü birebir).
- Evre adları (Türkçe): yeniay, büyüyen hilal, ilk dördün, büyüyen şişkin ay, dolunay, küçülen şişkin ay, son dördün,
  küçülen hilal. Sınırlar evre açısına göre sekiz eşit dilim (VARSAYIM); "dolunay/yeniay" etiketi yalnız o takvim günü.
- Ay doğuş/batış saati ilk sürümde yok (konuma bağlı, hesap daha uzun). İsteğe bağlı: konum izni varsa WeatherKit
  `DayWeather.moon` saatleri gösterilebilir (açık karar A4).
- Mevcut süs ay simgeleri (`TodayPath.jsx:34`, `DayDial.jsx:58`) değişmez; istenirse ileride gerçek evreyi çizebilir.
- Gizlilik: ay hesabı konum istemez, ağa çıkmaz; herkes için aynıdır.

---

## 6. Kanıt (PubMed, bu oturumda doğrulandı) ve kartta ne yazılır

### 6.1 Ay ve uyku — tartışmalı, küçük, tekrarlanamayan
| Çalışma | Tür, büyüklük (özette yazdığı kadarıyla) | Bulgu |
|---|---|---|
| Cajochen 2013, Curr Biol. PMID 23891110 · [doi:10.1016/j.cub.2013.06.029](https://doi.org/10.1016/j.cub.2013.06.029) | Laboratuvar verisinin geriye dönük analizi; sayı özette yok | Dolunay civarında derin uyku EEG delta etkinliği %30 düşük, uykuya dalma 5 dk uzun, toplam uyku 20 dk kısa; öznel uyku kalitesi ve melatonin düşük |
| Cordi 2014, Curr Biol (mektup). PMID 24937275 · [doi:10.1016/j.cub.2014.05.017](https://doi.org/10.1016/j.cub.2014.05.017) | Özet PubMed'de yok | Başlık: "Lunar cycle effects on sleep and the file drawer problem". İçerik sayıları doğrulanamadı; ikincil kaynağa göre (doğrulanmadı) birden çok veri setinde etki bulunmadı ve yayımlanmayan boş sonuçlara dikkat çekildi |
| Haba-Rubio 2015, Sleep Med. PMID 26498230 · [doi:10.1016/j.sleep.2015.08.002](https://doi.org/10.1016/j.sleep.2015.08.002) | Nüfus tabanlı kohort, evde polisomnografi, 2.125 kişi | Öznel ve nesnel uykuda evreler arası anlamlı fark yok (süre 398/402/403 dk, p=0,31) |
| Della Monica 2015, J Sleep Res. PMID 26096730 · [doi:10.1111/jsr.12312](https://doi.org/10.1111/jsr.12312) | Geriye dönük, 205 sağlıklı gönüllü, penceresiz laboratuvar | Ana etki yok; cinsiyet etkileşimleri var; "limited evidence" |
| Smith MP 2017, J Sleep Res. PMID 27928860 · [doi:10.1111/jsr.12472](https://doi.org/10.1111/jsr.12472) | 1.411 ergen, 8.832 gün | Yatakta geçen süre ve öznel uyku kalitesi ay evresiyle ilişkisiz |
| Chaput 2016, Front Pediatr. PMID 27047907 · [doi:10.3389/fped.2016.00024](https://doi.org/10.3389/fped.2016.00024) | 12 ülke, 5.812 çocuk, 33.710 kayıt | Dolunayda uyku ≈5 dk (%1) kısa; "klinik anlamı şüpheli" |
| Casiraghi 2021, Sci Adv. PMID 33571126 · [doi:10.1126/sciadv.abe0465](https://doi.org/10.1126/sciadv.abe0465) | Bilek aktimetrisi; Toba/Qom toplulukları ve Seattle | Dolunaydan önceki gecelerde uyku daha geç başlıyor ve daha kısa |
| Benedict 2021, Sci Total Environ. PMID 34520928 · [doi:10.1016/j.scitotenv.2021.150222](https://doi.org/10.1016/j.scitotenv.2021.150222) | Kesitsel, 852 kişi, tek gece polisomnografi | Büyüyen ayda uyku daha kısa; etki erkeklerde belirgin; nedensellik çıkarılamaz |
| Foster & Roenneberg 2008, Curr Biol (derleme). PMID 18786384 · [doi:10.1016/j.cub.2008.07.003](https://doi.org/10.1016/j.cub.2008.07.003) | Anlatı derlemesi | "no solid evidence that human biology is in any way regulated by the lunar cycle" |

Not: 2026 tarihli "Lunar gravity predicts sleep timing" (PMID 41659491) hakemsiz ön baskı (bioRxiv); kartta kullanılmaz.

Dürüst özet: Laboratuvar ve saha çalışmalarının bir kısmı dolunaya yakın gecelerde uykunun birkaç dakika ile 20 dakika
arası kısaldığını bildirdi; büyük nüfus çalışmalarında (2.125 yetişkin, 1.411 ergen) etki bulunmadı; bulunan etkiler
yöne ve cinsiyete göre tutarsız. Kişiye öneri çıkarılacak düzeyde kanıt yok.

**Ay kartındaki "Bilim ne diyor?" metni (önerilen):**
> Ayın uykuya etkisi tartışmalı. Bazı çalışmalar dolunaya yakın gecelerde uykunun biraz kısaldığını buldu; binlerce
> kişiyle yapılan daha büyük çalışmalar fark bulamadı. Kendi uykunu merak ediyorsan alarm sabahlarındaki cevaplarına
> bakabilirsin.

Altında kaynak satırı (sources.js biçiminde): Cajochen 2013 (geriye dönük laboratuvar), Haba-Rubio 2015 (nüfus kohortu,
2.125), Casiraghi 2021 (saha, aktimetri), Smith 2017 (1.411 ergen). Tavsiye yok, "dolunayda erken yat" yok.

### 6.2 Hava ve ruh hali — ortalamada küçük, kişiden kişiye değişken
| Çalışma | Tür, büyüklük | Bulgu |
|---|---|---|
| Denissen 2008, Emotion. PMID 18837616 · [doi:10.1037/a0013497](https://doi.org/10.1037/a0013497) | Çevrim içi günlük, 1.233 kişi, çok düzeyli | Sıcaklık, rüzgâr ve güneşin olumsuz duygu üzerinde etkisi var; "the average effect of weather on mood was only small"; kişiler arası fark anlamlı |
| Klimstra 2011, Emotion. PMID 21842988 · [doi:10.1037/a0024649](https://doi.org/10.1037/a0024649) | 30 gün günlük, 497 ergen + anneleri | Dört tip: yaz sevenler, etkilenmeyenler, yaz sevmeyenler, "yağmur sevmeyenler" |
| Lucas & Lawless 2013, J Pers Soc Psychol. PMID 23607534 · [doi:10.1037/a0032124](https://doi.org/10.1037/a0032124) | Kesitsel, 1 milyonu aşkın kişi | "weather does not reliably affect judgments of life satisfaction" |

Kart bu konuda bir şey iddia etmez. Yalnız "Günün nasıl geçti" puanlaması varsa, ileride kişinin **kendi** verisiyle
betimleyici bir satır gösterilebilir (§9, açık karar A5).

### 6.3 Hava ve hareket — yağmur hareketi azaltıyor
| Çalışma | Tür, büyüklük | Bulgu |
|---|---|---|
| Tucker & Gilliland 2007, Public Health. PMID 17920646 · [doi:10.1016/j.puhe.2007.04.009](https://doi.org/10.1016/j.puhe.2007.04.009) | Sistematik derleme, 37 çalışma, 291.883 kişi | Kötü ya da aşırı hava hareketin önünde engel; "Providing indoor opportunities during the cold and wet months may foster regular physical activity" |
| Klimek 2022, Eur Rev Aging Phys Act. PMID 35151273 · [doi:10.1186/s11556-022-00286-0](https://doi.org/10.1186/s11556-022-00286-0) | Prospektif, 65 yaş üstü, ivmeölçer | Daha fazla yağış, nem ve rüzgâr yürüme süresini ve evden çıkmayı azalttı |

Kullanım: yağmurlu günde yürüyüş hatırlatmasının metni içeride yapılabilecek bir seçeneğe döner (ör. mevcut "Koridorda ya da
dışarıda kısa bir tur atabilirsin.", `notifyPlan.js:59`). Bu bir sağlık iddiası değil, yağmura uygun metin seçimidir.

---

## 7. Yağmur bildirimi

### 7.1 Kısıtlar (doğrulanan)
- Uygulama kapalıyken kod çalışmaz; bildirimin saati ve metni kurulduğu anda sabitlenir (`notifyPlan.js:1-3`).
- `BGAppRefreshTask` için Apple: "the system doesn't guarantee launching the task at the specified date, but only that it
  won't begin sooner" ([earliestBeginDate](https://developer.apple.com/documentation/backgroundtasks/bgtaskrequest/earliestbegindate));
  `fetch` arka plan kipi gerektirir ([BGAppRefreshTask](https://developer.apple.com/documentation/backgroundtasks/bgapprefreshtask)).
  Uygulamada `fetch` kipi yok (`Info.plist:56-58`).
- Türkiye'de dakikalık yağış ve Apple'ın kendi yağış bildirimleri yok (§3.1) → "yağmur başlamak üzere" gibi anlık bildirim
  yapılamaz.
- Sunucudan push (APNs) seçeneği reddedildi: sunucunun konumu ve cihaz belirtecini bilmesini gerektirir; "konum
  sunucumuza gitmez" ilkesini bozar.

### 7.2 Önerilen tasarım
- **Tercih:** "Yağmur haberi" ayrı anahtar, **varsayılan kapalı**. Yalnız hava kartı açılmış (konum ya da şehir var) kişiye,
  ilk yağmurlu günü kartta gördüğünde bir kez sorulur: "Yağmur beklenen sabahlar sana haber vereyim mi?" Mevcut
  hatırlatma rızası (`reminders.optIn === 'yes'`, `notifyPlan.js:126`) ön koşul değildir ama bildirim izni gerekir.
- **Planlama anı:** uygulama her ön plana gelişinde (zaten plan yeniden kuruluyor) hava önbelleği ≥ 60 dk eskiyse
  yenilenir ve bugünün ya da yarının yağmur bildirimi yeniden hesaplanır. Akşam 18:00'den sonraki açılış yarın sabahı
  planlar; sabah bildirimden önce açılırsa taze tahminle yeniden kurulur ya da iptal edilir.
- **Saat:** alarm kuruluysa ve o gün çalacaksa `nextRing` (`alarm.js:94`) + 15 dk (VARSAYIM; alarm ekranıyla üst üste
  gelmesin), değilse 07:30 (VARSAYIM). Sınır: 06:30–09:00; sessiz saatler 22:00–06:30. Bu saat hatırlatma penceresinden
  (09:00–21:00, `reminders.js:16`) önce olduğu için hatırlatmalarla 60 dk kuralı pratikte çakışmaz; yine de aynı
  `timeError` mantığıyla denetlenir.
- **Eşik (VARSAYIM, sahada ayarlanır):** 07:00–22:00 arasında herhangi bir saatte yağış olasılığı ≥ %50 **ve** o saatlerin
  toplam beklenen yağışı ≥ 0,5 mm. Olasılık tek başına kullanılmaz (düşük miktarlı çiseleme için bildirim gürültü olur).
- **Bayatlık:** bildirimin çalacağı anda tahmin 18 saatten eskiyse kurulmaz.
- **Sayı:** günde en çok 1; 7 günlük ufuk yok, en çok 2 kimlik (bugün, yarın): **7700 ve 7701.** `notifyApply.js:15-18`
  `OWN_RANGES`'e `[7700, 7701]` eklenir; 7600–7607 alarm yedeği olduğu için kullanılmaz (`alarmNative.js:3,9-10`).
- **Deney dışı:** yağmur bildirimi sessiz gün zarına (`SILENT_RATE`, `notifyPlan.js:16`) ve bildirim günlüğü deneyine
  girmez; bilgi bildirimidir, davranış hatırlatması değil. Düzey `active` (time-sensitive değil).
- **Metin (tahminin yaşı dürüstçe):**
  - Başlık: "Bugün yağmur bekleniyor"
  - Gövde, akşam kurulmuşsa: "Dün akşamki tahmine göre 14.00–17.00 arası yağmur olasılığı %70. Şemsiyeni unutma."
  - Gövde, sabah kurulmuşsa: "14.00–17.00 arası yağmur olasılığı %70."
  - Atıf: bildirim görseli marka taşıyamaz; gövdenin sonuna "Kaynak: Apple Hava Durumu" eklenmesi önerilir. Apple'ın atıf
    kuralının bildirimlere nasıl uygulandığı belgede açık değil → **açık karar A6** (App Review'a sorulabilir).
- **Bildirimden sonra:** dokununca Gökyüzü kartı açılır (tam atıf orada).
- **Alarm sabahı:** bildirimden bağımsız olarak "Uyanınca" kartı (`alarm.js:309`) bir satır hava gösterir; akşam alarm
  kartı (`alarm.js:271`) "Yarın sabah yağmur bekleniyor" satırını gösterebilir. Böylece bildirim kapalı olan da bilgiyi alır.
- **İleride (açık karar A7):** BGAppRefreshTask ile 05:00 civarı tazeleme denemesi — yalnız "olursa daha taze" kazancı;
  tasarım buna **dayanmaz**. `fetch` kipi, `BGTaskSchedulerPermittedIdentifiers` ve Swift kodu gerekir.
- **Sınır (VARSAYIM):** iOS'un bekleyen yerel bildirim sınırı yaygın olarak 64 bilinir; Apple'ın güncel belgesinde bu
  oturumda bulunamadı. Bugünkü en dolu plan ≈ 35 hatırlatma + 4 oturum + 2 + 8 alarm = 49; yağmur 2 ekler → 51.

---

## 8. "Günün nasıl geçiyor" ekranı: Gökyüzü kartı

"Günün nasıl geçti" soru akışının yeniden tasarımı ayrı bir işte; burada yalnız hava/yağmur/ay parçası tanımlanır.
Mevcut akşam kartı (`Home.jsx:334-344`) ve sorular (`profileQuestions.js:170`) bu belgeyle değişmez.

### 8.1 İlk 5 saniye: Ana sayfa başlığı
Tarih satırının (eyebrow, `Home.jsx:207`) sonuna tek parça eklenir; yeni kart eklenmez (Ana sayfa zaten kalabalık):
- İzin/şehir varsa: "Salı, 29 Eylül · 18° · öğleden sonra yağmur"
- Yağmur yoksa: "Salı, 29 Eylül · 21° · açık"
- Veri yoksa: yalnız tarih + ay: "Salı, 29 Eylül · ay %91". Hava izni hiç sorulmamışsa da ay görünür; izin Ana sayfada
  istenmez.
Dokununca "Günün nasıl geçiyor" ekranındaki Gökyüzü kartına gider. Başlık satırında atıf yok; Apple kuralı "hava verisi
gösteren her yer" diyor → **VARSAYIM riski**; güvenli seçenek: başlıkta sıcaklık yerine yalnız simge ve "yağmur" sözcüğü
(açık karar A6 ile birlikte).

### 8.2 Gökyüzü kartı (390 px, iki tema)
```
┌───────────────────────────────────────────────┐
│ GÖKYÜZÜ · İstanbul (yaklaşık)          18°  ☁ │
│ Öğleden sonra yağmur bekleniyor               │
│ ▁▁▂▅▇▇▅▂▁▁   saat saat yağış olasılığı       │
│ 09  12  14  17  20                            │
│ En yüksek 21° · en düşük 14°                  │
│───────────────────────────────────────────────│
│ ◐ Küçülen ay · %91 aydınlık                   │
│ Dolunay 26 Eylül'deydi · yeniay 10 Ekim       │
│ Bilim ne diyor? ›                             │
│───────────────────────────────────────────────│
│  Weather · Veri kaynakları      12.40'ta alındı│
└───────────────────────────────────────────────┘
```
- Yağış şeridi yalnız yağış olasılığını gösterir (0–100); renk tek ton (dataviz ilkesi); sayı dokununca görünür.
- Bağlama göre bir satır (sabit şablon, Nef'in sesi; sağlık iddiası yok):
  - Yağmur + yürüyüş hatırlatması açık: "Yağmur varsa yürüyüşünü içeride de yapabilirsin."
  - Açık hava, gündüz: "Gökyüzü açık; Gökyüzü molası için güzel bir gün." (Gökyüzü molası modülü var, `lib/gokyuzu.js`)
- Atıf satırı her zaman görünür: `combinedMarkLightURL/DarkURL` temaya göre, "Veri kaynakları" `legalPageURL`'i açar.
  Marka görseli ağdan gelir; önbelleğe alınır (VARSAYIM: Apple buna izin veriyor; belgede yasak bulunamadı).
- "12.40'ta alındı": verinin yaşı her zaman yazar (bayat veri gizlenmez).

### 8.3 Durumlar
| Durum | Kart ne gösterir |
|---|---|
| Hiç sorulmadı | Ay bölümü tam; üstte "Bulunduğun yerin havasını göstereyim mi?" [Konumumu kullan] [Şehir seç] |
| İzin reddedildi | Ay tam; "Şehir seç" (Profil şehri öneri olarak); Ayarlar'a gitme bağlantısı küçük |
| Şehir seçildi | Başlıkta "Ankara" (yaklaşık yazmaz); her şey aynı |
| Çevrimdışı, önbellek < 12 sa | Son veri + "3 saat önce alındı · şu an çevrimdışısın" |
| Çevrimdışı, önbellek yok ya da ≥ 12 sa | Hava bölümü: "Hava için internet gerekiyor." Ay tam (ağsız) |
| WeatherKit hatası / kota | "Hava bilgisi şu an alınamadı." Tekrar deneme 15 dk sonra; ay tam |
| iOS 15 | Hava bölümü hiç yok; ay tam |
| Web / geliştirme | Hava yok; ay tam |

### 8.4 5 saniye kuralı
Başlık satırı ilk bakışta okunur (tek satır, yeni kart yok). İzin sayfası yalnız kişi isteyince gelir; ilk açılış akışına
(YAPILACAKLAR karar 2, İlk Bakış önce) hiçbir şey eklenmez.

---

## 9. Veri merkezi ve Gelişim bağlantısı

- Hava bir modül değil, **bağlamdır**. `sessions`'a yazılmaz (seriye, hedefe ve Nef'e sayılmasın; habits için verilen
  aynı gerekçe `dataHub.js:9-11`).
- Yeni küçük günlük: `lib/skyLog.js` → gün başına `{ date, rainy: bool, tMax, moonIllum }` (koordinat ve şehir yok),
  90 gün tutulur (VARSAYIM). "Tüm verileri sil" ve dışa aktarma (`exportData.js`) bunu kapsar.
- Merkez (`dataHub.js`) bunu yalnız bağlam olarak okur; hiçbir alan puanına katılmaz.
- **Açık karar A5 (ileride):** "Günün nasıl geçti" puanı tutulursa, en az 8 yağmurlu ve 8 yağmursuz günden sonra yalnız
  betimleyici satır: "Senin yağmurlu günlerindeki ortalama puanın 3,4; diğer günlerde 3,6." Yorum, neden-sonuç ve öneri yok;
  altında Denissen 2008 ve Klimstra 2011 ("etki küçük ve kişiden kişiye değişiyor"). Eşik VARSAYIM.
- Nef ilk sürümde bu günlüğü görmez (§3.3).

---

## 10. Maliyet

- WeatherKit: 500.000 çağrı/ay üyeliğe dahil. Bir `weather(for:including: .current, .hourly, .daily)` isteğinin 1 mi 3 mü
  çağrı sayıldığı Apple belgesinde bulunamadı (**VARSAYIM**; ikisi de hesaplandı).
- Varsayım: yalnız hava kartını açan kişi; önbellek 60 dk; kişi başına günde ortalama 3 istek.

| Günlük aktif, havası açık kişi | İstek = 1 çağrı (ay) | İstek = 3 çağrı (ay) | Ek ücret |
|---|---|---|---|
| 1.000 | 90 k | 270 k | 0 |
| 5.000 | 450 k | 1,35 M | 0 ya da 99,99 $ (2 M) |
| 10.000 | 900 k | 2,7 M | 0 ya da 249,99 $ (5 M) |

- Önlem: uygulama içi günlük istek sınırı (kişi başına 8; VARSAYIM) ve kota hatasında 15 dk susma (§8.3).
- Open-Meteo seçilseydi ilk günden 49 $/ay.
- Ay hesabı ücretsiz (ağsız).

---

## 11. Uygulanabilirlik ve iş büyüklüğü

Swift eklentisi **gerekir** (WeatherKit ve yaklaşık konum için). Parçalar:

| Parça | Dosya | Tahmin |
|---|---|---|
| `lib/moon.js` + test (USNO tablosuyla) | yeni | 0,5 gün |
| `SkyPlugin.swift`: izin durumu, izin isteme, yaklaşık tek konum, 2 ondalık yuvarlama, WeatherKit (current + hourly 36 sa + daily 2 gün), özet JSON, atıf URL'leri; `#available(iOS 16, *)` koruması (`AlarmPlugin.swift:54` kalıbı) | yeni + `MainViewController.swift` kaydı | 1,5–2 gün |
| Yetki, Info.plist iki anahtar, App ID'de WeatherKit servisinin açılması (Developer hesabı) | `App.entitlements`, `Info.plist` | 0,5 gün (hesap işi dahil) |
| `lib/sky.js` (saf): önbellek, bayatlık, yağmur kararı, başlık parçası, kart metinleri + testler | yeni | 1 gün |
| 81 il merkez koordinatları + en yakın il | `lib/cities.js` yanı | 0,5 gün |
| Gökyüzü kartı + başlık parçası + durumlar | `components/SkyCard.jsx`, `Home.jsx:207` | 1,5 gün |
| Rıza `weather` v1 + izin sayfası | `consent.js`, `ConsentSheet` | 0,5 gün |
| Yağmur bildirimi planı + `OWN_RANGES` + tercih | `notifyPlan.js` ya da ayrı `rainNotify.js`, `notifyApply.js:15-18` | 1 gün |
| Gizlilik sayfası, App Store etiketi, sources.js kaynakları, skyLog + silme/dışa aktarma | `site/gizlilik.html:76`, `lib/sources.js` | 0,5 gün |

Toplam ≈ 7–8 iş günü + cihazda deneme (izin penceresi, yaklaşık konum, uçak modu, alarm sabahı, bildirim).
Mevcut sistem bozulmaz: her şey yeni dosya, isteğe bağlı kart ve ayrı kimlik aralığı; mevcut hatırlatma, alarm ve Nef
akışı değişmez. Uygulama sırası önerisi: YAPILACAKLAR (c)–(g) işlerinden sonra, ayrı onay + TestFlight; ilk adım ay kartı
(ağsız, izinsiz, bir günlük iş) — sahibinin "ayın durumunu göster" isteğini risksiz karşılar.

**Test listesi (vitest):** ay evreleri USNO 2026 ±2 dk ve TR günü birebir; aydınlanma ±1 puan; yuvarlama (41.0082 →
41.01); yağmur eşiği; bayatlık (18 sa); kimlik 7700/7701 dışına çıkmaz ve 7600–7607'ye dokunmaz; Nef sinyal paketinde
konum/hava alanı yok (T8 kalıbına `lat|lon|koordinat` eklenir, `YOL.nef.md:387`); çevrimdışı ve iOS 15 durum metinleri.

---

## 12. Gizlilik ve güvenlik özeti

- Giden tek şey: 2 ondalığa yuvarlanmış koordinat (ya da il merkezi), yalnız Apple WeatherKit'e, yalnız kişi hava kartını
  açtıysa. Sunucumuza, Supabase'e ve Nef'e konum/şehir/hava gitmez.
- Arka planda konum yok; "Always" izni yok; varsayılan yaklaşık konum.
- Rıza ayrı, işaretsiz; geri çekilince yuvarlanmış koordinat silinir, yağmur bildirimleri iptal edilir.
- Gizlilik sayfası ve App Store etiketi aynı sürümde güncellenir; yoksa `gizlilik.html:76` yanlış olur.
- KVKK m. 9 (2024) yurt dışı aktarım dayanağı hukukçuya sorulur.

---

## 13. Açık kararlar (sahibine)

- **A1.** Yalnız WeatherKit mi (öneri), yoksa iOS 15/web için Open-Meteo ücretli planı da mı?
- **A2.** Nef haftalık değerlendirmede "yağışlı gün sayısı"nı görsün mü? (Öneri: ilk sürümde hayır.)
- **A3.** Yurt dışı şehirler için küçük dünya şehirleri listesi eklensin mi?
- **A4.** Konum izni varsa ay doğuş/batış saati gösterilsin mi (WeatherKit)?
- **A5.** "Günün nasıl geçti" puanı ile yağmurlu günlerin betimleyici karşılaştırması (8+8 gün sonra) olsun mu?
- **A6.** Apple atıf kuralının bildirim ve başlık satırına uygulanması: gövdede "Kaynak: Apple Hava Durumu" + başlıkta
  sıcaklık yerine yalnız "yağmur" sözcüğü mü (temkinli), yoksa sıcaklık da mı? App Review'a sorulması önerilir.
- **A7.** BGAppRefreshTask ile sabah tazeleme denemesi (ikinci sürüm) yapılsın mı?
- **A8.** Yağmur bildirimi saati: alarm + 15 dk / 07:30 (öneri) mi, kişi mi seçsin?
- **A9.** Yağmur eşiği: %50 ve 0,5 mm (öneri) mi?

---

## 14. VARSAYIM listesi

Hava önbelleği 60 dk; konum en çok saatte bir; yağmur eşiği %50 + 0,5 mm; bildirim alarm + 15 dk ya da 07:30,
06:30–09:00 sınırı; bayatlık 18 sa; kişi başı günlük 8 istek sınırı; skyLog 90 gün; WeatherKit istek başına çağrı sayımı;
Apple'ın "üçüncü taraf ortak" sayılması; atıf markasının önbelleğe alınabilmesi; 64 bekleyen bildirim sınırı; ΔT ≈ 69 sn;
evre adı sınırları; il merkez koordinatlarının kaynağı (GeoNames); betimleyici karşılaştırma için 8+8 gün.

## 15. Kaynaklar

**PubMed (bu oturumda PubMed kaydıyla doğrulandı):** Cajochen 2013 PMID 23891110 [doi](https://doi.org/10.1016/j.cub.2013.06.029) ·
Cordi 2014 PMID 24937275 [doi](https://doi.org/10.1016/j.cub.2014.05.017) (özet yok) · Haba-Rubio 2015 PMID 26498230
[doi](https://doi.org/10.1016/j.sleep.2015.08.002) · Della Monica 2015 PMID 26096730 [doi](https://doi.org/10.1111/jsr.12312) ·
Smith 2017 PMID 27928860 [doi](https://doi.org/10.1111/jsr.12472) · Chaput 2016 PMID 27047907
[doi](https://doi.org/10.3389/fped.2016.00024) · Casiraghi 2021 PMID 33571126 [doi](https://doi.org/10.1126/sciadv.abe0465) ·
Benedict 2021 PMID 34520928 [doi](https://doi.org/10.1016/j.scitotenv.2021.150222) · Foster & Roenneberg 2008 PMID 18786384
[doi](https://doi.org/10.1016/j.cub.2008.07.003) · Denissen 2008 PMID 18837616 [doi](https://doi.org/10.1037/a0013497) ·
Klimstra 2011 PMID 21842988 [doi](https://doi.org/10.1037/a0024649) · Lucas & Lawless 2013 PMID 23607534
[doi](https://doi.org/10.1037/a0032124) · Tucker & Gilliland 2007 PMID 17920646 [doi](https://doi.org/10.1016/j.puhe.2007.04.009) ·
Klimek 2022 PMID 35151273 [doi](https://doi.org/10.1186/s11556-022-00286-0).

**Apple:** [WeatherKit get started](https://developer.apple.com/weatherkit/get-started/) ·
[WeatherKit genel](https://developer.apple.com/weatherkit/) ·
[Veri kaynakları](https://developer.apple.com/weatherkit/data-source-attribution/) ·
[Weather özellik kapsamı](https://support.apple.com/en-us/105038) ·
[WeatherAttribution](https://developer.apple.com/documentation/weatherkit/weatherattribution) ·
[WeatherAvailability](https://developer.apple.com/documentation/weatherkit/weatheravailability) ·
[WeatherKit yetkisi](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.weatherkit) ·
[REST kimlik doğrulama](https://developer.apple.com/documentation/weatherkitrestapi/request-authentication-for-weatherkit-rest-api) ·
[Konum izni](https://developer.apple.com/documentation/corelocation/requesting-authorization-to-use-location-services) ·
[NSLocationDefaultAccuracyReduced](https://developer.apple.com/documentation/bundleresources/information-property-list/nslocationdefaultaccuracyreduced) ·
[kCLLocationAccuracyReduced](https://developer.apple.com/documentation/corelocation/kcllocationaccuracyreduced) ·
[earliestBeginDate](https://developer.apple.com/documentation/backgroundtasks/bgtaskrequest/earliestbegindate) ·
[App privacy details](https://developer.apple.com/app-store/app-privacy-details/).

**Diğer:** [Open-Meteo terms](https://open-meteo.com/en/terms) · [Open-Meteo pricing](https://open-meteo.com/en/pricing) ·
[Open-Meteo docs](https://open-meteo.com/en/docs) · [MEVBİS](https://www.turkiye.gov.tr/mevbis-meteorolojik-veri-bilgi-satis-sunum-sistemi) ·
[MGM ürünler](https://www.mgm.gov.tr/site/urunler.aspx) · [KVKK yurt dışına aktarım](https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim) ·
USNO 2026 ay evreleri (`aa.usno.navy.mil/api/moon/phases/year?year=2026`; `scratchpad/yol-v1/usno2026.json`) ·
@capacitor/geolocation 8.2.2 README (npm) · Meeus J., *Astronomical Algorithms*, 2. baskı, bölüm 48–49 (kitap; PubMed dışı).
