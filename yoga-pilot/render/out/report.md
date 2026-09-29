# Ders 2 · 15 dk pilot karışımı — ölçüm raporu (v3)

Üretim: `/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/tools/mix.py` · SPEC §6–§7 + v3 eki · 2026-09-29T20:31:17.852719+00:00

## v3: ne değişti (PLAN.v3 §F A adımı; ücretli çağrı yok)

Önceki (v2) karışımlar, raporlar ve araçlar: `out/_onceki_v2/`. Dosya adları aynı. A/B eşlemesi değişmedi.

| Dosya | Eşik altı parça (< 15 dB, < 1 sn dahil) v2 → v3 | En düşük fark, bütün parçalar (dB) v2 → v3 | En düşük fark, ≥ 1 sn (dB) v2 → v3 | LUFS v2 → v3 | Gerçek tepe dBTP v2 → v3 | Karışım sınırlayıcısı en çok dB v2 → v3 | Konum denetimi en düşük ilinti v2 → v3 | Yerel yatak kısması |
|---|---|---|---|---|---|---|---|---|
| ders2-15dk-nes-A | 0 → 0 | 15.3 → 16.6 | 16.6 → 16.6 | -17.39 → -17.33 | -2.76 → -2.56 | 0.0 → 0.0 | 0.984 → 0.983 | yok |
| ders2-15dk-nes-B | 1 → 0 | 14.75 → 16.27 | 16.27 → 16.27 | -17.81 → -17.74 | -2.97 → -3.03 | 0.0 → 0.0 | 0.977 → 0.98 | yok |
| ders2-15dk-hak-A | 8 → 0 | 13.69 → 15.49 | 16.75 → 16.75 | -17.65 → -17.51 | -1.83 → -1.67 | 0.88 → 0.83 | 0.97 → 0.963 | c1.l19 −0.86 dB (275.35–281.18 sn) |
| ders2-15dk-hak-B | 9 → 0 | 13.03 → 15.34 | 16.43 → 16.43 | -18.1 → -18.0 | -1.62 → -1.77 | 0.91 → 0.92 | 0.962 → 0.948 | c1.l19 −0.86 dB (275.35–281.18 sn) |

- ders2-15dk-nes-B v2 eşik altı: c1.l08 (0.91 sn, 14.75 dB)
- ders2-15dk-hak-A v2 eşik altı: c1.s09 (0.8 sn, 14.12 dB), c1.s19 (0.81 sn, 14.47 dB), c1.l09 (0.83 sn, 13.69 dB), c1.l12 (0.91 sn, 14.08 dB), c1.l19 (0.82 sn, 14.6 dB), c1.f02 (0.71 sn, 14.74 dB), c1.f20 (0.89 sn, 14.88 dB), c2.n10 (0.61 sn, 14.39 dB)
- ders2-15dk-hak-B v2 eşik altı: c1.s08 (0.8 sn, 14.54 dB), c1.s12 (0.91 sn, 14.3 dB), c1.s17 (0.9 sn, 14.68 dB), c1.l09 (0.83 sn, 13.03 dB), c1.l12 (0.91 sn, 13.69 dB), c1.l19 (0.82 sn, 13.98 dB), c1.f02 (0.71 sn, 14.1 dB), c1.f20 (0.89 sn, 14.73 dB), c2.n10 (0.61 sn, 14.1 dB)

**Parçalar** (`tools/reprocess_v3.py`, `sel/<ses>/reprocess-v3.json`):
- nes: 158 parçadan 29 parça değişti (öteki 129 parça v2 ile örnek örnek aynı); yumuşak tepe sıkıştırma 2 parçada; < 1 sn parça 28; kısa parçada hedefi sınırla inen 0 (—); sınırlayıcı > 3 dB: v2 0 parça → v3 0 (—)
- hak: 158 parçadan 141 parça değişti (öteki 17 parça v2 ile örnek örnek aynı); yumuşak tepe sıkıştırma 132 parçada; < 1 sn parça 37; kısa parçada hedefi sınırla inen 10 (c1.l08, c1.l09, c1.l12, c1.l19, c1.s08, c1.s12, c1.s19, c2.n01, c2.n04, c2.n09); sınırlayıcı > 3 dB: v2 56 parça → v3 2 (c1.f15, c1.l20)

