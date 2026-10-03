import { Check, Dumbbell, Lock, Waves, Wind } from 'lucide-react'
import { GLYPH } from '../TodayPath.jsx'
import { isSameDay } from '../../lib/today.js'
import { isYogaDone } from '../../lib/yogaRecord.js'
import { isDalga } from '../../lib/dalga.js'
import { isBreath } from '../../lib/breath.js'
import { isIOSApp } from '../../lib/native.js'

// Ana sayfa · kısayol halkaları (sahibin isteği 2026-10-03: "1. Bölüm yazan kısmın hemen üstüne İnstagram hayaleti gibi
// yuvarlak ... 5 sn kuralı ve mükemmellik önemli"; tasarım docs/yol-haritasi/tasarim/ana-sayfa/halkalar/PLAN.md).
// Instagram'ın öne çıkanlar halkaları gibi: ince nötr halka, içinde modülün çizimi, altında adı. Dokununca modül açılır
// (Home'un onStart'ı; günün ilk dokunuşu sayılır, Pratikler'deki kural). Yolun mantığına dokunmaz: buildPath ve loadLater
// çağrılmaz; "bugün yapıldı" yalnız kayıtlardan (sessions + isSameDay).
//   1 Sesli yoga → 'yoga'          yalnız iPhone uygulamasında (Home onHome ile aynı kural; web'de üç halka)
//   2 Müzik      → 'dalga'         (Dalga modülü: Sakin, Güç, Motivasyon müziği)
//   3 Nefes      → 'breath'
//   4 Göz seti   → 'routine-full'  Tam set ('full'); göz bütçesine sayılır: molada kilit rozeti, dokunuş açık (App.go
//                                  mola ekranını açar)
// hide: o çizimde çizilmeyecek halkalar (Home: büyük kartın açtığı modül halkada tekrar etmez).
// Çizimler: Yoga yoldaki yoga durağının nilüferi (TodayPath GLYPH.lotus), Dalga yoldaki Dalga bandının dalgası (Waves),
// Nefes modülün kendi simgesi (Wind; ay Ana sayfada mola demek), Tam set Egzersiz setlerinin simgesi (Dumbbell; göz
// Ana sayfada mola şeridinin ve Göz kırpma'nın simgesi). Çizimlerin boyu styles/home.css'te (optik denge).
// Metinler sahip onaylı (2026-10-03): adlar ad kapısı tur 2'den (Sesli yoga 5/5, Müzik 5/5, Nefes 10/10; dördüncüde iki
// turda geçen ad yoktu, sahip "Göz seti"ni seçti); erişilebilir ad ekleri metin kapısından ("bugün yapıldı" 5/5, "mola
// bitene kadar kilitli" 5/5). Kayıt docs/yol-haritasi/tasarim/ana-sayfa/halkalar/kapi/.

const Lotus = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {GLYPH.lotus}
  </svg>
)

// "Yapıldı" kuralları modüllerin kendi kurallarıyla aynı: yoga tamamlanan ders (lib/yogaRecord.js isYogaDone), Dalga her
// kayıt (lib/dalga.js isDalga), nefes en az 60 sn (modules/breath/manifest.js breathDone), Tam set 'full' setinin kaydı
const DONE = {
  yoga: (s) => isYogaDone(s),
  dalga: (s) => isDalga(s),
  breath: (s) => isBreath(s) && s.seconds >= 60,
  full: (s) => s?.type === 'routine' && s.setId === 'full',
}

const RINGS = [
  { key: 'yoga', route: 'yoga', label: 'Sesli yoga', Icon: Lotus, ios: true },
  { key: 'dalga', route: 'dalga', label: 'Müzik', Icon: Waves },
  { key: 'breath', route: 'breath', label: 'Nefes', Icon: Wind },
  { key: 'full', route: 'routine-full', label: 'Göz seti', Icon: Dumbbell, eye: true },
]

export function ringItems({ sessions = [], now = new Date(), ios = isIOSApp(), locked = false, hide = [] } = {}) {
  return RINGS.filter((r) => (!r.ios || ios) && !hide.includes(r.key)).map((r) => {
    const done = sessions.some((s) => DONE[r.key](s) && isSameDay(s, now))
    return { ...r, done, locked: Boolean(r.eye && locked) }
  })
}

// Erişilebilir ad: ad + durum eki (kilit eki yapıldıdan sonra)
export const ringAria = ({ label, done, locked }) => `${label}${done ? ', bugün yapıldı' : ''}${locked ? ', mola bitene kadar kilitli' : ''}`

// Rozet: kilit öne (dokununca mola ekranı açılır; gören kişi bunu bilsin), yoksa tik. Yapıldı ayrıca diskin dolgusunda.
export default function HomeRings({ sessions = [], now = new Date(), ios = isIOSApp(), locked = false, hide = [], onStart, className = '' }) {
  const items = ringItems({ sessions, now, ios, locked, hide })
  if (!items.length) return null
  return (
    <nav className={`hk${className ? ` ${className}` : ''}`} aria-label="Kısayollar">
      <ul className={`hk-row n${items.length}`} role="list">
        {items.map((r) => (
          <li key={r.key}>
            <button type="button" className={`hk-b ${r.key}${r.done ? ' done' : ''}${r.locked ? ' locked' : ''}`} onClick={() => onStart?.(r.route)} aria-label={ringAria(r)}>
              <span className="hk-o" aria-hidden="true">
                <span className="hk-d"><r.Icon size={24} /></span>
                {r.locked ? (
                  <span className="hk-m lk"><Lock size={11} strokeWidth={2.6} aria-hidden="true" /></span>
                ) : r.done ? (
                  <span className="hk-m ok"><Check size={12} strokeWidth={3.2} aria-hidden="true" /></span>
                ) : null}
              </span>
              <span className="hk-l" aria-hidden="true">{r.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
