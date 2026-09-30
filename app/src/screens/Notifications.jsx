import { Bell, BellOff, Moon, ChevronRight } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import PrefToggle from '../components/PrefToggle.jsx'
import { normalizeModuleReminders, LEGACY_ORDER, fromMinutes } from '../lib/moduleRemind.js'
import { normalizeQuiet, loadSlots } from '../lib/notifyAll.js'
import { normalizeReminders, TYPE_LABEL } from '../lib/reminders.js'
import { NAMES } from '../lib/remindTexts.js'
import { dayKey } from '../lib/habitLog.js'
import { dot, listTimes } from '../components/remindUi.js'
import { quietClashes } from './QuietHours.jsx'
import '../styles/remind.css'

// Profil → Bildirimler (PLAN.v1 §3.A.5; tasarım.html "Bildirimler", 5sn-tur8.md). Üstte Nef'in tek satırı, altında
// "Hatırlatmaların" (her "Bana hatırlat" ve deney türleri; saat düz yazıyla, anahtar), en altta "Gece sessizliği".
// Legacy ek saatleri salt okunur: "+ 13.00 · 17.00 · Bana hatırlat'tan" (§5.5 madde 1). Kapatılan satır listede kalır.
// Ana anahtar kapalıysa satırlar gri ve üstte "Bildirimler kapalı". Veriyi App hazırlar (K3):
//   modules: registry.reminders() · moduleReminders: settings.moduleReminders · reminders: settings.reminders
//   quiet: settings.quiet · next: { time: 'HH:MM', label } | null (sıradaki bildirim; planAll'dan)
//   slots: loadSlots() (varsayılan: depodan) · now
//   onToggle(moduleId, on) · onToggleLegacy(tür, on) (74xx türün anahtarı) · onOpen(moduleId) (saat sayfası) · onOpenReminders() (deney türleri) · onQuiet() · onBack
// VARSAYIM: "Nef'in haberleri" (B2/B3) ve "Değiştirilemeyenler" bu turda yok.
export default function Notifications({ modules = [], moduleReminders, reminders, quiet, next = null, slots, now = new Date(), onToggle, onToggleLegacy, onOpen, onOpenReminders, onQuiet, onBack }) {
  const r = normalizeReminders(reminders)
  const master = r.optIn === 'yes'
  const mr = normalizeModuleReminders(moduleReminders)
  const q = normalizeQuiet(quiet)
  const today = dayKey(new Date(now))
  const extras = (Array.isArray(slots) ? slots : loadSlots()).filter((s) => s.date === today)
  const clashes = quietClashes(reminders, quiet)
  // Satıra girmiş (açık ya da kapatılmış) modül hatırlatmaları; legacy türler aşağıda kendi satırında
  const rows = modules.filter((m) => !m.legacy && mr[m.module])
  const legacy = Object.keys(LEGACY_ORDER).filter((t) => r.types[t]?.on || (mr[t]?.times?.length ?? 0) > 0)

  const sub = (c) => (c.times.length > 1 ? listTimes(c.times) : c.times[0] ? `Her gün ${dot(c.times[0])}${c.mode === 'auto' ? ' · Nef seçti' : ''}` : '')

  return (
    <main className={`screen fade-in nt-scr${master ? '' : ' off'}`}>
      <PageHeader onBack={onBack} eyebrow="Profilim" title="Bildirimler" />
      {!master && <p className="nt-off" role="status"><BellOff size={18} aria-hidden="true" /> Bildirimler kapalı</p>}
      {master && next && (
        <p className="nt-next">Sıradaki: <b>{`${dot(next.time)} ${next.label}`}</b>. Hiçbiri üst üste gelmez.</p>
      )}

      <div className="nt-grp-h">Hatırlatmaların</div>
      <div className="list">
        {rows.map((m) => (
          <PrefToggle
            key={m.module}
            Icon={Bell}
            IconOff={BellOff}
            label={NAMES[m.module] ?? m.module}
            sub={sub(mr[m.module])}
            checked={master && mr[m.module].on}
            onChange={(v) => onToggle?.(m.module, v)}
            trailing={<button type="button" className="nt-edit" aria-label={`${NAMES[m.module] ?? m.module} saatleri`} onClick={() => onOpen?.(m.module)}><ChevronRight size={18} /></button>}
          />
        ))}
        {legacy.map((t) => {
          const ex = extras.find((s) => s.type === t)?.times ?? mr[t]?.times ?? []
          const cl = clashes.find((c) => c.type === t)
          return (
            <div key={t} className="nt-legacy">
              {/* Tasarım: her satır saat ve tek anahtar. Anahtar yalnız settings.reminders.types[t].on'u değiştirir (App
                  toggleLegacy; Hatırlatmalar ekranındaki anahtarla aynı). Satıra dokununca deney türünün ayrıntısı. */}
              <PrefToggle
                Icon={Bell}
                IconOff={BellOff}
                label={TYPE_LABEL[t]}
                sub={r.types[t].time ? `Her gün ${dot(r.types[t].time)}${mr[t]?.on && mr[t]?.mode === 'auto' ? ' · Nef seçti' : ''}` : ''}
                checked={master && Boolean(r.types[t].on)}
                onChange={(v) => onToggleLegacy?.(t, v)}
                trailing={<button type="button" className="nt-edit" aria-label={`${TYPE_LABEL[t]} saatleri`} onClick={() => onOpenReminders?.(t)}><ChevronRight size={18} /></button>}
              />
              {ex.length > 0 && <p className="nt-extra">{`+ ${ex.map(dot).join(' · ')} · Bana hatırlat'tan`}</p>}
              {cl && <p className="nt-warn">{`${dot(cl.time)} ${TYPE_LABEL[t]} gece sessizliğinin içinde; saatini değiştir`}</p>}
            </div>
          )
        })}
      </div>

      <div className="list nt-quiet">
        <button type="button" className="list-row nt-lrow" onClick={() => onQuiet?.()}>
          <Moon size={18} aria-hidden="true" />
          <span className="nt-l"><b>Gece sessizliği</b><span className="nt-s">{`${dot(q.from === 1440 ? '24:00' : fromMinutes(q.from))}–${dot(fromMinutes(q.to))}`}</span></span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </main>
  )
}
