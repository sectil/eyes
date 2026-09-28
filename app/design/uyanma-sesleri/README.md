# Uyandırma sesleri (Gün Işığı · Kuş Bahçesi · Uyanış Marşı)

Alarm (AlarmKit) sesleri. AlarmKit özel sesi **bir kez** çalar (tekrar etmez) ve dosya **30 sn'den kısa** olmalı
(Apple forum 797172). Dosyalar uygulama paketinde: `ios/App/App/Sounds/nefona-uyan-*.caf`.

## Üretim ve denetim

Pakettekiler **ElevenLabs Music** (eleven_music_v2_5, sözsüz, 26 sn) çıktısından hazırlanır; sahibi telefonda dinleyip
seçti (2026-09-28). Ham dosyalar `eleven/` altında; hoparlöre göre hazırlama `master_eleven.py` (stereo daraltma,
400 Hz yüksek geçiren + raf, ~6 sn'de tam ses, −12 LUFS, ≤ −1,2 dBTP, 24,5 sn CAF).

```sh
cd app/design/uyanma-sesleri
for n in gunisigi kusbahcesi marsi; do python3 master_eleven.py eleven/$n.mp3 $n ../../ios/App/App/Sounds/nefona-uyan-$n.caf; done
python3 analyze.py ../../ios/App/App/Sounds/nefona-uyan-*.caf                 # uyandırma ölçütleri
python3 analyze.py --profil=dalga ../../ios/App/App/Sounds/nefona-dalga-*.caf  # Dalga parçaları
```

| Ses | ElevenLabs üretimi (flow IuAASAm07FEHzjRcHU8c) | İstem özü |
|---|---|---|
| Gün Işığı | ggzIgH3y1vDCilz2pnU5 | vibrafon C6–E7, Do majör, 105 BPM, tahta vuruş 1. ve 3. vuruşta, C5 kare dalga, bassız |
| Kuş Bahçesi | X8zjj4FKZO4rsNjoZ6tP | glockenspiel + celesta G5–G7, Sol majör, 96 BPM, kuş cıvıltısı, bassız |
| Uyanış Marşı | RDcga4CuDwjfUripZOkk | çan + glockenspiel, Do majör, 124 BPM, çekme teller, C5 kare dalga, bassız |

Ölçüm (analyze.py): üçü de −12 LUFS, −1,2 dBTP, 500 Hz–4 kHz %99,3 / %99,6 / %93,7, 300 Hz altı ≈ 0. Uyanış Marşı
bütün ölçütleri geçer. Bilerek kabul edilen iki ölçüt dışılık (sahibi dinleyerek onayladı):
- "iç tık" (Gün Işığı 19,9 · Kuş Bahçesi 24,6 dB): 10 kHz üstündeki kısa tepeler tokmak/çan vuruşları — olayların
  %100'ü tempo ızgarasında (rastgele beklenti %34–41), 12–52 ms, düz spektrum değil; sayısal tık değil. Dalga
  müziklerinde de bu ölçüt uygulanmaz.
- Gün Işığı spektral merkezi 760 Hz (ölçüt 900–2500): model istenen C6–E7 yerine C5–E5'te çaldı (iki istem denendi).
  Hoparlör bandındaki ses yüksekliği Uyanış Marşı ile aynı (−12,3 LUFS, 500 Hz–4 kHz); sahibi cihazda duydu.

Önceki (numpy) sürüm `synth.py`'de durur: `python3 synth.py ../../ios/App/App/Sounds` onları yeniden üretir.
Gerekenler: `pip install numpy scipy soundfile pyloudnorm`. Hepsi geçmezse `analyze.py` 1 ile çıkar.

## Kanıt (PubMed; ayrıntı ve tam liste uygulamadaki "Sabah alarmı ve uyku sesi" kartında)

| Tasarım kararı | Kaynak | Güç |
|---|---|---|
| Melodi (düz bip değil) | McFarlane 2020 PLoS One, PMID 31990906 (anket n=50); McFarlane 2020 Clocks Sleep, PMID 33089201 (10+10 kişi; melodik alarm dikkat hatalarını azalttı, ritim tek başına değil) | zayıf / ön bulgu |
| Gün Işığı: 105 BPM, Do majör, vibrafon C6–E7, D6 tahta vuruş 1. ve 3. vuruşta | McFarlane 2020 (PMID 33089201) uyaranının parametreleri | aynı uyaran |
| ~520 Hz tek harmonikli zengin "çapa" ton (melodinin içinde, düz bip değil) | Bruck 2009 J Sleep Res, PMID 19302343 (400/520 Hz kare dalga en düşük uyanma eşiği); Smith 2019 Acad Pediatr, PMID 31276840 (çocuklarda 500 Hz ton %88) | güçlü, ama acil uyandırma; atalet ölçülmedi |
| Duyulur başlayıp ~6 sn'de tam sese çıkan zarf (ses bir kez, ~24 sn çalar; ~18 sn'si tam ses), 8–15 ms saldırı | Kaida 2005 Ind Health, PMID 15732320 (9 yaşlı kişi, öğle uykusu: zorla uyandırmada kalp atışı ve tansiyon birden yükseldi, önceden karar verilen saatte kendiliğinden uyanmada ani artış yok; yavaş yükselen ses denenmedi) | dolaylı |
| Uyanış Marşı 124 BPM (hızlı tempo uyarır) | Bernardi 2006 Heart, PMID 16199412 (uyanık kişilerde) | orta, uyanık kişilerde |
| Kuş Bahçesi: kuş cıvıltısı yalnız ruh hali için (alt yazı betimleyici: "yumuşak, kuş sesli") | Stobbe 2022 Sci Rep, PMID 36229489 (uyanık kişilerde; bilişe etki yok) | uyandırma için kanıt yok; uyandırma seslerinin en yumuşağı |

