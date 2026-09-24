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

  const { settings, tests, sessions } = data
  const distanceCal = settings.distance?.irisPxAt40 ? settings.distance : null

  // --- Kurulum akışı (3 adım) ---
  if (!settings.screening || settings.screening.referred) {
    return <Screening onDone={(s) => { store.setSetting('screening', s); refresh() }} />
  }
  if (!calibrationStillValid(settings.calibration) || screen === 'recalibrate') {
    return (
      <CardCalibration
        initial={settings.calibration}
        changed={Boolean(settings.calibration) && screen !== 'recalibrate'}
        onDone={(c) => { store.setSetting('calibration', c); refresh(); go(lastTab) }}
      />
    )
  }
  if (!settings.distance || screen === 'recalibrate-distance') {
    const done = (d) => { store.setSetting('distance', d); refresh(); go(lastTab) }
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
      return <BlinkExercise onBack={back} onFinish={(s) => { store.addSession(s); refresh(); go('home') }} />
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
