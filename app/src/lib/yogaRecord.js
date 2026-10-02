// Yoga ders kaydı: kurma, tamamlanma kuralı, sonradan eklenen puanlar (yoga-pilot/v3/modul.md §6.1; PLAN.v3 §D.4).
// Saf yardımcılar + küçük bir yazıcı (depo dışarıdan verilir). Tedavi değildir; puanlar kişi içi gidişattır.
//
// Kurallar:
// - 30 sn'den kısa dinleme kaydedilmez (MIN_SAVE_SEC; Dalga.jsx:20 ile aynı eşik, VARSAYIM).
// - Tamamlandı = kapanışa ulaşıldı VE planlanan sürenin en az %60'ı dinlendi (COMPLETE_SHARE, VARSAYIM; CRITIQUE #16).
// - Kayıt ses bittiği ya da durduğu anda yazılır; sonra puanı ve zorlanma cevabı sonra eklenir (store.updateSession).
// - Önce sorusu olmayan derste (Uykuya Geçiş) before/after hep null.
import { LESSONS, lessonByFile } from './yogaLessons.js'
import { dayKey } from './calendar.js'

export const SESSION_TYPE = 'yoga'
export const isYoga = (s) => s?.type === SESSION_TYPE && Number.isFinite(s.lesson)
export const isYogaDone = (s) => isYoga(s) && s.completed === true
export const MIN_SAVE_SEC = 30
export const COMPLETE_SHARE = 0.6
export const RATE_MAX = 10
export const HARD_VALUES = ['no', 'some', 'much']

// 1–10 tam sayı ya da null
export const rating = (v) => (Number.isInteger(v) && v >= 1 && v <= RATE_MAX ? v : null)
export const hardValue = (v) => (HARD_VALUES.includes(v) ? v : null)
export const hasRating = (lesson) => typeof LESSONS[lesson]?.question === 'string' && LESSONS[lesson].question.length > 0

export function isCompleted({ reachedClosing, seconds, planned }) {
  return Boolean(reachedClosing) && Number.isFinite(seconds) && Number.isFinite(planned) && planned > 0 && seconds >= COMPLETE_SHARE * planned
}

const iso = (d) => {
  const t = new Date(d ?? NaN).getTime()
  return Number.isFinite(t) ? new Date(t).toISOString() : null
}

// Ders kaydı ya da null (30 sn altı / geçersiz ders). seconds: gerçekten çalan ders süresi (duraklamalar ve uyku dersinin
// müzik kuyruğu hariç). endedAt: dersin bitiş anı; kaydın tarihi odur.
export function makeYogaRecord({
  lesson, planned, seconds, reachedClosing = false, quickClose = false, resumed = false,
  startedAt = null, endedAt = new Date(), before = null, after = null, hard = null,
  voice = null, bg = null, posture = null, scene = null, clarity = false, musicTail = null,
  planVersion = null, contentHash = null,
} = {}) {
  const L = LESSONS[lesson]
  if (!L) return null
  const sec = Math.round(Math.max(0, Number(seconds) || 0))
  if (sec < MIN_SAVE_SEC) return null
  const plannedSec = Math.round(Number(planned) || 0)
  const rated = hasRating(lesson)
  const b = rated ? rating(before) : null
  const a = rated ? rating(after) : null
  const rec = {
    type: SESSION_TYPE,
    date: iso(endedAt) ?? new Date().toISOString(),
    lesson,
    planned: plannedSec,
    seconds: sec,
    startedAt: iso(startedAt),
    voice,
    bg,
    posture: posture ?? L.posture,
    clarity: Boolean(clarity),
    reachedClosing: Boolean(reachedClosing),
    completed: isCompleted({ reachedClosing, seconds: sec, planned: plannedSec }),
    quickClose: Boolean(quickClose),
    resumed: Boolean(resumed),
    before: b,
    after: a,
    delta: b != null && a != null ? a - b : null,
    hard: hardValue(hard),
    planVersion,
    contentHash,
  }
  if (scene) rec.scene = scene
  // Uyku dersi: çalan müzik kuyruğu (dk; modul.md §6.1: 0 | 5 | 10 | 20). Kuyruk dosyası yoksa kuyruk çalamaz: 0 (yerel
  // kayıttan ya da yeniden bağlanan dersten yazılan kayıt da JS yolundaki gibi 0 yazar). Dosya varken bilinmiyorsa null.
  if (L.daypart === 'night') rec.musicTail = Number.isFinite(musicTail) ? musicTail : L.musicTailFile ? null : 0
  return rec
}

