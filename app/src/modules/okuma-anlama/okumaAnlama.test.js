import { describe, it, expect } from 'vitest'
import { registry } from '../registry.js'
import { metricCards } from '../../lib/progress.js'
import { buildMoments } from '../../lib/nef/moments.js'
import manifest from './manifest.js'

// ANA_OTURUM_ISTEMI O3 benzetimi: 2 alışma + 3 başlangıç okuması, sonra iyileşme → Gelişim "başlangıcından iyi";
// anlama düşerken hız artışını Nef övmez (PLAN §5.2).
const DAY = 86400000
const T0 = new Date(2026, 8, 1, 10).getTime() // Salı
const read = (d, wpm, correct = 4, o = {}) => ({ type: 'okuma-anlama', date: new Date(T0 + d * DAY).toISOString(), textId: `oa${String(d + 1).padStart(3, '0')}`, cycle: 0, wpm, correct, valid: correct >= 3, reason: correct >= 3 ? null : 'dusuk-anlama', fontScale: 1, ...o })
const metrics = registry.metrics().filter((m) => m.module === 'okuma-anlama')
const card = (sessions, now, key) => metricCards({ sessions, metrics, now }).find((c) => c.key === key)

// Gün başına bir okuma: ilk 5 gün 200 civarı; sonra haftada üç gün, hız belirgin yukarıda
const DAYS = [0, 1, 2, 3, 4, 8, 10, 12, 15, 17, 19, 22, 24, 26]
const WPM = [195, 205, 200, 196, 204, 240, 245, 250, 248, 252, 255, 250, 258, 260]

describe('Oku ve Anla · Gelişim ve Nef benzetimi', () => {
  it('iki ölçü Gelişim\'e bağlı: Okuma hızı (kelime/dk) ve Anlama (%), Dikkat alanında', () => {
    expect(metrics.map((m) => [m.key, m.label, m.unit])).toEqual([['okuma-anlama-hiz', 'Okuma hızı', 'kelime/dk'], ['okuma-anlama-anlama', 'Anlama', '%']])
    expect(manifest.progress.domain).toBe('focus')
  })

  it('alışma ve başlangıçtan sonra hız iyileşince hüküm "better"', () => {
    const sessions = DAYS.map((d, i) => read(d, WPM[i]))
    const now = new Date(T0 + 29 * DAY)
    const hiz = card(sessions, now, 'okuma-anlama-hiz')
    expect(hiz.v2.baseline).toBe(200)
    expect(hiz.verdict).toBe('better')
    expect(card(sessions, now, 'okuma-anlama-anlama').verdict).toBe('same')
  })

  it('ilk 5 okuma gününde hüküm "start"', () => {
    const sessions = DAYS.slice(0, 5).map((d, i) => read(d, WPM[i]))
    expect(card(sessions, new Date(T0 + 5 * DAY), 'okuma-anlama-hiz').verdict).toBe('start')
  })

  it('Nef: hız artışı yalnız anlama "değişim yok" ya da "başlangıcından iyi" iken söylenir', () => {
    const hiz = { key: 'okuma-anlama-hiz', module: 'okuma-anlama', domain: 'focus', better: 'up', verdict: 'better', start: 200, current: 250, with: 'okuma-anlama-anlama' }
    const anl = (verdict) => ({ key: 'okuma-anlama-anlama', module: 'okuma-anlama', domain: 'focus', better: 'up', verdict, start: 100, current: verdict === 'worse' ? 50 : 100 })
    const speedMoments = (verdict) => buildMoments({ now: new Date(T0 + 29 * DAY), metrics: [hiz, anl(verdict)] }).filter((m) => m.type === 'metricChange' && m.facts.metric === 'okuma-anlama-hiz')
    expect(speedMoments('same')).toHaveLength(1)
    expect(speedMoments('better')).toHaveLength(1)
    expect(speedMoments('worse')).toHaveLength(0)
    expect(speedMoments('unclear')).toHaveLength(0)
    expect(speedMoments('start')).toHaveLength(0)
  })

  it('yarıda kalan okuma (ara) hiçbir seriye girmez; düşük anlama yalnız anlama serisine girer', () => {
    const s = [read(0, 210), read(1, 900, null, { valid: false, reason: 'ara' }), read(2, 300, 2)]
    const [hizM, anlM] = metrics
    expect(hizM.series({ sessions: s }).map((p) => p.value)).toEqual([210])
    expect(anlM.series({ sessions: s }).map((p) => p.value)).toEqual([100, 50])
  })
})
