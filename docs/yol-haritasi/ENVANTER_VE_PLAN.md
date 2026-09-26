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
3. **Farkındalık I** — ilk kısım YAPILDI (Build 20): 49 merkez (`modules/awareness`), 50–52+56 Hızlı Bakış (`modules/quick-look`, `lib/quicklook.js`, rapor 20), 55 günlük görev (`modules/notice`). Kalan: 53 Değişimi yakala, 54 Çoklu takip. Önceki metin: 49 merkez + 50–52+56 Hızlı Bakış (native süre hassasiyeti: 133 ms gösterim
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

## 7. Hızlı Bakış kararları (rapor 20, 2026-09-25)
- Süre 500 ms'den başlar, taban 100 ms (WKWebView'de daha kısası güvenilir değil); 2-aşağı 1-yukarı, ilk 2 dönüşe kadar
  4 kare, sonra 1 kare; eşik = son 6 dönüş. 50 deneme, her 8.'si kolay (basamağa sayılmaz).
- Uyaran kare döngüsünde doğrudan açılıp kapanır; ölçülen gerçek süre ve düşen kare sayısı kayda yazılır (cihazda doğrulanacak).
- Merkez 1,9°, kenar hedef telefonda hedef 5,5° (dikey telefonda ~4° sığıyor; kayda yazılır), 35 cm. Maske 500 ms,
  açık-koyu nokta (ortalama parlaklık zemine yakın). Seviyeler: 0 → 7 → 23 çeldirici.
- "UFOV" adı kullanılmaz; skor yalnızca kişinin kendi geçmişiyle karşılaştırılır; düşük günlük dozun etkisi bilinmiyor.
- Nöbet cevabı Evet/Emin değilim → kapalı; cevap yoksa ilk açılışta sorulur.
- Günlük fark etme görevi: doğrudan kanıt yok (dolaylı: Horwood 2016, Graham 2011, Schofield 2015); iddiasız alıştırma.

## 8. Nefes sayma sahnesi (2026-09-25, onaylı; Artifact "EyeTrail Nefes Sayma Tasarımı") — YAPILDI (Build 22)
- Kural: ölçüm kısıtı boş sunumun mazereti değil. Sayı yine gösterilmez (Levinson 2014), ama sahne her dokunuşa cevap verir.
- `components/NightScene.jsx`: gece göğü + su. Dokunuş → suda halka (dokunulan yerde), 9'da uzun basış → altın halka,
  kapanan her set → gökte yıldız, kalan süre → ay dilimi. "Kaybettim" → sakin halka + "1'den başla".
- Giriş: Jev tek cümle + canlı küre (dene: dokun/basılı tut) + 3/5 dk seçimi. Sonuç: yıldız sırası (doğru setler yanar),
  doğruluk halkası, üç sayı (set tamam / kaybettim / dikkat ort.), Jev yorumu. Soru kartı suyun üstünde yüzer.
