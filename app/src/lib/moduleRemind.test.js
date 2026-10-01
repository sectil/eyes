import { describe, it, expect, afterEach } from 'vitest'
import {
  MR_ID, MR_ID_LAST, EXTRA_ID, MAX_TIMES, REMIND_WINDOWS, PATH_ID,
  pickAutoTime, planModuleReminders, normalizeModuleReminders, recordLocal, remindTimeError, windowOf,
} from './moduleRemind.js'
import { planNotifications } from './notifyPlan.js'
import { toMinutes } from './reminders.js'
import { dayKey } from './habitLog.js'

// Yardımcılar: n gün önce yerel saat hh:mm'de başlayan kayıt (sessions biçimi: bitiş = başlangıç + seconds)
const NOW = new Date(2026, 8, 30, 7, 0) // 30 Eylül 2026 07.00 yerel
const at = (daysAgo, hh, mm, base = NOW) => new Date(base.getFullYear(), base.getMonth(), base.getDate() - daysAgo, hh, mm)
const sess = (daysAgo, hh, mm, extra = {}) => ({ date: new Date(at(daysAgo, hh, mm).getTime() + 120000).toISOString(), seconds: 120, ...extra })
const move = { window: 'move', defaultTime: '10:00', science: ['a', 'b'] }
const calm = { window: 'calm', defaultTime: '10:00', science: ['a'] }
const yes = { optIn: 'yes' }
const hm = (d) => [d.getHours(), d.getMinutes()]

describe('pickAutoTime: 15 dk dilim ve farklı gün', () => {
  it('genelde 09.30–09.44 arasında başlanıyorsa 09.15 önerilir (dilimden 15 dk önce); usual 09:30', () => {
    const recs = [1, 2, 3, 4, 5, 6].map((d, i) => sess(d, 9, 30 + (i % 3) * 5))
    const p = pickAutoTime({ records: recs, remind: move, now: NOW })
    expect(p.source).toBe('data')
    expect(p.times).toEqual(['09:15'])
    expect(p.picks[0]).toMatchObject({ usual: '09:30', clamped: null, shifted: false })
  })
  it('aynı günde aynı dilimde çok kayıt tek gün sayılır: çok kayıtlı az gün, az kayıtlı çok günü yenmez', () => {
    const many = [1, 2].flatMap((d) => [0, 2, 4, 6, 8].map((m) => sess(d, 11, m))) // 2 gün × 5 kayıt 11.00'de
    const spread = [3, 4, 5, 6, 7].map((d) => sess(d, 15, 0)) // 5 farklı gün 15.00'te
    const p = pickAutoTime({ records: [...many, ...spread], remind: move, now: NOW })
    expect(p.times[0]).toBe('14:45')
    expect(p.days).toBe(7)
  })
  it('komşu dilimlerle yumuşatma: 10.00 ve 10.15 arasında bölünmüş 6 gün, tek başına 3 günlük 17.00 dilimini yener', () => {
    const recs = [...[1, 2, 3].map((d) => sess(d, 10, 0)), ...[4, 5, 6].map((d) => sess(d, 10, 20)), ...[7, 8, 9].map((d) => sess(d, 17, 0))]
    // 10.00 dilimi: 3 + komşu 10.15'in 3'ü = 6 gün; 17.00: 3 gün
    const p = pickAutoTime({ records: recs, remind: move, now: NOW, maxTimes: 1 })
    expect(['09:45', '10:00']).toContain(p.times[0])
  })
  it('28 günden eski kayıt ve gelecekteki kayıt sayılmaz', () => {
    const old = [29, 30, 31, 32, 33].map((d) => sess(d, 12, 0))
    const p = pickAutoTime({ records: old, remind: move, now: NOW })
    expect(p.source).toBe('default')
    expect(p.days).toBe(0)
  })
})

