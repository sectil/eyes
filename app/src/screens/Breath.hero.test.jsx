// Nefes · yoldan açılış (5 saniye turu 2): "Bugünün ritmi"nin süreleri kalıpların alt satırı biçiminde; kanıt cümlesi
// kanıt rozetinin arkasında (details); bitişte günün zinciri ve "Bugünün yolu · N/M durak"; Kaydet ile "2 dk daha" yan yana.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } }
globalThis.scrollTo = () => {}
vi.mock('../lib/native.js', () => ({ haptic: () => {}, isIOSApp: () => false }))
vi.mock('../lib/cue.js', () => ({ speak: () => {}, unlockAudio: () => {}, cue: () => {} }))
vi.mock('../lib/breathSfx.js', () => ({ playBreathSound: () => {}, unlockBreathSfx: () => {}, releaseBreathSfx: () => {}, breathContext: () => null }))
vi.mock('../lib/voicePack.js', async (orig) => ({ ...(await orig()), preloadVoice: () => Promise.resolve(), playPhrase: () => false, loadIndex: () => Promise.resolve({}) }))

const { createRoot } = await import('react-dom/client')
const { default: Breath, rhythmLine } = await import('./Breath.jsx')
const { PATTERNS, BREATH_SAFETY_KEY } = await import('../lib/breath.js')

const NOW = new Date('2026-10-05T10:00:00')
const MIX = { family: 'equal', inhale: 5, hold: 0, exhale: 5, pause: 0, label: '5 · 5', title: 'Eşit ritim', tier: 'B', edits: { in: 5, in2: 0, hold: 0, out: 5, hold2: 0 } }
const text = (root) => root.textContent
const btn = (root, label) => root.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.includes(label))[0] ?? null
async function mount(props) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(async () => root.render(h(Breath, { sessions: [], onBack: () => {}, onFinish: () => {}, ...props })))
  return { container, root }
}
async function until(container, word, ms = 200000, step = 1000) {
  for (let t = 0; t < ms && !text(container).includes(word); t += step) await act(async () => { vi.advanceTimersByTime(step) })
}

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
})

describe('rhythmLine', () => {
  it('kalıbın alt satırıyla aynı biçim: "5 sn al · 5 sn ver · dakikada 6 nefes"', () => {
    expect(rhythmLine({ in: 5, in2: 0, hold: 0, out: 5, hold2: 0 }, 6)).toBe(PATTERNS.equal.sub)
    expect(rhythmLine({ in: 4, in2: 0, hold: 1, out: 6, hold2: 0 }, 5.5)).toBe('4 sn al · 1 sn tut · 6 sn ver · dakikada 5,5 nefes')
    expect(rhythmLine({ in: 4.5, in2: 0, hold: 0, out: 6.5, hold2: 0 }, 5.5)).toBe('4,5 sn al · 6,5 sn ver · dakikada 5,5 nefes')
  })
})

describe('Nefes · günün kalıbı kartı', () => {
  it('ritmin süreleri kartta; kanıt cümlesi rozetin arkasında (details), Başla\'nın altında değil; program noktaları yolda yok', async () => {
    store[BREATH_SAFETY_KEY] = '1'
    const { container, root } = await mount({ presetSec: 180, minSec: 180, pathMix: MIX, moreSec: 120, extra: { stage: 'N3' } })
    expect(text(container)).toContain('Bugünün ritmi: 5 · 5')
    expect(text(container)).toContain('5 sn al · 5 sn ver · dakikada 6 nefes')
    const details = container.querySelectorAll((n) => n.nodeName === 'DETAILS')
    expect(details).toHaveLength(1)
    expect(details[0].textContent).toContain(PATTERNS.equal.evidence)
    expect(container.querySelectorAll((n) => n.attrs?.class === 'br-hero-ev')).toHaveLength(0)
    expect(container.querySelectorAll((n) => n.nodeName === 'MAIN')[0].attrs.class).toContain('br-path')
    // "1 dakikada sakinleş" kalıpların altında: ilk "Başla" kartınki
    expect(btn(container, 'Başla').attrs.class).toBe('btn')
    await act(async () => root.unmount())
  })
})

describe('Nefes · yoldan açılan seansın bitişi', () => {
  it('günün zinciri bu durakla birlikte; Kaydet ve "2 dk daha" aynı satırda', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] })
    vi.setSystemTime(NOW)
    store[BREATH_SAFETY_KEY] = '1'
    const stops = [
      { key: 'routine:kirpma', id: 'routine', title: 'Göz kırpma', kind: 'exercise', glyph: 'lid', done: true },
      { key: 'breath', id: 'breath', title: 'Nefes', restSlot: true, glyph: 'moon', done: false },
      { key: 'track', id: 'track', title: 'Çemberler', kind: 'practice', glyph: 'constel', done: false },
    ]
    const day = { stops, next: stops[1], total: 3, doneCount: 1, allDone: false }
    const { container, root } = await mount({ presetSec: 180, minSec: 180, moreSec: 120, extra: { stage: 'N3' }, day })
    await act(async () => btn(container, 'Başla').click())
    await act(async () => btn(container, 'Puansız başla').click())
    await until(container, 'Tamamlandı')
    expect(text(container)).toContain('Bugünün yolu · 2/3 durak')
    const chain = container.querySelectorAll((n) => n.attrs?.class === 'dc')[0]
    expect(chain.querySelectorAll((n) => /dc-s .* done/.test(n.attrs?.class ?? ''))).toHaveLength(2)
    const act2 = container.querySelectorAll((n) => n.attrs?.class === 'br-res-act')[0]
    expect(act2.textContent).toContain('Kaydet')
    expect(act2.textContent).toContain('2 dk daha')
    await act(async () => root.unmount())
    vi.useRealTimers()
  }, 30000)
})
