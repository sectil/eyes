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

const eng = vi.hoisted(() => ({ status: { state: 'idle', time: 0, playing: false }, journal: null, cleared: 0 }))
vi.mock('../../lib/native.js', async (orig) => ({
  ...(await orig()),
  isIOSApp: () => true,
  lessonStatus: async () => eng.status,
  lessonJournal: async () => eng.journal,
  lessonJournalClear: async () => { eng.cleared += 1; eng.journal = null; return true },
}))

const { reconcileLessonJournal, sessionRecord } = await import('./journal.js')
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
    expect(rec).toMatchObject({ type: 'yoga', lesson: 2, planned: 900, seconds: 400, reachedClosing: false, completed: false, voice: 'hoc', contentHash: '726417faa1760e11' })
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

describe('sessionRecord', () => {
  it('başka dersin yerel kaydı kullanılmaz (kimlik tutmuyor)', () => {
    const s = newLessonSession({ lesson: 2, minutes: 15, version: LESSONS[2].versions[15], title: 'Derin Dinlenme', runId: 'yoga-b', listened: 60 })
    const now = new Date(2026, 8, 30, 9)
    const rec = sessionRecord(s, { journal: J(), now })
    expect(rec.seconds).toBe(60)
    expect(rec.date).toBe(now.toISOString())
  })
})
