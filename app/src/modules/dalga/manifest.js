// Dalga: birkaç dakikalık ses (Sakin / Güç / Motivasyon; lib/dalga.js). Yaşam halkası; pratik. Günlük yola girmez.
// Kanıt sınırı: müzik stresi azaltır (de Witte 2019); binaural kanıtı karışık (Xiong 2025, Ingendoh 2023); 528 Hz
// iddiası kanıtsız. Tedavi değildir; puan kişi-içi gidişat içindir.
import { SESSION_TYPE, DALGA_OPTS_KEY, MODES, isDalga, experimentOf } from '../../lib/dalga.js'
import { withinDays } from '../../lib/today.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`

export default {
  id: 'dalga',
  title: 'Dalga',
  label: 'Dalga',
  ring: 'life',
  kind: 'practice',
  gates: {},
  storageKeys: [DALGA_OPTS_KEY],
  home: { section: 'practice', order: 35 },
  sessions: {
    match: (s) => s?.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: `Dalga · ${MODES[s.mode]?.name ?? ''}`.trim(),
        detail: join([Number.isFinite(s.before) && Number.isFinite(s.after) ? `${MODES[s.mode]?.word ?? 'puan'} ${s.before}→${s.after}` : null, durationPart(seconds, false)]),
      }
    },
  },
  stats(sessions, now) {
    const all = sessions.filter(isDalga)
    if (!all.length) return []
    const week = withinDays(all, now)
    const deltas = week.map((s) => s.delta).filter(Number.isFinite)
    const out = [
      { label: 'Dalga · 7 gün', value: `${Math.round(week.reduce((a, s) => a + (s.seconds ?? 0), 0) / 60)}${NBSP}dk`, sub: deltas.length ? `ortalama değişim ${signed(deltas.reduce((a, b) => a + b, 0) / deltas.length)}` : `${week.length}${NBSP}oturum` },
    ]
    const e = experimentOf(all)
    if (e.n) out.push({ label: 'Kişisel deney', value: e.ready ? `${signed(e.on.mean)} / ${signed(e.off.mean)}` : `${e.n}/6`, sub: e.ready ? 'katman açık / kapalı' : 'oturum' })
    return out
  },
}
