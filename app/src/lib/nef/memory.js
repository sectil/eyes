// Nef'in tekrar etmeme hafızası (Nef PLAN §4.4; ANA_OTURUM_ISTEMI N1 madde 4). Saf kurallar + ince depolama katmanı.
//
//   gozolcum:nef-said → [{ at: ISO, date: 'YYYY-MM-DD' (yerel), type, key, id, channel: 'card'|'notify',
//                          outcome?: 'touched'|'ignored' }]  (en yeni sonda; en çok 400 satır, 180 gün)
//     type    an türü (moments.js), key olgu anahtarı, id cümle kimliği (bank), channel kanal.
//     outcome kart ya da bildirim için sonradan işlenir (markOutcome): dokunuldu / yok sayıldı.
//   Telefonda kalır. "Tüm verileri sil" siler (App.jsx resetAllData keys; modül anahtarı değil). Dışa aktarım (CSV) ona da
//   bakar (plan §4.4; lib/exportData.js csvRows said): satırda cümle kimliği ve kanal, metin değil.
//
// Kurallar (sayılar VARSAYIM, plan §4.4; ilk ay ölçülür):
//   1. Aynı cümle 21 gün içinde tekrar etmez (kanaldan bağımsız).
//   2. Aynı olgu (key) bir kez söylenir.
//   3. Aynı an türü Ana sayfada üst üste iki gün gelmez; yol ve sessiz gün hariç (CONSECUTIVE_EXEMPT).
//   4. Bilim satırı kuralı N2'de (bilgi bankasıyla birlikte); burada yok.
//   5. Üç kez üst üste yok sayılan an türü 14 gün dinlenir; dinlenme bitince sayaç sıfırdan başlar.
// Depolama enjekte edilebilir: her işlev { storage } alır (varsayılan globalThis.localStorage; erişilemezse boş).
import { dayKey } from '../calendar.js'

export const NEF_SAID_KEY = 'gozolcum:nef-said'
export const SAID_MAX = 400
export const SAID_DAYS = 180
export const SENTENCE_DAYS = 21
export const IGNORE_LIMIT = 3
export const REST_DAYS = 14
// Kural 3'ün dışında kalanlar: yol (plan "yol hariç") ve sessiz gün. VARSAYIM: sessiz gün bir "an" değil, an yokluğunun
// satırı; üst üste iki gün kuralına girse ikinci gün kart boş kalırdı. Güvenlik satırları (WHO-5, göz) zaten Nef dışında.
export const CONSECUTIVE_EXEMPT = new Set(['pathDone', 'silentDay'])
export const CHANNELS = ['card', 'notify']
export const OUTCOMES = ['touched', 'ignored']

const DAY = 86400000
const store = (s) => {
  if (s !== undefined) return s
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}
const time = (r) => Date.parse(r?.at)
const str = (v) => typeof v === 'string' && v.length > 0

// Geçerli satır ya da null
export function normalizeRow(r) {
  if (!r || typeof r !== 'object' || !Number.isFinite(time(r)) || !str(r.type) || !CHANNELS.includes(r.channel)) return null
  return {
    at: new Date(time(r)).toISOString(),
    date: str(r.date) ? r.date : dayKey(time(r)),
    type: r.type,
    key: str(r.key) ? r.key : null,
    id: str(r.id) ? r.id : null,
    channel: r.channel,
    ...(OUTCOMES.includes(r.outcome) ? { outcome: r.outcome } : {}),
  }
}

// 180 günden eski satırlar atılır, sonra en yeni 400 kalır (sıra: eskiden yeniye)
export function prune(rows, now = new Date()) {
  const cut = new Date(now).getTime() - SAID_DAYS * DAY
  return (Array.isArray(rows) ? rows : [])
    .map(normalizeRow)
    .filter((r) => r && time(r) >= cut)
    .sort((a, b) => time(a) - time(b))
    .slice(-SAID_MAX)
}

export function loadSaid({ storage, now = new Date() } = {}) {
  try {
    return prune(JSON.parse(store(storage)?.getItem(NEF_SAID_KEY) ?? '[]'), now)
  } catch {
    return []
  }
}

