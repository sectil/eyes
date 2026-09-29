// TumblingE: harf <canvas> üzerinde, lib/optotype.js rasterizeE pikselleriyle birebir boyanır;
// yön geometride (CSS döndürmesi yok), tuvalde/SVG'de metin yok, tuval cihaz pikseline oturur.
import { describe, it, expect } from 'vitest'
import '../test/fakeDom.js'
import { createElement as h, act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { rasterizeE } from '../lib/optotype.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Sahte tuval: putImageData çağrılarını kaydeder; konum, uygulanan translate kadar kayar
const painted = []
let rectBase = { left: 0, top: 0 }
globalThis.ImageData = class {
  constructor(data, w, hgt) { this.data = data; this.width = w; this.height = hgt }
}
const mk = document.createElement
document.createElement = (t) => {
  const n = mk(t)
  if (String(t).toUpperCase() === 'CANVAS') {
    n.getContext = () => ({ putImageData: (img, x, y) => painted.push({ img, x, y, w: n.getAttribute('width'), hgt: n.getAttribute('height') }) })
    n.getBoundingClientRect = () => {
      const m = /translate\(([-\d.e]+)px, ([-\d.e]+)px\)/.exec(n.style.transform || '')
      return { left: rectBase.left + (m ? +m[1] : 0), top: rectBase.top + (m ? +m[2] : 0) }
    }
  }
  return n
}
const { createRoot } = await import('react-dom/client')
const { default: TumblingE } = await import('./TumblingE.jsx')

async function mount(el) {
  const container = document.createElement('div')
  const root = createRoot(container)
  await act(async () => root.render(el))
  return { container, root, canvas: () => container.childNodes[0] }
}

describe('TumblingE (canvas)', () => {
  it('SSR: tek <canvas>, cihaz pikseli boyutu, CSS boyu = boyut / dpr; SVG, metin ve döndürme yok', () => {
    for (const dir of ['right', 'down', 'left', 'up']) {
      const html = renderToStaticMarkup(h(TumblingE, { unit: 1.3 / 3, direction: dir, dpr: 3 }))
      const r = rasterizeE(1.3, dir)
      expect(html).toMatch(/^<canvas /)
      expect(html).toContain(`width="${r.size}"`)
      expect(html).toContain(`height="${r.size}"`)
      expect(html).toContain(`width:${r.size / 3}px`)
      expect(html).not.toMatch(/rotate|<svg|<text/i)
      expect(html).toContain('aria-hidden="true"')
    }
  })

  it('pikseller rasterizeE çıktısıyla birebir boyanır; yön değişince yeniden boyanır', async () => {
    painted.length = 0
    rectBase = { left: 0, top: 0 }
    const m = await mount(h(TumblingE, { unit: 2.2 / 3, direction: 'right', dpr: 3 }))
    const want = rasterizeE(2.2, 'right')
    expect(painted).toHaveLength(1)
    expect(painted[0].x).toBe(0)
    expect(painted[0].y).toBe(0)
    expect(painted[0].img.width).toBe(want.size)
    expect(painted[0].w).toBe(String(want.size))
    expect([...painted[0].img.data]).toEqual([...want.rgba])
    await act(async () => m.root.render(h(TumblingE, { unit: 2.2 / 3, direction: 'up', dpr: 3 })))
    expect(painted).toHaveLength(2)
    expect([...painted[1].img.data]).toEqual([...rasterizeE(2.2, 'up').rgba])
    await act(async () => m.root.unmount())
  })

  it('tuval cihaz pikseli ızgarasına oturur (kayma < 0,5 cihaz pikseli) ve yeniden çizimde titremez', async () => {
    rectBase = { left: 10.2, top: 20.5 }
    const m = await mount(h(TumblingE, { unit: 0.5, direction: 'left', dpr: 3 }))
    const at = () => m.canvas().getBoundingClientRect()
    const check = () => {
      const r = at()
      expect(Math.abs(r.left * 3 - Math.round(r.left * 3))).toBeLessThan(1e-6)
      expect(Math.abs(r.top * 3 - Math.round(r.top * 3))).toBeLessThan(1e-6)
      expect(Math.abs(r.left - rectBase.left) * 3).toBeLessThanOrEqual(0.5 + 1e-9)
      expect(Math.abs(r.top - rectBase.top) * 3).toBeLessThanOrEqual(0.5 + 1e-9)
    }
    check()
    const first = m.canvas().style.transform
    expect(first).toMatch(/^translate\(/)
    await act(async () => m.root.render(h(TumblingE, { unit: 0.5, direction: 'down', dpr: 3 })))
    expect(m.canvas().style.transform).toBe(first)
    check()
    await act(async () => m.root.unmount())
  })

  it('çizilemeyen birimde hiçbir şey çizilmez', () => {
    expect(renderToStaticMarkup(h(TumblingE, { unit: 0, direction: 'right', dpr: 3 }))).toBe('')
  })
})
