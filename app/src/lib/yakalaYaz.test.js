import { describe, it, expect } from 'vitest'
import { MS, FRAMES, STEPS, msOf, nextStep, startStepOf, checkAnswer, markTyped, thresholdOf, makeRecord, isBadShow, seriesOf, FIRST_STEP, roundTrialsOf, ROUND_TRIALS } from './yakalaYaz.js'

describe('Yakala Yaz · hız merdiveni', () => {
  it('18 basamak: kare ve ms tablosu (PLAN §2)', () => {
    expect(STEPS).toBe(18)
    expect(FRAMES).toEqual([30, 27, 24, 21, 19, 17, 15, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3])
    expect(MS).toEqual([500, 450, 400, 350, 317, 283, 250, 217, 200, 183, 167, 150, 133, 117, 100, 83, 67, 50])
    expect(msOf(3)).toBe(400)
  })
  it('doğruda +1, yanlışta −3; sınır 1–18', () => {
    expect(nextStep(5, true)).toBe(6)
    expect(nextStep(5, false)).toBe(2)
    expect(nextStep(18, true)).toBe(18)
    expect(nextStep(2, false)).toBe(1)
  })
  it('başlangıç: ilk tur 3; sonra eşikten 2 yavaş; 14+ gün aradan sonra 4 yavaş', () => {
    const now = new Date(2026, 4, 20, 10)
    const rec = (daysAgo, thresholdStep) => ({ type: 'yakala-yaz', date: new Date(now - daysAgo * 86400000).toISOString(), thresholdStep })
    expect(startStepOf([], now)).toBe(FIRST_STEP)
    expect(startStepOf([rec(1, 10)], now)).toBe(8)
    expect(startStepOf([rec(14, 10)], now)).toBe(6)
    expect(startStepOf([rec(1, 2)], now)).toBe(1)
  })
  it('gösterim 1 kareden çok saparsa deneme ölçüye girmez', () => {
    expect(isBadShow(100, 116.7, 60)).toBe(false)
    expect(isBadShow(100, 118, 60)).toBe(true)
    expect(isBadShow(100, 108, 120)).toBe(false)
    expect(isBadShow(100, 110, 120)).toBe(true)
  })
})

describe('Yakala Yaz · cevap denetimi', () => {
  const W = ['çınar', 'vapur']
  it('Türkçe küçük harf, harf ve şapka eksikliği, sıra serbest, noktalama atılır', () => {
    expect(checkAnswer('cinar vapur', W).ok).toBe(true)
    expect(checkAnswer('  VAPUR, Çınar. ', W).ok).toBe(true)
    expect(checkAnswer('ruzgar kedi', ['rüzgâr', 'kedi']).ok).toBe(true)
    expect(checkAnswer('KIYI İnci', ['kıyı', 'inci']).ok).toBe(true)
  })
  it('tek kelime doğru → part 1, yanlış; bir harf hatası yanlış; boş yanlış', () => {
    expect(checkAnswer('çınar', W)).toEqual({ ok: false, part: 1, kind: 'one' })
    expect(checkAnswer('çınar vapır', W)).toEqual({ ok: false, part: 1, kind: 'near' })
    expect(checkAnswer('fener masa', W)).toEqual({ ok: false, part: 0, kind: 'none' })
    expect(checkAnswer('', W)).toEqual({ ok: false, part: 0, kind: 'empty' })
    expect(checkAnswer('çınar vapur kedi', W).ok).toBe(false)
  })
  it('"Sen" satırında yalnız yanlış harf işaretlenir', () => {
    const [[...a]] = markTyped('vapır', W)
    expect(a.map((x) => x.bad)).toEqual([false, false, false, true, false])
  })
})

describe('Yakala Yaz · eşik ve kayıt', () => {
  const trial = (step, ok, o = {}) => ({ w: ['çınar', 'vapur'], step, ms: [500, 450, 400, 350, 317, 283, 250, 217, 200, 183, 167, 150, 133, 117, 100, 83, 67, 50][step - 1], shownMs: 0, ok, ...o })
  it('eşik: son 10 geçerli denemenin ortancası', () => {
    const t = [...Array(10)].map(() => trial(3, true)).concat([8, 9, 10, 11, 12, 9, 10, 11, 12, 13].map((s) => trial(s, true)))
    expect(thresholdOf(t)).toEqual({ thresholdMs: 175, thresholdStep: 10 })
    expect(thresholdOf([...t, trial(1, false, { bad: true })]).thresholdMs).toBe(175)
  })
  it('10 denemeden az: kayıt yok; 10–19: partial; typed yalnız yanlışta', () => {
    expect(makeRecord({ trials: [...Array(9)].map(() => trial(3, true)) })).toBeNull()
    const r = makeRecord({ trials: [...Array(12)].map((_, i) => trial(3, i % 3 !== 0, { typed: 'x y' })), now: new Date('2026-10-02T10:00:00Z') })
    expect(r.partial).toBe(true)
    expect(r.trials.filter((t) => t.typed)).toHaveLength(4)
    expect(r.trials.every((t) => t.ok === false || t.typed === undefined)).toBe(true)
    expect(seriesOf([r])).toEqual([{ date: r.date, value: r.thresholdMs }])
  })
})

// Lojistik başarı eğrisiyle merdiven benzetimi (arastirma/merdiven-benzetim.mjs ile aynı model): doğru oranı %70–80
describe('Yakala Yaz · merdiven benzetimi', () => {
  it('20 denemelik turlarda doğru oranı %70–80; basamak 1–18 dışına çıkmaz', () => {
    let seed = 1
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const p = (d, T, s = 0.08) => 0.97 / (1 + Math.exp(-(Math.log10(d) - Math.log10(T)) / s))
    for (const T of [120, 200, 300]) {
      let ok = 0, n = 0
      for (let k = 0; k < 4000; k++) {
        let step = Math.max(1, MS.findIndex((x) => x <= T * 1.6) + 1)
        for (let t = 0; t < 20; t++) {
          const c = rnd() < p(msOf(step), T)
          ok += c; n++
          step = nextStep(step, c)
          expect(step >= 1 && step <= 18).toBe(true)
        }
      }
      expect(ok / n, `T=${T}`).toBeGreaterThanOrEqual(0.7)
      expect(ok / n, `T=${T}`).toBeLessThanOrEqual(0.8)
    }
  })
})

describe('tur uzunluğu (sahip 2026-10-03: ilk tur 10, sonra 20)', () => {
  it('hiç kayıt yoksa 10, Yakala Yaz kaydı varsa 20; başka modülün kaydı sayılmaz', () => {
    expect(roundTrialsOf([])).toBe(10)
    expect(roundTrialsOf([{ type: 'breath', seconds: 60 }])).toBe(10)
    expect(roundTrialsOf([{ type: 'yakala-yaz', thresholdStep: 5 }])).toBe(ROUND_TRIALS)
    expect(ROUND_TRIALS).toBe(20)
  })
  it('10 denemelik ilk tur yarım sayılmaz; 20 denemelik turda 10 deneme yarım', () => {
    const trials = Array.from({ length: 10 }, (_, i) => ({ w: ['a', 'b'], step: 3 + (i % 2), ms: 400, shownMs: 400, ok: i % 3 !== 0 }))
    expect(makeRecord({ trials, roundTrials: 10 }).partial).toBeUndefined()
    expect(makeRecord({ trials }).partial).toBe(true)
  })
})
