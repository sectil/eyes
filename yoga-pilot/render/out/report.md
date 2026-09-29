# Ders 2 · 15 dk pilot karışımı — ölçüm raporu

Üretim: `/tmp/claude-0/-home-user/f143c393-27b3-538e-ba8a-5352290c6308/scratchpad/yoga/render/tools/mix.py` · SPEC §6–§7 · 2026-09-29T14:01:57.543828+00:00

Kör dinleme: A/B eşlemesi `out/_ab_key.json` ve kaynak ayrıntıları `out/_ab_details.json` içinde; bu rapor kaynak adı içermez.

## Plan (ölçülen sürelerle, T = 900 sn, sahne orman)

| Ses | Durum | Esneme | Toplam sn | Konuşma sn | Olay / parça | Bloklar | Duruş | check_plan |
|---|---|---|---|---|---|---|---|---|
| nes | ok | pref→max f=0.1132 | 900.0 | 286.364 | 110 / 127 | N1 C1 C2 N2 C4 | [285, 'c2.durak', 'sığmadı'] | GEÇTİ (0 hata) |
| hak | ok | pref→max f=0.0456 | 900.0 | 278.429 | 111 / 129 | N1 C1 C2 N2 C4 | [290, 'butun', 'sığmadı'] | GEÇTİ (0 hata) |

- nes yoğunluk: 60 sn en çok 119.0 hece, konuşma payı 0.47; Derin 96.83 hece / 0.346; ortalama 81.867 hece/dk; eksik birim: yok
- hak yoğunluk: 60 sn en çok 125.962 hece, konuşma payı 0.454; Derin 99.0 hece / 0.336; ortalama 83.8 hece/dk; eksik birim: yok

## Karışımlar

| Dosya | Süre sn | Boyut MB | Kodlama | Bütünleşik LUFS | Gerçek tepe dBTP (sınırlayıcı öncesi) | 10 kHz üstü ani olay: kurgu / yalnız karışım / yatak içeriği / söz içeriği | En uzun dijital sessizlik |
|---|---|---|---|---|---|---|---|
| ders2-15dk-nes-A.mp3 | 900.049 | 12.61 | ABR 120 kbit/s (112.1 kbit/s) | -17.39 | -2.76 (-2.22) | 0 / 0 / 0 / 90 | 0.0264 sn |
| ders2-15dk-nes-B.mp3 | 900.049 | 12.38 | ABR 120 kbit/s (110.1 kbit/s) | -17.81 | -2.97 (-2.51) | 0 / 0 / 0 / 89 | 0.0264 sn |
| ders2-15dk-hak-A.mp3 | 900.049 | 12.80 | ABR 120 kbit/s (113.8 kbit/s) | -17.65 | -1.83 (-1.12) | 0 / 0 / 0 / 70 | 0.0264 sn |
| ders2-15dk-hak-B.mp3 | 900.049 | 12.57 | ABR 120 kbit/s (111.7 kbit/s) | -18.1 | -1.62 (-1.09) | 0 / 0 / 0 / 76 | 0.0264 sn |

Tık sınıfları (MP3, kodlayıcı gecikmesi 1105 örnek düzeltilerek; olayın 2 ms karesindeki 10 kHz üstü enerjinin kaynağına göre): "söz içeriği" = enerjiyi konuşma izi taşıyor (seçilmiş çekimin kendi ünsüz başlangıcı; parçalar SPEC §4.1 tık denetiminden geçti); "yatak içeriği" = müzik/doğa izi taşıyor; "kurgu" = kurgu noktasında ±10 ms ve konuşma taşımıyor (karışımdan kuşkulu); "yalnız karışım" = hiçbir iz taşımıyor.

- ders2-15dk-nes-A: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0], [358.911, None, -53.7, -240.0, -53.7]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok
- ders2-15dk-nes-B: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0], [358.911, None, -53.7, -240.0, -53.7]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok
- ders2-15dk-hak-A: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok
- ders2-15dk-hak-B: float karışım — kurgu yok, yalnız karışım yok, yatak içeriği [[134.014, None, -53.2, -240.0, -53.2], [321.357, None, -53.0, -240.0, -53.0]]; MP3 — kurgu yok, yalnız karışım yok, yatak içeriği yok

