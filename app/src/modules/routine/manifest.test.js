// Göz egzersizleri merdiveni (SONSUZ_YOL.PLAN.v1 §3.A.6, §3.A.8, §3.A.10): ilerleme yokken bugünkü beş grup aynen;
// ilerleme varken basamak, dönüşüm, çeşitleme yaması, karışık gün ve tam set günü.
import { describe, it, expect } from 'vitest'
import routine, { stagedGroups, stagedSet, mixedOrder, rotationRanks } from './manifest.js'
import { buildPath } from '../../lib/today.js'
import { weeklyPick } from '../../lib/progression.js'
import { LADDERS, GROUP_CAP_SEC } from '../../lib/ladders.js'
import { EXERCISES, setDurationSec, PATH_GROUPS } from '../../lib/routines.js'
import { dayKey } from '../../lib/calendar.js'

const NOW = new Date('2026-10-05T10:00:00')
const TODAY = NOW.toISOString()
const daysAgo = (n, h = 10) => new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - n, h).toISOString()
// ctx.progression'ı elle kur (lib/progression.js progressionCtx biçimi)
const prog = ({ D = 0, G = D > 0 ? 1 : null, Dstage = D, pathDay = D, seedDay = dayKey(NOW) } = {}) => ({ pathDay, mod: { routine: { D, G, Dstage } }, later: [], seedDay })
const ctxAt = (o = {}, sessions = [], now = NOW) => ({ tests: [], sessions, now, progression: prog({ seedDay: dayKey(now), ...o }) })
const keysOf = (list) => [].concat(list).map((s) => s.key)
// Hafta içinde tohumla seçilen günü bul (lib/progression.js weeklyPick)
function findDay(salt, avoid = null, from = NOW) {
  for (let i = 0; i < 28; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 10)
    if (weeklyPick(dayKey(d), salt, avoid)) return d
  }
  throw new Error('gün bulunamadı')
}

describe('ilerleme yokken bugünkü beş grup (mevcut sistem bozulmaz)', () => {
  const DAILY = [
    { key: 'isinma', title: 'Isınma', minutes: 1, glyph: 'arrows', route: 'routine-isinma', done: false, slot: 'warmup', order: 10 },
    { key: 'uzak', title: 'Uzağa bakış', minutes: 1, glyph: 'far', route: 'routine-uzak', done: false, slot: 'body', order: 30 },
    { key: 'yakinuzak', title: 'Yakın–uzak', minutes: 1, glyph: 'nearfar', route: 'routine-yakinuzak', done: false, slot: 'body', order: 50 },
    { key: 'daire', title: 'Daire', minutes: 1, glyph: 'circle', route: 'routine-daire', done: false, slot: 'body', order: 70, dropRank: 3 },
    { key: 'kirpma', title: 'Göz kırpma', minutes: 1, glyph: 'lid', route: 'routine-kirpma', done: false, slot: 'body', order: 90 },
  ]
  it('ctx.progression yok: çıktı birebir bugünkü (dikey yok, stage yok, dönüşüm yok)', () => {
    expect(routine.today({ sessions: [], now: NOW })).toEqual(DAILY)
    expect(routine.today({ sessions: [], now: NOW, progression: null })).toEqual(DAILY)
  })
  it('bugünkü kayıt durağı tamamlar; set kaydı yol grubunu tamamlamaz', () => {
    const s = [{ type: 'routine', setId: 'uzak', seconds: 40, date: TODAY }, { type: 'routine', setId: 'full', seconds: 176, date: TODAY }, { type: 'routine', setId: 'kirpma', date: daysAgo(1) }]
    expect(routine.today({ sessions: s, now: NOW }).filter((x) => x.done).map((x) => x.key)).toEqual(['uzak'])
  })
  it('yeni grup dikey kayıt defterinde ve rotada var, yalnız merdivenle yola girer', () => {
    expect(PATH_GROUPS.find((g) => g.id === 'dikey')).toMatchObject({ title: 'Yukarı–aşağı', steps: ['lookUp', 'lookDown', 'rest'], ladderOnly: true, group: true })
    expect(routine.routes).toContain('routine-dikey')
    expect(routine.label('routine-dikey')).toBe('yukarı–aşağı egzersizi')
    expect(routine.progression.match({ type: 'routine', setId: 'lite' })).toBe(true)
    expect(routine.progression.match({ type: 'breath' })).toBe(false)
  })
})

