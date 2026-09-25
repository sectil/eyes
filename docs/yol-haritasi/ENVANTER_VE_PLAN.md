# Envanter ve plan — atlas (62 ekran) ↔ kod (2026-09-25)

Amaç: "Bazılarını çıkarıyorsun" endişesine belgeyle cevap. Bu dosya depodaki dosyalara ve
`git log`'a bakılarak yazıldı; ekran atlası (Artifact "EyeTrail Ekran Atlası", 62 ekran) ile kod
karşılaştırıldı. Tahmin yok; kontrol edilmeyen yerde "bakılmadı" yazıyor.

## 0. Silinen bir şey var mı? Hayır.
- `git log --diff-filter=D -- app/src` boş: uygulama kaynağından hiçbir dosya silinmedi.
- Çember takibi kodda: `src/lib/track.js` (motivasyon sözleri `WORDS`, hız seçimi `SPEEDS`
  yavaş/orta/hızlı, puan `scoreOf`), `src/screens/TrackGame.jsx`, modül `src/modules/track`.
  Sözler 1–3 kelime ("Böyle devam", "Güzel gidiyor"): tam cümle 1 saniyede okunamadığı için
  bilinçli karar (dosyada not var). Uzun cümle istenirse "yavaş" hızda cümle seçeneği eklenir.
- Telefonda görünmemesinin nedeni sürüm: Build 14 (95a19f2) bunların hepsini içerir; Build 13
  ve öncesi içermez. Build 16 (236d65f) kalibrasyon v2.1'i ekler.

## 1. Atlas ↔ kod envanteri

| Bölüm | Ekranlar | Durum | Nerede |
|---|---|---|---|
| A Başlangıç | 01 Hoş geldin (kendi gözün canlı) | **yok** | giriş doğrudan taramayla başlıyor |
| | 02 Güvenlik taraması | var, **yalnızca göz** (kırmızı bayrak, gözlük, son muayene) | `screens/Screening.jsx` |
| | 03 Kırmızı bayrak yönlendirme | var | `Screening.jsx` |
| | 04 Cihaz: ölçek + mesafe | var | `DistanceCalibration.jsx`, `CardCalibration.jsx` (web) |
| | 05–06 Göz kalibrasyonu | var (v2.1: ekran içi nokta, yeşil onay) | `GazeCalibration.jsx` |
| B Bugün | 07 Bugün, 08–09 Jev onayı/kartı | var (Jev Faz 1a) | `Home.jsx`, `CoachCard.jsx` |
| | 10 Konfor molası (kameralı) | **yok**; yerine zorunlu mola kilidi (5 dk / 5 dk) | `RestLock.jsx` |
| C Ders | 11–16 Soru → bilgi → uygulama → anlama → bitiş | **yok** (ders motoru + 21 ders içerik bankası) | — |
| D Ölçüm | 17–24 E testi, mesafe uyarısı, okuma testi | var | `AcuityTest.jsx`, `ReadingTest.jsx` |
| E Egzersiz | 25–31 Set seçimi, bakış, daire, kırpma, uzağa bak, gözler kapalı | var (+ Derin set, nefes adımı) | `Routine.jsx`, `lib/routines.js` |
| F Pratikler | 32–35 Yılan | var (+ gerçek kişi animasyonu, "Şimdi sen dene") | `SnakeGame.jsx`, `GazeTutorial.jsx` |
| | 36–38 Çember takibi | var | `TrackGame.jsx` |
| G Gelişim | 39 Gelişim, 41 Takvim | var | `Progress.jsx`, `Calendar.jsx` |
| | 40 Gün ayrıntısı | **yok** (takvimde güne dokununca ayrıntı açılmıyor) | `Calendar.jsx` |
| | 42 Haftalık rapor (Jev) | **yok** | — |
| H Profil | 43–48 Profil, ses, canlı göz değerleri, kanıt, gizlilik, abonelik | var | `Info.jsx`, `GazeTest.jsx`, `Evidence.jsx`, `Paywall.jsx` |
| I Farkındalık | 49 Merkez, 50–52+56 Hızlı Bakış, 53 Değişimi yakala, 54 Çoklu takip, 55 Günlük görev | **yok** (hiçbiri) | — |
| J Yaşam | 57 Akşam soruları, 58 Kaçınma merdiveni, 59 Jev'le prova, 60 Tahmin/gerçek, 61 Mevsim hedefi, 62 Kırmızı bayrak | **yok** (hiçbiri) | — |
| K Logo | 3 yorum | seçilmedi | — |
| Atlasta olmayıp yapılanlar | Nefes (ayarlar/ses/koşu), nefes sayma, mola kilidi + bildirim, Derin set, ses düğmesi, göz bütçesi | var | `Breath.jsx`, `BreathCount.jsx`, `RestLock.jsx`, `restNotify.js`, `eyeBudget.js` |

