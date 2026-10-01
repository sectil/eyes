import { useEffect, useState } from 'react'
import { store as appStore } from '../lib/storage.js'
import { isIOSApp } from '../lib/native.js'
import { dayKey } from '../lib/calendar.js'
import { morningCard } from '../lib/alarm.js'
import { loadAlarm, loadAlarmLog } from '../lib/alarmLog.js'
import { getPrefs } from '../lib/prefs.js'
import { PATH_YOGA } from '../lib/yoga.js'
import { LESSONS } from '../lib/yogaLessons.js'
import { isYoga, MIN_SAVE_SEC, rating } from '../lib/yogaRecord.js'
import { loadYogaOpts, saveYogaOpts } from '../modules/yoga/opts.js'
import '../styles/alarm.css'
import '../styles/yogaMorning.css'

// Ana sayfa · Uykuya Geçiş'ten sonraki sabah sorusu (yoga-pilot/v3/modul.md §2.11, §9; PLAN.v3 §D.5).
// "Dün gece uykuya dalmak ne kadar kolaydı?" · 1–10 · "Atla". Cevap o gecenin ders kaydına eklenir
// (store.updateSession(kayıt.id, { sleepEase })); ayrı kayıt türü açılmaz, yoksa soruyu cevaplamak "yoga yapılan gün"
// sayılırdı. Metrik ("Uykuya dalma kolaylığı (ertesi sabah)", İyi oluş) kaydın kendisinden okunur (yoga manifesti).
// Uygulama "uyutur" demez; puan kişinin kendi değerlendirmesidir. Cevap Nef'e gitmez (Nef'e yalnız dört sayı gider).
//
// Kurallar (§9):
//  - Yalnız Uykuya Geçiş dersi, kaydı olan (≥ 30 sn).
//  - Ders 18.00–05.59 arasında başlamış olmalı (VARSAYIM). 18.00–23.59 → ertesi takvim günü; 00.00–05.59 → aynı gün.
//  - O sabah 04.00–11.59 arasında; 12.00'de kendiliğinden kalkar, o gecenin değeri boş kalır.
//  - Alarmın sabah kartı ("Uyanınca" ya da "Ses bittiğinde uyumuş muydun?") bekliyorsa önce o; iki soru aynı anda
//    görünmez. Alarm kartı Ana sayfadan kaldırılmışsa (prefs.alarmCard) beklenmez.
//  - O geceye düşen en son kayıt sorulur; cevaplanmışsa ya da "Atla" dendiyse (morningSkipped) kart yok.
//  - Yalnız iPhone uygulamasında (web'de yoga yok, PLAN.v3 §D.7); Home ayrıca denetler.

export const NIGHT_FROM_HOUR = 18 // ders bu saatten sonra başlamışsa "gece"
export const NIGHT_TO_HOUR = 6 // … ya da bu saatten önce
export const MORNING_FROM_HOUR = 4 // 02.00'de telefona bakana "dün gece" diye sorulmasın (VARSAYIM)
export const MORNING_TO_HOUR = 12 // PLAN.v2
export const SKIPPED_MAX = 30 // "Atla" listesi (yoga-opts) bundan uzun tutulmaz
const POLL_MS = 30000

export const MORNING_TEXT = {
  question: 'Dün gece uykuya dalmak ne kadar kolaydı?',
  low: '1 · çok zor',
  high: '10 · çok kolay',
  skip: 'Atla',
  saved: 'Kaydedildi.',
  ok: 'Tamam',
}
const eyebrow = () => `${LESSONS[PATH_YOGA.sleepLesson]?.title ?? 'Yoga'} · tek soru`

const timeOf = (v) => {
  const t = new Date(v ?? NaN).getTime()
  return Number.isFinite(t) ? t : null
}
// Dersin başladığı an: startedAt; yoksa bitiş anı (date) − dinlenen süre
export function startOf(s) {
  const st = timeOf(s?.startedAt)
  if (st != null) return st
  const end = timeOf(s?.date)
  return end != null && Number.isFinite(s?.seconds) ? end - s.seconds * 1000 : null
}
// Gecenin sabahı (YYYY-MM-DD, yerel takvim) ya da null (gündüz başlamış ders)
export function morningKeyOf(start) {
  if (start == null) return null
  const d = new Date(start)
  if (!Number.isFinite(d.getTime())) return null
  const h = d.getHours()
  if (h >= NIGHT_FROM_HOUR) return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 12))
  if (h < NIGHT_TO_HOUR) return dayKey(d)
  return null
}

// Bu sabah sorulacak kayıt: o gecenin en son Uykuya Geçiş kaydı; saat, cevap ve "Atla" denetiminden önce
export function nightRecord(sessions = [], now = new Date()) {
  const t = timeOf(now)
  if (t == null) return null
  const today = dayKey(t)
  return (Array.isArray(sessions) ? sessions : [])
    .filter((s) => isYoga(s) && s.lesson === PATH_YOGA.sleepLesson && typeof s.id === 'string' && Number(s.seconds) >= MIN_SAVE_SEC)
    .map((s) => ({ s, start: startOf(s) }))
    .filter((x) => x.start != null && x.start <= t && morningKeyOf(x.start) === today)
    .sort((a, b) => a.start - b.start)
    .at(-1)?.s ?? null
}

