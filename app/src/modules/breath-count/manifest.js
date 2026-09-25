// Nefes sayma ölçümü: farkındalığın davranışsal ölçüsü (Levinson 2014; bkz. lib/breathCount.js).
// Dikkat halkasının ana ölçümü; haftada bir. Kayıt sessions deposuna gider (type 'breath-count').
import { SESSION_TYPE, isBreathCount } from '../../lib/breathCount.js'
import { lastOfType, isDue, doneToday } from '../../lib/today.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

export default {
  id: 'breath-count',
  title: 'Nefes sayma',
  label: 'nefes sayma ölçümü',
  ring: 'attention',
  kind: 'measure',
  gates: {}, // ekran karanlık; göz bütçesine sayılmaz
  home: { section: 'measure', order: 40 },
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
