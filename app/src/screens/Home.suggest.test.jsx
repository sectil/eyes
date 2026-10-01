// Ana sayfa · göz molası önerisi (lib/homeSuggest.js; SONSUZ_YOL.PLAN.v1 §3.A.4; onaylı yoga planı §B.2 kural 10):
// "Nefes · 5 dk" ve sakin seçenek "5 dk mola" her zaman 5 dk'lık nefes açar ('breath-5'), yolun basamağını değil. Yolun
// Nefes durağı ('breath-rest') basamağıyla açılır. Mola bandı yolun molası sürerken ve bittikten sonra "Mola · 5 dk".
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Node } from '../test/fakeDom.js'
import { createElement as h, act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } }
globalThis.scrollTo = () => {}
globalThis.matchMedia ??= () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
globalThis.innerHeight ??= 800
Node.prototype.getBoundingClientRect ??= () => ({ top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100 })
// Ölçüm kutucuğundaki çizimler için en küçük tuval (çizim sınanmaz)
const ctx2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ctx2d), set: (t, k, v) => { t[k] = v; return true } })
Node.prototype.getContext ??= () => ctx2d
globalThis.requestAnimationFrame ??= () => 0
globalThis.cancelAnimationFrame ??= () => {}

// Göz bütçesi deposu: durum testten verilir; başlatılan mola kaydedilir
const eye = vi.hoisted(() => ({ st: null, begun: [], hist: [] }))
vi.mock('../lib/eyeBudgetStore.js', async (orig) => ({
  ...(await orig()),
  eyeStatus: () => eye.st,
  beginRest: (why) => { eye.begun.push(why) },
  restHistory: () => eye.hist,
}))

const { createRoot } = await import('react-dom/client')
const { default: Home, SUGGEST_BREATH } = await import('./Home.jsx')
const breathView = (await import('../modules/breath/view.jsx')).default
const { PROGRAM_DAY_SEC } = await import('../lib/breath.js')

const MIN = 60000
const settings = { profile: null, reminders: null, consents: {} }
const iso = (d, h = 9) => { const t = new Date(); t.setDate(t.getDate() - d); t.setHours(h, 0, 0, 0); return t.toISOString() }
// n gün her gün yolu yapan eski kullanıcı (Y1 öncesi kayıtlar: stage yok)
function oldUser(n = 80) {
  const sessions = []
  for (let d = n; d >= 1; d--) {
    for (const g of ['isinma', 'uzak', 'yakinuzak', 'daire', 'kirpma']) sessions.push({ type: 'routine', setId: g, seconds: 40, date: iso(d) })
    sessions.push({ type: 'breath', seconds: 300, pattern: 'calm', date: iso(d) }, { type: 'game', game: 'track', date: iso(d) })
  }
  return sessions
}
const btns = (root) => root.querySelectorAll((n) => n.nodeName === 'BUTTON')
const byText = (root, t) => btns(root).find((b) => b.textContent.includes(t)) ?? null

beforeEach(() => {
  eye.st = { locked: false, due: null, used: 2 * MIN, budgetMs: 5 * MIN, leftMs: 3 * MIN }
  eye.begun = []
  eye.hist = []
})

async function mount(props) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(async () => root.render(h(Home, { tests: [], sessions: [], settings, ...props })))
  return { container, root }
}

