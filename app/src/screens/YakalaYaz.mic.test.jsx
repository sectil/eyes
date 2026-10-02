// Yakala Yaz mikrofonu (kelime-hafiza ANA_OTURUM_ISTEMI Y5): telefon cihaz içi çalışamıyorsa düğme yok; cihaz içi başlatma
// hatası (strictOnDevice) klavyeye düşer; "Hayır, klavyeyle devam" bir daha sormaz; izin sayfası METINLER İ1–İ5.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } }
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
const speech = { available: true, onDevice: false }
vi.mock('../lib/native.js', () => ({
  haptic: () => {},
  isIOSApp: () => true,
  speechAvailable: async () => ({ ...speech }),
  requestSpeechPermission: async () => true,
  startSpeech: async () => async () => {},
}))

const { createRoot } = await import('react-dom/client')
const { default: YakalaYaz } = await import('./YakalaYaz.jsx')
const { useYakalaMic } = await import('../modules/yakala-yaz/view.jsx')
const { setPrefs } = await import('../lib/prefs.js')

const NOW = new Date('2026-10-05T10:00:00')
const text = (root) => root.textContent
const btn = (root, label) => root.querySelectorAll((n) => n.nodeName === 'BUTTON' && (n.textContent.includes(label) || n.getAttribute('aria-label') === label))[0] ?? null
async function mount(el) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(async () => root.render(el))
  return { container, root }
}
async function toAsk(container) {
  await act(async () => btn(container, 'Başla').props?.onClick?.() ?? btn(container, 'Başla').click?.())
  for (let t = 0; t < 5000 && !text(container).includes('Ne gördün?'); t += 50) await act(async () => { vi.advanceTimersByTime(50) })
}
const click = async (el) => act(async () => { el.click ? el.click() : el.props.onClick() })

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
  setPrefs({ yakalaMic: 'ask' })
  speech.onDevice = false
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

describe('Yakala Yaz · mikrofon', () => {
  it('cihaz içi yoksa (onDevice: false) mikrofon yok; "Hayır" sonrası da yok', async () => {
    let got = 'unset'
    const Probe = () => { got = useYakalaMic(); return null }
    await mount(h(Probe))
    await act(async () => { await Promise.resolve() })
    expect(got).toBeNull()
    speech.onDevice = true
    await mount(h(Probe))
    await act(async () => { await Promise.resolve() })
    expect(got).toMatchObject({ ask: true })
    await act(async () => { setPrefs({ yakalaMic: 'off' }) })
    expect(got).toBeNull()
  })

  it('mikrofonsuz: düğme yok, giriş ve yazma cümlesi yalnız klavye', async () => {
    const { container } = await mount(h(YakalaYaz, { sessions: [], now: NOW, mic: null }))
    expect(text(container)).toContain('Aklında tut, sonra yaz.')
    expect(text(container)).not.toContain('ya da söyle')
    await toAsk(container)
    expect(text(container)).toContain("Yaz ve Gönder'e bas.")
    expect(btn(container, 'Sesle söyle')).toBeNull()
  })

  it('ilk dokunuşta izin sayfası (İ1–İ5); "Hayır, klavyeyle devam" tercihi off yapar, düğme kalkar', async () => {
    const setPref = vi.fn()
    const mic = { ask: true, setPref, request: vi.fn(async () => true), start: vi.fn() }
    const { container } = await mount(h(YakalaYaz, { sessions: [], now: NOW, mic }))
    expect(text(container)).toContain('sonra yaz ya da söyle.')
    await toAsk(container)
    await click(btn(container, 'Sesle söyle'))
    for (const s of ['Kelimeleri sesle söylemek ister misin?', 'Mikrofon yalnız sen düğmeye basınca açılır; iki kelimeyi söyleyince kapanır.', 'Ses telefonunda yazıya çevrilir. Kaydedilmez, hiçbir yere gönderilmez.', "İstemezsen klavyeyle devam et. Fikrini Profil'den ya da iPhone Ayarlar'dan değiştirebilirsin.", 'Mikrofonu aç', 'Hayır, klavyeyle devam']) expect(text(container)).toContain(s)
    expect(text(container)).not.toContain('tanıma')
    await click(btn(container, 'Hayır, klavyeyle devam'))
    expect(setPref).toHaveBeenCalledWith('off')
    expect(mic.start).not.toHaveBeenCalled()
    expect(btn(container, 'Sesle söyle')).toBeNull()
    expect(text(container)).not.toContain('Kelimeleri sesle söylemek ister misin?')
  })

  it('cihaz içi başlatma hatası (strictOnDevice) → düğme kalkar, klavyeyle sürer', async () => {
    const mic = { ask: false, setPref: vi.fn(), request: vi.fn(), start: vi.fn(async () => { throw new Error('NO_ON_DEVICE') }) }
    const { container } = await mount(h(YakalaYaz, { sessions: [], now: NOW, mic }))
    await toAsk(container)
    await click(btn(container, 'Sesle söyle'))
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })
    expect(mic.start).toHaveBeenCalledTimes(1)
    expect(btn(container, 'Sesle söyle')).toBeNull()
    expect(text(container)).toContain("Yaz ve Gönder'e bas.")
  })

  it('hiçbir şey duyulmazsa D11; duyulan iki kelime alana yazılır, gönderilmez', async () => {
    let cb = null
    const mic = { ask: false, setPref: vi.fn(), request: vi.fn(), start: vi.fn(async (onResult) => { cb = onResult; return async () => {} }) }
    const { container } = await mount(h(YakalaYaz, { sessions: [], now: NOW, mic }))
    await toAsk(container)
    await click(btn(container, 'Sesle söyle'))
    await act(async () => { await vi.advanceTimersByTimeAsync(4000) })
    expect(text(container)).toContain('Duyamadım, yazabilirsin.')
    await click(btn(container, 'Sesle söyle'))
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })
    await act(async () => { cb({ text: 'çınar vapur' }) })
    const input = container.querySelectorAll((n) => n.nodeName === 'INPUT' && String(n.className ?? n.attrs?.class ?? '').includes('field'))[0]
    expect(input?.value ?? input?.attrs?.value).toBe('çınar vapur')
    expect(text(container)).toContain('Ne gördün?') // gönderilmedi: hâlâ soru
  })
})
