import { useState } from 'react'
import { AlarmClock, Moon, Sun } from 'lucide-react'
import { eveningCard, morningCard, ringLabel, untilText, setupDefaults, buildAlarm, hhmm, withSuffix, latency, nextLatency } from '../lib/alarm.js'
import { loadAlarm, loadAlarmLog, addAlarmEvent, saveAlarm } from '../lib/alarmLog.js'
import { soundById, DEFAULT_SOUND } from '../lib/alarmSounds.js'
import { scheduleAlarm } from '../lib/alarmNative.js'
import '../styles/alarm.css'

// Ana sayfa alarm kartı (Artifact "Nefona Alarm" v3, ekran 1, 3, 4, 5). Başlığın hemen altında, tek kart:
//  sabah: "Uyanınca" seçildiyse o (1 dk nefes / Dalga), sonra "Ses bittiğinde uyumuş muydun?"
//  akşam (19.00, test derlemesinde 14.00): kurulu alarm yoksa "Yarın sabah · Alarm kurayım mı?", kuruluysa durum
// status: { platform: 'alarmkit'|'notify'|'web', auth } (lib/alarmNative.js alarmStatus; App verir).
// Kayıtlar lib/alarmLog.js'e; kart her dokunuşta günlüğü yeniden okur.
const ANSWERS = [
  { id: 'yes', label: 'Evet' },
  { id: 'no', label: 'Hayır' },
  { id: 'early', label: 'Çok önce' },
]
const DENIED = {
  alarmkit: { eyebrow: 'Alarm izni kapalı', path: 'Ayarlar → Nefona → Alarmlar' },
  notify: { eyebrow: 'Bildirim izni kapalı', path: 'Ayarlar → Nefona → Bildirimler' },
}

function Head({ icon = 'alarm', eyebrow, title }) {
  const Icon = icon === 'moon' ? Moon : icon === 'sun' ? Sun : AlarmClock
  return (
    <div className="al-head">
      <span className={`al-ic${icon === 'moon' ? ' moon' : ''}`}><Icon size={20} aria-hidden="true" /></span>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h3 className="al-title">{title}</h3>
      </div>
    </div>
  )
}

