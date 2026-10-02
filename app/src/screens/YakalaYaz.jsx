// Yakala Yaz: giriş → 20 deneme → sonuç (kelime-hafiza/PLAN.md §1, §5; maket/maket.html; kapi/5sn-tur2.md 13 madde).
// Görünür her cümle kelime-hafiza/METINLER.md'den harfi harfine (sonuç ekranının yeni iki cümlesi kapi/metin-*.md).
// Bir deneme: 600 ms nokta → kelimeler D ms (requestAnimationFrame kare sayımı; gerçekleşen süre shownMs) → 150 ms örtü
// → "Ne gördün?" → cevap (klavye tur boyunca açık) → 900 ms geri bildirim. Gösterimi 1 kareden çok sapan deneme ölçüye
// girmez, merdiveni oynatmaz, yeni çiftle tekrarlanır. Kelime gösterilirken ekran okuyucu kelimeyi okumaz.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { X, Mic, Square, Smartphone, Keyboard } from 'lucide-react'
import { pickPairs } from '../lib/yakalaYazWords.js'
import { MS, STEPS, msOf, nextStep, startStepOf, checkAnswer, markTyped, makeRecord, isBadShow, seriesOf, ROUND_TRIALS, DOT_MS, MASK_MS, FEEDBACK_MS, isYakala } from '../lib/yakalaYaz.js'
import { metricStatusV2 } from '../lib/progress.js'
import { changeText, verdictWord } from '../lib/changeText.js'
import { haptic } from '../lib/native.js'
import { createListener } from '../lib/yakalaMic.js'
import '../styles/yakalayaz.css'

export const V2 = { familiar: 2, sdFloor: 15 } // manifestle aynı (Gelişim aynı hükmü kurar)
const NEED_DAYS = 8 // ölçü kuralı v2: 2 alışma + 6 başlangıç günü
const EK = { 1: 'i', 2: 'si', 3: 'ü', 4: 'ü', 5: 'i', 6: 'sı', 7: 'si', 8: 'i', 9: 'u', 0: 'ı' }
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

// Görünür alan yüksekliği (klavye açıkken): düzen klavyenin üstünde kalır
function useViewportHeight() {
  const [h, setH] = useState(() => globalThis.visualViewport?.height ?? globalThis.innerHeight ?? 800)
  useEffect(() => {
    const vv = globalThis.visualViewport
    if (!vv) return undefined
    const on = () => setH(vv.height)
    vv.addEventListener('resize', on)
    return () => vv.removeEventListener('resize', on)
  }, [])
  return h
}

// lost: yanlışta bırakılan basamaklar (yeni basamaktan sonra, eskisine dek) işaretli; düşüş görünür (kör kapı, sahip 2026-10-02)
function Track({ cur, start = 0, lost = 0, lo = 6, hi = 18 }) {
  return (
    <div className="yy-track" aria-hidden="true">
      <div className="bars">
        {Array.from({ length: STEPS }, (_, k) => {
          const i = k + 1
          return <i key={i} className={[i < cur ? 'on' : '', i === cur ? 'cur' : '', i === start ? 'start' : '', i > cur && i <= lost ? 'lost' : ''].join(' ')} style={{ height: lo + ((hi - lo) * k) / (STEPS - 1) }} />
        })}
      </div>
      <div className="ends"><span>Yavaş · 500 ms</span><span>50 ms · Hızlı</span></div>
    </div>
  )
}

