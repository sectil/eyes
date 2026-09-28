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
const { getPrefs, setPrefs } = await import('../lib/prefs.js')

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

describe('alarm kartı (v4: yolun altında)', () => {
  beforeEach(() => { mem.clear(); setPrefs({ alarmCard: true }) })
  it('web\'de yok; gün içinde alarm yoksa tek satır "Kurulu değil · Kur"', async () => {
    expect((await mount(card({ status: { platform: 'web', auth: null } }))).text()).toBe('')
    const onStart = vi.fn()
    const r = await mount(card({ now: at(2026, 9, 28, 14, 0), onStart }))
    expect(r.text()).toContain('Kurulu değil')
    await r.tap('Kur')
    expect(onStart).toHaveBeenCalledWith('alarm')
  })
  it('akşam: "Evet · 07:00" kurulumu açar; "Bu akşam değil" günlüğe yazar, kart tek satıra döner', async () => {
    const onStart = vi.fn()
    const r = await mount(card({ onStart }))
    expect(r.text()).toContain('Alarm kurayım mı?')
    await r.tap('Evet · 07:00')
    expect(onStart).toHaveBeenCalledWith('alarm')
    await r.tap('Bu akşam değil')
    expect(loadAlarmLog().map((e) => e.type)).toEqual(['dismiss'])
    expect(r.text()).toContain('Kurulu değil')
  })
  it('3. "Bu akşam değil"den sonra bir kez sorulur; "Sorma" kaydedilir', async () => {
    mem.set(ALARM_LOG_KEY, JSON.stringify([
      { type: 'dismiss', at: at(2026, 9, 26, 21).toISOString(), date: '2026-09-26' },
      { type: 'dismiss', at: at(2026, 9, 27, 21).toISOString(), date: '2026-09-27' },
    ]))
    const r = await mount(card())
    await r.tap('Bu akşam değil')
    expect(r.text()).toContain('Akşamları alarmı sorayım mı?')
    await r.tap('Sorma')
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'cardPref', show: false })
    expect(r.text()).toContain('Akşamları sormayacağım')
    await r.tap('Tamam')
    expect(r.text()).toContain('Kurulu değil')
  })
  it('kurulu: saat, kalan süre, günler, uyku sesi satırı, yatma saati; uyku sesi kapalıysa satır yok', async () => {
    const alarm = { on: true, hour: 7, minute: 0, days: [1, 2, 3, 4, 5, 6], sound: 'dalga-motive', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 27).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const onStart = vi.fn()
    const r = await mount(card({ onStart }))
    expect(r.text()).toContain('Sabah · alarm')
    expect(r.text()).toContain('07:00')
    expect(r.text()).toContain('9 sa 16 dk sonra')
    expect(r.text()).toContain('Pazartesi–Cumartesi')
    expect(r.text()).toContain('Uyku sesiSana göre 30 dk')
    expect(r.text()).toContain("7 saat uyku için en geç 00:00'da yatakta ol")
    expect(r.container.querySelectorAll((n) => n.nodeName === 'svg' && n.getAttribute('class') === 'al-dial')).toHaveLength(1)
    const row = r.container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.getAttribute('class') === 'al-row')[0]
    await act(async () => row.click())
    expect(onStart).toHaveBeenCalledWith('alarm-sleep')
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, sleep: 'off' }))
    expect((await mount(card())).text()).not.toContain('Uyku sesi')
  })
  it('kadran yalnız alarma 12 saatten az kalınca; 24 saatten uzak yarın "Yarın", daha uzak gün adı', async () => {
    const alarm = { on: true, hour: 7, minute: 0, days: [2], sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 20).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const dials = (r) => r.container.querySelectorAll((n) => n.nodeName === 'svg' && n.getAttribute('class') === 'al-dial')
    const noon = await mount(card({ now: at(2026, 9, 28, 14, 0) })) // Salı 07:00'ye 17 sa
    expect(noon.text()).toContain('17 sa sonra')
    expect(dials(noon)).toHaveLength(0)
    const early = await mount(card({ now: at(2026, 9, 28, 6, 0) })) // Salı 07:00'ye 25 sa: yarın
    expect(early.text()).toContain('Yarın')
    expect(early.text()).not.toContain('07:00 ·')
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, days: [6] }))
    expect((await mount(card({ now: at(2026, 9, 28, 14, 0) }))).text()).toContain('Cumartesi · 5 gün sonra')
  })
  it('başlık: öğleden sonraki alarm "Alarm"; eski bildirim yedeği iOS 26 telefonda yeniden kurmayı söyler', async () => {
    const alarm = { on: true, hour: 20, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 28, 14).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const r = await mount(card({ now: at(2026, 9, 28, 15, 0) }))
    expect(r.text()).toContain('20:00')
    expect(r.text().startsWith('Alarm')).toBe(true)
    expect(r.text()).not.toContain('Sabah')
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, hour: 7, kind: 'notify' }))
    const n = await mount(card({ now: at(2026, 9, 28, 15, 0), status: { platform: 'alarmkit', auth: 'authorized' } }))
    expect(n.text()).toContain('Sabah · hatırlatma')
    expect(n.text()).toContain('Yeniden kurarsan gerçek alarm olur')
    const old = await mount(card({ now: at(2026, 9, 28, 15, 0), status: { platform: 'notify', auth: 'authorized' } }))
    expect(old.text()).toContain('iOS 26 gerekir')
  })
  it('uyku sesi bu gece sığmıyorsa "Bu gece yok" ("Sana göre" öneki olmadan)', async () => {
    mem.set(ALARM_KEY, JSON.stringify({ on: true, hour: 22, minute: 30, days: [0, 1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 28, 21).toISOString() }))
    const t = (await mount(card())).text()
    expect(t).toContain('Uyku sesiBu gece yok')
    // yatma saati (15:30) geçti: kadran yok (nokta uyku yayının içine düşerdi)
    expect((await mount(card())).container.querySelectorAll((n) => n.nodeName === 'svg' && n.getAttribute('class') === 'al-dial')).toHaveLength(0)
    expect(t).not.toContain('Sana göre bu')
  })
  it('⋯ → "Ana sayfadan kaldır": kart gider, geri al şeridi; "Geri al" kartı getirir', async () => {
    const r = await mount(card({ now: at(2026, 9, 28, 14, 0) }))
    const more = r.container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.getAttribute('aria-label') === 'Alarm seçenekleri')[0]
    await act(async () => more.click())
    await r.tap('Ana sayfadan kaldır')
    expect(getPrefs().alarmCard).toBe(false)
    expect(r.text()).toContain('Alarm kartı kaldırıldı')
    await r.tap('Geri al')
    expect(getPrefs().alarmCard).toBe(true)
    expect(r.text()).toContain('Kurulu değil')
  })
  it('Profil\'den kapatılmışsa hiç çizilmez (akşam sorusu da)', async () => {
    setPrefs({ alarmCard: false })
    expect((await mount(card())).text()).toBe('')
    setPrefs({ alarmCard: true })
  })
  it('sabah sorusu: cevap ve öncesi/sonrası süre kaydedilir', async () => {
    mem.set(ALARM_KEY, JSON.stringify({ on: true, hour: 7, minute: 0, days: [2], sound: 'phone', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 28, 21).toISOString() }))
    mem.set(ALARM_LOG_KEY, JSON.stringify([{ type: 'sleep', at: at(2026, 9, 28, 23, 30).toISOString(), date: '2026-09-28', planned: 15, seconds: 900, early: false, auto: true }]))
    const r = await mount(card({ now: at(2026, 9, 29, 7, 10) }))
    expect(r.text()).toContain('Ses bittiğinde uyumuş muydun?')
    await r.tap('Hayır')
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'morning', answer: 'no', before: 30, after: 35, ring: at(2026, 9, 29, 7, 0).toISOString() })
    expect(r.text()).toContain('"Sana göre" süren artık 35 dk.')
  })
  it('izin reddi: Tamam kapatır ama "Bu akşam değil" serisine sayılmaz', async () => {
    const r = await mount(card({ status: { platform: 'alarmkit', auth: 'denied' } }))
    expect(r.text()).toContain('Ayarlar → Nefona → Alarmlar')
    await r.tap('Tamam')
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'dismiss', reason: 'denied' })
    expect(r.text()).toContain('Kurulu değil')
  })
})

