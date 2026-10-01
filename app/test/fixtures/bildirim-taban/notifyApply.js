// Hatırlatma planını (lib/notifyPlan.js planNotifications) iPhone'a uygular. Yalnızca iOS uygulamasında.
// Sözleşme: bildirim sistemi v2 §3; gerekçe: docs/yol-haritasi/BILDIRIM_PLANI.md "7. Teknik".
// @capacitor/local-notifications 8.3.1 (definitions.d.ts ve ios/Sources okundu):
//  - schedule() izin yoksa sistem izin penceresini KENDİSİ açar → izin 'granted' değilse hiçbir şey kurulmaz.
//  - Geçmiş bir `at` hemen çalar (tetik nil) → şimdiden önceki an kurulmaz.
//  - getPending: id sayı, schedule.at ISO dizesi (saniye hassasiyeti; milisaniye düşer).
//  - cancel: bekleyende olmayan id sorun çıkarmaz (removePendingNotificationRequests).
//  - `on`/`every` tek bir günü atlayamaz, `cancelAll` 7301/7302'yi de siler → ikisi de kullanılmaz.
import { isIOSApp, setWalkGuards } from '../../../src/lib/native.js'

export { notifyPermission, askNotifyPermission } from '../../../src/lib/restNotify.js'

// Kendi aralığımız: 7400 + gün×10 + tür (gün 0..6) ve çalışma oturumu 7500–7503 (VARSAYIM; 7509'a dek ayrıldı).
// 7301 (mola bitti) ve 7302 (deneme) bu aralıkta değil: dokunulmaz, iptal edilmez.
const OWN_RANGES = [
  [7400, 7499],
  [7500, 7509],
]
const OWN_IDS = OWN_RANGES.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))
const isOwnId = (id) => Number.isInteger(id) && OWN_RANGES.some(([a, b]) => id >= a && id <= b)

// Art arda gelen planlar bu süre içinde birleşir; son plan kazanır (plan v2: 300–500 ms).
const MERGE_MS = 400

const toMs = (v) => (v == null ? NaN : new Date(v).getTime())
const sec = (ms) => Math.floor(ms / 1000)

// Plandaki kurulabilir bildirimler (id → bildirim): kendi aralığımızda, zamanı gelecekte; aynı id'nin ilki
function wantedFrom(plan, nowMs) {
  const out = new Map()
  for (const n of Array.isArray(plan?.notifications) ? plan.notifications : []) {
    const atMs = toMs(n?.at)
    if (!isOwnId(n?.id) || out.has(n.id) || !(atMs > nowMs)) continue
    out.set(n.id, { ...n, atMs, title: String(n.title ?? ''), body: String(n.body ?? '') })
  }
  return out
}

// Bekleyen bildirim yeni plandakiyle aynı mı (zaman ve metin). extra ve düzey id'den ve zamandan çıkar.
const same = (p, w) =>
  p?.title === w.title &&
  p?.body === w.body &&
  !p?.schedule?.every &&
  !p?.schedule?.on &&
  sec(toMs(p?.schedule?.at)) === sec(w.atMs)

const toLN = (w) => ({
  id: w.id,
  title: w.title,
  body: w.body,
  schedule: { at: new Date(w.atMs), allowWhileIdle: true },
  interruptionLevel: w.level === 'timeSensitive' ? 'timeSensitive' : 'active',
  ...(w.extra !== undefined ? { extra: w.extra } : {}),
})

