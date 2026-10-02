import { describe, it, expect } from 'vitest'
import {
  CHANGE_LADDER, nextN, startN, OBJECTS, objectsFor, family, FRAME, makeFrame, hitTest, chooseChanges, planRound, history,
  weekScene, sceneTriple, roundTriple, wasCatch, pickFact, TEXT_IDS,
} from './streetChange.js'
import { genStreet, makeRecord, isStreet, nextLevel, sceneStage, SCENE_IDS, SCENE_TARGETS, TEMPLATES, FACTS } from './street.js'
import { itemBox, overlaps, SCENES } from './streetScenes.js'
import { sceneSVG } from './streetSvg.js'
import { dayKey } from './calendar.js'
import { calendarDaysBetween } from './today.js'
import { seedHash } from './progression.js'
import { say } from './streetText.js'

const START = new Date('2026-06-01T12:00:00')
const dayAt = (d) => new Date(START.getTime() + d * 86400000)

describe('merdiven: 8\'den başlar, +2 / aynı / −2, 6–30', () => {
  it('adımlar ve sınırlar', () => {
    expect(CHANGE_LADDER).toMatchObject({ start: 8, min: 6, max: 30 })
    expect(nextN(8, { looks: 1, found: true })).toBe(10)
    expect(nextN(8, { looks: 2, found: true })).toBe(8)
    expect(nextN(8, { looks: 3, found: false })).toBe(6)
    expect(nextN(8, { looks: 3, found: true })).toBe(6) // üçüncü bakış bulunamamış sayılır (VARSAYIM)
    expect(nextN(6, { looks: 3, found: false })).toBe(6)
    expect(nextN(30, { looks: 1, found: true })).toBe(30)
    expect(nextN(29, { looks: 1, found: true })).toBe(30)
  })
  it('son değer sonraki turun başlangıcı; eski kayıt ya da hiç kayıt yoksa 8', () => {
    expect(startN([])).toBe(8)
    expect(startN([{ type: 'street', noticed: 2, asked: 3, date: '2026-05-01T10:00:00Z' }])).toBe(8)
    const rec = (date, changes) => ({ type: 'street', noticed: 1, asked: 2, date, changes })
    const s = [rec('2026-05-02T10:00:00Z', [{ n: 8, looks: 1, found: true }, { n: 10, looks: 1, found: true }]), rec('2026-05-01T10:00:00Z', [{ n: 20, looks: 1, found: true }])]
    expect(startN(s)).toBe(12)
  })
})

describe('Ne değişti? karesi', () => {
  const kinds = ['renk', 'gelir', 'gider', 'yer', 'tabela']
  const cases = []
  for (const scene of SCENE_IDS) {
    const model = genStreet(77, 3, { scene, taskId: SCENE_TARGETS[scene][0], subjects: [] })
    for (const obj of objectsFor(scene)) for (const kind of OBJECTS[obj].kinds.filter((k) => kinds.includes(k))) cases.push({ scene, model, obj, kind })
  }
  it('her sahnede ≥ 24 değişebilen nesne (§9c madde 3: son 5 turun 20 nesnesi dışında hep seçenek kalır)', () => {
    for (const scene of SCENE_IDS) expect(objectsFor(scene).length, scene).toBeGreaterThanOrEqual(24)
  })
  it('nesne sayısı tam n; değişen nesne tek başına (dokunma kutusu ≥ 60 birim, başka nesneye değmez); hepsi karede', () => {
    let k = 0
    for (const c of cases) {
      for (const n of [6, 8, 14, 22, 30]) {
        const spec = { obj: c.obj, kind: c.kind, anchor: 1 + (k % 5), seed: 1000 + k++ }
        const f = makeFrame(c.model, spec, n)
        const tag = `${c.scene} ${c.obj} ${c.kind} n${n}`
        expect(f.n, tag).toBe(n)
        expect(f.view).toMatchObject({ vw: FRAME.vw, vh: FRAME.vh })
        expect(f.view.vw / f.view.vh).toBeCloseTo(4 / 5)
        expect(f.hit.length).toBeGreaterThanOrEqual(1)
        for (const h of f.hit) {
          expect(h.w, tag).toBeGreaterThanOrEqual(60)
          expect(h.h, tag).toBeGreaterThanOrEqual(60)
        }
        for (const state of [f.before, f.after]) {
          const others = state.items.filter((it) => !isTarget(it, f, state))
          for (const it of others) for (const h of f.hit) expect(overlaps(itemBox(it), h, 0), `${tag} örtüşme`).toBe(false)
          for (const it of state.items) {
            const b = itemBox(it)
            expect(b.x >= f.view.vx && b.x + b.w <= f.view.vx + f.view.vw && b.y >= f.view.vy && b.y + b.h <= f.view.vy + f.view.vh, `${tag} karede`).toBe(true)
          }
        }
        expectOneChange(f, tag)
      }
    }
  })
  it('aynı tohum aynı kare; çizim iki görüntüyü de verir; dokunma testi', () => {
    const m = genStreet(5, 2, { scene: 'cadde', taskId: 'cat', subjects: [] })
    const spec = { obj: 'bike', kind: 'yer', anchor: 2, seed: 99 }
    expect(makeFrame(m, spec, 12)).toEqual(makeFrame(m, spec, 12))
    const f = makeFrame(m, spec, 12)
    const a = sceneSVG(f.before, { ...f.view, motion: false })
    const b = sceneSVG(f.after, { ...f.view, motion: false })
    expect(a).toContain('viewBox="' + [f.view.vx, f.view.vy, 376, 470].join(' ') + '"')
    expect(a).not.toBe(b)
    const h = f.hit[1]
    expect(hitTest(f, h.x + h.w / 2, h.y + h.h / 2)).toBe(true)
    expect(hitTest(f, f.view.vx - 50, 0)).toBe(false)
  })
})

