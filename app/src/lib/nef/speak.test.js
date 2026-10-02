import { describe, it, expect } from 'vitest'
import { speak, NOTIFY_DAY_MAX, NOTIFY_WEEK_MAX, TITLE_MAX, BODY_MAX } from './speak.js'
import { buildMoments } from './moments.js'
import { prune } from './memory.js'
import tr, { cells } from './bank/tr.js'

const NOW = new Date(2026, 9, 1, 8, 0)
const H = 3600000
const dayStart = new Date(2026, 9, 1).getTime()
function forecast({ rain = null, feels = {} } = {}) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ at: dayStart + h * H, precipChance: rain && h >= rain[0] && h < rain[1] ? 0.8 : 0.1, apparentC: feels[h] ?? 22 }))
  return { fetchedAt: NOW.getTime() - H, hours }
}
const lexicon = {
  names: {
    dalga: { '': 'Dalga sesi', ABL: 'Dalga sesinden', ACC: 'Dalga sesini', DAT: 'Dalga sesine' },
    snake: { '': 'Yılan oyunu', ACC: 'Yılan oyununu', LOC: 'Yılan oyununda', INS: 'Yılan oyunuyla', DAT: 'Yılan oyununa' },
    'tek-bakis': { '': 'Tek Bakışta oyunu', LOC: 'Tek Bakışta oyununda', ACC: 'Tek Bakışta oyununu', DAT: 'Tek Bakışta oyununa' },
  },
  metrics: { 'tek-bakis-span': { word: 'kavradığın harf sayısı', unit: 'harf' } },
}
const rainCtx = (o = {}) => ({ now: NOW, walk: { at: 1170, source: 'habit', weekCount: 3 }, forecast: forecast({ rain: [19, 22] }), path: { has: true, doneToday: false }, ...o })
const say = (o) => speak({ bank: tr, lang: 'tr', now: NOW, lexicon, ...o })
const ch = (out, c) => out.find((x) => x.channel === c)
const ids = (cell) => cells[cell].map((t) => t.id)
// Hafıza satırı (yerel saat)
const said = (d, o) => ({ at: d.toISOString(), date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, channel: 'card', ...o })
const daysAgo = (n, h = 10) => new Date(2026, 9, 1 - n, h, 0)

describe('dil', () => {
  it('banka istenen dilde değilse susar; başka dile düşmez', () => {
    const moments = buildMoments(rainCtx())
    expect(speak({ moments, bank: tr, lang: 'en', now: NOW, lexicon })).toEqual([])
    expect(speak({ moments, bank: null, lang: 'tr', now: NOW })).toEqual([])
  })
})

