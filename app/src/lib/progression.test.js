// İlerleme motoru (SONSUZ_YOL.PLAN.v1 §3.A.2, §3.A.8, §3.A.10, §3.G.6): bugün sayılmaz, yumuşak dönüş, açılma, Dvar;
// eski kullanıcının güncelleme gününde tutmalı ya da beklemeli kalıp gelmez; ara kilidi ilerleme yokken bugünkü kural.
import { describe, it, expect } from 'vitest'
import { progressionCtx, stageOf, unlocked, restDecision, newStopKeys, seedHash, weeklyPick, pathRestMinutes, updateDay } from './progression.js'
import { LADDERS } from './ladders.js'
import { breathOfDay, breathSafety } from './breathMix.js'
import { registry } from '../modules/registry.js'
import { dayKey } from './calendar.js'
import { PATH } from './today.js'

const MIN = 60000
const at = (n, h = 10, m = 0) => new Date(2026, 9, n, h, m) // n. gün (1 Ekim 2026 = 1)
const iso = (n, h = 10, m = 0) => at(n, h, m).toISOString()
const routine = (n, setId = 'kirpma', extra = {}) => ({ type: 'routine', setId, seconds: 40, date: iso(n), ...extra })
const breath = (n, seconds = 180, extra = {}) => ({ type: 'breath', seconds, date: iso(n), ...extra })
const ctxOf = (tests, sessions, now) => ({ tests, sessions, now, progression: progressionCtx({ tests, sessions, now, modules: registry.live }) })

describe('progressionCtx: sayaçlar kayıtlardan, bugünden önceki günlerle', () => {
  it('yeni kullanıcı 1. gün: pathDay 0, her modülde D 0, G null; seedDay bugün', () => {
    const p = progressionCtx({ tests: [], sessions: [], now: at(1), modules: registry.live })
    expect(p.pathDay).toBe(0)
    expect(p.seedDay).toBe(dayKey(at(1)))
    expect(p.mod.routine).toEqual({ D: 0, G: null, Dstage: 0 })
    expect(p.mod.breath).toEqual({ D: 0, G: null, Dstage: 0 })
    expect(p.later).toEqual([])
  })
  it('bugün sayılmaz: bugünkü kayıtlar pathDay, D, G ve Dstage\'i değiştirmez (basamak gün içinde aynı)', () => {
    const past = [routine(1), routine(2), breath(2)]
    const a = progressionCtx({ sessions: past, now: at(3, 9), modules: registry.live })
    const b = progressionCtx({ sessions: [...past, routine(3, 'isinma', { stage: 'K3' }), breath(3, 300, { stage: 'N3' })], now: at(3, 23, 50), modules: registry.live })
    expect(b).toEqual(a)
    expect(a.pathDay).toBe(2)
    expect(a.mod.routine).toEqual({ D: 2, G: 1, Dstage: 0 })
    expect(stageOf({ progression: b }, 'routine')).toEqual(stageOf({ progression: a }, 'routine'))
  })
  it('her gün yapan kişide n. gün D = pathDay = n − 1; aynı günün birden çok kaydı tek gün', () => {
    const s = []
    for (let n = 1; n <= 9; n++) s.push(routine(n, 'kirpma'), routine(n, 'isinma'), breath(n))
    const p = progressionCtx({ sessions: s, now: at(10), modules: registry.live })
    expect(p.pathDay).toBe(9)
    expect(p.mod.routine.D).toBe(9)
    expect(p.mod.breath.D).toBe(9)
    expect(p.mod.snake.D).toBe(0)
  })
  it('pathDay yalnız yola ait kayıtları sayar: ölçüm ve yolda durağı olan modül evet; su, alarm, bilinmeyen tür hayır', () => {
    const tests = [{ type: 'va-weekly', eye: 'R', date: iso(1) }]
    const sessions = [{ type: 'water', date: iso(2) }, { type: 'day-check', date: iso(3) }, { type: 'game', game: 'snake', date: iso(4) }]
    const p = progressionCtx({ tests, sessions, now: at(6), modules: registry.live })
    expect(p.pathDay).toBe(2) // 1. gün ölçüm, 4. gün Yılan
    expect(p.mod.weekly.D).toBe(1)
    expect(p.mod.snake).toEqual({ D: 1, G: 2, Dstage: 0 })
    // modül listesi verilmezse bütün kayıtlar sayılır
    expect(progressionCtx({ tests, sessions, now: at(6) }).pathDay).toBe(4)
  })
  it('yolda olmayan kısa E testi (va-daily) pathDay\'e sayılmaz; kendi sayacı tutulur', () => {
    const tests = [{ type: 'va-daily', eye: 'R', date: iso(1) }, { type: 'va-daily', eye: 'L', date: iso(2) }, { type: 'reading', date: iso(3) }]
    const p = progressionCtx({ tests, now: at(5), modules: registry.live })
    expect(p.pathDay).toBe(1) // yalnız okuma testi
    expect(p.mod.daily.D).toBe(2)
    expect(p.mod.reading.D).toBe(1)
  })
  it('ölçümde koşu günü (runDay): gece yarısını geçen koşu başladığı güne sayılır', () => {
    const tests = [{ type: 'va-weekly', eye: 'OU', date: new Date(2026, 9, 2, 0, 3).toISOString(), runDay: dayKey(at(1)) }]
    expect(progressionCtx({ tests, now: at(2), modules: registry.live }).pathDay).toBe(1)
    expect(progressionCtx({ tests, now: at(1, 23, 59), modules: registry.live }).pathDay).toBe(0)
  })
  it('G: son yapılan günden bugüne takvim günü; Dstage yalnız stage alanlı kayıtlar; bozuk kayıt sayılmaz', () => {
    const s = [routine(1), routine(2, 'kirpma', { stage: 'K2' }), routine(5, 'isinma', { stage: 'K3' }), { type: 'routine', date: 'bozuk' }]
    expect(progressionCtx({ sessions: s, now: at(12), modules: registry.live }).mod.routine).toEqual({ D: 3, G: 7, Dstage: 2 })
  })
  it('"Sonra yaparım": yalnız bugünün kaydı (lib/pathLater.js biçimi) ya da anahtar listesi', () => {
    const now = at(4)
    expect(progressionCtx({ now, later: { day: dayKey(now), later: ['yoga', 3] } }).later).toEqual(['yoga'])
    expect(progressionCtx({ now, later: { day: dayKey(at(3)), later: ['yoga'] } }).later).toEqual([])
    expect(progressionCtx({ now, later: ['yoga'] }).later).toEqual(['yoga'])
  })
  it('bozuk modül (match hata verir) sayacı düşürmez', () => {
    const bad = { id: 'bad', kind: 'practice', today: () => null, sessions: { match: () => { throw new Error('x') } } }
    const p = progressionCtx({ sessions: [routine(1)], now: at(2), modules: [...registry.live, bad] })
    expect(p.mod.bad).toEqual({ D: 0, G: null, Dstage: 0 })
    expect(p.pathDay).toBe(1)
  })
})

