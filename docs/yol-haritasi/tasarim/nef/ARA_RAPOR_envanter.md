# Bugünkü Nef envanteri (2026-10-01, kod okunarak; satır numaraları yaklaşık)

## Nef bugün ne söylüyor
- **Ana sayfa "Bugün · Nef" kartı** (`components/CoachCard.jsx`): `coach` rızasıyla günde bir model çağrısı
  (`lib/coach.js getTodayInsight` → `api/coach.js` → OpenRouter `google/gemini-3.1-flash-lite`). Sonuç
  `gozolcum:coach-today` önbelleğinde, yalnız o gün. Rıza yoksa ya da ağ yoksa `fallbackInsight` kural metni.
- **Kural metinleri, modelsiz:** `homeSuggest.js` (Ana sayfa "Nef ·" satırı), `today.js jevLine` (yol baloncuğu), 13
  onaylı uzun yol cümlesi (`ana-sayfa/d9-karar/nef-cumleleri-onay.md`), `skyView.js nefLine` (hava).
- **Bildirimler** (`notifyAll.planAll` tek liste):
  - 74xx deney türleri: mola, yürüyüş, nefes, su ve çalışma günleri.
  - 75xx çalışma oturumu.
  - 7700–7701 sabah havası, yalnız test derlemesinde.
  - 7800–7859 modül hatırlatmaları; arayüzü kapalı.
  - 7860–7867 ek saatler.
  - 7301 ve 7302.
  - 7600–7607 alarm yedeği.
  - Yürüyüş sorusu 7710–7719 henüz yok.

## Telefonda bilinenler
- **Hava** (WeatherKit, `SkyPlugin.swift`):
  - Saatlik: sıcaklık, hissedilen, yağış olasılığı, simge, gündüz mü.
  - Günlük: en yüksek, en düşük, yağış.
  - `rain {from,to}`.
  - UV, nem, rüzgâr, gün doğumu ve gün batımı **alınmıyor**. `sky-days` kaydı tanımlı ama hiç yazılmıyor.
- **Apple Sağlık** (yalnız okuma): adım, yürüme–koşu mesafesi, egzersiz süresi; 60 gün; son 60 dk adım; WalkGuard
  saatlik. Antrenman ve yürüyüş oturumu okunmuyor.
- **Konum:** yalnız il ve ilçe adı; koordinat saklanmıyor.
- **Alarm ve uyku:** ayarlar ve `alarm-log` olayları (kur, uyan, sabah cevabı, uyku başlangıcı); önerilen yatma saati.
- **Modüller:**
  - Öncesi–sonrası puanlar: nefes 1–5; Dalga sakin, güç ve motive 0–10; Gökyüzü 0–10; Yön uzak 0–10.
  - `acuteEffects` en az 3 seansla anlamlılık hesaplar.
  - Ayrıca yoga, Çemberler, Yılan ve Hızlı Bakış rekorları; WHO-5 (14 günde bir, < 52 düşük).
- **Gelişim:** `dataHub.growthMap` (28 gün, alan başına gün); `growthCenter` Gelişim planında, henüz kodda değil.
- **Düzen:** `stats.summary` (seri, haftalık gün); `habit-log` (mola, su); `notify-log` (deney türleri, dokunuldu mu).
- **Ses:** ElevenLabs ile önceden üretilmiş Türkçe parçalar (`public/voice/tr/{ses}/…`); yürüyüş sesi yok.

## Eksikler (Nef aklı için)
- Nef'in ne söylediğinin kaydı yok; yalnız bugünün model cevabı tutuluyor.
- Uygulamanın açılış saatleri tutulmuyor.
- Gün batımı yok.
- Ortam ışığı sensörü yok.
- Bilim satırı "7 gün tekrar etmez" kuralı kodda yok, çünkü geçmiş tutulmuyor (`remindTexts.js` notu).
