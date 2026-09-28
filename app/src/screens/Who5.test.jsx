// İyi oluş (WHO-5) ekran akışı: 5 soru, geri dönüş, kayıt ve sonuç.
import { describe, it, expect, vi } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const { default: Who5 } = await import('./Who5.jsx')
const { WHO5_TEXT } = await import('../lib/who5.js')

async function mount(props) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(async () => root.render(h(Who5, props)))
  const btn = (label) => container.querySelectorAll((n) => n.nodeName === 'BUTTON' && n.textContent.includes(label))[0]
  return { container, root, btn, text: () => container.textContent }
}

describe('WHO-5 ekranı', () => {
  it('resmi metin: 5 madde ve 6 seçenek (5 → 0)', () => {
    const T = WHO5_TEXT.tr
    expect(T.items).toHaveLength(5)
    expect(T.options.map((o) => o.value)).toEqual([5, 4, 3, 2, 1, 0])
    expect(T.items[1]).toBe('Kendimi sakin ve gevşemiş hissettim')
  })
  it('5 cevap → ham 3+4+2+5+1 = 15, puan 60 kaydedilir; ilk ölçüm sonucu görünür', async () => {
    const onSave = vi.fn()
    const r = await mount({ sessions: [], onSave, onClose: () => {}, onProgress: () => {} })
    expect(r.text()).toContain('Kendimi neşeli ve keyifli hissettim')
    expect(r.text()).toContain('Son iki haftada kendini')
    await act(async () => r.btn('Geçen zamanın yarısından çoğunda').click()) // 3
    expect(r.text()).toContain('2 / 5')
    await act(async () => r.btn('Hiçbir zaman').click()) // yanlış seçim
    expect(r.text()).toContain('3 / 5')
    await act(async () => r.btn('Önceki').click()) // geri: 2. soru yeniden
    expect(r.text()).toContain('2 / 5')
    await act(async () => r.btn('Çoğu zaman').click()) // 4
    await act(async () => r.btn('Geçen zamanın yarısından daha azında').click()) // 2
    await act(async () => r.btn('Her zaman').click()) // 5
    await act(async () => r.btn('Bazen').click()) // 1
    expect(onSave).toHaveBeenCalledTimes(1)
    const rec = onSave.mock.calls[0][0]
    expect(rec).toMatchObject({ type: 'who5', raw: 15, score: 60, answers: [3, 4, 2, 5, 1] })
    expect(r.text()).toContain('60')
    expect(r.text()).toContain('İlk ölçümün;')
    await act(async () => r.root.unmount())
  })
  it('önceki ölçüm varsa değişim ve düşük puan notu', async () => {
    const onSave = vi.fn()
    const prev = { type: 'who5', date: '2026-09-01T10:00:00.000Z', answers: [3, 3, 3, 3, 3], raw: 15, score: 60, seconds: 0 }
    const r = await mount({ sessions: [prev], onSave, onClose: () => {}, onProgress: () => {} })
    for (let i = 0; i < 5; i++) await act(async () => r.btn('Bazen').click()) // 5 × 1 = 5 → 20
    expect(onSave.mock.calls[0][0].score).toBe(20)
    expect(r.text()).toContain('İlk ölçümün 60')
    expect(r.text()).toContain('· -40')
    expect(r.text()).toContain('sağlık uzmanıyla')
    await act(async () => r.root.unmount())
  })
})
