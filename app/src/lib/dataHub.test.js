import { describe, it, expect } from 'vitest'
import { hub, domainOfSession, domainsWithData, ANSWER_FIELDS, growthMap, verifiedChange, changeDetail, weakestDomain, calendarDays } from './dataHub.js'
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
  alarm: 'alarm-log (İyi oluş; uyanma ve sabah cevabı günleri, lib/alarmLog.js alarmHabits)',
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

describe('veri merkezi: gelişim haritası', () => {
  const now = new Date('2026-09-28T12:00:00')
  const d = (days) => new Date(now.getTime() - days * 86400000).toISOString()
  it('düzen: son 28 günde o alanda kaydı olan gün (aynı gün iki kayıt bir gün)', () => {
    const sessions = [{ type: 'blink', date: d(0) }, { type: 'blink', date: d(0) }, { type: 'routine', setId: 'isinma', date: d(3) }, { type: 'blink', date: d(40) }]
    const habits = [{ type: 'mola', date: '2026-09-27', at: d(1) }]
    const m = growthMap({ sessions, habits, now })
    expect(m.domains.eye.days).toBe(2)
    expect(m.domains.eye.frac).toBeCloseTo(2 / 28, 6)
    expect(m.domains.eye.strip.length).toBe(28)
    expect(m.domains.eye.strip.at(-1)).toBe(true)
    expect(m.domains.body.days).toBe(1)
    expect(m.domains.focus.days).toBe(0)
    expect(m.domains.eye.sources[0]).toMatchObject({ label: 'Göz kırpma egzersizi', n: 2 })
  })
  it('ilk 28 gün penceresi ve karşılaştırma eşiği', () => {
    const sessions = [{ type: 'blink', date: d(40) }, { type: 'blink', date: d(39) }, { type: 'blink', date: d(1) }]
    const first = growthMap({ sessions, now, window: 'first' })
    expect(first.domains.eye.days).toBe(2)
    expect(first.canCompare).toBe(true)
    expect(growthMap({ sessions: [{ type: 'blink', date: d(10) }], now }).canCompare).toBe(false)
  })
  it('doğrulanmış değişim: gerileme önce gelir; yoksa iyileşme; ikisi de yoksa null', () => {
    expect(verifiedChange({ metrics: [{ status: 'better' }], effects: [] })).toBe('up')
    // gelisim-merkezi PLAN §8.2 / onaylı §3.G.4: "better + worse → down" yerine null ve mixed: true (karışık)
    expect(verifiedChange({ metrics: [{ status: 'better' }, { status: 'worse' }], effects: [] })).toBeNull()
    expect(changeDetail({ metrics: [{ status: 'better' }, { status: 'worse' }], effects: [] })).toMatchObject({ status: null, mixed: true })
    expect(verifiedChange({ metrics: [{ status: 'noise' }], effects: [{ sig: false, gain: 2 }] })).toBeNull()
    expect(verifiedChange({ metrics: [], effects: [], eye: { alert: 'yellow' } })).toBe('down')
    expect(verifiedChange({ metrics: [], effects: [], who5: { status: 'up' } })).toBe('up')
  })
  it('en az düzenli alan önerisi; İyi oluş önerilmez (tek kaydı 14 günde bir WHO-5)', () => {
    const m = growthMap({ sessions: [{ type: 'blink', date: d(1) }], now })
    expect(weakestDomain(m).domain).toBe('focus')
    const fake = { domains: Object.fromEntries(DOMAINS.map((x) => [x, { domain: x, days: x === 'wellbeing' ? 0 : x === 'body' ? 3 : 9 }])) }
    expect(weakestDomain(fake).domain).toBe('body')
  })
  it('gün sayısı takvim günüdür (saat değil): dün 23.00 → bugün 07.00 = 2. gün', () => {
    const late = new Date(2026, 8, 27, 23, 0)
    const early = new Date(2026, 8, 28, 7, 0)
    expect(calendarDays(late, early)).toBe(1)
    expect(growthMap({ sessions: [{ type: 'blink', date: late.toISOString() }], now: early }).sinceStart).toBe(2)
  })
  it('bozuk kayıt (null, tarihsiz) haritayı düşürmez', () => {
    const m = growthMap({ sessions: [null, { type: 'blink' }, { type: 'blink', date: d(1) }], tests: [null], now })
    expect(m.domains.eye.days).toBe(1)
  })
  it('kaynaklar: kısa (eski adı günlük) ve haftalık görme testi ayrı satır ve ayrı anahtar', () => {
    const tests = [{ type: 'va-daily', date: d(1) }, { type: 'va-weekly', date: d(2) }]
    const src = growthMap({ tests, now }).domains.eye.sources
    expect(src.map((x) => x.label).sort()).toEqual(['Haftalık görme testi', 'Kısa görme testi'])
    expect(new Set(src.map((x) => x.key)).size).toBe(2)
  })
})
