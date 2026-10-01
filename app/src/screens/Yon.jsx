import { useEffect, useRef, useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { ProgressBar } from '../components/QuestionFlow.jsx'
import { haptic } from '../lib/native.js'
import {
  AYNA_ITEMS, LIKERT, AYNA_PAIRS, KIND_CHIPS, FACTS, ANSWER_TEXT, MIN_TEXT,
  scoreAyna, distanceState, firstPersonCount, appendChip, makeAynaRecord, makeUzakRecord, makeSefkatRecord,
  saveNote, aynaRecords, aynaDue, isYon,
} from '../lib/yon.js'
import '../styles/yon.css'

// Yön (Artifact "Yön", onaylı): ana ekran → Ayna | Dışarıdan bak | Şefkatle ele al. Yalnız sayılar kaydedilir;
// yazılar yalnız kullanıcı "sakla" derse bu cihazda tutulur; isim hiç kaydedilmez.
const SCENE_MS = 6000
const fmt1 = (v) => v.toFixed(1).replace('.', ',')

function Compass() {
  return (
    <svg className="yn-compass" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#131C26" stroke="rgba(255,255,255,.1)" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(242,182,90,.35)" strokeDasharray="2 4" />
      <path d="M32 12 L38 32 L32 52 L26 32 Z" fill="#F2B65A" opacity=".9" />
      <path d="M32 32 L38 32 L32 52 L26 32 Z" fill="#19C2D1" />
      <circle cx="32" cy="32" r="3" fill="#070C12" />
    </svg>
  )
}

function Scale({ value, onChange, label }) {
  return (
    <>
      <div className="yn-r10" role="radiogroup" aria-label={label}>
        {Array.from({ length: 11 }, (_, v) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => { onChange(v); haptic('tick') }}>{v}</button>
        ))}
      </div>
      <div className="yn-ends"><span>hiç</span><span>çok</span></div>
    </>
  )
}

function Fact({ f, eyebrow = 'Doğru mu, efsane mi?' }) {
  return (
    <section className="yn-card">
      <span className="yn-ey">{eyebrow}</span>
      <p className="h">{f.claim}</p>
      <p>{f.answer !== 'note' && <b className={f.answer === 'fact' ? 'ok' : 'no'}>{ANSWER_TEXT[f.answer]}. </b>}{f.body}</p>
      <span className="yn-src">{f.ref} · doi {f.doi}</span>
    </section>
  )
}

function Keep({ checked, onChange }) {
  return (
    <label className="yn-keep">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      Yazdıklarımı bu telefonda sakla (varsayılan: silinir)
    </label>
  )
}

// Uzaklaşan oda: 6 sn'de yavaşça geri çekilir (yanıp sönme yok)
function Scene({ far, caption }) {
  return (
    <div className={`yn-scene${far ? ' far' : ''}`}>
      <svg viewBox="0 0 300 210" aria-hidden="true">
        <rect x="40" y="40" width="220" height="140" rx="6" fill="#1A2533" stroke="#2C3B4E" />
        <rect x="170" y="56" width="62" height="44" rx="3" fill="#20364A" /><path d="M170 78h62M201 56v44" stroke="#2C3B4E" />
        <rect x="70" y="128" width="110" height="8" rx="2" fill="#5A4632" /><rect x="78" y="136" width="6" height="30" fill="#4A3A2A" /><rect x="166" y="136" width="6" height="30" fill="#4A3A2A" />
        <circle cx="125" cy="98" r="11" fill="#E0B48E" /><path d="M114 94c2-9 20-10 22 0" fill="#3A2A1E" />
        <path d="M110 128c0-14 7-20 15-20s15 6 15 20z" fill="#F2B65A" />
        <rect x="94" y="120" width="22" height="8" rx="2" fill="#CFD8DF" />
      </svg>
      <span className="cap">{caption}</span>
    </div>
  )
}

