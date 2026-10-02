import { describe, it, expect } from 'vitest'
import {
  createBreathCounter, summarize, tapIrregularity, nextProbeAt, durationFor, bcTrend, makeRecord, resultText,
  DURATIONS_SEC, INTRO_SESSIONS, BASELINE_SESSIONS, PROBE_GAP_MS, SESSION_TYPE,
} from './breathCount.js'

// n nefeslik doğru set: 8 dokunuş + 9'da basılı tutma
function okSet(c, t0, gap = 4000) {
  for (let i = 0; i < 8; i++) c.tap(t0 + i * gap)
  c.nine(t0 + 8 * gap)
  return t0 + 9 * gap
}

describe('createBreathCounter', () => {
  it('doğru set: 8 dokunuş + 9 → ok, sayaç sıfırlanır', () => {
    const c = createBreathCounter()
    okSet(c, 0)
    expect(c.state).toEqual({ count: 0, probing: false, sets: 1, probes: 0, nines: 1 })
    expect(c.summary(36).ok).toBe(1)
    expect(c.summary(36).accuracy).toBe(100)
  })
  it('9. nefeste normal dokunuş → fark edilmeden kaçırılan (miss9)', () => {
    const c = createBreathCounter()
    for (let i = 0; i < 9; i++) c.tap(i * 1000)
    const s = c.summary(9)
    expect(s.miss9).toBe(1)
    expect(s.ok).toBe(0)
    expect(c.state.count).toBe(0)
    expect(s.accuracy).toBe(0)
  })
  it('erken 9 → early9; kaybettim → reset (kendi yakaladığı)', () => {
    const c = createBreathCounter()
    c.tap(0); c.tap(1000); c.nine(2000)
    c.tap(3000); c.reset(4000)
    const s = c.summary(4)
    expect(s.early9).toBe(1)
    expect(s.resets).toBe(1)
    expect(s.accuracy).toBe(0)
    expect(s.selfCaught).toBe(50)
  })
  it('Levinson doğruluk formülü: (9\'lar + sorgular + kaybettim) paydası', () => {
    const c = createBreathCounter()
    let t = okSet(c, 0)
    t = okSet(c, t)
    c.tap(t); c.tap(t + 1000); c.tap(t + 2000) // sayaç 3
    c.openProbe()
    c.answerProbe(t + 3000, { mw: 2, said: 3 }) // doğru
    c.tap(t + 4000)
    c.openProbe()
    c.answerProbe(t + 5000, { mw: 5, said: 7 }) // yanlış (gerçek 4)
    c.reset(t + 6000)
    const s = c.summary(60)
    // toplam: 2 ok + 2 sorgu + 1 reset = 5; yanlış: 1 sorgu + 1 reset = 2 → %60
    expect(s.accuracy).toBe(60)
    expect(s.probes).toBe(2)
    expect(s.probeWrong).toBe(1)
    expect(s.mw).toBe(3.5)
  })
  it('sorgu açıkken dokunuşlar yok sayılır; sorgu sayacı bozmaz', () => {
    const c = createBreathCounter()
    c.tap(0); c.tap(1000)
    c.openProbe()
    c.tap(1500); c.nine(1600); c.reset(1700)
    expect(c.state).toMatchObject({ count: 2, probing: true, sets: 0 })
    c.answerProbe(2000, { mw: 1, said: 2 })
    expect(c.state.probing).toBe(false)
    expect(c.state.count).toBe(2)
    expect(c.summary(2).probeWrong).toBe(0)
  })
  it('sorguda "bilmiyorum" (0) yanlış sayılır; geçersiz mw atılır', () => {
    const c = createBreathCounter()
    c.tap(0)
    c.openProbe()
    c.answerProbe(1000, { mw: 9, said: 0 })
    const s = c.summary(1)
    expect(s.probeWrong).toBe(1)
    expect(s.mw).toBeNull()
  })
  it('veri yoksa doğruluk null', () => {
    expect(createBreathCounter().summary(0).accuracy).toBeNull()
    expect(resultText(summarize({}))).toMatch(/yeterli veri/)
  })
})

