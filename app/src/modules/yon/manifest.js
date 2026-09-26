// Yön: kendini tanıma (Ayna: öz-şefkat) ve yazı egzersizleri (Dışarıdan bak, Şefkatle ele al). lib/yon.js.
// Yaşam halkası; pratik; günlük yola girmez. Tedavi değildir; puanlar kişi-içi gidişat içindir. Koça gitmez.
import { SESSION_TYPE, YON_NOTES_KEY, isYon, aynaRecords } from '../../lib/yon.js'
import { withinDays } from '../../lib/today.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

const fmt1 = (v) => v.toFixed(1).replace('.', ',')
const TITLES = { ayna: 'Ayna', uzak: 'Dışarıdan bak', sefkat: 'Şefkatle ele al' }

export default {
  id: 'yon',
  title: 'Yön',
  label: 'Yön',
  ring: 'life',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'self',
    effects: [{ key: 'yon-uzak', label: 'Yön · Dışarıdan bak', measure: 'rahatsızlık', max: 10, better: 'down', pick: (s) => (s?.type === SESSION_TYPE && s.tool === 'uzak' ? [s.before, s.after] : null) }],
    metrics: [
      {
        key: 'yon-ayna', label: 'Kendine yaklaşım (Ayna)', unit: '/5', better: 'up',
        series: ({ sessions }) => sessions.filter((s) => s?.type === SESSION_TYPE && s.tool === 'ayna' && Number.isFinite(s.score)).map((s) => ({ date: s.date, value: s.score })),
      },
    ],
  },
  gates: {},
  storageKeys: [YON_NOTES_KEY],
  home: { section: 'practice', order: 37 },
  sessions: {
    match: (s) => s?.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      const detail = s.tool === 'ayna' ? `öz-şefkat ${fmt1(s.score)}${NBSP}/${NBSP}5` : s.tool === 'uzak' ? `rahatsızlık ${s.before}→${s.after}` : s.step ? 'küçük adım seçildi' : null
      return { title: `Yön · ${TITLES[s.tool] ?? ''}`.trim(), detail: join([detail, durationPart(seconds, false)]) }
    },
  },
  stats(sessions, now) {
    const all = sessions.filter(isYon)
    if (!all.length) return []
    const out = []
    const aynas = aynaRecords(all)
    if (aynas.length) {
      const first = aynas[0], last = aynas.at(-1)
      out.push({ label: 'Ayna · öz-şefkat', value: `${fmt1(last.score)}${NBSP}/${NBSP}5`, sub: aynas.length > 1 ? `ilk ölçüme göre ${last.score >= first.score ? '+' : '−'}${fmt1(Math.abs(last.score - first.score))}` : 'ilk ölçüm' })
    }
    const week = withinDays(all.filter((s) => s.tool !== 'ayna'), now)
    if (week.length) out.push({ label: 'Yazı egzersizi · 7 gün', value: String(week.length), sub: `${week.filter((s) => s.tool === 'uzak').length} dışarıdan bak · ${week.filter((s) => s.tool === 'sefkat').length} şefkat` })
    return out
  },
}
