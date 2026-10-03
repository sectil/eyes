// Sabah havası bildirimi, 1. katman (PLAN.v1 §2 "Sabah havası", §3.B.4, §5.5 madde 2 ve 7; DEVIR §2 "Hava").
// Saf: planı üretir, kurmaz. planAll (lib/notifyAll.js) bunu öteki kaynaklarla dizer; 30 dk kuralı orada uygulanır
// (alarma bağlı hava ondan ve gece sessizliğinden muaf; 01.00–05.00 burada, hiçbir ayarla açılmaz).
// Kurallar sahip onaylı (docs/…/bildirim-hava-yuruyus/sabah-havasi-onay.md, 2026-10-01 "uygula"; beş karar); cümleler
// v2 (D11, sabah-havasi-v2-taslak.md, sahip onayı 2026-10-03; eski cümleler "doğallıktan çok uzak"):
//
//   - Kimlik 7700 (bugün), 7701 (yarın); günde tek hava bildirimi. extra { kind: 'weather', date, alarm }.
//   - Karar 5: uygulama bildirim saatinden sonraki 2 saat içinde açılırsa (plan her açılışta yeniden kurulur) o günün
//     bildirimi iptal (skipped 'opened'). Etkisi: plan istemediği için notifyApply bekleyeni (planAll 30 dk kaydırdıysa)
//     iptal eder. Teslim edilmiş olanı karar 5'e özgü bir yol KALDIRMAZ: notifyApply'ın genel açılış temizliği
//     (grouped && tidy, yani yeni özellik açık ve kurulacak yeni kimlik var) kaldırır; o yoksa Merkez'de kalır.
//     notifyApply'da 'opened' ile 'past' aynı davranır; ayrım yalnız skipped kaydındadır.
//     Açılış bildirim saatinden önceyse bildirim kalır ("son açılışta kurulur" ile çelişmez).
//   - Son açılışta o anki önbellekteki tahminle kurulur. Bildirim anında tahmin 18 saatten eski olacaksa kurulmaz
//     (sky.js STALE_H); 1 saatten eskiyse gövde "Dün 22.40 tahminine göre" / "Sabah 05.40 tahminine göre" ile başlar
//     ve Nef notu düşer (slots.age).
//   - Saat: o gün alarm çalıyorsa (öğleden önce; VARSAYIM) alarmdan delayMin (10/20/30) sonra; alarmsız günde kişinin
//     seçtiği saat, en erken 08.00; "Alarmsız günlerde gönderme" seçiliyse alarmsız gün yok. 01.00–05.00'e düşerse yok.
//     Alarmsız gün gece sessizliğindeyse (quiet verilmişse): sessizlik 09.00'a dek biterse 15 dk adımla ilk boş
//     dilime, 09.00'dan sonra biterse (karar 4) sessizliğin bittiği dakikaya kayar (extra.shifted). 30 dk kuralı için
//     planAll ayrıca en çok 60 dk kaydırır; açılış bu son kaydırma aralığına düşerse bildirim iptal sayılır (sınır).
//   - Yağmur (karar 1): bildirim anından gün sonuna saatlik olasılık ≥ %60 → "yağmur bekleniyor" hücreleri (ilk
//     kesintisiz aralık); yoksa %30–59 → "olasılık" hücresi (chance.*; "Bugün %40 yağmur ihtimali var", v2'de
//     onaylandı; öncesinde bu günlerde bildirim gelmiyordu); < %30 kuru.
//   - Hissedilen (karar 2): bildirim saatindeki saatlik apparentC. data.now.apparentC yalnız now satırının saati
//     bildirim anını kapsıyorsa kullanılır (tahminin çekildiği saatin hissedileni başka saate yazılmaz); yoksa feel
//     null → hücre yok → skipped 'noText'. SkyPlugin.swift hourRows satırı apparentC taşır.
//     Sıcaklık bandı da aynı (yuvarlanmış) rakamdan.
//   - Başlık: "Gaziemir 17° · en çok 26°" (17: bildirim saatinin sıcaklığı); ilçe adı 12 harften uzunsa (karar 3)
//     yalnız sıcaklık. Gövdenin son satırı "Kaynak: Apple Weather"; başlık ≤ 30, gövde ≤ 110.
//   - Metin bağlanamazsa (şablon/değer eksik, uzunluk aşımı) bildirim plana girmez (skipped 'noText'). templates: null
//     yalnız sınama içindir (metinsiz ham plan).
//   - "Yerelde yenilendi" (2. katman, AlarmKit stopIntent): Swift'in o gün yeniden yazdığı 7700 yeniden yazılmaz;
//     bildirim keepPending: true ve metinsiz çıkar, notifyApply bekleyeni yerinde tutar. Katman 2 bu turda YOK:
//     takeLocalRefresh her zaman null döner.
// Sabah havası kendi payını korur (60 sn); hatırlatmaların payı 15 sn'ye indi (sahip, 2026-10-01), bu hava kuralı değişmedi
const LEAD_MS = 60000
import { toMinutes } from './reminders.js'
import { dayKey } from './habitLog.js'
import { nextRing } from './alarm.js'
import { STALE_H, clockWithSuffix } from './sky.js'

