// "Bugünün ritmi" üreteci (SONSUZ_YOL.PLAN.v1 §3.A.4, §3.A.5, §3.G.6): zarf, art arda tekrar yok, tutma ön koşulu,
// belirlenimcilik; sayım arastirma-v1/sayim_nefes.mjs ile aynı (B 40, C 99, D 629).
import { describe, it, expect } from 'vitest'
import { combos, selectable, breathOfDay, inEnvelope, mixLabel, mixEdits, mixHistory, pathBreathMinutes, bpmOf, TIER_FAMILIES, WEEK_RULES } from './breathMix.js'
import { PATTERNS, makePlan, LIMITS as BREATH_LIMITS } from './breath.js'
import { dayKey } from './calendar.js'
import { calendarDaysBetween } from './today.js'

const stage = (tier) => (tier === 'A' ? { minutes: 3, variant: null } : { minutes: 3, variant: { tier } })
const day = (n) => dayKey(new Date(2026, 9, 1 + n))
// n gün boyunca her gün nefes yapan kişi: geçmiş kendi seçimlerinden birikir
function run(tier, days, opts = {}) {
  const safety = 'safety' in opts ? opts.safety : { holdOk: true }
  const skip = opts.skip ?? []
  const history = []
  const out = []
  for (let n = 0; n < days; n++) {
    if (skip.includes(n)) continue
    const seedDay = day(n)
    const m = safety === undefined ? breathOfDay(stage(tier), { seedDay, history: [...history] }) : breathOfDay(stage(tier), { seedDay, history: [...history], safety })
    out.push({ seedDay, ...m })
    history.push({ day: seedDay, family: m.family, inhale: m.inhale, hold: m.hold, exhale: m.exhale, pause: m.pause })
  }
  return out
}

describe('bileşim sayısı (sayim_nefes.mjs)', () => {
  it('B 40 tutmasız; C 99 (59 tutmalı); D 629 (472 beklemeli); hepsi zarfın içinde', () => {
    const count = (t) => ({ n: combos(t).length, hold: combos(t).filter((c) => c.hold > 0).length, pause: combos(t).filter((c) => c.pause > 0).length })
    expect(count('B')).toEqual({ n: 40, hold: 0, pause: 0 })
    expect(count('C')).toEqual({ n: 99, hold: 59, pause: 0 })
    expect(count('D')).toEqual({ n: 629, hold: 390, pause: 472 })
    for (const t of ['B', 'C', 'D']) for (const c of combos(t)) expect(inEnvelope(c, t), JSON.stringify(c)).toBe(true)
  })
  it('seçilebilen (ailesine uyan) bileşim: B 40, C 99, D 230 (157 beklemesiz + 73 yumuşak kutu)', () => {
    expect(selectable('B').length).toBe(40)
    expect(selectable('C').length).toBe(99)
    expect(selectable('D').length).toBe(230)
    expect(selectable('D').filter((c) => c.pause > 0).length).toBe(73)
    // beklemeli her seçilebilir bileşim yumuşak kutu: alış = veriş
    for (const c of selectable('D').filter((x) => x.pause > 0)) expect(c.exhale).toBe(c.inhale)
  })
  it('sahibin 4 · 2 · 4 · 4\'ü D katmanında (dakikada 4,3 nefes), C\'de değil', () => {
    const own = { inhale: 4, hold: 2, exhale: 4, pause: 4 }
    expect(bpmOf(own)).toBe(4.29)
    expect(inEnvelope(own, 'D')).toBe(true)
    expect(inEnvelope(own, 'C')).toBe(false)
    expect(combos('D').some((c) => c.inhale === 4 && c.hold === 2 && c.exhale === 4 && c.pause === 4)).toBe(true)
  })
  it('zarf dışı: hızlı soluma, veriş alıştan kısa, 4-7-8, uzun tutma', () => {
    expect(inEnvelope({ inhale: 2, hold: 0, exhale: 2, pause: 0 }, 'D')).toBe(false)
    expect(inEnvelope({ inhale: 5, hold: 0, exhale: 4, pause: 0 }, 'D')).toBe(false)
    expect(inEnvelope({ inhale: 4, hold: 7, exhale: 8, pause: 0 }, 'D')).toBe(false)
    expect(inEnvelope({ inhale: 4, hold: 4, exhale: 4, pause: 4 }, 'D')).toBe(false)
    expect(inEnvelope({ inhale: 4, hold: 1, exhale: 6, pause: 0 }, 'B')).toBe(false)
  })
})

