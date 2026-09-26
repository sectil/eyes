import { describe, it, expect } from 'vitest'
import { shouldPlayIntro, captionAt, INTRO_SCRIPT, INTRO_MS, INTRO_END_MS } from './intro.js'
import { NOTICE, FILM_SEC } from './introScene.js'

describe('giriş filmi', () => {
  it('ilk açılışta oynar, izlendiyse veya hareket azaltma açıksa oynamaz', () => {
    expect(shouldPlayIntro({})).toBe(true)
    expect(shouldPlayIntro({ intro: { seen: true, version: 2 } })).toBe(false)
    // eski sürümün filmini izleyen (version yok) yeni filmi bir kez görür (Bug 11)
    expect(shouldPlayIntro({ intro: { seen: true } })).toBe(true)
    expect(shouldPlayIntro({ intro: { seen: true } }, true)).toBe(false)
    expect(shouldPlayIntro({}, true)).toBe(false)
  })
  it('yazılar sırayla, sonuncusu boş; film süresi içinde', () => {
    expect(captionAt(0)).toBe('')
    expect(captionAt(500)).toBe('Bak.')
    expect(captionAt(5000)).toBe('Fark et.')
    expect(captionAt(14700)).toBe('')
    const ats = INTRO_SCRIPT.map((s) => s[0])
    expect([...ats].sort((a, b) => a - b)).toEqual(ats)
    expect(ats.at(-1)).toBeLessThan(INTRO_END_MS)
    expect(INTRO_END_MS).toBeLessThanOrEqual(INTRO_MS)
  })
  it('fark etme anları kendi yazısının içinde (kedi "Fark et.", lastik "Yine.", çiçek "Bir daha.")', () => {
    expect(captionAt(NOTICE.cat * 1000)).toBe('Fark et.')
    expect(captionAt(NOTICE.tire * 1000)).toBe('Yine.')
    expect(captionAt(NOTICE.flower * 1000)).toBe('Bir daha.')
    expect(FILM_SEC * 1000).toBe(INTRO_MS)
  })
})