export const WEATHER_IDS = Object.freeze([7700, 7701]) // [bugün, yarın]
export const WEATHER_TEXT_KEY = 'weather.morning'
export const DELAY_CHOICES = Object.freeze([10, 20, 30])
export const DEFAULTS = Object.freeze({ on: false, delayMin: 10, time: '08:00', noAlarm: 'send' })
export const EARLIEST_NO_ALARM = '08:00' // alarmsız günde en erken
export const ALARM_BEFORE = '12:00' // VARSAYIM: alarm bu saatten önce çalıyorsa "sabah alarmı" sayılır
export const HARD_NIGHT_MIN = Object.freeze([60, 300]) // 01.00–05.00 (notifyAll HARD_NIGHT ile aynı)
export const AGE_NOTE_H = 1 // tahmin bundan eskiyse metin yaşını söyler
export const RAIN_CHANCE = 0.6 // karar 1: saatlik olasılık bundan büyük/eşitse "yağmur bekleniyor"
export const CHANCE_MIN = 0.3 // karar 1: %30–59 "olasılık" hücresi; altı kuru
export const OPEN_CANCEL_H = 2 // karar 5: bildirim saatinden sonraki bu sürede açılış o günün bildirimini iptal eder
export const QUIET_LATE = '09:00' // karar 4: sessizlik bundan sonra biterse bildirim sessizliğin bittiği dakikada
// Sıcaklık bantları (bildirim saatinin hissedileni, yuvarlanmış °C; nef-bildirim.md §3.3, onay dosyası "soğuk ≤ 11"):
// ≤ 11 soğuk, 12–17 serin, 18–24 ılık, 25–29 sıcak, ≥ 30 çok sıcak.
export const TEMP_BANDS = Object.freeze([
  ['cold', 12],
  ['cool', 18],
  ['mild', 25],
  ['warm', 30],
  ['hot', Infinity],
])
export const CELLS = Object.freeze(['rain', 'dry'].flatMap((r) => TEMP_BANDS.map(([b]) => `${r}.${b}`)))
export const CHANCE_CELLS = Object.freeze(TEMP_BANDS.map(([b]) => `chance.${b}`))
export const TITLE_MAX = 30
export const BODY_MAX = 110
export const PLACE_TITLE_MAX = 12 // karar 3: ilçe adı bundan uzunsa başlıkta yalnız sıcaklık (title.short)

