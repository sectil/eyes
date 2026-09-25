import { describe, it, expect } from 'vitest'
import { registry } from './registry.js'
import { moduleSignals, buildSignals } from '../lib/coach.js'
import { sanitizeModules, sanitizeSignals } from '../lib/coachCore.js'

const NOW = new Date('2026-09-25T10:00:00')
const ago = (d) => new Date(NOW.getTime() - d * 86400000).toISOString()
const sessions = [
  { type: 'game', game: 'track', score: 40, best: 54, followPct: 80, control: 'eyes', seconds: 40, date: ago(1) },
  { type: 'game', game: 'track', score: 54, best: 54, followPct: 90, control: 'eyes', seconds: 40, date: ago(2) },
  { type: 'game', game: 'snake', score: 12, best: 31, control: 'eyes', seconds: 90, date: ago(1) },
  { type: 'breath', pattern: 'calm', cycles: 20, calmBefore: 2, calmAfter: 4, seconds: 300, date: ago(1) },
  { type: 'breath-count', accuracy: 70, sets: 3, seconds: 200, date: ago(3) },
  { type: 'breath-count', accuracy: 90, sets: 3, seconds: 200, date: ago(1) },
  { type: 'breath-count', accuracy: 50, sets: 3, seconds: 200, date: ago(20) }, // 7 gün dışı
]

describe('modül coach() / stats() sözleşmesi', () => {
  it('her coach modülü yalnızca sayı/dize döndürür ve süzgeçten geçer', () => {
    const sig = moduleSignals(sessions, NOW)
    expect(Object.keys(sig).sort()).toEqual(['breath', 'breath-count', 'snake', 'track']) // quick-look: oturum yok → sinyal yok
    expect(sig.track).toEqual({ best: 54, sessions7: 2, follow7: 85 })
    expect(sig.snake).toEqual({ best: 12, sessions7: 1, eyes7: 1 }) // bestFromSessions yalnızca score alanına bakar
    expect(sig.breath).toEqual({ sessions7: 1, minutes7: 5, calmDelta7: 2 })
    expect(sig['breath-count']).toEqual({ sessions7: 2, accuracy7: 80, best: 90 })
    expect(sanitizeModules(sig)).toEqual(sig)
    expect(buildSignals([], sessions, NOW).modules.track.best).toBe(54)
    const withQl = moduleSignals([...sessions, { type: 'quick-look', threshold: 180, accuracy: 70, seconds: 300, date: ago(1) }], NOW)
    expect(withQl['quick-look']).toEqual({ first: 180, last: 180, sessions7: 1, hours: 0.1 })
  })
  it('sanitizeModules: bozuk anahtar/değerler düşer, boşsa null', () => {
    expect(sanitizeModules({ 'Bad Key': { a: 1 }, track: { best: 'x'.repeat(30), n: 2, deep: { a: 1 }, huge: 1e9 } })).toEqual({ track: { n: 2 } })
    expect(sanitizeModules({ track: {} })).toBeNull()
    expect(sanitizeModules('x')).toBeNull()
    expect(sanitizeSignals({ modules: { track: { best: 3.14159 } }, hourNow: 9 })).toMatchObject({ modules: { track: { best: 3.142 } }, hourNow: 9 })
  })
  it('stats(): satırlar en çok 3, boş kayıtta boş dizi', () => {
    for (const m of registry.modules) {
      if (typeof m.stats !== 'function') continue
      expect(m.stats([], NOW)).toEqual([])
      const rows = m.stats(sessions, NOW)
      expect(rows.length).toBeLessThanOrEqual(3)
      for (const r of rows) {
        expect(typeof r.label).toBe('string')
        expect(typeof r.value).toBe('string')
      }
    }
    expect(registry.get('track').stats(sessions, NOW)[0]).toEqual({ label: 'Rekor', value: '54 puan' })
    expect(registry.get('breath-count').stats(sessions, NOW)[0].value).toBe('%70')
  })
  it('kayıt defteri: coach/stats fonksiyon olmalı', async () => {
    const { validateManifest } = await import('./registry.js')
    expect(validateManifest({ id: 'x', title: 'X', label: 'x', ring: 'eye', kind: 'practice', coach: 1 })).toContain('x: coach fonksiyon olmalı')
  })
})
