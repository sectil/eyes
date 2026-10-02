# Ders 5: ölçüm raporu ve kulak listesi (ilk bölüm)

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
| Dosya | `ders5-3.mp3` | `ders5-5.mp3` | `ders5-15.mp3` |
| Bayt | 2.453.450 | 4.102.791 | 12.418.862 |
| Kodlama | ABR 120 kbit/s (lameenc, q=2) | ABR 120 kbit/s (lameenc, q=2) | ABR 120 kbit/s (lameenc, q=2) |
| Süre (çözülmüş, sn) | 180.011 | 300.017 | 900.024 |
| Bütünleşik (LUFS) | -17.31 (hedef -18) | -17.30 (hedef -18) | -17.28 (hedef -18) |
| Dosya kısması (dB) | -0.87 | -0.76 | 0.00 |
| Gerçek tepe MP3 (dBTP) | -4.10 | -4.64 | -3.44 |
| Konum ilintisi en düşük / kayma | 0.991 (k.donus) / 0.000 ms | 0.991 (a.gozler) / 0.000 ms | 0.990 (c3.d45#1) / 0.000 ms |
| Konuşma/yatak en düşük (dB) | 15.52 | 15.51 | 15.50 |
| Yerel yatak kısması | 1 | 1 | 5 |
| Yatak zarfı en büyük artış (dB/sn) | 0.64 @ 133.2 sn | 0.67 @ 234.3 sn | 0.93 @ 771.0 sn |
| Plan: check_plan / boş pay (min, sn) | geçti / 26.34 | geçti / 37.01 | geçti / 124.56 |
| Tık (MP3: kurgu / karışım / konuşma içeriği) | 0 / 0 / 208 | 0 / 0 / 376 | 0 / 0 / 889 |

Konuşma içeriği tıkı: 10 kHz üstü ani olayın enerjisi seçilmiş konuşma parçasının kendisinden geliyor (ünsüzler); kurgu noktası ve karışım kaynaklı tık sıfır.

## Bu partide seslendirilen birimler (68)

Her birim 3 çekim; nesnel sıralamadaki ilk çekimden başlayarak Scribe ile harf harf karşılaştırıldı, tutan ilk çekim seçildi (SPEC.v3 §6.3). Hepsi birebir eşleşti: evet.

| Birim | Çekim | Scribe | Bayraklar |
|---|---|---|---|
| `a.durus.kisa` | t1 | birebir | kesim-kulak |
| `c1.kayma.kisa` | t3 | birebir | — |
| `c1.donus` | t3 | birebir | — |
| `k.donus` | t3 | birebir | — |
| `k.goz.kisa` | t1 | birebir | — |
| `k.son` | t2 | birebir | — |
| `a.durus` | t3 | birebir | — |
| `a.gozler` | t3 | birebir | — |
| `a.izin` | t1 | birebir | — |
| `a.acilis` | t2 | birebir | — |
| `c1.yer` | t3 | birebir | — |
| `c1.nokta` | t3 | birebir | — |
| `c1.izle` | t1 | birebir | — |
| `c1.kayma` | t1 | birebir | — |
| `c1.aralik1` | t1 | birebir | — |
| `c1.nerede` | t1 | birebir | — |
| `c1.getir` | t2 | birebir | — |
| `k.nefes` | t1 | birebir | — |
| `k.sesler` | t1 | birebir | — |
| `k.hareket` | t1 | birebir | — |
| `k.goz` | t3 | birebir | — |
| `c1.his` | t1 | birebir | kesim-kulak |
| `c1.duzeltme` | t1 | birebir | — |
| `k.oda` | t3 | birebir | — |
| `a.dagink` | t3 | birebir | — |
| `a.normal` | t3 | birebir | — |
| `c1.aralik2` | t1 | birebir | — |
| `c1.dusunce` | t3 | birebir | — |
| `c1.kac` | t2 | birebir | — |
| `a.omuz` | t2 | birebir | — |
| `c1.aralik3` | t3 | birebir | — |
| `c2.giris` | t1 | birebir | — |
| `c2.nasil` | t2 | birebir | — |
| `c2.say1` | t1 | birebir | — |
| `c2.hangi` | t1 | birebir | — |
| `c2.anahtar2` | t1 | birebir | — |
| `c2.dusunce` | t2 | birebir | — |
| `a.karar` | t2 | birebir | — |
| `c2.yonetme` | t2 | birebir | — |
| `c2.veris` | t3 | birebir | — |
| `c2.veris2` | t3 | birebir | — |
| `k.gun` | t1 | birebir | — |
| `c2.seyrek` | t1 | birebir | — |
| `c3.ad` | t2 | birebir | — |
| `c3.can` | t2 | birebir | derin>5, kesim-kulak |
| `c3.kisa` | t2 | birebir | — |
| `c3.d15` | t2 | birebir | — |
| `c3.w30` | t2 | birebir | derin>5, kesim-kulak |
| `c3.d30` | t1 | birebir | derin>5, kesim-kulak |
| `c3.anahtar3` | t2 | birebir | — |
| `c3.parlak` | t1 | birebir | — |
| `c3.kaydiysa` | t3 | birebir | derin>5 |
| `c3.kisa2` | t1 | birebir | derin>5 |
| `c3.d18` | t2 | birebir | — |
| `c3.w45` | t1 | birebir | derin>5, kesim-kulak |
| `c3.d45` | t2 | birebir | derin>5, kesim-kulak |
| `k.avuc1` | t2 | birebir | — |
| `k.avuc2` | t3 | birebir | — |
| `k.avuc3` | t3 | birebir | — |
| `k.avuc4` | t1 | birebir | — |
| `k.avuc5` | t3 | birebir | — |
| `d.goz` | t2 | birebir | — |
| `d.kalk` | t3 | birebir | — |
| `d.bekle` | t3 | birebir | — |
| `i.ilk` | t2 | birebir | — |
| `c2.bas` | t3 | birebir | — |
| `c1.anahtar1` | t2 | birebir | — |
| `c2.onbir` | t4 | birebir | — |

## Kulak listesi

Sahibin dinlerken özellikle bakacağı yerler. Hiçbiri ölçütten kalmadı; hepsi kural gereği listelenir (SPEC.v3 §16).

1. **kesim-kulak**: çok cümleli birim cümle sonlarından kesildi; kesim yalnız ölçüyle denetlendi (Scribe sözcük zamanı yok): `a.durus.kisa`, `c1.his`, `c3.can`, `c3.w30`, `c3.d30`, `c3.w45`, `c3.d45`.
2. **derin>5**: Derin evrede eklemleme 5,0 hece/sn üstü (VARSAYIM tavan): `c3.can (c3.can#2)`, `c3.w30 (c3.w30#1)`, `c3.w30 (c3.w30#2)`, `c3.w30 (c3.w30#3)`, `c3.d30 (c3.d30#1)`, `c3.d30 (c3.d30#2)`, `c3.kaydiysa (c3.kaydiysa)`, `c3.kisa2 (c3.kisa2)`, `c3.w45 (c3.w45#2)`, `c3.w45 (c3.w45#3)`, `c3.d45 (c3.d45#1)`, `c3.d45 (c3.d45#2)`.
3. **isleme-sonrasi-elendi**: sıralamada önceki çekim işlemeden sonra tık/kırpılma verdi, sıradaki çekim alındı: `c2.bas (t1: tik, 5.07 sn)`, `c1.anahtar1 (t3: tik, 2.92 sn)`.
4. **3 dk dosya kısması -0.87 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -16.43 LUFS çıktı (pencere -18 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
5. **5 dk dosya kısması -0.76 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -16.54 LUFS çıktı (pencere -18 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
6. **15 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.93 dB/sn (771.0. sn; eşik 1,0).

## Ders 5 ek notları

1. **Müzik yerel sentez (ders verisi music.source izin veriyor):** Sol4 (392 Hz) sürekli ton; Varış'ta Re5, Kapanış'ta Re5 + Sol5, son akorda Si4 eklenir (≥ 10 sn geçişler). Her kısmi ses tek ses; sağ kanal sabit faz farkıyla (genişlik). İlk sürümdeki üç ayrık ses (±0,6 sent) ≈ 7 sn periyotla vurdu, yatak 4 dB dalgalandı (2,6 dB/sn): bırakıldı. 60 BPM hissi ±0,15 dB, 1 Hz genlik kıpırtısı.
2. **Çan:** yerel sentez, Sol5 temelli ayrık kısmi sesler, 12 ms yumuşak saldırı; ders verisi gereği klipten 2 sn önce (`returnTone:-2s`). Çanın kuyruğu konuşmanın altına uzandığı için yerel yatak kısması (konuşma/yatak ≥ 15 dB) çanı da kapsar (VARSAYIM; yalnız Ders 5).
3. **3 dk yerel yatak kısması:** `k.donus` 1.71 dB.
4. **5 dk yerel yatak kısması:** `k.donus` 1.84 dB.
5. **15 dk yatak yükseliş sınırlayıcısı (VARSAYIM, Ders 3 ile aynı):** kapanış ipucunda ton genişlemesi, evre düzeyinin yükselişi ve yerel kısmanın geri açılışı üst üste bindi (sınırlayıcısız 2,17 dB/sn). Sınırlayıcı yerel kısmadan sonra son yatakta çalışır; 1 sn'deki artış 0,9 dB/sn'de tutuldu, yani kapanıştaki genişleme daha yavaş açılır. En çok kısma -7.21 dB; sonuç 0.93 dB/sn.
6. **15 dk yerel yatak kısması:** `c3.d15` 4.56 dB, `c3.d18` 4.50 dB, `c3.d30#1` 4.51 dB, `c3.d45#1` 4.62 dB, `k.donus` 1.64 dB.
