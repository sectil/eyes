// Dalga: birkaç dakikalık ses (Sakin / Güç / Motivasyon). Saf mantık; ses motoru lib/dalgaAudio.js, beste lib/dalgaMusic.js.
// Tasarım: Artifact "Dalga" (onaylı). Kanıt ve sınırlar FACTS'te (hepsi PubMed özetinden). Sağlık iddiası yok.
// Kişisel deney: Sakin + kulaklık + deney açıkken binaural katman oturumların yarısında gizlice kapalı; ikili
// bloklarda biri açık biri kapalı (sıra rastgele), 6 oturumda iki grubun önce→sonra farkı gösterilir.

export const SESSION_TYPE = 'dalga'
export const isDalga = (s) => s?.type === SESSION_TYPE && typeof s.mode === 'string'
export const DALGA_OPTS_KEY = 'gozolcum:dalga-opts'
export const DURATIONS = [3, 5, 10] // dakika
export const EXP_N = 6
export const RATE_MAX = 10

export const MODE_ORDER = ['sakin', 'guc', 'motive']
export const MODES = {
  sakin: {
    name: 'Sakin', sub: 'Yavaş piyano, sessiz anlar. Kulaklıkla binaural katman.',
    c1: '#19C2D1', c2: '#3E7BFA', bg: ['#0A2A36', '#050A12'],
    ask: 'ne kadar sakinsin?', lo: 'gergin', hi: 'çok sakin', word: 'sakinlik',
    hints: ['Gözlerini kapatabilirsin.', 'Omuzlarını bırak.', 'Sessiz anlar da müziğin parçası.'],
  },
  guc: {
    name: 'Güç', sub: 'Önce kendi değerin, sonra yükselen akorlar.',
    c1: '#FFB13B', c2: '#C08BFF', bg: ['#2E1B08', '#0B0710'],
    ask: 'kendine ne kadar güveniyorsun?', lo: 'hiç', hi: 'tamamen', word: 'kendine güven',
    hints: ['Cümleni içinden bir kez söyle.', 'Dik otur, nefesini yavaşlat.', 'Bu senin değerin.'],
  },
  motive: {
    name: 'Motivasyon', sub: 'Hızlı tempo, ritmik gitar. Hareketle iyi gider.',
    c1: '#FF7A59', c2: '#FFD166', bg: ['#34140C', '#0C0706'],
    ask: 'enerjin ne durumda?', lo: 'bitik', hi: 'dolu', word: 'enerji',
    hints: ['Kalk, ritimle birkaç adım at.', 'Omuzlarını ritimle çevir.', 'Tempoyu ayaklarınla tut.'],
  },
}
// Öz-onaylama: önemli bir değeri seçip nedenini yazmak (Zhang 2025). Cümle kaydedilmez; yalnız değer.
export const VALUES = ['Aile', 'Dostluk', 'Dürüstlük', 'Merak', 'Sağlık', 'Emek', 'Yaratıcılık', 'Özgürlük', 'Adalet']
export const WHY_MIN = 3

// ---- Tercihler (mod, süre, kulaklık, deney) ----
const store = (s) => s ?? globalThis.localStorage
export function normalizeOpts(o = {}) {
  return {
    mode: MODE_ORDER.includes(o.mode) ? o.mode : 'sakin',
    minutes: DURATIONS.includes(o.minutes) ? o.minutes : 5,
    headphones: o.headphones !== false,
    experiment: o.experiment !== false,
  }
}
export function loadDalgaOpts(storage) {
  try {
    return normalizeOpts(JSON.parse(store(storage)?.getItem(DALGA_OPTS_KEY) ?? 'null') ?? {})
  } catch {
    return normalizeOpts()
  }
}
export function saveDalgaOpts(opts, storage) {
  try {
    store(storage)?.setItem(DALGA_OPTS_KEY, JSON.stringify(normalizeOpts(opts)))
  } catch {
    // depolama yoksa tercih bu oturumla sınırlı kalır
  }
}