describe('kurulum sayfası', () => {
  beforeEach(() => mem.clear())
  it('önceden cevaplı; web\'de "Kur" hata yazar, hiçbir şey kaydetmez', async () => {
    const onDone = vi.fn()
    const r = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: EVE, onDone, onBack: () => {} }))
    expect(r.text()).toContain('Kaçta uyanmak istersin?')
    expect(r.text()).toContain('Pazartesi–Cuma · dokun, çıkar ya da ekle')
    expect(r.text()).toContain('ilk gece 30 dk')
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
  it('"Her gün" yedi günü seçer, yeniden dokununca boşaltır; düzen notu yalnız eksik günlerde', async () => {
    const r = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: EVE, onBack: () => {} }))
    expect(r.text()).toContain('Her gün aynı saatte kalkmak uyku düzenini korur.')
    await r.tap('Her gün')
    expect(r.text()).toContain('Her gün · dokun, çıkar ya da ekle')
    expect(r.text()).not.toContain('uyku düzenini korur')
    await r.tap('Her gün')
    expect(r.text()).toContain('Yalnız yarın')
  })
  it('seçili günler yarını içermiyorsa ilk çalış yazılır', async () => {
    const friday = at(2026, 10, 2, 21, 0)
    const r = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: friday, onBack: () => {} }))
    expect(r.text()).toContain('Yarın çalmaz · ilk: Pazartesi 07:00')
  })
})
