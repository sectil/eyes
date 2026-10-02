// App · Nef bağlama (N1 aşama 4; ANA_OTURUM_ISTEMI madde 6–7): Nef girdisi App'te bir kez kurulur ve AYNI girdi hem Ana
// sayfa kartına (Home → CoachCard) hem bildirim planına (notifyAll.planAll `nef`) gider. Dil Intl ile (<html lang>).
// Hava önbelleği yalnız weather rızasıyla okunur; Nef ağa hiçbir şey göndermez (model çağrısı yok). Kart yalnız güçlü
// haberde (sahip kararı 2026-10-02): aynı gün yağmur–yürüyüş anı olsa da kart örüntüyü söyler; hava anı bildirim tarafında.
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { Node } from './test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] }, key: (i) => Object.keys(store)[i] ?? null, get length() { return Object.keys(store).length } }
globalThis.scrollTo = () => {}
globalThis.matchMedia ??= () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
globalThis.innerHeight ??= 800
Node.prototype.getBoundingClientRect ??= () => ({ top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100 })
const ctx2d = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ctx2d), set: (t, k, v) => { t[k] = v; return true } })
Node.prototype.getContext ??= () => ctx2d
globalThis.requestAnimationFrame ??= () => 0
globalThis.cancelAnimationFrame ??= () => {}
document.documentElement.lang = 'tr'
globalThis.devicePixelRatio = 2
globalThis.location ??= { search: '', hash: '', href: 'http://localhost/', pathname: '/' }
globalThis.screen = { width: 390, height: 844 }

// Ana sayfa yerine yalnız Nef kartı (Home'un kendisi Home testlerinde): App'in Home'a verdiği props yakalanır
const cap = vi.hoisted(() => ({ home: null, plans: [], insight: 0 }))
vi.mock('./screens/Home.jsx', async (orig) => {
  const real = await orig()
  const { createElement } = await import('react')
  const { default: CoachCard } = await import('./components/CoachCard.jsx')
  return { ...real, default: (p) => { cap.home = p; return createElement(CoachCard, { nef: p.nef }) } }
})
vi.mock('./lib/notifyAll.js', async (orig) => {
  const real = await orig()
  return { ...real, planAll: (input) => { cap.plans.push(input); return real.planAll(input) } }
})
vi.mock('./lib/coach.js', async (orig) => {
  const real = await orig()
  return { ...real, getTodayInsight: (...a) => { cap.insight++; return real.getTodayInsight(...a) } }
})

const NOW = new Date(2026, 8, 30, 10, 0) // Çarşamba 10.00
const iso = (d, hh = 9) => new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - d, hh).toISOString()
const dayStart = new Date(2026, 8, 30).getTime()
const hours = Array.from({ length: 24 }, (_, i) => ({ at: dayStart + i * 3600000, precipChance: i >= 19 && i < 22 ? 0.8 : 0.05, apparentC: 22, tempC: 21 }))

