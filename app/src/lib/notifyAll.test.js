// planAll (PLAN.v1 §3.A.4, §5.3, §5.5 madde 1–2). Sabah havası ve yürüyüş sorusu bu turda yok (B2/B3).
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import { planAll, remindOptIn, newFeaturesOn, normalizeQuiet, inNight, MAX_PENDING, DAY_CAP, MIN_APART_MIN, MERGED_TEXT_KEY } from './notifyAll.js'
import { planNotifications, dice, SILENT_RATE } from './notifyPlan.js'
import { windowOf, PATH_REMIND } from './moduleRemind.js'
import { toMinutes } from './reminders.js'
import { dayKey } from './habitLog.js'
import { createApplier } from './notifyApply.js'
import { nextRing } from './alarm.js'
import { mulberry32, makeContext, makeFeatureInput, MODULES } from '../../test/notifyCtx.js'

const N = 20000
// Saat dilimi dosya yüklenirken (NOW gibi sabitler Berlin saatiyle kurulsun); sonda geri alınır
const tz = process.env.TZ
process.env.TZ = 'Europe/Berlin'
beforeAll(() => {
  all()
}, 120000)
afterAll(() => {
  if (tz === undefined) delete process.env.TZ
  else process.env.TZ = tz
})

const isNew = (n) => n.id >= 7800 && n.id <= 7867
const isModule = (n) => n.id >= 7800 && n.id <= 7859
const isExtra = (n) => n.id >= 7860 && n.id <= 7867
const minOf = (d) => d.getHours() * 60 + d.getMinutes()
const OWN = [[7400, 7499], [7500, 7509], [7700, 7701], [7800, 7859], [7860, 7867]]
const pick3 = (n) => ({ id: n.id, title: n.title, body: n.body, at: n.at.getTime() })

// 20.000 rastgele AÇIK ayar: her biri bir kez hesaplanır, maddeler aynı listeden sınanır
let cases = null
function all() {
  if (cases) return cases
  const rnd = mulberry32(2)
  cases = []
  for (let i = 0; i < N; i++) {
    const ctx = makeContext(rnd)
    if (ctx.reminders) ctx.reminders.optIn = 'yes'
    const input = makeFeatureInput(rnd, ctx)
    cases.push({ input, out: planAll(input), base: planNotifications(ctx) })
  }
  return cases
}

