// Ana sayfa Nef kartı (N1 aşama 4; ANA_OTURUM_ISTEMI madde 6): an motorundan beslenir, model çağrısı yok.
// Sahip kararı 2026-10-02 "Kart yalnız güçlü haberde":
//   - kart YALNIZ F2.C / F2.D örüntüde (en az 3 seans) ve metricChange'de (ilerleme): onaylı cümle, etiket "Nef", önce–sonra
//     çizimi (iki uçta değer etiketi; ilerlemede metriğin manifestte tanımlı uçları, yoksa çizgi yok), onaylı düğme
//   - öteki bütün anlarda kart yok (null, DOM'da hiçbir şey): F2.A/F2.B tek seans, F1/F3 hava, firstTime, returnAfterGap,
//     F4.C uzun dönüş, F4 sessiz gün, pathDone; düşük WHO-5 gününde de yok. Gösterilmeyen cümle hafızaya yazılmaz;
//     bankadaki cümleler silinmedi
//   - göz uyarısı sabit metin, modelden bağımsız, aşama 4 öncesindeki görünüm (değişmedi)
//   - söylenen cümle hafızaya günde bir kez; aynı gün yeniden açılışta aynı cümle
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Node } from '../test/fakeDom.js'
import { createElement as h, act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } }
globalThis.scrollTo = () => {}
globalThis.matchMedia ??= () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
globalThis.innerHeight ??= 800
Node.prototype.getBoundingClientRect ??= () => ({ top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100 })
const ctx2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ctx2d), set: (t, k, v) => { t[k] = v; return true } })
Node.prototype.getContext ??= () => ctx2d
globalThis.requestAnimationFrame ??= () => 0
globalThis.cancelAnimationFrame ??= () => {}

// Model istemcisi gözetlenir: Ana sayfa ve kart onu hiç çağırmamalı
const spy = vi.hoisted(() => ({ insight: 0 }))
vi.mock('../lib/coach.js', async (orig) => {
  const real = await orig()
  return { ...real, getTodayInsight: (...a) => { spy.insight++; return real.getTodayInsight(...a) } }
})

// iPhone uygulaması (yoga yalnız orada; lib/native.js isIOSApp): testte açılıp kapanır
const ios = vi.hoisted(() => ({ on: false }))
vi.mock('../lib/native.js', async (orig) => ({ ...(await orig()), isIOSApp: () => ios.on }))

const { createRoot } = await import('react-dom/client')
const { default: CoachCard } = await import('./CoachCard.jsx')
const { default: Home } = await import('../screens/Home.jsx')
const { cells, render } = await import('../lib/nef/bank/tr.js')
const { moduleLexicon } = await import('../lib/nef/lexicon.js')
const { NEF_SAID_KEY, loadSaid } = await import('../lib/nef/memory.js')
const { fallbackInsight } = await import('../lib/coach.js')
const { nefCard } = await import('../lib/nef/card.js')
const { registry } = await import('../modules/registry.js')
const { buildMoments } = await import('../lib/nef/moments.js')
const { nefContext } = await import('../lib/nef/context.js')
// Kartın anının olguları (kartın çıktısında yok; an motorundan, aynı anahtarla)
const nefFacts = (card, nef, now) => buildMoments(nefContext(nef, { now })).find((m) => m.key === card.say.key).facts
const { NefAction, glueLast, longTail } = await import('./CoachCard.jsx')

const NOW = new Date(2026, 8, 30, 20, 30) // Çarşamba 20.30 (akşam)
const MORNING = new Date(2026, 8, 30, 10, 0)
const at = (daysAgo, hh, mm = 0, base = NOW) => new Date(base.getFullYear(), base.getMonth(), base.getDate() - daysAgo, hh, mm).toISOString()
const dalga = (daysAgo, hh, before, after) => ({ type: 'dalga', mode: 'sakin', before, after, seconds: 300, date: at(daysAgo, hh) })
const snake = (daysAgo, hh = 10) => ({ type: 'game', game: 'snake', score: 12, seconds: 60, control: 'touch', date: at(daysAgo, hh) })
// Dün başka bir kayıt (uygulamaya uzun aradan dönüş sayılmasın; Dalga sesinin Güç kipi, puan değişmedi)
// (40 gün önce de vardı: ilk kayıt değil)
const yday = () => ({ type: 'dalga', mode: 'guc', before: 5, after: 5, seconds: 300, date: at(1, 9) })
const seen = () => [{ ...yday(), date: at(40, 9) }, yday()]
// Örüntü: son 5 Dalga sesi seansı (sakinlik ortalama 4 → 6; F2.C)
const pattern = () => [dalga(2, 12, 4, 6), dalga(3, 12, 4, 6), dalga(4, 12, 3, 6), dalga(5, 12, 4, 5), dalga(6, 12, 5, 7)]
const yoga = (daysAgo, hh, before, after) => ({ type: 'yoga', lesson: 1, before, after, planned: 300, seconds: 300, completed: true, reachedClosing: true, date: at(daysAgo, hh) })
const span = (daysAgo, value) => ({ type: 'span', span: value, seconds: 60, durationMs: 120, date: at(daysAgo, 11) })
const input = (o = {}) => ({ lang: 'tr', tests: [], sessions: [], habits: [], reminders: null, weather: null, path: { has: true, doneToday: false, doneDays: 0 }, who5Low: false, ...o })

