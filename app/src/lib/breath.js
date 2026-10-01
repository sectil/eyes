// Nefes pratiği motoru (saf). Kalıplar, aşama zamanlaması, kademe, kayıt, program, tercihler.
// Kanıt (docs/yol-haritasi/NEFES_FARKINDALIK.md): dakikada ~6 nefes en sağlam kalıp (Laborde 2022
// meta-analizi; Marchant 2025: 4:6 oranı kutu ve 4-7-8'den etkili). Uzun veriş: Balban 2023 (2 kısa
// alış + uzun veriş, günde 5 dk, 28 gün). Kutu: kanıt zayıf, isteğe bağlı. 4-7-8 ve hızlı soluma yok.
// İlk seanslarda 6/dk nefes darlığı hissi verebilir (You 2021) → ilk 3 seans daha hızlı kademe.
// Sağlık iddiası yok: "nefesini yavaşlatma pratiği". HRV ölçülmez, gösterilmez.
// Ekran düzeni: docs/yol-haritasi/MOLA_KILIDI_VE_YILAN_ANIMASYONU.md §6b (referans ekranlara göre).

export const SESSION_TYPE = 'breath'
export const BREATH_OPTS_KEY = 'gozolcum:breath-opts'
export const BREATH_SAFETY_KEY = 'gozolcum:breath-safety'
export const DURATIONS_SEC = [60, 180, 300]
export const RAMP_SESSIONS = 3 // ilk 3 seans: Sakin ritim 3,5 / 4,5 (~7,5/dk), sonra 4 / 6 (VARSAYIM)
export const HOLD_MAX = 7 // nefes tutma üst sınırı, sn (VARSAYIM; 4-7-8'in 7'si bile üstte)
export const PROGRAM_DAYS = 28 // Balban 2023: günde 5 dk, 28 gün
export const PROGRAM_DAY_SEC = 300
export const CALM_SCALE = [1, 2, 3, 4, 5]
export const PREP_SEC = 3 // "Hazırlan · 3, 2, 1"

// Aşama türleri, sırası ve sesli komut. in2: uzun verişteki ikinci kısa alış.
export const KIND_ORDER = ['in', 'in2', 'hold', 'out', 'hold2']
export const PHASE = {
  in: { label: 'Nefes al', say: 'Nefes al', haptic: 'tick', scale: 1 },
  in2: { label: 'İkinci alış', say: 'Biraz daha', haptic: 'tick', scale: 1.08 },
  hold: { label: 'Nefes tut', say: 'Tut', haptic: 'hit', scale: 1 },
  out: { label: 'Nefes ver', say: 'Ver', haptic: 'success', scale: 0.55 },
  hold2: { label: 'Bekle', say: 'Bekle', haptic: 'hit', scale: 0.55 },
}
// Kullanıcı ayarlı aşama sınırları (sn); 0 = aşama yok
export const LIMITS = { in: [2, 10], in2: [0, 3], hold: [0, HOLD_MAX], out: [2, 12], hold2: [0, HOLD_MAX] }
export const STEP_SEC = 0.5

