import { useState } from 'react'
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import { PageHeader, Ring } from '../components/ui.jsx'
import { WEEKDAYS, activeDays, dayKey, isPlanned, monthGrid, weekProgress } from '../lib/calendar.js'

export default function Calendar({ records, schedule, onEditSchedule }) {
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
  const plannedLabel = planned.length
    ? `${WEEKDAYS.filter((w) => planned.includes(w.id)).map((w) => w.short).join(', ')} · ${schedule.time}`
    : 'Henüz çalışma günü seçilmedi'

  return (
    <>
      <PageHeader title="Takvim" subtitle="Düzen, gerçek değişimi görmenin tek yolu." />

      <section className="card card-hero">
        <div className="hero-row">
          <Ring value={week.done} max={week.target} size={84} stroke={9}>
            <span style={{ fontWeight: 750, fontSize: '1.15rem' }}>{week.done}/{week.target}</span>
          </Ring>
          <div className="stack" style={{ gap: 4 }}>
            <h2>{week.met ? 'Haftalık hedefe ulaştın' : 'Bu hafta'}</h2>
            <p className="muted small">
              {week.met ? 'Seri yok, baskı yok — her hafta yeniden başlar.' : 'Hedef haftada en az 3 gün. Bir günü kaçırmak sorun değil.'}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="row between">
          <button className="btn-icon" onClick={() => shift(-1)} aria-label="Önceki ay"><ChevronLeft size={20} /></button>
          <h2 className="month-title">{title}</h2>
          <button className="btn-icon" onClick={() => shift(1)} aria-label="Sonraki ay"><ChevronRight size={20} /></button>
        </div>
        <table className="cal">
          <thead>
            <tr>{WEEKDAYS.map((w) => <th key={w.id}>{w.short}</th>)}</tr>
          </thead>
          <tbody>
            {grid.map((wk, i) => (
              <tr key={i}>
                {wk.map((d, j) => {
                  if (!d) return <td key={j} />
                  const k = dayKey(d)
                  const cls = [active.has(k) && 'done', isPlanned(d, planned) && 'planned', k === dayKey(today) && 'today']
                    .filter(Boolean)
                    .join(' ')
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
        <div className="legend-row">
          <span className="swatch done" /> yapıldı <span className="swatch planned" /> planlı gün
        </div>
      </section>

      <button className="action" onClick={onEditSchedule}>
        <span className="icon-bubble"><Bell size={22} /></span>
        <span className="grow">
          <span className="title">Çalışma günleri ve hatırlatma</span>
          <span className="sub">{plannedLabel}</span>
        </span>
        <ChevronRight className="chev" size={20} />
      </button>
    </>
  )
}
