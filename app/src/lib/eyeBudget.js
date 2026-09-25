// Göz bütçesi ve mola kilidi (saf). Plan: docs/yol-haritasi/MOLA_KILIDI_VE_YILAN_ANIMASYONU.md §2.1.
// Kanıt: 17a raporu. "5 dk egzersiz / 2 saatte bir" PubMed'de yok; 5 dk mola ekran işinde göz
// yorgunluğunu azaltmış (Galinsky 2000, DOI 10.1080/001401300184297); telefonda oyun 30 dk'da 15 dk'ya
// göre belirgin daha yorucu (Chen 2025, DOI 10.1038/s41598-025-33670-8); oyuncular ~4 dk'da bir
// duraklıyor (Gao 2021, DOI 10.1080/08164622.2021.1878834). Zarar kanıtı yok → metinler "dinlenme",
// sağlık iddiası değil. Aşağıdaki sayılar ÜRÜN KARARI (VARSAYIM), kullanıcı onayıyla.
//
// Süreler parça (seg) olarak tutulur: { kind: 'eye' | 'test', start, end } (ms, Date.now).
//   eye  = bakışla oyunlar + göz hareketi egzersizleri → bütçe, saatlik ve günlük sınıra sayılır
//   test = görme/okuma testleri → bütçe ve saatlik sınıra sayılır, günlük sınıra sayılmaz; testler
//          ortasında kesilmez (kilit bir sonraki ekrana geçişte başlar)

export const EYE_BUDGET_KEY = 'gozolcum:eye-budget'
const MIN = 60000
export const LIMITS = {
  budgetMs: 5 * MIN, // mola öncesi göz çalışması
  budgetMotionMs: 3 * MIN, // hareket tutması öyküsü "evet" ise (Kontos 2016: OR 7,7)
  restMs: 5 * MIN,
  hourWindowMs: 60 * MIN,
  hourMs: 20 * MIN, // son 60 dk'da bu kadar → uzun mola
  hourRestMs: 15 * MIN,
  dayEyeMs: 30 * MIN, // oyun + göz hareketi egzersizi, günlük
  symptomRestMs: 15 * MIN,
  warnMs: 60 * 1000, // bitimine bu kadar kala uyarı
  graceMs: 90 * 1000, // bütçe dolunca oyun/egzersizin turu bitirmesi için süre; sonra kilit zorlanır
}
const KEEP_MS = 26 * 60 * MIN // bu kadar eski parçalar atılır (günlük hesap + tampon)
const MERGE_GAP_MS = 2000
export const REASONS = ['budget', 'hourly', 'daily', 'symptom']

export const emptyBudget = () => ({ v: 1, segs: [], rest: null, rests: [], motion: null, short: false })

const overlap = (s, from, to) => Math.max(0, Math.min(s.end, to) - Math.max(s.start, from))
const sum = (segs, from, to, kind) => segs.reduce((a, s) => a + (!kind || s.kind === kind ? overlap(s, from, to) : 0), 0)

export function startOfDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
export function nextMidnight(ts) {
  const d = new Date(ts)
  d.setHours(24, 0, 0, 0)
  return d.getTime()
}

// Süre ekle (ardışık aynı tür parçalar birleşir); eski parçaları buda
export function addTime(state, kind, start, end) {
  if (!(end > start) || (kind !== 'eye' && kind !== 'test')) return state
  const segs = state.segs.filter((s) => s.end > end - KEEP_MS)
  const last = segs.at(-1)
  if (last && last.kind === kind && start - last.end <= MERGE_GAP_MS && start >= last.start) {
    segs[segs.length - 1] = { ...last, end: Math.max(last.end, end) }
  } else segs.push({ kind, start, end })
  return { ...state, segs }
}

// Son molanın bittiği an (bütçe oradan sayılır); mola hiç yoksa 0
const lastRestEnd = (state, now) => {
  const r = state.rest
  if (r && r.until <= now) return r.until
  const done = state.rests.filter((x) => x.until <= now).at(-1)
  return done ? done.until : 0
}

// Bütçeyi yalnızca 'eye' segmentleri (oyun, göz hareketi egzersizi) tüketir. Ölçüm testleri ('test')
// bütçeye SAYILMAZ: 17a raporundaki 5 dk sınırı göz hareketi blokları içindir; bir E testi (3 göz) 3–4 dk
// sürer ve bütçeyi bitirip molaya sokuyordu (Build 20 geri bildirimi). Testler mola sırasında yine kilitli.
export function usage(state, now) {
  const since = lastRestEnd(state, now)
  return {
    sinceRest: sum(state.segs, since, now, 'eye'),
    hour: sum(state.segs, now - LIMITS.hourWindowMs, now, 'eye'), // molalar arası da birikir (son 60 dk)
    dayEye: sum(state.segs, startOfDay(now), now, 'eye'),
  }
}

