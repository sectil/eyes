// "Bugünün ritmi": yoldaki nefesin kalıp üreteci (SONSUZ_YOL.PLAN.v1 §3.A.4, §3.A.5; arastirma-v1/merdiven.md §4.5,
// §4.6; sayım arastirma-v1/sayim_nefes.mjs). Saf ve belirlenimci: aynı gün, aynı geçmiş → aynı kalıp.
//
// breathOfDay(stage, { seedDay, history, safety }) → { family, inhale, hold, exhale, pause, label, … }
//   stage    lib/progression.js stageOf(ctx, 'breath'); katman stage.variant.tier ('B' | 'C' | 'D'), yoksa 'A'
//   seedDay  'YYYY-MM-DD' (ctx.progression.seedDay); seçim hash(gün + 'breath') ile
//   history  önceki günlerin kalıpları: mixHistory(sessions, now) (bugün sayılmaz; kayıtlardaki `mix` alanı)
//   safety   breathSafety(sessions, now, { seen }): { holdOk, stepDown }
//
// Çeşitlilik etkiyi artırmak için değil, ilgiyi ve sürekliliği korumak içindir: kanıt kalıplar arasında büyük fark
// göstermiyor (Birdee 2023; Marchant 2025). Bu yüzden yeni iddia yazılmaz; kanıt satırı ailenin mevcut metnidir.
//
// Güvenlik zarfı (§A.5; sınırlar VARSAYIM, dayanakları plan §3.A.5'te):
//   hızlı soluma yok · dakikada 4–7,5 nefes (B ve C katmanında 5–7,5) · veriş alıştan kısa değil ve ≤ 8 sn ·
//   alış 3–6 sn (0,5 sn adım) · tutma yalnız C ve D katmanında, alıştan sonra ≤ 2 sn (1 sn adım) · bekleme yalnız D
//   katmanında (yumuşak kutu), verişten sonra ≤ 4 sn · tutmanın ön koşulu: güvenlik kartı görülmüş ve son 7 günde
//   "Zorlandım" yok · 4-7-8 kendiliğinden hiç gelmez.
// Sıkıcılık kuralları (VARSAYIM; dayanak Eather 2023): aynı bileşim iki gün art arda gelmez (dünün kaydında kalıp yoksa,
// ilk haftanın ve Y1 öncesinin Sakin ritim 4 · 6'sı dün sayılır) · aynı aile 7 günde en çok 3 gün (plan §3.A.4; Sakin
// ritim de) · tutmalı (tutma ya da bekleme) günler art arda gelmez ve 7 günde en çok 2 · bekleme günü 7 günde en çok 1.
// Aile ile süreler uyuşur (kartta ailenin adı ve kanıt satırı durur): tutma günü yalnız Karın nefesi, Vızıltı ve Burun
// değiştir (Sakin ritmin ve Eşit ritmin kanıtı tutmasız kalıptadır); bekleme yalnız yumuşak kutuda: alış = veriş, tutma
// isteğe bağlı (lib/breath.js PATTERNS.box: "Tutmalar zorlarsa kısalt ya da 0 yap").
// Zarftaki süre bileşimi B 40, C 99, D 629'dur (combos); ailelere uyan, yani seçilebilen D 230'dur (157 beklemesiz +
// 73 yumuşak kutu; selectable).
import { PATTERNS } from './breath.js'
import { seedHash } from './progression.js'
import { dayKey } from './calendar.js'
import { runDayOf, calendarDaysBetween } from './today.js'

export const ENVELOPE = {
  inhale: [3, 6],
  exhaleMax: 8,
  step: 0.5, // alış ve veriş
  hold: [0, 2],
  pause: [0, 4],
  holdStep: 1, // tutma ve bekleme
  rate: { B: [5, 7.5], C: [5, 7.5], D: [4, 7.5] }, // nefes/dk
}
// "Bugünün ritmi" açıkken kanıt ayrıntısının altındaki sınır cümlesi (Y1 NIT #23; metin kapısı 2026-09-30: olgu denetimi
// ve iki bağımsız dil incelemesi, sahibin devrettiği onay). Kanıt ailenin temel kalıbından; günün süreleri zarftan seçilir.
export const MIX_EVIDENCE_LIMIT = 'Bulgular bu nefes türüyle yapılan çalışmalardan geliyor. Bugünkü süreler o çalışmalarda kullanılan sürelerden farklı olabilir.'
export const WEEK_RULES = { familyMax: 3, holdDaysMax: 2, pauseDaysMax: 1 } // 7 günlük pencerede (bugün dahil)

