import { useState } from 'react'
import { AlarmClock } from 'lucide-react'
import AlarmSetup from '../../screens/AlarmSetup.jsx'
import AlarmMorning from '../../screens/AlarmMorning.jsx'
import Dalga from '../../screens/Dalga.jsx'
import { loadAlarm, loadAlarmLog, addAlarmEvent } from '../../lib/alarmLog.js'
import { sleepMinutes, lateSleepMinutes, nextRing, lastRing, hhmm, minOfDay } from '../../lib/alarm.js'

// Uyku sesi: Dalga uyku ekranı, süre alarm kuralından (lib/alarm.js sleepMinutes)
// Süre ekran açılınca bir kez hesaplanır (çalarken yeniden çizimde kaymasın)
function AlarmSleep({ ctx, back = 'home' }) {
  const [preset] = useState(() => {
    const now = new Date()
    const alarm = loadAlarm()
    const ring = nextRing(alarm, now)
    const log = loadAlarmLog()
    return { minutes: sleepMinutes(alarm, log, now) ?? 0, lateMinutes: lateSleepMinutes(alarm, log, now), auto: alarm?.sleep === 'auto', alarmLabel: ring ? hhmm(minOfDay(ring)) : null }
  })
  return (
    <Dalga
      sessions={ctx.sessions}
      sleepPreset={preset}
      onSleepEnd={(e) => addAlarmEvent('sleep', e)}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go(back)}
    />
  )
}

function Morning({ ctx }) {
  const alarm = loadAlarm()
  const action = ['dalga', 'light'].includes(alarm?.wake) ? alarm.wake : 'breath'
  const ringIso = () => lastRing(alarm, new Date())?.toISOString()
  const skip = () => {
    const r = ringIso()
    if (r) addAlarmEvent('wakeSkip', { ring: r })
    ctx.go('home')
  }
  const start = () => {
    if (action !== 'light') return ctx.go(action === 'breath' ? 'breath-1' : 'dalga')
    const r = ringIso()
    if (r) addAlarmEvent('wakeDone', { ring: r, action: 'light' })
    ctx.go('home')
  }
  return <AlarmMorning action={action} onStart={start} onSkip={skip} />
}

export default {
  icon: AlarmClock,
  render: (ctx, route) => {
    if (route === 'alarm-sleep') return <AlarmSleep ctx={ctx} />
    if (route === 'alarm-sleep-pro') return <AlarmSleep ctx={ctx} back="profile" />
    if (route === 'alarm-morning') return <Morning ctx={ctx} />
    // alarm-pro: Profil → Alarm'dan; bitince oraya döner
    const to = route === 'alarm-pro' ? 'profile' : 'home'
    return <AlarmSetup onDone={() => ctx.go(to)} onBack={() => ctx.go(to)} />
  },
}
