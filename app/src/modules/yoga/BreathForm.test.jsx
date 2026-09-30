// Nefes formu (modul.md §3): Hareketi Azalt ya da nöbet cevabı "Hayır" değilken (still) form ölçeklenmez ve biçimi
// değişmez; imge yalnız opaklıkla (yavaş) gösterilir.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BreathForm from './BreathForm.jsx'

const html = (props) => renderToStaticMarkup(h(BreathForm, props))
const attr = (s, name) => [...s.matchAll(new RegExp(`${name}="([^"]+)"`, 'g'))].map((m) => m[1])

describe('BreathForm', () => {
  it('ufuk: still iken imge açık da kapalı da aynı hale; değilse imgeyle genişler', () => {
    const v = (image) => ({ luminance: 0.8, scale: 1, image, phase: 'derin' })
    expect(attr(html({ form: 'horizon', v: v(true), still: true }), 'ry')).toEqual(attr(html({ form: 'horizon', v: v(false), still: true }), 'ry'))
    expect(attr(html({ form: 'horizon', v: v(true) }), 'ry')).toEqual(['16'])
    expect(attr(html({ form: 'horizon', v: v(false) }), 'ry')).toEqual(['9'])
    // opaklık yine imgeyi gösterir
    expect(html({ form: 'horizon', v: v(true), still: true })).not.toBe(html({ form: 'horizon', v: v(false), still: true }))
  })
  it('nokta: still iken hale evreyle daralmaz', () => {
    const r = (phase, still) => attr(html({ form: 'point', v: { luminance: 0.8, scale: 1, image: false, phase }, still }), 'r')[0]
    expect(r('varis', true)).toBe(r('derin', true))
    expect(r('varis', false)).not.toBe(r('derin', false))
  })
})
