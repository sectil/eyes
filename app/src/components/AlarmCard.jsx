import { useState } from 'react'
import { Moon, ChevronRight, Ellipsis } from 'lucide-react'
import {
  eveningCard, morningCard, nextRing, ringLabel, untilText, setupDefaults, buildAlarm, hhmm, withSuffix, latency, nextLatency,
  bedtimeFor, minOfDay, daysLabel, sleepMinutes, SLEEP_TARGET_H,
} from '../lib/alarm.js'
import { loadAlarm, loadAlarmLog, addAlarmEvent, saveAlarm } from '../lib/alarmLog.js'
import { DEFAULT_SOUND } from '../lib/alarmSounds.js'
import { scheduleAlarm } from '../lib/alarmNative.js'
import { getPrefs, setPrefs } from '../lib/prefs.js'
import '../styles/alarm.css'

// Ana sayfa alarm kartı (Artifact "Nefona Alarm" v4, onaylı 28 Eylül: https://claude.ai/artifact/GJU5G7RieTuyNTUbezJn8d).
// "Bugünün yolu"nun altında; Profil → Alarm "Ana sayfada göster" (prefs.alarmCard) ya da ⋯ → "Ana sayfadan kaldır".
// Kart gizliyken alarm yine çalar; akşam sorusu ve sabah kartı da çıkmaz. Tek kart, hallerine göre:
//  sabah: "Uyanınca" (1 dk nefes / Dalga / gün ışığı), sonra "Ses bittiğinde uyumuş muydun?"
//  kurulu: saat (Ana sayfanın sayı dili), gece kadranı (yatma → alarm, nokta şimdi), uyku sesi satırı, yatma saati
//  akşam (19.00, test derlemesinde 14.00), alarm yoksa: "Yarın sabah · Alarm kurayım mı?"
//  gün içinde alarm yoksa: tek satır "Kurulu değil · Kur"
// status: { platform: 'alarmkit'|'notify'|'web', auth } (App: lib/alarmNative.js alarmStatus). Web'de kart yok.
const ANSWERS = [
  { id: 'yes', label: 'Evet' },
  { id: 'no', label: 'Hayır' },
  { id: 'early', label: 'Çok önce' },
]
const DENIED = {
  alarmkit: { eyebrow: 'Alarm izni kapalı', path: 'Ayarlar → Nefona → Alarmlar' },
  notify: { eyebrow: 'Bildirim izni kapalı', path: 'Ayarlar → Nefona → Bildirimler' },
}
const WAKE_TITLE = { breath: 'Bir dakika nefes, sonra güne başla', dalga: 'Güne bir Dalga ile başla', light: 'Perdeyi aç, gün ışığı al' }
const WAKE_GO = { breath: 'Başla · 1 dk', dalga: 'Başla', light: 'Açtım' }
const HOUR = 3600000

// Gece kadranı: 12 saatlik; vurgu yayı yatma saatinden alarma, altın nokta şimdi (günün diyaframının gece karşılığı)
const C = 34, R = 27
const deg = (d) => (((d.getHours() % 12) + d.getMinutes() / 60) / 12) * 360
const at = (a, r = R) => {
  const t = ((a - 90) * Math.PI) / 180
  return [C + r * Math.cos(t), C + r * Math.sin(t)]
}
export function NightDial({ bed, ring, now }) {
  const a0 = deg(bed), a1 = deg(ring)
  const span = (((a1 - a0) % 360) + 360) % 360
  const [x0, y0] = at(a0), [x1, y1] = at(a1), [nx, ny] = at(deg(now))
  return (
    <svg className="al-dial" viewBox="0 0 68 68" aria-hidden="true">
      <circle cx={C} cy={C} r={R} className="trk" />
      {Array.from({ length: 12 }, (_, i) => {
        const [ax, ay] = at(i * 30, 31), [bx, by] = at(i * 30, 33)
        return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} className="tk" />
      })}
      {span > 0 && <path d={`M${x0} ${y0} A${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${x1} ${y1}`} className="slp" />}
      <circle cx={nx} cy={ny} r="3.2" className="now" />
      <path d="M36.2 27.4a7 7 0 1 0 5 11.2 5.6 5.6 0 0 1-5-11.2z" className="moon" transform="translate(-1.8 -0.6)" />
    </svg>
  )
}

