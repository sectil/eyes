import { Compass } from 'lucide-react'
import Yon from '../../screens/Yon.jsx'
import { aynaRecords } from '../../lib/yon.js'

export default {
  icon: Compass,
  sub: (ctx) => {
    const last = aynaRecords(ctx.sessions ?? []).at(-1)
    return last ? `Ayna ${last.score.toFixed(1).replace('.', ',')} / 5 · 3 araç` : 'Kendini tanı, yönünü seç · 3 araç'
  },
  render: (ctx) => (
    <Yon
      sessions={ctx.sessions}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
    />
  ),
}
