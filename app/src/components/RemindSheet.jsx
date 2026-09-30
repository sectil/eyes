import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X } from 'lucide-react'
import { pickAutoTime, capOf, windowOf, fromMinutes } from '../lib/moduleRemind.js'
import { NAMES } from '../lib/remindTexts.js'
import { TYPE_LABEL } from '../lib/reminders.js'
import { applyRemind, checkTimes, dot, locTime } from './remindUi.js'
import '../styles/remind.css'

// "Bana hatırlat" saat sayfası (PLAN.v1 §3.A.2; tasarım.html "Nefesi ne zaman hatırlatayım?" ve "Göz egzersizleri
// tamam" ekranları). Alttan açılır. Üstte "Sen karar ver" (Önerilen; pickAutoTime), altında "Saatleri ben seçeyim"
// (en çok remind.maxTimes, varsayılan 3). Kurulumda 60 dk kuralı remindTimeError ile canlı denetlenir; hata varken
// Kaydet kapalı. Ayar yazmaz: onSave({ moduleReminders, reminders|null }) (components/remindUi.js applyRemind).
//   moduleId, remind: registry.reminders() kaydı ya da manifest remind · moduleReminders: settings.moduleReminders
//   reminders: settings.reminders (ilk açılışta optIn 'yes', varsayılanı açık mola kapanır; §A.2)
//   busy: başka bildirimlerin saatleri [{ time: 'HH:MM', label }] (label: "Mola" gibi; çakışma cümlesinde)
//   records: bu modülün yol dışı kayıtları (pickAutoTime) · permission: restNotify.notifyPermission değeri
//   onAskPermission: izin penceresi (App) · onWhy: "Bazı günler neden gelmez?" (yalnız legacy/deney türü)

// Sayfa başlığı modül adının belirtme hâliyle kurulur; tasarımda yalnız bu ikisi var.
// YER TUTUCU (metin kapısı bekliyor; dönüşte listelendi): remindSheet.title.<blink|yoga|gokyuzu|path>. Ekrana ham yer
// tutucu yazılmaz: onaylı cümle gelene kadar başlık modülün onaylı adıdır (remindTexts.js NAMES, legacy
// türde reminders.js TYPE_LABEL; ör. "Yoga", "Mola").
const TITLES = {
  routine: 'Göz egzersizini ne zaman hatırlatayım?',
  breath: 'Nefesi ne zaman hatırlatayım?',
}
const titleOf = (id) => TITLES[id] ?? NAMES[id] ?? TYPE_LABEL[id] ?? ''

// "Sen karar ver" nedeni. Veri yokken ve saat 16.30 iken plan cümlesi aynen; veriyle kurulan cümle modül adının
// hâlini istiyor (plan örneği yalnız nefes). YER TUTUCU (dönüşte listelendi): remindSheet.reason.default (16.30 dışı
// varsayılan saat) ve remindSheet.reason.data.<modül> (kayıtlardan). Onaylı cümle gelene kadar neden satırı çıkmaz
// (null); büyük saat yine görünür.
function reasonOf(moduleId, pick) {
  if (!pick || !pick.times.length) return null
  if (pick.source === 'default') {
    return pick.times[0] === '16:30'
      ? 'Henüz saatini bilmiyorum. 16.30\'la başlayalım; beş kez yaptıktan sonra senin saatine göre ayarlarım.'
      : null // YER TUTUCU remindSheet.reason.default
  }
  return null // YER TUTUCU remindSheet.reason.data.<modül>
}

