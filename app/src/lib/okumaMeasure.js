// Oku ve Anla ölçümü (okuma-anlama/PLAN.md §3.2–§3.4). Saf.
// Hız yalnız metin anlaşıldıysa sayılır: hız–anlama takası (Miyata 2012, Rayner 2016). Sessiz okuma ortalaması
// 240–260 kelime/dk (Kuperman 2021). VARSAYIM: 600 üstü göz gezdirme, 60 altı dalgınlık; eşikler pilotla kesinleşir.
import { wordCount } from './okumaBank.js'

export const SESSION_TYPE = 'okuma-anlama'
export const QUESTIONS = 4
export const LIMITS = Object.freeze({ minCorrect: 3, minWpm: 60, maxWpm: 600 })
// Sayılmama nedenleri: ara = okurken uygulama arka plana geçti (soru sorulmaz)
export const REASONS = Object.freeze(['ara', 'dusuk-anlama', 'cok-hizli', 'cok-yavas'])

export const isOkuma = (s) => s?.type === SESSION_TYPE
// Bitirilmiş okuma: sorular cevaplandı. Yarıda kalan (ara) metin okunmuş sayılmaz (PLAN §4.1).
export const isFinished = (s) => isOkuma(s) && Number.isFinite(s.correct)

export const wpmOf = (words, ms) => (ms > 0 ? Math.round(words / (ms / 60000)) : null)

// → { wpm, valid, reason }. hidden: okurken uygulama arka plana geçti mi.
export function judge({ words, ms, correct, hidden = false }) {
  const wpm = wpmOf(words, ms)
  if (hidden) return { wpm, valid: false, reason: 'ara' }
  if (!(correct >= LIMITS.minCorrect)) return { wpm, valid: false, reason: 'dusuk-anlama' }
  if (!Number.isFinite(wpm) || wpm > LIMITS.maxWpm) return { wpm, valid: false, reason: 'cok-hizli' }
  if (wpm < LIMITS.minWpm) return { wpm, valid: false, reason: 'cok-yavas' }
  return { wpm, valid: true, reason: null }
}

// Oturum kaydı (PLAN §3.4)
export function makeRecord({ text, cycle, ms, correct, qIds, hidden = false, fontScale = 1, now = new Date(), seconds }) {
  const words = wordCount(text.metin)
  const done = !hidden && Number.isFinite(correct)
  const { wpm, valid, reason } = judge({ words, ms, correct: done ? correct : null, hidden })
  return {
    type: SESSION_TYPE, date: now.toISOString(), textId: text.id, cycle, words, chars: text.metin.length, ms: Math.round(ms), wpm,
    correct: done ? correct : null, total: QUESTIONS, qIds: done ? qIds : [], valid, reason, fontScale,
    seconds: Number.isFinite(seconds) ? seconds : Math.round(ms / 1000),
  }
}

// Hız serisi: geçerli okumalar, yalnız son geçerli okumanın yazı boyunda (PLAN §3.3; satır uzunluğu hızı değiştirir,
// Schneps 2013). Anlama serisi: bitirilen her okuma, yüzde (0, 25, 50, 75, 100).
export function speedSeries(sessions = []) {
  const ok = sessions.filter((s) => isOkuma(s) && s.valid === true && Number.isFinite(s.wpm))
  if (!ok.length) return []
  const scale = ok.at(-1).fontScale ?? 1
  return ok.filter((s) => (s.fontScale ?? 1) === scale).map((s) => ({ date: s.date, value: s.wpm }))
}
export const comprehensionSeries = (sessions = []) => sessions.filter(isFinished).map((s) => ({ date: s.date, value: (100 * s.correct) / QUESTIONS }))