describe('stageOf: basamak, yumuşak dönüş, Dvar', () => {
  const P = (mod, pathDay = 30, seedDay = '2026-10-30') => ({ progression: { pathDay, mod, later: [], seedDay } })
  it('ctx.progression yoksa null (manifest bugünkü çıktısını verir)', () => {
    expect(stageOf({}, 'routine')).toBeNull()
    expect(stageOf(undefined, 'breath')).toBeNull()
    expect(stageOf(P({}), 'yok')).toBeNull()
  })
  it('nefes: D 0 → 1 dk, D 1 → 2 dk, D ≥ 2 → 3 dk; hiç kaydı olmayan modül D 0', () => {
    const m = (D) => stageOf(P({ breath: { D, G: 1, Dstage: D } }), 'breath').minutes
    expect([0, 1, 2, 3, 50, 500].map(m)).toEqual([1, 2, 3, 3, 3, 3])
    expect(stageOf(P({}), 'breath')).toMatchObject({ index: 0, D: 0, Dvar: 0, minutes: 1, soft: false, variant: null })
  })
  it('göz: n. gün (D = n − 1) basamağı K1…K7; 9. günden K7', () => {
    const id = (D) => stageOf(P({ routine: { D, G: 1, Dstage: D } }), 'routine').id
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 30].map(id)).toEqual(['K1', 'K2', 'K3', 'K4', 'K5', 'K5', 'K6', 'K6', 'K7', 'K7'])
  })
  it('yumuşak dönüş: G ≥ 14 ise o gün bir basamak (ve bir çeşitleme) aşağı; G 13\'te değil; ilk basamakta aşağısı yok', () => {
    const st = (D, G) => stageOf(P({ routine: { D, G, Dstage: D }, breath: { D, G, Dstage: D } }), 'routine')
    expect(st(12, 13)).toMatchObject({ id: 'K7', soft: false })
    expect(st(12, 14)).toMatchObject({ id: 'K6', soft: true, isNew: false })
    expect(st(0, 20)).toMatchObject({ id: 'K1', soft: true })
    expect(stageOf(P({ breath: { D: 30, G: 15, Dstage: 30 } }), 'breath')).toMatchObject({ minutes: 2, soft: true, variant: { tier: 'B' } })
    expect(stageOf(P({ breath: { D: 30, G: 1, Dstage: 30 } }), 'breath')).toMatchObject({ minutes: 3, soft: false, variant: { tier: 'C' } })
    // ertesi gün (kaldığı yerden): G küçülür, basamak geri gelir, sayı sıfırlanmaz
    expect(st(13, 1)).toMatchObject({ id: 'K7', soft: false, D: 13 })
  })
  it('yeni kullanıcı: Dvar = D; çeşitlemeler 22. (V1), 29. (V2), 43. (V3), 57. günde (V4); nefes katmanları 8., 22., 43. günde', () => {
    const v = (id, D) => stageOf(P({ [id]: { D, G: 1, Dstage: D } }), id).variant
    expect([20, 21, 27, 28, 41, 42, 55, 56].map((D) => v('routine', D)?.id ?? null)).toEqual([null, 'V1', 'V1', 'V2', 'V2', 'V3', 'V3', 'V4'])
    expect([6, 7, 20, 21, 41, 42].map((D) => v('breath', D)?.tier ?? null)).toEqual([null, 'B', 'B', 'C', 'C', 'D'])
    expect(v('routine', 42).patch).toMatchObject({ kirpma: { blink: { blinks: 15 } }, isinma: { lookRight: { seconds: 8 } } })
  })
  it('eski kullanıcı (D = 200): güncelleme günü Dvar 14; göz çeşitlemesi yok, nefeste "Günün ritmi" (tutmasız); sonra 7, 14, 28, 42 çalışma günü', () => {
    const at0 = (Dstage) => ({ routine: { D: 200, G: 1, Dstage }, breath: { D: 200, G: 1, Dstage } })
    const s = (Dstage, id) => stageOf(P(at0(Dstage)), id)
    expect(s(0, 'routine')).toMatchObject({ id: 'K7', D: 200, Dvar: 14, variant: null })
    expect(s(0, 'breath')).toMatchObject({ minutes: 3, Dvar: 14, variant: { tier: 'B' } })
    expect([6, 7, 13, 14, 27, 28, 41, 42].map((d) => s(d, 'routine').variant?.id ?? null)).toEqual([null, 'V1', 'V1', 'V2', 'V2', 'V3', 'V3', 'V4'])
    expect([6, 7, 27, 28].map((d) => s(d, 'breath').variant.tier)).toEqual(['B', 'C', 'C', 'D'])
  })
  it('eski kullanıcının güncelleme gününde tutmalı ya da beklemeli kalıp gelmez (365 farklı gün, güvenlik kartı görülmüş)', () => {
    const st = stageOf(P({ breath: { D: 200, G: 1, Dstage: 0 } }), 'breath')
    for (let n = 0; n < 365; n++) {
      const seedDay = dayKey(new Date(2026, 9, 1 + n))
      const mix = breathOfDay(st, { seedDay, history: [], safety: { holdOk: true } })
      expect(mix.hold, seedDay).toBe(0)
      expect(mix.pause, seedDay).toBe(0)
    }
  })
  it('isNew ve newKeys: yeni ya da değişen göz grubu; nefeste yeni süre ya da katman; yumuşak günde yok', () => {
    const st = (id, D, G = 1) => stageOf(P({ [id]: { D, G, Dstage: D } }), id)
    expect(st('routine', 0)).toMatchObject({ isNew: false })
    expect(st('routine', 1)).toMatchObject({ isNew: true, newKeys: ['isinma'] }) // 2. gün Sağ–sol
    expect(st('routine', 2)).toMatchObject({ isNew: true, newKeys: ['isinma'] }) // 3. gün üçü birlikte
    expect(st('routine', 3).newKeys).toEqual(['dikey'])
    expect(st('routine', 4).newKeys).toEqual(['uzak'])
    expect(st('routine', 5)).toMatchObject({ isNew: false, newKeys: null })
    expect(st('routine', 6).newKeys).toEqual(['yakinuzak'])
    expect(st('routine', 8).newKeys).toEqual(['daire']) // Yukarı–aşağı yalnız dönüşe girdi, içeriği aynı
    expect(st('routine', 21).newKeys).toEqual(['kirpma']) // V1: kırpma 10 tekrar
    expect(st('routine', 28).newKeys.sort()).toEqual(['dikey', 'isinma', 'uzak', 'yakinuzak'])
    expect(st('routine', 8, 20)).toMatchObject({ isNew: false })
    expect([0, 1, 2, 3, 7, 8, 21, 42].map((D) => st('breath', D).isNew)).toEqual([false, true, true, false, true, false, true, true])
    expect(st('breath', 1).newKeys).toBeNull()
  })
  it('çeşitlemenin haftalık günleri: haftada tam bir karışık gün (V2+) ve bir tam set günü (V4+), ikisi ayrı günlerde', () => {
    for (let w = 0; w < 30; w++) {
      const days = Array.from({ length: 7 }, (_, i) => dayKey(new Date(2026, 9, 5 + w * 7 + i))) // 5 Ekim 2026 Pazartesi
      const v = days.map((d) => stageOf(P({ routine: { D: 60, G: 1, Dstage: 60 } }, 60, d), 'routine').variant)
      expect(v.filter((x) => x.mixDay)).toHaveLength(1)
      expect(v.filter((x) => x.fullSetDay)).toHaveLength(1)
      expect(v.some((x) => x.mixDay && x.fullSetDay)).toBe(false)
      const early = days.map((d) => stageOf(P({ routine: { D: 30, G: 1, Dstage: 30 } }, 30, d), 'routine').variant)
      expect(early.filter((x) => x.mixDay)).toHaveLength(1)
      expect(early.some((x) => x.fullSetDay)).toBe(false)
    }
    expect(weeklyPick('bozuk', 'x')).toBe(false)
  })
  it('seedHash belirlenimci ve kararlı', () => {
    expect(seedHash('2026-10-01:breath')).toBe(seedHash('2026-10-01:breath'))
    expect(seedHash('a')).not.toBe(seedHash('b'))
    expect(seedHash('')).toBe(0x811c9dc5)
  })
})

