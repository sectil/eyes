// Oku ve Anla: giriş → okuma → dört soru → sonuç (okuma-anlama/PLAN.md §3; maket/maket.html birebir).
// Görünür her cümle okuma-anlama/METINLER.md §5 ya da sahip onaylı maketten harfi harfine.
//  - Süre metnin ilk çizildiği karede başlar, "Bitirdim"de durur; ekranda saat yok.
//  - Sorularda metin görünmez, geri dönüş yok.
//  - Okurken uygulama arka plana geçerse soru sorulmaz, okuma sayılmaz (ara); metin ertesi gün yine gelir.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronDown, ChevronRight, Check, BookOpen, Bug, Bird, PawPrint, Fish, Leaf, User, Microscope, Turtle } from 'lucide-react'
import { TAGS, wordCount, pubmedUrl } from '../lib/okumaBank.js'
import { todayText, questionSet } from '../lib/okumaSelect.js'
import { makeRecord, speedSeries } from '../lib/okumaMeasure.js'
import { metricStatusV2 } from '../lib/progress.js'
import { verdictWord } from '../lib/changeText.js'
import { dayKey } from '../lib/calendar.js'
import { SEED_KEY } from '../modules/okuma-anlama/manifest.js'
import '../styles/okuma.css'

const TAG_ICON = { bocek: Bug, kus: Bird, memeli: PawPrint, deniz: Fish, bitki: Leaf, insan: User, mikro: Microscope, surungen: Turtle }
const BASE_N = 5 // 2 alışma + 3 başlangıç okuma günü (manifest V2)

// Kişiye özgü tohum: ilk açılışta rastgele, telefonda kalır (VARSAYIM: kurulum kimliği yok; PLAN §4.1)
function seedOf(storage) {
  try {
    let s = storage?.getItem(SEED_KEY)
    if (!s) {
      s = Math.random().toString(36).slice(2, 12)
      storage?.setItem(SEED_KEY, s)
    }
    return s
  } catch {
    return 'oa'
  }
}
const fontScaleNow = () => {
  try {
    return Math.round((parseFloat(getComputedStyle(document.documentElement).fontSize) / 16) * 100) / 100 || 1
  } catch {
    return 1
  }
}
// "4 sorunun 3’ü doğru": Türkçe iyelik eki (1’i, 2’si, 3’ü, 4’ü)
const EK = { 0: 'ı', 1: 'i', 2: 'si', 3: 'ü', 4: 'ü' }
const EK5 = { ...EK, 5: 'i' }
// Kaynak satırı: "Mampe ve ark., 2009" yerine Türkçe "Mampe ve ekibi, 2009"; dergi adı gösterilmez (kapı 2026-10-02)
const sourceOf = (t) => `${String(t.yazar).replace(/ ve ark\.?$/, ' ve ekibi')}, ${t.yil}`

