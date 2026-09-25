import { useEffect, useRef, useState } from 'react'
import { store } from './lib/storage.js'
import { TabBar } from './components/ui.jsx'
import RestBreak from './components/RestBreak.jsx'
import Home from './screens/Home.jsx'
import Screening from './screens/Screening.jsx'
import CardCalibration, { calibrationStillValid } from './screens/CardCalibration.jsx'
import DistanceCalibration from './screens/DistanceCalibration.jsx'
import Progress from './screens/Progress.jsx'
import Calendar from './screens/Calendar.jsx'
import Schedule from './screens/Schedule.jsx'
import Evidence from './screens/Evidence.jsx'
import Info from './screens/Info.jsx'
import Paywall from './screens/Paywall.jsx'
import { getAccess } from './lib/subscription.js'
import DistanceHud from './screens/DistanceHud.jsx'
import { isIOSApp, getDeviceModel, getScreenInfo, trueDepthSupported, initFeedback, installTapHaptics } from './lib/native.js'
import { resolveAutoCalibration, estimateCalibration } from './lib/screenScale.js'
import { registry } from './modules/registry.js'
import { viewFor } from './modules/views.js'
import IPHONE_SCREENS from './lib/iphoneScreens.json'
import GazeCalibration from './screens/GazeCalibration.jsx'
import GazeTest from './screens/GazeTest.jsx'
import { hasGazeModel } from './lib/gazeCalib.js'

const TAB_SCREENS = ['home', 'progress', 'calendar', 'info']

// --- Dinlenme kuralı (konfor molası) ---
// Yakına odaklanılan "aktif" ekranlarda (ölçüm, egzersiz, oyun) geçen süre birikir. Toplam eşiği geçince
// bir sonraki ölçüme ya da oyuna (REST_GATED) GEÇMEDEN ÖNCE tam ekran RestBreak gösterilir ("Atla" var).
// Mola bitince ya da atlanınca sayaç sıfırlanır; ✕ ile kapatılırsa sıfırlanmaz, sonraki geçişte yine sorulur.
// Ekran içindeki molalar (E testi gözler arası, Yılan) da RESTED_EVENT ile sayacı sıfırlar; böylece mola
// biter bitmez ikinci bir mola çıkmaz ve molanın kendi süresi yakın süreye sayılmaz.
// Kanıt notu: 20-20-20 kuralının semptomlara etkisi gösterilemedi (Johnson & Rosenfield 2022,
// DOI 10.1097/OPX.0000000000001971; ayrıntı components/RestBreak.jsx). Bu yüzden mola zorunlu değil ve
// metin sağlık iddiası taşımaz.
// VARSAYIM: 10 dk eşiği (kanıt düşük; yalnızca konfor molası).
const REST_AFTER_MS = 10 * 60 * 1000
// VARSAYIM: aktif ekran dışında (sekmeler, uygulama arka planda) art arda 5 dk geçerse bu doğal bir mola
// sayılır ve sayaç sıfırlanır. Yoksa iOS'ta arka planda günlerce açık kalan uygulamada dünkü dakikalar
// bugünün ilk etkinliğine mola çıkarırdı.
const REST_IDLE_RESET_MS = 5 * 60 * 1000
const REST_SECONDS = 20
// Hangi ekranın yakın odak süresine sayıldığı (gates.active) ve önüne mola sorulduğu (gates.rest)
// modül manifestlerinden gelir (src/modules). Egzersiz setleri ve göz kırpma zaten "Uzağa bak" /
// "Gözlerini kapat" adımları içerir; önlerine ayrıca mola konmaz ama süreleri birikir.
const gatesOf = (s) => registry.forRoute(s)?.gates ?? {}
const isActiveScreen = (s) => Boolean(gatesOf(s).active)
// Ekran içindeki RestBreak bitince/atlanınca window'a yayılan olay (components/RestBreak.jsx ile aynı ad).
const RESTED_EVENT = 'gozolcum:rested'

// Mola metninde cümle içinde geçer ("Sırada günlük test var."): modülün label'ı.
const activityLabel = (s) => registry.labelFor(s)

// c: { ms: birikmiş aktif süre, since: şu anki aktif aralığın başı | null, idleFrom: aktiflikten çıkış | null }
function readClock(c, now) {
  if (c.since == null && c.idleFrom != null && now - c.idleFrom >= REST_IDLE_RESET_MS) {
    c.ms = 0
    c.idleFrom = null
  }
  return c.ms + (c.since != null ? Math.max(0, now - c.since) : 0)
}