describe('unlocked: açılma eşikleri (pathDay)', () => {
  const P = (pathDay) => ({ progression: { pathDay, mod: {}, later: [], seedDay: '2026-10-01' } })
  it('ctx.progression yoksa hep açık (bugünkü davranış)', () => {
    for (const id of ['snake', 'notice', 'fark-ettin', 'tek-bakis', 'routine']) expect(unlocked({}, id)).toBe(true)
  })
  it('Yılan ve Bugünün görevi 2., Fark Ettin mi? 6., Tek Bakışta 8. gün; eşiği olmayan modül hep açık', () => {
    const open = (id) => [0, 1, 4, 5, 6, 7].map((d) => unlocked(P(d), id))
    expect(open('snake')).toEqual([false, true, true, true, true, true])
    expect(open('notice')).toEqual([false, true, true, true, true, true])
    expect(open('fark-ettin')).toEqual([false, false, false, true, true, true])
    expect(open('tek-bakis')).toEqual([false, false, false, false, false, true])
    expect(open('routine')).toEqual([true, true, true, true, true, true])
    expect(unlocked(P(2), 'x', 3)).toBe(false)
  })
})

describe('newStopKeys: "Yeni" rozeti', () => {
  const stop = (key) => ({ key, id: key.split(':')[0] })
  it('1. günde ve ilerleme yokken hiç rozet yok', () => {
    const c = ctxOf([], [], at(1))
    expect(newStopKeys(c, ['routine:kirpma', 'breath', 'track', 'weekly'].map(stop))).toEqual([])
    expect(newStopKeys({}, [stop('snake')])).toEqual([])
  })
  it('yeni kullanıcı 2. gün: Sağ–sol, 2 dk nefes, okuma, Yılan ve Bugünün görevi yeni; Göz kırpma ve Çemberler değil', () => {
    const s = [routine(1, 'kirpma'), breath(1, 60), { type: 'game', game: 'track', date: iso(1) }]
    const t = ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, date: iso(1) }))
    const c = ctxOf(t, s, at(2))
    const keys = ['routine:isinma', 'track', 'breath', 'reading', 'routine:kirpma', 'snake', 'notice']
    expect(newStopKeys(c, keys.map(stop))).toEqual(['routine:isinma', 'breath', 'reading', 'snake', 'notice'])
  })
  it('açılma eşikli durak yalnız açıldığı gün yeni (Fark Ettin mi? 6. gün, Tek Bakışta 8. gün); ilk haftadan sonra ilk kez gelen durak yeni değil', () => {
    const s = []
    for (let n = 1; n <= 9; n++) s.push(routine(n))
    expect(newStopKeys(ctxOf([], s.slice(0, 5), at(6)), [stop('fark-ettin')])).toEqual(['fark-ettin'])
    expect(newStopKeys(ctxOf([], s.slice(0, 6), at(7)), [stop('fark-ettin')])).toEqual([])
    expect(newStopKeys(ctxOf([], s.slice(0, 7), at(8)), [stop('tek-bakis')])).toEqual(['tek-bakis'])
    expect(newStopKeys(ctxOf([], s.slice(0, 2), at(3)), [stop('yoga')])).toEqual(['yoga'])
    expect(newStopKeys(ctxOf([], s.slice(0, 8), at(9)), [stop('yoga'), stop('quick-look')])).toEqual([])
  })
  it('1. günden yolda olan durak (Çemberler, haftalık E testi) 1. gün atlanınca ertesi günler "Yeni" olmaz', () => {
    // 1. gün yalnız Göz kırpma ve nefes yapıldı; Çemberler ve E testi atlandı
    const s = [routine(1, 'kirpma', { stage: 'K1' }), breath(1, 60, { stage: 'N1' })]
    for (const n of [2, 3, 5, 7]) {
      const got = newStopKeys(ctxOf([], s, at(n)), [stop('track'), stop('weekly'), stop('reading')])
      expect(got, `gün ${n}`).not.toContain('track')
      expect(got, `gün ${n}`).not.toContain('weekly')
      expect(got, `gün ${n}`).toContain('reading') // okuma testi 2. günden gelir ve henüz hiç yapılmadı
    }
  })
  it('eski kullanıcının güncelleme günü: Yukarı–aşağı, nefesin "Günün ritmi" ve hiç yapılmamış Bugünün görevi yeni; Y1 öncesi yoldaki duraklar değil', () => {
    const s = []
    for (let n = 1; n <= 60; n++) {
      for (const g of ['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma']) s.push(routine(n, g))
      s.push(breath(n, 300), { type: 'game', game: 'track', date: iso(n) })
    }
    const now = at(61)
    const c = ctxOf([], s, now)
    const stops = ['routine:isinma', 'routine:uzak', 'track', 'breath', 'routine:dikey', 'routine:kirpma', 'snake', 'notice', 'fark-ettin', 'tek-bakis', 'reading'].map(stop)
    expect(newStopKeys(c, stops)).toEqual(['breath', 'routine:dikey', 'notice'])
    // ertesi gün (güncelleme günü staged kayıt yazdı): rozet yok
    const next = [...s, routine(61, 'dikey', { stage: 'K7' }), breath(61, 180, { stage: 'N3' }), { type: 'notice', count: 2, date: iso(61) }]
    expect(newStopKeys(ctxOf([], next, at(62)), stops)).toEqual([])
    // yeni kullanıcının 2. günü güncelleme günü sayılmaz (kaydı stage'siz olsa da D < 14)
    const fresh = [routine(1), breath(1, 60), { type: 'game', game: 'track', date: iso(1) }]
    expect(newStopKeys(ctxOf([], fresh, at(2)), [stop('snake'), stop('notice')])).toEqual(['snake', 'notice'])
  })
})

