# iPhone ekran tablosu (hw.machine → fiziksel ekran)

Hazırlanma tarihi: 2026-09-24. Kapsam: iPhone 8 / 8 Plus / X ve sonrası, SE 2 ve SE 3 dahil, 24 Eylül 2026 itibarıyla satışta olan en yeni modellere kadar (iPhone 18 Pro / 18 Pro Max).
Makinece okunur sürüm: `app/src/lib/iphoneScreens.json`. Bu dosyada yalnızca doğrulanmış satırlar var: 39 model, 44 identifier.

## Alanlar

- **ppi, çözünürlük, köşegen:** Apple'ın teknik özellik sayfasındaki değerler. Köşegen, Apple'ın pazarlamada kullandığı "X-inch (diagonal)" değeridir. Apple bazı sayfalarda ayrıca "standart dikdörtgen olarak ölçüldüğünde" değerini veriyor; bulunduğu yerde parantez içinde yazıldı.
- **px/ppi köşegeni:** `sqrt(w² + h²) / ppi` ile hesaplanan tutarlılık kontrolü. 39 satırın hepsinde pazarlama köşegeninden en fazla 0,06" sapıyor. Apple'ın verdiği dikdörtgen köşegenleriyle (6.06 / 6.27 / 6.46 / 6.69 / 6.86) iki ondalığa kadar birebir tutuyor.
- **TrueDepth:** Face ID'yi sağlayan ön kamera sistemi. Face ID olan her iPhone'da TrueDepth kamera da var.

## Tablo

Kaynak kısaltmaları:
- **Apple NNNNNN:** `https://support.apple.com/en-us/NNNNNN` Tech Specs sayfası (px, ppi, köşegen).
- **DK:** DeviceKit (identifier, ppi, köşegen, hasFaceID).
- **GB:** GBDeviceInfo (identifier, ppi, köşegen).
- **ADB:** AppleDB (identifier → ad).
- **ADB-res:** AppleDB içindeki çözünürlük alanı.

