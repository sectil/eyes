import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { GROUPS } from './yakalaYazList.js'
import { WORDS, groupOf, fold, pairKey, pairAllowed, pickPairs, historyOf, ROUND_TRIALS, MAX_SHARE, NO_REPEAT_DAYS } from './yakalaYazWords.js'
import { dayKey } from './calendar.js'

const LISTE = JSON.parse(readFileSync(new URL('../../../docs/yol-haritasi/tasarim/kelime-hafiza/kelimeler/liste.json', import.meta.url), 'utf8'))

describe('Yakala Yaz kelime listesi (KELIMELER.md, sahip onaylı)', () => {
  it('onaylı liste.json ile harfi harfine aynı: 384 kelime, 8 grup', () => {
    expect(JSON.parse(JSON.stringify(GROUPS))).toEqual(LISTE)
    expect(WORDS).toHaveLength(384)
    expect(Object.keys(GROUPS)).toHaveLength(8)
    expect(new Set(WORDS).size).toBe(384)
  })
  it('4–6 harf; Türkçe harf ve şapka atılınca çakışan iki kelime yok', () => {
    for (const w of WORDS) expect([...w].length, w).toBeGreaterThanOrEqual(4)
    for (const w of WORDS) expect([...w].length, w).toBeLessThanOrEqual(6)
    expect(new Set(WORDS.map(fold)).size).toBe(WORDS.length)
    expect(fold('Çınar')).toBe('cinar')
    expect(fold('rüzgâr')).toBe('ruzgar')
  })
  it('çift yasakları: aynı grup, iki hayvan, renk + hayvan, renk + renk yok', () => {
    expect(pairAllowed('kedi', 'zebra')).toBe(false)
    expect(pairAllowed('mavi', 'kedi')).toBe(false)
    expect(pairAllowed('mavi', 'pembe')).toBe(false)
    expect(pairAllowed('mavi', 'vapur')).toBe(true)
  })
})

// 90 günlük tohumlu benzetim: günde 1–3 tur, turda 20 deneme (+ gösterimi sapan birkaç deneme için yedek çift)
const DAY = 86400000
function simulate(seed, roundsOfDay) {
  const sessions = []
  const rounds = []
  for (let d = 0; d < 90; d++) {
    const n = roundsOfDay(d)
    for (let r = 0; r < n; r++) {
      const now = new Date(2026, 0, 1 + d, 9 + r * 4)
      const pairs = pickPairs({ seed, sessions, now })
      const extra = (d + r) % 4 // gösterimi sapan 0–3 deneme yedek çiftle tekrarlanır
      const used = pairs.slice(0, ROUND_TRIALS + extra)
      sessions.push({ type: 'yakala-yaz', date: now.toISOString(), trials: used.map((w, i) => ({ w, ...(i < extra ? { bad: true } : {}) })) })
      rounds.push({ now, used, pairs })
    }
  }
  return rounds
}

describe('Yakala Yaz kelime seçimi · 90 günlük benzetim (kurallar 1–7)', () => {
  const scenarios = { 'günde 1 tur': () => 1, 'günde 1–3 tur': (d) => 1 + ((d * 7) % 3), 'günde 3 tur': () => 3 }
  for (const [name, fn] of Object.entries(scenarios)) {
    it(name, { timeout: 60000 }, () => {
      const rounds = simulate(`tohum-${name}`, fn)
      const pairSeen = new Set()
      const lastSeen = new Map()
      for (const { now, used } of rounds) {
        expect(used.length).toBeGreaterThanOrEqual(ROUND_TRIALS)
        const today = dayKey(now)
        const words = used.flat()
        // 1: turda tekrar yok
        expect(new Set(words).size).toBe(words.length)
        // 5: grubun payı turun ilk 20 denemesinde ≤ %30
        const core = used.slice(0, ROUND_TRIALS).flat()
        const g = {}
        for (const w of core) g[groupOf(w)] = (g[groupOf(w)] ?? 0) + 1
        for (const c of Object.values(g)) expect(c / core.length).toBeLessThanOrEqual(MAX_SHARE)
        for (const [a, b] of used) {
          // 4 ve 7
          expect(pairAllowed(a, b), `${a}+${b}`).toBe(true)
          // 3: çift hiç tekrar etmez
          expect(pairSeen.has(pairKey(a, b)), `${a}+${b}`).toBe(false)
          pairSeen.add(pairKey(a, b))
        }
        for (const w of words) {
          const last = lastSeen.get(w)
          // 2: aynı gün tekrar yok
          expect(last, w).not.toBe(today)
          // günde 1 turda (40 + yedek kelime × 7 gün < 384) 7 gün içinde hiç tekrar yok
          if (name === 'günde 1 tur' && last) expect((new Date(`${today}T12:00`) - new Date(`${last}T12:00`)) / DAY).toBeGreaterThanOrEqual(NO_REPEAT_DAYS)
        }
        for (const w of words) lastSeen.set(w, today)
      }
    })
  }

  it('2: havuz yetmeyince 7 gün içinde gelen kelime en uzun süredir gelmeyenlerden seçilir', { timeout: 60000 }, () => {
    const rounds = simulate('lru', () => 3)
    const sessions = []
    for (const { now, used } of rounds.slice(0, 30)) {
      const { last } = historyOf(sessions)
      const today = dayKey(now)
      const recent = (w) => last.has(w) && (new Date(`${today}T12:00`) - new Date(`${last.get(w)}T12:00`)) / DAY < NO_REPEAT_DAYS
      const reused = used.flat().filter(recent)
      if (reused.length) {
        // tekrar eden her kelime, hiç seçilmeyen ve yakın zamanda gelmiş her kelimeden daha eski (ya da aynı gün)
        // grup payı ve çift yasakları bazı eski kelimeleri atlatabilir: tekrar edenlerin ortanca günü, seçilmeyen yakın
        // tarihli kelimelerin ortanca gününden yeni olmaz
        const notPicked = WORDS.filter((w) => recent(w) && !used.flat().includes(w) && last.get(w) !== today)
        const mid = (a) => a.sort()[a.length >> 1]
        if (notPicked.length) expect(mid(reused.map((w) => last.get(w))) <= mid(notPicked.map((w) => last.get(w)))).toBe(true)
      }
      sessions.push({ type: 'yakala-yaz', date: now.toISOString(), trials: used.map((w) => ({ w })) })
    }
  })

  it('6: tohumlu; aynı tohum ve geçmişle aynı çiftler', () => {
    const now = new Date(2026, 3, 1, 10)
    expect(pickPairs({ seed: 'a', now })).toEqual(pickPairs({ seed: 'a', now }))
    expect(pickPairs({ seed: 'a', now })).not.toEqual(pickPairs({ seed: 'b', now }))
  })
})
