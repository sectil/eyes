// Yoldaki "Yeni" rozeti (SONSUZ_YOL.PLAN.v1 §1; S0 taslağı b): bugün ilk kez gelen durak ya da basamak etiketinde
// "Yeni" yazar, ekran okuyucu da "yeni" der. newKeys verilmezse (ilerleme yok) çizim bugünkü gibidir. Yukarı–aşağı
// (`dikey`) durağının kendi çizimi var.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TodayPath from './TodayPath.jsx'
import { buildPath } from '../lib/today.js'
import { progressionCtx, newStopKeys } from '../lib/progression.js'
import { registry } from '../modules/registry.js'

const at = (n, h = 10) => new Date(2026, 9, n, h)
const iso = (n) => at(n, 9).toISOString()
const draw = (plan, newKeys) => renderToStaticMarkup(h(TodayPath, { plan, eye: null, day: 1, onStart: () => {}, ...(newKeys ? { newKeys } : {}) }))
// 2. gün: dün yolu bitiren yeni kullanıcı (E testi, Çemberler, 1 dk nefes, Göz kırpma)
const tests = ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, date: iso(1) }))
const sessions = [{ type: 'game', game: 'track', date: iso(1) }, { type: 'breath', seconds: 60, date: iso(1) }, { type: 'routine', setId: 'kirpma', seconds: 30, date: iso(1) }]
const ctx = (now) => {
  const base = { tests, sessions, now }
  return { ...base, progression: progressionCtx({ ...base, modules: registry.live }) }
}

describe('TodayPath · "Yeni" rozeti', () => {
  it('ilerleme yokken rozet yok; newKeys boşken çizim bugünküyle aynı', () => {
    const plan = buildPath(registry.live, { tests, sessions, now: at(2) })
    const html = draw(plan)
    expect(html).not.toContain('Yeni')
    expect(draw(plan, [])).toBe(html)
  })
  it('2. gün: yeni duraklar etiketinde "Yeni", ekran okuyucuda "yeni"; eski duraklarda yok', () => {
    const c = ctx(at(2))
    const plan = buildPath(registry.live, c)
    const keys = newStopKeys(c, plan.stops)
    expect(keys).toEqual(expect.arrayContaining(['routine:isinma', 'snake', 'notice']))
    expect(keys).not.toContain('routine:kirpma')
    expect(keys).not.toContain('track')
    const html = draw(plan, keys)
    // Nef baloncuğunun yanındaki (sıradaki) durakta etiket yok; öteki yeni duraklarda "Yeni"
    const shown = plan.stops.filter((s, i) => keys.includes(s.key) && s !== plan.next && !(plan.next == null && i === plan.stops.length - 1))
    expect((html.match(/>Yeni</g) ?? []).length + (html.match(/ · Yeni</g) ?? []).length).toBe(shown.length)
    expect(html).toContain('aria-label="Sağ–sol, yeni, egzersiz')
    expect(html).toContain('aria-label="Yılan, yeni, pratik')
    expect(html).not.toContain('aria-label="Göz kırpma, yeni')
    expect(html).toContain('<span class="tag new">Yeni</span>')
  })
  // Ölçüm durağı: okuma testi 2026-10-02'den beri yolda değil (sahip kararı); 8. gün haftalık E testi yolda
  it('mola ve ölçüm durağında rozet kendi etiketinin yanında ("Mola · Yeni", "Ölçüm · Yeni")', () => {
    const c = ctx(at(8))
    const plan = buildPath(registry.live, c)
    expect(plan.stops.map((s) => s.key)).toEqual(expect.arrayContaining(['breath', 'weekly']))
    const html = draw(plan, ['breath', 'weekly'])
    expect(html).toMatch(/<span class="tag">Mola<span class="new"> · Yeni<\/span><\/span>/)
    expect(html).toMatch(/<span class="tag">Ölçüm<span class="new"> · Yeni<\/span><\/span>/)
  })
  it('Yukarı–aşağı durağının çizimi (dikey oklar) var', () => {
    const plan = { stops: [{ key: 'routine:dikey', id: 'routine', title: 'Yukarı–aşağı', minutes: 1, glyph: 'updown', kind: 'exercise', block: 1, done: false }], next: null, allDone: false, doneCount: 0, total: 1, blocks: [{ eyeMin: 1, eyeDone: 0, capMin: 4 }, { eyeMin: 0, eyeDone: 0, capMin: 4 }], minutesLeft: 1, restIndex: -1, forcedRestBefore: null }
    plan.next = plan.stops[0]
    expect(draw(plan)).toContain('M12 3v18')
  })
})

