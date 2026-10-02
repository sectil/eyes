import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// native.js: setWalkGuards'ı izlemek için sahte (web: isIOSApp false)
const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import { createApplier, applyPlan, cancelOwn, onNotifyTap, notifyPermission, askNotifyPermission } from './notifyApply.js'

const NOW = new Date('2026-09-27T08:00:00.000Z')
const inMin = (m) => new Date(NOW.getTime() + m * 60000)
// iOS getPending gibi: saniye hassasiyetli ISO dizesi
const iosIso = (d) => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z')
const flush = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve()
}

// Sahte LocalNotifications: bekleyenleri id → bildirim olarak tutar
function fakeLN({ perm = 'granted', pending = [] } = {}) {
  const store = new Map(pending.map((n) => [n.id, n]))
  let listeners = []
  const LN = {
    checkPermissions: vi.fn(async () => ({ display: perm })),
    getPending: vi.fn(async () => ({
      notifications: [...store.values()].map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: n.schedule?.at ? { ...n.schedule, at: iosIso(n.schedule.at) } : n.schedule,
        extra: n.extra,
      })),
    })),
    cancel: vi.fn(async ({ notifications }) => notifications.forEach(({ id }) => store.delete(Number(id)))),
    schedule: vi.fn(async ({ notifications }) => {
      notifications.forEach((n) => store.set(n.id, n))
      return { notifications: notifications.map(({ id }) => ({ id })) }
    }),
    cancelAll: vi.fn(async () => store.clear()),
    addListener: vi.fn(async (_ev, fn) => {
      listeners.push(fn)
      return { remove: async () => (listeners = listeners.filter((f) => f !== fn)) }
    }),
  }
  return { LN, store, tap: (a) => listeners.forEach((f) => f(a)), listenerCount: () => listeners.length }
}

const nudge = (id, at, type = 'mola', extra = {}) => ({
  id,
  at,
  type,
  title: 'Mola',
  body: 'Bir dakika yeter: kalk, uzağa bak.',
  extra: { kind: 'nudge', date: '2026-09-27', type, arm: 'send', ...extra },
  level: 'active',
})
const focusN = (k, at) => ({
  id: 7500 + k - 1,
  at,
  type: 'focus',
  title: 'Çalışma oturumu',
  body: 'Bir saat oldu. Kalk, uzağa bak; sonra devam edebilirsin.',
  extra: { kind: 'focus', k },
  level: 'timeSensitive',
})
const plan = (notifications, walkGuards = []) => ({ notifications, log: [], walkGuards })

async function run(applier, p) {
  const r = applier.applyPlan(p)
  await vi.advanceTimersByTimeAsync(400)
  return r
}

