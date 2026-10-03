// planAll (PLAN.v1 §3.A.4, §5.3, §5.5 madde 1–2). Sabah havası (B2 katman 1) rastgele taramada da açık; yürüyüş sorusu yok (B3).
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import { planAll, remindOptIn, newFeaturesOn, normalizeQuiet, inNight, MAX_PENDING, DAY_CAP, MIN_APART_MIN, MERGED_TEXT_KEY } from './notifyAll.js'
import { planNotifications } from './notifyPlan.js'
import { windowOf, PATH_REMIND, normalizeModuleReminders } from './moduleRemind.js'
import { toMinutes } from './reminders.js'
import { dayKey } from './habitLog.js'
import { createApplier } from './notifyApply.js'
import { nextRing } from './alarm.js'
import { mulberry32, makeContext, makeFeatureInput, makeWeatherInput, MODULES } from '../../test/notifyCtx.js'
import { NEF_ID, NEF_ID_LAST } from './nef/notify.js'

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
const isWeather = (n) => n.id >= 7700 && n.id <= 7701
// Alarma bağlı hava 30 dk kuralından ve gece sessizliğinden muaf (§A.4); alarmsız hava öteki yeni kaynaklar gibi
const isFreeWeather = (n) => isWeather(n) && !n.extra?.alarm && !n.keepPending
const isAlarmWeather = (n) => isWeather(n) && !isFreeWeather(n)
const minOf = (d) => d.getHours() * 60 + d.getMinutes()
const OWN = [[7400, 7499], [7500, 7509], [7700, 7701], [7800, 7859], [7860, 7867], [7868, 7899]] // 7868–7899 Dik Dur aralıklı (sahip izni 2026-10-03)
const pick3 = (n) => ({ id: n.id, title: n.title, body: n.body, at: n.at.getTime() })
// Saati kişi mi seçti (sahip kararı 2026-10-01): modül hatırlatmasında (birleşikte ilk modül) ya da ek saatte türün
// kaydı elle (mode 'manual'). Bunlar 30 dk'ya, pencereye ve gece kurallarına uymaz; Nef'in saatleri uyar.
const chosen = (input, n) => {
  const mr = normalizeModuleReminders(input.moduleReminders)
  if (isModule(n)) return mr[n.extra.module ?? n.extra.modules?.[0]]?.mode === 'manual'
  if (isExtra(n)) return mr[n.type]?.mode === 'manual'
  return false
}

