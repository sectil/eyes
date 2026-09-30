// Sabah havası bildirimi, 1. katman (PLAN.v1 §2 "Sabah havası", §3.B.4, §5.5 madde 2 ve 7; DEVIR §2 "Hava").
// Saf: planı üretir, kurmaz. planAll (lib/notifyAll.js) bunu öteki kaynaklarla dizer; gece sessizliği ve 30 dk kuralı
// orada uygulanır (alarma bağlı hava ikisinden de muaf; 01.00–05.00 burada, hiçbir ayarla açılmaz).
//
//   - Kimlik 7700 (bugün), 7701 (yarın); günde tek hava bildirimi. extra { kind: 'weather', date, alarm }.
//   - AÇIK (§3.B.4 madde 4, sahip kararı bekliyor): "bildirimden önce açarsa iptal" uygulanmadı; "son açılışta kurulur"
//     kuralıyla çelişiyor (sabah 07.00 açılışı 08.00 bildirimini hep iptal ederdi). Metin gelmeden kişiye görünmez.
//   - Son açılışta o anki önbellekteki tahminle kurulur (plan her açılışta yeniden kurulur). Bildirim anında tahmin
//     18 saatten eski olacaksa kurulmaz (sky.js STALE_H); 1 saatten eskiyse metin yaşını söyler (slots.age).
//   - Saat: o gün alarm çalıyorsa (öğleden önce; VARSAYIM) alarmdan delayMin (10/20/30) sonra; alarmsız günde kişinin
//     seçtiği saat, en erken 08.00; "Alarmsız günlerde gönderme" seçiliyse alarmsız gün yok. 01.00–05.00'e düşerse yok.
//   - Metin: kod cümle yazmaz. Bildirim textKey + hücre (yağmur var/yok × sıcaklık sözcüğü) + yer tutucu değerleri
//     taşır; cümleler sahip onaylı şablonlardan gelir (composeMorning). Onaylı şablon yokken bildirimde title/body
//     olmaz ve notifyApply onu kurmaz. Yağmur varsa ilk cümle yağmurdur (şablon denetimi templateProblems).
//     Deneyde yürüyüşün sessiz günüyse yürüyüş önerisi taşıyan şablon (walk: true) seçilmez.
//   - "Yerelde yenilendi" (2. katman, AlarmKit stopIntent): Swift'in o gün yeniden yazdığı 7700 yeniden yazılmaz;
//     bildirim keepPending: true ve metinsiz çıkar, notifyApply bekleyeni yerinde tutar. Katman 2 bu turda YOK:
//     takeLocalRefresh her zaman null döner.
import { LEAD_MS } from './notifyPlan.js'
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
export const RAIN_CHANCE = 0.5 // saatlik yağmur olasılığı eşiği (SkyPlugin.swift rainChance varsayılanı)
// Sıcaklık sözcüğü bantları (günün en yükseği, °C; VARSAYIM, sahip onayına): < 10 soğuk, < 16 serin, < 22 ılık
// (adımın en yüksek olduğu ≈ 16–21 °C aralığı), < 28 sıcak, üstü çok sıcak. Sözcüğün kendisi şablonda yazar.
export const TEMP_BANDS = Object.freeze([
  ['cold', 10],
  ['cool', 16],
  ['mild', 22],
  ['warm', 28],
  ['hot', Infinity],
])
export const CELLS = Object.freeze(['rain', 'dry'].flatMap((r) => TEMP_BANDS.map(([b]) => `${r}.${b}`)))
export const TITLE_MAX = 30
export const BODY_MAX = 110
export const PLACE_TITLE_MAX = 14 // ilçe adı bundan uzunsa başlıkta yalnız sıcaklık (title.short)

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

export const bandOf = (c) => (Number.isFinite(c) ? TEMP_BANDS.find(([, lim]) => c < lim)[0] : 'mild')
export const cellOf = (rain, highC) => `${rain ? 'rain' : 'dry'}.${bandOf(highC)}`

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

