// Günün ilk açılışı kaydı (SONSUZ_YOL.PLAN.v1 §3.F.3): gozolcum:day-open. Dünün önceliği, 1 saat ve ilk dokunuş.
import { describe, it, expect, beforeEach } from 'vitest'
import { DAY_OPEN_KEY, LEAD_MS, dayOpenFor, leadLive, markDayTap, readDayOpen, saveDayOpen } from './dayOpen.js'

const mem = {}
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v) }, removeItem: (k) => { delete mem[k] } }
const NOW = new Date('2026-09-30T10:00:00')

beforeEach(() => {
  for (const k of Object.keys(mem)) delete mem[k]
})

describe('dayOpen', () => {
  it('kayıt yoksa bugünün yeni kaydı (yazılmamış), dünün önceliği yok', () => {
    const { rec, fresh } = dayOpenFor(NOW)
    expect(fresh).toBe(true)
    expect(rec).toEqual({ day: '2026-09-30', firstAt: NOW.getTime(), firstTapAt: null, lead: null, prev: null })
    expect(readDayOpen()).toBeNull()
  })
  it('dünün kaydı varsa önceliği prev olur; daha eskiyse olmaz', () => {
    saveDayOpen({ day: '2026-09-29', firstAt: 1, firstTapAt: 2, lead: 6, prev: null })
    expect(dayOpenFor(NOW).rec.prev).toBe(6)
    saveDayOpen({ day: '2026-09-27', firstAt: 1, firstTapAt: 2, lead: 6, prev: null })
    expect(dayOpenFor(NOW).rec.prev).toBeNull()
  })
  it('bugünün kaydı varsa o döner (gün içinde değişmez); kayıt kişisel veri taşımaz', () => {
    const rec = { day: '2026-09-30', firstAt: NOW.getTime() - 5000, firstTapAt: null, lead: 1, prev: 7 }
    saveDayOpen(rec)
    expect(dayOpenFor(NOW)).toEqual({ rec, fresh: false })
    expect(Object.keys(JSON.parse(mem[DAY_OPEN_KEY])).sort()).toEqual(['day', 'firstAt', 'firstTapAt', 'lead', 'prev'])
  })
  it('cümle ilk dokunuşa kadar ya da en çok 1 saat görünür', () => {
    const rec = { day: '2026-09-30', firstAt: NOW.getTime(), firstTapAt: null, lead: 1, prev: null }
    expect(leadLive(rec, NOW)).toBe(true)
    expect(leadLive(rec, new Date(NOW.getTime() + LEAD_MS - 1))).toBe(true)
    expect(leadLive(rec, new Date(NOW.getTime() + LEAD_MS))).toBe(false)
    saveDayOpen(rec)
    markDayTap(new Date(NOW.getTime() + 1000))
    expect(readDayOpen().firstTapAt).toBe(NOW.getTime() + 1000)
    expect(leadLive(readDayOpen(), NOW)).toBe(false)
    markDayTap(new Date(NOW.getTime() + 9000)) // yalnız ilk dokunuş yazılır
    expect(readDayOpen().firstTapAt).toBe(NOW.getTime() + 1000)
  })
  it('depolama bozuk ya da yoksa hata atmaz', () => {
    mem[DAY_OPEN_KEY] = '{bozuk'
    expect(readDayOpen()).toBeNull()
    expect(() => markDayTap(NOW)).not.toThrow()
  })
})
