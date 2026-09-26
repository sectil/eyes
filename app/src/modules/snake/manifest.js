// Yılan: gözle ya da dokunarak oynanan göz pratiği. Eğlence; görmeyi ölçmez.
import { BEST_KEY, OPTS_KEY, bestFromSessions } from '../../lib/snake.js'
import { NBSP, finite, join, durationPart, CONTROL_LABEL } from '../../lib/format.js'
import { withinDays, isSameDay } from '../../lib/today.js'
const isSnake = (s) => s.type === 'game' && s.game === 'snake'

export default {
  id: 'snake',
  title: 'Yılan',
  label: 'Yılan oyunu',
  ring: 'attention',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: { domain: 'focus' }, // oyun puanı gelişim ölçüsü sayılmaz (rekor ayrı)
  gates: { gaze: true, eyeBudget: 'eye' },
  storageKeys: [BEST_KEY, OPTS_KEY],
  home: { section: 'practice', order: 20 },
  sessions: {
    match: (s) => s.type === 'game' && s.game === 'snake',
    countsTowardGoal: false,
    describe(s, { seconds }) {
      const score = finite(s.score)
      return {
        title: 'Yılan oyunu',
        score,
        best: finite(s.best),
        control: s.control ?? null,
        detail: join([score != null ? `${score}${NBSP}puan` : null, CONTROL_LABEL[s.control], durationPart(seconds, false)]),
      }
    },
    best: (sessions) => bestFromSessions(sessions),
    bestLabel: 'Yılan rekoru',
  },
  // Bugünün yolu: 2. bölümün son göz durağı, bonus (yol uzarsa ilk düşen; Hızlı Bakış günü yok).
  // VARSAYIM: bir tur ≈ 2 dk; oyunda tur sınırı yok, "1 tur" yalnızca öneri.
  today({ sessions, now }) {
    return { title: 'Yılan', sub: '1 tur', minutes: 2, slot: 'open', glyph: 'snake', openEnded: true, game: true, dropRank: 1, done: sessions.some((s) => isSnake(s) && isSameDay(s, now)) }
  },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isSnake), now)
    return { best: bestFromSessions(sessions) || null, sessions7: week.length, eyes7: week.filter((s) => s.control === 'eyes').length }
  },
  stats(sessions, now) {
    const best = bestFromSessions(sessions)
    const week = withinDays(sessions.filter(isSnake), now)
    if (!best && !week.length) return []
    return [
      { label: 'Rekor', value: best ? `${best}${NBSP}puan` : '—' },
      { label: 'Oyun · 7 gün', value: String(week.length), sub: week.length ? `${week.filter((s) => s.control === 'eyes').length}${NBSP}gözle` : null },
    ]
  },
}
