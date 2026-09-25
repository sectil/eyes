import { useEffect, useState } from 'react'
import { Sparkles, ChevronRight, ShieldCheck, WifiOff, X } from 'lucide-react'
import { getPrefs, setPrefs, subscribePrefs } from '../lib/prefs.js'
import { getTodayInsight } from '../lib/coach.js'
import '../styles/coach.css'

// Ana sayfa "Bugün" kartı — Jev Göz Koçu. Varsayılan KAPALI; açık onayla açılır
// (Apple 5.1.2: üçüncü taraf yapay zekâyla veri paylaşımı açıkça söylenir ve izin alınır).
// Sunucu/model yoksa kural tabanlı öneri gösterilir (source: 'rules').

// Öneri metnindeki eylem → uygulama ekranı
const ACTIONS = [
  [/^günlük test/i, 'daily'],
  [/^hafif set/i, 'routine-lite'],
  [/^normal set/i, 'routine-normal'],
  [/^kırpma/i, 'blink'],
  [/^okuma/i, 'reading'],
  [/^nefes/i, 'breath'],
  [/^çember/i, 'track'],
  [/^yılan/i, 'snake'],
]
const screenFor = (action) => ACTIONS.find(([re]) => re.test(action ?? ''))?.[1] ?? null

export default function CoachCard({ tests, sessions, profile = null, weeklyTarget, onStart }) {
  const [prefs, setLocal] = useState(getPrefs)
  const [consent, setConsent] = useState(false)
  const [tip, setTip] = useState(null)

  useEffect(() => subscribePrefs((p) => setLocal(p)), [])

  // Profil cevaplarının özeti yalnız coachLife onayıyla gider (uyku, ekran, gece telefonu, stres)
  const life = prefs.coachLife ? profile : null
  const lifeKey = life ? JSON.stringify([life.screenHours, life.sleep, life.nightPhone, life.stress]) : ''
  useEffect(() => {
    if (!prefs.coach) return undefined
    let alive = true
    setTip(null)
    getTodayInsight({ tests, sessions, weeklyTarget, profile: life }).then((t) => alive && setTip(t))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.coach, prefs.coachLife, tests.length, sessions.length, weeklyTarget, lifeKey])

  if (!prefs.coach && prefs.coachHidden) return null

  if (!prefs.coach) {
    return (
      <section className="card coach-card coach-intro">
        <div className="row between">
          <span className="coach-badge"><Sparkles size={15} aria-hidden="true" /> Jev Göz Koçu</span>
          <button className="btn-icon coach-hide" onClick={() => setPrefs({ coachHidden: true })} aria-label="Gizle"><X size={16} /></button>
        </div>
        <p className="coach-lead">Kendi verine bakıp her gün tek bir içgörü ve bir öneri yazar.</p>
        {consent ? (
          <>
            <p className="note small">
              <ShieldCheck size={16} aria-hidden="true" />
              Açarsan yalnızca özet sayılar (ör. bu hafta kaç gün çalıştığın, son 7 günün ölçüm ortancası) ve profil
              cevaplarından uyku puanı, ekran süresi, gece telefonu ve stres özeti şifreli bağlantıyla
              sunucumuza, oradan yapay zekâ sağlayıcısına (OpenRouter) gider. Kamera görüntüsü, adın ya da cihaz kimliğin
              gitmez. Öneriler tıbbi tavsiye değildir. Bilgi ekranından istediğin an kapatabilirsin.
            </p>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-sm" onClick={() => setPrefs({ coach: true, coachLife: true })}>Kabul et ve aç</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConsent(false)}>Vazgeç</button>
            </div>
          </>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => setConsent(true)}>Nasıl çalışır, aç</button>
        )}
      </section>
    )
  }

  const target = tip ? screenFor(tip.action) : null
  // Eski onay profil cevaplarını kapsamıyordu: ayrıca sorulur (tek dokunuş)
  const askLife = !prefs.coachLife && profile && (profile.sleep != null || profile.screenHours != null || profile.nightPhone != null)
  return (
    <section className="card coach-card" aria-live="polite">
      <div className="row between">
        <span className="coach-badge"><Sparkles size={15} aria-hidden="true" /> Bugün · Jev</span>
        {tip?.source === 'rules' && <span className="coach-offline"><WifiOff size={13} aria-hidden="true" /> çevrimdışı öneri</span>}
      </div>
      {tip ? (
        <>
          <p className="coach-insight">{tip.insight}</p>
          {target ? (
            <button className="coach-action" onClick={() => onStart(target)}>
              <span>{tip.action}</span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <p className="coach-action static">{tip.action}</p>
          )}
        </>
      ) : (
        <div className="coach-skeleton" aria-label="Jev düşünüyor">
          <i />
          <i />
        </div>
      )}
      {askLife && (
        <p className="muted small coach-life">
          Uyku, ekran, gece telefonu ve stres cevaplarının özeti de Jev'e gitsin mi?{' '}
          <button type="button" className="link-btn" onClick={() => setPrefs({ coachLife: true })}>Evet, ekle</button>
        </p>
      )}
    </section>
  )
}