// Son 7 turun eşikleri (ms): hızlı tur yukarıda (sahip kararı 2026-10-02, kapı madde 9 değişti); kesikli çizgi başlangıç
function Points({ values, baseline }) {
  const all = [...values, ...(Number.isFinite(baseline) ? [baseline] : [])]
  const lo = Math.min(...all), hi = Math.max(...all)
  const span = Math.max(30, hi - lo)
  // yüzde koordinat: x %8–92 (eksen ayrı sütunda), y %22–72 (ms yazısı noktanın üstünde ya da
  // altında; 320'de de kesilmez); küçük ms (hızlı) yukarıda
  const y = (v) => 22 + ((v - lo) / span) * 50
  const x = (i) => (values.length === 1 ? 50 : 8 + (i * 84) / (values.length - 1))
  return (
    <div className="yy-pts" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {Number.isFinite(baseline) ? <line x1="0" x2="100" y1={y(baseline)} y2={y(baseline)} className="base" /> : null}
        {values.length > 1 ? <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} className="ln" /> : null}
      </svg>
      {values.map((v, i) => <i key={i} className={i === values.length - 1 ? 't' : ''} style={{ left: `${x(i)}%`, top: `${y(v)}%` }} />)}
      {/* ms yazısı çizginin gitmediği yanda: sonraki nokta (sonuncuda önceki) üstteyse yazı noktanın altında */}
      {values.map((v, i) => {
        const nb = values[i + 1] ?? values[i - 1]
        const below = i < values.length - 1 ? y(nb) < y(v) : nb !== undefined && y(nb) < y(v)
        return <b key={`v${i}`} className={[i === values.length - 1 ? 't' : '', below ? 'below' : ''].join(' ')} style={{ left: `${x(i)}%`, top: `${y(v)}%` }}>{v}</b>
      })}
    </div>
  )
}

