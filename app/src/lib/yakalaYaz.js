// Yakala Yaz: hız merdiveni, tur eşiği, cevap denetimi, kayıt (kelime-hafiza/PLAN.md §1–§4). Saf.
// Merdiven: her doğruda +1 basamak (hızlanır), her yanlışta −3 basamak (yavaşlar); sınır 1–18. Adım oranı 1/3 ile
// doğru oranı ≈ %75'e yerleşir (García-Pérez 1998, PMID 9797963; Kaernbach 1991, PMID 2011460).
import { fold, lowerTr, SESSION_TYPE, ROUND_TRIALS } from './yakalaYazWords.js'

export { SESSION_TYPE, ROUND_TRIALS }
export const MIN_TRIALS = 10 // bundan az denemede bırakılan tur yazılmaz
export const FIRST_STEP = 3
export const WARMUP = 2 // yeni tur, son turun eşik basamağından bu kadar yavaş başlar
export const GAP_DAYS = 14
export const GAP_WARMUP = 4
export const DOT_MS = 600
export const MASK_MS = 150
export const FEEDBACK_MS = 900
// 60 Hz ekran karesi; 120 Hz ekranda aynı süre iki kat kare
export const FRAMES = Object.freeze([30, 27, 24, 21, 19, 17, 15, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3])
export const STEPS = FRAMES.length
export const msOf = (step) => Math.round((FRAMES[clampStep(step) - 1] * 1000) / 60)
export const MS = Object.freeze(FRAMES.map((_, i) => msOf(i + 1)))
export function clampStep(step) {
  return Math.min(STEPS, Math.max(1, Math.round(Number.isFinite(step) ? step : FIRST_STEP)))
}
export const nextStep = (step, ok) => clampStep(ok ? step + 1 : step - 3)

export const isYakala = (s) => s?.type === SESSION_TYPE
const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Turun başlangıç basamağı: ilk tur 3; sonra son turun eşik basamağından 2 yavaş; 14+ gün aradan sonra 4 yavaş
export function startStepOf(sessions = [], now = new Date()) {
  const last = sessions.filter((s) => isYakala(s) && Number.isFinite(s.thresholdStep)).at(-1)
  if (!last) return FIRST_STEP
  const gap = (new Date(now) - new Date(last.date)) / 86400000
  return clampStep(last.thresholdStep - (gap >= GAP_DAYS ? GAP_WARMUP : WARMUP))
}

// Gösterim sapması: istenen süreden 1 kareden çok sapan deneme ölçüye girmez, merdiveni oynatmaz, tekrarlanır
export const frameMs = (hz = 60) => 1000 / (Number.isFinite(hz) && hz > 0 ? hz : 60)
export const isBadShow = (ms, shownMs, hz = 60) => !Number.isFinite(shownMs) || Math.abs(shownMs - ms) > frameMs(hz) + 0.5

// Cevap: tr-TR küçük harf, noktalama ve baş/son boşluk atılır, Türkçe harf ve şapka eksikliği doğru sayılır, sıra serbest.
export const tokens = (text) => lowerTr(text).normalize('NFC').replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean)
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}
// → { ok, part (0–2), kind: 'ok'|'near'|'one'|'none'|'empty' }
//   near: yanlış kelimelerin her biri bir harf farkla yazılmış ("Bir harf farklı"); one: biri doğru; none: ikisi de farklı
export function checkAnswer(text, words) {
  const got = tokens(text)
  if (!got.length) return { ok: false, part: 0, kind: 'empty' }
  const left = got.map(fold)
  let part = 0
  const missed = []
  for (const w of words) {
    const k = left.indexOf(fold(w))
    if (k >= 0) { part++; left.splice(k, 1) } else missed.push(fold(w))
  }
  // VARSAYIM: ikiden çok kelime yazılırsa doğru sayılmaz (her şeyi yazıp tutturma olmasın)
  if (part === 2 && got.length === 2) return { ok: true, part: 2, kind: 'ok' }
  const near = missed.length > 0 && got.length <= 2 && missed.every((m) => left.some((t) => lev(t, m) === 1))
  return { ok: false, part: Math.min(part, 1), kind: near ? 'near' : part >= 1 ? 'one' : 'none' }
}

// "Sen" satırı: yazılan her kelime en yakın hedefle hizalanır; yalnız farklı harfler işaretlenir.
// → [[{ ch, bad }], …] (yazıldığı sırayla)
export function markTyped(text, words) {
  const targets = words.map(fold)
  return tokens(text).map((tok) => {
    const f = fold(tok)
    const t = targets.reduce((best, x) => (lev(f, x) < lev(f, best) ? x : best), targets[0] ?? '')
    const chars = [...tok]
    if (f.length === t.length) return chars.map((ch, i) => ({ ch, bad: f[i] !== t[i] }))
    // uzunluk farklı: ortak baş ve son dışındaki harfler işaretlenir
    let p = 0
    while (p < f.length && p < t.length && f[p] === t[p]) p++
    let s = 0
    while (s < f.length - p && s < t.length - p && f[f.length - 1 - s] === t[t.length - 1 - s]) s++
    return chars.map((ch, i) => ({ ch, bad: i >= p && i < f.length - s }))
  })
}

// Tur eşiği: son 10 geçerli denemenin gösterim sürelerinin ortancası (ms; ölçü budur). Eşik basamağı: aynı denemelerin
// basamak ortancası, yarımda yavaş tarafa (VARSAYIM).
export function thresholdOf(trials = []) {
  const ok = trials.filter((t) => !t.bad).slice(-10)
  if (!ok.length) return { thresholdMs: null, thresholdStep: null }
  return { thresholdMs: Math.round(median(ok.map((t) => t.ms))), thresholdStep: Math.floor(median(ok.map((t) => t.step))) }
}

// Kayıt (PLAN §4.2). typed yalnız yanlış denemede, yalnız geri bildirim için; Nef'e, sunucuya ve Gelişim'e gitmez.
// 10'dan az geçerli denemede null (yazılmaz); 10–19'da partial: true.
export function makeRecord({ trials = [], startStep = FIRST_STEP, hz = 60, seconds = 0, now = new Date() } = {}) {
  const good = trials.filter((t) => !t.bad)
  if (good.length < MIN_TRIALS) return null
  const { thresholdMs, thresholdStep } = thresholdOf(trials)
  const okMs = good.filter((t) => t.ok).map((t) => t.ms)
  const rec = {
    type: SESSION_TYPE, date: new Date(now).toISOString(), seconds: Math.round(seconds), thresholdMs, thresholdStep, startStep,
    bestOkMs: okMs.length ? Math.min(...okMs) : null, accuracy: Math.round((100 * good.filter((t) => t.ok).length) / good.length) / 100, hz,
    trials: trials.map((t) => ({
      w: [...t.w], step: t.step, ms: t.ms, shownMs: Math.round(t.shownMs * 10) / 10, ok: Boolean(t.ok), part: t.part ?? (t.ok ? 2 : 0),
      mode: t.mode === 'voice' ? 'voice' : 'key', ...(t.bad ? { bad: true } : {}), ...(!t.ok && !t.bad && t.typed ? { typed: String(t.typed).slice(0, 40) } : {}),
    })),
  }
  if (good.length < ROUND_TRIALS) rec.partial = true
  return rec
}

// Ölçü serisi (Gelişim): her kaydın tur eşiği
export const seriesOf = (sessions = []) => sessions.filter((s) => isYakala(s) && Number.isFinite(s.thresholdMs)).map((s) => ({ date: s.date, value: s.thresholdMs }))
