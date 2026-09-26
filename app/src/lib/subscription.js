// Abonelik: RevenueCat (Apple StoreKit sarmalayıcısı) üzerinden.
// - Yalnızca iOS uygulamasında (Capacitor native) çalışır. Web sürümünde ödeme
//   altyapısı yok; orada uygulama kilitsiz açılır (test/önizleme amaçlı).
// - Ürünler App Store Connect'te tanımlanır: aylık + yıllık, 7 gün ücretsiz deneme
//   (giriş teklifi). RevenueCat'te "premium" entitlement'ı ve "default" offering'i
//   bu iki ürüne bağlanır. Adım adım: docs/APP_STORE_KURULUM.md
// - API anahtarı: VITE_RC_IOS_KEY (RevenueCat'in herkese açık iOS anahtarı; gizli değil).

import { Capacitor } from '@capacitor/core'

export const ENTITLEMENT = 'premium'

export const isNative = () => {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

let purchasesPromise = null
async function purchases() {
  if (!purchasesPromise) {
    purchasesPromise = (async () => {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const apiKey = import.meta.env.VITE_RC_IOS_KEY
      if (!apiKey) throw new Error('VITE_RC_IOS_KEY tanımlı değil')
      await Purchases.configure({ apiKey })
      return Purchases
    })()
    purchasesPromise.catch(() => {
      purchasesPromise = null
    })
  }
  return purchasesPromise
}

export function hasPremium(customerInfo) {
  return Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT])
}

// Yalnızca test derlemesi (TestFlight / Xcode) için: VITE_TEST_UNLOCK=1 ile derlenirse
// uygulama kilitsiz açılır. App Store'a gönderilecek derlemede bu değişken OLMAMALI.
export const testUnlock = (env = import.meta.env) => env?.VITE_TEST_UNLOCK === '1'

// Abonelik durumu. Web'de her zaman açık (ödeme yok).
export async function getAccess() {
  if (!isNative()) return { premium: true, native: false }
  if (testUnlock()) return { premium: true, native: true, testUnlock: true }
  const P = await purchases()
  const { customerInfo } = await P.getCustomerInfo()
  return { premium: hasPremium(customerInfo), native: true }
}

// Ödeme ekranında gösterilecek planlar
export async function getPlans() {
  const P = await purchases()
  const offerings = await P.getOfferings()
  return plansFromOffering(offerings.current)
}

// Saf fonksiyon (test edilir): offering → sade plan listesi
export function plansFromOffering(offering) {
  if (!offering) return []
  const out = []
  const add = (pkg, period) => {
    if (!pkg) return
    const p = pkg.product
    const intro = p.introPrice
    out.push({
      id: pkg.identifier,
      period, // 'annual' | 'monthly'
      priceString: p.priceString,
      pricePerMonthString: p.pricePerMonthString ?? null,
      price: p.price,
      freeTrialDays: intro && intro.price === 0 ? trialDays(intro) : 0,
      pkg,
    })
  }
  add(offering.annual, 'annual')
  add(offering.monthly, 'monthly')
  // Yıllığın aylık karşılığı aylıktan ne kadar ucuz?
  const a = out.find((x) => x.period === 'annual')
  const m = out.find((x) => x.period === 'monthly')
  if (a && m && m.price > 0) a.savePercent = Math.round((1 - a.price / 12 / m.price) * 100)
  return out
}

function trialDays(intro) {
  const n = intro.periodNumberOfUnits ?? 0
  switch (intro.periodUnit) {
    case 'DAY':
      return n
    case 'WEEK':
      return n * 7
    case 'MONTH':
      return n * 30
    default:
      return n
  }
}

export async function purchase(plan) {
  const P = await purchases()
  try {
    const { customerInfo } = await P.purchasePackage({ aPackage: plan.pkg })
    return { ok: hasPremium(customerInfo) }
  } catch (e) {
    if (e?.userCancelled) return { ok: false, cancelled: true }
    return { ok: false, error: e?.message ?? 'Satın alma tamamlanamadı' }
  }
}

export async function restore() {
  const P = await purchases()
  const { customerInfo } = await P.restorePurchases()
  return hasPremium(customerInfo)
}

// Abonelik hesaba bağlanır (yeni telefonda da devam): RevenueCat kullanıcı kimliği = Supabase kullanıcı kimliği.
// Hesapsız kullanımda RevenueCat'in anonim kimliği kalır. Hata abonelik akışını durdurmaz (sessiz).
export async function linkPurchaser(userId) {
  if (!isNative() || !userId) return
  try {
    const P = await purchases()
    await P.logIn({ appUserID: userId })
  } catch {
    // anahtar yok / ağ yok: bir sonraki açılışta yeniden denenir
  }
}

export async function unlinkPurchaser() {
  if (!isNative()) return
  try {
    const P = await purchases()
    await P.logOut()
  } catch {
    // anonim kullanıcıda logOut hata verir; yok say
  }
}