describe('planAll: 20.000 rastgele açık ayar', { timeout: 60000 }, () => {
  it('yeni bildirimler gerçekten kuruluyor (sınama boş değil)', () => {
    const c = all()
    expect(c.filter(({ out }) => out.notifications.some(isModule)).length).toBeGreaterThan(N / 4)
    expect(c.filter(({ out }) => out.notifications.some(isExtra)).length).toBeGreaterThan(N / 20)
    expect(c.filter(({ out }) => out.notifications.some((n) => n.extra?.kind === 'remindMerged')).length).toBeGreaterThan(0)
  })

  it(`yeni bildirimlerden hiçbiri başka bir bildirime ${MIN_APART_MIN} dk'dan yakın değil (alarm listede yok)`, () => {
    let bad = null
    let pairs = 0
    for (const { out } of all()) {
      const list = out.notifications
      for (const a of list.filter(isNew)) {
        for (const b of list) {
          if (a === b) continue
          pairs++
          if (!bad && Math.abs(a.at - b.at) < MIN_APART_MIN * 60000) bad = [a, b]
        }
      }
    }
    expect(bad).toBeNull()
    expect(pairs).toBeGreaterThan(N)
  })

  // §5.3 "hiçbir iki bildirim 30 dk'dan yakın değil" maddesinin yorumu (VARSAYIM, inceleme): planlayıcı 74xx ve 75xx'e
  // dokunamaz (§A.4 (1), eşdeğerlik §5.4); o yüzden 30 dk güvencesi en az birinin yeni kaynak olduğu çiftler içindir
  // (üstteki sınama). İki eski bildirim arasındaki yakınlık bugünkü planNotifications'ın kuralıdır (gece ve yakınlık
  // düzeltmesi ana oturumda); burada yalnız planAll'ın ona yeni bir yakın çift eklemediği sınanır.
  it(`${MIN_APART_MIN} dk'dan yakın her çift iki eski bildirimdir (74xx/75xx) ve aynı çift tabanda da vardır`, () => {
    let bad = null
    const key = (n) => `${n.id}@${n.at.getTime()}`
    for (const { out, base } of all()) {
      const inBase = new Set(base.notifications.map(key))
      const list = [...out.notifications].sort((a, b) => a.at - b.at)
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length && list[j].at - list[i].at < MIN_APART_MIN * 60000; j++) {
          const [a, b] = [list[i], list[j]]
          if (isNew(a) || isNew(b) || !inBase.has(key(a)) || !inBase.has(key(b))) bad ??= [a, b]
        }
      }
    }
    expect(bad).toBeNull()
  })

  it('74xx ve 75xx: title, body, id, at değişmez; hepsi yerinde (kırpılmaz); günlük tabandaki gibi', () => {
    for (const { out, base } of all()) {
      expect(out.notifications.filter((n) => !isNew(n)).map(pick3)).toEqual(base.notifications.map(pick3))
      expect(out.log).toEqual(base.log)
      expect(out.walkGuards.slice(0, base.walkGuards.length)).toEqual(base.walkGuards)
    }
  })

  it(`JS'in bekleyeni ≤ ${MAX_PENDING}; kimlikler yalnız kendi aralıklarımızda (7600–7607'ye dokunmaz), tekrarsız`, () => {
    for (const { out } of all()) {
      expect(out.notifications.length).toBeLessThanOrEqual(MAX_PENDING)
      const ids = out.notifications.map((n) => n.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const id of ids) {
        expect(OWN.some(([a, b]) => id >= a && id <= b)).toBe(true)
        expect(id >= 7600 && id <= 7607).toBe(false)
      }
    }
  })

  it('pencereler: modül hatırlatması kendi penceresinde; ek saat deney kuralında (09–21, su ≤ 18)', () => {
    const remindOf = (id) => (id === 'path' ? PATH_REMIND : MODULES.find((m) => m.id === id).remind)
    for (const { out } of all()) {
      for (const n of out.notifications.filter(isModule)) {
        const mods = n.extra.modules ?? [n.extra.module]
        const m = minOf(n.at)
        // birleşik bildirim ilk modülün saatinde: en az birinin penceresinde
        expect(mods.some((id) => { const w = windowOf(remindOf(id)); return m >= w.from && m <= w.to })).toBe(true)
      }
      for (const n of out.notifications.filter(isExtra)) {
        const m = minOf(n.at)
        expect(m).toBeGreaterThanOrEqual(toMinutes('09:00'))
        expect(m).toBeLessThanOrEqual(toMinutes(n.type === 'water' ? '18:00' : '21:00'))
      }
    }
  })

  it('yeni kaynaklardan hiçbiri gece sessizliğinde ya da 01.00–05.00’te değil; alarm varsa yatmadan önceki 60 dk’da değil', () => {
    for (const { input, out } of all()) {
      for (const n of out.notifications.filter(isModule)) {
        expect(inNight(n.at.getTime(), input.quiet)).toBe(false)
        if (input.alarm) {
          const noon = new Date(n.at.getFullYear(), n.at.getMonth(), n.at.getDate(), 12)
          for (const off of [-1, 0]) {
            const from = new Date(noon.getFullYear(), noon.getMonth(), noon.getDate() + off, 12)
            const ring = nextRingOf(input.alarm, from)
            if (ring) expect(n.at >= ring - 8 * 3600000 && n.at < ring).toBe(false)
          }
        }
      }
    }
  })

  it('oturum sürerken modül hatırlatması ve ek saat yok', () => {
    for (const { input, out } of all()) {
      const start = Date.parse(input.focus?.startedAt)
      if (!Number.isFinite(start) || ![1, 2, 4].includes(input.focus.hours)) continue
      const end = start + input.focus.hours * 3600000
      for (const n of out.notifications.filter(isNew)) expect(n.at >= start && n.at <= end).toBe(false)
    }
  })

  it(`günde en çok ${DAY_CAP} modül bildirimi`, () => {
    for (const { out } of all()) {
      const per = new Map()
      for (const n of out.notifications.filter(isModule)) per.set(dayKey(n.at), (per.get(dayKey(n.at)) ?? 0) + 1)
      for (const v of per.values()) expect(v).toBeLessThanOrEqual(DAY_CAP)
    }
  })

  it('sessiz günde (zar) o türün ek saatlerinin hiçbiri kurulmaz; ek saat yalnız günü gönderilen türde', () => {
    for (const { out } of all()) {
      for (const n of out.notifications.filter(isExtra)) {
        expect(out.log.find((e) => e.date === n.extra.date && e.type === n.type)?.arm).toBe('send')
      }
    }
  })

  it('tek threadIdentifier: uygulayıcı her bildirimi nefona grubunda kurar', async () => {
    vi.useFakeTimers()
    try {
      const { input, out } = all().find(({ out }) => out.notifications.some(isExtra))
      vi.setSystemTime(input.now)
      const sent = []
      const LN = {
        checkPermissions: async () => ({ display: 'granted' }),
        getPending: async () => ({ notifications: [] }),
        cancel: async () => {},
        schedule: async ({ notifications }) => void sent.push(...notifications),
      }
      // metni B1a'da bağlanacak bildirimlere sınama için geçici metin
      const withText = { ...out, notifications: out.notifications.map((n) => ({ ...n, title: n.title ?? 't', body: n.body ?? 'b' })) }
      const p = createApplier(async () => ({ LN })).applyPlan(withText)
      await vi.advanceTimersByTimeAsync(400)
      await p
      expect(sent.length).toBeGreaterThan(0)
      expect([...new Set(sent.map((n) => n.threadIdentifier))]).toEqual(['nefona'])
      // Bu turdaki biçim (yeni bildirimler yalnız textKey): hiçbiri kurulmaz, bu yüzden gruplama da yok; eski
      // bildirimler bugünkü biçimde kurulur, açılışta Bildirim Merkezi'ne dokunulmaz (inceleme bulgusu 3)
      sent.length = 0
      LN.getDeliveredNotifications = vi.fn(async () => ({ notifications: [{ id: 7805 }] }))
      LN.removeDeliveredNotifications = vi.fn(async () => {})
      const q = createApplier(async () => ({ LN })).applyPlan(out, { tidy: true })
      await vi.advanceTimersByTimeAsync(400)
      await q
      expect(sent.some(isNew)).toBe(false)
      sent.forEach((n) => expect(n).not.toHaveProperty('threadIdentifier'))
      expect(LN.getDeliveredNotifications).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })
})