- VARSAYIM: gökteki yıldız = uzun basışla kapanan set (doğruluk değil); doğruluk yalnızca sonuçta görünür.
- Protokol ve formül değişmedi (`lib/breathCount.js`; state'e yalnızca `nines` sayısı eklendi).

## 9. Giriş filmi ve Profilim (2026-09-25, onaylı; Artifact "EyeTrail Giriş Filmi") — 23a YAPILDI (Build 23)
- `components/IntroFilm.jsx`: 15 sn sessiz film, iris içinden (SVG + SMIL, ağ yok). Gözlüğü çıkarır, koşar; bankın altındaki
  kedi, patlak lastik, açan çiçek altın odak halkasıyla; çocuklukta bulut ata dönüşür; ata biner, at kanatlanır, gece göğüne
  yükselir. Yazılar: Bak → Çıkar → Koş → Fark et → Yine → Bir daha → Hatırla → Hayal et → Uç. Sonda logo + "Başla".
  Yalnızca ilk açılışta (`settings.intro.seen`); "Atla" her an; hareket azaltma açıksa oynamaz; Profilim'den yeniden izlenir.
- `screens/ProfileHome.jsx` (`lib/identity.js`): avatar (harf + 5 iris rengi veya fotoğraf, cihazda 160 px'e küçültülür),
  ad, doğum tarihi (anketin yaş aralığını otomatik doldurur), gözlük/lens; profil sorularına ve filme geçiş. Bugün'de selam ada göre.
  Ad/doğum tarihi/fotoğraf yalnızca cihazda; Jev'e gitmez.
- **23b (bekliyor):** hesap sistemi. Karar: Supabase (Apple + Google + e-posta sihirli bağlantı). App Store 4.8: Google varsa
  Apple ile giriş zorunlu. 5.1.1(v): hesapsız kullanım kalır ("Şimdilik hesapsız dene"). "Beni tanı": oturum cihazın güvenli
  deposunda, şifre bir daha sorulmaz; Face ID kilidi sonraki build. Eşleşen veri: profil + ölçüm özetleri; kamera verisi asla.
  Sağlık verisi rızası ve gizlilik politikası güncellemesi gerekir. Film sonundaki "Başla" 23b'de hesap düğmelerine dönüşür.

## 10. Görme testi: daha az harf, tek göz örtme kontrolü (2026-09-25, onaylı) — YAPILDI (Build 24)
- Şikâyet (Build 22 ekranı): "~23 harf kaldı", üç göz turu çok uzun; iki göz açıkken "sağ göz" testi yapılabiliyor.
- Harf sayısı (`lib/zest.js` PLANS): günlük 20 (en az 14), haftalık 28 (en az 20). Günlük test yalnız sağ + sol göz;
  iki göz yalnız haftalıkta. Simülasyon (550 sanal kişi): günlük hata SD 0,046→0,057, haftalık 0,031→0,042; ETDRS
  test-tekrar farkı ≈ ±0,1 logMAR içinde. Bugün kutucuğu, Jev sinyali ve Gelişim artık tek 'OU' serisine değil
  `lib/vaSeries.js` seçimine bakar (uyarısı en ciddi göz → son 14 günde en çok ölçülen → sağ).
- Örtme (`lib/occlusion.js`): iPhone TrueDepth göz kapanma değeriyle. Test edilen göz açık, diğeri kapalı ve avuçla
  örtülü 1 sn görülmeden "Başla" açılmaz; testte durum 0,7 sn'den uzun bozulursa harf gizlenir ("Sol gözünü kapat").
  Kırpma testi durdurmaz. Yönerge ekranında iki göz için canlı durum + ham değer (0 açık, 1 kapalı). Kayda
  `occlusion: { method: 'camera', pauses, blockedMs }`; TrueDepth yoksa kişinin onayı (`self-report`).
- VARSAYIM (cihazda doğrulanacak): blinkLeft = kullanıcının kendi sol gözü (Apple belgesi açık yazmıyor);
  avuçla örtülen gözün kapağı da indirilirse "kapalı" okunur; eşikler 0,55 / 0,45.
- Sonuç: logMAR + 20/xx + 6/xx + ondalık (Türkiye reçete dili).
- Gözlük: kamera gözlük takılı mı ayırt edemiyor (ARKit sinyali yok); koşul seçimi ve seri ayrımı kalır.

## 11. Bakış motoru: Yılan hassasiyeti + gözle "Kaydır" (2026-09-25, PLAN — onay bekliyor, Build 25)
Teşhis (kodda doğrulandı, cihaz verisi yok): kalibrasyon modeli bakışı "orta→kenar noktası = 20" biriminde verir;
Yılan eşiği 10 "derece" sanılarak bu birimde kullanılıyor → eşik ≈ 82 pt ≈ 2,2° (tasarım 10°). Tahta ±179 pt; sağ/sol
üçte biri dönüş bölgesi. Tahta altındaki gösterge "aşağı" eşiğinin altında. Süzgeç sakkadı geçiriyor, 220 ms bekleme her
duraklamayı komut yapıyor. Göz sabitken bile mikrosakkad/kayma üretir (Martinez-Conde 2013, doi 10.1038/nrn3405).
1. Bakış → ekran noktası (pt): kalibrasyon noktalarının ekran konumuyla; kararlar tahta hücresi cinsinden.
2. Sakkad / duraklama ayrımı (hız eşiği); yalnızca duraklama konumu (pencere ortancası) karar üretir.
3. Yılan: başa göre komut. Baş çevresinde ölü daire; dışı dört 90° dilim; geri dönüş yok sayılır.
4. Ölü daire yarıçapı ölçümden: max(1,5 hücre, 2,5 × kalibrasyondaki orta-bakış titremesi). VARSAYIM: normal dağılım.
5. Tahta dışındaki duraklama (gösterge, skor, yazı) komut değil.
6. Yem yendiğinde son duraklama ≈ yem → bakış kayması yavaşça düzeltilir (örtük kalibrasyon).
7. Dönüşten sonra baş bir hücre ilerleyene kadar yeni komut yok.
8. **Gözle "Kaydır" (StepCards):** kalibrasyon modeli varsa "Kaydır ya da gözünle sağa bak". Ekranın sağ kenar bölgesinde
   (x > %80) 0,6 sn duraklama bir sonraki karta geçer; "Kaydır ›" düğmesinde dolan halka gösterilir; yalnız ileri, son
   kartta ana düğmeye basılmaz (yanlışlıkla başlatma olmasın). Aynı motor (1–2) kullanılır.
   VARSAYIM: kamera yalnız zaten kamera kullanan ekranlarda açık (görme testi, okuma, Çember, Hızlı Bakış, göz kalibrasyonu);
   Nefes sayma gibi kamerasız ekranlarda yalnız kaydırma. Kalibrasyon yoksa yalnız kaydırma.
Doğrulama: sentetik bakış (sakkad + duraklama + gürültü) ile eski/yeni istenmeyen dönüş sayısı ve gecikme tablosu.

## 12. Tek göz örtme: göz kapağı (24.1) + derinlik haritası (Build 25) — YAPILDI, cihazda doğrulanacak
- Build 24 cihaz verisi: tek göz kapatınca ARKit iki gözü birlikte kapalı okur (0,88 / 0,87); el ile örtünce yüz takibi düşer.
  Blendshape ile hangi gözün kapalı olduğu ayırt EDİLEMEZ (yöntem bırakıldı).
- 24.1 (`lib/occlusion.js`): tek göz testinde "iki göz birden açık olamaz". Kayıt `camera-lid`.
- Build 25: `FaceDistancePlugin.swift` start({ depth: true }) → "depth" olayı ~10 Hz: kişinin sol/sağ göz bölgesinin
  ortanca derinliği (ARFrame.capturedDepthData). Göz yeri yüz izlenirken saklanır (projectPoint, landscapeRight,
  imageResolution; kişinin solu = yüz koordinatında x'i büyük göz, Apple ARFaceAnchor belgesi), el yüzü örtünce son yer
  kullanılır (≤ 30 sn). İki bölge farkı ≥ 15 mm → yakın taraf örtülü: doğru göz ise geçer (`camera-depth`), yanlışsa
  "Diğer gözünü örtmüşsün". Yüz kaybolunca mesafe uzak bölgenin (açık göz) derinliğinden sürer (`useFaceTracking` depthDistance).
- VARSAYIM (cihazda doğrulanacak): derinlik haritası renkli görüntüyle aynı görüş alanı (normalize eşleme; olay depthW/H,
  imageW/H gönderir); avuç–göz farkı ≥ 15 mm; eşik 0,55 / 0,45.
- Bu makinede Swift derleyici yok; kod Apple API imzalarına göre elle denetlendi. İlk derleme kullanıcının Mac'inde.

## 13. Bugünün yolu yeniden, Okuma testi, Çemberler (2026-09-25, Build 26 — YAPILDI)
Bulgular (kodda): yol sırası `lib/today.js` kindRank ile "önce ölçüm, sonra egzersiz, sonra pratik"; egzersizler tek
durak ("Tam set"); Çember takibi (`TrackGame`, sözler `lib/track.js` WORDS, TrueDepth tepki ölçümü) yolda değil (today() yok);
"Çemberler" ekranı (kullanıcı ekran görüntüsü, k/d 85) bu depoda ve eyes-project.zip'te yok. Okuma testi tek cümle,
konuşma eşleşmesi ≥ 0,7 olunca cümle biter (`MATCH_THRESHOLD`) → kişi bitirmeden geçiyor.
1. **Yol**: gün = duraklar dizisi; egzersiz durakları gövde (set adımları 2–3'lü gruplanır: ısınma, uzak bakış,
   yakın–uzak, göz kırpma), aralara ölçüm (E testi, Okuma) ve pratik (Çemberler, Nefes, Yılan, Hızlı Bakış) serpilir;
   iki ölçüm art arda gelmez; toplam ≈ 15 dk. Biten durakta Jev balonu tek söz (WORDS havuzu). Duolingo değil: durak =
   iris, yol = diyafram yayı (marka).
2. **Nefes sayma**: yoldan ve Farkındalık'tan çıkar; modül fişten çekilir (kod kalır, eski kayıtlar Gelişim'de görünür).
   VARSAYIM: "kaldır" = uygulamadan; yalnız yoldan istenirse söylenir.
3. **Okuma** (ad "Okuma hızı" → "Okuma"): 3 satırlık sabit paragraf (kaymaz), her paragraf bir küçük boy (0,1 logMAR
   adım); konuşma tanıma paragrafın TAMAMI okununca (eşleşme ≥ 0,85, VARSAYIM) ya da "Okudum" ile geçer, ortada geçmez;
   "Okuyamıyorum" küçülmeyi bitirir. Sonuç: rahat okunan en küçük boy (kritik yazı boyu) + boy başına doğruluk ve süre.
   Paragraf havuzu: kurgusal, kişisel bilgi yok, boy başına farklı metin.
4. **Çemberler**: bağlı daireler (takımyıldız), işaret daireden daireye atlar, göz izler; TrueDepth: bakış hedefe
   gitti mi + tepki süresi; her varışta söz. Kalp atışı (k/d) şimdi yok → HealthKit adımı (§ plan 7). Yola günlük durak.
5. Sıra: taslaklar (yol, okuma, çemberler) → onay → kod (Build 26). Build 25 (Yılan bakış motoru, §11) ayrı onay bekler.
- Taslaklar (2026-09-25, onay bekliyor): Bugünün Yolu https://claude.ai/artifact/8Cnzo13vuATjebm5VdCWrH ·
  Okuma https://claude.ai/artifact/61XmzZ25utUL66WZEZ1Tta · Çemberler https://claude.ai/artifact/XQz4ATKHvaCtCXHH22hhH4.
  Her taslağın sonunda "Karar gereken noktalar" ve VARSAYIM listesi var; kod bu kararlardan sonra (Build 26).
- Build 26 (2026-09-25, onaylandı "canlıya al"; taslakların önerileriyle): yapıldı.
  - Yol: lib/today.js buildPath (şablon + R1–R8), routines PATH_GROUPS (5 grup), Nefes her gün mola durağı (breath-rest 5 dk,
    dokununca 'path' molası başlar = A), 5 dk gerçek ara mola sayılır (B), Nefes sayma emekli (registry retired), TodayPath yeni görsel.
  - Okuma: lib/reading.js yeni protokol (protocol 2), 71 metin, yazı yerinde durur, sonuna kadar okunur; eski kayıtlar "Önceki yöntem".
  - Çemberler: lib/track.js + cemberDraw.js + TrackGame yeniden; Katman A yön algılama; Katman B (Build 25 motoru) yok.
  - Cihazda doğrulanacak: konuşma tanıma ile otomatik bitiş, Çemberler kamera modu, yol molası bildirimi.
  - Yapılmadı: Yılan "1 tur" sınırı ve "Yola dön" bitişi (Build 25'e bağlı), iki kötü okuma sonrası hekim önerisi (sağlık iddiasına yakın).

## 14. Profil: önce fark ettir, sonra sor (2026-09-25, Build 27 — YAPILDI)
- Taslak (onaylı): https://claude.ai/artifact/GUZJbvtuaP5w3UVxyFrQMK
- İlk açılış: giriş filmi → 20 sn farkındalık anı (screens/FirstLook.jsx; okurken kırpma sayısı, kamera yoksa kendi sayım;
  dayanak Abusharha 2017, DOI 10.2147/OPTO.S142718) → yaş aralığı → uyarı işaretleri (büyük "Hiçbiri yok"; işaret → sevk).
- Yerinde sorular (lib/profileQuestions.js; manifest `ask.before/after`, App.jsx go): epilepsi Hızlı Bakış'tan önce, gözlük ilk
  okuma testinden önce, yakın zorluk okuma sonrası, son muayene ilk E testi sonrası; ekran/uyku/gece telefonu akşam kontrolü
  kartı (18:00 sonrası, "Sonra" ertesi akşama), PSS 2 madde 7. günden sonra isteğe bağlı ("Geç" bir daha sormaz).
- Her cevaptan sonra "neden sordum" (components/QuestionFlow.jsx, 2 sn). Tek soru, tek ilerleme çubuğu; "Adım/Sayfa" kalktı.
- Cevapların kullanımı: 40+ okuma testinde yakın gözlük ipucu; gözlük → okuma ön seçimi; yakın zorluk → Gelişim okuma kartı;
  uyku/ekran/gece/stres → Jev (yalnız yeni `coachLife` onayıyla; eski onaylılar kartta tek dokunuşla ekler).
- Veri: PROFILE_VERSION 2 (flagsChecked, prompts, firstLook); v1 cevapları aynen taşınır, tarihi olan v1'de flagsChecked doğru.
- Cihazda doğrulanacak: TrueDepth ve web kamerasıyla 20 sn kırpma sayımı; koç sunucusu yeni alanlar için yeniden yayınlanmalı.

## 15. Tek Bakışta (görsel menzil) (2026-09-25, Build 28 — YAPILDI)
- Taslak (onaylı): https://claude.ai/artifact/7iPZhoEQzDkAUctZ7MzPT2. Rakip "Dinamik/Dikey Okuma" yalnızca niyet için okundu.
- Modül: src/modules/tek-bakis (Göz halkası, pratik, göz bütçesi 'eye', ilk turdan önce epilepsi sorusu).
- Yöntem: harf üçlüleri sabitlemenin ±1..6. yuvasında 100 ms (Kwon 2007); 4 seçenek + "Göremedim" (telefon uyarlaması,
  sonuç "yaklaşık"); yuva başına 4 deneme (48 deneme ≈ 2 dk); yuva ≥ %75 doğruysa tanındı (taslaktaki %80 çizgisi 4
  denemeyle ölçülemediği için); süre turdan tura ~%80 doğrulukta tutulur (Yu 2017). lib/span.js.
- Bilim kartları: 8 kart, hepsi PubMed özetinden (Rayner 2016, Legge 2001/2007, Chung 2004, Yu 2010/2017, Lee 2010, Kwon 2007).
- İddia sınırı ekranda: kazanım çevresel görüşte gösterildi; normal okumaya aktarımı ve görmeyi iyileştirdiği gösterilmedi.
- Yol: son 7 günde 3 günden az yapıldıysa 2. bölümde 2 dk; o gün 2. bölüm payı (4 dk) için Yılan düşer. Fark Ettin mi? ile
  dönüşümlü (§16).
- Yapılmadı: TrueDepth ile harf anında göz kaydıysa denemeyi saymama; çevresel mod (sonraki sürüm).

## 16. Fark Ettin mi? (dikkat körlüğü alıştırması) (2026-09-25, Build 29 — YAPILDI; Faz 1)
- Taslak (onaylı): https://claude.ai/artifact/TuUQfFg4SBqkqd8ZPHQWt8. Faz 2 (gün gün aşağı akan yol + puanlama) ayrı taslakla.
- Modül: src/modules/fark-ettin (Dikkat halkası, pratik, göz bütçesi 'eye'). Mantık lib/street.js, çizim lib/streetSvg.js,
  ekran screens/StreetWalk.jsx.
- Yöntem (dikkat körlüğü düzeni; Simons & Chabris 1999): önce bir sayma görevi (mavi araba / taksi / kedi / bisiklet),
  cadde ~40 sn akar, sonra görev sorusu, sonra 3 "fark ettin mi?" sorusu (gülen kadın, sarışın kadın, çocuklu kadın,
  şapkalı adam, satıcı, yeşil tenteli dükkân; her biri 4 seçenek). Her tur tohumdan (seed) üretilir; her seferinde farklı.
  Sorulan kişi/dükkân caddede tektir (yeşil tente tam 1 tane).
- "Fark etmedim, tahmin edeceğim": tahminle doğru bilinen puana katılmaz, ayrı sayılır (Kreitz 2020).
- Puan: görev 1 / ½ (bir fark) / 0; fark ettiklerin x/3. Seviye 1–3 (kişi 14/18/22, süre 40/36/32 sn): üst üste 2 tam
  görev → +1; son görev 0 → −1 (VARSAYIM).
- Bilim kartları: 7 kart, hepsi PubMed özetinden (Simons & Chabris 1999, Drew 2013, Schofield 2015, Kreitz 2020,
  Simons & Jensen 2009, Pandit 2022, Simons 2024).
- İddia sınırı ekranda: "Gerçek hayatta daha çok fark ettirdiği gösterilmedi."
- Yol: son 7 günde 3 günden az yapıldıysa Nefes'ten hemen sonra 2 dk. Tek Bakışta ile aynı gün ikisinden biri çıkar
  (lib/today.js `rotate`): bugün yapılan kalır, yoksa bu hafta az yapılan, eşitse güne göre sırayla. Sebep: ikisi aynı
  gün çıkınca 2. bölüm payında Tek Bakışta hep düşüyordu. O gün Yılan yine düşer.

## 17. Dalga (ses: Sakin / Güç / Motivasyon) (2026-09-25, Build 29 — YAPILDI)
- Taslak (onaylı): https://claude.ai/artifact/Us2DychtDmUtQWsoQJ6ebY. Modül: src/modules/dalga (Yaşam halkası, pratik; günlük yola girmez).
- Mantık lib/dalga.js, beste lib/dalgaMusic.js (saf, olay listesi), ses motoru lib/dalgaAudio.js (WebAudio; dosya yok),
  görsel components/DalgaVisual.jsx, ekran screens/Dalga.jsx.
- Ses: piyano (üst tonlar), gitar (Karplus–Strong), arka ton; Sakin 60 BPM Re majör, her 6. ölçü tam sessiz (Bernardi 2005);
  Güç 72 BPM Do majör yükselen dizi, önce öz-onaylama (değer + bir cümle; cümle kaydedilmez; Zhang 2025); Motivasyon
  116 BPM La minör, ritmik gitar/bas/davul (Terry 2020). Binaural 200/206 Hz yalnız Sakin + kulaklık (Xiong 2025;
  mekanizma tutarsız: Ingendoh 2023). 528 Hz yalnız "Kanıt yok" kartı (Bozok 2026). Tempo/frekans değerleri VARSAYIM.
- Ölçü: önce/sonra 1–10 tek puan. 30 sn'den kısa dinleme kaydedilmez (VARSAYIM).
- Kişisel deney (varsayılan açık): Sakin + kulaklıkta katman ikili bloklarda biri açık biri kapalı; 6 oturumda iki grubun
  ortalama farkı. 1 puandan küçük fark "küçük" (VARSAYIM).
- Güvenlik: yanıp sönme yok (Fisher 2005: 1–65 Hz, en riskli 15–25 Hz); parlaklık yalnız 0,1 Hz nefes hızında; binaural
  fark ekranda 10 kat yavaş. Ekran açık kalsın diye Screen Wake Lock denenir.
- Cihazda doğrulanacak: iPhone sessiz modda WebAudio susuyor mu; Wake Lock WKWebView'da çalışıyor mu; ekran kilitlenince
  ses duruyor mu. Gerekirse yerel AVAudioSession/idleTimer eklentisi (ayrı iş, onayla).

## 18. Yön (kendini tanıma + yazı egzersizleri) (2026-09-25, Build 29 — YAPILDI; 1. adım)
- Taslak (onaylı): https://claude.ai/artifact/3Dwmcz7JF2kB3LmXEyb18y. Kaynak taraması: 4 ajan, PubMed (dil filtresi yok).
- Modül: src/modules/yon (Yaşam halkası, pratik; günlük yola girmez). Mantık lib/yon.js, ekran screens/Yon.jsx.
- Ayna: Öz-Şefkat Ölçeği Kısa Formu (Raes 2011), Türkçe uyarlama (Büyüköksüz 2025). Makalede 12 maddenin yalnız 6'sı
  yayımlandı; şimdilik bu 6 madde. Tam form için ek dosya + ölçek sahibinin izni gerekli. Puanlama VARSAYIM (1–5, sert
  maddeler ters, ortalama). Ayda bir önerilir; norm yok, kişi-içi gidişat.
- Dışarıdan bak: görsel uzaklaşma (6 sn sahne) + adla/"sen" ile yazma; "ben/bana/beni…" sayacı (ek halindeki birinci
  kişi sayılmaz). Öncesi/sonrası rahatsızlık 0–10. Kanıt: Guo 2022 (48 çalışma, g=−0,26; görsel+sözel daha güçlü),
  Kross 2014 (7 çalışma, N=585).
- Şefkatle ele al: bir dosta yazar gibi mektup + tek küçük adım; övgü cümlesi yok. Kanıt: Breines & Chen 2012; Wood 2009.
- Gizlilik: kayıtlarda yalnız sayılar; yazılar yalnız "sakla" işaretlenirse bu cihazda (gozolcum:yon-notes); ad hiç
  saklanmaz; koça gitmez. Kurgusal örnekler kullanıcının anlattığı olaylara benzemez.
- Sonraki adımlar (onayla): kıyaslama eğilimi, saplanıp kalma (yüksekse destek bilgisi), "Şimdi mi, sonra mı?" oyunu,
  WOOP planı, En iyi olası ben, cesaret adımı; ölçek lisansları kontrol edilmeli.
- (Ek, Build 29) Süre 1–90 dk (kaydırıcı + 5/15/30/60/90), varsayılan 5. Uyku modu (yalnız Sakin): puan sorulmaz,
  binaural yok, siyah ekranda soluk saat, müzik 96 sn'lik döngü olarak önceden hazırlanır (OfflineAudioContext,
  22 050 Hz, lib/dalgaSleep.js) ve <audio> ile döngüde çalar; son en çok 3 dk ayrı hazırlanmış kısılan parça.
  Info.plist UIBackgroundModes: audio. Kanıt kartı: Jespersen 2022 (Cochrane; 13 çalışma, 1007 kişi; öznel uyku
  kalitesi orta kesinlikte iyi, nesnel ölçümlerde iyileşme görülmeyebilir). Sessiz modda çalma: navigator.audioSession
  'playback' + sessiz <audio> döngüsü (lib/audioUnmute.js). Cihazda doğrulanacak: sessiz mod, kilitli ekranda çalma,
  sabah puanı (yapılmadı).

## 19. Gökyüzü molası + kaynakça altyapısı (2026-09-26, Build 29 — YAPILDI)
- Taslak (onaylı): https://claude.ai/artifact/C48CLo8P66JNxveWyebNFW. Kaynak taraması: 3 ajan (PubMed, dil filtresi yok).
- Modül: src/modules/gokyuzu (Yaşam halkası, pratik; günlük yola girmez). lib/gokyuzu.js, screens/Gokyuzu.jsx.
- 2 dk (VARSAYIM): önce/sonra dinlenmişlik 0–10; 20 sn'de bir soru, yazılı + sesli (Ses açıksa); bitince ton + titreşim;
  günün saatine göre gökyüzü (sabah/gündüz/akşam/gece; gece soruları yıldız/ay); güneş uyarısı her girişte.
  3 puanlı moladan sonra "kendi verin" (ortalama değişim).
- Dürüstlük: gündüz gerçek gökyüzüne bakmayı doğrudan test eden çalışma yok; mola yakın kanıtlara dayanıyor
  ("Bu işe yarıyor mu?" açılır bölümü bunu yazar). "Bulut izlemek" kartı: Araştırılmamış.
- Kaynakça altyapısı (plan 2. kısım başlangıcı): lib/sources.js (yazarlar, yıl, özgün başlık + Türkçe çeviri, dergi,
  cilt/sayfa, DOI, PMID, çalışma türü ve büyüklüğü), components/Sources.jsx (FactCard + açılır "Kaynaklar (n)").
  8 kaynak PubMed kayıtlarından doğrulandı. Diğer modüller sonraki adımda buna taşınacak.
