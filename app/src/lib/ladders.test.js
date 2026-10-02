// Merdivenlerin sınırları (SONSUZ_YOL.PLAN.v1 §3.A.3–A.6, §3.G.6): eşikler artan, nefes yolda en çok 3 dk, her adım
// EXERCISES'te var, her göz grubu her çeşitleme düzeyinde ≤ 75 sn, kırpma ≤ 15, daire ≤ 3 tur.
import { describe, it, expect } from 'vitest'
import { LADDERS, UNLOCK, VAR_LAG, SOFT_GAP, GROUP_CAP_SEC, LIMITS, mergePatches, groupSteps, groupSeconds } from './ladders.js'
import { EXERCISES, PATH_GROUPS } from './routines.js'

const increasing = (list) => list.every((x, i) => i === 0 || x.from > list[i - 1].from)

describe('ladders: biçim', () => {
  it('her merdivende basamak eşikleri 0\'dan başlar ve artar; çeşitleme eşikleri artar', () => {
    for (const [id, l] of Object.entries(LADDERS)) {
      expect(l.steps[0].from, id).toBe(0)
      expect(increasing(l.steps), id).toBe(true)
      expect(increasing(l.variants ?? []), id).toBe(true)
      expect(new Set(l.steps.map((s) => s.id)).size, id).toBe(l.steps.length)
    }
    expect(VAR_LAG).toBe(14)
    expect(SOFT_GAP).toBe(14)
  })
  it('açılma eşikleri planla aynı; Fark Ettin mi? ve Tek Bakışta göz merdiveninin yeni grup günlerine düşmez', () => {
    // Oku ve Anla 3. günden (pathDay ≥ 2): 1. ve 2. gün mola kuralı bozulmasın (sahip kararı 2026-10-02)
    expect(UNLOCK).toEqual({ snake: 1, notice: 1, 'okuma-anlama': 2, 'fark-ettin': 5, 'tek-bakis': 7 })
    const groupDays = LADDERS.routine.steps.map((s) => s.from)
    expect(groupDays).not.toContain(UNLOCK['fark-ettin'])
    expect(groupDays).not.toContain(UNLOCK['tek-bakis'])
  })
})

describe('ladders: nefes (§3.A.4)', () => {
  const b = LADDERS.breath
  it('1 → 2 → 3 dk; yolda en çok 3 dk (onaylı yoga kararı 5.1)', () => {
    expect(b.steps.map((s) => [s.from, s.minutes])).toEqual([[0, 1], [1, 2], [2, 3]])
    expect(b.pathCapMin).toBe(3)
    expect(LIMITS.breathPathMaxMin).toBe(3)
    for (const s of b.steps) expect(s.minutes).toBeLessThanOrEqual(b.pathCapMin)
  })
  it('kalıp katmanları Dvar ile: B 7, C 21, D 42 (yeni kullanıcıda 8., 22., 43. gün)', () => {
    expect(b.variants.map((v) => [v.from, v.tier])).toEqual([[7, 'B'], [21, 'C'], [42, 'D']])
  })
})