// Katmanın aileleri (kodda var olan kalıplar, lib/breath.js PATTERNS)
export const TIER_FAMILIES = {
  A: ['calm'],
  B: ['calm', 'equal', 'sigh', 'belly'],
  C: ['calm', 'equal', 'sigh', 'belly', 'hum', 'nose'],
  D: ['calm', 'equal', 'sigh', 'belly', 'hum', 'nose', 'box'],
}
// Ailenin kabul ettiği süreler (ekrandaki ad ve kanıt satırı yanlış olmasın: "Sakin ritim" ve "Eşit ritim" tutmasız,
// "Eşit ritim" alış = veriş, "Uzun veriş" veriş en az 1 sn uzun). Tutma günü yalnız karın, vızıltı ve burun
// değiştirde; bekleme yalnız yumuşak kutuda (box: alış = veriş, bekleme > 0, tutma 0–2).
export const FITS = {
  calm: (c) => c.exhale > c.inhale && c.hold === 0 && c.pause === 0,
  equal: (c) => c.exhale === c.inhale && c.hold === 0 && c.pause === 0,
  sigh: (c) => c.exhale >= c.inhale + 1 && c.hold === 0 && c.pause === 0,
  belly: (c) => c.exhale > c.inhale && c.pause === 0,
  hum: (c) => c.exhale > c.inhale && c.pause === 0,
  nose: (c) => c.exhale >= c.inhale && c.pause === 0,
  box: (c) => c.pause > 0 && c.exhale === c.inhale,
}
const DEFAULT = { family: 'calm', inhale: 4, hold: 0, exhale: 6, pause: 0 } // Sakin ritim 4 · 6

const range = (a, b, s) => {
  const out = []
  for (let x = a; x <= b + 1e-9; x += s) out.push(+x.toFixed(2))
  return out
}
export const bpmOf = (c) => +(60 / (c.inhale + c.hold + c.exhale + c.pause)).toFixed(2)
const comboKey = (c) => `${c.inhale}|${c.hold}|${c.exhale}|${c.pause}`

// Katmanın zarf içindeki süre bileşimleri (birikimli): B 40, C 99 (59'u tutmalı), D 629 (472'si beklemeli)
const cache = {}
export function combos(tier) {
  if (cache[tier]) return cache[tier]
  const rate = ENVELOPE.rate[tier]
  if (!rate) return (cache[tier] = [{ ...DEFAULT }].map(({ family, ...c }) => c))
  const holdMax = tier === 'B' ? 0 : ENVELOPE.hold[1]
  const pauseMax = tier === 'D' ? ENVELOPE.pause[1] : 0
  const out = []
  for (const inhale of range(ENVELOPE.inhale[0], ENVELOPE.inhale[1], ENVELOPE.step))
    for (const exhale of range(inhale, ENVELOPE.exhaleMax, ENVELOPE.step))
      for (const hold of range(0, holdMax, ENVELOPE.holdStep))
        for (const pause of range(0, pauseMax, ENVELOPE.holdStep)) {
          const c = { inhale, hold, exhale, pause }
          const r = 60 / (inhale + hold + exhale + pause)
          if (r >= rate[0] - 1e-9 && r <= rate[1] + 1e-9) out.push(c)
        }
  return (cache[tier] = out)
}

// Katmanda seçilebilen bileşimler: zarfın içinde ve katmanın en az bir ailesine uyan (B 40, C 99, D 230)
export function selectable(tier) {
  const fams = TIER_FAMILIES[tier] ?? []
  return combos(tier).filter((c) => fams.some((f) => FITS[f](c)))
}

