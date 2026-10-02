import { describe, it, expect } from 'vitest'
import { IRIS_ORDER, snapshot, irisCells, filledIndexes, withBaseline, withRecheck, recheckDue, RECHECK_DAYS } from './iris.js'
import { emptyProfile, normalizeProfile } from './profile.js'
import { answer, pendingCard, IRIS_QUESTIONS, QUESTIONS } from './profileQuestions.js'

const D0 = '2026-09-27T10:00:00.000Z'
const filled = () => {
  let p = { ...emptyProfile(), date: D0, flagsChecked: true, firstLook: { blinks: 6, seconds: 20, method: 'truedepth', date: D0 } }
  for (const [id, v] of [['stressNow', 1], ['sleep', 6], ['activityDays', 2], ['selfCompassion', 2]]) p = answer(p, id, v)
  return p
}

describe('iris haritası', () => {
  it('7 alan, Göz tepede; sorular 4 alanı doldurur, Dikkat ve Farkındalık görevle', () => {
    expect(IRIS_ORDER).toHaveLength(7)
    expect(IRIS_ORDER[0]).toBe('eye')
    const cells = irisCells(snapshot(filled(), D0))
    expect(cells.map((c) => c.filled)).toEqual([true, false, false, true, true, true, true])
    expect(cells.find((c) => c.domain === 'wellbeing').value).toBe(6)
    const withTask = irisCells(snapshot(filled(), D0), { sessions: [{ type: 'q' }], domainOf: () => 'focus' })
    expect(filledIndexes(withTask)).toEqual([0, 1, 3, 4, 5, 6])
  })
  it('sıfır da bir cevaptır (hiç stres yok, hiç hareket yok)', () => {
    let p = answer(filled(), 'stressNow', 0)
    p = answer(p, 'activityDays', 0)
    expect(filledIndexes(irisCells(snapshot(p, D0)))).toEqual([0, 3, 4, 5, 6])
  })
  it('başlangıç bir kez yazılır, sonraki cevaplar onu değiştirmez; normalize korur', () => {
    const b = withBaseline(filled(), D0)
    const again = withBaseline(answer(b, 'sleep', 9), '2026-10-01T00:00:00.000Z')
    expect(again.iris.baseline.sleep).toBe(6)
    expect(normalizeProfile(JSON.parse(JSON.stringify(again))).iris.baseline).toEqual(again.iris.baseline)
    expect(normalizeProfile({ iris: { baseline: { date: 'x', sleep: 99 } } }).iris.baseline).toBeNull()
  })
  it('28. gün kartı: başlangıçtan 28 gün sonra, yeniden sorulunca kapanır', () => {
    const b = withBaseline(filled(), D0)
    const day = (n) => new Date(new Date(D0).getTime() + n * 86400000)
    expect(recheckDue(b, day(RECHECK_DAYS - 1))).toBe(false)
    expect(recheckDue(b, day(RECHECK_DAYS))).toBe(true)
    expect(pendingCard(b, day(RECHECK_DAYS))).toBe('iris')
    const r = withRecheck(answer(b, 'sleep', 8), day(RECHECK_DAYS).toISOString())
    expect(r.iris.recheck.sleep).toBe(8)
    expect(recheckDue(r, day(40))).toBe(false)
    expect(recheckDue(filled(), day(40))).toBe(false) // başlangıç yoksa kart yok
  })
  it('kurulumdaki 4 sorunun alanı, kaynağı ve giriş biçimi var', () => {
    expect(IRIS_QUESTIONS.map((id) => QUESTIONS[id].domain)).toEqual(['calm', 'wellbeing', 'body', 'self'])
    for (const id of IRIS_QUESTIONS) {
      expect(QUESTIONS[id].ui, id).toMatch(/levels|slider|days|agree/)
      expect(QUESTIONS[id].source, id).toMatch(/\d{4}/)
    }
  })
})
