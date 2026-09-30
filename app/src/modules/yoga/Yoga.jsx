import { useEffect, useRef, useState } from 'react'
import {
  Info, Sun, Moon, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, ArrowRight, BookOpen, ListOrdered, Bed, DoorOpen, Car,
  Stethoscope, ArrowUpFromLine, Volume1, VolumeX, LifeBuoy, Wind, Eye,
} from 'lucide-react'
import { isIOSApp, haptic } from '../../lib/native.js'
import {
  LESSONS, visibleLessons, publishedMinutes, pickMinutes, versionOf, sectionsOf, addedSections, minutesLabel,
  isNightHour, isPublished, POSTURE_LABEL, MUSIC_TAIL, THREE_MIN_LINE, SOURCES_FOOTER, OPENING_PERMISSION, OPENING_VEHICLE,
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
import LessonArt from './LessonArt.jsx'
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

// Dersin renkleri (yoga.css: --yg-c koyu ton, grafik ve koyu tema; --yg-cl açık tema tonu)
const tone = (L) => ({ '--yg-c': L.color.dark, '--yg-cl': L.color.light })

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
  // Her ekran baştan açılır (kütüphanede aşağı kaydırılıp derse girilince ayrıntı ortasından başlamasın)
  useEffect(() => {
    try { globalThis.scrollTo?.(0, 0) } catch { /* kaydırma yoksa (test) */ }
  }, [screen])
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
    // Kartın rengi: (i) ile ayrıntıdan açıldıysa o dersin, ilk girişte kütüphanede ilk görünecek dersin (renk tutarlı kalsın)
    const Ls = LESSONS[safetyBack === 'detail' && n != null ? n : visible[0]] ?? null
    return (
      <SafetyCard
        L={Ls}
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
    // Önce: ufuk dinlenirken, uygulamanın temasında. Sonra: oynatıcının karanlığında kalır ve yavaşça belirir (gözünü yeni
    // açana ani ışık yok); imge şafak (ışık yükselmiş), önceki puan ölçekte işaretli. Aynı soru iki ekranda (modul.md
    // §2.8 "aynen yeniden sorulur"); ekranlar bir bakışta ayrılır.
    const body = (
      <>
        <div className="yg-top">
          {isBefore && <button type="button" className="btn-icon" onClick={() => setScreen('detail')} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>}
        </div>
        <LessonArt form={L.form} color={L.color.dark} mood={isBefore ? 'rest' : 'dawn'} className="yg-rate-art" />
        <div className="grow" />
        <div className="yg-q">
          <span className="yg-ey"><b>{isBefore ? YT.rate.before : YT.rate.after}</b> · {L.title}</span>
          <h1 className="yg-h">{L.question}</h1>
        </div>
        <div className="yg-scale">
          <span className="yg-end">{L.ends?.[0]}</span>
          <Rate value={val} onChange={isBefore ? setBefore : setAfter} label={L.measure} was={isBefore ? null : before} />
          <span className="yg-end hi">{L.ends?.[1]}</span>
        </div>
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
          {/* "Atla" yalnız yazı: pasif "Devam" ile karışmasın, belirgin tek düğme "Devam" olsun */}
          <button type="button" className="yg-skip" onClick={() => (isBefore ? begin(null) : setScreen('hard'))}>{YT.rate.skip}</button>
        </div>
      </>
    )
    if (isBefore) return <main className="screen fade-in yg yg-rating is-before" style={tone(L)}>{body}</main>
    return <Night L={L} className="yg-rating is-after" slow>{body}</Night>
  }

  if (screen === 'stopped') {
    // Uyku dersinde uyandırma yok (modul.md §10.1, §10.2): uyandıran dönüş metni ve sesli dönüş yerine dersin kendi
    // gece satırı; sesli dönüş düğmesi çıkmaz
    const nightStop = LESSONS[end?.lesson ?? n]?.daypart === 'night'
    return (
      <main className="yg-dark yg-stop" aria-live="polite">
        <p className="yg-stop-t">{nightStop ? YT.stopped.night : YT.stopped.text}</p>
        <div className="yg-go">
          {VOICE_RETURN_FILE && !nightStop && <button type="button" className="btn btn-ghost" onClick={() => bridge.start({ file: VOICE_RETURN_FILE, at: 0, title: L?.title ?? YT.title, journal: false }).catch(() => {})}>{YT.stopped.voiceReturn}</button>}
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
    // Karanlıkta kalır (sonra puanı ya da durdurma ekranından gelinir; ikisi de karanlık)
    return (
      <Night L={L} className="yg-hard">
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
            : <button type="button" className="yg-skip" onClick={nextAfterHard}>{YT.hard.skip}</button>}
        </div>
      </Night>
    )
  }

  if (screen === 'done' && L) {
    return <Done L={L} end={end} before={before} after={after} hard={hard} onOpen={openLesson} onOk={exitFlow} />
  }

  return (
    <Library
      visible={visible}
      minutesOf={(k) => pickMinutes(k, opts.minutesByLesson[k])}
      onBack={onExit}
      onOpen={(k) => openLesson(k)}
    />
  )
}