describe('TodayPath · mola süresi (restMin)', () => {
  it('ilerleme yokken bant ve baloncuk bugünkü gibi (Nefes durağının süresi); restMin verilince onu yazar', () => {
    const plan = buildPath(registry.live, { tests, sessions, now: at(2) })
    expect(draw(plan)).toContain('Mola · 5 dk')
    const c = ctx(at(2))
    const p2 = buildPath(registry.live, c)
    const html = renderToStaticMarkup(h(TodayPath, { plan: p2, eye: null, day: 1, onStart: () => {}, restMin: 2 }))
    expect(html).toContain('Mola · 2 dk')
    expect(html).toContain('Nefes · 2 dk')
    // 1. bölüm bitti, sıradaki mola: baloncuk molanın süresini yazar; ilk durak Nefes ise durağın kendi süresi
    const done1 = { ...p2, stops: p2.stops.map((s) => (s.block === 1 ? { ...s, done: true } : s)), doneCount: 2 }
    done1.next = done1.stops.find((s) => s.restSlot)
    const sp = (x) => x.replace(/\u00a0/g, ' ') // baloncuk bölünmez boşluk kullanır
    const bubble = (plan, restMin) => sp(renderToStaticMarkup(h(TodayPath, { plan, eye: null, day: 1, onStart: () => {}, restMin }))).match(/<span class="l2">(.*?)<\/span>/)[1]
    // mola nefes kadar (1.–2. gün): "Sırada Nefes · 2 dk mola"
    expect(bubble(done1, 2)).toBe('Sırada Nefes · 2 dk mola')
    // mola nefesten uzun (S0 kararı 8): "Sırada mola: 2 dk nefes, 3 dk dinlenme"
    expect(bubble(done1, 5)).toBe('Sırada mola: 2 dk nefes, 3 dk dinlenme')
    const r5 = sp(renderToStaticMarkup(h(TodayPath, { plan: done1, eye: null, day: 1, onStart: () => {}, restMin: 5 })))
    expect(r5).toContain('Mola · 5 dk')
    expect(r5).toContain('aria-label="Nefes, mola, 2 dakika, sırada"') // durak nefesin kendi süresi
    const three = { ...done1, stops: done1.stops.map((s) => (s.restSlot ? { ...s, minutes: 3 } : s)) }
    three.next = three.stops.find((s) => s.restSlot)
    expect(bubble(three, 5)).toBe('Sırada mola: 3 dk nefes, 2 dk dinlenme')
    // ilerleme yokken (restMin yok) bugünkü satır
    expect(bubble(three, null)).toBe('Sırada Nefes · 3 dk mola')
    const first = sp(renderToStaticMarkup(h(TodayPath, { plan: { ...p2, next: p2.stops.find((s) => s.restSlot) }, eye: null, day: 1, onStart: () => {}, restMin: 5 })))
    expect(first).toContain('İlk durak: Nefes · 2 dk')
  })
  it('mola sürerken baloncuk kalan süreyi, bant molanın tamamını yazar', () => {
    const c = ctx(at(2))
    const p2 = buildPath(registry.live, c)
    const done1 = { ...p2, stops: p2.stops.map((s) => (s.block === 1 ? { ...s, done: true } : s)), doneCount: 2 }
    done1.next = done1.stops.find((s) => s.restSlot)
    const html = renderToStaticMarkup(h(TodayPath, { plan: done1, eye: { locked: true, reason: 'path', leftMs: 4 * 60000 + 30000 }, day: 1, onStart: () => {}, restMin: 5 })).replace(/\u00a0/g, ' ')
    expect(html).toContain('Mola · 5 dk')
    expect(html).toContain('Nefes · 4:30')
  })
})

describe('TodayPath · S0 çizim düzeltmeleri yalnız ilerlemeyle kurulan yolda (staged)', () => {
  it('staged yokken çizim Y1 öncesiyle aynı: ilk yıldız 16 px, baloncukta max-width yok, tp-y1 sınıfı yok', () => {
    const plan = buildPath(registry.live, { tests, sessions, now: at(2) })
    const html = draw(plan)
    expect(html).toContain('<section class="tp" aria-label="Bugünün yolu">')
    expect(html).toContain('left:calc(50% + -124px);top:16px;opacity:0.8')
    expect(html).not.toContain('max-width')
  })
  it('staged: ilk yıldız "Mola · N dk" etiketinin altında (Ç17), baloncuk 320 pt\'de kabın içinde', () => {
    const c = ctx(at(2))
    const plan = buildPath(registry.live, c)
    const html = renderToStaticMarkup(h(TodayPath, { plan, eye: null, day: 1, onStart: () => {}, restMin: 2, staged: true }))
    expect(html).toContain('<section class="tp tp-y1" aria-label="Bugünün yolu">')
    expect(html).toContain('left:calc(50% + -124px);top:44px;opacity:0.8')
    expect(html).toMatch(/class="tp-jb"[^>]*max-width:calc\(50% \+/)
  })
})
