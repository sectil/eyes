// Göz egzersizi kaydı ve çeşitleme yaması (SONSUZ_YOL.PLAN.v1 §3.A.6, §3.A.8-4): yol grubu basamağıyla gelirse kayda
// stage, stepIds (adım kimlikleri) ve variant yazılır, steps hareket sayısı olarak kalır (§3.A.10: yalnız yeni alanlar);
// yoksa kayıt bugünkü gibidir. Etkinlik geçmişi basamaklı grubu yoldaki adıyla yazar (2. gün "Sağ–sol").
import { describe, it, expect } from 'vitest'
import { routineRecord } from './Routine.jsx'
import { EXERCISES, SETS, PATH_GROUPS, exerciseSteps, setDurationSec, findRoutine } from '../lib/routines.js'
import { activitiesFrom } from '../lib/stats.js'

describe('routineRecord', () => {
  it('set ve basamaksız grup: bugünkü kayıt (steps = hareket sayısı)', () => {
    const normal = SETS.find((s) => s.id === 'normal')
    expect(routineRecord(normal, exerciseSteps(normal), 110)).toEqual({ type: 'routine', setId: 'normal', seconds: 110, steps: 9 })
    const g = PATH_GROUPS.find((x) => x.id === 'kirpma')
    expect(routineRecord(g, exerciseSteps(g), 30)).toEqual({ type: 'routine', setId: 'kirpma', seconds: 30, steps: 2 })
  })
  it('basamaklı yol grubu: stage, adım kimlikleri (stepIds) ve variant; steps yine hareket sayısı', () => {
    const set = { id: 'isinma', title: 'Sağ–sol', group: true, steps: ['lookRight', 'lookLeft', 'rest'], patch: null, stage: 'K2', variant: null }
    expect(routineRecord(set, exerciseSteps(set), 20)).toEqual({ type: 'routine', setId: 'isinma', seconds: 20, steps: 3, stage: 'K2', stepIds: ['lookRight', 'lookLeft', 'rest'], variant: null })
    // steps alanının türü hiçbir kayıtta değişmez: set, basamaksız ve basamaklı grup
    for (const rec of [routineRecord(SETS[0], exerciseSteps(SETS[0]), 60), routineRecord(set, exerciseSteps(set), 20)]) expect(Number.isInteger(rec.steps)).toBe(true)
  })
  it('etkinlik geçmişi: K2 kaydı "Sağ–sol", K3 kaydı ve stage\'siz kayıt "Isınma"', () => {
    const at = (h) => new Date(2026, 9, 2, h).toISOString()
    const recs = [
      { type: 'routine', setId: 'isinma', seconds: 20, steps: 3, stage: 'K2', stepIds: ['lookRight', 'lookLeft', 'rest'], date: at(9) },
      { type: 'routine', setId: 'isinma', seconds: 24, steps: 3, stage: 'K3', stepIds: ['blink', 'lookRight', 'lookLeft'], date: at(10) },
      { type: 'routine', setId: 'isinma', seconds: 24, steps: 3, date: at(11) },
    ]
    const acts = activitiesFrom([], recs)
    const detail = (h) => acts.find((a) => a.date === at(h)).detail
    expect(detail(9)).toMatch(/^Sağ–sol/)
    expect(detail(10)).toMatch(/^Isınma/)
    expect(detail(11)).toMatch(/^Isınma/)
  })
})

describe('exerciseSteps ve setDurationSec (çeşitleme yaması)', () => {
  it('yama EXERCISES\'in üstüne yazılır, EXERCISES değişmez', () => {
    const set = { id: 'kirpma', steps: ['blink', 'rest'], patch: { blink: { blinks: 15, seconds: 60 } } }
    const [blink, rest] = exerciseSteps(set)
    expect(blink).toMatchObject({ id: 'blink', title: 'Göz kırp', blinks: 15, seconds: 60, visual: 'blink', kind: 'evidence' })
    expect(rest).toMatchObject({ id: 'rest', seconds: 10 })
    expect(EXERCISES.blink.blinks).toBe(5)
    expect(EXERCISES.blink.seconds).toBe(20)
    expect(setDurationSec(set)).toBe(70)
  })
  it('yamasız setlerde süre bugünküyle aynı', () => {
    for (const s of [...SETS, ...PATH_GROUPS]) expect(setDurationSec(s)).toBe(s.steps.reduce((a, id) => a + EXERCISES[id].seconds, 0))
  })
  it('yeni grup Yukarı–aşağı kayıtta ve Gelişim\'de adıyla okunur', () => {
    expect(findRoutine('dikey')).toMatchObject({ id: 'dikey', title: 'Yukarı–aşağı', group: true })
  })
})