describe('tapIrregularity / bpm', () => {
  it('düzenli dokunuşta ~0, düzensizde büyük; uzun aralar atılır', () => {
    const even = Array.from({ length: 20 }, (_, i) => ({ ts: i * 4000 }))
    expect(tapIrregularity(even)).toBe(0)
    const uneven = [0, 2000, 7000, 8000, 15000, 16000, 24000, 25000].map((ts) => ({ ts }))
    expect(tapIrregularity(uneven)).toBeGreaterThan(0.5)
    const withPause = [...even, { ts: 80000 + 60000 }, { ts: 80000 + 64000 }]
    expect(tapIrregularity(withPause)).toBe(0) // 60 sn ara sayılmadı
    expect(tapIrregularity(even.slice(0, 3))).toBeNull()
  })
  it('bpm: dokunuş/dk', () => {
    const c = createBreathCounter()
    for (let i = 0; i < 18; i++) c.tap(i * 5000)
    expect(c.summary(180).bpm).toBe(6)
  })
})

describe('sorgu zamanı, süre, eğilim', () => {
  it('nextProbeAt 60–120 sn sonra', () => {
    expect(nextProbeAt(1000, () => 0)).toBe(1000 + PROBE_GAP_MS.min)
    expect(nextProbeAt(1000, () => 1)).toBe(1000 + PROBE_GAP_MS.max)
  })
  it('ilk 3 seans kısa, sonra standart', () => {
    const rec = (i) => makeRecord({ accuracy: 80 }, new Date(2026, 8, 1 + i))
    expect(durationFor([])).toBe(DURATIONS_SEC.short)
    expect(durationFor([rec(0), rec(1)])).toBe(DURATIONS_SEC.short)
    expect(durationFor([rec(0), rec(1), rec(2)])).toBe(DURATIONS_SEC.standard)
    expect(durationFor([{ type: 'blink', date: '2026-09-01' }])).toBe(DURATIONS_SEC.short)
  })
  it('bcTrend: alışma → başlangıç → izleme, referans = 4–10. seansların ortancası', () => {
    const recs = []
    const push = (acc, i) => recs.push(makeRecord({ accuracy: acc }, new Date(2026, 8, 1 + i)))
    expect(bcTrend(recs).phase).toBe('empty')
    push(50, 0); push(60, 1); push(70, 2)
    expect(bcTrend(recs)).toMatchObject({ phase: 'familiarization', n: 3, reference: null })
    ;[70, 72, 74, 76, 78, 80, 82].forEach((a, i) => push(a, 3 + i))
    const t = bcTrend(recs)
    expect(t.phase).toBe('tracking')
    expect(t.reference).toBe(76)
    expect(t.delta).toBe(80 - 76) // son 3'ün ortancası 80
    expect(bcTrend(recs.slice(0, 6)).phase).toBe('baseline')
    expect(INTRO_SESSIONS + BASELINE_SESSIONS).toBe(10)
  })
  it('makeRecord türü ve tarihi', () => {
    const r = makeRecord({ accuracy: 90, seconds: 180 }, new Date('2026-09-25T10:00:00Z'))
    expect(r.type).toBe(SESSION_TYPE)
    expect(r.date).toBe('2026-09-25T10:00:00.000Z')
    expect(r.accuracy).toBe(90)
  })
  it('resultText iddiasız, sayı + tek yorum', () => {
    expect(resultText({ accuracy: 100, miss9: 0, early9: 0, resets: 0, probeWrong: 0, mw: 1.5 })).toBe('Doğruluk %100. Hiç hata yok. Dikkatin çoğunlukla nefesteydi.')
    expect(resultText({ accuracy: 60, miss9: 1, early9: 0, resets: 1, probeWrong: 0, selfCaught: 50, mw: 5 })).toMatch(/%50 kadarını kendin fark ettin.*sık sık/)
  })
})