// Sahip onaylı cümleler (v2: sabah-havasi-v2-taslak.md, HARFİ HARFİNE; metin kapısı 5/5). text: olgu cümlesi; note:
// Nef notu (tahmin 1 saatten eskiyse düşer). walk: true taşıyan yok (cümleler yürüyüş önerisi taşımıyor; sessiz günde de
// aynı cümle).
const RAIN_FACT = 'Bugün {rainFrom:NUM}–{rainTo:NUM} arası yağmur bekleniyor, hissedilen {feel}°.'
const CHANCE_FACT = 'Bugün %{rainChance} yağmur ihtimali var, hissedilen {feel}°.'
const dryFact = (word) => `Yağmur beklenmiyor; hava ${word}, hissedilen {feel}°.`
export const MORNING_TEMPLATES = Object.freeze([
  { id: 'MW-R1', cell: 'rain.cold', text: RAIN_FACT, note: 'Şemsiye ve mont al.' },
  { id: 'MW-R2', cell: 'rain.cool', text: RAIN_FACT, note: 'Şemsiye ve hırka al.' },
  { id: 'MW-R3', cell: 'rain.mild', text: RAIN_FACT, note: 'Şemsiyeni unutma.' },
  { id: 'MW-R4', cell: 'rain.warm', text: RAIN_FACT, note: 'Şemsiye ve su al.' },
  { id: 'MW-R5', cell: 'rain.hot', text: RAIN_FACT, note: 'Şemsiye ve su al.' },
  { id: 'MW-C1', cell: 'chance.cold', text: CHANCE_FACT, note: 'Mont ve şemsiye al.' },
  { id: 'MW-C2', cell: 'chance.cool', text: CHANCE_FACT, note: 'Hırka ve şemsiye al.' },
  { id: 'MW-C3', cell: 'chance.mild', text: CHANCE_FACT, note: 'Yanına şemsiye al.' },
  { id: 'MW-C4', cell: 'chance.warm', text: CHANCE_FACT, note: 'Su ve şemsiye al.' },
  { id: 'MW-C5', cell: 'chance.hot', text: CHANCE_FACT, note: 'Su ve şemsiye al.' },
  { id: 'MW-D1', cell: 'dry.cold', text: dryFact('soğuk'), note: 'Çıkarken sıkı giyin.' },
  { id: 'MW-D2', cell: 'dry.cool', text: dryFact('serin'), note: 'İnce bir hırka yeter.' },
  { id: 'MW-D3', cell: 'dry.mild', text: dryFact('ılık'), note: 'Dışarıda biraz vakit geçirmeye değer.' },
  { id: 'MW-D4', cell: 'dry.warm', text: dryFact('sıcak'), note: 'Suyunu yanına al.' },
  { id: 'MW-D5', cell: 'dry.hot', text: dryFact('çok sıcak'), note: 'Suyunu al, gölgede kal.' },
  { id: 'MW-T', cell: 'title', text: '{place} {temp}° · en çok {high}°' },
  { id: 'MW-TS', cell: 'title.short', text: '{temp}° · en çok {high}°' },
  { id: 'MW-AY', cell: 'age.yesterday', text: 'Dün {ageAt} tahminine göre' },
  { id: 'MW-AT', cell: 'age.today', text: 'Sabah {ageAt} tahminine göre' },
  { id: 'MW-S', cell: 'source', text: 'Kaynak: Apple Weather' },
].map((t) => Object.freeze(t)))

// 2. katman (SkyPlugin.takeLocalRefresh → { date, at }) gelene kadar kapalı: "yerelde yenilendi" hiç olmaz.
export const LOCAL_REFRESH_ENABLED = false
export async function takeLocalRefresh(plugin = null) {
  if (!LOCAL_REFRESH_ENABLED || !plugin?.takeLocalRefresh) return null
  try {
    const r = await plugin.takeLocalRefresh()
    return r && typeof r.date === 'string' ? { date: r.date, at: Number(r.at) || null } : null
  } catch {
    return null
  }
}

const MIN = 60000
const H = 3600000
const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v)
const pad = (n) => String(n).padStart(2, '0')
const minOf = (ms) => {
  const d = new Date(ms)
  return d.getHours() * 60 + d.getMinutes()
}