// Kart şimdi çıkar mı? null | kayıt. alarmFirst: alarmın sabah kartı bekliyor (alarmMorningPending)
export function yogaMorningDue({ sessions = [], now = new Date(), skipped = [], alarmFirst = false } = {}) {
  const t = timeOf(now)
  if (t == null) return null
  const h = new Date(t).getHours()
  if (h < MORNING_FROM_HOUR || h >= MORNING_TO_HOUR) return null
  const rec = nightRecord(sessions, t)
  if (!rec || Number.isFinite(rec.sleepEase) || skipped.includes(rec.id)) return null
  return alarmFirst ? null : rec
}

// Alarmın sabah kartı (components/AlarmCard.jsx: "Uyanınca" ya da "Ses bittiğinde uyumuş muydun?") şu an bekliyor mu?
// Kart Ana sayfadan kaldırılmışsa (prefs.alarmCard false) soru hiç görünmez; yoga sorusu onu beklemez.
export function alarmMorningPending({ now = new Date(), sessions = [], alarm, log, cardOn } = {}) {
  try {
    if (!(cardOn ?? getPrefs().alarmCard)) return false
    return morningCard({ now, alarm: alarm === undefined ? loadAlarm() : alarm, log: log ?? loadAlarmLog(), sessions }) != null
  } catch {
    return false
  }
}

// "Atla": kaydın kimliği yoga tercihlerine (gozolcum:yoga-opts morningSkipped); kart o sabah yeniden çıkmaz
export function skipMorning(id, storage) {
  const list = loadYogaOpts(storage).morningSkipped.filter((x) => x !== id)
  return saveYogaOpts({ morningSkipped: [...list, id].slice(-SKIPPED_MAX) }, storage)
}

// Cevabı o gecenin kaydına yazar; güncellenen kayıt ya da null (geçersiz puan, kayıt yok)
export function saveSleepEase(store, id, value) {
  const v = rating(value)
  if (v == null || typeof store?.updateSession !== 'function') return null
  return store.updateSession(id, { sleepEase: v })
}

// sessions, now: Home. onSaved: cevap kayda yazılınca (App kayıtları yeniler). store: deneme için (varsayılan uygulamanın
// deposu). alarmStatus Home'dan gelir ama kullanılmaz: açılışta 'web' yer tutucusuyla gelir; alarm kartının görünüp
// görünmeyeceği veriden (alarm, günlük, prefs) anlaşılır, böylece iki soru kısa bir an bile aynı anda görünmez.
export default function YogaMorningCard({ sessions = [], now = new Date(), onSaved, store = appStore }) {
  const [clock, setClock] = useState(null) // Home yeniden çizmese de saat ilerlesin (12.00, alarm cevabı)
  const [done, setDone] = useState(null) // 'saved' | 'hidden'
  const [skipped, setSkipped] = useState(() => loadYogaOpts().morningSkipped)
  const at = clock && clock > now ? clock : now
  const candidate = done ? null : nightRecord(sessions, at)
  // Bu sabah sorulacak bir kayıt var (saat 04.00'ı ya da alarm cevabını bekliyor olabilir); 12.00'den sonra yok
  const open = Boolean(candidate && !Number.isFinite(candidate.sleepEase) && !skipped.includes(candidate.id) && new Date(at).getHours() < MORNING_TO_HOUR)

  useEffect(() => {
    if (!open) return undefined
    const id = setInterval(() => setClock(new Date()), POLL_MS)
    return () => clearInterval(id)
  }, [open])

  if (!isIOSApp()) return null
  if (done === 'saved') {
    return (
      <section className="card al-wg ym" aria-label={eyebrow()} role="status">
        <div className="al-wg-top"><span className="al-ey">{eyebrow()}</span></div>
        <p className="al-sub">{MORNING_TEXT.saved}</p>
        <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => setDone('hidden')}>{MORNING_TEXT.ok}</button></div>
      </section>
    )
  }
  if (!open) return null
  const rec = yogaMorningDue({ sessions, now: at, skipped, alarmFirst: alarmMorningPending({ now: at, sessions }) })
  if (!rec) return null

  const answer = (v) => {
    const saved = saveSleepEase(store, rec.id, v)
    setDone(saved ? 'saved' : 'hidden')
    if (saved) onSaved?.(saved)
  }
  const skip = () => {
    setSkipped(skipMorning(rec.id).morningSkipped)
    setDone('hidden')
  }
  return (
    <section className="card al-wg ym" aria-label={eyebrow()}>
      <div className="al-wg-top"><span className="al-ey">{eyebrow()}</span></div>
      <p className="al-q" id="ym-q">{MORNING_TEXT.question}</p>
      <div className="ym-scale" role="group" aria-labelledby="ym-q" aria-describedby="ym-ends">
        {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => (
          <button key={v} type="button" onClick={() => answer(v)}>{v}</button>
        ))}
      </div>
      <p className="ym-ends" id="ym-ends"><span>{MORNING_TEXT.low}</span> <span>{MORNING_TEXT.high}</span></p>
      <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={skip}>{MORNING_TEXT.skip}</button></div>
    </section>
  )
}
