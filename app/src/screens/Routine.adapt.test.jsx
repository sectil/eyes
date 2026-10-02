// Egzersizde kendini iyileştirme (lib/gazeAdapt.js) ekran akışı: bakış adımı bitince model güncellenir.
// Bu test, adım değiştiği ilk karede eski adımın yönüyle toplayıcı kurulması hatasını yakaladı.
import { describe, it, expect, vi } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } }
globalThis.innerWidth = 390
globalThis.innerHeight = 844
let onFrameCb = null
vi.mock('../hooks/useFaceTracking.js', () => ({ useFaceTracking: (o) => { onFrameCb = o.onFrame; return { videoRef: { current: null }, ready: true, error: null, native: true } } }))
vi.mock('../lib/cue.js', () => ({ cue: () => {}, speak: () => {}, unlockAudio: () => {} }))
vi.mock('../lib/native.js', () => ({ haptic: () => {} }))
vi.mock('../lib/voiceCue.js', () => ({ cuePhrase: () => {}, sayPhrase: () => {}, preloadPhrases: () => {} }))
vi.mock('../lib/breathSfx.js', () => ({ breathContext: () => null, unlockBreathSfx: () => {}, releaseBreathSfx: () => {} }))
vi.mock('../components/ExerciseArt.jsx', async (orig) => ({ ...(await orig()), useIrisArt: () => ({}) }))

const { createRoot } = await import('react-dom/client')
const { default: Routine } = await import('./Routine.jsx')
const { GAZE_MODEL_KEY } = await import('../lib/gazeCalib.js')

// Hedefin ekrandaki yeri (sağ: %80, sol: %20; dikey orta)
let tint = { left: 0.8 * 390 - 28, top: 0.46 * 844 - 28, width: 56, height: 56 }
const realQS = document.querySelector?.bind(document)
document.querySelector = (sel) => (sel === '.ex-look .ex-tint' ? { getBoundingClientRect: () => tint } : realQS?.(sel))

const frame = (x, y = 0) => ({ native: true, face: true, tracked: true, blinkLeft: 0.05, blinkRight: 0.05, scrLX: x, scrRX: x, scrLY: y, scrRY: y, camLeftX: 0, camRightX: 0, camLeftY: 0, camRightY: 0 })
async function run(ms, mk, fps = 30) {
  const dt = 1000 / fps
  for (let t = 0; t < ms; t += dt) await act(async () => { vi.advanceTimersByTime(dt); const f = mk?.(); if (f && onFrameCb) onFrameCb({ ...f, ts: performance.now() }) })
}

describe('egzersizde kendini iyileştirme', () => {
  it('Sağa bak ve Sola bak adımlarından sonra model güncellenir, kalibrasyon dayanak kalır', async () => {
    vi.useFakeTimers()
    vi.advanceTimersByTime(20000)
    const model = { version: 3, ok: true, x: { feature: 'scrX', c: 0, neg: -16, pos: 16, score: 20 }, y: { feature: 'scrY', c: 0, neg: -30, pos: 30, score: 20 }, closeAt: 0.5, date: '2026-09-28T00:00:00.000Z' }
    store[GAZE_MODEL_KEY] = JSON.stringify(model)
    const container = document.createElement('div')
    const root = createRoot(container)
    await act(async () => root.render(h(Routine, { set: { id: 't', title: 'T', steps: ['lookRight', 'lookLeft', 'rest'] }, todaySec: 0, trueDepth: true, onBack: () => {}, onFinish: () => {} })))
    const btn = (l) => container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.includes(l))[0]
    await act(async () => btn('Başla').click())
    // Gerçek: sağ hedefte (%80) x = 14 mm (kalibrasyon %80 için 16·0,3/0,42 = 11,4 bekliyordu)
    await run(1200, () => frame(0))
    await run(6500, () => frame(14))
    const afterRight = JSON.parse(store[GAZE_MODEL_KEY])
    expect(afterRight.adapt?.n).toBe(1)
    expect(afterRight.x.pos).toBeGreaterThan(16)
    expect(afterRight.base.x.pos).toBe(16)
    expect(afterRight.date).toBe(model.date)
    tint = { left: 0.2 * 390 - 28, top: 0.46 * 844 - 28, width: 56, height: 56 }
    await run(1200, () => frame(0))
    await run(6500, () => frame(-14))
    const afterLeft = JSON.parse(store[GAZE_MODEL_KEY])
    expect(afterLeft.adapt.n).toBe(2)
    expect(afterLeft.x.neg).toBeLessThan(-16)
    await act(async () => root.unmount())
    vi.useRealTimers()
  })
})