describe('basamaklar (yeni kullanıcı, n. gün D = n − 1)', () => {
  const table = [
    [0, ['kirpma']],
    [1, ['isinma', 'kirpma']],
    [2, ['isinma', 'kirpma']],
    [3, ['isinma', 'dikey', 'kirpma']],
    [4, ['isinma', 'uzak', 'dikey', 'kirpma']],
    [5, ['isinma', 'uzak', 'dikey', 'kirpma']],
    [6, ['isinma', 'uzak', 'yakinuzak', 'dikey', 'kirpma']],
    [8, ['isinma', 'uzak', 'yakinuzak', 'daire', 'dikey', 'kirpma']],
    [200, ['isinma', 'uzak', 'yakinuzak', 'daire', 'dikey', 'kirpma']],
  ]
  for (const [D, keys] of table) {
    it(`D = ${D}: ${keys.join(', ')}`, () => expect(keysOf(routine.today(ctxAt({ D })))).toEqual(keys))
  }
  it('1. gün yalnız Göz kırpma [kırp, kapat]; 2. gün "Sağ–sol" isinma anahtarıyla, 3. gün "Isınma" üçü birlikte', () => {
    const d1 = routine.today(ctxAt({ D: 0 }))
    expect(d1).toHaveLength(1)
    expect(d1[0]).toMatchObject({ key: 'kirpma', title: 'Göz kırpma', minutes: 1, route: 'routine-kirpma', slot: 'body', order: 90, stage: { id: 'K1', index: 0, steps: ['blink', 'rest'], patch: null, variant: null } })
    const d2 = routine.today(ctxAt({ D: 1 }))[0]
    expect(d2).toMatchObject({ key: 'isinma', title: 'Sağ–sol', route: 'routine-isinma', slot: 'warmup', order: 10, stage: { id: 'K2', steps: ['lookRight', 'lookLeft', 'rest'] } })
    const d3 = routine.today(ctxAt({ D: 2 }))[0]
    expect(d3).toMatchObject({ key: 'isinma', title: 'Isınma', stage: { id: 'K3', steps: ['blink', 'lookRight', 'lookLeft'] } })
  })
  it('Yukarı–aşağı 2. bölümde Daire\'nin yerinde; 9. günden Daire ile dönüşümlü (donus), düşme sırası Daire\'ninki', () => {
    const k4 = routine.today(ctxAt({ D: 3 })).find((s) => s.key === 'dikey')
    expect(k4).toMatchObject({ title: 'Yukarı–aşağı', glyph: 'updown', route: 'routine-dikey', slot: 'body', order: 70, dropRank: 3 })
    expect(k4.rotate).toBeUndefined()
    const k7 = routine.today(ctxAt({ D: 8 }))
    for (const k of ['daire', 'dikey']) expect(k7.find((s) => s.key === k)).toMatchObject({ order: 70, dropRank: 3, rotate: 'donus' })
    // hiç yapılmamışken biri 0 (gelir), öteki 1: yerel günün tekliğiyle
    expect(k7.filter((s) => s.rotate).map((s) => s.weekDays).sort()).toEqual([0, 1])
  })
  it('dönüşüm: bugünden önce en son yapılanın ötekisi gelir; yol bir günde yalnız birini gösterir (lib/today.js rotate)', () => {
    const s = [1, 2, 3].map((n) => ({ type: 'routine', setId: 'daire', seconds: 40, date: daysAgo(n) }))
    const stops = routine.today(ctxAt({ D: 20 }, s))
    expect(stops.find((x) => x.key === 'daire').weekDays).toBe(1)
    expect(stops.find((x) => x.key === 'dikey').weekDays).toBe(0)
    const plan = buildPath([routine], ctxAt({ D: 20 }, s))
    const keys = plan.stops.map((x) => x.key)
    expect(keys).toContain('routine:dikey')
    expect(keys).not.toContain('routine:daire')
    expect(keys).toHaveLength(5)
    // bugün Daire yapıldıysa o kalır
    const doneToday = buildPath([routine], ctxAt({ D: 20 }, [...s, { type: 'routine', setId: 'daire', seconds: 40, date: TODAY }])).stops.map((x) => x.key)
    expect(doneToday).toContain('routine:daire')
    expect(doneToday).not.toContain('routine:dikey')
  })
  it('Daire ile Yukarı–aşağı gün aşırı: her gün yapan kişide 9.–40. günler sırayla (dört günlük blok yok); eski kullanıcı güncelleme günü Yukarı–aşağı', () => {
    // Yeni kullanıcı: 4.–8. gün Yukarı–aşağı yapıldı; 9. günden her gün yoldaki grup yapılır
    const s = []
    for (let n = 4; n <= 8; n++) s.push({ type: 'routine', setId: 'dikey', seconds: 40, date: new Date(2026, 9, n, 10).toISOString() })
    const seq = []
    for (let n = 9; n <= 40; n++) {
      const now = new Date(2026, 9, n, 10)
      const plan = buildPath([routine], ctxAt({ D: n - 1 }, [...s], now))
      const k = plan.stops.map((x) => x.key).find((x) => x === 'routine:daire' || x === 'routine:dikey')
      seq.push(k.slice(8))
      s.push({ type: 'routine', setId: k.slice(8), seconds: 40, date: new Date(2026, 9, n, 10, 5).toISOString() })
    }
    expect(seq[0]).toBe('daire') // 9. gün Daire (§3.A.9)
    for (let i = 1; i < seq.length; i++) expect(seq[i], `gün ${i + 9}`).not.toBe(seq[i - 1])
    // Eski kullanıcı: Y1 öncesi her gün Daire; güncelleme günü Yukarı–aşağı, ertesi gün Daire
    const old = Array.from({ length: 60 }, (_, i) => ({ type: 'routine', setId: 'daire', seconds: 40, date: daysAgo(60 - i) }))
    expect(buildPath([routine], ctxAt({ D: 60, Dstage: 0 }, old)).stops.map((x) => x.key)).toContain('routine:dikey')
    const tomorrow = new Date(NOW.getTime() + 86400000)
    const next = [...old, { type: 'routine', setId: 'dikey', seconds: 40, stage: 'K7', date: TODAY }]
    expect(buildPath([routine], ctxAt({ D: 61, Dstage: 1 }, next, tomorrow)).stops.map((x) => x.key)).toContain('routine:daire')
  })
  it('rotationRanks: bugün sayılmaz; hiç yapılmamışsa ya da aynı gün yapılmışsa yerel gün (aynı gün her saatte aynı)', () => {
    const at = (h) => new Date(2026, 9, 12, h)
    const a = rotationRanks([], ['dikey', 'daire'], at(0))
    for (const h of [1, 2, 3, 12, 23]) expect(rotationRanks([], ['daire', 'dikey'], at(h))).toEqual(a)
    expect(rotationRanks([], ['daire', 'dikey'], new Date(2026, 9, 13, 10))).not.toEqual(a) // ertesi gün öteki
    const todayOnly = [{ type: 'routine', setId: 'daire', seconds: 40, date: at(9).toISOString() }]
    expect(rotationRanks(todayOnly, ['daire', 'dikey'], at(10))).toEqual(a)
    expect(rotationRanks([], [], at(10))).toEqual({})
  })
  it('kilit ekranının "Devam: …" satırı yoldaki adla: 2. gün "sağ–sol egzersizi"; ilerleme yoksa bugünkü "ısınma egzersizi"', () => {
    const now = new Date()
    expect(routine.label('routine-isinma')).toBe('ısınma egzersizi')
    routine.today({ tests: [], sessions: [], now }) // ilerleme yok: ad yazılmaz
    expect(routine.label('routine-isinma')).toBe('ısınma egzersizi')
    routine.today(ctxAt({ D: 1 }, [], now))
    expect(routine.label('routine-isinma')).toBe('sağ–sol egzersizi')
    expect(routine.label('routine-kirpma')).toBe('göz kırpma egzersizi')
    expect(routine.label('routine-normal')).toBe('normal egzersiz seti')
    routine.today(ctxAt({ D: 2 }, [], now))
    expect(routine.label('routine-isinma')).toBe('ısınma egzersizi')
    // başka günün yolu bugünün adını değiştirmez
    routine.today(ctxAt({ D: 1 }, [], new Date(2026, 0, 5, 10)))
    expect(routine.label('routine-isinma')).toBe('ısınma egzersizi')
  })
  it('14+ gün aradan sonra (G ≥ 14) o gün bir basamak aşağı (yumuşak dönüş)', () => {
    const soft = routine.today(ctxAt({ D: 4, G: 20 }))
    expect(keysOf(soft)).toEqual(['isinma', 'dikey', 'kirpma'])
    expect(soft[0].stage).toMatchObject({ id: 'K4', soft: true })
  })
  it('basamak gün içinde değişmez: bugünün kaydı içeriği değiştirmez', () => {
    const before = routine.today(ctxAt({ D: 1 }))
    const after = routine.today(ctxAt({ D: 1 }, [{ type: 'routine', setId: 'isinma', seconds: 30, stage: 'K2', date: TODAY }]))
    expect(after.map(({ done, ...x }) => x)).toEqual(before.map(({ done, ...x }) => x))
    expect(after[0].done).toBe(true)
  })
})

