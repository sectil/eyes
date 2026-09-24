import { useState } from 'react'
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
    setMsg(
      r === 'shared'
        ? 'Paylaşım menüsünden Takvim uygulamasını seçin.'
        : 'Dosya indirildi. Açınca telefonunuzun takvimine eklemeyi onaylayın.',
    )
  }

  return (
    <main className="screen">
      <h1>Çalışma günleri</h1>
      <p className="muted">
        Haftada en az 3 gün öneriyoruz. Hatırlatmayı günlük bir alışkanlığınıza bağlarsanız
        (ör. akşam çayından sonra) sürdürmek kolaylaşır.
      </p>

      <section className="card">
        <div className="weekday-row">
          {WEEKDAYS.map((w) => (
            <button
              key={w.id}
              className={days.includes(w.id) ? 'day-pill on' : 'day-pill'}
              aria-pressed={days.includes(w.id)}
              onClick={() => toggle(w.id)}
            >
              {w.short}
            </button>
          ))}
        </div>
        {days.length > 0 && days.length < DEFAULT_WEEKLY_TARGET && (
          <p className="alert-warn small">Haftalık hedef 3 gün; en az 3 gün seçmeniz önerilir.</p>
        )}
        <label className="field">
          <span>Saat</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </section>

      <button className="btn" disabled={!valid} onClick={addToCalendar}>
        Telefon takvimine hatırlatma ekle
      </button>
      <button className="btn btn-ghost" disabled={!valid} onClick={save}>Sadece kaydet</button>
      {msg && <p className="muted small" role="status">{msg}</p>}
      <p className="muted small">
        Hatırlatmayı telefonunuzun takvimi yapar; uygulama size bildirim göndermez ve hiçbir
        veri sunucuya gitmez. Günleri değiştirirseniz takvimdeki eski etkinliği silip yenisini ekleyin.
      </p>
      <button className="btn btn-ghost" onClick={onBack}>Geri</button>
    </main>
  )
}
