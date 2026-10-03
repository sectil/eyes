// Eşdeğerlik düzeneği (PLAN.v1 §5.4, §5.5 madde 5): yeni özellikler kapalıyken
//   (i) planAll çıktısı dondurulmuş tabandaki planNotifications çıktısıyla derin eşit (bildirimler, günlük, WalkGuard);
//   (ii) sahte bildirim eklentisine yapılan çağrı dizisi (checkPermissions, getPending, cancel, schedule,
//        getDelivered/removeDelivered*, setWalkGuards) taban notifyApply ile aynı.
// 20.000 tohumlu bağlam (mulberry32(1)); saat dilimi Europe/Berlin (yaz saati günleri gerçek geçiş). Fark varsa ilk
// fark yazdırılır; düzeltilecek olan kod, taban değil.
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { isDeepStrictEqual } from 'node:util'

const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import { planAll } from './notifyAll.js'
import { createApplier } from './notifyApply.js'
import { planNotifications as basePlan } from '../../test/fixtures/bildirim-taban/notifyPlan.js'
import { createApplier as baseApplier } from '../../test/fixtures/bildirim-taban/notifyApply.js'
import { mulberry32, makeContext, makeWeatherInput, MODULES } from '../../test/notifyCtx.js'

const N = 20000
// "Kapalı" moduleReminders biçimleri (§5.4: boş); modül listesi ve öteki yeni girdiler dolu olsa da çıktı değişmez
const OFF_MR = [undefined, null, {}, 'bozuk', { breath: { on: false, times: [] } }, { yoga: { on: false, mode: 'manual', times: ['10:00'] } }]
// "Kapalı" sabah havası biçimleri (§5.4): ayar yok/kapalı/bozuk; hava verisi (önbellek, yer) verilmiş olsa da çıktı değişmez
const OFF_MW = [undefined, false, null, { on: false }, { on: 'evet', delayMin: 20 }, 'açık', { delayMin: 10, time: '08:00' }]

const tz = process.env.TZ
beforeAll(() => {
  process.env.TZ = 'Europe/Berlin'
})
afterAll(() => {
  if (tz === undefined) delete process.env.TZ
  else process.env.TZ = tz
})

function contexts() {
  const rnd = mulberry32(1)
  const wrnd = mulberry32(4) // hava girdisi ayrı üreteçten: rnd dizisi (ve bağlamlar) eskisi gibi kalır
  const out = []
  for (let i = 0; i < N; i++) {
    const ctx = makeContext(rnd)
    const off = OFF_MR[Math.floor(rnd() * OFF_MR.length)]
    const mw = OFF_MW[Math.floor(wrnd() * OFF_MW.length)]
    const wx = wrnd() < 0.7 ? { weather: makeWeatherInput(wrnd, ctx.now).weather } : {}
    const extra = {
      modules: rnd() < 0.7 ? MODULES : [],
      alarm: rnd() < 0.3 ? { on: true, hour: 6, minute: 30, days: [], at: new Date(ctx.now.getTime() + 36e6).toISOString() } : null,
      quiet: rnd() < 0.3 ? { from: '22:00', to: '09:00' } : null,
    }
    out.push({ ctx, all: { ...ctx, ...extra, ...wx, ...(off === undefined ? {} : { moduleReminders: off }), ...(mw === undefined ? {} : { morningWeather: mw }) }, rnd: rnd() })
  }
  return out
}

const show = (v) => JSON.stringify(v, null, 1)?.slice(0, 1500)

describe('eşdeğerlik (i): planAll ≡ taban planNotifications (yeni özellik kapalı)', () => {
  // Kendi süre sınırı: 20.000 bağlam öteki test dosyalarıyla birlikte koşunca 5 sn'yi aşabiliyor (inceleme bulgusu)
  it(`${N} tohumlu bağlamda derin eşit; 0 fark`, { timeout: 120000 }, () => {
    let diffs = 0
    let first = null
    let withNotes = 0
    for (const { ctx, all } of contexts()) {
      const a = planAll(all)
      const b = basePlan(ctx)
      if (a.notifications.length) withNotes++
      if (!isDeepStrictEqual(a, b)) {
        diffs++
        if (!first) first = { now: ctx.now.toString(), got: a, want: b }
      }
    }
    if (first) console.log('İLK FARK', first.now, '\nplanAll:', show(first.got), '\ntaban:', show(first.want))
    expect(diffs).toBe(0)
    expect(withNotes).toBeGreaterThan(N / 3) // bağlamlar gerçekten bildirim üretiyor
  })
})