describe('çeşitlemeler (Dvar = min(D, Dstage + 14))', () => {
  const kirpma = (o) => routine.today(ctxAt(o)).find((s) => s.key === 'kirpma')
  it('V1 (Dvar 21): yalnız Göz kırpma grubunda 10 tekrar; Isınma\'daki kırpma aynı kalır', () => {
    expect(kirpma({ D: 20 }).stage.patch).toBeNull()
    const k = kirpma({ D: 21 })
    expect(k.stage.variant).toBe('V1')
    expect(k.stage.patch).toEqual({ blink: { blinks: 10, seconds: 40 } })
    expect(routine.today(ctxAt({ D: 21 })).find((s) => s.key === 'isinma').stage.patch).toBeNull()
  })
  it('V3 kırpmayı 15\'e çıkarır, V2\'nin saniyeleri kalır (birikir)', () => {
    const stops = routine.today(ctxAt({ D: 42, seedDay: '2026-01-07' }))
    expect(stops.find((s) => s.key === 'kirpma').stage.patch.blink).toMatchObject({ blinks: 15, seconds: 60 })
    expect(stops.find((s) => s.key === 'isinma').stage.patch).toEqual({ lookRight: { seconds: 8 }, lookLeft: { seconds: 8 } })
    expect(stops.find((s) => s.key === 'daire').stage.patch.circleCw).toMatchObject({ laps: 3 })
  })
  it('eski kullanıcı (D = 200): güncelleme günü çeşitleme yok; V1 7, V2 14, V3 28, V4 42 çalışma gününden sonra', () => {
    const v = (Dstage) => kirpma({ D: 200, Dstage }).stage.variant
    expect(v(0)).toBeNull()
    expect(v(6)).toBeNull()
    expect(v(7)).toBe('V1')
    expect(v(14)).toBe('V2')
    expect(v(28)).toBe('V3')
    expect(v(42)).toBe('V4')
    // eski kullanıcı güncelleme günü merdivenin üstündedir: beş grup yapısı (Daire ile Yukarı–aşağı dönüşümlü)
    expect(keysOf(routine.today(ctxAt({ D: 200, Dstage: 0 })))).toEqual(['isinma', 'uzak', 'yakinuzak', 'daire', 'dikey', 'kirpma'])
  })
  it('her basamakta ve çeşitlemede her grubun içeriği ≤ 75 sn; kırpma ≤ 15, daire ≤ 3 tur', () => {
    for (const D of [0, 1, 2, 3, 4, 6, 8, 21, 28, 42, 56, 90]) {
      for (let d = 0; d < 7; d++) {
        const seedDay = dayKey(new Date(2026, 9, 5 + d))
        for (const s of [].concat(routine.today(ctxAt({ D, seedDay })))) {
          if (s.key === 'normal') continue // tam set günü: tek durak, 2 dk
          const steps = s.stage.steps.map((id) => ({ ...EXERCISES[id], ...(s.stage.patch?.[id] ?? {}) }))
          expect(setDurationSec({ steps: s.stage.steps, patch: s.stage.patch }), `${D}/${s.key}`).toBeLessThanOrEqual(GROUP_CAP_SEC)
          for (const x of steps) {
            if (x.blinks != null) expect(x.blinks).toBeLessThanOrEqual(15)
            if (x.laps != null) expect(x.laps).toBeLessThanOrEqual(3)
          }
          for (const id of s.stage.steps) expect(EXERCISES[id], id).toBeDefined()
        }
      }
    }
  })
})