export default function AlarmCard({ status, sessions = [], test = false, onStart, now = new Date() }) {
  const [, setTick] = useState(0)
  const [thanks, setThanks] = useState(null) // sabah cevabından sonra: bu gecenin süresi (dk)
  const [prefOff, setPrefOff] = useState(false) // "Çıkmasın" dendi: ayar yolu (bir kez, bu ekranda)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const bump = () => setTick((t) => t + 1)
  const alarm = loadAlarm()
  const log = loadAlarmLog()
  const platform = status?.platform ?? 'web'

  if (thanks != null) {
    return (
      <section className="card al-card" aria-label="Uyku sesi" role="status">
        <Head icon="moon" eyebrow="Kaydedildi" title={`Bu gece uyku sesi ${thanks} dk çalacak.`} />
        <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => setThanks(null)}>Tamam</button></div>
      </section>
    )
  }
  if (prefOff) {
    return (
      <section className="card al-card" role="status">
        <p className="al-sub">{"Tamam, akşamları çıkmayacak. Alarmı istediğinde Bilgi → Hatırlatmalar'dan kurarsın."}</p>
        <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => setPrefOff(false)}>Tamam</button></div>
      </section>
    )
  }

  const m = platform === 'web' ? null : morningCard({ now, alarm, log, sessions })
  if (m?.kind === 'wake') {
    const breath = m.action === 'breath'
    return (
      <section className="card al-card" aria-label="Günaydın">
        <Head icon="sun" eyebrow="Günaydın" title={breath ? 'Bir dakika nefes, sonra güne başla' : 'Güne bir Dalga ile başla'} />
        <div className="al-btns">
          <button type="button" className="btn btn-sm" onClick={() => onStart(breath ? 'breath-1' : 'dalga')}>{breath ? 'Başla · 1 dk' : 'Başla'}</button>
          <button type="button" className="btn btn-ghost btn-sm al-fit" onClick={() => { addAlarmEvent('wakeSkip', { ring: m.ring.toISOString() }); bump() }}>Şimdi değil</button>
        </div>
      </section>
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
      <section className="card al-card" aria-label="Uyku sesi · tek soru">
        <Head icon="moon" eyebrow="Uyku sesi · tek soru" title="Ses bittiğinde uyumuş muydun?" />
        <div className="al-btns" role="group" aria-label="Cevap">
          {ANSWERS.map((a) => <button key={a.id} type="button" className="btn btn-secondary btn-sm" onClick={() => answer(a.id)}>{a.label}</button>)}
        </div>
        <p className="al-sub">Cevabına göre bu gecenin süresi 5 dakika uzar ya da kısalır.</p>
      </section>
    )
  }

  const c = eveningCard({ now, alarm, log, platform, auth: status?.auth, test })
  if (!c) return null

  if (c.kind === 'set') {
    const notify = alarm.kind === 'notify'
    return (
      <section className="card al-card" aria-label={notify ? 'Hatırlatma kurulu' : 'Alarm kurulu'}>
        <Head eyebrow={notify ? 'Hatırlatma kurulu' : 'Alarm kurulu'} title={<>{ringLabel(c.next, now)} <small>· {untilText(c.next, now)}</small></>} />
        <p className="al-sub">{notify ? 'Bildirim · sessiz modda ses çıkmaz' : `${soundById(alarm.sound).name} · sessiz modda da çalar`}</p>
        <div className="al-btns">
          {alarm.sleep !== 'off' && <button type="button" className="btn btn-sm" onClick={() => onStart('alarm-sleep')}><Moon size={16} aria-hidden="true" /> Uyku sesi</button>}
          <button type="button" className={`btn btn-secondary btn-sm${alarm.sleep !== 'off' ? ' al-fit' : ''}`} onClick={() => onStart('alarm')}>Değiştir</button>
        </div>
      </section>
    )
  }
  if (c.kind === 'pref') {
    const pick = (show) => {
      addAlarmEvent('cardPref', { show })
      if (!show) setPrefOff(true)
      bump()
    }
    return (
      <section className="card al-card" aria-label="Akşam kartı">
        <Head eyebrow="Bir kez soruyoruz" title="Bu kart akşamları çıksın mı?" />
        <div className="al-btns">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => pick(true)}>Çıksın</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => pick(false)}>Çıkmasın</button>
        </div>
      </section>
    )
  }
  if (c.kind === 'denied') {
    const d = DENIED[c.via] ?? DENIED.alarmkit
    return (
      <section className="card al-card" aria-label={d.eyebrow}>
        <Head eyebrow={d.eyebrow} title={d.path} />
        <p className="al-sub">İzin verince kart yeniden &quot;Yarın sabah&quot; olur.</p>
        <div className="al-btns"><button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => { addAlarmEvent('dismiss', { reason: 'denied' }); bump() }}>Tamam</button></div>
      </section>
    )
  }

  const dismiss = () => {
    addAlarmEvent('dismiss')
    bump()
  }
  if (c.kind === 'askNotify') {
    // iOS 26 öncesi: gerçek alarm yok, bildirimle hatırlatılır. Tek dokunuş: önerilen saat, YALNIZ YARIN (kart
    // "Yarın sabah" diyor; öğrenilen günler yarını içermeyebilir). Günlü hatırlatma "Değiştir"den.
    const d = { ...setupDefaults({ log, now, defaultSound: DEFAULT_SOUND }), days: [] }
    const setNow = async () => {
      setBusy(true)
      setErr(null)
      const cfg = buildAlarm({ ...d, kind: 'notify' }, new Date())
      const r = await scheduleAlarm(cfg, 'notify')
      setBusy(false)
      if (!r.ok) {
        setErr(r.reason === 'denied' ? 'Bildirim izni kapalı: Ayarlar → Nefona → Bildirimler.' : 'Kurulamadı. Yeniden dene.')
        return
      }
      saveAlarm(cfg)
      addAlarmEvent('set', { hour: cfg.hour, minute: cfg.minute, days: cfg.days, sound: cfg.sound, sleep: cfg.sleep, wake: cfg.wake, kind: 'notify', suggested: d.times.map(hhmm), picked: 'suggest', daysChanged: true, via: 'card' })
      bump()
    }
    return (
      <section className="card al-card" aria-label="Yarın sabah">
        <Head eyebrow="Yarın sabah" title={`${withSuffix(d.time, 'loc')} hatırlat`} />
        <p className="al-warn">Bu telefonda gerçek alarm yok (iOS 26 gerekir). Bildirim olarak gelir; sessiz modda ses çıkmaz.</p>
        {err && <p className="al-err" role="alert">{err}</p>}
        <div className="al-btns">
          <button type="button" className="btn btn-sm" disabled={busy} onClick={setNow}>{`${withSuffix(d.time, 'dat')} kur`}</button>
          <button type="button" className="btn btn-secondary btn-sm al-fit" onClick={() => onStart('alarm')}>Değiştir</button>
        </div>
        <button type="button" className="al-link" onClick={dismiss}>Bu akşam değil</button>
      </section>
    )
  }
  return (
    <section className="card al-card" aria-label="Yarın sabah">
      <Head eyebrow="Yarın sabah" title="Alarm kurayım mı?" />
      <div className="al-btns">
        <button type="button" className="btn btn-sm" onClick={() => onStart('alarm')}>Evet</button>
        <button type="button" className="btn btn-secondary btn-sm al-fit" onClick={dismiss}>Bu akşam değil</button>
      </div>
    </section>
  )
}
