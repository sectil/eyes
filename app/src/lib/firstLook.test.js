import { describe, it, expect } from 'vitest'
import { tokenize, isPause, msPerWord, wordAt, wordsRead, longestGap, gapQuote, pauseShare } from './firstLook.js'

const TEXT = "Bir iki üç. Dört beş, altı yedi sekiz. Oslo'da dokuz on."

describe('tokenize', () => {
  it('kelime + ardındaki noktalama/boşluk; kesme işaretli kelime tek', () => {
    const t = tokenize(TEXT, 'tr')
    expect(t.map((x) => x.word)).toEqual(['Bir', 'iki', 'üç', 'Dört', 'beş', 'altı', 'yedi', 'sekiz', "Oslo'da", 'dokuz', 'on'])
    expect(t[2].tail).toBe('. ')
    expect(isPause(t[2])).toBe(true)
    expect(isPause(t[0])).toBe(false)
    expect(t.map((x) => x.word + x.tail).join('')).toBe(TEXT)
  })

  it('Intl.Segmenter yoksa boşluktan böler, sonuç aynı', () => {
    const S = Intl.Segmenter
    const withSeg = tokenize(TEXT, 'tr')
    try {
      Intl.Segmenter = undefined
      const t = tokenize(TEXT, 'tr')
      expect(t).toEqual(withSeg)
      expect(t[4]).toEqual({ word: 'beş', tail: ', ' })
      expect(t.map((x) => x.word + x.tail).join('')).toBe(TEXT)
    } finally {
      Intl.Segmenter = S
    }
  })

  it('boşluksuz yazılan dil de kelimelere ayrılır (Segmenter varken)', () => {
    const t = tokenize('今日は晴れです。', 'ja')
    expect(t.length).toBeGreaterThan(1)
    expect(t.map((x) => x.word + x.tail).join('')).toBe('今日は晴れです。')
  })
})

describe('zamanlama', () => {
  const ms = msPerWord(200) // 300 ms
  it('sarı kelime ve okunan kelime sayısı', () => {
    expect(ms).toBe(300)
    expect(wordAt(0, ms, 80)).toBe(0)
    expect(wordAt(299, ms, 80)).toBe(0)
    expect(wordAt(300, ms, 80)).toBe(1)
    expect(wordAt(99999, ms, 80)).toBe(79)
    expect(wordsRead(20000, ms, 80)).toBe(67)
    expect(wordsRead(20000, ms, 40)).toBe(40)
  })
})

describe('longestGap', () => {
  it('kırpmalar arası en uzun ara', () => {
    expect(longestGap([1800, 4900, 6100, 13500, 16200, 18900], 20000)).toEqual([6100, 13500])
  })
  it('başlangıç ve bitiş de sınır; hiç kırpma yoksa tüm süre', () => {
    expect(longestGap([], 20000)).toEqual([0, 20000])
    expect(longestGap([15000], 20000)).toEqual([0, 15000])
    expect(longestGap([2000], 20000)).toEqual([2000, 20000])
  })
})

describe('gapQuote', () => {
  const toks = tokenize(Array.from({ length: 80 }, (_, i) => `k${i}`).join(' '), 'tr')
  const ms = 300
  it('iki kırpma arasında okunan kelimeler (kırpma kelimeleri hariç)', () => {
    const q = gapQuote(toks, [6100, 13500], ms, { readMs: 20000 })
    expect(q.from).toBe(21) // 6100 ms → k20, sonrası
    expect(q.to).toBe(44) // 13500 ms → k45, öncesi
    expect(q.text.startsWith('k21 ')).toBe(true)
    expect(q.text.endsWith('k44')).toBe(true)
    expect(q.cutStart && q.cutEnd).toBe(true)
  })
  it('bitişe kadar süren ara son okunan kelimede biter; en çok 28 kelime', () => {
    const q = gapQuote(toks, [15000, 20000], ms, { readMs: 20000 })
    expect(q.to).toBe(66)
    const long = gapQuote(toks, [0, 20000], ms, { readMs: 20000 })
    expect(long.from).toBe(0)
    expect(long.words).toBe(28)
    expect(long.cutStart).toBe(false)
  })
  it('çok kısa arada alıntı yok', () => {
    expect(gapQuote(toks, [3000, 3100], ms, { readMs: 20000 })).toBe(null)
  })
})

describe('pauseShare', () => {
  // her 5. kelime noktayla biter
  const text = Array.from({ length: 80 }, (_, i) => `k${i}${i % 5 === 4 ? '.' : ''}`).join(' ')
  const toks = tokenize(text, 'tr')
  const ms = 300
  const at = (i) => i * ms + 100
  it('noktalama yanındaki kırpmalar şans payını geçince söylenir', () => {
    const r = pauseShare([at(4), at(10), at(15), at(22)], toks, ms, 20000)
    expect(r.near).toBe(3) // k4 (nokta), k10 (k9 noktadan sonra), k15 (k14 sonrası)
    expect(r.chance).toBeCloseTo(0.4, 1)
    expect(r.notable).toBe(true)
  })
  it('şans düzeyindeyse ya da tek kırpmaysa söylenmez', () => {
    expect(pauseShare([at(4)], toks, ms, 20000).notable).toBe(false)
    expect(pauseShare([at(4), at(6), at(7), at(8), at(12)], toks, ms, 20000).notable).toBe(false)
  })
})
