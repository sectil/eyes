import { describe, it, expect } from 'vitest'
import { buildMoments, rainSpan, dayPartOf, EXCLUDED_EFFECTS, EXCLUDED_METRICS, PRIORITY } from './moments.js'

const NOW = new Date(2026, 9, 1, 8, 0) // Perşembe 08.00 (yerel)
const H = 3600000
const dayStart = new Date(2026, 9, 1).getTime()
// Bugünün saatlik tahmini: rain = [başlangıç saati, bitiş saati) yağmurlu, feels = { saat: hissedilen }
function forecast({ rain = null, feels = {}, fetchedAt = NOW.getTime() - H } = {}) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    at: dayStart + h * H,
    precipChance: rain && h >= rain[0] && h < rain[1] ? 0.8 : 0.1,
    apparentC: feels[h] ?? 22,
  }))
  return { fetchedAt, hours }
}
const walk = (at, o = {}) => ({ at, source: 'habit', weekCount: 3, ...o })
const types = (list) => list.map((m) => m.type)
const of = (list, type) => list.find((m) => m.type === type)

describe('gün dilimi ve yağmur aralığı', () => {
  it('dilim sınırları', () => {
    expect(dayPartOf(4 * 60)).toBe('night')
    expect(dayPartOf(5 * 60)).toBe('morning')
    expect(dayPartOf(12 * 60)).toBe('noon')
    expect(dayPartOf(19 * 60 + 30)).toBe('evening')
    expect(dayPartOf(23 * 60)).toBe('night')
  })
  it('ilk kesintisiz aralık, şimdiden sonra', () => {
    expect(rainSpan(forecast({ rain: [19, 22] }).hours, NOW)).toEqual({ from: 1140, to: 1320 })
    expect(rainSpan(forecast({ rain: [5, 7] }).hours, NOW)).toBeNull() // geçmişte kaldı
    expect(rainSpan(forecast().hours, NOW)).toBeNull()
  })
})

describe('rainOnWalk · F1', () => {
  it('F1.A: yürüyüş yağmurun içinde, öne alınacak saat var', () => {
    const m = of(buildMoments({ now: NOW, walk: walk(1170), forecast: forecast({ rain: [19, 22] }) }), 'rainOnWalk')
    expect(m.cell).toBe('F1.A')
    expect(m.facts).toMatchObject({ walkAt: 1170, rainFrom: 1140, rainTo: 1320, earlyAt: 1080, part: 'evening', n: 3, source: 'habit', covered: false })
    expect(m.channels).toEqual(['notify', 'card'])
    expect(m.key).toBe('rainOnWalk:2026-10-01')
  })
  it('F1.E: saat kişinin kurduğu hatırlatmadan', () => {
    const m = of(buildMoments({ now: NOW, walk: walk(1170, { source: 'remind' }), forecast: forecast({ rain: [19, 22] }) }), 'rainOnWalk')
    expect(m.cell).toBe('F1.E')
  })
  it('F1.B: yürüyüş yağmurdan en çok 90 dk önce', () => {
    const m = of(buildMoments({ now: NOW, walk: walk(1080), forecast: forecast({ rain: [19, 22] }) }), 'rainOnWalk')
    expect(m.cell).toBe('F1.B')
    expect(m.facts.earlyAt).toBeUndefined()
    expect(of(buildMoments({ now: NOW, walk: walk(1040), forecast: forecast({ rain: [19, 22] }) }), 'rainOnWalk')).toBeUndefined() // 100 dk önce
  })
  it('F1.C: yağmur dilimin tamamında ya da öne alınacak saat yok', () => {
    const c = of(buildMoments({ now: NOW, walk: walk(1170), forecast: forecast({ rain: [17, 22] }) }), 'rainOnWalk')
    expect(c.cell).toBe('F1.C')
    expect(c.facts.covered).toBe(true)
    const late = new Date(2026, 9, 1, 18, 10) // 18.00 artık 30 dk sonra değil
    const c2 = of(buildMoments({ now: late, walk: walk(1170), forecast: forecast({ rain: [19, 22], fetchedAt: late.getTime() - H }) }), 'rainOnWalk')
    expect(c2.cell).toBe('F1.C')
    expect(c2.facts.covered).toBe(false)
  })
  it('kişisel olgu yoksa an yok', () => {
    expect(of(buildMoments({ now: NOW, walk: null, forecast: forecast({ rain: [19, 22] }) }), 'rainOnWalk')).toBeUndefined()
    expect(of(buildMoments({ now: NOW, walk: { at: 1170 }, forecast: forecast({ rain: [19, 22] }) }), 'rainOnWalk')).toBeUndefined()
  })
  it('yağmur yürüyüşten sonra bitmişse ya da tahmin 18 saatten eskiyse an yok', () => {
    expect(of(buildMoments({ now: NOW, walk: walk(1260), forecast: forecast({ rain: [17, 19] }) }), 'rainOnWalk')).toBeUndefined()
    expect(of(buildMoments({ now: NOW, walk: walk(1170), forecast: forecast({ rain: [19, 22], fetchedAt: NOW.getTime() - 19 * H }) }), 'rainOnWalk')).toBeUndefined()
  })
  it('yolunu bitirdiyse bildirim kanalı yok, kart kalır', () => {
    const m = of(buildMoments({ now: NOW, walk: walk(1170), forecast: forecast({ rain: [19, 22] }), path: { has: true, doneToday: true, doneDays: 1 } }), 'rainOnWalk')
    expect(m.channels).toEqual(['card'])
  })
})

