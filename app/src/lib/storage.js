// Yerel kayıt. Tüm veri cihazda kalır; sunucuya gönderilmez.
// localStorage erişilemezse (gizli sekme, engelli site verisi) bellekte çalışır.

const KEY = 'gozolcum:v1'
// updateSession'ın değiştirmediği alanlar
const FIXED = ['id', 'date', 'type']

const EMPTY = () => ({
  version: 1,
  settings: {
    screening: null, // { date, flags: [], referred: bool } — kurulum kapısı; profilden türetilir (lib/profile.js)
    profile: null, // lib/profile.js emptyProfile(): 11 maddelik profil anketi
    calibration: null, // { pxPerMm, dpr, screenW, screenH, date }
    distance: null, // { focalPx, irisPxAt40, date }
    reminder: null, // { time: 'HH:MM', weeklyTarget: 3 }
    identity: null, // lib/identity.js: { name, birthDate, avatar } — cihazda kalır
    intro: null, // { seen: true, date } — giriş filmi bir kez oynar
  },
  tests: [], // bkz. addTest
  sessions: [], // { id, date, type: 'blink', ... }
})

function memoryStore() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  }
}

function defaultBackend() {
  try {
    const ls = globalThis.localStorage
    const probe = `${KEY}:probe`
    ls.setItem(probe, '1')
    ls.removeItem(probe)
    return ls
  } catch {
    return memoryStore()
  }
}

export function createStore(backend = defaultBackend()) {
  let state = read()

  function read() {
    try {
      const raw = backend.getItem(KEY)
      if (!raw) return EMPTY()
      const parsed = JSON.parse(raw)
      if (parsed?.version !== 1) return EMPTY()
      const base = EMPTY()
      return {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...parsed.settings },
      }
    } catch {
      return EMPTY()
    }
  }

  function write() {
    try {
      backend.setItem(KEY, JSON.stringify(state))
      return true
    } catch {
      return false
    }
  }

  const id = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

  return {
    get: () => state,
    setSetting(name, value) {
      state = { ...state, settings: { ...state.settings, [name]: value } }
      return write()
    },
    // test: { type: 'va-daily'|'va-weekly'|'reading', eye: 'R'|'L'|'OU', ... }
    addTest(test) {
      const rec = { id: id(), date: new Date().toISOString(), ...test }
      state = { ...state, tests: [...state.tests, rec] }
      write()
      return rec
    },
    addSession(session) {
      const rec = { id: id(), date: new Date().toISOString(), ...session }
      state = { ...state, sessions: [...state.sessions, rec] }
      write()
      return rec
    },
    // Var olan kaydı birleştirerek günceller (ör. yoga: ders kaydı ses bittiği anda yazılır, sonra puanı ve ertesi
    // sabahın cevabı sonra eklenir; PLAN.v3 §D.4). id, date ve type değişmez. Kimlik yoksa ya da yama nesne değilse null.
    updateSession(sid, patch) {
      if (sid == null || !patch || typeof patch !== 'object' || Array.isArray(patch)) return null
      const i = state.sessions.findIndex((s) => s != null && s.id === sid)
      if (i < 0) return null
      const rest = Object.fromEntries(Object.entries(patch).filter(([k]) => !FIXED.includes(k)))
      const rec = { ...state.sessions[i], ...rest }
      state = { ...state, sessions: state.sessions.map((s, k) => (k === i ? rec : s)) }
      write()
      return rec
    },
    tests({ type, eye } = {}) {
      return state.tests.filter(
        (t) => (!type || t.type === type) && (!eye || t.eye === eye),
      )
    },
    exportJSON: () => JSON.stringify(state, null, 2),
    clearAll() {
      state = EMPTY()
      try {
        backend.removeItem(KEY)
      } catch {
        // yoksay
      }
    },
  }
}

export const store = createStore()
