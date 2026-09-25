import { useState } from 'react'
import { ShieldCheck, TriangleAlert, ArrowRight, ArrowLeft, Zap } from 'lucide-react'
import { StepHeader, PageHeader } from '../components/ui.jsx'
import {
  emptyProfile, normalizeProfile, pageComplete, PAGES, RED_FLAGS, AGE_BANDS, CORRECTION, EXAM, SEIZURE, NEAR_DIFFICULTY,
  SCREEN_HOURS, SLEEP_MIN, SLEEP_MAX, NIGHT_PHONE, STRESS_FREQ, STRESS_ITEMS,
} from '../lib/profile.js'
import '../styles/profile.css'

// Profil anketi: 4 sayfa, 11 madde, ~2 dk (lib/profile.js). İlk kurulumda 1. adım; sonra Bilgi → Profilim'den
// düzenlenir. Kırmızı bayrak işaretlenirse devam edilmez (doktora yönlendirme; eski Screening kuralı).
const TITLES = {
  eye: ['Gözün', 'Sonuçlarını doğru yorumlamam için.'],
  flags: ['Şu anda bunlardan biri var mı?', 'Varsa önce bir göz doktoru görmelisin; uygulama bunları değerlendiremez.'],
  safety: ['Güvenlik ve yakın görme', 'Bazı pratiklerde hızlı yanıp sönen görüntüler var.'],
  life: ['Günün ve gecen', 'Ekran, uyku ve stres; planını buna göre kurarım.'],
}

function Chips({ options, value, onChange, name }) {
  return (
    <div className="pf-chips" role="radiogroup" aria-label={name}>
      {options.map((o, i) => {
        const id = typeof o === 'string' ? i : o.id
        const text = typeof o === 'string' ? o : o.text
        return (
          <button key={id} type="button" role="radio" aria-checked={value === id} className={`pf-chip${value === id ? ' on' : ''}`} onClick={() => onChange(id)}>
            {text}
          </button>
        )
      })}
    </div>
  )
}
function Radios({ options, value, onChange, name }) {
  return (
    <div className="stack">
      {options.map((o) => (
        <label key={o.id} className="choice">
          <input type="radio" name={name} checked={value === o.id} onChange={() => onChange(o.id)} />
          <span>{o.text}</span>
        </label>
      ))}
    </div>
  )
}

