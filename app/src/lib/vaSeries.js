import { analyzeTrend } from './trend.js'

// Görme keskinliği için "öne çıkan seri" (Bugün kutucuğu, Jev sinyali, Gelişim'in açılış sekmesi).
// Build 24'ten beri günlük test yalnız sağ ve sol gözü ölçer; iki göz yalnız haftalık testte. Bu yüzden tek
// seri (eskiden hep 'OU') yerine: uyarısı en ciddi göz → son 14 günde en çok ölçülen → sağ, sol, iki göz sırası.
const EYES = ['R', 'L', 'OU']
const SEVERITY = { red: 2, yellow: 1 }
export const EYE_LABEL = { R: 'Sağ göz', L: 'Sol göz', OU: 'İki göz' }
const DAY = 86400000

const isVa = (t) => t?.type === 'va-daily' || t?.type === 'va-weekly'

export function pickSeries(tests = [], now = new Date().toISOString()) {
  const va = tests.filter(isVa)
  const since = new Date(now).getTime() - 14 * DAY
  const cands = EYES.map((eye, order) => {
    const ts = va.filter((t) => t.eye === eye)
    return {
      eye,
      order,
      tests: ts,
      trend: analyzeTrend(ts, now),
      recent: ts.filter((t) => new Date(t.date).getTime() >= since).length,
    }
  }).filter((c) => c.tests.length > 0)
  if (!cands.length) return { eye: null, tests: [], trend: analyzeTrend([], now) }
  cands.sort((a, b) =>
    (SEVERITY[b.trend.alert] ?? 0) - (SEVERITY[a.trend.alert] ?? 0) || b.recent - a.recent || a.order - b.order)
  const { eye, tests: t, trend } = cands[0]
  return { eye, tests: t, trend }
}