Konum denetimi (ölçüm; MP3 orta kanalında her parçanın dalga biçimi ±50 ms içinde aranır): ders2-15dk-nes-A 127 parça, en düşük ilinti 0.984 (c2.n08), ortanca 0.991, en büyük kayma 0.05 ms; ders2-15dk-nes-B 127 parça, en düşük ilinti 0.977 (c1.s19), ortanca 0.99, en büyük kayma 0.05 ms; ders2-15dk-hak-A 129 parça, en düşük ilinti 0.97 (c2.n02), ortanca 0.985, en büyük kayma 0.05 ms; ders2-15dk-hak-B 129 parça, en düşük ilinti 0.962 (c1.l10), ortanca 0.984, en büyük kayma 0.05 ms

Gerçek tepe sınırlayıcı (stereo bağlı, tavan −2 dBTP): ders2-15dk-nes-A en çok 0.0 dB, > 0,5 dB 0.0 sn; ders2-15dk-nes-B en çok 0.0 dB, > 0,5 dB 0.0 sn; ders2-15dk-hak-A en çok 0.88 dB, > 0,5 dB 0.46 sn; ders2-15dk-hak-B en çok 0.91 dB, > 0,5 dB 0.252 sn

### Konuşma / yatak (3 sn ST yatak; ≥ 1 sn parçalar; en az / p10 / ortanca dB; eşik ≥ 15)

| Dosya | Varış | Derinleşme | Derin | Kapanış | Bütün parçalar (en az; < 15 sayısı) | Yatak ofseti (dB, evre) |
|---|---|---|---|---|---|---|
| ders2-15dk-nes-A | 17.31 / 17.38 / 17.49 GEÇTİ | 16.91 / 17.22 / 17.8 GEÇTİ | 16.6 / 17.01 / 18.04 GEÇTİ | 16.96 / 17.1 / 17.84 GEÇTİ | Var 17.31 (0); Der 15.3 (0); Der 16.06 (0); Kap 16.96 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |
| ders2-15dk-nes-B | 16.85 / 16.89 / 17.14 GEÇTİ | 16.73 / 16.98 / 17.5 GEÇTİ | 16.43 / 16.78 / 17.42 GEÇTİ | 16.27 / 16.81 / 17.22 GEÇTİ | Var 16.85 (0); Der 14.75 (1); Der 15.93 (0); Kap 16.27 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |
| ders2-15dk-hak-A | 17.47 / 17.5 / 17.63 GEÇTİ | 17.08 / 17.32 / 17.73 GEÇTİ | 16.75 / 17.37 / 17.99 GEÇTİ | 17.1 / 17.24 / 17.77 GEÇTİ | Var 17.47 (0); Der 13.69 (7); Der 14.39 (1); Kap 17.1 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |
| ders2-15dk-hak-B | 16.88 / 16.91 / 17.39 GEÇTİ | 16.43 / 16.92 / 17.63 GEÇTİ | 16.58 / 16.93 / 17.42 GEÇTİ | 16.47 / 16.8 / 17.87 GEÇTİ | Var 16.88 (0); Der 13.03 (8); Der 14.1 (1); Kap 16.47 (0) |  Var 0.0, Der 0.0, Der 0.0, Kap 0.0 |

### Konuşma / yatak, 3 sn ST iki izde (pencerenin ≥ %90'ı konuşma parçası)