| machine identifier | pazarlama adı | ppi | çözünürlük (px) | köşegen (inç) | px/ppi köşegeni | TrueDepth | kaynaklar |
|---|---|---|---|---|---|---|---|
| `iPhone10,1`, `iPhone10,4` | iPhone 8 | 326 | 1334×750 | 4.7 | 4.69 | hayır | Apple 111976, DK, ADB, GB |
| `iPhone10,2`, `iPhone10,5` | iPhone 8 Plus | 401 | 1920×1080 | 5.5 | 5.49 | hayır | Apple 111950, DK, ADB, GB |
| `iPhone10,3`, `iPhone10,6` | iPhone X | 458 | 2436×1125 | 5.8 | 5.86 | evet | Apple 111864, DK, ADB, GB |
| `iPhone11,2` | iPhone XS | 458 | 2436×1125 | 5.8 | 5.86 | evet | Apple 111881, DK, ADB, GB |
| `iPhone11,4`, `iPhone11,6` | iPhone XS Max | 458 | 2688×1242 | 6.5 (Apple dikdörtgen: 6.46) | 6.47 | evet | Apple 111880, DK, ADB, GB |
| `iPhone11,8` | iPhone XR | 326 | 1792×828 | 6.1 | 6.06 | evet | Apple 111868, DK, ADB, GB |
| `iPhone12,1` | iPhone 11 | 326 | 1792×828 | 6.1 | 6.06 | evet | Apple 111865, DK, ADB, GB |
| `iPhone12,3` | iPhone 11 Pro | 458 | 2436×1125 | 5.8 | 5.86 | evet | Apple 111879, DK, ADB, GB |
| `iPhone12,5` | iPhone 11 Pro Max | 458 | 2688×1242 | 6.5 | 6.47 | evet | Apple 111878, DK, ADB, GB |
| `iPhone12,8` | iPhone SE (2nd generation) | 326 | 1334×750 | 4.7 | 4.69 | hayır | Apple 111882, DK, ADB, GB |
| `iPhone13,1` | iPhone 12 mini | 476 | 2340×1080 | 5.4 | 5.41 | evet | Apple 111877, DK, ADB, GB |
| `iPhone13,2` | iPhone 12 | 460 | 2532×1170 | 6.1 | 6.06 | evet | Apple 111876, DK, ADB, GB |
| `iPhone13,3` | iPhone 12 Pro | 460 | 2532×1170 | 6.1 | 6.06 | evet | Apple 111875, DK, ADB, GB |
| `iPhone13,4` | iPhone 12 Pro Max | 458 | 2778×1284 | 6.7 | 6.68 | evet | Apple 111874, DK, ADB, GB |
| `iPhone14,4` | iPhone 13 mini | 476 | 2340×1080 | 5.4 | 5.41 | evet | Apple 111873, DK, ADB, GB |
| `iPhone14,5` | iPhone 13 | 460 | 2532×1170 | 6.1 | 6.06 | evet | Apple 111872, DK, ADB, GB, ADB-res |
| `iPhone14,2` | iPhone 13 Pro | 460 | 2532×1170 | 6.1 | 6.06 | evet | Apple 111871, DK, ADB, GB, ADB-res |
| `iPhone14,3` | iPhone 13 Pro Max | 458 | 2778×1284 | 6.7 | 6.68 | evet | Apple 111870, DK, ADB, GB, ADB-res |
| `iPhone14,6` | iPhone SE (3rd generation) | 326 | 1334×750 | 4.7 | 4.69 | hayır | Apple 111866, DK, ADB, GB, ADB-res |
| `iPhone14,7` | iPhone 14 | 460 | 2532×1170 | 6.1 | 6.06 | evet | Apple 111850, DK, ADB, GB, ADB-res |
| `iPhone14,8` | iPhone 14 Plus | 458 | 2778×1284 | 6.7 | 6.68 | evet | Apple 111854, DK, ADB, GB, ADB-res |
| `iPhone15,2` | iPhone 14 Pro | 460 | 2556×1179 | 6.1 | 6.12 | evet | Apple 111849, DK, ADB, GB, ADB-res |
| `iPhone15,3` | iPhone 14 Pro Max | 460 | 2796×1290 | 6.7 | 6.69 | evet | Apple 111846, DK, ADB, GB, ADB-res |
| `iPhone15,4` | iPhone 15 | 460 | 2556×1179 | 6.1 | 6.12 | evet | Apple 111831, DK, ADB, GB, ADB-res |
| `iPhone15,5` | iPhone 15 Plus | 460 | 2796×1290 | 6.7 | 6.69 | evet | Apple 111830, DK, ADB, GB, ADB-res |
| `iPhone16,1` | iPhone 15 Pro | 460 | 2556×1179 | 6.1 | 6.12 | evet | Apple 111829, DK, ADB, GB |
| `iPhone16,2` | iPhone 15 Pro Max | 460 | 2796×1290 | 6.7 (Apple dikdörtgen: 6.69) | 6.69 | evet | Apple 111828, DK, ADB, GB |
| `iPhone17,3` | iPhone 16 | 460 | 2556×1179 | 6.1 | 6.12 | evet | Apple 121029, DK, ADB, GB |
| `iPhone17,4` | iPhone 16 Plus | 460 | 2796×1290 | 6.7 (Apple dikdörtgen: 6.69) | 6.69 | evet | Apple 121030, DK, ADB, GB |
| `iPhone17,1` | iPhone 16 Pro | 460 | 2622×1206 | 6.3 | 6.27 | evet | Apple 121031, DK, ADB, GB |
| `iPhone17,2` | iPhone 16 Pro Max | 460 | 2868×1320 | 6.9 (Apple dikdörtgen: 6.86) | 6.86 | evet | Apple 121032, DK, ADB, GB |
| `iPhone17,5` | iPhone 16e | 460 | 2532×1170 | 6.1 (Apple dikdörtgen: 6.06) | 6.06 | evet | Apple 122208, DK, ADB, GB |
| `iPhone18,3` | iPhone 17 | 460 | 2622×1206 | 6.3 (Apple dikdörtgen: 6.27) | 6.27 | evet | Apple 125089, DK, ADB, GB |
| `iPhone18,1` | iPhone 17 Pro | 460 | 2622×1206 | 6.3 | 6.27 | evet | Apple 125090, DK, ADB, GB |
| `iPhone18,2` | iPhone 17 Pro Max | 460 | 2868×1320 | 6.9 | 6.86 | evet | Apple 125091, DK, ADB, GB |
| `iPhone18,4` | iPhone Air | 460 | 2736×1260 | 6.5 | 6.55 | evet | Apple 125092, DK, ADB, GB |
| `iPhone18,5` | iPhone 17e | 460 | 2532×1170 | 6.1 (Apple dikdörtgen: 6.06) | 6.06 | evet | Apple 126470, DK, ADB, GB |
| `iPhone19,2` | iPhone 18 Pro | 460 | 2622×1206 | 6.3 (Apple dikdörtgen: 6.27) | 6.27 | evet | Apple 148590, DK, ADB |
| `iPhone19,3`, `iPhone19,7` | iPhone 18 Pro Max | 460 | 2868×1320 | 6.9 (Apple dikdörtgen: 6.86) | 6.86 | evet | Apple 148591, DK, ADB |

## Doğrulama durumu

- **Identifier → model eşlemesi:** Her satır en az iki bağımsız kaynakla (DeviceKit + AppleDB) doğrulandı.
  - `iPhone18,5` ve öncesi için üçüncü kaynak olarak GBDeviceInfo da eşleşiyor.
  - `iPhone19,x` satırları (18 Pro / 18 Pro Max) için yalnızca iki kaynak var. GBDeviceInfo bu identifier'ları henüz eklemedi.
