# Debug Journal
## Bug: İlk Bakış (FirstLook) — kullanıcı göz kırptı, kırpmalar algılanmadı / yanlış sayıldı
## Başlangıç: 2026-09-27 20:35
## Durum: AÇIK

### Semptomlar
- Kullanıcı (iPhone, TrueDepth) okuma sırasında göz kırptı; sonuç ekranı kırpmaları algılamadı ya da düzgün saymadı.

### İlk Hipotezler
1. [ ] HİP-1: FirstLook sayacı eşiği (blink değeri) TrueDepth blendshape ölçeğine uymuyor / taban ölçümü yanlış
2. [ ] HİP-2: Kamera oturumu okuma başlayınca başlamıyor ya da kareler sayaca ulaşmıyor (onFrame bağlanmıyor)
3. [ ] HİP-3: Kırpma çok hızlı (100–150 ms), kare hızı/UI kısma (100 ms) yüzünden kaçıyor

### Kontrol Logu

#### KONTROL-1
- Ne: src/screens/FirstLook.jsx 56-104 (onFrame, taban, sayaç kurulumu)
- Sonuç: TrueDepth karelerinde closure=(blinkL+blinkR)/2. 2 sn taban: base = median(1-closure); sayaç trueDepthCounter(1-b) = taban kapanma.
  Taban ölçümü okuma sırasında (metin ekranda, kişi aşağı bakıyor).
- Anlam: taban aşağı bakışın göz kapağını içeriyor (yüksek) → eşikler yükselir.

#### KONTROL-2
- Ne: src/lib/gaze.js createBlinkCounter + blinkThresholds (56-122), sabitler 19-24
- Sonuç: sayım için closure ≥ closeAt (max(0.5, base+0.3)), doruk ≥ minPeak (max(0.6, closeAt+0.1)), kapalı süre ≥ minClosedMs=80 ms,
  açılma ≤ openAt (max(0.25, base+0.12)). base 0.45'e kırpılır → closeAt 0.75, minPeak 0.85'e kadar çıkar.
- Anlam: HİP-1 (eşik çok yüksek) ve HİP-3 (80 ms: 30 Hz'de 2 karelik hızlı kırpma reddedilir) ikisi de kodla uyumlu.

#### KONTROL-3
- Ne: ios/App/App/FaceDistancePlugin.swift 13, 201-207
- Sonuç: "face" olayı ~30 Hz (yorum); blinkLeft/Right = ARKit eyeBlink blendshape. Kare hızı cihazda ölçülmedi.
- Anlam: HİP-2 (kareler gelmiyor) için kanıt yok; hook onFrame'i her karede çağırıyor (useFaceTracking.js 60).

### Durum
- Cihaz izi (closure dizisi) YOK → hangi kapının reddettiği kesin değil. VARSAYIM: aşağı bakışta taban 0,3–0,45; hızlı kırpma 2–3 kare, doruk 0,6–0,8.
- Plan: (1) sentetik izle eski sayacın kaçırdığını gösteren test (repro), (2) okumaya dayanıklı sayaç: kayan taban + sıçrama (spike),
  minClosedMs yok, refrakter; (3) dev derlemesinde sonuç ekranına tanı satırı (kare/sn, taban, doruklar) → cihazdan gerçek veri.

#### KONTROL-4 (repro, sentetik 30 Hz iz)
- Sonuç: okurken taban 0.38 → 5 kırpmadan 2 sayıldı (trueDepthCounter). Kaçanlar: 2 karelik hızlı kırpmalar (minClosedMs 80) ve
  doruğu minPeak'in (0.78) altında kalanlar.
- HİP-1 + HİP-3: DOĞRULANDI (sentetik izde; cihaz izi yok — VARSAYIM şekiller)

#### DENEME-1 plan
- lib/blinkCounters.js readingBlinkCounter: kayan taban (yalnız açıkken güncellenen EMA) + sıçrama eşiği (taban+0.2), en kısa süre yok,
  refrakter 250 ms, yavaş iniş (aşağı bakış) sayılmaz. FirstLook bunu kullanır; BlinkExercise eski sayaçta kalır.

#### DENEME-1 sonuç
- readingBlinkCounter + 7 test: okurken 5/5, düz bakış 3/3, yavaş iniş/titreşim 0, titreyen kırpma 1, uzun kapatma sayılmaz, 60 Hz aynı.
- FirstLook bağlandı; dev derlemede tanı satırı. Başarılı mı: SENTETİKTE EVET — cihazda doğrulanmadı (tanı satırından veri beklenecek).