function seed() {
  const settings = {
    intro: { seen: true, version: 99, date: iso(30) },
    screening: { date: iso(30) },
    account: { mode: 'guest', date: iso(30) },
    profile: { date: iso(30) },
    identity: { name: 'Deniz', birthDate: '1983-04-12', city: '', avatar: { kind: 'letter', hue: 188, dataUrl: null } },
    identitySetup: { date: iso(30) },
    irisPlanSeen: { date: iso(30) },
    setupCorrection: 'reading',
    firstLookPending: null,
    calibration: { pxPerMm: 6.3, dpr: 2, screenW: 390, screenH: 844, method: 'ruler', date: iso(30) },
    distance: { focalPx: 1400, irisPxAt40: 40, method: 'face', date: iso(30) },
    releaseSeen: 'zzzz',
    firstReportSeen: { date: iso(25) },
    consents: { weather: { granted: true, date: iso(10), version: 1 } },
    reminders: { optIn: 'yes', types: { walk: { on: true, time: '19:30', days: [0, 1, 2, 3, 4, 5, 6] } } },
  }
  const sessions = [
    { id: 's1', type: 'game', game: 'snake', score: 10, seconds: 60, control: 'touch', date: iso(20) },
    { id: 's2', type: 'game', game: 'snake', score: 12, seconds: 60, control: 'touch', date: iso(1) },
    // Son 5 Dalga sesi seansı: sakinlik ortalama 4 → 6 (F2.C örüntü)
    ...[[2, 4, 6], [3, 4, 6], [4, 3, 6], [5, 4, 5], [6, 5, 7]].map(([d, before, after]) => ({ id: `d${d}`, type: 'dalga', mode: 'sakin', before, after, seconds: 300, date: iso(d, 12) })),
  ]
  store['gozolcum:v1'] = JSON.stringify({ version: 1, settings, tests: [], sessions })
  store['gozolcum:sky-place'] = JSON.stringify({ il: 'İzmir', ilce: 'Gaziemir', approx: false })
  store['gozolcum:sky-cache'] = JSON.stringify({ at: new Date(NOW.getTime() - 3600000).toISOString(), data: { fetchedAt: NOW.getTime() - 3600000, hours, days: [] } })
}

let fetchCalls = []
const realFetch = globalThis.fetch
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  vi.stubEnv('VITE_TEST_UNLOCK', '1') // SKY_UI (hava arayüzü ve hava verisi) açık
  globalThis.fetch = async (url) => {
    fetchCalls.push(String(url))
    return { ok: false, json: async () => ({}) }
  }
})
afterAll(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  globalThis.fetch = realFetch
})

describe('App · Nef girdisi karta ve planlayıcıya', () => {
  it('aynı girdi: kart örüntüyü söyler (yağmur–yürüyüş anı kartta yok); planAll Nef girdisini ve hava önbelleğini alır; model çağrısı yok', { timeout: 60000 }, async () => {
    seed()
    const { default: App } = await import('./App.jsx')
    const { createRoot } = await import('react-dom/client')
    const el = document.createElement('div')
    const root = createRoot(el)
    await act(async () => root.render(h(App)))
    await act(async () => {})

    // Kart girdisi
    const nef = cap.home?.nef
    expect(nef).toBeTruthy()
    expect(nef.lang).toBe('tr')
    expect(nef.sessions).toHaveLength(7)
    expect(nef.reminders.types.walk.time).toBe('19:30')
    expect(nef.weather?.cache?.data?.hours).toHaveLength(24)
    expect(nef.path).toMatchObject({ doneToday: false })
    expect(nef.who5Low).toBe(false)
    expect(el.textContent).toMatch(/^NefSon 5 Dalga sesi seansında sakinlik puanın ortalama 4'ten 6'ya\u00a0çıktı\.46010/) // sonrası sekme çubuğu
    expect(el.textContent).not.toMatch(/yağmur|Apple Weather/)

    // Plan girdisi: aynı dil ve gün olguları; hava önbelleği (sabah havası kapalı olsa da), Nef bildirimi kendi aralığında
    const plan = cap.plans.at(-1)
    expect(plan.nef).toMatchObject({ lang: nef.lang, pathDoneToday: nef.path.doneToday, who5Low: nef.who5Low })
    expect(Array.isArray(plan.nef.rows)).toBe(true)
    expect(plan.weather?.cache?.data?.hours).toHaveLength(24)
    expect(plan.morningWeather ?? null).toBeNull()

    // Kartın cümlesi hafızada bir kez
    const said = JSON.parse(store['gozolcum:nef-said'] ?? '[]').filter((r) => r.channel === 'card')
    expect(said).toHaveLength(1)
    expect(said[0]).toMatchObject({ type: 'effectPattern', date: '2026-09-30' })

    // Ağa giden yok: Nef sunucusu (api/coach) hiç çağrılmadı
    expect(cap.insight).toBe(0)
    expect(fetchCalls.filter((u) => /coach/.test(u))).toEqual([])
    await act(async () => root.unmount())
  })
})
