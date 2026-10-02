// Çalan ders (modül düzeyinde tek oturum; lib/sleepSession.js kalıbı). Ders yerel oynatıcıda sürer: kişi bildirimle
// başka ekrana geçse de ses kesilmez; Yoga kutucuğu ya da kütüphane açılınca ekran bu oturumla oynatıcıya döner
// (modul.md §4 "Bildirimden başka ekrana geçiş").
//
// Oturum alanları (YogaPlayer.jsx başındaki not): lesson, minutes, version{ file, timeline, seconds }, title, planned,
// before, startedAt, runId (yerel kaydın kimliği: lessonStart id), listened, lastPos, lastWall, maxPos, playing,
// userPaused, extPaused, pendingClose, quickClose, steps, until, jumped, started, error, tl, closeAt, sections, ended,
// finished, prelude, musicTail, writer.
let cur = null

export const currentLesson = () => cur
export function setCurrentLesson(s) {
  cur = s
  return cur
}
export function clearCurrentLesson(s = null) {
  if (!s || s === cur) cur = null
}

// Yerel kaydın kimliği (lessonStart id): uzlaştırma bu kimlikle JS'in kendi dersini tanır
export const newRunId = () => `yoga-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export function newLessonSession({
  lesson, minutes, version, title, before = null, startedAt = new Date().toISOString(), runId = null, musicTail = null,
  writer = null, started = false, listened = 0, lastPos = 0, playing = false,
}) {
  return {
    lesson, minutes, version, planned: version?.seconds ?? 0, title, before, startedAt, runId,
    listened, lastPos, lastWall: Date.now(), maxPos: lastPos, playing, userPaused: false, extPaused: false,
    pendingClose: false, quickClose: false, steps: [], until: null, jumped: true, started, error: null,
    tl: null, closeAt: null, sections: null, ended: false, finished: false, prelude: false, musicTail, writer,
  }
}

// Kapanışa ulaşıldı mı: dosya sonuna kadar çaldı ya da en ileri konum kapanışın başını geçti
export const reachedClosing = (s) => Boolean(s.finished) || (s.closeAt != null && s.maxPos >= s.closeAt)
