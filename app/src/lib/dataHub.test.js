import { describe, it, expect } from 'vitest'
import { hub, domainOfSession, domainsWithData, ANSWER_FIELDS } from './dataHub.js'
import { registry, DOMAINS } from '../modules/registry.js'

// Ölçüm ilkesi (ANA_BELGE.md §1): canlı her modül veri merkezine ulaşır. Merkeze başka yoldan giren modüller açıkça
// burada yazılı; listede olmayan yeni bir modül sessions.match tanımlamazsa bu test kırılır.
const OTHER_ROUTE = {
  daily: 'tests (görme testi → Göz)',
  weekly: 'tests (görme testi → Göz)',
  reading: 'tests (okuma testi → Göz)',
  mola: 'habit-log (Beden; bilerek sessions dışında)',
  water: 'habit-log (Beden; bilerek sessions dışında)',
  awareness: 'yalnız giriş kapısı (Farkındalık merkezi), kendi kaydı yok',
}

describe('veri merkezi: her modül merkeze ulaşır', () => {
  it('canlı her modül ya oturumunu tanıtır (sessions.match) ya da başka yolu burada yazılı', () => {
    const missing = registry.live.filter((m) => !m.sessions?.match && !OTHER_ROUTE[m.id]).map((m) => m.id)
    expect(missing).toEqual([])
  })
  it('listedeki istisnalar gerçekten var (eski ad kalmasın)', () => {
    for (const id of Object.keys(OTHER_ROUTE)) expect(registry.get(id), id).toBeTruthy()
  })
  it('göz kırp ve egzersiz setleri Göz alanına düşer', () => {
    expect(domainOfSession({ type: 'blink' })).toBe('eye')
    expect(domainOfSession({ type: 'routine', setId: 'isinma' })).toBe('eye')
    expect(domainOfSession({ type: 'bilinmeyen' })).toBeNull()
  })
})

describe('veri merkezi: hub', () => {
  const now = new Date('2026-09-28T12:00:00Z')
  const d = (days) => new Date(now.getTime() - days * 86400000).toISOString()
  const profile = {
    iris: {
      baseline: { date: d(30), blinks: 9, stressNow: 3, sleep: 3, activityDays: 2, selfCompassion: 3 },
      recheck: { date: d(1), blinks: 12, stressNow: 1, sleep: 4, activityDays: 4, selfCompassion: 4 },
    },
  }
  it('7 alanın hepsi döner; boş veride hiçbiri "veri var" demez', () => {
    const h = hub({ now })
    expect(Object.keys(h.domains).sort()).toEqual([...DOMAINS].sort())
    expect(domainsWithData(h)).toEqual([])
  })
  it('profil cevapları başlangıç ve 28. gün olarak alanlarına düşer', () => {
    const h = hub({ profile, now })
    expect(h.domains.calm.answers[0].series.map((p) => p.value)).toEqual([3, 1])
    expect(h.domains.eye.answers[0].key).toBe('blinks')
    expect(h.domains.body.answers[0].series.at(-1).value).toBe(4)
    expect(ANSWER_FIELDS.map((f) => f.domain).every((x) => DOMAINS.includes(x))).toBe(true)
    expect(domainsWithData(h).sort()).toEqual(['body', 'calm', 'eye', 'self', 'wellbeing'])
  })
  it('oturumlar, testler ve mola/su günlüğü alanlarına sayılır (7 ve 28 gün)', () => {
    const sessions = [{ type: 'blink', date: d(2) }, { type: 'routine', setId: 'isinma', date: d(10) }]
    const tests = [{ type: 'va-daily', eye: 'OU', logMAR: 0.2, date: d(3) }]
    const habits = [{ type: 'mola', date: '2026-09-27', at: d(1) }, { type: 'water', date: '2026-09-20', at: d(8) }]
    const h = hub({ sessions, tests, habits, now })
    expect(h.domains.eye.records).toEqual({ total: 3, days7: 2, days28: 3 })
    expect(h.domains.body.habits).toEqual({ total: 2, days7: 1 })
    expect(h.domains.body.hasData).toBe(true)
    expect(h.domains.focus.hasData).toBe(false)
  })
  it('istatistik çekirdeğinin metrik ve etkileri alan altında gelir', () => {
    const sessions = Array.from({ length: 4 }, (_, i) => ({ type: 'breath', date: d(i + 1), seconds: 180, calmBefore: 4, calmAfter: 7, completed: true, pattern: 'coherent' }))
    const h = hub({ sessions, now })
    expect(h.domains.calm.records.total).toBe(4)
    expect(Array.isArray(h.domains.calm.effects)).toBe(true)
    expect(h.domains.wellbeing.who5).toBeTruthy()
  })
})
