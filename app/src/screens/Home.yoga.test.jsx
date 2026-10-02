// Ana sayfa ve Yoga (PLAN.v3 §B.5, §D.7): web'de (isIOSApp yanlış) Pratikler listesinde yoga kutucuğu yok, iPhone
// uygulamasında var; yol bağlamına bugünün "Sonra yaparım" kaydı (lib/pathLater.js) girer.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const ios = vi.hoisted(() => ({ on: false }))
vi.mock('../lib/native.js', async (orig) => ({ ...(await orig()), isIOSApp: () => ios.on }))
// Yoga modülü ve görünümü: gerçek manifest henüz yoksa ya da web'de kutucuğu gizliyse de liste kuralı sınansın diye taklit
vi.mock('../modules/registry.js', async (orig) => {
  const mod = await orig()
  const real = mod.registry
  const yoga = { id: 'yoga', title: 'Yoga', routes: ['yoga'], kind: 'practice', ring: 'life', gates: {}, home: { section: 'practice', order: 33 } }
  const live = [...real.live.filter((m) => m.id !== 'yoga'), yoga]
  const order = (m) => m.home?.order ?? 999
  return { ...mod, registry: { ...real, live, inSection: (s) => live.filter((m) => m.home?.section === s).sort((a, b) => order(a) - order(b)) } }
})
vi.mock('../modules/views.js', async (orig) => {
  const real = await orig()
  const Lotus = () => h('svg', { 'data-icon': 'yoga' })
  return { ...real, viewFor: (id) => (id === 'yoga' ? { icon: Lotus } : real.viewFor(id)) }
})

// Yol bağlamı: buildPath'e giden ctx yakalanır; loadLater bugünün kaydını verir
vi.mock('../lib/today.js', async (orig) => {
  const real = await orig()
  return { ...real, buildPath: vi.fn((mods, ctx) => real.buildPath(mods, ctx)) }
})
const LATER = { day: 'bugün', later: ['yoga'] }
vi.mock('../lib/pathLater.js', async (orig) => ({ ...(await orig()), loadLater: vi.fn(() => LATER) }))

const { default: Home, onHome } = await import('./Home.jsx')
const { buildPath } = await import('../lib/today.js')
const { loadLater } = await import('../lib/pathLater.js')

const settings = { profile: null, reminders: null, consents: {} }
const render = () => renderToStaticMarkup(h(Home, { tests: [], sessions: [], settings, onStart: () => {} }))
const praxTitles = (html) => [...html.matchAll(/<button class="prax-tile"[^>]*>.*?<span class="title">([^<]+)<\/span>/g)].map((m) => m[1])

describe('Ana sayfa · Pratikler listesinde yoga', () => {
  beforeEach(() => {
    ios.on = false
  })
  it('web\'de yoga kutucuğu yok; öteki pratikler yerinde', () => {
    const titles = praxTitles(render())
    expect(titles.length).toBeGreaterThan(0)
    expect(titles).not.toContain('Yoga')
    expect(titles).toContain('Nefes')
  })
  it('iPhone uygulamasında var (Nefes ile Dalga arasında)', () => {
    ios.on = true
    const titles = praxTitles(render())
    expect(titles).toContain('Yoga')
    const i = titles.indexOf('Yoga')
    expect(titles[i - 1]).toBe('Nefes')
  })
  it('onHome: yalnız yoga platforma bağlı', () => {
    expect(onHome({ id: 'yoga' }, false)).toBe(false)
    expect(onHome({ id: 'yoga' }, true)).toBe(true)
    expect(onHome({ id: 'breath' }, false)).toBe(true)
  })
})

describe('Ana sayfa · yol bağlamı', () => {
  it('buildPath bağlamına bugünün "Sonra yaparım" kaydı (loadLater(now)) girer', () => {
    buildPath.mockClear()
    loadLater.mockClear()
    render()
    expect(loadLater).toHaveBeenCalledTimes(1)
    const [now] = loadLater.mock.calls[0]
    expect(now).toBeInstanceOf(Date)
    const ctx = buildPath.mock.calls[0][1]
    expect(ctx.later).toBe(LATER)
    expect(ctx.now).toBe(now)
  })
})
