import { useState } from 'react'
import { Check, Bell } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { WEEKDAYS, DEFAULT_WEEKLY_TARGET } from '../lib/calendar.js'
import { WEEK_ORDER, WEEKDAY_SHORT, WEEKDAY_LONG } from '../lib/alarm.js'
import { normalizeReminders } from '../lib/reminders.js'
import { nearTimes } from '../components/remindUi.js'
import NearNote from '../components/NearNote.jsx'
import '../styles/alarm.css'
import '../styles/reminders.css'

// Çalışma günleri (Takvim, Ana sayfa ve Gelişim bunu kullanır). Hatırlatması artık uygulama bildirimi
// (bildirim planı v2 §6; lib/notifyPlan.js "study"): Bilgi → Hatırlatmalar'dan açılır. Saat kısıtı yok (D5+D6):
// hatırlatma açıksa seçilen saatin 30 dk içindeki öteki bildirimler yalnız bilgi satırıyla söylenir (NearNote), Kaydet
// kapanmaz. reminders: settings.reminders (ham) — verilmezse bilgi satırı yok. others: kurulu bildirimler
// (remindUi.notifyTimes; App verir). iosApp false (web): bildirim yok, Hatırlatmalar satırı yok.
// Gün seçimi Hatırlatmalar ve alarm kurulumundaki yuvarlak çiplerle aynı ("Her gün" + Pt…Pz; styles/alarm.css);
// kayıt biçimi değişmedi: gün kimlikleri ('MO' …), dokunma sırasıyla eklenir, hepsi kaldırılabilir (Kaydet kapanır).
const DAY_NUM = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }
const NUM_DAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
export default function Schedule({ initial, reminders = null, others = [], iosApp = true, onSave, onBack }) {
  const [days, setDays] = useState(initial?.days ?? ['MO', 'WE', 'FR'])
  const [time, setTime] = useState(initial?.time ?? '20:00')
  const [msg, setMsg] = useState(null)

  const toggle = (id) => {
    setMsg(null)
    setDays((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  }
  const allDays = WEEKDAYS.every((w) => days.includes(w.id))
  const selectAll = () => {
    if (allDays) return
    setMsg(null)
    setDays((d) => [...d, ...WEEKDAYS.map((w) => w.id).filter((id) => !d.includes(id))])
  }
  const rem = reminders ? normalizeReminders(reminders) : null
  const studyOn = Boolean(rem?.types.study.on)
  const remindOn = studyOn && rem.optIn === 'yes'
  const valid = days.length > 0 && /^\d{2}:\d{2}$/.test(time)
  const near = remindOn ? nearTimes(time, others, 'study', days.map((d) => DAY_NUM[d])) : []

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
        <div className="rem-daysel" style={{ margin: '8px 0 4px' }}>
          <div className="al-chips">
            <button type="button" className={`al-chip${allDays ? ' on' : ''}`} aria-pressed={allDays} onClick={selectAll}>Her gün</button>
          </div>
          <div className="al-days" role="group" aria-label="Çalışma günleri">
            {WEEK_ORDER.map((x) => (
              <button key={x} type="button" role="checkbox" className="al-day" aria-checked={days.includes(NUM_DAY[x])} aria-label={WEEKDAY_LONG[x]} onClick={() => toggle(NUM_DAY[x])}>
                {WEEKDAY_SHORT[x]}
              </button>
            ))}
          </div>
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
          />
        </label>
        <NearNote near={near} />
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
