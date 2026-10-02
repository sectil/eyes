import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resetAllData } from '../notifyReset.js'
import {
  NEF_SAID_KEY, SAID_MAX, SAID_DAYS, loadSaid, recordSaid, markOutcome, prune, sentenceFree, factFree, typeFreeHome,
  typeResting, restUntil, notifyCounts, saidWithin, lastSaidAt,
} from './memory.js'

// Bellek içi depolama (enjekte edilir)
function mem(init = {}) {
  const m = new Map(Object.entries(init))
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m }
}
const at = (s) => new Date(s)
const row = (iso, o = {}) => ({ at: iso, date: iso.slice(0, 10), type: 'recallEffect', key: null, id: null, channel: 'card', ...o })

describe('depolama', () => {
  it("anahtar 'gozolcum:nef-said'; yazar ve okur", () => {
    const storage = mem()
    expect(NEF_SAID_KEY).toBe('gozolcum:nef-said')
    recordSaid({ type: 'rainOnWalk', key: 'k1', id: 'F1A-1', channel: 'notify' }, { storage, now: at('2026-10-01T08:00:00') })
    const rows = loadSaid({ storage, now: at('2026-10-01T09:00:00') })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ type: 'rainOnWalk', key: 'k1', id: 'F1A-1', channel: 'notify', date: '2026-10-01' })
    expect(JSON.parse(storage.getItem(NEF_SAID_KEY))).toHaveLength(1)
  })

  it('bozuk ya da erişilemeyen depolama: boş liste, hata yok', () => {
    expect(loadSaid({ storage: mem({ [NEF_SAID_KEY]: '{bozuk' }) })).toEqual([])
    expect(loadSaid({ storage: null })).toEqual([])
    const broken = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') } }
    expect(loadSaid({ storage: broken })).toEqual([])
    expect(() => recordSaid({ type: 'silentDay', channel: 'card' }, { storage: broken })).not.toThrow()
  })

  it('geçersiz satır yazılmaz (kanal ya da tür yok)', () => {
    const storage = mem()
    recordSaid({ type: 'x', channel: 'sms' }, { storage })
    recordSaid({ channel: 'card' }, { storage })
    expect(loadSaid({ storage })).toEqual([])
  })

  it('sınır: en çok 400 satır ve 180 gün', () => {
    const now = at('2026-10-01T12:00:00')
    const rows = []
    for (let i = 0; i < 450; i++) rows.push(row(new Date(now.getTime() - i * 3600000).toISOString(), { id: `s${i}` }))
    rows.push(row('2026-03-01T12:00:00.000Z', { id: 'eski' })) // 180 günden eski
    const p = prune(rows, now)
    expect(p).toHaveLength(SAID_MAX)
    expect(p.some((r) => r.id === 'eski')).toBe(false)
    expect(p.at(-1).id).toBe('s0') // en yeni sonda
    expect(p[0].id).toBe('s399')
    const old = prune([row(new Date(now.getTime() - (SAID_DAYS + 1) * 86400000).toISOString())], now)
    expect(old).toEqual([])
    const edge = prune([row(new Date(now.getTime() - (SAID_DAYS - 1) * 86400000).toISOString())], now)
    expect(edge).toHaveLength(1)
  })

  it('kayıt sırasında sınır uygulanır', () => {
    const now = at('2026-10-01T12:00:00')
    const many = Array.from({ length: SAID_MAX }, (_, i) => row(new Date(now.getTime() - (i + 1) * 60000).toISOString(), { id: `s${i}` }))
    const storage = mem({ [NEF_SAID_KEY]: JSON.stringify(many) })
    const next = recordSaid({ type: 'silentDay', id: 'yeni', channel: 'card' }, { storage, now })
    expect(next).toHaveLength(SAID_MAX)
    expect(next.at(-1).id).toBe('yeni')
  })
})