// Kelimelerden iris (maket iris()): her halka iki yay; yazı hiçbir yerde baş aşağı değil. Süs, ekran okuyucuya kapalı.
const RINGS = [
  [128, 'yıldızlarla yol bulan böcek · kedi adını tanır mı', 'heceleyen yarasa yavruları · atlar yüz okur', 11.5, 0.95],
  [106, 'bekleyebilen mürekkep balığı · sözcük tanıyan güvercinler', 'keçiler gülen yüzü seçiyor · yunusun ıslığı', 10.5, 0.82],
  [86, 'insan yüzü ayırt eden balık · yaprakla saran orangutan', 'oku · anla · oku · anla · oku · anla', 10.5, 0.7],
  [68, 'oku · anla · oku · anla · oku', 'anla · oku · anla · oku · anla', 10.5, 0.6],
]
// Kısa ekran (iPhone SE): aynı cümlelerden iki halka, büyük yazı (160 px çizimde ≥ 9,5 px)
const RINGS_SE = [
  [118, 'yıldızlarla yol bulan böcek', 'heceleyen yarasa yavruları', 19, 0.95],
  [86, 'oku · anla · oku · anla', 'anla · oku · anla · oku', 18, 0.75],
]
function Iris({ rings = RINGS, id = 'f', className = '' }) {
  // Halkasız (rings boş): yalnız göz bebeği ve kitap; dönen küçük yazılar girişte bilmece gibi duruyordu (kapı 2026-10-02)
  const vb = rings.length ? '0 0 300 300' : '86 86 128 128'
  return (
    <svg viewBox={vb} aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`oa-g${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--iris-1)" /><stop offset="1" stopColor="var(--iris-2)" /></linearGradient>
        <radialGradient id={`oa-gl${id}`}><stop offset="0" stopColor="var(--iris-1)" stopOpacity=".22" /><stop offset="1" stopColor="var(--iris-1)" stopOpacity="0" /></radialGradient>
        {rings.map(([r, , , fs], i) => {
          const rb = r + fs * 0.72
          return [
            <path key={`t${i}`} id={`oa-${id}t${i}`} d={`M${150 - r},150 A${r},${r} 0 0,1 ${150 + r},150`} />,
            <path key={`b${i}`} id={`oa-${id}b${i}`} d={`M${150 - rb},150 A${rb},${rb} 0 0,0 ${150 + rb},150`} />,
          ]
        })}
      </defs>
      <circle cx="150" cy="150" r="150" fill={`url(#oa-gl${id})`} />
      {rings.map(([r, top, bot, fs, op], i) => {
        const rb = r + fs * 0.72
        return [
          <text key={`tt${i}`} fontSize={fs} fill={`url(#oa-g${id})`} opacity={op} textAnchor="middle"><textPath href={`#oa-${id}t${i}`} startOffset="50%" textLength={(Math.PI * r * 0.94).toFixed(0)} lengthAdjust="spacing">{top}</textPath></text>,
          <text key={`tb${i}`} fontSize={fs} fill={`url(#oa-g${id})`} opacity={op} textAnchor="middle"><textPath href={`#oa-${id}b${i}`} startOffset="50%" textLength={(Math.PI * rb * 0.94).toFixed(0)} lengthAdjust="spacing">{bot}</textPath></text>,
        ]
      })}
 <circle cx="150" cy="150" r="50" fill="var(--oa-pupil)" />
      <circle cx="150" cy="128" r="9" fill={`url(#oa-g${id})`} />
      <g transform="translate(150 158)" fill="none" stroke={`url(#oa-g${id})`} strokeWidth="2.4" strokeLinecap="round">
        <path d="M-22 -10 q11 -6 22 0 q11 -6 22 0 v22 q-11 -6 -22 0 q-11 -6 -22 0z" />
        <path d="M0 -10 v22" />
      </g>
    </svg>
  )
}

// Soru halkası: cevaplanan dolu, şu anki soluk, bekleyen gri; ortada "2/4"
function QRing({ done, cur }) {
  const r = 46, c = 2 * Math.PI * r, gap = 16, seg = c / 4 - gap
  return (
    <svg className="qr" viewBox="0 0 120 120" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={i <= cur ? 'var(--accent)' : 'var(--oa-track)'} strokeOpacity={i === cur && i >= done ? 0.42 : 1} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${seg.toFixed(1)} ${(c - seg).toFixed(1)}`} strokeDashoffset={(-(i * c / 4) - gap / 2).toFixed(1)} transform="rotate(-90 60 60)" />
      ))}
      <text x="60" y="61" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display)" fontWeight="650" fill="var(--ink)">
        <tspan fontSize="32">{cur + 1}</tspan><tspan fontSize="20" fill="var(--ink-3)" dx="1">/4</tspan>
      </text>
    </svg>
  )
}

// Sonuç halkası: dört soru; doğru sayısı kadar parça saat yönünde dolar, her parçada ✓ ya da ✕
function ResultRing({ k }) {
  const r = 112, c = 2 * Math.PI * r, gap = 30, seg = c / 4 - gap
  return (
    <svg viewBox="0 0 264 264" aria-hidden="true">
      <defs><linearGradient id="oa-g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--iris-1)" /><stop offset="1" stopColor="var(--iris-2)" /></linearGradient></defs>
      {[0, 1, 2, 3].map((i) => {
        const on = i < k
        const a = ((-90 + i * 90 + 45) * Math.PI) / 180, x = 132 + r * Math.cos(a), y = 132 + r * Math.sin(a)
        return (
          <g key={i}>
            <circle cx="132" cy="132" r={r} fill="none" stroke={on ? 'url(#oa-g2)' : 'var(--oa-wrong)'} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${seg.toFixed(1)} ${(c - seg).toFixed(1)}`} strokeDashoffset={(-(i * c / 4) - gap / 2).toFixed(1)} transform="rotate(-90 132 132)" />
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="13" fill={on ? 'var(--iris-1)' : 'var(--oa-wrong)'} stroke="var(--bg)" strokeWidth="3" />
            {on
              ? <path d={`M${(x - 5).toFixed(1)} ${(y + 0.5).toFixed(1)} l3.5 3.5 l6.5 -7`} fill="none" stroke="var(--bg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              : <path d={`M${(x - 4).toFixed(1)} ${(y - 4).toFixed(1)} l8 8 M${(x + 4).toFixed(1)} ${(y - 4).toFixed(1)} l-8 8`} stroke="var(--bg)" strokeWidth="2.6" strokeLinecap="round" />}
          </g>
        )
      })}
      <circle cx="132" cy="132" r="88" fill="var(--surface)" stroke="var(--border)" />
    </svg>
  )
}

