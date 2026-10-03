// Dik Dur kamera hesabı: örnek, ortanca duruş, ayar, çizgideki yer, yargı, yüzde eki (lib/postureSense.js)
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { sampleOf, poseOf, calibrate, progressOf, judge, percentLoc, resultText, IN_POSE } from './postureSense.js'

const DOC = readFileSync(new URL('../../../docs/yol-haritasi/tasarim/dik-dur/metin-D1-onay.md', import.meta.url), 'utf8')
const many = (d, p, n = 9) => Array.from({ length: n }, (_, i) => ({ d: d + (i % 3) - 1, p: p + ((i % 2) - 0.5) * 0.2 }))

describe('dik dur kamera · örnek ve ayar', () => {
  it('yüz yoksa ya da değer eksikse örnek yok', () => {
    expect(sampleOf({ face: false, mm: 400, headY: 1 })).toBeNull()
    expect(sampleOf({ face: true, mm: 400 })).toBeNull()
    expect(sampleOf({ face: true, mm: 400, headY: -2 })).toEqual({ d: 400, p: -2 })
    expect(sampleOf({ face: true, distanceMm: 410, headY: 0 })).toEqual({ d: 410, p: 0 })
  })
  it('ortanca duruş en az 5 örnekle', () => {
    expect(poseOf(many(400, 0, 4))).toBeNull()
    expect(poseOf(many(400, 0))).toEqual({ d: 400, p: -0.1 }) // 9 örnekten 5'i -0.1
  })
  it('iki duruş birbirine çok yakınsa kamera yargılamaz', () => {
    expect(calibrate({ d: 400, p: 0 }, { d: 405, p: 0.5 }).ok).toBe(false)
    expect(calibrate({ d: 400, p: 0 }, { d: 425, p: 3 }).ok).toBe(true)
  })
})

describe('dik dur kamera · yargı', () => {
  const cal = calibrate({ d: 400, p: 0 }, { d: 425, p: 3 })
  it('çizgideki yer: normal 0, dik 1', () => {
    expect(progressOf(cal, { d: 400, p: 0 })).toBeCloseTo(0)
    expect(progressOf(cal, { d: 425, p: 3 })).toBeCloseTo(1)
    expect(progressOf(cal, { d: 412.5, p: 1.5 })).toBeCloseTo(0.5)
  })
  it('dik duruşa yakınsa içinde; çene adımında baş öne eğikse değil', () => {
    expect(judge(cal, { d: 424, p: 3 }, 'uzat').inPose).toBe(true)
    expect(judge(cal, { d: 405, p: 0.5 }, 'uzat').inPose).toBe(false)
    expect(judge(cal, { d: 440, p: -3 }, 'cene')).toMatchObject({ inPose: false, nod: true })
    expect(IN_POSE).toBe(0.6)
  })
  it('ayar yoksa ya da yetersizse yargı yok', () => {
    expect(judge(null, { d: 400, p: 0 }, 'uzat').inPose).toBeNull()
    expect(judge(calibrate({ d: 400, p: 0 }, { d: 401, p: 0 }), { d: 400, p: 0 }, 'uzat').inPose).toBeNull()
  })
})

describe('dik dur kamera · bitiş satırı', () => {
  it('yüzde eki', () => {
    expect([0, 3, 10, 20, 30, 40, 50, 60, 66, 70, 80, 90, 95, 100].map(percentLoc)).toEqual([
      "%0'ında", "%3'ünde", "%10'unda", "%20'sinde", "%30'unda", "%40'ında", "%50'sinde", "%60'ında", "%66'sında", "%70'inde", "%80'inde", "%90'ında", "%95'inde", "%100'ünde",
    ])
  })
  it('onaylı cümle', () => {
    expect(DOC).toContain(resultText(0.8))
  })
})