describe('breathOfDay: katmanlar ve zarf', () => {
  it('A katmanı (ilk hafta): Sakin ritim 4 · 6, kalıbın kendi süreleri (kademe lib/breath.js\'te)', () => {
    const m = breathOfDay(stage('A'), { seedDay: day(0) })
    expect(m).toMatchObject({ family: 'calm', inhale: 4, hold: 0, exhale: 6, pause: 0, label: '4 · 6', tier: 'A', edits: null, ramp: true })
    expect(breathOfDay(null, { seedDay: day(0) }).tier).toBe('A')
  })
  for (const tier of ['B', 'C', 'D']) {
    it(`${tier} katmanı, 2 yıl her gün: zarfın içinde, ailesi katmanın, adı süreleriyle tutarlı`, () => {
      for (const m of run(tier, 730)) {
        expect(inEnvelope(m, tier), JSON.stringify(m)).toBe(true)
        expect(TIER_FAMILIES[tier]).toContain(m.family)
        expect(m.bpm).toBeGreaterThanOrEqual(tier === 'D' ? 4 : 5)
        expect(m.bpm).toBeLessThanOrEqual(7.5)
        expect(m.exhale).toBeGreaterThanOrEqual(m.inhale)
        expect(m.hold).toBeLessThanOrEqual(tier === 'B' ? 0 : 2)
        expect(m.pause).toBeLessThanOrEqual(tier === 'D' ? 4 : 0)
        if (m.family === 'equal') expect(m.exhale).toBe(m.inhale)
        if (m.family === 'sigh') expect(m.exhale - m.inhale).toBeGreaterThanOrEqual(1)
        if (m.family === 'calm') expect(m.exhale).toBeGreaterThan(m.inhale)
        // Sakin ritim ve Eşit ritim tutmasız (kanıt satırları tutmasız kalıptan); kutu alış = veriş
        if (m.family === 'calm' || m.family === 'equal') expect(m.hold).toBe(0)
        if (m.family === 'box') expect(m.exhale).toBe(m.inhale)
        expect(m.pause > 0).toBe(m.family === 'box')
        expect(m.title).toBe(PATTERNS[m.family].title)
        expect(m.label).toBe(mixLabel(m))
      }
    })
  }
  it('B\'de tutma yok; C\'de bekleme yok; kısa tutma C\'de, bekleme D\'de gerçekten gelir', () => {
    const B = run('B', 365)
    const C = run('C', 365)
    const D = run('D', 365)
    expect(B.some((m) => m.hold > 0 || m.pause > 0)).toBe(false)
    expect(C.some((m) => m.pause > 0)).toBe(false)
    expect(C.some((m) => m.hold > 0)).toBe(true)
    expect(D.some((m) => m.pause > 0)).toBe(true)
    expect(new Set(B.map((m) => m.family)).size).toBe(4)
    expect(new Set(D.map((m) => m.family)).size).toBe(7)
  })
})

