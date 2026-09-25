import { describe, it, expect } from 'vitest'
import {
  AYNA_ITEMS, AYNA_PAIRS, LIKERT, FACTS, ANSWER_TEXT, YON_NOTES_KEY, KIND_CHIPS,
  scoreAyna, firstPersonCount, distanceState, appendChip, makeAynaRecord, makeUzakRecord, makeSefkatRecord,
  loadNotes, saveNote, aynaRecords, aynaDue, isYon,
} from './yon.js'

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) } }
const all = (v) => Object.fromEntries(AYNA_ITEMS.map((it) => [it.id, v]))

describe('Ayna (Öz-Şefkat Kısa Form, Türkçe 6 madde)', () => {
  it('6 madde, her yandan bir; 3 sert 3 şefkat; çiftler geçerli', () => {
    expect(AYNA_ITEMS).toHaveLength(6)
    expect(new Set(AYNA_ITEMS.map((i) => i.side)).size).toBe(6)
    expect(AYNA_ITEMS.filter((i) => i.rev).map((i) => i.id).sort()).toEqual(['isol', 'judge', 'overid'])
    const ids = AYNA_ITEMS.map((i) => i.id)
    for (const [h, s] of AYNA_PAIRS) {
      expect(AYNA_ITEMS.find((i) => i.id === h).rev).toBe(true)
      expect(AYNA_ITEMS.find((i) => i.id === s).rev).toBe(false)
      expect(ids).toContain(h)
    }
    expect(LIKERT).toHaveLength(5)
  })
  it('sert maddeler ters puanlanır; eksik ya da aralık dışı cevapta sonuç yok', () => {
    expect(scoreAyna(all(3)).score).toBe(3)
    const best = Object.fromEntries(AYNA_ITEMS.map((it) => [it.id, it.rev ? 1 : 5]))
    expect(scoreAyna(best).score).toBe(5)
    const worst = Object.fromEntries(AYNA_ITEMS.map((it) => [it.id, it.rev ? 5 : 1]))
    expect(scoreAyna(worst).score).toBe(1)
    expect(scoreAyna({ ...all(3), kind: 6 })).toBeNull()
    expect(scoreAyna({ kind: 3 })).toBeNull()
  })
})

describe('Dışarıdan bak: birinci kişi sayacı', () => {
  it('ayrı sözcük olarak ben/bana/beni… sayılır; ek hali ve başka sözcükler sayılmaz', () => {
    expect(firstPersonCount('Ben o gün çok utandım, bana haksızlık yapıldı.')).toBe(2)
    expect(firstPersonCount('BENİM için zordu; kendimi suçladım')).toBe(2)
    expect(firstPersonCount('Benzin bitti, bence de öyle')).toBe(1) // "bence" sayılır, "Benzin" sayılmaz
    expect(firstPersonCount('')).toBe(0)
  })
  it('durum: boş / ben var / adla ya da sen ile uzak / nötr', () => {
    expect(distanceState('   ').kind).toBe('empty')
    expect(distanceState('Ben üzüldüm', 'Ali')).toMatchObject({ kind: 'first', first: 1 })
    expect(distanceState('Ali, o gün üzüldün', 'ali').kind).toBe('far')
    expect(distanceState('O gün sen üzüldün').kind).toBe('far')
    expect(distanceState('O gün üzüldün').kind).toBe('neutral')
    // aynı düzenli ifade art arda doğru sonuç verir (lastIndex sızıntısı yok)
    expect(distanceState('sen').kind).toBe('far')
    expect(distanceState('sen').kind).toBe('far')
  })
})

describe('Şefkatle ele al', () => {
  it('parçalar övgü içermez ve boşlukla eklenir', () => {
    for (const c of KIND_CHIPS) expect(c.text).not.toMatch(/harika|mükemmel|sevilecek/i)
    expect(appendChip('', 'A. ')).toBe('A. ')
    expect(appendChip('Merhaba.', 'A. ')).toBe('Merhaba. A. ')
  })
})

describe('kayıtlar ve notlar', () => {
  it('kayıtlarda yazı yok, yalnız sayılar', () => {
    const d = new Date('2026-09-25T10:00:00Z')
    const a = makeAynaRecord(scoreAyna(all(4)), 95.4, d)
    expect(a).toMatchObject({ type: 'yon', tool: 'ayna', seconds: 95, version: 'scs-sf-tr-6' })
    expect(a.score).toBe(scoreAyna(all(4)).score)
    expect(isYon(a)).toBe(true)
    const u = makeUzakRecord({ before: 8, after: 5, firstPerson: 2, seconds: 200 }, d)
    expect(u).toEqual({ type: 'yon', tool: 'uzak', date: '2026-09-25T10:00:00.000Z', seconds: 200, before: 8, after: 5, delta: -3, firstPerson: 2 })
    expect(makeSefkatRecord({ step: 'x', seconds: 10 }, d).step).toBe(true)
    for (const r of [a, u]) expect(JSON.stringify(r)).not.toMatch(/text|event|name/)
  })
  it('notlar yalnız istenince, bu cihazda; bozuk veri boş liste', () => {
    const s = mem()
    expect(loadNotes(s)).toEqual([])
    expect(saveNote({ tool: 'uzak', text: 'x', date: '2026-09-25T10:00:00Z' }, s)).toBe(true)
    expect(loadNotes(s)).toEqual([{ tool: 'uzak', text: 'x', date: '2026-09-25T10:00:00.000Z' }])
    expect(loadNotes({ getItem: () => '{bozuk' })).toEqual([])
    expect(YON_NOTES_KEY).toBe('gozolcum:yon-notes')
  })
  it('Ayna ayda bir önerilir', () => {
    const now = new Date('2026-09-25T10:00:00Z')
    expect(aynaDue([], now)).toBe(true)
    const rec = (days) => makeAynaRecord(scoreAyna(all(3)), 60, new Date(now - days * 86400000))
    expect(aynaDue([rec(5)], now)).toBe(false)
    expect(aynaDue([rec(31)], now)).toBe(true)
    expect(aynaRecords([rec(31), { type: 'yon', tool: 'uzak' }, rec(2)])).toHaveLength(2)
  })
})

describe('bilim kartları', () => {
  it('DOI ve cevap türü geçerli', () => {
    for (const f of Object.values(FACTS)) {
      expect(f.doi).toMatch(/^10\.\d{4,}\//)
      expect(ANSWER_TEXT[f.answer]).toBeTruthy()
    }
  })
})
