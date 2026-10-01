import { Moon, Minus, Plus, AlarmClock, Sun, Bell, Coffee, Info } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { normalizeQuiet, QUIET_FROM_RANGE, QUIET_TO_RANGE } from '../lib/notifyAll.js'
import { normalizeReminders, toMinutes, NUDGE_TYPES, TYPE_LABEL } from '../lib/reminders.js'
import { fromMinutes, normalizeModuleReminders } from '../lib/moduleRemind.js'
import { dot } from '../components/remindUi.js'
import '../styles/remind.css'

// Gece sessizliği (PLAN.v1 §3.A.4; tasarım gece-sessizligi-C, yön C, 5sn-b1a-yeni.md tur 3 geçti). Başlangıç
// 22.00–24.00, bitiş 06.00–10.00; 01.00–05.00 değişmez. Ayar yalnız Nef'in kendi saatlerine uygulanır: deney türünün
// saati sessizliğe düşerse bildirim düşürülmez, "Sessizlikte de gelenler" listesine eklenir. "{saat} {Tür} gece
// sessizliğinin içinde; saatini değiştir" uyarısı yalnız saati Nef seçtiyse çıkar (moduleReminders[tür] açık ve
// mode 'auto'); kişinin elle seçtiği saatte çıkmaz (sahip kararı 2026-10-01: "kullanıcı istediği saate kurar").
// Tasarımın üç notu: (1) uyarı saatlerin kehribar ailesinde, (2) "01.00–05.00 …" satırı büyük ve koyu,
// (3) pasif düğme nedenini söyler ("en geç 10.00").
//   quiet: settings.quiet ({ from, to } 'HH:MM'; yoksa 23.00–07.00) · reminders: settings.reminders
//   moduleReminders: settings.moduleReminders (saati Nef mi seçti)
//   onChange({ from, to }) · onOpenReminders(type): "Mola saatine git" (Hatırlatmalar ekranı) · onBack
const STEP = 30 // VARSAYIM: +/- 30 dakika
const F0 = toMinutes(QUIET_FROM_RANGE[0])
const F1 = 1440
const T0 = toMinutes(QUIET_TO_RANGE[0])
const T1 = toMinutes(QUIET_TO_RANGE[1])
const hm = (m) => dot(m === 1440 ? '24:00' : fromMinutes(m))
const store = (m) => (m === 1440 ? '00:00' : fromMinutes(m))

// Açık deney türlerinden saati sessizliğe düşenler (sessizlik: m >= from || m < to). nef: saati Nef seçti ("Nef
// seçsin"; Bildirimler'deki "Nef seçti" ile aynı ölçüt) — uyarı yalnız bunlarda.
export function quietClashes(reminders, quiet, moduleReminders = null) {
  const q = normalizeQuiet(quiet)
  const r = normalizeReminders(reminders)
  if (r.optIn !== 'yes') return []
  const mr = normalizeModuleReminders(moduleReminders)
  return NUDGE_TYPES.filter((t) => r.types[t]?.on).map((t) => ({ type: t, time: r.types[t].time, nef: Boolean(mr[t]?.on && mr[t]?.mode === 'auto') }))
    .filter(({ time }) => { const m = toMinutes(time); return m != null && (m >= q.from || m < q.to) })
}

function Stepper({ label, value, min, max, more, less, onSet }) {
  return (
    <div className="qh-ck">
      <div>
        <div className="qh-l">{label}</div>
        <div className="qh-v"><b>{hm(value)}</b><small>{`${hm(min)}–${hm(max)}`}</small></div>
        {/* Not 3 (5sn-b1a-yeni.md): pasif "+" nedenini söyler; saatin altında, tek satır */}
        {value >= max && <small className="qh-why">{`en geç ${hm(max)}`}</small>}
        {value <= min && <small className="qh-why">{`en erken ${hm(min)}`}</small>}
      </div>
      <div className="qh-stp">
        <button type="button" aria-label={more} disabled={value >= max} onClick={() => onSet(Math.min(max, value + STEP))}><Plus size={18} /></button>
        <button type="button" aria-label={less} disabled={value <= min} onClick={() => onSet(Math.max(min, value - STEP))}><Minus size={18} /></button>
      </div>
    </div>
  )
}

export default function QuietHours({ quiet, reminders, moduleReminders = null, onChange, onOpenReminders, onBack }) {
  const q = normalizeQuiet(quiet)
  const clashes = quietClashes(reminders, quiet, moduleReminders)
  const set = (patch) => {
    const n = { ...q, ...patch }
    onChange?.({ from: store(n.from), to: store(n.to) })
  }
  return (
    <main className="screen fade-in qh">
      <PageHeader onBack={onBack} eyebrow="Bildirimler" title="Gece sessizliği" subtitle="Bu saatlerde Nef'in seçtiği hatırlatmalar gelmez; senin seçtiğin saatler gelir." />
      <div className="qh-clocks">
        <Stepper label="Başlar" value={q.from} min={F0} max={F1} more="Geç başlat" less="Erken başlat" onSet={(v) => set({ from: v })} />
        <Stepper label="Biter" value={q.to} min={T0} max={T1} more="Geç bitir" less="Erken bitir" onSet={(v) => set({ to: v })} />
      </div>
      <p className="qh-core"><Moon size={18} aria-hidden="true" /><span>01.00–05.00 arası her gece sessiz; bu saatler değişmez.</span></p>
      {clashes.filter((c) => c.nef).map((c) => (
        <div key={c.type} className="qh-info" role="status">
          <Info size={18} aria-hidden="true" />
          <div>
            <p>{`${dot(c.time)} ${TYPE_LABEL[c.type]} gece sessizliğinin içinde; saatini değiştir`}</p>
            <button type="button" className="qh-link" onClick={() => onOpenReminders?.(c.type)}>{`${TYPE_LABEL[c.type]} saatine git`}</button>
          </div>
        </div>
      ))}
      <div className="qh-grp-h">Sessizlikte de gelenler</div>
      <div className="card qh-ls">
        <div className="qh-lr"><span className="qh-ri"><AlarmClock size={16} aria-hidden="true" /></span><b>Alarm</b></div>
        <div className="qh-lr"><span className="qh-ri"><Sun size={16} aria-hidden="true" /></span><b>Alarmdan sonraki hava</b></div>
        {clashes.map((c) => {
          const Icon = c.type === 'mola' ? Coffee : Bell // tasarım C: Mola fincan; öteki türler zil (VARSAYIM)
          return <div key={c.type} className="qh-lr"><span className="qh-ri"><Icon size={16} aria-hidden="true" /></span><b>{`${TYPE_LABEL[c.type]} hatırlatması`}</b><em>{dot(c.time)}</em></div>
        })}
      </div>
    </main>
  )
}