describe('pickAutoTime: 5 gün eşiği ve varsayılan', () => {
  it('4 farklı gün → defaultTime; 5 farklı gün → veri', () => {
    const four = [1, 2, 3, 4].map((d) => sess(d, 12, 0))
    expect(pickAutoTime({ records: four, remind: move, now: NOW })).toMatchObject({ source: 'default', times: ['10:00'], days: 4 })
    const five = [1, 2, 3, 4, 5].map((d) => sess(d, 12, 0))
    expect(pickAutoTime({ records: five, remind: move, now: NOW })).toMatchObject({ source: 'data', times: ['11:45'], days: 5 })
  })
  it('aynı gün 5 kayıt yetmez (farklı gün sayılır)', () => {
    const oneDay = [0, 10, 20, 30, 40].map((m) => sess(1, 12, m))
    expect(pickAutoTime({ records: oneDay, remind: move, now: NOW }).source).toBe('default')
  })
  it('habit-log kaydı ({ at }) da sayılır; başlangıç at’in kendisi', () => {
    const habits = [1, 2, 3, 4, 5].map((d) => ({ date: dayKey(at(d, 0, 0)), type: 'mola', at: at(d, 13, 0).toISOString() }))
    expect(pickAutoTime({ records: habits, remind: { legacy: 'mola' }, now: NOW }).times).toEqual(['12:45'])
  })
})

describe('pickAutoTime: gece kayıtları, pencere, 60 dk', () => {
  it('gece kayıtları (Dalga uyku kipi, alarm; night: true) sayılmaz', () => {
    const night = [1, 2, 3, 4, 5, 6].map((d) => sess(d, 23, 30, { night: true }))
    const day = [1, 2, 3].map((d) => sess(d, 11, 0))
    const p = pickAutoTime({ records: [...night, ...day], remind: calm, now: NOW })
    expect(p).toMatchObject({ source: 'default', days: 3 })
  })
  it('move 09–21: 08.30 alışkanlığı pencerenin ilk saatine çekilir, neden işaretli (early)', () => {
    const recs = [1, 2, 3, 4, 5].map((d) => sess(d, 8, 30))
    const p = pickAutoTime({ records: recs, remind: move, now: NOW })
    expect(p.times).toEqual(['09:00'])
    expect(p.picks[0]).toMatchObject({ usual: '08:30', clamped: 'early' })
  })
  it('calm 08–22: aynı 08.30 alışkanlığı 08.15 olur; 22.30 alışkanlığı 22.00’ye çekilir (late)', () => {
    const recs = [1, 2, 3, 4, 5].map((d) => sess(d, 8, 30))
    expect(pickAutoTime({ records: recs, remind: calm, now: NOW }).times).toEqual(['08:15'])
    const late = [1, 2, 3, 4, 5].map((d) => sess(d, 22, 30))
    const p = pickAutoTime({ records: late, remind: calm, now: NOW })
    expect(p.times).toEqual(['22:00'])
    expect(p.picks[0].clamped).toBe('late')
    expect(windowOf(calm)).toEqual({ from: toMinutes(REMIND_WINDOWS.calm.from), to: toMinutes(REMIND_WINDOWS.calm.to) })
  })
  it('legacy su: pencere 09–18', () => {
    const recs = [1, 2, 3, 4, 5].map((d) => sess(d, 19, 0))
    expect(pickAutoTime({ records: recs, remind: { legacy: 'water' }, now: NOW }).times).toEqual(['18:00'])
  })
  it('başka bildirime 60 dk’dan yakınsa bir sonraki uygun dilime kayar (shifted)', () => {
    const recs = [1, 2, 3, 4, 5].map((d) => sess(d, 12, 45))
    const p = pickAutoTime({ records: recs, remind: move, now: NOW, busy: ['12:30'] })
    expect(p.times).toEqual(['13:30'])
    expect(p.picks[0]).toMatchObject({ usual: '12:45', shifted: true })
    // varsayılan saat de kayar
    expect(pickAutoTime({ records: [], remind: move, now: NOW, busy: [600] }).times).toEqual(['11:00'])
  })
  it('pencerenin sonunda yer yoksa geriye kayar; hiç yer yoksa times boş', () => {
    const recs = [1, 2, 3, 4, 5].map((d) => sess(d, 21, 0))
    expect(pickAutoTime({ records: recs, remind: move, now: NOW, busy: ['21:00'] }).times).toEqual(['20:00'])
    const everyHour = Array.from({ length: 13 }, (_, i) => (9 + i) * 60)
    expect(pickAutoTime({ records: recs, remind: move, now: NOW, busy: everyHour }).times).toEqual([])
  })
  it('remindTimeError: pencere ve 60 dk (hata anahtarı)', () => {
    expect(remindTimeError('08:30', move)).toBe('window')
    expect(remindTimeError('08:30', calm)).toBeNull()
    expect(remindTimeError('13:00', move, ['12:30'])).toBe('gap')
    expect(remindTimeError('13:30', move, ['12:30'])).toBeNull()
  })
})