- **ppi ve köşegen:** Apple + DeviceKit + GBDeviceInfo, üç kaynak. Bir script ile karşılaştırıldı ve hiç uyuşmazlık çıkmadı.
- **Çözünürlük:** Birincil kaynak Apple. `iPhone14,2 … iPhone15,5` aralığında (14,4 hariç) AppleDB'nin `Display.Resolution` alanıyla birebir eşleşiyor. Geri kalanlar px/ppi köşegen tutarlılık hesabıyla kontrol edildi.
- **TrueDepth:** DeviceKit `hasFaceID` bayrağı. 16e, 17e, Air ve 18 Pro'nun Apple spec sayfalarında da "Face ID enabled by TrueDepth" ifadesi görüldü. SE 3'ün spec sayfasında Home tuşunda Touch ID var.

## Yöntemle ilgili uyarı

Bu ortamda `support.apple.com`, `apple.com`, `api.ipsw.me`, `theapplewiki.com` ve `wikipedia.org` ağ politikası nedeniyle engelliydi. Apple değerleri bu yüzden sayfanın kendisinden değil, WebSearch aracının `support.apple.com` / `apple.com` ile sınırlandırılmış arama sonuçlarından alındı.
- Değerleri sorguya yazmamaya dikkat edildi, bu sayede özet sorguyu tekrar etmiş olmuyor.
- Her Apple değeri ayrıca en az bir açık kaynak kütüphaneyle (ppi/köşegen) veya köşegen hesabıyla (çözünürlük) çapraz kontrol edildi.
- Ürün öncesi, kritik bir kullanımda Apple sayfalarının tarayıcıdan bir kez elle kontrol edilmesi önerilir.

Açık kaynak depolar `git clone` ile çekildi:
- DeviceKit: https://github.com/devicekit/DeviceKit, `Source/Device.swift.gyb`, commit `19528aa` (2026-09-22)
- GBDeviceInfo: https://github.com/lmirosevic/GBDeviceInfo, `GBDeviceInfo/GBDeviceInfo_iOS.m`, commit `5bd6bf8` (2026-09-16)
- AppleDB: https://github.com/littlebyteorg/appledb, `deviceFiles/iPhone/*.json`, commit `605131d` (2026-09-24)

## Doğrulanamayanlar / tabloya alınmayanlar

| identifier | ad | neden |
|---|---|---|
| `iPhone19,4` | iPhone Duo (katlanabilir) | 9 Eylül 2026'da duyuruldu. AppleDB'ye göre çıkış tarihi 2026-10-23, yani henüz satışta değil. Identifier'ı yalnızca AppleDB veriyor, DeviceKit ve GBDeviceInfo'da yok. Apple spec sayfasından (apple.com/iphone-duo/specs) yalnızca iç ekran ≈7.58" ve dış ekran ≈5.36" köşegen alınabildi. Piksel çözünürlüğü, ppi ve kimlik doğrulama yöntemi (Face ID / Touch ID) doğrulanamadı. İki ekranlı olduğu için tek satırlık şemaya da uymuyor. Çıktıktan sonra ayrıca ele alınmalı. |
| — | iPhone 18 / 18e / Air 2 | Haberlere göre 2027 baharına ertelendi. Şu an ne identifier'ı ne de Apple spec sayfası var. |

## Şüpheli / dikkat edilmesi gereken noktalar

1. **AppleDB veri hatası:** `iPhone14,4` (13 mini) için AppleDB `Resolution: 2340×2340` yazıyor. Doğru değer Apple'a göre 2340×1080. Bu yüzden 13 mini'nin çözünürlüğü AppleDB'den teyit edilmiş sayılmadı.
2. **Tabloda fiziksel panel pikseli var, render çözünürlüğü değil.** Bu fark iki grup modelde önemli:
   - **8 Plus:** Sistem 1242×2208'de render edip 1080×1920 panele küçültüyor. `UIScreen.scale` = 3, `nativeScale` ≈ 2.61.
   - **12 mini / 13 mini:** 1125×2436'dan 1080×2340'a küçültülüyor. `nativeScale` ≈ 2.88.
   - Fiziksel ölçü hesabında `UIScreen.nativeBounds` / `nativeScale` ile tablodaki ppi birlikte kullanılmalı. Nokta (pt) başına mm = `nativeScale / ppi × 25.4`.
3. **Köşegen:** `diagonalIn` Apple'ın pazarlama köşegeni. Ekranın köşeleri yuvarlak olduğu için gerçek köşegen biraz daha kısa. Örnek: 6.3" → 6.27", 6.9" → 6.86". Fiziksel boyut için köşegen yerine `px / ppi` kullanılmalı.
4. **Birden fazla identifier:** `iPhone19,3` / `iPhone19,7` (18 Pro Max ABD / global), `iPhone11,4` / `iPhone11,6` (XS Max Çin / global) ve `iPhone10,x` çiftleri (CDMA / GSM) aynı ekrana sahip bölgesel varyantlar.
5. **Yeni model:** `iPhone19,x` identifier'ları çok yeni (DeviceKit bunları 2026-09-21'de ipsw.me'den eklemiş). Tabloda olmayan bir identifier gelirse uygulama fallback'e düşmeli, değer tahmin etmemeli.