const lex = moduleLexicon('tr')
// Bir hücrenin kurulabilen bütün cümleleri (olgularla) — kart bunlardan biri olmalı
const approved = (cell, facts) => (cells[cell] ?? []).map((t) => render(t.text, facts, lex)).filter(Boolean)
const html = (props) => renderToStaticMarkup(h(CoachCard, { now: NOW, ...props }))
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim()

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
  spy.insight = 0
  ios.on = false
})

// Kart DOM'da hiç yok ve hafızaya bir şey yazılmadı
async function absent(nef, now = NOW) {
  expect(nefCard({ input: nef, now })).toBeNull()
  expect(html({ nef, now, onStart: () => {} })).toBe('')
  const el = document.createElement('div')
  const root = createRoot(el)
  await act(async () => root.render(h(CoachCard, { nef, now, onStart: () => {} })))
  expect(el.textContent).toBe('')
  expect(el.childNodes).toHaveLength(0)
  await act(async () => root.unmount())
  expect(loadSaid({ now })).toEqual([])
}

describe('Nef kartı · izinli anlar (örüntü, ilerleme): onaylı cümle, etiket "Nef", damga yok', () => {
  it('F2.C effectPattern: son 5 seansta ortalama 4 → 6; çizim ortalamalarla, uçlar 0 ve 10; "Bugün de" düğmesi', () => {
    store['gozolcum:dalga-opts'] = JSON.stringify({ minutes: 8 })
    const nef = input({ sessions: pattern() })
    const card = nefCard({ input: nef, now: NOW })
    expect(card.type).toBe('effectPattern')
    expect(card.kind).toBe('say')
    const facts = { module: 'dalga', effect: 'dalga-sakin', measure: 'sakinlik', better: 'up', n: 5, gain: 2, beforeAvg: 4, afterAvg: 6 }
    expect(approved('F2.C', facts)).toContain(card.text)
    expect(card.scale).toEqual({ min: 0, max: 10, before: 4, after: 6, better: 'up' })
    // Örüntünün dilimi yok: akşam da olsa "Bugün de"
    expect(card.action).toEqual({ label: 'Bugün de Dalga sesi · 8 dk', route: 'dalga', kind: 'day' })
    const out = html({ nef, onStart: () => {} })
    expect(out).toMatch(/<span class="nef-badge"><i aria-hidden="true"><\/i>Nef<\/span>/)
    // Görünen metin: etiket, cümle, çizimin sayıları (4, 6, uçlar 0 ve 10) ve düğme; başka satır yok
    expect(text(out)).toBe(`Nef ${card.text} 4 6 0 10 Bugün de Dalga sesi · 8 dk`)
    expect(out).toContain('<div class="nef-scale up" aria-hidden="true">')
    // Vurgu iki ortalamada; son parça iki kelime ("6'ya çıktı."): dengeleme sınıfı yok (görünüm aynı)
    expect(card.text.slice(card.accent.start, card.accent.end)).toBe("4'ten 6'ya")
    expect(out).toContain('<p class="nef-say">')
    expect(out).toContain('<div class="nef-ends"><span>0</span><span>10</span></div>')
    expect(out).toMatch(/<button type="button" class="nef-go">Bugün de Dalga sesi <span class="nef-go-dk">· 8 dk<\/span><\/button>/)
    expect(out).not.toMatch(/çevrimdışı|Bugün · Nef|Nef Göz Koçu|wx-attr/)
    // Seçili süre yoksa Dalga'nın varsayılanı (5 dk); onStart yoksa düğme çizilmez
    delete store['gozolcum:dalga-opts']
    expect(nefCard({ input: nef, now: NOW }).action.label).toBe('Bugün de Dalga sesi · 5 dk')
    expect(html({ nef })).not.toMatch(/<button/)
  })
  it('F2.D effectPattern (yoga, Nefesin Ritmi, gerginlik 5 seansta azaldı): ders adıyla düğme; web\'de düğme yok', () => {
    const nef = input({ sessions: [yoga(2, 20, 7, 4), yoga(3, 20, 7, 4), yoga(4, 20, 8, 4), yoga(5, 20, 6, 4), yoga(6, 20, 7, 5), ...seen()] })
    store['gozolcum:yoga-opts'] = JSON.stringify({ minutesByLesson: { 1: 15 } })
    ios.on = true
    const card = nefCard({ input: nef, now: NOW })
    expect(card.type).toBe('effectPattern')
    expect(approved('F2.D', { module: 'yoga', effect: 'yoga-nefes', measure: 'gerginlik', better: 'down', n: 5, beforeAvg: 7, afterAvg: 4.2, gain: 2.8 })).toContain(card.text)
    // Bu gün seçilen cümle fark cümlesi ("ortalama 2,8 puan azaldı"): çizimin aralığı cümledeki fark (7 → 7 − 2,8)
    expect(card.text).toMatch(/ortalama 2,8 puan/)
    expect(card.scale).toEqual({ min: 0, max: 10, before: 7, after: 4.2, better: 'down' })
    // Süre: dersin son seçilen yayımlanmış süresi (Yoga.jsx pickMinutes; 15 dk); yayımlanmamış süre seçiliyse varsayılan 5
    expect(card.action).toEqual({ label: 'Bugün de Nefesin Ritmi · 15 dk', route: 'yoga-1', kind: 'day' })
    store['gozolcum:yoga-opts'] = JSON.stringify({ minutesByLesson: { 1: 12 } })
    expect(nefCard({ input: nef, now: NOW }).action.label).toBe('Bugün de Nefesin Ritmi · 5 dk')
    const out = html({ nef, onStart: () => {} })
    expect(out).toContain('nef-scale down')
    expect(text(out)).toBe(`Nef ${card.text} 7,0 4,2 0 10 Bugün de Nefesin Ritmi · 5 dk`)
    // Asıl haber vurgulu: fark cümlesinde sayı ve birimi ("2,8 puan"; F2.C'deki "4'ten 6'ya" gibi)
    expect(card.text.slice(card.accent.start, card.accent.end)).toBe('2,8 puan')
    expect(out).toContain('<em>2,8\u00a0puan</em>')
    // Bağlanan son parça üç kelime ("2,8 puan azaldı."): satırlar dengelenir
    expect(out).toContain('<p class="nef-say bal">')
    // Web'de yoga yok: düğme yok (kart yine söylenir)
    ios.on = false
    const web = nefCard({ input: nef, now: NOW })
    expect(web.text).toBe(card.text)
    expect(web.action).toBeNull()
  })
  it('metricChange (oyun): Tek Bakışta 4 → 6; çizgi 0–12 (lib/span.js SPAN_MAX, manifest max); bugünkü tur varsa "Bugünkü turu oyna · 2 dk"', () => {
    // Her gün oynayan: bu hafta tur yok (today() durak vermez) → düğme yok
    const daily = []
    for (let d = 24; d >= 1; d--) daily.push(span(d, d > 15 ? 4 : 6))
    const nef = input({ sessions: daily })
    const card = nefCard({ input: nef, now: MORNING })
    expect(card.type).toBe('metricChange')
    expect(card.kind).toBe('say')
    expect(approved('MC', { module: 'tek-bakis', metric: 'tek-bakis-span', start: 4, current: 6 })).toContain(card.text)
    expect(card.scale).toEqual({ min: 0, max: 12, before: 4, after: 6, better: 'up' })
    expect(card.action).toBeNull()
    const out = html({ nef, now: MORNING, onStart: () => {} })
    expect(out).toContain('<div class="nef-scale up" aria-hidden="true">')
    // Vurgu iki ortalamada; son parça iki kelime ("6'ya çıktı."): dengeleme sınıfı yok (görünüm aynı)
    expect(card.text.slice(card.accent.start, card.accent.end)).toBe("4'ten 6'ya")
    expect(out).toContain('<p class="nef-say">')
    expect(out).toContain('<div class="nef-ends"><span>0</span><span>12</span></div>')
    expect(text(out)).toBe(`Nef ${card.text} 4 6 0 12`)
    expect(out).not.toMatch(/<button/)
    // Bu hafta iki gün oynayan: bugünkü tur yolda (today() 2 dk) → onaylı düğme
    const sparse = [...daily.filter((r) => r.date < at(7, 0)), span(4, 6), span(2, 6)]
    const c2 = nefCard({ input: input({ sessions: sparse }), now: MORNING })
    expect(c2.type).toBe('metricChange')
    expect(c2.action).toEqual({ label: 'Bugünkü turu oyna · 2 dk', route: 'tek-bakis', kind: 'play' })
    expect(text(html({ nef: input({ sessions: sparse }), now: MORNING, onStart: () => {} }))).toBe(`Nef ${c2.text} 4 6 0 12 Bugünkü turu oyna · 2 dk`)
    // Işık hassasiyeti (profil): Tek Bakışta durağı yok → düğme yok
    expect(nefCard({ input: input({ sessions: sparse }), now: MORNING, profile: { seizure: 'yes' } }).action).toBeNull()
  })
  it('cümledeki sayılar = çizimin etiketleri ve nokta konumları (F2.C, F2.D, ilerleme; ham ortalama kesirli olsa da)', () => {
    ios.on = true
    const daily = []
    for (let d = 24; d >= 1; d--) daily.push(span(d, d > 15 ? 4 : 6))
    const cases = [
      [input({ sessions: pattern() }), NOW, 'effectPattern'],
      // Ham sonra ortalaması 6,2: cümle "4'ten 6'ya", çizim 4 ve 6
      [input({ sessions: [dalga(2, 12, 4, 6), dalga(3, 12, 4, 7), dalga(4, 12, 3, 6), dalga(5, 12, 4, 5), dalga(6, 12, 5, 7), ...seen()] }), NOW, 'effectPattern'],
      // Ham ortalamalar kesirli (önce 6,4 · sonra 4,2): cümle de çizim de 6 ve 4
      [input({ sessions: [yoga(2, 20, 7, 4), yoga(3, 20, 6, 4), yoga(4, 20, 7, 5), yoga(5, 20, 6, 4), yoga(6, 20, 6, 4), ...seen()] }), NOW, 'effectPattern'],
      [input({ sessions: [yoga(2, 20, 7, 4), yoga(3, 20, 7, 4), yoga(4, 20, 8, 4), yoga(5, 20, 6, 4), yoga(6, 20, 7, 5), ...seen()] }), NOW, 'effectPattern'],
      [input({ sessions: daily }), MORNING, 'metricChange'],
    ]
    let seenFark = false
    let seenRounded = false
    for (const [nef, now, type] of cases) {
      const card = nefCard({ input: nef, now })
      expect(card.type).toBe(type)
      // Cümledeki sayı belirteçleri (seans sayısı da içinde)
      const tokens = card.text.match(/\d+(,\d+)?/g)
      const out = html({ nef, now })
      const lab = (c) => out.match(new RegExp(`<span class="nef-lab ${c}" style="left:([\\d.]+)%">([^<]+)</span>`))
      const labels = [lab('b')[2], lab('a')[2]]
      const n = (s) => Number(s.replace(',', '.'))
      const f = nefFacts(card, nef, now)
      const tpl = Object.values(cells).flat().find((t) => t.id === card.say.id).text
      if (/\{(önceOrt|başlangıç)/.test(tpl)) {
        // "4'ten 6'ya": iki etiket cümledeki iki sayı, aynı yazımla
        for (const l of labels) expect(tokens, card.text).toContain(l)
        const [k1, k2] = card.type === 'metricChange' ? ['{başlangıç}', '{şimdi}'] : ['{önceOrt}', '{sonraOrt}']
        expect(labels, card.text).toEqual([render(k1, f, lex), render(k2, f, lex)])
        if (card.type === 'effectPattern' && !Number.isInteger(f.afterAvg)) seenRounded = true
      } else {
        // "ortalama 2,2 puan azaldı": iki etiketin farkı cümledeki fark
        expect(tpl).toContain('{fark}')
        expect(Number(Math.abs(n(labels[0]) - n(labels[1])).toFixed(1)), card.text).toBe(n(render('{fark}', f, lex)))
        seenFark = true
      }
      // Nokta konumu etiketteki değerden (ölçeğin 0 ucuna göre)
      expect(Number(lab('b')[1])).toBeCloseTo(((n(labels[0]) - card.scale.min) / (card.scale.max - card.scale.min)) * 100, 6)
      expect(Number(lab('a')[1])).toBeCloseTo(((n(labels[1]) - card.scale.min) / (card.scale.max - card.scale.min)) * 100, 6)
    }
    expect(seenFark).toBe(true) // fark cümlesi de sınandı
    expect(seenRounded).toBe(true) // ham ortalaması kesirli "…'den …'e" cümlesi de (kartta 4,3 yazmaz)
  })
  it('ölçek iki kartta tutarlı: aynı 4 → 6 artış ölçeğe göre orantılı (0–10: %20, 0–12: %16,7)', () => {
    const daily = []
    for (let d = 24; d >= 1; d--) daily.push(span(d, d > 15 ? 4 : 6))
    const fill = (out) => {
      const m = out.match(/class="nef-fill" style="left:([\d.]+)%;width:calc\(([\d.]+)% - ([\d.]+)%\)"/)
      return { left: Number(m[1]), width: Number(m[2]) - Number(m[3]) }
    }
    const f2 = fill(html({ nef: input({ sessions: pattern() }) }))
    const mc = fill(html({ nef: input({ sessions: daily }), now: MORNING }))
    expect(f2.left).toBeCloseTo(40, 6)
    expect(f2.width).toBeCloseTo(20, 6)
    expect(mc.left).toBeCloseTo((4 / 12) * 100, 6)
    expect(mc.width).toBeCloseTo((2 / 12) * 100, 6)
  })
  it('ilerleme çizgisinin uçları manifestten; üst ucu tanımlı olmayan metrikte çizgi yok (kart yine söylenir)', async () => {
    const max = Object.fromEntries(registry.metrics().map((x) => [x.key, [x.min ?? 0, x.max ?? null]]))
    // metricChange bildiren modüllerin metrikleri: tanımlı uçlar (Yön Ayna 1–5)
    expect(max).toMatchObject({ 'tek-bakis-span': [0, 12], 'street-noticed': [0, 100], 'notice-count': [0, 3], 'yon-ayna': [1, 5] })
    const daily = []
    for (let d = 24; d >= 1; d--) daily.push(span(d, d > 15 ? 4 : 6))
    const real = registry.metrics
    const spyM = vi.spyOn(registry, 'metrics').mockImplementation(() => real().map((x) => (x.key === 'tek-bakis-span' ? { ...x, max: undefined } : x)))
    try {
      const card = nefCard({ input: input({ sessions: daily }), now: MORNING })
      expect(card.type).toBe('metricChange')
      expect(card.scale).toBeNull()
      const out = html({ nef: input({ sessions: daily }), now: MORNING })
      expect(out).not.toMatch(/nef-scale|nef-ends/)
      expect(text(out)).toBe(`Nef ${card.text}`)
    } finally {
      spyM.mockRestore()
    }
  })
  it('örüntü, aynı gün daha önemli ama izinsiz bir an (ilk kez, tek seans) olsa da söylenir; yalnız o cümle hafızaya', async () => {
    const nef = input({ sessions: [...pattern(), dalga(7, 20, 4, 7), snake(0)] })
    expect(nefCard({ input: nef, now: NOW }).type).toBe('effectPattern')
    const el = document.createElement('div')
    const root = createRoot(el)
    await act(async () => root.render(h(CoachCard, { nef, now: NOW })))
    await act(async () => root.unmount())
    expect(loadSaid({ now: NOW }).map((r) => r.type)).toEqual(['effectPattern'])
  })
})

describe('Nef cümlesi · yoga dersinde "{modül} seansında" kurulmaz ("yoga dersi seansında" hantal)', () => {
  const yogaFx = registry.effects().filter((e) => e.module === 'yoga')
  const rich = (e) => ({ module: 'yoga', effect: e.key, measure: e.measure, better: e.better === 'down' ? 'down' : 'up', n: 8, gain: 2.2, beforeAvg: 6.4, afterAvg: 4.2, before: 7, after: 4, part: 'evening', start: 4, current: 6 })
  it('bankanın hiçbir cümlesi (kart ve bildirim hücreleri) yoga dersiyle "dersi seans" içermez; Dalga sesinde aynı şablonlar kurulur', () => {
    expect(yogaFx.length).toBeGreaterThan(0)
    const lessonTpl = Object.values(cells).flat().filter((t) => t.text.includes('{modül} seans'))
    expect(lessonTpl.map((t) => t.id).sort()).toEqual(['F2C-2', 'F2C-7', 'F2D-2', 'F2D-6'])
    for (const e of yogaFx) {
      for (const t of Object.values(cells).flat()) {
        const out = render(t.text, rich(e), lex)
        expect(out ?? '', `${t.id} ${e.key}`).not.toMatch(/dersi seans/)
      }
      for (const t of lessonTpl) expect(render(t.text, rich(e), lex), t.id).toBeNull()
    }
    const dalgaFacts = { module: 'dalga', effect: 'dalga-sakin', measure: 'sakinlik', better: 'up', n: 5, gain: 2, beforeAvg: 4, afterAvg: 6 }
    for (const t of lessonTpl.filter((x) => x.id.startsWith('F2C'))) expect(render(t.text, dalgaFacts, lex)).toMatch(/Dalga sesi seansında/)
  })
  it('yoga örüntü kartı 30 gün boyunca hiç "dersi seansında" demez; ayrılma hâlli onaylı şablon seçilir', () => {
    ios.on = true
    const ids = new Set()
    for (let day = 0; day < 30; day++) {
      const now = new Date(2026, 8, 1 + day, 20, 30)
      const ago = (d) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - d, 20).toISOString()
      const sessions = [[2, 7, 4], [3, 7, 4], [4, 8, 4], [5, 6, 4], [6, 7, 5]].map(([d, before, after]) => ({ type: 'yoga', lesson: 1, before, after, planned: 300, seconds: 300, completed: true, reachedClosing: true, date: ago(d) }))
      const card = nefCard({ input: input({ sessions }), now })
      expect(card?.type).toBe('effectPattern')
      expect(card.text).not.toMatch(/dersi seans/)
      ids.add(card.say.id)
    }
    expect([...ids].some((id) => ['F2C-2', 'F2C-7', 'F2D-2', 'F2D-6'].includes(id))).toBe(false)
    expect(ids.size).toBeGreaterThan(1)
  })
})

