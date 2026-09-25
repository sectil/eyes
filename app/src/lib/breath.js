// Nefes pratiği motoru (saf). Kalıplar, aşama zamanlaması, kademe, kayıt, program.
// Kanıt (docs/yol-haritasi/NEFES_FARKINDALIK.md): dakikada ~6 nefes en sağlam kalıp (Laborde 2022
// meta-analizi; Marchant 2025: 4:6 oranı kutu ve 4-7-8'den etkili). Uzun veriş: Balban 2023 (2 kısa
// alış + uzun veriş, günde 5 dk, 28 gün). Kutu: kanıt zayıf, isteğe bağlı. 4-7-8 ve hızlı soluma yok.
// İlk seanslarda 6/dk nefes darlığı hissi verebilir (You 2021) → ilk 3 seans daha hızlı kademe.
// Sağlık iddiası yok: "nefesini yavaşlatma pratiği". HRV ölçülmez, gösterilmez.

export const SESSION_TYPE = 'breath'
export const BREATH_OPTS_KEY = 'gozolcum:breath-opts'
export const BREATH_SAFETY_KEY = 'gozolcum:breath-safety'
export const DURATIONS_SEC = [60, 180, 300]
export const RAMP_SESSIONS = 3 // ilk 3 seans: Sakin ritim 3,5 / 4,5 (~7,5/dk), sonra 4 / 6 (VARSAYIM)
export const HOLD_MAX = 7 // nefes tutma üst sınırı, sn (VARSAYIM; 4-7-8'in 7'si bile üstte)
export const PROGRAM_DAYS = 28 // Balban 2023: günde 5 dk, 28 gün
export const PROGRAM_DAY_SEC = 300
export const CALM_SCALE = [1, 2, 3, 4, 5]

// Aşama türleri ve sesli komut. in2: uzun verişteki ikinci kısa alış.
export const PHASE = {
  in: { label: 'Nefes al', say: 'Nefes al', haptic: 'tick', scale: 1 },
  in2: { label: 'Biraz daha al', say: 'Biraz daha', haptic: 'tick', scale: 1.08 },
  hold: { label: 'Tut', say: 'Tut', haptic: 'hit', scale: 1 },
  out: { label: 'Nefes ver', say: 'Ver', haptic: 'success', scale: 0.55 },
  hold2: { label: 'Bekle', say: 'Bekle', haptic: 'hit', scale: 0.55 },
}

// Kullanıcı ayarlı aşama sınırları (sn)
export const LIMITS = { in: [2, 10], out: [2, 12], hold: [0, HOLD_MAX], hold2: [0, HOLD_MAX] }

export const PATTERNS = {
  calm: {
    id: 'calm',
    title: 'Sakin ritim',
    sub: '4 sn al · 6 sn ver · dakikada 6 nefes',
    evidence: 'En sağlam kanıt bu kalıpta: yavaş nefes sırasında kalp ritmi değişkenliği tutarlı biçimde artıyor (Laborde 2022; Marchant 2025).',
    phases: [{ kind: 'in', sec: 4 }, { kind: 'out', sec: 6 }],
    ramp: [{ kind: 'in', sec: 3.5 }, { kind: 'out', sec: 4.5 }],
    holds: false,
  },
  sigh: {
    id: 'sigh',
    title: 'Uzun veriş',
    sub: 'İki kısa alış (burun) · uzun veriş (ağız)',
    evidence: 'Günde 5 dk, 28 gün: ruh halinde meditasyondan daha iyi; kaygıda fark yok (Balban 2023, n=108).',
    // VARSAYIM: Balban süre vermez ("uzun veriş"); 2 + 1 + 5 sn ≈ 7,5/dk
    phases: [{ kind: 'in', sec: 2 }, { kind: 'in2', sec: 1 }, { kind: 'out', sec: 5 }],
    holds: false,
  },
  box: {
    id: 'box',
    title: 'Kutu',
    sub: 'Al · tut · ver · bekle — 4 aşama',
    evidence: 'Kısa vadeli, tutarsız fayda; doğrudan karşılaştırmada 6/dk\'nın gerisinde (Marchant 2025; Dujawara 2026). İsteğe bağlı.',
    phases: [{ kind: 'in', sec: 4 }, { kind: 'hold', sec: 4 }, { kind: 'out', sec: 4 }, { kind: 'hold2', sec: 4 }],
    holds: true,
    editable: true,
  },
  custom: {
    id: 'custom',
    title: 'Özel',
    sub: 'Süreleri kendin kur',
    evidence: 'Kendi kalıbın. Tutmalar isteğe bağlı; zorlanırsan süreyi kısalt.',
    phases: [{ kind: 'in', sec: 4 }, { kind: 'hold', sec: 0 }, { kind: 'out', sec: 6 }, { kind: 'hold2', sec: 0 }],
    holds: true,
    editable: true,
  },
}
export const PATTERN_ORDER = ['calm', 'sigh', 'box', 'custom']
export const DEFAULT_PATTERN = 'calm'

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v))
export const isBreath = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.seconds)

// Kullanıcı düzenlemesi: {in, hold, out, hold2} → sınırlar içinde
export function normalizePhases(kindsSec = {}, base = PATTERNS.custom.phases) {
  return base.map((p) => {
    const lim = LIMITS[p.kind] ?? [0, 12]
    const v = Number.isFinite(kindsSec[p.kind]) ? kindsSec[p.kind] : p.sec
    return { kind: p.kind, sec: clamp(Math.round(v * 2) / 2, lim) }
  })
}

