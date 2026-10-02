import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  genStreet, makeQuestions, countOptions, taskScore, scoreRound, nextLevel, makeRecord, optionLabel, FACTS, factFor, isStreet,
  LEVELS, TASKS, CLOTH, SCENE_IDS, SCENE_TARGETS, TEMPLATES, templatesFor, sceneStage, changeNOf, missedQuestion, countAll, VH, WALK_VY,
} from './street.js'
import { streetSVG, sceneSVG, car, cat, bike } from './streetSvg.js'
import { H, Y, SIGN, SKY_MAX, PERSON_TOP, renderScene, backdrop, itemBox, signBox, treeBoxes, lampBoxes, headBox, overlaps, SCENES } from './streetScenes.js'
import { TEXTS, say, isApproved, textOr, optionText } from './streetText.js'
import { LADDERS } from './ladders.js'

const SEEDS = Array.from({ length: 200 }, (_, i) => i * 7919 + 13)
const NOW = new Date('2026-10-02T12:00:00')
const ago = (d) => new Date(NOW.getTime() - d * 86400000).toISOString()

describe('cadde üretimi', () => {
  it('aynı tohum aynı cadde; farklı tohum farklı', () => {
    expect(genStreet(42, 1)).toEqual(genStreet(42, 1))
    expect(JSON.stringify(genStreet(42, 1))).not.toBe(JSON.stringify(genStreet(43, 1)))
    const o = { scene: 'pazar', taskId: 'watermelon', subjects: ['laugh', 'stall'] }
    expect(genStreet(7, 3, o)).toEqual(genStreet(7, 3, o))
  })
  it('soruların konusu caddede tek: tek gülen kadın, tek sarışın kadın, tek çocuklu, tek şapkalı, tek yeşil tente, tek satıcı', () => {
    for (const lv of [1, 2, 3, 4, 5]) {
      for (const seed of SEEDS) {
        const s = genStreet(seed, lv)
        expect(s.people.filter((p) => p.laugh)).toHaveLength(1)
        expect(s.people.filter((p) => p.g === 'k' && p.hair === 'sari')).toHaveLength(1)
        expect(s.people.filter((p) => p.child)).toHaveLength(1)
        expect(s.people.filter((p) => p.hat)).toHaveLength(s.task.id === 'hat' ? s.counts.hat : 1)
        expect(s.buildings.filter((b) => b.aw === 'yesil')).toHaveLength(1)
        expect(s.vendors).toHaveLength(1)
        expect(Object.values(s.special).every((p) => Number.isFinite(p.x))).toBe(true)
        expect(Number.isFinite(s.vendors[0].x)).toBe(true)
      }
    }
  })
  it('sayılacak şey en az 2; sayımlar cadde ile tutarlı', () => {
    for (const seed of SEEDS) {
      const s = genStreet(seed, 1)
      expect(s.counts.blueCar).toBeGreaterThanOrEqual(2)
      expect(s.counts.taxi).toBeGreaterThanOrEqual(2)
      expect(s.counts.cat).toBe(s.cats.length)
      expect(s.counts.bike).toBe(s.bikes.length)
      expect(TASKS.map((t) => t.id)).toContain(s.task.id)
    }
  })
  it('her sahnede ≥ 8 sayma hedefi; her hedef 2–6 kez ve sayım çizim modelinden', () => {
    for (const scene of SCENE_IDS) {
      expect(SCENE_TARGETS[scene].length, scene).toBeGreaterThanOrEqual(8)
      for (const taskId of SCENE_TARGETS[scene]) {
        for (const seed of SEEDS.slice(0, 25)) {
          const s = genStreet(seed, 3, { scene, taskId, subjects: templatesFor(scene, taskId).slice(0, 3) })
          expect(s.task.id).toBe(taskId)
          expect(s.counts[taskId], `${scene} ${taskId} ${seed}`).toBeGreaterThanOrEqual(2)
          expect(s.counts[taskId], `${scene} ${taskId} ${seed}`).toBeLessThanOrEqual(6)
          expect(countAll(s)).toEqual(s.counts)
        }
      }
    }
  })
  it('seviye (sahne basamağı) kalabalığı artırır; yürüyüş 35–40 sn', () => {
    expect(genStreet(5, 5).people.length).toBeGreaterThan(genStreet(5, 1).people.length)
    for (const lv of [1, 2, 3, 4, 5]) {
      expect(LEVELS[lv].walkSec).toBeGreaterThanOrEqual(35)
      expect(LEVELS[lv].walkSec).toBeLessThanOrEqual(40)
    }
  })
  it('arabalar kendi hızında akar: şerit başına tek hız (birbirine binmez), kamera her arabaya yetişir', () => {
    for (const seed of SEEDS.slice(0, 50)) {
      const s = genStreet(seed, 1)
      const T = s.walkSec
      const V = (s.L - 300) / T
      for (const lane of ['far', 'near']) {
        const cars = s.cars.filter((c) => c.lane === lane)
        expect(new Set(cars.map((c) => c.v)).size).toBe(1)
        expect(cars[0].v).toBeLessThan(V)
      }
      // sağa akan (yakın şerit) araba, yürüyüş bitmeden kameranın sağ kenarına girer
      for (const c of s.cars.filter((k) => k.lane === 'near')) expect(c.x).toBeLessThanOrEqual(s.L - c.v * T - 200)
    }
  })
})