describe('göz molası önerisi 5 dk\'lık nefes açar (yolun basamağı değil)', () => {
  it('ilerleme bağlamı açıkken birincil öneri "Nefes · 5 dk" → breath-5; mola bugünkü kuralla', async () => {
    const opened = []
    eye.st = { locked: false, due: 'budget', used: 5 * MIN, budgetMs: 5 * MIN, leftMs: 0 }
    const { container, root } = await mount({ eyeBudget: eye.st, onStart: (r) => opened.push(r) })
    const go = byText(container, 'Nefes · 5 dk')
    expect(go).not.toBeNull()
    await act(async () => go.click())
    expect(opened).toEqual([SUGGEST_BREATH])
    expect(eye.begun).toEqual(['path'])
    await act(async () => root.unmount())
  })
  // D9: sakin seçenek "5 dk mola" yolun içinde, yolun Nefes durağı beklemiyorken (aynı ekranda iki ayrı nefes okunmasın;
  // beklenti bu yüzden değişti: önce gün başında da vardı). Burada 1. günün Nefes durağı bitti.
  it('yeni kullanıcı 1. gün: sakin seçenek "5 dk mola" de breath-5 açar; mola bugünkü kuralla başlar (yolun istisnası yok)', async () => {
    const opened = []
    eye.st = { locked: false, due: null, used: MIN, budgetMs: 5 * MIN, leftMs: 4 * MIN }
    const sessions = [{ type: 'breath', seconds: 62, pattern: 'calm', stage: 'N1', date: new Date(Date.now() - MIN).toISOString() }]
    const { container, root } = await mount({ sessions, eyeBudget: eye.st, onStart: (r) => opened.push(r) })
    const alt = byText(container, '5 dk mola')
    expect(alt).not.toBeNull()
    await act(async () => alt.click())
    expect(opened).toEqual([SUGGEST_BREATH])
    expect(eye.begun).toEqual(['path']) // Y1 öncesi kural: son moladan beri ≥ 1 dk göz çalışması
    await act(async () => root.unmount())
  })
  // 5 saniye turu 6 (Yön B, ilk 7 gün): sıradaki durak büyük kartta, sade listede tekrar etmez. Durağın kendisi kartla
  // açılır (aşağıdaki test); listede bir sonraki duraklar sıralı, dokununca "Önce: Nefes" der ve açılmaz.
  it('yolun Nefes durağı breath-rest ile açılır (1. gün: 1 dk nefesten sonra mola başlamaz); listede tekrar yok', async () => {
    const opened = []
    eye.st = { locked: false, due: null, used: MIN, budgetMs: 5 * MIN, leftMs: 4 * MIN }
    // 1. gün: E testi ve Çemberler bitti, sıradaki Nefes (1 dk)
    const now = Date.now()
    const tests = ['R', 'L', 'OU'].map((e, i) => ({ type: 'va-weekly', eye: e, date: new Date(now - (10 - i) * MIN).toISOString() }))
    const sessions = [{ type: 'game', game: 'track', date: new Date(now - 3 * MIN).toISOString() }]
    const { container, root } = await mount({ tests, sessions, eyeBudget: eye.st, onStart: (r) => opened.push(r) })
    // D9: yol başladıktan sonra sıradaki durak yolda yerinde ("…, sırada"); önce Yön B listesinde hiç yoktu
    expect(btns(container).find((b) => (b.attrs['aria-label'] ?? '') === 'Nefes, mola, 1 dakika, sırada')).toBeDefined()
    const later = btns(container).find((b) => (b.attrs['aria-label'] ?? '').startsWith('Göz kırpma'))
    expect(later?.attrs['aria-label']).toMatch(/Önce Nefes$/)
    await act(async () => later.click())
    expect(opened).toEqual([]) // ilerideki durak açılmaz
    const stop = byText(container, 'Yola devam et')
    await act(async () => stop.click())
    expect(opened).toEqual(['breath-rest'])
    expect(eye.begun).toEqual([]) // kullanılan 1 + 2. bölüm 1 dk ≤ 5: mola nefes kadar
    await act(async () => root.unmount())
  })
  it('büyük düğme yolun sıradaki Nefes durağıysa ("Yola devam et · Nefes · 1 dk") breath-rest açar, breath-5 değil', async () => {
    const opened = []
    eye.st = { locked: false, due: null, used: MIN, budgetMs: 5 * MIN, leftMs: 4 * MIN }
    const now = Date.now()
    const tests = ['R', 'L', 'OU'].map((e, i) => ({ type: 'va-weekly', eye: e, date: new Date(now - (10 - i) * MIN).toISOString() }))
    const sessions = [{ type: 'game', game: 'track', date: new Date(now - 3 * MIN).toISOString() }]
    const { container, root } = await mount({ tests, sessions, eyeBudget: eye.st, onStart: (r) => opened.push(r) })
    const go = byText(container, 'Yola devam et')
    expect(go?.textContent).toContain('Nefes · 1 dk')
    await act(async () => go.click())
    expect(opened).toEqual(['breath-rest'])
    expect(eye.begun).toEqual([]) // yolun kuralı: 1. gün mola nefes kadar
    await act(async () => root.unmount())
  })
  it('breath-5 ekranı her zaman 5 dk, basamaksız (stage yok, günün ritmi yok); breath-rest yolun basamağıyla', () => {
    const ctx = { tests: [], sessions: [], settings, native: {}, store: {}, back: () => {}, refresh: () => {}, go: () => {} }
    const five = breathView.render(ctx, SUGGEST_BREATH)
    expect(five.props).toMatchObject({ presetSec: PROGRAM_DAY_SEC, minSec: null, pathMix: null, moreSec: null, extra: null, askCalm: true })
    const path = breathView.render(ctx, 'breath-rest')
    expect(path.props).toMatchObject({ presetSec: 60, minSec: 60, extra: { stage: 'N1' } }) // yeni kullanıcı 1. gün
    const old = breathView.render({ ...ctx, sessions: oldUser(80) }, SUGGEST_BREATH)
    expect(old.props.presetSec).toBe(PROGRAM_DAY_SEC)
    expect(breathView.render({ ...ctx, sessions: oldUser(80) }, 'breath-rest').props.presetSec).toBe(180)
  })
})

