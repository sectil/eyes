import { Bell, BellOff, Moon, ChevronRight } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { normalizeModuleReminders, LEGACY_ORDER, fromMinutes, pickAutoTime } from '../lib/moduleRemind.js'
import { normalizeQuiet, loadSlots } from '../lib/notifyAll.js'
import { normalizeReminders, TYPE_LABEL } from '../lib/reminders.js'
import { NAMES } from '../lib/remindTexts.js'
import { dayKey } from '../lib/habitLog.js'
import { dot, listTimes } from '../components/remindUi.js'
import { quietClashes } from './QuietHours.jsx'
import '../styles/info.css'
import '../styles/remind.css'

// Profil → Bildirimler (PLAN.v1 §3.A.5; tasarım.html "Bildirimler", 5sn-tur8.md). Üstte Nef'in tek satırı, altında
// "Hatırlatmaların" (her "Bana hatırlat" ve deney türleri; saat düz yazıyla, anahtar), en altta "Gece sessizliği".
// Legacy ek saatleri salt okunur: "+ 13.00 · 17.00 · Bana hatırlat'tan" (§5.5 madde 1). Kapatılan satır listede kalır.
// Ana anahtar kapalıysa satırlar gri ve üstte "Bildirimler kapalı". Satır (tasarım .row-a): ikon, tek satır başlık, tek
// satır alt yazı (sığmazsa üç nokta), sağda TEK kontrol anahtar; satırın geri kalanı saat sayfasını açar (ok yok).
// Kapalı satırda da alt satır soluk durur: saati yoksa Nef'in önereceği saat (pickAutoTime, VARSAYIM). Veriyi App hazırlar (K3):
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

  // Tek satır: sol taraf saat sayfasını açar, sağda anahtar. Metin aynı; yalnız "Nef seçti" vurgu renginde (tasarım em).
  const row = (key, { label, sub: text, on, onTap, onFlip }) => (
    <div key={key} className={`nt-row${on ? ' on' : ''}`}>
      <button type="button" className="nt-main" aria-label={`${label} saatleri`} onClick={onTap}>
        <span className="nt-ri" aria-hidden="true">{on ? <Bell size={17} /> : <BellOff size={17} />}</span>
        <span className="nt-l">
          <b>{label}</b>
          {text && (
            <span className="nt-s">
              {on && text.endsWith(' · Nef seçti') ? <>{text.slice(0, -9)}<em>Nef seçti</em></> : text}
            </span>
          )}
        </span>
      </button>
      <button type="button" className="pref-toggle nt-sw" role="switch" aria-checked={on} aria-label={label} onClick={() => onFlip(!on)}>
        <span className="pref-switch" aria-hidden="true"><span className="pref-knob" /></span>
      </button>
    </div>
  )
  const idle = (m) => pickAutoTime({ remind: m, now }).times[0]

  const sub = (c) => (c.times.length > 1 ? listTimes(c.times) : c.times[0] ? `Her gün ${dot(c.times[0])}${c.mode === 'auto' ? ' · Nef seçti' : ''}` : '')

  return (
    <main className={`screen fade-in nt-scr${master ? '' : ' off'}`}>
      <PageHeader onBack={onBack} eyebrow="Profilim" title="Bildirimler" />
      {!master && <p className="nt-off" role="status"><BellOff size={18} aria-hidden="true" /> Bildirimler kapalı</p>}
      {master && next && (
        <p className="nt-next">Sıradaki: <b>{`${dot(next.time)} ${next.label}`}</b>. Hiçbiri üst üste gelmez.</p>
      )}

      <div className="nt-grp-h">Hatırlatmaların</div>
      <div className="list nt-list">
        {rows.map((m) => {
          const c = mr[m.module]
          const on = master && c.on
          const alt = sub(c) || (idle(m) ? `Her gün ${dot(idle(m))}` : '')
          return row(m.module, { label: NAMES[m.module] ?? m.module, sub: alt, on, onTap: () => onOpen?.(m.module), onFlip: (v) => onToggle?.(m.module, v) })
        })}
        {legacy.map((t) => {
          const ex = extras.find((s) => s.type === t)?.times ?? mr[t]?.times ?? []
          const cl = clashes.find((c) => c.type === t)
          return (
            <div key={t} className="nt-legacy">
              {/* Tasarım: her satır saat ve tek anahtar. Anahtar yalnız settings.reminders.types[t].on'u değiştirir (App
                  toggleLegacy; Hatırlatmalar ekranındaki anahtarla aynı). Satıra dokununca deney türünün ayrıntısı. */}
              {row(t, {
                label: TYPE_LABEL[t],
                sub: r.types[t].time ? `Her gün ${dot(r.types[t].time)}${mr[t]?.on && mr[t]?.mode === 'auto' ? ' · Nef seçti' : ''}` : '',
                on: master && Boolean(r.types[t].on),
                onTap: () => onOpenReminders?.(t),
                onFlip: (v) => onToggleLegacy?.(t, v),
              })}
              {ex.length > 0 && <p className="nt-extra">{`+ ${ex.map(dot).join(' · ')} · Bana hatırlat'tan`}</p>}
              {cl && <p className="nt-warn">{`${dot(cl.time)} ${TYPE_LABEL[t]} gece sessizliğinin içinde; saatini değiştir`}</p>}
            </div>
          )
        })}
      </div>

      <div className="list nt-quiet">
        <button type="button" className="list-row nt-lrow" onClick={() => onQuiet?.()}>
          <span className="nt-ri" aria-hidden="true"><Moon size={17} /></span>
          <span className="nt-l"><b>Gece sessizliği</b><span className="nt-s">{`${dot(q.from === 1440 ? '24:00' : fromMinutes(q.from))}–${dot(fromMinutes(q.to))}`}</span></span>
          <ChevronRight size={18} className="nt-chev" aria-hidden="true" />
        </button>
      </div>
    </main>
  )
}
