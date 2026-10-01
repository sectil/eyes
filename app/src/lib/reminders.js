// Hatırlatma ayarları (settings.reminders) — saf fonksiyonlar. Bildirim planı v2
// (docs/yol-haritasi/BILDIRIM_PLANI.md "Uygulama planı v2"). Her türü kişi kendisi açar; Ana sayfa kartına
// 'yes' denmeden hiçbir hatırlatma kurulmaz. Saat kuralları ayar anında denetlenir (timeError); planlayıcı
// (notifyPlan.js) saatleri kaydırmaz, pencere dışındaki saati 'window' diye atlar.
//
// settings.reminders = {
//   optIn: null | 'yes' | 'no', askedAt: null | ISO,
//   types: { mola|walk|breath|water: { on, time: 'HH:MM' }, study: { on } },   // study saati settings.reminder'da
//   thin: { [tür]: 'alt' },        // seyreltme sorusuna "Gün aşırı" dendi
//   thinAsked: { [tür]: ISO },     // seyreltme sorusu soruldu (bir kez)
// }

export const NUDGE_TYPES = ['mola', 'walk', 'breath', 'water'] // deneyde (sessiz gün) olanlar
export const TYPE_INDEX = { mola: 0, walk: 1, breath: 2, water: 3, study: 4 }
// VARSAYIM (plan §3): bildirimler 09:00–21:00 arasında; su en geç 18:00; iki türün saati arasında en az 60 dk
export const WINDOW = { from: '09:00', to: '21:00' }
export const WATER_LAST = '18:00'
export const MIN_GAP_MIN = 60
export const TYPE_LABEL = { mola: 'Mola', walk: 'Yürüyüş', breath: 'Nefes', water: 'Su', study: 'Çalışma günleri' }

// VARSAYIM (plan §2): varsayılan saatler; yalnız mola varsayılan açık
export const DEFAULT_REMINDERS = Object.freeze({
  optIn: null,
  askedAt: null,
  types: Object.freeze({
    mola: Object.freeze({ on: true, time: '12:30' }),
    walk: Object.freeze({ on: false, time: '15:00' }),
    breath: Object.freeze({ on: false, time: '16:30' }),
    water: Object.freeze({ on: false, time: '11:00' }),
    study: Object.freeze({ on: false }),
  }),
  thin: Object.freeze({}),
  thinAsked: Object.freeze({}),
})

// 'HH:MM' → gece yarısından beri dakika; geçersizse null
export function toMinutes(time) {
  const m = typeof time === 'string' ? /^(\d{2}):(\d{2})$/.exec(time) : null
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  return h < 24 && min < 60 ? h * 60 + min : null
}

const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v)
const isIso = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v))

// Kayıtlı ham değer → tam biçim; bozuk ya da eksik alan varsayılana döner (her çağrı yeni nesne)
export function normalizeReminders(raw) {
  const r = isObj(raw) ? raw : {}
  const rt = isObj(r.types) ? r.types : {}
  const types = {}
  for (const t of NUDGE_TYPES) {
    const src = isObj(rt[t]) ? rt[t] : {}
    const def = DEFAULT_REMINDERS.types[t]
    types[t] = { on: typeof src.on === 'boolean' ? src.on : def.on, time: toMinutes(src.time) != null ? src.time : def.time }
  }
  types.study = { on: typeof rt.study?.on === 'boolean' ? rt.study.on : DEFAULT_REMINDERS.types.study.on }
  const thin = {}
  const thinAsked = {}
  for (const t of NUDGE_TYPES) {
    if (isObj(r.thin) && r.thin[t] === 'alt') thin[t] = 'alt'
    if (isObj(r.thinAsked) && isIso(r.thinAsked[t])) thinAsked[t] = r.thinAsked[t]
  }
  return {
    optIn: r.optIn === 'yes' || r.optIn === 'no' ? r.optIn : null,
    askedAt: isIso(r.askedAt) ? r.askedAt : null,
    types,
    thin,
    thinAsked,
  }
}

// Saat seçici denetimi. study: settings.reminder ({ days, time }) — Çalışma günleri açıksa saati aralığa girer.
// Çalışma günleri saati kişinin eskiden seçtiği saattir (Schedule.jsx); pencere ona uygulanmaz, yalnız aralık.
export function timeError(type, time, reminders, study) {
  const windowMsg = `Saat ${WINDOW.from}–${WINDOW.to} arasında olmalı`
  const m = toMinutes(time)
  if (m == null) return windowMsg
  if (type !== 'study' && (m < toMinutes(WINDOW.from) || m > toMinutes(WINDOW.to))) return windowMsg
  if (type === 'water' && m > toMinutes(WATER_LAST)) return `Su hatırlatması en geç ${WATER_LAST}`
  const r = normalizeReminders(reminders)
  const others = NUDGE_TYPES.filter((t) => t !== type && r.types[t].on).map((t) => toMinutes(r.types[t].time))
  if (type !== 'study' && r.types.study.on && toMinutes(study?.time) != null) others.push(toMinutes(study.time))
  if (others.some((o) => Math.abs(o - m) < MIN_GAP_MIN)) return 'Başka bir hatırlatmayla arasında en az 1 saat olmalı'
  return null
}

// Açık deney türleri, sabit sırayla (Çalışma günleri hariç)
export function enabledTypes(reminders) {
  const r = normalizeReminders(reminders)
  return NUDGE_TYPES.filter((t) => r.types[t].on)
}

// Wilson 2015 notu için davranış sayısı: mola iki davranış (göz + kalkma), diğerleri bir (VARSAYIM)
export const behaviorCount = (reminders) => enabledTypes(reminders).reduce((a, t) => a + (t === 'mola' ? 2 : 1), 0)
