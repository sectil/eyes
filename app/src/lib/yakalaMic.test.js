import { describe, it, expect, vi } from 'vitest'
import { firstTwo, createListener, SILENCE_MS } from './yakalaMic.js'

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
  it('iki kelime duyulunca biter; metin alana gider, gönderilmez', async () => {
    const s = fakeSpeech()
    const texts = []
    const done = vi.fn()
    createListener({ start: s.start, onText: (t) => texts.push(t), onDone: done })
    await flush()
    s.cb({ text: 'çınar' })
    expect(done).not.toHaveBeenCalled()
    s.cb({ text: 'çınar vapur' })
    expect(texts).toEqual(['çınar', 'çınar vapur'])
    expect(done).toHaveBeenCalledWith({ text: 'çınar vapur', heard: true, failed: false })
    await flush()
    expect(s.stopped).toBe(1)
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