Kaçınılanlar: yangın alarmı kalıpları (3'lü darbe, siren), 3 kHz bip, çıplak kare dalga, 0 ms tam ses başlangıç,
minör ve yavaş (< 80 BPM) müzik (Lin 2023, PMID 36910785: yavaş tempo işlem hızını düşürdü).

## Telefon hoparlörü ölçütleri (analyze.py)

iPhone hoparlörü ~250 Hz altında neredeyse ses vermez, 1–4 kHz'de en verimlidir (Apple patenti US 9596530; ölçümler).
Ölçütler (uyandırma profili): ≤ 25 sn · 44,1 kHz 2 kanal · kırpılma yok · gerçek tepe ≤ −1 dBTP · −14…−10 LUFS ·
PLR 8–13 dB · ilk 5 sn ≥ −22 LUFS · son 5 sn ≥ ilk 5 sn + 3 LU · enerjinin ≥ %75'i 500 Hz–4 kHz · 300 Hz altı ≤ %3 ·
6 kHz üstü ≤ %3 · 16 kHz üstü yok · %85 enerji ≤ 4,5 kHz · spektral merkez 900–2500 Hz · 350 Hz yüksek geçirende kayıp
≥ −1 LU · 2–6 vuruş/sn · baştaki sessizlik ≤ 50 ms · uçlar < 1e-4 · DC < 1e-4 · iç tık < 12 dB · mono uyumu.

Dalga profili (Sakin/Güç/Motivasyon rahatlama/odak için bestelendi): tempo, yükselme, bant payı ve merkez ölçütü
uygulanmaz; 300 Hz altı ≤ %5 ve 500 Hz–4 kHz ≥ %50 aranır. İç tık ölçütü de uygulanmaz: Dalga'nın vurmalıları
10 kHz üstünde kısa tepeler yapar (Güç 13,1 · Motivasyon 24,0 · Sakin 14,5 dB; eski Motivasyon 31,8 dB). Öteki teknik
kusur ölçütleri (kırpılma, tepe, uçlar, DC, mono, süre, biçim) aynı.

## Neden (Bug 20/22, HATA_GUNLUGU)

Eski Dalga alarm sesleri ve uyku müziği enerjisinin %77–87'si 300 Hz altındaydı; telefon hoparlörü bunu neredeyse hiç
çalmaz. Cihaz tanı satırı "çalıyor 6,4 sn" gösterirken sahibi "müzik sesi yok" dedi. Dalga parçaları artık bir oktav
yukarıda basılıp 400 Hz yüksek geçirenden geçer (design/alarm-sesleri/master_dalga.py); uyku müziği 300 Hz'den
(design/dalga-uyku/master.py).