// Durum: kilitli mi, ne zaman biter; kilit yoksa bütçe ne kadar, hangi kural doldu
export function check(state, now) {
  const r = state.rest
  if (r && r.until > now) return { locked: true, reason: r.reason, until: r.until, leftMs: r.until - now, due: null }
  const u = usage(state, now)
  // Kısa bütçe (3 dk): hareket tutması geçmişi YA DA profil (günde 6+ saat ekran; lib/profile.js profileSignals)
  const budgetMs = state.motion === true || state.short === true ? LIMITS.budgetMotionMs : LIMITS.budgetMs
  let due = null
  if (u.dayEye >= LIMITS.dayEyeMs) due = 'daily'
  else if (u.hour >= LIMITS.hourMs) due = 'hourly'
  else if (u.sinceRest >= budgetMs) due = 'budget'
  const leftMs = Math.max(0, budgetMs - u.sinceRest)
  return { locked: false, due, used: u.sinceRest, budgetMs, leftMs, warn: !due && leftMs <= LIMITS.warnMs, hour: u.hour, dayEye: u.dayEye }
}

export function restLengthMs(reason, now) {
  if (reason === 'daily') return nextMidnight(now) - now
  if (reason === 'hourly') return LIMITS.hourRestMs
  if (reason === 'symptom') return LIMITS.symptomRestMs
  return LIMITS.restMs
}

export function startRest(state, reason, now) {
  const rsn = REASONS.includes(reason) ? reason : 'budget'
  const until = now + restLengthMs(rsn, now)
  // Önceki (bitmiş) mola geçmişe yazılır; en fazla 200 kayıt
  const rests = [...state.rests, ...(state.rest && state.rest.until <= now ? [state.rest] : [])].slice(-200)
  return { ...state, rest: { reason: rsn, start: now, until }, rests }
}

// Bitmiş molayı geçmişe taşı (görünüm ve kayıt için)
export function settle(state, now) {
  if (state.rest && state.rest.until <= now) return { ...state, rest: null, rests: [...state.rests, state.rest].slice(-200) }
  return state
}

export const setMotion = (state, yes) => ({ ...state, motion: yes === true ? true : yes === false ? false : null })
export const setShort = (state, yes) => ({ ...state, short: yes === true })

export const REASON_TEXT = {
  budget: { title: 'Gözlerin dinleniyor', sub: '5 dakikalık göz çalışmasından sonra kısa bir mola.' },
  hourly: { title: 'Uzun mola', sub: 'Son bir saatte 20 dakika göz çalıştın. Biraz daha uzun dinlenelim.' },
  daily: { title: 'Bugünlük bu kadar', sub: 'Günlük göz oyunu ve egzersiz süresi doldu. Yarın devam.' },
  symptom: { title: 'Dinlenme zamanı', sub: 'Rahatsızlık hissettiğini söyledin. Baş dönmesi ya da ağrı sürerse bugün devam etme; geçmezse bir göz hekimine görün.' },
}

export function fmtLeft(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h} sa ${String(m).padStart(2, '0')} dk` : `${m}:${ss}`
}

// Kalıcılık (localStorage). Bozuk kayıt → boş durum.
const store = (s) => (s === undefined ? globalThis.localStorage : s)
export function loadBudget(storage) {
  try {
    const o = JSON.parse(store(storage)?.getItem(EYE_BUDGET_KEY) ?? 'null')
    if (!o || o.v !== 1 || !Array.isArray(o.segs)) return emptyBudget()
    const ok = (s) => s && (s.kind === 'eye' || s.kind === 'test') && Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start
    const rest = o.rest && REASONS.includes(o.rest.reason) && Number.isFinite(o.rest.until) && Number.isFinite(o.rest.start) ? o.rest : null
    return {
      v: 1,
      segs: o.segs.filter(ok),
      rest,
      rests: Array.isArray(o.rests) ? o.rests.filter((r) => r && REASONS.includes(r.reason) && Number.isFinite(r.until)) : [],
      motion: o.motion === true ? true : o.motion === false ? false : null,
      short: o.short === true,
    }
  } catch {
    return emptyBudget()
  }
}
export function saveBudget(state, storage) {
  try {
    store(storage)?.setItem(EYE_BUDGET_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