describe('karışık gün ve tam set günü (haftada bir, tohumla)', () => {
  it('karışık gün (V2+): Isınma\'nın adımları aynı, sırası farklı; öteki gruplar aynı; aynı gün her açılışta aynı', () => {
    const day = findDay('routine:mix', 'routine:full')
    const c = ctxAt({ D: 30, seedDay: dayKey(day) }, [], day)
    const isinma = routine.today(c).find((s) => s.key === 'isinma')
    expect(isinma.stage.day).toBe('mix')
    expect([...isinma.stage.steps].sort()).toEqual(['blink', 'lookLeft', 'lookRight'])
    expect(isinma.stage.steps).not.toEqual(['blink', 'lookRight', 'lookLeft'])
    expect(routine.today(c).find((s) => s.key === 'isinma').stage.steps).toEqual(isinma.stage.steps)
    // V2'den önce karışık gün yok
    expect(routine.today(ctxAt({ D: 27, seedDay: dayKey(day) }, [], day)).find((s) => s.key === 'isinma').stage.day).toBeNull()
  })
  it('tam set günü (V4, Dvar 56+): 2. bölümün grupları yerine Normal set; yol payı aynı (5 dk)', () => {
    const day = findDay('routine:full')
    const c = ctxAt({ D: 60, seedDay: dayKey(day) }, [], day)
    const stops = routine.today(c)
    expect(keysOf(stops)).toEqual(['isinma', 'uzak', 'yakinuzak', 'normal'])
    expect(stops.at(-1)).toMatchObject({ title: 'Normal set', minutes: 2, route: 'routine-normal', slot: 'body', order: 90, stage: { day: 'full', variant: 'V4' } })
    const plan = buildPath([routine], c)
    expect(plan.minutesLeft).toBe(5)
    // Normal set kaydı durağı tamamlar
    expect(routine.today(ctxAt({ D: 60, seedDay: dayKey(day) }, [{ type: 'routine', setId: 'normal', seconds: 110, date: day.toISOString() }], day)).at(-1).done).toBe(true)
    // V4'ten önce tam set günü yok
    expect(keysOf(routine.today(ctxAt({ D: 55, seedDay: dayKey(day) }, [], day)))).toContain('kirpma')
    // aynı hafta içinde tek gün
    const week = Array.from({ length: 7 }, (_, i) => new Date(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDay() + 6) % 7) + i, 10))
    expect(week.filter((d) => keysOf(routine.today(ctxAt({ D: 60, seedDay: dayKey(d) }, [], d))).includes('normal'))).toHaveLength(1)
  })
  it('mixedOrder: belirlenimci, aynı adımlar, girişten farklı sıra', () => {
    for (let seed = 1; seed < 200; seed++) {
      const out = mixedOrder(['blink', 'lookRight', 'lookLeft'], seed)
      expect([...out].sort()).toEqual(['blink', 'lookLeft', 'lookRight'])
      expect(out).not.toEqual(['blink', 'lookRight', 'lookLeft'])
      expect(mixedOrder(['blink', 'lookRight', 'lookLeft'], seed)).toEqual(out)
    }
    expect(mixedOrder(['blink'], 5)).toEqual(['blink'])
  })
})

