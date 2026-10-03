// Yakala Yaz: kısa süre gösterilen iki kelimeyi yakalayıp yazma (kelime-hafiza/PLAN.md). Dikkat halkası; pratik.
// Ölçü: iki kelimenin doğru yakalandığı gösterim süresi (tur eşiği, ms, düşük daha iyi). Okuma hızı, görme açısı, beyin
// ya da sağlık iddiası yok; okuma hızına aktarımı gösterilmedi (Rayner 2016; Simons 2016).
import { isYakala, seriesOf, SESSION_TYPE } from '../../lib/yakalaYaz.js'
import { withinDays, isSameDay } from '../../lib/today.js'
import { unlocked } from '../../lib/progression.js'
import { profileSignals } from '../../lib/profile.js'
import { NBSP, join, durationPart } from '../../lib/format.js'
import tekBakis from '../tek-bakis/manifest.js'
import farkEttin from '../fark-ettin/manifest.js'

export const ID = 'yakala-yaz'
export const WEEKLY_DAYS = 3
const dayKey = (s) => new Date(s.date).toDateString()

// Tek Bakışta bugün yolda mı: lib/today.js rotate kuralının aynısı (Tek Bakışta ile Fark Ettin mi? 'week3' grubu: bugün
// yapılan; yoksa bu hafta en az yapılan; eşitse güne göre sırayla). Yakala Yaz o gün gelmez (ikisi de kısa gösterim,
// göz bütçesi; PLAN §8). Yol dosyasına dokunulmaz: Build 29'daki week3 dönüşümü aynen kalır (testle).
export function tekBakisOnPath(ctx) {
  const tb = tekBakis.today(ctx)
  if (!tb) return false
  const fe = farkEttin.today(ctx)
  if (!fe || fe.rotate !== tb.rotate) return true
  const list = [{ key: 'tek-bakis', ...tb }, { key: 'fark-ettin', ...fe }]
  const done = list.find((s) => s.done)
  if (done) return done.key === 'tek-bakis'
  const least = Math.min(...list.map((s) => s.weekDays))
  const cands = list.filter((s) => s.weekDays === least).sort((a, b) => a.key.localeCompare(b.key))
  const dayIdx = Math.floor(new Date(ctx.now).getTime() / 86400000)
  return cands[dayIdx % cands.length].key === 'tek-bakis'
}
const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export default {
  id: ID,
  title: 'Yakala Yaz',
  label: 'Yakala Yaz',
  ring: 'attention',
  kind: 'practice',
  // Kısa gösterim: Tek Bakışta ve Hızlı Bakış gibi göz bütçesi ve ilk turdan önce nöbet sorusu (Harding 2005)
  gates: { eyeBudget: 'eye' },
  ask: { before: ['seizure'] },
  home: { section: 'practice', order: 17 }, // VARSAYIM: Tek Bakışta (15) ardından
  // Gelişim (registry.js progress sözleşmesi; PLAN §4.1): hüküm Gelişim'in ölçü kuralı v2'siyle kurulur
  progress: {
    domain: 'focus',
    metrics: [
      {
        key: 'yakala-yaz-ms', label: 'İki kelimeyi yakaladığın süre', unit: 'ms', better: 'down', min: 50, max: 500,
        v2: { familiar: 2, sdFloor: 15 }, // VARSAYIM sdFloor 15 ms (benzetimde tur içi yayılım); ilk 30 gün verisiyle bakılır
        series: ({ sessions }) => seriesOf(sessions),
      },
    ],
  },
  sessions: {
    match: isYakala,
    countsTowardGoal: true,
    // METINLER GE2: "Yakala Yaz · {ms} ms · basamak {n}"
    describe(s, { seconds }) {
      return {
        title: 'Yakala Yaz',
        detail: join([Number.isFinite(s.thresholdMs) ? `${s.thresholdMs}${NBSP}ms` : null, Number.isFinite(s.thresholdStep) ? `basamak${NBSP}${s.thresholdStep}` : null, durationPart(seconds, false)]),
      }
    },
  },
  // Sonsuz yol: yola kayıtlı 10. günden (lib/ladders.js UNLOCK), haftada 3 gün, 2 dk, Tek Bakışta ile aynı gün değil.
  // Işığa duyarlılık cevabı "evet" ya da "emin değilim" ise yolda çıkmaz (Tek Bakışta gibi; Harding 2005).
  today(ctx) {
    const { sessions, now, profile } = ctx
    if (!unlocked(ctx, ID)) return null
    if (profile && profileSignals(profile).flashSafe === false) return null
    const mine = sessions.filter(isYakala)
    const done = mine.some((s) => isSameDay(s, now))
    const days = new Set(withinDays(mine, now).map(dayKey)).size
    if (!done && days >= WEEKLY_DAYS) return null
    if (!done && tekBakisOnPath(ctx)) return null
    return { title: 'Yakala Yaz', minutes: 2, slot: 'body', order: 96, dropRank: 1.5, weekDays: days, done }
  },
  remind: { route: ID, window: 'move', defaultTime: '13:30', science: ['rubin1992'] },
  // Nef'e 7 günlük özet (PLAN §4.3): ms7 son 7 günün tur eşiklerinin ortancası (en iyi tur değil)
  coach(sessions, now) {
    const all = sessions.filter((s) => isYakala(s) && Number.isFinite(s.thresholdMs))
    const week = withinDays(all, now)
    if (!week.length) return null
    return { ms7: Math.round(median(week.map((s) => s.thresholdMs))), rounds7: week.length, first: all[0].thresholdMs, step7: Math.floor(median(week.map((s) => s.thresholdStep))) }
  },
  // Gelişim → Pratikler (METINLER GE3)
  stats(sessions, now) {
    const all = sessions.filter((s) => isYakala(s) && Number.isFinite(s.thresholdMs))
    if (!all.length) return []
    const week = withinDays(all, now)
    return [
      { label: 'Yakala Yaz', value: `${all.at(-1).thresholdMs}${NBSP}ms`, sub: `ilk tur ${all[0].thresholdMs}${NBSP}ms` },
      { label: 'Tur · 7 gün', value: String(week.length), sub: `basamak ${all.at(-1).thresholdStep}` },
    ]
  },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-02, METINLER A2, N1–N3). Düşük-iyi ölçünün değişimi için
  // bankada onaylı cümle yok: metricChange anı yok (değişim Gelişim kartında); rekor kartı yok.
  nef: {
    name: { tr: { '': 'Yakala Yaz alıştırması', ABL: 'Yakala Yaz alıştırmasından', ACC: 'Yakala Yaz alıştırmasını', LOC: 'Yakala Yaz alıştırmasında', DAT: 'Yakala Yaz alıştırmasına', INS: 'Yakala Yaz alıştırmasıyla', POSS: 'Yakala Yaz alıştırman', 'POSS-ABL': 'Yakala Yaz alıştırmandan' } },
    metricWords: { tr: { 'yakala-yaz-ms': { word: 'iki kelimeyi yakaladığın süre', unit: 'ms' } } },
    moments: ['firstTime', 'returnAfterGap'],
    cells: ['FYY-1'],
    evidence: ['rubin1992', 'garcia1998', 'rayner2016', 'simons2016'],
    note: 'Yakala Yaz alıştırması: kısa süre gösterilen iki kelimeyi yakalayıp yazma; ölçü iki kelimenin doğru yakalandığı gösterim süresi (ms, düşük daha iyi). Okuma hızına aktarımı gösterilmedi.',
  },
}

export { SESSION_TYPE }