function resetClock(c) {
  c.ms = 0
  c.idleFrom = null
  if (c.since != null) c.since = Date.now()
}

// Aktif ekranda ve uygulama görünürken geçen duvar saati süresini biriktirir (arka plan sayılmaz).
function useActiveTime(active) {
  const clock = useRef({ ms: 0, since: null, idleFrom: null })
  useEffect(() => {
    const c = clock.current
    const pause = () => {
      if (c.since == null) return
      const now = Date.now()
      c.ms += Math.max(0, now - c.since)
      c.since = null
      c.idleFrom = now
    }
    const resume = () => {
      if (!active || c.since != null || document.visibilityState === 'hidden') return
      const now = Date.now()
      readClock(c, now) // uzun aradan sonra önce sıfırla
      c.since = now
    }
    const onVis = () => (document.visibilityState === 'hidden' ? pause() : resume())
    resume()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      pause()
    }
  }, [active])
  // Ekran içindeki molalar (E testi gözler arası, Yılan) sayacı sıfırlar.
  useEffect(() => {
    const onRested = () => resetClock(clock.current)
    window.addEventListener(RESTED_EVENT, onRested)
    return () => window.removeEventListener(RESTED_EVENT, onRested)
  }, [])
  return {
    read: () => readClock(clock.current, Date.now()),
    reset: () => resetClock(clock.current),
  }
}