// Nef (lib/nef/notify.js): nef girdisi verilse de Nef ancak olgusu varsa (yağmur kişinin yürüyüş saatine denk) bildirim
// ekler ya da metin zenginleştirir. Söyleyecek olgusu olmayan bağlamda çıktı tabanın kendisi.
describe('eşdeğerlik (iii): Nef verisi var, olgusu yok → planAll ≡ taban', () => {
  it(`${N} bağlamda Nef konuşmadıysa derin eşit; konuştuysa yalnız Nef'in kimliği eklendi ya da 7700–7701 metni değişti`, { timeout: 120000 }, () => {
    let diffs = 0
    let spoke = 0
    let first = null
    for (const { ctx, all } of contexts()) {
      const a = planAll({ ...all, nef: { rows: [] } })
      const b = basePlan(ctx)
      if (a.nef?.length) {
        spoke++
        const rest = a.notifications.filter((n) => n.id < 7900 || n.id > 7919)
        const same = rest.length === b.notifications.length && rest.every((n, i) => n.id === b.notifications[i].id && n.at.getTime() === b.notifications[i].at.getTime() && (isDeepStrictEqual(n, b.notifications[i]) || (n.id >= 7700 && n.id <= 7701)))
        if (!same) diffs++
        continue
      }
      if (!isDeepStrictEqual(a, b)) {
        diffs++
        if (!first) first = { now: ctx.now.toString(), got: a, want: b }
      }
    }
    if (first) console.log('İLK FARK', first.now, '\nplanAll:', show(first.got), '\ntaban:', show(first.want))
    expect(diffs).toBe(0)
    expect(spoke).toBeLessThan(N / 10) // Nef çoğu bağlamda susar
  })
})

// Sahte eklenti: her çağrıyı sırayla kaydeder (setWalkGuards dâhil)
function recorder(pendingInit, perm, delivered) {
  const calls = []
  const store = new Map(pendingInit.map((n) => [n.id, n]))
  const LN = {
    checkPermissions: async () => (calls.push(['checkPermissions']), { display: perm }),
    getPending: async () => {
      calls.push(['getPending'])
      return {
        notifications: [...store.values()].map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          schedule: { ...n.schedule, at: new Date(n.schedule.at).toISOString().replace(/\.\d{3}Z$/, 'Z') },
          extra: n.extra,
        })),
      }
    },
    cancel: async (o) => {
      calls.push(['cancel', o])
      o.notifications.forEach(({ id }) => store.delete(Number(id)))
    },
    schedule: async (o) => {
      calls.push(['schedule', o])
      o.notifications.forEach((n) => store.set(n.id, n))
    },
    getDeliveredNotifications: async () => (calls.push(['getDeliveredNotifications']), { notifications: delivered.map((id) => ({ id, title: 't', body: 'b' })) }),
    removeDeliveredNotifications: async (o) => void calls.push(['removeDeliveredNotifications', o]),
    removeDeliveredNotificationsById: async (o) => void calls.push(['removeDeliveredNotificationsById', o]),
    removeAllDeliveredNotifications: async () => void calls.push(['removeAllDeliveredNotifications']),
    cancelAll: async () => void calls.push(['cancelAll']),
    addListener: async () => ({ remove: async () => {} }),
  }
  return { LN, calls }
}

// Bekleyenlerin başlangıcı: planın bir kısmı aynen, bir kısmı metni/saati değişmiş, eski kendi kimlikleri ve yabancılar
function pendingFor(plan, r) {
  const rnd = mulberry32(Math.floor(r * 2 ** 32))
  const out = []
  for (const n of plan.notifications) {
    const k = rnd()
    if (k < 0.5) out.push({ id: n.id, title: n.title, body: n.body, schedule: { at: n.at, allowWhileIdle: true }, extra: n.extra })
    else if (k < 0.6) out.push({ id: n.id, title: n.title, body: 'eski metin', schedule: { at: n.at }, extra: n.extra })
    else if (k < 0.7) out.push({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at.getTime() + 60000) }, extra: n.extra })
  }
  for (const id of [7301, 7302, 7600, 7607, 7712, 7405, 7462, 7503, 9999]) if (rnd() < 0.3 && !out.some((p) => p.id === id)) out.push({ id, title: 'x', body: 'y', schedule: { at: new Date(Date.now() + 36e5) } })
  return out
}

