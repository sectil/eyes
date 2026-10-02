# Ajan 6 — Telefonla ölçüm & göz takibi (özet; PubMed doğrulamalı; developer.apple.com/google blog/arxiv proxy engelli)
## Yakın VA
- Peek Acuity Bastawrous 2015 PMID 26022921 (n=300, TRT ±0.033, ETDRS farkı 0.07 logMAR)
- PeekNV Katibeh 2022 PMID 36583912 (n=483, LoA −0.218/+0.235 logMAR)
- WHOeyes Wu 2024 PMID 38514167 (otomatik mesafe kalibrasyonu, yakın+uzak, TRT QWK>0.85) — en doğrudan emsal
- NIH Toolbox Finley 2025 PMID 39902222 (40-81 yaş, ICC 0.87)
- Steren 2021 PMID 33443550: App Store VA uygulamalarında optotip boyut hatası iPhone %110, iPad %398'e kadar → cihaz ppi kalibrasyonu şart
- Satgunam 2021 PMID 33380619; Ansell 2020 PMID 32999989
## Kontrast
- PeekCS Habtamu 2019 PMID 31579557 (Pelli-Robson r=0.94, LoA ±0.28; fotometre RGB tablosu, parlaklık %100, >900 lux uyarı)
- Kollbaum 2014 PMID 24413274 (iPad ±0.19); K-CS Karampatakis 2024 PMID 38330096
- qCSF iPad Dorr 2013 PMID 24114545; Finn 2023 PMID 37955702 (ICC 0.971); Rosenkranz 2021 PMID 33708068 (25 deneme yeterli)
- 8-bit sınırı: log CS ~2.0 üstü ölçülemez
## Akomodasyon / yakın nokta
- Hofstetter: ort 18.5−0.30×yaş; min 15−0.25×yaş; maks 25−0.40×yaş (Munsamy 2023 PMID 37360289; özgün 1950 doğrulanmadı)
- Yetersizlik eşiği: Hofstetter min −2 D (León 2024 PMID 38350057)
- Push-up tekrarlanabilirliği KÖTÜ: Antona 2008 PMID 18791730 ±4.76 D; Salvador-Roger 2025 PMID 40035338 ±1.8 D; push-up fazla tahmin (Kanclerz 2022 PMID 35328121)
- Kafein genliği 12.4→15.8 D (Abokyi 2017 PMID 27983733) → koşul standardizasyonu
- ARKit TrueDepth mesafe hatası %0.88–9.07 (Nissen 2023 PMID 37177690); MediaPipe Iris 11.7 mm varsayımı, <%10 hata (github dok.)
- Kamera ile yakın nokta ölçümü klinik karşılaştırmalı çalışma YOK → literatür boşluğu
- iPad NPC Linder 2021 PMID 33499531 r=0.893
## Göz takibi
- Valliappan 2020 Nat Commun PMID 32917902: kalibrasyonsuz 1.92 cm, ~30 sn kalibrasyonla 0.46 cm (~0.6–1°), 30 Hz; Tobii'ye yakın
- ARKit lookAtPoint Parker 2022 PMID 35370913: %23 hata, 1.3° kesinlik
- iPad vs EyeLink Koerner 2025 PMID 40781252: sakkad gecikme hatası 2 ms, genlik 0.7°
- Lai 2022 PMID 34529556: n=80, yön hatası tespiti 0.97/0.97
- MediaPipe hazır kurulum zayıf (Drăgoi 2026 PMID 42505547)
- Kamerayla: sakkad yön/gecikme EVET; genlik kısmen; tepe hız/pursuit kazancı HAYIR
## Modül önerisi
1 Yakın VA (40 cm, kamera mesafe kontrolü, adaptif, eşik ≥0.1–0.2 logMAR) 2 Kontrast (tumbling-E, qCSF benzeri, eşik ≥0.3 log) 3 Yakın nokta (push-up+push-down, 3 tekrar, yalnız trend) 4 NPC opsiyonel 5 Sakkad doğrulama (kalibrasyonlu) 6 Pursuit "takip ediyor mu" 7 Ortam kontrolü (parlaklık kilidi, lux, cihaz ppi/RGB tablosu, aynı cihazda karşılaştır)
İlke: kendi test-retest çalışmamız (n≥30, Bland-Altman); öğrenme etkisini ayır; push-up tanı değil
