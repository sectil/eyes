import { Bell, BellOff, Moon, ChevronRight, AlarmClock, Sun, Plus, Footprints } from 'lucide-react'
import { PageHeader } from '../components/ui.jsx'
import { normalizeModuleReminders, LEGACY_ORDER, fromMinutes, pickAutoTime } from '../lib/moduleRemind.js'
import { normalizeQuiet, loadSlots } from '../lib/notifyAll.js'
import { normalizeReminders, TYPE_LABEL } from '../lib/reminders.js'
import { NAMES } from '../lib/remindTexts.js'
import { dayKey } from '../lib/habitLog.js'
import { daysLabel } from '../lib/alarm.js'
import { dot, listTimes } from '../components/remindUi.js'
import { viewFor } from '../modules/views.js'
import { quietClashes } from './QuietHours.jsx'
import '../styles/info.css'
import '../styles/remind.css'

// Profil → Bildirimler (PLAN.v1 §3.A.5; tasarım b1a-son/ekranlar.html N, 5 sn kapısı son tur 4/5). Yukarıdan aşağı:
// "Sıradaki" vurgulu tek satır (zil), Gece sessizliği kartı (kehribar büyük saat aralığı; dokununca Gece sessizliği),
// "Hatırlatmaların" (yalnız kurulan "Bana hatırlat" ve deney türleri), "Hatırlatma ekle" hapları (kurulmamışlar; D14,
// sahip 2026-10-03) ve "Sessizlikte de gelenler" kısa özeti (QuietHours etiketleri).
// Satır: modülün kendi simgesi (modules/<id>/view.jsx icon; yoksa zil), tek satır başlık, tek satır alt yazı (saat kalın,
// "Nef seçti" düz vurgu metni; rozet ve Nef simgesi yok), sağda TEK kontrol anahtar; satırın geri kalanı saat sayfasını
// açar (ok yok). Kapalı satırda nokta yok: simge gri, alt yazı soluk; saati yoksa Nef'in önereceği saat (pickAutoTime,
// VARSAYIM; yalnız kurulmuş ama saatsiz kalmış satırda). Legacy ek saatleri salt okunur: "+ 13.00 · 17.00 · Bana hatırlat'tan" (§5.5 madde 1). Kapatılan satır
// listede kalır. Ana anahtar kapalıysa satırlar gri ve üstte "Bildirimler kapalı". Veriyi App hazırlar (K3):
//   modules: registry.reminders() · moduleReminders: settings.moduleReminders · reminders: settings.reminders
//   quiet: settings.quiet · next: { time: 'HH:MM', label } | null (sıradaki bildirim; planAll'dan)
//   slots: loadSlots() (varsayılan: depodan) · now
//   onToggle(moduleId, on) · onToggleLegacy(tür, on) (74xx türün anahtarı) · onOpen(moduleId) (saat sayfası) · onOpenReminders() (deney türleri) · onQuiet() · onBack
// VARSAYIM: "Nef'in haberleri" (B2/B3) ve "Değiştirilemeyenler" bu turda yok.
// Yürüyüşün modül görünümü yok (deney türü): kendi simgesi, zil değil (Ana sayfadaki adım hapıyla aynı)
const LEGACY_ICON = { walk: Footprints }
const iconOf = (id) => viewFor(id)?.icon ?? LEGACY_ICON[id] ?? Bell

