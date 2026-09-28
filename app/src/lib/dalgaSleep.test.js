import { describe, it, expect, vi } from 'vitest'
// Ses öğesi taklidi: çalma isteğinin ne zaman yapıldığını görmek için
const { mediaPlay } = vi.hoisted(() => ({ mediaPlay: vi.fn(() => Promise.resolve(true)) }))
vi.mock('./audioUnmute.js', () => ({ mediaPlay, mediaKeepAlive: vi.fn() }))
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
  it('adresler: döngü WAV; kısılma kendi uzunluğundaki parçadan, geç geçişte kalan süre kadar ortasından', async () => {
    const { sleepLoopUrl, sleepFadeUrl } = await import('./dalgaSleep.js')
    expect(sleepLoopUrl()).toMatch(/sleep\/sakin-loop\.wav$/)
    expect(sleepFadeUrl(180)).toMatch(/sleep\/sakin-fade-180\.mp3$/)
    expect(sleepFadeUrl(60)).toMatch(/sleep\/sakin-fade-60\.mp3$/)
    expect(sleepFadeUrl(150, 120)).toMatch(/sleep\/sakin-fade-150\.mp3#t=30$/) // 30 sn geç geçiş
  })
  it('her kısılma süresinin dosyası uygulamada var (ad değişirse test düşer)', async () => {
    const { SLEEP_FADES, fadeSeconds } = await import('./dalgaSleep.js')
    const fs = await import('node:fs')
    const dir = new URL('../../public/sleep/', import.meta.url)
    expect(fs.existsSync(new URL('sakin-loop.wav', dir))).toBe(true)
    for (const F of SLEEP_FADES) expect(fs.existsSync(new URL(`sakin-fade-${F}.mp3`, dir))).toBe(true)
    // tam dakikalık her süre (1–120 dk) bu kümeden bir kısılmaya düşer
    for (let m = 1; m <= 120; m++) expect(SLEEP_FADES).toContain(fadeSeconds(m * 60))
  })
  it('çalma dokunuşla aynı çağrıda istenir (araya await girmez); reddedilirse blocked', async () => {
    mediaPlay.mockClear()
    const { createSleepPlayer } = await import('./dalgaSleep.js')
    const p = createSleepPlayer()
    const run = p.start({ totalSec: 300 }) // beklemeden
    expect(mediaPlay).toHaveBeenCalledTimes(1)
    expect(mediaPlay).toHaveBeenCalledWith(expect.stringMatching(/sleep\/sakin-loop\.wav$/), { loop: true })
    expect(await run).toBe(true)
    p.stop()
    mediaPlay.mockResolvedValueOnce(false)
    const q = createSleepPlayer()
    expect(await q.start({ totalSec: 300 })).toBe(false)
    expect(q.phase).toBe('blocked')
    q.stop()
  })
})

describe('uyku oynatıcı: iPhone yerel oynatıcı (Bug 22)', () => {
  const fake = (over = {}) => ({
    sleepStart: vi.fn(async () => ({ playing: true, time: 0, gain: 1, outputVolume: 0.5, category: 'AVAudioSessionCategoryPlayback', route: 'Speaker' })),
    sleepStop: vi.fn(async () => {}),
    sleepStatus: vi.fn(async () => ({ playing: true, time: 3, gain: 1, outputVolume: 0.5, route: 'Speaker' })),
    ...over,
  })
  it('süre ve kısılma iOS\'a verilir; çalınca döngüde, durunca iOS da durur', async () => {
    const { createNativeSleepPlayer } = await import('./dalgaSleep.js')
    const plugin = fake()
    const p = createNativeSleepPlayer(plugin)
    expect(await p.prepare()).toBe(true)
    expect(await p.start({ totalSec: 300 })).toBe(true)
    expect(plugin.sleepStart).toHaveBeenCalledWith({ seconds: 300, fade: 150 })
    expect(p.phase).toBe('loop')
    expect(p.diag).toMatchObject({ native: true, played: true, info: { route: 'Speaker', outputVolume: 0.5 } })
    await p.refresh()
    expect(p.diag.info.time).toBe(3)
    p.stop()
    expect(plugin.sleepStop).toHaveBeenCalled()
    expect(p.phase).toBe('stopped')
  })
  it('iOS reddederse blocked ve hata metni; "dokun, başlat" yeniden dener', async () => {
    const { createNativeSleepPlayer } = await import('./dalgaSleep.js')
    const err = Object.assign(new Error('Uyku sesi pakette yok'), { code: 'MISSING' })
    const plugin = fake({ sleepStart: vi.fn().mockRejectedValueOnce(err).mockResolvedValueOnce({ playing: true }) })
    const p = createNativeSleepPlayer(plugin)
    expect(await p.start({ totalSec: 60 })).toBe(false)
    expect(p.phase).toBe('blocked')
    expect(p.diag.err).toBe('MISSING: Uyku sesi pakette yok')
    expect(await p.resume()).toBe(true)
    expect(p.phase).toBe('loop')
    p.stop()
  })
  it('başlarken durdurulursa iOS\'taki ses de durdurulur', async () => {
    const { createNativeSleepPlayer } = await import('./dalgaSleep.js')
    const plugin = fake()
    const p = createNativeSleepPlayer(plugin)
    const run = p.start({ totalSec: 60 })
    p.stop()
    expect(await run).toBe(false)
    expect(plugin.sleepStop).toHaveBeenCalledTimes(2)
  })
})