// Seans planı: aşamalar (kademe uygulanmış, 0 sn'ler atılmış), döngü sayısı, toplam süre
export function makePlan({ pattern = DEFAULT_PATTERN, durationSec = 180, priorSessions = 0, edits = null } = {}) {
  const def = PATTERNS[pattern] ?? PATTERNS[DEFAULT_PATTERN]
  let phases = def.phases
  if (def.ramp && priorSessions < RAMP_SESSIONS) phases = def.ramp
  if (def.editable && edits) phases = normalizePhases(edits, def.phases)
  phases = phases.filter((p) => p.sec > 0)
  const cycleSec = phases.reduce((a, p) => a + p.sec, 0)
  const cycles = Math.max(1, Math.round(durationSec / cycleSec))
  return {
    pattern: def.id,
    title: def.title,
    phases,
    cycleSec,
    cycles,
    totalSec: cycles * cycleSec,
    bpm: +(60 / cycleSec).toFixed(1),
    ramped: Boolean(def.ramp && priorSessions < RAMP_SESSIONS),
  }
}

// Geçen süreye göre aşama: { done, cycle, index, phase, phaseElapsed, phaseFrac, left }
export function phaseAt(plan, elapsedSec) {
  const total = plan.totalSec
  if (elapsedSec >= total) return { done: true, cycle: plan.cycles, index: plan.phases.length - 1, phase: plan.phases.at(-1), phaseElapsed: 0, phaseFrac: 1, left: 0 }
  const t = Math.max(0, elapsedSec)
  const cycle = Math.floor(t / plan.cycleSec)
  let rem = t - cycle * plan.cycleSec
  for (let i = 0; i < plan.phases.length; i++) {
    const p = plan.phases[i]
    if (rem < p.sec) return { done: false, cycle, index: i, phase: p, phaseElapsed: rem, phaseFrac: rem / p.sec, left: total - t }
    rem -= p.sec
  }
  return { done: false, cycle, index: plan.phases.length - 1, phase: plan.phases.at(-1), phaseElapsed: 0, phaseFrac: 1, left: total - t }
}

export function makeRecord({ plan, seconds, calmBefore = null, calmAfter = null, strained = false, completed = true }, date = new Date()) {
  return {
    type: SESSION_TYPE,
    date: new Date(date).toISOString(),
    pattern: plan.pattern,
    phases: plan.phases,
    seconds: Math.round(seconds),
    cycles: Math.round(seconds / plan.cycleSec),
    calmBefore: CALM_SCALE.includes(calmBefore) ? calmBefore : null,
    calmAfter: CALM_SCALE.includes(calmAfter) ? calmAfter : null,
    strained: Boolean(strained),
    completed: Boolean(completed),
  }
}

// Program: son 28 günde ≥5 dk nefes yapılan gün sayısı (Balban 2023 dozu). VARSAYIM: gün eşiği 300 sn.
export function programProgress(sessions = [], now = new Date(), days = PROGRAM_DAYS) {
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(start.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)
  const perDay = new Map()
  for (const s of sessions) {
    if (!isBreath(s)) continue
    const d = new Date(s.date)
    if (d < start || d > end) continue
    const k = d.toDateString()
    perDay.set(k, (perDay.get(k) ?? 0) + s.seconds)
  }
  const done = [...perDay.values()].filter((v) => v >= PROGRAM_DAY_SEC).length
  const todaySec = perDay.get(new Date(now).toDateString()) ?? 0
  return { days: done, target: days, todaySec, todayDone: todaySec >= PROGRAM_DAY_SEC }
}

// Sakinlik değişimi: önce/sonra ortalaması (yalnızca ikisi de olan seanslar)
export function calmChange(sessions = []) {
  const pairs = sessions.filter((s) => isBreath(s) && s.calmBefore != null && s.calmAfter != null)
  if (!pairs.length) return null
  const d = pairs.reduce((a, s) => a + (s.calmAfter - s.calmBefore), 0) / pairs.length
  return { n: pairs.length, delta: +d.toFixed(1) }
}

// Tercihler: son kalıp, süre, özel süreler
const store = (s) => s ?? globalThis.localStorage
export function loadBreathOpts(storage) {
  try {
    const o = JSON.parse(store(storage)?.getItem(BREATH_OPTS_KEY) ?? 'null') ?? {}
    return {
      pattern: PATTERNS[o.pattern] ? o.pattern : DEFAULT_PATTERN,
      durationSec: DURATIONS_SEC.includes(o.durationSec) ? o.durationSec : 180,
      edits: o.edits && typeof o.edits === 'object' ? o.edits : {},
    }
  } catch {
    return { pattern: DEFAULT_PATTERN, durationSec: 180, edits: {} }
  }
}
export function saveBreathOpts(opts, storage) {
  try {
    store(storage)?.setItem(BREATH_OPTS_KEY, JSON.stringify(opts))
  } catch {
    // depolama yok
  }
}
export const safetySeen = (storage) => {
  try {
    return store(storage)?.getItem(BREATH_SAFETY_KEY) === '1'
  } catch {
    return false
  }
}
export const markSafetySeen = (storage) => {
  try {
    store(storage)?.setItem(BREATH_SAFETY_KEY, '1')
  } catch {
    // depolama yok
  }
}

export const SAFETY_TEXT =
  'Bu alıştırma tıbbi bir uygulama değildir. Baş dönmesi, karıncalanma, nefes darlığı ya da huzursuzluk hissedersen normal nefesine dön. ' +
  'Nefes tutma bölümleri isteğe bağlıdır; zorlanırsan atla veya süreyi kısalt. Gebelik, kalp veya akciğer rahatsızlığı, glokom, nöbet öyküsü, ' +
  'panik atak ya da başka bir ruhsal sağlık durumun varsa nefes tutmalı kalıplardan önce hekimine danış. Araç kullanırken, suda veya ayaktayken yapma.'