describe('manifestin kendi merdiveni ve açılma eşiği (§3.G.1 progression.ladder, progression.unlock)', () => {
  const own = {
    id: 'yeni-modul', kind: 'practice', sessions: { match: (s) => s?.type === 'yeni' },
    progression: { match: (s) => s?.type === 'yeni', ladder: { steps: [{ from: 0, id: 'Y1', minutes: 1 }, { from: 2, id: 'Y2', minutes: 2 }] }, unlock: { pathDay: 3 } },
    today: () => ({ title: 'Yeni modül', minutes: 1 }),
  }
  it('progressionCtx manifestin merdivenini ve eşiğini taşır; stageOf, unlocked ve newStopKeys onları okur', () => {
    const s = [routine(1), routine(2), { type: 'yeni', date: iso(2) }, { type: 'yeni', date: iso(3) }, routine(3)]
    const p = progressionCtx({ sessions: s, now: at(4), modules: [...registry.live, own] })
    expect(p.mod['yeni-modul']).toMatchObject({ D: 2, unlock: 3 })
    expect(p.mod['yeni-modul'].ladder.steps).toHaveLength(2)
    const c = { progression: p }
    expect(stageOf(c, 'yeni-modul')).toMatchObject({ id: 'Y2', minutes: 2, isNew: true })
    expect(unlocked(c, 'yeni-modul')).toBe(true) // pathDay 3 ≥ 3
    expect(unlocked({ progression: { ...p, pathDay: 2 } }, 'yeni-modul')).toBe(false)
    expect(newStopKeys(c, [{ key: 'yeni-modul', id: 'yeni-modul' }])).toEqual(['yeni-modul'])
    // merdiven vermeyen modülde alan eklenmez (kayıt biçimi aynı)
    expect(p.mod.routine).toEqual({ D: 3, G: 1, Dstage: 0 })
  })
})