// Kalıp = dört (uzun verişte beş) aşamanın süreleri; hepsi düzenlenebilir.
// level: kanıt düzeyi (Artifact "Nefona Nefes", onaylı): 'strong' tutarlı meta-analiz; 'moderate' en az bir iyi RKÇ;
// 'limited' küçük/karışık çalışmalar. rhythm: kartta kısa ritim; blurb: seçili kartın cümlesi; how: nasıl yapılır.
// sides: aşamalara sırayla burun deliği (burun değiştir; tur = sides.length / aşama sayısı kez tekrar);
// hum: verişte mırıldanma (vızıltı). Yeni kalıpların süreleri makalede açık değil → VARSAYIM, kullanıcı değiştirir.
export const LEVELS = { strong: 'Güçlü kanıt', moderate: 'Orta kanıt', limited: 'Sınırlı kanıt' }
export const PATTERNS = {
  calm: {
    id: 'calm',
    title: 'Sakin ritim',
    sub: '4 sn al · 6 sn ver · dakikada 6 nefes',
    rhythm: '4 · 6',
    level: 'strong',
    blurb: '4 saniye al, 6 saniye ver. Kanıtı en sağlam kalıp: yavaş nefes sırasında kalp ritmi değişkenliği artıyor.',
    how: ['Burnundan 4 saniye al.', '6 saniyede yavaşça ver.', 'İlk seanslar biraz daha hızlı başlar; alışınca dakikada 6 nefese iner.'],
    evidence: 'En sağlam kanıt bu kalıpta: yavaş nefes sırasında kalp ritmi değişkenliği tutarlı biçimde artıyor (Laborde 2022; Marchant 2025).',
    secs: { in: 4, in2: 0, hold: 0, out: 6, hold2: 0 },
    ramp: { in: 3.5, in2: 0, hold: 0, out: 4.5, hold2: 0 },
  },
  equal: {
    id: 'equal',
    title: 'Eşit ritim',
    sub: '5 sn al · 5 sn ver · dakikada 6 nefes',
    rhythm: '5 · 5',
    level: 'strong',
    blurb: '5 saniye al, 5 saniye ver. Dakikada 6 nefes; alış ve veriş eşit.',
    how: ['5 saniye al.', '5 saniye ver.', 'Nefes akıcı olsun, arada durma.'],
    evidence: "5:5 oranı, 4:6 kadar kalp ritmi değişkenliğini artırdı; ikisi de kutu ve 4-7-8'den önde (Marchant 2025, n=84; Laborde 2022).",
    secs: { in: 5, in2: 0, hold: 0, out: 5, hold2: 0 },
  },
  sigh: {
    id: 'sigh',
    title: 'Uzun veriş',
    sub: 'İki kısa alış (burun) · uzun veriş (ağız)',
    rhythm: '2+1 · 5',
    level: 'moderate',
    blurb: 'Burundan al, sonuna kısa bir alış daha ekle, ağızdan uzun ver.',
    how: ['Burnundan al.', 'Sonuna kısa bir alış daha ekle.', 'Ağzından uzun ve yavaş ver.'],
    evidence: 'Günde 5 dk, 28 gün: ruh halinde meditasyondan daha iyi; kaygıda fark yok (Balban 2023, n=108).',
    // VARSAYIM: Balban süre vermez ("uzun veriş"); 2 + 1 + 5 sn ≈ 7,5/dk
    secs: { in: 2, in2: 1, hold: 0, out: 5, hold2: 0 },
  },
  belly: {
    id: 'belly',
    title: 'Karın nefesi',
    sub: '5 sn al · 7 sn ver · karından',
    rhythm: '5 · 7',
    level: 'limited',
    blurb: 'Bir elin göğsünde, biri karnında: alırken karnın yükselir, göğsün sabit kalır.',
    how: ['Bir elin göğsünde, biri karnında olsun.', 'Alırken karnın yükselsin, göğsün sabit kalsın.', 'Verirken karnın yavaşça insin.'],
    evidence: '8 haftada 20 seans karın nefesi: sürekli dikkat arttı, olumsuz duygu ve kortizol azaldı (Ma 2017, n=40; küçük, tek çalışma).',
    // VARSAYIM: Ma 2017'de ortalama dakikada 4 nefes (geri bildirim cihazıyla); başlangıç için 5/dk
    secs: { in: 5, in2: 0, hold: 0, out: 7, hold2: 0 },
  },
  nose: {
    id: 'nose',
    title: 'Burun değiştir',
    sub: 'Soldan al · sağdan ver · sağdan al · soldan ver',
    rhythm: '4 · 6 ×2',
    level: 'limited',
    blurb: 'Bir burun deliğinden al, diğerinden ver; her iki nefeste taraf değişir.',
    how: ['Sağ elinin başparmağı sağ burun deliğinde, yüzük parmağı solda dursun.', 'Sağı kapat, soldan al; solu kapat, sağdan ver. Sonra sağdan al, soldan ver.', 'Ekran hangi taraftan alıp vereceğini gösterir; burnun tıkalıysa bu kalıbı atla.'],
    evidence: '15 dakikalık burun nefesinde kaygı puanı düştü, sessiz oturmada da düştü (Gandharva 2026, n=45). Sağlıklı kişilerde dönüşümlü burun nefesinde göz içi basıncı değişmedi (Kulkarni 2022, n=164).',
    // VARSAYIM: süreler; gelenekte tutma da var, burada yok (tutma isteğe bağlı)
    secs: { in: 4, in2: 0, hold: 0, out: 6, hold2: 0 },
    sides: ['L', 'R', 'R', 'L'],
  },
  hum: {
    id: 'hum',
    title: 'Vızıltı',
    sub: 'Burundan al · "mmm" diye mırıldanarak ver',
    rhythm: '4 · 7 mmm',
    level: 'limited',
    blurb: 'Burundan al, ağzın kapalı "mmm" diye mırıldanarak ver; titreşimi hisset.',
    how: ['Burnundan al.', 'Ağzın kapalı, "mmm" diye mırıldanarak ver; titreşimi hisset.', 'Sesin başkasını rahatsız etmeyeceği bir yerde yap.'],
    evidence: '5 dakikalık vızıltılı nefeste yavaş nefese göre tansiyon farkı yok (Ghati 2020, n=70, hipertansif).',
    // VARSAYIM: süreler (Ghati 2020 süre vermez)
    secs: { in: 4, in2: 0, hold: 0, out: 7, hold2: 0 },
    hum: true,
  },
  box: {
    id: 'box',
    title: 'Kutu',
    sub: 'Al · tut · ver · bekle — 4 aşama',
    rhythm: '4·4·4·4',
    level: 'limited',
    blurb: 'Al, tut, ver, bekle; hepsi aynı süre. Tutmalar isteğe bağlı.',
    how: ['Al, tut, ver, bekle; hepsi aynı süre.', 'Tutmalar zorlarsa kısalt ya da 0 yap.'],
    evidence: "Kısa vadeli, tutarsız fayda; doğrudan karşılaştırmada 6/dk'nın gerisinde (Marchant 2025; Dujawara 2026). İsteğe bağlı.",
    secs: { in: 4, in2: 0, hold: 4, out: 4, hold2: 4 },
  },
  custom: {
    id: 'custom',
    title: 'Özel',
    sub: 'Süreleri kendin kur',
    rhythm: 'kendin kur',
    level: null,
    blurb: 'Al, tut, ver, bekle sürelerini kendin kur.',
    how: ['Süreleri kendin kur; tutmalar isteğe bağlı.', 'Zorlanırsan süreyi kısalt.'],
    evidence: 'Kendi kalıbın. Tutmalar isteğe bağlı; zorlanırsan süreyi kısalt.',
    secs: { in: 4, in2: 0, hold: 0, out: 6, hold2: 0 },
  },
}
export const PATTERN_ORDER = ['calm', 'equal', 'sigh', 'belly', 'nose', 'hum', 'box', 'custom']
export const DEFAULT_PATTERN = 'calm'
// 1 dakikada sakinleş (Nefes ekranındaki kısayol): Uzun veriş, 60 sn. Riedl 2026 pilot (n=47): 1 dk kutu ya da uzun veriş
// durum kaygısını pasif kontrolden çok düşürdü. Etki iddiası yok; kısayol.
export const QUICK = { pattern: 'sigh', durationSec: 60 }