// değişen nesneyi bul: iki görüntü arasında farklı olan
function isTarget(it, f, state) {
  const other = state === f.before ? f.after : f.before
  return !other.items.some((x) => JSON.stringify(x) === JSON.stringify(it))
}
function expectOneChange(f, tag) {
  const key = (it) => JSON.stringify(it)
  const A = new Set(f.before.items.map(key))
  const B = new Set(f.after.items.map(key))
  const onlyA = f.before.items.filter((it) => !B.has(key(it)))
  const onlyB = f.after.items.filter((it) => !A.has(key(it)))
  if (OBJECTS[f.obj].on === 'building') {
    expect(onlyA.length + onlyB.length, tag).toBe(0)
    const diff = f.before.buildings.filter((b, i) => JSON.stringify(b) !== JSON.stringify(f.after.buildings[i]))
    expect(diff, tag).toHaveLength(1)
    if (f.kind === 'tabela') {
      const [x, y] = [f.change.from, f.change.to]
      expect(x.length).toBe(y.length)
      expect([...x].filter((ch, i) => ch !== y[i]), tag).toHaveLength(1)
    }
    return
  }
  expect(JSON.stringify(f.before.buildings ?? null)).toBe(JSON.stringify(f.after.buildings ?? null))
  if (f.kind === 'gelir' && !OBJECTS[f.obj].on) expect([onlyA.length, onlyB.length], tag).toEqual([0, 1])
  else if (f.kind === 'gider' && !OBJECTS[f.obj].on) expect([onlyA.length, onlyB.length], tag).toEqual([1, 0])
  else expect([onlyA.length, onlyB.length], tag).toEqual([1, 1])
}

describe('§9c madde 3: kare seçimi', () => {
  it('tür ailesi en çok iki kez; nesneler farklı; kare sayısı basamaktan; tabela yalnız V2\'den', () => {
    const r = ((s) => () => ((s = (s * 16807) % 2147483647) / 2147483647))(7)
    for (const scene of SCENE_IDS) {
      for (const frames of [3, 4]) {
        for (const kinds of [['renk', 'gelir', 'gider', 'yer'], ['renk', 'gelir', 'gider', 'yer', 'tabela']]) {
          const c = chooseChanges([], scene, { frames, kinds }, r)
          expect(c).toHaveLength(frames)
          expect(new Set(c.map((x) => x.obj)).size).toBe(frames)
          const fam = {}
          for (const x of c) fam[family(x.kind)] = (fam[family(x.kind)] ?? 0) + 1
          expect(Math.max(...Object.values(fam))).toBeLessThanOrEqual(2)
          if (!kinds.includes('tabela')) expect(c.some((x) => x.kind === 'tabela')).toBe(false)
        }
      }
    }
  })
})

