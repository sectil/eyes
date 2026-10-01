// Alarm kartı ve kurulum sayfası akışı: dokunuşlar günlüğe doğru yazılıyor mu (analiz verisi), kart doğru duruma geçiyor mu.
import { describe, it, expect, vi, beforeEach, afterEach, onTestFinished } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
// <audio>.play taklidi: çalma isteğinin sırasını görmek için (impl null: hemen çalar)
const audioPlay = { impl: null }
// Sahte DOM'da <select>.options yok (React seçili değeri buradan kurar); yalnız bu testte eklenir
const mk = document.createElement
document.createElement = (t) => {
  const n = mk(t)
  if (String(t).toUpperCase() === 'SELECT') Object.defineProperty(n, 'options', { get: () => n.childNodes.filter((c) => c.nodeName === 'OPTION') })
  if (String(t).toUpperCase() === 'AUDIO') { n.play = () => (audioPlay.impl ? audioPlay.impl() : Promise.resolve()); n.pause = () => {} }
  return n
}
// Sahte DOM'da gövdenin sahibi yok; React portalı (alt sayfa) öğeyi ownerDocument ile yaratır
document.body.ownerDocument = document
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() }
const { createRoot } = await import('react-dom/client')
vi.mock('../lib/alarmNative.js', async (orig) => {
  const m = await orig()
  return { ...m, cancelAlarm: vi.fn(async () => {}), scheduleAlarm: vi.fn(m.scheduleAlarm) }
})
const native = await import('../lib/alarmNative.js')
const { default: AlarmCard } = await import('./AlarmCard.jsx')
const { default: AlarmLine } = await import('./AlarmLine.jsx')
const { takeSleepSession } = await import('../lib/sleepSession.js')
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
  const tapLabel = async (label) => { const b = container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.getAttribute('aria-label') === label)[0]; if (!b) throw new Error(`düğme yok: ${label} — ${container.textContent}`); await act(async () => b.click()) }
  return { container, tap, tapLabel, text: () => container.textContent, rerender: (e) => act(async () => root.render(e)) }
}
// Ana sayfadaki gibi: üstte satır (AlarmLine, "gün seninle"nin altında), yolun altında kart (AlarmCard)
const card = (props = {}) => {
  const p = { status: { platform: 'alarmkit', auth: 'notDetermined' }, onStart: () => {}, now: EVE, ...props }
  // Kart "şimdi"yi prop'tan okur, dokunuşlar günlüğe gerçek saatle yazılır: ikisi aynı an olsun (yoksa test takvim
  // günü 28 Eylül'ü geçince "Bu akşam değil" başka güne yazılıp kart geri geliyordu)
  if (vi.isFakeTimers()) vi.setSystemTime(p.now)
  return h('div', null, h(AlarmLine, p), h(AlarmCard, p))
}
// Alt sayfa ve "Geri al" şeridi gövdeye taşınır (portal)
const sheetText = () => document.body.textContent
const dials = () => document.body.querySelectorAll((n) => n.nodeName === 'svg' && n.getAttribute('class') === 'al-dial')
async function tapBody(label) {
  const b = document.body.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.trim() === label)[0]
  if (!b) throw new Error(`düğme yok: ${label} — ${sheetText()}`)
  await act(async () => b.click())
}

