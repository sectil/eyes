import { useEffect, useRef, useState } from 'react'
import { Info, Sun, Moon, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { isIOSApp, haptic } from '../../lib/native.js'
import {
  LESSONS, visibleLessons, publishedMinutes, pickMinutes, versionOf, sectionsOf, addedSections, minutesLabel,
  isNightHour, isPublished, POSTURE_LABEL, MUSIC_TAIL, THREE_MIN_LINE, SOURCES_FOOTER,
} from '../../lib/yogaLessons.js'
import { afterPatch, recordWriter, hasRating, isYoga, RATE_MAX } from '../../lib/yogaRecord.js'
import { profileSignals } from '../../lib/profile.js'
import { NBSP } from '../../lib/format.js'
import { markLater } from '../../lib/pathLater.js'
import { stopSleepSession } from '../../lib/sleepSession.js'
import { YT, capFirst, listTr } from './text.js'
import { loadYogaOpts, saveYogaOpts } from './opts.js'
import { lesson as bridge, sleepSoundPlaying } from './bridge.js'
import { currentLesson, setCurrentLesson, clearCurrentLesson, newLessonSession, newRunId } from './session.js'
import { sessionRecord, liveLesson } from './journal.js'
import YogaPlayer from './YogaPlayer.jsx'
import { sectionAt } from './timeline.js'
import './yoga.css'

// Yoga ve Meditasyon (modul.md §2; PLAN.v3 §D.2): kütüphane → ders ayrıntısı → (ilk kez: güvenlik kartı ve ses
// denetimi) → önce puanı → oynatıcı → sonra puanı ve zorlanma sorusu → bitiş. X: durdurma ekranı → zorlanma sorusu.
// Yalnız yayımlanmış süreler ve en az bir süresi yayımlanmış dersler görünür (lib/yogaLessons.js).
// Web'de (isIOSApp() yanlış) yoga yoktur; rotaya doğrudan gelinirse tek satır (PLAN.v3 §D.7).

// Ses denetimi dosyası (10 sn; Derin evre düzeyinde üç kısa sözcük). Henüz üretilmedi: adım hiç görünmez (ekrandaki
// sözcükler söylenmeyecekse yazılmaz); dosya gelince yalnız bu satır değişir ve adım ilk derste kendiliğinden açılır.
export const SOUND_CHECK_FILE = null
// Durdurma ekranındaki "Sesli dönüşü dinle" dosyası (20–30 sn). Henüz üretilmedi: düğme dosya gelince görünür.
export const VOICE_RETURN_FILE = null

const lessonFromRoute = (route) => {
  const m = /^yoga-(\d+)$/.exec(route ?? '')
  return m ? Number(m[1]) : null
}

export default function Yoga(props) {
  if (!isIOSApp()) return <WebOnly onExit={props.onExit} />
  return <YogaFlow {...props} />
}

function WebOnly({ onExit }) {
  return (
    <main className="screen fade-in yg">
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onExit} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
      </div>
      <h1 className="yg-h">{YT.libraryTitle}</h1>
      <p className="yg-p">{YT.webOnly}</p>
    </main>
  )
}

// Gündüz dersinden bitişte "Çok" cevabı: dersin yayımlanmış daha kısa bir süresi var mı (yoksa "daha kısa bir süre
// seçebilir" denmez, bitişte aynı ders "en kısa" diye önerilmez)
const shorterOf = (n, minutes) => publishedMinutes(n).find((m) => m < minutes) ?? null