const nextRingOf = (alarm, t) => nextRing(alarm, t)?.getTime() ?? null

// Elle kurulan örnekler
const NOW = new Date(2026, 8, 30, 7, 0) // Çarşamba 07.00
const REM = (types = {}) => ({ optIn: 'yes', types: { mola: { on: false, time: '12:30' }, walk: { on: false, time: '15:00' }, breath: { on: false, time: '16:30' }, water: { on: false, time: '11:00' }, ...types } })
const man = (times) => ({ on: true, mode: 'manual', times, autoAt: null, setAt: null })
const auto = (times) => ({ on: true, mode: 'auto', times, autoAt: null, setAt: null })
const base = (o = {}) => ({ now: NOW, reminders: REM(), study: null, habits: [], sessions: [], health: null, focus: null, seed: 'x', log: null, modules: MODULES, ...o })
const today = (n) => dayKey(n.at) === dayKey(NOW)
const hm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

describe('planAll: kurallar', () => {
  it('kapalıyken planNotifications çıktısının kendisi; açıkken grouped', () => {
    const i = base({ reminders: REM({ mola: { on: true, time: '12:30' } }) })
    expect(planAll(i)).toEqual(planNotifications(i))
    expect(newFeaturesOn(i)).toBe(false)
    expect(planAll({ ...i, moduleReminders: { blink: man(['10:00']) } }).grouped).toBe(true)
  })

  it('elle seçilmiş iki modül hatırlatması aynı 30 dk’da: tek bildirim, Ana sayfa, ilk modülün kanıtı', () => {
    const p = planAll(base({ moduleReminders: { blink: man(['10:00']), yoga: man(['10:20']) } }))
    const t = p.notifications.filter((n) => isModule(n) && today(n))
    expect(t).toHaveLength(1)
    expect(t[0]).toMatchObject({ textKey: MERGED_TEXT_KEY, extra: { kind: 'remindMerged', modules: ['blink', 'yoga'], route: 'home', evidence: 's1' } })
    expect(hm(t[0].at)).toBe('10:00')
  })

  it('"Sen karar ver" saati çakışınca boş dilime kayar; elle seçilen yerinde kalır', () => {
    const p = planAll(base({ moduleReminders: { blink: man(['10:00']), snake: auto(['10:15']) } }))
    const t = p.notifications.filter((n) => isModule(n) && today(n))
    expect(t.map((n) => [n.extra.module, hm(n.at)])).toEqual([['blink', '10:00'], ['snake', '10:30']])
    expect(t[1].extra.shifted).toBe(true)
  })

  it('74xx asla birleşmez ve kaymaz: deney saatine 60 dk’dan yakın modül hatırlatması kurulmaz', () => {
    const i = base({ reminders: REM({ mola: { on: true, time: '12:30' } }), seed: 'gönder', moduleReminders: { blink: man(['12:45']) } })
    const p = planAll(i)
    expect(p.notifications.filter((n) => !isNew(n))).toEqual(planNotifications(i).notifications)
    // gönderilen deney gününde 12.45 kurulmaz; sessiz günde (74xx yok) kurulabilir
    const sentDays = new Set(p.notifications.filter((n) => n.id >= 7400 && n.id <= 7499).map((n) => dayKey(n.at)))
    expect(sentDays.size).toBeGreaterThan(0)
    expect(p.notifications.filter((n) => isModule(n) && sentDays.has(dayKey(n.at)))).toHaveLength(0)
  })

  it(`günlük tavan: ${DAY_CAP}'dan fazlası altıncıda birleşir`, () => {
    const mr = { blink: man(['09:00', '11:00', '13:00']), snake: man(['15:00', '17:00', '19:00']), yoga: man(['21:00']) }
    const t = planAll(base({ moduleReminders: mr })).notifications.filter((n) => isModule(n) && today(n))
    expect(t).toHaveLength(DAY_CAP)
    expect(t[DAY_CAP - 1].extra).toMatchObject({ kind: 'remindMerged', modules: ['snake', 'yoga'] })
  })

  it('gece: sessizlik 22.00’den başlarsa 22.00’deki sakin hatırlatma kurulmaz; varsayılanda kurulur', () => {
    const mr = { yoga: man(['22:00']) }
    expect(planAll(base({ moduleReminders: mr })).notifications.filter(isModule)).toHaveLength(3)
    expect(planAll(base({ moduleReminders: mr, quiet: { from: '22:00', to: '07:00' } })).notifications.filter(isModule)).toHaveLength(0)
    expect(normalizeQuiet({ from: '03:00', to: '12:00' })).toEqual({ from: 23 * 60, to: 7 * 60 })
    expect(inNight(new Date(2026, 8, 30, 2, 0).getTime(), { from: '00:00', to: '06:00' })).toBe(true) // 01–05 hiçbir ayarla açılmaz
  })

  it('alarm 05.00 → yatma 22.00: 21.30’daki hatırlatma kurulmaz, 20.30’daki kurulur', () => {
    const alarm = { on: true, hour: 5, minute: 0, days: [], at: null }
    alarm.days = [0, 1, 2, 3, 4, 5, 6]
    const p = planAll(base({ alarm, moduleReminders: { yoga: man(['20:30']), gokyuzu: man(['21:30']) } }))
    const t = p.notifications.filter((n) => isModule(n) && today(n))
    expect(t.map((n) => n.extra.module)).toEqual(['yoga'])
    expect(p.skipped.some((s) => s.module === 'gokyuzu' && s.reason === 'bed')).toBe(true)
  })

  it('oturum sürerken modül hatırlatması yok', () => {
    const focus = { startedAt: new Date(2026, 8, 30, 9, 30).toISOString(), hours: 2 }
    const now = new Date(2026, 8, 30, 9, 45)
    const t = planAll(base({ now, focus, moduleReminders: { blink: man(['10:00', '16:00']) } })).notifications.filter((n) => isModule(n) && today(n))
    expect(t.map((n) => hm(n.at))).toEqual(['16:00'])
  })

  it('sessiz günde 3 saatin hiçbiri kurulmaz; gönderilen günde 74xx + ek saatler', () => {
    const find = (want) => {
      for (let i = 0; ; i++) {
        const s = `t${i}`
        if ((dice(s, dayKey(NOW), 'breath') < SILENT_RATE) === want) return s
      }
    }
    const mk = (seed) => planAll(base({ seed, reminders: REM({ breath: { on: true, time: '10:00' } }), moduleReminders: { breath: auto(['13:00', '17:00']) } }))
    const silent = mk(find(true)).notifications.filter((n) => n.type === 'breath' && today(n))
    expect(silent).toHaveLength(0)
    const sent = mk(find(false))
    expect(sent.notifications.filter((n) => n.type === 'breath' && today(n)).map((n) => [n.id, hm(n.at)])).toEqual([[7402, '10:00'], [7864, '13:00'], [7865, '17:00']])
    expect(sent.slots).toEqual([{ date: dayKey(NOW), type: 'breath', times: ['13:00', '17:00'] }])
  })

  it('optIn null iken nefeste "Bana hatırlat" → nefes kurulur, mola kurulmaz', () => {
    const r0 = { optIn: null } // varsayılan: mola açık, optIn null
    expect(planAll(base({ reminders: r0, moduleReminders: { breath: auto([]) } })).notifications).toHaveLength(0)
    const r = remindOptIn(r0, 'breath')
    expect(r.optIn).toBe('yes')
    expect(r.types.mola.on).toBe(false)
    expect(r.types.breath.on).toBe(true)
    const p = planAll(base({ reminders: r, seed: 'gönder', moduleReminders: { breath: auto([]) } }))
    const types = new Set(p.notifications.map((n) => n.type))
    expect(types.has('mola')).toBe(false)
    expect(p.log.filter((e) => e.type === 'breath')).toHaveLength(7)
    // kişi daha önce "Evet" dediyse molası olduğu gibi kalır
    expect(remindOptIn({ optIn: 'yes' }, 'breath').types.mola.on).toBe(true)
  })

  it(`bekleyen bütçesi: ${MAX_PENDING}'i aşarsa modül ufku daralır, deney planı kırpılmaz`, () => {
    const full = REM({ mola: { on: true, time: '09:00' }, walk: { on: true, time: '11:00' }, breath: { on: true, time: '15:00' }, water: { on: true, time: '17:00' } })
    full.types.study = { on: true }
    const study = { days: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'], time: '19:00' }
    const mr = { blink: man(['10:00', '12:00', '14:00']), yoga: man(['16:00', '18:00', '20:30']), mola: man(['13:00', '20:00']) }
    const i = base({ reminders: full, study, health: { avgSteps: 6000, todaySteps: 0, readAt: NOW.toISOString() }, seed: 's', moduleReminders: mr })
    const p = planAll(i)
    expect(p.notifications.length).toBeLessThanOrEqual(MAX_PENDING)
    expect(p.notifications.filter((n) => !isNew(n))).toEqual(planNotifications(i).notifications)
    expect(p.horizon).toBeGreaterThanOrEqual(1)
  })
})
