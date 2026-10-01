// Hatırlatma planını (lib/notifyPlan.js planNotifications) iPhone'a uygular. Yalnızca iOS uygulamasında.
// Sözleşme: bildirim sistemi v2 §3; gerekçe: docs/yol-haritasi/BILDIRIM_PLANI.md "7. Teknik".
// @capacitor/local-notifications 8.3.1 (definitions.d.ts ve ios/Sources okundu):
//  - schedule() izin yoksa sistem izin penceresini KENDİSİ açar → izin 'granted' değilse hiçbir şey kurulmaz.
//  - Geçmiş bir `at` hemen çalar (tetik nil) → şimdiden önceki an kurulmaz.
//  - getPending: id sayı, schedule.at ISO dizesi (saniye hassasiyeti; milisaniye düşer).
//  - cancel: bekleyende olmayan id sorun çıkarmaz (removePendingNotificationRequests).
//  - `on`/`every` tek bir günü atlayamaz, `cancelAll` 7301/7302'yi de siler → ikisi de kullanılmaz.
import { isIOSApp, setWalkGuards } from './native.js'

export { notifyPermission, askNotifyPermission } from './restNotify.js'

// Kendi aralığımız (uzlaştırılır; PLAN.v1 §5.5 madde 2): 7400 + gün×10 + tür (gün 0..6), çalışma oturumu 7500–7503
// (VARSAYIM; 7509'a dek ayrıldı), sabah havası 7700–7701, modül hatırlatmaları 7800–7859, legacy ek saatleri 7860–7867,
// Nef 7900–7919.
// Yalnız iptal (cancelOwn, rıza geri çekme, "Tüm verileri sil"): 7710–7719 yürüyüş sorusu ve "fark et" teklifi; onları
// Swift kurar, JS uzlaştırmaz. 7301 (mola bitti), 7302 (deneme) ve 7600–7607 bu aralıklarda değil: dokunulmaz.
const OWN_RANGES = [
  [7400, 7499],
  [7500, 7509],
  [7700, 7701],
  [7800, 7859],
  [7860, 7867],
  [7900, 7919], // Nef'in kendi bildirimi (lib/nef/notify.js; Nef PLAN §4.3, ANA_OTURUM_ISTEMI madde 5)
]
const CANCEL_ONLY_RANGES = [[7710, 7719]]
const idsOf = (ranges) => ranges.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))
const inRanges = (ranges, id) => Number.isInteger(id) && ranges.some(([a, b]) => id >= a && id <= b)
const CANCEL_IDS = idsOf([...OWN_RANGES, ...CANCEL_ONLY_RANGES])
const isOwnId = (id) => inRanges(OWN_RANGES, id)
// Deney bildirimleri: 74xx ve legacy ek saatleri 7860–7867 (dokununca ikisinde de markTapped çalışır; §5.5 madde 1).
const EXPERIMENT_RANGES = [
  [7400, 7499],
  [7860, 7867],
]
// Açılışta Bildirim Merkezi'nden kaldırılabilen teslim edilmişler: kendi aralıklarımız, deney bildirimleri hariç (§A.4:
// "74xx hariç; deneyin dokunma ölçüsü değişmesin"). VARSAYIM: gerekçe ek saatler için de geçerli olduğundan 7860–7867
// de kaldırılmaz (ek saat deney bildirimidir, §A.4 "Sayı bütçesi"). Yalnız yeni özellik açıkken.
const isTidyId = (id) => inRanges([...OWN_RANGES, ...CANCEL_ONLY_RANGES], id) && !inRanges(EXPERIMENT_RANGES, id)
// Yeni özelliğin kurduğu kimlikler (sabah havası, modül hatırlatmaları, ek saatler). Gruplama (threadIdentifier,
// relevanceScore, açılış temizliği) yalnız bunlardan en az biri gerçekten kurulacaksa devreye girer: metni bağlanmamış
// bildirim kurulmadığı için plan.grouped tek başına yetmez (inceleme; B1a'da metinler bağlanınca kendiliğinden açılır).
const isNewId = (id) => inRanges([[7700, 7701], [7800, 7867], [7900, 7919]], id)

// Bildirim Merkezi'nde tek grup (yalnız yeni özellik açıkken). relevanceScore özet sıralaması içindir (VARSAYIM:
// çalışma oturumu en üstte, sonra hava, deney ve ek saatler, en altta modül hatırlatmaları).
const THREAD_ID = 'nefona'
function relevanceOf(id) {
  if (id >= 7500 && id <= 7509) return 0.9
  if (id >= 7700 && id <= 7701) return 0.8
  if ((id >= 7400 && id <= 7499) || (id >= 7860 && id <= 7867)) return 0.6
  return 0.4
}

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
    // VARSAYIM: metni bağlanmamış (yalnız textKey taşıyan) bildirim kurulmaz. Onaylı cümleleri planAll({ texts: true })
    // bağlar (lib/remindTexts.js); metni çözülmüş bildirim title/body taşıdığı için bu kuraldan geçer.
    // İstisna: metinsiz "yerelde yenilendi" hava bildirimi (weatherNotify keepPending) yalnız bekleyeni tutmak için
    // istenir; bekleyen yoksa kurulmaz (keepOnly).
    const textless = n.textKey != null && n.title == null && n.body == null
    if (textless && !keepsLocal(n)) continue
    out.set(n.id, { ...n, atMs, title: String(n.title ?? ''), body: String(n.body ?? ''), ...(textless ? { keepOnly: true } : {}) })
  }
  return out
}

