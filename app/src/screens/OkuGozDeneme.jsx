// Okurken göz (deneme; sahip 2026-10-03, yalnız test derlemesi: App.jsx SKY_UI): bugünün Oku ve Anla metninde kelimeler
// seçilen hızda sırayla yanar; TrueDepth göz verisi kaydedilir; sonunda satır dönüşleri yanan satırla karşılaştırılır
// (lib/readGaze.js). Soru: telefonun göz verisi okumayı izleyebiliyor mu? Okuma bitince Oku ve Anla'nın dört sorusu
// (sahip 2026-10-03: "okurun anladığını da tabii test edeceğiz"); sonuçta anlama da yazar. Oku ve Anla ölçümüne
// dokunmaz, kayıt yazmaz.
// Kamera görüntüsü kaydedilmez; yalnız göz yönü sayıları bellekte, "Ham veriyi paylaş" ile kişinin isteğiyle çıkar.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronDown, X, Eye } from 'lucide-react'
import { useFaceTracking } from '../hooks/useFaceTracking.js'
import { todayText, questionSet } from '../lib/okumaSelect.js'
import OkuSoru from '../components/OkuSoru.jsx'
import { SEED_KEY } from '../modules/okuma-anlama/manifest.js'
import { SPEEDS, PASS_RATE, analyze, litAt, payloadOf } from '../lib/readGaze.js'
import { shareText } from '../lib/share.js'
import { buildInfo } from '../lib/buildInfo.js'
import '../styles/okugoz.css'

const READY_MS = 3000 // yüz görününce geri sayım
const FONT_MAX = 20
const FONT_MIN = 15

const seedOf = (storage) => {
  try { return storage?.getItem(SEED_KEY) || 'oa' } catch { return 'oa' }
}
// "4 sorunun 3’ü doğru" (Oku ve Anla sonuç çipiyle aynı söz)
const EK = { 0: 'ı', 1: 'i', 2: 'si', 3: 'ü', 4: 'ü' }
const pct = (v) => `%${Math.round((v ?? 0) * 100)}`