describe('ladders: göz egzersizleri (§3.A.6)', () => {
  const r = LADDERS.routine
  const keys = (s) => s.groups.map((g) => g.key)
  it('K1–K7: kırpma → sağ–sol → üçü birlikte → yukarı–aşağı → uzağa bakış → yakın–uzak → daire', () => {
    expect(r.steps.map((s) => [s.id, s.from, keys(s)])).toEqual([
      ['K1', 0, ['kirpma']],
      ['K2', 1, ['isinma', 'kirpma']],
      ['K3', 2, ['isinma', 'kirpma']],
      ['K4', 3, ['isinma', 'dikey', 'kirpma']],
      ['K5', 4, ['isinma', 'uzak', 'dikey', 'kirpma']],
      ['K6', 6, ['isinma', 'uzak', 'yakinuzak', 'dikey', 'kirpma']],
      ['K7', 8, ['isinma', 'uzak', 'yakinuzak', 'daire', 'dikey', 'kirpma']],
    ])
    expect(r.steps[1].groups[0]).toMatchObject({ key: 'isinma', title: 'Sağ–sol', steps: ['lookRight', 'lookLeft', 'rest'] })
    expect(r.steps[2].groups[0]).toMatchObject({ key: 'isinma', title: 'Isınma', steps: ['blink', 'lookRight', 'lookLeft'] })
    expect(r.steps[3].groups[1]).toMatchObject({ key: 'dikey', title: 'Yukarı–aşağı', steps: ['lookUp', 'lookDown', 'rest'] })
  })
  it('yalnız K7\'de Daire ile Yukarı–aşağı gün aşırı (rotate donus); öteki gruplar dönmez', () => {
    for (const s of r.steps) {
      for (const g of s.groups) {
        const rot = s.id === 'K7' && (g.key === 'daire' || g.key === 'dikey')
        expect(g.rotate ?? null, `${s.id} ${g.key}`).toBe(rot ? 'donus' : null)
      }
    }
  })
  it('K7 bugünkü beş grubun aynısıdır (adımlar ve başlıklar lib/routines.js PATH_GROUPS ile)', () => {
    const k7 = r.steps.at(-1).groups
    for (const pg of PATH_GROUPS) {
      const g = k7.find((x) => x.key === pg.id)
      expect(g, pg.id).toBeTruthy()
      expect(g.steps, pg.id).toEqual(pg.steps)
      expect(g.title, pg.id).toBe(pg.title)
      expect(g.glyph, pg.id).toBe(pg.glyph)
    }
  })
  it('her adım EXERCISES\'te var; çeşitleme yamaları var olan grup ve adımlara gider', () => {
    const k7 = r.steps.at(-1).groups
    for (const s of r.steps) for (const g of s.groups) for (const id of g.steps) expect(EXERCISES[id], `${s.id} ${g.key} ${id}`).toBeTruthy()
    for (const v of r.variants) {
      for (const [gk, steps] of Object.entries(v.patch ?? {})) {
        const g = k7.find((x) => x.key === gk)
        expect(g, `${v.id} ${gk}`).toBeTruthy()
        for (const id of Object.keys(steps)) {
          expect(g.steps, `${v.id} ${gk}`).toContain(id)
          for (const f of Object.keys(steps[id])) expect(EXERCISES[id], `${v.id} ${id}.${f}`).toHaveProperty(f)
        }
      }
    }
  })
  it('her grup her çeşitleme düzeyinde ≤ 75 sn; kırpma ≤ 15, daire ≤ 3 tur', () => {
    expect(GROUP_CAP_SEC).toBe(75)
    for (let vi = -1; vi < r.variants.length; vi++) {
      const patch = mergePatches(r.variants, vi)
      for (const s of r.steps) {
        for (const g of s.groups) {
          expect(groupSeconds(g, EXERCISES, patch), `${s.id} ${g.key} V${vi + 1}`).toBeLessThanOrEqual(GROUP_CAP_SEC)
          for (const st of groupSteps(g, EXERCISES, patch)) {
            if (st.blinks != null) expect(st.blinks).toBeLessThanOrEqual(LIMITS.blinksMax)
            if (st.laps != null) expect(st.laps).toBeLessThanOrEqual(LIMITS.lapsMax)
          }
        }
      }
    }
    // V3'te kırpma grubu 15 × 4 sn + 10 sn = 70 sn (§3.A.6)
    expect(groupSeconds(r.steps.at(-1).groups.at(-1), EXERCISES, mergePatches(r.variants, 2))).toBe(70)
  })
  it('çeşitlemeler birikir: V1 kırpma 10, V2 bakışlar 8 sn ve uzağa bakış 30 sn, V3 kırpma 15 · yakın–uzak 10 · daire 3 tur, V4 tam set günü', () => {
    expect(r.variants.map((v) => [v.id, v.from])).toEqual([['V1', 21], ['V2', 28], ['V3', 42], ['V4', 56]])
    const at = (i) => mergePatches(r.variants, i)
    expect(at(0).kirpma.blink).toEqual({ blinks: 10, seconds: 40 })
    expect(at(1)).toMatchObject({ kirpma: { blink: { blinks: 10 } }, isinma: { lookRight: { seconds: 8 } }, uzak: { farLook: { seconds: 30 } } })
    expect(at(2)).toMatchObject({ kirpma: { blink: { blinks: 15, seconds: 60 } }, yakinuzak: { nearFar: { switches: 10 }, farLook: { seconds: 30 } }, daire: { circleCw: { laps: 3 } } })
    expect(at(-1)).toEqual({})
    expect(r.variants.map((v) => v.weekly ?? null)).toEqual([null, 'mixDay', null, 'fullSetDay'])
    // tekrar sayısı ile süre aynı oranla büyür (TrueDepth yokken adım süreyle ilerler)
    const rate = (id, f) => EXERCISES[id].seconds / EXERCISES[id][f]
    for (const v of r.variants) {
      for (const steps of Object.values(v.patch ?? {})) {
        for (const [id, p] of Object.entries(steps)) {
          for (const f of ['blinks', 'switches', 'laps']) if (p[f] != null) expect(p.seconds, `${v.id} ${id}`).toBeCloseTo(p[f] * rate(id, f), 5)
        }
      }
    }
  })
})
