// Gelişim · yoga kartları (yoga-pilot/v3/modul.md §7; PLAN.v3 §D.5): önce → sonra puanı "nasıl hissettin" gidişatıdır,
// etki kanıtı değil. Etiket iyileşme demez, puanın yönünü söyler; kutucuk puanın kendi değişimini yazar (azalan gerginlik
// eksi). Öteki modüllerin etiketi değişmez.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProgressOverview, { DomainDetail, effectStatus, metricStatus } from './ProgressOverview.jsx'
import { makeYogaRecord } from '../lib/yogaRecord.js'

const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const ago = (d) => new Date(Date.now() - d * 86400000)
const yoga = (lesson, d, before, after) => ({ id: `y${lesson}-${d}`, ...makeYogaRecord({ lesson, planned: 300, seconds: 300, reachedClosing: true, before, after, endedAt: ago(d) }) })
// Ders 1 (gerginlik, düşük daha iyi): dört derste 7 → 4; Ders 5 (odak): dört derste 4 → 6
const calm = [1, 2, 3, 4].map((d) => yoga(1, d, 7, 4))
const focus = [1, 2, 3, 4].map((d) => yoga(5, d, 4, 6))

describe('Gelişim · yoga etkisi etiketi', () => {
  it('yoga: "belirgin artış/düşüş", iyileşme ya da kötüleşme demez; ton iyi/kötü yöne göre', () => {
    expect(effectStatus({ module: 'yoga', sig: true, better: 'down', gain: 3 })).toEqual({ text: 'belirgin düşüş', tone: 'ok' })
    expect(effectStatus({ module: 'yoga', sig: true, better: 'down', gain: -2 })).toEqual({ text: 'belirgin artış', tone: 'warn' })
    expect(effectStatus({ module: 'yoga', sig: true, better: 'up', gain: 2 })).toEqual({ text: 'belirgin artış', tone: 'ok' })
    expect(effectStatus({ module: 'yoga', sig: true, better: 'up', gain: -1 })).toEqual({ text: 'belirgin düşüş', tone: 'warn' })
    expect(effectStatus({ module: 'yoga', sig: false, better: 'up', gain: 2 })).toEqual({ text: 'henüz belirsiz', tone: 'muted' })
  })
  it('öteki modüllerde bugünkü etiket', () => {
    expect(effectStatus({ module: 'breath', sig: true, gain: 1 })).toEqual({ text: 'belirgin iyileşme', tone: 'ok' })
    expect(effectStatus({ module: 'yon', sig: true, better: 'down', gain: -1 })).toEqual({ text: 'belirgin kötüleşme', tone: 'warn' })
    expect(effectStatus({ module: 'dalga', sig: false, gain: 1 })).toEqual({ text: 'henüz belirsiz', tone: 'muted' })
  })
  it('Sakinlik kutucuğu: azalan gerginlik eksiyle, yoga etiketiyle', () => {
    const t = text(renderToStaticMarkup(h(ProgressOverview, { tests: [], sessions: calm, onOpen: () => {} })))
    expect(t).toContain('−3,0 gerginlik · Yoga · Nefesin Ritmi sonrası')
    expect(t).toContain('belirgin düşüş')
    expect(t).not.toContain('belirgin iyileşme')
    expect(t).not.toContain('+3,0 gerginlik')
  })
  it('Yön (düşük daha iyi, yoga dışı): kutucukta azalan rahatsızlık eksiyle; etiket bugünkü gibi "belirgin iyileşme"', () => {
    // Bilerek değişen davranış (2026-09-30): kutucuk değeri puanın kendi değişimidir (FirstReport ile aynı); önceden
    // azalan rahatsızlık "+3,0" yazıyordu
    const yon = [1, 2, 3, 4].map((d) => ({ id: `yon-${d}`, type: 'yon', tool: 'uzak', before: 7 + (d % 2), after: 4 + (d % 2), date: ago(d).toISOString() }))
    const t = text(renderToStaticMarkup(h(ProgressOverview, { tests: [], sessions: yon, onOpen: () => {} })))
    expect(t).toContain('−3,0 rahatsızlık · Yön · Dışarıdan bak sonrası')
    expect(t).toContain('belirgin iyileşme')
    expect(t).not.toContain('+3,0 rahatsızlık')
  })
  it('yoga ölçüsü (uyku puanı) de "iyileşiyor / geriliyor" demez, yönü söyler', () => {
    expect(metricStatus({ module: 'yoga', status: 'better', better: 'up' })).toEqual({ text: 'belirgin artış', tone: 'ok' })
    expect(metricStatus({ module: 'yoga', status: 'worse', better: 'up' })).toEqual({ text: 'belirgin düşüş', tone: 'warn' })
    expect(metricStatus({ module: 'yoga', status: 'noise', better: 'up' })).toEqual({ text: 'doğal oynama', tone: 'muted' })
    expect(metricStatus({ module: 'breath', status: 'better', better: 'up' })).toEqual({ text: 'iyileşiyor', tone: 'ok' })
  })
  it('alan ayrıntısı: Dikkat\'te Ders 5 "odak" puanı, "gelişti"/"iyileşme" yok; kontrol grubu notu yerinde', () => {
    const t = text(renderToStaticMarkup(h(DomainDetail, { domain: 'focus', tests: [], sessions: [...calm, ...focus], onBack: () => {}, onStart: () => {} })))
    expect(t).toContain('Yoga · Tek Nokta')
    expect(t).toContain('odak')
    expect(t).toContain('belirgin artış')
    expect(t).not.toMatch(/iyileşme|gelişti|Nefesin Ritmi/)
    expect(t).toContain('Kontrol grubu yok')
  })
})