describe('restDecision: ara kilidi (§3.A.8-6)', () => {
  // Y1 öncesi Home.jsx kuralı (git HEAD, screens/Home.jsx:176-182)
  const oldRule = (st) => (!st.locked && (st.due || st.used >= PATH.restMinUsed * MIN) ? (st.due && st.due !== 'budget' ? st.due : 'path') : null)
  // breathMin: yoldaki Nefes durağının süresi (Y1 kuralı yalnız 3 dk'dan kısayken)
  const plan = (e1, cap, e2, done2 = 0, breathMin = 1) => ({ stops: [{ key: 'breath', restSlot: true, minutes: breathMin }], blocks: [{ eyeMin: e1, eyeDone: 0, capMin: cap }, { eyeMin: e2, eyeDone: done2, capMin: cap }] })
  const sts = []
  for (const locked of [false, true]) for (const due of [null, 'budget', 'hourly', 'daily']) for (const used of [0, 30000, MIN, 2 * MIN, 4 * MIN, 5 * MIN, 6 * MIN]) for (const budgetMs of [3 * MIN, 5 * MIN]) sts.push({ locked, due, used, budgetMs })
  const plans = [plan(4, 4, 4), plan(1, 4, 1), plan(3, 4, 4), plan(2, 2, 2), plan(0, 4, 0), plan(4, 4, 4, 2), plan(1, 4, 1, 0, 3), plan(2, 4, 3, 0, 2), undefined]
  it('ilerleme yokken bugünkü kuralla 0 fark (her durum, her plan)', () => {
    for (const st of sts) for (const p of plans) expect(restDecision(st, p, undefined), JSON.stringify([st, p])).toBe(oldRule(st))
  })
  it('ilerleme yokken sonlu olmayan ya da dize used da Y1 öncesiyle aynı (Infinity, "70000", undefined, NaN)', () => {
    for (const used of [Infinity, '70000', '30000', undefined, NaN, null]) {
      for (const due of [null, 'budget']) {
        const st = { locked: false, due, used, budgetMs: 5 * MIN }
        for (const p of plans) expect(restDecision(st, p, undefined), String(used)).toBe(oldRule(st))
      }
    }
  })
  it('3 dk\'lık nefeste (3. günden) bugünkü kural: karar kullanılan saniyelere bağlı değil (S0 kararı 8: mola 5 dk)', () => {
    const prog = { pathDay: 2 }
    const st = (used) => ({ locked: false, due: null, used, budgetMs: 5 * MIN })
    // 3. gün: 1. bölüm Isınma + Çemberler (2 dk göz, pay 4), 2. bölüm 3 dk göz
    for (const u of [1.6, 1.8, 2.0, 2.2, 2.4, 2.6]) expect(restDecision(st(u * MIN), plan(2, 4, 3, 0, 3), prog), `${u}`).toBe('path')
    // 2. gün (2 dk nefes): Y1 kuralı, kullanılan + 3 > 5 ise mola (plan §3.A.8-6)
    for (const u of [1.6, 1.8, 2.0]) expect(restDecision(st(u * MIN), plan(2, 4, 3, 0, 2), prog), `${u}`).toBeNull()
    for (const u of [2.2, 2.4, 2.6]) expect(restDecision(st(u * MIN), plan(2, 4, 3, 0, 2), prog), `${u}`).toBe('path')
    // "Zorlandım"dan sonraki 2 dk'lık gün: 1. bölüm doluysa (eski kullanıcı) yine bugünkü kural
    expect(restDecision(st(4 * MIN), plan(4, 4, 4, 0, 2), prog)).toBe('path')
  })
  it('ilerleme varken 1. bölümün göz payı doluysa (eski kullanıcı) bugünkü kural', () => {
    const prog = { pathDay: 100 }
    for (const st of sts) for (const p of [plan(4, 4, 4), plan(2, 2, 2), plan(4, 4, 0)]) expect(restDecision(st, p, prog)).toBe(oldRule(st))
  })
  it('yeni kullanıcının ilk günleri: mola yalnız "kullanılan + 2. bölümde kalan göz dk > bütçe" ise; bir sınır dolmuşsa bugünkü gibi', () => {
    const prog = { pathDay: 0 }
    const st = (used, due = null) => ({ locked: false, due, used, budgetMs: 5 * MIN })
    expect(restDecision(st(MIN), plan(1, 4, 1), prog)).toBeNull() // 1. gün: Çemberler 1 + Göz kırpma 1
    expect(restDecision(st(MIN), plan(1, 4, 1), undefined)).toBe('path') // bugünkü kural: 4 dk boş bekleme
    expect(restDecision(st(3 * MIN), plan(3, 4, 2), prog)).toBeNull() // 3 + 2 = 5, bütçeyi aşmaz
    expect(restDecision(st(3 * MIN), plan(3, 4, 4), prog)).toBe('path') // 3 + 4 > 5
    expect(restDecision(st(3 * MIN), plan(3, 4, 4, 2), prog)).toBeNull() // 2. bölümde kalan 2
    expect(restDecision(st(5 * MIN, 'budget'), plan(1, 4, 1), prog)).toBe('path')
    expect(restDecision(st(MIN, 'hourly'), plan(1, 4, 1), prog)).toBe('hourly')
    expect(restDecision({ ...st(6 * MIN), locked: true }, plan(1, 4, 1), prog)).toBeNull()
    expect(restDecision(null, plan(1, 4, 1), prog)).toBeNull()
  })
})

