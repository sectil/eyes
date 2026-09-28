import { useEffect, useId, useRef, useState } from 'react'
import { Bell, BellOff, Eye, Footprints, Wind, GlassWater, CalendarDays, Clock, ChevronRight, Info, Timer } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import PrefToggle from '../components/PrefToggle.jsx'
import { NUDGE_TYPES, TYPE_LABEL, normalizeReminders, timeError, behaviorCount } from '../lib/reminders.js'
import { FOCUS_HOURS } from '../lib/focus.js'
import { WEEKDAYS } from '../lib/calendar.js'
import '../styles/reminders.css'

// Hatırlatmalar (bildirim planı v2 §5). Her türü kişi kendisi açar, saatini kendisi seçer. Saat kuralları
// (pencere, su en geç, türler arası 1 saat) ayar anında timeError ile denetlenir; planlayıcı saatleri kaydırmaz.
// Ana anahtar settings.reminders.optIn: 'yes' olmadan hiçbir hatırlatma kurulmaz (Ana sayfa kartıyla aynı alan).
// Bildirim izni, Sağlık rızası ve Çalışma oturumu App'te; bu ekran yalnız gösterir ve geri çağırır.
//   reminders: settings.reminders (ham; burada normalize edilir) · study: settings.reminder ({ days, time })
//   permission: 'granted' | 'denied' | 'prompt' | 'unsupported' (restNotify.notifyPermission) · focus: loadFocus() | null
//   stepsMissing: Sağlık rızası var ama adım okunamadı (iOS okuma izni kapalı → değerler 0; plan §4)
//   onAskHealth verilmezse (HealthKit yok: web, bazı iPad'ler) izin düğmesi yerine yürüyüşün neden çalışmadığı yazar

const TYPE_ICON = { mola: Eye, walk: Footprints, breath: Wind, water: GlassWater }
// Satır alt yazısı: tür ne, tek bakışta (iddia yok)
const TYPE_HINT = { mola: 'Kalk, uzağa bak · 1 dk', walk: 'Adımın az olduğu günlerde', breath: '1 dakika nefes', water: 'Birkaç yudum su' }
// Wilson 2015 notu davranış sayısı 3 olunca çıkar; mola iki davranış sayılır (VARSAYIM, lib/reminders.js behaviorCount)
const WILSON_AT = 3
const HOUR = 3600000