export default function Notifications({ modules = [], moduleReminders, reminders, quiet, next = null, slots, now = new Date(), onToggle, onToggleLegacy, onOpen, onOpenReminders, onQuiet, onBack }) {
  const r = normalizeReminders(reminders)
  const master = r.optIn === 'yes'
  const mr = normalizeModuleReminders(moduleReminders)
  const q = normalizeQuiet(quiet)
  const today = dayKey(new Date(now))
  const extras = (Array.isArray(slots) ? slots : loadSlots()).filter((s) => s.date === today)
  const clashes = quietClashes(reminders, quiet, moduleReminders)
  // Yalnız kurulan hatırlatmalar listelenir (sahip kararı 2026-10-03, D14: "Yalnız kurduklarım"; uygulamadaki hâlde
  // kurulmamış beş modül aynı "Her gün 16.30" önerisiyle alt alta duruyordu, 5 sn kapısı 1/5). Kurulmuş = ayarı var
  // (kapatılan da listede kalır). Kurulmamışlar altta "Hatırlatma ekle" haplarında: saatsiz, anahtarsız; dokununca saat
  // sayfası (modül) ya da Hatırlatmalar (legacy tür).
  const rows = modules.filter((m) => !m.legacy && mr[m.module])
  const addRows = modules.filter((m) => !m.legacy && !mr[m.module])
  const legacy = Object.keys(LEGACY_ORDER).filter((t) => r.types[t]?.on || (mr[t]?.times?.length ?? 0) > 0)
  const addLegacy = Object.keys(LEGACY_ORDER).filter((t) => TYPE_LABEL[t] && !legacy.includes(t))

  // Alt yazı parçaları: { pre, t, nef }. Metin aynı ("Her gün 09.15 · Nef seçti", "10.00, 13.30 ve 18.00"); açıkken
  // saat kalın, "Nef seçti" vurgu renginde düz metin (tasarım .rt b / em); kapalıyken hepsi soluk düz yazı.
  const line = (on, p) => {
    if (!p) return null
    const nef = p.nef ? ' · Nef seçti' : ''
    return on ? <>{p.pre}<b>{p.t}</b>{p.nef && <>{' · '}<em>Nef seçti</em></>}</> : `${p.pre}${p.t}${nef}`
  }
  // Tek satır: sol taraf saat sayfasını açar, sağda anahtar.
  const row = (key, { label, Icon, sub: parts, on, onTap, onFlip }) => (
    <div key={key} className={`nt-row${on ? ' on' : ''}`}>
      <button type="button" className="nt-main" aria-label={`${label} saatleri`} onClick={onTap}>
        <span className="nt-ri" aria-hidden="true"><Icon size={19} /></span>
        <span className="nt-l">
          <b>{label}</b>
          {parts && <span className="nt-s">{line(on, parts)}</span>}
        </span>
      </button>
      <button type="button" className="pref-toggle nt-sw" role="switch" aria-checked={on} aria-label={label} onClick={() => onFlip(!on)}>
        <span className="pref-switch" aria-hidden="true"><span className="pref-knob" /></span>
      </button>
    </div>
  )
  const idle = (m) => pickAutoTime({ remind: m, now }).times[0]

  const sub = (c) => (c.times.length > 1 ? { pre: '', t: listTimes(c.times), nef: false } : c.times[0] ? { pre: 'Her gün ', t: dot(c.times[0]), nef: c.mode === 'auto' } : null)
  const qFrom = dot(q.from === 1440 ? '24:00' : fromMinutes(q.from))

  return (
    <main className={`screen fade-in nt-scr${master ? '' : ' off'}`}>
      <PageHeader onBack={onBack} eyebrow="Profilim" title="Bildirimler" />
      {!master && <p className="nt-off" role="status"><BellOff size={18} aria-hidden="true" /> Bildirimler kapalı</p>}
      {master && next && (
        <p className="nt-next"><Bell size={18} aria-hidden="true" /><span>Sıradaki: <b>{`${dot(next.time)} ${next.label}`}</b>.</span></p>
      )}

      {/* Gece sessizliği: listenin üstünde, QuietHours .qh-clocks yüzeyi (kehribar saat ailesi), büyük saat aralığı */}
      <button type="button" className="nt-quiet" onClick={() => onQuiet?.()}>
        <span className="nt-q-t"><Moon size={17} aria-hidden="true" />Gece sessizliği</span>
        <span className="nt-q-range">{`${qFrom}–${dot(fromMinutes(q.to))}`}</span>
        <span className="nt-q-s">Bu saatlerde Nef'in seçtiği hatırlatmalar gelmez; senin seçtiğin saatler gelir.</span>
        <ChevronRight size={20} className="nt-chev" aria-hidden="true" />
      </button>

      <div className="nt-grp-h">Hatırlatmaların</div>
      {rows.length === 0 && legacy.length === 0 && <p className="nt-empty">Henüz kurduğun hatırlatma yok.</p>}
      {(rows.length > 0 || legacy.length > 0) && <div className="nt-list">
        {rows.map((m) => {
          const c = mr[m.module]
          const on = Boolean(master && c?.on)
          const alt = (c && sub(c)) || (idle(m) ? { pre: 'Her gün ', t: dot(idle(m)), nef: false } : null)
          return row(m.module, { label: NAMES[m.module] ?? m.module, Icon: iconOf(m.module), sub: alt, on, onTap: () => onOpen?.(m.module), onFlip: (v) => onToggle?.(m.module, v) })
        })}
        {legacy.map((t) => {
          const ex = extras.find((s) => s.type === t)?.times ?? mr[t]?.times ?? []
          // Uyarı yalnız saati Nef seçtiyse; kişinin elle seçtiği saat sessizlikte de gelir (sahip kararı 2026-10-01)
          const cl = clashes.find((c) => c.type === t && c.nef)
          return (
            <div key={t} className="nt-legacy">
              {/* Tasarım: her satır saat ve tek anahtar. Anahtar yalnız settings.reminders.types[t].on'u değiştirir (App
                  toggleLegacy; Hatırlatmalar ekranındaki anahtarla aynı). Satıra dokununca deney türünün ayrıntısı. */}
              {row(t, {
                label: TYPE_LABEL[t],
                Icon: iconOf(t),
                // Gün: Hatırlatmalar'daki gün çipleri (D5+D6); hepsi seçiliyse "Her gün"
                sub: r.types[t].time ? { pre: `${daysLabel(r.types[t].days)} `, t: dot(r.types[t].time), nef: Boolean(mr[t]?.on && mr[t]?.mode === 'auto') } : null,
                on: master && Boolean(r.types[t].on),
                onTap: () => onOpenReminders?.(t),
                onFlip: (v) => onToggleLegacy?.(t, v),
              })}
              {ex.length > 0 && <p className="nt-extra">{`+ ${ex.map(dot).join(' · ')} · Bana hatırlat'tan`}</p>}
              {cl && <p className="nt-warn">{`${dot(cl.time)} ${TYPE_LABEL[t]} gece sessizliğinin içinde; saatini değiştir`}</p>}
            </div>
          )
        })}
      </div>}

      {/* Hatırlatma ekle: kurulmamış modüller ve deney türleri, saatsiz hap; dokununca saati sen seçersin */}
      {(addRows.length > 0 || addLegacy.length > 0) && <>
        <div className="nt-grp-h">Hatırlatma ekle</div>
        <div className="nt-add">
          {addRows.map((m) => {
            const label = NAMES[m.module] ?? m.module
            const Icon = iconOf(m.module)
            return (
              <button key={m.module} type="button" className="nt-chip" aria-label={`${label} saatleri`} onClick={() => onOpen?.(m.module)}>
                <Plus size={15} strokeWidth={2.4} aria-hidden="true" className="nt-plus" /><Icon size={16} aria-hidden="true" />{label}
              </button>
            )
          })}
          {addLegacy.map((t) => {
            const Icon = iconOf(t)
            return (
              <button key={t} type="button" className="nt-chip" aria-label={`${TYPE_LABEL[t]} saatleri`} onClick={() => onOpenReminders?.(t)}>
                <Plus size={15} strokeWidth={2.4} aria-hidden="true" className="nt-plus" /><Icon size={16} aria-hidden="true" />{TYPE_LABEL[t]}
              </button>
            )
          })}
        </div>
      </>}

      {/* Sessizlikte de gelenler: kısa özet (QuietHours listesinin ilk iki satırı) */}
      <div className="nt-grp-h">Sessizlikte de gelenler</div>
      <div className="nt-al">
        <span><AlarmClock size={17} aria-hidden="true" /><b>Alarm</b></span>
        <span><Sun size={17} aria-hidden="true" /><b>Alarmdan sonraki hava</b></span>
      </div>
    </main>
  )
}
