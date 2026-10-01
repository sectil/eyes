import { useEffect, useRef, useState } from 'react'
import { PersonStanding, Footprints, MountainSnow, Eye, Check, SkipForward, House, Timer, Coffee } from 'lucide-react'
import { Citation } from '../../components/Sources.jsx'
import { sourceOf } from '../../lib/sources.js'
import { addHabit, loadHabits, habitsOn, dayKey } from '../../lib/habitLog.js'
import { loadFocus, startFocus, focusFits, FOCUS_HOURS } from '../../lib/focus.js'
import { cue } from '../../lib/cue.js'
import '../../styles/sources.css'
import './mola.css'

// Mola ekranı (sözleşme §5): Kalk → Pencereye/uzağa yürü → Uzağa bak (20 sn sayaç) → Yavaşça göz kırp → Bitti.
// Tam ekran, sakin; Atla her adımda var ve kayıtsız çıkar. Bitince addHabit('mola') (Gelişim'deki telefonda
// ölçme bu kaydı okur). Bitti ekranında çalışma oturumu (1/2/4 saat) başlatılabilir; yalnız bildirimi gelebilecekse
// (block: App focusBlock — 'off' hatırlatmalar kapalı, 'perm' bildirim izni yok, 'web'). Gelemeyecekse düğme yerine yol.
// Sağlık iddiası yok: "uzağa bak" adımının dayanağı bir mola düzeni çalışması (Galinsky 2007).
const LOOK_SEC = 20 // uzağa bakma sayacı. Molanın toplam ~1 dk sürmesi VARSAYIM (plan §5; Leppe-Zamora'da molalar 1–10 dk)
const SOURCE_ID = 'galinsky2007' // lib/sources.js; kayıt yoksa kaynak kartı gösterilmez, adı metinde kalır

const STEPS = [
  { id: 'stand', Icon: PersonStanding, title: 'Kalk', text: 'Yerinden kalk, bir an ayakta dur.', extra: 'İstersen: omuzlarını yavaşça geriye çevir.', next: 'Kalktım' },
  { id: 'walk', Icon: Footprints, title: 'Uzağa yürü', text: 'Pencereye ya da uzağı görebileceğin bir yere birkaç adım yürü.', next: 'Vardım' },
  { id: 'look', Icon: MountainSnow, title: 'Uzağa bak', text: 'Uzakta bir nokta seç ve ona bak. Süre dolunca sonraki adım gelir.', timed: true },
  { id: 'blink', Icon: Eye, title: 'Göz kırp', text: 'Yavaşça birkaç kez göz kırp.', extra: 'İstersen: gözlerini kapat, hafifçe sık, aç.', next: 'Bitti' },
]

const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const todayCount = (type) => habitsOn(loadHabits(), dayKey(new Date())).filter((h) => h.type === type).length

// Uzağa bakma sayacı: halka + kalan saniye (sayı her saniye değişir; ekran okuyucuya sabit ad verilir)
function LookDial({ left }) {
  const size = 200
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="mo-dial" role="img" aria-label={`${LOOK_SEC} saniyelik sayaç`}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="mo-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="mo-value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (left / LOOK_SEC)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="mo-sec" aria-hidden="true">{Math.ceil(left)}<small>saniye</small></span>
    </div>
  )
}