export default function OkuGozDeneme({ sessions = [], storage = globalThis.localStorage, trueDepth = false, onExit }) {
  const [{ text, cycle }] = useState(() => todayText({ seed: seedOf(storage), sessions }))
  const questions = useMemo(() => questionSet(text, cycle), [text, cycle])
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState([])
  const words = useMemo(() => text.metin.split(/\s+/).filter(Boolean), [text])
  const [phase, setPhase] = useState('giris') // giris | hazir | okuma | soru | sonuc
  const [wpm, setWpm] = useState(200)
  const [lit, setLit] = useState(-1)
  const [count, setCount] = useState(null)
  const [font, setFont] = useState(FONT_MAX)
  const [pages, setPages] = useState([{ from: 0, top: 0 }]) // sığmayan metin sayfalara bölünür (320 × 568)
  const [result, setResult] = useState(null)
  const [note, setNote] = useState('')
  const frames = useRef([])
  const rects = useRef([])
  const t0 = useRef(0)
  const boxRef = useRef(null)
  const faceSince = useRef(null)
  const pagesRef = useRef(pages)
  pagesRef.current = pages

  const cam = useFaceTracking({
    enabled: phase === 'hazir' || phase === 'okuma',
    trueDepth: true,
    onFrame: (f) => { if (f.native) frames.current.push(f) },
  })

  // Metin tek ekrana sığar (kaydırma yok: kelimelerin ekrandaki yeri okuma boyunca sabit kalsın). En küçük yazıda da
  // sığmazsa sayfalara bölünür; yanan kelime yeni sayfaya geçince sayfa değişir (satır dönüşü gibi başa sıçrama)
  useLayoutEffect(() => {
    if (phase !== 'hazir') return
    const box = boxRef.current
    if (!box) return
    let f = FONT_MAX
    box.style.fontSize = `${f}px`
    while (f > FONT_MIN && box.scrollHeight > box.clientHeight + 1) { f -= 0.5; box.style.fontSize = `${f}px` }
    setFont(f)
    const els = [...box.querySelectorAll('.og-w')]
    const H = box.clientHeight - 8
    // Sayfa sonu: sığan son cümlenin sonu (yoksa sığan son satır); yeni sayfa o cümleden sonraki kelimenin satırından
    const ps = [{ from: 0, top: 0 }]
    let i = 0
    while (i < els.length) {
      const cur = ps[ps.length - 1]
      let last = i
      while (last + 1 < els.length && els[last + 1].offsetTop + els[last + 1].offsetHeight - cur.top <= H) last++
      if (last + 1 >= els.length) break
      let cut = last
      while (cut > i && !/[.!?…]["”’)]*$/.test(words[cut])) cut--
      if (cut === i) { cut = last; while (cut > i && els[cut].offsetTop === els[last + 1].offsetTop) cut-- }
      ps.push({ from: cut + 1, top: els[cut + 1].offsetTop })
      i = cut + 1
    }
    setPages(ps)
  }, [phase])
  const pageOf = (i) => { let k = 0; while (k + 1 < pages.length && pages[k + 1].from <= i) k++; return k }

  // Hazır: yüz görünür görünmez 3 sn geri sayım; yüz kaybolursa sayım baştan
  useEffect(() => {
    if (phase !== 'hazir') return undefined
    const id = setInterval(() => {
      const now = performance.now()
      const last = frames.current[frames.current.length - 1]
      const seen = last && last.tracked && now - last.ts < 300
      if (!seen) { faceSince.current = null; setCount(null); return }
      faceSince.current ??= now
      const left = READY_MS - (now - faceSince.current)
      if (left > 0) setCount(Math.ceil(left / 1000))
      else {
        clearInterval(id)
        // Ekrandaki yer: ilk sayfa gösterilirken ölçülür; sonraki sayfaların kelimeleri sayfanın üstü kadar yukarı çıkar
        const tops = pagesRef.current
        rects.current = [...(boxRef.current?.querySelectorAll('.og-w') ?? [])].map((el, i) => {
          const r = el.getBoundingClientRect()
          let k = 0
          while (k + 1 < tops.length && tops[k + 1].from <= i) k++
          return { x: r.left, y: r.top - tops[k].top, w: r.width, h: r.height }
        })
        frames.current = []
        t0.current = performance.now()
        setPhase('okuma')
      }
    }, 100)
    return () => clearInterval(id)
  }, [phase])

  // Okuma: yanan kelime saatle; son kelimeden yarım saniye sonra sonuç
  useEffect(() => {
    if (phase !== 'okuma') return undefined
    let raf = 0
    const end = t0.current + (words.length * 60000) / wpm + 500
    const tick = () => {
      const now = performance.now()
      if (now >= end) {
        setLit(-1)
        setResult(analyze({ frames: frames.current, rects: rects.current, t0: t0.current, wpm }))
        setQi(0)
        setAnswers([])
        setPhase('soru')
        return
      }
      setLit(litAt(now, t0.current, words.length, wpm))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, wpm, words.length])

  const start = () => {
    frames.current = []
    faceSince.current = null
    setCount(null)
    setLit(-1)
    setResult(null)
    setNote('')
    setPhase('hazir')
  }
  const stop = () => { setLit(-1); setPhase('giris') }
  const choose = (opt) => {
    if (answers[qi]) return
    const next = [...answers]
    next[qi] = { id: questions[qi].id, chosen: opt.text, correct: opt.correct }
    setAnswers(next)
  }
  const nextQ = () => (qi + 1 < questions.length ? setQi(qi + 1) : setPhase('sonuc'))
  const share = async () => {
    const payload = payloadOf({ result, frames: frames.current, rects: rects.current, t0: t0.current, wpm, title: text.baslik, build: buildInfo().version, correct: answers.filter((a) => a?.correct).length })
    const r = await shareText('Nefona okurken göz verisi', payload)
    setNote(r === 'shared' ? 'Paylaşıldı.' : r === 'copied' ? 'Panoya kopyalandı.' : 'Kopyalanamadı.')
  }

  if (phase === 'giris') {
    const camOff = cam.error === 'permission'
    return (
      <main className="og">
        <div className="og-bar"><button type="button" className="og-ib" onClick={onExit} aria-label="Geri"><ChevronLeft size={20} aria-hidden="true" /></button></div>
        <div className="og-body">
          <div className="og-kick">Deneme</div>
          <h1 className="og-h1">Okurken göz</h1>
          <p className="og-lead">Kelimeler seçtiğin hızda sırayla yanar. Yanan kelimeyi gözünle izle.</p>
          <p className="og-lead dim">Sonunda telefon, gözünün satırları izleyip izlemediğini gösterir.</p>
          <div className="og-lab" id="og-speed">Hız · kelime/dakika</div>
          <div className="og-chips" role="radiogroup" aria-labelledby="og-speed">
            {SPEEDS.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={wpm === s} className={`og-chip${wpm === s ? ' on' : ''}`} onClick={() => setWpm(s)}>{s}</button>
            ))}
          </div>
          <p className="og-small">Kamera görüntüsü kaydedilmez. Yalnız gözünün yönü sayı olarak telefonda tutulur.</p>
        </div>
        <div className="og-foot">
          {!trueDepth ? <p className="og-warn">Bu deneme Face ID kameralı iPhone'da çalışır.</p> : camOff ? <p className="og-warn">Kamera izni kapalı. iPhone Ayarlar'dan aç.</p> : null}
          <button type="button" className="btn" onClick={start} disabled={!trueDepth || camOff}>Başla</button>
        </div>
      </main>
    )
  }

  if (phase === 'hazir' || phase === 'okuma') {
    const status = phase === 'okuma' ? null : cam.error ? 'Kamera açılamadı.' : count != null ? `Yüzünü görüyorum, ${count} saniye sonra başlıyor` : 'Yüzün görünmüyor. Telefonu yüzüne dönük tut, görünce başlar.'
    const tone = cam.error || (phase === 'hazir' && count == null) ? ' warn' : ''
    const page = lit >= 0 ? pageOf(lit) : phase === 'okuma' && t0.current && performance.now() > t0.current ? pages.length - 1 : 0
    const to = pages[page + 1]?.from ?? words.length
    return (
      <main className="og read">
        <div className="og-bar">
          <button type="button" className="og-ib" onClick={stop} aria-label="Durdur"><X size={20} aria-hidden="true" /></button>
          <span className="og-mid">{wpm} kelime/dk{pages.length > 1 ? ` · Sayfa ${page + 1}/${pages.length}` : ''}</span>
          <span className="og-gap" />
        </div>
        <p className={`og-status${status ? tone : ' off'}`} role="status"><Eye size={16} strokeWidth={2.2} aria-hidden="true" /><span>{status ?? ' '}</span></p>
        <div className="og-text" ref={boxRef} style={{ fontSize: `${font}px` }}>
          <div className="og-in" style={{ transform: `translateY(${-pages[page].top}px)` }}>
            {words.map((w, i) => (
              <span key={i} className={i < pages[page].from || i >= to ? 'og-off' : undefined}><span className={`og-w${i === lit ? ' on' : ''}${lit > i ? ' past' : ''}`}>{w}</span>{i < words.length - 1 ? (/^\d+$/.test(w) ? '\u00a0' : ' ') : ''}</span>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (phase === 'soru') {
    const close = <button type="button" className="oa-ib" onClick={stop} aria-label="Kapat"><X size={20} aria-hidden="true" /></button>
    return <OkuSoru key={`q${qi}`} q={questions[qi]} qi={qi} total={questions.length} answers={answers} onChoose={choose} onNext={nextQ} close={close} />
  }

  // ---------- Sonuç ----------
  const r = result
  const k = answers.filter((a) => a?.correct).length
  const verdict = !r?.ok ? 'Yüzün yeterince görülmedi.' : r.pass ? 'Gözün satırları izledi.' : 'Satır dönüşleri yakalanamadı.'
  return (
    <main className="og">
      <div className="og-bar"><button type="button" className="og-ib" onClick={onExit} aria-label="Kapat"><X size={20} aria-hidden="true" /></button><span className="og-mid">{wpm} kelime/dk</span><span className="og-gap" /></div>
      <div className="og-body res">
        <div className="og-kick">Satır dönüşü</div>
        <div className="og-big"><b>{r?.matched ?? 0}</b><span>/{r?.expected ?? 0}</span><em className={r?.pass ? 'ok' : 'no'}>{pct(r?.rate)}</em></div>
        <p className="og-verdict">{verdict}</p>
        <p className="og-anla"><b>Anlama</b><span>{k === 4 ? '4 sorunun hepsi doğru' : `4 sorunun ${k}’${EK[k]} doğru`}</span></p>
        {r?.ok ? <Chart r={r} /> : null}
        {/* Teknik sayılar kapalı bölümde (5 sn kapısı tur 1: ana ekranda anlamsız geliyordu) */}
        <details className="og-more">
          <summary>Ayrıntılar<ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" /></summary>
          <p className="og-small top">Ölçüt: dönüşlerin en az {pct(PASS_RATE)}'i yanan satırla yarım saniye içinde.</p>
          <dl className="og-stats">
            <div><dt>Yanan kelimeyle uyum</dt><dd>{Number.isFinite(r?.r) ? pct(r.r) : '—'}</dd></div>
            <div><dt>Yüzün görüldü</dt><dd>{pct(r?.trackedShare)}</dd></div>
            <div><dt>Gözün gecikmesi</dt><dd>{Number.isFinite(r?.lagMs) ? `${Math.round(r.lagMs)} ms` : '—'}</dd></div>
            <div><dt>Ölçülen</dt><dd>{r?.signal === 'scrX' ? 'Ekrandaki bakış noktası' : r?.signal === 'camX' ? 'Bakış açısı' : '—'}</dd></div>
          </dl>
        </details>
      </div>
      <div className="og-foot">
        {note ? <p className="og-small center" role="status">{note}</p> : null}
        <button type="button" className="btn" onClick={start}>Yeniden dene</button>
        <button type="button" className="og-link" onClick={share}>Ham veriyi paylaş</button>
      </div>
    </main>
  )
}

// Gözün yatay hareketi (koyu) ve yanan kelimenin yeri (açık), zaman içinde; dikey çizgiler beklenen satır dönüşleri,
// noktalar yanan satırla eşleşen dönüşler (eşleşmeyenler ham veride). İki dizi kendi ortalamasına göre aynı ölçekte (birimler farklı olabilir: mm, derece).
function Chart({ r }) {
  const W = 320, H = 120
  const pts = r.series
  if (pts.length < 2) return null
  const tA = pts[0].t, tB = pts[pts.length - 1].t
  const tg = r.target.filter((p) => p.v != null)
  const norm = (arr) => {
    const vs = arr.map((p) => p.v)
    const lo = Math.min(...vs), hi = Math.max(...vs)
    return (v) => (hi > lo ? H - 8 - ((v - lo) / (hi - lo)) * (H - 16) : H / 2)
  }
  const ny = norm(pts), nt = tg.length ? norm(tg) : () => H / 2
  const x = (t) => ((t - tA) / (tB - tA || 1)) * W
  const path = (arr, f) => arr.map((p, k) => `${k ? 'L' : 'M'}${x(p.t).toFixed(1)},${f(p.v).toFixed(1)}`).join('')
  return (
    <figure className="og-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Satır dönüşleri: ${r.expected} dönüşün ${r.matched}'i yakalandı`}>
        {r.expectedTimes.map((t, k) => <line key={k} x1={x(t)} x2={x(t)} y1="0" y2={H} className="exp" />)}
        {tg.length ? <path d={path(tg, nt)} className="tgt" /> : null}
        <path d={path(pts, ny)} className="eye" />
        {r.pairs.map((p, k) => <circle key={k} cx={x(p.f)} cy={H - 4} r="3" className="hit" />)}
      </svg>
      <figcaption>
        <span className="it"><span className="k eye" />Göz</span>
        <span className="it"><span className="k tgt" />Yanan kelime</span>
        <span className="it"><span className="k exp" />Satır sonu</span>
        <span className="it"><span className="k dot" />Yakalanan dönüş</span>
      </figcaption>
    </figure>
  )
}
