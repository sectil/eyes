import { describe, it, expect } from 'vitest'
import { plansFromOffering, hasPremium, testUnlock } from './subscription.js'

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
