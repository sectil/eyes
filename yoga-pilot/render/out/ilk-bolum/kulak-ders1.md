# Ders 1: ölçüm raporu ve kulak listesi (ilk bölüm)

Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`, eleven_v4, 3 çekim). Müzik: A (ElevenLabs Music). Karıştırıcı: `render/tools/mixib.py` (pilot `mix.py` fonksiyonları). Şartname: `b/SPEC.v3.md`.
Dosyalar tarayıcı önizlemesidir (MP3, SPEC.v3 §10). Uygulama dosyası (AAC-LC m4a) Mac'te WAV ana kopyadan kodlanır (§14); WAV ana kopyalar depoya girmez.

## Dosyalar ve §12.1 ölçütleri

| Ölçüt | 3 dk | 5 dk | 15 dk |
|---|---|---|---|
| Süre hedef ± 1 sn | geçti | geçti | geçti |
| Olay sırası ve metin plan ile birebir | geçti | geçti | geçti |
| Her parça MP3'te yerinde (4 kHz altı ilinti ≥ 0,95, kayma ≤ 1 ms) | geçti | geçti | geçti |
| Kurgu noktasında tık yok (float) | geçti | geçti | geçti |
| Kurgu noktasında tık yok (MP3) | geçti | geçti | geçti |
| Karışım kaynaklı tık yok (MP3) | geçti | geçti | geçti |
| Dijital sessizlik < 100 ms | geçti | geçti | geçti |
| Konuşma/yatak ≥ 15 dB, her parça (1 sn altı dahil) | geçti | geçti | geçti |
| Yatak yükselişi ≤ 1 dB/sn | geçti | geçti | geçti |
| Gerçek tepe ≤ −1 dBTP (MP3 çözülerek) | geçti | geçti | geçti |
| Bütünleşik yükseklik hedef ± 1 LUFS | geçti | geçti | geçti |
| Ekrandaki = söylenen | geçti | geçti | geçti |
| Dosya ≤ 15.000.000 bayt | geçti | geçti | geçti |
| MP3 44,1 kHz stereo | geçti | geçti | geçti |

| Ölçüm | 3 dk | 5 dk | 15 dk |
|---|---|---|---|
| Dosya | `ders1-3.mp3` | `ders1-5.mp3` | `ders1-15.mp3` |
| Bayt | 2.494.305 | 4.139.216 | 12.224.095 |
| Kodlama | ABR 120 kbit/s (lameenc, q=2) | ABR 120 kbit/s (lameenc, q=2) | ABR 120 kbit/s (lameenc, q=2) |
| Süre (çözülmüş, sn) | 180.011 | 300.017 | 900.024 |
| Bütünleşik (LUFS) | -17.31 (hedef -18) | -17.30 (hedef -18) | -17.30 (hedef -18) |
| Dosya kısması (dB) | -0.80 | -0.73 | -0.33 |
| Gerçek tepe MP3 (dBTP) | -4.43 | -3.73 | -3.57 |
| Konum ilintisi en düşük / kayma | 0.989 (c1.s1.04) / 0.000 ms | 0.988 (c1.s1.04) / 0.000 ms | 0.989 (c3.anahtar3) / 0.000 ms |
| Konuşma/yatak en düşük (dB) | 15.58 | 15.61 | 16.08 |
| Yerel yatak kısması | 0 | 0 | 0 |
| Yatak zarfı en büyük artış (dB/sn) | 0.76 @ 61.7 sn | 0.82 @ 153.2 sn | 0.92 @ 442.3 sn |
| Plan: check_plan / boş pay (min, sn) | geçti / 15.50 | geçti / 21.17 | geçti / 75.68 |
| Tık (MP3: kurgu / karışım / konuşma içeriği) | 0 / 0 / 275 | 0 / 0 / 434 | 0 / 0 / 877 |

Konuşma içeriği tıkı: 10 kHz üstü ani olayın enerjisi seçilmiş konuşma parçasının kendisinden geliyor (ünsüzler); kurgu noktası ve karışım kaynaklı tık sıfır.

## Bu partide seslendirilen birimler (68)

Her birim 3 çekim; nesnel sıralamadaki ilk çekimden başlayarak Scribe ile harf harf karşılaştırıldı, tutan ilk çekim seçildi (SPEC.v3 §6.3). Hepsi birebir eşleşti: hayır (istisnalar aşağıda).

| Birim | Çekim | Scribe | Bayraklar |
|---|---|---|---|
| `a.durus.kisa` | t3 | birebir | — |
| `a.izin` | t1 | birebir | — |
| `a.acilis` | t2 | birebir | — |
| `c1.guven` | t2 | birebir | — |
| `c1.ritim.kisa` | t3 | birebir | — |
| `car.say1` | t3 | birebir | eklem>2yt, kesim-kulak |
| `car.c1a` | t2 | birebir | eklem>2yt, kesim-kulak |
| `c1.d2.s` | t3 | birebir | — |
| `c1.d3.s` | t3 | birebir | — |
| `car.c1b` | t3 | birebir | eklem>2yt, kesim-kulak |
| `c1.d6.s` | t2 | birebir | — |
| `c1.anahtar1` | t3 | birebir | — |
| `k.donus` | t1 | birebir | — |
| `k.nefes` | t3 | birebir | — |
| `k.hareket` | t3 | birebir | — |
| `k.goz.kisa` | t2 | birebir | — |
| `k.son` | t1 | birebir | — |
| `a.durus` | t2 | birebir | — |
| `a.gozler` | t3 | birebir | — |
| `c1.izle` | t3 | birebir | — |
| `c1.ritim` | t3 | birebir | kesim-kulak |
| `car.say2` | t2 | birebir | eklem>2yt, kesim-kulak |
| `k.sesler` | t3 | birebir | — |
| `k.goz` | t1 | birebir | — |
| `k.oda` | t2 | birebir | — |
| `c1.ses` | t3 | birebir | — |
| `c1.uzunluk` | t1 | birebir | kesim-kulak |
| `c1.d4.s` | t1 | birebir | — |
| `a.eller` | t1 | birebir | — |
| `a.omuz` | t3 | birebir | — |
| `c1.d8.s` | t2 | birebir | — |
| `c1.d9.s` | t1 | birebir | — |
| `k.zaman` | t2 | birebir | — |
| `a.kolay` | t2 | birebir | — |
| `k.say` | t1 | birebir | — |
| `c2.ad` | t1 | birebir | — |
| `c2.nasil` | t3 | birebir | kesim-kulak |
| `car.c2a` | t1 | birebir | eklem>2yt, kesim-kulak |
| `c2.dogal` | t2 | birebir | — |
| `c2.anahtar2` | t2 | birebir | — |
| `c2.d3.s` | t3 | birebir | — |
| `car.c2b` | t3 | birebir | eklem>2yt, kesim-kulak |
| `c2.tur2` | t2 | birebir | — |
| `car.c2c` | t2 | birebir | eklem>2yt, kesim-kulak |
| `a.karar` | t2 | birebir | — |
| `c1.d10.s` | t3 | birebir | — |
| `k.gun` | t1 | birebir | — |
| `c3.nasil` | t1 | birebir | — |
| `c3.eller` | t1 | birebir | — |
| `c3.sessiz` | t3 | birebir | — |
| `car.c3a` | t1 | birebir | eklem>2yt, kesim-kulak |
| `c3.sessizlik` | t3 | birebir | derin>5, kesim-kulak |
| `c3.anahtar3` | t3 | birebir | — |
| `c3.agiz` | t2 | birebir | — |
| `c3.kisa` | t3 | birebir | — |
| `c3.titresim` | t2 | birebir | — |
| `c3.el` | t3 | birebir | — |
| `c3.dogal` | t2 | birebir | — |
| `car.c3b` | t3 | birebir | kesim-kulak |
| `d.goz` | t3 | birebir | — |
| `d.kalk` | t3 | birebir | — |
| `d.bekle` | t1 | birebir | — |
| `i.ilk` | t2 | birebir | — |
| `car.c1c` | t3 | birebir | eklem>2yt, kesim-kulak |
| `c1.burun` | t4 | birebir | — |
| `c2.guven` | t3 | birebir | — |
| `c3.ad` | t2 | **tutmadı (kulak)** | kulak |
| `car.c1d` | t1 | **tutmadı (kulak)** | kulak |

## Kulak listesi

Sahibin dinlerken özellikle bakacağı yerler. Hiçbiri ölçütten kalmadı; hepsi kural gereği listelenir (SPEC.v3 §16).

1. **kesim-kulak**: çok cümleli birim cümle sonlarından kesildi; kesim yalnız ölçüyle denetlendi (Scribe sözcük zamanı yok): `car.say1`, `car.c1a`, `car.c1b`, `c1.ritim`, `car.say2`, `c1.uzunluk`, `c2.nasil`, `car.c2a`, `car.c2b`, `car.c2c`, `car.c3a`, `c3.sessizlik`, `car.c3b`, `car.c1c`.
2. **eklem>2yt**: taşıyıcı ekleminde F0 basamağı > 2 yarım ton: `car.say1`, `car.c1a`, `car.c1b`, `car.say2`, `car.c2a`, `car.c2b`, `car.c2c`, `car.c3a`, `car.c1c`.
3. **derin>5**: Derin evrede eklemleme 5,0 hece/sn üstü (VARSAYIM tavan): `c3.sessizlik (c3.sessizlik#2)`.
4. **isleme-sonrasi-elendi**: sıralamada önceki çekim işlemeden sonra tık/kırpılma verdi, sıradaki çekim alındı: `c2.guven (t2: tik, 5.00 sn)`.
5. **kulak**: SPEC.v3 §6.3 son adım: yeniden çekim dahil hiçbir çekim Scribe ile harf harf tutmadı; sıralamada ilk çekim seçildi, söyleyiş kulakla doğrulanmalı: `c3.ad`, `car.c1d`.
6. **3 dk dosya kısması -0.80 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -16.50 LUFS çıktı (pencere -18 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
7. **5 dk dosya kısması -0.73 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -16.57 LUFS çıktı (pencere -18 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
8. **5 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.82 dB/sn (153.2. sn; eşik 1,0).
9. **15 dk dosya kısması -0.33 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -16.97 LUFS çıktı (pencere -18 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
10. **15 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.92 dB/sn (442.3. sn; eşik 1,0).

## Ders 1 ek notları

1. **Müzik (Re ailesi):** Varış `d1-varis` ve Kapanış `d1-kapanis` ElevenLabs Music; `d1-kapanis` **+1 yarım ses**
   kaydırıldı (`d1-kapanis.keyD`, uzunluk oranı 84/89; SPEC.v3 §7: ≤ 1 yarım ses, kulak kaydı gerekir). İkisinde de vokal
   denetimi boş metin verdi. Çekirdekteki bordun yerel sentez (Re2/La2/Re3/La3/Re4 kamış benzeri sesler, alışta
   parlaklaşan, nefes döngüsüne kilitli; `render/music/synth/synth_ib.py`): ElevenLabs bordun denemeleri
   (`d1-bordun-a/b/c`) kullanılmadı; ölçümde biri tritonlu, biri ≈ 15 sent akort dışı çıktı (üçüncünün ölçüm kaydı bu notta
   yok). Ders verisi bordunun sentezine izin veriyor.
2. **Nefes kilidi (sahip kararı, SAHIP_ISTEKLERI madde 15–16):** Nefona Hoca'nın sayıları ve "ver…" ipuçları kilide
   sığmıyordu (27 parça 0,02–0,33 sn fazla). Fazlalık konuşma değil, parçaların sonundaki ≈ 0,25 sn sessizlikti. Nefes
   kilitli 87 parçanın sessiz başı ve sonu atıldı (tepenin 40 dB altı; 20 ms baş payı, 40 ms kararma;
   `render/tools/kilit_kirp_ib.py`; özgünler `_kirpma_oncesi/`). Ders verisinde periyodu 1,2 sn olan 8 "ver…" klibinin
   sessizlik tabanı 0,6 → 0,5 sn. Sınıra en yakın parça `c1.s1.09` ("beş…", 0,71 sn; sınır 0,70, kilit toleransı 0,02).
   Üç noktasız yeniden seslendirme denendi (`car.say1`, noktalı ve virgüllü): sorunu çözmediği için kullanılmadı.
3. **Scribe'la tutmayan iki birim (SPEC.v3 §6.3 son adım, `kulak`):** `c3.ad`: altı çekimin (yeniden çekim dahil) hepsinde
   Scribe "Brahmari" yazıyor, metin "bramari": söyleyiş kulakla doğrulanmalı. `car.c1d`: tek heceli "Al…"; Scribe "All",
   "Av", "An" yazıyor (dil algısı İngilizce, olasılık 0,12).
4. **Yeniden çekim:** `c1.burun`'un ilk üç çekiminde virgül duraklamasında ağız tıkırtısı vardı; yeniden çekimden `t4`.
5. **15 dk yatak yükseliş sınırlayıcısı (VARSAYIM, Ders 5 ile aynı yöntem):** sentez bordun her "Al…"da parlaklaşıp
   kabarıyor (alış kilidi); C2 döngülerinde kabarma 1,18 dB/sn'ye çıkıyordu. Sınırlayıcı son yatakta 1 sn'deki artışı
   0,9 dB/sn'de tutuyor: kabarma kalıyor, en hızlı kısmı yumuşuyor (en çok 1,48 dB kısma; sonuç 0,92 dB/sn). 3 ve 5 dk'da
   devreye girmiyor (en büyük artış 0,76 ve 0,82 dB/sn).