const pad = (n) => String(n).padStart(2, '0')
const hhmm = (ms) => {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// "Pzt Çar Cum 20:00"; yedi gün seçiliyse "Her gün 20:00"; gün seçilmemişse null
function studyLabel(study) {
  const days = Array.isArray(study?.days) ? study.days : []
  if (!days.length || !study?.time) return null
  const names = days.length === WEEKDAYS.length ? 'Her gün' : WEEKDAYS.filter((w) => days.includes(w.id)).map((w) => w.short).join(' ')
  return `${names} ${study.time}`
}

// Süren oturumun bitişi ve sıradaki mola anı. Sıradaki mola her saat yeniden hesaplanır (App'in verdiği
// nextBreakAt açılış anına göre; ekran açık kaldıkça eskir). Bitmişse null.
function focusTimes(focus, now) {
  const start = Date.parse(focus?.startedAt)
  if (!Number.isFinite(start) || !FOCUS_HOURS.includes(focus.hours)) return null
  const end = start + focus.hours * HOUR
  if (now >= end) return null
  const k = Math.min(focus.hours, Math.max(1, Math.floor((now - start) / HOUR) + 1))
  return { end, nextBreak: start + k * HOUR }
}

// İzin durumu: yalnız bir şey yapılması gerekiyorsa görünür (izin verilmişse satır yok)
function PermissionStatus({ permission, onAsk }) {
  if (permission === 'denied') {
    return (
      <div className="card tone-warn rem-perm" role="status">
        <BellOff size={20} aria-hidden="true" />
        <p>{'Bildirimler kapalı: Ayarlar > Nefona > Bildirimler'}</p>
      </div>
    )
  }
  if (permission === 'prompt') {
    return (
      <div className="card tone-accent">
        <p>Hatırlatmaların gelmesi için bildirim izni gerekiyor.</p>
        <button type="button" className="btn" onClick={() => onAsk?.()}>
          <Bell size={18} aria-hidden="true" /> İzin ver
        </button>
      </div>
    )
  }
  if (permission === 'unsupported') {
    return (
      <p className="note">
        <Info size={16} aria-hidden="true" />
        Hatırlatmalar yalnız iPhone uygulamasında gelir.
      </p>
    )
  }
  return null
}

// Saat seçici (iOS'ta çark). Hata canlı gösterilir; hata varken Kaydet kapalı.
function TimeEditor({ label, value, error, onChange, onSave, onCancel }) {
  const input = useRef(null)
  const errId = useId()
  // Açılınca odak saat alanına (VoiceOver alanı okusun)
  useEffect(() => {
    input.current?.focus()
  }, [])
  return (
    <div className="rem-edit">
      <label className="field">
        <span>{label}</span>
        <input
          ref={input}
          className="input rem-time-input"
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
        />
      </label>
      {/* Canlı bölge önceden durur; içerik değişince okunur */}
      <p id={errId} className="rem-err" aria-live="polite">{error ?? ''}</p>
      <div className="rem-edit-actions">
        <button type="button" className="btn" disabled={Boolean(error)} onClick={onSave}>Kaydet</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Vazgeç</button>
      </div>
    </div>
  )
}

// Çalışma oturumu: 1/2/4 saat; sürerken sıradaki mola ve bitiş saati + Bitir. Bildirim izni yoksa oturumun tek işi
// (saatte bir mola bildirimi) yapılamaz: başlatma düğmeleri yerine not (izne hâlâ bakılıyorsa düğmeler durur).
function FocusCard({ focus, permission = null, onStart, onStop }) {
  const [now, setNow] = useState(() => Date.now())
  // Kalan süre dakikada bir değişir; 15 sn'lik tık yeter
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])
  const t = focusTimes(focus, now)

  if (!t) {
    if (permission != null && permission !== 'granted') {
      return (
        <div className="card">
          <p className="small rem-focus-lead">Saatte bir mola hatırlatması gelir. Bildirimler açılınca başlatabilirsin.</p>
        </div>
      )
    }
    return (
      <div className="card">
        <p className="small rem-focus-lead">Saatte bir mola hatırlatması gelir; bu sürede diğer hatırlatmalar gelmez.</p>
        <div className="rem-hours" role="group" aria-label="Oturum süresi">
          {FOCUS_HOURS.map((h) => (
            <button
              key={h}
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setNow(Date.now())
                onStart?.(h)
              }}
            >
              {h} saat
            </button>
          ))}
        </div>
      </div>
    )
  }

  const min = Math.max(1, Math.ceil((t.nextBreak - now) / 60000))
  return (
    <div className="card">
      <div className="rem-focus-live">
        <span className="rem-focus-icon" aria-hidden="true"><Timer size={22} /></span>
        <span className="rem-focus-text">
          <strong className="rem-focus-big">{min >= 60 ? '1 saat' : `${min} dk`} sonra mola</strong>
          <span className="muted small">Sürüyor · Bitiş {hhmm(t.end)}</span>
        </span>
      </div>
      <button type="button" className="btn btn-secondary" onClick={() => onStop?.()} aria-label="Çalışma oturumunu bitir">Bitir</button>
    </div>
  )
}

