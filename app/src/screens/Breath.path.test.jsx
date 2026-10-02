// Yoldaki nefes (SONSUZ_YOL.PLAN.v1 §3.A.4, §3.A.5): "Bugünün ritmi", kişinin kendi seçiminin önceliği, tutmanın ön
// koşulu, "2 dk daha" ve kayda yazılan alanlar. İlerleme yokken ekran bugünkü gibidir.
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
const { default: Breath, autoMix, howLines } = await import('./Breath.jsx')
const { breathPath } = await import('../modules/breath/view.jsx')
const { PATTERNS, BREATH_OPTS_KEY, BREATH_SAFETY_KEY, loadBreathOpts, programProgress } = await import('../lib/breath.js')
const { dayKey } = await import('../lib/calendar.js')

const NOW = new Date('2026-10-05T10:00:00')
const MIX = { family: 'equal', inhale: 5.5, hold: 0, exhale: 5.5, pause: 0, label: '5,5 · 5,5', title: 'Eşit ritim', tier: 'B', edits: { in: 5.5, in2: 0, hold: 0, out: 5.5, hold2: 0 } }
const HOLD = { family: 'hum', inhale: 4, hold: 1, exhale: 6, pause: 0, label: '4 · 1 · 6', title: 'Vızıltı', tier: 'C', edits: { in: 4, in2: 0, hold: 1, out: 6, hold2: 0 } }
const DEF = loadBreathOpts({ getItem: () => null })
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
})

describe('autoMix: kişinin seçimi önce, tutmanın ön koşulu', () => {
  it('varsayılan tercihte günün kalıbı kullanılır', () => {
    expect(autoMix(MIX, DEF)).toBe(MIX)
  })
  it('kişi kalıp seçmiş ya da süreleri düzenlemişse onun seçimi', () => {
    expect(autoMix(MIX, { ...DEF, pattern: 'belly' })).toBeNull()
    expect(autoMix(MIX, { ...DEF, edits: { in: 4, in2: 0, hold: 0, out: 7, hold2: 0 } })).toBeNull()
  })
  it('tutmalı kalıp: güvenlik kartı görülmüş ve son 7 günde "Zorlandım" yok olmalı', () => {
    expect(autoMix(HOLD, DEF, { seen: false, now: NOW })).toBeNull()
    expect(autoMix(HOLD, DEF, { seen: true, now: NOW })).toBe(HOLD)
    expect(autoMix(HOLD, DEF, { seen: true, now: NOW, sessions: [{ type: 'breath', seconds: 180, strained: true, date: daysAgo(6) }] })).toBeNull()
    expect(autoMix(HOLD, DEF, { seen: true, now: NOW, sessions: [{ type: 'breath', seconds: 180, strained: true, date: daysAgo(9) }] })).toBe(HOLD)
    expect(autoMix({ ...MIX, family: 'box', pause: 2 }, DEF, { seen: false })).toBeNull()
  })
  it('bilinmeyen aile ya da Özel gelmez', () => {
    expect(autoMix({ ...MIX, family: 'x' }, DEF)).toBeNull()
    expect(autoMix({ ...MIX, family: 'custom' }, DEF)).toBeNull()
    expect(autoMix(null, DEF)).toBeNull()
  })
})

describe('howLines: günün kalıbında süre söyleyen satır yok', () => {
  it('kalıp yoksa bütün satırlar', () => {
    for (const id of Object.keys(PATTERNS)) expect(howLines(PATTERNS[id], null)).toEqual(PATTERNS[id].how)
  })
  it('günün kalıbında sayı ve "aynı süre" yok; mırıldanma ve burun yönergeleri kalır', () => {
    for (const id of Object.keys(PATTERNS)) for (const t of howLines(PATTERNS[id], MIX)) expect(t).not.toMatch(/\d|aynı süre/)
    expect(howLines(PATTERNS.hum, MIX)).toEqual(PATTERNS.hum.how)
    expect(howLines(PATTERNS.nose, MIX)).toEqual(PATTERNS.nose.how)
    expect(howLines(PATTERNS.calm, MIX)).toEqual([])
  })
})