function Shell({ eyebrow, label, menu, children }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="card al-wg" aria-label={label ?? eyebrow}>
      <div className="al-wg-top">
        <span className="al-ey">{eyebrow}</span>
        {menu && (
          <button type="button" className="al-more" aria-label="Alarm seçenekleri" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <Ellipsis size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {children}
      {open && menu && (
        <div className="al-menu" role="menu">
          {menu.map((m) => (
            <button key={m.label} type="button" role="menuitem" className={m.danger ? 'danger' : ''} onClick={() => { setOpen(false); m.onClick() }}>{m.label}</button>
          ))}
        </div>
      )}
    </section>
  )
}

export default function AlarmCard({ status, sessions = [], test = false, onStart, now = new Date() }) {
  const [, setTick] = useState(0)
  const [thanks, setThanks] = useState(null) // sabah cevabından sonra: yeni "Sana göre" süresi (dk)
  const [askOff, setAskOff] = useState(false) // "Sorma" dendi: bir kez bilgi
  const [removed, setRemoved] = useState(false) // "Ana sayfadan kaldır" sonrası geri al şeridi
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const bump = () => setTick((t) => t + 1)
  const platform = status?.platform ?? 'web'
  if (platform === 'web') return null

  if (removed) {
    return (
      <div className="al-toast" role="status">
        <span className="grow">{"Alarm kartı kaldırıldı. Profil → Alarm'dan geri eklersin; alarm yine çalar."}</span>
        <button type="button" onClick={() => { setPrefs({ alarmCard: true }); setRemoved(false) }}>Geri al</button>
      </div>
    )
  }
  if (!getPrefs().alarmCard) return null

  const alarm = loadAlarm()
  const log = loadAlarmLog()
  const notify = platform === 'notify'
  const liveNext = nextRing(alarm, now)
  const hide = () => { setPrefs({ alarmCard: false }); setRemoved(true) }
  const menu = [
    { label: liveNext ? 'Alarmı değiştir' : 'Alarm kur', onClick: () => onStart('alarm') },
    ...(liveNext && alarm.sleep !== 'off' ? [{ label: 'Uyku sesi', onClick: () => onStart('alarm-sleep') }] : []),
    { label: 'Ana sayfadan kaldır', danger: true, onClick: hide },
  ]

  if (thanks != null) {
    return (
      <Shell eyebrow="Kaydedildi" label="Uyku sesi">
        <p className="al-q">{`"Sana göre" süren artık ${thanks} dk.`}</p>
        <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => setThanks(null)}>Tamam</button></div>
      </Shell>
    )
  }
  if (askOff) {
    return (
      <Shell eyebrow="Tamam" label="Akşam sorusu">
        <p className="al-sub">{'Akşamları sormayacağım. Kart burada kalır; alarmı istediğinde "Kur"a dokun.'}</p>
        <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => setAskOff(false)}>Tamam</button></div>
      </Shell>
    )
  }

  const m = morningCard({ now, alarm, log, sessions })
  if (m?.kind === 'wake') {
    const go = () => {
      if (m.action !== 'light') return onStart(m.action === 'breath' ? 'breath-1' : 'dalga')
      addAlarmEvent('wakeDone', { ring: m.ring.toISOString(), action: 'light' })
      bump()
    }
    return (
      <Shell eyebrow={`Günaydın · ${hhmm(minOfDay(new Date(now)))}`} label="Günaydın" menu={menu}>
        <p className="al-q">{WAKE_TITLE[m.action]}</p>
        <div className="al-btns">
          <button type="button" className="btn btn-sm" onClick={go}>{WAKE_GO[m.action]}</button>
          <button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => { addAlarmEvent('wakeSkip', { ring: m.ring.toISOString() }); bump() }}>Şimdi değil</button>
        </div>
      </Shell>
    )
  }
  if (m?.kind === 'question') {
    const answer = (id) => {
      const before = latency(log)
      const after = nextLatency(before, id)
      addAlarmEvent('morning', { answer: id, ring: m.ring.toISOString(), before, after })
      setThanks(after)
    }
    return (
      <Shell eyebrow="Uyku sesi · tek soru" menu={menu}>
        <p className="al-q">Ses bittiğinde uyumuş muydun?</p>
        <div className="al-btns" role="group" aria-label="Cevap">
          {ANSWERS.map((a) => <button key={a.id} type="button" className="btn btn-secondary btn-sm" onClick={() => answer(a.id)}>{a.label}</button>)}
        </div>
        <p className="al-sub">&quot;Hayır&quot; dersen bu geceki süre 5 dakika uzar, &quot;Çok önce&quot; dersen kısalır.</p>
      </Shell>
    )
  }

  if (liveNext) {
    const soon = liveNext.getTime() - new Date(now).getTime() <= 24 * HOUR
    const bed = bedtimeFor(liveNext, now)
    const sleepMin = sleepMinutes(alarm, log, now)
    const when = untilText(liveNext, now)
    return (
      <Shell eyebrow={notify ? 'Sabah · hatırlatma' : 'Sabah · alarm'} menu={menu}>
        <button type="button" className="al-main" onClick={() => onStart('alarm')} aria-label={`Alarm ${ringLabel(liveNext, now)}, ${when}. Değiştir`}>
          <span className="al-num">
            <b>{hhmm(minOfDay(liveNext))}</b>
            <span className="al-lbl">{soon ? when : `${ringLabel(liveNext, now).split(' ')[0]} · ${when}`}<br />{daysLabel(alarm.days)}</span>
          </span>
          {soon && <NightDial bed={new Date(liveNext.getTime() - SLEEP_TARGET_H * HOUR)} ring={liveNext} now={new Date(now)} />}
        </button>
        {alarm.sleep !== 'off' && (
          <button type="button" className="al-row" onClick={() => onStart('alarm-sleep')}>
            <Moon size={15} aria-hidden="true" />
            <span className="grow"><b>Uyku sesi</b></span>
            <span className="al-row-val">{`${alarm.sleep === 'auto' ? 'Sana göre ' : ''}${sleepMin > 0 ? `${sleepMin} dk` : 'bu gece yok'}`}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
        {notify && <p className="al-warn">Bu telefonda gerçek alarm yok (iOS 26 gerekir); sessiz modda ses çıkmaz.</p>}
        {bed && <p className="al-foot">{`${SLEEP_TARGET_H} saat uyku için en geç ${withSuffix(minOfDay(bed), 'loc')} yatakta ol`}</p>}
      </Shell>
    )
  }

  const c = eveningCard({ now, alarm, log, platform, auth: status?.auth, test })
  if (c?.kind === 'pref') {
    const pick = (show) => {
      addAlarmEvent('cardPref', { show })
      if (!show) setAskOff(true)
      bump()
    }
    return (
      <Shell eyebrow="Bir kez soruyoruz" menu={menu}>
        <p className="al-q">Akşamları alarmı sorayım mı?</p>
        <div className="al-btns">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => pick(true)}>Sor</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => pick(false)}>Sorma</button>
        </div>
      </Shell>
    )
  }
  if (c?.kind === 'denied') {
    const d = DENIED[c.via] ?? DENIED.alarmkit
    return (
      <Shell eyebrow={d.eyebrow} menu={menu}>
        <p className="al-q">{d.path}</p>
        <p className="al-sub">İzin verince kart yeniden &quot;Yarın sabah&quot; olur.</p>
        <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => { addAlarmEvent('dismiss', { reason: 'denied' }); bump() }}>Tamam</button></div>
      </Shell>
    )
  }
  const dismiss = () => {
    addAlarmEvent('dismiss')
    bump()
  }
  if (c?.kind === 'ask' || c?.kind === 'askNotify') {
    const d = setupDefaults({ log, now, defaultSound: DEFAULT_SOUND })
    if (c.kind === 'ask') {
      return (
        <Shell eyebrow="Yarın sabah" menu={menu}>
          <p className="al-q">Alarm kurayım mı?</p>
          <div className="al-btns">
            <button type="button" className="btn btn-sm" onClick={() => onStart('alarm')}>{`Evet · ${hhmm(d.time)}`}</button>
            <button type="button" className="btn btn-secondary btn-sm al-fit" onClick={dismiss}>Bu akşam değil</button>
          </div>
        </Shell>
      )
    }
    // iOS 26 öncesi: tek dokunuş, YALNIZ YARIN (kart "Yarın sabah" diyor); günlü hatırlatma ⋯ → "Alarm kur"dan
    const setNow = async () => {
      setBusy(true)
      setErr(null)
      const cfg = buildAlarm({ ...d, days: [], kind: 'notify' }, new Date())
      const r = await scheduleAlarm(cfg, 'notify')
      setBusy(false)
      if (!r.ok) {
        setErr(r.reason === 'denied' ? 'Bildirim izni kapalı: Ayarlar → Nefona → Bildirimler.' : 'Kurulamadı. Yeniden dene.')
        return
      }
      saveAlarm(cfg)
      addAlarmEvent('set', { hour: cfg.hour, minute: cfg.minute, days: [], sound: cfg.sound, sleep: cfg.sleep, wake: cfg.wake, kind: 'notify', suggested: d.times.map(hhmm), picked: 'suggest', daysChanged: true, via: 'card', snooze: false })
      bump()
    }
    return (
      <Shell eyebrow="Yarın sabah · hatırlatma" menu={menu}>
        <p className="al-q">{`${withSuffix(d.time, 'loc')} hatırlatayım mı?`}</p>
        <p className="al-warn">Bu telefonda gerçek alarm yok (iOS 26 gerekir). Bildirim olarak gelir; sessiz modda ses çıkmaz.</p>
        {err && <p className="al-err" role="alert">{err}</p>}
        <div className="al-btns">
          <button type="button" className="btn btn-sm" disabled={busy} onClick={setNow}>{`${withSuffix(d.time, 'dat')} kur`}</button>
          <button type="button" className="btn btn-secondary btn-sm al-fit" onClick={dismiss}>Bu akşam değil</button>
        </div>
      </Shell>
    )
  }

  // Gün içinde (ya da akşam sorusu kapandıysa) alarm yok: tek satır
  return (
    <Shell eyebrow={notify ? 'Sabah · hatırlatma' : 'Sabah · alarm'} menu={menu}>
      <div className="al-line">
        <span className="grow">Kurulu değil</span>
        <button type="button" className="al-pill" onClick={() => onStart('alarm')}>Kur</button>
      </div>
    </Shell>
  )
}
