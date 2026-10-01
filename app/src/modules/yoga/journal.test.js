// Yerel kayıt uzlaştırması (modul.md §4, §6.4; PLAN.v3 §D.3): uygulama ders sırasında kapandıysa ya da ders Yoga ekranı
// dışındayken bittiyse kayıt yerel kayıttan bir kez yazılır; tarih dersin bitiş anıdır; ders sürüyorsa yazılmaz.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url))
globalThis.fetch = async (p) => {
  try {
    const txt = readFileSync(PUBLIC + String(p).replace(/^\.?\//, ''), 'utf8')
    return { ok: true, json: async () => JSON.parse(txt) }
  } catch {
    return { ok: false }
  }
}

const eng = vi.hoisted(() => ({ status: { state: 'idle', time: 0, playing: false }, journal: null, cleared: 0, calls: [] }))
vi.mock('../../lib/native.js', async (orig) => ({
  ...(await orig()),
  isIOSApp: () => true,
  lessonStatus: async () => eng.status,
  lessonStop: async () => {
    eng.calls.push('stop')
    if (eng.stopFail) throw Object.assign(new Error('x'), { code: 'UNIMPLEMENTED' })
    eng.status = { state: 'idle', time: 0, playing: false }
  },
  lessonJournal: async () => eng.journal,
  lessonJournalClear: async () => { eng.calls.push('journalClear'); eng.cleared += 1; eng.journal = null; return true },
}))

const { reconcileLessonJournal, sessionRecord, resetLessonData } = await import('./journal.js')
const { setCurrentLesson, clearCurrentLesson, currentLesson, newLessonSession } = await import('./session.js')
const { recordWriter } = await import('../../lib/yogaRecord.js')
const { LESSONS } = await import('../../lib/yogaLessons.js')

const T0 = Date.UTC(2026, 8, 29, 20, 0, 0) / 1000
const J = (over = {}) => ({ id: 'yoga-a', file: 'yoga/ders2-15.mp3', title: 'Derin Dinlenme', state: 'stopped', finished: false, prelude: false, startedAt: T0, updatedAt: T0 + 400, endedAt: T0 + 410, listened: 400, time: 405, maxTime: 405, duration: 900, ...over })
const mkStore = (sessions = []) => {
  const st = { sessions: [...sessions] }
  return {
    get: () => st,
    addSession: vi.fn((r) => { const rec = { id: `s${st.sessions.length + 1}`, ...r }; st.sessions.push(rec); return rec }),
    updateSession: vi.fn((id, p) => { const i = st.sessions.findIndex((x) => x.id === id); if (i < 0) return null; st.sessions[i] = { ...st.sessions[i], ...p }; return st.sessions[i] }),
  }
}

beforeEach(() => {
  eng.status = { state: 'idle', time: 0, playing: false }
  eng.journal = null
  eng.cleared = 0
  eng.calls = []
  eng.stopFail = false
  clearCurrentLesson()
})

describe('reconcileLessonJournal', () => {
  it('yerel kayıt yok → hiçbir şey', async () => {
    const store = mkStore()
    expect(await reconcileLessonJournal(store)).toBeNull()
    expect(store.addSession).not.toHaveBeenCalled()
    expect(eng.cleared).toBe(0)
  })
  it('ders yerelde sürüyor (çalıyor, duraklatılmış, sönüyor) → yazılmaz, yerel kayıt kalır', async () => {
    for (const state of ['playing', 'paused', 'stopping']) {
      eng.journal = J({ state })
      eng.status = { state, time: 300, playing: state === 'playing', file: 'yoga/ders2-15.mp3' }
      const store = mkStore()
      expect(await reconcileLessonJournal(store)).toBeNull()
      expect(store.addSession).not.toHaveBeenCalled()
    }
    expect(eng.cleared).toBe(0)
  })
  it('uygulama ders sırasında kapandı: kayıt yerel kayıttan bir kez; tarih bitiş anı; yerel kayıt silinir', async () => {
    eng.journal = J()
    const store = mkStore()
    const rec = await reconcileLessonJournal(store)
    // contentHash dosyanın özetidir (ilk bölüm dosyası c875dcef…, 2026-09-30; önceki A adımı karışımı 726417fa…)
    expect(rec).toMatchObject({ type: 'yoga', lesson: 2, planned: 900, seconds: 400, reachedClosing: false, completed: false, voice: 'hoc', contentHash: LESSONS[2].versions[15].contentHash })
    expect(rec.contentHash).toBe('c875dcef4885db95')
    expect(rec.date).toBe(new Date((T0 + 410) * 1000).toISOString())
    expect(rec.startedAt).toBe(new Date(T0 * 1000).toISOString())
    expect(store.addSession).toHaveBeenCalledTimes(1)
    expect(eng.cleared).toBe(1)
    expect(await reconcileLessonJournal(store)).toBeNull()
    expect(store.addSession).toHaveBeenCalledTimes(1)
  })
  it('kapanışa ulaşıldıysa (en ileri konum kapanışın başını geçti ya da dosya bitti) tamamlanma buna göre; bitiş yoksa updatedAt', async () => {
    eng.journal = J({ maxTime: 800, listened: 790, endedAt: undefined })
    const a = await reconcileLessonJournal(mkStore())
    expect(a).toMatchObject({ reachedClosing: true, completed: true })
    expect(a.date).toBe(new Date((T0 + 400) * 1000).toISOString())
    eng.journal = J({ state: 'finished', finished: true, listened: 900, maxTime: 900 })
    expect(await reconcileLessonJournal(mkStore())).toMatchObject({ reachedClosing: true, completed: true, seconds: 900 })
  })
  it('zaten yazılmış (aynı ders, başlangıç ±10 sn) → yeniden yazılmaz; tanınmayan dosya, giriş dosyası ya da 30 sn altı → kayıt yok', async () => {
    eng.journal = J()
    const store = mkStore([{ id: 'x', type: 'yoga', lesson: 2, startedAt: new Date((T0 + 3) * 1000).toISOString(), seconds: 400 }])
    expect(await reconcileLessonJournal(store)).toBeNull()
    expect(store.addSession).not.toHaveBeenCalled()
    expect(eng.cleared).toBe(1)
    for (const j of [J({ file: 'yoga/sesli-donus.mp3' }), J({ prelude: true }), J({ listened: 20 })]) {
      eng.journal = j
      const s2 = mkStore()
      expect(await reconcileLessonJournal(s2)).toBeNull()
      expect(s2.addSession).not.toHaveBeenCalled()
    }
  })
  it('bellekteki ders Yoga ekranı dışında bitti: kayıt sessizce yazılır, oturum kapanır; Yoga ekranı açıksa oynatıcı yazar', async () => {
    const store = mkStore()
    const s = setCurrentLesson(newLessonSession({ lesson: 2, minutes: 15, version: LESSONS[2].versions[15], title: 'Derin Dinlenme', before: 6, runId: 'yoga-a', writer: recordWriter(store), started: true, listened: 100 }))
    eng.journal = J({ state: 'finished', finished: true, listened: 880, maxTime: 900 })
    eng.status = { state: 'finished', time: 900, playing: false }
    expect(await reconcileLessonJournal(store, { yogaOnScreen: true })).toBeNull()
    expect(currentLesson()).toBe(s)
    const rec = await reconcileLessonJournal(store)
    expect(rec).toMatchObject({ lesson: 2, seconds: 880, before: 6, completed: true, date: new Date((T0 + 410) * 1000).toISOString() })
    expect(store.addSession).toHaveBeenCalledTimes(1)
    expect(currentLesson()).toBeNull()
    expect(eng.cleared).toBe(1)
  })
})

describe('reconcileLessonJournal: aynı anda iki çağrı (açılış + öne geliş; StrictMode)', () => {
  it('tek uçuşlu: iki eşzamanlı çağrı aynı yerel kaydı bir kez yazar', async () => {
    // Bulgu (inceleme): journalWritten denetimi ile addSession arasında `await loadTimeline` vardı; iki çağrı da denetimi
    // geçip aynı dersi iki kez yazıyordu (Gelişim'de dakika ve gün, Nef'in sayıları, CSV satırları iki katı)
    eng.journal = J({ state: 'finished', finished: true, listened: 890, maxTime: 900, endedAt: T0 + 905 })
    const store = mkStore()
    const [a, b] = await Promise.all([reconcileLessonJournal(store), reconcileLessonJournal(store, { yogaOnScreen: true })])
    expect(store.addSession).toHaveBeenCalledTimes(1)
    expect(store.get().sessions.filter((x) => x.type === 'yoga')).toHaveLength(1)
    expect(a).toBe(b)
    expect(eng.cleared).toBe(1)
    // bittikten sonra yeni çağrı yeniden çalışır (kayıt kalmadı: hiçbir şey)
    expect(await reconcileLessonJournal(store)).toBeNull()
    expect(store.addSession).toHaveBeenCalledTimes(1)
  })
  it('çizelge yüklenirken ders başka yoldan yazıldıysa yazmadan hemen önceki denetim ikinci kaydı önler', async () => {
    eng.journal = J()
    const store = mkStore()
    const orig = globalThis.fetch
    globalThis.fetch = async (p) => {
      store.addSession({ type: 'yoga', lesson: 2, startedAt: new Date((T0 + 2) * 1000).toISOString(), seconds: 400 })
      return orig(p)
    }
    try {
      expect(await reconcileLessonJournal(store)).toBeNull()
    } finally {
      globalThis.fetch = orig
    }
    expect(store.addSession).toHaveBeenCalledTimes(1) // yalnız öbür yolun yazdığı
    expect(eng.cleared).toBe(1)
  })
})

describe('"Tüm verileri sil" (resetLessonData)', () => {
  it('süren ders durur, bellekteki oturum unutulur (yazıcısı düşer), yerel kayıt ondan sonra silinir', async () => {
    const store = mkStore()
    const s = setCurrentLesson(newLessonSession({ lesson: 2, minutes: 15, version: LESSONS[2].versions[15], title: 'Derin Dinlenme', before: 7, runId: 'yoga-a', writer: recordWriter(store), started: true, listened: 400 }))
    eng.status = { state: 'playing', time: 400, playing: true }
    eng.journal = J({ state: 'playing' })
    expect(await resetLessonData()).toBe(true)
    expect(currentLesson()).toBeNull()
    expect(s.ended).toBe(true)
    expect(s.writer).toBeNull()
    expect(eng.calls).toEqual(['stop', 'journalClear']) // lessonStop yerel kaydı son kez yazar; silme ondan sonra
    // Bulgu (inceleme): silmeden sonra oynatıcı ya da uzlaştırma eski oturumu (önce puanı 7) boş depoya yazıyordu
    expect(await reconcileLessonJournal(store)).toBeNull()
    expect(store.addSession).not.toHaveBeenCalled()
  })
  it('silmeden önce başlamış uzlaştırma silinmiş depoya yazmaz', async () => {
    eng.journal = J()
    const store = mkStore()
    const p = reconcileLessonJournal(store)
    await resetLessonData()
    expect(await p).toBeNull()
    expect(store.addSession).not.toHaveBeenCalled()
  })
  it('App.jsx "Tüm verileri sil" bunu çağırır (yalnız yerel kaydı silmekle kalmaz)', () => {
    const app = readFileSync(fileURLToPath(new URL('../../App.jsx', import.meta.url)), 'utf8')
    const reset = app.slice(app.indexOf('onReset={() => {'), app.indexOf("go('home')", app.indexOf('onReset={() => {')))
    expect(reset).toContain('resetLessonData().catch(() => {})')
    expect(app).not.toContain('lessonJournalClear')
  })
  it('ders yoksa ya da köprü durdurmayı reddederse de yerel kayıt silinir', async () => {
    expect(await resetLessonData()).toBe(true)
    expect(eng.calls).toEqual(['stop', 'journalClear'])
    eng.calls = []
    eng.stopFail = true
    expect(await resetLessonData()).toBe(true)
    expect(eng.calls).toEqual(['stop', 'journalClear'])
  })
})

describe('sessionRecord', () => {
  it('duraklatılmış ders saatler sonra kapatılınca kaydın tarihi duraklatma anı (dinlenen gün); yerel kaydın bitiş anı önce gelir', () => {
    // Bulgu (inceleme): 29 Eylül 23.50'de duraklatılan ders 30 Eylül 08.00'de X ile kapanınca kayıt 30 Eylül'e yazılıyordu
    const paused = new Date(2026, 8, 29, 23, 50)
    const s = newLessonSession({ lesson: 2, minutes: 15, version: LESSONS[2].versions[15], title: 'Derin Dinlenme', runId: 'yoga-a', listened: 600 })
    s.pausedAt = paused.getTime()
    expect(sessionRecord(s, { now: new Date(2026, 8, 30, 8, 0) }).date).toBe(paused.toISOString())
    expect(sessionRecord(s, { journal: J({ endedAt: T0 + 30 }), now: new Date(2026, 8, 30, 8, 0) }).date).toBe(new Date((T0 + 30) * 1000).toISOString())
    s.pausedAt = null // çalarken kapatıldı: şimdi
    const now = new Date(2026, 8, 30, 8, 0)
    expect(sessionRecord(s, { now }).date).toBe(now.toISOString())
  })
  it('başka dersin yerel kaydı kullanılmaz (kimlik tutmuyor)', () => {
    const s = newLessonSession({ lesson: 2, minutes: 15, version: LESSONS[2].versions[15], title: 'Derin Dinlenme', runId: 'yoga-b', listened: 60 })
    const now = new Date(2026, 8, 30, 9)
    const rec = sessionRecord(s, { journal: J(), now })
    expect(rec.seconds).toBe(60)
    expect(rec.date).toBe(now.toISOString())
  })
})
