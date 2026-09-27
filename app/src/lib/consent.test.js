import { describe, it, expect } from 'vitest'
import { hasConsent, shouldAsk, recordConsent, consentOf, coachAllowed, CONSENT_VERSION, CONSENTS } from './consent.js'

describe('açık rıza kayıtları', () => {
  const now = new Date('2026-09-27T09:00:00Z')
  it('hiç sorulmadıysa sor; izin yok', () => {
    expect(shouldAsk(undefined, 'profileSync')).toBe(true)
    expect(hasConsent(undefined, 'profileSync')).toBe(false)
  })
  it('izin verildi: tarih ve sürümle kaydedilir, bir daha sorulmaz', () => {
    const c = recordConsent(null, 'profileSync', true, now)
    expect(c.profileSync).toEqual({ granted: true, date: '2026-09-27T09:00:00.000Z', version: CONSENT_VERSION })
    expect(hasConsent(c, 'profileSync')).toBe(true)
    expect(shouldAsk(c, 'profileSync')).toBe(false)
  })
  it('reddedildi ya da geri çekildi: izin yok ve kendiliğinden tekrar sorulmaz', () => {
    const c = recordConsent(recordConsent(null, 'profileSync', true, now), 'profileSync', false, now)
    expect(hasConsent(c, 'profileSync')).toBe(false)
    expect(shouldAsk(c, 'profileSync')).toBe(false)
  })
  it('metin sürümü artarsa izin vermiş kişiye yeniden sorulur, eski izin geçmez', () => {
    const c = recordConsent(null, 'profileSync', true, now, 1)
    expect(hasConsent(c, 'profileSync', 2)).toBe(false)
    expect(shouldAsk(c, 'profileSync', 2)).toBe(true)
  })
  it('bozuk kayıt yok sayılır; diğer izinler korunur', () => {
    expect(consentOf({ profileSync: 'evet' }, 'profileSync')).toBeNull()
    const c = recordConsent({ other: { granted: true, date: 'x', version: 1 } }, 'profileSync', true, now)
    expect(c.other.granted).toBe(true)
  })
  it('metin: dört satır (ne, neden, nerede, ne kadar) ve yurt dışı açıkça yazılı', () => {
    expect(CONSENTS.profileSync.facts.map((f) => f[0])).toEqual(['Ne', 'Neden', 'Nerede', 'Ne kadar'])
    expect(CONSENTS.profileSync.facts[2][1]).toMatch(/Almanya/)
    expect(CONSENTS.profileSync.check).toMatch(/yurt dışı/)
  })
})

describe('Nef göz koçu: tercih + kayıtlı rıza', () => {
  const now = new Date('2026-09-27T09:00:00Z')
  const both = recordConsent(recordConsent(null, 'coach', true, now), 'coachLife', true, now)
  it('eski sürümden kalan tercih (rıza kaydı yok) Nef\'i açmaz', () => {
    expect(coachAllowed({ coach: true, coachLife: true }, null)).toEqual({ on: false, life: false })
    expect(coachAllowed({ coach: true, coachLife: true }, {})).toEqual({ on: false, life: false })
  })
  it('iki amaç ayrı: temel rıza profil cevaplarını kapsamaz', () => {
    const base = recordConsent(null, 'coach', true, now)
    expect(coachAllowed({ coach: true, coachLife: true }, base)).toEqual({ on: true, life: false })
    expect(coachAllowed({ coach: true, coachLife: false }, both)).toEqual({ on: true, life: false })
    expect(coachAllowed({ coach: true, coachLife: true }, both)).toEqual({ on: true, life: true })
  })
  it('tercih kapalıysa ya da rıza geri çekildiyse gönderim yok', () => {
    expect(coachAllowed({ coach: false, coachLife: true }, both)).toEqual({ on: false, life: false })
    const off = recordConsent(both, 'coach', false, now)
    expect(coachAllowed({ coach: true, coachLife: true }, off)).toEqual({ on: false, life: false })
  })
  it('metin: gönderilenleri sayar; sağlık verisi ve yurt dışı açıkça yazılı', () => {
    for (const k of ['coach', 'coachLife']) {
      expect(CONSENTS[k].facts.map((f) => f[0])).toEqual(['Ne', 'Neden', 'Nerede', 'Ne kadar'])
      expect(CONSENTS[k].facts[2][1]).toMatch(/Yurt dışında/)
      expect(CONSENTS[k].check).toMatch(/sağlığa ilişkin/)
      expect(CONSENTS[k].check).toMatch(/yurt dışına/)
    }
    expect(CONSENTS.coach.facts[0][1]).toMatch(/görme ölçümü/)
    expect(CONSENTS.coach.facts[0][1]).toMatch(/sakinlik farkı/)
    expect(CONSENTS.coachLife.check).toMatch(/uyku.*ekran süresi.*gece.*stres/)
  })
})