describe('güvenlik ön koşulu (breathSafety)', () => {
  it('güvenlik kartı görülmemişse ya da son 7 günde "Zorlandım" varsa tutma yok; dün "Zorlandım" → bugün süre bir basamak kısa', () => {
    const now = at(10)
    expect(breathSafety([], now, { seen: true })).toEqual({ holdOk: true, stepDown: false })
    expect(breathSafety([], now, { seen: false }).holdOk).toBe(false)
    expect(breathSafety([breath(3, 180, { strained: true })], now, { seen: true })).toEqual({ holdOk: false, stepDown: false })
    expect(breathSafety([breath(2, 180, { strained: true })], now, { seen: true }).holdOk).toBe(true)
    expect(breathSafety([breath(9, 180, { strained: true })], now, { seen: true })).toEqual({ holdOk: false, stepDown: true })
  })
})

describe('merdiven verisiyle tutarlılık', () => {
  it('stageOf basamak içeriğini aynen taşır (dakika, gruplar)', () => {
    const P = { progression: { pathDay: 3, mod: { routine: { D: 3, G: 1, Dstage: 3 } }, later: [], seedDay: '2026-10-04' } }
    expect(stageOf(P, 'routine').groups).toEqual(LADDERS.routine.steps[3].groups)
  })
})