describe('hotWalk · F3 (yalnız kart)', () => {
  it('F3.A yağmurla aynı gün; hissedilen öneri saatinin', () => {
    const m = of(buildMoments({ now: NOW, walk: walk(1170), forecast: forecast({ rain: [19, 22], feels: { 18: 31.4, 19: 25 } }) }), 'hotWalk')
    expect(m.cell).toBe('F3.A')
    expect(m.facts.feels).toBe(31)
    expect(m.channels).toEqual(['card'])
  })
  it('F3.B yağmursuz; eşik 30', () => {
    const m = of(buildMoments({ now: NOW, walk: walk(1170), forecast: forecast({ feels: { 19: 30 } }) }), 'hotWalk')
    expect(m.cell).toBe('F3.B')
    expect(m.facts).toMatchObject({ feels: 30, walkAt: 1170, part: 'evening', source: 'habit' })
    expect(of(buildMoments({ now: NOW, walk: walk(1170), forecast: forecast({ feels: { 19: 29.4 } }) }), 'hotWalk')).toBeUndefined()
    expect(of(buildMoments({ now: NOW, walk: null, forecast: forecast({ feels: { 19: 33 } }) }), 'hotWalk')).toBeUndefined()
  })
})

describe('recallEffect ve effectPattern · F2', () => {
  const evening = new Date(2026, 9, 8, 20, 0)
  const effects = [
    { key: 'dalga-sakin', module: 'dalga', measure: 'sakinlik', pick: (s) => (s.type === 'dalga' ? [s.before, s.after] : null) },
    { key: 'yoga-nefes', module: 'yoga', measure: 'gerginlik', better: 'down', pick: (s) => (s.type === 'yoga' ? [s.before, s.after] : null) },
    { key: 'yon-uzak', module: 'yon', measure: 'rahatsızlık', better: 'down', pick: (s) => (s.type === 'yon' ? [s.before, s.after] : null) },
  ]
  const ses = (type, d, before, after) => ({ type, date: d.toISOString(), before, after })
  it('geçen hafta aynı gün ve dilim, iyi yönde ≥ 2 puan', () => {
    const sessions = [ses('dalga', new Date(2026, 9, 1, 19, 30), 4, 7), ses('yoga', new Date(2026, 9, 1, 21, 0), 6, 3)]
    const list = buildMoments({ now: evening, effects, sessions })
    const r = list.filter((m) => m.type === 'recallEffect')
    expect(r.map((m) => m.cell).sort()).toEqual(['F2.A', 'F2.B'])
    expect(r.find((m) => m.cell === 'F2.A').facts).toMatchObject({ module: 'dalga', effect: 'dalga-sakin', before: 4, after: 7, part: 'evening', better: 'up' })
  })
  it('kötü yönde ya da küçük değişimde, başka gün ya da başka dilimde an yok', () => {
    const sessions = [
      ses('dalga', new Date(2026, 9, 1, 19, 30), 7, 4), // kötü yönde
      ses('yoga', new Date(2026, 9, 1, 21, 0), 6, 5), // 1 puan
      ses('dalga', new Date(2026, 9, 2, 19, 30), 4, 7), // başka gün
      ses('dalga', new Date(2026, 9, 1, 8, 0), 4, 7), // sabah
    ]
    expect(types(buildMoments({ now: evening, effects, sessions }))).not.toContain('recallEffect')
  })
  it("Yön 'rahatsızlık' anılmaz", () => {
    const sessions = [ses('yon', new Date(2026, 9, 1, 19, 30), 8, 3)]
    expect(types(buildMoments({ now: evening, effects, sessions }))).not.toContain('recallEffect')
    const acute = [{ key: 'yon-uzak', module: 'yon', measure: 'rahatsızlık', better: 'down', n: 5, before: 7, after: 5, gain: 2, lo: 1, hi: 3, sig: true }]
    expect(types(buildMoments({ now: evening, acute }))).not.toContain('effectPattern')
    expect(EXCLUDED_EFFECTS.has('yon-uzak')).toBe(true)
  })
  it('örüntü: anlamlı, en az 3 seans, iyi yönde', () => {
    const acute = [
      { key: 'dalga-sakin', module: 'dalga', measure: 'sakinlik', better: 'up', n: 5, before: 4, after: 6, gain: 2, lo: 1, hi: 3, sig: true },
      { key: 'yoga-nefes', module: 'yoga', measure: 'gerginlik', better: 'down', n: 4, before: 6.75, after: 5.25, gain: 1.5, lo: 0.5, hi: 2.5, sig: true },
      { key: 'gokyuzu-rest', module: 'gokyuzu', measure: 'dinlenmişlik', better: 'up', n: 2, before: 3, after: 6, gain: 3, lo: 1, hi: 5, sig: true },
      { key: 'yoga-odak', module: 'yoga', measure: 'odak', better: 'up', n: 6, before: 6, after: 4, gain: -2, lo: -3, hi: -1, sig: true },
      { key: 'dalga-guc', module: 'dalga', measure: 'kendine güven', better: 'up', n: 6, before: 5, after: 6, gain: 1, lo: -0.5, hi: 2, sig: false },
    ]
    const p = buildMoments({ now: evening, acute }).filter((m) => m.type === 'effectPattern')
    expect(p.map((m) => [m.facts.effect, m.cell])).toEqual([['dalga-sakin', 'F2.C'], ['yoga-nefes', 'F2.D']])
    expect(p[1].facts).toMatchObject({ n: 4, gain: 1.5, beforeAvg: 6.75, afterAvg: 5.25, better: 'down' })
  })
})