// Sonra puanı ve zorlanma cevabı için kayda eklenecek alanlar (yalnız verilenler). before kayıttan okunur.
export function afterPatch(rec, { after, hard } = {}) {
  const patch = {}
  if (after !== undefined && hasRating(rec?.lesson)) {
    const a = rating(after)
    patch.after = a
    patch.delta = a != null && Number.isFinite(rec?.before) ? a - rec.before : null
  }
  if (hard !== undefined) patch.hard = hardValue(hard)
  return patch
}

// Kaydı yazar; puanlar sonra eklenir. Depoda updateSession yoksa (eski depo) kayıt bellekte tutulur ve akışın sonunda
// (flush) tek seferde eklenir; böylece puansız ve puanlı iki kayıt oluşmaz.
export function recordWriter(store) {
  let id = null
  let pending = null
  let rec = null
  const canUpdate = () => typeof store?.updateSession === 'function'
  return {
    get record() { return rec },
    save(r) {
      if (!r || rec) return rec
      rec = r
      if (canUpdate()) id = store.addSession(r)?.id ?? null
      else pending = r
      return rec
    },
    patch(p) {
      if (!rec || !p || !Object.keys(p).length) return rec
      rec = { ...rec, ...p }
      if (id && canUpdate()) store.updateSession(id, p)
      else if (pending) pending = { ...pending, ...p }
      return rec
    },
    flush() {
      if (pending) store?.addSession?.(pending)
      pending = null
    },
  }
}

// ---- Yerel kayıt (AlarmPlugin LessonPlayer journal; lib/native.js lessonJournal) ----
// Uygulama ders sırasında kapanırsa ya da ekran dersin sonunu görmezse kayıt yerel kayıttan yazılır (modul.md §4, §6.4;
// PLAN.v3 §D.3). Yerel kayıt: { id?, file, title, state, finished, prelude, startedAt, updatedAt, endedAt?, pausedAt?,
// listened, time, maxTime, duration }; zamanlar Unix saniyesi. Kaydın tarihi dinlemenin gerçekten bittiği andır: endedAt
// (duraklatılmış ders kapanınca duraklatma anı), yoksa duraklatılmış dersin duraklatma anı, yoksa updatedAt.
const unixDate = (sec) => (Number.isFinite(sec) && sec > 0 ? new Date(sec * 1000) : null)
export const journalEndedAt = (j) => unixDate(j?.endedAt) ?? unixDate(j?.pausedAt) ?? unixDate(j?.updatedAt)

// Yerel kayıttan ders kaydı ya da null (tanınmayan dosya, 30 sn altı, giriş dosyası çalarken kapanmış). closeAt: çizelgeden
// kapanışın başı (bilinmiyorsa null: kapanışa ancak dosya sonuna kadar çaldıysa ulaşılmış sayılır). musicTail: uyku
// dersinde çalan müzik kuyruğu (dk; bilinmiyorsa null).
export function recordFromJournal(j, { closeAt = null, musicTail = null } = {}) {
  const hit = lessonByFile(j?.file)
  if (!hit || j.prelude === true) return null
  const L = LESSONS[hit.lesson]
  const v = hit.version
  const maxTime = Number.isFinite(j.maxTime) ? j.maxTime : 0
  return makeYogaRecord({
    lesson: hit.lesson,
    planned: v.seconds,
    seconds: j.listened,
    reachedClosing: j.finished === true || (Number.isFinite(closeAt) && maxTime >= closeAt),
    startedAt: unixDate(j.startedAt),
    endedAt: journalEndedAt(j) ?? new Date(),
    voice: v.voice ?? null,
    bg: v.bg ?? null,
    posture: L.posture,
    scene: v.scene ?? null,
    musicTail,
    planVersion: v.planVersion ?? null,
    contentHash: v.contentHash ?? null,
  })
}

// Bu yerel kayıt zaten yazılmış mı? Aynı ders ve başlangıcı ±10 sn (JS kaydın startedAt'i dokunuş anı, yerelinki
// oynatıcının açıldığı an). Uzlaştırma kaydı iki kez yazmasın.
export function journalWritten(sessions = [], j) {
  const hit = lessonByFile(j?.file)
  const start = unixDate(j?.startedAt)?.getTime()
  if (!hit || !Number.isFinite(start)) return false
  return sessions.some((s) => isYoga(s) && s.lesson === hit.lesson && Math.abs(new Date(s.startedAt ?? NaN).getTime() - start) <= 10000)
}

// Gelişim ve Nef için: dakika (yuvarlanmış) ve pratik yapılan farklı gün (yerel takvim günü)
export const minutesOf = (list = []) => Math.round(list.reduce((m, s) => m + (Number.isFinite(s?.seconds) ? s.seconds : 0), 0) / 60)
export const dayCount = (list = []) => new Set(list.map((s) => (iso(s?.date) ? dayKey(s.date) : null)).filter(Boolean)).size