// settings.morningWeather → { on, delayMin, time, noAlarm }. Varsayılan kapalı; true kısa yazımdır.
export function normalizeMorning(raw) {
  if (raw === true) return { ...DEFAULTS, on: true }
  const r = isObj(raw) ? raw : {}
  return {
    on: r.on === true,
    delayMin: DELAY_CHOICES.includes(r.delayMin) ? r.delayMin : DEFAULTS.delayMin,
    time: toMinutes(r.time) != null ? r.time : DEFAULTS.time,
    noAlarm: r.noAlarm === 'skip' ? 'skip' : 'send',
  }
}
export const morningOn = (raw) => normalizeMorning(raw).on

// Bant yuvarlanmış rakamdan (gövdedeki rakamla aynı); değer yoksa 'mild' (metin zaten bağlanmaz: {feel} eksik)
export const bandOf = (c) => (Number.isFinite(c) ? TEMP_BANDS.find(([, lim]) => Math.round(c) < lim)[0] : 'mild')
// rain: true | 'rain' → yağmur; 'chance' → olasılık; başka → kuru
export const cellOf = (rain, feelC) => `${rain === true || rain === 'rain' ? 'rain' : rain === 'chance' ? 'chance' : 'dry'}.${bandOf(feelC)}`

// Saat eki tablosu (§5.5 madde 7): { "21": { LOC: "21.00'de", ABL: "21.00'den", DAT: "21.00'e" }, … }. Saatler tam
// saattir (tahmin saatlik). Bulunma eki sky.js'ten; ayrılma = bulunma + n; yönelme okunuşun son sözcüğüne göre.
const DAT_ONES = ['a', 'e', 'ye', 'e', 'e', 'e', 'ya', 'ye', 'e', 'a'] // sıfır bir iki üç dört beş altı yedi sekiz dokuz
const DAT_TENS = [null, 'a', 'ye'] // on yirmi
export function hourTable() {
  const out = {}
  for (let h = 0; h < 24; h++) {
    const loc = clockWithSuffix(new Date(2000, 0, 1, h, 0))
    const txt = `${pad(h)}.00`
    const dat = h === 0 ? 'a' : h % 10 ? DAT_ONES[h % 10] : DAT_TENS[h / 10]
    out[pad(h)] = { NUM: txt, LOC: loc, ABL: `${loc}n`, DAT: `${txt}'${dat}` }
  }
  return out
}
const HOURS = hourTable()

// O günün ilk sabah çalışı (ALARM_BEFORE'dan önce) ya da null
function morningRing(alarm, dayStart) {
  if (!alarm?.on) return null
  const ring = nextRing(alarm, new Date(dayStart.getTime() - 1))
  if (!ring || dayKey(ring) !== dayKey(dayStart)) return null
  return minOf(ring.getTime()) < toMinutes(ALARM_BEFORE) ? ring : null
}

// Bildirim anından gün sonuna ilk kesintisiz yağmur aralığı (saat satırlarından) → { from: 'HH', to: 'HH' } | null
function rainOf(hours, fromMs, dayEndMs) {
  let span = null
  for (const r of [...hours].filter((x) => Number.isFinite(x?.at)).sort((a, b) => a.at - b.at)) {
    if (r.at + H <= fromMs || r.at >= dayEndMs) continue
    if ((Number(r.precipChance) || 0) >= RAIN_CHANCE) {
      if (span) span.to = r.at + H
      else span = { from: r.at, to: r.at + H }
    } else if (span) break
  }
  if (!span) return null
  const hh = (ms) => pad(new Date(ms).getHours())
  return { from: hh(span.from), to: hh(span.to) }
}

// Bildirim anından gün sonuna en yüksek saatlik olasılık (0–1) ya da 0
function maxChance(hours, fromMs, dayEndMs) {
  let max = 0
  for (const r of hours) {
    if (!Number.isFinite(r?.at) || r.at + H <= fromMs || r.at >= dayEndMs) continue
    max = Math.max(max, Number(r.precipChance) || 0)
  }
  return max
}

