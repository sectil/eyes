import { describe, it, expect } from 'vitest'
import { plansFromOffering, hasPremium, testUnlock, rcApiKey, RC_IOS_PUBLIC_KEY, withTimeout, _purchasesForTest, membershipFrom } from './subscription.js'

const product = (price, priceString, intro, pricePerMonthString = null) => ({
  price,
  priceString,
  pricePerMonthString,
  introPrice: intro,
})
const week = { price: 0, priceString: '₺0', periodUnit: 'WEEK', periodNumberOfUnits: 1 }
const days7 = { price: 0, priceString: '₺0', periodUnit: 'DAY', periodNumberOfUnits: 7 }

describe('plansFromOffering', () => {
  it('yıllık önce, aylık sonra; deneme günleri ve tasarruf', () => {
    const plans = plansFromOffering({
      annual: { identifier: '$rc_annual', product: product(599.99, '₺599,99', days7, '₺50,00') },
      monthly: { identifier: '$rc_monthly', product: product(99.99, '₺99,99', week) },
    })
    expect(plans.map((p) => p.period)).toEqual(['annual', 'monthly'])
    expect(plans[0].freeTrialDays).toBe(7)
    expect(plans[1].freeTrialDays).toBe(7)
    expect(plans[0].savePercent).toBe(50)
    expect(plans[0].pricePerMonthString).toBe('₺50,00')
  })
  it('ücretli giriş teklifi deneme sayılmaz', () => {
    const plans = plansFromOffering({
      annual: null,
      monthly: { identifier: 'm', product: product(99, '₺99', { ...days7, price: 9.99 }) },
    })
    expect(plans[0].freeTrialDays).toBe(0)
  })
  it('offering yoksa boş', () => {
    expect(plansFromOffering(null)).toEqual([])
  })
  it('haftalık paket de okunur (yıllık → aylık → haftalık sırası)', () => {
    const plans = plansFromOffering({
      annual: { identifier: '$rc_annual', product: product(899.99, '₺899,99', days7, '₺75,00') },
      monthly: { identifier: '$rc_monthly', product: product(89.99, '₺89,99', days7) },
      weekly: { identifier: '$rc_weekly', product: product(29.99, '₺29,99', days7) },
    })
    expect(plans.map((p) => p.period)).toEqual(['annual', 'monthly', 'weekly'])
    expect(plans.find((p) => p.period === 'weekly')).toMatchObject({ priceString: '₺29,99', freeTrialDays: 7 })
    expect(plans[0].savePercent).toBe(17)
  })
})

describe('hasPremium', () => {
  it('aktif premium entitlement', () => {
    expect(hasPremium({ entitlements: { active: { premium: {} } } })).toBe(true)
    expect(hasPremium({ entitlements: { active: {} } })).toBe(false)
    expect(hasPremium(null)).toBe(false)
  })
})

describe('testUnlock', () => {
  it('yalnızca VITE_TEST_UNLOCK=1 iken açık', () => {
    expect(testUnlock({ VITE_TEST_UNLOCK: '1' })).toBe(true)
    expect(testUnlock({})).toBe(false)
    expect(testUnlock({ VITE_TEST_UNLOCK: '0' })).toBe(false)
    expect(testUnlock({ VITE_TEST_UNLOCK: 'true' })).toBe(false)
  })
})

describe('rcApiKey', () => {
  it('varsayılan: gömülü herkese açık appl_ anahtarı', () => {
    expect(RC_IOS_PUBLIC_KEY).toMatch(/^appl_/)
    expect(rcApiKey({})).toBe(RC_IOS_PUBLIC_KEY)
    expect(rcApiKey({ VITE_RC_IOS_KEY: '  ' })).toBe(RC_IOS_PUBLIC_KEY)
  })
  it('derleme değişkeni verilirse o kullanılır (appl_ / test_)', () => {
    expect(rcApiKey({ VITE_RC_IOS_KEY: 'appl_abc123' })).toBe('appl_abc123')
    expect(rcApiKey({ VITE_RC_IOS_KEY: 'test_abc123' })).toBe('test_abc123')
  })
  it('gizli sk_ anahtarı ve bozuk anahtar reddedilir', () => {
    expect(() => rcApiKey({ VITE_RC_IOS_KEY: 'sk_abc123' })).toThrow(/sk_/)
    expect(() => rcApiKey({ VITE_RC_IOS_KEY: 'goog_abc' })).toThrow(/geçersiz/)
  })
})

