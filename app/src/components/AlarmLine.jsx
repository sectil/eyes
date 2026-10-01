import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlarmClock, ChevronRight, Moon, PencilLine, AlarmClockOff } from 'lucide-react'
import {
  nextRing, untilText, hhmm, minOfDay, daysLabel, dayShort, sleepMinutes, bedtimeFor, withSuffix, SLEEP_TARGET_H, WEEKDAY_LONG,
} from '../lib/alarm.js'
import { loadAlarm, loadAlarmLog, saveAlarm, addAlarmEvent } from '../lib/alarmLog.js'
import { cancelAlarm, scheduleAlarm } from '../lib/alarmNative.js'
import { getPrefs, subscribePrefs } from '../lib/prefs.js'
import { NightDial, eyebrowOf, HOUR, DIAL_H } from './AlarmCard.jsx'
import '../styles/alarm.css'

// Ana sayfa alarm satırı (Artifact "Nefona Alarm" v5): "gün seninle"nin altında, aynı sayı dili.
// Kurulu: "07:00 alarm · yarın ›"; dokununca alttan seçenekler (düzenle · uyku sesi · kapat). Kurulu değil: sönük
// "— alarm yok", dokununca kurulum. Profil → Alarm → "Ana sayfada göster" kapalıysa satır da yok.
// Kayıt açık ama telefonda (AlarmKit) alarm yok (status.missing; lib/alarmNative.js nativeMissing, sahip 2026-10-01):
// hap değil, tam genişlikte uyarı kartı (2. tur, 5 kişilik kapı): "Alarm telefonda kurulu değil" / "Yarın 06:35'te çalmaz."
// ve sağda "Yeniden kur" düğmesi (kurulum, kayıt kendi ayarıyla açılır). Yalnız düğme dokunulur (tek eylem).
const UNDO_MS = 5000

