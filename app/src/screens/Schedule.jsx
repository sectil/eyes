import { useState } from 'react'
import { Check, Bell } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { WEEKDAYS, DEFAULT_WEEKLY_TARGET } from '../lib/calendar.js'
import { normalizeReminders, timeError } from '../lib/reminders.js'

// Çalışma günleri (Takvim, Ana sayfa ve Gelişim bunu kullanır). Hatırlatması artık uygulama bildirimi
// (bildirim planı v2 §6; lib/notifyPlan.js "study"): Bilgi → Hatırlatmalar'dan açılır. Hatırlatma açıksa saat,
// diğer hatırlatmalarla 1 saat aralık kuralına uymalı (lib/reminders.js timeError; Reminders.jsx ile aynı kural).
// reminders: settings.reminders (ham) — verilmezse denetim yok. iosApp false (web): bildirim yok, Hatırlatmalar satırı yok.
export default function Schedule({ initial, reminders = null, iosApp = true, onSave, onBack }) {
  const [days, setDays] = useState(initial?.days ?? ['MO', 'WE', 'FR'])
  const [time, setTime] = useState(initial?.time ?? '20:00')
  const [msg, setMsg] = useState(null)

  const toggle = (id) => {
    setMsg(null)
    setDays((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  }
  const rem = reminders ? normalizeReminders(reminders) : null
  const studyOn = Boolean(rem?.types.study.on)
  const remindOn = studyOn && rem.optIn === 'yes'
  const err = studyOn ? timeError('study', time, rem, { days, time }) : null
  const valid = days.length > 0 && /^\d{2}:\d{2}$/.test(time) && !err

  function save() {
    onSave({ days, time, weeklyTarget: DEFAULT_WEEKLY_TARGET })
    setMsg('Kaydedildi.')
  }

  return (
    <main className="screen fade-in">
      <PageHeader
        onBack={onBack}
        title="Çalışma günleri"
        subtitle="Haftada en az 3 gün öneriyoruz. Hatırlatmayı bir alışkanlığına bağla (ör. akşam çayından sonra) — sürdürmesi kolaylaşır."
      />

      <section className="card">
        <span className="eyebrow">Günler</span>
        <div className="weekday-row">
          {WEEKDAYS.map((w) => (
            <button key={w.id} className={days.includes(w.id) ? 'day-pill on' : 'day-pill'} aria-pressed={days.includes(w.id)} onClick={() => toggle(w.id)}>
              {w.short}
            </button>
          ))}
        </div>
        {days.length > 0 && days.length < DEFAULT_WEEKLY_TARGET && (
          <p className="small" style={{ color: 'var(--warn)' }}>Haftalık hedef 3 gün; en az 3 gün seçmeni öneririz.</p>
        )}
        <label className="field" style={{ marginTop: 6 }}>
          <span>Saat</span>
          <input
            className="input"
            type="time"
            value={time}
            onChange={(e) => {
              setMsg(null)
              setTime(e.target.value)
            }}
            aria-invalid={err ? true : undefined}
            aria-describedby="schedule-err"
          />
        </label>
        <p id="schedule-err" className="small" style={{ color: 'var(--warn)', margin: 0 }} aria-live="polite">{err ?? ''}</p>
      </section>

      <button className="btn" disabled={!valid} onClick={save}>
        <Check size={18} aria-hidden="true" /> Kaydet
      </button>
      {msg && <p className="muted small" role="status">{msg}</p>}
      <p className="note">
        <Bell size={16} aria-hidden="true" />
        {!iosApp
          ? 'Hatırlatmalar yalnız iPhone uygulamasında gelir.'
          : remindOn
            ? 'Hatırlatma açık: seçtiğin günlerde bu saatte bildirim gelir. Takvimine daha önce eklediysen oradaki etkinliği sil.'
            : "Hatırlatmayı Bilgi → Hatırlatmalar'dan aç. Takvimine daha önce eklediysen oradaki etkinliği sil."}
      </p>
    </main>
  )
}
