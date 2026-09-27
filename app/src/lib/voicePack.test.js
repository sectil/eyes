import { describe, it, expect } from 'vitest'
import { PHRASES, PHRASE_IDS, VOICES, VOICE_LABEL, phraseId, availableFrom, trimBounds, gainFor, TARGET_PEAK } from './voicePack.js'
import { makePlan, normalizeOpts } from './breath.js'
import { readFileSync, existsSync } from 'node:fs'

describe('seslendirme paketi', () => {
  it('her dilde her cümle ve iki ses adı var', () => {
    for (const lang of Object.keys(PHRASES)) {
      expect(Object.keys(PHRASES[lang]).sort()).toEqual([...PHRASE_IDS].sort())
      for (const v of VOICES) expect(VOICE_LABEL[lang][v]).toMatch(/\S/)
    }
  })
  it('nefes aşaması → cümle: taraf, mırıldanma, düz', () => {
    const nose = makePlan({ pattern: 'nose' }).phases.map(phraseId)
    expect(nose).toEqual(['inL', 'outR', 'inR', 'outL'])
    expect(makePlan({ pattern: 'hum' }).phases.map(phraseId)).toEqual(['in', 'hum'])
    expect(makePlan({ pattern: 'box' }).phases.map(phraseId)).toEqual(['in', 'hold', 'out', 'hold2'])
    expect(makePlan({ pattern: 'sigh' }).phases.map(phraseId)).toEqual(['in', 'in2', 'out'])
    for (const id of ['calm', 'equal', 'sigh', 'belly', 'nose', 'hum', 'box', 'custom']) {
      for (const p of makePlan({ pattern: id }).phases) expect(PHRASE_IDS, `${id}:${p.kind}`).toContain(phraseId(p))
    }
  })
  it('index.json: yalnız bilinen cümleler; eksik ses boş küme', () => {
    const a = availableFrom({ tr: { female: { phrases: ['in', 'out', 'bilinmeyen'] } } })
    expect([...a.female]).toEqual(['in', 'out'])
    expect(a.male.size).toBe(0)
    expect(availableFrom(null).female.size).toBe(0)
  })
  it('sessizlik kırpma ve seviye eşitleme', () => {
    const s = new Float32Array(10000)
    for (let i = 3000; i < 6000; i++) s[i] = Math.sin(i / 5) * 0.4
    const b = trimBounds(s, { padSamples: 100 })
    expect(b.start).toBeGreaterThan(2800)
    expect(b.start).toBeLessThan(3001)
    expect(b.end).toBeGreaterThan(5999)
    expect(b.end).toBeLessThan(6200)
    expect(gainFor(b.peak) * b.peak).toBeCloseTo(TARGET_PEAK, 2)
    expect(trimBounds(new Float32Array(10)).end).toBe(0)
  })
  it('nefes ayarı ses seçmez (ses Profilim tercihinden gelir)', () => {
    expect(normalizeOpts({ voiceId: 'male' })).not.toHaveProperty('voiceId')
  })
  it('paket: index.json her iki seste bütün cümleleri listeler ve her dosya diskte var', () => {
    const dir = new URL('../../public/voice/', import.meta.url)
    const index = JSON.parse(readFileSync(new URL('index.json', dir), 'utf8'))
    const avail = availableFrom(index)
    for (const v of VOICES) {
      expect([...avail[v]].sort()).toEqual([...PHRASE_IDS].sort())
      for (const id of PHRASE_IDS) expect(existsSync(new URL(`tr/${v}/${id}.mp3`, dir))).toBe(true)
    }
  })
})