describe('applyPlan', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    native.setWalkGuards.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it('izin yoksa hiçbir şey kurmaz, bekleyene de dokunmaz (schedule izni kendisi ister)', async () => {
    for (const perm of ['prompt', 'denied']) {
      const f = fakeLN({ perm })
      const r = await run(createApplier(async () => ({ LN: f.LN })), plan([nudge(7400, inMin(120))]))
      expect(r).toEqual({ ok: false, reason: 'permission' })
      expect(f.LN.getPending).not.toHaveBeenCalled()
      expect(f.LN.schedule).not.toHaveBeenCalled()
      expect(f.LN.cancel).not.toHaveBeenCalled()
    }
    expect(native.setWalkGuards).not.toHaveBeenCalled()
  })

  it('tek seferlik schedule { at, allowWhileIdle }: on/every yok; level → interruptionLevel; extra aynen', async () => {
    const f = fakeLN()
    const r = await run(createApplier(async () => ({ LN: f.LN })), plan([nudge(7400, inMin(120)), focusN(1, inMin(60))]))
    expect(r).toEqual({ ok: true, scheduled: 2, cancelled: 0, kept: 0 })
    expect(f.LN.schedule).toHaveBeenCalledTimes(1)
    const [a, b] = f.LN.schedule.mock.calls[0][0].notifications
    expect(a).toEqual({
      id: 7400,
      title: 'Mola',
      body: 'Bir dakika yeter: kalk, uzağa bak.',
      schedule: { at: inMin(120), allowWhileIdle: true },
      interruptionLevel: 'active',
      extra: { kind: 'nudge', date: '2026-09-27', type: 'mola', arm: 'send' },
    })
    expect(a.schedule.at).toBeInstanceOf(Date)
    expect(b).toMatchObject({ id: 7500, interruptionLevel: 'timeSensitive', extra: { kind: 'focus', k: 1 } })
    for (const n of [a, b]) {
      expect(n.schedule).not.toHaveProperty('on')
      expect(n.schedule).not.toHaveProperty('every')
    }
    expect(f.LN.cancelAll).not.toHaveBeenCalled()
  })

  it('yalnız kendi aralığı: 7301/7302 ve yabancı id iptal edilmez, plandaki yabancı id kurulmaz', async () => {
    const other = (id) => ({ id, title: 'x', body: 'y', schedule: { at: inMin(300) } })
    const f = fakeLN({ pending: [other(7301), other(7302), other(9999), other(7399), other(7510), other(7405)] })
    const r = await run(createApplier(async () => ({ LN: f.LN })), plan([nudge(7301, inMin(30)), nudge(7401, inMin(90))]))
    expect(r).toMatchObject({ ok: true, scheduled: 1, cancelled: 1 })
    expect(f.LN.cancel).toHaveBeenCalledWith({ notifications: [{ id: 7405 }] })
    expect(f.LN.schedule.mock.calls[0][0].notifications.map((n) => n.id)).toEqual([7401])
    expect([...f.store.keys()].sort()).toEqual([7301, 7302, 7399, 7401, 7510, 9999])
    expect(f.LN.cancelAll).not.toHaveBeenCalled()
  })

  it('7303 (deneme bitişi, restNotify) kendi aralığında değil: plan uzlaştırması iptal etmez, plandaki 7303 kurulmaz', async () => {
    const other = (id) => ({ id, title: 'x', body: 'y', schedule: { at: inMin(300) } })
    const f = fakeLN({ pending: [other(7302), other(7303)] })
    const r = await run(createApplier(async () => ({ LN: f.LN })), plan([nudge(7303, inMin(30)), nudge(7401, inMin(90))]))
    expect(r).toMatchObject({ ok: true, scheduled: 1, cancelled: 0 })
    expect(f.LN.cancel).not.toHaveBeenCalled()
    expect(f.LN.schedule.mock.calls[0][0].notifications.map((n) => n.id)).toEqual([7401])
    expect([...f.store.keys()].sort()).toEqual([7302, 7303, 7401])
  })

  it('değişmeyen bildirim yeniden kurulmaz; zamanı ya da metni değişen iptal edilip kurulur', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    // oturum bildirimi milisaniyeli: getPending saniyeye yuvarlasa da "aynı" sayılır
    const fAt = new Date(inMin(60).getTime() + 437)
    const p1 = plan([nudge(7400, inMin(120)), nudge(7401, inMin(240), 'walk'), focusN(1, fAt)])
    await run(ap, p1)
    f.LN.schedule.mockClear()

    const again = await run(ap, p1)
    expect(again).toEqual({ ok: true, scheduled: 0, cancelled: 0, kept: 3 })
    expect(f.LN.cancel).not.toHaveBeenCalled()
    expect(f.LN.schedule).not.toHaveBeenCalled()

    const changedText = { ...nudge(7400, inMin(120)), body: 'Birkaç dakika kalk, istersen pencereye yürü.' }
    const r = await run(ap, plan([changedText, nudge(7401, inMin(250), 'walk'), focusN(1, fAt)]))
    expect(r).toEqual({ ok: true, scheduled: 2, cancelled: 2, kept: 1 })
    expect(f.LN.cancel.mock.calls[0][0].notifications.map((n) => n.id).sort()).toEqual([7400, 7401])
    expect(f.LN.schedule.mock.calls[0][0].notifications.map((n) => n.id).sort()).toEqual([7400, 7401])
    expect(f.store.get(7400).body).toBe('Birkaç dakika kalk, istersen pencereye yürü.')
  })

  it('yeni planda olmayan kendi bildirimi iptal edilir (boş plan → hepsi)', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    await run(ap, plan([nudge(7400, inMin(120)), focusN(2, inMin(120))]))
    const r = await run(ap, plan([]))
    expect(r).toMatchObject({ ok: true, cancelled: 2, scheduled: 0 })
    expect(f.store.size).toBe(0)
  })

  it('geçmiş an kurulmaz (hemen çalardı)', async () => {
    const f = fakeLN()
    const r = await run(createApplier(async () => ({ LN: f.LN })), plan([nudge(7400, inMin(-5)), nudge(7410, NOW), nudge(7411, inMin(1))]))
    expect(r).toMatchObject({ ok: true, scheduled: 1 })
    expect(f.LN.schedule.mock.calls[0][0].notifications.map((n) => n.id)).toEqual([7411])
  })

  it('400 ms birleştirme: pencere içindeki çağrılardan son plan kazanır, hepsi aynı sonucu alır', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const a = ap.applyPlan(plan([nudge(7400, inMin(120))]))
    await vi.advanceTimersByTimeAsync(200)
    const b = ap.applyPlan(plan([nudge(7401, inMin(130))]))
    await vi.advanceTimersByTimeAsync(150)
    const c = ap.applyPlan(plan([nudge(7402, inMin(140))]))
    expect(f.LN.checkPermissions).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(50) // ilk çağrıdan 400 ms sonra
    const [ra, rb, rc] = await Promise.all([a, b, c])
    expect(ra).toEqual(rc)
    expect(rb).toEqual(rc)
    expect(f.LN.getPending).toHaveBeenCalledTimes(1)
    expect([...f.store.keys()]).toEqual([7402])
  })

  it('sıralı kuyruk: süren uygulama bitmeden sonraki başlamaz', async () => {
    const f = fakeLN()
    let release
    const gate = new Promise((r) => (release = r))
    const realGet = f.LN.getPending.getMockImplementation()
    f.LN.getPending.mockImplementationOnce(async () => {
      await gate
      return realGet()
    })
    const ap = createApplier(async () => ({ LN: f.LN }))
    const first = ap.applyPlan(plan([nudge(7400, inMin(120))]))
    await vi.advanceTimersByTimeAsync(400)
    await flush()
    expect(f.LN.getPending).toHaveBeenCalledTimes(1) // ilki getPending'de takılı
    const second = ap.applyPlan(plan([nudge(7401, inMin(130))]))
    await vi.advanceTimersByTimeAsync(400)
    await flush()
    expect(f.LN.getPending).toHaveBeenCalledTimes(1) // ikincisi bekliyor
    expect(f.LN.schedule).not.toHaveBeenCalled()
    release()
    await first
    await second
    expect(f.LN.getPending).toHaveBeenCalledTimes(2)
    expect(f.LN.schedule.mock.calls.map((c) => c[0].notifications[0].id)).toEqual([7400, 7401])
    expect([...f.store.keys()]).toEqual([7401])
  })

  it('hata zinciri kırmaz; sonuç reddedilmez', async () => {
    const f = fakeLN()
    f.LN.schedule.mockRejectedValueOnce(new Error('boom'))
    const ap = createApplier(async () => ({ LN: f.LN }))
    expect(await run(ap, plan([nudge(7400, inMin(120))]))).toEqual({ ok: false, reason: 'error' })
    expect(await run(ap, plan([nudge(7400, inMin(120))]))).toMatchObject({ ok: true, scheduled: 1 })
  })

  it('eklenti yoksa (web) ya da yüklenemezse: unsupported', async () => {
    expect(await run(createApplier(async () => null), plan([nudge(7400, inMin(120))]))).toEqual({ ok: false, reason: 'unsupported' })
    const broken = createApplier(async () => {
      throw new Error('yok')
    })
    expect(await run(broken, plan([]))).toEqual({ ok: false, reason: 'unsupported' })
  })

  it("walkGuards native'e gider; yalnız kurulu (ya da korunan) bildirimlerin koruması", async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const guards = [
      { id: 7401, date: '2026-09-27', threshold: 3100 },
      { id: 7411, date: '2026-09-28', threshold: 3100 }, // bildirimi geçmişte kaldı → kurulmadı
      { id: 7421, date: '2026-09-29', threshold: 3100 }, // planda yok
    ]
    await run(ap, plan([nudge(7401, inMin(120), 'walk'), nudge(7411, inMin(-1), 'walk')], guards))
    expect(native.setWalkGuards).toHaveBeenCalledTimes(1)
    expect(native.setWalkGuards).toHaveBeenLastCalledWith([guards[0]])
    // ikinci uygulamada bildirim korunur (yeniden kurulmaz), koruma yine verilir
    await run(ap, plan([nudge(7401, inMin(120), 'walk')], [guards[0]]))
    expect(native.setWalkGuards).toHaveBeenLastCalledWith([guards[0]])
    expect(f.LN.schedule).toHaveBeenCalledTimes(1)
  })
})

