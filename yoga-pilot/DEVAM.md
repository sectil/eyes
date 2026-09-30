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
- Ders 1, 3, 5 birim listeleri: `b/ders{1,3,5}/units-ib.json` (`b/work/make_units_ib.py`). Seslendirme sırada.
