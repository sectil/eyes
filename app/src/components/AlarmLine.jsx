import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlarmClock, ChevronRight, Moon, PencilLine, AlarmClockOff } from 'lucide-react'
import {
  nextRing, untilText, hhmm, minOfDay, daysLabel, dayShort, sleepMinutes, bedtimeFor, withSuffix, SLEEP_TARGET_H,
} from '../lib/alarm.js'
import { loadAlarm, loadAlarmLog, saveAlarm, addAlarmEvent } from '../lib/alarmLog.js'
import { cancelAlarm, scheduleAlarm } from '../lib/alarmNative.js'
import { getPrefs, subscribePrefs } from '../lib/prefs.js'
import { NightDial, eyebrowOf, HOUR, DIAL_H } from './AlarmCard.jsx'
import '../styles/alarm.css'

// Ana sayfa alarm satırı (Artifact "Nefona Alarm" v5): "gün seninle"nin altında, aynı sayı dili.
// Kurulu: "07:00 alarm · yarın ›"; dokununca alttan seçenekler (düzenle · uyku sesi · kapat). Kurulu değil: sönük
// "— alarm yok", dokununca kurulum. Profil → Alarm → "Ana sayfada göster" kapalıysa satır da yok.
const UNDO_MS = 5000

export default function AlarmLine({ status, onStart, now = new Date() }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [undo, setUndo] = useState(null) // kapatılan alarm (5 sn geri al)
  const [fail, setFail] = useState(false) // geri alma kurulamadı
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(() => getPrefs().alarmCard)
  const [, setTick] = useState(0)
  const undoRef = useRef(null)
  const firstRef = useRef(null)
  useEffect(() => subscribePrefs((p) => setShow(p.alarmCard)), [])
  useEffect(() => {
    if (!undo) return undefined
    undoRef.current?.focus()
    const t = setTimeout(() => setUndo(null), UNDO_MS)
    return () => clearTimeout(t)
  }, [undo])
  useEffect(() => {
    if (!fail) return undefined
    const t = setTimeout(() => setFail(false), UNDO_MS)
    return () => clearTimeout(t)
  }, [fail])
  useEffect(() => {
    if (!open) return undefined
    firstRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const platform = status?.platform ?? 'web'
  if (platform === 'web' || !show) return null

  const alarm = loadAlarm()
  const next = nextRing(alarm, now)
  const kind = alarm?.kind === 'notify' ? 'hatırlatma' : 'alarm'
  function close() {
    setOpen(false)
    setConfirm(false)
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
    const r = await scheduleAlarm(a, platform)
    if (r.ok) {
      saveAlarm(a)
      addAlarmEvent('set', { hour: a.hour, minute: a.minute, days: a.days, sound: a.sound, sleep: a.sleep, wake: a.wake, kind: a.kind, undo: true, snooze: Boolean(r.snooze) })
    } else setFail(true)
    setTick((t) => t + 1)
  }

  const toast = (undo || fail) && createPortal(
    <div className="al-toast al-float" role="status">
      {fail ? (
        <span className="grow">Geri alınamadı. Satıra dokunup yeniden kur.</span>
      ) : (
        <>
          <span className="grow">{undo.kind === 'notify' ? 'Hatırlatma kapatıldı.' : 'Alarm kapatıldı.'}</span>
          <button type="button" ref={undoRef} onClick={restore}>Geri al</button>
        </>
      )}
    </div>,
    document.body,
  )

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
      <button type="button" className="hh-fact al-fact" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${kind === 'alarm' ? 'Alarm' : 'Hatırlatma'} ${time}, ${when}. Seçenekler`}>
        <AlarmClock size={14} aria-hidden="true" className="f5" /><b>{time}</b>{`${kind} · ${day}`}
        <ChevronRight size={13} aria-hidden="true" className="al-fact-ar" />
      </button>
      {toast}
      {open && createPortal(
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
                <p>{`${kind === 'alarm' ? 'Alarm' : 'Hatırlatma'} kapatılsın mı? ${day === 'bugün' ? 'Bugün' : day === 'yarın' ? 'Yarın' : 'Artık'} ${withSuffix(minOfDay(next), 'loc')} çalmaz.`}</p>
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
                  <button type="button" className="danger" onClick={() => { setConfirm(true); setTimeout(() => firstRef.current?.focus(), 0) }}>
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