// ---- Ekran parçaları ----

// Dersten hemen sonraki ekranlar (sonra puanı, zorlanma): temadan bağımsız karanlık (oynatıcının zemini). Dış katman
// zemini hemen boyar; iç ekran belirirken açık tema arkadan görünmez.
function Night({ L, className = '', slow = false, children }) {
  return (
    <main className="yg-night-wrap">
      <div className={`screen yg yg-night ${slow ? 'yg-slow-in' : 'fade-in'} ${className}`.trim()} style={L ? tone(L) : undefined}>{children}</div>
    </main>
  )
}

// 1–10: ızgara iki satır, yuvarlak düğmeler (320 px'te de 44 px'ten büyük); renk yoğunluğu 1'den 10'a artar, uç sözleri
// 1'in üstünde ve 10'un altında durur (ikinci satırın başı "hiç" sanılmasın). was: sonra puanında önceki puan (kesik
// halka ve altında "Önce"; VoiceOver "7 Önce" okur)
function Rate({ value, onChange, label, was = null }) {
  return (
    <div className="yg-rate" role="radiogroup" aria-label={label}>
      {Array.from({ length: RATE_MAX }, (_, k) => k + 1).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          className={v === was ? 'was' : undefined}
          style={{ '--k': `${Math.round(3 + ((v - 1) * 22) / (RATE_MAX - 1))}%` }}
          onClick={() => { onChange(v); haptic('tick') }}
        >
          {v}{v === was && <span className="yg-was"> {YT.rate.before}</span>}
        </button>
      ))}
    </div>
  )
}

// Güvenlik kartı (modul.md §2.2): beş madde simge + başlık + açıklama olarak (metin aynen); göz önce beş başlığı tarar.
// Sıra (5 saniye turu 2: "rahatlamak için gelmişken ilk okuduğum epilepsi ve 112"): önce dersin kendisiyle ilgili dört
// madde (bitirebilirsin, araç, yavaşça kalk, ses), sonra sağlık maddesi ve hemen altında "tedavi değildir · 112" notu;
// sağlıkla ilgili her şey bir arada. Metin text.js'te değişmedi, yalnız gösterim sırası. Simgeler maddeye bağlı; ders
// ayrıntısındaki açılış satırları aynı simgeleri taşır: kapı, araç, "kalk". Renk: dersin rengi (turkuaz değil).
const SAFETY_ICONS = [DoorOpen, Car, Stethoscope, ArrowUpFromLine, Volume1]
export const SAFETY_ORDER = [0, 1, 3, 4, 2]