const VERDICT_LINE = {
  null: 'Metni anladın; hızın kaydedildi.',
  // Sahip onaylı sayılmadı ekranının cümlesi (maket, "OK ONAYLIYORUM"): üstteki "Hız sayılmadı" etiketini tekrarlamaz (tur 1)
  'dusuk-anlama': 'Hızın kaydedilmesi için en az üç soruyu bilmelisin. Bir\u00a0dahakine biraz daha yavaş oku.',
  'cok-hizli': 'Bu hızda metin okunmaz, yalnız göz gezdirilir; bu yüzden hız kaydedilmedi. Bir dahakine her cümleyi oku.',
  ara: 'Okurken uygulamadan çıktın; bu yüzden hız kaydedilmedi.',
  // Sahip onayı 2026-10-02 (kapi/metin-tur1.md Y3, 5/5)
  'cok-yavas': 'Okuma çok uzun sürdü. Hız, ara vermeden okuyunca kaydedilir.',
}

export default function OkuAnla({ sessions = [], storage = globalThis.localStorage, onSave, onExit, remindField = null, now: nowProp = null }) {
  const seed = useMemo(() => seedOf(storage), [storage])
  const [{ text, cycle }] = useState(() => todayText({ seed, sessions }))
  const questions = useMemo(() => questionSet(text, cycle), [text, cycle])
  const words = wordCount(text.metin)
  const [phase, setPhase] = useState('giris')
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState([]) // [{ id, chosen, correct }]
  const [record, setRecord] = useState(null)
  const [atEnd, setAtEnd] = useState(false)
  const t0 = useRef(null)
  const ms = useRef(0)
  const hidden = useRef(false)
  const endRef = useRef(null)

  // Okuma: süre metnin ilk çizildiği karede başlar
  useLayoutEffect(() => {
    if (phase !== 'metin') return undefined
    window.scrollTo?.(0, 0)
    const id = requestAnimationFrame(() => { t0.current = performance.now() })
    const vis = () => { if (document.visibilityState === 'hidden') hidden.current = true }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(id); document.removeEventListener('visibilitychange', vis) }
  }, [phase])
  // "“Bitirdim” düğmesi metnin sonunda" ipucu: düğme görünene dek
  useEffect(() => {
    if (phase !== 'metin' || !endRef.current || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { threshold: 0.6 })
    io.observe(endRef.current)
    return () => io.disconnect()
  }, [phase])

  const finish = (list) => {
    const correct = list ? list.filter((a) => a.correct).length : null
    const rec = makeRecord({
      text, cycle, ms: ms.current, correct, qIds: list ? list.map((a) => a.id) : [], hidden: hidden.current,
      fontScale: fontScaleNow(), now: nowProp ?? new Date(),
    })
    setRecord(rec)
    onSave?.(rec)
    setPhase('sonuc')
    window.scrollTo?.(0, 0)
  }
  const readDone = () => {
    ms.current = t0.current == null ? 0 : performance.now() - t0.current
    if (hidden.current) finish(null)
    else { setPhase('soru'); window.scrollTo?.(0, 0) }
  }
  const choose = (opt) => {
    if (answers[qi]) return
    const q = questions[qi]
    const next = [...answers]
    next[qi] = { id: q.id, chosen: opt.text, correct: opt.correct }
    setAnswers(next)
  }
  const nextQ = () => {
    if (qi + 1 < questions.length) setQi(qi + 1)
    else finish(answers)
  }

  const close = (
    <button type="button" className="oa-ib" onClick={onExit} aria-label="Kapat"><X size={20} aria-hidden="true" /></button>
  )
  const TagIcon = TAG_ICON[text.etiket] ?? BookOpen

  if (phase === 'giris') {
    return (
      <main className="oa">
        <div className="oa-bar"><button type="button" className="oa-ib" onClick={onExit} aria-label="Geri"><ChevronLeft size={20} aria-hidden="true" /></button><span /><span className="oa-gap" /></div>
        <div className="oa-grow">
          <div className="oa-hero"><Iris className="plain" id="p" rings={[]} /></div>
          <h1 className="t">Oku ve Anla</h1>
          {/* Sahip isteği 2026-10-02: girişte ne yapılacağı, sonra ne olacağı ve neyin ölçüldüğü 5 sn'de anlaşılsın */}
          <p className="lead">Kısa bir bilim metni oku; ne kadar hızlı okuduğunu ve ne kadar anladığını gör.</p>
          <ol className="oa-steps v">
            <li><b>1</b><span><strong>Oku</strong><small>Süre, metin açılınca başlar.</small></span></li>
            <li><b>2</b><span><strong>Bitirince “Bitirdim”e bas</strong><small>Süre o anda durur.</small></span></li>
            <li><b>3</b><span><strong>Dört soruyu cevapla</strong><small>En az üçünü bilirsen okuma hızın kaydedilir.</small></span></li>
          </ol>
          <div className="oa-today">
            <span className="ic"><BookOpen size={24} strokeWidth={1.9} aria-hidden="true" /></span>
            <span><small>BUGÜNÜN METNİ</small><strong>{text.baslik}</strong><em>{words} kelime</em></span>
          </div>
        </div>
        <div className="oa-spacer" style={{ height: 118 }} />
        <div className="oa-dock">
          <p className="fair">Hızın, dakikada okuduğun kelimeyle ölçülür.</p>
          <button type="button" className="btn" onClick={() => setPhase('metin')}>Okumaya başla</button>
        </div>
      </main>
    )
  }

  if (phase === 'metin') {
    return (
      <main className="oa" style={{ paddingBottom: 0 }}>
        <div className="oa-bar">{close}<span className="mid">Kendi hızında oku</span><span className="oa-gap" /></div>
        <div className="oa-pad">
          <div className="kick">Bugünün metni</div>
          <h2 className="tt">{text.baslik}</h2>
          <div className="oa-meta">
            <span className="tag"><TagIcon size={15} strokeWidth={2} aria-hidden="true" />{TAGS[text.etiket]}</span>
            <span>{sourceOf(text)}</span>
          </div>
          <p className="read">{text.metin}</p>
          <button type="button" className="btn endbtn" ref={endRef} onClick={readDone}>Bitirdim</button>
          <p className="hint">Basınca süre durur.</p>
        </div>
        <div className={`oa-veil${atEnd ? ' off' : ''}`} aria-hidden="true" />
        <span className={`oa-more${atEnd ? ' off' : ''}`} aria-hidden="true"><ChevronDown size={16} strokeWidth={2.2} /><span>“Bitirdim” düğmesi metnin sonunda</span></span>
      </main>
    )
  }

  if (phase === 'soru') {
    const q = questions[qi]
    const a = answers[qi]
    const last = qi === questions.length - 1
    return (
      <main className="oa" key={`q${qi}`}>
        <div className="oa-bar">{close}<span className="mid" /><span className="oa-gap" /></div>
        <div className="oa-qwrap">
          <div className="oa-qtop">
            <div className="oa-qhead"><QRing done={answers.filter(Boolean).length} cur={qi} /></div>
            <h2 className="q"><span className="oa-sr">{qi + 1}. soru. </span>{q.soru}</h2>
          </div>
          <ul className="oa-opts">
            {q.options.map((o) => {
              const right = a && o.correct
              const miss = a && !o.correct && a.chosen === o.text
              return (
                <li key={o.text}>
                  <button type="button" className={`oa-opt${right ? ' right' : ''}${miss ? ' miss' : ''}`} onClick={() => choose(o)} disabled={Boolean(a)} aria-pressed={a ? a.chosen === o.text : undefined}>
                    <span className="r">{right ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : null}</span>
                    <span className="ot">{o.text}{right ? <small className="okline" role="status">{a.correct ? 'Doğru.' : 'Doğrusu bu.'}</small> : null}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="oa-spacer" style={{ height: 112 }} />
        {a ? <div className="oa-dock"><button type="button" className="btn" onClick={nextQ}>{last ? 'Sonucu gör' : 'Sonraki soru'}</button></div> : null}
      </main>
    )
  }

  // Sonuç
  const r = record
  const k = Number.isFinite(r.correct) ? r.correct : 0
  // HATA_GUNLUGU Build 29 (Dalga): kayıttan sonra sessions kaydı zaten içerebilir; tür ve tarihle bir kez sayılır
  const all = [...sessions.filter((s) => !(s?.type === r.type && s?.date === r.date)), r]
  const days = new Set(speedSeries(all).map((p) => dayKey(new Date(p.date)))).size
  const v2 = days >= BASE_N ? metricStatusV2(speedSeries(all), { better: 'up', now: new Date(r.date), familiar: 2, baseDays: 3, currentDays: 3, sdFloor: 10 }) : null
  const line = VERDICT_LINE[String(r.reason)] ?? (r.reason == null ? VERDICT_LINE.null : null)
  return (
    <main className="oa">
      <div className="oa-bar">{close}<span className="mid">{text.baslik}</span><span className="oa-gap" /></div>
      <div className="oa-body">
      <div className="oa-ring">
        <ResultRing k={k} />
        <div className="c">
          {r.valid
            ? <><span className="n">{r.wpm}</span><span className="u">kelime / dakika</span></>
            : Number.isFinite(r.correct)
              ? <><span className="n off">{r.correct}/4</span><span className="u">doğru</span></>
              : <><span className="n off">—</span></>}
        </div>
      </div>
      <div className="oa-anl">
        {r.valid
          ? <span className="chip ok">{k === 4 ? '4 sorunun hepsi doğru' : `4 sorunun ${k}’${EK[k]} doğru`}</span>
          : <>{Number.isFinite(r.wpm) ? <span className="spd"><b className="num">{r.wpm}</b><span className="un">kelime / dakika</span></span> : null}<span className="chip lo">Hız kaydedilmedi</span></>}
      </div>
      {line ? <div className="oa-verd"><span className="dot" aria-hidden="true" /><p><span className="nm">Nef</span><span className="tx">{line}</span></p></div> : null}
      <div className="oa-rows">
        {v2
          ? <div className="oa-row"><span className="k">Okuma hızı</span><span className="v">{verdictWord(v2.verdict, { cap: true })}</span></div>
          : (
            <div className="oa-row has-pips">
              <span className="k">Başlangıç hızın</span>
              <span className="v">5 okumanın {Math.min(days, BASE_N)}’{EK5[Math.min(days, BASE_N)]} tamam</span>
              <span className="oa-pips" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < days ? 'on' : ''} />)}</span>
            </div>
          )}
        <a className="oa-row" href={pubmedUrl(text.pmid)} target="_blank" rel="noreferrer">
          <span className="k">Kaynak araştırma</span>
          {/* Sahip onaylı sonuç ekranının biçimi (maket: "Dacke ve ark., 2013"); dergi okuma ekranında yazar (tur 2) */}
          <span className="v">{sourceOf(text)}</span>
          <span className="go" aria-hidden="true"><ChevronRight size={18} /></span>
        </a>
      </div>
      {remindField ? <div className="oa-remind">{remindField}</div> : null}
      </div>
      <div className="oa-spacer" />
      <div className="oa-dock scroll"><button type="button" className="btn" onClick={onExit}>Bitti</button></div>
    </main>
  )
}