// Zarfın içinde mi (testler ve dışarıdan gelen kalıp için)
export function inEnvelope(c, tier = 'D') {
  if (!c || !ENVELOPE.rate[tier]) return false
  const n = (v) => Number.isFinite(v)
  if (![c.inhale, c.hold, c.exhale, c.pause].every(n)) return false
  const r = 60 / (c.inhale + c.hold + c.exhale + c.pause)
  return (
    c.inhale >= ENVELOPE.inhale[0] && c.inhale <= ENVELOPE.inhale[1] &&
    c.exhale >= c.inhale && c.exhale <= ENVELOPE.exhaleMax &&
    c.hold >= 0 && c.hold <= (tier === 'B' ? 0 : ENVELOPE.hold[1]) &&
    c.pause >= 0 && c.pause <= (tier === 'D' ? ENVELOPE.pause[1] : 0) &&
    r >= ENVELOPE.rate[tier][0] - 1e-9 && r <= ENVELOPE.rate[tier][1] + 1e-9
  )
}

const fmt = (v) => String(v).replace('.', ',')
// Kartta ve ekranda. Sayıların yeri her ailede aynı aşamadır: al · tut · ver · bekle.
//  - bekleme yoksa üç yer ("4 · 1 · 6" = al 4, tut 1, ver 6), tutma da yoksa iki ("4 · 6"): sıfır yalnız sondan düşer
//  - bekleme varsa dört yer, sıfır tutma dahil ("4 · 0 · 4 · 2"; Kutu kartının 4·4·4·4'üyle aynı sıra)
//  - Uzun veriş "2+1 · 5" (lib/breath.js PATTERNS.sigh.rhythm)
export function mixLabel(m) {
  if (m.family === 'sigh') return `${fmt(m.inhale - 1)}+1 · ${fmt(m.exhale)}`
  const parts = m.pause > 0 ? [m.inhale, m.hold, m.exhale, m.pause] : m.hold > 0 ? [m.inhale, m.hold, m.exhale] : [m.inhale, m.exhale]
  return parts.map(fmt).join(' · ')
}

// lib/breath.js makePlan/resolveSecs düzenlemesi ({ in, in2, hold, out, hold2 }); Uzun veriş iki alışlıdır (alış − 1, 1)
export function mixEdits(m) {
  const sigh = m.family === 'sigh'
  return { in: sigh ? m.inhale - 1 : m.inhale, in2: sigh ? 1 : 0, hold: m.hold, out: m.exhale, hold2: m.pause }
}

// Kayıtlardaki `mix` alanından önceki günlerin kalıpları (bugün ve bozuk kayıt sayılmaz), en yeni en sonda
export function mixHistory(sessions = [], now = new Date()) {
  const today = dayKey(now)
  const out = []
  for (const s of sessions ?? []) {
    const m = s?.mix
    const day = runDayOf(s)
    if (!m || typeof m !== 'object' || !day || day >= today) continue
    if (![m.inhale, m.exhale].every(Number.isFinite)) continue
    out.push({ day, family: m.family ?? null, inhale: m.inhale, hold: Number(m.hold) || 0, exhale: m.exhale, pause: Number(m.pause) || 0 })
  }
  return out.sort((a, b) => a.day.localeCompare(b.day))
}

// Nefes güvenliği (§A.5): holdOk = güvenlik kartı görülmüş ve son 7 günde "Zorlandım" yok; stepDown = dün "Zorlandım"
// (bugün yoldaki süre bir basamak kısa). Kayıt alanı: strained (lib/breath.js makeRecord).
export function breathSafety(sessions = [], now = new Date(), { seen = false } = {}) {
  const today = dayKey(now)
  let recent = false
  let yesterday = false
  for (const s of sessions ?? []) {
    if (s?.type !== 'breath' || !s.strained) continue
    const day = runDayOf(s)
    if (!day) continue
    const ago = calendarDaysBetween(day, today)
    if (ago >= 0 && ago <= 7) recent = true
    if (ago === 1) yesterday = true
  }
  return { holdOk: Boolean(seen) && !recent, stepDown: yesterday }
}

// Yoldaki nefes süresi (dk): basamağın süresi; dün "Zorlandım" denmişse bir basamak kısa (en az 1). Yolda en çok 3.
export function pathBreathMinutes(stage, safety = {}) {
  const m = Number.isFinite(stage?.minutes) ? stage.minutes : 3
  return Math.max(1, Math.min(3, safety?.stepDown ? m - 1 : m))
}