describe('bildirim', () => {
  it('yağmur: başlık F1.T, gövde F1.A; kart sıradaki anı söyler', () => {
    const out = say({ moments: buildMoments(rainCtx({ forecast: forecast({ rain: [19, 22], feels: { 18: 31 } }) })) })
    const n = ch(out, 'notify')
    expect(n.type).toBe('rainOnWalk')
    expect(ids('F1.A')).toContain(n.id)
    expect(ids('F1.T')).toContain(n.titleId)
    expect(n.title.length).toBeLessThanOrEqual(TITLE_MAX)
    expect(n.text.length).toBeLessThanOrEqual(BODY_MAX)
    expect(n.text).toMatch(/19\.00'da bekleniyor/)
    // Sıcaklık notu kartta, bildirimde değil (sahip kararı)
    const c = ch(out, 'card')
    expect(c).toMatchObject({ type: 'hotWalk', cell: 'F3.A', label: 'Nef' })
    expect(c.text).toMatch(/^(O saatte h|H)issedilen 31 derece/)
    expect(n.text).not.toMatch(/derece/)
  })

  it('notifyBodyMax: gövde sınırı daralınca sığmayan cümle seçilmez; hiçbiri sığmazsa bildirim yok (kart etkilenmez)', () => {
    const moments = buildMoments(rainCtx({ walk: { at: 1170, source: 'remind' } }))
    const n = ch(say({ moments, notifyBodyMax: 88 }), 'notify')
    expect(n).toBeDefined()
    expect([...n.text].length).toBeLessThanOrEqual(88)
    const none = say({ moments, notifyBodyMax: 20 })
    expect(ch(none, 'notify')).toBeUndefined()
    expect(ch(none, 'card')).toBeDefined()
  })

  it('gece 01–05 bildirim yok', () => {
    const moments = buildMoments(rainCtx())
    expect(ch(say({ moments, notifyAt: new Date(2026, 9, 1, 1, 0) }), 'notify')).toBeUndefined()
    expect(ch(say({ moments, notifyAt: new Date(2026, 9, 1, 4, 59) }), 'notify')).toBeUndefined()
    expect(ch(say({ moments, notifyAt: new Date(2026, 9, 1, 5, 0) }), 'notify')).toBeDefined()
    expect(ch(say({ moments, notifyAt: new Date(2026, 9, 1, 0, 59) }), 'notify')).toBeDefined()
  })

  it('yolunu bitirdiyse bildirim yok (an motoru ve seçici ayrı ayrı)', () => {
    const done = buildMoments(rainCtx({ path: { has: true, doneToday: true, doneDays: 1 } }))
    const out = say({ moments: done })
    expect(ch(out, 'notify')).toBeUndefined()
    expect(ch(out, 'card').type).toBe('rainOnWalk') // kartta kalır
    expect(ch(say({ moments: buildMoments(rainCtx()), pathDone: true }), 'notify')).toBeUndefined()
  })

  it(`bütçe: günde ${NOTIFY_DAY_MAX}, son 7 günde ${NOTIFY_WEEK_MAX}`, () => {
    const moments = buildMoments(rainCtx())
    const today = [said(new Date(2026, 9, 1, 7, 0), { type: 'rainOnWalk', channel: 'notify', key: 'eski', id: 'X' })]
    expect(ch(say({ moments, rows: prune(today, NOW) }), 'notify')).toBeUndefined()
    const four = [1, 2, 4, 6].map((d) => said(daysAgo(d), { type: 'rainOnWalk', channel: 'notify', key: `k${d}`, id: `X${d}` }))
    expect(ch(say({ moments, rows: prune(four, NOW) }), 'notify')).toBeUndefined()
    const three = [1, 2, 4].map((d) => said(daysAgo(d), { type: 'rainOnWalk', channel: 'notify', key: `k${d}`, id: `X${d}` }))
    expect(ch(say({ moments, rows: prune(three, NOW) }), 'notify')).toBeDefined()
    const old = [1, 2, 4, 7].map((d) => said(daysAgo(d), { type: 'rainOnWalk', channel: 'notify', key: `k${d}`, id: `X${d}` }))
    expect(ch(say({ moments, rows: prune(old, NOW) }), 'notify')).toBeDefined() // 7 gün önceki pencere dışında
  })

  it('uzunluk: başlık > 30 ya da gövde > 110 aday seçilmez', () => {
    const fake = {
      lang: 'tr',
      label: 'Nef',
      render: (t) => t,
      cells: { 'F1.A': [{ id: 'L1', text: 'x'.repeat(BODY_MAX + 1) }, { id: 'L2', text: 'kısa gövde' }], 'F1.T': [{ id: 'T1', text: 'y'.repeat(TITLE_MAX + 1) }, { id: 'T2', text: 'kısa başlık' }] },
    }
    const moments = buildMoments(rainCtx())
    for (let i = 0; i < 5; i++) {
      const n = ch(speak({ moments, bank: fake, lang: 'tr', now: new Date(2026, 9, 1 + i, 8) }), 'notify')
      expect([n.id, n.titleId]).toEqual(['L2', 'T2'])
    }
    const long = { ...fake, cells: { ...fake.cells, 'F1.A': [fake.cells['F1.A'][0]] } }
    expect(ch(speak({ moments, bank: long, lang: 'tr', now: NOW }), 'notify')).toBeUndefined()
    const longT = { ...fake, cells: { ...fake.cells, 'F1.T': [fake.cells['F1.T'][0]] } }
    expect(ch(speak({ moments, bank: longT, lang: 'tr', now: NOW }), 'notify')).toBeUndefined()
  })

  it("onaylı ama 110'u aşan cümle bildirimde hiç seçilmez, kartta seçilebilir (F1C-7)", () => {
    const moments = buildMoments(rainCtx({ forecast: forecast({ rain: [17, 22] }) }))
    expect(moments[0].cell).toBe('F1.C')
    const rows = prune(['F1C-5', 'F1C-6', 'F1C-10'].map((id) => said(daysAgo(3), { type: 'x', id })), NOW)
    const out = say({ moments, rows })
    expect(ch(out, 'notify')).toBeUndefined()
    expect(ch(out, 'card')).toMatchObject({ id: 'F1C-7', type: 'rainOnWalk' })
    expect(ch(out, 'card').text.length).toBeGreaterThan(BODY_MAX)
  })

  it('onaylı başlıklardan 30 karakteri aşanlar (F1T-8: 32, F1T-9: 34) seçilmez', () => {
    const long = cells['F1.T'].filter((t) => [...tr.render(t.text, {}, null)].length > TITLE_MAX).map((t) => t.id)
    expect(long).toEqual(['F1T-8', 'F1T-9'])
    const moments = buildMoments(rainCtx())
    for (let d = 0; d < 30; d++) {
      const n = ch(say({ moments, now: new Date(2026, 9, 1 + d, 8), notifyAt: new Date(2026, 9, 1 + d, 8) }), 'notify')
      expect(long).not.toContain(n.titleId)
    }
  })

  it('F1.D: son 7 günde yağmur söylendiyse "bugün de"; tükenirse F1.A ve F1.E (koşulu tutanlar)', () => {
    const moments = buildMoments(rainCtx())
    const before = said(daysAgo(3), { type: 'rainOnWalk', channel: 'notify', key: 'rainOnWalk:old', id: 'F1A-3' })
    const n = ch(say({ moments, rows: prune([before], NOW) }), 'notify')
    expect(ids('F1.D')).toContain(n.id)
    const used = ['F1D-5', 'F1D-8'].map((id) => said(daysAgo(2), { type: 'x', id }))
    const n2 = ch(say({ moments, rows: prune([before, ...used], NOW) }), 'notify')
    expect([...ids('F1.A'), 'F1E-4']).toContain(n2.id) // F1E-1/5/8 hatırlatma iddia eder: alışkanlıkta seçilmez
    expect(n2.id).not.toBe('F1A-3') // 21 gün
  })
})

describe('susma', () => {
  const evening = new Date(2026, 9, 8, 20, 0)
  const effects = [{ key: 'dalga-sakin', module: 'dalga', measure: 'sakinlik', pick: (s) => (s.type === 'dalga' ? [s.before, s.after] : null) }]
  const sessions = [{ type: 'dalga', date: new Date(2026, 9, 1, 19, 30).toISOString(), before: 4, after: 7 }]
  const moments = buildMoments({ now: evening, effects, sessions, path: { has: true, doneToday: false } })

  it('hücre tükenince an susar; başka hücreye düşmez, sıradaki an (sessiz gün) konuşur', () => {
    const first = ch(speak({ moments, bank: tr, lang: 'tr', now: evening, lexicon }), 'card')
    expect(first.cell).toBe('F2.A')
    const rows = prune(ids('F2.A').map((id) => said(new Date(2026, 9, 5, 9), { type: 'x', id })), evening)
    const out = speak({ moments, rows, bank: tr, lang: 'tr', now: evening, lexicon })
    expect(ch(out, 'card')).toMatchObject({ type: 'silentDay', cell: 'F4.A' })
    expect(out.some((x) => ['F2.B', 'F2.C', 'F2.D'].includes(x.cell))).toBe(false)
  })

  it('sessiz gün cümleleri de tükenirse kart boş', () => {
    const rows = prune([...ids('F2.A'), ...ids('F4.A')].map((id) => said(new Date(2026, 9, 5, 9), { type: 'x', id })), evening)
    expect(speak({ moments, rows, bank: tr, lang: 'tr', now: evening, lexicon })).toEqual([])
  })

  it('ad bilinmiyorsa cümle kurulmaz, an susar', () => {
    const m = buildMoments({ now: NOW, firsts: [{ module: 'track', kind: 'day' }] })
    expect(ch(say({ moments: m }), 'card').type).toBe('silentDay')
  })

  it('hafıza: olgu söylendiyse, tür dün kartta geldiyse ya da dinleniyorsa an atlanır', () => {
    const key = moments.find((m) => m.type === 'recallEffect').key
    const s = (rows) => ch(speak({ moments, rows: prune(rows, evening), bank: tr, lang: 'tr', now: evening, lexicon }), 'card').type
    expect(s([said(new Date(2026, 9, 2, 9), { type: 'recallEffect', key, id: 'Z' })])).toBe('silentDay')
    expect(s([said(new Date(2026, 9, 7, 20), { type: 'recallEffect', key: 'baska', id: 'Z' })])).toBe('silentDay')
    const ign = [3, 4, 5].map((d) => said(new Date(2026, 9, d, 9), { type: 'recallEffect', key: `k${d}`, id: `Z${d}`, outcome: 'ignored' }))
    expect(s(ign)).toBe('silentDay')
    expect(s([])).toBe('recallEffect')
  })

  it('kart gün içinde kararlı: bugün söylenen cümle yeniden gelir', () => {
    const a = ch(speak({ moments, bank: tr, lang: 'tr', now: evening, lexicon }), 'card')
    const rows = prune([said(new Date(2026, 9, 8, 19), { type: a.type, key: a.key, id: a.id })], evening)
    const b = ch(speak({ moments, rows, bank: tr, lang: 'tr', now: new Date(2026, 9, 8, 21), lexicon }), 'card')
    expect([b.id, b.text]).toEqual([a.id, a.text])
  })

  it('uzun aradan dönüş: tek kart cümlesi (F4.C), bildirim yok', () => {
    const out = say({ moments: buildMoments(rainCtx({ appGapDays: 7 })) })
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ channel: 'card', type: 'returnApp', cell: 'F4.C' })
  })

  it('düşük WHO-5: kart yalnız sabit satırı işaret eder, bildirim yok', () => {
    const out = say({ moments: buildMoments(rainCtx({ who5Low: true })) })
    expect(out).toEqual([{ channel: 'card', type: 'lowWho5', key: 'lowWho5:2026-10-01', cell: null, id: null, text: null, fixed: 'who5.low', label: 'Nef' }])
    expect(say({ moments: buildMoments(rainCtx({ who5Low: true })), channels: ['notify'] })).toEqual([])
  })
})