describe('breathOfDay: sıkıcılık kuralları (7 günlük pencere)', () => {
  for (const tier of ['B', 'C', 'D']) {
    it(`${tier}: aynı bileşim iki gün art arda yok; aile (Sakin ritim de) en çok 3 gün; tutmalı günler art arda yok, en çok 2; bekleme en çok 1`, () => {
      const rows = run(tier, 730)
      const key = (m) => `${m.inhale}|${m.hold}|${m.exhale}|${m.pause}`
      for (let i = 1; i < rows.length; i++) expect(key(rows[i]), rows[i].seedDay).not.toBe(key(rows[i - 1]))
      const holdy = (m) => m.hold > 0 || m.pause > 0
      for (let i = 1; i < rows.length; i++) expect(holdy(rows[i]) && holdy(rows[i - 1]), rows[i].seedDay).toBe(false)
      for (let i = 0; i < rows.length; i++) {
        const win = rows.slice(Math.max(0, i - 6), i + 1) // her gün yapıldı: son 7 kayıt = son 7 gün
        expect(calendarDaysBetween(win[0].seedDay, rows[i].seedDay)).toBeLessThanOrEqual(6)
        for (const f of TIER_FAMILIES[tier]) expect(win.filter((r) => r.family === f).length, `${rows[i].seedDay} ${f}`).toBeLessThanOrEqual(WEEK_RULES.familyMax)
        expect(win.filter(holdy).length).toBeLessThanOrEqual(WEEK_RULES.holdDaysMax)
        expect(win.filter((r) => r.pause > 0).length).toBeLessThanOrEqual(WEEK_RULES.pauseDaysMax)
      }
    })
  }
  it('365 farklı başlangıç günü × 120 gün (B, C, D, güvenlik kartı görülmüş): Sakin ritim de 7 günde en çok 3', () => {
    for (const tier of ['B', 'C', 'D']) {
      for (let start = 0; start < 365; start += 7) {
        const history = []
        const fams = []
        for (let n = start; n < start + 120; n++) {
          const seedDay = day(n)
          const m = breathOfDay(stage(tier), { seedDay, history: [...history], safety: { holdOk: true } })
          history.push({ day: seedDay, family: m.family, inhale: m.inhale, hold: m.hold, exhale: m.exhale, pause: m.pause })
          fams.push(m.family)
          const win = fams.slice(-7)
          expect(win.filter((f) => f === 'calm').length, `${tier} ${seedDay}`).toBeLessThanOrEqual(WEEK_RULES.familyMax)
        }
      }
    }
  })
  it('"Günün ritmi"nin ilk günü dünkü Sakin ritim 4 · 6 ile aynı süreleri vermez (dünün kaydında kalıp yok)', () => {
    // A katmanındaki ve Y1 öncesindeki nefes kaydı mix alanı yazmaz; geçmiş boş gelir
    for (let n = 0; n < 3650; n++) {
      for (const tier of ['B', 'C', 'D']) {
        const m = breathOfDay(stage(tier), { seedDay: day(n), history: [], safety: { holdOk: true } })
        expect(m.key, `${tier} ${day(n)}`).not.toBe('4|0|6|0')
      }
    }
    // dün mix kaydı varsa kural yalnız ona bakar: 4 · 6 dün değilse bugün gelebilir
    const withYday = (n) => [{ day: day(n - 1), family: 'equal', inhale: 5, hold: 0, exhale: 5, pause: 0 }]
    let seen = false
    for (let n = 1; n < 3000 && !seen; n++) seen = breathOfDay(stage('B'), { seedDay: day(n), history: withYday(n), safety: {} }).key === '4|0|6|0'
    expect(seen).toBe(true)
  })
  it('atlanan günden sonra aynı bileşim gelebilir (kural art arda günler için); kural bozulmaz', () => {
    const rows = run('C', 120, { skip: [10, 11, 30, 50, 51, 52] })
    expect(rows.length).toBe(114)
    for (const m of rows) expect(inEnvelope(m, 'C')).toBe(true)
  })
})

describe('breathOfDay: güvenlik ön koşulu ve belirlenimcilik', () => {
  it('güvenlik kartı görülmemişse ya da son 7 günde "Zorlandım" varsa (holdOk false) hiç tutma ve bekleme yok', () => {
    for (const tier of ['C', 'D']) {
      for (const safety of [{ holdOk: false }, {}, undefined]) {
        for (const m of run(tier, 200, { safety })) {
          expect(m.hold).toBe(0)
          expect(m.pause).toBe(0)
        }
      }
    }
  })
  it('aynı gün, aynı geçmiş → aynı kalıp; bugünün ve geleceğin kaydı seçimi değiştirmez', () => {
    const hist = run('D', 20).map((m) => ({ day: m.seedDay, family: m.family, inhale: m.inhale, hold: m.hold, exhale: m.exhale, pause: m.pause }))
    const seedDay = day(20)
    const a = breathOfDay(stage('D'), { seedDay, history: hist, safety: { holdOk: true } })
    const b = breathOfDay(stage('D'), { seedDay, history: [...hist], safety: { holdOk: true } })
    expect(b).toEqual(a)
    const withToday = [...hist, { day: seedDay, family: 'box', inhale: 4, hold: 2, exhale: 4, pause: 4 }, { day: day(25), family: 'calm', inhale: 3, hold: 0, exhale: 5, pause: 0 }]
    expect(breathOfDay(stage('D'), { seedDay, history: withToday, safety: { holdOk: true } })).toEqual(a)
  })
  it('günler arasında çeşitlilik: 30 günde en az 20 ayrı bileşim (B)', () => {
    expect(new Set(run('B', 30).map((m) => m.key)).size).toBeGreaterThanOrEqual(20)
  })
  it('geçersiz tohum ya da geçmiş: yine zarfın içinde bir kalıp', () => {
    for (const seedDay of ['', 'bozuk', undefined]) {
      const m = breathOfDay(stage('C'), { seedDay, history: [{ day: 'x' }, null], safety: { holdOk: true } })
      expect(inEnvelope(m, 'C')).toBe(true)
    }
  })
})

