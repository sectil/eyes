import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  Info, Sun, Moon, ChevronLeft, ChevronRight, ChevronDown, ExternalLink, ArrowRight, BookOpen, DoorOpen, Car,
  Stethoscope, ArrowUpFromLine, Volume1, VolumeX, LifeBuoy, Check, Clock3, Armchair, Plus,
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
import { Scene, HorizonScale, LessonPath, SectionStrip, useTimeline, PrepIcon, prepKind, glueLast } from './YogaParts.jsx'
import { sectionAt } from './timeline.js'
import './yoga.css'

// Yoga ve Meditasyon (modul.md §2): (ilk girişte bir kez: güvenlik kartı) → kütüphane → ders ayrıntısı → (ilk derste:
// ses denetimi) → önce puanı → oynatıcı → sonra puanı, altında zorlanma satırı → bitiş. X: durdurma ekranı → zorlanma
// satırı. Sahip kararları 19–20 (SAHIP_ISTEKLERI.md; C_5SN_RAPORU.md "Sahip kararları 19–20").
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
function YogaFlow({ route = 'yoga', sessions = [], profile = null, store, onRefresh, onExit, pathMinutes = null, remindField = null }) {
  const [opts, setOpts] = useState(() => loadYogaOpts())
  const fromPath = lessonFromRoute(route)
  const visible = visibleLessons(new Date())
  const startLesson = fromPath != null && visible.includes(fromPath) ? fromPath : null
  const running = currentLesson()
  const [n, setN] = useState(() => running?.lesson ?? startLesson)
  // Güvenlik kartı yogaya İLK GİRİŞTE bir kez (sahip kararı 19, "İlk girişte bir kez"; modul.md §2.2): kütüphaneden de
  // yoldan (yoga-<ders>) da girilse ilk ekran karttır. "Anladım" girilen yere (kütüphane ya da ayrıntı) geçer; ilk girişte
  // "Geri" Ana sayfaya döner ve kart bir sonraki girişte yeniden çıkar. Kart onaylanmadan ders başlamaz. Kapı turu 1'de
  // kart ilk "Başla"ya taşınmıştı (C_5SN_RAPORU.md §12); sahip girişi seçti, ayrıntıdaki uyarılar bu yüzden kalktı.
  const [screen, setScreen] = useState(() => (running ? 'play' : !opts.safetySeen ? 'safety' : startLesson ? 'detail' : 'library'))
  const [safetyBack, setSafetyBack] = useState(() => (startLesson ? 'detail' : 'library'))
  const [safetyEntry, setSafetyEntry] = useState(() => !running && !opts.safetySeen) // ilk giriş kartı: Geri Ana sayfaya
  const [safetyGo, setSafetyGo] = useState(false) // kart "Başla"dan açıldı (yedek yol): "Anladım" başlatma zincirini sürdürür
  const [minutes, setMinutes] = useState(() => (startLesson ? pickMinutes(startLesson, pathMinutes ?? opts.minutesByLesson[startLesson]) : null))
  const [prevMinutes, setPrevMinutes] = useState(null)
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  // Sonra puanı soruldu mu: null (ölçek bekliyor) · 'rated' ("Devam") · 'skipped' ("Atla"). Soruldukça zorlanma satırı
  // ölçeğin altına iner (sahip kararı 20); aynı ekran, ayrı zorlanma ekranı yok.
  const [rateStep, setRateStep] = useState(null)
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
    setRateStep(null)
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
    // Yedek: kart ilk girişte görülür; bir yoldan görülmeden "Başla"ya ulaşılırsa da ders ondan önce başlamaz. "Anladım"
    // aynı zinciri sürdürür (ses ve ders yine bir dokunuşun içinde başlar).
    if (!opts.safetySeen) {
      setSafetyBack('detail')
      setSafetyEntry(false) // buradan açılan kartta Geri ayrıntıya
      setSafetyGo(true)
      return setScreen('safety')
    }
    startChain()
  }
  function startChain() {
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
    setRateStep(null)
    setHard(null)
    if (stopped) setScreen('stopped')
    else if (Ls.daypart === 'night') setScreen('sleep-end')
    else if (!rec) setScreen('done')
    else setScreen(hasRating(s.lesson) ? 'after' : 'hard')
  }

  // Zorlanma satırı (modul.md §2.8, §11.F; sahip kararı 20): "Hayır" ve "Biraz" yazılır ve akış sürer; "Çok" yazılır,
  // metni görünür, "Devam" ile sürer; "Atla" hiçbir cevap yazmaz (önce "Çok" seçildiyse o da silinir) ve akış sürer.
  // Cevapların kayıttaki anlamı değişmedi (hard: no · some · much; yok = atlandı).
  function answerHard(h) {
    const was = hard
    setHard(h)
    if (end?.rec && (h || was)) {
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
  // Sonra puanı: "Devam" puanı yazar, "Atla" yazmaz; ikisinde de ekran değişmez, zorlanma satırı ölçeğin altına iner
  function settleAfter(rated) {
    if (rated) {
      writerRef.current?.patch(afterPatch(end?.rec, { after }))
      if (end?.rec) onRefresh?.() // Gelişim'deki önce → sonra etkisi hemen güncel
    } else setAfter(null) // atlandı: bitişte seçilip yazılmamış bir puan görünmesin
    setRateStep(rated ? 'rated' : 'skipped')
  }
  // "Çok" metni, dersin nasıl bittiğine ve daha kısa yayımlanmış süre olup olmadığına göre (modul.md §2.8, §10.3-c)
  const muchNote = () => {
    const shorter = end ? shorterOf(end.lesson, end.minutes) != null : true
    if (end?.stopped) return shorter ? YT.hard.muchStopped : YT.hard.muchStoppedNoShorter
    return shorter ? YT.hard.muchFinished : YT.hard.muchFinishedNoShorter
  }

  const flashSafe = profileSignals(profile).flashSafe

  if (screen === 'safety') {
    // Kartın rengi: açıldığı dersin (ayrıntıdan gelinir: "Başla" ya da "Başlamadan önce" düğmesi)
    const Ls = LESSONS[n ?? visible[0]] ?? null
    return (
      <SafetyCard
        L={Ls}
        onOk={() => {
          if (!opts.safetySeen) update({ safetySeen: true })
          setSafetyEntry(false)
          if (safetyGo) {
            setSafetyGo(false)
            startChain() // "Başla"dan gelindi: ses denetimi ya da önce puanı (bu dokunuşun içinde)
          } else setScreen(safetyBack)
        }}
        // Geri: ilk giriş kartında Ana sayfaya (kart onaylanmadı: bir sonraki girişte yeniden çıkar); ayrıntıdan
        // açıldıysa ayrıntıya
        onBack={() => {
          setSafetyGo(false)
          if (safetyEntry) return onExit?.()
          setScreen(safetyBack)
        }}
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
        // Yoldan açılan derste kütüphane kapağı görülmedi: dersin sözü ayrıntıda yazılır (kapaktan gelinince tekrar olmasın)
        intro={fromPath != null}
        // "Başlamadan önce" kartı ayrıntıdan her zaman açılır (sahip kararı 19; modul.md §2.2 "yeniden açılır")
        onSafety={() => { setSafetyBack('detail'); setSafetyGo(false); setSafetyEntry(false); setScreen('safety') }}
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
    // Sonra puanında "Devam" ya da "Atla"dan sonra ekran değişmez: ölçek yerinde kalır (verilen puan sönük, artık
    // değişmez) ve zorlanma sorusu "Devam · Atla"nın yerine, ölçeğin altına tek satır olarak iner (sahip kararı 20).
    const showWas = !isBefore && Number.isFinite(before)
    const asked = !isBefore && rateStep != null
    return (
      <main className={`screen yg yg-rating ${isBefore ? 'is-before fade-in' : 'is-after yg-dawn-in'}${asked ? ' is-asked' : ''}${asked && hard === 'much' ? ' is-much' : ''}`} style={tone(L)}>
        {isBefore
          ? <div className="yg-top"><button type="button" className="btn-icon" onClick={() => setScreen('detail')} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button></div>
          : <div className="yg-hero yg-rate-hero"><LessonScene L={L} mood="dawn" /></div>}
        {/* Önce: dersin yolu en üstte, adım göstergesi gibi (kapı turu 1: "ekranın üst %40'ı boş"); gök arada kalır */}
        {isBefore && <LessonPath title={L.title} labels={YT.rate} />}
        <div className="grow yg-grow-top" />
        {!isBefore && <LessonPath title={L.title} after labels={YT.rate} />}
        <div className="yg-q">
          <h1 className="yg-h">{L.question}</h1>
          <p className="yg-why">{isBefore ? YT.rate.why : YT.rate.again}</p>
        </div>
        {/* Önce: soru üstte okunur, gök soru ile ufuk (ölçek) arasında; ölçek başparmağa yakın */}
        {isBefore && <div className="grow yg-grow-mid" />}
        <HorizonScale
          value={val}
          onChange={isBefore ? setBefore : setAfter}
          label={L.measure}
          ends={L.ends ?? []}
          was={showWas ? before : null}
          sky={isBefore && L.form === 'horizon'}
          disabled={asked}
        />
        {showWas && (
          <p className="yg-was-line" aria-live="polite">{val != null ? <>{YT.rate.was} <b>{before}</b></> : null}</p>
        )}
        <div className="grow yg-grow-bot" />
        {asked ? (
          <HardRow value={hard} note={muchNote()} onAnswer={answerHard} onNext={nextAfterHard} arrive />
        ) : (
          <div className="yg-go">
            <button
              type="button"
              className={`btn${val == null ? ' yg-wait' : ''}`}
              disabled={val == null}
              onClick={() => (isBefore ? begin(before) : settleAfter(true))}
            >{YT.rate.next}</button>
            <button type="button" className="yg-skip" onClick={() => (isBefore ? begin(null) : settleAfter(false))}>{YT.rate.skip}</button>
          </div>
        )}
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
    // Yalnız zorlanma sorusunun sorulduğu durum: ders 30 sn'yi geçti ve X → "Tamam" ile bitti (modul.md §2.7), ya da
    // puan sorusu olmayan bir gündüz dersi bitti. Sonra puanının altındaki satırın aynısı (sahip kararı 20); ayrı büyük
    // bir soru ekranı değil. Temada (modul.md §2); durdurma ekranının karanlığından gelindiyse temaya yavaşça açılır.
    // Üstte dersin yeri ekranın boşluğunu doldurur (durdurduysa kıyı: kapanışa ulaşılmadı; bitirdiyse şafak ve dersin
    // yolu), satır başparmağa yakın (kapı turu 3: "adım çizgisiyle soru arasında kocaman bir boşluk").
    const stopped = Boolean(end?.stopped)
    return (
      <main className={`screen yg yg-hard${hard === 'much' ? ' is-much' : ''} ${stopped ? 'yg-dawn-in' : 'fade-in'}`} style={L ? tone(L) : undefined}>
        {L && <div className="yg-hero yg-rate-hero"><LessonScene L={L} mood={stopped ? 'shore' : 'dawn'} /></div>}
        {L && !stopped && <LessonPath title={L.title} after labels={YT.rate} />}
        <HardRow value={hard} note={muchNote()} onAnswer={answerHard} onNext={nextAfterHard} solo />
      </main>
    )
  }

  if (screen === 'done' && L) {
    return <Done L={L} end={end} before={before} after={after} hard={hard} onOpen={openLesson} onOk={exitFlow} remindField={remindField} />
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

// Uzanarak yapılan dersin kalkış satırı (açılış satırlarının üçüncüsü; onaylı metin aynen). Ayrıntıdan kalktı (sahip
// kararı 19); bitişte çerçeveli notta ve güvenlik kartının "Yavaşça kalk." maddesinde duruyor.
const riseLine = (L) => (L.posture === 'lie' ? L.opening.find((t) => t !== OPENING_PERMISSION && !t.startsWith(OPENING_VEHICLE)) ?? null : null)
// Derse özel araç satırı: ortak araç satırının ardına eklenen cümle, aynen (yalnız Uykuya Geçiş: "Bu dersten hemen sonra
// araç kullanma."). Ortak araç satırı ayrıntıdan kalktı; kartın "Araç kullanırken açma." maddesi aynı şeyi söylüyor.
export const vehicleExtra = (L) => L.opening.find((t) => t.startsWith(OPENING_VEHICLE) && t.length > OPENING_VEHICLE.length)?.slice(OPENING_VEHICLE.length).trim() || null

// Alt şeridin üstündeki ince çizgi: içerik şeridin altına kayıyorsa (küçük ekran, açılan madde) görünür; sığıyorsa yok.
// Açılış kayması da sayfa boyuna sayılır: kayma bitince de bakılır (check'i onAnimationEnd'e ver).
function useStickyOver() {
  const [over, setOver] = useState(false)
  const check = useCallback(() => {
    const d = globalThis.document?.documentElement
    if (!d || !globalThis.innerHeight) return
    setOver(globalThis.scrollY + globalThis.innerHeight < d.scrollHeight - 2)
  }, [])
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
  }, [check])
  return [over, check]
}

// Öğeyi görünüme getirir (Hareketi Azalt'ta kaymadan); jsdom ve eski WebView'da yöntem yoksa hiçbir şey yapmaz
const reduceMotion = () => { try { return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) } catch { return false } }
const bringIntoView = (el, block = 'nearest') => { try { el?.scrollIntoView?.({ block, behavior: reduceMotion() ? 'auto' : 'smooth' }) } catch { /* yok */ } }

// Zorlanma satırı (sahip kararı 20; modul.md §2.8, §11.F). Sonra puanının altında (ve yalnız zorlanma sorusunun sorulduğu
// durumda tek başına) aynı satır: onaylı soru ("Derste kendini kötü hissettin mi?"), üç eşit hap seçenek (Hayır · Biraz ·
// Çok) ve hep görünen "Atla". Güvenlik okumasının yerleşim notları: ölçeğin altındaki "Aynı soru, şimdi dersten sonra."
// satırından boşluk ve ince bir ayraçla ayrılır, seçenek biçimi ölçekten farklıdır (ufuk çizgisindeki duraklar değil,
// haplar); "Çok" metni açıkça okunur boyutta, kendi kutusunda, "Devam" hemen altında (çıkış engellenmez). Ekrana inince
// VoiceOver odağı soruya gelir; "Çok" seçilince metin ve "Devam" görünüme kayar (Hareketi Azalt'ta kaymadan).
// solo: yalnız bu soru (başlık h1); yoksa sonra puanının altında (h2). arrive: satır ekrana şimdi indi (odak ve kayma).
function HardRow({ value, note, onAnswer, onNext, solo = false, arrive = false }) {
  const T = YT.hard
  const id = useId()
  const qRef = useRef(null)
  const goRef = useRef(null)
  const much = value === 'much'
  useEffect(() => {
    if (!arrive) return
    try { qRef.current?.focus?.({ preventScroll: true }) } catch { /* odak yoksa */ }
    bringIntoView(qRef.current?.parentNode, 'nearest')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (much) bringIntoView(goRef.current, 'end')
  }, [much])
  const Q = solo ? 'h1' : 'h2'
  return (
    <>
      <section className={`yg-hardrow${solo ? ' solo' : ''}`} aria-labelledby={`${id}-q`}>
        <Q id={`${id}-q`} ref={qRef} tabIndex={-1} className="yg-hardrow-q">{T.question}</Q>
        <div className="yg-hardrow-line">
          <div className="yg-hard-opts" role="radiogroup" aria-label={T.question}>
            {T.options.map((o) => (
              <button key={o.id} type="button" role="radio" className="yg-hard-o" aria-checked={value === o.id} onClick={() => onAnswer(o.id)}>{o.label}</button>
            ))}
          </div>
          <button type="button" className="yg-skip yg-hardrow-skip" onClick={() => onAnswer(null)}>{T.skip}</button>
        </div>
        {much && <p className="yg-note yg-much" role="status"><LifeBuoy size={18} aria-hidden="true" /><span>{note}</span></p>}
      </section>
      {much && (
        <div className="yg-go" ref={goRef}>
          <button type="button" className="btn" onClick={onNext}>{T.next}</button>
        </div>
      )}
    </>
  )
}

// Güvenlik kartı (modul.md §2.2): yogaya ilk girişte bir kez; ayrıntıdaki "Başlamadan önce ›" satırıyla her zaman yeniden
// (sahip kararı 19). Kapı turu 2 (beş değerlendiricinin beşi: "ayarlar menüsü / kullanım koşulları gibi",
// "her satırdaki aşağı ok gizli yazı var mı diye tedirgin ediyor", "112 ile 'Sesi kısık tut' aynı seviyede"): beş eşit
// akordeon satırı yerine ayrıntıdaki hazırlık karolarıyla aynı dilde karolar. İlk madde ("İstediğin an dersi
// bitirebilirsin.") geniş, dersin renginde bir davet karosu; öteki dördü iki sütunda kısa karolar; sağlık maddesi en sonda
// ve hemen altında "tedavi değildir · 112" notu, karoların dışında, tek başına (acil numarası bir madde gibi okunmasın).
// Gövdeler açılır ayrıntıda (details/summary; VoiceOver açık ya da kapalı olduğunu okur); açılan karo tam genişliğe yayılır.
// Hiçbir madde gizlenmez, ana cümle hep görünür, gövde aynen. Başlığın altında ilk maddenin gövdesinin son cümlesi, aynen.
// Geri düğmesi var; "Anladım" alt şeritte hep görünür. Metin text.js'te değişmedi; yalnız sunuş, sıra ve vurgu.
const SAFETY_ICONS = [DoorOpen, Car, Stethoscope, ArrowUpFromLine, Volume1]
export const SAFETY_ORDER = [0, 1, 3, 4, 2]
// İlk maddenin gövdesinin son cümlesi, aynen ("Dersi yarıda bırakmak da pratiğin bir parçası."): metinden türetilir
export const SAFETY_LEAD = YT.safety.items[0].p.match(/[^.;]+\.$/)?.[0]?.trim() ?? ''

function SafetyItem({ i, wide = false, open = false, onToggle }) {
  const it = YT.safety.items[i]
  const Icon = SAFETY_ICONS[i] ?? Info
  return (
    <li className={`yg-tile${wide ? ' wide' : ''}${open ? ' open' : ''}`}>
      <details className="yg-acc-i" onToggle={(e) => onToggle?.(i, e.currentTarget.open)}>
        <summary>
          <span className="yg-ic" aria-hidden="true"><Icon size={18} /></span>
          <b>{it.h}</b>
          <Plus className="yg-acc-chev" size={16} strokeWidth={2.4} aria-hidden="true" />
        </summary>
        {' '}
        <p>{it.p}</p>
      </details>
    </li>
  )
}

export function SafetyCard({ L = null, onOk, onBack }) {
  const T = YT.safety
  // Liste ekrana sığmıyorsa (küçük ekran ya da açılan madde) alt şeridin üstünde ince bir çizgi: metin şeridin altına
  // kayar, kesik görünmez
  const [over, check] = useStickyOver()
  const [open, setOpen] = useState(() => new Set())
  const toggle = (i, on) => setOpen((s) => {
    const n = new Set(s)
    if (on) n.add(i)
    else n.delete(i)
    return n
  })
  return (
    <main className="screen fade-in yg yg-safety" style={L ? tone(L) : undefined} onAnimationEnd={check}>
      {/* Üstte ayrıntıdaki aynı yer, kısa (kartın ayrı bir "kullanım koşulları" sayfası gibi değil, dersin kapısında
          açıldığı görünsün); kısa ekranda yalnız Geri */}
      <div className={L ? 'yg-hero yg-safe-hero' : undefined}>
        {L && <LessonScene L={L} mood="shore" />}
        <div className="yg-top">
          <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
        </div>
      </div>
      <header className="yg-safe-head">
        <h1 className="yg-h yg-h-lg">{T.title}</h1>
        <p className="yg-safe-lead">{SAFETY_LEAD}</p>
      </header>
      <ul className="yg-safe-grid">
        {SAFETY_ORDER.map((i, k) => <SafetyItem key={i} i={i} wide={k === 0} open={open.has(i)} onToggle={toggle} />)}
      </ul>
      <p className="yg-safe-foot"><LifeBuoy size={18} aria-hidden="true" /><span>{T.footer} <b>{T.emergency}</b>.</span></p>
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

// Gündüz ya da gece: simge ve adı (renk ya da simge tek başına bilgi taşımaz). shown: ad yazılı ("☀ Gündüz"; kapı turu
// 1: "güneş simgesi ilk bakışta hiçbir şey anlatmıyor"); yoksa yalnız VoiceOver için. Ad süzgeç çipleriyle aynı söz.
// rest: adın ardından aynı satırda yazılan ("· 15 dk · Uzanarak"; ad yazılıysa onunla tek parça, araya fazla boşluk girmez)
function DayIcon({ daypart, shown = false, rest = '' }) {
  const night = daypart === 'night'
  const name = night ? YT.detail.night : YT.detail.day
  return (
    <>
      {night ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
      {shown ? <span>{name}{rest ? ` · ${rest}` : ''}</span> : <><span className="yg-sr">{name}</span><span>{rest}</span></>}
    </>
  )
}

// Dersin iki pratik bilgisi iri, simgeli iki etikette: süre ve duruş (kapı turu 2: "en işe yarar bilgi resmin altında
// küçük, ince bir satırda kalmış"). Gündüz ya da gece yalnız VoiceOver'da okunur: "Gündüz" yazılıyken iki değerlendirici
// "gece yapamaz mıyım?" diye okudu; tek derste ayırt edici değil ve dersin yeri güneşiyle zaten gündüz. VoiceOver ve metin
// "Gündüz · 15 dk · Uzanarak" okur. minutes yoksa (süre çiplerle seçiliyorsa) yalnız duruş. plain: ayrıntıda çerçevesiz,
// sakin tek satır (kapı turu 3: ayrıntının üstü "kapağın aynısı: aynı başlık, aynı iki çip").
function Facts({ L, minutes = null, plain = false }) {
  return (
    <span className={`yg-facts${plain ? ' plain' : ''}`}>
      <span className="yg-sr">{L.daypart === 'night' ? YT.detail.night : YT.detail.day} · </span>
      {minutes ? <><span className="yg-fact"><Clock3 size={16} aria-hidden="true" />{minutes}</span><span className="yg-sr"> · </span></> : null}
      <span className="yg-fact">{L.posture === 'lie' ? <PrepIcon kind="mat" size={17} /> : <Armchair size={16} aria-hidden="true" />}{POSTURE_LABEL[L.posture]}</span>
    </span>
  )
}

// Kütüphane: Yoga'nın giriş ekranı (ilk girişte güvenlik kartından sonra). Birden çok ders varken liste: dersin
// karanlık imgeli kartları (değişmedi). Yayımlı tek ders varken liste değil, dersin KAPAĞI (kapı turu 2, beş
// değerlendiricinin beşi: "kütüphane diye açılan yerde tek kart: boş raf, 'başka ders yok mu?'", "resim ekranın yarısını
// yiyor ama bilgi vermiyor", "açık temada güneş kayboluyor", "başlık bağırıyor"): dersin yeri kenardan kenara bütün ekranın
// zemini (aynı kıyı, güneş ufukta); üstte Geri ve küçük "Yoga ve Meditasyon" adı; altta, başparmağa yakın dersin tam adı,
// sözü, süre ve duruş etiketleri ve yazılı eylem "Derse git". Listeye benzemediği için "aşağıda başka ders var mı?" diye
// sordurmaz. Metinler aynı. Kapağın yazılı bölümü tek düğme.
function Library({ visible, onBack, onOpen }) {
  const [filter, setFilter] = useState(null)
  const filters = [
    { id: 'day', label: YT.filters.day, ok: (n) => LESSONS[n].daypart === 'day' },
    { id: 'night', label: YT.filters.night, ok: (n) => LESSONS[n].daypart === 'night' },
    { id: 'three', label: YT.filters.three, ok: (n) => publishedMinutes(n).includes(3) },
  ].filter((f) => {
    const hits = visible.filter(f.ok).length
    return hits > 0 && hits < visible.length // yalnız listeyi gerçekten daraltan süzgeç; tek süzgeç kalırsa satır hiç çizilmez (5 sn: "tek hap filtre mi etiket mi")
  })
  const active = filters.find((f) => f.id === filter)
  const list = active ? visible.filter(active.ok) : visible
  if (visible.length === 1) {
    const k = visible[0]
    const Lk = LESSONS[k]
    return (
      <main className="screen fade-in yg yg-lib yg-cover" style={tone(Lk)}>
        <span className="yg-cover-scene" aria-hidden="true"><LessonScene L={Lk} mood="far" /></span>
        <div className="yg-top yg-cover-top">
          <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
          <h1 className="yg-cover-h">{YT.libraryTitle}</h1>
        </div>
        <div className="grow" />
        <button type="button" className="yg-card yg-feature" onClick={() => onOpen(k)}>
          <span className="yg-card-t">{Lk.fullTitle}</span>
          <span className="yg-card-s">{Lk.tagline}</span>
          <Facts L={Lk} minutes={minutesLabel(publishedMinutes(k))} />
          <span className="yg-card-go">{YT.library.open}<ArrowRight size={20} aria-hidden="true" /></span>
        </button>
      </main>
    )
  }
  const solo = list.length === 1
  return (
    <main className="screen fade-in yg yg-lib" style={list[0] ? tone(LESSONS[list[0]]) : undefined}>
      <div className="yg-top">
        <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
      </div>
      <h1 className="yg-h yg-h-lg">{YT.libraryTitle}</h1>
      {filters.length > 1 && (
        <div className="yg-chips" role="radiogroup" aria-label={YT.libraryTitle}>
          {filters.map((f) => (
            <button key={f.id} type="button" role="radio" className="yg-chip" aria-checked={filter === f.id} onClick={() => setFilter(filter === f.id ? null : f.id)}>{f.label}</button>
          ))}
        </div>
      )}
      <div className={`yg-list${solo ? ' solo' : ''}`}>
        {list.map((k) => {
          const Lk = LESSONS[k]
          const meta = <span className="yg-card-m"><DayIcon daypart={Lk.daypart} shown={solo} rest={`${minutesLabel(publishedMinutes(k))} · ${POSTURE_LABEL[Lk.posture]}`} /></span>
          if (solo) {
            return (
              <button key={k} type="button" className="yg-card yg-feature" style={tone(Lk)} onClick={() => onOpen(k)}>
                <span className="yg-window"><LessonScene L={Lk} mood="far" /></span>
                <span className="yg-feature-body">
                  {meta}
                  <span className="yg-card-t">{Lk.fullTitle}</span>
                  <span className="yg-card-s">{Lk.tagline}</span>
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
// withLines: kanıt cümleleri açılır kartın içinde (bitiş); ayrıntıda cümleler kartın üstünde açıkta (Basis), içeride yalnız liste.
const evidenceOf = (L, minutes) => (minutes === 3 ? [THREE_MIN_LINE] : [L.evidenceLine, L.evidenceByMinutes?.[minutes] ?? null].filter(Boolean))
function Sources({ L, minutes, title = YT.detail.sources, className = '', withLines = true }) {
  const lines = withLines ? evidenceOf(L, minutes) : []
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

// "Neye dayanıyor" (ayrıntı): dersin kanıt cümlesi kartın üstünde açıkta, kaynak listesi altında açılır (sahip kararı 19
// ve kapı turu 3: ayrıntıda uyarılar yerine dersin içeriği öne). Metin aynen; yalnız cümlenin kendi başındaki "Neye
// dayanıyor:" kalın (etiket gibi okunsun). 3 dakikada yalnız Radin 2025 satırı (PLAN.v3 §A.2 kural 12).
const BASIS_LEAD = 'Neye dayanıyor:'
function Basis({ L, minutes }) {
  return (
    <section className="yg-basis">
      {evidenceOf(L, minutes).map((t) => (
        <p key={t} className="yg-basis-t">{t.startsWith(BASIS_LEAD) ? <><b>{BASIS_LEAD}</b>{t.slice(BASIS_LEAD.length)}</> : t}</p>
      ))}
      <Sources L={L} minutes={minutes} withLines={false} />
    </section>
  )
}

// Ders ayrıntısı. Sahip kararı 19 ve kapı turu 3 (ayrıntı 1/5: "üst yarı kapağın neredeyse aynısı", "'Derse git'e bastım,
// ilerlemiş gibi hissetmiyorum", "Başla'nın çevresinde üç uyarı cümlesi, bir sonraki ekranda aynen tekrar"):
// - Üst kısım sıkıştı: dersin yeri kısa bir şerit (güneş yarı doğmuş: kapaktaki ufuktan bir adım ileri), ad daha küçük,
//   süre ve duruş çerçevesiz tek satır. Dersin sözü yalnız yoldan açılınca (kapak görülmedi; intro).
// - Dersin içeriği öne: süre seçimi (birden çok süre yayımlıysa), bölümler (şerit ve adlar), "Neye dayanıyor" (açıkta),
//   hazırlık (uzanarak yapılan derslerde).
// - Açılış uyarıları kalktı; yalnız onaylı izin cümlesi kalır ("İstediğin an gözlerini açabilir, kıpırdayabilir ya da
//   dersi bitirebilirsin."), "Başla"nın hemen üstünde. Derse özel tek uyarı: Uykuya Geçiş'te "Bu dersten hemen sonra araç
//   kullanma." (açılış satırından aynen). Ortak araç satırı ve kalkış satırı kartta ("Araç kullanırken açma.", "Yavaşça
//   kalk."); kalkış satırı bitişte de çerçeveli notta.
// - "Başlamadan önce ›" kartı her zaman açar (içeriğin sonunda).
// - İzin cümlesi ve "Başla" alt şeritte: içerik uzasa da (320 px, Uykuya Geçiş'in uzun kanıt cümlesi) hep görünür,
//   başparmağa yakın. Yoldan açılınca "Sonra yaparım" şeritte, "Başla"nın altında yazı düğmesi.
// Dersin sesinin adı ("Nefona Hoca") yazılmaz (kapı turu 2). Tek süre yayımlıyken süre bir seçim değildir: satırda yazar.
function Detail({ L, minutes, prevMinutes, opts, intro = false, onMinutes, onMusicTail, onBack, onSafety, onEvening, onStart, onLater = null }) {
  const [sleepOn, setSleepOn] = useState(false)
  const [over, check] = useStickyOver()
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
  const invite = L.opening.includes(OPENING_PERMISSION) ? OPENING_PERMISSION : null
  const vehicle = vehicleExtra(L)
  return (
    <main className={`screen fade-in yg yg-detail${night ? ' is-night' : ''}`} style={tone(L)} onAnimationEnd={check}>
      <div className="yg-hero yg-detail-hero">
        <LessonScene L={L} mood="shore" />
        <div className="yg-top">
          <button type="button" className="btn-icon" onClick={onBack} aria-label={YT.back}><ChevronLeft size={20} aria-hidden="true" /></button>
        </div>
      </div>

      <header className="yg-head">
        <h1 className="yg-h">{L.fullTitle}</h1>
        {intro && <p className="yg-p">{L.tagline}</p>}
        <p className="yg-head-facts"><Facts L={L} minutes={!choose && minutes != null ? `${minutes}${NBSP}dk` : null} plain /></p>
      </header>

      {/* Son kapı düzeltmesi: ders süresi etiketli ("Süre") ve büyük hap; müzik kuyruğu ayrı biçimde (küçük bölmeli seçici) */}
      {choose && (
        <div className="yg-field yg-len">
          {night && L.musicTailFile && <span className="yg-lbl" aria-hidden="true">{YT.detail.minutes}</span>}
          <div className="yg-chips" role="radiogroup" aria-label={YT.detail.minutes}>
            {mins.map((m) => (
              <button key={m} type="button" role="radio" className="yg-chip" aria-checked={m === minutes} onClick={() => onMinutes(m)}>{m}{NBSP}dk</button>
            ))}
          </div>
        </div>
      )}
      {evening && <button type="button" className="link-btn yg-evening" onClick={onEvening}>{YT.detail.evening}</button>}

      {/* Müzik kuyruğu seçicisi yalnız kuyruk dosyası varken: seçenek, çalan davranışla aynı olsun */}
      {night && L.musicTailFile && (
        <div className="yg-field yg-tail">
          <span className="yg-lbl">{YT.detail.musicTail}</span>
          <div className="yg-chips yg-segctl" role="radiogroup" aria-label={YT.detail.musicTail}>
            {MUSIC_TAIL.map((m) => (
              <button key={m} type="button" role="radio" className="yg-chip" aria-checked={opts.musicTail === m} onClick={() => onMusicTail(m)}>{m === 0 ? YT.detail.musicTailOff : `${m}${NBSP}dk`}</button>
            ))}
          </div>
        </div>
      )}

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

      {/* Son kapı düzeltmesi: "Neye dayanıyor" hazırlıktan sonra, sakin bir not olarak (metin aynen, açıkta; kart değil) */}
      <Basis L={L} minutes={minutes} />

      {/* Güvenlik kartını her zaman yeniden açar (sahip kararı 19; modul.md §2.2) */}
      <button type="button" className="yg-safe-link" onClick={onSafety}>
        <Info size={17} aria-hidden="true" /><span>{YT.safety.open}</span><ChevronRight className="chev" size={17} aria-hidden="true" />
      </button>

      <div className="grow" />
      {/* Alt şerit: izin cümlesi (davet), derse özel tek uyarı, varsa çalan uyku sesinin duracağı (PLAN.v3 §D.3) ve "Başla" */}
      <div className={`yg-sticky yg-detail-go${over ? ' over' : ''}`}>
        {invite && <p className="yg-invite"><DoorOpen size={20} aria-hidden="true" /><span>{invite}</span></p>}
        {vehicle && <p className="yg-invite yg-invite-2 yg-vehicle"><Car size={18} aria-hidden="true" /><span>{vehicle}</span></p>}
        {sleepOn && <p className="yg-invite yg-invite-2"><VolumeX size={18} aria-hidden="true" /><span>{YT.detail.sleepStops}</span></p>}
        <button type="button" className="btn yg-start" disabled={minutes == null} onClick={onStart}>{YT.detail.start}</button>
        {onLater && <button type="button" className="yg-skip yg-later" onClick={onLater}>{YT.detail.later}</button>}
      </div>
    </main>
  )
}

// Bitiş (yön A, beş değerlendiricinin de seçimi; aşılar). Üstte sıcak şafak (akıştaki ilk sıcak renk, kutlama sözü yok);
// "Ders bitti"; tek kayıt kartında dinlenen dakika, dolu bölüm şeridi ve ulaşılan bölüm (✓ Kapanış; 2. değerlendirici),
// altında önce → sonra: iki sayı kartın iki ucunda, aralarında uzun ok, "Sonra" dersin renginde (değerlendiriciler 1, 3,
// 5). Uzanarak yapılan derste onaylı kalkış satırı çerçeveli bir notta (4. değerlendirici). Puanlar "nasıl hissettin"
// gidişatıdır, etki kanıtı değildir (PLAN.v3 §D.5): "işe yaradı" gibi bir söz yok.
function Done({ L, end, before, after, hard, onOpen, onOk, remindField = null }) {
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
      {/* "Bana hatırlat" (bildirim PLAN.v1 §A.2): App ctx.remindField(route, { inPath }) verir; yoldan açılan derste (view.jsx inPathRoute) null */}
      {remindField}
      <button type="button" className="btn" onClick={onOk}>{YT.done.ok}</button>
    </main>
  )
}
