import { CloudSun } from 'lucide-react'
import Gokyuzu from '../../screens/Gokyuzu.jsx'
import { isGokyuzu } from '../../lib/gokyuzu.js'

export default {
  icon: CloudSun,
  sub: (ctx) => {
    const last = (ctx.sessions ?? []).filter(isGokyuzu).at(-1)
    return last && Number.isFinite(last.delta) ? `Son mola ${last.before}→${last.after} · 2 dk` : 'Başını kaldır, uzağa bak · 2 dk'
  },
  render: (ctx) => (
    <Gokyuzu
      sessions={ctx.sessions}
      onSave={(s) => { ctx.store.addSession(s); ctx.refresh() }}
      onExit={() => ctx.go('home')}
    />
  ),
}