export default function Reminders({
  reminders,
  study = null,
  permission = null,
  healthConsent = false,
  stepsMissing = false,
  focus = null,
  onSave,
  onStudy,
  onAskPermission,
  onAskHealth,
  onStartFocus,
  onStopFocus,
  onBack,
}) {
  const r = normalizeReminders(reminders)
  const on = r.optIn === 'yes'
  const [edit, setEdit] = useState(null) // { type, time, turnOn } — saat seçicisi açık tür; turnOn: kaydedince türü aç
  const [waterNote, setWaterNote] = useState(false) // su açılınca bir kez; cevap saklanmaz
  const [wilson, setWilson] = useState(false)
  const [studyErr, setStudyErr] = useState(null)

  const withType = (type, patch) => ({ ...r, types: { ...r.types, [type]: { ...r.types[type], ...patch } } })

  function setOptIn(yes) {
    onSave?.({ ...r, optIn: yes ? 'yes' : 'no' })
    if (yes && permission === 'prompt') onAskPermission?.()
    if (!yes) {
      setEdit(null)
      setWilson(false)
      setWaterNote(false)
      setStudyErr(null)
    }
  }

  // Tür açılıp kaydedildikten sonra: tek seferlik notlar ve Sağlık rızası
  function opened(type, next) {
    if (type === 'water') setWaterNote(true)
    if (type === 'walk' && !healthConsent) onAskHealth?.()
    if (behaviorCount(next) >= WILSON_AT) setWilson(true)
  }

  function toggleType(type, value) {
    if (!value) {
      if (edit?.type === type) setEdit(null)
      if (type === 'water') setWaterNote(false)
      onSave?.(withType(type, { on: false }))
      return
    }
    // Kayıtlı saat kurala uymuyorsa (ör. başka türle 1 saatten yakın) önce saat seçtir; planlayıcı kaydırmaz
    if (timeError(type, r.types[type].time, r, study)) {
      setEdit({ type, time: r.types[type].time, turnOn: true })
      return
    }
    const next = withType(type, { on: true })
    onSave?.(next)
    opened(type, next)
  }

  function saveTime() {
    if (!edit || timeError(edit.type, edit.time, r, study)) return
    const next = withType(edit.type, edit.turnOn ? { on: true, time: edit.time } : { time: edit.time })
    onSave?.(next)
    setEdit(null)
    if (edit.turnOn) opened(edit.type, next)
  }

  // Çalışma günleri saati Schedule.jsx'te seçilir; burada yalnız çakışma denetlenir
  function toggleStudy(value) {
    const err = value && study?.time ? timeError('study', study.time, r, study) : null
    setStudyErr(err)
    if (!err) onSave?.(withType('study', { on: value }))
  }

  const studyText = studyLabel(study)

  return (
    <main className="screen fade-in">
      <PageHeader onBack={onBack} title="Hatırlatmalar" subtitle="Hangileri gelsin, saat kaçta gelsin: sen seç." />

      <div className="list">
        <PrefToggle Icon={Bell} IconOff={BellOff} label="Hatırlatmalar" sub={on ? 'Açık' : 'Kapalı'} checked={on} onChange={setOptIn} />
      </div>

      {on && <PermissionStatus permission={permission} onAsk={onAskPermission} />}

      {on && (
        <section className="stack">
          <span className="eyebrow">Gün içinde</span>
          <div className="list">
            {NUDGE_TYPES.map((type) => {
              const cfg = r.types[type]
              // "Her gün" değil: uygun günlerin bir kısmında bilerek gönderilmez (alttaki not)
              const every = r.thin[type] === 'alt' ? 'Gün aşırı' : 'Çoğu gün'
              return (
                <div key={type} className="rem-group">
                  <PrefToggle
                    Icon={TYPE_ICON[type]}
                    label={TYPE_LABEL[type]}
                    sub={TYPE_HINT[type]}
                    checked={cfg.on}
                    onChange={(v) => toggleType(type, v)}
                  />
                  {edit?.type === type ? (
                    <TimeEditor
                      label={`${TYPE_LABEL[type]} saati`}
                      value={edit.time}
                      error={timeError(type, edit.time, r, study)}
                      onChange={(time) => setEdit((e) => e && { ...e, time })}
                      onSave={saveTime}
                      onCancel={() => setEdit(null)}
                    />
                  ) : (
                    cfg.on && (
                      <button
                        type="button"
                        className="rem-time"
                        onClick={() => setEdit({ type, time: cfg.time, turnOn: false })}
                        aria-label={`${TYPE_LABEL[type]} saatini değiştir. Şu an ${every.toLocaleLowerCase('tr')} ${cfg.time}`}
                      >
                        <Clock size={18} aria-hidden="true" />
                        <span className="rem-time-val">
                          <span className="muted">{every}</span>
                          <strong>{cfg.time}</strong>
                        </span>
                        <span className="rem-time-go">
                          Saati değiştir <ChevronRight size={16} aria-hidden="true" />
                        </span>
                      </button>
                    )
                  )}
                  {type === 'walk' && cfg.on && !healthConsent && !onAskHealth && (
                    <div className="rem-inline" role="status">
                      <Info size={16} aria-hidden="true" />
                      <p>{"Yürüyüş hatırlatması yalnız Apple Sağlık olan iPhone'da çalışır."}</p>
                    </div>
                  )}
                  {type === 'walk' && cfg.on && !healthConsent && onAskHealth && (
                    <div className="rem-inline">
                      <Info size={16} aria-hidden="true" />
                      <div className="rem-inline-body">
                        <p>{"Yürüyüş hatırlatması için adımlarını Apple Sağlık'tan okumamız gerekiyor."}</p>
                        <button type="button" className="btn btn-secondary btn-sm rem-inline-btn" onClick={() => onAskHealth()}>İzin ver</button>
                      </div>
                    </div>
                  )}
                  {type === 'walk' && cfg.on && healthConsent && stepsMissing && (
                    <div className="rem-inline" role="status">
                      <Info size={16} aria-hidden="true" />
                      <p>{'Adımların okunamıyor: Sağlık > Veri Erişimi > Nefona.'}</p>
                    </div>
                  )}
                  {type === 'water' && cfg.on && waterNote && (
                    <div className="rem-inline" role="status">
                      <Info size={16} aria-hidden="true" />
                      <p>Doktorun sıvını kısıtladıysa bunu açma.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {wilson && behaviorCount(r) >= WILSON_AT && (
            <p className="note" role="status">
              <Info size={16} aria-hidden="true" />
              Aynı anda 2–3 alışkanlıkla başlayanlarda sonuç en iyiydi, 4 ve üstünde etki düştü (Wilson 2015; bildirim değil, yaşam tarzı önerileri). Seçim senin.
            </p>
          )}
          <p className="note">
            <Info size={16} aria-hidden="true" />
            {"Bazı günler bilerek göndermiyoruz; hatırlatmanın işine yarayıp yaramadığını Gelişim'de görmen için."}
          </p>
        </section>
      )}

      {on && (
        <section className="stack">
          <span className="eyebrow">Göz çalışması</span>
          <div className="list">
            <div className="rem-group">
              <PrefToggle Icon={CalendarDays} label="Çalışma günleri" sub="Seçtiğin günlerde" checked={r.types.study.on} onChange={toggleStudy} />
              {studyErr && <p className="rem-err rem-inset" role="alert">{studyErr}</p>}
              {(r.types.study.on || studyErr) && (
                <button
                  type="button"
                  className="rem-time"
                  onClick={() => onStudy?.()}
                  aria-label={studyText ? `Çalışma günlerini değiştir. Şu an ${studyText}` : 'Çalışma günlerini seç'}
                >
                  <Clock size={18} aria-hidden="true" />
                  <span className="rem-time-val rem-days">
                    {studyText ? <strong>{studyText}</strong> : <span>Henüz gün seçmedin</span>}
                  </span>
                  <span className="rem-time-go">
                    {studyText ? 'Değiştir' : 'Seç'} <ChevronRight size={16} aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {(on || focus) && (
        <section className="stack">
          <span className="eyebrow">Çalışma oturumu</span>
          <FocusCard focus={focus} permission={permission} onStart={onStartFocus} onStop={onStopFocus} />
        </section>
      )}
    </main>
  )
}