describe('breathPath (modules/breath/view.jsx)', () => {
  const breathDays = (n) => Array.from({ length: n }, (_, i) => ({ type: 'breath', seconds: 300, pattern: 'calm', date: daysAgo(n - i) }))
  it('ilerleme kapalı: null (ekran bugünkü 5 dk ile açılır)', () => {
    expect(breathPath({ sessions: breathDays(3), progression: null }, NOW)).toBeNull()
  })
  it('yeni kullanıcı 1. gün 1 dk, 2. gün 2 dk, 3. gün 3 dk + "2 dk daha"; kayda stage', () => {
    expect(breathPath({ tests: [], sessions: [] }, NOW)).toMatchObject({ presetSec: 60, minSec: 60, moreSec: null, mix: null, extra: { stage: 'N1' } })
    expect(breathPath({ tests: [], sessions: breathDays(1) }, NOW)).toMatchObject({ presetSec: 120, moreSec: null, extra: { stage: 'N2' } })
    expect(breathPath({ tests: [], sessions: breathDays(2) }, NOW)).toMatchObject({ presetSec: 180, minSec: 180, moreSec: 120, mix: null, extra: { stage: 'N3' } })
  })
  it('yolun Nefes durağı bugün tamamsa (göz molası önerisinden yeniden açılış) bugünkü gibi 5 dk', () => {
    const today = [...breathDays(2), { type: 'breath', seconds: 185, pattern: 'calm', stage: 'N3', date: NOW.toISOString() }]
    expect(breathPath({ tests: [], sessions: today }, NOW)).toBeNull()
    const short = [...breathDays(2), { type: 'breath', seconds: 40, pattern: 'calm', date: NOW.toISOString() }]
    expect(breathPath({ tests: [], sessions: short }, NOW)).toMatchObject({ presetSec: 180 })
  })
  it('8. günden "Bugünün ritmi" (B katmanı): kalıp tutmasız ve günün tohumuyla', () => {
    const p = breathPath({ tests: [], sessions: breathDays(7) }, NOW)
    expect(p.mix).toMatchObject({ tier: 'B', hold: 0, pause: 0 })
    expect(p.mix.label).toMatch(/·/)
    expect(breathPath({ tests: [], sessions: breathDays(7) }, NOW)).toEqual(p)
  })
})

// ---- Ekran akışı: sahte zamanlayıcıyla 3 dk + "2 dk daha"
const btn = (root, label) => root.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.includes(label))[0] ?? null
const text = (root) => root.textContent
// Adımlar büyük (1–2 sn): sahte zaman seansı ≈ 100–200 act() çağrısında geçer. 250 ms adımla ≈ 700 çağrı yapılıyordu ve
// bütün takım yük altındayken 5 sn'lik varsayılan süre aşılabiliyordu (Y1 incelemesi); testlere ayrıca süre verildi.
async function tick(ms, step = 2000) {
  for (let t = 0; t < ms; t += step) await act(async () => { vi.advanceTimersByTime(step) })
}
// Seans bitene dek (en çok ms) ilerlet
async function until(container, word, ms = 400000, step = 1000) {
  for (let t = 0; t < ms && !text(container).includes(word); t += step) await act(async () => { vi.advanceTimersByTime(step) })
}
const byLabel = (root, label) => root.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.attrs['aria-label'] === label)[0] ?? null
async function mount(props) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(async () => root.render(h(Breath, { sessions: [], onBack: () => {}, onFinish: () => {}, ...props })))
  return { container, root }
}

