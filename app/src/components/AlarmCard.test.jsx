// Alarm kartı ve kurulum sayfası akışı: dokunuşlar günlüğe doğru yazılıyor mu (analiz verisi), kart doğru duruma geçiyor mu.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// Sahte DOM'da <select>.options yok (React seçili değeri buradan kurar); yalnız bu testte eklenir
const mk = document.createElement
document.createElement = (t) => {
  const n = mk(t)
  if (String(t).toUpperCase() === 'SELECT') Object.defineProperty(n, 'options', { get: () => n.childNodes.filter((c) => c.nodeName === 'OPTION') })
  return n
}
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const { createRoot } = await import('react-dom/client')
const { default: AlarmCard } = await import('./AlarmCard.jsx')
const { default: AlarmSetup } = await import('../screens/AlarmSetup.jsx')
const { loadAlarmLog, loadAlarm, ALARM_KEY, ALARM_LOG_KEY } = await import('../lib/alarmLog.js')

const at = (y, mo, d, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi)
const EVE = at(2026, 9, 28, 21, 44) // Pazartesi akşamı

async function mount(el) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(async () => root.render(el))
  const btns = (label) => container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.trim() === label)
  const tap = async (label) => { const b = btns(label)[0]; if (!b) throw new Error(`düğme yok: ${label} — ${container.textContent}`); await act(async () => b.click()) }
  return { container, tap, text: () => container.textContent, rerender: (e) => act(async () => root.render(e)) }
}
const card = (props = {}) => h(AlarmCard, { status: { platform: 'alarmkit', auth: 'notDetermined' }, onStart: () => {}, now: EVE, ...props })

describe('alarm kartı', () => {
  beforeEach(() => mem.clear())
  it('web\'de ve 19.00\'dan önce çizilmez', async () => {
    expect((await mount(card({ status: { platform: 'web', auth: null } }))).text()).toBe('')
    expect((await mount(card({ now: at(2026, 9, 28, 18, 0) }))).text()).toBe('')
  })
  it('"Evet" kurulumu açar; "Bu akşam değil" günlüğe yazar ve kartı gizler', async () => {
    const onStart = vi.fn()
    const r = await mount(card({ onStart }))
    expect(r.text()).toContain('Alarm kurayım mı?')
    await r.tap('Evet')
    expect(onStart).toHaveBeenCalledWith('alarm')
    await r.tap('Bu akşam değil')
    expect(loadAlarmLog().map((e) => e.type)).toEqual(['dismiss'])
    expect(r.text()).toBe('')
  })
  it('3. "Bu akşam değil"den sonra bir kez sorulur; "Çıkmasın" kaydedilir ve ayar yolu yazılır', async () => {
    mem.set(ALARM_LOG_KEY, JSON.stringify([
      { type: 'dismiss', at: at(2026, 9, 26, 21).toISOString(), date: '2026-09-26' },
      { type: 'dismiss', at: at(2026, 9, 27, 21).toISOString(), date: '2026-09-27' },
    ]))
    const r = await mount(card())
    await r.tap('Bu akşam değil')
    expect(r.text()).toContain('Bu kart akşamları çıksın mı?')
    await r.tap('Çıkmasın')
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'cardPref', show: false })
    expect(r.text()).toContain('Hatırlatmalar')
    await r.tap('Tamam')
    expect(r.text()).toBe('')
  })
  it('kurulu alarm: durum; uyku sesi kapalıysa "Uyku sesi" düğmesi yok', async () => {
    const alarm = { on: true, hour: 7, minute: 0, days: [1, 2, 3, 4, 5, 6], sound: 'dalga-motive', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 27).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const onStart = vi.fn()
    const r = await mount(card({ onStart }))
    expect(r.text()).toContain('Alarm kurulu07:00 · 9 sa 16 dk sonra')
    expect(r.text()).toContain('Dalga · Motivasyon · sessiz modda da çalar')
    await r.tap('Uyku sesi')
    expect(onStart).toHaveBeenCalledWith('alarm-sleep')
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, sleep: 'off' }))
    const r2 = await mount(card())
    expect(r2.text()).not.toContain('Uyku sesi')
  })
  it('sabah sorusu: cevap ve öncesi/sonrası süre kaydedilir', async () => {
    mem.set(ALARM_KEY, JSON.stringify({ on: true, hour: 7, minute: 0, days: [2], sound: 'phone', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 28, 21).toISOString() }))
    mem.set(ALARM_LOG_KEY, JSON.stringify([{ type: 'sleep', at: at(2026, 9, 28, 23, 30).toISOString(), date: '2026-09-28', planned: 15, seconds: 900, early: false, auto: true }]))
    const r = await mount(card({ now: at(2026, 9, 29, 7, 10) }))
    expect(r.text()).toContain('Ses bittiğinde uyumuş muydun?')
    await r.tap('Hayır')
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'morning', answer: 'no', before: 15, after: 20, ring: at(2026, 9, 29, 7, 0).toISOString() })
    expect(r.text()).toContain('"Sana göre" süren artık 20 dk.')
  })
  it('izin reddi: Tamam gizler ama "Bu akşam değil" serisine sayılmaz', async () => {
    const r = await mount(card({ status: { platform: 'alarmkit', auth: 'denied' } }))
    expect(r.text()).toContain('Ayarlar → Nefona → Alarmlar')
    await r.tap('Tamam')
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'dismiss', reason: 'denied' })
    expect(r.text()).toBe('')
  })
})

describe('kurulum sayfası', () => {
  beforeEach(() => mem.clear())
  it('önceden cevaplı; web\'de "Kur" hata yazar, hiçbir şey kaydetmez', async () => {
    const onDone = vi.fn()
    const r = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: EVE, onDone, onBack: () => {} }))
    expect(r.text()).toContain('Kaçta uyanmak istersin?')
    expect(r.text()).toContain('Pazartesi–Cuma · dokun, çıkar ya da ekle')
    expect(r.text()).toContain('ilk gece 15 dk')
    await r.tap('Kur · 07:00')
    expect(r.text()).toContain('Alarm yalnız iPhone uygulamasında kurulur.')
    expect(onDone).not.toHaveBeenCalled()
    expect(loadAlarm()).toBeNull()
    expect(loadAlarmLog()).toEqual([])
  })
  it('günler hepsi kaldırılınca "Yalnız yarın"; uyku sesi Hayır süre sorusunu gizler', async () => {
    const r = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: EVE, onBack: () => {} }))
    for (const d of ['Pt', 'Sa', 'Ça', 'Pe', 'Cu']) await r.tap(d)
    expect(r.text()).toContain('Yalnız yarın')
    await r.tap('Hayır')
    expect(r.text()).not.toContain('Ne zaman sussun?')
  })
  it('seçili günler yarını içermiyorsa ilk çalış yazılır', async () => {
    const friday = at(2026, 10, 2, 21, 0)
    const r = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: friday, onBack: () => {} }))
    expect(r.text()).toContain('Yarın çalmaz · ilk: Pazartesi 07:00')
  })
})