function Mola({ block = null, onSkip, onSaved, onHome, onReminders }) {
  const [step, setStep] = useState(0) // 0..STEPS.length-1; STEPS.length = bitti
  const [left, setLeft] = useState(LOOK_SEC)
  const [focus, setFocus] = useState(() => loadFocus())
  const [started, setStarted] = useState(false)
  const saved = useRef(false)
  const cur = STEPS[step]

  // Uzağa bakma adımı: sayaç dolunca kendiliğinden göz kırpma adımına geçer (telefona bakılmıyor olabilir;
  // cue titreşim ve ses tercihine uyar)
  useEffect(() => {
    if (!cur?.timed) return undefined
    const t0 = performance.now()
    setLeft(LOOK_SEC)
    const id = setInterval(() => {
      const l = Math.max(0, LOOK_SEC - (performance.now() - t0) / 1000)
      setLeft(l)
      if (l <= 0) {
        clearInterval(id)
        cue('Süre doldu. Yavaşça göz kırp.', false)
        setStep((s) => s + 1)
      }
    }, 200)
    return () => clearInterval(id)
  }, [cur?.timed, step])

  function next() {
    if (step === STEPS.length - 1 && !saved.current) {
      saved.current = true
      addHabit('mola')
      onSaved?.()
    }
    setStep((s) => Math.min(STEPS.length, s + 1))
  }

  function begin(hours) {
    const st = startFocus(hours)
    if (!st) return
    setFocus(st)
    setStarted(true)
    onSaved?.()
  }

  if (!cur) {
    const src = sourceOf(SOURCE_ID)
    return (
      <main className="screen mo fade-in">
        <div className="mo-center" aria-live="polite">
          <span className="mo-check"><Check size={40} strokeWidth={2.6} aria-hidden="true" /></span>
          <h1>Mola tamam</h1>
          <p className="mo-text">Kaydedildi. Hazır olduğunda devam edebilirsin.</p>
        </div>
        <div className="mo-foot">
          {focus?.nextBreakAt ? (
            <div className="card tone-accent mo-focus" aria-live="polite">
              <strong>{started ? 'Çalışma oturumu başladı' : 'Çalışma oturumu sürüyor'}</strong>
              <span className="small">Sıradaki mola {hhmm(focus.nextBreakAt)}</span>
            </div>
          ) : !focusFits() ? null /* Bug 33: gündüz penceresine mola sığmıyor (gece); oturum önerilmez */ : block === 'off' ? (
            <section className="card mo-focus" aria-label="Çalışma oturumu">
              <strong>Çalışmaya dönüyorsan: Çalışma oturumu</strong>
              <span className="muted small">Saatte bir mola bildirimi gelir. Bunun için önce hatırlatmaları aç.</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onReminders}>Hatırlatmalar</button>
            </section>
          ) : block === 'perm' ? (
            <section className="card mo-focus" aria-label="Çalışma oturumu">
              <strong>Çalışmaya dönüyorsan: Çalışma oturumu</strong>
              <span className="muted small">{'Saatte bir mola bildirimi gelir; bildirimler kapalı olduğu için şimdi başlatılamaz. Ayarlar > Nefona > Bildirimler.'}</span>
            </section>
          ) : block === 'web' ? null : (
            <section className="card mo-focus" aria-label="Çalışma oturumu">
              <strong>Çalışmaya dönüyorsan: Çalışma oturumu başlat</strong>
              <span className="muted small">Her saat bir mola bildirimi gelir. İstediğinde Ana sayfadan bitirebilirsin.</span>
              <div className="mo-hours" role="group" aria-label="Çalışma oturumu süresi">
                {FOCUS_HOURS.map((h) => (
                  <button key={h} type="button" className="btn btn-secondary btn-sm" onClick={() => begin(h)}>
                    <Timer size={16} aria-hidden="true" /> {h} saat
                  </button>
                ))}
              </div>
            </section>
          )}
          <button type="button" className="btn" onClick={onHome}><House size={18} aria-hidden="true" /> Ana sayfa</button>
          <p className="muted small mo-src">Kısa ek molalar bir iş yeri çalışmasında denendi (Galinsky 2007, veri girişi çalışanları). Buradaki 1 dakikalık düzen bizim uyarlamamız.</p>
          {src && (
            <details className="src-list mo-src">
              <summary>Kaynak</summary>
              <Citation id={SOURCE_ID} />
            </details>
          )}
        </div>
      </main>
    )
  }

  const Icon = cur.Icon
  return (
    <main className="screen mo fade-in">
      <div className="mo-top">
        <span className="mo-badge"><Coffee size={15} aria-hidden="true" /> 1 dakikalık mola</span>
        <div className="mo-dots" role="img" aria-label={`Adım ${step + 1} / ${STEPS.length}`}>
          {STEPS.map((s, i) => <i key={s.id} className={i < step ? 'done' : i === step ? 'on' : ''} />)}
        </div>
      </div>
      {/* canlı bölge sabit kalır (adım değişince okunur); içteki key adım geçişini yeniden oynatır */}
      <div className="mo-center" aria-live="polite">
        <div className="mo-step" key={cur.id}>
          {cur.timed ? <LookDial left={left} /> : <span className="mo-ic"><Icon size={44} strokeWidth={1.8} aria-hidden="true" /></span>}
          <h1>{cur.title}</h1>
          <p className="mo-text">{cur.text}</p>
          {cur.extra && <p className="mo-extra">{cur.extra}</p>}
        </div>
      </div>
      <div className="mo-foot">
        {!cur.timed && <button type="button" className="btn" onClick={next}><Check size={18} aria-hidden="true" /> {cur.next}</button>}
        <button type="button" className="btn btn-ghost" onClick={onSkip} aria-label="Molayı atla"><SkipForward size={18} aria-hidden="true" /> Atla</button>
      </div>
    </main>
  )
}

export default {
  icon: PersonStanding,
  sub: () => 'Kalk, uzağa bak · ~1 dk',
  badge: () => (todayCount('mola') > 0 ? 'Bugün tamam' : null),
  // onSaved: kayıt ya da çalışma oturumu değişti; App yeniden çizer (bildirim planını App yeniler)
  render: (ctx) => <Mola block={ctx.focusBlock ?? null} onSkip={ctx.back} onSaved={ctx.refresh} onHome={() => ctx.go('home')} onReminders={() => ctx.go('reminders')} />,
}
