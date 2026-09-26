import { Zap } from 'lucide-react'
import QuickLook from '../../screens/QuickLook.jsx'
import { firstAndBest } from '../../lib/quicklook.js'

export default {
  icon: Zap,
  sub: () => 'Ortayı ve kenarı aynı anda yakala · 5 dk',
  badge: (ctx) => {
    const fb = firstAndBest(ctx.sessions)
    return fb.n ? `${fb.last} ms` : null
  },
  render: (ctx) => (
    <QuickLook
      sessions={ctx.sessions}
      settings={ctx.settings}
      calibration={ctx.settings.calibration}
      trueDepth={ctx.native.trueDepth}
      onExit={() => ctx.go('home')}
      onFinish={(s) => { ctx.store.addSession(s); ctx.refresh() }}
    />
  ),
}