export function SafetyCard({ L = null, onOk }) {
  const T = YT.safety
  const [over, setOver] = useState(false)
  // Liste ekrana sığmıyorsa (küçük ekran) alt şeridin üstünde ince bir çizgi: metin şeridin altına kayar, kesik görünmez.
  // Açılış kayması (fade-in, translateY) da sayfa boyuna sayılır: kayma bitince de bakılır (onAnimationEnd).
  const check = () => {
    const d = globalThis.document?.documentElement
    if (!d || !globalThis.innerHeight) return
    setOver(globalThis.scrollY + globalThis.innerHeight < d.scrollHeight - 2)
  }
  useEffect(() => {
    check()
    globalThis.addEventListener?.('scroll', check, { passive: true })
    globalThis.addEventListener?.('resize', check)
    // Yazı tipi yüklenince ya da metin boyu değişince sayfa boyu değişir; olay gelmez: gözlemci bakar
    const ro = typeof globalThis.ResizeObserver === 'function' ? new globalThis.ResizeObserver(check) : null
    if (ro && globalThis.document?.body) ro.observe(globalThis.document.body)
    return () => {
      globalThis.removeEventListener?.('scroll', check)
      globalThis.removeEventListener?.('resize', check)
      ro?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main className="screen fade-in yg yg-safety" style={L ? tone(L) : undefined} onAnimationEnd={check}>
      <h1 className="yg-h yg-h-lg">{T.title}</h1>
      <ul className="yg-list-i">
        {SAFETY_ORDER.map((i) => {
          const it = T.items[i]
          const Icon = SAFETY_ICONS[i] ?? Info
          return (
            <li key={it.h}>
              <span className="yg-ic" aria-hidden="true"><Icon size={16} /></span>
              <p className="yg-p"><b>{it.h}</b> {it.p}</p>
            </li>
          )
        })}
      </ul>
      <p className="note yg-safe-foot"><LifeBuoy size={16} aria-hidden="true" /><span>{T.footer} <b>{T.emergency}</b>.</span></p>
      <div className="grow" />
      {/* "Anladım" alt şeritte: liste uzun olsa da (320 px) hep görünür */}
      <div className={`yg-sticky${over ? ' over' : ''}`}>
        <button type="button" className="btn" onClick={onOk}>{T.ok}</button>
      </div>
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

function Library({ visible, minutesOf, onBack, onOpen }) {
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
  const solo = list.length === 1
  // Kart: dersin imgesi (oynatıcıda göreceği form) + ad, söz, süre ve duruş. Yayımlı tek ders varken kart dersi tanıtır:
  // tam adı (ör. "Derin Dinlenme (Yoga Nidra)": "Yoga" başlığının altında uzanarak dinlenmenin ne olduğu anlaşılsın) ve
  // bu derste sırasıyla neler olduğu (seçili sürenin bölümleri; ayrıntıdaki bölüm şeridiyle aynı adlar).
  return (
    <main className="screen fade-in yg yg-lib" style={list[0] ? tone(LESSONS[list[0]]) : undefined}>
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
      </div>
      <h1 className="yg-h yg-h-lg">{YT.libraryTitle}</h1>
      {filters.length > 0 && (
        <div className="yg-chips" role="radiogroup" aria-label={YT.libraryTitle}>
          {filters.map((f) => (
            <button key={f.id} type="button" role="radio" className="yg-chip" aria-checked={filter === f.id} onClick={() => setFilter(filter === f.id ? null : f.id)}>{f.label}</button>
          ))}
        </div>
      )}
      <div className={`yg-list${solo ? ' solo' : ''}`}>
        {list.map((k) => {
          const Lk = LESSONS[k]
          const flow = solo ? sectionsOf(k, minutesOf?.(k) ?? null) : []
          return (
            <button key={k} type="button" className="yg-card yg-poster" style={tone(Lk)} onClick={() => onOpen(k)}>
              <LessonArt form={Lk.form} color={Lk.color.dark} className="yg-poster-art" />
              <span className="yg-poster-body">
                <span className="yg-card-t">{solo ? Lk.fullTitle : Lk.title}</span>
                <span className="yg-card-s">{Lk.tagline}</span>
                <span className="yg-card-m"><DayIcon daypart={Lk.daypart} /> {minutesLabel(publishedMinutes(k))} · {POSTURE_LABEL[Lk.posture]}</span>
                {flow.length > 0 && (
                  <span className="yg-flow">
                    <span className="yg-flow-l">{YT.detail.sections}</span>
                    <span className="yg-flow-list">{flow.map((x) => <span key={x.id}>{x.label}</span>)}</span>
                  </span>
                )}
              </span>
              <span className="yg-go-dot" aria-hidden="true"><ArrowRight size={20} /></span>
            </button>
          )
        })}
      </div>
    </main>
  )
}

// 3 dakikada dersin genel etki cümlesi yazılmaz: kart yalnız Radin 2025'in kullanım bulgusunu ve "Üç dakikalık sürümün
// etkisini doğrudan sınayan bir çalışma bulamadık." cümlesini yazar (PLAN.v3 §A.2 kural 12; sure.md §10)
// Kapalı başlıkta kitap simgesi, kaynak sayısı sönük ve açılır ok: "(19)" bir liste olduğunu söylesin, dokunulabilir görünsün.
function Sources({ L, minutes, title = YT.detail.sources, className = '' }) {
  const lines = minutes === 3 ? [THREE_MIN_LINE] : [L.evidenceLine, L.evidenceByMinutes?.[minutes] ?? null].filter(Boolean)
  return (
    <details className={`yg-src ${className}`.trim()}>
      <summary>
        <BookOpen className="yg-src-ic" size={18} aria-hidden="true" />
        <span className="yg-src-t">{title} <span className="yg-src-n">({L.sources.length})</span></span>
        <ChevronDown className="yg-src-chev" size={18} aria-hidden="true" />
      </summary>
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

// Açılış satırının simgesi: izin ve araç satırları her derste aynı (güvenlik kartıyla aynı simge); üçüncü satır derse göre
function openingIcon(t, L) {
  if (t === OPENING_PERMISSION) return DoorOpen
  if (t.startsWith(OPENING_VEHICLE)) return Car
  if (L.posture === 'lie') return ArrowUpFromLine
  return L.form === 'point' ? Eye : Wind
}

// Ders ayrıntısı. İlk bakışta (320 px'te de): dersin imgesi, adı, sözü, süresi ve duruşu; hazırlık; "Başla"nın hemen
// üstünde açılış satırları (modul.md §2.4-12), simgeli ve sakin; "Başla". Bölümler ve kaynaklar düğmenin altında tek
// kartta (hazırlık ve açılış izni dersin sesinde de söyleniyor: ders2-15 0:19 ve 1:10). Tek süre yayımlıyken süre bir
// seçim değildir: çip yerine başlığın üstünde yazar (tek seçenekli seçici seçilebilir bir şey gibi görünüyordu).
function Detail({ L, minutes, prevMinutes, opts, onMinutes, onMusicTail, onBack, onSafety, onEvening, onStart, onLater = null }) {
  const [sleepOn, setSleepOn] = useState(false)
  useEffect(() => {
    let alive = true
    sleepSoundPlaying().then((on) => alive && setSleepOn(on))
    return () => { alive = false }
  }, [])
  const mins = publishedMinutes(L.n)
  const choose = mins.length > 1
  const sections = sectionsOf(L.n, minutes)
  const added = addedSections(L.n, prevMinutes, minutes)
  const addedIds = new Set(added.map((s) => s.id))
  const night = L.daypart === 'night'
  const evening = !night && isNightHour(new Date()) && publishedMinutes(3).length > 0 // Uykuya Geçiş yayımlanmışsa
  const prep = L.posture === 'lie' && L.preparation?.length > 0
  return (
    <main className="screen fade-in yg yg-detail" style={tone(L)}>
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
        <button type="button" className="btn-icon" onClick={onSafety} aria-label={YT.safety.open}><Info size={20} aria-hidden="true" /></button>
      </div>

      <section className="yg-poster yg-hero">
        <LessonArt form={L.form} color={L.color.dark} className="yg-poster-art" />
        <div className="yg-poster-body">
          <span className="yg-ey"><DayIcon daypart={L.daypart} /> {!choose && minutes != null ? `${minutes}${NBSP}dk · ` : ''}{POSTURE_LABEL[L.posture]}</span>
          <h1 className="yg-h">{L.fullTitle}</h1>
          <p className="yg-p">{L.tagline}</p>
        </div>
      </section>

      {choose && (
        <div className="yg-chips" role="radiogroup" aria-label={YT.detail.minutes}>
          {mins.map((m) => (
            <button key={m} type="button" role="radio" className="yg-chip" aria-checked={m === minutes} onClick={() => onMinutes(m)}>{m}{NBSP}dk</button>
          ))}
        </div>
      )}

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

      {prep && (
        <section className="yg-prep">
          <Bed className="yg-item-ic" size={18} aria-hidden="true" />
          <div className="yg-item-b">
            <span className="yg-lbl">{YT.detail.preparation}</span>
            <p>{L.preparation.join(' · ')}</p>
          </div>
        </section>
      )}

      <ul className="yg-open">
        {L.opening.map((t) => {
          const Icon = openingIcon(t, L)
          return <li key={t}><Icon size={16} aria-hidden="true" /><span>{t}</span></li>
        })}
        {sleepOn && <li><VolumeX size={16} aria-hidden="true" /><span>{YT.detail.sleepStops}</span></li>}
      </ul>
      {evening && <button type="button" className="link-btn yg-evening" onClick={onEvening}>{YT.detail.evening}</button>}
      <button type="button" className="btn" disabled={minutes == null} onClick={onStart}>{YT.detail.start}</button>
      {onLater && <button type="button" className="btn btn-ghost" onClick={onLater}>{YT.detail.later}</button>}

      {/* Merak edene: dersin bölümleri ve kaynakları (düğmenin altında; ilk bakışta ne, neden ve "Başla" görünsün) */}
      <div className="yg-group">
        {sections.length > 0 && (
          <div className="yg-item">
            <ListOrdered className="yg-item-ic" size={18} aria-hidden="true" />
            <div className="yg-item-b">
              <span className="yg-lbl">{YT.detail.sections}</span>
              {/* Ad bölünmez; ayraç önceki adın sonunda kalır (satır "·" ile başlamaz) */}
              <p className="yg-sections" role="group" aria-label={YT.detail.sections}>
                {sections.map((s, i) => (
                  <span key={s.id}>
                    <span className="yg-sec"><span className={addedIds.has(s.id) ? 'yg-add' : undefined}>{s.label}</span>{i < sections.length - 1 ? <span className="yg-sep">{' ·'}</span> : null}</span>
                    {i < sections.length - 1 ? ' ' : null}
                  </span>
                ))}
              </p>
              {added.length > 0 && <p className="yg-p small" role="status">{YT.detail.added(minutes, listTr(added.map((s) => s.label.toLocaleLowerCase('tr-TR'))))}</p>}
            </div>
          </div>
        )}
        <Sources L={L} minutes={minutes} className="yg-item" />
      </div>
    </main>
  )
}

// Önce → sonra, 1–10 çizgisinde: iki puan ve aralarındaki yol (yalnız görsel; sayılar üstteki satırda yazılı).
// "Önce" çizginin üstünde, "Sonra" altında: iki puan yan yana ya da aynıyken de etiketler çakışmaz.
function DeltaTrack({ before, after }) {
  const at = (v) => (v - 1) / (RATE_MAX - 1)
  const pos = (v) => `calc(22px + (100% - 44px) * ${at(v)})`
  const lo = Math.min(before, after)
  const hi = Math.max(before, after)
  return (
    <div className="yg-track" aria-hidden="true">
      <span className="yg-track-line" />
      {Array.from({ length: RATE_MAX }, (_, i) => <i key={i} className="yg-tick" style={{ left: pos(i + 1) }} />)}
      <span className="yg-track-seg" style={{ left: pos(lo), width: `calc((100% - 44px) * ${at(hi) - at(lo)})` }} />
      <span className="yg-mark was" style={{ left: pos(before) }}><em>{YT.rate.before}</em></span>
      <span className="yg-mark now" style={{ left: pos(after) }}><em>{YT.rate.after}</em></span>
    </div>
  )
}

function Done({ L, end, before, after, hard, onOpen, onOk }) {
  const rec = end?.rec
  const mins = rec ? Math.max(1, Math.round(rec.seconds / 60)) : null
  // "Çok" (modul.md §2.8, §2.9): öneri yalnız aynı dersin en kısa süresidir ve altında "Gözlerin açık kalabilir."; bu
  // dersin daha kısa yayımlanmış bir süresi yoksa öneri kartı hiç çıkmaz (başka bir ders ya da aynı süre önerilmez).
  // Öteki cevaplarda kütüphane sırasındaki sonraki ders, süresiz.
  const shortest = publishedMinutes(L.n)[0]
  const much = hard === 'much'
  const shorter = much && end?.minutes != null && shortest != null && shortest < end.minutes
  const vis = visibleLessons(new Date())
  const i = vis.indexOf(L.n)
  const nextLesson = much ? (shorter ? L.n : null) : vis.length > 1 ? vis[(i + 1) % vis.length] : null
  const nextMinutes = shorter ? shortest : null
  const rated = Number.isFinite(before) && Number.isFinite(after) && L.measure
  // Bitiş: dersin imgesi şafakta (oynatıcıdaki gündüz kapanışı gibi); kişinin kendi puanları öne çıkar, kutlama sözü yok
  // (puanlar "nasıl hissettin" gidişatıdır, etki kanıtı değildir; PLAN.v3 §D.5)
  return (
    <main className="screen fade-in yg yg-done" style={tone(L)}>
      <div className="yg-top" />
      <section className="yg-poster yg-hero">
        <LessonArt form={L.form} color={L.color.dark} mood="dawn" className="yg-poster-art" />
        <div className="yg-poster-body">
          <span className="yg-ey">{L.title}</span>
          <h1 className="yg-h">{YT.done.title}</h1>
          {mins != null && <p className="yg-p">{mins}{NBSP}dk{end?.section ? ` · ${end.section}` : ''}</p>}
        </div>
      </section>
      {rated && (
        <section className="yg-result">
          <p className="yg-delta">
            <span className="yg-delta-l">{capFirst(L.measure)}</span>{' '}
            <span className="yg-delta-n"><b>{before}</b>{' '}<span className="yg-arrow">→</span>{' '}<b>{after}</b></span>
          </p>
          <DeltaTrack before={before} after={after} />
        </section>
      )}
      {L.n === 4 && <p className="yg-p">{YT.done.lesson4}</p>}
      <Sources L={L} minutes={end?.minutes} title={YT.done.why} className="yg-card-src" />
      {nextLesson != null && LESSONS[nextLesson] && (
        <button type="button" className="yg-card yg-next" style={tone(LESSONS[nextLesson])} onClick={() => onOpen(nextLesson, nextMinutes)}>
          <span className="yg-card-bar" aria-hidden="true" />
          <span className="grow">
            <span className="yg-card-s">{YT.done.next}</span>
            <span className="yg-card-t">{LESSONS[nextLesson].title}{nextMinutes ? ` · ${nextMinutes}${NBSP}dk` : ''}</span>
            {much && <span className="yg-card-s">{YT.done.eyesOpen}</span>}
          </span>
          <ChevronRight className="chev" size={18} aria-hidden="true" />
        </button>
      )}
      <div className="grow" />
      <button type="button" className="btn" onClick={onOk}>{YT.done.ok}</button>
    </main>
  )
}
