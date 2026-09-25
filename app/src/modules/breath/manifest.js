// Nefes pratiği: yavaş nefes kalıpları (Sakin ritim varsayılan). Yaşam halkası; günlük hedefe sayılır.
// Kanıt ve sınırlar: docs/yol-haritasi/NEFES_FARKINDALIK.md. Sağlık iddiası yok.
import { SESSION_TYPE, PATTERNS, BREATH_OPTS_KEY, BREATH_SAFETY_KEY, PROGRAM_DAY_SEC, isBreath, programProgress } from '../../lib/breath.js'
import { doneToday } from '../../lib/today.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

export default {
  id: 'breath',
  title: 'Nefes',
  label: 'nefes pratiği',
  ring: 'life',
  kind: 'practice',
  gates: {},
  storageKeys: [BREATH_OPTS_KEY, BREATH_SAFETY_KEY],
  home: { section: 'practice', order: 30 },
  sessions: {
    match: (s) => s.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      const calm = s.calmBefore != null && s.calmAfter != null ? `sakinlik ${s.calmBefore}→${s.calmAfter}` : null
      return {
        title: 'Nefes pratiği',
        detail: join([PATTERNS[s.pattern]?.title ?? null, Number.isFinite(s.cycles) ? `${s.cycles}${NBSP}döngü` : null, calm, durationPart(seconds, false)]),
      }
    },
  },
  // Program (günde 5 dk × 28 gün) yalnızca kullanıcı bir kez başladıysa plana girer (VARSAYIM: zorlama yok)
  today({ sessions, now }) {
    if (!sessions.some(isBreath)) return null
    const p = programProgress(sessions, now)
    return { title: 'Nefes', minutes: PROGRAM_DAY_SEC / 60, done: p.todayDone || doneToday(sessions, SESSION_TYPE, now) }
  },
}
