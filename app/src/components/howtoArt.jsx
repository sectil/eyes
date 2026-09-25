// Yönerge kartlarının çizimleri (SVG + SMIL; dış görsel yok). Renkler tasarım tokenlarından.
// prefers-reduced-motion: stepcards.css animasyonları durdurur (SMIL için begin="indefinite" yerine
// CSS ile gizlenir; kare yine anlamlıdır).
const ink = 'var(--ink)'
const acc = 'var(--accent-graphic)'
const panel = 'var(--surface-2)'

// Telefonu kol boyu uzakta tut: kafa, ok ve telefon; canlı cm yazısı
export function DistanceArt({ cm = null, ok = false }) {
  return (
    <svg viewBox="0 0 170 170">
      <circle cx="40" cy="66" r="15" fill="none" stroke={ink} strokeWidth="3" />
      <circle cx="46" cy="64" r="3" fill={ink} />
      <path d="M12 122c4-22 16-30 28-30s24 8 28 30" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="118" y="44" width="30" height="58" rx="6" fill={panel} stroke={ok ? 'var(--ok)' : acc} strokeWidth="3" />
      <path d="M58 70H112" stroke={ok ? 'var(--ok)' : acc} strokeWidth="2.5" strokeDasharray="4 5">
        <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite" />
      </path>
      <text x="85" y="60" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill={ok ? 'var(--ok)' : acc}>{cm ? `${cm} cm` : '40 cm'}</text>
    </svg>
  )
}

// E'nin açık tarafına doğru kaydır: beyaz alan, döndürülmüş E, aşağı kayan parmak
export function SwipeEArt() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="30" y="26" width="110" height="110" rx="18" fill="#FFFFFF" />
      <text x="85" y="100" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="54" fill="#0B1219" transform="rotate(90 85 81)">E</text>
      <g fill="none" stroke={acc} strokeWidth="4" strokeLinecap="round">
        <path d="M85 112v22"><animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" /></path>
        <path d="M75 126l10 10 10-10"><animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" /></path>
      </g>
      <circle cx="85" cy="150" r="9" fill={acc} opacity="0.9"><animate attributeName="cy" values="126;152;152" dur="1.8s" repeatCount="indefinite" /></circle>
    </svg>
  )
}

// Harf küçülür; seçemeyince "Göremiyorum"
export function ShrinkArt() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="30" y="34" width="110" height="90" rx="16" fill="#FFFFFF" />
      <text x="85" y="94" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="40" fill="#0B1219">
        E<animate attributeName="font-size" values="40;24;14;40" dur="3s" repeatCount="indefinite" />
      </text>
      <rect x="45" y="136" width="80" height="18" rx="9" fill={panel} stroke="var(--border)" />
      <text x="85" y="149" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fontWeight="700" fill="var(--ink-3)">Göremiyorum</text>
    </svg>
  )
}

// Nefes ver, ekrana bir kez dokun: nefes halkası + dokunan parmak
export function BreathTapArt({ count = 3 }) {
  return (
    <svg viewBox="0 0 170 170">
      <circle cx="78" cy="80" r="46" fill="var(--accent-soft)" stroke={acc} strokeWidth="3">
        <animate attributeName="r" values="40;52;40" dur="4s" repeatCount="indefinite" />
      </circle>
      <text x="78" y="90" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="30" fill={ink}>{count}</text>
      <circle cx="132" cy="140" r="8" fill={acc} opacity="0.85"><animate attributeName="r" values="4;10;4" dur="4s" repeatCount="indefinite" /></circle>
      <circle cx="132" cy="140" r="14" fill="none" stroke={acc} strokeWidth="2"><animate attributeName="r" values="8;22" dur="4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;0" dur="4s" repeatCount="indefinite" /></circle>
    </svg>
  )
}

// 9'da basılı tut
export function BreathHoldArt() {
  return (
    <svg viewBox="0 0 170 170">
      <circle cx="78" cy="80" r="46" fill="var(--lens-soft, var(--accent-soft))" stroke="var(--lens, var(--accent-graphic))" strokeWidth="3" />
      <text x="78" y="90" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="30" fill={ink}>9</text>
      <circle cx="132" cy="140" r="8" fill="var(--lens, var(--accent-graphic))"><animate attributeName="r" values="8;12;12;12;8" dur="2.4s" repeatCount="indefinite" /></circle>
      <circle cx="132" cy="140" r="14" fill="none" stroke="var(--lens, var(--accent-graphic))" strokeWidth="2"><animate attributeName="r" values="10;22" dur="2.4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" /></circle>
    </svg>
  )
}

// Sayıyı kaybettim: soru işareti ve "Kaybettim" düğmesi (hata değil, fark etme)
export function LostCountArt() {
  return (
    <svg viewBox="0 0 170 170">
      <circle cx="85" cy="70" r="40" fill={panel} stroke="var(--border)" strokeWidth="2" />
      <text x="85" y="82" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="34" fill="var(--ink-3)">?</text>
      <rect x="40" y="126" width="90" height="22" rx="11" fill="var(--accent-soft)" stroke={acc} />
      <text x="85" y="141" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="700" fill={acc}>Kaybettim</text>
    </svg>
  )
}
