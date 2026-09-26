import { describe, it, expect } from 'vitest'
import { plansFromOffering, hasPremium, testUnlock, rcApiKey, RC_IOS_PUBLIC_KEY } from './subscription.js'

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
