# Uyandırma sesleri (Gün Işığı · Kuş Bahçesi · Uyanış Marşı)

Alarm (AlarmKit) sesleri. AlarmKit özel sesi **bir kez** çalar (tekrar etmez) ve dosya **30 sn'den kısa** olmalı
(Apple forum 797172). Dosyalar uygulama paketinde: `ios/App/App/Sounds/nefona-uyan-*.caf`.

## Üretim ve denetim

```sh
cd app
python3 design/uyanma-sesleri/synth.py ios/App/App/Sounds        # 3 ses (tohumlu; her derlemede aynı)
python3 design/uyanma-sesleri/analyze.py ios/App/App/Sounds/nefona-uyan-*.caf        # uyandırma ölçütleri
python3 design/uyanma-sesleri/analyze.py --profil=dalga ios/App/App/Sounds/nefona-dalga-*.caf   # Dalga parçaları
```

Gerekenler: `pip install numpy scipy soundfile pyloudnorm`. Hepsi geçmezse `analyze.py` 1 ile çıkar.

## Kanıt (PubMed; ayrıntı ve tam liste uygulamadaki "Sabah alarmı ve uyku sesi" kartında)

| Tasarım kararı | Kaynak | Güç |
|---|---|---|
| Melodi (düz bip değil) | McFarlane 2020 PLoS One, PMID 31990906 (anket n=50); McFarlane 2020 Clocks Sleep, PMID 33089201 (10+10 kişi; melodik alarm dikkat hatalarını azalttı, ritim tek başına değil) | zayıf / ön bulgu |
| Gün Işığı: 105 BPM, Do majör, vibrafon C6–E7, D6 tahta vuruş 1. ve 3. vuruşta | McFarlane 2020 (PMID 33089201) uyaranının parametreleri | aynı uyaran |
| ~520 Hz tek harmonikli zengin "çapa" ton (melodinin içinde, düz bip değil) | Bruck 2009 J Sleep Res, PMID 19302343 (400/520 Hz kare dalga en düşük uyanma eşiği); Smith 2019 Acad Pediatr, PMID 31276840 (çocuklarda 500 Hz ton %88) | güçlü, ama acil uyandırma; atalet ölçülmedi |
| Yumuşak başlayıp yükselen zarf, 8–15 ms saldırı (ani tam ses yok) | Kaida 2005 Ind Health, PMID 15732320 (zorla uyandırma kalp atışı ve tansiyonu birden yükseltti) | dolaylı |
| Uyanış Marşı 124 BPM (hızlı tempo uyarır) | Bernardi 2006 Heart, PMID 16199412 (uyanık kişilerde) | orta, uyanık kişilerde |
| Kuş Bahçesi: kuş cıvıltısı yalnız ruh hali için | Stobbe 2022 Sci Rep, PMID 36229489 (uyanık kişilerde; bilişe etki yok) | uyandırma için kanıt yok; en yumuşak seçenek |

Kaçınılanlar: yangın alarmı kalıpları (3'lü darbe, siren), 3 kHz bip, çıplak kare dalga, 0 ms tam ses başlangıç,
minör ve yavaş (< 80 BPM) müzik (Lin 2023, PMID 36910785: yavaş tempo işlem hızını düşürdü).

## Telefon hoparlörü ölçütleri (analyze.py)

iPhone hoparlörü ~250 Hz altında neredeyse ses vermez, 1–4 kHz'de en verimlidir (Apple patenti US 9596530; ölçümler).
Ölçütler (uyandırma profili): ≤ 25 sn · 44,1 kHz 2 kanal · kırpılma yok · gerçek tepe ≤ −1 dBTP · −14…−10 LUFS ·
PLR 8–13 dB · ilk 5 sn ≥ −22 LUFS · son 5 sn ≥ ilk 5 sn + 3 LU · enerjinin ≥ %75'i 500 Hz–4 kHz · 300 Hz altı ≤ %3 ·
6 kHz üstü ≤ %3 · 16 kHz üstü yok · %85 enerji ≤ 4,5 kHz · spektral merkez 900–2500 Hz · 350 Hz yüksek geçirende kayıp
≥ −1 LU · 2–6 vuruş/sn · baştaki sessizlik ≤ 50 ms · uçlar < 1e-4 · DC < 1e-4 · iç tık < 12 dB · mono uyumu.

Dalga profili (Sakin/Güç/Motivasyon rahatlama/odak için bestelendi): tempo, yükselme, bant payı ve merkez ölçütü
uygulanmaz; 300 Hz altı ≤ %5 ve 500 Hz–4 kHz ≥ %50 aranır, teknik kusur ölçütleri aynı.

## Neden (Bug 20/22, HATA_GUNLUGU)

Eski Dalga alarm sesleri ve uyku müziği enerjisinin %77–87'si 300 Hz altındaydı; telefon hoparlörü bunu neredeyse hiç
çalmaz. Cihaz tanı satırı "çalıyor 6,4 sn" gösterirken sahibi "müzik sesi yok" dedi. Dalga parçaları artık bir oktav
yukarıda basılıp 400 Hz yüksek geçirenden geçer (design/alarm-sesleri/master_dalga.py); uyku müziği 300 Hz'den
(design/dalga-uyku/master.py).
