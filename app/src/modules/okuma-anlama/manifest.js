// Oku ve Anla: kısa bilim metninde sessiz okuma hızı ve anlama (docs/yol-haritasi/tasarim/okuma-anlama/PLAN.md).
// Hız yalnız 4 sorudan en az 3'ü doğruysa sayılır (lib/okumaMeasure.js). Kamera yok. Okuma testinden (reading) ayrı:
// onun ölçüsüne ve kayıtlarına dokunmaz.
// Yol (sahip kararı 2026-10-02): okuma testinin yerine sonsuz yolda; haftada 3 gün (Fark Ettin mi? ile aynı kural).
import { isOkuma, isFinished, speedSeries, comprehensionSeries, QUESTIONS, SESSION_TYPE } from '../../lib/okumaMeasure.js'
import { withinDays, isSameDay } from '../../lib/today.js'
import { unlocked } from '../../lib/progression.js'
import { NBSP, join, durationPart } from '../../lib/format.js'

export const ID = 'okuma-anlama'
export const SEED_KEY = 'okumaAnlama.seed'
export const WEEKLY_DAYS = 3
const dayKey = (s) => new Date(s.date).toDateString()
const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
// VARSAYIM (PLAN §5.1): ilk iki okuma alışma, sonraki üç okuma günü başlangıç; Gelişim sahibiyle kesinleşir
const V2 = { familiar: 2, baseDays: 3, currentDays: 3, sdFloor: 10 }

export default {
  id: ID,
  title: 'Oku ve Anla',
  label: 'Oku ve Anla',
  ring: 'attention',
  kind: 'practice',
  storageKeys: [SEED_KEY],
  progress: {
    domain: 'focus',
    metrics: [
      {
        key: 'okuma-anlama-hiz', label: 'Okuma hızı', unit: 'kelime/dk', better: 'up', v2: V2,
        // Nef hız artışını yalnız anlama "değişim yok" ya da "başlangıcından iyi" iken söyler (lib/nef/moments.js)
        nefWith: 'okuma-anlama-anlama',
        series: ({ sessions }) => speedSeries(sessions),
      },
      {
        key: 'okuma-anlama-anlama', label: 'Anlama', unit: '%', better: 'up', min: 0, max: 100, v2: V2,
        series: ({ sessions }) => comprehensionSeries(sessions),
      },
    ],
  },
  gates: { eyeBudget: 'eye' },
  home: { section: 'practice', order: 12 },
  sessions: {
    match: isOkuma,
    countsTowardGoal: true,
    describe(s, { seconds }) {
      return {
        title: 'Oku ve Anla',
        detail: join([Number.isFinite(s.wpm) ? `${s.wpm}${NBSP}kelime/dk` : null, Number.isFinite(s.correct) ? `${s.correct}/${QUESTIONS} doğru` : null, durationPart(seconds, false)]),
      }
    },
  },
  // Yolda haftada 3 gün: son 7 günde 3 günden az bitirildiyse (bugün bitirildiyse tamam görünür). Yola
  // kayıtlı üçüncü günden (okuma testi ikinci gündü); 1. ve 2. gün mola kuralı bozulmasın diye (lib/ladders.js UNLOCK). Yarıda kalan okuma yapılmış sayılmaz.
  today(ctx) {
    const { sessions, now } = ctx
    if (!unlocked(ctx, ID)) return null
    const fin = sessions.filter(isFinished)
    const done = fin.some((s) => isSameDay(s, now))
    const days = new Set(withinDays(fin, now).map(dayKey)).size
    if (!done && days >= WEEKLY_DAYS) return null
    // Okuma testinin yolda durduğu yer ve ağırlık: 2. bölümün sonu (slot 'measure'), yol planında göz payı 0, düşme sırası
    // yok. VARSAYIM: 1 dk göz payı 2. bölümü taşırıp Yılan'ı, durak bitirilmezse Tek Bakışta / Fark Ettin mi?'yi her gün
    // düşürüyordu. Açılınca göz bütçesi kapısı (gates.eyeBudget 'eye') gerçek kullanımı yine sayar.
    return { title: 'Oku ve Anla', minutes: 2, eyeMin: 0, slot: 'measure', weekDays: days, done }
  },
  remind: {
    route: ID,
    window: 'calm',
    science: ['rayner2016'],
    doneToday: (sessions, now) => sessions.some((s) => isFinished(s) && isSameDay(s, now)),
  },
  coach(sessions, now) {
    const week = withinDays(sessions.filter(isFinished), now)
    if (!week.length) return null
    const valid = week.filter((s) => s.valid === true && Number.isFinite(s.wpm))
    return { reads7: week.length, wpm7: valid.length ? Math.round(median(valid.map((s) => s.wpm))) : 0, comp7: Math.round(median(week.map((s) => (100 * s.correct) / QUESTIONS))) }
  },
  // Nef (registry.js `nef` sözleşmesi; ad sahip onaylı 2026-10-02, okuma-anlama/METINLER.md §5)
  nef: {
    name: { tr: { '': 'Oku ve Anla alıştırması', ABL: 'Oku ve Anla alıştırmasından', ACC: 'Oku ve Anla alıştırmasını', LOC: 'Oku ve Anla alıştırmasında', DAT: 'Oku ve Anla alıştırmasına', INS: 'Oku ve Anla alıştırmasıyla', POSS: 'Oku ve Anla alıştırman', 'POSS-ABL': 'Oku ve Anla alıştırmandan' } },
    metricWords: { tr: { 'okuma-anlama-hiz': { word: 'okuma hızın', unit: 'kelime/dk' }, 'okuma-anlama-anlama': { word: 'anladığın soru', unit: '%', percent: true } } },
    moments: ['metricChange', 'firstTime', 'returnAfterGap'],
    // Ölçüme bağlı özel cümle; FTB-OA1 ve RG-OA1 bankada only.module ile yalnız bu modülde (lib/nef/bank/tr.js)
    cells: ['MC-OA1'],
    evidence: ['rayner2016', 'miyata2012'],
    note: 'Oku ve Anla: kısa bilim metninde sessiz okuma hızı ve anlama; hız yalnız anlama ≥ 3/4 iken sayılır.',
  },
}

export { SESSION_TYPE }