// Alarmsız günün saati gece sessizliğinin sabah ucuna düşüyorsa kaydırılmış saat (ms), değilse atMs.
// quiet: notifyAll.normalizeQuiet çıktısı ({ from, to } dakika) | null. Karar 4: sessizlik QUIET_LATE'ten sonra
// biterse bitiş dakikası; öncesinde biterse 15 dk adımla ilk dilim (planAll'ın eski kaydırmasıyla aynı sonuç).
function quietShift(atMs, quiet, dayStart) {
  if (!quiet || !Number.isFinite(quiet.to)) return atMs
  const m = minOf(atMs)
  if (m >= quiet.to) return atMs
  const to = quiet.to > toMinutes(QUIET_LATE) ? quiet.to : m + Math.ceil((quiet.to - m) / 15) * 15
  return new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), Math.floor(to / 60), to % 60).getTime()
}

// Girdiler:
//   now · morning: settings.morningWeather · alarm: loadAlarm() | null · cache: sky.js loadCache() | null
//   place: { il, ilce } | null (başlıktaki ad: ilçe, yoksa il) · log: planNotifications günlüğü (sessiz gün)
//   localRefresh: takeLocalRefresh() sonucu | null · quiet: normalizeQuiet çıktısı (dakika) | null
//   templates: onaylı şablonlar (varsayılan MORNING_TEMPLATES; null → metinsiz ham plan, yalnız sınama)
// Döner: { notifications: [{ id, at, type: 'weather', textKey, cell, walkOk, slots, extra, level, title, body,
//   keepPending? }], skipped: [{ date, reason: 'noAlarm'|'night'|'past'|'opened'|'noData'|'stale'|'noText', textKey? }] }
export function planMorningWeather({ now = new Date(), morning, alarm = null, cache = null, place = null, log = [], localRefresh = null, quiet = null, templates = MORNING_TEMPLATES } = {}) {
  const cfg = normalizeMorning(morning)
  const out = { notifications: [], skipped: [] }
  if (!cfg.on) return out
  const nowMs = new Date(now).getTime()
  const today = new Date(nowMs)
  const data = cache?.data ?? null
  const cacheAt = cache ? new Date(cache.at).getTime() : NaN
  const placeName = place?.ilce || place?.il || ''
  // Karar 5: bildirim saati geçmişse açılış 2 saat içindeyse 'opened', değilse 'past'
  const gone = (ms) => (nowMs >= ms && nowMs < ms + OPEN_CANCEL_H * H ? 'opened' : 'past')

  WEATHER_IDS.forEach((id, d) => {
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d)
    const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d + 1)
    const date = dayKey(dayStart)
    const skip = (reason, more = null) => out.skipped.push({ date, reason, ...more })
    const ring = morningRing(alarm, dayStart)
    let atMs
    let shifted = false
    if (ring) atMs = ring.getTime() + cfg.delayMin * MIN
    else if (cfg.noAlarm === 'skip') return skip('noAlarm')
    else {
      const m = Math.max(toMinutes(cfg.time), toMinutes(EARLIEST_NO_ALARM))
      const at0 = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), Math.floor(m / 60), m % 60).getTime()
      atMs = quietShift(at0, quiet, dayStart)
      shifted = atMs !== at0
    }
    const extra = { kind: 'weather', date, alarm: Boolean(ring), ...(shifted ? { shifted: true } : {}) }
    const base = { id, type: 'weather', textKey: WEATHER_TEXT_KEY, extra, level: 'active' }
    // 2. katman o günü yeniden yazdıysa: yerinde kalır, metin yeniden yazılmaz (saati geçtiyse karar 5)
    if (localRefresh?.date === date) {
      const lat = Number.isFinite(localRefresh.at) ? localRefresh.at : atMs
      if (lat <= nowMs) return skip(gone(lat))
      out.notifications.push({ ...base, at: new Date(lat), keepPending: true })
      return undefined
    }
    const m = minOf(atMs)
    if (m >= HARD_NIGHT_MIN[0] && m < HARD_NIGHT_MIN[1]) return skip('night')
    if (atMs <= nowMs + LEAD_MS) return skip(atMs <= nowMs ? gone(atMs) : 'past')
    if (!data || !Number.isFinite(cacheAt) || !Array.isArray(data.days) || !Array.isArray(data.hours)) return skip('noData')
    const ageH = (atMs - cacheAt) / H
    if (!(ageH >= 0 && ageH <= STALE_H)) return skip('stale')
    const day = data.days.find((x) => x?.date === date)
    if (!day) return skip('noData')
    const hourRow = data.hours.find((r) => Number.isFinite(r?.at) && r.at <= atMs && atMs < r.at + H)
    const rain = rainOf(data.hours, atMs, dayEnd.getTime())
    const chance = rain ? null : maxChance(data.hours, atMs, dayEnd.getTime())
    const kind = rain ? 'rain' : chance >= CHANCE_MIN ? 'chance' : 'dry'
    // Karar 2: bildirim saatinin hissedileni; now.apparentC yalnız now satırının saati bildirim anını kapsıyorsa
    const nowRow = data.now
    const nowCovers = Number.isFinite(nowRow?.at) && nowRow.at <= atMs && atMs < nowRow.at + H
    const feelRaw = Number.isFinite(hourRow?.apparentC) ? hourRow.apparentC : nowCovers && Number.isFinite(nowRow.apparentC) ? nowRow.apparentC : null
    const walkOk = !(Array.isArray(log) ? log : []).some((e) => e?.date === date && e.type === 'walk' && e.arm === 'silent')
    const fetched = new Date(cacheAt)
    const slots = {
      place: placeName,
      temp: Number.isFinite(hourRow?.tempC) ? Math.round(hourRow.tempC) : null,
      high: Number.isFinite(day.highC) ? Math.round(day.highC) : null,
      feel: feelRaw == null ? null : Math.round(feelRaw),
      rainFrom: rain?.from ?? null,
      rainTo: rain?.to ?? null,
      rainChance: kind === 'chance' ? Math.round(chance * 100) : null,
      age: ageH > AGE_NOTE_H ? { day: dayKey(fetched) === date ? 'today' : 'yesterday', at: `${pad(fetched.getHours())}.${pad(fetched.getMinutes())}` } : null,
    }
    const cell = cellOf(kind, feelRaw)
    const n = { ...base, at: new Date(atMs), cell, walkOk, slots }
    if (templates === null) {
      out.notifications.push(n)
      return undefined
    }
    const text = composeMorning(n, templates)
    if (!text) return skip('noText', { textKey: WEATHER_TEXT_KEY, cell })
    out.notifications.push({ ...n, ...text })
    return undefined
  })
  return out
}