// "Yerelde yenilendi" (§5.3, §5.5 madde 2 ve 7): Swift'in günün havasıyla yeniden yazdığı bekleyen 7700–7701, plan onu
// yine istiyorsa (aynı kimlik) yerinde kalır; metni plandakinden farklı olsa da iptal edilip yeniden kurulmaz.
// VARSAYIM: işareti plan taşır (bildirimde keepPending: true); B2'de weatherNotify, SkyPlugin.takeLocalRefresh()'in
// o gün için döndürdüğü işarete göre yazar. Plan o kimliği hiç istemiyorsa (hava kapalı) bekleyen iptal edilir.
const keepsLocal = (w) => w?.keepPending === true && w.id >= 7700 && w.id <= 7701

// Bekleyen bildirim yeni plandakiyle aynı mı (zaman ve metin). extra ve düzey id'den ve zamandan çıkar.
const same = (p, w) =>
  p?.title === w.title &&
  p?.body === w.body &&
  !p?.schedule?.every &&
  !p?.schedule?.on &&
  sec(toMs(p?.schedule?.at)) === sec(w.atMs)

const toLN = (w, grouped = false) => ({
  id: w.id,
  title: w.title,
  body: w.body,
  schedule: { at: new Date(w.atMs), allowWhileIdle: true },
  interruptionLevel: w.level === 'timeSensitive' ? 'timeSensitive' : 'active',
  ...(w.extra !== undefined ? { extra: w.extra } : {}),
  ...(grouped ? { threadIdentifier: THREAD_ID, relevanceScore: relevanceOf(w.id) } : {}),
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

  // tidy: uygulama açıldı (applyPlan(plan, { tidy: true })). Yeni özellik açıkken (plan.grouped ve kurulacak yeni bir
  // bildirim var) teslim edilmiş eski bildirimler Bildirim Merkezi'nden kaldırılır, 74xx ve 7860–7867 hariç.
  // Kapalıyken hiçbir çağrı yapılmaz (bugünkü davranış).
  async function reconcile(plan, tidy = false) {
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
        if (w && !kept.has(id) && (keepsLocal(w) || same(p, w))) kept.add(id)
        else cancel.push({ id })
      }
      // Önce iptal: iOS en çok 64 bekleyen bildirim tutar.
      if (cancel.length) await LN.cancel({ notifications: cancel })
      const add = [...wanted.values()].filter((w) => !kept.has(w.id) && !w.keepOnly)
      const grouped = plan?.grouped === true && [...wanted.keys()].some(isNewId)
      if (add.length) await LN.schedule({ notifications: add.map((w) => toLN(w, grouped)) })
      if (grouped && tidy) {
        try {
          const del = await LN.getDeliveredNotifications()
          const old = (Array.isArray(del?.notifications) ? del.notifications : []).filter((d) => isTidyId(Number(d?.id)))
          if (old.length) await LN.removeDeliveredNotifications({ notifications: old })
        } catch {
          // Bildirim Merkezi temizliği planı bozmaz
        }
      }
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
  // opts.tidy: açılış (pencerede birleşen planlardan biri isterse yeterli).
  let nextTidy = false
  function applyPlan(plan, opts) {
    nextPlan = plan
    if (opts?.tidy === true) nextTidy = true
    return new Promise((resolve) => {
      waiters.push(resolve)
      if (timer) return // pencere açık: son plan kazanır
      timer = setTimeout(() => {
        timer = null
        const p = nextPlan
        const tidy = nextTidy
        const ws = waiters
        nextPlan = null
        nextTidy = false
        waiters = []
        const settle = (r) => ws.forEach((w) => w(r))
        enqueue(() => reconcile(p, tidy)).then(settle, () => settle({ ok: false, reason: 'error' }))
      }, MERGE_MS)
    })
  }

  // Kendi aralığını ve yalnız-iptal aralığını (7710–7719) iptal eder ("Tüm verileri sil", optIn 'no', rıza geri
  // çekme). İzin gerekmez; 7301/7302 ve 7600–7607'ye dokunmaz.
  function cancelOwn() {
    // Pencerede bekleyen plan düşer: iptal ondan sonra istendi.
    if (timer) {
      clearTimeout(timer)
      timer = null
      nextPlan = null
      nextTidy = false
      const ws = waiters
      waiters = []
      ws.forEach((w) => w({ ok: false, reason: 'superseded' }))
    }
    return enqueue(async () => {
      const pl = await ln()
      if (!pl) return { ok: false, reason: 'unsupported' }
      const { LN } = pl
      try {
        await LN.cancel({ notifications: CANCEL_IDS.map((id) => ({ id })) })
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
      // actionId deliver'a geçer (PLAN.v1 §5.5 madde 3): 'tap' bugünkü gibi { id, extra }; bildirim eylemleri
      // (Swift'in kurduğu kategoriler: walkGo, detectYes, sciOpen …) { id, extra, actionId }. 'dismiss' iletilmez.
      // Bugün kategori kurulmadığı için yalnız 'tap' gelir: davranış aynı.
      await LN.addListener('localNotificationActionPerformed', (a) => {
        const actionId = typeof a?.actionId === 'string' ? a.actionId : null
        if (!actionId || actionId === 'dismiss') return
        const ev = { id: Number(a.notification?.id), extra: a.notification?.extra ?? null }
        deliver(actionId === 'tap' ? ev : { ...ev, actionId })
      })
      return true
    } catch {
      tapBound = null // sonraki çağrı yeniden dener
      return false
    }
  }

  // cb({ id, extra, actionId? }): actionId yoksa dokunma. Döner: cb'yi bırakma fonksiyonu (eklenti dinleyicisi kalır).
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

export function applyPlan(plan, opts) {
  return applier.applyPlan(plan, opts)
}
export function cancelOwn() {
  return applier.cancelOwn()
}
export async function onNotifyTap(cb) {
  return applier.onNotifyTap(cb)
}
