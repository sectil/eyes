// Dik Dur çekirdeği: adım sırası, süreler, ilerleme ve bitiş satırları (lib/dikDur.js; metinler metin-D1-onay.md)
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { PHRASES } from './voicePack.js'
import { MOVES, MODES, stepsOf, totalSeconds, progressText, distributive, summaryText, weekCount, weekText, weekStart, makeRecord, HOLD_S, GAP_S, REST_S } from './dikDur.js'

const DOC = readFileSync(new URL('../../../docs/yol-haritasi/tasarim/dik-dur/metin-D1-onay.md', import.meta.url), 'utf8')

describe('dik dur · onaylı metinler', () => {
  it('hareket adları, yönergeler ve düzeltmeler onay dosyasında harfi harfine', () => {
    for (const m of Object.values(MOVES)) {
      expect(DOC).toContain(`| ${m.name} | ${m.cue} | ${m.fix ?? '—'} |`)
    }
  })
  it('ilerleme ve bitiş satırları onay dosyasındaki örneklerle aynı', () => {
    expect(DOC).toContain(progressText('kisa', { kind: 'hold', rep: 2, set: 1 }))
    expect(DOC).toContain(progressText('tam', { kind: 'hold', rep: 4, set: 1 }))
    expect(DOC).toContain(summaryText('kisa'))
    expect(DOC).toContain(weekText(6))
  })
})

describe('dik dur · adım sırası ve süre', () => {
  it('kısa tur: üç hareket × 3 tekrar, tekrar içinde sırayla; tutmalar arası 3 sn; yaklaşık 2 dakika', () => {
    const s = stepsOf('kisa')
    const holds = s.filter((x) => x.kind === 'hold')
    expect(holds).toHaveLength(9)
    expect(holds.slice(0, 3).map((h) => h.move)).toEqual(['uzat', 'cene', 'omuz'])
    expect(holds.map((h) => h.rep)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3])
    expect(s.filter((x) => x.kind === 'gap')).toHaveLength(8)
    expect(s[0].kind).toBe('hold')
    expect(totalSeconds('kisa')).toBe(9 * HOLD_S + 8 * GAP_S)
    expect(Math.round(totalSeconds('kisa') / 60)).toBe(2)
  })
  it('tam tur: çene ve omuz, 3 bölüm × 10 tekrar; bölümler arası 1 dk; yaklaşık 15 dakika', () => {
    const s = stepsOf('tam')
    const holds = s.filter((x) => x.kind === 'hold')
    expect(holds).toHaveLength(60)
    expect(holds.slice(0, 10).every((h) => h.move === 'cene' && h.set === 1)).toBe(true)
    expect(holds.slice(10, 20).every((h) => h.move === 'omuz' && h.set === 1)).toBe(true)
    expect(s.filter((x) => x.kind === 'rest').map((r) => [r.set, r.s])).toEqual([[2, REST_S], [3, REST_S]])
    expect(s.some((x, i) => x.kind === 'rest' && s[i - 1]?.kind === 'gap')).toBe(false) // bölüm arasından önce ara yok
    expect(Math.round(totalSeconds('tam') / 60)).toBe(15)
  })
  it('bilinmeyen kip boş', () => {
    expect(stepsOf('x')).toEqual([])
    expect(progressText('x', { kind: 'hold', rep: 1, set: 1 })).toBe('')
  })
  it('omuz adımı kamerayla doğrulanmaz (önden görünmez)', () => {
    expect(MOVES.omuz.camera).toBe(false)
    expect(MOVES.uzat.camera && MOVES.cene.camera).toBe(true)
    expect(MODES.kisa.moves).toEqual(['uzat', 'cene', 'omuz'])
  })
})

describe('dik dur · satırlar', () => {
  it('üleştirme eki', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(distributive)).toEqual([
      "1'er", "2'şer", "3'er", "4'er", "5'er", "6'şar", "7'şer", "8'er", "9'ar", "10'ar", "20'şer", "30'ar", "40'ar", "50'şer", "60'ar", "70'er", "80'er", "90'ar", "100'er",
    ])
  })
  it('bitiş satırları', () => {
    expect(summaryText('kisa')).toBe("3 hareket, 3'er tekrar · 2 dakika")
    expect(summaryText('tam')).toBe("2 hareket, 30'ar tekrar · 15 dakika")
  })
  it('haftalık sayı pazartesiden', () => {
    const now = new Date(2026, 9, 3, 12) // cumartesi
    expect(weekStart(now)).toEqual(new Date(2026, 8, 28))
    const at = (d, h = 10) => new Date(2026, 8, d, h).toISOString()
    const sessions = [{ type: 'dik-dur', date: at(27) }, { type: 'dik-dur', date: at(28) }, { type: 'dik-dur', date: at(30) }, { type: 'blink', date: at(30) }]
    expect(weekCount(sessions, now)).toBe(2)
  })
  it('kayıt', () => {
    expect(makeRecord({ mode: 'kisa', holds: 9, seconds: 114.4 })).toEqual({ type: 'dik-dur', mode: 'kisa', reps: 9, seconds: 114, cameraUsed: false })
    expect(makeRecord({ mode: 'kisa', holds: 9, seconds: 114, cameraUsed: true, inPose: 1.2 }).inPose).toBe(1)
  })
})

describe('dik dur · seslendirme', () => {
  it('ses dosyası cümleleri ekrandaki onaylı metinle aynı', () => {
    for (const m of Object.values(MOVES)) {
      expect(PHRASES.tr[m.voice], m.id).toBe(m.cue)
      if (m.fix) expect(PHRASES.tr[m.fixVoice], m.id).toBe(m.fix)
    }
  })
})
