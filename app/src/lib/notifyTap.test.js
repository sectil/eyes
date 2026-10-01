import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// native.js: web (isIOSApp false); setWalkGuards izlenir
const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import { tapAction, createTapHandler, TAP_ROUTE } from './notifyTap.js'
import { createApplier } from './notifyApply.js'
import { markTapped } from './notifyLog.js'
import { REST_NOTIFY_ID, TRIAL_NOTIFY_ID } from './restNotify.js'
import { resetAllData, TRIAL_KEYS, NOTIFY_RESET_KEYS } from './notifyReset.js'
import { NOTIFY_SLOTS_KEY } from './notifyAll.js'
import { createStore } from './storage.js'

const DATE = '2026-09-30'
const handler = (over = {}) => {
  const deps = {
    go: vi.fn(),
    onRest: vi.fn(),
    onTrial: vi.fn(),
    onAlarm: vi.fn(),
    mark: vi.fn(),
    replan: vi.fn(),
    showScience: vi.fn(),
    routeOk: (r) => r === 'home' || ['blink', 'yoga', 'gokyuzu', 'mola', 'water', 'breath-1'].includes(r),
    ...over,
  }
  return { deps, h: createTapHandler(deps) }
}

// Dokunma sözlüğü (PLAN.v1 §5.5 madde 4): her satır
describe('tapAction: dokunma sözlüğü', () => {
  it('7301 mola bitti → Ana sayfa (mola kilidi kalkar)', () => {
    const { deps, h } = handler()
    h({ id: REST_NOTIFY_ID, extra: null })
    expect(deps.onRest).toHaveBeenCalledTimes(1)
    expect(deps.go).not.toHaveBeenCalled()
  })

  it('7302 deneme → İlk rapor', () => {
    expect(tapAction({ id: TRIAL_NOTIFY_ID })).toEqual({ kind: 'trial', route: 'first-report' })
    const { deps, h } = handler()
    h({ id: TRIAL_NOTIFY_ID, extra: null })
    expect(deps.onTrial).toHaveBeenCalledTimes(1)
  })

  it('7400–7499 deney (bugünkü): günlükte dokunuldu + türün ekranı + plan yeniden', () => {
    for (const type of ['mola', 'walk', 'breath', 'water']) {
      const { deps, h } = handler()
      h({ id: 7401, extra: { kind: 'nudge', type, date: DATE, arm: 'send' } })
      expect(deps.mark).toHaveBeenCalledWith(DATE, type)
      expect(deps.replan).toHaveBeenCalledTimes(1)
      expect(deps.go).toHaveBeenCalledWith(TAP_ROUTE[type])
    }
  })

  it('çalışma günleri (study) dokunuşu günlüğe yazılmaz, Ana sayfayı açar (bugünkü)', () => {
    const { deps, h } = handler()
    h({ id: 7404, extra: { kind: 'nudge', type: 'study', date: DATE } })
    expect(deps.mark).not.toHaveBeenCalled()
    expect(deps.go).toHaveBeenCalledWith('home')
  })

  it('7500–7509 çalışma oturumu → mola', () => {
    const { deps, h } = handler()
    h({ id: 7500, extra: { kind: 'focus', k: 1 } })
    expect(deps.go).toHaveBeenCalledWith('mola')
  })

  it('7600–7607 alarm → uyanma işareti, yönlendirme yok', () => {
    const { deps, h } = handler()
    h({ id: 7600, extra: { kind: 'alarm' } })
    expect(deps.onAlarm).toHaveBeenCalledTimes(1)
    expect(deps.go).not.toHaveBeenCalled()
  })

  it('7800–7859 remind → modülün ekranı, üstte bilim kartı (evidence)', () => {
    const { deps, h } = handler()
    h({ id: 7803, extra: { kind: 'remind', module: 'blink', route: 'blink', evidence: 'kim2020', date: DATE } })
    expect(deps.go).toHaveBeenCalledWith('blink')
    expect(deps.showScience).toHaveBeenCalledWith({ evidence: 'kim2020', route: 'blink' })
    expect(deps.mark).not.toHaveBeenCalled()
  })

  it('remind: yol ve routine Ana sayfayı açar; açılamayan route Ana sayfaya düşer', () => {
    expect(tapAction({ id: 7800, extra: { kind: 'remind', module: 'path', route: 'home', evidence: 'singh2024' } })).toEqual({ kind: 'remind', route: 'home', science: 'singh2024' })
    expect(tapAction({ id: 7800, extra: { kind: 'remind', module: 'x', route: 'yok-boyle', evidence: null } }, { routeOk: (r) => r === 'home' })).toEqual({ kind: 'remind', route: 'home', science: null })
  })

  it('remind: sources.js\'te olmayan evidence → kart yok, yönlendirme yine var', () => {
    const { deps, h } = handler()
    h({ id: 7810, extra: { kind: 'remind', module: 'yoga', route: 'yoga', evidence: 'uydurma2099' } })
    expect(deps.go).toHaveBeenCalledWith('yoga')
    expect(deps.showScience).not.toHaveBeenCalled()
  })

  it('remindMerged → bugünkü Ana sayfa (özel ekran yok), üstte ilk modülün kartı', () => {
    const { deps, h } = handler()
    h({ id: 7820, extra: { kind: 'remindMerged', modules: ['blink', 'gokyuzu'], route: 'home', evidence: 'yamashita2021', date: DATE } })
    expect(deps.go).toHaveBeenCalledWith('home')
    expect(deps.showScience).toHaveBeenCalledWith({ evidence: 'yamashita2021', route: 'home' })
  })

  it('remind kimliği 78xx aralığı dışındaysa yönlendirilmez', () => {
    expect(tapAction({ id: 7400, extra: { kind: 'remind', module: 'blink', route: 'blink' } })).toBeNull()
  })

  it('7860–7867 ek saat → bugünkü deney yönlendirmesi; o günü dokunulmuş sayar', () => {
    const { deps, h } = handler()
    h({ id: 7862, extra: { kind: 'nudge', type: 'walk', date: DATE, slot: 0 } })
    expect(deps.mark).toHaveBeenCalledWith(DATE, 'walk')
    expect(deps.replan).toHaveBeenCalledTimes(1)
    expect(deps.go).toHaveBeenCalledWith(TAP_ROUTE.walk)
    // Günlükte: günün ilk saati (74xx) dokunulmamışken ek saate dokunmak günü "dokunuldu" yapar
    const log = [
      { date: DATE, type: 'walk', arm: 'send', plannedAt: `${DATE}T09:00:00.000Z` },
      { date: DATE, type: 'mola', arm: 'send', plannedAt: `${DATE}T10:00:00.000Z` },
    ]
    const a = tapAction({ id: 7862, extra: { kind: 'nudge', type: 'walk', date: DATE, slot: 0 } })
    const next = markTapped(log, a.mark.date, a.mark.type)
    expect(next.find((e) => e.type === 'walk').tapped).toBe(true)
    expect(next.find((e) => e.type === 'mola').tapped).toBeFalsy()
  })

  it('7712 yürüyüş sorusu, 7716 fark et: bu turda yönlendirme yok (B3); 7700 hava B2\'de yönlendirir (aşağıda)', () => {
    expect(tapAction({ id: 7712, extra: { kind: 'walkAsk', since: 1 } })).toBeNull()
    expect(tapAction({ id: 7716, extra: { kind: 'walkOffer' } })).toBeNull()
  })

  it("actionId: 'tap' bugünkü gibi; öteki eylemler (walkLater, detectNo, sciOpen) yönlendirmez, günlüğe yazmaz", () => {
    const ev = { id: 7401, extra: { kind: 'nudge', type: 'mola', date: DATE } }
    expect(tapAction({ ...ev, actionId: 'tap' })).toEqual(tapAction(ev))
    for (const actionId of ['walkLater', 'walkGo', 'detectNo', 'sciOpen']) {
      const { deps, h } = handler()
      h({ ...ev, actionId })
      h({ id: 7803, extra: { kind: 'remind', module: 'blink', route: 'blink', evidence: 'kim2020' }, actionId })
      expect(deps.go).not.toHaveBeenCalled()
      expect(deps.mark).not.toHaveBeenCalled()
      expect(deps.showScience).not.toHaveBeenCalled()
    }
  })

  it('bozuk girdi: hiçbir şey yapmaz', () => {
    const { deps, h } = handler()
    h(null)
    h({ id: 9999, extra: null })
    h({ id: 7401, extra: { kind: 'nudge' } })
    expect(deps.mark).not.toHaveBeenCalled()
    expect(deps.go).toHaveBeenCalledTimes(1) // tür yok → Ana sayfa (bugünkü TAP_ROUTE ?? 'home')
    expect(deps.go).toHaveBeenCalledWith('home')
  })
})

