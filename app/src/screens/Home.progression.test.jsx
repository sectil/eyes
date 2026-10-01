// Ana sayfa · ilerleme bağlamı (SONSUZ_YOL.PLAN.v1 §3.A.2, §3.G.1): ctx.progression Ana sayfada bir kez, kayıtlardan
// hesaplanır ve buildPath bağlamına girer; "Sonra yaparım" kaydı (ctx.later) yoga için aynen kalır. Yolda bugün ilk
// kez gelen durak "Yeni" rozetini taşır.
import { describe, it, expect, vi } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('../lib/today.js', async (orig) => {
  const real = await orig()
  return { ...real, buildPath: vi.fn((mods, ctx) => real.buildPath(mods, ctx)) }
})
const LATER = { day: 'bugün', later: ['yoga'] }
vi.mock('../lib/pathLater.js', async (orig) => ({ ...(await orig()), loadLater: vi.fn(() => LATER) }))

const { default: Home } = await import('./Home.jsx')
const { buildPath } = await import('../lib/today.js')

const settings = { profile: null, reminders: null, consents: {} }
const render = (tests, sessions) => renderToStaticMarkup(h(Home, { tests, sessions, settings, onStart: () => {} }))
const iso = (d) => new Date(Date.now() - d * 86400000).toISOString()

describe('Ana sayfa · ilerleme bağlamı', () => {
  it('yeni kullanıcı: buildPath bağlamında ctx.progression (pathDay 0) ve ctx.later birlikte', () => {
    buildPath.mockClear()
    render([], [])
    const ctx = buildPath.mock.calls[0][1]
    expect(ctx.later).toBe(LATER)
    expect(ctx.progression).toMatchObject({ pathDay: 0, seedDay: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) })
    expect(ctx.progression.mod.routine).toEqual({ D: 0, G: null, Dstage: 0 })
  })
  it('dün yolu yapan kişi: pathDay 1; yolda "Yeni" rozetli durak var (Yılan, Bugünün görevi)', () => {
    buildPath.mockClear()
    const tests = ['R', 'L', 'OU'].map((eye) => ({ type: 'va-weekly', eye, date: iso(1) }))
    const sessions = [{ type: 'game', game: 'track', date: iso(1) }, { type: 'breath', seconds: 60, date: iso(1) }, { type: 'routine', setId: 'kirpma', seconds: 30, date: iso(1) }]
    const html = render(tests, sessions)
    const ctx = buildPath.mock.calls[0][1]
    expect(ctx.progression.pathDay).toBe(1)
    const keys = buildPath.mock.results[0].value.stops.map((s) => s.key)
    expect(keys).toEqual(expect.arrayContaining(['snake', 'notice']))
    expect(html).toContain('Yeni')
  })
})