describe('Nefes ekranı: yoldan açılış', () => {
  it('ilerleme yokken bugünkü gibi: kalıbın kendi cümlesi, "Bugünün ritmi" ve "2 dk daha" yok', async () => {
    store[BREATH_SAFETY_KEY] = '1'
    const { container, root } = await mount({ presetSec: 300 })
    expect(text(container)).toContain(PATTERNS.calm.blurb)
    expect(text(container)).not.toContain('Bugünün ritmi')
    await act(async () => root.unmount())
  })
  it('günün kalıbı kartta adıyla ve ritmiyle; kanıt satırı ailenin metni; kayıtlı tercih değişmez', async () => {
    store[BREATH_SAFETY_KEY] = '1'
    const { container, root } = await mount({ presetSec: 180, minSec: 180, pathMix: MIX, moreSec: 120, extra: { stage: 'N3' } })
    expect(text(container)).toContain('Eşit ritim')
    expect(text(container)).toContain('Bugünün ritmi: 5,5 · 5,5')
    expect(text(container)).toContain(PATTERNS.equal.evidence)
    expect(text(container)).not.toContain(PATTERNS.equal.blurb)
    expect(store[BREATH_OPTS_KEY]).toBeUndefined()
    await act(async () => root.unmount())
  })
  it('kişinin kendi kalıbı varsa günün kalıbı gelmez', async () => {
    store[BREATH_SAFETY_KEY] = '1'
    store[BREATH_OPTS_KEY] = JSON.stringify({ pattern: 'belly' })
    const { container, root } = await mount({ presetSec: 180, pathMix: MIX })
    expect(text(container)).toContain('Karın nefesi')
    expect(text(container)).not.toContain('Bugünün ritmi')
    await act(async () => root.unmount())
  })
  it('3 dk bitince "2 dk daha": aynı kalıpla sürer, tek kayıt program gününü 5 dk\'ya tamamlar; kayda stage ve mix', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] })
    vi.setSystemTime(NOW)
    store[BREATH_SAFETY_KEY] = '1'
    let saved = null
    const { container, root } = await mount({ presetSec: 180, minSec: 180, pathMix: MIX, moreSec: 120, extra: { stage: 'N3' }, onFinish: (s) => { saved = s } })
    await act(async () => btn(container, 'Başla').click())
    await act(async () => btn(container, 'Puansız başla').click())
    await tick(3000 + 170000)
    expect(text(container)).not.toContain('Tamamlandı') // 3 dk'dan önce bitmez (minSec)
    await until(container, 'Tamamlandı')
    expect(text(container)).toContain('Tamamlandı')
    const more = btn(container, '2 dk daha')
    expect(more).not.toBeNull()
    await act(async () => more.click())
    expect(text(container)).not.toContain('Hazırlan')
    expect(text(container)).not.toContain('Tamamlandı')
    await until(container, 'Tamamlandı')
    expect(btn(container, '2 dk daha')).toBeNull() // bir kez
    await act(async () => btn(container, 'Kaydet').click())
    expect(saved).toMatchObject({ type: 'breath', pattern: 'equal', stage: 'N3', completed: true, mix: { family: 'equal', inhale: 5.5, hold: 0, exhale: 5.5, pause: 0 } })
    expect(saved.seconds).toBeGreaterThanOrEqual(300)
    expect(saved.seconds).toBeLessThan(300 + 11)
    expect(programProgress([saved], NOW).todayDone).toBe(true)
    expect(store[BREATH_OPTS_KEY]).toBeUndefined() // günün kalıbı kişinin tercihi olmadı
    await act(async () => root.unmount())
    vi.useRealTimers()
  }, 30000)
  it('"Zorlandım" işaretlenince "2 dk daha" yok; 1 dk\'lık yol gününde hiç yok', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] })
    vi.setSystemTime(NOW)
    store[BREATH_SAFETY_KEY] = '1'
    const { container, root } = await mount({ presetSec: 180, minSec: 180, moreSec: 120, extra: { stage: 'N3' } })
    await act(async () => btn(container, 'Başla').click())
    await act(async () => btn(container, 'Puansız başla').click())
    await until(container, 'Tamamlandı')
    expect(btn(container, '2 dk daha')).not.toBeNull()
    await act(async () => btn(container, 'Zorlandım').click())
    expect(btn(container, '2 dk daha')).toBeNull()
    await act(async () => root.unmount())
    const one = await mount({ presetSec: 60, minSec: 60, moreSec: null, extra: { stage: 'N1' } })
    await act(async () => btn(one.container, 'Başla').click())
    await act(async () => btn(one.container, 'Puansız başla').click())
    await until(one.container, 'Tamamlandı')
    expect(text(one.container)).toContain('Tamamlandı')
    expect(btn(one.container, '2 dk daha')).toBeNull()
    await act(async () => one.root.unmount())
    vi.useRealTimers()
  }, 30000)
  it('günün kalıbı Sakin ritimse ayrıntıda boş "nasıl yapılır" listesi çizilmez; kalıp yokken üç satır', async () => {
    store[BREATH_SAFETY_KEY] = '1'
    const CALM = { family: 'calm', inhale: 4.5, hold: 0, exhale: 6.5, pause: 0, label: '4,5 · 6,5', title: 'Sakin ritim', tier: 'B', edits: { in: 4.5, in2: 0, hold: 0, out: 6.5, hold2: 0 } }
    const how = (c) => c.querySelectorAll((n) => n.nodeName === 'OL' && n.attrs.class === 'br-how')
    const a = await mount({ presetSec: 180, pathMix: CALM })
    await act(async () => byLabel(a.container, 'Sakin ritim ayarları').click())
    expect(how(a.container)).toHaveLength(0)
    await act(async () => a.root.unmount())
    const b = await mount({ presetSec: 300 })
    await act(async () => byLabel(b.container, 'Sakin ritim ayarları').click())
    expect(how(b.container)).toHaveLength(1)
    expect(text(b.container)).toContain(PATTERNS.calm.how[0])
    await act(async () => b.root.unmount())
  })
  it('kişi kalıbı değiştirirse günün kalıbı kalkar ve seçimi kaydedilir; yalnız süre değişirse kalıp tercihi değişmez', async () => {
    store[BREATH_SAFETY_KEY] = '1'
    const { container, root } = await mount({ presetSec: 180, pathMix: MIX })
    await act(async () => byLabel(container, 'Eşit ritim ayarları').click())
    // Ayrıntı ekranı: "düzenlendi" yazmaz; süre seçimi (3 dk → 5 dk) kalıbı tercih yapmaz
    expect(text(container)).toContain('Kalıp')
    expect(text(container)).not.toContain('düzenlendi')
    const five = container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent === '5 dk')[0]
    await act(async () => five.click())
    const o = JSON.parse(store[BREATH_OPTS_KEY])
    expect(o).toMatchObject({ pattern: 'calm', edits: null, durationSec: 300 })
    expect(text(container)).toContain('Başla · 5 dk')
    // adım düzenlemesi kişinin seçimi olur
    await act(async () => byLabel(container, 'Al artır').click())
    expect(JSON.parse(store[BREATH_OPTS_KEY])).toMatchObject({ pattern: 'equal', edits: { in: 6, out: 5.5 } })
    expect(text(container)).toContain('düzenlendi')
    await act(async () => root.unmount())
    const again = await mount({ presetSec: 180, pathMix: MIX })
    const tile = again.container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.attrs['aria-label']?.startsWith('Karın nefesi'))[0]
    await act(async () => tile.click())
    expect(JSON.parse(store[BREATH_OPTS_KEY])).toMatchObject({ pattern: 'belly', edits: null })
    expect(text(again.container)).not.toContain('Bugünün ritmi')
    await act(async () => again.root.unmount())
  })
})

describe('seedDay ve güncel gün', () => {
  it('breathPath tohumu bugünün günüdür', () => {
    const p = breathPath({ tests: [], sessions: [] }, NOW)
    expect(p).not.toBeNull()
    expect(dayKey(NOW)).toBe('2026-10-05')
  })
})