describe('Nef kartı · öteki anlarda kart yok (null), hafızaya yazılmaz; cümleler bankada', () => {
  it('F2.A / F2.B tek seans (geçen hafta bu akşam Dalga sesi 4 → 7; yoga gerginlik 7 → 4)', async () => {
    await absent(input({ sessions: [dalga(7, 20, 4, 7), ...seen()] }))
    ios.on = true
    await absent(input({ sessions: [yoga(7, 20, 7, 4), ...seen()] }))
    expect(cells['F2.A'].length).toBeGreaterThan(0)
    expect(cells['F2.B'].length).toBeGreaterThan(0)
  })
  it('firstTime (Yılan bugün ilk kez) ve returnAfterGap (Yılan 20 gün aradan)', async () => {
    await absent(input({ sessions: [snake(0)] }))
    await absent(input({ sessions: [snake(30), snake(20), ...seen(), snake(0)] }))
    expect(cells.FT.length).toBeGreaterThan(0)
    expect(cells.RG.length).toBeGreaterThan(0)
  })
  it('F4.C uygulamaya 20 gün aradan dönüş; o gün örüntü ve ilerleme de söylenmez', async () => {
    await absent(input({ sessions: [dalga(20, 9, 5, 5)] }), MORNING)
    expect(cells['F4.C'].length).toBeGreaterThan(0)
  })
  it('F1 yağmur ve F3 sıcak (yürüyüş hatırlatması + hava önbelleği)', async () => {
    const day = new Date(2026, 8, 30).getTime()
    const hours = (rain, feels) => Array.from({ length: 24 }, (_, i) => ({ at: day + i * 3600000, precipChance: rain && i >= rain[0] && i < rain[1] ? 0.8 : 0.05, apparentC: feels[i] ?? 22 }))
    const reminders = { optIn: 'yes', types: { walk: { on: true, time: '19:30', days: [0, 1, 2, 3, 4, 5, 6] } } }
    const cache = (h) => ({ at: new Date(MORNING.getTime() - 3600000).toISOString(), data: { hours: h } })
    // An motoru anları kurar (bildirim tarafı değişmedi); kart söylemez
    const { buildMoments } = await import('../lib/nef/moments.js')
    const { nefContext } = await import('../lib/nef/context.js')
    const rain = input({ reminders, weather: { cache: cache(hours([19, 22], {})) } })
    const hot = input({ reminders, weather: { cache: cache(hours(null, { 19: 31 })) } })
    expect(buildMoments(nefContext(rain, { now: MORNING })).map((m) => m.type)).toContain('rainOnWalk')
    expect(buildMoments(nefContext(hot, { now: MORNING })).map((m) => m.type)).toContain('hotWalk')
    await absent(rain, MORNING)
    await absent(hot, MORNING)
    expect(cells['F3.B'].length).toBeGreaterThan(0)
  })
  it('sessiz gün (F4.A yol var, F4.B yol yok) ve yol bitti (pathDone, bu hafta üç gün)', async () => {
    await absent(input())
    await absent(input({ path: { has: false, doneToday: false, doneDays: 0 } }))
    const path = { has: true, doneToday: true, doneDays: 3 }
    const { buildMoments } = await import('../lib/nef/moments.js')
    const { nefContext } = await import('../lib/nef/context.js')
    expect(buildMoments(nefContext(input({ sessions: seen(), path }), { now: NOW, rows: [] })).map((m) => m.type)).toContain('pathDone')
    await absent(input({ sessions: seen(), path }))
    // Aynı gün örüntü varsa o söylenir
    expect(nefCard({ input: input({ sessions: pattern(), path }), now: NOW }).type).toBe('effectPattern')
    expect(cells['F4.A'].length).toBeGreaterThan(0)
    expect(cells['F4.B'].length).toBeGreaterThan(0)
    expect(cells.PD.length).toBeGreaterThan(0)
  })
  it('düşük WHO-5: örüntü ve ilerleme olsa da kart yok (sabit satır Gelişim\'de)', async () => {
    const daily = []
    for (let d = 24; d >= 1; d--) daily.push(span(d, d > 15 ? 4 : 6))
    await absent(input({ who5Low: true, sessions: pattern() }))
    await absent(input({ who5Low: true, sessions: daily }), MORNING)
  })
  it('başka dilde Nef susar (Türkçeye düşmez); girdi yoksa kart yok', () => {
    expect(html({ nef: input({ lang: 'en', sessions: pattern() }) })).toBe('')
    expect(html({ nef: null })).toBe('')
  })
})