describe('sorular', () => {
  it('3 soru, her biri 4 farklı seçenek ve doğru cevap seçeneklerde', () => {
    for (const seed of SEEDS) {
      const s = genStreet(seed, 2)
      expect(s.questions).toHaveLength(3)
      expect(new Set(s.questions.map((q) => q.id)).size).toBe(3)
      for (const q of s.questions) {
        expect(q.opts).toHaveLength(4)
        expect(new Set(q.opts).size).toBe(4)
        expect(q.opts).toContain(q.a)
        for (const v of q.opts) expect(optionLabel(q, v).length).toBeGreaterThan(1)
      }
    }
  })
  it('cevaplar caddeyle tutarlı', () => {
    const s = genStreet(99, 1)
    const all = makeQuestions(s)
    for (const q of all) {
      if (q.id === 'laugh') expect(q.a).toBe(s.people.find((p) => p.laugh).top)
      if (q.id === 'child') expect(q.a).toBe(s.people.find((p) => p.child).child)
      if (q.id === 'shop') expect(q.a).toBe(s.buildings.find((b) => b.aw === 'yesil').shop)
      if (q.kind === 'color') expect([...CLOTH, 'kirmizi']).toContain(q.a)
    }
  })
  it('sayı seçenekleri: 4 ardışık, doğru içinde, negatif yok', () => {
    for (const n of [0, 1, 2, 5, 9]) {
      for (let k = 0; k < 20; k++) {
        const o = countOptions(n)
        expect(o).toHaveLength(4)
        expect(o).toContain(n)
        expect(Math.min(...o)).toBeGreaterThanOrEqual(0)
      }
    }
  })
  it('Gözünden kaçan: sahne başına ≥ 12 şablon; konu sahnede tek ve cevap sahneyle tutarlı; yakalamada konu yok', () => {
    for (const scene of SCENE_IDS) expect(Object.keys(TEMPLATES).filter((id) => TEMPLATES[id].scenes.includes(scene)).length, scene).toBeGreaterThanOrEqual(12)
    for (const scene of SCENE_IDS) {
      for (const seed of SEEDS.slice(0, 20)) {
        const taskId = SCENE_TARGETS[scene][seed % 8]
        const ids = templatesFor(scene, taskId)
        const s = genStreet(seed, 4, { scene, taskId, subjects: ids })
        for (const id of ids) {
          const q = missedQuestion(s, id)
          expect(q.a, `${scene} ${id}`).not.toBeNull()
          expect(q.opts).toContain(q.a)
          expect(new Set(q.opts).size).toBe(q.opts.length)
          expect(q.opts.length).toBeGreaterThanOrEqual(4)
        }
        // konu tek: aynı özellikte ikinci kişi yok
        expect(s.people.filter((p) => p.laugh)).toHaveLength(1)
        expect(s.people.filter((p) => p.beard)).toHaveLength(1)
        expect(s.people.filter((p) => p.cane)).toHaveLength(1)
        expect(s.people.filter((p) => p.instrument)).toHaveLength(1)
        expect(s.people.filter((p) => p.scarf)).toHaveLength(1)
        // yakalama: konu hiç yok
        const without = genStreet(seed, 4, { scene, taskId, subjects: ids.filter((x) => x !== 'laugh' && x !== 'beard'), absent: ['laugh', 'beard'] })
        expect(without.people.filter((p) => p.laugh || p.beard)).toHaveLength(0)
        expect(missedQuestion(without, 'laugh', { catch: true })).toMatchObject({ catch: true, a: null, opts: [] })
      }
    }
  })
})

