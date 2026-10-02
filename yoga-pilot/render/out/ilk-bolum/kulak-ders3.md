# Ders 3: ölçüm raporu ve kulak listesi (ilk bölüm)

Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`, eleven_v4, 3 çekim). Müzik: A (ElevenLabs Music). Karıştırıcı: `render/tools/mixib.py` (pilot `mix.py` fonksiyonları). Şartname: `b/SPEC.v3.md`.
Dosyalar tarayıcı önizlemesidir (MP3, SPEC.v3 §10). Uygulama dosyası (AAC-LC m4a) Mac'te WAV ana kopyadan kodlanır (§14); WAV ana kopyalar depoya girmez.

## Dosyalar ve §12.1 ölçütleri

| Ölçüt | 5 dk | 15 dk |
|---|---|---|
| Süre hedef ± 1 sn | geçti | geçti |
| Olay sırası ve metin plan ile birebir | geçti | geçti |
| Her parça MP3'te yerinde (4 kHz altı ilinti ≥ 0,95, kayma ≤ 1 ms) | geçti | geçti |
| Kurgu noktasında tık yok (float) | geçti | geçti |
| Kurgu noktasında tık yok (MP3) | geçti | geçti |
| Karışım kaynaklı tık yok (MP3) | geçti | geçti |
| Dijital sessizlik < 100 ms | geçti | geçti |
| Konuşma/yatak ≥ 15 dB, her parça (1 sn altı dahil) | geçti | geçti |
| Yatak yükselişi ≤ 1 dB/sn | geçti | geçti |
| Gerçek tepe ≤ −1 dBTP (MP3 çözülerek) | geçti | geçti |
| Bütünleşik yükseklik hedef ± 1 LUFS | geçti | geçti |
| Ekrandaki = söylenen | geçti | geçti |
| Dosya ≤ 15.000.000 bayt | geçti | geçti |
| MP3 44,1 kHz stereo | geçti | geçti |

| Ölçüm | 5 dk | 15 dk |
|---|---|---|
| Dosya | `ders3-5.mp3` | `ders3-15.mp3` |
| Bayt | 4.362.322 | 13.051.262 |
| Kodlama | ABR 120 kbit/s (lameenc, q=2) | ABR 120 kbit/s (lameenc, q=2) |
| Süre (çözülmüş, sn) | 300.017 | 900.024 |
| Bütünleşik (LUFS) | -19.30 (hedef -20) | -19.30 (hedef -20) |
| Dosya kısması (dB) | -1.79 | -1.54 |
| Gerçek tepe MP3 (dBTP) | -5.10 | -5.46 |
| Konum ilintisi en düşük / kayma | 0.994 (k.izin) / 0.000 ms | 0.994 (k.son) / 0.000 ms |
| Konuşma/yatak en düşük (dB) | 17.48 | 17.48 |
| Yerel yatak kısması | 0 | 0 |
| Yatak zarfı en büyük artış (dB/sn) | 0.92 @ 160.2 sn | 0.92 @ 201.1 sn |
| Plan: check_plan / boş pay (min, sn) | geçti / 31.04 | geçti / 219.27 |
| Tık (MP3: kurgu / karışım / konuşma içeriği) | 0 / 0 / 209 | 0 / 0 / 431 |

Konuşma içeriği tıkı: 10 kHz üstü ani olayın enerjisi seçilmiş konuşma parçasının kendisinden geliyor (ünsüzler); kurgu noktası ve karışım kaynaklı tık sıfır.

## Bu partide seslendirilen birimler (67)

Her birim 3 çekim; nesnel sıralamadaki ilk çekimden başlayarak Scribe ile harf harf karşılaştırıldı, tutan ilk çekim seçildi (SPEC.v3 §6.3). Hepsi birebir eşleşti: hayır (istisnalar aşağıda).

| Birim | Çekim | Scribe | Bayraklar |
|---|---|---|---|
| `a.acilis` | t2 | birebir | — |
| `a.durus` | t3 | istisnayla | scribe-istisna |
| `a.gozler` | t1 | birebir | — |
| `a.izin` | t1 | birebir | — |
| `a.kolay` | t1 | birebir | — |
| `c1.fark` | t2 | birebir | — |
| `c1.veris` | t3 | birebir | — |
| `c1.birkac` | t1 | birebir | — |
| `c1.k1` | t3 | birebir | — |
| `c2.cerceve` | t1 | birebir | kesim-kulak |
| `c2.ayak` | t3 | birebir | — |
| `c2.bacak` | t2 | birebir | — |
| `c2.bel` | t3 | birebir | — |
| `c2.kol` | t1 | birebir | — |
| `c2.bas` | t1 | birebir | — |
| `c2.butun` | t1 | birebir | — |
| `c3.sahne` | t2 | birebir | — |
| `c3.gelmezse` | t2 | birebir | — |
| `c3.yer` | t1 | birebir | derin>5, kesim-kulak |
| `c3.yagmur` | t1 | birebir | — |
| `c3.ortu` | t1 | birebir | — |
| `c3.lamba` | t1 | birebir | — |
| `c3.kisilir.kisa` | t3 | birebir | derin>5 |
| `k.anahtar3` | t2 | birebir | — |
| `k.izin` | t1 | birebir | — |
| `k.uyanik` | t3 | birebir | derin>5 |
| `k.son` | t2 | birebir | — |
| `c1.gun` | t1 | birebir | — |
| `c3.kisilir` | t3 | birebir | — |
| `c3.aydinlik` | t2 | birebir | — |
| `a.karar` | t1 | birebir | — |
| `c1.zorlanirsan` | t1 | birebir | — |
| `c2.gelmezse` | t2 | birebir | — |
| `c3.su` | t3 | birebir | derin>5 |
| `c3.toprak` | t2 | birebir | derin>5 |
| `a.ortu` | t2 | birebir | — |
| `a.isler` | t1 | birebir | — |
| `c3.damla` | t3 | birebir | — |
| `c3.agirlik` | t2 | birebir | — |
| `c3.yastik` | t2 | birebir | — |
| `c1.yer` | t2 | birebir | — |
| `c2.topuk` | t2 | birebir | — |
| `c2.omuz` | t2 | birebir | — |
| `c3.sicaklik` | t1 | birebir | — |
| `c4.giris` | t2 | birebir | derin>5, kesim-kulak |
| `car.sayi3` | t2 | birebir | eklem>2yt, kesim-kulak |
| `c4.bitti` | t1 | birebir | derin>5, kesim-kulak |
| `c4.k2` | t1 | birebir | derin>5 |
| `c2.uyluk` | t2 | birebir | — |
| `c2.el` | t1 | birebir | — |
| `c4.uymaz` | t3 | birebir | derin>5 |
| `c3.ses2` | t1 | birebir | — |
| `c1.dudak` | t3 | birebir | — |
| `c2.omurga` | t2 | birebir | — |
| `c2.yuz` | t3 | birebir | — |
| `c3.kal` | t3 | birebir | — |
| `k.nefes` | t3 | birebir | — |
| `c2.boyun` | t2 | birebir | — |
| `c2.cene` | t1 | birebir | — |
| `c2.sicak` | t3 | birebir | — |
| `c3.parmak` | t3 | birebir | derin>5 |
| `c3.uzak` | t2 | birebir | derin>5 |
| `c3.cam` | t3 | birebir | — |
| `d.yer` | t2 | birebir | — |
| `d.goz` | t1 | birebir | — |
| `d.kalk` | t2 | birebir | — |
| `g.ilk.uyku` | t2 | birebir | — |

## Kulak listesi

Sahibin dinlerken özellikle bakacağı yerler. Hiçbiri ölçütten kalmadı; hepsi kural gereği listelenir (SPEC.v3 §16).

1. **scribe-istisna**: Scribe yalnız yazım istisnasıyla eşleşti: `a.durus`.
2. **kesim-kulak**: çok cümleli birim cümle sonlarından kesildi; kesim yalnız ölçüyle denetlendi (Scribe sözcük zamanı yok): `c2.cerceve`, `c3.yer`, `c4.giris`, `car.sayi3`, `c4.bitti`.
3. **derin>5**: Derin evrede eklemleme 5,0 hece/sn üstü (VARSAYIM tavan): `c3.yer (c3.yer#2)`, `c3.kisilir.kisa (c3.kisilir.kisa)`, `k.uyanik (k.uyanik)`, `c3.su (c3.su)`, `c3.toprak (c3.toprak)`, `c4.giris (c4.giris#1)`, `c4.giris (c4.giris#2)`, `c4.bitti (c4.bitti#1)`, `c4.bitti (c4.bitti#2)`, `c4.k2 (c4.k2)`, `c4.uymaz (c4.uymaz)`, `c3.parmak (c3.parmak)`, `c3.uzak (c3.uzak)`.
4. **eklem>2yt**: taşıyıcı ekleminde F0 basamağı > 2 yarım ton: `car.sayi3`.
5. **5 dk dosya kısması -1.79 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -17.51 LUFS çıktı (pencere -20 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
6. **5 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.92 dB/sn (160.2. sn; eşik 1,0).
7. **15 dk dosya kısması -1.54 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -17.76 LUFS çıktı (pencere -20 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
8. **15 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.92 dB/sn (201.1. sn; eşik 1,0).

## Ders 3 ek notları

1. **Müzik ailesi (La♭, ElevenLabs Music):** `d3-varis`, `d3-cekirdek`, `d3-cekirdek-b`, `d3-derin`, `d3-derin-b`, `d3-imge` (keçe piyano), `d3-uyku`. Parçalar rastgele tonlarda geldi; `d3-cekirdek-b`, `d3-derin`, `d3-derin-b` **+1 yarım ses** kaydırıldı (SPEC.v3 §7: ≤ 1 yarım ses, kulak kaydı gerekir). Aile içi uyum endeksi en büyük 0,176 (sınır 0,2). Vokal denetimi: 7 müzik parçası ve 4 yağmur döngüsünün hepsinde Scribe boş metin verdi.
2. **Yağmur:** 4 × 30 sn döngü (ElevenLabs ses efekti), müziğin 10 dB altında; imge boyunca +1,5 dB.
3. **5 dk yatak yükseliş sınırlayıcısı (VARSAYIM):** pilot yatak EQ'su kaynağın tınısını değiştirdiği için ham kaynakta yapılan yavaş dengeleme karışıma birebir geçmedi (EQ'suz 0,73, EQ'lu 1,12 dB/sn ölçüldü). Yatağın 1 sn'deki artışı 0,9 dB/sn'de tutan yavaş kazanç uygulandı: yalnız artışlar kısılır, düzey ve düşüşler değişmez. En çok kısma -0.91 dB; sonuç 0.92 dB/sn (sınır 1,0).
4. **5 dk yağmur damlası kurgu noktasında (VARSAYIM):** 3 olay bir kurgu noktasının ±10 ms'ine düştü; enerjisi yağmur izinden geliyor ve aynı olay yağmur kaynak dosyasının karşılık gelen konumunda da var (kaynak doğrulaması). Kurgu tıkı sayılmadı, raporda `nature_at_edit` listesinde.
5. **15 dk yatak yükseliş sınırlayıcısı (VARSAYIM):** pilot yatak EQ'su kaynağın tınısını değiştirdiği için ham kaynakta yapılan yavaş dengeleme karışıma birebir geçmedi (EQ'suz 0,73, EQ'lu 1,12 dB/sn ölçüldü). Yatağın 1 sn'deki artışı 0,9 dB/sn'de tutan yavaş kazanç uygulandı: yalnız artışlar kısılır, düzey ve düşüşler değişmez. En çok kısma -1.23 dB; sonuç 0.92 dB/sn (sınır 1,0).
6. **15 dk yağmur damlası kurgu noktasında (VARSAYIM):** 8 olay bir kurgu noktasının ±10 ms'ine düştü; enerjisi yağmur izinden geliyor ve aynı olay yağmur kaynak dosyasının karşılık gelen konumunda da var (kaynak doğrulaması). Kurgu tıkı sayılmadı, raporda `nature_at_edit` listesinde.
7. **Bütünleşik yükseklik:** ders verisinin hedefi −20 LUFS; iki dosyada da tek sabit kazançla -1.79 / -1.54 dB kısıldı.
8. **Müzik kuyruğu (`ders3-kuyruk.mp3`):** uygulamanın sözleşmesine göre tek dosya (AlarmPlugin.swift: sonsuz döngü, 2 sn açılış, son 180 sn kısma, 0/5/10/20 dk). Döngü 600 sn (VARSAYIM: varsayılan 10 dk tekrarsız); açılış ve kapanış kararması yok; son 8 sn başa dikişsiz bindirildi. Düzey dersin son sessiz yatağına eşit (-42.47 LUFS; hedef -42.05). İki döngü art arda ölçüldü: yükseliş 0.75 dB/sn, dikişte tık yok. MP3 önizlemede kodlayıcı gecikmesi döngüde çok kısa boşluk bırakabilir; uygulama dosyası WAV ana kopyadan kodlanmalı (SPEC.v3 §14).
