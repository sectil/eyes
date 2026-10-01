// Uyku sesi akışı (gece saati): müzik kendiliğinden bitince kayıt o anda saklanır, ekran saat + alarmla kalır,
// "Bitir" sonuca götürür; erken "Bitir" eskisi gibi. Oynatıcı ve ses motoru taklit (tarayıcı sesi yok).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }

const fake = { sec: 0, cb: null, phase: 'idle' }
vi.mock('../lib/dalgaSleep.js', async (orig) => ({
  ...(await orig()),
  createSleepPlayer: () => ({
    get phase() { return fake.phase },
    prepare: async () => true,
    listen: (cb) => { fake.cb = cb },
    start: async ({ onTick, onEnd }) => { fake.cb = { onTick, onEnd }; fake.phase = 'loop'; return true },
    resume: async () => true,
    stop: () => { fake.phase = 'stopped' },
    elapsed: () => fake.sec,
  }),
}))
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
    sleepPreset: { minutes: 1, lateMinutes: 0, auto: false, alarmLabel: '06:29', alarmAt: Date.now() + 6 * 3600e3 },
    onSave: vi.fn(), onExit: vi.fn(), onSleepEnd: vi.fn(), ...props,
  }
  await act(async () => root.render(h(Dalga, p)))
  const btn = (label) => container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.trim() === label)[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${container.textContent}`); await act(async () => b.click()) }
  const tapScreen = () => act(async () => container.querySelectorAll((n) => n.nodeName === 'MAIN')[0].click())
  return { p, btn, tap, tapScreen, text: () => container.textContent, unmount: () => act(async () => root.unmount()) }
}

describe('Dalga uyku ekranı (gece saati)', () => {
  beforeEach(() => { mem.clear(); fake.sec = 0; fake.cb = null; fake.phase = 'idle' })
  it('müzik kendiliğinden bitince: kayıt bir kez saklanır, saat ve alarm kalır; "Bitir" sonuca götürür', async () => {
    const r = await mount()
    await r.tap('Başlat')
    expect(r.text()).toContain('Müzik · 1 dk sonra susar')
    fake.sec = 60
    await act(async () => fake.cb.onEnd())
    expect(r.p.onSave).toHaveBeenCalledTimes(1)
    expect(r.p.onSave.mock.calls[0][0]).toMatchObject({ sleep: true, minutes: 1 })
    expect(r.p.onSleepEnd).toHaveBeenCalledTimes(1)
    expect(r.p.onSleepEnd.mock.calls[0][0]).toMatchObject({ planned: 1, seconds: 60, early: false })
    // ekran kalır: müzik göstergesi yok, alarm var, sonuç yok
    expect(r.text()).not.toContain('Müzik ·')
    expect(r.text()).toContain('Alarm 06:29')
    expect(r.text()).not.toContain('Uyku · ')
    expect(r.btn('Bitir')).toBeUndefined()
    await r.tapScreen()
    await act(async () => wait(END_ARM_MS + 60))
    await r.tap('Bitir')
    expect(r.text()).toContain('Uyku · 1 dk')
    expect(r.p.onSave).toHaveBeenCalledTimes(1) // Bitir ikinci kez kaydetmez
    expect(r.p.onSleepEnd).toHaveBeenCalledTimes(1)
    expect(r.p.onExit).not.toHaveBeenCalled()
    await r.unmount()
  })
  it('çalarken erken "Bitir": eskisi gibi hemen sonuç (30 sn altıysa kaydetmeden çıkış)', async () => {
    const r = await mount()
    await r.tap('Başlat')
    fake.sec = 40
    await r.tapScreen()
    await act(async () => wait(END_ARM_MS + 60))
    await r.tap('Bitir')
    expect(r.p.onSave).toHaveBeenCalledTimes(1)
    expect(r.p.onSleepEnd.mock.calls[0][0]).toMatchObject({ early: true })
    expect(r.text()).toContain('Uyku · 1 dk')
    await r.unmount()

    const s = await mount()
    await s.tap('Başlat')
    fake.sec = 10
    await s.tapScreen()
    await act(async () => wait(END_ARM_MS + 60))
    await s.tap('Bitir')
    expect(s.p.onSave).not.toHaveBeenCalled()
    expect(s.p.onExit).toHaveBeenCalledTimes(1)
    await s.unmount()
  })
})
