import { describe, it, expect } from 'vitest'
import { hasConsent, shouldAsk, recordConsent, recordDecline, consentOf, coachAllowed, CONSENT_VERSION, CONSENT_VERSIONS, CONSENTS } from './consent.js'

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
    expect(CONSENTS.profileSync.facts.map((f) => f[0])).toEqual(['Ne kaydedilir?', 'Ne işe yarar?', 'Nerede durur?', 'Ne kadar kalır?'])
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

describe('rıza başına sürüm', () => {
  const now = new Date('2026-09-27T09:00:00Z')
  // Bildirim sistemi v2'den önce kaydedilmiş izinler: hepsi tek sürüm (1)
  const v1 = ['profileSync', 'health', 'coach', 'coachLife'].reduce((c, k) => recordConsent(c, k, true, now, 1), null)
  it('sürümler anahtar başına; eski tek sürüm geri uyum için 1 kalır', () => {
    expect(CONSENT_VERSIONS).toEqual({ profileSync: 1, health: 2, coach: 1, coachLife: 1 })
    expect(CONSENT_VERSION).toBe(1)
  })
  it('health v1 izni artık yetmez: izin yok sayılır ve yeniden sorulur', () => {
    expect(hasConsent(v1, 'health')).toBe(false)
    expect(shouldAsk(v1, 'health')).toBe(true)
  })
  it('health v1 reddi kendiliğinden tekrar sorulmaz', () => {
    const c = recordConsent(null, 'health', false, now, 1)
    expect(shouldAsk(c, 'health')).toBe(false)
    expect(hasConsent(c, 'health')).toBe(false)
  })
  it('profileSync ve Nef v1 izinleri geçerli kalır', () => {
    for (const k of ['profileSync', 'coach', 'coachLife']) {
      expect(hasConsent(v1, k)).toBe(true)
      expect(shouldAsk(v1, k)).toBe(false)
    }
    expect(coachAllowed({ coach: true, coachLife: true }, v1)).toEqual({ on: true, life: true })
  })
  it('recordConsent anahtarın sürümünü yazar; yeni health izni geçerli', () => {
    for (const k of Object.keys(CONSENT_VERSIONS)) {
      expect(recordConsent(null, k, true, now)[k].version).toBe(CONSENT_VERSIONS[k])
    }
    const c = recordConsent(v1, 'health', true, now)
    expect(c.health).toEqual({ granted: true, date: '2026-09-27T09:00:00.000Z', version: 2 })
    expect(hasConsent(c, 'health')).toBe(true)
    expect(shouldAsk(c, 'health')).toBe(false)
    expect(c.profileSync.version).toBe(1)
  })
  it('listede olmayan anahtar eski tek sürümü kullanır', () => {
    expect(recordConsent(null, 'baska', true, now).baska.version).toBe(CONSENT_VERSION)
  })
  it('health v1 izni göstermeye yeter; güncel metne "Şimdi değil" v1 iznini geri çekmez ve bir daha sorulmaz', () => {
    expect(hasConsent(v1, 'health', 1)).toBe(true)
    const later = new Date('2026-09-28T09:00:00Z')
    const c = recordDecline(v1, 'health', later)
    expect(c.health).toEqual({ ...v1.health, declined: 2, declinedAt: '2026-09-28T09:00:00.000Z' })
    expect(hasConsent(c, 'health', 1)).toBe(true)
    expect(hasConsent(c, 'health')).toBe(false)
    expect(shouldAsk(c, 'health')).toBe(false)
    // sonradan güncel metne izin verirse v2 kaydı yazılır
    const g = recordConsent(c, 'health', true, later)
    expect(g.health).toEqual({ granted: true, date: '2026-09-28T09:00:00.000Z', version: 2 })
    expect(hasConsent(g, 'health')).toBe(true)
  })
  it('recordDecline: kayıtlı izin yoksa ya da zaten günceldeyse düz ret', () => {
    expect(recordDecline(null, 'health', now).health).toEqual({ granted: false, date: '2026-09-27T09:00:00.000Z', version: 2 })
    const cur = recordConsent(null, 'health', true, now)
    expect(recordDecline(cur, 'health', now).health.granted).toBe(false)
  })
  it('güncel metin (healthUpdate): aynı olgular ve onay; "Şimdi değil"in adımları kapatmadığı yazılı', () => {
    expect(CONSENTS.healthUpdate.facts).toEqual(CONSENTS.health.facts)
    expect(CONSENTS.healthUpdate.check).toBe(CONSENTS.health.check)
    expect(CONSENTS.healthUpdate.lead).toMatch(/adımların yine görünür/)
    expect(CONSENTS.health.facts[0][1]).toMatch(/uygulama kapalıyken de okunur/)
  })
  it('health "Neden": yürüyüş hatırlatması ve ölçüm amacı yazılı, yalnız bu telefonda', () => {
    const why = CONSENTS.health.facts.find((f) => f[0] === 'Neden')[1]
    expect(why).toMatch(/göz çalışmalarınla yan yana/)
    expect(why).toMatch(/adımın düşük olduğu günlerde yürüyüş hatırlatması/)
    expect(why).toMatch(/işine yarayıp yaramadığını bu telefonda sana göstermek/)
  })
})
