// Yılan: gözle ya da dokunarak oynanan göz pratiği. Eğlence; görmeyi ölçmez.
import { BEST_KEY, OPTS_KEY, bestFromSessions } from '../../lib/snake.js'
import { SNAKE_GAZE_KEY, CHECK_PASS_HITS } from '../../lib/snakeGaze.js'
import { NBSP, finite, join, durationPart, CONTROL_LABEL } from '../../lib/format.js'
import { withinDays, isSameDay } from '../../lib/today.js'
import { unlocked } from '../../lib/progression.js'
const isSnake = (s) => s.type === 'game' && s.game === 'snake'
// Girişteki kısa kontrolde dört kapının hepsi tuttuysa süre ortancası (ms). Yalnız sayı; oyun puanı değil.
const gazeMs = (s) => (s && isSnake(s) && s.gaze?.hits >= CHECK_PASS_HITS && Number.isFinite(s.gaze?.ms) ? s.gaze.ms : null)

export default {
  id: 'snake',
  title: 'Yılan',
  label: 'Yılan oyunu',
  ring: 'attention',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  // Oyun puanı gelişim ölçüsü sayılmaz (rekor ayrı). Ölçü: girişteki kontrolde kapıya bakıştan dönüşe geçen süre.
  // VARSAYIM: yayımlanmış anlamlı değişim eşiği yok (meaningful yok); Gelişim ilk yarı / son yarı kuralıyla bakar.
  progress: {
    domain: 'focus',
    metrics: [
      {
        key: 'snake-gaze-ms', label: 'Bakışla yön verme', unit: 'ms', better: 'down',
        series: ({ sessions }) => sessions.filter((s) => gazeMs(s) != null).map((s) => ({ date: s.date, value: gazeMs(s) })),
      },
    ],
  },
  // Yılan kendi bakış ayarını yapar (lib/snakeGaze.js); sistem göz kalibrasyonunu şart koşmaz.
  gates: { eyeBudget: 'eye' },
  storageKeys: [BEST_KEY, OPTS_KEY, SNAKE_GAZE_KEY],
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
  // İlerleme açıkken (ctx.progression) yola kayıtlı ikinci günden gelir (lib/ladders.js UNLOCK; SONSUZ_YOL §3.A.7).
  today(ctx) {
    const { sessions, now } = ctx
    if (!unlocked(ctx, 'snake')) return null
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
