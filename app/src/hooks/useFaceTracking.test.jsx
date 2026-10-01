// Web / iris yolu (TrueDepth'siz iPhone, tarayıcı): kamera akışı test ortasında biterse hata 'load' olur ve donmuş
// kare ölçülmez (AcuityTest "Kamera durdu" → "Kamerasız devam" bu hataya bakar). Kamera yeniden açılınca eski hata
// silinir. Sahte DOM (test/fakeDom.js); MediaPipe ve getUserMedia sahte.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const cam = vi.hoisted(() => ({ track: null, starts: 0, stops: 0, fail: false }))
vi.mock('../lib/distance.js', () => ({
  loadLandmarker: async () => ({}),
  startCamera: async (video) => {
    cam.starts++
    if (cam.fail) throw Object.assign(new Error('kamera yok'), { name: 'NotReadableError' })
    const track = new EventTarget()
    track.readyState = 'live'
    cam.track = track
    video.srcObject = { getVideoTracks: () => [track], getTracks: () => [track] }
    video.readyState = 4
    return () => { cam.stops++ }
  },
  measureFrame: () => ({ face: true, irisPx: 20, videoW: 640 }),
  createMedian: () => ({ push: (v) => v }),
  distanceMm: () => 400,
}))

const { createRoot } = await import('react-dom/client')
const { useFaceTracking } = await import('./useFaceTracking.js')

let seen = null
let frames = 0
// Karşılaştırma yalnız düz alanlarla (videoRef içindeki sahte DOM düğümü hata metnini bozmasın)
const view = () => ({ ready: seen.ready, error: seen.error, face: seen.face, mm: seen.mm })
function Probe({ enabled }) {
  const f = useFaceTracking({ enabled, distanceCal: { irisPxAt40: 20 }, onFrame: () => { frames++ } })
  seen = f
  return h('video', { ref: f.videoRef })
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] })
  globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(performance.now()), 16)
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
  Object.assign(cam, { track: null, starts: 0, stops: 0, fail: false })
  seen = null
  frames = 0
})
afterEach(() => {
  vi.useRealTimers()
})

const flush = async (ms = 0) => {
  await act(async () => {
    await Promise.resolve()
    vi.advanceTimersByTime(ms)
  })
}

describe('useFaceTracking · web yolu', () => {
  it('akış biterse ("ended") hata load; donmuş kare ölçülmeye devam etmez', async () => {
    const root = createRoot(document.createElement('div'))
    await act(async () => root.render(h(Probe, { enabled: true })))
    await flush(200)
    expect(view()).toMatchObject({ ready: true, error: null, face: true, mm: 400 })
    expect(frames).toBeGreaterThan(5)
    await act(async () => cam.track.dispatchEvent(new Event('ended')))
    expect(view()).toMatchObject({ error: 'load', face: false, mm: null })
    const n = frames
    await flush(1000)
    expect(view()).toMatchObject({ error: 'load', face: false, mm: null })
    expect(frames).toBe(n) // donmuş kare ölçülmez
    await act(async () => root.unmount())
    expect(cam.stops).toBe(1)
  })

  it('kamera yeniden açılınca eski hata silinir; yine açılmazsa hata geri gelir', async () => {
    cam.fail = true
    const root = createRoot(document.createElement('div'))
    await act(async () => root.render(h(Probe, { enabled: true })))
    await flush(50)
    expect(view().error).toBe('load')
    await act(async () => root.render(h(Probe, { enabled: false })))
    cam.fail = false
    await act(async () => root.render(h(Probe, { enabled: true })))
    expect(view().error).toBeNull()
    await flush(200)
    expect(view()).toMatchObject({ error: null, face: true })
    await act(async () => root.render(h(Probe, { enabled: false })))
    cam.fail = true
    await act(async () => root.render(h(Probe, { enabled: true })))
    await flush(50)
    expect(view().error).toBe('load')
    await act(async () => root.unmount())
  })
})
