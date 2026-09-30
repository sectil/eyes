import { useEffect, useRef, useState } from 'react'
import {
  Info, Sun, Moon, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, ArrowRight, BookOpen, DoorOpen, Car,
  Stethoscope, ArrowUpFromLine, Volume1, VolumeX, LifeBuoy, Wind, Eye, Check, AudioLines,
} from 'lucide-react'
import { isIOSApp, haptic } from '../../lib/native.js'
import {
  LESSONS, visibleLessons, publishedMinutes, pickMinutes, versionOf, sectionsOf, addedSections, minutesLabel,
  isNightHour, isPublished, POSTURE_LABEL, MUSIC_TAIL, THREE_MIN_LINE, SOURCES_FOOTER, OPENING_PERMISSION, OPENING_VEHICLE,
} from '../../lib/yogaLessons.js'
import { afterPatch, recordWriter, hasRating, isYoga } from '../../lib/yogaRecord.js'
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
import { Scene, HorizonScale, LessonPath, DiveList, SectionStrip, useTimeline, PrepIcon, prepKind, glueLast } from './YogaParts.jsx'
import { sectionAt } from './timeline.js'
import './yoga.css'

// Yoga ve Meditasyon (modul.md §2; PLAN.v3 §D.2): kütüphane → ders ayrıntısı → (ilk kez: güvenlik kartı ve ses
// denetimi) → önce puanı → oynatıcı → sonra puanı ve zorlanma sorusu → bitiş. X: durdurma ekranı → zorlanma sorusu.
// Görünüm: 5 saniye yeniden tasarımı (yoga-pilot/C_5SN_RAPORU.md): her ekran beş değerlendiricinin çoğunluğunun seçtiği
// yönde (A · B · C maketleri), önerdikleri aşılarla. Oynatıcı hep karanlık; öteki ekranlar iki temada (sonra puanı ve
// zorlanma sorusu dahil: modul.md §2, G3).
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
        // Geri: (i) ile açıldıysa ayrıntıya; ilk girişte Ana sayfaya (kart bir sonraki girişte yeniden çıkar)
        onBack={() => (opts.safetySeen ? setScreen(safetyBack) : onExit?.())}
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
    // Aynı soru iki ekranda (modul.md §2.8 "aynen yeniden sorulur"), ölçek iki ekranda birebir aynı (ölçümün geçerliği);
    // ekranlar bir bakışta ayrılır. Önce (yön A + B'nin göğü): ölçek ufkun kendisi, üstünde güneşi henüz doğmamış gök;
    // dersin yolu "Önce · ders · Sonra" ve neden sorulduğu. Sonra (yön B): üstte güneşi doğmuş sıcak şafak, yol tamam,
    // "Aynı soru, şimdi dersten sonra."; oynatıcının karanlığından temaya yavaşça açılır (Hareketi Azalt'ta hemen).
    // Önceki puan yalnız seçimden sonra: ölçekte içi boş halka ve altında tek satır (OZET.md §10; çıpalama yok).
    // "Devam" seçimle görünür; yeri baştan ayrılmıştır (ölçek kaymaz); "Atla" hep yazı.
    const showWas = !isBefore && Number.isFinite(before)
    return (
      <main className={`screen yg yg-rating ${isBefore ? 'is-before fade-in' : 'is-after yg-dawn-in'}`} style={tone(L)}>
        {isBefore
          ? <div className="yg-top"><button type="button" className="btn-icon" onClick={() => setScreen('detail')} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button></div>
          : <div className="yg-hero yg-rate-hero"><LessonScene L={L} mood="dawn" /></div>}
        <div className="grow yg-grow-top" />
        <LessonPath title={L.title} after={!isBefore} labels={YT.rate} />
        <div className="yg-q">
          <h1 className="yg-h">{L.question}</h1>
          <p className="yg-why">{isBefore ? YT.rate.why : YT.rate.again}</p>
        </div>
        <HorizonScale
          value={val}
          onChange={isBefore ? setBefore : setAfter}
          label={L.measure}
          ends={L.ends ?? []}
          was={showWas ? before : null}
          sky={isBefore && L.form === 'horizon'}
        />
        {showWas && (
          <p className="yg-was-line" aria-live="polite">{val != null ? <>{YT.rate.was} <b>{before}</b></> : null}</p>
        )}
        <div className="grow" />
        <div className="yg-go">
          <button
            type="button"
            className={`btn${val == null ? ' yg-wait' : ''}`}
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
          <button type="button" className="yg-skip" onClick={() => (isBefore ? begin(null) : setScreen('hard'))}>{YT.rate.skip}</button>
        </div>
      </main>
    )
  }

  if (screen === 'stopped') {
    // Uyku dersinde uyandırma yok (modul.md §10.1, §10.2): uyandıran dönüş metni ve sesli dönüş yerine dersin kendi
    // gece satırı; sesli dönüş düğmesi çıkmaz. Durdurma ekranı oynatıcının parçası: karanlık kalır.
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
    // Temada (modul.md §2: oynatıcı dışındaki her ekran iki temada). Durdurma ekranının karanlığından gelindiyse temaya
    // yavaşça açılır; sonra puanından gelindiyse zaten temada.
    return (
      <main className={`screen yg yg-hard ${end?.stopped ? 'yg-dawn-in' : 'fade-in'}`} style={L ? tone(L) : undefined}>
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
      </main>
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

// Dersin yeri: ufuk dersinde (Ders 2) iki temalı sahne (YogaParts Scene: gök, güneş, deniz); öteki formlarda dersin
// imgesi karanlık bir pencerede (LessonArt). mood: far · shore · dawn · done
function LessonScene({ L, mood = 'far', className = '' }) {
  if (L.form === 'horizon') return <Scene mood={mood} className={className} />
  return (
    <span className={`yg-scene yg-scene-art ${className}`.trim()} aria-hidden="true">
      <LessonArt form={L.form} color={L.color.dark} mood={mood === 'dawn' || mood === 'done' ? 'dawn' : 'rest'} />
    </span>
  )
}

// Uzanarak yapılan dersin kalkış satırı (açılış satırlarının üçüncüsü; onaylı metin aynen)
const riseLine = (L) => (L.posture === 'lie' ? L.opening.find((t) => t !== OPENING_PERMISSION && !t.startsWith(OPENING_VEHICLE)) ?? null : null)

// Güvenlik kartı (modul.md §2.2; yön A + B ve değerlendiricilerin aşıları). İlk bakışta beş ana cümle: dersle ilgili dört
// madde tek kartta, sağlık maddesi "tedavi değildir · 112" notuyla ayrı kartta (değerlendiriciler 1, 3, 5: acil numarası
// sahipsiz kalmıyor). Gövdeler açılır satırda (details/summary; VoiceOver açık ya da kapalı olduğunu okur): hiçbir madde
// gizlenmez, ana cümle hep görünür, gövde aynen (5 saniye turu 1–3: "metin duvarı"). Başlığın altında kartın en insani
// cümlesi, ilk maddenin gövdesinden aynen (2. değerlendirici). Geri düğmesi var; "Anladım" alt şeritte hep görünür.
// Renk: dersin rengi (turkuaz değil). Metin text.js'te değişmedi; yalnız sunuş ve sıra.
const SAFETY_ICONS = [DoorOpen, Car, Stethoscope, ArrowUpFromLine, Volume1]
export const SAFETY_ORDER = [0, 1, 3, 4, 2]
const SAFETY_HEALTH = 2 // sağlık maddesi (ayrı kartta, notla birlikte)
// İlk maddenin gövdesinin son cümlesi, aynen ("Dersi yarıda bırakmak da pratiğin bir parçası."): metinden türetilir
export const SAFETY_LEAD = YT.safety.items[0].p.match(/[^.;]+\.$/)?.[0]?.trim() ?? ''

function SafetyItem({ i }) {
  const it = YT.safety.items[i]
  const Icon = SAFETY_ICONS[i] ?? Info
  return (
    <li>
      <details className="yg-acc-i">
        <summary>
          <span className="yg-ic" aria-hidden="true"><Icon size={18} /></span>
          <b>{it.h}</b>
          <ChevronDown className="yg-acc-chev" size={18} aria-hidden="true" />
        </summary>
        {' '}
        <p>{it.p}</p>
      </details>
    </li>
  )
}

export function SafetyCard({ L = null, onOk, onBack }) {
  const T = YT.safety
  const [over, setOver] = useState(false)
  // Liste ekrana sığmıyorsa (küçük ekran ya da açılan madde) alt şeridin üstünde ince bir çizgi: metin şeridin altına
  // kayar, kesik görünmez. Açılış kayması da sayfa boyuna sayılır: kayma bitince de bakılır (onAnimationEnd).
  const check = () => {
    const d = globalThis.document?.documentElement
    if (!d || !globalThis.innerHeight) return
    setOver(globalThis.scrollY + globalThis.innerHeight < d.scrollHeight - 2)
  }
  useEffect(() => {
    check()
    globalThis.addEventListener?.('scroll', check, { passive: true })
    globalThis.addEventListener?.('resize', check)
    // Yazı tipi yüklenince, madde açılınca ya da metin boyu değişince sayfa boyu değişir; olay gelmez: gözlemci bakar
    const ro = typeof globalThis.ResizeObserver === 'function' ? new globalThis.ResizeObserver(check) : null
    if (ro && globalThis.document?.body) ro.observe(globalThis.document.body)
    return () => {
      globalThis.removeEventListener?.('scroll', check)
      globalThis.removeEventListener?.('resize', check)
      ro?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const brand = 'Nefona'
  const foot = T.footer.startsWith(brand) ? <><b className="yg-brand">{brand}</b>{T.footer.slice(brand.length)}</> : T.footer
  return (
    <main className="screen fade-in yg yg-safety" style={L ? tone(L) : undefined} onAnimationEnd={check}>
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
      </div>
      <header className="yg-safe-head">
        <h1 className="yg-h yg-h-lg">{T.title}</h1>
        <p className="yg-safe-lead">{SAFETY_LEAD}</p>
      </header>
      <ul className="yg-acc">
        {SAFETY_ORDER.filter((i) => i !== SAFETY_HEALTH).map((i) => <SafetyItem key={i} i={i} />)}
      </ul>
      <section className="yg-acc yg-acc-health">
        <ul>
          <SafetyItem i={SAFETY_HEALTH} />
        </ul>
        <p className="yg-safe-foot"><LifeBuoy size={18} aria-hidden="true" /><span>{foot} <b>{T.emergency}</b>.</span></p>
      </section>
      <div className="grow" />
      {/* "Anladım" alt şeritte: liste uzun olsa da (320 px, açılan madde) hep görünür */}
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

// Kütüphane. Yayımlı tek ders varken (yön B + değerlendiricilerin aşıları) kart dersi tanıtır: dersin yeri çerçeveli bir
// pencerede (açık temada beyaz kartın içinde, 2. değerlendirici; güneş ufukta, 1. ve 3. değerlendirici), süre ve duruş,
// tam ad, söz, derine inip geri çıkan bölüm yolu ve yazılı eylem "Derse git". Kartın tamamı tek düğme. Birden çok
// derste kartlar dersin karanlık imgesiyle (değişmedi).
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
          const meta = <span className="yg-card-m"><DayIcon daypart={Lk.daypart} /> {minutesLabel(publishedMinutes(k))} · {POSTURE_LABEL[Lk.posture]}</span>
          if (solo) {
            const flow = sectionsOf(k, minutesOf?.(k) ?? null)
            return (
              <button key={k} type="button" className="yg-card yg-feature" style={tone(Lk)} onClick={() => onOpen(k)}>
                <span className="yg-window"><LessonScene L={Lk} mood="far" /></span>
                <span className="yg-feature-body">
                  {meta}
                  <span className="yg-card-t">{Lk.fullTitle}</span>
                  <span className="yg-card-s">{Lk.tagline}</span>
                  {flow.length > 0 && (
                    <span className="yg-flow">
                      <span className="yg-flow-l">{YT.detail.sections}</span>
                      <DiveList sections={flow} />
                    </span>
                  )}
                  <span className="yg-card-go">{YT.library.open}<ArrowRight size={20} aria-hidden="true" /></span>
                </span>
              </button>
            )
          }
          return (
            <button key={k} type="button" className="yg-card yg-poster" style={tone(Lk)} onClick={() => onOpen(k)}>
              <LessonArt form={Lk.form} color={Lk.color.dark} className="yg-poster-art" />
              <span className="yg-poster-body">
                <span className="yg-card-t">{Lk.title}</span>
                <span className="yg-card-s">{Lk.tagline}</span>
                {meta}
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

// Ders ayrıntısı (yön B, beş değerlendiricinin de seçimi; aşılar). Üstte kenardan kenara dersin yeri (kıyıya varış;
// ayrıntıda daha kısa, 3. değerlendirici: "Başla" yukarı); süre, duruş ve dersin sesi; ad ve söz; hazırlık üç eşit karoda
// simgeyle (örtü, yastık, yüzey); "Başla"nın hemen üstünde açılış satırları tek sakin kartta (izin satırı davet gibi,
// ötekiler ikincil ama okunur; modul.md §2.4-12); "Başla"; hemen altında dersin 15 dakikalık biçimi: süreyle orantılı
// bölüm şeridi ve adları (yön C, değerlendiriciler 1, 2, 4, 5); sonra Kaynaklar. Kısa ekranda (≤ 700 px) hazırlık
// "Başla"nın altına iner (yoga.css; hazırlık dersin sesinde de söyleniyor, ders2-15 0:19). Tek süre yayımlıyken süre bir
// seçim değildir: çip yerine üst satırda yazar.
function Detail({ L, minutes, prevMinutes, opts, onMinutes, onMusicTail, onBack, onSafety, onEvening, onStart, onLater = null }) {
  const [sleepOn, setSleepOn] = useState(false)
  useEffect(() => {
    let alive = true
    sleepSoundPlaying().then((on) => alive && setSleepOn(on))
    return () => { alive = false }
  }, [])
  const mins = publishedMinutes(L.n)
  const choose = mins.length > 1
  const v = versionOf(L.n, minutes)
  const tl = useTimeline(v?.timeline ?? null)
  const sections = sectionsOf(L.n, minutes)
  const added = addedSections(L.n, prevMinutes, minutes)
  const addedIds = new Set(added.map((s) => s.id))
  const night = L.daypart === 'night'
  const evening = !night && isNightHour(new Date()) && publishedMinutes(3).length > 0 // Uykuya Geçiş yayımlanmışsa
  const prep = L.posture === 'lie' && L.preparation?.length > 0
  const voice = YT.voices[v?.voice] ?? null
  return (
    <main className="screen fade-in yg yg-detail" style={tone(L)}>
      <div className="yg-hero yg-detail-hero">
        <LessonScene L={L} mood="shore" />
        <div className="yg-top">
          <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" className="btn-icon" onClick={onSafety} aria-label={YT.safety.open}><Info size={20} aria-hidden="true" /></button>
        </div>
      </div>

      <div className="yg-head">
        <span className="yg-ey yg-meta">
          <span className="yg-meta-a"><DayIcon daypart={L.daypart} /> {!choose && minutes != null ? `${minutes}${NBSP}dk · ` : ''}{POSTURE_LABEL[L.posture]}</span>
          {voice && <span className="yg-meta-v"><span className="yg-meta-sep" aria-hidden="true">·</span><AudioLines size={15} aria-hidden="true" />{voice}</span>}
        </span>
        <h1 className="yg-h">{L.fullTitle}</h1>
        <p className="yg-p">{L.tagline}</p>
      </div>

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
        <section className="yg-prep" aria-label={YT.detail.preparation}>
          <span className="yg-lbl" aria-hidden="true">{YT.detail.preparation}</span>
          <ul className="yg-tiles">
            {L.preparation.map((t) => (
              <li key={t}><PrepIcon kind={prepKind(t)} /><span>{glueLast(t)}</span></li>
            ))}
          </ul>
        </section>
      )}

      <ul className="yg-open">
        {L.opening.map((t) => {
          const Icon = openingIcon(t, L)
          return <li key={t} className={t === OPENING_PERMISSION ? 'lead' : undefined}><Icon size={18} aria-hidden="true" /><span>{t}</span></li>
        })}
        {sleepOn && <li><VolumeX size={18} aria-hidden="true" /><span>{YT.detail.sleepStops}</span></li>}
      </ul>
      {evening && <button type="button" className="link-btn yg-evening" onClick={onEvening}>{YT.detail.evening}</button>}
      <button type="button" className="btn yg-start" disabled={minutes == null} onClick={onStart}>{YT.detail.start}</button>
      {onLater && <button type="button" className="btn btn-ghost yg-later" onClick={onLater}>{YT.detail.later}</button>}

      {/* Dersin biçimi: bölümler süreleriyle orantılı (şerit) ve adları sırasıyla */}
      {sections.length > 0 && (
        <section className="yg-shape">
          <span className="yg-lbl">{YT.detail.sections}</span>
          <SectionStrip sections={sections} tl={tl} />
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
        </section>
      )}
      <Sources L={L} minutes={minutes} className="yg-card-src" />
    </main>
  )
}

// Bitiş (yön A, beş değerlendiricinin de seçimi; aşılar). Üstte sıcak şafak (akıştaki ilk sıcak renk, kutlama sözü yok);
// "Ders bitti"; tek kayıt kartında dinlenen dakika, dolu bölüm şeridi ve ulaşılan bölüm (✓ Kapanış; 2. değerlendirici),
// altında önce → sonra: iki sayı kartın iki ucunda, aralarında uzun ok, "Sonra" dersin renginde (değerlendiriciler 1, 3,
// 5). Uzanarak yapılan derste onaylı kalkış satırı çerçeveli bir notta (4. değerlendirici). Puanlar "nasıl hissettin"
// gidişatıdır, etki kanıtı değildir (PLAN.v3 §D.5): "işe yaradı" gibi bir söz yok.
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
  const secs = sectionsOf(L.n, end?.minutes)
  const tl = useTimeline(versionOf(L.n, end?.minutes)?.timeline ?? null)
  const rise = riseLine(L)
  const measure = rated ? capFirst(L.measure) : null
  return (
    <main className="screen fade-in yg yg-done" style={tone(L)}>
      <div className="yg-hero yg-done-hero"><LessonScene L={L} mood="done" /></div>
      <div className="yg-head">
        <span className="yg-ey">{L.title}</span>
        <h1 className="yg-h yg-h-xl">{YT.done.title}</h1>
      </div>
      {(mins != null || rated) && (
        <section className="yg-record">
          {mins != null && (
            <div className="yg-rec-top">
              <p className="yg-rec-row">
                <span className="yg-rec-min">{mins}{NBSP}dk</span>
                {end?.section ? <><span className="yg-sr"> · </span><span className="yg-rec-end"><Check size={16} strokeWidth={2.6} aria-hidden="true" />{end.section}</span></> : null}
              </p>
              {secs.length > 0 && <SectionStrip sections={secs} tl={tl} full />}
            </div>
          )}
          {rated && (
            <div className="yg-result">
              <p className="yg-sr">{measure} {before} → {after}</p>
              <div className="yg-res" aria-hidden="true">
                <span className="yg-res-l">{measure}</span>
                <span className="yg-res-pair">
                  <span className="yg-res-v was"><b>{before}</b><small>{YT.rate.before}</small></span>
                  <span className="yg-res-arrow"><i /><ChevronRight size={22} strokeWidth={2.4} /></span>
                  <span className="yg-res-v now"><b>{after}</b><small>{YT.rate.after}</small></span>
                </span>
              </div>
            </div>
          )}
        </section>
      )}
      {rise && <p className="yg-rise"><ArrowUpFromLine size={18} aria-hidden="true" /><span>{rise}</span></p>}
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