export default function App() {
  const [data, setData] = useState(store.get())
  const [screen, setScreen] = useState('home')
  const [lastTab, setLastTab] = useState('home')
  // Molası bekleyen hedef: { to: ekran, min: birikmiş dakika } | null
  const [restFor, setRestFor] = useState(null)
  // Göz kalibrasyonu bekleyen hedef (TrueDepth'te göz kontrollü ekrandan önce, bir kez): { to } | null
  const [gazeFor, setGazeFor] = useState(null)
  const gazeSkipped = useRef(false) // "Şimdi değil" → bu oturumda tekrar sorma
  const activeTime = useActiveTime(isActiveScreen(screen))
  const refresh = () => setData(store.get())
  const go = (s) => {
    const needsGaze = Boolean(gatesOf(s).gaze)
    if (needsGaze && native.trueDepth && !gazeSkipped.current && !hasGazeModel()) {
      setGazeFor({ to: s })
      window.scrollTo(0, 0)
      return
    }
    setGazeFor(null)
    const due = activeTime.read()
    if (gatesOf(s).rest && due >= REST_AFTER_MS) {
      setRestFor({ to: s, min: Math.floor(due / 60000) })
      window.scrollTo(0, 0)
      return
    }
    setRestFor(null)
    if (TAB_SCREENS.includes(s)) setLastTab(s)
    setScreen(s)
    window.scrollTo(0, 0)
  }
  const back = () => go(lastTab)

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
  // iPhone'da TrueDepth varsa mesafe her zaman sensörden gelir (eski kamera kalibrasyonu yok sayılır).
  const distanceCal = native.trueDepth
    ? { method: 'truedepth' }
    : settings.distance?.irisPxAt40 || settings.distance?.method === 'truedepth' ? settings.distance : null
  const setupTotal = native.autoScreen ? 2 : 3

  if (!native.checked) {
    return <main className="screen"><p className="muted">Hazırlanıyor…</p></main>
  }

  // --- Kurulum akışı (web: 3 adım; iPhone otomatik ekranla: 2 adım) ---
  if (!settings.screening || settings.screening.referred) {
    return <Screening total={setupTotal} onDone={(s) => { store.setSetting('screening', s); refresh() }} />
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
    if (native.trueDepth) return <DistanceHud step={setupTotal} total={setupTotal} onDone={done} />
    return <DistanceCalibration onDone={done} onSkip={() => done({ skipped: true, date: new Date().toISOString() })} />
  }

  // --- Abonelik kilidi: ilk ölçüm ücretsiz, sonra ödeme ekranı ---
  const previewPaywall = new URLSearchParams(window.location.search).get('paywall') === 'preview'
  const firstTestFree = tests.length === 0 && (screen === 'daily' || screen === 'weekly' || screen === 'home')
  const locked = previewPaywall || (!access.loading && !access.premium && !firstTestFree)
  if (locked && screen !== 'evidence') {
    return (
      <Paywall
        preview={previewPaywall}
        onUnlocked={() => { setAccess({ loading: false, premium: true, native: true }); go('home') }}
        onSafety={() => go('evidence')}
        onExport={() => {
          const url = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' }))
          const a = document.createElement('a')
          a.href = url
          a.download = 'eyelume-veriler.json'
          a.click()
          setTimeout(() => URL.revokeObjectURL(url), 5000)
        }}
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

  // --- Konfor molası: aktif ekrana geçmeden önce (bkz. dinlenme kuralı, dosya başı) ---
  if (restFor) {
    const target = restFor.to
    const label = activityLabel(target)
    const proceed = () => {
      activeTime.reset()
      go(target)
    }
    // ✕: hedefe gitmeden bulunduğun ekrana dön. Sayaç sıfırlanmaz; sonraki geçişte mola yine sorulur.
    const close = () => {
      setRestFor(null)
      window.scrollTo(0, 0)
    }
    return (
      <RestBreak
        key={target}
        seconds={REST_SECONDS}
        trueDepth={native.trueDepth}
        title="Kısa bir mola"
        subtitle={`${restFor.min} dakikadır yakına odaklanıyorsun.${label ? ` Sırada ${label} var.` : ''} Önce pencereden dışarı, 6 metreden uzak bir noktaya bak.`}
        doneText={label ? `Hazırsın, ${label} başlıyor` : 'Hazırsın, devam edebilirsin'}
        onDone={proceed}
        onSkip={proceed}
        onClose={close}
      />
    )
  }

  // Oyun oturumları (type 'game') egzersiz süresine ve takvimdeki çalışma günlerine sayılmaz
  // (Home.jsx'teki haftalık hedef/günlük süre ile tutarlı). Gelişim de oyunları gün/seri/hafta sayımına
  // katmaz; oyunları yalnızca listeler (lib/stats.js countsTowardGoal).
  const exercise = sessions.filter((s) => s.type !== 'game')

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
    const ctx = { native, settings, tests, sessions, exercise, common, go, back, refresh, store, saveTests }
    return view.render(ctx, screen)
  }

  switch (screen) {
    case 'schedule':
      return <Schedule initial={settings.reminder} onBack={() => go('calendar')} onSave={(r) => { store.setSetting('reminder', r); refresh() }} />
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
  if (tab === 'progress') content = <Progress tests={tests} sessions={sessions} weeklyTarget={settings.reminder?.weeklyTarget} onStart={go} />
  else if (tab === 'calendar') content = <Calendar records={[...tests, ...exercise]} schedule={settings.reminder} onEditSchedule={() => go('schedule')} />
  else if (tab === 'info') {
    content = (
      <Info
        onGo={go}
        iosApp={isIOSApp()}
        trueDepth={native.trueDepth}
        calibration={settings.calibration}
        distanceSkipped={!distanceCal}
        exportJSON={store.exportJSON}
        onReset={() => {
          // iPhone'da ekran ölçüsü cihaz modelinden gelir (kullanıcı verisi değil) ve yalnızca açılışta yazılır.
          // Silinirse testler uygulama yeniden açılana dek ölçeksiz kalır (AcuityTest calibration.pxPerMm → hata).
          const autoCal = isIOSApp() && settings.calibration?.method === 'auto' ? settings.calibration : null
          store.clearAll()
          if (autoCal) store.setSetting('calibration', autoCal)
          // Modüllerin cihazdaki rekorları ve seçenekleri de silinir (manifest storageKeys);
          // ses/titreşim tercihleri ve tema cihaz ayarı sayılır ve korunur.
          for (const k of registry.resetKeys()) {
            try {
              localStorage.removeItem(k)
            } catch {
              // depolama yok: yoksay
            }
          }
          refresh()
          go('home')
        }}
      />
    )
  } else {
    content = <Home tests={tests} sessions={sessions} settings={settings} distanceTracked={Boolean(distanceCal)} trueDepth={native.trueDepth} onStart={go} />
  }

  return (
    <>
      <main className="screen has-tabbar fade-in" key={tab}>{content}</main>
      <TabBar active={tab} onChange={go} />
    </>
  )
}
