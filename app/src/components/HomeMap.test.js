import { describe, it, expect } from 'vitest'
import { DOMAIN_MODULE } from './HomeMap.jsx'
import { registry } from '../modules/registry.js'
import { domainOfSession } from '../lib/dataHub.js'
import { SESSION_TYPE as DALGA } from '../lib/dalga.js'

// Öneri kartı bir alanı "en az kayıt" diye önerip başka alana yazan modül açarsa aynı öneri her gün döner
// (inceleme bulgusu: İyi oluş → Dalga, Dalga Sakinlik'e yazıyor).
describe('Ana sayfa harita önerisi', () => {
  it('önerilen modülün kaydı önerilen alana düşer', () => {
    for (const [domain, id] of Object.entries(DOMAIN_MODULE)) {
      const m = registry.get(id)
      expect(m, id).toBeTruthy()
      if (id === 'mola') continue // mola habit-log'a yazar; merkez onu Beden'e koyar (dataHub HABIT_DOMAIN)
      expect(m.progress?.domain, id).toBe(domain)
    }
  })
  it('İyi oluş için pratik önerilmez', () => {
    expect(DOMAIN_MODULE.wellbeing).toBeUndefined()
    expect(domainOfSession({ type: DALGA })).toBe('calm')
  })
})
