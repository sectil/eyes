# Yoga: yeni oturum için devam notu (2026-09-30)

Önce oku: `yoga-pilot/v3/PLAN.v3.md` (onaylı plan), `yoga-pilot/SAHIP_ISTEKLERI.md` (madde 7 ve 8: kararlar),
`yoga-pilot/b/SPEC.v3.md` (bağlayıcı üretim şartnamesi), `yoga-pilot/b/INCELEME.md` (metin incelemeleri).

## Durum
- Kapı 1 (plan) ve Kapı 2 (ses ve müzik) kapandı. Ses: **Nefona Hoca** (`Sr5w7dIZaRDglJ2cLaJm`, ElevenLabs'e kayıtlı).
  Müzik: **A = ElevenLabs Music**. İnceleyici adı yok: karar 2 yedeği (iki bağımsız model incelemesi + sahibin kulağı).
- A adımı bitti: Ders 2 15 dk üç sesle, kör paket `render/out/kor/`, anahtar `render/out/_kor_anahtar.json`.
- B adımının metin kısmı bitti ve iki incelemeden geçti (`b/`): SPEC v3, Ders 2 deltası (`b/ders2/units-v3.json`,
  28 birim, ≈ 5,3 bin kredi), Parti 1 metinleri `b/ders1`, `b/ders3`, `b/ders5` (henüz seslendirilmedi).
- Harcanan: A adımı ≈ 14,3 bin kredi (`render/ledger.jsonl`). Tavan: parti 195 bin, toplam 600 bin.

## Başlarken
1. Çalışma alanını kur: `Y=<scratchpad>/yoga`; `render/` araçlarını ve `pilot-kaynak/` dosyalarını oraya kopyala
   (`$Y/render/tools`, `$Y/pilot/ders2.lesson.json`, `$Y/pilot/timing.py`).
2. Ses kaynaklarını geri yükle: `render/_kalici/README.md` (müzik A yatakları, ortak katmanlar, Nefona Hoca parçaları).
3. ElevenLabs araçlarının bu oturumda göründüğünü denetle (ToolSearch "+ElevenLabs creative"). Yoksa sahibe söyle.

## Sıradaki iş: İLK BÖLÜMÜN SESLERİ (sahip, 2026-09-30; SAHIP_ISTEKLERI madde 9–10)
İlk bölüm = Ders 1, 2, 3, 5. Uygulama kodu (C adımı) BAŞKA bir oturumda yazılıyor: bu oturum `app/` klasörüne
DOKUNMAZ; yalnız `yoga-pilot/` altına yazar ve her partiden sonra kaydeder (git pull --rebase, sonra push).
1. Ders 2: `b/ders2/units-v3.json` birimlerini Nefona Hoca ile üret, seç (SPEC.v3), Scribe ile doğrula; 20 dk için
   ≈ 600 sn ek müzik A (≈ 12,6 bin kredi). 5, 15 ve 20 dk karışımları + timeline.json; kulak listesi.
2. Ders 1, 3, 5: `b/ders{1,3,5}/*.lesson.json` birimlerini üret, seç, doğrula; müzik A ailesiyle karışımlar:
   Ders 1 ve 5'te 3, 5, 15 dk; Ders 3'te 5 ve 15 dk (+ uyku sonu müzik kuyruğu). Her dersin kendi müzik teması
   (PLAN.v2 §A.2.1) için ElevenLabs Music; deftere önce yaz; tavan parti başına 195 bin.
3. Çıktı adları: `render/out/ilk-bolum/ders<N>-<dk>.mp3` ve `.timeline.json` (Ders 2 15 dk bugünkü
   `render/out/ders2-15dk-hoc-A.mp3` ile aynı yapı). Uygulamaya kopyalama kod oturumunun işi.
4. Her ders bittiğinde sahibe dosyaları gönder (kulak onayı) ve kulak listesini ekle.
5. Kodek testi: `b/mac/kodek_testi.sh` sahibin Mac'inde; sonuç gelene kadar dosyalar MP3.

## Plan belgelerine işlenmesi bekleyen notlar (düzeltici raporundan)
PLAN.v2 §B.5, §A.2.2 (23:30), §E.6 #5; PLAN.v3 §D.3 ve Ders 3'ün 45 sn pencere kuralı: ayrıntı `b/INCELEME.md`.

## İlk bölüm ilerlemesi (2026-09-30, ses oturumu; dal `claude/eager-clarke-7547q6`)
- Çalışma alanı: `Y=<scratchpad>/yoga`; eski yol `/tmp/claude-0/-home-user/f143c393-…/scratchpad/yoga` bu kök'e sembolik bağ
  (araçlardaki sabit yollar değişmeden çalışsın). `pip install numpy scipy soundfile pyloudnorm lameenc pyflakes`.
- Yeni araçlar (`render/tools/`): `ib.py` (defter, tavan, indirme), `harvest.py` (imzalı adresleri oturum kaydından okur;
  elle kopyalama yok; alt ajan kayıtları da taranır), `sel_ib.py` (sıralama, Scribe listesi, seçim/kesim/işleme),
  `mixib.py` (ders × süre karışımı, timeline/2), `rapor_ib.py` (rapor + kulak listesi). Müzik: `music/el/tools/clash_ib.py`,
  `level_ib.py`. Ücretli çağrıların context'i etiketli: `[ib dNN/birim]`, `[ibs dNN/birim/tN]`, `[ibm dNN/parça]`.
- **Ders 2 bitti** (5, 15, 20 dk): `render/out/ilk-bolum/ders2-{5,15,20}.mp3` + `.timeline.json`, `kulak-ders2.md`;
  §12.1 ölçütlerinin hepsi geçti. 28 birim seslendirildi, hepsi Scribe'la birebir. Ek müzik: `el-derin-c` (düzey
  dengelenmiş), `el-imge-b`, `el-zitlik-b` (ilk zıtlık denemesi reddedildi). Ayrıntı `kulak-ders2.md`.
