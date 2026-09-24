import { describe, it, expect } from 'vitest'
import { SENTENCES, pickSentences, wordsPerMinute, analyzeReading, fontSizeCssPx } from './reading.js'

describe('SENTENCES', () => {
  it('en az 40 cümle', () => {
    expect(SENTENCES.length).toBeGreaterThanOrEqual(40)
  })
  it('hepsi 55–65 karakter', () => {
    const bad = SENTENCES.filter((s) => s.length < 55 || s.length > 65)
    expect(bad, bad.map((s) => `${s.length}: ${s}`).join('\n')).toEqual([])
  })
  it('noktalama yok, tekrar yok', () => {
    expect(SENTENCES.every((s) => !/[.,;:!?]/.test(s))).toBe(true)
    expect(new Set(SENTENCES).size).toBe(SENTENCES.length)
  })
})

describe('pickSentences', () => {
  it('tekrarsız seçer ve son kullanılanları atlar', () => {
    const recent = SENTENCES.slice(0, 20)
    const picked = pickSentences(12, recent)
    expect(new Set(picked).size).toBe(12)
    expect(picked.some((s) => recent.includes(s))).toBe(false)
  })
})

describe('wordsPerMinute', () => {
  it('60 karakter 6 saniyede = 100 standart kelime/dk', () => {
    expect(wordsPerMinute('x'.repeat(60), 6)).toBeCloseTo(100, 6)
  })
  it('geçersiz süre null', () => {
    expect(wordsPerMinute('abc', 0)).toBeNull()
  })
})

describe('analyzeReading', () => {
  const s60 = 'x'.repeat(60)
  it('plato ve kritik boyutu bulur', () => {
    // 0.8–0.4 arası ~6 sn (100 wpm), 0.3'te yavaşlama, 0.2'de çok yavaş, 0.1 okunamadı
    const trials = [
      { logMAR: 0.8, seconds: 6, sentence: s60 },
      { logMAR: 0.7, seconds: 6.2, sentence: s60 },
      { logMAR: 0.6, seconds: 5.8, sentence: s60 },
      { logMAR: 0.5, seconds: 6.1, sentence: s60 },
      { logMAR: 0.4, seconds: 6.4, sentence: s60 },
      { logMAR: 0.3, seconds: 9, sentence: s60 },
      { logMAR: 0.2, seconds: 15, sentence: s60 },
      { logMAR: 0.1, seconds: null, sentence: s60 },
    ]
    const r = analyzeReading(trials)
    expect(r.criticalPrintSize).toBe(0.4)
    expect(r.readingAcuity).toBe(0.2)
    expect(r.maxReadingSpeed).toBeGreaterThan(95)
    expect(r.maxReadingSpeed).toBeLessThan(102)
  })
  it('hiç okunmadıysa boş sonuç', () => {
    expect(analyzeReading([{ logMAR: 0.5, seconds: null, sentence: s60 }]).maxReadingSpeed).toBeNull()
  })
})

describe('fontSizeCssPx', () => {
  it('x-yüksekliği oranı küçüldükçe font büyür', () => {
    expect(fontSizeCssPx(0.4, 400, 6.3, 0.45)).toBeGreaterThan(fontSizeCssPx(0.4, 400, 6.3, 0.55))
  })
  it('logMAR 0 @ 40 cm, oran 0.5 → x-yüksekliği 0.582 mm', () => {
    const px = fontSizeCssPx(0, 400, 10, 0.5)
    expect((px * 0.5) / 10).toBeCloseTo(0.5818, 3)
  })
})
