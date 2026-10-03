# Dik Dur · gerçek kişi videosu ve sesler (2026-10-03)

Sahip isteği: "kullandığın adam hiç güzel olmamış ... gerçek bir adam gibi yapman lazım". Ücretli üretim sahip onayıyla,
üst sınır 6,20 $ (fotoğraf + 3 video, her video için en çok bir yeniden üretim). Kişi: bir adam (sahip seçimi).

## Sesler (ElevenLabs, eleven_multilingual_v2)
- Neslihan `wQ7dVQFxIqwokkwsMqqn`, Hakan `DwjDVVARfPVjBKepXK2c` (docs/ANA_BELGE.md ile aynı); akış `MyWlYq5hthpobMuMoHOn`.
- 8 cümle × 2 ses, her biri tek üretim: ddUzat, ddCene, ddOmuz, ddUzatFix, ddCeneFix, ddCalNormal, ddCalTall, ddCalDone
  (metinler lib/voicePack.js; ekrandaki onaylı metinle aynı olduğu dikDur.test.js'te sınanır).
- Sesler dinlenmedi; yalnız süre ve sessizlik ölçüldü. Hakan ddCalDone'da "Tamam," sonrası ≈0,8 sn duraklama var.

## Video (akış `RwC4eXFBk31msNMTTFxz`)
- Fotoğraf: bytedance-seedream-5-pro, 4 seçenek (≈0,60 $); seçilen A (`IC44MturjePy7T92hlb2`): tam yandan, baş ve omuz net.
- Video: kling-3-pro, fotoğraftan, 5 sn, 1080p (her biri ≈0,93 $).
  - uzat (`p9YHh8MHkXxmNKJQEhBU`): doğru, kullanıldı.
  - omuz (`2DwtCE8t9nHwn0AVPdzV`): doğru, kullanıldı.
  - çene 1 (`9isuIqztkZIwmjWD1m45`): yanlış yön, baş ÖNE gitti (düzeltilecek duruş).
  - çene 2 (`YVRgcncqunkM8DzP8Wql`, tek yeniden üretim): son duruş doğru (çene içeride) ama kamera ≈1,7 kat yakınlaştı.
  - İki üretim tutmadı; üçüncü üretim yapılmadı (kural ve bütçe). Çene videosu iki çekimden kurgulandı: çene 1'in
    0,2–3,2 sn'si tersten (baş öndeki duruştan geriye kayar, kadraj sabit) + 0,5 sn geçiş + çene 2'nin 2,6–5,0 sn'si
    (sabit yakın çekim, çene içeride).
- Toplam ≈5,30 $ (fotoğraf 0,60 + 4 video 3,70; sesler ≈0,10).
- İşleme (scratchpad isle.sh): 1080 kare kırpım, 540 px, H.264 main crf 24, sessiz (Kling ses üretmişti, atıldı),
  faststart; ilk ve son kare jpg. public/dikdur toplam ≈380 KB.

## Ekranda
- PostureClip (screens/DikDur.jsx): tutmada video baştan bir kez oynar ve son karede durur; arada hareketin ilk karesi
  soluk; duruşunu göstermede normal duruş fotoğrafı, dikleşte uzat videosu; girişte uzat videosu. Hareketi azalt açıksa
  son kare. Dosya açılamazsa eski çizim. iOS: Capacitor allowsInlineMediaPlayback = true ve
  mediaTypesRequiringUserActionForPlayback = [] (CAPBridgeViewController.swift) — sessiz video kendiliğinden oynar.
- Çekim düzeneğindeki Chromium H.264 oynatmaz; çekimler "hareketi azalt" ile (videonun son karesi) yapıldı.

## 5 sn kapısı (gerçeklik ayrıca soruldu)
- Tur 1: giriş 5/5, uzat tutma 5/5, ara 5/5, gösterme tamam 5/5; çene tutma düzen 5/5 ama gerçek ve uyumlu 0/5
  (tersten çekimin son karesi düz duruştu); gösterme dikleş 3/5 (halkadaki örnek kişi; kamera seni görüyor mu belli değil).
- Düzeltme: çene videosu yukarıdaki kurgu; duruşunu göstermede yüz görünürken "Yüzünü görüyorum." (yasla ekranında
  onaylı cümle).
- Tur 2: çene tutma 390 açık 5/5 (gerçek 5/5), 320 koyu 5/5 (5/5); gösterme dikleş 320 açık 5/5; gösterme normal 390 koyu 5/5.
