import { useState } from 'react'
import { House, ChartLine, CalendarDays, BookOpen, Sun, Moon, Monitor, ChevronLeft } from 'lucide-react'
import { getThemePref, setThemePref } from '../lib/theme.js'

export const TABS = [
  { id: 'home', label: 'Bugün', Icon: House },
  { id: 'progress', label: 'Gelişim', Icon: ChartLine },
  { id: 'calendar', label: 'Takvim', Icon: CalendarDays },
  { id: 'info', label: 'Bilgi', Icon: BookOpen },
]

export function TabBar({ active, onChange }) {
  return (
    <nav className="tabbar" aria-label="Ana menü">
      <div className="tabbar-inner">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} aria-current={active === id ? 'page' : undefined} onClick={() => onChange(id)}>
            <Icon size={22} strokeWidth={active === id ? 2.4 : 1.8} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

// Apple Activity tarzı ilerleme halkası
export function Ring({ value, max, size = 104, stroke = 11, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, max ? value / max : 0))
  return (
    <div className="ring" style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} style={{ fill: 'none', stroke: 'var(--surface-3)', strokeWidth: stroke }} />
        {frac > 0 && <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={`${c * frac} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ fill: 'none', stroke: 'var(--accent-graphic)', strokeWidth: stroke, strokeLinecap: 'round', transition: 'stroke-dasharray 0.6s ease' }}
        />}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  )
}

// Küçük gidiş çizgisi. Varsayılan logMAR (düşük = iyi → yukarıda çizilir);
// higherIsBetter: okuma hızı gibi yüksek = iyi değerler
export function Sparkline({ values, width = 120, height = 36, higherIsBetter = false, color = 'var(--chart-line)' }) {
  if (!values || values.length < 2) return null
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 0.1
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * (width - 4) + 2,
    ((higherIsBetter ? hi - v : v - lo) / span) * (height - 8) + 4,
  ])
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  const [lx, ly] = pts.at(-1)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} style={{ fill: 'none', stroke: color, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
      <circle cx={lx} cy={ly} r="3.5" style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2 }} />
    </svg>
  )
}

export function PageHeader({ eyebrow, title, subtitle, onBack }) {
  return (
    <header className="page-header">
      {onBack && (
        <button className="btn-icon" onClick={onBack} aria-label="Geri" style={{ marginBottom: 6 }}>
          <ChevronLeft size={22} />
        </button>
      )}
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}

// Kurulum adımları (1/3 …)
export function StepHeader({ step, total, title, subtitle }) {
  return (
    <header className="page-header">
      <div className="stepper" aria-label={`Adım ${step} / ${total}`}>
        {Array.from({ length: total }, (_, i) => <span key={i} className={i < step ? 'on' : ''} />)}
      </div>
      <span className="eyebrow" style={{ marginTop: 10 }}>Adım {step} / {total}</span>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}

const THEME_OPTIONS = [
  { id: 'system', label: 'Sistem', Icon: Monitor },
  { id: 'light', label: 'Açık', Icon: Sun },
  { id: 'dark', label: 'Koyu', Icon: Moon },
]

export function ThemeSwitch() {
  const [pref, setPref] = useState(getThemePref())
  return (
    <div className="segmented" role="group" aria-label="Tema">
      {THEME_OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          aria-pressed={pref === id}
          onClick={() => {
            setThemePref(id)
            setPref(id)
          }}
        >
          <Icon size={16} aria-hidden="true" /> {label}
        </button>
      ))}
    </div>
  )
}

// Jev işareti: iris + göz bebeği, arada bir kırpar. Kamera kapalıyken kullanıcının kendi gözünün
// yerine durur. VARSAYIM: logo seçilene kadar geçici işaret (atlas K bölümü).
export function IrisMark({ size = 40 }) {
  return (
    <span className="iris-mark" style={{ width: size, height: size }} aria-hidden="true">
      <span className="iris-mark-iris" />
      <span className="iris-mark-lid" />
    </span>
  )
}