describe('Nef kartı · göz uyarısı korunur', () => {
  it('göz uyarısı (kırmızı, sarı): sabit metin aynen; Nef girdisi, düşük WHO-5 ve model olmadan da', () => {
    for (const alert of ['red', 'yellow']) {
      const fixed = fallbackInsight({ vaAlert: alert })
      for (const nef of [null, input({ who5Low: true }), input({ sessions: [dalga(7, 20, 4, 7)] }), input({ sessions: pattern() })]) {
        const out = html({ nef, alert })
        // Aşama 4 öncesindeki görünüm aynen: sınıflar, etiket "Bugün · Nef", eylem kutusu; damga yok
        expect(text(out)).toBe(`Bugün · Nef ${fixed.insight} ${fixed.action}`)
        expect(out).toMatch(/class="card coach-card"/)
        expect(out).toMatch(/<p class="coach-insight">/)
        expect(out).toMatch(/<p class="coach-action static">/)
        expect(out).not.toMatch(/çevrimdışı|nef-badge/)
        expect(nefCard({ input: nef, alert, now: NOW }).kind).toBe('eye')
      }
    }
    expect(fallbackInsight({ vaAlert: 'red' }).action).toBe('Lütfen bir göz doktoruna başvur')
    expect(loadSaid({ now: NOW })).toEqual([])
    expect(spy.insight).toBe(0)
  })
})