describe('pathRestMinutes: mola bandının ve baloncuğun süresi', () => {
  const plan = (breathMin, e1, e2, done1 = 0) => ({ stops: [{ key: 'breath', restSlot: true, minutes: breathMin }], blocks: [{ eyeMin: e1, eyeDone: done1, capMin: 4 }, { eyeMin: e2, eyeDone: 0, capMin: 4 }] })
  it('ilerleme yoksa null (ekran durağın süresini yazar: bugünkü 5 dk)', () => {
    expect(pathRestMinutes(null, plan(5, 4, 4), undefined)).toBeNull()
    expect(pathRestMinutes(null, { stops: [], blocks: [] }, { pathDay: 3 })).toBeNull()
  })
  it('1. ve 2. gün yalnız nefes (1 ve 2 dk); 3. günden 5 dk; eski kullanıcı 5 dk', () => {
    expect(pathRestMinutes(null, plan(1, 1, 1), { pathDay: 0 })).toBe(1)
    expect(pathRestMinutes(null, plan(2, 2, 3), { pathDay: 1 })).toBe(2)
    expect(pathRestMinutes(null, plan(3, 2, 3), { pathDay: 2 })).toBe(5) // 3. gün: 3 dk nefes, bugünkü kural
    expect(pathRestMinutes(null, plan(3, 2, 4), { pathDay: 3 })).toBe(5)
    expect(pathRestMinutes(null, plan(3, 4, 4), { pathDay: 100 })).toBe(5)
    expect(pathRestMinutes({ used: 4 * MIN, budgetMs: 5 * MIN, due: null }, plan(3, 4, 4, 4), { pathDay: 100 })).toBe(5) // 1. bölüm bitti
    expect(pathRestMinutes({ used: 0, budgetMs: 5 * MIN, due: null }, plan(3, 0, 0), { pathDay: 100 })).toBe(3) // göz çalışması yok: mola yok
  })
  it('yolun molası sürerken ve bittikten sonra 5 dk (kilitliyken used yok; 1. bölüm bitmiş eski kullanıcı)', () => {
    const P = { pathDay: 80 }
    const done1 = plan(3, 4, 4, 4)
    // mola sürüyor: eyeStatus kilitliyken used vermez
    expect(pathRestMinutes({ locked: true, reason: 'path', leftMs: 3 * MIN, due: null }, done1, P)).toBe(5)
    // nefes bitti, kilit sürüyor
    const breathDone = { ...done1, stops: [{ key: 'breath', restSlot: true, minutes: 3, done: true }] }
    expect(pathRestMinutes({ locked: true, reason: 'path', leftMs: MIN, due: null }, breathDone, P)).toBe(5)
    // mola bitti: kullanılan 0, ama yolun molası bugün başladı
    expect(pathRestMinutes({ locked: false, used: 0, budgetMs: 5 * MIN, due: null }, breathDone, P, { restStarted: true })).toBe(5)
    expect(pathRestMinutes({ locked: false, used: 0, budgetMs: 5 * MIN, due: null }, done1, P, { restStarted: true })).toBe(5)
    // 1.–2. gün: nefes bitti, yolun molası başlamadı → mola nefes kadardı
    const day1 = { ...plan(1, 1, 1), stops: [{ key: 'breath', restSlot: true, minutes: 1, done: true }] }
    expect(pathRestMinutes({ locked: false, used: MIN, budgetMs: 5 * MIN, due: null }, day1, { pathDay: 0 })).toBe(1)
    // başka bir mola (bütçe) sürüyor: 5 dk
    expect(pathRestMinutes({ locked: true, reason: 'budget', leftMs: MIN, due: null }, plan(1, 1, 1), { pathDay: 0 })).toBe(5)
  })
})