describe('yardımcılar', () => {
  it('mixLabel: al · tut · ver · bekle sırası; sıfır yalnız sondan düşer, bekleme varsa sıfır tutma yazılır; Uzun veriş "2+1 · 5"', () => {
    expect(mixLabel({ family: 'hum', inhale: 4, hold: 1, exhale: 6, pause: 0 })).toBe('4 · 1 · 6')
    expect(mixLabel({ family: 'box', inhale: 4, hold: 2, exhale: 4, pause: 2 })).toBe('4 · 2 · 4 · 2')
    expect(mixLabel({ family: 'box', inhale: 4, hold: 0, exhale: 4, pause: 2 })).toBe('4 · 0 · 4 · 2')
    expect(mixLabel({ family: 'box', inhale: 3, hold: 0, exhale: 4.5, pause: 2 })).toBe('3 · 0 · 4,5 · 2')
    expect(mixLabel({ family: 'belly', inhale: 3.5, hold: 0, exhale: 6.5, pause: 0 })).toBe('3,5 · 6,5')
    expect(mixLabel({ family: 'sigh', inhale: 3, hold: 0, exhale: 5, pause: 0 })).toBe('2+1 · 5')
  })
  it('mixLabel: her ailede aynı konum aynı aşamadır (üç sayı = al · tut · ver, dört sayı = al · tut · ver · bekle)', () => {
    const num = (t) => Number(t.replace(',', '.'))
    for (const tier of ['B', 'C', 'D']) {
      for (const m of run(tier, 400)) {
        if (m.family === 'sigh') continue
        const parts = m.label.split(' · ').map(num)
        if (parts.length === 2) expect([m.hold, m.pause]).toEqual([0, 0])
        if (parts.length === 3) expect(m.pause).toBe(0)
        const want = [m.inhale, m.hold, m.exhale, m.pause].slice(0, parts.length === 2 ? 1 : parts.length)
        if (parts.length === 2) expect(parts).toEqual([m.inhale, m.exhale])
        else expect(parts).toEqual(want)
        // tutma hiçbir zaman 2 sn'yi aşmaz, veriş alıştan kısa değil: ikinci konum tutmadır, veriş değil
        if (parts.length >= 3) expect(parts[1]).toBeLessThanOrEqual(2)
      }
    }
  })
  it('mixEdits lib/breath.js makePlan ile çalışır: süreler aynen, sınırlar içinde', () => {
    for (const m of [...run('D', 60), breathOfDay(stage('B'), { seedDay: day(3) })]) {
      const e = mixEdits(m)
      for (const [k, v] of Object.entries(e)) if (v > 0) expect(v).toBeGreaterThanOrEqual(BREATH_LIMITS[k][0])
      const plan = makePlan({ pattern: m.family, edits: e, durationSec: 180 })
      const breaths = PATTERNS[m.family].sides ? PATTERNS[m.family].sides.length / 2 : 1 // Burun değiştir: turda iki nefes
      expect(plan.cycleSec).toBeCloseTo(breaths * (m.inhale + m.hold + m.exhale + m.pause), 5)
      expect(plan.bpm).toBeCloseTo(m.bpm, 1)
      expect(plan.ramped).toBe(false)
    }
    expect(mixEdits({ family: 'sigh', inhale: 3.5, hold: 0, exhale: 6, pause: 0 })).toEqual({ in: 2.5, in2: 1, hold: 0, out: 6, hold2: 0 })
  })
  it('mixHistory: kayıtlardaki mix alanından, bugün ve bozuk kayıt hariç, günlere göre sıralı', () => {
    const now = new Date(2026, 9, 10, 10)
    const rec = (d, mix) => ({ type: 'breath', seconds: 180, date: new Date(2026, 9, d, 9).toISOString(), mix })
    const h = mixHistory([rec(9, { family: 'equal', inhale: 5, exhale: 5 }), rec(8, { family: 'calm', inhale: 4, hold: 1, exhale: 6 }), rec(10, { family: 'calm', inhale: 4, exhale: 6 }), rec(7, null), rec(6, { inhale: 'x' })], now)
    expect(h).toEqual([
      { day: '2026-10-08', family: 'calm', inhale: 4, hold: 1, exhale: 6, pause: 0 },
      { day: '2026-10-09', family: 'equal', inhale: 5, hold: 0, exhale: 5, pause: 0 },
    ])
  })
  it('pathBreathMinutes: basamağın süresi, dün "Zorlandım" ise bir kısa; en az 1, yolda en çok 3', () => {
    expect(pathBreathMinutes({ minutes: 3 }, { stepDown: false })).toBe(3)
    expect(pathBreathMinutes({ minutes: 3 }, { stepDown: true })).toBe(2)
    expect(pathBreathMinutes({ minutes: 1 }, { stepDown: true })).toBe(1)
    expect(pathBreathMinutes({ minutes: 5 })).toBe(3)
    expect(pathBreathMinutes(null)).toBe(3)
  })
})