describe('pickAutoTime: ikinci saat kuralı', () => {
  it('ikinci dilimde ≥ 5 gün ve ≥ 2 saat uzaklık → iki saat (10.00 ve 18.00 → 09.45 ve 17.45)', () => {
    const recs = [...[1, 2, 3, 4, 5, 6].map((d) => sess(d, 10, 0)), ...[1, 2, 3, 4, 5].map((d) => sess(d, 18, 0))]
    const p = pickAutoTime({ records: recs, remind: move, now: NOW })
    expect(p.times).toEqual(['09:45', '17:45'])
    expect(p.picks.map((x) => x.usual)).toEqual(['10:00', '18:00'])
  })
  it('ikinci dilimde 4 gün → tek saat', () => {
    const recs = [...[1, 2, 3, 4, 5, 6].map((d) => sess(d, 10, 0)), ...[1, 2, 3, 4].map((d) => sess(d, 18, 0))]
    expect(pickAutoTime({ records: recs, remind: move, now: NOW }).times).toEqual(['09:45'])
  })
  it('2 saatten yakın dilim ikinci saat olmaz (10.00 ve 11.45)', () => {
    const recs = [...[1, 2, 3, 4, 5, 6].map((d) => sess(d, 10, 0)), ...[1, 2, 3, 4, 5].map((d) => sess(d, 11, 45))]
    expect(pickAutoTime({ records: recs, remind: move, now: NOW }).times).toHaveLength(1)
  })
  it('maxTimes 1 ya da yol → tek saat', () => {
    const recs = [...[1, 2, 3, 4, 5, 6].map((d) => sess(d, 10, 0)), ...[1, 2, 3, 4, 5].map((d) => sess(d, 18, 0))]
    expect(pickAutoTime({ records: recs, remind: { ...move, maxTimes: 1 }, now: NOW }).times).toHaveLength(1)
    const pathRecs = recs.map((r) => ({ ...r, path: true }))
    expect(pickAutoTime({ records: pathRecs, remind: move, now: NOW, forPath: true }).times).toEqual(['09:45'])
  })
  it('yol kayıtları yalnız yola sayılır; modülün saati yol dışındaki kayıtlarından', () => {
    const inPath = [1, 2, 3, 4, 5].map((d) => sess(d, 9, 30, { path: true }))
    const outside = [1, 2, 3, 4, 5].map((d) => sess(d, 16, 0))
    expect(pickAutoTime({ records: [...inPath, ...outside], remind: move, now: NOW }).times).toEqual(['15:45'])
    expect(pickAutoTime({ records: [...inPath, ...outside], remind: move, now: NOW, forPath: true }).times).toEqual(['09:15'])
  })
})