export default function Profile({ initial = null, step = 1, total = 3, editing = false, onDone, onBack }) {
  const [p, setP] = useState(() => normalizeProfile(initial) ?? emptyProfile())
  const [page, setPage] = useState(0)
  const key = PAGES[page]
  const set = (patch) => setP((q) => ({ ...q, ...patch }))
  const setStress = (id, v) => setP((q) => ({ ...q, stress: { ...q.stress, [id]: v } }))
  const toggleFlag = (id) => set({ flags: p.flags.includes(id) ? p.flags.filter((x) => x !== id) : [...p.flags, id] })
  const referred = p.flags.length > 0
  const ok = pageComplete(p, key)
  const last = page === PAGES.length - 1
  const [title, subtitle] = TITLES[key]

  function next() {
    if (!ok || (key === 'flags' && referred)) return
    if (last) onDone({ ...p, date: new Date().toISOString() })
    else setPage(page + 1)
  }
  function back() {
    if (page > 0) setPage(page - 1)
    else onBack?.()
  }

  return (
    <main className="screen fade-in pf">
      {editing ? (
        <PageHeader eyebrow={`Sayfa ${page + 1} / ${PAGES.length}`} title={title} subtitle={subtitle} onBack={back} />
      ) : (
        <StepHeader step={step} total={total} title={title} subtitle={`${subtitle} Sayfa ${page + 1} / ${PAGES.length}.`} />
      )}
      {editing && (
        <div className="pf-pages" aria-hidden="true">
          {PAGES.map((k, i) => <i key={k} className={i < page ? 'done' : i === page ? 'now' : ''} />)}
        </div>
      )}

      {key === 'eye' && (
        <>
          {page === 0 && !editing && (
            <div className="note">
              <ShieldCheck size={18} />
              <span>Bu uygulama fark etmeyi çalıştırır, ölçer ve izler. Teşhis koymaz, göz muayenesinin yerini tutmaz. Cevapların yalnızca bu telefonda kalır.</span>
            </div>
          )}
          <section className="stack">
            <h2>Yaş aralığın</h2>
            <Chips name="Yaş aralığı" options={AGE_BANDS} value={p.ageBand} onChange={(v) => set({ ageBand: v })} />
          </section>
          <section className="stack">
            <h2>Gözlük / lens durumun</h2>
            <Radios name="correction" options={CORRECTION} value={p.correction} onChange={(v) => set({ correction: v })} />
            <p className="muted small">Testlerde uzak gözlüğün varsa tak, okuma gözlüğünü takma.</p>
          </section>
          <section className="stack">
            <h2>Son göz muayenen</h2>
            <Radios name="exam" options={EXAM} value={p.lastExam} onChange={(v) => set({ lastExam: v })} />
            {p.lastExam === 'gt2' && p.ageBand && p.ageBand !== '18-39' && (
              <div className="card tone-warn small">40 yaş üstünde düzenli göz muayenesi önerilir. Uygulamayı kullanırken bir muayene planlamanı öneririz.</div>
            )}
          </section>
        </>
      )}

      {key === 'flags' && (
        <>
          <section className="stack">
            {RED_FLAGS.map((f) => (
              <label key={f.id} className="choice">
                <input type="checkbox" checked={p.flags.includes(f.id)} onChange={() => toggleFlag(f.id)} />
                <span>{f.text}</span>
              </label>
            ))}
            {!referred && <p className="muted small">Hiçbiri yoksa doğrudan devam et.</p>}
          </section>
          {referred && (
            <section className="card tone-danger" role="alert">
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <TriangleAlert size={20} style={{ flex: 'none', marginTop: 2 }} />
                <div className="stack" style={{ gap: 6 }}>
                  <h3>Lütfen önce bir göz doktoruna başvur</h3>
                  <p className="small">
                    İşaretlediğin belirtiler acil değerlendirme gerektirebilir; bu uygulama bunları değerlendiremez.
                    Aniden başladıysa bugün bir göz doktoruna veya acil servise git.
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {key === 'safety' && (
        <>
          <section className="stack">
            <h2 className="row" style={{ gap: 8 }}><Zap size={18} aria-hidden="true" style={{ color: 'var(--warn)' }} /> Epilepsi tanın var mı, ya da yanıp sönen ışık veya desenle bayılma-kasılma yaşadın mı?</h2>
            <Chips name="Nöbet" options={SEIZURE} value={p.seizure} onChange={(v) => set({ seizure: v })} />
            {p.seizure && p.seizure !== 'no' && (
              <p className="muted small">Hızlı yanıp sönen görüntü içeren pratikler senin için kapalı kalır; diğer her şey açık.</p>
            )}
          </section>
          <section className="stack">
            <h2>Son bir ayda küçük yazı (etiket, telefon, gazete) okurken ne kadar zorlandın?</h2>
            <Chips name="Küçük yazı" options={NEAR_DIFFICULTY} value={p.nearDifficulty} onChange={(v) => set({ nearDifficulty: v })} />
          </section>
        </>
      )}

      {key === 'life' && (
        <>
          <section className="stack">
            <h2>Günde kaç saat ekrana bakıyorsun? (iş + kişisel)</h2>
            <Chips name="Ekran saati" options={SCREEN_HOURS} value={p.screenHours} onChange={(v) => set({ screenHours: v })} />
          </section>
          <section className="stack">
            <h2>Son 7 gündeki uyku kaliteni 0–10 arasında nasıl değerlendirirsin?</h2>
            <div className="slider-row pf-sleep">
              <span className="muted small">Çok kötü</span>
              <input type="range" min={SLEEP_MIN} max={SLEEP_MAX} step={1} value={p.sleep ?? 5} aria-label="Uyku kalitesi" aria-valuetext={p.sleep == null ? 'seçilmedi' : String(p.sleep)} onChange={(e) => set({ sleep: Number(e.target.value) })} />
              <span className="muted small">Mükemmel</span>
            </div>
            <div className="pf-sleep-val" aria-hidden="true">{p.sleep == null ? 'Kaydırarak seç' : p.sleep}</div>
          </section>
          <section className="stack">
            <h2>Uykuya daldıktan sonra ya da gece uyanınca telefona bakar mısın?</h2>
            <Chips name="Gece telefon" options={NIGHT_PHONE} value={p.nightPhone} onChange={(v) => set({ nightPhone: v })} />
          </section>
          {STRESS_ITEMS.map((it) => (
            <section key={it.id} className="stack">
              <h2>{it.text}</h2>
              <Chips name={it.id} options={STRESS_FREQ} value={p.stress[it.id]} onChange={(v) => setStress(it.id, v)} />
            </section>
          ))}
          <p className="muted small">Bu cevaplar puan ya da tanı üretmez; yalnızca sana önerilen planı ve mola sürelerini ayarlar.</p>
        </>
      )}

      <div className="row pf-nav">
        {(page > 0 || (onBack && !editing)) && (
          <button type="button" className="btn btn-ghost" onClick={back}><ArrowLeft size={18} aria-hidden="true" /> Geri</button>
        )}
        <button type="button" className="btn" disabled={!ok || (key === 'flags' && referred)} onClick={next}>
          {last ? (editing ? 'Kaydet' : 'Bitir') : 'Devam'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      {key === 'flags' && referred && <p className="muted small">Belirtiler geçtikten ve doktorun onayladıktan sonra bu ekranı yeniden doldurabilirsin.</p>}
    </main>
  )
}