describe('cancelOwn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    native.setWalkGuards.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it('kendi aralığının tamamını iptal eder; 7301/7302 kalır; izin istemez; korumalar temizlenir', async () => {
    const other = (id) => ({ id, title: 'x', body: 'y', schedule: { at: inMin(300) } })
    const f = fakeLN({ perm: 'denied', pending: [other(7301), other(7302), other(7400), other(7463), other(7503)] })
    const r = await createApplier(async () => ({ LN: f.LN })).cancelOwn()
    expect(r).toEqual({ ok: true })
    const ids = f.LN.cancel.mock.calls[0][0].notifications.map((n) => n.id)
    // 7400–7499, 7500–7509, 7700–7701, 7800–7867 (uzlaştırılan) + 7710–7719 (yalnız iptal); PLAN.v1 §5.5 madde 2
    expect(ids).toHaveLength(190)
    expect(ids).toContain(7400)
    expect(ids).toContain(7499)
    expect(ids).toContain(7509)
    for (const id of [7700, 7701, 7710, 7719, 7800, 7859, 7860, 7867]) expect(ids).toContain(id)
    for (const id of [7301, 7302, 7510, 7600, 7607, 7702, 7709, 7720, 7799, 7868]) expect(ids).not.toContain(id)
    expect([...f.store.keys()]).toEqual([7301, 7302])
    expect(f.LN.cancelAll).not.toHaveBeenCalled()
    expect(native.setWalkGuards).toHaveBeenLastCalledWith([])
  })

  it('"Tüm verileri sil" (cancelOwn) deneme bildirimlerini iptal etmez: 7302 ve 7303 kalır', async () => {
    const other = (id) => ({ id, title: 'x', body: 'y', schedule: { at: inMin(300) } })
    const f = fakeLN({ pending: [other(7302), other(7303), other(7400)] })
    expect(await createApplier(async () => ({ LN: f.LN })).cancelOwn()).toEqual({ ok: true })
    const ids = f.LN.cancel.mock.calls[0][0].notifications.map((n) => n.id)
    expect(ids).not.toContain(7302)
    expect(ids).not.toContain(7303)
    expect([...f.store.keys()].sort()).toEqual([7302, 7303])
  })

  it('pencerede bekleyen planı düşürür (son çağrı kazanır)', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const pending = ap.applyPlan(plan([nudge(7400, inMin(120))]))
    await ap.cancelOwn()
    await vi.advanceTimersByTimeAsync(400)
    expect(await pending).toEqual({ ok: false, reason: 'superseded' })
    expect(f.LN.schedule).not.toHaveBeenCalled()
    expect(f.store.size).toBe(0)
  })
})

