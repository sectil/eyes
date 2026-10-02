import { useState } from 'react'
import { Eye, Check } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { promptFor, makeRecord, weekDays, COUNTS, NOTE_MAX, isNotice } from '../lib/notice.js'
import { doneToday } from '../lib/today.js'
import '../styles/profile.css' // pf-chips

// Günlük fark etme görevi (lib/notice.js). Sabah görevi gör; akşam kaç tane fark ettiğini kaydet.
export default function NoticeTask({ sessions = [], onBack, onSave }) {
  const now = new Date()
  const prompt = promptFor(now)
  const tomorrow = promptFor(new Date(now.getTime() + 86400000))
  const done = doneToday(sessions, 'notice', now)
  const todayRec = sessions.filter(isNotice).filter((s) => new Date(s.date).toDateString() === now.toDateString()).at(-1)
  const [count, setCount] = useState(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const days = weekDays(sessions, now) + (saved && !done ? 1 : 0)

  function save() {
    onSave?.(makeRecord({ prompt, count, note }))
    setSaved(true)
  }

  return (
    <main className="screen fade-in">
      <PageHeader onBack={onBack} eyebrow="Farkındalık · bugünün görevi" title={prompt.text} subtitle={prompt.ex} />
      <section className="card card-hero stack" style={{ gap: 10, alignItems: 'center', textAlign: 'center' }}>
        <span className="rl-free-ic" style={{ width: 56, height: 56, borderRadius: 18 }}><Eye size={28} aria-hidden="true" /></span>
        <span className="muted small">Gün içinde aklında tut. Akşam buraya dön ve kaç tane fark ettiğini yaz.</span>
        <span className="small"><strong>Bu hafta {days} / 7 gün</strong></span>
      </section>

      {done || saved ? (
        <section className="card stack" style={{ gap: 6 }}>
          <span className="row" style={{ gap: 8, color: 'var(--ok)' }}><Check size={18} aria-hidden="true" /> <strong>Bugün kaydedildi</strong></span>
          {todayRec && <span className="muted small">{COUNTS[todayRec.count]} fark ettin{todayRec.note ? ` · ${todayRec.note}` : ''}</span>}
          <span className="muted small">Yarının görevi: {tomorrow.text.toLocaleLowerCase('tr')}.</span>
        </section>
      ) : (
        <section className="card stack" style={{ gap: 10 }}>
          <strong>Kaç tane fark ettin?</strong>
          <div className="pf-chips" role="radiogroup" aria-label="Kaç tane">
            {COUNTS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={count === c} className={`pf-chip${count === c ? ' on' : ''}`} onClick={() => setCount(c)}>{c}</button>
            ))}
          </div>
          <label className="field">
            <span>Ne fark ettin? (isteğe bağlı)</span>
            <input className="input" type="text" maxLength={NOTE_MAX} placeholder="Örn. yaya lambası, bir posta kutusu" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button type="button" className="btn" disabled={count == null} onClick={save}>Kaydet</button>
        </section>
      )}
      <p className="note small">Dikkatini dışarıya yönelten küçük bir alıştırma; bir şeyi iyileştirdiği iddia edilmez. Notun yalnızca bu telefonda kalır.</p>
    </main>
  )
}
