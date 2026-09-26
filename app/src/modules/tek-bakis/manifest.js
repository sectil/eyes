// Tek Bakışta: görsel menzil — gözü kıpırdatmadan tanınan harf sayısı (lib/span.js). Göz halkası; pratik.
// İddia sınırı: alıştırma kazanımı çalışmalarda çevresel görüşte gösterildi (Chung 2004, Yu 2010); normal okumaya
// aktarımı ve görmeyi iyileştirdiği gösterilmedi. Harfler kısa süre göründüğü için ilk turdan önce epilepsi sorusu.
import { SESSION_TYPE, isSpan } from '../../lib/span.js'
import { withinDays, isSameDay } from '../../lib/today.js'
import { profileSignals } from '../../lib/profile.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

const dayKey = (s) => new Date(s.date).toDateString()
export const WEEKLY_DAYS = 3 // yolda haftada 3 gün (onaylı taslak)

export default {
  id: 'tek-bakis',
  title: 'Tek Bakışta',
  label: 'Tek Bakışta',
  ring: 'eye',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'focus',
    metrics: [
      {
        key: 'tek-bakis-span', label: 'Tek bakışta kavranan', unit: 'harf', better: 'up',
        series: ({ sessions }) => sessions.filter((s) => s?.type === SESSION_TYPE && Number.isFinite(s.span)).map((s) => ({ date: s.date, value: s.span })),
      },
    ],
  },
  gates: { eyeBudget: 'eye' },
  ask: { before: ['seizure'] },
  home: { section: 'practice', order: 15 },
  sessions: {
    match: (s) => s?.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: 'Tek Bakışta',
        detail: join([Number.isFinite(s.span) ? `~${s.span}${NBSP}harf` : null, Number.isFinite(s.durationMs) ? `${s.durationMs}${NBSP}ms` : null, durationPart(seconds, false)]),
      }
    },
  },
  // Bugünün yolu: son 7 günde 3 günden az yapıldıysa 2. bölümde 2 dk'lık durak; yol uzarsa Yılan'dan sonra düşer
  today({ sessions, now, profile }) {
    if (profile && profileSignals(profile).flashSafe === false) return null
    const done = sessions.some((s) => isSpan(s) && isSameDay(s, now))
    const days = new Set(withinDays(sessions.filter(isSpan), now).map(dayKey)).size
    if (!done && days >= WEEKLY_DAYS) return null
    return { title: 'Tek Bakışta', minutes: 2, slot: 'body', order: 95, glyph: 'span', dropRank: 1.5, rotate: 'week3', weekDays: days, done }
  },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isSpan), now)
    if (!week.length) return null
    return { span7: Math.max(...week.map((s) => s.span)), rounds7: week.length, first: sessions.find(isSpan).span }
  },
  stats(sessions, now) {
    const all = sessions.filter(isSpan)
    if (!all.length) return []
    const week = withinDays(all, now)
    return [
      { label: 'Tek bakışta', value: `~${all.at(-1).span}${NBSP}harf`, sub: `ilk tur ~${all[0].span}` },
      { label: 'Tur · 7 gün', value: String(week.length), sub: `son süre ${all.at(-1).durationMs}${NBSP}ms` },
    ]
  },
}
