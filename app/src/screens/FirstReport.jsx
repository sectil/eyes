import { useMemo } from 'react'
import { CalendarCheck, Clock, Flame } from 'lucide-react'
import { firstReport, DOMAIN_LABEL } from '../lib/progress.js'
import { metricStatus, effectStatus } from '../components/ProgressOverview.jsx'
import { decimalTr } from '../lib/stats.js'
import '../styles/progress2.css'

// 5. gün "İlk rapor" (Gelişim 2.0; onaylı): deneme 7 gün, kullanıcı ödeme kararından önce görsün.
// Yalnız kısa sürede gerçekten ölçülebilenler: düzen, oturum öncesi→sonrası etkiler, modül metrikleri.
// Göz ve WHO-5 için dürüst durum: göz 8–21. günde başlangıç oluşturur; WHO-5 14 günde bir.
const num = (v, d = 1) => (Number.isFinite(v) ? decimalTr(v, d) : '–')
const signed = (v, d = 1) => (Number.isFinite(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${decimalTr(Math.abs(v), d)}` : '–')

export default function FirstReport({ tests = [], sessions = [], start, onClose, onProgress }) {
  const r = useMemo(() => firstReport({ tests, sessions, start, now: new Date() }), [tests, sessions, start])
  const effects = [...r.acute].sort((a, b) => Number(b.sig) - Number(a.sig) || b.n - a.n)
  const p = r.practice
  return (
    <main className="screen fade-in p2-detail">
      <header className="page-header" style={{ paddingTop: 8 }}>
        <span className="eyebrow">İlk rapor · {r.day ?? '–'}. gün</span>
        <h1>İlk günlerinde neler oldu</h1>
        <p>Yalnız kısa sürede gerçekten ölçülebilenler. Göz ve iyi oluş için doğru zaman aşağıda yazıyor.</p>
      </header>

      <section className="card p2-card">
        <span className="eyebrow">Düzen</span>
        <div className="p2-kv">
          <div><b><CalendarCheck size={14} aria-hidden="true" /> {p.activeDays}</b><span>aktif gün</span></div>
          <div><b><Clock size={14} aria-hidden="true" /> {p.minutes}</b><span>dakika</span></div>
          <div><b><Flame size={14} aria-hidden="true" /> {p.streakDays}</b><span>gün seri</span></div>
        </div>
      </section>

      <section className="card p2-card">
        <span className="eyebrow">Uygulamalardan sonra</span>
        {effects.length ? (
          effects.map((e) => (
            <p key={e.key} className="p2-msg">
              <b>{e.label}</b> sonrası {e.measure} ortalama {e.better === 'down' ? 'azaldı' : 'arttı'}: {signed(e.better === 'down' ? -e.gain : e.gain)} ({e.n} oturum{e.n >= 3 && e.lo != null ? `, %95 GA ${num(e.lo)} – ${num(e.hi)}` : ''}) <span className={`p2-pill ${effectStatus(e).tone}`}>{effectStatus(e).text}</span>
            </p>
          ))
        ) : (
          <p className="p2-msg">Henüz öncesi–sonrası puanı yok. Nefes, Gökyüzü molası ya da Dalga'dan birini yap; önce ve sonra nasıl hissettiğini sorarız.</p>
        )}
        <p className="muted small">Kontrol grubu yok: bir kısmı beklenti ya da yalnızca mola vermenin etkisi olabilir.</p>
      </section>

      {r.metrics.length > 0 && (
        <section className="card p2-card">
          <span className="eyebrow">Ölçümler</span>
          {r.metrics.map((m) => (
            <p key={m.key} className="p2-msg">
              <b>{m.label}</b> ({DOMAIN_LABEL[m.domain]}): {num(m.first, 0)} → {num(m.last, 0)} {m.unit} · {m.n} ölçüm <span className={`p2-pill ${metricStatus(m).tone}`}>{metricStatus(m).text}</span>
            </p>
          ))}
          <p className="muted small">"Henüz belirsiz": değerlendirme için en az 6 ölçüm gerekir.</p>
        </section>
      )}

      <section className="card p2-card">
        <span className="eyebrow">Göz</span>
        <p className="p2-msg">{r.eye.message}</p>
      </section>

      <section className="card p2-card">
        <span className="eyebrow">İyi oluş</span>
        <p className="p2-msg">
          {r.who5.n
            ? `İlk puanın ${r.who5.last}. İkinci ölçüm ${r.who5.nextInDays} gün sonra; iyi oluş ölçeği son iki haftayı sorduğu için daha sık sorulmaz.`
            : 'İyi oluş ölçeği son iki haftayı sorar; 14 günde bir. İlk ölçümün Gelişim → İyi oluş\'ta.'}
        </p>
      </section>

      <button className="btn" onClick={onProgress}>Gelişim'e git</button>
      <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onClose}>Kapat</button>
    </main>
  )
}
