import { useState } from 'react'
import { WEEKDAYS, activeDays, dayKey, isPlanned, monthGrid, weekProgress } from '../lib/calendar.js'

export default function Calendar({ records, schedule, onBack, onEditSchedule }) {
  const today = new Date()
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const active = activeDays(records)
  const week = weekProgress(active, today, schedule?.weeklyTarget)
  const planned = schedule?.days ?? []
  const grid = monthGrid(ym.y, ym.m)
  const title = new Date(ym.y, ym.m, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  const shift = (d) => {
    const x = new Date(ym.y, ym.m + d, 1)
    setYm({ y: x.getFullYear(), m: x.getMonth() })
  }

  return (
    <main className="screen">
      <h1>Takvim</h1>
      <section className={`card ${week.met ? 'card-ok' : ''}`}>
        <p className="big">Bu hafta {week.done} / {week.target} gün</p>
        <p className="muted small">
          {week.met
            ? 'Haftalık hedefe ulaştınız.'
            : 'Hedef haftada en az 3 gün. Bir günü kaçırmak sorun değil — önemli olan düzenli devam etmek.'}
        </p>
      </section>

      <div className="row between">
        <button className="btn btn-ghost" onClick={() => shift(-1)} aria-label="Önceki ay">‹</button>
        <h2 className="month-title">{title}</h2>
        <button className="btn btn-ghost" onClick={() => shift(1)} aria-label="Sonraki ay">›</button>
      </div>

      <table className="cal">
        <thead>
          <tr>{WEEKDAYS.map((w) => <th key={w.id}>{w.short}</th>)}</tr>
        </thead>
        <tbody>
          {grid.map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => {
                if (!d) return <td key={j} />
                const k = dayKey(d)
                const cls = [
                  active.has(k) && 'done',
                  isPlanned(d, planned) && 'planned',
                  k === dayKey(today) && 'today',
                ].filter(Boolean).join(' ')
                return (
                  <td key={j} className={cls} aria-label={`${d.getDate()}${active.has(k) ? ', yapıldı' : ''}`}>
                    {d.getDate()}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small legend-row">
        <span className="swatch done" /> yapıldı <span className="swatch planned" /> planlı gün
      </p>

      <button className="btn" onClick={onEditSchedule}>Çalışma günleri ve hatırlatma</button>
      <button className="btn btn-ghost" onClick={onBack}>Geri</button>
    </main>
  )
}
