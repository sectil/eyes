// Nef planlayıcısı (lib/nef/notify.js; Nef PLAN §4.2, §4.3, §4.5). Kuralların çoğu planAll üzerinden de sınanır
// (notifyAll.test.js "Nef"); burada saf planNef ve hafıza bağı.
import { describe, it, expect } from 'vitest'
import { planNef, enrichable, walkFactOf, forecastOf, NEF_ID, NEF_ID_LAST, SOURCE_LINE, F1_BODY_MAX, OWN_LEAD_MIN } from './notify.js'
import { NOTIFY_DAY_MAX, NOTIFY_WEEK_MAX, TITLE_MAX, BODY_MAX } from './speak.js'
import { syncPlannedNotify, loadSaid, recordSaid, notifyCounts } from './memory.js'
import { cells } from './bank/tr.js'

const H = 3600000
// Perşembe 1 Ekim 2026, 08.00 (yerel)
const NOW = new Date(2026, 9, 1, 8, 0)
const D0 = new Date(2026, 9, 1)
const at = (h, m = 0, d = 0) => new Date(2026, 9, 1 + d, h, m)
const key = (d = 0) => {
  const x = new Date(2026, 9, 1 + d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
// sky.js önbelleği: bugün ve yarın saatlik; rain [başlangıç, bitiş) saat (bugün), feels { saat: derece }
function cache({ rain = [19, 22], feels = {}, fetched = at(7) } = {}) {
  const hours = Array.from({ length: 48 }, (_, h) => ({
    at: new Date(2026, 9, 1 + Math.floor(h / 24), h % 24).getTime(),
    tempC: 20,
    apparentC: feels[h] ?? 20,
    precipChance: rain && h >= rain[0] && h < rain[1] ? 0.8 : 0.1,
  }))
  return { at: fetched.toISOString(), data: { hours, days: [] } }
}
const reminders = (o = {}) => ({ optIn: 'yes', types: { walk: { on: true, time: '19:30', days: [0, 1, 2, 3, 4, 5, 6], ...o } } })
const run = (o = {}) => planNef({ now: NOW, notifications: [], reminders: reminders(), weather: { cache: cache() }, log: [], nef: { rows: [] }, ...o })
const own = (r) => r.notifications.filter((n) => n.id >= NEF_ID && n.id <= NEF_ID_LAST)
const row = (d, o = {}) => ({ at: d.toISOString(), date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, type: 'rainOnWalk', key: `k${d.getTime()}`, id: 'X', channel: 'notify', ...o })
const ids = (cell) => cells[cell].map((t) => t.id)
const weatherN = (o = {}) => ({ id: 7700, at: at(8, 10), type: 'weather', textKey: 'weather.morning', title: 'Gaziemir 17° · en çok 26°', body: '19.00–22.00 arası yağmur bekleniyor; hissedilen 17°. Şemsiyeyi hatırlatayım.\nKaynak: Apple Weather', extra: { kind: 'weather', date: key(), alarm: true }, level: 'active', ...o })

describe('kaynaklar: olgular mevcut veriden', () => {
  it('yürüyüş saati yalnız kurulu yürüyüş hatırlatmasından (ana anahtar, tür, gün)', () => {
    expect(walkFactOf(reminders(), D0)).toEqual({ at: 1170, source: 'remind' })
    expect(walkFactOf({ ...reminders(), optIn: null }, D0)).toBeNull()
    expect(walkFactOf(reminders({ on: false }), D0)).toBeNull()
    expect(walkFactOf(reminders({ days: [1] }), D0)).toBeNull() // Perşembe seçili değil
    expect(walkFactOf(null, D0)).toBeNull()
  })
  it('tahmin sky.js önbelleğinden', () => {
    expect(forecastOf(cache())).toMatchObject({ fetchedAt: at(7).getTime() })
    expect(forecastOf(null)).toBeNull()
    expect(forecastOf({ at: 'x', data: { hours: [] } })).toBeNull()
  })
})

describe('Nef\'in kendi bildirimi (7900–7919)', () => {
  it('yağmur yürüyüşe denk: tek bildirim, kimlik 7900, yürüyüşten ya da yağmurdan 2 sa önce, F1 metni + kaynak satırı', () => {
    const r = run()
    const [n] = own(r)
    expect(own(r)).toHaveLength(1)
    expect(n.id).toBe(NEF_ID)
    expect(n.at).toEqual(at(17)) // min(19.30, 19.00) − 120 dk
    expect(OWN_LEAD_MIN).toBe(120)
    expect(n.extra).toMatchObject({ kind: 'nef', type: 'rainOnWalk', date: key(), route: 'home' })
    expect(ids('F1.E')).toContain(n.extra.text)
    expect(ids('F1.T')).toContain(n.extra.title)
    expect(n.body.endsWith(`\n${SOURCE_LINE}`)).toBe(true)
    expect([...n.title].length).toBeLessThanOrEqual(TITLE_MAX)
    expect([...n.body].length).toBeLessThanOrEqual(BODY_MAX)
    expect(F1_BODY_MAX).toBe(BODY_MAX - 22)
    expect(n.body).toMatch(/19\.30'da\. Bugün yağmur 19\.00'da bekleniyor; 18\.00'de/)
    expect(r.said).toEqual([expect.objectContaining({ type: 'rainOnWalk', channel: 'notify', notifyId: NEF_ID, at: at(17).toISOString(), date: key(), mode: 'own' })])
  })

  it('olgu yoksa hiçbir şey eklenmez ve liste aynı nesnedir: yağmur yok, yürüyüş saati yok, tahmin eski, nef girdisi yok', () => {
    const list = [weatherN({ id: 7801, extra: { kind: 'remind', module: 'snake', date: key() } })]
    for (const o of [
      { weather: { cache: cache({ rain: null }) } },
      { reminders: reminders({ on: false }) },
      { weather: { cache: cache({ fetched: new Date(NOW.getTime() - 19 * H) }) } }, // 17.00'de 28 saatlik
      { nef: null },
      { weather: null },
      { nef: { rows: [], lang: 'en' } }, // bankası olmayan dil: susar
    ]) {
      const r = run({ notifications: list, ...o })
      expect(r.changed).toBe(false)
      expect(r.notifications).toBe(list)
      expect(r.said).toEqual([])
    }
  })

  it(`bütçe: günde en çok ${NOTIFY_DAY_MAX}, son 7 günde en çok ${NOTIFY_WEEK_MAX} (speak.js; tek kaynak)`, () => {
    expect(own(run({ nef: { rows: [row(at(7, 0))] } }))).toHaveLength(0) // bugün bir tane söylendi
    const four = [1, 2, 3, 5].map((d) => row(new Date(2026, 9, 1 - d, 18)))
    expect(own(run({ nef: { rows: four } }))).toHaveLength(0)
    expect(own(run({ nef: { rows: four.slice(1) } }))).toHaveLength(1)
    // 7 gün önceki satır sayılmaz (kayan 7 gün, bugün dahil)
    expect(own(run({ nef: { rows: [...four.slice(1), row(new Date(2026, 9, 1 - 7, 18))] } }))).toHaveLength(1)
    // Kart satırı bildirim bütçesine sayılmaz ama aynı olgu bir kez: bugün kartta söylenen yağmur bildirimle gelmez
    expect(own(run({ nef: { rows: [row(at(7, 30), { channel: 'card', key: `rainOnWalk:${key()}` })] } }))).toHaveLength(0)
  })

  it('iki günlük ufukta bütçe birlikte sayılır: yarın, bugünkü planlı bildirim de sayılır; gün başına bir kimlik', () => {
    // Şimdi 11.00, önbellek 11.00: yürüyüş 21.00; bugün yağmur 14–21 (bildirim 12.00), yarın 07–21 (bildirim 05.00, 18 sa)
    const now = at(11)
    const c = cache({ rain: [14, 21], fetched: now })
    for (const h of c.data.hours) if (h.at >= at(7, 0, 1).getTime() && h.at < at(21, 0, 1).getTime()) h.precipChance = 0.8
    const go = (rows) => planNef({ now, notifications: [], reminders: reminders({ time: '21:00' }), weather: { cache: c }, nef: { rows } })
    const two = own(go([2, 3].map((d) => row(new Date(2026, 9, 1 - d, 18)))))
    expect(two.map((n) => [n.id, n.at.getTime()])).toEqual([[NEF_ID, at(12).getTime()], [NEF_ID + 1, at(5, 0, 1).getTime()]])
    // Son 7 günde 3 satır: bugünkü planlı bildirim dördüncü olur, yarınki beşinci olacağı için kurulmaz
    const three = own(go([2, 3, 4].map((d) => row(new Date(2026, 9, 1 - d, 18)))))
    expect(three.map((n) => n.id)).toEqual([NEF_ID])
  })

  it('saati gelmemiş (planlanmış) satırlar yok sayılır: plan yeniden kurulunca aynı karar', () => {
    const first = run()
    const rows = syncPlannedNotify(first.said, { storage: mem(), now: NOW })
    expect(rows).toHaveLength(1)
    const again = run({ nef: { rows } })
    expect(own(again).map((n) => [n.id, n.at.getTime(), n.title, n.body])).toEqual(own(first).map((n) => [n.id, n.at.getTime(), n.title, n.body]))
    // Saat geçtikten sonra (gönderilmiş sayılır) bugün yeni bildirim yok
    expect(own(planNef({ now: at(17, 30), reminders: reminders(), weather: { cache: cache() }, nef: { rows } }))).toHaveLength(0)
  })

  it('kişi bugünkü yolunu bitirdiyse Nef bildirimi yok; deneyin sessiz yürüyüş gününde de yok', () => {
    const r = run({ nef: { rows: [], pathDoneToday: true } })
    expect(own(r)).toHaveLength(0)
    expect(r.skipped).toContainEqual({ module: 'nef', date: key(), time: null, reason: 'pathDone' })
    const s = run({ log: [{ date: key(), type: 'walk', arm: 'silent' }] })
    expect(own(s)).toHaveLength(0)
    expect(s.skipped.map((x) => x.reason)).toContain('experiment')
    expect(own(run({ log: [{ date: key(), type: 'walk', arm: 'send' }] }))).toHaveLength(1)
  })

  it('düşük WHO-5 ve uzun aradan dönüş gününde bildirim yok', () => {
    expect(own(run({ nef: { rows: [], who5Low: true } }))).toHaveLength(0)
    expect(own(run({ nef: { rows: [], appGapDays: 6 } }))).toHaveLength(0)
  })

  it('kurallar (blocked): yer yoksa 15 dk adımla geriye, sonra ileri; hiçbiri yoksa kurulmaz', () => {
    const blocked = (ms) => (ms >= at(16).getTime() && ms <= at(18).getTime() ? 'focus' : null)
    const r = run({ rules: { blocked } })
    expect(own(r)[0].at).toEqual(at(15, 45))
    const none = run({ rules: { blocked: () => 'night' } })
    expect(own(none)).toHaveLength(0)
    expect(none.skipped.map((x) => x.reason)).toContain('night')
  })

  it('öteki bildirimlere ≥ 30 dk, 74xx\'e ≥ 60 dk; bekleyen payı yoksa kurulmaz', () => {
    const other = { id: 7801, at: at(17, 10), type: 'remind', title: 'a', body: 'b', extra: { kind: 'remind', module: 'snake', date: key() } }
    expect(own(run({ notifications: [other] }))[0].at).toEqual(at(16, 30))
    const nudge = { id: 7413, at: at(17, 20), type: 'walk', title: 'a', body: 'b', extra: { kind: 'nudge' } }
    expect(own(run({ notifications: [nudge] }))[0].at).toEqual(at(16, 15))
    const full = run({ rules: { room: 0 } })
    expect(own(full)).toHaveLength(0)
    expect(full.skipped.map((x) => x.reason)).toContain('pending')
  })

  it('sıcak yalnız kartta: yağmurla aynı saatte hissedilen 31 bildirime girmez', () => {
    const n = own(run({ weather: { cache: cache({ feels: { 17: 31, 18: 31, 19: 31 } }) } }))[0]
    expect(n).toBeDefined()
    expect(n.body).not.toMatch(/derece|issedilen|°/)
  })
})

describe('F1 metin zenginleştirme', () => {
  it('sabah havası (7700): kimlik, saat, tür ve extra aynı; metin F1; kendi bildirimi eklenmez (günde tek hava cümlesi)', () => {
    const w = weatherN()
    const r = run({ notifications: [w] })
    expect(own(r)).toHaveLength(0)
    const n = r.notifications.find((x) => x.id === 7700)
    expect(n.at).toBe(w.at)
    expect(n.type).toBe('weather')
    expect(n.extra).toMatchObject(w.extra)
    expect(n.extra.nef).toMatchObject({ type: 'rainOnWalk', key: `rainOnWalk:${key()}` })
    expect(ids('F1.T')).toContain(n.extra.nef.title)
    expect(n.title).not.toBe(w.title)
    expect(n.body.endsWith(`\n${SOURCE_LINE}`)).toBe(true)
    expect([...n.body].length).toBeLessThanOrEqual(BODY_MAX)
    expect(r.said).toEqual([expect.objectContaining({ notifyId: 7700, mode: 'enrich', at: w.at.toISOString() })])
  })

  it('zenginleşen bildirim bütçeye sayılır: bütçe doluysa sabah havası kendi metniyle kalır, Nef susar', () => {
    const w = weatherN()
    const r = run({ notifications: [w], nef: { rows: [row(at(7))] } })
    expect(r.notifications.find((x) => x.id === 7700)).toBe(w)
    expect(own(r)).toHaveLength(0)
    expect(r.skipped.map((x) => x.reason)).toContain('weatherDay')
  })

  it('kural dışı saatteki (sessizlik, oturum) sabah havası zenginleşmez; yerine Nef bildirimi de gelmez', () => {
    const w = weatherN()
    const r = run({ notifications: [w], rules: { blocked: (ms) => (ms === w.at.getTime() ? 'night' : null) } })
    expect(r.notifications.find((x) => x.id === 7700)).toBe(w)
    expect(own(r)).toHaveLength(0)
  })

  it('74xx, 75xx, 7860–7867 ve başka modülün hatırlatması hiç zenginleşmez; yürüyüş modülünün 78xx\'i zenginleşir', () => {
    const base = { title: 'Biraz yürüyelim mi?', body: 'Koridorda ya da sokakta birkaç dakika yeter.', level: 'active' }
    const fixed = [
      { id: 7413, at: at(15), type: 'walk', ...base, extra: { kind: 'nudge', type: 'walk', date: key() } },
      { id: 7500, at: at(14), type: 'focus', ...base, extra: { kind: 'focus' } },
      { id: 7862, at: at(13), type: 'walk', ...base, extra: { kind: 'nudge', type: 'walk', date: key(), slot: 0 } },
      { id: 7801, at: at(12), type: 'remind', module: 'snake', ...base, extra: { kind: 'remind', module: 'snake', date: key() } },
    ]
    for (const n of fixed) expect(enrichable(n)).toBe(false)
    const r = run({ notifications: fixed.map((n) => ({ ...n })) })
    for (const n of fixed) expect(r.notifications.find((x) => x.id === n.id)).toEqual(n)
    expect(own(r)).toHaveLength(1) // zenginleşecek bildirim yok: Nef'in kendi bildirimi
    const walkR = { id: 7803, at: at(16), type: 'remind', module: 'walk', ...base, extra: { kind: 'remind', module: 'walk', date: key(), evidence: 'klasnja2019', sci: true } }
    const e = run({ notifications: [...fixed, walkR] })
    const got = e.notifications.find((x) => x.id === 7803)
    expect(got.at).toBe(walkR.at)
    expect(got.extra).toMatchObject({ kind: 'remind', module: 'walk', evidence: 'klasnja2019' })
    expect(got.extra.sci).toBeUndefined() // bilim satırı gövdeyle gitti
    expect(got.body).not.toBe(walkR.body)
    expect(own(e)).toHaveLength(0)
    for (const n of fixed) expect(e.notifications.find((x) => x.id === n.id)).toEqual(n)
  })

  it('metni bağlanmamış (yalnız textKey) ve "yerelde yenilenmiş" bildirim zenginleşmez', () => {
    expect(enrichable({ id: 7700, at: at(8), textKey: 'weather.morning', extra: { kind: 'weather' } })).toBe(false)
    expect(enrichable(weatherN({ keepPending: true }))).toBe(false)
    expect(enrichable(weatherN())).toBe(true)
  })
})

describe('hafıza bağı (memory.syncPlannedNotify)', () => {
  it('saati gelmemiş eski kararlar silinir, yenileri yazılır; geçmiş satırlar ve kart satırları kalır; bütçe sayacı tek', () => {
    const storage = mem()
    recordSaid({ type: 'rainOnWalk', key: 'eski', id: 'F1E-1', channel: 'notify' }, { storage, now: at(17, 0, -2) })
    recordSaid({ type: 'silentDay', key: 's', id: 'F4A-1', channel: 'card' }, { storage, now: at(7) })
    syncPlannedNotify([{ type: 'rainOnWalk', key: 'k1', id: 'F1E-4', at: at(17).toISOString(), date: key() }], { storage, now: NOW })
    syncPlannedNotify([{ type: 'rainOnWalk', key: 'k2', id: 'F1E-5', at: at(16, 45).toISOString(), date: key() }], { storage, now: NOW })
    const rows = loadSaid({ storage, now: NOW })
    expect(rows.map((r) => r.key)).toEqual(['eski', 's', 'k2'])
    expect(notifyCounts(rows, at(18))).toEqual({ day: 1, week: 2 })
  })
})

function mem() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}
