import { useEffect, useState } from 'react'
import { errorDetail } from '../lib/account.js'
import { Route, ChartLine, ScanEye, Check, ShieldCheck, Download } from 'lucide-react'
import IrisMap from '../components/IrisMap.jsx'
import { setupText } from '../lib/setupText.js'
import { getPlans, purchase, restore, isNative } from '../lib/subscription.js'
import { scheduleTrialReminder, TRIAL_REMIND_DAYS } from '../lib/restNotify.js'
import '../styles/account.css'
import '../styles/setup.css'

// Apple App Store Review Guideline 3.1.2 gereği: fiyat + dönem, deneme koşulu,
// otomatik yenileme ve iptal bilgisi, satın alımları geri yükleme, şartlar ve gizlilik.
// Kullanım şartları: Apple'ın standart EULA'sı (App Store Connect'te özel EULA
// tanımlanmadıysa geçerli olan). Gizlilik politikası adresi yayından önce doldurulmalı.
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL || ''

// Premium'un üç satırı (Artifact "Nefona Başlangıç Kartı", onaylı); yazılar lib/setupText.js
const FEATURE_ICONS = [Route, ChartLine, ScanEye]

// Web'de ödeme yok: önizleme için örnek planlar
const PREVIEW_PLANS = [
  { id: 'annual', period: 'annual', priceString: '₺899,99', pricePerMonthString: '₺75,00', freeTrialDays: 7, savePercent: 17 },
  { id: 'monthly', period: 'monthly', priceString: '₺89,99', freeTrialDays: 7 },
  { id: 'weekly', period: 'weekly', priceString: '₺29,99', freeTrialDays: 7 },
]

const PERIOD = { annual: 'yıl', monthly: 'ay', weekly: 'hafta' }
const PERIOD_TITLE = { annual: 'Yıllık', monthly: 'Aylık', weekly: 'Haftalık' }

// Deneme varsa (planın freeTrialDays) denemenin üç günü gösterilir: bugün, hatırlatma, plan başlar.
// onSkip: yalnız test derlemesinde (VITE_TEST_UNLOCK) ekranı görmek için "geç".
// filled: kişinin iris haritasında dolu alanlar (üstteki iris; lib/iris.js)
export default function Paywall({ onUnlocked, onExport, onSafety, preview = false, onSkip = null, filled = [] }) {
  const S = setupText().paywall
  const [plans, setPlans] = useState(preview ? PREVIEW_PLANS : null)
  const [selected, setSelected] = useState(preview ? 'annual' : null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [detail, setDetail] = useState('') // Bug 14: ham hata metni (teşhis)

  useEffect(() => {
    if (preview) return
    getPlans()
      .then((p) => {
        setPlans(p)
        setSelected(p[0]?.id ?? null)
      })
      .catch((e) => {
        setPlans([])
        setMsg('Abonelik seçenekleri yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.')
        setDetail(errorDetail(e))
      })
  }, [preview])

  const plan = plans?.find((p) => p.id === selected)
  const trial = plan?.freeTrialDays || 0

  async function buy() {
    if (!plan || preview || !isNative()) {
      setMsg('Satın alma yalnızca iPhone uygulamasında yapılabilir.')
      return
    }
    setBusy(true)
    setMsg(null)
    const r = await purchase(plan)
    setBusy(false)
    if (r.ok && trial) await scheduleTrialReminder()
    if (r.ok) onUnlocked()
    else if (!r.cancelled) setMsg(r.error)
  }

  async function doRestore() {
    if (preview || !isNative()) return setMsg('Geri yükleme yalnızca iPhone uygulamasında yapılabilir.')
    setBusy(true)
    try {
      const ok = await restore()
      if (ok) onUnlocked()
      else setMsg('Bu Apple hesabında aktif bir abonelik bulunamadı.')
    } catch {
      setMsg('Geri yükleme başarısız oldu. Tekrar dene.')
    }
    setBusy(false)
  }

  return (
    <main className="screen fade-in paywall">
      <header className="pw-head">
        <IrisMap size={66} filled={filled} />
        <span className="oq-ey pw-ey">{S.eyebrow}</span>
        <h1>{trial ? S.trialTitle(trial) : S.title}</h1>
        <p>{S.purpose}</p>
      </header>

      <ul className="pw-feat">
        {S.features.map(([b, t], i) => {
          const Icon = FEATURE_ICONS[i] ?? Check
          return <li key={b}><Icon size={18} aria-hidden="true" /><span><b>{b}</b> {t}</span></li>
        })}
      </ul>

      {trial > 0 && (
        <ol className="pw-trial" aria-label="Deneme süreci">
          {S.trial(TRIAL_REMIND_DAYS, trial).map(([h, t]) => <li key={h}><i aria-hidden="true" /><b>{h}</b><span>{t}</span></li>)}
        </ol>
      )}

      {plans == null && <p className="muted" style={{ textAlign: 'center' }}>Planlar yükleniyor…</p>}

      <div className="plans" role="radiogroup" aria-label="Abonelik planı">
        {plans?.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={selected === p.id}
            className={`plan ${selected === p.id ? 'on' : ''}`}
            onClick={() => setSelected(p.id)}
          >
            <span className="plan-radio">{selected === p.id && <Check size={14} strokeWidth={3} />}</span>
            <span className="grow">
              <span className="plan-title">
                {PERIOD_TITLE[p.period] ?? p.period}
                {p.savePercent > 0 && <span className="badge">%{p.savePercent} tasarruf</span>}
              </span>
              <span className="muted small">
                {p.priceString} / {PERIOD[p.period]}
                {p.period === 'annual' && p.pricePerMonthString ? ` · aylık ${p.pricePerMonthString}` : ''}
              </span>
            </span>
          </button>
        ))}
      </div>

      <button className="btn pw-cta" disabled={!plan || busy} onClick={buy}>
        {busy ? 'Bekle…' : trial ? `${trial} gün ücretsiz başla` : 'Abone ol'}
      </button>

      {plan && (
        <p className="legal">
          {trial
            ? `${trial} gün ücretsiz, ardından ${plan.priceString} / ${PERIOD[plan.period]}. `
            : `${plan.priceString} / ${PERIOD[plan.period]}. `}
          Ödeme Apple hesabından alınır. Abonelik, dönem bitiminden en az 24 saat önce iptal edilmezse
          aynı ücretle otomatik yenilenir. İptal ve yönetim: iPhone Ayarlar → Apple Kimliği → Abonelikler.
          {trial ? ' Deneme bitmeden iptal edersen ücret alınmaz.' : ''}
        </p>
      )}
      {msg && <p className="small" role="status" style={{ color: 'var(--warn)', textAlign: 'center' }}>{msg}</p>}
      {detail && <p className="acct-detail muted small">{detail}</p>}

      <div className="paywall-links">
        <button className="link-btn" onClick={doRestore} disabled={busy}>Satın alımları geri yükle</button>
        <a className="link-btn" href={TERMS_URL} target="_blank" rel="noreferrer">Kullanım şartları</a>
        {PRIVACY_URL && <a className="link-btn" href={PRIVACY_URL} target="_blank" rel="noreferrer">Gizlilik</a>}
      </div>

      {onSkip && <button type="button" className="link-btn" style={{ alignSelf: 'center' }} onClick={onSkip}>Test derlemesi: şimdilik geç</button>}

      <div className="paywall-links muted">
        <button className="link-btn subtle" onClick={onSafety}><ShieldCheck size={14} /> Güvenlik bilgisi</button>
        <button className="link-btn subtle" onClick={onExport}><Download size={14} /> Verilerimi indir</button>
      </div>
    </main>
  )
}
