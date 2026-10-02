import { Check } from 'lucide-react'
import { IrisMark } from '../ui.jsx'
import { CHAPTER_DAYS, chapterOf } from '../../lib/pathAhead.js'

// Ana sayfa · ilk 7 günün ilk görünümü: bölümün yedi günü tek sırada (sahibin isteği 2026-10-01, D9; Yön B'nin büyük
// kartının çizimi ve dünün izi yerine: "kart içinde kart", çentikli kadran ve göz çizimi değerlendiricilerde zayıf kaldı;
// 320'de "dün bugün" yapışıktı, gelecek günlerin noktalı halkaları görünmüyordu). Biten gün dolu ve tikli, bugün büyük
// halka ve altında "bugün", gelecek gün kesik çizgili halka ve numarası, yedinci gün bölümün ödülü (göz).
//   n: bugün yolun kaçıncı günü (1..7)
export default function ChapterStrip({ n = 1 }) {
  const c = chapterOf(n)
  const first = (c - 1) * CHAPTER_DAYS + 1
  const items = Array.from({ length: CHAPTER_DAYS }, (_, i) => first + i)
  return (
    <div className="cs" role="img" aria-label={`${c}. bölüm, ${n}. gün`}>
      <span className="cs-h" aria-hidden="true">{c}. bölüm</span>
      <ol className="cs-row" aria-hidden="true">
        {items.map((d) => {
          const st = d < n ? 'done' : d === n ? 'now' : 'next'
          const last = d === first + CHAPTER_DAYS - 1
          return (
            <li key={d} className={`cs-d ${st}${last ? ' rw' : ''}`}>
              <span className="cs-c">
                {st === 'done' ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : last ? <IrisMark size={st === 'now' ? 30 : 24} /> : <b>{d}</b>}
              </span>
              {st === 'now' && <small>bugün</small>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
