import { PHASE } from '../lib/breath.js'

// Nefes görseli (referans 3'teki büyük görsel alanı): küre / halka / manzara, nefesle büyür-küçülür.
// Salt görsel; zamanı dışarıdan alır. Routine (Derin set) ve Breath oynatma ekranı aynı bileşeni kullanır.
// kind: aşama türü; phaseSec: aşamanın süresi; size: px.
export default function BreathVisual({ visual = 'orb', kind = 'in', phaseSec = 4, size = 240, paused = false }) {
  const ph = PHASE[kind] ?? PHASE.in
  const holding = kind === 'hold' || kind === 'hold2'
  const style = { '--s': ph.scale, '--t': `${holding ? 0.3 : phaseSec}s`, width: size, height: size }
  if (visual === 'ring') {
    return (
      <div className={`bv bv-ring${paused ? ' paused' : ''}`} style={style} aria-hidden="true">
        <span className="bv-ring-outer" />
        <span className="bv-ring-inner" />
      </div>
    )
  }
  if (visual === 'scene') {
    // Manzara: telifsiz, cihaz içi SVG (VARSAYIM: fotoğraf yerine çizim; kaynak seçilince değişebilir)
    return (
      <div className={`bv bv-scene${paused ? ' paused' : ''}`} style={style} aria-hidden="true">
        <svg viewBox="0 0 200 200" className="bv-scene-svg">
          <defs>
            <linearGradient id="bv-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#cfe9f5" />
              <stop offset="1" stopColor="#f6e7c8" />
            </linearGradient>
            <linearGradient id="bv-hill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4c9a7a" />
              <stop offset="1" stopColor="#2b5f4c" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#bv-sky)" />
          <circle cx="140" cy="62" r="22" fill="#ffd27a" />
          <path d="M0 150 Q40 110 80 140 T160 130 T200 150 V200 H0z" fill="url(#bv-hill)" />
          <path d="M0 170 Q50 145 100 165 T200 160 V200 H0z" fill="#234c3d" />
        </svg>
        <span className="bv-scene-frame" />
      </div>
    )
  }
  return <div className={`bv bv-orb${paused ? ' paused' : ''}`} style={style} aria-hidden="true" />
}
