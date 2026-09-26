// Günlük fark etme görevi (lib/notice.js). Dikkat halkası; kilitsiz (ekrana bakma değil, dış dünya).
import { SESSION_TYPE, isNotice, weekDays, COUNTS, promptFor } from '../../lib/notice.js'
import { doneToday, withinDays } from '../../lib/today.js'
import { mean } from '../../lib/format.js'

export default {
  id: 'notice',
  title: 'Bugünün görevi',
  label: 'fark etme görevi',
  ring: 'attention',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'awareness',
    metrics: [
      {
        key: 'notice-count', label: 'Bugünün görevinde fark edilen', unit: 'kez', better: 'up',
        series: ({ sessions }) => sessions.filter((s) => s?.type === SESSION_TYPE && Number.isFinite(s.count)).map((s) => ({ date: s.date, value: s.count })),
      },
    ],
  },
  gates: {},
  home: { section: 'practice', order: 40 },
  sessions: {
    match: (s) => s.type === SESSION_TYPE,
    countsTowardGoal: false, // 1 dk'lık kayıt; haftalık hedefi şişirmesin
    describe: (s) => ({ title: 'Fark etme görevi', detail: `${COUNTS[s.count] ?? '0'} fark edildi` }),
  },
  // Plana: bir kez yapıldıysa, her gün (VARSAYIM: zorlama yok; önce kullanıcı dener)
  today({ sessions, now }) {
    if (!sessions.some(isNotice)) return null
    return { title: 'Bugünün görevi', minutes: 1, slot: 'finale', glyph: 'spark', dropRank: 2, done: doneToday(sessions, SESSION_TYPE, now) }
  },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isNotice), now)
    if (!week.length) return null
    return { days7: weekDays(sessions, now), avgCount7: +(mean(week.map((s) => s.count)) ?? 0).toFixed(1) }
  },
  stats(sessions, now) {
    if (!sessions.some(isNotice)) return []
    return [{ label: 'Bu hafta', value: `${weekDays(sessions, now)} / 7 gün`, sub: `bugün: ${promptFor(now).text.toLocaleLowerCase('tr')}` }]
  },
}
