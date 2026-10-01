// Hatırlatma ayarları (settings.reminders) — saf fonksiyonlar. Bildirim planı v2
// (docs/yol-haritasi/BILDIRIM_PLANI.md "Uygulama planı v2"). Her türü kişi kendisi açar; Ana sayfa kartına
// 'yes' denmeden hiçbir hatırlatma kurulmaz. Kişi saati ve günleri istediği gibi seçer (D5+D6, sahip kararı
// 2026-10-01: "Kullanıcı istediği saate kurar, bunu kısıtlayamazsın"): pencere, "su en geç" ve türler arası aralık
// kuralı yok; timeError yalnız geçersiz saati yakalar. Aynı saatteki öteki bildirimler engel değil, bilgi satırıdır
// (components/remindUi.js nearTimes). Planlayıcı (notifyPlan.js) saati kaydırmaz; seçilmeyen günü 'day' diye atlar.
//
// settings.reminders = {
//   optIn: null | 'yes' | 'no', askedAt: null | ISO,
//   types: { mola|walk|breath|water: { on, time: 'HH:MM', days: [0–6] }, study: { on } },  // study saati settings.reminder'da
//   thin, thinAsked: eski "Gün aşırı" sorusunun kaydı; okunur, saklanır, hiçbir yerde kullanılmaz (D5+D6)
// }
// days: getDay() sırası, 0 = Pazar (lib/alarm.js ile aynı). VARSAYIM (D5+D6 plan madde 1): eski kayıtta gün yoksa
// (ya da bozuk/boşsa) her gün.

export const NUDGE_TYPES = ['mola', 'walk', 'breath', 'water'] // günlüğe (notifyLog) yazılan türler
export const TYPE_INDEX = { mola: 0, walk: 1, breath: 2, water: 3, study: 4 }
export const ALL_DAYS = Object.freeze([0, 1, 2, 3, 4, 5, 6])
export const TYPE_LABEL = { mola: 'Mola', walk: 'Yürüyüş', breath: 'Nefes', water: 'Su', study: 'Çalışma günleri' }
export const TIME_ERROR = 'Bir saat seç' // TASLAK (D5+D6): saat alanı boş ya da bozuk

// VARSAYIM (plan §2): varsayılan saatler; yalnız mola varsayılan açık
export const DEFAULT_REMINDERS = Object.freeze({
  optIn: null,
  askedAt: null,
  types: Object.freeze({
    mola: Object.freeze({ on: true, time: '12:30', days: ALL_DAYS }),
    walk: Object.freeze({ on: false, time: '15:00', days: ALL_DAYS }),
    breath: Object.freeze({ on: false, time: '16:30', days: ALL_DAYS }),
    water: Object.freeze({ on: false, time: '11:00', days: ALL_DAYS }),
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

// Gün listesi → sıralı, tekrarsız 0–6; geçersiz, eksik ya da boşsa her gün (yeni dizi)
export function normalizeDays(raw) {
  const d = Array.isArray(raw) ? [...new Set(raw.filter((x) => Number.isInteger(x) && x >= 0 && x <= 6))].sort((a, b) => a - b) : []
  return d.length ? d : [...ALL_DAYS]
}

// Kayıtlı ham değer → tam biçim; bozuk ya da eksik alan varsayılana döner (her çağrı yeni nesne)
export function normalizeReminders(raw) {
  const r = isObj(raw) ? raw : {}
  const rt = isObj(r.types) ? r.types : {}
  const types = {}
  for (const t of NUDGE_TYPES) {
    const src = isObj(rt[t]) ? rt[t] : {}
    const def = DEFAULT_REMINDERS.types[t]
    types[t] = { on: typeof src.on === 'boolean' ? src.on : def.on, time: toMinutes(src.time) != null ? src.time : def.time, days: normalizeDays(src.days) }
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

// Saat seçici denetimi: yalnız geçersiz saat (boş alan, bozuk biçim). Pencere, "su en geç" ve aralık kuralı yok
// (D5+D6). İmza eskisiyle uyumlu: (tür, saat, …) — tür ve sonraki argümanlar kullanılmaz.
export function timeError(_type, time) {
  return toMinutes(time) == null ? TIME_ERROR : null
}

// Açık türler, sabit sırayla (Çalışma günleri hariç)
export function enabledTypes(reminders) {
  const r = normalizeReminders(reminders)
  return NUDGE_TYPES.filter((t) => r.types[t].on)
}

// Wilson 2015 notu için davranış sayısı: mola iki davranış (göz + kalkma), diğerleri bir (VARSAYIM)
export const behaviorCount = (reminders) => enabledTypes(reminders).reduce((a, t) => a + (t === 'mola' ? 2 : 1), 0)