// ---------- 90 günlük tohumlu simülasyon (§9c madde 1–6) ----------
function simulate({ legacyDays = 0, days = 90, salt = 'a', skip = () => false }) {
  const sessions = []
  for (let d = 0; d < legacyDays; d++) sessions.push({ type: 'street', date: dayAt(d - legacyDays).toISOString(), seed: d, level: 2, taskId: 'blueCar', count: 3, countAnswer: 3, task: 1, noticed: 2, guessedRight: 0, asked: 3, answers: [{ id: 'laugh', ok: true, guess: false }, { id: 'hat', ok: true, guess: false }, { id: 'shop', ok: false, guess: false }], seconds: 70 })
  const log = []
  for (let d = 0; d < days; d++) {
    if (skip(d)) continue
    const now = dayAt(d)
    const seed = seedHash(`${salt}:${d}`)
    const plan = planRound({ sessions, now, seed })
    const r = ((s) => () => ((s = (s * 48271) % 2147483647) / 2147483647))(seed % 2147483646 + 1)
    let n = plan.startN
    const changes = plan.frames.map((spec) => {
      const f = makeFrame(plan.street, spec, n)
      const looks = 1 + Math.floor(r() * 3)
      const found = r() < 0.75
      const c = { n: f.n, looks, found, kind: spec.kind, obj: spec.obj }
      n = nextN(n, c)
      return c
    })
    const answers = plan.questions.map((q) => {
      const saw = ['vardi', 'yoktu', 'emin-degil'][Math.floor(r() * 3)]
      if (q.catch) return { id: q.id, saw, catch: true, ok: saw === 'yoktu', guess: false }
      return { id: q.id, saw, similar: q.similar, ok: r() < 0.6, guess: saw !== 'vardi' }
    })
    const rec = makeRecord({ street: plan.street, countAnswer: plan.street.counts[plan.taskId], answers, seconds: 120, changes, fact: plan.fact?.id ?? null, factOpen: plan.fact ? r() < 0.5 : false }, now)
    log.push({ d, now, plan, rec, before: [...sessions] })
    sessions.push(rec)
  }
  return { sessions, log }
}

describe('90 günlük simülasyon: §9c madde 1–6 hiç çiğnenmez; (sahne, hedef, soru seti) üçlüsü tekrar etmez', () => {
  const runs = [
    ['yeni kullanıcı, her gün', simulate({})],
    ['yeni kullanıcı, başka tohum', simulate({ salt: 'b' })],
    ['eski kullanıcı (20 gün eski kayıt), her gün', simulate({ legacyDays: 20, salt: 'c' })],
    ['yeni kullanıcı, yolda haftada 3 gün', simulate({ salt: 'd', days: 180, skip: (d) => ![0, 2, 4].includes(d % 7) })],
  ]
  for (const [name, { sessions, log }] of runs) {
    it(name, () => {
      const triples = new Set()
      let catches = 0
      let prevCatch = false
      for (const { d, now, plan, rec, before } of log) {
        const hist = history(before, now)
        const today = dayKey(now)
        const stage = sceneStage(before, now)
        const prev = hist.at(-1)
        const prevScene = prev ? prev.scene ?? 'cadde' : null
        const tag = `${name} gün ${d}`
        // madde 1: aynı sahne art arda gelmez (açık seçenek varken); üçlü 14 günde tekrar etmez (seçenek varken)
        expect(stage.scenes).toContain(plan.scene)
        if (stage.scenes.length >= 2) expect(plan.scene, tag).not.toBe(prevScene)
        const recent = new Set(hist.filter((s) => calendarDaysBetween(dayKey(new Date(s.date)), today) < 14).map((s) => sceneTriple(s.scene ?? 'cadde')))
        const alt = stage.scenes.filter((s) => s !== prevScene && !recent.has(sceneTriple(s)))
        const week = weekScene(hist, stage, now)
        if (alt.length && plan.scene !== week) expect(recent.has(sceneTriple(plan.scene)), `${tag} 14 gün`).toBe(false)
        // madde 5: her 7. tur haftanın sahnesi
        if (week && week !== prevScene) expect(plan.scene, `${tag} haftanın sahnesi`).toBe(week)
        // madde 2: sayma hedefi son 7 turda yok
        expect(hist.slice(-7).map((s) => s.taskId), tag).not.toContain(plan.taskId)
        expect(SCENE_TARGETS[plan.scene]).toContain(plan.taskId)
        // madde 3: kare sayısı, tür ailesi ≤ 2, nesne son 5 turda yok ve tur içinde tekil
        expect(rec.changes).toHaveLength(stage.frames)
        const fam = {}
        for (const c of rec.changes) fam[family(c.kind)] = (fam[family(c.kind)] ?? 0) + 1
        expect(Math.max(...Object.values(fam)), tag).toBeLessThanOrEqual(2)
        expect(new Set(rec.changes.map((c) => c.obj)).size).toBe(rec.changes.length)
        const old5 = new Set(hist.slice(-5).flatMap((s) => (s.changes ?? []).map((c) => c.obj)))
        for (const c of rec.changes) {
          expect(old5.has(c.obj), `${tag} nesne ${c.obj}`).toBe(false)
          expect(stage.kinds).toContain(c.kind)
          expect(c.n).toBeGreaterThanOrEqual(6)
          expect(c.n).toBeLessThanOrEqual(30)
        }
        expect(rec.changes[0].n, `${tag} başlangıç`).toBe(startN(hist))
        // madde 4: şablon son 3 turda yok; yakalama iki tur üst üste değil
        expect(rec.askedIds).toHaveLength(2)
        const old3 = new Set(hist.slice(-3).flatMap((s) => s.askedIds ?? (s.answers ?? []).map((a) => a.id)))
        for (const id of rec.askedIds) {
          expect(old3.has(id), `${tag} şablon ${id}`).toBe(false)
          expect(TEMPLATES[id].scenes).toContain(plan.scene)
        }
        const isCatch = wasCatch(rec)
        expect(isCatch && prevCatch, `${tag} yakalama üst üste`).toBe(false)
        expect(rec.answers.filter((a) => a.catch).length).toBeLessThanOrEqual(1)
        if (isCatch) catches++
        prevCatch = isCatch
        // madde 6: bilim kartı 7 günde tekrar etmez, açılan kart 30 gün dinlenir
        if (rec.fact) {
          for (const s of hist.filter((x) => x.fact === rec.fact)) {
            const ago = calendarDaysBetween(dayKey(new Date(s.date)), today)
            expect(ago, `${tag} kart`).toBeGreaterThanOrEqual(7)
            if (s.factOpen) expect(ago, `${tag} açılan kart`).toBeGreaterThanOrEqual(30)
          }
          expect(FACTS.map((f) => f.id)).toContain(rec.fact)
        }
        // üçlü hiç tekrar etmez
        const tri = roundTriple(rec.scene, rec.taskId, rec.askedIds)
        expect(triples.has(tri), `${tag} üçlü ${tri}`).toBe(false)
        triples.add(tri)
        // kayıt geriye uyumlu
        expect(isStreet(rec)).toBe(true)
        expect(rec.level).toBe(stage.level)
      }
      const rate = catches / log.length
      expect(rate).toBeGreaterThan(0.2)
      expect(rate).toBeLessThan(0.45)
      expect(nextLevel(sessions, dayAt(400))).toBeGreaterThanOrEqual(1)
    })
  }
  it('bütün sahneler ve değişiklik türleri zamanla gelir; aynı girdi aynı tur', () => {
    const { log } = runs[0][1]
    expect(new Set(log.map((l) => l.plan.scene))).toEqual(new Set(SCENE_IDS))
    expect(new Set(log.flatMap((l) => l.rec.changes.map((c) => c.kind)))).toEqual(new Set(['renk', 'gelir', 'gider', 'yer', 'tabela']))
    const { before, now, plan } = log[40]
    const again = planRound({ sessions: before, now, seed: plan.seed })
    expect(JSON.stringify(again)).toBe(JSON.stringify(plan))
  })
  it('eski kayıtlarla: isStreet, nextLevel ve tur planı çalışır', () => {
    const old = [{ type: 'street', date: '2026-05-30T09:00:00Z', noticed: 2, asked: 3, task: 1, level: 3 }, { type: 'street', date: '2026-05-31T09:00:00Z', noticed: 1, asked: 3, task: 0.5, level: 3 }]
    expect(old.every(isStreet)).toBe(true)
    expect(nextLevel(old, START)).toBe(2)
    const p = planRound({ sessions: old, now: START, seed: 5 })
    expect(p.scene).toBe('cadde')
    expect(p.startN).toBe(8)
    expect(p.questions).toHaveLength(2)
  })
})

