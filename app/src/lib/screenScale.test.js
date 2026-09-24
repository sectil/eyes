import { describe, it, expect } from 'vitest'
import { pxPerMmFromPpi, resolutionMatches, autoCalibration, resolveAutoCalibration } from './screenScale.js'

// Test verisi (örnek; gerçek tablo iphoneScreens.json'dadır)
const table = {
  'Test1,1': { name: 'Örnek 3x', ppi: 460, px: [1170, 2532] },
  'Test2,1': { name: 'Örnek 2x', ppi: 326, px: [750, 1334] },
}

describe('pxPerMmFromPpi', () => {
  it('460 ppi, 3x → 153.3 point/inç → ~6.04 px/mm', () => {
    expect(pxPerMmFromPpi(460, 3)).toBeCloseTo(460 / 3 / 25.4, 9)
    expect(pxPerMmFromPpi(460, 3)).toBeCloseTo(6.037, 3)
  })
  it('326 ppi, 2x → ~6.42 px/mm', () => {
    expect(pxPerMmFromPpi(326, 2)).toBeCloseTo(6.417, 3)
  })
  it('geçersiz girdide null', () => {
    expect(pxPerMmFromPpi(0, 3)).toBeNull()
    expect(pxPerMmFromPpi(460, 0)).toBeNull()
  })
})

describe('resolutionMatches', () => {
  it('yön farketmez', () => {
    expect(resolutionMatches([1170, 2532], { nativeWidth: 1170, nativeHeight: 2532 })).toBe(true)
    expect(resolutionMatches([1170, 2532], { nativeWidth: 2532, nativeHeight: 1170 })).toBe(true)
  })
  it('farklı çözünürlükte false', () => {
    expect(resolutionMatches([1170, 2532], { nativeWidth: 1179, nativeHeight: 2556 })).toBe(false)
  })
})

describe('autoCalibration', () => {
  const screen3x = { nativeScale: 3, nativeWidth: 1170, nativeHeight: 2532 }
  it('tablodaki model + uyuşan çözünürlük → otomatik', () => {
    const r = autoCalibration('Test1,1', screen3x, table)
    expect(r.pxPerMm).toBeCloseTo(6.037, 3)
    expect(r.name).toBe('Örnek 3x')
  })
  it('Ekran Büyütme (nativeScale büyür) → point daha büyük, px/mm küçülür', () => {
    const zoomed = { ...screen3x, nativeScale: 3.5 }
    expect(autoCalibration('Test1,1', zoomed, table).pxPerMm).toBeLessThan(6.037)
  })
  it('tabloda olmayan model → null (manuel yedek)', () => {
    expect(autoCalibration('iPhone99,9', screen3x, table)).toBeNull()
  })
  it('çözünürlük uyuşmazsa → null', () => {
    expect(autoCalibration('Test2,1', screen3x, table)).toBeNull()
  })
})

describe('resolveAutoCalibration', () => {
  const screen3x = { nativeScale: 3, nativeWidth: 1170, nativeHeight: 2532 }
  it('model eşleşirse doğrudan', () => {
    const r = resolveAutoCalibration('Test1,1', screen3x, table)
    expect(r.cal.name).toBe('Örnek 3x')
    expect(r.reason).toBeNull()
  })
  it('bilinmeyen model ama çözünürlük tek ppi ile eşleşiyor → yedek', () => {
    const r = resolveAutoCalibration('iPhone99,9', screen3x, table)
    expect(r.cal.byResolution).toBe(true)
    expect(r.cal.pxPerMm).toBeCloseTo(6.037, 3)
  })
  it('aynı çözünürlükte farklı ppi → yedek yok, neden var', () => {
    const t2 = { ...table, 'Test3,1': { name: 'Farklı', ppi: 470, px: [1170, 2532] } }
    const r = resolveAutoCalibration('iPhone99,9', screen3x, t2)
    expect(r.cal).toBeNull()
    expect(r.reason).toMatch(/model tabloda yok/)
  })
  it('ekran bilgisi yoksa neden döner', () => {
    expect(resolveAutoCalibration('Test1,1', null, table).reason).toMatch(/Ekran bilgisi/)
  })
  it('hiç eşleşme yok → çözünürlük bilgisiyle neden', () => {
    const r = resolveAutoCalibration('Test1,1', { nativeScale: 3, nativeWidth: 999, nativeHeight: 1999 }, table)
    expect(r.cal).toBeNull()
    expect(r.reason).toMatch(/999×1999/)
  })
})
