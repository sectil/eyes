// Hızlı Bakış: UFOV tarzı bölünmüş dikkat pratiği (lib/quicklook.js). Dikkat halkası.
// İddia sınırı: görevdeki hız ölçülür ve çalıştırılır; görme, sürüş ya da beyin sağlığı iddiası yok (SENTEZ §13).
// Kapı: göz bütçesi ('eye') ve profildeki ışığa duyarlı nöbet cevabı (ekran içinde; lib/profile.js flashSafe).
import { SESSION_TYPE, isQuickLook, programHours, firstAndBest, PROGRAM_HOURS } from '../../lib/quicklook.js'
import { NBSP, join, durationPart } from '../../lib/format.js'
import { withinDays, doneToday } from '../../lib/today.js'
import { profileSignals } from '../../lib/profile.js'

const WEEKLY = 3 // haftada 3–4 seans (rapor 14 §2; rapor 20)

export default {
  id: 'quick-look',
  title: 'Hızlı Bakış',
  label: 'Hızlı Bakış',
  ring: 'attention',
  kind: 'practice',
  gates: { eyeBudget: 'eye' },
  ask: { before: ['seizure'] }, // flaşlı görevden hemen önce (lib/profileQuestions.js)
  home: { section: 'practice', order: 5 },
  sessions: {
    match: (s) => s.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: 'Hızlı Bakış',
        detail: join([Number.isFinite(s.threshold) ? `eşik ${s.threshold}${NBSP}ms` : null, Number.isFinite(s.accuracy) ? `%${s.accuracy}` : null, durationPart(seconds, false)]),
      }
    },
  },
  // Plana: kullanıcı bir kez başladıysa, bu hafta 3 seansı dolmadıysa ve bugün yapılmadıysa. Nöbet cevabı kapalıysa asla.
  today({ sessions, now, profile }) {
    if (profile && profileSignals(profile).flashSafe === false) return null
    if (!sessions.some((s) => s.type === SESSION_TYPE)) return null
    const week = withinDays(sessions.filter((s) => s.type === SESSION_TYPE), now)
    if (week.length >= WEEKLY && !doneToday(sessions, SESSION_TYPE, now)) return null
    // Yolda: molanın ardından 2. bölümün tek göz durağı (50 deneme bütçe kilidine takılmasın; yol planı R5)
    return { title: 'Hızlı Bakış', minutes: 5, slot: 'open', glyph: 'flash', openEnded: true, exclusive: true, dropRank: 1, done: doneToday(sessions, SESSION_TYPE, now) }
  },
  coach(sessions, now) {
    const fb = firstAndBest(sessions)
    if (!fb.n) return null // hiç oynanmadıysa Jev'e alan gönderme
    const week = withinDays(sessions.filter(isQuickLook), now)
    return { first: fb.first, last: fb.last, sessions7: week.length, hours: +programHours(sessions).toFixed(1) }
  },
  stats(sessions, now) {
    const fb = firstAndBest(sessions)
    if (!fb.n) return []
    const week = withinDays(sessions.filter(isQuickLook), now)
    return [
      { label: 'Eşik', value: `${fb.last}${NBSP}ms`, sub: `ilk ${fb.first}${NBSP}ms` },
      { label: 'Program', value: `${programHours(sessions).toFixed(1)} / ${PROGRAM_HOURS} sa`, sub: `bu hafta ${week.length}` },
    ]
  },
}