describe('normalizeModuleReminders', () => {
  it('bozuk alanlar atılır; saatler sıralı, tekrarsız, en çok 3', () => {
    const n = normalizeModuleReminders({ yoga: { on: true, times: ['18:00', 'x', '09:00', '18:00', '12:00', '15:00'] }, bad: 3 })
    expect(n).toEqual({ yoga: { on: true, mode: 'auto', times: ['09:00', '12:00', '15:00'], autoAt: null, setAt: null } })
    expect(n.yoga.times).toHaveLength(MAX_TIMES)
    expect(normalizeModuleReminders(null)).toEqual({})
  })
})

describe('planModuleReminders: kapalıyken boş, kimlikler, pencere', () => {
  const mods = [{ id: 'yoga', remind: calm, doneToday: false }, { id: 'blink', remind: { ...move, route: 'blink' }, doneToday: false }]
  it('moduleReminders boş ya da optIn yes değil → hiçbir şey', () => {
    const empty = { notifications: [], extras: [], walkGuards: [], updates: [], proposals: [], skipped: [] }
    expect(planModuleReminders({ now: NOW, modules: mods, reminders: yes })).toEqual(empty)
    expect(planModuleReminders({ now: NOW, modules: mods, reminders: {}, moduleReminders: { yoga: { on: true, mode: 'manual', times: ['10:00'] } } })).toEqual(empty)
  })
  it('3 gün × saatler; kimlik 7800 + gün×20 + sıra; metin yok, yer tutucu anahtar; bilim anahtarı havuzdan', () => {
    const p = planModuleReminders({
      now: NOW, modules: mods, reminders: yes,
      moduleReminders: { yoga: { on: true, mode: 'manual', times: ['08:15', '20:00', '21:30'] }, blink: { on: true, mode: 'manual', times: ['14:00'] } },
    })
    expect(p.notifications).toHaveLength(12)
    for (const n of p.notifications) {
      expect(n.id).toBeGreaterThanOrEqual(MR_ID)
      expect(n.id).toBeLessThanOrEqual(MR_ID_LAST)
      expect(n.title).toBeUndefined()
      expect(n.textKey).toBe(`remind.${n.module}`)
      expect(n.extra.kind).toBe('remind')
    }
    expect(p.notifications.slice(0, 4).map((n) => [n.id, n.module, hm(n.at)])).toEqual([
      [7800, 'yoga', [8, 15]], [7801, 'blink', [14, 0]], [7802, 'yoga', [20, 0]], [7803, 'yoga', [21, 30]],
    ])
    expect(p.notifications[4].id).toBe(7820)
    expect(p.notifications.find((n) => n.module === 'blink').extra.route).toBe('blink')
    expect(['a', 'b']).toContain(p.notifications[0].extra.evidence)
    expect(new Set(p.notifications.map((n) => n.id)).size).toBe(12)
  })
  it('pencere dışı saat kurulmaz: move 08.15 ve 21.30 düşer', () => {
    const p = planModuleReminders({ now: NOW, modules: mods, reminders: yes, moduleReminders: { blink: { on: true, mode: 'manual', times: ['08:15', '21:30', '12:00'] } } })
    expect(p.notifications.map((n) => hm(n.at))).toEqual([[12, 0], [12, 0], [12, 0]])
    expect(p.skipped.filter((s) => s.reason === 'window')).toHaveLength(6)
  })
  it('günde en çok 3 saat (maxTimes ile daha az)', () => {
    const p = planModuleReminders({ now: NOW, reminders: yes, modules: [{ id: 'yoga', remind: { ...calm, maxTimes: 2 } }], moduleReminders: { yoga: { on: true, mode: 'manual', times: ['09:00', '12:00', '15:00'] } } })
    expect(p.notifications.filter((n) => dayKey(n.at) === dayKey(NOW))).toHaveLength(2)
  })
  it('bugün yapıldıysa bugünün kalanı kurulmaz, yarın kurulur; doneToday işlev de olabilir', () => {
    const fn = (sessions) => sessions.length > 0
    const p = planModuleReminders({ now: NOW, reminders: yes, sessions: [{}], modules: [{ id: 'yoga', remind: calm, doneToday: fn }], moduleReminders: { yoga: { on: true, mode: 'manual', times: ['10:00'] } } })
    expect(p.notifications.map((n) => dayKey(n.at))).not.toContain(dayKey(NOW))
    expect(p.notifications).toHaveLength(2)
    expect(p.skipped[0].reason).toBe('doneBefore')
  })
  it('deney saatine (74xx) 60 dk’dan yakın modül hatırlatması kurulmaz; geçmiş an kurulmaz', () => {
    const later = new Date(2026, 8, 30, 11, 0)
    const reminders = { optIn: 'yes', types: { mola: { on: true, time: '12:30' } } }
    const fixed = planNotifications({ now: later, reminders, seed: 's' }).notifications
    const p = planModuleReminders({ now: later, reminders, fixed, modules: mods, moduleReminders: { blink: { on: true, mode: 'manual', times: ['10:00', '13:00', '14:00'] } } })
    const sent = new Set(fixed.map((n) => dayKey(n.at)))
    for (const n of p.notifications) {
      for (const f of fixed) expect(Math.abs(f.at - n.at)).toBeGreaterThanOrEqual(3600000)
    }
    expect(p.skipped.some((s) => s.reason === 'past' && s.time === '10:00')).toBe(true)
    const horizon = [0, 1, 2].map((d) => dayKey(new Date(2026, 8, 30 + d)))
    expect(p.skipped.filter((s) => s.reason === 'gap').map((s) => s.date)).toEqual(horizon.filter((k) => sent.has(k)))
    expect(p.skipped.filter((s) => s.reason === 'gap').every((s) => s.time === '13:00')).toBe(true)
  })
})

