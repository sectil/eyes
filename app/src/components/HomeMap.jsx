import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import IrisMap from './IrisMap.jsx'
import { growthMap, weakestDomain, WINDOW_DAYS } from '../lib/dataHub.js'
import { who5Card, DOMAIN_LABEL } from '../lib/progress.js'
import { loadHabits } from '../lib/habitLog.js'
import { IRIS_ORDER } from '../lib/iris.js'
import { registry } from '../modules/registry.js'

// Ana sayfa: küçük gelişim haritası (Artifact "Nefona Gelişim Haritası" ekran 3, onaylı). Haritaya dokununca Gelişim.
// Tek düğme: WHO-5 zamanı geldiyse o; yoksa son 28 günde en az kaydı olan alanın bir modülü. Nef'in ana önerisi
// (bugünün yolu) ayrı kalır; bu kart yalnız alanlar arasındaki dengeyi gösterir. Veri: lib/dataHub.js.
// Alan → açılacak modül (o alanın en kısa, kamerasız başlangıcı)
const DOMAIN_MODULE = { eye: 'blink', focus: 'quick-look', awareness: 'fark-ettin', calm: 'breath', self: 'yon', wellbeing: 'dalga', body: 'mola' }
// WHO-5 ilk gün sorulmaz (kurulum zaten soru dolu)
const WHO5_FROM_DAY = 2

export default function HomeMap({ tests = [], sessions = [], profile = null, onStart }) {
  const now = new Date()
  const habits = useMemo(() => loadHabits(), [sessions]) // eslint-disable-line react-hooks/exhaustive-deps
  const map = useMemo(() => growthMap({ tests, sessions, profile, habits, now }), [tests, sessions, profile, habits]) // eslint-disable-line react-hooks/exhaustive-deps
  const who5 = useMemo(() => who5Card(sessions, now), [sessions]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!map.sinceStart) return null
  const withData = IRIS_ORDER.filter((d) => map.domains[d].days > 0).length
  const ups = IRIS_ORDER.filter((d) => map.domains[d].status === 'up').map((d) => DOMAIN_LABEL[d])
  const weak = weakestDomain(map)
  const mod = weak ? registry.get(DOMAIN_MODULE[weak.domain]) : null
  const action = who5.due && map.sinceStart >= WHO5_FROM_DAY
    ? { route: 'who5', text: `${DOMAIN_LABEL.wellbeing}: 5 soru`, sub: who5.n ? `${who5.daysSince} gün oldu` : 'ilk ölçüm' }
    : mod && !mod.retired
      ? { route: (mod.routes ?? [mod.id])[0], text: `${DOMAIN_LABEL[weak.domain]}: ${mod.title}`, sub: `en az kayıt · ${weak.days}/${WINDOW_DAYS} gün` }
      : null
  return (
    <section className="card hm" aria-label="Gelişim haritan">
      <button type="button" className="hm-map" onClick={() => onStart('progress')} aria-label="Gelişim haritanı aç">
        <IrisMap size={76} frac={IRIS_ORDER.map((d) => map.domains[d].frac)} marks={IRIS_ORDER.map((d) => map.domains[d].status)} />
      </button>
      <div className="hm-tx">
        <b>{withData} / 7 alanda kaydın var</b>
        <span>{ups.length ? `İyileşiyor: ${ups.join(', ')}` : 'Değişim, kayıtlar biriktikçe görünür.'}</span>
        {action && (
          <button type="button" className="hm-act" onClick={() => onStart(action.route)}>
            <span><b>{action.text}</b><small>{action.sub}</small></span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
