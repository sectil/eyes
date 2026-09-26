// Nefes pratiği: yavaş nefes kalıpları (Sakin ritim varsayılan). Yaşam halkası; günlük hedefe sayılır.
// Kanıt ve sınırlar: docs/yol-haritasi/NEFES_FARKINDALIK.md. Sağlık iddiası yok.
import { SESSION_TYPE, PATTERNS, BREATH_OPTS_KEY, BREATH_SAFETY_KEY, PROGRAM_DAY_SEC, isBreath } from '../../lib/breath.js'
import { isSameDay } from '../../lib/today.js'
import { NBSP, join, durationPart, mean } from '../../lib/format.js'
import { withinDays } from '../../lib/today.js'
const calmDelta = (s) => (Number.isFinite(s.calmBefore) && Number.isFinite(s.calmAfter) ? s.calmAfter - s.calmBefore : null)
const minutesOf = (list) => Math.round(list.reduce((m, s) => m + (Number.isFinite(s.seconds) ? s.seconds : 0), 0) / 60)

export default {
  id: 'breath',
  routes: ['breath', 'breath-rest'],
  title: 'Nefes',
  label: 'nefes pratiği',
  ring: 'life',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'calm',
    effects: [{ key: 'breath-calm', label: 'Nefes', measure: 'sakinlik', max: 5, pick: (s) => (s?.type === SESSION_TYPE ? [s.calmBefore, s.calmAfter] : null) }],
  },
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
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isBreath), now)
    const d = mean(week.map(calmDelta))
    return { sessions7: week.length, minutes7: minutesOf(week), calmDelta7: d == null ? null : +d.toFixed(1) }
  },
  stats(sessions, now) {
    const week = withinDays(sessions.filter(isBreath), now)
    if (!week.length) return []
    const d = mean(week.map(calmDelta))
    return [
      { label: 'Nefes · 7 gün', value: `${minutesOf(week)}${NBSP}dk`, sub: `${week.length}${NBSP}seans` },
      { label: 'Sakinlik değişimi', value: d == null ? '—' : `${d > 0 ? '+' : ''}${d.toFixed(1)}`, sub: d == null ? null : 'seans başı, 1–5' },
    ]
  },
  // Bugünün yolunda iki bölüm arasındaki mola durağı (yol planı §3.2): her gün, 5 dk. Yoldan açılınca
  // 'breath-rest' ekranı 5 dk ile başlar ve Ana sayfa 5 dk göz molasını başlatır (Home.jsx).
  // VARSAYIM: bugün en az 60 sn nefes kaydı varsa tamam. Eski kural (yalnızca başlamış ya da uyku/stres
  // sinyali olan kullanıcı) kullanıcı isteğiyle kalktı: nefes yolda her gün var.
  today({ sessions, now }) {
    const done = sessions.some((s) => isBreath(s) && s.seconds >= 60 && isSameDay(s, now))
    return { title: 'Nefes', sub: 'Gözlerin dinlenirken nefes al.', minutes: PROGRAM_DAY_SEC / 60, route: 'breath-rest', slot: 'rest', glyph: 'moon', done }
  },
}