describe('stagedSet (yoldan açılan grup ekranı)', () => {
  it('bugünün basamağıyla aynı adımlar, yama ve kayıt alanları', () => {
    expect(stagedSet(ctxAt({ D: 1 }), 'isinma')).toEqual({ id: 'isinma', title: 'Sağ–sol', glyph: 'arrows', group: true, steps: ['lookRight', 'lookLeft', 'rest'], patch: null, stage: 'K2', variant: null })
    expect(stagedSet(ctxAt({ D: 21 }), 'kirpma')).toMatchObject({ steps: ['blink', 'rest'], patch: { blink: { blinks: 10, seconds: 40 } }, stage: 'K7', variant: 'V1' })
  })
  it('grup bugünün yolunda yoksa ya da ilerleme yoksa null', () => {
    expect(stagedSet(ctxAt({ D: 0 }), 'isinma')).toBeNull()
    expect(stagedSet({ sessions: [], now: NOW }, 'kirpma')).toBeNull()
    expect(stagedGroups({ sessions: [], now: NOW })).toBeNull()
  })
  it('merdivenin grupları kodla aynı (lib/ladders.js ↔ lib/routines.js PATH_GROUPS)', () => {
    const top = LADDERS.routine.steps.at(-1).groups
    for (const g of top) {
      const p = PATH_GROUPS.find((x) => x.id === g.key)
      expect(p, g.key).toBeDefined()
      expect(g.steps).toEqual(p.steps)
      expect(g.title).toBe(p.title)
    }
  })
})
