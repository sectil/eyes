# Üç bulgu: kanıtla (2026-09-30)

Bilgiler PubMed'den alındı (get_article_metadata, get_full_text_article). `/home/user/eyes` altında hiçbir dosya değiştirilmedi.

## 1) yogaLessons.js: Radin 2025 atfı

**Koddaki yerler**
- `app/src/lib/yogaLessons.js:34`: yorum `Radin 2025, PMID 39808431`
- `app/src/lib/yogaLessons.js:35`: `THREE_MIN_LINE = "Bir çalışmada günde 10 dakika meditasyon yapması istenen çalışanların %69,7'si günde 5 dakikanın altında kaldı (Radin 2025). Üç dakikalık sürümün etkisini doğrudan sınayan bir çalışma ise bulamadık."`
- `:82` ve `:239`: `src('39808431', 'Radin 2025 · gerçek kullanım kısa (3 dk kartı)', ...)`
- `:192`: `src('39808431', 'Radin 2025 · gerçek kullanım süresi', ...)`

**PubMed kaydı**
- PMID 39808431 · PMCID PMC11733700
- Başlık: "Digital Meditation to Target Employee Stress: A Randomized Clinical Trial."
- İlk yazar: Radin RM · Yıl: 2025 (2025-01-02) · Dergi: JAMA Netw Open 8(1):e2454435
- DOI: [10.1001/jamanetworkopen.2024.54435](https://doi.org/10.1001/jamanetworkopen.2024.54435)
- Kişi sayısı: 1458 (728 meditasyon, 730 bekleme listesi)
- Tür: Randomized Controlled Trial. MeSH: Meditation, Mindfulness. **Yoga değil, uygulama üzerinden yapılan farkındalık meditasyonu (Headspace).**

**İddia özette var mı?** Hayır. Özette yalnızca şu var: "Participants in the intervention group were instructed to complete 10 minutes of meditation per day for 8 weeks." ve "Those using the app from 5 to 9.9 min/d vs less than 5 min/d showed greater reduction in stress". %69,7 özette **yok**.

**Tam metinde var mı?** Var (PMC tam metni, "Exploratory Analysis of Effect of Treatment Adherence"):
> "Among those in the MED group (n = 580 at 8 weeks) ... low-frequency group (<5 min/d [404 (69.66%)]"

Aynı tam metin, "Treatment Adherence" bölümü:
> "Participants randomized to MED (n = 728) engaged with the app a mean (SD) of 5.20 (3.88) min/d. ... Participants accessed meditation-specific sessions a mean (SD) of 3.36 (3.33) min/d. Thirty-one of those in the MED arm (4.26%) were 100% adherent to instructions to meditate 10 min/d or more."

**Değerlendirme**
- Sayı doğru (404/580 = %69,66 → %69,7), ama paydası 728 kişinin tamamı değil. Payda, 8. haftada ölçüme gelen 580 kişi. Satırdaki "istenen çalışanların %69,7'si" ifadesi bu ayrımı atlıyor.
- "gerçek kullanım kısa" etiketi tam metinle destekleniyor (ortalama 5,20 dk/gün; talimata tam uyan %4,26). Özetle desteklenmiyor.
- Çalışma meditasyon çalışması. Satır zaten "meditasyon" diyor, yoga demiyor. Ama bu satır yoga derslerinin kartında duruyor (`:82`, `:192`, `:239`). Okuyan kişi bu bulguyu yoga için sanabilir.
- Satırda etki iddiası yok, sağlık iddiası da yok. Sorun yalnızca kesinlik ve bağlam.

**Önerilen düzeltme (uygulanmadı)**
- A (kısaltmak): `"Bir meditasyon uygulaması çalışmasında, günde 10 dakika istenen çalışanların 8. haftaya kalanlarının çoğu günde 5 dakikanın altında kaldı (Radin 2025). Üç dakikalık sürümü doğrudan sınayan bir çalışma bulamadık."` Yüzde verilmez, payda sorunu da kalkar.
- B (sayıyı korumak): `"... 8. haftada ölçülen 580 kişinin %69,7'si ..."` ve atıf etiketine "(meditasyon, tam metin)" eklenir.
- C: Satır ve 3 kaynak girdisi kaldırılır. Kalan "Üç dakikalık sürümü doğrudan sınayan bir çalışma bulamadık." cümlesi tek başına yeter.
- Hangisi seçilirse seçilsin, yorum satırındaki (`:34`) kaynağa "tam metin, n=580" notu düşülmeli. Bulgu özette yok.

## 2) YOL.nef.md §14: Kim 2020 ve Wolffsohn 2025

**Belge ne diyor?** `docs/yol-haritasi/tasarim/YOL.nef.md:639` başlığı: "## 14. Kaynaklar (bu oturumda PubMed'den doğrulananlar; `lib/sources.js`'te zaten var)". Tablodaki `kim2020` (satır 650) ve `wolffsohn2025` (satır 651) da bu başlığın altında. **Evet, belge ikisinin de sources.js'te olduğunu söylüyor.**

**Gerçekte nerede?**
- `app/src/lib/sources.js`: **ikisi de yok**. `kim2020` ya da `wolffsohn2025` anahtarı, "32409236" ve "40467388" PMID'leri aranınca hiç eşleşme çıkmıyor. sources.js'teki tek Cont Lens Anterior Eye kaydı `talens2022` (PMID 35963776, satır 56-62).
- `app/src/lib/evidence.js:69`: `'Wolffsohn ve ark. 2025 (PMID 40467388)'`
- `app/src/lib/evidence.js:71`: `'Kim ve ark. 2020 (PMID 32409236)'` (ikisi de `id: 'blink'` kaydının `sources` dizisinde, düz metin olarak)
- Başka yerler: `app/src/lib/blink.js:56` (Kim 2020), `app/src/lib/blink.js:58` (Wolffsohn 2025), `app/src/lib/ladders.js:106` (Wolffsohn 2025), `app/src/modules/blink/manifest.js:1` (ikisi).
- §14'teki öteki anahtarlar sources.js'te duruyor: eser2019:106, faes2021:113, joseph2023:123, katibeh2022:130, han2019:137.
- Yan bulgu: §14'teki katibeh satırı "`sources.js:118`" diyor. −0,19/+0,26 sayıları gerçekte `sources.js:121`'de, bir yorum satırında. 118. satır faes2021 kaydının içinde kalıyor.

**PubMed doğrulaması**
- PMID 32409236: "Therapeutic benefits of blinking exercises in dry eye disease." İlk yazar Kim AD, 2020 (2020-05-12), Cont Lens Anterior Eye 44(3):101329, DOI [10.1016/j.clae.2020.04.014](https://doi.org/10.1016/j.clae.2020.04.014). Kişi sayısı: 54 kişi başladı, 41 kişi tamamladı. Türü "Journal Article" (RKÇ etiketi yok, kontrol grubu yok). §14'teki "41 kişi, kontrolsüz" ifadesi özetle uyumlu.
- PMID 40467388: "Optimisation of blinking exercises for dry eye disease." İlk yazar Wolffsohn JS, 2025 (2025-06-03), Cont Lens Anterior Eye 48(5):102453, DOI [10.1016/j.clae.2025.102453](https://doi.org/10.1016/j.clae.2025.102453). Kişi sayısı: optimizasyon aşamasında 98, etkinlik aşamasında 28. Tür: Randomized Controlled Trial. Özetteki ilgili cümle: "These readings mostly returned to baseline levels two weeks after finishing the blinking exercises". §14'teki künye doğru.

**Önerilen düzeltme:** §14 başlığındaki "`lib/sources.js`'te zaten var" ifadesi iki satır için yanlış. Ya başlık "(kim2020, wolffsohn2025 yalnız `evidence.js`'te)" diye düzeltilmeli ya da iki kayıt sources.js'e eklenmeli (ekleme bu görevin dışında).

## 3) Info.plist: NSHealthUpdateUsageDescription

**Anahtar var mı?** Var. `app/ios/App/App/Info.plist:9-10`:
`<string>Nefona Apple Sağlık'a hiçbir veri yazmaz. Adımını, yürüme mesafeni ve egzersiz dakikanı yalnızca okur; veriler telefonundan çıkmaz.</string>`
(Okuma anahtarı `NSHealthShareUsageDescription` da var, satır 13.)

**Uygulama HealthKit'e yazıyor mu?** Hayır.
- `app/ios/App/App/HealthPlugin.swift:49`: `store.requestAuthorization(toShare: [], read: readTypes)`. Yazma kümesi boş.
- HealthKit'le ilgili tek Swift dosyaları `HealthPlugin.swift` ve `AppDelegate.swift`. İkisinde de `HKHealthStore.save`, `delete(` ya da `HKQuantitySample(` çağrısı yok. Aramada çıkan `saveItems` ve `saveLog` çağrıları (`HealthPlugin.swift:212, 326, 333, 353, 363`) Sağlık'a değil UserDefaults'a yazıyor (satır 193: `UserDefaults.standard`, satır 340: "Saklama (JSON → UserDefaults)").
- Eklentinin sunduğu yöntemler (`:22-27`): isAvailable, requestAuthorization, dailyTotals, recentSteps, setWalkGuards, walkGuardLog. Hiçbiri yazmıyor.
- `package.json` içinde üçüncü taraf bir sağlık eklentisi yok.

**Kaldırmak güvenli mi? Hayır, önerilmez.**
- Commit `182d8aa` (2026-09-28): "iOS: NSHealthUpdateUsageDescription eklendi (TestFlight yüklemesi reddediliyordu)". Gövdesi: "HealthKit yetkisi açık olduğu için App Store Connect yazma izni açıklamasını da istiyor; uygulama Sağlık'a yazmıyor (toShare: []), metin bunu söylüyor." `docs/ANA_BELGE.md:199` de aynı şeyi yazıyor.
- `App.entitlements` içinde `com.apple.developer.healthkit` true. Yani anahtar kaldırılırsa TestFlight/App Store yüklemesinin yeniden reddedilmesi bekleniyor.
- İleride yazma yolu açılabilir (antrenman kaydı): `docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/arastirma/apple-yuruyus.md:236` ve `:559`. O durumda da anahtar gerekir, yalnız metni değişir.
- Sonuç: anahtar kalmalı. Mevcut metin ("hiçbir veri yazmaz ... yalnızca okur") kodla tutarlı. `YAPILACAKLAR.md:517` ve `bildirim-hava-yuruyus/DEVIR.md:150`'deki madde "kaldır" diye değil, "gerekli, dokunma (182d8aa)" diye kapatılmalı.
