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

// (Yakın E testinin eski SwipeEArt / ShrinkArt çizimleri kaldırıldı: E yazı tipi harfiydi ve çizimde metin vardı.
// Yerine AcuitySwipeArt / AcuityShrinkArt, aşağıda.)

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
// Kalibrasyon hedefi: ekrandaki gibi küçük göz (iris, göz bebeği, ortasında altın nokta; CalIris) beş yere gider
export function DotFollowArt() {
  const path = '85 85;60 85;85 85;110 85;85 85;85 40;85 130'
  return (
    <svg viewBox="0 0 170 170">
      <rect x="45" y="18" width="80" height="134" rx="14" fill={panel} stroke="var(--border)" />
      <g>
        <animateTransform attributeName="transform" type="translate" values={path} dur="6s" repeatCount="indefinite" />
        <circle r="10" fill={acc} />
        <circle r="4.6" fill="#0b1219" />
        <circle r="1.7" fill="var(--cal-gold, #b57300)" />
        <circle r="14" fill="none" stroke="var(--ok)" strokeWidth="3">
          <animate attributeName="opacity" values="0;1;0;1;0;1;0" dur="6s" repeatCount="indefinite" />
        </circle>
      </g>
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

// ——— Yakın E testi (screens/AcuityTest.jsx; PLAN.md E1, E2) ———
// Çizimde metin yok ("40 cm", "Göremiyorum" sayfa metnidir). E, gerçek 5×5 tumbling E geometrisiyle
// (lib/optotype.js eRects ile aynı hücreler) tek bir dış çizgi olarak çizilir; yazı tipi harfi kullanılmaz. Beyaz
// karo açık temada 1 pt kenarlı.

// E'nin dış çizgisi (5×5 ızgara birimi): sağa açık E'nin 12 köşesi, yönler lib/optotype.js eRects ile aynı
// dönüşümle (sol: yatay ayna; aşağı: köşegen yansıma; yukarı: aşağının dikey aynası). Tek kapalı çokgen: yan yana
// dikdörtgenlerin ortak kenarında kenar yumuşatma gri bir dikiş bırakıyordu (sırt–kol birleşimi).
const E_OUTLINE_RIGHT = [[0, 0], [5, 0], [5, 1], [1, 1], [1, 2], [5, 2], [5, 3], [1, 3], [1, 4], [5, 4], [5, 5], [0, 5]]
const E_MAP = {
  right: ([px, py]) => [px, py],
  left: ([px, py]) => [5 - px, py],
  down: ([px, py]) => [py, px],
  up: ([px, py]) => [py, 5 - px],
}
export function eOutline(dir) {
  const f = E_MAP[dir]
  if (!f) throw new RangeError(`Bilinmeyen E yönü: ${dir}`)
  return E_OUTLINE_RIGHT.map(f)
}

// size: E'nin kenarı (kullanıcı birimi); x, y: sol üst köşe; dir: açık tarafın yönü. Tek <path> (dikişsiz).
export function EGlyph({ x = 0, y = 0, size = 50, dir = 'right', fill = '#000' }) {
  const u = size / 5
  const n = (v) => +v.toFixed(3)
  const d = `${eOutline(dir).map(([px, py], i) => `${i ? 'L' : 'M'}${n(x + px * u)} ${n(y + py * u)}`).join('')}Z`
  return <path className="e-glyph" d={d} fill={fill} />
}

// Beyaz karo içinde E (test alanıyla aynı: her temada beyaz zemin, siyah harf)
function ETile({ x, y, tile, size, dir, r = 12 }) {
  const pad = (tile - size) / 2
  return (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={tile - 1} height={tile - 1} rx={r} fill="#FFFFFF" stroke="var(--border)" strokeWidth="1" />
      <EGlyph x={x + pad} y={y + pad} size={size} dir={dir} fill="#000000" />
    </g>
  )
}

// Kart 1 · "Telefonu 40 cm uzakta tut": yüz, kesik mesafe çizgisi, telefon. ok: doğru uzaklık (yeşil)
export function AcuityDistanceArt({ ok = false }) {
  const col = ok ? 'var(--ok)' : 'var(--accent)'
  return (
    <svg viewBox="0 0 200 140" aria-hidden="true">
      <ellipse cx="44" cy="70" rx="26" ry="32" fill="none" stroke="var(--ink-2)" strokeWidth="2.5" />
      <rect x="150" y="40" width="30" height="58" rx="6" fill="none" stroke={col} strokeWidth="3" />
      <path d="M76 70 H144" stroke={col} strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M76 64 v12 M144 64 v12" stroke={col} strokeWidth="2.5" />
    </svg>
  )
}

// Kart 2 · "E'nin açık tarafına kaydır": sağa açık E ve sağa ok (klasik örnek; aşağı bakan E "m" gibi okunuyordu)
export function AcuitySwipeArt() {
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <ETile x={20} y={6} tile={108} size={64} dir="right" r={22} />
      <path d="M146 60 H186 M172 46 L186 60 L172 74" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Kart 3 · "Harf küçülür; seçemeyince Göremiyorum": küçülen dört E (farklı yönlerde)
export function AcuityShrinkArt() {
  const items = [[46, 'right'], [30, 'up'], [18, 'left'], [10, 'down']]
  const gap = 12
  const w = items.reduce((t, [s]) => t + s + 20, 0) + gap * (items.length - 1)
  let x = 4
  return (
    <svg viewBox={`0 0 ${w + 8} 80`} aria-hidden="true">
      {items.map(([s, d]) => {
        const tile = s + 20
        const g = <ETile key={d} x={x} y={76 - tile} tile={tile} size={s} dir={d} r={12} />
        x += tile + gap
        return g
      })}
    </svg>
  )
}

// E2 · hazırlık çizimi: çizgi yüz, ayna görünümü (kişinin solu ekranın solunda). cover: örtülecek göz 'L' | 'R'
// (iki göz testinde null → avuç yok). state: 'ok' (doğrulandı, yeşil) | 'bad' (yanlış, uyarı) | 'wait'.
// Avuç örtülecek gözün tarafında çizilir. Göz değişiminde kayma animasyonu YOK: hazırlık ekranı her göz için yeniden
// kurulur (arada deneme, sonuç ve mola ekranları var), önceki konum olmadığından geçiş oynatılamaz.
export function FaceCoverArt({ cover = 'L', state = 'wait' }) {
  const line = 'var(--ink-2)'
  const col = state === 'ok' ? 'var(--ok)' : state === 'bad' ? 'var(--warn)' : 'var(--accent)'
  const eye = (x, closed) =>
    closed ? null : (
      <g key={x}>
        <ellipse cx={x} cy="98" rx="11" ry="7" fill="none" stroke={line} strokeWidth="2.5" />
        <circle cx={x} cy="98" r="3.5" fill={line} />
      </g>
    )
  // Avuç 62'de çizilir; sağ göz örtülecekse 76 birim sağa kayar (138)
  const dx = cover === 'R' ? 76 : 0
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="face-cover-art">
      <ellipse cx="100" cy="104" rx="62" ry="78" fill="none" stroke={line} strokeWidth="2.5" />
      {eye(72, cover === 'L')}
      {eye(128, cover === 'R')}
      <path d="M100 104 L94 128 L104 128" fill="none" stroke={line} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M82 150 Q100 160 118 150" fill="none" stroke={line} strokeWidth="2.4" strokeLinecap="round" />
      {cover && (
        <g className="face-cover-palm" style={{ transform: `translateX(${dx}px)` }}>
          <path d="M32 150 C 28 110, 36 84, 56 80 C 78 76, 96 90, 94 118 L 88 150 Z" fill={col} fillOpacity="0.22" stroke={col} strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  )
}
