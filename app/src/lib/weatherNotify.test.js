// Sabah havası 1. katman (PLAN.v1 §3.B.4, §5.3 weatherNotify.test.js, §5.5 madde 2 ve 7). TPL şablonları yalnız
// sınama içindir (anlamsız işaretler); kullanıcı cümleleri MORNING_TEMPLATES (sabah-havasi-onay.md, beş karar).
import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'

const native = vi.hoisted(() => ({ isIOSApp: () => false, setWalkGuards: vi.fn(async () => {}) }))
vi.mock('./native.js', () => native)

import {
  planMorningWeather, composeMorning, templateProblems, normalizeMorning, hourTable, cellOf, takeLocalRefresh,
  WEATHER_IDS, CELLS, CHANCE_CELLS, LOCAL_REFRESH_ENABLED, MORNING_TEMPLATES, CHANCE_TEXT_KEY, TITLE_MAX, BODY_MAX, bandOf,
} from './weatherNotify.js'
import { createApplier } from './notifyApply.js'
import { dayKey } from './habitLog.js'

const H = 3600000
const NOW = new Date(2026, 9, 5, 6, 0) // Pazartesi 06.00
const at = (d, h, m = 0) => new Date(2026, 9, 5 + d, h, m).getTime()
const key = (d) => dayKey(new Date(2026, 9, 5 + d))

// Tahmin: bugün ve yarın için saat satırları; rainHours: [gün, saat] yağmurlu saatler (chance olasılığıyla);
// feel: saat satırlarının hissedileni (null → satırda yok, Swift'teki gibi); nowFeel: data.now.apparentC
function cache({ fetchedAt = at(0, 5, 40), rainHours = [], high = [26, 14], chance = 0.7, feel = 16.6, nowFeel = undefined } = {}) {
  const hours = []
  for (let d = 0; d <= 1; d++) for (let h = 0; h < 24; h++) {
    const t = at(d, h)
    const row = { at: t, tempC: 17.4, precipChance: rainHours.some(([a, b]) => a === d && b === h) ? chance : 0.1 }
    const f = typeof feel === 'function' ? feel(d, h) : feel
    if (f != null) row.apparentC = f
    hours.push(row)
  }
  const data = { fetchedAt, hours, days: [{ date: key(0), highC: high[0], lowC: 12 }, { date: key(1), highC: high[1], lowC: 9 }] }
  // now satırı Swift'teki gibi çekildiği saatin başı
  if (nowFeel !== undefined) data.now = { at: new Date(fetchedAt).setMinutes(0, 0, 0), tempC: 15, apparentC: nowFeel }
  return { at: new Date(fetchedAt).toISOString(), data }
}
const ON = { on: true, delayMin: 10, time: '08:00', noAlarm: 'send' }
const ALARM = { on: true, hour: 7, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], at: null }
const PLACE = { il: 'İzmir', ilce: 'Gaziemir' }
const plan = (o = {}) => planMorningWeather({ now: NOW, morning: ON, cache: cache(), place: PLACE, ...o })

