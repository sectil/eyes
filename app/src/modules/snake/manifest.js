// Yılan: gözle ya da dokunarak oynanan göz pratiği. Eğlence; görmeyi ölçmez.
import { BEST_KEY, OPTS_KEY, bestFromSessions } from '../../lib/snake.js'
import { NBSP, finite, join, durationPart, CONTROL_LABEL } from '../../lib/format.js'

export default {
  id: 'snake',
  title: 'Yılan',
  label: 'Yılan oyunu',
  ring: 'attention',
  kind: 'practice',
  gates: { gaze: true, rest: true, active: true },
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
}
