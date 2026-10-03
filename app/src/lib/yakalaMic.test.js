import { describe, it, expect, vi } from 'vitest'
import { firstTwo, createListener, SILENCE_MS, SETTLE_MS } from './yakalaMic.js'

const flush = () => new Promise((r) => setTimeout(r, 0))

function fakeSpeech() {
  const f = { cb: null, stopped: 0 }
  f.start = vi.fn(async (onResult) => {
    f.cb = onResult
    return async () => { f.stopped++ }
  })
  return f
}

describe('Yakala Yaz mikrofonu · dinleme', () => {
  it('ilk iki kelime; noktalama atılır', () => {
    expect(firstTwo('Çınar, vapur kedi')).toBe('Çınar vapur')
    expect(firstTwo('  ')).toBe('')
  })
  it('iki kelime duyulup oturunca biter; metin alana gider, gönderilmez', async () => {
    vi.useFakeTimers()
    try {
      const s = fakeSpeech()
      const texts = []
      const done = vi.fn()
      createListener({ start: s.start, onText: (t) => texts.push(t), onDone: done })
      await vi.advanceTimersByTimeAsync(0)
      s.cb({ text: 'çınar' })
      s.cb({ text: 'çınar vapur' })
      expect(texts).toEqual(['çınar', 'çınar vapur'])
      await vi.advanceTimersByTimeAsync(SETTLE_MS - 1)
      expect(done).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(done).toHaveBeenCalledWith({ text: 'çınar vapur', heard: true, failed: false })
      await vi.advanceTimersByTimeAsync(0)
      expect(s.stopped).toBe(1)
    } finally {
      vi.useRealTimers()
    }
  })
  it('ikinci kelime harf harf gelir: yarım kelimede bitmez (cihaz: "zarf üzüm" → "Zarf üz", 2026-10-03)', async () => {
    vi.useFakeTimers()
    try {
      const s = fakeSpeech()
      const done = vi.fn()
      createListener({ start: s.start, onDone: done })
      await vi.advanceTimersByTimeAsync(0)
      s.cb({ text: 'Zarf' })
      s.cb({ text: 'Zarf üz' })
      await vi.advanceTimersByTimeAsync(300)
      s.cb({ text: 'Zarf üzü' })
      await vi.advanceTimersByTimeAsync(300)
      s.cb({ text: 'Zarf üzüm' })
      await vi.advanceTimersByTimeAsync(SETTLE_MS - 1)
      s.cb({ text: 'Zarf üzüm' }) // aynı metnin tekrarı beklemeyi uzatmaz
      expect(done).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(done).toHaveBeenCalledWith({ text: 'Zarf üzüm', heard: true, failed: false })
    } finally {
      vi.useRealTimers()
    }
  })
  it('son sonuç (isFinal) hemen bitirir', async () => {
    const s = fakeSpeech()
    const done = vi.fn()
    createListener({ start: s.start, onDone: done })
    await flush()
    s.cb({ text: 'zarf üzüm', isFinal: true })
    expect(done).toHaveBeenCalledWith({ text: 'zarf üzüm', heard: true, failed: false })
  })
  it('4 sn sessizlikte biter; hiçbir şey duyulmadıysa heard false (D11, deneme sayılmaz)', async () => {
    vi.useFakeTimers()
    try {
      const s = fakeSpeech()
      const done = vi.fn()
      createListener({ start: s.start, onDone: done })
      await vi.advanceTimersByTimeAsync(SILENCE_MS - 1)
      expect(done).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(done).toHaveBeenCalledWith({ text: '', heard: false, failed: false })
    } finally {
      vi.useRealTimers()
    }
  })
  it('her ara sonuç sessizlik süresini yeniden başlatır', async () => {
    vi.useFakeTimers()
    try {
      const s = fakeSpeech()
      const done = vi.fn()
      createListener({ start: s.start, onDone: done })
      await vi.advanceTimersByTimeAsync(3000)
      s.cb({ text: 'çınar' })
      await vi.advanceTimersByTimeAsync(3000)
      expect(done).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1000)
      expect(done).toHaveBeenCalledWith({ text: 'çınar', heard: true, failed: false })
    } finally {
      vi.useRealTimers()
    }
  })
  it('cihaz içi başlatma hatası (strictOnDevice) → failed: klavyeye düşülür', async () => {
    const done = vi.fn()
    createListener({ start: async () => { throw new Error('NO_ON_DEVICE') }, onDone: done })
    await flush()
    expect(done).toHaveBeenCalledWith({ text: '', heard: false, failed: true })
  })
  it('ses seviyesi dinlerken iletilir, bitince iletilmez', async () => {
    let lv = null
    const levels = []
    const l = createListener({ start: async (_cb, onLevel) => { lv = onLevel; return async () => {} }, onLevel: (x) => levels.push(x), onDone: () => {} })
    await flush()
    lv(0.4)
    l.stop()
    lv(0.9)
    expect(levels).toEqual([0.4])
  })
  it('elle durdurma bir kez biter; geç gelen sonuç yok sayılır', async () => {
    const s = fakeSpeech()
    const done = vi.fn()
    const l = createListener({ start: s.start, onDone: done })
    await flush()
    l.stop()
    l.stop()
    s.cb({ text: 'çınar vapur' })
    expect(done).toHaveBeenCalledTimes(1)
    expect(l.ended).toBe(true)
  })
})