export default function RemindSheet({
  moduleId,
  remind = {},
  moduleReminders,
  reminders,
  busy = [],
  records = [],
  permission = null,
  now = new Date(),
  onSave,
  onAskPermission,
  onWhy,
  onClose,
}) {
  const cap = capOf(moduleId, remind)
  const win = windowOf(remind)
  const [pick] = useState(() => pickAutoTime({ records, remind, now, busy: busy.map((b) => (typeof b === 'string' ? b : b?.time)), maxTimes: cap }))
  const [mode, setMode] = useState('auto')
  const [times, setTimes] = useState(() => (pick.times.length ? [pick.times[0]] : [fromMinutes(win.from)]))
  const [permNote, setPermNote] = useState(false)
  const checks = checkTimes(times, remind, busy)
  const bad = mode === 'manual' && checks.some((c) => c.error)

  function save(chosen, m) {
    if (!chosen.length) return
    // İzin yoksa önce bizim cümlemiz, sonra iOS penceresi (§A.2)
    if (permission === 'prompt' && !permNote) {
      setPermNote(true)
      return
    }
    onSave?.(applyRemind({ moduleId, remind, moduleReminders, reminders, mode: m, times: chosen, now }))
    if (permission === 'prompt') onAskPermission?.()
  }

  const setAt = (i, v) => setTimes((ts) => ts.map((t, j) => (j === i ? v : t)))

  return createPortal(
    <div className="rs-back" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="rs-sheet" role="dialog" aria-modal="true" aria-labelledby="rs-title">
        <span className="rs-grab" aria-hidden="true" />
        <button type="button" className="rs-x" aria-label="Kapat" onClick={() => onClose?.()}><X size={20} /></button>
        <h2 id="rs-title" className="rs-title">{titleOf(moduleId)}</h2>

        <div className="rs-seg" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'auto'} className={mode === 'auto' ? 'on' : ''} onClick={() => setMode('auto')}>Sen karar ver</button>
          <button type="button" role="tab" aria-selected={mode === 'manual'} className={mode === 'manual' ? 'on' : ''} onClick={() => setMode('manual')}>Saatleri ben seçeyim</button>
        </div>

        {mode === 'auto' ? (
          <div className="rs-auto">
            <span className="rs-tag">Önerilen</span>
            <strong className="rs-big">{pick.times.map(dot).join(' · ') || '—'}</strong>
            {reasonOf(moduleId, pick) && <p className="rs-why">{reasonOf(moduleId, pick)}</p>}
            {pick.times.length === 2 ? (
              <div className="rs-btns">
                <button type="button" className="btn" onClick={() => save(pick.times, 'auto')}>İkisinde</button>
                <button type="button" className="btn btn-secondary" onClick={() => save(pick.times.slice(0, 1), 'auto')}>Yalnız sabah</button>
              </div>
            ) : (
              <button type="button" className="btn" disabled={!pick.times.length} onClick={() => save(pick.times, 'auto')}>Hatırlatmayı aç</button>
            )}
          </div>
        ) : (
          <div className="rs-manual">
            {checks.map((c, i) => (
              <div key={i} className="rs-row">
                <label className="rs-time">
                  <input
                    className="input rs-input"
                    type="time"
                    value={c.time}
                    aria-label={`${i + 1}. saat`}
                    aria-invalid={c.error ? true : undefined}
                    onChange={(e) => setAt(i, e.target.value)}
                  />
                  {times.length > 1 && (
                    <button type="button" className="rs-del" aria-label={`${dot(c.time)} saatini kaldır`} onClick={() => setTimes((ts) => ts.filter((_, j) => j !== i))}><X size={18} /></button>
                  )}
                </label>
                {c.error === 'gap' && c.clash?.label && (
                  <div className="rs-clash" role="status">
                    <p>{`${locTime(c.clash.time)} ${c.clash.label} var.`}</p>
                    {c.suggest && (
                      <>
                        <p>Bir saat sonra olsun mu?</p>
                        <button type="button" className="btn btn-secondary" onClick={() => setAt(i, c.suggest)}>{`${dot(c.suggest)} yap`}</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            {times.length < cap && (
              <button type="button" className="btn btn-ghost rs-more" onClick={() => setTimes((ts) => [...ts, fromMinutes(win.to)])}>
                <Plus size={18} aria-hidden="true" /> Bir saat daha
              </button>
            )}
            <p className={`rs-win${checks.some((c) => c.error === 'window') ? ' bad' : ''}`}>
              {`${dot(fromMinutes(win.from))}–${dot(fromMinutes(win.to))} arasında, günde en çok ${cap} saat.`}
            </p>
            <button type="button" className="btn" disabled={bad} onClick={() => save(times, 'manual')}>Kaydet</button>
          </div>
        )}

        {remind.legacy && onWhy && <button type="button" className="rs-link" onClick={() => onWhy()}>Bazı günler neden gelmez?</button>}
        {permNote && <p className="rs-note" role="status">Hatırlatmayı sana bildirimle göndereceğim; bir sonraki pencerede izin istenecek.</p>}
        {permission === 'denied' && <p className="rs-note" role="status">{'Bildirimler kapalı: Ayarlar > Nefona > Bildirimler.'}</p>}
      </div>
    </div>,
    document.body,
  )
}
