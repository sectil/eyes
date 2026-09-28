import { describe, it, expect } from 'vitest'
import {
  hhmm, roundTo, withSuffix, daysLabel, targetDay, nextOccurrence, nextRing, lastRing, untilText, ringLabel,
  suggestTimes, suggestDays, latency, nextLatency, sleepMinutes, dismissStreak, eveningCard, questionDue, morningCard,
  wakeSignal, setupDefaults, buildAlarm, DEFAULT_TIMES, LATENCY_START, lateSleepMinutes, bedtimeFor,
} from './alarm.js'
import { normalizeAlarm, alarmHabits, addAlarmEvent, loadAlarmLog, saveAlarm, loadAlarm, ALARM_LOG_MAX, loadHubHabits } from './alarmLog.js'
import { hub, growthMap } from './dataHub.js'
import { fallbackNotifications, FALLBACK_BASE, FALLBACK_ONCE } from './alarmNative.js'
import { ALARM_SOUNDS, soundById, DEFAULT_SOUND } from './alarmSounds.js'

// Yerel saatle tarih (testler saat dilimine bağlı kalmasın)
const at = (y, mo, d, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi, 0, 0)
const iso = (...a) => at(...a).toISOString()
const key = (y, mo, d) => `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const ev = (type, date, fields = {}) => ({ type, at: date.toISOString(), date: key(date.getFullYear(), date.getMonth() + 1, date.getDate()), ...fields })
// 28 Eylül 2026 Pazartesi
const MON = (h = 21, mi = 0) => at(2026, 9, 28, h, mi)
const alarmOf = (p = {}) => normalizeAlarm({ on: true, hour: 7, minute: 0, days: [], at: null, sound: 'dalga-motive', sleep: 'auto', wake: 'none', kind: 'alarmkit', setAt: iso(2026, 9, 28, 21, 0), ...p })

function memStore() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}

describe('biçim', () => {
  it('saat ve yuvarlama', () => {
    expect(hhmm(420)).toBe('07:00')
    expect(hhmm(65)).toBe('01:05')
    expect(roundTo(7 * 60 + 7)).toBe(420)
    expect(roundTo(7 * 60 + 8)).toBe(435)
    expect(roundTo(23 * 60 + 55)).toBe(0) // gece yarısına sarar
  })
  it('Türkçe ek saatin okunuşuna göre', () => {
    expect(withSuffix(420, 'loc')).toBe("07:00'de") // yedide
    expect(withSuffix(420, 'dat')).toBe("07:00'ye") // yediye
    expect(withSuffix(480, 'loc')).toBe("08:00'de") // sekizde
    expect(withSuffix(480, 'dat')).toBe("08:00'e")
    expect(withSuffix(540, 'loc')).toBe("09:00'da") // dokuzda
    expect(withSuffix(450, 'loc')).toBe("07:30'da") // otuzda
    expect(withSuffix(435, 'loc')).toBe("07:15'te") // on beşte
    expect(withSuffix(405, 'dat')).toBe("06:45'e") // kırk beşe
    expect(withSuffix(360, 'loc')).toBe("06:00'da") // altıda
    expect(withSuffix(360, 'dat')).toBe("06:00'ya")
    expect(withSuffix(600, 'loc')).toBe("10:00'da") // onda
    expect(withSuffix(4 * 60, 'loc')).toBe("04:00'te") // dörtte
    expect(withSuffix(3 * 60, 'loc')).toBe("03:00'te") // üçte
    expect(withSuffix(440, 'loc')).toBe("07:20'de") // yirmide
    expect(withSuffix(460, 'loc')).toBe("07:40'ta") // kırkta
  })
  it('gün etiketi', () => {
    expect(daysLabel([])).toBe('Yalnız yarın')
    expect(daysLabel([1, 2, 3, 4, 5])).toBe('Pazartesi–Cuma')
    expect(daysLabel([1, 2, 3, 4, 5, 6])).toBe('Pazartesi–Cumartesi')
    expect(daysLabel([0, 1, 2, 3, 4, 5, 6])).toBe('Her gün')
    expect(daysLabel([1, 3, 5])).toBe('Pt, Ça, Cu')
    expect(daysLabel([6, 0])).toBe('Ct, Pz')
    expect(daysLabel([6])).toBe('Her Cumartesi')
  })
  it('kalan süre ve gün adı', () => {
    expect(untilText(at(2026, 9, 29, 7, 0), at(2026, 9, 28, 21, 44))).toBe('9 sa 16 dk sonra')
    expect(untilText(at(2026, 9, 29, 7, 0), at(2026, 9, 28, 22, 0))).toBe('9 sa sonra')
    expect(untilText(at(2026, 9, 28, 22, 0), at(2026, 9, 28, 21, 40))).toBe('20 dk sonra')
    expect(untilText(at(2026, 10, 3, 7, 0), at(2026, 9, 28, 21, 44))).toBe('5 gün sonra')
    expect(ringLabel(at(2026, 9, 29, 7, 0), MON())).toBe('07:00')
    expect(ringLabel(at(2026, 10, 3, 7, 0), MON())).toBe('Cumartesi 07:00')
  })
})

describe('zaman', () => {
  it('"yarın": gece 04.00\'ten önce bu sabah', () => {
    expect(targetDay(MON(21))).toBe(2) // Salı
    expect(targetDay(at(2026, 9, 29, 1, 30))).toBe(2) // Salı gecesi 01.30 → Salı sabahı
  })
  it('sonraki geçiş: günlü ve günsüz', () => {
    expect(nextOccurrence({ hour: 7, minute: 0, days: [] }, MON())).toEqual(at(2026, 9, 29, 7, 0))
    expect(nextOccurrence({ hour: 22, minute: 0, days: [] }, MON())).toEqual(at(2026, 9, 28, 22, 0))
    // Pazartesi 21.00'de yalnız Cuma → Cuma
    expect(nextOccurrence({ hour: 7, minute: 0, days: [5] }, MON())).toEqual(at(2026, 10, 2, 7, 0))
    // Pazartesi 06.00'da, Pazartesi alarmı 07.00 → bugün
    expect(nextOccurrence({ hour: 7, minute: 0, days: [1] }, MON(6))).toEqual(at(2026, 9, 28, 7, 0))
  })
  it('nextRing: kapalı, tek sefer çaldıktan sonra null', () => {
    const once = alarmOf({ at: iso(2026, 9, 29, 7, 0) })
    expect(nextRing(once, MON())).toEqual(at(2026, 9, 29, 7, 0))
    expect(nextRing(once, at(2026, 9, 29, 7, 1))).toBeNull()
    expect(nextRing({ ...once, on: false }, MON())).toBeNull()
    expect(nextRing(null, MON())).toBeNull()
  })
  it('lastRing: kurulmadan önceki geçiş sayılmaz', () => {
    const weekly = alarmOf({ days: [1, 2, 3, 4, 5] })
    expect(lastRing(weekly, MON(22))).toBeNull() // Pazartesi 07.00 kurulumdan (21.00) önce
    expect(lastRing(weekly, at(2026, 9, 29, 7, 20))).toEqual(at(2026, 9, 29, 7, 0))
    expect(lastRing(weekly, at(2026, 10, 4, 9, 0))).toEqual(at(2026, 10, 2, 7, 0)) // Pazar → Cuma
    const once = alarmOf({ at: iso(2026, 9, 29, 7, 0) })
    expect(lastRing(once, at(2026, 9, 29, 6, 59))).toBeNull()
    expect(lastRing(once, at(2026, 9, 29, 8, 0))).toEqual(at(2026, 9, 29, 7, 0))
  })
})

describe('öğrenme', () => {
  it('ilk kez 07:00 · 08:00 · 09:00, seçili 07:00', () => {
    expect(suggestTimes([], MON())).toEqual({ times: DEFAULT_TIMES, pick: 420, learned: false })
    expect(suggestDays([])).toEqual([1, 2, 3, 4, 5])
  })
  it('uyanma saatlerinden en sık üçü; "Nefona\'yı aç" anı, ilk açılışta alarm saati', () => {
    const log = [
      ev('wake', at(2026, 9, 22, 7, 3), { via: 'button', ring: iso(2026, 9, 22, 7, 0) }),
      ev('wake', at(2026, 9, 23, 7, 40), { via: 'open', ring: iso(2026, 9, 23, 7, 0) }), // açılış 07:40 değil, 07:00 sayılır
      ev('wake', at(2026, 9, 24, 7, 28), { via: 'button', ring: iso(2026, 9, 24, 7, 30) }),
      ev('wake', at(2026, 9, 25, 8, 1), { via: 'button', ring: iso(2026, 9, 25, 8, 0) }),
      ev('wake', at(2026, 9, 1, 5, 0), { via: 'button', ring: iso(2026, 9, 1, 5, 0) }), // 14 günden eski
    ]
    const s = suggestTimes(log, MON())
    expect(s.learned).toBe(true)
    expect(s.times).toEqual([420, 450, 480])
    expect(s.pick).toBe(420) // Salı için veri yok → genel en sık
  })
  it('seçili: hedef günde en sık', () => {
    const log = [
      ev('wake', at(2026, 9, 22, 6, 30), { via: 'button', ring: iso(2026, 9, 22, 6, 30) }), // Salı
      ev('wake', at(2026, 9, 23, 7, 0), { via: 'button' }),
      ev('wake', at(2026, 9, 24, 7, 0), { via: 'button' }),
    ]
    const s = suggestTimes(log, MON()) // yarın Salı
    expect(s.pick).toBe(390)
  })
  it('tek saat öğrenildiyse komşularıyla üçe tamamlanır', () => {
    const log = [ev('set', at(2026, 9, 27, 21, 0), { hour: 6, minute: 30, days: [1, 2, 3, 4, 5, 6] })]
    expect(suggestTimes(log, MON()).times).toEqual([360, 390, 420])
  })
  it('günler son günlü kurulumdan (tek seferlik kurulum atlanır)', () => {
    const log = [ev('set', at(2026, 9, 20, 21, 0), { hour: 7, minute: 0, days: [1, 2, 3, 4, 5, 6] }), ev('set', at(2026, 9, 27, 21, 0), { hour: 7, minute: 0, days: [] })]
    expect(suggestDays(log)).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('"Sana göre": 30 dk başlar, Hayır +5, Çok önce −5, 5–60', () => {
    expect(latency([])).toBe(30)
    expect(LATENCY_START).toBe(30)
    const m = (answer) => ({ type: 'morning', answer })
    expect(latency([m('no'), m('no'), m('yes')])).toBe(40)
    expect(latency(Array.from({ length: 6 }, () => m('early')))).toBe(5)
    expect(latency(Array.from({ length: 10 }, () => m('no')))).toBe(60)
    expect(nextLatency(60, 'no')).toBe(60)
    expect(nextLatency(15, 'early')).toBe(10)
    expect(nextLatency(15, 'yes')).toBe(15)
  })
})

describe('uyku sesi süresi', () => {
  it('kapalıysa null; sana göre öğrenilen süre; en çok 60 dk', () => {
    expect(sleepMinutes(alarmOf({ sleep: 'off', at: iso(2026, 9, 29, 7, 0) }), [], MON(23))).toBeNull()
    expect(sleepMinutes(alarmOf({ at: iso(2026, 9, 29, 7, 0) }), [], MON(23))).toBe(30)
    expect(sleepMinutes(alarmOf({ sleep: 90, at: iso(2026, 9, 29, 7, 0) }), [], MON(23))).toBe(60)
  })
  it('alarmdan en az 1 saat önce biter; yetmezse 0', () => {
    const a = alarmOf({ sleep: 45, at: iso(2026, 9, 29, 7, 0) })
    expect(sleepMinutes(a, [], at(2026, 9, 29, 5, 40))).toBe(20) // 80 dk kaldı → 20
    expect(sleepMinutes(a, [], at(2026, 9, 29, 6, 10))).toBe(0)
  })
  it('"Yine de çal": alarmdan 1 dk önce susar; 2 dk\'dan az kaldıysa 0', () => {
    const a = alarmOf({ at: iso(2026, 9, 29, 7, 0) })
    expect(lateSleepMinutes(a, [], at(2026, 9, 29, 6, 30))).toBe(29)
    expect(lateSleepMinutes(a, [], at(2026, 9, 29, 6, 10))).toBe(30) // sana göre 30 < 49
    expect(lateSleepMinutes(a, [], at(2026, 9, 29, 6, 58))).toBe(1) // 2 dk kaldı → 1 dk
    expect(lateSleepMinutes(a, [], at(2026, 9, 29, 6, 59))).toBe(0)
    expect(lateSleepMinutes({ ...a, sleep: 'off' }, [], at(2026, 9, 29, 6, 30))).toBe(0)
  })
})

describe('yatma saati (7 saat)', () => {
  it('sıradaki çalıştan 7 saat önce; geçtiyse yok', () => {
    const next = at(2026, 9, 29, 7, 0)
    expect(bedtimeFor(next, MON(21, 44))).toEqual(at(2026, 9, 29, 0, 0))
    expect(bedtimeFor(next, at(2026, 9, 29, 0, 30))).toBeNull()
    expect(bedtimeFor(null, MON())).toBeNull()
    expect(bedtimeFor(at(2026, 10, 3, 7, 0), MON(21, 44))).toBeNull() // Cumartesi alarmı, bu gece değil
  })
})

describe('akşam kartı', () => {
  const base = { log: [], platform: 'alarmkit', auth: 'notDetermined' }
  it('19.00\'dan önce yok; test derlemesinde 14.00', () => {
    expect(eveningCard({ ...base, now: MON(18, 59) })).toBeNull()
    expect(eveningCard({ ...base, now: MON(19) })).toEqual({ kind: 'ask' })
    expect(eveningCard({ ...base, now: MON(14), test: true })).toEqual({ kind: 'ask' })
    expect(eveningCard({ ...base, now: MON(13, 59), test: true })).toBeNull()
  })
  it('web\'de yok; iOS 26 öncesi "hatırlat"; izin reddi', () => {
    expect(eveningCard({ ...base, platform: 'web', now: MON() })).toBeNull()
    expect(eveningCard({ ...base, platform: 'notify', auth: 'prompt', now: MON() })).toEqual({ kind: 'askNotify' })
    expect(eveningCard({ ...base, auth: 'denied', now: MON() })).toEqual({ kind: 'denied', via: 'alarmkit' })
    expect(eveningCard({ ...base, platform: 'notify', auth: 'denied', now: MON() })).toEqual({ kind: 'denied', via: 'notify' })
  })
  it('alarm kuruluysa durum', () => {
    const alarm = alarmOf({ at: iso(2026, 9, 29, 7, 0) })
    expect(eveningCard({ ...base, alarm, now: MON() })).toEqual({ kind: 'set', next: at(2026, 9, 29, 7, 0) })
  })
  it('"Bu akşam değil" o akşam gizler; 3. kez → bir kez sorulur; "Çıkmasın" → hiç', () => {
    const d1 = ev('dismiss', at(2026, 9, 26, 21))
    const d2 = ev('dismiss', at(2026, 9, 27, 21))
    const d3 = ev('dismiss', MON(21, 5))
    expect(eveningCard({ ...base, log: [d1, d2], now: MON() })).toEqual({ kind: 'ask' })
    expect(eveningCard({ ...base, log: [d3], now: MON(22) })).toBeNull()
    expect(dismissStreak([d1, d2, d3])).toBe(3)
    expect(eveningCard({ ...base, log: [d1, d2, d3], now: MON(22) })).toEqual({ kind: 'pref' })
    const no = ev('cardPref', MON(22, 1), { show: false })
    expect(eveningCard({ ...base, log: [d1, d2, d3, no], now: MON(22, 2) })).toBeNull()
    expect(eveningCard({ ...base, log: [d1, d2, d3, no], now: at(2026, 9, 29, 21) })).toBeNull()
    const yes = ev('cardPref', MON(22, 1), { show: true })
    expect(eveningCard({ ...base, log: [d1, d2, d3, yes], now: at(2026, 9, 29, 21) })).toEqual({ kind: 'ask' })
  })
  it('kurulum seriyi sıfırlar; izin kartındaki Tamam sayılmaz', () => {
    const d = (day) => ev('dismiss', at(2026, 9, day, 21))
    expect(dismissStreak([d(20), d(21), ev('set', at(2026, 9, 22, 21)), d(23)])).toBe(1)
    expect(dismissStreak([d(20), ev('dismiss', at(2026, 9, 21, 21), { reason: 'denied' })])).toBe(1)
  })
})

describe('sabah', () => {
  const ring = at(2026, 9, 29, 7, 0)
  const alarm = alarmOf({ at: ring.toISOString() })
  const night = ev('sleep', at(2026, 9, 28, 23, 20), { planned: 15, seconds: 900, early: false, auto: true })
  it('soru: "Sana göre" ses kendiliğinden bittiyse; aynı çalışa bir kez', () => {
    expect(questionDue([night], ring, at(2026, 9, 29, 7, 10))).toBe(true)
    expect(questionDue([], ring, at(2026, 9, 29, 7, 10))).toBe(false)
    expect(questionDue([{ ...night, early: true }], ring, at(2026, 9, 29, 7, 10))).toBe(false)
    expect(questionDue([{ ...night, auto: false }], ring, at(2026, 9, 29, 7, 10))).toBe(false)
    expect(questionDue([night], ring, at(2026, 9, 29, 15, 1))).toBe(false) // 8 saatten sonra
    const answered = ev('morning', at(2026, 9, 29, 7, 5), { answer: 'yes', ring: ring.toISOString() })
    expect(questionDue([night, answered], ring, at(2026, 9, 29, 7, 10))).toBe(false)
  })
  it('ilk 5 sabahtan sonra haftada en çok 2, arası ≥ 3 gün', () => {
    const answers = [20, 21, 22, 23, 24].map((d) => ev('morning', at(2026, 9, d, 7, 5), { answer: 'yes', ring: iso(2026, 9, d, 7, 0) }))
    expect(questionDue([...answers, night], ring, at(2026, 9, 29, 7, 10))).toBe(false) // 24'ünden beri 5 gün, ama son 7 günde 5 cevap
    const old = [10, 11, 12, 13, 14].map((d) => ev('morning', at(2026, 9, d, 7, 5), { answer: 'yes', ring: iso(2026, 9, d, 7, 0) }))
    expect(questionDue([...old, night], ring, at(2026, 9, 29, 7, 10))).toBe(true)
    const recent = ev('morning', at(2026, 9, 27, 7, 5), { answer: 'yes', ring: iso(2026, 9, 27, 7, 0) })
    expect(questionDue([...old, recent, night], ring, at(2026, 9, 29, 7, 10))).toBe(false) // 2 gün önce sorulmuş
  })
  it('"Uyanınca": önce o, yapılınca ya da atlanınca soru', () => {
    const a = { ...alarm, wake: 'breath' }
    const now = at(2026, 9, 29, 7, 10)
    expect(morningCard({ now, alarm: a, log: [night], sessions: [] })).toEqual({ kind: 'wake', action: 'breath', ring })
    const breath = { type: 'breath', seconds: 60, date: iso(2026, 9, 29, 7, 8) }
    expect(morningCard({ now, alarm: a, log: [night], sessions: [breath] })).toEqual({ kind: 'question', ring })
    const skip = ev('wakeSkip', at(2026, 9, 29, 7, 9), { ring: ring.toISOString() })
    expect(morningCard({ now, alarm: a, log: [night, skip], sessions: [] })).toEqual({ kind: 'question', ring })
    expect(morningCard({ now: at(2026, 9, 29, 11, 30), alarm: a, log: [], sessions: [] })).toBeNull() // 4 saat geçti
    const light = { ...alarm, wake: 'light' }
    expect(morningCard({ now, alarm: light, log: [], sessions: [] })).toEqual({ kind: 'wake', action: 'light', ring })
    const lit = ev('wakeDone', at(2026, 9, 29, 7, 6), { ring: ring.toISOString(), action: 'light' })
    expect(morningCard({ now, alarm: light, log: [lit], sessions: [] })).toBeNull()
    const dalga = { ...alarm, wake: 'dalga' }
    expect(morningCard({ now, alarm: dalga, log: [], sessions: [{ type: 'dalga', mode: 'sakin', date: iso(2026, 9, 29, 7, 9) }] })).toBeNull()
  })
  it('uyanma işareti: düğme anı, yoksa 2 saat içinde ilk açılış; çalış başına bir kez', () => {
    const btn = wakeSignal({ alarm, log: [], now: at(2026, 9, 29, 7, 2), openedAt: at(2026, 9, 29, 7, 1).getTime() })
    expect(btn).toEqual({ via: 'button', ring: ring.toISOString(), at: at(2026, 9, 29, 7, 1) })
    expect(wakeSignal({ alarm, log: [], now: at(2026, 9, 29, 8, 30) })?.via).toBe('open')
    expect(wakeSignal({ alarm, log: [], now: at(2026, 9, 29, 9, 1) })).toBeNull()
    expect(wakeSignal({ alarm, log: [ev('wake', at(2026, 9, 29, 7, 1), { via: 'button', ring: ring.toISOString() })], now: at(2026, 9, 29, 7, 30) })).toBeNull()
    expect(wakeSignal({ alarm, log: [], now: at(2026, 9, 29, 6, 50) })).toBeNull() // henüz çalmadı
  })
})

describe('kurulum', () => {
  it('önceden cevaplı: ilk kez 07:00, Pzt–Cum, sana göre, varsayılan ses', () => {
    expect(setupDefaults({ now: MON(), defaultSound: DEFAULT_SOUND })).toEqual({ times: DEFAULT_TIMES, learned: false, time: 420, days: [1, 2, 3, 4, 5], sleep: 'auto', sound: DEFAULT_SOUND, wake: 'none' })
  })
  it('var olan alarm kendi ayarıyla', () => {
    const a = alarmOf({ hour: 6, minute: 40, days: [1, 3], sleep: 10, wake: 'breath', sound: 'phone' })
    const d = setupDefaults({ alarm: a, now: MON() })
    expect(d).toMatchObject({ time: 400, days: [1, 3], sleep: 10, wake: 'breath', sound: 'phone' })
  })
  it('gün yoksa tek sefer (sonraki geçiş), varsa haftalık', () => {
    const once = buildAlarm({ time: 420, days: [], sleep: 'auto', sound: 'phone', wake: 'none', kind: 'alarmkit' }, MON())
    expect(once.at).toBe(iso(2026, 9, 29, 7, 0))
    const weekly = buildAlarm({ time: 420, days: [5, 1], sleep: 'auto', sound: 'phone', wake: 'none', kind: 'alarmkit' }, MON())
    expect(weekly).toMatchObject({ on: true, hour: 7, minute: 0, days: [1, 5], at: null })
    expect(normalizeAlarm(weekly)).toEqual(weekly)
  })
})

describe('günlük ve ayar', () => {
  it('ayar ve olay yazılır/okunur; bozuk olay düşer; en çok ALARM_LOG_MAX', () => {
    const s = memStore()
    saveAlarm(alarmOf(), s)
    expect(loadAlarm(s)).toEqual(alarmOf())
    saveAlarm(null, s)
    expect(loadAlarm(s)).toBeNull()
    addAlarmEvent('dismiss', {}, MON(), s)
    addAlarmEvent('bilinmeyen', {}, MON(), s)
    expect(loadAlarmLog(s).map((e) => e.type)).toEqual(['dismiss'])
    s.setItem('gozolcum:alarm-log', JSON.stringify([null, { type: 'wake' }, ev('wake', MON(), { via: 'open' })]))
    expect(loadAlarmLog(s)).toHaveLength(1)
    for (let i = 0; i < ALARM_LOG_MAX + 5; i++) addAlarmEvent('dismiss', {}, MON(), s)
    expect(loadAlarmLog(s)).toHaveLength(ALARM_LOG_MAX)
  })
  it('depolama yoksa hata atmaz', () => {
    const broken = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') }, removeItem: () => {} }
    expect(loadAlarm(broken)).toBeNull()
    expect(loadAlarmLog(broken)).toEqual([])
    expect(() => addAlarmEvent('dismiss', {}, MON(), broken)).not.toThrow()
  })
  it('normalizeAlarm: geçersiz saat null; tanımsız alanlar varsayılana', () => {
    expect(normalizeAlarm({ hour: 25, minute: 0 })).toBeNull()
    expect(normalizeAlarm({ hour: 7, minute: 0, days: [9, 1, 1], sleep: 'x', wake: 'y' })).toMatchObject({ on: false, days: [1], sleep: 'off', wake: 'none', sound: 'phone' })
  })
})

describe('veri merkezi: İyi oluş', () => {
  const now = at(2026, 9, 29, 12)
  const log = [
    ev('set', at(2026, 9, 28, 21)),
    ev('dismiss', at(2026, 9, 27, 21)),
    ev('wake', at(2026, 9, 29, 7, 1), { via: 'button' }),
    ev('morning', at(2026, 9, 29, 7, 5), { answer: 'yes' }),
    ev('morning', at(2026, 9, 25, 7, 5), { answer: 'no' }),
  ]
  it('uyanma ve sabah cevabı olan gün başına bir kayıt; kurmak ve "Bu akşam değil" sayılmaz', () => {
    expect(alarmHabits(log).map((h) => h.date)).toEqual(['2026-09-29', '2026-09-25'])
  })
  it('İyi oluş alanına düşer, kaynak adı "Alarm"', () => {
    const habits = alarmHabits(log)
    expect(hub({ habits, now }).domains.wellbeing.habits).toEqual({ total: 2, days7: 2 })
    const m = growthMap({ habits, now })
    expect(m.domains.wellbeing.days).toBe(2)
    expect(m.domains.wellbeing.sources).toEqual([{ key: 'habit:alarm', label: 'Alarm', n: 2 }])
    expect(m.domains.body.days).toBe(0)
  })
  it('loadHubHabits: mola/su + alarm günleri', () => {
    const s = memStore()
    s.setItem('gozolcum:habit-log', JSON.stringify([{ type: 'mola', date: '2026-09-29', at: iso(2026, 9, 29, 10) }]))
    s.setItem('gozolcum:alarm-log', JSON.stringify(log))
    expect(loadHubHabits(s).map((h) => h.type)).toEqual(['mola', 'alarm', 'alarm'])
  })
})

describe('bildirim yedeği ve sesler', () => {
  it('haftalık: 7600 + gün, weekday 1 = Pazar; tek sefer 7607', () => {
    const w = fallbackNotifications(alarmOf({ days: [0, 1] }))
    expect(w.map((n) => n.id)).toEqual([FALLBACK_BASE, FALLBACK_BASE + 1])
    expect(w[0].schedule.on).toEqual({ weekday: 1, hour: 7, minute: 0 })
    expect(w[1].schedule.on.weekday).toBe(2)
    expect(w[0].interruptionLevel).toBe('timeSensitive')
    const o = fallbackNotifications(alarmOf({ at: iso(2026, 9, 29, 7, 0) }))
    expect(o).toHaveLength(1)
    expect(o[0].id).toBe(FALLBACK_ONCE)
    expect(o[0].schedule.at).toEqual(at(2026, 9, 29, 7, 0))
    expect(fallbackNotifications(alarmOf())).toEqual([])
  })
  it('ses listesi: telefonun sesi dosyasız; Dalga sesleri paketteki dosya; bilinmeyen → telefon', () => {
    expect(ALARM_SOUNDS[0]).toMatchObject({ id: 'phone', file: null })
    expect(ALARM_SOUNDS.filter((s) => s.file).map((s) => s.file)).toEqual(['nefona-dalga-sakin.caf', 'nefona-dalga-guc.caf', 'nefona-dalga-motive.caf'])
    expect(new Set(ALARM_SOUNDS.map((s) => s.id)).size).toBe(ALARM_SOUNDS.length)
    expect(soundById('yok').id).toBe('phone')
    expect(soundById(DEFAULT_SOUND).name).toBe('Dalga · Motivasyon')
  })
})

describe('v5: satır günü ve sabah önerileri', () => {
  it('dayShort: bugün · yarın · kısa gün', async () => {
    const { dayShort } = await import('./alarm.js')
    const now = new Date(2026, 8, 28, 14, 0) // Pazartesi
    expect(dayShort(new Date(2026, 8, 28, 20, 0), now)).toBe('bugün')
    expect(dayShort(new Date(2026, 8, 29, 7, 0), now)).toBe('yarın')
    expect(dayShort(new Date(2026, 9, 3, 7, 0), now)).toBe('Ct')
  })
  it('öneriler yalnız sabah uyanışlarından (04.00–11.59); öğleden sonraki deneme alarmları öneri üretmez', async () => {
    const { suggestTimes, DEFAULT_TIMES } = await import('./alarm.js')
    const now = new Date(2026, 8, 28, 21, 0)
    const set = (d, hour, minute) => ({ type: 'set', at: new Date(2026, 8, d, 15, 0).toISOString(), date: `2026-09-${d}`, hour, minute, days: [1, 2, 3, 4, 5] })
    expect(suggestTimes([set(27, 15, 40), set(28, 16, 15)], now)).toMatchObject({ times: DEFAULT_TIMES, learned: false })
    const r = suggestTimes([set(27, 15, 40), set(28, 6, 30)], now)
    expect(r.learned).toBe(true)
    expect(r.pick).toBe(6 * 60 + 30)
    expect(r.times.every((t) => t >= 4 * 60 && t < 12 * 60)).toBe(true)
  })
})

describe('v5 inceleme düzeltmeleri', () => {
  it('bu akşam alarm kapatıldıysa akşam kartı sormaz', async () => {
    const { eveningCard } = await import('./alarm.js')
    const now = new Date(2026, 8, 28, 21, 44)
    const cancel = { type: 'cancel', at: now.toISOString(), date: '2026-09-28', via: 'home' }
    expect(eveningCard({ now, alarm: null, log: [], platform: 'alarmkit', auth: 'authorized' })).toMatchObject({ kind: 'ask' })
    expect(eveningCard({ now, alarm: null, log: [cancel], platform: 'alarmkit', auth: 'authorized' })).toBeNull()
    expect(eveningCard({ now: new Date(2026, 8, 29, 21, 44), alarm: null, log: [cancel], platform: 'alarmkit', auth: 'authorized' })).toMatchObject({ kind: 'ask' })
  })
  it('komşu öneriler de sabah aralığında kalır (11:30 → 12:00 yok; 04:00 → 03:30 yok)', async () => {
    const { suggestTimes } = await import('./alarm.js')
    const now = new Date(2026, 8, 28, 21, 0)
    const set = (hour, minute) => [{ type: 'set', at: new Date(2026, 8, 27, 21, 0).toISOString(), date: '2026-09-27', hour, minute, days: [1, 2, 3, 4, 5] }]
    for (const [h, m] of [[11, 30], [4, 0]]) {
      const r = suggestTimes(set(h, m), now)
      expect(r.times).toHaveLength(3)
      expect(r.times.every((t) => t >= 4 * 60 && t < 12 * 60)).toBe(true)
    }
  })
})
