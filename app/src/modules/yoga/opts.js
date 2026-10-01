// Yoga tercihleri (localStorage `gozolcum:yoga-opts`; modul.md §6.2). "Tüm verileri sil" manifestin storageKeys'iyle
// temizler. İlk ders olup olmadığı burada tutulmaz, kayıtlardan anlaşılır (sessions.some(isYoga)).
import { MUSIC_TAIL, MUSIC_TAIL_DEFAULT } from '../../lib/yogaLessons.js'

export const YOGA_OPTS_KEY = 'gozolcum:yoga-opts'

const store = (s) => s ?? globalThis.localStorage
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

export function normalizeYogaOpts(raw = {}) {
  const o = isObj(raw) ? raw : {}
  const minutesByLesson = {}
  if (isObj(o.minutesByLesson)) {
    for (const [k, v] of Object.entries(o.minutesByLesson)) if (Number.isFinite(v) && v > 0) minutesByLesson[k] = v
  }
  return {
    minutesByLesson, // son seçilen süre (ders başına)
    musicTail: MUSIC_TAIL.includes(o.musicTail) ? o.musicTail : MUSIC_TAIL_DEFAULT, // uyku dersi: ders bitince müzik (dk)
    captions: o.captions === true, // altyazı (varsayılan kapalı)
    safetySeen: o.safetySeen === true, // güvenlik kartı bir kez
    // ses denetimi: 'yes' | 'no' | 'skip' | 'nofile' (dosya yokken atlandı: dosya gelince yeniden sorulur)
    soundCheck: ['yes', 'no', 'skip', 'nofile'].includes(o.soundCheck) ? o.soundCheck : null,
    morningSkipped: Array.isArray(o.morningSkipped) ? o.morningSkipped.filter((x) => typeof x === 'string') : [], // sabah sorusu (§9)
  }
}

export function loadYogaOpts(storage) {
  try {
    return normalizeYogaOpts(JSON.parse(store(storage)?.getItem(YOGA_OPTS_KEY) ?? 'null') ?? {})
  } catch {
    return normalizeYogaOpts()
  }
}

// Başka bir yerin yazdığı alanları (ör. sabah sorusunun morningSkipped'i) ezmemek için diskteki son hâlin üstüne yazar.
export function saveYogaOpts(patch, storage) {
  const next = normalizeYogaOpts({ ...loadYogaOpts(storage), ...patch })
  try {
    store(storage)?.setItem(YOGA_OPTS_KEY, JSON.stringify(next))
  } catch {
    // depolama yoksa tercih bu oturumla sınırlı kalır
  }
  return next
}
