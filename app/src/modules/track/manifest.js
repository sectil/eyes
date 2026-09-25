// Çember takibi: atlayan çemberi gözle izleme pratiği. Görmeyi ölçmez; skor görme trendine girmez.
import { TRACK_BEST_KEY, TRACK_OPTS_KEY, trackBestFromSessions } from '../../lib/track.js'
import { NBSP, finite, join, durationPart, mean, CONTROL_LABEL } from '../../lib/format.js'
import { withinDays, isSameDay } from '../../lib/today.js'
const isTrack = (s) => s.type === 'game' && s.game === 'track'
const r0 = (v) => (v == null ? null : Math.round(v))

export default {
  id: 'track',
  title: 'Çember takibi',
  label: 'çember takibi',
  ring: 'attention',
  kind: 'practice',
  gates: { gaze: true, eyeBudget: 'eye' },
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
  // Bugünün yolu: her gün, 1. bölümde (kullanıcı isteği). VARSAYIM: bir tur ≈ 1 dk.
  today({ sessions, now }) {
    return { title: 'Çemberler', minutes: 1, slot: 'practice', glyph: 'constel', done: sessions.some((s) => isTrack(s) && isSameDay(s, now)) }
  },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isTrack), now)
    return { best: trackBestFromSessions(sessions) || null, sessions7: week.length, follow7: r0(mean(week.map((s) => finite(s.followPct)))) }
  },
  stats(sessions, now) {
    const best = trackBestFromSessions(sessions)
    const week = withinDays(sessions.filter(isTrack), now)
    const follow = r0(mean(week.map((s) => finite(s.followPct))))
    if (!best && !week.length) return []
    return [
      { label: 'Rekor', value: best ? `${best}${NBSP}puan` : '—' },
      { label: 'Takip · 7 gün', value: follow != null ? `%${follow}` : '—', sub: week.length ? `${week.length}${NBSP}tur` : 'tur yok' },
    ]
  },
}
