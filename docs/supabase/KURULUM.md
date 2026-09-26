# Supabase hesap kurulumu (Build 23b)

Proje: `https://ueydpapmrpdjbnfeijgi.supabase.co` (Frankfurt). Uygulamadaki anahtar herkese açık türden
(`sb_publishable_…`). Gizli anahtar (`sb_secret_…` / service_role) uygulamaya, depoya ya da sohbete ASLA yazılmaz.

## 1. Tablolar ve güvenlik kuralları
YAPILDI (2026-09-26): tablo + RLS + delete_my_account kuruldu; Supabase bağlayıcısıyla doğrulandı ve fazla yetkiler
(DELETE/TRUNCATE) geri alındı (migration `profiles_least_privilege`). Güvenlik denetiminde tek uyarı: giriş yapmış kişi
`delete_my_account` çağırabilir — bilerek böyle (yalnız kendi hesabını siler; App Store 5.1.1(v)).

## 2. E-posta ile 6 haneli kod (kendi SMTP gerekir)
Supabase belgesi (2026-09-26 okundu): hazır e-posta servisi YALNIZ proje ekibindeki adreslere gönderir; diğer herkes
"Email address not authorized" alır. Şablonlar da kendi SMTP bağlanmadan düzenlenemez. Bu yüzden e-postayla giriş,
kendi SMTP (ör. Resend; alan adı + DNS kaydı) bağlanana kadar gerçek kullanıcılar için ÇALIŞMAZ. Uygulama bu hatada
"E-postayla giriş şu an açık değil. Apple ile devam et ya da hesapsız dene." der.
SMTP bağlandıktan sonra:
1. **Authentication → Emails → Templates**: **Magic link or OTP** ve **Confirm signup** gövdesine
   `<p>Giriş kodun: <strong>{{ .Token }}</strong></p>` ekle.
2. **Authentication → Sign In / Providers → Email**: **Email OTP Length** 6.

## 3. Apple ile giriş (iPhone)
1. YAPILDI (2026-09-26): Supabase → **Authentication → Sign In / Providers → Apple** → **Enable**.
   **Client IDs** kutusuna uygulamanın paket kimliğini yaz: `com.sectil.eyelume` → **Save**.
   (Uygulama içi giriş Apple'ın kimlik belgesini doğrudan gönderir; web girişi için gereken "Secret Key" bu yöntemde gerekmez.)
2. YAPILDI (depoda): `ios/App/App/App.entitlements` (com.apple.developer.applesignin) + `CODE_SIGN_ENTITLEMENTS`.
   testflight.sh otomatik imzalama + `-allowProvisioningUpdates` ile App ID'ye yetkiyi kendisi ekler. Hata verirse:
   Xcode → App → Signing & Capabilities → + Capability → Sign in with Apple.
3. Mac'te: `npx cap sync ios` (testflight.sh bunu zaten yapar).

## 4. Google ile giriş (sonra)
Google Cloud'da iOS OAuth istemcisi açılınca eklenecek. Google varsa Apple ile giriş zorunlu (App Store 4.8); Apple hazır.

## 5. Abonelik hesaba bağlı
Giriş yapınca RevenueCat kullanıcı kimliği = Supabase kullanıcı kimliği (`linkPurchaser`). Yeni telefonda aynı hesapla
girince abonelik görünür. Hesapsız kullanımda RevenueCat'in anonim kimliği kalır; "Satın alımları geri yükle" yine çalışır.