// Aşamanın ekranda ve seste adı: burun değiştirmede taraf, vızıltıda mırıldanma
const SIDE_WORD = { L: { in: 'Soldan al', out: 'Soldan ver' }, R: { in: 'Sağdan al', out: 'Sağdan ver' } }
export function phaseText(phase) {
  const base = PHASE[phase.kind]
  const side = phase.side && SIDE_WORD[phase.side]?.[phase.kind]
  if (side) return { label: side, say: side, sub: `${phase.side === 'L' ? 'Sağ' : 'Sol'} burun deliğin kapalı` }
  if (phase.hum && phase.kind === 'out') return { label: 'Mırıldanarak ver', say: 'Mmm', sub: 'Ağzın kapalı, "mmm"' }
  return { label: base.label, say: base.say, sub: null }
}

// Görsel ve ses seçenekleri (referans 1–2)
export const VISUALS = [
  { id: 'orb', title: 'Küre' },
  { id: 'ring', title: 'Halka' },
  { id: 'scene', title: 'Manzara' },
]
export const SOUNDS = [
  { id: 'bell', title: 'Zil' },
  { id: 'tick', title: 'Tık' },
  { id: 'wood', title: 'Tahta' },
  { id: 'chime', title: 'Çınlama' },
  { id: 'notify', title: 'Bildiri' },
  { id: 'none', title: 'Sessiz' },
]
export const SOUND_SLOTS = [
  { id: 'in', title: 'Nefes al' },
  { id: 'hold', title: 'Nefes tut' },
  { id: 'out', title: 'Nefes ver' },
  { id: 'hold2', title: 'Bekle' },
  { id: 'end', title: 'Bitiş' },
]
export const DEFAULT_SOUNDS = { in: 'bell', in2: 'tick', hold: 'wood', out: 'chime', hold2: 'tick', end: 'notify' }
export const DEFAULT_OPTS = Object.freeze({
  pattern: DEFAULT_PATTERN,
  edits: null, // null = kalıbın kendi süreleri (Sakin ritim'de kademe uygulanır); nesne = kullanıcı süreleri
  durationSec: 180,
  visual: 'orb',
  vibrate: true,
  sound: true,
  voice: true,
  sounds: DEFAULT_SOUNDS,
  volume: 7, // 0–10
})

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v))
export const isBreath = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.seconds)
const soundId = (v) => (SOUNDS.some((s) => s.id === v) ? v : null)

