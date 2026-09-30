import { Focus } from 'lucide-react'
import SpanGame from '../../screens/SpanGame.jsx'
import { isSpan } from '../../lib/span.js'

// Yoldan mı açıldı (bildirim PLAN.v1 §A.2 "Birim yoldur": yolun içinde açılan modülde "Bana hatırlat" kartı çıkmaz).
// Yoldaki durak da 'tek-bakis' rotasını açtığı için ayrım rotadan değil App'in ctx.fromPath işaretinden (Home startStop).
export const inPathOf = (ctx) => Boolean(ctx?.fromPath)

export default {
  icon: Focus,
  sub: (ctx) => {
    const last = (ctx.sessions ?? []).filter(isSpan).at(-1)
    return last ? `Son tur ~${last.span} harf · 2 dk` : 'Gözünü kıpırdatmadan kaç harf tanırsın? · 2 dk'
  },
  badge: (ctx) => {
    const last = (ctx.sessions ?? []).filter(isSpan).at(-1)
    return last ? `~${last.span} harf` : null
  },
  render: (ctx) => (
    <SpanGame
      sessions={ctx.sessions}
      settings={ctx.settings}
      calibration={ctx.settings.calibration}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
      remindField={ctx.remindField?.('tek-bakis', { inPath: inPathOf(ctx) }) ?? null}
    />
  ),
}
