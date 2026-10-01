import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Captions } from 'lucide-react'
import BreathForm from './BreathForm.jsx'
import { lesson as bridge, hopeless } from './bridge.js'
import { YT } from './text.js'
import { reachedClosing } from './session.js'
import {
  durationOf, speechAt, captionAt, closingAt, sectionsOfTimeline, sectionAt, jumpPlan, seekTarget, resumePoint, visualAt,
  loadTimeline, resumeSpans, guardClosing,
} from './timeline.js'

// Ders oynatıcısı (modul.md §2.6, §4; PLAN.v3 §D.3). Hep karanlık (tema dışı, G3). Konum motordan okunur
// (lessonStatus().time); ekran açıkken saniyede dört kez. Ekran açık tutulmaz (Wake Lock yok): ders kilitte sürer.
// Oturum nesnesi (s) modül düzeyindedir (session.js): ekran kapanıp açılsa da dinlenen süre ve konum kaybolmaz.
//
// s alanları: lesson, version{ file, timeline, seconds }, title, planned, listened, lastPos, lastWall, maxPos, playing,
// userPaused, extPaused, pendingClose, quickClose, steps, until, jumped, started, error, tl, closeAt, sections,
// ended (okuma durdu: bitti ya da X), finished (dosya sonuna kadar çaldı), prelude (giriş dosyası çalıyor), runId.
export const POLL_MS = 250
export const CONTROLS_MS = 5000
const fmt = (sec) => {
  const x = Math.max(0, Math.round(sec))
  return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`
}
const reduceMotionNow = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)

// Motor durumunu oturuma işler. Dönüş: 'ended' (dosya sonuna kadar çaldı) | 'stopped' (yerel oturum başka yerden
// kapandı: ör. uyku sesi duraklatılmış dersi kapattı) | null. Saf değil (s'yi günceller) ama zamanlayıcıdan bağımsız
// sınanabilir.
// Yerel durum (st.state) varsa bitiş yalnız ondan ya da konumdan anlaşılır: finished / tail ya da çalarken son 0,75 sn.
// Duraklatılmış ders (kilit ekranı, Denetim Merkezi, AirPods, arama) ekran ne kadar gizli kalmış olursa olsun bitmiş
// sayılmaz. Duvar saatine dayalı tahmin (ranOut) yalnız state göndermeyen eski derlemede kalır.
export function applyStatus(s, st, nowMs = Date.now()) {
  const wall = Math.max(0, (nowMs - s.lastWall) / 1000)
  const dur = st.duration ?? durationOf(s.tl) ?? s.planned
  const state = st.state ?? null
  if ((state === 'idle' || state === 'stopping') && s.started) {
    s.lastWall = nowMs
    s.playing = false
    s.extPaused = false
    s.ended = true
    return 'stopped'
  }
  // Giriş dosyası (ilk ders cümlesi) çalıyor: konum giriş dosyasınındır; dinlenen süreye ve ilerlemeye sayılmaz
  if (st.prelude) {
    s.prelude = true
    s.lastWall = nowMs
    s.playing = st.playing
    s.extPaused = !st.playing && !s.userPaused && s.started
    return null
  }
  if (s.prelude) {
    s.prelude = false
    s.jumped = true // giriş → ders geçişi: bu okumadaki konum farkı dinleme değildir
  }
  const wasPlaying = s.playing
  const advanced = st.time - s.lastPos
  if (!s.jumped && advanced > 0 && (wasPlaying || st.playing)) s.listened += Math.min(advanced, wall + 1)
  // Yerel oynatıcının kendi saydığı süre (duraklama, giriş ve müzik kuyruğu hariç); daha azsa JS tahmini kalır
  if (Number.isFinite(st.listened)) s.listened = Math.max(s.listened, st.listened)
  let ended
  if (state) {
    ended = state === 'finished' || state === 'tail' || (state === 'playing' && st.time >= dur - 0.75)
  } else {
    ended = st.time >= dur - 0.75
    // Eski derleme: dosya bittiyse motor durur ve konumu başa alabilir; son bilinen konum + geçen süre sonu geçtiyse bitti
    const ranOut = !ended && !st.playing && wasPlaying && !s.userPaused && s.lastPos + wall >= dur - 2
    if (ranOut) {
      if (!s.jumped) s.listened += Math.min(Math.max(0, dur - s.lastPos), wall + 1)
      ended = true
    }
  }
  if (!s.jumped || st.playing) s.maxPos = Math.max(s.maxPos, ended ? dur : st.time)
  s.lastPos = ended ? dur : st.time
  s.lastWall = nowMs
  s.jumped = false
  s.playing = st.playing && !ended
  if (state === 'playing' && st.playing) s.userPaused = false // kilit ekranından ya da kulaklıktan sürdürüldü
  s.extPaused = !ended && !st.playing && !s.userPaused && s.started
  if (ended) {
    s.ended = true
    s.finished = true // dosya sonuna kadar çaldı (X ile durdurma değil)
    return 'ended'
  }
  return null
}

export { reachedClosing }

// Sarma hedefi: en yakın klip başı ya da bölüm başı; kapanıştan önceden kapanışın içine sarılırsa kapanışın başı
export function seekGoal(s, sections, t) {
  return guardClosing(seekTarget(s.tl, sections, t), s.lastPos, s.closeAt)
}

// Çizelgeden yerel oynatıcıya: kilit ekranında bölüm adı, kilitten ve kesintiden sürdürünce klip başı
export function metaOf(tl, labels = {}) {
  const sections = sectionsOfTimeline(tl).map((x) => ({ at: x.at, name: labels[x.id] ?? '' })).filter((x) => x.name)
  return { sections, resume: resumeSpans(tl) }
}

// Atlama adımlarını çalıştırır (Kapanışa geç, sarma, bölüme atlama). İlk adım: duraklatılmışsa sürdür, değilse geçiş.
export function runSteps(s, steps, { first = 'cross' } = {}) {
  const [step, ...rest] = steps
  if (!step) return Promise.resolve()
  s.steps = rest
  s.until = step.until ?? null
  s.jumped = true
  const paused = s.userPaused || s.extPaused
  s.userPaused = false
  s.extPaused = false
  if (paused) return bridge.resume({ at: step.at })
  if (first === 'seek') return bridge.seek({ at: step.at })
  return bridge.crossTo({ file: s.version.file, at: step.at })
}

// Bekleyen işler: "Kapanışa geç" o anki cümlenin bitmesini bekler; bırakma klibinden sonra sonraki adım
export function afterStatus(s) {
  if (s.until != null && s.lastPos >= s.until) {
    s.until = null
    if (s.steps.length) return runSteps(s, s.steps)
  }
  if (s.pendingClose && s.closeAt != null && !(s.tl && speechAt(s.tl, s.lastPos))) {
    s.pendingClose = false
    s.quickClose = true
    return runSteps(s, jumpPlan(s.tl, s.lastPos, s.closeAt))
  }
  return null
}

export default function YogaPlayer({ s, lesson: L, flashSafe = null, captions = false, onCaptions, onEnd }) {
  const [, setTick] = useState(0)
  const [showCtl, setShowCtl] = useState(true)
  const [drag, setDrag] = useState(null)
  const hideRef = useRef(0)
  const dragRef = useRef(0)
  const focusIn = useRef(false) // odak denetimlerin içindeyken (VoiceOver, klavye) denetimler gizlenmez
  const endRef = useRef(onEnd)
  endRef.current = onEnd
  const night = L.daypart === 'night'
  const rerender = () => setTick((n) => n + 1)

  // Çizelge: altyazı, bölümler, kapanış noktası ve görsel buradan; yerel oynatıcıya bölüm adları ve sürdürme noktaları
  useEffect(() => {
    let alive = true
    const sendMeta = () => bridge.meta({ file: s.version.file, ...metaOf(s.tl, L.sectionLabels) }).catch(() => {})
    if (!s.tl) {
      loadTimeline(s.version.timeline).then((tl) => {
        if (!alive || !tl) return
        s.tl = tl
        s.closeAt = closingAt(tl)
        s.sections = sectionsOfTimeline(tl)
        sendMeta()
        rerender()
      })
    }
    return () => { alive = false }
  }, [s]) // eslint-disable-line react-hooks/exhaustive-deps

  // Başlatma sözü (Yoga.begin): reddedilirse "Ses açılamadı" hemen görünsün
  useEffect(() => {
    let alive = true
    Promise.resolve(s.starting).catch(() => {}).finally(() => alive && rerender())
    return () => { alive = false }
  }, [s])

  // Konum okuma (ekran açıkken). Kilitte JS durur; açılınca geçen süre motorun konumundan hesaplanır.
  useEffect(() => {
    let alive = true
    let busy = false
    const poll = async () => {
      if (!alive || busy || s.ended || !s.started) return
      if (globalThis.document?.visibilityState === 'hidden') return
      busy = true
      try {
        const st = await bridge.status()
        if (!alive || s.ended) return
        const r = applyStatus(s, st)
        if (r) {
          // Bitti ya da yerel oturum başka yerden kapandı: bitiş anı ve dinlenen süre yerel kayıttan (ekran gizliyken bittiyse)
          // (ekran bu arada kapandıysa da çağrılır: s.ended artık doğru, kayıt başka yerde yazılmaz)
          const journal = await bridge.journal()
          endRef.current?.({ stopped: r === 'stopped', journal })
          return
        }
        await afterStatus(s)
      } catch {
        // tek okuma hatası dersi durdurmaz
      } finally {
        busy = false
        if (alive) rerender()
      }
    }
    const id = setInterval(poll, POLL_MS)
    const onVis = () => globalThis.document?.visibilityState === 'visible' && poll()
    globalThis.document?.addEventListener?.('visibilitychange', onVis)
    return () => {
      alive = false
      clearInterval(id)
      globalThis.document?.removeEventListener?.('visibilitychange', onVis)
    }
  }, [s])

  // Denetimler 5 sn sonra kaybolur; dokununca döner. Duraklatılmışken ve odak denetimlerin içindeyken (VoiceOver,
  // klavye) kalır: odağı alan her denetim onları geri getirir.
  const poke = () => {
    setShowCtl(true)
    clearTimeout(hideRef.current)
    hideRef.current = setTimeout(() => { if (!focusIn.current) setShowCtl(false) }, CONTROLS_MS)
  }
  useEffect(() => {
    poke()
    return () => { clearTimeout(hideRef.current); clearTimeout(dragRef.current) }
  }, [])

  const paused = s.userPaused || s.extPaused
  const dur = durationOf(s.tl) ?? s.planned
  const pos = drag ?? s.lastPos
  const inClosing = s.closeAt != null && s.lastPos >= s.closeAt
  const sections = s.sections ?? []
  const cur = sectionAt(sections, s.lastPos)
  const reduceMotion = reduceMotionNow()
  const v = visualAt(s.tl, s.lastPos, { reduceMotion, flashSafe, night })
  const still = reduceMotion || flashSafe !== true // form ölçeklenmez, biçimi değişmez (modul.md §3)
  const caption = captions && s.tl ? captionAt(s.tl, s.lastPos) : null

  function togglePause() {
    poke()
    if (paused) {
      s.userPaused = false
      s.extPaused = false
      s.jumped = true
      bridge.resume({ at: s.tl ? resumePoint(s.tl, s.lastPos) : s.lastPos }).catch(() => {})
    } else {
      s.userPaused = true
      bridge.pause().catch(() => {})
    }
    rerender()
  }
  function toClosing() {
    poke()
    if (s.closeAt == null || inClosing) return
    s.pendingClose = true
    afterStatus(s)?.catch?.(() => {})
    rerender()
  }
  function seekTo(t) {
    if (!s.tl) return
    const target = seekGoal(s, sections, t)
    runSteps(s, jumpPlan(s.tl, s.lastPos, target), { first: 'seek' }).catch(() => {})
    s.lastPos = target
    rerender()
  }
  function stop() {
    s.ended = true
    bridge.stop().catch(() => {})
    endRef.current?.({ stopped: true })
  }
  function retry() {
    s.error = null
    rerender()
    bridge.start({ ...(s.startArgs ?? { file: s.version.file, at: 0, title: L.title }), ...(s.tl ? metaOf(s.tl, L.sectionLabels) : {}) })
      .then(() => { s.started = true; s.lastWall = Date.now(); s.playing = true })
      .catch((e) => { s.error = e })
      .finally(rerender)
  }
  const onFocusIn = () => { focusIn.current = true; poke() }
  const onFocusOut = (e) => { if (!e.currentTarget.contains?.(e.relatedTarget)) focusIn.current = false }

  const style = { '--yg-c': L.color.dark }
  return (
    <main className={`yg-play${showCtl || paused ? ' ctl' : ''}`} style={style} aria-label={`Yoga · ${L.title}`} onClick={poke}>
      <BreathForm form={L.form} color={L.color.dark} v={v} night={night} still={still} />
      <div className="yg-hud">
        <button type="button" className="yg-x" onClick={(e) => { e.stopPropagation(); stop() }} aria-label={YT.player.stop}><X size={20} aria-hidden="true" /></button>
        <span className="yg-ey"><b>{L.title}</b>{cur && L.sectionLabels[cur] ? <span>{L.sectionLabels[cur]}</span> : null}</span>
        <span className="yg-t" aria-label={`${fmt(dur - pos)} ${YT.player.left}`}>{fmt(dur - pos)}</span>
      </div>
      {s.error && (
        <div className="yg-err" role="alert">
          {/* Oynatıcı bu derlemede yok ya da dosya pakette yok: sesi açmak ya da yeniden denemek işe yaramaz */}
          <p>{hopeless(s.error) ? YT.player.audioErrorShort : YT.player.audioError}</p>
          {!hopeless(s.error) && <button type="button" className="btn btn-sm" onClick={(e) => { e.stopPropagation(); retry() }}>{YT.player.retry}</button>}
        </div>
      )}
      <div className="yg-bot">
        {caption && <p className="yg-cap" aria-live="off">{caption}</p>}
        {/* Gizleme yalnız görsel (saydamlık): VoiceOver denetimleri her an okur ve odaklayınca geri gelirler */}
        <div className="yg-ctl" onFocus={onFocusIn} onBlur={onFocusOut}>
          {sections.length > 0 && (
            <div className="yg-strip">
              {/* İnce bölüm çizgisi: bölümler ve dinlenen kısım; üstündeki kaydırıcı sarar, bölüm başına yakın bırakılınca bölüme atlar */}
              <div className="yg-segs" aria-hidden="true">
                {sections.map((sec, i) => {
                  const end = sections[i + 1]?.at ?? dur
                  const fill = Math.min(1, Math.max(0, (pos - sec.at) / Math.max(1, end - sec.at)))
                  return (
                    <span key={sec.id} className={`yg-seg${sec.id === cur ? ' on' : ''}`} style={{ flexGrow: Math.max(1, end - sec.at) }}>
                      <i style={{ width: `${Math.round(fill * 100)}%` }} />
                    </span>
                  )
                })}
              </div>
              <input
                className="yg-range"
                type="range"
                min="0"
                max={Math.round(dur)}
                step="1"
                value={Math.round(pos)}
                aria-label={YT.detail.sections}
                aria-valuetext={`${L.sectionLabels[sectionAt(sections, pos)] ?? ''} · ${fmt(pos)} / ${fmt(dur)}`}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  poke()
                  const t = +e.target.value
                  setDrag(t)
                  clearTimeout(dragRef.current)
                  dragRef.current = setTimeout(() => { setDrag(null); seekTo(t) }, 400)
                }}
              />
            </div>
          )}
          <div className="yg-row">
            <button type="button" className={`yg-cc${captions ? ' on' : ''}`} aria-pressed={captions} onClick={(e) => { e.stopPropagation(); poke(); onCaptions?.(!captions) }}>
              <Captions size={18} aria-hidden="true" /> {YT.player.captions}
            </button>
            <button type="button" className="yg-pp" onClick={(e) => { e.stopPropagation(); togglePause() }} aria-label={paused ? YT.player.resume : YT.player.pause}>
              {paused ? <Play size={26} aria-hidden="true" /> : <Pause size={26} aria-hidden="true" />}
            </button>
            {s.closeAt != null && !inClosing && !s.pendingClose ? (
              <button type="button" className="yg-close" onClick={(e) => { e.stopPropagation(); toClosing() }}>{night ? YT.player.toSleep : YT.player.toClosing}</button>
            ) : <span className="yg-close-sp" aria-hidden="true" />}
          </div>
        </div>
      </div>
    </main>
  )
}
