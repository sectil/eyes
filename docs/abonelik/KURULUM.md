# Nefona abonelik kurulumu (App Store + RevenueCat)

Uygulama kodu: `app/src/lib/subscription.js` (RevenueCat), `app/src/screens/Paywall.jsx` (ödeme ekranı).
Uygulama şunları bekler: RevenueCat'te **current** işaretli bir offering, içinde **Annual / Monthly / Weekly**
paketleri ve **`premium`** entitlement'ı.

## Gizlilik kuralı
- **.p8 dosyası (In-App Purchase anahtarı) GİZLİDİR**: depoya, sohbete, e-postaya konmaz. Yalnız RevenueCat'e yüklenir,
  yedeği kişisel güvenli bir yerde durur. Apple yalnız bir kez indirtir.
- RevenueCat **`sk_…` gizli anahtarı** uygulamada ve depoda ASLA kullanılmaz (uygulama `appl_…` herkese açık anahtarla çalışır).
- Aşağıdaki Issuer ID ve Key ID tek başına yetki vermez (Apple bunları istek başlığında açıkça taşır); kayıt için burada.

## App Store Connect durumu (2026-09-27)
- Paid Apps Agreement: **Active**; Free Apps Agreement: Active
- Banka hesabı: Active (TRY; hesap no alanına IBAN'daki 16 haneli hesap kısmı girildi — Apple IBAN ile eşleşme denetliyor)
- Vergi: Apple beyanı + W-8BEN gönderildi; Part II (treaty) boş bırakıldı (Apple Finans: App Store "sales/commission",
  genelde ABD stopajı yok — https://developer.apple.com/forums/thread/708842)
- DSA (AB trader beyanı): tamamlandı. "Trader değilim / AB'de yok" seçildiyse yayından önce AB ülkeleri
  Pricing and Availability'den kaldırılmalı. (Hangi seçeneğin işaretlendiği kayıtlı değil — kontrol et.)
- Açık not: tüzel kişi adresindeki posta kodu (48000) gerçek adresle karşılaştırılıp gerekirse düzeltilecek.

## In-App Purchase anahtarı (RevenueCat için)
| Alan | Değer |
|---|---|
| Ad | RevenueCat |
| Issuer ID | `7377b680-1b0e-4d8d-9d5e-354e5fe930da` |
| Key ID | `D86Y222QTD` |
| Oluşturma / indirme | 2026-09-27, Haydar Erkaya |
| .p8 dosyası | kullanıcıda (depoda DEĞİL) |

## Abonelik ürünleri (Subscription Group: **Nefona Premium**)
Product ID'ler sonradan değiştirilemez. Grup sırası: Yıllık → Aylık → Haftalık.

| Reference Name | Product ID | Süre | Fiyat (TR) | Deneme |
|---|---|---|---|---|
| Nefona Yıllık | `nefona_premium_annual` | 1 yıl | ₺899,99 | 7 gün ücretsiz |
| Nefona Aylık | `nefona_premium_monthly` | 1 ay | ₺89,99 | 7 gün ücretsiz |
| Nefona Haftalık | `nefona_premium_weekly` | 1 hafta | ₺29,99 | 7 gün ücretsiz |

## RevenueCat
- Proje adı panelde "nefeno" (yazım hatası olabilir → Nefona).
- Yapılacak: Apps → New → App Store (Bundle ID `com.sectil.eyelume`), .p8 + Key ID + Issuer ID yükle
  → `appl_…` anahtarı oluşur → koda varsayılan olarak eklenecek (herkese açık anahtar).
- Products: üç ürün içe aktarılır. Entitlement: **`premium`** (üç ürün bağlı).
  Offering: **`default`**, paketler Annual/Monthly/Weekly → **Make current**.
- Test Store (`test_…`) anahtarı yalnız sahte mağaza içindir; gerçek satın alma yapmaz.

## Sıradaki adımlar
1. [ ] RevenueCat'e App Store uygulaması + .p8 → `appl_` anahtarı → Claude koda ekler
2. [ ] App Store Connect'te üç abonelik + 7 gün deneme
3. [ ] RevenueCat ürünler, `premium`, `default` (current)
4. [ ] Telefonda Sandbox hesabıyla deneme satın alma (`bash app/scripts/device-run.sh`)
5. [ ] (Öneri) App Store Small Business Program başvurusu (%15 komisyon; şartları Apple sayfasında doğrula)
