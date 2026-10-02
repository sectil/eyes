// Yoga sabah sorusu (yoga-pilot/v3/modul.md §9, §16 A-2): ne zaman çıkar, nereye yazılır, alarm sorusuyla sırası,
// web'de yokluğu. Cevap o gecenin ders kaydına (updateSession) yazılır; ayrı kayıt türü açılmaz.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const ios = vi.hoisted(() => ({ on: true }))
vi.mock('../lib/native.js', async (orig) => ({ ...(await orig()), isIOSApp: () => ios.on }))

const { createRoot } = await import('react-dom/client')
const { default: YogaMorningCard, yogaMorningDue, nightRecord, morningKeyOf, startOf, alarmMorningPending, skipMorning, saveSleepEase, MORNING_TEXT, SKIPPED_MAX } = await import('./YogaMorningCard.jsx')
const { createStore } = await import('../lib/storage.js')
const { makeYogaRecord } = await import('../lib/yogaRecord.js')
const { loadYogaOpts, saveYogaOpts, YOGA_OPTS_KEY } = await import('../modules/yoga/opts.js')
const { ALARM_KEY, ALARM_LOG_KEY } = await import('../lib/alarmLog.js')
const { setPrefs } = await import('../lib/prefs.js')
const { registry } = await import('../modules/registry.js')

const at = (y, mo, d, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi)
// Uykuya Geçiş kaydı: başlangıç + dinlenen süre (bitiş = kaydın tarihi)
const night = (start, extra = {}) => ({
  id: extra.id ?? `r-${start.getTime()}`,
  type: 'yoga', lesson: 3, planned: 900, seconds: 900, reachedClosing: true, completed: true,
  startedAt: start.toISOString(), date: new Date(start.getTime() + 900000).toISOString(), before: null, after: null,
  ...extra,
})
const R = night(at(2026, 9, 29, 23, 10), { id: 'gece' })
// Depoya eklenecek biçim: kimliği depo verir
const fresh = (start) => {
  const { id: _omit, ...rest } = night(start)
  return rest
}

function fakeBackend() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}
// Alarm: 30 Eylül Çarşamba 07.00; gece uyku sesi otomatik başladı → sabah sorusu 07.00'den sonra bekler
const alarm = { on: true, hour: 7, minute: 0, days: [3], sound: 'phone', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 29, 21).toISOString() }
const sleepLog = [{ type: 'sleep', at: at(2026, 9, 29, 23, 0).toISOString(), date: '2026-09-29', planned: 15, seconds: 900, early: false, auto: true }]
const answered = [...sleepLog, { type: 'morning', at: at(2026, 9, 30, 7, 20).toISOString(), date: '2026-09-30', answer: 'yes', ring: at(2026, 9, 30, 7, 0).toISOString(), before: 30, after: 30 }]

beforeEach(() => {
  mem.clear()
  ios.on = true
  setPrefs({ alarmCard: true })
})

