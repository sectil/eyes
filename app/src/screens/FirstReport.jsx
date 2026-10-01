import { useMemo } from 'react'
import { CalendarCheck, Clock, Flame } from 'lucide-react'
import { firstReport, DOMAIN_LABEL, feelOnlyText } from '../lib/progress.js'
import { decimalTr } from '../lib/stats.js'
import { WEEKLY_PLAN_NOTE } from '../lib/trend.js'
import { changeText, signedText, verdictWord, VERDICT_WORD } from '../lib/changeText.js'
import { metricValueText, effectVerdictText } from '../lib/exportData.js'
import { effectState } from '../lib/growthCenter.js'
import '../styles/progress2.css'

// 5. gün "İlk rapor" (Gelişim 2.0; onaylı): deneme 7 gün, kullanıcı ödeme kararından önce görsün.
// Yalnız kısa sürede gerçekten ölçülebilenler: düzen, oturum öncesi→sonrası etkiler, modül metrikleri.
// Göz ve WHO-5 için dürüst durum: E testi haftada bir (karar 2026-09-29); ilk test alışma, başlangıç sonraki 3 haftalık
// testle (en erken 22. gün; lib/trend.js). Her gün test eden eski kullanıcıda 8–21. günlerde. WHO-5 14 günde bir.
const num = (v, d = 1) => (Number.isFinite(v) ? decimalTr(v, d) : '–')
// İşaret yazılan (yuvarlanmış) değerden: −0,02 → "0,0" ("−0,0" değil). Tek metin işlevi (lib/changeText.js; Kü-4)
const signed = (v, d = 1) => signedText(v, '', d)

// Ölçümler kartı ve etki hapı merkezle ve PDF'le aynı hükümden (gelisim-merkezi PLAN §3.5 madde 1; DENETIM K1):
// metrikte ölçü kuralı v2 (verdict) ve Gelişim'in dört sözcüğü; değer tek metin işlevinden, PDF'teki biçimle
// (lib/exportData.js metricValueText). Doğrulanmış gerilemede hap yok: yalnız sayılar (DEVIR §1.8; sözü sahibe soruldu).
// Yoga ("nasıl hissettin") yalnız puanın yönü.
export function metricPill(m) {
  const feel = feelOnlyText(m?.verdict ? { ...m, status: m.verdict } : m)
  if (feel) return { text: feel, tone: 'muted' }
  if (m?.verdict === 'better') return { text: VERDICT_WORD.better, tone: 'ok' }
  if (m?.verdict === 'same' || m?.verdict === 'unclear' || m?.verdict === 'start') return { text: VERDICT_WORD[m.verdict], tone: 'muted' }
  return null
}
// Etki hapı merkezin durumundan (lib/growthCenter.js effectState): belirgin değilse Gelişim'in sözcüğü (3 oturumdan az
// "başlangıç", güven aralığı sıfırı içeriyorsa "henüz belli değil"); belirginse PDF'in sütunuyla aynı söz
// (lib/exportData.js effectVerdictText: "belirgin, iyi yönde", yoga "belirgin artış/düşüş")
export function effectPill(e) {
  if (!e?.sig) return { text: VERDICT_WORD[effectState(e)] ?? VERDICT_WORD.unclear, tone: 'muted' }
  return { text: effectVerdictText(e), tone: e.gain > 0 ? 'ok' : 'warn' }
}

// Etkinin puandaki kendi değişimi (sonra − önce) ve güven aralığı aynı yönde; fiil değişimin işaretinden. e.gain, lo, hi
// iyileşme yönündedir: "düşük daha iyi" ölçüde (Yön, yoga Ders 1–2) çevrilir (exportData.reportHtml ile aynı). Önceden
// fiil better'dan seçiliyordu ve aralık çevrilmiyordu: artan gerginlik "azaldı: +2,0 (%95 GA −3,1 – −0,9)" yazıyordu.
// Değer ekrandaki gibi bir haneye yuvarlanır ve fiil ondan seçilir: küçük değişim "azaldı: −0,0" değil "değişmedi: 0,0".
export function changeOf(e) {
  const k = e?.better === 'down' ? -1 : 1
  const value = Number.isFinite(e?.gain) ? Number((k * e.gain).toFixed(1)) || 0 : null
  const ci = Number.isFinite(e?.lo) && Number.isFinite(e?.hi)
  return {
    value,
    lo: ci ? Math.min(k * e.lo, k * e.hi) : null,
    hi: ci ? Math.max(k * e.lo, k * e.hi) : null,
    verb: value > 0 ? 'arttı' : value < 0 ? 'azaldı' : 'değişmedi',
  }
}

