import { useEffect, useMemo, useState } from 'react'
import { X, Play, Square, AlarmClock } from 'lucide-react'
import {
  setupDefaults, buildAlarm, hhmm, withSuffix, parseHhmm, daysLabel, latency, LATENCY_START, nextOccurrence, nextRing, ringLabel,
  WEEK_ORDER, WEEKDAY_SHORT, WEEKDAY_LONG, SLEEP_CHOICES, SLEEP_OTHER, sleepMinutes, lateSleepSeconds,
} from '../lib/alarm.js'
import { startSleepSession, stopSleepSession } from '../lib/sleepSession.js'
import { loadAlarm, loadAlarmLog, saveAlarm, addAlarmEvent } from '../lib/alarmLog.js'
import { dayKey, keyDay } from '../lib/habitLog.js'
import { ALARM_SOUNDS, DEFAULT_SOUND, soundById } from '../lib/alarmSounds.js'
import { alarmStatus, scheduleAlarm, cancelAlarm, previewSound, stopPreview } from '../lib/alarmNative.js'
import '../styles/alarm.css'

// Alarm kurulumu (Artifact "Nefona Alarm" v3, ekran 2): üç soru, hepsi önceden cevaplı; tek dokunuşla "Kur".
// Seçenekler günlükten öğrenilir (lib/alarm.js setupDefaults). Var olan alarm ("Değiştir") kendi ayarıyla açılır.
const WAKE = [
  { id: 'none', label: 'Hiçbiri' },
  { id: 'breath', label: '1 dk nefes' },
  { id: 'dalga', label: 'Dalga sesi' },
  { id: 'light', label: 'Gün ışığı' },
]
const WAKE_TEXT = { none: 'hiçbiri', breath: '1 dk nefes', dalga: 'Dalga sesi', light: 'gün ışığı' }
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const sleepText = (v) => (v === 'auto' ? 'Sana göre' : `${v} dk`)