describe('kural 1 · aynı cümle 21 gün', () => {
  const rows = prune([row('2026-10-01T10:00:00.000Z', { id: 'F2A-1' })], at('2026-10-02T00:00:00'))
  it('21 gün içinde tekrar etmez', () => {
    expect(sentenceFree(rows, 'F2A-1', at('2026-10-02T10:00:00Z'))).toBe(false)
    expect(sentenceFree(rows, 'F2A-1', at('2026-10-21T10:00:00Z'))).toBe(false)
    expect(sentenceFree(rows, 'F2A-1', at('2026-10-22T09:59:00Z'))).toBe(false)
  })
  it('21 gün dolunca serbest; başka cümle serbest', () => {
    expect(sentenceFree(rows, 'F2A-1', at('2026-10-22T10:00:00Z'))).toBe(true)
    expect(sentenceFree(rows, 'F2A-3', at('2026-10-02T10:00:00Z'))).toBe(true)
  })
  it('kanaldan bağımsız ve en son söylenme anı', () => {
    const r = prune([row('2026-10-01T10:00:00.000Z', { id: 'F1A-1', channel: 'notify' }), row('2026-10-05T10:00:00.000Z', { id: 'F1A-1' })], at('2026-10-06'))
    expect(sentenceFree(r, 'F1A-1', at('2026-10-23T10:00:00Z'))).toBe(false)
    expect(lastSaidAt(r, 'F1A-1')).toBe(Date.parse('2026-10-05T10:00:00.000Z'))
    expect(lastSaidAt(r, 'yok')).toBeNull()
  })
})

describe('kural 2 · aynı olgu bir kez', () => {
  it('olgu anahtarı bir kez', () => {
    const rows = prune([row('2026-08-01T10:00:00.000Z', { key: 'recall:dalga-sakin:2026-07-25' })], at('2026-10-01'))
    expect(factFree(rows, 'recall:dalga-sakin:2026-07-25')).toBe(false)
    expect(factFree(rows, 'recall:dalga-sakin:2026-08-01')).toBe(true)
    expect(factFree(rows, null)).toBe(true)
  })
})

describe('kural 3 · aynı an türü Ana sayfada üst üste iki gün değil', () => {
  const now = at('2026-10-02T09:00:00')
  it('dün kartta geldiyse bugün gelmez', () => {
    const rows = prune([row('2026-10-01T18:00:00', { type: 'recallEffect' })], now)
    expect(typeFreeHome(rows, 'recallEffect', now)).toBe(false)
    expect(typeFreeHome(rows, 'metricChange', now)).toBe(true)
  })
  it('önceki gün ya da bildirim kanalı engellemez', () => {
    const rows = prune([row('2026-09-30T18:00:00', { type: 'recallEffect' }), row('2026-10-01T18:00:00', { type: 'rainOnWalk', channel: 'notify' })], now)
    expect(typeFreeHome(rows, 'recallEffect', now)).toBe(true)
    expect(typeFreeHome(rows, 'rainOnWalk', now)).toBe(true)
  })
  it('yol ve sessiz gün hariç', () => {
    const rows = prune([row('2026-10-01T18:00:00', { type: 'pathDone' }), row('2026-10-01T19:00:00', { type: 'silentDay' })], now)
    expect(typeFreeHome(rows, 'pathDone', now)).toBe(true)
    expect(typeFreeHome(rows, 'silentDay', now)).toBe(true)
  })
})