describe('puan, seviye ve kayıt', () => {
  it('görev: tam 1, bir eksik/fazla ½, yoksa 0; tahmin ayrı; yakalama sorusu fark etme sayısına girmez', () => {
    expect(taskScore(4, 4)).toBe(1)
    expect(taskScore(5, 4)).toBe(0.5)
    expect(taskScore(1, 4)).toBe(0)
    const r = scoreRound({ countAnswer: 4, n: 4, answers: [{ ok: true, guess: false }, { ok: true, guess: true }, { ok: false, guess: false }] })
    expect(r).toEqual({ task: 1, noticed: 1, guessedRight: 1, asked: 3 })
    expect(scoreRound({ countAnswer: 1, n: 4, answers: [{ ok: true, guess: false }, { ok: true, catch: true }] })).toEqual({ task: 0, noticed: 1, guessedRight: 0, asked: 1 })
  })
  it('seviye = sahne basamağı (LADDERS F1..F5 → 1..5): D ayrı gün; bugün sayılmaz; eski kayıtlarla da', () => {
    const rec = (d, extra = {}) => ({ type: 'street', noticed: 1, asked: 3, task: 1, level: 1, date: ago(d), ...extra })
    expect(nextLevel([], NOW)).toBe(1)
    const days = (n, extra) => Array.from({ length: n }, (_, i) => rec(n - i, extra))
    expect([0, 1, 2, 3, 4, 6, 7, 9, 10, 30].map((n) => nextLevel(days(n), NOW))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5])
    // aynı gün iki tur bir gün sayılır; bugünkü tur sayılmaz
    expect(nextLevel([rec(1), rec(1), rec(2), { ...rec(0) }], NOW)).toBe(2)
    // eski kayıt (date ve tür dışında alan yok) da sayılır; tarihsiz kayıt sayılmaz
    expect(nextLevel([{ type: 'street', date: ago(3) }, { type: 'street' }, { type: 'street', date: ago(2) }], NOW)).toBe(2)
    expect(isStreet({ type: 'street', noticed: 2, asked: 3, date: ago(1) })).toBe(true)
    // 14 gün ara: bir basamak aşağı (yumuşak dönüş, lib/progression.js stageOf)
    expect(nextLevel(Array.from({ length: 12 }, (_, i) => rec(40 - i)), NOW)).toBe(4)
  })
  it('sahne merdiveni PLAN §2: F1 Cadde 3 kare, F2 4 kare, F3 Pazar, F4 Park, F5 Akşam; V1 yağmur, V2 tabela', () => {
    const l = LADDERS['fark-ettin']
    expect(l.steps.map((s) => [s.id, s.from, s.frames])).toEqual([['F1', 0, 3], ['F2', 2, 4], ['F3', 4, 4], ['F4', 7, 4], ['F5', 10, 4]])
    expect(l.steps.at(-1).scenes).toEqual(['cadde', 'pazar', 'park', 'aksam'])
    expect(l.variants.map((v) => [v.id, v.from, v.scene ?? v.kind])).toEqual([['V1', 14, 'yagmur'], ['V2', 21, 'tabela']])
    const fresh = (n) => Array.from({ length: n }, (_, i) => ({ type: 'street', scene: 'cadde', stage: 'F1', noticed: 0, asked: 2, date: ago(n - i) }))
    expect(sceneStage(fresh(13), NOW).scenes).not.toContain('yagmur')
    expect(sceneStage(fresh(14), NOW).scenes).toContain('yagmur')
    expect(sceneStage(fresh(20), NOW).kinds).not.toContain('tabela')
    expect(sceneStage(fresh(21), NOW).kinds).toContain('tabela')
    // eski kullanıcı (stage alanı olmayan 30 gün): Dvar = 14 → yağmur var, tabela 7 yeni günden sonra
    const old = Array.from({ length: 30 }, (_, i) => ({ type: 'street', noticed: 0, asked: 3, date: ago(30 - i) }))
    expect(sceneStage(old, NOW).scenes).toContain('yagmur')
    expect(sceneStage(old, NOW).kinds).not.toContain('tabela')
  })
  it('kayıt: eski alanlar aynen, yeni alanlar eklenir; changeN ilk ya da ikinci bakışta bulunan en kalabalık kare', () => {
    const s = genStreet(7, 1)
    const rec = makeRecord({ street: s, countAnswer: s.counts[s.task.id], answers: [{ id: 'a', ok: true, guess: false }], seconds: 61.2 })
    expect(rec).toMatchObject({ type: 'street', seed: 7, level: 1, stage: 'F1', task: 1, noticed: 1, asked: 1, seconds: 61, scene: 'cadde', changeN: null, changes: [], askedIds: ['a'] })
    expect(rec.answers[0]).toEqual({ id: 'a', ok: true, guess: false, saw: null, similar: false, catch: false })
    expect(isStreet(rec)).toBe(true)
    const changes = [{ n: 8, looks: 1, found: true, kind: 'renk', obj: 'hat' }, { n: 10, looks: 2, found: true, kind: 'yer', obj: 'cat' }, { n: 10, looks: 3, found: true, kind: 'gider', obj: 'pot' }, { n: 12, looks: 3, found: false, kind: 'renk', obj: 'bag' }]
    const r2 = makeRecord({ street: s, countAnswer: 0, answers: [{ id: 'laugh', ok: true, guess: false, saw: 'vardi', similar: true }, { id: 'beard', ok: true, catch: true, saw: 'yoktu' }], changes, fact: 'gorilla', factOpen: true })
    expect(r2.changeN).toBe(10)
    expect(r2.changes).toEqual(changes)
    expect(r2).toMatchObject({ asked: 1, noticed: 1, askedIds: ['laugh', 'beard'], fact: 'gorilla', factOpen: true })
    expect(r2.answers[1]).toMatchObject({ saw: 'yoktu', catch: true })
    expect(changeNOf([{ n: 12, looks: 3, found: true }])).toBeNull()
    expect(changeNOf([])).toBeNull()
  })
})

