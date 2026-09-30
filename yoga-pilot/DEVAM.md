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

## Sıradaki iş (PLAN.v3 §F, B adımının ses kısmı)
1. `b/ders2/units-v3.json` birimlerini Nefona Hoca ile üret, seç (SPEC.v3), Scribe ile doğrula.
2. 20 dk için ek müzik: ≈ 600 sn ElevenLabs Music (Derin evresi ve imge katmanı yetmiyor; C3 zıtlık dokusu yok).
   Tahmin ≈ 12,6 bin kredi (plan ≤ 6 bin diyordu; fark toplam tavandaki paydan düşer). Deftere önce yaz.
3. Ders 2'nin 5, 15 ve 20 dk karışımları; SPEC.v3 ölçütleri; kulak listesi.
4. Kodek testi: `b/mac/kodek_testi.sh` sahibin Mac'inde (afconvert); sahip kör dinler (AAC 64 mı 96 mı).
5. Tasarım Artifact'i (ekranlar + Ders 2'nin üç sürümü tarayıcıda) → **Kapı 3** sahibe.
6. Kapı 3'ten sonra C adımı (kod). Uygulama çalışırken ElevenLabs'e çağrı yapmaz; bütün sesler pakette.

## Plan belgelerine işlenmesi bekleyen notlar (düzeltici raporundan)
PLAN.v2 §B.5, §A.2.2 (23:30), §E.6 #5; PLAN.v3 §D.3 ve Ders 3'ün 45 sn pencere kuralı: ayrıntı `b/INCELEME.md`.