Özet: 62 ekranın 38'i var, 23'ü yok (C, I, J bölümleri ve 01, 10, 40, 42), logo bekliyor.

## 2. Sistem bütünlüğü açıkları (modül var ama sisteme tam bağlı değil)
| Açık | Kanıt | Düzeltme |
|---|---|---|
| Jev sinyalinde yalnızca `snakeBest` var; Çember, nefes, nefes sayma, kırpma yok | `lib/coachCore.js` SCHEMA | Modül sözleşmesine `signals(sessions)` alanı; koç özeti otomatik toplar |
| Gelişim'de oyunlar yalnızca "N oyun" sayısı | `Progress.jsx` 155–159 | Modül `stats()` ile satır: Çember rekoru/ortalama tepki, Yılan, nefes doğruluğu |
| Çember sözleri 1–3 kelime | `lib/track.js` WORDS | Yavaş hızda 4–6 kelimelik cümle havuzu (isteğe bağlı) |
| Kalibrasyon raporu iOS'ta paylaşılıyor ama sonuçlar Gelişim'e yazılmıyor | `GazeCalibration.jsx` | Kalibrasyon puanı (x/y skor, drift) Bilgi → Göz takibi'nde |

## 3. Yeni istekler (bu mesaj)
### 3a. Profil anketi ("ilk girişte hâlâ yalnızca göz soruyor")
Kaynak: `docs/arastirma/ajan-raporlari/18_profil_sorulari.md` (PubMed taraması, 2026-09-25).
Bulgu: Türkçe geçerliliği PubMed'de doğrulanan yalnızca üç araç var: DESQ-TR (13 madde, ekran göz
yorgunluğu), Tek Maddeli Uyku Kalitesi (SQS-TR, 0–10) ve NEI-VFQ-25 TR. Zihin gezinmesi/farkındalık
kısa ölçeklerinin (MAAS-5, MWQ, MW-S/D, ARCES) Türkçe doğrulaması bulunamadı; PSS-4'ün ayrı Türkçe
doğrulaması yok (PSS-14 var). Işığa duyarlı nöbet için doğrulanmış tarama maddesi yok; Epilepsy
Foundation uzlaşılarından tek madde türetildi.

