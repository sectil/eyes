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
Kaynak: `docs/arastirma/ajan-raporlari/18_profil_sorulari.md` (PubMed taraması; ajan raporu).
Karar ilkesi: yalnızca **doğrulanmış, kısa, ücretsiz** ölçek maddeleri; 2 dakika; teşhis yok.
Üç halkaya göre profil: Göz (yorgunluk, gözlük, muayene), Dikkat (zihin gezinmesi), Yaşam
(uyku/ekran, stres, erteleme). Çıktı "profil" nesnesi: modüller `today()` ve Jev bunu okur
(ör. yüksek ekran yorgunluğu → mola kilidi 3 dk; yüksek zihin gezinmesi → nefes sayma önce).
Işığa duyarlı epilepsi maddesi Hızlı Bakış'ın kapısı olur.

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
1. **Profil anketi** (3a) + profil nesnesi + modüllerin profili okuması. ~1 derleme.
2. **Sistem bütünlüğü** (§2): Jev sinyalleri, Gelişim satırları, kalibrasyon puanı. ~1 derleme.
3. **Farkındalık I**: 49 merkez + 50–52+56 Hızlı Bakış (native süre hassasiyeti: 133 ms gösterim
   için `requestAnimationFrame` ölçümü; 08 raporu web'de <100 ms güvenilmez diyor → 133 ms sınır,
   cihazda ölçülecek) + 55 günlük görev. Sonra 53 Değişimi yakala, 54 Çoklu takip. ~3 derleme.
4. **Ders motoru C** (11–16) + ilk 7 ders; içerik raporlardan kaynaklı. ~2 derleme.
5. **Yaşam J** (57–62): akşam soruları, merdiven/deney, mevsim hedefi; prova Jev Faz 2 ile. ~2 derleme.
6. **HealthKit** (3b): seans öncesi/sonrası nabız, mindfulSession yazma. ~1 derleme.
7. 01 Hoş geldin (kendi gözün canlı), 10 Konfor molası (kameralı), 42 haftalık rapor, logo.

Sıra değiştirilebilir; "1 ve 3 önce" gibi yaz.
