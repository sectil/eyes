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
    // [gökteki ışık, yansıma]: ufuk boydan boya bir sahneye döndü (viewBox 400×200); gökteki ışık imgede yükselir,
    // yansıma sabit. Önceki tek elips (ry 16 / 9) "düz hat" gibi okunan çizginin halesiydi. 5 saniye turu 2 ("ortadaki
    // ışık o kadar soluk ki bir şey yüklenmemiş sanıyorum"): ışık daha yüksek ve geniş (74/54 → 92/70, yansıma 26 → 30);
    // parlaklık tavanı değişmedi: grubun opaklığı onu korur, ışık yine yalnız dersin renginde (aşağıdaki test)
    expect(attr(html({ form: 'horizon', v: v(true) }), 'ry')).toEqual(['92', '30'])
    expect(attr(html({ form: 'horizon', v: v(false) }), 'ry')).toEqual(['70', '30'])
    // opaklık yine imgeyi gösterir
    expect(html({ form: 'horizon', v: v(true), still: true })).not.toBe(html({ form: 'horizon', v: v(false), still: true }))
  })
  it('nokta: still iken hale evreyle daralmaz', () => {
    const r = (phase, still) => attr(html({ form: 'point', v: { luminance: 0.8, scale: 1, image: false, phase }, still }), 'r')[0]
    expect(r('varis', true)).toBe(r('derin', true))
    expect(r('varis', false)).not.toBe(r('derin', false))
  })
})

describe('BreathForm ufuk sahnesi', () => {
  it('yalnız dersin rengi (beyaza açılan ışık yok: parlaklık tavanı grubun opaklığıyla korunur); uçlar söner', () => {
    const s = html({ form: 'horizon', color: '#7EB2DD', v: { luminance: 0.8, scale: 1, image: false, phase: 'derin' } })
    expect(new Set(attr(s, 'stop-color'))).toEqual(new Set(['#7EB2DD']))
    const ends = [...s.matchAll(/offset="(0|1)" stop-color="#7EB2DD" stop-opacity="([^"]+)"/g)].map((m) => m[2])
    expect(ends).toContain('0')
    expect(s).toContain('yg-form-wide')
  })
})
