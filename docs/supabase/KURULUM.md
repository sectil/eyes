# Supabase hesap kurulumu (Build 23b)

Proje: `https://ueydpapmrpdjbnfeijgi.supabase.co` (Frankfurt). Uygulamadaki anahtar herkese açık türden
(`sb_publishable_…`). Gizli anahtar (`sb_secret_…` / service_role) uygulamaya, depoya ya da sohbete ASLA yazılmaz.

## 1. Tablolar ve güvenlik kuralları
Supabase → **SQL Editor** → **New query** → `docs/supabase/001_hesap.sql` dosyasının tamamını yapıştır → **Run**.
"Success. No rows returned" görmelisin. Tekrar çalıştırmak güvenli.

## 2. E-posta ile 6 haneli kod
Uygulama bağlantı yerine kod ister (uygulamadan çıkmadan giriş).
1. **Authentication → Emails → Templates** (bazı arayüzlerde **Email Templates**).
2. **Magic Link** ve **Confirm signup** şablonlarının ikisine de gövdeye şu satırı ekle:
   `<p>Giriş kodun: <strong>{{ .Token }}</strong></p>`
   (Konu satırı örneği: `EyeTrail giriş kodun`.)
3. **Authentication → Sign In / Providers → Email**: **Email OTP Length** 6 olsun (uygulama 6–8 haneyi kabul eder).

Not: Supabase'in hazır e-posta servisi saatte birkaç e-postayla sınırlıdır; yayından önce kendi SMTP (ör. Resend)
bağlanmalı: **Authentication → Emails → SMTP Settings**.

## 3. Apple ile giriş (iPhone)
1. Supabase → **Authentication → Sign In / Providers → Apple** → **Enable**.
   **Client IDs** kutusuna uygulamanın paket kimliğini yaz: `com.sectil.eyelume` → **Save**.
   (Uygulama içi giriş Apple'ın kimlik belgesini doğrudan gönderir; web girişi için gereken "Secret Key" bu yöntemde gerekmez.)
2. Xcode → **App** hedefi → **Signing & Capabilities** → **+ Capability** → **Sign in with Apple**.
   Otomatik imzalama açıksa Apple Developer tarafındaki App ID ayarı kendiliğinden güncellenir.
3. Mac'te: `npx cap sync ios` (testflight.sh bunu zaten yapar).

## 4. Google ile giriş (sonra)
Google Cloud'da iOS OAuth istemcisi açılınca eklenecek. Google varsa Apple ile giriş zorunlu (App Store 4.8); Apple hazır.

## 5. Abonelik hesaba bağlı
Giriş yapınca RevenueCat kullanıcı kimliği = Supabase kullanıcı kimliği (`linkPurchaser`). Yeni telefonda aynı hesapla
girince abonelik görünür. Hesapsız kullanımda RevenueCat'in anonim kimliği kalır; "Satın alımları geri yükle" yine çalışır.