Önerilen anket (11 madde, ~2 dk; hiçbir puan tanı ya da risk seviyesi olarak gösterilmez):
| # | Halka | Madde | Dayanak |
|---|---|---|---|
| 1–4 | Göz | Yaş aralığı, yakın gözlük, son muayene, kırmızı bayraklar | mevcut `Screening.jsx` |
| 5 | Güvenlik | Epilepsi tanısı **veya** yanıp sönen ışık/desenle bayılma-kasılma (Evet/Hayır/Emin değilim) → "Evet/Emin değilim" flaşlı görevleri (Hızlı Bakış, Değişimi yakala) kapatır | Fisher 2005/2022/2025 |
| 6 | Göz | Son ayda küçük yazı okurken zorlanma (5'li) | NEI-VFQ yakın etkinlik mantığı; doğrulanmamış tek madde, yalnızca kişi-içi izleme |
| 7 | Yaşam | Günlük ekran saati (<2/2–4/4–6/>6) | betimsel |
| 8 | Yaşam | Son 7 gün uyku kalitesi 0–10 | **SQS-TR** (Dereli & Kahraman 2021, PMID 34785424) |
| 9 | Yaşam | Gece uyanınca telefona bakma sıklığı | Dissing 2021, Exelmans 2016; doğrulanmamış tek madde |
| 10–11 | Yaşam | Algılanan stres 2 madde (PSS'nin olumsuz maddeleri) | Türkçe PSS-14 (Örücü & Demir 2009); madde metni tam metinden alınacak |
| — | Dikkat | **Sorulmaz**; ilk haftada göz kırpma, nefes sayma ve Hızlı Bakış görevlerinden davranışsal çıkarılır | rapor §8 |

Profil nesnesi (`settings.profile`): modüller `today()` ve Jev bunu okur (ör. ekran >6 sa →
mola kilidi bütçesi 3 dk; uyku ≤4 → akşam nefes önerisi; nöbet "Evet" → flaşlı modüller kilitli).
İsteğe bağlı derin modüller (halka içinde, ilk açılışta değil): DESQ-TR 13 madde (haftalık),
MWQ 5 madde (CC BY; Türkçe çeviri "doğrulanmamış" etiketiyle), Vamping-TR 10 madde.
Yayın öncesi: SQS ve DESQ kullanım izni, PSS Türkçe madde metinleri, nöbet maddesine nörolog onayı.

### 3b. Kalp, nefes, kamera ("sistem kalp, nefes, kamera takibi yapar")
Teknik zemin hazır: `16c_nefes_teknik.md` §2 HealthKit (nabız, HRV, solunum hızı,
farkındalık seansı). Gerçekçi v1 (rapordaki sonuç): **Apple Watch uygulaması olmadan**
iPhone'da `HKAnchoredObjectQuery` ile seans öncesi/sonrası nabız ve varsa HRV; nefes seansını
`mindfulSession` olarak Sağlık'a yazma. Canlı nabız akışı kendi watchOS uygulamasını gerektirir
(Faz 2). Gerekenler: HealthKit yetkisi (Xcode capability), `NSHealthShareUsageDescription`,
Capacitor HealthKit eklentisi (16c §3'teki adaylar; sürüm seçimi kodlamadan önce doğrulanır).
Kamera: kırpma, mesafe, bakış zaten ölçülüyor; nefes hızı kameradan **ölçülmez** (16c: güvenilir değil).

### 3c. "Karşıdakini tanır" — VARSAYIM: yüzden kişiyi tanıyıp profili seçmek isteniyor.
Önermiyorum: kişiyi yüz geometrisinden tanımak KVKK'da özel nitelikli biyometrik veridir (açık
rıza, ayrı işleme kaydı); Apple 5.1.2(vi) yüz haritalama verisinin pazarlama/veri madenciliğinde
kullanımını yasaklar (16c §5). Apple'ın ARKit yüz verisiyle *kimliklendirme* kuralına bakılmadı;
istenirse ayrıca doğrulanır.
Yapılır: (1) "yüz var / gözler açık / ekrana bakıyor" tespiti (zaten var); (2) birden çok profil
gerekirse cihaz kilidiyle (Face ID/LocalAuthentication) profil seçimi — kimlik kamerada değil,
iOS'ta kalır. Bu yorum yanlışsa ne kastettiğini yaz.

## 4. Yapım sırası (her adım ayrı TestFlight; onay bekliyor)
0. **Build 16**: kalibrasyon v2.1 cihazda doğrulama (nokta yeşil, "Hazır").
1. **Profil anketi** (3a) + profil nesnesi + modüllerin profili okuması. ~1 derleme. **YAPILDI** (Build 18): `lib/profile.js`, `screens/Profile.jsx`; ekran 6+ sa → mola bütçesi 3 dk; uyku ≤4 / stres ≥5 → nefes plana girer; nöbet cevabı `flashSafe` olarak saklanır (Hızlı Bakış kapısı, adım 4'te kullanılacak). Eski kayıtlar: Bugün'de "Profilini tamamla" kartı; Bilgi → Profilim.
2. **Sistem bütünlüğü** (§2): Jev sinyalleri, Gelişim satırları, kalibrasyon puanı. ~1 derleme. **YAPILDI** (Build 18): modül sözleşmesine `coach()` ve `stats()` eklendi; Çember, Yılan, nefes, nefes sayma özetleri Jev sinyaline `modules` alanıyla gider (yalnızca sayı; profil cevapları Jev'e GİTMEZ), Gelişim → Pratikler kartları, Göz takibi ekranında kalibrasyon ayrışma puanı ve kayma. Not: sunucu (`api/coach.js`) aynı `coachCore.js`'i kullanır; yeni `modules` alanının sunucuda geçmesi için Vercel yeniden dağıtımı gerekir (`bash app/scripts/coach-setup.sh`).
3. **Farkındalık I**: 49 merkez + 50–52+56 Hızlı Bakış (native süre hassasiyeti: 133 ms gösterim
   için `requestAnimationFrame` ölçümü; 08 raporu web'de <100 ms güvenilmez diyor → 133 ms sınır,
   cihazda ölçülecek) + 55 günlük görev. Sonra 53 Değişimi yakala, 54 Çoklu takip. ~3 derleme.
4. **Ders motoru C** (11–16) + ilk 7 ders; içerik raporlardan kaynaklı. ~2 derleme.
5. **Yaşam J** (57–62): akşam soruları, merdiven/deney, mevsim hedefi; prova Jev Faz 2 ile. ~2 derleme.
6. **HealthKit** (3b): seans öncesi/sonrası nabız, mindfulSession yazma. ~1 derleme.
7. 01 Hoş geldin (kendi gözün canlı), 10 Konfor molası (kameralı), 42 haftalık rapor, logo.

Sıra değiştirilebilir; "1 ve 3 önce" gibi yaz.

## 5. Ek istek (2026-09-25): E testinde gözlük — kaynak `ajan-raporlari/19_gozluk_ve_yakin_test.md`
Mevcut durum (kod): E testi her ölçümde "Gözlüklü / Lensli / Gözlüksüz" soruyor ve kayda yazıyor (`AcuityTest.jsx` WEAR);
trend (`lib/trend.js`) bu koşulu AYIRMIYOR; numara sorulmuyor; kameradan gözlük tespiti yok.
Araştırma sonucu:
- Numaradan yakın keskinlik hesaplanmaz: doğrulanmış model yok (yalnızca defokus eğimi ~0,2 logMAR/D ve yaşa göre
  ortalama add tabloları; bireysel sapma ±0,5 D). Klinikte ilişki ters yönde: keskinlik ölçülür, add seçilir.
  → Numara "hesaba katılmaz"; en fazla meta-veri.
- Klinik/telefon testleri iki koşul kullanır: alışkanlık (presenting/habitual; DSÖ, Peek Acuity, V@home, HSVA) ya da
  düzeltmesiz. Koşul değişince ölçümler karşılaştırılamaz (Brezilya: %96,5 → %81,1 → %20,5). Mevcut "uzak gözlük tak,
  okuma gözlüğü takma" yönergesini hiçbir ev testi validasyonu kullanmamış → değiştirilecek.
- iOS'ta yerleşik gözlük tespit API'si yok (ARKit blendShapes, Vision yüz noktaları, Core ML hazır modeller tek tek
  doğrulandı). Yapılabilir: 1–3 MB Core ML ikili sınıflandırıcı (CelebA ticari kullanım dışı → kullanılmaz; MeGlass/MegaFace
  lisansı hukukla doğrulanmalı). Apple 5.1.2(vi) engel değil (cihazda evet/hayır, kare saklanmaz).
Seçenekler:
- **A (önerilen, hemen) — YAPILDI (Build 19):** Yönerge "yakını normalde nasıl görüyorsan öyle ölç (okuma/progresif gözlük varsa tak); her
  seferinde aynı". Koşul alanı zorunlu ve ayrıntılı: yok / okuma gözlüğü / progresif-bifokal / yalnız uzak gözlüğü / lens.
  Trend ve Gelişim yalnızca aynı koşuldaki ölçümleri birleştirir; koşul değişince yeni baz çizgisi. "Gözlüğün değişti mi?"
  sorusu (yeni numara → yeni baz). Numara isteğe bağlı meta-veri (Profil'de), hesaba girmez.
- **B (isteğe bağlı):** ayda bir ek gözlüksüz ölçüm ("düzeltme kazancı"); 60+ için taban etkisi riski.
- **C (sonra):** kamera tutarlılık kontrolü — kullanıcı seçer, Core ML sınıflandırıcı yalnızca çelişkide "gözlük takılı
  görünüyor" der; lisansı temiz eğitim verisi şart.

## 6. Yönerge kalıbı (2026-09-25, onaylı; Artifact "EyeTrail Yönerge Kartları") — YAPILDI (Build 19)
- `components/StepCards.jsx`: bir kartta bir iş (≤ 8 kelime), SVG çizim (`components/howtoArt.jsx`), kaydırarak geçiş,
  canlı doğrulama rozeti (mesafe doğruysa kart kendiliğinden geçer), "Bir daha gösterme" (`lib/howto.js`).
- `components/TodayPath.jsx`: Bugün'de plan menü değil yol (biten yeşil, sıradaki büyük, sonrakiler soluk, tek baloncuk).
- Kartlara geçen ekranlar: görme testi (3), okuma testi (3), nefes sayma (3), Çember (2), göz kalibrasyonu (2);
  Yılan giriş satırları kısaltıldı (kişi animasyonu zaten var); nefes güvenliği üç kalın başlık.
- Web'e özgü kart/mesafe kalibrasyonu (CardCalibration, DistanceCalibration) listede kaldı — iOS'ta görünmez.
