// Yerel kayıt uzlaştırması (modul.md §4 "Uygulama arka planda biter ya da kapanır", §6.4; PLAN.v3 §D.3). Yerel oynatıcı
// dinlenen süreyi UserDefaults'a da yazar (AlarmPlugin LessonPlayer.save; lessonStart id ile). JS kendi yazdığı kayıttan
// sonra yerel kaydı siler (bridge.journalClear), böylece bir ders iki kez yazılmaz. Kalan yerel kayıt üç durumda işlenir:
//  1. Uygulama ders sırasında kapandı (bellekte oturum yok): açılışta kayıt yerel kayıttan yazılır.
//  2. Ders, kişi Yoga ekranı dışındayken bitti ya da başka yerden kapandı (ör. uyku sesi duraklatılmış dersi kapattı):
//     kayıt sessizce yazılır, sonra puanı sorulmaz.
//  3. WebView yeniden yüklendi ama ders yerelde sürüyor: kayıt yazılmaz; Yoga açılınca oynatıcı derse yeniden bağlanır
//     (liveLesson). Kaydın tarihi dersin gerçek bitiş anıdır (endedAt, yoksa updatedAt).
import { LESSONS, lessonByFile } from '../../lib/yogaLessons.js'
import { makeYogaRecord, recordFromJournal, journalWritten, journalEndedAt, recordWriter } from '../../lib/yogaRecord.js'
import { lesson as bridge, LIVE_STATES } from './bridge.js'
import { currentLesson, clearCurrentLesson, setCurrentLesson, newLessonSession, reachedClosing } from './session.js'
import { closingAt, loadTimeline } from './timeline.js'

export const ownJournal = (s, j) => Boolean(j && s?.runId && j.id === s.runId)

// Oturumun ders kaydı ya da null (30 sn altı). journal: yerel kayıt; bu oturumunsa bitiş anı, dinlenen süre ve en ileri
// konum ondan tamamlanır (ekran dersin sonunu görmediyse de kaydın günü doğru olur).
export function sessionRecord(s, { journal = null, now = new Date() } = {}) {
  const L = LESSONS[s?.lesson]
  if (!L) return null
  const v = s.version ?? {}
  const j = ownJournal(s, journal) ? journal : null
  const listened = Math.max(Number(s.listened) || 0, Number.isFinite(j?.listened) ? j.listened : 0)
  const maxPos = Math.max(Number(s.maxPos) || 0, Number.isFinite(j?.maxTime) ? j.maxTime : 0)
  const closing = reachedClosing({ ...s, maxPos, finished: s.finished || j?.finished === true })
  return makeYogaRecord({
    lesson: s.lesson, planned: s.planned, seconds: listened, reachedClosing: closing, quickClose: s.quickClose,
    startedAt: s.startedAt, endedAt: (j && journalEndedAt(j)) ?? now, before: s.before, voice: v.voice ?? null, bg: v.bg ?? null,
    posture: L.posture, scene: v.scene ?? null, clarity: false, musicTail: s.musicTail, planVersion: v.planVersion ?? null,
    contentHash: v.contentHash ?? null,
  })
}

const sessionsOf = (store) => {
  try {
    return store?.get?.()?.sessions ?? []
  } catch {
    return []
  }
}

// Açılışta ve uygulama öne gelince (App.jsx). yogaOnScreen: Yoga ekranı açık (oynatıcı kendi kaydını yazar).
// Dönüş: yazılan kayıt ya da null.
export async function reconcileLessonJournal(store, { yogaOnScreen = false } = {}) {
  const j = await bridge.journal()
  if (!j || typeof j.file !== 'string') return null
  const st = await bridge.status().catch(() => null)
  if (st && LIVE_STATES.includes(st.state)) return null // ders sürüyor: bitince yazılır
  const s = currentLesson()
  if (s && ownJournal(s, j)) {
    if (yogaOnScreen || s.ended) return null // oynatıcı kaydı kendisi yazar
    s.ended = true
    if (j.finished === true || st?.state === 'finished' || st?.state === 'tail') s.finished = true
    const rec = sessionRecord(s, { journal: j })
    s.writer?.save(rec)
    s.writer?.flush()
    clearCurrentLesson(s)
    await bridge.journalClear()
    return rec
  }
  if (journalWritten(sessionsOf(store), j)) {
    await bridge.journalClear()
    return null
  }
  const hit = lessonByFile(j.file)
  const tl = hit ? await loadTimeline(hit.version.timeline) : null
  const rec = recordFromJournal(j, { closeAt: tl ? closingAt(tl) : null })
  if (rec) store?.addSession?.(rec)
  await bridge.journalClear()
  return rec
}

// Bellekte oturum yokken yerelde süren ders (WebView yeniden yüklendi): oynatıcıya yeniden bağlanacak oturum ya da null.
// Önce puanı bellekle birlikte kaybolmuştur; kayıt ders bitince yazılır.
export async function liveLesson(store) {
  if (currentLesson()) return null
  const st = await bridge.status().catch(() => null)
  if (!st || (st.state !== 'playing' && st.state !== 'paused')) return null
  const j = await bridge.journal()
  const own = j && j.file === st.file ? j : null
  const hit = lessonByFile(st.file ?? own?.file)
  if (!hit || currentLesson()) return null
  const startedAt = Number.isFinite(own?.startedAt) ? new Date(own.startedAt * 1000).toISOString() : new Date().toISOString()
  const s = newLessonSession({
    lesson: hit.lesson, minutes: hit.minutes, version: hit.version, title: LESSONS[hit.lesson].title, startedAt,
    runId: typeof own?.id === 'string' ? own.id : null, writer: recordWriter(store), started: true,
    listened: Math.max(st.listened ?? 0, Number.isFinite(own?.listened) ? own.listened : 0), lastPos: st.time, playing: st.playing,
  })
  s.maxPos = Math.max(st.time, Number.isFinite(own?.maxTime) ? own.maxTime : 0)
  s.extPaused = st.state === 'paused'
  return setCurrentLesson(s) // musicTail null: bu oturumda seçilen kuyruk bilinmiyor
}
