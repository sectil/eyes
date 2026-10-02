# Ders 2: ölçüm raporu ve kulak listesi (ilk bölüm)

Ses: Nefona Hoca (`Sr5w7dIZaRDglJ2cLaJm`, eleven_v4, 3 çekim). Müzik: A (ElevenLabs Music). Karıştırıcı: `render/tools/mixib.py` (pilot `mix.py` fonksiyonları). Şartname: `b/SPEC.v3.md`.
Dosyalar tarayıcı önizlemesidir (MP3, SPEC.v3 §10). Uygulama dosyası (AAC-LC m4a) Mac'te WAV ana kopyadan kodlanır (§14); WAV ana kopyalar depoya girmez.

## Dosyalar ve §12.1 ölçütleri

| Ölçüt | 5 dk | 15 dk | 20 dk |
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

| Ölçüm | 5 dk | 15 dk | 20 dk |
|---|---|---|---|
| Dosya | `ders2-5.mp3` | `ders2-15.mp3` | `ders2-20.mp3` |
| Bayt | 4.232.770 | 12.684.787 | 13.677.031 |
| Kodlama | ABR 120 kbit/s (lameenc, q=2) | ABR 120 kbit/s (lameenc, q=2) | ABR 96 kbit/s (lameenc, q=2) |
| Süre (çözülmüş, sn) | 300.017 | 900.024 | 1200.014 |
| Bütünleşik (LUFS) | -17.30 (hedef -18) | -17.39 (hedef -18) | -18.01 (hedef -18) |
| Dosya kısması (dB) | -0.71 | 0.00 | 0.00 |
| Gerçek tepe MP3 (dBTP) | -4.70 | -3.02 | -2.86 |
| Konum ilintisi en düşük / kayma | 0.990 (c2.akis#2) / 0.023 ms | 0.988 (br.orta#2) / 0.000 ms | 0.988 (c2.n02) / 0.023 ms |
| Konuşma/yatak en düşük (dB) | 17.07 | 16.89 | 16.02 |
| Yerel yatak kısması | 0 | 0 | 0 |
| Yatak zarfı en büyük artış (dB/sn) | 0.90 @ 206.6 sn | 0.83 @ 844.9 sn | 0.92 @ 918.5 sn |
| Plan: check_plan / boş pay (min, sn) | geçti / 15.97 | geçti / 120.80 | geçti / 184.94 |
| Tık (MP3: kurgu / karışım / konuşma içeriği) | 0 / 0 / 140 | 0 / 0 / 327 | 0 / 0 / 407 |

Konuşma içeriği tıkı: 10 kHz üstü ani olayın enerjisi seçilmiş konuşma parçasının kendisinden geliyor (ünsüzler); kurgu noktası ve karışım kaynaklı tık sıfır.

## Bu partide seslendirilen birimler (28)

Her birim 3 çekim; nesnel sıralamadaki ilk çekimden başlayarak Scribe ile harf harf karşılaştırıldı, tutan ilk çekim seçildi (SPEC.v3 §6.3). Hepsi birebir eşleşti: evet.

| Birim | Çekim | Scribe | Bayraklar |
|---|---|---|---|
| `n1.sec` | t1 | birebir | kesim-kulak |
| `n2.hatirla` | t1 | birebir | derin>5, kesim-kulak |
| `c4.ses.orman` | t1 | birebir | — |
| `c4.ses.kiyi` | t2 | birebir | — |
| `a.gozler.kisa` | t1 | birebir | — |
| `a.kolay.kisa` | t3 | birebir | — |
| `n1.soyle.kisa` | t1 | birebir | — |
| `n2.hatirla.kisa` | t1 | birebir | derin>5 |
| `car.agir` | t1 | birebir | eklem>2yt, kesim-kulak |
| `car.hafif` | t3 | birebir | eklem>2yt, kesim-kulak |
| `c3.agir` | t1 | birebir | derin>5, kesim-kulak |
| `c3.gelmezse` | t3 | birebir | derin>5, kesim-kulak |
| `c3.hafif` | t1 | birebir | — |
| `c3.birak` | t3 | birebir | derin>5, kesim-kulak |
| `c4.yerles` | t3 | birebir | derin>5 |
| `c4.adim` | t3 | birebir | derin>5 |
| `c4.koku` | t1 | birebir | — |
| `c4.pencere` | t1 | birebir | derin>5, kesim-kulak |
| `c4.donus1` | t2 | birebir | derin>5, kesim-kulak |
| `c4.acele` | t3 | birebir | — |
| `c4.geride` | t2 | birebir | — |
| `c4.x.istemiyor` | t2 | birebir | derin>5 |
| `g.ilk` | t3 | birebir | — |
| `k.hizli.imge` | t2 | birebir | kesim-kulak |
| `k.hizli.his` | t2 | birebir | kesim-kulak |
| `d.goz` | t2 | birebir | — |
| `d.kalk` | t1 | birebir | — |
| `d.bekle` | t1 | birebir | — |

## Kulak listesi

Sahibin dinlerken özellikle bakacağı yerler. Hiçbiri ölçütten kalmadı; hepsi kural gereği listelenir (SPEC.v3 §16).

1. **kesim-kulak**: çok cümleli birim cümle sonlarından kesildi; kesim yalnız ölçüyle denetlendi (Scribe sözcük zamanı yok): `n1.sec`, `n2.hatirla`, `car.agir`, `car.hafif`, `c3.agir`, `c3.gelmezse`, `c3.birak`, `c4.pencere`, `c4.donus1`, `k.hizli.imge`, `k.hizli.his`.
2. **derin>5**: Derin evrede eklemleme 5,0 hece/sn üstü (VARSAYIM tavan): `n2.hatirla (n2.hatirla#1)`, `n2.hatirla (n2.hatirla#2)`, `n2.hatirla.kisa (n2.hatirla.kisa)`, `c3.agir (c3.agir#1)`, `c3.agir (c3.agir#2)`, `c3.gelmezse (c3.gelmezse#1)`, `c3.gelmezse (c3.gelmezse#2)`, `c3.birak (c3.birak#1)`, `c4.yerles (c4.yerles)`, `c4.adim (c4.adim)`, `c4.pencere (c4.pencere#1)`, `c4.pencere (c4.pencere#2)`, `c4.pencere (c4.pencere#3)`, `c4.donus1 (c4.donus1#1)`, `c4.x.istemiyor (c4.x.istemiyor)`.
3. **eklem>2yt**: taşıyıcı ekleminde F0 basamağı > 2 yarım ton: `car.agir`, `car.hafif`.
4. **5 dk dosya kısması -0.71 dB**: konuşma yoğun olduğu için bütünleşik yükseklik -16.59 LUFS çıktı (pencere -18 ± 1); bütün dosya tek sabit kazançla kısıldı, oranlar değişmedi (VARSAYIM).
5. **5 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.90 dB/sn (206.6. sn; eşik 1,0).
6. **5 dk boş pay sınıra yakın**: 15.97 sn (taban 15).
7. **15 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.83 dB/sn (844.9. sn; eşik 1,0).
8. **20 dk yatak zarfı sınıra yakın**: en büyük 1 sn artış 0.92 dB/sn (918.5. sn; eşik 1,0).
9. **20 dk müzik geçişi**: Derin ailesi: aile içi geçiş 841.23 sn (c4.ses.orman; geçiş penceresinde konuşma payı 0.40; uygun aralık 787.7–855.5)

## Müzik (bu partide üretilen ve kararlar)

- **Ek parçalar (20 dk için, SPEC.v3 §7.3):** `el-derin-c` (300 sn, ölçülen ton Fa majör) ve `el-imge-b` (180 sn, La minör).
  Ton ailesi A/Re; komşu parçalarla uyum endeksi en çok 0,18 (sınır 0,2, VARSAYIM), yerel hız değişimi gerekmedi.
  İki parçada da vokal denetimi (Scribe) boş metin verdi; davul/vuruş yok (nabız belirginliği ≤ 0,06).
- **Uyum endeksi:** pilotun "clash" kodu depoda yoktu; `music/el/tools/clash_ib.py` ile yeniden kuruldu (pilotun 36 çiftine
  en büyük sapma 0,015). Yaklaşık bir ölçüdür (VARSAYIM).
- **`el-derin-c` düzey dengeleme:** parça 8 sn'de bir 1,1–1,2 dB/sn'lik yavaş kabarmalar yapıyordu (istemde "flat dynamics").
  Yavaş dengeleyici uygulandı (`level_ib.py`, k 0,8; kazanç −1,1…+0,9 dB; tını ve ton değişmez) → en çok 0,85 dB/sn.
- **Zıtlık dokusu (20 dk, C3 `c3.agir` → `c3.birak`):** ücretsiz yol (Derin yatağını 300 Hz'den inceltmek) Derin
  parçalarını 10–21 dB kıstığı için kullanılamadı. SPEC istemiyle üretilen ilk parça (`el-zitlik`) Derin yazmacında çıktı
  (ağırlık merkezi 100 Hz, yerine geçeceği parçayla aynı): duyulur zıtlık yok, reddedildi. İkinci parça (`el-zitlik-b`) istem
  değiştirilerek üretildi (VARSAYIM: "Ambient meditation pad in D major, light and airy: soft, high sustained strings ... no bass
  and no low notes" + zorunlu son cümle): Re majör, ağırlık merkezi 661 Hz, uyum endeksi ≤ 0,17, vokal yok. Derin zinciri
  zıtlıktan sonra aynı dosyanın kaldığı yerden sürer; hiçbir bölüm iki kez çalmaz.
- **İmge piyanosu:** `el-imge-b`'de 11 yüksek frekans anı olay var; hepsi nota başlangıcı (alt bantta +25–34 dB), düzeyleri
  −74…−81 dBFS: tık değil.
- **Pencere kabarması (20 dk, `c4.pencere`):** +6 dB korunarak çıkış rampası 6 sn yerine 12 sn (VARSAYIM). 6 dB / 6 sn tam
  1 dB/sn sınırındaydı ve müzikle birlikte 1,23 dB/sn ölçüldü.
- **Aile içi geçiş kuralı:** geçiş konuşmanın altında (pencerede konuşma payı ≥ 0,5 olan adaylar önce) ve mevcut dosya en geç
  uygun ana kadar çalar; böylece pilotta hiç kullanılmamış `el-vd-b`'nin kabaran bölümü çalmıyor.

## Öteki notlar

- 15 dk'daki birimlerin çoğu A adımında (pilot) Nefona Hoca ile seslendirilmiş kayıtlı parçalardır; onların kulak listesi
  `render/out/kulak_listesi.md`'de (Scribe istisnası: `a.durus`, `car.sag1`, `c2.yer`, `c2.alt`; taşıyıcı eklemi > 2 yt: 13 taşıyıcı).
- Metni değişen birimler (`n1.sec`, `n2.hatirla`, `c4.ses`) bu partide yeniden seslendirildi ve karışımda yenileri çalıyor.
- Sahne: ilk yayında yalnız Orman. `c4.ses.kiyi` seslendirildi ama karışımda yok.
- Yardımcı birimler (`g.ilk`, `k.hizli.imge`, `k.hizli.his`, `d.goz`, `d.kalk`, `d.bekle`) seslendirildi ve seçildi; SPEC.v3
  §10'daki yardımcı dosyalar (ilk ders girişi, bırakma ön klipleri, durdurma dönüşü) bu teslimde **kurulmadı**.
- Kodek testi (`b/mac/kodek_testi.sh`) sahibin Mac'inde bekliyor; o zamana kadar dosyalar MP3.
- `eleven_v4` seslendirmesinde ElevenLabs durum yanıtı her çekim için 0 kredi gösterdi, ama çekimler **ücretliymiş**:
  hesabın API sayfası 133.485 kredi kullanılmış gösterdi (sahibin ekran görüntüsü, 2026-09-30), defterin toplam sayacı
  aynı anda 132.910 idi ve bunun ≈ 48 bini konuşma. Konuşma ücretsiz olsaydı hesap ≈ 85 bin gösterirdi. Defter TTS için
  0,99989 kredi/karakter/çekim tahminini tutuyor; durum yanıtındaki fiyat alanına güvenilmez.
- **MP3 süre başlığı (sonradan düzeltildi):** ilk kodlamada Xing başlığı yoktu; oynatıcılar süreyi ilk çerçevenin bit
  hızından tahmin ediyordu (15 dk dosya başlıkta 1058 sn, 20 dk dosya 1369 sn görünüyordu). Kodlayıcıya Xing çerçevesi
  (çerçeve sayısı, bayt sayısı, arama tablosu) eklendi ve üç dosya yeniden üretildi; ses çerçeveleri aynı (çözümde yalnız
  çözücünün 529 örneklik gecikmesi kalktı, fark 0).
