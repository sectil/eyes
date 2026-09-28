import { useState } from 'react'
import { AlarmClock } from 'lucide-react'
import AlarmSetup from '../../screens/AlarmSetup.jsx'
import AlarmMorning from '../../screens/AlarmMorning.jsx'
import Dalga from '../../screens/Dalga.jsx'
import { loadAlarm, loadAlarmLog, addAlarmEvent } from '../../lib/alarmLog.js'
import { sleepMinutes, nextRing, lastRing, hhmm, minOfDay } from '../../lib/alarm.js'

// Uyku sesi: Dalga uyku ekranı, süre alarm kuralından (lib/alarm.js sleepMinutes)
// Süre ekran açılınca bir kez hesaplanır (çalarken yeniden çizimde kaymasın)
function AlarmSleep({ ctx }) {
  const [preset] = useState(() => {
    const now = new Date()
    const alarm = loadAlarm()
    const ring = nextRing(alarm, now)
    return { minutes: sleepMinutes(alarm, loadAlarmLog(), now) ?? 0, auto: alarm?.sleep === 'auto', alarmLabel: ring ? hhmm(minOfDay(ring)) : null }
  })
  return (
    <Dalga
      sessions={ctx.sessions}
      sleepPreset={preset}
      onSleepEnd={(e) => addAlarmEvent('sleep', e)}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
    />
  )
}

function Morning({ ctx }) {
  const alarm = loadAlarm()
  const action = alarm?.wake === 'dalga' ? 'dalga' : 'breath'
  const skip = () => {
    const r = lastRing(alarm, new Date())
    if (r) addAlarmEvent('wakeSkip', { ring: r.toISOString() })
    ctx.go('home')
  }
  return <AlarmMorning action={action} onStart={() => ctx.go(action === 'breath' ? 'breath-1' : 'dalga')} onSkip={skip} />
}

export default {
  icon: AlarmClock,
  render: (ctx, route) => {
    if (route === 'alarm-sleep') return <AlarmSleep ctx={ctx} />
    if (route === 'alarm-morning') return <Morning ctx={ctx} />
    return <AlarmSetup onDone={() => ctx.go('home')} onBack={() => ctx.go('home')} />
  },
}
