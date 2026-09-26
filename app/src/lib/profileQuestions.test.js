import { describe, it, expect } from 'vitest'
import { QUESTIONS, GROUPS, missing, answer, pendingCard, snooze, skip, questionRows, isOlder } from './profileQuestions.js'
import { emptyProfile, normalizeProfile } from './profile.js'

const DAY0 = '2026-09-25T09:00:00'
const base = () => ({ ...emptyProfile(), date: new Date(DAY0).toISOString(), ageBand: '40-49', flagsChecked: true })
const at = (s) => new Date(s)

describe('sorular ve "neden sordum"', () => {
  it('her sorunun metni, cevabı ve cümlesi var; seçenekli soruların her cevabı cümle üretir', () => {
    for (const [id, q] of Object.entries(QUESTIONS)) {
      expect(q.text.length, id).toBeGreaterThan(5)
      const values = q.kind === 'slider' ? [q.min, q.max] : q.options.map((o) => o.id)
      for (const v of values) {
        const p = answer(base(), id, v)
        expect(q.get(p), id).toBe(v)
        expect(q.why(v, p), id).toMatch(/\S.{15,}/)
      }
    }
  })
  it('cümleler cevaba göre değişir (yaş, epilepsi, gözlük, muayene)', () => {
    expect(QUESTIONS.age.why('18-39')).toMatch(/kendi başlangıcına/)
    expect(QUESTIONS.age.why('60-69')).toMatch(/yakın gözlüğün/)
    expect(QUESTIONS.seizure.why('no')).toMatch(/açık/)
    expect(QUESTIONS.seizure.why('unsure')).toMatch(/kapalı/)
    expect(QUESTIONS.correction.why('none')).toMatch(/aynı koşuldaki/)
    expect(QUESTIONS.correction.why('reading')).toMatch(/aynı gözlükle/)
    expect(QUESTIONS.lastExam.why('gt2', base())).toMatch(/40 yaş üstünde/)
    expect(QUESTIONS.lastExam.why('gt2', { ...base(), ageBand: '18-39' })).toMatch(/Bilgi'den/)
    expect(QUESTIONS.stressControl.why(2)).toMatch(/Nef açıksa/)
  })
  it('stres cevapları iki maddeyi ayrı yazar; missing sırayı korur', () => {
    let p = answer(base(), 'stressControl', 3)
    p = answer(p, 'stressOverwhelmed', 1)
    expect(p.stress).toEqual({ control: 3, overwhelmed: 1 })
    expect(missing(base(), ['sleep', 'age', 'nightPhone'])).toEqual(['sleep', 'nightPhone'])
    expect(missing(base(), ['yok'])).toEqual([])
    expect(isOlder(base())).toBe(true)
  })
})

describe('Ana sayfa kartı', () => {
  it('akşam kontrolü 18:00 sonrası; öğlen yok; kurulum bitmeden yok', () => {
    expect(pendingCard(base(), at('2026-09-25T12:00:00'))).toBeNull()
    expect(pendingCard(base(), at('2026-09-25T18:30:00'))).toBe('evening')
    expect(pendingCard({ ...base(), date: null }, at('2026-09-25T18:30:00'))).toBeNull()
  })
  it('"Sonra" ertesi akşama erteler; cevaplanınca bir daha gelmez', () => {
    const later = snooze(base(), 'evening', at('2026-09-25T19:00:00'))
    expect(pendingCard(later, at('2026-09-25T21:00:00'))).toBeNull()
    expect(pendingCard(later, at('2026-09-26T18:05:00'))).toBe('evening')
    let done = base()
    for (const [id, v] of [['screenHours', '4-6'], ['sleep', 6], ['nightPhone', 'never']]) done = answer(done, id, v)
    expect(pendingCard(done, at('2026-09-25T21:00:00'))).toBeNull()
  })
  it('stres kartı 7. günden sonra; "Geç" derse bir daha sorulmaz', () => {
    let p = base()
    for (const [id, v] of [['screenHours', '4-6'], ['sleep', 6], ['nightPhone', 'never']]) p = answer(p, id, v)
    expect(pendingCard(p, at('2026-09-30T10:00:00'))).toBeNull()
    expect(pendingCard(p, at('2026-10-02T10:00:00'))).toBe('stress')
    expect(pendingCard(skip(p, 'stress', at('2026-10-02T10:00:00')), at('2026-10-20T10:00:00'))).toBeNull()
    expect(GROUPS.stress).toEqual(['stressControl', 'stressOverwhelmed'])
  })
})

describe('Sorularım satırları', () => {
  it('cevaplı satır değer, cevapsız satır ne zaman sorulacağını gösterir', () => {
    const rows = questionRows({ ...base(), seizure: 'no', firstLook: { blinks: 4, seconds: 20, method: 'self', date: null } })
    const by = Object.fromEntries(rows.map((r) => [r.id, r]))
    expect(by.age.value).toBe('40–49')
    expect(by.flags.value).toBe('Hiçbiri yok')
    expect(by.seizure.value).toBe('Açık')
    expect(by.firstLook.value).toBe('4 kırpma · kendi sayım')
    expect(by.sleep.value).toBeNull()
    expect(by.sleep.later).toBe('akşam sorulacak')
    expect(normalizeProfile(null).prompts).toEqual({})
  })
})