describe('Nef kartı · düğme yeri ve satır kırma', () => {
  it('düğme: etiket ve rota varsa çizilir, dokununca onStart(rota); etiket yoksa (onay bekliyor) çizilmez', async () => {
    expect(renderToStaticMarkup(h(NefAction, { action: { label: null, route: 'dalga' }, onStart: () => {} }))).toBe('')
    expect(renderToStaticMarkup(h(NefAction, { action: { label: 'x', route: 'dalga' }, onStart: null }))).toBe('')
    const go = vi.fn()
    const el = document.createElement('div')
    const root = createRoot(el)
    await act(async () => root.render(h(NefAction, { action: { label: 'x', route: 'tek-bakis' }, onStart: go })))
    const b = el.querySelectorAll((n) => n.nodeName === 'BUTTON')[0]
    expect(b.className).toBe('nef-go')
    await act(async () => b.click())
    expect(go).toHaveBeenCalledWith('tek-bakis')
    await act(async () => root.unmount())
  })
  it('son satırda tek kelime yok: son iki kelime bölünmez boşlukla (görünen metin aynı)', () => {
    expect(glueLast('Yılan oyununu ilk kez denedin.')).toBe('Yılan oyununu ilk kez\u00a0denedin.')
    expect(glueLast('Tek')).toBe('Tek')
    // sayı ile birimi ayrılmaz; modül adı (büyük harf) bağlanmaz
    expect(glueLast('gerginliğin ortalama 1,8 puan düştü.')).toBe('gerginliğin ortalama 1,8\u00a0puan\u00a0düştü.')
    expect(glueLast('Son 5 Dalga sesi seansında')).toBe('Son 5 Dalga sesi\u00a0seansında')
    // Üç kelimelik bağlı son dengelenir; iki kelimelik son (02, 06) pretty kalır
    expect(longTail(glueLast('gerginliğin ortalama 1,8 puan düştü.'))).toBe(true)
    expect(longTail(glueLast("puanın ortalama 4'ten 6'ya çıktı."))).toBe(false)
    expect(longTail('Tek')).toBe(false)
    const nef = input({ sessions: pattern() })
    const said = nefCard({ input: nef, now: NOW }).text
    const out = html({ nef })
    expect(out).toContain(`\u00a0${said.split(' ').at(-1)}</p>`)
    expect(text(out)).toContain(said)
  })
  it('stil: kart cümlesinde text-wrap pretty (yoksa balance); kalkan küçük satırın ve hava atfının kuralları yok', () => {
    const css = readFileSync(fileURLToPath(new URL('../styles/coach.css', import.meta.url)), 'utf8')
    const rule = (sel) => css.match(new RegExp(`(^|\\n)${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{([^}]*)\\}`))?.[2] ?? ''
    expect(rule('.nef-say')).toMatch(/text-wrap: balance; text-wrap: pretty;/)
    expect(rule('.nef-ends')).toMatch(/justify-content: space-between/)
    expect(rule('.nef-say.bal')).toMatch(/text-wrap: balance;/)
    // Yön oku yalnız azalışta (dolgunun içinde, şekil; yazı yok); artışta dolgu aynı
    expect(rule('.nef-scale.down .nef-fill::after')).toMatch(/content: '';[\s\S]*clip-path: polygon\(0 50%, 100% 0, 100% 100%\)/)
    expect(css).not.toMatch(/\.nef-scale\.up|(^|\n)\.nef-fill::after/)
    // ≤360 pt: düğmenin yalnız yatay iç boşluğu daralır (yazı boyu aynı; 48 pt yükseklik)
    expect(css).toMatch(/@media \(max-width: 360px\) \{\n {2}\.nef-go \{ padding-inline: 6px; \}\n\}/)
    expect(rule('.nef-go')).toMatch(/min-height: 48px;[\s\S]*font-size: 1rem;/)
    expect(css).not.toMatch(/is-line|\.nef-line|\.nef-attr|\.nef-scale\.open/)
  })
})

