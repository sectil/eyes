import { useState } from 'react'
import { Bell, ChevronRight } from 'lucide-react'
import { normalizeModuleReminders, pickAutoTime } from '../lib/moduleRemind.js'
import RemindSheet from './RemindSheet.jsx'
import { dot, listTimes, shownTimes } from './remindUi.js'
import '../styles/remind.css'

// "Bana hatırlat" satırı (PLAN.v1 §3.A.2; tasarım.html "Nefes tamam" ekranı): bitiş özetinin altında, "Ana sayfaya
// dön"ün üstünde. Solda zil (yumuşak vurgu zemini), "Bana hatırlat" ve alt yazı, sağda Nef'in önerdiği saat soluk ve ok.
// Dokununca saat sayfası (RemindSheet). Kurulunca "Hatırlatman açık · Her gün 09.15 · saati Nef seçti".
// Yol içinde açılan modülde çıkmaz (§A.2 "Birim yoldur"): inPath true → null.
// Props (App ctx.remindField(route) bunları doldurur; K3):
//   moduleId, remind (registry.reminders() kaydı) · settings: { moduleReminders, reminders } · busy, records,
//   permission, now · onChange({ moduleReminders, reminders|null }) → App store.setSetting ile yazar ve planı yeniden kurar
//   onAskPermission, onWhy · inPath
export default function RemindField({ moduleId, remind, settings = {}, busy = [], records = [], permission = null, now, inPath = false, onChange, onAskPermission, onWhy }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false) // bu açılışta kuruldu: onay titreşimi App'te (VARSAYIM)
  if (inPath || !moduleId || !remind) return null
  const cfg = normalizeModuleReminders(settings.moduleReminders)[moduleId]
  const on = cfg?.on === true
  const times = shownTimes(moduleId, remind, settings.moduleReminders, settings.reminders)
  const hint = on ? null : pickAutoTime({ records, remind, now: now ?? new Date(), busy: busy.map((b) => (typeof b === 'string' ? b : b?.time)) }).times[0]

  // Açık satır: plan cümlesi "Hatırlatman açık · Her gün 09.15 · saati Nef seçti". Elle seçilende son parça yok;
  // birden çok saatte §A.5 biçimi ("10.00, 13.30 ve 18.00").
  const onText = times.length > 1
    ? `Hatırlatman açık · ${listTimes(times)}`
    : `Hatırlatman açık · Her gün ${dot(times[0])}${cfg?.mode === 'auto' ? ' · saati Nef seçti' : ''}`

  return (
    <>
      <button type="button" className={`rf-row${on ? ' on' : ''}${done ? ' done' : ''}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="rf-ico" aria-hidden="true"><Bell size={20} /></span>
        {on ? (
          <span className="rf-text"><strong>{onText}</strong></span>
        ) : (
          <span className="rf-text">
            <strong>Bana hatırlat</strong>
            <span className="rf-sub">Her gün, senin için uygun saatte. Saati Nef de seçebilir.</span>
          </span>
        )}
        {hint && <span className="rf-hint">{dot(hint)}</span>}
        <ChevronRight size={18} className="rf-go" aria-hidden="true" />
      </button>
      {open && (
        <RemindSheet
          moduleId={moduleId}
          remind={remind}
          moduleReminders={settings.moduleReminders}
          reminders={settings.reminders}
          busy={busy}
          records={records}
          permission={permission}
          now={now ?? new Date()}
          onAskPermission={onAskPermission}
          onWhy={onWhy}
          onClose={() => setOpen(false)}
          onSave={(next) => {
            setOpen(false)
            setDone(true)
            onChange?.(next)
          }}
        />
      )}
    </>
  )
}
