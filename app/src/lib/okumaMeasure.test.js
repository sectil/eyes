import { describe, it, expect } from 'vitest'
import { judge, wpmOf, makeRecord, speedSeries, comprehensionSeries, LIMITS } from './okumaMeasure.js'
import { TEXTS, wordCount } from './okumaBank.js'

const msFor = (words, wpm) => (words / wpm) * 60000

describe('okumaMeasure: geçerlilik (PLAN §3.2)', () => {
  it('hız kelime / dakika, yuvarlanır', () => {
    expect(wpmOf(100, 30000)).toBe(200)
    expect(wpmOf(107, 30300)).toBe(212)
  })

  it('eşik sınırları: 3 doğru ve 60–600 dahil', () => {
    expect(judge({ words: 100, ms: msFor(100, 250), correct: 3 })).toEqual({ wpm: 250, valid: true, reason: null })
    expect(judge({ words: 100, ms: msFor(100, 250), correct: 2 }).reason).toBe('dusuk-anlama')
    expect(judge({ words: 600, ms: 60000, correct: 4 }).valid).toBe(true)
    expect(judge({ words: 601, ms: 60000, correct: 4 }).reason).toBe('cok-hizli')
    expect(judge({ words: 60, ms: 60000, correct: 4 }).valid).toBe(true)
    expect(judge({ words: 59, ms: 60000, correct: 4 }).reason).toBe('cok-yavas')
    expect(LIMITS).toEqual({ minCorrect: 3, minWpm: 60, maxWpm: 600 })
  })

  it('ara: okurken arka plana geçildiyse hız ve anlama sayılmaz, soru kaydı yok', () => {
    expect(judge({ words: 100, ms: 30000, correct: 4, hidden: true }).reason).toBe('ara')
    const r = makeRecord({ text: TEXTS[0], cycle: 0, ms: 30000, correct: null, qIds: [], hidden: true, now: new Date('2026-10-02T10:00:00Z') })
    expect(r).toMatchObject({ type: 'okuma-anlama', textId: 'oa001', correct: null, valid: false, reason: 'ara', qIds: [] })
    expect(comprehensionSeries([r])).toEqual([])
  })

  it('kayıt biçimi PLAN §3.4', () => {
    const t = TEXTS[0]
    const r = makeRecord({ text: t, cycle: 0, ms: 30000, correct: 4, qIds: ['oa001-q0'], fontScale: 1, now: new Date('2026-10-02T10:00:00Z') })
    expect(Object.keys(r).sort()).toEqual(['chars', 'correct', 'cycle', 'date', 'fontScale', 'ms', 'qIds', 'reason', 'seconds', 'textId', 'total', 'type', 'valid', 'words', 'wpm'].sort())
    expect(r.words).toBe(wordCount(t.metin))
    expect(r.total).toBe(4)
  })

  it('hız serisi yalnız geçerli okumalar ve son yazı boyu; anlama serisi bitirilen her okuma', () => {
    const s = (date, o) => ({ type: 'okuma-anlama', date, ...o })
    const list = [
      s('2026-10-01', { wpm: 200, valid: true, correct: 4, fontScale: 1 }),
      s('2026-10-02', { wpm: 700, valid: false, correct: 4, fontScale: 1.2, reason: 'cok-hizli' }),
      s('2026-10-03', { wpm: 230, valid: true, correct: 3, fontScale: 1.2 }),
      s('2026-10-04', { wpm: 260, valid: false, correct: 2, fontScale: 1.2, reason: 'dusuk-anlama' }),
    ]
    expect(speedSeries(list)).toEqual([{ date: '2026-10-03', value: 230 }])
    expect(comprehensionSeries(list).map((x) => x.value)).toEqual([100, 100, 75, 50])
  })
})
