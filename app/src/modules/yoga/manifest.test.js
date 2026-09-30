// Yoga modül kaydı (modul.md §16-B; PLAN.v3 §B.5, §D.5, §D.7). isIOSApp taklit edilir: testler web'i varsayar.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const flags = vi.hoisted(() => ({ ios: false }))
vi.mock('../../lib/native.js', async (orig) => ({ ...(await orig()), isIOSApp: () => flags.ios }))

const { default: yoga } = await import('./manifest.js')
const { registry, validateManifest } = await import('../registry.js')
const { sanitizeModules } = await import('../../lib/coachCore.js')
const { buildPath } = await import('../../lib/today.js')
const { dayKey } = await import('../../lib/calendar.js')

const NOW = new Date(2026, 9, 10, 10, 0)
const ago = (d, h = 9) => new Date(2026, 9, 10 - d, h, 0).toISOString()
const rec = (over) => ({ type: 'yoga', lesson: 2, planned: 900, seconds: 880, completed: true, reachedClosing: true, before: 6, after: 3, date: ago(0), ...over })
// İki kayıtlı gün (ölçüm dışı), haftalık E testi günü değil
const history = [{ type: 'breath', seconds: 300, date: ago(2) }, { type: 'breath', seconds: 300, date: ago(1) }]

beforeEach(() => { flags.ios = false })

describe('sözleşme', () => {
  it('geçerli; yollar; silinecek anahtarlar', () => {
    expect(validateManifest(yoga)).toEqual([])
    expect(registry.get('yoga')).toBe(yoga)
    expect(yoga.routes).toEqual(['yoga', 'yoga-1', 'yoga-2', 'yoga-3', 'yoga-5'])
    for (const r of yoga.routes) expect(registry.forRoute(r)?.id).toBe('yoga')
    expect(registry.resetKeys()).toEqual(expect.arrayContaining(['gozolcum:yoga-opts', 'gozolcum:path-later']))
    expect(yoga.gates).toEqual({})
    expect(yoga.ring).toBe('life')
    expect(yoga.kind).toBe('practice')
  })
  it('etkiler: 3 ders (1, 2, 5), her biri kendi alanında; Uykuya Geçiş\'te etki yok; better down yalnız 1 ve 2', () => {
    const e = yoga.progress.effects
    expect(e.map((x) => x.key)).toEqual(['yoga-nefes', 'yoga-nidra', 'yoga-odak'])
    expect(e.map((x) => x.domain)).toEqual(['calm', 'body', 'focus'])
    expect(e.filter((x) => x.better === 'down').map((x) => x.key)).toEqual(['yoga-nefes', 'yoga-nidra'])
    expect(e.map((x) => x.label)).toEqual(['Yoga · Nefesin Ritmi', 'Yoga · Derin Dinlenme', 'Yoga · Tek Nokta'])
    const nidra = e[1]
    expect(nidra.pick(rec())).toEqual([6, 3])
    expect(nidra.pick(rec({ lesson: 5 }))).toBeNull()
    expect(nidra.pick({ type: 'dalga', lesson: 2, before: 1, after: 2 })).toBeNull()
    const all = registry.effects().filter((x) => x.module === 'yoga')
    expect(all.find((x) => x.key === 'yoga-nidra').domain).toBe('body')
  })
  it('uyku ölçüsü yalnız sleepEase taşıyan Ders 3 kayıtlarından', () => {
    const m = yoga.progress.metrics[0]
    expect(m).toMatchObject({ key: 'yoga-uyku-dalma', domain: 'wellbeing', better: 'up' })
    const ss = [rec({ lesson: 3, sleepEase: 7 }), rec({ lesson: 3 }), rec({ lesson: 2, sleepEase: 5 })]
    expect(m.series({ sessions: ss })).toEqual([{ date: ss[0].date, value: 7 }])
  })
  it('kayıt başına alan (sessions.domainOf): Ders 1 Sakinlik, 2 Beden, 3 İyi oluş, 5 Dikkat', () => {
    expect([1, 2, 3, 5].map((n) => yoga.sessions.domainOf({ type: 'yoga', lesson: n }))).toEqual(['calm', 'body', 'wellbeing', 'focus'])
    expect(yoga.progress.domain).toBe('calm')
  })
  it('oturum geçmişi satırı; rekor kutusu yok (lib/stats.js summary().bests değişmez)', () => {
    expect(yoga.sessions.describe(rec(), { seconds: 874 })).toMatchObject({ title: 'Yoga · Derin Dinlenme' })
    expect(yoga.sessions.describe(rec(), { seconds: 874 }).detail).toMatch(/^beden gerginliği 6→3 · /)
    expect(yoga.sessions.describe(rec({ completed: false, reachedClosing: false, before: null }), { seconds: 120 }).detail).toMatch(/^yarıda kaldı · /)
    // "Kapanışa geç" ile erken bitirilen ders (kapanışa ulaştı, %60'ı doldurmadı): ekranda "Ders bitti"; geçmişte
    // "yarıda kaldı" denmez, tamamlanan sayısına da girmez
    const quick = rec({ completed: false, reachedClosing: true, quickClose: true, before: null, seconds: 330 })
    expect(yoga.sessions.describe(quick, { seconds: 330 }).detail).not.toContain('yarıda kaldı')
    expect(yoga.stats([quick], NOW)[1].value).toMatch(/^0\sders$/)
    expect(yoga.sessions.best).toBeUndefined()
    expect(yoga.sessions.bestLabel).toBeUndefined()
  })
  it('Gelişim satırları: boşken [], en çok 3 satır ve hepsi dize', () => {
    expect(yoga.stats([], NOW)).toEqual([])
    const rows = yoga.stats([rec({ date: ago(1), seconds: 900 }), rec({ date: ago(0), seconds: 480, completed: false }), rec({ date: ago(20) })], NOW)
    expect(rows).toHaveLength(3)
    for (const r of rows) {
      expect(typeof r.label).toBe('string')
      expect(typeof r.value).toBe('string')
    }
    expect(rows.map((r) => r.value)).toEqual(['23 dk', '1 ders', '2 gün'])
  })
  it('Nef: son 7 günde yoga yoksa null; varsa yalnız dört sayı ve süzgeçten değişmeden geçer', () => {
    expect(yoga.coach([], NOW)).toBeNull()
    expect(yoga.coach([rec({ date: ago(9) })], NOW)).toBeNull()
    const c = yoga.coach([rec({ date: ago(1) }), rec({ date: ago(0), completed: false, seconds: 60 })], NOW)
    expect(c).toEqual({ sessions7: 2, minutes7: 16, completed7: 1, days7: 2 })
    expect(sanitizeModules({ yoga: c })).toEqual({ yoga: c })
  })
})