describe('Ana sayfa alarm satırı ve kartı (v5)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(EVE)
    mem.clear(); setPrefs({ alarmCard: true }); document.body.childNodes.length = 0; native.scheduleAlarm.mockClear(); native.cancelAlarm.mockClear()
  })
  afterEach(() => vi.useRealTimers())
  it('web\'de yok; gün içinde alarm yoksa kart yok, satır "— alarm yok" kuruluma götürür', async () => {
    expect((await mount(card({ status: { platform: 'web', auth: null } }))).text()).toBe('')
    const onStart = vi.fn()
    const r = await mount(card({ now: at(2026, 9, 28, 14, 0), onStart }))
    expect(r.text()).toBe('—alarm yok')
    await r.tapLabel('Alarm kurulu değil. Kur')
    expect(onStart).toHaveBeenCalledWith('alarm')
  })
  it('akşam: "Evet · 07:00" kurulumu açar; "Bu akşam değil" günlüğe yazar, kart kalkar', async () => {
    const onStart = vi.fn()
    const r = await mount(card({ onStart }))
    expect(r.text()).toContain('Alarm kurayım mı?')
    await r.tap('Evet · 07:00')
    expect(onStart).toHaveBeenCalledWith('alarm')
    await r.tap('Bu akşam değil')
    expect(loadAlarmLog().map((e) => e.type)).toEqual(['dismiss'])
    expect(r.text()).toBe('—alarm yok')
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
    expect(r.text()).toBe('—alarm yok')
  })
  it('kurulu: kart yok, satır "07:00 alarm · yarın"; dokununca saat, kalan süre, günler, kadran, uyku sesi, yatma saati', async () => {
    const alarm = { on: true, hour: 7, minute: 0, days: [1, 2, 3, 4, 5, 6], sound: 'dalga-motive', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 27).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const onStart = vi.fn()
    const r = await mount(card({ onStart }))
    expect(r.text()).toBe('07:00alarm · yarın')
    await r.tapLabel('Alarm 07:00, 9 sa 16 dk sonra. Seçenekler')
    const t = sheetText()
    expect(t).toContain('Sabah · alarm')
    expect(t).toContain('9 sa 16 dk sonra')
    expect(t).toContain('Pazartesi–Cumartesi')
    expect(t).toContain('Uyku sesini başlatSana göre 30 dk')
    expect(t).toContain("7 saat uyku için en geç 00:00'da yatakta ol.")
    expect(dials()).toHaveLength(1)
    await tapBody('Uyku sesini başlatSana göre 30 dk')
    expect(onStart).toHaveBeenCalledWith('alarm-sleep')
    expect(sheetText()).toBe('')
    await r.tapLabel('Alarm 07:00, 9 sa 16 dk sonra. Seçenekler')
    await tapBody('Alarmı düzenlesaat, günler, ses')
    expect(onStart).toHaveBeenLastCalledWith('alarm')
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, sleep: 'off' }))
    const r2 = await mount(card())
    await r2.tapLabel('Alarm 07:00, 9 sa 16 dk sonra. Seçenekler')
    expect(sheetText()).not.toContain('Uyku sesi')
  })
  it('satırdaki gün: 24 saatten uzak yarın "yarın", daha uzak kısa gün; kadran yalnız alarma 12 saatten az kalınca', async () => {
    const alarm = { on: true, hour: 7, minute: 0, days: [2], sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 20).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const noon = await mount(card({ now: at(2026, 9, 28, 14, 0) })) // Salı 07:00'ye 17 sa
    expect(noon.text()).toBe('07:00alarm · yarın')
    await noon.tapLabel('Alarm 07:00, 17 sa sonra. Seçenekler')
    expect(dials()).toHaveLength(0)
    document.body.childNodes.length = 0
    expect((await mount(card({ now: at(2026, 9, 28, 6, 0) }))).text()).toBe('07:00alarm · yarın') // 25 sa, takvimde yarın
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, days: [6] }))
    const sat = await mount(card({ now: at(2026, 9, 28, 14, 0) }))
    expect(sat.text()).toBe('07:00alarm · Ct')
    await sat.tapLabel('Alarm 07:00, 5 gün sonra. Seçenekler')
    expect(sheetText()).toContain('Her Cumartesi')
  })
  it('başlık: öğleden sonraki alarm "Alarm"; eski bildirim yedeği "hatırlatma", iOS 26 telefonda yeniden kurmayı söyler', async () => {
    const alarm = { on: true, hour: 20, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 28, 14).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const r = await mount(card({ now: at(2026, 9, 28, 15, 0) }))
    expect(r.text()).toBe('20:00alarm · bugün')
    await r.tapLabel('Alarm 20:00, 5 sa sonra. Seçenekler')
    expect(sheetText().startsWith('Alarm20:00')).toBe(true)
    document.body.childNodes.length = 0
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, hour: 7, kind: 'notify' }))
    const n = await mount(card({ now: at(2026, 9, 28, 15, 0), status: { platform: 'alarmkit', auth: 'authorized' } }))
    expect(n.text()).toBe('07:00hatırlatma · yarın')
    await n.tapLabel('Hatırlatma 07:00, 16 sa sonra. Seçenekler')
    expect(sheetText()).toContain('Sabah · hatırlatma')
    expect(sheetText()).toContain('Yeniden kurarsan gerçek alarm olur')
    expect(sheetText()).toContain('Hatırlatmayı kapat')
    document.body.childNodes.length = 0
    const old = await mount(card({ now: at(2026, 9, 28, 15, 0), status: { platform: 'notify', auth: 'authorized' } }))
    await old.tapLabel('Hatırlatma 07:00, 16 sa sonra. Seçenekler')
    expect(sheetText()).toContain('iOS 26 gerekir')
  })
  it('uyku sesi bu gece sığmıyorsa "Bu gece yok"; yatma saati geçtiyse kadran yok', async () => {
    mem.set(ALARM_KEY, JSON.stringify({ on: true, hour: 22, minute: 30, days: [0, 1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 28, 21).toISOString() }))
    const r = await mount(card())
    await r.tapLabel('Alarm 22:30, 46 dk sonra. Seçenekler')
    expect(sheetText()).toContain('Uyku sesini başlatBu gece yok')
    expect(dials()).toHaveLength(0)
  })
  it('"Alarmı kapat" bir kez daha sorar; kapatınca iptal + günlük + "Geri al" yeniden kurar', async () => {
    const alarm = { on: true, hour: 7, minute: 0, days: [1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 27).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const r = await mount(card({ status: { platform: 'alarmkit', auth: 'authorized' } }))
    const open = () => r.tapLabel('Alarm 07:00, 9 sa 16 dk sonra. Seçenekler')
    await open()
    await tapBody('Alarmı kapat')
    expect(sheetText()).toContain('Alarm kapatılsın mı? Pazartesi–Cumartesi 07:00 alarmı artık çalmaz.')
    await tapBody('Vazgeç')
    expect(sheetText()).toContain('Alarmı düzenle')
    expect(native.cancelAlarm).not.toHaveBeenCalled()
    await tapBody('Alarmı kapat')
    await tapBody('Kapat')
    expect(native.cancelAlarm).toHaveBeenCalledTimes(1)
    expect(loadAlarm().on).toBe(false)
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'cancel', via: 'home' })
    // App ALARM_CHANGED ile Ana sayfayı yeniden çizer: akşam "kurayım mı?" kartı bu akşam çıkmamalı
    await r.rerender(card({ status: { platform: 'alarmkit', auth: 'authorized' } }))
    expect(r.text()).toBe('—alarm yok')
    expect(sheetText()).toContain('Alarm kapatıldı.Geri al')
    native.scheduleAlarm.mockResolvedValueOnce({ ok: true, snooze: true })
    await tapBody('Geri al')
    expect(native.scheduleAlarm).toHaveBeenCalledWith(expect.objectContaining({ hour: 7, minute: 0, days: [1, 2, 3, 4, 5, 6] }), 'alarmkit')
    expect(loadAlarm().on).toBe(true)
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'set', undo: true })
    expect(r.text()).toBe('07:00alarm · yarın')
    // geri alma kurulamazsa söylenir
    await open(); await tapBody('Alarmı kapat'); await tapBody('Kapat')
    native.scheduleAlarm.mockResolvedValueOnce({ ok: false, reason: 'error' })
    await tapBody('Geri al')
    expect(sheetText()).toContain('Geri alınamadı')
    expect(loadAlarm().on).toBe(false)
  })
  it('Geri al: eski bildirim hatırlatması kendi türüyle; saati geçmiş tek seferlik alarm kurulmaz, söylenir', async () => {
    const legacy = { on: true, hour: 7, minute: 0, days: [1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'off', wake: 'none', kind: 'notify', setAt: at(2026, 9, 27).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(legacy))
    const r = await mount(card({ status: { platform: 'alarmkit', auth: 'authorized' } }))
    await r.tapLabel('Hatırlatma 07:00, 9 sa 16 dk sonra. Seçenekler')
    await tapBody('Hatırlatmayı kapat')
    expect(sheetText()).toContain('Pazartesi–Cumartesi 07:00 hatırlatması artık gelmez.')
    await tapBody('Kapat')
    native.scheduleAlarm.mockResolvedValueOnce({ ok: true })
    await tapBody('Geri al')
    expect(native.scheduleAlarm).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'notify' }), 'notify')
    document.body.childNodes.length = 0
    native.scheduleAlarm.mockClear()
    const once = { on: true, hour: 21, minute: 50, days: [], at: at(2026, 9, 28, 21, 50).toISOString(), sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 28, 21).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(once))
    const o = await mount(card({ status: { platform: 'alarmkit', auth: 'authorized' } }))
    await o.tapLabel('Alarm 21:50, 6 dk sonra. Seçenekler')
    await tapBody('Alarmı kapat')
    expect(sheetText()).toContain("Bugün 21:50'de çalmaz.")
    await tapBody('Kapat')
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(at(2026, 9, 28, 21, 51))
    try {
      await tapBody('Geri al')
    } finally {
      vi.useRealTimers()
    }
    expect(native.scheduleAlarm).not.toHaveBeenCalled()
    expect(sheetText()).toContain('Saati geçti')
  })
  it('⋯ → "Ana sayfadan kaldır": kart ve satır gider, geri al şeridi; "Geri al" ikisini getirir', async () => {
    const r = await mount(card())
    const more = r.container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.getAttribute('aria-label') === 'Alarm seçenekleri')[0]
    await act(async () => more.click())
    await r.tap('Ana sayfadan kaldır')
    expect(getPrefs().alarmCard).toBe(false)
    expect(r.text()).toContain('Alarm kartı kaldırıldı')
    expect(r.text()).not.toContain('alarm yok')
    await r.tap('Geri al')
    expect(getPrefs().alarmCard).toBe(true)
    expect(r.text()).toContain('alarm yok')
    expect(r.text()).toContain('Alarm kurayım mı?')
  })
  it('kayıt açık ama telefonda AlarmKit alarmı yok (status.missing): "Alarm telefonda kurulu değil · Yeniden kur" kuruluma götürür', async () => {
    const alarm = { on: true, hour: 6, minute: 35, days: [1, 2, 3, 4, 5, 6], sound: 'phone', sleep: 'off', wake: 'none', kind: 'alarmkit', setAt: at(2026, 9, 27).toISOString() }
    mem.set(ALARM_KEY, JSON.stringify(alarm))
    const onStart = vi.fn()
    const r = await mount(card({ onStart, status: { platform: 'alarmkit', auth: 'authorized', missing: true } }))
    expect(r.text()).toBe('Alarm telefonda kurulu değil · Yeniden kur')
    await r.tap('Alarm telefonda kurulu değil · Yeniden kur')
    expect(onStart).toHaveBeenCalledWith('alarm')
    expect(sheetText()).toBe('') // seçenekler sayfası açılmaz
    // telefonda kuruluysa bugünkü satır
    expect((await mount(card({ status: { platform: 'alarmkit', auth: 'authorized', missing: false } }))).text()).toBe('06:35alarm · yarın')
    // eski bildirim hatırlatması kaydı AlarmKit'te aranmaz: bugünkü satır
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, kind: 'notify' }))
    expect((await mount(card({ status: { platform: 'alarmkit', auth: 'authorized', missing: true } }))).text()).toBe('06:35hatırlatma · yarın')
    // kayıt kapalıysa "— alarm yok"
    mem.set(ALARM_KEY, JSON.stringify({ ...alarm, on: false }))
    expect((await mount(card({ now: at(2026, 9, 28, 14, 0), status: { platform: 'alarmkit', auth: 'authorized', missing: true } }))).text()).toBe('—alarm yok')
  })
  it('Profil\'den kapatılmışsa hiçbiri çizilmez (satır, akşam sorusu)', async () => {
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
    expect(r.text()).toBe('—alarm yok')
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
    expect(r.text()).not.toContain('Kur ve uyku sesini başlat') // web'de müzik düğmesi yok
    await r.tap('Kur · 07:00')
    expect(r.text()).toContain('Alarm yalnız iPhone uygulamasında kurulur.')
    expect(onDone).not.toHaveBeenCalled()
    expect(loadAlarm()).toBeNull()
    expect(loadAlarmLog()).toEqual([])
  })
  it('"Kur ve uyku sesini başlat": müzik aynı dokunuşta, alarm kurulmadan ÖNCE başlar; sonra uyku ekranı; "Yalnız kur" müziği başlatmaz', async () => {
    // AlarmSetup dokunuş anındaki süreyi gerçek saatten hesaplar (AlarmSetup.jsx:110): saat EVE'ye sabitlenir, yoksa test
    // 06:30–07:00 arasında (07:00 alarmına 30 dk'dan az kala) kırılıyordu. Beklenti değişmedi.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(EVE)
    onTestFinished(() => vi.useRealTimers())
    const onDone = vi.fn()
    const order = []
    audioPlay.impl = () => { order.push('play'); return Promise.resolve() }
    native.scheduleAlarm.mockImplementationOnce(async () => { order.push('schedule'); return { ok: true, snooze: true } })
    const r = await mount(h(AlarmSetup, { status: { platform: 'alarmkit', auth: 'authorized' }, now: EVE, onDone, onBack: () => {} }))
    expect(r.text()).toContain('Kurunca uyku sesi hemen başlar: 30 dk, sonra yavaşça susar.')
    await r.tap('Kur ve uyku sesini başlat')
    // ses öğesi ilk kez yaratılırken önce sessiz döngü, sonra müzik çalar; ikisi de alarm kurulmadan önce
    expect(order.at(-1)).toBe('schedule')
    expect(order.slice(0, -1)).toEqual(['play', 'play'])
    expect(onDone).toHaveBeenCalledWith('sleep')
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'set', sleepNow: 30 })
    const s = takeSleepSession()
    expect(s).toMatchObject({ minutes: 30, auto: true })
    expect(await s.run).toBe(true)
    expect(s.player.phase).toBe('loop')
    s.player.stop()
    audioPlay.impl = null
    // alarm kurulamazsa müzik durur
    native.scheduleAlarm.mockResolvedValueOnce({ ok: false, reason: 'error' })
    const rf = await mount(h(AlarmSetup, { status: { platform: 'alarmkit', auth: 'authorized' }, now: EVE, onDone: () => {}, onBack: () => {} }))
    await rf.tap('Kur ve uyku sesini başlat')
    expect(rf.text()).toContain('Kurulamadı')
    expect(takeSleepSession()).toBeNull()
    native.scheduleAlarm.mockResolvedValueOnce({ ok: true, snooze: true })
    const r2 = await mount(h(AlarmSetup, { status: { platform: 'alarmkit', auth: 'authorized' }, now: EVE, onDone, onBack: () => {} }))
    await r2.tap('Yalnız kur · 07:00')
    expect(onDone).toHaveBeenLastCalledWith(undefined)
    expect(takeSleepSession()).toBeNull()
  })
  it('günler hepsi kaldırılınca "Yalnız yarın"; uyku sesi Hayır süre sorusunu gizler', async () => {
    const r = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: EVE, onBack: () => {} }))
    for (const d of ['Pt', 'Sa', 'Ça', 'Pe', 'Cu']) await r.tap(d)
    expect(r.text()).toContain('Yalnız yarın')
    await r.tap('Hayır')
    expect(r.text()).not.toContain('Ne zaman sussun?')
  })
  it('gün seçilmemişse kur düğmesi "Yalnız yarın kur" (tek seferlik kurar); ilk çalış bugünse eski yazı kalır', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(EVE)
    onTestFinished(() => vi.useRealTimers())
    const web = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: EVE, onBack: () => {} }))
    await web.tap('Her gün')
    await web.tap('Her gün')
    expect(web.text()).toContain('Yalnız yarın kur')
    expect(web.text()).not.toContain('Kur · 07:00')
    await web.tap('Pt')
    expect(web.text()).toContain('Kur · 07:00')
    expect(web.text()).not.toContain('Yalnız yarın kur')
    // uyku sesiyle: "Yalnız kur · 07:00" yerine "Yalnız yarın kur"; dokununca tek seferlik kurulur
    native.scheduleAlarm.mockClear()
    native.scheduleAlarm.mockResolvedValueOnce({ ok: true, snooze: false })
    const onDone = vi.fn()
    const r = await mount(h(AlarmSetup, { status: { platform: 'alarmkit', auth: 'authorized' }, now: EVE, onDone, onBack: () => {} }))
    await r.tap('Her gün')
    await r.tap('Her gün')
    expect(r.text()).toContain('Kur ve uyku sesini başlat')
    await r.tap('Yalnız yarın kur')
    expect(native.scheduleAlarm).toHaveBeenCalledWith(expect.objectContaining({ hour: 7, minute: 0, days: [], at: at(2026, 9, 29, 7, 0).toISOString() }), 'alarmkit')
    expect(onDone).toHaveBeenCalledWith(undefined)
    expect(loadAlarmLog().at(-1)).toMatchObject({ type: 'set', days: [], snooze: false })
    // sabah 05.00'te 07:00 tek seferlik bugün çalar: "yarın" yazılmaz
    mem.clear()
    const dawn = at(2026, 9, 29, 5, 0)
    vi.setSystemTime(dawn)
    const m = await mount(h(AlarmSetup, { status: { platform: 'web', auth: null }, now: dawn, onBack: () => {} }))
    await m.tap('Her gün')
    await m.tap('Her gün')
    expect(m.text()).not.toContain('Yalnız yarın kur')
    expect(m.text()).toContain('Kur · 07:00')
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

describe('Kurulum özeti: her satırın kendi "değiştir"i (sahibi, 2026-09-28 21:28)', () => {
  it('"Uyandıran ses" yanındaki değiştir yalnız ses listesini, "Uyanınca" yanındaki yalnız uyanınca seçimini açar', async () => {
    const r = await mount(h(AlarmSetup, { status: { platform: 'alarmkit', auth: 'authorized' }, now: EVE, onDone: () => {}, onBack: () => {} }))
    const links = () => r.container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.getAttribute('class') === 'link-btn')
    expect(links().map((b) => b.textContent)).toEqual(['değiştir', 'değiştir'])
    expect(r.text()).not.toContain('Kuş Bahçesi')
    await act(async () => links()[0].click()) // Uyandıran ses
    expect(r.text()).toContain('Kuş Bahçesi')
    expect(r.text()).not.toContain('Alarmdan sonra uygulamayı açınca')
    await act(async () => links()[1].click()) // Uyanınca: ses listesi kapanır
    expect(r.text()).not.toContain('Kuş Bahçesi')
    expect(r.text()).toContain('Alarmdan sonra uygulamayı açınca')
    expect(links().map((b) => b.textContent)).toEqual(['değiştir', 'kapat'])
  })
})