// Sınama şablonları: her hücrede bir yürüyüşlü (walk) bir yürüyüşsüz; yağmur hücresi yağmurla başlar
const TPL = [
  ...CELLS.flatMap((c) => c.startsWith('rain.')
    ? [{ id: `${c}-w`, cell: c, walk: true, text: 'R {rainFrom:LOC} {rainTo:DAT}. W' }, { id: `${c}-n`, cell: c, text: 'R {rainFrom:ABL}. N' }]
    : [{ id: `${c}-w`, cell: c, walk: true, text: 'D {high}. W' }, { id: `${c}-n`, cell: c, text: 'D {high}. N' }]),
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
  it('ham plan (templates: null, yalnız sınama): textKey + hücre + değerler; varsayılan onaylı metin bağlıdır', () => {
    const n = plan({ cache: cache({ rainHours: [[0, 21]] }), templates: null }).notifications[0]
    expect(n.title).toBeUndefined()
    expect(n.body).toBeUndefined()
    expect(n.textKey).toBe('weather.morning')
    expect(n.cell).toBe('rain.cool')
    expect(n.slots).toMatchObject({ place: 'Gaziemir', temp: 17, high: 26, feel: 17, rainFrom: '21', rainTo: '22' })
    expect(cellOf(false, 14)).toBe('dry.cool')
    const t = plan({ now: new Date(at(0, 7, 30)), cache: cache({ fetchedAt: at(0, 7, 30), rainHours: [[0, 21]] }) }).notifications[0]
    expect(t.title).toBe('Gaziemir 17° · en çok 26°')
    expect(t.body).toBe('21.00–22.00 arası yağmur bekleniyor; hissedilen 17°. Şemsiyeyle hırkayı hatırlatayım.\nKaynak: Apple Weather')
  })

  it('tahminin yaşı: 1 saatten eskiyse metinde (dün akşam / bugün); tazeyse yok', () => {
    expect(plan().notifications[0].slots.age).toEqual({ day: 'today', at: '05.40' })
    expect(plan({ cache: cache({ fetchedAt: at(-1, 22, 40) }) }).notifications[0].slots.age).toEqual({ day: 'yesterday', at: '22.40' })
    expect(plan({ cache: cache({ fetchedAt: at(0, 7, 30) }), now: new Date(at(0, 7, 30)) }).notifications[0].slots.age).toBeNull()
    const n = plan({ cache: cache({ fetchedAt: at(-1, 22, 40), rainHours: [[0, 14]] }), templates: TPL }).notifications[0]
    expect(n.body.startsWith('Y 22.40 r 14.00')).toBe(true)
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
      c.data.hours = Array.from({ length: 24 }, (_, h) => ({ at: new Date(2026, 9, d, h).getTime(), tempC: 18, apparentC: 18, precipChance: h === 18 ? 0.8 : 0 }))
      const silent = planMorningWeather({ now, morning: ON, cache: c, place: PLACE, log: [{ ...log[0], date: dk }], templates: TPL }).notifications[0]
      expect(silent.walkOk).toBe(false)
      expect(silent.body.split('\n')[0].endsWith('N')).toBe(true)
    }
    expect(plan({ log: [{ date: key(0), type: 'walk', arm: 'send' }] }).notifications[0].walkOk).toBe(true)
  })

  it('uzunluk: başlık ≤ 30, gövde ≤ 110; aşarsa o gün kurulmaz (noText); uzun ilçe adında başlık yalnız sıcaklık', () => {
    const n = plan({ place: { il: 'Bursa', ilce: 'Mustafakemalpaşa' }, templates: TPL }).notifications[0]
    expect(n.title).toBe('17° · 26°')
    const long = [...TPL.filter((t) => t.cell !== 'source'), { id: 's', cell: 'source', text: 'S'.repeat(120) }]
    const over = plan({ templates: long })
    expect(over.notifications).toEqual([])
    expect(over.skipped).toContainEqual(expect.objectContaining({ date: key(0), reason: 'noText' }))
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

// Sahip onayı (docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/sabah-havasi-onay.md, 2026-10-01 "uygula")
describe('onaylı cümleler ve beş karar', () => {
  const DOC = readFileSync(new URL('../../../docs/yol-haritasi/tasarim/bildirim-hava-yuruyus/sabah-havasi-onay.md', import.meta.url), 'utf8')
  const RAIN = { yağmur: 'rain', kuru: 'dry' }
  const BAND = { soğuk: 'cold', serin: 'cool', ılık: 'mild', sıcak: 'warm', 'çok sıcak': 'hot' }
  const ROWS = DOC.split('\n').map((l) => l.match(/^\| (yağmur|kuru) × ([^|]+?) \| (.+?) \| \d+ \|$/)).filter(Boolean)
    .map(([, r, b, text]) => ({ cell: `${RAIN[r]}.${BAND[b]}`, text, feel: Number(text.match(/hissedilen (-?\d+)°/)[1]) }))
  const note = (cell, slots = {}, extra = {}) => ({
    cell, walkOk: true, extra: { date: key(0), ...extra },
    slots: { place: 'Gaziemir', temp: 17, high: 26, rainFrom: '21', rainTo: '22', age: null, ...slots },
  })

  it('10 hücrenin gövdesi onay dosyasıyla harfi harfine; başlık ve son satır', () => {
    expect(ROWS.map((r) => r.cell).sort()).toEqual([...CELLS].sort())
    for (const r of ROWS) {
      expect(bandOf(r.feel)).toBe(r.cell.split('.')[1]) // dosyadaki örnek rakam kendi hücresinin bandında
      const t = composeMorning(note(r.cell, { feel: r.feel }), MORNING_TEMPLATES)
      expect(t.title).toBe('Gaziemir 17° · en çok 26°')
      expect(t.body).toBe(`${r.text}\nKaynak: Apple Weather`)
    }
    expect(DOC).toContain('"Gaziemir 17° · en çok 26°"')
    expect(DOC).toContain('"Kaynak: Apple Weather"')
    expect(templateProblems(MORNING_TEMPLATES)).toEqual([])
    expect(MORNING_TEMPLATES.some((t) => t.walk)).toBe(false)
  })

  it('tahmin 1 saatten eskiyse "Dün/Sabah HH.MM tahminine göre" öneki, Nef notu düşer', () => {
    const y = plan({ cache: cache({ fetchedAt: at(-1, 22, 40), rainHours: [[0, 21]] }) }).notifications[0]
    expect(y.body).toBe('Dün 22.40 tahminine göre 21.00–22.00 arası yağmur bekleniyor; hissedilen 17°.\nKaynak: Apple Weather')
    const s = plan({ cache: cache({ feel: 3 }) }).notifications[0]
    expect(s.body).toBe('Sabah 05.40 tahminine göre kuru bir gün bekleniyor; hissedilen 3°, soğuk.\nKaynak: Apple Weather')
  })

  it('uzunluk en kötü değerlerle (eksi 12°, 45°; 12 harfli ad; yaş öneki): başlık ≤ 30, gövde ≤ 110, metin hep bağlanır', () => {
    const feels = { cold: [-12, 11], cool: [12, 17], mild: [18, 24], warm: [25, 29], hot: [30, 45] }
    let maxBody = 0
    for (const cell of CELLS) {
      for (const feel of feels[cell.split('.')[1]]) for (const temp of [-12, 45]) for (const high of [-12, 45])
        for (const place of ['Büyükçekmece', 'Kahramankazan', 'Gaziemir'])
          for (const age of [null, { day: 'yesterday', at: '22.40' }, { day: 'today', at: '05.40' }]) {
            const t = composeMorning(note(cell, { feel, temp, high, place, rainFrom: '21', rainTo: '22', age }), MORNING_TEMPLATES)
            expect(t).not.toBeNull()
            expect(t.title.length).toBeLessThanOrEqual(TITLE_MAX)
            expect(t.body.length).toBeLessThanOrEqual(BODY_MAX)
            maxBody = Math.max(maxBody, t.body.length)
          }
    }
    expect(maxBody).toBeGreaterThan(100) // sınır gerçekten zorlandı
  })

  it('karar 1: ≥ %60 yağmur; %30–59 "olasılık" (onaylı cümle yok → o gün kurulmaz); < %30 kuru', () => {
    const c = (p) => plan({ cache: cache({ rainHours: [[0, 15]], chance: p }) })
    expect(c(0.6).notifications[0].cell).toBe('rain.cool')
    expect(c(0.29).notifications[0].cell).toBe('dry.cool')
    for (const p of [0.3, 0.4, 0.59]) {
      const r = c(p)
      expect(r.notifications.filter((n) => n.extra.date === key(0))).toEqual([])
      expect(r.skipped).toContainEqual({ date: key(0), reason: 'noText', textKey: CHANCE_TEXT_KEY, cell: 'chance.cool' })
    }
    const raw = plan({ cache: cache({ rainHours: [[0, 15]], chance: 0.4 }), templates: null }).notifications[0]
    expect(raw).toMatchObject({ textKey: 'sky.morning.olasilik', cell: 'chance.cool', slots: { rainChance: 40, rainFrom: null } })
    expect(raw.title).toBeUndefined()
    expect(MORNING_TEMPLATES.some((t) => CHANCE_CELLS.includes(t.cell))).toBe(false)
  })

  it('karar 1: olasılık hücresi metinsiz kalsa bile notifyApply kurmaz', async () => {
    const raw = plan({ cache: cache({ rainHours: [[0, 15]], chance: 0.4 }), templates: null })
    vi.useFakeTimers({ now: NOW })
    try {
      const LN = {
        checkPermissions: async () => ({ display: 'granted' }),
        getPending: async () => ({ notifications: [] }),
        cancel: vi.fn(async () => {}),
        schedule: vi.fn(async () => {}),
        getDeliveredNotifications: async () => ({ notifications: [] }),
        removeDeliveredNotifications: vi.fn(async () => {}),
      }
      const p = createApplier(async () => ({ LN })).applyPlan({ notifications: raw.notifications })
      await vi.advanceTimersByTimeAsync(500)
      await p
      const ids = LN.schedule.mock.calls.flatMap(([a]) => a.notifications.map((n) => n.id))
      expect(ids).not.toContain(7700)
    } finally {
      vi.useRealTimers()
    }
  })

  it('karar 2: hissedilen bildirim saatindeki saatlik apparentC; now.apparentC yalnız aynı saatte; bant aynı rakamdan', () => {
    // 08.00 satırı 3°, öteki saatler 30°: bildirim 08.00 → 3°, soğuk (günün en yükseği değil)
    const n = plan({ cache: cache({ feel: (d, h) => (h === 8 ? 3 : 30) }) }).notifications[0]
    expect(n.slots.feel).toBe(3)
    expect(n.cell).toBe('dry.cold')
    // Gerçek Swift satırı (saatlik apparentC yok): 05.40'ta çekilen now değeri 08.00'e yazılmaz
    const stale = plan({ cache: cache({ feel: null, nowFeel: 24.4 }) })
    expect(stale.notifications).toEqual([])
    expect(stale.skipped).toContainEqual(expect.objectContaining({ date: key(0), reason: 'noText' }))
    // now satırının saati bildirim anını kapsıyorsa (alarm 07.00 + 10 dk, 07.01'de çekilmiş) kullanılır
    const f = plan({ now: new Date(at(0, 7, 1)), alarm: ALARM, cache: cache({ feel: null, nowFeel: 24.4, fetchedAt: at(0, 7, 1) }) }).notifications.find((x) => x.id === 7700)
    expect(f.at.getTime()).toBe(at(0, 7, 10))
    expect(f.slots.feel).toBe(24)
    expect(f.cell).toBe('dry.mild')
    const none = plan({ cache: cache({ feel: null }) })
    expect(none.notifications).toEqual([])
    expect(none.skipped).toContainEqual(expect.objectContaining({ date: key(0), reason: 'noText' }))
    // Bant sınırları (nef-bildirim.md §3.3; onay dosyası "soğuk ≤ 11"): yuvarlanmış rakam
    const bands = { 11: 'cold', 11.4: 'cold', 11.5: 'cool', 17: 'cool', 18: 'mild', 24: 'mild', 25: 'warm', 29: 'warm', 30: 'hot', [-12]: 'cold', 45: 'hot' }
    for (const [c, b] of Object.entries(bands)) expect(bandOf(Number(c))).toBe(b)
  })

  it('karar 3: ilçe adı 12 harften uzunsa başlıkta yalnız sıcaklık', () => {
    expect(plan({ place: { il: 'İstanbul', ilce: 'Büyükçekmece' } }).notifications[0].title).toBe('Büyükçekmece 17° · en çok 26°')
    expect(plan({ place: { il: 'Ankara', ilce: 'Kahramankazan' } }).notifications[0].title).toBe('17° · en çok 26°')
    expect(plan({ place: null }).notifications[0].title).toBe('17° · en çok 26°')
  })

  it('karar 4: alarmsız günde sessizlik 09.00\'dan sonra biterse bitiş dakikasında (60 dk sınırı yok)', () => {
    const q = (to) => plan({ quiet: { from: 1380, to } }).notifications[0]
    expect(q(600).at.getTime()).toBe(at(0, 10))
    expect(q(580).at.getTime()).toBe(at(0, 9, 40))
    expect(q(580).extra.shifted).toBe(true)
    expect(q(510).at.getTime()).toBe(at(0, 8, 30)) // 09.00'a dek: 15 dk adım (eski kural)
    expect(q(500).at.getTime()).toBe(at(0, 8, 30))
    expect(q(420).extra.shifted).toBeUndefined()
    // Alarma bağlı gün sessizlikten muaf
    expect(plan({ alarm: ALARM, quiet: { from: 1380, to: 600 } }).notifications[0].at.getTime()).toBe(at(0, 7, 10))
  })

  it('karar 5: bildirim saatinden sonraki 2 saat içinde açılış o günü iptal eder; önceki açılışta bildirim kalır', () => {
    const open = (h, m) => plan({ now: new Date(at(0, h, m)), cache: cache({ fetchedAt: at(0, 5, 40) }) })
    expect(open(7, 30).notifications.map((n) => n.id)).toEqual([7700])
    for (const [h, m] of [[8, 0], [8, 30], [9, 59]]) {
      const r = open(h, m)
      expect(r.notifications.some((n) => n.id === 7700)).toBe(false)
      expect(r.skipped).toContainEqual({ date: key(0), reason: 'opened' })
    }
    expect(open(10, 0).skipped).toContainEqual({ date: key(0), reason: 'past' })
    expect(open(7, 59).skipped).toContainEqual({ date: key(0), reason: 'past' }) // LEAD_MS içinde: yetişmez
    // Sessizlikle 10.00'a kaymış bildirim: 09.00 açılışı "önce"dir, bildirim kalır
    const q = plan({ now: new Date(at(0, 9)), quiet: { from: 1380, to: 600 }, cache: cache({ fetchedAt: at(0, 8, 50) }) })
    expect(q.notifications.find((n) => n.id === 7700).at.getTime()).toBe(at(0, 10))
    // "Yerelde yenilendi" bekleyeninin saatinden sonraki 2 saatte açılış: tutulmaz (notifyApply iptal eder)
    const lr = plan({ now: new Date(at(0, 8, 30)), localRefresh: { date: key(0), at: at(0, 8, 20) } })
    expect(lr.notifications.some((n) => n.id === 7700)).toBe(false)
    expect(lr.skipped).toContainEqual({ date: key(0), reason: 'opened' })
  })

  it('karar 5: iptal edilen günün bekleyen 7700\'ü notifyApply\'da iptal edilir', async () => {
    const now = new Date(at(0, 8, 30))
    const r = plan({ now, cache: cache({ fetchedAt: at(0, 5, 40) }) })
    vi.useFakeTimers({ now })
    try {
      const store = new Map([[7700, { id: 7700, title: 'x', body: 'y', schedule: { at: new Date(at(0, 8, 40)).toISOString() } }]])
      const LN = {
        checkPermissions: async () => ({ display: 'granted' }),
        getPending: async () => ({ notifications: [...store.values()] }),
        cancel: vi.fn(async ({ notifications }) => notifications.forEach(({ id }) => store.delete(id))),
        schedule: vi.fn(async ({ notifications }) => notifications.forEach((x) => store.set(x.id, x))),
        getDeliveredNotifications: async () => ({ notifications: [] }),
        removeDeliveredNotifications: vi.fn(async () => {}),
      }
      const p = createApplier(async () => ({ LN })).applyPlan({ notifications: r.notifications, grouped: true })
      await vi.advanceTimersByTimeAsync(500)
      await p
      expect(store.has(7700)).toBe(false)
      expect(LN.cancel.mock.calls.flatMap(([a]) => a.notifications.map((n) => n.id))).toContain(7700)
    } finally {
      vi.useRealTimers()
    }
  })
})