describe('withTimeout', () => {
  it('süre dolmadan biten söz aynen döner', async () => {
    await expect(withTimeout(Promise.resolve(5), 50, 'x')).resolves.toBe(5)
  })
  it('bitmeyen söz süre dolunca TIMEOUT koduyla hata verir', async () => {
    await expect(withTimeout(new Promise(() => {}), 10, 'zaman aşımı')).rejects.toMatchObject({ code: 'TIMEOUT', message: 'zaman aşımı' })
  })
  it('sözün kendi hatası korunur', async () => {
    await expect(withTimeout(Promise.reject(new Error('ağ yok')), 50, 'x')).rejects.toThrow('ağ yok')
  })
})

// Bug 15: Capacitor eklentisi gibi her özelliğe ("then" dahil) fonksiyon veren nesne. Söz ile döndürülürse
// then() çağrılır ve hiç cevap vermez → söz sonsuza kadar bekler.
function capacitorLikePlugin(calls) {
  return new Proxy({}, {
    get(_, prop) {
      if (prop === 'then') return () => { calls.push('then') } // yerelde yok: hiç çözülmez
      return async () => { calls.push(String(prop)) }
    },
  })
}

describe('purchases (RevenueCat yükleme)', () => {
  it('eklenti kutu içinde döner; then() çağrılmaz, söz takılmaz', async () => {
    const calls = []
    const Purchases = capacitorLikePlugin(calls)
    const box = await withTimeout(_purchasesForTest(async () => ({ Purchases })), 200, 'takıldı')
    expect(box.P).toBe(Purchases)
    expect(calls).toEqual(['configure'])
  })
})

describe('membershipFrom (Profilim Premium kartı)', () => {
  const now = new Date('2026-09-27T09:00:00Z')
  const ci = (e, extra = {}) => ({ entitlements: { active: e ? { premium: e } : {} }, managementURL: 'https://apps.apple.com/account/subscriptions', ...extra })
  it('deneme: kalan gün yukarı yuvarlanır, plan ürün kimliğinden', () => {
    const m = membershipFrom(ci({ periodType: 'TRIAL', expirationDate: '2026-10-02T08:00:00Z', willRenew: true, productIdentifier: 'nefona_premium_annual' }), now)
    expect(m).toMatchObject({ state: 'trial', daysLeft: 5, willRenew: true, plan: 'annual' })
    expect(m.manageUrl).toContain('apps.apple.com')
  })
  it('ücretli dönem: active; iptal edilmişse willRenew false', () => {
    const m = membershipFrom(ci({ periodType: 'NORMAL', expirationDate: '2026-10-27T09:00:00Z', willRenew: false, productIdentifier: 'nefona_premium_monthly' }), now)
    expect(m).toMatchObject({ state: 'active', daysLeft: 30, willRenew: false, plan: 'monthly' })
  })
  it('entitlement yoksa none; süresi geçmiş tarih 0 gün', () => {
    expect(membershipFrom(ci(null), now).state).toBe('none')
    expect(membershipFrom(null, now).state).toBe('none')
    expect(membershipFrom(ci({ periodType: 'TRIAL', expirationDate: '2026-09-20T00:00:00Z', productIdentifier: 'nefona_premium_weekly' }), now)).toMatchObject({ daysLeft: 0, plan: 'weekly' })
  })
})
