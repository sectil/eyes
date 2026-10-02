// Günün ilk açılışı (SONSUZ_YOL.PLAN.v1 §3.F.3): tek anahtar `gozolcum:day-open` → { day, firstAt, firstTapAt, lead, prev }.
//   day        'YYYY-MM-DD' (yerel)
//   firstAt    günün ilk açılışı (ms)
//   firstTapAt günün ilk dokunuşu (ms; Ana sayfadan bir şey açıldı) ya da null
//   lead       bugün yazılan cümlenin önceliği (components/home/dayLead.js) ya da null
//   prev       dün yazılan önceliğin kopyası ("aynı öncelik iki gün üst üste gelmez"; gün içinde değişmesin)
// Kayıt `sessions`'a girmez; seriye, hedefe ve Nef'e sayılmaz. Kişisel veri taşımaz (gün, saat ve öncelik numarası;
// cümlenin kendisi yazılmaz). Depolama yoksa (gizli pencere) her açılış ilk açılış sayılır; cümle yine kayıtlardan
// düşer (bugün bir durak yapıldıysa). Hata atmaz.
import { dayKey } from '../../lib/calendar.js'

export const DAY_OPEN_KEY = 'gozolcum:day-open'
export const LEAD_MS = 60 * 60000 // cümle ilk dokunuşa kadar ya da en çok 1 saat (§3.F.3)

const store = () => {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readDayOpen() {
  try {
    const v = JSON.parse(store()?.getItem(DAY_OPEN_KEY) ?? 'null')
    return v && typeof v === 'object' && typeof v.day === 'string' ? v : null
  } catch {
    return null
  }
}

export function saveDayOpen(rec) {
  try {
    store()?.setItem(DAY_OPEN_KEY, JSON.stringify(rec))
  } catch {
    // depolama yok: yoksay
  }
}

// Bugünün kaydı: varsa o; yoksa yeni (henüz yazılmamış) kayıt, dünün önceliğiyle
export function dayOpenFor(now = new Date(), stored = readDayOpen()) {
  const today = dayKey(now)
  if (stored?.day === today) return { rec: stored, fresh: false }
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  const prev = stored?.day === dayKey(y) && Number.isFinite(stored?.lead) ? stored.lead : null
  return { rec: { day: today, firstAt: new Date(now).getTime(), firstTapAt: null, lead: null, prev }, fresh: true }
}

// Cümle hâlâ görünür mü: ilk dokunuş yok ve ilk açılıştan beri 1 saatten az
export const leadLive = (rec, now = new Date()) => Boolean(rec) && !rec.firstTapAt && new Date(now).getTime() - rec.firstAt < LEAD_MS

// Ana sayfadan bir şey açıldı: günün ilk dokunuşu (yalnız bugünün kaydı varsa ve ilkse)
export function markDayTap(now = new Date()) {
  const r = readDayOpen()
  if (r && r.day === dayKey(now) && !r.firstTapAt) saveDayOpen({ ...r, firstTapAt: new Date(now).getTime() })
}
