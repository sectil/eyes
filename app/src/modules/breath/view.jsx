import { Wind } from 'lucide-react'
import Breath from '../../screens/Breath.jsx'
import { programProgress, loadBreathOpts, PATTERNS } from '../../lib/breath.js'

export default {
  icon: Wind,
  sub: (ctx) => {
    const p = programProgress(ctx.sessions)
    return p.days > 0 ? `${PATTERNS[loadBreathOpts().pattern].title} · program ${p.days}/${p.target} gün` : 'Yavaş nefes · 1, 3 ya da 5 dk'
  },
  badge: (ctx) => {
    const p = programProgress(ctx.sessions)
    return p.todayDone ? 'Bugün tamam' : null
  },
  render: (ctx) => (
    <Breath
      sessions={ctx.sessions}
      onBack={ctx.back}
      onFinish={(s) => { ctx.store.addSession(s); ctx.refresh(); ctx.go('home') }}
    />
  ),
}
