import { useState } from 'react'
import { store } from './lib/storage.js'
import { analyzeTrend, trendMessage } from './lib/trend.js'
import { activeDays, weekProgress } from './lib/calendar.js'
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

const WEEK_MS = 7 * 86400000

export default function App() {
  const [data, setData] = useState(store.get())
  const [screen, setScreen] = useState('home')
  const [notice, setNotice] = useState(null)
  const refresh = () => setData(store.get())
  const go = (s) => {
    setNotice(null)
    setScreen(s)
    window.scrollTo(0, 0)
  }

  const { settings, tests, sessions } = data
  const distanceCal = settings.distance?.irisPxAt40 ? settings.distance : null

  // --- Kurulum akışı ---
  if (!settings.screening || settings.screening.referred) {
    return (
      <Screening
        onDone={(s) => {
          store.setSetting('screening', s)
          refresh()
        }}
      />
    )
  }
  if (!calibrationStillValid(settings.calibration) || screen === 'recalibrate') {
    return (
      <>
        {settings.calibration && screen !== 'recalibrate' && (
          <p className="alert-warn screen">Ekran ayarı veya yakınlaştırma değişmiş; lütfen kalibrasyonu yenileyin.</p>
        )}
        <CardCalibration
          initial={settings.calibration}
          onDone={(c) => {
            store.setSetting('calibration', c)
            refresh()
            go('home')
          }}
        />
      </>
    )
  }
  if (!settings.distance || screen === 'recalibrate-distance') {
    const done = (d) => {
      store.setSetting('distance', d)
      refresh()
      go('home')
    }
    return <DistanceCalibration onDone={done} onSkip={() => done({ skipped: true, date: new Date().toISOString() })} />
  }

  // --- Ekranlar ---
  const saveTests = (results) => {
    ;[].concat(results).forEach((r) => store.addTest(r))
    refresh()
    go('progress')
  }
  const common = { calibration: settings.calibration, distanceCal, onCancel: () => go('home') }

  switch (screen) {
    case 'daily':
    case 'weekly':
      return <AcuityTest plan={screen} {...common} onFinish={saveTests} />
    case 'reading': {
      const recent = tests.filter((t) => t.type === 'reading').slice(-2).flatMap((t) => t.sentencesUsed ?? [])
      return <ReadingTest {...common} recentSentences={recent} onFinish={saveTests} />
    }
    case 'blink':
      return (
        <BlinkExercise
          onBack={() => go('home')}
          onFinish={(s) => {
            store.addSession(s)
            refresh()
            go('home')
            setNotice('Egzersiz kaydedildi.')
          }}
        />
      )
    case 'progress':
      return <Progress tests={tests} onBack={() => go('home')} />
    case 'calendar':
      return (
        <Calendar
          records={[...tests, ...sessions]}
          schedule={settings.reminder}
          onBack={() => go('home')}
          onEditSchedule={() => go('schedule')}
        />
      )
    case 'schedule':
      return (
        <Schedule
          initial={settings.reminder}
          onBack={() => go('calendar')}
          onSave={(r) => {
            store.setSetting('reminder', r)
            refresh()
          }}
        />
      )
    case 'evidence':
      return <Evidence onBack={() => go('home')} />
    case 'settings':
      return <Settings onGo={go} onReset={() => { store.clearAll(); refresh(); go('home') }} exportJSON={store.exportJSON} distanceSkipped={!distanceCal} />
    default:
      break
  }

  // --- Ana sayfa ---
  const week = weekProgress(activeDays([...tests, ...sessions]), new Date(), settings.reminder?.weeklyTarget)
  const ou = tests.filter((t) => (t.type === 'va-daily' || t.type === 'va-weekly') && t.eye === 'OU')
  const trend = analyzeTrend(ou)
  const lastWeekly = tests.filter((t) => t.type === 'va-weekly').at(-1)
  const weeklyDue = !lastWeekly || Date.now() - new Date(lastWeekly.date).getTime() > WEEK_MS
  const lastReading = tests.filter((t) => t.type === 'reading').at(-1)
  const readingDue = !lastReading || Date.now() - new Date(lastReading.date).getTime() > WEEK_MS

  return (
    <main className="screen">
      <h1>Göz Ölçüm</h1>
      {notice && <p className="muted small" role="status">{notice}</p>}

      <section className={`card ${trend.alert === 'red' ? 'alert-danger' : trend.alert === 'yellow' ? 'alert-warn' : ''}`}>
        <p className="big">Bu hafta {week.done} / {week.target} gün</p>
        <p className="small">{trendMessage(trend)}</p>
        {!distanceCal && (
          <p className="muted small">Mesafe takibi kapalı; sonuçlar daha az güvenilir. Ayarlar'dan açabilirsiniz.</p>
        )}
      </section>

      <button className="btn" onClick={() => go(weeklyDue ? 'weekly' : 'daily')}>
        {weeklyDue ? 'Haftalık tam test (~5 dk)' : 'Günlük kısa test (~2 dk)'}
      </button>
      {weeklyDue && <button className="btn btn-ghost" onClick={() => go('daily')}>Sadece kısa test (~2 dk)</button>}
      <button className={readingDue ? 'btn' : 'btn btn-ghost'} onClick={() => go('reading')}>
        Okuma hızı testi {readingDue ? '(bu hafta yapılmadı)' : ''}
      </button>
      <button className="btn btn-ghost" onClick={() => go('blink')}>Göz kırpma egzersizi (~2,5 dk)</button>

      <nav className="grid-nav">
        <button className="tile" onClick={() => go('progress')}>Gelişim</button>
        <button className="tile" onClick={() => go('calendar')}>Takvim</button>
        <button className="tile" onClick={() => go('evidence')}>Kanıtlar</button>
        <button className="tile" onClick={() => go('settings')}>Ayarlar</button>
      </nav>

      <p className="muted small">
        Bu uygulama teşhis koymaz ve göz muayenesinin yerini tutmaz. Tüm verileriniz yalnızca bu cihazda saklanır.
      </p>
    </main>
  )
}

function Settings({ onGo, onReset, exportJSON, distanceSkipped }) {
  const [confirm, setConfirm] = useState(false)
  function download() {
    const url = URL.createObjectURL(new Blob([exportJSON()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'goz-olcum-veriler.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
  return (
    <main className="screen">
      <h1>Ayarlar</h1>
      <button className="btn btn-ghost" onClick={() => onGo('recalibrate')}>Ekran kalibrasyonunu yenile</button>
      <button className="btn btn-ghost" onClick={() => onGo('recalibrate-distance')}>
        {distanceSkipped ? 'Mesafe takibini aç' : 'Mesafe kalibrasyonunu yenile'}
      </button>
      <button className="btn btn-ghost" onClick={() => onGo('schedule')}>Çalışma günleri ve hatırlatma</button>
      <button className="btn btn-ghost" onClick={download}>Verilerimi indir (JSON)</button>
      {!confirm ? (
        <button className="btn btn-ghost danger" onClick={() => setConfirm(true)}>Tüm verileri sil</button>
      ) : (
        <div className="card alert-danger">
          <p>Tüm test sonuçlarınız ve ayarlarınız bu cihazdan silinecek. Geri alınamaz.</p>
          <button className="btn danger" onClick={onReset}>Evet, sil</button>
          <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Vazgeç</button>
        </div>
      )}
      <button className="btn btn-ghost" onClick={() => onGo('home')}>Geri</button>
    </main>
  )
}
