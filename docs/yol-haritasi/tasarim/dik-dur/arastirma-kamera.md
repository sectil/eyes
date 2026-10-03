# Ön kamerayla duruş: Apple belgeleri (2026-10-03)

Araştırma ajanı Apple belge sayfalarını açtı; [doğrulanmadı] işaretliler mühendislik yargısıdır.

- **ARKit yüz izleme** (ARFaceTrackingConfiguration): ARFaceAnchor.transform konum, yön, ölçek verir (metre). Yüz 3 m içinde.
  Başın öne gelişi yalnız telefona göre ölçülür; elde tutulan telefonda baş hareketiyle telefon hareketi karışır.
  Yer çekimine göre baş eğimi, CMDeviceMotion.gravity ile birleştirilerek bulunur [eksen dönüşümü doğrulanmadı].
- **Vision 2B gövde iskeleti** (VNDetectHumanBodyPoseRequest, iOS 14+): 19 eklem (burun, gözler, kulaklar, boyun, omuzlar…).
  Kişi görüntü yüksekliğinin en az üçte biri olmalı. Ön kamera görüntüsünde çalışır.
  **3B** (VNDetectHumanBodyPose3DRequest, iOS 17+): kalça merkezli; masa başında kalça görünmez, sonucu belirsiz.
- **ARBodyTrackingConfiguration:** yalnız arka kamera; kullanılamaz.
- **İkisi birlikte:** ARFrame.capturedImage → VNImageRequestHandler mümkün; Vision 10–15 Hz, ısı durumu izlenir [doğrulanmadı].
- **Kraniovertebral açı yandan ölçülür;** önden 2B eklemlerle ölçülemez. Omuzların öne yuvarlanması önden görünmez.

| Sinyal | Ön kamera |
|---|---|
| Baş eğimi (yer çekimine göre) | Evet, en sağlam |
| Yüz-kamera uzaklığı artışı | Evet, göreli, telefon sabitken |
| Başın yükselmesi | Göreli, telefon sabitken |
| Boyun uzunluğu vekili (kulak/burun–omuz ortası) | Orta; eğimle birlikte bakılmalı |
| Omuz hizası, omuz kalkması | Orta |
| Omuzlar geri / öne yuvarlak | Hayır |
| Mutlak açı, teşhis | Hayır |

Kaynaklar: developer.apple.com/documentation/arkit/arfaceanchor, …/arfacetrackingconfiguration,
…/arbodytrackingconfiguration, …/vision/vndetecthumanbodyposerequest, …/vision/vndetecthumanbodypose3drequest,
…/coremotion/cmdevicemotion/gravity, …/foundation/processinfo/thermalstate-swift.property; WWDC20 10653, WWDC23 111241,
WWDC19 228.
