// Dik Dur kameralı akış (TrueDepth taklidi): kamera sorusu, telefonu yasla, duruşunu gösterme, düzeltme, yüz kaybı,
// bitişteki oran, ikinci oturumda "aynı yerde mi", izin kapalı (metin-D1-onay.md; lib/postureSense.js)
import { describe, it, expect, vi, afterEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

const cam = vi.hoisted(() => ({ onFrame: null, error: null }))
vi.mock('../hooks/useFaceTracking.js', () => ({
  useFaceTracking: ({ enabled, onFrame }) => {
    cam.onFrame = enabled ? onFrame : null
    return { ready: true, error: enabled ? cam.error : null, face: true, mm: null, videoRef: { current: null } }
  },
}))

globalThis.IS_REACT_ACT_ENVIRONMENT = true
document.body.ownerDocument = document
const mem = new Map()
const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }
const { createRoot } = await import('react-dom/client')
const { default: DikDur } = await import('./DikDur.jsx')
const { SAFETY_KEY } = await import('../lib/dikDur.js')
const { CAM_KEY, CALIB_KEY } = await import('../lib/postureSense.js')

const NORMAL = { face: true, mm: 400, headY: 0 }
const TALL = { face: true, mm: 425, headY: 3 }

async function mount(props = {}) {
  document.body.childNodes.length = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => root.render(h(DikDur, { storage, trueDepth: true, onBack: () => {}, ...props })))
  const all = () => document.body
  const btn = (label) => all().querySelectorAll((n) => n.nodeName === 'BUTTON' && (n.textContent.trim() === label || n.getAttribute('aria-label') === label))[0]
  const tap = async (label) => { const b = btn(label); if (!b) throw new Error(`düğme yok: ${label} — ${all().textContent}`); await act(async () => b.click()) }
  // ms boyunca 100 ms'de bir kare (frame null: yüz yok)
  const feed = async (frame, ms) => {
    for (let t = 0; t < ms; t += 100) {
      await act(async () => {
        if (frame) cam.onFrame?.(frame)
        vi.advanceTimersByTime(100)
      })
    }
  }
  return { btn, tap, feed, text: () => all().textContent }
}

afterEach(() => { vi.useRealTimers(); mem.clear(); cam.error = null })

describe('Dik Dur · kamera', () => {
  it('ilk oturum: soru → yasla → iki duruş → kısa tur; düzeltme, yüz kaybında bekleme, bitişte oran', async () => {
    vi.useFakeTimers()
    mem.set(SAFETY_KEY, '1')
    let got = null
    const v = await mount({ onFinish: (r) => { got = r } })
    await v.tap('Kısa tur · 2 dakika')
    expect(v.text()).toContain('Kamerayla takip edelim mi?')
    expect(v.text()).toContain('Kamera omuzlarını önden göremez; omuz adımını kendin yaparsın.')
    await v.tap('Kamerayla')
    expect(JSON.parse(mem.get(CAM_KEY))).toEqual({ asked: true, on: true })
    expect(v.text()).toContain('Telefonu göz hizana yakın, bir kol boyu uzağa yasla. Yüzün ekranda görünsün.')
    await v.tap('Hazırım')
    expect(v.text()).toContain('Her zamanki gibi otur.')
    await v.feed(NORMAL, 5100)
    expect(v.text()).toContain('Şimdi dikleş: boyunu uzat, çeneni içeri çek.')
    await v.feed(null, 1000) // yüz yok: sayaç bekler
    expect(v.text()).toContain('Yüzünü göremiyorum. Sayaç sen görünene kadar bekliyor.')
    await v.feed(TALL, 5100)
    expect(v.text()).toContain('Tamam, iki duruşunu da öğrendim.')
    expect(JSON.parse(mem.get(CALIB_KEY)).ok).toBe(true)
    await v.tap('Kısa tur · 2 dakika')
    expect(v.text()).toContain('Boyunu uzat')
    await v.feed(NORMAL, 2500) // dik değil: 2 sn sonra düzeltme
    expect(v.text()).toContain('Biraz daha uzat.')
    await v.feed(TALL, 7600) // tutma biter
    expect(v.text()).toContain('Hazırlan')
    // kalanını dik duruşta bitir (omuz adımında not)
    for (let i = 0; i < 120 && !v.text().includes('Bitti'); i++) {
      await v.feed(TALL, 1000)
      if (v.text().includes('Omuzlarını zorlamadan')) expect(v.text()).toContain('Omuzlarını kamera göremiyor; bu adımı kendin yap.')
    }
    expect(v.text()).toContain('Bitti')
    expect(v.text()).toMatch(/Tuttuğun sürenin %\d+'[a-zıöüç]+ dik duruşundaydın\./)
    await v.tap('Bitir')
    expect(got).toMatchObject({ type: 'dik-dur', mode: 'kisa', reps: 9, cameraUsed: true })
    expect(got.inPose).toBeGreaterThan(0.6)
    expect(got.inPose).toBeLessThan(1)
  })
  it('ikinci oturum: "Telefon geçen seferki yerinde mi?" Evet → doğrudan tur; giriş ekranında kamera düğmesi', async () => {
    vi.useFakeTimers()
    mem.set(SAFETY_KEY, '1')
    mem.set(CAM_KEY, JSON.stringify({ asked: true, on: true }))
    mem.set(CALIB_KEY, JSON.stringify({ normal: { d: 400, p: 0 }, tall: { d: 425, p: 3 }, ok: true }))
    const v = await mount()
    expect(v.text()).toContain('Kamerayla takip')
    expect(v.text()).toContain('Başının duruşuna bakar')
    await v.tap('Kısa tur · 2 dakika')
    await v.tap('Hazırım')
    expect(v.text()).toContain('Telefon geçen seferki yerinde mi?')
    await v.tap('Evet')
    expect(v.text()).toContain('Boyunu uzat')
  })
  it('kamerasız seçilirse doğrudan başlar; TrueDepth yoksa soru da düğme de yok', async () => {
    vi.useFakeTimers()
    mem.set(SAFETY_KEY, '1')
    let v = await mount()
    await v.tap('Kısa tur · 2 dakika')
    await v.tap('Kamerasız')
    expect(JSON.parse(mem.get(CAM_KEY))).toEqual({ asked: true, on: false })
    expect(v.text()).toContain('Boyunu uzat')
    mem.delete(CAM_KEY)
    v = await mount({ trueDepth: false })
    expect(v.text()).not.toContain('Kamerayla takip')
    await v.tap('Kısa tur · 2 dakika')
    expect(v.text()).toContain('Boyunu uzat')
  })
  it('kamera izni kapalıysa onaylı uyarı ve kamerasız devam', async () => {
    vi.useFakeTimers()
    mem.set(SAFETY_KEY, '1')
    mem.set(CAM_KEY, JSON.stringify({ asked: true, on: true }))
    cam.error = 'permission'
    const v = await mount()
    await v.tap('Kısa tur · 2 dakika')
    expect(v.text()).toContain("Kamera izni kapalı. Açmak için Ayarlar'a git.")
    await v.tap('Kamerasız')
    expect(v.text()).toContain('Boyunu uzat')
  })
})