// D9: yol her gün uzun yol (LongPath); bant yolun içinde .lp-band.nefes, süresi altta ("Mola · N dk"). Sıradaki durak
// gün ortasında yolda yerinde ve vurgulu (erişilebilir adı "…, sırada"); süre bandın yazdığı mola süresidir.
describe('mola bandı: yolun molası sürerken ve bittikten sonra "Mola · 5 dk" (eski kullanıcı)', () => {
  const band = (html) => html.match(/class="lp-band nefes[^"]*"[^>]*>[\s\S]*?<small>(.*?)<\/small>/)?.[1]?.replace(/\u00a0/g, ' ')
  // haftalık E testi 3 gün, okuma 2 gün önce: bugün yolda ölçüm yok
  const tests = [...['R', 'L', 'OU'].map((e) => ({ type: 'va-weekly', eye: e, logMAR: 0.1, date: iso(3) })), { type: 'reading', wpm: 180, date: iso(2) }]
  const render = (props) => renderToStaticMarkup(h(Home, { tests, settings, onStart: () => {}, ...props }))
  // 1. bölüm bugün bitti (Isınma, Uzağa bakış, Çemberler, Yakın–uzak)
  const today = () => [...['isinma', 'uzak', 'yakinuzak'].map((g) => ({ type: 'routine', setId: g, seconds: 40, date: new Date(Date.now() - 20 * MIN).toISOString() })), { type: 'game', game: 'track', date: new Date(Date.now() - 15 * MIN).toISOString() }]
  it('nefese dokunmadan önce, mola sürerken, nefes bitip kilit sürerken ve mola bittikten sonra 5 dk', () => {
    const s = [...oldUser(80), ...today()]
    const html = render({ sessions: s, eyeBudget: { locked: false, due: null, used: 3 * MIN, budgetMs: 5 * MIN, leftMs: 2 * MIN } })
    // 1. bölüm bitti, sıradaki Nefes. D9 v2 (sahibin kuralı; beklenti bu yüzden değişti: önce "yeni"): güncelleme gününde de
    // nefesi önceden yapmış kişide Nefes "Yeni" değil
    expect(html).toContain('aria-label="Nefes, mola, 5 dakika, sırada"')
    expect(band(html)).toBe('Mola · 5 dk')
    expect(band(render({ sessions: s, eyeBudget: { locked: true, reason: 'path', leftMs: 4 * MIN, due: null } }))).toBe('Mola · 5 dk')
    const withBreath = [...s, { type: 'breath', seconds: 185, pattern: 'calm', stage: 'N3', date: new Date(Date.now() - 2 * MIN).toISOString() }]
    expect(band(render({ sessions: withBreath, eyeBudget: { locked: true, reason: 'path', leftMs: MIN, due: null } }))).toBe('Mola · 5 dk')
    eye.hist = [{ reason: 'path', start: Date.now() - 6 * MIN, until: Date.now() - MIN }]
    expect(band(render({ sessions: withBreath, eyeBudget: { locked: false, due: null, used: 0, budgetMs: 5 * MIN, leftMs: 5 * MIN } }))).toBe('Mola · 5 dk')
  })
  // D9: ilk 7 günde de bant var (yol her gün aynı uzun yol; sekme çubuğunun kenarında kesilmesini Home.jsx önler);
  // önce (Yön B) ilk 7 günde bant yoktu. Nefes bitti, yolun molası başlamadı: mola nefes kadar (S0 kararı 8: 1. gün 1 dk).
  it('yeni kullanıcı 1. gün: nefes bitti, yolun molası başlamadı → bant "Mola · 1 dk", tamam', () => {
    const s = [{ type: 'breath', seconds: 62, pattern: 'calm', stage: 'N1', date: new Date(Date.now() - MIN).toISOString() }]
    const html = render({ sessions: s, eyeBudget: { locked: false, due: null, used: MIN, budgetMs: 5 * MIN, leftMs: 4 * MIN } })
    expect(band(html)).toBe('Mola · 1 dk')
    expect(html).toContain('aria-label="Nefes, mola, tamam"')
  })
})