// status: test/önizleme için dışarıdan verilebilir; yoksa telefondan okunur. onDone(): kuruldu ya da kaldırıldı.
export default function AlarmSetup({ status: given = null, now: nowProp = null, onDone, onBack }) {
  const [status, setStatus] = useState(given)
  const now = useMemo(() => nowProp ?? new Date(), [nowProp])
  // Kurulu = sırada bir çalışı var (çalmış "Yalnız yarın" alarmı değiştirilecek alarm değildir)
  const live = useMemo(() => {
    const a = loadAlarm()
    return a && nextRing(a, now) ? a : null
  }, [now])
  const log = useMemo(() => loadAlarmLog(), [])
  const d = useMemo(() => setupDefaults({ log, alarm: live, now, defaultSound: DEFAULT_SOUND }), [log, live, now])
  const [time, setTime] = useState(d.time)
  const [days, setDays] = useState(d.days)
  const [sleep, setSleep] = useState(d.sleep)
  const [sound, setSound] = useState(d.sound)
  const [wake, setWake] = useState(d.wake)
  const [open, setOpen] = useState(null) // Özet'te açık bölüm: 'sound' | 'wake' | null
  const [playing, setPlaying] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [otherTime, setOtherTime] = useState(!d.times.includes(d.time))

  useEffect(() => {
    if (given) return undefined
    let alive = true
    alarmStatus().then((s) => alive && setStatus(s)).catch(() => alive && setStatus({ platform: 'web', auth: null }))
    return () => {
      alive = false
    }
  }, [given])
  useEffect(() => () => { stopPreview() }, [])

  const platform = status?.platform ?? null
  const notify = platform === 'notify'
  const lat = latency(log)
  const firstNight = !log.some((e) => e?.type === 'morning')
  const sleepOn = sleep !== 'off'
  const sleepOther = sleepOn && sleep !== 'auto' && !SLEEP_CHOICES.includes(sleep)

  // Seçili günler yarını içermiyorsa ilk çalış yazılır ("Kur · 07:00" yarın sanılmasın)
  const first = nextOccurrence({ hour: Math.floor(time / 60), minute: time % 60, days }, now)
  const firstIsTomorrow = first && keyDay(dayKey(first)) - keyDay(dayKey(now)) <= 1
  // Gün seçilmemiş: tek seferlik (sahip onaylı 2026-10-01; alarm-risk.md N1). Düğmelerin üstünde simgeli özet kutusu
  // ("Yarın Cuma 06:35'te bir kez çalar."; bugün/yarın gerçek ilk çalıştan, first). Tek düğme "Alarmı kur" (3. tur: özet
  // zaten günü ve saati söylüyor), uyku sesiyle ikincil düğme "Uyku sesi olmadan kur"
  const onceTomorrow = !days.length && first && keyDay(dayKey(first)) - keyDay(dayKey(now)) === 1
  const onceToday = !days.length && first && keyDay(dayKey(first)) - keyDay(dayKey(now)) === 0
  // Tek seferlik: düğmelerin üstünde ne zaman çalacağı (2. tur; gerçek ilk çalıştan: bugün ya da yarın + gün adı)
  const onceWhen = notify ? null : onceTomorrow ? `Yarın ${WEEKDAY_LONG[first.getDay()]}` : onceToday ? 'Bugün' : null
  const toggleDay = (x) => setDays((ds) => (ds.includes(x) ? ds.filter((y) => y !== x) : [...ds, x].sort((a, b) => a - b)))
  const pickTime = (t, other = false) => {
    setTime(t)
    setOtherTime(other)
  }

  // Özet'te bir bölüm açılır; ses listesi kapanınca çalan önizleme de susar
  function toggle(part) {
    if (open === 'sound' && playing) {
      stopPreview()
      setPlaying(null)
    }
    setOpen((v) => (v === part ? null : part))
  }

  async function play(id) {
    if (playing === id) {
      await stopPreview()
      setPlaying(null)
      return
    }
    const ok = await previewSound(id)
    setPlaying(ok ? id : null)
  }

  // Bu gece uyku sesi kaç sn: kuraldaki süre (alarmdan 1 saat önce biter); yetmezse alarmdan 1 dk önceye kadar
  const sleepFor = (cfg, at) => (sleepOn ? (sleepMinutes(cfg, log, at) || 0) * 60 || lateSleepSeconds(cfg, log, at) : 0)
  // Ekrandaki süre açık kaldıkça tazelenir (yakın alarmda saniyeler önemli); testte verilen saat sabit kalır
  const [clock, setClock] = useState(() => now)
  useEffect(() => {
    if (nowProp) return undefined
    const id = setInterval(() => setClock(new Date()), 10000)
    return () => clearInterval(id)
  }, [nowProp])
  const tonight = sleepFor(buildAlarm({ time, days, sleep, sound, wake, kind: notify ? 'notify' : 'alarmkit' }, clock), clock)
  const tonightText = tonight >= 60 ? `${Math.round(tonight / 60)} dk` : `${tonight} sn`
  const withSoundOk = sleepOn && tonight > 0 && platform !== 'web'
  const sleepNote = sleepOn && platform !== 'web'
    ? tonight > 0 ? `Kurunca uyku sesi hemen başlar: ${tonightText}, sonra yavaşça susar.` : 'Alarma çok az var; uyku sesi çalmaz.'
    : null

  // withSound: "Kur ve uyku sesini başlat". Müzik AYNI dokunuşta, alarm kurulmadan (beklemeden) önce başlar: iOS sesi
  // yalnız dokunuşun içinde açar (Bug 22). Alarm kurulamazsa müzik durur.
  async function submit(withSound = false) {
    if (!platform) return
    const cfg = buildAlarm({ time, days, sleep, sound, wake, kind: notify ? 'notify' : 'alarmkit' }, new Date())
    const m = withSound ? sleepFor(cfg, new Date()) : 0
    // Dokunduğun an süre bitmişse (alarm çok yaklaştı) sessizce müziksiz kurma: söyle
    if (withSound && m <= 0) {
      setErr('Alarma çok az kaldı; uyku sesi çalamaz. "Yalnız kur" ya da saati değiştir.')
      setClock(new Date())
      return
    }
    const session = m > 0 ? startSleepSession({ seconds: m, auto: sleep === 'auto' }) : null
    setBusy(true)
    setErr(null)
    await stopPreview()
    setPlaying(null)
    const r = await scheduleAlarm(cfg, platform)
    setBusy(false)
    if (!r.ok) {
      if (session) stopSleepSession()
      setErr(
        r.reason === 'denied'
          ? notify ? 'Bildirim izni kapalı: Ayarlar → Nefona → Bildirimler.' : 'Alarm izni kapalı: Ayarlar → Nefona → Alarmlar.'
          : r.reason === 'unsupported' ? 'Alarm yalnız iPhone uygulamasında kurulur.'
            : r.reason === 'missing' ? 'Bu ses uygulamada bulunamadı. "Telefonun alarm sesi"ni seç.' : 'Kurulamadı. Yeniden dene.',
      )
      return
    }
    saveAlarm(cfg)
    addAlarmEvent('set', {
      hour: cfg.hour, minute: cfg.minute, days: cfg.days, sound, sleep, wake, kind: cfg.kind,
      suggested: d.times.map(hhmm), picked: d.times.includes(time) && !otherTime ? 'suggest' : 'other',
      daysChanged: days.join() !== d.days.join(), edit: Boolean(live), snooze: Boolean(r.snooze), sleepNow: session ? Math.round(m / 6) / 10 : 0,
    })
    onDone?.(session ? 'sleep' : undefined)
  }

  async function remove() {
    setBusy(true)
    await stopPreview()
    await cancelAlarm()
    saveAlarm({ ...live, on: false })
    addAlarmEvent('cancel')
    setBusy(false)
    onDone?.()
  }

  return (
    <main className="screen fade-in al-setup">
      <div className="al-top">
        <button type="button" className="btn-icon" onClick={onBack} disabled={busy} aria-label="Kapat"><X size={20} /></button>
        <span className="eyebrow">{notify ? 'Hatırlatma' : 'Alarm'}{live ? ' · değiştir' : ''}</span>
      </div>

      <section className="al-q" aria-labelledby="al-q1">
        <h2 id="al-q1">Kaçta uyanmak istersin?</h2>
        {/* Tasarım v5: büyük saat; dokununca iOS saat çarkı (saydam gerçek alan kutunun üstünde) */}
        <label className="al-clock">
          <b>{hhmm(time)}</b>
          <span className="al-clock-ch">Saati değiştir</span>
          <input type="time" aria-label={`Saat ${hhmm(time)}. Değiştir`} value={hhmm(time)} onChange={(e) => { const t = parseHhmm(e.target.value); if (t != null) pickTime(t, !d.times.includes(t)) }} />
        </label>
        <div className="al-chips" role="radiogroup" aria-label="Hızlı seçim">
          {d.times.map((t) => (
            <button key={t} type="button" role="radio" className="al-chip" aria-checked={time === t && !otherTime} onClick={() => pickTime(t)}>{hhmm(t)}</button>
          ))}
        </div>
        <p className="al-q-sub">{d.learned ? 'Hızlı seçim: uyandığın sabah saatlerinden' : 'Hızlı seçim · sonra uyandığın sabah saatlerinden öğrenir'}</p>
      </section>

      <section className="al-q" aria-labelledby="al-q2">
        <h2 id="al-q2">Hangi günler?</h2>
        <div className="al-chips">
          <button type="button" className="al-chip" aria-pressed={days.length === 7} onClick={() => setDays(days.length === 7 ? [] : ALL_DAYS)}>Her gün</button>
        </div>
        <div className="al-days" role="group" aria-labelledby="al-q2">
          {WEEK_ORDER.map((x) => (
            <button key={x} type="button" role="checkbox" className="al-day" aria-checked={days.includes(x)} aria-label={WEEKDAY_LONG[x]} onClick={() => toggleDay(x)}>{WEEKDAY_SHORT[x]}</button>
          ))}
        </div>
        <p className="al-q-sub">{days.length ? `${daysLabel(days)} · dokun, çıkar ya da ekle` : 'Yalnız yarın · gün seçersen her hafta çalar'}</p>
        {first && !firstIsTomorrow && <p className="al-q-sub">Yarın çalmaz · ilk: {ringLabel(first, now)}</p>}
        {/* Windred 2024 (doi:10.1093/sleep/zsad253): düzenli uyku-uyanma, süreden güçlü bir gösterge (gözlemsel) */}
        {days.length > 0 && days.length < 7 && <p className="al-q-sub">Her gün aynı saatte kalkmak uyku düzenini korur.</p>}
      </section>

      <section className="al-q" aria-labelledby="al-q3">
        <h2 id="al-q3">Uykuya dalarken ses çalsın mı?</h2>
        <div className="al-chips" role="radiogroup" aria-labelledby="al-q3">
          <button type="button" role="radio" className="al-chip" aria-checked={sleepOn} onClick={() => !sleepOn && setSleep('auto')}>Evet</button>
          <button type="button" role="radio" className="al-chip" aria-checked={!sleepOn} onClick={() => setSleep('off')}>Hayır</button>
        </div>
        {sleepOn && (
          <>
            <p className="al-q-label" id="al-q3b">Ne zaman sussun?</p>
            <div className="al-chips" role="radiogroup" aria-labelledby="al-q3b">
              {SLEEP_CHOICES.map((v) => (
                <button key={v} type="button" role="radio" className="al-chip" aria-checked={sleep === v} onClick={() => setSleep(v)}>{sleepText(v)}</button>
              ))}
              <label className={`al-chip${sleepOther ? ' on' : ''}`}>
                {sleepOther ? `${sleep} dk` : 'Başka'}
                <select aria-label="Başka süre" value={sleepOther ? sleep : ''} onChange={(e) => e.target.value && setSleep(Number(e.target.value))}>
                  <option value="" disabled>Süre</option>
                  {SLEEP_OTHER.map((v) => <option key={v} value={v}>{v} dk</option>)}
                </select>
              </label>
            </div>
            <p className="al-q-sub">
              {sleep === 'auto'
                ? `Uykuya dalma süreni sabah cevaplarından öğrenir; ${firstNight ? `ilk gece ${LATENCY_START} dk` : `bu gece ${lat} dk`}`
                : 'Dalga · Sakin; sonunda yavaşça kısılır'}
            </p>
          </>
        )}
      </section>

      <section className="al-sum" aria-label="Özet">
        <div className="al-sum-row">
          <span>Uyandıran ses:</span><b>{notify ? 'bildirim sesi' : soundById(sound).name}</b>
          {!notify && <button type="button" className="link-btn" aria-expanded={open === 'sound'} onClick={() => toggle('sound')}>{open === 'sound' ? 'kapat' : 'değiştir'}</button>}
        </div>
        {open === 'sound' && !notify && (
          <div className="al-sheet">
            <div role="radiogroup" aria-label="Uyandıran ses">
              {ALARM_SOUNDS.map((s) => (
                <div key={s.id} className="al-snd">
                  <label>
                    <input type="radio" name="al-sound" checked={sound === s.id} onChange={() => setSound(s.id)} />
                    <span className="al-snd-name"><b>{s.name}</b><span>{s.sub}</span></span>
                  </label>
                  {s.file && (
                    <button type="button" className="al-play" aria-pressed={playing === s.id} aria-label={playing === s.id ? `${s.name}: durdur` : `${s.name}: dinle`} onClick={() => play(s.id)}>
                      {playing === s.id ? <Square size={14} fill="currentColor" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="al-sum-row">
          <span>Uyanınca:</span><b>{WAKE_TEXT[wake]}</b>
          <button type="button" className="link-btn" aria-expanded={open === 'wake'} onClick={() => toggle('wake')}>{open === 'wake' ? 'kapat' : 'değiştir'}</button>
        </div>
        {open === 'wake' && (
          <div className="al-sheet">
            <div className="al-q">
              <p className="al-q-label" id="al-wake">Uyanınca</p>
              <div className="al-chips" role="radiogroup" aria-labelledby="al-wake">
                {WAKE.map((w) => <button key={w.id} type="button" role="radio" className="al-chip" aria-checked={wake === w.id} onClick={() => setWake(w.id)}>{w.label}</button>)}
              </div>
              <p className="al-q-sub">{notify ? 'Hatırlatmaya dokununca ya da uygulamayı açınca çıkar. İsteğe bağlı.' : 'Alarmdan sonra uygulamayı açınca Ana sayfada çıkar. İsteğe bağlı.'}</p>
            </div>
          </div>
        )}
      </section>

      {notify && <p className="al-warn">Bu telefonda gerçek alarm yok (iOS 26 gerekir). Bildirim olarak gelir; sessiz modda ses çıkmaz.</p>}
      {err && <p className="al-err" role="alert">{err}</p>}
      <div className="grow" />
      {/* Uyku sesi notu: gün seçiliyken düğmelerin üstünde; tek seferlikte özet kutusunun ikinci satırı (4. tur: tek blok) */}
      {sleepNote && !onceWhen && <p className="al-q-sub al-now">{sleepNote}</p>}
      {onceWhen && (
        <div className="al-once">
          <AlarmClock size={18} aria-hidden="true" />
          <div className="al-once-tx">
            {/* 320 pt'de cümle tek satıra sığmaz (243 pt gerekir, 222 var): "bir kez çalar." bölünmez, satır saatten sonra kırılır */}
            <p>{`${onceWhen} ${withSuffix(time, 'loc')} `}<span className="al-once-nw">bir kez çalar.</span></p>
            {sleepNote && <p className="al-once-sub">{sleepNote}</p>}
          </div>
        </div>
      )}
      {withSoundOk ? (
        <>
          <button type="button" className="btn" disabled={busy || !platform} onClick={() => submit(true)}>
            {notify ? 'Hatırlat ve uyku sesini başlat' : 'Kur ve uyku sesini başlat'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={busy || !platform} onClick={() => submit(false)}>
            {notify ? 'Yalnız hatırlat' : onceTomorrow ? 'Uyku sesi olmadan kur' : `Yalnız kur · ${hhmm(time)}`}
          </button>
        </>
      ) : (
        <button type="button" className="btn" disabled={busy || !platform} onClick={() => submit(false)}>
          {notify ? `${withSuffix(time, 'loc')} hatırlat` : onceTomorrow || onceToday ? 'Alarmı kur' : `Kur · ${hhmm(time)}`}
        </button>
      )}
      {live && <button type="button" className="btn btn-ghost" disabled={busy} onClick={remove}>{notify ? 'Hatırlatmayı kaldır' : 'Alarmı kaldır'}</button>}
    </main>
  )
}