describe('metricChange', () => {
  const base = { module: 'tek-bakis', key: 'tek-bakis-span', domain: 'focus', better: 'up', verdict: 'better', start: 4, current: 6, weeks: 2 }
  it('yalnız doğrulanmış, iyi yönde ve better: up', () => {
    const m = of(buildMoments({ now: NOW, metrics: [base] }), 'metricChange')
    expect(m.cell).toBe('MC')
    expect(m.facts).toEqual({ module: 'tek-bakis', metric: 'tek-bakis-span', start: 4, current: 6, weeks: 2 })
  })
  it('aşağı-iyi metrik, kötüleşme, doğrulanmamış, göz ve uyku: an yok', () => {
    const metrics = [
      { ...base, key: 'quick-look-threshold', module: 'quick-look', better: 'down', start: 120, current: 80 },
      { ...base, verdict: 'worse', start: 6, current: 4 },
      { ...base, verdict: 'unclear' },
      { ...base, key: 'va', module: 'weekly', domain: 'eye' },
      { ...base, key: 'yoga-uyku-dalma', module: 'yoga', domain: 'wellbeing' },
    ]
    expect(types(buildMoments({ now: NOW, metrics }))).not.toContain('metricChange')
    expect(EXCLUDED_METRICS.has('yoga-uyku-dalma')).toBe(true)
  })
})

