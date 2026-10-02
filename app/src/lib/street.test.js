import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  genStreet, makeQuestions, countOptions, taskScore, scoreRound, nextLevel, makeRecord, optionLabel, FACTS, factFor, isStreet,
  LEVELS, TASKS, CLOTH, SAW, SCENE_IDS, SCENE_TARGETS, TEMPLATES, templatesFor, sceneStage, changeNOf, missedQuestion, countAll, VH, WALK_VY, targetXs,
  coverView, coverModel, coverBoxes, coverBlocks, countModel, countView, countPanel, COUNT_VIEW,
} from './street.js'
import { streetSVG, sceneSVG, car, cat, bike, missedCard, missedSubject, subjectThumb } from './streetSvg.js'
import { H, Y, SIGN, SKY_MAX, PERSON_TOP, renderScene, backdrop, itemBox, signBox, treeBoxes, lampBoxes, headBox, overlaps, SCENES, person } from './streetScenes.js'
import { TEXTS, say, textOr, optionText, lines, pastOf, changeSentence, missedLines, taskLines, sceneName, colorName, countRow, resultHead } from './streetText.js'
import { OBJECTS } from './streetChange.js'
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
      expect(s.counts.bike).toBe(s.bikes.length + s.items.filter((it) => it.type === 'bike' || it.type === 'rider').length)
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
  it('targetXs: her hedefin sayısı kadar konum (kapak kırpımı hedefi içerir)', () => {
    for (const scene of SCENE_IDS) for (const taskId of SCENE_TARGETS[scene]) {
      const s = genStreet(11, 3, { scene, taskId, subjects: [] })
      expect(targetXs(s, taskId).length, `${scene} ${taskId}`).toBe(s.counts[taskId])
    }
  })
  it('kapak kırpımı (01/02): yan kenarlar bina/tezgâh sınırında, tabela tam ya da hiç, kenarda bölünen kişi yok, hedef içeride; 390 ve 320 aynı mantık', () => {
    // 390: kutu ≈ 358×260; 320: kutu ≈ 288×170 (oran değişir, kural aynı)
    for (const seed of SEEDS.slice(0, 80)) for (const scene of SCENE_IDS) {
      const taskId = SCENE_TARGETS[scene][seed % SCENE_TARGETS[scene].length]
      const s = genStreet(seed, 1 + (seed % 5), { scene, taskId, subjects: templatesFor(scene, taskId).slice(0, 3) })
      const blocks = coverBlocks(s)
      for (const ratio of [358 / 260, 288 / 170]) {
        const v = coverView(s, taskId, ratio)
        const x1 = v.vx + v.vw
        const tag = `${seed} ${scene} ${taskId} ${ratio.toFixed(2)}`
        expect(blocks.some((b) => b.x === v.vx), tag).toBe(true)
        expect(blocks.some((b) => b.x + b.w === x1), tag).toBe(true)
        expect(v.vw / v.vh).toBeCloseTo(ratio, 6)
        // tabela (cadde dükkânı ve pazar tezgâhı levhası) kenarda kesilmez
        for (const b of [...(s.buildings ?? []).map(signBox), ...(s.stalls ?? [])]) {
          const cut = (x) => b.x < x && b.x + b.w > x
          expect(cut(v.vx) || cut(x1), tag).toBe(false)
        }
        // dikeyde tabela sırası tam içeride
        expect(v.vy).toBeLessThanOrEqual(SIGN.top - 8)
        // kapak modelinde kenarda bölünen kişi ya da öğe yok; en az bir hedef tam içeride
        const m = coverModel(s, v)
        for (const b of coverBoxes(m)) expect((b.x < v.vx - 1 && b.x + b.w > v.vx + 1) || (b.x < x1 - 1 && b.x + b.w > x1 + 1), tag).toBe(false)
        expect(targetXs(m, taskId).some((x) => x > v.vx + 40 && x < x1 - 40), tag).toBe(true)
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
  // "geçti" soruları (mavi araba, sarı taksi, kırmızı araba, bisiklet, bebek arabası): sayılan her hedef gerçekten geçer.
  // Geçmek: yürüyüşün başında ekran ortasının önünde, sonunda arkasında. Kamera (StreetWalk) sahneyi 0'dan L − vw'ye
  // eşit hızla kaydırır: ortası half + (L − 2·half)·t/T. Telefon genişlikleri için half 150–240 birim.
  const passes = (x0, v, s) => {
    const T = s.walkSec
    for (const half of [150, 195, 240]) {
      const t = (x0 - half) / ((s.L - 2 * half) / T - v) // v: işaretli hız (sağa +)
      if (!(t > 0 && t < T)) return false
    }
    return true
  }
  it('geçti: arabalar akar ve her araba kameranın ortasından geçer', () => {
    for (const seed of SEEDS.slice(0, 60)) for (const taskId of ['blueCar', 'taxi', 'redCar']) {
      const s = genStreet(seed, 1 + (seed % 5), { scene: seed % 2 ? 'cadde' : 'aksam', taskId, subjects: [] })
      expect(s.counts[taskId]).toBeGreaterThanOrEqual(2)
      for (const c of s.cars) {
        expect(c.v).toBeGreaterThan(0)
        expect(passes(c.x, c.lane === 'far' ? -c.v : c.v, s)).toBe(true)
      }
    }
  })
  it('geçti: hedef bisiklet sürülür (yolun ön kenarında ya da park yolunda) ve geçer; park bisikleti hiç çizilmez', () => {
    for (const seed of SEEDS.slice(0, 60)) for (const scene of ['cadde', 'aksam', 'park', 'yagmur']) {
      const subjects = templatesFor(scene, 'bike').slice(0, 2)
      const s = genStreet(seed, 3, { scene, taskId: 'bike', subjects })
      const riders = s.items.filter((it) => it.type === 'rider')
      expect(s.bikes).toEqual([])
      expect(s.items.filter((it) => it.type === 'bike')).toEqual([])
      expect(riders.length).toBe(s.counts.bike)
      expect(riders.length).toBeGreaterThanOrEqual(2)
      for (const b of riders) {
        expect(b.v).toBeGreaterThan(0)
        expect(passes(b.x, -b.v, s)).toBe(true)
        if (scene === 'park') expect(b.y).toBeGreaterThan(Y.side + 60)
        else expect(b.y).toBeGreaterThan(Y.lane) // yolda: yakın şeridin önündeki bisiklet şeridi
        expect(b.y).toBeLessThanOrEqual(Y.roadEnd)
      }
      // hareketli çizimde her bisikletli akar (fe-go), şerit çizgisi caddede var
      const svg = renderScene(s, { vx: 0, vy: WALK_VY, vw: s.L, vh: VH, motion: true, walkSec: s.walkSec })
      expect((svg.match(/class="fe-go" style="--t:[\d.]+s;--dx:-/g) ?? []).length).toBeGreaterThanOrEqual(riders.length)
    }
  })
  it('geçti: bebek arabası hep yürüyen biriyle gider; duran bebek arabası yok', () => {
    for (const seed of SEEDS.slice(0, 60)) for (const taskId of ['stroller', 'ball']) {
      const s = genStreet(seed, 4, { scene: 'park', taskId, subjects: [] })
      expect(s.items.filter((it) => it.type === 'stroller')).toEqual([])
      const pushers = s.people.filter((p) => p.stroller)
      expect(pushers.length).toBeGreaterThanOrEqual(1)
      for (const p of pushers) expect(p.walk).not.toBe(false)
      if (taskId === 'stroller') {
        expect(s.counts.stroller).toBe(pushers.length)
        expect(s.counts.stroller).toBeGreaterThanOrEqual(2)
      }
    }
  })
})

describe('tasarım tur 2 aktarımı (04 donmuş kare, cam figür, kırpım seçenekleri)', () => {
  it('04 donmuş kare: sayılan hedef ve soru konusu yok; sokak seviyesi (tabela sırasından yolun sonuna), caddenin sonu', () => {
    for (const seed of SEEDS.slice(0, 40)) for (const scene of SCENE_IDS) {
      const taskId = SCENE_TARGETS[scene][seed % SCENE_TARGETS[scene].length]
      const s = genStreet(seed, 1 + (seed % 5), { scene, taskId, subjects: templatesFor(scene, taskId).slice(0, 3) })
      const m = countModel(s, taskId)
      expect(countAll(m)[taskId], `${scene} ${taskId}`).toBe(0)
      expect(m.people.some((p) => p.id)).toBe(false)
      expect(m.items.some((i) => i.id)).toBe(false)
      expect(m.vendors).toEqual([])
      for (const ratio of [350 / 566, 280 / 330, 1.2]) {
        const v = countView(s, ratio)
        expect(v.vw / v.vh).toBeCloseTo(ratio, 6)
        expect(v.vy + v.vh).toBe(COUNT_VIEW.bottom)
        expect(v.vy).toBeLessThanOrEqual(SIGN.top - 8)
        expect(v.vx + v.vw).toBe(s.L)
        // kalabalığa göre seçilen kırpım: caddenin son üç ekranı içinde; panelde hedef yok, kenarda bölünen kişi/araba yok
        const w = countView(s, ratio, m)
        expect(w.vx).toBeGreaterThanOrEqual(Math.max(0, s.L - 3 * w.vw) - 16)
        const pm = countPanel(s, taskId, w)
        expect(countAll(pm)[taskId]).toBe(0)
        const cut = (x0, x1, x) => x0 < x - 1 && x1 > x + 1
        for (const b of coverBoxes(pm)) expect(cut(b.x, b.x + b.w, w.vx) || cut(b.x, b.x + b.w, w.vx + w.vw)).toBe(false)
        for (const k of pm.cars) expect(cut(k.x - 92, k.x + 92, w.vx) || cut(k.x - 92, k.x + 92, w.vx + w.vw)).toBe(false)
      }
    }
  })
  it('renderScene wholeSigns: yarım tabela (levha ve yazı) çizilmez; edgeDecor: false: kırpıma sığmayan ağaç ve lamba çizilmez', () => {
    const s = genStreet(124, 2, { scene: 'cadde', taskId: 'blueCar', subjects: [] })
    const b = s.buildings[3]
    const v = { vx: b.x + 40, vy: 300, vw: b.w, vh: 500 } // b yarım, sağındaki bina yarım
    const plain = renderScene(s, { ...v, motion: false })
    const whole = renderScene(s, { ...v, motion: false, wholeSigns: true })
    expect(plain).toContain(`>${b.shop}<`)
    expect(whole).not.toContain(`>${b.shop}<`)
    expect(whole).not.toContain(`>${s.buildings[4].shop}<`)
    const full = { vx: b.x, vy: 300, vw: b.w, vh: 500 }
    expect(renderScene(s, { ...full, wholeSigns: true })).toContain(`>${b.shop}<`)
    // kenar süsleri: bina sınırındaki kırpımda ağaç/lamba (aralıkta) ya hiç ya tam
    const deco = (svg) => (svg.match(/fill="#6B4A31"|fill="#353B43"/g) ?? []).length
    expect(deco(renderScene(s, { ...full, edgeDecor: false }))).toBe(0)
    expect(deco(renderScene(s, { ...full }))).toBeGreaterThan(0)
  })
  it('köpek tasması elden köpeğin boynuna gider (kuyruğa değil); satıcı sahnede çizilir', () => {
    const svg = person({ x: 0, y: 0, dir: 1, dog: 'sari', walk: false })
    expect(svg).toMatch(/M6 -57Q40 -38 72 -31/)
    const s = genStreet(77, 2, { scene: 'cadde', taskId: 'blueCar', subjects: ['vendor'] })
    expect(s.vendors.length).toBe(1)
    expect(renderScene(s, {})).toContain('#B8332F') // satıcı arabası (önceden mal türü çizim türünü eziyordu)
  })
  it('cam figür kartı: her şablonda konu tam içeride; cam renksiz (saturate 0) ve orta tona sıkıştırılmış; cevap parçası camda yok', () => {
    for (const scene of SCENE_IDS) for (const id of templatesFor(scene, 'blueCar')) {
      const s = genStreet(321, 3, { scene, taskId: 'blueCar', subjects: [id] })
      for (const ratio of [350 / 450, 280 / 265]) {
        const c = missedCard(s, id, { ratio, mode: SCENES[scene].mode, uid: 't' })
        if (!c) continue
        const v = c.view
        const subj = missedSubject(s, id)
        const tag = `${scene} ${id} ${ratio.toFixed(2)}`
        expect(v.vw / v.vh, tag).toBeCloseTo(ratio, 6)
        if (!subj.place) {
          expect(subj.box.x, tag).toBeGreaterThanOrEqual(v.vx)
          expect(subj.box.x + subj.box.w, tag).toBeLessThanOrEqual(v.vx + v.vw)
          expect(subj.box.y, tag).toBeGreaterThanOrEqual(v.vy)
          expect(c.glass, tag).toContain('<feColorMatrix type="saturate" values="0"/>')
          expect(c.glass, tag).toMatch(/feFuncR type="linear" slope="0\.\d+" intercept="0\.\d+"/)
          expect(c.real).not.toContain('<rect width=') // gerçek katman yalnız konu (sahne ayrı, solmaz)
        }
      }
    }
    const s = genStreet(124, 2, { scene: 'cadde', taskId: 'blueCar', subjects: ['shop'] })
    const c = missedCard(s, 'shop', { ratio: 0.8 })
    const green = s.buildings.find((b) => b.aw === 'yesil')
    expect(c.base).not.toContain(`>${green.shop}<`) // yerin kendisi konu: levha boş
    expect(c.real).toContain(`>${green.shop}<`)
    expect(subjectThumb(s, 'shop')).toContain('<svg')
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
  it('Gözünden kaçan: sahne başına ≥ 12 şablon; konu her zaman sahnede ve tek; cevap sahneyle tutarlı', () => {
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
        expect(missedQuestion(s, ids[0])).not.toHaveProperty('catch')
      }
    }
  })
})

describe('puan, seviye ve kayıt', () => {
  it('görev: tam 1, bir eksik/fazla ½, yoksa 0; Gördüm + doğru fark etme, Görmedim + doğru tahmin; soru sayısı hepsi', () => {
    expect(taskScore(4, 4)).toBe(1)
    expect(taskScore(5, 4)).toBe(0.5)
    expect(taskScore(1, 4)).toBe(0)
    const r = scoreRound({ countAnswer: 4, n: 4, answers: [{ ok: true, guess: false }, { ok: true, guess: true }, { ok: false, guess: false }] })
    expect(r).toEqual({ task: 1, noticed: 1, guessedRight: 1, asked: 3 })
    const saw = [{ ok: true, saw: 'gordum' }, { ok: true, saw: 'gormedim' }, { ok: false, saw: 'gordum' }, { ok: false, saw: 'gormedim' }]
    expect(scoreRound({ countAnswer: 1, n: 4, answers: saw })).toEqual({ task: 0, noticed: 1, guessedRight: 1, asked: 4 })
    expect(SAW).toEqual(['gordum', 'gormedim'])
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
    expect(rec.answers[0]).toEqual({ id: 'a', ok: true, guess: false, saw: null, similar: false })
    expect(isStreet(rec)).toBe(true)
    const changes = [{ n: 8, looks: 1, found: true, kind: 'renk', obj: 'hat' }, { n: 10, looks: 2, found: true, kind: 'yer', obj: 'cat' }, { n: 10, looks: 3, found: true, kind: 'gider', obj: 'pot' }, { n: 12, looks: 3, found: false, kind: 'renk', obj: 'bag' }]
    const r2 = makeRecord({ street: s, countAnswer: 0, answers: [{ id: 'laugh', ok: true, saw: 'gordum', similar: true }, { id: 'beard', ok: true, saw: 'gormedim' }], changes, fact: 'gorilla', factOpen: true })
    expect(r2.changeN).toBe(10)
    expect(r2.changes).toEqual(changes)
    expect(r2).toMatchObject({ asked: 2, noticed: 1, guessedRight: 1, askedIds: ['laugh', 'beard'], fact: 'gorilla', factOpen: true })
    expect(r2.answers).toEqual([{ id: 'laugh', ok: true, guess: false, saw: 'gordum', similar: true }, { id: 'beard', ok: true, guess: true, saw: 'gormedim', similar: false }])
    // eski kayıt (catch alanlı ya da saw'sız) okunurken bozulmaz
    expect(scoreRound({ countAnswer: 0, n: 0, answers: [{ ok: true, guess: true, catch: false }, { ok: true, saw: 'vardi' }] })).toMatchObject({ noticed: 1, guessedRight: 1, asked: 2 })
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

describe('metinler: yalnız METINLER\'deki onaylı metin ekrana çıkar', () => {
  const metinler = readFileSync(new URL('../../../docs/yol-haritasi/tasarim/fark-ettin-mi/METINLER.md', import.meta.url), 'utf8')
  const flat = metinler.replace(/\s+/g, ' ')
  const rows = metinler.split('\n').filter((l) => /^\| [A-ZŞ]\d+ \|/.test(l)).map((l) => l.split('|').map((c) => c.trim()))
  // Sahip onayı bölümü (ilk S listesi): "ID (yeni) "metin"" ya da "ID "a" / "b""; yukarıdaki T durumunu geçersiz kılar
  const sec = metinler.slice(metinler.indexOf('## Sahip onayı'), metinler.indexOf('## Yeni metinler'))
  const owner = {}
  for (const m of sec.matchAll(/([A-ZŞ]\d)(?: \(yeni\))? "([^"]+)"(?: \/ "([^"]+)")?/g)) owner[m[1]] = m[3] ? [m[2], m[3]] : [m[2]]
  owner.R5 = [sec.match(/R5 [^"]*"([^"]+)"/)[1]] // rozetler tırnaksız, satır tırnaklı
  const effective = (r) => (owner[r[1]] || r[1] === 'R3' ? 'S' : r.at(-2))
  // örnekler doldurulmuş hâldir: örneğin değerleri
  const EX = { M1: { sahne: 'Cadde' }, M2: { görev: 'Mavi arabaları say' }, M3: { hedef: 'mavi arabalarda' }, M4: { k: 4 }, D1: { i: 2, n: 4 }, G2: { Yer: 'Caddede', kim: 'kahkaha atan bir kadın' }, G4: { soru: 'Elbisesi ne renkti?' } }
  it('sahip onaylılar harfi harfine (örnek değerleriyle); iki parçalılar: D8 ayrı kimlik, R2 satır; R3 Gelişim\'in sözü', () => {
    expect(Object.keys(owner).sort()).toEqual(['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'G1', 'G2', 'G3', 'G4', 'G5', 'M1', 'M2', 'M3', 'M4', 'R1', 'R2', 'R4', 'R5', 'Y1', 'Y2', 'Ş1'])
    for (const [id, parts] of Object.entries(owner)) {
      if (id === 'D8') {
        expect(say('D8.1')).toBe(parts[0])
        expect(say('D8.2')).toBe(parts[1])
      } else if (id === 'R5') {
        expect(say('R5')).toBe(parts[0])
        expect(say('R5.tags')).toBe('TAM / YAKIN / KAÇTI / GÖRDÜN / TAHMİN')
      } else {
        expect(TEXTS[id].status, id).toBe('S')
        expect(say(id, EX[id]), id).toBe(parts.join(' / '))
      }
    }
    expect(say('R3')).toBe('henüz belli değil')
    expect(lines('G2', EX.G2)).toEqual(['Caddede kahkaha atan bir kadın vardı.', 'Onu fark ettin mi?'])
  })
  it('METINLER tablosundaki her kimlik modülde; bugünkü onaylılar aynen; taslak yalnız N1–N4 ve metinsiz', () => {
    for (const r of rows) {
      const id = r[1]
      const st = effective(r)
      expect(TEXTS[id], id).toBeTruthy()
      if (st.startsWith('onaylı')) {
        expect(TEXTS[id].status).toBe('onayli')
        expect(say(id)).toBe(r[2])
      } else if (/^S\b/.test(st) && st !== 'S') {
        // tabloda doğrudan S olan satır (M5, sahip onayı 2026-10-02): harfi harfine
        expect(TEXTS[id].status, id).toBe('S')
        expect(say(id), id).toBe(r[2])
      } else if (st !== 'S') {
        expect(TEXTS[id].text, id).toBeUndefined()
        expect(say(id), id).toBeNull()
        expect(textOr(id)).toBe(`⟨${id}⟩`)
      }
    }
    expect(Object.keys(TEXTS).filter((id) => TEXTS[id].status === 'T')).toEqual(['N1', 'N2', 'N3', 'N4'])
    expect(say('M5')).toBe('Bu bir fark etme alıştırması. Günlük hayatta daha çok fark etmeni sağladığına dair henüz kanıt yok.')
    expect(rows.find((r) => r[1] === 'M5')[2]).toBe(say('M5'))
  })
  it('modüldeki her S metni METINLER\'de var (yer tutuculular örnekle; M3 odak tablosu türetilmiştir)', () => {
    for (const [id, e] of Object.entries(TEXTS)) {
      if (e.status !== 'S' || !e.text || e.text.includes('{') || id.startsWith('focus.') || id === 'R3') continue
      expect(flat.includes(e.text), `${id}: ${e.text}`).toBe(true)
    }
    const filled = [
      say('change.gelir', { ad: 'saksı' }), say('change.gider', { Ad: 'Çöp kutusu' }), say('change.geldi', { hayvan: 'güvercin' }),
      say('change.gitti', { Hayvan: 'Kedi' }), say('change.belirdi', { yer: 'başında', ad: 'şapka' }), say('change.yokOldu', { iyelik: 'gözlüğü' }),
      say('change.yer', { Ad: 'Bisiklet' }), say('change.tabela', { X: 'F', Y: 'P' }),
      changeSentence({ kind: 'renk', obj: 'door', from: 'lacivert', to: 'bordo' }),
    ]
    for (const x of filled) expect(flat.includes(`"${x}"`), x).toBe(true)
    // "{Yer} {kim} vardı." kalıbı, sahneye göre yer
    expect(missedLines('blonde', 'pazar')).toEqual({ saw: ['Pazar yerinde sarışın bir kadın vardı.', 'Onu fark ettin mi?'], yesNo: ['Gördüm', 'Görmedim'], detail: ['Çantası ne renkti?', 'Görmediysen de tahmin et.'] })
    expect(missedLines('kite', 'park').saw[0]).toBe('Parkta uçurtma uçuran bir çocuk vardı.')
    expect(missedLines('laugh', 'yagmur').saw[0]).toBe('Caddede kahkaha atan bir kadın vardı.')
    expect(missedLines('cane', 'cadde').detail[0]).toBe('Tişörtü ne renkti?')
    expect(sceneName('aksam')).toBe('Akşam ışıkları')
  })
  it('kimliği olup metni olmayan yok: her görev, şablon, seçenek, sahne ve değişiklik onaylı metinle', () => {
    for (const scene of SCENE_IDS) {
      expect(sceneName(scene), scene).toBeTruthy()
      for (const t of SCENE_TARGETS[scene]) {
        const l = taskLines(t)
        expect(l.task && l.focus && l.count, `${scene} ${t}`).toBeTruthy()
        expect(l.focus.startsWith('Gözün ') && l.focus.endsWith(' olsun. Sonunda birkaç sorum var.')).toBe(true)
      }
      for (const id of templatesFor(scene, null)) {
        const m = missedLines(id, scene)
        expect(m.saw && m.detail, `${scene} ${id}`).toBeTruthy()
        const s = genStreet(5, 3, { scene, taskId: SCENE_TARGETS[scene][0], subjects: [id] })
        const q = missedQuestion(s, id)
        for (const v of q.opts) expect(optionText(q.detail, id, v), `${scene} ${id} ${v}`).toBeTruthy()
      }
    }
    expect(optionText('item', 'musician', 'gitar')).toBe('Gitar')
    expect(optionText('stall', 'stall', 'İNCİR')).toBe('İncir')
    for (const obj of Object.keys(OBJECTS)) {
      for (const kind of OBJECTS[obj].kinds) {
        const pal = OBJECTS[obj].palette ?? []
        const c = kind === 'tabela' ? { obj, kind, from: 'FIRIN', to: 'FIRAN' } : { obj, kind, from: pal[0] ?? true, to: pal[1] ?? true, dress: false }
        expect(changeSentence(c), `${obj} ${kind}`).toBeTruthy()
        for (const col of pal) expect(colorName(col), `${obj} ${col}`).toBeTruthy()
      }
    }
    expect(changeSentence({ obj: 'top', kind: 'renk', from: 'kirmizi', to: 'mavi', dress: true })).toBe('Elbise kırmızıydı, mavi oldu')
    expect(changeSentence({ obj: 'top', kind: 'renk', from: 'kirmizi', to: 'mavi', dress: false })).toBe('Tişört kırmızıydı, mavi oldu')
    expect(changeSentence({ obj: 'pigeon', kind: 'gelir' })).toBe('Bir güvercin geldi')
    expect(changeSentence({ obj: 'cat', kind: 'gider' })).toBe('Kedi gitti')
    expect(changeSentence({ obj: 'glasses', kind: 'gider' })).toBe('Birinin gözlüğü yok oldu')
    expect(changeSentence({ obj: 'hat', kind: 'gelir' })).toBe('Birinin başında şapka belirdi')
    expect(changeSentence({ obj: 'sign', kind: 'tabela', from: 'FIRIN', to: 'PIRIN' })).toBe('Tabelada F harfi P oldu')
    // bugünkü dört görev aynen
    for (const t of TASKS) expect([say(`task.${t.id}`), say(`count.${t.id}`)]).toEqual([t.text, t.q])
  })
  it('R5 sayım satırı: METINLER listesi ve dört kalıp harfi harfine; 22 hedefin hepsi', () => {
    const r5 = metinler.slice(metinler.indexOf('## R5 sayım satırı'))
    const r5flat = r5.replace(/\s+/g, ' ')
    const names = r5flat.match(/\{Hedefler\}: (Mavi arabalar[^.]+)\./)[1].split(' · ')
    expect(names).toHaveLength(22)
    const all = SCENE_IDS.flatMap((sc) => SCENE_TARGETS[sc])
    expect(new Set(all).size).toBe(22)
    for (const id of new Set(all)) expect(names).toContain(say(`targets.${id}`))
    for (const k of ['R5.move.same', 'R5.move.diff', 'R5.stay.same', 'R5.stay.diff']) expect(r5flat.includes(`"${TEXTS[k].text}"`), k).toBe(true)
    expect(countRow('blueCar', 3, 0)).toBe('Mavi arabalar: 3 geçti, sen 0 dedin')
    expect(countRow('flowerBucket', 3, 4)).toBe('Çiçek dolu kovalar: 3 vardı, sen 4 dedin')
    expect(countRow('stroller', 2, 2)).toBe('Bebek arabaları: 2 geçti, sen de 2 dedin')
    expect(countRow('cat', 5, 5)).toBe('Kediler: 5 vardı, sen de 5 dedin')
  })
  it('B1 ve S0 (METINLER "Ezberleme başlığı ve sonuç başlığı") harfi harfine', () => {
    const sec = metinler.slice(metinler.indexOf('## Ezberleme başlığı')).replace(/\s+/g, ' ')
    for (const id of ['B1', 'S0.1', 'S0.2', 'S0.3', 'S0.all', 'S0.none']) {
      expect(TEXTS[id].status, id).toBe('S')
      expect(sec.includes(`"${TEXTS[id].text}"`), id).toBe(true)
    }
    expect([0, 1, 2, 3, 4].map((k) => resultHead(k, 4))).toEqual(['Bu turda değişiklikler gözünden kaçtı', "4 sahnenin 1'inde buldun", "4 sahnenin 2'sinde buldun", "4 sahnenin 3'ünde buldun", '4 sahnenin hepsinde buldun'])
    expect(resultHead(3, 3)).toBe('3 sahnenin hepsinde buldun')
  })
  it('Ö1–Ö6 (METINLER "Gözünden kaçan başlıkları ve ekran okuyucu etiketleri") harfi harfine; Ö4 kullanılmaz', () => {
    const sec = metinler.slice(metinler.indexOf('## Gözünden kaçan başlıkları ve ekran okuyucu etiketleri')).replace(/\s+/g, ' ')
    for (const id of ['Ö1', 'Ö2', 'Ö3', 'Ö6']) {
      expect(TEXTS[id].status, id).toBe('S')
      expect(sec.includes(`"${TEXTS[id].text}"`), id).toBe(true)
    }
    for (const id of ['Ö5.found', 'Ö5.miss']) {
      expect(TEXTS[id].status, id).toBe('S')
      expect(sec.includes(`"${TEXTS[id].text}"`), id).toBe(true)
    }
    expect(say('Ö5.found', { i: 2, N: 14 })).toBe('2. sahne: değişikliği buldun, sahnede 14 nesne vardı')
    expect(Object.keys(TEXTS).filter((k) => k.startsWith('Ö4'))).toEqual([])
    const src = readFileSync(new URL('../screens/StreetWalk.jsx', import.meta.url), 'utf8')
    for (const id of ['Ö1', 'Ö2', 'Ö3', 'Ö5.found', 'Ö5.miss', 'Ö6']) expect(src.includes(`'${id}'`), id).toBe(true)
  })
  it('D7 geçmiş eki tr.grammar ile: 12 renk', () => {
    expect(['kirmizi', 'mavi', 'sari', 'yesil', 'mor', 'turuncu', 'siyah', 'beyaz', 'gri', 'kahve', 'lacivert', 'bordo'].map((k) => pastOf(colorName(k)))).toEqual(['kırmızıydı', 'maviydi', 'sarıydı', 'yeşildi', 'mordu', 'turuncuydu', 'siyahtı', 'beyazdı', 'griydi', 'kahverengiydi', 'lacivertti', 'bordoydu'])
  })
  it('ekran (StreetWalk.jsx) düz metin yazmaz: JSX metni ve aria-label yalnız streetText üzerinden', () => {
    const src = readFileSync(new URL('../screens/StreetWalk.jsx', import.meta.url), 'utf8')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/ \/\/ .*$/gm, '')
    const jsxText = (src.match(/>[^<>{}\n]*[A-Za-zÇĞİÖŞÜçğıöşü]{2,}[^<>{}\n]*</g) ?? []).filter((x) => !/[=?:&|+*/]/.test(x)) // JS ifadeleri değil, yalnız JSX metni
    expect(jsxText).toEqual([])
    expect(src.match(/aria-label="[^"]*"/g) ?? []).toEqual([])
    expect((src.match(/'[^'\n]*[çğıöşüÇĞİÖŞÜ][^'\n]*'/g) ?? []).filter((x) => !/^'(Ş1|Ö[0-9](\.[a-z]+)?)'$/.test(x))).toEqual([])
    expect(src).toContain("from '../lib/streetText.js'")
  })
  it('kaynak dosyalarda taslak cümle (N1–N4) yok', () => {
    const sentences = rows.filter((r) => effective(r) === 'T').flatMap((r) => r[2].split(/(?<=[.?!:]) /)).map((x) => x.replace(/\(.*\)/g, '').trim()).filter((x) => x.length >= 12 && !x.includes('{') && x !== 'Fark Ettin mi?')
    expect(sentences.length).toBeGreaterThanOrEqual(4)
    for (const f of ['../screens/StreetWalk.jsx', './street.js', './streetChange.js', './streetScenes.js', './streetText.js', './streetSvg.js']) {
      const src = readFileSync(new URL(f, import.meta.url), 'utf8')
      for (const x of sentences) expect(src.includes(x), `${f}: ${x}`).toBe(false)
    }
  })
})