describe('uyku ve rahatsızlık hariç', () => {
  it('an motoru kurmaz; seçiciye elle verilse de söylenmez', () => {
    const moments = buildMoments({
      now: NOW,
      metrics: [{ key: 'yoga-uyku-dalma', module: 'yoga', domain: 'wellbeing', better: 'up', verdict: 'better', start: 4, current: 7 }],
      acute: [{ key: 'yon-uzak', module: 'yon', measure: 'rahatsızlık', better: 'down', n: 5, before: 7, after: 5, gain: 2, lo: 1, hi: 3, sig: true }],
    })
    expect(moments.map((m) => m.type)).toEqual(['silentDay'])
    const forced = [
      { type: 'metricChange', cell: 'MC', facts: { module: 'yoga', metric: 'yoga-uyku-dalma', start: 4, current: 7 }, key: 'm', priority: 40, channels: ['card'] },
      { type: 'effectPattern', cell: 'F2.D', facts: { module: 'yon', effect: 'yon-uzak', measure: 'rahatsızlık', better: 'down', n: 5, gain: 2, beforeAvg: 7, afterAvg: 5 }, key: 'p', priority: 45, channels: ['card'] },
    ]
    const lex = { ...lexicon, names: { ...lexicon.names, yon: { '': 'Yön yazı egzersizi', ABL: 'Yön yazı egzersizinden' }, yoga: { LOC: 'yoga dersinde' } }, metrics: { 'yoga-uyku-dalma': { word: 'uykuya dalma puanın', unit: '' } } }
    expect(speak({ moments: forced, bank: tr, lang: 'tr', now: NOW, lexicon: lex })).toEqual([])
    const out = speak({ moments: [...forced, ...moments], bank: tr, lang: 'tr', now: NOW, lexicon: lex })
    expect(out.map((x) => x.type)).toEqual(['silentDay'])
    expect(out[0].text).not.toMatch(/uyku|rahatsızlık/)
  })
})