// --- Şablonlar (cümleler sahip onaylı: MORNING_TEMPLATES) ---
// Şablon: { id, cell, walk?: boolean, text, note? }. cell: CELLS / CHANCE_CELLS'ten biri (gövde: text olgu cümlesi,
// note Nef notu), 'title' / 'title.short' (başlık), 'age.today' / 'age.yesterday' (yaş öneki; {ageAt}), 'source'
// (son satır). Yer tutucular: {rainFrom:NUM|LOC|ABL|DAT} {rainTo:NUM|LOC|ABL|DAT} (NUM ekisiz: "21.00"; ek yoksa LOC)
// {temp} {high} {feel} {rainChance} {place} {ageAt}. Rakamı ve eki kod yazar.
const PH_RE = /\{(rainFrom|rainTo|temp|high|feel|rainChance|place|ageAt)(?::(NUM|LOC|ABL|DAT))?\}/g

// Onay öncesi makine denetimi: yağmur hücresinde ilk cümle yağmurdur; kuru hücrede yağmur yer tutucusu yok;
// bilinmeyen hücre ya da yer tutucu yok; elle yazılmış rakam yok. Döner: [{ id, problem }]
export function templateProblems(list) {
  const known = new Set([...CELLS, ...CHANCE_CELLS, 'title', 'title.short', 'age.today', 'age.yesterday', 'source'])
  const out = []
  for (const t of Array.isArray(list) ? list : []) {
    const text = String(t?.text ?? '')
    const all = `${text} ${t?.note ?? ''}`
    if (!known.has(t?.cell)) out.push({ id: t?.id, problem: 'cell' })
    if (all.replace(PH_RE, '').includes('{')) out.push({ id: t?.id, problem: 'placeholder' })
    if (/[0-9]/.test(all.replace(PH_RE, ''))) out.push({ id: t?.id, problem: 'digit' })
    if (String(t?.cell).startsWith('rain.') && !text.split(/[.;]\s/)[0].includes('{rainFrom')) out.push({ id: t?.id, problem: 'rainFirst' })
    if (String(t?.cell).startsWith('dry.') && all.includes('{rain')) out.push({ id: t?.id, problem: 'dryRain' })
  }
  return out
}

