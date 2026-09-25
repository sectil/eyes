import { describe, it, expect } from 'vitest'
import { normalizeIdentity, emptyIdentity, validBirthDate, ageFromBirthDate, initialFor, hasIdentity, AVATAR_HUES } from './identity.js'
import { ageBandFromAge } from './profile.js'

const NOW = new Date('2026-09-25T12:00:00')

describe('normalizeIdentity', () => {
  it('boş/bozuk → boş kimlik', () => {
    expect(normalizeIdentity(null)).toEqual(emptyIdentity())
    expect(normalizeIdentity('x')).toEqual(emptyIdentity())
  })
  it('ad kırpılır, tarih doğrulanır, bilinmeyen alan atılır', () => {
    const n = normalizeIdentity({ name: '  Ali  ', birthDate: '1988-03-14', avatar: { kind: 'letter', hue: 32 }, extra: 1 })
    expect(n).toEqual({ name: 'Ali', birthDate: '1988-03-14', avatar: { kind: 'letter', hue: 32, dataUrl: null } })
    expect(normalizeIdentity({ name: 'a'.repeat(60) }).name).toHaveLength(40)
    expect(normalizeIdentity({ birthDate: '2031-01-01' }).birthDate).toBeNull()
    expect(normalizeIdentity({ avatar: { hue: 999 } }).avatar.hue).toBe(AVATAR_HUES[0])
  })
  it('fotoğraf yalnızca data:image ile; yoksa harfe düşer', () => {
    expect(normalizeIdentity({ avatar: { kind: 'photo', dataUrl: 'data:image/jpeg;base64,abc' } }).avatar.kind).toBe('photo')
    expect(normalizeIdentity({ avatar: { kind: 'photo', dataUrl: 'https://x' } }).avatar.kind).toBe('letter')
    expect(normalizeIdentity({ avatar: { kind: 'photo' } }).avatar.kind).toBe('letter')
  })
})

describe('doğum tarihi', () => {
  it('validBirthDate: biçim, gerçek tarih, aralık', () => {
    expect(validBirthDate('1988-03-14', NOW)).toBe(true)
    expect(validBirthDate('1988-02-30', NOW)).toBe(false)
    expect(validBirthDate('14.03.1988', NOW)).toBe(false)
    expect(validBirthDate('2027-01-01', NOW)).toBe(false)
    expect(validBirthDate('1900-01-01', NOW)).toBe(false)
  })
  it('ageFromBirthDate doğum gününü hesaba katar', () => {
    expect(ageFromBirthDate('1988-03-14', NOW)).toBe(38)
    expect(ageFromBirthDate('1988-09-26', NOW)).toBe(37)
    expect(ageFromBirthDate('1988-09-25', NOW)).toBe(38)
    expect(ageFromBirthDate(null, NOW)).toBeNull()
  })
  it('ageBandFromAge anket aralığına çevirir', () => {
    expect(ageBandFromAge(38)).toBe('18-39')
    expect(ageBandFromAge(40)).toBe('40-49')
    expect(ageBandFromAge(72)).toBe('70+')
    expect(ageBandFromAge(NaN)).toBeNull()
  })
})

describe('initialFor / hasIdentity', () => {
  it('Türkçe büyük harf', () => {
    expect(initialFor('ilknur')).toBe('İ')
    expect(initialFor('  ')).toBe('')
  })
  it('hasIdentity', () => {
    expect(hasIdentity(null)).toBe(false)
    expect(hasIdentity({ name: 'Ali' })).toBe(true)
  })
})
