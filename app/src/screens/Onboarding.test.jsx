// Kurulum (screens/Onboarding.jsx) — karar 2026-09-29 (b) "ilk açılışta önce ölçüm" (lib/setupFlow.js): İlk Bakış
// hesaptan önce yapılır, sonucu initial.firstLook'ta gelir; kurulum güvenlik bilgisi → sorular olur. Güvenlik ekranının
// üst satırı kurulumda "Yola başlamadan önce"; Profilim → Sorularım'da (Flags) eskisi gibi "Başlamadan önce".
import { describe, it, expect, vi } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
vi.mock('../hooks/useFaceTracking.js', () => ({ useFaceTracking: () => ({ videoRef: { current: null }, ready: false, error: null, native: false }) }))
vi.mock('../lib/native.js', async (orig) => ({ ...(await orig()), haptic: () => {} }))
// Sorular ekranı tuvale çizer (iris); burada yalnız sıra sınanır
vi.mock('./IrisQuestions.jsx', async () => { const { createElement } = await import('react'); return { default: () => createElement('p', null, 'IRIS-SORULARI') } })

const { createRoot } = await import('react-dom/client')
const { default: Onboarding, Flags } = await import('./Onboarding.jsx')
const { default: FirstLook } = await import('./FirstLook.jsx')

const LOOK = { blinks: 6, seconds: 20, method: 'truedepth', date: '2026-09-29T10:00:00.000Z' }

async function mount(initial) {
  const container = document.createElement('div')
  const root = createRoot(container)
  const done = []
  await act(async () => root.render(h(Onboarding, { initial, trueDepth: false, sessions: [], domainOf: () => null, onDone: (p) => done.push(p) })))
  const buttons = () => container.querySelectorAll((n) => n.nodeName === 'BUTTON')
  const tap = async (text) => {
    const b = buttons().find((x) => x.textContent.includes(text))
    if (!b) throw new Error(`düğme yok: ${text}`)
    await act(async () => b.click())
  }
  return { container, tap, done, unmount: () => act(async () => root.unmount()) }
}

describe('kurulum: İlk Bakış hesaptan önce yapıldıysa', () => {
  it('güvenlik bilgisi "Yola başlamadan önce" der; "Anladım, devam"dan sonra İlk Bakış değil sorular gelir', async () => {
    const m = await mount({ firstLook: LOOK })
    expect(m.container.textContent).toContain('Yola başlamadan önce')
    expect(m.container.textContent).not.toContain('Önce bir şey fark edelim')
    await m.tap('Anladım, devam')
    expect(m.container.textContent).not.toContain('Önce bir şey fark edelim')
    expect(m.container.textContent).not.toContain('Yola başlamadan önce')
    expect(m.container.textContent).toContain('IRIS-SORULARI')
    await m.unmount()
  })
  it('yedek: sonuç yoksa güvenlik bilgisinden sonra İlk Bakış gelir (eski sıra)', async () => {
    const m = await mount({})
    await m.tap('Anladım, devam')
    expect(m.container.textContent).toContain('Önce bir şey fark edelim')
    await m.unmount()
  })
  it('Profilim → Sorularım güvenlik bilgisi eski üst satırla ("Başlamadan önce")', () => {
    const html = renderToStaticMarkup(h(Flags, { profile: {}, bar: 1, onDone: () => {} }))
    expect(html).toContain('Başlamadan önce')
    expect(html).not.toContain('Yola başlamadan önce')
  })
})

describe('İlk Bakış ilerleme çubuğu', () => {
  it('ilk açılışta (bar null) çubuk yok; kurulumda ve Profilim\'de var', () => {
    expect(renderToStaticMarkup(h(FirstLook, { bar: null, onDone: () => {} }))).not.toContain('role="progressbar"')
    expect(renderToStaticMarkup(h(FirstLook, { bar: [0, 1], onDone: () => {} }))).toContain('role="progressbar"')
    expect(renderToStaticMarkup(h(FirstLook, { onDone: () => {} }))).toContain('role="progressbar"')
  })
})

// Doğrulama 2026-09-29: sonuç, sonuç ekranı açılır açılmaz bildirilir (onResult); "Devam" aynı nesneyi verir
describe('İlk Bakış: sonuç ekranı açılınca kayıt', () => {
  it('kamerasız sayım: 20 sn sonra onResult bir kez, sonra "Devam" aynı nesneyle onDone', async () => {
    vi.useFakeTimers()
    try {
      const container = document.createElement('div')
      const root = createRoot(container)
      const results = []
      const dones = []
      await act(async () => root.render(h(FirstLook, { bar: null, onResult: (l) => results.push(l), onDone: (l) => dones.push(l) })))
      const buttons = () => container.querySelectorAll((n) => n.nodeName === 'BUTTON')
      const btn = (text) => buttons().find((x) => x.textContent.includes(text))
      const fire = (node, type) => {
        const ev = { type, target: node, bubbles: true, defaultPrevented: false, preventDefault() { this.defaultPrevented = true }, stopPropagation() {}, timeStamp: Date.now(), pointerId: 1, button: 0, isPrimary: true }
        for (let n = node; n; n = n.parentNode) for (const fn of n.listeners?.[type] ?? []) fn(ev)
      }
      await act(async () => btn('Kamerasız').click())
      const tap = () => container.querySelectorAll((n) => n.nodeName === 'BUTTON' && String(n.getAttribute('class') ?? n.className).includes('fl-tap'))[0]
      expect(tap()).toBeTruthy()
      for (let i = 0; i < 4; i++) {
        await act(async () => fire(tap(), 'pointerdown'))
        await act(async () => { vi.advanceTimersByTime(1000) })
      }
      await act(async () => { vi.advanceTimersByTime(25000) })
      expect(container.textContent).toContain('kez kırptın')
      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({ blinks: 4, seconds: 20, method: 'self' })
      await act(async () => btn('Devam').click())
      expect(dones).toHaveLength(1)
      expect(dones[0]).toBe(results[0])
      await act(async () => root.unmount())
    } finally {
      vi.useRealTimers()
    }
  })
})
