import { Focus } from 'lucide-react'
import SpanGame from '../../screens/SpanGame.jsx'
import { isSpan } from '../../lib/span.js'

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
    />
  ),
}