describe('kural 5 · üç kez yok sayılan an türü 14 gün dinlenir', () => {
  const ign = (d) => row(`${d}T10:00:00.000Z`, { type: 'effectPattern', outcome: 'ignored' })
  it('üç yok saymadan sonra 14 gün', () => {
    const rows = prune([ign('2026-10-01'), ign('2026-10-03'), ign('2026-10-05')], at('2026-10-06'))
    expect(typeResting(rows, 'effectPattern', at('2026-10-06T00:00:00Z'))).toBe(true)
    expect(typeResting(rows, 'effectPattern', at('2026-10-19T09:59:00Z'))).toBe(true)
    expect(typeResting(rows, 'effectPattern', at('2026-10-19T10:00:00Z'))).toBe(false)
    expect(typeResting(rows, 'recallEffect', at('2026-10-06T00:00:00Z'))).toBe(false)
  })
  it('iki yok sayma yetmez; dokunulan satır sayacı sıfırlar', () => {
    expect(typeResting(prune([ign('2026-10-01'), ign('2026-10-03')], at('2026-10-04')), 'effectPattern', at('2026-10-04'))).toBe(false)
    const rows = prune([ign('2026-10-01'), ign('2026-10-02'), row('2026-10-03T10:00:00.000Z', { type: 'effectPattern', outcome: 'touched' }), ign('2026-10-04')], at('2026-10-05'))
    expect(restUntil(rows, 'effectPattern')).toBeNull()
  })
  it('sonucu işlenmemiş satır sayılmaz; dinlenme bitince sayaç baştan', () => {
    const rows = prune([ign('2026-10-01'), row('2026-10-02T10:00:00.000Z', { type: 'effectPattern' }), ign('2026-10-03'), ign('2026-10-04'), ign('2026-10-20'), ign('2026-10-21')], at('2026-10-22'))
    expect(restUntil(rows, 'effectPattern')).toBe(Date.parse('2026-10-18T10:00:00.000Z'))
    expect(typeResting(rows, 'effectPattern', at('2026-10-22T12:00:00Z'))).toBe(false)
  })
  it('markOutcome en son eşleşen satıra yazar', () => {
    const storage = mem()
    recordSaid({ type: 'effectPattern', id: 'F2C-1', channel: 'card' }, { storage, now: at('2026-10-01T10:00:00') })
    recordSaid({ type: 'effectPattern', id: 'F2C-2', channel: 'card' }, { storage, now: at('2026-10-02T10:00:00') })
    const rows = markOutcome({ type: 'effectPattern', channel: 'card' }, 'ignored', { storage, now: at('2026-10-02T11:00:00') })
    expect(rows.map((r) => r.outcome ?? null)).toEqual([null, 'ignored'])
    expect(markOutcome({ id: 'F2C-1' }, 'bilinmez', { storage }).every((r) => r.outcome !== 'bilinmez')).toBe(true)
  })
})

describe('bildirim sayacı ve tekrar', () => {
  it('bugün ve son 7 gün (bugün dahil), yalnız bildirim kanalı', () => {
    const n = (d) => row(`${d}T10:00:00`, { type: 'rainOnWalk', channel: 'notify' })
    const rows = prune([n('2026-09-24'), n('2026-09-25'), n('2026-09-28'), n('2026-10-01'), row('2026-10-01T11:00:00', { channel: 'card' })], at('2026-10-02'))
    expect(notifyCounts(rows, at('2026-10-01T20:00:00'))).toEqual({ day: 1, week: 3 })
    expect(notifyCounts(rows, at('2026-10-02T09:00:00'))).toEqual({ day: 0, week: 2 })
  })
  it('saidWithin: bugünden önceki 7 gün', () => {
    const rows = prune([row('2026-09-28T10:00:00', { type: 'rainOnWalk', channel: 'notify' })], at('2026-10-02'))
    expect(saidWithin(rows, 'rainOnWalk', 7, at('2026-10-02T09:00:00'))).toBe(true)
    expect(saidWithin(rows, 'rainOnWalk', 7, at('2026-10-06T09:00:00'))).toBe(false)
    expect(saidWithin(rows, 'rainOnWalk', 7, at('2026-09-28T20:00:00'))).toBe(false) // bugün sayılmaz
  })
})

describe('"Tüm verileri sil"', () => {
  it('hafıza anahtarı silinir; App.jsx resetAllData çağrısı onu verir', () => {
    const m = new Map([[NEF_SAID_KEY, '[]'], ['gozolcum:tema', 'koyu']])
    const storage = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }
    let settings = {}
    const store = { get: () => ({ settings }), clearAll: () => { settings = {} }, setSetting: (k, v) => { settings[k] = v } }
    resetAllData({ store, storage, keys: [NEF_SAID_KEY] })
    expect([...m.keys()]).toEqual(['gozolcum:tema'])
    const app = readFileSync(fileURLToPath(new URL('../../App.jsx', import.meta.url)), 'utf8')
    expect(app).toMatch(/resetAllData\(\{[^}]*keys: \[\.\.\.SKY_KEYS, NEF_SAID_KEY\]/)
  })
})