// mic: yalnız telefon cihaz içi çalışabiliyorsa ve kişi kapatmadıysa verilir (view.jsx): { ask, setPref(v), request(),
// start(onResult) } — ask: ilk dokunuşta izin sayfası (METINLER İ1–İ5). Yoksa mikrofon düğmesi hiç yok.
export default function YakalaYaz({ sessions = [], onSave, onExit, remindField = null, now: nowProp = null, mic = null }) {
  const now = useMemo(() => nowProp ?? new Date(), [nowProp])
  const start = useMemo(() => startStepOf(sessions, now), [sessions, now])
  const pairs = useMemo(() => pickPairs({ seed: 'yakala-yaz', sessions, now }), [sessions, now])
  const vh = useViewportHeight()
  const [phase, setPhase] = useState('giris') // giris | run | sonuc
  const [sub, setSub] = useState('dot') // dot | show | mask | ask | fb
  const [step, setStep] = useState(start)
  const [pi, setPi] = useState(0)
  const [good, setGood] = useState(0)
  const [fb, setFb] = useState(null) // { ok, kind, words, typed, clamped, prevStep }
  const [value, setValue] = useState('')
  const [record, setRecord] = useState(null)
  const trials = useRef([])
  const show = useRef({ shownMs: null, hz: 60 })
  const wordsRef = useRef(null)
  const maskRef = useRef(null)
  const inputRef = useRef(null)
  const t0 = useRef(0)
  const timers = useRef([])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  // Mikrofon (PLAN §6): dinleme iki kelime ya da 4 sn sessizlikte biter; metin alana yazılır, gönderme kişide
  const [micGone, setMicGone] = useState(false) // "Hayır", iOS izni yok ya da cihaz içi başlamadı: bu turda klavye
  const [sheet, setSheet] = useState(false)
  const [listening, setListening] = useState(false)
  const [unheard, setUnheard] = useState(false) // D11
  const [heard, setHeard] = useState(false) // sesle iki kelime geldi: "Gerekirse düzelt, sonra Gönder'e bas." 
  const listenRef = useRef(null)
  const voice = useRef(false)
  const micReady = Boolean(mic) && !micGone
  const stopListen = () => { listenRef.current?.stop(); listenRef.current = null }
  useEffect(() => () => { timers.current.forEach(clearTimeout); listenRef.current?.stop() }, [])
  const listen = () => {
    if (listenRef.current) { stopListen(); return }
    setUnheard(false)
    setHeard(false)
    setListening(true)
    listenRef.current = createListener({
      start: mic.start,
      onText: (t) => { voice.current = true; setValue(t) },
      onDone: ({ heard, failed }) => {
        listenRef.current = null
        setListening(false)
        if (failed) { setMicGone(true); inputRef.current?.focus() } else if (!heard) setUnheard(true)
        else setHeard(true)
      },
    })
  }
  const onMicTap = () => (mic?.ask ? setSheet(true) : listen())
  const allowMic = async () => {
    const ok = await mic.request()
    mic.setPref(ok ? 'on' : 'off')
    setSheet(false)
    if (ok) listen()
    else { setMicGone(true); inputRef.current?.focus() }
  }
  const denyMic = () => {
    mic.setPref('off')
    setSheet(false)
    setMicGone(true)
    inputRef.current?.focus()
  }

  const pair = pairs[pi] ?? pairs[pairs.length - 1]

  // Bir denemenin gösterimi: nokta sırasında kare süresi ölçülür, sonra kelimeler tam kare sayısı kadar görünür
  useLayoutEffect(() => {
    if (phase !== 'run' || sub !== 'dot') return undefined
    let raf = 0, last = null
    const deltas = []
    const measure = (ts) => {
      if (last != null) deltas.push(ts - last)
      last = ts
      raf = requestAnimationFrame(measure)
    }
    raf = requestAnimationFrame(measure)
    const id = setTimeout(() => {
      cancelAnimationFrame(raf)
      const d = deltas.sort((a, b) => a - b)[deltas.length >> 1] ?? 1000 / 60
      const hz = d < 10 ? 120 : 60 // VARSAYIM: iPhone ekranları 60 ya da 120 Hz
      show.current.hz = hz
      const ms = msOf(step)
      const frames = Math.max(1, Math.round(ms / (1000 / hz)))
      let n = 0, tStart = 0
      setSub('show')
      const tick = (ts) => {
        if (n === 0) {
          tStart = ts
          if (wordsRef.current) wordsRef.current.style.visibility = 'visible'
        } else if (n === frames) {
          if (wordsRef.current) wordsRef.current.style.visibility = 'hidden'
          if (maskRef.current) maskRef.current.style.visibility = 'visible'
          show.current.shownMs = ts - tStart
          setSub('mask')
          later(() => {
            if (maskRef.current) maskRef.current.style.visibility = 'hidden'
            setSub('ask')
          }, MASK_MS)
          return
        }
        n++
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, DOT_MS)
    return () => { cancelAnimationFrame(raf); clearTimeout(id) }
  }, [phase, sub, pi]) // eslint-disable-line react-hooks/exhaustive-deps

  const begin = () => {
    t0.current = Date.now()
    trials.current = []
    setPhase('run')
    setSub('dot')
    inputRef.current?.focus() // kullanıcı dokunuşunda: iOS klavyesi açılır ve tur boyunca açık kalır
  }
  const finish = (list) => {
    const rec = makeRecord({ trials: list, startStep: start, hz: show.current.hz, seconds: (Date.now() - t0.current) / 1000, now: new Date() })
    if (rec) onSave?.(rec)
    setRecord(rec)
    setPhase('sonuc')
    inputRef.current?.blur()
  }
  const exit = () => {
    const done = trials.current.filter((t) => !t.bad).length
    if (phase === 'run' && done >= 10) finish(trials.current)
    else onExit?.()
  }

  const submit = (e) => {
    e?.preventDefault?.()
    if (phase !== 'run' || sub !== 'ask') return
    const ms = msOf(step)
    const typed = value
    const mode = voice.current ? 'voice' : 'key'
    stopListen()
    voice.current = false
    setUnheard(false)
    setHeard(false)
    if (isBadShow(ms, show.current.shownMs, show.current.hz)) {
      trials.current.push({ w: pair, step, ms, shownMs: show.current.shownMs ?? 0, ok: false, bad: true, mode })
      setValue('')
      setPi((x) => x + 1)
      setSub('dot')
      return
    }
    const res = checkAnswer(typed, pair)
    const ns = nextStep(step, res.ok)
    trials.current.push({ w: pair, step, ms, shownMs: show.current.shownMs, ok: res.ok, part: res.part, mode, typed })
    if (res.ok) haptic('tick')
    setFb({ ok: res.ok, kind: res.kind, words: pair, typed, clamped: !res.ok && ns === 1 && step - 3 < 1, top: res.ok && step === STEPS, prevStep: step, newStep: ns })
    setValue('')
    setSub('fb')
    const n = good + 1
    setGood(n)
    later(() => {
      setStep(ns)
      setFb(null)
      if (n >= ROUND_TRIALS) finish(trials.current)
      else { setPi((x) => x + 1); setSub('dot') }
    }, FEEDBACK_MS)
  }

  // ---------- Giriş ----------
  if (phase === 'giris') {
    return (
      <main className="yy yy-giris" style={{ height: vh }}>
        <div className="yy-top"><button type="button" className="yy-x" onClick={onExit} aria-label="Kapat"><X size={16} strokeWidth={2.2} aria-hidden="true" /></button><span className="sp" /><span className="cnt">2 dk</span></div>
        <div className="yy-ey">Yakala Yaz</div>
        <h1 className="yy-h1">İki kelime, <br />bir an.</h1>
        <p className="yy-lead">{micReady ? 'Ekranda iki kelime kısa süre görünür. Aklında tut, sonra yaz ya da söyle.' : 'Ekranda iki kelime kısa süre görünür. Aklında tut, sonra yaz.'}</p>
        <div className="yy-stage prev">
          <div className="shead"><span className="pill">Bugün {start}. basamaktan · {MS[start - 1]} ms</span></div>
          <div className="win" aria-hidden="true"><span className="w">lale</span><span className="w">vapur</span></div>
          <Track cur={start} start={start} hi={22} />
        </div>
        <div className="yy-lg">
          <div><b className="up">+1</b>Her doğru cevapta bir basamak hızlanır.</div>
          <div><b className="dn">−3</b>Yanlışta üç basamak yavaşlar.</div>
        </div>
        <span className="sp" />
        <p className="yy-small">Burada kısa süre görüneni yakalamayı çalışırsın. Okuma hızına etkisi araştırmalarda gösterilmedi.</p>
        <button type="button" className="yy-btn" onClick={begin}>Başla</button>
        {/* Klavyenin ilk dokunuşta açılması için alan baştan var (gizli) */}
        <input ref={inputRef} className="yy-ghost" aria-hidden="true" tabIndex={-1} value={value} onChange={(e) => setValue(e.target.value)} {...INPUT} />
      </main>
    )
  }

  // ---------- Sonuç ----------
  if (phase === 'sonuc') {
    // HATA_GUNLUGU Build 29 (Dalga): kayıttan sonra sessions kaydı zaten içerebilir; tür ve tarihle bir kez sayılır
    const all = record ? [...sessions.filter((s) => !(s?.type === record.type && s?.date === record.date)), record] : sessions
    const series = seriesOf(all)
    const v = series.length ? metricStatusV2(series, { better: 'down', now: new Date(), ...V2 }) : null
    const last7 = series.slice(-7).map((p) => p.value)
    const good20 = record ? record.trials.filter((t) => !t.bad) : []
    const k = good20.filter((t) => t.ok).length
    const verdict = v?.verdict ?? 'start'
    const chip = verdict === 'start'
      ? `Başlangıç · ${Math.min(NEED_DAYS, v?.measureDays ?? 1)}/${NEED_DAYS} gün`
      : [changeText({ from: v.baseline, to: v.current, unit: 'ms', better: 'down' }).text, verdict === 'worse' ? null : verdictWord(verdict)].filter(Boolean).join(' · ')
    return (
      <main className="yy res" style={{ minHeight: vh }}>
        <div className="yy-top"><button type="button" className="yy-x" onClick={onExit} aria-label="Kapat"><X size={16} strokeWidth={2.2} aria-hidden="true" /></button><span className="sp" /><span className="cnt">{good20.length}/{ROUND_TRIALS}</span></div>
        <div className="yy-resbody">
        <div className="yy-ey">Bugün</div>
        {/* Kavram en çok üç (madde 11): süre, Gelişim hükmü, doğru sayısı. Basamak burada yok: eşik iki basamak arasına
            düşebilir ("125 ms" ile "Basamak 13 = 133 ms" çelişkisi, kapı tur 1) */}
        <div className="yy-big">{record?.thresholdMs ?? '—'}<small>ms</small></div>
        <p className="yy-lead def">{RESULT_LINE}</p>
        <div className="yy-chip"><i />{chip}</div>
        {verdict === 'start' ? <p className="yy-small note">{START_LINE}</p> : null}
        {last7.length >= 2 ? (
          <div className="yy-stage graph">
            {/* METINLER R5 "Son 7 tur": tur sayısı 7'den azken kaç tursa o yazılır (kapı tur 1) */}
            <div className="shead"><span>Son {last7.length} tur</span></div>
            <div className="gwrap">
              <Points values={last7} baseline={verdict === 'start' ? null : v?.baseline} />
              <div className="axis" aria-hidden="true"><span>↑ Hızlı</span><span>↓ Yavaş</span></div>
            </div>
          </div>
        ) : null}
        <div className="yy-rows"><div className="r"><span>Doğru</span><b>{good20.length} denemede {k}</b></div></div>
        {remindField ? <div className="yy-remind">{remindField}</div> : null}
        </div>
        <button type="button" className="yy-btn" onClick={onExit}>Bitti</button>
      </main>
    )
  }

  // ---------- Deneme ----------
  // Geri bildirimde rozet ve merdiven yeni basamağı gösterir (maket: dogru, yanlis)
  const shownStep = fb ? fb.newStep : step
  const showing = sub === 'dot' || sub === 'show' || sub === 'mask'
  const trial = Math.min(ROUND_TRIALS, good + (sub === 'fb' ? 0 : 1))
  return (
    <main className="yy run" style={{ height: vh }}>
      <div className="yy-top">
        <button type="button" className="yy-x" onClick={exit} aria-label="Kapat"><X size={16} strokeWidth={2.2} aria-hidden="true" /></button>
        <div className="yy-bar"><b style={{ width: `${(trial / ROUND_TRIALS) * 100}%` }} /></div>
        <span className="cnt">{trial}/{ROUND_TRIALS}</span>
      </div>
      <div className={`yy-stage grow${fb ? (fb.ok ? ' win-ok' : ' win-no') : ''}`}>
        <div className="shead">
          <span className="pill">Basamak <b>{shownStep}</b> · {MS[shownStep - 1]} ms</span>
          {fb?.ok && !fb.top ? <span className="plus" aria-hidden="true">+1</span> : null}
          {fb && !fb.ok && !fb.clamped ? <span className="plus minus" aria-hidden="true">−3</span> : null}
        </div>
        <div className="win">
          {sub === 'dot' ? <span className="fix" aria-hidden="true" /> : null}
          <span className="words" ref={wordsRef} aria-hidden="true" style={{ visibility: 'hidden' }}>
            <span className="w">{pair[0]}</span><span className="w">{pair[1]}</span>
          </span>
          <span className="mask" ref={maskRef} aria-hidden="true" style={{ visibility: 'hidden' }}>
            <i style={{ width: `${pair[0].length * 0.62}em` }} /><i style={{ width: `${pair[1].length * 0.62}em` }} />
          </span>
          {sub === 'ask' ? <div className="q" role="status">Ne gördün?<small>{listening ? (value.trim() ? 'İkinci kelimeyi söyle.' : 'İki kelimeyi söyle.') : heard ? "Gerekirse düzelt, sonra Gönder'e bas." : unheard ? 'Duyamadım, yazabilirsin.' : micReady ? "Yaz ve Gönder'e bas, ya da mikrofona söyle." : "Yaz ve Gönder'e bas."}</small></div> : null}
          {fb?.ok ? <span className="words ok" role="status"><span className="w ok">{fb.words[0]}</span><span className="w ok">{fb.words[1]}</span></span> : null}
          {fb && !fb.ok ? (
            <div className="cmp" role="status">
              <div><span>Doğrusu</span><b>{fb.words.join(' ')}</b></div>
              {fb.kind !== 'empty' ? (
                <div className="you"><span>Sen</span><b>{markTyped(fb.typed, fb.words).map((tok, i) => <span key={i}>{i ? ' ' : ''}{tok.map((c, j) => (c.bad ? <em key={j}>{c.ch}</em> : <span key={j}>{c.ch}</span>))}</span>)}</b></div>
              ) : null}
            </div>
          ) : null}
        </div>
        {fb ? <p className={`fb ${fb.ok ? 'ok' : 'no'}`}>{feedbackLine(fb)}</p> : null}
        <Track cur={shownStep} lost={fb && !fb.ok ? fb.prevStep : 0} />
      </div>
      {/* Gösterimde ve geri bildirimde alan ve mikrofon görünmez ama yerinde ve odakta kalır: klavye kapanmaz, ekran
          zıplamaz (sahip kararı 2026-10-02, kapı madde 3 değişti; geri bildirimde boş alan "yeniden yaz" sanılıyordu) */}
      <form className={`yy-input${showing || sub === 'fb' ? ' hide' : ''}`} onSubmit={submit}>
        <span className="fieldwrap">
          <input
            ref={inputRef}
            className={`field${showing ? ' quiet' : ''}`}
            value={value}
            onChange={(e) => { setValue(e.target.value); setUnheard(false); setHeard(false) }}
            placeholder={showing || listening ? '' : 'İki kelimeyi yaz'}
            aria-label="İki kelimeyi yaz"
            {...INPUT}
          />
          {/* Dinlerken alanın içinde, düğmenin hemen yanında (mikrofon kapısı tur 1–2, görev testi tur 1): yerleşime girmez */}
          {listening ? <span className={`live${value ? '' : ' left'}`} role="status"><i aria-hidden="true" />Dinliyorum</span> : null}
        </span>
        {/* Alanın yanında yalnız mikrofon; gönderme klavyenin "Gönder"i (5sn-tur2: tek gönderme yolu) */}
        {micReady ? (
          <button type="button" className={`rb${listening ? ' on' : ''}`} aria-label={listening ? undefined : 'Sesle söyle'} aria-pressed={listening} onPointerDown={(e) => e.preventDefault()} onClick={onMicTap}>
            {listening ? <><Square size={14} strokeWidth={0} fill="currentColor" aria-hidden="true" />Durdur</> : <Mic size={22} strokeWidth={2.2} aria-hidden="true" />}
          </button>
        ) : null}
      </form>
      {/* İzin sayfası (sesizin; METINLER İ1–İ5 harfi harfine; 5 sn kapısı tur 2: 5/5, anlaşılırlık 5/5) */}
      {sheet ? (
        <div className="yy-sheetbg" role="dialog" aria-modal="true" aria-labelledby="yy-sheet-h">
          <div className="yy-sheet">
            <h2 id="yy-sheet-h">Kelimeleri sesle söylemek ister misin?</h2>
            <div className="pts">
              <div><b><Mic size={18} strokeWidth={2} aria-hidden="true" /></b><span>Mikrofon yalnız sen düğmeye basınca açılır; iki kelimeyi söyleyince kapanır.</span></div>
              <div><b><Smartphone size={18} strokeWidth={2} aria-hidden="true" /></b><span>Ses telefonunda yazıya çevrilir. Kaydedilmez, hiçbir yere gönderilmez.</span></div>
              <div><b><Keyboard size={18} strokeWidth={2} aria-hidden="true" /></b><span>İstemezsen klavyeyle devam et. Fikrini Profil'den ya da iPhone Ayarlar'dan değiştirebilirsin.</span></div>
            </div>
            <button type="button" className="yy-btn" onClick={allowMic}>Mikrofonu aç</button>
            <button type="button" className="yy-btn ghost" onClick={denyMic}>Hayır, klavyeyle devam</button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

// Alan: öneri ve otomatik düzeltme kapalı; gönderme yalnız klavyenin "Gönder" tuşuyla
const INPUT = { type: 'text', autoComplete: 'off', autoCorrect: 'off', autoCapitalize: 'off', spellCheck: false, enterKeyHint: 'send', inputMode: 'text' }

// Geri bildirim satırı (METINLER D5, D7–D10, D12)
export function feedbackLine(fb) {
  if (fb.ok) return fb.top ? 'En hızlı basamaktasın.' : 'Doğru! Bir basamak hızlandın.'
  if (fb.clamped) return 'En yavaş basamaktasın.'
  // "yavaşladın": doğrudaki "hızlandın" ile aynı hitap (kapı tur 6, beş kişiden dördü; sahip yetkisi 2026-10-02)
  return { near: 'Bir harf farklı · üç basamak yavaşladın', one: 'Biri doğru · üç basamak yavaşladın', none: 'İkisi de farklı · üç basamak yavaşladın', empty: 'Boş geçtin · üç basamak yavaşladın' }[fb.kind]
}

// Sonuç ekranının yeni iki cümlesi (kapi/5sn-tur2.md madde 7, 8): metin kapısı kelime-hafiza/kapi/metin-sonuc.md
// (T1a 5/5, T2c 4/5); sahip onayı 2026-10-02, sahip kararı devretti ("sen onayla")
// Merdiven (+1 / −3) dört denemeden üçünün doğru olduğu süreye yerleşir; büyük sayı son 10 denemenin ortancası (kapı tur 6:
// eski "Denemelerin çoğunda … bu sürede doğru" ölçüyü yanlış anlatıyordu)
export const RESULT_LINE = 'Bu sürede iki kelimeyi yaklaşık dört denemeden üçünde yakalıyorsun.'
export const START_LINE = "İlk 8 günde başlangıcın ölçülüyor; sonra değişimi Gelişim'de görürsün."
export { isYakala }
