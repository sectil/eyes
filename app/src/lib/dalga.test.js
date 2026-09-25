import { describe, it, expect } from 'vitest'
import {
  MODES, MODE_ORDER, FACTS, ANSWER_TEXT, VALUES, EXP_N, DALGA_OPTS_KEY,
  normalizeOpts, loadDalgaOpts, saveDalgaOpts, binauralPlan, experimentOf, experimentText, makeRecord, factFor, isDalga,
} from './dalga.js'

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) } }
const rec = (over) => ({ type: 'dalga', mode: 'sakin', date: '2026-09-20T10:00:00.000Z', before: 4, after: 6, delta: 2, seconds: 300, ...over })

describe('Dalga tercihleri', () => {
  it('bilinmeyen değerler varsayılana döner; kaydet/yükle', () => {
    expect(normalizeOpts({ mode: 'x', minutes: 7 })).toEqual({ mode: 'sakin', minutes: 5, headphones: true, experiment: true })
    const s = mem()
    saveDalgaOpts({ mode: 'motive', minutes: 10, headphones: false, experiment: false }, s)
    expect(JSON.parse(s.getItem(DALGA_OPTS_KEY)).mode).toBe('motive')
    expect(loadDalgaOpts(s)).toEqual({ mode: 'motive', minutes: 10, headphones: false, experiment: false })
    expect(loadDalgaOpts({ getItem: () => '{bozuk' })).toEqual(normalizeOpts())
  })
})

describe('binaural katman planı', () => {
  it('yalnız Sakin + kulaklıkta; deney kapalıysa hep açık', () => {
    expect(binauralPlan({ mode: 'guc', headphones: true, experiment: true })).toEqual({ used: false, exp: false, on: false })
    expect(binauralPlan({ mode: 'sakin', headphones: false, experiment: true })).toEqual({ used: false, exp: false, on: false })
    expect(binauralPlan({ mode: 'sakin', headphones: true, experiment: false })).toEqual({ used: true, exp: false, on: true })
  })
  it('deney: ikili bloklarda biri açık biri kapalı; 6 oturumda 3/3', () => {
    for (const seed of [0.1, 0.9]) {
      const sessions = []
      for (let k = 0; k < EXP_N; k++) {
        const p = binauralPlan({ mode: 'sakin', headphones: true, experiment: true }, sessions, () => seed)
        expect(p.exp).toBe(true)
        sessions.push(makeRecord({ mode: 'sakin', minutes: 5, before: 4, after: 6, plan: p, seconds: 300 }))
      }
      expect(sessions.filter((s) => s.binaural).length).toBe(3)
      expect(sessions[0].binaural).not.toBe(sessions[1].binaural)
    }
  })
})

describe('deney sonucu', () => {
  it('6 oturumdan önce hazır değil; sonra iki grubun ortalaması', () => {
    const five = [true, false, true, false, true].map((b) => rec({ exp: true, binaural: b }))
    expect(experimentOf(five).ready).toBe(false)
    expect(experimentText(experimentOf(five))).toBeNull()
    const six = [...five, rec({ exp: true, binaural: false, delta: 0 })]
    const e = experimentOf(six)
    expect(e).toMatchObject({ n: 6, ready: true, on: { n: 3, mean: 2 }, off: { n: 3 } })
    expect(e.diff).toBeCloseTo(2 - 4 / 3)
    expect(experimentText(e)).toMatch(/^Fark küçük \(katman açık \+2,0, kapalı \+1,3\)/)
  })
  it('deney dışı ve başka mod oturumları sayılmaz; fark yönü doğru yazılır', () => {
    const on = [1, 2, 3].map(() => rec({ exp: true, binaural: true, delta: 3 }))
    const off = [1, 2, 3].map(() => rec({ exp: true, binaural: false, delta: 1 }))
    const noise = [rec({ binaural: true, exp: false, delta: -5 }), rec({ mode: 'guc', delta: -5 })]
    expect(experimentText(experimentOf([...on, ...off, ...noise]))).toMatch(/^Katman açıkken daha çok sakinleştin/)
    const rev = [...on.map((s) => ({ ...s, delta: 0 })), ...off]
    expect(experimentText(experimentOf(rev))).toMatch(/^Katman kapalıyken/)
  })
})

describe('kayıt', () => {
  it('fark, değer yalnız Güç\'te, binaural yalnız kullanıldıysa', () => {
    const r = makeRecord({ mode: 'guc', minutes: 3, before: 3, after: 7, value: 'Merak', plan: { used: false }, seconds: 179.6 }, new Date('2026-09-25T10:00:00Z'))
    expect(r).toEqual({ type: 'dalga', date: '2026-09-25T10:00:00.000Z', mode: 'guc', minutes: 3, before: 3, after: 7, delta: 4, seconds: 180, value: 'Merak' })
    expect(isDalga(r)).toBe(true)
    const s = makeRecord({ mode: 'sakin', minutes: 5, before: 5, after: 5, value: 'Merak', plan: { used: true, exp: true, on: false }, seconds: 300 })
    expect(s).toMatchObject({ binaural: false, exp: true, delta: 0 })
    expect(s.value).toBeUndefined()
  })
})

describe('modlar ve bilim kartları', () => {
  it('her mod eksiksiz; değerler benzersiz', () => {
    for (const id of MODE_ORDER) {
      const m = MODES[id]
      for (const k of ['name', 'sub', 'c1', 'c2', 'ask', 'lo', 'hi', 'word']) expect(typeof m[k]).toBe('string')
      expect(m.hints.length).toBeGreaterThan(0)
    }
    expect(new Set(VALUES).size).toBe(VALUES.length)
  })
  it('her kartın DOI\'si, cevabı var; her modun havuzu dolu ve moda özel kart önce gelir', () => {
    for (const f of FACTS) {
      expect(f.doi).toMatch(/^10\.\d{4,}\//)
      expect(ANSWER_TEXT[f.answer]).toBeTruthy()
    }
    expect(new Set(FACTS.map((f) => f.id)).size).toBe(FACTS.length)
    expect(factFor([], 'sakin').id).toBe('silence')
    expect(factFor([], 'guc').id).toBe('affirm')
    expect(factFor([], 'motive').id).toBe('tempo')
    expect(factFor([rec({ mode: 'guc' })], 'guc').id).toBe('528')
    expect(factFor([rec({ mode: 'motive' }), rec({ mode: 'motive' })], 'motive').id).toBe('tempo')
  })
})
