// Uyku sesi yoga dersi yüzünden başlamazsa (yerel oynatıcı "LESSON" → evre 'lesson'; PLAN.v3 §D.3): gece saati
// "Önce çalan dersi durdur." der, "dokun, başlat" düğmesi çıkmaz; "Bitir" kaydetmeden çıkar. Alarm kurulumundaki "Kur"
// ile başlamış oturumda da aynı. Bugünkü 'blocked' davranışı değişmez. Oynatıcı ve ses motoru taklit.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }

const fake = { phase: 'idle', result: 'lesson', starts: 0, resumes: 0 }
const makePlayer = () => ({
  get phase() { return fake.phase },
  prepare: async () => true,
  listen: () => {},
  start: async () => {
    fake.starts++
    fake.phase = fake.result
    return false
  },
  resume: async () => {
    fake.resumes++
    return false
  },
  stop: () => { fake.phase = 'stopped' },
  elapsed: () => 0,
})
vi.mock('../lib/dalgaSleep.js', async (orig) => ({ ...(await orig()), createSleepPlayer: () => makePlayer() }))
vi.mock('../lib/dalgaAudio.js', async (orig) => ({ ...(await orig()), createDalgaEngine: () => ({ unlock() {}, close() {}, pause() {}, resume() {} }) }))

const { createRoot } = await import('react-dom/client')
const { default: Dalga } = await import('./Dalga.jsx')
const { END_ARM_MS } = await import('../components/NightClock.jsx')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function mount(props) {
  const container = document.createElement('div')
  const root = createRoot(container)
  const p = {
    sessions: [],
    sleepPreset: { minutes: 30, lateMinutes: 0, auto: false, alarmLabel: '06:29', alarmAt: Date.now() + 6 * 3600e3 },
    onSave: vi.fn(), onExit: vi.fn(), onSleepEnd: vi.fn(), ...props,
  }
  await act(async () => root.render(h(Dalga, p)))
  const btn = (label) => container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.trim() === label)[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${container.textContent}`); await act(async () => b.click()) }
  const tapScreen = () => act(async () => container.querySelectorAll((n) => n.nodeName === 'MAIN')[0].click())
  return { p, btn, tap, tapScreen, text: () => container.textContent, unmount: () => act(async () => root.unmount()) }
}

describe('Dalga uyku ekranı: yoga dersi çalarken', () => {
  beforeEach(() => { mem.clear(); Object.assign(fake, { phase: 'idle', result: 'lesson', starts: 0, resumes: 0 }) })

  it('"Başlat": "Önce çalan dersi durdur."; "dokun, başlat" yok; "Bitir" kaydetmeden çıkar', async () => {
    const r = await mount()
    await r.tap('Başlat')
    expect(fake.starts).toBe(1)
    expect(r.text()).toContain('Önce çalan dersi durdur.')
    expect(r.text()).not.toContain('dokun, başlat')
    expect(r.btn('Ses başlamadı · dokun, başlat')).toBeUndefined()
    expect(r.text()).not.toContain('Müzik ·')
    expect(r.text()).toContain('Alarm 06:29') // alarm yine görünür (kurulu kalır)
    await r.tapScreen()
    await act(async () => wait(END_ARM_MS + 60))
    await r.tap('Bitir')
    expect(fake.resumes).toBe(0)
    expect(r.p.onSave).not.toHaveBeenCalled()
    expect(r.p.onSleepEnd).toHaveBeenCalledTimes(1)
    expect(r.p.onSleepEnd.mock.calls[0][0]).toMatchObject({ planned: 30, seconds: 0, early: true })
    expect(r.p.onExit).toHaveBeenCalledTimes(1)
    await r.unmount()
  })

  it('alarm kurulumunda "Kur" ile başlamış oturum da aynı evreyi gösterir', async () => {
    const player = makePlayer()
    fake.phase = 'lesson'
    const session = { player, minutes: 30, auto: false, run: Promise.resolve(false) }
    const r = await mount({ sleepPreset: { minutes: 30, lateMinutes: 0, auto: false, alarmLabel: '06:29', alarmAt: Date.now() + 6 * 3600e3, session } })
    await act(async () => wait(0))
    expect(r.text()).toContain('Önce çalan dersi durdur.')
    expect(r.btn('Ses başlamadı · dokun, başlat')).toBeUndefined()
    await r.unmount()
  })

  it('ders yokken ret (blocked) bugünkü gibi: "dokun, başlat" görünür ve yeniden dener', async () => {
    fake.result = 'blocked'
    const r = await mount()
    await r.tap('Başlat')
    expect(r.text()).not.toContain('Önce çalan dersi durdur.')
    await r.tap('Ses başlamadı · dokun, başlat')
    expect(fake.resumes).toBe(1)
    await r.unmount()
  })
})
