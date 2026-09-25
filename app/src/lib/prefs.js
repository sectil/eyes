// Cihaz başına geri bildirim tercihleri: ses ve titreşim.
// Ölçüm verisinden (storage.js) ayrı saklanır; "Tüm verileri sil" bunlara dokunmaz (tema gibi).
//
//   getPrefs()          → { sound, haptics }  (kopya; varsayılan ikisi de true)
//   setPrefs(patch)     → yeni tercihler; yalnızca bilinen anahtarlar ve boolean değerler kabul edilir
//   subscribePrefs(fn)  → abonelikten çıkma fonksiyonu; fn(yeni, önceki) yalnızca gerçek değişiklikte çağrılır
//
// localStorage'a her erişim try/catch içinde: gizli sekme, engellenmiş site verisi veya Node testleri
// gibi depolamanın olmadığı/erişimin hata verdiği yerlerde tercihler yalnızca bellekte yaşar.

const KEY = 'gozolcum:prefs'

// coach: Jev Göz Koçu (varsayılan kapalı, açık onayla açılır); coachHidden: ana sayfa tanıtım kartı gizli;
// coachLife: profil cevaplarının özeti (uyku, ekran, gece telefonu, stres) de koça gider — ayrı onay (Build 27)
export const DEFAULT_PREFS = Object.freeze({ sound: true, haptics: true, coach: false, coachHidden: false, coachLife: false })
const KEYS = Object.keys(DEFAULT_PREFS)

function sanitize(raw) {
  const out = { ...DEFAULT_PREFS }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const k of KEYS) if (typeof raw[k] === 'boolean') out[k] = raw[k]
  }
  return out
}

// storage: { getItem, setItem } nesnesi ya da onu döndüren fonksiyon (erişimin kendisi hata verebilir).
export function createPrefs(storage) {
  let cache = null
  const subs = new Set()

  function backend() {
    try {
      const s = typeof storage === 'function' ? storage() : storage
      return s && typeof s.getItem === 'function' && typeof s.setItem === 'function' ? s : null
    } catch {
      return null
    }
  }

  function load() {
    try {
      const raw = backend()?.getItem(KEY)
      return sanitize(raw ? JSON.parse(raw) : null)
    } catch {
      return { ...DEFAULT_PREFS }
    }
  }

  function current() {
    if (!cache) cache = load()
    return cache
  }

  function get() {
    return { ...current() }
  }

  function set(patch) {
    const prev = current()
    if (!patch || typeof patch !== 'object') return { ...prev }
    const next = { ...prev }
    let changed = false
    for (const k of KEYS) {
      if (typeof patch[k] === 'boolean' && patch[k] !== prev[k]) {
        next[k] = patch[k]
        changed = true
      }
    }
    if (!changed) return { ...prev }
    cache = next
    try {
      backend()?.setItem(KEY, JSON.stringify(next))
    } catch {
      // depolama yok/dolu: tercih bu oturum boyunca bellekte geçerli
    }
    // Dinleyici sırasında abonelikten çıkılabilir → kopya üzerinde dolaş.
    for (const fn of [...subs]) {
      try {
        fn({ ...next }, { ...prev })
      } catch (e) {
        // Bir dinleyicinin hatası diğerlerini ve setPrefs çağıranı bozmasın.
        console.error('prefs: dinleyici hatası', e)
      }
    }
    return { ...next }
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {}
    // Aynı fonksiyon iki kez abone olursa ayrı kayıt tutulsun diye sarmalanır.
    const entry = (n, p) => fn(n, p)
    subs.add(entry)
    return () => {
      subs.delete(entry)
    }
  }

  return { get, set, subscribe }
}

// Uygulama geneli örnek. Safari'de site verisi engelliyken localStorage'a erişmek bile
// SecurityError fırlatabilir; backend() bunu yakalar.
const shared = createPrefs(() => globalThis.localStorage)

export const getPrefs = () => shared.get()
export const setPrefs = (patch) => shared.set(patch)
export const subscribePrefs = (fn) => shared.subscribe(fn)