describe('planModuleReminders: yol', () => {
  it('yol hatırlatması günde tek bildirim kurar, Ana sayfayı açar (settings.moduleReminders.path)', () => {
    const p = planModuleReminders({ now: NOW, reminders: yes, modules: [], moduleReminders: { [PATH_ID]: { on: true, mode: 'manual', times: ['09:15', '13:00', '18:00'] } } })
    expect(p.notifications).toHaveLength(3)
    const perDay = new Map()
    for (const n of p.notifications) perDay.set(dayKey(n.at), (perDay.get(dayKey(n.at)) ?? 0) + 1)
    expect([...perDay.values()]).toEqual([1, 1, 1])
    expect(p.notifications[0]).toMatchObject({ module: 'path', extra: { route: 'home', module: 'path' } })
    expect(hm(p.notifications[0].at)).toEqual([9, 15])
  })
})

describe('planModuleReminders: "Sen karar ver" yeniden hesap', () => {
  const recs = [1, 2, 3, 4, 5, 6].map((d) => sess(d, 11, 0))
  it('deney dışı modül: 14 gün dolunca saat kendiliğinden değişir (updates); dolmadıysa değişmez', () => {
    const stale = new Date(NOW.getTime() - 15 * 86400000).toISOString()
    const p = planModuleReminders({ now: NOW, reminders: yes, modules: [{ id: 'yoga', remind: calm, records: recs }], moduleReminders: { yoga: { on: true, mode: 'auto', times: ['16:00'], autoAt: stale } } })
    expect(p.updates).toEqual([{ module: 'yoga', times: ['10:45'], autoAt: NOW.toISOString() }])
    expect(hm(p.notifications[0].at)).toEqual([10, 45])
    const fresh = new Date(NOW.getTime() - 3 * 86400000).toISOString()
    const q = planModuleReminders({ now: NOW, reminders: yes, modules: [{ id: 'yoga', remind: calm, records: recs }], moduleReminders: { yoga: { on: true, mode: 'auto', times: ['16:00'], autoAt: fresh } } })
    expect(q.updates).toEqual([])
    expect(hm(q.notifications[0].at)).toEqual([16, 0])
  })
  it('elle seçilmiş saat (manual) hiç değişmez', () => {
    const p = planModuleReminders({ now: NOW, reminders: yes, modules: [{ id: 'yoga', remind: calm, records: recs }], moduleReminders: { yoga: { on: true, mode: 'manual', times: ['16:00'] } } })
    expect(p.updates).toEqual([])
  })
})