describe('onNotifyTap', () => {
  const tapOf = (id, extra, actionId = 'tap') => ({ actionId, notification: { id, title: 't', body: 'b', extra } })

  it('tek eklenti dinleyicisi; yeniden çağrı yalnız cb değiştirir; yalnız dokunma iletilir', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    const off1 = await ap.onNotifyTap(cb1)
    f.tap(tapOf(7301))
    expect(cb1).toHaveBeenCalledWith({ id: 7301, extra: null })
    const off2 = await ap.onNotifyTap(cb2)
    expect(f.LN.addListener).toHaveBeenCalledTimes(1)
    expect(f.LN.addListener.mock.calls[0][0]).toBe('localNotificationActionPerformed')
    expect(f.listenerCount()).toBe(1)
    off1() // eski cb'nin bırakılması yenisini etkilemez
    const extra = { kind: 'nudge', date: '2026-09-27', type: 'water', arm: 'send' }
    f.tap(tapOf(7403, extra))
    f.tap(tapOf(7403, extra, 'dismiss'))
    expect(cb2).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledWith({ id: 7403, extra })
    expect(cb1).toHaveBeenCalledTimes(1)
    off2()
    expect(f.listenerCount()).toBe(1) // dinleyici kalır
  })

  it('7303 (deneme bitişi) dokunuşu aynı tek dinleyiciden { id, extra } olarak iletilir; kapatma iletilmez', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const cb = vi.fn()
    await ap.onNotifyTap(cb)
    f.tap(tapOf(7303))
    f.tap(tapOf(7303, undefined, 'dismiss'))
    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith({ id: 7303, extra: null })
    expect(f.LN.addListener).toHaveBeenCalledTimes(1)
  })

  it('cb yokken gelen dokunuş bekletilir, cb bağlanınca iletilir', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const off = await ap.onNotifyTap(() => {})
    off()
    f.tap(tapOf(7500, { kind: 'focus', k: 1 }))
    const cb = vi.fn()
    await ap.onNotifyTap(cb)
    expect(cb).toHaveBeenCalledWith({ id: 7500, extra: { kind: 'focus', k: 1 } })
  })

  it('eklenti yoksa sessizce boş bırakma fonksiyonu döner', async () => {
    const off = await createApplier(async () => null).onNotifyTap(() => {})
    expect(typeof off).toBe('function')
    off()
  })
})

