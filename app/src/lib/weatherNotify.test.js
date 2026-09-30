// Sabah havası 1. katman (PLAN.v1 §3.B.4, §5.3 weatherNotify.test.js, §5.5 madde 2 ve 7). Şablon metinleri burada
// yalnız sınama içindir (anlamsız işaretler); kullanıcı cümlesi değildir.
import { describe, it, expect, vi } from 'vitest'

const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import {
  planMorningWeather, composeMorning, templateProblems, normalizeMorning, hourTable, cellOf, takeLocalRefresh,
  WEATHER_IDS, CELLS, LOCAL_REFRESH_ENABLED,
} from './weatherNotify.js'
import { createApplier } from './notifyApply.js'
import { dayKey } from './habitLog.js'

const H = 3600000
const NOW = new Date(2026, 9, 5, 6, 0) // Pazartesi 06.00
const at = (d, h, m = 0) => new Date(2026, 9, 5 + d, h, m).getTime()
const key = (d) => dayKey(new Date(2026, 9, 5 + d))

// Tahmin: bugün ve yarın için saat satırları; rainHours: [gün, saat] yağmurlu saatler
function cache({ fetchedAt = at(0, 5, 40), rainHours = [], high = [26, 14] } = {}) {
  const hours = []
  for (let d = 0; d <= 1; d++) for (let h = 0; h < 24; h++) {
    const t = at(d, h)
    hours.push({ at: t, tempC: 17.4, precipChance: rainHours.some(([a, b]) => a === d && b === h) ? 0.7 : 0.1 })
  }
  return { at: new Date(fetchedAt).toISOString(), data: { fetchedAt, hours, days: [{ date: key(0), highC: high[0], lowC: 12 }, { date: key(1), highC: high[1], lowC: 9 }] } }
}
const ON = { on: true, delayMin: 10, time: '08:00', noAlarm: 'send' }
const ALARM = { on: true, hour: 7, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], at: null }
const PLACE = { il: 'İzmir', ilce: 'Gaziemir' }
const plan = (o = {}) => planMorningWeather({ now: NOW, morning: ON, cache: cache(), place: PLACE, ...o })

// Sınama şablonları: her hücrede bir yürüyüşlü (walk) bir yürüyüşsüz; yağmur hücresi yağmurla başlar
const TPL = [
  ...CELLS.flatMap((c) => c.startsWith('rain.')
    ? [{ id: `${c}-w`, cell: c, walk: true, text: '{age} R {rainFrom:LOC} {rainTo:DAT}. W' }, { id: `${c}-n`, cell: c, text: '{age} R {rainFrom:ABL}. N' }]
    : [{ id: `${c}-w`, cell: c, walk: true, text: '{age} D {high}. W' }, { id: `${c}-n`, cell: c, text: '{age} D {high}. N' }]),
  { id: 't', cell: 'title', text: '{place} {temp}° · {high}°' },
  { id: 'ts', cell: 'title.short', text: '{temp}° · {high}°' },
  { id: 'ay', cell: 'age.yesterday', text: 'Y {ageAt}' },
  { id: 'at', cell: 'age.today', text: 'T {ageAt}' },
  { id: 's', cell: 'source', text: 'S' },
]

describe('ayar', () => {
  it('varsayılan kapalı; kapalıyken hiçbir şey yok', () => {
    expect(normalizeMorning(undefined).on).toBe(false)
    expect(planMorningWeather({ now: NOW, morning: null, cache: cache() }).notifications).toEqual([])
    expect(normalizeMorning({ on: true, delayMin: 17, time: 'x' })).toEqual(ON)
  })
})