// İyi oluş kartı (DENETIM Ö-6): ikinci ölçümden sonra "İlk puanın" denmez; son puan, ilk puandan değişim (tek metin işlevi,
// lib/changeText.js) ve ölçü kuralının sözcüğü (who5Card verdict; yayımlanmış eşik 10 puan). Eşik cümlesi hükümden
// önce gelir (hüküm eşiğe göre okunsun). Gerileme için ekranda ayrı bir hüküm sözcüğü yok (gelisim-merkezi DEVIR §1.8;
// sahibe soruldu): yalnız sayılar ve eşik yazılır.
export function who5Line(w) {
  if (!w?.n) return 'İyi oluş ölçeği son iki haftayı sorar; 14 günde bir. İlk ölçümün Gelişim → İyi oluş\'ta.'
  const next = w.nextInDays > 0 ? ` Sonraki ölçüm ${w.nextInDays} gün sonra.` : ' Yeni ölçümün zamanı geldi.'
  if (w.n === 1) {
    return w.nextInDays > 0
      ? `İlk puanın ${w.last}. İkinci ölçüm ${w.nextInDays} gün sonra; iyi oluş ölçeği son iki haftayı sorduğu için daha sık sorulmaz.`
      : `İlk puanın ${w.last}.${next}`
  }
  const c = changeText({ from: w.first, to: w.last, unit: '/100' })
  const word = w.verdict === 'better' ? ': puanın başlangıcından iyi' : w.verdict === 'same' ? `: ${verdictWord('same')}` : ''
  return `Son puanın ${w.last}; ilk ölçümden bu yana ${c.deltaText} (${w.n} ölçüm). 10 puan ve üstü değişim anlamlı sayılır${word}.${next}`
}

// Haftalık planın takvim cümlesi: henüz test yoksa ya da haftalık yolda alışma/başlangıç dönemindeyse
export const eyeWhen = (eye) => eye?.phase === 'empty' || ((eye?.phase === 'familiarization' || eye?.phase === 'baseline') && eye?.baselineMode === 'weekly')

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
        <span className="eyebrow">Düzen · başladığından beri</span>
        <div className="p2-kv">
          <div><b><CalendarCheck size={14} aria-hidden="true" /> {p.activeDays}</b><span>aktif gün</span></div>
          <div><b><Clock size={14} aria-hidden="true" /> {p.minutes}</b><span>dakika</span></div>
          <div><b><Flame size={14} aria-hidden="true" /> {p.streakDays}</b><span>gün seri</span></div>
        </div>
      </section>

      <section className="card p2-card">
        <span className="eyebrow">Uygulamalardan sonra</span>
        {effects.length ? (
          effects.map((e) => {
            const c = changeOf(e)
            const pill = effectPill(e)
            return (
              <p key={e.key} className="p2-msg">
                <b>{e.label}</b> sonrası {e.measure} ortalama {c.verb}: {signed(c.value)} ({e.n} oturum{e.n >= 3 && c.lo != null ? `, %95 GA ${num(c.lo)} – ${num(c.hi)}` : ''}) <span className={`p2-pill ${pill.tone}`}>{pill.text}</span>
              </p>
            )
          })
        ) : (
          <p className="p2-msg">Henüz öncesi–sonrası puanı yok. Nefes, Gökyüzü molası ya da Dalga'dan birini yap; önce ve sonra nasıl hissettiğini sorarız.</p>
        )}
        <p className="muted small">Kontrol grubu yok: bir kısmı beklenti ya da yalnızca mola vermenin etkisi olabilir.</p>
      </section>

      {r.metrics.length > 0 && (
        <section className="card p2-card">
          <span className="eyebrow">Ölçümler</span>
          {r.metrics.map((m) => {
            const pill = metricPill(m)
            return (
              <p key={m.key} className="p2-msg">
                <b>{m.label}</b> ({DOMAIN_LABEL[m.domain]}): {metricValueText(m)} · {m.n} ölçüm{pill && <> <span className={`p2-pill ${pill.tone}`}>{pill.text}</span></>}
              </p>
            )
          })}
          <p className="muted small">"Başlangıç": ilk ölçüm günlerinden sonra 6 günlük başlangıç oluşuyor; değişim ondan sonraki haftalarda değerlendirilir.</p>
        </section>
      )}

      <section className="card p2-card">
        <span className="eyebrow">Göz</span>
        <p className="p2-msg">{r.eye.message}</p>
        {/* 5. günde göz henüz değerlendirilmez: ne zaman değerlendirileceği (haftalık plan) tek cümle */}
        {eyeWhen(r.eye) && <p className="muted small">{WEEKLY_PLAN_NOTE}</p>}
      </section>

      <section className="card p2-card">
        <span className="eyebrow">İyi oluş</span>
        <p className="p2-msg">{who5Line(r.who5)}</p>
      </section>

      <button className="btn" onClick={onProgress}>Gelişim'e git</button>
      <button className="link-btn" style={{ alignSelf: 'center' }} onClick={onClose}>Kapat</button>
    </main>
  )
}