describe('Nef kartı · hafıza', () => {
  it('söylenen cümle bir kez yazılır; aynı gün yeniden açılışta aynı cümle, ertesi gün aynı olgu yok', async () => {
    const nef = input({ sessions: pattern() })
    const mount = async (now) => {
      const el = document.createElement('div')
      const root = createRoot(el)
      await act(async () => root.render(h(CoachCard, { nef, now })))
      const t = el.textContent
      await act(async () => root.unmount())
      return t
    }
    const first = await mount(NOW)
    const rows = JSON.parse(store[NEF_SAID_KEY])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ type: 'effectPattern', channel: 'card', date: '2026-09-30' })
    const again = await mount(new Date(NOW.getTime() + 60000))
    expect(again).toBe(first)
    expect(JSON.parse(store[NEF_SAID_KEY])).toHaveLength(1)
    const next = await mount(new Date(2026, 9, 1, 20, 30))
    expect(next).not.toBe(first) // aynı olgu bir kez söylenir
  })
})

describe('Nef kartı · düğmeye dokunma hafızası (yok sayma kuralı)', () => {
  it('düğmeli kart "yok sayıldı" diye yazılır; dokununca "dokunuldu" olur ve modül açılır; üç yok sayma 14 gün dinlendirir', async () => {
    const { typeResting } = await import('../lib/nef/memory.js')
    store['gozolcum:dalga-opts'] = JSON.stringify({ minutes: 8 })
    const nef = input({ sessions: pattern() })
    const go = vi.fn()
    const el = document.createElement('div')
    const root = createRoot(el)
    await act(async () => root.render(h(CoachCard, { nef, now: NOW, onStart: go })))
    let rows = loadSaid({ now: NOW })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ type: 'effectPattern', channel: 'card', outcome: 'ignored' })
    const b = el.querySelectorAll((n) => n.nodeName === 'BUTTON')[0]
    expect(b.textContent).toBe('Bugün de Dalga sesi · 8 dk')
    await act(async () => b.click())
    expect(go).toHaveBeenCalledWith('dalga')
    rows = loadSaid({ now: NOW })
    expect(rows).toHaveLength(1)
    expect(rows[0].outcome).toBe('touched')
    await act(async () => root.unmount())
    // Kural 5 (memory.js): aynı an türü üç kez gösterilip dokunulmazsa 14 gün dinlenir; dokunulan satır sayacı sıfırlar
    const day = (d) => ({ ...rows[0], at: new Date(2026, 8, d, 20, 30).toISOString(), date: `2026-09-${String(d).padStart(2, '0')}`, outcome: 'ignored' })
    expect(typeResting([day(20), day(22), day(24)], 'effectPattern', NOW)).toBe(true)
    expect(typeResting([day(20), day(22), { ...day(24), outcome: 'touched' }], 'effectPattern', NOW)).toBe(false)
    // Düğmesiz kart (onStart yok ya da süre yok) sonuçsuz yazılır: sayaca girmez
    for (const k of Object.keys(store)) if (k === NEF_SAID_KEY) delete store[k]
    const el2 = document.createElement('div')
    const r2 = createRoot(el2)
    await act(async () => r2.render(h(CoachCard, { nef, now: NOW })))
    expect(loadSaid({ now: NOW })[0].outcome).toBeUndefined()
    await act(async () => r2.unmount())
  })
})