describe('Fark Ettin mi? sahne merdiveni (LADDERS[\'fark-ettin\'], badge: false)', () => {
  const street = (n, extra = {}) => ({ type: 'street', noticed: 1, asked: 2, scene: 'cadde', stage: 'F1', date: iso(n), ...extra })
  const stop = { key: 'fark-ettin', id: 'fark-ettin' }
  it('stageOf: F1 Cadde → F5 Akşam; V1 yağmur 14, V2 tabela 21 (yeni kullanıcıda Dvar = D)', () => {
    const st = (D) => {
      const s = []
      for (let n = 1; n <= D; n++) s.push(street(n))
      return stageOf(ctxOf([], s, at(D + 1)), 'fark-ettin')
    }
    expect([0, 1, 2, 4, 7, 10].map((D) => st(D).id)).toEqual(['F1', 'F1', 'F2', 'F3', 'F4', 'F5'])
    expect(st(13).variant).toBeNull()
    expect(st(14).variant).toMatchObject({ id: 'V1', scene: 'yagmur' })
    expect(st(21).variant).toMatchObject({ id: 'V2', kind: 'tabela' })
  })
  it('yol rozeti ve güncelleme günü değişmez: açılma günü (6. gün) yeni; sahne basamağı günleri yeni değil', () => {
    const s = []
    for (let n = 1; n <= 30; n++) s.push(routine(n))
    expect(newStopKeys(ctxOf([], s.slice(0, 5), at(6)), [stop])).toEqual(['fark-ettin'])
    const withStreet = [...s.slice(0, 12)]
    for (let n = 6; n <= 12; n++) withStreet.push(street(n))
    for (const day of [8, 9, 10, 11, 12, 13]) expect(newStopKeys(ctxOf([], withStreet.filter((r) => r.date < iso(day)), at(day)), [stop]), `gün ${day}`).toEqual([])
    // güncelleme günü yalnız nefes ve göz egzersizine bakar: 20 günlük eski Fark Ettin mi? kaydı onu açmaz
    const p = progressionCtx({ sessions: Array.from({ length: 20 }, (_, i) => street(i + 1, { scene: undefined, stage: undefined })), now: at(21), modules: registry.live })
    expect(updateDay(p)).toBe(false)
  })
})
