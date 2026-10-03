// Dik Dur ekranı (kamerasız): giriş → güvenlik (ilk kez) → adımlar → bitiş; metinler metin-D1-onay.md
import { describe, it, expect, vi, afterEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const mem = new Map()
const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }
globalThis.localStorage = storage
const { createRoot } = await import('react-dom/client')
const { default: DikDur } = await import('./DikDur.jsx')
const { SAFETY_KEY, totalSeconds, stepsOf } = await import('../lib/dikDur.js')

async function mount(props = {}) {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(h(DikDur, { storage, onBack: () => {}, ...props })))
  const all = () => document.body
  const btn = (label) => all().querySelectorAll((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${all().textContent}`); await act(async () => b.click()) }
  const run = async (ms) => { await act(async () => { vi.advanceTimersByTime(ms) }) }
  return { btn, tap, run, text: () => all().textContent }
}

afterEach(() => { vi.useRealTimers(); mem.clear() })

describe('Dik Dur ekranı', () => {
  it('giriş onaylı metinlerle; ilk kez güvenlik ekranı, "Anladım" ile ilk adım', async () => {
    vi.useFakeTimers()
    const v = await mount()
    for (const t of ['Dik Dur', 'Günde birkaç kez kısa bir dikleşme molası.', 'Saatlerce dik durman gerekmez.', 'Tam turu haftada 4 gün öneriyoruz.']) expect(v.text()).toContain(t)
    await v.tap('Kısa tur · 2 dakika')
    expect(v.text()).toContain('Başlamadan önce')
    expect(v.text()).toContain('Ağrı, baş dönmesi ya da kolunda uyuşma olursa dur.')
    await v.tap('Anladım')
    expect(mem.get(SAFETY_KEY)).toBe('1')
    expect(v.text()).toContain('Tekrar 1 / 3')
    expect(v.text()).toContain('Boyunu uzat')
    expect(v.text()).toContain('Başının tepesinden bir ip seni yukarı çekiyor gibi boyunu uzat.')
  })
  it('güvenlik görüldüyse doğrudan başlar; kısa tur sonunda bitiş ve "Bitir" kaydı', async () => {
    vi.useFakeTimers()
    mem.set(SAFETY_KEY, '1')
    let got = null
    const v = await mount({ onFinish: (r) => { got = r }, sessions: [], now: () => new Date(2026, 9, 3, 12) })
    await v.tap('Kısa tur · 2 dakika')
    expect(v.text()).toContain('Boyunu uzat')
    await v.run(10000) // ilk tutma biter → ara: sıradaki hareket görünür
    expect(v.text()).toContain('Çeneni içeri çek')
    expect(v.text()).toContain('Hazırlan')
    for (let i = 0; i < 40; i++) await v.run(1000 * 10)
    expect(v.text()).toContain('Bitti')
    expect(v.text()).toContain("3 hareket, 3'er tekrar · 2 dakika")
    expect(v.text()).toContain('Bu hafta 1 kez dikleştin.')
    await v.tap('Bitir')
    expect(got).toMatchObject({ type: 'dik-dur', mode: 'kisa', reps: 9, cameraUsed: false })
  })
  it('tam tur: bölüm arasında dinlenme ve "Şimdi başla"', async () => {
    vi.useFakeTimers()
    mem.set(SAFETY_KEY, '1')
    const v = await mount()
    await v.tap('Tam tur · 15 dakika')
    expect(v.text()).toContain('Bölüm 1 / 3 · Tekrar 1 / 10')
    expect(v.text()).toContain('Çeneni içeri çek')
    // ilk bölüm: 20 tutma + 19 ara, adım adım (her adımın zamanlayıcısı ekran yenilenince kurulur)
    for (const st of stepsOf('tam').slice(0, 39)) await v.run(st.s * 1000)
    expect(v.text()).toContain('Dinlen.')
    expect(v.text()).toContain('Sonraki bölüm 1 dakika sonra başlar.')
    expect(v.text()).toContain('1:00')
    await v.tap('Şimdi başla')
    expect(v.text()).toContain('Bölüm 2 / 3 · Tekrar 1 / 10')
    expect(totalSeconds('tam')).toBeGreaterThan(14 * 60)
  })
  it('çarpı kaydetmeden çıkar', async () => {
    vi.useFakeTimers()
    mem.set(SAFETY_KEY, '1')
    let back = 0
    let saved = 0
    const v = await mount({ onBack: () => { back += 1 }, onFinish: () => { saved += 1 } })
    await v.tap('Kısa tur · 2 dakika')
    await v.tap('Egzersizden çık')
    expect(back).toBe(1)
    expect(saved).toBe(0)
  })
})