describe('planModuleReminders: deney türünde çok saat', () => {
  const breathMod = { id: 'breath', remind: { legacy: 'breath', route: 'breath-1', science: ['s'] }, doneToday: false, records: [] }
  const reminders = { optIn: 'yes', types: { mola: { on: false, time: '12:30' }, breath: { on: true, time: '10:00' } } }
  const mr = { breath: { on: true, mode: 'manual', times: ['13:00', '17:00'] } }

  it('ek saatler uygun (seçilen) günde kurulur; kimlik 7860 + tür×2 + yuva; 78xx kurulmaz; seçilmeyen günde ne 74xx ne ek saat', () => {
    const now = new Date(2026, 8, 30, 9, 0) // Çarşamba (getDay 3)
    const today = dayKey(now)
    const base = planNotifications({ now, reminders })
    const p = planModuleReminders({ now, reminders, modules: [breathMod], moduleReminders: mr, fixed: base.notifications, log: base.log })
    expect(p.notifications).toEqual([])
    expect(base.log.find((e) => e.date === today && e.type === 'breath').arm).toBe('send')
    expect(p.extras.map((n) => [n.id, hm(n.at), n.extra])).toEqual([
      [EXTRA_ID + 2 * 2 + 0, [13, 0], { kind: 'nudge', type: 'breath', date: today, slot: 0 }],
      [EXTRA_ID + 2 * 2 + 1, [17, 0], { kind: 'nudge', type: 'breath', date: today, slot: 1 }],
    ])
    expect(p.extras.every((n) => n.textKey === 'nudge.breath' && n.title === undefined)).toBe(true)
    // Çarşamba seçilmemiş: o gün ne 74xx ne ek saat
    const off = { ...reminders, types: { ...reminders.types, breath: { on: true, time: '10:00', days: [0, 1, 2, 4, 5, 6] } } }
    const offBase = planNotifications({ now, reminders: off })
    expect(offBase.log.find((e) => e.date === today && e.type === 'breath')).toMatchObject({ arm: null, skipReason: 'day' })
    expect(offBase.notifications.filter((n) => n.type === 'breath' && dayKey(n.at) === today)).toEqual([])
    const q = planModuleReminders({ now, reminders: off, modules: [breathMod], moduleReminders: mr, fixed: offBase.notifications, log: offBase.log })
    expect(q.notifications).toEqual([])
    expect(q.extras).toEqual([])
    expect(q.skipped.filter((s) => s.reason === 'arm' && s.date === today)).toHaveLength(2)
  })
  it('günlük yoksa ek saat kurulmaz; ilk saate 60 dk’dan yakın ek saat kurulmaz; ufuk 24 saat', () => {
    const now = new Date(2026, 8, 30, 14, 0)
    expect(planModuleReminders({ now, reminders, modules: [breathMod], moduleReminders: mr }).extras).toEqual([])
    const log = [dayKey(now), dayKey(new Date(2026, 9, 1))].map((date) => ({ date, type: 'breath', arm: 'send' }))
    const p = planModuleReminders({ now, reminders, modules: [breathMod], moduleReminders: { breath: { on: true, mode: 'manual', times: ['10:30', '17:00'] } }, log })
    // 10.30 ilk saate (10.00) yakın → gap; 17.00 bugün
    expect(p.extras.map((n) => [dayKey(n.at), hm(n.at)])).toEqual([[dayKey(now), [17, 0]]])
    const q = planModuleReminders({ now, reminders, modules: [breathMod], moduleReminders: mr, log })
    // 13.00 bugün geçti → yarın 13.00 (24 saat içinde); 17.00 bugün
    expect(q.extras.map((n) => [dayKey(n.at), hm(n.at)])).toEqual([[dayKey(new Date(2026, 9, 1)), [13, 0]], [dayKey(now), [17, 0]]])
    // Saat şimdiden LEAD_MS (1 dk) içinde: yarına kayar ve ufukta kalır ('past' diye düşmez)
    const edge = new Date(2026, 8, 30, 12, 59, 30)
    const r = planModuleReminders({ now: edge, reminders, modules: [breathMod], moduleReminders: mr, log })
    expect(r.extras.map((n) => [dayKey(n.at), hm(n.at)])).toEqual([[dayKey(new Date(2026, 9, 1)), [13, 0]], [dayKey(now), [17, 0]]])
    expect(r.skipped.filter((s) => s.reason === 'past')).toEqual([])
  })
  it('ek saatten önceki son 2 saatte yapıldıysa o saat düşer, günün kalanı düşmez', () => {
    const now = new Date(2026, 8, 30, 15, 0)
    const log = [{ date: dayKey(now), type: 'breath', arm: 'send' }, { date: dayKey(new Date(2026, 9, 1)), type: 'breath', arm: 'send' }]
    const done = { ...breathMod, records: [{ date: new Date(2026, 8, 30, 14, 50).toISOString(), seconds: 60 }] }
    const p = planModuleReminders({ now, reminders, modules: [done], moduleReminders: { breath: { on: true, mode: 'manual', times: ['16:00', '19:00'] } }, log })
    expect(p.extras.map((n) => hm(n.at))).toEqual([[19, 0]])
    expect(p.skipped.find((s) => s.reason === 'doneBefore').time).toBe('16:00')
  })
  it('yürüyüş ek saatine kendi eşiğiyle WalkGuard', () => {
    const now = new Date(2026, 8, 30, 9, 0)
    const rw = { optIn: 'yes', types: { mola: { on: false }, walk: { on: true, time: '10:00' } } }
    const walkMod = { id: 'walk', remind: { legacy: 'walk', science: ['w'] }, records: [] }
    const p = planModuleReminders({ now, reminders: rw, modules: [walkMod], moduleReminders: { walk: { on: true, mode: 'manual', times: ['15:00'] } }, log: [{ date: dayKey(now), type: 'walk', arm: 'send' }], health: { avgSteps: 9600 } })
    expect(p.extras[0].id).toBe(EXTRA_ID + 1 * 2)
    expect(p.walkGuards).toEqual([{ id: EXTRA_ID + 2, date: dayKey(now), threshold: 6000 }])
  })
  it('saat değişimi yalnız onayla: 14 gün dolunca öneri döner, ayar ve plan değişmez', () => {
    const recs = [1, 2, 3, 4, 5, 6].map((d) => sess(d, 9, 15))
    const stale = new Date(NOW.getTime() - 20 * 86400000).toISOString()
    const p = planModuleReminders({ now: NOW, reminders, modules: [{ ...breathMod, records: recs }], moduleReminders: { breath: { on: true, mode: 'auto', times: [], autoAt: stale } } })
    expect(p.proposals).toEqual([{ module: 'breath', type: 'breath', from: '10:00', to: '09:00' }])
    expect(p.updates).toEqual([])
    expect(p.notifications).toEqual([])
  })
})

