// Bugün kartı (E0, PLAN.md): yarım gün "Kalan: Sol göz, İki göz" uyarı renginde ve "!" ile; ölçülmemiş süre yazılmaz;
// bitince "✓ Bu hafta tamam"; E simgesi yazı tipi harfi değil, 5×5 geometri.
import { describe, it, expect } from 'vitest'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import TodayPath, { stopSub } from './TodayPath.jsx'
import { buildPath, WEEKLY_DONE } from '../lib/today.js'
import { registry } from '../modules/registry.js'

const NOW = new Date('2026-09-25T10:00:00')
const TODAY = NOW.toISOString()
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString()
const wk = (eyes, date) => eyes.map((eye) => ({ type: 'va-weekly', eye, date }))
const SPAN3 = [2, 3, 4].map((d) => ({ type: 'span', span: 8, left: 4, right: 4, durationMs: 100, accuracy: 0.8, seconds: 120, date: daysAgo(d) }))
const STREET3 = [2, 3, 4].map((d) => ({ type: 'street', noticed: 2, asked: 3, task: 1, level: 1, seconds: 60, date: daysAgo(d) }))
const path = (tests) => buildPath(registry.live, { tests, sessions: [...SPAN3, ...STREET3], now: NOW })
const stopOf = (p, key) => p.stops.find((s) => s.key === key)

describe('Bugün kartı · haftalık E testi (E0)', () => {
  it('yarım gün: "Kalan: Sol göz, İki göz" uyarı olarak; süre yazılmaz', () => {
    const w = stopOf(path([{ type: 'reading', date: daysAgo(3) }, ...wk(['R'], TODAY)]), 'weekly')
    expect(stopSub(w, 'later')).toEqual({ text: 'Kalan: Sol göz, İki göz', warn: true })
    expect(stopSub(w, 'now').text).not.toMatch(/dk/)
  })
  it('zamanı geldi: "3 bölüm · sağ, sol, iki göz" (süre yok); bitince "✓ Bu hafta tamam"', () => {
    const due = stopOf(path([]), 'weekly')
    expect(stopSub(due, 'later')).toEqual({ text: '3 bölüm · sağ, sol, iki göz', warn: false })
    const done = stopOf(path(wk(['R', 'L', 'OU'], TODAY)), 'weekly')
    expect(stopSub(done, 'done')).toEqual({ text: WEEKLY_DONE, warn: false })
    expect(WEEKLY_DONE).toBe('✓ Bu hafta tamam')
  })
  it('günlük E testinde de süre yazılmaz; süresi olan egzersiz durağında yazılır', () => {
    const p = path([...wk(['R', 'L', 'OU'], daysAgo(2)), { type: 'reading', date: daysAgo(3) }])
    expect(stopSub(stopOf(p, 'daily'), 'later').text).toBe('sağ + sol göz')
    expect(stopSub(stopOf(p, 'routine:uzak'), 'later').text).toMatch(/^\d+ dk$/)
  })
  it('çizim: yarım durak etiketinde uyarı sınıfı ve "!"; E simgesi <text> değil', () => {
    const p = path([{ type: 'reading', date: daysAgo(3) }, ...wk(['R', 'L', 'OU'], daysAgo(9)), ...wk(['R'], TODAY)])
    const html = renderToStaticMarkup(h(TodayPath, { plan: p, eye: null, day: 1, onStart: () => {} }))
    const w = stopOf(p, 'weekly')
    expect(w.warn).toBe(true)
    // Etiket ya da (sıradaki durak ise) Nef baloncuğu uyarıyla
    expect(html).toMatch(/class="(warn|l2 warn)"><b class="wi"[^>]*>!<\/b>/)
    expect(html).toContain('Kalan: Sol göz, İki göz')
    expect(html).not.toMatch(/<text class="le"/)
    expect(html).toContain('class="e-glyph"')
    expect(html).toMatch(/Haftalık E testi, ölçüm, Kalan: Sol göz, İki göz/)
    expect(html).not.toMatch(/Haftalık E testi, ölçüm, 5 dakika/)
  })
})
