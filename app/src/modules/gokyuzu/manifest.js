// Gökyüzü molası: 2 dk ufka ve gökyüzüne bakma (lib/gokyuzu.js). Yaşam halkası; pratik; günlük yola girmez.
// Doğrudan gökyüzü çalışması yok; yakın kanıtlar ve kaynakları lib/sources.js. Sağlık iddiası yok.
import { SESSION_TYPE, isGokyuzu, history } from '../../lib/gokyuzu.js'
import { withinDays } from '../../lib/today.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

export default {
  id: 'gokyuzu',
  title: 'Gökyüzü molası',
  label: 'Gökyüzü molası',
  ring: 'life',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'calm',
    effects: [{ key: 'gokyuzu-rest', label: 'Gökyüzü molası', measure: 'dinlenmişlik', max: 10, pick: (s) => (s?.type === SESSION_TYPE ? [s.before, s.after] : null) }],
  },
  gates: {},
  home: { section: 'practice', order: 36 },
  sessions: {
    match: (s) => s?.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: 'Gökyüzü molası',
        detail: join([Number.isFinite(s.before) && Number.isFinite(s.after) ? `dinlenmişlik ${s.before}→${s.after}` : null, durationPart(seconds, false)]),
      }
    },
  },
  stats(sessions, now) {
    const all = sessions.filter(isGokyuzu)
    if (!all.length) return []
    const week = withinDays(all, now)
    const h = history(all)
    return [{ label: 'Gökyüzü molası · 7 gün', value: `${week.length}${NBSP}mola`, sub: h.mean != null ? `ortalama değişim ${h.mean >= 0 ? '+' : '−'}${Math.abs(h.mean).toFixed(1).replace('.', ',')}` : `${h.n}/3 puanlı mola` }]
  },
}
