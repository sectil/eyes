// Fark Ettin mi?: kalabalık caddede görev + fark etme soruları (lib/street.js). Dikkat halkası; pratik.
// İddia sınırı: gerçek hayatta daha çok fark ettirdiği gösterilmedi; puan kişi-içi gidişat içindir.
import { SESSION_TYPE, isStreet } from '../../lib/street.js'
import { withinDays, isSameDay } from '../../lib/today.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

const dayKey = (s) => new Date(s.date).toDateString()
export const WEEKLY_DAYS = 3 // yolda haftada 3 gün (onaylı taslak)

export default {
  id: 'fark-ettin',
  title: 'Fark Ettin mi?',
  label: 'Fark Ettin mi?',
  ring: 'attention',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'awareness',
    metrics: [
      {
        key: 'street-noticed', label: 'Fark etme isabeti', unit: '%', better: 'up',
        series: ({ sessions }) => sessions.filter((s) => s?.type === SESSION_TYPE && Number.isFinite(s.noticed) && s.asked > 0).map((s) => ({ date: s.date, value: (100 * s.noticed) / s.asked })),
      },
    ],
  },
  gates: { eyeBudget: 'eye' },
  home: { section: 'practice', order: 8 },
  sessions: {
    match: (s) => s?.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: 'Fark Ettin mi?',
        detail: join([Number.isFinite(s.noticed) ? `fark ${s.noticed}/${s.asked}` : null, Number.isFinite(s.level) ? `seviye${NBSP}${s.level}` : null, durationPart(seconds, false)]),
      }
    },
  },
  // Bugünün yolu: Nefes'in hemen ardından (kısa farkındalık çalışması fark etmeyi artırdı: Schofield 2015);
  // son 7 günde 3 günden az yapıldıysa. Tek Bakışta ile dönüşümlü (aynı gün biri; lib/today.js rotate).
  today({ sessions, now }) {
    const done = sessions.some((s) => isStreet(s) && isSameDay(s, now))
    const days = new Set(withinDays(sessions.filter(isStreet), now).map(dayKey)).size
    if (!done && days >= WEEKLY_DAYS) return null
    return { title: 'Fark Ettin mi?', minutes: 2, slot: 'body', order: 65, glyph: 'street', dropRank: 1.6, rotate: 'week3', weekDays: days, done }
  },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isStreet), now)
    if (!week.length) return null
    const asked = week.reduce((a, s) => a + s.asked, 0)
    return { rounds7: week.length, noticedPct7: asked ? Math.round((100 * week.reduce((a, s) => a + s.noticed, 0)) / asked) : 0, level: week.at(-1).level }
  },
  stats(sessions, now) {
    const all = sessions.filter(isStreet)
    if (!all.length) return []
    const week = withinDays(all, now)
    const asked = week.reduce((a, s) => a + s.asked, 0)
    const noticed = week.reduce((a, s) => a + s.noticed, 0)
    return [
      { label: 'Fark ettiklerin · 7 gün', value: asked ? `${noticed}/${asked}` : '—', sub: `${week.length}${NBSP}tur` },
      { label: 'Seviye', value: String(all.at(-1).level), sub: `son tur görev ${all.at(-1).task === 1 ? 'tam' : all.at(-1).task === 0.5 ? 'yakın' : 'kaçtı'}` },
    ]
  },
}