describe('eşdeğerlik (ii): notifyApply çağrı dizisi ≡ taban notifyApply (yeni özellik kapalı)', () => {
  it(`${N} bağlamda aynı çağrı dizisi (açılış temizliği isteğiyle bile); 0 fark`, { timeout: 120000 }, async () => {
    vi.useFakeTimers()
    let diffs = 0
    let first = null
    const run = async (make, plan, pending, perm, opts) => {
      native.setWalkGuards.mockReset()
      const rec = recorder(pending, perm, [7403, 7500, 7700, 7805, 7861])
      native.setWalkGuards.mockImplementation(async (g) => void rec.calls.push(['setWalkGuards', g]))
      const ap = make(async () => ({ LN: rec.LN }))
      const p = ap.applyPlan(plan, opts)
      await vi.advanceTimersByTimeAsync(400)
      return { res: await p, calls: rec.calls }
    }
    try {
      for (const { ctx, all, rnd: r } of contexts()) {
        vi.setSystemTime(ctx.now)
        const perm = r < 0.9 ? 'granted' : 'denied'
        const bPlan = basePlan(ctx)
        const pending = pendingFor(bPlan, r)
        const got = await run(createApplier, planAll(all), pending, perm, { tidy: true })
        const want = await run(baseApplier, bPlan, pending, perm)
        if (!isDeepStrictEqual(got, want)) {
          diffs++
          if (!first) first = { now: ctx.now.toString(), got, want }
        }
      }
    } finally {
      vi.useRealTimers()
    }
    if (first) console.log('İLK FARK', first.now, '\nyeni:', show(first.got), '\ntaban:', show(first.want))
    expect(diffs).toBe(0)
  }, 120000)

  it('cancelOwn: tabanın iptal ettiği her kimlik yine iptal; fark yalnız yeni aralıklar (bilerek, §5.5 madde 2)', async () => {
    const ids = async (make) => {
      const rec = recorder([], 'denied', [])
      native.setWalkGuards.mockImplementation(async (g) => void rec.calls.push(['setWalkGuards', g]))
      await make(async () => ({ LN: rec.LN })).cancelOwn()
      return rec.calls
    }
    const got = await ids(createApplier)
    const want = await ids(baseApplier)
    expect(got.map((c) => c[0])).toEqual(want.map((c) => c[0]))
    const g = got[0][1].notifications.map((n) => n.id)
    const w = want[0][1].notifications.map((n) => n.id)
    expect(w.every((id) => g.includes(id))).toBe(true)
    const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
    // Nef 7900–7919 (Nef PLAN, ANA_OTURUM_ISTEMI madde 5); Dik Dur aralıklı 7868–7899 (dik-dur/PLAN.v2.md §4.3, sahip izni 2026-10-03)
    expect(g.filter((id) => !w.includes(id)).sort()).toEqual([...range(7700, 7701), ...range(7710, 7719), ...range(7800, 7899), ...range(7900, 7919)])
    expect(got[1]).toEqual(want[1])
  })

  it('dokunma: tap ve dismiss dizisi tabandakiyle aynı iletilir', async () => {
    const taps = async (make) => {
      let fire = null
      const LN = { addListener: async (_e, fn) => ((fire = fn), { remove: async () => {} }) }
      const cb = vi.fn()
      await make(async () => ({ LN })).onNotifyTap(cb)
      const extra = { kind: 'nudge', date: '2026-09-28', type: 'mola', arm: 'send' }
      for (const [actionId, id] of [['tap', 7400], ['dismiss', 7401], ['tap', '7500'], ['tap', 7301], ['dismiss', 7302]]) fire({ actionId, notification: { id, extra } })
      return cb.mock.calls
    }
    expect(await taps(createApplier)).toEqual(await taps(baseApplier))
  })
})