| Dosya | Evre: ortanca / en az dB (en az an, parça) / < 15 pencere payı |
|---|---|
| ders2-15dk-nes-A | Varış 17.73 / 14.93 (12.7 sn, a.acilis) / %0.6; Derinleşme 17.38 / 14.75 (337.8 sn, c1.k1) / %1.0; Derin 17.55 / 15.51 (530.7 sn, br.k2) / %0.0; Kapanış 17.85 / 15.21 (813.2 sn, k.oda.ayrinti) / %0.0 |
| ders2-15dk-nes-B | Varış 18.25 / 15.6 (12.7 sn, a.acilis) / %0.0; Derinleşme 17.24 / 14.77 (337.8 sn, c1.k1) / %1.0; Derin 17.77 / 15.15 (738.4 sn, n2.dilek) / %0.0; Kapanış 17.93 / 15.95 (858.1 sn, k.otur) / %0.0 |
| ders2-15dk-hak-A | Varış 17.47 / 12.49 (12.0 sn, a.acilis) / %6.4; Derinleşme 17.29 / 14.57 (109.4 sn, n1.sec#2) / %5.2; Derin 17.49 / 15.26 (520.4 sn, c2.kal) / %0.0; Kapanış 17.78 / 14.68 (859.3 sn, k.otur) / %0.6 |
| ders2-15dk-hak-B | Varış 17.83 / 12.86 (12.0 sn, a.acilis) / %6.4; Derinleşme 17.32 / 15.07 (109.6 sn, n1.sec#2) / %0.0; Derin 17.62 / 15.18 (722.2 sn, n2.hatirla#2) / %0.0; Kapanış 17.84 / 15.26 (827.2 sn, k.zaman) / %0.0 |

3 sn ST penceresi cümle içi duraklamayı ve parça kuyruğunu da içerdiğinden söz ST değeri parçanın kendi düzeyinin 3–5 dB altına inebilir; en az değerler bu pencerelerdir. < 1 sn mikro parçalar (LUFS geçersiz, RMS ile eşitlendi; PLAN D.2) içinde 15 dB altı kalanlar:
- ders2-15dk-nes-A: yok
- ders2-15dk-nes-B: c1.l08 (0.91 sn, 14.75 dB)
- ders2-15dk-hak-A: c1.s09 (0.8 sn, 14.12 dB), c1.s19 (0.81 sn, 14.47 dB), c1.l09 (0.83 sn, 13.69 dB), c1.l12 (0.91 sn, 14.08 dB), c1.l19 (0.82 sn, 14.6 dB), c1.f02 (0.71 sn, 14.74 dB), c1.f20 (0.89 sn, 14.88 dB), c2.n10 (0.61 sn, 14.39 dB)
- ders2-15dk-hak-B: c1.s08 (0.8 sn, 14.54 dB), c1.s12 (0.91 sn, 14.3 dB), c1.s17 (0.9 sn, 14.68 dB), c1.l09 (0.83 sn, 13.03 dB), c1.l12 (0.91 sn, 13.69 dB), c1.l19 (0.82 sn, 13.98 dB), c1.f02 (0.71 sn, 14.1 dB), c1.f20 (0.89 sn, 14.73 dB), c2.n10 (0.61 sn, 14.1 dB)

### Yükseklik artışı (3 sn ST, 1 sn adım; SPEC/qa ≤ 1 dB/sn pencerelerde — bu planda duyurulu pencere yok)

| Dosya | Yatak izi en çok dB/sn (sn) | Tınısız yatak en çok (sn) / > 1 dB/sn adım | Yalnız müzik en çok (sn) / > 1 dB/sn adım | Dönüş tınısı (sn) |
|---|---|---|---|---|
| ders2-15dk-nes-A | 6.82 (751.5) | 2.95 (1.5) / 35 | 4.75 (1.5) / 36 | [753.015] |
| ders2-15dk-nes-B | 6.82 (239.2) | 6.82 (239.2) / 1227 | 11.05 (22.5) / 1324 | [753.015] |
| ders2-15dk-hak-A | 6.63 (755.3) | 2.96 (1.5) / 48 | 4.75 (1.5) / 50 | [756.802] |
| ders2-15dk-hak-B | 6.82 (239.2) | 6.82 (239.2) / 1220 | 11.35 (766.5) / 1316 | [756.802] |

### Doku değişimleri (8 sn; başlangıç = ipucu klibinin ilk sözü; pencerede konuşma payı)

- ders2-15dk-nes-A: yatak geçişi 105.238–113.238 sn (0.87); yatak geçişi 346.565–354.565 sn (0.77); yatak geçişi 571.102–579.102 sn (0.43); yatak geçişi 755.015–763.015 sn (0.52); imge katmanı girişi 571.102–579.102 sn (0.43); imge katmanı çıkışı 687.13–695.13 sn (0.68)
- ders2-15dk-nes-B: yatak geçişi 105.238–113.238 sn (0.87); yatak geçişi 346.565–354.565 sn (0.77); yatak geçişi 755.015–763.015 sn (0.52); imge katmanı girişi 571.102–579.102 sn (0.43); imge katmanı çıkışı 687.13–695.13 sn (0.68)
- ders2-15dk-hak-A: yatak geçişi 102.164–110.164 sn (0.87); yatak geçişi 337.477–345.477 sn (0.77); yatak geçişi 559.892–567.892 sn (0.55); yatak geçişi 758.802–766.802 sn (0.51); imge katmanı girişi 579.216–587.216 sn (0.41); imge katmanı çıkışı 692.505–700.505 sn (0.64)
- ders2-15dk-hak-B: yatak geçişi 102.164–110.164 sn (0.87); yatak geçişi 337.477–345.477 sn (0.77); yatak geçişi 758.802–766.802 sn (0.51); imge katmanı girişi 579.216–587.216 sn (0.41); imge katmanı çıkışı 692.505–700.505 sn (0.64)

### Evre başına ölçülen yatak (3 sn ST ortancası, LUFS)

| Dosya | Varış | Derinleşme | Derin | Kapanış |
|---|---|---|---|---|
| ders2-15dk-nes-A | toplam -32.88, müzik -33.34, doğa -43.69 | toplam -34.4, müzik -34.78, doğa -45.58 | toplam -36.14, müzik -36.6, doğa -46.89 | toplam -32.88, müzik -33.32, doğa -43.46 |
| ders2-15dk-nes-B | toplam -33.04, müzik -33.51, doğa -43.69 | toplam -34.46, müzik -34.96, doğa -45.58 | toplam -36.08, müzik -36.54, doğa -46.89 | toplam -33.02, müzik -33.57, doğa -43.46 |
| ders2-15dk-hak-A | toplam -32.88, müzik -33.34, doğa -43.68 | toplam -34.36, müzik -34.77, doğa -45.61 | toplam -36.15, müzik -36.62, doğa -46.9 | toplam -32.87, müzik -33.31, doğa -43.46 |
| ders2-15dk-hak-B | toplam -32.96, müzik -33.46, doğa -43.68 | toplam -34.43, müzik -34.93, doğa -45.61 | toplam -36.08, müzik -36.54, doğa -46.9 | toplam -33.03, müzik -33.58, doğa -43.46 |

## SPEC §7 bitti ölçütleri

| Ölçüt | ders2-15dk-nes-A | ders2-15dk-nes-B | ders2-15dk-hak-A | ders2-15dk-hak-B |
|---|---|---|---|---|
| duration_900pm1 | True | True | True | True |
| order_as_plan | True | True | True | True |
| every_piece_found_at_its_time_in_mp3 | True | True | True | True |
| no_missing_or_duplicate_by_construction | True | True | True | True |
| full_mix_scribe_alignment | None | None | None | None |
| screen_equals_spoken | True | True | True | True |
| no_edit_point_clicks_mp3 | True | True | True | True |
| no_mix_only_clicks_mp3 | True | True | True | True |
| no_digital_silence_ge_100ms_mp3 | True | True | True | True |
| speech_over_bed_ge15_pieces_ge_1s | True | True | True | True |
| true_peak_le_minus1 | True | True | True | True |
| integrated_lufs | -17.39 | -17.81 | -17.65 | -18.1 |
| size_le_14MB | True | True | True | True |
| mp3_44k1_stereo | True | True | True | True |

`full_mix_scribe_alignment = None`: yapılmadı (aşağıda "Doğrulanmayanlar").

## Maliyet (defter)

- Toplam 1144.46 sent (11.44 $), 399 satır; konuşma kovası 520.83 / 550 sent; müzik + doğa + tını kovası 623.63 / 900 sent; bu adımda ücretli çağrı: 0.
- Türe göre: music 441.72, scribe-music 174.4, scribe-speech 81.61, sfx 7.51, speech 439.22

## Seçim bayrakları

- **nes**: sayılar {'kulak': 4, 'kesim-kulak': 32, 'kulak-sinirlayici': 0, 'eklem>2yt': 13, 'other': 2}
  - kulak: a.durus — Scribe on all 5 takes (t1,t2 + re-take t4,t5,t6) returns 'Sırt üstü' vs tts 'Sırtüstü' (compound written apart by Scribe; only difference); single re-take used; best-ranked take t4 kept
  - kulak: n1.sec — all 6 takes (t1-t3 + re-take t4-t6): longest pause is the colon pause after 'önerim şu:' (0.55-0.56 s) not the sentence end, so the SPEC §3 longest-pause cut splits the wrong place (piece 2 would read
  - kulak: n2.hatirla — no take passes SPEC 4.3 with the SPEC 3 cut rule: in all 3 original takes and all 3 re-takes the longest pause is after "şunu:" (inside sentence 2), so the longest-gap cut splits "... yeterli. Ya da y
  - kulak: k.yan — Scribe wrote "Sırt üstü" (2 words) for "Sırtüstü" in all 6 takes (3 original + 3 re-take) -> word sequence not identical under SPEC 4.2 normalization. Every other word matched; likely Scribe orthograp
  - kesim-kural-sapmasi: n1.sec — delivered pieces n1.sec#1/#2 are cut at the sentence-end pause (gap 2.699-3.168 s, 0.469 s; boundary_misalign 0.015, rates 5.70/5.49 syll/s) chosen by SPEC §4.3(c) metrics instead of the longest pause
  - kesim-kuraldisi: n2.hatirla — DEVIATION needing owner/orchestrator approval: pieces cut at the sentence-boundary gap 3.791-4.255 s (2nd-longest pause, cut 4.0229 s, misalign 0.023, rates 5.04/5.52) instead of the longest gap 5.318
  - kesim-kulak (kesim yalnız ölçüyle denetlendi): 32 birim
  - eklem > 2 yt (taşıyıcı eklemi): car.butun, car.on1, car.on2, car.on3, car.sag1, car.sag2, car.sag3, car.sag4, car.sirt, car.sol1, car.sol2, car.sol3, car.sol4
- **hak**: sayılar {'kulak': 3, 'kesim-kulak': 32, 'kulak-sinirlayici': 40, 'eklem>2yt': 13, 'other': 0}
  - kulak: a.durus — SPEC §4.2: no take matched Scribe word-for-word after the single re-take; best-ranked take over all 6 takes kept; diffs: t1: Sırt üstü ya da yan yatıp zemine yerleşmen yeterli; t2: Sırt üstü ya da yan
  - kulak: c2.yer — SPEC §4.2: no take matched Scribe word-for-word after the single re-take; best-ranked take over all 6 takes kept; diffs: t1: Dikkatin nefeste ise onu en net fark ettiğin yeri bulabilirsin. Burun, göğü
  - kulak: k.yan — 
  - kulak-sinirlayici (> 3 dB tepe sınırlama): a.konfor, a.izin, n1.sec, n1.birak, c1.cerceve, car.sag1, car.sag2, car.sag3, car.sag4, car.sol1, car.sol4, car.sirt, car.on1, car.on2, car.on3, car.butun, c2.yer, c2.alt, c2.akis/c2.akis#2, c2.sayac/c2.sayac#2, car.sayi/c2.n08, car.sayi/c2.n05, car.sayi/c2.n04, car.sayi/c2.n01, c2.birak/c2.birak#2, br.k2/br.k2, br.orta/br.orta#1, br.orta/br.orta#3, c4.yol/c4.yol#2, c4.don/c4.don, n2.hatirla/n2.hatirla#1, n2.hatirla/n2.hatirla#2, n2.dilek/n2.dilek, k.hareket/k.hareket#1, k.yandakal/k.yandakal, k.otur/k.otur, k.bekle/k.bekle, c2.durak/c2.durak#1, c2.durak/c2.durak#2, c2.x.ritim/c2.x.ritim#1
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

- SPEC §7 "tam karışımın Scribe metni plan metniyle hizalanır": YAPILMADI. (1) Yerel dosya yükleme aracı bu oturumda yok (seçim ajanları da doğruladı: creative_attach_reference_file yalnız herkese açık https URL alır); (2) 4 × 900 sn Scribe ≈ 4 × 90 = 360 sent (gözlenen 0,1 sent/sn) ve konuşma kovasında kalan pay ≈ 29.2 sent (tavan 550) — tavan aşılırdı. Yerine: karışım planın olay listesinden kuruldu; zaman çizelgesinin sırası, metni ve parça sayısı planla birebir karşılaştırıldı (order_check); her parça, birim düzeyinde Scribe ile doğrulanmış çekimden gelir (selection-*.json).
- Kulakla dinleme yapılmadı; bütün ifadeler ölçümdür.
- Parça kesimleri yalnız ölçüyle denetlendi (SPEC §4.3 c; "kesim-kulak" bayrakları seçim dosyalarında).

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
- Hakan: gerçek tepe sınırlayıcısı > 3 dB kısan parçalar ("kulak-sinirlayici", listede)
- Dönüş tınısı seçimi (sentez D5 / ElevenLabs sfx) ve düzeyi
- İmge katmanının düzeyi (−8 dB) ve tınısı; doğa düzeyi (−10 dB); orman-2 yinelenen esinti
- A/B kaynak ayrıntıları (_ab_details.json) — dinlemeden sonra açılır
