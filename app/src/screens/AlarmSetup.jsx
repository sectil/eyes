import { useEffect, useMemo, useState } from 'react'
import { X, Play, Square } from 'lucide-react'
import {
  setupDefaults, buildAlarm, hhmm, withSuffix, parseHhmm, daysLabel, latency, LATENCY_START, nextOccurrence, nextRing, ringLabel,
  WEEK_ORDER, WEEKDAY_SHORT, WEEKDAY_LONG, SLEEP_CHOICES, SLEEP_OTHER,
} from '../lib/alarm.js'
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
  const [more, setMore] = useState(false)
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
  const toggleDay = (x) => setDays((ds) => (ds.includes(x) ? ds.filter((y) => y !== x) : [...ds, x].sort((a, b) => a - b)))
  const pickTime = (t, other = false) => {
    setTime(t)
    setOtherTime(other)
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

  async function submit() {
    if (!platform) return
    setBusy(true)
    setErr(null)
    await stopPreview()
    setPlaying(null)
    const cfg = buildAlarm({ time, days, sleep, sound, wake, kind: notify ? 'notify' : 'alarmkit' }, new Date())
    const r = await scheduleAlarm(cfg, platform)
    setBusy(false)
    if (!r.ok) {
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
      daysChanged: days.join() !== d.days.join(), edit: Boolean(live), snooze: Boolean(r.snooze),
    })
    onDone?.()
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
        <button type="button" className="btn-icon" onClick={onBack} aria-label="Kapat"><X size={20} /></button>
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
        <div className="al-sum-row"><span>Uyandıran ses:</span><b>{notify ? 'bildirim sesi' : soundById(sound).name}</b></div>
        <div className="al-sum-row">
          <span>Uyanınca:</span><b>{WAKE_TEXT[wake]}</b>
          <button type="button" className="link-btn" aria-expanded={more} onClick={() => setMore((v) => !v)}>{more ? 'kapat' : 'değiştir'}</button>
        </div>
        {more && (
          <div className="al-sheet">
            {!notify && (
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
            )}
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
      <button type="button" className="btn" disabled={busy || !platform} onClick={submit}>
        {notify ? `${withSuffix(time, 'loc')} hatırlat` : `Kur · ${hhmm(time)}`}
      </button>
      {live && <button type="button" className="btn btn-ghost" disabled={busy} onClick={remove}>{notify ? 'Hatırlatmayı kaldır' : 'Alarmı kaldır'}</button>}
    </main>
  )
}
