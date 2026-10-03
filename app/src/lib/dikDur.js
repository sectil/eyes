// Dik Dur (plan: docs/yol-haritasi/tasarim/dik-dur/PLAN.v2.md, sahip onayı 2026-10-03; metinler metin-D1-onay.md,
// harfi harfine). Saf: adım sırası, süreler, kayıt ve bitiş satırları. Ekran screens/DikDur.jsx.
//
// Doz (PLAN §2): her tutma 10 sn (Alghadir 2021; doz başka, gözetimli bir egzersizden ödünç). Kısa tur üç hareket ×
// 3 tekrar, aralar 3 sn (VARSAYIM; gün içi mini oturum dozu denemelerde yok). Tam tur çene ve omuz hareketi 3 bölüm ×
// 10 tekrar, bölümler arası 1 dk (Alghadir 3×10×10 sn; aralar denemede 2 dk, kısa tutmak için 1 dk VARSAYIM).

// İlk açılıştaki güvenlik ekranı görüldü mü (manifest storageKeys: "Tüm verileri sil"de temizlenir)
export const SAFETY_KEY = 'eyes.dikDur.safety.v1'

export const HOLD_S = 10
export const GAP_S = 3
export const REST_S = 60

// Onaylı adlar ve yönergeler (metin-D1-onay.md §G). camera: önden kamerayla doğrulanabilir mi (PLAN §3.1).
export const MOVES = Object.freeze({
  uzat: Object.freeze({ id: 'uzat', name: 'Boyunu uzat', cue: 'Başının tepesinden bir ip seni yukarı çekiyor gibi boyunu uzat.', fix: 'Biraz daha uzat.', camera: true }),
  cene: Object.freeze({ id: 'cene', name: 'Çeneni içeri çek', cue: 'Çeneni hafifçe içeri çek, başını düz geriye kaydır; çift çene yapar gibi.', fix: 'Başını eğme, düz geriye kaydır.', camera: true }),
  omuz: Object.freeze({ id: 'omuz', name: 'Omuzlar', cue: 'Omuzlarını zorlamadan geriye ve aşağı al.', fix: null, camera: false }),
})

// kisa: her tekrar üç hareketin hepsi; tam: her bölümde önce çene 10 tekrar, sonra omuz 10 tekrar.
export const MODES = Object.freeze({
  kisa: Object.freeze({ id: 'kisa', moves: ['uzat', 'cene', 'omuz'], reps: 3, sets: 1, order: 'cycle' }),
  tam: Object.freeze({ id: 'tam', moves: ['cene', 'omuz'], reps: 10, sets: 3, order: 'block' }),
})

// Adım listesi: { kind: 'hold', move, rep, set, s } | { kind: 'gap', s } | { kind: 'rest', set, s }. rep ve set 1'den.
export function stepsOf(modeId) {
  const m = MODES[modeId]
  if (!m) return []
  const out = []
  const hold = (move, rep, set) => {
    if (out.length && out[out.length - 1].kind === 'hold') out.push({ kind: 'gap', s: GAP_S })
    out.push({ kind: 'hold', move, rep, set, s: HOLD_S })
  }
  for (let set = 1; set <= m.sets; set++) {
    if (set > 1) out.push({ kind: 'rest', set, s: REST_S })
    if (m.order === 'cycle') {
      for (let rep = 1; rep <= m.reps; rep++) for (const move of m.moves) hold(move, rep, set)
    } else {
      for (const move of m.moves) for (let rep = 1; rep <= m.reps; rep++) hold(move, rep, set)
    }
  }
  return out
}

export const totalSeconds = (modeId) => stepsOf(modeId).reduce((a, s) => a + s.s, 0)

// İlerleme satırı (metin-D1-onay.md §G): kısa "Tekrar 2 / 3"; tam "Bölüm 1 / 3 · Tekrar 4 / 10"
export function progressText(modeId, step) {
  const m = MODES[modeId]
  if (!m || !step || step.kind !== 'hold') return ''
  const rep = `Tekrar ${step.rep} / ${m.reps}`
  return m.sets > 1 ? `Bölüm ${step.set} / ${m.sets} · ${rep}` : rep
}

// Üleştirme eki: 3'er, 10'ar, 30'ar (sayının okunuşunun son ünlüsüne göre; -er/-ar, ünlüyle biten sayıda -şer/-şar)
const ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan']
function lastWord(n) {
  const k = Math.abs(Math.trunc(n))
  if (k === 0) return 'sıfır'
  if (k % 10) return ONES[k % 10]
  if (k % 100) return TENS[(k % 100) / 10]
  return k % 1000 ? 'yüz' : 'bin'
}
const lastVowel = (w) => [...w].reverse().find((c) => 'aeıioöuü'.includes(c))
export function distributive(n) {
  const w = lastWord(n)
  const back = 'aıou'.includes(lastVowel(w))
  const endsVowel = 'aeıioöuü'.includes(w[w.length - 1])
  return `${n}'${endsVowel ? 'ş' : ''}${back ? 'ar' : 'er'}`
}

// Bitiş satırı (§H): "3 hareket, 3'er tekrar · 2 dakika". Tekrar, her hareketin bu oturumdaki tutma sayısı.
export function summaryText(modeId) {
  const m = MODES[modeId]
  if (!m) return ''
  const minutes = Math.max(1, Math.round(totalSeconds(modeId) / 60))
  return `${m.moves.length} hareket, ${distributive(m.reps * m.sets)} tekrar · ${minutes} dakika`
}

// Haftalık satır (§H): "Bu hafta 6 kez dikleştin." Hafta pazartesiden (yerel saat).
export function weekStart(now = new Date()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}
export const isDikDur = (s) => s?.type === 'dik-dur'
export function weekCount(sessions, now = new Date()) {
  const from = weekStart(now).getTime()
  const to = now.getTime()
  return (Array.isArray(sessions) ? sessions : []).filter((s) => isDikDur(s) && Number.isFinite(Date.parse(s.date)) && Date.parse(s.date) >= from && Date.parse(s.date) <= to).length
}
export const weekText = (n) => `Bu hafta ${n} kez dikleştin.`

// Oturum kaydı (PLAN §6): { type, mode, reps, seconds, cameraUsed, inPose? }. reps: tamamlanan tutma sayısı.
export function makeRecord({ mode, holds, seconds, cameraUsed = false, inPose = null }) {
  const r = { type: 'dik-dur', mode, reps: holds, seconds: Math.round(seconds), cameraUsed: Boolean(cameraUsed) }
  if (Number.isFinite(inPose)) r.inPose = Math.max(0, Math.min(1, inPose))
  return r
}
