// Uzun yol (D9; lib/pathAhead.js): gelecek günler gerçek yol koduyla ve merdivenlerle, geçmiş yol günleri, bölümler.
import { describe, it, expect } from 'vitest'
import { projectDays, pastDays, chapterOf, chapterEnd, AHEAD_DAYS, seenBefore, firstNews } from './pathAhead.js'
import { progressionCtx } from './progression.js'
import { buildPath } from './today.js'
import { registry } from '../modules/registry.js'

const NOW = new Date(2026, 8, 30, 10, 0, 0) // Çarşamba
const modules = registry.live
const ahead = (tests = [], sessions = [], now = NOW) => projectDays({ modules, tests, sessions, now, progression: progressionCtx({ tests, sessions, now, modules }) })
const titles = (d) => d.stops.map((s) => s.title)

describe('projectDays', () => {
  it('yeni kullanıcı 1. gün: AHEAD_DAYS (70) gün ileri, yolun 2.–71. günleri; merdiven basamakları gün gün', () => {
    const days = ahead()
    expect(days).toHaveLength(AHEAD_DAYS)
    expect(days.map((d) => d.n)).toEqual(Array.from({ length: AHEAD_DAYS }, (_, i) => i + 2))
    expect(days[0].key).toBe('2026-10-01')
    // 2. gün: göz egzersizinde Sağ–sol (K2) yeni; nefes 2 dk (N2), yeni; haftalık E testi yok
    expect(titles(days[0])).toContain('Sağ–sol')
    expect(days[0].newKeys).toEqual(expect.arrayContaining(['routine:isinma', 'breath']))
    expect(days[0].stops.find((s) => s.restSlot)?.minutes).toBe(2)
    expect(titles(days[0])).not.toContain('Haftalık E testi')
    // 3. günden nefes 3 dk; 8. gün haftalık E testi yeniden (son tam koşudan 7 takvim günü)
    expect(days[1].stops.find((s) => s.restSlot)?.minutes).toBe(3)
    expect(titles(days[6])).toContain('Haftalık E testi')
  })
  it('bugünün yolunu değiştirmez (routine modülünün bugünkü grup adları geri kurulur) ve kayıtlara dokunmaz', () => {
    const tests = []
    const sessions = []
    ahead(tests, sessions)
    expect(tests).toEqual([])
    expect(sessions).toEqual([])
    const p = progressionCtx({ tests, sessions, now: NOW, modules })
    const before = buildPath(modules, { tests, sessions, now: NOW, progression: p }).stops.map((s) => s.key)
    ahead(tests, sessions)
    expect(buildPath(modules, { tests, sessions, now: NOW, progression: p }).stops.map((s) => s.key)).toEqual(before)
  })
  it('ilerleme bağlamı yoksa boş', () => {
    expect(projectDays({ modules, now: NOW })).toEqual([])
  })
})

describe('pastDays ve bölümler', () => {
  it('yalnız bugünden önceki yol günleri, eskiden yeniye, yapılan modüllerle', () => {
    const iso = (d) => new Date(2026, 8, 30 - d, 10).toISOString()
    const sessions = [
      { type: 'routine', setId: 'kirpma', seconds: 40, date: iso(2) },
      { type: 'game', game: 'track', date: iso(2) },
      { type: 'routine', setId: 'kirpma', seconds: 40, date: iso(1) },
      { type: 'routine', setId: 'kirpma', seconds: 40, date: iso(0) }, // bugün: sayılmaz
    ]
    const days = pastDays({ modules, sessions, now: NOW })
    expect(days.map((d) => [d.key, d.n])).toEqual([['2026-09-28', 1], ['2026-09-29', 2]])
    expect(days[0].ids.sort()).toEqual(['routine', 'track'])
  })
  it('7 günde bir bölüm', () => {
    expect([1, 7, 8, 14, 15].map(chapterOf)).toEqual([1, 1, 2, 2, 3])
    expect([6, 7, 8, 14].map(chapterEnd)).toEqual([false, true, false, true])
  })
})