// Girdiler:
//   now · morning: settings.morningWeather · alarm: loadAlarm() | null · cache: sky.js loadCache() | null
//   place: { il, ilce } | null (başlıktaki ad: ilçe, yoksa il) · log: planNotifications günlüğü (sessiz gün)
//   localRefresh: takeLocalRefresh() sonucu | null · templates: sahip onaylı şablonlar (yoksa metin bağlanmaz)
// Döner: { notifications: [{ id, at, type: 'weather', textKey, cell, walkOk, slots, extra, level, title?, body?,
//   keepPending? }], skipped: [{ date, reason: 'noAlarm'|'night'|'past'|'noData'|'stale' }] }
export function planMorningWeather({ now = new Date(), morning, alarm = null, cache = null, place = null, log = [], localRefresh = null, templates = null } = {}) {
  const cfg = normalizeMorning(morning)
  const out = { notifications: [], skipped: [] }
  if (!cfg.on) return out
  const nowMs = new Date(now).getTime()
  const today = new Date(nowMs)
  const data = cache?.data ?? null
  const cacheAt = cache ? new Date(cache.at).getTime() : NaN
  const placeName = place?.ilce || place?.il || ''

  WEATHER_IDS.forEach((id, d) => {
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d)
    const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d + 1)
    const date = dayKey(dayStart)
    const skip = (reason) => out.skipped.push({ date, reason })
    const ring = morningRing(alarm, dayStart)
    let atMs
    if (ring) atMs = ring.getTime() + cfg.delayMin * MIN
    else if (cfg.noAlarm === 'skip') return skip('noAlarm')
    else {
      const m = Math.max(toMinutes(cfg.time), toMinutes(EARLIEST_NO_ALARM))
      atMs = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate(), Math.floor(m / 60), m % 60).getTime()
    }
    const extra = { kind: 'weather', date, alarm: Boolean(ring) }
    const base = { id, type: 'weather', textKey: WEATHER_TEXT_KEY, extra, level: 'active' }
    // 2. katman o günü yeniden yazdıysa: yerinde kalır, metin yeniden yazılmaz
    if (localRefresh?.date === date) {
      const at = Number.isFinite(localRefresh.at) ? new Date(localRefresh.at) : new Date(atMs)
      out.notifications.push({ ...base, at, keepPending: true })
      return undefined
    }
    const m = minOf(atMs)
    if (m >= HARD_NIGHT_MIN[0] && m < HARD_NIGHT_MIN[1]) return skip('night')
    if (atMs <= nowMs + LEAD_MS) return skip('past')
    if (!data || !Number.isFinite(cacheAt) || !Array.isArray(data.days) || !Array.isArray(data.hours)) return skip('noData')
    const ageH = (atMs - cacheAt) / H
    if (!(ageH >= 0 && ageH <= STALE_H)) return skip('stale')
    const day = data.days.find((x) => x?.date === date)
    if (!day) return skip('noData')
    const hourRow = data.hours.find((r) => Number.isFinite(r?.at) && r.at <= atMs && atMs < r.at + H)
    const rain = rainOf(data.hours, atMs, dayEnd.getTime())
    const walkOk = !(Array.isArray(log) ? log : []).some((e) => e?.date === date && e.type === 'walk' && e.arm === 'silent')
    const fetched = new Date(cacheAt)
    const slots = {
      place: placeName,
      temp: Number.isFinite(hourRow?.tempC) ? Math.round(hourRow.tempC) : null,
      high: Number.isFinite(day.highC) ? Math.round(day.highC) : null,
      rainFrom: rain?.from ?? null,
      rainTo: rain?.to ?? null,
      age: (atMs - cacheAt) / H > AGE_NOTE_H ? { day: dayKey(fetched) === date ? 'today' : 'yesterday', at: `${pad(fetched.getHours())}.${pad(fetched.getMinutes())}` } : null,
    }
    const n = { ...base, at: new Date(atMs), cell: cellOf(Boolean(rain), day.highC), walkOk, slots }
    const text = templates ? composeMorning(n, templates) : null
    out.notifications.push(text ? { ...n, ...text } : n)
    return undefined
  })
  return out
}

// --- Şablonlar (cümleler sahip onaylı; kodda yok) ---
// Şablon: { id, cell, walk?: boolean, text }. cell: CELLS'ten biri (gövdenin cümleleri), 'title' / 'title.short'
// (başlık), 'age.today' / 'age.yesterday' (yaş öneki; {ageAt}), 'source' (son satır). Yer tutucular:
// {rainFrom:NUM|LOC|ABL|DAT} {rainTo:NUM|LOC|ABL|DAT} (NUM ekisiz: "21.00"; ek yoksa LOC) {temp} {high} {place} {age} {ageAt}. Rakamı ve eki kod yazar.
const PH_RE = /\{(rainFrom|rainTo|temp|high|place|age|ageAt)(?::(NUM|LOC|ABL|DAT))?\}/g

// Onay öncesi makine denetimi: yağmur hücresinde ilk cümle yağmurdur; kuru hücrede yağmur yer tutucusu yok;
// bilinmeyen hücre ya da yer tutucu yok. Döner: [{ id, problem }]
export function templateProblems(list) {
  const known = new Set([...CELLS, 'title', 'title.short', 'age.today', 'age.yesterday', 'source'])
  const out = []
  for (const t of Array.isArray(list) ? list : []) {
    const text = String(t?.text ?? '')
    if (!known.has(t?.cell)) out.push({ id: t?.id, problem: 'cell' })
    if (text.replace(PH_RE, '').includes('{')) out.push({ id: t?.id, problem: 'placeholder' })
    if (/[0-9]/.test(text.replace(PH_RE, ''))) out.push({ id: t?.id, problem: 'digit' })
    if (String(t?.cell).startsWith('rain.') && !text.split(/[.;]\s/)[0].includes('{rainFrom')) out.push({ id: t?.id, problem: 'rainFirst' })
    if (String(t?.cell).startsWith('dry.') && text.includes('{rain')) out.push({ id: t?.id, problem: 'dryRain' })
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

// Plandaki bildirim + onaylı şablonlar → { title, body } | null (şablon eksik, değer eksik ya da uzunluk aşımı).
// Swift (2. katman) aynı girdide aynı metni üretmelidir (JS–Swift eşlik testi o turda).
export function composeMorning(n, templates) {
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
      if (k === 'age') {
        if (!slots.age) return ''
        const t = pickFor(of(`age.${slots.age.day}`), date)
        if (!t) bad = true
        return t ? String(t.text).replace('{ageAt}', slots.age.at) : ''
      }
      if (k === 'ageAt') return slots.age?.at ?? ''
      const v = slots[k]
      if (v == null || v === '') bad = true
      return v == null ? '' : String(v)
    })
    return bad ? null : s.replace(/\s{2,}/g, ' ').trim()
  }
  const bodyT = pickFor(of(cell).filter((t) => walkOk !== false || t.walk !== true), date)
  const short = String(slots.place ?? '').length > PLACE_TITLE_MAX || !slots.place
  const titleT = pickFor(of(short ? 'title.short' : 'title'), date)
  const sourceT = pickFor(of('source'), date)
  if (!bodyT || !titleT || !sourceT) return null
  const title = fill(titleT.text)
  const main = fill(bodyT.text)
  const src = fill(sourceT.text)
  if (title == null || main == null || src == null) return null
  const body = `${main}\n${src}`
  if (title.length > TITLE_MAX || body.length > BODY_MAX) return null
  return { title, body }
}