// pathMinutes: yoldan açılınca yolun süresi (manifest.today stage.minutes); onExit: Ana sayfaya
function YogaFlow({ route = 'yoga', sessions = [], profile = null, store, onRefresh, onExit, pathMinutes = null }) {
  const [opts, setOpts] = useState(() => loadYogaOpts())
  const fromPath = lessonFromRoute(route)
  const visible = visibleLessons(new Date())
  const startLesson = fromPath != null && visible.includes(fromPath) ? fromPath : null
  const running = currentLesson()
  const [n, setN] = useState(() => running?.lesson ?? startLesson)
  const [screen, setScreen] = useState(() => (running ? 'play' : !opts.safetySeen ? 'safety' : startLesson ? 'detail' : 'library'))
  const [safetyBack, setSafetyBack] = useState(() => (startLesson ? 'detail' : 'library'))
  const [minutes, setMinutes] = useState(() => (startLesson ? pickMinutes(startLesson, pathMinutes ?? opts.minutesByLesson[startLesson]) : null))
  const [prevMinutes, setPrevMinutes] = useState(null)
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const [hard, setHard] = useState(null)
  const [end, setEnd] = useState(null) // { rec, stopped, lesson, minutes, section }
  const [sound, setSound] = useState(null) // ses denetimi cevabı (ekranda)
  const writerRef = useRef(running?.writer ?? null)
  const L = n != null ? LESSONS[n] : null

  const update = (patch) => setOpts(saveYogaOpts(patch))
  // Akış bitmeden ekran kapanırsa bekleyen kayıt yazılır (depoda updateSession yoksa)
  useEffect(() => () => writerRef.current?.flush(), [])
  // Bellekte ders yok ama yerelde sürüyor (WebView yeniden yüklendi): oynatıcı o derse yeniden bağlanır
  useEffect(() => {
    if (running) return undefined
    let alive = true
    liveLesson(store).then((s) => {
      if (!alive || !s) return
      writerRef.current = s.writer
      setN(s.lesson)
      setMinutes(s.minutes)
      setScreen('play')
    }).catch(() => {})
    return () => { alive = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exitFlow = () => {
    writerRef.current?.flush()
    if (writerRef.current) onRefresh?.() // puanlar eklendi (ya da bekleyen kayıt yazıldı): Gelişim güncel veriyi görsün
    writerRef.current = null
    setEnd(null)
    setBefore(null)
    setAfter(null)
    setHard(null)
    if (fromPath != null) onExit?.()
    else setScreen('library')
  }
  const openLesson = (k, wanted = null) => {
    setN(k)
    setPrevMinutes(null)
    setMinutes(pickMinutes(k, wanted ?? opts.minutesByLesson[k]))
    setScreen('detail')
  }
  const chooseMinutes = (m) => {
    setPrevMinutes(minutes)
    setMinutes(m)
    update({ minutesByLesson: { ...opts.minutesByLesson, [n]: m } })
  }

  // Başla → (ilk ders: ses denetimi) → önce puanı → oynatıcı. Ses yerel oynatıcıda bu dokunuş zincirinde başlar.
  const firstLesson = !sessions.some(isYoga)
  const needSound = Boolean(SOUND_CHECK_FILE) && firstLesson && (!opts.soundCheck || opts.soundCheck === 'nofile')
  function playSoundCheck() {
    bridge.start({ file: SOUND_CHECK_FILE, at: 0, title: YT.title, journal: false }).catch(() => {})
  }
  function pressStart() {
    haptic('tick')
    if (needSound) {
      playSoundCheck() // iOS sesi yalnız dokunuşun içinde açar
      return setScreen('sound')
    }
    // Dosya yokken adım görünmez; ilk derste bu yazılır ki dosya gelince bir kez sorulsun
    if (firstLesson && !SOUND_CHECK_FILE && !opts.soundCheck) update({ soundCheck: 'nofile' })
    afterSound()
  }
  function afterSound() {
    if (SOUND_CHECK_FILE && screen === 'sound') bridge.stop().catch(() => {}) // ses denetimi hâlâ çalıyorsa susar
    setBefore(null)
    if (hasRating(n)) setScreen('before')
    else begin(null)
  }
  function begin(b) {
    const v = versionOf(n, minutes)
    if (!v || !isPublished(n, minutes)) return
    const night = L.daypart === 'night'
    // Uyku dersinde müzik kuyruğu yalnız dosyası varsa ve seçiliyse (yoksa kaydın musicTail'i 0: kuyruk çalmadı)
    const tailMin = night && L.musicTailFile ? opts.musicTail : 0
    const s = setCurrentLesson(newLessonSession({
      lesson: n, minutes, version: v, title: L.title, before: b, runId: newRunId(), musicTail: night ? tailMin : null,
      writer: recordWriter(store),
    }))
    s.startArgs = {
      file: firstLesson && v.intro ? v.intro : v.file, // ilk ders: önce kısa giriş dosyası, sonra 2 sn'lik geçişle ders
      at: 0,
      title: L.title,
      id: s.runId,
      ...(firstLesson && v.intro ? { next: { file: v.file, at: 0 } } : {}),
      ...(tailMin > 0 ? { tail: { file: L.musicTailFile, seconds: tailMin * 60, fade: 180 } } : {}),
    }
    writerRef.current = s.writer
    stopSleepSession() // uyku sesini yerel taraf durdurur; JS'teki uyku oturumu da onunla aynı kalsın
    setScreen('play')
    s.starting = bridge.start(s.startArgs)
      .then(() => { s.started = true; s.playing = true; s.lastWall = Date.now() })
      .catch((e) => { s.error = e })
  }

  // Ses bitti, X ya da yerel oturum başka yerden kapandı: kayıt hemen yazılır (30 sn altı yazılmaz), puanlar sonra
  // eklenir. journal: bu dersin yerel kaydı (bitiş anı, dinlenen süre); yazılınca silinir (uzlaştırma iki kez yazmasın).
  function onPlayEnd({ stopped, journal = null }) {
    const s = currentLesson()
    if (!s) return
    const Ls = LESSONS[s.lesson]
    // Dosya bitti: gündüz dersinde yerel oynatıcı bırakılır (uyku dersinde müzik kuyruğu "Durdur"a kadar sürer)
    if (!stopped && Ls.daypart !== 'night') bridge.stop().catch(() => {})
    const rec = sessionRecord(s, { journal })
    s.writer.save(rec)
    writerRef.current = s.writer
    bridge.journalClear().catch(() => {})
    if (rec) onRefresh?.()
    clearCurrentLesson(s)
    const section = s.sections ? Ls.sectionLabels[sectionAt(s.sections, s.lastPos)] ?? null : null
    setN(s.lesson)
    setMinutes(s.minutes)
    setBefore(s.before)
    setEnd({ rec, stopped, lesson: s.lesson, minutes: s.minutes, section: stopped ? section : Ls.sectionLabels.K ?? section })
    setAfter(null)
    setHard(null)
    if (stopped) setScreen('stopped')
    else if (Ls.daypart === 'night') setScreen('sleep-end')
    else if (!rec) setScreen('done')
    else setScreen(hasRating(s.lesson) ? 'after' : 'hard')
  }

  function answerHard(h) {
    setHard(h)
    if (end?.rec && h) {
      writerRef.current?.patch(afterPatch(end.rec, { hard: h }))
      onRefresh?.()
    }
    if (h === 'much') return // metin gösterilir, "Devam" ile sürer
    nextAfterHard()
  }
  function nextAfterHard() {
    if (end?.stopped) exitFlow()
    else setScreen('done')
  }

  const flashSafe = profileSignals(profile).flashSafe

  if (screen === 'safety') {
    return (
      <SafetyCard
        onOk={() => { if (!opts.safetySeen) update({ safetySeen: true }); setScreen(safetyBack) }}
      />
    )
  }

  if (screen === 'play') {
    const s = currentLesson()
    if (!s) return null
    return (
      <YogaPlayer
        key={s.startedAt}
        s={s}
        lesson={LESSONS[s.lesson]}
        flashSafe={flashSafe}
        captions={opts.captions}
        onCaptions={(on) => update({ captions: on })}
        onEnd={onPlayEnd}
      />
    )
  }

  if (screen === 'detail' && L) {
    return (
      <Detail
        L={L}
        minutes={minutes}
        prevMinutes={prevMinutes}
        opts={opts}
        onMinutes={chooseMinutes}
        onMusicTail={(m) => update({ musicTail: m })}
        onBack={() => (fromPath != null ? onExit?.() : setScreen('library'))}
        onSafety={() => { setSafetyBack('detail'); setScreen('safety') }}
        onEvening={() => openLesson(3)}
        onStart={pressStart}
        // "Sonra yaparım" (PLAN.v3 §B.2-9): yalnız yoldan açılan derste; durak bugün sonraya bırakılır, Ana sayfaya dönülür
        onLater={fromPath != null ? () => { markLater('yoga', new Date()); onExit?.() } : null}
      />
    )
  }

  if (screen === 'sound' && SOUND_CHECK_FILE) {
    return (
      <SoundCheck
        answer={sound}
        onAnswer={(a) => {
          setSound(a)
          update({ soundCheck: a })
          if (a !== 'no') afterSound()
        }}
        onAgain={() => { setSound(null); playSoundCheck() }}
        onContinue={afterSound}
        onBack={() => { bridge.stop().catch(() => {}); setScreen('detail') }}
      />
    )
  }

  if (screen === 'before' || screen === 'after') {
    const isBefore = screen === 'before'
    const val = isBefore ? before : after
    return (
      <main className="screen fade-in yg" style={{ '--yg-c': L.color.dark, '--yg-cl': L.color.light }}>
        <div className="yg-top">
          {isBefore && <button type="button" className="btn-icon" onClick={() => setScreen('detail')} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>}
        </div>
        <span className="yg-ey">{isBefore ? YT.rate.before : YT.rate.after} · {L.title}</span>
        <h1 className="yg-h">{L.question}</h1>
        <Rate value={val} onChange={isBefore ? setBefore : setAfter} label={L.measure} />
        <div className="yg-ends"><span>{L.ends?.[0]}</span><span>{L.ends?.[1]}</span></div>
        <div className="grow" />
        <div className="yg-go">
          <button
            type="button"
            className="btn"
            disabled={val == null}
            onClick={() => {
              if (isBefore) begin(before)
              else {
                writerRef.current?.patch(afterPatch(end?.rec, { after }))
                if (end?.rec) onRefresh?.() // Gelişim'deki önce → sonra etkisi hemen güncel
                setScreen('hard')
              }
            }}
          >{YT.rate.next}</button>
          <button type="button" className="btn btn-ghost" onClick={() => (isBefore ? begin(null) : setScreen('hard'))}>{YT.rate.skip}</button>
        </div>
      </main>
    )
  }

  if (screen === 'stopped') {
    return (
      <main className="yg-dark yg-stop" aria-live="polite">
        <p className="yg-stop-t">{YT.stopped.text}</p>
        <div className="yg-go">
          {VOICE_RETURN_FILE && <button type="button" className="btn btn-ghost" onClick={() => bridge.start({ file: VOICE_RETURN_FILE, at: 0, title: L?.title ?? YT.title, journal: false }).catch(() => {})}>{YT.stopped.voiceReturn}</button>}
          <button type="button" className="btn" onClick={() => (end?.rec ? setScreen('hard') : exitFlow())}>{YT.stopped.ok}</button>
        </div>
      </main>
    )
  }

  if (screen === 'sleep-end') {
    // Uyku dersi: ses susar, ekran karanlık kalır; dokununca yalnız "Durdur" (modul.md §2.6). Önce/sonra ekranı yok.
    return <SleepEnd onStop={() => { bridge.stop().catch(() => {}); exitFlow() }} />
  }

  if (screen === 'hard') {
    const much = hard === 'much'
    const shorter = end ? shorterOf(end.lesson, end.minutes) != null : true
    return (
      <main className="screen fade-in yg" style={{ '--yg-c': L.color.dark, '--yg-cl': L.color.light }}>
        <div className="yg-top" />
        <h1 className="yg-h">{YT.hard.question}</h1>
        <div className="yg-chips" role="radiogroup" aria-label={YT.hard.question}>
          {YT.hard.options.map((o) => (
            <button key={o.id} type="button" role="radio" className="yg-chip" aria-checked={hard === o.id} onClick={() => answerHard(o.id)}>{o.label}</button>
          ))}
        </div>
        {much && (
          <p className="yg-note" role="status">
            {end?.stopped
              ? (shorter ? YT.hard.muchStopped : YT.hard.muchStoppedNoShorter)
              : (shorter ? YT.hard.muchFinished : YT.hard.muchFinishedNoShorter)}
          </p>
        )}
        <div className="grow" />
        <div className="yg-go">
          {much
            ? <button type="button" className="btn" onClick={nextAfterHard}>{YT.hard.next}</button>
            : <button type="button" className="btn btn-ghost" onClick={nextAfterHard}>{YT.hard.skip}</button>}
        </div>
      </main>
    )
  }

  if (screen === 'done' && L) {
    return <Done L={L} end={end} before={before} after={after} hard={hard} onOpen={openLesson} onOk={exitFlow} />
  }

  return (
    <Library
      visible={visible}
      onBack={onExit}
      onOpen={(k) => openLesson(k)}
    />
  )
}

// ---- Ekran parçaları ----

function Rate({ value, onChange, label }) {
  return (
    <div className="yg-rate" role="radiogroup" aria-label={label}>
      {Array.from({ length: RATE_MAX }, (_, k) => k + 1).map((v) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => { onChange(v); haptic('tick') }}>{v}</button>
      ))}
    </div>
  )
}

export function SafetyCard({ onOk }) {
  const T = YT.safety
  return (
    <main className="screen fade-in yg yg-safety">
      <h1 className="yg-h">{T.title}</h1>
      {T.items.map((it) => (
        <p key={it.h} className="yg-p"><b>{it.h}</b> {it.p}</p>
      ))}
      <p className="yg-p yg-safe-foot">{T.footer} <b>{T.emergency}</b>.</p>
      <div className="grow" />
      <button type="button" className="btn" onClick={onOk}>{T.ok}</button>
    </main>
  )
}

// Ses denetimi: yalnız dosyası varken (SOUND_CHECK_FILE). Ekrandaki sözcükler dosyada söylenenlerdir.
function SoundCheck({ answer, onAnswer, onAgain, onContinue, onBack }) {
  const T = YT.soundCheck
  return (
    <main className="screen fade-in yg">
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
      </div>
      <span className="yg-ey">{T.eyebrow}</span>
      <p className="yg-h yg-quote">{T.screenText}</p>
      <p className="yg-p">{T.question}</p>
      {answer === 'no' && <p className="yg-note" role="status">{T.onNo}</p>}
      <div className="grow" />
      <div className="yg-go">
        {answer !== 'no' ? (
          <>
            <button type="button" className="btn" onClick={() => onAnswer('yes')}>{T.yes}</button>
            <button type="button" className="btn btn-secondary" onClick={() => onAnswer('no')}>{T.no}</button>
            <button type="button" className="btn btn-ghost" onClick={() => onAnswer('skip')}>{T.skip}</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={onAgain}>{T.again}</button>
            <button type="button" className="btn" onClick={onContinue}>{YT.rate.next}</button>
          </>
        )}
      </div>
    </main>
  )
}

// Uyku sonu: ekran karanlık; dokununca "Durdur" görünür. Düğme DOM'da kalır (yalnız saydam): VoiceOver onu bulur ve
// odaklayınca görünür olur.
function SleepEnd({ onStop }) {
  const [on, setOn] = useState(false)
  return (
    <main className={`yg-dark yg-sleep${on ? ' on' : ''}`} onClick={() => setOn(true)}>
      <button type="button" className="btn btn-ghost" onFocus={() => setOn(true)} onClick={(e) => { e.stopPropagation(); return on ? onStop() : setOn(true) }}>{YT.player.sleepStopOnly}</button>
    </main>
  )
}

// Gündüz ya da gece: simge ve VoiceOver için görünmez ad (renk ya da simge tek başına bilgi taşımaz)
function DayIcon({ daypart }) {
  const night = daypart === 'night'
  return (
    <>
      {night ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
      <span className="yg-sr">{night ? YT.detail.night : YT.detail.day}</span>
    </>
  )
}

function Library({ visible, onBack, onOpen }) {
  const [filter, setFilter] = useState(null)
  const filters = [
    { id: 'day', label: YT.filters.day, ok: (n) => LESSONS[n].daypart === 'day' },
    { id: 'night', label: YT.filters.night, ok: (n) => LESSONS[n].daypart === 'night' },
    { id: 'three', label: YT.filters.three, ok: (n) => publishedMinutes(n).includes(3) },
  ].filter((f) => {
    const hits = visible.filter(f.ok).length
    return hits > 0 && hits < visible.length // yalnız listeyi gerçekten daraltan süzgeç
  })
  const active = filters.find((f) => f.id === filter)
  const list = active ? visible.filter(active.ok) : visible
  return (
    <main className="screen fade-in yg">
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
      </div>
      <h1 className="yg-h">{YT.libraryTitle}</h1>
      {filters.length > 0 && (
        <div className="yg-chips" role="radiogroup" aria-label={YT.libraryTitle}>
          {filters.map((f) => (
            <button key={f.id} type="button" role="radio" className="yg-chip" aria-checked={filter === f.id} onClick={() => setFilter(filter === f.id ? null : f.id)}>{f.label}</button>
          ))}
        </div>
      )}
      <div className="yg-list">
        {list.map((k) => {
          const Lk = LESSONS[k]
          return (
            <button key={k} type="button" className="yg-card" style={{ '--yg-c': Lk.color.dark, '--yg-cl': Lk.color.light }} onClick={() => onOpen(k)}>
              <span className="yg-card-bar" aria-hidden="true" />
              <span className="grow">
                <span className="yg-card-t">{Lk.title}</span>
                <span className="yg-card-s">{Lk.tagline}</span>
                <span className="yg-card-m"><DayIcon daypart={Lk.daypart} /> {minutesLabel(publishedMinutes(k))} · {POSTURE_LABEL[Lk.posture]}</span>
              </span>
              <ChevronRight className="chev" size={18} aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </main>
  )
}

// 3 dakikada dersin genel etki cümlesi yazılmaz: kart yalnız Radin 2025'in kullanım bulgusunu ve "Üç dakikalık sürümün
// etkisini doğrudan sınayan bir çalışma bulamadık." cümlesini yazar (PLAN.v3 §A.2 kural 12; sure.md §10)
function Sources({ L, minutes, title = YT.detail.sources }) {
  const lines = minutes === 3 ? [THREE_MIN_LINE] : [L.evidenceLine, L.evidenceByMinutes?.[minutes] ?? null].filter(Boolean)
  return (
    <details className="yg-src">
      <summary>{title} ({L.sources.length})</summary>
      {lines.map((t) => <p key={t}>{t}</p>)}
      <ul>
        {L.sources.map((r) => (
          <li key={`${r.pmid}-${r.cite}`}>
            <span>{r.cite}</span>
            <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">PMID {r.pmid} · doi {r.doi} <ExternalLink size={11} aria-hidden="true" /></a>
          </li>
        ))}
      </ul>
      <p className="yg-src-foot">{SOURCES_FOOTER}</p>
    </details>
  )
}

function Detail({ L, minutes, prevMinutes, opts, onMinutes, onMusicTail, onBack, onSafety, onEvening, onStart, onLater = null }) {
  const [sleepOn, setSleepOn] = useState(false)
  useEffect(() => {
    let alive = true
    sleepSoundPlaying().then((on) => alive && setSleepOn(on))
    return () => { alive = false }
  }, [])
  const mins = publishedMinutes(L.n)
  const sections = sectionsOf(L.n, minutes)
  const added = addedSections(L.n, prevMinutes, minutes)
  const addedIds = new Set(added.map((s) => s.id))
  const night = L.daypart === 'night'
  const evening = !night && isNightHour(new Date()) && publishedMinutes(3).length > 0 // Uykuya Geçiş yayımlanmışsa
  return (
    <main className="screen fade-in yg" style={{ '--yg-c': L.color.dark, '--yg-cl': L.color.light }}>
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button type="button" className="btn-icon" onClick={onSafety} aria-label={YT.safety.open}><Info size={20} aria-hidden="true" /></button>
      </div>
      <span className="yg-ey"><DayIcon daypart={L.daypart} /> {POSTURE_LABEL[L.posture]}</span>
      <h1 className="yg-h">{L.fullTitle}</h1>
      <p className="yg-p">{L.tagline}</p>

      <div className="yg-chips" role="radiogroup" aria-label={YT.detail.minutes}>
        {mins.map((m) => (
          <button key={m} type="button" role="radio" className="yg-chip" aria-checked={m === minutes} onClick={() => onMinutes(m)}>{m}{NBSP}dk</button>
        ))}
      </div>
      {sections.length > 0 && (
        <p className="yg-sections" role="group" aria-label={YT.detail.sections}>
          <span className="yg-sr">{YT.detail.sections}: </span>
          {sections.map((s, i) => (
            <span key={s.id}>{i > 0 ? ' · ' : ''}<span className={addedIds.has(s.id) ? 'yg-add' : undefined}>{s.label}</span></span>
          ))}
        </p>
      )}
      {added.length > 0 && <p className="yg-p small" role="status">{YT.detail.added(minutes, listTr(added.map((s) => s.label.toLocaleLowerCase('tr-TR'))))}</p>}

      {/* Müzik kuyruğu seçicisi yalnız kuyruk dosyası varken: seçenek, çalan davranışla aynı olsun */}
      {night && L.musicTailFile && (
        <div className="yg-field">
          <span className="yg-lbl">{YT.detail.musicTail}</span>
          <div className="yg-chips" role="radiogroup" aria-label={YT.detail.musicTail}>
            {MUSIC_TAIL.map((m) => (
              <button key={m} type="button" role="radio" className="yg-chip" aria-checked={opts.musicTail === m} onClick={() => onMusicTail(m)}>{m === 0 ? YT.detail.musicTailOff : `${m}${NBSP}dk`}</button>
            ))}
          </div>
        </div>
      )}

      {L.posture === 'lie' && L.preparation?.length > 0 && (
        <section className="yg-prep">
          <span className="yg-lbl">{YT.detail.preparation}</span>
          <p>{L.preparation.join(' · ')}</p>
        </section>
      )}

      <Sources L={L} minutes={minutes} />

      <div className="grow" />
      <div className="yg-open">
        {L.opening.map((t) => <p key={t}>{t}</p>)}
        {sleepOn && <p>{YT.detail.sleepStops}</p>}
      </div>
      {evening && <button type="button" className="link-btn yg-evening" onClick={onEvening}>{YT.detail.evening}</button>}
      <button type="button" className="btn" disabled={minutes == null} onClick={onStart}>{YT.detail.start}</button>
      {onLater && <button type="button" className="btn btn-ghost" onClick={onLater}>{YT.detail.later}</button>}
    </main>
  )
}

function Done({ L, end, before, after, hard, onOpen, onOk }) {
  const rec = end?.rec
  const mins = rec ? Math.max(1, Math.round(rec.seconds / 60)) : null
  // "Çok": aynı dersin en kısa süresi, ama yalnız bu dersten daha kısa yayımlanmış bir süre varsa (yoksa sıradaki ders,
  // süresiz); "Gözlerin açık kalabilir." satırı her iki durumda kartta
  const shortest = publishedMinutes(L.n)[0]
  const shorter = hard === 'much' && end?.minutes != null && shortest != null && shortest < end.minutes
  const vis = visibleLessons(new Date())
  const i = vis.indexOf(L.n)
  const nextLesson = shorter ? L.n : vis.length > 1 ? vis[(i + 1) % vis.length] : null
  const nextMinutes = shorter ? shortest : null
  return (
    <main className="screen fade-in yg" style={{ '--yg-c': L.color.dark, '--yg-cl': L.color.light }}>
      <div className="yg-top" />
      <span className="yg-ey">{L.title}</span>
      <h1 className="yg-h">{YT.done.title}</h1>
      {mins != null && <p className="yg-p">{mins}{NBSP}dk{end?.section ? ` · ${end.section}` : ''}</p>}
      {Number.isFinite(before) && Number.isFinite(after) && L.measure && (
        <p className="yg-delta">{capFirst(L.measure)} {before} → {after}</p>
      )}
      {L.n === 4 && <p className="yg-p">{YT.done.lesson4}</p>}
      <Sources L={L} minutes={end?.minutes} title={YT.done.why} />
      {nextLesson != null && LESSONS[nextLesson] && (
        <button type="button" className="yg-card" style={{ '--yg-c': LESSONS[nextLesson].color.dark, '--yg-cl': LESSONS[nextLesson].color.light }} onClick={() => onOpen(nextLesson, nextMinutes)}>
          <span className="yg-card-bar" aria-hidden="true" />
          <span className="grow">
            <span className="yg-card-s">{YT.done.next}</span>
            <span className="yg-card-t">{LESSONS[nextLesson].title}{nextMinutes ? ` · ${nextMinutes}${NBSP}dk` : ''}</span>
            {hard === 'much' && <span className="yg-card-s">{YT.done.eyesOpen}</span>}
          </span>
          <ChevronRight className="chev" size={18} aria-hidden="true" />
        </button>
      )}
      <div className="grow" />
      <button type="button" className="btn" onClick={onOk}>{YT.done.ok}</button>
    </main>
  )
}

