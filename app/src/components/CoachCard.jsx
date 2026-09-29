import { useEffect, useState } from 'react'
import { Sparkles, ChevronRight, WifiOff, X } from 'lucide-react'
import { getPrefs, setPrefs, subscribePrefs } from '../lib/prefs.js'
import { getTodayInsight } from '../lib/coach.js'
import { coachAllowed } from '../lib/consent.js'
import { weeklyStatus } from '../lib/today.js'
import CoachConsent from './CoachConsent.jsx'
import '../styles/coach.css'

// Ana sayfa "Bugün" kartı — Nef Göz Koçu. Varsayılan KAPALI; açık onayla açılır
// (Apple 5.1.2: üçüncü taraf yapay zekâyla veri paylaşımı açıkça söylenir ve izin alınır).
// Sunucu/model yoksa kural tabanlı öneri gösterilir (source: 'rules').

// Öneri metnindeki eylem → uygulama ekranı. Karar 2026-09-29: E testi haftada bir. Günlük test diyen cevap zaten
// kullanılmaz (lib/coach.js, coachCore.js STALE_ADVICE); eşleme yalnız savunma için haftalık teste gider.
const ACTIONS = [
  [/^haftalık test/i, 'weekly'],
  [/^günlük test/i, 'weekly'],
  [/^hafif set/i, 'routine-lite'],
  [/^normal set/i, 'routine-normal'],
  [/^kırpma/i, 'blink'],
  [/^okuma/i, 'reading'],
  [/^nefes/i, 'breath'],
  [/^çember/i, 'track'],
  [/^yılan/i, 'snake'],
]
export const screenFor = (action) => ACTIONS.find(([re]) => re.test(action ?? ''))?.[1] ?? null
// Düğmenin açacağı ekran: haftalık test yalnız zamanı gelince açılır (lib/today.js weeklyStatus). Zamanı gelmemişken
// (ör. çevrimiçi Nef hafta ortasında "Haftalık test" dediyse) eylem düğme olmaz, düz yazı kalır: tam haftalık testi
// hafta ortasında açıp haftalık düzeni kaydırmasın.
export function actionTarget(action, tests = [], now = new Date()) {
  const target = screenFor(action)
  if (target === 'weekly' && !weeklyStatus(tests, now).due) return null
  return target
}

// consents: settings.consents (Nef yalnız kayıtlı açık rızayla konuşur) · onCoach({ on, life }): App rızayı kaydeder
export default function CoachCard({ tests, sessions, profile = null, weeklyTarget, consents = null, onCoach, onStart }) {
  const [prefs, setLocal] = useState(getPrefs)
  const [consent, setConsent] = useState(false)
  const [tip, setTip] = useState(null)

  useEffect(() => subscribePrefs((p) => setLocal(p)), [])

  // Profil cevaplarının özeti yalnız coachLife rızasıyla gider (uyku, ekran, gece telefonu, stres)
  const allowed = coachAllowed(prefs, consents)
  const life = allowed.life ? profile : null
  const lifeKey = life ? JSON.stringify([life.screenHours, life.sleep, life.nightPhone, life.stress]) : ''
  useEffect(() => {
    if (!allowed.on) return undefined
    let alive = true
    setTip(null)
    getTodayInsight({ tests, sessions, weeklyTarget, profile: life }).then((t) => alive && setTip(t))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed.on, allowed.life, tests.length, sessions.length, weeklyTarget, lifeKey])

  if (!allowed.on && prefs.coachHidden) return null

  if (!allowed.on) {
    return (
      <section className="card coach-card coach-intro">
        <div className="row between">
          <span className="coach-badge"><Sparkles size={15} aria-hidden="true" /> Nef Göz Koçu</span>
          <button className="btn-icon coach-hide" onClick={() => setPrefs({ coachHidden: true })} aria-label="Gizle"><X size={16} /></button>
        </div>
        <p className="coach-lead">Kendi verine bakıp her gün tek bir içgörü ve bir öneri yazar.</p>
        {consent ? (
          <CoachConsent idPrefix="cc-home" onAccept={({ life }) => { setConsent(false); onCoach?.({ on: true, life }) }} onCancel={() => setConsent(false)} />
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => setConsent(true)}>Nasıl çalışır, aç</button>
        )}
      </section>
    )
  }

  // Profil cevapları için ayrı soru burada sorulmaz: CoachConsent ikisini ayrı kutuda sordu; sonradan eklemek
  // Profilim → İzinlerim'den, bilgilendirme sayfasıyla (ConsentSheet 'coachLife').
  const target = tip ? actionTarget(tip.action, tests) : null
  return (
    <section className="card coach-card" aria-live="polite">
      <div className="row between">
        <span className="coach-badge"><Sparkles size={15} aria-hidden="true" /> Bugün · Nef</span>
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
        <div className="coach-skeleton" aria-label="Nef düşünüyor">
          <i />
          <i />
        </div>
      )}
    </section>
  )
}