describe('modül adı manifestten', () => {
  it('sözlük verilmezse ad ve ölçüm sözcüğü manifestin nef alanından gelir', () => {
    const f = ch(speak({ moments: buildMoments({ now: NOW, firsts: [{ module: 'snake', kind: 'day' }] }), bank: tr, lang: 'tr', now: NOW }), 'card')
    expect(f.cell).toBe('FT')
    expect(f.text).toMatch(/Yılan oyun/)
    const m = buildMoments({ now: NOW, metrics: [{ module: 'tek-bakis', key: 'tek-bakis-span', domain: 'focus', better: 'up', verdict: 'better', start: 4, current: 6 }] })
    const withManifest = ch(speak({ moments: m, bank: tr, lang: 'tr', now: NOW }), 'card')
    expect(withManifest).toEqual(ch(say({ moments: m }), 'card'))
    expect(withManifest.text).toMatch(/Tek Bakışta oyununda kavradığın harf sayısı/)
  })
})

describe('genel anlar uçtan uca', () => {
  it('metricChange, firstTime, pathDone kartta onaylı cümleyle', () => {
    const m = buildMoments({ now: NOW, metrics: [{ module: 'tek-bakis', key: 'tek-bakis-span', domain: 'focus', better: 'up', verdict: 'better', start: 4, current: 6 }] })
    const c = ch(say({ moments: m }), 'card')
    expect(c.cell).toBe('MC')
    expect(c.id).not.toBe('MC-12') // "iki haftadır" olgusu yok
    expect(c.text).toMatch(/Tek Bakışta oyununda/)
    const f = ch(say({ moments: buildMoments({ now: NOW, firsts: [{ module: 'snake', kind: 'day' }] }) }), 'card')
    expect(f.cell).toBe('FT')
    expect(f.id).not.toBe('FT-1')
    const p = ch(say({ moments: buildMoments({ now: NOW, path: { has: true, doneToday: true, doneDays: 4 } }) }), 'card')
    expect(p.cell).toBe('PD')
    expect(p.text).toMatch(/dört|dördüncü/)
  })
})