function save(rows, storage) {
  try {
    store(storage)?.setItem(NEF_SAID_KEY, JSON.stringify(rows))
  } catch {
    // Depolama yoksa ya da doluysa hafıza yalnız bu oturumda kalır; Nef yine çalışır (VARSAYIM: sessizce geçilir)
  }
}

// Söylenen bir cümleyi yazar. entry: { type, key, id, channel }. Döner: yeni liste
export function recordSaid(entry, { storage, now = new Date() } = {}) {
  const row = normalizeRow({ ...entry, at: new Date(now).toISOString(), date: dayKey(now) })
  const rows = loadSaid({ storage, now })
  if (!row) return rows
  const next = prune([...rows, row], now)
  save(next, storage)
  return next
}

// Kartın ya da bildirimin sonucu: { id, date?, channel? } ile eşleşen en son satıra outcome yazılır
export function markOutcome(match, outcome, { storage, now = new Date() } = {}) {
  const rows = loadSaid({ storage, now })
  if (!OUTCOMES.includes(outcome) || !match) return rows
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i]
    if (match.id != null && r.id !== match.id) continue
    if (match.date != null && r.date !== match.date) continue
    if (match.channel != null && r.channel !== match.channel) continue
    if (match.type != null && r.type !== match.type) continue
    rows[i] = { ...r, outcome }
    save(rows, storage)
    break
  }
  return rows
}

// ---------- Kurallar (saf; rows = loadSaid çıktısı) ----------

// Kural 1: cümle son 21 günde söylenmedi mi
export function sentenceFree(rows, id, now = new Date()) {
  const cut = new Date(now).getTime() - SENTENCE_DAYS * DAY
  return !rows.some((r) => r.id === id && time(r) > cut)
}

// Kural 2: olgu hiç söylenmedi mi
export const factFree = (rows, key) => !key || !rows.some((r) => r.key === key)

// Kural 3: an türü dün Ana sayfada (kart) geldiyse bugün gelmez
export function typeFreeHome(rows, type, now = new Date()) {
  if (CONSECUTIVE_EXEMPT.has(type)) return true
  const d = new Date(now)
  const yesterday = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 12))
  return !rows.some((r) => r.channel === 'card' && r.type === type && r.date === yesterday)
}

// Kural 5: dinlenmenin bittiği an (ms) ya da null. Üst üste IGNORE_LIMIT yok sayma → son yok saymadan 14 gün;
// dokunulan satır sayacı sıfırlar; dinlenme içinde gelen satırlar sayılmaz.
export function restUntil(rows, type) {
  let streak = 0
  let until = null
  for (const r of rows) {
    if (r.type !== type || !r.outcome) continue
    if (until != null && time(r) < until) continue
    if (r.outcome === 'touched') {
      streak = 0
      continue
    }
    streak++
    if (streak >= IGNORE_LIMIT) {
      until = time(r) + REST_DAYS * DAY
      streak = 0
    }
  }
  return until
}
export function typeResting(rows, type, now = new Date()) {
  const u = restUntil(rows, type)
  return u != null && new Date(now).getTime() < u
}

// Nef'in kendi bildirimleri: bugün ve son 7 gün (bugün dahil). VARSAYIM: "haftada 4" kayan 7 gün; takvim haftası
// olsaydı Pazar–Pazartesi arka arkaya 8 bildirim mümkün olurdu.
export function notifyCounts(rows, now = new Date()) {
  const today = dayKey(now)
  const d = new Date(now)
  const weekStart = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6, 12))
  const own = rows.filter((r) => r.channel === 'notify')
  return { day: own.filter((r) => r.date === today).length, week: own.filter((r) => r.date >= weekStart && r.date <= today).length }
}

// Bir an türü son `days` gün içinde (bugünden önce) herhangi bir kanalda söylendi mi (F1.D "tekrar" için)
export function saidWithin(rows, type, days, now = new Date()) {
  const today = dayKey(now)
  const d = new Date(now)
  const from = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - days, 12))
  return rows.some((r) => r.type === type && r.date >= from && r.date < today)
}

// Bir cümlenin en son söylendiği an (ms) ya da null (seçicide eskisi öne alınır)
export function lastSaidAt(rows, id) {
  let t = null
  for (const r of rows) if (r.id === id) t = Math.max(t ?? -Infinity, time(r))
  return t
}