// {in, in2, hold, out, hold2} → sınırlar içinde, yarım saniye adımlı
export function normalizeSecs(secs = {}, base = PATTERNS[DEFAULT_PATTERN].secs) {
  const out = {}
  for (const k of KIND_ORDER) {
    const v = Number.isFinite(secs[k]) ? secs[k] : base[k] ?? 0
    out[k] = clamp(Math.round(v / STEP_SEC) * STEP_SEC, LIMITS[k])
  }
  return out
}

// Kalıp + düzenleme + kademe → aşama süreleri (0 sn'ler henüz atılmadı)
export function resolveSecs({ pattern = DEFAULT_PATTERN, edits = null, priorSessions = 0 } = {}) {
  const def = PATTERNS[pattern] ?? PATTERNS[DEFAULT_PATTERN]
  const ramped = Boolean(def.ramp && !edits && priorSessions < RAMP_SESSIONS)
  const base = ramped ? def.ramp : def.secs
  return { secs: normalizeSecs(edits ?? base, base), ramped, def }
}

// Seans planı: aşamalar (0 sn'ler atılmış), döngü sayısı, toplam süre
export function makePlan({ pattern = DEFAULT_PATTERN, durationSec = 180, priorSessions = 0, edits = null } = {}) {
  const { secs, ramped, def } = resolveSecs({ pattern, edits, priorSessions })
  let phases = KIND_ORDER.filter((k) => secs[k] > 0).map((k) => ({ kind: k, sec: secs[k] }))
  // Burun değiştir: tur iki nefes (sides uzunluğu kadar alış/veriş), her aşamaya taraf; tutmalar tarafsız
  if (def.sides?.length) {
    const breaths = def.sides.filter((_, i) => i % 2 === 0).length
    const one = phases
    phases = []
    let si = 0
    for (let b = 0; b < breaths; b++) {
      for (const p of one) phases.push(p.kind === 'in' || p.kind === 'out' ? { ...p, side: def.sides[si++] } : { ...p })
    }
  }
  if (def.hum) phases = phases.map((p) => (p.kind === 'out' ? { ...p, hum: true } : p))
  const cycleSec = phases.reduce((a, p) => a + p.sec, 0)
  const cycles = Math.max(1, Math.round(durationSec / cycleSec))
  const breathsPerCycle = Math.max(1, phases.filter((p) => p.kind === 'in').length)
  return {
    pattern: def.id,
    title: def.title,
    phases,
    cycleSec,
    cycles,
    totalSec: cycles * cycleSec,
    bpm: +((60 * breathsPerCycle) / cycleSec).toFixed(1),
    ramped,
  }
}