describe('günde tek', () => {
  it('bugün 7700, yarın 7701; her gün en çok bir hava bildirimi, extra { kind, date }', () => {
    const { notifications: ns } = plan({ alarm: ALARM, cache: cache({ fetchedAt: at(0, 5, 50) }) })
    expect(ns.map((n) => n.id)).toEqual([7700])
    const late = planMorningWeather({ now: new Date(at(0, 21)), morning: ON, alarm: ALARM, cache: cache({ fetchedAt: at(0, 20, 50) }), place: PLACE })
    expect(late.notifications.map((n) => n.id)).toEqual([7701])
    for (const r of [plan(), late]) {
      const dates = r.notifications.map((n) => n.extra.date)
      expect(new Set(dates).size).toBe(dates.length)
      for (const n of r.notifications) expect(n.extra.kind).toBe('weather')
    }
    expect(WEATHER_IDS).toEqual([7700, 7701])
  })

  it('alarma bağlıysa alarmdan delayMin sonra; alarmsız günde en erken 08.00; "gönderme" seçiliyse yok', () => {
    const a = plan({ alarm: ALARM, morning: { ...ON, delayMin: 20 } }).notifications[0]
    expect(a.at.getTime()).toBe(at(0, 7, 20))
    expect(a.extra.alarm).toBe(true)
    const b = plan({ morning: { ...ON, time: '07:00' } }).notifications[0]
    expect(b.at.getTime()).toBe(at(0, 8))
    expect(b.extra.alarm).toBe(false)
    expect(plan({ morning: { ...ON, time: '09:15' } }).notifications[0].at.getTime()).toBe(at(0, 9, 15))
    const skip = plan({ morning: { ...ON, noAlarm: 'skip' } })
    expect(skip.notifications).toEqual([])
    expect(skip.skipped.map((s) => s.reason)).toContain('noAlarm')
  })

  it('01.00–05.00\'e düşerse kurulmaz (alarma bağlı olsa da)', () => {
    const r = planMorningWeather({ now: new Date(at(0, 0, 10)), morning: ON, alarm: { ...ALARM, hour: 4, minute: 40 }, cache: cache({ fetchedAt: at(0, 0) }), place: PLACE })
    expect(r.notifications.filter((n) => n.extra.date === key(0))).toEqual([])
    expect(r.skipped).toContainEqual({ date: key(0), reason: 'night' })
    const ok = planMorningWeather({ now: new Date(at(0, 0, 10)), morning: ON, alarm: { ...ALARM, hour: 4, minute: 50 }, cache: cache({ fetchedAt: at(0, 0) }), place: PLACE })
    expect(ok.notifications[0].at.getTime()).toBe(at(0, 5))
  })

  it('bildirim anında tahmin 18 saatten eskiyse kurulmaz; verisiz kurulmaz', () => {
    const old = plan({ cache: cache({ fetchedAt: at(-1, 13, 59) }) })
    expect(old.notifications).toEqual([])
    expect(old.skipped).toContainEqual({ date: key(0), reason: 'stale' })
    expect(plan({ cache: cache({ fetchedAt: at(-1, 14, 1) }) }).notifications.length).toBe(1)
    expect(plan({ cache: null }).skipped).toContainEqual({ date: key(0), reason: 'noData' })
  })
})

