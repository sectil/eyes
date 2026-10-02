import { describe, it, expect } from 'vitest'
import {
  letterHeightMm,
  logMARForHeight,
  renderSpec,
  smallestDrawableLogMAR,
  decimalAcuity,
  snellen20,
  snellen6,
  rasterizeE,
  eRects,
  coverageToSrgbByte,
  E_AREA_UNITS,
  formatEquivalents,
  formatLogMAR,
  roundLogMAR,
} from './optotype.js'

describe('letterHeightMm', () => {
  it('logMAR 0 @ 40 cm ≈ 0.582 mm (5 yay dakikası)', () => {
    expect(letterHeightMm(0, 400)).toBeCloseTo(0.5818, 3)
  })
  it('logMAR 1.0 @ 40 cm ≈ 5.82 mm', () => {
    expect(letterHeightMm(1, 400)).toBeCloseTo(5.818, 2)
  })
  it('logMAR 0 @ 6 m ≈ 8.73 mm (klinik uzak chart)', () => {
    expect(letterHeightMm(0, 6000)).toBeCloseTo(8.727, 2)
  })
})

describe('logMARForHeight', () => {
  it('letterHeightMm ile tersinir', () => {
    for (const l of [-0.3, 0, 0.3, 0.7, 1.3]) {
      expect(logMARForHeight(letterHeightMm(l, 400), 400)).toBeCloseTo(l, 9)
    }
  })
  it('aynı harf daha uzaktan bakılınca daha küçük logMAR', () => {
    const h = letterHeightMm(0.5, 400)
    expect(logMARForHeight(h, 500)).toBeLessThan(0.5)
    expect(logMARForHeight(h, 500)).toBeCloseTo(0.5 - Math.log10(500 / 400), 3)
  })
})

// Gerçek iPhone ekranları (iphoneScreens.json): 458 ppi (ör. XS, 11 Pro, 14 Plus), 460 ppi (ör. 12, 13, 14 Pro),
// 476 ppi (12 mini, 13 mini); hepsi dpr 3
const DEVICES = [458, 460, 476].map((ppi) => ({ ppi, dpr: 3, pxPerMm: ppi / 25.4 / 3 }))

