import '../styles/gazetutorial.css'

// Yılan "gözle nasıl oynanır" animasyonu: üstte mini tahta, altta bir kişi. Kişinin gözbebekleri sırayla
// sağa → yukarı → sola → aşağı, tahtanın DIŞINA kayar; gözbebeği kenara vardığı anda yılan o yöne döner ve
// kenardaki ok dolar. Baş sabittir (öğretilen davranış: başını değil gözünü oynat).
// SVG + CSS; ek kütüphane yok. frame: 0–3 verilirse sabit kare (pratik adımı, hareket azaltma, ekran görüntüsü);
// sabit karede gözbebeği SVG transform ÖZNİTELİĞİYLE konumlanır (iOS WebKit'te <g> üzerinde inline CSS transform
// güvenilir değil: Build 17'de pratik komutlarında gözler oynamadı). Animasyonlu karede CSS animasyonu kullanılır.
// Yön sırası: 0 sağ, 1 yukarı, 2 sol, 3 aşağı. Döngü 8 sn (her yön 2 sn).
export const DIRS = ['right', 'up', 'left', 'down']
const PUPIL = { right: [5.2, 0], up: [0, -3.2], left: [-5.2, 0], down: [0, 3.4] }

export default function GazeTutorial({ frame = null, className = '', label = true }) {
  const fixed = frame != null ? DIRS[frame % 4] : null
  const cls = `gt ${fixed ? `gt-fixed gt-${fixed}` : 'gt-anim'} ${className}`
  return (
    <svg className={cls} viewBox="0 0 240 372" role="img" aria-label="Gözle oynama: dönmek istediğin yöne, tahtanın kenarına doğru bak; yılan o yöne döner">
      <defs>
        <linearGradient id="gt-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0c4a6" />
          <stop offset="1" stopColor="#d9a283" />
        </linearGradient>
        <linearGradient id="gt-skin-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c98f70" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#c98f70" stopOpacity="0" />
          <stop offset="1" stopColor="#c98f70" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="gt-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a22" />
          <stop offset="1" stopColor="#1f1410" />
        </linearGradient>
        <linearGradient id="gt-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#19c2d1" />
          <stop offset="1" stopColor="#3e7bfa" />
        </linearGradient>
        <radialGradient id="gt-iris" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#7fd9e3" />
          <stop offset="0.6" stopColor="#1c8f9c" />
          <stop offset="1" stopColor="#0b4a52" />
        </radialGradient>
        <radialGradient id="gt-sclera" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e9e4dc" />
        </radialGradient>
        <clipPath id="gt-eye-l"><ellipse cx="97" cy="211" rx="12.5" ry="7.2" /></clipPath>
        <clipPath id="gt-eye-r"><ellipse cx="143" cy="211" rx="12.5" ry="7.2" /></clipPath>
        <pattern id="gt-dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="1" className="gt-dot" />
        </pattern>
      </defs>

      {/* ---- Tahta ---- */}
      <g className="gt-board">
        <rect x="30" y="16" width="180" height="108" rx="14" className="gt-board-bg" />
        <rect x="30" y="16" width="180" height="108" rx="14" fill="url(#gt-dots)" />
        <g className="gt-food"><circle cx="186" cy="46" r="4.4" /></g>
        {/* Yılan: yön başına bir çizim, aktif olan görünür */}
        <g className="gt-snake gt-s-right">
          <path d="M66 94 H90 V70 H132" className="gt-body" />
          <circle cx="138" cy="70" r="6" className="gt-head" />
          <circle cx="140" cy="67.6" r="1.3" className="gt-eye" /><circle cx="140" cy="72.4" r="1.3" className="gt-eye" />
        </g>
        <g className="gt-snake gt-s-up">
          <path d="M66 94 H90 V70 H138 V52" className="gt-body" />
          <circle cx="138" cy="46" r="6" className="gt-head" />
          <circle cx="135.6" cy="44" r="1.3" className="gt-eye" /><circle cx="140.4" cy="44" r="1.3" className="gt-eye" />
        </g>
        <g className="gt-snake gt-s-left">
          <path d="M90 94 V70 H138 V46 H116" className="gt-body" />
          <circle cx="110" cy="46" r="6" className="gt-head" />
          <circle cx="108" cy="43.6" r="1.3" className="gt-eye" /><circle cx="108" cy="48.4" r="1.3" className="gt-eye" />
        </g>
        <g className="gt-snake gt-s-down">
          <path d="M138 70 V46 H110 V88" className="gt-body" />
          <circle cx="110" cy="94" r="6" className="gt-head" />
          <circle cx="107.6" cy="96" r="1.3" className="gt-eye" /><circle cx="112.4" cy="96" r="1.3" className="gt-eye" />
        </g>
        {/* Kenar okları (tahtanın dışında) */}
        <path d="M218 64 L228 70 L218 76 Z" className="gt-arrow gt-a-right" />
        <path d="M114 10 L120 2 L126 10 Z" className="gt-arrow gt-a-up" />
        <path d="M22 64 L12 70 L22 76 Z" className="gt-arrow gt-a-left" />
        <path d="M114 130 L120 138 L126 130 Z" className="gt-arrow gt-a-down" />
      </g>

      {/* ---- Kişi ---- */}
      <g className="gt-person" transform="translate(0 14)">
        {/* omuzlar ve boyun */}
        <path d="M28 330 C30 296 60 282 92 276 L96 258 H144 L148 276 C180 282 210 296 212 330 Z" fill="url(#gt-shirt)" />
        <path d="M96 258 H144 L146 274 C136 284 104 284 94 274 Z" fill="#c98f70" />
        <path d="M100 250 H140 V272 C132 280 108 280 100 272 Z" fill="url(#gt-skin)" />
        {/* kulaklar */}
        <ellipse cx="72" cy="212" rx="7" ry="10" fill="#e6b294" />
        <ellipse cx="168" cy="212" rx="7" ry="10" fill="#e6b294" />
        {/* yüz */}
        <path d="M74 190 C74 158 96 146 120 146 C144 146 166 158 166 190 C166 226 150 258 120 260 C90 258 74 226 74 190 Z" fill="url(#gt-skin)" />
        <path d="M74 190 C74 158 96 146 120 146 C144 146 166 158 166 190 C166 226 150 258 120 260 C90 258 74 226 74 190 Z" fill="url(#gt-skin-shade)" />
        {/* saç */}
        <path d="M70 196 C64 160 82 132 120 132 C158 132 176 160 170 196 C166 178 156 168 146 170 C136 158 116 156 100 166 C88 172 78 182 70 196 Z" fill="url(#gt-hair)" />
        <path d="M84 168 C96 152 118 150 132 156 C122 158 106 162 84 168 Z" fill="#5a453a" opacity="0.3" />
        {/* kaşlar */}
        <path d="M84 196 C90 190 102 189 110 194" className="gt-brow" />
        <path d="M130 194 C138 189 150 190 156 196" className="gt-brow" />
        {/* gözler */}
        <g className="gt-eyes">
          <ellipse cx="97" cy="211" rx="12.5" ry="7.2" fill="url(#gt-sclera)" />
          <ellipse cx="143" cy="211" rx="12.5" ry="7.2" fill="url(#gt-sclera)" />
          <g clipPath="url(#gt-eye-l)">
            <g className="gt-pupil" transform={fixed ? `translate(${PUPIL[fixed][0]} ${PUPIL[fixed][1]})` : undefined}>
              <circle cx="97" cy="211" r="5.6" fill="url(#gt-iris)" />
              <circle cx="97" cy="211" r="2.6" fill="#0a0f14" />
              <circle cx="95" cy="209" r="1.1" fill="#fff" opacity="0.9" />
            </g>
          </g>
          <g clipPath="url(#gt-eye-r)">
            <g className="gt-pupil" transform={fixed ? `translate(${PUPIL[fixed][0]} ${PUPIL[fixed][1]})` : undefined}>
              <circle cx="143" cy="211" r="5.6" fill="url(#gt-iris)" />
              <circle cx="143" cy="211" r="2.6" fill="#0a0f14" />
              <circle cx="141" cy="209" r="1.1" fill="#fff" opacity="0.9" />
            </g>
          </g>
          {/* üst göz kapağı çizgisi ve kirpik */}
          <path d="M85 209 C90 202 104 202 109 209" className="gt-lid" />
          <path d="M131 209 C136 202 150 202 155 209" className="gt-lid" />
          {/* kırpma: kapaklar (animasyonda arada iner) */}
          <ellipse cx="97" cy="205" rx="13" ry="1" className="gt-blink" />
          <ellipse cx="143" cy="205" rx="13" ry="1" className="gt-blink" />
        </g>
        {/* burun ve ağız */}
        <path d="M118 214 C114 226 112 232 116 236 C119 238 124 237 126 234" className="gt-nose" />
        <path d="M106 246 C112 251 128 251 134 246" className="gt-mouth" />
        <ellipse cx="88" cy="232" rx="7" ry="4" fill="#e39a86" opacity="0.35" />
        <ellipse cx="152" cy="232" rx="7" ry="4" fill="#e39a86" opacity="0.35" />
      </g>

      {label && (
        <text x="120" y="362" textAnchor="middle" className="gt-label">
          <tspan className="gt-t gt-t-right">Sağa bak → sağa döner</tspan>
          <tspan className="gt-t gt-t-up" x="120">Yukarı bak → yukarı döner</tspan>
          <tspan className="gt-t gt-t-left" x="120">Sola bak → sola döner</tspan>
          <tspan className="gt-t gt-t-down" x="120">Aşağı bak → aşağı döner</tspan>
        </text>
      )}
    </svg>
  )
}
