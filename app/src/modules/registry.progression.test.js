// Manifestin isteğe bağlı `progression` alanı (SONSUZ_YOL.PLAN.v1 §3.G.1): validateManifest bilinmeyen alanı reddetmez;
// tek yeni kural, `progression` varsa `match` işlev olmalıdır. Canlı modüllerin hepsi bu kuraldan geçer.
import { describe, it, expect } from 'vitest'
import { validateManifest, registry } from './registry.js'

const base = { id: 'deneme', title: 'Deneme', label: 'deneme', ring: 'life', kind: 'practice', progress: { domain: 'calm' } }

describe('validateManifest · progression', () => {
  it('progression yoksa ya da match işlevse geçerli; bilinmeyen alan reddedilmez', () => {
    expect(validateManifest(base)).toEqual([])
    expect(validateManifest({ ...base, progression: { match: () => true } })).toEqual([])
    expect(validateManifest({ ...base, progression: { match: () => true, ladder: { steps: [{ from: 0 }] }, unlock: { pathDay: 3 } }, bilinmeyen: 1 })).toEqual([])
  })
  it('progression var ama match işlev değil: hata', () => {
    expect(validateManifest({ ...base, progression: {} })).toEqual(['deneme: progression.match fonksiyon olmalı'])
    expect(validateManifest({ ...base, progression: { match: true } })).toEqual(['deneme: progression.match fonksiyon olmalı'])
    expect(validateManifest({ ...base, progression: 'x' })).toEqual(['deneme: progression.match fonksiyon olmalı'])
  })
  it('kayıt defterinde sorunlu modül yok; progression taşıyanların match\'i işlev', () => {
    expect(registry.problems).toEqual([])
    for (const m of registry.modules.filter((x) => x.progression != null)) expect(typeof m.progression.match, m.id).toBe('function')
  })
})