- Ders 1, 3, 5 birim listeleri: `b/ders{1,3,5}/units-ib.json` (`b/work/make_units_ib.py`); hepsi seslendirildi.
- **Ders 3 ve Ders 5 bitti** (Ders 3: 5, 15 dk + müzik kuyruğu; Ders 5: 3, 5, 15 dk): `render/out/ilk-bolum/`
  `ders3-{5,15}.mp3`, `ders3-kuyruk.mp3`, `ders5-{3,5,15}.mp3` + `.timeline.json`; `kulak-ders3.md`, `kulak-ders5.md`.
  §12.1 ölçütlerinin hepsi geçti (ayrıntı `_rapor/`). Seçimler: Ders 3 67/67, Ders 5 68/68 birim Scribe'la harf harf.
- **Müzik kuyruğu** tek dosya: uygulama sözleşmesi taban dalında (`app/ios/App/App/AlarmPlugin.swift:547`, `:1074`;
  `app/src/lib/yogaLessons.js:186` `musicTailFile: null`): dosya sonsuz döngüyle çalar, 2 sn açılır, son 180 sn kısılır.
  Dosyada kararma yok, döngü 600 sn, dikiş eşit güçle (`render/tools/kuyruk_ib.py`). `musicTailFile`'ı kod oturumu doldurur.
- **MP3 süre başlığı:** `lameenc` Xing başlığı yazmıyordu; oynatıcılar süreyi ilk çerçeveden tahmin ediyordu
  (`ders2-15.mp3` başlıkta 1058 sn). `mixib.add_xing` başa Xing çerçevesi ekliyor; bütün dosyalar (Ders 2 dahil) yeniden
  üretildi, ses çerçeveleri bayt bayt aynı.
- **Ders 1 bitti** (3, 5, 15 dk): `ders1-{3,5,15}.mp3` + `.timeline.json`, `kulak-ders1.md`; §12.1 ölçütlerinin hepsi
  geçti. 68/68 birim (2'si `kulak` bayrağıyla: `c3.ad` Scribe "Brahmari" yazıyor, `car.c1d` tek heceli "Al…"). Nefes
  kilidi (sahip kararı, SAHIP_ISTEKLERI 15–16): kilitli 87 parçanın sessiz başı ve sonu atıldı (`kilit_kirp_ib.py`),
  periyodu 1,2 sn olan 8 "ver…" klibinin `gapFloor` değeri 0,6 → 0,5 sn. Üç noktasız yeniden seslendirme denendi,
  çözmediği için kullanılmadı. Müzik: `d1-varis`, `d1-kapanis` (+1 yarım ses), sentez bordun (alışta kabarır; 15 dk'da
  yükseliş sınırlayıcısı en çok 1,48 dB kısıyor).
- **Yeni araçlar ve değişiklikler:** `kuyruk_ib.py`, `kalici_ib.py` (seçilmiş parçalar → `_kalici/sel/hoc/dNN/*.flac`),
  `synth_ib.py` (Ders 5 tonu + çan, Ders 1 bordunu). `mixib.py`: yavaş yatak yükseliş sınırlayıcısı (`bed_rise_limit`;
  Ders 3'te konuşma/yatak döngüsünde, Ders 1 ve 5'te yerel kısmadan sonra), yağmur damlası kaynak doğrulaması
  (`nature_at_edit`), Ders 5 için çanı da kapsayan yerel kısma (`duck_tone`), Xing başlığı. `sel_ib.py`: işlemeden sonra
  tık veren çekimde sıradakine geçer; `--kulak` (SPEC.v3 §6.3 son adım).
- **Kredi:** API kotası (131 bin) bir kez doldu; sahip kredi ekledi (186 bin). v4 çekimleri ÜCRETLİ (durum yanıtındaki
  0 kredi yanıltıcı): hesap 133.485 kullanılmış gösterirken defter 132.745 (konuşma ≈ 48 bin). Aradaki ≈ 740 kredinin
  kaynağı bulunamadı. Bu parti ≈ 118,4 bin (tavan 195 bin).
- **5 saniye kuralı** (bağlayıcı, `docs/yol-haritasi/tasarim/SAHIP_ISTEKLERI.md`): ses için bu ortamda dinleyebilen
  değerlendirici yok; sahip kararı (SAHIP_ISTEKLERI 15): dosyalar "5 sn sınaması yapılmadı" notuyla sahibe gider, ilk
  5 saniyeyi sahip değerlendirir. Ders 2, 3, 5 gönderildi, sahip sorun bildirmedi (madde 17); Ders 1 ayrıca gönderildi.
- Açık: SPEC §10 yardımcı dosyaları (ilk ders girişi, bırakma ön klipleri, durdurma dönüşü) kurulmadı.
