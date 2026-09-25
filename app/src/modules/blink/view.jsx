import { Eye } from 'lucide-react'
import BlinkExercise from '../../screens/BlinkExercise.jsx'
import { isSameDay } from '../../lib/today.js'

export default {
  icon: Eye,
  sub: () => 'Ekran başında göz konforu · ~2,5 dk',
  badge: (ctx) => {
    const n = ctx.sessions.filter((s) => s.type === 'blink' && isSameDay(s)).length
    return n > 0 ? `Bugün ${n}/3` : null
  },
  render: (ctx) => (
    <BlinkExercise trueDepth={ctx.native.trueDepth} onBack={ctx.back} onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }} />
  ),
}
