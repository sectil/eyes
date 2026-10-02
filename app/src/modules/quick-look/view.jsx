import { Zap } from 'lucide-react'
import QuickLook from '../../screens/QuickLook.jsx'
import { firstAndBest } from '../../lib/quicklook.js'

// Yoldan mı açıldı (bildirim PLAN.v1 §A.2 "Birim yoldur": yolun içinde açılan modülde "Bana hatırlat" kartı çıkmaz).
// Yoldaki durak da 'quick-look' rotasını açtığı için ayrım rotadan değil App'in ctx.fromPath işaretinden (Home startStop).
export const inPathOf = (ctx) => Boolean(ctx?.fromPath)

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
      remindField={ctx.remindField?.('quick-look', { inPath: inPathOf(ctx) }) ?? null}
      onFinish={(s) => { ctx.store.addSession(s); ctx.refresh() }}
    />
  ),
}
