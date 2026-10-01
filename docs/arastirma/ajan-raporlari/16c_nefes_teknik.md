# 16c — Nefes Modülü: Teknik Fizibilite (Algılama, HealthKit, TTS, App Store)

> Kapsam: EyeTrail (React 19 + Vite PWA, Capacitor 8, özel Swift eklentileri: ARKit yüz takibi, konuşma, haptik). Bilimsel kaynaklar **PubMed** üzerinden bulundu (PMID + DOI). Apple tanımlayıcıları yalnızca bu oturumda okunan developer.apple.com sayfalarından alındı. Kural: kamera görüntüsü ve ham ses cihazdan çıkmaz, yalnızca özet sayılar saklanır.

## 1. Yalnız iPhone ile gerçek zamanlı nefes algılama

### Kanıt özeti (PubMed)

| Yöntem | Çalışma | Koşul | Doğruluk |
|---|---|---|---|
| **Mikrofon, burun nefes sesi** | Nam ve ark. 2015, PMID 26415194, [DOI](https://doi.org/10.1109/JBHI.2015.2480838) | 10 sağlıklı kişi, 6–90 nefes/dk | Burun sesiyle medyan hata <%1; telefon burundan **30 cm** uzaktayken de doğru. Burun tıkanıklığında hızlı nefeste sayının iki katı okunduğu uç değerler görüldü. Trakeal ses yöntemi zayıf kaldı. |
| Mikrofon, trakeal ses | Reyes ve ark. 2014, PMID 25196108, [DOI](https://doi.org/10.3390/s140813830) | Harici mikrofon boyna yerleştirildi, 9 kişi | Solunum hızında yanlılık yaklaşık 0,1 nefes/dk; faz başlangıcında yaklaşık 51 ms fark |
| Aktif akustik (FMCW sonar) | Vincent ve ark. 2026, PMID 42515474, [DOI](https://doi.org/10.3390/s26144591) | Hoparlör + 2 mikrofon, 20 kişi | Nefes hızında MAE 1,39 nefes/dk; kurulumu karmaşık |
| **Ön kamera, oturan kişi** | Bae ve ark. 2022 (Google), PMID 35603304, [DOI](https://doi.org/10.1038/s43856-022-00102-x) | 50 kişi | Solunum hızında MAE 0,78 ± 0,61 nefes/dk; kronik solunum hastalarında da düşük |
| RGB kamera, **yalnız baş hareketi** | Gwak ve ark. 2023, PMID 38082888, [DOI](https://doi.org/10.1109/EMBC40787.2023.10340590) | 30 kişi | MAE 1,91 nefes/dk; nefes yokluğu (tutma) tespitinde F1 0,87 |
| Boyun videosu (akıllı telefon) | Farahani ve ark. 2025, PMID 40677816, [DOI](https://doi.org/10.1364/BOE.543645) | Klinik ortam | Solunum hızında r=0,85 |
| Parmak PPG (arka kamera), nabız | Yan ve ark. 2017, PMID 28288955, [DOI](https://doi.org/10.2196/mhealth.7275) | 40 kişi, EKG ile | İstirahatte RMSE 1,03 atım/dk; yüzden ölçülen PPG hareketle birlikte daha kötü |
| Parmak PPG'den solunum hızı | Lázaro ve ark. 2015, PMID 26450762, [DOI](https://doi.org/10.1088/0967-3334/36/11/2317) | 30 kişi, 0,2–0,6 Hz | Normal hızlarda medyan göreli hata yaklaşık %0,5 |
| İvmeölçer/jiroskop, telefon göğüste | Cinotti ve ark. 2025, PMID 40006324, [DOI](https://doi.org/10.3390/s25041094) | 10 kişi, istirahat | Nefes tespitinde duyarlılık %95,6 |
| İvmeölçer | Lee ve Yoo 2020, PMID 32773384, [DOI](https://doi.org/10.2196/17803) | 30 erkek | Göğüs kemeriyle korelasyon 0,7; ortalama fark 0,43 nefes/dk |

### Değerlendirme

**a. Mikrofon.** Telefonu yüzün önünde tutma senaryosuna en uygun yöntem bu (yaklaşık 30 cm, burun nefesi). Pratik sorunlar:
- Ortam gürültüsü.
- Ağızdan sessiz nefes alındığında sinyal zayıflar.
- Burun tıkanıklığı hatası (Nam 2015).
- **Uygulamanın kendi Türkçe anonsu mikrofona geri sızar.** Anons çalarken algılamayı durdurmak (gating) en basit çözüm. `AVAudioIONode.setVoiceProcessingEnabled(_:)` ([doküman](https://developer.apple.com/documentation/avfaudio/avaudioionode/setvoiceprocessingenabled(_:))) var, ancak bunun yankı giderme sağladığı sayfada açıkça yazmıyor: **doğrulanamadı**.
- Gizlilik: ses yalnızca bellekte zarf (envelope) olarak işlenir, kaydedilmez. `NSMicrophoneUsageDescription` gerekli ([doküman](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription)).

**b. ARKit / kamera.** Bae 2022 ve Gwak 2023, RGB videoda nefesin **baş ve gövde hareketinden** okunabildiğini gösteriyor. ARKit `ARFaceAnchor.BlendShapeLocation` listesinde `jawOpen`, `mouthClose`, `noseSneerLeft/Right` ve `cheekPuff` var ([doküman](https://developer.apple.com/documentation/arkit/arfaceanchor/blendshapelocation)). Ancak **blendshape veya TrueDepth ile solunum ölçen, doğrulanmış bir çalışma bulunamadı: doğrulanamadı.** Baş pozisyonu ve yüz-kamera mesafesinin salınımı makul bir *yardımcı* sinyal, fakat telefon elde tutulduğunda elin kendi hareketi baskın olacaktır. Bu yüzden yalnızca "faz onayı" için kullanılmalı, hız ölçümü için kullanılmamalı. Ağızdan nefes alındığında `jawOpen` değişimi, ağız/burun ayrımı için bir buluşsal yöntem olarak denenebilir (doğrulanmadı).

**c. Parmak PPG.** Nabız için iyi doğrulanmış (Yan 2017), solunum hızı da türetilebilir (Lázaro 2015). Ancak parmak arka kameradayken ekrana ve yüze bakan akış bozulur, ayrıca ön kamerayla aynı anda kullanım bu oturumda doğrulanmadı. Seans öncesi/sonrası "30 sn nabız" adımı olarak düşünülebilir.

**d. İvmeölçer.** Telefon göğüste veya karındayken doğru sonuç veriyor (Cinotti 2025). Yüze bakan senaryoyla uyumsuz; yalnızca "sırtüstü yatarak" modu için uygun.

**Öneri:** Yüz önünde tutulan telefon için **birincil sinyal mikrofon (burun nefes sesi zarfı), ikincil sinyal ARKit baş/yüz hareketi** olmalı. Füzyonun görevi hız ölçmek değil, "kullanıcı ritme uyuyor mu" sorusuna evet/hayır/emin değil demek.

## 2. Apple Watch / HealthKit

### a. Tanımlayıcılar (hepsi okundu)

| Veri | Tanımlayıcı | Not |
|---|---|---|
| Nabız | `HKQuantityTypeIdentifier.heartRate` | count/time, discrete; `HKMetadataKeyHeartRateMotionContext` alabilir ([doküman](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/heartrate)) |
| HRV | `HKQuantityTypeIdentifier.heartRateVariabilitySDNN` | SDNN, ms; "Apple Watch'ta otomatik kaydedilir" ([doküman](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn)) |
| Vuruş dizisi | `HKHeartbeatSeriesSample` + `HKHeartbeatSeriesQuery` | Ardışık vuruş zamanları (iOS 13+) ([doküman](https://developer.apple.com/documentation/healthkit/hkheartbeatseriessample)) |
| Solunum hızı | `HKQuantityTypeIdentifier.respiratoryRate` | count/time; "Apple Watch'ta otomatik kaydedilir" ([doküman](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/respiratoryrate)) |
| Farkındalık seansı | `HKCategoryTypeIdentifier.mindfulSession` | Değer olarak `HKCategoryValue.notApplicable` kullanılır ([doküman](https://developer.apple.com/documentation/healthkit/hkcategorytypeidentifier/mindfulsession)) |

### b. Watch uygulaması olmadan canlı nabız alınabilir mi?

**Pratikte hayır.**
- `HKWorkoutSession` Apple Watch'ta "yüksek frekanslı nabız örnekleri" üretir. iPhone'da ise harici nabız sensörü gerekir ([doküman](https://developer.apple.com/documentation/healthkit/hkworkoutsession)).
- Canlı akış için gereken zincir şu: **kendi watchOS uygulamanız** → `startMirroringToCompanionDevice(completion:)` (watchOS 10+, [doküman](https://developer.apple.com/documentation/healthkit/hkworkoutsession/startmirroringtocompaniondevice(completion:))) → iPhone'da `workoutSessionMirroringStartHandler` (iOS 17+, [doküman](https://developer.apple.com/documentation/healthkit/hkhealthstore/workoutsessionmirroringstarthandler)).
- Watch uygulaması iPhone'dan `startWatchApp(with:completion:)` ile başlatılabilir ([doküman](https://developer.apple.com/documentation/healthkit/hkhealthstore/startwatchapp(with:completion:))). Etkinlik türü olarak `HKWorkoutActivityType.mindAndBody` mevcut.
- Watch uygulaması olmadan iPhone tarafında `HKAnchoredObjectQuery` + `updateHandler` ile yeni örnekler dinlenebilir ([doküman](https://developer.apple.com/documentation/healthkit/hkanchoredobjectquery)). Ancak Watch'tan iPhone'a eşitleme gecikmesi Apple dokümanlarında yazmıyor: **gecikme doğrulanamadı.** 3 dakikalık seans için "canlı" sayılamaz.
- `enableBackgroundDelivery(for:frequency:withCompletion:)` için `com.apple.developer.healthkit.background-delivery` yetkisi gerekir. watchOS'ta çoğu tür için sıklık üst sınırı **saatlik** ([doküman](https://developer.apple.com/documentation/healthkit/hkhealthstore/enablebackgrounddelivery(for:frequency:withcompletion:))). Canlı kullanım için uygun değil.

### c. Seans sonrası gerçekte ne okunabilir?

| Veri | Seans sonrası okunabilirlik |
|---|---|
| Nabız | Seans penceresindeki örnekler okunabilir. Workout yoksa örnekleme sıklığı: doğrulanamadı. |
| HRV (SDNN) | Otomatik kaydedilir, ancak *ne zaman* kaydedildiği Apple dokümanında yok. Mindfulness/Breathe seansının HRV ölçümünü tetiklediği yalnızca üçüncü taraf kaynaklarda geçiyor: **Apple kaynağıyla doğrulanamadı.** |
| Solunum hızı | Apple Destek arama özetlerine göre uyku sırasında kaydediliyor (support.apple.com erişimi engelli olduğu için tam metin okunamadı). 3 dakikalık gündüz seansından sonra değer **beklenmemeli.** |

Sonuç: v3'te gerçekçi hedef, "seans öncesi ve sonrası nabız ortalaması" ile varsa en yakın HRV değerini göstermek.

### d. Mindful session yazma

- `NSHealthUpdateUsageDescription` (yazma) ve `NSHealthShareUsageDescription` (okuma) anahtarları doğrulandı ([doküman 1](https://developer.apple.com/documentation/bundleresources/information-property-list/nshealthupdateusagedescription), [doküman 2](https://developer.apple.com/documentation/bundleresources/information-property-list/nshealthshareusagedescription)).
- HealthKit capability gerekli. Temel entitlement anahtarının adı bu oturumda okunmadı: **doğrulanamadı**.
- Kural 5.1.3(ii) gereği, mikrofon/kamera tahminlerimiz HealthKit'e `respiratoryRate` olarak **yazılmamalı**. Yalnızca `mindfulSession` yazılmalı.

### e. Capacitor 8 eklentisi

| Eklenti | Sürüm / uyumluluk | Değerlendirme |
|---|---|---|
| **@capgo/capacitor-health** ([GitHub](https://github.com/Cap-go/capacitor-health)) | npm son sürüm **8.11.4**, peer `@capacitor/core >=8.0.0`; GitHub son sürümü "8.11.4 — 22 Sep" (yıl gösterilmiyor). v8 "maintained". | `heartRate`, `heartRateVariability`, `respiratoryRate`, `mindfulness` türlerini okuma/yazma destekliyor. Canlı workout/mirroring desteği README'de yok. |
| @perfood/capacitor-healthkit | 1.3.2, peer `^4.0.0` | Eski, önerilmez. |

**Öneri:** Okuma ve mindful yazma için v2'de Capgo eklentisi yeterli. v3'teki canlı nabız için **kendi Swift eklentimiz ve ayrı bir SwiftUI watchOS hedefi** gerekiyor; Capacitor watchOS uygulaması üretmiyor.

## 3. Türkçe TTS

- `AVSpeechSynthesisVoice(language:)` BCP-47 kodu alır. `speechVoices()` ile cihazdaki sesler listelenir; daha kaliteli (enhanced/premium) sesler sonradan indirilebilir ([doküman](https://developer.apple.com/documentation/avfaudio/avspeechsynthesisvoice)).
- tr-TR "Yelda" sesi yalnızca topluluk listelerinde geçiyor; Apple'ın dil listesi (HT206175) okunamadı: **kısmen doğrulanamadı.** Çalışma anında `speechVoices()` sonucu `tr` ile filtrelenmeli, ses bulunamazsa uyarı gösterilmeli.
- Zamanlama için `AVSpeechUtterance` üzerinde `preUtteranceDelay`/`postUtteranceDelay`/`rate`, gecikmeyi ölçmek için de `speechSynthesizer(_:didStart:)` / `didFinish` kullanılabilir ([doküman](https://developer.apple.com/documentation/avfaudio/avspeechsynthesizerdelegate)). Sentez başlama gecikmesine dair Apple rakamı yok (doğrulanamadı).
- **Öneri:** "Nefes al / Tut / Ver" için bir Türkçe konuşmacıdan **önceden kaydedilmiş kısa klipler** kullanılmalı (sabit süre, doğal tonlama, sıfır sentez gecikmesi). Zamanın asıl kaynağı görsel animasyon ve haptik; ses yalnızca faz sınırında tetiklenir. TTS, sayılar ve özel desenler için yedek olarak kalır.

## 4. App Store Kuralları (developer.apple.com/app-store/review/guidelines, aynen)

- **1.4.1:** "Apps must clearly disclose data and methodology to support accuracy claims relating to health measurements, and if the level of accuracy or methodology cannot be validated, we will reject your app. For example, apps that claim to take x-rays, measure blood pressure, body temperature, blood glucose levels, or blood oxygen levels using only the sensors on the device are not permitted." / "Apps should remind users to check with a doctor…"
- **5.1.1(ix):** Sağlık gibi yüksek düzenlemeli alanlarda hizmet veren uygulamalar "should be submitted by a legal entity that provides the services, and not by an individual developer."
- **5.1.2(vi):** HealthKit ve "depth and/or facial mapping tools (e.g. ARKit, Camera APIs…)" verileri "may not be used for marketing, advertising or use-based data mining".
- **5.1.3(i):** "You must disclose the specific health data that you are collecting from the device." **5.1.3(ii):** "Apps must not write false or inaccurate data into HealthKit… and may not store personal health information in iCloud."
- **2.5.1:** "HealthKit should be used for health and fitness purposes and integrate with the Health app."

**Çıkarım:** Nefes algılamayı "ölçüm" değil **"ritim takibi / geri bildirim"** olarak konumlandırın. Hız gösterilecekse "tahmini" etiketi ve yöntem açıklaması (mikrofon zarfı + yüz hareketi, cihaz üzerinde) bulunmalı; doktor uyarısı eklenmeli. Sağlık verisi iCloud'a yazılmamalı.

## 5. Rakipler (kısa, web)

| Uygulama | Desen sunumu | Gerçek algılama |
|---|---|---|
| Apple Mindfulness/Breathe | Animasyon + haptik | Nefes algılamıyor (Apple kaynağı okunamadı). HRV tetiklemesi üçüncü taraf iddiası. |
| Breathwrk | 50+ zamanlı nefes al/tut/ver egzersizi, ses, görsel, haptik, Watch haptiği, Health "mindful minutes" | İncelemelere göre gerçek zamanlı HRV/biyogeri bildirim yok |
| Othership | Müzikli, rehberli seanslar; Watch haptiği; Mindful Minutes | Algılama yok |
| Prana (prana.co) | 80+ egzersiz | **Giyilebilir sensörle** nefes algılıyor (telefon sensörüyle değil) |
| Lungy, BreathQuest, Breathing Zone | Oyunlaştırma | Üreticilerin açıklamasına göre **iPhone mikrofonuyla** nefes algılıyor |

## Önerilen yol

| Faz | İçerik | Doğrulama kriteri |
|---|---|---|
| **v1: sensörsüz** | Desen motoru (4-4-4-4, 4-7-8, 5-5 vb.), kayıtlı Türkçe klipler + haptik + görsel; TTS yedek; `mindfulSession` yazma (Capgo eklentisi); "tıbbi değildir" metni | Faz geçişi ile ses/haptik kayması <100 ms (iç test) |
| **v2: mikrofon + ARKit** | Swift eklentisi: mikrofon zarfı (anons sırasında devre dışı) + ARKit baş/yüz-mesafe salınımı → cihaz üzerinde "uyum skoru" ve tahmini nefes/dk. Yalnızca özet sayılar saklanır. Nabız okuma sadece seans sonrası. | Küçük iç doğrulama: kemer veya elle sayıma karşı MAE ≤2 nefes/dk; aksi halde hız gösterilmez, yalnızca "ritimdesin / değilsin" |
| **v3: Watch** | SwiftUI watchOS hedefi + `HKWorkoutSession` (mindAndBody) + mirroring ile canlı nabız; seans sonrası HRV/nabız özeti | Watch yoksa v2 akışı |

## Riskler

- Anonsun mikrofona sızması ve ortam gürültüsü.
- Ağızdan nefes almada zayıf sinyal; burun tıkanıklığında sayının iki katı okunması.
- Elde tutulan telefonun hareketinin ARKit sinyalini bastırması.
- 1.4.1 gereği yöntem açıklaması yetersiz kalırsa ret.
- Bireysel geliştirici hesabı (5.1.1(ix)).
- Watch hedefinin Capacitor dışında ayrı bakım yükü getirmesi.
- tr-TR ses kalitesinin cihazdan cihaza değişmesi.

## Doğrulanamayanlar

- Blendshape veya TrueDepth ile solunum ölçen doğrulanmış çalışma.
- `setVoiceProcessingEnabled` ile yankı giderme sağlandığı.
- Ön kamera ARKit ile mikrofonun eşzamanlı kullanımında bir kısıt olup olmadığı.
- Watch'tan iPhone'a HealthKit eşitleme gecikmesi; Watch'ta workout olmadan nabız örnekleme sıklığı.
- HRV'nin Breathe/Mindfulness seansıyla tetiklenmesi (yalnızca üçüncü taraf kaynak).
- Solunum hızının yalnızca uykuda kaydedildiği (Apple Destek tam metni okunamadı).
- HealthKit temel entitlement anahtarının adı.
- tr-TR "Yelda" sesinin resmi Apple listesinde bulunması; TTS başlama gecikmesi.
- Capgo 8.11.4 sürümünün yılı (GitHub'da "22 Sep" yazıyor; npm'de en son sürüm olarak görünüyor).

*Kaynak atfı: Bilimsel veriler PubMed'den alındı; DOI bağlantıları tablolarda.*
