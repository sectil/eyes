import { describe, it, expect } from 'vitest'
import { loopSeconds, fadeSeconds, fadeGain, foldTail, fadeFrom, SLEEP_FADE_MAX } from './dalgaSleep.js'
import { encodeWav } from './wav.js'

describe('uyku döngüsü', () => {
  it('Sakin döngüsü 24 ölçü = 96 sn (son ölçü sessiz)', () => {
    expect(loopSeconds('sakin')).toBe(96)
  })
  it('kısılma süresi: en çok 3 dk, en az 5 sn, kısa sürede yarısı', () => {
    expect(fadeSeconds(90 * 60)).toBe(SLEEP_FADE_MAX)
    expect(fadeSeconds(60)).toBe(30)
    expect(fadeSeconds(4)).toBe(5)
  })
  it('kısılma eğrisi 1 → 0, tekdüze azalan', () => {
    expect(fadeGain(0)).toBe(1)
    expect(fadeGain(1)).toBe(0)
    expect(fadeGain(0.5)).toBeCloseTo(0.5)
    for (let x = 0; x < 1; x += 0.1) expect(fadeGain(x + 0.1)).toBeLessThanOrEqual(fadeGain(x))
  })
  it('kuyruk başa eklenir (dikişsiz döngü)', () => {
    const d = new Float32Array([1, 2, 3, 4, 10, 20])
    expect([...foldTail(d, 4)]).toEqual([11, 22, 3, 4])
  })
  it('kısılan parça döngüyü sarar ve sessizlikle biter', () => {
    const loop = new Float32Array([1, 1, 1])
    const f = fadeFrom(loop, 7)
    expect(f.length).toBe(7)
    expect(f[0]).toBe(1)
    expect(f[6]).toBeLessThan(0.1)
  })
})

describe('WAV kodlayıcı', () => {
  it('16 bit stereo başlık ve kırpma', () => {
    const b = encodeWav([new Float32Array([0, 1, -1]), new Float32Array([0.5, 2, -2])], 22050)
    const dv = new DataView(b.buffer)
    expect(String.fromCharCode(...b.slice(0, 4))).toBe('RIFF')
    expect(dv.getUint16(22, true)).toBe(2)
    expect(dv.getUint32(24, true)).toBe(22050)
    expect(dv.getUint16(34, true)).toBe(16)
    expect(dv.getUint32(40, true)).toBe(3 * 2 * 2)
    expect(dv.getInt16(44, true)).toBe(0)
    expect(dv.getInt16(48, true)).toBe(32767) // 1 (sol)
    expect(dv.getInt16(50, true)).toBe(32767) // 2 → kırpılır
    expect(dv.getInt16(54, true)).toBe(-32768) // −2 → kırpılır
  })
})

describe('uyku oynatıcı: hazır dosyalar (Bug 22)', () => {
  it('adresler: döngü WAV, kısılan parça 3 dk\'dan kısaysa ortasından başlar', async () => {
    const { sleepLoopUrl, sleepFadeUrl } = await import('./dalgaSleep.js')
    expect(sleepLoopUrl()).toMatch(/sleep\/sakin-loop\.wav$/)
    expect(sleepFadeUrl(180)).toMatch(/sleep\/sakin-fade\.mp3$/)
    expect(sleepFadeUrl(150)).toMatch(/sleep\/sakin-fade\.mp3#t=30$/)
  })
  it('hazırlık anında: üretim yok, ilk dokunuşta çalma aynı çağrıda istenir', async () => {
    const { createSleepPlayer } = await import('./dalgaSleep.js')
    const p = createSleepPlayer()
    const t0 = Date.now()
    expect(await p.prepare({ totalSec: 300 })).toBe(true)
    expect(Date.now() - t0).toBeLessThan(50)
    expect(p.phase).toBe('ready')
    // Sahte ortamda <audio> yok: çalma reddedilir, 'blocked' olur (ekran "dokun, başlat" gösterir)
    const run = p.start({ totalSec: 300 })
    expect(await run).toBe(false)
    expect(p.phase).toBe('blocked')
    p.stop()
  })
})