describe('web: yoga görünmez (PLAN.v3 §D.7)', () => {
  it('Pratikler listesinde ve mola listesinde yok; yol durağı yok', () => {
    flags.ios = false
    expect(yoga.home).toBeUndefined()
    expect(registry.inSection('practice').map((m) => m.id)).not.toContain('yoga')
    expect(yoga.today({ tests: [], sessions: [...history, rec()], now: NOW })).toBeNull()
    const p = buildPath(registry.live, { tests: [], sessions: [...history, rec()], now: NOW })
    expect(p.stops.map((s) => s.id)).not.toContain('yoga')
  })
})

describe('iPhone uygulaması', () => {
  it('Pratikler: "Yoga" kutucuğu Nefes ile Dalga arasında', () => {
    flags.ios = true
    expect(yoga.home).toEqual({ section: 'practice', order: 33 })
    const ids = registry.inSection('practice').map((m) => m.id)
    expect(ids.indexOf('yoga')).toBe(ids.indexOf('breath') + 1)
    expect(ids.indexOf('dalga')).toBe(ids.indexOf('yoga') + 1)
  })
  it('yalnız Ders 2 · 15 dk yayımlıyken kısa ve tam günlerde durak yok (3 ve 5 dk\'lık ders yok)', () => {
    flags.ios = true
    for (let d = 0; d < 14; d++) {
      const now = new Date(2026, 9, 10 + d, 10, 0)
      expect(yoga.today({ tests: [], sessions: history, now }), `gün ${d}`).toBeNull()
    }
  })
  it('bugün kütüphaneden tamamlanan ders yolda "tamam" görünür; "Sonra yaparım" yalnız bugün', () => {
    flags.ios = true
    const stop = yoga.today({ tests: [], sessions: [...history, rec()], now: NOW })
    expect(stop).toMatchObject({ title: 'Yoga', sub: 'Derin Dinlenme', route: 'yoga-2', slot: 'practice', order: 105, glyph: 'lotus', done: true, yields: true, later: false })
    expect(stop.dropRank).toBeUndefined()
    expect(stop.stage).toMatchObject({ lesson: 2, minutes: 5, full: true })
    expect(yoga.today({ tests: [], sessions: [...history, rec()], now: NOW, later: { day: dayKey(NOW), later: ['yoga'] } }).later).toBe(true)
    expect(yoga.today({ tests: [], sessions: [...history, rec()], now: NOW, later: { day: '2026-10-09', later: ['yoga'] } }).later).toBe(false)
  })
  it('1. ve 2. kayıtlı günde yol durağı yok (kilit açılışı 3. gün)', () => {
    flags.ios = true
    expect(yoga.today({ tests: [], sessions: [rec({ date: ago(0) })], now: NOW })).toBeNull()
    expect(yoga.today({ tests: [], sessions: [history[1], rec()], now: NOW })).toBeNull()
  })
  it('yoga yoldayken öteki duraklar web yoluyla birebir aynı (yoga hiçbir durağı düşürmez)', () => {
    const ctx = { tests: [], sessions: [...history, rec()], now: NOW }
    const key = (s) => `${s.key}|${s.minutes}|${s.done}|${s.slot}`
    flags.ios = false
    const web = buildPath(registry.live, ctx).stops.map(key)
    flags.ios = true
    const ios = buildPath(registry.live, ctx).stops.filter((s) => s.id !== 'yoga').map(key)
    expect(ios).toEqual(web)
  })
})
