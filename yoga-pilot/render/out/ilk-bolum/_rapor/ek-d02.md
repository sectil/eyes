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