describe('sabah sorusu: ne zaman (modul.md §9)', () => {
  it('23.10\'da başlamış ders: ertesi sabah 04.00 ve 11.59\'da var; 03.59 ve 12.00\'de yok', () => {
    expect(yogaMorningDue({ sessions: [R], now: at(2026, 9, 30, 4, 0) })).toBe(R)
    expect(yogaMorningDue({ sessions: [R], now: at(2026, 9, 30, 11, 59) })).toBe(R)
    expect(yogaMorningDue({ sessions: [R], now: at(2026, 9, 30, 3, 59) })).toBeNull()
    expect(yogaMorningDue({ sessions: [R], now: at(2026, 9, 30, 12, 0) })).toBeNull()
    // bir sonraki sabah artık "dün gece" değil
    expect(yogaMorningDue({ sessions: [R], now: at(2026, 10, 1, 8, 0) })).toBeNull()
  })
  it('00.40\'ta başlamış ders aynı günün sabahı; 14.00\'te ya da 06.00\'da başlamış ders hiç sorulmaz', () => {
    const late = night(at(2026, 9, 30, 0, 40))
    expect(yogaMorningDue({ sessions: [late], now: at(2026, 9, 30, 8, 0) })).toBe(late)
    const day = night(at(2026, 9, 29, 14, 0))
    for (const now of [at(2026, 9, 29, 11, 0), at(2026, 9, 30, 8, 0)]) expect(yogaMorningDue({ sessions: [day], now })).toBeNull()
    expect(yogaMorningDue({ sessions: [night(at(2026, 9, 30, 6, 0))], now: at(2026, 9, 30, 9, 0) })).toBeNull()
    expect(morningKeyOf(at(2026, 9, 29, 17, 59).getTime())).toBeNull()
    expect(morningKeyOf(at(2026, 9, 29, 18, 0).getTime())).toBe('2026-09-30')
    expect(morningKeyOf(at(2026, 12, 31, 22, 0).getTime())).toBe('2027-01-01')
  })
  it('cevaplanmış ya da "Atla" denmiş kayıt yok; alarm sorusu beklerken yok, alarm cevaplanınca var', () => {
    const now = at(2026, 9, 30, 7, 30)
    expect(yogaMorningDue({ sessions: [{ ...R, sleepEase: 7 }], now })).toBeNull()
    expect(yogaMorningDue({ sessions: [R], now, skipped: ['gece'] })).toBeNull()
    expect(yogaMorningDue({ sessions: [R], now, alarmFirst: true })).toBeNull()
    expect(alarmMorningPending({ now, alarm, log: sleepLog, cardOn: true })).toBe(true)
    expect(alarmMorningPending({ now, alarm, log: answered, cardOn: true })).toBe(false)
    // alarm kartı Ana sayfadan kaldırılmışsa soru görünmez: yoga beklemez
    expect(alarmMorningPending({ now, alarm, log: sleepLog, cardOn: false })).toBe(false)
    expect(alarmMorningPending({ now, alarm: null, log: [], cardOn: true })).toBe(false)
    // alarm çalmadan önce (06.30) alarmın sabah kartı yok
    expect(alarmMorningPending({ now: at(2026, 9, 30, 6, 30), alarm, log: sleepLog, cardOn: true })).toBe(false)
  })
  it('aynı gece iki ders: sonuncusu; gece dersi olmayan kayıtlar ve 30 sn altı sayılmaz', () => {
    const early = night(at(2026, 9, 29, 22, 0), { id: 'ilk' })
    const last = night(at(2026, 9, 30, 1, 30), { id: 'son' })
    const now = at(2026, 9, 30, 9, 0)
    expect(yogaMorningDue({ sessions: [last, early], now })?.id).toBe('son')
    // sonuncusu cevaplanmış ya da atlanmışsa öncekine dönülmez
    expect(yogaMorningDue({ sessions: [early, { ...last, sleepEase: 4 }], now })).toBeNull()
    expect(yogaMorningDue({ sessions: [early, last], now, skipped: ['son'] })).toBeNull()
    // Ders 2 gece dinlense de sorulmaz; 29 sn'lik ders kaydedilmez (kayıt yok → soru yok)
    expect(yogaMorningDue({ sessions: [{ ...R, lesson: 2 }], now })).toBeNull()
    expect(makeYogaRecord({ lesson: 3, planned: 300, seconds: 29, endedAt: at(2026, 9, 29, 23, 30) })).toBeNull()
    expect(yogaMorningDue({ sessions: [{ ...R, seconds: 29 }], now })).toBeNull()
    expect(yogaMorningDue({ sessions: [], now })).toBeNull()
    expect(yogaMorningDue({ sessions: [null, 'x', { type: 'yoga' }], now })).toBeNull()
  })
  it('startedAt yoksa başlangıç = bitiş − dinlenen süre; gerçek kayıt kurucusunun kaydıyla çalışır', () => {
    const noStart = { ...R, startedAt: null, date: at(2026, 9, 30, 0, 10).toISOString(), seconds: 1800 }
    expect(startOf(noStart)).toBe(at(2026, 9, 29, 23, 40).getTime())
    expect(nightRecord([noStart], at(2026, 9, 30, 8, 0))).toBe(noStart)
    const rec = makeYogaRecord({ lesson: 3, planned: 900, seconds: 880, reachedClosing: true, startedAt: at(2026, 9, 29, 23, 5), endedAt: at(2026, 9, 29, 23, 20) })
    const store = createStore(fakeBackend())
    const saved = store.addSession(rec)
    expect(yogaMorningDue({ sessions: store.get().sessions, now: at(2026, 9, 30, 7, 0) })?.id).toBe(saved.id)
  })
})

describe('sabah sorusu: nereye yazılır', () => {
  it('cevap o gecenin kaydına sleepEase olarak eklenir; metrik ve kayıt sayısı', () => {
    const store = createStore(fakeBackend())
    const rec = store.addSession(fresh(at(2026, 9, 29, 23, 10)))
    expect(saveSleepEase(store, rec.id, 7)).toMatchObject({ id: rec.id, type: 'yoga', lesson: 3, sleepEase: 7, date: rec.date })
    expect(store.get().sessions).toHaveLength(1) // ayrı kayıt açılmaz: soruyu cevaplamak "yoga yapılan gün" sayılmaz
    for (const bad of [0, 11, 6.5, '7', null]) expect(saveSleepEase(store, rec.id, bad)).toBeNull()
    expect(saveSleepEase(store, 'yok', 5)).toBeNull()
    // "Uykuya dalma kolaylığı (ertesi sabah)" kaydın kendisinden, gecenin tarihiyle okunur (İyi oluş)
    const m = registry.metrics().find((x) => x.key === 'yoga-uyku-dalma')
    expect(m?.domain).toBe('wellbeing')
    expect(m.series({ tests: [], sessions: store.get().sessions })).toEqual([{ date: rec.date, value: 7 }])
  })
  it('"Atla": kimlik yoga tercihlerine yazılır, öteki tercihler korunur; liste sınırlı', () => {
    saveYogaOpts({ captions: true })
    expect(skipMorning('gece').morningSkipped).toEqual(['gece'])
    expect(skipMorning('gece').morningSkipped).toEqual(['gece']) // tekrar yazılmaz
    expect(loadYogaOpts()).toMatchObject({ captions: true, morningSkipped: ['gece'] })
    for (let i = 0; i < SKIPPED_MAX + 5; i++) skipMorning(`k${i}`)
    const list = loadYogaOpts().morningSkipped
    expect(list).toHaveLength(SKIPPED_MAX)
    expect(list.at(-1)).toBe(`k${SKIPPED_MAX + 4}`)
    expect(JSON.parse(mem.get(YOGA_OPTS_KEY)).morningSkipped).toEqual(list)
  })
})

