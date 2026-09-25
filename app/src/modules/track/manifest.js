// Çemberler (eski adı Çember takibi): mercek ağında gözle izleme pratiği. Görmeyi ölçmez; skor görme
// trendine girmez. Kayıt v1 (Çember takibi: followPct, reactMs) ve v2 (Çemberler: pct, arriveMs,
// level, mode) birlikte okunur; v2 eski alanları da yazar (lib/track.js makeTrackRecord).
import { TRACK_BEST_KEY, TRACK_OPTS_KEY, trackBestFromSessions, trackPct, MODE_LABEL } from '../../lib/track.js'
import { NBSP, finite, join, durationPart, mean, CONTROL_LABEL } from '../../lib/format.js'
import { withinDays } from '../../lib/today.js'
const isTrack = (s) => s.type === 'game' && s.game === 'track'
const r0 = (v) => (v == null ? null : Math.round(v))
const arriveOf = (s) => (s.v === 2 && s.mode !== 'glide' ? finite(s.arriveMs) : null)

export default {
  id: 'track',
  title: 'Çemberler',
  label: 'çemberler',
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
      const v2 = s.v === 2
      const pct = finite(trackPct(s))
      return {
        title: 'Çemberler',
        score,
        best: finite(s.best),
        control: s.control ?? null,
        detail: join([
          v2 && finite(s.level) != null ? `Seviye${NBSP}${s.level}${MODE_LABEL[s.mode] ? ` ${MODE_LABEL[s.mode]}` : ''}` : null,
          score != null ? `${score}${NBSP}puan` : null,
          pct != null ? (v2 ? `isabet${NBSP}%${pct}` : `takip${NBSP}%${pct}`) : null,
          CONTROL_LABEL[s.control],
          durationPart(seconds, false),
        ]),
      }
    },
    best: (sessions) => trackBestFromSessions(sessions),
    bestLabel: 'Çemberler rekoru',
  },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isTrack), now)
    const arrive7 = r0(mean(week.map(arriveOf).filter((v) => v != null)))
    return {
      best: trackBestFromSessions(sessions) || null,
      sessions7: week.length,
      follow7: r0(mean(week.map((s) => finite(trackPct(s))))),
      ...(arrive7 != null ? { arrive7 } : {}),
    }
  },
  stats(sessions, now) {
    const best = trackBestFromSessions(sessions)
    const week = withinDays(sessions.filter(isTrack), now)
    const pct = r0(mean(week.map((s) => finite(trackPct(s)))))
    const arr = week.map(arriveOf).filter((v) => v != null)
    const arrive = r0(mean(arr))
    if (!best && !week.length) return []
    const rows = [
      { label: 'Rekor', value: best ? `${best}${NBSP}puan` : '—' },
      { label: 'İsabet · 7 gün', value: pct != null ? `%${pct}` : '—', sub: week.length ? `${week.length}${NBSP}tur` : 'tur yok' },
    ]
    if (arrive != null) rows.push({ label: 'Varış ort. · 7 gün', value: `${arrive}${NBSP}ms`, sub: `${arr.length}${NBSP}tur` })
    return rows
  },
}
