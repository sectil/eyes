import { describe, it, expect } from 'vitest'
import {
  partOfDay, promptsFor, promptIndex, makeRecord, history, factFor, FACTS, ANSWER_TEXT, SOURCE_IDS, SKY, DURATION_SEC, STEP_SEC,
  ENVS, ENV_LABEL, AMBIENCE_LABEL, normalizeOpts, loadOpts, saveOpts, GOKYUZU_OPTS_KEY, isGokyuzu,
} from './gokyuzu.js'
import { SOURCES } from './sources.js'

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) } }

describe('Gökyüzü molası', () => {
  it('günün bölümü ve renkleri', () => {
    expect([5, 7, 8, 16, 17, 19, 20, 23, 0, 4].map(partOfDay)).toEqual(['dawn', 'dawn', 'day', 'day', 'dusk', 'dusk', 'night', 'night', 'night', 'night'])
    for (const k of ['dawn', 'day', 'dusk', 'night']) expect(SKY[k].label).toBeTruthy()
  })
  it('her manzarada 6 soru × 20 sn; ilk soru ufuk vurgusu; soyut "ufuk çizgisi" yok; güneşe bakma önerisi yok', () => {
    expect(STEP_SEC * 6).toBe(DURATION_SEC)
    for (const env of ENVS) {
      expect(ENV_LABEL[env]).toBeTruthy()
      expect(AMBIENCE_LABEL[env]).toBeTruthy()
      for (const part of ['dawn', 'day', 'dusk', 'night']) {
        const ps = promptsFor(env, part)
        expect(ps).toHaveLength(6)
        expect(ps[0].hl).toBe('line')
        for (const p of ps) {
          expect(p.text).not.toMatch(/ufuk çizgisi/i)
          expect(p.text).not.toMatch(/güneş/i)
          expect([null, 'line', 'far', 'cloud']).toContain(p.hl)
        }
      }
    }
    expect(promptsFor('sea', 'day')[0].text).toMatch(/Denizle gökyüzünün birleştiği çizgi/)
    expect(promptsFor('city', 'day')[0].text).toMatch(/Çatıların gökyüzüne değdiği kenar/)
    expect(promptsFor('sea', 'night')).not.toEqual(promptsFor('sea', 'day'))
    expect([0, 19.9, 20, 60, 119, 200].map((e) => promptIndex(e, DURATION_SEC, 6))).toEqual([0, 0, 1, 3, 5, 5])
  })
  it('tercihler: varsayılan deniz, arka plan sesi açık, sesli okuma kapalı', () => {
    expect(normalizeOpts()).toEqual({ env: 'sea', sound: true, voice: false })
    expect(normalizeOpts({ env: 'x', sound: false, voice: 'yes' })).toEqual({ env: 'sea', sound: false, voice: false })
    const s = mem()
    saveOpts({ env: 'hills', sound: false, voice: true }, s)
    expect(JSON.parse(s.getItem(GOKYUZU_OPTS_KEY)).env).toBe('hills')
    expect(loadOpts(s)).toEqual({ env: 'hills', sound: false, voice: true })
    expect(loadOpts({ getItem: () => '{bozuk' })).toEqual(normalizeOpts())
  })
  it('kayıt ve kendi verin (en az 3 puanlı mola)', () => {
    const r = makeRecord({ before: 4, after: 7, seconds: 120.4, part: 'day', env: 'sea' }, new Date('2026-09-26T08:00:00Z'))
    expect(r).toEqual({ type: 'gokyuzu', date: '2026-09-26T08:00:00.000Z', before: 4, after: 7, delta: 3, seconds: 120, part: 'day', env: 'sea' })
    expect(isGokyuzu(r)).toBe(true)
    expect(history([r, r]).mean).toBeNull()
    expect(history([r, r, { ...r, delta: 0 }]).mean).toBeCloseTo(2)
  })
  it('kartlar: kaynağı olanların kaynağı kayıtlı; kaynaksız kart yalnız "araştırılmamış"', () => {
    for (const f of FACTS) {
      expect(ANSWER_TEXT[f.answer]).toBeTruthy()
      if (f.source) expect(SOURCES[f.source]).toBeTruthy()
      else expect(f.answer).toBe('unstudied')
    }
    expect(SOURCE_IDS).toContain('buxton2021')
    expect(SOURCE_IDS.length).toBe(FACTS.filter((f) => f.source).length)
    expect(factFor([]).id).toBe(FACTS[0].id)
  })
})