// Soğuk açılış: uygulama kapalıyken yapılan dokunuş yalnız ilk bağlanan dinleyiciye gider; eklenti dinleyicisi bir kez
// bağlanır, React'in yeniden bağlaması (StrictMode, off → yeniden onNotifyTap) ikinci dinleyici eklemez.
describe('onNotifyTap: soğuk açılışta tek dinleyici', () => {
  const flush = async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve()
  }
  function fakeLN() {
    let listeners = []
    const LN = {
      addListener: vi.fn(async (_ev, fn) => {
        listeners.push(fn)
        return { remove: async () => (listeners = listeners.filter((f) => f !== fn)) }
      }),
    }
    return { LN, tap: (a) => listeners.forEach((f) => f(a)), count: () => listeners.length }
  }

  it('yeniden bağlanınca tek eklenti dinleyicisi; dokunuş bir kez, son sözlüğe gider', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const first = handler()
    const off1 = await ap.onNotifyTap(first.h)
    off1()
    const second = handler()
    await ap.onNotifyTap(second.h)
    expect(f.count()).toBe(1)
    expect(f.LN.addListener).toHaveBeenCalledTimes(1)
    f.tap({ actionId: 'tap', notification: { id: 7862, extra: { kind: 'nudge', type: 'water', date: DATE, slot: 1 } } })
    await flush()
    expect(first.deps.mark).not.toHaveBeenCalled()
    expect(second.deps.mark).toHaveBeenCalledTimes(1)
    expect(second.deps.mark).toHaveBeenCalledWith(DATE, 'water')
    expect(second.deps.go).toHaveBeenCalledWith('water')
  })

  it('dinleyici yokken gelen dokunuş bekletilir, bağlanınca bir kez iletilir', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const off = await ap.onNotifyTap(() => {})
    off()
    f.tap({ actionId: 'tap', notification: { id: '7803', extra: { kind: 'remind', module: 'blink', route: 'blink', evidence: 'kim2020' } } })
    const { deps, h } = handler()
    await ap.onNotifyTap(h)
    await flush()
    expect(deps.go).toHaveBeenCalledTimes(1)
    expect(deps.go).toHaveBeenCalledWith('blink')
    expect(deps.showScience).toHaveBeenCalledWith({ evidence: 'kim2020', route: 'blink' })
    expect(f.count()).toBe(1)
  })

  it("eylem düğmesi (walkLater) actionId ile gelir ve yönlendirmez; 'dismiss' hiç iletilmez", async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const { deps, h } = handler()
    const spy = vi.fn(h)
    await ap.onNotifyTap(spy)
    f.tap({ actionId: 'walkLater', notification: { id: 7712, extra: { kind: 'walkAsk' } } })
    f.tap({ actionId: 'dismiss', notification: { id: 7401, extra: { kind: 'nudge', type: 'mola', date: DATE } } })
    await flush()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0].actionId).toBe('walkLater')
    expect(deps.go).not.toHaveBeenCalled()
  })
})

