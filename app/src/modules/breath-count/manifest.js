// Nefes sayma ölçümü: farkındalığın davranışsal ölçüsü (Levinson 2014; bkz. lib/breathCount.js).
// Dikkat halkasının ana ölçümü; haftada bir. Kayıt sessions deposuna gider (type 'breath-count').
import { SESSION_TYPE, isBreathCount } from '../../lib/breathCount.js'
import { lastOfType, isDue, doneToday } from '../../lib/today.js'
import { NBSP, join, durationPart, mean } from '../../lib/format.js'
import { withinDays } from '../../lib/today.js'

export default {
  id: 'breath-count',
  title: 'Nefes sayma',
  label: 'nefes sayma ölçümü',
  ring: 'attention',
  kind: 'measure',
  gates: {}, // ekran karanlık; göz bütçesine sayılmaz
  home: { section: 'measure', order: 40 },
  coach(sessions, now) {
    const all = sessions.filter(isBreathCount)
    const week = withinDays(all, now)
    const acc = mean(week.map((s) => s.accuracy))
    return { sessions7: week.length, accuracy7: acc == null ? null : Math.round(acc), best: all.length ? Math.max(...all.map((s) => s.accuracy)) : null }
  },
  stats(sessions, now) {
    const all = sessions.filter(isBreathCount)
    if (!all.length) return []
    const last3 = all.slice(-3)
    const acc = mean(last3.map((s) => s.accuracy))
    const week = withinDays(all, now)
    return [
      { label: 'Doğruluk · son 3', value: acc == null ? '—' : `%${Math.round(acc)}`, sub: `en iyi %${Math.max(...all.map((s) => s.accuracy))}` },
      { label: 'Ölçüm · 7 gün', value: String(week.length) },
    ]
  },
  sessions: {
    match: (s) => s.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: 'Nefes sayma',
        detail: join([
          isBreathCount(s) ? `%${s.accuracy}${NBSP}doğruluk` : 'sonuç yok',
          Number.isFinite(s.sets) ? `${s.sets}${NBSP}set` : null,
          durationPart(seconds, false),
        ]),
      }
    },
  },
  // Haftada bir: zamanı geldiyse plana girer (okuma hızıyla aynı kural)
  today({ sessions, now }) {
    if (doneToday(sessions, SESSION_TYPE, now)) return { title: 'Nefes sayma', minutes: 3, done: true }
    return isDue(lastOfType(sessions, SESSION_TYPE), now) ? { title: 'Nefes sayma', minutes: 3, done: false } : null
  },
}