describe('bilim kartları', () => {
  it('her kartta kaynak ve DOI; sırayla gelir', () => {
    for (const f of FACTS) expect(f.doi).toMatch(/^10\.\d{4,}\//)
    expect(factFor([]).id).toBe(FACTS[0].id)
    expect(factFor([{ type: 'street', noticed: 1 }]).id).toBe(FACTS[1].id)
  })
})

describe('çizim (lib/streetScenes.js motoru)', () => {
  it('çizim: geçerli SVG, bütün dükkân adları ve özel kişiler içinde; yürüyüş bandı eski ekranın oranında', () => {
    const s = genStreet(123, 1)
    const svg = streetSVG(s)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
    for (const b of s.buildings) expect(svg).toContain(`>${b.shop}<`)
    expect(svg).toContain(`viewBox="0 ${WALK_VY} ${s.L} ${VH}"`)
    expect(svg).not.toContain('ha ha') // gülme yüzle çizilir (kapı tur 1)
    expect((svg.match(/class="fe-go/g) ?? []).length).toBeGreaterThanOrEqual(s.people.length - 2)
  })
  it('beş sahne, iki palet (gündüz, akşam) ve yağmur: hepsi çizilir; kırpım vx, vy, vw, vh', () => {
    for (const scene of SCENE_IDS) {
      const s = genStreet(31, 3, { scene, taskId: SCENE_TARGETS[scene][0], subjects: templatesFor(scene, SCENE_TARGETS[scene][0]).slice(0, 4) })
      const svg = sceneSVG(s, { vx: 400, vy: 300, vw: 376, vh: 470 })
      expect(svg).toContain('viewBox="400 300 376 470"')
      expect(svg).toContain(`fe-${SCENES[scene].mode}-sky`)
      if (scene === 'yagmur') expect(svg).toContain('fe-rain')
    }
    expect(SCENES.aksam.mode).toBe('dusk')
    expect(sceneSVG(genStreet(1, 1), { mode: 'dusk' })).toContain('fe-dusk-sky')
  })
  it('hareket: kişiler adım atar, arabalar akar; prefers-reduced-motion\'da durur; hareketsiz kare stilsiz', () => {
    const s = genStreet(9, 2)
    const svg = streetSVG(s)
    expect(svg).toContain('fe-step')
    expect(svg).toContain('class="fe-drive"')
    expect(svg).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[^}]*\.fe-go[^}]*\.fe-drive[^}]*animation:none/)
    const still = sceneSVG(s, { motion: false })
    expect(still).not.toContain('<style>')
    expect(still).not.toContain('fe-drive')
  })
  it('gök ≤ %20: her sahnede bina çatıları ekranın üst %20\'sinde', () => {
    for (const scene of SCENE_IDS) {
      for (const seed of SEEDS.slice(0, 40)) {
        const m = backdrop(scene, seed, 2600)
        const tops = (m.buildings ?? m.back).map((b) => Y.side - b.h)
        expect(Math.max(...tops), scene).toBeLessThanOrEqual(SKY_MAX * H)
      }
    }
  })
  it('tabela kutusu ağaç, lamba ve kişi kutularıyla kesişmez (ağaç ve lamba bina aralarında, tabela kişi başının üstünde)', () => {
    for (const scene of SCENE_IDS.filter((sc) => SCENES[sc].kind === 'street')) {
      for (const seed of SEEDS) {
        const s = genStreet(seed, 1 + (seed % 5), { scene, taskId: SCENE_TARGETS[scene][seed % 8], subjects: templatesFor(scene, SCENE_TARGETS[scene][seed % 8]) })
        const signs = s.buildings.map(signBox)
        const blocks = [...s.trees.flatMap(treeBoxes), ...s.lamps.flatMap(lampBoxes)]
        const people = [...s.people, ...(s.items ?? []), ...s.vendors.map((v) => ({ ...v, type: 'vendor' }))]
        for (const sg of signs) {
          for (const b of blocks) expect(overlaps(sg, b), `${scene} ${seed} ağaç/lamba`).toBe(false)
          for (const p of people) {
            const box = p.type ? itemBox(p) : headBox(p)
            expect(overlaps(sg, box), `${scene} ${seed} kişi`).toBe(false)
          }
        }
        // kişiler yürürken de: en yüksek noktaları tabela altından aşağıda (yalnız y'ye bağlı)
        for (const p of s.people) expect(p.y - PERSON_TOP * (p.s || 1)).toBeGreaterThan(SIGN.top + SIGN.h)
      }
    }
  })
  it('pazar tezgâhı satıcıları tezgâh levhasının altında; park kişileri yolda', () => {
    for (const seed of SEEDS.slice(0, 40)) {
      const s = genStreet(seed, 3, { scene: 'pazar', taskId: 'hatVendor', subjects: ['laugh'] })
      for (const v of s.stallVendors) expect(v.y - PERSON_TOP).toBeGreaterThan(402)
      expect(s.counts.hatVendor).toBe(s.stallVendors.filter((v) => v.hat).length)
    }
  })
  it('eski görev simgeleri (bugünkü ekran) aynen', () => {
    expect(car({ x: 30, color: 'mavi' })).toContain('#3E7BFA')
    expect(cat({ x: 0, color: 'turuncu' })).toContain('<g>')
    expect(bike({ x: 0, color: 'mavi' })).toContain('<circle')
    expect(renderScene(genStreet(2, 1), { motion: false }).length).toBeGreaterThan(1000)
  })
})

