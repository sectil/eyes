// Tek Bakışta: görsel menzil — gözü kıpırdatmadan tanınan harf sayısı (lib/span.js). Göz halkası; pratik.
// İddia sınırı: alıştırma kazanımı çalışmalarda çevresel görüşte gösterildi (Chung 2004, Yu 2010); normal okumaya
// aktarımı ve görmeyi iyileştirdiği gösterilmedi. Harfler kısa süre göründüğü için ilk turdan önce epilepsi sorusu.
import { SESSION_TYPE, isSpan } from '../../lib/span.js'
import { withinDays, isSameDay } from '../../lib/today.js'
import { unlocked } from '../../lib/progression.js'
import { profileSignals } from '../../lib/profile.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

const dayKey = (s) => new Date(s.date).toDateString()
export const WEEKLY_DAYS = 3 // yolda haftada 3 gün (onaylı taslak)

export default {
  id: 'tek-bakis',
  title: 'Tek Bakışta',
  label: 'Tek Bakışta',
  ring: 'eye',
  kind: 'practice',
  // Gelişim 2.0: bu modülün kişinin takibine katkısı (registry.js progress sözleşmesi)
  progress: {
    domain: 'focus',
    metrics: [
      {
        key: 'tek-bakis-span', label: 'Tek bakışta kavranan', unit: 'harf', better: 'up',
        series: ({ sessions }) => sessions.filter((s) => s?.type === SESSION_TYPE && Number.isFinite(s.span)).map((s) => ({ date: s.date, value: s.span })),
      },
    ],
  },
  gates: { eyeBudget: 'eye' },
  ask: { before: ['seizure'] },
  home: { section: 'practice', order: 15 },
  // "Bana hatırlat" (bildirim PLAN.v1 §A.1 modül tablosu: kendi rotası, `move`; metin lib/remindTexts.js TB). Kaynak
  // chung2004 (kanıt kapısı 2, kanit-2-onay.md). Yoldan açılınca kart çıkmaz (view.jsx). VARSAYIM: plan tablosunda
  // defaultTime yok; veri yokken lib/moduleRemind.js FALLBACK_TIME.
  remind: { route: 'tek-bakis', window: 'move', science: ['chung2004'] },
  sessions: {
    match: (s) => s?.type === SESSION_TYPE,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: 'Tek Bakışta',
        detail: join([Number.isFinite(s.span) ? `~${s.span}${NBSP}harf` : null, Number.isFinite(s.durationMs) ? `${s.durationMs}${NBSP}ms` : null, durationPart(seconds, false)]),
      }
    },
  },
  // Bugünün yolu: son 7 günde 3 günden az yapıldıysa 2. bölümde 2 dk'lık durak; yol uzarsa Yılan'dan sonra düşer.
  // İlerleme açıkken (ctx.progression) yola kayıtlı sekizinci günden gelir (lib/ladders.js UNLOCK; SONSUZ_YOL §3.A.7).
  today(ctx) {
    const { sessions, now, profile } = ctx
    if (!unlocked(ctx, 'tek-bakis')) return null
    if (profile && profileSignals(profile).flashSafe === false) return null
    const done = sessions.some((s) => isSpan(s) && isSameDay(s, now))
    const days = new Set(withinDays(sessions.filter(isSpan), now).map(dayKey)).size
    if (!done && days >= WEEKLY_DAYS) return null
    return { title: 'Tek Bakışta', minutes: 2, slot: 'body', order: 95, glyph: 'span', dropRank: 1.5, rotate: 'week3', weekDays: days, done }
  },
  // span7: son 7 günün turlarının ORTANCASI (onaylı SONSUZ_YOL §3.B.6; gelisim-merkezi PLAN §8.2). En iyi tur (bugün
  // Math.max) şansla bir kez yüksek çıkan turu Nef'e "seviye" diye taşıyordu; ortanca, ölçü kuralı v2'nin günlük
  // ortancasıyla aynı ilkedir (DENETIM K4). VARSAYIM: turlar günlere göre ayrı ayrı değil, hepsi birlikte.
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isSpan), now)
    if (!week.length) return null
    const v = week.map((s) => s.span).sort((a, b) => a - b)
    const m = v.length >> 1
    return { span7: v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2, rounds7: week.length, first: sessions.find(isSpan).span }
  },
  stats(sessions, now) {
    const all = sessions.filter(isSpan)
    if (!all.length) return []
    const week = withinDays(all, now)
    return [
      { label: 'Tek bakışta', value: `~${all.at(-1).span}${NBSP}harf`, sub: `ilk tur ~${all[0].span}` },
      { label: 'Tur · 7 gün', value: String(week.length), sub: `son süre ${all.at(-1).durationMs}${NBSP}ms` },
    ]
  },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-01): ad çekimleri, genel anlar, kanıt, tanıtım satırı.
  // cells: bu modüle özel onaylı cümle (lib/nef/bank/tr.js FTB-8, only: tek-bakis-span)
  nef: {
    name: { tr: { '': 'Tek Bakışta oyunu', ABL: 'Tek Bakışta oyunundan', ACC: 'Tek Bakışta oyununu', LOC: 'Tek Bakışta oyununda', DAT: 'Tek Bakışta oyununa', INS: 'Tek Bakışta oyunuyla' } },
    metricWords: { tr: { 'tek-bakis-span': { word: 'kavradığın harf sayısı', unit: 'harf' } } },
    moments: ['metricChange', 'firstTime', 'returnAfterGap'],
    cells: ['FTB-8'],
    evidence: ['chung2004'],
    note: 'Tek Bakışta oyunu: gözü kıpırdatmadan kavranan harf sayısı (görsel menzil).',
  },
}