const tierOf = (stage) => (['B', 'C', 'D'].includes(stage?.variant?.tier) ? stage.variant.tier : 'A')
const within = (history, today, days) => history.filter((h) => {
  const ago = calendarDaysBetween(h.day, today)
  return ago >= 1 && ago <= days
})
const holdy = (h) => h.hold > 0 || h.pause > 0

export function breathOfDay(stage, { seedDay = '', history = [], safety = {} } = {}) {
  const tier = tierOf(stage)
  const make = (family, c, extra = {}) => {
    const m = { family, inhale: c.inhale, hold: c.hold, exhale: c.exhale, pause: c.pause }
    return { ...m, label: mixLabel(m), title: PATTERNS[family]?.title ?? family, tier, bpm: bpmOf(m), key: comboKey(m), edits: mixEdits(m), ...extra }
  }
  // A katmanı (ilk hafta): Sakin ritim, kalıbın kendi süreleriyle (ilk 3 seansta kademe lib/breath.js'te)
  if (tier === 'A') return make('calm', DEFAULT, { edits: null, ramp: true })
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(seedDay)
  // Yalnız son 6 gün okunur (7 günlük pencere bugünle birlikte); uzun geçmişte de hızlı
  const [y, mo, d] = valid ? seedDay.split('-').map(Number) : [0, 0, 0]
  const lo = valid ? dayKey(new Date(y, mo - 1, d - 6, 12)) : ''
  const hist = valid ? (history ?? []).filter((h) => typeof h?.day === 'string' && h.day < seedDay && h.day >= lo) : []
  const week = valid ? within(hist, seedDay, 6) : []
  const yday = valid ? within(hist, seedDay, 1).at(-1) ?? null : null
  // Dünün kaydında kalıp yoksa (ilk haftanın A günü, Y1 öncesinin 5 dk'sı ya da nefessiz gün) dün Sakin ritim 4 · 6
  // sayılır: "Günün ritmi"nin ilk günü dünküyle aynı süreleri vermez.
  const avoid = comboKey(yday ?? DEFAULT)
  const h = (salt) => seedHash(`${seedDay}:breath:${salt}`)

  // Günün türü: düz, tutmalı ya da (D) beklemeli
  // Kurallar gün sayar: aynı gün kaydedilmiş birden çok seans tek gündür (erken bitirip yeniden kaydetmek haftayı kilitlemez)
  const daysWith = (ok) => new Set(week.filter(ok).map((x) => x.day)).size
  const holdAllowed = tier !== 'B' && safety?.holdOk === true && !(yday && holdy(yday)) && daysWith(holdy) < WEEK_RULES.holdDaysMax
  const pauseAllowed = holdAllowed && tier === 'D' && daysWith((x) => x.pause > 0) < WEEK_RULES.pauseDaysMax
  let kind = 'plain'
  if (holdAllowed && h('kind') % 3 === 0) kind = pauseAllowed && h('pause') % 2 === 0 ? 'pause' : 'hold'

  const famUsed = (f) => daysWith((x) => x.family === f)
  const pick = (pool, salt) => {
    const fams = TIER_FAMILIES[tier].filter((f) => famUsed(f) < WEEK_RULES.familyMax && pool.some(FITS[f]))
    const start = fams.length ? h(salt) % fams.length : 0
    for (let i = 0; i < fams.length; i++) {
      const f = fams[(start + i) % fams.length]
      const cand = pool.filter((c) => FITS[f](c) && comboKey(c) !== avoid)
      if (cand.length) return make(f, cand[h(`combo:${f}`) % cand.length])
    }
    return null
  }
  const plain = combos(tier).filter((c) => c.hold === 0 && c.pause === 0)
  const pool = kind === 'plain' ? plain : combos(tier).filter((c) => (kind === 'hold' ? c.hold > 0 && c.pause === 0 : c.pause > 0))
  // Günün türünde uyan aile kalmadıysa düz güne düşülür; o da olmazsa (olmaması gerekir) Sakin ritim 4 · 6 ya da 4 · 6,5
  const got = pick(pool, 'family') ?? (kind === 'plain' ? null : pick(plain, 'family'))
  if (got) return got
  return make('calm', avoid === comboKey(DEFAULT) ? { ...DEFAULT, exhale: 6.5 } : DEFAULT)
}