describe('model çağrısı yok', () => {
  it('Ana sayfa getTodayInsight\'ı hiç çağırmaz ve ağa gitmez (Nef girdisiyle de)', async () => {
    const fetch = vi.fn(async () => ({ json: async () => ({}) }))
    const prev = globalThis.fetch
    globalThis.fetch = fetch
    try {
      const el = document.createElement('div')
      const root = createRoot(el)
      const settings = { profile: null, reminders: null, consents: { coach: { granted: true, version: 1, date: NOW.toISOString() } } }
      store['gozolcum:prefs'] = JSON.stringify({ coach: true })
      // Ana sayfa saati gerçek saatten okur: kayıtlarla aynı gün olsun (yalnız Date sahte)
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(NOW)
      const said = nefCard({ input: input({ sessions: pattern() }), now: NOW }).text
      await act(async () => root.render(h(Home, { tests: [], sessions: pattern(), settings, nef: input({ sessions: pattern() }), onStart: () => {} })))
      expect(el.textContent.replace(/\u00a0/g, ' ')).toContain(said)
      expect(el.textContent).not.toMatch(/çevrimdışı öneri|Nef Göz Koçu|Nef düşünüyor/)
      await act(async () => root.unmount())
    } finally {
      globalThis.fetch = prev
      vi.useRealTimers()
    }
    expect(spy.insight).toBe(0)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('kaynakta: Ana sayfa ve kart getTodayInsight\'ı içe aktarmaz; sunucu dosyası duruyor', () => {
    const src = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8')
    for (const f of ['./CoachCard.jsx', '../screens/Home.jsx']) {
      expect(src(f), f).not.toMatch(/^import[^\n]*(getTodayInsight|lib\/coach\.js)/m)
      expect(src(f), f).not.toMatch(/getTodayInsight\(|fetch\(/)
    }
    expect(src('../../api/coach.js').length).toBeGreaterThan(0) // N2 mektup için silinmedi
  })
})
