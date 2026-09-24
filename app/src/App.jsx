import { useEffect, useState } from 'react'
import { store } from './lib/storage.js'
import { TabBar } from './components/ui.jsx'
import Home from './screens/Home.jsx'
import Screening from './screens/Screening.jsx'
import CardCalibration, { calibrationStillValid } from './screens/CardCalibration.jsx'
import DistanceCalibration from './screens/DistanceCalibration.jsx'
import AcuityTest from './screens/AcuityTest.jsx'
import ReadingTest from './screens/ReadingTest.jsx'
import Progress from './screens/Progress.jsx'
import Calendar from './screens/Calendar.jsx'
import Schedule from './screens/Schedule.jsx'
import BlinkExercise from './screens/BlinkExercise.jsx'
import Evidence from './screens/Evidence.jsx'
import Info from './screens/Info.jsx'
import Routine from './screens/Routine.jsx'
import { SETS, todaySeconds } from './lib/routines.js'
import Paywall from './screens/Paywall.jsx'
import { getAccess } from './lib/subscription.js'
import DistanceHud from './screens/DistanceHud.jsx'
import { isIOSApp, getDeviceModel, getScreenInfo, trueDepthSupported } from './lib/native.js'
import { resolveAutoCalibration, estimateCalibration } from './lib/screenScale.js'
import IPHONE_SCREENS from './lib/iphoneScreens.json'

const TAB_SCREENS = ['home', 'progress', 'calendar', 'info']

export default function App() {
  const [data, setData] = useState(store.get())
  const [screen, setScreen] = useState('home')
  const [lastTab, setLastTab] = useState('home')
  const refresh = () => setData(store.get())
  const go = (s) => {
    if (TAB_SCREENS.includes(s)) setLastTab(s)
    setScreen(s)
    window.scrollTo(0, 0)
  }
  const back = () => go(lastTab)

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

  // --- Tam ekran akışlar (sekme çubuğu yok) ---
  const saveTests = (results) => {
    ;[].concat(results).forEach((r) => store.addTest(r))
    refresh()
    go('progress')
  }
  const common = { calibration: settings.calibration, distanceCal, onCancel: back }

  switch (screen) {
    case 'daily':
    case 'weekly':
      return <AcuityTest key={screen} plan={screen} {...common} onFinish={saveTests} />
    case 'reading': {
      const recent = tests.filter((t) => t.type === 'reading').slice(-2).flatMap((t) => t.sentencesUsed ?? [])
      return <ReadingTest {...common} recentSentences={recent} onFinish={saveTests} />
    }
    case 'blink':
      return <BlinkExercise trueDepth={native.trueDepth} onBack={back} onFinish={(s) => { store.addSession(s); refresh(); go('home') }} />
    case 'schedule':
      return <Schedule initial={settings.reminder} onBack={() => go('calendar')} onSave={(r) => { store.setSetting('reminder', r); refresh() }} />
    case 'routine-lite':
    case 'routine-normal':
    case 'routine-full': {
      const set = SETS.find((s) => `routine-${s.id}` === screen)
      return (
        <Routine
          key={screen}
          set={set}
          todaySec={todaySeconds(sessions)}
          trueDepth={native.trueDepth}
          onBack={back}
          onFinish={(s) => { store.addSession(s); refresh(); go('home') }}
        />
      )
    }
    case 'evidence':
      return <Evidence onBack={() => go('info')} />
    default:
      break
  }

  // --- Sekmeli ekranlar ---
  const tab = TAB_SCREENS.includes(screen) ? screen : 'home'
  let content
  if (tab === 'progress') content = <Progress tests={tests} />
  else if (tab === 'calendar') content = <Calendar records={[...tests, ...sessions]} schedule={settings.reminder} onEditSchedule={() => go('schedule')} />
  else if (tab === 'info') {
    content = (
      <Info
        onGo={go}
        iosApp={isIOSApp()}
        calibration={settings.calibration}
        distanceSkipped={!distanceCal}
        exportJSON={store.exportJSON}
        onReset={() => { store.clearAll(); refresh(); go('home') }}
      />
    )
  } else {
    content = <Home tests={tests} sessions={sessions} settings={settings} distanceTracked={Boolean(distanceCal)} onStart={go} />
  }

  return (
    <>
      <main className="screen has-tabbar fade-in" key={tab}>{content}</main>
      <TabBar active={tab} onChange={go} />
    </>
  )
}