// D9 v2 (sahibin kuralı): "Yeni" yalnız kişinin gerçekten ilk kez gördüğü durakta
describe('seenBefore ve firstNews', () => {
  const iso = (d) => new Date(2026, 8, 30 - d, 10).toISOString()
  it('geçmişte yapılmış durak görülmüş sayılır: nefes, grup (adımlarıyla), yoga (ders fark etmez); bugünün kaydı sayılmaz', () => {
    const sessions = [
      { type: 'breath', seconds: 60, pattern: 'calm', date: iso(70) },
      { type: 'routine', setId: 'isinma', stepIds: ['lookRight', 'lookLeft', 'rest'], seconds: 40, date: iso(1) },
      { type: 'routine', setId: 'uzak', seconds: 40, date: iso(3) }, // adımsız eski kayıt: grup yeter
      { type: 'routine', setId: 'kirpma', seconds: 40, date: iso(0) }, // bugün
      { type: 'yoga', lesson: 2, planned: 180, seconds: 180, completed: true, date: iso(5) },
    ]
    const seen = seenBefore({ modules, sessions, now: NOW })
    expect(seen({ id: 'breath', key: 'breath', restSlot: true })).toBe(true)
    // K2 "Sağ–sol" yapıldı; K3 "Isınma" aynı anahtarda başka adımlarla: ilk kez
    expect(seen({ id: 'routine', key: 'routine:isinma', stage: { steps: ['lookRight', 'lookLeft', 'rest'] } })).toBe(true)
    expect(seen({ id: 'routine', key: 'routine:isinma', stage: { steps: ['blink', 'lookRight', 'lookLeft'] } })).toBe(false)
    expect(seen({ id: 'routine', key: 'routine:uzak', stage: { steps: ['farLook', 'rest'] } })).toBe(true)
    expect(seen({ id: 'routine', key: 'routine:kirpma', stage: { steps: ['blink', 'rest'] } })).toBe(false)
    expect(seen({ id: 'notice', key: 'notice' })).toBe(false)
    // yoga tek durak: başka bir ders de görülmüş sayılır (ders başına "Yeni" yok)
    expect(seen({ id: 'yoga', key: 'yoga', stage: { lesson: 5 } })).toBe(true)
  })
  it('gelecek günlerde ilk kez gelen: bugünün yolunda, geçmişte ya da önceki bir günde olan yok', () => {
    const s = (key, id = key) => ({ key, id })
    const ahead = [
      { n: 2, stops: [s('breath'), s('snake'), s('notice')], newKeys: ['breath', 'snake', 'notice'] },
      { n: 3, stops: [s('snake'), s('reading')], newKeys: [] }, // açılma eşiği geçmiş olsa da ilk geliş yeni
    ]
    const out = firstNews(ahead, [s('breath')], (x) => x.key === 'notice')
    expect(out.get(2).map((x) => x.key)).toEqual(['snake'])
    expect(out.get(3).map((x) => x.key)).toEqual(['reading'])
  })
  it('yeni kullanıcı 1. gün: 70 gün ileri; ilk kez gelenler ilk iki bölümde ve tam set günü', () => {
    const days = ahead()
    expect(days).toHaveLength(70)
    const today = buildPath(modules, { tests: [], sessions: [], now: NOW, progression: progressionCtx({ tests: [], sessions: [], now: NOW, modules }) }).stops
    const out = firstNews(days, today, () => false)
    // sonraki basamaklar (süre, sıra, tekrar) yeni durak değil; 2. bölümden sonra yalnız haftalık tam set (Normal set) ilk kez
    expect([...out.entries()].every(([n, l]) => n <= 14 || l.every((s) => s.key === 'routine:normal'))).toBe(true)
    // açılma günü yolda olmayan durak da (Tek Bakışta, Daire) ilk geldiği gün yenidir (newKeys'e bakılmaz; D9 v2 tur 2)
    expect([...out.values()].flat().map((s) => s.key)).toEqual(expect.arrayContaining(['tek-bakis', 'routine:daire']))
    // Sahip kararı 2026-10-02: okuma testi yolda değil; yerini alan Oku ve Anla 3. günden (UNLOCK pathDay 2)
    expect(out.get(2).map((x) => x.key)).toEqual(expect.arrayContaining(['routine:isinma', 'snake', 'notice']))
    expect(out.get(2).map((x) => x.key)).not.toContain('reading')
    expect(out.get(3).map((x) => x.key)).toContain('okuma-anlama')
    expect(out.get(2).map((x) => x.key)).not.toContain('breath') // 1. günde de yoldaydı
  })
})

