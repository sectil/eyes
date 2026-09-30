import { useEffect, useMemo, useRef, useState } from 'react'
import { store } from './lib/storage.js'
import { TabBar } from './components/ui.jsx'
import RestLock from './components/RestLock.jsx'
import EyeBudgetPill from './components/EyeBudgetPill.jsx'
import { recordTime, eyeStatus, beginRest, resetBudget, flushBudget, EXHAUSTED_EVENT } from './lib/eyeBudgetStore.js'
import { LIMITS as EYE_LIMITS } from './lib/eyeBudget.js'
import { REST_NOTIFY_ID, TRIAL_NOTIFY_ID, TRIAL_REMIND_DAYS, scheduleTrialReminder } from './lib/restNotify.js'
import { applyPlan, cancelOwn, onNotifyTap, notifyPermission, askNotifyPermission } from './lib/notifyApply.js'
// Tek planlayıcı (PLAN.v1 §5.5): planNotifications (dokunulmaz) + modül hatırlatmaları + ek saatler; yeni özellik
// kapalıyken çıktısı planNotifications'ınkiyle aynı (notifyAll.equiv.test.js)
import { planAll, saveSlots } from './lib/notifyAll.js'
import { normalizeModuleReminders } from './lib/moduleRemind.js'
import { createTapHandler } from './lib/notifyTap.js'
import { resetAllData } from './lib/notifyReset.js'
import ScienceCard from './components/ScienceCard.jsx'
import { NAMES as REMIND_NAMES } from './lib/remindTexts.js'
import { applyRemind, shownTimes } from './components/remindUi.js'
// "Bana hatırlat" satırı ve saat sayfası; Profil → Bildirimler ve Gece sessizliği (K2 yazıyor; PLAN.v1 §A.2, §A.5)
import RemindField from './components/RemindField.jsx'
import RemindSheet from './components/RemindSheet.jsx'
import Notifications from './screens/Notifications.jsx'
import QuietHours from './screens/QuietHours.jsx'
import { loadLog, saveLog, mergeForPermission, markTapped, getSeed, evaluate, thinCandidate } from './lib/notifyLog.js'
import { loadHabits, dayKey } from './lib/habitLog.js'
import { loadFocus, startFocus, stopFocus } from './lib/focus.js'
import { normalizeReminders, enabledTypes, TYPE_LABEL } from './lib/reminders.js'
import Reminders from './screens/Reminders.jsx'
import ConsentSheet from './components/ConsentSheet.jsx'
import FirstReport from './screens/FirstReport.jsx'
import { reportDay, REPORT_DAY } from './lib/progress.js'
import { isExerciseSession } from './lib/stats.js'
import Home from './screens/Home.jsx'
import Onboarding from './screens/Onboarding.jsx'
import FirstLook from './screens/FirstLook.jsx'
import IrisPlan from './screens/IrisPlan.jsx'
import IrisRecheck from './screens/IrisRecheck.jsx'
import { irisCells, filledIndexes, snapshot } from './lib/iris.js'
import { domainOfSession } from './lib/dataHub.js'
import ProfileQuestions from './screens/ProfileQuestions.jsx'
import QuestionFlow from './components/QuestionFlow.jsx'
import { missing, GROUPS } from './lib/profileQuestions.js'
import ProfileHome from './screens/ProfileHome.jsx'
import { hasConsent, shouldAsk, recordConsent, recordDecline } from './lib/consent.js'
import { getPrefs, setPrefs } from './lib/prefs.js'
import IntroFilm from './components/IntroFilm.jsx'
import { INTRO_VERSION } from './lib/intro.js'
import { firstOpenStep, withPendingLook, afterLook, afterSetup } from './lib/setupFlow.js'
import { ageBandFromAge } from './lib/profile.js'
import { ageFromBirthDate, emptyIdentity } from './lib/identity.js'
import { screeningFromProfile, profileFromScreening, normalizeProfile } from './lib/profile.js'
import { resetAllHowto } from './lib/howto.js'
import CardCalibration, { calibrationStillValid } from './screens/CardCalibration.jsx'
import DistanceCalibration from './screens/DistanceCalibration.jsx'
import Progress from './screens/Progress.jsx'
import Calendar from './screens/Calendar.jsx'
import Schedule from './screens/Schedule.jsx'
import Evidence from './screens/Evidence.jsx'
import Info from './screens/Info.jsx'
import Paywall from './screens/Paywall.jsx'
import { getAccess, getMembership, linkPurchaser, unlinkPurchaser } from './lib/subscription.js'
import AccountStart from './screens/AccountStart.jsx'
import WhatsNew from './components/WhatsNew.jsx'
import { RELEASES, unseenReleases, latestRelease } from './lib/releases.js'
import ProfileSetup from './screens/ProfileSetup.jsx'
import { signedIn, pullProfile, pushProfile, mergeProfile, signOut, deleteAccount, friendlyError } from './lib/account.js'
import DistanceHud from './screens/DistanceHud.jsx'
import { isIOSApp, getDeviceModel, getScreenInfo, trueDepthSupported, initFeedback, installTapHaptics, haptic, shareTextFile, healthAvailable, requestHealthAccess, readHealth, walkGuardLog, setWalkGuards } from './lib/native.js'
import { reconcileLessonJournal, resetLessonData } from './modules/yoga/journal.js'
import { summarizeHealth } from './lib/health.js'
import { fileStamp } from './lib/exportData.js'
import { resolveAutoCalibration, estimateCalibration } from './lib/screenScale.js'
import { registry } from './modules/registry.js'
import { viewFor } from './modules/views.js'
import IPHONE_SCREENS from './lib/iphoneScreens.json'
import GazeCalibration from './screens/GazeCalibration.jsx'
import GazeTest from './screens/GazeTest.jsx'
import { alarmStatus, consumeOpen, cancelAlarm, ALARM_CHANGED } from './lib/alarmNative.js'
import { loadAlarm, loadAlarmLog, addAlarmEvent } from './lib/alarmLog.js'
import { wakeSignal, morningCard, nextRing, daysLabel, hhmm, minOfDay, latency } from './lib/alarm.js'
import { soundById } from './lib/alarmSounds.js'
import { hasGazeModel } from './lib/gazeCalib.js'

const TAB_SCREENS = ['home', 'progress', 'calendar', 'info']

// --- Göz bütçesi ve zorunlu mola (lib/eyeBudget.js; plan MOLA_KILIDI_VE_YILAN_ANIMASYONU.md) ---
// Hangi ekranın göz bütçesine sayıldığı ve molada kilitlendiği modül manifestinden gelir
// (gates.eyeBudget: 'eye' | 'test'). Süre yalnızca ekran görünürken birikir (arka plan sayılmaz) ve
// kalıcıdır; mola bitiş zamanı uygulama kapanıp açılsa da korunur. Eski 10 dk'lık atlanabilir konfor
// molası (RestBreak) bu sistemin içine alındı: 20 sn'lik molaların etkisi gösterilemedi (Johnson 2022,
// DOI 10.1097/OPX.0000000000001971), 5 dk'lık molalar göz yorgunluğunu azalttı (Galinsky 2000).
const gatesOf = (s) => registry.forRoute(s)?.gates ?? {}
const budgetKindOf = (s) => gatesOf(s).eyeBudget ?? null
// Mola metninde cümle içinde geçer ("Devam: kısa E testi"): modülün label'ı.
const activityLabel = (s) => registry.labelFor(s)
// İris haritası: oturumun sayıldığı alan (Dikkat, Farkındalık ilk görevle dolar; lib/iris.js)
// Oturum → alan: veri merkezi (lib/dataHub.js) tek kaynak
// Ödeme ekranı haritası da oturumları görür (önce verilmiyordu: Dikkat ve Farkındalık hep boş kalıyordu)
const irisFilled = (profile, sessions = []) => filledIndexes(irisCells(profile?.iris?.baseline ?? snapshot(profile ?? {}), { sessions, domainOf: domainOfSession }))
// Ana sayfadaki mola bandından açılan kilit ekranı (hedefsiz)
const REST_ROUTE = 'eye-rest'

// --- Bildirim planı v2 (docs/yol-haritasi/BILDIRIM_PLANI.md; sözleşme §6) ---
// Hatırlatmaya dokununca açılan ekran (yürüyüş ve Çalışma günleri → Ana sayfa); çalışma oturumu → mola
const DAY_MS = 86400000
// "Nefona'yı aç" dokunuşu en çok bu kadar eskiyse sabah ekranına/Ana sayfaya götürür (VARSAYIM)
const OPEN_NAV_MS = 10 * 60000
// Apple Sağlık'tan okunan gün sayısı: Gelişim'deki yürüyüş ölçümü geçmiş günlerin adımına bakar (Swift dailyTotals
// en çok 60 gün). Ana sayfa ve Gelişim özeti yine son 7 günden (summarizeHealth; ortalama = önceki 6 gün).
const STEP_DAYS = 60
// Deneme şeridi (izni olmayana, 5. günden sonra) en geç bu güne dek; İlk rapor penceresiyle aynı (5–14. gün)
const TRIAL_NOTE_LAST_DAY = 14
// Sağlık rızası varken açılışta ilk okuma bu kadar beklenir; takılırsa plan sağlıksız kurulur (VARSAYIM: HealthKit'in
// soğuk açılıştaki 60 günlük sorgusu birkaç yüz ms–birkaç sn)
const HEALTH_WAIT_MS = 15000
// "Tüm verileri sil"de korunan ayarlar (TRIAL_KEYS) lib/notifyReset.js'e taşındı.

