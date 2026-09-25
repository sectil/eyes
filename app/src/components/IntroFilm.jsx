import { useEffect, useRef, useState } from 'react'
import { captionAt, INTRO_END_MS } from '../lib/intro.js'
import { haptic } from '../lib/native.js'
import '../styles/intro.css'

// Giriş filmi (Artifact "EyeTrail Giriş Filmi", onaylı): 15 sn, sessiz, iris içinden. Gözlüğü çıkarır, koşar,
// bankın altındaki kediyi, patlak lastiği, açan çiçeği fark eder; çocuklukta bulut ata dönüşür; ata biner, at kanatlanır.
// Her "fark etme" anında altın odak halkası. SVG + SMIL: ağ yok, ses yok. Zaman SMIL belge saatinden okunur
// (arka planda zamanlayıcı kısılsa da yazı ve bitiş kaymaz). Sağlık iddiası yok; gözlük "kötü" gösterilmez.
export default function IntroFilm({ onDone, replay = false }) {
  const svg = useRef(null)
  const [cap, setCap] = useState('')
  const [ended, setEnded] = useState(false)
  const [capOff, setCapOff] = useState(false)
  const lastCap = useRef('')

  useEffect(() => {
    const el = svg.current
    try { el.setCurrentTime(0); el.unpauseAnimations() } catch { /* SMIL yoksa: sadece son kare */ }
    const id = setInterval(() => {
      let ms = 0
      try { ms = el.getCurrentTime() * 1000 } catch { ms = INTRO_END_MS }
      const c = captionAt(ms)
      if (c !== lastCap.current) {
        lastCap.current = c
        setCapOff(true)
        setTimeout(() => { setCap(c); setCapOff(false) }, 200)
      }
      if (ms >= INTRO_END_MS) { setEnded(true); clearInterval(id) }
    }, 100)
    return () => clearInterval(id)
  }, [])

  function skip() {
    try { svg.current.setCurrentTime(15.2) } catch { /* yoksay */ }
    setCap('')
    setEnded(true)
  }
  function finish() {
    haptic('success')
    onDone()
  }

  const stroke = { stroke: '#eef3f6', strokeWidth: 4, strokeLinecap: 'round', fill: 'none' }
  return (
    <div className="intro" role="dialog" aria-label="Giriş filmi">
      {!ended && <button type="button" className="intro-skip" onClick={skip}>Atla</button>}
      <div className="intro-ap">
        <svg className="intro-ring" viewBox="0 0 100 100" aria-hidden="true"><circle className="r1" cx="50" cy="50" r="47" /><circle className="r2" cx="50" cy="50" r="42" /></svg>
        <svg ref={svg} className="intro-film" viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <clipPath id="intro-iris"><circle cx="160" cy="160" r="150" /></clipPath>
            <linearGradient id="intro-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f2740" /><stop offset="1" stopColor="#060a12" /></linearGradient>
            <radialGradient id="intro-sun"><stop offset="0" stopColor="#ffd27a" /><stop offset="1" stopColor="#ffb13b" /></radialGradient>
            <g id="intro-horse">
              <path d="M6 22 Q-6 26 -2 36" fill="none" stroke="#eef3f6" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="30" cy="25" rx="22" ry="10" fill="#eef3f6" />
              <path d="M46 20 L58 3" stroke="#eef3f6" strokeWidth="8" strokeLinecap="round" />
              <path d="M58 3 L73 8" stroke="#eef3f6" strokeWidth="6" strokeLinecap="round" />
              <path d="M60 2 L62 -6 M66 3 L70 -4" stroke="#eef3f6" strokeWidth="3" strokeLinecap="round" />
              <g>
                <line x1="16" y1="30" x2="10" y2="48" stroke="#eef3f6" strokeWidth="4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" values="-18 16 30;18 16 30;-18 16 30" dur="0.5s" repeatCount="indefinite" /></line>
                <line x1="44" y1="30" x2="50" y2="48" stroke="#eef3f6" strokeWidth="4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" values="18 44 30;-18 44 30;18 44 30" dur="0.5s" repeatCount="indefinite" /></line>
                <line x1="22" y1="32" x2="20" y2="48" stroke="#eef3f6" strokeWidth="4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" values="14 22 32;-14 22 32;14 22 32" dur="0.5s" begin="0.12s" repeatCount="indefinite" /></line>
                <line x1="38" y1="32" x2="40" y2="48" stroke="#eef3f6" strokeWidth="4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" values="-14 38 32;14 38 32;-14 38 32" dur="0.5s" begin="0.12s" repeatCount="indefinite" /></line>
              </g>
            </g>
          </defs>
          <g clipPath="url(#intro-iris)">
            <rect width="320" height="320" fill="url(#intro-sky)" />
            <g fill="#fff" opacity="0.7">
              <circle cx="40" cy="60" r="1.4" /><circle cx="90" cy="30" r="1" /><circle cx="150" cy="50" r="1.6" /><circle cx="210" cy="24" r="1.1" /><circle cx="270" cy="70" r="1.3" />
              <circle cx="60" cy="120" r="1" /><circle cx="240" cy="120" r="1.5" /><circle cx="120" cy="90" r="0.9" /><circle cx="290" cy="150" r="1" /><circle cx="20" cy="170" r="1.2" />
            </g>
            {/* gündüz örtüsü: güneş doğunca açılır, kanatlı at gelince gece döner */}
            <rect width="320" height="320" fill="#8fd0e4" opacity="0"><animate attributeName="opacity" begin="7.7s" dur="1.3s" from="0" to="0.75" fill="freeze" /><animate attributeName="opacity" begin="12.1s" dur="0.6s" from="0.75" to="0" fill="freeze" /></rect>
            <path d="M0 232 H320 V320 H0Z" fill="#0b1a2b" />
            <path d="M0 232 H320" stroke="#19c2d1" strokeOpacity="0.5" strokeWidth="1.5" />

            {/* A: gözlüklü kişi, gözlüğü çıkarır (0–3.3 s) */}
            <g opacity="1"><animate attributeName="opacity" begin="3.0s" dur="0.3s" from="1" to="0" fill="freeze" />
              <g transform="translate(160 162)" {...stroke}>
                <circle cx="0" cy="0" r="9" fill="#eef3f6" stroke="none" />
                <line x1="0" y1="9" x2="0" y2="42" />
                <line x1="0" y1="18" x2="-12" y2="38" />
                <line x1="0" y1="18" x2="12" y2="38"><animateTransform attributeName="transform" type="rotate" begin="1.7s" dur="0.5s" from="0 0 18" to="-150 0 18" fill="freeze" /><animateTransform attributeName="transform" type="rotate" begin="2.6s" dur="0.5s" from="-150 0 18" to="0 0 18" fill="freeze" /></line>
                <line x1="0" y1="42" x2="-8" y2="70" /><line x1="0" y1="42" x2="8" y2="70" />
                <g stroke="#19c2d1" strokeWidth="2.2">
                  <animateTransform attributeName="transform" type="translate" begin="2.3s" dur="0.7s" from="0 0" to="70 -80" fill="freeze" additive="sum" />
                  <animateTransform attributeName="transform" type="rotate" begin="2.3s" dur="0.7s" from="0 0 0" to="40 0 0" fill="freeze" additive="sum" />
                  <animate attributeName="opacity" begin="2.6s" dur="0.4s" from="1" to="0" fill="freeze" />
                  <circle cx="-6" cy="-1" r="5" /><circle cx="6" cy="-1" r="5" /><line x1="-1" y1="-1" x2="1" y2="-1" /><line x1="-11" y1="-2" x2="-15" y2="-4" /><line x1="11" y1="-2" x2="15" y2="-4" />
                </g>
              </g>
            </g>

            {/* B: koşu; bank + kedi, araba + patlak lastik, güneş + çiçek (3.1–9.8 s) */}
            <g opacity="0"><animate attributeName="opacity" begin="3.1s" dur="0.3s" from="0" to="1" fill="freeze" /><animate attributeName="opacity" begin="9.5s" dur="0.3s" from="1" to="0" fill="freeze" />
              <g transform="translate(360 0)"><animateTransform attributeName="transform" type="translate" begin="3.3s" dur="2.6s" from="360 0" to="-90 0" fill="freeze" />
                <rect x="0" y="212" width="46" height="5" rx="2" fill="#eef3f6" /><rect x="4" y="217" width="3" height="15" fill="#eef3f6" /><rect x="39" y="217" width="3" height="15" fill="#eef3f6" />
                <rect x="0" y="204" width="46" height="4" rx="2" fill="#eef3f6" />
                <g fill="#ffb13b"><ellipse cx="24" cy="227" rx="7" ry="4" /><circle cx="31" cy="224" r="3.5" /><path d="M29 221 L28 217 L31 220 Z M33 221 L34 217 L31 220 Z" /><path d="M17 226 Q12 224 14 220" stroke="#ffb13b" strokeWidth="1.6" fill="none" /></g>
                <circle cx="26" cy="225" r="6" fill="none" stroke="#ffb13b" strokeWidth="2" opacity="0"><animate attributeName="opacity" begin="4.5s" dur="0.9s" values="0;1;0" /><animate attributeName="r" begin="4.5s" dur="0.9s" from="6" to="26" /></circle>
              </g>
              <g transform="translate(420 0)"><animateTransform attributeName="transform" type="translate" begin="5.6s" dur="2.2s" from="420 0" to="-140 0" fill="freeze" />
                <path d="M0 226 L4 212 L20 210 L32 198 L64 198 L76 212 L92 214 L92 228 L0 228 Z" fill="#eef3f6" />
                <circle cx="20" cy="228" r="7" fill="#060a12" stroke="#eef3f6" strokeWidth="3" />
                <ellipse cx="74" cy="230" rx="9" ry="5" fill="#060a12" stroke="#eef3f6" strokeWidth="3" />
                <circle cx="74" cy="229" r="6" fill="none" stroke="#ffb13b" strokeWidth="2" opacity="0"><animate attributeName="opacity" begin="6.7s" dur="0.9s" values="0;1;0" /><animate attributeName="r" begin="6.7s" dur="0.9s" from="6" to="26" /></circle>
              </g>
              <circle cx="250" cy="340" r="22" fill="url(#intro-sun)"><animate attributeName="cy" begin="7.6s" dur="1.5s" from="340" to="92" fill="freeze" /></circle>
              <line x1="212" y1="232" x2="212" y2="232" stroke="#19c2d1" strokeWidth="3" strokeLinecap="round"><animate attributeName="y2" begin="8.0s" dur="0.8s" from="232" to="198" fill="freeze" /></line>
              <g transform="translate(212 196)"><g transform="scale(0)"><animateTransform attributeName="transform" type="scale" begin="8.7s" dur="0.7s" from="0" to="1" fill="freeze" />
                <g fill="#ffb13b"><ellipse cx="0" cy="-9" rx="4" ry="7" /><ellipse cx="0" cy="9" rx="4" ry="7" /><ellipse cx="-9" cy="0" rx="7" ry="4" /><ellipse cx="9" cy="0" rx="7" ry="4" /><ellipse cx="-6.5" cy="-6.5" rx="4" ry="6" transform="rotate(-45)" /><ellipse cx="6.5" cy="6.5" rx="4" ry="6" transform="rotate(-45)" /><ellipse cx="6.5" cy="-6.5" rx="4" ry="6" transform="rotate(45)" /><ellipse cx="-6.5" cy="6.5" rx="4" ry="6" transform="rotate(45)" /></g>
                <circle r="3.5" fill="#060a12" /></g>
                <circle r="6" fill="none" stroke="#ffb13b" strokeWidth="2" opacity="0"><animate attributeName="opacity" begin="9.1s" dur="0.9s" values="0;1;0" /><animate attributeName="r" begin="9.1s" dur="0.9s" from="6" to="26" /></circle>
              </g>
              <g transform="translate(120 160)">
                <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="0.45s" repeatCount="indefinite" />
                  <g {...stroke}>
                    <circle cx="4" cy="0" r="9" fill="#eef3f6" stroke="none" />
                    <line x1="3" y1="9" x2="-3" y2="42" />
                    <line x1="1" y1="18" x2="16" y2="30"><animateTransform attributeName="transform" type="rotate" values="35 1 18;-40 1 18;35 1 18" dur="0.45s" repeatCount="indefinite" /></line>
                    <line x1="1" y1="18" x2="-14" y2="30"><animateTransform attributeName="transform" type="rotate" values="-40 1 18;35 1 18;-40 1 18" dur="0.45s" repeatCount="indefinite" /></line>
                    <line x1="-3" y1="42" x2="12" y2="70"><animateTransform attributeName="transform" type="rotate" values="40 -3 42;-45 -3 42;40 -3 42" dur="0.45s" repeatCount="indefinite" /></line>
                    <line x1="-3" y1="42" x2="-12" y2="70"><animateTransform attributeName="transform" type="rotate" values="-45 -3 42;40 -3 42;-45 -3 42" dur="0.45s" repeatCount="indefinite" /></line>
                  </g>
                </g>
              </g>
            </g>

            {/* C: çocukluk; bulutlar, at olan bulut (9.8–12.3 s) */}
            <g opacity="0"><animate attributeName="opacity" begin="9.8s" dur="0.3s" from="0" to="1" fill="freeze" /><animate attributeName="opacity" begin="12.1s" dur="0.3s" from="1" to="0" fill="freeze" />
              <g {...stroke}>
                <circle cx="98" cy="224" r="8" fill="#eef3f6" stroke="none" />
                <line x1="107" y1="226" x2="150" y2="226" strokeWidth="5" />
                <line x1="150" y1="226" x2="176" y2="228" /><line x1="150" y1="226" x2="172" y2="218" />
                <path d="M108 222 Q96 206 90 216" />
              </g>
              <g fill="#eef3f6" opacity="0.92"><animateTransform attributeName="transform" type="translate" begin="9.8s" dur="2.5s" from="0 0" to="-18 0" fill="freeze" />
                <g><circle cx="80" cy="96" r="12" /><circle cx="96" cy="88" r="16" /><circle cx="114" cy="96" r="12" /><rect x="70" y="96" width="54" height="12" rx="6" /></g>
                <g><animate attributeName="opacity" begin="10.7s" dur="1s" from="1" to="0" fill="freeze" /><circle cx="200" cy="116" r="14" /><circle cx="220" cy="106" r="19" /><circle cx="244" cy="114" r="14" /><rect x="188" y="114" width="70" height="14" rx="7" /></g>
                <g opacity="0" transform="translate(190 92)"><animate attributeName="opacity" begin="10.7s" dur="1s" from="0" to="1" fill="freeze" /><use href="#intro-horse" /></g>
              </g>
              <circle cx="226" cy="110" r="6" fill="none" stroke="#ffb13b" strokeWidth="2" opacity="0"><animate attributeName="opacity" begin="11.5s" dur="0.9s" values="0;1;0" /><animate attributeName="r" begin="11.5s" dur="0.9s" from="10" to="44" /></circle>
            </g>

            {/* D: ata biner, at kanatlanır, uçar (12.3–15 s) */}
            <g opacity="0"><animate attributeName="opacity" begin="12.3s" dur="0.3s" from="0" to="1" fill="freeze" />
              <g transform="translate(128 186)">
                <animateTransform attributeName="transform" type="translate" begin="13.9s" dur="1.1s" from="128 186" to="230 -40" fill="freeze" />
                <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="0.5s" repeatCount="indefinite" />
                  <g transform="translate(30 16)"><g transform="scale(0.02)"><animateTransform attributeName="transform" type="scale" begin="13.2s" dur="0.6s" from="0.02" to="1" fill="freeze" />
                    <path d="M0 0 Q-22 -34 -48 -26 Q-28 -10 0 0 Z" fill="#19c2d1" opacity="0.9"><animateTransform attributeName="transform" type="rotate" values="0;-14;0" dur="0.5s" repeatCount="indefinite" /></path>
                    <path d="M0 0 Q22 -34 48 -26 Q28 -10 0 0 Z" fill="#19c2d1" opacity="0.9"><animateTransform attributeName="transform" type="rotate" values="0;14;0" dur="0.5s" repeatCount="indefinite" /></path>
                  </g></g>
                  <use href="#intro-horse" />
                  <g {...stroke} transform="translate(30 -8)">
                    <circle cx="0" cy="-16" r="8" fill="#eef3f6" stroke="none" />
                    <line x1="0" y1="-8" x2="0" y2="18" /><line x1="0" y1="0" x2="16" y2="8" /><line x1="0" y1="18" x2="10" y2="34" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
      <p className={`intro-cap${capOff ? ' off' : ''}`} aria-live="polite">{cap}</p>
      <div className={`intro-final${ended ? ' on' : ''}`} aria-hidden={!ended}>
        <div className="intro-logo">EyeTrail</div>
        <p className="intro-tag">Fark etmeyi yeniden öğren.</p>
        <button type="button" className="btn intro-start" onClick={finish} disabled={!ended}>{replay ? 'Kapat' : 'Başla'}</button>
      </div>
    </div>
  )
}
