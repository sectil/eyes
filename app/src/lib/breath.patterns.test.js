import { describe, it, expect } from 'vitest'
import { PATTERNS, PATTERN_ORDER, LEVELS, QUICK, makePlan, phaseAt, phaseText, normalizeOpts } from './breath.js'

describe('nefes kalıpları (8)', () => {
  it('her kalıbın başlığı, ritmi, nasıl yapılır adımları ve kanıt metni var; kanıt düzeyi bilinen bir düzey', () => {
    expect(PATTERN_ORDER).toEqual(['calm', 'equal', 'sigh', 'belly', 'nose', 'hum', 'box', 'custom'])
    for (const id of PATTERN_ORDER) {
      const p = PATTERNS[id]
      expect(p.title, id).toMatch(/\S/)
      expect(p.rhythm, id).toMatch(/\S/)
      expect(p.how.length, id).toBeGreaterThan(0)
      expect(p.evidence, id).toMatch(/\S/)
      if (p.level) expect(Object.keys(LEVELS), id).toContain(p.level)
    }
    expect(PATTERNS.custom.level).toBeNull()
  })
  it('kaynaklı kalıplarda kaynak yılı yazılı (PubMed)', () => {
    for (const id of ['calm', 'equal', 'sigh', 'belly', 'nose', 'hum', 'box']) expect(PATTERNS[id].evidence, id).toMatch(/20\d\d/)
  })
  it('eşit ritim ve sakin ritim dakikada 6 nefes', () => {
    expect(makePlan({ pattern: 'equal', priorSessions: 10 }).bpm).toBe(6)
    expect(makePlan({ pattern: 'calm', priorSessions: 10 }).bpm).toBe(6)
  })
  it('burun değiştir: bir tur iki nefes, taraflar soldan al → sağdan ver → sağdan al → soldan ver', () => {
    const plan = makePlan({ pattern: 'nose', durationSec: 300 })
    expect(plan.phases.map((p) => `${p.kind}:${p.side}`)).toEqual(['in:L', 'out:R', 'in:R', 'out:L'])
    expect(plan.cycleSec).toBe(20)
    expect(plan.bpm).toBe(6) // 2 nefes / 20 sn
    expect(phaseText(plan.phases[0])).toMatchObject({ label: 'Soldan al', sub: 'Sağ burun deliğin kapalı' })
    expect(phaseText(plan.phases[1]).label).toBe('Sağdan ver')
    expect(phaseAt(plan, 11).phase.side).toBe('R')
  })
  it('burun değiştirde kullanıcı tutma eklerse tutmalar tarafsız kalır', () => {
    const plan = makePlan({ pattern: 'nose', edits: { in: 4, in2: 0, hold: 2, out: 6, hold2: 0 } })
    expect(plan.phases.map((p) => p.kind)).toEqual(['in', 'hold', 'out', 'in', 'hold', 'out'])
    expect(plan.phases.filter((p) => p.kind === 'hold').every((p) => !p.side)).toBe(true)
  })
  it('vızıltı: veriş mırıldanarak, sesli komut "Mmm"', () => {
    const plan = makePlan({ pattern: 'hum' })
    const out = plan.phases.find((p) => p.kind === 'out')
    expect(out.hum).toBe(true)
    expect(phaseText(out)).toMatchObject({ label: 'Mırıldanarak ver', say: 'Mmm' })
    expect(phaseText(plan.phases[0]).label).toBe('Nefes al')
  })
  it('1 dakikalık kısayol uzun veriş, 60 sn; yeni kalıplar tercihlerde saklanır', () => {
    expect(QUICK).toEqual({ pattern: 'sigh', durationSec: 60 })
    expect(makePlan(QUICK).totalSec).toBeGreaterThanOrEqual(56)
    for (const id of ['equal', 'belly', 'nose', 'hum']) expect(normalizeOpts({ pattern: id }).pattern).toBe(id)
  })
})