describe('firstTime, returnAfterGap, pathDone', () => {
  it('firstTime A ve B', () => {
    const firsts = [
      { module: 'snake', kind: 'day' },
      { module: 'tek-bakis', kind: 'metric', metric: 'tek-bakis-span', domain: 'focus', value: 4 },
      { module: 'gokyuzu', kind: 'effect', effect: 'gokyuzu-rest', measure: 'dinlenmişlik', better: 'up', before: 3, after: 6 },
      { module: 'dalga', kind: 'effect', effect: 'dalga-sakin', measure: 'sakinlik', better: 'up', before: 6, after: 4 }, // kötü yön: sayısız
      { module: 'yon', kind: 'effect', effect: 'yon-uzak', measure: 'rahatsızlık', better: 'down', before: 7, after: 4 }, // rahatsızlık anılmaz
      { module: 'weekly', kind: 'metric', metric: 'va', domain: 'eye', value: 0.1 }, // göz ölçümü: sayısız
      { module: 'snake', kind: 'day' }, // aynı modül bir kez
    ]
    const f = buildMoments({ now: NOW, firsts }).filter((m) => m.type === 'firstTime')
    expect(f.map((m) => [m.facts.module, m.cell])).toEqual([['snake', 'FT'], ['tek-bakis', 'FTB'], ['gokyuzu', 'FTB'], ['dalga', 'FT'], ['yon', 'FT'], ['weekly', 'FT']])
    expect(f[1].facts).toEqual({ module: 'tek-bakis', metric: 'tek-bakis-span', start: 4 })
    expect(f.find((m) => m.facts.module === 'yon').facts).toEqual({ module: 'yon' })
  })
  it('returnAfterGap: 14 gün ve üstü; son seans iyi yöndeyse olgu', () => {
    const gaps = [
      { module: 'dalga', days: 20, last: { effect: 'dalga-sakin', measure: 'sakinlik', better: 'up', before: 4, after: 7 } },
      { module: 'snake', days: 13 },
      { module: 'yon', days: 30, last: { effect: 'yon-uzak', measure: 'rahatsızlık', better: 'down', before: 7, after: 4 } },
    ]
    const g = buildMoments({ now: NOW, gaps }).filter((m) => m.type === 'returnAfterGap')
    expect(g.map((m) => m.facts.module)).toEqual(['dalga', 'yon'])
    expect(g[0].facts).toMatchObject({ effect: 'dalga-sakin', before: 4, after: 7 })
    expect(g[1].facts).toEqual({ module: 'yon' })
  })
  it('pathDone: bugün bitti ve bu hafta en az 2 gün', () => {
    expect(of(buildMoments({ now: NOW, path: { has: true, doneToday: true, doneDays: 4 } }), 'pathDone').facts).toEqual({ n: 4 })
    expect(of(buildMoments({ now: NOW, path: { has: true, doneToday: true, doneDays: 1 } }), 'pathDone')).toBeUndefined()
    expect(of(buildMoments({ now: NOW, path: { has: true, doneToday: false, doneDays: 4 } }), 'pathDone')).toBeUndefined()
  })
})

describe('F4 · susan Nef, dönüş, düşük WHO-5', () => {
  it('sessiz gün her zaman en sonda: yol varsa F4.A, yoksa ya da bittiyse F4.B', () => {
    expect(buildMoments({ now: NOW, path: { has: true, doneToday: false } }).at(-1)).toMatchObject({ type: 'silentDay', cell: 'F4.A', priority: 0 })
    expect(buildMoments({ now: NOW, path: { has: true, doneToday: true, doneDays: 1 } }).at(-1).cell).toBe('F4.B')
    expect(buildMoments({ now: NOW }).map((m) => m.cell)).toEqual(['F4.B'])
  })
  it('uygulamaya 5+ gün aradan dönüş: tek an', () => {
    const list = buildMoments({ now: NOW, appGapDays: 6, walk: walk(1170), forecast: forecast({ rain: [19, 22] }) })
    expect(list).toEqual([expect.objectContaining({ type: 'returnApp', cell: 'F4.C', channels: ['card'] })])
    expect(buildMoments({ now: NOW, appGapDays: 4 }).map((m) => m.type)).toEqual(['silentDay'])
    expect(buildMoments({ now: NOW, appGapDays: 6, path: { has: true, backLine: true } })).toEqual([])
  })
  it('düşük WHO-5: yalnız sabit satır işareti, hücre yok', () => {
    const list = buildMoments({ now: NOW, who5Low: true, appGapDays: 9, walk: walk(1170), forecast: forecast({ rain: [19, 22] }) })
    expect(list).toEqual([{ type: 'lowWho5', cell: null, facts: {}, key: 'lowWho5:2026-10-01', priority: PRIORITY.lowWho5, channels: ['card'] }])
  })
  it('önem sırası', () => {
    const list = buildMoments({
      now: NOW,
      walk: walk(1170),
      forecast: forecast({ rain: [19, 22], feels: { 18: 31 } }),
      path: { has: true, doneToday: true, doneDays: 3 },
      metrics: [{ module: 'tek-bakis', key: 'tek-bakis-span', domain: 'focus', better: 'up', verdict: 'better', start: 4, current: 6 }],
      firsts: [{ module: 'snake', kind: 'day' }],
    })
    expect(types(list)).toEqual(['pathDone', 'rainOnWalk', 'hotWalk', 'metricChange', 'firstTime', 'silentDay'])
  })
  it('drift, metricBest ve ladderStep an değil', () => {
    const t = new Set(Object.keys(PRIORITY))
    for (const x of ['drift', 'metricBest', 'ladderStep']) expect(t.has(x)).toBe(false)
  })
})
