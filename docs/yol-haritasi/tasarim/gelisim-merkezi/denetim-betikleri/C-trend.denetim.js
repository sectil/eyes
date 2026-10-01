import { test } from 'vitest'
import { analyzeTrend, trendMessage } from '/home/user/eyes/app/src/lib/trend.js'
import { visionHeadLines, currentLabel } from '/home/user/eyes/app/src/screens/Progress.jsx'

const D0 = new Date('2026-09-01T09:00:00')
const at = (day, h = 9) => { const d = new Date(D0); d.setDate(d.getDate() + day - 1); d.setHours(h); return d.toISOString() }
const wk = (day, lm, extra = {}) => ({ type: 'va-weekly', eye: 'R', logMAR: lm, date: at(day), algorithm: 'descent-zest-v4', distanceTracked: true, meanDistanceMm: 400, correction: 'none', ...extra })
function show(name, tests, nowDay) {
  const r = analyzeTrend(tests, at(nowDay, 20))
  const h = visionHeadLines(r)
  console.log(`\n## ${name} (bugün ${nowDay}. gün)`)
  console.log(JSON.stringify({ phase: r.phase, baselineMode: r.baselineMode, weeklyDone: r.weeklyDone, baseline: r.baseline, baselineTests: r.baselineTests, current: r.current, currentWindow: r.currentWindow, delta: r.delta, alert: r.alert, trend: r.trend, frozen: r.baselineFrozen }))
  console.log('mesaj:', trendMessage(r))
  console.log('başlık:', h.lead, '| notlar:', JSON.stringify(h.notes), '| kutu:', r.baseline != null ? `Başlangıç / ${currentLabel(r)}` : '(kutu yok)')
}

test('trend senaryoları', () => {
  show('T1: 1 gün, 1 haftalık test', [wk(1, 0.10)], 1)
  show('T2: 9 gün, gün 1 ve 8', [wk(1, 0.10), wk(8, 0.06)], 9)
  show('T2b: 9 gün, gün 1, 8 + 8. gün kısa test', [wk(1, 0.10), wk(8, 0.06), { ...wk(8, 0.05), type: 'va-daily', date: at(8, 12) }], 9)
  const s30 = [wk(1, 0.10), wk(8, 0.06), wk(15, 0.04), wk(22, 0.05), wk(29, 0.03)]
  show('T3: 30 gün, 5 haftalık test, sabit', s30, 30)
  show('T3a: aynı seri 21. günde', s30.slice(0, 3), 21)
  show('T3b: aynı seri 22. günde (3. başlangıç testi o gün)', s30.slice(0, 4), 22)
  // gerçek kötüleşme 29. günden itibaren +0,15
  const w = [wk(1, 0.10), wk(8, 0.05), wk(15, 0.05), wk(22, 0.05), wk(29, 0.20), wk(36, 0.21), wk(43, 0.20), wk(50, 0.22)]
  for (const n of [5, 6, 7, 8]) show(`T4: 29. günden +0,15 kötüleşme, ${n} test`, w.slice(0, n), w[n - 1] ? Number(((new Date(w[n - 1].date) - D0) / 864e5 + 1).toFixed(0)) : 0)
  // 22. günde tek kötü test: başlangıca karışır mı
  const b = [wk(1, 0.10), wk(8, 0.05), wk(15, 0.05), wk(22, 0.30), wk(29, 0.30), wk(36, 0.30)]
  for (const n of [4, 5, 6]) show(`T5: 22. günden +0,25 kötüleşme, ${n} test`, b.slice(0, n), [1, 8, 15, 22, 29, 36][n - 1])
  // gecikmeli: 30 gün içinde ancak 3 test (1, 12, 26)
  show('T6: 30 gün, seyrek (gün 1, 12, 26)', [wk(1, 0.1), wk(12, 0.08), wk(26, 0.07)], 30)
  // kamera kapalı son test: seri kopar
  show('T7: 30 gün, son test kamerasız', [...s30.slice(0, 4), wk(29, 0.03, { distanceTracked: false, meanDistanceMm: null })], 30)
  const red = [wk(1, 0.10), wk(8, 0.05), wk(15, 0.05), wk(22, 0.30), wk(29, 0.30), wk(36, 0.30)]
  show('T8: T5 kırmızı + 43. gün kamerasız test (kamera test ortasında durdu)', [...red, wk(43, 0.30, { distanceTracked: false, meanDistanceMm: null, camFailedMidTest: true })], 43)
  show('T8b: 50. günde kamera geri geldi', [...red, wk(43, 0.30, { distanceTracked: false, meanDistanceMm: null, camFailedMidTest: true }), wk(50, 0.30)], 50)
})
