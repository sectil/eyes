// Okurken göz (deneme): satırlar, yanan kelime, satır dönüşü yakalama ve eşleştirme (lib/readGaze.js)
import { describe, it, expect } from 'vitest'
import { linesOf, litAt, detectSweeps, matchSweeps, analyze, payloadOf, msPerWord } from './readGaze.js'
import { PT_PER_MM } from './gazeCalib.js'

// 4 satır × 6 kelime; kelime 50 px genişliğinde, satır 22 px aralıklı
const RECTS = Array.from({ length: 24 }, (_, i) => ({ x: 20 + (i % 6) * 55, y: 100 + Math.floor(i / 6) * 22, w: 50, h: 20 }))
const T0 = 1000
const WPM = 200
// Göz yanan kelimenin ortasında (mm), gecikmeli; işaret ve gürültü ayarlanabilir
function frames({ sign = 1, lagMs = 120, noise = 0, key = 'scr', track = 1, seed = 1 } = {}) {
  let s = seed
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5 }
  const out = []
  const end = T0 + RECTS.length * msPerWord(WPM)
  for (let t = T0 - 300; t <= end + 300; t += 33) {
    const i = litAt(t - lagMs, T0, RECTS.length, WPM)
    const x = i < 0 ? 0 : (RECTS[i].x + RECTS[i].w / 2) / PT_PER_MM
    const v = sign * x + noise * rnd()
    const f = { ts: t, tracked: track > (t % 1000) / 1000, scrZ: 300 }
    if (key === 'scr') Object.assign(f, { scrLX: v, scrRX: v, scrLY: 0, scrRY: 0 })
    else Object.assign(f, { camLeftX: (Math.atan(v / 300) * 180) / Math.PI, camRightX: (Math.atan(v / 300) * 180) / Math.PI })
    out.push(f)
  }
  return out
}

describe('okurken göz · satırlar ve zaman', () => {
  it('kelime kutularından satırlar', () => {
    const ls = linesOf(RECTS)
    expect(ls.length).toBe(4)
    expect(ls[1].words).toEqual([6, 7, 8, 9, 10, 11])
  })
  it('yanan kelime: seçilen hızda sırayla, bitince yok', () => {
    expect(litAt(T0 - 1, T0, 24, 200)).toBe(-1)
    expect(litAt(T0, T0, 24, 200)).toBe(0)
    expect(litAt(T0 + 300, T0, 24, 200)).toBe(1)
    expect(litAt(T0 + 24 * 300, T0, 24, 200)).toBe(-1)
  })
  it('sola sıçrama yalnız eşiği geçince; ardışık kareler tek sıçrama', () => {
    const s = [0, 33, 66, 99, 132, 165].map((t, k) => ({ t, v: k < 3 ? 40 : 5 }))
    expect(detectSweeps(s, 20).length).toBe(1)
    expect(detectSweeps(s, 50)).toEqual([])
    expect(detectSweeps(s.map((p) => ({ ...p, v: -p.v })), 20)).toEqual([]) // sağa sıçrama sayılmaz
  })
  it('eşleştirme birer birer ve pencere içinde', () => {
    expect(matchSweeps([1000, 3000], [1100, 1200, 3700])).toEqual([{ e: 1000, f: 1100 }])
  })
})

describe('okurken göz · analiz', () => {
  it('yanan kelimeyi izleyen göz: üç dönüşün üçü, yüksek uyum, ölçüt geçer', () => {
    const r = analyze({ frames: frames(), rects: RECTS, t0: T0, wpm: WPM })
    expect(r.signal).toBe('scrX')
    expect(r.expected).toBe(3)
    expect(r.matched).toBe(3)
    expect(r.pass).toBe(true)
    expect(r.r).toBeGreaterThan(0.9) // ölçülen gecikme kadar kaydırılmış hedefle
    expect(r.lagMs).toBeGreaterThan(0)
  })
  it('işaret ters gelirse veriden bulunur', () => {
    const r = analyze({ frames: frames({ sign: -1 }), rects: RECTS, t0: T0, wpm: WPM })
    expect(r.flipped).toBe(true)
    expect(r.matched).toBe(3)
  })
  it('yalnız gürültü: dönüş yakalanmaz, ölçüt geçmez', () => {
    const fr = frames({ noise: 2 }).map((f) => ({ ...f, scrLX: (f.scrLX - f.scrLX) + ((f.ts * 7919) % 13) / 10, scrRX: undefined }))
    const r = analyze({ frames: fr, rects: RECTS, t0: T0, wpm: WPM })
    expect(r.pass).toBe(false)
  })
  it('ekran noktası yoksa kameraya göre açıya düşer', () => {
    const r = analyze({ frames: frames({ key: 'cam' }), rects: RECTS, t0: T0, wpm: WPM })
    expect(r.signal).toBe('camX')
    expect(r.matched).toBe(3)
  })
  it('yüz hiç görünmezse sinyal yok', () => {
    const r = analyze({ frames: frames().map((f) => ({ ...f, tracked: false })), rects: RECTS, t0: T0, wpm: WPM })
    expect(r).toMatchObject({ ok: false, reason: 'sinyal-yok', matched: 0, trackedShare: 0 })
  })
  it('paylaşım: yalnız sayılar, sütun adlarıyla', () => {
    const fr = frames()
    const result = analyze({ frames: fr, rects: RECTS, t0: T0, wpm: WPM })
    const p = JSON.parse(payloadOf({ result, frames: fr, rects: RECTS, t0: T0, wpm: WPM, title: 'X', build: '1' }))
    expect(p.kind).toBe('okurken-goz-deneme')
    expect(p.frames[0].length).toBe(p.cols.length)
    expect(p.result.matched).toBe(3)
  })
})
