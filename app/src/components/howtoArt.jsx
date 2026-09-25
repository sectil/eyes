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

// Sesli oku: cümle ve ses dalgası
export function ReadAloudArt() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="22" y="40" width="126" height="64" rx="14" fill={panel} stroke="var(--border)" />
      <text x="85" y="66" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="12" fill={ink}>Sabah güneşi vadiye</text>
      <text x="85" y="86" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="12" fill={ink}>yavaşça süzülüyordu.</text>
      <g stroke={acc} strokeWidth="4" strokeLinecap="round">
        {[60, 72, 84, 96, 108].map((x, i) => (
          <line key={x} x1={x} y1="138" x2={x} y2="138">
            <animate attributeName="y1" values={`134;${118 + (i % 2) * 6};134`} dur="1.1s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
            <animate attributeName="y2" values={`142;${158 - (i % 2) * 6};142`} dur="1.1s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
          </line>
        ))}
      </g>
    </svg>
  )
}

// Yazı küçülür; "Okuyamıyorum"
export function ShrinkTextArt() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="22" y="30" width="126" height="84" rx="14" fill={panel} stroke="var(--border)" />
      <text x="85" y="78" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fill={ink} fontSize="16">
        Küçük bir tavşan<animate attributeName="font-size" values="16;11;7;16" dur="3s" repeatCount="indefinite" />
      </text>
      <rect x="40" y="130" width="90" height="22" rx="11" fill="var(--accent-soft)" stroke={acc} />
      <text x="85" y="145" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="700" fill={acc}>Okuyamıyorum</text>
    </svg>
  )
}

// Noktayı izle: dört kenarda nokta, yeşile dönen halka
export function DotFollowArt() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="45" y="18" width="80" height="134" rx="14" fill={panel} stroke="var(--border)" />
      <circle r="7" fill={acc}>
        <animate attributeName="cx" values="85;60;85;110;85;85;85" dur="6s" repeatCount="indefinite" />
        <animate attributeName="cy" values="85;85;85;85;85;40;130" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle r="13" fill="none" stroke="var(--ok)" strokeWidth="3">
        <animate attributeName="cx" values="85;60;85;110;85;85;85" dur="6s" repeatCount="indefinite" />
        <animate attributeName="cy" values="85;85;85;85;85;40;130" dur="6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;0;1;0;1;0" dur="6s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

// Yüz kameraya dönük, iyi ışık
export function FaceLightArt() {
  return (
    <svg viewBox="0 0 170 170">
      <circle cx="40" cy="40" r="14" fill="var(--lens-soft, var(--accent-soft))" stroke="var(--lens, var(--accent-graphic))" strokeWidth="2.5" />
      <g stroke="var(--lens, var(--accent-graphic))" strokeWidth="2.5" strokeLinecap="round"><line x1="40" y1="14" x2="40" y2="20" /><line x1="60" y1="40" x2="66" y2="40" /><line x1="55" y1="25" x2="59" y2="21" /></g>
      <circle cx="85" cy="96" r="30" fill="none" stroke={ink} strokeWidth="3" />
      <ellipse cx="74" cy="92" rx="5" ry="3" fill={ink} /><ellipse cx="96" cy="92" rx="5" ry="3" fill={ink} />
      <path d="M76 108q9 6 18 0" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="128" y="62" width="22" height="46" rx="5" fill={panel} stroke={acc} strokeWidth="2.5" />
      <circle cx="139" cy="68" r="2" fill={acc} />
    </svg>
  )
}

// Çembere atla: iki nokta arasında sıçrayan halka
export function JumpRingArt() {
  return (
    <svg viewBox="0 0 170 170">
      <rect x="22" y="30" width="126" height="110" rx="16" fill={panel} stroke="var(--border)" />
      {[[50, 60], [120, 60], [50, 112], [120, 112]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="var(--surface-3)" />)}
      <g>
        <circle r="15" fill="var(--accent-soft)" stroke={acc} strokeWidth="3">
          <animate attributeName="cx" values="50;50;120;120;50;50" dur="4s" calcMode="discrete" repeatCount="indefinite" />
          <animate attributeName="cy" values="60;60;112;112;60;60" dur="4s" calcMode="discrete" repeatCount="indefinite" />
        </circle>
        <text textAnchor="middle" fontFamily="var(--font-body)" fontSize="7" fontWeight="700" fill={acc}>
          Devam
          <animate attributeName="x" values="50;50;120;120;50;50" dur="4s" calcMode="discrete" repeatCount="indefinite" />
          <animate attributeName="y" values="63;63;115;115;63;63" dur="4s" calcMode="discrete" repeatCount="indefinite" />
        </text>
      </g>
    </svg>
  )
}