describe('renderSpec (H1: birim yuvarlanmaz)', () => {
  it('458/460/476 ppi: gerçekleşen logMAR = hedef (±0,001), taban üstündeki her hedefte', () => {
    for (const { pxPerMm, dpr } of DEVICES) {
      for (const mm of [300, 360, 400, 440]) {
        const floor = smallestDrawableLogMAR(mm, pxPerMm, dpr)
        for (let t = -0.3; t <= 1.3 + 1e-9; t += 0.01) {
          if (t < floor) continue
          const s = renderSpec(t, mm, pxPerMm, dpr)
          expect(s.drawable).toBe(true)
          expect(Math.abs(s.realizedLogMAR - t)).toBeLessThanOrEqual(0.001)
          // Çizilen yükseklik de hedefi verir (AcuityTest bununla kaydeder)
          expect(Math.abs(logMARForHeight(s.heightCssPx / pxPerMm, mm) - t)).toBeLessThanOrEqual(0.001)
        }
      }
    }
  })

  it('0,1 ve 0,0 hedefleri birbirinden ayrı boyutta çizilir (eskiden 0,155 / −0,021 kümeleri)', () => {
    const { pxPerMm, dpr } = DEVICES[0]
    const a = renderSpec(0.1, 400, pxPerMm, dpr)
    const b = renderSpec(0.0, 400, pxPerMm, dpr)
    const c = renderSpec(-0.1, 400, pxPerMm, dpr)
    expect(a.heightCssPx / b.heightCssPx).toBeCloseTo(10 ** 0.1, 6)
    expect(b.heightCssPx / c.heightCssPx).toBeCloseTo(10 ** 0.1, 6)
  })

  it('dönen şekil geriye uyumlu: drawable, unitCssPx, heightCssPx = 5 × birim, unitDevicePx = birim × dpr', () => {
    const s = renderSpec(0.5, 400, 6.3, 3)
    expect(s.drawable).toBe(true)
    expect(s.heightCssPx).toBeCloseTo(s.unitCssPx * 5, 9)
    expect(s.unitDevicePx).toBeCloseTo(s.unitCssPx * 3, 9)
    expect(Number.isInteger(s.unitDevicePx)).toBe(false)
  })

  it('taban 1 cihaz pikseli: tam tabanda çizilir (birim 1), altında çizilemez', () => {
    for (const { pxPerMm, dpr } of DEVICES) {
      for (const mm of [300, 400, 440]) {
        const floor = smallestDrawableLogMAR(mm, pxPerMm, dpr)
        const at = renderSpec(floor, mm, pxPerMm, dpr)
        expect(at.drawable).toBe(true)
        expect(at.unitDevicePx).toBeCloseTo(1, 9)
        const below = renderSpec(floor - 0.005, mm, pxPerMm, dpr)
        expect(below).toEqual({ drawable: false, unitCssPx: 0, heightCssPx: 0, unitDevicePx: 0, realizedLogMAR: null })
      }
    }
  })

  it('ekranın en küçük harfi her mesafede çizilir (kayan nokta 0,9999… birimi düşürmez)', () => {
    // AcuityTest hedefi tabana kısar (max(x, taban)); tabanda harf görünmezse deneme boş kalır
    for (const ppi of [326, 401, 458, 460, 476]) {
      for (const dpr of [2, 3]) {
        const px = ppi / 25.4 / dpr
        for (let mm = 250; mm <= 600; mm += 1) {
          const s = renderSpec(smallestDrawableLogMAR(mm, px, dpr), mm, px, dpr)
          expect(s.drawable, `${ppi} ppi dpr ${dpr} ${mm} mm`).toBe(true)
          expect(s.unitDevicePx).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })

  it('1 cihaz pikselinden küçük birim çizilemez; geçersiz ölçü çizilmez', () => {
    expect(renderSpec(-0.3, 400, 6.3, 1).drawable).toBe(false)
    expect(renderSpec(0.5, 400, NaN, 3).drawable).toBe(false)
  })
})

describe('smallestDrawableLogMAR', () => {
  it('yüksek dpr ekran daha küçük harf gösterebilir', () => {
    expect(smallestDrawableLogMAR(400, 6.3, 3)).toBeLessThan(
      smallestDrawableLogMAR(400, 6.3, 1),
    )
  })
  it('458 ppi / 40 cm tabanı ≈ −0,322', () => {
    expect(smallestDrawableLogMAR(400, 458 / 25.4 / 3, 3)).toBeCloseTo(-0.322, 3)
  })
})

// Testin kendi sRGB çözücüsü (kaynaktan alınmaz: gamma kaldırılırsa test bunu görsün)
const srgbToLinear = (b) => {
  const v = b / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const inkOf = (rgba) => {
  let ink = 0
  for (let k = 0; k < rgba.length; k += 4) ink += 1 - srgbToLinear(rgba[k])
  return ink
}

describe('rasterizeE (K6: alan kaplaması, doğrusal ışıkta karışım)', () => {
  const UNITS = [1, 1.07, 1.3, 1.5, 1.77, 2.2, 3.7, 7.25, 13.1]

  it('toplam mürekkep = E alanı (17 birim²) ±%1, sRGB baytları doğrusal ışığa çevrilerek ölçülür', () => {
    for (const u of UNITS) {
      for (const dir of ['right', 'down', 'left', 'up']) {
        const r = rasterizeE(u, dir)
        const area = E_AREA_UNITS * u * u
        expect(Math.abs(inkOf(r.rgba) - area) / area).toBeLessThanOrEqual(0.01)
        // Kaplama toplamı alanın kendisi (kayan nokta dışında hatasız)
        expect(r.coverage.reduce((a, b) => a + b, 0)).toBeCloseTo(area, 6)
      }
    }
  })

  it('yarım kaplamalı piksel sRGB ≈ 188 (sRGB\'de karışsa 128 olurdu)', () => {
    // u = 1,5, köşe (0,0): sırt x ∈ [0; 1,5] → 1. sütun yarım kaplı; (1,2) pikselinde kol yok
    const r = rasterizeE(1.5, 'right', { size: 8, originX: 0, originY: 0 })
    const k = 2 * 8 + 1
    expect(r.coverage[k]).toBeCloseTo(0.5, 9)
    expect(Math.abs(r.rgba[4 * k] - 188)).toBeLessThanOrEqual(1)
    expect(coverageToSrgbByte(0.5)).toBe(188)
  })

  it('siyah #000 beyaz #fff üstünde; tam kaplı 0, boş 255, opak', () => {
    const r = rasterizeE(4, 'right')
    const vals = new Set()
    for (let k = 0; k < r.rgba.length; k += 4) {
      vals.add(r.rgba[k])
      expect(r.rgba[k + 1]).toBe(r.rgba[k])
      expect(r.rgba[k + 2]).toBe(r.rgba[k])
      expect(r.rgba[k + 3]).toBe(255)
    }
    expect([...vals].sort((a, b) => a - b)).toEqual([0, 255])
  })

  it('tuval ceil(5u) cihaz pikseli, E ortalı', () => {
    const r = rasterizeE(1.3, 'up')
    expect(r.size).toBe(7)
    expect(r.originX).toBeCloseTo((7 - 6.5) / 2, 9)
    expect(r.originY).toBeCloseTo((7 - 6.5) / 2, 9)
  })

  it('yön geometriyle: açık taraf istenen yöne bakar', () => {
    const MASKS = {
      right: ['#####', '#....', '#####', '#....', '#####'],
      left: ['#####', '....#', '#####', '....#', '#####'],
      down: ['#####', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
      up: ['#.#.#', '#.#.#', '#.#.#', '#.#.#', '#####'],
    }
    const u = 4
    for (const [dir, rows] of Object.entries(MASKS)) {
      const r = rasterizeE(u, dir)
      expect(r.size).toBe(20)
      for (let cy = 0; cy < 5; cy++) {
        for (let cx = 0; cx < 5; cx++) {
          const k = (cy * u + 2) * r.size + (cx * u + 2)
          expect(r.coverage[k], `${dir} (${cx},${cy})`).toBe(rows[cy][cx] === '#' ? 1 : 0)
        }
      }
    }
  })

  it('dört yönde mürekkep ve gri piksel dağılımı aynı (yön ipucu vermez)', () => {
    for (const u of [1.3, 2.2]) {
      const hist = (dir) => [...rasterizeE(u, dir).rgba.filter((_, i) => i % 4 === 0)].sort((a, b) => a - b).join(',')
      expect(hist('down')).toBe(hist('right'))
      expect(hist('up')).toBe(hist('right'))
      expect(hist('left')).toBe(hist('right'))
    }
  })

  it('bilinmeyen yön ya da geçersiz birim hata verir (sessizce yanlış E çizilmez)', () => {
    expect(() => eRects('diag')).toThrow(RangeError)
    expect(() => rasterizeE(0, 'right')).toThrow(RangeError)
    expect(() => rasterizeE(NaN, 'right')).toThrow(RangeError)
  })
})

describe('formatEquivalents (H8)', () => {
  it('plandaki örnekler', () => {
    expect(formatEquivalents(0.1)).toEqual({ logMAR: 0.1, logMARText: '0,10', snellen20: '20/25', snellen6: '6/7,6', decimal: '0,79', text: '20/25 · 6/7,6 · 0,79' })
    expect(formatEquivalents(0).text).toBe('20/20 · 6/6 · 1,00')
    expect(formatEquivalents(0.3).text).toBe('20/40 · 6/12 · 0,50')
  })

  it('önce 2 haneye yuvarlanır: 0,004 → 0,00 ile 20/20 · 6/6 · 1,00 (eskiden 6/6.1 · 0,99)', () => {
    expect(formatEquivalents(0.004)).toMatchObject({ logMARText: '0,00', text: '20/20 · 6/6 · 1,00' })
    expect(formatEquivalents(0.096).text).toBe(formatEquivalents(0.1).text)
    expect(snellen20(0.123)).toBe(formatEquivalents(0.12).snellen20)
  })

  it('eksi değerler gerçek eksiyle; −0,00 yazılmaz; yuvarlama iki yönde simetrik', () => {
    expect(formatEquivalents(-0.1)).toMatchObject({ logMARText: '−0,10', snellen20: '20/16', snellen6: '6/4,8', decimal: '1,26' })
    expect(formatEquivalents(-0.004).logMARText).toBe('0,00')
    expect(formatLogMAR(-0.004)).toBe('0,00')
    expect(roundLogMAR(0.105)).toBe(0.11)
    expect(roundLogMAR(-0.105)).toBe(-0.11)
    expect(roundLogMAR(1.005)).toBe(1.01)
    expect(Object.is(roundLogMAR(-0.001), 0)).toBe(true)
  })

  it('−0,3…1,3 aralığında: nokta yok, 6/x tam sayıda ",0" yok, 20/x tam sayı', () => {
    for (let i = -30; i <= 130; i++) {
      const f = formatEquivalents(i / 100)
      for (const s of [f.logMARText, f.snellen20, f.snellen6, f.decimal, f.text]) expect(s).not.toContain('.')
      expect(f.snellen6).not.toMatch(/,0$/)
      expect(f.snellen20).toMatch(/^20\/\d+$/)
      expect(f.snellen6).toMatch(/^6\/\d+(,\d)?$/)
      expect(f.decimal).toMatch(/^\d,\d\d$/)
    }
  })

  it('geçersiz değer → null; eski yardımcılar aynı biçimde', () => {
    expect(formatEquivalents(null)).toBeNull()
    expect(formatEquivalents(NaN)).toBeNull()
    expect(snellen20(null)).toBe('—')
    expect(snellen20(0)).toBe('20/20')
    expect(snellen6(0)).toBe('6/6')
    expect(snellen20(1)).toBe('20/200')
    expect(snellen6(1)).toBe('6/60')
    expect(snellen6(0.1)).toBe('6/7,6')
    expect(decimalAcuity(0)).toBeCloseTo(1, 9)
  })
})