describe('sabah kartı (Ana sayfa)', () => {
  const roots = []
  afterEach(async () => {
    for (const r of roots.splice(0)) await act(async () => r.unmount())
  })
  async function mount(props) {
    const container = document.createElement('div')
    const root = createRoot(container)
    roots.push(root)
    await act(async () => root.render(h(YogaMorningCard, props)))
    const tap = async (label) => {
      const b = container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.trim() === label)[0]
      if (!b) throw new Error(`düğme yok: ${label} — ${container.textContent}`)
      await act(async () => b.click())
    }
    return { text: () => container.textContent, tap, rerender: (p) => act(async () => root.render(h(YogaMorningCard, p))), container }
  }
  const setup = () => {
    const store = createStore(fakeBackend())
    const rec = store.addSession(fresh(at(2026, 9, 29, 23, 10)))
    return { store, rec }
  }

  it('soru, 1–10 ve "Atla"; bir sayıya dokununca kayda yazılır, onSaved çağrılır, "Kaydedildi."', async () => {
    const { store, rec } = setup()
    const onSaved = vi.fn()
    const r = await mount({ sessions: store.get().sessions, now: at(2026, 9, 30, 7, 30), store, onSaved })
    expect(r.text()).toContain(MORNING_TEXT.question)
    expect(r.text()).toContain('Uykuya Geçiş · tek soru')
    expect(r.text()).toContain('1 · çok zor')
    expect(r.text()).toContain('10 · çok kolay')
    const nums = r.container.querySelectorAll((n) => n.nodeName === 'BUTTON' && /^\d+$/.test(n.textContent.trim())).map((n) => n.textContent.trim())
    expect(nums).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
    await r.tap('8')
    expect(store.get().sessions[0]).toMatchObject({ id: rec.id, sleepEase: 8 })
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: rec.id, sleepEase: 8 }))
    expect(r.text()).toContain('Kaydedildi.')
    expect(r.text()).not.toContain(MORNING_TEXT.question)
    await r.tap('Tamam')
    expect(r.text()).toBe('')
    // App kayıtları yeniledikten sonra (cevaplı kayıt) kart yeniden çıkmaz
    const again = await mount({ sessions: store.get().sessions, now: at(2026, 9, 30, 7, 40), store })
    expect(again.text()).toBe('')
  })
  it('"Atla": kart gider ve o sabah yeniden çıkmaz; kayda puan yazılmaz', async () => {
    const { store, rec } = setup()
    const r = await mount({ sessions: store.get().sessions, now: at(2026, 9, 30, 8, 0), store })
    await r.tap('Atla')
    expect(r.text()).toBe('')
    expect(loadYogaOpts().morningSkipped).toEqual([rec.id])
    expect(store.get().sessions[0].sleepEase).toBeUndefined()
    expect((await mount({ sessions: store.get().sessions, now: at(2026, 9, 30, 9, 0), store })).text()).toBe('')
  })
  it('alarmın sabah sorusu beklerken yok; alarm cevaplanınca çıkar', async () => {
    const { store } = setup()
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    mem.set(ALARM_LOG_KEY, JSON.stringify(sleepLog))
    const r = await mount({ sessions: store.get().sessions, now: at(2026, 9, 30, 7, 10), store })
    expect(r.text()).toBe('')
    mem.set(ALARM_LOG_KEY, JSON.stringify(answered))
    await r.rerender({ sessions: store.get().sessions, now: at(2026, 9, 30, 7, 21), store })
    expect(r.text()).toContain(MORNING_TEXT.question)
  })
  it('web\'de (isIOSApp yanlış) kart yok; saat aralığı dışında ve gündüz dersinden sonra yok', async () => {
    const { store } = setup()
    ios.on = false
    expect((await mount({ sessions: store.get().sessions, now: at(2026, 9, 30, 7, 30), store })).text()).toBe('')
    ios.on = true
    expect((await mount({ sessions: store.get().sessions, now: at(2026, 9, 30, 12, 0), store })).text()).toBe('')
    const day = createStore(fakeBackend())
    day.addSession(fresh(at(2026, 9, 29, 15, 0)))
    expect((await mount({ sessions: day.get().sessions, now: at(2026, 9, 30, 7, 30), store: day })).text()).toBe('')
  })
})