// Geçen süreye göre aşama: { done, cycle, index, phase, phaseElapsed, phaseFrac, left, step, steps }
export function phaseAt(plan, elapsedSec) {
  const total = plan.totalSec
  const steps = plan.cycles * plan.phases.length
  if (elapsedSec >= total) return { done: true, cycle: plan.cycles, index: plan.phases.length - 1, phase: plan.phases.at(-1), phaseElapsed: 0, phaseFrac: 1, left: 0, step: steps, steps }
  const t = Math.max(0, elapsedSec)
  const cycle = Math.floor(t / plan.cycleSec)
  let rem = t - cycle * plan.cycleSec
  for (let i = 0; i < plan.phases.length; i++) {
    const p = plan.phases[i]
    if (rem < p.sec) return { done: false, cycle, index: i, phase: p, phaseElapsed: rem, phaseFrac: rem / p.sec, left: total - t, step: cycle * plan.phases.length + i + 1, steps }
    rem -= p.sec
  }
  const i = plan.phases.length - 1
  return { done: false, cycle, index: i, phase: plan.phases[i], phaseElapsed: 0, phaseFrac: 1, left: total - t, step: cycle * plan.phases.length + i + 1, steps }
}

// Aşama başlangıcının seans zamanı (sn): önceki/sonraki aşama düğmeleri için
export function phaseStartSec(plan, cycle, index) {
  const before = plan.phases.slice(0, index).reduce((a, p) => a + p.sec, 0)
  return cycle * plan.cycleSec + before
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

// Tercihler
const store = (s) => s ?? globalThis.localStorage
export function normalizeOpts(o = {}) {
  const sounds = { ...DEFAULT_SOUNDS }
  for (const k of Object.keys(sounds)) if (soundId(o.sounds?.[k])) sounds[k] = o.sounds[k]
  return {
    pattern: PATTERNS[o.pattern] ? o.pattern : DEFAULT_PATTERN,
    edits: o.edits && typeof o.edits === 'object' ? normalizeSecs(o.edits, (PATTERNS[o.pattern] ?? PATTERNS[DEFAULT_PATTERN]).secs) : null,
    durationSec: DURATIONS_SEC.includes(o.durationSec) ? o.durationSec : DEFAULT_OPTS.durationSec,
    visual: VISUALS.some((v) => v.id === o.visual) ? o.visual : DEFAULT_OPTS.visual,
    vibrate: typeof o.vibrate === 'boolean' ? o.vibrate : DEFAULT_OPTS.vibrate,
    sound: typeof o.sound === 'boolean' ? o.sound : DEFAULT_OPTS.sound,
    voice: typeof o.voice === 'boolean' ? o.voice : DEFAULT_OPTS.voice,
    sounds,
    volume: Number.isInteger(o.volume) ? clamp(o.volume, [0, 10]) : DEFAULT_OPTS.volume,
  }
}
export function loadBreathOpts(storage) {
  try {
    return normalizeOpts(JSON.parse(store(storage)?.getItem(BREATH_OPTS_KEY) ?? 'null') ?? {})
  } catch {
    return normalizeOpts({})
  }
}
export function saveBreathOpts(opts, storage) {
  try {
    store(storage)?.setItem(BREATH_OPTS_KEY, JSON.stringify(normalizeOpts(opts)))
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

// Aynı bilgi, üç kalın başlıkta (ekranda okunur olsun; Artifact "Yönerge Kartları" Y8)
export const SAFETY_ROWS = [
  { icon: 'dizzy', lead: 'Başın döner ya da karıncalanırsa dur', text: 'Normal nefesine dön. Tutmalar isteğe bağlı; zorlanırsan süreyi kısalt.' },
  { icon: 'heart', lead: 'Bir sağlık durumun varsa önce sor', text: 'Gebelik, kalp ya da akciğer rahatsızlığı, glokom, nöbet ya da panik atakta nefes tutmalı kalıplardan önce hekimine danış.' },
  { icon: 'car', lead: 'Araç kullanırken, suda ya da ayaktayken yapma', text: 'Bu bir alıştırma; tıbbi bir uygulama değil.' },
]
