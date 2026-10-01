// Eşdeğerlik (SONSUZ_YOL.PLAN.v1 §3.G.6), nefes ve göz egzersizleri modülleri:
//  - ilerleme kapalı: today() çıktısı Y1 öncesi kodla (aşağıda birebir kopyası) rastgele bağlamlarda 0 farklı;
//  - ilerleme açık, eski kullanıcı (her modülde D ≥ 60, Dstage 0–60): fark yalnız izinli listede (nefesin yol payı
//    5 → 3 dk; Daire ile Yukarı–aşağı dönüşümü; çeşitleme yaması; tam set günü; durağın stage alanı).
import { describe, it, expect } from 'vitest'
import routine from './routine/manifest.js'
import breath from './breath/manifest.js'
import { PATH_GROUPS } from '../lib/routines.js'
import { isSameDay, buildPath } from '../lib/today.js'
import { PROGRAM_DAY_SEC, isBreath } from '../lib/breath.js'
import { dayKey } from '../lib/calendar.js'

// ---- Y1 öncesi today() (modules/routine/manifest.js ve modules/breath/manifest.js, 2026-09-30 sabahı), birebir
const OLD_PLACE = { isinma: { slot: 'warmup', order: 10 }, uzak: { slot: 'body', order: 30 }, yakinuzak: { slot: 'body', order: 50 }, daire: { slot: 'body', order: 70, dropRank: 3 }, kirpma: { slot: 'body', order: 90 } }
const OLD_GROUPS = [
  { id: 'isinma', title: 'Isınma', glyph: 'arrows' }, { id: 'uzak', title: 'Uzağa bakış', glyph: 'far' }, { id: 'yakinuzak', title: 'Yakın–uzak', glyph: 'nearfar' },
  { id: 'daire', title: 'Daire', glyph: 'circle' }, { id: 'kirpma', title: 'Göz kırpma', glyph: 'lid' },
]
function oldRoutineToday({ sessions, now }) {
  const doneIds = new Set(sessions.filter((s) => s.type === 'routine' && isSameDay(s, now)).map((s) => s.setId))
  return OLD_GROUPS.map((g) => ({ key: g.id, title: g.title, minutes: 1, glyph: g.glyph, route: `routine-${g.id}`, done: doneIds.has(g.id), ...OLD_PLACE[g.id] }))
}
function oldBreathToday({ sessions, now }) {
  const done = sessions.some((s) => isBreath(s) && s.seconds >= 60 && isSameDay(s, now))
  return { title: 'Nefes', sub: 'Gözlerin dinlenirken nefes al.', minutes: PROGRAM_DAY_SEC / 60, route: 'breath-rest', slot: 'rest', glyph: 'moon', done }
}

// ---- Rastgele bağlam (belirlenimci üreteç)
function rng(seed) {
  let x = seed >>> 0 || 1
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0
    return x / 4294967296
  }
}
const IDS = [...PATH_GROUPS.map((g) => g.id), 'lite', 'normal', 'full', 'deep', undefined]
function randomCtx(r) {
  const now = new Date(2026, 9, 1 + Math.floor(r() * 400), Math.floor(r() * 24), Math.floor(r() * 60))
  const sessions = []
  const n = Math.floor(r() * 40)
  for (let i = 0; i < n; i++) {
    const at = new Date(now.getTime() - Math.floor(r() * 20 * 86400000) + (r() < 0.3 ? 0 : -1)).toISOString()
    const k = r()
    if (k < 0.45) sessions.push({ type: 'routine', setId: IDS[Math.floor(r() * IDS.length)], seconds: Math.floor(r() * 200), date: at, ...(r() < 0.3 ? { stage: 'K7' } : {}) })
    else if (k < 0.8) sessions.push({ type: 'breath', seconds: r() < 0.1 ? undefined : Math.floor(r() * 400), strained: r() < 0.1, date: at })
    else sessions.push({ type: r() < 0.5 ? 'game' : 'dalga', seconds: 60, date: r() < 0.05 ? 'bozuk' : at })
  }
  return { tests: [], sessions, now }
}

describe('ilerleme kapalı: 0 fark (5.000 rastgele bağlam)', () => {
  it('göz egzersizleri ve nefes durakları Y1 öncesiyle birebir', () => {
    const r = rng(20260930)
    for (let i = 0; i < 5000; i++) {
      const c = randomCtx(r)
      expect(routine.today(c)).toEqual(oldRoutineToday(c))
      expect(breath.today(c)).toEqual(oldBreathToday(c))
      expect(routine.today({ ...c, progression: null })).toEqual(oldRoutineToday(c))
      expect(breath.today({ ...c, progression: null })).toEqual(oldBreathToday(c))
    }
  })
})

describe('ilerleme açık, eski kullanıcı: fark yalnız izinli listede', () => {
  it('duraklar, yerler, tamam işaretleri aynı; Daire yerine Yukarı–aşağı gelebilir; nefes 3 dk', () => {
    const r = rng(7)
    let full = 0
    let dikey = 0
    for (let i = 0; i < 3000; i++) {
      const c = randomCtx(r)
      const D = 60 + Math.floor(r() * 300)
      const Dstage = Math.floor(r() * 61)
      const progression = { pathDay: D, mod: { routine: { D, G: 1, Dstage }, breath: { D, G: 1, Dstage } }, later: [], seedDay: dayKey(c.now) }
      const ctx = { ...c, progression }
      const oldR = oldRoutineToday(c)
      const newR = routine.today(ctx)
      if (newR.some((s) => s.key === 'normal')) {
        full++
        // tam set günü: 1. bölüm aynı, 2. bölümün göz grupları yerine tek durak; yol payı aynı (5 dk)
        expect(newR.filter((s) => s.key !== 'normal').map(({ stage, rotate, weekDays, ...s }) => s)).toEqual(oldR.filter((s) => !['daire', 'kirpma'].includes(s.key)))
        expect(newR.reduce((a, s) => a + s.minutes, 0)).toBe(5)
      } else {
        // dönüşüm: yol bir günde Daire ya da Yukarı–aşağı'dan birini gösterir (lib/today.js rotate)
        const plan = buildPath([routine], ctx)
        const shown = plan.stops.map((s) => s.key.split(':')[1])
        if (shown.includes('dikey')) dikey++
        const asOld = shown.map((k) => (k === 'dikey' ? 'daire' : k))
        expect(asOld).toEqual(buildPath([{ ...routine, today: oldRoutineToday }], c).stops.map((s) => s.key.split(':')[1]))
        for (const s of newR.filter((x) => x.key !== 'dikey')) {
          const { stage, rotate, weekDays, ...rest } = s
          expect(rest).toEqual(oldR.find((o) => o.key === s.key))
        }
      }
      const b = breath.today(ctx)
      const { stage, ...bRest } = b
      expect(bRest).toEqual({ ...oldBreathToday(c), minutes: stage.minutes })
      expect([2, 3]).toContain(b.minutes) // dün "Zorlandım" ise 2
      if (b.minutes === 2) expect(stage.stepDown).toBe(true)
    }
    expect(full).toBeGreaterThan(0)
    expect(dikey).toBeGreaterThan(0)
  })
})
