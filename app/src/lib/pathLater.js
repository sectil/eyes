// "Sonra yaparım" (PLAN.v3 §B.2-9, §B.5; YOL.ilerleme §7, §11): yoldaki bir durak bugün sonraya bırakıldı. Sıradaki
// durak onu atlar, yol "tamam" sayılır; öteki duraklar bitince durak yine sıradakidir ve gece yarısına kadar açılabilir.
// Bugüne ait geçici kayıttır: sessions'a girmez, Nef'e ve seriye gitmez; gün değişince geçersizdir, yarına taşınmaz.
// "Tüm verileri sil" anahtarı yoga manifestinin storageKeys listesinden temizler. Depolama yoksa hata atılmaz.
//
//   gozolcum:path-later → { day: 'YYYY-MM-DD' (yerel gün), later: ['yoga', …] }
// (c) geldiğinde aynı anahtar ve biçim progressionCtx'e taşınır (YOL.ilerleme'nin `light` alanı da aynı nesnede durur).
import { dayKey } from './calendar.js'

export const LATER_KEY = 'gozolcum:path-later'

const store = (s) => s ?? globalThis.localStorage

// Bugünün kaydı ya da null (başka günün kaydı, bozuk ya da boş depo)
export function loadLater(now = new Date(), storage) {
  try {
    const raw = JSON.parse(store(storage)?.getItem(LATER_KEY) ?? 'null')
    if (!raw || typeof raw !== 'object' || raw.day !== dayKey(now) || !Array.isArray(raw.later)) return null
    return { ...raw, later: raw.later.filter((k) => typeof k === 'string' && k) }
  } catch {
    return null
  }
}

// Durak anahtarını bugünün listesine ekler (aynı günün nesnesini korur, dünkü kaydın yerine yenisini yazar); yeni kaydı
// döndürür. Geçersiz anahtarda bir şey yazılmaz.
export function markLater(key, now = new Date(), storage) {
  const cur = loadLater(now, storage)
  if (typeof key !== 'string' || !key) return cur
  const base = cur ?? { day: dayKey(now), later: [] }
  const next = { ...base, later: base.later.includes(key) ? base.later : [...base.later, key] }
  try {
    store(storage)?.setItem(LATER_KEY, JSON.stringify(next))
  } catch {
    // depolama yok/dolu
  }
  return next
}