// "Bana hatırlat" modülleri (registry.reminders()) → planAll/planModuleReminders girdisi { id, remind, doneToday,
// records }. records ("Sen karar ver" saatinin ve ek saatteki "son 2 saatte yaptıysan" kuralının kaydı): modülün
// oturumları (progression.match ?? sessions.match); legacy türde ayrıca habit-log kayıtları (VARSAYIM).
function remindModules(sessions = []) {
  const habits = loadHabits()
  return registry.reminders().map((e) => {
    const m = registry.get(e.module)
    const match = m?.progression?.match ?? m?.sessions?.match ?? null
    const records = [...(match ? sessions.filter((x) => match(x)) : []), ...(e.legacy ? habits.filter((h) => h.type === e.legacy) : [])]
    return {
      id: e.module,
      remind: { route: e.route, legacy: e.legacy, window: e.window, defaultTime: e.defaultTime, maxTimes: e.maxTimes, science: e.science },
      doneToday: e.doneToday,
      records,
    }
  })
}

// Göz ekranında ve uygulama görünürken geçen süreyi saniyede bir bütçeye yazar.
function useEyeClock(kind) {
  useEffect(() => {
    if (!kind) return undefined
    let last = document.visibilityState === 'hidden' ? null : Date.now()
    const tick = () => {
      const now = Date.now()
      if (last != null) recordTime(kind, last, now)
      last = document.visibilityState === 'hidden' ? null : now
    }
    const id = setInterval(tick, 1000)
    const onVis = () => {
      tick()
      if (document.visibilityState === 'hidden') flushBudget()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      tick()
      flushBudget()
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [kind])
}


export default function App() {
  const [data, setData] = useState(store.get())
  const [screen, setScreen] = useState('home')
  const [lastTab, setLastTab] = useState('home')
  // Zorunlu mola ekranı: { to: mola bitince devam edilecek ekran | null } | null
  const [lockFor, setLockFor] = useState(null)
  // Göz bütçesi durumu (gösterge, Ana sayfa bandı); göz ekranında ya da kilitliyken saniyede bir
  const [budget, setBudget] = useState(() => eyeStatus())
  // Göz kalibrasyonu bekleyen hedef (TrueDepth'te göz kontrollü ekrandan önce, bir kez): { to } | null
  const [gazeFor, setGazeFor] = useState(null)
  const gazeSkipped = useRef(false) // "Şimdi değil" → bu oturumda tekrar sorma
  // Yerinde profil sorusu (lib/profileQuestions.js; modül manifest ask.before / ask.after): { ids, then, back } | null
  const [askFor, setAskFor] = useState(null)
  const entryTests = useRef(0) // ekrana girerken test sayısı (ask.after: bu ekranda yeni test kaydedildi mi)
  // Bugünün yolundan açılan rota (Home startStop → go(route, { fromPath: true })). Durağı modülün kendi rotasını açan
  // modüllerde (tek-bakis, quick-look) yol içi ayrımı rotadan çıkmaz; ctx.fromPath ile görünüm inPath verir (bildirim
  // PLAN.v1 §A.2 "Birim yoldur"). Araya giren soru, göz izi ya da mola ekranı aynı rotaya döndüğü için işaret korunur.
  const pathRoute = useRef(null)
  // Bildirim planı: yeniden kurma tetiği (kayıt dışı olaylar: oturum, dokunuş, öne gelme) ve bildirim izni
  const [planTick, setPlanTick] = useState(0)
  const replan = () => setPlanTick((t) => t + 1)
  const [notifyPerm, setNotifyPerm] = useState(null) // 'granted' | 'denied' | 'prompt' | 'unsupported' | null (bakılıyor)
  const [healthSheet, setHealthSheet] = useState(false) // Hatırlatmalar'da yürüyüş açılırken Sağlık rızası sayfası
  const [scheduleBack, setScheduleBack] = useState('calendar') // Çalışma günleri'nden dönülecek ekran
  const [trialNote, setTrialNote] = useState(null) // { daysLeft } — izni olmayana deneme şeridi
  // Tek bildirim dokunma dağıtıcısı (lib/notifyApply.js onNotifyTap). Uygulama kapalıyken yapılan dokunuş yalnız
  // İLK bağlanan dinleyiciye gider: her şeyden önce, bir kez bağlanır (restNotify'ın eski iki dinleyicisi kalktı).
  // 7301 mola bitti → Ana sayfa · 7302 deneme → İlk rapor · hatırlatma → günlükte "dokunuldu" + türün ekranı ·
  // çalışma oturumu → mola · modül hatırlatması → modül + bilim kartı. go her çizimde değişir; dağıtıcı son halini
  // goRef'ten okur.
  const goRef = useRef(null)
  // Bilim kartı (components/ScienceCard.jsx): { evidence, route } | null; yalnız o ekran açıkken üstte durur
  const [sciCard, setSciCard] = useState(null)
  // "Bana hatırlat" saat sayfası (components/RemindSheet.jsx): { module } | null
  const [remindFor, setRemindFor] = useState(null)
  useEffect(() => {
    let alive = true
    let off = () => {}
    // Sözlük lib/notifyTap.js'te (PLAN.v1 §5.5 madde 4): 78xx → modül ya da Ana sayfa (birleşik), üstte bilim kartı;
    // 7860–7867 ek saat → bugünkü deney yönlendirmesi + markTapped. actionId'li eylemler (walkLater …) yönlendirmez.
    onNotifyTap(createTapHandler({
      onRest: () => {
        setLockFor(null)
        setScreen('home')
        setBudget(eyeStatus())
      },
      onTrial: () => setScreen('first-report'),
      onAlarm: () => wakeCheck.current?.(Date.now()),
      mark: (date, type) => saveLog(markTapped(loadLog(), date, type)),
      replan: () => setPlanTick((t) => t + 1),
      go: (route) => goRef.current?.(route),
      routeOk: (route) => route === 'home' || Boolean(registry.forRoute(route)),
      showScience: (card) => setSciCard(card),
    })).then((f) => {
      if (alive) off = f
      else f()
    })
    return () => {
      alive = false
      off()
    }
  }, [])
  // Bilim kartı yalnız dokunuşun açtığı ekranda durur: o ekrana varınca "gösterildi" olur, ekrandan çıkınca kalkar
  // (yönlendirme bir kapıdan geçerse, ör. göz kalibrasyonu, kart ekrana varınca çıkar).
  useEffect(() => {
    setSciCard((c) => (!c ? c : screen === c.route ? (c.shown ? c : { ...c, shown: true }) : c.shown ? null : c))
  }, [screen, sciCard?.route, sciCard?.evidence])
  const budgetKind = lockFor ? null : budgetKindOf(screen)
  useEyeClock(budgetKind)
  const refresh = () => setData(store.get())
  const profileNow = () => {
    const st = store.get().settings
    return normalizeProfile(st.profile ?? profileFromScreening(st.screening))
  }
  const go = (s, { noAsk = false, fromPath = false } = {}) => {
    if (fromPath) pathRoute.current = s
    else if (s !== pathRoute.current) pathRoute.current = null
    // Test bitti, ekrandan çıkılıyor: modülün "sonra sor" sorusu (ör. okuma sonrası yakın zorluk) bir kez
    const after = registry.forRoute(screen)?.ask?.after
    if (!noAsk && after && s !== screen && store.get().tests.length > entryTests.current) {
      const ids = missing(profileNow(), after)
      if (ids.length) {
        setAskFor({ ids, then: s, back: s })
        window.scrollTo(0, 0)
        return
      }
    }
    const needsGaze = Boolean(gatesOf(s).gaze)
    if (needsGaze && camOk && !gazeSkipped.current && !hasGazeModel()) {
      setGazeFor({ to: s })
      window.scrollTo(0, 0)
      return
    }
    setGazeFor(null)
    if (s === REST_ROUTE) {
      setLockFor({ to: null })
      window.scrollTo(0, 0)
      return
    }
    // Göz bütçesi: kilitliyse ya da bütçe dolduysa hedef yerine mola ekranı
    if (budgetKindOf(s)) {
      const st = eyeStatus()
      if (st.locked || st.due) {
        if (!st.locked) beginRest(st.due)
        setLockFor({ to: s })
        setBudget(eyeStatus())
        window.scrollTo(0, 0)
        return
      }
    }
    // Modülün "önce sor" sorusu (ör. Hızlı Bakış'tan önce epilepsi); kapatılırsa hedefe gidilmez
    const before = registry.forRoute(s)?.ask?.before
    if (!noAsk && before) {
      const ids = missing(profileNow(), before)
      if (ids.length) {
        setLockFor(null)
        setAskFor({ ids, then: s, back: lastTab })
        window.scrollTo(0, 0)
        return
      }
    }
    setAskFor(null)
    setLockFor(null)
    if (TAB_SCREENS.includes(s)) setLastTab(s)
    entryTests.current = store.get().tests.length
    setScreen(s)
    window.scrollTo(0, 0)
  }
  goRef.current = go
  const back = () => go(lastTab)

  // --- Nefona alarmı (lib/alarm*.js; Artifact "Nefona Alarm" v3) ---
  // Durum: AlarmKit (iOS 26+) ya da bildirim yedeği ve izni; açılışta ve öne gelince. Aynı anda uyanma işareti:
  // alarmdaki "Nefona'yı aç" (native consumeOpen) ya da çaldıktan sonraki ilk açılış günlüğe yazılır. "Nefona'yı aç"
  // ile açıldıysa "Uyanınca" seçimi varsa sabah ekranı, yoksa Ana sayfa.
  const [alarmSt, setAlarmSt] = useState({ platform: 'web', auth: null })
  const wakeCheck = useRef(null)
  wakeCheck.current = (openedAt) => {
    const alarm = loadAlarm()
    const now = new Date()
    const w = wakeSignal({ alarm, log: loadAlarmLog(), now, openedAt })
    if (w) addAlarmEvent('wake', { via: w.via, ring: w.ring }, w.at)
    // Yalnız taze dokunuş yönlendirir: kalmış bir zaman damgası saatler sonra kişiyi ekranından koparmasın
    if (openedAt == null || now.getTime() - openedAt > OPEN_NAV_MS) return
    const m = morningCard({ now, alarm, log: loadAlarmLog(), sessions: store.get().sessions })
    goRef.current?.(m?.kind === 'wake' ? 'alarm-morning' : 'home')
  }
  useEffect(() => {
    if (!isIOSApp()) return undefined
    const check = async () => {
      setAlarmSt(await alarmStatus())
      wakeCheck.current?.(await consumeOpen())
    }
    check()
    const onVis = () => document.visibilityState === 'visible' && check()
    const onChange = () => alarmStatus().then(setAlarmSt).catch(() => {})
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener(ALARM_CHANGED, onChange)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener(ALARM_CHANGED, onChange)
    }
  }, [])

  // Göz ekranında: 1 dk kala uyarı; bütçe dolunca oyun/egzersizde tur bitirme payı, sonra kilit.
  // Testler kesilmez (kilit bir sonraki geçişte). Kilitliyken ve Ana sayfada gösterge/geri sayım.
  const warned = useRef(false)
  const dueSince = useRef(null)
  useEffect(() => {
    const watch = Boolean(budgetKind) || screen === 'home'
    if (!watch) return undefined
    warned.current = false
    dueSince.current = null
    const id = setInterval(() => {
      const st = eyeStatus()
      setBudget(st)
      if (!budgetKind) return
      if (st.warn && !warned.current) {
        warned.current = true
        haptic('tick')
      }
      if (st.due && budgetKind === 'eye') {
        const now = Date.now()
        if (dueSince.current == null) {
          dueSince.current = now
          haptic('warning')
        } else if (now - dueSince.current >= EYE_LIMITS.graceMs) {
          beginRest(st.due)
          setLockFor({ to: screen })
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [budgetKind, screen])
  // Ekran içinden yeni tur istenip bütçe doluysa (Yılan "Tekrar oyna" vb.) mola ekranı açılır
  const screenRef = useRef(screen)
  screenRef.current = screen
  useEffect(() => {
    const on = (e) => {
      const st = e.detail ?? eyeStatus()
      if (!st.locked && st.due) beginRest(st.due)
      setLockFor({ to: screenRef.current })
      setBudget(eyeStatus())
    }
    window.addEventListener(EXHAUSTED_EVENT, on)
    return () => window.removeEventListener(EXHAUSTED_EVENT, on)
  }, [])
  // Bildirim izni: açılışta ve öne gelince (iOS Ayarlar'dan değişmiş olabilir); öne gelince plan da yeniden kurulur.
  // Açılışta native yürüyüş korumasının günlüğü okunur (okununca native tarafta temizlenir). Günlükteki kayıtlar
  // 'doneBefore'a ÇEVRİLMEZ: koruma yalnız bildirimi giden günlerde kurulu; yalnız onları ölçümden çıkarmak sessiz
  // günleri iyi, hatırlatmayı olduğundan etkisiz gösterirdi. Yürüyüş günleri bu yüzden zarın atandığı kolda sayılır
  // (iptal edilen gün de "hatırlatma günü"); Gelişim kartı bunu yazar.
  useEffect(() => {
    const check = () => notifyPermission().then(setNotifyPerm).catch(() => setNotifyPerm('unsupported'))
    check()
    walkGuardLog().catch(() => {})
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      check()
      setPlanTick((t) => t + 1)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Yoga: yerel ders kaydının uzlaştırması (modules/yoga/journal.js; modul.md §4, §6.4). Uygulama ders sırasında
  // kapandıysa ya da ders Yoga ekranı dışındayken bittiyse kayıt yerel kayıttan yazılır; tarih dersin bitiş anıdır.
  // Açılışta ve uygulama öne gelince; yalnız iPhone uygulamasında (web'de yoga yok).
  useEffect(() => {
    if (!isIOSApp()) return undefined
    const run = () => {
      const yogaOnScreen = registry.forRoute(screenRef.current)?.id === 'yoga'
      reconcileLessonJournal(store, { yogaOnScreen }).then((rec) => { if (rec) setData(store.get()) }).catch(() => {})
    }
    run()
    const onVis = () => document.visibilityState === 'visible' && run()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // iPhone ses modu (sessiz tuşunda da ses) + ses tercihi değişikliklerini izle. Web'de etkisiz.
  useEffect(() => initFeedback(), [])
  // Her düğmede hafif titreşim (ayarlardan titreşim kapalıysa hiçbir şey)
  useEffect(() => installTapHaptics(), [])

  // Abonelik durumu (yalnızca iOS uygulamasında kilit; web'de açık)
  const [access, setAccess] = useState({ loading: true, premium: false })
  useEffect(() => {
    const check = () =>
      getAccess()
        .then((a) => setAccess({ loading: false, ...a }))
        .catch(() => setAccess({ loading: false, premium: false, native: true, error: true }))
    check()
    // Uygulama öne gelince yeniden kontrol (deneme/abonelik bitmiş olabilir)
    const onVis = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // iPhone uygulaması: ekran ölçüsü modelden otomatik, mesafe TrueDepth ile (kalibrasyonsuz)
  const [native, setNative] = useState({ checked: !isIOSApp(), trueDepth: false, autoScreen: false })
  useEffect(() => {
    if (!isIOSApp()) return
    ;(async () => {
      let trueDepth = false
      let auto = null
      try {
        trueDepth = await trueDepthSupported()
      } catch {
        trueDepth = false
      }
      let reason = null
      try {
        let model = null
        let screenInfo = null
        try {
          model = await getDeviceModel()
        } catch {
          model = null
        }
        try {
          screenInfo = await getScreenInfo()
        } catch {
          screenInfo = null
        }
        const r = resolveAutoCalibration(model, screenInfo, IPHONE_SCREENS)
        auto = r.cal
        reason = r.reason
        if (!auto) {
          // iPhone'da elle ayar yok: ekran ölçeğinden tahmin (eklenti yanıt vermezse devicePixelRatio)
          const est = estimateCalibration(screenInfo?.nativeScale ?? window.devicePixelRatio)
          if (est) auto = { ...est, model, name: model || 'iPhone' }
        }
        const current = store.get().settings.calibration
        // iPhone'da otomatik ölçü (üretici ekran verisi) elle yapılan ayardan daha doğrudur;
        // varsa her açılışta onu kullan (eski elle ayarın yerine geçer).
        if (auto && !(current?.method === 'auto' && calibrationStillValid(current) && current.pxPerMm === auto.pxPerMm)) {
          store.setSetting('calibration', {
            pxPerMm: auto.pxPerMm,
            method: 'auto',
            estimated: Boolean(auto.estimated),
            reason,
            model: auto.model,
            deviceName: auto.name,
            dpr: window.devicePixelRatio,
            screenW: window.screen.width,
            screenH: window.screen.height,
            date: new Date().toISOString(),
          })
        }
      } catch {
        auto = null
      }
      setNative({ checked: true, trueDepth, autoScreen: Boolean(auto), autoReason: reason })
      refresh()
    })()
  }, [])

  const { settings, tests, sessions } = data
  // Apple Sağlık (yalnız okuma, telefonda kalır; lib/health.js). Yalnız açık rızayla okunur; öne gelince tazelenir.
  // Rıza sürümü (lib/consent.js): v1 izni ("yan yana göstermek") okumaya ve göstermeye yeter (healthShow); yürüyüş
  // hatırlatması, planlayıcıya adım ve Gelişim'deki yürüyüş ölçümü v2 ister (healthOk). v1 izni olan kişi güncel
  // metne "Şimdi değil" derse adımları görünmeye devam eder (answerHealth → recordDecline).
  const [healthAvail, setHealthAvail] = useState(null) // null: bakılıyor
  const [health, setHealth] = useState(null)
  const [healthTick, setHealthTick] = useState(0) // iOS izin sayfası kapanınca yeniden oku
  const healthShow = hasConsent(settings.consents, 'health', 1)
  const healthOk = hasConsent(settings.consents, 'health')
  // Yürüyüş rızası (v2) varken açılıştaki ilk okuma bitene dek plan kurulmaz: sağlıksız plan (health null) bekleyen
  // yürüyüş bildirimlerini ve native korumayı iptal eder, günlüğe 'noData' yazardı. İlk çizimde doğru olmalı (plan
  // etkisi aynı turda çalışır), bu yüzden başlangıç değeri rızadan.
  const [healthWait, setHealthWait] = useState(() => isIOSApp() && hasConsent(data.settings.consents, 'health'))
  useEffect(() => {
    healthAvailable().then(setHealthAvail).catch(() => setHealthAvail(false))
  }, [])
  useEffect(() => {
    if (!healthShow || !isIOSApp()) {
      setHealth(null)
      setHealthWait(false)
      return undefined
    }
    let alive = true
    // Okuma hatasında son başarılı değer kalır (yoksa null: yürüyüş 'noData'); null'a düşmek planı sarsardı
    const load = () =>
      readHealth({ days: STEP_DAYS })
        .then((h) => alive && h && setHealth({ ...summarizeHealth(h.days.slice(-7)), stepRows: summarizeHealth(h.days).rows, recentSteps: h.recentSteps, at: h.at }))
        .catch(() => {})
        .finally(() => alive && setHealthWait(false))
    load()
    const waitCap = setTimeout(() => alive && setHealthWait(false), HEALTH_WAIT_MS)
    const onVis = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      alive = false
      clearTimeout(waitCap)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [healthShow, healthTick])
  // Nef: eski sürümler rıza sormadan (Bilgi anahtarı) ya da iki amacı tek dokunuşla açabiliyordu. Kayıtlı açık
  // rızası olmayan tercih kapatılır; tanıtım kartı yeniden çıkar, CoachConsent iki kutuyla sorar.
  // (Gönderim zaten coachAllowed ile rızaya bağlı; bu yalnızca tercihi kayıtla uyumlu tutar.)
  useEffect(() => {
    const p = getPrefs()
    if (p.coach && !hasConsent(settings.consents, 'coach')) setPrefs({ coach: false, coachLife: false, coachHidden: false })
    else if (p.coachLife && !hasConsent(settings.consents, 'coachLife')) setPrefs({ coachLife: false })
  }, [settings.consents])
  // --- Bildirim planı (sözleşme §6): girdiler → planNotifications → günlük → izin 'granted' ise applyPlan (tek sıra,
  // 400 ms birleştirme; son plan kazanır). Tetikler: açılış, öne gelme, sağlık okuması, her kayıt (data), hatırlatma
  // ayarı (data), oturum başla/bitir ve dokunuş (planTick), izin değişimi.
  // Günlüğe yalnız kurulabilen plan yazılır (notifyLog.mergeForPermission): izin 'granted' değilse bildirimi
  // kurulmayan gün Gelişim'de "hatırlatma gelen gün" sayılmasın; izne hâlâ bakılıyorsa (null) hiç yazılmaz.
  // Sağlık rızası varken ilk okuma bitmeden plan kurulmaz (healthWait). Adım planlayıcıya yalnız v2 rızasıyla gider.
  // Ana anahtar kapalıysa (optIn 'yes' değil) kendi aralığımız bir kez iptal edilir; 7301/7302'ye dokunulmaz.
  const applied = useRef(null) // 'on' | 'off' | null
  const lastPlan = useRef(null) // Bildirimler'deki "Sıradaki" satırı için son plan
  useEffect(() => {
    if (healthWait) return
    const st = store.get()
    const now = new Date()
    const r = normalizeReminders(st.settings.reminders)
    const on = r.optIn === 'yes'
    const log = loadLog()
    // Yeni özellik kapalıyken (moduleReminders boş) planAll planNotifications'ın çıktısını aynen döndürür (§5.4)
    const mr = normalizeModuleReminders(st.settings.moduleReminders)
    const hasMr = Object.keys(mr).length > 0
    const plan = planAll({
      now,
      reminders: r,
      study: st.settings.reminder,
      habits: loadHabits(),
      sessions: st.sessions,
      health: healthOk && health ? { todaySteps: health.today?.steps ?? null, avgSteps: health.avgSteps, readAt: health.at } : null,
      focus: loadFocus(now),
      seed: on ? getSeed() : '',
      log,
      moduleReminders: st.settings.moduleReminders,
      modules: hasMr ? remindModules(st.sessions) : [],
      alarm: hasMr ? loadAlarm() : null,
      // Gece sessizliği: settings.quiet ({ from, to }; screens/QuietHours.jsx)
      quiet: st.settings.quiet ?? null,
      texts: true,
    })
    lastPlan.current = plan
    const nextLog = mergeForPermission(log, plan.log, notifyPerm, dayKey(now), now)
    if (nextLog) saveLog(nextLog)
    if (!on) {
      if (applied.current !== 'off') cancelOwn()
      applied.current = 'off'
      return
    }
    // "Sen karar ver": deney dışı modülde yeni saat kendiliğinden yazılır (moduleRemind.js updates; §A.3). Yazılınca
    // plan bir kez daha kurulur; ikinci kurulumda autoAt taze olduğu için güncelleme gelmez.
    if (plan.updates?.length) {
      const next = { ...(st.settings.moduleReminders ?? {}) }
      for (const u of plan.updates) next[u.module] = { ...(next[u.module] ?? {}), times: u.times, autoAt: u.autoAt }
      store.setSetting('moduleReminders', next)
      refresh()
    }
    if (notifyPerm !== 'granted') return
    applied.current = 'on'
    // O günün ek saatleri (gozolcum:notify-slots): yalnız kurulan planınki; Hatırlatmalar salt okunur gösterir
    if (plan.slots) saveSlots(plan.slots)
    applyPlan(plan)
  }, [planTick, data, health, healthOk, healthWait, notifyPerm])
  // Seyreltme sorusu (Ana sayfa, tür başına bir kez): son 3 hatırlatma gününde ne dokunma ne kayıt. Bildirim izni
  // yokken sorulmaz (hatırlatma zaten gelmiyor; web'de de).
  const thinAsk = useMemo(() => {
    if (notifyPerm !== 'granted') return null
    const st = store.get()
    const walkData = hasConsent(st.settings.consents, 'health')
    return thinCandidate(loadLog(), st.settings.reminders, { habits: loadHabits(), sessions: st.sessions, healthDays: walkData ? health?.stepRows ?? [] : [], avgSteps: walkData ? health?.avgSteps ?? null : null })
    // planTick: dokunuş ve günlük değişimi
  }, [data, health, planTick, notifyPerm])
  // Deneme hatırlatması (7302): izin hangi yoldan verilirse verilsin (Ana sayfa kartı, Hatırlatmalar, mola kilidi,
  // iOS Ayarlar) 'granted' görülünce, deneme 5. günden önceyse ve üyelik gerçekten denemedeyse kurulur; kurulduğu
  // settings.trialReminder'a yazılır (şerit kararı). scheduleTrialReminder önce iptal edip kurar: tekrar çağrı zararsız.
  const trialOffer = data.settings.trialOffer
  const trialMs = trialOffer?.started ? Date.parse(trialOffer.date) : NaN
  useEffect(() => {
    if (notifyPerm !== 'granted' || !Number.isFinite(trialMs) || Date.now() >= trialMs + TRIAL_REMIND_DAYS * DAY_MS) return
    const startIso = trialOffer.date
    getMembership()
      .then((m) => (m?.state === 'trial' ? scheduleTrialReminder(trialMs) : false))
      .then((ok) => {
        if (!ok || store.get().settings.trialReminder?.start === startIso) return
        store.setSetting('trialReminder', { start: startIso, date: new Date().toISOString() })
        refresh()
      })
      .catch(() => {})
  }, [notifyPerm, trialMs])
  // Deneme şeridi: 5. günden sonra Ana sayfada bir kez; 7302 bu deneme için kurulmadıysa ya da izin şimdi kapalıysa
  // (kurulu bildirim de gelmez). Yalnız gerçekten ücretsiz denemedeyse (RevenueCat periodType TRIAL).
  const trialDay = Number.isFinite(trialMs) ? reportDay(trialOffer.date) : null
  const trialDue = trialDay != null && Date.now() >= trialMs + TRIAL_REMIND_DAYS * DAY_MS && trialDay <= TRIAL_NOTE_LAST_DAY
  const trialSet = data.settings.trialReminder?.start != null && data.settings.trialReminder.start === trialOffer?.date
  const trialNoteOk = trialDue && notifyPerm != null && (notifyPerm !== 'granted' || !trialSet) && !data.settings.trialNoteSeen && access.native && !access.testUnlock
  useEffect(() => {
    if (!trialNoteOk) {
      setTrialNote(null)
      return undefined
    }
    let alive = true
    getMembership()
      .then((m) => alive && setTrialNote(m?.state === 'trial' ? { daysLeft: m.daysLeft } : null))
      .catch(() => alive && setTrialNote(null))
    return () => {
      alive = false
    }
  }, [trialNoteOk])
  // iPhone'da TrueDepth varsa mesafe her zaman sensörden gelir (eski kamera kalibrasyonu yok sayılır).
  // DistanceHud'da "Kamerasız devam et" denildiyse (skipped + via:'truedepth') kamera hiçbir yerde açılmaz:
  // mesafe ölçülmez, göz kalibrasyonu sorulmaz, modüller kamerasız çalışır. Eski sürümlerin web kalibrasyonu
  // atlaması (via yok) TrueDepth'te eskisi gibi yok sayılır.
  const cameraOff = native.trueDepth && Boolean(settings.distance?.skipped) && settings.distance?.via === 'truedepth'
  const camOk = native.trueDepth && !cameraOff
  const distanceCal = camOk
    ? { method: 'truedepth' }
    : settings.distance?.irisPxAt40 || settings.distance?.method === 'truedepth' ? settings.distance : null
  const setupTotal = native.autoScreen ? 2 : 3

  if (!native.checked) {
    return <main className="screen"><p className="muted">Hazırlanıyor…</p></main>
  }

  // --- Kurulum akışı (web: 3 adım; iPhone otomatik ekranla: 2 adım) ---
  // Profil anketi (lib/profile.js): kurulumun 1. adımı. Eski kayıtlarda (yalnızca screening) Bugün'de
  // "Profilini tamamla" kartı çıkar; Bilgi → Profilim'den düzenlenir.
  const saveProfile = (p) => {
    store.setSetting('profile', p)
    store.setSetting('screening', screeningFromProfile(p))
    refresh()
  }
  // Giriş ekranı (components/IntroFilm.jsx, hareketsiz): ilk açılışta bir kez, profil sorularından önce; Profilim'den yeniden görülür.
  // İlk kurulumda sürüm notu gösterilmez (her şey zaten yeni): en son sürüm görülmüş sayılır
  const markIntro = () => { store.setSetting('intro', { seen: true, version: INTRO_VERSION, date: new Date().toISOString() }); if (!settings.releaseSeen) store.setSetting('releaseSeen', latestRelease()?.id ?? null); refresh() }
  if (screen === 'intro') return <IntroFilm replay onDone={() => go(lastTab)} />
  // İlk açılış sırası (lib/setupFlow.js; karar 2026-09-29 (b) "ilk açılışta önce ölçüm"): giriş → İlk Bakış → hesap →
  // kurulum. İlk Bakış'ta ilerleme çubuğu yok (hesap ekranında da yok; ilk an form gibi değil). Sonuç, sonuç ekranı açılır
  // açılmaz ayrı kayda yazılır (yenilemeden: ekran sonuçta kalır); uygulama sonuç ya da hesap ekranında kapansa da
  // kaybolmaz. "Devam" hesaba geçirir.
  const applySetup = (upd) => { for (const [k, v] of Object.entries(upd)) store.setSetting(k, v) }
  const first = firstOpenStep(settings)
  if (first === 'intro') return <IntroFilm onDone={markIntro} />
  if (first === 'look') {
    return <FirstLook trueDepth={native.trueDepth} bar={null} onResult={(look) => applySetup(afterLook(look))} onDone={(look) => { applySetup(afterLook(look)); refresh() }} />
  }

  // --- Hesap → Seni tanıyalım → 7 gün ücretsiz (Build 23b; Artifact "Hesap ve Profil Taslağı") ---
  // Hesap açıldıysa ad, doğum tarihi, şehir, gözlük Supabase'e eşitlenir (lib/account.js); ağ yoksa telefonda kalır.
  const nowIso = () => new Date().toISOString()
  const currentCorrection = () => { const st = store.get().settings; return st.profile?.correction ?? st.setupCorrection ?? null }
  // Eşitleme yalnız açık rızayla (lib/consent.js; KVKK). İzin yoksa bilgiler telefonda kalır.
  const syncUp = (id, corr) => {
    const st = store.get().settings
    if (signedIn(st.account) && hasConsent(st.consents, 'profileSync')) pushProfile(st.account.userId, id, corr).catch(() => {})
  }
  // İzin ver / reddet / geri çek. Geri çekilince sunucudaki kopya boşaltılır (ad, doğum tarihi, şehir, gözlük → boş).
  const setConsent = (key, granted) => {
    const st = store.get().settings
    const had = hasConsent(st.consents, key)
    store.setSetting('consents', recordConsent(st.consents, key, granted))
    // Apple Sağlık: bizim iznimizden sonra iOS'un kendi izin sayfası (geri çekmek iOS Ayarlar'dan; biz okumayı bırakırız)
    if (key === 'health' && granted) requestHealthAccess().catch(() => {}).finally(() => setHealthTick((t) => t + 1))
    // Geri çekilince native yürüyüş koruması (uygulama kapalıyken adım okur) izinden bağımsız hemen boşalır: bildirim
    // izni kapalıyken plan uygulanmaz, applyPlan yolu korumayı temizleyemez (rıza metni: "geri çekince okumaz")
    if (key === 'health' && !granted) setWalkGuards([]).catch(() => {})
    if (key === 'profileSync' && signedIn(st.account)) {
      if (granted) syncUp(st.identity, currentCorrection())
      else if (had) pushProfile(st.account.userId, emptyIdentity(), null).catch(() => {})
    }
    refresh()
  }
  // Sağlık rıza sayfasının cevabı (Ana sayfa, Hatırlatmalar). Eski metne (v1) izin vermiş kişinin güncel metne
  // "Şimdi değil" demesi v1 iznini geri çekmez: yalnız bu sürüm reddedildi diye yazılır, bir daha sorulmaz; adımlar
  // görünmeye devam eder, yürüyüş hatırlatması açılmaz. Profilim → İzinlerim'deki kapatma gerçek geri çekmedir.
  const answerHealth = (granted) => {
    const st = store.get().settings
    if (!granted && hasConsent(st.consents, 'health', 1)) {
      store.setSetting('consents', recordDecline(st.consents, 'health'))
      refresh()
      return
    }
    setConsent('health', granted)
  }
  const healthSheetKind = healthShow ? 'healthUpdate' : 'health'
  // Nef açık rızası: iki amaç iki ayrı kayıt (settings.consents) + cihaz tercihi (prefs). Kapatmak ikisini de geri çeker.
  const setCoach = ({ on, life = false }) => {
    let c = recordConsent(store.get().settings.consents, 'coach', on)
    c = recordConsent(c, 'coachLife', Boolean(on && life))
    store.setSetting('consents', c)
    setPrefs(on ? { coach: true, coachHidden: false, coachLife: Boolean(life) } : { coach: false, coachLife: false })
    refresh()
  }
  const setCoachLife = (granted) => {
    store.setSetting('consents', recordConsent(store.get().settings.consents, 'coachLife', granted))
    setPrefs({ coachLife: Boolean(granted) })
    refresh()
  }
  // --- Hatırlatmalar (bildirim planı v2) ---
  // Bildirim izni: sorulmadıysa iOS penceresi; sonuç ne olursa olsun durum yeniden okunur (plan etkisi uygular;
  // izin verildiyse deneme hatırlatmasını da 7302 etkisi kurar).
  const askPermission = async () => {
    let p = await notifyPermission()
    if (p === 'prompt') {
      await askNotifyPermission()
      p = await notifyPermission()
    }
    setNotifyPerm(p)
    return p
  }
  // Ana sayfa kartı: "Evet" → optIn 'yes' ve izin (reddedilse de 'yes' kalır; Ana sayfa ayar yolunu gösterir)
  const answerReminders = async (yes) => {
    const r = normalizeReminders(store.get().settings.reminders)
    store.setSetting('reminders', { ...r, optIn: yes ? 'yes' : 'no', askedAt: nowIso() })
    refresh()
    return yes ? askPermission() : null
  }
  const saveReminders = (r) => {
    store.setSetting('reminders', r)
    refresh()
  }
  // Seyreltme sorusunun cevabı: 'alt' → gün aşırı; her iki cevapta da bir daha sorulmaz
  const answerThin = (type, choice) => {
    const r = normalizeReminders(store.get().settings.reminders)
    saveReminders({ ...r, thin: choice === 'alt' ? { ...r.thin, [type]: 'alt' } : r.thin, thinAsked: { ...r.thinAsked, [type]: nowIso() } })
  }
  const beginFocus = (h) => {
    startFocus(h)
    replan()
  }
  const endFocus = () => {
    stopFocus()
    replan()
  }
  const openSchedule = (from) => {
    setScheduleBack(from)
    go('schedule')
  }
  // Gelişim ölçüm kartı: açık deney türleri (lib/notifyLog.js evaluate); web'de hatırlatma yok, kart da yok.
  // Yürüyüşte yalnız adımı okunabilen günler (son STEP_DAYS gün) sayılır; daha eskisi "yapılmadı" sayılmasın.
  // Yürüyüş ölçülemiyorsa neden (blocked) kartta sayı yerine yazılır: HealthKit yok / v2 rızası yok / adım okunamıyor.
  const nudgeStats = () => {
    if (!isIOSApp()) return []
    const r = normalizeReminders(settings.reminders)
    const on = r.optIn === 'yes' ? enabledTypes(r) : []
    if (!on.length) return []
    const rows = healthOk ? health?.stepRows ?? [] : []
    const oldest = rows[0]?.date ?? null
    const log = loadLog().filter((e) => e.type !== 'walk' || (oldest != null && e.date >= oldest))
    const ev = evaluate(log, { habits: loadHabits(), sessions, healthDays: rows, avgSteps: healthOk ? health?.avgSteps ?? null : null })
    const walkBlocked = healthAvail === false ? 'noHealth' : !healthOk ? 'consent' : health && !health.hasData ? 'steps' : null
    return on.map((type) => ({ type, ...ev[type], blocked: type === 'walk' ? walkBlocked : null }))
  }
  // Çalışma oturumu bildirimi gelebilir mi (mola bitti ekranı, Ana sayfa şeridi): 'web' | 'off' (hatırlatmalar
  // kapalı) | 'perm' (bildirim izni yok) | null. İzne hâlâ bakılıyorsa engel sayılmaz.
  const focusBlock = !isIOSApp() ? 'web' : normalizeReminders(settings.reminders).optIn !== 'yes' ? 'off' : notifyPerm != null && notifyPerm !== 'granted' ? 'perm' : null

  // "Bana hatırlat" (PLAN.v1 §A.1–A.2): settings.moduleReminders[modül] = { on, mode, times, autoAt, setAt } (asla
  // settings.reminders içine değil). Kaydı bileşen kurar (components/remindUi.js applyRemind: ilk açılışta optIn 'yes',
  // varsayılanı açık mola kapanır; legacy türde ilk saat settings.reminders'ta); App yalnız yazar. data değişir → plan
  // yeniden kurulur.
  const saveRemind = ({ moduleReminders, reminders } = {}) => {
    if (moduleReminders) store.setSetting('moduleReminders', moduleReminders)
    if (reminders) store.setSetting('reminders', reminders)
    refresh()
  }
  const remindEntryOf = (id) => registry.reminders().find((e) => e.module === id) ?? null
  // Başka bildirimlerin saatleri (saat sayfasının 60 dk kuralı ve çakışma cümlesi): açık deney türleri, çalışma günleri
  // ve öteki modül hatırlatmaları. Etiketler bugünkü adlardan (reminders.js TYPE_LABEL, remindTexts.js NAMES).
  const remindBusy = (selfId) => {
    const entry = remindEntryOf(selfId)
    const r = normalizeReminders(settings.reminders)
    const out = []
    for (const [t, c] of Object.entries(r.types)) {
      if (t === 'study' || !c.on || !c.time || t === entry?.legacy) continue
      out.push({ time: c.time, label: TYPE_LABEL[t] })
    }
    if (r.types.study?.on && settings.reminder?.time) out.push({ time: settings.reminder.time, label: TYPE_LABEL.study })
    for (const [k, c] of Object.entries(normalizeModuleReminders(settings.moduleReminders))) {
      if (k === selfId || k === entry?.legacy || !c.on) continue
      for (const time of c.times) out.push({ time, label: REMIND_NAMES[k] ?? TYPE_LABEL[k] ?? k })
    }
    return out
  }
  const remindRecords = (id) => remindModules(sessions).find((x) => x.id === id)?.records ?? []
  // ctx.remindField(route, { inPath }): modülün bitiş bloğundaki "Bana hatırlat" satırı (components/RemindField.jsx;
  // saat sayfasını kendisi açar). remind'i olmayan modülde null. Yol içinde açılan modülde modül inPath: true verir.
  // VARSAYIM: yalnız iPhone uygulamasında (web'de bildirim yok; Bilgi'deki Hatırlatmalar satırı gibi).
  const remindField = (route, { inPath = false } = {}) => {
    const m = registry.forRoute(route) ?? registry.get(route)
    const entry = m ? remindEntryOf(m.id) : null
    if (!entry || !isIOSApp()) return null
    return (
      <RemindField
        moduleId={m.id}
        remind={entry}
        settings={{ moduleReminders: settings.moduleReminders, reminders: settings.reminders }}
        busy={remindBusy(m.id)}
        records={remindRecords(m.id)}
        permission={notifyPerm}
        inPath={inPath}
        onChange={saveRemind}
        onAskPermission={askPermission}
        onWhy={() => go('reminders')}
      />
    )
  }
  // Bildirimler'den açılan saat sayfası (alttan)
  const remindSheet = () => {
    const entry = remindFor ? remindEntryOf(remindFor.module) : null
    if (!entry) return null
    return (
      <RemindSheet
        moduleId={entry.module}
        remind={entry}
        moduleReminders={settings.moduleReminders}
        reminders={settings.reminders}
        busy={remindBusy(entry.module)}
        records={remindRecords(entry.module)}
        permission={notifyPerm}
        onSave={(v) => { saveRemind(v); setRemindFor(null) }}
        onAskPermission={askPermission}
        onWhy={() => { setRemindFor(null); go('reminders') }}
        onClose={() => setRemindFor(null)}
      />
    )
  }
  // Bildirimler'deki anahtar: saat ve kip korunur, yalnız açık/kapalı değişir
  const toggleRemind = (id, on) => {
    const entry = remindEntryOf(id)
    if (!entry) return
    const cfg = normalizeModuleReminders(settings.moduleReminders)[id]
    saveRemind(applyRemind({ moduleId: id, remind: entry, moduleReminders: settings.moduleReminders, reminders: settings.reminders, mode: cfg?.mode ?? 'auto', times: shownTimes(id, entry, settings.moduleReminders, settings.reminders), on }))
  }
  // "Sıradaki: 10.00 Göz egzersizi" (Bildirimler): son kurulan planın ilk gelecek bildirimi
  const nextNotify = () => {
    const n = (lastPlan.current?.notifications ?? []).find((x) => x.at instanceof Date && x.at.getTime() > Date.now())
    if (!n) return null
    const key = n.module ?? n.type
    const time = `${String(n.at.getHours()).padStart(2, '0')}:${String(n.at.getMinutes()).padStart(2, '0')}`
    const label = n.modules?.length > 1 ? n.modules.map((k) => REMIND_NAMES[k] ?? k).join(', ') : REMIND_NAMES[key] ?? TYPE_LABEL[key] ?? null
    return label ? { time, label } : null
  }
  const sciEl = sciCard && sciCard.route === screen ? <ScienceCard evidence={sciCard.evidence} onClose={() => setSciCard(null)} /> : null

  // Tüm kayıt (JSON). iPhone'da <a download> WKWebView'da güvenilir değil (doğrulanmadı) → paylaşım sayfası
  // (ExportPlugin.swift); web'de indirme. Oturum anahtarları ayrı kayıtta (supabase.js storageKey), dosyaya girmez.
  const exportData = () => {
    shareTextFile(`nefona-tum-veriler-${fileStamp()}.json`, store.exportJSON(), 'application/json').catch(() => {})
  }
  const finishAccount = async (acc, extra = {}) => {
    store.setSetting('account', acc)
    if (signedIn(acc)) {
      linkPurchaser(acc.userId)
      try {
        const cur = store.get().settings
        const local = { ...cur.identity, name: cur.identity?.name || extra.givenName || '' }
        const m = mergeProfile(await pullProfile(acc.userId), local, currentCorrection())
        store.setSetting('identity', m.identity)
        if (m.correction) store.setSetting('setupCorrection', m.correction)
        if (cur.identitySetup) syncUp(m.identity, m.correction)
      } catch {
        // ağ yok ya da tablo kurulmamış: bilgiler telefonda kalır, sonraki kayıtta eşitlenir
      }
    }
    refresh()
    if (screen === 'account') go('profile')
  }
  if (screen === 'account') return <AccountStart onDone={finishAccount} onCancel={() => go('profile')} />
  if (first === 'account') return <AccountStart onDone={finishAccount} />
  if (first === 'onboarding') {
    // İlk açılış kurulumu (lib/setupFlow.js; karar 2026-09-29 (b)): güvenlik bilgisi → iris haritasının 4 sorusu. İlk Bakış
    // hesaptan önce yapıldı (sonucu yoksa ya da geçersizse burada, güvenlik bilgisinden sonra). Hesaptan sonra, "Seni
    // tanıyalım"dan ve denemeden önce. Güvenlik bilgi ekranıdır; uygulama
    // hiçbir durumda kilitlenmez (sahibinin kararı: "bilgi olarak çıkmalı, uygulama kullanılabilmeli"). Eski sürümde
    // işaret seçip kilitli kalanlar (screening.referred) da artık geçer.
    // Doğum tarihi ve gözlük daha önce girildiyse (eski sıra) anketin yaş ve gözlük alanlarını önceden doldurur
    const setupAge = ageBandFromAge(ageFromBirthDate(settings.identity?.birthDate))
    // İlk Bakış kurulumdan önce yapıldı (lib/setupFlow.js): sonucu kurulumun ilk ekranından itibaren profilde; kurulum
    // bitince ayrı kayıt silinir
    const initial = withPendingLook(settings.profile ?? { ...profileFromScreening(settings.screening), ...(setupAge ? { ageBand: setupAge } : {}), ...(settings.setupCorrection ? { correction: settings.setupCorrection } : {}) }, settings)
    const finishSetup = (p) => {
      applySetup(afterSetup())
      saveProfile(p)
    }
    return <Onboarding initial={initial} trueDepth={native.trueDepth} sessions={sessions} domainOf={domainOfSession} onDone={finishSetup} />
  }
  if (!settings.identitySetup) {
    const done = (id, corr) => {
      store.setSetting('identity', id)
      store.setSetting('setupCorrection', corr)
      store.setSetting('identitySetup', { date: nowIso() })
      const p = settings.profile
      const band = ageBandFromAge(ageFromBirthDate(id.birthDate))
      if (p && ((band && p.ageBand !== band) || (corr && p.correction !== corr))) saveProfile({ ...p, ageBand: band ?? p.ageBand, correction: corr ?? p.correction })
      else refresh()
      syncUp(id, corr)
    }
    // 18 yaş altı: kurulum burada durur; hesap açıldıysa sunucudaki kaydı silmenin yolu bu ekranda (Profilim'e ulaşılamaz)
    const deleteMinor = signedIn(settings.account)
      ? async () => {
          try {
            await deleteAccount()
          } catch (e) {
            return friendlyError(e) ?? 'Hesap silinemedi. Biraz sonra yeniden dene.'
          }
          unlinkPurchaser()
          store.setSetting('account', { mode: 'guest', date: nowIso() })
          refresh()
          return null
        }
      : null
    return <ProfileSetup identity={settings.identity} correction={currentCorrection()} account={settings.account} onSave={done} onDeleteAccount={deleteMinor} />
  }
  // İris haritan: kurulumun sonunda bir kez, denemeden önce (yalnız yeni kurulumda başlangıç haritası varsa)
  if (!settings.irisPlanSeen && settings.profile?.iris?.baseline && screen !== 'evidence') {
    return <IrisPlan profile={settings.profile} name={settings.identity?.name ?? ''} sessions={sessions} domainOf={domainOfSession} onDone={() => { store.setSetting('irisPlanSeen', { date: nowIso() }); refresh() }} />
  }
  // Deneme teklifi bir kez, iris haritasından hemen sonra. Web'de ödeme yok (atlanır); test derlemesinde "geç" ile görülebilir.
  if (!settings.trialOffer && !access.loading && access.native && (!access.premium || access.testUnlock) && screen !== 'evidence') {
    return (
      <Paywall
        filled={irisFilled(settings.profile, sessions)}
        onUnlocked={() => { store.setSetting('trialOffer', { date: nowIso(), started: true }); setAccess({ loading: false, premium: true, native: true }); refresh() }}
        onSkip={access.testUnlock ? () => { store.setSetting('trialOffer', { date: nowIso(), skipped: true }); refresh() } : null}
        onSafety={() => go('evidence')}
        onExport={exportData}
      />
    )
  }
  if (screen === 'whatsnew') return <WhatsNew releases={RELEASES} title="Yenilikler" back onClose={() => go('info')} />
  // Güncellemeden sonra ilk açılışta bir kez: görülmemiş sürüm notları
  const unseen = unseenReleases(settings.releaseSeen)
  if (unseen.length && screen !== 'evidence') {
    return <WhatsNew releases={unseen} onClose={() => { store.setSetting('releaseSeen', latestRelease().id); refresh() }} />
  }
  // 5. gün "İlk rapor" (Gelişim 2.0): deneme/kurulum başlangıcından 5–14. gün arası bir kez kendiliğinden; her zaman açılabilir
  const reportStart = settings.trialOffer?.date ?? settings.identitySetup?.date ?? null
  const rDay = reportDay(reportStart)
  const closeReport = (to) => { store.setSetting('firstReportSeen', { date: new Date().toISOString() }); refresh(); go(to) }
  // 28. gün: iris haritası yeniden (Ana sayfa kartı)
  if (screen === 'iris-recheck') {
    return <IrisRecheck profile={settings.profile} trueDepth={native.trueDepth} name={settings.identity?.name ?? ''} sessions={sessions} domainOf={domainOfSession} onSave={saveProfile} onClose={() => go('home')} />
  }
  if (screen === 'first-report' || (!settings.firstReportSeen && rDay >= REPORT_DAY && rDay <= 14 && screen === 'home')) {
    return <FirstReport tests={tests} sessions={sessions} start={reportStart} onClose={() => closeReport('home')} onProgress={() => closeReport('progress')} />
  }
  if (screen === 'profile') {
    // Profilim (screens/ProfileHome.jsx): ad, doğum tarihi, avatar cihazda kalır; doğum tarihi anketin yaş aralığını doldurur.
    const saveIdentity = (id, correction) => {
      store.setSetting('identity', id)
      const age = ageFromBirthDate(id.birthDate)
      const band = ageBandFromAge(age)
      const p = settings.profile ?? profileFromScreening(settings.screening)
      if (p && ((band && p.ageBand !== band) || (correction && p.correction !== correction))) {
        saveProfile({ ...p, ageBand: band ?? p.ageBand, correction: correction ?? p.correction })
      } else refresh()
      syncUp(id, correction ?? p?.correction ?? null)
    }
    const toGuest = () => { unlinkPurchaser(); store.setSetting('account', { mode: 'guest', date: nowIso() }); refresh() }
    // Profil → Alarm (Artifact v4): özet, "Ana sayfada göster" (prefs.alarmCard), uyku sesi
    const alarmProfile = () => {
      const a = loadAlarm()
      const n = new Date()
      const next = nextRing(a, n)
      return {
        time: next ? hhmm(minOfDay(next)) : null,
        days: next ? daysLabel(a.days) : null,
        sound: next ? (a.kind === 'notify' ? 'Bildirim' : soundById(a.sound).name) : null,
        sleep: next && a.sleep !== 'off' ? (a.sleep === 'auto' ? `Sana göre · şu an ${latency(loadAlarmLog())} dk` : `${a.sleep} dk`) : null,
        onOpen: () => go('alarm-pro'),
        onSleep: () => go('alarm-sleep-pro'),
      }
    }
    return (
      <ProfileHome
        identity={settings.identity}
        profile={settings.profile ?? profileFromScreening(settings.screening)}
        onSave={saveIdentity}
        onQuestions={() => go('profile-questions')}
        onIntro={() => go('intro')}
        onBack={() => go(lastTab)}
        account={settings.account}
        syncConsent={hasConsent(settings.consents, 'profileSync')}
        onConsent={(g) => setConsent('profileSync', g)}
        healthAvail={Boolean(healthAvail)}
        healthConsent={healthShow}
        onHealthConsent={(g) => setConsent('health', g)}
        consents={settings.consents}
        onCoach={setCoach}
        onCoachLife={setCoachLife}
        alarm={alarmSt.platform === 'web' ? null : alarmProfile()}
        // Profil → Bildirimler özeti (PLAN.v1 §A.5, alarm özetinin kalıbı): Alarm bölümünden sonra; yalnız iPhone'da
        notify={isIOSApp() ? { on: normalizeReminders(settings.reminders).optIn === 'yes', onOpen: () => go('notifications') } : null}
        onAccount={() => go('account')}
        onSignOut={async () => { try { await signOut() } catch { /* çevrimdışı: yerel oturum yine kapanır */ } toGuest() }}
        onDeleteAccount={async () => {
          try {
            await deleteAccount()
          } catch (e) {
            return friendlyError(e) ?? 'Hesap silinemedi. Biraz sonra yeniden dene.'
          }
          toGuest()
          return null
        }}
      />
    )
  }
  // Profil → Bildirimler ve Gece sessizliği (PLAN.v1 §A.5; screens/Notifications.jsx, screens/QuietHours.jsx)
  if (screen === 'notifications') {
    return (
      <>
        <Notifications
          modules={registry.reminders()}
          moduleReminders={settings.moduleReminders}
          reminders={settings.reminders}
          quiet={settings.quiet ?? null}
          next={nextNotify()}
          onToggle={toggleRemind}
          onToggleLegacy={(t, on) => { const r = normalizeReminders(settings.reminders); saveReminders({ ...r, types: { ...r.types, [t]: { ...r.types[t], on } } }) }}
          onOpen={(id) => setRemindFor({ module: id })}
          onOpenReminders={() => go('reminders')}
          onQuiet={() => go('quiet-hours')}
          onBack={() => go('profile')}
        />
        {remindSheet()}
      </>
    )
  }
  if (screen === 'quiet-hours') {
    return <QuietHours quiet={settings.quiet ?? null} reminders={settings.reminders} onChange={(q) => { store.setSetting('quiet', q); refresh() }} onOpenReminders={() => go('reminders')} onBack={() => go('notifications')} />
  }
  if (screen === 'profile-questions') {
    return <ProfileQuestions profile={settings.profile ?? profileFromScreening(settings.screening)} trueDepth={native.trueDepth} onSave={saveProfile} onBack={() => go('profile')} />
  }
  if (!isIOSApp() && (!calibrationStillValid(settings.calibration) || screen === 'recalibrate')) {
    return (
      <CardCalibration
        initial={settings.calibration}
        changed={Boolean(settings.calibration) && screen !== 'recalibrate'}
        autoReason={native.autoReason}
        onDone={(c) => { store.setSetting('calibration', c); refresh(); go(lastTab) }}
      />
    )
  }
  if (!settings.distance || screen === 'recalibrate-distance') {
    const done = (d) => { store.setSetting('distance', d); refresh(); go(lastTab) }
    // Bilgi'den açılınca (kayıt var) atlama yerine Vazgeç: ayar değişmeden geri döner
    const again = Boolean(settings.distance)
    if (native.trueDepth) {
      return again
        ? <DistanceHud step={setupTotal} total={setupTotal} onDone={done} onCancel={() => go(lastTab)} />
        : <DistanceHud step={setupTotal} total={setupTotal} onDone={done} onSkip={() => done({ skipped: true, via: 'truedepth', date: new Date().toISOString() })} />
    }
    return <DistanceCalibration onDone={done} onSkip={() => done({ skipped: true, date: new Date().toISOString() })} />
  }

  // --- Abonelik kilidi: deneme ilk kurulumda başlar (Build 23b); abonelik/deneme yoksa ödeme ekranı ---
  const previewPaywall = new URLSearchParams(window.location.search).get('paywall') === 'preview'
  const locked = previewPaywall || (!access.loading && !access.premium)
  if (locked && screen !== 'evidence') {
    return (
      <Paywall
        filled={irisFilled(settings.profile, sessions)}
        preview={previewPaywall}
        onUnlocked={() => { setAccess({ loading: false, premium: true, native: true }); go('home') }}
        onSafety={() => go('evidence')}
        onExport={exportData}
      />
    )
  }
  if (locked && screen === 'evidence') return <Evidence onBack={() => go('home')} />

  // --- Kişisel göz kalibrasyonu: göz kontrollü ekrandan önce (TrueDepth, model yoksa) ---
  if (gazeFor) {
    const target = gazeFor.to
    return (
      <GazeCalibration
        onDone={() => go(target)}
        onSkip={() => { gazeSkipped.current = true; go(target) }}
        onCancel={() => { setGazeFor(null); window.scrollTo(0, 0) }}
      />
    )
  }

  // --- Zorunlu mola (göz bütçesi) ---
  if (lockFor) {
    const target = lockFor.to
    return (
      <RestLock
        key={target ?? 'rest'}
        target={target}
        targetLabel={target ? activityLabel(target) : ''}
        onGo={(r) => {
          setLockFor(null)
          go(r)
        }}
        onHome={() => {
          setLockFor(null)
          go('home')
        }}
      />
    )
  }

  // --- Yerinde profil sorusu (tek soruluk ekranlar) ---
  if (askFor) {
    const { ids, then, back: backTo } = askFor
    return (
      <QuestionFlow
        key={ids.join(',')}
        ids={ids}
        profile={settings.profile ?? profileFromScreening(settings.screening)}
        onSave={saveProfile}
        onDone={() => { setAskFor(null); go(then, { noAsk: true }) }}
        onClose={() => { setAskFor(null); go(backTo ?? lastTab, { noAsk: true }) }}
      />
    )
  }

  // Oyun oturumları (type 'game') egzersiz süresine ve takvimdeki çalışma günlerine sayılmaz
  // (Home.jsx'teki haftalık hedef/günlük süre ile tutarlı). Gelişim de oyunları gün/seri/hafta sayımına
  // katmaz; oyunları yalnızca listeler (lib/stats.js countsTowardGoal).
  const exercise = sessions.filter(isExerciseSession) // oyun ve WHO-5 hariç

  // --- Tam ekran akışlar (sekme çubuğu yok) ---
  const saveTests = (results) => {
    ;[].concat(results).forEach((r) => store.addTest(r))
    refresh()
    go('progress')
  }
  const common = { calibration: settings.calibration, distanceCal, onCancel: back }

  // --- Modül ekranları (src/modules): ekran adını tanıyan modül kendi ekranını çizer ---
  const mod = registry.forRoute(screen)
  const view = mod && viewFor(mod.id)
  if (view) {
    // refresh: kayıt (mola/su habit-log, nefes oturumu) ya da çalışma oturumu değişti → bildirim planı da yenilenir
    const ctx = { native: { ...native, trueDepth: camOk }, settings, tests, sessions, exercise, common, go, back, refresh: () => { refresh(); replan() }, store, saveTests, focusBlock, remindField, fromPath: pathRoute.current === screen }
    return (
      <>
        {view.render(ctx, screen)}
        {budgetKind && <EyeBudgetPill st={budget} kind={budgetKind} />}
        {sciEl}
      </>
    )
  }

  switch (screen) {
    case 'schedule':
      return <Schedule initial={settings.reminder} reminders={settings.reminders} iosApp={isIOSApp()} onBack={() => go(scheduleBack)} onSave={(r) => { store.setSetting('reminder', r); refresh() }} />
    case 'reminders':
      return (
        <>
          <Reminders
            reminders={settings.reminders}
            study={settings.reminder}
            permission={notifyPerm}
            healthConsent={healthOk}
            stepsMissing={Boolean(healthOk && health && !health.hasData)}
            focus={loadFocus()}
            onSave={saveReminders}
            onStudy={() => openSchedule('reminders')}
            onAskPermission={askPermission}
            // HealthKit yoksa (web, bazı iPad'ler) izin yolu yok: Reminders düğme yerine nedenini yazar
            onAskHealth={healthAvail === false ? undefined : () => healthAvail && setHealthSheet(true)}
            onStartFocus={beginFocus}
            onStopFocus={endFocus}
            onBack={() => go('info')}
          />
          {healthSheet && <ConsentSheet kind={healthSheetKind} onAnswer={(g) => { setHealthSheet(false); answerHealth(g) }} />}
        </>
      )
    case 'evidence':
      return <Evidence onBack={() => go('info')} />
    case 'gaze-test':
      return <GazeTest onBack={() => go('info')} onCalibrate={() => go('gaze-cal')} />
    case 'gaze-cal':
      return <GazeCalibration onDone={() => go('gaze-test')} onCancel={() => go('info')} />
    default:
      break
  }

  // --- Sekmeli ekranlar ---
  const tab = TAB_SCREENS.includes(screen) ? screen : 'home'
  let content
  if (tab === 'progress') content = <Progress tests={tests} sessions={sessions} profile={settings.profile} identity={settings.identity} health={health} weeklyTarget={settings.reminder?.weeklyTarget} reportDay={rDay} nudges={nudgeStats()} notifyOff={isIOSApp() && notifyPerm != null && notifyPerm !== 'granted'} onStart={go} />
  else if (tab === 'calendar') content = <Calendar records={[...tests, ...exercise]} schedule={settings.reminder} onEditSchedule={() => openSchedule('calendar')} />
  else if (tab === 'info') {
    content = (
      <Info
        onGo={(s) => (s === 'schedule' ? openSchedule('info') : go(s))}
        iosApp={isIOSApp()}
        trueDepth={native.trueDepth}
        calibration={settings.calibration}
        distanceSkipped={!distanceCal}
        consents={settings.consents}
        onCoach={setCoach}
        onExport={exportData}
        onReset={() => {
          // iPhone'da ekran ölçüsü cihaz modelinden gelir (kullanıcı verisi değil) ve yalnızca açılışta yazılır.
          // Silinirse testler uygulama yeniden açılana dek ölçeksiz kalır (AcuityTest calibration.pxPerMm → hata).
          const autoCal = isIOSApp() && settings.calibration?.method === 'auto' ? settings.calibration : null
          // Kayıt (settings.moduleReminders ve gece sessizliği dâhil) silinir; deneme çizelgesi (TRIAL_KEYS) kalır.
          // Bildirimler: kendi aralığımız (74xx/75xx, 7700–7701, 78xx, 7860–7867) ve yalnız-iptal 7710–7719 iptal;
          // native yürüyüş koruması boşalır (cancelOwn); gozolcum:notify-slots silinir. Deneme hatırlatması (7302)
          // kalır. (lib/notifyReset.js resetAllData; sıra bugünküyle aynı: önce kayıt)
          resetAllData({ store, cancel: cancelOwn, autoCal })
          // Modüllerin cihazdaki rekorları ve seçenekleri de silinir (manifest storageKeys);
          // ses/titreşim tercihleri ve tema cihaz ayarı sayılır ve korunur.
          resetBudget(); resetAllHowto()
          // Günlüğü okunup atılır. Günlük, tohum, habit-log ve çalışma oturumu mola modülünün storageKeys listesinden
          // aşağıda silinir.
          cancelAlarm()
          walkGuardLog().catch(() => {})
          // Yoga (modul.md §6.4): süren ders durur ve bellekteki oturumu unutulur (silmeden önceki önce puanı ders bitince
          // yeniden yazılmasın); yerel oynatıcının ders kaydı (UserDefaults) localStorage'da değil, o da silinir
          resetLessonData().catch(() => {})
          for (const k of registry.resetKeys()) {
            try {
              localStorage.removeItem(k)
            } catch {
              // depolama yok: yoksay
            }
          }
          setSciCard(null)
          setRemindFor(null)
          refresh()
          go('home')
        }}
      />
    )
  } else {
    content = (
      <Home
        tests={tests} sessions={sessions} settings={settings} distanceTracked={Boolean(distanceCal)} trueDepth={camOk} eyeBudget={budget}
        premium={access.loading || access.premium} member={Boolean(access.native && access.premium && !access.testUnlock)}
        askConsent={signedIn(settings.account) && shouldAsk(settings.consents, 'profileSync')} onConsent={(g) => setConsent('profileSync', g)}
        health={health}
        askHealth={Boolean(healthAvail) && !(signedIn(settings.account) && shouldAsk(settings.consents, 'profileSync')) && shouldAsk(settings.consents, 'health')}
        onHealthConsent={answerHealth}
        healthSheetKind={healthSheetKind}
        onCoach={setCoach} onStart={go}
        onAsk={(group) => { if (group === 'iris') { go('iris-recheck'); return } const ids = missing(settings.profile, GROUPS[group] ?? []); if (ids.length) setAskFor({ ids, then: 'home', back: 'home' }) }}
        onSaveProfile={saveProfile}
        // Hatırlatma kartı yalnız iPhone uygulamasında (web'de bildirim yok); Home rıza sayfası açıkken göstermez
        reminderAsk={isIOSApp() && normalizeReminders(settings.reminders).optIn == null}
        onReminders={answerReminders}
        focus={loadFocus()}
        focusBlock={focusBlock}
        onStopFocus={endFocus}
        trialNote={trialNote}
        onTrialNote={() => { store.setSetting('trialNoteSeen', { date: nowIso() }); refresh() }}
        thinAsk={thinAsk}
        onThin={answerThin}
        alarmStatus={alarmSt}
        alarmTest={Boolean(access.testUnlock)}
        onYogaMorning={refresh}
      />
    )
  }

  return (
    <>
      <main className="screen has-tabbar fade-in" key={tab}>{content}</main>
      <TabBar active={tab} onChange={go} />
      {sciEl}
    </>
  )
}