// loadLN: () => Promise<{ LN } | null>. Eklenti nesnesi kutuda gelir (Bug 15; restNotify.js'teki not).
// Testler sahte LN ile çağırır; uygulama aşağıdaki tek örneği kullanır.
export function createApplier(loadLN) {
  let chain = Promise.resolve()
  let timer = null
  let nextPlan = null
  let waiters = []

  // Tek sıra: her iş bir öncekinin bitmesini bekler; hata zinciri kırmaz.
  const enqueue = (job) => {
    const run = chain.then(job)
    chain = run.catch(() => {})
    return run
  }

  const ln = async () => {
    try {
      return (await loadLN()) ?? null
    } catch {
      return null
    }
  }

  async function reconcile(plan) {
    const pl = await ln()
    if (!pl) return { ok: false, reason: 'unsupported' }
    const { LN } = pl
    try {
      const { display } = await LN.checkPermissions()
      if (display !== 'granted') return { ok: false, reason: 'permission' }
      const wanted = wantedFrom(plan, Date.now())
      const res = await LN.getPending()
      const kept = new Set()
      const cancel = []
      for (const p of Array.isArray(res?.notifications) ? res.notifications : []) {
        const id = Number(p?.id)
        if (!isOwnId(id)) continue // 7301, 7302 ve başka her şey
        const w = wanted.get(id)
        if (w && !kept.has(id) && same(p, w)) kept.add(id)
        else cancel.push({ id })
      }
      // Önce iptal: iOS en çok 64 bekleyen bildirim tutar.
      if (cancel.length) await LN.cancel({ notifications: cancel })
      const add = [...wanted.values()].filter((w) => !kept.has(w.id))
      if (add.length) await LN.schedule({ notifications: add.map(toLN) })
      // Native yürüyüş koruması yalnız kurulu yürüyüş bildirimleri için (adım eşiği aşılınca bekleyeni siler)
      const guards = (Array.isArray(plan?.walkGuards) ? plan.walkGuards : []).filter((g) => wanted.has(g?.id))
      try {
        await setWalkGuards(guards)
      } catch {
        // native.js hatayı zaten yutar
      }
      return { ok: true, scheduled: add.length, cancelled: cancel.length, kept: kept.size }
    } catch {
      return { ok: false, reason: 'error' }
    }
  }

  // Döner: Promise<{ ok, scheduled, cancelled, kept } | { ok: false, reason }> — reddedilmez.
  function applyPlan(plan) {
    nextPlan = plan
    return new Promise((resolve) => {
      waiters.push(resolve)
      if (timer) return // pencere açık: son plan kazanır
      timer = setTimeout(() => {
        timer = null
        const p = nextPlan
        const ws = waiters
        nextPlan = null
        waiters = []
        const settle = (r) => ws.forEach((w) => w(r))
        enqueue(() => reconcile(p)).then(settle, () => settle({ ok: false, reason: 'error' }))
      }, MERGE_MS)
    })
  }

  // Kendi aralığını iptal eder ("Tüm verileri sil", optIn 'no'). İzin gerekmez; 7301/7302'ye dokunmaz.
  function cancelOwn() {
    // Pencerede bekleyen plan düşer: iptal ondan sonra istendi.
    if (timer) {
      clearTimeout(timer)
      timer = null
      nextPlan = null
      const ws = waiters
      waiters = []
      ws.forEach((w) => w({ ok: false, reason: 'superseded' }))
    }
    return enqueue(async () => {
      const pl = await ln()
      if (!pl) return { ok: false, reason: 'unsupported' }
      const { LN } = pl
      try {
        await LN.cancel({ notifications: OWN_IDS.map((id) => ({ id })) })
      } catch {
        return { ok: false, reason: 'error' }
      }
      try {
        await setWalkGuards([])
      } catch {
        // yoksay
      }
      return { ok: true }
    })
  }

  // Tek dokunma dinleyicisi. Uygulama kapalıyken yapılan dokunuş yalnız İLK bağlanan dinleyiciye gider
  // (plan v2 §7), bu yüzden eklenti dinleyicisi bir kez bağlanır ve hiç kaldırılmaz; yeniden çağrı yalnız
  // cb'yi değiştirir. cb yokken gelen dokunuş bekletilir, cb bağlanınca iletilir.
  let tapCb = null
  let tapBound = null
  const tapQueue = []
  const deliver = (ev) => {
    if (!tapCb) {
      if (tapQueue.push(ev) > 5) tapQueue.shift()
      return
    }
    try {
      tapCb(ev)
    } catch {
      // yoksay
    }
  }

  async function bindTap() {
    const pl = await ln()
    if (!pl) return false
    const { LN } = pl
    try {
      await LN.addListener('localNotificationActionPerformed', (a) => {
        if (a?.actionId !== 'tap') return // 'dismiss' vb.
        deliver({ id: Number(a.notification?.id), extra: a.notification?.extra ?? null })
      })
      return true
    } catch {
      tapBound = null // sonraki çağrı yeniden dener
      return false
    }
  }

  // cb({ id, extra }). Döner: cb'yi bırakma fonksiyonu (eklenti dinleyicisi kalır).
  async function onNotifyTap(cb) {
    tapCb = typeof cb === 'function' ? cb : null
    if (!tapBound) tapBound = bindTap()
    await tapBound
    while (tapCb && tapQueue.length) deliver(tapQueue.shift())
    return () => {
      if (tapCb === cb) tapCb = null
    }
  }

  return { applyPlan, cancelOwn, onNotifyTap }
}

// Uygulamadaki tek örnek: eklenti restNotify.js'teki gibi dinamik yüklenir (web'de null).
let modPromise = null
const loadMod = () => {
  if (!isIOSApp()) return Promise.resolve(null)
  if (!modPromise) modPromise = import('@capacitor/local-notifications').catch(() => null)
  return modPromise
}
const loadLN = async () => {
  const m = await loadMod()
  return m ? { LN: m.LocalNotifications } : null
}
const applier = createApplier(loadLN)

export function applyPlan(plan) {
  return applier.applyPlan(plan)
}
export function cancelOwn() {
  return applier.cancelOwn()
}
export async function onNotifyTap(cb) {
  return applier.onNotifyTap(cb)
}