// onSave(kayıt), onExit()
export default function Yon({ sessions = [], onSave, onExit }) {
  const [phase, setPhase] = useState('hub')
  const [ai, setAi] = useState(0)
  const [answers, setAnswers] = useState({})
  const [aynaResult, setAynaResult] = useState(null)
  const [aynaDate, setAynaDate] = useState(null)
  const [event, setEvent] = useState('')
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [far, setFar] = useState(false)
  const [sceneDone, setSceneDone] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [step, setStep] = useState('')
  const [keep, setKeep] = useState(false)
  const t0 = useRef(0)
  const secs = () => (Date.now() - t0.current) / 1000

  const aynas = aynaRecords(sessions)
  const lastAyna = aynas.at(-1)
  const due = aynaDue(sessions)
  const uzakLast = sessions.filter((s) => isYon(s) && s.tool === 'uzak').at(-1)

  // Sahne: ekrana gelince bir kare sonra uzaklaşmaya başlar
  useEffect(() => {
    if (phase !== 'u1') return undefined
    setFar(false)
    setSceneDone(false)
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setFar(true)))
    const id = setTimeout(() => setSceneDone(true), SCENE_MS)
    return () => { cancelAnimationFrame(raf); clearTimeout(id) }
  }, [phase])

  function start(tool) {
    t0.current = Date.now()
    setText('')
    setEvent('')
    setStep('')
    setKeep(false)
    if (tool === 'ayna') { setAnswers({}); setAi(0); setPhase('ayna') }
    if (tool === 'uzak') { setBefore(null); setAfter(null); setPhase('u0') }
    if (tool === 'sefkat') setPhase('s0')
  }
  function answer(v) {
    const it = AYNA_ITEMS[ai]
    const next = { ...answers, [it.id]: v }
    setAnswers(next)
    haptic('tick')
    if (ai + 1 < AYNA_ITEMS.length) { setTimeout(() => setAi(ai + 1), 220); return }
    const r = scoreAyna(next)
    if (!r) return
    setAynaResult(r)
    const rec = makeAynaRecord(r, secs())
    setAynaDate(rec.date)
    onSave?.(rec)
    setTimeout(() => setPhase('aynaRes'), 220)
  }
  function finishUzak() {
    onSave?.(makeUzakRecord({ before, after, firstPerson: firstPersonCount(text), seconds: secs() }))
    if (keep) saveNote({ tool: 'uzak', event, text })
    haptic('success')
    setPhase('uRes')
  }
  function finishSefkat() {
    onSave?.(makeSefkatRecord({ step: Boolean(step.trim()), seconds: secs() }))
    if (keep) saveNote({ tool: 'sefkat', event, text, step })
    haptic('success')
    setPhase('sRes')
  }

  const top = (v, close = true) => (
    <div className="yn-top">
      {close && <button className="btn-icon" onClick={() => setPhase('hub')} aria-label="Kapat"><X size={20} /></button>}
      <ProgressBar value={v} />
    </div>
  )

  // ---------- Ayna ----------
  if (phase === 'ayna') {
    const it = AYNA_ITEMS[ai]
    return (
      <main className="screen fade-in yn">
        {top(ai / AYNA_ITEMS.length)}
        <span className="yn-ey">Ayna · {ai + 1} / {AYNA_ITEMS.length}</span>
        <h1 className="yn-h">{it.t}</h1>
        <p className="muted small">Son zamanlarda ne sıklıkla? Doğru ya da yanlış cevap yok.</p>
        <div className="yn-lik" role="radiogroup" aria-label={it.t} key={it.id}>
          {LIKERT.map((l, k) => (
            <button key={l} type="button" role="radio" aria-checked={answers[it.id] === k + 1} onClick={() => answer(k + 1)}><i />{l}</button>
          ))}
        </div>
        <div className="grow" />
        <p className="yn-src">Öz-Şefkat Ölçeği Kısa Formu, Türkçe uyarlama (Büyüköksüz ve ark. 2025). Şimdilik makalede yayımlanan 6 madde.</p>
      </main>
    )
  }
  if (phase === 'aynaRes' && aynaResult) {
    // Kaydedilen ölçüm sessions'ta zaten olabilir; önceki = bundan önceki son Ayna
    const prev = aynas.filter((r) => r.date !== aynaDate).at(-1) ?? null
    const byId = aynaResult.items
    const side = (id) => AYNA_ITEMS.find((x) => x.id === id).side
    return (
      <main className="screen fade-in yn">
        {top(1, false)}
        <span className="yn-ey">Ayna · {prev ? 'yeni ölçümün' : 'ilk ölçümün'}</span>
        <div className="yn-score"><b>{fmt1(aynaResult.score)}</b><span>/ 5 · kendine şefkat</span>
          {prev && <em>{aynaResult.score >= prev.score ? '+' : '−'}{fmt1(Math.abs(aynaResult.score - prev.score))} önceki ölçüme göre</em>}
        </div>
        <p className="muted small">Sol: kendine sertlik. Sağ: kendine şefkat. Çubuk ne kadar uzunsa o kadar sık.</p>
        <div className="yn-mirror">
          {AYNA_PAIRS.map(([hard, soft]) => (
            <div key={hard}>
              <div className="yn-mrow"><span className="l">{side(hard)}</span><span>{side(soft)}</span></div>
              <div className="yn-pair">
                <div className="yn-mbar left"><i style={{ width: `${(byId[hard] / 5) * 100}%` }} /></div>
                <div className="yn-mbar right"><i style={{ width: `${(byId[soft] / 5) * 100}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
        <p className="muted small">Bu senin kendi çizgin; başkalarıyla kıyaslanmaz. Ayda bir tekrarlayınca değişimi görürsün.</p>
        <Fact f={FACTS.kiyas} />
        <div className="grow" />
        <button className="btn" onClick={() => start('sefkat')}>Şefkatle ele al'a geç</button>
        <button className="btn btn-ghost" onClick={() => setPhase('hub')}>Yön'e dön</button>
      </main>
    )
  }

  // ---------- Dışarıdan bak ----------
  if (phase === 'u0') {
    return (
      <main className="screen fade-in yn">
        {top(0.15)}
        <span className="yn-ey">Dışarıdan bak · 1 / 4</span>
        <h1 className="yn-h">Hâlâ aklına takılan bir anı seç.</h1>
        <p className="muted small">Tek cümle yeter. Ağır bir travma değil; seni kemiren ama baş edilebilir bir şey.</p>
        <textarea className="yn-text short" maxLength={140} value={event} onChange={(e) => setEvent(e.target.value)} placeholder="Örn: Ali, bir toplantıda sözünün kesildiği günü düşünüyor." />
        <span className="yn-lbl">Şu an bu anı seni ne kadar rahatsız ediyor?</span>
        <Scale value={before} onChange={setBefore} label="Rahatsızlık, önce" />
        <div className="grow" />
        <button className="btn" disabled={event.trim().length < 3 || before == null} onClick={() => setPhase('u1')}>Devam</button>
      </main>
    )
  }
  if (phase === 'u1') {
    return (
      <main className="screen fade-in yn">
        {top(0.4)}
        <span className="yn-ey">Dışarıdan bak · 2 / 4</span>
        <h1 className="yn-h">Kamerayı geri çek.</h1>
        <Scene far={far} caption={sceneDone ? 'Şimdi odanın dışındasın. Oradaki kişiye bak.' : 'Kendini o odada görüyorsun…'} />
        <p className="muted small">Sahneyi bir yabancı gibi izle: odada biri var, bir şey yaşıyor. Sen artık oradaki kişi değilsin; kenardan bakan birisin.</p>
        <div className="grow" />
        <button className="btn" disabled={!sceneDone} onClick={() => setPhase('u2')}>Uzaktan görüyorum</button>
      </main>
    )
  }
  if (phase === 'u2') {
    const d = distanceState(text, name)
    const who = name.trim() || 'Ali'
    return (
      <main className="screen fade-in yn">
        {top(0.65)}
        <span className="yn-ey">Dışarıdan bak · 3 / 4</span>
        <h1 className="yn-h">Adınla, "sen" diye yaz.</h1>
        <input className="yn-name" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} placeholder="Adın (kaydedilmez)" aria-label="Adın" />
        <textarea className="yn-text" maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder={`${who}, o gün neden böyle hissettin? Sen o odada ne yaşadın?`} aria-label="Yazın" />
        <p className="yn-meter" aria-live="polite">
          {d.kind === 'empty' && 'Yazmaya başla. "Ben" yerine adını ya da "sen" kullan.'}
          {d.kind === 'first' && <><b>"ben" {d.first} kez</b> · yerine {name.trim() ? `"${name.trim()}"` : 'adını'} ya da "sen" dene.</>}
          {d.kind === 'far' && <span className="ok">Uzaktan yazıyorsun.</span>}
          {d.kind === 'neutral' && 'Adını ya da "sen" kelimesini kullan.'}
        </p>
        <p className="yn-src">"Ben" yerine kendi adını kullanmak uzaklığı artırıyor (Kross 2014, 7 çalışma).</p>
        <div className="grow" />
        <button className="btn" disabled={text.trim().length < MIN_TEXT} onClick={() => setPhase('u3')}>Devam</button>
      </main>
    )
  }
  if (phase === 'u3') {
    return (
      <main className="screen fade-in yn">
        {top(0.9)}
        <span className="yn-ey">Dışarıdan bak · 4 / 4</span>
        <h1 className="yn-h">Şimdi bu anı seni ne kadar rahatsız ediyor?</h1>
        <Scale value={after} onChange={setAfter} label="Rahatsızlık, sonra" />
        <Keep checked={keep} onChange={setKeep} />
        <div className="grow" />
        <button className="btn" disabled={after == null} onClick={finishUzak}>Sonucu gör</button>
      </main>
    )
  }
  if (phase === 'uRes') {
    const d = after - before
    return (
      <main className="screen fade-in yn">
        {top(1, false)}
        <span className="yn-ey">Dışarıdan bak · bitti</span>
        <div className="yn-delta"><b>{before}</b><span>→</span><b>{after}</b><em className={d <= 0 ? 'ok' : 'up'}>{d > 0 ? '+' : d < 0 ? '−' : ''}{Math.abs(d)}</em></div>
        <p className="muted small">rahatsızlık, kendi puanın (0–10)</p>
        <Fact f={FACTS.uzak} />
        <div className="grow" />
        <button className="btn" onClick={() => setPhase('hub')}>Bitti</button>
      </main>
    )
  }

  // ---------- Şefkatle ele al ----------
  if (phase === 's0') {
    return (
      <main className="screen fade-in yn">
        {top(0.2)}
        <span className="yn-ey">Şefkatle ele al · 1 / 3</span>
        <h1 className="yn-h">Kendine kızdığın bir başarısızlık ya da zayıf yanın?</h1>
        <textarea className="yn-text short" maxLength={140} value={event} onChange={(e) => setEvent(e.target.value)} placeholder="Örn: Ali, spora yine ara verdiği için kendine kızıyor." />
        <p className="muted small">Onu düzeltmek zorunda değilsin; sadece adını koy.</p>
        <div className="grow" />
        <button className="btn" disabled={event.trim().length < 3} onClick={() => setPhase('s1')}>Devam</button>
      </main>
    )
  }
  if (phase === 's1') {
    return (
      <main className="screen fade-in yn">
        {top(0.55)}
        <span className="yn-ey">Şefkatle ele al · 2 / 3</span>
        <h1 className="yn-h">Aynısı en yakın dostunun başına gelseydi, ona ne yazardın?</h1>
        <p className="muted small">Şimdi bunu kendine yaz. Bir cümle ekle ya da kendi sözlerinle yaz.</p>
        <div className="yn-chips">
          {KIND_CHIPS.map((c) => <button key={c.label} type="button" className="yn-chip" onClick={() => setText((t) => appendChip(t, c.text))}>{c.label}</button>)}
        </div>
        <textarea className="yn-text" maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="Sevgili …," aria-label="Mektubun" />
        <div className="grow" />
        <button className="btn" disabled={text.trim().length < MIN_TEXT} onClick={() => setPhase('s2')}>Devam</button>
      </main>
    )
  }
  if (phase === 's2') {
    return (
      <main className="screen fade-in yn">
        {top(0.85)}
        <span className="yn-ey">Şefkatle ele al · 3 / 3</span>
        <h1 className="yn-h">Bu hafta bu konuda atabileceğin en küçük adım?</h1>
        <textarea className="yn-text short" maxLength={140} value={step} onChange={(e) => setStep(e.target.value)} placeholder="İsteğe bağlı. Örn: Ali, bu akşam 10 dakika yürüyecek." />
        <Keep checked={keep} onChange={setKeep} />
        <div className="grow" />
        <button className="btn" onClick={finishSefkat}>Bitir</button>
      </main>
    )
  }
  if (phase === 'sRes') {
    return (
      <main className="screen fade-in yn">
        {top(1, false)}
        <span className="yn-ey">Şefkatle ele al · bitti</span>
        <h1 className="yn-h">{step.trim() ? 'Kendine bir dost gibi yazdın ve küçük bir adım seçtin.' : 'Kendine bir dost gibi yazdın.'}</h1>
        <Fact f={FACTS.sefkat} />
        <Fact f={FACTS.olumlama} eyebrow="Neden övgü cümlesi yok?" />
        <div className="grow" />
        <button className="btn" onClick={() => setPhase('hub')}>Bitti</button>
      </main>
    )
  }

  // ---------- Ana ekran ----------
  const card = (tool, icon, bg, title, sub, tag) => (
    <button type="button" className="yn-tool" onClick={() => start(tool)}>
      <span className="ic" style={{ background: bg }} aria-hidden="true">{icon}</span>
      <div><b>{title}</b><span>{sub}</span></div>
      <em>{tag}</em>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  )
  return (
    <main className="screen fade-in yn">
      <div className="yn-top"><button className="btn-icon" onClick={onExit} aria-label="Çık"><X size={20} /></button></div>
      <div className="yn-hero"><Compass /><div><span className="yn-ey">Yön</span><h1 className="yn-h">Kendini tanı, yönünü seç.</h1></div></div>
      {card('ayna', '🪞', '#2A1E0C', 'Ayna', lastAyna ? `Son: ${fmt1(lastAyna.score)} / 5${due ? ' · yenileme zamanı' : ''}` : 'Kendine nasıl davranıyorsun? 6 soru.', '2 dk')}
      {card('uzak', '🔭', '#0C2530', 'Dışarıdan bak', uzakLast ? `Son: rahatsızlık ${uzakLast.before}→${uzakLast.after}` : 'Takıldığın bir anıyı uzaktan, adınla yaz.', '4 dk')}
      {card('sefkat', '🤝', '#1B1530', 'Şefkatle ele al', 'Bir başarısızlığına, bir dostuna yazar gibi yaz.', '4 dk')}
      <div className="grow" />
      <p className="yn-safe"><b>Tedavi değildir.</b> Uzun süredir çok zorlanıyorsan bir uzmanla konuşmak en güçlü adım. Acil durumda <b>112</b>.</p>
    </main>
  )
}