describe('metin: yer tutucu ve hücre', () => {
  it('kod cümle yazmaz: onaylı şablon yokken bildirimde title/body yok, textKey + hücre + değerler var', () => {
    const n = plan({ cache: cache({ rainHours: [[0, 21]] }) }).notifications[0]
    expect(n.title).toBeUndefined()
    expect(n.body).toBeUndefined()
    expect(n.textKey).toBe('weather.morning')
    expect(n.cell).toBe('rain.warm')
    expect(n.slots).toMatchObject({ place: 'Gaziemir', temp: 17, high: 26, rainFrom: '21', rainTo: '22' })
    expect(cellOf(false, 14)).toBe('dry.cool')
  })

  it('tahminin yaşı: 1 saatten eskiyse metinde (dün akşam / bugün); tazeyse yok', () => {
    expect(plan().notifications[0].slots.age).toEqual({ day: 'today', at: '05.40' })
    expect(plan({ cache: cache({ fetchedAt: at(-1, 22, 40) }) }).notifications[0].slots.age).toEqual({ day: 'yesterday', at: '22.40' })
    expect(plan({ cache: cache({ fetchedAt: at(0, 7, 30) }), now: new Date(at(0, 7, 30)) }).notifications[0].slots.age).toBeNull()
    const n = plan({ cache: cache({ fetchedAt: at(-1, 22, 40), rainHours: [[0, 14]] }), templates: TPL }).notifications[0]
    expect(n.body.startsWith('Y 22.40 R 14.00')).toBe(true)
  })

  it('yağmur ilk cümle: yağmurlu günde gövdenin ilk cümlesi yağmur; şablon denetimi yağmursuz başlayanı yakalar', () => {
    const n = plan({ cache: cache({ rainHours: [[0, 21], [0, 22]], fetchedAt: at(0, 7, 30) }), now: new Date(at(0, 7, 30)), templates: TPL }).notifications[0]
    expect(n.body.split(/[.;]\s/)[0]).toMatch(/^R 21\.00'de(n)?/)
    expect(n.title).toBe('Gaziemir 17° · 26°')
    expect(n.body.split('\n').at(-1)).toBe('S')
    expect(templateProblems(TPL)).toEqual([])
    expect(templateProblems([{ id: 'x', cell: 'rain.mild', text: 'W. R {rainFrom:LOC}' }]).map((p) => p.problem)).toContain('rainFirst')
    expect(templateProblems([{ id: 'y', cell: 'dry.mild', text: 'D {rainFrom:LOC}' }]).map((p) => p.problem)).toContain('dryRain')
    expect(templateProblems([{ id: 'z', cell: 'dry.mild', text: 'D 21 derece' }]).map((p) => p.problem)).toContain('digit')
  })

  it('sessiz günde yürüyüş önerisi yok: walk: true şablon hiç seçilmez', () => {
    const log = [{ date: key(0), type: 'walk', eligible: true, arm: 'silent' }]
    for (let d = 1; d <= 28; d++) {
      const now = new Date(2026, 9, d, 6, 0)
      const dk = dayKey(now)
      const c = cache()
      c.at = new Date(now.getTime() - 20 * 60000).toISOString()
      c.data.days = [{ date: dk, highC: 20 }]
      c.data.hours = Array.from({ length: 24 }, (_, h) => ({ at: new Date(2026, 9, d, h).getTime(), tempC: 18, precipChance: h === 18 ? 0.8 : 0 }))
      const silent = planMorningWeather({ now, morning: ON, cache: c, place: PLACE, log: [{ ...log[0], date: dk }], templates: TPL }).notifications[0]
      expect(silent.walkOk).toBe(false)
      expect(silent.body.split('\n')[0].endsWith('N')).toBe(true)
    }
    expect(plan({ log: [{ date: key(0), type: 'walk', arm: 'send' }] }).notifications[0].walkOk).toBe(true)
  })

  it('uzunluk: başlık ≤ 30, gövde ≤ 110; aşarsa metin bağlanmaz; uzun ilçe adında başlık yalnız sıcaklık', () => {
    const n = plan({ place: { il: 'Bursa', ilce: 'Mustafakemalpaşa' }, templates: TPL }).notifications[0]
    expect(n.title).toBe('17° · 26°')
    const long = [...TPL.filter((t) => t.cell !== 'source'), { id: 's', cell: 'source', text: 'S'.repeat(120) }]
    expect(plan({ templates: long }).notifications[0].body).toBeUndefined()
  })

  it('saat eki tablosu (§5.5 madde 7)', () => {
    const t = hourTable()
    expect(Object.keys(t).length).toBe(24)
    expect(t['21']).toEqual({ NUM: '21.00', LOC: "21.00'de", ABL: "21.00'den", DAT: "21.00'e" })
    expect(t['19']).toEqual({ NUM: '19.00', LOC: "19.00'da", ABL: "19.00'dan", DAT: "19.00'a" })
    expect(t['15'].ABL).toBe("15.00'ten")
    expect(t['06'].DAT).toBe("06.00'ya")
    expect(t['20'].DAT).toBe("20.00'ye")
  })
})

describe('"yerelde yenilendi" (2. katman işareti)', () => {
  it('katman 2 yok: takeLocalRefresh null döner', async () => {
    expect(LOCAL_REFRESH_ENABLED).toBe(false)
    expect(await takeLocalRefresh({ takeLocalRefresh: async () => ({ date: key(0), at: 1 }) })).toBeNull()
  })

  it('o gün yeniden yazılmaz: keepPending, metinsiz; notifyApply bekleyeni yerinde tutar, yoksa kurmaz', async () => {
    const r = plan({ localRefresh: { date: key(0), at: at(0, 7, 25) }, templates: TPL })
    const n = r.notifications.find((x) => x.id === 7700)
    expect(n.keepPending).toBe(true)
    expect(n.title).toBeUndefined()
    expect(n.at.getTime()).toBe(at(0, 7, 25))

    vi.useFakeTimers({ now: NOW })
    try {
      const make = (pending) => {
        const store = new Map(pending.map((p) => [p.id, p]))
        const LN = {
          checkPermissions: async () => ({ display: 'granted' }),
          getPending: async () => ({ notifications: [...store.values()] }),
          cancel: vi.fn(async ({ notifications }) => notifications.forEach(({ id }) => store.delete(id))),
          schedule: vi.fn(async ({ notifications }) => notifications.forEach((x) => store.set(x.id, x))),
          getDeliveredNotifications: async () => ({ notifications: [] }),
          removeDeliveredNotifications: vi.fn(async () => {}),
        }
        return { LN, store }
      }
      const swift = { id: 7700, title: 'swift', body: 'swift', schedule: { at: new Date(at(0, 7, 25)).toISOString() } }
      const f = make([swift])
      const p1 = createApplier(async () => ({ LN: f.LN })).applyPlan({ notifications: r.notifications })
      await vi.advanceTimersByTimeAsync(500)
      await p1
      expect(f.store.get(7700).body).toBe('swift')
      expect(f.LN.cancel).not.toHaveBeenCalled()
      expect(f.LN.schedule).not.toHaveBeenCalled()
      const g = make([])
      const p2 = createApplier(async () => ({ LN: g.LN })).applyPlan({ notifications: r.notifications })
      await vi.advanceTimersByTimeAsync(500)
      await p2
      expect(g.store.has(7700)).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('composeMorning', () => {
  it('şablon eksikse null (kurulmaz)', () => {
    const n = plan().notifications[0]
    expect(composeMorning(n, [])).toBeNull()
    expect(composeMorning(n, TPL.filter((t) => t.cell !== 'source'))).toBeNull()
  })
})