// 20.000 rastgele AÇIK ayar: her biri bir kez hesaplanır, maddeler aynı listeden sınanır
let cases = null
function all() {
  if (cases) return cases
  const rnd = mulberry32(2)
  const wrnd = mulberry32(3)
  cases = []
  for (let i = 0; i < N; i++) {
    const ctx = makeContext(rnd)
    if (ctx.reminders) ctx.reminders.optIn = 'yes'
    const input = makeFeatureInput(rnd, ctx, wrnd)
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
    expect(c.filter(({ out }) => out.notifications.some(isFreeWeather)).length).toBeGreaterThan(N / 20)
    expect(c.filter(({ out }) => out.notifications.some(isAlarmWeather)).length).toBeGreaterThan(N / 50)
    expect(c.filter(({ out }) => out.notifications.some((n) => isWeather(n) && n.extra.shifted)).length).toBeGreaterThan(0)
  })

  it(`Nef'in yeni bildirimlerinden hiçbiri başka bir bildirime ${MIN_APART_MIN} dk'dan yakın değil (alarm, alarma bağlı hava ve kişinin elle seçtiği modül saati dışında; Nef'in modül saati ona da uzak)`, () => {
    let bad = null
    let pairs = 0
    for (const { input, out } of all()) {
      const list = out.notifications
      for (const a of list.filter((n) => (isNew(n) && !chosen(input, n)) || isFreeWeather(n))) {
        for (const b of list) {
          if (a === b || isAlarmWeather(b)) continue
          // Elle seçilmiş modül saati ek saatlerden ve havadan sonra yerini alır, onlara bakmaz; Nef'in modül saati ona uyar
          if (isModule(b) && chosen(input, b) && !isModule(a)) continue
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
  it(`${MIN_APART_MIN} dk'dan yakın her çift ya iki eski bildirimdir (74xx/75xx, aynı çift tabanda da var) ya da birinin saatini kişi elle seçti`, () => {
    let bad = null
    let byChoice = 0
    const key = (n) => `${n.id}@${n.at.getTime()}`
    for (const { input, out, base } of all()) {
      const inBase = new Set(base.notifications.map(key))
      const list = [...out.notifications].sort((a, b) => a.at - b.at)
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length && list[j].at - list[i].at < MIN_APART_MIN * 60000; j++) {
          const [a, b] = [list[i], list[j]]
          if (isAlarmWeather(a) || isAlarmWeather(b)) continue // alarma bağlı hava istisnası (§A.4)
          if (chosen(input, a) || chosen(input, b)) { byChoice++; continue } // açık seçim kazanır (sahip kararı 2026-10-01)
          if (isNew(a) || isNew(b) || isWeather(a) || isWeather(b) || !inBase.has(key(a)) || !inBase.has(key(b))) bad ??= [a, b]
        }
      }
    }
    expect(bad).toBeNull()
    expect(byChoice).toBeGreaterThan(0) // elle seçilen yakın saat gerçekten kuruluyor (düşmüyor)
  })

  // Sahip kararı 2026-10-01: elle seçilmiş hatırlatmayla ±60 sn içinde çakışan oturum molası (75xx) kurulmaz (tek bildirim)
  it('74xx ve 75xx: title, body, id, at değişmez; hepsi yerinde (kırpılmaz; yalnız elle seçilmiş hatırlatmayla aynı dakikadaki oturum molası kurulmaz); günlük tabandaki gibi', () => {
    let clashed = 0
    for (const { input, out, base } of all()) {
      const mine = out.notifications.filter((n) => (isModule(n) || isExtra(n)) && chosen(input, n)).map((n) => n.at.getTime())
      const clash = (n) => n.extra?.kind === 'focus' && mine.some((m) => Math.abs(m - n.at.getTime()) <= 60000)
      const want = base.notifications.filter((n) => !clash(n))
      clashed += base.notifications.length - want.length
      expect(out.notifications.filter((n) => !isNew(n) && !isWeather(n)).map(pick3)).toEqual(want.map(pick3))
      expect(out.log).toEqual(base.log)
      expect(out.walkGuards.slice(0, base.walkGuards.length)).toEqual(base.walkGuards)
    }
    expect(clashed).toBeGreaterThan(0) // çakışma rastgele ayarlarda gerçekten oluşuyor
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

  it('pencereler yalnız Nef\'in saatinde: modül hatırlatması kendi penceresinde, ek saat deney kuralında (09–21, su ≤ 18); elle seçilen pencere dışında da kurulur', () => {
    const remindOf = (id) => (id === 'path' ? PATH_REMIND : MODULES.find((m) => m.id === id).remind)
    let outside = 0
    for (const { input, out } of all()) {
      for (const n of out.notifications.filter((n) => (isModule(n) || isExtra(n)) && chosen(input, n))) {
        const m = minOf(n.at)
        if (m < toMinutes('08:00') || m > toMinutes('22:00')) outside++
      }
      for (const n of out.notifications.filter((n) => isModule(n) && !chosen(input, n))) {
        const mods = n.extra.modules ?? [n.extra.module]
        const m = minOf(n.at)
        // birleşik bildirim ilk modülün saatinde: en az birinin penceresinde
        expect(mods.some((id) => { const w = windowOf(remindOf(id)); return m >= w.from && m <= w.to })).toBe(true)
      }
      for (const n of out.notifications.filter((n) => isExtra(n) && !chosen(input, n))) {
        const m = minOf(n.at)
        expect(m).toBeGreaterThanOrEqual(toMinutes('09:00'))
        expect(m).toBeLessThanOrEqual(toMinutes(n.type === 'water' ? '18:00' : '21:00'))
      }
    }
    expect(outside).toBeGreaterThan(0)
  })

  it('Nef\'in yeni saatlerinden hiçbiri gece sessizliğinde ya da 01.00–05.00’te değil; alarm varsa yatmadan önceki 60 dk’da değil; elle seçilen gece de kurulur', () => {
    let atNight = 0
    for (const { input, out } of all()) {
      for (const n of out.notifications.filter(isWeather)) {
        const m = minOf(n.at)
        expect(m >= 60 && m < 300).toBe(false)
        if (isFreeWeather(n)) expect(inNight(n.at.getTime(), input.quiet)).toBe(false)
      }
      expect(out.notifications.filter(isWeather).length).toBeLessThanOrEqual(2)
      if (!input.morningWeather) expect(out.notifications.some(isWeather)).toBe(false)
      atNight += out.notifications.filter((n) => isModule(n) && chosen(input, n) && inNight(n.at.getTime(), input.quiet)).length
      for (const n of out.notifications.filter((n) => isModule(n) && !chosen(input, n))) {
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
    expect(atNight).toBeGreaterThan(0)
  })

  // Sahip kararı 2026-10-01: oturum sürerken kişinin kurduğu hatırlatmalar gelir; Nef'in seçtiği saatler gelmez
  it("oturum sürerken Nef'in modül saati ve ek saati yok; elle seçilmiş modül saati ve ek saat kurulur", () => {
    let mineIn = 0
    for (const { input, out } of all()) {
      const start = Date.parse(input.focus?.startedAt)
      if (!Number.isFinite(start) || ![1, 2, 4].includes(input.focus.hours)) continue
      const end = start + input.focus.hours * 3600000
      for (const n of out.notifications.filter(isNew)) {
        const inside = n.at >= start && n.at <= end
        if (chosen(input, n)) mineIn += inside ? 1 : 0
        else expect(inside).toBe(false)
      }
    }
    expect(mineIn).toBeGreaterThan(0)
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

  it('74xx asla birleşmez ve kaymaz; deney saatine 60 dk’dan yakın Nef saati kurulmaz, elle seçilen kurulur', () => {
    const i = base({ reminders: REM({ mola: { on: true, time: '12:30' } }), seed: 'gönder', moduleReminders: { blink: man(['12:45']) } })
    const p = planAll(i)
    expect(p.notifications.filter((n) => !isNew(n))).toEqual(planNotifications(i).notifications)
    const sentDays = new Set(p.notifications.filter((n) => n.id >= 7400 && n.id <= 7499).map((n) => dayKey(n.at)))
    expect(sentDays.size).toBeGreaterThan(0)
    // Elle seçilen 12.45 deney gününde de kurulur (açık seçim kazanır; sahip kararı 2026-10-01)
    // (modül ufku 3 gün; üçü de deney günü)
    expect(p.notifications.filter((n) => isModule(n) && sentDays.has(dayKey(n.at))).map((n) => hm(n.at))).toEqual(['12:45', '12:45', '12:45'])
    // Nef'in seçtiği 12.45 deney gününde kurulmaz
    const a = planAll({ ...i, moduleReminders: { blink: auto(['12:45']) } })
    expect(a.notifications.filter((n) => !isNew(n))).toEqual(planNotifications(i).notifications)
    expect(a.notifications.filter((n) => isModule(n) && sentDays.has(dayKey(n.at)))).toHaveLength(0)
  })

  it('elle seçilen saat başka bildirime 30 dk’dan yakınsa da kurulur; aynı modülün iki yakın elle saati birleşmez', () => {
    const reminders = REM({ mola: { on: true, time: '12:30' }, breath: { on: true, time: '09:00' } })
    const t = planAll(base({ reminders, moduleReminders: { blink: man(['12:40']), breath: man(['12:50']) } }))
    // 12.40 modül saati (mola 74xx 12.30'a 10 dk) ve 12.50 nefes ek saati (moduleReminders.breath elle): ikisi de bugün
    expect(t.notifications.filter((n) => isModule(n) && today(n)).map((n) => hm(n.at))).toEqual(['12:40'])
    expect(t.notifications.filter((n) => isExtra(n) && today(n)).map((n) => hm(n.at))).toEqual(['12:50'])
    expect(t.skipped.filter((s) => s.reason === 'gap')).toEqual([])
    const same = planAll(base({ moduleReminders: { blink: man(['10:00', '10:15']) } })).notifications.filter((n) => isModule(n) && today(n))
    expect(same.map((n) => [n.extra.module, hm(n.at)])).toEqual([['blink', '10:00'], ['blink', '10:15']])
  })

  it(`günlük tavan: ${DAY_CAP}'dan fazlası altıncıda birleşir`, () => {
    const mr = { blink: man(['09:00', '11:00', '13:00']), snake: man(['15:00', '17:00', '19:00']), yoga: man(['21:00']) }
    const t = planAll(base({ moduleReminders: mr })).notifications.filter((n) => isModule(n) && today(n))
    expect(t).toHaveLength(DAY_CAP)
    expect(t[DAY_CAP - 1].extra).toMatchObject({ kind: 'remindMerged', modules: ['snake', 'yoga'] })
  })

  it('gece: sessizlik 22.00’den başlarsa Nef’in 22.00’deki sakin hatırlatması kurulmaz, elle seçilen kurulur (01.00–05.00 de); varsayılanda ikisi de', () => {
    const mr = { yoga: auto(['22:00']) }
    expect(planAll(base({ moduleReminders: mr })).notifications.filter(isModule)).toHaveLength(3)
    expect(planAll(base({ moduleReminders: mr, quiet: { from: '22:00', to: '07:00' } })).notifications.filter(isModule)).toHaveLength(0)
    expect(planAll(base({ moduleReminders: { yoga: man(['22:00']) }, quiet: { from: '22:00', to: '07:00' } })).notifications.filter(isModule)).toHaveLength(3)
    // Elle seçilen 03.00: bugünkü geçti (07.00), yarın ve öbür gün kurulur
    expect(planAll(base({ moduleReminders: { yoga: man(['03:00']) } })).notifications.filter(isModule).map((n) => hm(n.at))).toEqual(['03:00', '03:00'])
    expect(normalizeQuiet({ from: '03:00', to: '12:00' })).toEqual({ from: 23 * 60, to: 7 * 60 })
    expect(inNight(new Date(2026, 8, 30, 2, 0).getTime(), { from: '00:00', to: '06:00' })).toBe(true) // 01–05 hiçbir ayarla açılmaz
  })

  it('alarm 05.00 → yatma 22.00: Nef’in 21.30’daki hatırlatması kurulmaz, 20.30’daki kurulur; elle seçilen 21.30 kurulur', () => {
    const alarm = { on: true, hour: 5, minute: 0, days: [], at: null }
    alarm.days = [0, 1, 2, 3, 4, 5, 6]
    const p = planAll(base({ alarm, moduleReminders: { yoga: man(['20:30']), gokyuzu: auto(['21:30']) } }))
    const t = p.notifications.filter((n) => isModule(n) && today(n))
    expect(t.map((n) => n.extra.module)).toEqual(['yoga'])
    expect(p.skipped.some((s) => s.module === 'gokyuzu' && s.reason === 'bed')).toBe(true)
    const m = planAll(base({ alarm, moduleReminders: { yoga: man(['20:30']), gokyuzu: man(['21:30']) } }))
    expect(m.notifications.filter((n) => isModule(n) && today(n)).map((n) => n.extra.module)).toEqual(['yoga', 'gokyuzu'])
    expect(m.skipped.some((s) => s.reason === 'bed')).toBe(false)
  })

  // Sahip kararı 2026-10-01: elle seçilen modül saati oturumda da kurulur; Nef'in seçtiği (auto) saat kurulmaz
  it("oturum sürerken Nef'in modül saati kurulmaz, elle seçilen kurulur", () => {
    const focus = { startedAt: new Date(2026, 8, 30, 9, 30).toISOString(), hours: 2 }
    const now = new Date(2026, 8, 30, 9, 45)
    const t = planAll(base({ now, focus, moduleReminders: { blink: man(['10:00', '16:00']) } })).notifications.filter((n) => isModule(n) && today(n))
    expect(t.map((n) => hm(n.at))).toEqual(['10:00', '16:00'])
    const a = planAll(base({ now, focus, moduleReminders: { blink: auto(['10:00', '16:00']) } }))
    expect(a.notifications.filter((n) => isModule(n) && today(n)).map((n) => hm(n.at))).toEqual(['16:00'])
    expect(a.skipped.some((s) => s.module === 'blink' && s.date === dayKey(now))).toBe(true) // oturumda ('focus' ya da molalara yakın 'gap')
  })

  it('elle seçilmiş modül saati oturum molasıyla aynı dakikada: tek bildirim, hatırlatma kalır, mola kurulmaz', () => {
    // 09.00'da 2 saatlik oturum: molalar 10.00 (7500) ve 11.00 (7501); elle seçilmiş göz kırpma 10.00
    const focus = { startedAt: new Date(2026, 8, 30, 9, 0).toISOString(), hours: 2 }
    const now = new Date(2026, 8, 30, 9, 5)
    const p = planAll(base({ now, focus, moduleReminders: { blink: man(['10:00']) } }))
    const at10 = p.notifications.filter((n) => n.at.getTime() === new Date(2026, 8, 30, 10, 0).getTime())
    expect(at10.map((n) => n.extra.kind ?? n.extra.module)).toHaveLength(1)
    expect(at10[0].extra.module).toBe('blink')
    expect(p.notifications.filter((n) => n.extra?.kind === 'focus').map((n) => n.id)).toEqual([7501])
    // Nef'in saati (auto) oturumda kurulmaz; iki mola da kalır
    const a = planAll(base({ now, focus, moduleReminders: { blink: auto(['10:00']) } }))
    expect(a.notifications.filter((n) => n.extra?.kind === 'focus').map((n) => n.id)).toEqual([7500, 7501])
    expect(a.notifications.some((n) => isModule(n) && today(n))).toBe(false)
  })

  it('elle seçilmiş ek saat oturumda kurulur ve aynı dakikadaki molayı düşürür; Nef\'in ek saati oturumda kurulmaz', () => {
    // 12.00'de 2 saatlik oturum: molalar 13.00 (7500), 14.00 (7501); nefes 10.00 (7402), ek saatler 13.00 ve 17.00
    const focus = { startedAt: new Date(2026, 8, 30, 12, 0).toISOString(), hours: 2 }
    const now = new Date(2026, 8, 30, 9, 0)
    const mk = (cfg) => planAll(base({ now, focus, reminders: REM({ breath: { on: true, time: '10:00' } }), moduleReminders: { breath: cfg } }))
    const m = mk(man(['13:00', '17:00']))
    expect(m.notifications.filter((n) => n.type === 'breath' && today(n)).map((n) => [n.id, hm(n.at)])).toEqual([[7402, '10:00'], [7864, '13:00'], [7865, '17:00']])
    expect(m.notifications.filter((n) => n.extra?.kind === 'focus').map((n) => n.id)).toEqual([7501])
    const a = mk(auto(['13:00', '17:00']))
    expect(a.notifications.filter((n) => n.type === 'breath' && today(n)).map((n) => [n.id, hm(n.at)])).toEqual([[7402, '10:00'], [7865, '17:00']])
    expect(a.skipped.some((s) => s.module === 'breath' && s.date === dayKey(now))).toBe(true) // oturumda ('focus' ya da molalara yakın 'gap')
    expect(a.notifications.filter((n) => n.extra?.kind === 'focus').map((n) => n.id)).toEqual([7500, 7501])
  })

  it('seçilmeyen günde ne 74xx ne ek saat kurulur; gönderilen günde 74xx + ek saatler', () => {
    const mk = (days) => planAll(base({ reminders: REM({ breath: { on: true, time: '10:00', ...(days ? { days } : {}) } }), moduleReminders: { breath: auto(['13:00', '17:00']) } }))
    // NOW Çarşamba (getDay 3); Çarşamba seçilmemiş
    const off = mk([0, 1, 2, 4, 5, 6])
    expect(off.notifications.filter((n) => n.type === 'breath' && today(n))).toHaveLength(0)
    expect(off.notifications.filter((n) => ((n.id >= 7400 && n.id <= 7499) || isExtra(n)) && today(n))).toHaveLength(0)
    const sent = mk()
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

// Sabah havası (lib/weatherNotify.js, 1. katman; PLAN.v1 §2 "Sabah havası", §3.B.4). Metin sahip onaylı cümlelerden
// (MORNING_TEMPLATES, sabah-havasi-onay.md) planda bağlanır; metin bağlanamayan gün plana girmez.
describe('planAll: sabah havası', () => {
  const HOUR = 3600000
  const wxCache = (fetched = new Date(2026, 8, 30, 6, 50)) => {
    const d0 = new Date(2026, 8, 30)
    const hours = Array.from({ length: 48 }, (_, h) => ({ at: d0.getTime() + h * HOUR, tempC: 18, apparentC: 17, precipChance: 0 }))
    return { at: fetched.toISOString(), data: { fetchedAt: fetched.getTime(), hours, days: [{ date: dayKey(d0), highC: 24 }, { date: dayKey(new Date(2026, 9, 1)), highC: 22 }] } }
  }
  const WX = { cache: wxCache(), place: { il: 'İzmir', ilce: 'Gaziemir' }, localRefresh: null }
  const ALARM = (hour, minute) => ({ on: true, hour, minute, days: [0, 1, 2, 3, 4, 5, 6], at: null })
  const weatherOf = (p) => p.notifications.filter((n) => n.id >= 7700 && n.id <= 7701)
  const at = (h, m) => new Date(2026, 8, 30, h, m).getTime()

  it('kapalıyken (varsayılan) plan bugünkü gibi; veri verilmemişse de', () => {
    const i = base({ weather: WX })
    expect(planAll(i)).toEqual(planNotifications(i))
    expect(planAll({ ...i, morningWeather: { on: false } })).toEqual(planNotifications(i))
    expect(planAll(base({ morningWeather: true }))).toEqual(planNotifications(base()))
  })

  it('açıkken yalnız sabah havası: 7700, extra { kind: weather, date }, günde tek; deney planı değişmez', () => {
    const i = base({ morningWeather: true, weather: WX })
    const p = planAll(i)
    const w = weatherOf(p)
    expect(w.map((n) => n.id)).toEqual([7700])
    expect(w[0].extra).toMatchObject({ kind: 'weather', date: dayKey(NOW), alarm: false })
    expect(w[0].at.getTime()).toBe(at(8, 0))
    expect(p.notifications.filter((n) => n.id < 7700)).toEqual(planNotifications(i).notifications)
    // Onaylı metin bağlı (notifyApply kurar); texts: true onu değiştirmez
    expect(w[0].title).toBe('Gaziemir 18° · en çok 24°')
    expect(w[0].body).toBe('Sabah 06.50 tahminine göre yağmur beklenmiyor; hava serin, hissedilen 17°.\nKaynak: Apple Weather')
    expect(weatherOf(planAll({ ...i, texts: true }))).toEqual(w)
  })

  it('alarma bağlı hava 30 dk kuralından ve gece sessizliğinden muaf; alarmsız hava ikisine de uyar', () => {
    // Alarma bağlı: 07.50 alarm + 10 dk = 08.00; 08.15'teki elle seçilmiş hatırlatma yine kurulur (istisna çifti)
    const a = planAll(base({ morningWeather: true, weather: WX, alarm: ALARM(7, 50), quiet: { from: '23:00', to: '10:00' }, moduleReminders: { dalga: man(['08:15']) } }))
    expect(weatherOf(a).map((n) => n.at.getTime())).toEqual([at(8, 0)])
    const a2 = planAll(base({ morningWeather: true, weather: WX, alarm: ALARM(7, 50), moduleReminders: { dalga: man(['08:15']) } }))
    expect(weatherOf(a2).map((n) => n.at.getTime())).toEqual([at(8, 0)])
    expect(a2.notifications.some((n) => n.id >= 7800 && n.id <= 7859 && n.at.getTime() === at(8, 15))).toBe(true)
    // Alarmsız 08.00: sessizlik 09.00'dan sonra (10.00'da) biterse sessizliğin bittiği dakikada (sahip kararı 4)
    const q = planAll(base({ morningWeather: true, weather: WX, quiet: { from: '23:00', to: '10:00' } }))
    expect(weatherOf(q).map((n) => n.at.getTime())).toEqual([at(10, 0)])
    expect(weatherOf(q)[0].extra.shifted).toBe(true)
    const q2 = planAll(base({ morningWeather: true, weather: WX, quiet: { from: '23:00', to: '09:40' } }))
    expect(weatherOf(q2).map((n) => n.at.getTime())).toEqual([at(9, 40)])
    // Alarmsız 08.00 önce yerini alır; 08.10'daki elle seçilmiş hatırlatma yine kurulur (açık seçim; sahip kararı 2026-10-01)
    const g = planAll(base({ morningWeather: true, weather: WX, moduleReminders: { dalga: man(['08:10']) } }))
    const gw = weatherOf(g)
    expect(gw.map((n) => n.at.getTime())).toEqual([at(8, 0)])
    expect(g.notifications.filter((n) => n.id >= 7800 && n.id <= 7859 && n.at.getTime() < at(12, 0)).map((n) => n.at.getTime())).toEqual([at(8, 10)])
    // Nef'in seçtiği 08.10 ise 30 dk kuralıyla kayar
    const ga = planAll(base({ morningWeather: true, weather: WX, moduleReminders: { dalga: auto(['08:10']) } }))
    const mods = ga.notifications.filter((n) => n.id >= 7800 && n.id <= 7859 && n.at.getTime() < at(12, 0))
    expect(mods).toHaveLength(1)
    for (const m of mods) expect(Math.abs(m.at - weatherOf(ga)[0].at)).toBeGreaterThanOrEqual(MIN_APART_MIN * 60000)
  })

  it('alarmsız hava sessizlik bitince 15 dk adımla kayar (extra.shifted); saat ve kimlik değişmez', () => {
    // VARSAYIM (sahibe soruldu): en çok 60 dk kayar. 08.00 sessizlikte (08.30'a dek) → 08.30
    const p = planAll(base({ morningWeather: true, weather: WX, quiet: { from: '23:00', to: '08:30' } }))
    const w = weatherOf(p)
    expect(w).toHaveLength(1)
    expect(w[0]).toMatchObject({ id: 7700, extra: { kind: 'weather', alarm: false, shifted: true } })
    expect(w[0].at.getTime()).toBe(at(8, 30))
    // Kaymayan hava shifted taşımaz
    expect(weatherOf(planAll(base({ morningWeather: true, weather: WX })))[0].extra.shifted).toBeUndefined()
  })

  it('sabah havası 01.00–05.00\'e düşerse kurulmaz (alarma bağlı olsa da)', () => {
    const now = new Date(2026, 8, 30, 0, 30)
    const p = planAll(base({ now, morningWeather: { on: true, delayMin: 30 }, weather: { ...WX, cache: wxCache(new Date(2026, 8, 30, 0, 20)) }, alarm: ALARM(4, 0) }))
    for (const n of weatherOf(p)) {
      const m = minOf(n.at)
      expect(m >= 60 && m < 300).toBe(false)
    }
    expect(p.skipped).toContainEqual({ module: 'weather', date: dayKey(now), time: null, reason: 'night' })
  })

  it('"yerelde yenilendi" günü 7700 keepPending ile planda kalır (metinsiz)', () => {
    const p = planAll(base({ morningWeather: true, weather: { ...WX, localRefresh: { date: dayKey(NOW), at: at(8, 20) } } }))
    const w = weatherOf(p)
    expect(w).toHaveLength(1)
    expect(w[0]).toMatchObject({ id: 7700, keepPending: true })
    expect(w[0].title).toBeUndefined()
  })
})

// Nef (lib/nef/notify.js; Nef PLAN §4.2, §4.3, §4.5): en düşük öncelik, kimlik 7900–7919, F1 zenginleştirmesi
describe('planAll: Nef', () => {
  const HOUR = 3600000
  const isNef = (n) => n.id >= NEF_ID && n.id <= NEF_ID_LAST
  const at = (h, m = 0, d = 0) => new Date(2026, 8, 30 + d, h, m)
  // sky.js önbelleği: 30 Eylül ve 1 Ekim saatlik; rain: [başlangıç, bitiş) saat, 30 Eylül 00.00'dan sayılır
  const wxCache = ({ rain = [19, 22], fetched = new Date(2026, 8, 30, 6, 50), feels = {} } = {}) => {
    const d0 = new Date(2026, 8, 30)
    const hours = Array.from({ length: 48 }, (_, h) => ({ at: new Date(2026, 8, 30 + Math.floor(h / 24), h % 24).getTime(), tempC: 18, apparentC: feels[h] ?? 17, precipChance: rain && h >= rain[0] && h < rain[1] ? 0.8 : 0.1 }))
    return { at: fetched.toISOString(), data: { fetchedAt: fetched.getTime(), hours, days: [{ date: dayKey(d0), highC: 24 }, { date: dayKey(new Date(2026, 9, 1)), highC: 22 }] } }
  }
  const WALK = (time = '19:30') => REM({ walk: { on: true, time } })
  // Deney zarı yürüyüşü bugün sessiz atmasın diye günlük elle (gönder)
  const sendLog = (d = 0) => [{ date: dayKey(at(12, 0, d)), type: 'walk', eligible: true, arm: 'send', skipReason: null, plannedAt: at(19, 30, d).toISOString() }]
  const nefIn = (o = {}) => base({ reminders: WALK(), log: sendLog(), weather: { cache: wxCache(), place: { il: 'İzmir', ilce: 'Gaziemir' }, localRefresh: null }, nef: { rows: [] }, ...o })
  const without = ({ nef: _n, ...i }) => i
  const fixed = (p) => p.notifications.filter((n) => (n.id >= 7400 && n.id <= 7599) || (n.id >= 7860 && n.id <= 7867))

  it('Nef olgusu yokken (yürüyüş saati ya da yağmur yok) plan tabanın kendisi: 0 fark', () => {
    for (const i of [nefIn({ reminders: REM() }), nefIn({ weather: { cache: wxCache({ rain: null }) } }), nefIn({ nef: null }), nefIn({ weather: null })]) {
      const p = planAll(i)
      expect(p).toEqual(planNotifications(i))
      expect(p.notifications.some(isNef)).toBe(false)
    }
    // Öteki yeni özellikler açıkken de Nef bir şey eklemezse bildirimler aynı
    const mr = { blink: man(['10:00']) }
    const p = planAll(nefIn({ reminders: REM(), moduleReminders: mr }))
    expect(p.notifications).toEqual(planAll(without(nefIn({ reminders: REM(), moduleReminders: mr }))).notifications)
  })

  it('yağmur yürüyüşe denk: tek Nef bildirimi 7900; en düşük öncelik (öteki her bildirim aynen yerinde); 74xx dokunulmaz', () => {
    const i = nefIn({ reminders: REM({ walk: { on: true, time: '19:30' }, mola: { on: true, time: '12:30' } }), moduleReminders: { blink: man(['10:00']), yoga: auto(['17:00']) } })
    const p = planAll(i)
    const q = planAll(without(i))
    const nef = p.notifications.filter(isNef)
    expect(nef).toHaveLength(1)
    expect(nef[0]).toMatchObject({ id: NEF_ID, type: 'nef', extra: { kind: 'nef', type: 'rainOnWalk', date: dayKey(NOW) } })
    expect(p.notifications.filter((n) => !isNef(n))).toEqual(q.notifications)
    expect(fixed(p)).toEqual(fixed(q))
    expect(fixed(p).length).toBeGreaterThan(0)
    // Nef'in yoga 17.00'ye 30 dk'dan yakın olmaması: 16.30
    expect(hm(nef[0].at)).toBe('16:30')
    expect(p.nef).toEqual([expect.objectContaining({ notifyId: NEF_ID, mode: 'own', channel: 'notify' })])
    expect(nef[0].body).toMatch(/Kaynak: Apple Weather$/)
    expect(nef[0].body).not.toMatch(/derece|°/)
  })

  it('gece 01.00–05.00 ve gece sessizliğinde yok; sessizlik daralınca kurulur', () => {
    // Yürüyüş 08.30, yarın yağmur 08.00–11.00 → Nef 06.00 ister. Şimdi 29 Eylül 21.00, tahmin 20.50
    const i = (quiet) => nefIn({ now: at(21, 0, -1), reminders: WALK('08:30'), log: sendLog(0), quiet, weather: { cache: wxCache({ rain: [8, 11], fetched: at(20, 50, -1) }) } })
    const open = planAll(i({ from: '23:00', to: '06:00' })).notifications.filter(isNef)
    expect(open.map((n) => n.at.getTime())).toEqual([at(6, 0).getTime()])
    const p = planAll(i(null))
    for (const n of p.notifications.filter(isNef)) expect(inNight(n.at.getTime(), null)).toBe(false)
    expect(p.notifications.some(isNef)).toBe(false) // 07.00'den sonra öne alınacak saat kalmıyor: susar
    // 01.00–05.00: yağmur 05.00'te, yürüyüş 06.00 → Nef 03.00 ister; hiçbir ayarla kurulmaz
    const h = planAll(nefIn({ now: at(21, 0, -1), reminders: WALK('06:00'), log: sendLog(0), quiet: { from: '23:00', to: '06:00' }, weather: { cache: wxCache({ rain: [5, 8], fetched: at(20, 50, -1) }) } }))
    for (const n of h.notifications.filter(isNef)) {
      const m = minOf(n.at)
      expect(m >= 60 && m < 300).toBe(false)
    }
  })

  it('alarm varsa yatmadan önceki 60 dk\'da yok; çalışma oturumunda yok', () => {
    // Alarm 03.00 → yatma 20.00, yasak 19.00'dan: yürüyüş 21.30, yağmur 21.00 → Nef 19.00 yerine 18.45
    const bed = nefIn({ reminders: WALK('21:30'), weather: { cache: wxCache({ rain: [21, 23] }) } })
    expect(planAll(bed).notifications.filter(isNef).map((n) => hm(n.at))).toEqual(['19:00'])
    const alarm = { on: true, hour: 3, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], at: null }
    expect(planAll({ ...bed, alarm }).notifications.filter(isNef).map((n) => hm(n.at))).toEqual(['18:45'])
    // Oturum 16.00–18.00: 17.00 yerine 15.45 (oturum molaları 75xx da 30 dk uzakta)
    const now = at(15, 30)
    const f = planAll(nefIn({ now, focus: { startedAt: at(16, 0).toISOString(), hours: 2 }, weather: { cache: wxCache({ fetched: at(15, 20) }) } }))
    const n = f.notifications.filter(isNef)
    expect(n.map((x) => hm(x.at))).toEqual(['15:45'])
    for (const b of f.notifications.filter((x) => x.id >= 7500 && x.id <= 7509)) expect(Math.abs(b.at - n[0].at)).toBeGreaterThanOrEqual(MIN_APART_MIN * 60000)
  })

  it('kişi bugünkü yolunu bitirdiyse Nef bildirimi yok', () => {
    expect(planAll(nefIn({ nef: { rows: [], pathDoneToday: true } }))).toEqual(planNotifications(nefIn()))
    const p = planAll(nefIn({ nef: { rows: [], pathDoneToday: true }, moduleReminders: { blink: man(['10:00']) } }))
    expect(p.notifications.some(isNef)).toBe(false)
    expect(p.skipped).toContainEqual({ module: 'nef', date: dayKey(NOW), time: null, reason: 'pathDone' })
  })

  it('bütçe: bugün Nef konuştuysa yok; son 7 günde 4 ise yok', () => {
    const row = (d, h = 18) => ({ at: at(h, 0, -d).toISOString(), date: dayKey(at(h, 0, -d)), type: 'rainOnWalk', key: `k${d}`, id: 'F1E-1', channel: 'notify' })
    expect(planAll(nefIn({ nef: { rows: [row(0, 6)] } })).notifications.some(isNef)).toBe(false)
    expect(planAll(nefIn({ nef: { rows: [1, 2, 3, 4].map((d) => row(d)) } })).notifications.some(isNef)).toBe(false)
    expect(planAll(nefIn({ nef: { rows: [1, 2, 3].map((d) => row(d)) } })).notifications.filter(isNef)).toHaveLength(1)
  })

  it('F1 zenginleştirme: sabah havasının kimliği ve saati aynı, metni F1; ayrıca Nef bildirimi yok; sıcak yalnız kartta', () => {
    const ALARM = { on: true, hour: 7, minute: 50, days: [0, 1, 2, 3, 4, 5, 6], at: null }
    const i = nefIn({ morningWeather: true, alarm: ALARM, weather: { cache: wxCache({ feels: { 18: 31, 19: 31 } }), place: { il: 'İzmir', ilce: 'Gaziemir' }, localRefresh: null } })
    const p = planAll(i)
    const q = planAll(without(i))
    const wp = p.notifications.find((n) => n.id === 7700)
    const wq = q.notifications.find((n) => n.id === 7700)
    expect(wq).toBeDefined()
    expect(wp.at).toEqual(wq.at)
    expect(wp.type).toBe(wq.type)
    expect(wp.extra).toMatchObject(wq.extra)
    expect(wp.title).not.toBe(wq.title)
    expect(wp.body).not.toBe(wq.body)
    expect(wp.body).toMatch(/\nKaynak: Apple Weather$/)
    expect(wp.body).not.toMatch(/derece|issedilen|°/)
    expect(p.notifications.some(isNef)).toBe(false)
    expect(p.notifications.map((n) => [n.id, n.at.getTime()])).toEqual(q.notifications.map((n) => [n.id, n.at.getTime()]))
    expect(fixed(p)).toEqual(fixed(q))
    expect(p.nef).toEqual([expect.objectContaining({ notifyId: 7700, mode: 'enrich' })])
  })

  it('74xx deney bildirimleri ve 7860–7867 ek saatleri asla zenginleşmez (metin, kimlik, saat aynı)', () => {
    const i = nefIn({ moduleReminders: { walk: man(['16:00']) } })
    // Ek saatin zarı: bugün 'send'
    const p = planAll({ ...i, log: sendLog() })
    const q = planAll(without({ ...i, log: sendLog() }))
    expect(fixed(p)).toEqual(fixed(q))
    for (const n of p.notifications.filter((x) => x.id >= 7400 && x.id <= 7499)) expect(n.extra?.nef).toBeUndefined()
    for (const n of p.notifications.filter((x) => x.id >= 7860 && x.id <= 7867)) expect(n.extra?.nef).toBeUndefined()
  })
})

// Rastgele: Nef açık (rastgele hafıza, yol, sabah havası açık/kapalı). Kurallar ve en düşük öncelik.
describe('planAll: Nef rastgele', { timeout: 120000 }, () => {
  const HOUR_MS = 3600000
  const M = 6000
  const isNef = (n) => n.id >= NEF_ID && n.id <= NEF_ID_LAST
  const enrichedOk = (n) => (n.id >= 7700 && n.id <= 7701) || (n.id >= 7800 && n.id <= 7859 && (n.module ?? n.extra?.module) === 'walk')
  let runs = null
  const sweep = () => {
    if (runs) return runs
    const rnd = mulberry32(7)
    const wrnd = mulberry32(8)
    runs = []
    for (let i = 0; i < M; i++) {
      const ctx = makeContext(rnd)
      if (ctx.reminders) {
        ctx.reminders.optIn = 'yes'
        if (wrnd() < 0.8) ctx.reminders.types.walk = { on: true, time: `${String(7 + Math.floor(wrnd() * 15)).padStart(2, '0')}:${['00', '15', '30', '45'][Math.floor(wrnd() * 4)]}` }
      }
      const input = wrnd() < 0.5 ? makeFeatureInput(rnd, ctx) : { ...ctx }
      const wx = makeWeatherInput(wrnd, ctx.now)
      input.weather = wx.weather
      // yağmur sık olsun: yürüyüş saatinin çevresinde
      const walkM = toMinutes(ctx.reminders?.types?.walk?.time ?? '') ?? 0
      if (wrnd() < 0.7) {
        const d0 = new Date(ctx.now.getFullYear(), ctx.now.getMonth(), ctx.now.getDate() + (wrnd() < 0.3 ? 1 : 0)).getTime()
        const from = Math.max(0, Math.floor(walkM / 60) - Math.floor(wrnd() * 3))
        for (const h of input.weather.cache.data.hours) {
          const rel = Math.round((h.at - d0) / 3600000)
          h.precipChance = rel >= from && rel < from + 1 + Math.floor(wrnd() * 4) ? 0.8 : 0.1
        }
      }
      if (wrnd() < 0.5) input.morningWeather = wx.morningWeather
      const rows = []
      for (let k = 0, n = Math.floor(wrnd() * 6); k < n; k++) {
        const d = new Date(ctx.now.getTime() - Math.floor(wrnd() * 8 * 24) * 3600000)
        rows.push({ at: d.toISOString(), date: dayKey(d), type: 'rainOnWalk', key: `r${k}`, id: 'F1E-1', channel: wrnd() < 0.8 ? 'notify' : 'card' })
      }
      const nef = { rows, pathDoneToday: wrnd() < 0.1 }
      input.texts = wrnd() < 0.5
      runs.push({ input, nef, out: planAll({ ...input, nef }), off: planAll(input) })
    }
    return runs
  }

  it('Nef gerçekten konuşuyor (kendi bildirimi ve zenginleştirme ikisi de)', () => {
    const r = sweep()
    expect(r.filter(({ out }) => out.notifications.some(isNef)).length).toBeGreaterThan(M / 100)
    expect(r.filter(({ out }) => (out.nef ?? []).some((s) => s.mode === 'enrich')).length).toBeGreaterThan(M / 200)
  })

  it('en düşük öncelik: Nef dışındaki her bildirimin kimliği, saati ve türü aynı; metni yalnız 7700–7701 ve yürüyüş modülünün 78xx\'inde değişir; 74xx, 75xx, 7860–7867 derin eşit', () => {
    for (const { out, off } of sweep()) {
      const rest = out.notifications.filter((n) => !isNef(n))
      expect(rest.map((n) => [n.id, n.at.getTime(), n.type])).toEqual(off.notifications.map((n) => [n.id, n.at.getTime(), n.type]))
      rest.forEach((n, k) => {
        const o = off.notifications[k]
        if (n === o || (n.title === o.title && n.body === o.body)) return
        expect(enrichedOk(n)).toBe(true)
        expect(n.extra.nef?.type).toBe('rainOnWalk')
      })
      const fx = (p) => p.notifications.filter((n) => (n.id >= 7400 && n.id <= 7599) || (n.id >= 7860 && n.id <= 7867))
      expect(fx(out)).toEqual(fx(off))
      if (!(out.nef ?? []).length) expect(out.notifications).toEqual(off.notifications)
    }
  })

  it('Nef\'in kendi bildirimi: 7900–7919, gece ve sessizlikte değil, oturumda değil, yatma öncesinde değil, öteki bildirimlere ≥ 30 dk, 74xx\'e ≥ 60 dk; bekleyen ≤ 58', () => {
    let seen = 0
    for (const { input, out } of sweep()) {
      const own = out.notifications.filter(isNef)
      const pending = out.notifications.filter((n) => OWN.some(([a, b]) => n.id >= a && n.id <= b) || isNef(n)).filter((n) => n.at.getTime() > input.now.getTime())
      expect(pending.length).toBeLessThanOrEqual(MAX_PENDING)
      for (const n of own) {
        seen++
        const t = n.at.getTime()
        expect(n.id).toBeLessThanOrEqual(NEF_ID_LAST)
        expect(inNight(t, input.quiet)).toBe(false)
        const fs = Date.parse(input.focus?.startedAt)
        if (Number.isFinite(fs) && [1, 2, 4].includes(input.focus.hours)) expect(t >= fs && t <= fs + input.focus.hours * HOUR_MS).toBe(false)
        if (input.alarm?.on) {
          for (let d = -1; d <= 2; d++) {
            const noon = new Date(n.at.getFullYear(), n.at.getMonth(), n.at.getDate() + d, 12)
            const ring = nextRingOf(input.alarm, noon)
            if (ring != null) expect(t >= ring - 8 * HOUR_MS && t < ring).toBe(false)
          }
        }
        for (const o of out.notifications) {
          if (o === n) continue
          expect(Math.abs(o.at.getTime() - t)).toBeGreaterThanOrEqual(MIN_APART_MIN * 60000)
          if (o.id >= 7400 && o.id <= 7499) expect(Math.abs(o.at.getTime() - t)).toBeGreaterThanOrEqual(60 * 60000)
        }
        expect(n.body).not.toMatch(/derece|°/)
      }
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('bütçe: Nef metni (kendi bildirimi + zenginleştirme) günde en çok 1, hafızayla birlikte son 7 günde en çok 4; yol bittiyse bugün yok', () => {
    for (const { input, nef, out } of sweep()) {
      const said = out.nef ?? []
      const byDay = new Map()
      for (const s of said) byDay.set(s.date, (byDay.get(s.date) ?? 0) + 1)
      for (const [date, c] of byDay) {
        expect(c).toBeLessThanOrEqual(1)
        const past = nef.rows.filter((r) => r.channel === 'notify' && Date.parse(r.at) <= input.now.getTime())
        const end = new Date(`${date}T12:00:00`)
        const from = dayKey(new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6, 12))
        const week = [...past, ...said].filter((r) => r.date >= from && r.date <= date)
        expect(week.length).toBeLessThanOrEqual(4)
        expect(past.filter((r) => r.date === date).length + c).toBeLessThanOrEqual(1)
      }
      if (nef.pathDoneToday) expect(said.some((s) => s.date === dayKey(input.now))).toBe(false)
      // Her söz bir bildirime bağlı; kimlik ve saat planda aynen
      for (const s of said) expect(out.notifications.some((n) => n.id === s.notifyId && n.at.toISOString() === s.at)).toBe(true)
    }
  })
})