describe('mantık metinleri kimlikle', () => {
  it('turun metin kimlikleri METINLER kimlikleri; onaysız olanlar ekrana boş döner', () => {
    const p = planRound({ sessions: [], now: START, seed: 3 })
    expect(p.text.change.ask).toBe('D2')
    expect(p.text.missed.saw).toBe('G2')
    for (const group of Object.values(TEXT_IDS)) for (const id of Object.values(group)) if (!['M5', 'M6', 'R6'].includes(id)) expect(say(id), id).toBeNull()
    expect(say(p.text.intro.start)).toBe('Yürümeye başla')
  })
  it('pickFact: hiç kart yoksa sırayla, uygun kart yoksa null', () => {
    expect(pickFact([], START).id).toBe(FACTS[0].id)
    const all = FACTS.map((f, i) => ({ type: 'street', date: dayAt(-i - 1).toISOString(), fact: f.id, factOpen: true }))
    expect(pickFact(all, START)).toBeNull()
  })
  it('sahne paletleri tanımlı', () => {
    for (const sc of SCENE_IDS) expect(['day', 'dusk', 'rain']).toContain(SCENES[sc].mode)
  })
})

describe('aynı gün ikinci tur', () => {
  it('ilk turu görür: sahne, hedef ve üçlü tekrar etmez', () => {
    const { sessions } = simulate({ days: 12, salt: 'e' })
    const now = new Date(dayAt(11).getTime() + 3600000)
    const p = planRound({ sessions, now, seed: 4242 })
    const first = sessions.at(-1)
    expect(p.scene).not.toBe(first.scene)
    expect(p.taskId).not.toBe(first.taskId)
    expect(roundTriple(p.scene, p.taskId, p.questions.map((q) => q.id))).not.toBe(roundTriple(first.scene, first.taskId, first.askedIds))
  })
})