**Neden bu yöntem:** kısa parçaların eşik altında kalmasının nedeni tepe değil düzey ölçüsüydü. Pilot kısa parçaları RMS ile eşitlemişti ve bu parçalar LUFS'te uzun kliplerin 0–4,6 dB altında kalmıştı. v3 kısa parçayı uzun kliplerle aynı ölçüye (−18 LUFS, BS.1770) getirir; karışım denetimi de bu ölçüyü kullanır ve bir dizideki sözcükler aynı yükseklikte olur. Hakan'ın sesinde tepe/yükseklik oranı yüksektir (≈ 21 dB). Bu yüzden düzey yükselince tepe yönetimi gerekti. Yalnız sınırlayıcı kullanılsaydı sözcük başında hızlı kazanç düşüşleri olurdu. Yerine klip düzeyinde yumuşak dizli sıkıştırma kullanıldı: 10 ms atak, kazanç bir perde süresinden yavaş değişir, en çok 6 dB. Kalan tepeyi (Hakan'da ortanca ≈ 1 dB) sınırlayıcı alır. Klip başına bozulma göstergesi daha iyi olan zincir seçildi. Kısa tek sözcükte sınırlayıcı payı 3 dB'i aşacaksa düzey en çok 3 dB indi; kalan açık, yalnız o parçanın çevresinde yatağın kısılmasıyla (≤ 1 dB/sn) kapandı. Denenip bırakılan: sabit RMS ofseti (fark parçadan parçaya değişiyor) ve tüm-geçiren faz döndürme (Hakan'da ortanca 0,9 dB, bazı kliplerde kötüleşme). Tepe kırpma kullanılmadı.

**Scribe yazım istisnaları** (SPEC v3.2, `render/scribe_istisnalari.md`, onay bekliyor): seçim dosyalarındaki 166 Scribe denemesinden eski kuralla 134, v3 istisnalarıyla 166 deneme eşleşiyor. İstisnayla eş olanlar: hak a.durus (birleşik: sırtüstü); hak c2.yer (ek-fiil: nefesteyse); hak car.sol1 (birleşik: başparmağı); hak k.yan (birleşik: sırtüstü); nes a.durus (birleşik: sırtüstü); nes c2.yer (ek-fiil: nefesteyse); nes k.yan (birleşik: sırtüstü).

**Geçmeyen ölçüt:** ders2-15dk-hak-B `every_piece_found_at_its_time_in_mp3`.
- ders2-15dk-hak-B: konum denetiminde en düşük ilinti 0.948 (c1.l10), SPEC v3.5 VARSAYIM eşiği 0,95. En büyük kayma 0.05 ms (eşik 1 ms), yani parça yerinde. Aynı parça v2'de 0,962 idi. v3'te 2 dB alçak (v2'de komşularından 2 dB yüksekti). Parçada ıslıklı /s/ baskın; en iyi hizadan 2 örnek kayınca ilinti 0,47'ye iniyor. Düşüklüğün kaynağı MP3'ün gürültü benzeri yüksek frekansı dalga biçimiyle korumaması; yer hatası değil (ölçüm; `_v3work` tanısı). Eşik değiştirilmedi; karar orkestratörün ya da sahibin.

**SPEC:** "v3 eki" eklendi (kesim kuralı, Scribe istisnaları, kısa parça ve tepe yönetimi, sıkı eşik, parça konum denetimi). Eski maddeler yerinde.

Kör dinleme: A/B eşlemesi `out/_ab_key.json` ve kaynak ayrıntıları `out/_ab_details.json` içinde; bu rapor kaynak adı içermez.

## Plan (ölçülen sürelerle, T = 900 sn, sahne orman)

| Ses | Durum | Esneme | Toplam sn | Konuşma sn | Olay / parça | Bloklar | Duruş | check_plan |
|---|---|---|---|---|---|---|---|---|
| nes | ok | pref→max f=0.1131 | 900.0 | 286.448 | 110 / 127 | N1 C1 C2 N2 C4 | [285, 'c2.durak', 'sığmadı'] | GEÇTİ (0 hata) |
| hak | ok | pref→max f=0.0456 | 900.0 | 278.826 | 111 / 129 | N1 C1 C2 N2 C4 | [290, 'butun', 'sığmadı'] | GEÇTİ (0 hata) |

- nes yoğunluk: 60 sn en çok 119.0 hece, konuşma payı 0.47; Derin 96.883 hece / 0.346; ortalama 81.867 hece/dk; eksik birim: yok
- hak yoğunluk: 60 sn en çok 125.96 hece, konuşma payı 0.454; Derin 99.0 hece / 0.336; ortalama 83.8 hece/dk; eksik birim: yok

## Karışımlar

| Dosya | Süre sn | Boyut MB | Kodlama | Bütünleşik LUFS | Gerçek tepe dBTP (sınırlayıcı öncesi) | 10 kHz üstü ani olay: kurgu / yalnız karışım / yatak içeriği / söz içeriği | En uzun dijital sessizlik |
|---|---|---|---|---|---|---|---|
| ders2-15dk-nes-A.mp3 | 900.049 | 12.61 | ABR 120 kbit/s (112.1 kbit/s) | -17.33 | -2.56 (-2.1) | 0 / 0 / 0 / 85 | 0.0264 sn |
| ders2-15dk-nes-B.mp3 | 900.049 | 12.39 | ABR 120 kbit/s (110.1 kbit/s) | -17.74 | -3.03 (-2.56) | 0 / 0 / 0 / 95 | 0.0264 sn |
| ders2-15dk-hak-A.mp3 | 900.049 | 12.81 | ABR 120 kbit/s (113.9 kbit/s) | -17.51 | -1.67 (-1.17) | 0 / 0 / 0 / 77 | 0.0264 sn |
| ders2-15dk-hak-B.mp3 | 900.049 | 12.58 | ABR 120 kbit/s (111.8 kbit/s) | -18.0 | -1.77 (-1.08) | 0 / 0 / 0 / 72 | 0.0264 sn |

Tık sınıfları (MP3, kodlayıcı gecikmesi 1105 örnek düzeltilerek; olayın 2 ms karesindeki 10 kHz üstü enerjinin kaynağına göre): "söz içeriği" = enerjiyi konuşma izi taşıyor (seçilmiş çekimin kendi ünsüz başlangıcı; parçalar SPEC §4.1 tık denetiminden geçti); "yatak içeriği" = müzik/doğa izi taşıyor; "kurgu" = kurgu noktasında ±10 ms ve konuşma taşımıyor (karışımdan kuşkulu); "yalnız karışım" = hiçbir iz taşımıyor.

- ders2-15dk-nes-A: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0], [358.911, None, -53.7, -240.0, -53.7]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok
- ders2-15dk-nes-B: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0], [358.911, None, -53.7, -240.0, -53.7]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok
- ders2-15dk-hak-A: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok
- ders2-15dk-hak-B: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok

Konum denetimi (ölçüm; MP3 orta kanalında her parçanın dalga biçimi ±50 ms içinde aranır): ders2-15dk-nes-A 127 parça, en düşük ilinti 0.983 (c2.n08), ortanca 0.991, en büyük kayma 0.05 ms; ders2-15dk-nes-B 127 parça, en düşük ilinti 0.98 (c2.n08), ortanca 0.99, en büyük kayma 0.05 ms; ders2-15dk-hak-A 129 parça, en düşük ilinti 0.963 (c1.l10), ortanca 0.986, en büyük kayma 0.05 ms; ders2-15dk-hak-B 129 parça, en düşük ilinti 0.948 (c1.l10), ortanca 0.985, en büyük kayma 0.05 ms

Gerçek tepe sınırlayıcı (stereo bağlı, tavan −2 dBTP): ders2-15dk-nes-A en çok 0.0 dB, > 0,5 dB 0.0 sn; ders2-15dk-nes-B en çok 0.0 dB, > 0,5 dB 0.0 sn; ders2-15dk-hak-A en çok 0.83 dB, > 0,5 dB 0.365 sn; ders2-15dk-hak-B en çok 0.92 dB, > 0,5 dB 0.266 sn

### Konuşma / yatak (3 sn ST yatak; ≥ 1 sn parçalar; en az / p10 / ortanca dB; eşik ≥ 15)

| Dosya | Varış | Derinleşme | Derin | Kapanış | Bütün parçalar (en az; < 15 sayısı) | Yatak ofseti (dB, evre) |
|---|---|---|---|---|---|---|
| ders2-15dk-nes-A | 17.31 / 17.34 / 17.49 GEÇTİ | 16.91 / 17.25 / 17.82 GEÇTİ | 16.6 / 17.01 / 18.07 GEÇTİ | 16.96 / 17.1 / 17.84 GEÇTİ | Var 17.31 (0); Der 16.91 (0); Der 16.6 (0); Kap 16.96 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |
| ders2-15dk-nes-B | 16.85 / 16.89 / 17.14 GEÇTİ | 16.74 / 16.99 / 17.5 GEÇTİ | 16.43 / 16.78 / 17.42 GEÇTİ | 16.27 / 16.81 / 17.22 GEÇTİ | Var 16.85 (0); Der 16.74 (0); Der 16.43 (0); Kap 16.27 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |
| ders2-15dk-hak-A | 17.47 / 17.5 / 17.63 GEÇTİ | 17.08 / 17.35 / 17.74 GEÇTİ | 16.75 / 17.38 / 18.0 GEÇTİ | 17.1 / 17.24 / 17.77 GEÇTİ | Var 17.47 (0); Der 16.13 (0); Der 15.49 (0); Kap 17.1 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |
| ders2-15dk-hak-B | 16.88 / 16.91 / 17.39 GEÇTİ | 16.43 / 16.92 / 17.6 GEÇTİ | 16.58 / 16.91 / 17.42 GEÇTİ | 16.47 / 16.8 / 17.89 GEÇTİ | Var 16.88 (0); Der 15.34 (0); Der 15.85 (0); Kap 16.47 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |

### Konuşma / yatak, 3 sn ST iki izde (pencerenin ≥ %90'ı konuşma parçası)

| Dosya | Evre: ortanca / en az dB (en az an, parça) / < 15 pencere payı |
|---|---|
| ders2-15dk-nes-A | Varış 17.72 / 14.94 (12.7 sn, a.acilis) / %0.6; Derinleşme 17.41 / 14.83 (337.8 sn, c1.k1) / %1.0; Derin 17.54 / 15.53 (530.7 sn, br.k2) / %0.0; Kapanış 17.85 / 15.23 (813.2 sn, k.oda.ayrinti) / %0.0 |
| ders2-15dk-nes-B | Varış 18.25 / 15.61 (12.7 sn, a.acilis) / %0.0; Derinleşme 17.34 / 14.86 (337.8 sn, c1.k1) / %1.0; Derin 17.75 / 15.17 (738.4 sn, n2.dilek) / %0.0; Kapanış 17.93 / 15.95 (858.1 sn, k.otur) / %0.0 |
| ders2-15dk-hak-A | Varış 17.51 / 12.48 (12.0 sn, a.acilis) / %6.4; Derinleşme 17.29 / 14.6 (109.4 sn, n1.sec#2) / %5.1; Derin 17.48 / 15.23 (520.4 sn, c2.kal) / %0.0; Kapanış 17.77 / 15.02 (859.3 sn, k.otur) / %0.0 |
| ders2-15dk-hak-B | Varış 17.84 / 12.85 (12.0 sn, a.acilis) / %6.4; Derinleşme 17.33 / 15.1 (109.6 sn, n1.sec#2) / %0.0; Derin 17.6 / 15.19 (722.2 sn, n2.hatirla#2) / %0.0; Kapanış 17.86 / 15.26 (827.2 sn, k.zaman) / %0.0 |

3 sn ST penceresi cümle içi duraklamayı ve parça kuyruğunu da içerdiğinden söz ST değeri parçanın kendi düzeyinin 3–5 dB altına inebilir; en az değerler bu pencerelerdir. Sıkı eşik (SPEC v3.4, < 1 sn parçalar dahil her parça ≥ 15 dB; v3'te kısa parçalar da LUFS ile eşitlendi) altında kalanlar:
- ders2-15dk-nes-A: yok
- ders2-15dk-nes-B: yok
- ders2-15dk-hak-A: yok
- ders2-15dk-hak-B: yok

### Yükseklik artışı (3 sn ST, 1 sn adım; SPEC/qa ≤ 1 dB/sn pencerelerde — bu planda duyurulu pencere yok)

| Dosya | Yatak izi en çok dB/sn (sn) | Tınısız yatak en çok (sn) / > 1 dB/sn adım | Yalnız müzik en çok (sn) / > 1 dB/sn adım | Dönüş tınısı (sn) |
|---|---|---|---|---|
| ders2-15dk-nes-A | 6.78 (751.5) | 2.95 (1.5) / 35 | 4.75 (1.5) / 36 | [753.018] |
| ders2-15dk-nes-B | 6.82 (239.2) | 6.82 (239.2) / 1227 | 11.05 (22.5) / 1324 | [753.018] |
| ders2-15dk-hak-A | 6.53 (755.3) | 2.96 (1.5) / 50 | 4.75 (1.5) / 52 | [756.801] |
| ders2-15dk-hak-B | 6.82 (239.2) | 6.82 (239.2) / 1220 | 11.35 (766.5) / 1318 | [756.801] |

### Doku değişimleri (8 sn; başlangıç = ipucu klibinin ilk sözü; pencerede konuşma payı)

- ders2-15dk-nes-A: yatak geçişi 105.254–113.254 sn (0.87); yatak geçişi 346.575–354.575 sn (0.77); yatak geçişi 571.108–579.108 sn (0.43); yatak geçişi 755.018–763.018 sn (0.52); imge katmanı girişi 571.108–579.108 sn (0.43); imge katmanı çıkışı 687.134–695.134 sn (0.68)
- ders2-15dk-nes-B: yatak geçişi 105.254–113.254 sn (0.87); yatak geçişi 346.575–354.575 sn (0.77); yatak geçişi 755.018–763.018 sn (0.52); imge katmanı girişi 571.108–579.108 sn (0.43); imge katmanı çıkışı 687.134–695.134 sn (0.68)
- ders2-15dk-hak-A: yatak geçişi 102.164–110.164 sn (0.87); yatak geçişi 337.478–345.478 sn (0.77); yatak geçişi 559.89–567.89 sn (0.55); yatak geçişi 758.801–766.801 sn (0.51); imge katmanı girişi 579.214–587.214 sn (0.41); imge katmanı çıkışı 692.504–700.504 sn (0.64)
- ders2-15dk-hak-B: yatak geçişi 102.164–110.164 sn (0.87); yatak geçişi 337.478–345.478 sn (0.77); yatak geçişi 758.801–766.801 sn (0.51); imge katmanı girişi 579.214–587.214 sn (0.41); imge katmanı çıkışı 692.504–700.504 sn (0.64)

### Evre başına ölçülen yatak (3 sn ST ortancası, LUFS)

| Dosya | Varış | Derinleşme | Derin | Kapanış |
|---|---|---|---|---|
| ders2-15dk-nes-A | toplam -32.88, müzik -33.34, doğa -43.69 | toplam -34.4, müzik -34.78, doğa -45.58 | toplam -36.14, müzik -36.6, doğa -46.89 | toplam -32.88, müzik -33.32, doğa -43.46 |
| ders2-15dk-nes-B | toplam -33.04, müzik -33.51, doğa -43.69 | toplam -34.46, müzik -34.96, doğa -45.58 | toplam -36.08, müzik -36.54, doğa -46.89 | toplam -33.02, müzik -33.57, doğa -43.46 |
| ders2-15dk-hak-A | toplam -32.88, müzik -33.34, doğa -43.68 | toplam -34.38, müzik -34.8, doğa -45.62 | toplam -36.15, müzik -36.62, doğa -46.9 | toplam -32.87, müzik -33.31, doğa -43.46 |
| ders2-15dk-hak-B | toplam -32.96, müzik -33.46, doğa -43.68 | toplam -34.45, müzik -34.96, doğa -45.62 | toplam -36.08, müzik -36.54, doğa -46.9 | toplam -33.03, müzik -33.58, doğa -43.46 |

## SPEC §7 bitti ölçütleri

| Ölçüt | ders2-15dk-nes-A | ders2-15dk-nes-B | ders2-15dk-hak-A | ders2-15dk-hak-B |
|---|---|---|---|---|
| duration_900pm1 | True | True | True | True |
| order_as_plan | True | True | True | True |
| every_piece_found_at_its_time_in_mp3 | True | True | True | False |
| no_missing_or_duplicate_by_construction | True | True | True | True |
| full_mix_scribe_alignment | None | None | None | None |
| screen_equals_spoken | True | True | True | True |
| no_edit_point_clicks_mp3 | True | True | True | True |
| no_mix_only_clicks_mp3 | True | True | True | True |
| no_digital_silence_ge_100ms_mp3 | True | True | True | True |
| speech_over_bed_ge15_pieces_ge_1s | True | True | True | True |
| speech_over_bed_ge15_all_pieces_v3 | True | True | True | True |
| true_peak_le_minus1 | True | True | True | True |
| integrated_lufs | -17.33 | -17.74 | -17.51 | -18.0 |
| size_le_14MB | True | True | True | True |
| mp3_44k1_stereo | True | True | True | True |

`full_mix_scribe_alignment = None`: yapılmadı (aşağıda "Doğrulanmayanlar").

## Maliyet (defter)

- Toplam 1144.46 sent (11.44 $), 400 satır; konuşma kovası 520.83 / 550 sent; müzik + doğa + tını kovası 623.63 / 900 sent; bu adımda ücretli çağrı: 0.
- Türe göre: music 441.72, scribe-music 174.4, scribe-speech 81.61, sfx 7.51, speech 439.22, voice-design 0.0

## Seçim bayrakları

- **nes**: sayılar {'kulak': 4, 'kesim-kulak': 32, 'kulak-sinirlayici': 0, 'eklem>2yt': 13, 'other': 2, 'kulak-sinirlayici_v2_girdi': 0, 'kulak-sinirlayici_v2_parca': 0}
  - kulak: a.durus — Scribe on all 5 takes (t1,t2 + re-take t4,t5,t6) returns 'Sırt üstü' vs tts 'Sırtüstü' (compound written apart by Scribe; only difference); single re-take used; best-ranked take t4 kept
  - kulak: n1.sec — all 6 takes (t1-t3 + re-take t4-t6): longest pause is the colon pause after 'önerim şu:' (0.55-0.56 s) not the sentence end, so the SPEC §3 longest-pause cut splits the wrong place (piece 2 would read
  - kulak: n2.hatirla — no take passes SPEC 4.3 with the SPEC 3 cut rule: in all 3 original takes and all 3 re-takes the longest pause is after "şunu:" (inside sentence 2), so the longest-gap cut splits "... yeterli. Ya da y
  - kulak: k.yan — Scribe wrote "Sırt üstü" (2 words) for "Sırtüstü" in all 6 takes (3 original + 3 re-take) -> word sequence not identical under SPEC 4.2 normalization. Every other word matched; likely Scribe orthograp
  - kesim-kural-sapmasi: n1.sec — delivered pieces n1.sec#1/#2 are cut at the sentence-end pause (gap 2.699-3.168 s, 0.469 s; boundary_misalign 0.015, rates 5.70/5.49 syll/s) chosen by SPEC §4.3(c) metrics instead of the longest pause
  - kesim-kuraldisi: n2.hatirla — DEVIATION needing owner/orchestrator approval: pieces cut at the sentence-boundary gap 3.791-4.255 s (2nd-longest pause, cut 4.0229 s, misalign 0.023, rates 5.04/5.52) instead of the longest gap 5.318
  - kesim-kulak (kesim yalnız ölçüyle denetlendi): 32 birim
  - eklem > 2 yt (taşıyıcı eklemi): car.butun, car.on1, car.on2, car.on3, car.sag1, car.sag2, car.sag3, car.sag4, car.sirt, car.sol1, car.sol2, car.sol3, car.sol4
- **hak**: sayılar {'kulak': 3, 'kesim-kulak': 32, 'kulak-sinirlayici': 2, 'eklem>2yt': 13, 'other': 0, 'kulak-sinirlayici_v2_girdi': 40, 'kulak-sinirlayici_v2_parca': 56}
  - kulak: a.durus — SPEC §4.2: no take matched Scribe word-for-word after the single re-take; best-ranked take over all 6 takes kept; diffs: t1: Sırt üstü ya da yan yatıp zemine yerleşmen yeterli; t2: Sırt üstü ya da yan
  - kulak: c2.yer — SPEC §4.2: no take matched Scribe word-for-word after the single re-take; best-ranked take over all 6 takes kept; diffs: t1: Dikkatin nefeste ise onu en net fark ettiğin yeri bulabilirsin. Burun, göğü
  - kulak: k.yan — 
  - kulak-sinirlayici (v3 parçaları, > 3 dB tepe sınırlama): car.sol4/c1.l20, car.on3/c1.f15
  - kesim-kulak (kesim yalnız ölçüyle denetlendi): 32 birim
  - eklem > 2 yt (taşıyıcı eklemi): car.butun, car.on1, car.on2, car.on3, car.sag1, car.sag2, car.sag3, car.sag4, car.sirt, car.sol1, car.sol2, car.sol3, car.sol4

## Kararlar ve varsayımlar

- Konuşma: mono parça (−18 LUFS klip) iki kanala birim kazançla kondu — uygulama motorunun çalışıyla aynı. Stereo BS.1770 ölçümünde çift mono +3,01 dB sayılır: Varış/Kapanış sözü ≈ −15 LUFS, yatak ≈ −33 LUFS. Konuşma/yatak farkı iki iz aynı (stereo) ölçümle hesaplanır; klip-LUFS (mono) − yatak-LUFS (stereo) okumasıyla fark 3 dB daha azdır (tasarımdaki 15 dB).
- Gerçek tepe: kodlamadan önce stereo bağlı gerçek tepe sınırlayıcı (tavan −2,0 dBTP; MP3 sonrası > −1 dBTP ise −2,5 / −3,0).
- Yatak düzeyi: müzik + doğa toplamı music.duckedBedLufs; müzik = hedef − 0,41 dB, doğa = müzik − 10 dB (SPEC §6 VARSAYIM, PLAN D.4 "toplam aşmaz").
- Konuşma/yatak ≥ 15 dB (≥ 1 sn parçalar, parçanın bütünleşik yüksekliği − parça boyunca yatak 3 sn ST en yükseği) tutmayan evrede yatak evrece indirilir; A ve B için ORTAK ofset (kör karşılaştırmada yükseklik eşleşsin).
- Evre düzeyi değişimi: azalan düzey yeni evrenin ilk sözünden önceki sessizlikte (≤ 8 sn), artan düzey ilk sözle başlayıp 8 sn.
- Doku geçişleri (8 sn eşit güç, ilinti dengeli yasa) ipucu klibinin başında; aile içi geçiş (tek dosya yetmezse) blok/parça başında, geçiş penceresinde konuşma payı en yüksek nokta.
- Kapanış yatağının doğal sonu ders sonuna oturtuldu (iki kaynakta aynı kural).
- İmge katmanı yatağın 8 dB altında (bütünleşik LUFS, VARSAYIM); imge boyunca yatak −0,64 dB (toplam evre hedefinde).
- Dönüş tınısı: yerel sentez D5 (common/donus.synth-D5.wav; ElevenLabs sfx tınısı "kaba", F5 ve FAIL-soft olduğu için), bütünleşik −30 LUFS (VARSAYIM); returnTone ipucu olan her klipten 2 sn önce (planda yalnız k.donus).
- Yatak EQ (PLAN D.3 son işlem): 150 Hz 2. derece yüksek geçiren + 2449 Hz −3 dB çukur (1,5–4 kHz), iki kaynağa aynı
- Oda sesi: iki 30 sn döngü, −58 dBFS RMS, 2 sn geçiş, 0–900 sn hep; doğa: dört orman döngüsü rastgele sıra + döndürme, 4 sn geçiş; sıra tohumu 20260929, dört karışımda aynı.
- Açılış 3 sn (PLAN D.4), son 5 sn yumuşak kapanış (music.endFadeSec; müzik + doğa).
- Pencere kabarması kodda var (≥ 20 sn duyurulu pencere, +6 dB, 6 sn rampa, sonraki sözden 8 sn önce iner) ama 15 dk planında duyurulu pencere yok → etkin değil.
- k.goz "chord" ipucu için ayrı bir akor olayı üretilmedi (SPEC §6 tanımlamıyor; varlık yok).
- MP3: lameenc; önce VBR V2, 14 MB aşılırsa ABR 120 / CBR 112; 16 bit TPDF titreşim.

## Doğrulanmayanlar

- SPEC §7 "tam karışımın Scribe metni plan metniyle hizalanır": YAPILMADI; SPEC v3.5 ile yerine parça konum denetimi (ilinti ≥ 0,95, kayma ≤ 1 ms) kondu. Pilottaki gerekçe: (1) Yerel dosya yükleme aracı bu oturumda yok (seçim ajanları da doğruladı: creative_attach_reference_file yalnız herkese açık https URL alır); (2) 4 × 900 sn Scribe ≈ 4 × 90 = 360 sent (gözlenen 0,1 sent/sn) ve konuşma kovasında kalan pay ≈ 29.2 sent (tavan 550) — tavan aşılırdı. Yerine: karışım planın olay listesinden kuruldu; zaman çizelgesinin sırası, metni ve parça sayısı planla birebir karşılaştırıldı (order_check); her parça, birim düzeyinde Scribe ile doğrulanmış çekimden gelir (selection-*.json).
- Kulakla dinleme yapılmadı; bütün ifadeler ölçümdür.
- Parça kesimleri yalnız ölçüyle denetlendi (SPEC §4.3 c; "kesim-kulak" bayrakları seçim dosyalarında).
- v3 tepe yönetimi ve kısa parça düzeyinin kulağa doğal gelip gelmediği ölçülemez; bozulma göstergesi (fast_sdr_db) yalnız perde içi hızlı kazanç kıpırtısını sayar. Yeniden işlenen parçalar kulak listesinde (out/kulak_listesi.md).
- v3 Scribe istisnaları Türkçe editör onayı bekliyor (render/scribe_istisnalari.md).

## Kulak listesi

- nes a.durus: "kulak" bayrağı (seçim) — Scribe on all 5 takes (t1,t2 + re-take t4,t5,t6) returns 'Sırt üstü' vs tts 'Sırtüstü' (compound written apart by Scribe; only difference); single re-take used; best-ranked take t4 kept
- nes n1.sec: "kulak" bayrağı (seçim) — all 6 takes (t1-t3 + re-take t4-t6): longest pause is the colon pause after 'önerim şu:' (0.55-0.56 s) not the sentence end, so the SPEC §3 longest-pause cut splits the wrong place (piece 2 would read
- nes n2.hatirla: "kulak" bayrağı (seçim) — no take passes SPEC 4.3 with the SPEC 3 cut rule: in all 3 original takes and all 3 re-takes the longest pause is after "şunu:" (inside sentence 2), so the longest-gap cut splits "... yeterli. Ya da y
- nes k.yan: "kulak" bayrağı (seçim) — Scribe wrote "Sırt üstü" (2 words) for "Sırtüstü" in all 6 takes (3 original + 3 re-take) -> word sequence not identical under SPEC 4.2 normalization. Every other word matched; likely Scribe orthograp
- nes n1.sec: kesim-kural-sapmasi — delivered pieces n1.sec#1/#2 are cut at the sentence-end pause (gap 2.699-3.168 s, 0.469 s; boundary_misalign 0.015, rates 5.70/5.49 syll/s) chosen by SPEC §4.3
- nes n2.hatirla: kesim-kuraldisi — DEVIATION needing owner/orchestrator approval: pieces cut at the sentence-boundary gap 3.791-4.255 s (2nd-longest pause, cut 4.0229 s, misalign 0.023, rates 5.0
- hak a.durus: "kulak" bayrağı (seçim) — SPEC §4.2: no take matched Scribe word-for-word after the single re-take; best-ranked take over all 6 takes kept; diffs: t1: Sırt üstü ya da yan yatıp zemine yerleşmen yeterli; t2: Sırt üstü ya da yan
- hak c2.yer: "kulak" bayrağı (seçim) — SPEC §4.2: no take matched Scribe word-for-word after the single re-take; best-ranked take over all 6 takes kept; diffs: t1: Dikkatin nefeste ise onu en net fark ettiğin yeri bulabilirsin. Burun, göğü
- hak k.yan: "kulak" bayrağı (seçim) — gerekçe seçim dosyasında yok
- Ayrıntılı, zamanlı kulak listesi: out/kulak_listesi.md (kesimler, Scribe istisnasıyla eşleşen klipler, v3 kısa parça ve tepe düzeltmeleri, yerel yatak kısmaları)
- v3: gerçek tepe sınırlayıcısı hâlâ > 3 dB kısan parçalar: nes yok; hak c1.l20, c1.f15
- Dönüş tınısı seçimi (sentez D5 / ElevenLabs sfx) ve düzeyi
- İmge katmanının düzeyi (−8 dB) ve tınısı; doğa düzeyi (−10 dB); orman-2 yinelenen esinti
- A/B kaynak ayrıntıları (_ab_details.json) — dinlemeden sonra açılır

## Orkestratör notu (v3 sonrası)
hak-B c1.l10 konum ilintisi 0,948 < 0,95: kayma 0,05 ms, parça yerinde; düşüklük MP3'ün /s/ bandından. Karar: ölçüt
bundan sonra 4 kHz altına süzülmüş sinyalde hesaplanır (SPEC v3.6). Bu karışım için ölçüt kayma ölçümüyle geçmiş sayılır.