describe('modül örneği (web)', () => {
  afterEach(() => vi.useRealTimers())
  it('web: uygulama ve iptal unsupported; izin yeniden kullanımı restNotify.js', async () => {
    vi.useFakeTimers()
    const p = applyPlan(plan([nudge(7400, new Date(Date.now() + 3600000))]))
    await vi.advanceTimersByTimeAsync(400)
    expect(await p).toEqual({ ok: false, reason: 'unsupported' })
    expect(await cancelOwn()).toEqual({ ok: false, reason: 'unsupported' })
    expect(typeof (await onNotifyTap(() => {}))).toBe('function')
    expect(await notifyPermission()).toBe('unsupported')
    expect(await askNotifyPermission()).toBe(false)
  })
})

describe('yeni özellik (PLAN.v1 §5.5 madde 2–3)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    native.setWalkGuards.mockClear()
  })
  afterEach(() => vi.useRealTimers())
  const other = (id) => ({ id, title: 'x', body: 'y', schedule: { at: inMin(300) } })
  const withDelivered = (f, ids) => {
    f.LN.getDeliveredNotifications = vi.fn(async () => ({ notifications: ids.map((id) => ({ id, title: 't', body: 'b' })) }))
    f.LN.removeDeliveredNotifications = vi.fn(async () => {})
    return f
  }

  // Metni bağlanmış bir modül hatırlatması (B1a'da metinler bağlanınca planAll'ın üreteceği biçim)
  const remindN = (id, at) => ({ id, at, type: 'remind', title: 't', body: 'b', extra: { kind: 'remind', module: 'blink' }, level: 'active' })
  // Metni henüz bağlanmamış: yalnız textKey (bu turda planAll'ın ürettiği biçim)
  const keyOnly = (id, at) => ({ id, at, type: 'remind', textKey: 'remind.blink', extra: { kind: 'remind', module: 'blink' }, level: 'active' })

  it('grouped planda threadIdentifier nefona ve relevanceScore; kapalıyken ikisi de yok', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    await run(ap, { ...plan([nudge(7400, inMin(120)), focusN(1, inMin(60)), remindN(7801, inMin(200))]), grouped: true })
    const sent = f.LN.schedule.mock.calls[0][0].notifications
    expect(sent.map((n) => n.id).sort()).toEqual([7400, 7500, 7801])
    expect(new Set(sent.map((n) => n.threadIdentifier))).toEqual(new Set(['nefona']))
    sent.forEach((n) => expect(n.relevanceScore).toBeGreaterThan(0))
    const g = fakeLN()
    await run(createApplier(async () => ({ LN: g.LN })), plan([nudge(7400, inMin(120))]))
    expect(g.LN.schedule.mock.calls[0][0].notifications[0]).not.toHaveProperty('threadIdentifier')
    expect(g.LN.schedule.mock.calls[0][0].notifications[0]).not.toHaveProperty('relevanceScore')
  })

  it('grouped ama kurulacak yeni bildirim yoksa (yalnız textKey) gruplama yok: 74xx bugünkü biçimde, açılışta temizlik yok', async () => {
    const f = withDelivered(fakeLN(), [7500, 7805])
    const ap = createApplier(async () => ({ LN: f.LN }))
    const p = ap.applyPlan({ ...plan([nudge(7400, inMin(120)), keyOnly(7801, inMin(200)), { ...keyOnly(7861, inMin(300)), extra: { kind: 'nudge', type: 'walk', slot: 1 } }]), grouped: true }, { tidy: true })
    await vi.advanceTimersByTimeAsync(400)
    expect(await p).toMatchObject({ ok: true, scheduled: 1 })
    const [sent] = f.LN.schedule.mock.calls[0][0].notifications
    expect(sent.id).toBe(7400)
    expect(sent).not.toHaveProperty('threadIdentifier')
    expect(sent).not.toHaveProperty('relevanceScore')
    expect(f.LN.getDeliveredNotifications).not.toHaveBeenCalled()
    expect(f.LN.removeDeliveredNotifications).not.toHaveBeenCalled()
  })

  // Plan o kimliği hiç istemiyorsa (hava kapalı, modül hatırlatması kapalı) bekleyen iptal edilir; 7712 Swift'indir.
  it('yeni aralıklar uzlaştırılır; 7710–7719 (Swift) uzlaştırılmaz; metni bağlanmamış bildirim kurulmaz', async () => {
    const f = fakeLN({ pending: [other(7712), other(7805), other(7862), other(7700), other(7600)] })
    const r = await run(createApplier(async () => ({ LN: f.LN })), plan([keyOnly(7801, inMin(120))]))
    expect(r).toMatchObject({ ok: true, scheduled: 0, cancelled: 3 })
    expect([...f.store.keys()].sort()).toEqual([7600, 7712])
  })

  it('yerelde yenilenmiş 7700 ve bekleyen 7712 reconcile\'dan sonra yerinde (§5.3); 7712 cancelOwn\'da iptal', async () => {
    const yerel = { id: 7700, title: 'Hava', body: 'Swift yeniledi: yağmur var', schedule: { at: inMin(90) } }
    const f = fakeLN({ pending: [yerel, other(7712)] })
    const ap = createApplier(async () => ({ LN: f.LN }))
    const hava = { id: 7700, at: inMin(90), type: 'weather', title: 'Hava', body: 'JS metni', extra: { kind: 'weather' }, level: 'active' }
    const r = await run(ap, { ...plan([{ ...hava, keepPending: true }]), grouped: true })
    expect(r).toMatchObject({ ok: true, scheduled: 0, cancelled: 0, kept: 1 })
    expect(f.store.get(7700).body).toBe('Swift yeniledi: yağmur var')
    expect(f.store.has(7712)).toBe(true)
    // İşaret yoksa bugünkü kural: metin farklıysa yeniden kurulur
    const g = fakeLN({ pending: [yerel] })
    const r2 = await run(createApplier(async () => ({ LN: g.LN })), plan([hava]))
    expect(r2).toMatchObject({ ok: true, scheduled: 1, cancelled: 1 })
    expect(g.store.get(7700).body).toBe('JS metni')
    // keepPending yalnız 7700–7701'de geçerli
    const h = fakeLN({ pending: [{ ...yerel, id: 7801 }] })
    const r3 = await run(createApplier(async () => ({ LN: h.LN })), plan([{ ...remindN(7801, inMin(90)), keepPending: true }]))
    expect(r3).toMatchObject({ scheduled: 1, cancelled: 1 })
    await ap.cancelOwn()
    expect(f.store.has(7712)).toBe(false)
    expect(f.store.has(7700)).toBe(false)
  })

  it('açılışta (tidy) teslim edilmişler kaldırılır, deney bildirimleri (74xx, 7860–7867) ve 7301/7302/7600 kalır; kapalıyken hiç bakılmaz', async () => {
    const f = withDelivered(fakeLN(), [7301, 7403, 7500, 7600, 7700, 7712, 7805, 7860, 7861, 7867])
    const acik = () => ({ ...plan([nudge(7400, inMin(120)), remindN(7801, inMin(200))]), grouped: true })
    await run(createApplier(async () => ({ LN: f.LN })), acik()).then(() => {})
    expect(f.LN.getDeliveredNotifications).not.toHaveBeenCalled() // açılış değil
    const ap = createApplier(async () => ({ LN: f.LN }))
    const p = ap.applyPlan(acik(), { tidy: true })
    await vi.advanceTimersByTimeAsync(400)
    await p
    // Ek saate dokunmak markTapped'i çalıştırır (§5.5 madde 1): teslim edilmiş ek saat, 74xx gibi Bildirim Merkezi'nde kalır
    expect(f.LN.removeDeliveredNotifications.mock.calls[0][0].notifications.map((n) => n.id)).toEqual([7500, 7700, 7712, 7805])
    const g = withDelivered(fakeLN(), [7500])
    const q = createApplier(async () => ({ LN: g.LN })).applyPlan(plan([nudge(7400, inMin(120))]), { tidy: true })
    await vi.advanceTimersByTimeAsync(400)
    await q
    expect(g.LN.getDeliveredNotifications).not.toHaveBeenCalled()
    expect(g.LN.removeDeliveredNotifications).not.toHaveBeenCalled()
  })

  it('bindTap actionId geçirir: tap bugünkü biçimde, eylem { id, extra, actionId }, dismiss iletilmez', async () => {
    const f = fakeLN()
    const ap = createApplier(async () => ({ LN: f.LN }))
    const cb = vi.fn()
    await ap.onNotifyTap(cb)
    const extra = { kind: 'walkAsk', since: 'x' }
    f.tap({ actionId: 'tap', notification: { id: 7712, extra } })
    f.tap({ actionId: 'walkGo', notification: { id: '7712', extra } })
    f.tap({ actionId: 'dismiss', notification: { id: 7712, extra } })
    expect(cb.mock.calls.map((c) => c[0])).toEqual([{ id: 7712, extra }, { id: 7712, extra, actionId: 'walkGo' }])
  })
})