// ---- Binaural katman ve deney ----
const expRecords = (sessions = []) => sessions.filter((s) => isDalga(s) && s.exp === true && typeof s.binaural === 'boolean')
// used: katman bu oturumda söz konusu mu (Sakin + kulaklık); exp: deney oturumu mu; on: katman çalıyor mu
export function binauralPlan({ mode, headphones, experiment }, sessions = [], r = Math.random) {
  const used = mode === 'sakin' && Boolean(headphones)
  if (!used) return { used: false, exp: false, on: false }
  if (!experiment) return { used: true, exp: false, on: true }
  const past = expRecords(sessions)
  // İkili blok: çift sıradaki oturum rastgele; tek sıradaki, bloğun ilkinin tersi (6 oturumda 3 açık, 3 kapalı)
  const on = past.length % 2 === 0 ? r() < 0.5 : !past.at(-1).binaural
  return { used: true, exp: true, on }
}
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
export function experimentOf(sessions = []) {
  const xs = expRecords(sessions).filter((s) => Number.isFinite(s.delta))
  const on = xs.filter((s) => s.binaural).map((s) => s.delta)
  const off = xs.filter((s) => !s.binaural).map((s) => s.delta)
  const ready = xs.length >= EXP_N && on.length > 0 && off.length > 0
  return { n: xs.length, ready, on: { n: on.length, mean: mean(on) }, off: { n: off.length, mean: mean(off) }, diff: ready ? mean(on) - mean(off) : null }
}
const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`
// Deney sonucu cümlesi (yalnız hazırsa). 1 puandan küçük fark "küçük" sayılır (VARSAYIM).
export function experimentText(e) {
  if (!e?.ready) return null
  const pair = `katman açık ${signed(e.on.mean)}, kapalı ${signed(e.off.mean)}`
  const tail = `${e.n} oturum az; deney sürdükçe netleşir.`
  if (Math.abs(e.diff) < 1) return `Fark küçük (${pair}). Sakinleşmenin çoğu müzikten ve sessiz aralardan geliyor gibi. ${tail}`
  if (e.diff > 0) return `Katman açıkken daha çok sakinleştin (${pair}). ${tail}`
  return `Katman kapalıyken daha çok sakinleştin (${pair}). ${tail}`
}

// ---- Kayıt ----
export function makeRecord({ mode, minutes, before, after, value = null, plan, seconds }, date = new Date()) {
  const rec = {
    type: SESSION_TYPE,
    date: new Date(date).toISOString(),
    mode,
    minutes,
    before,
    after,
    delta: Number.isFinite(before) && Number.isFinite(after) ? after - before : null,
    seconds: Math.round(seconds ?? 0),
  }
  if (mode === 'guc' && value) rec.value = value
  if (plan?.used) {
    rec.binaural = Boolean(plan.on)
    rec.exp = Boolean(plan.exp)
  }
  return rec
}

// ---- Bilim kartları ("Doğru mu, efsane mi?"): hepsi PubMed özetinden doğrulandı ----
// answer: 'fact' | 'none' (kanıt yok) | 'mixed' (belirsiz). modes: kartın çıktığı modlar.
export const FACTS = [
  { id: 'silence', modes: ['sakin'], claim: 'Müziğin arasındaki sessizlik, müzikten daha çok rahatlatabilir.', answer: 'fact', body: 'Sessiz arada nabız, tansiyon ve solunum başlangıç düzeyinin bile altına indi. 24 kişilik küçük bir çalışma. Sakin moddaki sessiz ölçüler bu yüzden var.', ref: 'Bernardi ve ark. 2005 · Heart', doi: '10.1136/hrt.2005.064600' },
  { id: 'binaural', modes: ['sakin'], claim: 'Kulaklıkla binaural ritim kaygıyı azaltabilir.', answer: 'fact', body: 'Ameliyat öncesi 14 çalışmada kaygı, sessiz kulaklığa göre azaldı. Ama çalışmalar arasındaki fark çok büyük; sonuç kesin değil.', ref: 'Xiong ve ark. 2025 · Complement Ther Med', doi: '10.1016/j.ctim.2025.103299' },
  { id: 'entrain', modes: ['sakin'], claim: 'Binaural ritim beyin dalgalarını o frekansa ayarlar.', answer: 'mixed', body: 'EEG ile bakan 14 çalışmanın 5’i bunu destekledi, 8’i çelişti. Etki görülse bile nasıl olduğu belli değil.', ref: 'Ingendoh ve ark. 2023 · PLoS One', doi: '10.1371/journal.pone.0286023' },
  { id: 'affirm', modes: ['guc'], claim: 'Kendi değerini hatırlamak kendine bakışını iyileştirir.', answer: 'fact', body: '67 makalelik meta-analizde öz-onaylama kendilik algısını küçük ama anlamlı biçimde artırdı; etki sonra da sürdü.', ref: 'Zhang ve ark. 2025 · Am Psychol', doi: '10.1037/amp0001591' },
  { id: '528', modes: ['sakin', 'guc'], claim: '528 Hz "şifa frekansı"dır.', answer: 'none', body: 'Tek randomize çalışmada tükürükteki bazı belirteçler değişti, ama dikkat testinde fark çıkmadı. "Şifa" iddiasını gösteren bir çalışma bulamadık.', ref: 'Bozok ve ark. 2026 · Brain Behav', doi: '10.1002/brb3.71452' },
  { id: 'tempo', modes: ['motive'], claim: 'Hareket ederken hızlı müzik daha çok yardım eder.', answer: 'fact', body: '139 çalışmada müzik ruh halini ve performansı iyileştirdi, yorgunluk hissini azalttı. Performansa hızlı tempo daha çok yardım etti.', ref: 'Terry ve ark. 2020 · Psychol Bull', doi: '10.1037/bul0000216' },
  { id: 'music', modes: ['sakin', 'guc', 'motive'], claim: 'Müzik dinlemek stresi azaltır.', answer: 'fact', body: '104 randomize çalışmanın meta-analizinde müzik hem nabız ve tansiyon gibi bedensel ölçüleri hem de hissedilen stresi azalttı.', ref: 'de Witte ve ark. 2019 · Health Psychol Rev', doi: '10.1080/17437199.2019.1627897' },
  { id: 'flicker', modes: [], claim: 'Yanıp sönen ışık nöbet tetikleyebilir.', answer: 'fact', body: 'Işığa duyarlı kişilerde 1–65 Hz yanıp sönme nöbet tetikleyebilir; en riskli aralık 15–25 Hz. Dalga bu yüzden hiç yanıp sönmez.', ref: 'Fisher ve ark. 2005 · Epilepsia', doi: '10.1111/j.1528-1167.2005.31405.x' },
]
export const ANSWER_TEXT = { fact: 'Doğru', none: 'Kanıt yok', mixed: 'Belirsiz' }
// Sıradaki kart: bu moddaki tur sayısına göre sırayla (moda özel kartlar önce)
export function factFor(sessions = [], mode = 'sakin') {
  const pool = FACTS.filter((f) => f.modes.includes(mode))
  return pool[sessions.filter((s) => isDalga(s) && s.mode === mode).length % pool.length]
}
