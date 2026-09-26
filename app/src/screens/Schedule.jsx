import { useState } from 'react'
import { CalendarDays, Check, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { WEEKDAYS, DEFAULT_WEEKLY_TARGET } from '../lib/calendar.js'
import { buildReminderIcs, downloadIcs } from '../lib/ics.js'

export default function Schedule({ initial, onSave, onBack }) {
  const [days, setDays] = useState(initial?.days ?? ['MO', 'WE', 'FR'])
  const [time, setTime] = useState(initial?.time ?? '20:00')
  const [msg, setMsg] = useState(null)

  const toggle = (id) => setDays((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  const valid = days.length > 0 && /^\d{2}:\d{2}$/.test(time)

  function save() {
    onSave({ days, time, weeklyTarget: DEFAULT_WEEKLY_TARGET })
    setMsg('Kaydedildi.')
  }

  async function addToCalendar() {
    save()
    const r = await downloadIcs(buildReminderIcs({ days, time }))
    setMsg(r === 'shared' ? 'Paylaşım menüsünden Takvim uygulamasını seç.' : 'Dosya indirildi. Açınca telefonunun takvimine eklemeyi onayla.')
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
          <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </section>

      <button className="btn" disabled={!valid} onClick={addToCalendar}>
        <CalendarDays size={18} aria-hidden="true" /> Telefon takvimime ekle
      </button>
      <button className="btn btn-secondary" disabled={!valid} onClick={save}>
        <Check size={18} aria-hidden="true" /> Sadece kaydet
      </button>
      {msg && <p className="muted small" role="status">{msg}</p>}
      <p className="note">
        <ShieldCheck size={16} />
        Hatırlatmayı telefonunun takvimi yapar; uygulama bildirim göndermez, hiçbir veri sunucuya gitmez. Günleri değiştirirsen takvimdeki eski etkinliği silip yenisini ekle.
      </p>
    </main>
  )
}
