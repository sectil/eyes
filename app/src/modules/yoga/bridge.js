// Ders oynatıcısının yerel köprüsü (lib/native.js; iOS: AlarmPlugin'e eklenen ders sınıfı, PLAN.v3 §D.3).
// Sözleşme: lessonStart({ file, at, title, id?, journal?, sections?, resume?, next?, tail? }), lessonPause(),
// lessonResume({ at }), lessonSeek({ at }), lessonCrossTo({ file, at }) (2 sn'lik geçiş), lessonStop(),
// lessonMeta({ file, sections, resume }), lessonStatus() → { time, duration, playing, route, state?, reason?,
// listened?, file?, prelude?, pausedAt? (duraklatma anı, Unix sn) }, lessonJournal() / lessonJournalClear() (yerel
// kayıt; uzlaştırma: journal.js).
// state alanı yoksa (eski derleme) oynatıcı eski tahmine döner (YogaPlayer.applyStatus).
// Köprü bu derlemede yoksa (eski iOS derlemesi) çağrı UNAVAILABLE ile reddedilir; ekran "Ses açılamadı" der. Web'de
// yoga hiç görünmez (manifest home / today).
import * as native from '../../lib/native.js'

const fn = (name) => (typeof native[name] === 'function' ? native[name] : null)
export const hasLessonBridge = () => Boolean(fn('lessonStart') && fn('lessonStatus'))

async function call(name, arg) {
  const f = fn(name)
  if (!f) {
    const e = new Error('Ders oynatıcısı bu derlemede yok')
    e.code = 'UNAVAILABLE'
    throw e
  }
  return arg === undefined ? f() : f(arg)
}

// Yerel durumlar (AlarmPlugin LessonPlayer.State). LIVE: yerel oturum açık (ders sürüyor ya da sönüyor).
export const LIVE_STATES = ['playing', 'paused', 'stopping']
const str = (v) => (typeof v === 'string' && v ? v : null)
const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

export const lesson = {
  // Yalnız verilen alanlar gider (eski derleme bilmediği alanı yok sayar)
  start: ({ file, at = 0, title, id, journal, sections, resume, next, tail }) =>
    call('lessonStart', defined({ file, at, title, id, journal, sections, resume, next, tail })),
  pause: () => call('lessonPause'),
  resume: ({ at }) => call('lessonResume', { at }),
  seek: ({ at }) => call('lessonSeek', { at }),
  crossTo: ({ file, at }) => call('lessonCrossTo', { file, at }),
  stop: () => call('lessonStop'),
  // Çizelge yüklenince: kilit ekranında bölüm adı, kilitten ve kesintiden sürdürünce klip başı
  meta: ({ file, sections, resume }) => call('lessonMeta', defined({ file, sections, resume })),
  async status() {
    const s = await call('lessonStatus')
    return {
      time: Number.isFinite(s?.time) ? s.time : 0,
      duration: Number.isFinite(s?.duration) ? s.duration : null,
      playing: Boolean(s?.playing),
      route: typeof s?.route === 'string' ? s.route : null,
      state: str(s?.state), // null: eski derleme
      reason: str(s?.reason),
      listened: Number.isFinite(s?.listened) ? s.listened : null,
      file: str(s?.file),
      prelude: s?.prelude === true,
      pausedAt: Number.isFinite(s?.pausedAt) && s.pausedAt > 0 ? s.pausedAt : null, // yalnız duraklatılmışken
    }
  },
  // Yerel kayıt ya da null (web, eski derleme, kayıt yok). lib/native.js hata atmaz.
  async journal() {
    const f = fn('lessonJournal')
    if (!f) return null
    try {
      return (await f()) ?? null
    } catch {
      return null
    }
  },
  async journalClear() {
    const f = fn('lessonJournalClear')
    if (!f) return false
    try {
      return Boolean(await f())
    } catch {
      return false
    }
  },
}

// Oynatıcı hiç açılamıyorsa (derlemede yok, dosya pakette yok) "yeniden dene" işe yaramaz
export const HOPELESS = ['UNAVAILABLE', 'UNIMPLEMENTED', 'MISSING']
export const hopeless = (e) => HOPELESS.includes(e?.code)

// Dalga'nın uyku sesi çalıyor mu? (ders ayrıntısında "Çalan uyku sesi duracak." satırı; AlarmPlugin.sleepStatus)
export async function sleepSoundPlaying() {
  if (!native.isIOSApp?.()) return false
  try {
    const s = await native.Alarm?.sleepStatus?.()
    return Boolean(s?.playing)
  } catch {
    return false
  }
}
