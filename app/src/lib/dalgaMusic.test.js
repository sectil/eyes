import { describe, it, expect } from 'vitest'
import { makeComposer, karplus, stepSec, TEMPO, SILENT_EVERY, BINAURAL, mtof } from './dalgaMusic.js'
import { rng } from './street.js'

const bars = (mode, n, seed = 1) => {
  const c = makeComposer(mode, rng(seed))
  return Array.from({ length: n * 8 }, (_, i) => c(i, i / (n * 8)))
}
const notesOf = (e) => (e.midi != null ? [e.midi] : e.notes ?? [])

describe('Dalga besteleri', () => {
  it('tempo ve adım süresi', () => {
    expect(TEMPO).toEqual({ sakin: 60, guc: 72, motive: 116 })
    expect(stepSec('sakin')).toBeCloseTo(0.5)
    expect(BINAURAL.right - BINAURAL.left).toBe(6)
    expect(mtof(69)).toBe(440)
  })
  it('Sakin: her 6. ölçü tam sessiz (yalnız işaret), diğer ölçüler çalar', () => {
    for (const seed of [1, 2, 3]) {
      const steps = bars('sakin', 12, seed)
      for (let bar = 0; bar < 12; bar++) {
        const evs = steps.slice(bar * 8, bar * 8 + 8).flat()
        if (bar % SILENT_EVERY === SILENT_EVERY - 1) expect(evs).toEqual([{ inst: 'cue', cue: 'silence', at: 0 }])
        else expect(evs.some((e) => e.inst === 'pad')).toBe(true)
      }
    }
  })
  it('bütün notalar makul aralıkta, güç 0..1, süreler pozitif', () => {
    for (const mode of ['sakin', 'guc', 'motive']) {
      for (const e of bars(mode, 16, 7).flat()) {
        if (e.inst === 'cue') continue
        expect(e.vel).toBeGreaterThan(0)
        expect(e.vel).toBeLessThanOrEqual(1)
        for (const n of notesOf(e)) {
          expect(n).toBeGreaterThanOrEqual(28)
          expect(n).toBeLessThanOrEqual(96)
        }
        if (e.dur != null) expect(e.dur).toBeGreaterThan(0)
      }
    }
  })
  it('Motivasyon: her vuruşta davul; Güç: tur ilerledikçe daha güçlü', () => {
    const steps = bars('motive', 4)
    steps.forEach((evs, i) => expect(evs.some((e) => e.inst === (i % 2 === 0 ? 'kick' : 'shaker'))).toBe(true))
    const c = makeComposer('guc', rng(3))
    const early = c(0, 0).find((e) => e.inst === 'strum').vel
    const late = c(0, 1).find((e) => e.inst === 'strum').vel
    expect(late).toBeGreaterThan(early)
  })
  it('her oturum biraz farklı (tohum), aynı tohum aynı', () => {
    const a = JSON.stringify(bars('sakin', 4, 11))
    expect(JSON.stringify(bars('sakin', 4, 11))).toBe(a)
    expect(JSON.stringify(bars('sakin', 4, 12))).not.toBe(a)
  })
})

describe('Karplus–Strong tel sentezi', () => {
  it('doğru uzunluk, sonlu değerler, zamanla söner', () => {
    const sr = 44100
    const x = karplus(sr, mtof(57), 2, rng(5))
    expect(x.length).toBe(2 * sr)
    expect(x.every(Number.isFinite)).toBe(true)
    const energy = (a, b) => x.slice(a, b).reduce((s, v) => s + v * v, 0)
    expect(energy(x.length - 4410, x.length)).toBeLessThan(energy(0, 4410) * 0.2)
  })
  it('perde: ilk tekrar periyodu ~ sr/f', () => {
    const sr = 44100
    const x = karplus(sr, 220, 0.2, rng(9))
    const N = Math.round(sr / 220 - 0.5)
    expect(x[N]).toBeCloseTo(0.996 * 0.5 * (x[0] + x[1]), 6)
  })
})