export default function AlarmLine({ status, onStart, now = new Date() }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [undo, setUndo] = useState(null) // kapatılan alarm (5 sn geri al)
  const [fail, setFail] = useState(null) // geri alma kurulamadı: gösterilecek metin
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(() => getPrefs().alarmCard)
  const [, setTick] = useState(0)
  const undoRef = useRef(null)
  const firstRef = useRef(null)
  const rowRef = useRef(null)
  const missId = useId()
  useEffect(() => subscribePrefs((p) => setShow(p.alarmCard)), [])
  useEffect(() => {
    if (!undo) return undefined
    undoRef.current?.focus()
    const t = setTimeout(() => { setUndo(null); rowRef.current?.focus() }, UNDO_MS)
    return () => clearTimeout(t)
  }, [undo])
  useEffect(() => {
    if (!fail) return undefined
    const t = setTimeout(() => setFail(false), UNDO_MS)
    return () => clearTimeout(t)
  }, [fail])
  const platform = status?.platform ?? 'web'
  const alarm = loadAlarm()
  const next = nextRing(alarm, now)
  const kind = alarm?.kind === 'notify' ? 'hatırlatma' : 'alarm'
  const sheet = open && Boolean(next) && platform !== 'web' && show
  // Açık alt sayfa: ilk düğmeye odak (onay açılıp kapanınca da), Escape kapatır, arkadaki sayfa erişilemez (inert)
  useEffect(() => {
    if (!sheet) return undefined
    firstRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    const root = globalThis.document?.getElementById?.('root') ?? null
    root?.setAttribute('inert', '')
    return () => {
      window.removeEventListener('keydown', onKey)
      root?.removeAttribute('inert')
    }
  }, [sheet, confirm])
  // Alarm sayfa açıkken geçerse (tek seferlik çaldı) sayfa kapansın
  useEffect(() => {
    if (open && !next) setOpen(false)
  }, [open, next])

  function close() {
    setOpen(false)
    setConfirm(false)
    setTimeout(() => rowRef.current?.focus(), 0)
  }
  const go = (route) => {
    close()
    onStart(route)
  }
  async function turnOff() {
    setBusy(true)
    await cancelAlarm()
    saveAlarm({ ...alarm, on: false })
    addAlarmEvent('cancel', { via: 'home' })
    setBusy(false)
    close()
    setUndo(alarm)
  }
  async function restore() {
    const a = undo
    setUndo(null)
    if (!a) return
    // Tek seferlik alarmın saati bu arada geçtiyse geri kurmak onu yarına kaydırır: kurma, söyle
    if (!a.days.length && !nextRing(a, new Date())) {
      setFail('Saati geçti. Satıra dokunup yeniden kur.')
      return
    }
    // Kendi türüyle geri kur (eski bildirim hatırlatması iOS 26'da AlarmKit izni istemesin)
    const r = await scheduleAlarm(a, a.kind === 'notify' ? 'notify' : platform)
    if (r.ok) {
      saveAlarm(a)
      addAlarmEvent('set', { hour: a.hour, minute: a.minute, days: a.days, sound: a.sound, sleep: a.sleep, wake: a.wake, kind: a.kind, undo: true, snooze: Boolean(r.snooze) })
    } else setFail('Geri alınamadı. Satıra dokunup yeniden kur.')
    setTick((t) => t + 1)
  }

  const toast = (undo || fail) && createPortal(
    <div className="al-toast al-float" role="status">
      {fail ? (
        <span className="grow">{fail}</span>
      ) : (
        <>
          <span className="grow">{undo.kind === 'notify' ? 'Hatırlatma kapatıldı.' : 'Alarm kapatıldı.'}</span>
          <button type="button" ref={undoRef} onClick={restore}>Geri al</button>
        </>
      )}
    </div>,
    document.body,
  )

  if (platform === 'web') return null
  // Kart/satır kapatılsa da "Geri al" şeridi 5 sn kalır (gövdede)
  if (!show) return toast || null
  if (next && status?.missing && alarm.kind === 'alarmkit') {
    // Gün sözcüğü sıradaki çalıştan (dayShort): bugün · yarın · gün adı
    const d = dayShort(next, now)
    const dayWord = d === 'bugün' ? 'Bugün' : d === 'yarın' ? 'Yarın' : WEEKDAY_LONG[next.getDay()]
    return (
      <>
        <div className="al-miss">
          <AlarmClockOff size={20} aria-hidden="true" className="al-miss-ic" />
          <div className="al-miss-tx">
            <b id={`${missId}t`}>Alarm telefonda kurulu değil</b>
            <span id={`${missId}s`}>{`${dayWord} ${withSuffix(minOfDay(next), 'loc')} çalmaz.`}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-sm al-miss-btn" aria-describedby={`${missId}t ${missId}s`} onClick={() => onStart('alarm')}>Yeniden kur</button>
        </div>
        {toast}
      </>
    )
  }
  if (!next) {
    return (
      <>
        <button type="button" className="hh-fact al-fact off" onClick={() => onStart('alarm')} aria-label="Alarm kurulu değil. Kur">
          <AlarmClock size={14} aria-hidden="true" className="f5" /><b>—</b>alarm yok
          <ChevronRight size={13} aria-hidden="true" className="al-fact-ar" />
        </button>
        {toast}
      </>
    )
  }

  const log = loadAlarmLog()
  const time = hhmm(minOfDay(next))
  const when = untilText(next, now)
  const bed = bedtimeFor(next, now)
  const dial = bed != null && next.getTime() - new Date(now).getTime() <= DIAL_H * HOUR
  const sleepMin = sleepMinutes(alarm, log, now)
  const day = dayShort(next, now)

  return (
    <>
      <button type="button" ref={rowRef} className="hh-fact al-fact" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${kind === 'alarm' ? 'Alarm' : 'Hatırlatma'} ${time}, ${when}. Seçenekler`}>
        <AlarmClock size={14} aria-hidden="true" className="f5" /><b>{time}</b>{`${kind} · ${day}`}
        <ChevronRight size={13} aria-hidden="true" className="al-fact-ar" />
      </button>
      {toast}
      {sheet && createPortal(
        <div className="al-sh-back" role="presentation" onClick={() => !busy && close()}>
          <div className="al-sh" role="dialog" aria-modal="true" aria-labelledby="al-sh-t" onClick={(e) => e.stopPropagation()}>
            <span className="al-sh-grab" aria-hidden="true" />
            <div className="al-sh-top">
              <div className="al-num">
                <span className="al-ey">{eyebrowOf(alarm.kind, next)}</span>
                <b id="al-sh-t">{time}</b>
                <span className="al-lbl">{when}<br />{daysLabel(alarm.days)}</span>
              </div>
              {dial && <NightDial bed={new Date(next.getTime() - SLEEP_TARGET_H * HOUR)} ring={next} now={new Date(now)} />}
            </div>
            {confirm ? (
              <div className="al-sh-confirm" role="alert">
                <p>{`${kind === 'alarm' ? 'Alarm' : 'Hatırlatma'} kapatılsın mı? ${
                  alarm.days.length
                    ? `${daysLabel(alarm.days)} ${time} ${kind === 'alarm' ? 'alarmı artık çalmaz' : 'hatırlatması artık gelmez'}.`
                    : `${day === 'bugün' ? 'Bugün' : day === 'yarın' ? 'Yarın' : 'Artık'} ${withSuffix(minOfDay(next), 'loc')} çalmaz.`
                }`}</p>
                <div className="al-btns">
                  <button type="button" className="btn btn-secondary btn-sm" ref={firstRef} disabled={busy} onClick={() => setConfirm(false)}>Vazgeç</button>
                  <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={turnOff}>Kapat</button>
                </div>
              </div>
            ) : (
              <>
                <div className="al-sh-rows">
                  <button type="button" ref={firstRef} onClick={() => go('alarm')}>
                    <PencilLine size={17} aria-hidden="true" /><span className="grow">{kind === 'alarm' ? 'Alarmı düzenle' : 'Hatırlatmayı düzenle'}</span><span className="al-sh-v">saat, günler, ses</span>
                  </button>
                  {alarm.sleep !== 'off' && (
                    <button type="button" onClick={() => go('alarm-sleep')}>
                      <Moon size={17} aria-hidden="true" /><span className="grow">Uyku sesini başlat</span>
                      <span className="al-sh-v">{sleepMin > 0 ? `${alarm.sleep === 'auto' ? 'Sana göre ' : ''}${sleepMin} dk` : 'Bu gece yok'}</span>
                    </button>
                  )}
                  <button type="button" className="danger" onClick={() => setConfirm(true)}>
                    <AlarmClockOff size={17} aria-hidden="true" /><span className="grow">{kind === 'alarm' ? 'Alarmı kapat' : 'Hatırlatmayı kapat'}</span>
                  </button>
                </div>
                {alarm.kind === 'notify' && (
                  <p className="al-warn">
                    {platform === 'notify' ? 'Bu telefonda gerçek alarm yok (iOS 26 gerekir); sessiz modda ses çıkmaz.' : 'Bu bir bildirim hatırlatması; sessiz modda ses çıkmaz. Yeniden kurarsan gerçek alarm olur.'}
                  </p>
                )}
                {bed && <p className="al-foot">{`${SLEEP_TARGET_H} saat uyku için en geç ${withSuffix(minOfDay(bed), 'loc')} yatakta ol.`}</p>}
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
