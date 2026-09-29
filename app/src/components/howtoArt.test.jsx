// Yakın E testi çizimleri (components/howtoArt.jsx): çizimde metin yok ("40 cm", "Göremiyorum" sayfa metnidir);
// E yazı tipi harfi değil, gerçek 5×5 geometriden (lib/optotype.js eRects) dikdörtgenler. PLAN.md E1, E2; 1.9.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AcuityDistanceArt, AcuitySwipeArt, AcuityShrinkArt, FaceCoverArt, EGlyph, eOutline } from './howtoArt.jsx'
import { eRects } from '../lib/optotype.js'

const html = (el) => renderToStaticMarkup(el)

describe('yakın E testi çizimleri', () => {
  it('hiçbir çizimde <text> yok', () => {
    for (const el of [h(AcuityDistanceArt, { ok: true }), h(AcuityDistanceArt), h(AcuitySwipeArt), h(AcuityShrinkArt), h(FaceCoverArt, { cover: 'L', state: 'ok' }), h(FaceCoverArt, { cover: null })]) {
      const s = html(el)
      expect(s).toMatch(/^<svg/)
      expect(s).not.toMatch(/<text|<tspan|font-family/i)
    }
  })
  // Çokgenin içinde mi (çift-tek kuralı; kenarda olmayan noktalar için)
  const inside = (poly, [px, py]) => {
    let c = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i]
      const [xj, yj] = poly[j]
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c
    }
    return c
  }
  it('E gerçek 5×5 geometriyle: dış çizgi tam eRects hücrelerini kaplar (17 hücre), dört yönde', () => {
    for (const dir of ['right', 'down', 'left', 'up']) {
      const poly = eOutline(dir)
      const inked = new Set()
      for (const [x0, y0, x1, y1] of eRects(dir)) for (let cx = x0; cx < x1; cx++) for (let cy = y0; cy < y1; cy++) inked.add(`${cx},${cy}`)
      expect(inked.size).toBe(17)
      for (let cx = 0; cx < 5; cx++) for (let cy = 0; cy < 5; cy++) expect(inside(poly, [cx + 0.5, cy + 0.5]), `${dir} ${cx},${cy}`).toBe(inked.has(`${cx},${cy}`))
      // Çizim: tek <path>, ölçeklenmiş köşeler
      const s = html(h('svg', null, h(EGlyph, { x: 10, y: 20, size: 50, dir })))
      expect(s.match(/<path/g)).toHaveLength(1)
      expect(s).not.toMatch(/<rect/)
      const pts = [...s.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])])
      expect(pts).toEqual(poly.map(([px, py]) => [10 + px * 10, 20 + py * 10]))
    }
    // Kart 2 sağa açık E; kart 3 dört yön: her E tek yol (dikişsiz), karo bir dikdörtgen
    expect(html(h(AcuitySwipeArt)).match(/<rect/g)).toHaveLength(1)
    expect(html(h(AcuitySwipeArt)).match(/class="e-glyph"/g)).toHaveLength(1)
    expect(html(h(AcuityShrinkArt)).match(/<rect/g)).toHaveLength(4)
    expect(html(h(AcuityShrinkArt)).match(/class="e-glyph"/g)).toHaveLength(4)
  })
  it('kart 3: dört karo görünüm kutusuna sığar', () => {
    const s = html(h(AcuityShrinkArt))
    const vb = Number(/viewBox="0 0 ([\d.]+) 80"/.exec(s)[1])
    const right = Math.max(...[...s.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/g)].map((m) => Number(m[1]) + Number(m[2])))
    expect(right).toBeLessThanOrEqual(vb)
  })
  it('hazırlık çizimi: avuç örtülecek gözün tarafında (ayna), iki göz testinde avuç yok', () => {
    const L = html(h(FaceCoverArt, { cover: 'L' }))
    const R = html(h(FaceCoverArt, { cover: 'R' }))
    expect(L).toContain('translateX(0px)')
    expect(R).toContain('translateX(76px)')
    // örtülen göz çizilmez: sol örtülünce yalnız sağ göz (x=128) kalır
    expect(L).toContain('cx="128"')
    expect(L).not.toContain('cx="72"')
    expect(R).toContain('cx="72"')
    expect(html(h(FaceCoverArt, { cover: null }))).not.toContain('face-cover-palm')
    expect(html(h(FaceCoverArt, { cover: 'L', state: 'ok' }))).toContain('var(--ok)')
    expect(html(h(FaceCoverArt, { cover: 'L', state: 'bad' }))).toContain('var(--warn)')
  })
})
