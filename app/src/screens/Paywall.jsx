import { useEffect, useState } from 'react'
import { ScanEye, ChartLine, Dumbbell, Bell, Check, ShieldCheck, Download, Sparkles } from 'lucide-react'
import { getPlans, purchase, restore, isNative } from '../lib/subscription.js'

// Apple App Store Review Guideline 3.1.2 gereği: fiyat + dönem, deneme koşulu,
// otomatik yenileme ve iptal bilgisi, satın alımları geri yükleme, şartlar ve gizlilik.
// Kullanım şartları: Apple'ın standart EULA'sı (App Store Connect'te özel EULA
// tanımlanmadıysa geçerli olan). Gizlilik politikası adresi yayından önce doldurulmalı.
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL || ''

const BENEFITS = [
  { Icon: ScanEye, text: 'Günlük "E hangi yönde" testi ve haftalık tam ölçüm' },
  { Icon: ChartLine, text: 'Gelişim grafiği — gerçek değişimi gürültüden ayırır' },
  { Icon: Dumbbell, text: 'Hafif, Normal ve Tam egzersiz setleri' },
  { Icon: Bell, text: 'Takvim, hatırlatma ve okuma testi' },
]

// Web'de ödeme yok: önizleme için örnek planlar
const PREVIEW_PLANS = [
  { id: 'annual', period: 'annual', priceString: '₺599,99', pricePerMonthString: '₺50,00', freeTrialDays: 7, savePercent: 50 },
  { id: 'monthly', period: 'monthly', priceString: '₺99,99', freeTrialDays: 7 },
]

const PERIOD = { annual: 'yıl', monthly: 'ay' }

export default function Paywall({ onUnlocked, onExport, onSafety, preview = false }) {
  const [plans, setPlans] = useState(preview ? PREVIEW_PLANS : null)
  const [selected, setSelected] = useState(preview ? 'annual' : null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (preview) return
    getPlans()
      .then((p) => {
        setPlans(p)
        setSelected(p[0]?.id ?? null)
      })
      .catch(() => {
        setPlans([])
        setMsg('Abonelik seçenekleri yüklenemedi. İnternet bağlantını kontrol edip tekrar dene.')
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
      <header className="page-header" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 12 }}>
        <span className="paywall-badge"><Sparkles size={16} /> {trial ? `${trial} gün ücretsiz` : 'Eyelume Premium'}</span>
        <h1>Görmeni ölç, takip et, düzenli kal</h1>
        <p>İlk ölçümünü yaptın. Devam etmek için planını seç.</p>
      </header>

      <ul className="benefits">
        {BENEFITS.map(({ Icon, text }) => (
          <li key={text}><span className="icon-bubble"><Icon size={20} /></span>{text}</li>
        ))}
      </ul>

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
                {p.period === 'annual' ? 'Yıllık' : 'Aylık'}
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

      <button className="btn" disabled={!plan || busy} onClick={buy}>
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

      <div className="paywall-links">
        <button className="link-btn" onClick={doRestore} disabled={busy}>Satın alımları geri yükle</button>
        <a className="link-btn" href={TERMS_URL} target="_blank" rel="noreferrer">Kullanım şartları</a>
        {PRIVACY_URL && <a className="link-btn" href={PRIVACY_URL} target="_blank" rel="noreferrer">Gizlilik</a>}
      </div>

      <div className="paywall-links muted">
        <button className="link-btn subtle" onClick={onSafety}><ShieldCheck size={14} /> Güvenlik bilgisi</button>
        <button className="link-btn subtle" onClick={onExport}><Download size={14} /> Verilerimi indir</button>
      </div>
    </main>
  )
}
