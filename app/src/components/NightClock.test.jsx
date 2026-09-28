// Gece saati (tasarım A): her durumda ne görünür, dokunuşlar ne yapar. Sahte DOM (test/fakeDom.js), jsdom yok.
import { describe, it, expect, vi } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const { default: NightClock, END_ARM_MS } = await import('./NightClock.jsx')

const NOW = new Date(2026, 8, 28, 23, 52, 40)
const ALARM = new Date(2026, 8, 29, 6, 29).getTime()
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function mount(props) {
  const container = document.createElement('div')
  const root = createRoot(container)
  const base = { now: NOW, left: 1320, total: 1800, state: 'playing', alarmLabel: '06:29', alarmAt: ALARM, onTap: vi.fn(), onEnd: vi.fn(), onKick: vi.fn(), ...props }
  await act(async () => root.render(h(NightClock, base)))
  const q = (pred) => container.querySelectorAll(pred)
  const cls = (c) => q((n) => (n.getAttribute('class') ?? '').split(' ').includes(c))
  const button = (label) => q((n) => n.nodeName === 'BUTTON' && n.textContent.trim() === label)[0]
  // Ekranda görünen yazı: yalnız VoiceOver'a giden (.dg-sr) satırlar hariç
  const visible = () => {
    const walk = (n) => (n.nodeType === 3 ? n._text : (n.getAttribute?.('class') ?? '').split(' ').includes('dg-sr') ? '' : n.childNodes.map(walk).join(''))
    return walk(container)
  }
  const sr = () => cls('dg-sr').map((n) => n.textContent)
  return { container, props: base, cls, button, visible, sr, rerender: (p) => act(async () => root.render(h(NightClock, { ...base, ...p }))) }
}

describe('NightClock (gece saati, tasarım A)', () => {
  it('çalarken: saat alt alta, kalan müzik çizgisi ve yazısı, alarm ve kalan süre; başka yazı yok', async () => {
    const r = await mount({})
    expect(r.visible()).toBe('2352Müzik · 22 dk sonra susarAlarm 06:29·6 sa 37 dk')
    expect(r.cls('dg-nc-clock')[0].getAttribute('aria-label')).toBe('Saat 23:52')
    expect(r.cls('dg-nc-line')[0].childNodes[0].style.width).toBe('73%')
    expect(r.button('Bitir')).toBeUndefined()
    // VoiceOver: durum, kısaltmasız süreler, dokunma ipucu
    expect(r.sr()).toEqual(['Dokununca Bitir düğmesi çıkar.', 'Müzik çalıyor', 'Müzik, 22 dakika sonra susar', 'Alarm 06:29, 6 saat 37 dakika sonra'])
  })
  it('müzik bitince: müzik göstergesi kaybolur, saat ve alarm kalır', async () => {
    const r = await mount({ state: 'done', left: 0 })
    expect(r.visible()).toBe('2352Alarm 06:29·6 sa 37 dk')
    expect(r.cls('dg-nc-line')).toHaveLength(0)
    expect(r.sr()).toContain('Müzik bitti')
  })
  it('hazırlanırken ve alarm yokken', async () => {
    expect((await mount({ state: 'preparing' })).visible()).toBe('2352Müzik hazırlanıyor…Alarm 06:29·6 sa 37 dk')
    expect((await mount({ alarmLabel: null, alarmAt: null })).visible()).toBe('2352Müzik · 22 dk sonra susar')
    // alarm 24 saatten uzak: etiket gün adını taşır, kalan süre yazılmaz
    expect((await mount({ alarmLabel: 'Cuma 06:29', alarmAt: new Date(2026, 9, 2, 6, 29).getTime() })).visible()).toBe('2352Müzik · 22 dk sonra susarAlarm Cuma 06:29')
  })
  it('ses başlamadıysa "dokun, başlat" onKick çağırır, ekran dokunuşu (Bitir) tetiklenmez', async () => {
    const r = await mount({ state: 'blocked' })
    await act(async () => r.button('Ses başlamadı · dokun, başlat').click())
    expect(r.props.onKick).toHaveBeenCalledTimes(1)
    expect(r.props.onTap).not.toHaveBeenCalled()
  })
  it('ekrana dokunmak onTap; "Bitir" çıktıktan hemen sonraki dokunuş sayılmaz (çift dokunuş müziği bitirmesin)', async () => {
    const r = await mount({})
    await act(async () => r.cls('dg-nc-clock')[0].click())
    expect(r.props.onTap).toHaveBeenCalledTimes(1)
    await r.rerender({ showEnd: true })
    await act(async () => r.button('Bitir').click())
    expect(r.props.onEnd).not.toHaveBeenCalled()
    await act(async () => wait(END_ARM_MS + 60))
    await act(async () => r.button('Bitir').click())
    expect(r.props.onEnd).toHaveBeenCalledTimes(1)
    expect(r.props.onTap).toHaveBeenCalledTimes(1) // Bitir dokunuşu ekrana geçmez
  })
})