// Tarihe göre deterministik seçim (aynı gün aynı cümle)
function pickFor(list, date) {
  if (!list.length) return null
  let h = 0
  for (const c of String(date)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return list[h % list.length]
}

const lowerFirst = (s) => (s ? s[0].toLocaleLowerCase('tr-TR') + s.slice(1) : s)

// Plandaki bildirim + onaylı şablonlar → { title, body } | null (şablon eksik, değer eksik ya da uzunluk aşımı).
// Gövde: "<olgu> <Nef notu>\n<kaynak>"; tahmin 1 saatten eskiyse "<yaş öneki> <olgu, küçük harfle>\n<kaynak>".
// Swift (2. katman) aynı girdide aynı metni üretmelidir (JS–Swift eşlik testi o turda).
export function composeMorning(n, templates = MORNING_TEMPLATES) {
  const list = Array.isArray(templates) ? templates : []
  const { slots = {}, cell, walkOk, extra } = n ?? {}
  const date = extra?.date
  const of = (c) => list.filter((t) => t?.cell === c)
  const fill = (text) => {
    let bad = false
    const s = String(text).replace(PH_RE, (_, k, form) => {
      if (k === 'rainFrom' || k === 'rainTo') {
        const v = HOURS[slots[k]]?.[form ?? 'LOC']
        if (!v) bad = true
        return v ?? ''
      }
      if (k === 'ageAt') {
        if (!slots.age?.at) bad = true
        return slots.age?.at ?? ''
      }
      const v = slots[k]
      if (v == null || v === '') bad = true
      return v == null ? '' : String(v)
    })
    return bad ? null : s.replace(/\s{2,}/g, ' ').trim()
  }
  const bodyT = pickFor(of(cell).filter((t) => walkOk !== false || t.walk !== true), date)
  // Karar 3: ad 12 harften uzunsa (ya da yoksa) yalnız sıcaklık; VARSAYIM (kararda yok, onaya sunulmalı): tam başlık
  // yine 30'u aşarsa (12 harfli ad, iki eksi iki basamaklı derece: 31 karakter) kısa başlığa düşülür, bildirim düşmez
  const short = !slots.place || [...String(slots.place)].length > PLACE_TITLE_MAX
  const shortT = pickFor(of('title.short'), date)
  const longT = short ? null : pickFor(of('title'), date)
  const sourceT = pickFor(of('source'), date)
  const ageT = slots.age ? pickFor(of(`age.${slots.age.day}`), date) : null
  if (!bodyT || !(longT || shortT) || !sourceT || (slots.age && !ageT)) return null
  const long = longT ? fill(longT.text) : null
  const title = long != null && long.length <= TITLE_MAX ? long : shortT ? fill(shortT.text) : long
  const fact = fill(bodyT.text)
  const note = bodyT.note ? fill(bodyT.note) : ''
  const src = fill(sourceT.text)
  const pre = ageT ? fill(ageT.text) : ''
  if (title == null || fact == null || note == null || src == null || pre == null) return null
  const main = ageT ? `${pre} ${lowerFirst(fact)}` : note ? `${fact} ${note}` : fact
  const body = `${main}\n${src}`
  if (title.length > TITLE_MAX || body.length > BODY_MAX) return null
  return { title, body }
}