describe('metinler: onaysız metin ekrana çıkmaz', () => {
  const metinler = readFileSync(new URL('../../../docs/yol-haritasi/tasarim/fark-ettin-mi/METINLER.md', import.meta.url), 'utf8')
  const rows = metinler.split('\n').filter((l) => /^\| [A-ZŞ]\d+ \|/.test(l)).map((l) => l.split('|').map((c) => c.trim()))
  it('METINLER\'deki her kimlik modülde; onaylı olanlar aynen, taslaklar metinsiz', () => {
    expect(rows.length).toBeGreaterThanOrEqual(30)
    for (const r of rows) {
      const id = r[1]
      const status = r.at(-2)
      expect(TEXTS[id], id).toBeTruthy()
      if (status.startsWith('onaylı')) {
        expect(isApproved(id), id).toBe(true)
        expect(say(id)).toBe(r[2])
      } else {
        expect(isApproved(id), id).toBe(false)
        expect(TEXTS[id].text, id).toBeUndefined()
        expect(say(id), id).toBeNull()
        expect(textOr(id)).toBe(`⟨${id}⟩`)
      }
    }
  })
  it('yeni görev, şablon ve seçenek adları onaysız (null); bugünkü görevler ve renk adları onaylı', () => {
    for (const t of TASKS) {
      expect(say(`task.${t.id}`)).toBe(t.text)
      expect(say(`count.${t.id}`)).toBe(t.q)
    }
    for (const id of ['redCar', 'watermelon', 'kite', 'litShop']) expect(say(`task.${id}`)).toBeNull()
    expect(optionText('color', 'laugh', 'mavi')).toBe('mavi')
    expect(optionText('item', 'musician', 'gitar')).toBeNull()
    expect(optionText('stall', 'stall', 'ELMA')).toBeNull()
  })
  it('kaynak dosyalarda taslak cümle yok (bugünkü ekranda zaten olanlar dışında)', () => {
    const sentences = rows.filter((r) => !r.at(-2).startsWith('onaylı')).flatMap((r) => r[2].split(/ \/ |(?<=[.?!]) |— ör\. |"/)).map((x) => x.replace(/["“”]/g, '').trim()).filter((x) => x.length >= 12 && !x.includes('{') && !/^ör\./.test(x))
    expect(sentences.length).toBeGreaterThan(15)
    // bugünkü ekranda zaten olanlar (modül adı, onaylı görev adı, bugünkü soru ve geri bildirim parçaları)
    const today = ['Fark Ettin mi?', 'Mavi arabaları say', 'Elbisesi ne renkti?', 'Fark etmesen de doğru bildin.', 'Beynin görmüş olabilir']
    for (const f of ['../screens/StreetWalk.jsx', './street.js', './streetChange.js', './streetScenes.js', './streetText.js', './streetSvg.js']) {
      const src = readFileSync(new URL(f, import.meta.url), 'utf8')
      for (const x of sentences) if (!today.includes(x)) expect(src.includes(x), `${f}: ${x}`).toBe(false)
    }
  })
})
