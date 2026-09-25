// Çember takibi: atlayan çemberi gözle izleme pratiği. Görmeyi ölçmez; skor görme trendine girmez.
import { TRACK_BEST_KEY, TRACK_OPTS_KEY, trackBestFromSessions } from '../../lib/track.js'
import { NBSP, finite, join, durationPart, CONTROL_LABEL } from '../../lib/format.js'

export default {
  id: 'track',
  title: 'Çember takibi',
  label: 'çember takibi',
  ring: 'attention',
  kind: 'practice',
  gates: { gaze: true, rest: true, active: true },
  storageKeys: [TRACK_BEST_KEY, TRACK_OPTS_KEY],
  home: { section: 'practice', order: 10 },
  sessions: {
    match: (s) => s.type === 'game' && s.game === 'track',
    countsTowardGoal: false,
    describe(s, { seconds }) {
      const score = finite(s.score)
      return {
        title: 'Çember takibi',
        score,
        best: finite(s.best),
        control: s.control ?? null,
        detail: join([
          score != null ? `${score}${NBSP}puan` : null,
          finite(s.followPct) != null ? `takip${NBSP}%${s.followPct}` : null,
          CONTROL_LABEL[s.control],
          durationPart(seconds, false),
        ]),
      }
    },
    best: (sessions) => trackBestFromSessions(sessions),
    bestLabel: 'Çember rekoru',
  },
}