describe('saat dilimi', () => {
  const tz = process.env.TZ
  afterEach(() => {
    if (tz === undefined) delete process.env.TZ
    else process.env.TZ = tz
  })
  it('yaz saati geçiş günü (Berlin, 25 Ekim 2026): kayıtlar yerel saatle aynı dilim; plan her gün yerel 09.15', () => {
    process.env.TZ = 'Europe/Berlin'
    const now = new Date(2026, 9, 24, 7, 0)
    const recs = [1, 2, 3, 4, 5, 6].map((d) => ({ date: new Date(2026, 9, 24 - d, 9, 30).toISOString(), seconds: 0 }))
    // geçişten sonra da aynı yerel saatte (26–27 Ekim kayıtları, geçmişe bakan ikinci ölçüm)
    const after = new Date(2026, 9, 30, 7, 0)
    const recsAfter = [1, 2, 3, 4, 5, 6].map((d) => ({ date: new Date(new Date(2026, 9, 30 - d, 9, 30).getTime() + 60000).toISOString(), seconds: 60 }))
    expect(new Date(2026, 9, 24).getTimezoneOffset()).not.toBe(new Date(2026, 9, 29).getTimezoneOffset())
    expect(pickAutoTime({ records: recs, remind: move, now }).times).toEqual(['09:15'])
    expect(pickAutoTime({ records: recsAfter, remind: move, now: after }).times).toEqual(['09:15'])
    const p = planModuleReminders({ now, reminders: yes, modules: [{ id: 'blink', remind: move }], moduleReminders: { blink: { on: true, mode: 'manual', times: ['09:15'] } } })
    expect(p.notifications.map((n) => dayKey(n.at))).toEqual(['2026-10-24', '2026-10-25', '2026-10-26'])
    p.notifications.forEach((n) => expect(hm(n.at)).toEqual([9, 15]))
    expect(p.notifications[1].at - p.notifications[0].at).toBe(25 * 3600000) // 24→25 Ekim: 25 saat
  })
  it('İstanbul → Berlin: kaydın kendi yerel saati (açık fark) kullanılır; plan yeni yerel saatte kurulur', () => {
    process.env.TZ = 'Europe/Istanbul'
    // İstanbul'da 09.30'da yapılmış 5 gün (kayıt kendi farkını taşıyor)
    const recs = [0, 1, 2, 3, 4].map((i) => ({ date: `2026-09-${String(28 - i).padStart(2, '0')}T09:30:00+03:00`, seconds: 0 }))
    const inIst = pickAutoTime({ records: recs, remind: move, now: new Date('2026-09-30T05:00:00Z') })
    expect(inIst.times).toEqual(['09:15'])
    const planIst = planModuleReminders({ now: new Date('2026-09-30T05:00:00Z'), reminders: yes, modules: [{ id: 'blink', remind: move }], moduleReminders: { blink: { on: true, mode: 'manual', times: inIst.times } } })

    process.env.TZ = 'Europe/Berlin'
    expect(recordLocal(recs[0])).toMatchObject({ day: '2026-09-28', min: 9 * 60 + 30 })
    const inBer = pickAutoTime({ records: recs, remind: move, now: new Date('2026-09-30T05:00:00Z') })
    expect(inBer.times).toEqual(['09:15']) // kaydın kendi yerel saati: 09.30 (Berlin saatiyle 08.30 değil)
    const planBer = planModuleReminders({ now: new Date('2026-09-30T05:00:00Z'), reminders: yes, modules: [{ id: 'blink', remind: move }], moduleReminders: { blink: { on: true, mode: 'manual', times: inBer.times } } })
    expect(hm(planBer.notifications[0].at)).toEqual([9, 15]) // Berlin yerel
    expect(planBer.notifications[0].at - planIst.notifications[0].at).toBe(3600000) // aynı yerel saat, 1 saat sonra
    // Fark taşımayan ('Z') kayıt telefonun şimdiki diliminde okunur (VARSAYIM: bugünkü kayıtlar)
    expect(recordLocal({ at: '2026-09-28T06:30:00.000Z' }).min).toBe(8 * 60 + 30)
    expect(recordLocal({ at: '2026-09-28T06:30:00.000Z', tzOffset: -180 }).min).toBe(9 * 60 + 30)
  })
})