// "Tüm verileri sil" (PLAN.v1 §5.1, §5.3 resetAll testi)
describe('resetAllData', () => {
  let ls
  beforeEach(() => {
    const m = new Map()
    ls = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), has: (k) => m.has(k) }
  })
  afterEach(() => vi.useRealTimers())

  it('yeni anahtarlar silinir (moduleReminders, quiet, notify-slots); deneme çizelgesi ve 7302 kalır', async () => {
    const store = createStore(ls)
    store.setSetting('moduleReminders', { blink: { on: true, mode: 'manual', times: ['10:00'], autoAt: null, setAt: null } })
    store.setSetting('quiet', { from: '22:30', to: '07:30' })
    store.setSetting('reminders', { optIn: 'yes' })
    store.setSetting('trialReminder', { at: '2026-10-05T09:00:00.000Z' })
    store.setSetting('firstReportSeen', { date: DATE })
    ls.setItem(NOTIFY_SLOTS_KEY, JSON.stringify([{ date: DATE, type: 'walk', times: ['13:00'] }]))
    ls.setItem('gozolcum:modul-anahtari', '1')
    ls.setItem('gozolcum:baska', '1')

    // Bekleyenler: kendi aralığımız, yalnız-iptal 7712, dokunulmazlar (7301, 7302, 7600)
    const pending = new Set([7401, 7500, 7700, 7803, 7859, 7862, 7712, 7718, 7301, 7302, 7600])
    const LN = {
      cancel: vi.fn(async ({ notifications }) => notifications.forEach(({ id }) => pending.delete(Number(id)))),
    }
    const ap = createApplier(async () => ({ LN }))
    await resetAllData({ store, storage: ls, cancel: ap.cancelOwn, keys: ['gozolcum:modul-anahtari'] })

    const st = store.get().settings
    expect(st.moduleReminders).toBeUndefined()
    expect(st.quiet).toBeUndefined()
    expect(st.reminders).toBeUndefined()
    expect(st.trialReminder).toEqual({ at: '2026-10-05T09:00:00.000Z' })
    expect(st.firstReportSeen).toEqual({ date: DATE })
    expect(ls.has(NOTIFY_SLOTS_KEY)).toBe(false)
    expect(ls.has('gozolcum:modul-anahtari')).toBe(false)
    expect(ls.has('gozolcum:baska')).toBe(true)
    expect([...pending].sort()).toEqual([7301, 7302, 7600])
    const cancelled = LN.cancel.mock.calls[0][0].notifications.map((n) => n.id)
    expect(cancelled).not.toContain(7302)
    expect(cancelled).toEqual(expect.arrayContaining([7700, 7701, 7800, 7859, 7860, 7867, 7710, 7719]))
    expect(native.setWalkGuards).toHaveBeenCalledWith([])
  })

  it('otomatik ekran ölçüsü geri yazılır; TRIAL_KEYS ve NOTIFY_RESET_KEYS beklenen', () => {
    const store = createStore(ls)
    const autoCal = { method: 'auto', pxPerMm: 6 }
    resetAllData({ store, storage: ls, autoCal })
    expect(store.get().settings.calibration).toEqual(autoCal)
    expect(TRIAL_KEYS).toEqual(['trialOffer', 'trialReminder', 'trialNoteSeen', 'firstReportSeen'])
    expect(NOTIFY_RESET_KEYS).toEqual([NOTIFY_SLOTS_KEY])
  })
})

describe('tapAction: sabah havası 7700–7701', () => {
  it('hava sayfası rotası; açılamıyorsa Ana sayfa (VARSAYIM: screens/Sky.jsx henüz yok)', () => {
    const ev = { id: 7700, extra: { kind: 'weather', date: '2026-09-30' } }
    expect(tapAction(ev, { routeOk: () => true })).toEqual({ kind: 'weather', route: 'sky', date: '2026-09-30' })
    expect(tapAction({ ...ev, id: 7701 }, { routeOk: (r) => r === 'home' })).toEqual({ kind: 'weather', route: 'home', date: '2026-09-30' })
    expect(tapAction({ ...ev, id: 7702 })).toBeNull()
    expect(tapAction({ ...ev, actionId: 'sciOpen' })).toBeNull()
  })
})
